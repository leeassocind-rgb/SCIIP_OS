SCIIP Explorer 4.0 — R24B-R3

R24B-R2-R1 certified the actual workflow:
Generate Client Listing Report -> Report Review materializes directly -> Download Client Listing Report is present.

The prior R24B-R2 harness incorrectly required an intermediate `Report Review` button that does not exist.

This repair:
- preserves status-suffix candidate normalization;
- preserves all Explorer, target-binding, selected-property and fresh-page settle guards;
- clicks Generate Client Listing Report once;
- requires the Report Review modal text and unique enabled Download Client Listing Report control to materialize directly;
- verifies the live React handler is `exportReport`;
- does NOT click Export;
- remains strict sequential and halt-on-first-failure.

If all fifteen new records qualify, proceed to R24C exact-25 guarded Export readiness/authorization.
