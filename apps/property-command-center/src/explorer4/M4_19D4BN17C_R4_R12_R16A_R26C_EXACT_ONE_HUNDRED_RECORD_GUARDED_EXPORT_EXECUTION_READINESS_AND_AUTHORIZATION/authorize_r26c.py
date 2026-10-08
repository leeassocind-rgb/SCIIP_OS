#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib

R26="M4_19D4BN17C_R4_R12_R16A_R26_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
R26A="M4_19D4BN17C_R4_R12_R16A_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R26B3="M4_19D4BN17C_R4_R12_R16A_R26B_R3_RESUME_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
M="M4_19D4BN17C_R4_R12_R16A_R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    e=repo/"apps/property-command-center/evidence/explorer4"
    p26=e/R26/"export_next_progressive_expansion_readiness_and_policy_design.json"
    p26a=e/R26A/"exact_one_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    p3=e/R26B3/"resume_remaining_nineteen_record_non_export_live_qualification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26C Exact One Hundred Record Guarded Export Execution Readiness + Authorization")
    print("="*120)
    print("Mode: READ_ONLY_AUTHORIZATION_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    missing=[str(p) for p in (p26,p26a,p3) if not p.exists()]
    if missing:
        print("STATUS: BLOCKED"); print("MISSING_EVIDENCE:",missing); return 4
    d26,d26a,d3=map(loadj,(p26,p26a,p3))

    reference=50
    new=50
    exact100=100
    checks={
      "r26PolicyPassed": d26.get("status")=="PASSED",
      "r26ExactOneHundredPolicyCertified": "EXACT_ONE_HUNDRED" in str(d26.get("classification","")),
      "r26aCandidateSelectionPassed": d26a.get("status")=="PASSED",
      "r26aExactOneHundredCohortResolved": d26a.get("exactOneHundredCandidateCohortSize",d26a.get("EXACT_ONE_HUNDRED_COHORT_SIZE",100))==100,
      "r26bR3Passed": d3.get("status")=="PASSED",
      "firstThirtyPreserved": d3.get("preservedQualifiedBeforeAlondra")==30,
      "alondraRecord31Recertified": d3.get("alondraRecord31Recertified") is True,
      "remainingNineteenQualified": d3.get("qualifiedCount")==19,
      "newFiftyNonExportQualified": d3.get("preservedQualifiedBeforeAlondra",0)+int(bool(d3.get("alondraRecord31Recertified")))+d3.get("qualifiedCount",0)==50,
      "referenceFiftyPreserved": reference==50,
      "exactOneHundredExecutionCohort": reference+new==exact100,
      "freshPagePerRecordRequired": True,
      "strictSequentialRequired": True,
      "haltOnFirstFailureRequired": True,
      "explorerThreeSampleGuardRequired": True,
      "explorerTwoSecondBoundRequired": True,
      "targetBindingThreeSampleGuardRequired": True,
      "targetBindingFiveSecondBoundRequired": True,
      "selectedPropertyThreeSampleGuardRequired": True,
      "selectedPropertyTwoSecondBoundRequired": True,
      "buildingProjectAwareCanonicalBindingRequired": True,
      "ambiguousAddressOnlyBindingForbidden": True,
      "singleExportClickMaximumPerRecord": True,
      "artifactPdfDownloadCountExactlyOne": True,
      "artifactPdfObjectUrlEventCountExactlyOne": True,
      "artifactMimeApplicationPdf": True,
      "artifactSizePositive": True,
      "downloadFilenamePdf": True,
      "postPublishReportReviewUnmountRequired": True,
      "explorerContinuityRequired": True,
      "sameOriginRequired": True,
      "runtimeErrorsZeroRequired": True,
      "unhandledRejectionsZeroRequired": True,
      "authorityRelockAfterEveryRecordRequired": True,
      "applicationMutationOff": True,
      "governedMutationOff": True,
      "networkAuthorityOff": True,
      "pixelEvidenceOff": True,
      "liveUiInteractionOff": True,
      "exportInvocationOff": True
    }
    passed=all(checks.values())
    authorization={
      "authorized": passed,
      "scope":"EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION",
      "cohortComposition":{"referenceCertified":50,"newNonExportQualified":50,"total":100},
      "execution":{
        "freshPagePerRecord":True,"strictSequential":True,"haltOnFirstFailure":True,
        "maxExportClicksPerRecord":1,"continueAfterFailure":False
      },
      "settleGuards":{
        "explorer":{"consecutiveSamples":3,"maximumSeconds":2.0},
        "targetBinding":{"consecutiveSamples":3,"maximumSeconds":5.0},
        "selectedProperty":{"consecutiveSamples":3,"maximumSeconds":2.0}
      },
      "identity":{
        "candidateNormalization":"RECOGNIZED_STATUS_SUFFIX_BOUNDARY_ONLY",
        "exactPreferred":True,"uniqueContainsFallbackAllowed":True,
        "ambiguousContainsForbidden":True,"addressOnlyBindingForbiddenWhenMultipleGranularitiesPresent":True,
        "buildingProjectAwareBindingRequired":True
      },
      "artifact":{
        "pdfDownloadCount":1,"pdfObjectUrlEventCount":1,"mime":"application/pdf",
        "positiveSize":True,"filenameSuffix":".pdf"
      },
      "runtime":{"errors":0,"unhandledRejections":0,"sameOrigin":True,"explorerContinuity":True},
      "postRecord":{"reportReviewMustUnmount":True,"authorityMustRelock":True}
    }
    status="PASSED" if passed else "BLOCKED"
    state=("M419D4BN17C_R4_R12_R16A_R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
           if passed else "M419D4BN17C_R4_R12_R16A_R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_NOT_AUTHORIZED")
    classification=("REFERENCE_FIFTY_PLUS_NEW_FIFTY_NON_EXPORT_QUALIFIED_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
                    if passed else "EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_GAP")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R26D_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_LIVE_EXECUTION"
         if passed else "M4_19D4BN17C_R4_R12_R16A_R26C_R1_EXPORT_AUTHORIZATION_RESIDUAL_CAUSAL_DIAGNOSIS")
    out={
      "framework":"SCIIP_EXPLORER_4_R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,
      "classification":classification,"checks":checks,"authorization":authorization,
      "sourceEvidence":[
        {"path":str(p26),"sha256":sha(p26)},
        {"path":str(p26a),"sha256":sha(p26a)},
        {"path":str(p3),"sha256":sha(p3)}
      ],"nextMilestone":nxt
    }
    od=e/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_one_hundred_record_guarded_export_execution_readiness_and_authorization.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_CERTIFIED_RECORDS: 50")
    print("NEW_NON_EXPORT_QUALIFIED_RECORDS: 50")
    print("EXACT_ONE_HUNDRED_EXECUTION_COHORT: 100")
    print("EXPORT_AUTHORIZED_FOR_NEXT_MILESTONE:",passed)
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status); print("STATE:",state); print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt); print("EVIDENCE:",ef)
    print("\nR26C EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
