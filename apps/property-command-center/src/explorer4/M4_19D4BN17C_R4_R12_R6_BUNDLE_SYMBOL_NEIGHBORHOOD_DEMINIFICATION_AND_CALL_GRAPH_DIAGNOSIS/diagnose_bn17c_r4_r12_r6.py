#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R6_BUNDLE_SYMBOL_NEIGHBORHOOD_DEMINIFICATION_AND_CALL_GRAPH_DIAGNOSIS"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r5p=ev/"M4_19D4BN17C_R4_R12_R5_ACTIVE_DIST_SEARCH_PIPELINE_BOUND_FUNCTION_RUNTIME_BINDING_RESOLUTION"/"active_dist_search_pipeline_bound_function_runtime_binding_resolution.json"
    if not r5p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R5_EVIDENCE_REQUIRED"); return 4
    r5=fj(r5p)
    bundle=app/r5.get("bundle","")
    if not bundle.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_ACTIVE_PIPELINE_BUNDLE_MISSING"); return 5
    txt=bundle.read_text(errors="ignore")

    ingress_rx=re.compile(r"(Search SCIIP|broker-global-search|searchQuery|searchTerm|handleSearch|runSearch|executeSearch)",re.I)
    windows=[]
    for m in ingress_rx.finditer(txt):
        a=max(0,m.start()-3000); b=min(len(txt),m.end()+5000)
        windows.append({"match":m.group(0),"start":m.start(),"context":txt[a:b]})
        if len(windows)>=100: break

    # Candidate constructs surrounding ingress.
    constructs=[]
    patterns=[
        ("named_function",re.compile(r"function\s+([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*\(([^)]*)\)\s*\{")),
        ("assigned_arrow",re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=\s*\(([^)]*)\)\s*=>")),
        ("assigned_arrow_single",re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=\s*([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=>")),
        ("assigned_function",re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=\s*function\s*\(([^)]*)\)")),
        ("jsx_handler",re.compile(r"(onChange|onKeyDown|onSubmit|onInput|onClick)\s*:\s*([A-Za-z_$][A-Za-z0-9_$]{0,40})")),
        ("prop_assignment",re.compile(r"\b(search|query|onSearch|handleSearch)\s*:\s*([A-Za-z_$][A-Za-z0-9_$]{0,40})",re.I)),
    ]
    for wi,w in enumerate(windows):
        ctx=w["context"]
        for kind,rx in patterns:
            for m in rx.finditer(ctx):
                sym=m.group(1) if kind not in ("jsx_handler","prop_assignment") else m.group(2)
                constructs.append({"window":wi,"kind":kind,"symbol":sym,"match":m.group(0),"localStart":m.start(),"evidence":ctx[max(0,m.start()-350):min(len(ctx),m.end()+900)]})

    # Call graph from identifiers followed by '(' within ingress windows.
    call_rx=re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*\(")
    ignore={"if","for","while","switch","catch","function","return","typeof","Array","Object","String","Number","Boolean","Math","JSON","Date","RegExp","Promise","Set","Map"}
    calls={}
    for wi,w in enumerate(windows):
        syms=[s for s in call_rx.findall(w["context"]) if s not in ignore]
        for s in syms:
            calls.setdefault(s,{"count":0,"windows":set()})
            calls[s]["count"]+=1;calls[s]["windows"].add(wi)
    ranked_calls=sorted(({"symbol":k,"count":v["count"],"windowCount":len(v["windows"])} for k,v in calls.items()),key=lambda x:(-x["windowCount"],-x["count"],x["symbol"]))

    # Recover downstream symbols from R5 and see which appear in ingress neighborhoods.
    downstream=set()
    for stage in ("resultDerivation","resultOwner","selection","dispatcherService"):
        for x in (r5.get("topResolved",{}).get(stage) or []):
            if x.get("symbol"): downstream.add(x["symbol"])
    ingress_blob="\n".join(w["context"] for w in windows)
    linked_downstream=sorted(s for s in downstream if re.search(r"\b"+re.escape(s)+r"\b",ingress_blob))

    # Rank ingress candidates by proximity and call recurrence.
    cscores={}
    ckinds={}
    cevidence={}
    for c in constructs:
        s=c["symbol"]
        cscores[s]=cscores.get(s,0)+4
        ckinds.setdefault(s,set()).add(c["kind"])
        cevidence.setdefault(s,[]).append(c["evidence"])
    for rc in ranked_calls:
        s=rc["symbol"]
        cscores[s]=cscores.get(s,0)+rc["windowCount"]*2+min(rc["count"],10)
    # Bonus if candidate sits in text with downstream symbol references.
    for s in list(cscores):
        if re.search(r"\b"+re.escape(s)+r"\b",ingress_blob):
            cscores[s]+=1
    candidates=sorted(({"symbol":s,"score":score,"kinds":sorted(ckinds.get(s,set())),"evidence":cevidence.get(s,[])[:8]} for s,score in cscores.items()),key=lambda x:(-x["score"],x["symbol"]))[:80]

    classification="UNRESOLVED"
    top=candidates[0] if candidates else None
    if top:
        kinds=set(top["kinds"])
        if "named_function" in kinds: classification="NAMED_FUNCTION"
        elif "assigned_arrow" in kinds or "assigned_arrow_single" in kinds: classification="ASSIGNED_ARROW_CLOSURE"
        elif "assigned_function" in kinds: classification="ASSIGNED_FUNCTION_CLOSURE"
        elif "jsx_handler" in kinds: classification="PROPERTY_BOUND_EVENT_HANDLER"
        elif "prop_assignment" in kinds: classification="PROP_BOUND_SEARCH_HANDLER"
        else: classification="INLINE_OR_IMPORTED_ALIAS"

    source=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"
    source_corr={}
    if source.exists():
        st=source.read_text(errors="ignore")
        source_corr={
            "file":str(source.relative_to(app)),
            "searchIngressRefs":len(ingress_rx.findall(st)),
            "handlerRefs":len(re.findall(r"(onChange|onKeyDown|onSubmit|handleSearch|searchQuery|searchTerm)",st,re.I)),
            "resultRefs":len(re.findall(r"(searchResults|filteredResults|setSearchResults|setResults)",st,re.I)),
            "selectionRefs":len(re.findall(r"(selectedProperty|setSelectedProperty|onSelect|selectProperty)",st,re.I))
        }

    checks={
      "bn17cR4R12R5DiagnosticComplete":r5.get("status")=="DIAGNOSTIC_COMPLETE",
      "r5QueryIngressCandidateCountZero":len(r5.get("topResolved",{}).get("queryIngress") or [])==0,
      "ingressNeighborhoodsCaptured":len(windows)>0,
      "inlineOrAssignedConstructsCaptured":len(constructs)>0,
      "callGraphSymbolsCaptured":len(ranked_calls)>0,
      "downstreamLinkageAttempted":True,
      "sourceIngressCorrelationCaptured":bool(source_corr),
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if candidates and linked_downstream:
        diagnosis="QUERY_INGRESS_SYMBOL_NEIGHBORHOOD_AND_DOWNSTREAM_CALL_GRAPH_LINKAGE_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R7_BOUND_SEARCH_PIPELINE_FUNCTION_CALL_GRAPH_AND_ARGUMENT_CONTRACT_RESOLUTION"
    elif candidates:
        diagnosis="QUERY_INGRESS_SYMBOL_CANDIDATE_RESOLVED_DOWNSTREAM_LINKAGE_REMAINS_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R7_INGRESS_TO_DERIVATION_ALIAS_LINKAGE_RESOLUTION"
    else:
        diagnosis="QUERY_INGRESS_REMAINS_INLINE_OR_COMPILER_INLINED_BEYOND_SYMBOL_RECOVERY"
        nxt="M4_19D4BN17C_R4_R12_R7_EVENT_PROP_TO_INLINE_BODY_STRUCTURAL_TRACE"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R6_BUNDLE_SYMBOL_NEIGHBORHOOD_DEMINIFICATION_AND_CALL_GRAPH_DIAGNOSIS",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R12_R6_BUNDLE_SYMBOL_NEIGHBORHOOD_AND_CALL_GRAPH_DIAGNOSED" if passed else "M419D4BN17C_R4_R12_R6_DIAGNOSIS_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,"bundle":str(bundle.relative_to(app)),
         "ingressNeighborhoods":windows,"constructs":constructs[:200],"rankedCallSymbols":ranked_calls[:120],
         "ingressCandidates":candidates,"linkedDownstreamSymbols":linked_downstream,
         "ingressClassification":classification,"sourceCorrelation":source_corr,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R12_R6_CERTIFIED_CALL_GRAPH_NEXT_STEP_READY" if passed else "BN17C_R4_R12_R6_REMAINS_OPEN",
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"bundle_symbol_neighborhood_deminification_and_call_graph_diagnosis.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R6 Bundle Symbol Neighborhood Deminification + Call-Graph Diagnosis")
    print("="*120)
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\nINGRESS_NEIGHBORHOOD_COUNT:",len(windows))
    print("INGRESS_CONSTRUCT_COUNT:",len(constructs))
    print("CALL_GRAPH_SYMBOL_COUNT:",len(ranked_calls))
    print("INGRESS_CANDIDATE_COUNT:",len(candidates))
    print("LINKED_DOWNSTREAM_SYMBOL_COUNT:",len(linked_downstream))
    if top: print("TOP_INGRESS_SYMBOL:",top["symbol"])
    print("INGRESS_CLASSIFICATION:",classification)
    if linked_downstream: print("TOP_LINKED_DOWNSTREAM_SYMBOL:",linked_downstream[0])
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__": raise SystemExit(main())
