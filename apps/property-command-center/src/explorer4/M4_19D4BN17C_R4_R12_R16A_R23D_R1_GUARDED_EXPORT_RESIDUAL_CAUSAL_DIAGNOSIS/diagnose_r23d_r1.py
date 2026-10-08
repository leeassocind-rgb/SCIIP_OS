#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R23D_R1_GUARDED_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS"
R23D="M4_19D4BN17C_R4_R12_R16A_R23D_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION"
R23D_STATE="M419D4BN17C_R4_R12_R16A_R23D_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION_INCOMPLETE"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p=evid/R23D/"exact_ten_record_guarded_export_execution.json"
    if not p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R23D_EVIDENCE_REQUIRED")
        return 4

    r=loadj(p)
    if r.get("state")!=R23D_STATE:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R23D_INCOMPLETE_STATE_REQUIRED")
        return 5

    outcomes=r.get("outcomes") or []
    checks=r.get("checks") or {}
    cohort=r.get("cohort") or []

    if not outcomes:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R23D_OUTCOME_RECORD_REQUIRED")
        return 6

    first=outcomes[0]
    target=first.get("target") or (cohort[0] if cohort else None)
    failure=first.get("failure")

    stage={
      "freshPageCreated":first.get("freshTargetCreated"),
      "explorerEntry":first.get("explorerEntry"),
      "selection":first.get("selection"),
      "selectionSettleReadback":first.get("selectionSettleReadback"),
      "selectedPropertyCertified":first.get("selectedPropertyCertified"),
      "assignmentsEntry":first.get("assignmentsEntry"),
      "assignmentsEntryCertified":first.get("assignmentsEntryCertified"),
      "generateAction":first.get("generateAction"),
      "reportReviewEntryCertified":first.get("reportReviewEntryCertified"),
      "exportControlCertified":first.get("exportControlCertified"),
      "liveHandlerCertified":first.get("liveHandlerCertified"),
      "exportAction":first.get("exportAction"),
      "artifact":first.get("artifact"),
      "runtimeErrorCount":first.get("runtimeErrorCount"),
      "unhandledRejectionCount":first.get("unhandledRejectionCount"),
      "postPublishReportReviewUnmountCertified":first.get("postPublishReportReviewUnmountCertified"),
      "explorerContinuity":first.get("explorerContinuity"),
      "sameOrigin":first.get("sameOrigin"),
      "certified":first.get("certified"),
      "failure":failure
    }

    if failure=="FRESH_PAGE_CREATION_FAILED":
        classification="FIRST_RECORD_FRESH_PAGE_CREATION_FAILED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_CDP_PAGE_TARGET_MATERIALIZATION_RECERTIFICATION"
    elif failure=="SELECTION_OR_SETTLE_FAILED":
        ss=first.get("selectionSettleReadback") or {}
        selection=first.get("selection") or {}
        if not (first.get("explorerEntry") or {}).get("clicked"):
            classification="FIRST_RECORD_EXPLORER_ENTRY_FAILED"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_EXPLORER_ENTRY_BINDING_RECERTIFICATION"
        elif not selection.get("clicked"):
            classification="FIRST_RECORD_TARGET_SELECTION_CLICK_FAILED"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_TARGET_SELECTION_RESOLUTION"
        elif not ss.get("certified"):
            classification="FIRST_RECORD_SELECTION_SETTLE_READBACK_FAILED"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_SELECTION_SETTLE_RESIDUAL_DIAGNOSIS"
        else:
            classification="FIRST_RECORD_SELECTION_CERTIFICATION_INCONSISTENCY"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_SELECTION_CERTIFICATION_PARITY_REPAIR"
    elif failure=="ASSIGNMENTS_OR_GENERATE_CONTROL_FAILED":
        classification="FIRST_RECORD_ASSIGNMENTS_OR_GENERATE_CONTROL_FAILED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_ASSIGNMENTS_GENERATE_CONTROL_RESIDUAL_DIAGNOSIS"
    elif failure=="REPORT_REVIEW_OR_EXPORT_BINDING_FAILED":
        classification="FIRST_RECORD_REPORT_REVIEW_OR_EXPORT_BINDING_FAILED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_REPORT_REVIEW_EXPORT_BINDING_RESIDUAL_DIAGNOSIS"
    elif failure=="EXPORT_OR_ARTIFACT_CERTIFICATION_FAILED":
        a=first.get("artifact") or {}
        if first.get("runtimeErrorCount",0):
            classification="FIRST_RECORD_EXPORT_RUNTIME_ERROR"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_EXPORT_RUNTIME_ERROR_DIAGNOSIS"
        elif first.get("unhandledRejectionCount",0):
            classification="FIRST_RECORD_EXPORT_UNHANDLED_REJECTION"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_EXPORT_UNHANDLED_REJECTION_DIAGNOSIS"
        elif a.get("pdfDownloadCount")!=1 or a.get("pdfEventCount")!=1:
            classification="FIRST_RECORD_EXPORT_ARTIFACT_SIGNAL_GAP"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_EXPORT_ARTIFACT_SIGNAL_DIAGNOSIS"
        elif not first.get("postPublishReportReviewUnmountCertified"):
            classification="FIRST_RECORD_POST_PUBLISH_UNMOUNT_GAP"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_POST_PUBLISH_UNMOUNT_DIAGNOSIS"
        elif not first.get("explorerContinuity") or not first.get("sameOrigin"):
            classification="FIRST_RECORD_POST_EXPORT_CONTINUITY_GAP"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_POST_EXPORT_CONTINUITY_DIAGNOSIS"
        else:
            classification="FIRST_RECORD_EXPORT_ARTIFACT_CERTIFICATION_RESIDUAL_UNKNOWN"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_EXPORT_ARTIFACT_RESIDUAL_DEEP_DIAGNOSIS"
    else:
        # If failure is absent, derive the first false stage directly.
        if first.get("freshTargetCreated") is not True:
            classification="FIRST_RECORD_FRESH_PAGE_CREATION_FAILED"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_CDP_PAGE_TARGET_MATERIALIZATION_RECERTIFICATION"
        elif first.get("selectedPropertyCertified") is not True:
            classification="FIRST_RECORD_SELECTION_CERTIFICATION_FAILED_WITHOUT_FAILURE_LABEL"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_SELECTION_RESIDUAL_DIAGNOSIS"
        elif first.get("assignmentsEntryCertified") is not True:
            classification="FIRST_RECORD_ASSIGNMENTS_CERTIFICATION_FAILED_WITHOUT_FAILURE_LABEL"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_ASSIGNMENTS_GENERATE_CONTROL_RESIDUAL_DIAGNOSIS"
        elif first.get("reportReviewEntryCertified") is not True or first.get("exportControlCertified") is not True or first.get("liveHandlerCertified") is not True:
            classification="FIRST_RECORD_REPORT_REVIEW_EXPORT_BINDING_FAILED_WITHOUT_FAILURE_LABEL"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_REPORT_REVIEW_EXPORT_BINDING_RESIDUAL_DIAGNOSIS"
        else:
            classification="FIRST_RECORD_FAILURE_LABEL_OR_STAGE_NOT_RESOLVED"
            nextm="M4_19D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_DEEP_STAGE_DIAGNOSIS"

    checks_out={
      "r23dIncompleteStateConsumed":True,
      "r23dOutcomeRecordPresent":True,
      "firstExecutedRecordResolved":target is not None,
      "firstFailureStageCaptured":True,
      "r23dSummaryChecksConsumed":bool(checks),
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R23D_R1_GUARDED_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R23D_R1_GUARDED_EXPORT_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "target":target,
      "r23dStatus":r.get("status"),
      "r23dState":r.get("state"),
      "r23dOutcomeCount":len(outcomes),
      "r23dCohort":cohort,
      "firstOutcome":stage,
      "summaryChecks":checks,
      "checks":checks_out,
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

    od=evid/M
    od.mkdir(parents=True,exist_ok=True)
    ef=od/"guarded_export_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R23D-R1 Guarded Export Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_DIAGNOSIS")
    print("R23D_OUTCOME_COUNT:",len(outcomes))
    print("FIRST_EXECUTED_TARGET:",target)
    print("FIRST_FAILURE:",failure)
    print()
    print("----- FIRST OUTCOME STAGE READBACK -----")
    for k,v in stage.items():
        print(f"{k}: {json.dumps(v,ensure_ascii=False)}")
    print()
    print("----- CHECKS -----")
    for k,v in checks_out.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R23D_R1_GUARDED_EXPORT_RESIDUAL_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
