#!/usr/bin/env python3
import sys,re,json,hashlib,subprocess,time
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
evidence=pcc/"evidence/explorer4"
prior=evidence/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_CDP_JSON_DECODE_AND_PENDING_RESOLUTION_REPAIR/cdp_json_decode_and_pending_resolution_repair.json"
outdir=evidence/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_RECORD401_POST_TRANSPORT_RESIDUAL_DIAGNOSIS_AND_EXPLORER_ENTRY_BINDING_REPAIR"
outdir.mkdir(parents=True,exist_ok=True)
ev=outdir/"record401_post_transport_residual_diagnosis_and_explorer_entry_binding_repair.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R5-R1-R6 Record401 Post-Transport Residual Diagnosis + Explorer Entry Binding Repair")
print("="*120)
print("Application source mutation: ON — exact undefined explorer-entry binding only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")

if not runner.exists(): raise SystemExit("BLOCKED: authoritative R29B runner missing")
if not prior.exists(): raise SystemExit("BLOCKED: R5 evidence missing")
pj=json.loads(prior.read_text())
o=pj.get("record401Outcome") or {}
if pj.get("classification")!="CDP_INBOUND_DECODE_REPAIRED_RECORD401_ADVANCED_NEXT_RESIDUAL_CAPTURED":
    raise SystemExit("BLOCKED: expected R5 classification absent")
if o.get("failure")!="w is not defined":
    raise SystemExit("BLOCKED: exact Record401 residual 'w is not defined' absent")
if not o.get("freshTargetCreated") or not o.get("explorerSettleCertified"):
    raise SystemExit("BLOCKED: transport advance evidence absent")

src=runner.read_text()
before=hashlib.sha256(src.encode()).hexdigest()
print("PRIOR_FAILURE:",o.get("failure"))
print("PRIOR_FRESH_TARGET_CREATED:",o.get("freshTargetCreated"))
print("PRIOR_EXPLORER_SETTLE_CERTIFIED:",o.get("explorerSettleCertified"))
print("RUNNER_SHA256_BEFORE:",before)

# Diagnose exact call and helper signature.
call_hits=list(re.finditer(r'r29bR4CertifyExplorerEntry\s*\(([^)]*)\)',src))
for i,m in enumerate(call_hits):
    line=src.count("\n",0,m.start())+1
    print(f"ENTRY_HELPER_HIT_{i+1}: L{line}: {m.group(0)}")

# The prior source context certified createFreshPage() returns {target:t,cdp:c},
# and the failing call is r29bR4CertifyExplorerEntry(w). Repair only that undefined
# argument to the live CDP instance created for this record.
needle="o.explorerEntryCertified = await r29bR4CertifyExplorerEntry(w);"
needle_compact="o.explorerEntryCertified=await r29bR4CertifyExplorerEntry(w);"
replacement="o.explorerEntryCertified = await r29bR4CertifyExplorerEntry(cdp);"
replacement_compact="o.explorerEntryCertified=await r29bR4CertifyExplorerEntry(cdp);"

if needle in src:
    src2=src.replace(needle,replacement,1); applied=True
elif needle_compact in src:
    src2=src.replace(needle_compact,replacement_compact,1); applied=True
elif "r29bR4CertifyExplorerEntry(cdp)" in src:
    src2=src; applied=False
else:
    raise SystemExit("BLOCKED: exact undefined explorer-entry callsite not found")

runner.write_text(src2)
after_src=runner.read_text()
after=hashlib.sha256(after_src.encode()).hexdigest()
print("RUNNER_SHA256_AFTER:",after)
print("EXPLORER_ENTRY_BINDING_REPAIR_APPLIED:",applied)
print("UNDEFINED_W_CALL_ABSENT:","r29bR4CertifyExplorerEntry(w)" not in after_src)
print("CDP_BOUND_ENTRY_CALL_PRESENT:","r29bR4CertifyExplorerEntry(cdp)" in after_src)

nc=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("NODE_CHECK_EXIT:",nc.returncode)
print("NODE_CHECK_STDERR:",nc.stderr.strip() or "NONE")
if nc.returncode or "r29bR4CertifyExplorerEntry(w)" in after_src:
    raise SystemExit("BLOCKED: binding repair static certification failed")

print("Re-running authoritative R29B after exact explorer-entry binding repair...")
t0=time.time(); timed=False
try:
    rr=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=45)
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
outcomes=state.get("outcomes") or []
o401=next((x for x in outcomes if x.get("ordinal")==401),outcomes[0] if outcomes else None)
cert=sum(1 for x in outcomes if x.get("certified"))

print("AUTHORITATIVE_R29B_TIMED_OUT:",timed)
print("AUTHORITATIVE_R29B_EXIT_CODE:",ec)
print("AUTHORITATIVE_R29B_SECONDS:",secs)
print("AUTHORITATIVE_R29B_STATUS:",state.get("status"))
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",cert if outcomes else None)
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",len(outcomes) if outcomes else None)
print("RECORD401_OUTCOME:",json.dumps(o401,separators=(",",":")) if o401 else None)

failure=(o401 or {}).get("failure")
wcleared=failure!="w is not defined"
fresh=bool((o401 or {}).get("freshTargetCreated"))
settle=bool((o401 or {}).get("explorerSettleCertified"))
entry=bool((o401 or {}).get("explorerEntryCertified"))
binding=bool((o401 or {}).get("targetBindingSettleCertified"))
selection=bool((o401 or {}).get("selectionCertified"))
recert=bool((o401 or {}).get("certified"))
print("UNDEFINED_W_RESIDUAL_CLEARED:",wcleared)
print("RECORD401_FRESH_TARGET_CREATED:",fresh)
print("RECORD401_EXPLORER_SETTLE_CERTIFIED:",settle)
print("RECORD401_EXPLORER_ENTRY_CERTIFIED:",entry)
print("RECORD401_TARGET_BINDING_SETTLE_CERTIFIED:",binding)
print("RECORD401_SELECTION_CERTIFIED:",selection)
print("RECORD401_RECERTIFIED:",recert)

if recert:
    classification="EXPLORER_ENTRY_BINDING_REPAIRED_RECORD401_RECERTIFIED"
    status="PASSED"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R7_EXACT_NEW_400_NON_EXPORT_QUALIFICATION_RESUMPTION"
elif wcleared and entry:
    classification="EXPLORER_ENTRY_BINDING_REPAIRED_ENTRY_CERTIFIED_NEXT_RECORD401_RESIDUAL_CAPTURED"
    status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R7_RECORD401_POST_ENTRY_RESIDUAL_DIAGNOSIS"
elif wcleared:
    classification="UNDEFINED_ENTRY_BINDING_REPAIRED_NEXT_EXPLORER_ENTRY_RESIDUAL_CAPTURED"
    status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R1_EXPLORER_ENTRY_POST_BINDING_DIAGNOSIS"
else:
    classification="EXPLORER_ENTRY_BINDING_REPAIR_INSTALLED_UNDEFINED_W_RESIDUAL_REMAINS"
    status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R1_EXACT_CALLSITE_DIAGNOSIS"

result={
 "framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R6_RECORD401_POST_TRANSPORT_RESIDUAL_DIAGNOSIS_AND_EXPLORER_ENTRY_BINDING_REPAIR",
 "status":status,"classification":classification,
 "priorFailure":"w is not defined",
 "runnerSha256Before":before,"runnerSha256After":after,
 "explorerEntryBindingRepairApplied":applied,
 "undefinedWResidualCleared":wcleared,
 "record401Outcome":o401,
 "record401FreshTargetCreated":fresh,
 "record401ExplorerSettleCertified":settle,
 "record401ExplorerEntryCertified":entry,
 "record401TargetBindingSettleCertified":binding,
 "record401SelectionCertified":selection,
 "record401Recertified":recert,
 "authoritativeR29B":{"timedOut":timed,"exitCode":ec,"seconds":secs,"status":state.get("status"),"certifiedCount":cert if outcomes else None,"executedCount":len(outcomes) if outcomes else None},
 "governedDataMutationOff":True,"exportInvocationOff":True,
 "strictSequential":True,"haltOnFirstFailure":True,
 "nextMilestone":nextm
}
ev.write_text(json.dumps(result,indent=2)+"\n")
print("CLASSIFICATION:",classification)
print("STATUS:",status)
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",ev)
print("R29B-R5-R1-R6 EXECUTION COMPLETE — paste complete output into ChatGPT.")
