SCIIP Explorer 4.0 — R28B-R3-R2
Record 233 Post-Report-Review Origin Transition Deep Diagnosis

Prerequisite:
R28B-R3-R1 proved record 233 passed every non-export workflow stage but failed final sameOrigin.

This milestone:
- replays record 233 only in diagnostic mode
- captures URL + origin at each workflow stage
- captures an additional bounded 3-second post-Report-Review origin window
- never clicks Download Client Listing Report
- never invokes Export

If origin remains 127.0.0.1:5173 throughout, classify prior failure as transient/readback mismatch
and advance to record-233 same-origin recertification + resume.
