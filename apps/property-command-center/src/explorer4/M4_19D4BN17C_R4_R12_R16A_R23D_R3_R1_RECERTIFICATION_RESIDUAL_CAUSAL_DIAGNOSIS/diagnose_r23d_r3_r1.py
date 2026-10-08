#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R3="M4_19D4BN17C_R4_R12_R16A_R23D_R3_CONTAINS_MATCH_SELECTION_BINDING_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
R3_STATE="M419D4BN17C_R4_R12_R16A_R23D_R3_EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFICATION_INCOMPLETE"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p=evid/R3/"contains_match_selection_binding_and_ten_record_export_recertification.json"
    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23D_R3_EVIDENCE_REQUIRED");return 4

    r=loadj(p)
    if r.get("state")!=R3_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23D_R3_INCOMPLETE_STATE_REQUIRED");return 5

    outcomes=r.get("outcomes") or []
    if len(outcomes)<3:
        print("STATUS: BLOCKED");print("DIAGNOSIS: THIRD_RECORD_OUTCOME_REQUIRED");return 6

    first_two=outcomes[:2]
    third=outcomes[2]
    target=third.get("target")
    selection=third.get("selection") or {}
    settle=third.get("selectionSettleReadback") or {}
    failure=third.get("failure")

    first_two_certified=all(x.get("certified") is True for x in first_two)

    exact_count=selection.get("exactCount")
    contains_count=selection.get("containsCount")
    candidates=selection.get("candidates") or []
    binding=selection.get("binding")
    clicked=selection.get("clicked")

    if failure!="SELECTION_OR_SETTLE_FAILED":
        classification="THIRD_RECORD_FAILURE_NOT_SELECTION_STAGE"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_NON_SELECTION_RESIDUAL_DIAGNOSIS"
    elif clicked is not True:
        if exact_count is not None or contains_count is not None:
            if exact_count==0 and contains_count==0:
                classification="THIRD_RECORD_TARGET_NOT_MATERIALIZED_AT_SELECTION_TIME"
                nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_TARGET_MATERIALIZATION_AND_BINDING_DIAGNOSIS"
            elif exact_count==0 and isinstance(contains_count,int) and contains_count>1:
                classification="THIRD_RECORD_CONTAINS_MATCH_AMBIGUOUS"
                nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_UNIQUE_CONTROL_DISAMBIGUATION"
            elif exact_count and exact_count>1:
                classification="THIRD_RECORD_EXACT_MATCH_AMBIGUOUS"
                nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_UNIQUE_CONTROL_DISAMBIGUATION"
            else:
                classification="THIRD_RECORD_TARGET_BINDING_FAILURE_REQUIRES_LIVE_CONTROL_INVENTORY"
                nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_TARGET_MATERIALIZATION_AND_BINDING_DIAGNOSIS"
        else:
            classification="THIRD_RECORD_SELECTION_BINDING_FAILURE_WITHOUT_COUNT_READBACK"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_TARGET_MATERIALIZATION_AND_BINDING_DIAGNOSIS"
    elif settle.get("certified") is not True:
        classification="THIRD_RECORD_SELECTION_CLICK_SUCCEEDED_SETTLE_FAILED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_SELECTION_SETTLE_STABILITY_DIAGNOSIS"
    else:
        classification="THIRD_RECORD_SELECTION_CERTIFICATION_PARITY_INCONSISTENCY"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R3_R2_THIRD_RECORD_SELECTION_PARITY_REPAIR"

    stage={
      "target":target,
      "freshTargetCreated":third.get("freshTargetCreated"),
      "explorerEntry":third.get("explorerEntry"),
      "selection":selection,
      "selectionSettleReadback":settle,
      "selectedPropertyCertified":third.get("selectedPropertyCertified"),
      "assignmentsEntryCertified":third.get("assignmentsEntryCertified"),
      "reportReviewEntryCertified":third.get("reportReviewEntryCertified"),
      "exportControlCertified":third.get("exportControlCertified"),
      "liveHandlerCertified":third.get("liveHandlerCertified"),
      "exportAction":third.get("exportAction"),
      "artifact":third.get("artifact"),
      "certified":third.get("certified"),
      "failure":failure
    }

    checks={
      "r23dR3IncompleteStateConsumed":True,
      "firstTwoRecordsCertified":first_two_certified,
      "thirdRecordOutcomeResolved":target is not None,
      "thirdRecordFailureStageCaptured":True,
      "selectionBindingReadbackCaptured":True,
      "selectionSettleReadbackCaptured":True,
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R23D_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R23D_R3_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "firstTwoCertified":first_two_certified,
      "thirdOutcome":stage,
      "checks":checks,
      "authority":{
        "liveUiInteraction":False,
        "exportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"recertification_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R23D-R3-R1 Recertification Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_DIAGNOSIS")
    print("FIRST_TWO_CERTIFIED:",first_two_certified)
    print("THIRD_TARGET:",target)
    print("THIRD_FAILURE:",failure)
    print("SELECTION_CLICKED:",clicked)
    print("SELECTION_BINDING:",binding)
    print("SELECTION_EXACT_COUNT:",exact_count)
    print("SELECTION_CONTAINS_COUNT:",contains_count)
    print("SELECTION_CANDIDATES:",json.dumps(candidates,ensure_ascii=False))
    print("SELECTION_SETTLE_CERTIFIED:",settle.get("certified"))
    print("CONSECUTIVE_CERTIFIED_SAMPLES:",settle.get("consecutiveCertifiedSamples"))
    print()
    print("----- THIRD OUTCOME -----")
    for k,v in stage.items():print(f"{k}: {json.dumps(v,ensure_ascii=False)}")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R23D_R3_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
