#!/usr/bin/env python3
from pathlib import Path
import sys, re, hashlib, subprocess, json

repo=Path(sys.argv[1]).expanduser().resolve()
runner=repo/"apps/property-command-center/src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
if not runner.exists():
    print("STATUS: BLOCKED\nREASON: authoritative R29B runner absent"); raise SystemExit(4)

before=runner.read_text()
old="const wantSf=sfFromKey(sk) ?? Number(target.sf||0) || null;"
new="const wantSf=sfFromKey(sk) ?? (Number(target.sf||0) || null);"
count=before.count(old)
if count==1:
    after=before.replace(old,new,1)
elif new in before:
    after=before
else:
    print("STATUS: BLOCKED\nREASON: exact diagnosed syntax surface not found"); raise SystemExit(5)

runner.write_text(after)
def sha(s): return hashlib.sha256(s.encode()).hexdigest()
check=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
checks={
 "exactDiagnosedSurfaceFoundOrAlreadyRepaired": count==1 or new in before,
 "nullishCoalescingParenthesized": new in after,
 "obsoleteMixedExpressionAbsent": old not in after,
 "nodeSyntaxCheckPassed": check.returncode==0,
 "exportInvocationOffPreserved": "Export invocation: OFF" in after,
 "freshPagePerRecordPreserved": "Fresh page per record: REQUIRED" in after,
 "strictSequentialPreserved": "Strict sequential: ON" in after,
 "haltOnFirstFailurePreserved": "Halt on first failure: ON" in after,
}
print("="*120)
print("SCIIP Explorer 4.0 — R29B-R1 Syntax-Only Repair + Non-Export Live Qualification Recertification")
print("="*120)
print("Application source mutation: ON — R29B runner syntax-only repair")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("RUNNER_SHA256_BEFORE:",sha(before))
print("RUNNER_SHA256_AFTER:",sha(after))
print("NODE_CHECK_STDERR:",check.stderr.strip() or "NONE")
print("----- CHECKS -----")
for k,v in checks.items(): print(f"{k}: {v}")
if not all(checks.values()):
    print("STATUS: BLOCKED\nCLASSIFICATION: R29B_R1_SYNTAX_REPAIR_CERTIFICATION_FAILED"); raise SystemExit(6)
print("SYNTAX_REPAIR_CERTIFIED: True")
print("Re-running authoritative R29B runner...")
r=subprocess.run(["node",str(runner),str(repo)])
print("AUTHORITATIVE_R29B_EXIT_CODE:",r.returncode)
if r.returncode==0:
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R29B_R1_SYNTAX_REPAIRED_AND_R29B_RECERTIFIED")
else:
    print("STATUS: DIAGNOSTIC_COMPLETE")
    print("CLASSIFICATION: R29B_RUNTIME_RESIDUAL_REMAINS_AFTER_SYNTAX_ONLY_REPAIR")
    print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R29B_R1_R1_POST_SYNTAX_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS")
raise SystemExit(0)
