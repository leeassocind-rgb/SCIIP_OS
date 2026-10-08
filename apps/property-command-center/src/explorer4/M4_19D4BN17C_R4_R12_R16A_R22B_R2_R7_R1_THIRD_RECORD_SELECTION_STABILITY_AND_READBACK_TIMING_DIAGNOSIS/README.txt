SCIIP Explorer 4.0 — R22B-R2-R7-R1

R22B-R2-R6 selected 8700 - 8750 Rex Rd successfully.
R22B-R2-R7 then failed selected-property certification again.

This diagnostic determines whether the discrepancy is caused by post-click timing.

It opens one fresh page, enters Explorer, clicks the target once, then samples:
- target text visibility,
- .sciip-property-marker.is-selected identity,
- Assignments control presence,
at bounded intervals through 2.0 seconds.

No Assignments entry and no Export invocation occur.

A stable selected marker appearing after t=0 means the executor's immediate readback is too early.
A stable selected marker present at t=0 means the prior failure is an execution race and a bounded
settle/readback guard is still appropriate.
Flicker or non-materialization escalates to deeper state-owner diagnosis.

Application source mutation OFF.
Governed data mutation OFF.
Assignments invocation OFF.
Export invocation OFF.
Pixel evidence OFF.
