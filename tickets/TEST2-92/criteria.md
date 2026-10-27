<!-- Testing scope: Automobile. Read config/testing-context/TEST2-92.json for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->
<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] With a standard Automobile layer active, the legend shows the titled groups and items defined by that layer’s selected legend section, using the configured categories, thresholds, colours, shapes and outlines.
- [ ] When a visible legend item is selected, matching points in the active layer are hidden and the item is visibly muted; selecting it again restores the points and normal item appearance.
- [ ] When a legend item is double-clicked, that item remains visible and all other items in its group are hidden; items in other groups retain their visibility.
- [ ] Legend filtering and legend edits change only the active layer’s presentation; other layers, underlying data, and form-based filters retain their prior state.
- [ ] When a layer supplies one Colour By field, its title is displayed as a label; when it supplies multiple fields, a dropdown displays exactly those fields.
- [ ] When Colour By changes on a consuming layer that supplies multiple fields and measurements, the displayed groups, map classification, markers and linked-context visibility follow the selected field, form filters remain unchanged, and the same points are not fetched again. This end-to-end behavior requires a multi-field consuming layer; current Automobile types provide only one field.
- [ ] Restoring a layer’s state restores its selected Colour By field and that field’s saved overrides independently of other layers.
- [ ] In Edit Legend, changing labels, colours or numeric boundaries creates drafts for the active field only; the map remains unchanged until Save, while Cancel or Close discards drafts. After Save, refreshed values remain visible in the open dialog.
- [ ] After a valid legend edit is saved, the legend and cached map points use the same labels, colours and classification; saved overrides for other fields and layers remain unchanged.
- [ ] In a numeric generation group, the add control below the marker column adds a range row, eligible rows have delete controls, at least one range remains, and editing a value does not reorder Automobile rows.
- [ ] Numeric Value fields use number inputs. Empty, non-finite, out-of-limit or incorrectly ordered boundary values show an inline error immediately and disable Save. HTTP Browsing boundaries accept 0–10,000; Ping and Video Streaming boundaries have a minimum of zero and no additional maximum. Video Streaming categories cannot be changed.
- [ ] Reset displays default labels, colours, boundaries, categories and visibility as drafts; saving applies defaults to the active field only, preserving other fields and layers.
- [ ] Linked-site and linked-cell display settings use the shared Network context and follow visible result categories; linked cells are disabled when linked sites are off, and settings persist per layer.
- [ ] With or without a details tab, the legend remains scrollable when the map pane is resized and does not overlap Reset North or other map controls.
- [ ] For existing consumers of the shared legend, established markers, visibility, editor actions and default behavior remain unchanged unless a consumer opts into the new options.
