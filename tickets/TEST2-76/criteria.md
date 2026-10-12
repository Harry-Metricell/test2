<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] With the GIS catalogue open, entering `TEST2-no-match-showcase-20261012` leaves the query visible and shows no matching catalogue entries, including no Surveyor result.
- [ ] Replacing that query with `Surveyor` without reloading shows the Surveyor matching entry.
- [ ] Opening the Surveyor configuration displays an editable Username field and Cancel and Add layer controls.
- [ ] Entering `TEST2-showcase-unsaved-20261012` in Username and selecting Cancel without Add layer closes the configuration; reopening the same configuration shows an empty Username field.
- [ ] After cancelling the reopened configuration and clearing the catalogue query, the search field is empty and the original catalogue entries and browsing position are restored.
- [ ] After these actions, the visible map and complete active-layer list match their recorded initial states, with no Surveyor layer added.
