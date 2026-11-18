"""Read and update the private indexed Word guide on the publisher PC."""

import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import sys

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_COLOR_INDEX
from docx.oxml.ns import qn
from docx.shared import Inches, Pt
from docx.text.paragraph import Paragraph
from lxml import etree
from PIL import Image

from guide_consistency import scan, validate
from guide_figures import GuideFigures, LOCAL, _text, captions, figure_key

MARKER = re.compile(r"\[\[GUIDE_SECTION_(BEGIN|END):([a-z0-9][a-z0-9.-]+)\]\]")
BUILDER = Path(__file__).with_name("build-user-guide.py")


def default_path():
    if not os.environ.get("LOCALAPPDATA"):
        raise ValueError("LOCALAPPDATA is required for the private guide")
    return Path(os.environ["LOCALAPPDATA"]) / "TEST2/private-guide/Metricell Platform User Guide.docx"


def sections(document):
    index = {}
    stack = []
    for node in document._element.body:
        match = MARKER.fullmatch(_text(node).strip())
        if match:
            kind, key = match.groups()
            if node.tag != qn("w:p") or next(node.iter(qn("w:vanish")), None) is None:
                raise ValueError(f"Invalid section marker {key}")
            if kind == "BEGIN":
                if key in index:
                    raise ValueError(f"Duplicate section ID {key}")
                if stack:
                    index[stack[-1]]["children"].append(key)
                index[key] = {"blocks": [], "children": []}
                stack.append(key)
            else:
                if not stack or stack.pop() != key:
                    raise ValueError(f"Unbalanced section marker {key}")
                index[key]["end"] = node
        elif stack:
            index[stack[-1]]["blocks"].append(node)
    if stack or not index:
        raise ValueError("Missing or unclosed private guide sections")
    return index


def section_view(document, key, section, include_text=False):
    paragraphs = [_text(node).strip() for node in section["blocks"]]
    heading = next((Paragraph(node, document._body) for node in section["blocks"]
                    if node.tag == qn("w:p") and _text(node).strip()
                    and Paragraph(node, document._body).style.name.lower().startswith(("heading", "guide heading"))), None)
    result = {
        "sectionId": key,
        "heading": heading.text if heading is not None else "",
        "editable": not section["children"] and heading is not None,
    }
    if include_text:
        payload = b"".join(etree.tostring(node, method="c14n") for node in section["blocks"])
        result["sectionSha256"] = hashlib.sha256(payload).hexdigest()
        result["paragraphs"] = [text for text in paragraphs if text and not text.startswith("[[")]
        result["figures"] = [_text(caption) for node in section["blocks"] for caption in captions(node)]
    return result


def append_figure(document, anchor, image, label):
    """Keep each original screenshot and its caption as one pagination group."""
    picture = document.add_paragraph()
    picture.alignment = WD_ALIGN_PARAGRAPH.CENTER
    picture.paragraph_format.keep_with_next = True
    picture.paragraph_format.keep_together = True
    picture.paragraph_format.space_before = Pt(6)
    picture.paragraph_format.space_after = Pt(3)
    section = document.sections[-1]
    available = (section.page_width - section.left_margin - section.right_margin) / 914400
    with Image.open(image) as pixels:
        width = min(6.1, available, 4.2 * pixels.width / pixels.height, pixels.width / 96)
    picture.add_run().add_picture(str(image), width=Inches(width))
    caption = document.add_paragraph()
    caption.paragraph_format.keep_together = True
    caption.paragraph_format.keep_with_next = False
    caption.paragraph_format.space_after = Pt(8)
    run = caption.add_run(label)
    run.font.size = Pt(9)
    run.bold = True
    run.font.highlight_color = WD_COLOR_INDEX.YELLOW
    anchor.addprevious(picture._p)
    anchor.addprevious(caption._p)
    return caption._p


def apply(source, output, update, evidence):
    if source.resolve() == output.resolve():
        raise ValueError("Build into a separate private candidate before promotion")
    spec = importlib.util.spec_from_file_location("user_guide_builder", BUILDER)
    builder = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(builder)
    ticket = update["ticket"]
    if not builder.KEY.fullmatch(ticket):
        raise ValueError("Invalid ticket")
    key = update["sectionId"]
    revision = update["sectionSha256"]
    if not re.fullmatch(r"[a-f0-9]{64}", revision):
        raise ValueError("The selected section needs its exact sectionSha256")
    # The public builder's amend contract requires a former ticket. Private
    # amendments instead bind to the current baseline section and its hash.
    if update.get("supersedesTicket") is not None:
        raise ValueError("Private guide updates use sectionId instead of supersedesTicket")
    builder.validate_update(update, ticket, private=True)

    document = Document(source)
    index = sections(document)
    if key not in index:
        raise ValueError(f"Unknown private guide section {key}")
    section = index[key]
    view = section_view(document, key, section, True)
    if not view["editable"]:
        raise ValueError(f"Choose an editable leaf section instead of {key}")
    digest = hashlib.sha256(json.dumps(update, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
    receipt = f"[[PRIVATE_GUIDE_UPDATE:{digest}]]"
    if any(_text(node) == receipt for node in section["blocks"]):
        document.save(output)
        return {"marker": receipt, "applied": False}
    if revision != view["sectionSha256"]:
        raise ValueError(f"Private guide section {key} changed. Read that section again before applying an update.")

    original = scan(document)
    figures = GuideFigures(document)
    figures.bind_existing()
    old_figures = [caption for node in section["blocks"] for caption in captions(node)]
    amending = update["changeType"] == "amend"
    keys = figures.new_keys(ticket, len(update["screenshots"]),
                            [figure_key(caption) for caption in old_figures] if amending else [],
                            update.get("preserveFigureSlots"))
    anchor = section["end"]
    if amending:
        # Preserve headings, contents targets and previous private receipts.
        for node in section["blocks"]:
            if node.tag == qn("w:p") and (
                _text(node).startswith("[[PRIVATE_GUIDE_UPDATE:")
                or Paragraph(node, document._body).style.name.lower().startswith(("heading", "guide heading"))
            ):
                continue
            if any(not start.get(qn("w:name"), "").startswith("guide_fig_")
                   for start in node.iter(qn("w:bookmarkStart"))):
                raise ValueError(f"Section {key} has a non-figure bookmark in its body")
            node.getparent().remove(node)
    paragraphs = builder.yellow_steps(update["steps"]) + builder.yellow_notes(document, update.get("notes", []))
    if paragraphs and "[[FIGURE:1]]" in _text(paragraphs[-1]):
        # Keep a short callout immediately before the corresponding picture.
        if len(_text(paragraphs[-1])) <= 240 and len(LOCAL.findall(_text(paragraphs[-1]))) == 1:
            Paragraph(paragraphs[-1], document._body).paragraph_format.keep_with_next = True
    for paragraph in paragraphs:
        figures.bind_local(paragraph, keys)
        anchor.addprevious(paragraph)
    for i, relative in enumerate(update["screenshots"]):
        image = builder.screenshot_path(evidence, ticket, relative)
        caption = append_figure(document, anchor, image, f"Figure {i + 1}. {builder.screenshot_caption(update, i)}")
        figures.bookmark(caption, keys[i])
    anchor.addprevious(builder.yellow_paragraph(receipt, hidden=True)._p)
    count = figures.refresh()
    builder.enable_page_reference_refresh(document)
    builder.prune_unused_images(document)
    validate(document, original)
    document.save(output)
    return {"marker": receipt, "applied": True, "figures": count, "sectionId": key}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--guide", type=Path)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("list")
    read = commands.add_parser("section")
    read.add_argument("section_id")
    build = commands.add_parser("apply")
    build.add_argument("--update", required=True, type=Path)
    build.add_argument("--output", required=True, type=Path)
    build.add_argument("--evidence-root", required=True, type=Path)
    args = parser.parse_args()
    source = args.guide or default_path()
    if args.command == "apply":
        payload = json.loads(args.update.read_text(encoding="utf-8"))
        return apply(source, args.output, payload, args.evidence_root)
    document = Document(source)
    index = sections(document)
    if args.command == "list":
        return [section_view(document, key, section) for key, section in index.items()]
    return section_view(document, args.section_id, index[args.section_id], True)


if __name__ == "__main__":
    try:
        print(json.dumps(main()))
    except (KeyError, ValueError) as error:
        sys.exit(f"Private guide: {error}")
