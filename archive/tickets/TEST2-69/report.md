# TEST2-69 Evidence Review

- **Ticket:** TEST2-69 — Cancel two different unsaved Surveyor usernames and reopen a clean configuration
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Starting from the authorised V4 launcher, open GIS, record the settled map view and complete Map layers entries/order, then open Surveyor configuration without changing existing layers or settings.
   - Criterion-1 initial shows the authorised launcher; before-open-surveyor records the settled 300 m map and sole visible ALL Coverage Gap Candidate Areas entry; final shows Surveyor open over the same baseline. The browser-derived URL is https://o2intelligence-v4-dev.metricell.com/gis.
2. **Passed:** In the open Surveyor configuration, entering `TEST2-unsaved-first` leaves the complete value visibly present in Username, and selecting Cancel closes the dialog without saving the edit.
   - Criterion-2 after-enter-first and before-cancel-first show the complete TEST2-unsaved-first value; after-cancel-first and final show the dialog closed with no Surveyor layer added.
3. **Passed:** Reopening Surveyor configuration after the first cancellation shows an empty Username field with no part of `TEST2-unsaved-first` retained.
   - Criterion-3 before-cancel-first shows TEST2-unsaved-first, after-cancel-first shows the closed dialog, and final shows the reopened Username entirely empty in this criterion's own sequence.
4. **Passed:** Entering `TEST2-unsaved-second` leaves the complete value visibly present in Username, and selecting Cancel closes the dialog without saving the edit.
   - Criterion-4 records the first edit, cancellation and empty reopening, then before-cancel-second shows the complete TEST2-unsaved-second value; after-cancel-second and final show the dialog closed with no Surveyor layer added.
5. **Passed:** Reopening Surveyor configuration after the second cancellation shows an empty Username field, with both Cancel and Add layer available.
   - Criterion-5 records both complete usernames, both closed-dialog cancellations and the intervening empty reopening; final shows Username empty after the second reopening, with Cancel and Add layer available.
6. **Passed:** After cancelling the final reopened dialog, the original map view and Map layers entries/order are unchanged and no new Surveyor layer is present.
   - Criterion-6 records both edits, cancellations and reopenings; before-final-cancel shows the clean reopened dialog, and after-final-cancel/final show it closed. Compared with its own before-open-surveyor baseline, the sole ALL Coverage Gap Candidate Areas entry/order/visibility, map landmarks and 300 m scale are unchanged, with no Surveyor layer. The existing coverage-gap loading alert is unchanged.

**Review summary:** All six criteria are supported by criterion-owned ordered screenshots and browser-derived GIS URLs.
