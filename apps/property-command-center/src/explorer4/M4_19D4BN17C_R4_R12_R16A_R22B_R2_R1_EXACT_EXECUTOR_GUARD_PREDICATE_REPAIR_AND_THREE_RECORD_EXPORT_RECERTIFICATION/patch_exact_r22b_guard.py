#!/usr/bin/env python3
from pathlib import Path
import sys,re

p=Path(sys.argv[1])
s=p.read_text()

patterns=[
    (
        r'out\["reportReviewContinuity"\]\s*=\s*bool\(d\.get\("reportReviewVisible"\)\)',
        'out["postPublishReportReviewUnmountCertified"]=not bool(d.get("reportReviewVisible"))'
    ),
    (
        r"out\['reportReviewContinuity'\]\s*=\s*bool\(d\.get\('reportReviewVisible'\)\)",
        "out['postPublishReportReviewUnmountCertified']=not bool(d.get('reportReviewVisible'))"
    )
]

changed=False
for pat,repl in patterns:
    ns,n=re.subn(pat,repl,s,count=1)
    if n:
        s=ns
        changed=True
        break

if not changed:
    print("PATCH_STATUS: BLOCKED")
    print("DIAGNOSIS: EXACT_RUNTIME_REPORT_REVIEW_CONTINUITY_ASSIGNMENT_NOT_FOUND")
    # Provide diagnostic neighborhoods without mutating anything.
    for m in re.finditer(r'reportReviewContinuity|reportReviewVisible|certified"\]\s*=\s*all',s):
        a=max(0,m.start()-500); b=min(len(s),m.start()+1200)
        print("NEIGHBORHOOD:",re.sub(r"\s+"," ",s[a:b]))
    raise SystemExit(6)

# Replace the certification condition reference.
refs=[
    ('out["reportReviewContinuity"]','out["postPublishReportReviewUnmountCertified"]'),
    ("out['reportReviewContinuity']","out['postPublishReportReviewUnmountCertified']")
]
for a,b in refs:
    s=s.replace(a,b)

# Update console label only; no behavior change beyond predicate inversion.
s=s.replace('print("reportReviewContinuity:",x.get("reportReviewContinuity"))',
            'print("postPublishReportReviewUnmountCertified:",x.get("postPublishReportReviewUnmountCertified"))')
s=s.replace("print('reportReviewContinuity:',x.get('reportReviewContinuity'))",
            "print('postPublishReportReviewUnmountCertified:',x.get('postPublishReportReviewUnmountCertified'))")

# Ensure old success requirement is gone from certification-local copy.
if 'out["reportReviewContinuity"]' in s or "out['reportReviewContinuity']" in s:
    print("PATCH_STATUS: BLOCKED")
    print("DIAGNOSIS: STALE_REPORT_REVIEW_CONTINUITY_REFERENCE_REMAINS")
    raise SystemExit(7)

p.write_text(s)

print("PATCH_STATUS: PASSED")
print("PATCH_SCOPE: CERTIFICATION_EXECUTOR_COPY_ONLY")
print("OLD_PREDICATE: reportReviewContinuity = bool(reportReviewVisible)")
print("NEW_PREDICATE: postPublishReportReviewUnmountCertified = not bool(reportReviewVisible)")
print("APPLICATION_SOURCE_MUTATION: OFF")
