# TEST2-3 acceptance criteria

Source: Jira description (conservatively converted)
Jira: https://metricell.atlassian.net/browse/TEST2-3

## Conservative Acceptance Criteria

- [ ] Given a user can access a Beacon, when the user marks that Beacon as a favourite, then the Beacon is added to the user's favourites.
- [ ] Given a Beacon has been marked as a favourite, when the user views favourite Beacons, then that Beacon is shown in the favourites list or favourites view.
- [ ] Given a Beacon is currently marked as a favourite, when the user removes the favourite state, then the Beacon is no longer marked as a favourite.
- [ ] Given a Beacon has been unfavourited, when the user views favourite Beacons, then that Beacon is no longer shown in the favourites list or favourites view.

## WARNINGs

- WARNING: The imported ticket has no explicit acceptanceCriteria entries; these criteria are conservatively inferred from the free-text Jira description only.
- WARNING: The ticket does not identify the exact SmartTools page, controls, labels, persistence expectations, sorting/filtering behavior, user scope, tenant scope, or error handling for Beacon favourites.
- WARNING: The imported ticket status is `READY FOR TESTING`, but this criteria file does not claim Jira acceptance, QA completion, or product pass.

## QA Notes

- QA outcome remains `Not Tested` in the generated status data.
- Automation suitability remains `Unclassified` until the Beacon favourites UI location, stable selectors, seeded Beacon data, and expected persistence scope are confirmed.
- Evidence should show the Beacon before favouriting, after favouriting in the favourites view, after unfavouriting, and absent from favourites after removal.

No Jira fields were changed.
