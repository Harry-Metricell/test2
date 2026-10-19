# TEST2-92 Evidence Review

- **Ticket:** TEST2-92 — Filter Automobile map points using the legend
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Unverified:** With a standard Automobile layer active, the legend shows the titled groups and items defined by that layer’s selected legend section, using the configured categories, thresholds, colours, shapes and outlines.
   - criterion-1-final.png shows titled HTTP Browsing groups, thresholds and distinct marker shapes/colours; Out of Threshold is clipped and no complete scrolled view or independent configured-definition reference establishes exact agreement.
2. **Passed:** When a visible legend item is selected, matching points in the active layer are hidden and the item is visibly muted; selecting it again restores the points and normal item appearance.
   - criterion-2-before-hide.png shows black square Error points and a normal Error legend item; criterion-2-after-hide.png shows those points removed and Error muted; criterion-2-final.png restores the black points and normal item. This criterion-owned sequence retains the same visible map extent and layer list despite the tester's broader interference concern.
3. **Failed:** When a legend item is double-clicked, that item remains visible and all other items in its group are hidden; items in other groups retain their visibility.
   - From criterion-3-before-isolate.png to criterion-3-final.png, 2G <=8 remains visible but >8, >12 and >20 remain unmuted with open-eye icons. The repeated sequence criterion-3-before-repeat-isolate.png / criterion-3-repeat-final.png and label sequence criterion-3-before-label-isolate.png / criterion-3-label-final.png show the same contradiction after the reported double-clicks.
4. **Blocked:** Legend filtering and legend edits change only the active layer’s presentation; other layers, underlying data, and form-based filters retain their prior state.
   - criterion-4-blocker.png shows Automobile alongside Surveyor Ping/Call at the contaminated map extent. Shared-browser interference prevented execution; no criterion-owned filtering/edit baseline and final comparison exists for other layers, data or form filters.
5. **Blocked:** When a layer supplies one Colour By field, its title is displayed as a label; when it supplies multiple fields, a dropdown displays exactly those fields.
   - criterion-5-final.png shows the single Load Time [s] field as a label. The required multi-field consuming-layer fixture and its supplied options were unavailable, so the dropdown branch could not be assessed.
6. **Blocked:** When Colour By changes on a consuming layer that supplies multiple fields and measurements, the displayed groups, map classification, markers and linked-context visibility follow the selected field, form filters remain unchanged, and the same points are not fetched again. This end-to-end behavior requires a multi-field consuming layer; current Automobile types provide only one field.
   - criterion-6-final.png shows only Load Time [s], with unrelated Surveyor layers also present. A consuming layer with multiple fields and measurements was unavailable; switching, cached-point reuse and linked-context changes could not be exercised.
7. **Blocked:** Restoring a layer’s state restores its selected Colour By field and that field’s saved overrides independently of other layers.
   - criterion-7-blocker.png records the interfered GIS state only. The required multi-field layer and saved field-specific overrides were unavailable, and no controlled restoration sequence was executed.
8. **Blocked:** In Edit Legend, changing labels, colours or numeric boundaries creates drafts for the active field only; the map remains unchanged until Save, while Cancel or Close discards drafts. After Save, refreshed values remain visible in the open dialog.
   - criterion-8-blocker.png shows the ordinary legend with Edit Legend closed. Shared-browser interference prevented the draft/edit/Cancel/Close/Save sequence; no map comparison or refreshed open-dialog evidence was captured.
9. **Blocked:** After a valid legend edit is saved, the legend and cached map points use the same labels, colours and classification; saved overrides for other fields and layers remain unchanged.
   - criterion-9-blocker.png shows the ordinary legend only. Shared-browser interference prevented saving an edit and comparing cached point classification or other fields/layers' saved overrides.
10. **Blocked:** In a numeric generation group, the add control below the marker column adds a range row, eligible rows have delete controls, at least one range remains, and editing a value does not reorder Automobile rows.
   - criterion-10-blocker.png shows no numeric editor. Shared-browser interference prevented executing add/delete/minimum-row and value-edit ordering checks.
11. **Blocked:** Numeric Value fields use number inputs. Empty, non-finite, out-of-limit or incorrectly ordered boundary values show an inline error immediately and disable Save. HTTP Browsing boundaries accept 0–10,000; Ping and Video Streaming boundaries have a minimum of zero and no additional maximum. Video Streaming categories cannot be changed.
   - criterion-11-blocker.png shows no Value inputs or validation state. Shared-browser interference prevented the numeric input, invalid-boundary, limits and fixed-category checks.
12. **Blocked:** Reset displays default labels, colours, boundaries, categories and visibility as drafts; saving applies defaults to the active field only, preserving other fields and layers.
   - criterion-12-blocker.png records the interfered GIS state. Shared-browser interference prevented the Reset draft/Save journey and independent default and other-field/layer comparisons.
13. **Blocked:** Linked-site and linked-cell display settings use the shared Network context and follow visible result categories; linked cells are disabled when linked sites are off, and settings persist per layer.
   - criterion-13-blocker.png shows the ordinary legend with Display Settings closed. Shared-browser interference prevented linked-site/cell toggles, category comparison and per-layer persistence checks.
14. **Blocked:** With or without a details tab, the legend remains scrollable when the map pane is resized and does not overlap Reset North or other map controls.
   - criterion-14-blocker.png records a single map layout without a details tab. Shared-browser interference prevented the required resize and with/without-details sequence; scrollability and control avoidance across those states were not assessed.
15. **Blocked:** For existing consumers of the shared legend, established markers, visibility, editor actions and default behavior remain unchanged unless a consumer opts into the new options.
   - criterion-15-blocker.png records the interfered GIS state only. Shared-browser interference prevented exercising existing consumers and comparing their markers, visibility, editor actions and defaults against prior behavior.

**Review summary:** Completed independent review of all 15 criteria from attempt-001; required multi-field fixtures and controlled shared-browser execution were unavailable for blocked criteria.
