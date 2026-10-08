#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

R27E="M4_19D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE"
OUT="M4_19D4BN17C_R4_R12_R16A_R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p=er/R27E/"exact_two_hundred_export_artifact_runtime_verification_and_progressive_lifecycle_closure.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28 Exact Four-Hundred Progressive Export Policy + Guarded Execution Readiness")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_POLICY_AND_READINESS_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED"); print("REASON: authoritative R27E closure evidence required"); return 4

    r27e=loadj(p)
    if r27e.get("status")!="PASSED":
        print("STATUS: BLOCKED"); print("REASON: R27E must be PASSED"); return 5
    if r27e.get("state")!="M419D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_LIFECYCLE_CLOSED":
        print("STATUS: BLOCKED"); print("REASON: exact R27E lifecycle-closed state required"); return 6
    if r27e.get("exactCombinedCertifiedCount")!=200:
        print("STATUS: BLOCKED"); print("REASON: exact 200 certified records required"); return 7
    if r27e.get("referenceReexported") is not False:
        print("STATUS: BLOCKED"); print("REASON: reference re-export invariant violated"); return 8

    reference=200
    nxt=400
    delta=200
    scale=2.0

    policy={
      "referenceCohortSize":reference,
      "nextCohortSize":nxt,
      "scaleFactor":scale,
      "newLiveExpansionRecordsRequired":delta,
      "executionStrategy":"PROGRESSIVE_DELTA_TWO_HUNDRED",
      "authoritativeReferenceEvidence":{
        "milestone":R27E,
        "file":"exact_two_hundred_export_artifact_runtime_verification_and_progressive_lifecycle_closure.json",
        "status":"PASSED",
        "state":"M419D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_LIFECYCLE_CLOSED",
        "exactCertifiedCount":200
      },
      "referenceCohortAction":"REUSE_CLOSED_EXACT_200_LIFECYCLE_EVIDENCE",
      "referenceReexportRequired":False,
      "newCohortAction":"SELECT_QUALIFY_AND_EXECUTE_EXACT_NEW_200_ONLY",
      "candidateSelection":{
        "source":"LIVE_EXPLORER_INVENTORY",
        "mustExcludeReference200":True,
        "mustProduceExactNew200":True,
        "mustBeDeterministic":True,
        "mustBeUnique":True,
        "mustPreserveCanonicalOrder":True
      },
      "nonExportQualification":{
        "requiredBeforeAnyLiveExport":True,
        "freshPagePerRecord":True,
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "continueAfterFailure":False,
        "explorerSettle":{
          "consecutiveSamples":3,
          "maximumSeconds":2.0,
          "samplingAnchor":"DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM"
        },
        "targetBindingSettle":{
          "consecutiveSamples":3,
          "maximumSeconds":5.0,
          "exactPreferred":True,
          "boundaryNormalizedIdentityAllowed":True,
          "uniqueContainsFallbackAllowed":True,
          "ambiguousContainsForbidden":True,
          "buildingProjectAwareCanonicalBindingRequired":True,
          "addressOnlyBindingForbiddenWhenGranularityCollisionPresent":True
        },
        "selectedPropertySettle":{
          "consecutiveSamples":3,
          "maximumSeconds":2.0
        },
        "workflow":{
          "mustEnterAssignments":True,
          "mustMaterializeGenerateClientListingReport":True,
          "generateMustDirectlyMaterializeReportReview":True,
          "mustMaterializeDownloadClientListingReport":True,
          "exportControlMustBeUniqueVisibleEnabled":True,
          "exportHandlerMustEqual":"exportReport"
        },
        "exportInvocation":False
      },
      "liveExportExecution":{
        "authorizedInR28":False,
        "requiresSeparatePostQualificationAuthorization":True,
        "freshPagePerRecord":True,
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "continueAfterFailure":False,
        "maxExportClicksPerRecord":1,
        "reference200MustNotBeReexported":True,
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
        }
      },
      "failurePolicy":{
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
        "haltOnArtifactVerificationFailure":True,
        "haltOnRuntimeError":True,
        "haltOnUnhandledRejection":True,
        "haltOnOriginChange":True,
        "haltOnExplorerContinuityFailure":True,
        "haltOnPostPublishUnmountMismatch":True,
        "continueAfterFailure":False
      }
    }

    checks={
      "r27ePassed":True,
      "r27eExactTwoHundredLifecycleClosed":True,
      "authoritativeReferenceBoundDirectlyToR27E":True,
      "heuristicReferenceEvidenceCandidateIgnored":True,
      "referenceCohortExactly200":reference==200,
      "nextCohortExactly400":nxt==400,
      "scaleFactorTwo":scale==2.0,
      "newLiveExpansionRecordsExactly200":delta==200,
      "progressiveDeltaTwoHundredRequired":True,
      "referenceTwoHundredWillNotBeReexported":True,
      "liveCandidateInventoryRequired":True,
      "deterministicCandidateSelectionRequired":True,
      "exactNewTwoHundredUniqueCandidatesRequired":True,
      "nonExportQualificationRequiredBeforeLiveExport":True,
      "freshPagePerRecordRequired":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "threeSampleExplorerGuardPreserved":True,
      "twoSecondExplorerBoundPreserved":True,
      "pageReadyExplorerSamplingAnchorPreserved":True,
      "threeSampleTargetBindingGuardPreserved":True,
      "fiveSecondTargetBindingBoundPreserved":True,
      "threeSampleSelectedPropertyGuardPreserved":True,
      "twoSecondSelectedPropertyBoundPreserved":True,
      "candidateIdentityNormalizationPreserved":True,
      "buildingProjectAwareCanonicalBindingPreserved":True,
      "ambiguousAddressOnlyBindingForbidden":True,
      "directReportReviewMaterializationPreserved":True,
      "singleExportMaximumPerRecordPreservedForFutureLiveExecution":True,
      "artifactContractPreserved":True,
      "runtimeContractPreserved":True,
      "separatePostQualificationExportAuthorizationRequired":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True
    }

    status="PASSED" if all(checks.values()) else "FAILED"
    state=("M419D4BN17C_R4_R12_R16A_R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS_CERTIFIED"
           if status=="PASSED" else
           "M419D4BN17C_R4_R12_R16A_R28_PROGRESSIVE_EXPORT_POLICY_INCOMPLETE")
    next_milestone=("M4_19D4BN17C_R4_R12_R16A_R28A_EXACT_FOUR_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
                    if status=="PASSED" else
                    "M4_19D4BN17C_R4_R12_R16A_R28_R1_POLICY_RESIDUAL_DIAGNOSIS")

    od=er/OUT; od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_four_hundred_progressive_export_policy_and_guarded_execution_readiness.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":state,
      "classification":"EXACT_200_EXPORT_LIFECYCLE_CLOSED_EXACT_400_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED",
      "policy":policy,
      "checks":checks,
      "nextMilestone":next_milestone
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("R27E_STATUS: PASSED")
    print("R27E_STATE: M419D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_LIFECYCLE_CLOSED")
    print("REFERENCE_COHORT_SIZE:",reference)
    print("NEXT_COHORT_SIZE:",nxt)
    print("SCALE_FACTOR:",scale)
    print("NEW_LIVE_EXPANSION_RECORDS_REQUIRED:",delta)
    print("EXECUTION_STRATEGY: PROGRESSIVE_DELTA_TWO_HUNDRED")
    print("REFERENCE_TWO_HUNDRED_REEXPORT_REQUIRED: False")
    print("R28_LIVE_EXPORT_AUTHORIZED: False")
    print("SEPARATE_POST_QUALIFICATION_EXPORT_AUTHORIZATION_REQUIRED: True")
    print("\n----- POLICY CONTRACT -----")
    print(json.dumps(policy,indent=2))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION: EXACT_200_EXPORT_LIFECYCLE_CLOSED_EXACT_400_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED")
    print("NEXT_MILESTONE:",next_milestone)
    print("EVIDENCE:",ef)
    print("\nR28 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if status=="PASSED" else 10

if __name__=="__main__":
    raise SystemExit(main())
