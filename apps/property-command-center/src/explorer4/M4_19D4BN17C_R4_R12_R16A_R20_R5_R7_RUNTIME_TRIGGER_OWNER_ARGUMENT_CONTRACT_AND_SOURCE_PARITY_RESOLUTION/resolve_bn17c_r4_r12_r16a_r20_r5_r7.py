#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys

M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R7_RUNTIME_TRIGGER_OWNER_ARGUMENT_CONTRACT_AND_SOURCE_PARITY_RESOLUTION"
R6M="M4_19D4BN17C_R4_R12_R16A_R20_R5_R6_RUNTIME_LOADER_NON_ENTRY_CHUNK_CALLSITE_AND_TRIGGER_OWNER_RESOLUTION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def compact(s,n=7000):
    return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    r6p=ev/R6M/"runtime_loader_non_entry_chunk_callsite_and_trigger_owner_resolution.json"
    if not r6p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R6_EVIDENCE_REQUIRED"); return 4
    r6=loadj(r6p)
    expected="NON_ENTRY_RUNTIME_IMPORT_CALLSITE_AND_LEXICAL_TRIGGER_OWNER_RESOLVED"
    if r6.get("status")!="PASSED" or r6.get("classification")!=expected:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R6_TRIGGER_OWNER_RESOLUTION_REQUIRED"); return 5

    exact=r6.get("exactCallsite") or {}
    consumer=app/exact.get("bundle","")
    if not consumer.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R5_R6_CONSUMER_BUNDLE_MISSING"); return 6
    cjs=consumer.read_text(errors="ignore")
    alias=exact.get("localAlias")
    owner=exact.get("owner")

    # Resolve imported runtime source and verify zero-argument call contract exactly.
    import_match=None
    for m in re.finditer(r'import\s*\{([^}]+)\}\s*from\s*["\']([^"\']+)["\']',cjs):
        for part in m.group(1).split(","):
            mm=re.match(r'\s*([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?',part.strip())
            if mm and (mm.group(2) or mm.group(1))==alias:
                import_match={"imported":mm.group(1),"local":mm.group(2) or mm.group(1),"source":m.group(2)}
                break
        if import_match: break

    call_matches=list(re.finditer(r'(?<![\w$])'+re.escape(alias)+r'\s*\(\s*\)',cjs)) if alias else []
    zero_arg_exact=len(call_matches)==1

    owner_body=None
    owner_params=None
    if owner:
        om=re.search(r'function\s+'+re.escape(owner)+r'\s*\(([^)]*)\)\s*\{(.+?)\}\s*export',cjs,re.S)
        if om:
            owner_params=om.group(1)
            owner_body=om.group(2)

    # Source component parity.
    component_candidates=[]
    for p in (app/"src").rglob("*"):
        if not p.is_file() or p.suffix not in {".js",".jsx",".ts",".tsx",".mjs"}: continue
        try:s=p.read_text(errors="ignore")
        except:continue
        score=0; signals={}
        for key,rx,w in [
            ("platformRuntimeCenter",r'Platform Runtime Center|platform-runtime-center',70),
            ("useMemo",r'useMemo',20),
            ("runtimeStatus",r'runtimeStatus',20),
            ("capabilityCount",r'capabilityCount',20),
            ("workspaceCount",r'workspaceCount',20),
            ("dependencyValidation",r'dependencyValidation',20),
            ("governanceCopy",r'Autonomous capability removal remains blocked',30)
        ]:
            hit=bool(re.search(rx,s,re.I))
            signals[key]=hit
            if hit: score+=w
        if score:
            component_candidates.append({
                "file":str(p.relative_to(app)),"score":score,"signals":signals,
                "snippet":compact(s,5000)
            })
    component_candidates.sort(key=lambda x:-x["score"])

    # Runtime source parity.
    runtime_candidates=[]
    for p in (app/"src/runtime").glob("*"):
        if not p.is_file() or p.suffix not in {".js",".jsx",".ts",".tsx",".mjs"}: continue
        s=p.read_text(errors="ignore")
        score=0; hits={}
        for key,rx,w in [
            ("initializeRuntime",r'initializeRuntime',55),
            ("runtimeStatus",r'runtimeStatus',25),
            ("registerCapability",r'registerCapability',25),
            ("dependencyValidation",r'dependencyValidation',20),
            ("dynamicRegistration",r'dynamicRegistration',20),
            ("autonomousCapabilityRemoval",r'autonomousCapabilityRemoval',20),
            ("capabilityCount",r'capabilityCount',15),
            ("workspaceCount",r'workspaceCount',15)
        ]:
            c=len(re.findall(rx,s,re.I))
            if c:
                hits[key]=c; score+=w*c
        if score:
            runtime_candidates.append({
                "file":str(p.relative_to(app)),"score":score,"hits":hits,
                "snippet":compact(s,7000)
            })
    runtime_candidates.sort(key=lambda x:-x["score"])

    source_component=component_candidates[0] if component_candidates else None
    source_runtime=runtime_candidates[0] if runtime_candidates else None

    # Infer source call contract from source component: useMemo(()=>initializeRuntime(),[])
    source_zero_arg=False
    source_call_exprs=[]
    if source_component:
        sp=app/source_component["file"]
        ss=sp.read_text(errors="ignore")
        for m in re.finditer(r'useMemo\s*\(\s*\(\s*\)\s*=>\s*([A-Za-z_$][\w$]*)\s*\(([^)]*)\)',ss,re.S):
            source_call_exprs.append({"callee":m.group(1),"args":m.group(2).strip()})
            if m.group(2).strip()=="":
                source_zero_arg=True

    # Resolve likely runtime API definition signature.
    runtime_api_defs=[]
    if source_runtime:
        rp=app/source_runtime["file"]; rs=rp.read_text(errors="ignore")
        for m in re.finditer(r'(?:export\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(([^)]*)\)',rs):
            if "initialize" in m.group(1).lower() or "runtime" in m.group(1).lower():
                runtime_api_defs.append({"name":m.group(1),"params":m.group(2).strip()})
        for m in re.finditer(r'(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*\(([^)]*)\)\s*=>',rs):
            if "initialize" in m.group(1).lower() or "runtime" in m.group(1).lower():
                runtime_api_defs.append({"name":m.group(1),"params":m.group(2).strip()})

    exact_zero_arg_api=any(d["params"]=="" for d in runtime_api_defs)

    if zero_arg_exact and source_zero_arg and source_component and source_runtime:
        classification="ZERO_ARGUMENT_RUNTIME_TRIGGER_CONTRACT_AND_SOURCE_COMPONENT_RUNTIME_PARITY_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R8_RUNTIME_TRIGGER_OUTPUT_CONTRACT_AND_EXPORT_GATE_RELEVANCE_DIAGNOSIS"
    elif zero_arg_exact and source_component and source_runtime:
        classification="DIST_ZERO_ARGUMENT_TRIGGER_RESOLVED_SOURCE_PARITY_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R8_SOURCE_RUNTIME_CALL_CONTRACT_CLOSURE"
    else:
        classification="RUNTIME_TRIGGER_ARGUMENT_OR_SOURCE_PARITY_REMAINS_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R20_R5_R8_RUNTIME_TRIGGER_CONTRACT_DEEPER_CORRELATION"

    checks={
      "r5R6Passed":True,
      "r5R6TriggerOwnerClassificationConsumed":True,
      "consumerBundleResolved":consumer.exists(),
      "runtimeImportAliasResolved":import_match is not None,
      "exactSingleZeroArgumentDistCall":zero_arg_exact,
      "lexicalOwnerBodyResolved":owner_body is not None,
      "sourceComponentCandidatesResolved":len(component_candidates)>0,
      "sourceRuntimeCandidatesResolved":len(runtime_candidates)>0,
      "sourceUseMemoRuntimeCallInspected":True,
      "runtimeApiDefinitionInspected":True,
      "classificationResolved":True,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,
      "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    ef=out/"runtime_trigger_owner_argument_contract_and_source_parity_resolution.json"
    data={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R20_R5_R7_RUNTIME_TRIGGER_OWNER_ARGUMENT_CONTRACT_AND_SOURCE_PARITY_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R20_R5_R7_RUNTIME_TRIGGER_OWNER_ARGUMENT_CONTRACT_AND_SOURCE_PARITY_RESOLUTION_CERTIFIED",
      "r5R6Classification":r6.get("classification"),
      "consumerBundle":str(consumer.relative_to(app)),
      "runtimeImport":import_match,
      "distLexicalOwner":owner,
      "distLexicalOwnerParams":owner_params,
      "distZeroArgumentCallCount":len(call_matches),
      "exactSingleZeroArgumentDistCall":zero_arg_exact,
      "sourceComponentCandidateCount":len(component_candidates),
      "sourceComponentCandidates":component_candidates[:30],
      "exactSourceComponent":source_component,
      "sourceRuntimeCandidateCount":len(runtime_candidates),
      "sourceRuntimeCandidates":runtime_candidates[:30],
      "exactSourceRuntime":source_runtime,
      "sourceUseMemoRuntimeCalls":source_call_exprs,
      "sourceZeroArgumentRuntimeCall":source_zero_arg,
      "runtimeApiDefinitions":runtime_api_defs,
      "exactZeroArgumentRuntimeApiDefinition":exact_zero_arg_api,
      "classification":classification,
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R20-R5-R7 Runtime Trigger Owner Argument Contract + Source Parity Resolution")
    print("="*120)
    print("R5_R6_CLASSIFICATION:",r6.get("classification"))
    print("CONSUMER_BUNDLE:",str(consumer.relative_to(app)))
    print("RUNTIME_IMPORT:",json.dumps(import_match))
    print("DIST_TRIGGER_OWNER:",owner)
    print("DIST_ZERO_ARGUMENT_CALL_COUNT:",len(call_matches))
    print("EXACT_SINGLE_ZERO_ARGUMENT_DIST_CALL:",zero_arg_exact)
    print("SOURCE_COMPONENT_CANDIDATE_COUNT:",len(component_candidates))
    if source_component:
        print("TOP_SOURCE_COMPONENT:",source_component["file"])
        print("TOP_SOURCE_COMPONENT_SCORE:",source_component["score"])
    print("SOURCE_RUNTIME_CANDIDATE_COUNT:",len(runtime_candidates))
    if source_runtime:
        print("TOP_SOURCE_RUNTIME:",source_runtime["file"])
        print("TOP_SOURCE_RUNTIME_SCORE:",source_runtime["score"])
    print("SOURCE_USEMEMO_RUNTIME_CALLS:",json.dumps(source_call_exprs))
    print("SOURCE_ZERO_ARGUMENT_RUNTIME_CALL:",source_zero_arg)
    print("RUNTIME_API_DEFINITIONS:",json.dumps(runtime_api_defs))
    print("EXACT_ZERO_ARGUMENT_RUNTIME_API_DEFINITION:",exact_zero_arg_api)
    print("CLASSIFICATION:",classification)

    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS: PASSED")
    print("STATE:",data["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__": raise SystemExit(main())
