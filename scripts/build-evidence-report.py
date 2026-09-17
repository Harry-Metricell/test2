"""Fill the approved TEST2 evidence-report template deterministically."""
import argparse
import json
import shutil
import zipfile
import hashlib
from datetime import datetime
from pathlib import Path
import re

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from PIL import Image


def text(value):
    return "" if value is None else str(value)


def set_cell(cell, value):
    cell.text = text(value)
    for paragraph in cell.paragraphs:
        for run in paragraph.runs:
            run.font.size = Pt(9)


def remove_rows(table):
    while len(table.rows) > 1:
        table._tbl.remove(table.rows[-1]._tr)


def add_image_row(table, images):
    row = table.add_row()
    merged = row.cells[0]
    for cell in row.cells[1:]:
        merged = merged.merge(cell)
    merged.text = ""
    paragraph = merged.paragraphs[0]
    for image in images:
        run = paragraph.add_run()
        run.add_picture(str(image), width=Inches(4.0))
        paragraph.add_run("  ")


def screenshot_paths(item, all_screenshots):
    names = item.get("evidence", []) if isinstance(item, dict) else []
    wanted = {Path(text(name)).name for name in names}
    return [image for image in all_screenshots if image.name in wanted]


def result_for_outcome(outcome, results, result_by_criterion, criteria, position):
    """Match a reviewer outcome to its tester result without dropping evidence.

    Reviewers normally return the complete criterion text, while tester output
    normally uses its ordinal number. Both sources are ordered against the
    canonical criteria, so the ordinal fallback is safe only after the exact
    text forms have been attempted.
    """
    criterion_id = text(outcome.get("criterion"))
    criterion = display_criterion(criterion_id, criteria)
    exact = result_by_criterion.get(criterion_id) or result_by_criterion.get(criterion)
    if exact:
        return exact
    if position < len(results) and isinstance(results[position], dict):
        return results[position]
    raise SystemExit(f"review criterion {position + 1} has no matching tester result")


def verify_embedded_images(docx_path, expected_images):
    """Prove each referenced PNG was added to the DOCX, not merely available."""
    expected = {hashlib.sha256(Path(image).read_bytes()).hexdigest() for image in expected_images}
    with zipfile.ZipFile(docx_path) as package:
        embedded = {
            hashlib.sha256(package.read(name)).hexdigest()
            for name in package.namelist()
            if name.startswith("word/media/")
        }
    missing = expected - embedded
    if missing:
        raise SystemExit(f"generated DOCX is missing {len(missing)} referenced screenshot image(s)")
    return len(expected)


def image_size(image_path):
    with Image.open(image_path) as image:
        return image.size


def outcome_text(outcome):
    return {
        "passed": "Criterion is satisfied with direct screenshot evidence.",
        "failed": "Direct screenshot evidence contradicts the criterion.",
        "unverified": "Evidence was inconclusive; reported as Failed for this report.",
        "blocked": "The criterion could not be decided because required evidence or the test environment was unavailable.",
    }.get(text(outcome).lower(), "The criterion outcome was recorded from the evidence review.")


def criteria_from_markdown(path):
    """Return the ordered human-readable criteria from canonical criteria.md."""
    values = []
    for line in Path(path).read_text(encoding="utf-8").splitlines():
        match = re.match(r"^\s*-\s*\[[ xX]\]\s+(.+?)\s*$", line)
        if match:
            values.append(match.group(1))
    return values


def display_criterion(value, criteria):
    """Resolve numeric reviewer IDs back to their canonical criterion text."""
    raw = text(value).strip()
    if raw.isdigit():
        index = int(raw) - 1
        if 0 <= index < len(criteria):
            return criteria[index]
    return raw


def patch_package_text(path, replacements):
    temp = path.with_suffix(".patched.docx")
    with zipfile.ZipFile(path, "r") as source, zipfile.ZipFile(temp, "w", zipfile.ZIP_DEFLATED) as target:
        for item in source.infolist():
            data = source.read(item.filename)
            for old, new in replacements.items():
                data = data.replace(old.encode("utf-8"), new.encode("utf-8"))
            target.writestr(item, data)
    temp.replace(path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", required=True)
    parser.add_argument("--review-output", required=True)
    parser.add_argument("--criteria", required=True)
    parser.add_argument("--results", required=True)
    parser.add_argument("--screenshots", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--image-manifest", required=True)
    args = parser.parse_args()

    template = Path(args.template)
    output = Path(args.output)
    review = json.loads(Path(args.review_output).read_text(encoding="utf-8"))
    results = json.loads(Path(args.results).read_text(encoding="utf-8"))
    criteria = criteria_from_markdown(args.criteria)
    ticket = text(review.get("ticket"))
    if not ticket.startswith("TEST2-"):
        raise SystemExit("review-output has an invalid TEST2 ticket")
    outcomes = review.get("criterionOutcomes")
    if not isinstance(outcomes, list) or not outcomes:
        raise SystemExit("review-output has no criterionOutcomes")
    if not template.is_file():
        raise SystemExit(f"template not found: {template}")

    output.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(template, output)
    doc = Document(str(output))
    if len(doc.tables) < 6:
        raise SystemExit("template does not contain the expected six tables")

    result_by_criterion = {text(item.get("criterion")): item for item in results if isinstance(item, dict)}
    screenshots = sorted(Path(args.screenshots).glob("*.png"))
    if not screenshots:
        raise SystemExit("at least one screenshot is required")

    # Preserve the template's layout, branding, footer and table structure.
    for paragraph in doc.paragraphs:
        if paragraph.text.strip() == "Test Example":
            for run in paragraph.runs:
                run.text = run.text.replace("Test Example", f"{ticket} Evidence Review")

    metadata = doc.tables[0]
    if len(metadata.rows) >= 5:
        set_cell(metadata.cell(3, 1), datetime.now().strftime("%d/%m/%Y"))
        set_cell(metadata.cell(4, 1), "Automated TEST2 Evidence Review")
    for row in metadata.rows:
        for cell in row.cells:
            for paragraph in cell.paragraphs:
                for run in paragraph.runs:
                    run.font.color.rgb = RGBColor(255, 255, 255)

    cycle = doc.tables[2]
    browser_version = next((text(item.get("browserVersion")) for item in results if isinstance(item, dict) and item.get("browserVersion")), "version not recorded")
    values = ["Automated", ticket, "Chrome", f"Chrome {browser_version}", datetime.now().strftime("%d/%m/%Y"), "None recorded"]
    for index, value in enumerate(values):
        if index < len(cycle.rows): set_cell(cycle.cell(index, 1), value)

    summary = doc.tables[3]
    passed = sum(text(item.get("outcome")).lower() == "passed" for item in outcomes)
    failed = sum(text(item.get("outcome")).lower() in ("failed", "unverified") for item in outcomes)
    while len(summary.rows) > 1:
        summary._tbl.remove(summary.rows[-1]._tr)
    for index, item in enumerate(outcomes, 1):
        row = summary.add_row().cells
        raw_outcome = text(item.get("outcome")).lower()
        set_cell(row[0], f"{index}. {display_criterion(item.get('criterion'), criteria)}")
        set_cell(row[1], "Y" if raw_outcome == "passed" else "N")
        set_cell(row[2], "Y" if raw_outcome in ("failed", "unverified") else "N")
        set_cell(row[3], "1" if raw_outcome in ("failed", "unverified") else "0")

    context = doc.tables[4]
    context_values = [
        "Not recorded in agent output.",
        "Criteria from criteria.md.",
        "Automated browser run; PNG evidence reviewed.",
    ]
    if context.rows:
        for cell_index, value in ((1, context_values[0]), (3, context_values[1]), (5, context_values[2])):
            if cell_index < len(context.rows[0].cells):
                set_cell(context.cell(0, cell_index), value)

    cases = doc.tables[5]
    remove_rows(cases)
    column_count = len(cases.columns)
    if column_count not in (5, 6):
        raise SystemExit(f"template case table must have five or six columns, found {column_count}")
    embedded_images = []
    for number, item in enumerate(outcomes, 1):
        criterion_id = text(item.get("criterion"))
        criterion = display_criterion(criterion_id, criteria)
        result = result_for_outcome(item, results, result_by_criterion, criteria, number - 1)
        row = cases.add_row().cells
        steps_value = result.get("steps_taken", [])
        steps = [steps_value] if isinstance(steps_value, str) else [text(x) for x in steps_value]
        actual = text(result.get("actual_result")) or text(item.get("reason")) or text(result.get("reason"))
        if steps:
            actual = f"{actual}\nSteps taken: {'; '.join(steps)}"
        report_outcome = "Failed" if text(item.get("outcome")).lower() == "unverified" else text(item.get("outcome"))
        expected_result = text(result.get("expected_result")) or criterion
        values = [
            f"{number}.0.0",
            criterion,
            expected_result,
            actual,
            report_outcome,
        ]
        if column_count == 6:
            values = [
                f"{number}.0.0",
                criterion,
                "; ".join(steps),
                expected_result,
                text(item.get("reason")) or text(result.get("reason")),
                report_outcome,
            ]
        for index, value in enumerate(values):
            set_cell(row[index], value)
        criterion_images = screenshot_paths(result, screenshots)
        if not criterion_images and text(result.get("outcome")).lower() != "blocked":
            raise SystemExit(f"criterion {number} has no embeddable screenshot evidence")
        for image in criterion_images:
            add_image_row(cases, [image])
            embedded_images.append(image)

    doc.save(str(output))
    patch_package_text(output, {"[Ticket ID]": ticket, "Test Example": f"{ticket} Evidence Review", "[Version]": "1.0", "[dd/mm/yyyy]": datetime.now().strftime("%d/%m/%Y"), "[Author]": "TEST2 QA Automation", "[Initial automated-test template]": "Generated from TEST2 evidence review"})
    embedded_count = verify_embedded_images(output, embedded_images)
    Path(args.image_manifest).write_text(json.dumps({
        "embeddedEvidenceImages": embedded_count,
        "embeddedFiles": [image.name for image in embedded_images],
        "embeddedImageSizes": [list(size) for size in sorted({image_size(image) for image in embedded_images})],
    }, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()





