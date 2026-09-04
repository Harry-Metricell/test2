# TEST2 Criteria Conversion Brief

Read the supplied handoff and exact paths only. Process one unresolved `criteria_conversion` handoff for one assigned ticket.

Read: the referenced `ticket.json`, generated ticket record if supplied, and current `criteria.md` if present.

Write only the supplied `tickets/<KEY>/criteria.md`. Use the generated marker and one unchecked bullet per criterion. Preserve source meaning; if extraction is unreliable, write one unchecked bullet stating that criteria could not be extracted.

Do not search the repository, process other tickets, modify Jira, status files, generated records, reports, screenshots, or create `criteria-review.md`.

Return one final JSON summary only: `handoffId`, `ticket`, `changedFiles`, `noOp`, and `reason`.
