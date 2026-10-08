SCIIP Explorer 4.0 — R23D-R3-R3

R23D-R3-R2 proved the third-record failure was caused by fresh-page timing:
- at 0.0 and 0.1 seconds there were zero buttons;
- Explorer became uniquely actionable at 0.25 seconds;
- after Explorer entry, 8700 - 8750 Rex Rd became a unique contains-match at 0.25 seconds.

R23D-R3-R3 promotes that finding into a permanent bounded runtime guard.

For each record:
1. Create a fresh Explorer page.
2. Require 3 consecutive samples showing exactly one enabled Explorer control within 2 seconds.
3. Click Explorer.
4. Require 3 consecutive samples showing either one exact property control or one unique contains-match within 2 seconds.
5. Prefer exact target binding; otherwise allow exactly one unique contains-match.
6. Require the existing 3-consecutive-sample selected-property settle.
7. Continue through Assignments, Report Review, exportReport binding, and one guarded Export.
8. Verify PDF artifact, runtime cleanliness, intended post-publish unmount, Explorer continuity, and same origin.

Ambiguous target matches remain forbidden.
Strict sequential and halt-on-first-failure remain mandatory.
Application source mutation OFF.
Governed data mutation OFF.
Network authority OFF.
Pixel evidence OFF.

If all 10 certify, next:
R23E Exact Ten-Record Export Artifact + Runtime Verification.
