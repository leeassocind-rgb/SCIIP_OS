#!/usr/bin/env python3
from __future__ import annotations
import sys, re, json, hashlib
from pathlib import Path
from datetime import datetime, timezone

MILESTONE="M4_19D4BN2_R7E_R4_R2_R1_BROKERDESTINATION_ROUTING_RESOLUTION"
EXTS={".js",".jsx",".mjs",".cjs",".ts",".tsx"}
EXPECTED_BROKER_SHA="eabdecbddacfd969524bfda6027d88a9d3b81df9458b1bda3f1dca61fa93e413"

def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()

def ln(text,pos): return text.count("\n",0,pos)+1

def snip(text,line,r=7):
    lines=text.splitlines()
    a=max(1,line-r); b=min(len(lines),line+r)
    return {"startLine":a,"endLine":b,"text":"\n".join(f"{i:5d}: {lines[i-1]}" for i in range(a,b+1))}

def resolve_rel(src,spec):
    if not spec.startswith("."): return None
    root=(src.parent/spec).resolve()
    cands=[]
    if root.suffix: cands.append(root)
    else:
        for e in [".js",".jsx",".ts",".tsx",".mjs",".cjs"]: cands.append(Path(str(root)+e))
        for e in [".js",".jsx",".ts",".tsx",".mjs",".cjs"]: cands.append(root/("index"+e))
    return next((p for p in cands if p.is_file()),None)

def imports(path,text):
    out=[]
    # import default, { named as alias }, * as ns
    for m in re.finditer(r'import\s+(.+?)\s+from\s+[\'"]([^\'"]+)[\'"]',text,re.S):
        clause=" ".join(m.group(1).split())
        spec=m.group(2)
        rp=resolve_rel(path,spec)
        out.append({"clause":clause,"spec":spec,"resolved":str(rp) if rp else None,"line":ln(text,m.start())})
    # lazy/dynamic imports
    for m in re.finditer(r'import\s*\(\s*[\'"]([^\'"]+)[\'"]\s*\)',text):
        spec=m.group(1); rp=resolve_rel(path,spec)
        out.append({"clause":"<dynamic>","spec":spec,"resolved":str(rp) if rp else None,"line":ln(text,m.start())})
    return out

def exports(path,text):
    out=[]
    pats=[
      r'export\s+default\s+([A-Za-z_$][\w$]*)',
      r'export\s*\{([^}]+)\}\s*from\s*[\'"]([^\'"]+)[\'"]',
      r'export\s*\{([^}]+)\}'
    ]
    for pat in pats:
        for m in re.finditer(pat,text,re.S):
            out.append({"match":" ".join(m.group(0).split()),"line":ln(text,m.start())})
    return out

def symbol_defs(files,name):
    out=[]
    patterns=[
      rf'\bfunction\s+{re.escape(name)}\s*\(',
      rf'\bclass\s+{re.escape(name)}\b',
      rf'\bconst\s+{re.escape(name)}\s*=',
      rf'\blet\s+{re.escape(name)}\s*=',
      rf'\bvar\s+{re.escape(name)}\s*=',
    ]
    for p,t in files.items():
        for pat in patterns:
            for m in re.finditer(pat,t):
                line=ln(t,m.start())
                out.append({"file":str(p),"line":line,"pattern":pat,**snip(t,line,10)})
    return out

def main():
    if len(sys.argv)!=2:
        print("usage: resolve_broker_destination.py <repo-root>",file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    src=app/"src"
    ev=app/"evidence/explorer4"/MILESTONE
    ev.mkdir(parents=True,exist_ok=True)

    paths=sorted(p for p in src.rglob("*") if p.is_file() and p.suffix in EXTS and "node_modules" not in p.parts)
    files={}
    for p in paths:
        try: files[p]=p.read_text(encoding="utf-8")
        except UnicodeDecodeError: files[p]=p.read_text(encoding="utf-8",errors="replace")

    broker=src/"components/SCIIPBrokerApp.jsx"
    bt=files.get(broker,"")
    broker_sha=sha(broker) if broker.exists() else None

    callsites=[]
    for p,t in files.items():
        for m in re.finditer(r'<BrokerDestination\b',t):
            line=ln(t,m.start())
            callsites.append({"file":str(p),"line":line,**snip(t,line,10)})

    defs=symbol_defs(files,"BrokerDestination")
    broker_imports=imports(broker,bt) if bt else []
    relevant_imports=[x for x in broker_imports if "BrokerDestination" in x["clause"]]

    alias_evidence=[]
    for p,t in files.items():
        for pat in [
          r'\bBrokerDestination\s*=\s*([A-Za-z_$][\w$]*)',
          r'\b([A-Za-z_$][\w$]*)\s*=\s*BrokerDestination\b',
          r'\{\s*BrokerDestination\s+as\s+([A-Za-z_$][\w$]*)',
          r'\{\s*([A-Za-z_$][\w$]*)\s+as\s+BrokerDestination'
        ]:
            for m in re.finditer(pat,t):
                line=ln(t,m.start())
                alias_evidence.append({"file":str(p),"line":line,"match":m.group(0),**snip(t,line,6)})

    route_evidence=[]
    route_files=set()
    route_patterns=[
      r'destination\s*===?\s*[\'"]Explorer[\'"]',
      r'destination\s*==\s*[\'"]Explorer[\'"]',
      r'\bExplorer\s*:\s*[A-Z][A-Za-z0-9_$]*',
      r'\[\s*[\'"]Explorer[\'"]\s*\]',
      r'case\s+[\'"]Explorer[\'"]',
      r'\bnav\s*===?\s*[\'"]Explorer[\'"]'
    ]
    for p,t in files.items():
        for pat in route_patterns:
            for m in re.finditer(pat,t):
                line=ln(t,m.start())
                route_evidence.append({"file":str(p),"line":line,"pattern":pat,**snip(t,line,10)})
                route_files.add(p)

    # Follow imports from known definition/callsite/route files and inspect potential Explorer-related symbols.
    seed=set(Path(x["file"]) for x in defs+callsites+route_evidence if Path(x["file"]).exists())
    for x in relevant_imports:
        if x["resolved"]: seed.add(Path(x["resolved"]))
    explorer_imports=[]
    for p in sorted(seed):
        t=files.get(p,"")
        for imp in imports(p,t):
            if ("Explorer" in imp["clause"] or "explorer" in imp["spec"].lower() or "property-command" in imp["spec"].lower()):
                explorer_imports.append({"fromFile":str(p),**imp})
                if imp["resolved"]: route_files.add(Path(imp["resolved"]))

    # Broad source evidence specifically around BrokerDestination token, regardless of syntax.
    token_hits=[]
    for p,t in files.items():
        for m in re.finditer(r'\bBrokerDestination\b',t):
            line=ln(t,m.start())
            token_hits.append({"file":str(p),"line":line,**snip(t,line,5)})

    # Determine resolution.
    resolved_candidates=set()
    for d in defs:
        resolved_candidates.add(d["file"])
    for i in relevant_imports:
        if i["resolved"]: resolved_candidates.add(i["resolved"])

    # An import can resolve to a re-export barrel; record its exports/imports.
    barrel_trace=[]
    for f in sorted(resolved_candidates):
        p=Path(f)
        t=files.get(p,"")
        if not t: continue
        barrel_trace.append({
          "file":f,
          "imports":imports(p,t),
          "exports":exports(p,t),
          "brokerDestinationTokenPresent":"BrokerDestination" in t
        })

    # Exact source likely unique if one local definition, or one import origin.
    if len(resolved_candidates)==1:
        status="DIAGNOSTIC_COMPLETE"
        diagnosis="BROKER_DESTINATION_ROUTE_RESOLVED"
    elif len(resolved_candidates)>1:
        status="DIAGNOSTIC_COMPLETE"
        diagnosis="BROKER_DESTINATION_ROUTE_MULTIPLE_CANDIDATES"
    elif token_hits:
        status="DIAGNOSTIC_COMPLETE"
        diagnosis="BROKER_DESTINATION_SYMBOL_PRESENT_NONSTANDARD_BINDING"
    else:
        status="BLOCKED_ROUTING_UNRESOLVED"
        diagnosis="BROKER_DESTINATION_SYMBOL_ABSENT"

    result={
      "framework":"SCIIP_EXPLORER_4_R4_R2_R1_BROKERDESTINATION_ROUTING_RESOLUTION",
      "version":"4.0-m4.19d4bn2-r7e-r4-r2-r1",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"DIAGNOSTIC_ONLY",
      "status":status,
      "diagnosis":diagnosis,
      "authority":{
        "applicationSourceMutation":False,
        "canonicalWriteAuthority":False,
        "identityWriteAuthority":False,
        "temporalWriteAuthority":False,
        "propagationAuthority":False,
        "networkAuthority":False
      },
      "broker":{"path":str(broker),"sha256":broker_sha,"expectedSha256":EXPECTED_BROKER_SHA,"expectedShaMatch":broker_sha==EXPECTED_BROKER_SHA},
      "brokerDestination":{
        "callsites":callsites,
        "definitions":defs,
        "brokerImports":relevant_imports,
        "aliases":alias_evidence,
        "tokenHits":token_hits,
        "resolvedCandidateFiles":sorted(resolved_candidates),
        "barrelTrace":barrel_trace
      },
      "explorerRouting":{
        "routeEvidence":route_evidence,
        "explorerImports":explorer_imports,
        "candidateRouteFiles":sorted(str(x) for x in route_files)
      }
    }

    relevant=set()
    for coll in [callsites,defs,alias_evidence,token_hits,route_evidence]:
        for x in coll:
            if x.get("file"): relevant.add(Path(x["file"]))
    for x in relevant_imports+explorer_imports:
        if x.get("resolved"): relevant.add(Path(x["resolved"]))
        if x.get("fromFile"): relevant.add(Path(x["fromFile"]))
    for f in resolved_candidates: relevant.add(Path(f))

    manifest=[]
    for p in sorted(relevant):
        if p.exists(): manifest.append({"path":str(p),"sha256":sha(p),"bytes":p.stat().st_size})

    (ev/"routing_resolution.json").write_text(json.dumps(result,indent=2)+"\n")
    (ev/"relevant_source_manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")

    lines=[
      f"status: {status}",
      f"diagnosis: {diagnosis}",
      f"brokerShaMatch: {result['broker']['expectedShaMatch']}",
      f"BrokerDestination callsites: {len(callsites)}",
      f"BrokerDestination definitions: {len(defs)}",
      f"BrokerDestination broker imports: {len(relevant_imports)}",
      f"BrokerDestination token hits: {len(token_hits)}",
      f"resolved candidate files: {len(resolved_candidates)}",
      *[f"  {x}" for x in sorted(resolved_candidates)],
      f"Explorer route evidence blocks: {len(route_evidence)}",
      f"Explorer-related imports from route seeds: {len(explorer_imports)}",
      "candidate route files:",
      *[f"  {x}" for x in sorted(str(x) for x in route_files)],
      f"EVIDENCE: {ev/'routing_resolution.json'}"
    ]
    (ev/"routing_resolution.txt").write_text("\n".join(lines)+"\n")

    print("============================================================")
    print("SCIIP Explorer 4.0 — R4-R2-R1 BrokerDestination Resolution")
    print("============================================================")
    print(f"Broker SHA match: {result['broker']['expectedShaMatch']}")
    print(f"BrokerDestination callsites: {len(callsites)}")
    print(f"BrokerDestination definitions: {len(defs)}")
    print(f"BrokerDestination broker imports: {len(relevant_imports)}")
    print(f"BrokerDestination token hits: {len(token_hits)}")
    print(f"Resolved candidate files: {len(resolved_candidates)}")
    for x in sorted(resolved_candidates): print(f"  - {x}")
    print(f"Explorer route evidence blocks: {len(route_evidence)}")
    print(f"Explorer-related route imports: {len(explorer_imports)}")
    print()
    print(f"STATUS: {status}")
    print(f"DIAGNOSIS: {diagnosis}")
    print(f"EVIDENCE: {ev/'routing_resolution.json'}")
    return 0 if status=="DIAGNOSTIC_COMPLETE" else 4

if __name__=="__main__":
    raise SystemExit(main())
