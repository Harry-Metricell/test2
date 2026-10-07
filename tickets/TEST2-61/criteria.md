<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] With GIS open, one test-created Surveyor layer loaded using defaults, and Search layers empty, the unfiltered catalogue visibly includes Surveyor and the recorded non-Surveyor catalogue entry, while the test-created layer is identifiable in Map layers or the legend.
- [ ] After entering TEST2_NO_SUCH_LAYER_20261006 in Search layers, neither recorded catalogue entry is visible in the filtered catalogue.
- [ ] While the non-matching search is active, the entered search text remains visible and the Map layers list is unchanged from the pre-search state.
- [ ] After clearing Search layers, both recorded catalogue entries are visible again.
- [ ] After clearing the non-matching search, the original Map layers list is unchanged, with no layer added or removed.
- [ ] After searching for Surveyor in Search layers, the Surveyor catalogue entry is visible.
- [ ] After clearing the Surveyor search, the original catalogue and the same loaded layers are restored.
- [ ] The search journey completes without an error page or sign-in screen interrupting it.
