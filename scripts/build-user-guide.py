"""Build the living V4 user guide from ticket-approved guide-update records.

The script never invents content: every section comes from a published
``tickets/<KEY>/guide-update.json`` record and embeds only that ticket's
verified test PNGs.  It preserves all existing guide content and keeps a
hidden insertion marker after the generated updates for the next run.
"""

from __future__ import annotations

import argparse
import copy
import json
import os
import re
import shutil
from pathlib import Path

from docx import Document
from docx.enum.text import WD_COLOR_INDEX
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches

MARKER = "[[AUTO_GUIDE_CONTENT]]"
UPDATE_MARKER = "[[AUTO_GUIDE_UPDATE:{ticket}]]"
KEY = re.compile(r"^TEST2-\d+$")


def fail(message: str) -> None:
    raise SystemExit(f"User-guide builder: {message}")


def read_json(path: Path) -> dict:
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        fail(f"{path}: {error}")
    if not isinstance(value, dict):
        fail(f"{path} must contain an object")
    return value


def marker_paragraph(document: Document):
    matches = [paragraph for paragraph in document.paragraphs if MARKER in paragraph.text]
    if len(matches) != 1:
        fail(f"expected exactly one {MARKER} paragraph; found {len(matches)}")
    return matches[0]


def has_update(document: Document, ticket: str) -> bool:
    token = UPDATE_MARKER.format(ticket=ticket)
    return any(token in paragraph.text for paragraph in document.paragraphs)


def set_hidden(paragraph) -> None:
    for run in paragraph.runs:
        run.font.hidden = True


def add_before(marker, element) -> None:
    marker._p.addprevious(copy.deepcopy(element))


def staged_paragraph(style: str | None = None):
    temporary = Document()
    return temporary.add_paragraph(style=style)


def yellow_paragraph(text: str, style: str | None = None, hidden: bool = False):
    paragraph = staged_paragraph(style)
    run = paragraph.add_run(text)
    run.font.highlight_color = WD_COLOR_INDEX.YELLOW
    if hidden:
        run.font.hidden = True
    return paragraph


def yellow_steps(steps: list[str]):
    temporary = Document()
    elements = []
    for step in steps:
        paragraph = temporary.add_paragraph(style="List Number")
        run = paragraph.add_run(step)
        run.font.highlight_color = WD_COLOR_INDEX.YELLOW
        elements.append(paragraph._p)
    return elements


def yellow_screenshot(image: Path, caption: str):
    temporary = Document()
    table = temporary.add_table(rows=1, cols=1)
    cell = table.cell(0, 0)
    tc_pr = cell._tc.get_or_add_tcPr()
    shade = OxmlElement("w:shd")
    shade.set(qn("w:fill"), "FFFF00")
    tc_pr.append(shade)
    image_paragraph = cell.paragraphs[0]
    image_paragraph.alignment = 1
    # Test evidence can be captured at monitor resolution; cap it to a normal
    # portrait-page content width so a guide update cannot run off the page.
    image_paragraph.add_run().add_picture(str(image), width=Inches(6.1))
    caption_paragraph = cell.add_paragraph()
    caption_run = caption_paragraph.add_run(caption)
    caption_run.font.highlight_color = WD_COLOR_INDEX.YELLOW
    return table._tbl


def validate_update(update: dict, ticket: str) -> None:
    if update.get("schema") != "v4-user-guide-update.v1":
        fail(f"{ticket} has an unsupported guide update schema")
    if update.get("ticket") != ticket:
        fail(f"{ticket} guide update names a different ticket")
    if update.get("changeType") not in {"add", "amend"}:
        fail(f"{ticket} has an invalid changeType")
    for field in ("title", "affectedSection", "reason"):
        if not isinstance(update.get(field), str) or not update[field].strip():
            fail(f"{ticket} {field} is missing")
    if not isinstance(update.get("steps"), list) or not update["steps"] or any(not isinstance(step, str) or not step.strip() for step in update["steps"]):
        fail(f"{ticket} needs non-empty guide steps")
    screenshots = update.get("screenshots")
    if not isinstance(screenshots, list) or not screenshots or len(set(screenshots)) != len(screenshots):
        fail(f"{ticket} needs distinct screenshots")
    if any(not isinstance(item, str) or not re.match(r"^screenshots[\\/].+\.png$", item, re.I) or ".." in Path(item).parts for item in screenshots):
        fail(f"{ticket} has an unsafe screenshot path")


def ticket_updates(repo: Path, requested: list[str]) -> list[tuple[str, dict]]:
    candidates = requested or sorted(path.name for path in (repo / "tickets").glob("TEST2-*") if path.is_dir())
    output = []
    for ticket in candidates:
        if not KEY.match(ticket):
            fail(f"invalid ticket key: {ticket}")
        record = repo / "tickets" / ticket / "guide-update.json"
        if not record.exists():
            if requested:
                fail(f"missing {record.relative_to(repo)}")
            continue
        update = read_json(record)
        validate_update(update, ticket)
        output.append((ticket, update))
    return output


def screenshot_path(evidence_root: Path, ticket: str, relative: str) -> Path:
    candidate = (evidence_root / ticket / relative).resolve()
    allowed = (evidence_root / ticket).resolve()
    if allowed not in candidate.parents or not candidate.is_file() or candidate.suffix.lower() != ".png" or candidate.stat().st_size == 0:
        fail(f"verified screenshot is unavailable: {ticket}/{relative}")
    return candidate


def build(repo: Path, output: Path, evidence_root: Path, requested: list[str]) -> dict:
    plan = read_json(repo / "config" / "user-guide-plan.json")
    policy = read_json(repo / "config" / "user-guide-update-policy.json")
    if plan.get("updatePolicy", {}).get("highlightColour") != "yellow" or policy.get("highlightColour") != "yellow":
        fail("both guide policies must require yellow highlighting")
    updates = ticket_updates(repo, requested)
    if not updates:
        fail("no published guide-update.json records were found")
    source = repo / (plan["publishedGuide"] if (repo / plan["publishedGuide"]).is_file() else plan["baselineTemplate"])
    if not source.is_file():
        fail(f"guide source is missing: {source.relative_to(repo)}")
    output.parent.mkdir(parents=True, exist_ok=True)
    # Subsequent runs intentionally use the living guide as their source and
    # destination.  Copying a file over itself is both unnecessary and can be
    # locked by Windows, so only create the first living-guide copy.
    if source.resolve() != output.resolve():
        shutil.copy2(source, output)
    document = Document(output)
    marker = marker_paragraph(document)
    applied, skipped = [], []
    for ticket, update in updates:
        if has_update(document, ticket):
            skipped.append(ticket)
            continue
        label = "New feature" if update["changeType"] == "add" else "Updated guidance"
        add_before(marker, yellow_paragraph(f"{label}: {update['title'].strip()}", "Heading 1")._p)
        add_before(marker, yellow_paragraph(f"Section: {update['affectedSection'].strip()}")._p)
        for paragraph in yellow_steps([step.strip() for step in update["steps"]]):
            add_before(marker, paragraph)
        for index, relative in enumerate(update["screenshots"], start=1):
            image = screenshot_path(evidence_root, ticket, relative)
            add_before(marker, yellow_screenshot(image, f"Figure {index}: verified {ticket} evidence — {Path(relative).name}"))
        identity = yellow_paragraph(UPDATE_MARKER.format(ticket=ticket), hidden=True)
        add_before(marker, identity._p)
        applied.append(ticket)
    set_hidden(marker)
    document.save(output)
    return {"source": str(source.relative_to(repo)), "output": str(output.relative_to(repo)), "applied": applied, "skipped": skipped}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--output")
    parser.add_argument("--evidence-root", default=os.environ.get("TEST2_EVIDENCE", r"C:\Users\harry.piper\Documents\V4-QA-evidence"))
    parser.add_argument("--ticket", action="append", default=[])
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    plan = read_json(repo / "config" / "user-guide-plan.json")
    output = Path(args.output).resolve() if args.output else (repo / plan["publishedGuide"]).resolve()
    print(json.dumps(build(repo, output, Path(args.evidence_root), args.ticket), indent=2))


if __name__ == "__main__":
    main()
