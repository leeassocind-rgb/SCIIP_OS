#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib
from datetime import datetime,timezone

M="M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE"
EXPECTED=[
"2 Musick",
"2701 Carrier Ave",
"8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave",
"1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St",
"927 E 9th St",
"13900 Carmenita Rd",
]

def load(p):
    return json.loads(p.read_text())

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: close_bn4_lifecycle.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    bn4a=ev/"M4_19D4BN4A_EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFICATION"/"exact_ten_market_context_neighbor_parity_certification.json"
    bn4r3=ev/"M4_19D4BN4B_R3_CAUSAL_SELECTED_IDENTITY_CONTINUITY_EVIDENCE_RECONCILIATION"/"causal_selected_identity_continuity_reconciliation.json"
    bn4b=ev/"M4_19D4BN4B_EXACT_TEN_LIVE_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_OBSERVATION"/"exact_ten_live_market_context_neighbor_observation.json"

    print("="*64)
    print("SCIIP Explorer 4.0 — BN4C Market Context + Neighbor Lifecycle Closure")
    print("="*64)
    print("Mode: READ_ONLY_EVIDENCE_CLOSURE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (bn4a,bn4r3,bn4b) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing:
            print("MISSING:",p)
        return 4

    a=load(bn4a)
    r3=load(bn4r3)
    b=load(bn4b)

    r3_records=r3.get("records") or []
    live_records=b.get("records") or []
    queries=[r.get("query") for r in r3_records]

    checks={
      "bn4aPassed":
        a.get("status")=="PASSED",

      "bn4aStateCertified":
        a.get("state")=="M419D4BN4A_EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFIED",

      "bn4aDiagnosisCertified":
        a.get("diagnosis")=="EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_CONTRACT_PARITY_CERTIFIED",

      "bn4r3Passed":
        r3.get("status")=="PASSED",

      "bn4r3StateCertified":
        r3.get("state")=="M419D4BN4B_R3_EXACT_TEN_CAUSAL_SELECTED_IDENTITY_CONTINUITY_CERTIFIED",

      "bn4r3DiagnosisCertified":
        r3.get("diagnosis")=="EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_CAUSAL_SELECTED_IDENTITY_CONTINUITY_CERTIFIED",

      "exactTenCount":
        len(r3_records)==10,

      "exactApprovedCohort":
        queries==EXPECTED,

      "certifiedCountTen":
        r3.get("certifiedCount")==10,

      "allCausalIdentityContinuityCertified":
        all(r.get("causalSelectedIdentityContinuityCertified") is True for r in r3_records),

      "mapRailHandlersResolved":
        (r3.get("checks") or {}).get("mapRailMarketNeighborHandlersResolved") is True,

      "mapRailHandlersDoNotMutateSelection":
        (r3.get("checks") or {}).get("mapRailMarketNeighborHandlersDoNotMutateSelection") is True,

      "liveExactTenCount":
        len(live_records)==10,

      "allLiveControlledValueMatch":
        all(r.get("controlledValueMatch") is True for r in live_records),

      "allLiveMarketRibbonVisible":
        all((r.get("pre") or {}).get("marketRibbonVisible") is True for r in live_records),

      "allLiveMarketControlClicked":
        all(r.get("marketControlClicked") is True for r in live_records),

      "allLiveMarketDrawerVisible":
        all((r.get("market") or {}).get("drawerVisible") is True for r in live_records),

      "allLiveNeighborsControlClicked":
        all(r.get("neighborsControlClicked") is True for r in live_records),

      "allLiveNeighborsDrawerVisible":
        all((r.get("neighbors") or {}).get("drawerVisible") is True for r in live_records),

      "allLiveMapsVisible":
        all((r.get("neighbors") or {}).get("mapVisible") is True for r in live_records),

      "allLiveNeighborSignalsObserved":
        all(((r.get("neighbors") or {}).get("neighborSignalCount") or 0)>0 for r in live_records),
    }

    aauth=a.get("authority") or {}
    rauth=r3.get("authority") or {}

    checks["bn4aApplicationMutationOff"]=aauth.get("applicationSourceMutation") is False
    checks["bn4aGovernedMutationOff"]=aauth.get("governedDataMutation") is False
    checks["bn4r3ApplicationMutationOff"]=rauth.get("applicationSourceMutation") is False
    checks["bn4r3GovernedMutationOff"]=rauth.get("governedDataMutation") is False
    checks["bn4r3NetworkAuthorityOff"]=rauth.get("networkAuthority") is False
    checks["bn4r3PixelEvidenceOff"]=rauth.get("pixelEvidence") is False

    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSED" if passed else "M419D4BN4C_LIFECYCLE_NOT_CLOSED",
      "diagnosis":"EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CERTIFIED_AND_CLOSED" if passed else "MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_CLOSURE",
      "authority":{
        "applicationSourceMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "automaticRetry":False,
        "pixelEvidence":False,
      },
      "evidence":{
        "bn4a":{"path":str(bn4a),"sha256":sha(bn4a)},
        "bn4bR3":{"path":str(bn4r3),"sha256":sha(bn4r3)},
        "bn4bLive":{"path":str(bn4b),"sha256":sha(bn4b)},
      },
      "checks":checks,
      "cohort":{
        "count":len(r3_records),
        "queries":queries,
      },
      "closure":{
        "marketContextNeighborGovernedLifecycleClosed":passed,
        "sourceContractParityCertified":passed,
        "causalSelectedIdentityContinuityCertified":passed,
        "exactTenLiveMarketContextObserved":passed,
        "exactTenLiveNeighborObserved":passed,
        "selectionMutationAbsentAcrossMarketNeighborControls":passed,
      },
      "nextBoundary":{
        "state":"BN4_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSED_NEXT_PHASE_READY" if passed else "BN4_LIFECYCLE_REMAINS_OPEN",
        "recommendation":"Proceed to the next bounded Explorer 4.0 downstream consumer phase; do not reopen BN2/BN3/BN4 without contradictory evidence." if passed else "Resolve failed BN4 closure preconditions before advancing."
      }
    }

    outfile=out/"market_context_neighbor_governed_lifecycle_closure.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CLOSURE CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("\n----- EXACT-TEN CAUSAL CONTINUITY -----")
    for i,r in enumerate(r3_records,1):
        print(f"{i:02d}. {r.get('query')} -> {'CERTIFIED' if r.get('causalSelectedIdentityContinuityCertified') else 'FAILED'}")

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["nextBoundary"]["state"])
    print("EVIDENCE:",outfile)

    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
