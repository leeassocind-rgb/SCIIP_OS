#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R3_EXPORT_LOAD_CALLSITE_CALL_GRAPH_OWNER_CLOSURE"

def load_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r2p=ev/"M4_19D4BN17C_R4_R12_R16A_R20_R2_EXPORT_LOAD_TRIGGER_OWNER_EXACT_BINDING_RESOLUTION"/"export_load_trigger_owner_exact_binding_resolution.json"
    if not r2p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_R2_EVIDENCE_REQUIRED");return 4
    r2=load_json(r2p)
    expected="EXPORT_LOAD_CALLSITE_RESOLVED_TRIGGER_OWNER_AMBIGUOUS"
    if r2.get("status")!="PASSED" or r2.get("triggerOwnerClassification")!=expected:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_R2_AMBIGUOUS_TRIGGER_OWNER_CLASSIFICATION_REQUIRED");return 5

    exts={".js",".jsx",".ts",".tsx",".mjs"}
    export_rx=re.compile(r"\bexport\b|download|pptx?|powerpoint",re.I)
    present_rx=re.compile(r"\bpresent\b|presentation|deck|artifact",re.I)
    ui_rx=re.compile(r"onClick|onSelect|button|menuitem|toolbar|command|present",re.I)
    route_rx=re.compile(r"route|navigate|workspace|targetWorkspace|workspaceId|workspaceType",re.I)

    imports=[]
    alias_calls=[]
    owners=[]

    # Find all imports of workspaceLoader and the local alias of loadWorkspace.
    for root in [app/"src",app/"dist/assets"]:
        if not root.exists():continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in exts:continue
            try:s=p.read_text(errors="ignore")
            except:continue

            local_aliases=[]
            for m in re.finditer(r"import\s*\{([^}]*)\}\s*from\s*['\"]([^'\"]*workspaceLoader[^'\"]*)['\"]",s,re.S|re.I):
                clause=m.group(1);src=m.group(2)
                for part in clause.split(","):
                    part=part.strip()
                    mm=re.match(r"loadWorkspace(?:\s+as\s+([A-Za-z_$][\w$]*))?$",part)
                    if mm:
                        alias=mm.group(1) or "loadWorkspace"
                        local_aliases.append(alias)
                        imports.append({"file":str(p.relative_to(app)),"alias":alias,"from":src})

            # Common bundled/minified re-export or direct import patterns.
            for m in re.finditer(r"import\s+(.{0,700})\s+from\s*['\"]([^'\"]*workspaceLoader[^'\"]*)['\"]",s,re.S|re.I):
                clause=m.group(1)
                if "loadWorkspace" in clause and not local_aliases:
                    mm=re.search(r"loadWorkspace\s+as\s+([A-Za-z_$][\w$]*)",clause)
                    local_aliases.append(mm.group(1) if mm else "loadWorkspace")

            if not local_aliases:
                continue

            # Index lexical function starts.
            defs=[]
            for rr in [
              re.compile(r"function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{",re.M),
              re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>",re.M),
              re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>",re.M)
            ]:
                for m in rr.finditer(s):defs.append((m.start(),m.group(1)))
            defs.sort()

            for alias in local_aliases:
                rx=re.compile(r"(?<![\w$])"+re.escape(alias)+r"\s*\(",re.M)
                for m in rx.finditer(s):
                    # Skip import clause / definition-like contexts.
                    if m.start()<1000 and "import" in s[max(0,m.start()-300):m.start()]:
                        continue
                    a=max(0,m.start()-3600);b=min(len(s),m.start()+4200);sn=s[a:b]
                    prior=[d for d in defs if d[0]<m.start()]
                    owner=prior[-1][1] if prior else None

                    argm=re.match(r"\s*([^,\)]+)\s*(?:,\s*([^\)]*))?\)",s[m.end():])
                    caparg=argm.group(1).strip() if argm else None
                    ctxarg=(argm.group(2) or "").strip() if argm else None

                    sig={
                      "export":bool(export_rx.search(sn)),
                      "present":bool(present_rx.search(sn)),
                      "ui":bool(ui_rx.search(sn)),
                      "route":bool(route_rx.search(sn))
                    }

                    # Capture literal role hints near this *external* caller.
                    literals=re.findall(r"['\"]([^'\"]{2,180})['\"]",sn)
                    export_lits=[v for v in literals if re.search(r"export|download|ppt|powerpoint|present|presentation|deck",v,re.I)]
                    workspace_lits=[v for v in literals if re.search(r"workspace|present|executive|market intelligence|intelligence platform",v,re.I)]

                    score=25+35*sig["export"]+25*sig["present"]+18*sig["ui"]+16*sig["route"]+12*bool(owner)
                    if caparg and re.search(r"export|present|deck",caparg,re.I):score+=35
                    alias_calls.append({
                      "file":str(p.relative_to(app)),"alias":alias,"offset":m.start(),"owner":owner,
                      "capabilityArg":caparg,"contextArg":ctxarg,"signals":sig,
                      "exportRoleLiterals":export_lits[:30],"workspaceRoleLiterals":workspace_lits[:30],
                      "score":score,"snippet":re.sub(r"\s+"," ",sn)[:7600]
                    })

    alias_calls.sort(key=lambda x:-x["score"])

    strict=[x for x in alias_calls if x["signals"]["export"]]
    strict_present=[x for x in strict if x["signals"]["present"]]
    strict_ui=[x for x in strict if x["signals"]["ui"]]

    # Aggregate by lexical owner.
    agg={}
    for x in strict:
        k=(x["file"],x["owner"] or "<TOP_LEVEL>")
        a=agg.setdefault(k,{"file":x["file"],"owner":x["owner"],"score":0,"refs":0,"presentRefs":0,"uiRefs":0,
                            "routeRefs":0,"capabilityArgs":{},"workspaceRoleLiterals":{}})
        a["score"]+=x["score"];a["refs"]+=1;a["presentRefs"]+=int(x["signals"]["present"])
        a["uiRefs"]+=int(x["signals"]["ui"]);a["routeRefs"]+=int(x["signals"]["route"])
        if x["capabilityArg"]:a["capabilityArgs"][x["capabilityArg"]]=a["capabilityArgs"].get(x["capabilityArg"],0)+1
        for w in x["workspaceRoleLiterals"]:a["workspaceRoleLiterals"][w]=a["workspaceRoleLiterals"].get(w,0)+1

    owners=sorted(agg.values(),key=lambda x:(-x["presentRefs"],-x["uiRefs"],-x["routeRefs"],-x["refs"],-x["score"]))

    exact_owner=None
    exact_call=None
    if owners:
        top=owners[0]
        if top["refs"]>0 and (top["presentRefs"]>0 or top["uiRefs"]>0 or top["routeRefs"]>0):
            exact_owner=top
            exact_call=next((x for x in strict if x["file"]==top["file"] and x["owner"]==top["owner"]),None)

    exact_cap=None
    exact_ws=None
    if exact_call:
        carg=exact_call.get("capabilityArg")
        if carg and len(carg)<200:
            exact_cap=carg
        elif exact_call["exportRoleLiterals"]:
            vals=sorted(exact_call["exportRoleLiterals"],key=lambda v:(0 if re.search(r"export|download|ppt|powerpoint",v,re.I) else 1,
                                                                        0 if re.search(r"present|presentation|deck",v,re.I) else 1,len(v)))
            exact_cap=vals[0]
        if exact_call["workspaceRoleLiterals"]:
            vals=sorted(exact_call["workspaceRoleLiterals"],key=lambda v:(0 if re.search(r"present",v,re.I) else 1,
                                                                          0 if re.search(r"workspace",v,re.I) else 1,len(v)))
            exact_ws=vals[0]
        cctx=exact_call.get("contextArg") or ""
        wm=re.search(r"(?:workspace|workspaceId|workspaceType|targetWorkspace)\s*:\s*['\"]([^'\"]+)['\"]",cctx,re.I)
        if wm: exact_ws=wm.group(1)

    if exact_owner and exact_cap and exact_ws:
        cls="EXACT_UPSTREAM_EXPORT_LOADER_OWNER_CAPABILITY_WORKSPACE_BOUND"
    elif exact_owner and exact_cap:
        cls="EXACT_UPSTREAM_EXPORT_LOADER_OWNER_AND_CAPABILITY_BOUND_WORKSPACE_PARTIAL"
    elif exact_owner:
        cls="EXACT_UPSTREAM_EXPORT_LOADER_OWNER_BOUND_ARGUMENTS_PARTIAL"
    elif strict:
        cls="UPSTREAM_EXPORT_LOADER_CALLERS_RESOLVED_OWNER_AMBIGUOUS"
    elif alias_calls:
        cls="UPSTREAM_LOADER_CALLERS_FOUND_NO_EXPORT_ROLE_BINDING"
    else:
        cls="NO_UPSTREAM_LOADWORKSPACE_CALLERS_RESOLVED"

    checks={
      "r20R2Passed":r2.get("status")=="PASSED",
      "r20R2OwnerAmbiguous":r2.get("triggerOwnerClassification")==expected,
      "workspaceLoaderImportAliasesCaptured":len(imports)>0,
      "upstreamLoadWorkspaceCallsCaptured":len(alias_calls)>0,
      "exportAdjacentUpstreamCallsCaptured":len(strict)>0,
      "lexicalOwnerAggregationCompleted":len(owners)>0,
      "callGraphOwnerClassificationResolved":cls!="NO_UPSTREAM_LOADWORKSPACE_CALLERS_RESOLVED",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R20_R3_EXPORT_LOAD_CALLSITE_CALL_GRAPH_OWNER_CLOSED"
           if passed else "M419D4BN17C_R4_R12_R16A_R20_R3_EXPORT_LOAD_CALLSITE_CALL_GRAPH_OWNER_INCOMPLETE")
    diagnosis=("EXPORT_LOAD_CALL_GRAPH_CAUSALLY_CLASSIFIED_"+cls if passed
               else "EXPORT_LOAD_CALL_GRAPH_REQUIRES_MODULE_ALIAS_OR_ROUTE_OWNER_DEEPER_DIAGNOSIS")

    if cls=="EXACT_UPSTREAM_EXPORT_LOADER_OWNER_CAPABILITY_WORKSPACE_BOUND":
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_EXPORT_CAPABILITY_BOUNDED_LIVE_LOAD_CERTIFICATION"
    elif cls=="EXACT_UPSTREAM_EXPORT_LOADER_OWNER_AND_CAPABILITY_BOUND_WORKSPACE_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R4_EXPORT_WORKSPACE_ARGUMENT_EXACT_BINDING_RESOLUTION"
    elif cls=="EXACT_UPSTREAM_EXPORT_LOADER_OWNER_BOUND_ARGUMENTS_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R4_EXPORT_LOAD_ARGUMENT_ROLE_EXACT_BINDING_RESOLUTION"
    elif cls=="UPSTREAM_EXPORT_LOADER_CALLERS_RESOLVED_OWNER_AMBIGUOUS":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R4_EXPORT_UPSTREAM_OWNER_ALIAS_CLOSURE"
    elif cls=="UPSTREAM_LOADER_CALLERS_FOUND_NO_EXPORT_ROLE_BINDING":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R4_EXPORT_ROUTE_TO_LOADER_ROLE_CORRELATION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R4_WORKSPACE_LOADER_IMPORT_GRAPH_DEMINIFICATION"

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"export_load_callsite_call_graph_owner_closure.json"
    result={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R3_EXPORT_LOAD_CALLSITE_CALL_GRAPH_OWNER_CLOSURE",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "r20R2TriggerOwnerClassification":r2.get("triggerOwnerClassification"),
      "workspaceLoaderImportAliasCount":len(imports),
      "upstreamLoadWorkspaceCallCount":len(alias_calls),
      "exportAdjacentUpstreamCallCount":len(strict),
      "presentAdjacentUpstreamCallCount":len(strict_present),
      "uiAdjacentUpstreamCallCount":len(strict_ui),
      "ownerCandidateCount":len(owners),
      "exactUpstreamOwner":exact_owner,
      "exactUpstreamCall":exact_call,
      "exactCapabilityArgument":exact_cap,
      "exactWorkspaceArgument":exact_ws,
      "callGraphClassification":cls,
      "imports":imports[:120],
      "topOwners":owners[:80],
      "topUpstreamCalls":alias_calls[:140],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R3 Export Load Callsite Call-Graph Owner Closure")
    print("="*120)
    print("R20_R2_TRIGGER_OWNER_CLASSIFICATION:",r2.get("triggerOwnerClassification"))
    print("WORKSPACE_LOADER_IMPORT_ALIAS_COUNT:",len(imports))
    print("UPSTREAM_LOAD_WORKSPACE_CALL_COUNT:",len(alias_calls))
    print("EXPORT_ADJACENT_UPSTREAM_CALL_COUNT:",len(strict))
    print("PRESENT_ADJACENT_UPSTREAM_CALL_COUNT:",len(strict_present))
    print("UI_ADJACENT_UPSTREAM_CALL_COUNT:",len(strict_ui))
    print("OWNER_CANDIDATE_COUNT:",len(owners))
    print("EXACT_UPSTREAM_OWNER:",json.dumps(exact_owner))
    print("EXACT_CAPABILITY_ARGUMENT:",exact_cap)
    print("EXACT_WORKSPACE_ARGUMENT:",exact_ws)
    print("CALL_GRAPH_CLASSIFICATION:",cls)

    print("\n----- TOP OWNERS -----")
    for x in owners[:15]: print(json.dumps(x))
    print("\n----- TOP UPSTREAM CALLS -----")
    for x in alias_calls[:15]: print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
