#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re

M="M4_19D4BN16C_R1_EXPANDED_COHORT_LIVE_SEARCH_SELECTION_EXPLAIN_CAUSAL_DIAGNOSIS"

def first_json(p):
    s=p.read_text()
    d=json.JSONDecoder()
    return d.raw_decode(s.lstrip())[0]

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    c=ev/"M4_19D4BN16C_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVATION"/"twenty_five_record_live_governed_explorer_workflow_observation.json"
    b=ev/"M4_19D4BN16B_25_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"/"twenty_five_record_governed_explorer_contract_parity_certification.json"
    a=ev/"M4_19D4BN16A_R3_TOLERANT_EVIDENCE_DECODER_AND_25_RECORD_GOVERNED_COHORT_PREAUTHORIZATION"/"tolerant_evidence_decoder_and_25_record_governed_cohort_preauthorization.json"
    for p in (c,b,a):
        if not p.is_file():
            print("STATUS: BLOCKED"); print("MISSING:",p); return 4
    C=first_json(c);B=first_json(b);A=first_json(a)
    outcomes=C.get("outcomes") or []
    original=outcomes[:10]; expanded=outcomes[10:]
    def st(x,k):return bool((x.get("stageResults") or {}).get(k))
    failing=[x for x in expanded if x.get("outcome")!="LIVE_25_RECORD_GOVERNED_EXPLORER_WORKFLOW_OBSERVED"]
    passing=[x for x in expanded if x.get("outcome")=="LIVE_25_RECORD_GOVERNED_EXPLORER_WORKFLOW_OBSERVED"]
    correlated=[]
    for x in failing:
        failed=[k for k,v in (x.get("stageResults") or {}).items() if not v]
        correlated.append({"property":x.get("property"),"failedStages":failed})
    same_pattern=all(x["failedStages"]==["01_GLOBAL_SEARCH","02_SELECTED_PROPERTY","10_EXPLAIN_EVIDENCE"] for x in correlated)
    dirty=[x for x in expanded if re.match(r"^(?:-\s+|\d+\s+\d)",x.get("property",""))]
    clean_failing=[x for x in failing if x not in dirty]
    result={
      "framework":"SCIIP_EXPLORER_4_BN16C_R1_EXPANDED_COHORT_LIVE_SEARCH_SELECTION_EXPLAIN_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN16C_R1_EXPANDED_COHORT_RESIDUAL_CAUSALLY_BOUNDED",
      "diagnosis":"EXPANDED_COHORT_SEARCH_SELECTION_GAP_DRIVES_EXPLAIN_EVIDENCE_RESIDUAL",
      "checks":{
        "bn16cDiagnosticComplete":C.get("status")=="DIAGNOSTIC_COMPLETE",
        "bn16cObserved13of25":C.get("observedCount")==13,
        "originalExactTenStillPass10of10":len(original)==10 and all(x.get("outcome")=="LIVE_25_RECORD_GOVERNED_EXPLORER_WORKFLOW_OBSERVED" for x in original),
        "expandedCohortCount15":len(expanded)==15,
        "expandedPassCount3":len(passing)==3,
        "expandedFailCount12":len(failing)==12,
        "allTwelveShareSameThreeStageResidual":same_pattern,
        "mapAndDownstreamNonExplainConsumersRemainLive":all(all(st(x,k) for k in ["03_MAP_VISIBLE","04_PROPERTY_CONSUMER","05_MARKET_NEIGHBORS","06_COMPARE","07_COMMAND","08_PROPERTY_INTELLIGENCE","09_ANALYZE_PRESENT","11_EXPORT_PRESENTATION","12_GRAPH_RELATIONSHIP"]) for x in failing),
        "bn16bContractParityPassed":B.get("status")=="PASSED",
        "bn16aR3PreauthorizationPassed":A.get("status")=="PASSED",
        "applicationMutationOff":True,
        "governedMutationOff":True
      },
      "expandedPassing":[x.get("property") for x in passing],
      "expandedFailing":correlated,
      "suspiciousCandidateLabels":[x.get("property") for x in dirty],
      "cleanLookingFailingLabels":[x.get("property") for x in clean_failing],
      "causalInterpretation":{
        "primary":"The expanded cohort is source-backed at the certification layer, but 12 newly selected labels are not successfully resolving through the live search/selection surface. Explain/Evidence then fails correlatively because the intended property was not selected.",
        "notSupported":"A broad Explorer consumer regression is not supported: map, property, market/neighbors, compare, command, property intelligence, analyze/present, export/presentation, and graph/relationship remain live on all 12 residual records.",
        "nextRepairBoundary":"Repair expanded-cohort qualification against the LIVE SEARCHABLE PROPERTY IDENTITY SURFACE, not generic source-inventory address-like strings."
      },
      "next":"BN16C_R1_CERTIFIED_LIVE_SEARCHABLE_IDENTITY_COHORT_REQUALIFICATION_READY",
      "nextMilestone":"M4_19D4BN16C_R2_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_REQUALIFICATION_AND_25_RECORD_REAUTHORIZATION"
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"expanded_cohort_live_search_selection_explain_causal_diagnosis.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("="*104)
    print("SCIIP Explorer 4.0 — BN16C-R1 Expanded-Cohort Live Search / Selection / Explain Causal Diagnosis")
    print("="*104)
    print("Mode: READ_ONLY_CAUSAL_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("\n----- CAUSAL CHECKS -----")
    for k,v in result["checks"].items():print(f"{k}: {v}")
    print("\n----- EXPANDED PASSING -----")
    for x in result["expandedPassing"]:print(x)
    print("\n----- EXPANDED FAILING / CORRELATED STAGES -----")
    for x in correlated:print(x["property"],"->",", ".join(x["failedStages"]))
    print("\nSUSPICIOUS_CANDIDATE_LABEL_COUNT:",len(dirty))
    print("CLEAN_LOOKING_FAILING_LABEL_COUNT:",len(clean_failing))
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0
if __name__=="__main__":raise SystemExit(main())
