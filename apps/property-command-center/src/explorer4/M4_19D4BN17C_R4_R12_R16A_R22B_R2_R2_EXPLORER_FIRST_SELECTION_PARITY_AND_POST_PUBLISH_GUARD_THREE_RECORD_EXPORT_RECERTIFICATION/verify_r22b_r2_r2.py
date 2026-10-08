#!/usr/bin/env python3
from pathlib import Path
import sys,re,json

s=Path(sys.argv[1]).read_text()
checks={
 "explorerFirstEntryPresent": 'click_exact(w,"Explorer")' in s or "click_exact(w,'Explorer')" in s,
 "targetSelectionPresent": "target_select(w,t)" in s,
 "selectedReadbackDependsOnExplorerEntry": "explorerEntry" in s and "selectedPropertyCertified" in s,
 "postPublishUnmountPredicatePresent": "postPublishReportReviewUnmountCertified" in s and "not bool(d.get(\"reportReviewVisible\"))" in s,
 "oldContinuityFieldAbsent": 'out["reportReviewContinuity"]' not in s and "out['reportReviewContinuity']" not in s,
 "pdfArtifactGuardsPreserved": "pdfDownloadCount" in s and "pdfEventCount" in s,
 "runtimeGuardsPreserved": "runtimeErrorCount" in s and "unhandledRejectionCount" in s,
 "explorerContinuityGuardPreserved": "explorerContinuity" in s,
 "sameOriginGuardPreserved": "sameOrigin" in s,
 "strictSequentialGuardPreserved": "haltOnFirstFailureObserved" in s
}
print(json.dumps(checks,indent=2))
if not all(checks.values()):
    print("STATUS: BLOCKED")
    print("DIAGNOSIS: EXPLORER_FIRST_OR_POST_PUBLISH_GUARD_PARITY_INCOMPLETE")
    raise SystemExit(8)
print("STATUS: PASSED")
print("CLASSIFICATION: EXPLORER_FIRST_SELECTION_AND_POST_PUBLISH_GUARD_PARITY_CERTIFIED")
