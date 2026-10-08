SCIIP Explorer 4.0 — R24C Exact Twenty-Five Record Guarded Export Execution Readiness + Authorization

This is a read-only authorization milestone.

Prerequisites:
- R23F exact-ten Export lifecycle CLOSED
- R24A exact-25 cohort PREAUTHORIZED
- R24B-R3 all 15 new records NON-EXPORT QUALIFIED

R24C reconciles:
10 certified reference records + 15 newly qualified records = exact 25-record execution cohort.

It preserves the certified execution envelope:
- fresh page per record
- Explorer settle: 3 consecutive samples within 2s
- target binding: 3 consecutive samples within 5s
- exact-first / unique-contains fallback
- selected-property settle: 3 consecutive samples within 2s
- candidate identity normalization only at status-suffix boundary
- Generate directly materializes Report Review + Download control
- strict sequential
- halt on first failure
- max one Export click per record
- exactly one PDF download and one PDF object-URL event
- application/pdf
- positive PDF size
- .pdf filename
- intended post-publish Report Review unmount
- Explorer continuity
- same-origin continuity
- zero runtime errors
- zero unhandled rejections

No live UI interaction and no Export occurs in R24C.

If PASSED:
R24D Exact Twenty-Five Record Guarded Export Execution.
