"""Pure in-memory regression tests for PDF evidence identity matching."""
import importlib.util
from pathlib import Path
import sys
import unittest

from PIL import Image, ImageDraw

sys.dont_write_bytecode = True
MODULE = Path(__file__).with_name("verify-report-pdf.py")
SPEC = importlib.util.spec_from_file_location("verify_report_pdf", MODULE)
VERIFY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFY)


def patterned_image(colour, inverse=False):
    image = Image.new("RGB", (1440, 900), colour)
    draw = ImageDraw.Draw(image)
    for index in range(8):
        offset = index * 150
        draw.rectangle((offset, 80, offset + 70, 820), fill=(255, 255, 255) if inverse else (0, 0, 0))
    return image


def expected(name, image, source_hash):
    return {"file": name, "sourceSha256": source_hash, "visualFingerprint": VERIFY.image_fingerprint(image)}


def observed(name, image, source_hash):
    return {"page": 1, "name": name, "sourceSha256": source_hash, "visualFingerprint": VERIFY.image_fingerprint(image)}


class PdfEvidenceIdentityTests(unittest.TestCase):
    def test_matches_expected_evidence_by_exact_source_hash(self):
        image = patterned_image((20, 40, 60))
        matched, missing = VERIFY.match_expected_images([expected("criterion-1.png", image, "source-a")], [observed("Image1.png", image, "source-a")])
        self.assertEqual(missing, [])
        self.assertEqual(matched[0]["method"], "source_sha256")

    def test_rejects_no_evidence_image(self):
        image = patterned_image((20, 40, 60))
        _, missing = VERIFY.match_expected_images([expected("criterion-1.png", image, "source-a")], [])
        self.assertEqual(missing, ["criterion-1.png"])

    def test_rejects_unrelated_same_sized_image(self):
        expected_image = patterned_image((20, 40, 60))
        unrelated = patterned_image((200, 180, 160), inverse=True)
        _, missing = VERIFY.match_expected_images([expected("criterion-1.png", expected_image, "source-a")], [observed("Image1.png", unrelated, "other")])
        self.assertEqual(missing, ["criterion-1.png"])

    def test_requires_every_expected_image(self):
        first = patterned_image((20, 40, 60))
        second = patterned_image((200, 180, 160), inverse=True)
        _, missing = VERIFY.match_expected_images([expected("criterion-1.png", first, "source-a"), expected("criterion-2.png", second, "source-b")], [observed("Image1.png", first, "source-a")])
        self.assertEqual(missing, ["criterion-2.png"])

    def test_accepts_resized_evidence_using_visual_fingerprint(self):
        image = patterned_image((20, 40, 60))
        resized = image.resize((720, 450), Image.Resampling.LANCZOS)
        matched, missing = VERIFY.match_expected_images([expected("criterion-1.png", image, "source-a")], [observed("Image1.png", resized, "converted")])
        self.assertEqual(missing, [])
        self.assertEqual(matched[0]["method"], "dhash_16x16")

    def test_accepts_word_pdf_recompressed_screenshot(self):
        # Reproduce the source -> PDF image conversion seen in production:
        # a browser screenshot with a mostly uniform background and small UI.
        image = Image.new("RGB", (1280, 800), (239, 243, 251))
        draw = ImageDraw.Draw(image)
        draw.rounded_rectangle((260, 0, 1020, 165), radius=12, fill=(255, 255, 255))
        draw.rectangle((285, 105, 995, 150), fill=(210, 20, 35))
        import io
        buffer = io.BytesIO()
        image.resize((477, 298), Image.Resampling.LANCZOS).save(buffer, format="JPEG", quality=85)
        converted_image = Image.open(io.BytesIO(buffer.getvalue()))
        self.assertLessEqual(
            VERIFY.fingerprint_distance(VERIFY.image_fingerprint(image), VERIFY.image_fingerprint(converted_image)),
            VERIFY.MAX_FINGERPRINT_DISTANCE,
        )
        matched, missing = VERIFY.match_expected_images(
            [expected("criterion-1-final.png", image, "source-a")],
            [observed("Image72.jpg", converted_image, "converted")],
        )
        self.assertEqual(missing, [])
        self.assertEqual(matched[0]["method"], "dhash_16x16")


if __name__ == "__main__":
    unittest.main()
