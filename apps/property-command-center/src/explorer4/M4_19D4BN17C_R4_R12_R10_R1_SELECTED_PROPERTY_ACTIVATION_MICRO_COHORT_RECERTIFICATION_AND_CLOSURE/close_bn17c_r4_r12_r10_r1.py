#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json

M="M4_19D4BN17C_R4_R12_R10_R1_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_RECERTIFICATION_AND_CLOSURE"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r9p=ev/"M4_19D4BN17C_R4_R12_R9_R2_EXPLICIT_CDP_BROWSER_BOOTSTRAP_TARGET_CREATION_AND_CANONICAL_SEARCH_MATERIALIZATION_RECERTIFICATION"/"explicit_cdp_target_creation_and_canonical_search_materialization_recertification.json"
    r10p=ev/"M4_19D4BN17C_R4_R12_R10_CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CERTIFICATION"/"canonical_search_result_selected_property_activation_micro_cohort_certification.json"
    r11p=ev/"M4_19D4BN17C_R4_R12_R11_SELECTED_PROPERTY_CLICK_TARGET_AND_STATE_TRANSITION_DIAGNOSIS"/"selected_property_click_target_and_state_transition_diagnosis.json"

    missing=[str(p) for p in (r9p,r10p,r11p) if not p.exists()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_SELECTED_PROPERTY_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    r9,r10,r11=map(fj,(r9p,r10p,r11p))

    r10_out={x.get("property"):x for x in r10.get("outcomes",[])}
    reconstructed=[]
    for p in COHORT:
        if p=="2 Musick":
            certified=bool(r11.get("selectedPropertyCertified"))
            source="R11_REPAIR_CERTIFICATION"
        else:
            certified=bool((r10_out.get(p) or {}).get("selectedPropertyCertified"))
            source="R10_ORIGINAL_CERTIFICATION"
        reconstructed.append({"property":p,"certified":certified,"source":source})

    checks={
      "r9R2Passed":r9.get("status")=="PASSED",
      "r9R2MaterializedThreeOfThree":r9.get("materializedCount")==3,
      "r10DiagnosticComplete":r10.get("status")=="DIAGNOSTIC_COMPLETE",
      "r10CertifiedTwoOfThree":r10.get("certifiedCount")==2,
      "r10ExactThreeRecordCohort":sorted([x.get("property") for x in r10.get("outcomes",[])])==sorted(COHORT),
      "r10OnlyTwoMusickFailed":sum(1 for x in r10.get("outcomes",[]) if not x.get("selectedPropertyCertified"))==1 and not (r10_out.get("2 Musick") or {}).get("selectedPropertyCertified"),
      "r11Passed":r11.get("status")=="PASSED",
      "r11TwoMusickCertified":r11.get("probeProperty")=="2 Musick" and r11.get("selectedPropertyCertified") is True,
      "reconstructedExactThree":len(reconstructed)==3,
      "reconstructedAllCertified":all(x["certified"] for x in reconstructed),
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveUiInteractionOff":True,
      "downstreamActionAuthorityOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R10_R1_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CLOSED"
        diagnosis="CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_CERTIFIED_AND_CLOSED_THREE_OF_THREE"
        nxt="M4_19D4BN17C_R4_R12_R12_POST_SELECTED_PROPERTY_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"
        next_state="BN17C_R4_R12_R10_R1_CLOSED_ACTION_SURFACE_READINESS_READY"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R10_R1_SELECTED_PROPERTY_ACTIVATION_RECONCILIATION_INCOMPLETE"
        diagnosis="SELECTED_PROPERTY_ACTIVATION_EVIDENCE_RECONCILIATION_PRECONDITION_FAILED"
        nxt=None
        next_state="BN17C_R4_R12_R10_R1_REMAINS_OPEN"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R10_R1_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_RECERTIFICATION_AND_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_EVIDENCE_RECONCILIATION",
      "status":status,
      "state":state,
      "diagnosis":diagnosis,
      "checks":checks,
      "cohort":COHORT,
      "reconstructedOutcomes":reconstructed,
      "certifiedCount":sum(1 for x in reconstructed if x["certified"]),
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "liveUiInteraction":False,
        "compare":False,
        "command":False,
        "analyzePresent":False,
        "exportPresentation":False
      },
      "next":next_state,
      "nextMilestone":nxt
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"selected_property_activation_micro_cohort_recertification_and_closure.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R10-R1 Selected Property Activation Micro-Cohort Recertification + Closure")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print()
    print("----- RECONCILIATION CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print()
    print("----- RECONSTRUCTED SELECTED-PROPERTY OUTCOMES -----")
    for i,x in enumerate(reconstructed,1):
        print(f"{i:02d}. {x['property']} -> {'CERTIFIED' if x['certified'] else 'FAILED'} ({x['source']})")
    print()
    print("CERTIFIED:",res["certifiedCount"],"/3")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT:",next_state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
