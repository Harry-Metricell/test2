# TEST2-47 Evidence Review

- **Ticket:** TEST2-47 — Verify Surveyor Display Settings in V4 GIS
- **QA status:** Blocked
- **Overall outcome:** Blocked
- **Evidence reviewed:** attempt-001
- **Report:** [Evidence report](report.pdf)

## Criterion results

1. **Passed:** With a Surveyor layer loaded in V4 GIS, the layer's legend displays a `Display Settings` control directly beneath it.
   - The selected attempt screenshots show a loaded Surveyor - Service layer and its Display Settings control in the layer legend panel.
2. **Passed:** With a Surveyor layer loaded, the Display Settings control exposes the active legend/colouring option and the `Show Linked Sites` option.
   - The settings screenshot directly shows Colour by set to Signal Strength and Show linked sites checked.
3. **Unverified:** When linked sites are enabled and the zoom prerequisite is satisfied, the Display Settings control exposes `Show Linked Cells`; when either prerequisite is not satisfied, `Show Linked Cells` is unavailable.
   - The screenshots show Show linked cells available and toggleable at a displayed 100 km map scale, but do not establish the zoom threshold or show its unavailable state when a prerequisite is unmet.
4. **Unverified:** When the active legend is `Band` and linked sites are shown, the Display Settings control exposes `Colour Point Links By Azimuth/Band`; for another legend or with linked sites hidden, that control is unavailable.
   - The screenshots directly show Band selected, Show linked sites checked, and Linked point colour set to Azimuth. They do not show the control becoming unavailable for another legend or when linked sites are hidden.
5. **Blocked:** When the active legend is `Building`, the Display Settings control exposes `Show Labels`; for another legend, `Show Labels` is unavailable.
   - The selected attempt screenshots show only the available Service-oriented Colour by choices and no Building option, so the required Building state could not be established.
6. **Passed:** The Surveyor Display Settings control does not expose a `Sector` option.
   - The screenshot showing the available Colour by options lists Signal Strength, Signal Quality, SNR, Band, Technology, and Service State, with no Sector option.
7. **Blocked:** After changing an available presentation setting, the Surveyor layer's underlying filtered result set remains unchanged while the selected presentation setting is reflected in the layer display.
   - The screenshots show presentation controls but no observable result count or record list to compare the underlying filtered result set.
8. **Passed:** After changing Surveyor presentation settings, restoring the GIS to its normal saved/restored state retains those settings and their corresponding layer display.
   - The screenshots show Show linked sites unchecked after returning to the launcher and reopening GIS, then show it restored to its original checked state.

**Review summary:** 
