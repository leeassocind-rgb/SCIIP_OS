#!/usr/bin/env python3
from __future__ import annotations
import sys,re,json,hashlib
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN3_POST_BN2_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def load(p):
    with p.open("r",encoding="utf-8") as f:
        return json.load(f)

def line_of(t,pos):
    return t.count("\n",0,pos)+1

def context(t,line,r=7):
    ls=t.splitlines()
    a=max(1,line-r); b=min(len(ls),line+r)
    return {
        "startLine":a,
        "endLine":b,
        "text":"\n".join(f"{i:5d}: {ls[i-1]}" for i in range(a,b+1))
    }

def hits(p,t,terms):
    out=[]
    for term in terms:
        pos=0
        count=0
        while count<8:
            i=t.find(term,pos)
            if i<0: break
            ln=line_of(t,i)
            out.append({"term":term,"file":str(p),"line":ln,**context(t,ln,6)})
            pos=i+len(term); count+=1
    return out

def main():
    if len(sys.argv)!=2:
        print("usage: design_bn3_next_phase.py <repo-root>",file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    src=app/"src"
    evroot=app/"evidence/explorer4"
    outdir=evroot/M
    outdir.mkdir(parents=True,exist_ok=True)

    closure=evroot/"M4_19D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSURE"/"live_search_lifecycle_closure.json"
    explorer=src/"broker-product/property-explorer/v6/Explorer3.jsx"

    print("============================================================")
    print("SCIIP Explorer 4.0 — BN3 Post-BN2 Next-Phase Readiness")
    print("============================================================")
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print()

    if not closure.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN2_CLOSURE_EVIDENCE_MISSING")
        return 4
    if not explorer.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: LIVE_EXPLORER_RUNTIME_MISSING")
        return 5

    c=load(closure)
    if not (
        c.get("status")=="PASSED" and
        c.get("state")=="M419D4BN2_R7F_R1_LIVE_SEARCH_LIFECYCLE_CLOSED" and
        c.get("diagnosis")=="EXACT_TEN_LIVE_SEARCH_LIFECYCLE_CERTIFIED_AND_CLOSED"
    ):
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN2_CLOSURE_NOT_CERTIFIED")
        return 6

    t=explorer.read_text(errors="replace")
    terms=[
        "selectedPropertyId",
        "sourceSelectedProperty",
        "resolveGovernedSelectedPropertyMapRuntime",
        "selectedProperty:property",
        "resolveGovernedPropertyIntelligenceSelection",
        "openDrawer('property')",
        "Property",
        "property.address",
        "property.city",
        "visibleProperties",
        "ExplorerMap",
        "onSelectProperty",
    ]
    evidence=hits(explorer,t,terms)

    checks={
        "bn2Closed":True,
        "selectedPropertyStatePresent":"selectedPropertyId" in t,
        "sourceSelectedPropertyResolutionPresent":"sourceSelectedProperty=" in t,
        "governedSelectedMapRuntimePresent":"resolveGovernedSelectedPropertyMapRuntime" in t,
        "propertyIntelligenceSelectionPresent":"resolveGovernedPropertyIntelligenceSelection" in t,
        "mapSelectionPresent":"onSelectProperty=" in t,
        "propertyDrawerCommandPresent":"openDrawer('property')" in t or 'openDrawer("property")' in t,
        "propertyAddressConsumptionPresent":"property.address" in t or "address={property" in t,
        "visiblePropertiesMapPresent":"visibleProperties" in t and "<ExplorerMap" in t,
    }

    # Decide the narrowest next proof after search/selection.
    if all(checks[k] for k in [
        "selectedPropertyStatePresent",
        "sourceSelectedPropertyResolutionPresent",
        "governedSelectedMapRuntimePresent",
        "propertyIntelligenceSelectionPresent",
        "mapSelectionPresent",
        "visiblePropertiesMapPresent",
    ]):
        decision="POST_SELECTION_PROPERTY_DETAIL_PARITY_CERTIFICATION_READY"
        next_milestone="M4_19D4BN3A_EXACT_TEN_POST_SELECTION_PROPERTY_DETAIL_AND_GOVERNED_CONSUMER_PARITY_CERTIFICATION"
        rationale=(
            "BN2 already proves search, Explorer mount, resolver outcome, selection, and post-selection visibility. "
            "The next bounded unclosed vertical surface is exact-ten parity between selected workspace identity, "
            "governed selected-property mapping, Property Intelligence selection, map selection/focus, and rendered "
            "post-selection property details."
        )
    elif checks["governedSelectedMapRuntimePresent"] and checks["mapSelectionPresent"]:
        decision="POST_SELECTION_MAP_AND_DRAWER_PARITY_READY"
        next_milestone="M4_19D4BN3A_EXACT_TEN_POST_SELECTION_MAP_AND_DRAWER_PARITY_CERTIFICATION"
        rationale="Selection is governed and map-bound, but broader Property Intelligence consumer binding is not fully evidenced."
    else:
        decision="NO_BOUNDED_NEXT_PHASE_IDENTIFIED"
        next_milestone=None
        rationale="Source evidence does not establish a sufficiently bounded post-selection certification target."

    passed=decision!="NO_BOUNDED_NEXT_PHASE_IDENTIFIED"
    result={
        "framework":"SCIIP_EXPLORER_4_BN3_POST_BN2_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN",
        "version":"4.0-m4.19d4bn3",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "BLOCKED",
        "state":"M419D4BN3_POST_BN2_NEXT_PHASE_READINESS_CERTIFIED" if passed else "M419D4BN3_NEXT_PHASE_NOT_CERTIFIED",
        "diagnosis":decision,
        "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
        "authority":{
            "applicationSourceMutation":False,
            "canonicalWriteAuthority":False,
            "identityWriteAuthority":False,
            "temporalWriteAuthority":False,
            "propagationAuthority":False,
            "networkAuthority":False,
            "automaticRetry":False,
        },
        "prerequisite":{
            "bn2ClosurePath":str(closure),
            "bn2ClosureSha256":sha(closure),
            "bn2ClosureStatus":c.get("status"),
            "bn2ClosureState":c.get("state"),
        },
        "liveRuntime":{
            "path":str(explorer),
            "sha256":sha(explorer),
        },
        "checks":checks,
        "recommendedNextMilestone":next_milestone,
        "rationale":rationale,
        "sourceEvidence":evidence,
        "boundaries":{
            "doNotReopenBN2WithoutContradictoryEvidence":True,
            "governedDataMutationAuthorized":False,
            "applicationMutationAuthorized":False,
            "nextPhaseType":"CERTIFICATION_ONLY" if passed else None,
        }
    }

    outfile=outdir/"post_bn2_next_phase_readiness.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")

    print("----- READINESS CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print()
    print("----- SOURCE EVIDENCE WINDOWS -----")
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
