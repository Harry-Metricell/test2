# TEST2-5: test 5 confusion v2

## Test Result

- Jira status: READY FOR TESTING
- QA test outcome: Passed
- Workflow state: Awaiting Evidence Review
- Environment: https://smartnetworkv4-o2-uk-dev.metricell.com/gis
- Tested: 2026-09-04T16:02:15.349Z

## Steps Taken

1. Enabled the Beacons layer and confirmed visible map markers.
2. Clicked the visible marker for beacon 447720159336 and confirmed its beacon detail dialog.
3. Used the star control to add the beacon; the control changed to Remove from favourites.
4. Opened Favourites and confirmed 447720159336 appeared; the view showed Favourites (1).
5. Used the star control again to remove the beacon; the Favourites view showed No favourite Beacons yet.

## Acceptance Criteria

- [x] On a visible beacon, use the star control to add it; the beacon appears in Favourites.
- [x] Use the star control again to remove the beacon; it no longer appears in Favourites.

## Original Description

Beacon favourites need checking. Start on a visible beacon, use the star control to add it, open Favourites and confirm it appears, use the star control again to remove it, then confirm it no longer appears.

Local screenshots were retained separately as TEST2-5 evidence.
