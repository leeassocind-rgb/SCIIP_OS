#!/usr/bin/env python3
import sys,re,json,hashlib,subprocess,time
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
outdir=pcc/"evidence/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R1_DUAL_EXPLORER_ENTRY_BINDING_CALLSITE_REPAIR_AND_RECORD401_RECERTIFICATION"
outdir.mkdir(parents=True,exist_ok=True)
ev=outdir/"dual_explorer_entry_binding_callsite_repair_and_record401_recertification.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R5-R1-R6-R1 Dual Explorer Entry Binding Callsite Repair + Record401 Recertification")
print("="*120)
print("Application source mutation: ON — remaining exact undefined explorer-entry binding callsite(s) only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")

src=runner.read_text()
before=hashlib.sha256(src.encode()).hexdigest()
undef=list(re.finditer(r'r29bR4CertifyExplorerEntry\s*\(\s*w\s*\)',src))
bound=list(re.finditer(r'r29bR4CertifyExplorerEntry\s*\(\s*cdp\s*\)',src))
print("RUNNER_SHA256_BEFORE:",before)
print("UNDEFINED_W_CALL_COUNT_BEFORE:",len(undef))
print("CDP_BOUND_CALL_COUNT_BEFORE:",len(bound))
for i,m in enumerate(undef,1):
    print(f"UNDEFINED_CALLSITE_{i}: L{src.count(chr(10),0,m.start())+1}: {m.group(0)}")
for i,m in enumerate(bound,1):
    print(f"BOUND_CALLSITE_{i}: L{src.count(chr(10),0,m.start())+1}: {m.group(0)}")

# R6 repaired one of two identical callsites and then deliberately blocked.
# Consume that partial state by repairing every remaining exact "(w)" invocation.
src2,n=re.subn(r'r29bR4CertifyExplorerEntry\s*\(\s*w\s*\)',"r29bR4CertifyExplorerEntry(cdp)",src)
if n<1:
    raise SystemExit("BLOCKED: no remaining exact undefined-w explorer-entry callsite found")
runner.write_text(src2)
after=hashlib.sha256(src2.encode()).hexdigest()
remaining=len(re.findall(r'r29bR4CertifyExplorerEntry\s*\(\s*w\s*\)',src2))
bound_after=len(re.findall(r'r29bR4CertifyExplorerEntry\s*\(\s*cdp\s*\)',src2))
print("REMAINING_CALLS_REPAIRED:",n)
print("RUNNER_SHA256_AFTER:",after)
print("UNDEFINED_W_CALL_COUNT_AFTER:",remaining)
print("CDP_BOUND_CALL_COUNT_AFTER:",bound_after)

nc=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("NODE_CHECK_EXIT:",nc.returncode)
print("NODE_CHECK_STDERR:",nc.stderr.strip() or "NONE")
if nc.returncode or remaining:
    raise SystemExit("BLOCKED: dual-callsite repair static certification failed")

print("Re-running authoritative R29B...")
t0=time.time(); timed=False
try:
    rr=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=60)
    ec=rr.returncode
except subprocess.TimeoutExpired:
    timed=True; ec=None
secs=round(time.time()-t0,3)

authdir=pcc/"evidence/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
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
entry=bool((o401 or {}).get("explorerEntryCertified"))
binding=bool((o401 or {}).get("targetBindingSettleCertified"))
selection=bool((o401 or {}).get("selectionCertified"))
recert=bool((o401 or {}).get("certified"))
print("UNDEFINED_W_RESIDUAL_CLEARED:",failure!="w is not defined")
print("RECORD401_EXPLORER_ENTRY_CERTIFIED:",entry)
print("RECORD401_TARGET_BINDING_SETTLE_CERTIFIED:",binding)
print("RECORD401_SELECTION_CERTIFIED:",selection)
print("RECORD401_RECERTIFIED:",recert)

if recert:
    cl="DUAL_EXPLORER_ENTRY_BINDING_REPAIRED_RECORD401_RECERTIFIED"; st="PASSED"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R7_EXACT_NEW_400_NON_EXPORT_QUALIFICATION_RESUMPTION"
elif failure!="w is not defined" and entry:
    cl="DUAL_EXPLORER_ENTRY_BINDING_REPAIRED_ENTRY_CERTIFIED_NEXT_RESIDUAL_CAPTURED"; st="DIAGNOSTIC_COMPLETE"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R7_RECORD401_POST_ENTRY_RESIDUAL_DIAGNOSIS"
elif failure!="w is not defined":
    cl="DUAL_EXPLORER_ENTRY_BINDING_REPAIRED_NEXT_ENTRY_RESIDUAL_CAPTURED"; st="DIAGNOSTIC_COMPLETE"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R2_EXPLORER_ENTRY_HELPER_RUNTIME_DIAGNOSIS"
else:
    cl="DUAL_CALLSITE_REPAIR_INSTALLED_UNDEFINED_W_RESIDUAL_REMAINS"; st="DIAGNOSTIC_COMPLETE"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_R2_UNDEFINED_W_ORIGIN_DIAGNOSIS"

res={"framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R6_R1_DUAL_EXPLORER_ENTRY_BINDING_CALLSITE_REPAIR_AND_RECORD401_RECERTIFICATION",
"status":st,"classification":cl,"remainingCallsRepaired":n,"undefinedWCallCountAfter":remaining,
"runnerSha256Before":before,"runnerSha256After":after,"record401Outcome":o401,
"record401ExplorerEntryCertified":entry,"record401TargetBindingSettleCertified":binding,
"record401SelectionCertified":selection,"record401Recertified":recert,
"authoritativeR29B":{"timedOut":timed,"exitCode":ec,"seconds":secs,"status":state.get("status"),
"certifiedCount":cert if outs else None,"executedCount":len(outs) if outs else None},
"governedDataMutationOff":True,"exportInvocationOff":True,"strictSequential":True,"haltOnFirstFailure":True,
"nextMilestone":nxt}
ev.write_text(json.dumps(res,indent=2)+"\n")
print("CLASSIFICATION:",cl); print("STATUS:",st); print("NEXT_MILESTONE:",nxt); print("EVIDENCE:",ev)
print("R29B-R5-R1-R6-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
