# TEST2 User-guide authoring brief

Create exactly one concise, evidence-backed guide update for the selected `guide_update_authoring` handoff. This is not browser testing and must not modify the Word document.

## Select and verify

Read live GitHub `status/handoffs.json` first. Confirm the supplied handoff ID, ticket, action, and `handoffVersion` are still live. Read the listed `ticket.json`, generated ticket projection, passed `review.json`, `report.md`, `results.json`, `guide-impact.json`, `status/guide-updates.json`, `config/user-guide-plan.json`, and both user-guide policy files. In legacy mode, read the selected indexed amendment section and its `guide-update.json` from the same verified repository revision. If the handoff is absent or changed, return a no-op only in chat.

## Write useful instructions

For `publicationMode: private`, use the local indexed guide. Run these commands from the TEST2 checkout using the publisher's Python:

```powershell
$guidePython = if ($env:TEST2_PYTHON) { $env:TEST2_PYTHON } else { "$env:USERPROFILE\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe" }
& $guidePython scripts/private-user-guide.py list
& $guidePython scripts/private-user-guide.py section <section-id>
```

Select one editable section ID and read only that section. Include its exact `sectionId` and `sectionSha256` in the staged output. Use `add` for a distinct instruction within that section and `amend` for a complete replacement of its body. For an amendment, supply all instructions and figures the section should retain and map any retained illustration identities with `preserveFigureSlots`. Keep the section heading in place. Omit `supersedesTicket`. The older public guide index and ticket-based amendment rules below apply only to the legacy publication mode. The private publisher releases a completion receipt to GitHub. The guide, section text, caption text and figure references stay on the publisher PC.

Keep each section self-contained and task-focused. Do not add commentary about what the guide lacks, which features were not tested, coverage gaps, missing documentation, or what still needs to be written. Keep source dates, verification scope and authoring limitations in the update record and supporting metadata. Retain only brief qualifications necessary to use or interpret the feature correctly; do not turn them into a prerequisite checklist.

Read the target section and its reviewed evidence. Use the compact guide index to locate the target. The builder performs the whole-document consistency sweep and handles figure numbering and links after placement. If the target or evidence identifies a conflict outside the supported amendment, report the exact conflict. Do not launch another tester or reviewer for this check. See [User guide builder contract](../user-guide-builder-contract.md) for the handoff format.

Apply `docs/user-guide-editorial-standard.md`. Use task-based titles. Keep ordered actions in `steps` and supported qualifications in optional `notes` bullets. Select only the distinct reviewed screenshots needed to explain the task. The builder owns styling and pagination.

Do not present a selected list of modules or controls as a complete inventory. Retain the source date and verified scope for every added factual claim; seeing a launcher card does not establish that its workflow works. Yellow markings cover all added or rewritten guide text, including titles, captions and notes.

Use the selected handoff's exact cycle-scoped ID/version and evidence. In legacy mode, indexed sections may originate in archived cycles, so read the supplied `recordPath`. A later cycle can amend its own indexed generated block by setting `supersedesTicket` to the same ticket. Refetch the exact live handoff before staging.

Write clear instructions for the delivered, passed behaviour. Reuse one or more verified PNG paths from the current ticket's `results.json`. In legacy mode, `add` creates a generated section and `amend` replaces an exact indexed generated section using `supersedesTicket`. In private mode, use the local section contract above. If the correct target is unclear, report the issue. Write each step as a short instruction.

In legacy mode, the public index lists active generated markers. In private mode, the local index lists baseline section IDs and whether each section is editable.

Compare the whole user task with existing indexed instructions, not just the ticket title. Another QA journey through the same controls is not a new guide feature. Prefer amending the existing section when its instructions need a genuine change. If the impact decision identifies no actual gap, stop with a concise reason instead of inventing duplicate instructions. Use a descriptive module-first `affectedSection` (for example `GIS layer catalogue`, `GIS Display Settings`, `V4 launcher module navigation`, `Agentic AI`, `Dashboards`, or `API Request Audit`) so the builder can place it beside the relevant chapter. Editorial retirement in `config/user-guide-plan.json` is deliberate consolidation; do not recreate retired sections or use their markers as amendment targets.

Translate tested behaviour into the user's goal; do not copy the test script. Explain how to choose the desired setting and what visible state means. Do not require users to record their initial state, restore it after use, collect evidence, or remove a test-created layer. Describe reopening/persistence as supported behaviour rather than a mandatory repeated validation ritual. An optional undo instruction is appropriate only when useful to the user. For example: "Select Show linked sites to check or uncheck it" and "To undo your change, select the checkbox again"; not "Restore the recorded initial state and repeat the test". Captions may accurately describe restored evidence states without making restoration a user obligation. The publisher rejects explicit QA bookkeeping/cleanup language in new instruction steps.

## Stage output and finish

Write exactly one file: `.agent-staging/<handoffId>/guide-update-output.json`. It must contain `handoffId`, `handoffVersion`, `ticket`, `title`, `affectedSection`, `changeType`, `steps`, `screenshots`, `screenshotCaptions`, `reason`, and `noOp`; include `supersedesTicket` only for an amendment.

- `changeType` is `add` or `amend`.
- In private mode supply `sectionId` and `sectionSha256`, and omit `supersedesTicket`. In legacy mode supply `supersedesTicket` only for an amendment.
- `steps` is a non-empty ordered array of plain strings.
- `notes`, when useful, is an array of non-empty plain strings rendered as supporting bullet points after the steps. Omit it when unnecessary. Notes must use the same passed-ticket evidence and end-user boundaries as steps.
- `screenshots` is a non-empty array of distinct PNG paths taken verbatim from the selected ticket's `results.json` evidence.
- `screenshotCaptions` has one non-empty caption per screenshot, in the same order. Supply caption text without a figure number. If a step or note needs to point to a screenshot, use `[[FIGURE:1]]` for the first screenshot in this update, `[[FIGURE:2]]` for the second, and so on. Describe the verified visible state.
- For an amendment that keeps or replaces the same illustration, use optional `preserveFigureSlots` to carry its identity forward. Supply one entry per new screenshot, with the corresponding old screenshot position (starting at 1) or `null` for a new illustration. Use the old positions from the target section only.
- `reason` briefly describes the user-facing change.

Copy the live handoffVersion exactly, set noOp false for an update, and verify the staged file exists and is non-empty. Keep the complete update in the staged file. Return only a compact receipt with `handoffId`, `ticket`, and `staged: true`; for a no-op or failure, return a compact reason. Do not repeat the update or narrate routine tool calls. Do not open a browser, take new screenshots, edit Jira, edit guide plans, edit ticket files, or create/edit the Word guide.
