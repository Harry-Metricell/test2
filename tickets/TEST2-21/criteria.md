<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

<!-- Converted from the complete TEST2-21 ticket source. Scope is map filtering by Beacon group and profile; side-panel list filtering/synchronisation, status filtering, search/sort, favourites, geofencing, and reports are out of scope. -->

- [ ] Given the Beacon view is loaded and the Beacon data service has returned filter options, when the group and profile controls are opened, then each available group and profile is displayed once with no duplicate option labels.
- [ ] Given the Beacon view is loaded, a group option is available, and Beacons assigned to that group exist, when the user selects the group, then the map refreshes to show only Beacons assigned to the selected group.
- [ ] Given the Beacon view is loaded, a profile option is available, and Beacons assigned to that profile exist, when the user selects the profile, then the map refreshes to show only Beacons assigned to the selected profile.
- [ ] Given the Beacon view is loaded and a selected group and profile are available, when the user selects both filters, then the map refreshes to show only Beacons assigned to both the selected group and the selected profile.
- [ ] Given the selected group and/or profile has no matching Beacons, when the filtered view finishes refreshing, then no Beacon markers are displayed and the map and filter controls remain usable.
- [ ] Given filtered Beacon markers are currently displayed, when the user changes either the group or profile selection and the refreshed results finish loading, then markers from the previous filter selection are no longer displayed.
