SCIIP Explorer 4.0 — R21-R4
Single-Record Guarded Export Invocation Certification

Prerequisite:
R21-R3 certified:
- one exact visible enabled Download Client Listing Report control;
- exact source handler binding;
- exact live React onClick binding;
- handler name exportReport;
- guarded success/failure readback contract.

This milestone is the first milestone authorized to invoke Export.

Authority is bounded to exactly ONE click on the unique visible enabled:
  Download Client Listing Report

Before the click it instruments non-mutating runtime observation of:
- anchor click/download attributes;
- URL.createObjectURL / revokeObjectURL calls;
- runtime errors and unhandled rejections.

After the click it requires:
- an export-specific output signal;
- no runtime errors;
- report-review continuity;
- Explorer/shell continuity;
- same-origin continuity.

It does not mutate application source or governed data.
Network authority remains OFF.
Pixel evidence remains OFF.
