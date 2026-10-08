SCIIP Explorer 4.0 — M4.19D4BN10B-R1
Explain/Evidence Activation Path Resolution

WHY R1 EXISTS
-------------
BN10B live observation showed:
- controlledValueMatch: True for 10/10
- Explorer mounted: True for 10/10
- Map visible: True for 10/10
- Evidence signals already visible: 30–34 per property
- Explanation signals already visible: 5 per property
- Explain/Why visible control: not found for 10/10

This indicates an activation-path assumption mismatch, not absence of the
Explain/Evidence consumer.

R1 is read-only. It resolves the actual Explain/Evidence activation path from
current Explorer source and determines whether it is:
- direct visible control
- command dispatcher / command palette
- property drawer action
- other routed consumer

No application source mutation.
No governed data mutation.
No network authority.
No pixel evidence.

Expected success:
STATUS: PASSED
STATE: M419D4BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RESOLVED
DIAGNOSIS: EXPLAIN_EVIDENCE_CONSUMER_PRESENT_VISIBLE_CONTROL_ASSUMPTION_INVALID_ACTIVATION_PATH_RESOLVED
NEXT_MILESTONE: M4_19D4BN10B_R2_EXACT_TEN_LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RECERTIFICATION
