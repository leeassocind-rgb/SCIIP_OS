SCIIP Explorer 4.0 — R22B-R2-R6

R22B-R2-R5 certified the first two records completely, including PDF output and clean runtime.
The third record, 8700 - 8750 Rex Rd, failed only at selected-property certification.

This milestone diagnoses only that third-record selection/readback path.

It opens one fresh SCIIP page, enters Explorer, inventories:
- exact target button matches,
- substring matches,
- Rex/8700/8750 normalized candidates,
- session/local storage,
- selected DOM hints before/after click,
- Assignments control presence after selection.

It does NOT enter Assignments and does NOT invoke Export.

The goal is to distinguish:
- actual click failure,
- label normalization mismatch,
- duplicate target ambiguity,
- too-strict post-click text readback,
- transient prior failure,
- deeper selected-property state leakage.

Application source mutation OFF.
Governed data mutation OFF.
Export invocation OFF.
Assignments invocation OFF.
Pixel evidence OFF.
