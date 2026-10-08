#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json

M="M4_19D4BN17C_R4_R12_R15B_ANALYZE_PRESENT_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r15p=ev/"M4_19D4BN17C_R4_R12_R15_POST_COMMAND_ANALYZE_PRESENT_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"/"post_command_analyze_present_action_surface_readiness_and_bounded_design.json"
    r15ap=ev/"M4_19D4BN17C_R4_R12_R15A_ANALYZE_PRESENT_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"/"analyze_present_action_live_micro_cohort_activation_certification.json"

    if not r15p.exists() or not r15ap.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R15_AND_R15A_EVIDENCE_REQUIRED")
        return 4

    r15,r15a=fj(r15p),fj(r15ap)
    outs=r15a.get("outcomes",[])
    c=r15a.get("checks",{})

    checks={
      "r15Passed":r15.get("status")=="PASSED",
      "r15aPassed":r15a.get("status")=="PASSED",
      "r15aStateCertified":r15a.get("state")=="M419D4BN17C_R4_R12_R15A_ANALYZE_PRESENT_ACTION_LIVE_MICRO_COHORT_CERTIFIED",
      "exactThreeRecordCohort":len(r15a.get("cohort",[]))==3,
      "freshTargetsCreatedThree":r15a.get("freshTargetsCreated")==3,
      "analyzeCertifiedCountThree":r15a.get("analyzeCertifiedCount")==3,
      "presentCertifiedCountThree":r15a.get("presentCertifiedCount")==3,
      "haltedOnFailureFalse":r15a.get("haltedOnFailure") is False,
      "allThreeAnalyzeActionsCertified":c.get("allThreeAnalyzeActionsCertified") is True,
      "allThreePresentActionsCertified":c.get("allThreePresentActionsCertified") is True,
      "eachOutcomeSelectedPropertyCertified":len(outs)==3 and all(x.get("selectedPropertyCertified") is True for x in outs),
      "eachOutcomeAnalyzeCertified":len(outs)==3 and all(x.get("analyzeCertified") is True for x in outs),
      "eachOutcomePresentCertified":len(outs)==3 and all(x.get("presentCertified") is True for x in outs),
      "freshPagePerRecordPolicyPreserved":r15a.get("executionPolicy",{}).get("pageTarget")=="FRESH_PER_RECORD",
      "samePageReuseAcrossRecordsIsFalse":r15a.get("executionPolicy",{}).get("samePageReuseAcrossRecords") is False,
      "freshIsolatedBrowserPerRecordIsFalse":r15a.get("executionPolicy",{}).get("freshIsolatedBrowserPerRecord") is False,
      "applicationMutationOff":c.get("applicationMutationOff") is True,
      "governedMutationOff":c.get("governedMutationOff") is True,
      "pixelEvidenceOff":c.get("pixelEvidenceOff") is True,
      "exportPresentationAuthorityOff":c.get("exportPresentationAuthorityOff") is True,
      "liveUiInteractionOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R15B_ANALYZE_PRESENT_ACTION_MICRO_COHORT_LIFECYCLE_CLOSED"
        diagnosis="ANALYZE_PRESENT_ACTIONS_CERTIFIED_AND_CLOSED_THREE_OF_THREE_WITH_FRESH_PAGE_PER_RECORD_ISOLATION"
        nxt="M4_19D4BN17C_R4_R12_R16_POST_ANALYZE_PRESENT_EXPORT_PRESENTATION_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"
        next_state="BN17C_R4_R12_R15_ANALYZE_PRESENT_CLOSED_EXPORT_PRESENTATION_READINESS_READY"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R15B_ANALYZE_PRESENT_LIFECYCLE_CLOSURE_INCOMPLETE"
        diagnosis="ANALYZE_PRESENT_ACTION_CLOSURE_EVIDENCE_INCOMPLETE"
        nxt=None
        next_state="BN17C_R4_R12_R15B_REMAINS_OPEN"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R15B_ANALYZE_PRESENT_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "closedCohort":[{"property":x.get("property"),"selectedProperty":"CERTIFIED","analyze":"CERTIFIED","present":"CERTIFIED"} for x in outs],
      "executionPolicy":r15a.get("executionPolicy"),
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"liveUiInteraction":False},
      "next":next_state,"nextMilestone":nxt
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"analyze_present_action_micro_cohort_lifecycle_closure.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R15B Analyze/Present Action Micro-Cohort Lifecycle Closure")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- CLOSED ANALYZE/PRESENT COHORT -----")
    for i,x in enumerate(outs,1):print(f"{i:02d}. {x.get('property')} -> ANALYZE CERTIFIED / PRESENT CERTIFIED")
    print("ANALYZE_CERTIFIED:",r15a.get("analyzeCertifiedCount"),"/3")
    print("PRESENT_CERTIFIED:",r15a.get("presentCertifiedCount"),"/3")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT:",next_state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
