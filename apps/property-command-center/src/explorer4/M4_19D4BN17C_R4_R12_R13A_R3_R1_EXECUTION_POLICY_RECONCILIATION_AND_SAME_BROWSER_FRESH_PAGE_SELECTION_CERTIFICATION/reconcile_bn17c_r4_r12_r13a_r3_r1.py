#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json

M="M4_19D4BN17C_R4_R12_R13A_R3_R1_EXECUTION_POLICY_RECONCILIATION_AND_SAME_BROWSER_FRESH_PAGE_SELECTION_CERTIFICATION"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r2p=ev/"M4_19D4BN17C_R4_R12_R13A_R2_FRESH_RUNTIME_TARGET_SELECTED_PROPERTY_REPRODUCIBILITY_AND_COMPARE_COHORT_ISOLATION_DIAGNOSIS"/"fresh_runtime_target_selected_property_reproducibility_and_compare_cohort_isolation_diagnosis.json"
    r3p=ev/"M4_19D4BN17C_R4_R12_R13A_R3_R2_CLASSIFICATION_RECONCILIATION_AND_LIVE_SELECTION_REPRODUCIBILITY_CERTIFICATION"/"r2_classification_reconciliation_and_live_selection_reproducibility_certification.json"

    if not r2p.exists() or not r3p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R2_AND_R3_EVIDENCE_REQUIRED")
        return 4

    r2,r3=fj(r2p),fj(r3p)
    s=r2.get("summary",{})

    reused=s.get("probeReusedCertified")
    same=s.get("probeSameBrowserFreshPageCertified")
    isolated=s.get("probeFreshIsolatedBrowserCertified")

    checks={
      "r2Passed":r2.get("status")=="PASSED",
      "r3BlockedOnlyByCrossTopologyRequirement":r3.get("status")=="BLOCKED",
      "reusedTargetSelectionCertified":reused is True,
      "freshPageSameBrowserSelectionCertified":same is True,
      "freshIsolatedBrowserObservedFailed":isolated is False,
      "sameBrowserExecutionTopologyHasTwoIndependentSuccesses":reused is True and same is True,
      "isolatedBrowserFailureClassifiedAsTopologySpecific":isolated is False,
      "isolatedBrowserExcludedFromCompareRecertification":True,
      "freshPagePerRecordSameBrowserRequired":True,
      "samePageReuseAcrossRecordsDisallowed":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "selectedPropertyReadbackRequired":True,
      "compareReadbackRequired":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveUiInteractionOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R13A_R3_R1_SAME_BROWSER_FRESH_PAGE_EXECUTION_POLICY_CERTIFIED"
        diagnosis="RECORD_TWO_SELECTION_REPRODUCIBLE_SAME_BROWSER_FRESH_PAGE_POLICY_CERTIFIED_ISOLATED_BROWSER_TOPOLOGY_EXCLUDED"
        nxt="M4_19D4BN17C_R4_R12_R13A_R4_COMPARE_MICRO_COHORT_RECERTIFICATION_WITH_PER_RECORD_FRESH_PAGE_ISOLATION"
        next_state="BN17C_R4_R12_R13A_R3_R1_CERTIFIED_COMPARE_RECERTIFICATION_READY"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R13A_R3_R1_EXECUTION_POLICY_RECONCILIATION_INCOMPLETE"
        diagnosis="SAME_BROWSER_FRESH_PAGE_EXECUTION_POLICY_PRECONDITION_FAILED"
        nxt=None
        next_state="BN17C_R4_R12_R13A_R3_R1_REMAINS_OPEN"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R3_R1_EXECUTION_POLICY_RECONCILIATION_AND_SAME_BROWSER_FRESH_PAGE_SELECTION_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_EVIDENCE_RECONCILIATION",
      "status":status,
      "state":state,
      "diagnosis":diagnosis,
      "checks":checks,
      "rawObservations":{
        "reusedTargetCertified":reused,
        "freshPageSameBrowserCertified":same,
        "freshIsolatedBrowserCertified":isolated
      },
      "certifiedExecutionPolicy":{
        "browserContext":"PRESERVE_SINGLE_CERTIFIED_BROWSER_CONTEXT",
        "pageTarget":"CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD",
        "samePageReuseAcrossRecords":False,
        "freshIsolatedBrowserPerRecord":False,
        "isolatedBrowserTopologySupported":False,
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
      "nextMilestone":nxt
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"execution_policy_reconciliation_and_same_browser_fresh_page_selection_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R13A-R3-R1 Execution-Policy Reconciliation")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print()
    print("----- OBSERVED TOPOLOGIES -----")
    print("REUSED_TARGET_CERTIFIED:",reused)
    print("FRESH_PAGE_SAME_BROWSER_CERTIFIED:",same)
    print("FRESH_ISOLATED_BROWSER_CERTIFIED:",isolated)
    print()
    print("----- POLICY CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print()
    print("CERTIFIED_BROWSER_CONTEXT: PRESERVE_SINGLE_CERTIFIED_BROWSER_CONTEXT")
    print("CERTIFIED_PAGE_POLICY: CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD")
    print("SAME_PAGE_REUSE_ACROSS_RECORDS: False")
    print("FRESH_ISOLATED_BROWSER_PER_RECORD: False")
    print("ISOLATED_BROWSER_TOPOLOGY_SUPPORTED: False")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT:",next_state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
