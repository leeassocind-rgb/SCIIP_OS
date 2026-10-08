#!/usr/bin/env python3
from pathlib import Path
import re,sys

p=Path(sys.argv[1])
s=p.read_text()

# 1) Repair post-publish guard.
pairs=[
(
 r'out\["reportReviewContinuity"\]\s*=\s*bool\(d\.get\("reportReviewVisible"\)\)',
 'out["postPublishReportReviewUnmountCertified"]=not bool(d.get("reportReviewVisible"))'
),
(
 r"out\['reportReviewContinuity'\]\s*=\s*bool\(d\.get\('reportReviewVisible'\)\)",
 "out['postPublishReportReviewUnmountCertified']=not bool(d.get('reportReviewVisible'))"
)
]
guard_changed=False
for pat,repl in pairs:
    ns,n=re.subn(pat,repl,s,count=1)
    if n:
        s=ns
        guard_changed=True
        break
if not guard_changed and "postPublishReportReviewUnmountCertified" not in s:
    print("PATCH_STATUS: BLOCKED")
    print("DIAGNOSIS: POST_PUBLISH_GUARD_TARGET_NOT_FOUND")
    raise SystemExit(6)

s=s.replace('out["reportReviewContinuity"]','out["postPublishReportReviewUnmountCertified"]')
s=s.replace("out['reportReviewContinuity']","out['postPublishReportReviewUnmountCertified']")

# 2) Ensure Explorer-first selection sequence is present.
# Find the per-record fresh-page initialization and inject exact Explorer click before target_select.
target_call='out["selection"]=target_select(w,t);time.sleep(.5)'
if target_call not in s:
    target_call="out['selection']=target_select(w,t);time.sleep(.5)"
if target_call not in s:
    print("PATCH_STATUS: BLOCKED")
    print("DIAGNOSIS: TARGET_SELECTION_CALLSITE_NOT_FOUND")
    raise SystemExit(7)

if 'out["explorerEntry"]=click_exact(w,"Explorer")' not in s and "out['explorerEntry']=click_exact(w,'Explorer')" not in s:
    inject='out["explorerEntry"]=click_exact(w,"Explorer");time.sleep(.6)\n        '+target_call
    s=s.replace(target_call,inject,1)

# 3) Strengthen selected-property certification to require Explorer entry success too.
old='out["selectedPropertyCertified"]=bool(out["selection"].get("clicked") and a.get("targetVisible"))'
new='out["selectedPropertyCertified"]=bool(out.get("explorerEntry",{}).get("clicked") and out["selection"].get("clicked") and a.get("targetVisible"))'
if old in s:
    s=s.replace(old,new,1)

# 4) Update console semantics.
s=s.replace('print("reportReviewContinuity:",x.get("reportReviewContinuity"))',
            'print("postPublishReportReviewUnmountCertified:",x.get("postPublishReportReviewUnmountCertified"))')

# 5) Require corrected unmount guard in final certification if the old field still appears.
s=s.replace('out["reportReviewContinuity"],','out["postPublishReportReviewUnmountCertified"],')
s=s.replace("out['reportReviewContinuity'],","out['postPublishReportReviewUnmountCertified'],")

p.write_text(s)

print("PATCH_STATUS: PASSED")
print("PATCH_SCOPE: CERTIFICATION_EXECUTOR_COPY_ONLY")
print("EXPLORER_FIRST_SELECTION_PARITY: RESTORED")
print("POST_PUBLISH_UNMOUNT_GUARD: RESTORED")
print("APPLICATION_SOURCE_MUTATION: OFF")
