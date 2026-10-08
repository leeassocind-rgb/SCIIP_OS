SCIIP Explorer 4.0 — R26D-R2-R3-R3

Observed failure:
The corrected wrapper successfully invoked the residual native runner with both required arguments.
The runner then stopped before live processing because its internal EXPECTED_COUNT remained 50.

No Export occurred.

Repair:
- create a dedicated residual runner with EXPECTED_COUNT=20
- require exactly 20 unique residual targets
- require completion count 20/20
- write native evidence to a distinct residual-20 namespace
- preserve Alondra Building 1 canonical binding
- preserve all generic identity, selection, workflow, artifact, runtime, sequential, and halt guards
- preserve maximum one Export click per residual record

Execution ledger remains:
50 reference closed + 30 previously certified new + residual 20 = exact 100.

If residual 20 certify, next:
R26D-R2-R4 Exact-One-Hundred Progressive Lifecycle Reconciliation + Closure.
