#!/usr/bin/env python3
from pathlib import Path
import sys
p=Path(sys.argv[1])
s=p.read_text()
old='report_review_continuity = bool(re.search(r"Review Client Listing Report|Institutional Reporting Engine", body_after, re.I))'
new='report_review_continuity = not bool(re.search(r"Review Client Listing Report|Institutional Reporting Engine", body_after, re.I))'
if old not in s:
    # tolerate naming/style variations; make only certification-local substitutions
    variants=[
      ('reportReviewContinuity = bool(re.search(r"Review Client Listing Report|Institutional Reporting Engine", body_after, re.I))',
       'reportReviewContinuity = not bool(re.search(r"Review Client Listing Report|Institutional Reporting Engine", body_after, re.I))'),
      ('reportReviewContinuity=bool(re.search(r"Review Client Listing Report|Institutional Reporting Engine",body_after,re.I))',
       'reportReviewContinuity=not bool(re.search(r"Review Client Listing Report|Institutional Reporting Engine",body_after,re.I))')
    ]
    changed=False
    for a,b in variants:
        if a in s: s=s.replace(a,b); changed=True
    if not changed:
        print("PATCH_STATUS: BLOCKED")
        print("DIAGNOSIS: EXACT_R22B_REPORT_REVIEW_CONTINUITY_PREDICATE_NOT_FOUND")
        raise SystemExit(6)
else:
    s=s.replace(old,new)
# Rename output semantics so evidence is not misleading.
s=s.replace('"reportReviewContinuity": report_review_continuity','"postPublishReportReviewUnmountCertified": report_review_continuity')
s=s.replace('"reportReviewContinuity":reportReviewContinuity','"postPublishReportReviewUnmountCertified":reportReviewContinuity')
p.write_text(s)
print("PATCH_STATUS: PASSED")
print("PATCH_SCOPE: CERTIFICATION_EXECUTOR_COPY_ONLY")
print("APPLICATION_SOURCE_MUTATION: OFF")
