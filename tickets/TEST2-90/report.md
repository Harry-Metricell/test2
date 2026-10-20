## TEST2-90 QA attempt

2 Passed, 1 Failed, 18 Blocked across 21 canonical criteria.

- Passed: fresh CSR default/all four Colour By options; metric-specific MOS legend shapes/grouping.
- Failed: 5G NSA remains exposed in the Call CSR legend and technology filters.
- Shared blocker: GET `/api/platform/automobile/call/points` returned HTTP 500, reproduced with a controlled fresh launcher-to-GIS load. This prevented point calculations, boundary data, clusters, detail tabs and service checks. No visible HTTP error banner was shown; an empty map was not treated as a settled empty dataset.
- Layer reload retained Uplink MOS; the legacy saved-configuration case needs a suitable fixture.

Dependent criteria stopped at the known data prerequisite rather than repeating the same request. Their own launcher captures document where execution stopped, not destination behaviour. Partial legend observations are not full passes for data-dependent assertions. Each result references only its own PNGs. Browser identity was observed through fullVersionList: Google Chrome 155.0.8059.85. All run-created Call layers were removed, metric changes restored before removal, configuration closed without applying changes, and the browser returned to the launcher.
