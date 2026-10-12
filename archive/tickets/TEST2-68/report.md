# TEST2-68 Evidence Review

- **Ticket:** TEST2-68 — Recover GIS catalogue search from no matches and open Surveyor configuration
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Starting in GIS with Search layers empty and the recorded baseline visible, enter `zzqa_no_match_batch_20261009` in Search layers; the entered text remains visible, no matching catalogue entries are displayed, and the GIS map remains available.
   - The criterion-owned baseline shows empty Search layers and the catalogue; the subsequent capture shows zzqa_no_match_batch_20261009 retained, no matching layers and the rendered map still available. The browser-derived URL records the required GIS destination.
2. **Passed:** Replace the no-match Search layers text with `Surveyor` without reloading GIS; a matching Surveyor catalogue entry becomes visible.
   - The criterion-owned sequence shows the no-match text and empty catalogue followed by Surveyor in Search layers and a matching Surveyor entry. Recorded steps confirm replacement without navigation or reload, with the browser-derived URL remaining on GIS.
3. **Passed:** With the filtered Surveyor catalogue entry visible, open its configuration control; the Surveyor configuration displays Username, Cancel, and Add layer controls.
   - The criterion-owned recovery sequence shows the filtered Surveyor entry followed by its open configuration, with Username, Cancel and Add layer all visibly present.
4. **Passed:** Select Cancel and clear Search layers; the original catalogue entries return, the existing Map layers entries and order and the map view match the recorded baseline, and no new layer is present.
   - The criterion-owned sequence shows the baseline, no-match search, recovered Surveyor entry, open configuration, closed configuration after Cancel and empty search after clearing. The restored catalogue matches baseline; ALL Coverage Gap Candidate Areas remains the sole map layer, with matching landmarks and 300 m scale and no added layer or dialog.

**Review summary:** All four criteria are supported by their own ordered screenshots and browser-derived GIS URL records. The coverage-gap loading error is visible in the baseline and remains unchanged throughout.
