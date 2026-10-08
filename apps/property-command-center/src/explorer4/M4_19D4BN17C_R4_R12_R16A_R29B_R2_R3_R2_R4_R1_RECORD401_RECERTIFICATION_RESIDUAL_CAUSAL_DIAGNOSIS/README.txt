R29B-R2-R3-R2-R4-R1 diagnoses the post-entry-repair record-401 residual.

Authoritative observations consumed:
- R29B entry-certification repair syntax-certified
- R29B rerun exits with code 13
- R29B evidence remains RUNNING
- record 401 is not recertified
- certified/executed counts are not emitted

Node.js exit code 13 is the unresolved top-level-await condition. This milestone therefore treats the residual as an asynchronous control-flow hang, not a normal qualification predicate failure.

The milestone is completely read-only:
- no live UI interaction
- no Explorer click
- no property click
- no Assignments
- no Generate
- no Export
- no application mutation
- no governed data mutation

It inspects the authoritative R29B source and captures:
- top-level await surfaces
- all await surfaces
- promise lifecycle code
- Raw WebSocket/CDP promise implementation surfaces
- the R4 entry helper context
- first-record workflow-relevant await/control-flow source.

The next milestone is bounded stage instrumentation to identify the exact unresolved await before changing behavior.
