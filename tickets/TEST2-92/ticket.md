# TEST2-92: Filter Automobile map points using the legend

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Blocked
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create final evidence review handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-92

## Acceptance Criteria

1. Given a standard Automobile map layer is active, when its legend is displayed, then it shows the groups and items from the active selected legend section.
2. Given the user selects an interactive legend item, when the visibility changes, then matching active-layer points are shown or hidden accordingly.
3. Given the user double-clicks an interactive legend item, when isolation is applied, then that item remains visible and the other items in its group are hidden.
4. Given an item is hidden, when the legend and map are displayed, then the item is visually muted and its matching points are not displayed.
5. Given the versioned legend definitions change, when the updated application is deployed, then the legend and map use the same defined groups, thresholds, colours and shapes.
6. Given the user uses legend filtering, when other layers or form-based filters are considered, then they are not changed by that interaction.
7. Additional acceptance criteria:
8. Given a layer supplies multiple titled legend groups, when the shared interactive list renders them, then each group's title, items and configured marker shapes/outlines are shown, and isolation affects only sibling items.
9. Given a layer supplies one Colour By option, when the legend renders, then its field title appears as a label; given multiple options, then a dropdown shows exactly the layer-supplied options.
10. Given a consuming layer supplies multiple fields and their measurements, when Colour By changes, then the displayed groups, map classification, markers and linked-context visibility follow the selected field without changing form filters or fetching the same points again. Do not claim this end-to-end check passed using the current single-field Automobile types.
11. Given Colour By is selected, when the layer state is restored, then that layer's selected field and saved field-specific overrides are restored independently of other layers.
12. Given Edit Legend is opened, when labels, colours or numeric boundaries are edited, then the dialog holds drafts for only the active field; the map changes only after Save, while Cancel or Close discards unsaved drafts. A successful Save refreshes the drafts and leaves the dialog open.
13. Given a valid edit is saved, when the legend and cached map points render, then labels, colours and classification use the same saved definition; other fields and layers retain their saved overrides.
14. Given a numeric generation group is edited, when the user adds or deletes a range, then the small add icon below the group's marker column adds a row, each eligible existing or added row has a delete action, at least one numeric range remains, and editing a value does not reorder Automobile rows.
15. Given a Value field is editable, when a value is empty, non-finite, outside its limits or violates boundary ordering, then an inline error appears immediately and Save is disabled. Numeric fields use number inputs; HTTP Browsing boundaries are limited to 0–10,000, while Ping and Video Streaming use a minimum of zero without an additional maximum cap. Video Streaming's exact categories remain fixed.
16. Given Reset is selected, when defaults are shown, then they remain drafts until Save; saving restores the active field's default labels, colours, boundaries, categories and visibility without resetting other fields or layers.
17. Given linked-site display settings change, when the map updates, then linked sites/cells use the shared Network context and follow visible result categories. Linked cells are disabled when linked sites are off, and the settings persist per layer.
18. Given the legend is displayed with or without a details tab, when the map pane resizes, then the legend remains scrollable and avoids Reset North and the other map controls.
19. Given existing layers use shared legend components, when this change is integrated, then their established markers, visibility, editor actions and default behaviour remain unchanged unless they opt into the new options. Verify Automobile and existing consumers manually.

## Subtasks

No subtasks imported.

## Description

As a SmartTools user
I want to use the active layer’s legend to show or hide categories of map points
So that I can focus the map on the result categories relevant to my investigation.
Issue/Change Description:
Provide an interactive legend for standard Automobile map layers. Render the groups and items defined by the active layer’s selected legend section; categories, thresholds, colours and shapes remain configuration-driven.
Selecting an interactive legend item toggles the visibility of matching map points. Double-clicking an item isolates that item within its group by hiding the other items. Hidden items are visually muted in the legend and their matching points are not displayed on the map.
Legend filtering and editing affect only the active layer's presentation. They do not change the underlying data or replace the form-based map filters.
Scope refinement (2026-10-07):
Extend the shared interactive legend components to render multiple titled groups and reuse them in Automobile. Include legend editing, numeric range management, and linked-site/cell display settings.
Provide a reusable Colour By selector placed in the layer-owned legend content. Options and selected-field definitions belong to the layer; the generic list renders the supplied groups. A single option appears as a label; multiple options appear as a dropdown. Edit Legend handles only the selected field's groups, with no drafts retained for other fields.
This supersedes the earlier exclusions of editing and a metric selector. Current Automobile coverage remains HTTP Browsing, Ping and Video Streaming, each with one defined field. Multiple-field support is a reusable component contract; end-to-end switching requires a consuming layer that supplies those fields and measurements. Service, Download, Upload, Band/frequency lookup, SQL changes and Route Replay are outside this legend change. Definitions remain versioned code configuration, rather than runtime database configuration.
Acceptance Criteria:
Given a standard Automobile map layer is active, when its legend is displayed, then it shows the groups and items from the active selected legend section.
Given the user selects an interactive legend item, when the visibility changes, then matching active-layer points are shown or hidden accordingly.
Given the user double-clicks an interactive legend item, when isolation is applied, then that item remains visible and the other items in its group are hidden.
Given an item is hidden, when the legend and map are displayed, then the item is visually muted and its matching points are not displayed.
Given the versioned legend definitions change, when the updated application is deployed, then the legend and map use the same defined groups, thresholds, colours and shapes.
Given the user uses legend filtering, when other layers or form-based filters are considered, then they are not changed by that interaction.
Additional acceptance criteria:
Given a layer supplies multiple titled legend groups, when the shared interactive list renders them, then each group's title, items and configured marker shapes/outlines are shown, and isolation affects only sibling items.
Given a layer supplies one Colour By option, when the legend renders, then its field title appears as a label; given multiple options, then a dropdown shows exactly the layer-supplied options.
Given a consuming layer supplies multiple fields and their measurements, when Colour By changes, then the displayed groups, map classification, markers and linked-context visibility follow the selected field without changing form filters or fetching the same points again. Do not claim this end-to-end check passed using the current single-field Automobile types.
Given Colour By is selected, when the layer state is restored, then that layer's selected field and saved field-specific overrides are restored independently of other layers.
Given Edit Legend is opened, when labels, colours or numeric boundaries are edited, then the dialog holds drafts for only the active field; the map changes only after Save, while Cancel or Close discards unsaved drafts. A successful Save refreshes the drafts and leaves the dialog open.
Given a valid edit is saved, when the legend and cached map points render, then labels, colours and classification use the same saved definition; other fields and layers retain their saved overrides.
Given a numeric generation group is edited, when the user adds or deletes a range, then the small add icon below the group's marker column adds a row, each eligible existing or added row has a delete action, at least one numeric range remains, and editing a value does not reorder Automobile rows.
Given a Value field is editable, when a value is empty, non-finite, outside its limits or violates boundary ordering, then an inline error appears immediately and Save is disabled. Numeric fields use number inputs; HTTP Browsing boundaries are limited to 0–10,000, while Ping and Video Streaming use a minimum of zero without an additional maximum cap. Video Streaming's exact categories remain fixed.
Given Reset is selected, when defaults are shown, then they remain drafts until Save; saving restores the active field's default labels, colours, boundaries, categories and visibility without resetting other fields or layers.
Given linked-site display settings change, when the map updates, then linked sites/cells use the shared Network context and follow visible result categories. Linked cells are disabled when linked sites are off, and the settings persist per layer.
Given the legend is displayed with or without a details tab, when the map pane resizes, then the legend remains scrollable and avoids Reset North and the other map controls.
Given existing layers use shared legend components, when this change is integrated, then their established markers, visibility, editor actions and default behaviour remain unchanged unless they opt into the new options. Verify Automobile and existing consumers manually.
Object Change List:
Merge Requests
Docusaurus Requests
Merge to Master:
Application Merge Requests
Merge to test:
Merge to main:
Project Upgrader Merge Requests
Feature folder merge:
Version folder Merge:
Database Merge Requests
Merge to staging:
Merge to main:
