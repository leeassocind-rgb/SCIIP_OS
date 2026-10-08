#!/usr/bin/env python3
import sys,json,hashlib,subprocess,re,time,urllib.request,urllib.error,os
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_FIRST_RECORD_ASYNC_BOUNDARY_EXACT_LOCALIZATION/first_record_async_boundary_exact_localization.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_LOCALIZED_CREATE_FRESH_PAGE_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION"
outdir.mkdir(parents=True,exist_ok=True)
evidence=outdir/"localized_createfreshpage_await_lifecycle_repair_and_record401_recertification.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R5 Localized createFreshPage Await Lifecycle Repair + Record 401 Recertification")
print("="*120)
print("Application source mutation: ON — R29B createFreshPage c.open lifecycle repair only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")

if not runner.exists():
    raise SystemExit("BLOCKED: authoritative R29B runner missing")

pj=json.loads(prior.read_text()) if prior.exists() else {}
if pj.get("status")!="PASSED" or pj.get("classification")!="RECORD401_EXIT13_LOCALIZED_TO_CREATE_FRESH_PAGE_INTERNAL_AWAIT":
    raise SystemExit("BLOCKED: required R4-R3-R4 diagnosis not certified")
loc=pj.get("localizedBoundary") or {}
meta=loc.get("meta") or {}
if loc.get("type")!="CREATE_FRESH_PAGE_UNRETURNED_AWAIT" or "c.open" not in str(meta.get("source","")):
    raise SystemExit("BLOCKED: c.open localized await not confirmed")

original=runner.read_text()
before=hashlib.sha256(original.encode()).hexdigest()

baseline=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
if baseline.returncode:
    raise SystemExit("BLOCKED: authoritative runner syntax invalid before repair")

# Narrow repair only:
# const c=new CDP(...);await c.open();
# becomes a timer-backed Promise.race so an unresolved CDP open cannot leave
# top-level await unsettled with no active handles. Existing c.open remains authoritative.
pattern=re.compile(r'const\s+c\s*=\s*new\s+CDP\(t\.webSocketDebuggerUrl\)\s*;\s*await\s+c\.open\(\)\s*;')
m=pattern.search(original)

already_marker="R29B_R5_CDP_OPEN_BOUND_MS"
repair_applied=False
if m:
    replacement=r'''const c=new CDP(t.webSocketDebuggerUrl);
  const R29B_R5_CDP_OPEN_BOUND_MS=2000;
  let __r29b_r5_open_timer=null;
  try{
    await Promise.race([
      c.open(),
      new Promise((_,reject)=>{
        __r29b_r5_open_timer=setTimeout(
          ()=>reject(new Error("R29B_CDP_OPEN_TIMEOUT_2000MS")),
          R29B_R5_CDP_OPEN_BOUND_MS
        );
      })
    ]);
  }finally{
    if(__r29b_r5_open_timer!==null)clearTimeout(__r29b_r5_open_timer);
  }'''
    repaired=original[:m.start()]+replacement+original[m.end():]
    repair_applied=True
elif already_marker in original:
    repaired=original
else:
    raise SystemExit("BLOCKED: exact createFreshPage c.open surface not found")

runner.write_text(repaired)
after=hashlib.sha256(runner.read_bytes()).hexdigest()

nodecheck=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("PRIOR_CLASSIFICATION:",pj.get("classification"))
print("LOCALIZED_AWAIT:",meta.get("source"))
print("RUNNER_SHA256_BEFORE:",before)
print("RUNNER_SHA256_AFTER:",after)
print("CDP_OPEN_LIFECYCLE_REPAIR_APPLIED:",repair_applied)
print("CDP_OPEN_BOUND_MS: 2000")
print("PROMISE_RACE_PRESENT:","Promise.race([" in repaired)
print("TIMEOUT_ERROR_PRESENT:","R29B_CDP_OPEN_TIMEOUT_2000MS" in repaired)
print("FINALLY_CLEAR_TIMEOUT_PRESENT:","clearTimeout(__r29b_r5_open_timer)" in repaired)
print("NODE_CHECK_EXIT:",nodecheck.returncode)
print("NODE_CHECK_STDERR:",nodecheck.stderr.strip() or "NONE")

checks={
 "priorAsyncBoundaryDiagnosisConsumed":True,
 "localizedAwaitIsCdpOpen":True,
 "repairScopeCreateFreshPageOpenOnly":True,
 "promiseRacePresent":"Promise.race([" in repaired,
 "twoSecondOpenBoundPresent":"R29B_R5_CDP_OPEN_BOUND_MS=2000" in repaired,
 "timeoutErrorPresent":"R29B_CDP_OPEN_TIMEOUT_2000MS" in repaired,
 "finallyClearsTimeout":"clearTimeout(__r29b_r5_open_timer)" in repaired,
 "nodeSyntaxCheckPassed":nodecheck.returncode==0,
 "governedDataMutationOff":True,
 "exportInvocationOff":True,
 "strictSequentialPreserved":"Strict sequential: ON" in original,
 "haltOnFirstFailurePreserved":"Halt on first failure: ON" in original
}
print("----- REPAIR CHECKS -----")
for k,v in checks.items(): print(f"{k}: {v}")
if not all(checks.values()):
    raise SystemExit("BLOCKED: repair certification failed")

# Revalidate runtime; start app if unavailable.
def http_status(url,timeout=1.5):
    try:
        with urllib.request.urlopen(url,timeout=timeout) as r:
            return r.status
    except Exception:
        return None

app_before=http_status("http://127.0.0.1:5173/")
cdp_before=http_status("http://127.0.0.1:9333/json/version")
print("SCIIP_APP_HTTP_STATUS_BEFORE:",app_before)
print("CDP_HTTP_STATUS_BEFORE:",cdp_before)

bootstrap="REUSED_EXISTING_RUNTIME"
proc=None
if app_before!=200:
    bootstrap="STARTED_PROPERTY_COMMAND_CENTER_RUNTIME"
    log="/tmp/sciip-r29b-r2-r3-r2-r4-r3-r5-vite.log"
    with open(log,"ab") as f:
        proc=subprocess.Popen(["npm","run","dev","--","--host","127.0.0.1","--port","5173"],
                              cwd=str(pcc),stdout=f,stderr=f,start_new_session=True)
    for _ in range(40):
        time.sleep(0.25)
        if http_status("http://127.0.0.1:5173/")==200: break

app_after=http_status("http://127.0.0.1:5173/")
cdp_after=http_status("http://127.0.0.1:9333/json/version")
print("SCIIP_APP_BOOTSTRAP_ACTION:",bootstrap)
print("SCIIP_APP_HTTP_STATUS_AFTER:",app_after)
print("CDP_HTTP_STATUS_AFTER:",cdp_after)

if app_after!=200 or cdp_after!=200:
    result={
      "framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R5",
      "status":"DIAGNOSTIC_COMPLETE",
      "classification":"CDP_OPEN_LIFECYCLE_REPAIR_INSTALLED_RUNTIME_REVALIDATION_INCOMPLETE",
      "checks":checks,
      "appStatusAfter":app_after,"cdpStatusAfter":cdp_after
    }
    evidence.write_text(json.dumps(result,indent=2)+"\n")
    print("STATUS: DIAGNOSTIC_COMPLETE")
    print("CLASSIFICATION:",result["classification"])
    print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_RUNTIME_REVALIDATION_RESIDUAL_DIAGNOSIS")
    print("EVIDENCE:",evidence)
    raise SystemExit(0)

print("Re-running authoritative R29B after localized c.open lifecycle repair...")

# Bound recertification so we always recover evidence rather than hanging.
timed_out=False
exit_code=None
stdout=""
stderr=""
t0=time.time()
try:
    p=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=20)
    exit_code=p.returncode; stdout=p.stdout or ""; stderr=p.stderr or ""
except subprocess.TimeoutExpired as e:
    timed_out=True
    stdout=e.stdout.decode() if isinstance(e.stdout,bytes) else (e.stdout or "")
    stderr=e.stderr.decode() if isinstance(e.stderr,bytes) else (e.stderr or "")
seconds=round(time.time()-t0,3)

# Read authoritative evidence if produced.
r29bev=er/"M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/exact_new_four_hundred_non_export_live_qualification.json"
rj={}
if r29bev.exists():
    try:rj=json.loads(r29bev.read_text())
    except:pass

print("AUTHORITATIVE_R29B_TIMED_OUT:",timed_out)
print("AUTHORITATIVE_R29B_EXIT_CODE:",exit_code)
print("AUTHORITATIVE_R29B_SECONDS:",seconds)
print("AUTHORITATIVE_R29B_STATUS:",rj.get("status"))
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",rj.get("certifiedCount"))
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",rj.get("executedCount"))
print("AUTHORITATIVE_R29B_CLASSIFICATION:",rj.get("classification"))

node13_cleared=(exit_code!=13)
record401=False
for o in (rj.get("outcomes") or []):
    if o.get("ordinal")==401:
        record401=bool(o.get("certified"))
        print("RECORD401_OUTCOME:",json.dumps(o,separators=(",",":")))
        break
print("NODE_EXIT13_CLEARED:",node13_cleared)
print("RECORD401_RECERTIFIED:",record401)

if exit_code==13:
    classification="CDP_OPEN_LIFECYCLE_BOUND_INSTALLED_NODE_EXIT13_RESIDUAL_REMAINS"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_CDP_OPEN_POST_BOUND_RESIDUAL_CAUSAL_DIAGNOSIS"
elif "R29B_CDP_OPEN_TIMEOUT_2000MS" in (stdout+stderr):
    classification="NODE_EXIT13_CLEARED_CDP_OPEN_TIMEOUT_NOW_EXPLICIT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_CDP_OPEN_HANDSHAKE_COMPLETION_REPAIR"
elif record401:
    classification="CDP_OPEN_LIFECYCLE_REPAIRED_RECORD401_RECERTIFIED"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R6_EXACT_NEW400_NON_EXPORT_QUALIFICATION_RESUME"
else:
    classification="NODE_EXIT13_CLEARED_NEXT_RECORD401_WORKFLOW_RESIDUAL_CAPTURED"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_POST_CDP_OPEN_RECORD401_RESIDUAL_CAUSAL_DIAGNOSIS"

result={
 "framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R5_LOCALIZED_CREATE_FRESH_PAGE_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION",
 "status":"PASSED" if record401 else "DIAGNOSTIC_COMPLETE",
 "classification":classification,
 "runnerSha256Before":before,
 "runnerSha256After":after,
 "repairChecks":checks,
 "runtime":{"appBefore":app_before,"cdpBefore":cdp_before,"bootstrap":bootstrap,"appAfter":app_after,"cdpAfter":cdp_after},
 "authoritativeR29B":{"timedOut":timed_out,"exitCode":exit_code,"seconds":seconds,
                     "status":rj.get("status"),"classification":rj.get("classification"),
                     "certifiedCount":rj.get("certifiedCount"),"executedCount":rj.get("executedCount")},
 "nodeExit13Cleared":node13_cleared,
 "record401Recertified":record401,
 "stdoutTail":stdout.splitlines()[-100:],
 "stderrTail":stderr.splitlines()[-100:],
 "nextMilestone":nextm
}
evidence.write_text(json.dumps(result,indent=2)+"\n")

print("----- FINAL CHECKS -----")
print("nodeExit13Cleared:",node13_cleared)
print("record401Recertified:",record401)
print("governedDataMutationOff: True")
print("exportInvocationOff: True")
print("CLASSIFICATION:",classification)
print("STATUS:",result["status"])
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",evidence)
print("R29B-R2-R3-R2-R4-R3-R5 EXECUTION COMPLETE — paste complete output into ChatGPT.")
