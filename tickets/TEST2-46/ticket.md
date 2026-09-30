# TEST2-46: Verify Surveyor layer defaults and switching in V4 GIS

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Not Tested
- Workflow state: Ready
- Action owner: Coordinator
- Next action: Create testing handoff
- Jira: https://metricell.atlassian.net/browse/TEST2-46

## Acceptance Criteria

1. Selecting a supported Surveyor layer loads it with that layer's configured defaults.
2. Switching between two Surveyor layers updates the active layer and does not retain the previous layer's configuration.
3. Valid selection state can be restored safely after normal GIS state restoration.
4. Validation: In the V4 GIS layer panel, add two available Surveyor layers, inspect their configurations, switch between them, then restore or reload the GIS state and check the selected layer and its options. This ticket does not require map-point retrieval, detailed filters, clusters, or event Details. It depends on the Surveyor catalogue from VM2ST-225; if it is not available in the test environment, report that dependency rather than claiming a product failure.

## Subtasks

No subtasks imported.

## Description

Source: https://metricell.atlassian.net/browse/VM2ST-227
Copied from a Done VMO2 SmartTools subtask for TEST2 browser QA. The SmartTools issue remains unchanged.
Purpose: Each Surveyor GIS layer should have its own persisted default configuration and selection behaviour.
Acceptance criteria:
Selecting a supported Surveyor layer loads it with that layer's configured defaults.
Switching between two Surveyor layers updates the active layer and does not retain the previous layer's configuration.
Valid selection state can be restored safely after normal GIS state restoration.
Validation: In the V4 GIS layer panel, add two available Surveyor layers, inspect their configurations, switch between them, then restore or reload the GIS state and check the selected layer and its options. This ticket does not require map-point retrieval, detailed filters, clusters, or event Details. It depends on the Surveyor catalogue from VM2ST-225; if it is not available in the test environment, report that dependency rather than claiming a product failure.
