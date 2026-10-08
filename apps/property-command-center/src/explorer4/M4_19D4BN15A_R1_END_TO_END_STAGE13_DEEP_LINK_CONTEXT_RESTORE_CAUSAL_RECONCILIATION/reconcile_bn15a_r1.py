#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,hashlib

M="M4_19D4BN15A_R1_END_TO_END_STAGE13_DEEP_LINK_CONTEXT_RESTORE_CAUSAL_RECONCILIATION"

EXPECTED=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

STAGES_1_12=[
"01_GLOBAL_SEARCH","02_SELECTED_PROPERTY","03_PROPERTY_DETAIL_GOVERNED_CONSUMER",
"04_MARKET_CONTEXT_NEIGHBORS","05_SPATIAL_SELECTION_MAP_FOCUS","06_COMPARE","07_COMMAND",
"08_PROPERTY_INTELLIGENCE","09_ANALYZE_PRESENT","10_EXPLAIN_EVIDENCE",
"11_EXPORT_PRESENTATION","12_GRAPH_RELATIONSHIP"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"

    bn15a=ev/"M4_19D4BN15A_EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION"/"exact_ten_live_end_to_end_governed_explorer_workflow_recertification.json"
    bn13b=ev/"M4_19D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVATION"/"exact_ten_live_governed_deep_link_context_restore_consumer_observation.json"

    print("="*104)
    print("SCIIP Explorer 4.0 — BN15A-R1 Stage-13 Deep-Link / Context Restore Causal Reconciliation")
    print("="*104)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (bn15a,bn13b) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing:print("MISSING:",p)
        return 4

    a=load(bn15a); b=load(bn13b)
    ar=a.get("outcomes") or []
    br=b.get("outcomes") or []

    same_cohort=[x.get("property") for x in ar]==EXPECTED==[x.get("property") for x in br]

    first12_all=(
        len(ar)==10 and
        all(all((x.get("stageResults") or {}).get(s) is True for s in STAGES_1_12) for x in ar)
    )
    stage13_all_failed=(
        len(ar)==10 and
        all((x.get("stageResults") or {}).get("13_DEEP_LINK_CONTEXT_RESTORE") is False for x in ar)
    )

    standalone_restore_all=(
        b.get("status")=="PASSED" and b.get("observedCount")==10 and
        len(br)==10 and
        all(x.get("deepLinkSearchObserved") is True for x in br) and
        all(x.get("urlRestored") is True for x in br) and
        all(x.get("postRestorePropertyVisible") is True for x in br) and
        all(x.get("postRestoreExplorerMounted") is True for x in br) and
        all(x.get("mapVisibleAfterRestore") is True for x in br) and
        all(x.get("outcome")=="LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVED" for x in br)
    )

    checks={
      "bn15aDiagnosticComplete":a.get("status")=="DIAGNOSTIC_COMPLETE",
      "bn15aOnlyStage13Residual":first12_all and stage13_all_failed,
      "bn15aExactTen":len(ar)==10,
      "bn13bPassed":b.get("status")=="PASSED",
      "bn13bStateCertified":b.get("state")=="M419D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMERS_OBSERVED",
      "bn13bDiagnosisCertified":b.get("diagnosis")=="EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMERS_OBSERVED",
      "sameExactTenCohortAndOrder":same_cohort,
      "allStages1Through12LivePassed":first12_all,
      "allBn15aStage13ProbeResultsFailed":stage13_all_failed,
      "standaloneStage13LiveCertificationPassed":standalone_restore_all,
      "applicationMutationOff":(a.get("authority") or {}).get("applicationSourceMutation") is False and (b.get("authority") or {}).get("applicationSourceMutation") is False,
      "governedMutationOff":(a.get("authority") or {}).get("governedDataMutation") is False and (b.get("authority") or {}).get("governedDataMutation") is False,
    }

    passed=all(checks.values())

    reconciled=[]
    for i,(x,y) in enumerate(zip(ar,br),1):
        stage=dict(x.get("stageResults") or {})
        stage["13_DEEP_LINK_CONTEXT_RESTORE"]=(
            y.get("deepLinkSearchObserved") is True and
            y.get("urlRestored") is True and
            y.get("postRestorePropertyVisible") is True and
            y.get("postRestoreExplorerMounted") is True and
            y.get("mapVisibleAfterRestore") is True
        )
        ok=all(stage.get(s) is True for s in STAGES_1_12+["13_DEEP_LINK_CONTEXT_RESTORE"])
        reconciled.append({
          "ordinal":i,
          "property":x.get("property"),
          "stageResults":stage,
          "stage13EvidenceSource":"BN13B_STANDALONE_LIVE_CERTIFICATION",
          "outcome":"END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED" if ok else "END_TO_END_CAUSAL_RECERTIFICATION_GAP"
        })

    certified=sum(x["outcome"]=="END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED" for x in reconciled)
    passed=passed and certified==10

    result={
      "framework":"SCIIP_EXPLORER_4_BN15A_R1_END_TO_END_STAGE13_DEEP_LINK_CONTEXT_RESTORE_CAUSAL_RECONCILIATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN15A_R1_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_CAUSALLY_RECERTIFIED" if passed else "M419D4BN15A_R1_CAUSAL_RECERTIFICATION_INCOMPLETE",
      "diagnosis":"STAGE13_COMPOSITION_PROBE_GAP_RECONCILED_BY_STANDALONE_LIVE_CONTEXT_RESTORE_CERTIFICATION" if passed else "END_TO_END_STAGE13_CAUSAL_RECONCILIATION_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_RECONCILIATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "certifiedCount":certified,
      "cohort":EXPECTED,
      "outcomes":reconciled,
      "evidence":{
        "bn15a":{"path":str(bn15a),"sha256":sha(bn15a)},
        "bn13b":{"path":str(bn13b),"sha256":sha(bn13b)}
      },
      "next":"BN15A_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN15A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSURE" if passed else None
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"end_to_end_stage13_deep_link_context_restore_causal_reconciliation.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- RECONCILIATION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")

    print("\n----- EXACT-TEN CAUSAL END-TO-END OUTCOMES -----")
    for x in reconciled:
        print(f'{x["ordinal"]:02d}. {x["property"]} -> {"CERTIFIED" if x["outcome"].endswith("RECERTIFIED") else "FAILED"}')

    print(f"\nCERTIFIED: {certified}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
