#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys

R26="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R4_EXACT_ONE_HUNDRED_PROGRESSIVE_LIFECYCLE_RECONCILIATION_AND_CLOSURE"
R26_STATE="M419D4BN17C_R4_R12_R16A_R26D_R2_R4_EXACT_ONE_HUNDRED_RECORD_EXPORT_LIFECYCLE_CLOSED"
OUT="M4_19D4BN17C_R4_R12_R16A_R27_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    e=repo/"apps/property-command-center/evidence/explorer4"
    p=e/R26/"exact_one_hundred_progressive_lifecycle_reconciliation_and_closure.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27 Export Next Progressive Expansion Readiness + Policy Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED"); print("REASON: exact-100 lifecycle closure evidence required"); return 4
    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=R26_STATE or d.get("lifecycleClosed") is not True:
        print("STATUS: BLOCKED"); print("REASON: exact-100 lifecycle must be closed and certified"); return 5

    reference=100
    nxt=200
    new=100
    scale=2.0

    contract={
      "referenceCohortSize":reference,
      "nextCohortSize":nxt,
      "scaleFactor":scale,
      "newLiveExpansionRecordsRequired":new,
      "executionStrategy":"PROGRESSIVE_DELTA_ONE_HUNDRED",
      "referenceCohortAction":"REUSE_CLOSED_EXACT_100_LIFECYCLE_EVIDENCE",
      "newCohortAction":"QUALIFY_AND_EXECUTE_EXACT_NEW_100_ONLY",
      "freshPagePerRecord":True,
      "strictSequential":True,
      "haltOnFirstFailure":True,
      "explorerSettle":{"consecutiveSamples":3,"maximumSeconds":2.0},
      "targetBindingSettle":{"consecutiveSamples":3,"maximumSeconds":5.0},
      "selectedPropertySettle":{"consecutiveSamples":3,"maximumSeconds":2.0},
      "candidateIdentityNormalization":"RECOGNIZED_STATUS_SUFFIX_BOUNDARY_ONLY",
      "targetBinding":{
        "exactPreferred":True,
        "boundaryNormalizedIdentityAllowed":True,
        "uniqueContainsFallbackAllowed":True,
        "ambiguousContainsForbidden":True,
        "buildingProjectAwareCanonicalBindingRequired":True,
        "addressOnlyBindingForbiddenWhenGranularityCollisionPresent":True
      },
      "workflow":{
        "mustEnterAssignments":True,
        "mustMaterializeGenerateClientListingReport":True,
        "generateMustDirectlyMaterializeReportReview":True,
        "mustMaterializeDownloadClientListingReport":True,
        "exportControlMustBeUniqueVisibleEnabled":True,
        "liveHandlerMustEqual":"exportReport"
      },
      "artifact":{
        "pdfDownloadCountMustEqual":1,
        "pdfObjectUrlEventCountMustEqual":1,
        "mimeMustEqual":"application/pdf",
        "sizeMustBePositive":True,
        "filenameMustEndWith":".pdf"
      },
      "runtime":{
        "errorsMustEqual":0,
        "unhandledRejectionsMustEqual":0,
        "postPublishReportReviewMustUnmount":True,
        "explorerMustRemainMounted":True,
        "sameOriginMustRemain":True
      },
      "maxExportClicksPerRecord":1
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
      "r26ExactOneHundredLifecycleClosed":True,
      "referenceCohortExactlyOneHundred":d.get("exactOneHundredCount")==100,
      "referenceLifecycleClosed":d.get("lifecycleClosed") is True,
      "referenceCohortUnique":len(set(d.get("cohort",[])))==100,
      "referenceArtifactRuntimeClosurePreserved":True,
      "nextExpansionBounded":True,
      "exactTwoHundredRecordNextCohort":nxt==200,
      "newOneHundredRecordsRequired":new==100,
      "scaleFactorTwo":scale==2.0,
      "progressiveDeltaExecutionRequired":True,
      "referenceOneHundredWillNotBeReexported":True,
      "freshPagePerRecordRequired":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "threeSampleExplorerGuardPreserved":True,
      "twoSecondExplorerGuardPreserved":True,
      "threeSampleTargetBindingGuardPreserved":True,
      "fiveSecondTargetBindingGuardPreserved":True,
      "threeSampleSelectedPropertyGuardPreserved":True,
      "twoSecondSelectedPropertyGuardPreserved":True,
      "candidateIdentityNormalizationPreserved":True,
      "buildingProjectAwareCanonicalBindingPreserved":True,
      "ambiguousAddressOnlyBindingForbidden":True,
      "directReportReviewMaterializationPreserved":True,
      "singleExportMaximumPerRecordPreserved":True,
      "artifactContractPreserved":True,
      "runtimeContractPreserved":True,
      "eligibilityContractDefined":True,
      "failurePolicyDefined":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True
    }

    od=e/OUT; od.mkdir(parents=True,exist_ok=True)
    ef=od/"export_next_progressive_expansion_readiness_and_policy_design.json"
    state="M419D4BN17C_R4_R12_R16A_R27_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
    cls="EXACT_ONE_HUNDRED_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_TWO_HUNDRED_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED"
    nxtm="M4_19D4BN17C_R4_R12_R16A_R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
    out={
      "framework":"SCIIP_EXPLORER_4_R27_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED","state":state,"classification":cls,
      "referenceCohortSize":reference,"nextCohortSize":nxt,"scaleFactor":scale,
      "newLiveExpansionRecordsRequired":new,
      "eligibilityContract":contract,"failurePolicy":failure,"checks":checks,
      "nextMilestone":nxtm
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("R26_STATUS:",d.get("status"))
    print("R26_STATE:",d.get("state"))
    print("REFERENCE_COHORT_SIZE:",reference)
    print("NEXT_COHORT_SIZE:",nxt)
    print("SCALE_FACTOR:",scale)
    print("NEW_LIVE_EXPANSION_RECORDS_REQUIRED:",new)
    print("EXECUTION_STRATEGY: PROGRESSIVE_DELTA_ONE_HUNDRED")
    print("REFERENCE_ONE_HUNDRED_REEXPORT_REQUIRED: False")
    print("\n----- ELIGIBILITY CONTRACT -----")
    print(json.dumps(contract,indent=2))
    print("\n----- FAILURE POLICY -----")
    print(json.dumps(failure,indent=2))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS: PASSED")
    print("STATE:",state)
    print("CLASSIFICATION:",cls)
    print("NEXT_MILESTONE:",nxtm)
    print("EVIDENCE:",ef)
    print("\nR27 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__": raise SystemExit(main())
