# TEST2-48 Evidence Review

- **Ticket:** TEST2-48 — Toggle linked sites visibility in V4 GIS Surveyor Display Settings
- **QA status:** Evidence Reviewed
- **Overall outcome:** Passed
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** Starting from the V4 launcher, the signed-in user opens GIS, loads an available Surveyor layer, and the layer legend displays a `Display Settings` control.
   - Screenshots show the signed-in launcher, GIS, and loaded Surveyor - Service legend with Display Settings. The result browserUrl is https://o2intelligence-v4-dev.metricell.com/gis, an expected V4 host. All named criterion screenshots exist and are non-empty.
2. **Passed:** After opening `Display Settings`, the panel displays a `Show linked sites` control with a discernible current state.
   - The Display Settings screenshot shows Show linked sites checked. The result browserUrl is https://o2intelligence-v4-dev.metricell.com/gis, an expected V4 host. All named criterion screenshots exist and are non-empty.
3. **Passed:** After changing `Show linked sites` to the opposite state, the control visibly displays the new state.
   - Before and after screenshots show Show linked sites checked, then unchecked. The result browserUrl is https://o2intelligence-v4-dev.metricell.com/gis, an expected V4 host. All named criterion screenshots exist and are non-empty.
4. **Passed:** After restoring `Show linked sites` to its original state, closing and reopening `Display Settings` shows the original state again.
   - Screenshots show the restored checked state before closing and the checked state after reopening Display Settings. The result browserUrl is https://o2intelligence-v4-dev.metricell.com/gis, an expected V4 host. All named criterion screenshots exist and are non-empty.

**Review summary:** 
