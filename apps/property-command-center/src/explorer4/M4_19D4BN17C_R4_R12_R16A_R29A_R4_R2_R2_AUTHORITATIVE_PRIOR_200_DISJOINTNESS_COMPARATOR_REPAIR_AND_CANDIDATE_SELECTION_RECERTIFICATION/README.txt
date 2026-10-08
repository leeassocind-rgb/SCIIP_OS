SCIIP Explorer 4.0 — R29A-R4-R2-R2

R29A-R4-R2-R1 conclusively diagnosed the remaining selector defect:
the authoritative prior-200 branch was testing disjointness against livekeys,
which is the live Explorer inventory. That is semantically wrong because
closed reference records are expected to remain present in the live inventory.

The correct invariant is:
authoritative prior 200 ∩ authoritative R28 new 200 = 0.

This milestone performs only that narrow comparator repair:
- compute keyset(new200);
- require exactly 200 new200 keys;
- test prior-200 disjointness against new200 keys;
- preserve existing page-ready Explorer settle behavior;
- preserve all other R29A candidate-selection semantics;
- rerun R29A.

No property click, Assignments, Generate, or Export is authorized.
