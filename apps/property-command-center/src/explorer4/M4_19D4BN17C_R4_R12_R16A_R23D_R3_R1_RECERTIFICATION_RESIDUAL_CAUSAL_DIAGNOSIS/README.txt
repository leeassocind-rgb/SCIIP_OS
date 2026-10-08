SCIIP Explorer 4.0 — R23D-R3-R1

R23D-R3 certified the first two records with the repaired exact-then-unique-contains selection binding,
then halted on 8700 - 8750 Rex Rd before a third Export.

R23D-R3-R1 performs no retry.

It reads the existing R23D-R3 evidence and exposes:
- exact/contains match counts
- candidate list
- selected binding mode
- whether the click occurred
- bounded selection-settle result
- downstream workflow fields
- exact failure label

It then distinguishes:
- target non-materialization
- contains ambiguity
- exact ambiguity
- click success followed by settle failure
- or another binding/parity residual

No live UI interaction.
No Export invocation.
No source or governed-data mutation.
