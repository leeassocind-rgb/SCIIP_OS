SCIIP Explorer 4.0 — R26D

This is the authorized exact-100 live Export milestone.

Safety design:
- consumes R26C authorization
- resolves the exact 100-record R26A cohort
- reuses the already-certified R25D-R3 browser execution implementation
- does not create a second, unproven browser/export driver
- fresh page per record
- strict sequential
- halt on first failure
- maximum one Export click per record
- application/governed-data mutation remain OFF

IMPORTANT: this milestone performs live Export invocation. The certified runner must honor
SCIIP_EXACT_COHORT_FILE and the exported guard environment variables. If the certified runner
is absent, execution BLOCKS rather than improvising.
