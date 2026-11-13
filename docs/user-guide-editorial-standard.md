# User guide editorial standard

Write a platform user guide that explains a useful task, not a record of a QA journey. Apply this standard to new or amended generated sections. Preserve manual baseline content, section identities and existing publication gates.

## Structure and writing

- Use general, task-based headings such as **Choose a workspace**, **Search the layer catalogue** or **Change the map scale**. Do not turn an arbitrary sequence through Launcher, GIS and Audit into a new feature.
- Give ordered actions as short imperative `steps`. Keep exact control names where they matter. Generalise the user's goal, not untested behaviour: evidence from one layer does not prove that every layer works identically.
- Put parallel options, available fields, explanations and limitations in optional `notes` bullets. Avoid long comma-separated catalogues inside a step. Notes must be supported by the reviewed ticket and evidence.
- Keep essential qualifications beside the instruction they affect. Distinguish an example from a requirement. Do not infer universal availability from one account or deployment.
- Exclude test setup rituals, initial-state recording, evidence collection and mandatory cleanup. Describe useful undo or persistence behaviour only where supported.
- Amend the exact existing generated section when it needs changing. Do not append another walkthrough of the same controls. Baseline-section updates require a separate supported identity contract; this standard does not activate the local indexed draft.

## Presentation

- Match the current approved guide's title page, native heading hierarchy, body typography, bullet indents, tables, headers and footers. Workers supply content; the deterministic builder owns formatting.
- Use Metricell Document Word Template 2026 V9.1 from the SharePoint DocumentTemplates library as the style reference for the proposed baseline. Do not upload that template or the private full-platform draft to this public repository.
- Highlight added or changed generated text and figures yellow. Preserve unchanged content and its identities.
- Use a small number of readable screenshots at the relevant task. Select the minimum set that explains distinct controls or results. Do not embed every screenshot from the test.
- Caption the actual visible state. Explain a layer-specific screenshot as an example rather than claiming it establishes every layer's behaviour. Do not map images to steps by array position.
- Preserve aspect ratio and fit images within page width and height. Keep each image and caption together. Never stretch an image or leave a caption detached on the next page.

## Publication check

Confirm the exact live handoff and passed review, validate the text and optional notes, retain reviewed screenshot provenance, render the document, and verify all expected evidence images. Check changed pages for overlap, clipping and excessive whitespace. Update indexes only through their supported contract. A successful JSON or PDF check alone does not establish editorial quality or current product availability.

The new full-platform document remains a local review draft until its section identity, publication and index integration are implemented and tested.
