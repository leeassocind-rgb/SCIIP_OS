SCIIP Explorer 4.0 — R22
Export Bounded Micro-Cohort Expansion Readiness + Design

Prerequisite:
R21-R6 must have closed the single-record Export lifecycle.

R22 performs no live UI interaction and no Export invocation.

It converts the certified single-record Export mechanics into a conservative
exact-three-record expansion policy.

Cohort:
1. 2 Musick
2. 2701 Carrier Ave
3. 8700 - 8750 Rex Rd

Required topology:
- preserve one certified browser context;
- create a fresh Explorer page target for each record;
- never reuse the same page across records;
- do not launch a fresh isolated browser per record;
- execute strictly sequentially;
- halt on the first failure.

Per-record requirements:
- exact record selection and readback;
- Assignments workspace entry;
- Generate Client Listing Report materialization;
- report-review entry;
- Download Client Listing Report materialization;
- exact live exportReport handler parity;
- exactly one Export click;
- exactly one PDF output signal;
- application/pdf MIME type;
- positive artifact size;
- filename ending .pdf;
- zero runtime errors / unhandled rejections;
- preserved report-review, Explorer, and same-origin continuity.

Passing R22 authorizes only the next qualification/preauthorization milestone.
It does not authorize live three-record Export execution.
