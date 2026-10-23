import importlib.util
import io
from pathlib import Path
import tempfile
import unittest
import xml.etree.ElementTree as ET
import zipfile
from PIL import Image

spec = importlib.util.spec_from_file_location('editable', Path(__file__).with_name('prepare-editable-report.py'))
EDITABLE = importlib.util.module_from_spec(spec)
spec.loader.exec_module(EDITABLE)


class EditableReportTests(unittest.TestCase):
    def fixture(self, directory):
        source = Path(directory) / 'source.docx'
        png = io.BytesIO()
        Image.new('RGB', (128, 128), 'blue').save(png, format='PNG', compress_level=0)
        with zipfile.ZipFile(source, 'w') as z:
            z.writestr('word/document.xml', '<document>All criteria and formatting unchanged</document>')
            z.writestr('word/media/a.png', png.getvalue())
            z.writestr('word/media/b.png', png.getvalue())
            z.writestr('word/_rels/document.xml.rels', '<Relationships xmlns="'+EDITABLE.REL+'"><Relationship Id="r1" Target="media/a.png"/><Relationship Id="r2" Target="media/b.png"/><Relationship Id="external" Target="media/b.png" TargetMode="External"/></Relationships>')
            z.writestr('[Content_Types].xml', '<Types><Override PartName="/word/media/b.png"/></Types>')
        return source, Path(directory) / 'published.docx'

    def test_small_file_is_byte_identical(self):
        with tempfile.TemporaryDirectory() as d:
            source, destination = self.fixture(d)
            audit = EDITABLE.prepare(source, destination)
            self.assertEqual(source.read_bytes(), destination.read_bytes())
            self.assertEqual(audit['optimizedPngs'], 0)

    def test_large_file_preserves_text_pixels_and_external_links(self):
        with tempfile.TemporaryDirectory() as d:
            source, destination = self.fixture(d)
            original = source.read_bytes()
            audit = EDITABLE.prepare(source, destination, limit=5000)
            self.assertEqual(source.read_bytes(), original)
            self.assertLess(audit['publishedBytes'], 5000)
            self.assertEqual(audit['duplicateImages'], 1)
            with zipfile.ZipFile(source) as a, zipfile.ZipFile(destination) as b:
                self.assertEqual(a.read('word/document.xml'), b.read('word/document.xml'))
                self.assertNotIn('word/media/b.png', b.namelist())
                before = Image.open(io.BytesIO(a.read('word/media/a.png')))
                after = Image.open(io.BytesIO(b.read('word/media/a.png')))
                self.assertEqual(before.size, after.size)
                self.assertEqual(before.tobytes(), after.tobytes())
                targets = {node.get('Id'): node.get('Target') for node in ET.fromstring(b.read('word/_rels/document.xml.rels'))}
                self.assertEqual(targets, {'r1': 'media/a.png', 'r2': 'media/a.png', 'external': 'media/b.png'})
                self.assertEqual(len(ET.fromstring(b.read('[Content_Types].xml'))), 0)

    def test_failure_preserves_previous_output(self):
        with tempfile.TemporaryDirectory() as d:
            source, destination = self.fixture(d)
            destination.write_bytes(b'Previous published report')
            audit = EDITABLE.prepare(source, destination, limit=1)
            self.assertFalse(audit['available'])
            self.assertEqual(audit['reason'], 'size_limit')
            self.assertEqual(destination.read_bytes(), b'Previous published report')

    def test_cannot_overwrite_original(self):
        with tempfile.TemporaryDirectory() as d:
            source, _ = self.fixture(d)
            with self.assertRaisesRegex(ValueError, 'different path'):
                EDITABLE.prepare(source, source)


if __name__ == '__main__':
    unittest.main()
