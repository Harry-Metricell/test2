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
    def test_close_uses_actual_before_state_not_launcher(self):
        images = [Path(name) for name in ("criterion-3-initial.png", "criterion-3-before-add.png",
                  "criterion-3-after-add-dialog.png", "criterion-3-before-open.png",
                  "criterion-3-before-close.png", "criterion-3-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "When Display Settings is closed, the same layer remains."), images[4:])

    def test_defaults_preserve_configuration_and_unknown_transition_names(self):
        images = [Path(name) for name in ("criterion-1-initial.png", "criterion-1-before-add.png",
                  "criterion-1-after-add-dialog.png", "criterion-1-before-confirm-add.png",
                  "criterion-1-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "A layer loaded using its default configuration shows a legend."), images[2:])
        unknown = [Path(name) for name in ("criterion-2-initial.png", "criterion-2-before-expand.png", "criterion-2-final.png")]
        self.assertEqual(REPORT.report_exhibits(unknown, "The settings panel opens."), unknown[1:])

    def test_reopen_without_adding_does_not_include_add_setup(self):
        images = [Path(name) for name in ("criterion-4-initial.png", "criterion-4-before-add.png",
                  "criterion-4-after-add-dialog.png", "criterion-4-before-close.png",
                  "criterion-4-after-close.png", "criterion-4-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "Reopen the same layer without adding the layer again."), images[3:])

    def test_body_headings_visible_and_back_cover_preserved(self):
        document = Document(MODULE.parents[1] / "assets/templates/Automated Test Case Template.docx")
        REPORT.make_body_headings_visible(document)
        self.assertEqual(str(document.styles["Heading 1"].font.color.rgb), "000000")
        for paragraph in document.paragraphs:
            if paragraph.text.strip() == "Revision History":
                self.assertTrue(all(str(run.font.color.rgb) == "000000" for run in paragraph.runs))
            if paragraph.text.strip() == "About Metricell":
                self.assertTrue(all(str(run.font.color.rgb) == "FFFFFF" for run in paragraph.runs))

    def test_browser_details_are_observed_not_assumed(self):
        self.assertEqual(REPORT.browser_details([{}]), "Browser name/version not recorded")
        self.assertEqual(REPORT.browser_details([{"browserName": "Chromium", "browserVersion": "153.0.1.2"}]), "Chromium 153.0.1.2")

    def test_cleanup_only_cannot_be_used_as_fallback_evidence(self):
        with self.assertRaisesRegex(SystemExit, "only cleanup"):
            REPORT.report_exhibits([Path("criterion-1-cleanup.png")], "Layer is visible.")
        initial = [Path("criterion-1-initial.png")]
        self.assertEqual(REPORT.report_exhibits(initial, "Layer is visible."), initial)

    def test_continued_image_rows_keep_criterion_context(self):
        with tempfile.TemporaryDirectory() as temporary:
            image = Path(temporary) / "final.png"
            Image.new("RGB", (1440, 900), "navy").save(image)
            document = Document()
            table = document.add_table(rows=1, cols=5)
            REPORT.add_image_row(table, [("E01", image, "https://example.test/gis")], criterion_label="Criterion 4 continued: Reopen settings.")
            self.assertIn("Criterion 4 continued: Reopen settings.", table.rows[1].cells[0].text)

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
            "criterion-4-after-reopen.png", "criterion-4-final.png"])

    def test_final_is_retained_when_reopened_state_has_no_named_capture(self):
        images = [Path(name) for name in ("criterion-4-before-restore.png",
                  "criterion-4-after-restore.png", "criterion-4-after-close.png",
                  "criterion-4-final.png", "criterion-4-cleanup.png")]
        selected = REPORT.report_exhibits(images, "Restore, close and reopen settings.")
        self.assertIn(images[3], selected)
        self.assertNotIn(images[4], selected)

    def test_decisive_images_are_full_width_without_tiny_third_capture(self):
        with tempfile.TemporaryDirectory() as temporary:
            image = Path(temporary) / "final.png"
            Image.new("RGB", (1440, 900), "navy").save(image)
            document = Document()
            table = document.add_table(rows=1, cols=5)
            REPORT.add_image_row(table, [("E01", image, "https://example.test/gis")])
            self.assertGreater(document.inline_shapes[0].width.inches, 5)

    def test_back_cover_has_one_break_and_no_empty_spacer_page(self):
        document = Document()
        cases = document.add_table(rows=1, cols=5)
        document.add_page_break()
        document.add_paragraph()
        cover = document.add_paragraph("About Metricell")
        REPORT.remove_back_cover_spacers(cases)
        self.assertIs(cases._tbl.getnext(), cover._p)
        self.assertTrue(cover.paragraph_format.page_break_before)

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
            self.assertEqual(cycle.cell(2, 1).text, "example.test")
            self.assertEqual(cycle.cell(3, 1).text, "Browser name/version not recorded")
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
            self.assertEqual(images["reportContent"]["evidenceCaptions"], ["E01 - criterion-1-initial.png", "E01 - criterion-1-final.png"])


if __name__ == "__main__":
    unittest.main()
