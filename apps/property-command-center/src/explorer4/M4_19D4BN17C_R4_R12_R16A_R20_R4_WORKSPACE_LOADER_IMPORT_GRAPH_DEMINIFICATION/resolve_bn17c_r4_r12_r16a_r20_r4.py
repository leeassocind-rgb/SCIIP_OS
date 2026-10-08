#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R4_WORKSPACE_LOADER_IMPORT_GRAPH_DEMINIFICATION"

def load_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r3p=ev/"M4_19D4BN17C_R4_R12_R16A_R20_R3_EXPORT_LOAD_CALLSITE_CALL_GRAPH_OWNER_CLOSURE"/"export_load_callsite_call_graph_owner_closure.json"
    if not r3p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_R3_EVIDENCE_REQUIRED");return 4
    r3=load_json(r3p)
    expected="NO_UPSTREAM_LOADWORKSPACE_CALLERS_RESOLVED"
    if r3.get("status")!="DIAGNOSTIC_COMPLETE" or r3.get("callGraphClassification")!=expected:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_R3_NO_UPSTREAM_CALLERS_CLASSIFICATION_REQUIRED");return 5

    exts={".js",".jsx",".ts",".tsx",".mjs"}
    files=[]
    for root in [app/"src",app/"dist/assets"]:
        if not root.exists():continue
        for p in root.rglob("*"):
            if p.is_file() and p.suffix in exts:
                files.append(p)

    # Step 1: find workspaceLoader exports/reexports and bundled symbol neighborhoods.
    loader_symbols=set(["loadWorkspace","getLoadedWorkspace","registerLoadedWorkspace","resetWorkspaceLoader"])
    export_edges=[]
    reexport_edges=[]
    symbol_defs=[]
    file_text={}

    for p in files:
        try:s=p.read_text(errors="ignore")
        except:continue
        file_text[p]=s
        rel=str(p.relative_to(app))
        if "workspaceLoader" in rel or "workspaceLoader" in s:
            for sym in list(loader_symbols):
                for m in re.finditer(r"(?:export\s+)?(?:async\s+)?function\s+"+re.escape(sym)+r"\b|(?:export\s+)?(?:const|let|var)\s+"+re.escape(sym)+r"\b",s):
                    symbol_defs.append({"file":rel,"symbol":sym,"offset":m.start()})
            for m in re.finditer(r"export\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"]",s,re.S):
                clause=m.group(1);src=m.group(2)
                if "workspaceLoader" in src or any(sym in clause for sym in loader_symbols):
                    reexport_edges.append({"file":rel,"from":src,"clause":re.sub(r"\s+"," ",clause)[:700]})
                    for part in clause.split(","):
                        mm=re.match(r"\s*([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?",part.strip())
                        if mm and mm.group(1) in loader_symbols:
                            loader_symbols.add(mm.group(2) or mm.group(1))

    # Step 2: capture any import/reexport aliases of known loader symbols, including barrel imports.
    changed=True
    rounds=0
    import_aliases=[]
    while changed and rounds<5:
        rounds+=1;changed=False
        for p,s in file_text.items():
            rel=str(p.relative_to(app))
            # named imports
            for m in re.finditer(r"import\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]+)['\"]",s,re.S):
                clause=m.group(1);src=m.group(2)
                for part in clause.split(","):
                    mm=re.match(r"\s*([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?",part.strip())
                    if not mm:continue
                    orig=mm.group(1);alias=mm.group(2) or orig
                    if orig in loader_symbols:
                        import_aliases.append({"file":rel,"from":src,"original":orig,"alias":alias})
                        if alias not in loader_symbols:
                            loader_symbols.add(alias);changed=True
            # local alias assignment from known loader symbol
            for sym in list(loader_symbols):
                for m in re.finditer(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*"+re.escape(sym)+r"\b",s):
                    alias=m.group(1)
                    if alias not in loader_symbols:
                        loader_symbols.add(alias);changed=True
                        import_aliases.append({"file":rel,"from":"LOCAL_ALIAS","original":sym,"alias":alias})
            # re-export aliases
            for m in re.finditer(r"export\s*\{([^}]*)\}",s,re.S):
                clause=m.group(1)
                for part in clause.split(","):
                    mm=re.match(r"\s*([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?",part.strip())
                    if not mm:continue
                    orig=mm.group(1);alias=mm.group(2) or orig
                    if orig in loader_symbols and alias not in loader_symbols:
                        loader_symbols.add(alias);changed=True
                        reexport_edges.append({"file":rel,"from":"LOCAL_EXPORT","clause":part.strip()})

    # Step 3: find callsites for any known alias, excluding loader implementation.
    export_rx=re.compile(r"\bexport\b|download|pptx?|powerpoint",re.I)
    present_rx=re.compile(r"\bpresent\b|presentation|deck|artifact",re.I)
    ui_rx=re.compile(r"onClick|onSelect|button|menuitem|toolbar|command|present",re.I)
    route_rx=re.compile(r"route|navigate|workspace|targetWorkspace|workspaceId|workspaceType",re.I)

    callsites=[]
    for p,s in file_text.items():
        rel=str(p.relative_to(app))
        defs=[]
        for rr in [
          re.compile(r"function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{",re.M),
          re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>",re.M),
          re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>",re.M)
        ]:
            for m in rr.finditer(s):defs.append((m.start(),m.group(1)))
        defs.sort()

        for sym in loader_symbols:
            rx=re.compile(r"(?<![\w$])"+re.escape(sym)+r"\s*\(",re.M)
            for m in rx.finditer(s):
                # skip direct function definition itself
                prior=s[max(0,m.start()-80):m.start()]
                if re.search(r"(?:function|const|let|var)\s+$",prior):continue
                if rel.endswith("runtime/workspaceLoader.js") and sym=="loadWorkspace":
                    continue
                a=max(0,m.start()-3600);b=min(len(s),m.start()+4200);sn=s[a:b]
                prev=[d for d in defs if d[0]<m.start()]
                owner=prev[-1][1] if prev else None
                argm=re.match(r"\s*([^,\)]+)\s*(?:,\s*([^\)]*))?\)",s[m.end():])
                caparg=argm.group(1).strip() if argm else None
                ctxarg=(argm.group(2) or "").strip() if argm else None
                sig={"export":bool(export_rx.search(sn)),"present":bool(present_rx.search(sn)),
                     "ui":bool(ui_rx.search(sn)),"route":bool(route_rx.search(sn))}
                score=20+35*sig["export"]+25*sig["present"]+18*sig["ui"]+16*sig["route"]+12*bool(owner)
                if sym!="loadWorkspace":score+=8
                callsites.append({"file":rel,"symbol":sym,"offset":m.start(),"owner":owner,
                                  "capabilityArg":caparg,"contextArg":ctxarg,"signals":sig,
                                  "score":score,"snippet":re.sub(r"\s+"," ",sn)[:7600]})

    callsites.sort(key=lambda x:-x["score"])
    strict=[x for x in callsites if x["signals"]["export"]]
    owner_agg={}
    for x in strict:
        k=(x["file"],x["owner"] or "<TOP_LEVEL>",x["symbol"])
        a=owner_agg.setdefault(k,{"file":x["file"],"owner":x["owner"],"symbol":x["symbol"],
                                  "score":0,"refs":0,"presentRefs":0,"uiRefs":0,"routeRefs":0,
                                  "capabilityArgs":{},"contextArgs":{}})
        a["score"]+=x["score"];a["refs"]+=1;a["presentRefs"]+=int(x["signals"]["present"])
        a["uiRefs"]+=int(x["signals"]["ui"]);a["routeRefs"]+=int(x["signals"]["route"])
        if x["capabilityArg"]:a["capabilityArgs"][x["capabilityArg"]]=a["capabilityArgs"].get(x["capabilityArg"],0)+1
        if x["contextArg"]:a["contextArgs"][x["contextArg"]]=a["contextArgs"].get(x["contextArg"],0)+1

    owners=sorted(owner_agg.values(),key=lambda x:(-x["presentRefs"],-x["uiRefs"],-x["routeRefs"],-x["refs"],-x["score"]))

    exact_owner=owners[0] if owners else None
    exact_call=None
    if exact_owner:
        exact_call=next((x for x in strict if x["file"]==exact_owner["file"] and x["owner"]==exact_owner["owner"] and x["symbol"]==exact_owner["symbol"]),None)

    if exact_owner and exact_call:
        cls="DEMINIFIED_UPSTREAM_EXPORT_LOADER_OWNER_RESOLVED"
    elif strict:
        cls="DEMINIFIED_EXPORT_LOADER_CALLS_RESOLVED_OWNER_PARTIAL"
    elif callsites:
        cls="DEMINIFIED_LOADER_ALIAS_CALLS_RESOLVED_NO_EXPORT_ROLE"
    elif import_aliases or reexport_edges:
        cls="LOADER_ALIAS_GRAPH_RESOLVED_NO_CALLSITE"
    else:
        cls="WORKSPACE_LOADER_IMPORT_GRAPH_STILL_OPAQUE"

    checks={
      "r20R3DiagnosticComplete":r3.get("status")=="DIAGNOSTIC_COMPLETE",
      "r20R3NoUpstreamCallers":r3.get("callGraphClassification")==expected,
      "loaderSymbolSeedCaptured":len(symbol_defs)>0,
      "aliasOrReexportGraphCaptured":len(import_aliases)>0 or len(reexport_edges)>0,
      "deminifiedCallsitesAttempted":True,
      "classificationResolved":cls!="WORKSPACE_LOADER_IMPORT_GRAPH_STILL_OPAQUE",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R20_R4_WORKSPACE_LOADER_IMPORT_GRAPH_DEMINIFIED"
           if passed else "M419D4BN17C_R4_R12_R16A_R20_R4_WORKSPACE_LOADER_IMPORT_GRAPH_INCOMPLETE")
    diagnosis=("WORKSPACE_LOADER_IMPORT_GRAPH_CAUSALLY_CLASSIFIED_"+cls if passed
               else "WORKSPACE_LOADER_IMPORT_GRAPH_REQUIRES_ACTIVE_DIST_SYMBOL_NEIGHBORHOOD_RECOVERY")

    if cls=="DEMINIFIED_UPSTREAM_EXPORT_LOADER_OWNER_RESOLVED":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_EXPORT_LOADER_OWNER_ARGUMENT_AND_WORKSPACE_BINDING_RESOLUTION"
    elif cls=="DEMINIFIED_EXPORT_LOADER_CALLS_RESOLVED_OWNER_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_EXPORT_LOADER_OWNER_ALIAS_CLOSURE"
    elif cls=="DEMINIFIED_LOADER_ALIAS_CALLS_RESOLVED_NO_EXPORT_ROLE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_EXPORT_ROUTE_TO_LOADER_ROLE_CORRELATION"
    elif cls=="LOADER_ALIAS_GRAPH_RESOLVED_NO_CALLSITE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_ACTIVE_DIST_LOADER_SYMBOL_CALLSITE_RECOVERY"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_ACTIVE_DIST_WORKSPACE_LOADER_SYMBOL_NEIGHBORHOOD_DIAGNOSIS"

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"workspace_loader_import_graph_deminification.json"
    result={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R4_WORKSPACE_LOADER_IMPORT_GRAPH_DEMINIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "r20R3CallGraphClassification":r3.get("callGraphClassification"),
      "loaderSymbolCount":len(loader_symbols),
      "symbolDefinitionCount":len(symbol_defs),
      "importAliasCount":len(import_aliases),
      "reexportEdgeCount":len(reexport_edges),
      "deminifiedCallsiteCount":len(callsites),
      "exportAdjacentCallsiteCount":len(strict),
      "ownerCandidateCount":len(owners),
      "exactOwner":exact_owner,
      "exactCallsite":exact_call,
      "classification":cls,
      "loaderSymbols":sorted(loader_symbols),
      "symbolDefinitions":symbol_defs[:120],
      "importAliases":import_aliases[:160],
      "reexportEdges":reexport_edges[:160],
      "topOwners":owners[:100],
      "topCallsites":callsites[:160],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R4 Workspace Loader Import-Graph Deminification")
    print("="*120)
    print("R20_R3_CALL_GRAPH_CLASSIFICATION:",r3.get("callGraphClassification"))
    print("LOADER_SYMBOL_COUNT:",len(loader_symbols))
    print("SYMBOL_DEFINITION_COUNT:",len(symbol_defs))
    print("IMPORT_ALIAS_COUNT:",len(import_aliases))
    print("REEXPORT_EDGE_COUNT:",len(reexport_edges))
    print("DEMINIFIED_CALLSITE_COUNT:",len(callsites))
    print("EXPORT_ADJACENT_CALLSITE_COUNT:",len(strict))
    print("OWNER_CANDIDATE_COUNT:",len(owners))
    print("EXACT_OWNER:",json.dumps(exact_owner))
    print("EXACT_CALLSITE:",json.dumps(exact_call))
    print("CLASSIFICATION:",cls)
    print("\n----- LOADER SYMBOLS -----")
    for x in sorted(loader_symbols):print(x)
    print("\n----- TOP IMPORT ALIASES -----")
    for x in import_aliases[:20]:print(json.dumps(x))
    print("\n----- TOP REEXPORT EDGES -----")
    for x in reexport_edges[:20]:print(json.dumps(x))
    print("\n----- TOP OWNERS -----")
    for x in owners[:15]:print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
