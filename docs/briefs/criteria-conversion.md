# TEST2 Criteria Conversion Brief

Task: convert only the supplied TEST2 ticket's ambiguous Jira acceptance criteria.

Read only the supplied ticket paths:
- ticket.json
- generated ticket record, if supplied
- current criteria.md, if supplied

Write only the supplied ticket's criteria.md. Use the generated marker and one unchecked bullet per criterion. Preserve meaning and do not invent behavior.

Do not search the repository, process other tickets, modify Jira, status files, results, reports, screenshots, or create criteria-review.md.

Return one final JSON summary with handoffId, ticket, changedFiles, noOp, and reason.
