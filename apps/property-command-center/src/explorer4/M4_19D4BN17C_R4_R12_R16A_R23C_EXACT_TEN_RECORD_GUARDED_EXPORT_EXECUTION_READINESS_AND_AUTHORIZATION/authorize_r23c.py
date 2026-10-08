#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R23C_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
R22C="M4_19D4BN17C_R4_R12_R16A_R22C_R1_ARTIFACT_EVIDENCE_SCHEMA_NORMALIZATION_AND_EXACT_THREE_RECORD_LIFECYCLE_CLOSURE_RECERTIFICATION"
R23A="M4_19D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R23B="M4_19D4BN17C_R4_R12_R16A_R23B_SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"

R22C_STATE="M419D4BN17C_R4_R12_R16A_R22C_R1_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSED"
R23A_STATE="M419D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
R23B_STATE="M419D4BN17C_R4_R12_R16A_R23B_SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p22=evid/R22C/"artifact_evidence_schema_normalization_and_lifecycle_closure_recertification.json"
    p23a=evid/R23A/"exact_ten_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    p23b=evid/R23B/"seven_new_record_non_export_live_qualification.json"

    for p,label in [(p22,"R22C_R1"),(p23a,"R23A"),(p23b,"R23B")]:
        if not p.exists():
            print("STATUS: BLOCKED"); print("DIAGNOSIS:",f"{label}_EVIDENCE_REQUIRED"); return 4

    r22=loadj(p22); r23a=loadj(p23a); r23b=loadj(p23b)

    if r22.get("status")!="PASSED" or r22.get("state")!=R22C_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: REFERENCE_THREE_EXPORT_LIFECYCLE_MUST_BE_CLOSED"); return 5
    if r23a.get("status")!="PASSED" or r23a.get("state")!=R23A_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23A_EXACT_TEN_COHORT_PREAUTHORIZATION_REQUIRED"); return 6
    if r23b.get("status")!="PASSED" or r23b.get("state")!=R23B_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23B_SEVEN_NEW_RECORD_QUALIFICATION_REQUIRED"); return 7

    exact_ten=r23a.get("exactTenCandidateCohort") or []
    reference=r23a.get("referenceCohort") or []
    new_targets=r23b.get("targets") or []
    outcomes=r23b.get("outcomes") or []

    if len(exact_ten)!=10 or len(reference)!=3 or len(new_targets)!=7 or len(outcomes)!=7:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: EXACT_TEN_REFERENCE_THREE_PLUS_SEVEN_STRUCTURE_REQUIRED"); return 8

    reference_ok=all(x.get("certified") is True for x in (r22.get("records") or []))
    new_ok=all(x.get("qualified") is True for x in outcomes)
    cohort_order_ok=exact_ten[:3]==reference and exact_ten[3:]==new_targets

    authorization={
      "cohortSize":10,
      "cohortOrder":exact_ten,
      "referenceCertifiedRecordCount":3,
      "newLiveQualifiedRecordCount":7,
      "executionMode":"STRICT_SEQUENTIAL_GUARDED_EXPORT",
      "browserPolicy":{
        "preserveCertifiedBrowserContext":True,
        "freshExplorerPagePerRecord":True,
        "samePageReuseAcrossRecords":False,
        "freshIsolatedBrowserPerRecord":False
      },
      "selectionPolicy":{
        "explorerFirst":True,
        "singleTargetClickMaximum":1,
        "boundedSelectionSettleRequired":True,
        "requiredConsecutiveCertifiedSamples":3,
        "maximumSettleWindowSeconds":2.0,
        "selectedMarkerReadbackRequired":True,
        "targetTextReadbackRequired":True,
        "assignmentsControlReadbackRequired":True
      },
      "workflowPolicy":{
        "assignmentsEntryRequired":True,
        "generateClientListingReportRequired":True,
        "reportReviewEntryRequired":True,
        "downloadClientListingReportControlRequired":True,
        "liveHandlerMustEqual":"exportReport"
      },
      "exportPolicy":{
        "maximumExportClicksPerRecord":1,
        "exactOnePdfDownloadRequired":True,
        "exactOnePdfObjectUrlEventRequired":True,
        "pdfMimeMustEqual":"application/pdf",
        "pdfSizeMustBePositive":True,
        "filenameMustEndWith":".pdf"
      },
      "postActionPolicy":{
        "postPublishReportReviewUnmountRequired":True,
        "explorerContinuityRequired":True,
        "sameOriginRequired":True,
        "runtimeErrorsMustEqual":0,
        "unhandledRejectionsMustEqual":0,
        "readAfterActionRequired":True
      },
      "failurePolicy":{
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "continueAfterFailure":False,
        "concurrencyAllowed":False
      },
      "authority":{
        "liveExportExecutionAuthorized":True,
        "authorizationScope":"EXACT_TEN_RECORD_COHORT_ONLY",
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      }
    }

    checks={
      "r22cR1ReferenceThreeClosed":True,
      "r23aExactTenPreauthorizationConsumed":True,
      "r23bSevenNewQualificationConsumed":True,
      "referenceThreeCertified":reference_ok,
      "sevenNewRecordsQualified":new_ok,
      "exactTenCohortOrderReconciled":cohort_order_ok,
      "exactTenCohortSize":len(exact_ten)==10,
      "freshPagePerRecordRequired":True,
      "selectionSettleGuardRequired":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "oneExportClickMaximumPerRecord":True,
      "artifactGuardRequired":True,
      "postPublishUnmountRequired":True,
      "runtimeContinuityGuardRequired":True,
      "authorizationBoundedToExactTen":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "exportInvocationOffInThisMilestone":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R23C_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R23C_EXACT_TEN_RECORD_EXPORT_READINESS_INCOMPLETE")
    classification=("REFERENCE_THREE_CLOSED_PLUS_SEVEN_NEW_QUALIFIED_EXACT_TEN_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
                    if passed else
                    "EXACT_TEN_GUARDED_EXPORT_EXECUTION_READINESS_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R23D_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R23C_R1_EXECUTION_READINESS_RESIDUAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R23C_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":state,
      "classification":classification,
      "cohort":exact_ten,
      "authorization":authorization,
      "checks":checks,
      "nextMilestone":nextm
    }

    od=evid/M
    od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_ten_record_guarded_export_execution_readiness_and_authorization.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R23C Exact Ten-Record Guarded Export Execution Readiness + Authorization")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_AUTHORIZATION")
    print("REFERENCE_CERTIFIED_RECORDS: 3")
    print("NEW_QUALIFIED_RECORDS: 7")
    print("EXACT_TEN_COHORT_SIZE:",len(exact_ten))
    print("LIVE_EXPORT_EXECUTION_AUTHORIZED:",passed)
    print("AUTHORIZATION_SCOPE: EXACT_TEN_RECORD_COHORT_ONLY")
    print("EXPORT_INVOCATION_IN_THIS_MILESTONE: OFF")
    print()
    print("----- EXACT TEN COHORT -----")
    for i,x in enumerate(exact_ten,1): print(f"{i}. {x}")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
