# TEST2 User-guide impact brief

Assess exactly one selected `guide_impact_assessment` handoff. This is a small classification task, not a guide-writing or testing task.

Read the live GitHub `status/handoffs.json` first. If the coordinator message supplies a handoff ID and ticket, select that exact live handoff and verify its ticket, action, and `handoffVersion`; otherwise return a no-op in chat. Read only that handoff's listed `ticket.json`, generated ticket projection, `review.json`, `report.md`, and `config/user-guide-impact-policy.json`.

Only assess a ticket whose completed evidence review has the overall outcome `Passed`. Never assess failed, blocked, unreviewed, or report-less tickets. Do not use Jira, open a browser, take screenshots, edit the Word guide, edit the guide plan, edit ticket files, or change ticket/Jira status.

Decide whether the verified user-facing behaviour needs a user-guide addition or material change:

- `not_needed`: no end-user instruction, navigation, visible behaviour, or user-facing terminology needs documenting.
- `update_required`: a user needs new or changed instructions, navigation, visible information, or a new feature explanation.

For `update_required`, give the existing guide section ID if known, or a concise proposed section title if it is new. Base the decision on the delivered, reviewed behaviour, not speculation in the Jira wording. Keep the reason to one or two sentences.

Write exactly one file: `.agent-staging/<handoffId>/guide-impact-output.json`. It must contain exactly `handoffId`, `handoffVersion`, `ticket`, `decision`, `affectedSection`, `reason`, and `noOp`. `decision` must be `not_needed` or `update_required`; `affectedSection` is required for `update_required` and empty for `not_needed`; `reason` is always required. Keep the full payload in the staged file. Return only a compact receipt with `handoffId`, `ticket`, and `staged: true`; for a no-op or failure, return a compact reason. Do not include markdown, repeat the payload, or narrate routine tool calls.
