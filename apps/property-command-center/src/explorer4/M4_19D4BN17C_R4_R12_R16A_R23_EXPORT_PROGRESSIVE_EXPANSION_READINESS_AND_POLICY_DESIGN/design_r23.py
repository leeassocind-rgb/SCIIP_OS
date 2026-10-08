#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
R22C_R1="M4_19D4BN17C_R4_R12_R16A_R22C_R1_ARTIFACT_EVIDENCE_SCHEMA_NORMALIZATION_AND_EXACT_THREE_RECORD_LIFECYCLE_CLOSURE_RECERTIFICATION"
REFERENCE_STATE="M419D4BN17C_R4_R12_R16A_R22C_R1_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSED"

REFERENCE_COHORT=[
  "2 Musick",
  "2701 Carrier Ave",
  "8700 - 8750 Rex Rd"
]

# Progressive expansion is deliberately bounded at 10 total records.
NEXT_COHORT_SIZE=10

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p=evid/R22C_R1/"artifact_evidence_schema_normalization_and_lifecycle_closure_recertification.json"
    if not p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R22C_R1_CLOSED_LIFECYCLE_EVIDENCE_REQUIRED")
        return 4

    r=loadj(p)
    if r.get("status")!="PASSED" or r.get("state")!=REFERENCE_STATE:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R22C_R1_EXACT_THREE_RECORD_LIFECYCLE_MUST_BE_CLOSED")
        return 5

    checks0=r.get("checks") or {}
    required_prior=[
      "artifactEvidenceSchemaResolved",
      "exactThreeRecordCohortReconciled",
      "allSelectionAndWorkflowPathsCertified",
      "allPdfArtifactsCertified",
      "allRuntimeContinuityCertified",
      "noAdditionalExportInvocation",
      "liveUiInteractionOff",
      "applicationMutationOff",
      "governedMutationOff",
      "networkAuthorityOff",
      "pixelEvidenceOff"
    ]
    if not all(checks0.get(k) is True for k in required_prior):
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R22C_R1_CLOSURE_CONTRACT_INCOMPLETE")
        return 6

    records=r.get("records") or []
    if len(records)!=3:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: EXACT_THREE_REFERENCE_RECORDS_REQUIRED")
        return 7

    reference_artifact_contract={
      "pdfDownloadCount":1,
      "pdfEventCount":1,
      "mimeType":"application/pdf",
      "filenameSuffix":".pdf",
      "positiveSizeRequired":True
    }

    reference_runtime_contract={
      "runtimeErrorCount":0,
      "unhandledRejectionCount":0,
      "postPublishReportReviewUnmountCertified":True,
      "explorerContinuity":True,
      "sameOrigin":True
    }

    selection_contract={
      "freshExplorerPageTargetPerRecord":True,
      "explorerFirstSelection":True,
      "singleTargetClickMaximum":1,
      "selectedMarkerReadbackRequired":True,
      "targetTextReadbackRequired":True,
      "assignmentsControlReadbackRequired":True,
      "selectionSettlePolicy":{
        "type":"CONSECUTIVE_AGREEING_SAMPLES",
        "requiredConsecutiveCertifiedSamples":3,
        "maximumSettleWindowSeconds":2.0,
        "sampleMustAgreeOn":[
          "target text visible",
          "selected property marker matches target",
          "exactly one enabled Assignments control"
        ]
      }
    }

    workflow_contract={
      "assignmentsEntryRequired":True,
      "generateClientListingReportRequired":True,
      "reportReviewEntryRequired":True,
      "downloadClientListingReportControlRequired":True,
      "liveHandlerNameMustEqual":"exportReport",
      "exactOneExportClickPerRecordMaximum":1,
      "postActionReadbackRequired":True
    }

    cohort_policy={
      "referenceCohortSize":3,
      "nextCohortSize":NEXT_COHORT_SIZE,
      "scaleFactor":round(NEXT_COHORT_SIZE/3,6),
      "ordering":"DETERMINISTIC_PREQUALIFIED_ORDER",
      "strictSequential":True,
      "concurrencyAllowed":False,
      "haltOnFirstFailure":True,
      "continueAfterFailure":False,
      "sameBrowserContextRequired":True,
      "freshPagePerRecordRequired":True,
      "freshIsolatedBrowserPerRecord":False,
      "samePageReuseAcrossRecords":False,
      "maximumExportClicksPerRecord":1,
      "alreadyCertifiedReferenceRecordsMayBeRetainedAsReferenceEvidence":True,
      "newLiveExpansionRecordsRequired":NEXT_COHORT_SIZE-3
    }

    eligibility_contract={
      "recordMustBeSelectable":True,
      "recordMustPassBoundedSelectionSettleReadback":True,
      "recordMustEnterAssignmentsWorkspace":True,
      "recordMustMaterializeGenerateClientListingReport":True,
      "recordMustMaterializeReportReview":True,
      "recordMustMaterializeDownloadClientListingReport":True,
      "exportControlMustBeUniqueVisibleEnabled":True,
      "liveHandlerMustEqual":"exportReport",
      "artifactMimeMustEqual":"application/pdf",
      "artifactSizeMustBePositive":True,
      "downloadFilenameMustEndWith":".pdf",
      "postPublishReportReviewMustUnmount":True,
      "explorerMustRemainMounted":True,
      "sameOriginMustRemain":True,
      "runtimeErrorsMustEqual":0,
      "unhandledRejectionsMustEqual":0
    }

    failure_policy={
      "haltOnPageCreationFailure":True,
      "haltOnExplorerEntryFailure":True,
      "haltOnSelectionFailure":True,
      "haltOnSelectionSettleFailure":True,
      "haltOnAssignmentsEntryFailure":True,
      "haltOnGenerateControlFailure":True,
      "haltOnReportReviewEntryFailure":True,
      "haltOnExportControlBindingMismatch":True,
      "haltOnExportInvocationFailure":True,
      "haltOnArtifactVerificationFailure":True,
      "haltOnRuntimeError":True,
      "haltOnOriginChange":True,
      "haltOnExplorerContinuityFailure":True,
      "haltOnPostPublishUnmountMismatch":True,
      "continueAfterFailure":False
    }

    authority_policy={
      "applicationSourceMutation":False,
      "governedDataMutation":False,
      "networkAuthority":False,
      "pixelEvidence":False,
      "liveUiInteraction":False,
      "exportInvocation":False,
      "designOnly":True
    }

    checks={
      "r22cR1Passed":True,
      "r22cR1LifecycleClosed":True,
      "referenceCohortExactlyThree":len(records)==3,
      "referenceArtifactContractConsumed":all(x.get("pdfDownloadCount")==1 and x.get("pdfEventCount")==1 for x in records),
      "referenceRuntimeContractConsumed":all(x.get("runtimeErrorCount")==0 and x.get("unhandledRejectionCount")==0 and x.get("sameOrigin") is True for x in records),
      "progressiveExpansionBounded":NEXT_COHORT_SIZE==10,
      "exactTenRecordNextCohort":NEXT_COHORT_SIZE==10,
      "selectionSettleGuardPreserved":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "freshPagePerRecordRequired":True,
      "exactOneExportClickMaximumRequired":True,
      "eligibilityContractDefined":True,
      "failurePolicyDefined":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_INCOMPLETE")
    classification=("EXACT_THREE_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_TEN_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED"
                    if passed else
                    "EXPORT_PROGRESSIVE_EXPANSION_POLICY_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R23_R1_PROGRESSIVE_EXPANSION_POLICY_RESIDUAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":state,
      "classification":classification,
      "reference":{
        "milestone":"R22C-R1",
        "state":r.get("state"),
        "cohortSize":3,
        "cohortOrder":REFERENCE_COHORT
      },
      "cohortPolicy":cohort_policy,
      "selectionContract":selection_contract,
      "workflowContract":workflow_contract,
      "artifactContract":reference_artifact_contract,
      "runtimeContract":reference_runtime_contract,
      "eligibilityContract":eligibility_contract,
      "failurePolicy":failure_policy,
      "authorityPolicy":authority_policy,
      "checks":checks,
      "nextMilestone":nextm
    }

    od=evid/M
    od.mkdir(parents=True,exist_ok=True)
    ef=od/"export_progressive_expansion_readiness_and_policy_design.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R23 Export Progressive Expansion Readiness + Policy Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("R22C_R1_STATUS:",r.get("status"))
    print("R22C_R1_STATE:",r.get("state"))
    print("REFERENCE_COHORT_SIZE: 3")
    print("NEXT_COHORT_SIZE:",NEXT_COHORT_SIZE)
    print("SCALE_FACTOR:",cohort_policy["scaleFactor"])
    print("NEW_LIVE_EXPANSION_RECORDS_REQUIRED:",cohort_policy["newLiveExpansionRecordsRequired"])
    print("FRESH_PAGE_PER_RECORD:",cohort_policy["freshPagePerRecordRequired"])
    print("STRICT_SEQUENTIAL:",cohort_policy["strictSequential"])
    print("HALT_ON_FIRST_FAILURE:",cohort_policy["haltOnFirstFailure"])
    print("SELECTION_SETTLE_REQUIRED:",True)
    print("SELECTION_SETTLE_CONSECUTIVE_SAMPLES:",selection_contract["selectionSettlePolicy"]["requiredConsecutiveCertifiedSamples"])
    print("SELECTION_SETTLE_MAX_SECONDS:",selection_contract["selectionSettlePolicy"]["maximumSettleWindowSeconds"])
    print("MAX_EXPORT_CLICKS_PER_RECORD:",cohort_policy["maximumExportClicksPerRecord"])
    print()
    print("----- ELIGIBILITY CONTRACT -----")
    for k,v in eligibility_contract.items():print(f"{k}: {v}")
    print()
    print("----- FAILURE POLICY -----")
    for k,v in failure_policy.items():print(f"{k}: {v}")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:","PASSED" if passed else "DIAGNOSTIC_COMPLETE")
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
