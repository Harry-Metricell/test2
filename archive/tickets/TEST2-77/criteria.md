<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] From the initial top-of-catalogue view, entering `TEST2-no-match-rehearsal-20261013` leaves that exact query in the search field and shows no matching catalogue entries, including no Surveyor result.
- [ ] Replacing the unmatched query with `Surveyor` without reloading leaves `Surveyor` in the search field and displays its matching catalogue entry.
- [ ] Clearing the search field after the Surveyor result leaves it empty and restores the same catalogue entries and browsing controls visible in the initial top-of-catalogue viewport, at the same browsing position.
- [ ] The visible map retains its initial extent and scale during both query changes and after clearing.
- [ ] The complete active-layer list retains its initial entries and order during both query changes and after clearing, with no new layer added.
