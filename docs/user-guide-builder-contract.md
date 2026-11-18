# User guide builder contract

The authoring worker uses the compact index to find one section. It reads that section and the reviewed evidence for its handoff. It supplies instructions, approved screenshot paths and plain caption text. The builder reads the complete Word document and owns placement, styling, figure numbering and reference checks.

## Section identity

Use the existing guide update handoff fields. An amendment selects the exact indexed generated block via `supersedesTicket`. The builder uses its unique hidden marker to replace that block. An addition uses `affectedSection` for chapter routing under the guide plan. Replacement of a manually authored baseline section requires the separate baseline integration. The private V1 file is not the production source.

## Figures and references

- Provide captions in the same order as the screenshot paths. Leave figure numbers out of the caption text.
- In steps or supporting notes, write `[[FIGURE:1]]` to refer to the first screenshot in that update. The number in a token is local to the screenshot list. The builder replaces it with a clickable `Figure N` label.
- Each caption gets an internal Word bookmark. Once layout and retirement rules have run, the builder numbers captions in document order, including captions in tables. It then updates the displayed text of every managed figure link from its bookmark.
- In an amendment, `preserveFigureSlots` optionally maps each new screenshot to the old position of the same illustration. For example, `[null, 1]` adds a new image before the first old illustration while keeping links to that old illustration working. Use `null` for a new subject. Omitting the mapping gives the replacement images fresh identities.
- Before moving or replacing blocks, the builder converts legacy plain-text `Figure N` references with a unique target into bookmark links. If a reference has multiple possible targets or its figure is removed, the build stops with the reference that needs repair.
- Preview and publication checks use the final numbering. The builder preserves existing contents fields and section bookmarks. Word updates existing page references when the document opens. Adding new contents entries for manually authored V1 sections belongs to baseline integration.

These operations are deterministic. The authoring worker does not need to read or count figures outside its target section.
