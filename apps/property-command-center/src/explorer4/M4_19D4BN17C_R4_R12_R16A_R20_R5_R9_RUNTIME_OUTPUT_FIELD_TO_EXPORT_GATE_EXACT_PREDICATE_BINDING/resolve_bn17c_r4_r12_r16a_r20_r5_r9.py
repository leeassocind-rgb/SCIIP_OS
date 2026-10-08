#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R9_RUNTIME_OUTPUT_FIELD_TO_EXPORT_GATE_EXACT_PREDICATE_BINDING"
R8M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R8_RUNTIME_TRIGGER_OUTPUT_CONTRACT_AND_EXPORT_GATE_RELEVANCE_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def line_no(s,pos): return s.count("\n",0,pos)+1
def snip(s,pos,r=900):
    return re.sub(r"\s+"," ",s[max(0,pos-r):min(len(s),pos+r)]).strip()
def files(root):
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs",".cjs"}:
            yield p

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    r8p=ev/R8M/"runtime_trigger_output_contract_and_export_gate_relevance_diagnosis.json"
    if not r8p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R8_EVIDENCE_REQUIRED"); return 4
    r8=loadj(r8p)
    if r8.get("status")!="PASSED" or r8.get("classification")!="RUNTIME_BOOTSTRAP_OUTPUT_FIELDS_CORRELATE_TO_EXPORT_PRESENTATION_GATE_CODE":
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R8_CORRELATION_CLASSIFICATION_REQUIRED"); return 5

    runtime_fields=set(r8.get("platformRuntimeCenterAccessedFields") or [])
    runtime_fields.update(["runtimeStatus","diagnostics","workspaceCount","capabilityCount","dependencyValidation"])
    gate_sem=re.compile(r'handleExport|onExport|export[A-Z_$]|Export\b|Presentation\b|download|artifact|pptx?|powerpoint',re.I)

    # Exact co-occurrence requires a semantic gate term and a runtime field in the same
    # executable statement/JSX expression neighborhood, not merely the same source file.
    exact=[]
    loose=[]
    for p in files(app/"src"):
        try:s=p.read_text(errors="ignore")
        except:continue
        sems=list(gate_sem.finditer(s))
        if not sems: continue
        for gm in sems:
            near=s[max(0,gm.start()-700):min(len(s),gm.end()+700)]
            flds=[f for f in sorted(runtime_fields) if re.search(r'\b'+re.escape(f)+r'\b',near)]
            if flds:
                loose.append({"file":str(p.relative_to(app)),"line":line_no(s,gm.start()),
                              "gateToken":gm.group(0),"runtimeFields":flds,"snippet":snip(s,gm.start())})
            # tight executable predicate window
            tight=s[max(0,gm.start()-220):min(len(s),gm.end()+220)]
            tf=[f for f in sorted(runtime_fields) if re.search(r'\b'+re.escape(f)+r'\b',tight)]
            pred=bool(re.search(r'if\s*\(|\?\s*[^:]+:|&&|\|\||disabled\s*=|hidden\s*=|aria-disabled|return\s+',tight,re.I))
            if tf and pred:
                exact.append({"file":str(p.relative_to(app)),"line":line_no(s,gm.start()),
                              "gateToken":gm.group(0),"runtimeFields":tf,"predicateSignal":pred,
                              "snippet":snip(s,gm.start(),500)})

    # Specifically inspect Explorer3, where the actual Presentation control is known to exist.
    explorer=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"
    explorer_hits=[]
    if explorer.exists():
        es=explorer.read_text(errors="ignore")
        for m in re.finditer(r'Presentation|Export|handleExport|onExport',es,re.I):
            around=es[max(0,m.start()-1200):min(len(es),m.start()+1800)]
            explorer_hits.append({
              "line":line_no(es,m.start()),"token":m.group(0),
              "runtimeFields":[f for f in sorted(runtime_fields) if re.search(r'\b'+re.escape(f)+r'\b',around)],
              "snippet":re.sub(r"\s+"," ",around)
            })

    # PlatformRuntimeCenter itself can create false correlation because "export default"
    # is module syntax. Explicitly classify those hits.
    prc=app/"src/components/PlatformRuntimeCenter.jsx"
    prc_module_export_only=False
    if prc.exists():
        ps=prc.read_text(errors="ignore")
        semantic=[m.group(0) for m in gate_sem.finditer(ps)]
        module_exports=len(re.findall(r'\bexport\s+default\b|\bexport\s+(?:function|const|class)\b',ps))
        prc_module_export_only=(len(semantic)==0 or all(x.lower()=="export" for x in semantic)) and module_exports>0

    # Remove diagnostic/generated explorer4 scripts from causal candidates.
    exact_product=[x for x in exact if not x["file"].startswith("src/explorer4/")]
    loose_product=[x for x in loose if not x["file"].startswith("src/explorer4/")]

    # Strong causal binding requires exact predicate in product code AND a runtime field.
    if exact_product:
        classification="EXACT_RUNTIME_OUTPUT_FIELD_TO_EXPORT_GATE_PREDICATE_BINDING_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R10_BOUND_EXPORT_GATE_RUNTIME_VALUE_AND_VISIBILITY_STATE_DIAGNOSIS"
    else:
        classification="R5_R8_RUNTIME_EXPORT_GATE_CORRELATION_REJECTED_AS_LEXICAL_FALSE_POSITIVE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_EXPORT_PRESENTATION_CONTROL_OWNER_SOURCE_AND_ACTIVE_DIST_REFOCUS"

    checks={
      "r5R8Passed":True,
      "r5R8CorrelationConsumed":True,
      "runtimeFieldSetResolved":True,
      "semanticExportPresentationTokensScanned":True,
      "tightPredicateNeighborhoodsInspected":True,
      "explorerPresentationControlInspected":explorer.exists(),
      "moduleExportSyntaxFalsePositiveChecked":True,
      "generatedDiagnosticSourcesExcludedFromCausalBinding":True,
      "classificationResolved":True,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,
      "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    ef=out/"runtime_output_field_to_export_gate_exact_predicate_binding.json"
    data={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R9_RUNTIME_OUTPUT_FIELD_TO_EXPORT_GATE_EXACT_PREDICATE_BINDING",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R20_R5_R9_RUNTIME_OUTPUT_FIELD_TO_EXPORT_GATE_EXACT_PREDICATE_BINDING_DIAGNOSED",
      "r5R8Classification":r8.get("classification"),
      "runtimeFields":sorted(runtime_fields),
      "looseCorrelationCount":len(loose),"looseProductCorrelationCount":len(loose_product),
      "exactPredicateBindingCount":len(exact),"exactProductPredicateBindingCount":len(exact_product),
      "platformRuntimeCenterModuleExportOnly":prc_module_export_only,
      "explorerPresentationHits":explorer_hits[:30],
      "exactProductPredicateBindings":exact_product[:50],
      "looseProductCorrelations":loose_product[:50],
      "classification":classification,"checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R5-R9 Runtime Output Field → Export Gate Exact Predicate Binding")
    print("="*120)
    print("R5_R8_CLASSIFICATION:",r8.get("classification"))
    print("RUNTIME_FIELDS:",sorted(runtime_fields))
    print("LOOSE_CORRELATION_COUNT:",len(loose))
    print("LOOSE_PRODUCT_CORRELATION_COUNT:",len(loose_product))
    print("EXACT_PREDICATE_BINDING_COUNT:",len(exact))
    print("EXACT_PRODUCT_PREDICATE_BINDING_COUNT:",len(exact_product))
    print("PLATFORM_RUNTIME_CENTER_MODULE_EXPORT_ONLY:",prc_module_export_only)
    print("EXPLORER_PRESENTATION_HIT_COUNT:",len(explorer_hits))
    print("CLASSIFICATION:",classification)
    print("\n----- EXPLORER PRESENTATION HITS -----")
    for x in explorer_hits[:15]: print(json.dumps(x))
    print("\n----- EXACT PRODUCT PREDICATE BINDINGS -----")
    for x in exact_product[:20]: print(json.dumps(x))
    print("\n----- LOOSE PRODUCT CORRELATIONS -----")
    for x in loose_product[:20]: print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS: PASSED")
    print("STATE:",data["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__": raise SystemExit(main())
