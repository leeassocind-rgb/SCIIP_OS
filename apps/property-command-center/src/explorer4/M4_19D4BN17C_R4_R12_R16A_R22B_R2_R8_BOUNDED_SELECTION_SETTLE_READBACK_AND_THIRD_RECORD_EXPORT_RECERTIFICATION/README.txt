SCIIP Explorer 4.0 — R22B-R2-R8

R22B-R2-R7-R1 proved that 8700 - 8750 Rex Rd selection is immediate and stable:
the selected marker, target text, and Assignments control were all present from t=0.0
through the entire 2.0-second observation window.

Therefore the prior R7 failure is a harness execution race, not a real selection failure.

R22B-R2-R8 repairs the certification harness by replacing a brittle one-shot selection
readback with a bounded stable readback:
- fresh SCIIP page
- Explorer first
- one target click
- require target text + selected marker + exactly one Assignments control
- require 3 consecutive agreeing samples within a maximum 2.0-second window

Only after that stable readback may the already-certified Export workflow continue.

Only 8700 - 8750 Rex Rd is executed.
2 Musick and 2701 Carrier Ave are not re-exported.

Application source mutation OFF.
Governed data mutation OFF.
Pixel evidence OFF.
