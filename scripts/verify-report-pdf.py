"""Fail if Word/PDF conversion removed all browser-evidence images."""
import argparse
import json
from pathlib import Path

from pypdf import PdfReader


def pdf_evidence_image_count(pdf_path, expected_sizes):
    return sum(
        1
        for page in PdfReader(pdf_path).pages
        for image in page.images
        if image.image.size in expected_sizes
    )


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--image-manifest", required=True)
    args = parser.parse_args()

    manifest = json.loads(Path(args.image_manifest).read_text(encoding="utf-8"))
    expected_sizes = {tuple(value) for value in manifest.get("embeddedImageSizes", [])}
    if not expected_sizes:
        raise SystemExit("image manifest has no embedded evidence sizes")

    matching_images = pdf_evidence_image_count(args.pdf, expected_sizes)
    if matching_images < 1:
        raise SystemExit("converted PDF contains no browser-evidence image")
    print(json.dumps({"pdfEvidenceImages": matching_images}))


if __name__ == "__main__":
    main()
