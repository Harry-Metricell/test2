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
from PIL import Image, ImageChops


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


def evidence_caption(image):
    """Describe the recorded state; retain the filename for the audit trail."""
    state = re.sub(r"^criterion-\d+-", "", image.stem).replace("-", " ")
    return f"{state.capitalize()} ({image.name})"


def localized_change_region(images):
    """Enlarge a small before/after change, without guessing where a UI lives.

    Broad changes (navigation, a dimmed map, a whole dialog) have no safe focus
    region. In that case the report shows the complete source screenshots only.
    """
    # Only compare the captures displayed in this row. A region discovered in
    # a later toggle must never be applied to an earlier setup/map screenshot.
    by_name = {image.name: image for image in images}
    for before in images:
        if "-before-" not in before.name:
            continue
        after = by_name.get(before.name.replace("-before-", "-after-", 1))
        if after is None and len(images) == 2 and images[-1].stem.lower().endswith("-final"):
            # Exact-state deduplication may retain `final` instead of `after`.
            # Comparing this row's actual pixels remains the safety gate.
            after = images[-1]
        if after is None:
            continue
        with Image.open(before) as left, Image.open(after) as right:
            if left.size != right.size:
                continue
            difference = ImageChops.difference(left.convert("RGB"), right.convert("RGB"))
            channels = difference.split()
            mask = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2]).point(lambda pixel: 255 if pixel >= 64 else 0)
            box = mask.getbbox()
            width, height = left.size
            if box is None or (box[2] - box[0]) < 8 or (box[3] - box[1]) < 8:
                continue
            if (box[2] - box[0]) * (box[3] - box[1]) > width * height * 0.12:
                continue
            # Include nearby labels and surrounding context, not just a pixel.
            x1, y1, x2, y2 = box
            return (max(0, x1 - 80), max(0, y1 - 60), min(width, max(x2 + 80, x1 + 380)), min(height, max(y2 + 60, y1 + 220)))
    return None


def add_image_row(table, exhibits, *, supporting=False, criterion_label="", focus_region=None):
    """Use readable pairs plus explicitly labelled, lossless Word detail views."""
    if not 1 <= len(exhibits) <= 2:
        raise ValueError("an evidence row requires one or two captures")
    row = table.add_row()
    merged = row.cells[0]
    for cell in row.cells[1:]:
        merged = merged.merge(cell)
    merged.text = ""
    heading = merged.paragraphs[0]
    heading.paragraph_format.space_after = Pt(2)
    if not supporting:
        if criterion_label:
            heading.add_run(criterion_label + "\n").bold = True
        heading.add_run(f"Browser URL recorded after criterion: {exhibits[0][2]}")
        for run in heading.runs:
            run.font.size = Pt(8)
    grid = merged.add_table(rows=2 if focus_region else 1, cols=len(exhibits))
    for index, (evidence_id, image, _) in enumerate(exhibits):
        cell = grid.cell(0, index)
        caption = cell.paragraphs[0]
        caption.paragraph_format.space_after = Pt(2)
        caption.add_run(f"{evidence_id} - {evidence_caption(image)}").bold = True
        for run in caption.runs:
            run.font.size = Pt(7.5)
        picture = cell.add_paragraph()
        picture.alignment = WD_ALIGN_PARAGRAPH.CENTER
        picture.paragraph_format.space_after = Pt(0)
        with Image.open(image) as source:
            max_width = 3.65 if supporting else (4.7 if len(exhibits) > 1 else 7.4)
            max_height = 2.1 if supporting else (2.25 if len(exhibits) > 1 else 3.2)
            width = min(max_width, max_height * source.width / source.height)
        picture.add_run().add_picture(str(image), width=Inches(width))
        picture.paragraph_format.keep_with_next = False
        if focus_region and not supporting:
            detail = grid.cell(1, index)
            detail.paragraphs[0].text = f"{evidence_id} detail enlargement - full screenshot above"
            for run in detail.paragraphs[0].runs:
                run.font.size = Pt(8)
            x1, y1, x2, y2 = focus_region
            with Image.open(image) as source:
                source_width, source_height = source.size
            detail_width = min(4.7 if len(exhibits) > 1 else 7.4, 1.65 * (x2 - x1) / (y2 - y1))
            shape = detail.add_paragraph().add_run().add_picture(str(image), width=Inches(detail_width), height=Inches(detail_width * (y2 - y1) / (x2 - x1)))
            # A Word display crop preserves the original embedded PNG bytes.
            # It supplements, never replaces, the verified full-context image.
            crop = OxmlElement("a:srcRect")
            for attribute, value in (("l", x1 / source_width), ("t", y1 / source_height), ("r", 1 - x2 / source_width), ("b", 1 - y2 / source_height)):
                crop.set(attribute, str(round(value * 100000)))
            fill = shape._inline.graphic.graphicData.pic.blipFill
            fill.insert(1, crop)
            detail.paragraphs[-1].paragraph_format.space_after = Pt(0)
            detail.paragraphs[-1].paragraph_format.keep_with_next = False
    merged.paragraphs[-1].paragraph_format.space_after = Pt(0)
    merged.paragraphs[-1].paragraph_format.keep_with_next = False
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
    # A completed recovery supersedes the unsuccessful interaction. Keep its
    # criterion-owned states, not the old final or post-final cleanup captures.
    recovered = {image.stem.lower().removesuffix("-recovered") for image in images
                 if image.stem.lower().endswith("-recovered")}
    images = [image for image in images if image.stem.lower() not in recovered]
    final_index = next((index for index, image in enumerate(images)
                        if re.search(r"-final(?:-recovered)?$", image.stem.lower())), None)
    if final_index is not None:
        images = images[:final_index + 1]
    lower = criterion.lower()
    # Omit only known setup, rather than guessing the decisive action from a
    # narrow vocabulary. Unknown names remain visible: compactness must never
    # silently discard a before/after state that the reviewer used to pass.
    setup_terms = ("after-open-gis", "before-load", "after-open-module",
                   "before-add", "after-add-dialog", "before-confirm-add")
    # Setup is supporting context, not the decisive UI state. A default-
    # configuration claim needs the configured dialog, not every loading step.
    needs_setup = bool(re.search(r"\bdefaults?\b", lower))
    checks_configuration = needs_setup or bool(re.search(r"\b(configuration|configure|dialog)\b", lower))
    names = [image.stem.lower() for image in images]
    checks_baseline = bool(re.search(r"\b(baseline|unchanged|matches|list|empty|initial|original)\b", lower))
    selected = []
    for image in images:
        name = image.stem.lower()
        if any(term in name for term in ("cleanup", "after-clean")):
            continue
        if name.endswith("-initial") and not any(term in lower for term in ("launcher", "starting from")):
            continue
        if any(term in name for term in setup_terms):
            if not (needs_setup and any(term in name for term in ("after-add-dialog", "before-confirm-add"))):
                continue
        if any(term in name for term in ("after-add-surveyor", "before-confirm-defaults")) and not needs_setup:
            continue
        if "after-open-layer-dialog" in name and not checks_configuration:
            continue
        # Loading a layer is setup for its settings/control checks. Preserve
        # it for layer-loading assertions and unfamiliar action names.
        if "after-add-layer" in name and not needs_setup and ("display settings" in lower or any("before-toggle" in other for other in names)):
            continue
        # A configured dialog is a stronger setup baseline than the preceding
        # empty map. Likewise the open-panel state supersedes before-opening it
        # for a close/reopen comparison. Keep all actual transition endpoints.
        if "before-add" in name and any("after-add-dialog" in other for other in names):
            continue
        if "before-open" in name and any("before-close" in other for other in names):
            continue
        if "before-open" in name and any("after-open" in other and "gis" not in other for other in names):
            continue
        # A Cancel assertion needs the open dialog and returned map, not a
        # redundant map capture preceding opening. Preserve list baselines.
        if "before-open" in name and not checks_baseline and "cancel" in lower and any("before-cancel" in other for other in names):
            continue
        # Back navigation starts at the destination, not its earlier launcher
        # setup. Keep destination-before-Back and returned-launcher evidence.
        if name.endswith("-initial") and "browser back" in lower and any("before-back" in other for other in names):
            continue
        if "after-confirm" in name and any("after-open-display-settings" in other for other in names):
            continue
        if "after-add-" in name and any("before-confirm" in other for other in names):
            continue
        if "after-open-display-settings" in name and any("before-toggle" in other for other in names):
            continue
        if "before-close" in name and any("after-toggle" in other for other in names):
            continue
        # Prefer the settled baseline immediately before reopening. A capture
        # taken immediately after a close action can still show its animation.
        if "after-close" in name and any("before-reopen" in other for other in names):
            continue
        if "after-reopen" in name and names[-1].endswith("-final"):
            continue
        if "after-close" in name and names[-1].endswith("-final") and "reopen" not in lower and not any("reopen" in other for other in names):
            continue
        if "after-open-display-settings" in name and names[-1].endswith("-final") and not any("toggle" in other or "close" in other for other in names):
            continue
        selected.append(image)
    # A launcher-only/legacy attempt still needs its available evidence printed,
    # but cleanup must never become proof through the fallback path.
    if selected:
        return distinct_states(selected)
    available = [image for image in images if not any(term in image.stem.lower()
                 for term in ("cleanup", "after-clean"))]
    if not available:
        raise SystemExit("criterion has only cleanup screenshots, not test evidence")
    return available


def distinct_states(images):
    """Remove exact pixel duplicates within this criterion only.

    Never use perceptual similarity: even a single changed checkbox pixel may
    be decisive evidence. Missing paths in selection-only tests stay distinct.
    Collapse adjacent identical states only. A later return to an earlier state
    must remain visible when an intervening change is part of the proof.
    """
    keyed = []
    for image in images:
        if image.is_file():
            with Image.open(image) as source:
                rgb = source.convert("RGB")
                key = (rgb.size, hashlib.sha256(rgb.tobytes()).hexdigest())
        else:
            key = str(image)
        keyed.append((key, image))
    selected = []
    for key, image in keyed:
        if selected and selected[-1][0] == key:
            selected[-1] = (key, image)
        else:
            selected.append((key, image))
    return [image for _, image in selected]


def make_body_headings_visible(document):
    """Correct white-on-white template headings without changing branded covers."""
    document.styles["Heading 1"].font.color.rgb = RGBColor(0, 0, 0)
    for paragraph in document.paragraphs:
        if paragraph.style.name.startswith("Heading") and paragraph.text.strip():
            color = RGBColor(255, 255, 255) if paragraph.text.strip() == "About Metricell" else RGBColor(0, 0, 0)
            for run in paragraph.runs:
                run.font.color.rgb = color
                run.font.hidden = False


def browser_details(results):
    """Report observed identity only; never label an unknown browser Chrome."""
    identities = []
    for item in results:
        name = text(item.get("browserName")).strip()
        version = text(item.get("browserVersion")).strip()
        identity = " ".join(part for part in (name, version) if part)
        if identity and identity not in identities:
            identities.append(identity)
    return "; ".join(identities) or "Browser name/version not recorded"


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
    if any(not item.get("browserVersion") for item in results if isinstance(item, dict)):
        parts.append("Browser version was not recorded for some criteria.")
    # Passed criteria can still have recovered automation or cleanup problems.
    # Preserve source wording rather than turning a tool timeout into a defect.
    notes = []
    signal = re.compile(r"timeout|timed out|recover|reappear|\berror\b|\bfail(?:ed|ure)?\b|unavailable|denied|could not|unable", re.I)
    for number, result in enumerate(results, 1):
        reason = text(result.get("reason"))
        steps = [result.get("steps_taken")] if isinstance(result.get("steps_taken"), str) else result.get("steps_taken", [])
        values = [reason] if signal.search(reason) else steps
        for value in values:
            note = text(value).strip()
            affirmative = re.sub(r"\b(?:no|without) (?:application )?(?:error|failure|timeout)s?\b", "", note, flags=re.I)
            if signal.search(affirmative):
                if note not in notes:
                    notes.append(note)
                    parts.append(f"Criterion {number}: {note}")
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


def confirmed_defect_count(outcome):
    """Count direct reviewed contradictions, never evidence gaps or blockers.

    The review contract reserves Failed for direct contradiction and Unverified
    for inconclusive evidence. The PDF displays both as Failed, but that display
    mapping must not turn an evidence gap into a confirmed application defect.
    Counts are criterion failures, not a deduplicated number of Jira bugs.
    """
    return int(text(outcome).lower() == "failed")


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
    make_body_headings_visible(doc)
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
    limitations = report_limitations(review, outcomes, results)
    if any(text(item.get("outcome")).lower() == "unverified" for item in outcomes):
        limitations += " Inconclusive evidence is reported as Failed, but is not a confirmed application defect."
    limitations += " Defects (No.) counts directly contradicted criteria, not unique Jira bugs; blockers and inconclusive evidence count as zero."
    if no_evidence_block:
        limitations = "No browser evidence was captured; testing could not be completed. " + limitations
    urls = source_urls(results)
    displayed_outcome = "Failed (inconclusive evidence)" if text(review.get("overallOutcome")).lower() == "unverified" else text(review.get("overallOutcome"))
    environment = "; ".join(dict.fromkeys(urlsplit(url).hostname for url in urls
                                           if urlsplit(url).hostname)) or "Not recorded"
    values = ["Automated", ticket, environment, browser_details(results), datetime.now().strftime("%d/%m/%Y"), limitations]
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
        set_cell(row[3], str(confirmed_defect_count(raw_outcome)))

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
            # A restored state can reuse the original bytes but must still be
            # shown after its intervening change. Physical IDs stay shared.
            exhibits.append(exhibit)
            captions.append(f"{exhibit[0]} - {evidence_caption(image)}")
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
                label = f"Criterion {number}" + (" continued" if start else " evidence") + f": {criterion}"
                row_exhibits = exhibits[start:start + 2]
                focus = localized_change_region([exhibit[1] for exhibit in row_exhibits])
                add_image_row(cases, row_exhibits, criterion_label=label, focus_region=focus)

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
            captions.append(f"{exhibit[0]} - {evidence_caption(image)}")
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





