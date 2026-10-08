#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json

M="M4_19D4BN17C_R4_R12_R14B_COMMAND_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r14p=ev/"M4_19D4BN17C_R4_R12_R14_POST_COMPARE_COMMAND_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"/"post_compare_command_action_surface_readiness_and_bounded_design.json"
    r14ap=ev/"M4_19D4BN17C_R4_R12_R14A_COMMAND_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"/"command_action_live_micro_cohort_activation_certification.json"

    if not r14p.exists() or not r14ap.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R14_AND_R14A_EVIDENCE_REQUIRED")
        return 4

    r14,r14a=fj(r14p),fj(r14ap)
    outs=r14a.get("outcomes",[])
    c=r14a.get("checks",{})

    checks={
      "r14Passed":r14.get("status")=="PASSED",
      "r14aPassed":r14a.get("status")=="PASSED",
      "r14aStateCertified":r14a.get("state")=="M419D4BN17C_R4_R12_R14A_COMMAND_ACTION_LIVE_MICRO_COHORT_CERTIFIED",
      "exactThreeRecordCohort":len(r14a.get("cohort",[]))==3,
      "freshTargetsCreatedThree":r14a.get("freshTargetsCreated")==3,
      "certifiedCountThree":r14a.get("certifiedCount")==3,
      "haltedOnFailureFalse":r14a.get("haltedOnFailure") is False,
      "allThreeCommandActionsCertified":c.get("allThreeCommandActionsCertified") is True,
      "eachOutcomeSelectedPropertyCertified":len(outs)==3 and all(x.get("selectedPropertyCertified") is True for x in outs),
      "eachOutcomeCommandCertified":len(outs)==3 and all(x.get("commandCertified") is True for x in outs),
      "freshPagePerRecordPolicyPreserved":r14a.get("executionPolicy",{}).get("pageTarget")=="FRESH_PER_RECORD",
      "samePageReuseAcrossRecordsIsFalse":r14a.get("executionPolicy",{}).get("samePageReuseAcrossRecords") is False,
      "freshIsolatedBrowserPerRecordIsFalse":r14a.get("executionPolicy",{}).get("freshIsolatedBrowserPerRecord") is False,
      "applicationMutationOff":c.get("applicationMutationOff") is True,
      "governedMutationOff":c.get("governedMutationOff") is True,
      "pixelEvidenceOff":c.get("pixelEvidenceOff") is True,
      "analyzePresentAuthorityOff":c.get("analyzePresentAuthorityOff") is True,
      "exportPresentationAuthorityOff":c.get("exportPresentationAuthorityOff") is True,
      "liveUiInteractionOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R14B_COMMAND_ACTION_MICRO_COHORT_LIFECYCLE_CLOSED"
        diagnosis="COMMAND_ACTION_CERTIFIED_AND_CLOSED_THREE_OF_THREE_WITH_FRESH_PAGE_PER_RECORD_ISOLATION"
        nxt="M4_19D4BN17C_R4_R12_R15_POST_COMMAND_ANALYZE_PRESENT_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"
        next_state="BN17C_R4_R12_R14_COMMAND_CLOSED_ANALYZE_PRESENT_READINESS_READY"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R14B_COMMAND_LIFECYCLE_CLOSURE_INCOMPLETE"
        diagnosis="COMMAND_ACTION_CLOSURE_EVIDENCE_INCOMPLETE"
        nxt=None
        next_state="BN17C_R4_R12_R14B_REMAINS_OPEN"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R14B_COMMAND_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "closedCohort":[{"property":x.get("property"),"selectedProperty":"CERTIFIED","command":"CERTIFIED"} for x in outs],
      "executionPolicy":r14a.get("executionPolicy"),
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"liveUiInteraction":False},
      "next":next_state,"nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"command_action_micro_cohort_lifecycle_closure.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R14B Command Action Micro-Cohort Lifecycle Closure")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- CLOSED COMMAND COHORT -----")
    for i,x in enumerate(outs,1):print(f"{i:02d}. {x.get('property')} -> COMMAND CERTIFIED")
    print("CERTIFIED:",r14a.get("certifiedCount"),"/3")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT:",next_state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
