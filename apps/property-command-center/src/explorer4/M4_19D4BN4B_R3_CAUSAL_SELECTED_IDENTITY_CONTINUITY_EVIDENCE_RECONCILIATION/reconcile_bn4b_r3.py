#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib,re
from datetime import datetime,timezone

M="M4_19D4BN4B_R3_CAUSAL_SELECTED_IDENTITY_CONTINUITY_EVIDENCE_RECONCILIATION"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: reconcile_bn4b_r3.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    bn2=ev/"M4_19D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSURE"/"live_search_lifecycle_closure.json"
    bn3=ev/"M4_19D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSURE"/"post_selection_governed_consumer_lifecycle_closure.json"
    bn4a=ev/"M4_19D4BN4A_EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFICATION"/"exact_ten_market_context_neighbor_parity_certification.json"
    bn4b=ev/"M4_19D4BN4B_EXACT_TEN_LIVE_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_OBSERVATION"/"exact_ten_live_market_context_neighbor_observation.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("="*64)
    print("SCIIP Explorer 4.0 — BN4B-R3 Causal Identity Continuity Reconciliation")
    print("="*64)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    required=[bn2,bn3,bn4a,bn4b,src]
    missing=[str(p) for p in required if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_CERTIFIED_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 4

    b2=load(bn2); b3=load(bn3); a=load(bn4a); b=load(bn4b)
    t=src.read_text(errors="replace")

    records=b.get("records") or []
    queries=[r.get("query") for r in records]

    # Source-check the actual UI controls used by BN4B.
    # The expected live contract is:
    # onNeighbors={()=>workspace.openDrawer('neighbors')}
    # onMarket={()=>workspace.openDrawer('market')}
    # with no selection mutation in those handler expressions.
    maprail_match=re.search(r"<MapRail\s+onNeighbors=\{\(\)=>workspace\.openDrawer\('neighbors'\)\}\s+onMarket=\{\(\)=>workspace\.openDrawer\('market'\)\}\s+onProperty=\{\(\)=>workspace\.openDrawer\('property'\)\}\s*/>",t)
    maprail_context=maprail_match.group(0) if maprail_match else ""
    maprail_no_select=("selectProperty" not in maprail_context and "selectedPropertyId" not in maprail_context)

    checks={
      "bn2LiveSearchLifecycleClosed":
        b2.get("status")=="PASSED" and
        b2.get("state")=="M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSED",

      "bn3PostSelectionLifecycleClosed":
        b3.get("status")=="PASSED" and
        b3.get("state")=="M419D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED",

      "bn4aSourceParityPassed":
        a.get("status")=="PASSED" and
        a.get("state")=="M419D4BN4A_EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFIED",

      "bn4aDiagnosisCertified":
        a.get("diagnosis")=="EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_CONTRACT_PARITY_CERTIFIED",

      "bn4bExactTenRecords":len(records)==10 and queries==EXPECTED,

      "mapRailMarketNeighborHandlersResolved":bool(maprail_match),

      "mapRailMarketNeighborHandlersDoNotMutateSelection":bool(maprail_match) and maprail_no_select,

      "marketContextAnchorStillSelectedIdentity":
        "resolveGovernedMarketContextAnchor(" in t and "sourceSelectedProperty" in t,

      "marketContextConsumerStillSelectedIdentity":
        "resolveGovernedMarketContextConsumer(" in t and "sourceSelectedProperty" in t,

      "neighborContextStillMarketConsumerIdentity":
        "buildGovernedNeighborContext(marketContextConsumerProperty" in t,

      "spatialSelectionStillGoverned":
        "resolveGovernedMarketSpatialSelection(" in t,
    }

    per=[]
    for r in records:
        pre=r.get("pre") or {}
        market=r.get("market") or {}
        neigh=r.get("neighbors") or {}
        rc={
          "query":r.get("query"),
          "controlledValueMatch":r.get("controlledValueMatch") is True,
          "explorerMounted":pre.get("explorer") is True,
          "marketRibbonVisible":pre.get("marketRibbonVisible") is True,
          "marketControlClicked":r.get("marketControlClicked") is True,
          "marketDrawerVisible":market.get("drawerVisible") is True,
          "neighborsControlClicked":r.get("neighborsControlClicked") is True,
          "neighborsDrawerVisible":neigh.get("drawerVisible") is True,
          "mapVisible":neigh.get("mapVisible") is True,
          "neighborSignalsObserved":(neigh.get("neighborSignalCount") or 0)>0,
        }
        rc["liveConsumerObservationPassed"]=all(rc.values())
        # selected identity continuity is certified compositionally:
        # prior live selection identity + source consumer binding + no intervening selection mutation.
        rc["causalSelectedIdentityContinuityCertified"]=(
            rc["liveConsumerObservationPassed"] and
            checks["bn2LiveSearchLifecycleClosed"] and
            checks["bn3PostSelectionLifecycleClosed"] and
            checks["bn4aSourceParityPassed"] and
            checks["mapRailMarketNeighborHandlersDoNotMutateSelection"]
        )
        per.append(rc)

    checks["allExactTenLiveConsumerObservationsPassed"]=len(per)==10 and all(r["liveConsumerObservationPassed"] for r in per)
    checks["allExactTenCausalIdentityContinuityCertified"]=len(per)==10 and all(r["causalSelectedIdentityContinuityCertified"] for r in per)

    passed=all(checks.values())
    certified=sum(1 for r in per if r["causalSelectedIdentityContinuityCertified"])

    result={
      "framework":"SCIIP_EXPLORER_4_BN4B_R3_CAUSAL_SELECTED_IDENTITY_CONTINUITY_EVIDENCE_RECONCILIATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN4B_R3_EXACT_TEN_CAUSAL_SELECTED_IDENTITY_CONTINUITY_CERTIFIED" if passed else "M419D4BN4B_R3_RECONCILIATION_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_CAUSAL_SELECTED_IDENTITY_CONTINUITY_CERTIFIED" if passed else "MARKET_CONTEXT_AND_NEIGHBOR_CAUSAL_IDENTITY_CONTINUITY_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_RECONCILIATION",
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "evidence":{
        "bn2":{"path":str(bn2),"sha256":sha(bn2)},
        "bn3":{"path":str(bn3),"sha256":sha(bn3)},
        "bn4a":{"path":str(bn4a),"sha256":sha(bn4a)},
        "bn4b":{"path":str(bn4b),"sha256":sha(bn4b)},
        "runtime":{"path":str(src),"sha256":sha(src)}
      },
      "sourceMapRailContract":maprail_context,
      "checks":checks,
      "records":per,
      "certifiedCount":certified,
      "recordCount":len(per),
      "reconciliationBoundary":{
        "domTextIdentityRequired":False,
        "reason":"Selected property identity is not authoritatively exposed in DOM text/attributes; continuity is certified from prior live selection identity, source-governed consumer binding, no intervening selection mutation, and exact-ten live consumer observation.",
        "bn4bR2FalsePositiveRejected":True,
        "falsePositiveExample":"Query token 'ana' matched the UI word 'Analyze'; DOM token matching is therefore non-authoritative."
      },
      "next":"BN4B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN4B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE" if passed else None
    }

    outfile=out/"causal_selected_identity_continuity_reconciliation.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- CAUSAL RECONCILIATION CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("\n----- EXACT-TEN RECONCILED OUTCOMES -----")
    for i,r in enumerate(per,1):
        print(f"{i:02d}. {r['query']} -> {'CERTIFIED' if r['causalSelectedIdentityContinuityCertified'] else 'FAILED'}")

    print(f"\nCERTIFIED: {certified}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",outfile)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
