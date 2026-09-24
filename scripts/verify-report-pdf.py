"""Verify every expected browser screenshot survives Word/PDF conversion."""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageChops, ImageStat
from pypdf import PdfReader


FINGERPRINT_BITS = 256
MAX_ASPECT_RATIO_DIFFERENCE = 0.02
MAX_COARSE_RGB_DIFFERENCE = 12
MAX_MEAN_RGB_DIFFERENCE = 6
MAX_HIGH_DIFFERENCE_FRACTION = 0.03
MAX_TILE_RGB_DIFFERENCE = 24


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
    decoded = {}
    for page_number, page in enumerate(PdfReader(pdf_path).pages, 1):
        for image in page.images:
            digest = hashlib.sha256(image.data).hexdigest()
            if digest not in decoded:
                pixels = image.image.convert("RGB")
                decoded[digest] = (pixels, image_fingerprint(pixels))
            pixels, fingerprint = decoded[digest]
            images.append({"page": page_number, "name": image.name,
                           "sourceSha256": digest, "visualFingerprint": fingerprint,
                           "image": pixels})
    return images


def load_expected_images(expected, screenshots):
    """Use the original PNGs and reject missing or changed manifest sources."""
    folder = Path(screenshots).resolve(strict=True)
    for item in expected:
        name = item["file"]
        if not isinstance(name, str) or Path(name).name != name or "/" in name or "\\" in name:
            raise SystemExit(f"invalid evidence filename: {name}")
        source = (folder / name).resolve(strict=True)
        if source.parent != folder or hashlib.sha256(source.read_bytes()).hexdigest() != item["sourceSha256"]:
            raise SystemExit(f"evidence source changed since report generation: {name}")
        with Image.open(source) as image:
            item["image"] = image.convert("RGB")
    return expected


def pixel_difference(source, embedded):
    """Return conversion-tolerant error metrics, or None for a different image."""
    if abs(source.width / source.height - embedded.width / embedded.height) > MAX_ASPECT_RATIO_DIFFERENCE:
        return None
    size = (96, 60)
    coarse = ImageChops.difference(
        source.resize(size, Image.Resampling.LANCZOS),
        embedded.resize(size, Image.Resampling.LANCZOS),
    )
    if sum(ImageStat.Stat(coarse).mean) / 3 > MAX_COARSE_RGB_DIFFERENCE:
        return None
    difference = ImageChops.difference(
        source.resize(embedded.size, Image.Resampling.LANCZOS), embedded
    )
    mean = sum(ImageStat.Stat(difference).mean) / 3
    high_fraction = sum(difference.convert("L").histogram()[21:]) / (embedded.width * embedded.height)
    tiles = difference.resize((16, 10), Image.Resampling.BOX)
    max_tile = max(sum(rgb) / 3 for rgb in tiles.get_flattened_data())
    if (mean > MAX_MEAN_RGB_DIFFERENCE or high_fraction > MAX_HIGH_DIFFERENCE_FRACTION
            or max_tile > MAX_TILE_RGB_DIFFERENCE):
        return None
    return round(mean, 3), round(high_fraction, 5)


def match_expected_images(expected, observed):
    """Find a distinct PDF image for each source, even when similar pages repeat."""
    candidates = []
    comparison_cache = {}
    for item in expected:
        ranked = []
        for index, image in enumerate(observed):
            if image["sourceSha256"] == item["sourceSha256"]:
                method, metrics, rank = "source_sha256", (0, 0), 0
            else:
                key = (item["sourceSha256"], image["sourceSha256"])
                if key not in comparison_cache:
                    comparison_cache[key] = pixel_difference(item["image"], image["image"])
                metrics = comparison_cache[key]
                if metrics is None:
                    continue
                method, rank = "resized_rgb_pixels", 1
            ranked.append((rank, metrics[0], metrics[1], index, method))
        candidates.append(sorted(ranked))

    owners = {}
    assigned = {}

    def assign(item_index, seen):
        for _, mean, high_fraction, image_index, method in candidates[item_index]:
            if image_index in seen:
                continue
            seen.add(image_index)
            owner = owners.get(image_index)
            if owner is None or assign(owner, seen):
                owners[image_index] = item_index
                assigned[item_index] = (image_index, method, mean, high_fraction)
                return True
        return False

    for item_index in range(len(expected)):
        assign(item_index, set())

    matched, missing = [], []
    for item_index, item in enumerate(expected):
        if item_index not in assigned:
            missing.append(item["file"])
            continue
        image_index, method, mean, high_fraction = assigned[item_index]
        image = observed[image_index]
        matched.append({"file": item["file"], "page": image["page"], "pdfImage": image["name"],
                        "method": method, "meanRgbDifference": mean,
                        "highDifferenceFraction": high_fraction,
                        "fingerprintDistance": fingerprint_distance(item["visualFingerprint"], image["visualFingerprint"])})
    return matched, missing


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--pdf", required=True)
    parser.add_argument("--image-manifest", required=True)
    parser.add_argument("--screenshots", required=True)
    args = parser.parse_args()

    manifest = json.loads(Path(args.image_manifest).read_text(encoding="utf-8"))
    expected = manifest.get("expectedEvidence", [])
    if not expected or any(not isinstance(item, dict) or not item.get("file") or not item.get("sourceSha256") or not item.get("visualFingerprint") for item in expected):
        raise SystemExit("image manifest has no valid expected evidence identities")
    load_expected_images(expected, args.screenshots)
    observed = pdf_images(args.pdf)
    matched, missing = match_expected_images(expected, observed)
    audit = {"verificationMethod": "source_sha256_then_resized_rgb_pixels",
             "pixelMeanMax": MAX_MEAN_RGB_DIFFERENCE,
             "pixelHighDifferenceFractionMax": MAX_HIGH_DIFFERENCE_FRACTION,
             "pixelTileDifferenceMax": MAX_TILE_RGB_DIFFERENCE,
             "expected": [item["file"] for item in expected], "matched": matched,
             "missing": missing, "observedPdfImages": len(observed)}
    print(json.dumps(audit))
    if missing:
        raise SystemExit(f"converted PDF is missing browser evidence: {', '.join(missing)}")


if __name__ == "__main__":
    main()
