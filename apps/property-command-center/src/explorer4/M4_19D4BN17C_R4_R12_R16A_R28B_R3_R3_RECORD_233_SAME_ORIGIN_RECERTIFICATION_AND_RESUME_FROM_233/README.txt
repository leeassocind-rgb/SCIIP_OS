SCIIP Explorer 4.0 — R28B-R3-R3
Record 233 Same-Origin Recertification + Resume From 233

Evidence:
- R28B-R3 certified records 201-232 (32 records).
- Record 233 failed only final same-origin readback.
- R28B-R3-R2 replayed record 233 and observed:
  * same origin across all workflow stages
  * no origin change
  * no non-app URL
  * stable origin through 3.0 seconds post-Report-Review

Repair:
- preserve the first 32 certifications without replay.
- recertify record 233 from a fresh page.
- replace single final origin readback with a bounded stability guard:
  3 consecutive app-origin + app-URL samples within 0.75 seconds.
- if record 233 passes, continue records 234-400 strict sequentially.
- halt on first failure.

Export contract:
- Download Client Listing Report may be materialized and certified.
- It is NEVER clicked.
- Export invocation remains OFF.
