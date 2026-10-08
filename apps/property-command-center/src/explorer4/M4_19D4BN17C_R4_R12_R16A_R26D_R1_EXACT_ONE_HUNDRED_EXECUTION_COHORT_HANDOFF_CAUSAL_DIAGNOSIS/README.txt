SCIIP Explorer 4.0 — R26D-R1
Exact-One-Hundred Execution Cohort Handoff Causal Diagnosis

Why this milestone exists
-------------------------
R26D created an exact-100 target file but delegated execution to the previously
certified R25D-R3 exact-50 runner. The console output showed [1/50] through
[50/50], so successful delegation is not sufficient evidence of 100 exports.

R26E correctly refused to certify exact-100, but its diagnostic count of 200
was derived from naive text counting and is not a trustworthy record count.

This milestone is read-only. It:
- verifies R26D's target file actually contains 100 unique targets
- inspects the delegated R25D-R3 runner source
- checks whether the runner consumes SCIIP_EXACT_COHORT_FILE and related R26D env guards
- resolves the true per-record execution count from structured R25D-R3 evidence
- identifies whether the runner remained hard-bound to its exact-50 contract
- separately diagnoses the R26E text-counting defect

No UI interaction.
No Export invocation.
No application mutation.
No governed-data mutation.

Expected next milestone when the exact-100 handoff was ignored:
R26D-R2 — Exact-One-Hundred Native Runner Adaptation + Static Certification.
