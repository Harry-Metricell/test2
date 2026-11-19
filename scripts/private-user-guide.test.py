"""Exercise exact section placement, references and retry on a private guide."""

import importlib.util
import json
from pathlib import Path
import re
import sys
import tempfile

from docx import Document
from docx.oxml.ns import qn
from PIL import Image

sys.dont_write_bytecode = True
spec = importlib.util.spec_from_file_location("private_guide", Path(__file__).with_name("private-user-guide.py"))
guide = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guide)


def hidden(document, value):
    document.add_paragraph().add_run(value).font.hidden = True


def exercise(root, baseline):
    source = Document(baseline)
    index = guide.sections(source)
    target = "gis.workspace.zoom"
    other = "gis.surveyor.sessions"
    view = guide.section_view(source, target, index[target], True)
    old_count = len(list(guide.captions(source._element.body)))
    evidence = root / "evidence"
    image = evidence / "TEST2-999999/screenshots/fixture.png"
    image.parent.mkdir(parents=True)
    Image.new("RGB", (350, 160), "#345ab5").save(image)
    update = {
        "schema": "v4-user-guide-update.v1",
        "ticket": "TEST2-999999",
        "title": "Synthetic private guide integration check",
        "affectedSection": "Map scale",
        "sectionId": target,
        "sectionSha256": view["sectionSha256"],
        "changeType": "add",
        "steps": ["Check the scale example in [[FIGURE:1]]."],
        "screenshots": ["screenshots/fixture.png"],
        "screenshotCaptions": ["Synthetic scale example."],
        "reason": "Validate placement and figure identity using a disposable copy.",
    }
    candidate = root / "candidate.docx"
    receipt = guide.apply(baseline, candidate, update, evidence)
    assert receipt["figures"] == old_count + 1
    actual = Document(candidate)
    actual_index = guide.sections(actual)
    target_view = guide.section_view(actual, target, actual_index[target], True)
    other_view = guide.section_view(actual, other, actual_index[other], True)
    assert "Synthetic scale example." in target_view["figures"][-1]
    task = next(p for p in actual.paragraphs if p.text == update["title"])
    assert task.runs[0].bold and task.runs[0].font.highlight_color is not None
    assert task.paragraph_format.keep_with_next
    assert guide._text(task._p.getnext()).startswith("1. Check the scale example")
    new_caption = next(p for p in guide.captions(actual._element.body)
                       if guide._text(p).endswith("Synthetic scale example."))
    picture = new_caption.getprevious()
    assert len(list(picture.iter(qn("w:drawing")))) == 1
    assert next(picture.iter(qn("a:srcRect")), None) is None
    assert picture.find(".//" + qn("w:keepNext")) is not None
    assert not any("Synthetic" in paragraph for paragraph in other_view["paragraphs"])
    def without_renumbering(values):
        return [re.sub(r"\bFigure \d+\b", "Figure #", value) for value in values]
    assert set(actual_index) == set(index)
    for key, section in index.items():
        if key == target:
            continue
        before = guide.section_view(source, key, section, True)
        after = guide.section_view(actual, key, actual_index[key], True)
        assert before["heading"] == after["heading"]
        assert without_renumbering(before["paragraphs"]) == without_renumbering(after["paragraphs"]), key
    figures = list(guide.captions(actual._element.body))
    assert [int(guide._text(p).split()[1].rstrip(".:")) for p in figures] == list(range(1, old_count + 2))
    survey_caption = next(p for p in figures if "Surveyor test fixture" in guide._text(p) or "The selected Horsham survey route" in guide._text(p))
    reference = next(link for link in actual._element.iter(qn("w:hyperlink"))
                     if link.get(qn("w:anchor")) == guide.figure_key(survey_caption))
    assert guide._text(reference) == f"Figure {figures.index(survey_caption) + 1}"
    assert guide.apply(candidate, root / "retry.docx", update, evidence)["applied"] is False
    try:
        guide.apply(candidate, root / "stale.docx", {**update, "reason": "new payload"}, evidence)
    except ValueError as error:
        assert "changed" in str(error)
    else:
        raise AssertionError("A stale section hash was accepted")
    amendment = {**update, "changeType": "amend", "sectionSha256": target_view["sectionSha256"],
                 "steps": ["Read the amended example in [[FIGURE:1]]."],
                 "preserveFigureSlots": [len(target_view["figures"])]}
    amended = root / "amended.docx"
    guide.apply(candidate, amended, amendment, evidence)
    amended_document = Document(amended)
    amended_view = guide.section_view(amended_document, target, guide.sections(amended_document)[target], True)
    assert amended_view["heading"] == view["heading"]
    assert update["title"] not in amended_view["paragraphs"]
    assert len(amended_view["figures"]) == 1
    assert any("Read the amended example in Figure" in p for p in amended_view["paragraphs"])
    print(f"{target}: {target_view['figures'][-1]}; Surveyor reference: {guide._text(reference)}")
    (root / "update.json").write_text(json.dumps(update), encoding="utf-8")
    (root / "receipt.txt").write_text(receipt["marker"], encoding="utf-8")


if len(sys.argv) == 3:
    output = Path(sys.argv[2])
    output.mkdir(parents=True, exist_ok=True)
    exercise(output, Path(sys.argv[1]))
else:
    with tempfile.TemporaryDirectory() as temporary:
        root = Path(temporary)
        baseline = root / "baseline.docx"
        document = Document()
        hidden(document, "[[GUIDE_SECTION_BEGIN:gis.workspace.zoom]]")
        document.add_heading("2.1.3 Change the map scale", 2)
        document.add_paragraph("Figure 1. Original scale image.")
        hidden(document, "[[GUIDE_SECTION_END:gis.workspace.zoom]]")
        hidden(document, "[[GUIDE_SECTION_BEGIN:gis.surveyor.sessions]]")
        document.add_heading("2.4.1 Select and inspect a survey", 2)
        document.add_paragraph("See Figure 2 for the test route.")
        document.add_paragraph("Figure 2. Surveyor test fixture.")
        hidden(document, "[[GUIDE_SECTION_END:gis.surveyor.sessions]]")
        document.save(baseline)
        exercise(root, baseline)
