# TEST2-88 Evidence Review

- **Ticket:** TEST2-88 — Configure MS Teams Call map display settings
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Blocked:** Given the MS Teams Call layer is active, when the user opens its display settings, then the configured map-colouring choices and controls for detailed routes, linked sites and linked cells are visible.
   - criterion-1-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; display controls could not be inspected.
2. **Blocked:** Given the MS Teams Call layer is active and a configured colouring choice is selected, when the map updates, then MS Teams Call result points and the legend display the selected configured colouring and its corresponding legend section.
   - criterion-2-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; colouring and its corresponding legend could not be exercised.
3. **Blocked:** Given the MS Teams Call layer is active, when the user turns detailed routes on and the map refreshes, then detailed route geometry for the active MS Teams Call results is visible.
   - criterion-3-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; enabling detailed routes could not be exercised.
4. **Blocked:** Given the MS Teams Call layer is active and detailed routes are visible, when the user turns detailed routes off and the map refreshes, then that detailed route geometry is hidden.
   - criterion-4-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; disabling detailed routes could not be exercised.
5. **Blocked:** Given the MS Teams Call layer is active and the map is below the configured zoom level for linked sites, when display settings are open, then the linked-site control is unavailable and indicates that the user must zoom in.
   - criterion-5-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; linked-site zoom gating and its explanation could not be inspected.
6. **Blocked:** Given the MS Teams Call layer is active and the map is at or above the configured zoom level for linked sites, when the user turns linked sites on and the map refreshes, then linked-site overlays for the active MS Teams Call results are visible.
   - criterion-6-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; enabling linked sites at supported zoom could not be exercised.
7. **Blocked:** Given linked-site overlays are visible at a supported zoom level, when the user turns linked sites off and the map refreshes, then those linked-site overlays are hidden.
   - criterion-7-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; disabling linked-site overlays could not be exercised.
8. **Blocked:** Given linked sites are enabled and the map is at a zoom level that supports linked cells, when display settings are open, then the linked-cell control is available.
   - criterion-8-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; linked-cell availability with linked sites enabled could not be inspected.
9. **Blocked:** Given linked sites are disabled or the map is below the zoom level that supports linked cells, when display settings are open, then the linked-cell control is unavailable.
   - criterion-9-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; linked-cell gating by linked sites or zoom could not be inspected.
10. **Blocked:** Given linked sites are enabled and the map is at a zoom level that supports linked cells, when the user turns linked cells on and the map refreshes, then linked-cell overlays are visible.
   - criterion-10-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; enabling linked-cell overlays could not be exercised.
11. **Blocked:** Given linked-cell overlays are visible, when the user turns linked cells off and the map refreshes, then those linked-cell overlays are hidden.
   - criterion-11-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; disabling linked-cell overlays could not be exercised.
12. **Blocked:** Given any MS Teams Call display setting is changed, when the map refreshes, then the setting is applied only to the active MS Teams Call layer and other visible map layers, standard map filters and legend point-filtering state retain their prior visible states.
   - criterion-12-final.png shows the MS Teams layer search settled at "No layers match this search." The required active MS Teams Call layer was unavailable; layer-specific changes and preservation of other layers, map filters and legend filtering could not be exercised.

**Review summary:** Reviewed all 36 referenced captures from attempt-001. Each criterion's final capture shows no layers matching MS Teams, preventing the required MS Teams Call starting state and display-setting tests.
