SCIIP Explorer 4.0 — R28A-R1
Shape-Safe Reference-200 Reconstruction Repair + Candidate Selection Recertification

Observed R28A failure:
AttributeError: 'list' object has no attribute 'get'

Cause:
The reference-evidence scan assumed every parsed JSON root was a dictionary.
A valid evidence file with a top-level array was encountered.

Repair:
- top-level JSON arrays are explicitly supported as ordered cohort evidence;
- dictionary evidence continues to use known cohort keys;
- unsupported/non-dict/non-list roots are skipped safely;
- .get() is never called on a list;
- policy, candidate-selection ordering, reference exclusion, status normalization,
  building/project granularity, and all non-export guards remain unchanged.

R28A-R1 performs:
- no property click
- no Assignments
- no Generate
- no Export
- no governed-data mutation

On pass:
R28B — Two-Hundred New Record Non-Export Live Qualification.
