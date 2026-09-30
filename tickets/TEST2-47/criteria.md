<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

# Acceptance Criteria

- [ ] With a Surveyor layer loaded in V4 GIS, the layer's legend displays a `Display Settings` control directly beneath it.
- [ ] With a Surveyor layer loaded, the Display Settings control exposes the active legend/colouring option and the `Show Linked Sites` option.
- [ ] When linked sites are enabled and the zoom prerequisite is satisfied, the Display Settings control exposes `Show Linked Cells`; when either prerequisite is not satisfied, `Show Linked Cells` is unavailable.
- [ ] When the active legend is `Band` and linked sites are shown, the Display Settings control exposes `Colour Point Links By Azimuth/Band`; for another legend or with linked sites hidden, that control is unavailable.
- [ ] When the active legend is `Building`, the Display Settings control exposes `Show Labels`; for another legend, `Show Labels` is unavailable.
- [ ] The Surveyor Display Settings control does not expose a `Sector` option.
- [ ] After changing an available presentation setting, the Surveyor layer's underlying filtered result set remains unchanged while the selected presentation setting is reflected in the layer display.
- [ ] After changing Surveyor presentation settings, restoring the GIS to its normal saved/restored state retains those settings and their corresponding layer display.
