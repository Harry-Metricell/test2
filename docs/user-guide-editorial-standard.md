# User guide editorial standard

Write a platform user guide that explains a useful task, not a record of a QA journey. Apply this standard to new or amended generated sections. Preserve manual baseline content, section identities and existing publication gates.

## Structure and writing

- Use general, task-based headings such as **Choose a workspace**, **Search the layer catalogue** or **Change the map scale**. Do not turn an arbitrary sequence through Launcher, GIS and Audit into a new feature.
- Give ordered actions as short imperative `steps`. Keep exact control names where they matter. Generalise the user's goal, not untested behaviour: evidence from one layer does not prove that every layer works identically.
- A launcher directory must include every card visible in the reviewed account, or explicitly identify itself as selected examples. Record the observation date and account/deployment scope. Card descriptions establish advertised purpose and availability, not successful execution of the module workflow. Do not invent missing module procedures or present a historical screenshot as current evidence.
- Put parallel options, available fields, explanations and limitations in optional `notes` bullets. Avoid long comma-separated catalogues inside a step. Notes must be supported by the reviewed ticket and evidence.
- Keep essential qualifications beside the instruction they affect. Distinguish an example from a requirement. Do not infer universal availability from one account or deployment.
- Keep sections self-contained. Describe the task and relevant controls, without documentation-gap notes, test-history commentary or lists of what this guide does not cover. Keep coverage, source dates and verification history in supporting metadata. Keep brief operational qualifications only when they affect correct use or interpretation.
- Exclude test setup rituals, initial-state recording, evidence collection and mandatory cleanup. Describe useful undo or persistence behaviour only where supported.
- Amend the exact existing section when its instructions need changing. Add a titled procedure only when the current section covers a distinct task that should remain. Follow the private builder's section identity contract for baseline updates.

## Presentation

- Match the current approved guide's title page, native heading hierarchy, body typography, bullet indents, tables, headers and footers. Workers supply content; the deterministic builder owns formatting.
- Use Metricell Document Word Template 2026 V9.1 from the SharePoint DocumentTemplates library as the style reference for the proposed baseline. Do not upload that template or the private full-platform draft to this public repository.
- Highlight added or changed generated text and figures yellow. Preserve unchanged content and its identities.
- Compare review markings with the approved original baseline, not an intermediate restyled draft. Mark rewritten headings, introductions, list items, captions and editorial notes as well as steps. Formatting-only movement of unchanged source wording does not make it a new functional claim.
- Use a small number of readable screenshots at the relevant task. Select the minimum set that explains distinct controls or results. Do not embed every screenshot from the test.
- Caption the actual visible state. Explain a layer-specific screenshot as an example rather than claiming it establishes every layer's behaviour. Do not map images to steps by array position.
- Preserve aspect ratio and fit images within page width and height. Keep each image and caption together. Never stretch an image or leave a caption detached on the next page.

## Publication check

Every amendment requires a whole-document consistency sweep, not only a check of the changed block. Search the complete guide for related names, navigation, instructions, captions and cross-references; inspect matches for contradictions and stale wording. Deterministic code scans all paragraphs on every build, including tables, links, text boxes and header/footer stories. It rejects newly introduced editorial caveats, broken internal links and missing numbered-section references; pre-existing findings are reported in the publisher log rather than silently deleting manual material. Semantic agreement still needs evidence-based author judgement. The scan itself uses no model tokens. Do not reread all screenshots or start extra QA workers when a compact text search resolves the check.

Confirm the exact live handoff and passed review, validate the text and optional notes, retain reviewed screenshot provenance, render the document, and verify all expected evidence images. Check changed pages for overlap, clipping and excessive whitespace. Update indexes only through their supported contract. A successful JSON or PDF check alone does not establish editorial quality or current product availability.

The full-platform production guide is stored locally. Publish only the private update receipt through the TEST2 workflow.
