# TEST2 QA Testing Brief

Execute immediately; do not summarise this brief.

Use the GitHub connector to fetch the live `main` branch file `status/handoffs.json` before selecting work; do not use a local checkout copy for queue selection. Then fetch only the selected handoff's remote `inputs.criteria`, `inputs.ticketJson`, and `inputs.status`. Treat the handoff paths as the only permitted ticket inputs. If a remote fetch fails, retry once after a short wait; never guess from stale local files.

Select the first eligible open `test_ticket` handoff in deterministic `handoffId` order from the freshly fetched live GitHub `status/handoffs.json`. Do not use Jira, ticket numbers from the task prompt, local folder names, or arbitrary ticket selection. If none exists, return one compact JSON no-op with `noOp: true` and all required fields present. If QA status is `Awaiting Evidence Review` or `Evidence Reviewed`, skip it.

Use the authenticated V4 browser. If an authentication or login page appears, enter `harry.piper@metricell.com` in the email field and press `Continue`. Never enter a password, handle MFA, or alter authentication state. Test every criterion independently. Use `Passed` only with direct evidence, `Failed` only with direct contradictory evidence, `Blocked` when testing or required evidence is prevented by access, permissions, browser, data or environment problems, and `Unverified` only when testing occurred but the evidence is inconclusive. Record actual `steps_taken`. When the browser exposes its version, add `browserVersion` to the first result object; otherwise omit it. Capture the browser name and version only from visible browser information; never infer it.

Set the top-level `qaStatus` to `Blocked` if any criterion is Blocked; otherwise set it to `Awaiting Evidence Review`.

After testing, restore the application and test data to their original conditions. Undo temporary selections, filters, favourites, map changes, panels, and other test-created state where possible. Do not alter unrelated data or settings. Record anything that could not be restored in the affected result's `reason` or `blockers`.



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

Before testing, create the staging screenshots folder. For every criterion, save one initial-state PNG before the first interaction. For each meaningful state-changing interaction, save a PNG immediately before and immediately after it. Do not capture redundant screenshots for scrolling, idle waits, or clicks that do not change state. A displayed browser screenshot or screenshot ID alone is not evidence. Use the available file/screenshot save method, then verify each file exists and has non-zero size before finalising. If PNG files cannot be created or verified, set the affected outcomes to `Blocked`, set top-level `qaStatus` to `Blocked`, explain the exact error in `reason`, and still write the required staged JSON.

Save screenshots only to the selected staging folder:
`C:\\Users\\harry.piper\\Documents\\ChatGPT\\Test2-github\\.agent-staging\\<handoffId>\\screenshots\\`. The publisher copies them to the permanent evidence folder.

Do not write a permanent report; include the concise report text in `test-output.json`.

Write one temporary output file to:
`C:/Users/harry.piper/Documents/ChatGPT/Test2-github/.agent-staging/<handoffId>`

The JSON must contain: `handoffId`, `ticket`, `qaStatus`, `results`, `conciseReport`, `reportPath`, `evidenceFolder`, `noOp`, `reason`. `conciseReport` is the original short Markdown report for GitHub; do not put screenshots or DOCX content in it. Set `qaStatus` to `Blocked` for blocked runs and `Awaiting Evidence Review` for completed runs that have evidence to review. Do not create helper scripts or unrelated files in the repository; use only the staging folder or temporary system files. Do not modify permanent ticket files, criteria, Jira, or authentication state.

Return one compact JSON object only with exactly those fields. No markdown or commentary.


