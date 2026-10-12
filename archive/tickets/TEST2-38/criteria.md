<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

# Acceptance Criteria

- [ ] Starting at `https://o2intelligence-v4-dev.metricell.com/launcher`, with the V4 launcher displayed and the user signed in if prompted, select the **API Request Audit** card.
- [ ] After the first card selection, verify that the API Request Audit module is displayed on the `o2intelligence-v4-dev.metricell.com` V4 host and no application load error is shown.
- [ ] From the first API Request Audit module view, use the browser Back control and verify that the V4 launcher is displayed again.
- [ ] From the restored V4 launcher, select the **API Request Audit** card a second time during the same browser session.
- [ ] After the second card selection, verify that the API Request Audit module is displayed again on the `o2intelligence-v4-dev.metricell.com` V4 host and no application load error is shown.
- [ ] Across the two module openings, verify that the browser URLs identify the same V4 host and that the intermediate launcher view is visible between the openings.
- [ ] During this flow, verify that no audit data is created or modified.
