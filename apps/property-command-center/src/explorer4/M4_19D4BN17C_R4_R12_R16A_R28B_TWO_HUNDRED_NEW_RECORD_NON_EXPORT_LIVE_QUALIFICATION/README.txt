SCIIP Explorer 4.0 — R28B
Two-Hundred New Record Non-Export Live Qualification

Authoritative input:
R28A-R4 exact_new_two_hundred_candidates_prefix_normalized.json

Contract:
- exact new records 201-400 only
- fresh Explorer page per record
- strict sequential
- halt on first failure
- Explorer settle: 3 consecutive samples within 2 seconds, anchored to document complete + nonzero button DOM
- target binding settle: 3 consecutive samples within 5 seconds
- canonical label binding plus ADDRESS_PLUS_VISIBLE_SF support
- selected-property settle: 3 consecutive samples within 2 seconds
- enter Assignments
- invoke Generate Client Listing Report
- materialize Report Review
- certify unique Download Client Listing Report control
- certify source-level exportReport binding

CRITICAL:
R28B NEVER clicks Download/Export.

Success -> R28C exact-400 guarded Export readiness + authorization.
Failure -> R28B-R1 residual causal diagnosis.
