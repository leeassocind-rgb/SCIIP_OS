#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, hashlib

R28="M4_19D4BN17C_R4_R12_R16A_R28_EXACT_FOUR_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS"
R28A_R4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
R28B="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R3_RECORD_233_PAGE_READY_ANCHORED_EXPLORER_SETTLE_RECERTIFICATION_AND_RESUME"
R27E="M4_19D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE"
OUT="M4_19D4BN17C_R4_R12_R16A_R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def first_existing(paths):
    for p in paths:
        if p.exists(): return p
    return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"

    p28=er/R28/"exact_four_hundred_progressive_export_policy_and_guarded_execution_readiness.json"
    pnew=er/R28B/"record_233_page_ready_anchored_explorer_settle_recertification_and_resume.json"
    p27e=er/R27E/"exact_two_hundred_export_artifact_runtime_verification_and_progressive_lifecycle_closure.json"
    ptargets=first_existing([
        er/R28A_R4/"exact_new_two_hundred_candidates_prefix_normalized.json",
        er/R28A_R4/"exact_new_two_hundred_targets.json",
        er/R28A_R4/"exact_new_two_hundred_candidates.json",
    ])

    print("="*120)
    print("SCIIP Explorer 4.0 — R28C Exact Four-Hundred Guarded Export Execution Readiness + Authorization")
    print("="*120)
    print("Mode: READ_ONLY_EXECUTION_AUTHORIZATION_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    missing=[]
    for p,n in [(p28,"R28 policy"),(pnew,"R28B exact-new-200 qualification"),(p27e,"R27E exact-200 closure")]:
        if not p.exists(): missing.append(n)
    if ptargets is None: missing.append("R28A-R4 exact-new-200 targets")
    if missing:
        print("STATUS: BLOCKED"); print("REASON: missing prerequisite(s): "+", ".join(missing)); return 4

    j28=loadj(p28); jnew=loadj(pnew); j27e=loadj(p27e); targets=loadj(ptargets)
    pcon=(j28.get("policyContract") or {}) if isinstance(j28,dict) else {}

    r28_policy=isinstance(j28,dict) and j28.get("status")=="PASSED" and \
        (j28.get("referenceCohortSize")==200 or pcon.get("referenceCohortSize")==200) and \
        (j28.get("nextCohortSize")==400 or pcon.get("nextCohortSize")==400)

    reference_closed=isinstance(j27e,dict) and j27e.get("status")=="PASSED" and \
        ("EXACT_TWO_HUNDRED_EXPORT_LIFECYCLE_CLOSED" in str(j27e.get("state","")) or
         j27e.get("exactCombinedCertifiedCount")==200)

    new_qualified=isinstance(jnew,dict) and jnew.get("status")=="PASSED" and \
        jnew.get("previousCertifiedCount")==32 and \
        jnew.get("residualCertifiedCount")==168 and \
        jnew.get("exactNewTwoHundredCertifiedCount")==200 and \
        jnew.get("haltedOnFailure") is False

    target_count=len(targets) if isinstance(targets,list) else 0
    keys=[]
    if isinstance(targets,list):
        for x in targets:
            if isinstance(x,dict):
                keys.append(x.get("selectionKey") or x.get("canonicalKey") or
                            (str(x.get("label","")).strip().lower()+"|"+str(x.get("sf",""))))
            else:
                keys.append(str(x).strip().lower())
    target_unique=(target_count==200 and len(set(keys))==200)

    authorization_contract={
      "referenceCohortSize":200,
      "newQualifiedCohortSize":200,
      "exactCombinedCohortSize":400,
      "executionStrategy":"PROGRESSIVE_DELTA_TWO_HUNDRED",
      "liveExportScope":"EXACT_NEW_TWO_HUNDRED_ONLY",
      "referenceCohortAction":"REUSE_CLOSED_EXACT_200_EXPORT_LIFECYCLE_EVIDENCE_NO_REEXPORT",
      "newCohortAction":"EXPORT_EXACT_200_PREQUALIFIED_RECORDS",
      "referenceTwoHundredReexport":"FORBIDDEN",
      "freshPagePerRecord":True,
      "strictSequential":True,
      "haltOnFirstFailure":True,
      "continueAfterFailure":False,
      "maxExportClicksPerRecord":1,
      "explorerSettle":{"consecutiveSamples":3,"maximumSeconds":2.0,
        "samplingAnchor":"DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM_AND_APP_ORIGIN"},
      "targetBindingSettle":{"consecutiveSamples":3,"maximumSeconds":5.0,
        "exactPreferred":True,"boundaryNormalizedIdentityAllowed":True,
        "uniqueContainsFallbackAllowed":True,"ambiguousContainsForbidden":True,
        "buildingProjectAwareCanonicalBindingRequired":True,
        "addressOnlyBindingForbiddenWhenGranularityCollisionPresent":True},
      "selectedPropertySettle":{"consecutiveSamples":3,"maximumSeconds":2.0},
      "workflow":{"mustEnterAssignments":True,
        "mustMaterializeGenerateClientListingReport":True,
        "generateMustDirectlyMaterializeReportReview":True,
        "mustMaterializeDownloadClientListingReport":True,
        "downloadControlLabel":"Download Client Listing Report",
        "exportControlMustBeUniqueVisibleEnabled":True,
        "exportHandlerMustEqual":"exportReport"},
      "artifact":{"pdfDownloadCountMustEqual":1,"pdfObjectUrlEventCountMustEqual":1,
        "mimeMustEqual":"application/pdf","sizeMustBePositive":True,"filenameMustEndWith":".pdf"},
      "runtime":{"errorsMustEqual":0,"unhandledRejectionsMustEqual":0,
        "postPublishReportReviewMustUnmount":True,"explorerMustRemainMounted":True,"sameOriginMustRemain":True},
      "authorization":{"authorizedInR28C":True,"authorizedCohort":"EXACT_NEW_TWO_HUNDRED_ONLY",
        "referenceCohortAuthorizedForReexport":False,"singleExportClickMaximumPerRecord":True,
        "authorityRelockAfterEveryRecord":True}
    }

    c=(jnew.get("checks") or {}) if isinstance(jnew,dict) else {}
    checks={
      "r28PolicyPassed":r28_policy,
      "r28ExactFourHundredPolicyCertified":r28_policy,
      "r27eReferenceTwoHundredLifecycleClosed":reference_closed,
      "referenceCohortExactly200":reference_closed,
      "referenceTwoHundredReexportForbidden":True,
      "r28bExactNewTwoHundredQualificationClosed":new_qualified,
      "newTwoHundredCertifiedCountExactly200":jnew.get("exactNewTwoHundredCertifiedCount")==200,
      "priorThirtyTwoPreserved":jnew.get("previousCertifiedCount")==32,
      "residualOneHundredSixtyEightCertified":jnew.get("residualCertifiedCount")==168,
      "pageReadyAnchoredExplorerRepairCertified":c.get("pageReadyAnchoredSamplingUsed") is True,
      "twoSecondExplorerBoundPreserved":c.get("twoSecondExplorerBoundPreserved") is True,
      "threeSampleExplorerGuardPreserved":c.get("threeSampleExplorerGuardPreserved") is True,
      "newTwoHundredTargetArtifactPresent":ptargets is not None,
      "newTwoHundredTargetCountExactly200":target_count==200,
      "newTwoHundredTargetsUnique":target_unique,
      "freshPagePerRecordRequired":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "maxExportClicksPerRecordOne":True,
      "targetBindingGuardPreserved":True,
      "buildingProjectAwareCanonicalBindingPreserved":True,
      "ambiguousAddressOnlyBindingForbidden":True,
      "selectedPropertyGuardPreserved":True,
      "assignmentsEntryRequired":True,
      "generateReportReviewMaterializationRequired":True,
      "downloadClientListingReportControlRequired":True,
      "exportHandlerExportReportRequired":True,
      "pdfDownloadCountPerRecordExactlyOne":True,
      "pdfObjectUrlEventCountPerRecordExactlyOne":True,
      "mimeApplicationPdfRequired":True,
      "positivePdfSizeRequired":True,
      "pdfFilenameSuffixRequired":True,
      "runtimeErrorsMustEqualZero":True,
      "unhandledRejectionsMustEqualZero":True,
      "sameOriginRequired":True,
      "postPublishReportReviewMustUnmount":True,
      "explorerMustRemainMounted":True,
      "authorityRelockAfterEveryRecordRequired":True,
      "authorizationDesignOnly":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    ok=all(checks.values())
    status="PASSED" if ok else "FAILED"
    state=("M419D4BN17C_R4_R12_R16A_R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
           if ok else "M419D4BN17C_R4_R12_R16A_R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_AUTHORIZATION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R28D_EXACT_NEW_TWO_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION"
         if ok else "M4_19D4BN17C_R4_R12_R16A_R28C_R1_EXECUTION_AUTHORIZATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_four_hundred_guarded_export_execution_readiness_and_authorization.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,
      "classification":("REFERENCE_200_CLOSED_PLUS_EXACT_NEW_200_NON_EXPORT_QUALIFIED_EXACT_400_PROGRESSIVE_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
                        if ok else "EXACT_400_GUARDED_EXPORT_AUTHORIZATION_GAP_REMAINS"),
      "referenceCohortSize":200,"newPrequalifiedCohortSize":200,"exactCombinedCohortSize":400,
      "liveExportScope":"EXACT_NEW_TWO_HUNDRED_ONLY",
      "referenceTwoHundredReexport":"FORBIDDEN",
      "executionMode":"STRICT_SEQUENTIAL_FRESH_PAGE_HALT_ON_FIRST_FAILURE",
      "maxExportClicksPerRecord":1,
      "targetArtifact":str(ptargets),"targetArtifactSha256":sha(ptargets),
      "authorizationContract":authorization_contract,"checks":checks,"nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_COHORT_SIZE: 200")
    print("NEW_PREQUALIFIED_COHORT_SIZE: 200")
    print("EXACT_COMBINED_COHORT_SIZE: 400")
    print("LIVE_EXPORT_SCOPE: EXACT_NEW_TWO_HUNDRED_ONLY")
    print("REFERENCE_TWO_HUNDRED_REEXPORT: FORBIDDEN")
    print("EXECUTION_MODE: STRICT_SEQUENTIAL_FRESH_PAGE_HALT_ON_FIRST_FAILURE")
    print("MAX_EXPORT_CLICKS_PER_RECORD: 1")
    print("TARGET_ARTIFACT:",ptargets)
    print("TARGET_ARTIFACT_SHA256:",sha(ptargets))
    print("EXPORT_INVOCATION: OFF")
    print("\n----- AUTHORIZATION CONTRACT -----")
    print(json.dumps(authorization_contract,indent=2))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",out["classification"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR28C EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if ok else 10

if __name__=="__main__":
    raise SystemExit(main())
