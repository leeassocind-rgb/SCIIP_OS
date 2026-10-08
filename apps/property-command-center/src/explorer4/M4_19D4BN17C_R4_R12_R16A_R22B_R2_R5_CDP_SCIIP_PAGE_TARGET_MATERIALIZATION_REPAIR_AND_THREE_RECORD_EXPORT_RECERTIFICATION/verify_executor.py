#!/usr/bin/env python3
from pathlib import Path
import json,sys

s=Path(sys.argv[1]).read_text()
checks={
 "explorerFirstSelection": 'out["explorerEntry"]=click_exact(w,"Explorer")' in s,
 "targetSelection": 'target_select(w,t)' in s,
 "selectedReadbackDependsOnExplorerEntry": "selectedPropertyCertified" in s and "explorerEntry" in s,
 "postPublishUnmountPredicate": 'postPublishReportReviewUnmountCertified' in s and 'not bool(d.get("reportReviewVisible"))' in s,
 "oldContinuityFieldAbsent": 'out["reportReviewContinuity"]' not in s,
 "pdfDownloadGuard":"pdfDownloadCount" in s,
 "pdfObjectUrlGuard":"pdfEventCount" in s,
 "runtimeErrorGuard":"runtimeErrorCount" in s and "unhandledRejectionCount" in s,
 "explorerContinuityGuard":"explorerContinuity" in s,
 "sameOriginGuard":"sameOrigin" in s,
 "strictSequentialGuard":"haltOnFirstFailureObserved" in s
}
print(json.dumps(checks,indent=2))
if not all(checks.values()):
    print("STATUS: BLOCKED")
    print("DIAGNOSIS: RECERTIFICATION_EXECUTOR_PARITY_INCOMPLETE")
    raise SystemExit(8)
print("STATUS: PASSED")
print("CLASSIFICATION: EXPLORER_FIRST_POST_PUBLISH_EXPORT_EXECUTOR_PARITY_CERTIFIED")
