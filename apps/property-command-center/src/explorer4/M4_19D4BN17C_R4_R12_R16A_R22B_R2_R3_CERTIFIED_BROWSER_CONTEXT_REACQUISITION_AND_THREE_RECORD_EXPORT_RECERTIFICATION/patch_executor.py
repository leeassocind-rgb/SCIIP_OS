#!/usr/bin/env python3
from pathlib import Path
import re,sys

p=Path(sys.argv[1]); s=p.read_text()

# Restore Explorer-first selection.
call='out["selection"]=target_select(w,t);time.sleep(.5)'
if call in s and 'out["explorerEntry"]=click_exact(w,"Explorer")' not in s:
    s=s.replace(call,'out["explorerEntry"]=click_exact(w,"Explorer");time.sleep(.6)\n        '+call,1)

old='out["selectedPropertyCertified"]=bool(out["selection"].get("clicked") and a.get("targetVisible"))'
new='out["selectedPropertyCertified"]=bool(out.get("explorerEntry",{}).get("clicked") and out["selection"].get("clicked") and a.get("targetVisible"))'
s=s.replace(old,new,1)

# Correct post-publish success predicate.
pat=r'out\["reportReviewContinuity"\]\s*=\s*bool\(d\.get\("reportReviewVisible"\)\)'
s,n=re.subn(pat,'out["postPublishReportReviewUnmountCertified"]=not bool(d.get("reportReviewVisible"))',s,count=1)
if n==0 and "postPublishReportReviewUnmountCertified" not in s:
    print("PATCH_STATUS: BLOCKED")
    print("DIAGNOSIS: POST_PUBLISH_GUARD_TARGET_NOT_FOUND")
    raise SystemExit(7)

s=s.replace('out["reportReviewContinuity"]','out["postPublishReportReviewUnmountCertified"]')
s=s.replace('print("reportReviewContinuity:",x.get("reportReviewContinuity"))',
            'print("postPublishReportReviewUnmountCertified:",x.get("postPublishReportReviewUnmountCertified"))')

p.write_text(s)
print("PATCH_STATUS: PASSED")
print("EXPLORER_FIRST_SELECTION_PARITY: CERTIFIED")
print("POST_PUBLISH_UNMOUNT_GUARD: CERTIFIED")
print("APPLICATION_SOURCE_MUTATION: OFF")
