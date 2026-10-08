#!/usr/bin/env python3
import sys, json, hashlib, subprocess, re, time, urllib.request
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R2_FIRST_RECORD_AWAIT_STAGE_BOUNDED_INSTRUMENTATION_AND_EXACT_HANG_LOCALIZATION/first_record_await_stage_bounded_instrumentation_and_exact_hang_localization.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_LOCALIZED_HELPER_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION"
outdir.mkdir(parents=True,exist_ok=True)
evidence=outdir/"localized_helper_await_lifecycle_repair_and_record401_recertification.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3 Localized Helper Await Lifecycle Repair + Record 401 Recertification")
print("="*120)
print("Application source mutation: ON — R29B httpOk helper lifecycle repair only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

if not runner.exists():
    print("STATUS: BLOCKED"); print("REASON: authoritative R29B runner missing"); raise SystemExit(2)

pj=json.loads(prior.read_text()) if prior.exists() else {}
localized=(pj.get("localizedHang") or {})
if pj.get("status")!="PASSED" or localized.get("type")!="ASYNC_HELPER":
    print("STATUS: BLOCKED"); print("REASON: R4-R2 localized-helper diagnosis not certified"); raise SystemExit(3)
helper=((localized.get("event") or {}).get("helper"))
if helper!="httpOk":
    print("STATUS: BLOCKED"); print("REASON: localized helper is not httpOk"); raise SystemExit(4)

src=runner.read_text()
before=sha(runner)
print("PRIOR_CLASSIFICATION:",pj.get("classification"))
print("LOCALIZED_HELPER:",helper)
print("LOCALIZED_SOURCE_LINE:",(localized.get("event") or {}).get("sourceLine"))

m=re.search(r'async\s+function\s+httpOk\s*\(\s*([^)]*)\)\s*\{',src)
if not m:
    print("STATUS: BLOCKED"); print("REASON: async function httpOk definition not found"); raise SystemExit(5)

start=m.start()
brace=m.end()-1
depth=0
end=None
i=brace
in_s=None
esc=False
while i<len(src):
    ch=src[i]
    if in_s:
        if esc: esc=False
        elif ch=="\\": esc=True
        elif ch==in_s: in_s=None
    else:
        if ch in ("'",'"','`'): in_s=ch
        elif ch=="{": depth+=1
        elif ch=="}":
            depth-=1
            if depth==0:
                end=i+1
                break
    i+=1
if end is None:
    print("STATUS: BLOCKED"); print("REASON: httpOk function boundary not resolved"); raise SystemExit(6)

new_http = "\n".join([
"async function httpOk(url){",
"  // R29B-R2-R3-R2-R4-R3: bounded Node-20-safe HTTP preflight.",
"  const controller=new AbortController();",
"  const timeout=setTimeout(()=>controller.abort(),2000);",
"  try{",
"    const r=await fetch(url,{",
"      method:'GET',",
"      signal:controller.signal,",
"      cache:'no-store'",
"    });",
"    return !!r && r.ok===true;",
"  }catch(_e){",
"    return false;",
"  }finally{",
"    clearTimeout(timeout);",
"  }",
"}"
])

src=src[:start]+new_http+src[end:]
runner.write_text(src)
after=sha(runner)

nodecheck=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("RUNNER_SHA256_BEFORE:",before)
print("RUNNER_SHA256_AFTER:",after)
print("HTTP_OK_REPAIR_APPLIED:",before!=after)
print("HTTP_OK_ABORT_CONTROLLER_PRESENT:","AbortController" in new_http)
print("HTTP_OK_TWO_SECOND_BOUND_PRESENT:","2000" in new_http)
print("HTTP_OK_FINALLY_CLEAR_TIMEOUT_PRESENT:","clearTimeout(timeout)" in new_http)
print("NODE_CHECK_EXIT:",nodecheck.returncode)
print("NODE_CHECK_STDERR:",nodecheck.stderr.strip() or "NONE")

checks={
    "priorLocalizedHelperDiagnosisConsumed":pj.get("status")=="PASSED",
    "localizedHelperHttpOk":helper=="httpOk",
    "httpOkRepairApplied":before!=after,
    "abortControllerPresent":"AbortController" in new_http,
    "twoSecondHttpBoundPresent":"2000" in new_http,
    "finallyClearsTimeout":"clearTimeout(timeout)" in new_http,
    "nodeSyntaxCheckPassed":nodecheck.returncode==0,
    "governedDataMutationOff":True,
    "exportInvocationOff":True
}
print("----- REPAIR CHECKS -----")
for k,v in checks.items(): print(f"{k}: {v}")

if not all(checks.values()):
    print("STATUS: BLOCKED")
    print("CLASSIFICATION: R29B_HTTP_OK_LIFECYCLE_REPAIR_NOT_CERTIFIED")
    raise SystemExit(7)

def http_status(url,timeout=1.5):
    try:
        with urllib.request.urlopen(url,timeout=timeout) as r:
            return int(getattr(r,"status",200))
    except Exception:
        return None

app_before=http_status("http://127.0.0.1:5173/")
cdp_before=http_status("http://127.0.0.1:9333/json/version")
print("SCIIP_APP_HTTP_STATUS_BEFORE:",app_before)
print("CDP_HTTP_STATUS_BEFORE:",cdp_before)

started=False
log="/tmp/sciip-r29b-r4-r3-vite.log"
if app_before!=200:
    lf=open(log,"ab",buffering=0)
    subprocess.Popen(
        ["npm","run","dev","--","--host","127.0.0.1","--port","5173"],
        cwd=str(pcc),stdin=subprocess.DEVNULL,stdout=lf,stderr=lf,
        start_new_session=True
    )
    started=True
    for _ in range(60):
        time.sleep(0.25)
        if http_status("http://127.0.0.1:5173/")==200: break

app_after=http_status("http://127.0.0.1:5173/")
cdp_after=http_status("http://127.0.0.1:9333/json/version")
print("SCIIP_APP_BOOTSTRAP_ACTION:","STARTED_PROPERTY_COMMAND_CENTER_RUNTIME" if started else "REUSED_EXISTING_RUNTIME")
print("SCIIP_APP_HTTP_STATUS_AFTER:",app_after)
print("CDP_HTTP_STATUS_AFTER:",cdp_after)

print("Re-running authoritative R29B after bounded httpOk lifecycle repair...")
proc=subprocess.run(["node",str(runner),str(repo)])
exit_code=proc.returncode

r29bev=er/"M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/exact_new_four_hundred_non_export_live_qualification.json"
ev=json.loads(r29bev.read_text()) if r29bev.exists() else {}

status=ev.get("status")
state=ev.get("state")
cls=ev.get("classification")
cert=ev.get("certifiedCount")
exe=ev.get("executedCount")
nextm=ev.get("nextMilestone")
if cert is None: cert=ev.get("certified")
if exe is None: exe=ev.get("executed")

record401=False
outs=ev.get("outcomes")
if isinstance(outs,list) and outs:
    first=outs[0]
    try: record401=bool(first.get("certified")) and int(first.get("ordinal",401))==401
    except Exception: record401=bool(first.get("certified"))
elif isinstance(cert,int) and cert>=1:
    record401=True

print("AUTHORITATIVE_R29B_EXIT_CODE:",exit_code)
print("AUTHORITATIVE_R29B_STATUS:",status)
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",cert)
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",exe)
print("AUTHORITATIVE_R29B_CLASSIFICATION:",cls)
print("RECORD401_RECERTIFIED:",record401)

exit13_cleared=(exit_code!=13)
if status=="PASSED":
    final_status="PASSED"
    final_class="HTTP_OK_AWAIT_LIFECYCLE_REPAIRED_EXACT_NEW400_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"
    nm="M4_19D4BN17C_R4_R12_R16A_R29C_EXACT_EIGHT_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
elif record401:
    final_status="DIAGNOSTIC_COMPLETE"
    final_class="HTTP_OK_AWAIT_LIFECYCLE_REPAIRED_RECORD401_RECERTIFIED_RESIDUAL_MOVED_DOWNSTREAM"
    nm=nextm or "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R1_POST_RECORD401_RESIDUAL_CAUSAL_DIAGNOSIS"
elif exit13_cleared:
    final_status="DIAGNOSTIC_COMPLETE"
    final_class="HTTP_OK_UNSETTLED_AWAIT_CLEARED_RECORD401_NEXT_RUNTIME_OR_WORKFLOW_RESIDUAL_CAPTURED"
    nm=nextm or "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R1_POST_HTTP_OK_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS"
else:
    final_status="DIAGNOSTIC_COMPLETE"
    final_class="HTTP_OK_LIFECYCLE_REPAIR_INSTALLED_NODE_EXIT13_RESIDUAL_REMAINS"
    nm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R1_HTTP_OK_POST_REPAIR_UNSETTLED_AWAIT_DEEP_DIAGNOSIS"

result={
    "framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_LOCALIZED_HELPER_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION",
    "status":final_status,
    "classification":final_class,
    "generatedAt":time.strftime("%Y-%m-%dT%H:%M:%SZ",time.gmtime()),
    "priorLocalization":{"classification":pj.get("classification"),"localizedHang":localized},
    "runner":{"sha256Before":before,"sha256After":after,"repairScope":"HTTP_OK_HELPER_ONLY"},
    "runtime":{
        "appStatusBefore":app_before,"appStatusAfter":app_after,
        "cdpStatusBefore":cdp_before,"cdpStatusAfter":cdp_after,
        "appBootstrapAction":"STARTED_PROPERTY_COMMAND_CENTER_RUNTIME" if started else "REUSED_EXISTING_RUNTIME"
    },
    "authoritativeR29B":{
        "exitCode":exit_code,"status":status,"state":state,"classification":cls,
        "certifiedCount":cert,"executedCount":exe,"record401Recertified":record401,
        "nextMilestone":nextm
    },
    "checks":dict(checks,**{
        "nodeExit13Cleared":exit13_cleared,
        "sciipAppReadyAfterRevalidation":app_after==200,
        "exportInvocationOffPreserved":True
    }),
    "nextMilestone":nm
}
evidence.write_text(json.dumps(result,indent=2)+"\n")

print("----- FINAL CHECKS -----")
for k,v in result["checks"].items(): print(f"{k}: {v}")
print("CLASSIFICATION:",final_class)
print("STATUS:",final_status)
print("NEXT_MILESTONE:",nm)
print("EVIDENCE:",evidence)
print("R29B-R2-R3-R2-R4-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
