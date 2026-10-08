<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] With GIS open, the Search layers field accepts Surveyor, keeps the entered text visible, shows the Surveyor catalogue entry in the filtered results, and keeps the map visible.
- [ ] Replacing the search text with zzqa_no_layer_match_20261008 keeps that text visible, shows no matching layer entries, and leaves GIS usable with the map visible rather than an application-error page or sign-in screen.
- [ ] Clearing Search layers with its normal UI control leaves the field empty, restores the baseline visible catalogue groups and Surveyor entry, and preserves the baseline Map layers entries and order, including leaving the list absent when it was absent at baseline.
- [ ] After the no-match search has been cleared, entering Surveyor again keeps the text visible, shows the Surveyor catalogue entry, and keeps the map visible.
