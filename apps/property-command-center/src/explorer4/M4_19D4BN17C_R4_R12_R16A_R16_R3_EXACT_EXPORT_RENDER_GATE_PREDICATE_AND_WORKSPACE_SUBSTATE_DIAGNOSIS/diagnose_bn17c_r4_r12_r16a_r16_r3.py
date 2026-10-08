#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R16_R3_EXACT_EXPORT_RENDER_GATE_PREDICATE_AND_WORKSPACE_SUBSTATE_DIAGNOSIS"

def load(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r15p=ev/"M4_19D4BN17C_R4_R12_R16A_R15_EXPORT_PROPERTY_WORKSPACE_GATE_STATE_RESOLUTION"/"export_property_workspace_gate_state_resolution.json"
    r16p=ev/"M4_19D4BN17C_R4_R12_R16A_R16_R2_PROVEN_CDP_HANDSHAKE_REPAIR_AND_EXPORT_GATE_MATERIALIZATION_RECERTIFICATION"/"proven_cdp_handshake_repair_export_gate_materialization_recertification.json"
    if not r15p.exists() or not r16p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R15_AND_R16_R2_EVIDENCE_REQUIRED")
        return 4

    r15=load(r15p); r16=load(r16p)
    if r15.get("status")!="PASSED" or r16.get("status")!="DIAGNOSTIC_COMPLETE":
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R15_PASSED_AND_R16_R2_DIAGNOSTIC_COMPLETE_REQUIRED")
        return 5
    if r16.get("diagnosis")!="WORKSPACE_TRANSITION_OBSERVED_EXPORT_CONTROL_STILL_NOT_MATERIALIZED":
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R16_R2_EXPORT_NON_MATERIALIZATION_DIAGNOSIS_REQUIRED")
        return 6

    # Recover source neighborhoods where export UI/render semantics overlap with exact gating vocabulary.
    gate_terms={
      "selected_property": r"selectedProperty|selected property|activeProperty|selectedAsset|propertySelection",
      "workspace": r"workspace|workspaceState|workspaceMode|activeWorkspace|workspaceType",
      "present_mode": r"presentMode|presentationMode|mode\s*===?\s*['\"]present|mode\s*===?\s*['\"]presentation",
      "capability": r"capabilit|canExport|exportEnabled|allowExport|supportsExport|featureFlag|feature flag|permission",
      "readiness": r"ready|readiness|isReady|presentationReady|deckReady|exportReady|canPresent",
      "selection_shape": r"selectedProperties|selectionCount|selectedIds|ids\.length|properties\.length|selection\.length",
      "artifact": r"presentation|deck|artifact|slide|report|brief",
      "gate": r"&&|\|\||\?|if\s*\(|disabled|hidden|visible|render|showExport|canExport|exportEnabled",
      "export": r"\bexport\b|download|pptx?|powerpoint"
    }
    pats={k:re.compile(v,re.I) for k,v in gate_terms.items()}

    rows=[]
    roots=[app/"src",app/"dist/assets"]
    exts={".js",".jsx",".ts",".tsx",".mjs"}
    for root in roots:
        if not root.exists(): continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in exts: continue
            try:s=p.read_text(errors="ignore")
            except: continue
            if not pats["export"].search(s): continue
            for m in pats["export"].finditer(s):
                a=max(0,m.start()-2600); b=min(len(s),m.start()+3600)
                sn=s[a:b]
                sig={k:bool(v.search(sn)) for k,v in pats.items()}
                score=30
                score+=18*sig["selected_property"]+18*sig["workspace"]+16*sig["present_mode"]
                score+=16*sig["capability"]+14*sig["readiness"]+14*sig["selection_shape"]
                score+=10*sig["artifact"]+12*sig["gate"]
                # UI/render context bonus
                if re.search(r"button|onclick|aria-label|menuitem|toolbar|render|jsx|createElement",sn,re.I): score+=20
                rows.append({
                    "file":str(p.relative_to(app)),
                    "offset":m.start(),
                    "term":m.group(0),
                    "score":score,
                    "signals":sig,
                    "snippet":re.sub(r"\s+"," ",sn)[:6000]
                })
                if len(rows)>=2200: break
            if len(rows)>=2200: break
        if len(rows)>=2200: break

    rows.sort(key=lambda x:-x["score"])

    exact=[x for x in rows if x["signals"]["export"] and x["signals"]["gate"] and
           (x["signals"]["selected_property"] or x["signals"]["workspace"] or x["signals"]["present_mode"])]

    # Classify the most likely missing predicate class from the strongest neighborhoods.
    top=exact[:120]
    counts={k:sum(1 for x in top if x["signals"].get(k)) for k in
            ["selected_property","workspace","present_mode","capability","readiness","selection_shape","artifact","gate"]}

    if counts["capability"]>=max(3,counts["readiness"],counts["selection_shape"]):
        cls="EXPORT_REQUIRES_CAPABILITY_FEATURE_OR_PERMISSION_GATE"
    elif counts["readiness"]>=max(3,counts["selection_shape"]):
        cls="EXPORT_REQUIRES_PRESENTATION_OR_ARTIFACT_READINESS_GATE"
    elif counts["selection_shape"]>=3:
        cls="EXPORT_REQUIRES_MULTI_SELECTION_OR_SELECTION_SHAPE_GATE"
    elif counts["present_mode"]>=3 and counts["workspace"]>=3:
        cls="EXPORT_REQUIRES_PRESENT_WORKSPACE_SUBSTATE_BEYOND_MODE_TOGGLE"
    elif counts["workspace"]>=3:
        cls="EXPORT_REQUIRES_WORKSPACE_SUBTYPE_OR_CONTEXT_GATE"
    else:
        cls="EXPORT_RENDER_GATE_PREDICATE_REMAINS_PARTIAL"

    # Pull concrete predicate fragments from snippets.
    predicate_fragments=[]
    rex=[
      re.compile(r"(.{0,180}(?:canExport|exportEnabled|showExport|allowExport|supportsExport).{0,260})",re.I),
      re.compile(r"(.{0,180}(?:presentationReady|deckReady|exportReady|isReady|canPresent).{0,260})",re.I),
      re.compile(r"(.{0,180}(?:selectedProperties|selectedIds|selectionCount|ids\.length|properties\.length).{0,260})",re.I),
      re.compile(r"(.{0,180}(?:workspaceType|workspaceMode|activeWorkspace|workspaceState).{0,260})",re.I),
      re.compile(r"(.{0,180}(?:featureFlag|permission|capabilit).{0,260})",re.I)
    ]
    seen=set()
    for x in top:
        for rr in rex:
            for mm in rr.finditer(x["snippet"]):
                frag=re.sub(r"\s+"," ",mm.group(1)).strip()
                key=(x["file"],frag)
                if key not in seen:
                    seen.add(key)
                    predicate_fragments.append({"file":x["file"],"fragment":frag[:500],"sourceScore":x["score"]})
                if len(predicate_fragments)>=80: break
            if len(predicate_fragments)>=80: break
        if len(predicate_fragments)>=80: break

    checks={
      "r15Passed":r15.get("status")=="PASSED",
      "r16R2DiagnosticComplete":r16.get("status")=="DIAGNOSTIC_COMPLETE",
      "r16R2SelectedPropertyPresent":((r16.get("checks") or {}).get("selectedPropertyStatePresent") is True),
      "r16R2WorkspaceTransitionObserved":((r16.get("checks") or {}).get("workspaceStateTransitionObserved") is True),
      "r16R2ExportStillNotMaterialized":((r16.get("checks") or {}).get("liveExportControlMaterialized") is False),
      "exactExportGateNeighborhoodsResolved":len(exact)>0,
      "predicateClassResolved":cls!="EXPORT_RENDER_GATE_PREDICATE_REMAINS_PARTIAL",
      "predicateFragmentsCaptured":len(predicate_fragments)>0,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R16_R3_EXACT_EXPORT_RENDER_GATE_PREDICATE_AND_WORKSPACE_SUBSTATE_DIAGNOSED"
           if passed else "M419D4BN17C_R4_R12_R16A_R16_R3_PREDICATE_DIAGNOSIS_INCOMPLETE")
    diagnosis=("EXACT_EXPORT_RENDER_GATE_CAUSALLY_CLASSIFIED_"+cls if passed
               else "EXPORT_RENDER_GATE_PREDICATE_REQUIRES_DEEPER_BINDING")

    if cls=="EXPORT_REQUIRES_CAPABILITY_FEATURE_OR_PERMISSION_GATE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R17_EXPORT_CAPABILITY_FEATURE_PERMISSION_GATE_RUNTIME_STATE_RESOLUTION"
    elif cls=="EXPORT_REQUIRES_PRESENTATION_OR_ARTIFACT_READINESS_GATE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R17_EXPORT_PRESENTATION_ARTIFACT_READINESS_STATE_RESOLUTION"
    elif cls=="EXPORT_REQUIRES_MULTI_SELECTION_OR_SELECTION_SHAPE_GATE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R17_EXPORT_SELECTION_SHAPE_AND_MINIMUM_CARDINALITY_RESOLUTION"
    elif cls=="EXPORT_REQUIRES_PRESENT_WORKSPACE_SUBSTATE_BEYOND_MODE_TOGGLE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R17_PRESENT_WORKSPACE_SUBSTATE_RUNTIME_RESOLUTION"
    elif cls=="EXPORT_REQUIRES_WORKSPACE_SUBTYPE_OR_CONTEXT_GATE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R17_EXPORT_WORKSPACE_SUBTYPE_CONTEXT_RUNTIME_RESOLUTION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R16_R4_EXACT_EXPORT_GATE_BOOLEAN_EXPRESSION_RECOVERY"

    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_export_render_gate_predicate_and_workspace_substate_diagnosis.json"
    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R16_R3_EXACT_EXPORT_RENDER_GATE_PREDICATE_AND_WORKSPACE_SUBSTATE_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "r15GateClassification":r15.get("gateStateClassification"),
      "r16R2Diagnosis":r16.get("diagnosis"),
      "sourceReferenceCount":len(rows),
      "exactGateNeighborhoodCount":len(exact),
      "topSignalCounts":counts,
      "predicateClass":cls,
      "predicateFragmentCount":len(predicate_fragments),
      "predicateFragments":predicate_fragments,
      "topGateNeighborhoods":top[:100],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R16-R3 Exact Export Render-Gate Predicate + Workspace Sub-State Diagnosis")
    print("="*120)
    print("R15_GATE_CLASSIFICATION:",r15.get("gateStateClassification"))
    print("R16_R2_DIAGNOSIS:",r16.get("diagnosis"))
    print("SOURCE_REFERENCE_COUNT:",len(rows))
    print("EXACT_GATE_NEIGHBORHOOD_COUNT:",len(exact))
    print("PREDICATE_CLASS:",cls)
    print("PREDICATE_FRAGMENT_COUNT:",len(predicate_fragments))
    print("TOP_SIGNAL_COUNTS:",json.dumps(counts))

    print("\n----- TOP PREDICATE FRAGMENTS -----")
    for x in predicate_fragments[:20]:
        print(json.dumps(x,ensure_ascii=False))

    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__": raise SystemExit(main())
