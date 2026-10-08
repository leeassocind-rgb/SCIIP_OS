#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, hashlib

R23F="M4_19D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSURE"
R23F_STATE="M419D4BN17C_R4_R12_R16A_R23F_EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSED"
M="M4_19D4BN17C_R4_R12_R16A_R24_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"
    src=evid/R23F/"exact_ten_record_export_lifecycle_closure.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24 Export Next Progressive Expansion Readiness + Policy Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    if not src.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R23F_EXACT_TEN_LIFECYCLE_CLOSURE_EVIDENCE_REQUIRED")
        return 4

    r=loadj(src)
    r_ok=(
        r.get("status")=="PASSED" and
        r.get("state")==R23F_STATE and
        r.get("classification")=="EXACT_TEN_RECORD_EXPORT_SELECTION_BINDING_WORKFLOW_INVOCATION_ARTIFACT_RUNTIME_LIFECYCLE_CLOSED"
    )
    if not r_ok:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R23F_EXACT_TEN_LIFECYCLE_MUST_BE_CLOSED")
        return 5

    cohort=r.get("cohort") or []
    summary=r.get("closureSummary") or {}
    checks0=r.get("checks") or {}

    reference_size=len(cohort)
    next_size=25
    new_required=next_size-reference_size
    scale_factor=next_size/reference_size if reference_size else None

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
        "recordMustPassSelectedPropertySettleReadback":True,
        "selectedPropertySettleConsecutiveSamples":3,
        "selectedPropertySettleMaximumSeconds":2.0,
        "recordMustEnterAssignmentsWorkspace":True,
        "recordMustMaterializeGenerateClientListingReport":True,
        "recordMustMaterializeReportReview":True,
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
        "r23fPassed":True,
        "r23fLifecycleClosed":True,
        "referenceCohortExactlyTen":reference_size==10,
        "referenceExecutionCertifiedCountTen":summary.get("executionCertifiedCount")==10,
        "referenceArtifactRuntimeCertifiedCountTen":summary.get("artifactRuntimeCertifiedCount")==10,
        "referenceRuntimeErrorsZero":summary.get("runtimeErrorTotal")==0,
        "referenceUnhandledRejectionsZero":summary.get("unhandledRejectionTotal")==0,
        "fiveSecondTargetBindingGuardConsumed":summary.get("targetBindingMaximumSettleSeconds")==5.0,
        "threeConsecutiveTargetBindingSamplesConsumed":summary.get("targetBindingConsecutiveCertifiedSamples")==3,
        "threeConsecutiveExplorerSamplesConsumed":summary.get("explorerConsecutiveCertifiedSamples")==3,
        "singleExportMaximumPerRecordConsumed":summary.get("maximumExportClicksPerRecord")==1,
        "nextExpansionBounded":True,
        "exactTwentyFiveRecordNextCohort":next_size==25,
        "fifteenNewRecordsRequired":new_required==15,
        "freshPagePerRecordRequired":True,
        "strictSequentialRequired":True,
        "haltOnFirstFailureRequired":True,
        "exactOneExportClickMaximumRequired":True,
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
    state=("M419D4BN17C_R4_R12_R16A_R24_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R24_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_INCOMPLETE")
    classification=("EXACT_TEN_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_TWENTY_FIVE_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED"
                    if passed else
                    "EXPORT_NEXT_PROGRESSIVE_EXPANSION_POLICY_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R24_R1_PROGRESSIVE_EXPANSION_POLICY_RESIDUAL_DIAGNOSIS")

    out={
        "framework":"SCIIP_EXPLORER_4_R24_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":state,
        "classification":classification,
        "sourceEvidence":{
            "path":str(src),
            "sha256":hashlib.sha256(src.read_bytes()).hexdigest()
        },
        "referenceCohort":cohort,
        "referenceCohortSize":reference_size,
        "nextCohortSize":next_size,
        "scaleFactor":scale_factor,
        "newLiveExpansionRecordsRequired":new_required,
        "executionPolicy":{
            "freshPagePerRecord":True,
            "strictSequential":True,
            "haltOnFirstFailure":True,
            "maximumExportClicksPerRecord":1,
            "preserveCertifiedBrowserContext":True,
            "samePageReuseAcrossRecords":False,
            "freshIsolatedBrowserPerRecord":False
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
        "nextMilestone":nextm
    }

    od=evid/M
    od.mkdir(parents=True,exist_ok=True)
    ef=od/"export_next_progressive_expansion_readiness_and_policy_design.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print()
    print("R23F_STATUS:",r.get("status"))
    print("R23F_STATE:",r.get("state"))
    print("REFERENCE_COHORT_SIZE:",reference_size)
    print("NEXT_COHORT_SIZE:",next_size)
    print("SCALE_FACTOR:",round(scale_factor,6))
    print("NEW_LIVE_EXPANSION_RECORDS_REQUIRED:",new_required)
    print("FRESH_PAGE_PER_RECORD:",True)
    print("STRICT_SEQUENTIAL:",True)
    print("HALT_ON_FIRST_FAILURE:",True)
    print("EXPLORER_SETTLE_CONSECUTIVE_SAMPLES:",3)
    print("EXPLORER_SETTLE_MAX_SECONDS:",2.0)
    print("TARGET_BINDING_SETTLE_CONSECUTIVE_SAMPLES:",3)
    print("TARGET_BINDING_SETTLE_MAX_SECONDS:",5.0)
    print("SELECTED_PROPERTY_SETTLE_CONSECUTIVE_SAMPLES:",3)
    print("SELECTED_PROPERTY_SETTLE_MAX_SECONDS:",2.0)
    print("MAX_EXPORT_CLICKS_PER_RECORD:",1)

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
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
