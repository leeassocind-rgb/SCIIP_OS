#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json

M="M4_19D4BN17C_R4_R12_R13A_R4_R1_COMPARE_3_OF_3_VERDICT_RECONCILIATION_AND_LIFECYCLE_CLOSURE"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r4p=ev/"M4_19D4BN17C_R4_R12_R13A_R4_COMPARE_MICRO_COHORT_RECERTIFICATION_WITH_PER_RECORD_FRESH_PAGE_ISOLATION"/"compare_micro_cohort_recertification_with_per_record_fresh_page_isolation.json"
    if not r4p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R4_EVIDENCE_REQUIRED")
        return 4

    r4=fj(r4p)
    c=r4.get("checks",{})
    outcomes=r4.get("outcomes",[])
    policy=r4.get("executionPolicy",{})

    checks={
      "r4DiagnosticComplete":r4.get("status")=="DIAGNOSTIC_COMPLETE",
      "r4ExactlyThreeOutcomes":len(outcomes)==3,
      "r4CertifiedCountThree":r4.get("certifiedCount")==3,
      "r4FreshTargetsCreatedThree":r4.get("freshTargetsCreated")==3,
      "r4HaltedOnFailureFalse":r4.get("haltedOnFailure") is False,
      "r4AllExecutedFreshTargetsCreated":c.get("allExecutedFreshTargetsCreated") is True,
      "r4AllExecutedSelectedPropertiesCertified":c.get("allExecutedSelectedPropertiesCertified") is True,
      "r4AllExecutedCompareActionsCertified":c.get("allExecutedCompareActionsCertified") is True,
      "r4AllThreeCompareActionsCertified":c.get("allThreeCompareActionsCertified") is True,
      "r4EachOutcomeCompareCertified":all(x.get("compareCertified") is True for x in outcomes),
      "r4EachOutcomeSelectedPropertyCertified":all(x.get("selectedPropertyCertified") is True for x in outcomes),
      "samePageReuseAcrossRecordsIsFalse":policy.get("samePageReuseAcrossRecords") is False,
      "freshIsolatedBrowserPerRecordIsFalse":policy.get("freshIsolatedBrowserPerRecord") is False,
      "r4ApplicationMutationOff":c.get("applicationMutationOff") is True,
      "r4GovernedMutationOff":c.get("governedMutationOff") is True,
      "r4PixelEvidenceOff":c.get("pixelEvidenceOff") is True,
      "r4CommandAuthorityOff":c.get("commandAuthorityOff") is True,
      "r4AnalyzePresentAuthorityOff":c.get("analyzePresentAuthorityOff") is True,
      "r4ExportPresentationAuthorityOff":c.get("exportPresentationAuthorityOff") is True,
      "liveUiInteractionOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R13A_R4_R1_COMPARE_ACTION_MICRO_COHORT_LIFECYCLE_CLOSED"
        diagnosis="R4_FALSE_VALUED_POLICY_ASSERTION_BUG_RECONCILED_COMPARE_ACTION_CERTIFIED_AND_CLOSED_THREE_OF_THREE"
        nxt="M4_19D4BN17C_R4_R12_R14_POST_COMPARE_COMMAND_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"
        next_state="BN17C_R4_R12_R13_COMPARE_CLOSED_COMMAND_READINESS_READY"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R13A_R4_R1_COMPARE_VERDICT_RECONCILIATION_INCOMPLETE"
        diagnosis="R4_LIVE_EVIDENCE_DOES_NOT_SUPPORT_COMPARE_3_OF_3_CLOSURE"
        nxt=None
        next_state="BN17C_R4_R12_R13A_R4_R1_REMAINS_OPEN"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R4_R1_COMPARE_3_OF_3_VERDICT_RECONCILIATION_AND_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_EVIDENCE_RECONCILIATION_AND_CLOSURE",
      "status":status,
      "state":state,
      "diagnosis":diagnosis,
      "checks":checks,
      "reconciledLiveEvidence":{
        "freshTargetsCreated":r4.get("freshTargetsCreated"),
        "certifiedCount":r4.get("certifiedCount"),
        "haltedOnFailure":r4.get("haltedOnFailure"),
        "outcomes":outcomes
      },
      "verdictBug":{
        "type":"FALSE_VALUED_POLICY_FACTS_INCLUDED_IN_ALL_CHECKS_REDUCTION",
        "originalPolicyFacts":{
          "samePageReuseAcrossRecords":policy.get("samePageReuseAcrossRecords"),
          "freshIsolatedBrowserPerRecord":policy.get("freshIsolatedBrowserPerRecord")
        },
        "repair":"ASSERT_FALSE_POLICY_FACTS_POSITIVELY_BEFORE_BOOLEAN_REDUCTION"
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
    f=out/"compare_3_of_3_verdict_reconciliation_and_lifecycle_closure.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R13A-R4-R1 Compare 3-of-3 Verdict Reconciliation + Closure")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print()
    print("----- R4 LIVE EVIDENCE -----")
    print("FRESH_TARGETS_CREATED:",r4.get("freshTargetsCreated"))
    print("CERTIFIED:",r4.get("certifiedCount"),"/3")
    print("HALTED_ON_FAILURE:",r4.get("haltedOnFailure"))
    print()
    print("----- RECONCILIATION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print()
    print("VERDICT_BUG: FALSE_VALUED_POLICY_FACTS_INCLUDED_IN_ALL_CHECKS_REDUCTION")
    print("samePageReuseAcrossRecordsIsFalse:",checks["samePageReuseAcrossRecordsIsFalse"])
    print("freshIsolatedBrowserPerRecordIsFalse:",checks["freshIsolatedBrowserPerRecordIsFalse"])
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT:",next_state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
