# Static QA workflow

V4-QA-V2 uses GitHub Actions as the workflow controller and reserves Codex for work requiring authenticated browser interaction, interpretation, or independent judgement.

## Principle

Store stable facts in repository files and pass compact per-ticket manifests. Do not pass full chat history or make agents search for work.

## Static code owns

- Jira import into `tickets/<KEY>/ticket.json`.
- Normalized ticket records and `tickets/<KEY>/criteria.md` when criteria are obvious.
- A generated human-readable `status/ticket-status.md` view.
- Eligibility and no-op checks.
- A separate generated queue containing only tickets whose criteria need Codex interpretation.
- Exact-path handoff manifests and stale-handoff completion.
- Schema, criterion-count, screenshot-reference, prohibited-file, status-transition, and DOCX package validation.

## Codex owns

- Ambiguous criteria conversion.
- Authenticated V4 browser testing and local screenshot evidence.
- Independent evidence review and final QA judgement.
- Static Playwright maintenance where human judgement is required.
- Site publication only after approved tracker data exists.

## Handoff contract

Each handoff is a compact `v4-qa-handoff.v1` record containing `handoffId`, `action`, `owner`, `ticket`, exact input paths, expected output paths, and a source revision. Criteria conversion uses:

```json
{"handoffId":"handoff-TEST2-123-criteria","action":"criteria_conversion","owner":"criteria-converter","ticket":"TEST2-123","inputs":{"ticketJson":"tickets/TEST2-123/ticket.json","generated":"status/generated/TEST2-123.json"},"expectedOutput":{"path":"tickets/TEST2-123/criteria.md","schema":"v4-qa-criteria.v1"}}
```

If nothing needs work, return a visible no-op with `changedFiles: []`.

## Safety and outcomes

Jira import is read-only. Progressed QA outcomes must not be overwritten by fresh Jira import. `criteria.md` is canonical and is not changed during testing. `Warning` is not a QA outcome.

Allowed evidence outcomes are:

- `Passed`: direct supporting evidence.
- `Failed`: direct contradictory evidence.
- `Blocked`: required testing or review could not proceed because of an external or missing dependency.
- `Unverified`: testing occurred but evidence is insufficient or inconclusive.

Missing or inconclusive evidence must never become `Passed`.
