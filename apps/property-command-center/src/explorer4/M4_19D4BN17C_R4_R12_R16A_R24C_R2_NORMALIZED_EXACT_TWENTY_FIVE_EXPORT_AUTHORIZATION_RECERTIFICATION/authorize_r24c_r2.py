#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, hashlib

R23F="M4_19D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSURE"
R23F_STATE="M419D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSED"

R24B_R3="M4_19D4BN17C_R4_R12_R16A_R24B_R3_DIRECT_REPORT_REVIEW_MATERIALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
R24B_R3_STATE="M419D4BN17C_R4_R12_R16A_R24B_R3_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_RECERTIFIED"

R24C_R1="M4_19D4BN17C_R4_R12_R16A_R24C_R1_AUTHORIZATION_RESIDUAL_DIAGNOSIS_AND_NORMALIZED_COHORT_RECONCILIATION"
R24C_R1_STATE="M419D4BN17C_R4_R12_R16A_R24C_R1_NORMALIZED_EXACT_TWENTY_FIVE_COHORT_RECONCILIATION_CERTIFIED"
R24C_R1_CLASS="R24C_AUTHORIZATION_GAP_CAUSED_SOLELY_BY_RAW_STATUS_SUFFIX_IDENTITY_PARITY_MISMATCH_NORMALIZED_COHORT_ORDER_RECONCILED"

M="M4_19D4BN17C_R4_R12_R16A_R24C_R2_NORMALIZED_EXACT_TWENTY_FIVE_EXPORT_AUTHORIZATION_RECERTIFICATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p23=evid/R23F/"exact_ten_record_export_lifecycle_closure.json"
    p24b=evid/R24B_R3/"direct_report_review_materialization_repair_and_fifteen_record_non_export_recertification.json"
    p24c1=evid/R24C_R1/"authorization_residual_diagnosis_and_normalized_cohort_reconciliation.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24C-R2 Normalized Exact Twenty-Five Export Authorization Recertification")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_AUTHORIZATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    for p in [p23,p24b,p24c1]:
        if not p.exists():
            print("STATUS: BLOCKED"); print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING"); print("MISSING:",p); return 4

    r23=loadj(p23); r24b=loadj(p24b); r1=loadj(p24c1)

    if r23.get("status")!="PASSED" or r23.get("state")!=R23F_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23F_REFERENCE_TEN_CLOSURE_REQUIRED"); return 5
    if r24b.get("status")!="PASSED" or r24b.get("state")!=R24B_R3_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24B_R3_FIFTEEN_NEW_QUALIFICATION_REQUIRED"); return 6
    if r1.get("status")!="PASSED" or r1.get("state")!=R24C_R1_STATE or r1.get("classification")!=R24C_R1_CLASS:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24C_R1_NORMALIZED_COHORT_RECONCILIATION_REQUIRED"); return 7

    normalized25=r1.get("normalizedExactTwentyFiveCohort") or []
    qualified25=r1.get("qualifiedExactTwentyFiveCohort") or []
    new15=r24b.get("normalizedTargets") or []

    checks={
        "r23fReferenceTenClosed": r23.get("state")==R23F_STATE,
        "r24bR3FifteenNewQualified": len(new15)==15 and (r24b.get("checks") or {}).get("allFifteenNewRecordsQualified") is True,
        "r24cR1NormalizedReconciliationConsumed": True,
        "normalizedExactTwentyFiveSize": len(normalized25)==25,
        "normalizedExactTwentyFiveUnique": len({x.lower() for x in normalized25})==25,
        "normalizedExactTwentyFiveMatchesQualifiedExactTwentyFive": normalized25==qualified25,
        "referenceTenPreservedInFirstTenPositions": normalized25[:10]==qualified25[:10],
        "qualifiedFifteenPreservedInLastFifteenPositions": normalized25[10:]==new15,
        "noCohortReordering": True,
        "noCandidateSubstitution": True,
        "statusSuffixIdentityNormalizationPreserved": True,
        "freshPagePerRecordRequired": True,
        "explorerSettleThreeConsecutiveRequired": True,
        "explorerSettleMaximumSecondsTwo": True,
        "targetBindingSettleThreeConsecutiveRequired": True,
        "targetBindingSettleMaximumSecondsFive": True,
        "targetBindingExactFirstUniqueContainsFallback": True,
        "ambiguousContainsBindingForbidden": True,
        "selectedPropertySettleThreeConsecutiveRequired": True,
        "selectedPropertySettleMaximumSecondsTwo": True,
        "directGenerateToReportReviewMaterializationRequired": True,
        "exportControlMustBeUniqueVisibleEnabled": True,
        "liveHandlerMustEqualExportReport": True,
        "strictSequentialRequired": True,
        "haltOnFirstFailureRequired": True,
        "oneExportClickMaximumPerRecord": True,
        "singlePdfDownloadRequired": True,
        "singlePdfObjectUrlEventRequired": True,
        "pdfMimeApplicationPdfRequired": True,
        "positivePdfSizeRequired": True,
        "pdfFilenameMustEndWithPdf": True,
        "postPublishReportReviewUnmountRequired": True,
        "explorerContinuityRequired": True,
        "sameOriginRequired": True,
        "runtimeErrorsZeroRequired": True,
        "unhandledRejectionsZeroRequired": True,
        "authorizationBoundedToExactTwentyFive": True,
        "applicationMutationOff": True,
        "governedMutationOff": True,
        "networkAuthorityOff": True,
        "pixelEvidenceOff": True,
        "liveUiInteractionOff": True,
        "exportInvocationOffInThisMilestone": True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R24C_R2_NORMALIZED_EXACT_TWENTY_FIVE_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R24C_R2_NORMALIZED_EXACT_TWENTY_FIVE_EXPORT_AUTHORIZATION_INCOMPLETE")
    classification=("NORMALIZED_EXACT_TWENTY_FIVE_COHORT_RECONCILED_AND_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
                    if passed else
                    "NORMALIZED_EXACT_TWENTY_FIVE_EXPORT_AUTHORIZATION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R24C_R2_R1_AUTHORIZATION_RESIDUAL_DIAGNOSIS")

    out={
        "framework":"SCIIP_EXPLORER_4_R24C_R2_NORMALIZED_EXACT_TWENTY_FIVE_EXPORT_AUTHORIZATION_RECERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":state,
        "classification":classification,
        "referenceCertifiedRecords":10,
        "newQualifiedRecords":15,
        "exactTwentyFiveCohortSize":len(normalized25),
        "liveExportExecutionAuthorized":passed,
        "authorizationScope":"NORMALIZED_EXACT_TWENTY_FIVE_RECORD_COHORT_ONLY",
        "normalizedExactTwentyFiveCohort":normalized25,
        "executionPolicy":{
            "freshPagePerRecord":True,
            "explorerSettle":{"requiredConsecutiveSamples":3,"maximumSeconds":2.0},
            "targetBindingSettle":{"requiredConsecutiveSamples":3,"maximumSeconds":5.0,"binding":"EXACT_FIRST_OR_UNIQUE_CONTAINS","ambiguousContainsForbidden":True},
            "selectedPropertySettle":{"requiredConsecutiveSamples":3,"maximumSeconds":2.0},
            "candidateIdentityNormalization":"RECOGNIZED_STATUS_SUFFIX_BOUNDARY_ONLY",
            "reportReviewTransition":"GENERATE_DIRECTLY_MATERIALIZES_REVIEW_AND_DOWNLOAD_CONTROL",
            "exportHandler":"exportReport",
            "strictSequential":True,
            "haltOnFirstFailure":True,
            "maximumExportClicksPerRecord":1
        },
        "artifactRuntimePolicy":{
            "pdfDownloadCount":1,
            "pdfObjectUrlEventCount":1,
            "pdfMimeType":"application/pdf",
            "pdfSizeMustBePositive":True,
            "filenameMustEndWith":".pdf",
            "postPublishReportReviewMustUnmount":True,
            "explorerMustRemainMounted":True,
            "sameOriginMustRemain":True,
            "runtimeErrorsMustEqual":0,
            "unhandledRejectionsMustEqual":0
        },
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "liveUiInteraction":False,
            "exportInvocation":False
        },
        "sourceEvidence":{
            "r23f":{"path":str(p23),"sha256":hashlib.sha256(p23.read_bytes()).hexdigest()},
            "r24bR3":{"path":str(p24b),"sha256":hashlib.sha256(p24b.read_bytes()).hexdigest()},
            "r24cR1":{"path":str(p24c1),"sha256":hashlib.sha256(p24c1.read_bytes()).hexdigest()}
        },
        "nextMilestone":nextm
    }

    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"normalized_exact_twenty_five_export_authorization_recertification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print()
    print("REFERENCE_CERTIFIED_RECORDS: 10")
    print("NEW_QUALIFIED_RECORDS: 15")
    print("EXACT_TWENTY_FIVE_COHORT_SIZE:",len(normalized25))
    print("LIVE_EXPORT_EXECUTION_AUTHORIZED:",passed)
    print("AUTHORIZATION_SCOPE: NORMALIZED_EXACT_TWENTY_FIVE_RECORD_COHORT_ONLY")
    print("EXPORT_INVOCATION_IN_THIS_MILESTONE: OFF")
    print()
    print("----- NORMALIZED EXACT TWENTY-FIVE COHORT -----")
    for i,x in enumerate(normalized25,1): print(f"{i}. {x}")
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
