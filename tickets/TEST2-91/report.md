# TEST2-91 Evidence Review

- **Ticket:** TEST2-91 — Filter Automobile map results
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)
- **Editable report:** [Download Word (.docx)](report.docx)

## Criterion results

1. **Passed:** Given an Automobile filter is edited, when SIM MCC is entered, then the field accepts numeric digits only.
   - Automobile - Call SIM MCC is empty after the recorded non-digit/decimal attempt in criterion-1-rejected-decimal-c2d25496-b196-4660-9fe5-0324524afa45.png and retains 234 in criterion-1-final-2f1f1e30-5c0f-4606-8f08-db03d844163f.png.
2. **Passed:** Given an Automobile filter is edited, when SIM MNC is entered, then the field accepts numeric digits only.
   - Automobile - Call SIM MNC retains 15 before and after the recorded decimal, negative and letter attempts: criterion-2-digits-39f0d613-8b6b-468b-84a8-a1779f921216.png, criterion-2-final-f421c474-9bdd-44fb-945f-40fc59aaf1cb.png.
3. **Passed:** Given an Automobile filter is edited, when MCC is entered, then the field accepts numeric digits only.
   - Automobile - Call MCC retains 234 before and after the recorded decimal, negative and letter attempts: criterion-3-digits-03e64436-14f4-4381-a8d1-0592f4430478.png, criterion-3-final-1934503f-0c94-4959-ad48-41cbc212b980.png.
4. **Passed:** Given an Automobile filter is edited, when MNC is entered, then the field accepts numeric digits only.
   - Automobile - Call MNC retains 15 before and after the recorded decimal, negative and letter attempts: criterion-4-digits-ab0726a4-79cb-4917-975d-af93952b82a9.png, criterion-4-final-e64e9fb8-431d-4c39-a717-8f92cc1c0f75.png.
5. **Passed:** Given an Automobile filter is edited, when LAC is entered, then the field accepts numeric digits only.
   - Automobile - Call LAC retains 12345 before and after the recorded decimal, negative and letter attempts: criterion-5-digits-d43fbb5b-c444-4540-b8cb-5b74092eb59e.png, criterion-5-final-c3609be0-5e24-4d34-99a2-f6bf9b636310.png.
6. **Passed:** Given an Automobile filter is edited, when MSISDN, CI, Site or Cell is entered, then each field accepts text input.
   - MSISDN visibly retains QA-text+0123 in criterion-6-msisdn-9178f7f8-db4a-4456-9370-862564df2aaf.png; CI, Site and Cell each retain that text in criterion-6-final-5ae9530e-58f2-41a2-8718-94504bf1e10d.png under Configure Automobile - Call.
7. **Unverified:** Given a standard Automobile map layer is active, when filters are opened, then a rolling 90-day time range filter is available.
   - The From/To controls visibly offer 4 August–2 November 2026 and a date/time picker in criterion-7-range-ff405097-ddb1-47d7-b2b8-758ee69519a1.png, criterion-7-final-cfb8bdf4-4b00-4943-bdc9-7395def76f7e.png. A saved 90-day interval and opened calendar do not establish that the window rolls with time; no independent rolling-window baseline or advancing state is supplied.
8. **Passed:** Given a standard Automobile map layer is active, when filters are opened, then handset filters for MSISDN, SIM MNC and SIM MCC are available.
   - All three labelled handset inputs are visible under Configure Automobile - Call in criterion-8-final-7ea919d0-4dd0-4e70-a44f-1b28521140e1.png. The unrelated Automobile Call details panel and changed map framing are disclosed in the tester report; this capture still directly establishes the named controls, not any detail-panel behaviour.
9. **Passed:** Given a standard Automobile map layer is active, when filters are opened, then technology filters for no-Service, 2G, 3G, 4G, 5G NSA and 5G SA are available.
   - The Automobile - Call Technology section shows no-service, 2G, 3G and 4G in criterion-9-technology-top-9bce3dce-085b-4076-9c64-5f0433e7a860.png and overlapping 3G, 4G, 5G NSA and 5G SA in criterion-9-final-f91b1aab-0dbf-4eeb-8f97-695ab75e7327.png.
10. **Passed:** Given a standard Automobile map layer is active, when filters are opened, then network filters for MCC, MNC, LAC, CI, Site and Cell are available.
   - The Automobile - Call Network section visibly includes MCC, MNC, LAC, CI, Site and Cell in criterion-10-network-top-a965b550-bff8-4bd9-b282-c5cbdc365e8c.png, criterion-10-final-75d2f765-d683-4ccc-a214-012e0d721d37.png.
11. **Failed:** Given a standard Automobile map layer is active, when filters are opened, then available device-group filters are shown.
   - The SHA-256-verified criterion-11-filter-options.json contains nine device groups in the genuine GET /api/platform/automobile/filter-options body identified by the recorded steps. Configure Automobile - Call top, nested Test type choices and bottom are shown in criterion-11-test-types-ff3cf3af-9336-4315-a43f-b54c8867adc1.png, criterion-11-panel-top-f94ad5e7-2496-447b-b0bf-952fa75b544d.png, criterion-11-final-b6372019-d54c-4128-a579-4345eb5c4e95.png; the criterion-owned full DOM inventory criterion-11-panel-inventory.json (SHA-256 verified) includes all configuration sections and no device-group control. Available device groups are not offered. The panel-middle capture duplicates panel-top; the complete inventory corroborates the intervening controls rather than treating that duplicate as additional scroll coverage.
12. **Blocked:** Given configured frequencies are available, when filters are displayed, then those frequencies are offered from configuration rather than being hard-coded.
   - Testing could not be completed after the reported shared-browser state interruption: the original Automobile - Call layer disappeared, map centre changed and configuration activation timed out. criterion-12-initial-87598d7a-1bfb-4bbd-9589-6b2355f896b2.png shows only the launcher, not configured frequency choices. No settled configuration/comparison proof was captured; the interruption does not establish a product defect.
13. **Blocked:** Given configured device groups are available, when filters are displayed, then those device groups are offered from configuration rather than being hard-coded.
   - Testing could not be completed after the reported shared-browser state interruption during criterion 12 (selected Automobile - Call layer absent and configuration activation timed out). No criterion-13 browser evidence was captured for configured group availability, offered choices or configuration provenance; criterion-11 evidence is not reused as this criterion's test.
14. **Blocked:** Given one or more filters are applied and results reload, then only map results matching the active criteria and authorised for the user are shown.
   - Testing could not be completed after the reported shared-browser state interruption during criterion 12. No criterion-14 browser evidence was captured; no filters were applied. Matching and authorised result reconciliation, including the genuine result scope, remains untested.
15. **Blocked:** Given a restricted device-segregation option exists, when device groups are displayed, then that option is unavailable.
   - Testing could not be completed after the reported shared-browser state interruption during criterion 12. No criterion-15 browser evidence was captured establishing a restricted option fixture or its unavailability; absence of the whole group selector in another criterion is not proof of restricted-option behaviour.
16. **Blocked:** Given Route Replay is active, when filters are viewed, then this story’s standard-map filter controls do not apply.
   - Testing could not be completed after the reported shared-browser state interruption during criterion 12. No criterion-16 browser evidence was captured with Route Replay active. The canonical source expressly excludes Route Replay and separately states this negative boundary assertion; it does not require implementing standard-map controls in Route Replay. That boundary remains untested.

**Review summary:** Assessed all 16 criteria against the complete canonical ticket and human-confirmed Automobile scope. Shared-browser interruption prevented criteria 12–16; no claim is made that this interruption is a product defect. Configuration-driven choices, rolling-window behaviour and matching/authorisation retain their stated evidence limits. No browser actions or document publication performed.
