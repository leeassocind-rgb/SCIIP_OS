#!/usr/bin/env python3
import sys,json,hashlib,subprocess,re,time,urllib.request
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_CDP_OPEN_HANDSHAKE_COMPLETION_REPAIR_AND_RECORD401_RECERTIFICATION/cdp_open_handshake_completion_repair_and_record401_recertification.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R1_CDP_OPEN_POST_REPAIR_RESIDUAL_DIAGNOSIS_AND_NET_IMPORT_REPAIR"
outdir.mkdir(parents=True,exist_ok=True)
ev=outdir/"cdp_open_post_repair_residual_diagnosis_and_net_import_repair.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B R5-R1-R1 CDP Open Post-Repair Residual Diagnosis + Net Import Repair")
print("="*120)
print("Application source mutation: ON — missing node:net import only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")

if not runner.exists(): raise SystemExit("BLOCKED: authoritative R29B runner missing")
pj=json.loads(prior.read_text()) if prior.exists() else {}
o=pj.get("record401Outcome") or {}
if o.get("failure")!="net is not defined":
    raise SystemExit("BLOCKED: expected exact prior residual 'net is not defined'")
if not pj.get("cdpOpenTimeoutAbsent"):
    raise SystemExit("BLOCKED: prior CDP open timeout was not certified absent")

src=runner.read_text()
before=hashlib.sha256(src.encode()).hexdigest()
baseline=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
if baseline.returncode: raise SystemExit("BLOCKED: baseline runner syntax invalid")

uses_net=bool(re.search(r'\bnet\.createConnection\s*\(',src))
net_import=bool(re.search(r'^\s*import\s+(?:\*\s+as\s+)?net\s+from\s+["\']node:net["\']\s*;',src,re.M))
print("NET_CREATE_CONNECTION_USAGE_PRESENT:",uses_net)
print("NODE_NET_IMPORT_PRESENT_BEFORE:",net_import)
if not uses_net: raise SystemExit("BLOCKED: expected net.createConnection usage absent")

if not net_import:
    imports=list(re.finditer(r'^import[^\n]+;\s*$',src,re.M))
    if imports:
        pos=imports[-1].end()
        src=src[:pos]+'\nimport net from "node:net";'+src[pos:]
    else:
        src='import net from "node:net";\n'+src

runner.write_text(src)
after=hashlib.sha256(runner.read_bytes()).hexdigest()
net_after=bool(re.search(r'^\s*import\s+(?:\*\s+as\s+)?net\s+from\s+["\']node:net["\']\s*;',src,re.M))
nc=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("RUNNER_SHA256_BEFORE:",before)
print("RUNNER_SHA256_AFTER:",after)
print("NODE_NET_IMPORT_PRESENT_AFTER:",net_after)
print("NODE_CHECK_EXIT:",nc.returncode)
print("NODE_CHECK_STDERR:",nc.stderr.strip() or "NONE")
if not net_after or nc.returncode: raise SystemExit("BLOCKED: net import repair failed")

def hs(u):
    try:
        with urllib.request.urlopen(u,timeout=1.5) as r:return r.status
    except:return None
print("SCIIP_APP_HTTP_STATUS:",hs("http://127.0.0.1:5173/"))
print("CDP_HTTP_STATUS:",hs("http://127.0.0.1:9333/json/version"))

print("Re-running authoritative R29B after exact missing-import repair...")
to=False; ec=None; so=""; se=""; t0=time.time()
try:
    p=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=25)
    ec=p.returncode; so=p.stdout or ""; se=p.stderr or ""
except subprocess.TimeoutExpired as e:
    to=True
    so=e.stdout.decode() if isinstance(e.stdout,bytes) else (e.stdout or "")
    se=e.stderr.decode() if isinstance(e.stderr,bytes) else (e.stderr or "")
secs=round(time.time()-t0,3)

r29bev=er/"M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/exact_new_four_hundred_non_export_live_qualification.json"
rj={}
if r29bev.exists():
    try:rj=json.loads(r29bev.read_text())
    except:pass
o401=next((x for x in (rj.get("outcomes") or []) if x.get("ordinal")==401),None)
failure=(o401 or {}).get("failure")
fresh=bool((o401 or {}).get("freshTargetCreated"))
cert=bool((o401 or {}).get("certified"))
net_cleared=(failure!="net is not defined")
print("AUTHORITATIVE_R29B_TIMED_OUT:",to)
print("AUTHORITATIVE_R29B_EXIT_CODE:",ec)
print("AUTHORITATIVE_R29B_SECONDS:",secs)
print("AUTHORITATIVE_R29B_STATUS:",rj.get("status"))
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",rj.get("certifiedCount"))
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",rj.get("executedCount"))
print("RECORD401_OUTCOME:",json.dumps(o401,separators=(",",":")) if o401 else None)
print("NET_REFERENCE_ERROR_CLEARED:",net_cleared)
print("RECORD401_FRESH_TARGET_CREATED:",fresh)
print("RECORD401_RECERTIFIED:",cert)

if cert:
    classification="NET_IMPORT_REPAIRED_RECORD401_RECERTIFIED"; status="PASSED"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R6_EXACT_NEW400_NON_EXPORT_QUALIFICATION_RESUME"
elif fresh:
    classification="NET_IMPORT_REPAIRED_CDP_OPEN_COMPLETED_NEXT_RECORD401_RESIDUAL_CAPTURED"; status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R2_POST_CDP_OPEN_RECORD401_RESIDUAL_CAUSAL_DIAGNOSIS"
elif net_cleared:
    classification="NET_IMPORT_REPAIRED_NEXT_CDP_OPEN_RESIDUAL_CAPTURED"; status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R2_CDP_OPEN_TRANSPORT_RESIDUAL_DIAGNOSIS"
else:
    classification="NET_IMPORT_REPAIR_DID_NOT_CLEAR_REFERENCE_ERROR"; status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R2_MODULE_BINDING_DIAGNOSIS"

result={"framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R1","status":status,"classification":classification,
"runnerSha256Before":before,"runnerSha256After":after,"nodeNetImportPresent":net_after,
"authoritativeR29B":{"timedOut":to,"exitCode":ec,"seconds":secs,"status":rj.get("status"),"certifiedCount":rj.get("certifiedCount"),"executedCount":rj.get("executedCount")},
"netReferenceErrorCleared":net_cleared,"record401FreshTargetCreated":fresh,"record401Recertified":cert,"record401Outcome":o401,
"governedDataMutationOff":True,"exportInvocationOff":True,"nextMilestone":nextm}
ev.write_text(json.dumps(result,indent=2)+"\n")
print("CLASSIFICATION:",classification)
print("STATUS:",status)
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",ev)
print("R29B-R5-R1-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
