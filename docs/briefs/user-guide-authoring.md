# TEST2 User-guide authoring brief

Create exactly one concise, evidence-backed guide update for the selected `guide_update_authoring` handoff. This is not browser testing and must not modify the Word document.

Read live GitHub `status/handoffs.json` first. Confirm the supplied handoff ID, ticket, action, and `handoffVersion` are still live. Read only the listed `ticket.json`, generated ticket projection, passed `review.json`, `report.md`, `results.json`, `guide-impact.json`, `status/guide-updates.json`, and both user-guide policy files. If the handoff is absent or changed, return a no-op only in chat.

Write clear end-user instructions for the delivered, passed behaviour. Do not invent screens, controls, or outcomes. Reuse one or more verified PNG paths from the ticket's `results.json`; the builder will only accept evidence from the reviewed ticket. Choose `add` for a genuinely new guide section. Choose `amend` only when replacing one exact prior generated section from `status/guide-updates.json`; set `supersedesTicket` to that section's ticket key. If the correct prior section is unclear, stop with a concise failure instead of appending duplicate instructions. Every step must be a short imperative sentence suitable for the guide.

Write exactly one file: `.agent-staging/<handoffId>/guide-update-output.json`. It must contain `handoffId`, `handoffVersion`, `ticket`, `title`, `affectedSection`, `changeType`, `steps`, `screenshots`, `reason`, and `noOp`; include `supersedesTicket` only for an amendment.

- `changeType` is `add` or `amend`.
- For `amend`, `supersedesTicket` must identify the exact generated guide block to replace. For `add`, omit it.
- `steps` is a non-empty ordered array of plain strings.
- `screenshots` is a non-empty array of distinct PNG paths taken verbatim from the selected ticket's `results.json` evidence.
- `reason` briefly describes the user-facing change.

Keep the complete update in the staged file. Return only a compact receipt with `handoffId`, `ticket`, and `staged: true`; for a no-op or failure, return a compact reason. Do not repeat the update or narrate routine tool calls. Do not open a browser, take new screenshots, edit Jira, edit guide plans, edit ticket files, or create/edit the Word guide.
