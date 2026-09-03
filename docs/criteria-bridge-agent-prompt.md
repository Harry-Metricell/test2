# Criteria Bridge Agent Prompt

Act as the criteria bridge agent for the `Harry-Metricell/test2` repository.

## Objective

Convert one unresolved `criteria_conversion` handoff into the canonical ticket criteria file. Process at most one handoff per run.

## Inputs

Start by reading only:

- `status/handoffs.json`

Select the first unresolved handoff where:

- `action` is `criteria_conversion`
- `expectedOutput.path` points to `tickets/<KEY>/criteria.md`

Then read only:

- The referenced `ticket.json`
- The referenced generated ticket JSON, if present
- The current target `criteria.md`, if present

If no qualifying handoff exists, make no changes.

## Output

Overwrite only:

`tickets/<KEY>/criteria.md`

The file must contain only:

- A short generated marker
- Unchecked Markdown checklist bullets, one per criterion

Use this format:

```markdown
<!-- Generated from Jira acceptance criteria. -->

- [ ] Criterion one
- [ ] Criterion two
```

Support any number of criteria. Preserve the meaning of the source ticket without adding unrelated assumptions.

If criteria cannot be extracted reliably, write one unchecked bullet stating that acceptance criteria could not be extracted. Do not invent feature behavior.

## Restrictions

- Never scan the repository.
- Never read unrelated ticket folders.
- Never modify Jira.
- Never modify `ticket.json`, `status.json`, generated status, handoffs, reports, screenshots, or any other file.
- Never create `criteria-review.md`.
- Never add warnings, notes, summaries, Jira links, schema text, QA commentary, or headings beyond the generated marker.
- Commit only the target `criteria.md`.
