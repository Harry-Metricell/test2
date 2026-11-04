# Component and migration map

| Stage | Execution and durable boundary |
| --- | --- |
| Jira import | Read-only script; complete snapshots and changelog own cycles |
| Status Bundler | Script derives live handoffs, attempts and eligibility |
| Coordinator | Local chat dispatches exact handoffs, reconciles publication and owns locks |
| Criteria | Skill checks the whole source and stages one checklist decision |
| Tester | Browser worker holds shared lease and stages immutable criterion-owned evidence |
| Evidence review | Skill independently judges every criterion of one selected attempt |
| Guide impact / authoring | Separate passed-only workers; reuse verified evidence |
| Publisher | Script validates and publishes from an isolated checkout; builds verified reports |
| Desktop sync | Scheduled safe fast-forward preserving unrelated edits |

`config/qa-skill-binding.json` maps the current deployment. It is an inventory for the skills, not an engine configuration loader. Do not put credentials, authentication state or private evidence into it.

A portable skill still needs the QA checkout, live repository connector and stage-specific local capabilities. Reviewer needs exact private PNG/supporting files and local staging; criteria needs staging but no browser. Tester additionally needs authenticated Playwright and browser ownership. Publisher needs Git authentication, Python report dependencies and a supported document converter. Follow the repository's new-PC setup instead of treating installation as readiness proof.

Before a new site/Jira/GitLab deployment, adapt and test the importer/ticket-key assumptions, Git provider and publication/CI integration, Windows tasks/private paths, local project binding and browser authentication. Existing TEST2 engine paths and coordinator project ID remain deployment-specific. Static O2/EE/Cornerstone suites are a separate integration: skill packaging neither installs a GitLab runner nor converts dynamic results into reusable Playwright tests.

For credit economy, load one role, one exact live handoff and only applicable references. Keep deterministic validation/publication in scripts; use compact receipts and cached immutable inputs only where the coordinator already permits them. Do not remove independent review, source coverage or publication gates to save context.
