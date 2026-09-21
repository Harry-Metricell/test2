# V4 User Guide Capture Brief

Capture evidence for exactly one section from the live GitHub `config/user-guide-plan.json`. This is separate from TEST2 Jira testing: never read or write ticket folders, status files, Jira, reports, or coordinator state.

Select the section named in the task message. Fetch the live plan first and confirm the section exists. Use the configured Playwright browser for the complete journey, starting at that section's `startUrl`. The saved private browser login is required; do not enter passwords, MFA codes, or change authentication state.

Follow the listed section steps exactly. Capture every listed `requiredScreenshots` state as a unique PNG in:

`.guide-staging/<section-id>/screenshots/`

Before returning, write one compact JSON object to:

`.guide-staging/<section-id>/guide-capture-output.json`

The JSON must contain exactly: `sectionId`, `sectionTitle`, `planSchema`, `capturedAt`, `stepsTaken`, `screenshots`, `summary`, `blocked`, `reason`.

Each screenshot entry must include `id`, `file`, `caption`, and `browserUrl`. `id` must match one planned `requiredScreenshots` entry. A blocked capture must say why; do not claim that a feature is documented without the required PNGs.

Return the same compact JSON only. Do not create or edit the Word guide; the guide updater owns that later step.
