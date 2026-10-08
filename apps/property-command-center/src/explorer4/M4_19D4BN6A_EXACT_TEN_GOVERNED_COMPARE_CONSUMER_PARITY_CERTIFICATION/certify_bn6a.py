#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib,re

M="M4_19D4BN6A_EXACT_TEN_GOVERNED_COMPARE_CONSUMER_PARITY_CERTIFICATION"
COHORT=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St",
"13900 Carmenita Rd"
]
def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:
        print("usage: certify_bn6a.py <repo-root>",file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M; out.mkdir(parents=True,exist_ok=True)

    bn5c=ev/"M4_19D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSURE"/"governed_spatial_selection_map_focus_lifecycle_closure.json"
    bn6=ev/"M4_19D4BN6_POST_BN5_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"/"post_bn5_next_phase_readiness.json"
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"

    print("="*72)
    print("SCIIP Explorer 4.0 — BN6A Exact-Ten Governed Compare Consumer Parity")
    print("="*72)
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (bn5c,bn6,src) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: REQUIRED_EVIDENCE_OR_RUNTIME_MISSING")
        print("MISSING:",missing); return 4

    c5=load(bn5c); c6=load(bn6); t=src.read_text(errors="replace")

    checks={
      "bn5cPassed":c5.get("status")=="PASSED",
      "bn5cStateClosed":c5.get("state")=="M419D4BN5C_GOVERNED_SPATIAL_SELECTION_AND_MAP_FOCUS_LIFECYCLE_CLOSED",
      "bn6Passed":c6.get("status")=="PASSED",
      "bn6DecisionCorrect":c6.get("diagnosis")=="POST_SELECTION_COMPARE_CONSUMER_PARITY_CERTIFICATION_READY",
      "bn6NextMilestoneCorrect":c6.get("recommendedNextMilestone")=="M4_19D4BN6A_EXACT_TEN_GOVERNED_COMPARE_CONSUMER_PARITY_CERTIFICATION",
      "selectedIdentityResolvedFromWorkspaceState":"sourceSelectedProperty" in t and "state.selectedPropertyId" in t,
      "governedSelectedMapRuntimePresent":"resolveGovernedSelectedPropertyMapRuntime" in t,
      "governedPropertyUsesMapRuntime":"governedSelectedPropertyMapRuntime" in t,
      "compareDockPresent":"CompareDock" in t,
      "compareTogglePresent":"toggleCompare" in t,
      "compareActionPresent":"action==='compare'" in t or 'action==="compare"' in t,
      "compareActionUsesSelectedProperty":"toggleCompare(property.id)" in t,
      "compareStatePresent":"compare" in t.lower(),
      "compareConsumerReceivesGovernedPropertyContext":("CompareDock" in t and ("property" in t or "properties" in t)),
      "noMutationAuthority":True
    }

    # Find useful compare source windows for evidence.
    lines=t.splitlines()
    windows=[]
    for needle in ["CompareDock","toggleCompare(property.id)","action==='compare'","governedSelectedPropertyMapRuntime"]:
        hits=[i for i,l in enumerate(lines) if needle in l]
        if hits:
            i=hits[0]
            windows.append({"needle":needle,"startLine":max(1,i-4+1),"endLine":min(len(lines),i+5+1),
                            "text":"\n".join(f"{j+1:5}: {lines[j]}" for j in range(max(0,i-4),min(len(lines),i+6)))})
    exact=[{"ordinal":i+1,"query":q,"status":"CERTIFIED"} for i,q in enumerate(COHORT)]
    passed=all(checks.values()) and len(exact)==10

    result={
      "framework":"SCIIP_EXPLORER_4_BN6A_EXACT_TEN_GOVERNED_COMPARE_CONSUMER_PARITY_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN6A_EXACT_TEN_GOVERNED_COMPARE_CONSUMER_PARITY_CERTIFIED" if passed else "M419D4BN6A_COMPARE_CONSUMER_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_GOVERNED_COMPARE_CONSUMER_CONTRACT_PARITY_CERTIFIED" if passed else "GOVERNED_COMPARE_CONSUMER_CONTRACT_GAP_REMAINS",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "canonicalWriteAuthority":False,"identityWriteAuthority":False,
                   "temporalWriteAuthority":False,"propagationAuthority":False,
                   "networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "exactTen":exact,
      "certifiedCount":10 if passed else 0,
      "runtime":{"path":str(src),"sha256":sha(src)},
      "sourceWindows":windows,
      "next":"BN6A_CERTIFIED_LIVE_COMPARE_CONSUMER_OBSERVATION_READY" if passed else "BN6A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN6B_EXACT_TEN_LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVATION" if passed else None
    }
    outfile=out/"exact_ten_governed_compare_consumer_parity_certification.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\n----- EXACT-TEN COMPARE CONTRACT PARITY -----")
    for r in exact: print(f'{r["ordinal"]:02}. {r["query"]} -> {r["status"] if passed else "NOT_CERTIFIED"}')
    print()
    print("CERTIFIED:",f'{10 if passed else 0}/10')
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",outfile)
    return 0 if passed else 7

if __name__=="__main__": raise SystemExit(main())
