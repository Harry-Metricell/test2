<!-- Generated from Jira acceptance criteria. -->

- [ ] Selecting a supported Surveyor layer loads it with that layer's configured defaults.
- [ ] Switching between two Surveyor layers updates the active layer and does not retain the previous layer's configuration.
- [ ] Valid selection state can be restored safely after normal GIS state restoration.
- [ ] Validation: In the V4 GIS layer panel, add two available Surveyor layers, inspect their configurations, switch between them, then restore or reload the GIS state and check the selected layer and its options. This ticket does not require map-point retrieval, detailed filters, clusters, or event Details. It depends on the Surveyor catalogue from VM2ST-225; if it is not available in the test environment, report that dependency rather than claiming a product failure.
