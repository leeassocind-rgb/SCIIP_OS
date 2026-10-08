SCIIP Explorer 4.0 — R24B-R2

R24B-R1 proved that record 2 selection succeeded. The failure was caused by a cohort candidate label that absorbed the DOM status suffix `PROPOSED ·`, while the actual selected marker correctly exposed only the address.

This milestone applies a bounded diagnostic-harness repair:
- normalize candidate binding labels only at a recognized status-token boundary;
- do not modify application source or governed data;
- preserve fresh-page, strict-sequential, halt-on-first-failure behavior;
- preserve 3-sample Explorer settle (2s), 3-sample target binding settle (5s), and 3-sample selected-property settle (2s);
- qualify all fifteen new records through the live Export-control binding;
- never click Export.

If all fifteen pass, the next milestone is the exact-25 guarded Export execution.
