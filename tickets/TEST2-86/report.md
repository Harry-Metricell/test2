TEST2-86: 4 Passed, 4 Failed, 2 Blocked.

Summary omits duration/service fields; table omits Upload Rate/Size units, sorting does not change order, and filtering controls are absent. Chart series and units passed. Average-metric placement and zero-duration handling require matching live fixtures.

Loading was captured by delaying the real analysis request. No-data and error states passed with explicitly controlled browser-only empty/HTTP 500 responses; these are UI-path checks, not evidence of live backend failures. Routes were removed, Retry recovered real samples, test-created layers/tabs were cleared, and the browser returned to the launcher.
