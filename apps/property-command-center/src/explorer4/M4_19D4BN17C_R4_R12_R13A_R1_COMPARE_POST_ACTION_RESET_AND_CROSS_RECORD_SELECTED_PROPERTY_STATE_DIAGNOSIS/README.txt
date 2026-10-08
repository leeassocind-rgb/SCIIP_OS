SCIIP Explorer 4.0 — M4.19D4BN17C-R4-R12-R13A-R1
Compare Post-Action Reset + Cross-Record Selected-Property State Diagnosis

R13A established:
- 2 Musick selected-property precondition passed;
- Compare control found;
- chosen control = BUTTON / "Open Compare";
- Compare action certified;
- Explorer, map, and selected property remained visible;
- record 2 (2701 Carrier Ave) failed BEFORE Compare because selectedPropertyReady=false;
- strict halt-on-first-failure correctly stopped the cohort.

Therefore the residual is bounded to cross-record state isolation/reset after Compare.

R13A-R1 diagnoses:
1. Compare-visible state after first activation;
2. whether Page.navigate to Explorer root fully resets Compare;
3. URL/session/local storage before and after reset;
4. presence of Close/Back/Exit Compare controls;
5. whether explicit Compare close/reset is required before next search;
6. whether the second property can be selected after each bounded reset variant;
7. safest deterministic reset contract for recertification.

No Command/Analyze/Present/Export actions are invoked.
No application or governed-data mutation.
