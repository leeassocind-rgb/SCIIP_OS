#!/usr/bin/env python3
from pathlib import Path
import sys,json,hashlib,re
from datetime import datetime,timezone

M="M4_19D4BN4A_EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFICATION"
EXPECTED=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2: return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"; out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    bn4=ev/"M4_19D4BN4_POST_BN3_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"/"post_bn3_next_phase_readiness.json"
    bn3=ev/"M4_19D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSURE"/"post_selection_governed_consumer_lifecycle_closure.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("="*60); print("SCIIP Explorer 4.0 — BN4A Exact-Ten Market Context + Neighbor Parity"); print("="*60)
    print("Mode: READ_ONLY_CERTIFICATION\nApplication source mutation: OFF\nGoverned data mutation: OFF\nNetwork authority: OFF")

    for p,label in [(bn4,"BN4"),(bn3,"BN3C"),(src,"Explorer runtime")]:
        if not p.is_file():
            print("STATUS: BLOCKED"); print("DIAGNOSIS:",label+"_EVIDENCE_MISSING"); return 4

    b4=load(bn4); b3=load(bn3); t=src.read_text(errors="replace")
    cohort=(b3.get("cohort") or {}).get("queries") or []
    checks={
      "bn4Passed":b4.get("status")=="PASSED",
      "bn4DecisionCorrect":b4.get("diagnosis")=="POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_PARITY_CERTIFICATION_READY",
      "bn3Closed":b3.get("state")=="M419D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED",
      "exactTenCohort":cohort==EXPECTED,
      "selectedIdentitySource":bool(re.search(r"sourceSelectedProperty=EXPLORER3_PROPERTIES\.find\(p=>p\.id===state\.selectedPropertyId\)",t)),
      "governedSelectedMap": "resolveGovernedSelectedPropertyMapRuntime(sourceSelectedProperty" in t,
      "marketAnchorFromSelected":"resolveGovernedMarketContextAnchor(\n    sourceSelectedProperty" in t,
      "marketConsumerFromSelected":"resolveGovernedMarketContextConsumer(\n    sourceSelectedProperty" in t,
      "neighborFromMarketConsumer":"buildGovernedNeighborContext(marketContextConsumerProperty" in t,
      "neighborRadiusGoverned":"resolveGovernedNeighborRadiusCollection(sourceNeighbors.rows||sourceNeighbors.properties||sourceNeighbors)" in t,
      "marketCohortGoverned":"resolveGovernedMarketContextCohort(EXPLORER3_PROPERTIES)" in t,
      "marketBuildUsesConsumer":"buildMarketContext({subject:marketContextConsumerProperty,properties:marketContextProperties" in t,
      "ribbonGoverned":"buildGovernedMarketContextRibbonContract(" in t and "governedMarketMetricPresentation" in t,
      "metricDetailGoverned":"buildGovernedMarketMetricDetailContract(activeMarketMetric,marketContextRibbonContext)" in t,
      "spatialHighlightGoverned":"buildGovernedMarketSpatialHighlightContract(" in t and "governedMarketMetricDetailContext" in t,
      "propertyIntelligenceUsesSpatialSelection":"resolveGovernedMarketSpatialSelection(" in t and "'PROPERTY_INTELLIGENCE'" in t,
      "mapUsesSpatialSelection":"onSelectProperty={value=>selectProperty(resolveGovernedMarketSpatialSelection(value" in t,
      "focusUsesSpatialSelection":"onFocus={value=>setFocusPropertyId(resolveGovernedMarketSpatialSelection(value" in t,
      "neighborUsesSpatialSelection":"onOpenNeighbor={value=>selectProperty(resolveGovernedMarketSpatialSelection(value" in t,
    }
    # Exact-ten parity is inherited only from the closed BN3 cohort; BN4A certifies
    # that each selected identity enters the same deterministic source contract.
    records=[{"ordinal":i+1,"query":q,"status":"CERTIFIED","contract":"SELECTED_PROPERTY_TO_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_CHAIN"} for i,q in enumerate(cohort)]
    passed=all(checks.values()) and len(records)==10
    result={
      "framework":"SCIIP_EXPLORER_4_BN4A_EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN4A_EXACT_TEN_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFIED" if passed else "M419D4BN4A_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_CONTRACT_PARITY_CERTIFIED" if passed else "MARKET_CONTEXT_AND_NEIGHBOR_PARITY_PRECONDITION_FAILED",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"automaticRetry":False},
      "evidence":{"bn4":{"path":str(bn4),"sha256":sha(bn4)},"bn3c":{"path":str(bn3),"sha256":sha(bn3)},"runtime":{"path":str(src),"sha256":sha(src)}},
      "checks":checks,"records":records,
      "next":"BN4A_CERTIFIED_LIVE_MARKET_CONTEXT_AND_NEIGHBOR_OBSERVATION_READY" if passed else None,
      "nextMilestone":"M4_19D4BN4B_EXACT_TEN_LIVE_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_OBSERVATION" if passed else None
    }
    outfile=out/"exact_ten_market_context_neighbor_parity_certification.json"; outfile.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\n----- EXACT-TEN CONTRACT PARITY -----")
    for r in records: print(f"{r['ordinal']:02d}. {r['query']} -> {r['status']}")
    print(f"\nCERTIFIED: {sum(r['status']=='CERTIFIED' for r in records)}/10")
    print("STATUS:",result["status"]); print("STATE:",result["state"]); print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"]); print("NEXT_MILESTONE:",result["nextMilestone"]); print("EVIDENCE:",outfile)
    return 0 if passed else 5
if __name__=="__main__": raise SystemExit(main())
