# TEST2-91 Evidence Review

- **Ticket:** TEST2-91 — Filter Automobile map results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-002
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** On a standard Automobile map layer, opening filters shows a time filter for a rolling 90-day range.
   - criterion-1-after-automobile.png shows untouched From 22/07/2026 12:54 and To 20/10/2026 12:54, 90 days apart; criterion-1-final.png retains that range in active HTTP Browsing filters.
2. **Passed:** On a standard Automobile map layer, opening filters shows handset fields for MSISDN, SIM MNC, and SIM MCC.
   - criterion-2-final.png directly shows MSISDN, SIM MCC and SIM MNC fields in the active HTTP Browsing Handset section.
3. **Failed:** On a standard Automobile map layer, opening filters shows technology choices for Unknown, 2G, 3G, 4G, 5G NSA, and 5G SA.
   - criterion-3-final.png shows no-service as the technology choice alongside 2G/3G/4G, rather than the required Unknown technology choice. Unknown in a Band summary is a frequency option, not the missing technology choice.
4. **Unverified:** On a standard Automobile map layer, the frequency filter offers the frequencies supplied by the application configuration.
   - criterion-4-band-0-options.png through criterion-4-band-3-options.png and criterion-4-final.png show technology-specific frequency choices. The claimed configuration response is described only in results notes; no independent captured configuration baseline establishes that these are the supplied frequencies.
5. **Passed:** On a standard Automobile map layer, opening filters shows network fields for MCC, MNC, LAC, CI, Site, and Cell.
   - criterion-5-final.png directly shows all six Network fields: MCC, MNC, LAC, CI, Site and Cell.
6. **Blocked:** On a standard Automobile map layer, the device-group filter offers the groups supplied by the application configuration.
   - The results report deviceSegregationRestricted:true and nine configured groups, requiring an authorised unrestricted user to inspect group choices. criterion-6-after-automobile.png and criterion-6-final.png show the available form portions without a device-group control; configured-group choices cannot be assessed in this restricted environment.
7. **Failed:** When SIM MCC, SIM MNC, MCC, MNC, or LAC is edited, each field accepts numeric digits only.
   - criterion-7-after-sim-mcc-digits.png shows 123 accepted; criterion-7-after-sim-mcc-invalid.png, criterion-7-after-sim-mnc-invalid.png, criterion-7-after-mcc-invalid.png, criterion-7-after-mnc-invalid.png and criterion-7-after-lac-invalid.png each visibly retain 123.-e, contradicting digits-only entry.
8. **Passed:** When MSISDN, CI, Site, or Cell is edited, each field accepts text input.
   - criterion-8-before-msisdn.png and criterion-8-after-msisdn.png show empty MSISDN becoming QA-text_91; criterion-8-before-ci.png, criterion-8-after-ci.png, criterion-8-after-site.png and criterion-8-final.png show CI, Site and Cell each accepting QA-text_91.
9. **Blocked:** When one or more filters are applied on a standard Automobile map layer, the displayed map results match the active filter values and are within the user's authorised results.
   - criterion-9-layer-active.png shows baseline points including Site 17279; criterion-9-after-site-filter.png enters 17279 and criterion-9-after-apply.png shows points cleared. The same criterion's reload sequence, criterion-9-reload-after-site.png to criterion-9-final.png, repeats that state. Results report HTTP 500 on both filtered requests despite HTTP 200 baseline retrieval; unavailable filtered data prevents matching and authorised-result checks, and the cleared map is not proof of a successful empty response.
10. **Failed:** On a Call layer, the technology filter does not offer 5G NSA.
   - criterion-10-final.png directly shows Configure Automobile - Call with 5G NSA offered and checked, contradicting its required absence.
11. **Unverified:** When device groups are shown, restricted device-segregation options are not offered.
   - criterion-11-after-automobile.png shows the add form's upper portion and criterion-11-final.png shows the active form's bottom; criterion-11-layer-active.png has no filter panel. No captured state shows device groups displayed, and the complete active form is not captured, so these images do not establish restricted-option exclusion when groups are shown.
12. **Blocked:** On Route Replay, the standard Automobile map filter controls described in this ticket are not available.
   - criterion-12-initial.png and criterion-12-navigation.png show no Route Replay entry; criterion-12-before-route-search.png to criterion-12-final.png shows Route search settling at No layers match this search. Route Replay could not be activated in the available environment to inspect its controls.

**Review summary:** Completed independent screenshot assessment of all 12 canonical criteria in attempt-002; restricted device-group access, failed filtered-data retrieval and unavailable Route Replay block completion.
