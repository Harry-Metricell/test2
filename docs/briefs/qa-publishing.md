# TEST2 QA Publishing Brief

Use the connected GitHub app to publish exactly one supplied TEST2 ticket package.

Read the supplied manifest and listed local files only. Verify the ticket and allow only these GitHub paths:

- `tickets/<KEY>/results.json`
- `tickets/<KEY>/status.json`
- `tickets/<KEY>/<concise-report>`

Screenshots stay local and must not be uploaded. Reject credentials, authentication state, `criteria.md`, unrelated tickets, and all other files. Verify JSON parses, the report is concise, and `status.json` sets `qaStatus` to `Awaiting Evidence Review`.

Use GitHub file APIs, not local `git push`. Write only the three allowlisted files. If validation fails, make no writes. Return one short structured summary.
