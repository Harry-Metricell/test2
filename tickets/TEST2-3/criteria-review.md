# Criteria Review: TEST2-3

Schema: v4-qa-criteria-review.v1
Ticket: TEST2-3
Jira: https://metricell.atlassian.net/browse/TEST2-3
Source files:
- tickets/TEST2-3/ticket.json
- status/generated/TEST2-3.json

## Review Summary

The ticket asks for Beacon favourites behavior to work: a user can favourite a Beacon, see it appear in favourites, then unfavourite it and see it removed from favourite Beacons.

## Conservative Acceptance Criteria

1. Given a user can access a Beacon, when the user marks that Beacon as a favourite, then the Beacon is added to the user's favourites.
2. Given a Beacon has been marked as a favourite, when the user views favourite Beacons, then that Beacon is shown in the favourites list or favourites view.
3. Given a Beacon is currently marked as a favourite, when the user removes the favourite state, then the Beacon is no longer marked as a favourite.
4. Given a Beacon has been unfavourited, when the user views favourite Beacons, then that Beacon is no longer shown in the favourites list or favourites view.

## Warnings

- WARNING: The imported ticket has no explicit acceptanceCriteria entries; these criteria are conservatively inferred from the free-text Jira description only.
- WARNING: The ticket does not identify the exact SmartTools page, controls, labels, persistence expectations, sorting/filtering behavior, user scope, tenant scope, or error handling for Beacon favourites.
- WARNING: The imported ticket status is `READY FOR TESTING`, but this review does not claim Jira acceptance, QA completion, or product pass.

## QA Notes

- QA outcome remains `Not Tested` in the generated status data.
- Automation suitability remains `Unclassified` until the Beacon favourites UI location, stable selectors, seeded Beacon data, and expected persistence scope are confirmed.
- Evidence should show the Beacon before favouriting, after favouriting in the favourites view, after unfavouriting, and absent from favourites after removal.

## No Jira Mutation

No Jira fields were changed. This file is a repository criteria review only.
