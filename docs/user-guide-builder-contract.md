# User guide builder contract

The authoring worker uses the compact index to find one section. It reads that section and the reviewed evidence for its handoff. It supplies instructions, approved screenshot paths and plain caption text. The builder reads the complete Word document and owns placement, styling, figure numbering and reference checks.

## Section identity

The production guide uses the private indexed V1 file. Read the local heading list and one editable section with `scripts/private-user-guide.py`. The update names the exact `sectionId` and `sectionSha256`. An addition goes before that section's end marker. The builder sets the update's task title in highlighted bold text and keeps it with the first instruction. It omits the title if it repeats the section heading. An amendment replaces the leaf section body and preserves its heading and contents bookmark. The builder rejects unknown, non-editable or changed sections. The publisher renders and verifies a separate candidate before installing it in private storage. It pushes a completion receipt containing the ticket, cycle and handoff identity. The guide and its authored content remain in private storage.

The legacy builder used `supersedesTicket` to amend a generated block and `affectedSection` for chapter placement. Those rules are available for legacy fixtures and configurations.

## Figures and references

- Provide captions in the same order as the screenshot paths. Leave figure numbers out of the caption text.
- In steps or supporting notes, write `[[FIGURE:1]]` to refer to the first screenshot in that update. The number in a token is local to the screenshot list. The builder replaces it with a clickable `Figure N` label.
- Each caption gets an internal Word bookmark. Once layout and retirement rules have run, the builder numbers captions in document order, including captions in tables. It then updates the displayed text of every managed figure link from its bookmark.
- In the private guide, each new screenshot is a separate full image at its original aspect ratio, with its caption kept on the same page. Small control captures stay near their native size. The publisher verifies the screenshot on the rendered caption page.
- In an amendment, `preserveFigureSlots` optionally maps each new screenshot to the old position of the same illustration. For example, `[null, 1]` adds a new image before the first old illustration while keeping links to that old illustration working. Use `null` for a new subject. Omitting the mapping gives the replacement images fresh identities.
- Before moving or replacing blocks, the builder converts legacy plain-text `Figure N` references with a unique target into bookmark links. If a reference has multiple possible targets or its figure is removed, the build stops with the reference that needs repair.
- Preview and publication checks use the final numbering. The builder preserves existing contents fields and section bookmarks. Word updates existing page references when the document opens.

These operations are deterministic. The authoring worker does not need to read or count figures outside its target section.
