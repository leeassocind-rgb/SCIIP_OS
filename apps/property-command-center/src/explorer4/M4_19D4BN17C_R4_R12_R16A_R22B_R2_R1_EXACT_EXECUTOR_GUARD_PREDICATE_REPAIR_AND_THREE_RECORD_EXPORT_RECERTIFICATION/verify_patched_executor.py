#!/usr/bin/env python3
from pathlib import Path
import sys,re,json
p=Path(sys.argv[1])
s=p.read_text()

checks={
  "newUnmountPredicatePresent": bool(re.search(r'postPublishReportReviewUnmountCertified.*not bool\(d\.get\("reportReviewVisible"\)\)',s)),
  "oldContinuityFieldAbsent": 'out["reportReviewContinuity"]' not in s,
  "pdfArtifactGuardsPreserved": "pdfDownloadCount" in s and "pdfEventCount" in s,
  "runtimeErrorGuardsPreserved": "runtimeErrorCount" in s and "unhandledRejectionCount" in s,
  "explorerContinuityGuardPreserved": "explorerContinuity" in s,
  "sameOriginGuardPreserved": "sameOrigin" in s,
  "strictSequentialGuardPreserved": "haltOnFirstFailureObserved" in s,
  "singleExportAuthorityPreserved": "exportInvocation" in s
}
print(json.dumps(checks,indent=2))
if not all(checks.values()):
    print("STATUS: BLOCKED")
    print("DIAGNOSIS: PATCHED_EXECUTOR_GUARD_PARITY_INCOMPLETE")
    raise SystemExit(8)
print("STATUS: PASSED")
print("CLASSIFICATION: PATCHED_EXECUTOR_GUARD_PARITY_CERTIFIED")
