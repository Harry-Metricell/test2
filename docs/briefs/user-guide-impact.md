# TEST2 User-guide impact brief

Assess exactly one selected `guide_impact_assessment` handoff. This is a small classification task, not a guide-writing or testing task.

## Select and verify

Fetch this brief from live GitHub main using the GitHub connector. Resolve the current main commit, then fetch `status/handoffs.json` at that commit using the connector. Local checkout files are not authoritative: never use `Get-Content`, filesystem reads, or a cached queue to decide that a handoff is absent. Desktop sync can lag behind publication even when the coordinator has verified the live handoff.

If the coordinator message supplies a handoff ID and ticket, select that exact live handoff and verify its ticket, action, and `handoffVersion`; otherwise return a no-op in chat. Read only that handoff's listed `ticket.json`, generated ticket projection, `review.json`, `report.md`, `status/guide-updates.json`, and `config/user-guide-impact-policy.json`, using the connector at the same commit. Local access is for this worker's staging output and the private documentation comparison below.

Before an absent/changed-handoff no-op, refetch `status/handoffs.json` from current main through the connector and verify it is still absent/changed. If live reads fail, return a compact blocked reason `live_read_unavailable`; never substitute local data or call an unreadable queue empty. Do not stage an assessment without verified live inputs.

Only assess a ticket whose completed evidence review has the overall outcome `Passed`. Never assess failed, blocked, unreviewed, or report-less tickets. Do not use Jira, open a browser, take screenshots, edit the Word guide, edit the guide plan, edit ticket files, or change ticket/Jira status.

## Assess guide impact

Decide whether the verified user-facing behaviour needs a user-guide addition or material change:

- `not_needed`: no end-user instruction, navigation, visible behaviour, or user-facing terminology needs documenting.
- `update_required`: a user needs new or changed instructions, navigation, visible information, or a new feature explanation.

Check `config/user-guide-plan.json` at the same commit. In private mode, use the local guide for the documentation comparison. Follow the local Python commands in [the authoring brief](user-guide-authoring.md) to list section headings and read the one plausibly overlapping section. Live handoff and ticket inputs still come from GitHub. If the private guide cannot be read, report the specific blocker. In legacy mode, read an indexed `guide-update.json` only for a plausibly overlapping section. A repeated test of already documented behaviour is `not_needed`. Choose `update_required` only for a change readers need to know about.

For `update_required`, give the existing guide section ID if known, or a concise proposed section title if it is new. Base the decision on the delivered, reviewed behaviour, not speculation in the Jira wording. Keep the reason to one or two sentences.

## Stage output and finish

Write exactly one file: `.agent-staging/<handoffId>/guide-impact-output.json`. It must contain exactly `handoffId`, `handoffVersion`, `ticket`, `decision`, `affectedSection`, `reason`, and `noOp`. `decision` must be `not_needed` or `update_required`; `affectedSection` is required for `update_required` and empty for `not_needed`; `reason` is always required. Copy the live handoffVersion exactly, set noOp false for an assessment, and verify the staged file exists and is non-empty. Keep the full payload in the staged file. Return only a compact receipt with `handoffId`, `ticket`, and `staged: true`; for a no-op or failure, return a compact reason. Do not include markdown, repeat the payload, or narrate routine tool calls.
