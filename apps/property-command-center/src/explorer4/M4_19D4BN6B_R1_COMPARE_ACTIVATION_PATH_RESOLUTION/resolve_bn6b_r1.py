#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,hashlib

M="M4_19D4BN6B_R1_COMPARE_ACTIVATION_PATH_RESOLUTION"

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def window(lines,i,r=7):
    a=max(0,i-r);b=min(len(lines),i+r+1)
    return {"startLine":a+1,"endLine":b,"text":"\n".join(f"{j+1:5}: {lines[j]}" for j in range(a,b))}

def find_hits(p,text,terms):
    lines=text.splitlines();out=[]
    for term in terms:
        for i,l in enumerate(lines):
            if term in l:
                out.append({"file":str(p),"term":term,"line":i+1,**window(lines,i)})
                if sum(1 for x in out if x["term"]==term)>=8: break
    return out

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4";out=ev/M;out.mkdir(parents=True,exist_ok=True)
    bn6ar1=ev/"M4_19D4BN6A_R1_GOVERNED_COMPARE_SELECTED_PROPERTY_BINDING_RECONCILIATION"/"governed_compare_selected_property_binding_reconciliation.json"
    bn6b=ev/"M4_19D4BN6B_EXACT_TEN_LIVE_GOVERNED_COMPARE_CONSUMER_OBSERVATION"/"exact_ten_live_governed_compare_consumer_observation.json"

    print("="*72)
    print("SCIIP Explorer 4.0 — BN6B-R1 Compare Activation Path Resolution")
    print("="*72)
    print("Mode: READ_ONLY_DIAGNOSTIC")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not bn6ar1.is_file() or not bn6b.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING");return 4

    ar1=json.loads(bn6ar1.read_text()); b=json.loads(bn6b.read_text())
    if ar1.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN6A_R1_NOT_CERTIFIED");return 5

    # Search JSX/JS source under the live property explorer surface.
    root=app/"src/broker-product/property-explorer"
    files=[p for p in root.rglob("*") if p.suffix in {".js",".jsx",".mjs",".ts",".tsx"}]
    terms=["action==='compare'","action === 'compare'","toggleCompare(","CompareDock",
           "onAction","runAction","compare","CommandPalette","ExplorerCommandPalette",
           "data-action","aria-label","title="]
    hits=[]
    texts={}
    for p in files:
        try:t=p.read_text(errors="replace")
        except:continue
        texts[p]=t
        if "compare" in t.lower():
            hits.extend(find_hits(p,t,terms))

    # Primary Explorer runtime
    explorer=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"
    t=texts.get(explorer) or explorer.read_text(errors="replace")

    # Resolve action dispatcher function body surrounding compare branch.
    compare_branch=re.search(
        r"(?:else\s+if|if)\s*\(\s*action\s*===\s*['\"]compare['\"]\s*\)\s*workspace\.toggleCompare\(property\.id\)",
        t
    )
    dispatcher_name=None
    dispatcher_window=None
    if compare_branch:
        prefix=t[:compare_branch.start()]
        funcs=list(re.finditer(r"const\s+([A-Za-z_$][\w$]*)\s*=\s*[^=]*=>\s*\{",prefix))
        if funcs:
            dispatcher_name=funcs[-1].group(1)
        ln=t.count("\n",0,compare_branch.start())+1
        dispatcher_window=window(t.splitlines(),ln-1,12)

    # Look for that dispatcher being passed into child components.
    passed=[]
    if dispatcher_name:
        for p,txt in texts.items():
            for m in re.finditer(re.escape(dispatcher_name),txt):
                ln=txt.count("\n",0,m.start())+1
                passed.append({"file":str(p),"line":ln,"context":window(txt.splitlines(),ln-1,8)["text"]})

    # Find any literal compare action metadata anywhere.
    literal_routes=[]
    patterns=[
      r"action\s*[:=]\s*['\"]compare['\"]",
      r"['\"]compare['\"]\s*[,}]",
      r"id\s*:\s*['\"]compare['\"]",
      r"key\s*:\s*['\"]compare['\"]",
      r"value\s*:\s*['\"]compare['\"]",
    ]
    for p,txt in texts.items():
        for pat in patterns:
            for m in re.finditer(pat,txt,re.I):
                ln=txt.count("\n",0,m.start())+1
                literal_routes.append({"file":str(p),"line":ln,"match":m.group(0),
                                       "context":window(txt.splitlines(),ln-1,8)["text"]})

    # Inspect CompareDock mount condition and props.
    dock_mount=None
    m=re.search(r"<CompareDock\b[^>]*>",t,re.S)
    if m:
        ln=t.count("\n",0,m.start())+1
        dock_mount={"line":ln,"jsx":m.group(0),"context":window(t.splitlines(),ln-1,10)["text"]}

    # Classify known activation route.
    # Preferred: property action dispatcher passed to a component that can emit 'compare'.
    route=None
    route_type=None
    evidence_basis=[]
    if compare_branch and dispatcher_name and passed and literal_routes:
        route_type="ACTION_DISPATCHER"
        route={"dispatcher":dispatcher_name,
               "activationAction":"compare",
               "instruction":"Invoke the existing live UI control that emits action='compare' through the resolved action dispatcher; do not search by visible Compare text alone."}
        evidence_basis=["compare branch resolved","dispatcher resolved","dispatcher passed to consumer","literal compare action metadata found"]
    elif compare_branch and dispatcher_name and passed:
        route_type="ACTION_DISPATCHER_WITH_HIDDEN_METADATA"
        route={"dispatcher":dispatcher_name,
               "activationAction":"compare",
               "instruction":"Resolve the consumer node receiving the action dispatcher at runtime, then activate its compare action by DOM position/metadata rather than button text."}
        evidence_basis=["compare branch resolved","dispatcher resolved","dispatcher passed to consumer"]
    elif "ExplorerCommandPalette" in t and "compare" in t.lower():
        route_type="COMMAND_SURFACE"
        route={"activationAction":"compare",
               "instruction":"Use the existing Command surface to invoke Compare."}
        evidence_basis=["command surface and compare contract both present"]
    else:
        route_type="UNRESOLVED"

    all_missing_buttons=all((r.get("pre") or {}).get("compareButtonCount")==0 for r in (b.get("records") or []))
    all_maps=all((r.get("pre") or {}).get("mapVisible") is True for r in (b.get("records") or []))
    checks={
      "bn6aR1Passed":ar1.get("status")=="PASSED",
      "bn6bExactTen":len(b.get("records") or [])==10,
      "allVisibleCompareTextButtonsAbsent":all_missing_buttons,
      "allMapsStillVisible":all_maps,
      "compareBranchResolved":bool(compare_branch),
      "dispatcherResolved":bool(dispatcher_name),
      "dispatcherConsumerReferencesResolved":bool(passed),
      "compareDockResolved":bool(dock_mount),
      "activationRouteResolved":route_type!="UNRESOLVED"
    }
    passed_all=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN6B_R1_COMPARE_ACTIVATION_PATH_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed_all else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN6B_R1_COMPARE_ACTIVATION_PATH_RESOLVED" if passed_all else "M419D4BN6B_R1_COMPARE_ACTIVATION_PATH_UNRESOLVED",
      "diagnosis":"COMPARE_CONSUMER_PRESENT_LIVE_TEXT_BUTTON_ASSUMPTION_INVALID_ACTIVATION_PATH_RESOLVED" if passed_all else "COMPARE_ACTIVATION_PATH_REMAINS_UNRESOLVED",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "routeType":route_type,
      "route":route,
      "evidenceBasis":evidence_basis,
      "dispatcherWindow":dispatcher_window,
      "dispatcherReferences":passed[:20],
      "literalCompareRoutes":literal_routes[:20],
      "compareDockMount":dock_mount,
      "sourceHits":hits[:60],
      "next":"BN6B_R2_LIVE_COMPARE_ACTIVATION_PATH_RECERTIFICATION_READY" if passed_all else "BN6B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN6B_R2_EXACT_TEN_LIVE_COMPARE_ACTIVATION_PATH_RECERTIFICATION" if passed_all else None
    }
    f=out/"compare_activation_path_resolution.json";f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- RESOLUTION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nrouteType:",route_type)
    print("dispatcher:",dispatcher_name)
    print("literalCompareRoutes:",len(literal_routes))
    print("dispatcherReferences:",len(passed))
    print("compareDockResolved:",bool(dock_mount))
    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0
if __name__=="__main__":raise SystemExit(main())
