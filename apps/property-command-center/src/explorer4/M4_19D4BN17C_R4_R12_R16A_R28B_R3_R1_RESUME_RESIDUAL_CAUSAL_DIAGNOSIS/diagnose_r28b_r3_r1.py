#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

R3="M4_19D4BN17C_R4_R12_R16A_R28B_R3_EXPLORER_ENTRY_CLICK_HELPER_REPAIR_RECORD_201_RECERTIFICATION_AND_EXACT_NEW_200_NON_EXPORT_RESUME"
OUT="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p=er/R3/"explorer_entry_click_helper_repair_record_201_recertification_and_exact_new_200_non_export_resume.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28B-R3-R1 Resume Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Explorer click: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Resume retry: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED");print("REASON: R28B-R3 evidence missing");return 4

    j=loadj(p)
    if not isinstance(j,dict):
        print("STATUS: BLOCKED");print("REASON: R28B-R3 evidence root must be object");return 5

    outs=j.get("outcomes") or []
    if not isinstance(outs,list) or not outs:
        print("STATUS: BLOCKED");print("REASON: R28B-R3 structured outcomes missing");return 6

    failed=next((x for x in outs if isinstance(x,dict) and not x.get("certified")),None)
    if not failed:
        print("STATUS: BLOCKED");print("REASON: failed record not resolved");return 7

    ordinal=failed.get("ordinal")
    target=failed.get("target")
    failure=failed.get("failure")
    certified_before=sum(1 for x in outs if isinstance(x,dict) and x.get("certified"))

    stage_order=[
      "freshTargetCreated",
      "explorerSettleCertified",
      "explorerEntryCertified",
      "targetBindingSettleCertified",
      "selectionCertified",
      "selectedPropertySettleCertified",
      "assignmentsEntryCertified",
      "generateControlCertified",
      "generateClicked",
      "reportReviewEntryCertified",
      "downloadClientListingReportControlCertified",
      "exportReportHandlerCertifiedBySourceContract",
      "sameOrigin"
    ]

    failed_stage=None
    for k in stage_order:
        if failed.get(k) is False:
            failed_stage=k
            break

    all_pre_origin=all(failed.get(k) is True for k in [
      "freshTargetCreated",
      "explorerSettleCertified",
      "explorerEntryCertified",
      "targetBindingSettleCertified",
      "selectionCertified",
      "selectedPropertySettleCertified",
      "assignmentsEntryCertified",
      "generateControlCertified",
      "generateClicked",
      "reportReviewEntryCertified",
      "downloadClientListingReportControlCertified",
      "exportReportHandlerCertifiedBySourceContract"
    ])
    export_off=failed.get("exportInvocation") is False

    if failure=="ORIGIN_CHANGED" and failed_stage=="sameOrigin" and all_pre_origin:
        classification="RECORD_233_ALL_NON_EXPORT_WORKFLOW_STAGES_CERTIFIED_BUT_FINAL_SAME_ORIGIN_READBACK_FAILED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R2_RECORD_233_POST_REPORT_REVIEW_ORIGIN_TRANSITION_DEEP_DIAGNOSIS"
    else:
        classification="RECORD_233_RESIDUAL_STAGE_REQUIRES_DEEP_DIAGNOSIS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R2_RECORD_233_FAILED_STAGE_DEEP_DIAGNOSIS"

    checks={
      "r28bR3EvidencePresent":True,
      "r28bR3DiagnosticCompleteStateConsumed":j.get("status")=="DIAGNOSTIC_COMPLETE",
      "structuredOutcomeListPresent":True,
      "certifiedBeforeFailureExactly32":certified_before==32,
      "firstFailureResolved":failed is not None,
      "firstFailureOrdinal233":ordinal==233,
      "firstFailureTarget13310ValleyBlvd":target=="13310 Valley Blvd",
      "failedStageResolved":failed_stage=="sameOrigin",
      "failureOriginChanged":failure=="ORIGIN_CHANGED",
      "allPreOriginStagesCertified":all_pre_origin,
      "exportInvocationRemainedOff":export_off,
      "record201RepairPreserved":bool(outs and outs[0].get("ordinal")==201 and outs[0].get("certified") is True),
      "firstThirtyTwoCertifiedPreserved":certified_before==32,
      "noReplayPerformed":True,
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "explorerClickOff":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"resume_residual_causal_diagnosis.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28B_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if all(checks.values()) else "FAILED",
      "state":"M419D4BN17C_R4_R12_R16A_R28B_R3_R1_RESUME_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "certifiedBeforeFailure":certified_before,
      "firstFailureOrdinal":ordinal,
      "firstFailureTarget":target,
      "firstFailedStage":failed_stage,
      "failure":failure,
      "stageReadback":{k:failed.get(k) for k in stage_order},
      "bindingModeRequested":failed.get("bindingModeRequested"),
      "bindingModeObserved":failed.get("bindingModeObserved"),
      "bindingInventoryCount":failed.get("bindingInventoryCount"),
      "explorerSurfaceMarkerCount":failed.get("explorerSurfaceMarkerCount"),
      "exportInvocation":failed.get("exportInvocation"),
      "checks":checks,
      "nextMilestone":nextm
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("CERTIFIED_BEFORE_FAILURE:",certified_before)
    print("FIRST_FAILURE_ORDINAL:",ordinal)
    print("FIRST_FAILURE_TARGET:",target)
    print("FIRST_FAILED_STAGE:",failed_stage)
    print("FAILURE:",failure)
    print("ALL_PRE_ORIGIN_STAGES_CERTIFIED:",all_pre_origin)
    print("EXPORT_INVOCATION:",failed.get("exportInvocation"))
    print("\n----- FAILED RECORD STAGE READBACK -----")
    for k in stage_order:print(f"{k}: {failed.get(k)}")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS:",out["status"])
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    print("\nR28B-R3-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if out["status"]=="PASSED" else 10

if __name__=="__main__":
    raise SystemExit(main())
