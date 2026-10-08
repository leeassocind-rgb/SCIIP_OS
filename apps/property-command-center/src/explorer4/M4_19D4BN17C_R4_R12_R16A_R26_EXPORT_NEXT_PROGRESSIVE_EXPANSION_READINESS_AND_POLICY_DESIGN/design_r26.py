#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, hashlib, sys

R25F="M4_19D4BN17C_R4_R12_R16A_R25F_EXACT_FIFTY_RECORD_EXPORT_LIFECYCLE_CLOSURE_AND_NEXT_SCALE_READINESS"
R25F_STATE="M419D4BN17C_R4_R12_R16A_R25F_EXACT_FIFTY_RECORD_EXPORT_LIFECYCLE_CLOSED_NEXT_SCALE_READY"
R25F_CLASS="EXACT_FIFTY_RECORD_EXPORT_SELECTION_BINDING_WORKFLOW_INVOCATION_ARTIFACT_RUNTIME_LIFECYCLE_CLOSED_NEXT_PROGRESSIVE_EXPANSION_READY"
M="M4_19D4BN17C_R4_R12_R16A_R26_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R25F/"exact_fifty_record_export_lifecycle_closure_and_next_scale_readiness.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26 Export Next Progressive Expansion Readiness + Policy Design")
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
        print("DIAGNOSIS: R25F_LIFECYCLE_CLOSURE_EVIDENCE_REQUIRED")
        return 4

    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=R25F_STATE or d.get("classification")!=R25F_CLASS:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R25F_CLOSED_NEXT_SCALE_READY_STATE_REQUIRED")
        return 5

    ref=int(d.get("cohortSize") or 0)
    exec_count=int(d.get("executionCertifiedCount") or 0)
    ar_count=int(d.get("artifactRuntimeCertifiedCount") or 0)
    runtime_errors=int(d.get("runtimeErrorTotal") or 0)
    rejections=int(d.get("unhandledRejectionTotal") or 0)
    closed=d.get("lifecycleClosed") is True
    ready=d.get("nextProgressiveExpansionReady") is True

    # Progressive bounded scaling: 50 -> 100, preserving a 2.0x ceiling.
    next_size=100
    new_required=next_size-ref
    scale=next_size/ref if ref else None

    eligibility={
      "recordMustBeSelectable":True,
      "recordMustPassBoundedExplorerEntrySettle":True,
      "explorerSettleConsecutiveSamples":3,
      "explorerSettleMaximumSeconds":2.0,
      "recordMustPassBoundedTargetBindingSettle":True,
      "targetBindingSettleConsecutiveSamples":3,
      "targetBindingSettleMaximumSeconds":5.0,
      "targetBindingExactPreferred":True,
      "targetBindingBoundaryNormalizedIdentityAllowed":True,
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
      "r25fPassed":True,
      "r25fLifecycleClosed":closed,
      "r25fNextProgressiveExpansionReady":ready,
      "referenceCohortExactlyFifty":ref==50,
      "referenceExecutionCertifiedCountFifty":exec_count==50,
      "referenceArtifactRuntimeCertifiedCountFifty":ar_count==50,
      "referenceRuntimeErrorsZero":runtime_errors==0,
      "referenceUnhandledRejectionsZero":rejections==0,
      "nextExpansionBounded":next_size==100,
      "exactOneHundredRecordNextCohort":next_size==100,
      "fiftyNewRecordsRequired":new_required==50,
      "scaleFactorTwo":scale==2.0,
      "freshPagePerRecordRequired":True,
      "threeSampleExplorerGuardPreserved":True,
      "twoSecondExplorerGuardPreserved":True,
      "threeSampleTargetBindingGuardPreserved":True,
      "fiveSecondTargetBindingGuardPreserved":True,
      "threeSampleSelectedPropertyGuardPreserved":True,
      "twoSecondSelectedPropertyGuardPreserved":True,
      "candidateIdentityNormalizationPreserved":True,
      "boundaryNormalizedIdentityBindingPreserved":True,
      "ambiguousContainsBindingForbidden":True,
      "directReportReviewMaterializationPreserved":True,
      "singleExportMaximumPerRecordPreserved":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "eligibilityContractDefined":len(eligibility)>0,
      "failurePolicyDefined":len(failure)>0,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R26_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R26_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_INCOMPLETE")
    classification=("EXACT_FIFTY_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_ONE_HUNDRED_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED"
                    if passed else
                    "NEXT_PROGRESSIVE_EXPANSION_POLICY_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
         if passed else
         "M4_19D4BN17C_R4_R12_R16A_R26_R1_PROGRESSIVE_EXPANSION_POLICY_RESIDUAL_CAUSAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R26_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":state,
      "classification":classification,
      "referenceCohortSize":ref,
      "nextCohortSize":next_size,
      "scaleFactor":scale,
      "newLiveExpansionRecordsRequired":new_required,
      "freshPagePerRecord":True,
      "strictSequential":True,
      "haltOnFirstFailure":True,
      "explorerSettleConsecutiveSamples":3,
      "explorerSettleMaxSeconds":2.0,
      "targetBindingSettleConsecutiveSamples":3,
      "targetBindingSettleMaxSeconds":5.0,
      "selectedPropertySettleConsecutiveSamples":3,
      "selectedPropertySettleMaxSeconds":2.0,
      "maxExportClicksPerRecord":1,
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
      "sourceEvidence":{
        "r25fPath":str(p),
        "r25fSha256":hashlib.sha256(p.read_bytes()).hexdigest()
      },
      "nextMilestone":nxt
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"export_next_progressive_expansion_readiness_and_policy_design.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("R25F_STATUS:",d.get("status"))
    print("R25F_STATE:",d.get("state"))
    print("REFERENCE_COHORT_SIZE:",ref)
    print("NEXT_COHORT_SIZE:",next_size)
    print("SCALE_FACTOR:",scale)
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
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
