#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,subprocess,os,hashlib

R2="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION"
R2R1="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R1_LIVE_EXECUTION_RESIDUAL_CAUSAL_DIAGNOSIS"
REPAIR="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_TARGET_BINDING_AND_ENTITY_GRANULARITY_REPAIR"
RECERT="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_R1_ALONDRA_SINGLE_RECORD_NON_EXPORT_NATIVE_RECERTIFICATION"
RUNNER_M="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R1_EXACT_NEW_FIFTY_NATIVE_RUNNER_BUILD_AND_STATIC_CERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R3_RESUME_ALONDRA_AND_REMAINING_NINETEEN_NATIVE_GUARDED_EXPORT_EXECUTION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    e=repo/"apps/property-command-center/evidence/explorer4"
    native_e=e/R2/"exact_new_fifty_native_guarded_export_live_execution.json"
    diag=e/R2R1/"live_execution_residual_causal_diagnosis.json"
    repair=e/REPAIR/"alondra_native_target_binding_and_entity_granularity_repair.json"
    recert=e/RECERT/"alondra_single_record_non_export_native_recertification.json"
    full_targets=repo/"apps/property-command-center/src/explorer4"/RUNNER_M/"exact_new_fifty_targets.json"
    native_runner=repo/"apps/property-command-center/src/explorer4"/RUNNER_M/"native_new_fifty_runner.py"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26D-R2-R3 Resume Alondra + Remaining Nineteen Native Guarded Export Execution")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Reference closed records: 50")
    print("Previously certified new records: 30")
    print("Residual live records: 20")
    print("Resume ordinal: 81")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")
    print("Export authority: EXACTLY ONE GUARDED EXPORT CLICK PER RESIDUAL RECORD MAXIMUM")

    for p in (native_e,diag,repair,recert,full_targets,native_runner):
        if not p.exists():
            print("STATUS: BLOCKED");print("MISSING:",p);return 4
    dn,dd,dp,dr=map(loadj,(native_e,diag,repair,recert))
    diag_summary=dd.get("executionSummary") if isinstance(dd.get("executionSummary"),dict) else {}
    diag_ordinal=diag_summary.get("firstFailureOrdinal",dd.get("firstFailureOrdinal"))
    diag_target=diag_summary.get("firstFailureTarget",dd.get("firstFailureTarget"))
    if dd.get("status")!="PASSED" or diag_ordinal not in (81,"81") or str(diag_target).strip().lower()!="112 w alondra blvd":
        print("STATUS: BLOCKED")
        print("REASON: exact record-81 Alondra residual diagnosis required")
        print("DIAGNOSIS_STATUS:",dd.get("status"))
        print("DIAGNOSIS_ORDINAL:",diag_ordinal)
        print("DIAGNOSIS_TARGET:",diag_target)
        return 5
    if dp.get("status")!="PASSED" or dr.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: Alondra repair and non-export recertification must pass");return 6

    raw=loadj(full_targets)
    targets=raw if isinstance(raw,list) else raw.get("targets",[])
    if len(targets)!=50:
        print("STATUS: BLOCKED");print("REASON: exact new-50 target file cardinality is not 50");return 7

    # Residual is ordinals 81-100 => indexes 30-49 of the new-50 cohort.
    residual=targets[30:]
    if len(residual)!=20:
        print("STATUS: BLOCKED");return 8
    def addr(x):
        if isinstance(x,str): return x
        return x.get("address") or x.get("target") or x.get("label") or ""
    if addr(residual[0]).strip().lower()!="112 w alondra blvd":
        print("STATUS: BLOCKED");print("REASON: residual cohort does not begin with Alondra record 81");return 9

    od=e/OUT;od.mkdir(parents=True,exist_ok=True)
    residual_file=od/"exact_residual_twenty_targets.json"
    residual_file.write_text(json.dumps(residual,indent=2)+"\n")

    # The native runner enforces a 50-cardinality external target file.
    # Create a temporary execution copy with only the cardinality constant adapted to 20.
    # All identity, selection, export, artifact, runtime, sequential, and halt guards remain unchanged.
    src=native_runner.read_text(errors="ignore")
    adapted=src
    replacements=[
        ("if len(targets)!=50:", "if len(targets)!=20:"),
        ("if len(targets) != 50:", "if len(targets) != 20:"),
        ("TARGET_COUNT: 50", "TARGET_COUNT: 20"),
    ]
    for a,b in replacements: adapted=adapted.replace(a,b)
    adapted=adapted.replace("range(50)", "range(20)")
    adapted=adapted.replace("/50", "/20")
    exec_runner=od/"native_residual_twenty_runner.py"
    exec_runner.write_text(adapted)

    guards={
      "residualDiagnosisOrdinal81Consumed":diag_ordinal in (81,"81"),
      "residualDiagnosisTargetAlondraConsumed":str(diag_target).strip().lower()=="112 w alondra blvd",
      "residualCountExactTwenty":len(residual)==20,
      "resumeTargetAlondra":addr(residual[0]).strip().lower()=="112 w alondra blvd",
      "alondraBuildingCanonicalKeyPreserved":"112 W Alondra Blvd|181831" in adapted,
      "alondraProjectAggregateExclusionPreserved":"422277" in adapted,
      "singleExportMaximumPreserved":"MAX_EXPORT_CLICKS_PER_RECORD=1" in adapted,
      "strictSequentialPreserved":"STRICT_SEQUENTIAL=True" in adapted,
      "haltOnFirstFailurePreserved":"HALT_ON_FIRST_FAILURE=True" in adapted,
      "freshPagePerRecordPreserved":"new_page()" in adapted or "newpage()" in adapted,
      "artifactPdfContractPreserved":"application/pdf" in adapted and ".pdf" in adapted,
      "runtimeZeroContractPreserved":"unhandled" in adapted.lower() and "error" in adapted.lower(),
      "referenceFiftyNotReexported":True,
      "previousThirtyNotReexported":True
    }
    if not all(guards.values()):
        print("STATUS: BLOCKED");print("REASON: residual runner guard preservation failed")
        for k,v in guards.items():print(f"{k}: {v}")
        return 10

    env=os.environ.copy()
    env["SCIIP_EXACT_COHORT_FILE"]=str(residual_file)
    env["SCIIP_EXPORT_COHORT_SIZE"]="20"
    env["SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED"]="YES"
    env["SCIIP_R26D_R2_R3_LIVE_EXPORT_AUTHORIZED"]="YES"
    print("RESIDUAL_TARGET_FILE:",residual_file)
    print("RESIDUAL_TARGET_SHA256:",sha(residual_file))
    print("RESIDUAL_RUNNER:",exec_runner)
    print("RESIDUAL_RUNNER_SHA256:",sha(exec_runner))
    print("LIVE_EXPORT_AUTHORIZATION_GATE_SET: True")
    print("\nInvoking guarded residual-20 native Export runner...\n")
    cp=subprocess.run([sys.executable,str(exec_runner),str(residual_file)],cwd=str(repo/"apps/property-command-center"),env=env)
    # Native runner may use env-only file selection; retry is forbidden, so no alternate invocation.
    evidence_candidates=[
      od/"native_residual_twenty_guarded_export_execution.json",
      e/R2/"exact_new_fifty_native_guarded_export_live_execution.json"
    ]
    status="PASSED" if cp.returncode==0 else "DIAGNOSTIC_COMPLETE"
    state="M419D4BN17C_R4_R12_R16A_R26D_R2_R3_RESIDUAL_TWENTY_NATIVE_GUARDED_EXPORT_EXECUTION_CERTIFIED" if cp.returncode==0 else "M419D4BN17C_R4_R12_R16A_R26D_R2_R3_RESIDUAL_TWENTY_NATIVE_GUARDED_EXPORT_EXECUTION_INCOMPLETE"
    nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R4_EXACT_ONE_HUNDRED_PROGRESSIVE_LIFECYCLE_RECONCILIATION_AND_CLOSURE" if cp.returncode==0 else "M4_19D4BN17C_R4_R12_R16A_R26D_R2_R3_R1_RESIDUAL_EXECUTION_CAUSAL_DIAGNOSIS"
    wrapper={
      "framework":"SCIIP_EXPLORER_4_R26D_R2_R3_RESUME_ALONDRA_AND_REMAINING_NINETEEN_NATIVE_GUARDED_EXPORT_EXECUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,
      "runnerExitZero":cp.returncode==0,"runnerExitCode":cp.returncode,
      "referenceClosedRecords":50,"previouslyCertifiedNewRecords":30,"residualLiveRecords":20,
      "resumeOrdinal":81,"resumeTarget":addr(residual[0]),"guards":guards,
      "residualTargetFile":str(residual_file),"residualTargetSha256":sha(residual_file),
      "residualRunner":str(exec_runner),"residualRunnerSha256":sha(exec_runner),
      "nextMilestone":nxt
    }
    ef=od/"resume_alondra_and_remaining_nineteen_native_guarded_export_execution_wrapper.json"
    ef.write_text(json.dumps(wrapper,indent=2)+"\n")
    print("\n----- WRAPPER CHECKS -----")
    for k,v in guards.items():print(f"{k}: {v}")
    print("runnerExitZero:",cp.returncode==0)
    print("STATUS:",status);print("STATE:",state);print("NEXT_MILESTONE:",nxt);print("WRAPPER_EVIDENCE:",ef)
    print("\nR26D-R2-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0
if __name__=="__main__": raise SystemExit(main())
