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


sys.dont_write_bytecode = True
MODULE = Path(__file__).with_name("build-evidence-report.py")
SPEC = importlib.util.spec_from_file_location("build_evidence_report", MODULE)
REPORT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(REPORT)


class ResultMatchingTests(unittest.TestCase):
    def test_untested_block_builds_but_missing_claimed_evidence_fails(self):
        with tempfile.TemporaryDirectory(prefix="test2-no-browser-") as temporary:
            root = Path(temporary)
            template = MODULE.parent.parent / "assets/templates/Automated Test Case Template.docx"
            review = {"ticket": "TEST2-99", "overallOutcome": "Blocked", "criterionOutcomes": [{"criterion": "Launcher is visible.", "outcome": "Blocked", "reason": "Browser tools unavailable."}]}
            results = [{"criterion": "Launcher is visible.", "outcome": "Blocked", "evidence": [], "reason": "Browser tools unavailable."}]
            (root / "review.json").write_text(json.dumps(review))
            (root / "results.json").write_text(json.dumps(results))
            (root / "criteria.md").write_text("- [ ] Launcher is visible.\n")
            command = [sys.executable, str(MODULE), "--template", str(template), "--review-output", str(root / "review.json"), "--results", str(root / "results.json"), "--criteria", str(root / "criteria.md"), "--screenshots", str(root / "missing-folder"), "--output", str(root / "report.docx"), "--image-manifest", str(root / "manifest.json")]
            subprocess.run(command, check=True, capture_output=True)
            manifest = json.loads((root / "manifest.json").read_text())
            self.assertEqual(manifest["expectedEvidence"], [])
            self.assertIn("No browser evidence was captured", manifest["reportContent"]["limitations"])
            results[0]["evidence"] = ["missing.png"]
            (root / "results.json").write_text(json.dumps(results))
            failed = subprocess.run(command, capture_output=True, text=True)
            self.assertNotEqual(failed.returncode, 0)

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

    def test_report_uses_decisive_exhibits_not_repeated_setup(self):
        images = [Path(name) for name in (
            "criterion-4-initial.png", "criterion-4-after-open-gis.png",
            "criterion-4-before-restore.png", "criterion-4-after-restore.png",
            "criterion-4-before-close.png", "criterion-4-after-close.png",
            "criterion-4-after-reopen.png", "criterion-4-final.png", "criterion-4-after-cleanup.png")]
        selected = REPORT.report_exhibits(images, "Restore the control, close and reopen settings.")
        self.assertEqual([image.name for image in selected], [
            "criterion-4-before-restore.png", "criterion-4-after-restore.png",
            "criterion-4-before-close.png", "criterion-4-after-close.png",
            "criterion-4-after-reopen.png"])

    def test_cleanup_capture_is_not_a_decisive_exhibit(self):
        images = [Path(name) for name in (
            "criterion-4-before-close.png", "criterion-4-after-reopen.png",
            "criterion-4-final.png", "criterion-4-after-restore.png")]
        selected = REPORT.report_exhibits(images, "Restore, close and reopen settings.")
        self.assertNotIn(images[-1], selected)

    def test_report_reason_omits_file_presence_boilerplate(self):
        reason = ("Before and after screenshots show the change. The result browserUrl is "
                  "https://o2intelligence-v4-dev.metricell.com/gis, an expected V4 host. "
                  "All named criterion screenshots exist and are non-empty.")
        self.assertEqual(REPORT.concise_review_reason(reason), "Before and after screenshots show the change.")

    def test_steps_have_clean_separators(self):
        self.assertEqual(REPORT.formatted_steps(["Opened GIS.", "Changed the setting."]),
                         "Opened GIS; Changed the setting.")

    def test_setup_capture_selection_is_small_and_distinct(self):
        with tempfile.TemporaryDirectory(prefix="test2-setup-captures-") as temporary:
            folder = Path(temporary)
            files = [folder / name for name in (
                "criterion-1-after-open-gis.png", "criterion-2-after-open-gis.png",
                "criterion-1-before-load.png", "criterion-1-after-cleanup.png")]
            for index, file in enumerate(files):
                Image.new("RGB", (40, 30), (index * 40, 10, 10)).save(file)
            selected = REPORT.supporting_captures([(file, "https://example.test/gis") for file in files], {})
            self.assertEqual(len(selected), 2)
            self.assertEqual([item[1].name for item in selected], [files[0].name, files[1].name])

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
            heading = next(paragraph for paragraph in document.paragraphs if paragraph.text.strip() == "Test Cases")
            self.assertFalse(heading.paragraph_format.page_break_before)
            cycle = document.tables[2]
            self.assertIn("1 blocked; 1 inconclusive", cycle.cell(5, 1).text)
            self.assertEqual(cycle.cell(6, 1).text, "Blocked")
            self.assertEqual(cycle.cell(7, 1).text, "https://example.test/launcher")
            case_text = "\n".join(cell.text for row in document.tables[5].rows for cell in row.cells)
            self.assertIn("Evidence: E01", case_text)
            self.assertIn("Browser URL recorded after criterion: https://example.test/launcher", case_text)
            self.assertIn("Failed", case_text)  # Unverified remains Failed in the PDF convention.
            cases = document.tables[5]
            self.assertIn("The launcher is displayed.", cases.rows[1].cells[1].text)
            self.assertIn("E01 - criterion-1-initial.png", cases.rows[2].cells[0].tables[0].cell(0, 0).text)
            self.assertIn("A restricted user", cases.rows[3].cells[1].text)
            self.assertNotIn("Supporting setup captures", case_text)
            images = json.loads(manifest.read_text(encoding="utf-8"))
            self.assertEqual(images["embeddedEvidenceImages"], 1)
            self.assertEqual(len(images["logicalEvidence"]), 2)
            self.assertEqual(images["reportContent"]["overallOutcome"], "Blocked")
            self.assertEqual(images["reportContent"]["evidenceCaptions"], ["E01 - criterion-1-initial.png"])


if __name__ == "__main__":
    unittest.main()
