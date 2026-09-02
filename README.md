# V4-QA-V2

Repository-controlled QA workflow for Metricell Smart Network V4.

The aim is to reduce chat/token usage by moving repeatable work into GitHub Actions and plain repository files. Codex should be triggered only when the generated plan says human judgement, authenticated browser testing, evidence review, or static Playwright maintenance is required.

## Current flow

1. Jira import stores raw issue snapshots in `tickets/<KEY>/ticket.json`.
2. `npm run generate` normalizes those snapshots into compact generated records.
3. Generated status is written to `status/tickets.json` and `status/generated/<KEY>.json`.
4. Required Codex work is written to `status/handoffs.json`.
5. GitHub Actions can later trigger Codex once per handoff item.

## Useful commands

```bash
npm run generate
npm run check
```

## Key folders

- `.github/workflows/`: import and static planning workflows.
- `tickets/`: raw Jira snapshots plus local per-ticket workflow files.
- `status/`: generated dashboard-ready summaries and Codex handoffs.
- `playwright/`: manual and generated static Playwright coverage areas.
- `docs/`: workflow contracts and operating notes.

## Boundary

This repo is allowed to import, normalize, plan, and preserve QA records. It must not silently approve Jira outcomes, publish unreviewed evidence, or overwrite progressed QA decisions with fresh Jira status.
