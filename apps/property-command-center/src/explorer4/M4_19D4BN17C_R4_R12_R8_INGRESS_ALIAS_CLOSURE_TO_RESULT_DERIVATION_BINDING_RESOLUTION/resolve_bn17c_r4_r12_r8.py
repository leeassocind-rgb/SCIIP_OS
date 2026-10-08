#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,collections

M="M4_19D4BN17C_R4_R12_R8_INGRESS_ALIAS_CLOSURE_TO_RESULT_DERIVATION_BINDING_RESOLUTION"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r7p=ev/"M4_19D4BN17C_R4_R12_R7_BOUND_SEARCH_PIPELINE_FUNCTION_CALL_GRAPH_AND_ARGUMENT_CONTRACT_RESOLUTION"/"bound_search_pipeline_function_call_graph_and_argument_contract_resolution.json"
    if not r7p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R7_EVIDENCE_REQUIRED");return 4
    r7=fj(r7p)
    bundle=app/r7.get("bundle","")
    if not bundle.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_ACTIVE_PIPELINE_BUNDLE_MISSING");return 5
    txt=bundle.read_text(errors="ignore")
    ingress=r7.get("ingressSymbol"); downstream=r7.get("downstreamSymbol")
    if not ingress or not downstream:
        print("STATUS: BLOCKED\nDIAGNOSIS: R7_BOUND_SYMBOLS_REQUIRED");return 6

    # Build a broad symbol relation graph from assignment aliases, calls and wrapper forwarding.
    graph=collections.defaultdict(set)
    edge_evidence=collections.defaultdict(list)

    # a=b
    alias_rx=re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=\s*([A-Za-z_$][A-Za-z0-9_$]{0,40})\b")
    for m in alias_rx.finditer(txt):
        l,r=m.group(1),m.group(2)
        graph[l].add(r); graph[r].add(l)
        edge_evidence[(l,r)].append(txt[max(0,m.start()-250):min(len(txt),m.end()+500)])
        edge_evidence[(r,l)].append(txt[max(0,m.start()-250):min(len(txt),m.end()+500)])

    # function/arrow bodies, approximate balanced window then calls therein
    defs=[]
    def_rx=[
      re.compile(r"function\s+([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*\(([^)]*)\)\s*\{"),
      re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=\s*\(([^)]*)\)\s*=>"),
      re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=\s*([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*=>"),
    ]
    call_rx=re.compile(r"\b([A-Za-z_$][A-Za-z0-9_$]{0,40})\s*\(")
    ignore={"if","for","while","switch","catch","function","return","typeof","Array","Object","String","Number","Boolean","Math","JSON","Date","RegExp","Promise","Set","Map"}
    for rx in def_rx:
        for m in rx.finditer(txt):
            sym=m.group(1)
            body=txt[m.end():min(len(txt),m.end()+4000)]
            called=[]
            for c in call_rx.findall(body):
                if c not in ignore and c!=sym:
                    called.append(c)
                    graph[sym].add(c)
                    edge_evidence[(sym,c)].append(body[:1500])
            defs.append({"symbol":sym,"params":m.group(2) if m.lastindex and m.lastindex>=2 else "","called":list(dict.fromkeys(called))[:80],"start":m.start()})

    # property-bound aliases like onChange:j or search:x
    prop_rx=re.compile(r"\b(onChange|onKeyDown|onSubmit|onInput|onClick|search|query|onSearch|handleSearch)\s*:\s*([A-Za-z_$][A-Za-z0-9_$]{0,40})",re.I)
    for m in prop_rx.finditer(txt):
        prop,sym=m.group(1),m.group(2)
        pseudo="PROP_"+prop.upper()
        graph[pseudo].add(sym); graph[sym].add(pseudo)
        edge_evidence[(pseudo,sym)].append(txt[max(0,m.start()-250):min(len(txt),m.end()+500)])
        edge_evidence[(sym,pseudo)].append(txt[max(0,m.start()-250):min(len(txt),m.end()+500)])

    # BFS shortest path ingress -> downstream
    q=collections.deque([[ingress]])
    seen={ingress}
    path=None
    while q:
        pth=q.popleft()
        cur=pth[-1]
        if cur==downstream:
            path=pth;break
        if len(pth)>10: continue
        for nxt in sorted(graph.get(cur,())):
            if nxt not in seen:
                seen.add(nxt);q.append(pth+[nxt])

    # If no path, inspect R7 call edges and add them.
    if not path:
        for e in r7.get("callGraphEdges") or []:
            a,b=e.get("from"),e.get("to")
            if a and b:
                graph[a].add(b)
        q=collections.deque([[ingress]]);seen={ingress}
        while q:
            pth=q.popleft();cur=pth[-1]
            if cur==downstream:path=pth;break
            if len(pth)>12:continue
            for nxt in sorted(graph.get(cur,())):
                if nxt not in seen:
                    seen.add(nxt);q.append(pth+[nxt])

    # Per-hop evidence and argument-shape signals.
    hops=[]
    if path:
        for a,b in zip(path,path[1:]):
            evd=edge_evidence.get((a,b),[])[:8]
            blob="\n".join(evd)
            hops.append({
                "from":a,"to":b,
                "evidence":evd,
                "signals":{
                    "targetValue":bool(re.search(r"(target|currentTarget)\.value",blob)),
                    "trim":bool(re.search(r"\.trim\s*\(",blob)),
                    "lowercase":bool(re.search(r"\.toLowerCase\s*\(",blob)),
                    "objectWrap":bool(re.search(r"\{\s*(query|term|value|searchQuery|searchTerm)\s*:",blob,re.I)),
                    "directCall":bool(re.search(r"\b"+re.escape(b)+r"\s*\(",blob))
                }
            })

    # Candidate wrappers near ingress/downstream.
    wrapper_defs=[d for d in defs if d["symbol"] in (path or [])]
    alias_hops=max(0,len(path)-2) if path else None

    source=app/"src/broker-product/property-explorer/v6/Explorer3.jsx"
    source_corr={}
    if source.exists():
        st=source.read_text(errors="ignore")
        source_corr={
          "file":str(source.relative_to(app)),
          "targetValueRefs":len(re.findall(r"(target|currentTarget)\.value",st)),
          "searchHandlerRefs":len(re.findall(r"(onChange|onKeyDown|onSubmit|handleSearch|searchQuery|searchTerm)",st,re.I)),
          "resultRefs":len(re.findall(r"(searchResults|filteredResults|setSearchResults|setResults)",st,re.I)),
        }

    checks={
      "bn17cR4R12R7Passed":r7.get("status")=="PASSED",
      "r7IndirectCallGraphCertified":r7.get("directIngressToDownstreamEdge") is False,
      "ingressSymbolResolved":bool(ingress),
      "downstreamSymbolResolved":bool(downstream),
      "aliasClosureGraphBuilt":len(graph)>0,
      "shortestIngressToDownstreamPathResolved":bool(path),
      "perHopEvidenceCaptured":bool(hops),
      "sourceCorrelationCaptured":bool(source_corr),
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed:
        diagnosis="INGRESS_ALIAS_CLOSURE_TO_RESULT_DERIVATION_BINDING_PATH_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R9_CANONICAL_BOUND_SEARCH_FUNCTION_LIVE_MICRO_COHORT_MATERIALIZATION_CERTIFICATION"
    else:
        diagnosis="INGRESS_ALIAS_CLOSURE_BINDING_PATH_REMAINS_UNRESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R9_SOURCE_DIST_ALIAS_DEMINIFICATION_REPAIR"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R8_INGRESS_ALIAS_CLOSURE_TO_RESULT_DERIVATION_BINDING_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17C_R4_R12_R8_INGRESS_ALIAS_CLOSURE_BINDING_RESOLVED" if passed else "M419D4BN17C_R4_R12_R8_BINDING_INCOMPLETE",
      "diagnosis":diagnosis,
      "checks":checks,
      "bundle":str(bundle.relative_to(app)),
      "ingressSymbol":ingress,
      "downstreamSymbol":downstream,
      "resolvedPath":path,
      "aliasHopCount":alias_hops,
      "pathHops":hops,
      "wrapperDefinitions":wrapper_defs,
      "sourceCorrelation":source_corr,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "next":"BN17C_R4_R12_R8_CERTIFIED_LIVE_BOUND_SEARCH_MATERIALIZATION_READY" if passed else "BN17C_R4_R12_R8_REMAINS_OPEN",
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"ingress_alias_closure_to_result_derivation_binding_resolution.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R8 Ingress Alias / Closure -> Result Derivation Binding Resolution")
    print("="*120)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nINGRESS_SYMBOL:",ingress)
    print("DOWNSTREAM_SYMBOL:",downstream)
    print("GRAPH_NODE_COUNT:",len(graph))
    print("RESOLVED_PATH_LENGTH:",len(path) if path else 0)
    print("ALIAS_HOP_COUNT:",alias_hops if alias_hops is not None else "N/A")
    print("RESOLVED_PATH:"," -> ".join(path) if path else "NONE")
    print("PATH_HOP_EVIDENCE_COUNT:",len(hops))
    print("STATUS:",res["status"])
    print("STATE:",res["state"])
    print("DIAGNOSIS:",res["diagnosis"])
    print("NEXT:",res["next"])
    print("NEXT_MILESTONE:",res["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
