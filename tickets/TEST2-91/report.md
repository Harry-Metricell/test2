# TEST2-91 Evidence Review

- **Ticket:** TEST2-91 — Filter Automobile map results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** On a standard Automobile map layer, opening filters shows a time filter for a rolling 90-day range.
   - criterion-1-after-open-automobile.png independently shows the initial From 21/07/2026 14:26 and To 19/10/2026 14:26, a 90-day interval ending on the test date. criterion-1-after-add-layer.png shows the new HTTP Browsing layer; criterion-1-final.png shows the same date range when its configuration is opened.
2. **Passed:** On a standard Automobile map layer, opening filters shows handset fields for MSISDN, SIM MNC, and SIM MCC.
   - criterion-2-restart-after-open-automobile.png and criterion-2-final.png visibly show MSISDN, SIM MCC and SIM MNC under Handset for HTTP Browsing after the independent restart and layer creation.
3. **Unverified:** On a standard Automobile map layer, opening filters shows technology choices for Unknown, 2G, 3G, 4G, 5G NSA, and 5G SA.
   - criterion-3-final.png shows no-service, 2G, 3G and 4G; Unknown appears in Band values. The lower technology controls are outside the captured viewport, so the complete list, 5G NSA/SA availability and absence of an Unknown technology cannot be established from screenshots. The tester's DOM observations alone do not confirm the reported defect. criterion-3-after-open-gis.png is still loading; the later modal and layer captures show recovery.
4. **Blocked:** On a standard Automobile map layer, the frequency filter offers the frequencies supplied by the application configuration.
   - criterion-4-after-open-automobile.png and criterion-4-final.png show populated Band controls, but no authoritative configured-frequency reference is available to compare the offered values or establish configuration provenance. Surveyor layers and a cluster table are already present in criterion-4-after-open-gis.png and remain in the final view.
5. **Blocked:** On a standard Automobile map layer, opening filters shows network fields for MCC, MNC, LAC, CI, Site, and Cell.
   - Network-field execution was prevented by the recorded browser navigation approval-review timeout and unreliable shared browser state. No criterion-specific browser evidence was captured; testing could not be completed.
6. **Blocked:** On a standard Automobile map layer, the device-group filter offers the groups supplied by the application configuration.
   - Device-group execution was prevented by the recorded browser navigation approval-review timeout and unreliable shared browser state. No criterion-specific browser evidence was captured; testing could not be completed.
7. **Blocked:** When SIM MCC, SIM MNC, MCC, MNC, or LAC is edited, each field accepts numeric digits only.
   - Numeric-input editing was prevented by the recorded browser navigation approval-review timeout and unreliable shared browser state. No criterion-specific browser evidence was captured for SIM MCC, SIM MNC, MCC, MNC or LAC; testing could not be completed.
8. **Blocked:** When MSISDN, CI, Site, or Cell is edited, each field accepts text input.
   - Text-input editing was prevented by the recorded browser navigation approval-review timeout and unreliable shared browser state. No criterion-specific browser evidence was captured for MSISDN, CI, Site or Cell; testing could not be completed.
9. **Blocked:** When one or more filters are applied on a standard Automobile map layer, the displayed map results match the active filter values and are within the user's authorised results.
   - Applying filters and checking matching authorised results was prevented by the recorded browser navigation approval-review timeout and unreliable shared browser state. No criterion-specific browser evidence was captured; testing could not be completed.
10. **Blocked:** On a Call layer, the technology filter does not offer 5G NSA.
   - Call-layer technology execution was prevented by the recorded browser navigation approval-review timeout and unreliable shared browser state. No criterion-specific browser evidence was captured to assess 5G NSA exclusion; testing could not be completed.
11. **Blocked:** When device groups are shown, restricted device-segregation options are not offered.
   - Restricted device-segregation execution was prevented by the recorded browser navigation approval-review timeout and unreliable shared browser state. No criterion-specific browser evidence was captured; testing could not be completed.
12. **Blocked:** On Route Replay, the standard Automobile map filter controls described in this ticket are not available.
   - Route Replay execution was prevented by the recorded browser navigation approval-review timeout and unreliable shared browser state. No criterion-specific browser evidence was captured to assess the absence of standard-map filters; testing could not be completed.

**Review summary:** Independent screenshot review completed for all 12 criteria; configuration-reference and browser-execution blockers prevent completion. The reported technology defect is inconclusive because the full list was not captured.
