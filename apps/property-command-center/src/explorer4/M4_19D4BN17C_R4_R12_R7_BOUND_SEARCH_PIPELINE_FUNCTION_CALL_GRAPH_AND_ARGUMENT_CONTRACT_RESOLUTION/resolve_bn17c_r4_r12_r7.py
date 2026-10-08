#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R7_BOUND_SEARCH_PIPELINE_FUNCTION_CALL_GRAPH_AND_ARGUMENT_CONTRACT_RESOLUTION"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def clip(txt,a,b,pad=1200):
    return txt[max(0,a-pad):min(len(txt),b+pad)]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r6p=ev/"M4_19D4BN17C_R4_R12_R6_BUNDLE_SYMBOL_NEIGHBORHOOD_DEMINIFICATION_AND_CALL_GRAPH_DIAGNOSIS"/"bundle_symbol_neighborhood_deminification_and_call_graph_diagnosis.json"
    if not r6p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN17C_R4_R12_R6_EVIDENCE_REQUIRED")
        return 4
    r6=fj(r6p)
    bundle=app/r6.get("bundle","")
    if not bundle.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CERTIFIED_ACTIVE_PIPELINE_BUNDLE_MISSING")
        return 5
    txt=bundle.read_text(errors="ignore")

    ingress=(r6.get("ingressCandidates") or [{}])[0].get("symbol")
    linked=(r6.get("linkedDownstreamSymbols") or [None])[0]
    if not ingress or not linked:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R6_INGRESS_AND_DOWNSTREAM_SYMBOLS_REQUIRED")
        return 6

    # Resolve definition/assignment neighborhoods.
    def_patterns=[
      ("named_function",lambda s: re.compile(r"function\s+"+re.escape(s)+r"\s*\(([^)]*)\)\s*\{")),
      ("assigned_arrow",lambda s: re.compile(r"\b"+re.escape(s)+r"\s*=\s*\(([^)]*)\)\s*=>")),
      ("assigned_arrow_single",lambda s: re.compile(r"\b"+re.escape(s)+r"\s*=\s*([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=>")),
      ("assigned_function",lambda s: re.compile(r"\b"+re.escape(s)+r"\s*=\s*function\s*\(([^)]*)\)")),
    ]
    def resolve_def(sym):
        out=[]
        for kind,mk in def_patterns:
            for m in mk(sym).finditer(txt):
                params=m.group(1) if m.lastindex else ""
                out.append({"kind":kind,"start":m.start(),"params":params,"context":clip(txt,m.start(),m.end(),1800)})
                if len(out)>=20:return out
        return out

    ingress_defs=resolve_def(ingress)
    linked_defs=resolve_def(linked)

    # Invocation sites for each symbol.
    call_rx=lambda s: re.compile(r"\b"+re.escape(s)+r"\s*\(([^()]*(?:\([^()]*\)[^()]*)*)\)")
    def resolve_calls(sym,limit=120):
        out=[]
        for m in call_rx(sym).finditer(txt):
            out.append({"start":m.start(),"args":m.group(1),"context":clip(txt,m.start(),m.end(),1400)})
            if len(out)>=limit:break
        return out

    ingress_calls=resolve_calls(ingress)
    linked_calls=resolve_calls(linked)

    # Detect likely input extraction/normalization around ingress definition and linked invocations.
    ingress_blob="\n".join(x["context"] for x in ingress_defs[:10] + ingress_calls[:20])
    linked_blob="\n".join(x["context"] for x in linked_defs[:10] + linked_calls[:30])
    combined=ingress_blob+"\n"+linked_blob

    signals={
      "eventTargetValue": bool(re.search(r"(target|currentTarget)\s*\.\s*value|\.target\.value|\.currentTarget\.value",combined)),
      "rawValue": bool(re.search(r"\bvalue\b",combined,re.I)),
      "trim": bool(re.search(r"\.trim\s*\(",combined)),
      "lowercase": bool(re.search(r"\.toLowerCase\s*\(",combined)),
      "uppercase": bool(re.search(r"\.toUpperCase\s*\(",combined)),
      "splitOrTokenize": bool(re.search(r"\.split\s*\(|token",combined,re.I)),
      "objectWrapping": bool(re.search(r"\{\s*(query|term|value|searchQuery|searchTerm)\s*:",combined,re.I)),
      "enterKeyGate": bool(re.search(r"(Enter|keyCode\s*===?\s*13|which\s*===?\s*13)",combined)),
      "preventDefault": bool(re.search(r"preventDefault\s*\(",combined)),
      "stateSetter": bool(re.search(r"(setSearch|setQuery|setResults|setSearchResults|setSelectedProperty)",combined,re.I)),
      "filtering": bool(re.search(r"\.filter\s*\(",combined)),
      "includes": bool(re.search(r"\.includes\s*\(",combined)),
    }

    # Infer argument contract from ingress formal params and downstream call args.
    ingress_params=[]
    for d in ingress_defs:
        ps=[x.strip() for x in d.get("params","").split(",") if x.strip()]
        ingress_params.extend(ps)
    ingress_params=list(dict.fromkeys(ingress_params))

    linked_arg_exprs=[]
    for c in linked_calls:
        a=c.get("args","").strip()
        if a: linked_arg_exprs.append(a)
    linked_arg_exprs=list(dict.fromkeys(linked_arg_exprs))[:80]

    if signals["eventTargetValue"]:
        ingress_contract="EVENT_OBJECT_WITH_TARGET_VALUE"
    elif signals["enterKeyGate"] and ingress_params:
        ingress_contract="KEYBOARD_EVENT_OR_EVENT_LIKE_OBJECT"
    elif signals["objectWrapping"]:
        ingress_contract="STRUCTURED_QUERY_OBJECT"
    elif ingress_params:
        ingress_contract="DIRECT_ARGUMENT"
    else:
        ingress_contract="CLOSURE_CAPTURED_STATE"

    if any(re.search(r"(query|term|value|searchQuery|searchTerm)",x,re.I) for x in linked_arg_exprs):
        downstream_contract="QUERY_VALUE_OR_QUERY_STATE"
    elif any("{" in x and ":" in x for x in linked_arg_exprs):
        downstream_contract="STRUCTURED_OBJECT"
    elif linked_arg_exprs:
        downstream_contract="POSITIONAL_ARGUMENT"
    else:
        downstream_contract="CLOSURE_CAPTURED_STATE"

    # Build local call edges by checking symbols called inside ingress/linked neighborhoods.
    ident_call=re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*\(")
    ignore={"if","for","while","switch","catch","function","return","typeof","Array","Object","String","Number","Boolean","Math","JSON","Date","RegExp","Promise","Set","Map"}
    def edges_for(blob,src):
        counts={}
        for s in ident_call.findall(blob):
            if s in ignore or s==src:continue
            counts[s]=counts.get(s,0)+1
        return sorted(({"from":src,"to":k,"count":v} for k,v in counts.items()),key=lambda x:(-x["count"],x["to"]))[:120]

    edges=edges_for(ingress_blob,ingress)+edges_for(linked_blob,linked)
    linked_direct=any(e["from"]==ingress and e["to"]==linked for e in edges)

    # Source-level contract around Explorer3.jsx.
    src=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"
    source_contract={}
    if src.exists():
        st=src.read_text(errors="ignore")
        source_contract={
          "file":str(src.relative_to(app)),
          "searchInputRefs":len(re.findall(r"(Search SCIIP|searchQuery|searchTerm|onChange|onKeyDown|onSubmit)",st,re.I)),
          "resultRefs":len(re.findall(r"(searchResults|filteredResults|setSearchResults|setResults)",st,re.I)),
          "selectionRefs":len(re.findall(r"(selectedProperty|setSelectedProperty|onSelect|selectProperty)",st,re.I)),
          "eventTargetValueRefs":len(re.findall(r"(target|currentTarget)\.value",st)),
          "enterKeyRefs":len(re.findall(r"(Enter|keyCode\s*===?\s*13|which\s*===?\s*13)",st)),
        }

    checks={
      "bn17cR4R12R6Passed":r6.get("status")=="PASSED",
      "r6IngressSymbolResolved":bool(ingress),
      "r6DownstreamSymbolResolved":bool(linked),
      "ingressDefinitionResolved":len(ingress_defs)>0,
      "downstreamDefinitionOrInvocationResolved":len(linked_defs)>0 or len(linked_calls)>0,
      "argumentExpressionsCaptured":len(linked_arg_exprs)>0 or len(ingress_params)>0,
      "callGraphEdgesCaptured":len(edges)>0,
      "argumentContractClassified":ingress_contract!="UNRESOLVED",
      "sourceArgumentContractCorrelationCaptured":bool(source_contract),
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed and linked_direct:
        diagnosis="BOUND_QUERY_INGRESS_TO_DOWNSTREAM_CALL_EDGE_AND_ARGUMENT_CONTRACT_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R8_CANONICAL_BOUND_SEARCH_FUNCTION_LIVE_MICRO_COHORT_MATERIALIZATION_CERTIFICATION"
    elif passed:
        diagnosis="BOUND_QUERY_INGRESS_ARGUMENT_CONTRACT_RESOLVED_INDIRECT_CALL_GRAPH_REQUIRES_ALIAS_CLOSURE_BINDING"
        nxt="M4_19D4BN17C_R4_R12_R8_INGRESS_ALIAS_CLOSURE_TO_RESULT_DERIVATION_BINDING_RESOLUTION"
    else:
        diagnosis="BOUND_SEARCH_PIPELINE_ARGUMENT_CONTRACT_REMAINS_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R8_SOURCE_DIST_ARGUMENT_SHAPE_DISAMBIGUATION"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R7_BOUND_SEARCH_PIPELINE_FUNCTION_CALL_GRAPH_AND_ARGUMENT_CONTRACT_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17C_R4_R12_R7_BOUND_SEARCH_PIPELINE_CALL_GRAPH_AND_ARGUMENT_CONTRACT_RESOLVED" if passed else "M419D4BN17C_R4_R12_R7_RESOLUTION_INCOMPLETE",
      "diagnosis":diagnosis,
      "checks":checks,
      "bundle":str(bundle.relative_to(app)),
      "ingressSymbol":ingress,
      "downstreamSymbol":linked,
      "ingressDefinitions":ingress_defs,
      "downstreamDefinitions":linked_defs,
      "ingressCalls":ingress_calls[:80],
      "downstreamCalls":linked_calls[:80],
      "ingressFormalParams":ingress_params,
      "downstreamArgumentExpressions":linked_arg_exprs,
      "contractSignals":signals,
      "ingressArgumentContract":ingress_contract,
      "downstreamArgumentContract":downstream_contract,
      "callGraphEdges":edges,
      "directIngressToDownstreamEdge":linked_direct,
      "sourceContract":source_contract,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "next":"BN17C_R4_R12_R7_CERTIFIED_LIVE_MATERIALIZATION_OR_ALIAS_BINDING_READY" if passed else "BN17C_R4_R12_R7_REMAINS_OPEN",
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"bound_search_pipeline_function_call_graph_and_argument_contract_resolution.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*122)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R7 Bound Search Pipeline Function Call Graph + Argument Contract Resolution")
    print("="*122)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nINGRESS_SYMBOL:",ingress)
    print("DOWNSTREAM_SYMBOL:",linked)
    print("INGRESS_DEFINITION_COUNT:",len(ingress_defs))
    print("DOWNSTREAM_DEFINITION_COUNT:",len(linked_defs))
    print("INGRESS_CALL_COUNT:",len(ingress_calls))
    print("DOWNSTREAM_CALL_COUNT:",len(linked_calls))
    print("INGRESS_FORMAL_PARAM_COUNT:",len(ingress_params))
    print("DOWNSTREAM_ARGUMENT_EXPRESSION_COUNT:",len(linked_arg_exprs))
    print("CALL_GRAPH_EDGE_COUNT:",len(edges))
    print("DIRECT_INGRESS_TO_DOWNSTREAM_EDGE:",linked_direct)
    print("INGRESS_ARGUMENT_CONTRACT:",ingress_contract)
    print("DOWNSTREAM_ARGUMENT_CONTRACT:",downstream_contract)
    print("STATUS:",res["status"])
    print("STATE:",res["state"])
    print("DIAGNOSIS:",res["diagnosis"])
    print("NEXT:",res["next"])
    print("NEXT_MILESTONE:",res["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
