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
from docx.oxml.ns import qn
from docx.text.paragraph import Paragraph
from lxml import etree

from guide_consistency import scan, validate
from guide_figures import GuideFigures, _text, captions, figure_key

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
    for paragraph in paragraphs:
        figures.bind_local(paragraph, keys)
        anchor.addprevious(paragraph)
    for i, relative in enumerate(update["screenshots"]):
        image = builder.screenshot_path(evidence, ticket, relative)
        table = builder.yellow_screenshot(document, image, f"Figure {i + 1}. {builder.screenshot_caption(update, i)}")
        figures.bookmark(table.cell(0, 0).paragraphs[-1]._p, keys[i])
        anchor.addprevious(table._tbl)
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
