#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,re

M="M4_19D4BN17C_R4_R12_R16A_R22_EXPORT_BOUNDED_MICRO_COHORT_EXPANSION_READINESS_AND_DESIGN"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R6_SINGLE_RECORD_EXPORT_LIFECYCLE_CLOSURE"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    pp=evid/PREV/"single_record_export_lifecycle_closure.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R6_EXPORT_LIFECYCLE_CLOSURE_EVIDENCE_REQUIRED")
        return 4

    prev=loadj(pp)
    expected_state="M419D4BN17C_R4_R12_R16A_R21_R6_SINGLE_RECORD_EXPORT_LIFECYCLE_CLOSED"
    if prev.get("status")!="PASSED" or prev.get("state")!=expected_state:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R6_SINGLE_RECORD_EXPORT_LIFECYCLE_MUST_BE_CLOSED")
        return 5

    # Preserve the certified single-record mechanics as hard policy invariants.
    invariants={
        "certifiedControlText":"Download Client Listing Report",
        "certifiedHandlerName":"exportReport",
        "certifiedMimeType":"application/pdf",
        "freshPagePerRecordRequired":True,
        "preserveSingleCertifiedBrowserContext":True,
        "samePageReuseAcrossRecords":False,
        "freshIsolatedBrowserPerRecord":False,
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "readAfterActionRequired":True,
        "selectedRecordReadbackRequired":True,
        "reportReviewReadbackRequired":True,
        "artifactReadbackRequired":True,
        "exactOneExportClickPerRecord":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    # Candidate cohort is deliberately tiny: exact-three, matching the already-certified
    # interaction micro-cohort used for Compare / Command / Analyze-Present.
    cohort_size=3
    ordering=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

    # Eligibility is conservative because Export is tied to report-review availability.
    eligibility={
        "recordMustBeSelectable":True,
        "recordMustEnterAssignmentsWorkspace":True,
        "recordMustMaterializeGenerateClientListingReport":True,
        "recordMustMaterializeDownloadClientListingReport":True,
        "exportControlMustBeUniqueVisibleEnabled":True,
        "liveHandlerMustEqual":"exportReport",
        "artifactMimeMustEqual":"application/pdf",
        "artifactSizeMustBePositive":True,
        "downloadFilenameMustEndWith":".pdf",
        "sameOriginMustRemain":True,
        "runtimeErrorsMustEqual":0,
        "unhandledRejectionsMustEqual":0
    }

    failure_policy={
        "haltOnSelectionFailure":True,
        "haltOnAssignmentsEntryFailure":True,
        "haltOnGenerateControlFailure":True,
        "haltOnReportReviewEntryFailure":True,
        "haltOnExportControlBindingMismatch":True,
        "haltOnExportInvocationFailure":True,
        "haltOnArtifactVerificationFailure":True,
        "haltOnRuntimeError":True,
        "haltOnOriginChange":True,
        "haltOnShellContinuityFailure":True,
        "continueAfterFailure":False
    }

    lifecycle={
        "phase1":"fresh Explorer page target in preserved certified browser context",
        "phase2":"select exact target record and read back selected-property identity",
        "phase3":"enter Assignments workspace and verify assignment context",
        "phase4":"materialize Generate Client Listing Report",
        "phase5":"enter report review and materialize Download Client Listing Report",
        "phase6":"verify exact React exportReport handler binding",
        "phase7":"invoke exactly one Export click",
        "phase8":"verify exactly one PDF output signal, positive size, filename, clean runtime",
        "phase9":"close page target before advancing to next record"
    }

    checks={
        "r21R6Passed":prev.get("status")=="PASSED",
        "r21R6StateClosed":prev.get("state")==expected_state,
        "singleRecordLifecycleClassificationConsumed":prev.get("classification")=="SINGLE_RECORD_EXPORT_DISCOVERY_MATERIALIZATION_BINDING_INVOCATION_ARTIFACT_VERIFICATION_LIFECYCLE_CLOSED",
        "boundedMicroCohortRequired":True,
        "exactThreeRecordMicroCohort":cohort_size==3,
        "freshPagePerRecordSameBrowserRequired":invariants["freshPagePerRecordRequired"],
        "strictSequentialRequired":invariants["strictSequential"],
        "haltOnFirstFailureRequired":invariants["haltOnFirstFailure"],
        "selectedRecordReadbackRequired":invariants["selectedRecordReadbackRequired"],
        "artifactReadbackRequired":invariants["artifactReadbackRequired"],
        "exactOneExportClickPerRecordRequired":invariants["exactOneExportClickPerRecord"],
        "eligibilityContractDefined":bool(eligibility),
        "failurePolicyDefined":bool(failure_policy),
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True,
        "liveUiInteractionOff":True
    }

    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R16A_R22_EXPORT_BOUNDED_MICRO_COHORT_EXPANSION_READINESS_CERTIFIED"
        cls="SINGLE_RECORD_EXPORT_CLOSED_EXACT_THREE_RECORD_BOUNDED_EXPANSION_POLICY_CERTIFIED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R22A_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_PREAUTHORIZATION_AND_TARGET_QUALIFICATION"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R16A_R22_EXPORT_BOUNDED_EXPANSION_READINESS_INCOMPLETE"
        cls="EXPORT_BOUNDED_EXPANSION_POLICY_RECONCILIATION_INCOMPLETE"
        nxt=None

    out=evid/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"export_bounded_micro_cohort_expansion_readiness_and_design.json"

    data={
        "framework":"SCIIP_EXPLORER_4_R22_EXPORT_BOUNDED_MICRO_COHORT_EXPANSION_READINESS_AND_DESIGN",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":state,
        "classification":cls,
        "referenceLifecycle":{
            "sourceMilestone":"R21-R6",
            "closedState":prev.get("state"),
            "closedClassification":prev.get("classification")
        },
        "cohort":{
            "size":cohort_size,
            "ordering":ordering,
            "orderingPolicy":"DETERMINISTIC_FIXED_ORDER",
            "executionPolicy":"STRICT_SEQUENTIAL"
        },
        "certifiedInvariants":invariants,
        "eligibilityContract":eligibility,
        "failurePolicy":failure_policy,
        "perRecordLifecycle":lifecycle,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "liveUiInteraction":False,
            "exportInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22 Export Bounded Micro-Cohort Expansion Readiness + Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("R21_R6_STATUS:",prev.get("status"))
    print("R21_R6_STATE:",prev.get("state"))
    print("REFERENCE_CLASSIFICATION:",prev.get("classification"))
    print("COHORT_SIZE:",cohort_size)
    print("COHORT_ORDER:",ordering)
    print("CERTIFIED_BROWSER_CONTEXT: PRESERVE_SINGLE_CERTIFIED_BROWSER_CONTEXT")
    print("CERTIFIED_PAGE_POLICY: CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD")
    print("SAME_PAGE_REUSE_ACROSS_RECORDS: False")
    print("FRESH_ISOLATED_BROWSER_PER_RECORD: False")
    print("STRICT_SEQUENTIAL: True")
    print("HALT_ON_FIRST_FAILURE: True")
    print("EXACT_ONE_EXPORT_CLICK_PER_RECORD: True")
    print("CLASSIFICATION:",cls)

    print("\n----- ELIGIBILITY CONTRACT -----")
    for k,v in eligibility.items():
        print(f"{k}: {v}")

    print("\n----- FAILURE POLICY -----")
    for k,v in failure_policy.items():
        print(f"{k}: {v}")

    print("\n----- CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
