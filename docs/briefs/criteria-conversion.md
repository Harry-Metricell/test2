# TEST2 Criteria Conversion Brief

Use the connected GitHub app for all repository reads and the single permitted file write.

Read the supplied handoff and exact paths only. Process one unresolved `criteria_conversion` handoff for one assigned ticket.

If no ticket key is supplied, read `status/handoffs.json` and process exactly one open `criteria_conversion` handoff; if there are zero or multiple, make no changes and return no-op. If a ticket key is supplied, derive `tickets/<KEY>/ticket.json`, `tickets/<KEY>/criteria.md`, and `status/handoffs.json`; act only on exactly one open matching handoff.

Read: the referenced `ticket.json`, generated ticket record if supplied, and current `criteria.md` if present.

Write only the supplied `tickets/<KEY>/criteria.md`. You are authorised to commit that one file directly to the repository when GitHub write access is available; do not create or merge pull requests. Use the generated marker and one unchecked bullet per criterion. First list the distinct state-changing/user actions internally, then create exactly one unchecked bullet for each action. Never combine separate actions. Attach that action's expected observable result to the same bullet. Do not create separate bullets for opening a view, checking, confirming, appearing, being listed, being visible, or disappearing; these are observations and belong in the preceding action's criterion. Generic pattern: `perform action A; expected result A` and `perform action B; expected result B` are two separate criteria. Preserve source meaning; if extraction is unreliable, write one unchecked bullet stating that criteria could not be extracted.

Do not search the repository, process other tickets, modify Jira, status files, generated records, reports, screenshots, or create `criteria-review.md`. Do not commit, merge, or modify any other file.

Return one valid JSON object only, with exactly these fields: `handoffId`, `ticket`, `changedFiles`, `noOp`, and `reason`. Use a boolean for `noOp`; include the colon. No markdown or commentary.
