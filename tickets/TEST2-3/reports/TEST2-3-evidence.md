# TEST2-3 Evidence Report

Generated: 2026-09-03T09:44:07+01:00
Ticket: TEST2-3
Browser: Chrome, existing authenticated V4 session

## Criteria Under Test

1. Given a user favourites a Beacon, then the Beacon appears in favourite Beacons.
2. Given a user unfavourites a Beacon, then the Beacon no longer appears in favourite Beacons.

## Test Data

- Beacon layer: Beacons
- Beacon used: first visible Beacon card in the loaded Beacons list
- Initial list mode: All
- Initial ordering: Status

## Evidence Log

### Setup

- The V4 GIS page was already loaded and authenticated.
- The Beacons layer was visible under Tests and Measurements.
- Before adding the Beacons layer, the selected map layer list did not include Beacons.
- After clicking Add layer for Beacons, the selected map layer list included Beacons.
- The Beacons panel opened, showed Loading Beacons, then populated with Beacon cards.

### Criterion 1: Favourite a Beacon

- Before click: In the All view, the first visible Beacon card had an Add to favourites control. The Favourites tab count showed Favourites (0).
- Click action: Add to favourites was clicked on that Beacon card.
- After click: The same card showed Remove from favourites and the Favourites tab count changed to Favourites (1).
- Verification action: The Favourites tab was selected.
- Verification result: The Favourites view displayed the same Beacon card with the Remove from favourites control.

Result: Passed

### Criterion 2: Unfavourite a Beacon

- Before click: In the Favourites view, the same Beacon card was visible with a Remove from favourites control and the Favourites tab count showed Favourites (1).
- Click action: Remove from favourites was clicked on that Beacon card.
- After click: The Favourites tab count changed to Favourites (0).
- Verification result: The Favourites view no longer displayed the Beacon card and showed the empty-state message for no favourite Beacons.

Result: Passed

## Evidence Limitation

Screenshots were captured in the live browser run before and after the Beacons layer click, before and after favouriting, before and after switching to Favourites, and before and after unfavouriting. PNG persistence to the repository was unavailable in this execution environment, so this committed report records the verified UI states in redacted text form.
