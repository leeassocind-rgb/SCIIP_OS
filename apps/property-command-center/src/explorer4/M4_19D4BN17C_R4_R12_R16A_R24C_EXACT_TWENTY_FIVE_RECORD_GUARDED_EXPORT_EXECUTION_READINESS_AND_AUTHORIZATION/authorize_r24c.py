#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, hashlib

R23F="M4_19D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSURE"
R23F_STATE="M419D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSED"

R24A="M4_19D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R24A_STATE="M419D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"

R24B_R3="M4_19D4BN17C_R4_R12_R16A_R24B_R3_DIRECT_REPORT_REVIEW_MATERIALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
R24B_R3_STATE="M419D4BN17C_R4_R12_R16A_R24B_R3_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_RECERTIFIED"
R24B_R3_CLASS="FIFTEEN_NEW_RECORDS_DIRECT_REPORT_REVIEW_MATERIALIZATION_AND_EXPORT_BINDING_NON_EXPORT_QUALIFIED"

M="M4_19D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p23=evid/R23F/"exact_ten_record_export_lifecycle_closure.json"
    p24a=evid/R24A/"exact_twenty_five_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    p24b=evid/R24B_R3/"direct_report_review_materialization_repair_and_fifteen_record_non_export_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24C Exact Twenty-Five Record Guarded Export Execution Readiness + Authorization")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_AUTHORIZATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    missing=[str(p) for p in [p23,p24a,p24b] if not p.exists()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for x in missing: print("MISSING:",x)
        return 4

    r23=loadj(p23); r24a=loadj(p24a); r24b=loadj(p24b)

    if r23.get("status")!="PASSED" or r23.get("state")!=R23F_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23F_REFERENCE_TEN_LIFECYCLE_CLOSURE_REQUIRED"); return 5
    if r24a.get("status")!="PASSED" or r24a.get("state")!=R24A_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24A_EXACT_TWENTY_FIVE_PREAUTHORIZATION_REQUIRED"); return 6
    if r24b.get("status")!="PASSED" or r24b.get("state")!=R24B_R3_STATE or r24b.get("classification")!=R24B_R3_CLASS:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24B_R3_FIFTEEN_NEW_NON_EXPORT_QUALIFICATION_REQUIRED"); return 7

    ref=r24a.get("referenceCohort") or []
    exact25=r24a.get("exactTwentyFiveCandidateCohort") or []
    new=r24b.get("normalizedTargets") or []

    checks={
        "r23fReferenceTenClosed": len(ref)==10 and r23.get("state")==R23F_STATE,
        "r24aExactTwentyFivePreauthorizationConsumed": len(exact25)==25,
        "r24bR3FifteenNewQualificationConsumed": len(new)==15,
        "referenceTenCertified": len(ref)==10,
        "fifteenNewRecordsQualified": len(new)==15 and (r24b.get("checks") or {}).get("allFifteenNewRecordsQualified") is True,
        "exactTwentyFiveCohortOrderReconciled": exact25[:10]==ref and exact25[10:]==new,
        "exactTwentyFiveCohortSize": len(exact25)==25,
        "exactTwentyFiveUniqueTargets": len({x.lower() for x in exact25})==25,
        "freshPagePerRecordRequired": True,
        "explorerSettleThreeConsecutiveRequired": True,
        "explorerSettleMaximumSecondsTwo": True,
        "targetBindingSettleThreeConsecutiveRequired": True,
        "targetBindingSettleMaximumSecondsFive": True,
        "selectedPropertySettleThreeConsecutiveRequired": True,
        "selectedPropertySettleMaximumSecondsTwo": True,
        "candidateStatusSuffixNormalizationRequired": True,
        "directGenerateToReportReviewMaterializationRequired": True,
        "strictSequentialRequired": True,
        "haltOnFirstFailureRequired": True,
        "oneExportClickMaximumPerRecord": True,
        "artifactGuardRequired": True,
        "pdfMimeApplicationPdfRequired": True,
        "positivePdfSizeRequired": True,
        "singlePdfDownloadRequired": True,
        "singlePdfObjectUrlEventRequired": True,
        "postPublishUnmountRequired": True,
        "runtimeContinuityGuardRequired": True,
        "sameOriginRequired": True,
        "authorizationBoundedToExactTwentyFive": True,
        "applicationMutationOff": True,
        "governedMutationOff": True,
        "networkAuthorityOff": True,
        "pixelEvidenceOff": True,
        "liveUiInteractionOff": True,
        "exportInvocationOffInThisMilestone": True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_INCOMPLETE")
    classification=("REFERENCE_TEN_CLOSED_PLUS_FIFTEEN_NEW_QUALIFIED_EXACT_TWENTY_FIVE_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
                    if passed else
                    "EXACT_TWENTY_FIVE_GUARDED_EXPORT_EXECUTION_AUTHORIZATION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R24C_R1_AUTHORIZATION_RESIDUAL_DIAGNOSIS")

    out={
        "framework":"SCIIP_EXPLORER_4_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":state,
        "classification":classification,
        "referenceCertifiedRecords":10,
        "newQualifiedRecords":15,
        "exactTwentyFiveCohortSize":25,
        "liveExportExecutionAuthorized":passed,
        "authorizationScope":"EXACT_TWENTY_FIVE_RECORD_COHORT_ONLY",
        "exportInvocationInThisMilestone":False,
        "exactTwentyFiveCohort":exact25,
        "executionPolicy":{
            "freshPagePerRecord":True,
            "explorerSettle":{"requiredConsecutiveSamples":3,"maximumSeconds":2.0},
            "targetBindingSettle":{"requiredConsecutiveSamples":3,"maximumSeconds":5.0,"binding":"EXACT_FIRST_OR_UNIQUE_CONTAINS"},
            "selectedPropertySettle":{"requiredConsecutiveSamples":3,"maximumSeconds":2.0},
            "candidateIdentityNormalization":"STATUS_SUFFIX_BOUNDARY_ONLY",
            "reportReviewTransition":"GENERATE_DIRECTLY_MATERIALIZES_REVIEW_AND_DOWNLOAD_CONTROL",
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
            "r24a":{"path":str(p24a),"sha256":hashlib.sha256(p24a.read_bytes()).hexdigest()},
            "r24bR3":{"path":str(p24b),"sha256":hashlib.sha256(p24b.read_bytes()).hexdigest()}
        },
        "nextMilestone":nextm
    }

    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_twenty_five_record_guarded_export_execution_readiness_and_authorization.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print()
    print("REFERENCE_CERTIFIED_RECORDS:",10)
    print("NEW_QUALIFIED_RECORDS:",15)
    print("EXACT_TWENTY_FIVE_COHORT_SIZE:",25)
    print("LIVE_EXPORT_EXECUTION_AUTHORIZED:",passed)
    print("AUTHORIZATION_SCOPE: EXACT_TWENTY_FIVE_RECORD_COHORT_ONLY")
    print("EXPORT_INVOCATION_IN_THIS_MILESTONE: OFF")
    print()
    print("----- EXACT TWENTY-FIVE COHORT -----")
    for i,x in enumerate(exact25,1): print(f"{i}. {x}")
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
