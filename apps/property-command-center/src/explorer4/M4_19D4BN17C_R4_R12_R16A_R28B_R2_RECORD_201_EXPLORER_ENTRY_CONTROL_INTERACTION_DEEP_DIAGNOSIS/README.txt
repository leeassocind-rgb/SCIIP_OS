SCIIP Explorer 4.0 — R28B-R2
Record 201 Explorer Entry Control Interaction Deep Diagnosis

Prerequisite:
R28B-R1 proved record 201:
- fresh page created
- Explorer settled
- Explorer entry did not certify
- same origin preserved
- target binding and downstream workflow untouched

R28B-R2 performs a bounded single-record diagnostic:
- observes exact Explorer button state
- captures visibility/enabled/DOM identity
- performs at most one Explorer click
- captures click-event readback
- observes immediate post-click Explorer/property-marker surface
- performs NO property click
- NO Assignments
- NO Generate
- NO Export

If the click succeeds and the Explorer surface materializes, the prior failure is
classified as transient/certification mismatch and record 201 can be recertified.
