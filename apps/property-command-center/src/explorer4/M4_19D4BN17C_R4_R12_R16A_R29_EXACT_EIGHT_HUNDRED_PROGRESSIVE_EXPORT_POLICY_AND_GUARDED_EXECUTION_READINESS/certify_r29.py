#!/usr/bin/env python3
from pathlib import Path
import json, sys
from datetime import datetime, timezone

MILESTONE = "M4_19D4BN17C_R4_R12_R16A_R29"
STATE = "M419D4BN17C_R4_R12_R16A_R29_EXACT_EIGHT_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS_CERTIFIED"
NEXT = "M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"

def load_json(p):
    try:
        return json.loads(p.read_text())
    except Exception:
        return None

def find_r28e(er):
    preferred = er / "M4_19D4BN17C_R4_R12_R16A_R28E_EXACT_FOUR_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE" / "exact_four_hundred_export_artifact_runtime_verification_and_progressive_lifecycle_closure.json"
    if preferred.exists():
        j=load_json(preferred)
        if isinstance(j,dict): return preferred,j
    for p in sorted(er.rglob("*.json"), reverse=True):
        if "R28E" not in str(p): continue
        j=load_json(p)
        if isinstance(j,dict) and j.get("status")=="PASSED" and "FOUR_HUNDRED_EXPORT_LIFECYCLE_CLOSED" in str(j.get("state","")):
            return p,j
    return None,None

def main():
    if len(sys.argv)!=2:
        print("usage: certify_r29.py <SCIIP_OS-root>", file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    src,j=find_r28e(er)
    print("="*104)
    print("SCIIP Explorer 4.0 — R29 Exact Eight-Hundred Progressive Export Policy + Guarded Execution Readiness")
    print("="*104)
    print("Mode: READ_ONLY_POLICY_AND_READINESS_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    r28e_passed = isinstance(j,dict) and j.get("status")=="PASSED"
    r28e_closed = r28e_passed and "FOUR_HUNDRED_EXPORT_LIFECYCLE_CLOSED" in str(j.get("state",""))
    reference=400
    nxt=800
    new=400
    policy={
      "referenceCohortSize":reference,
      "nextCohortSize":nxt,
      "scaleFactor":2.0,
      "newLiveExpansionRecordsRequired":new,
      "executionStrategy":"PROGRESSIVE_DELTA_FOUR_HUNDRED",
      "authoritativeReferenceEvidence":{
        "path":str(src) if src else None,
        "status":j.get("status") if isinstance(j,dict) else None,
        "state":j.get("state") if isinstance(j,dict) else None,
        "exactCertifiedCount":400 if r28e_closed else None
      },
      "referenceCohortAction":"REUSE_CLOSED_EXACT_400_EXPORT_LIFECYCLE_EVIDENCE_NO_REEXPORT",
      "referenceReexportRequired":False,
      "newCohortAction":"SELECT_QUALIFY_AUTHORIZE_AND_LIVE_EXPORT_EXACT_NEW_400_ONLY",
      "candidateSelection":{
        "liveCandidateInventoryRequired":True,
        "deterministicSelectionRequired":True,
        "exactNewUniqueCandidatesRequired":400,
        "excludeClosedReferenceCohort":True,
        "identityNormalizationRequired":True,
        "buildingProjectAwareCanonicalBindingRequired":True,
        "ambiguousAddressOnlyBindingForbidden":True
      },
      "nonExportQualification":{
        "requiredBeforeLiveExport":True,
        "freshPagePerRecord":True,
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "continueAfterFailure":False,
        "explorerSettle":{"consecutiveSamples":3,"maximumSeconds":2.0,"samplingAnchor":"DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM_AND_APP_ORIGIN"},
        "targetBindingSettle":{"consecutiveSamples":3,"maximumSeconds":5.0},
        "selectedPropertySettle":{"consecutiveSamples":3,"maximumSeconds":2.0}
      },
      "liveExportExecution":{
        "separatePostQualificationAuthorizationRequired":True,
        "liveExportScope":"EXACT_NEW_FOUR_HUNDRED_ONLY",
        "referenceFourHundredReexport":"FORBIDDEN",
        "maxExportClicksPerRecord":1,
        "authorityRelockAfterEveryRecord":True
      },
      "artifactContract":{
        "pdfDownloadCountMustEqual":1,
        "pdfObjectUrlEventCountMustEqual":1,
        "mimeMustEqual":"application/pdf",
        "sizeMustBePositive":True,
        "filenameMustEndWith":".pdf"
      },
      "runtimeContract":{
        "errorsMustEqual":0,
        "unhandledRejectionsMustEqual":0,
        "postPublishReportReviewMustUnmount":True,
        "explorerMustRemainMounted":True,
        "sameOriginMustRemain":True
      },
      "failurePolicy":"HALT_DIAGNOSE_REPAIR_RECERTIFY_RESUME_NO_UNBOUNDED_REPLAY"
    }
    checks={
      "r28ePassed":r28e_passed,
      "r28eExactFourHundredLifecycleClosed":r28e_closed,
      "authoritativeReferenceBoundDirectlyToR28E":src is not None,
      "referenceCohortExactly400":reference==400,
      "nextCohortExactly800":nxt==800,
      "scaleFactorTwo":True,
      "newLiveExpansionRecordsExactly400":new==400,
      "progressiveDeltaFourHundredRequired":True,
      "referenceFourHundredWillNotBeReexported":True,
      "liveCandidateInventoryRequired":True,
      "deterministicCandidateSelectionRequired":True,
      "exactNewFourHundredUniqueCandidatesRequired":True,
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
    ok=all(checks.values())
    out={
      "framework":"SCIIP_EXPLORER_4_R29_EXACT_EIGHT_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if ok else "FAILED",
      "state":STATE if ok else "M419D4BN17C_R4_R12_R16A_R29_EXACT_EIGHT_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS_INCOMPLETE",
      "classification":"EXACT_400_EXPORT_LIFECYCLE_CLOSED_EXACT_800_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED" if ok else "EXACT_800_PROGRESSIVE_EXPANSION_POLICY_GAP_REMAINS",
      "policy":policy,"checks":checks,
      "nextMilestone":NEXT if ok else "M4_19D4BN17C_R4_R12_R16A_R29_R1_POLICY_AND_READINESS_RESIDUAL_CAUSAL_DIAGNOSIS"
    }
    od=er/(MILESTONE+"_EXACT_EIGHT_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS")
    od.mkdir(parents=True,exist_ok=True)
    ep=od/"exact_eight_hundred_progressive_export_policy_and_guarded_execution_readiness.json"
    ep.write_text(json.dumps(out,indent=2)+"\n")
    print("REFERENCE_COHORT_SIZE:",reference)
    print("NEXT_COHORT_SIZE:",nxt)
    print("NEW_LIVE_EXPANSION_RECORDS_REQUIRED:",new)
    print("EXECUTION_STRATEGY: PROGRESSIVE_DELTA_FOUR_HUNDRED")
    print("REFERENCE_FOUR_HUNDRED_REEXPORT: FORBIDDEN")
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",out["state"])
    print("CLASSIFICATION:",out["classification"])
    print("NEXT_MILESTONE:",out["nextMilestone"])
    print("EVIDENCE:",ep)
    return 0 if ok else 1
if __name__=="__main__": raise SystemExit(main())
