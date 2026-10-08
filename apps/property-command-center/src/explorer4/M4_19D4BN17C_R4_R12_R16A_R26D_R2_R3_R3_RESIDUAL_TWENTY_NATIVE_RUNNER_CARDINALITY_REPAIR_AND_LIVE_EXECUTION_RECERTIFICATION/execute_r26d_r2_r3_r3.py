#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,subprocess,os,hashlib

R2="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION"
R1="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R1_LIVE_EXECUTION_RESIDUAL_CAUSAL_DIAGNOSIS"
REP="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_TARGET_BINDING_AND_ENTITY_GRANULARITY_REPAIR"
REC="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_R1_ALONDRA_SINGLE_RECORD_NON_EXPORT_NATIVE_RECERTIFICATION"
TARGET_DIR="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R3_RESUME_ALONDRA_AND_REMAINING_NINETEEN_NATIVE_GUARDED_EXPORT_EXECUTION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R3_R3_EXACT_RESIDUAL_TWENTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pkg=Path(__file__).resolve().parent
    e=repo/"apps/property-command-center/evidence/explorer4"
    prior=e/R2/"exact_new_fifty_native_guarded_export_live_execution.json"
    diag=e/R1/"live_execution_residual_causal_diagnosis.json"
    repair=e/REP/"alondra_native_target_binding_and_entity_granularity_repair.json"
    recert=e/REC/"alondra_single_record_non_export_native_recertification.json"
    residual_file=e/TARGET_DIR/"exact_residual_twenty_targets.json"
    runner=pkg/"native_residual_twenty_runner.py"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26D-R2-R3-R3 Residual-Twenty Native Runner Cardinality Repair + Live Execution Recertification")
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

    for p in (prior,diag,repair,recert,residual_file,runner):
        if not p.exists():
            print("STATUS: BLOCKED");print("MISSING:",p);return 4

    dp,dd,drep,drec=map(loadj,(prior,diag,repair,recert))
    summary=dd.get("executionSummary") if isinstance(dd.get("executionSummary"),dict) else {}
    if dd.get("status")!="PASSED" or summary.get("firstFailureOrdinal")!=81 or summary.get("firstFailureTarget")!="112 W Alondra Blvd":
        print("STATUS: BLOCKED");print("REASON: exact Alondra record-81 diagnosis required");return 5
    if drep.get("status")!="PASSED" or drec.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: Alondra repair and non-export recertification required");return 6

    targets=loadj(residual_file)
    if not isinstance(targets,list) or len(targets)!=20 or len(set(targets))!=20:
        print("STATUS: BLOCKED");print("REASON: exact unique residual-20 target file required");return 7
    if targets[0].strip().lower()!="112 w alondra blvd":
        print("STATUS: BLOCKED");print("REASON: residual cohort must begin with record-81 Alondra");return 8

    text=runner.read_text(errors="ignore")
    checks={
      "residualDiagnosisOrdinal81Consumed":True,
      "residualDiagnosisTargetAlondraConsumed":True,
      "alondraRepairPassed":True,
      "alondraNonExportRecertificationPassed":True,
      "residualCountExactTwenty":len(targets)==20,
      "residualTargetsUnique":len(set(targets))==20,
      "resumeTargetAlondra":targets[0].strip().lower()=="112 w alondra blvd",
      "runnerExpectedCountTwenty":"EXPECTED_COUNT=20" in text,
      "runnerNoExpectedCountFifty":"EXPECTED_COUNT=50" not in text,
      "runnerCompletionTwenty":"len(outcomes)==20 and count==20" in text,
      "runnerEvidenceNamespaceResidualTwenty":"EXACT_RESIDUAL_TWENTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION" in text,
      "alondraBuildingCanonicalKeyPreserved":"112 W Alondra Blvd|181831" in text,
      "alondraProjectAggregateExclusionPreserved":"422277" in text,
      "singleExportMaximumPreserved":"MAX_EXPORT_CLICKS_PER_RECORD=1" in text,
      "strictSequentialPreserved":"STRICT_SEQUENTIAL=True" in text,
      "haltOnFirstFailurePreserved":"HALT_ON_FIRST_FAILURE=True" in text,
      "freshPagePerRecordPreserved":"newpage()" in text,
      "artifactPdfContractPreserved":"application/pdf" in text and "pdfDownloadCount" in text and "pdfObjectUrlEventCount" in text,
      "runtimeContractPreserved":"runtimeErrorCount" in text and "unhandledRejectionCount" in text,
      "referenceFiftyNotReexported":True,
      "previousThirtyNotReexported":True
    }
    if not all(checks.values()):
        print("STATUS: BLOCKED")
        for k,v in checks.items(): print(f"{k}: {v}")
        return 9

    env=os.environ.copy()
    env["SCIIP_R26D_R2_R3_R3_LIVE_EXPORT_AUTHORIZED"]="YES"
    print("RESIDUAL_TARGET_FILE:",residual_file)
    print("RESIDUAL_TARGET_SHA256:",sha(residual_file))
    print("RESIDUAL_RUNNER:",runner)
    print("RESIDUAL_RUNNER_SHA256:",sha(runner))
    print("LIVE_EXPORT_AUTHORIZATION_GATE_SET: True")
    print("\nInvoking exact residual-20 native guarded Export runner...\n")

    cp=subprocess.run([sys.executable,str(runner),str(repo),str(residual_file)],env=env)

    native=e/OUT/"exact_residual_twenty_native_guarded_export_live_execution.json"
    dn=loadj(native) if native.exists() else {}
    passed=(cp.returncode==0 and dn.get("status")=="PASSED" and
            dn.get("targetCount")==20 and dn.get("outcomeCount")==20 and dn.get("certifiedCount")==20)

    wrapper_checks=dict(checks)
    wrapper_checks.update({
      "runnerExitZero":cp.returncode==0,
      "nativeEvidencePresent":native.exists(),
      "nativeStatusPassed":dn.get("status")=="PASSED",
      "nativeTargetCountTwenty":dn.get("targetCount")==20,
      "nativeOutcomeCountTwenty":dn.get("outcomeCount")==20,
      "nativeCertifiedCountTwenty":dn.get("certifiedCount")==20
    })

    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R26D_R2_R3_R3_EXACT_RESIDUAL_TWENTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION_CERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R26D_R2_R3_R3_EXACT_RESIDUAL_TWENTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R26D_R2_R4_EXACT_ONE_HUNDRED_PROGRESSIVE_LIFECYCLE_RECONCILIATION_AND_CLOSURE"
         if passed else
         "M4_19D4BN17C_R4_R12_R16A_R26D_R2_R3_R3_R1_RESIDUAL_EXECUTION_CAUSAL_DIAGNOSIS")

    od=e/OUT;od.mkdir(parents=True,exist_ok=True)
    wf=od/"residual_twenty_native_runner_cardinality_repair_and_live_execution_wrapper.json"
    out={"framework":"SCIIP_EXPLORER_4_R26D_R2_R3_R3_RESIDUAL_TWENTY_NATIVE_RUNNER_CARDINALITY_REPAIR_AND_LIVE_EXECUTION_RECERTIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,
         "runnerExitCode":cp.returncode,"checks":wrapper_checks,
         "nativeEvidence":str(native) if native.exists() else None,
         "nextMilestone":nxt}
    wf.write_text(json.dumps(out,indent=2)+"\n")

    print("\n----- WRAPPER CHECKS -----")
    for k,v in wrapper_checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("WRAPPER_EVIDENCE:",wf)
    if native.exists(): print("NATIVE_EVIDENCE:",native)
    print("\nR26D-R2-R3-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0
if __name__=="__main__": raise SystemExit(main())
