SCIIP Explorer 4.0 — R29A-R3

Purpose:
Diagnose the exact R29A fresh-page Explorer settle failure after R29A-R2
successfully restored both the SCIIP app runtime and CDP.

This milestone performs a single fresh-page, read-only timing observation
through five seconds and captures:
- document.readyState
- body length
- button count
- exact Explorer count
- Explorer-like count
- visible/enabled Explorer count
- Assignments count
- origin
- URL

No Explorer click, property click, Assignments, Generate, or Export occurs.

If the Explorer control materializes stably within the existing two-second
policy window, the next milestone is a page-ready anchored settle repair.
Otherwise the next milestone is a bounded settle-policy repair.
