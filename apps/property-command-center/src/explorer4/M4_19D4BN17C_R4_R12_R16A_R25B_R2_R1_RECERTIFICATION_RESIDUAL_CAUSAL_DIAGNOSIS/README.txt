SCIIP Explorer 4.0 — R25B-R2-R1 Recertification Residual Causal Diagnosis

R25B-R2 repaired the base Stoddard Wells collision and successfully qualified record 11.

It then halted on record 12:
NE of Interstate 15 and Stoddard Wells Bldg 1-3PROPOSED/

Observed prior behavior:
- target-binding settle passed
- binding chosen: UNIQUE_CONTAINS
- selection click occurred
- selected-property readback failed
- Assignments/Generate/Export path was not entered

This milestone is a single-record causal diagnosis only.

It captures:
- R25A raw target identity
- R25A normalized target identity
- pre-click exact, boundary-normalized, contains, and Stoddard-like candidate sets
- exact DOM candidate clicked
- post-click selected marker text and boundary-normalized label over a bounded 2-second readback window
- whether Bldg 1-3 survives selected-state representation
- whether selected-state identity matches the R25A normalized target
- whether the click collapses to the base Stoddard Wells identity

Authority:
- exactly one property click maximum
- no Assignments invocation
- no Generate invocation
- no Export invocation
- no application source mutation
- no governed-data mutation
- no network authority
- no pixel evidence

The milestone diagnoses before repairing.
