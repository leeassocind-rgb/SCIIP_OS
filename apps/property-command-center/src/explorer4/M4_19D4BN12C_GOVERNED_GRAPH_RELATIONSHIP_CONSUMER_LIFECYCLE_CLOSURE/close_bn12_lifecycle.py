#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib

M="M4_19D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSURE"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"

    a=ev/"M4_19D4BN12A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_graph_relationship_consumer_parity_certification.json"
    b=ev/"M4_19D4BN12B_EXACT_TEN_LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_OBSERVATION"/"exact_ten_live_governed_graph_relationship_consumer_observation.json"

    print("="*88)
    print("SCIIP Explorer 4.0 — BN12C Governed Graph/Relationship Consumer Lifecycle Closure")
    print("="*88)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (a,b) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    ar,br=load(a),load(b)
    rows=br.get("outcomes") or []
    aauth=ar.get("authority") or {}
    bauth=br.get("authority") or {}

    checks={
      "bn12aPassed":ar.get("status")=="PASSED",
      "bn12aStateCertified":ar.get("state")=="M419D4BN12A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFIED",
      "bn12aDiagnosisCertified":ar.get("diagnosis")=="EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_CONTRACT_PARITY_CERTIFIED",
      "bn12bPassed":br.get("status")=="PASSED",
      "bn12bStateCertified":br.get("state")=="M419D4BN12B_EXACT_TEN_LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMERS_OBSERVED",
      "bn12bDiagnosisCertified":br.get("diagnosis")=="EXACT_TEN_LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMERS_OBSERVED",
      "exactTenCount":len(rows)==10,
      "exactApprovedCohort":[x.get("property") for x in rows]==EXPECTED,
      "observedCountTen":br.get("observedCount")==10,
      "allControlledValueMatch":all(x.get("controlledValueMatch") is True for x in rows),
      "allExplorerMounted":all(x.get("explorerMounted") is True for x in rows),
      "allMapsVisibleBeforeRelationship":all(x.get("mapVisible") is True for x in rows),
      "allGraphControlsClicked":all(x.get("graphControlClicked") is True for x in rows),
      "allRelationshipConsumersVisible":all(x.get("relationshipConsumerVisible") is True for x in rows),
      "allRelationshipSignalsObserved":all((x.get("relationshipSignalCount") or 0)>0 for x in rows),
      "allMapsVisibleAfterRelationship":all(x.get("mapVisibleAfterRelationship") is True for x in rows),
      "allOutcomesCertified":all(x.get("outcome")=="LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_OBSERVED" for x in rows),
      "bn12aApplicationMutationOff":aauth.get("applicationSourceMutation") is False,
      "bn12aGovernedMutationOff":aauth.get("governedDataMutation") is False,
      "bn12bApplicationMutationOff":bauth.get("applicationSourceMutation") is False,
      "bn12bGovernedMutationOff":bauth.get("governedDataMutation") is False,
      "bn12bPixelEvidenceOff":bauth.get("pixelEvidence") is False
    }

    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSED" if passed else "M419D4BN12C_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "cohort":{"count":len(rows),"properties":[x.get("property") for x in rows]},
      "evidence":{"bn12a":{"path":str(a),"sha256":sha(a)},"bn12b":{"path":str(b),"sha256":sha(b)}},
      "next":"BN12_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN12_LIFECYCLE_REMAINS_OPEN"
    }

    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    f=out/"governed_graph_relationship_consumer_lifecycle_closure.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("\n----- EXACT-TEN GRAPH/RELATIONSHIP OUTCOMES -----")
    for i,x in enumerate(rows,1):
        ok=x.get("outcome")=="LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_OBSERVED"
        print(f"{i:02d}. {x.get('property')} -> {'CERTIFIED' if ok else 'FAILED'}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
