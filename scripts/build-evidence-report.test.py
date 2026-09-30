"""Regression tests for matching review criteria to tester screenshot evidence."""
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from docx import Document
from PIL import Image


MODULE = Path(__file__).with_name("build-evidence-report.py")
SPEC = importlib.util.spec_from_file_location("build_evidence_report", MODULE)
REPORT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REPORT)


class ResultMatchingTests(unittest.TestCase):
    def test_uses_ordered_result_when_review_has_full_criterion_text(self):
        criteria = ["The launcher is displayed."]
        tester_result = {"criterion": 1, "evidence": ["criterion-1-initial.png", "criterion-1-final.png"]}
        reviewer_outcome = {"criterion": "The launcher is displayed."}
        matched = REPORT.result_for_outcome(reviewer_outcome, [tester_result], {"1": tester_result}, criteria, 0)
        self.assertEqual(matched, tester_result)

    def test_manifest_keeps_logical_references_but_deduplicates_identical_images(self):
        logical = [
            {"file": "criterion-1-initial.png", "sourceSha256": "same", "visualFingerprint": "a"},
            {"file": "criterion-2-final.png", "sourceSha256": "same", "visualFingerprint": "a"},
        ]
        expected = REPORT.unique_evidence_identities(logical)
        self.assertEqual(len(logical), 2)
        self.assertEqual(len(expected), 1)
        self.assertEqual(expected[0]["file"], "criterion-1-initial.png")

    def test_missing_referenced_screenshot_is_not_silently_omitted(self):
        with self.assertRaisesRegex(SystemExit, "referenced screenshot is missing"):
            REPORT.screenshot_paths({"evidence": ["missing.png"]}, [])

    def test_source_url_does_not_publish_query_secrets(self):
        self.assertEqual(REPORT.public_browser_url("https://user:secret@example.test/gis?token=secret#part"),
                         "https://example.test/gis")

    def test_report_includes_outcome_limitations_urls_and_unique_evidence(self):
        with tempfile.TemporaryDirectory(prefix="test2-report-builder-") as temporary:
            root = Path(temporary)
            screenshots = root / "screenshots"
            screenshots.mkdir()
            first = screenshots / "criterion-1-initial.png"
            Image.new("RGB", (1440, 900), "blue").save(first)
            shutil.copy2(first, screenshots / "criterion-1-final.png")
            criteria = ["The launcher is displayed.", "A restricted user cannot open Surveyor."]
            (root / "criteria.md").write_text("".join(f"- [ ] {item}\n" for item in criteria), encoding="utf-8")
            (root / "results.json").write_text(json.dumps([
                {"criterion": 1, "outcome": "Unverified", "browserUrl": "https://example.test/launcher",
                 "reason": "Evidence is inconclusive.", "evidence": ["criterion-1-initial.png", "criterion-1-final.png"]},
                {"criterion": 2, "outcome": "Blocked", "reason": "No restricted account was supplied.", "evidence": []},
            ]), encoding="utf-8")
            (root / "review.json").write_text(json.dumps({
                "ticket": "TEST2-99", "overallOutcome": "Blocked", "reason": "Restricted account unavailable.",
                "criterionOutcomes": [
                    {"criterion": criteria[0], "outcome": "Unverified", "reason": "Evidence is inconclusive."},
                    {"criterion": criteria[1], "outcome": "Blocked", "reason": "No restricted account was supplied."},
                ],
            }), encoding="utf-8")
            output = root / "report.docx"
            manifest = root / "manifest.json"
            template = MODULE.parents[1] / "assets" / "templates" / "Automated Test Case Template.docx"
            subprocess.run([sys.executable, str(MODULE), "--template", str(template),
                            "--review-output", str(root / "review.json"), "--criteria", str(root / "criteria.md"),
                            "--results", str(root / "results.json"), "--screenshots", str(screenshots),
                            "--output", str(output), "--image-manifest", str(manifest)], check=True)
            document = Document(output)
            cycle = document.tables[2]
            self.assertIn("1 blocked; 1 inconclusive", cycle.cell(5, 1).text)
            self.assertEqual(cycle.cell(6, 1).text, "Blocked")
            self.assertEqual(cycle.cell(7, 1).text, "https://example.test/launcher")
            case_text = "\n".join(cell.text for row in document.tables[5].rows for cell in row.cells)
            self.assertIn("Evidence: E01", case_text)
            self.assertIn("Criterion final URL: https://example.test/launcher", case_text)
            self.assertIn("Failed", case_text)  # Unverified remains Failed in the PDF convention.
            self.assertIn("Evidence Appendix - unique source screenshots", case_text)
            images = json.loads(manifest.read_text(encoding="utf-8"))
            self.assertEqual(images["embeddedEvidenceImages"], 1)
            self.assertEqual(len(images["logicalEvidence"]), 2)
            self.assertEqual(images["reportContent"]["overallOutcome"], "Blocked")
            self.assertEqual(images["reportContent"]["evidenceCaptions"], ["E01 - criterion-1-initial.png"])


if __name__ == "__main__":
    unittest.main()
