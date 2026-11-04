---
name: metricell-evidence-review
description: Independently review one QA attempt against source criteria and private evidence using a live evidence_review handoff. Use after testing; not for criteria authoring or report rendering.
---

# Metricell Evidence Review

## Resolve the repository first

Use the user-selected QA checkout and read its `config/qa-skill-binding.json`. The binding is descriptive; changing it does not reconfigure the engine. If installed separately, require the checkout path from the user or current project; do not infer it from a similarly named folder. Stop with a compact configuration reason if it is unavailable. Never stage output under the installed skill folder.

Fetch the mapped canonical brief from that binding's live repository/branch using the available repository connector. Local skill files route the work; the live brief and exact live handoff own execution. If live access or the required local capabilities are missing, report the specific blocker without inventing output or falling back to cached tickets. Read only this role's inputs and applicable linked references. Installation grants no additional publication, Jira or browser permissions.

## Execute one selected handoff

Use the binding stage `evidence_review`. Preserve the supplied handoffId, ticket and handoffVersion; never replace them with another queued ticket. Follow the canonical brief for live selection, stale no-ops and staging.

Review every criterion independently from the exact selected attempt/cycle. A tester verdict is not evidence. Load specialist references according to source requirements and evidence types, including simulation disclosures. Do not open a browser, change criteria or render reports. Stage only review-output.json as the canonical brief specifies.

Return only the compact staged receipt or actionable blocker. A staged file is not a publication receipt; publisher validation and bundler propagation remain separate gates.
