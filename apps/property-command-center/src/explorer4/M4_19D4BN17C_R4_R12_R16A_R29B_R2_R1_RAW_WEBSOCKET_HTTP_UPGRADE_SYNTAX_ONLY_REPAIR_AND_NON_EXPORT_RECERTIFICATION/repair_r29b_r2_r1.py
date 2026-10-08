#!/usr/bin/env python3
from pathlib import Path
import sys, hashlib, subprocess, json

R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"

repo=Path(sys.argv[1]).expanduser().resolve()
runner=repo/"apps/property-command-center/src/explorer4"/R29B/"qualify_r29b.mjs"
if not runner.exists():
    print("STATUS: BLOCKED")
    print("REASON: authoritative R29B runner absent")
    raise SystemExit(4)

before=runner.read_text()
before_hash=hashlib.sha256(before.encode()).hexdigest()

# R29B-R2 wrote a regex literal with doubled backslashes:
#   /^HTTP\\/1\\.1 101\\b/
# In JS regex syntax the doubled backslash makes the following slash terminate
# the regex early. Replace only that HTTP-101 test with a non-regex equivalent.
old='if(!/^HTTP\\\\/1\\\\.1 101\\\\b/.test(lines[0]||""))return fail(new Error("raw websocket upgrade failed: "+(lines[0]||"")));'
new='if(!String(lines[0]||"").startsWith("HTTP/1.1 101"))return fail(new Error("raw websocket upgrade failed: "+(lines[0]||"")));'

count=before.count(old)
if count==1:
    after=before.replace(old,new,1)
elif new in before:
    after=before
else:
    print("STATUS: BLOCKED")
    print("REASON: exact diagnosed HTTP upgrade regex surface not found")
    print("DIAGNOSTIC_OLD_COUNT:",count)
    raise SystemExit(5)

runner.write_text(after)
after_hash=hashlib.sha256(after.encode()).hexdigest()
syntax=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)

checks={
  "exactHttpUpgradeSyntaxSurfaceRepaired":new in after,
  "obsoleteDoubleEscapedRegexAbsent":old not in after,
  "rawStdlibWebSocketPreserved":"class RawWebSocket {" in after,
  "nodeNetTransportPreserved":'import("node:net")' in after,
  "cdpRawWebSocketBindingPreserved":"this.ws=new RawWebSocket(this.wsUrl);" in after,
  "maskedFramesPreserved":"mask=crypto.randomBytes(4)" in after,
  "largeFramesPreserved":"readBigUInt64BE" in after and "writeBigUInt64BE" in after,
  "pingPongPreserved":"opcode===0x9" in after and "_pong(payload)" in after,
  "nodeSyntaxCheckPassed":syntax.returncode==0,
  "exportInvocationOffPreserved":"Export invocation: OFF" in after,
  "freshPagePerRecordPreserved":"Fresh page per record: REQUIRED" in after,
  "strictSequentialPreserved":"Strict sequential: ON" in after,
  "haltOnFirstFailurePreserved":"Halt on first failure: ON" in after,
}

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R1 Raw WebSocket HTTP Upgrade Syntax-Only Repair + Non-Export Recertification")
print("="*120)
print("Application source mutation: ON — R29B runner syntax-only repair")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("RUNNER_SHA256_BEFORE:",before_hash)
print("RUNNER_SHA256_AFTER:",after_hash)
print("NODE_CHECK_STDERR:",syntax.stderr.strip() or "NONE")
print("----- CHECKS -----")
for k,v in checks.items():
    print(f"{k}: {v}")

if not all(checks.values()):
    print("STATUS: BLOCKED")
    print("CLASSIFICATION: R29B_R2_R1_HTTP_UPGRADE_SYNTAX_REPAIR_CERTIFICATION_FAILED")
    raise SystemExit(6)

print("SYNTAX_REPAIR_CERTIFIED: True")
print("TRANSPORT_IMPLEMENTATION_PRESERVED: True")
print("Re-running authoritative R29B runner...")
run=subprocess.run(["node",str(runner),str(repo)])
print("AUTHORITATIVE_R29B_EXIT_CODE:",run.returncode)

ev=repo/"apps/property-command-center/evidence/explorer4"/R29B/"exact_new_four_hundred_non_export_live_qualification.json"
st=None
if ev.exists():
    try:
        st=json.loads(ev.read_text())
    except Exception:
        st=None

print("AUTHORITATIVE_R29B_STATUS:",(st or {}).get("status"))
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",(st or {}).get("certifiedCount"))
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",(st or {}).get("executedCount"))
print("AUTHORITATIVE_R29B_CLASSIFICATION:",(st or {}).get("classification"))

if (st or {}).get("status")=="PASSED":
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R29B_R2_R1_RAW_WEBSOCKET_HTTP_UPGRADE_SYNTAX_REPAIRED_R29B_CERTIFIED")
    print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R29C_EXACT_EIGHT_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION")
else:
    print("STATUS: DIAGNOSTIC_COMPLETE")
    print("CLASSIFICATION: R29B_RUNTIME_RESIDUAL_REMAINS_AFTER_RAW_WEBSOCKET_HTTP_UPGRADE_SYNTAX_REPAIR")
    print("NEXT_MILESTONE:",(st or {}).get("nextMilestone") or "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R1_R1_POST_HTTP_UPGRADE_SYNTAX_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS")

print("R29B-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
raise SystemExit(0)
