<!-- Converted from the complete Jira ticket source; each item has a testable starting state, action, and observable result. -->

- [ ] Starting in GIS with Search layers empty and the recorded baseline visible, enter `zzqa_no_match_batch_20261009` in Search layers; the entered text remains visible, no matching catalogue entries are displayed, and the GIS map remains available.
- [ ] Replace the no-match Search layers text with `Surveyor` without reloading GIS; a matching Surveyor catalogue entry becomes visible.
- [ ] With the filtered Surveyor catalogue entry visible, open its configuration control; the Surveyor configuration displays Username, Cancel, and Add layer controls.
- [ ] Select Cancel and clear Search layers; the original catalogue entries return, the existing Map layers entries and order and the map view match the recorded baseline, and no new layer is present.
