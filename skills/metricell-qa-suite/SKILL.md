---
name: metricell-qa-suite
description: Route work in the repository-backed Metricell QA suite to its canonical coordinator or worker contract. Use for operating or adapting the suite, not as a replacement for Playwright regression execution.
---

# Metricell QA Suite

## Resolve the repository first

Use the user-selected QA checkout and read its `config/qa-skill-binding.json`. The binding is descriptive; changing it does not reconfigure the engine. If installed separately, require the checkout path from the user or current project; do not infer it from a similarly named folder. Stop with a compact configuration reason if it is unavailable. Never stage output under the installed skill folder.

Fetch the mapped canonical brief from that binding's live repository/branch using the available repository connector. Local skill files route the work; the live brief and exact live handoff own execution. If live access or the required local capabilities are missing, report the specific blocker without inventing output or falling back to cached tickets. Read only this role's inputs and applicable linked references. Installation grants no additional publication, Jira or browser permissions.

## Route only the requested work

For an exact handoff, select its action in the binding and read only that canonical brief. Criteria and evidence review also have dedicated installable skills; the mapped brief remains the single workflow authority. Do not load every worker brief or create extra handoffs. For suite coordination, use the coordinator brief, preserving its dispatch, ownership, independent-review and publication gates.

For packaging or migration, read [component-map](references/component-map.md). Do not claim a profile edit implements migration, a runner or automatic AC-to-Playwright generation. Use scripts for deterministic work and models for the selected judgement stage. Never repeat finished work merely to change its model or install a skill.
