#!/usr/bin/env python3
from pathlib import Path
import json,sys
s=Path(sys.argv[1]).read_text()
checks={
 "explorerFirstSelection": 'out["explorerEntry"]=click_exact(w,"Explorer")' in s,
 "targetSelection": 'target_select(w,t)' in s,
 "postPublishUnmount": 'postPublishReportReviewUnmountCertified' in s and 'not bool(d.get("reportReviewVisible"))' in s,
 "pdfGuards":"pdfDownloadCount" in s and "pdfEventCount" in s,
 "runtimeGuards":"runtimeErrorCount" in s and "unhandledRejectionCount" in s,
 "explorerContinuity":"explorerContinuity" in s,
 "sameOrigin":"sameOrigin" in s,
 "strictSequential":"haltOnFirstFailureObserved" in s
}
print(json.dumps(checks,indent=2))
if not all(checks.values()):
    print("STATUS: BLOCKED"); print("DIAGNOSIS: RECERTIFICATION_EXECUTOR_PARITY_INCOMPLETE"); raise SystemExit(8)
print("STATUS: PASSED")
print("CLASSIFICATION: RECERTIFICATION_EXECUTOR_PARITY_CERTIFIED")
