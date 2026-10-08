SCIIP Explorer 4.0 — R21-R2-R2
Bounded State Transition + Export Control Materialization Certification

Prerequisite:
R21-R2-R1 certified the mount owner and source state gate:
  showReportReview
driven by:
  setShowReportReview(true)
from the exact user-facing button:
  Generate Client Listing Report

This milestone allows exactly one live UI state transition:
- one click on an exact, uniquely matched visible button whose text is exactly
  "Generate Client Listing Report".

It then verifies:
- InstitutionalReportReview becomes visible;
- the real Download Client Listing Report control materializes;
- the Export control is visible/enabled.

It DOES NOT click or invoke Export.
It DOES NOT mutate application source or governed data.
It DOES NOT use pixel evidence.

If the exact Generate control is not uniquely present, the milestone stops diagnostically rather than
clicking a weak lexical match such as Assignments or Google Maps' "Report a map error".
