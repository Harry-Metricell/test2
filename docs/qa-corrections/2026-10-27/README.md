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

No source Jira, testing cycle, attempt counter, original result or independent
review was changed. Published PDF/Word reports remain historical evidence and
predate this clarification; the existing findings need reassessment against the
corrected checklist before any formal outcome changes. No retest was queued.
