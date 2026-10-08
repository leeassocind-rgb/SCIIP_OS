SCIIP Explorer 4.0 — R28B-R3
Explorer Entry Click Helper Repair + Record 201 Recertification + Exact New-200 Non-Export Resume

Evidence chain:
- R28B: record 201 Explorer settled but Explorer entry did not certify.
- R28B-R1: exact failed stage = explorerEntryCertified.
- R28B-R2: Explorer uniquely visible/enabled; one native click dispatched;
  840 markers materialized by 0.5 seconds; same origin preserved.

Repair:
- replace the ambiguous prior click-certification boundary with a structured,
  syntactically explicit exact-button click helper;
- Explorer entry is certified only when both:
  (1) exact unique enabled Explorer click returns clicked=true, and
  (2) post-click Explorer marker surface materializes.
- recertify record 201 from a fresh page because R28B certified zero records.
- on record-201 pass, continue 202-400 strict sequentially.
- halt immediately on first genuine failure.

Non-export contract:
- Download Client Listing Report control may be certified.
- It is NEVER clicked.
- Export invocation remains OFF for every executed record.
