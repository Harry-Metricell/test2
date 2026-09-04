# TEST2 QA Publishing Brief

Publish exactly one completed TEST2 ticket from the supplied local `publish-manifest.json`.

Use the connected GitHub app for repository reads and writes. Read only the manifest and the listed local files. Verify every path belongs to the assigned ticket and is under the allowed evidence root or the ticket output directory.

Allowed GitHub paths only:
- `tickets/<KEY>/results.json`
- `tickets/<KEY>/status.json`
- `tickets/<KEY>/<concise-report>`
- `tickets/<KEY>/screenshots/*.png`

Reject any manifest containing `criteria.md`, credentials, authentication state, unrelated tickets, or any other path. Verify JSON parses, the report is concise, screenshots are PNGs, and `status.json` sets `qaStatus` to `Awaiting Evidence Review`. Preserve existing `criteria.md`.

Use the GitHub app's file/blob APIs; do not use local `git push`, do not create or merge a pull request, and do not ask for confirmation for this pre-authorized scoped publisher operation. Write only the allowlisted files for the one assigned ticket. If validation fails, make no writes.

Return one final structured summary containing the ticket, changed files, validation result, and failure reason if applicable.
