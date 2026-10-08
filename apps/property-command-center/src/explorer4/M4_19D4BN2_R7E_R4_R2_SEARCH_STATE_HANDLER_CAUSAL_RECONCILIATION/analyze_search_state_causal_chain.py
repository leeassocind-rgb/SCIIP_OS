#!/usr/bin/env python3
from __future__ import annotations
import sys, os, re, json, hashlib
from pathlib import Path
from datetime import datetime, timezone

MILESTONE = "M4_19D4BN2_R7E_R4_R2_SEARCH_STATE_HANDLER_CAUSAL_RECONCILIATION"
EXPECTED_BROKER_SHA = "eabdecbddacfd969524bfda6027d88a9d3b81df9458b1bda3f1dca61fa93e413"
TOKENS = [
    "sciip:global-property-search",
    "sciip.globalSearchQuery",
    "Search SCIIP",
    "resolveGlobalPropertySearch",
    "globalSearchQuery",
    "searchText",
    "setSearchText",
    "selectedProperty",
    "sessionStorage",
    "BrokerDestination",
]
EXTS = {".js",".jsx",".mjs",".cjs",".ts",".tsx"}

def sha256_file(p: Path) -> str:
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024), b""):
            h.update(b)
    return h.hexdigest()

def line_no(text: str, idx: int) -> int:
    return text.count("\n", 0, idx) + 1

def snippet(text: str, start_line: int, radius: int=4):
    lines=text.splitlines()
    lo=max(1,start_line-radius)
    hi=min(len(lines),start_line+radius)
    return {"startLine":lo,"endLine":hi,"text":"\n".join(f"{i:5d}: {lines[i-1]}" for i in range(lo,hi+1))}

def occurrences(path: Path, text: str, term: str, cap=20):
    out=[]
    pos=0
    while len(out)<cap:
        i=text.find(term,pos)
        if i<0: break
        ln=line_no(text,i)
        out.append({"file":str(path),"term":term,"line":ln,**snippet(text,ln,3)})
        pos=i+len(term)
    return out

def resolve_import(source: Path, spec: str):
    if not spec.startswith("."): return None
    root=(source.parent/spec).resolve()
    candidates=[]
    if root.suffix:
        candidates.append(root)
    else:
        for e in [".js",".jsx",".ts",".tsx",".mjs",".cjs"]:
            candidates.append(Path(str(root)+e))
        for e in [".js",".jsx",".ts",".tsx",".mjs",".cjs"]:
            candidates.append(root/("index"+e))
    for c in candidates:
        if c.exists() and c.is_file():
            return c
    return None

def import_map(path: Path, text: str):
    found=[]
    pats=[
        re.compile(r'import\s+([^;]+?)\s+from\s+[\'"]([^\'"]+)[\'"]', re.S),
        re.compile(r'import\s*[\'"]([^\'"]+)[\'"]'),
        re.compile(r'require\(\s*[\'"]([^\'"]+)[\'"]\s*\)')
    ]
    for m in pats[0].finditer(text):
        found.append({"clause":" ".join(m.group(1).split()),"spec":m.group(2),"resolved":str(resolve_import(path,m.group(2))) if resolve_import(path,m.group(2)) else None})
    for pat in pats[1:]:
        for m in pat.finditer(text):
            spec=m.group(1)
            found.append({"clause":None,"spec":spec,"resolved":str(resolve_import(path,spec)) if resolve_import(path,spec) else None})
    return found

def find_component_definition(files, name):
    pats=[
        re.compile(rf'\bfunction\s+{re.escape(name)}\s*\('),
        re.compile(rf'\bconst\s+{re.escape(name)}\s*=\s*\('),
        re.compile(rf'\bconst\s+{re.escape(name)}\s*=\s*[^=]*=>'),
        re.compile(rf'\bclass\s+{re.escape(name)}\b')
    ]
    hits=[]
    for p,t in files.items():
        for pat in pats:
            m=pat.search(t)
            if m:
                ln=line_no(t,m.start())
                hits.append({"file":str(p),"line":ln,**snippet(t,ln,10)})
    return hits

def get_candidate_component_names(text: str):
    names=set()
    # JSX around explicit Explorer literals/conditions
    for m in re.finditer(r'(?s).{0,500}(?:destination|nav)\s*={0,2}\s*[\'"]Explorer[\'"].{0,800}', text):
        chunk=m.group(0)
        for n in re.findall(r'<([A-Z][A-Za-z0-9_]*)\b',chunk):
            if n not in {"BrokerDestination"}:
                names.add(n)
    # common route objects
    for m in re.finditer(r'Explorer\s*:\s*([A-Z][A-Za-z0-9_]*)',text):
        names.add(m.group(1))
    return sorted(names)

def classify(result):
    b=result["broker"]
    r=result["routing"]
    e=result["explorer"]
    hand=result["handoff"]

    if not b["exists"]:
        return "BLOCKED_SOURCE_PRECONDITION","SCIIP_BROKER_APP_NOT_FOUND"
    if not r["brokerDestinationResolved"]:
        return "BLOCKED_ROUTING_UNRESOLVED","BROKER_DESTINATION_ROUTE_UNRESOLVED"
    if not e["candidateSurfaceFiles"]:
        return "BLOCKED_EXPLORER_SURFACE_UNRESOLVED","LIVE_EXPLORER_COMPONENT_UNRESOLVED"

    dispatch=b["eventDispatchPresent"]
    nav=b["setNavExplorerPresent"]
    write=b["sessionWritePresent"]
    listeners=hand["listenerFiles"]
    readers=hand["sessionReaderFiles"]
    resolver=e["resolverFiles"]
    candidate=e["candidateSignalFiles"]

    # The broker source sequence is synchronous: state update request then dispatch in same handler.
    # If the resolved Explorer surface owns the listener and no already-mounted listener is found,
    # static source proves a lost-event risk. We only label it deterministic when there is no session fallback reader.
    if nav and dispatch and listeners and not readers:
        return "DIAGNOSTIC_COMPLETE","GLOBAL_SEARCH_EVENT_DISPATCH_BEFORE_EXPLORER_LISTENER_MOUNT"
    if write and not readers:
        return "DIAGNOSTIC_COMPLETE","SESSION_QUERY_WRITTEN_BUT_NOT_CONSUMED"
    if listeners and not resolver:
        return "DIAGNOSTIC_COMPLETE","SEARCH_RESOLVER_NOT_BOUND_TO_LIVE_EXPLORER"
    if (listeners or readers) and not candidate:
        return "DIAGNOSTIC_COMPLETE","EXPLORER_QUERY_STATE_DISCONNECTED_FROM_BROKER_QUERY"
    if resolver and candidate and (listeners or readers):
        return "DIAGNOSTIC_COMPLETE","CAUSAL_CHAIN_CONNECTED_NO_STATIC_DEFECT_PROVEN"
    return "DIAGNOSTIC_COMPLETE","MULTIPLE_CAUSAL_BOUNDARIES_REMAIN"

def main():
    if len(sys.argv)!=2:
        print("Usage: analyze_search_state_causal_chain.py <repo-root>",file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    src=app/"src"
    evidence=app/"evidence/explorer4"/MILESTONE
    evidence.mkdir(parents=True,exist_ok=True)

    print("============================================================")
    print("SCIIP Explorer 4.0 — R4-R2 Search State Causal Reconciliation")
    print("============================================================")
    print(f"Repository: {repo}")
    print("Mode: DIAGNOSTIC_ONLY")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print()

    if not src.exists():
        print(f"BLOCKED: source root not found: {src}",file=sys.stderr); return 3

    all_paths=[]
    for p in src.rglob("*"):
        if p.is_file() and p.suffix in EXTS and "node_modules" not in p.parts:
            all_paths.append(p)
    all_paths=sorted(all_paths)
    files={}
    for p in all_paths:
        try: files[p]=p.read_text(encoding="utf-8")
        except UnicodeDecodeError: files[p]=p.read_text(encoding="utf-8",errors="replace")

    broker=src/"components/SCIIPBrokerApp.jsx"
    broker_text=files.get(broker,"")
    broker_sha=sha256_file(broker) if broker.exists() else None

    token_hits={}
    relevant=set()
    for tok in TOKENS:
        hits=[]
        for p,t in files.items():
            if tok in t:
                hits.extend(occurrences(p,t,tok))
                relevant.add(p)
        token_hits[tok]=hits

    bd_defs=find_component_definition(files,"BrokerDestination")
    for h in bd_defs: relevant.add(Path(h["file"]))

    # Resolve imported BrokerDestination if named import/default import.
    broker_imports=import_map(broker,broker_text) if broker_text else []
    bd_imports=[x for x in broker_imports if x["clause"] and "BrokerDestination" in x["clause"]]
    bd_files=set()
    for h in bd_defs: bd_files.add(Path(h["file"]))
    for x in bd_imports:
        if x["resolved"]: bd_files.add(Path(x["resolved"]))

    route_evidence=[]
    component_names=set()
    for p in bd_files or ({broker} if broker.exists() else set()):
        t=files.get(p,"")
        if not t: continue
        for m in re.finditer(r'Explorer',t):
            ln=line_no(t,m.start())
            route_evidence.append({"file":str(p),"line":ln,**snippet(t,ln,8)})
        component_names.update(get_candidate_component_names(t))
        relevant.add(p)

    # Add imports from routing files that plausibly identify Explorer components.
    candidate_surface_files=set()
    for p in bd_files or ({broker} if broker.exists() else set()):
        t=files.get(p,"")
        for imp in import_map(p,t):
            clause=imp.get("clause") or ""
            if imp.get("resolved") and (
                "Explorer" in clause or
                any(name in clause for name in component_names) or
                "explorer" in imp["spec"].lower() or
                "property-command" in imp["spec"].lower()
            ):
                rp=Path(imp["resolved"])
                candidate_surface_files.add(rp); relevant.add(rp)

    # Definitions for route-discovered component names.
    component_defs={}
    for name in sorted(component_names):
        hits=find_component_definition(files,name)
        component_defs[name]=hits
        for h in hits:
            candidate_surface_files.add(Path(h["file"])); relevant.add(Path(h["file"]))

    # If exact route identification remains sparse, use evidence-bearing files that mention
    # both Explorer-like concepts and relevant handoff tokens as bounded candidate surfaces.
    for p,t in files.items():
        low=str(p).lower()
        if ("explorer" in low or "property" in low) and (
            "sciip:global-property-search" in t or
            "sciip.globalSearchQuery" in t or
            "resolveGlobalPropertySearch" in t
        ):
            candidate_surface_files.add(p); relevant.add(p)

    listener_files=[]
    session_reader_files=[]
    session_writer_files=[]
    resolver_files=[]
    candidate_signal_files=[]
    result_markup_files=[]

    listener_re=re.compile(r'(?:addEventListener|on)\s*\(\s*[\'"]sciip:global-property-search[\'"]')
    reader_re=re.compile(r'sessionStorage\s*\.\s*getItem\s*\(\s*[\'"]sciip\.globalSearchQuery[\'"]')
    writer_re=re.compile(r'sessionStorage\s*\.\s*setItem\s*\(\s*[\'"]sciip\.globalSearchQuery[\'"]')
    resolver_re=re.compile(r'\bresolveGlobalPropertySearch\b')
    candidate_re=re.compile(r'\b(candidate|candidates|searchResults|searchResult|filteredProperties|matchingProperties|results)\b',re.I)
    markup_re=re.compile(r'(?s)<(?:button|li|div|a)[^>]{0,300}.*?(?:candidate|result|property)',re.I)

    scoped = candidate_surface_files if candidate_surface_files else set(files)
    for p in scoped:
        t=files.get(p,"")
        if listener_re.search(t): listener_files.append(str(p)); relevant.add(p)
        if reader_re.search(t): session_reader_files.append(str(p)); relevant.add(p)
        if writer_re.search(t): session_writer_files.append(str(p)); relevant.add(p)
        if resolver_re.search(t): resolver_files.append(str(p)); relevant.add(p)
        if candidate_re.search(t): candidate_signal_files.append(str(p)); relevant.add(p)
        if markup_re.search(t): result_markup_files.append(str(p)); relevant.add(p)

    # Global readers/listeners are also important because a handoff may live in an intermediate bridge.
    for p,t in files.items():
        if listener_re.search(t) and str(p) not in listener_files: listener_files.append(str(p)); relevant.add(p)
        if reader_re.search(t) and str(p) not in session_reader_files: session_reader_files.append(str(p)); relevant.add(p)
        if writer_re.search(t) and str(p) not in session_writer_files: session_writer_files.append(str(p)); relevant.add(p)

    event_idx=broker_text.find("sciip:global-property-search") if broker_text else -1
    nav_candidates=[broker_text.find("setNav('Explorer')"),broker_text.find('setNav("Explorer")')] if broker_text else [-1,-1]
    nav_idx=min([x for x in nav_candidates if x>=0],default=-1)
    session_idx=broker_text.find("sciip.globalSearchQuery") if broker_text else -1

    result={
      "framework":"SCIIP_EXPLORER_4_R4_R2_SEARCH_STATE_HANDLER_CAUSAL_RECONCILIATION",
      "version":"4.0-m4.19d4bn2-r7e-r4-r2",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"DIAGNOSTIC_ONLY",
      "authority":{
        "applicationSourceMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False,
        "automaticRetry":False
      },
      "repository":str(repo),
      "applicationRoot":str(app),
      "broker":{
        "path":str(broker),
        "exists":broker.exists(),
        "sha256":broker_sha,
        "expectedSha256":EXPECTED_BROKER_SHA,
        "expectedShaMatch":broker_sha==EXPECTED_BROKER_SHA if broker_sha else False,
        "searchTextStatePresent":bool(re.search(r'useState\s*\(\s*[\'"]{2}\s*\)',broker_text)) and "searchText" in broker_text,
        "setSearchTextPresent":"setSearchText" in broker_text,
        "onChangePresent":bool(re.search(r'onChange\s*=\s*\{[^}]*setSearchText',broker_text,re.S)),
        "onInputPresent":"onInput=" in broker_text or "onInput =" in broker_text,
        "enterHandlerPresent":bool(re.search(r'e\.key\s*===?\s*[\'"]Enter[\'"]',broker_text)),
        "setNavExplorerPresent":nav_idx>=0,
        "eventDispatchPresent":event_idx>=0,
        "sessionWritePresent":bool(writer_re.search(broker_text)),
        "navBeforeDispatch":nav_idx>=0 and event_idx>=0 and nav_idx<event_idx,
        "sessionWriteBeforeNav":session_idx>=0 and nav_idx>=0 and session_idx<nav_idx,
        "imports":broker_imports,
      },
      "routing":{
        "brokerDestinationDefinitions":bd_defs,
        "brokerDestinationImports":bd_imports,
        "brokerDestinationResolved":bool(bd_defs or bd_imports),
        "explorerRouteEvidence":route_evidence[:30],
        "candidateComponentNames":sorted(component_names),
        "componentDefinitions":component_defs,
      },
      "explorer":{
        "candidateSurfaceFiles":sorted(str(x) for x in candidate_surface_files),
        "resolverFiles":sorted(resolver_files),
        "candidateSignalFiles":sorted(candidate_signal_files),
        "resultMarkupFiles":sorted(result_markup_files)
      },
      "handoff":{
        "listenerFiles":sorted(listener_files),
        "sessionReaderFiles":sorted(session_reader_files),
        "sessionWriterFiles":sorted(session_writer_files),
      },
      "tokenHits":token_hits
    }

    status, diagnosis=classify(result)
    result["status"]=status
    result["state"]="M419D4BN2_R7E_R4_R2_SEARCH_STATE_HANDLER_CAUSAL_RECONCILIATION_COMPLETE" if status=="DIAGNOSTIC_COMPLETE" else status
    result["diagnosis"]=diagnosis

    # source manifest only for files that matter to the trace
    manifest=[]
    for p in sorted(relevant):
        if p.exists():
            manifest.append({"path":str(p),"sha256":sha256_file(p),"bytes":p.stat().st_size})
    (evidence/"source_manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    (evidence/"searched_files.txt").write_text("\n".join(str(p) for p in all_paths)+"\n",encoding="utf-8")
    (evidence/"causal_reconciliation.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")

    report=[]
    report += [
      f"framework: {result['framework']}",
      f"status: {status}",
      f"state: {result['state']}",
      f"diagnosis: {diagnosis}",
      "",
      "AUTHORITIES",
      json.dumps(result["authority"],indent=2),
      "",
      "BROKER",
      f"path: {broker}",
      f"sha256: {broker_sha}",
      f"expectedShaMatch: {result['broker']['expectedShaMatch']}",
      f"searchTextStatePresent: {result['broker']['searchTextStatePresent']}",
      f"setSearchTextPresent: {result['broker']['setSearchTextPresent']}",
      f"onChangePresent: {result['broker']['onChangePresent']}",
      f"onInputPresent: {result['broker']['onInputPresent']}",
      f"enterHandlerPresent: {result['broker']['enterHandlerPresent']}",
      f"sessionWritePresent: {result['broker']['sessionWritePresent']}",
      f"setNavExplorerPresent: {result['broker']['setNavExplorerPresent']}",
      f"eventDispatchPresent: {result['broker']['eventDispatchPresent']}",
      f"sessionWriteBeforeNav: {result['broker']['sessionWriteBeforeNav']}",
      f"navBeforeDispatch: {result['broker']['navBeforeDispatch']}",
      "",
      "ROUTING",
      f"brokerDestinationResolved: {result['routing']['brokerDestinationResolved']}",
      "candidateComponentNames: "+", ".join(result["routing"]["candidateComponentNames"]),
      "candidateSurfaceFiles:",
      *["  "+x for x in result["explorer"]["candidateSurfaceFiles"]],
      "",
      "HANDOFF",
      "listenerFiles:",
      *["  "+x for x in result["handoff"]["listenerFiles"]],
      "sessionReaderFiles:",
      *["  "+x for x in result["handoff"]["sessionReaderFiles"]],
      "sessionWriterFiles:",
      *["  "+x for x in result["handoff"]["sessionWriterFiles"]],
      "",
      "SEARCH STATE / RESOLVER",
      "resolverFiles:",
      *["  "+x for x in result["explorer"]["resolverFiles"]],
      "candidateSignalFiles:",
      *["  "+x for x in result["explorer"]["candidateSignalFiles"]],
      "resultMarkupFiles:",
      *["  "+x for x in result["explorer"]["resultMarkupFiles"]],
      "",
      "NEXT",
      "Use this evidence to design R4-R3. Do not infer a remediation outside the proven diagnosis."
    ]
    (evidence/"causal_reconciliation.txt").write_text("\n".join(report)+"\n",encoding="utf-8")

    print(f"Broker SHA match: {result['broker']['expectedShaMatch']}")
    print(f"BrokerDestination resolved: {result['routing']['brokerDestinationResolved']}")
    print(f"Candidate Explorer surface files: {len(result['explorer']['candidateSurfaceFiles'])}")
    print(f"Global-search listener files: {len(result['handoff']['listenerFiles'])}")
    print(f"Session query reader files: {len(result['handoff']['sessionReaderFiles'])}")
    print(f"Resolver files: {len(result['explorer']['resolverFiles'])}")
    print(f"Candidate-state signal files: {len(result['explorer']['candidateSignalFiles'])}")
    print()
    print(f"STATUS: {status}")
    print(f"DIAGNOSIS: {diagnosis}")
    print(f"EVIDENCE: {evidence/'causal_reconciliation.json'}")

    # Diagnostic completion is successful even when the conclusion is a bounded blocker;
    # environmental/source-root failures above return nonzero.
    return 0 if status=="DIAGNOSTIC_COMPLETE" else 4

if __name__=="__main__":
    raise SystemExit(main())
