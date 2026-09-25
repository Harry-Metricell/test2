"""Reject a generated guide that lost its update, images, or PDF render."""

from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from zipfile import ZipFile

from docx import Document
from PIL import Image
from pypdf import PdfReader


REPORT_VERIFIER_PATH = Path(__file__).with_name("verify-report-pdf.py")
sys.dont_write_bytecode = True
SPEC = importlib.util.spec_from_file_location("verify_report_pdf", REPORT_VERIFIER_PATH)
REPORT_VERIFIER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REPORT_VERIFIER)


def verify(docx_path: Path, pdf_path: Path, update_path: Path, evidence_root: Path) -> dict:
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
    text = "\n".join(paragraph.text for paragraph in document.paragraphs)
    if text.count(f"[[AUTO_GUIDE_UPDATE:{ticket}]]") != 1:
        raise ValueError(f"guide must contain exactly one marker for {ticket}")
    if text.count("[[AUTO_GUIDE_CONTENT]]") != 1:
        raise ValueError("guide insertion marker is missing or duplicated")
    if update["title"] not in text or any(step not in text for step in update["steps"]):
        raise ValueError("guide omitted the approved title or a step")
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
    pdf_text = " ".join(" ".join((page.extract_text() or "").split()) for page in pdf.pages)
    if update["title"] not in pdf_text:
        raise ValueError("rendered guide PDF omitted the approved title")
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
    args = parser.parse_args()
    print(json.dumps(verify(args.docx, args.pdf, args.update, args.evidence_root)))


if __name__ == "__main__":
    main()
