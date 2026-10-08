SCIIP Explorer 4.0 — R23D-R1

R23D halted at 0/10 with halt-on-first-failure correctly enforced, but its console summary
did not print the first-record stage details because the executor breaks before the normal
per-record print block.

R23D-R1 does not retry anything.

It reads the existing R23D evidence and exposes the exact first-record outcome:
- fresh-page materialization
- Explorer entry
- target selection
- 3-sample selection settle
- Assignments / Generate control
- Report Review
- Export control / exportReport binding
- guarded Export action
- PDF artifact signals
- runtime errors / unhandled rejections
- intended Report Review unmount
- Explorer continuity
- same origin

It then classifies the narrowest residual cause and names the corresponding R23D-R2 repair.

Live UI interaction OFF.
Export invocation OFF.
Application source mutation OFF.
Governed data mutation OFF.
Network authority OFF.
Pixel evidence OFF.
