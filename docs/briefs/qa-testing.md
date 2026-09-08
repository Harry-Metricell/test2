# TEST2 QA Testing Brief

Execute immediately; do not summarise this brief.

Read exactly these local files and no others: `status/handoffs.json`; the selected handoff's `inputs.criteria`; `inputs.ticketJson`; and `inputs.status`. Treat the handoff paths as the only permitted ticket inputs.

Select the first eligible open `test_ticket` handoff in deterministic `handoffId` order from the local project's `status/handoffs.json`. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op with `noOp: true` and all required fields present. If QA status is `Awaiting Evidence Review` or `Evidence Reviewed`, skip it.

Use the authenticated V4 browser. If sign-in asks for an email, enter `harry.piper@metricell.com` and click Continue. Never enter a password or alter authentication state. Test every criterion independently. Use `Passed` only with direct evidence, `Failed` only with direct contradictory evidence, `Blocked` when testing or required evidence is prevented by access, permissions, browser, data or environment problems, and `Unverified` only when testing occurred but the evidence is inconclusive. Record actual `steps_taken`.

Set the top-level `qaStatus` to `Blocked` if any criterion is Blocked; otherwise set it to `Awaiting Evidence Review`.



Use this exact save method after every screenshot capture (saving evidence is required, not optional). `tab.screenshot()` returns PNG bytes, not a state object or data URL:
```js
const fs = await import('node:fs');
const path = await import('node:path');
function saveEvidencePng(bytes, file) {
  if (!bytes || bytes.length === 0) throw new Error('No screenshot bytes returned');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(bytes));
  if (!fs.existsSync(file) || fs.statSync(file).size === 0) throw new Error('PNG was not written');
}
```
Use a unique filename for each state, call `saveEvidencePng(await tab.screenshot(), file)` immediately after the corresponding browser state capture, and verify the file exists before continuing. Do not substitute a screenshot ID or displayed image for the saved PNG.

Before testing, create the staging screenshots folder. For every initial state and every meaningful criterion interaction, save a real PNG file in that folder; a displayed browser screenshot or screenshot ID alone is not evidence. Use the available file/screenshot save method, then verify each file exists and has non-zero size before finalising. If PNG files cannot be created or verified, set the affected outcomes to `Blocked`, set top-level `qaStatus` to `Blocked`, explain the exact error in `reason`, and still write the required staged JSON.

Save screenshots only to the selected staging folder:
`C:\\Users\\harry.piper\\Documents\\ChatGPT\\Test2-github\\.agent-staging\\<handoffId>\\screenshots\\`. The publisher copies them to the permanent evidence folder.

Do not write a permanent report; include the concise report text in `test-output.json`.

Write one temporary output file to:
`C:/Users/harry.piper/Documents/ChatGPT/Test2-github/.agent-staging/<handoffId>`

The JSON must contain: `handoffId`, `ticket`, `qaStatus`, `results`, `conciseReport`, `reportPath`, `evidenceFolder`, `noOp`, `reason`. `conciseReport` is the original short Markdown report for GitHub; do not put screenshots or DOCX content in it. Set `qaStatus` to `Blocked` for blocked runs and `Awaiting Evidence Review` for completed runs that have evidence to review. Do not create helper scripts or unrelated files in the repository; use only the staging folder or temporary system files. Do not modify permanent ticket files, criteria, Jira, or authentication state.

Return one compact JSON object only with exactly those fields. No markdown or commentary.
