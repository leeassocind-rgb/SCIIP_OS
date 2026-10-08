#!/usr/bin/env python3
import sys,re,json,hashlib,subprocess,time
from pathlib import Path
repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
evidence=pcc/"evidence/explorer4"
prior=evidence/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R2_EXPLORER_ENTRY_HELPER_RUNTIME_DIAGNOSIS/explorer_entry_helper_runtime_diagnosis.json"
outdir=evidence/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R3_EXPLORER_ENTRY_EV_TO_CDP_EVALUATOR_REPAIR_AND_RECORD401_RECERTIFICATION"
outdir.mkdir(parents=True,exist_ok=True)
ev=outdir/"explorer_entry_ev_to_cdp_evaluator_repair_and_record401_recertification.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R5-R1-R6-R3 Explorer Entry EV-to-CDP Evaluator Repair + Record401 Recertification")
print("="*120)
print("Application source mutation: ON — explorer-entry helper legacy ev(...) calls only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")

if not runner.exists(): raise SystemExit("BLOCKED: authoritative R29B runner missing")
if not prior.exists(): raise SystemExit("BLOCKED: R6-R2 diagnosis evidence missing")
pj=json.loads(prior.read_text())
expected="EXPLORER_ENTRY_HELPER_RETains_UNDEFINED_LEGACY_EV_CALLS_WHILE_CALLSITES_NOW_BIND_CDP_EVALUATOR"
if pj.get("classification")!=expected:
    raise SystemExit("BLOCKED: expected R6-R2 classification absent")

src=runner.read_text()
before=hashlib.sha256(src.encode()).hexdigest()
print("RUNNER_SHA256_BEFORE:",before)

m=re.search(r'async\s+function\s+r29bR4CertifyExplorerEntry\s*\(\s*cdp\s*\)\s*\{',src)
if not m: raise SystemExit("BLOCKED: exact explorer-entry helper signature not found")
brace=src.find("{",m.start()); depth=0; q=None; esc=False; end=None
for i in range(brace,len(src)):
    ch=src[i]
    if q:
        if esc: esc=False
        elif ch=="\\": esc=True
        elif ch==q: q=None
    else:
        if ch in ("'",'"','`'): q=ch
        elif ch=="{": depth+=1
        elif ch=="}":
            depth-=1
            if depth==0: end=i+1; break
if end is None: raise SystemExit("BLOCKED: helper boundary unresolved")
helper=src[m.start():end]
legacy_count=len(re.findall(r'\bev\s*\(\s*w\s*,',helper))
print("LEGACY_EV_W_CALL_COUNT_BEFORE:",legacy_count)
if legacy_count!=3:
    raise SystemExit(f"BLOCKED: expected exactly 3 legacy ev(w,...) calls, found {legacy_count}")

helper2,n=re.subn(r'\bev\s*\(\s*w\s*,\s*', 'cdp.eval(', helper)
if n!=3: raise SystemExit(f"BLOCKED: exact helper repair count mismatch: {n}")
src2=src[:m.start()]+helper2+src[end:]
runner.write_text(src2)
after_src=runner.read_text()
after=hashlib.sha256(after_src.encode()).hexdigest()
print("LEGACY_EV_W_CALLS_REPAIRED:",n)
print("RUNNER_SHA256_AFTER:",after)
print("LEGACY_EV_W_CALL_COUNT_AFTER:",len(re.findall(r'\bev\s*\(\s*w\s*,',helper2)))
print("CDP_EVAL_CALL_COUNT_IN_HELPER:",len(re.findall(r'\bcdp\.eval\s*\(',helper2)))

nc=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("NODE_CHECK_EXIT:",nc.returncode)
print("NODE_CHECK_STDERR:",nc.stderr.strip() or "NONE")
if nc.returncode: raise SystemExit("BLOCKED: repaired runner syntax invalid")

print("Re-running authoritative R29B...")
t0=time.time(); timed=False
try:
    rr=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=60)
    ec=rr.returncode
except subprocess.TimeoutExpired:
    timed=True; ec=None
secs=round(time.time()-t0,3)

authdir=evidence/"M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
state={}
if authdir.exists():
    for p in sorted(authdir.glob("*.json"),key=lambda x:x.stat().st_mtime,reverse=True):
        try:
            j=json.loads(p.read_text())
            if isinstance(j,dict) and ("outcomes" in j or "status" in j):
                state=j; break
        except: pass
outs=state.get("outcomes") or []
o401=next((x for x in outs if x.get("ordinal")==401),outs[0] if outs else None)
cert=sum(1 for x in outs if x.get("certified"))

print("AUTHORITATIVE_R29B_TIMED_OUT:",timed)
print("AUTHORITATIVE_R29B_EXIT_CODE:",ec)
print("AUTHORITATIVE_R29B_SECONDS:",secs)
print("AUTHORITATIVE_R29B_STATUS:",state.get("status"))
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",cert if outs else None)
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",len(outs) if outs else None)
print("RECORD401_OUTCOME:",json.dumps(o401,separators=(",",":")) if o401 else None)

failure=(o401 or {}).get("failure")
ev_cleared=(failure!="ev is not defined")
entry=bool((o401 or {}).get("explorerEntryCertified"))
binding=bool((o401 or {}).get("targetBindingSettleCertified"))
selection=bool((o401 or {}).get("selectionCertified"))
selected_settle=bool((o401 or {}).get("selectedPropertySettleCertified"))
assignments=bool((o401 or {}).get("assignmentsEntryCertified"))
generate=bool((o401 or {}).get("generateControlCertified"))
recert=bool((o401 or {}).get("certified"))
print("EV_REFERENCE_ERROR_CLEARED:",ev_cleared)
print("RECORD401_EXPLORER_ENTRY_CERTIFIED:",entry)
print("RECORD401_TARGET_BINDING_SETTLE_CERTIFIED:",binding)
print("RECORD401_SELECTION_CERTIFIED:",selection)
print("RECORD401_SELECTED_PROPERTY_SETTLE_CERTIFIED:",selected_settle)
print("RECORD401_ASSIGNMENTS_ENTRY_CERTIFIED:",assignments)
print("RECORD401_GENERATE_CONTROL_CERTIFIED:",generate)
print("RECORD401_RECERTIFIED:",recert)

if recert:
    cl="EXPLORER_ENTRY_EV_TO_CDP_EVALUATOR_REPAIRED_RECORD401_RECERTIFIED"; st="PASSED"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R7_EXACT_NEW_400_NON_EXPORT_QUALIFICATION_RESUMPTION"
elif ev_cleared and entry:
    cl="EXPLORER_ENTRY_EV_TO_CDP_EVALUATOR_REPAIRED_ENTRY_CERTIFIED_NEXT_RECORD401_RESIDUAL_CAPTURED"; st="DIAGNOSTIC_COMPLETE"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R7_RECORD401_POST_ENTRY_RESIDUAL_DIAGNOSIS"
elif ev_cleared:
    cl="EXPLORER_ENTRY_EV_REFERENCE_CLEARED_NEXT_ENTRY_RESIDUAL_CAPTURED"; st="DIAGNOSTIC_COMPLETE"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R4_EXPLORER_ENTRY_POST_EVALUATOR_REPAIR_DIAGNOSIS"
else:
    cl="EXPLORER_ENTRY_EVALUATOR_REPAIR_INSTALLED_EV_REFERENCE_ERROR_REMAINS"; st="DIAGNOSTIC_COMPLETE"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R4_EV_REFERENCE_ORIGIN_DEEP_DIAGNOSIS"

res={"framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R6_R3_EXPLORER_ENTRY_EV_TO_CDP_EVALUATOR_REPAIR_AND_RECORD401_RECERTIFICATION",
"status":st,"classification":cl,"runnerSha256Before":before,"runnerSha256After":after,
"legacyEvCallsRepaired":n,"evReferenceErrorCleared":ev_cleared,"record401Outcome":o401,
"record401ExplorerEntryCertified":entry,"record401TargetBindingSettleCertified":binding,
"record401SelectionCertified":selection,"record401SelectedPropertySettleCertified":selected_settle,
"record401AssignmentsEntryCertified":assignments,"record401GenerateControlCertified":generate,
"record401Recertified":recert,
"authoritativeR29B":{"timedOut":timed,"exitCode":ec,"seconds":secs,"status":state.get("status"),
"certifiedCount":cert if outs else None,"executedCount":len(outs) if outs else None},
"governedDataMutationOff":True,"exportInvocationOff":True,"strictSequential":True,"haltOnFirstFailure":True,
"nextMilestone":nxt}
ev.write_text(json.dumps(res,indent=2)+"\n")
print("CLASSIFICATION:",cl); print("STATUS:",st); print("NEXT_MILESTONE:",nxt); print("EVIDENCE:",ev)
print("R29B-R5-R1-R6-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
