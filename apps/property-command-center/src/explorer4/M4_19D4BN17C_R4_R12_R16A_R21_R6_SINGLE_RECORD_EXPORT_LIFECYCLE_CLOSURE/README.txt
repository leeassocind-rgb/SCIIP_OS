SCIIP Explorer 4.0 — R21-R6
Single-Record Export Lifecycle Closure

This milestone performs no live UI interaction and invokes Export zero additional times.

It reconciles:
R21-R3 — exact source/live Export handler binding + guard design
R21-R4 — one guarded live Export invocation
R21-R5 — PDF artifact and post-action state verification

Closure requires:
- exact source/live handler parity;
- exactly one guarded Export invocation;
- exactly one PDF download and object URL;
- application/pdf MIME type;
- positive artifact size;
- expected Client Listing Report filename contract;
- no runtime errors or unhandled rejections;
- report-review continuity;
- Explorer continuity;
- same-origin continuity;
- all application/governed/network/pixel authorities remaining off.

Passing R21-R6 closes the single-record Export lifecycle and hands off to a bounded
Export micro-cohort expansion readiness/design milestone.
