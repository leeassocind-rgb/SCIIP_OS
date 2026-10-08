#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

R28B="M4_19D4BN17C_R4_R12_R16A_R28B_TWO_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R28B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p=er/R28B/"two_hundred_new_record_non_export_live_qualification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28B-R1 Non-Export Live Qualification Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Explorer click: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("R28B retry: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED")
        print("REASON: R28B evidence missing")
        return 4

    j=loadj(p)
    if not isinstance(j,dict):
        print("STATUS: BLOCKED")
        print("REASON: R28B evidence root must be object")
        return 5

    outs=j.get("outcomes") or []
    if not isinstance(outs,list) or not outs:
        print("STATUS: BLOCKED")
        print("REASON: R28B structured outcome list missing")
        return 6

    failed=next((x for x in outs if isinstance(x,dict) and not x.get("certified")),None)
    if not failed:
        print("STATUS: BLOCKED")
        print("REASON: no failed R28B outcome resolved")
        return 7

    ordinal=failed.get("ordinal")
    target=failed.get("target")
    failure=failed.get("failure")

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

    explorer_settled=failed.get("explorerSettleCertified") is True
    explorer_entry_failed=failed.get("explorerEntryCertified") is False
    pre_target_failure=(failed_stage=="explorerEntryCertified")
    downstream_untouched=all(failed.get(k) is False for k in [
      "targetBindingSettleCertified","selectionCertified",
      "selectedPropertySettleCertified","assignmentsEntryCertified",
      "generateControlCertified","generateClicked",
      "reportReviewEntryCertified","downloadClientListingReportControlCertified"
    ])
    same_origin=failed.get("sameOrigin") is True
    export_off=failed.get("exportInvocation") is False

    if explorer_settled and explorer_entry_failed and same_origin:
        classification="RECORD_201_EXPLORER_CONTROL_SETTLED_BUT_ENTRY_CLICK_DID_NOT_CERTIFY"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R2_RECORD_201_EXPLORER_ENTRY_CONTROL_INTERACTION_DEEP_DIAGNOSIS"
    elif not explorer_settled:
        classification="RECORD_201_EXPLORER_SETTLE_FAILURE"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R2_RECORD_201_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSIS"
    else:
        classification="RECORD_201_PRE_TARGET_ENTRY_FAILURE_REQUIRES_DEEP_DIAGNOSIS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R2_RECORD_201_EXPLORER_ENTRY_CONTROL_INTERACTION_DEEP_DIAGNOSIS"

    checks={
      "r28bEvidencePresent":True,
      "r28bDiagnosticCompleteStateConsumed":j.get("status")=="DIAGNOSTIC_COMPLETE",
      "structuredOutcomeListPresent":True,
      "firstFailureResolved":failed is not None,
      "firstFailureOrdinal201":ordinal==201,
      "firstFailureTargetResolved":bool(target),
      "failedStageResolved":bool(failed_stage),
      "explorerSettleReadbackCaptured":"explorerSettleCertified" in failed,
      "explorerEntryReadbackCaptured":"explorerEntryCertified" in failed,
      "sameOriginReadbackCaptured":"sameOrigin" in failed,
      "exportInvocationReadbackCaptured":"exportInvocation" in failed,
      "failureOccurredBeforeTargetBinding":pre_target_failure,
      "downstreamWorkflowUntouched":downstream_untouched,
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
    ef=od/"non_export_live_qualification_residual_causal_diagnosis.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if all(checks.values()) else "FAILED",
      "state":"M419D4BN17C_R4_R12_R16A_R28B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "certifiedBeforeFailure":sum(1 for x in outs if isinstance(x,dict) and x.get("certified")),
      "firstFailureOrdinal":ordinal,
      "firstFailureTarget":target,
      "firstFailedStage":failed_stage,
      "failure":failure,
      "stageReadback":{k:failed.get(k) for k in stage_order},
      "bindingModeRequested":failed.get("bindingModeRequested"),
      "bindingModeObserved":failed.get("bindingModeObserved"),
      "bindingInventoryCount":failed.get("bindingInventoryCount"),
      "checks":checks,
      "nextMilestone":nextm
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("CERTIFIED_BEFORE_FAILURE:",out["certifiedBeforeFailure"])
    print("FIRST_FAILURE_ORDINAL:",ordinal)
    print("FIRST_FAILURE_TARGET:",target)
    print("FIRST_FAILED_STAGE:",failed_stage)
    print("FAILURE:",failure)
    print("EXPLORER_SETTLED:",explorer_settled)
    print("EXPLORER_ENTRY_CERTIFIED:",failed.get("explorerEntryCertified"))
    print("SAME_ORIGIN:",same_origin)
    print("EXPORT_INVOCATION:",failed.get("exportInvocation"))
    print("\n----- STAGE READBACK -----")
    for k in stage_order:
        print(f"{k}: {failed.get(k)}")
    print("\n----- CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS:",out["status"])
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    print("\nR28B-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if out["status"]=="PASSED" else 10

if __name__=="__main__":
    raise SystemExit(main())
