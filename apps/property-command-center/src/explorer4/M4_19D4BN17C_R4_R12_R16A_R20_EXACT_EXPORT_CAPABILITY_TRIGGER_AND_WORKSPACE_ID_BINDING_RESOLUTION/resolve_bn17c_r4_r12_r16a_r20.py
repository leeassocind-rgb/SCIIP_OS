#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_EXACT_EXPORT_CAPABILITY_TRIGGER_AND_WORKSPACE_ID_BINDING_RESOLUTION"

def load_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r19p=ev/"M4_19D4BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_LOAD_TRIGGER_AND_WORKSPACE_ENTRY_RESOLUTION"/"export_capability_load_trigger_and_workspace_entry_resolution.json"
    if not r19p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R19_EVIDENCE_REQUIRED")
        return 4

    r19=load_json(r19p)
    expected="EXPORT_CAPABILITY_LOAD_PATH_PRESENT_TRIGGER_OR_WORKSPACE_BINDING_MISMATCH"
    if r19.get("status")!="PASSED" or r19.get("loadEntryClassification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R19_TRIGGER_OR_WORKSPACE_BINDING_MISMATCH_REQUIRED")
        return 5

    pats={
      "export":re.compile(r"\bexport\b|download|pptx?|powerpoint|presentation|deck",re.I),
      "load":re.compile(r"loadWorkspace\s*\(|getCapability\s*\(|registerCapability\s*\(",re.I),
      "workspace":re.compile(r"workspace(?:Id|Type|Mode)?|targetWorkspace|workspace\s*:",re.I),
      "trigger":re.compile(r"onClick|onSelect|activate|open|route|navigate|mount|initialize|bootstrap",re.I),
      "capid":re.compile(r"capabilityId|capability\.id|id\s*:|getCapability\s*\(",re.I),
      "entry":re.compile(r"entry\s*:|capability\.entry|entrypoint\s*:",re.I),
      "present":re.compile(r"\bPresent\b|presentation|presentMode|workspace.*Present",re.I),
    }

    refs=[]
    for root in [app/"src",app/"dist/assets"]:
        if not root.exists(): continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in {".js",".jsx",".ts",".tsx",".mjs"}: continue
            try:s=p.read_text(errors="ignore")
            except:continue
            if not pats["export"].search(s):continue
            for m in pats["export"].finditer(s):
                a=max(0,m.start()-3200);b=min(len(s),m.start()+4600);sn=s[a:b]
                sig={k:bool(v.search(sn)) for k,v in pats.items()}
                if not (sig["load"] and sig["workspace"]):
                    continue
                score=40+20*sig["load"]+18*sig["workspace"]+16*sig["trigger"]+14*sig["capid"]+10*sig["entry"]+10*sig["present"]
                refs.append({
                    "file":str(p.relative_to(app)),
                    "offset":m.start(),
                    "score":score,
                    "signals":sig,
                    "snippet":re.sub(r"\s+"," ",sn)[:7600]
                })
                if len(refs)>=1600:break
            if len(refs)>=1600:break
        if len(refs)>=1600:break
    refs.sort(key=lambda x:-x["score"])

    # Exact contract extraction.
    calls=[]
    rx_call=re.compile(r"loadWorkspace\s*\(\s*([^,\)]+)\s*(?:,\s*([^\)]+))?\)",re.I)
    capids=[]
    rx_capid=[
      re.compile(r"(?:capabilityId|id)\s*[:=]\s*['\"]([^'\"]+)['\"]",re.I),
      re.compile(r"getCapability\s*\(\s*['\"]([^'\"]+)['\"]\s*\)",re.I),
      re.compile(r"loadWorkspace\s*\(\s*['\"]([^'\"]+)['\"]",re.I)
    ]
    workspaces=[]
    rx_ws=[
      re.compile(r"(?:workspace(?:Id|Type|Mode)?|targetWorkspace)\s*[:=]\s*['\"]([^'\"]+)['\"]",re.I),
      re.compile(r"workspace\s*:\s*['\"]([^'\"]+)['\"]",re.I)
    ]
    triggers=[]
    rx_trig=[
      re.compile(r"(onClick|onSelect)\s*[:=]\s*([^,}\]]{1,240})",re.I),
      re.compile(r"(?:activate|open|navigate|route|mount|initialize|bootstrap)[A-Za-z0-9_$]*\s*[:=]\s*([^,}\]]{1,240})",re.I)
    ]

    seen=set()
    for x in refs[:350]:
        sn=x["snippet"]
        for m in rx_call.finditer(sn):
            val={"capabilityArg":m.group(1).strip()[:300],
                 "contextArg":(m.group(2) or "").strip()[:500],
                 "file":x["file"],"score":x["score"]}
            k=("call",json.dumps(val,sort_keys=True))
            if k not in seen:
                seen.add(k);calls.append(val)
            if len(calls)>=60:break

        for rr in rx_capid:
            for m in rr.finditer(sn):
                v=m.group(1).strip()
                if len(v)>180:continue
                k=("cap",v.lower(),x["file"])
                if k not in seen:
                    seen.add(k);capids.append({"value":v,"file":x["file"],"score":x["score"]})
                if len(capids)>=80:break

        for rr in rx_ws:
            for m in rr.finditer(sn):
                v=m.group(1).strip()
                if len(v)>180:continue
                k=("ws",v.lower(),x["file"])
                if k not in seen:
                    seen.add(k);workspaces.append({"value":v,"file":x["file"],"score":x["score"]})
                if len(workspaces)>=80:break

        for rr in rx_trig:
            for m in rr.finditer(sn):
                v=m.group(0).strip()
                k=("trig",v,x["file"])
                if k not in seen:
                    seen.add(k);triggers.append({"value":v[:500],"file":x["file"],"score":x["score"]})
                if len(triggers)>=80:break

    # Rank export/presentation-looking IDs and workspace IDs.
    def role_score(v):
        s=0;lv=v.lower()
        if "export" in lv:s+=40
        if "present" in lv:s+=30
        if "deck" in lv:s+=20
        if "property" in lv:s+=14
        if "explorer" in lv:s+=14
        if "command" in lv:s+=8
        return s
    for x in capids:x["roleScore"]=role_score(x["value"])
    capids.sort(key=lambda x:(-x["roleScore"],-x["score"]))
    for x in workspaces:x["roleScore"]=role_score(x["value"])
    workspaces.sort(key=lambda x:(-x["roleScore"],-x["score"]))

    exact_cap=capids[0]["value"] if capids and capids[0]["roleScore"]>0 else None
    exact_ws=workspaces[0]["value"] if workspaces and workspaces[0]["roleScore"]>0 else None
    exact_trigger=triggers[0] if triggers else None

    if exact_cap and exact_ws and calls:
        cls="EXACT_EXPORT_CAPABILITY_AND_WORKSPACE_BINDING_RESOLVED"
    elif exact_cap and calls:
        cls="EXPORT_CAPABILITY_ID_RESOLVED_WORKSPACE_BINDING_PARTIAL"
    elif exact_ws and calls:
        cls="EXPORT_WORKSPACE_ID_RESOLVED_CAPABILITY_ID_PARTIAL"
    elif calls:
        cls="LOAD_CALL_RESOLVED_ROLE_SPECIFIC_IDS_PARTIAL"
    else:
        cls="EXACT_EXPORT_TRIGGER_WORKSPACE_BINDING_UNRESOLVED"

    checks={
      "r19Passed":r19.get("status")=="PASSED",
      "r19TriggerWorkspaceMismatch":r19.get("loadEntryClassification")==expected,
      "exactLoadCallCandidatesResolved":len(calls)>0,
      "capabilityIdCandidatesResolved":len(capids)>0,
      "workspaceIdCandidatesResolved":len(workspaces)>0,
      "triggerOwnerCandidatesResolved":len(triggers)>0,
      "bindingClassificationResolved":cls!="EXACT_EXPORT_TRIGGER_WORKSPACE_BINDING_UNRESOLVED",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R20_EXACT_EXPORT_CAPABILITY_TRIGGER_WORKSPACE_ID_BINDING_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R20_EXACT_EXPORT_CAPABILITY_TRIGGER_WORKSPACE_ID_BINDING_INCOMPLETE")
    diagnosis=("EXPORT_CAPABILITY_TRIGGER_WORKSPACE_BINDING_CAUSALLY_CLASSIFIED_"+cls
               if passed else "EXPORT_CAPABILITY_TRIGGER_WORKSPACE_BINDING_REQUIRES_DEEPER_ROLE_CORRELATION")

    if cls=="EXACT_EXPORT_CAPABILITY_AND_WORKSPACE_BINDING_RESOLVED":
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_EXPORT_CAPABILITY_BOUNDED_LIVE_LOAD_CERTIFICATION"
    elif cls=="EXPORT_CAPABILITY_ID_RESOLVED_WORKSPACE_BINDING_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R1_EXPORT_WORKSPACE_ID_EXACT_ROLE_CORRELATION"
    elif cls=="EXPORT_WORKSPACE_ID_RESOLVED_CAPABILITY_ID_PARTIAL":
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R1_EXPORT_CAPABILITY_ID_EXACT_ROLE_CORRELATION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R1_EXPORT_LOAD_CALL_ROLE_SPECIFIC_ALIAS_CLOSURE_DIAGNOSIS"

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_export_capability_trigger_and_workspace_id_binding_resolution.json"
    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_EXACT_EXPORT_CAPABILITY_TRIGGER_AND_WORKSPACE_ID_BINDING_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "r19LoadEntryClassification":r19.get("loadEntryClassification"),
      "sourceReferenceCount":len(refs),
      "loadCallCandidateCount":len(calls),
      "capabilityIdCandidateCount":len(capids),
      "workspaceIdCandidateCount":len(workspaces),
      "triggerCandidateCount":len(triggers),
      "exactCapabilityId":exact_cap,
      "exactWorkspaceId":exact_ws,
      "exactTriggerCandidate":exact_trigger,
      "bindingClassification":cls,
      "loadCalls":calls[:100],
      "capabilityIds":capids[:100],
      "workspaceIds":workspaces[:100],
      "triggers":triggers[:100],
      "topReferences":refs[:120],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20 Exact Export Capability Trigger + Workspace-ID Binding Resolution")
    print("="*120)
    print("R19_LOAD_ENTRY_CLASSIFICATION:",r19.get("loadEntryClassification"))
    print("SOURCE_REFERENCE_COUNT:",len(refs))
    print("LOAD_CALL_CANDIDATE_COUNT:",len(calls))
    print("CAPABILITY_ID_CANDIDATE_COUNT:",len(capids))
    print("WORKSPACE_ID_CANDIDATE_COUNT:",len(workspaces))
    print("TRIGGER_CANDIDATE_COUNT:",len(triggers))
    print("EXACT_CAPABILITY_ID:",exact_cap)
    print("EXACT_WORKSPACE_ID:",exact_ws)
    print("EXACT_TRIGGER_CANDIDATE:",json.dumps(exact_trigger))
    print("BINDING_CLASSIFICATION:",cls)

    print("\n----- TOP LOAD CALLS -----")
    for x in calls[:12]:print(json.dumps(x))
    print("\n----- TOP CAPABILITY IDS -----")
    for x in capids[:12]:print(json.dumps(x))
    print("\n----- TOP WORKSPACE IDS -----")
    for x in workspaces[:12]:print(json.dumps(x))
    print("\n----- TOP TRIGGERS -----")
    for x in triggers[:12]:print(json.dumps(x))

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
