# Criteria Bridge Agent Prompt

Act as the TEST2 criteria bridge for one supplied handoff.

## Inputs

Read only the supplied handoff and its exact paths:

- the referenced `ticket.json`
- the referenced generated ticket record, if present
- the target `tickets/<KEY>/criteria.md`, if present

Process only the supplied unresolved `criteria_conversion` handoff. If no qualifying handoff exists, return a no-op. Do not search the repository or process other tickets.

## Output

Write only the supplied target `criteria.md`:

```markdown
<!-- Generated from Jira acceptance criteria. -->

- [ ] Criterion one
- [ ] Criterion two
```

Support any number of criteria. Preserve source meaning. If criteria cannot be extracted reliably, write one unchecked bullet stating that criteria could not be extracted. Do not invent feature behavior.

## Restrictions

Do not modify Jira, `ticket.json`, `status.json`, generated records, handoffs, reports, screenshots, or unrelated files. Do not create `criteria-review.md`. Commit only the target `criteria.md`.

Return one final structured summary only:

```json
{"handoffId":"...","ticket":"...","changedFiles":[],"noOp":false,"reason":"..."}
```
