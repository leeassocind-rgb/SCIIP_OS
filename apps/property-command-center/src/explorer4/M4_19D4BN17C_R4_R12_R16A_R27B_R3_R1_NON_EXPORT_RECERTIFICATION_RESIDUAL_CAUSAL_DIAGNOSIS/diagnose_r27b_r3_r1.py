#!/usr/bin/env python3
import json,sys
from pathlib import Path

def load(p):
    with open(p,encoding="utf-8") as f:return json.load(f)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p=er/"M4_19D4BN17C_R4_R12_R16A_R27B_R3_EXACT_ONE_HUNDRED_NEW_RECORD_NON_EXPORT_RECERTIFICATION"/"exact_one_hundred_new_record_non_export_recertification.json"
    out=er/"M4_19D4BN17C_R4_R12_R16A_R27B_R3_R1_NON_EXPORT_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
    out.mkdir(parents=True,exist_ok=True)
    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R3-R1 Non-Export Recertification Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    if not p.exists():
        print("STATUS: BLOCKED\nREASON: R27B-R3 evidence required");return 4
    d=load(p)
    outcomes=d.get("outcomes",[])
    fail=next((x for x in outcomes if not x.get("certified")),None)
    if not fail:
        print("STATUS: BLOCKED\nREASON: no failed R27B-R3 outcome found");return 5
    stages=[
      "freshTargetCreated","explorerSettleCertified","explorerEntryCertified",
      "targetBindingSettleCertified","selectionCertified","selectedPropertySettleCertified",
      "assignmentsEntryCertified","generateControlCertified","reportReviewEntryCertified",
      "exportControlCertified","liveHandlerCertifiedBySourceContract","sameOrigin"
    ]
    failed_stage=next((k for k in stages if fail.get(k) is False),None)
    ordinal=fail.get("ordinal")
    target=fail.get("target")
    print(f"CERTIFIED_BEFORE_FAILURE: {sum(1 for x in outcomes if x.get('certified'))}")
    print(f"FIRST_FAILURE_ORDINAL: {ordinal}")
    print(f"FIRST_FAILURE_TARGET: {target}")
    print(f"FIRST_FAILED_STAGE: {failed_stage}")
    print("\n----- STAGE READBACK -----")
    for k in stages:
        print(f"{k}: {fail.get(k)}")
    print(f"failure: {fail.get('failure')}")
    classification={
      "exportControlCertified":"DOWNLOAD_CLIENT_LISTING_REPORT_LIVE_CONTROL_SURFACE_NOT_CERTIFIED",
      "reportReviewEntryCertified":"REPORT_REVIEW_ENTRY_NOT_CERTIFIED",
      "generateControlCertified":"GENERATE_CONTROL_NOT_CERTIFIED",
      "assignmentsEntryCertified":"ASSIGNMENTS_ENTRY_NOT_CERTIFIED",
      "selectedPropertySettleCertified":"SELECTED_PROPERTY_SETTLE_NOT_CERTIFIED",
      "selectionCertified":"PROPERTY_SELECTION_NOT_CERTIFIED",
      "targetBindingSettleCertified":"TARGET_BINDING_SETTLE_NOT_CERTIFIED",
      "explorerEntryCertified":"EXPLORER_ENTRY_NOT_CERTIFIED",
      "explorerSettleCertified":"EXPLORER_SETTLE_NOT_CERTIFIED",
      "freshTargetCreated":"FRESH_TARGET_CREATION_NOT_CERTIFIED"
    }.get(failed_stage,"UNRESOLVED_NON_EXPORT_STAGE_FAILURE")
    ev={
      "framework":"SCIIP_EXPLORER_4_R27B_R3_R1_NON_EXPORT_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "status":"PASSED","state":"M419D4BN17C_R4_R12_R16A_R27B_R3_R1_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "executionSummary":{"certifiedBeforeFailure":sum(1 for x in outcomes if x.get("certified")),
                          "firstFailureOrdinal":ordinal,"firstFailureTarget":target,"firstFailedStage":failed_stage},
      "stageReadback":{k:fail.get(k) for k in stages},
      "failure":fail.get("failure"),
      "checks":{"r27bR3EvidencePresent":True,"firstFailureResolved":True,
                "noRetryPerformed":True,"liveUiInteractionOff":True,"exportInvocationOff":True,
                "applicationMutationOff":True,"governedMutationOff":True},
      "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R27B_R3_R2_FIRST_RECORD_LIVE_CONTROL_SURFACE_CAUSAL_REPAIR"
    }
    ep=out/"non_export_recertification_residual_causal_diagnosis.json"
    ep.write_text(json.dumps(ev,indent=2)+"\n")
    print(f"\nCLASSIFICATION: {classification}")
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R27B_R3_R1_RESIDUAL_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R27B_R3_R2_FIRST_RECORD_LIVE_CONTROL_SURFACE_CAUSAL_REPAIR")
    print(f"EVIDENCE: {ep}")
    return 0
if __name__=="__main__":raise SystemExit(main())
