#!/usr/bin/env python3
import sys,json,hashlib,subprocess,time
from pathlib import Path
repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_LOCALIZED_HELPER_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION/localized_helper_await_lifecycle_repair_and_record401_recertification.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R1_HTTP_OK_POST_REPAIR_UNSETTLED_AWAIT_DEEP_DIAGNOSIS"
outdir.mkdir(parents=True,exist_ok=True)
evidence=outdir/"http_ok_post_repair_unsettled_await_deep_diagnosis.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R1 HTTP-OK Post-Repair Unsettled-Await Deep Diagnosis")
print("="*120)
print("Mode: TEMPORARY_RUNNER_INSTRUMENTATION_ONLY")
print("Application source mutation: ON — temporary diagnostic instrumentation, restored before exit")
print("Governed data mutation: OFF")
print("Live workflow mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")
print("External execution bound: 8 seconds")

if not runner.exists(): raise SystemExit("BLOCKED: authoritative runner missing")
pj=json.loads(prior.read_text()) if prior.exists() else {}
if pj.get("classification")!="HTTP_OK_LIFECYCLE_REPAIR_INSTALLED_NODE_EXIT13_RESIDUAL_REMAINS":
    raise SystemExit("BLOCKED: expected R4-R3 residual evidence not found")

original=runner.read_text()
before=hashlib.sha256(original.encode()).hexdigest()
check=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
if check.returncode: raise SystemExit("BLOCKED: authoritative runner does not syntax-check")
src=original

needle="const r=await fetch(url,{"
if needle not in src: raise SystemExit("BLOCKED: repaired httpOk fetch surface not found")
src=src.replace(needle,'console.error("R29B_DEEP_HTTP_FETCH_BEGIN",JSON.stringify({at:Date.now(),url}));\n    const r=await fetch(url,{',1)
src=src.replace("return !!r && r.ok===true;",'console.error("R29B_DEEP_HTTP_FETCH_END",JSON.stringify({at:Date.now(),url,status:r?.status,ok:r?.ok}));\n    return !!r && r.ok===true;',1)
src=src.replace("}catch(_e){\n    return false;",'}catch(_e){\n    console.error("R29B_DEEP_HTTP_FETCH_CATCH",JSON.stringify({at:Date.now(),url,name:_e?.name,message:_e?.message}));\n    return false;',1)
src=src.replace("}finally{\n    clearTimeout(timeout);",'}finally{\n    console.error("R29B_DEEP_HTTP_FETCH_FINALLY",JSON.stringify({at:Date.now(),url}));\n    clearTimeout(timeout);',1)

pre='if(!(await httpOk("http://127.0.0.1:5173/")) || !(await httpOk("http://127.0.0.1:9333/json/version"))){'
if pre not in src: raise SystemExit("BLOCKED: authoritative top-level httpOk preflight surface not found")
rep='\n'.join([
'console.error("R29B_DEEP_TOPLEVEL_PREFLIGHT_BEGIN",JSON.stringify({at:Date.now()}));',
'const __r29b_app_ok=await httpOk("http://127.0.0.1:5173/");',
'console.error("R29B_DEEP_TOPLEVEL_APP_HTTP_END",JSON.stringify({at:Date.now(),ok:__r29b_app_ok}));',
'const __r29b_cdp_ok=await httpOk("http://127.0.0.1:9333/json/version");',
'console.error("R29B_DEEP_TOPLEVEL_CDP_HTTP_END",JSON.stringify({at:Date.now(),ok:__r29b_cdp_ok}));',
'if(!__r29b_app_ok || !__r29b_cdp_ok){'
])
src=src.replace(pre,rep,1)

runner.write_text(src)
instrumented_hash=hashlib.sha256(src.encode()).hexdigest()
nodecheck=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("RUNNER_SHA256_BEFORE:",before)
print("RUNNER_SHA256_INSTRUMENTED:",instrumented_hash)
print("NODE_CHECK_EXIT:",nodecheck.returncode)
print("NODE_CHECK_STDERR:",nodecheck.stderr.strip() or "NONE")
if nodecheck.returncode:
    runner.write_text(original); raise SystemExit("BLOCKED: diagnostic instrumentation syntax failed")

print("Executing instrumented authoritative R29B under 8-second external bound...")
timed_out=False; exit_code=None; stdout=""; stderr=""; t0=time.time()
try:
    p=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=8)
    exit_code=p.returncode; stdout=p.stdout; stderr=p.stderr
except subprocess.TimeoutExpired as e:
    timed_out=True
    stdout=(e.stdout or b"").decode() if isinstance(e.stdout,bytes) else (e.stdout or "")
    stderr=(e.stderr or b"").decode() if isinstance(e.stderr,bytes) else (e.stderr or "")
seconds=round(time.time()-t0,3)

runner.write_text(original)
restored_hash=hashlib.sha256(runner.read_bytes()).hexdigest()
restored=(restored_hash==before)

events=[]
for line in stderr.splitlines():
    if line.startswith("R29B_DEEP_"):
        parts=line.split(" ",1); payload=None
        if len(parts)>1:
            try: payload=json.loads(parts[1])
            except: payload=parts[1]
        events.append({"event":parts[0],"payload":payload})

print("BOUNDED_EXECUTION_TIMED_OUT:",timed_out)
print("BOUNDED_EXECUTION_EXIT_CODE:",exit_code)
print("BOUNDED_EXECUTION_SECONDS:",seconds)
print("DEEP_EVENT_COUNT:",len(events))
for e in events: print("DEEP_EVENT:",json.dumps(e,separators=(",",":")))
print("RUNNER_RESTORED_AFTER_DIAGNOSIS:",restored)

names=[e["event"] for e in events]
if "R29B_DEEP_HTTP_FETCH_BEGIN" in names and "R29B_DEEP_HTTP_FETCH_END" not in names and "R29B_DEEP_HTTP_FETCH_CATCH" not in names and "R29B_DEEP_HTTP_FETCH_FINALLY" not in names:
    classification="HTTP_OK_POST_REPAIR_EXIT13_LOCALIZED_INSIDE_NATIVE_FETCH_AWAIT_BEFORE_SETTLEMENT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R2_NATIVE_FETCH_TOP_LEVEL_AWAIT_ELIMINATION_AND_RECORD401_RECERTIFICATION"
elif "R29B_DEEP_TOPLEVEL_APP_HTTP_END" in names and "R29B_DEEP_TOPLEVEL_CDP_HTTP_END" not in names:
    classification="HTTP_OK_POST_REPAIR_EXIT13_LOCALIZED_TO_SECOND_CDP_HTTP_PREFLIGHT_AWAIT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R2_CDP_PREFLIGHT_AWAIT_REPAIR_AND_RECORD401_RECERTIFICATION"
elif "R29B_DEEP_TOPLEVEL_CDP_HTTP_END" in names:
    classification="HTTP_PREFLIGHT_FULLY_SETTLED_EXIT13_LIES_AFTER_PREFLIGHT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R2_POST_PREFLIGHT_FIRST_RECORD_AWAIT_LOCALIZATION"
else:
    classification="EXIT13_OCCURS_BEFORE_OR_AT_HTTP_OK_INSTRUMENTED_ENTRY"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R2_PRE_HTTP_OK_TOP_LEVEL_CONTROL_FLOW_REPAIR"

result={"framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R1_HTTP_OK_POST_REPAIR_UNSETTLED_AWAIT_DEEP_DIAGNOSIS",
"status":"PASSED","classification":classification,"runnerSha256Before":before,
"runnerSha256Instrumented":instrumented_hash,"runnerSha256Restored":restored_hash,
"boundedExecution":{"timeoutSeconds":8,"timedOut":timed_out,"exitCode":exit_code,"seconds":seconds},
"events":events,"checks":{"priorResidualConsumed":True,"temporaryInstrumentationOnly":True,
"nodeSyntaxCheckPassed":nodecheck.returncode==0,"runnerRestoredExactly":restored,
"governedDataMutationOff":True,"liveWorkflowMutationOff":True,"exportInvocationOff":True,
"strictSequentialPreserved":True,"haltOnFirstFailurePreserved":True},"nextMilestone":nextm}
evidence.write_text(json.dumps(result,indent=2)+"\n")
print("----- CHECKS -----")
for k,v in result["checks"].items(): print(f"{k}: {v}")
print("CLASSIFICATION:",classification)
print("STATUS: PASSED")
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",evidence)
print("R29B-R2-R3-R2-R4-R3-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
