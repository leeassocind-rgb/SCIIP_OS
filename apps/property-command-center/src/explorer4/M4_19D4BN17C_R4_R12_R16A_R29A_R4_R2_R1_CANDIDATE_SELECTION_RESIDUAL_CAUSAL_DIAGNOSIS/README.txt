SCIIP Explorer 4.0 — R29A-R4-R2-R1

R29A-R4-R2 proved the authoritative prior-200 artifact is present, unique,
and disjoint from the authoritative R28 new-200 cohort, but R29A still rejected
reference reconstruction.

This milestone performs a read-only selector-source diagnosis. It captures:
- choose_prior200 function signature;
- callsites and argument order;
- the installed authoritative branch;
- whether the branch compares the prior-200 against the live inventory rather
  than against the new-200 cohort;
- normalization/keyset behavior.

No UI interaction or Export is performed.
