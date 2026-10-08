SCIIP Explorer 4.0 — R26C

Purpose
-------
Reconcile the certified reference-50 cohort with the now-complete new-50
non-export qualification cohort and issue a bounded authorization contract
for exact-100 guarded Export live execution.

This milestone does NOT click Export.

Required execution contract for R26D
------------------------------------
- exact 100 records: 50 reference-certified + 50 new non-export-qualified
- fresh page per record
- strict sequential execution
- halt on first failure; never continue after failure
- Explorer settle: 3 consecutive samples, <=2 seconds
- target binding settle: 3 consecutive samples, <=5 seconds
- selected-property settle: 3 consecutive samples, <=2 seconds
- building/project-aware canonical identity binding
- ambiguous address-only / contains binding forbidden
- maximum one Export click per record
- exactly one PDF download and one PDF object-URL event per record
- application/pdf, positive artifact size, .pdf filename
- Report Review must unmount after publish
- Explorer must remain mounted and same-origin
- zero runtime errors and zero unhandled rejections
- authority must relock after every record

Authority in this milestone
---------------------------
Application source mutation OFF
Governed data mutation OFF
Network authority OFF
Pixel evidence OFF
Live UI interaction OFF
Export invocation OFF
