"""Fit editable reports to GitHub's 100 MiB blob limit without losing pixels.

Only oversized copies are repacked. Original private DOCX files, document XML,
image dimensions, text and captured pixels are never changed or downsampled.
"""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import posixpath
import shutil
import tempfile
import xml.etree.ElementTree as ET
import zipfile
from PIL import Image

LIMIT = 100 * 1024 * 1024
REL = 'http://schemas.openxmlformats.org/package/2006/relationships'


def prepare(source, destination, limit=LIMIT):
    source, destination = Path(source), Path(destination)
    if source.resolve() == destination.resolve():
        raise ValueError('Keep the original DOCX; output must be a different path')
    before = source.stat().st_size
    if before <= limit:
        shutil.copyfile(source, destination)
        return {'available': True, 'originalBytes': before, 'publishedBytes': before, 'optimizedPngs': 0, 'duplicateImages': 0}
    optimized, duplicates, images, seen = 0, {}, {}, {}
    with zipfile.ZipFile(source) as original:
        for entry in original.infolist():
            if not entry.filename.startswith('word/media/'):
                continue
            data = original.read(entry)
            digest = hashlib.sha256(data).hexdigest()
            if digest in seen:
                duplicates[entry.filename] = seen[digest]
                continue
            seen[digest] = entry.filename
            if entry.filename.lower().endswith('.png'):
                with Image.open(io.BytesIO(data)) as image:
                    # Preserve colour profiles, gamma, DPI and other metadata
                    # exactly by leaving those PNG parts untouched.
                    if not image.info:
                        output = io.BytesIO()
                        image.save(output, format='PNG', optimize=True, compress_level=9)
                        candidate = output.getvalue()
                        if len(candidate) < len(data):
                            with Image.open(io.BytesIO(candidate)) as checked:
                                if checked.mode != image.mode or checked.size != image.size or checked.tobytes() != image.tobytes():
                                    raise ValueError('PNG optimization changed captured pixels')
                            data = candidate
                            optimized += 1
            images[entry.filename] = data
        descriptor, temporary = tempfile.mkstemp(suffix='.docx', dir=destination.parent)
        os.close(descriptor)
        try:
            with zipfile.ZipFile(temporary, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as result:
                for entry in original.infolist():
                    name = entry.filename
                    if name in duplicates:
                        continue
                    data = images.get(name) if name in images else original.read(entry)
                    if name.endswith('.rels'):
                        root = ET.fromstring(data)
                        changed = False
                        base = posixpath.dirname(posixpath.dirname(name))
                        for relation in root:
                            if relation.get('TargetMode') == 'External':
                                continue
                            target = relation.get('Target', '')
                            resolved = posixpath.normpath(posixpath.join(base, target)) if not target.startswith('/') else target.lstrip('/')
                            if resolved in duplicates:
                                relation.set('Target', posixpath.relpath(duplicates[resolved], base or '.'))
                                changed = True
                        if changed:
                            ET.register_namespace('', REL)
                            data = ET.tostring(root, encoding='utf-8', xml_declaration=True)
                    elif name == '[Content_Types].xml':
                        root = ET.fromstring(data)
                        removed = [node for node in root if node.get('PartName', '').lstrip('/') in duplicates]
                        for node in removed:
                            root.remove(node)
                        if removed:
                            data = ET.tostring(root, encoding='utf-8', xml_declaration=True)
                    result.writestr(entry, data, compresslevel=9)
            after = Path(temporary).stat().st_size
            if after > limit:
                return {'available': False, 'reason': 'size_limit', 'originalBytes': before,
                        'preparedBytes': after, 'limitBytes': limit, 'optimizedPngs': optimized,
                        'duplicateImages': len(duplicates)}
            os.replace(temporary, destination)
        finally:
            if Path(temporary).exists():
                Path(temporary).unlink()
    return {'available': True, 'originalBytes': before, 'publishedBytes': after, 'optimizedPngs': optimized, 'duplicateImages': len(duplicates)}


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    print(json.dumps(prepare(args.input, args.output)))
