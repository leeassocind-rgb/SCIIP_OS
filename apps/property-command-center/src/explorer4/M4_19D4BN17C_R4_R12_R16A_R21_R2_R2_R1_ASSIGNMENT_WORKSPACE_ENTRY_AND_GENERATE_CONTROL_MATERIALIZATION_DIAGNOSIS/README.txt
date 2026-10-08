SCIIP Explorer 4.0 — R21-R2-R2-R1
Assignment Workspace Entry + Generate Control Materialization Diagnosis

R21-R2-R2 proved that the source chain to Generate Client Listing Report is correct,
but the exact Generate button is not currently rendered in the live DOM.

This milestone moves one level outward and diagnoses how the live application enters
ListingAssignmentProductionHouse.

It:
- finds all imports and mount sites of ListingAssignmentProductionHouse;
- resolves nearby conditional/state owners;
- inventories source controls labelled Assignment / Listing Assignment / Production House;
- inventories corresponding live controls through CDP;
- performs exact label correlation where possible;
- specifically tests whether the visible "Assignments" control is backed by a source "Assignments" control.

It DOES NOT click Assignments.
It DOES NOT click Generate Client Listing Report.
It DOES NOT invoke Export.
No application or governed-data mutation. No pixel evidence.
