<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] Starting from the authorised V4 launcher, open GIS, record the settled map view and complete Map layers entries/order, then open Surveyor configuration without changing existing layers or settings.
- [ ] In the open Surveyor configuration, entering `TEST2-unsaved-first` leaves the complete value visibly present in Username, and selecting Cancel closes the dialog without saving the edit.
- [ ] Reopening Surveyor configuration after the first cancellation shows an empty Username field with no part of `TEST2-unsaved-first` retained.
- [ ] Entering `TEST2-unsaved-second` leaves the complete value visibly present in Username, and selecting Cancel closes the dialog without saving the edit.
- [ ] Reopening Surveyor configuration after the second cancellation shows an empty Username field, with both Cancel and Add layer available.
- [ ] After cancelling the final reopened dialog, the original map view and Map layers entries/order are unchanged and no new Surveyor layer is present.
