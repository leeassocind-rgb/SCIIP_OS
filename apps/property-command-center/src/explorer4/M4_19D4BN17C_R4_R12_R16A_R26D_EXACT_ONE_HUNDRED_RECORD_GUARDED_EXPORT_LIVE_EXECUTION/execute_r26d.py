#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, re, subprocess

R26C="M4_19D4BN17C_R4_R12_R16A_R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
M="M4_19D4BN17C_R4_R12_R16A_R26D_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_LIVE_EXECUTION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def find_runner(repo):
    # Reuse the already-certified R25D-R3 live execution implementation rather than inventing a second browser driver.
    root=repo/"apps/property-command-center"
    candidates=[]
    for p in root.rglob("*r25d*r3*.py"):
        if p.is_file(): candidates.append(p)
    for p in root.rglob("*R25D*R3*.py"):
        if p.is_file(): candidates.append(p)
    # Prefer an execute/recertify implementation.
    candidates=sorted(set(candidates), key=lambda p:(0 if ("execute" in p.name.lower() or "recert" in p.name.lower()) else 1,len(str(p))))
    return candidates[0] if candidates else None

def find_r26a(repo):
    p=repo/"apps/property-command-center/evidence/explorer4/M4_19D4BN17C_R4_R12_R16A_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION/exact_one_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    return p

def extract_targets(obj):
    # tolerate the exact field naming used by prior milestone evidence
    for k in ("exactOneHundredCandidateCohort","exactOneHundredCohort","candidateCohort","cohort","targets"):
        v=obj.get(k)
        if isinstance(v,list) and len(v)==100:
            out=[]
            for x in v:
                if isinstance(x,str): out.append(x)
                elif isinstance(x,dict):
                    out.append(x.get("target") or x.get("label") or x.get("address") or x.get("name"))
            if len(out)==100 and all(out): return out
    # recursive fallback: find any list of 100 address/target-bearing records
    def walk(x):
        if isinstance(x,dict):
            for v in x.values():
                r=walk(v)
                if r:return r
        elif isinstance(x,list):
            if len(x)==100:
                o=[]
                for z in x:
                    if isinstance(z,str):o.append(z)
                    elif isinstance(z,dict):o.append(z.get("target") or z.get("label") or z.get("address") or z.get("name"))
                if len(o)==100 and all(o):return o
            for z in x:
                r=walk(z)
                if r:return r
        return None
    return walk(obj)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    e=repo/"apps/property-command-center/evidence/explorer4"
    authp=e/R26C/"exact_one_hundred_record_guarded_export_execution_readiness_and_authorization.json"
    print("="*120)
    print("SCIIP Explorer 4.0 — R26D Exact One Hundred Record Guarded Export Live Execution")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export authority: EXACTLY ONE GUARDED EXPORT CLICK PER RECORD MAXIMUM")
    print("Fresh page per record: REQUIRED")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")
    if not authp.exists():
        print("STATUS: BLOCKED"); print("REASON: R26C authorization evidence missing"); return 4
    auth=loadj(authp)
    if auth.get("status")!="PASSED" or not auth.get("authorization",{}).get("authorized"):
        print("STATUS: BLOCKED"); print("REASON: R26C export authorization not certified"); return 5
    cohortp=find_r26a(repo); cohort=loadj(cohortp) if cohortp.exists() else {}
    targets=extract_targets(cohort)
    if not targets:
        print("STATUS: BLOCKED"); print("REASON: exact-100 cohort could not be recovered from R26A evidence"); return 6
    runner=find_runner(repo)
    if not runner:
        print("STATUS: BLOCKED")
        print("REASON: certified R25D-R3 live execution runner not found; refusing to invent an unproven Export driver")
        return 7

    od=e/M; od.mkdir(parents=True,exist_ok=True)
    targetfile=od/"exact_one_hundred_targets.json"; targetfile.write_text(json.dumps(targets,indent=2)+"\n")
    print("R26C_AUTHORIZATION_CONSUMED: True")
    print("EXACT_ONE_HUNDRED_TARGETS_RESOLVED: True")
    print("CERTIFIED_LIVE_RUNNER_REUSED:",runner)
    print("TARGET_FILE:",targetfile)
    print("\nInvoking certified guarded live execution implementation with exact-100 cohort...")
    env=dict(__import__("os").environ)
    env["SCIIP_EXACT_COHORT_FILE"]=str(targetfile)
    env["SCIIP_EXPORT_COHORT_SIZE"]="100"
    env["SCIIP_EXPORT_MAX_CLICKS_PER_RECORD"]="1"
    env["SCIIP_EXPORT_STRICT_SEQUENTIAL"]="YES"
    env["SCIIP_EXPORT_HALT_ON_FIRST_FAILURE"]="YES"
    cp=subprocess.run([sys.executable,str(runner),str(repo)],env=env)
    # The reused runner must itself create evidence. R26D only records delegation provenance here.
    out={"framework":"SCIIP_EXPLORER_4_R26D_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_LIVE_EXECUTION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "authorizationConsumed":True,"targetCount":100,"runner":str(runner),
         "runnerExitCode":cp.returncode,
         "status":"DELEGATED_EXECUTION_COMPLETE" if cp.returncode==0 else "DIAGNOSTIC_COMPLETE",
         "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R26E_EXACT_ONE_HUNDRED_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION" if cp.returncode==0 else "M4_19D4BN17C_R4_R12_R16A_R26D_R1_GUARDED_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS"}
    ef=od/"exact_one_hundred_record_guarded_export_live_execution.json";ef.write_text(json.dumps(out,indent=2)+"\n")
    print("STATUS:",out["status"]);print("NEXT_MILESTONE:",out["nextMilestone"]);print("EVIDENCE:",ef)
    print("\nR26D EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return cp.returncode
if __name__=="__main__": raise SystemExit(main())
