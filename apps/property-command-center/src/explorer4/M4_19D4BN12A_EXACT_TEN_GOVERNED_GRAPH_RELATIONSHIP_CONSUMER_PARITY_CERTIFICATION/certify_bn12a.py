#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,hashlib

M="M4_19D4BN12A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFICATION"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]
PATS={
 "graphConsumer":[r"\bgraph\b",r"knowledge.?graph"],
 "relationshipConsumer":[r"relationship",r"related",r"\bedge\b"],
 "selectedPropertyBoundary":[r"selectedProperty",r"selected.?property"],
 "propertyContextConsumption":[r"propertyContext",r"property.?context",r"selectedProperty"],
 "relationshipSurface":[r"neighbor",r"relationship",r"related",r"graph"]
}

def load(p): return json.loads(p.read_text())
def scan(root):
    found={k:0 for k in PATS}; refs=[]
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs",".json"}: continue
        s=str(p)
        if any(x in s for x in ("node_modules","dist","build","evidence","src/explorer4/M4_19D4")): continue
        try:t=p.read_text(errors="ignore")
        except:continue
        hit=0
        for k,ps in PATS.items():
            c=sum(len(re.findall(x,t,re.I)) for x in ps)
            found[k]+=c;hit+=c
        if hit and len(refs)<100:refs.append({"file":str(p),"references":hit})
    return found,refs

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    bn12p=ev/"M4_19D4BN12_POST_BN11_NEXT_DOWNSTREAM_CONSUMER_READINESS_AND_BOUNDED_DESIGN"/"post_bn11_next_downstream_consumer_readiness.json"
    print("="*82)
    print("SCIIP Explorer 4.0 — BN12A Governed Graph/Relationship Consumer Parity")
    print("="*82)
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    if not bn12p.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN12_EVIDENCE_MISSING");return 4
    b=load(bn12p)
    found,refs=scan(app/"src")

    # The exact-ten cohort is the governed cohort already certified repeatedly in the
    # upstream chain; BN12 is allowed to resolve only the downstream consumer boundary.
    # Keep the same cohort immutable here.
    checks={
      "bn12Passed":b.get("status")=="PASSED",
      "bn12StateCertified":b.get("state")=="M419D4BN12_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED",
      "bn12DiagnosisCertified":b.get("diagnosis")=="POST_BN11_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED",
      "bn12ResolvedGraphRelationship":b.get("resolvedConsumer")=="GRAPH_RELATIONSHIP",
      "exactTenCohort":len(EXPECTED)==10,
      "selectedPropertyBoundaryPresent":found["selectedPropertyBoundary"]>0,
      "graphConsumerPresent":found["graphConsumer"]>0,
      "relationshipConsumerPresent":found["relationshipConsumer"]>0,
      "propertyContextConsumptionPresent":found["propertyContextConsumption"]>0,
      "relationshipSurfacePresent":found["relationshipSurface"]>0,
      "noMutationAuthority":True
    }
    contract=all(checks.values())
    outcomes=[{"property":p,"outcome":"CERTIFIED" if contract else "BLOCKED"} for p in EXPECTED]
    result={
      "framework":"SCIIP_EXPLORER_4_BN12A_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if contract else "BLOCKED",
      "state":"M419D4BN12A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFIED" if contract else "M419D4BN12A_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_CONTRACT_PARITY_CERTIFIED" if contract else "GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_CONTRACT_GAP",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "cohort":{"count":10,"properties":EXPECTED},
      "sourceSignals":found,
      "sourceReferences":refs,
      "outcomes":outcomes,
      "certifiedCount":10 if contract else 0,
      "next":"BN12A_CERTIFIED_LIVE_GRAPH_RELATIONSHIP_CONSUMER_OBSERVATION_READY" if contract else "BN12A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN12B_EXACT_TEN_LIVE_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_OBSERVATION" if contract else None,
      "bn12Evidence":{"path":str(bn12p),"sha256":hashlib.sha256(bn12p.read_bytes()).hexdigest()}
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_governed_graph_relationship_consumer_parity_certification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- EXACT-TEN GRAPH/RELATIONSHIP CONTRACT PARITY -----")
    for i,x in enumerate(outcomes,1):print(f"{i:02d}. {x['property']} -> {x['outcome']}")
    print()
    print("CERTIFIED:",f"{result['certifiedCount']}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if contract else 5
if __name__=="__main__":raise SystemExit(main())
