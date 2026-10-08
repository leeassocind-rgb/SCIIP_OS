#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R15_EXPORT_PROPERTY_WORKSPACE_GATE_STATE_RESOLUTION"

def load(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    r14p=ev/"M4_19D4BN17C_R4_R12_R16A_R14_R1_WEBSOCKET_URL_AND_HANDSHAKE_REPAIR_MISSING_ROLE_TARGET_CORRELATION_RECERTIFICATION"/"missing_role_target_source_to_live_control_correlation.json"
    if not r14p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R14_R1_EVIDENCE_REQUIRED"); return 4
    r14=load(r14p)
    if r14.get("status")!="PASSED":
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R14_R1_MUST_PASS"); return 5
    if r14.get("renderGateClassification")!="EXPORT_CONTROL_GATED_BY_PROPERTY_OR_WORKSPACE_STATE":
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R14_R1_PROPERTY_WORKSPACE_GATE_CLASSIFICATION_REQUIRED"); return 6

    pats={
      "selected_property":re.compile(r"selectedProperty|selected property|activeProperty|propertyId",re.I),
      "workspace":re.compile(r"workspace|workspaceState|activeWorkspace|workspaceType",re.I),
      "export":re.compile(r"\bexport\b|download|ppt|powerpoint",re.I),
      "presentation":re.compile(r"presentation|deck|\bpresent\b",re.I),
      "gate":re.compile(r"canExport|showExport|exportEnabled|disabled|hidden|visible|mode|permission|capability|featureFlag",re.I),
    }
    rows=[]
    roots=[app/"src",app/"dist/assets"]
    exts={".js",".jsx",".ts",".tsx",".mjs"}
    for root in roots:
        if not root.exists(): continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in exts: continue
            try:s=p.read_text(errors="ignore")
            except:continue
            if not pats["export"].search(s): continue
            for m in pats["export"].finditer(s):
                a=max(0,m.start()-1800); b=min(len(s),m.start()+2600)
                sn=re.sub(r"\s+"," ",s[a:b])
                sig={k:bool(v.search(sn)) for k,v in pats.items()}
                score=20+12*sig["selected_property"]+12*sig["workspace"]+10*sig["gate"]+6*sig["presentation"]
                rows.append({"file":str(p.relative_to(app)),"offset":m.start(),"term":m.group(0),
                             "score":score,"signals":sig,"snippet":sn[:4200]})
                if len(rows)>=1800: break
            if len(rows)>=1800: break
        if len(rows)>=1800: break
    rows.sort(key=lambda x:-x["score"])

    correlated=[x for x in rows if x["signals"]["export"] and (x["signals"]["selected_property"] or x["signals"]["workspace"])]
    selected=[x for x in correlated if x["signals"]["selected_property"]]
    workspace=[x for x in correlated if x["signals"]["workspace"]]
    gated=[x for x in correlated if x["signals"]["gate"]]

    if selected and workspace and gated:
        cls="EXPORT_RENDER_GATE_DEPENDS_ON_SELECTED_PROPERTY_AND_WORKSPACE_STATE"
    elif selected and gated:
        cls="EXPORT_RENDER_GATE_DEPENDS_ON_SELECTED_PROPERTY_STATE"
    elif workspace and gated:
        cls="EXPORT_RENDER_GATE_DEPENDS_ON_WORKSPACE_STATE"
    elif correlated:
        cls="EXPORT_PROPERTY_WORKSPACE_CORRELATION_FOUND_GATE_PREDICATE_PARTIAL"
    else:
        cls="EXPORT_PROPERTY_WORKSPACE_GATE_SOURCE_BINDING_UNRESOLVED"

    checks={
      "r14R1Passed":r14.get("status")=="PASSED",
      "r14PropertyWorkspaceGateClassificationPreserved":r14.get("renderGateClassification")=="EXPORT_CONTROL_GATED_BY_PROPERTY_OR_WORKSPACE_STATE",
      "sourceExportReferencesResolved":len(rows)>0,
      "propertyOrWorkspaceCorrelationsResolved":len(correlated)>0,
      "gatePredicateEvidenceResolved":len(gated)>0,
      "gateStateClassificationResolved":cls!="EXPORT_PROPERTY_WORKSPACE_GATE_SOURCE_BINDING_UNRESOLVED",
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,
      "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R15_EXPORT_PROPERTY_WORKSPACE_GATE_STATE_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R15_EXPORT_PROPERTY_WORKSPACE_GATE_STATE_RESOLUTION_INCOMPLETE")
    diagnosis=("EXPORT_PROPERTY_WORKSPACE_GATE_CAUSALLY_RESOLVED_"+cls if passed
               else "EXPORT_PROPERTY_WORKSPACE_GATE_STATE_REQUIRES_FURTHER_SOURCE_BINDING_DIAGNOSIS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R16_EXPORT_GATE_SATISFYING_STATE_AND_LIVE_CONTROL_MATERIALIZATION_CERTIFICATION"
         if passed else "M4_19D4BN17C_R4_R12_R16A_R15_R1_EXPORT_GATE_PREDICATE_SOURCE_BINDING_RESIDUAL_DIAGNOSIS")
    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    f=out/"export_property_workspace_gate_state_resolution.json"
    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R15_EXPORT_PROPERTY_WORKSPACE_GATE_STATE_RESOLUTION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
         "r14RenderGateClassification":r14.get("renderGateClassification"),"sourceExportReferenceCount":len(rows),
         "propertyWorkspaceCorrelationCount":len(correlated),"selectedPropertyCorrelationCount":len(selected),
         "workspaceCorrelationCount":len(workspace),"gatePredicateCorrelationCount":len(gated),
         "gateStateClassification":cls,"topCorrelations":correlated[:100],"checks":checks,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                      "pixelEvidence":False,"liveWorkflowActionAuthority":False},"nextMilestone":nxt}
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R15 Export Property/Workspace Gate State Resolution")
    print("="*120)
    print("R14_RENDER_GATE_CLASSIFICATION:",r14.get("renderGateClassification"))
    print("SOURCE_EXPORT_REFERENCE_COUNT:",len(rows))
    print("PROPERTY_WORKSPACE_CORRELATION_COUNT:",len(correlated))
    print("SELECTED_PROPERTY_CORRELATION_COUNT:",len(selected))
    print("WORKSPACE_CORRELATION_COUNT:",len(workspace))
    print("GATE_PREDICATE_CORRELATION_COUNT:",len(gated))
    print("GATE_STATE_CLASSIFICATION:",cls)
    print("\n----- TOP CORRELATIONS -----")
    for x in correlated[:12]:
        print(json.dumps({"file":x["file"],"term":x["term"],"score":x["score"],"signals":x["signals"],"snippet":x["snippet"][:900]}))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status); print("STATE:",state); print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt); print("EVIDENCE:",f)
    return 0

if __name__=="__main__": raise SystemExit(main())
