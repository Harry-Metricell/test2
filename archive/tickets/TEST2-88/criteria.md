<!-- Testing scope: Automobile. Read config/testing-context/TEST2-88.json for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->
<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] Given the MS Teams Call layer is active, when the user opens its display settings, then the configured map-colouring choices and controls for detailed routes, linked sites and linked cells are visible.
- [ ] Given the MS Teams Call layer is active and a configured colouring choice is selected, when the map updates, then MS Teams Call result points and the legend display the selected configured colouring and its corresponding legend section.
- [ ] Given the MS Teams Call layer is active, when the user turns detailed routes on and the map refreshes, then detailed route geometry for the active MS Teams Call results is visible.
- [ ] Given the MS Teams Call layer is active and detailed routes are visible, when the user turns detailed routes off and the map refreshes, then that detailed route geometry is hidden.
- [ ] Given the MS Teams Call layer is active and the map is below the configured zoom level for linked sites, when display settings are open, then the linked-site control is unavailable and indicates that the user must zoom in.
- [ ] Given the MS Teams Call layer is active and the map is at or above the configured zoom level for linked sites, when the user turns linked sites on and the map refreshes, then linked-site overlays for the active MS Teams Call results are visible.
- [ ] Given linked-site overlays are visible at a supported zoom level, when the user turns linked sites off and the map refreshes, then those linked-site overlays are hidden.
- [ ] Given linked sites are enabled and the map is at a zoom level that supports linked cells, when display settings are open, then the linked-cell control is available.
- [ ] Given linked sites are disabled or the map is below the zoom level that supports linked cells, when display settings are open, then the linked-cell control is unavailable.
- [ ] Given linked sites are enabled and the map is at a zoom level that supports linked cells, when the user turns linked cells on and the map refreshes, then linked-cell overlays are visible.
- [ ] Given linked-cell overlays are visible, when the user turns linked cells off and the map refreshes, then those linked-cell overlays are hidden.
- [ ] Given any MS Teams Call display setting is changed, when the map refreshes, then the setting is applied only to the active MS Teams Call layer and other visible map layers, standard map filters and legend point-filtering state retain their prior visible states.
