SCIIP Explorer 4.0 — R28
Exact Four-Hundred Progressive Export Policy + Guarded Execution Readiness

Authoritative prerequisite:
R27E exact-200 lifecycle closure.

Important correction:
R27E printed an opportunistically located REFERENCE_EVIDENCE_CANDIDATE path that
was not semantically authoritative. R28 does not depend on that path.

Instead R28 binds directly to:
- R27E STATUS = PASSED
- R27E exact lifecycle-closed state
- exactCombinedCertifiedCount = 200
- referenceReexported = false

Progressive expansion:
- closed reference: 200
- next target cohort: 400
- new records required: exactly 200
- scale factor: 2.0
- strategy: PROGRESSIVE_DELTA_TWO_HUNDRED
- reference 200: evidence reuse only, never re-export

R28 itself:
- read-only
- no live UI interaction
- no Export
- no application mutation
- no governed-data mutation

Before any future live Export, the new 200 must first be selected
deterministically and pass exact non-export qualification.

Next milestone:
R28A — Exact Four-Hundred Record Export Cohort Candidate Selection,
Qualification + Preauthorization.
