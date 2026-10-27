# Download and Upload criteria corrections

Applies to TEST2-85 (VM2ST-107) and TEST2-86 (VM2ST-108), current cycle-003.
Original source Jira was checked read-only on 27 October 2026. The adjacent
criteria-as-tested files preserve the checklist used by the published reviews.

The original acceptance criteria require available test/device information,
including the relevant transfer rate and Wi-Fi connection status. Our generated
field inventory lost that availability qualifier and caused optional, unreturned
user, handset and indoor/outdoor values to be treated as mandatory prerequisites.
Criterion 1 now preserves the available-information scope and requires returned
values to be displayed accurately. It does not remove the explicit rate/Wi-Fi
requirements or the separate returned-average-metrics branch.

On 27 October the user confirmed that a disabled zero-duration row counts as the
standard no-data state. Criterion 7 now requires that disabled row and no empty
details view. This interpretation is recorded as a human requirementClarification
in each ticket's testing-context file. It reconciles the detail stories with
VM2ST-104's instruction not to open zero-duration details. It does not define the
unavailable-details API response contract or apply to other causes of disabled UI.

No source Jira, testing cycle, attempt counter or original tester result was
changed. The user subsequently authorised an existing-evidence reassessment.
Both current reviews and PDF/Word reports now record 8 Passed and 2 Blocked;
criteria 6 and 9 still need a returned-average fixture and an authoritative
unavailable-details response contract/example. No retest was queued.

The earlier independent reviews are preserved under each ticket's
`reassessment-history/2026-10-27/previous-review.json`. The replacement reviews
explicitly identify the manual reassessment and original handoff provenance;
they do not claim another independent worker or test attempt. Criterion 7 uses
recorded genuine response observations to establish zero duration; equal times
in a screenshot alone are not treated as millisecond evidence. Upload criterion
8 additionally uses the 27 October scoped loading/recovery investigation.

Each reassessment folder also retains the adjudicated `report-inputs.json`, image
identity manifest and successful PDF verification audit. To rebuild these exact
reports, use those report inputs with the current review and criteria; keep the
original `results.json` and tester history immutable. The original observation
date is 26 October; the reassessment and Upload loading follow-up are dated
27 October. Earlier report binaries remain available through Git history.
