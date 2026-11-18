"""Reject a generated guide that lost its update, images, or PDF render."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import sys
from pathlib import Path
from zipfile import ZipFile

from docx import Document
from PIL import Image
from pypdf import PdfReader
from docx.oxml.ns import qn
from guide_figures import CAPTION, LOCAL, PREFIX, captions, figure_key


REPORT_VERIFIER_PATH = Path(__file__).with_name("verify-report-pdf.py")
sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("verify_report_pdf", REPORT_VERIFIER_PATH)
REPORT_VERIFIER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REPORT_VERIFIER)


def private_figure_pages(document, marker, update, pages):
    def visible(node):
        return "".join(text.text or "" for text in node.iter(qn("w:t")))

    receipt = next(paragraph._p for paragraph in document.paragraphs if paragraph.text == marker)
    current = receipt.getprevious()
    labels = []
    for expected_caption in reversed(update["screenshotCaptions"]):
        if current is None or current.tag != qn("w:tbl"):
            raise ValueError("Private update receipt is missing its screenshot table")
        label, = (visible(p) for p in captions(current))
        if label.split(". ", 1)[-1] != expected_caption.strip():
            raise ValueError("Private update has an unexpected figure caption")
        labels.append(" ".join(label.split()))
        current = current.getprevious()
    for sibling in receipt.itersiblings(preceding=True):
        wording = visible(sibling)
        if wording.startswith("[[GUIDE_SECTION_"):
            if wording != f"[[GUIDE_SECTION_BEGIN:{update['sectionId']}]]":
                raise ValueError("Private update is outside its selected section")
            break
    else:
        raise ValueError("Private update has no section marker")
    matching = []
    for label in reversed(labels):
        matches = {i for i, page in enumerate(pages, 1) if label in page}
        if len(matches) != 1:
            raise ValueError("Private update figure caption is missing or ambiguous in the PDF")
        matching.append(matches.pop())
    return matching


def verify(docx_path: Path, pdf_path: Path, update_path: Path, evidence_root: Path, *, private_marker=None) -> dict:
    update = json.loads(update_path.read_text(encoding="utf-8"))
    ticket = update["ticket"]
    expected_images = len(update["screenshots"])
    if expected_images < 1:
        raise ValueError("guide update has no expected screenshots")
    if not docx_path.is_file() or docx_path.stat().st_size == 0:
        raise ValueError("generated Word guide is missing or empty")
    if not pdf_path.is_file() or pdf_path.stat().st_size == 0:
        raise ValueError("rendered guide PDF is missing or empty")

    document = Document(docx_path)
    text = "\n".join("".join(node.text or "" for node in paragraph._p.iter(qn("w:t")))
                     for paragraph in document.paragraphs)
    marker = private_marker or f"[[AUTO_GUIDE_UPDATE:{ticket}]]"
    if text.count(marker) != 1:
        raise ValueError(f"guide must contain exactly one marker for {ticket}")
    if not private_marker and update.get("changeType") == "amend" and update["supersedesTicket"] != update["ticket"] and f"[[AUTO_GUIDE_UPDATE:{update['supersedesTicket']}]]" in text:
        raise ValueError("guide still contains the superseded section")
    if not private_marker and text.count("[[AUTO_GUIDE_CONTENT]]") != 1:
        raise ValueError("guide insertion marker is missing or duplicated")
    def contains(approved, visible):
        pattern = r"Figure [1-9]\d*".join(re.escape(part) for part in LOCAL.split(approved)[::2])
        return bool(re.search(pattern, visible))

    if (not private_marker and update["title"] not in text) or any(not contains(step, text) for step in update["steps"]):
        raise ValueError("guide omitted the approved title or a step")
    notes = update.get('notes', [])
    if not isinstance(notes, list) or any(not isinstance(note, str) or not note.strip() for note in notes):
        raise ValueError('guide notes must be an array of non-empty strings')
    if any(not contains(note, text) for note in notes):
        raise ValueError('guide omitted an approved supporting note')
    figure_numbers = {}
    for number, paragraph in enumerate(captions(document._element.body), 1):
        label = "".join(node.text or "" for node in paragraph.iter(qn("w:t")))
        key = figure_key(paragraph)
        if key and (key in figure_numbers or int(CAPTION.match(label)[1]) != number):
            raise ValueError("guide figure numbering or bookmark is inconsistent")
        if key:
            figure_numbers[key] = number
    for link in document._element.iter(qn("w:hyperlink")):
        key = link.get(qn("w:anchor"), "")
        if key.startswith(PREFIX):
            label = "".join(node.text or "" for node in link.iter(qn("w:t")))
            if key not in figure_numbers or label != f"Figure {figure_numbers[key]}":
                raise ValueError(f"guide has an invalid figure reference: {key}")
    if len(document.inline_shapes) < expected_images:
        raise ValueError("guide omitted one or more embedded screenshots")

    expected = []
    for relative in update["screenshots"]:
        source = (evidence_root / ticket / relative).resolve(strict=True)
        allowed = (evidence_root / ticket).resolve()
        if allowed not in source.parents or not source.is_file():
            raise ValueError(f"unsafe or missing screenshot: {relative}")
        with Image.open(source) as image:
            pixels = image.convert("RGB")
        expected.append({"file": relative, "sourceSha256": hashlib.sha256(source.read_bytes()).hexdigest(),
                         "visualFingerprint": REPORT_VERIFIER.image_fingerprint(pixels), "image": pixels})
    with ZipFile(docx_path) as package:
        embedded = [name for name in package.namelist() if name.startswith("word/media/")]
        embedded_hashes = {hashlib.sha256(package.read(name)).hexdigest() for name in embedded}
    missing_docx = [item["file"] for item in expected if item["sourceSha256"] not in embedded_hashes]
    if missing_docx:
        raise ValueError(f"guide Word file omitted screenshots: {', '.join(missing_docx)}")

    pdf = PdfReader(pdf_path)
    if not pdf.pages:
        raise ValueError("rendered guide PDF has no pages")
    pages = [" ".join((page.extract_text() or "").split()) for page in pdf.pages]
    pdf_text = " ".join(pages)
    if not private_marker and update["title"] not in pdf_text:
        raise ValueError("rendered guide PDF omitted the approved title")
    if any(not contains(' '.join(note.split()), pdf_text) for note in notes):
        raise ValueError('rendered guide PDF omitted an approved supporting note')
    if private_marker:
        figure_pages = private_figure_pages(document, marker, update, pages)
        for item, page in zip(expected, figure_pages, strict=True):
            item["captionPage"] = page
        observed = REPORT_VERIFIER.pdf_images(pdf_path, set(figure_pages))
    else:
        observed = REPORT_VERIFIER.pdf_images(pdf_path)
    matched, missing_pdf = REPORT_VERIFIER.match_expected_images(expected, observed)
    if missing_pdf:
        raise ValueError(f"rendered guide PDF omitted screenshots: {', '.join(missing_pdf)}")
    return {"ticket": ticket, "pages": len(pdf.pages), "embeddedScreenshots": len(embedded),
            "expected": [item["file"] for item in expected], "matched": matched,
            "observedPdfImages": len(observed)}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--docx", required=True, type=Path)
    parser.add_argument("--pdf", required=True, type=Path)
    parser.add_argument("--update", required=True, type=Path)
    parser.add_argument("--evidence-root", required=True, type=Path)
    parser.add_argument("--private-marker")
    args = parser.parse_args()
    print(json.dumps(verify(args.docx, args.pdf, args.update, args.evidence_root, private_marker=args.private_marker)))


if __name__ == "__main__":
    main()
