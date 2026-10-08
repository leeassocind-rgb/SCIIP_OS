SCIIP Explorer 4.0 — R28C-R2
Shape-Safe R28 Policy Binding Repair + Execution Authorization Recertification

R28C-R1 proved:
- R28 status = PASSED
- R28 certified state is intact
- authoritative policy object lives at $.policy
- $.policy.referenceCohortSize = 200
- $.policy.nextCohortSize = 400
- $.policy.scaleFactor = 2.0
- $.policy.newLiveExpansionRecordsRequired = 200
- $.policy.executionStrategy = PROGRESSIVE_DELTA_TWO_HUNDRED
- $.policy.referenceReexportRequired = false

R28C failed only because its reader looked in the wrong location.

This milestone:
- binds directly to $.policy
- preserves R27E closed reference-200 evidence
- preserves R28B exact-new-200 qualification evidence
- preserves the exact R28A-R4 new-200 target artifact
- re-certifies exact-400 guarded Export authorization
- performs no UI interaction
- performs no Export invocation

Expected next:
R28D — Exact New Two-Hundred Guarded Live Export Execution.
