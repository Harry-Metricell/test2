"""Build a compact, evidence-linked TEST2 review PDF without Microsoft Word."""
import argparse
import json
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import (
    Image,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def text(value):
    return "" if value is None else str(value)


def para(value, style):
    return Paragraph(escape(text(value)).replace("\n", "<br/>"), style)


def image_for(path, max_width, max_height):
    image = Image(str(path))
    width, height = image.imageWidth, image.imageHeight
    scale = min(max_width / width, max_height / height, 1)
    image.drawWidth = width * scale
    image.drawHeight = height * scale
    return image


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--review-output", required=True)
    parser.add_argument("--criteria", required=True)
    parser.add_argument("--results", required=True)
    parser.add_argument("--screenshots", required=True)
    parser.add_argument("--output", required=True)
    args = parser.parse_args()

    review = json.loads(Path(args.review_output).read_text(encoding="utf-8"))
    results = json.loads(Path(args.results).read_text(encoding="utf-8"))
    outcomes = review.get("criterionOutcomes")
    ticket = text(review.get("ticket"))
    if not ticket.startswith("TEST2-") or not isinstance(outcomes, list) or not outcomes:
        raise SystemExit("review-output has an invalid ticket or no criterionOutcomes")

    result_by_criterion = {text(item.get("criterion")): item for item in results if isinstance(item, dict)}
    screenshot_dir = Path(args.screenshots)
    all_images = sorted(p for p in screenshot_dir.glob("*.png") if p.is_file() and p.stat().st_size > 0)
    if not all_images:
        raise SystemExit("at least one non-empty screenshot is required")
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitleCenter", parent=styles["Title"], alignment=TA_CENTER, textColor=colors.HexColor("#17365D"), spaceAfter=16))
    styles.add(ParagraphStyle(name="Small", parent=styles["BodyText"], fontSize=8.5, leading=11, spaceAfter=4))
    styles.add(ParagraphStyle(name="Criterion", parent=styles["Heading2"], fontSize=12, leading=15, textColor=colors.HexColor("#17365D"), spaceBefore=10, spaceAfter=6))
    styles.add(ParagraphStyle(name="Outcome", parent=styles["BodyText"], fontSize=10, leading=13, textColor=colors.HexColor("#333333"), spaceAfter=6))

    story = [Paragraph(f"{escape(ticket)} Evidence Review Report", styles["TitleCenter"])]
    story.append(Paragraph("TEST2 evidence review", styles["Normal"]))
    story.append(Spacer(1, 10))
    summary_data = [["Ticket", "Overall outcome", "QA status"], [ticket, text(review.get("overallOutcome")), text(review.get("qaStatus"))]]
    summary = Table(summary_data, colWidths=[2.2 * inch, 2.2 * inch, 2.2 * inch])
    summary.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17365D")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#D9D9D9")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    story += [summary, Spacer(1, 14)]

    for number, item in enumerate(outcomes, 1):
        criterion = text(item.get("criterion"))
        result = result_by_criterion.get(criterion, {})
        evidence_names = {Path(text(name)).name for name in result.get("evidence", [])}
        images = [image for image in all_images if image.name in evidence_names] or all_images
        block = [Paragraph(f"{number}. {escape(criterion)}", styles["Criterion"])]
        block.append(Paragraph(f"<b>Outcome:</b> {escape(text(item.get('outcome')))}", styles["Outcome"]))
        block.append(para(item.get("reason") or result.get("reason"), styles["Small"]))
        steps = result.get("steps_taken", [])
        if steps:
            block.append(Paragraph("<b>Actual steps taken</b>", styles["Small"]))
            block.append(para("\n".join(f"- {text(step)}" for step in steps), styles["Small"]))
        for image in images:
            block.append(image_for(image, 6.4 * inch, 3.5 * inch))
            block.append(Spacer(1, 5))
        story.append(KeepTogether(block))

    doc = SimpleDocTemplate(str(output), pagesize=A4, rightMargin=0.55 * inch, leftMargin=0.55 * inch, topMargin=0.55 * inch, bottomMargin=0.55 * inch)
    doc.build(story)
    if not output.is_file() or output.stat().st_size == 0:
        raise SystemExit("PDF was not created or is empty")


if __name__ == "__main__":
    main()

