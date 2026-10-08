SCIIP Explorer 4.0 — R25B-R2-R2 Canonical Candidate Identity Normalization Repair + Twenty-Five Record Non-Export Recertification

Prerequisite diagnosis
----------------------
R25B-R2-R1-R1 certified:
- R25A raw candidate: NE of Interstate 15 and Stoddard Wells Bldg 1-3PROPOSED/PLANNED ...
- R25A normalized target: NE of Interstate 15 and Stoddard Wells Bldg 1-3PROPOSED/
- live/canonical marker: NE of Interstate 15 and Stoddard Wells Bldg 1-3

Therefore the defect is a candidate-normalization boundary bug, not a canonical-property identity defect.

Repair
------
Certification-local only.

Remove only a recognized trailing status token from the prior normalized candidate identity:
PROPOSED/PLANNED, PROPOSED/, PROPOSED, PLANNED, EXISTING, AVAILABLE, UNDER CONSTRUCTION, U/C.

The repair does not:
- mutate application source
- mutate governed data
- reorder the cohort
- substitute candidates
- weaken ambiguous matching
- invoke Export

The same exact 25 new candidates are then recertified through:
fresh Explorer page -> Explorer settle -> target binding -> selected-property settle ->
Assignments -> Generate Client Listing Report -> direct Report Review ->
Download Client Listing Report control -> live exportReport handler -> continuity.

Strict sequential; halt on first failure.

If all 25 pass:
R25C Exact Fifty Record Guarded Export Execution Readiness + Authorization.
