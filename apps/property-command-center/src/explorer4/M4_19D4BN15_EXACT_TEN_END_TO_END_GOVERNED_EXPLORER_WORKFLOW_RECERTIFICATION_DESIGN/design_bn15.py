#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,hashlib

M="M4_19D4BN15_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION_DESIGN"

REQ=[
("BN2","M4_19D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSURE","live_search_lifecycle_closure.json","M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSED"),
("BN3","M4_19D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSURE","post_selection_governed_consumer_lifecycle_closure.json","M419D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED"),
("BN4","M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE","market_context_neighbor_governed_lifecycle_closure.json","M419D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSED"),
("BN5","M4_19D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSURE","governed_spatial_selection_map_focus_lifecycle_closure.json","M419D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSED"),
("BN6","M4_19D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSURE","governed_compare_consumer_lifecycle_closure.json","M419D4BN6C_GOVERNED_COMPARE_CONSUMER_LIFECYCLE_CLOSED"),
("BN7","M4_19D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSURE","governed_command_consumer_lifecycle_closure.json","M419D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSED"),
("BN8","M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE","governed_property_intelligence_consumer_lifecycle_closure.json","M419D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSED"),
("BN9","M4_19D4BN9C_R1_BN9A_AUTHORITY_METADATA_RECONCILIATION_AND_LIFECYCLE_CLOSURE","bn9a_authority_metadata_reconciliation_and_lifecycle_closure.json","M419D4BN9C_R1_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSED"),
("BN10","M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE","governed_explain_evidence_consumer_lifecycle_closure.json","M419D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSED"),
("BN11","M4_19D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSURE","governed_export_presentation_consumer_lifecycle_closure.json","M419D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSED"),
("BN12","M4_19D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSURE","governed_graph_relationship_consumer_lifecycle_closure.json","M419D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSED"),
("BN13","M4_19D4BN13C_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSURE","governed_deep_link_context_restore_consumer_lifecycle_closure.json","M419D4BN13C_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSED"),
("BN14A","M4_19D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_DESIGN","bounded_next_phase_architecture_and_expansion_readiness.json","M419D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_CERTIFIED")
]

EXPECTED=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"

    print("="*100)
    print("SCIIP Explorer 4.0 — BN15 Exact-Ten End-to-End Governed Workflow Recertification Design")
    print("="*100)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    checks={}
    evidence={}
    missing=[]
    for bn,d,f,state in REQ:
        p=ev/d/f
        if not p.is_file():
            missing.append(str(p))
            checks[f"{bn.lower()}EvidencePresent"]=False
            continue
        x=load(p)
        checks[f"{bn.lower()}EvidencePresent"]=True
        checks[f"{bn.lower()}Passed"]=x.get("status")=="PASSED"
        checks[f"{bn.lower()}StateCertified"]=x.get("state")==state
        evidence[bn]={"path":str(p),"sha256":sha(p)}

    checks["allPrerequisiteEvidencePresent"]=len(missing)==0
    checks["allLifecycleStatesCertified"]=all(checks.get(f"{bn.lower()}StateCertified") is True for bn,_,_,_ in REQ)
    checks["allPrerequisitesPassed"]=all(checks.get(f"{bn.lower()}Passed") is True for bn,_,_,_ in REQ)
    checks["exactTenCohortStable"]=len(EXPECTED)==10 and len(set(EXPECTED))==10
    checks["bn14aSelectedEndToEndRecertification"]=False

    if not missing:
        bn14a=load(ev/REQ[-1][1]/REQ[-1][2])
        checks["bn14aSelectedEndToEndRecertification"]=bn14a.get("resolvedNextPhase")=="EXACT_TEN_END_TO_END_WORKFLOW_RECERTIFICATION"

    checks["applicationMutationOff"]=True
    checks["governedMutationOff"]=True
    checks["networkAuthorityOff"]=True
    checks["pixelEvidenceOff"]=True

    passed=all(checks.values())

    workflow=[
      "GLOBAL_SEARCH",
      "SELECTED_PROPERTY",
      "PROPERTY_DETAIL_GOVERNED_CONSUMER",
      "MARKET_CONTEXT_NEIGHBORS",
      "SPATIAL_SELECTION_MAP_FOCUS",
      "COMPARE",
      "COMMAND",
      "PROPERTY_INTELLIGENCE",
      "ANALYZE_PRESENT",
      "EXPLAIN_EVIDENCE",
      "EXPORT_PRESENTATION",
      "GRAPH_RELATIONSHIP",
      "DEEP_LINK_CONTEXT_RESTORE"
    ]

    result={
      "framework":"SCIIP_EXPLORER_4_BN15_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN15_EXACT_TEN_END_TO_END_GOVERNED_WORKFLOW_RECERTIFICATION_DESIGN_CERTIFIED" if passed else "M419D4BN15_END_TO_END_DESIGN_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIVE_RECERTIFICATION_READY" if passed else "END_TO_END_GOVERNED_WORKFLOW_RECERTIFICATION_PRECONDITION_FAILED",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "workflowSequence":workflow,
      "cohort":{"count":10,"properties":EXPECTED},
      "evidence":evidence,
      "missingEvidence":missing,
      "nextMilestone":"M4_19D4BN15A_EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION" if passed else None
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_end_to_end_governed_workflow_recertification_design.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- DESIGN CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")

    print("\n----- END-TO-END WORKFLOW SEQUENCE -----")
    for i,x in enumerate(workflow,1):print(f"{i:02d}. {x}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    if missing:
        print("\n----- MISSING EVIDENCE -----")
        for p in missing:print(p)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
