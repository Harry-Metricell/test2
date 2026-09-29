# TEST2-39: Reopen API Request Audit after returning to the V4 launcher

## Current State

- Jira status: READY FOR TESTING
- QA outcome: Passed
- Workflow state: Ready
- Action owner: Coordinator
- Next action: QA review complete
- Jira: https://metricell.atlassian.net/browse/TEST2-39

## Acceptance Criteria

No acceptance criteria extracted.

## Subtasks

No subtasks imported.

## Description

Small V4 navigation regression test. Start at https://o2intelligence-v4-dev.metricell.com/launcher and sign in if prompted. Open API Request Audit, use the browser Back control to return to the launcher, then open API Request Audit again in the same browser session. The page should load without an application error on both visits, and the launcher should be visible between them.
Test scope: this is a read-only navigation check. Do not create or modify audit data while testing.
Capture browser evidence of the first module view, the intermediate launcher, and the second module view, including the browser URL.
