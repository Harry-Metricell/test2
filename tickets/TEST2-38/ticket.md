# TEST2-38: Open API Request Audit twice from the V4 launcher

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Unverified
- Workflow state: Retry Queued
- Action owner: Coordinator
- Next action: Retry 1/3 queued; coordinator will start tester
- Jira: https://metricell.atlassian.net/browse/TEST2-38

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Verify that a user can return to the V4 launcher and reopen API Request Audit during the same browser session. Start at https://o2intelligence-v4-dev.metricell.com/launcher and sign in if prompted. Open the API Request Audit card, return to the launcher using the browser Back control, then open the same card again. Confirm both openings show the API Request Audit module on the same V4 host without an application load error, and that the launcher is visible between openings. Capture browser evidence with URLs for both openings and the intermediate launcher. Do not create or modify audit data.
