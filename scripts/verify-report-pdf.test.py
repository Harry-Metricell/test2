"""Pure in-memory regression tests for PDF evidence identity matching."""
import importlib.util
from pathlib import Path
import sys
import io
import random
import unittest
from unittest.mock import patch

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
    return {"file": name, "sourceSha256": source_hash,
            "visualFingerprint": VERIFY.image_fingerprint(image), "image": image}


def observed(name, image, source_hash):
    return {"page": 1, "name": name, "sourceSha256": source_hash,
            "visualFingerprint": VERIFY.image_fingerprint(image), "image": image}


class PdfEvidenceIdentityTests(unittest.TestCase):
    def test_dense_saturated_markers_survive_word_chroma_subsampling(self):
        screenshot = Image.new("RGB", (1440, 900), (144, 110, 178))
        draw = ImageDraw.Draw(screenshot)
        draw.rectangle((0, 0, 340, 900), fill=(240, 243, 250))
        draw.rectangle((0, 0, 1440, 70), fill=(240, 243, 250))
        rng = random.Random(78)
        colours = [(244, 25, 24), (195, 248, 0), (0, 160, 255), (255, 233, 0)]
        for _ in range(10000):
            x, y = rng.randrange(350, 1440), rng.randrange(80, 900)
            radius = rng.choice([1, 2, 3])
            draw.ellipse((x, y, x + radius*2, y + radius*2), fill=rng.choice(colours))
        buffer = io.BytesIO()
        screenshot.resize((719, 449), Image.Resampling.BICUBIC).save(buffer, format="JPEG", quality=85, subsampling=2)
        converted = Image.open(io.BytesIO(buffer.getvalue())).convert("RGB")
        matched, missing = VERIFY.match_expected_images(
            [expected("dense-markers.png", screenshot, "source")],
            [observed("dense-markers.jpg", converted, "converted")])
        self.assertEqual(missing, [])
        self.assertEqual(matched[0]["method"], "normalized_rgb_pixels")

    def test_dense_map_conversion_does_not_hide_a_changed_ui_control(self):
        screenshot = patterned_image((144, 110, 178))
        changed = screenshot.copy()
        ImageDraw.Draw(changed).rectangle((620, 320, 670, 370), fill=(240, 243, 250))
        buffer = io.BytesIO()
        changed.resize((719, 449), Image.Resampling.BICUBIC).save(buffer, format="JPEG", quality=85, subsampling=2)
        converted = Image.open(io.BytesIO(buffer.getvalue())).convert("RGB")
        _, missing = VERIFY.match_expected_images(
            [expected("control.png", screenshot, "source")],
            [observed("control.jpg", converted, "changed")])
        self.assertEqual(missing, ["control.png"])

    def test_dense_map_survives_word_downsampling_and_jpeg_compression(self):
        screenshot = Image.new("RGB", (1440, 900), (156, 221, 246))
        draw = ImageDraw.Draw(screenshot)
        rng = random.Random(61)
        for _ in range(18000):
            x, y = rng.randrange(1440), rng.randrange(900)
            draw.ellipse((x, y, x + 3, y + 3), fill=rng.choice([(160, 80, 170), (80, 160, 90), (250, 220, 50)]))
        buffer = io.BytesIO()
        screenshot.resize((719, 449), Image.Resampling.BICUBIC).save(buffer, format="JPEG", quality=85, subsampling=0)
        converted = Image.open(io.BytesIO(buffer.getvalue())).convert("RGB")
        _, missing = VERIFY.match_expected_images(
            [expected("map.png", screenshot, "source")],
            [observed("map.jpg", converted, "converted")],
        )
        self.assertEqual(missing, [])

    def test_normalization_still_rejects_a_local_control_state_change(self):
        screenshot = Image.new("RGB", (1440, 900), (240, 243, 250))
        changed = screenshot.copy()
        ImageDraw.Draw(changed).rectangle((620, 320, 670, 370), fill=(20, 40, 80))
        converted = changed.resize((719, 449), Image.Resampling.BICUBIC)
        _, missing = VERIFY.match_expected_images(
            [expected("control.png", screenshot, "source")],
            [observed("control.jpg", converted, "changed")],
        )
        self.assertEqual(missing, ["control.png"])

    def test_only_explicit_wholly_blocked_report_can_have_no_images(self):
        manifest = {"noEvidenceBlock": {"reviewOutcomes": ["Blocked"], "testerOutcomes": ["Blocked"], "reasons": ["Browser tools unavailable."]},
                    "reportContent": {"overallOutcome": "Blocked", "limitations": "No browser evidence was captured; testing could not be completed."}}
        VERIFY.validate_no_evidence_block(manifest)
        with self.assertRaises(SystemExit):
            VERIFY.validate_no_evidence_block({})
        with self.assertRaises(SystemExit):
            VERIFY.validate_no_evidence_block({**manifest, "noEvidenceBlock": {**manifest["noEvidenceBlock"], "testerOutcomes": ["Passed"]}})

    def test_report_content_requires_outcome_limitations_url_and_caption(self):
        class Page:
            def extract_text(self):
                return "Overall review outcome:\nBlocked\nLimitations during Testing:\n1 blocked.\nBrowser URL(s) recorded after criteria: https://example.test/gis\nE01 - evidence.png"
        contract = {"overallOutcome": "Blocked", "limitations": "1 blocked.",
                    "sourceUrls": ["https://example.test/gis"], "evidenceCaptions": ["E01 - evidence.png"]}
        with patch.object(VERIFY, "PdfReader", return_value=type("Reader", (), {"pages": [Page()]})()):
            self.assertTrue(VERIFY.verify_report_content("ignored.pdf", contract))
            with self.assertRaisesRegex(SystemExit, "missing report content"):
                VERIFY.verify_report_content("ignored.pdf", {**contract, "sourceUrls": ["https://other.test/gis"]})
            self.assertTrue(VERIFY.verify_report_content("ignored.pdf", {**contract, "criterionNotes": ["E01 - evidence.png"]}))
            with self.assertRaisesRegex(SystemExit, "missing report content"):
                VERIFY.verify_report_content("ignored.pdf", {**contract, "criterionNotes": ["SIMULATED UI STATE: held original request, then genuine recovery."]})

    def test_matches_expected_evidence_by_exact_source_hash(self):
        image = patterned_image((20, 40, 60))
        matched, missing = VERIFY.match_expected_images([expected("criterion-1.png", image, "source-a")], [observed("Image1.png", image, "source-a")])
        self.assertEqual(missing, [])
        self.assertEqual(matched[0]["method"], "source_sha256")

    def test_full_limitations_survive_page_footer_and_compound_word_wrapping(self):
        class Page:
            def __init__(self, value): self.value = value
            def extract_text(self): return self.value
        pages = [Page("Overall review outcome: Blocked\nLimitations during Testing: The required"),
                 Page("Metricell Limited © 2026 – Refer to Title Page\nCommercial in Confidence\nPage 4\n"
                      "detail state followed an approval-\nreview timeout.\n"
                      "Browser URL(s) recorded after criteria: https://example.test/gis\nE01 - evidence.png")]
        contract = {"overallOutcome": "Blocked", "limitations": "The required detail state followed an approval-review timeout.",
                    "sourceUrls": ["https://example.test/gis"], "evidenceCaptions": ["E01 - evidence.png"]}
        with patch.object(VERIFY, "PdfReader", return_value=type("Reader", (), {"pages": pages})()):
            self.assertTrue(VERIFY.verify_report_content("ignored.pdf", contract))
            with self.assertRaisesRegex(SystemExit, "missing report content"):
                VERIFY.verify_report_content("ignored.pdf", {**contract, "limitations": "The required detail state followed an approval-review timeout. Missing final sentence."})

    def test_footer_normalization_does_not_remove_real_body_lines(self):
        class Page:
            def extract_text(self):
                return "\n".join(["body line"] * 13 + ["Page 4", "Commercial in Confidence"] + ["body line"] * 13)
        self.assertIn("Page 4\nCommercial in Confidence", VERIFY.report_page_body(Page()))
        self.assertEqual(VERIFY.normalize_report_text("HTTP 500, not HTTP 200"), "HTTP 500, not HTTP 200")
        self.assertEqual(VERIFY.normalize_report_text("a no- \n\n  duration result"), "a no-duration result")

    def test_rejects_no_evidence_image(self):
        image = patterned_image((20, 40, 60))
        _, missing = VERIFY.match_expected_images([expected("criterion-1.png", image, "source-a")], [])
        self.assertEqual(missing, ["criterion-1.png"])

    def test_rejects_unrelated_same_sized_image(self):
        expected_image = patterned_image((20, 40, 60))
        unrelated = patterned_image((200, 180, 160), inverse=True)
        _, missing = VERIFY.match_expected_images([expected("criterion-1.png", expected_image, "source-a")], [observed("Image1.png", unrelated, "other")])
        self.assertEqual(missing, ["criterion-1.png"])

    def test_rejects_a_changed_control_on_a_similar_page(self):
        screenshot = Image.new("RGB", (1440, 900), (240, 243, 250))
        different = screenshot.copy()
        ImageDraw.Draw(different).rectangle((600, 300, 800, 400), fill=(20, 40, 80))
        _, missing = VERIFY.match_expected_images(
            [expected("criterion-1.png", screenshot, "source-a")],
            [observed("Image1.jpg", different, "converted")],
        )
        self.assertEqual(missing, ["criterion-1.png"])

    def test_requires_every_expected_image(self):
        first = patterned_image((20, 40, 60))
        second = patterned_image((200, 180, 160), inverse=True)
        _, missing = VERIFY.match_expected_images([expected("criterion-1.png", first, "source-a"), expected("criterion-2.png", second, "source-b")], [observed("Image1.png", first, "source-a")])
        self.assertEqual(missing, ["criterion-2.png"])

    def test_accepts_resized_evidence_using_pixels(self):
        image = patterned_image((20, 40, 60))
        resized = image.resize((720, 450), Image.Resampling.LANCZOS)
        matched, missing = VERIFY.match_expected_images([expected("criterion-1.png", image, "source-a")], [observed("Image1.png", resized, "converted")])
        self.assertEqual(missing, [])
        self.assertEqual(matched[0]["method"], "normalized_rgb_pixels")

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
        matched, missing = VERIFY.match_expected_images(
            [expected("criterion-1-final.png", image, "source-a")],
            [observed("Image72.jpg", converted_image, "converted")],
        )
        self.assertEqual(missing, [])
        self.assertEqual(matched[0]["method"], "normalized_rgb_pixels")

    def test_fingerprint_changes_do_not_hide_a_matching_converted_screenshot(self):
        image = patterned_image((20, 40, 60))
        resized = image.resize((720, 450), Image.Resampling.LANCZOS)
        converted = observed("Image1.jpg", resized, "converted")
        converted["visualFingerprint"] = "0" * 64
        matched, missing = VERIFY.match_expected_images(
            [expected("criterion-1.png", image, "source-a")], [converted]
        )
        self.assertEqual(missing, [])
        self.assertEqual(matched[0]["method"], "normalized_rgb_pixels")
        self.assertGreater(matched[0]["fingerprintDistance"], 12)


if __name__ == "__main__":
    unittest.main()
