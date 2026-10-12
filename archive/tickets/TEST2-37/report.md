# TEST2-37 Evidence Review

- **Ticket:** TEST2-37 — Reload the V4 Dashboards placeholder and return to launcher
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** When the user is signed in on the launcher and selects the Dashboards card, the application navigates to `https://o2intelligence-v4-dev.metricell.com/dashboards` and displays both the `Under construction` message and a `Back to Launcher` button.
   - The selected attempt’s screenshot shows the Dashboards placeholder with Under construction and Back to Launcher. The corresponding browserUrl is https://o2intelligence-v4-dev.metricell.com/dashboards, on the expected V4 host.
2. **Passed:** When the Dashboards placeholder is displayed, reloading the page keeps the `Under construction` message and `Back to Launcher` button visible and does not display an application error.
   - The selected attempt’s after-reload screenshot shows the placeholder, Under construction, and Back to Launcher with no visible application error. The corresponding browserUrl is https://o2intelligence-v4-dev.metricell.com/dashboards, on the expected V4 host.
3. **Passed:** When the user selects `Back to Launcher` from the Dashboards placeholder, the application navigates to `https://o2intelligence-v4-dev.metricell.com/launcher` and displays the Dashboards card.
   - The selected attempt’s after-back screenshot shows the Launcher and Dashboards card. The corresponding browserUrl is https://o2intelligence-v4-dev.metricell.com/launcher, on the expected V4 host.

**Review summary:** 
