<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] Starting in GIS with the initial visible map and Map layers state recorded, open Surveyor configuration from the Surveyor layer-catalogue control and verify that the dialog displays Username, Cancel, and Add layer controls.
- [ ] Enter `TEST2-cancel-check` in Username and verify that the value is visibly present in the Surveyor configuration dialog before cancellation.
- [ ] Select Cancel and verify that the dialog closes, GIS returns to the recorded map and Map layers state, and no Surveyor layer is added.
- [ ] Reopen Surveyor configuration and verify that the dialog is usable with Username, Cancel, and Add layer controls available.
- [ ] Select Cancel again and verify that the dialog closes without adding a Surveyor layer and the recorded map and Map layers state remains unchanged.
