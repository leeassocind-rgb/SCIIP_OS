SCIIP Explorer 4.0 — R25D-R2 Third Record Explorer Control Materialization Timing Diagnosis

R25D-R1 certified that the third record failure occurred because the fresh page was created but the Explorer control did not settle within the existing execution window.

Target:
8700 - 8750 Rex Rd

This milestone performs a bounded five-second timing observation on a fresh page and records:
- exact visible enabled Explorer count
- Explorer-like control count
- Assignments count
- total button count
- document readyState
- first time exactly one Explorer control appears
- whether Explorer remains stable through the final five samples

No Explorer click.
No property click.
No Assignments.
No Export.
No application or governed-data mutation.

Possible outcomes:
1. Explorer appears and stabilizes within 2s -> prior failure was transient; use stronger bounded settle parity.
2. Explorer appears only after 2s -> extend the bounded Explorer settle guard.
3. Explorer remains unstable/absent -> deeper materialization diagnosis.
