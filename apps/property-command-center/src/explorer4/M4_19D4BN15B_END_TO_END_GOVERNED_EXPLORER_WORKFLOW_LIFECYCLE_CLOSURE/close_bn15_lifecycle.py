#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,hashlib

M="M4_19D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSURE"
EXPECTED=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

STAGES=[
"01_GLOBAL_SEARCH","02_SELECTED_PROPERTY","03_PROPERTY_DETAIL_GOVERNED_CONSUMER",
"04_MARKET_CONTEXT_NEIGHBORS","05_SPATIAL_SELECTION_MAP_FOCUS","06_COMPARE","07_COMMAND",
"08_PROPERTY_INTELLIGENCE","09_ANALYZE_PRESENT","10_EXPLAIN_EVIDENCE",
"11_EXPORT_PRESENTATION","12_GRAPH_RELATIONSHIP","13_DEEP_LINK_CONTEXT_RESTORE"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"

    design=ev/"M4_19D4BN15_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION_DESIGN"/"exact_ten_end_to_end_governed_workflow_recertification_design.json"
    live=ev/"M4_19D4BN15A_EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION"/"exact_ten_live_end_to_end_governed_explorer_workflow_recertification.json"
    r1=ev/"M4_19D4BN15A_R1_END_TO_END_STAGE13_DEEP_LINK_CONTEXT_RESTORE_CAUSAL_RECONCILIATION"/"end_to_end_stage13_deep_link_context_restore_causal_reconciliation.json"

    print("="*104)
    print("SCIIP Explorer 4.0 — BN15B End-to-End Governed Explorer Workflow Lifecycle Closure")
    print("="*104)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (design,live,r1) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing:print("MISSING:",p)
        return 4

    d=load(design); l=load(live); r=load(r1)
    lr=l.get("outcomes") or []
    rr=r.get("outcomes") or []
    la=l.get("authority") or {}
    ra=r.get("authority") or {}
    da=d.get("authority") or {}

    live_first12=(
        len(lr)==10 and
        all(all((x.get("stageResults") or {}).get(s) is True for s in STAGES[:12]) for x in lr)
    )
    live_stage13_residual=(
        len(lr)==10 and
        all((x.get("stageResults") or {}).get(STAGES[12]) is False for x in lr)
    )
    r1_all13=(
        len(rr)==10 and
        all(all((x.get("stageResults") or {}).get(s) is True for s in STAGES) for x in rr)
    )

    checks={
      "bn15DesignPassed":d.get("status")=="PASSED",
      "bn15DesignStateCertified":d.get("state")=="M419D4BN15_EXACT_TEN_END_TO_END_GOVERNED_WORKFLOW_RECERTIFICATION_DESIGN_CERTIFIED",
      "bn15DesignDiagnosisCertified":d.get("diagnosis")=="EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIVE_RECERTIFICATION_READY",
      "bn15aDiagnosticRecorded":l.get("status")=="DIAGNOSTIC_COMPLETE",
      "bn15aExactTen":len(lr)==10,
      "bn15aStages1Through12LivePassed":live_first12,
      "bn15aStage13SoleResidual":live_stage13_residual,
      "bn15aR1Passed":r.get("status")=="PASSED",
      "bn15aR1StateCertified":r.get("state")=="M419D4BN15A_R1_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED",
      "bn15aR1DiagnosisCertified":r.get("diagnosis")=="STAGE13_COMPOSITION_PROBE_GAP_RECONCILED_BY_STANDALONE_LIVE_CONTEXT_RESTORE_CERTIFICATION",
      "exactTenCount":len(rr)==10,
      "exactApprovedCohort":[x.get("property") for x in rr]==EXPECTED,
      "certifiedCountTen":r.get("certifiedCount")==10,
      "allThirteenStagesCausallyCertified":r1_all13,
      "allCausalOutcomesCertified":all(x.get("outcome")=="END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED" for x in rr),
      "designApplicationMutationOff":da.get("applicationSourceMutation") is False,
      "designGovernedMutationOff":da.get("governedDataMutation") is False,
      "liveApplicationMutationOff":la.get("applicationSourceMutation") is False,
      "liveGovernedMutationOff":la.get("governedDataMutation") is False,
      "r1ApplicationMutationOff":ra.get("applicationSourceMutation") is False,
      "r1GovernedMutationOff":ra.get("governedDataMutation") is False,
      "r1NetworkAuthorityOff":ra.get("networkAuthority") is False,
      "r1PixelEvidenceOff":ra.get("pixelEvidence") is False
    }

    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSED" if passed else "M419D4BN15B_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "workflowSequence":STAGES,
      "cohort":{"count":len(rr),"properties":[x.get("property") for x in rr]},
      "outcomes":rr,
      "evidence":{
        "bn15Design":{"path":str(design),"sha256":sha(design)},
        "bn15aLive":{"path":str(live),"sha256":sha(live)},
        "bn15aR1":{"path":str(r1),"sha256":sha(r1)}
      },
      "next":"BN15_END_TO_END_GOVERNED_WORKFLOW_CLOSED_EXPANSION_READINESS_READY" if passed else "BN15_LIFECYCLE_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN16_POST_END_TO_END_RECERTIFICATION_BOUNDED_COHORT_EXPANSION_READINESS" if passed else None
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"end_to_end_governed_explorer_workflow_lifecycle_closure.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")

    print("\n----- EXACT-TEN END-TO-END OUTCOMES -----")
    for i,x in enumerate(rr,1):
        ok=x.get("outcome")=="END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED"
        print(f"{i:02d}. {x.get('property')} -> {'CERTIFIED' if ok else 'FAILED'}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
