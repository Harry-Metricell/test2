"""Build the living V4 user guide from ticket-approved guide-update records.

The script never invents content: every section comes from a published
``tickets/<KEY>/guide-update.json`` record and embeds only that ticket's
verified test PNGs. It preserves manual guide content, places generated blocks
beside configured chapters, and retires only explicitly configured duplicates.
Hidden markers preserve amendment identity and the next insertion location.
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
from docx.shared import Inches, RGBColor
from docx.table import Table
from docx.text.paragraph import Paragraph

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


def superseded_block(document: Document, ticket: str):
    """Find one complete generated block; never remove manually written guide text."""
    token = UPDATE_MARKER.format(ticket=ticket)
    matches = [p for p in document.paragraphs if token in p.text]
    if len(matches) != 1:
        fail(f"amend target {ticket} must have exactly one guide marker; found {len(matches)}")
    marker = matches[0]._p
    elements = []
    current = marker
    while current is not None:
        if current.tag == qn("w:p"):
            text = "".join(current.itertext())
            if current is not marker and (UPDATE_MARKER.split("{")[0] in text or MARKER in text):
                fail(f"amend target {ticket} crosses another guide marker")
            if text.startswith(("New feature: ", "Updated guidance: ")):
                return current, elements + [current]
        elements.append(current)
        current = current.getprevious()
    fail(f"amend target {ticket} has no generated heading")


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
    for number, step in enumerate(steps, start=1):
        # The baseline guide already contains numbered lists. A new Word list
        # otherwise continues that old sequence instead of starting at 1.
        paragraph = temporary.add_paragraph()
        run = paragraph.add_run(f"{number}. {step}")
        run.font.highlight_color = WD_COLOR_INDEX.YELLOW
        elements.append(paragraph._p)
    return elements


def yellow_screenshot(document: Document, image: Path, caption: str):
    # Add the image to the destination package, not a temporary document.
    # Copying its XML from another package leaves a dangling relationship ID.
    table = document.add_table(rows=1, cols=1)
    # Keep the caption with its screenshot instead of leaving it on another page.
    table.rows[0]._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))
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
    keep_figure_together(table)
    return table


def keep_figure_together(table: Table) -> None:
    """Keep the image/caption paragraphs together in Word as well as the row.

    Word PDF export can paginate paragraphs inside an otherwise non-splitting
    row. Explicit paragraph chaining prevents an orphaned caption; the final
    paragraph must not chain into the next figure or closing guide text.
    """
    for row in table.rows:
        properties = row._tr.get_or_add_trPr()
        if properties.find(qn("w:cantSplit")) is None:
            properties.append(OxmlElement("w:cantSplit"))
        for cell in row.cells:
            for index, paragraph in enumerate(cell.paragraphs):
                paragraph.paragraph_format.keep_together = True
                paragraph.paragraph_format.keep_with_next = index < len(cell.paragraphs) - 1


def validate_update(update: dict, ticket: str) -> None:
    if update.get("schema") != "v4-user-guide-update.v1":
        fail(f"{ticket} has an unsupported guide update schema")
    if update.get("ticket") != ticket:
        fail(f"{ticket} guide update names a different ticket")
    if update.get("changeType") not in {"add", "amend"}:
        fail(f"{ticket} has an invalid changeType")
    target = update.get("supersedesTicket")
    if update["changeType"] == "amend" and (not isinstance(target, str) or not KEY.fullmatch(target) or target == ticket):
        fail(f"{ticket} amend requires a distinct supersedesTicket")
    if update["changeType"] == "add" and target not in (None, ""):
        fail(f"{ticket} add must not supersede another ticket")
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
    captions = update.get("screenshotCaptions")
    if captions is not None and (not isinstance(captions, list) or len(captions) != len(screenshots)
                                or any(not isinstance(value, str) or not value.strip() for value in captions)):
        fail(f"{ticket} screenshotCaptions must describe every screenshot in order")


def screenshot_caption(update: dict, index: int) -> str:
    """Never guess a step/image association from unrelated array positions."""
    captions = update.get("screenshotCaptions")
    if captions is not None:
        return captions[index].strip()
    # Historical records have no caption metadata. Use an honest identifier
    # rather than claiming that image N proves step N.
    name = Path(update["screenshots"][index].replace("\\", "/")).name
    return f"Verified screenshot for {update['title'].strip()} ({name})"


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


def superseded_tickets(repo: Path) -> set[str]:
    targets = set()
    for base in (repo / "tickets", repo / "archive" / "tickets"):
        for record in base.glob("TEST2-*/guide-update.json"):
            update = read_json(record)
            if update.get("supersedesTicket"):
                targets.add(update["supersedesTicket"])
    return targets


def editorial_layout(document: Document, plan: dict) -> dict:
    """Place intact generated blocks beside the relevant manual chapter.

    Editorial retirement is explicit configuration, never a similarity guess.
    Original ticket records/screenshots remain available for audit. Markers of
    retained blocks stay intact, so subsequent amendments still work in place.
    Unknown section names retain their original location.
    """
    editorial = plan.get("editorial", {})
    retired = editorial.get("retiredUpdates", {})
    routes = editorial.get("sectionRoutes", [])
    captions = editorial.get("captionOverrides", {})
    if not isinstance(retired, dict) or not isinstance(routes, list):
        fail("editorial retirement and routes must be an object and array")
    for key, value in retired.items():
        if not KEY.fullmatch(key) or not isinstance(value, dict) or not value.get("reason"):
            fail("each retired update requires a valid key and editorial reason")
    moved, removed = [], []
    generated_tables = []
    for paragraph in list(document.paragraphs):
        match = re.fullmatch(r"\[\[AUTO_GUIDE_UPDATE:(TEST2-\d+)\]\]", paragraph.text.strip())
        if not match:
            continue
        ticket = match[1]
        heading, reverse_elements = superseded_block(document, ticket)
        elements = list(reversed(reverse_elements))
        if ticket in retired:
            replacement = retired[ticket].get("coveredBy")
            if not replacement or replacement in retired or not has_update(document, replacement):
                fail(f"cannot retire {ticket}: retained replacement {replacement} is not present")
            for element in elements:
                element.getparent().remove(element)
            removed.append(ticket)
            continue
        tables = [element for element in elements if element.tag == qn("w:tbl")]
        generated_tables.extend(tables)
        for element in elements:
            if element.tag != qn('w:p'):
                continue
            paragraph = Paragraph(element, document._body)
            if element.xpath('.//w:drawing') or paragraph.text.startswith('Figure '):
                paragraph.paragraph_format.keep_together = True
                paragraph.paragraph_format.keep_with_next = bool(element.xpath('.//w:drawing'))
        figure_captions = []
        for element in elements:
            if element.tag == qn('w:tbl'):
                figure_captions.append(Table(element, document._body).cell(0, 0).paragraphs[-1])
            elif element.tag == qn('w:p'):
                paragraph = Paragraph(element, document._body)
                if paragraph.text.startswith('Figure '):
                    figure_captions.append(paragraph)
        if ticket in captions:
            if not isinstance(captions[ticket], list) or len(captions[ticket]) != len(figure_captions):
                fail(f"editorial captions must match every screenshot for {ticket}")
            for index, (paragraph, caption) in enumerate(zip(figure_captions, captions[ticket]), 1):
                if not isinstance(caption, str) or not caption.strip():
                    fail(f"empty editorial caption for {ticket}")
                paragraph.clear()
                run = paragraph.add_run(f"Figure {index}: {caption}")
                run.font.highlight_color = WD_COLOR_INDEX.YELLOW
        # Keep short instructions together, but do not chain them into the
        # figure row: Word can otherwise insert a blank page when both move.
        intro = []
        for element in elements:
            if element.tag == qn("w:tbl") or element.xpath('.//w:drawing'):
                break
            if element.tag == qn("w:p"):
                intro.append(element)
        if sum(len("".join(p.itertext())) for p in intro) < 2200:
            for index, paragraph in enumerate(intro):
                paragraph.get_or_add_pPr().get_or_add_keepNext().val = index < len(intro) - 1
        for table in tables:
            # Also repair existing living-guide figures on idempotent builds.
            keep_figure_together(Table(table, document._body))
        # itertext includes duplicates in python-docx XML; use w:t nodes only.
        section = next(("".join(node.text or "" for node in element.iter(qn("w:t")))[9:]
                        for element in elements if element.tag == qn("w:p")
                        and "".join(node.text or "" for node in element.iter(qn("w:t"))).startswith("Section: ")), "")
        route = next((item for item in routes if any(section.casefold().startswith(prefix.casefold())
                       for prefix in item.get("prefixes", []))), None)
        if not route:
            continue
        anchors = [p for p in document.paragraphs if p.text == route.get("beforeHeading")]
        if len(anchors) != 1:
            fail(f"editorial destination must have one heading: {route.get('beforeHeading')}")
        # All destination checks happen before reparenting; never guess a chapter.
        for element in elements:
            anchors[0]._p.addprevious(element)
        heading.get_or_add_pPr().get_or_add_pStyle().val = "Heading2"
        for run in heading.iter(qn("w:r")):
            properties = run.get_or_add_rPr()
            properties.get_or_add_color().val = RGBColor(0, 0, 0)
        moved.append(ticket)
    if editorial.get("restartBaselineNumbering"):
        restart_baseline_numbering(document)
    # Word can merge adjacent one-cell figure tables and split their images.
    # Normalize only generated yellow figures to image/caption paragraphs.
    # Relationships remain in the same package and manual tables stay intact.
    for table_xml in generated_tables:
        table = Table(table_xml, document._body)
        if (len(table.rows) != 1 or len(table.columns) != 1
                or not table._tbl.xpath('.//w:drawing')
                or not table._tbl.xpath('.//w:shd[@w:fill="FFFF00"]')):
            continue
        paragraphs = table.cell(0, 0).paragraphs
        for index, paragraph in enumerate(paragraphs):
            paragraph.paragraph_format.keep_together = True
            paragraph.paragraph_format.keep_with_next = index < len(paragraphs) - 1
            shade = OxmlElement('w:shd')
            shade.set(qn('w:fill'), 'FFFF00')
            paragraph._p.get_or_add_pPr().append(shade)
            table._tbl.addprevious(copy.deepcopy(paragraph._p))
        table._tbl.getparent().remove(table._tbl)
    return {"moved": moved, "retired": removed}


def restart_baseline_numbering(document: Document) -> None:
    """Restart each manual numbered instruction list without changing its text."""
    numbering = document.part.numbering_part.element
    current = None
    for paragraph in document.paragraphs:
        if not paragraph.style.name.startswith("List Number"):
            current = None
            continue
        if current is None:
            source = paragraph.style.element.pPr.numPr.numId.val
            original = next(num for num in numbering.num_lst if num.numId == source)
            existing_id = paragraph._p.pPr.numPr.numId.val if paragraph._p.pPr is not None and paragraph._p.pPr.numPr is not None else None
            existing = next((num for num in numbering.num_lst if num.numId == existing_id), None)
            if (existing is not None and existing.abstractNumId.val == original.abstractNumId.val
                    and any(level.startOverride is not None and level.startOverride.val == 1 for level in existing.lvlOverride_lst)):
                current = existing
            else:
                current = numbering.add_num(original.abstractNumId.val)
                current.add_lvlOverride(0).add_startOverride(1)
        properties = paragraph._p.get_or_add_pPr().get_or_add_numPr()
        properties.get_or_add_ilvl().val = 0
        properties.get_or_add_numId().val = current.numId


def prune_unused_images(document: Document) -> None:
    """Drop orphaned body-image relationships after an amendment/retirement.

    Word packages otherwise retain screenshots from deleted generated blocks.
    Header/footer image relationships belong to separate parts and are untouched.
    """
    referenced = {node.get(qn(attribute)) for node in document._element.iter()
                  for attribute in ("r:embed", "r:link", "r:id") if node.get(qn(attribute))}
    for relationship_id, relationship in list(document.part.rels.items()):
        if relationship.reltype.endswith("/image") and relationship_id not in referenced:
            document.part.drop_rel(relationship_id)


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
    # The example baseline's closing note precedes the hidden marker. Keep
    # generated guidance before that note so the document still ends properly.
    anchor = next((p for p in document.paragraphs if p.text.startswith("End of example guide.")), marker)
    applied, skipped = [], []
    obsolete = superseded_tickets(repo) | set(plan.get("editorial", {}).get("retiredUpdates", {}))
    for ticket, update in updates:
        if ticket in obsolete:
            skipped.append(ticket)
            continue
        if has_update(document, ticket):
            skipped.append(ticket)
            continue
        old_elements = []
        if update["changeType"] == "amend":
            anchor_element, old_elements = superseded_block(document, update["supersedesTicket"])
        else:
            anchor_element = anchor._p
        label = "New feature" if update["changeType"] == "add" else "Updated guidance"
        anchor_proxy = type("Anchor", (), {"_p": anchor_element})()
        add_before(anchor_proxy, yellow_paragraph(f"{label}: {update['title'].strip()}", "Heading 1")._p)
        add_before(anchor_proxy, yellow_paragraph(f"Section: {update['affectedSection'].strip()}")._p)
        for paragraph in yellow_steps([step.strip() for step in update["steps"]]):
            add_before(anchor_proxy, paragraph)
        for index, relative in enumerate(update["screenshots"], start=1):
            image = screenshot_path(evidence_root, ticket, relative)
            caption = screenshot_caption(update, index - 1)
            table = yellow_screenshot(document, image, f"Figure {index}: {caption}")
            anchor_element.addprevious(table._tbl)
        identity = yellow_paragraph(UPDATE_MARKER.format(ticket=ticket), hidden=True)
        add_before(anchor_proxy, identity._p)
        for element in old_elements:
            element.getparent().remove(element)
        applied.append(ticket)
    set_hidden(marker)
    layout = editorial_layout(document, plan)
    prune_unused_images(document)
    document.save(output)
    return {"source": str(source.relative_to(repo)), "output": str(output.relative_to(repo)), "applied": applied, "skipped": skipped, "editorial": layout}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", default=".")
    parser.add_argument("--output")
    parser.add_argument("--evidence-root", default=os.environ.get("TEST2_EVIDENCE", str(Path.home() / "Documents" / "V4-QA-evidence")))
    parser.add_argument("--ticket", action="append", default=[])
    args = parser.parse_args()
    repo = Path(args.repo).resolve()
    plan = read_json(repo / "config" / "user-guide-plan.json")
    output = Path(args.output).resolve() if args.output else (repo / plan["publishedGuide"]).resolve()
    print(json.dumps(build(repo, output, Path(args.evidence_root), args.ticket), indent=2))


if __name__ == "__main__":
    main()
