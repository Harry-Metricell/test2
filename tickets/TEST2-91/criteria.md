<!-- Testing scope: Automobile. Read config/testing-context/TEST2-91.json for source hierarchy and the human resolution of conflicting links. Do not substitute another module. -->
<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

<!-- Testing context: Source VM2ST-114 (https://metricell.atlassian.net/browse/VM2ST-114), parent VM2ST-66 (Automobile Migration); human-confirmed target is Automobile, Standard Automobile layers. User confirmed this copied batch is for Automobile migration; do not substitute Surveyor. -->

- [ ] Given an Automobile filter is edited, when SIM MCC is entered, then the field accepts numeric digits only.
- [ ] Given an Automobile filter is edited, when SIM MNC is entered, then the field accepts numeric digits only.
- [ ] Given an Automobile filter is edited, when MCC is entered, then the field accepts numeric digits only.
- [ ] Given an Automobile filter is edited, when MNC is entered, then the field accepts numeric digits only.
- [ ] Given an Automobile filter is edited, when LAC is entered, then the field accepts numeric digits only.
- [ ] Given an Automobile filter is edited, when MSISDN, CI, Site or Cell is entered, then each field accepts text input.
- [ ] Given a standard Automobile map layer is active, when filters are opened, then a rolling 90-day time range filter is available.
- [ ] Given a standard Automobile map layer is active, when filters are opened, then handset filters for MSISDN, SIM MNC and SIM MCC are available.
- [ ] Given a standard Automobile map layer is active, when filters are opened, then technology filters for no-Service, 2G, 3G, 4G, 5G NSA and 5G SA are available.
- [ ] Given a standard Automobile map layer is active, when filters are opened, then network filters for MCC, MNC, LAC, CI, Site and Cell are available.
- [ ] Given a standard Automobile map layer is active, when filters are opened, then available device-group filters are shown.
- [ ] Given configured frequencies are available, when filters are displayed, then those frequencies are offered from configuration rather than being hard-coded.
- [ ] Given configured device groups are available, when filters are displayed, then those device groups are offered from configuration rather than being hard-coded.
- [ ] Given one or more filters are applied and results reload, then only map results matching the active criteria and authorised for the user are shown.
- [ ] Given a restricted device-segregation option exists, when device groups are displayed, then that option is unavailable.
- [ ] Given Route Replay is active, when filters are viewed, then this story’s standard-map filter controls do not apply.
