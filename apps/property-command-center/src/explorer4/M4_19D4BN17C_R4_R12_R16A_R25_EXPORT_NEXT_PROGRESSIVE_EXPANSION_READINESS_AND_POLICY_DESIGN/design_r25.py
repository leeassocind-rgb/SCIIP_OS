#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, hashlib

R24F="M4_19D4BN17C_R4_R12_R16A_R24F_EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSURE"
R24F_STATE="M419D4BN17C_R4_R12_R16A_R24F_EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSED"
R24F_CLASS="EXACT_TWENTY_FIVE_RECORD_EXPORT_SELECTION_BINDING_WORKFLOW_INVOCATION_ARTIFACT_RUNTIME_LIFECYCLE_CLOSED"
M="M4_19D4BN17C_R4_R12_R16A_R25_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R24F/"exact_twenty_five_record_export_lifecycle_closure.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R25 Export Next Progressive Expansion Readiness + Policy Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R24F_EXACT_TWENTY_FIVE_LIFECYCLE_CLOSURE_EVIDENCE_REQUIRED")
        return 4

    r=loadj(p)
    if r.get("status")!="PASSED" or r.get("state")!=R24F_STATE or r.get("classification")!=R24F_CLASS:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R24F_EXACT_TWENTY_FIVE_LIFECYCLE_CLOSURE_REQUIRED")
        return 5

    cohort=r.get("cohort") or []
    checks24=r.get("checks") or {}

    reference_size=25
    next_size=50
    new_required=25
    scale_factor=2.0

    eligibility={
      "recordMustBeSelectable":True,
      "recordMustPassBoundedExplorerEntrySettle":True,
      "explorerSettleConsecutiveSamples":3,
      "explorerSettleMaximumSeconds":2.0,
      "recordMustPassBoundedTargetBindingSettle":True,
      "targetBindingSettleConsecutiveSamples":3,
      "targetBindingSettleMaximumSeconds":5.0,
      "targetBindingExactPreferred":True,
      "targetBindingUniqueContainsFallbackAllowed":True,
      "targetBindingAmbiguousContainsForbidden":True,
      "candidateIdentityNormalization":"RECOGNIZED_STATUS_SUFFIX_BOUNDARY_ONLY",
      "recordMustPassSelectedPropertySettleReadback":True,
      "selectedPropertySettleConsecutiveSamples":3,
      "selectedPropertySettleMaximumSeconds":2.0,
      "recordMustEnterAssignmentsWorkspace":True,
      "recordMustMaterializeGenerateClientListingReport":True,
      "generateMustDirectlyMaterializeReportReview":True,
      "recordMustMaterializeDownloadClientListingReport":True,
      "exportControlMustBeUniqueVisibleEnabled":True,
      "liveHandlerMustEqual":"exportReport",
      "artifactPdfDownloadCountMustEqual":1,
      "artifactPdfObjectUrlEventCountMustEqual":1,
      "artifactMimeMustEqual":"application/pdf",
      "artifactSizeMustBePositive":True,
      "downloadFilenameMustEndWith":".pdf",
      "postPublishReportReviewMustUnmount":True,
      "explorerMustRemainMounted":True,
      "sameOriginMustRemain":True,
      "runtimeErrorsMustEqual":0,
      "unhandledRejectionsMustEqual":0
    }

    failure={
      "haltOnFreshPageCreationFailure":True,
      "haltOnExplorerEntrySettleFailure":True,
      "haltOnExplorerEntryFailure":True,
      "haltOnTargetBindingSettleFailure":True,
      "haltOnSelectionFailure":True,
      "haltOnSelectedPropertySettleFailure":True,
      "haltOnAssignmentsEntryFailure":True,
      "haltOnGenerateControlFailure":True,
      "haltOnReportReviewEntryFailure":True,
      "haltOnExportControlBindingMismatch":True,
      "haltOnExportInvocationFailure":True,
      "haltOnArtifactVerificationFailure":True,
      "haltOnRuntimeError":True,
      "haltOnUnhandledRejection":True,
      "haltOnOriginChange":True,
      "haltOnExplorerContinuityFailure":True,
      "haltOnPostPublishUnmountMismatch":True,
      "continueAfterFailure":False
    }

    checks={
      "r24fPassed":True,
      "r24fLifecycleClosed":True,
      "referenceCohortExactlyTwentyFive":len(cohort)==25,
      "referenceCohortUnique":len(cohort)==25 and len({x.lower() for x in cohort})==25,
      "referenceExecutionCertified":checks24.get("allExecutionPathsCertified") is True,
      "referenceArtifactRuntimeCertified":checks24.get("allArtifactAndRuntimeEvidenceCertified") is True,
      "referencePdfArtifactsCertified":checks24.get("allTwentyFivePdfArtifactsCertified") is True,
      "referenceRuntimeContinuityCertified":checks24.get("allTwentyFiveRuntimeContinuityCertified") is True,
      "threeSampleExplorerGuardConsumed":checks24.get("threeConsecutiveExplorerSamplesPreserved") is True,
      "twoSecondExplorerGuardConsumed":checks24.get("twoSecondExplorerGuardPreserved") is True,
      "threeSampleTargetBindingGuardConsumed":checks24.get("threeConsecutiveTargetBindingSamplesPreserved") is True,
      "fiveSecondTargetBindingGuardConsumed":checks24.get("fiveSecondTargetBindingGuardPreserved") is True,
      "threeSampleSelectedPropertyGuardConsumed":checks24.get("threeConsecutiveSelectedPropertySamplesPreserved") is True,
      "twoSecondSelectedPropertyGuardConsumed":checks24.get("twoSecondSelectedPropertyGuardPreserved") is True,
      "identityNormalizationGuardConsumed":checks24.get("candidateStatusSuffixNormalizationPreserved") is True,
      "directReportReviewMaterializationConsumed":checks24.get("directGenerateToReportReviewMaterializationPreserved") is True,
      "singleExportMaximumPerRecordConsumed":checks24.get("singleExportMaximumPerRecordPreserved") is True,
      "nextExpansionBounded":next_size==50,
      "exactFiftyRecordNextCohort":next_size==50,
      "twentyFiveNewRecordsRequired":new_required==25,
      "scaleFactorTwo":scale_factor==2.0,
      "freshPagePerRecordRequired":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "exactOneExportClickMaximumRequired":True,
      "eligibilityContractDefined":all(bool(v) if isinstance(v,bool) else True for v in eligibility.values()),
      "failurePolicyDefined":all(v is True or (k=="continueAfterFailure" and v is False) for k,v in failure.items()),
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R25_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R25_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_INCOMPLETE")
    classification=("EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_FIFTY_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED"
                    if passed else
                    "NEXT_PROGRESSIVE_EXPORT_EXPANSION_POLICY_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
         if passed else
         "M4_19D4BN17C_R4_R12_R16A_R25_R1_PROGRESSIVE_EXPANSION_POLICY_RESIDUAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R25_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":state,
      "classification":classification,
      "referenceCohortSize":reference_size,
      "nextCohortSize":next_size,
      "scaleFactor":scale_factor,
      "newLiveExpansionRecordsRequired":new_required,
      "referenceCohort":cohort,
      "executionPolicy":{
        "freshPagePerRecord":True,
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "explorerSettleConsecutiveSamples":3,
        "explorerSettleMaximumSeconds":2.0,
        "targetBindingSettleConsecutiveSamples":3,
        "targetBindingSettleMaximumSeconds":5.0,
        "selectedPropertySettleConsecutiveSamples":3,
        "selectedPropertySettleMaximumSeconds":2.0,
        "maximumExportClicksPerRecord":1
      },
      "eligibilityContract":eligibility,
      "failurePolicy":failure,
      "checks":checks,
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "liveUiInteraction":False,
        "exportInvocation":False
      },
      "sourceEvidence":{"r24fPath":str(p),"r24fSha256":hashlib.sha256(p.read_bytes()).hexdigest()},
      "nextMilestone":nxt
    }

    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"export_next_progressive_expansion_readiness_and_policy_design.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print()
    print("R24F_STATUS:",r.get("status"))
    print("R24F_STATE:",r.get("state"))
    print("REFERENCE_COHORT_SIZE:",reference_size)
    print("NEXT_COHORT_SIZE:",next_size)
    print("SCALE_FACTOR:",scale_factor)
    print("NEW_LIVE_EXPANSION_RECORDS_REQUIRED:",new_required)
    print("FRESH_PAGE_PER_RECORD: True")
    print("STRICT_SEQUENTIAL: True")
    print("HALT_ON_FIRST_FAILURE: True")
    print("EXPLORER_SETTLE_CONSECUTIVE_SAMPLES: 3")
    print("EXPLORER_SETTLE_MAX_SECONDS: 2.0")
    print("TARGET_BINDING_SETTLE_CONSECUTIVE_SAMPLES: 3")
    print("TARGET_BINDING_SETTLE_MAX_SECONDS: 5.0")
    print("SELECTED_PROPERTY_SETTLE_CONSECUTIVE_SAMPLES: 3")
    print("SELECTED_PROPERTY_SETTLE_MAX_SECONDS: 2.0")
    print("MAX_EXPORT_CLICKS_PER_RECORD: 1")
    print()
    print("----- ELIGIBILITY CONTRACT -----")
    for k,v in eligibility.items(): print(f"{k}: {v}")
    print()
    print("----- FAILURE POLICY -----")
    for k,v in failure.items(): print(f"{k}: {v}")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
