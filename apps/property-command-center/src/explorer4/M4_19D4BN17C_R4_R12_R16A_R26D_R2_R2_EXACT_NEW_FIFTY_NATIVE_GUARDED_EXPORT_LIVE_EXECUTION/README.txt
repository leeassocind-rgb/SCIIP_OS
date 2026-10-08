SCIIP Explorer 4.0 — R26D-R2-R2
Exact New-Fifty Native Guarded Export Live Execution

This is the live execution boundary for records 51-100 only.

Preconditions:
- R26D-R2-R1-R1 installed and hash-certified the dedicated native new-50 runner.
- exact_new_fifty_targets.json contains exactly 50 unique records.
- the reference 50 remain closed under R25F and are not re-exported.

Execution:
- verifies runner SHA-256 against certified installer evidence
- verifies target-file SHA-256
- sets SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED=YES
- invokes only the dedicated native runner
- runner uses fresh page per record
- strict sequential
- halt on first failure
- maximum one Export click per record
- preserves all settle, identity, artifact, post-publish, origin, and runtime guards

On full pass:
50 closed reference records + 50 newly executed records are ready for
structured exact-100 artifact/runtime reverification.

Next:
R26E-R1 — Structured Exact-One-Hundred Artifact + Runtime Reverification.
