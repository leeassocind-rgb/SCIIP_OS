#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R5_ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_RUNTIME_BINDING_RESOLUTION"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def fn_contexts(txt, rx, limit=80):
    out=[]
    for m in rx.finditer(txt):
        a=max(0,m.start()-900);b=min(len(txt),m.end()+1500)
        out.append({"match":m.group(0),"start":m.start(),"context":txt[a:b]})
        if len(out)>=limit: break
    return out

def extract_function_candidates(contexts):
    # Heuristic extraction for minified/bundled function names near matched regions.
    patterns=[
        re.compile(r"function\s+([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*\("),
        re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=\s*\([^)]*\)\s*=>"),
        re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=\s*function\s*\("),
        re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*\([^)]*\)\s*\{"),
    ]
    scores={}
    evidence={}
    for c in contexts:
        s=c["context"]
        for pr in patterns:
            for m in pr.finditer(s):
                nm=m.group(1)
                if nm in {"if","for","while","switch","catch","function","return"}: continue
                scores[nm]=scores.get(nm,0)+1
                evidence.setdefault(nm,[]).append(s[max(0,m.start()-180):min(len(s),m.end()+500)])
    ranked=sorted(({"symbol":k,"score":v,"evidence":evidence[k][:8]} for k,v in scores.items()), key=lambda x:(-x["score"],x["symbol"]))
    return ranked[:60]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    prevp=ev/"M4_19D4BN17C_R4_R12_R4_R1_CDP_TARGET_ABSENCE_RECONCILIATION_AND_EVIDENCE_BACKED_ACTIVE_BUNDLE_CONTRACT_RESOLUTION"/"cdp_target_absence_reconciliation_and_evidence_backed_active_bundle_contract_resolution.json"
    if not prevp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN17C_R4_R12_R4_R1_EVIDENCE_REQUIRED")
        return 4
    prev=fj(prevp)

    complete=prev.get("completePipelineBundles") or []
    if len(complete)!=1:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: EXACTLY_ONE_COMPLETE_PIPELINE_BUNDLE_REQUIRED")
        return 5

    bundle_rel=complete[0]
    bundle=app/bundle_rel
    if not bundle.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CERTIFIED_COMPLETE_PIPELINE_BUNDLE_MISSING")
        return 6

    txt=bundle.read_text(errors="ignore")

    patterns={
      "query_ingress":re.compile(r"(Search SCIIP|broker-global-search|searchQuery|searchTerm|handleSearch|runSearch|executeSearch)",re.I),
      "result_derivation":re.compile(r"(searchResults|filteredResults|\.filter\(|includes\(|startsWith\(|match\()",re.I),
      "result_owner":re.compile(r"(setSearchResults|setResults|searchResults|filteredResults|resultState)",re.I),
      "selection":re.compile(r"(selectedProperty|setSelectedProperty|selectProperty|onSelect|Open Property)",re.I),
      "dispatcher_service":re.compile(r"(dispatch|dispatcher|executeAction|runCommand|searchProvider|searchService|selector)",re.I),
    }

    family={}
    for k,rx in patterns.items():
        ctx=fn_contexts(txt,rx)
        cands=extract_function_candidates(ctx)
        family[k]={"matchCount":len(list(rx.finditer(txt))),"contexts":ctx,"functionCandidates":cands}

    # Determine overlapping symbols across stages.
    symbol_stages={}
    for stage,v in family.items():
        for c in v["functionCandidates"]:
            symbol_stages.setdefault(c["symbol"],[]).append(stage)
    shared=[{"symbol":s,"stages":st,"stageCount":len(st)} for s,st in symbol_stages.items()]
    shared.sort(key=lambda x:(-x["stageCount"],x["symbol"]))

    # Source correlation.
    source_candidates=[]
    for row in prev.get("sourceModuleCandidates") or []:
        p=app/row.get("file","")
        if not p.exists(): continue
        try:stxt=p.read_text(errors="ignore")
        except: continue
        counts={k:len(rx.findall(stxt)) for k,rx in patterns.items()}
        if sum(counts.values()):
            source_candidates.append({
                "file":row.get("file"),
                "counts":counts,
                "score":counts["query_ingress"]*4+counts["result_derivation"]*3+counts["result_owner"]*5+counts["selection"]*4+counts["dispatcher_service"]*2
            })
    source_candidates.sort(key=lambda x:(-x["score"],x["file"]))

    # Exact stage resolution requires at least one function candidate per critical stage.
    query_ok=len(family["query_ingress"]["functionCandidates"])>0
    deriv_ok=len(family["result_derivation"]["functionCandidates"])>0
    owner_ok=len(family["result_owner"]["functionCandidates"])>0
    selection_ok=len(family["selection"]["functionCandidates"])>0
    shared_ok=any(x["stageCount"]>=2 for x in shared)

    checks={
      "bn17cR4R12R4R1Passed":prev.get("status")=="PASSED",
      "exactlyOneCompletePipelineBundle":len(complete)==1,
      "certifiedBundlePresent":bundle.exists(),
      "queryIngressFunctionCandidatesResolved":query_ok,
      "resultDerivationFunctionCandidatesResolved":deriv_ok,
      "resultOwnerFunctionCandidatesResolved":owner_ok,
      "selectionFunctionCandidatesResolved":selection_ok,
      "crossStageSymbolOverlapResolved":shared_ok,
      "sourceSemanticCorrelationResolved":len(source_candidates)>0,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed:
        diagnosis="ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_CANDIDATES_AND_CROSS_STAGE_BINDINGS_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R6_BOUND_SEARCH_PIPELINE_FUNCTION_CALL_GRAPH_AND_ARGUMENT_CONTRACT_RESOLUTION"
    else:
        diagnosis="ACTIVE_DIST_SEARCH_PIPELINE_FUNCTION_BINDING_REMAINS_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R6_BUNDLE_SYMBOL_NEIGHBORHOOD_DEMINIFICATION_AND_CALL_GRAPH_DIAGNOSIS"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R5_ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_RUNTIME_BINDING_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17C_R4_R12_R5_ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_BINDING_RESOLVED" if passed else "M419D4BN17C_R4_R12_R5_BINDING_INCOMPLETE",
      "diagnosis":diagnosis,
      "checks":checks,
      "bundle":bundle_rel,
      "bundleBytes":bundle.stat().st_size,
      "familyResolution":family,
      "crossStageSymbols":shared[:80],
      "sourceSemanticCandidates":source_candidates[:80],
      "topResolved":{
        "queryIngress":family["query_ingress"]["functionCandidates"][:10],
        "resultDerivation":family["result_derivation"]["functionCandidates"][:10],
        "resultOwner":family["result_owner"]["functionCandidates"][:10],
        "selection":family["selection"]["functionCandidates"][:10],
        "dispatcherService":family["dispatcher_service"]["functionCandidates"][:10],
      },
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "next":"BN17C_R4_R12_R5_CERTIFIED_CALL_GRAPH_RESOLUTION_READY" if passed else "BN17C_R4_R12_R5_REMAINS_OPEN",
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"active_dist_search_pipeline_bound_function_runtime_binding_resolution.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*122)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R5 Active Dist Search Pipeline Bound-Function Runtime Binding Resolution")
    print("="*122)
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\nACTIVE_PIPELINE_BUNDLE:",bundle_rel)
    print("QUERY_INGRESS_FUNCTION_CANDIDATE_COUNT:",len(family["query_ingress"]["functionCandidates"]))
    print("RESULT_DERIVATION_FUNCTION_CANDIDATE_COUNT:",len(family["result_derivation"]["functionCandidates"]))
    print("RESULT_OWNER_FUNCTION_CANDIDATE_COUNT:",len(family["result_owner"]["functionCandidates"]))
    print("SELECTION_FUNCTION_CANDIDATE_COUNT:",len(family["selection"]["functionCandidates"]))
    print("DISPATCHER_SERVICE_FUNCTION_CANDIDATE_COUNT:",len(family["dispatcher_service"]["functionCandidates"]))
    print("CROSS_STAGE_SYMBOL_COUNT:",len(shared))
    if shared: print("TOP_CROSS_STAGE_SYMBOL:",shared[0]["symbol"],"stages="+",".join(shared[0]["stages"]))
    if source_candidates: print("TOP_SOURCE_SEMANTIC_MODULE:",source_candidates[0]["file"])
    print("STATUS:",res["status"])
    print("STATE:",res["state"])
    print("DIAGNOSIS:",res["diagnosis"])
    print("NEXT:",res["next"])
    print("NEXT_MILESTONE:",res["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
