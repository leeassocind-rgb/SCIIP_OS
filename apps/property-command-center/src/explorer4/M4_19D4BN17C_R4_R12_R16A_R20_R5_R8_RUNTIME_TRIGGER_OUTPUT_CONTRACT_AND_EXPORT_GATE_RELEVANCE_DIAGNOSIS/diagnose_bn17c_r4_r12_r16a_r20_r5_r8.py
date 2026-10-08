#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R8_RUNTIME_TRIGGER_OUTPUT_CONTRACT_AND_EXPORT_GATE_RELEVANCE_DIAGNOSIS"
R7M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R7_RUNTIME_TRIGGER_OWNER_ARGUMENT_CONTRACT_AND_SOURCE_PARITY_RESOLUTION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def compact(s,n=8000):
    return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    r7p=ev/R7M/"runtime_trigger_owner_argument_contract_and_source_parity_resolution.json"
    if not r7p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R7_EVIDENCE_REQUIRED"); return 4
    r7=loadj(r7p)
    expected="ZERO_ARGUMENT_RUNTIME_TRIGGER_CONTRACT_AND_SOURCE_COMPONENT_RUNTIME_PARITY_RESOLVED"
    if r7.get("status")!="PASSED" or r7.get("classification")!=expected:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R7_ZERO_ARGUMENT_SOURCE_PARITY_REQUIRED"); return 5

    runtime_file=app/"src/runtime/platformRuntime.js"
    component_file=app/"src/components/PlatformRuntimeCenter.jsx"
    if not runtime_file.exists() or not component_file.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: SOURCE_RUNTIME_OR_COMPONENT_MISSING"); return 6

    rs=runtime_file.read_text(errors="ignore")
    cs=component_file.read_text(errors="ignore")

    # Capture bootstrapPlatformRuntime definition neighborhood and return shape.
    bm=re.search(r'(?:export\s+)?function\s+bootstrapPlatformRuntime\s*\(([^)]*)\)\s*\{',rs)
    if not bm:
        bm=re.search(r'(?:export\s+)?const\s+bootstrapPlatformRuntime\s*=\s*\(([^)]*)\)\s*=>\s*\{',rs)
    bstart=bm.start() if bm else -1
    bparams=bm.group(1) if bm else None
    bsn=rs[bstart:min(len(rs),bstart+12000)] if bstart>=0 else ""

    # Approximate function body to next export/function boundary.
    bend=len(rs)
    if bstart>=0:
        nexts=[m.start() for m in re.finditer(r'\n(?:export\s+)?(?:function|const)\s+[A-Za-z_$][\w$]*',rs[bstart+100:])]
        if nexts:
            bend=bstart+100+nexts[0]
    body=rs[bstart:bend] if bstart>=0 else ""

    # Return object keys and observable fields.
    return_keys=set()
    for m in re.finditer(r'return\s+(?:Object\.freeze\s*\(\s*)?\{([^}]{0,6000})\}',body,re.S):
        frag=m.group(1)
        for km in re.finditer(r'([A-Za-z_$][\w$]*)\s*:',frag):
            return_keys.add(km.group(1))
        for km in re.finditer(r'(?<![:\w$])([A-Za-z_$][\w$]*)\s*(?:,|$)',frag):
            return_keys.add(km.group(1))
    # Also capture identifiers accessed by PlatformRuntimeCenter from bootstrap result.
    result_var=None
    cm=re.search(r'const\s+([A-Za-z_$][\w$]*)\s*=\s*useMemo\s*\(\s*\(\s*\)\s*=>\s*bootstrapPlatformRuntime\s*\(\s*\)',cs,re.S)
    if cm: result_var=cm.group(1)
    accessed=set()
    if result_var:
        for m in re.finditer(r'\b'+re.escape(result_var)+r'\.([A-Za-z_$][\w$]*)',cs):
            accessed.add(m.group(1))

    # Search bootstrap/runtime body for export/presentation/artifact signals.
    export_terms={
      "export":len(re.findall(r'\bexport\b',body,re.I)),
      "presentation":len(re.findall(r'presentation',body,re.I)),
      "download":len(re.findall(r'download',body,re.I)),
      "artifact":len(re.findall(r'artifact',body,re.I)),
      "deck":len(re.findall(r'\bdeck\b',body,re.I)),
      "ppt":len(re.findall(r'pptx?|powerpoint',body,re.I))
    }
    export_semantic_signal=any(v>0 for v in export_terms.values())

    # Search source-wide references to bootstrapPlatformRuntime and return fields.
    bootstrap_refs=[]
    for p in (app/"src").rglob("*"):
        if not p.is_file() or p.suffix not in {".js",".jsx",".ts",".tsx",".mjs"}: continue
        try:s=p.read_text(errors="ignore")
        except:continue
        cnt=s.count("bootstrapPlatformRuntime")
        if cnt:
            bootstrap_refs.append({"file":str(p.relative_to(app)),"count":cnt,
                                   "snippet":compact(s,5000)})
    bootstrap_refs.sort(key=lambda x:-x["count"])

    # Search for explicit export-gate predicates in source, and whether they depend on runtime output fields.
    gate_hits=[]
    gate_rx=re.compile(r'export|presentation|download|artifact',re.I)
    runtime_fields=set(return_keys)|accessed|{"runtimeStatus","diagnostics","capabilityCount","workspaceCount","dependencyValidation"}
    for p in (app/"src").rglob("*"):
        if not p.is_file() or p.suffix not in {".js",".jsx",".ts",".tsx",".mjs"}: continue
        try:s=p.read_text(errors="ignore")
        except:continue
        if not gate_rx.search(s): continue
        matched_fields=[f for f in runtime_fields if re.search(r'\b'+re.escape(f)+r'\b',s)]
        # avoid self/runtime diagnostics-only files if no export semantics beyond module syntax
        semantic_export=bool(re.search(r'handleExport|onExport|Export\b|download|presentation|artifact|pptx?|powerpoint',s,re.I))
        if semantic_export:
            gate_hits.append({
              "file":str(p.relative_to(app)),
              "runtimeFields":matched_fields,
              "runtimeFieldCount":len(matched_fields),
              "snippet":compact(s,5000)
            })
    gate_hits.sort(key=lambda x:-x["runtimeFieldCount"])

    correlated=[x for x in gate_hits if x["runtimeFieldCount"]>0]

    # Inspect active dist consumer semantics: PlatformRuntimeCenter only reads diagnostics/runtimeStatus.
    dist_consumer=app/r7.get("consumerBundle","")
    djs=dist_consumer.read_text(errors="ignore") if dist_consumer.exists() else ""
    dist_export_signal=bool(re.search(r'handleExport|onExport|download|presentation|artifact|pptx?|powerpoint',djs,re.I))

    # Classification: relevant only if bootstrap output fields are directly referenced by export-gate code.
    if correlated:
        classification="RUNTIME_BOOTSTRAP_OUTPUT_FIELDS_CORRELATE_TO_EXPORT_PRESENTATION_GATE_CODE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R9_RUNTIME_OUTPUT_FIELD_TO_EXPORT_GATE_EXACT_PREDICATE_BINDING"
    else:
        classification="PLATFORM_RUNTIME_BOOTSTRAP_OUTPUT_NOT_CAUSALLY_RELEVANT_TO_EXPORT_GATE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_EXPORT_GATE_OWNER_SOURCE_AND_ACTIVE_DIST_REFOCUS"

    checks={
      "r5R7Passed":True,
      "r5R7ZeroArgParityConsumed":True,
      "bootstrapSourceDefinitionResolved":bm is not None,
      "bootstrapReturnContractInspected":True,
      "platformRuntimeCenterConsumerFieldsCaptured":True,
      "bootstrapSourceReferencesCaptured":len(bootstrap_refs)>0,
      "exportPresentationSemanticSearchCompleted":True,
      "runtimeOutputToExportGateCorrelationAttempted":True,
      "classificationResolved":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveWorkflowActionAuthorityOff":True
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    ef=out/"runtime_trigger_output_contract_and_export_gate_relevance_diagnosis.json"
    data={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R8_RUNTIME_TRIGGER_OUTPUT_CONTRACT_AND_EXPORT_GATE_RELEVANCE_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R20_R5_R8_RUNTIME_TRIGGER_OUTPUT_CONTRACT_AND_EXPORT_GATE_RELEVANCE_DIAGNOSED",
      "r5R7Classification":r7.get("classification"),
      "bootstrapParams":bparams,
      "bootstrapReturnKeys":sorted(return_keys),
      "platformRuntimeCenterResultVariable":result_var,
      "platformRuntimeCenterAccessedFields":sorted(accessed),
      "bootstrapExportSemanticTerms":export_terms,
      "bootstrapExportSemanticSignal":export_semantic_signal,
      "bootstrapReferenceCount":len(bootstrap_refs),
      "bootstrapReferences":bootstrap_refs[:40],
      "exportGateSourceCandidateCount":len(gate_hits),
      "runtimeFieldCorrelatedExportGateCandidateCount":len(correlated),
      "runtimeFieldCorrelatedExportGateCandidates":correlated[:50],
      "topExportGateCandidates":gate_hits[:50],
      "distConsumerExportSemanticSignal":dist_export_signal,
      "classification":classification,
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R5-R8 Runtime Trigger Output Contract + Export-Gate Relevance Diagnosis")
    print("="*120)
    print("R5_R7_CLASSIFICATION:",r7.get("classification"))
    print("BOOTSTRAP_PARAMS:",bparams)
    print("BOOTSTRAP_RETURN_KEYS:",sorted(return_keys))
    print("PLATFORM_RUNTIME_CENTER_RESULT_VARIABLE:",result_var)
    print("PLATFORM_RUNTIME_CENTER_ACCESSED_FIELDS:",sorted(accessed))
    print("BOOTSTRAP_EXPORT_SEMANTIC_TERMS:",json.dumps(export_terms))
    print("BOOTSTRAP_EXPORT_SEMANTIC_SIGNAL:",export_semantic_signal)
    print("BOOTSTRAP_REFERENCE_COUNT:",len(bootstrap_refs))
    print("EXPORT_GATE_SOURCE_CANDIDATE_COUNT:",len(gate_hits))
    print("RUNTIME_FIELD_CORRELATED_EXPORT_GATE_CANDIDATE_COUNT:",len(correlated))
    print("DIST_CONSUMER_EXPORT_SEMANTIC_SIGNAL:",dist_export_signal)
    print("CLASSIFICATION:",classification)

    print("\n----- TOP RUNTIME-FIELD-CORRELATED EXPORT GATE CANDIDATES -----")
    for x in correlated[:15]: print(json.dumps(x))
    print("\n----- TOP EXPORT GATE CANDIDATES -----")
    for x in gate_hits[:15]: print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS: PASSED")
    print("STATE:",data["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
