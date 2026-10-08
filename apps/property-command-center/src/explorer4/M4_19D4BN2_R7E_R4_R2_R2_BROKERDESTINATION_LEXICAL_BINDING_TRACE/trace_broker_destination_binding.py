#!/usr/bin/env python3
from __future__ import annotations
import re, sys, json, hashlib
from pathlib import Path
from datetime import datetime, timezone

M="M4_19D4BN2_R7E_R4_R2_R2_BROKERDESTINATION_LEXICAL_BINDING_TRACE"
EXTS={".js",".jsx",".ts",".tsx",".mjs",".cjs"}
EXPECTED="eabdecbddacfd969524bfda6027d88a9d3b81df9458b1bda3f1dca61fa93e413"

def sha(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for b in iter(lambda:f.read(1<<20),b""): h.update(b)
    return h.hexdigest()

def line_of(t,pos): return t.count("\n",0,pos)+1

def context(t,line,r=25):
    ls=t.splitlines()
    a=max(1,line-r); b=min(len(ls),line+r)
    return {"startLine":a,"endLine":b,"text":"\n".join(f"{i:5d}: {ls[i-1]}" for i in range(a,b+1))}

def resolve_import(src,spec):
    if not spec.startswith("."): return None
    root=(src.parent/spec).resolve()
    cs=[]
    if root.suffix: cs.append(root)
    else:
        for e in [".js",".jsx",".ts",".tsx",".mjs",".cjs"]: cs.append(Path(str(root)+e))
        for e in [".js",".jsx",".ts",".tsx",".mjs",".cjs"]: cs.append(root/("index"+e))
    return next((p for p in cs if p.is_file()),None)

def main():
    if len(sys.argv)!=2: return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    src=app/"src"
    ev=app/"evidence/explorer4"/M
    ev.mkdir(parents=True,exist_ok=True)

    paths=sorted(p for p in src.rglob("*") if p.is_file() and p.suffix in EXTS and "node_modules" not in p.parts)
    files={}
    for p in paths:
        try: files[p]=p.read_text()
        except: files[p]=p.read_text(errors="replace")

    broker=src/"components/SCIIPBrokerApp.jsx"
    bt=files.get(broker,"")
    bsha=sha(broker) if broker.exists() else None

    hits=[]
    for p,t in files.items():
        for m in re.finditer(r'\bBrokerDestination\b',t):
            ln=line_of(t,m.start())
            hits.append({"file":str(p),"line":ln,"index":m.start(),**context(t,ln,30)})

    callsites=[h for h in hits if "<BrokerDestination" in h["text"]]

    patterns = {
      "functionParameter": re.compile(r'function\s+[A-Za-z_$][\w$]*\s*\([^)]*\bBrokerDestination\b[^)]*\)',re.S),
      "arrowParameter": re.compile(r'(?:\([^)]*\bBrokerDestination\b[^)]*\)|\bBrokerDestination\b)\s*=>',re.S),
      "destructuredParameter": re.compile(r'\(\s*\{[^}]*\bBrokerDestination\b[^}]*\}\s*\)\s*=>',re.S),
      "objectDestructure": re.compile(r'(?:const|let|var)\s*\{[^}]*\bBrokerDestination\b[^}]*\}\s*=',re.S),
      "assignment": re.compile(r'\bBrokerDestination\s*=\s*[^=]'),
      "propertyAssignment": re.compile(r'\bBrokerDestination\s*:\s*[^,\n}]+'),
      "aliasToBrokerDestination": re.compile(r'\b[A-Za-z_$][\w$]*\s*=\s*BrokerDestination\b'),
      "memberAccess": re.compile(r'\.[ \t]*BrokerDestination\b'),
      "bracketAccess": re.compile(r'\[\s*[\'"]BrokerDestination[\'"]\s*\]'),
      "jsxCall": re.compile(r'<BrokerDestination\b'),
      "callbackArgument": re.compile(r'\([^)]*\bBrokerDestination\b[^)]*\)\s*[;,{]?',re.S),
    }

    bindings=[]
    for p,t in files.items():
        for kind,pat in patterns.items():
            for m in pat.finditer(t):
                ln=line_of(t,m.start())
                bindings.append({"kind":kind,"file":str(p),"line":ln,"match":" ".join(m.group(0).split())[:500],**context(t,ln,12)})

    # Locate enclosing function-ish region for each callsite by walking backward.
    enclosing=[]
    for c in callsites:
        p=Path(c["file"]); t=files[p]; pos=c["index"]
        prior=t[:pos]
        candidates=[]
        for pat,label in [
            (re.compile(r'function\s+([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{',re.S),"function"),
            (re.compile(r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{',re.S),"arrow"),
            (re.compile(r'(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*function\s*\([^)]*\)\s*\{',re.S),"functionExpr"),
        ]:
            for m in pat.finditer(prior):
                candidates.append((m.start(),label,m.group(1),m.group(0)))
        candidates.sort()
        if candidates:
            st,label,name,sig=candidates[-1]
            l=line_of(t,st)
            enclosing.append({"file":str(p),"line":l,"kind":label,"name":name,"signature":" ".join(sig.split()),**context(t,l,35)})

    # Imports for files containing token hits/callsites.
    imports=[]
    seed={Path(h["file"]) for h in hits}
    for p in seed:
        t=files[p]
        for m in re.finditer(r'import\s+(.+?)\s+from\s+[\'"]([^\'"]+)[\'"]',t,re.S):
            clause=" ".join(m.group(1).split()); spec=m.group(2); rp=resolve_import(p,spec)
            imports.append({"fromFile":str(p),"line":line_of(t,m.start()),"clause":clause,"spec":spec,"resolved":str(rp) if rp else None})

    # Classify based on strongest explicit lexical evidence.
    lexical=[b for b in bindings if b["kind"] in {
        "functionParameter","arrowParameter","destructuredParameter","objectDestructure",
        "assignment","propertyAssignment","aliasToBrokerDestination","memberAccess","bracketAccess"
    }]
    if lexical:
        status="DIAGNOSTIC_COMPLETE"
        diagnosis="BROKER_DESTINATION_LEXICAL_BINDING_IDENTIFIED"
    elif enclosing:
        status="DIAGNOSTIC_COMPLETE"
        diagnosis="BROKER_DESTINATION_ENCLOSING_SCOPE_IDENTIFIED_BINDING_STILL_INDIRECT"
    else:
        status="BLOCKED_BINDING_UNRESOLVED"
        diagnosis="BROKER_DESTINATION_BINDING_NOT_RESOLVED"

    result={
      "framework":"SCIIP_EXPLORER_4_R4_R2_R2_BROKERDESTINATION_LEXICAL_BINDING_TRACE",
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
      "broker":{"path":str(broker),"sha256":bsha,"expectedSha256":EXPECTED,"expectedShaMatch":bsha==EXPECTED},
      "tokenHits":hits,
      "callsites":callsites,
      "bindingEvidence":bindings,
      "enclosingScopes":enclosing,
      "importsFromTokenFiles":imports
    }
    (ev/"lexical_binding_trace.json").write_text(json.dumps(result,indent=2)+"\n")
    manifest=[]
    for p in sorted(seed):
        manifest.append({"path":str(p),"sha256":sha(p),"bytes":p.stat().st_size})
    (ev/"relevant_source_manifest.json").write_text(json.dumps(manifest,indent=2)+"\n")

    print("============================================================")
    print("SCIIP Explorer 4.0 — R4-R2-R2 Lexical Binding Trace")
    print("============================================================")
    print(f"Broker SHA match: {bsha==EXPECTED}")
    print(f"BrokerDestination token hits: {len(hits)}")
    print(f"JSX callsites: {len(callsites)}")
    print(f"Binding evidence matches: {len(bindings)}")
    print(f"Enclosing scopes resolved: {len(enclosing)}")
    print()
    print("----- EXACT BrokerDestination TOKEN CONTEXT -----")
    for i,h in enumerate(hits,1):
        print(f"\n### HIT {i}: {h['file']}:{h['line']}")
        print(h["text"])
    print()
    print("----- BINDING EVIDENCE -----")
    for i,b in enumerate(bindings,1):
        print(f"\n### BINDING {i}: {b['kind']} {b['file']}:{b['line']}")
        print(f"MATCH: {b['match']}")
        print(b["text"])
    print()
    print("----- ENCLOSING CALLSITE SCOPE -----")
    for e in enclosing:
        print(f"\n### {e['kind']} {e['name']} @ {e['file']}:{e['line']}")
        print(f"SIGNATURE: {e['signature']}")
        print(e["text"])
    print()
    print("----- IMPORTS FROM TOKEN FILES -----")
    for i in imports:
        print(f"{i['fromFile']}:{i['line']} :: {i['clause']} FROM {i['spec']} -> {i['resolved']}")
    print()
    print(f"STATUS: {status}")
    print(f"DIAGNOSIS: {diagnosis}")
    print(f"EVIDENCE: {ev/'lexical_binding_trace.json'}")
    return 0 if status=="DIAGNOSTIC_COMPLETE" else 4

if __name__=="__main__":
    raise SystemExit(main())
