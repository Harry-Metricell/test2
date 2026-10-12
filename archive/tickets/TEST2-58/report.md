# TEST2-58 Evidence Review

- **Ticket:** TEST2-58 — Cancel a second Surveyor layer configuration without disturbing an existing loaded layer
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With one test-created Surveyor layer already loaded, a settled GIS map visibly shows that layer in the Map layers list or legend, and the visible list and layer identity are recorded before opening a second Surveyor layer configuration.
   - Criterion-owned empty-map and first-configuration captures lead to criterion-1-final.png, which shows one Surveyor - Service entry, Surveyor (1), and its matching legend before any second configuration.
2. **Passed:** Opening Add layer for Surveyor a second time displays identifiable Surveyor configuration controls and a Cancel action while the original layer remains visibly loaded.
   - Criterion-2-before-second-configuration.png records one Surveyor - Service entry; criterion-2-after-second-configuration.png shows Surveyor controls, Service, Last 30 days and Cancel with that entry and legend still visible behind the dialog.
3. **Passed:** After selecting Cancel in the second Surveyor configuration, the configuration closes and the map returns with a visible Map layers list containing the same entries as the recorded pre-configuration list; no additional Surveyor layer is present and the original layer remains present.
   - Criterion-3-baseline-before-second-configuration.png records two Surveyor - Service entries (one existing, one test-created). The same journey shows Cancel in the second configuration and then the closed configuration with the identical two-entry list and Surveyor (2); no extra entry appears.
4. **Passed:** After cancelling the second Surveyor configuration, Display Settings can be opened for the original layer and Show linked sites visibly has the same state as its separately recorded pre-cancellation baseline.
   - Criterion-4-baseline-linked-sites-checked.png shows Show linked sites checked. Its own sequence closes settings, opens the next Surveyor configuration, cancels it, and reopens Display Settings; criterion-4-after-reopen-display-settings.png shows the checkbox still checked for the recorded test-created layer.

**Review summary:** Reviewed attempt-001 against all four criteria using criterion-owned screenshots and recorded browser URLs. Criteria 3 and 4 preserve an existing entry alongside their test-created layer; the cleanup persistence caveat does not establish an application defect.
