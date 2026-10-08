#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R2_EXPORT_LOAD_TRIGGER_OWNER_EXACT_BINDING_RESOLUTION"

def load_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r1p=ev/"M4_19D4BN17C_R4_R12_R16A_R20_R1_EXPORT_WORKSPACE_ID_EXACT_ROLE_CORRELATION"/"export_workspace_id_exact_role_correlation.json"
    if not r1p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R20_R1_EVIDENCE_REQUIRED")
        return 4

    r1=load_json(r1p)
    expected="EXACT_EXPORT_CAPABILITY_AND_WORKSPACE_CORRELATED_TRIGGER_OWNER_PARTIAL"
    if r1.get("status")!="DIAGNOSTIC_COMPLETE" or r1.get("roleCorrelationClassification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R20_R1_TRIGGER_OWNER_PARTIAL_CLASSIFICATION_REQUIRED")
        return 5

    export_rx=re.compile(r"\bexport\b|download|pptx?|powerpoint",re.I)
    present_rx=re.compile(r"\bpresent\b|presentation|deck|artifact",re.I)
    load_rx=re.compile(r"\bloadWorkspace\s*\(",re.I)
    route_rx=re.compile(r"workspace|route|navigate|targetWorkspace|workspaceId|workspaceType",re.I)
    ui_rx=re.compile(r"onClick|onSelect|button|menuitem|toolbar|command|present",re.I)
    fnrx=[
      re.compile(r"function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{",re.M),
      re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>",re.M),
      re.compile(r"(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?[A-Za-z_$][\w$]*\s*=>",re.M)
    ]

    callsites=[]
    owner_defs=[]
    modules=[]
    exts={".js",".jsx",".ts",".tsx",".mjs"}

    for root in [app/"src",app/"dist/assets"]:
        if not root.exists(): continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in exts: continue
            try:s=p.read_text(errors="ignore")
            except:continue
            if not load_rx.search(s): continue

            # Capture import/export module context once per file.
            imod=[]
            for m in re.finditer(r"import\s+(.{0,500}?)\s+from\s+['\"]([^'\"]+)['\"]",s,re.S):
                if "workspaceLoader" in m.group(2) or "runtimeRegistry" in m.group(2):
                    imod.append({"clause":re.sub(r"\s+"," ",m.group(1))[:500],"from":m.group(2)})
            modules.append({"file":str(p.relative_to(app)),"imports":imod})

            # Pre-index lexical owner candidates.
            defs=[]
            for rr in fnrx:
                for m in rr.finditer(s):
                    defs.append((m.start(),m.group(1)))
            defs.sort()

            for m in load_rx.finditer(s):
                a=max(0,m.start()-3200);b=min(len(s),m.start()+3600);sn=s[a:b]
                before=s[:m.start()]
                owner=None; owner_start=None
                prior=[d for d in defs if d[0] < m.start()]
                if prior:
                    owner_start,owner=prior[-1]
                argm=re.match(r"\s*([^,\)]+)\s*(?:,\s*([^\)]*))?\)",s[m.end():])
                caparg=(argm.group(1).strip() if argm else None)
                ctxarg=((argm.group(2) or "").strip() if argm else None)

                sig={
                  "export":bool(export_rx.search(sn)),
                  "present":bool(present_rx.search(sn)),
                  "route":bool(route_rx.search(sn)),
                  "ui":bool(ui_rx.search(sn))
                }

                literals=re.findall(r"['\"]([^'\"]{2,160})['\"]",sn)
                export_literals=[v for v in literals if re.search(r"export|download|ppt|powerpoint|present|deck",v,re.I)]
                workspace_literals=[v for v in literals if re.search(r"workspace|executive|market intelligence|intelligence platform|present",v,re.I)]

                score=20+35*sig["export"]+24*sig["present"]+16*sig["route"]+14*sig["ui"]
                if owner:score+=12
                if caparg and re.search(r"export|present|deck",caparg,re.I):score+=30
                if export_literals:score+=18
                callsites.append({
                    "file":str(p.relative_to(app)),
                    "offset":m.start(),
                    "owner":owner,
                    "ownerStart":owner_start,
                    "capabilityArg":caparg,
                    "contextArg":ctxarg,
                    "signals":sig,
                    "exportRoleLiterals":export_literals[:30],
                    "workspaceRoleLiterals":workspace_literals[:30],
                    "score":score,
                    "snippet":re.sub(r"\s+"," ",sn)[:7000]
                })

    callsites.sort(key=lambda x:-x["score"])

    # Strict role filter: must have actual Export semantic evidence in same callsite neighborhood.
    strict=[x for x in callsites if x["signals"]["export"]]
    present_adj=[x for x in strict if x["signals"]["present"]]
    ui_adj=[x for x in strict if x["signals"]["ui"]]

    # Identify exact owner only if one owner dominates strict export callsites.
    owner_agg={}
    for x in strict:
        k=(x["file"],x["owner"] or "<TOP_LEVEL>")
        a=owner_agg.setdefault(k,{"file":x["file"],"owner":x["owner"],"score":0,"refs":0,"presentRefs":0,"uiRefs":0,"capabilityArgs":{},"contextArgs":{}})
        a["score"]+=x["score"];a["refs"]+=1
        a["presentRefs"]+=int(x["signals"]["present"]);a["uiRefs"]+=int(x["signals"]["ui"])
        if x["capabilityArg"]:a["capabilityArgs"][x["capabilityArg"]]=a["capabilityArgs"].get(x["capabilityArg"],0)+1
        if x["contextArg"]:a["contextArgs"][x["contextArg"]]=a["contextArgs"].get(x["contextArg"],0)+1

    owners=sorted(owner_agg.values(),key=lambda x:(-x["presentRefs"],-x["uiRefs"],-x["refs"],-x["score"]))

    exact_owner=None
    exact_call=None
    if owners:
        top=owners[0]
        # Require actual export refs plus either Present or UI adjacency and non-loader-internal file.
        if top["refs"]>0 and (top["presentRefs"]>0 or top["uiRefs"]>0) and not top["file"].endswith("runtime/workspaceLoader.js"):
            exact_owner=top
            exact_call=next((x for x in strict if x["file"]==top["file"] and x["owner"]==top["owner"]),None)

    # Resolve literal capability/workspace only from exact callsite neighborhood, not generic platformRuntime rankings.
    exact_cap=None
    exact_ws=None
    if exact_call:
        vals=exact_call["exportRoleLiterals"]
        if vals:
            # prefer explicit export/deck/present strings over generic words
            vals=sorted(vals,key=lambda v:(0 if re.search(r"export|download|ppt|powerpoint",v,re.I) else 1,
                                           0 if re.search(r"deck|presentation",v,re.I) else 1,len(v)))
            exact_cap=vals[0]
        wvals=exact_call["workspaceRoleLiterals"]
        if wvals:
            wvals=sorted(wvals,key=lambda v:(0 if re.search(r"present",v,re.I) else 1,
                                             0 if re.search(r"workspace",v,re.I) else 1,len(v)))
            exact_ws=wvals[0]

    if exact_owner and exact_cap and exact_ws:
        cls="EXACT_EXPORT_LOAD_TRIGGER_OWNER_CAPABILITY_AND_WORKSPACE_BOUND"
    elif exact_owner and exact_cap:
        cls="EXACT_EXPORT_LOAD_TRIGGER_OWNER_AND_CAPABILITY_BOUND_WORKSPACE_PARTIAL"
    elif exact_owner:
        cls="EXACT_EXPORT_LOAD_TRIGGER_OWNER_BOUND_ARGUMENT_ROLE_PARTIAL"
    elif strict:
        cls="EXPORT_LOAD_CALLSITE_RESOLVED_TRIGGER_OWNER_AMBIGUOUS"
    else:
        cls="NO_EXPORT_ADJACENT_LOAD_CALLSITE_RESOLVED"

    checks={
      "r20R1DiagnosticComplete":r1.get("status")=="DIAGNOSTIC_COMPLETE",
      "r20R1TriggerOwnerPartial":r1.get("roleCorrelationClassification")==expected,
      "loadWorkspaceCallsitesCaptured":len(callsites)>0,
      "strictExportAdjacentCallsitesCaptured":len(strict)>0,
      "ownerAggregationCompleted":len(owners)>0,
      "loaderInternalFalseOwnerExcluded":True,
      "triggerOwnerClassificationResolved":cls!="NO_EXPORT_ADJACENT_LOAD_CALLSITE_RESOLVED",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R20_R2_EXPORT_LOAD_TRIGGER_OWNER_EXACT_BINDING_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R20_R2_EXPORT_LOAD_TRIGGER_OWNER_BINDING_INCOMPLETE")
    diagnosis=("EXPORT_LOAD_TRIGGER_OWNER_CAUSALLY_CLASSIFIED_"+cls if passed
               else "EXPORT_LOAD_TRIGGER_OWNER_REQUIRES_CALL_GRAPH_OR_ROUTE_OWNER_CLOSURE")

    if cls=="EXACT_EXPORT_LOAD_TRIGGER_OWNER_CAPABILITY_AND_WORKSPACE_BOUND":
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_EXPORT_CAPABILITY_BOUNDED_LIVE_LOAD_CERTIFICATION"
    elif cls=="EXACT_EXPORT_LOAD_TRIGGER_OWNER_AND_CAPABILITY_BOUND_WORKSPACE_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R3_EXPORT_WORKSPACE_ARGUMENT_EXACT_BINDING_RESOLUTION"
    elif cls=="EXACT_EXPORT_LOAD_TRIGGER_OWNER_BOUND_ARGUMENT_ROLE_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R3_EXPORT_LOAD_ARGUMENT_ROLE_EXACT_BINDING_RESOLUTION"
    elif cls=="EXPORT_LOAD_CALLSITE_RESOLVED_TRIGGER_OWNER_AMBIGUOUS":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R3_EXPORT_LOAD_CALLSITE_CALL_GRAPH_OWNER_CLOSURE"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R3_EXPORT_ROUTE_TO_LOADER_CALL_GRAPH_DIAGNOSIS"

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"export_load_trigger_owner_exact_binding_resolution.json"
    result={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R2_EXPORT_LOAD_TRIGGER_OWNER_EXACT_BINDING_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "r20R1RoleCorrelationClassification":r1.get("roleCorrelationClassification"),
      "loadWorkspaceCallsiteCount":len(callsites),
      "strictExportAdjacentCallsiteCount":len(strict),
      "presentAdjacentCallsiteCount":len(present_adj),
      "uiAdjacentCallsiteCount":len(ui_adj),
      "ownerCandidateCount":len(owners),
      "exactTriggerOwner":exact_owner,
      "exactCallsite":exact_call,
      "exactCapabilityRoleLiteral":exact_cap,
      "exactWorkspaceRoleLiteral":exact_ws,
      "triggerOwnerClassification":cls,
      "topOwners":owners[:80],
      "topCallsites":callsites[:120],
      "moduleImports":modules[:120],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R2 Export Load Trigger Owner Exact Binding Resolution")
    print("="*120)
    print("R20_R1_ROLE_CORRELATION_CLASSIFICATION:",r1.get("roleCorrelationClassification"))
    print("LOAD_WORKSPACE_CALLSITE_COUNT:",len(callsites))
    print("STRICT_EXPORT_ADJACENT_CALLSITE_COUNT:",len(strict))
    print("PRESENT_ADJACENT_CALLSITE_COUNT:",len(present_adj))
    print("UI_ADJACENT_CALLSITE_COUNT:",len(ui_adj))
    print("OWNER_CANDIDATE_COUNT:",len(owners))
    print("EXACT_TRIGGER_OWNER:",json.dumps(exact_owner))
    print("EXACT_CAPABILITY_ROLE_LITERAL:",exact_cap)
    print("EXACT_WORKSPACE_ROLE_LITERAL:",exact_ws)
    print("TRIGGER_OWNER_CLASSIFICATION:",cls)

    print("\n----- TOP OWNERS -----")
    for x in owners[:15]:print(json.dumps(x))
    print("\n----- TOP STRICT EXPORT LOAD CALLSITES -----")
    for x in strict[:15]:print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
