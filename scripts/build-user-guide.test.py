"""Regression test for the deterministic, yellow-highlighted guide builder."""
import json
import importlib.util
import subprocess
import sys
import tempfile
from pathlib import Path
from zipfile import ZipFile

from docx import Document
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
BUILDER = ROOT / "scripts" / "build-user-guide.py"
spec = importlib.util.spec_from_file_location("guide_builder", BUILDER)
sys.dont_write_bytecode = True
guide = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guide)
# Historical records must not invent step/image associations.
legacy = {"title": "Change linked sites", "steps": ["Open GIS."], "screenshots": ["screenshots/attempt-001/criterion-3-final.png"]}
assert "Open GIS" not in guide.screenshot_caption(legacy, 0)
assert "criterion-3-final.png" in guide.screenshot_caption(legacy, 0)
TEST_ROOT = ROOT / ".guide-staging" / "test-tmp"


def write_json(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value), encoding="utf-8")


TEST_ROOT.mkdir(parents=True, exist_ok=True)
with tempfile.TemporaryDirectory(dir=TEST_ROOT) as temporary:
    repo = Path(temporary) / "repo"
    template = repo / "assets/user-guide/V4 User Guide Template.docx"
    template.parent.mkdir(parents=True)
    document = Document()
    document.add_heading("Example guide", 0)
    document.add_paragraph("Existing guidance must stay unchanged.")
    document.add_paragraph("[[AUTO_GUIDE_CONTENT]]")
    document.save(template)
    write_json(repo / "config/user-guide-plan.json", {"schema": "v4-user-guide-plan.v1", "baselineTemplate": "assets/user-guide/V4 User Guide Template.docx", "publishedGuide": "assets/user-guide/V4 User Guide.docx", "captureRoot": ".guide-staging", "updatePolicy": {"highlightAddedOrChangedContent": True, "highlightColour": "yellow", "preserveUnchangedContent": True, "requireScreenshotForChangedFeature": True}, "sections": []})
    write_json(repo / "config/user-guide-update-policy.json", {"schema": "v4-user-guide-update-policy.v1", "enabled": True, "onlyForPassedEvidenceReviews": True, "requireVerifiedTicketEvidence": True, "highlightColour": "yellow", "preserveExistingGuideContent": True, "allowChangeTypes": ["add", "amend"]})
    evidence = Path(temporary) / "evidence"
    image_path = evidence / "TEST2-99/screenshots/attempt-001/criterion-1-final.png"
    image_path.parent.mkdir(parents=True)
    Image.new("RGB", (64, 32), "navy").save(image_path)
    write_json(repo / "tickets/TEST2-99/guide-update.json", {"schema": "v4-user-guide-update.v1", "ticket": "TEST2-99", "title": "Open the launcher", "affectedSection": "Getting started", "changeType": "add", "steps": ["Open the launcher."], "screenshots": ["screenshots/attempt-001/criterion-1-final.png"], "reason": "The launcher is a new user-facing entry point."})
    command = [sys.executable, str(BUILDER), "--repo", str(repo), "--evidence-root", str(evidence), "--ticket", "TEST2-99"]
    first = subprocess.run(command, capture_output=True, text=True)
    assert first.returncode == 0, first.stderr or first.stdout
    output = repo / "assets/user-guide/V4 User Guide.docx"
    result = Document(output)
    text = "\n".join(paragraph.text for paragraph in result.paragraphs)
    assert "Existing guidance must stay unchanged." in text
    assert "New feature: Open the launcher" in text
    assert "[[AUTO_GUIDE_UPDATE:TEST2-99]]" in text
    assert text.count("[[AUTO_GUIDE_CONTENT]]") == 1
    assert "FFFF00" in result._element.xml, "new screenshot container must be yellow"
    assert len(result.inline_shapes) == 1
    figure = [p for p in result.paragraphs if p._p.xpath('.//w:drawing') or p.text.startswith('Figure ')]
    assert figure[0].paragraph_format.keep_with_next is True
    assert figure[-1].paragraph_format.keep_with_next is False
    boundary_doc = Document()
    boundary_doc.add_paragraph('New feature: Figure boundary test')
    boundary_doc.add_paragraph('Section: Example')
    for _ in range(2):
        guide.yellow_screenshot(boundary_doc, image_path, 'Screenshot caption')
    boundary_doc.add_paragraph('[[AUTO_GUIDE_UPDATE:TEST2-99]]')
    guide.editorial_layout(boundary_doc, {})
    assert not boundary_doc.tables, 'generated figures must not be mergeable Word tables'
    assert len(boundary_doc.inline_shapes) == 2
    count = len(boundary_doc.paragraphs)
    guide.editorial_layout(boundary_doc, {})
    assert len(boundary_doc.paragraphs) == count, 'separator normalization must be idempotent'
    assert all(p.paragraph_format.keep_together for p in figure)
    # An existing guide can predate the paragraph pagination fix.
    for paragraph in figure:
        paragraph.paragraph_format.keep_with_next = None
        paragraph.paragraph_format.keep_together = None
    guide.editorial_layout(result, {})
    assert figure[0].paragraph_format.keep_with_next is True
    assert figure[-1].paragraph_format.keep_with_next is False
    with ZipFile(output) as package:
        assert any(name.startswith("word/media/") for name in package.namelist()), "screenshot must be embedded in the DOCX package"
    second = subprocess.run(command, capture_output=True, text=True)
    assert second.returncode == 0, second.stderr or second.stdout
    repeat = Document(output)
    assert "\n".join(paragraph.text for paragraph in repeat.paragraphs).count("New feature: Open the launcher") == 1

    replacement = evidence / "TEST2-100/screenshots/attempt-001/criterion-1-final.png"
    replacement.parent.mkdir(parents=True)
    Image.new("RGB", (64, 32), "green").save(replacement)
    update = {"schema": "v4-user-guide-update.v1", "ticket": "TEST2-100", "title": "Use the updated launcher", "affectedSection": "Getting started", "changeType": "amend", "supersedesTicket": "TEST2-99", "steps": ["Open the updated launcher."], "screenshots": ["screenshots/attempt-001/criterion-1-final.png"], "screenshotCaptions": ["Updated module cards are visible."], "reason": "Replace obsolete launcher instructions."}
    write_json(repo / "tickets/TEST2-100/guide-update.json", update)
    amend = subprocess.run([sys.executable, str(BUILDER), "--repo", str(repo), "--evidence-root", str(evidence), "--ticket", "TEST2-100"], capture_output=True, text=True)
    assert amend.returncode == 0, amend.stderr or amend.stdout
    amended = Document(output)
    amended_text = "\n".join(paragraph.text for paragraph in amended.paragraphs)
    assert "Existing guidance must stay unchanged." in amended_text
    assert "Updated guidance: Use the updated launcher" in amended_text
    assert "New feature: Open the launcher" not in amended_text
    assert "[[AUTO_GUIDE_UPDATE:TEST2-99]]" not in amended_text
    assert "[[AUTO_GUIDE_UPDATE:TEST2-100]]" in amended_text
    assert len(amended.inline_shapes) == 1, "old evidence image must be removed"
    with ZipFile(output) as package:
        assert len([name for name in package.namelist() if name.startswith("word/media/")]) == 1, "retired screenshot bytes must not linger in the document"
    assert "FFFF00" in amended._element.xml
    assert "Figure 1: Updated module cards are visible." in amended_text
    for bad_captions in ([], [""], ["One", "Extra"], "Not an array"):
        try:
            guide.validate_update({**update, "screenshotCaptions": bad_captions}, "TEST2-100")
        except SystemExit:
            pass
        else:
            raise AssertionError("invalid screenshot captions accepted")
    invalid = subprocess.run([sys.executable, str(BUILDER), "--repo", str(repo), "--evidence-root", str(evidence), "--ticket", "TEST2-99"], capture_output=True, text=True)
    assert invalid.returncode == 0, "historical update should be idempotent when explicitly rerun"

    # Editorial placement preserves block markers and manual chapter text.
    amended.add_heading("Next chapter", 1)
    plan = {"editorial": {"retiredUpdates": {}, "sectionRoutes": [{"prefixes": ["Getting started"], "beforeHeading": "Next chapter"}]}}
    layout = guide.editorial_layout(amended, plan)
    assert layout["moved"] == ["TEST2-100"]
    assert amended.paragraphs[-1].text == "Next chapter"
    guide.editorial_layout(amended, plan)
    assert sum(p.text == "[[AUTO_GUIDE_UPDATE:TEST2-100]]" for p in amended.paragraphs) == 1
    assert "Existing guidance must stay unchanged." in "\n".join(p.text for p in amended.paragraphs)

    lists = Document()
    lists.add_heading("First procedure", 1)
    first = lists.add_paragraph("First action", style="List Number")
    second = lists.add_paragraph("Second action", style="List Number")
    lists.add_heading("Second procedure", 1)
    third = lists.add_paragraph("Other action", style="List Number")
    guide.restart_baseline_numbering(lists)
    assert first._p.pPr.numPr.numId.val == second._p.pPr.numPr.numId.val
    assert first._p.pPr.numPr.numId.val != third._p.pPr.numPr.numId.val
    assert third.text == "Other action"
    numbered_lists = len(lists.part.numbering_part.element.num_lst)
    guide.restart_baseline_numbering(lists)
    assert len(lists.part.numbering_part.element.num_lst) == numbered_lists, "repeat builds must not accumulate numbering definitions"
    caption_plan = {"editorial": {"retiredUpdates": {}, "sectionRoutes": [], "captionOverrides": {"TEST2-100": ["The updated launcher is displayed."]}}}
    guide.editorial_layout(amended, caption_plan)
    assert any(p.text == "Figure 1: The updated launcher is displayed." for p in amended.paragraphs)
    assert all(p.paragraph_format.keep_with_next for p in amended.paragraphs if p._p.xpath('.//w:drawing'))
    heading, block = guide.superseded_block(amended, "TEST2-100")
    assert "Use the updated launcher" in "".join(heading.itertext()), "moved sections remain amendable"
    try:
        guide.editorial_layout(amended, {"editorial": {"sectionRoutes": [{"prefixes": ["Getting started"], "beforeHeading": "Missing chapter"}]}})
    except SystemExit:
        pass
    else:
        raise AssertionError("missing placement destination must fail safely")
    retirement = {"editorial": {"retiredUpdates": {"TEST2-100": {"coveredBy": "TEST2-101", "reason": "Explicit duplicate consolidation"}}, "sectionRoutes": []}}
    try:
        guide.editorial_layout(amended, retirement)
    except SystemExit:
        pass
    else:
        raise AssertionError("missing replacement must not delete an existing block")
    amended.add_paragraph("New feature: Replacement instructions")
    amended.add_paragraph("[[AUTO_GUIDE_UPDATE:TEST2-101]]")
    assert guide.editorial_layout(amended, retirement)["retired"] == ["TEST2-100"]
    assert len(amended.inline_shapes) == 0
    assert "Existing guidance must stay unchanged." in "\n".join(p.text for p in amended.paragraphs)

print("build-user-guide regression test passed")
