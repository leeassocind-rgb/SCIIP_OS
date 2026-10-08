#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R1_EXPORT_WORKSPACE_ID_EXACT_ROLE_CORRELATION"

def load_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def snippets(text, rx, pre=2200, post=3200, limit=80):
    out=[]
    for m in rx.finditer(text):
        a=max(0,m.start()-pre); b=min(len(text),m.start()+post)
        out.append((m.start(),text[a:b]))
        if len(out)>=limit:break
    return out

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r20p=ev/"M4_19D4BN17C_R4_R12_R16A_R20_EXACT_EXPORT_CAPABILITY_TRIGGER_AND_WORKSPACE_ID_BINDING_RESOLUTION"/"exact_export_capability_trigger_and_workspace_id_binding_resolution.json"
    if not r20p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_EVIDENCE_REQUIRED");return 4
    r20=load_json(r20p)
    if r20.get("status")!="DIAGNOSTIC_COMPLETE" or r20.get("bindingClassification")!="EXPORT_CAPABILITY_ID_RESOLVED_WORKSPACE_BINDING_PARTIAL":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_CAPABILITY_ID_RESOLVED_WORKSPACE_BINDING_PARTIAL_REQUIRED");return 5

    cap_candidates=[x.get("value") for x in (r20.get("capabilityIds") or []) if x.get("value")]
    ws_candidates=[x.get("value") for x in (r20.get("workspaceIds") or []) if x.get("value")]
    if not cap_candidates:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R20_CAPABILITY_CANDIDATES_REQUIRED");return 6

    files=[]
    for root in [app/"src",app/"dist/assets"]:
        if not root.exists():continue
        for p in root.rglob("*"):
            if p.is_file() and p.suffix in {".js",".jsx",".ts",".tsx",".mjs"}:
                files.append(p)

    export_rx=re.compile(r"\bexport\b|download|pptx?|powerpoint",re.I)
    present_rx=re.compile(r"\bpresent\b|presentation|deck|artifact",re.I)
    load_rx=re.compile(r"loadWorkspace|getLoadedWorkspace|registerLoadedWorkspace|getCapability|registerCapability",re.I)
    route_rx=re.compile(r"route|navigate|workspace|targetWorkspace|workspaceId|workspaceType",re.I)
    trigger_rx=re.compile(r"onClick|onSelect|activate|open|mount|initialize|bootstrap|navigate|route",re.I)

    correlations=[]
    reg_defs=[]
    trigger_owners=[]

    for p in files:
        try:s=p.read_text(errors="ignore")
        except:continue
        if not any(c in s for c in cap_candidates[:30]) and not export_rx.search(s):
            continue

        for cap in cap_candidates[:30]:
            if cap not in s:continue
            for off,sn in snippets(s,re.compile(re.escape(cap)),limit=40):
                sig={
                    "export":bool(export_rx.search(sn)),
                    "present":bool(present_rx.search(sn)),
                    "load":bool(load_rx.search(sn)),
                    "route":bool(route_rx.search(sn)),
                    "trigger":bool(trigger_rx.search(sn)),
                }
                ws_hits=[w for w in ws_candidates if w and re.search(re.escape(w),sn,re.I)]
                score=30 + 35*sig["export"] + 24*sig["present"] + 22*sig["load"] + 16*sig["route"] + 14*sig["trigger"] + 18*bool(ws_hits)
                if "executive" in cap.lower() and not sig["export"]: score-=18
                if "market-intelligence" in cap.lower() and sig["export"]: score+=8
                correlations.append({
                    "file":str(p.relative_to(app)),"offset":off,"capabilityId":cap,
                    "workspaceHits":ws_hits,"signals":sig,"score":score,
                    "snippet":re.sub(r"\s+"," ",sn)[:6200]
                })

        # Registration definitions with id/workspace/entry in same object-ish neighborhood.
        for m in re.finditer(r"(?:createCapabilityManifest|registerCapability)\s*\((.{0,2600})",s,re.I|re.S):
            sn=m.group(1)[:2600]
            idm=re.search(r"(?:id|capabilityId)\s*:\s*['\"]([^'\"]+)['\"]",sn,re.I)
            wsm=re.search(r"workspace\s*:\s*['\"]([^'\"]+)['\"]",sn,re.I)
            ent=re.search(r"entry\s*:\s*['\"]([^'\"]+)['\"]",sn,re.I)
            ff=re.search(r"featureFlag\s*:\s*['\"]([^'\"]+)['\"]",sn,re.I)
            if idm:
                reg_defs.append({
                    "file":str(p.relative_to(app)),
                    "capabilityId":idm.group(1),
                    "workspace":wsm.group(1) if wsm else None,
                    "entry":ent.group(1) if ent else None,
                    "featureFlag":ff.group(1) if ff else None,
                    "exportSignal":bool(export_rx.search(sn)),
                    "presentSignal":bool(present_rx.search(sn)),
                    "snippet":re.sub(r"\s+"," ",sn)[:2800]
                })

        # Trigger owner callsites: loadWorkspace(...) plus nearest function/control context.
        for m in re.finditer(r"loadWorkspace\s*\(([^\)]{0,500})\)",s,re.I):
            a=max(0,m.start()-1800);b=min(len(s),m.end()+1800);sn=s[a:b]
            cap_hit=next((c for c in cap_candidates if c in sn),None)
            ws_hit=next((w for w in ws_candidates if w and re.search(re.escape(w),sn,re.I)),None)
            owner=None
            owners=list(re.finditer(r"(?:function\s+([A-Za-z0-9_$]+)|const\s+([A-Za-z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>)",sn))
            if owners:
                oo=owners[-1];owner=oo.group(1) or oo.group(2)
            trigger_owners.append({
                "file":str(p.relative_to(app)),
                "capabilityHit":cap_hit,"workspaceHit":ws_hit,"owner":owner,
                "exportSignal":bool(export_rx.search(sn)),
                "presentSignal":bool(present_rx.search(sn)),
                "triggerSignal":bool(trigger_rx.search(sn)),
                "snippet":re.sub(r"\s+"," ",sn)[:4000]
            })

    correlations.sort(key=lambda x:-x["score"])

    # Aggregate capability -> workspace evidence.
    agg={}
    for x in correlations:
        c=x["capabilityId"]
        a=agg.setdefault(c,{"score":0,"references":0,"exportRefs":0,"presentRefs":0,"loadRefs":0,"workspaces":{}})
        a["score"]+=max(0,x["score"]);a["references"]+=1
        a["exportRefs"]+=int(x["signals"]["export"]);a["presentRefs"]+=int(x["signals"]["present"]);a["loadRefs"]+=int(x["signals"]["load"])
        for w in x["workspaceHits"]:a["workspaces"][w]=a["workspaces"].get(w,0)+1

    for r in reg_defs:
        c=r["capabilityId"]
        if c not in agg:continue
        a=agg[c];a["score"]+=40
        if r["exportSignal"]:a["score"]+=35;a["exportRefs"]+=1
        if r["presentSignal"]:a["score"]+=20;a["presentRefs"]+=1
        if r["workspace"]:a["workspaces"][r["workspace"]]=a["workspaces"].get(r["workspace"],0)+3

    ranked=[]
    for c,a in agg.items():
        ws=sorted(a["workspaces"].items(),key=lambda kv:-kv[1])
        ranked.append({"capabilityId":c,**a,"topWorkspace":ws[0][0] if ws else None,"workspaceEvidence":ws})
    ranked.sort(key=lambda x:(-x["exportRefs"],-x["score"],-x["loadRefs"]))

    top=ranked[0] if ranked else None
    exact_cap=top["capabilityId"] if top and top["exportRefs"]>0 else None
    exact_ws=top["topWorkspace"] if top and top["topWorkspace"] else None

    # Trigger owner must correlate to exact cap or at least export+present loader call.
    exact_trigger=None
    for t in trigger_owners:
        if exact_cap and t["capabilityHit"]==exact_cap and (t["exportSignal"] or t["presentSignal"]):
            exact_trigger=t;break
    if not exact_trigger:
        exact_trigger=next((t for t in trigger_owners if t["exportSignal"] and t["presentSignal"]),None)

    if exact_cap and exact_ws and exact_trigger:
        cls="EXACT_EXPORT_CAPABILITY_WORKSPACE_AND_TRIGGER_OWNER_CORRELATED"
    elif exact_cap and exact_ws:
        cls="EXACT_EXPORT_CAPABILITY_AND_WORKSPACE_CORRELATED_TRIGGER_OWNER_PARTIAL"
    elif exact_cap:
        cls="EXACT_EXPORT_CAPABILITY_CORRELATED_WORKSPACE_ROLE_PARTIAL"
    else:
        cls="EXPORT_ROLE_CORRELATION_REMAINS_UNRESOLVED"

    checks={
      "r20DiagnosticComplete":r20.get("status")=="DIAGNOSTIC_COMPLETE",
      "r20CapabilityIdResolvedWorkspacePartial":r20.get("bindingClassification")=="EXPORT_CAPABILITY_ID_RESOLVED_WORKSPACE_BINDING_PARTIAL",
      "registrationDefinitionsInspected":len(reg_defs)>0,
      "capabilityWorkspaceCorrelationsComputed":len(correlations)>0,
      "rankedRoleCandidatesResolved":len(ranked)>0,
      "triggerOwnerCallsitesInspected":len(trigger_owners)>0,
      "roleCorrelationClassified":cls!="EXPORT_ROLE_CORRELATION_REMAINS_UNRESOLVED",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R20_R1_EXPORT_WORKSPACE_ID_EXACT_ROLE_CORRELATION_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R20_R1_EXPORT_WORKSPACE_ID_ROLE_CORRELATION_INCOMPLETE")
    diagnosis=("EXPORT_ROLE_CORRELATION_CAUSALLY_CLASSIFIED_"+cls if passed
               else "EXPORT_CAPABILITY_WORKSPACE_TRIGGER_ROLE_REQUIRES_DEEPER_CORRELATION")
    if cls=="EXACT_EXPORT_CAPABILITY_WORKSPACE_AND_TRIGGER_OWNER_CORRELATED":
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_EXPORT_CAPABILITY_BOUNDED_LIVE_LOAD_CERTIFICATION"
    elif cls=="EXACT_EXPORT_CAPABILITY_AND_WORKSPACE_CORRELATED_TRIGGER_OWNER_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R2_EXPORT_LOAD_TRIGGER_OWNER_EXACT_BINDING_RESOLUTION"
    elif cls=="EXACT_EXPORT_CAPABILITY_CORRELATED_WORKSPACE_ROLE_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R2_EXPORT_WORKSPACE_ROLE_AND_ROUTE_EXACT_BINDING_RESOLUTION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R2_EXPORT_ROLE_CORRELATION_DEEP_SOURCE_CLOSURE"

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"export_workspace_id_exact_role_correlation.json"
    result={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R1_EXPORT_WORKSPACE_ID_EXACT_ROLE_CORRELATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "r20BindingClassification":r20.get("bindingClassification"),
      "registrationDefinitionCount":len(reg_defs),
      "correlationReferenceCount":len(correlations),
      "triggerOwnerCallsiteCount":len(trigger_owners),
      "rankedRoleCandidates":ranked[:50],
      "exactCapabilityId":exact_cap,
      "exactWorkspaceId":exact_ws,
      "exactTriggerOwner":exact_trigger,
      "roleCorrelationClassification":cls,
      "registrationDefinitions":reg_defs[:100],
      "topCorrelations":correlations[:140],
      "triggerOwners":trigger_owners[:100],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R1 Export Workspace-ID Exact Role Correlation")
    print("="*120)
    print("R20_BINDING_CLASSIFICATION:",r20.get("bindingClassification"))
    print("REGISTRATION_DEFINITION_COUNT:",len(reg_defs))
    print("CORRELATION_REFERENCE_COUNT:",len(correlations))
    print("TRIGGER_OWNER_CALLSITE_COUNT:",len(trigger_owners))
    print("RANKED_ROLE_CANDIDATE_COUNT:",len(ranked))
    print("EXACT_CAPABILITY_ID:",exact_cap)
    print("EXACT_WORKSPACE_ID:",exact_ws)
    print("EXACT_TRIGGER_OWNER:",json.dumps(exact_trigger))
    print("ROLE_CORRELATION_CLASSIFICATION:",cls)
    print("\n----- TOP ROLE CANDIDATES -----")
    for x in ranked[:12]:print(json.dumps(x))
    print("\n----- TOP REGISTRATION DEFINITIONS -----")
    for x in reg_defs[:12]:print(json.dumps(x))
    print("\n----- TOP TRIGGER OWNERS -----")
    for x in trigger_owners[:12]:print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
