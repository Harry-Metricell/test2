# TEST2-66 Evidence Review

- **Ticket:** TEST2-66 — Cancel edited Surveyor configuration without applying it to the GIS map
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Starting in GIS with the initial visible map and Map layers state recorded, open Surveyor configuration from the Surveyor layer-catalogue control and verify that the dialog displays Username, Cancel, and Add layer controls.
   - Criterion 1's recorded GIS baseline shows the Hangleton/West Hove map at 300 m and sole ALL Coverage Gap Candidate Areas layer; after-open and final show Surveyor with Username, Cancel and Add layer.
2. **Passed:** Enter `TEST2-cancel-check` in Username and verify that the value is visibly present in the Surveyor configuration dialog before cancellation.
   - Criterion 2's before-edit image shows an empty Username; after-edit and final visibly show TEST2-cancel-check before cancellation.
3. **Passed:** Select Cancel and verify that the dialog closes, GIS returns to the recorded map and Map layers state, and no Surveyor layer is added.
   - Criterion 3's recovered, ordered sequence shows the empty dialog, edited Username, then closure after Cancel. After-cancel and final match its recorded map, 300 m scale, Single layout and sole existing layer, with no Surveyor layer. The locator timeout preceded successful recovery and is not an application defect.
4. **Passed:** Reopen Surveyor configuration and verify that the dialog is usable with Username, Cancel, and Add layer controls available.
   - Criterion 4's own sequence shows the edited Username, closed dialog before reopening, and reopened dialog with an empty Username and available Cancel and Add layer controls; cleanup shows successful cancellation.
5. **Passed:** Select Cancel again and verify that the dialog closes without adding a Surveyor layer and the recorded map and Map layers state remains unchanged.
   - Criterion 5's own sequence shows the edited dialog, first closure, reopened empty Username, and second closure. After-second-cancel and final preserve its baseline map, 300 m scale, Single layout and sole ALL Coverage Gap Candidate Areas layer; no Surveyor layer is added.

**Review summary:** All five criteria are supported by direct criterion-owned screenshot sequences. The pre-existing coverage gap candidate load alert remains unchanged. Browser-derived URL records identify the configured development GIS destination.
