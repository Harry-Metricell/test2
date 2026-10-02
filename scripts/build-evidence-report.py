"""Fill the approved TEST2 evidence-report template deterministically."""
import argparse
import json
import shutil
import zipfile
import hashlib
from datetime import datetime
from pathlib import Path
import re
import textwrap
from urllib.parse import urlsplit, urlunsplit

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
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


def add_image_row(table, exhibits, *, supporting=False):
    """Use equal-sized pairs, never shrink a third decisive capture to a thumbnail."""
    row = table.add_row()
    merged = row.cells[0]
    for cell in row.cells[1:]:
        merged = merged.merge(cell)
    merged.text = ""
    heading = merged.paragraphs[0]
    heading.paragraph_format.space_after = Pt(2)
    if not supporting:
        heading.add_run(f"Browser URL recorded after criterion: {exhibits[0][2]}")
        for run in heading.runs:
            run.font.size = Pt(8)
    grid = merged.add_table(rows=2 if len(exhibits) == 3 else 1,
                            cols=2 if len(exhibits) > 1 else 1)
    if len(exhibits) == 3:
        grid.cell(1, 0).merge(grid.cell(1, 1))
    for index, (evidence_id, image, _) in enumerate(exhibits):
        cell = grid.cell(index // 2, index % 2) if index < 2 else grid.cell(1, 0)
        caption = cell.paragraphs[0]
        caption.paragraph_format.space_after = Pt(2)
        caption.add_run(f"{evidence_id} - {image.name}").bold = True
        for run in caption.runs:
            run.font.size = Pt(7.5)
        picture = cell.add_paragraph()
        picture.alignment = WD_ALIGN_PARAGRAPH.CENTER
        picture.paragraph_format.space_after = Pt(0)
        with Image.open(image) as source:
            max_width = 3.65 if supporting else (4.5 if len(exhibits) > 1 else 6.8)
            max_height = 2.8 if len(exhibits) > 1 else 3.2
            width = min(max_width, max_height * source.width / source.height)
        picture.add_run().add_picture(str(image), width=Inches(width))
    merged.paragraphs[-1].paragraph_format.space_after = Pt(0)
    row._tr.get_or_add_trPr().append(OxmlElement("w:cantSplit"))


def supporting_captures(candidates, displayed, limit=2):
    """Choose a small, distinct setup appendix; retain all others locally."""
    selected = []
    seen = set(displayed)
    for image, browser_url in candidates:
        if not any(term in image.stem.lower() for term in ("after-open-gis", "before-load", "after-open-module")):
            continue
        digest = hashlib.sha256(image.read_bytes()).hexdigest()
        if digest in seen:
            continue
        seen.add(digest)
        selected.append((digest, image, browser_url))
        if len(selected) == limit:
            break
    return selected


def screenshot_paths(item, all_screenshots):
    names = item.get("evidence", []) if isinstance(item, dict) else []
    available = {image.name: image for image in all_screenshots}
    ordered = []
    for reference in names:
        name = Path(text(reference)).name
        if name not in available:
            raise SystemExit(f"referenced screenshot is missing: {name}")
        ordered.append(available[name])
    return ordered


def report_exhibits(images, criterion):
    """Keep decisive states in the PDF; retain every capture in local evidence.

    The reviewer still checks the full evidence list. This only selects the
    smaller, human-readable set of exhibits printed in the report.
    """
    if not images:
        return []
    # Tester captures after `final` are cleanup evidence, not proof of the
    # criterion's asserted state; keep them in the local attempt, not the PDF.
    final_index = next((index for index, image in enumerate(images)
                        if image.stem.lower().endswith("-final")), None)
    if final_index is not None:
        images = images[:final_index + 1]
    names = [image.stem.lower() for image in images]
    lower = criterion.lower()
    selected = []

    def add_matching(fragment):
        for image, name in zip(images, names):
            if fragment in name and image not in selected:
                selected.append(image)

    if "launcher" in lower or "starting from" in lower:
        add_matching("initial")
    if "load" in lower and "layer" in lower:
        add_matching("after-load")
    if "display settings" in lower and "open" in lower:
        add_matching("after-open-display-settings")
    if "toggle" in lower or "opposite state" in lower or "changing" in lower:
        add_matching("before-toggle")
        add_matching("after-toggle")
    if "restor" in lower:
        add_matching("before-restore")
        add_matching("after-restore")
    if "reopen" in lower:
        add_matching("before-close")
        add_matching("after-close")
        add_matching("after-reopen")
    if not selected:
        selected.append(images[0])
    if len(selected) == 1:
        add_matching("-final")
    if len(selected) == 1:
        for image in reversed(images):
            if image != selected[0]:
                selected.append(image)
                break
    # A tester may name the reopened/asserted state only `-final`. Always
    # include it, even when other named transition captures were selected.
    add_matching("-final")
    return selected


def remove_back_cover_spacers(cases):
    """Use one page-break-before, not a break plus a page of empty paragraphs."""
    following = cases._tbl.getnext()
    while following is not None and following.tag == qn("w:p"):
        if any(node.text for node in following.iter(qn("w:t"))) or next(
            following.iter(qn("w:drawing")), None
        ) is not None or next(following.iter(qn("w:pict")), None) is not None:
            break
        next_element = following.getnext()
        following.getparent().remove(following)
        following = next_element
    if following is not None and following.tag == qn("w:p"):
        properties = following.get_or_add_pPr()
        properties.append(OxmlElement("w:pageBreakBefore"))


def concise_review_reason(value):
    """Remove mechanical file/URL checks already shown elsewhere in the PDF."""
    reason = text(value).strip()
    reason = re.sub(r"\s*The result browserUrl is [^.]+\.metricell\.com/[^. ]+, an expected V4 host\.", "", reason)
    reason = re.sub(r"\s*All named criterion screenshots exist and are non-empty\.", "", reason)
    return reason.strip()


def formatted_steps(value):
    steps = [value] if isinstance(value, str) else [text(item) for item in value or []]
    cleaned = [step.strip().rstrip(".; ") for step in steps if step.strip()]
    return "; ".join(cleaned) + ("." if cleaned else "")


def source_urls(results):
    return list(dict.fromkeys(public_browser_url(item.get("browserUrl"))
                              for item in results if isinstance(item, dict) and item.get("browserUrl")))


def public_browser_url(value):
    """Keep a traceable page URL without publishing query tokens or fragments."""
    parsed = urlsplit(text(value).strip())
    if parsed.scheme not in ("http", "https") or not parsed.hostname:
        return "Not recorded"
    host = parsed.hostname
    if ":" in host:
        host = f"[{host}]"
    try:
        if parsed.port:
            host += f":{parsed.port}"
    except ValueError:
        return "Not recorded"
    return urlunsplit((parsed.scheme, host, parsed.path, "", ""))


def report_limitations(review, outcomes, results):
    blocked = sum(text(item.get("outcome")).lower() == "blocked" for item in outcomes)
    unverified = sum(text(item.get("outcome")).lower() == "unverified" for item in outcomes)
    parts = []
    if blocked or unverified:
        parts.append(f"{blocked} blocked; {unverified} inconclusive criterion(s).")
        summary_reason = text(review.get("reason")).strip()
        reasons = [summary_reason] if summary_reason else [
            text(item.get("reason")).strip() for item in outcomes
            if text(item.get("outcome")).lower() == "blocked"
        ]
        parts.extend(list(dict.fromkeys(reason for reason in reasons if reason))[:3])
    if any(public_browser_url(item.get("browserUrl")) == "Not recorded"
           for item in results if isinstance(item, dict)):
        parts.append("Some source URLs were not recorded.")
    return " ".join(parts) if parts else "No testing limitations recorded."


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


def image_fingerprint(image):
    grayscale = image.convert("L").resize((17, 16), Image.Resampling.LANCZOS)
    pixels = list(grayscale.get_flattened_data())
    bits = "".join(
        "1" if pixels[row * 17 + column] > pixels[row * 17 + column + 1] else "0"
        for row in range(16)
        for column in range(16)
    )
    return f"{int(bits, 2):064x}"


def evidence_identity(image_path):
    image_path = Path(image_path)
    with Image.open(image_path) as image:
        return {"file": image_path.name, "sourceSha256": hashlib.sha256(image_path.read_bytes()).hexdigest(), "visualFingerprint": image_fingerprint(image)}


def unique_evidence_identities(logical):
    """Return one physical identity for each byte-identical source image."""
    expected = []
    seen = set()
    for item in logical:
        identity = item["sourceSha256"]
        if identity not in seen:
            seen.add(identity)
            expected.append(item)
    return expected


def evidence_manifest(images):
    """Describe logical evidence references and the unique images Word embeds.

    python-docx/Word stores byte-identical images once even when several
    criterion rows reference them.  The PDF verifier must therefore check the
    unique physical images, while the logical list preserves the complete
    criterion-level audit trail.
    """
    logical = [evidence_identity(image) for image in images]
    return {"expectedEvidence": unique_evidence_identities(logical), "logicalEvidence": logical}


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
    no_evidence_block = (
        text(review.get("overallOutcome")) == "Blocked"
        and len(results) == len(outcomes)
        and all(item.get("outcome") == "Blocked" and text(item.get("reason")).strip() for item in outcomes)
        and all(item.get("outcome") == "Blocked" and item.get("evidence") == []
                and text(item.get("reason")).strip() for item in results)
    )
    if not screenshots and not no_evidence_block:
        raise SystemExit("at least one screenshot is required")

    # Preserve the template's layout, branding, footer and table structure.
    for paragraph in doc.paragraphs:
        if paragraph.text.strip() == "Test Example":
            for run in paragraph.runs:
                run.text = run.text.replace("Test Example", f"{ticket} Evidence Review")
        if paragraph.text.startswith("All automated tests must map to an approved criterion"):
            paragraph.text = "Each test maps to a criterion and decisive browser evidence. Inconclusive results are reported as Failed."
        if paragraph.text.strip() == "Test Cases":
            # The template has a page-break paragraph immediately before this
            # heading. When the summary finishes near the page bottom, Word
            # moves that paragraph first and creates an otherwise empty page.
            previous = paragraph._p.getprevious()
            if previous is not None and previous.tag == qn("w:p") and any(
                node.get(qn("w:type")) == "page" for node in previous.iter(qn("w:br"))
            ):
                previous.getparent().remove(previous)
            paragraph.paragraph_format.page_break_before = False

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
    limitations = report_limitations(review, outcomes, results)
    if no_evidence_block:
        limitations = "No browser evidence was captured; testing could not be completed. " + limitations
    urls = source_urls(results)
    displayed_outcome = "Failed (inconclusive evidence)" if text(review.get("overallOutcome")).lower() == "unverified" else text(review.get("overallOutcome"))
    values = ["Automated", ticket, "Chrome", f"Chrome {browser_version}", datetime.now().strftime("%d/%m/%Y"), limitations]
    for index, value in enumerate(values):
        if index < len(cycle.rows): set_cell(cycle.cell(index, 1), value)
    for label, value in (
        ("Overall review outcome:", displayed_outcome),
        ("Browser URL(s) recorded after criteria:", "; ".join(urls) or "Not recorded"),
    ):
        row = cycle.add_row().cells
        set_cell(row[0], label)
        set_cell(row[1], value)

    summary = doc.tables[3]
    while len(summary.rows) > 1:
        summary._tbl.remove(summary.rows[-1]._tr)
    for index, item in enumerate(outcomes, 1):
        row = summary.add_row().cells
        raw_outcome = text(item.get("outcome")).lower()
        # The complete criterion remains in the test-case table. A short label
        # keeps the four-row overview together instead of orphaning its last row.
        label = textwrap.shorten(display_criterion(item.get("criterion"), criteria), width=48, placeholder="...")
        set_cell(row[0], f"{index}. {label}")
        set_cell(row[1], "Y" if raw_outcome == "passed" else "N")
        set_cell(row[2], "Y" if raw_outcome in ("failed", "unverified") else "N")
        set_cell(row[3], "1" if raw_outcome in ("failed", "unverified") else "0")

    context = doc.tables[4]
    context_values = [
        "V4 access and ticket conditions.",
        "Ticket criteria below.",
        "Screenshots below each criterion; full log retained locally.",
    ]
    if context.rows:
        for cell_index, value in ((1, context_values[0]), (3, context_values[1]), (5, context_values[2])):
            if cell_index < len(context.rows[0].cells):
                set_cell(context.cell(0, cell_index), value)

    cases = doc.tables[5]
    # The template carries several empty spacer paragraphs between the context
    # and the test table; they can strand the first criterion on the next page.
    following = context._tbl.getnext()
    while following is not None and following is not cases._tbl:
        next_element = following.getnext()
        if following.tag != qn("w:p") or any(node.text for node in following.iter(qn("w:t"))) or any(following.iter(qn("w:br"))):
            break
        following.getparent().remove(following)
        following = next_element
    remove_rows(cases)
    column_count = len(cases.columns)
    if column_count not in (5, 6):
        raise SystemExit(f"template case table must have five or six columns, found {column_count}")
    logical_images = []
    unique_images = {}
    captions = []
    setup_candidates = []
    for number, item in enumerate(outcomes, 1):
        criterion_id = text(item.get("criterion"))
        criterion = display_criterion(criterion_id, criteria)
        result = result_for_outcome(item, results, result_by_criterion, criteria, number - 1)
        row = cases.add_row().cells
        steps = formatted_steps(result.get("steps_taken", []))
        actual = text(result.get("actual_result")) or concise_review_reason(item.get("reason")) or text(result.get("reason"))
        all_criterion_images = screenshot_paths(result, screenshots)
        if not all_criterion_images and text(result.get("outcome")).lower() != "blocked":
            raise SystemExit(f"criterion {number} has no embeddable screenshot evidence")
        criterion_images = report_exhibits(all_criterion_images, criterion)
        setup_candidates.extend((image, public_browser_url(result.get("browserUrl")))
                                for image in all_criterion_images if image not in criterion_images)
        evidence_ids = []
        exhibits = []
        for image in criterion_images:
            digest = hashlib.sha256(image.read_bytes()).hexdigest()
            if digest not in unique_images:
                unique_images[digest] = (f"E{len(unique_images) + 1:02d}", image, public_browser_url(result.get("browserUrl")))
            evidence_ids.append(unique_images[digest][0])
            # Share the physical image/ID, never another criterion's caption.
            exhibit = (unique_images[digest][0], image, public_browser_url(result.get("browserUrl")))
            if not any(hashlib.sha256(entry[1].read_bytes()).hexdigest() == digest for entry in exhibits) or image.stem.lower().endswith("-final"):
                exhibits.append(exhibit)
                captions.append(f"{exhibit[0]} - {image.name}")
            logical_images.append(image)
        trace = f"Evidence: {', '.join(dict.fromkeys(evidence_ids)) if evidence_ids else 'Unavailable'}"
        if not exhibits:
            trace += f"\nBrowser URL recorded after criterion: {public_browser_url(result.get('browserUrl'))}"
        actual += f"\n{trace}"
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
                steps,
                expected_result,
                f"{concise_review_reason(item.get('reason')) or text(result.get('reason'))}\n{trace}",
                report_outcome,
            ]
        for index, value in enumerate(values):
            set_cell(row[index], value)
        if exhibits:
            for cell in row:
                for paragraph in cell.paragraphs:
                    paragraph.paragraph_format.keep_with_next = True
            for start in range(0, len(exhibits), 2):
                add_image_row(cases, exhibits[start:start + 2])

    setup = supporting_captures(setup_candidates, unique_images)
    if setup:
        heading = cases.add_row().cells
        heading[0].merge(heading[-1]).text = "Supporting setup captures - full attempt evidence remains in the local evidence folder"
        heading[0].paragraphs[0].paragraph_format.keep_with_next = True
        appendix = []
        for digest, image, browser_url in setup:
            exhibit = (f"E{len(unique_images) + 1:02d}", image, browser_url)
            unique_images[digest] = exhibit
            appendix.append(exhibit)
            captions.append(f"{exhibit[0]} - {image.name}")
            logical_images.append(image)
        for start in range(0, len(appendix), 2):
            add_image_row(cases, appendix[start:start + 2], supporting=True)

    remove_back_cover_spacers(cases)
    doc.save(str(output))
    patch_package_text(output, {"[Ticket ID]": ticket, "Test Example": f"{ticket} Evidence Review", "[Version]": "1.0", "[dd/mm/yyyy]": datetime.now().strftime("%d/%m/%Y"), "[Author]": "TEST2 QA Automation", "[Initial automated-test template]": "Generated from TEST2 evidence review"})
    embedded_count = verify_embedded_images(output, logical_images)
    manifest = evidence_manifest(logical_images)
    Path(args.image_manifest).write_text(json.dumps({
        "embeddedEvidenceImages": embedded_count,
        "noEvidenceBlock": {
            "reviewOutcomes": [item["outcome"] for item in outcomes],
            "testerOutcomes": [item["outcome"] for item in results],
            "reasons": [item["reason"] for item in results],
        } if not logical_images and no_evidence_block else None,
        "reportContent": {
            "overallOutcome": displayed_outcome,
            "limitations": limitations,
            "sourceUrls": urls or ["Not recorded"],
            "evidenceCaptions": list(dict.fromkeys(captions)),
        },
        **manifest,
    }, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()





