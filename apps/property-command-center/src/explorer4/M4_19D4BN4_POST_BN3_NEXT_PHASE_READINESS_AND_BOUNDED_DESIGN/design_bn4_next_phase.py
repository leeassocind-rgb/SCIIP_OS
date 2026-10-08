#!/usr/bin/env python3
from __future__ import annotations
import sys,re,json,hashlib
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN4_POST_BN3_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def load(p):
    return json.loads(p.read_text())

def line_of(t,pos):
    return t.count("\n",0,pos)+1

def ctx(t,n,r=6):
    ls=t.splitlines()
    a=max(1,n-r);b=min(len(ls),n+r)
    return {"startLine":a,"endLine":b,
            "text":"\n".join(f"{i:5d}: {ls[i-1]}" for i in range(a,b+1))}

def collect(p,t,terms):
    out=[]
    for term in terms:
        pos=0;count=0
        while count<6:
            i=t.find(term,pos)
            if i<0:break
            n=line_of(t,i)
            out.append({"term":term,"file":str(p),"line":n,**ctx(t,n,6)})
            pos=i+len(term);count+=1
    return out

def main():
    if len(sys.argv)!=2:
        print("usage: design_bn4_next_phase.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M
    out.mkdir(parents=True,exist_ok=True)

    closure=ev/"M4_19D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSURE"/"post_selection_governed_consumer_lifecycle_closure.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("============================================================")
    print("SCIIP Explorer 4.0 — BN4 Post-BN3 Next-Phase Readiness")
    print("============================================================")
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")

    if not closure.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN3_CLOSURE_EVIDENCE_MISSING")
        return 4
    if not src.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: LIVE_EXPLORER_RUNTIME_MISSING")
        return 5

    c=load(closure)
    prereq=(
      c.get("status")=="PASSED" and
      c.get("state")=="M419D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSED" and
      c.get("diagnosis")=="EXACT_TEN_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED"
    )
    if not prereq:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN3_CLOSURE_NOT_CERTIFIED")
        return 6

    t=src.read_text(errors="replace")
    checks={
      "bn3Closed":True,
      "marketContextAnchorPresent":"resolveGovernedMarketContextAnchor" in t,
      "marketContextConsumerPresent":"resolveGovernedMarketContextConsumer" in t,
      "neighborContextPresent":"buildGovernedNeighborContext" in t,
      "neighborRadiusCollectionPresent":"resolveGovernedNeighborRadiusCollection" in t,
      "marketContextCohortPresent":"resolveGovernedMarketContextCohort" in t,
      "marketRibbonContractPresent":"buildGovernedMarketContextRibbonContract" in t,
      "marketMetricDetailPresent":"buildGovernedMarketMetricDetailContract" in t,
      "spatialHighlightPresent":"buildGovernedMarketSpatialHighlightContract" in t,
      "spatialSelectionPresent":"resolveGovernedMarketSpatialSelection" in t,
      "propertyIntelligenceDerivedPresent":"resolveGovernedPropertyIntelligenceDerivedRuntime" in t,
      "propertyIntelligenceEvidencePresent":"resolveGovernedPropertyIntelligenceEvidenceRuntime" in t,
      "compareFlowPresent":"toggleCompare" in t and "CompareDock" in t,
      "commandSurfacePresent":"ExplorerCommandPalette" in t and "runCommand" in t,
    }

    terms=[
      "resolveGovernedMarketContextAnchor",
      "resolveGovernedMarketContextConsumer",
      "buildGovernedNeighborContext",
      "resolveGovernedNeighborRadiusCollection",
      "resolveGovernedMarketContextCohort",
      "buildGovernedMarketContextRibbonContract",
      "buildGovernedMarketMetricDetailContract",
      "buildGovernedMarketSpatialHighlightContract",
      "resolveGovernedMarketSpatialSelection",
      "resolveGovernedPropertyIntelligenceDerivedRuntime",
      "resolveGovernedPropertyIntelligenceEvidenceRuntime",
      "CompareDock",
      "ExplorerCommandPalette",
    ]
    evidence=collect(src,t,terms)

    market_neighbor_ready=all(checks[k] for k in [
      "marketContextAnchorPresent","marketContextConsumerPresent",
      "neighborContextPresent","neighborRadiusCollectionPresent",
      "marketContextCohortPresent","marketRibbonContractPresent",
      "marketMetricDetailPresent","spatialHighlightPresent","spatialSelectionPresent"
    ])
    pi_ready=checks["propertyIntelligenceDerivedPresent"] and checks["propertyIntelligenceEvidencePresent"]

    if market_neighbor_ready:
        decision="POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_PARITY_CERTIFICATION_READY"
        next_milestone="M4_19D4BN4A_EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFICATION"
        rationale=(
          "BN3 closed Property/Map/Property Intelligence consumer observation. "
          "The next narrow downstream identity surface is the Market Context and Neighbor chain, "
          "which consumes the same governed selected property through anchor, consumer, spatial, "
          "cohort, metric, highlight, selection, and neighbor collection contracts."
        )
    elif pi_ready:
        decision="PROPERTY_INTELLIGENCE_DERIVED_AND_EVIDENCE_PARITY_CERTIFICATION_READY"
        next_milestone="M4_19D4BN4A_EXACT_TEN_PROPERTY_INTELLIGENCE_DERIVED_AND_EVIDENCE_PARITY_CERTIFICATION"
        rationale="Market/neighbor chain is incomplete, but derived/evidence Property Intelligence surfaces are bounded and source-connected."
    elif checks["compareFlowPresent"] and checks["commandSurfacePresent"]:
        decision="COMPARE_AND_COMMAND_CONSUMER_PARITY_CERTIFICATION_READY"
        next_milestone="M4_19D4BN4A_EXACT_TEN_COMPARE_AND_COMMAND_CONSUMER_PARITY_CERTIFICATION"
        rationale="Compare and command consumers are the next bounded surfaces available from source."
    else:
        decision="NO_BOUNDED_NEXT_PHASE_IDENTIFIED"
        next_milestone=None
        rationale="No sufficiently bounded downstream consumer chain is fully evidenced."

    passed=decision!="NO_BOUNDED_NEXT_PHASE_IDENTIFIED"
    result={
      "framework":"SCIIP_EXPLORER_4_BN4_POST_BN3_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN4_POST_BN3_NEXT_PHASE_READINESS_CERTIFIED" if passed else "M419D4BN4_NEXT_PHASE_NOT_CERTIFIED",
      "diagnosis":decision,
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{
        "applicationSourceMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "automaticRetry":False
      },
      "prerequisite":{
        "bn3ClosurePath":str(closure),
        "bn3ClosureSha256":sha(closure),
        "bn3ClosureState":c.get("state")
      },
      "runtime":{"path":str(src),"sha256":sha(src)},
      "checks":checks,
      "recommendedNextMilestone":next_milestone,
      "rationale":rationale,
      "sourceEvidence":evidence,
      "boundaries":{
        "doNotReopenBN2OrBN3WithoutContradictoryEvidence":True,
        "applicationMutationAuthorized":False,
        "governedDataMutationAuthorized":False,
        "nextPhaseType":"CERTIFICATION_ONLY" if passed else None
      }
    }

    outfile=out/"post_bn3_next_phase_readiness.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("\n----- SOURCE EVIDENCE WINDOWS -----")
    for x in evidence[:24]:
        print(f"\n### {x['term']} @ {x['file']}:{x['line']}")
        print(x["text"])

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",decision)
    print("NEXT_MILESTONE:",next_milestone)
    print("EVIDENCE:",outfile)
    return 0 if passed else 7

if __name__=="__main__":
    raise SystemExit(main())
