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
    def test_long_tables_repeat_column_header_and_keep_it_with_first_row(self):
        document = Document()
        table = document.add_table(rows=1, cols=5)
        REPORT.repeat_table_header(table)
        REPORT.repeat_table_header(table)
        self.assertEqual(len(table.rows[0]._tr.trPr.findall(REPORT.qn("w:tblHeader"))), 1)
        self.assertTrue(all(p.paragraph_format.keep_with_next for cell in table.rows[0].cells for p in cell.paragraphs))

    def test_reviewed_complete_recheck_replaces_incomplete_earlier_journey(self):
        images = [Path(name) for name in ("criterion-3-baseline-layers-0.png", "criterion-3-final.png",
                  "criterion-3-cleanup.png", "criterion-3-recheck-initial.png",
                  "criterion-3-recheck-baseline-layers-0.png", "criterion-3-recheck-baseline-layers-8.png",
                  "criterion-3-recheck-before-no-match.png", "criterion-3-recheck-asserted-layers-0.png",
                  "criterion-3-recheck-asserted-layers-8.png", "criterion-3-recheck-final.png", "criterion-3-recheck-cleanup.png")]
        selected = REPORT.report_exhibits(images, "The search leaves the Map layers list unchanged.",
                                         "The complete recheck supersedes earlier incomplete coverage.")
        self.assertEqual(selected, images[4:10])
        both = REPORT.report_exhibits(images, "The search leaves the Map layers list unchanged.")
        self.assertIn(images[0], both)
        self.assertIn(images[9], both)

    def test_search_keeps_assertion_not_unrelated_configuration(self):
        images = [Path(name) for name in ("criterion-2-after-open-surveyor-retry.png",
                  "criterion-2-after-add-defaults.png", "criterion-2-before-no-match.png",
                  "criterion-2-after-no-match.png", "criterion-2-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "After entering a value in Search layers, no entries are visible."), images[2:])

    def test_returned_launcher_audit_starts_at_own_launch_baseline(self):
        images = [Path(name) for name in ("criterion-3-initial.png", "criterion-3-before-back.png",
                  "criterion-3-after-back.png", "criterion-3-before-open-audit.png",
                  "criterion-3-after-open-audit.png", "criterion-3-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "Starting from the returned launcher, open API Request Audit."), images[3:])

    def test_default_configuration_with_before_add_name_is_not_lost(self):
        images = [Path(name) for name in ("criterion-1-after-open-gis.png", "criterion-1-after-open-surveyor-before-add.png", "criterion-1-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "A layer loaded with its default configuration is visible."), images[1:])

    def test_zoom_starts_at_its_recorded_map_baseline(self):
        images = [Path(name) for name in ("criterion-2-after-open-surveyor.png", "criterion-2-after-add.png", "criterion-2-settings-baseline.png", "criterion-2-before-zoom-in.png", "criterion-2-after-zoom-in.png", "criterion-2-before-zoom-out.png", "criterion-2-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "Zoom in and zoom out restore the original scale with the same layer."), images[3:])
        self.assertEqual(REPORT.report_exhibits(images, "After zooming, Show linked sites has its recorded checkbox state."), images[2:])

    def test_second_configuration_keeps_list_or_checkbox_baseline_not_first_add(self):
        images = [Path(name) for name in ("criterion-4-before-first-configuration.png", "criterion-4-after-first-configuration.png", "criterion-4-baseline-linked-sites-checked.png", "criterion-4-before-second-configuration.png", "criterion-4-before-cancel.png", "criterion-4-after-cancel.png", "criterion-4-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "Cancelling the second configuration leaves the Map layers list unchanged."), images[3:])
        self.assertEqual(REPORT.report_exhibits(images, "After cancelling the second configuration Show linked sites retains its checkbox state."), images[2:])

    def test_recovered_cancel_shows_decisive_pair_not_superseded_setup(self):
        images = [Path(name) for name in ("criterion-2-before-open.png", "criterion-2-final.png",
                  "criterion-2-before-open-recovered.png", "criterion-2-before-cancel-recovered.png",
                  "criterion-2-final-recovered.png", "criterion-2-cleanup.png")]
        self.assertEqual(REPORT.report_exhibits(images, "Select Cancel and verify the dialog closes."), images[3:5])

    def test_cancel_preserves_required_layer_list_baseline(self):
        images = [Path(name) for name in ("criterion-3-before-open.png", "criterion-3-before-cancel.png", "criterion-3-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "After cancelling the Map layers list matches the initial baseline."), images)

    def test_back_keeps_destination_and_return_not_launcher_setup(self):
        images = [Path(name) for name in ("criterion-3-initial.png", "criterion-3-after-open-before-back.png", "criterion-3-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "Using the browser Back control returns to the launcher."), images[1:])

    def test_only_direct_contradictions_count_as_defects(self):
        self.assertEqual(REPORT.confirmed_defect_count("Failed"), 1)
        for outcome in ("Passed", "Blocked", "Unverified"):
            self.assertEqual(REPORT.confirmed_defect_count(outcome), 0)

    def test_close_uses_actual_before_state_not_launcher(self):
        images = [Path(name) for name in ("criterion-3-initial.png", "criterion-3-before-add.png",
                  "criterion-3-after-add-dialog.png", "criterion-3-before-open.png",
                  "criterion-3-before-close.png", "criterion-3-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "When Display Settings is closed, the same layer remains."), images[4:])

    def test_defaults_preserve_configuration_and_unknown_transition_names(self):
        images = [Path(name) for name in ("criterion-1-initial.png", "criterion-1-before-add.png",
                  "criterion-1-after-add-dialog.png", "criterion-1-before-confirm-add.png",
                  "criterion-1-final.png")]
        self.assertEqual(REPORT.report_exhibits(images, "A layer loaded using its default configuration shows a legend."), images[3:])
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
            "criterion-4-final.png"])

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
            criteria = ["The launcher is displayed with all available module cards and each card has its own Open module control.", "A restricted user cannot open Surveyor."]
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
            self.assertTrue(heading.paragraph_format.page_break_before)
            self.assertEqual(document.tables[3].cell(1, 0).text, f"1. {criteria[0]}")
            self.assertNotIn("...", document.tables[3].cell(1, 0).text)
            self.assertIsNotNone(document.tables[3].rows[1]._tr.trPr.find(REPORT.qn("w:cantSplit")))
            opening = heading._p
            while opening is not document.tables[5]._tbl:
                paragraphs = [opening] if opening.tag == REPORT.qn("w:p") else list(opening.iter(REPORT.qn("w:p")))
                for paragraph in paragraphs:
                    self.assertIsNotNone(paragraph.pPr.find(REPORT.qn("w:keepNext")))
                opening = opening.getnext()
                self.assertIsNotNone(opening)
            self.assertEqual(document.tables[5].cell(1, 0).text, "1.0.0")
            self.assertEqual(document.tables[5].cell(1, 1).text, criteria[0])
            cycle = document.tables[2]
            self.assertIn("1 blocked; 1 inconclusive", cycle.cell(5, 1).text)
            self.assertIn("not a confirmed application defect", cycle.cell(5, 1).text)
            self.assertEqual(document.tables[3].cell(1, 2).text, "Y")
            self.assertEqual(document.tables[3].cell(1, 3).text, "0")
            self.assertEqual(cycle.cell(6, 1).text, "Blocked")
            self.assertEqual(cycle.cell(7, 1).text, "https://example.test/launcher")
            self.assertEqual(cycle.cell(2, 1).text, "example.test")
            self.assertEqual(cycle.cell(3, 1).text, "Browser name/version not recorded")
            case_text = "\n".join(cell.text for row in document.tables[5].rows for cell in row.cells)
            self.assertIn("Evidence: E01", case_text)
            self.assertIn("Browser URL recorded after criterion: https://example.test/launcher", case_text)
            self.assertIn("Failed", case_text)  # Unverified remains Failed in the PDF convention.
            cases = document.tables[5]
            self.assertEqual(criteria[0], cases.rows[1].cells[1].text)
            self.assertIn("E01 - Final (criterion-1-final.png)", cases.rows[2].cells[0].tables[0].cell(0, 0).text)
            self.assertIn("A restricted user", cases.rows[3].cells[1].text)
            self.assertNotIn("Supporting setup captures", case_text)
            images = json.loads(manifest.read_text(encoding="utf-8"))
            self.assertEqual(images["embeddedEvidenceImages"], 1)
            self.assertEqual(len(images["logicalEvidence"]), 1)
            self.assertEqual(images["reportContent"]["overallOutcome"], "Blocked")
            self.assertEqual(images["reportContent"]["evidenceCaptions"], ["E01 - Final (criterion-1-final.png)"])

    def test_adjacent_duplicate_final_is_printed_once(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            first, final = root / "after.png", root / "final.png"
            Image.new("RGB", (50, 30), "blue").save(first)
            shutil.copy2(first, final)
            self.assertEqual(REPORT.distinct_states([first, final]), [final])

    def test_one_changed_pixel_is_not_deduplicated(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            before, after = root / "before.png", root / "after.png"
            image = Image.new("RGB", (50, 30), "white")
            image.save(before)
            image.putpixel((25, 15), (0, 0, 0))
            image.save(after)
            self.assertEqual(REPORT.distinct_states([before, after]), [before, after])

    def test_return_to_original_state_is_not_deduplicated(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            before, changed, restored = [root / name for name in ("before.png", "changed.png", "restored.png")]
            Image.new("RGB", (50, 30), "blue").save(before)
            Image.new("RGB", (50, 30), "red").save(changed)
            shutil.copy2(before, restored)
            self.assertEqual(REPORT.distinct_states([before, changed, restored]), [before, changed, restored])

    def test_reopen_without_adding_does_not_request_setup(self):
        names = [Path(name) for name in ("criterion-3-after-add-surveyor.png", "criterion-3-before-confirm-defaults.png", "criterion-3-after-open-display-settings.png", "criterion-3-after-toggle.png", "criterion-3-after-close.png", "criterion-3-after-reopen.png")]
        self.assertEqual(REPORT.report_exhibits(names, "Reopen settings without adding the layer again."), names[2:])

    def test_setup_map_is_not_decisive_even_when_defaults_required(self):
        names = [Path(name) for name in ("criterion-1-after-open-gis.png", "criterion-1-before-add-surveyor.png", "criterion-1-before-confirm-defaults.png", "criterion-1-after-confirm-defaults.png", "criterion-1-before-open-display-settings.png", "criterion-1-final.png")]
        self.assertEqual(REPORT.report_exhibits(names, "Open settings on a layer with its default configuration."), names[2:])

    def test_passed_recovered_errors_are_recorded_without_changing_outcome(self):
        result = {"outcome": "Passed", "browserVersion": "1", "browserUrl": "https://example.test/gis", "reason": "Recovered add-layer tool timeout; cleanup removal reappeared and was completed."}
        notes = REPORT.report_limitations({}, [{"outcome": "Passed"}], [result])
        self.assertIn("Criterion 1: Recovered add-layer tool timeout", notes)
        self.assertNotIn("blocked", notes)
        self.assertEqual(result["outcome"], "Passed")

    def test_recovered_problem_can_be_found_in_steps(self):
        result = {"browserVersion": "1", "browserUrl": "https://example.test/gis", "reason": "Original state restored.", "steps_taken": ["Layer removal reappeared on return; removal was then verified."]}
        self.assertIn("removal reappeared", REPORT.report_limitations({}, [{"outcome": "Passed"}], [result]))

    def test_no_error_does_not_hide_real_recovered_timeout(self):
        result = {"browserVersion": "1", "browserUrl": "https://example.test/gis", "reason": "Recovered a tool timeout without application errors."}
        self.assertIn("Recovered a tool timeout", REPORT.report_limitations({}, [{"outcome": "Passed"}], [result]))
        result["reason"] = "Opened GIS without application errors."
        self.assertEqual(REPORT.report_limitations({}, [{"outcome": "Passed"}], [result]), "No testing limitations recorded.")

    def test_descriptive_caption_keeps_original_filename(self):
        self.assertEqual(REPORT.evidence_caption(Path("criterion-2-after-toggle.png")), "After toggle (criterion-2-after-toggle.png)")

    def test_localized_change_has_safe_enlargement_with_context(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            before, after = root / "criterion-1-before-toggle.png", root / "criterion-1-after-toggle.png"
            image = Image.new("RGB", (1440, 900), "white")
            image.save(before)
            from PIL import ImageDraw
            ImageDraw.Draw(image).rectangle((1100, 250, 1115, 265), fill="blue")
            image.save(after)
            box = REPORT.localized_change_region([before, after])
            self.assertIsNotNone(box)
            self.assertLess(box[0], 1100)
            self.assertGreater(box[2], 1115)
            self.assertLessEqual(box[2], 1440)
            document = Document()
            table = document.add_table(rows=1, cols=5)
            REPORT.add_image_row(table, [("E01", before, "https://example.test/gis"), ("E02", after, "https://example.test/gis")], focus_region=box)
            self.assertEqual(len(document.inline_shapes), 4)
            self.assertEqual(len(table._tbl.xpath('.//a:srcRect')), 2)
            self.assertIn("full screenshot above", table.rows[1].cells[0].tables[0].cell(1, 0).text)

    def test_broad_navigation_change_is_not_cropped(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            before, after = root / "criterion-1-before-open.png", root / "criterion-1-after-open.png"
            Image.new("RGB", (1440, 900), "white").save(before)
            Image.new("RGB", (1440, 900), "blue").save(after)
            self.assertIsNone(REPORT.localized_change_region([before, after]))

    def test_settings_exhibits_exclude_repeated_layer_setup(self):
        names = [Path(name) for name in (
            "criterion-1-after-open-layer-dialog.png", "criterion-1-after-add-layer.png",
            "criterion-1-before-toggle.png", "criterion-1-after-toggle.png", "criterion-1-final.png")]
        self.assertEqual(REPORT.report_exhibits(names, "Changing the control restores its original state."), names[2:])
        self.assertEqual(REPORT.report_exhibits(names[:2] + [names[-1]], "Opening Display Settings shows the control."), [names[-1]])

    def test_layer_setup_is_retained_when_it_is_the_assertion(self):
        names = [Path(name) for name in (
            "criterion-1-after-open-layer-dialog.png", "criterion-1-after-add-layer.png", "criterion-1-final.png")]
        self.assertEqual(REPORT.report_exhibits(names, "The layer is loaded with its default configuration."), names)
        self.assertEqual(REPORT.report_exhibits(names, "Opening the configuration dialog displays its controls."), names)
        self.assertEqual(REPORT.report_exhibits(names, "Adding a layer shows it in the layer list."), names[1:])

    def test_crop_is_bound_to_the_displayed_pair_not_setup(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            names = [root / name for name in (
                "criterion-1-after-open-layer-dialog.png", "criterion-1-after-add-layer.png",
                "criterion-1-before-toggle.png", "criterion-1-after-toggle.png", "criterion-1-final.png")]
            for file in names:
                Image.new("RGB", (1440, 900), "white").save(file)
            from PIL import ImageDraw
            changed = Image.open(names[3])
            ImageDraw.Draw(changed).rectangle((1100, 250, 1115, 265), fill="blue")
            changed.save(names[3])
            changed.save(names[4])
            self.assertIsNone(REPORT.localized_change_region(names[:2]))
            self.assertIsNotNone(REPORT.localized_change_region(names[2:4]))
            self.assertIsNotNone(REPORT.localized_change_region([names[2], names[4]]))
            self.assertIsNone(REPORT.localized_change_region([names[4]]))

    def test_restored_identical_state_is_printed_after_change(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            names = [root / name for name in ("criterion-1-before-toggle.png", "criterion-1-after-toggle.png", "criterion-1-final.png")]
            Image.new("RGB", (1440, 900), "white").save(names[0])
            Image.new("RGB", (1440, 900), "blue").save(names[1])
            shutil.copy2(names[0], names[2])
            (root / "criteria.md").write_text("- [ ] Restore the control.\n")
            (root / "results.json").write_text(json.dumps([{"criterion": 1, "outcome": "Passed", "evidence": [p.name for p in names], "browserUrl": "https://example.test/gis"}]))
            (root / "review.json").write_text(json.dumps({"ticket": "TEST2-99", "overallOutcome": "Passed", "criterionOutcomes": [{"criterion": "Restore the control.", "outcome": "Passed"}]}))
            output = root / "report.docx"
            subprocess.run([sys.executable, str(MODULE), "--template", str(MODULE.parents[1] / "assets/templates/Automated Test Case Template.docx"), "--review-output", str(root / "review.json"), "--criteria", str(root / "criteria.md"), "--results", str(root / "results.json"), "--screenshots", str(root), "--output", str(output), "--image-manifest", str(root / "manifest.json")], check=True)
            document = Document(output)
            self.assertEqual(len(document.inline_shapes), 3)
            manifest = json.loads((root / "manifest.json").read_text())
            self.assertEqual(manifest["embeddedEvidenceImages"], 2)
            self.assertEqual(len(manifest["logicalEvidence"]), 3)

    def test_reopen_baseline_uses_settled_before_reopen_capture(self):
        names = [Path(name) for name in ("criterion-3-before-toggle.png", "criterion-3-after-toggle.png", "criterion-3-after-close.png", "criterion-3-before-reopen.png", "criterion-3-after-reopen.png", "criterion-3-final.png")]
        self.assertEqual(REPORT.report_exhibits(names, "Reopening settings retains the changed state."), [names[0], names[1], names[3], names[5]])


if __name__ == "__main__":
    unittest.main()
