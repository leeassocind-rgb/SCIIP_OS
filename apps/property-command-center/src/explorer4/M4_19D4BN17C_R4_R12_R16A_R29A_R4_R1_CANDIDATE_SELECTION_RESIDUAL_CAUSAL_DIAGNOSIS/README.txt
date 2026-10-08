SCIIP Explorer 4.0 — R29A-R4-R1

Observed R29A-R4 residual:
The page-ready Explorer settle repair passed, but the selector blocked because
it could not reconstruct an exact disjoint authoritative prior-200 reference
cohort.

This milestone is read-only. It inventories existing Explorer 4 evidence for:
- exact 200-record candidate cohorts;
- uniqueness and within-cohort duplicates;
- overlap with the authoritative R28 new-200 cohort;
- union cardinality with that new-200 cohort;
- exact disjoint compatibility;
- composite 100+100 cohort pairs that can reconstruct the prior 200.

It performs no live UI interaction and no Export invocation.

The output determines whether the next repair should bind a single exact prior
200 source, reconstruct a composite prior 200 from two authoritative 100
cohorts, or perform deeper reference-400 lineage diagnosis.
