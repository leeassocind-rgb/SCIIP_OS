R29A-R4-R2-R2-R2-R3-R2-R2-R1

The pre-live control-flow repair succeeded, but the authoritative prior-200 resolver still returned no usable cohort.

This milestone is read-only. It imports the current patched selector without executing main(), then calls choose_prior200(er,new200,set()) directly. It captures:
- configured authoritative prior-200 source,
- exact new200 artifact,
- repaired branch key counts and overlap,
- direct choose_prior200 exception/return type/count/diag,
- exact current authoritative branch source.

No live inventory or UI interaction occurs.
