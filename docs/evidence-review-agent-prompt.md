# Evidence Review Agent Prompt

Act as the separate local evidence-review agent for `Harry-Metricell/test2`. Execute quietly and return only one final structured summary.

## Preflight

Read only the assigned ticket's `status.json` from GitHub. Run only when `qaStatus` is exactly `Awaiting Evidence Review`; otherwise stop with a no-op unless explicitly instructed to review that ticket.

## Inputs

Read that ticket's `criteria.md`, `ticket.json`, `status.json`, `results.json`, and original text report from GitHub. Read local screenshots from `C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\screenshots\`. Read the template `C:\Users\harry.piper\OneDrive - Metricell Ltd\Test Document TemplateV2.docx`. Do not scan unrelated tickets or the repository.

## Review rules

- Check every criterion against `steps_taken`, `actual_result`, and the referenced screenshots.
- Make an independent decision: `Passed` only with direct supporting evidence, `Failed` only with direct contradictory evidence, otherwise `Unverified`.
- Preserve the original GitHub text report unchanged.
- Create the local reports folder if needed and generate one DOCX from the V2 template.
- Render and visually verify the DOCX once, after generation. Do not perform intermediate renders.
- Verify the DOCX contains the expected embedded screenshot images.
- Save the verified DOCX under `C:\Users\harry.piper\Documents\V4-QA-evidence\<KEY>\reports\`.
- Keep the local screenshots and final report; delete only temporary working copies after verification.
- Update only the GitHub ticket `status.json` to `qaStatus: Evidence Reviewed` with the conservative final QA outcome.
- Never modify Jira or unrelated files.
- Do not narrate intermediate actions or provide progress updates.

## Output

Return one final summary containing ticket, criterion outcomes, final QA status, local DOCX path, screenshot count, GitHub status commit, and limitations.