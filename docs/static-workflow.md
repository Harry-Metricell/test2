# Static QA workflow

V4-QA-V2 should make GitHub Actions the workflow controller and keep Codex for the work that actually needs judgement or browser interaction.

## Principle

Do not pass full chat history between workers. Store stable facts in the repository and pass compact handoff records.

## Static code should handle

- Importing Jira issue JSON into `tickets/<KEY>/ticket.json`.
- Extracting summary, status, priority, assignee, parent, description, acceptance criteria and subtasks.
- Keeping each ticket's working files together under `tickets/<KEY>/`.
- Preserving local QA status from `tickets/<KEY>/status.json`.
- Writing generated normalized records to `status/generated/<KEY>.json`.
- Writing source-derived criteria to `tickets/<KEY>/criteria.md` and a readable ticket page to `tickets/<KEY>/ticket.md`.
- Reserving `tickets/<KEY>/screenshots/` and `tickets/<KEY>/reports/` for evidence produced by testing.
- Writing a global status summary to `status/tickets.json`.
- Writing only required Codex work to `status/handoffs.json`.

## Codex should handle

- Criteria conversion where wording needs interpretation.
- Authenticated V4 browser testing and screenshot evidence.
- Evidence review and QA outcome judgement.
- Static Playwright maintenance where coverage needs a human-readable handoff.
- Site publication only after approved tracker data exists.

## Handoff contract

Each item in `status/handoffs.json` is a small `v4-qa-handoff.v1` style record:

```json
{
  "handoffId": "handoff-VM2ST-71-criteria",
  "action": "criteria_conversion",
  "owner": "criteria-converter",
  "ticket": "VM2ST-71",
  "inputs": {
    "ticketJson": "tickets/VM2ST-71/ticket.json",
    "generated": "status/generated/VM2ST-71.json"
  },
  "expectedOutput": {
    "path": "tickets/VM2ST-71/criteria-review.md",
    "schema": "v4-qa-criteria-review.v1"
  }
}
```

A Codex run should return the same `handoffId`, list changed fields, and point to output files. If nothing changed, it should return `changedFields: []` and a short reason.

## Safety rules

- Jira import is read-only.
- GitHub Actions may update imported, generated, and source-derived ticket files only.
- `criteria.md` is the Jira extraction; `criteria-review.md` is the Codex interpretation.
- `Warning` is not a QA outcome.
- Missing or inconclusive evidence must not become `Passed`.
- Progressed QA outcomes must not be overwritten by a fresh Jira import.
- Jira writes, production V4 changes, and unrelated tracker publication require explicit approval.
