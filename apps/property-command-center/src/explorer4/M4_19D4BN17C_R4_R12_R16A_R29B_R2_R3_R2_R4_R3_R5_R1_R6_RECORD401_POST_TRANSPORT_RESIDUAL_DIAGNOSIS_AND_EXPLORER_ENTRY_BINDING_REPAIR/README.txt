Consumes the exact R5 result:
- inbound CDP transport repaired
- Record401 fresh target created
- Explorer settle certified
- next residual: "w is not defined"

This milestone diagnoses the explorer-entry helper callsite and narrowly replaces
the undefined `w` argument with the live per-record `cdp` instance returned by
createFreshPage(), then reruns authoritative R29B.

Governed data mutation OFF. Export invocation OFF.
Strict sequential ON. Halt on first failure ON.
