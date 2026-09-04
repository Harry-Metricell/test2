# TEST2 Criteria Conversion Brief

Use the connected GitHub app. Read only the selected handoff and its exact input paths.

Process exactly one open `criteria_conversion` handoff. With no ticket supplied, select the sole eligible handoff from `status/handoffs.json`; with a ticket supplied, select only its matching handoff. If zero or multiple eligible handoffs exist, make no changes and return a no-op.

Read the handoff's `ticket.json`, generated record, and current `criteria.md`. Write and commit only `tickets/<KEY>/criteria.md`; never create or merge pull requests. Do not modify Jira, status files, generated records, reports, screenshots, or other tickets.

Create one unchecked bullet per distinct state-changing/user action. Never combine separate actions. Put that action's expected observable result in the same bullet. Opening, checking, confirming, appearing, being listed, visibility, and disappearance are observations attached to the relevant action, not separate criteria. Preserve source meaning; if extraction is unreliable, write one unchecked bullet saying criteria could not be extracted. If `criteria.md` is already valid, make no write and do not ask for confirmation.

Return one JSON object only with exactly these fields: `handoffId`, `ticket`, `changedFiles`, `reason`, `noOp`. `noOp` must be a JSON boolean with a value. Use `changedFiles: []` for no-op. No markdown or commentary.
