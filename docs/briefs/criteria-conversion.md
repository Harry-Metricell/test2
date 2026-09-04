# TEST2 Criteria Conversion Brief

Read the supplied handoff and exact paths only. Process one unresolved `criteria_conversion` handoff for one assigned ticket.

If given only a ticket key, derive `tickets/<KEY>/ticket.json`, `tickets/<KEY>/criteria.md`, and `status/handoffs.json`; act only on exactly one open matching handoff, otherwise return no-op.

Read: the referenced `ticket.json`, generated ticket record if supplied, and current `criteria.md` if present.

Write only the supplied `tickets/<KEY>/criteria.md`. Use the generated marker and one unchecked bullet per criterion. Give every distinct state-changing/user action its own bullet; never combine separate actions. Include that action's expected observable result in the same bullet. Do not create observation-only bullets. For example, add-to-Favourites plus appears-in-Favourites is one criterion, and remove-from-Favourites plus no-longer-appears is a separate criterion. Preserve source meaning; if extraction is unreliable, write one unchecked bullet stating that criteria could not be extracted.

Do not search the repository, process other tickets, modify Jira, status files, generated records, reports, screenshots, or create `criteria-review.md`.

Return one valid JSON object only, with exactly these fields: `handoffId`, `ticket`, `changedFiles`, `noOp`, and `reason`. Use a boolean for `noOp`; include the colon. No markdown or commentary.
