#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json

M="M4_19D4BN17C_R4_R12_R13A_R3_R2_CLASSIFICATION_RECONCILIATION_AND_LIVE_SELECTION_REPRODUCIBILITY_CERTIFICATION"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r2p=ev/"M4_19D4BN17C_R4_R12_R13A_R2_FRESH_RUNTIME_TARGET_SELECTED_PROPERTY_REPRODUCIBILITY_AND_COMPARE_COHORT_ISOLATION_DIAGNOSIS"/"fresh_runtime_target_selected_property_reproducibility_and_compare_cohort_isolation_diagnosis.json"
    if not r2p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R13A_R2_EVIDENCE_REQUIRED")
        return 4

    r2=fj(r2p)
    s=r2.get("summary",{})
    probe_results=r2.get("probeResults",[])

    reused=s.get("probeReusedCertified")
    same=s.get("probeSameBrowserFreshPageCertified")
    fresh=s.get("probeFreshIsolatedBrowserCertified")
    control_fresh=s.get("controlFreshIsolatedBrowserCertified")

    fresh_records=[x for x in probe_results if x.get("label")=="FRESH_ISOLATED_BROWSER"]
    fresh_observed=bool(fresh_records and fresh_records[0].get("searchInputFound") is not None)

    unsupported_property_specific = (
        r2.get("classification")=="PROPERTY_SPECIFIC_CLICK_TARGET_GAP"
        and reused is True
        and same is True
        and fresh is not True
        and not fresh_observed
    )

    live_reproducible = reused is True and same is True
    isolated_branch_state = (
        "CERTIFIED" if fresh is True
        else "OBSERVED_FAILED" if fresh_observed
        else "UNOBSERVED_OR_INCOMPLETE"
    )

    if live_reproducible:
        reconciled="LIVE_SELECTION_REPRODUCIBLE_REUSED_AND_FRESH_PAGE_SAME_BROWSER"
    elif reused or same:
        reconciled="PARTIAL_LIVE_SELECTION_REPRODUCIBILITY"
    else:
        reconciled="LIVE_SELECTION_REPRODUCIBILITY_NOT_PROVEN"

    checks={
      "r2Passed":r2.get("status")=="PASSED",
      "r2EmittedPropertySpecificGap":r2.get("classification")=="PROPERTY_SPECIFIC_CLICK_TARGET_GAP",
      "reusedTargetCertified":reused is True,
      "freshPageSameBrowserCertified":same is True,
      "freshIsolatedBrowserNotObservedAsSuccess":fresh is not True,
      "freshIsolatedBrowserMissingDistinguishedFromFalse":isolated_branch_state=="UNOBSERVED_OR_INCOMPLETE",
      "propertySpecificGapClassificationInvalidated":unsupported_property_specific,
      "recordTwoLiveSelectionReproducibilityCertified":live_reproducible,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveUiInteractionOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R13A_R3_R2_CLASSIFICATION_RECONCILED_SELECTION_REPRODUCIBILITY_CERTIFIED"
        diagnosis="R2_PROPERTY_SPECIFIC_GAP_INVALIDATED_RECORD_TWO_SELECTION_REPRODUCIBLE_IN_TWO_LIVE_CONTEXTS"
        next_ms="M4_19D4BN17C_R4_R12_R13A_R4_COMPARE_MICRO_COHORT_RECERTIFICATION_WITH_PER_RECORD_FRESH_PAGE_ISOLATION"
        next_state="BN17C_R4_R12_R13A_R3_CERTIFIED_COMPARE_RECERTIFICATION_READY"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R13A_R3_RECONCILIATION_INCOMPLETE"
        diagnosis="R2_EVIDENCE_DOES_NOT_SUPPORT_SAFE_SELECTION_REPRODUCIBILITY_RECONCILIATION"
        next_ms=None
        next_state="BN17C_R4_R12_R13A_R3_REMAINS_OPEN"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R3_R2_CLASSIFICATION_RECONCILIATION_AND_LIVE_SELECTION_REPRODUCIBILITY_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_EVIDENCE_RECONCILIATION",
      "status":status,
      "state":state,
      "diagnosis":diagnosis,
      "checks":checks,
      "rawR2Classification":r2.get("classification"),
      "reconciledClassification":reconciled,
      "isolatedBrowserBranchState":isolated_branch_state,
      "summary":{
        "reusedTargetCertified":reused,
        "freshPageSameBrowserCertified":same,
        "freshIsolatedBrowserCertified":fresh,
        "controlFreshIsolatedBrowserCertified":control_fresh,
        "freshIsolatedBrowserObserved":fresh_observed
      },
      "executionPolicy":{
        "compareRecertificationIsolation":"FRESH_PAGE_TARGET_PER_RECORD_SAME_BROWSER",
        "browserProfileReuseAllowed":True,
        "samePageReuseAcrossRecords":False,
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "selectedPropertyReadbackRequired":True,
        "compareReadbackRequired":True
      },
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "liveUiInteraction":False
      },
      "next":next_state,
      "nextMilestone":next_ms
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"r2_classification_reconciliation_and_live_selection_reproducibility_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R13A-R3 R2 Classification Reconciliation")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print()
    print("----- RAW R2 OBSERVATIONS -----")
    print("REUSED_TARGET_CERTIFIED:",reused)
    print("FRESH_PAGE_SAME_BROWSER_CERTIFIED:",same)
    print("FRESH_ISOLATED_BROWSER_CERTIFIED:",fresh)
    print("FRESH_ISOLATED_BROWSER_OBSERVED:",fresh_observed)
    print("RAW_R2_CLASSIFICATION:",r2.get("classification"))
    print()
    print("----- RECONCILIATION CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print()
    print("RECONCILED_CLASSIFICATION:",reconciled)
    print("ISOLATED_BROWSER_BRANCH_STATE:",isolated_branch_state)
    print("COMPARE_RECERTIFICATION_ISOLATION: FRESH_PAGE_TARGET_PER_RECORD_SAME_BROWSER")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",next_ms)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
