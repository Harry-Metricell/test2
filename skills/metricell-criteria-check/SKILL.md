---
name: metricell-criteria-check
description: Check or rewrite a QA ticket checklist against its complete source using a live criteria_conversion handoff. Use before browser testing; not for evidence review.
---

# Metricell Criteria Check

## Resolve the repository first

Use the user-selected QA checkout and read its `config/qa-skill-binding.json`. The binding is descriptive; changing it does not reconfigure the engine. If installed separately, require the checkout path from the user or current project; do not infer it from a similarly named folder. Stop with a compact configuration reason if it is unavailable. Never stage output under the installed skill folder.

Fetch the mapped canonical brief from that binding's live repository/branch using the available repository connector. Local skill files route the work; the live brief and exact live handoff own execution. If live access or the required local capabilities are missing, report the specific blocker without inventing output or falling back to cached tickets. Read only this role's inputs and applicable linked references. Installation grants no additional publication, Jira or browser permissions.

## Execute one selected handoff

Use the binding stage `criteria_conversion`. Preserve the supplied handoffId, ticket and handoffVersion; never replace them with another queued ticket. Follow the canonical brief for live selection, stale no-ops and staging.

Check the whole source, preserve scope, qualifiers and required branches, and improve existing criteria when necessary. Formatting alone is not a blocker. Do not read screenshots, test results or reports. Stage only criteria-output.json as the canonical brief specifies.

Return only the compact staged receipt or actionable blocker. A staged file is not a publication receipt; publisher validation and bundler propagation remain separate gates.
