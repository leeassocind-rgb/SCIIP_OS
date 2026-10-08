#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_LOAD_TRIGGER_AND_WORKSPACE_ENTRY_RESOLUTION"

def load_json(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r18p=ev/"M4_19D4BN17C_R4_R12_R16A_R18_EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_CONTRACT_RESOLUTION"/"export_capability_registration_load_state_contract_resolution.json"
    if not r18p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R18_EVIDENCE_REQUIRED")
        return 4
    r18=load_json(r18p)

    expected="EXPORT_CAPABILITY_REGISTERED_BUT_NOT_LOADED"
    if r18.get("status")!="PASSED" or r18.get("registrationLoadClassification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R18_REGISTERED_BUT_NOT_LOADED_CLASSIFICATION_REQUIRED")
        return 5

    pats={
      "export":re.compile(r"\bexport\b|download|pptx?|powerpoint",re.I),
      "load_call":re.compile(r"loadWorkspace\s*\(|getLoadedWorkspace\s*\(|registerLoadedWorkspace\s*\(",re.I),
      "capability_lookup":re.compile(r"getCapability\s*\(|registerCapability\s*\(|createCapabilityManifest\s*\(",re.I),
      "workspace_id":re.compile(r"workspace(?:Id|Type|Mode)?\s*[:=]|targetWorkspace\s*[:=]|workspace\s*:",re.I),
      "entry":re.compile(r"entry\s*:|entrypoint\s*:|capability\.entry|import\s*\(\s*/\*\s*@vite-ignore\s*\*/",re.I),
      "feature_gate":re.compile(r"featureFlag|isFeatureEnabled|featureOverrides|enabledByDefault",re.I),
      "trigger":re.compile(r"onClick|onSelect|activate|open|route|navigate|mount|initialize|bootstrap|loadWorkspace",re.I),
      "registry":re.compile(r"runtimeRegistry|capabilityManifest|workspaceLoader|registerCapability|getCapability",re.I),
      "presentation":re.compile(r"present|presentation|deck|artifact|brief",re.I)
    }

    refs=[]
    roots=[app/"src",app/"dist/assets"]
    exts={".js",".jsx",".ts",".tsx",".mjs"}
    for root in roots:
        if not root.exists(): continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in exts: continue
            try:
                s=p.read_text(errors="ignore")
            except:
                continue
            if not pats["export"].search(s):
                continue
            for m in pats["export"].finditer(s):
                a=max(0,m.start()-3000); b=min(len(s),m.start()+4200)
                sn=s[a:b]
                sig={k:bool(v.search(sn)) for k,v in pats.items()}
                if not (sig["load_call"] or sig["capability_lookup"] or sig["entry"] or sig["registry"]):
                    continue
                score=30
                score+=22*sig["load_call"]+18*sig["capability_lookup"]+18*sig["entry"]
                score+=16*sig["trigger"]+14*sig["workspace_id"]+12*sig["feature_gate"]
                score+=10*sig["registry"]+8*sig["presentation"]
                refs.append({
                    "file":str(p.relative_to(app)),
                    "offset":m.start(),
                    "score":score,
                    "signals":sig,
                    "snippet":re.sub(r"\s+"," ",sn)[:7000]
                })
                if len(refs)>=1800: break
            if len(refs)>=1800: break
        if len(refs)>=1800: break
    refs.sort(key=lambda x:-x["score"])

    load_refs=[x for x in refs if x["signals"]["load_call"]]
    entry_refs=[x for x in refs if x["signals"]["entry"]]
    trigger_refs=[x for x in refs if x["signals"]["trigger"]]
    workspace_refs=[x for x in refs if x["signals"]["workspace_id"]]
    feature_refs=[x for x in refs if x["signals"]["feature_gate"]]

    # Recover concrete load calls / entrypoints / workspace ids.
    load_calls=[]
    entries=[]
    workspace_ids=[]
    feature_flags=[]
    seen=set()

    rx_load=re.compile(r"loadWorkspace\s*\((.{0,240})\)",re.I)
    rx_entry=re.compile(r"(?:entry|entrypoint)\s*:\s*['\"]([^'\"]+)['\"]",re.I)
    rx_ws=re.compile(r"(?:workspace(?:Id|Type|Mode)?|targetWorkspace)\s*[:=]\s*['\"]([^'\"]+)['\"]",re.I)
    rx_ff=re.compile(r"(?:featureFlag)\s*[:=]\s*['\"]([^'\"]+)['\"]",re.I)

    for x in refs[:300]:
        sn=x["snippet"]
        for label,rx,bucket in [
            ("load",rx_load,load_calls),
            ("entry",rx_entry,entries),
            ("workspace",rx_ws,workspace_ids),
            ("feature",rx_ff,feature_flags)
        ]:
            for m in rx.finditer(sn):
                v=m.group(1).strip()
                key=(label,v,x["file"])
                if key in seen: continue
                seen.add(key)
                bucket.append({"value":v[:500],"file":x["file"],"score":x["score"]})
                if len(bucket)>=60: break

    # Determine likely causal class.
    has_load=bool(load_calls or load_refs)
    has_entry=bool(entries or entry_refs)
    has_trigger=bool(trigger_refs)
    has_workspace=bool(workspace_ids or workspace_refs)
    has_feature=bool(feature_flags or feature_refs)

    if has_entry and has_load and has_trigger and has_workspace:
        cls="EXPORT_CAPABILITY_LOAD_PATH_PRESENT_TRIGGER_OR_WORKSPACE_BINDING_MISMATCH"
    elif has_entry and not has_load:
        cls="EXPORT_CAPABILITY_ENTRY_PRESENT_BUT_NO_LOAD_TRIGGER_RESOLVED"
    elif has_load and not has_entry:
        cls="EXPORT_CAPABILITY_LOAD_TRIGGER_PRESENT_BUT_ENTRYPOINT_UNRESOLVED"
    elif has_feature and has_entry:
        cls="EXPORT_CAPABILITY_LOAD_PATH_PRESENT_BEHIND_FEATURE_GATED_LOADER_BRANCH"
    elif has_workspace and has_load:
        cls="EXPORT_CAPABILITY_LOAD_TRIGGER_PRESENT_WORKSPACE_ID_BINDING_REQUIRES_RESOLUTION"
    else:
        cls="EXPORT_CAPABILITY_LOAD_TRIGGER_AND_ENTRY_CONTRACT_PARTIAL"

    checks={
      "r18Passed":r18.get("status")=="PASSED",
      "r18RegisteredButNotLoaded":r18.get("registrationLoadClassification")==expected,
      "sourceLoadReferencesResolved":len(load_refs)>0,
      "sourceEntryReferencesResolved":len(entry_refs)>0,
      "sourceTriggerReferencesResolved":len(trigger_refs)>0,
      "workspaceBindingReferencesResolved":len(workspace_refs)>0,
      "loadEntryContractClassified":cls!="EXPORT_CAPABILITY_LOAD_TRIGGER_AND_ENTRY_CONTRACT_PARTIAL",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_LOAD_TRIGGER_AND_WORKSPACE_ENTRY_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_LOAD_TRIGGER_AND_WORKSPACE_ENTRY_INCOMPLETE")
    diagnosis=("EXPORT_CAPABILITY_LOAD_TRIGGER_WORKSPACE_ENTRY_CAUSALLY_CLASSIFIED_"+cls
               if passed else "EXPORT_CAPABILITY_LOAD_TRIGGER_OR_ENTRY_REQUIRES_DEEPER_BINDING")

    next_map={
      "EXPORT_CAPABILITY_LOAD_PATH_PRESENT_TRIGGER_OR_WORKSPACE_BINDING_MISMATCH":
        "M4_19D4BN17C_R4_R12_R16A_R20_EXPORT_CAPABILITY_EXACT_TRIGGER_AND_WORKSPACE_ID_BINDING_RESOLUTION",
      "EXPORT_CAPABILITY_ENTRY_PRESENT_BUT_NO_LOAD_TRIGGER_RESOLVED":
        "M4_19D4BN17C_R4_R12_R16A_R20_EXPORT_CAPABILITY_TRIGGER_OWNER_AND_ACTIVATION_PATH_DIAGNOSIS",
      "EXPORT_CAPABILITY_LOAD_TRIGGER_PRESENT_BUT_ENTRYPOINT_UNRESOLVED":
        "M4_19D4BN17C_R4_R12_R16A_R20_EXPORT_CAPABILITY_ENTRYPOINT_AND_DYNAMIC_IMPORT_TARGET_RESOLUTION",
      "EXPORT_CAPABILITY_LOAD_PATH_PRESENT_BEHIND_FEATURE_GATED_LOADER_BRANCH":
        "M4_19D4BN17C_R4_R12_R16A_R20_EXPORT_CAPABILITY_LOADER_FEATURE_GATE_VALUE_RESOLUTION",
      "EXPORT_CAPABILITY_LOAD_TRIGGER_PRESENT_WORKSPACE_ID_BINDING_REQUIRES_RESOLUTION":
        "M4_19D4BN17C_R4_R12_R16A_R20_EXPORT_CAPABILITY_WORKSPACE_ID_AND_ROUTE_BINDING_RESOLUTION"
    }
    nxt=next_map.get(cls,"M4_19D4BN17C_R4_R12_R16A_R19_R1_EXPORT_CAPABILITY_LOAD_TRIGGER_ENTRY_DEEP_DIAGNOSIS")

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"export_capability_load_trigger_and_workspace_entry_resolution.json"
    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_LOAD_TRIGGER_AND_WORKSPACE_ENTRY_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":state,
      "diagnosis":diagnosis,
      "r18RegistrationLoadClassification":r18.get("registrationLoadClassification"),
      "sourceReferenceCount":len(refs),
      "loadReferenceCount":len(load_refs),
      "entryReferenceCount":len(entry_refs),
      "triggerReferenceCount":len(trigger_refs),
      "workspaceReferenceCount":len(workspace_refs),
      "featureGateReferenceCount":len(feature_refs),
      "loadCalls":load_calls,
      "entrypoints":entries,
      "workspaceIds":workspace_ids,
      "featureFlags":feature_flags,
      "loadEntryClassification":cls,
      "topReferences":refs[:120],
      "checks":checks,
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "liveWorkflowActionAuthority":False
      },
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R19 Export Capability Load Trigger + Workspace Entry Resolution")
    print("="*120)
    print("R18_REGISTRATION_LOAD_CLASSIFICATION:",r18.get("registrationLoadClassification"))
    print("SOURCE_REFERENCE_COUNT:",len(refs))
    print("LOAD_REFERENCE_COUNT:",len(load_refs))
    print("ENTRY_REFERENCE_COUNT:",len(entry_refs))
    print("TRIGGER_REFERENCE_COUNT:",len(trigger_refs))
    print("WORKSPACE_REFERENCE_COUNT:",len(workspace_refs))
    print("FEATURE_GATE_REFERENCE_COUNT:",len(feature_refs))
    print("LOAD_CALL_COUNT:",len(load_calls))
    print("ENTRYPOINT_COUNT:",len(entries))
    print("WORKSPACE_ID_COUNT:",len(workspace_ids))
    print("FEATURE_FLAG_COUNT:",len(feature_flags))
    print("LOAD_ENTRY_CLASSIFICATION:",cls)

    print("\n----- LOAD CALLS -----")
    for x in load_calls[:20]: print(json.dumps(x))
    print("\n----- ENTRYPOINTS -----")
    for x in entries[:20]: print(json.dumps(x))
    print("\n----- WORKSPACE IDS -----")
    for x in workspace_ids[:20]: print(json.dumps(x))
    print("\n----- FEATURE FLAGS -----")
    for x in feature_flags[:20]: print(json.dumps(x))

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
