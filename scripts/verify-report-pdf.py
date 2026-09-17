"""Fail if Word/PDF conversion removed all browser-evidence images."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image
from pypdf import PdfReader


FINGERPRINT_BITS = 256
MAX_FINGERPRINT_DISTANCE = 8


def image_fingerprint(image):
    """Return a resize/recompression-tolerant 16x16 difference hash."""
    grayscale = image.convert("L").resize((17, 16), Image.Resampling.LANCZOS)
    pixels = list(grayscale.get_flattened_data())
    bits = "".join(
        "1" if pixels[row * 17 + column] > pixels[row * 17 + column + 1] else "0"
        for row in range(16)
        for column in range(16)
    )
    return f"{int(bits, 2):0{FINGERPRINT_BITS // 4}x}"


def fingerprint_distance(left, right):
    return (int(left, 16) ^ int(right, 16)).bit_count()


def pdf_images(pdf_path):
    images = []
    for page_number, page in enumerate(PdfReader(pdf_path).pages, 1):
        for image in page.images:
            images.append({"page": page_number, "name": image.name,
                           "sourceSha256": hashlib.sha256(image.data).hexdigest(),
                           "visualFingerprint": image_fingerprint(image.image)})
    return images


def match_expected_images(expected, observed):
    """Match each expected image once, preferring exact bytes then visual identity."""
    unused = set(range(len(observed)))
    matched, missing = [], []
    for item in expected:
        exact = [index for index in unused if observed[index]["sourceSha256"] == item["sourceSha256"]]
        if exact:
            index, method, distance = exact[0], "source_sha256", 0
        else:
            candidates = [(fingerprint_distance(item["visualFingerprint"], observed[index]["visualFingerprint"]), index) for index in unused]
            candidates = [candidate for candidate in candidates if candidate[0] <= MAX_FINGERPRINT_DISTANCE]
            if not candidates:
                missing.append(item["file"])
                continue
            distance, index = min(candidates)
            method = "dhash_16x16"
        unused.remove(index)
        matched.append({"file": item["file"], "page": observed[index]["page"], "pdfImage": observed[index]["name"], "method": method, "fingerprintDistance": distance})
    return matched, missing


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--image-manifest", required=True)
    args = parser.parse_args()

    manifest = json.loads(Path(args.image_manifest).read_text(encoding="utf-8"))
    expected = manifest.get("expectedEvidence", [])
    if not expected or any(not isinstance(item, dict) or not item.get("file") or not item.get("sourceSha256") or not item.get("visualFingerprint") for item in expected):
        raise SystemExit("image manifest has no valid expected evidence identities")
    observed = pdf_images(args.pdf)
    matched, missing = match_expected_images(expected, observed)
    audit = {"verificationMethod": "source_sha256_then_dhash_16x16", "fingerprintMaxDistance": MAX_FINGERPRINT_DISTANCE, "expected": [item["file"] for item in expected], "matched": matched, "missing": missing, "observedPdfImages": len(observed)}
    print(json.dumps(audit))
    if missing:
        raise SystemExit(f"converted PDF is missing browser evidence: {', '.join(missing)}")


if __name__ == "__main__":
    main()
