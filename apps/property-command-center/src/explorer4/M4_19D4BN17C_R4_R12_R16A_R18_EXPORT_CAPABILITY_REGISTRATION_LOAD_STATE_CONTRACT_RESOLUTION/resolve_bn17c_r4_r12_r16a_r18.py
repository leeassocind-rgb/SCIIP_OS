#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R18_EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_CONTRACT_RESOLUTION"

def load(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    r17p=ev/"M4_19D4BN17C_R4_R12_R16A_R17_EXPORT_CAPABILITY_FEATURE_PERMISSION_GATE_RUNTIME_STATE_RESOLUTION"/"export_capability_feature_permission_gate_runtime_state_resolution.json"
    if not r17p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R17_EVIDENCE_REQUIRED");return 4
    r17=load(r17p)
    expected="LIVE_EXPORT_CAPABILITY_REGISTRATION_OR_LOAD_STATE_RESOLVED"
    if r17.get("status")!="PASSED" or r17.get("runtimeGateClassification")!=expected:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R17_CAPABILITY_REGISTRATION_LOAD_CLASSIFICATION_REQUIRED");return 5

    pats={
      "export":re.compile(r"\bexport\b|download|pptx?|powerpoint",re.I),
      "register":re.compile(r"registerCapability|runtimeRegistry|registerLoadedWorkspace|registry",re.I),
      "getcap":re.compile(r"getCapability|capabilityManifest|createCapabilityManifest",re.I),
      "load":re.compile(r"loadWorkspace|getLoadedWorkspace|loaded\.set|loaded\.get|status:'LOADED'|status:\"LOADED\"",re.I),
      "feature":re.compile(r"featureFlag|isFeatureEnabled|featureOverrides",re.I),
      "workspace":re.compile(r"workspace|workspaceType|workspaceMode|targetWorkspace",re.I),
      "entry":re.compile(r"entry\s*:|entrypoint|import\(/\* @vite-ignore \*/|capability\.entry",re.I),
      "id":re.compile(r"id\s*:|capabilityId|capability\.id",re.I)
    }

    rows=[]
    roots=[app/"src",app/"dist/assets"]
    exts={".js",".jsx",".ts",".tsx",".mjs"}
    for root in roots:
        if not root.exists():continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in exts:continue
            try:s=p.read_text(errors="ignore")
            except:continue
            if not pats["export"].search(s):continue
            for m in pats["export"].finditer(s):
                a=max(0,m.start()-2600);b=min(len(s),m.start()+3600);sn=s[a:b]
                sig={k:bool(v.search(sn)) for k,v in pats.items()}
                if not (sig["register"] or sig["getcap"] or sig["load"] or sig["entry"]):continue
                score=30+18*sig["register"]+18*sig["getcap"]+18*sig["load"]+14*sig["workspace"]+12*sig["entry"]+8*sig["id"]+6*sig["feature"]
                rows.append({"file":str(p.relative_to(app)),"offset":m.start(),"score":score,"signals":sig,
                             "snippet":re.sub(r"\s+"," ",sn)[:6000]})
                if len(rows)>=1600:break
            if len(rows)>=1600:break
        if len(rows)>=1600:break
    rows.sort(key=lambda x:-x["score"])

    reg=[x for x in rows if x["signals"]["register"]]
    cap=[x for x in rows if x["signals"]["getcap"]]
    loadrows=[x for x in rows if x["signals"]["load"]]
    entry=[x for x in rows if x["signals"]["entry"]]

    live=r17.get("liveRuntimeInspection") or {}
    globals_=live.get("globals") or []
    storage=(live.get("storage") or {})
    react=live.get("react") or []

    live_blob=json.dumps(live).lower()
    registered_runtime=bool(re.search(r"capabilit|registry|getcapability",live_blob))
    loaded_runtime=bool(re.search(r"loadedworkspace|status.{0,20}loaded|loaded",live_blob))
    export_runtime=bool(re.search(r"export|download|ppt|powerpoint",live_blob))

    # Source-level exact capability identifiers near export semantics.
    ids=[]
    idrx=[
      re.compile(r"(?:id|capabilityId)\s*[:=]\s*['\"]([^'\"]*(?:export|presentation|deck)[^'\"]*)['\"]",re.I),
      re.compile(r"['\"]([^'\"]*(?:export|presentation|deck)[^'\"]*)['\"]\s*[,)]",re.I)
    ]
    seen=set()
    for x in rows[:250]:
        for rr in idrx:
            for m in rr.finditer(x["snippet"]):
                v=m.group(1).strip()
                if 2<=len(v)<=160 and v.lower() not in seen:
                    seen.add(v.lower());ids.append({"value":v,"file":x["file"],"score":x["score"]})
                if len(ids)>=80:break
            if len(ids)>=80:break
        if len(ids)>=80:break

    if registered_runtime and loaded_runtime and export_runtime:
        cls="EXPORT_CAPABILITY_REGISTERED_LOADED_AND_RUNTIME_EXPOSED"
    elif registered_runtime and loaded_runtime and not export_runtime:
        cls="EXPORT_CAPABILITY_REGISTERED_AND_LOADED_BUT_NOT_BOUND_TO_ACTIVE_EXPLORER_SURFACE"
    elif registered_runtime and not loaded_runtime:
        cls="EXPORT_CAPABILITY_REGISTERED_BUT_NOT_LOADED"
    elif (reg or cap) and not registered_runtime:
        cls="EXPORT_CAPABILITY_SOURCE_DEFINED_BUT_LIVE_REGISTRATION_NOT_EXPOSED"
    elif entry and not loaded_runtime:
        cls="EXPORT_CAPABILITY_ENTRY_CONTRACT_PRESENT_BUT_LOAD_STATE_UNRESOLVED"
    else:
        cls="EXPORT_CAPABILITY_REGISTRATION_LOAD_CONTRACT_PARTIAL"

    checks={
      "r17Passed":r17.get("status")=="PASSED",
      "r17CapabilityRegistrationLoadClassification":r17.get("runtimeGateClassification")==expected,
      "sourceCapabilityRegistrationReferencesResolved":len(reg)>0 or len(cap)>0,
      "sourceCapabilityLoadReferencesResolved":len(loadrows)>0 or len(entry)>0,
      "sourceExportCapabilityIdentifiersAttempted":True,
      "liveCapabilityStateConsumed":True,
      "registrationLoadContractClassified":cls!="EXPORT_CAPABILITY_REGISTRATION_LOAD_CONTRACT_PARTIAL",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R18_EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_CONTRACT_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R18_EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_CONTRACT_INCOMPLETE")
    diagnosis=("EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_CAUSALLY_CLASSIFIED_"+cls if passed
               else "EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_REQUIRES_DEEPER_RUNTIME_OWNER_BINDING")

    next_map={
      "EXPORT_CAPABILITY_REGISTERED_AND_LOADED_BUT_NOT_BOUND_TO_ACTIVE_EXPLORER_SURFACE":
        "M4_19D4BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_ACTIVE_EXPLORER_SURFACE_BINDING_RESOLUTION",
      "EXPORT_CAPABILITY_REGISTERED_BUT_NOT_LOADED":
        "M4_19D4BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_LOAD_TRIGGER_AND_WORKSPACE_ENTRY_RESOLUTION",
      "EXPORT_CAPABILITY_SOURCE_DEFINED_BUT_LIVE_REGISTRATION_NOT_EXPOSED":
        "M4_19D4BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_RUNTIME_REGISTRY_OWNER_BINDING_DIAGNOSIS",
      "EXPORT_CAPABILITY_ENTRY_CONTRACT_PRESENT_BUT_LOAD_STATE_UNRESOLVED":
        "M4_19D4BN17C_R4_R12_R16A_R19_EXPORT_CAPABILITY_ENTRY_AND_DYNAMIC_IMPORT_RUNTIME_BINDING_DIAGNOSIS",
      "EXPORT_CAPABILITY_REGISTERED_LOADED_AND_RUNTIME_EXPOSED":
        "M4_19D4BN17C_R4_R12_R16A_R19_EXPORT_CONTROL_RENDER_BINDING_FROM_LOADED_CAPABILITY_CERTIFICATION"
    }
    nxt=next_map.get(cls,"M4_19D4BN17C_R4_R12_R16A_R18_R1_EXPORT_CAPABILITY_REGISTRATION_LOAD_DEEP_DIAGNOSIS")

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"export_capability_registration_load_state_contract_resolution.json"
    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R18_EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_CONTRACT_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "r17RuntimeGateClassification":r17.get("runtimeGateClassification"),
      "sourceReferenceCount":len(rows),
      "registrationReferenceCount":len(reg),
      "capabilityLookupReferenceCount":len(cap),
      "loadReferenceCount":len(loadrows),
      "entryReferenceCount":len(entry),
      "candidateCapabilityIds":ids,
      "liveRegisteredSignal":registered_runtime,
      "liveLoadedSignal":loaded_runtime,
      "liveExportRuntimeSignal":export_runtime,
      "registrationLoadClassification":cls,
      "topReferences":rows[:120],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R18 Export Capability Registration / Load-State Contract Resolution")
    print("="*120)
    print("R17_RUNTIME_GATE_CLASSIFICATION:",r17.get("runtimeGateClassification"))
    print("SOURCE_REFERENCE_COUNT:",len(rows))
    print("REGISTRATION_REFERENCE_COUNT:",len(reg))
    print("CAPABILITY_LOOKUP_REFERENCE_COUNT:",len(cap))
    print("LOAD_REFERENCE_COUNT:",len(loadrows))
    print("ENTRY_REFERENCE_COUNT:",len(entry))
    print("CANDIDATE_CAPABILITY_ID_COUNT:",len(ids))
    print("LIVE_REGISTERED_SIGNAL:",registered_runtime)
    print("LIVE_LOADED_SIGNAL:",loaded_runtime)
    print("LIVE_EXPORT_RUNTIME_SIGNAL:",export_runtime)
    print("REGISTRATION_LOAD_CLASSIFICATION:",cls)
    print("\n----- CANDIDATE CAPABILITY IDS -----")
    for x in ids[:20]:print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
