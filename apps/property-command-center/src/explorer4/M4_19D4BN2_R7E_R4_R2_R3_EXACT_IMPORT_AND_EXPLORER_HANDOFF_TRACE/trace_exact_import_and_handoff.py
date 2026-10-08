#!/usr/bin/env python3
import sys,re,json,hashlib
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN2_R7E_R4_R2_R3_EXACT_IMPORT_AND_EXPLORER_HANDOFF_TRACE"
EXPECTED_BROKER="eabdecbddacfd969524bfda6027d88a9d3b81df9458b1bda3f1dca61fa93e413"
EXTS=[".js",".jsx",".ts",".tsx",".mjs",".cjs"]

def sha(p):
 h=hashlib.sha256()
 with p.open("rb") as f:
  for b in iter(lambda:f.read(1048576),b""):h.update(b)
 return h.hexdigest()
def line(t,pos):return t.count("\n",0,pos)+1
def ctx(t,n,r=18):
 ls=t.splitlines();a=max(1,n-r);b=min(len(ls),n+r)
 return "\n".join(f"{i:5d}: {ls[i-1]}" for i in range(a,b+1))
def resolve(src,spec):
 if not spec.startswith("."):return None
 root=(src.parent/spec).resolve()
 cs=[root] if root.suffix else [Path(str(root)+e) for e in EXTS]+[root/("index"+e) for e in EXTS]
 return next((x for x in cs if x.is_file()),None)
def imps(p,t):
 out=[]
 # deliberately line-safe; source is minified-ish but imports terminate at semicolon
 for m in re.finditer(r'import\s+([^;]+?)\s+from\s*[\'"]([^\'"]+)[\'"]',t):
  spec=m.group(2);rp=resolve(p,spec)
  out.append({"clause":" ".join(m.group(1).split()),"spec":spec,"resolved":str(rp) if rp else None,"line":line(t,m.start())})
 return out

def main():
 repo=Path(sys.argv[1]).expanduser().resolve()
 app=repo/"apps/property-command-center";src=app/"src";ev=app/"evidence/explorer4"/M;ev.mkdir(parents=True,exist_ok=True)
 broker=src/"components/SCIIPBrokerApp.jsx"
 dest=src/"broker-product/BrokerDestination.jsx"
 if not broker.is_file() or not dest.is_file():
  print("BLOCKED: expected exact broker/destination files absent");return 4
 bt=broker.read_text(errors="replace");dt=dest.read_text(errors="replace")
 broker_import=[x for x in imps(broker,bt) if "BrokerDestination" in x["clause"]]
 print("============================================================")
 print("SCIIP Explorer 4.0 — R4-R2-R3 Exact Import + Handoff Trace")
 print("============================================================")
 print("Broker SHA match:",sha(broker)==EXPECTED_BROKER)
 print("Exact BrokerDestination path:",dest)
 print("BrokerDestination SHA256:",sha(dest))
 print("Broker import resolution:",broker_import)
 print("\n----- BrokerDestination.jsx FULL SOURCE -----")
 print(dt)

 route=[]
 for m in re.finditer(r'Explorer',dt):
  route.append({"line":line(dt,m.start()),"context":ctx(dt,line(dt,m.start()),12)})
 print("\n----- EXPLORER ROUTE EVIDENCE -----")
 for x in route:
  print("\n",x["context"])

 di=imps(dest,dt)
 print("\n----- BrokerDestination IMPORTS -----")
 for x in di: print(x)

 # Candidate mounted files are resolved imports referenced near Explorer route or Explorer-ish imports.
 mounted=[]
 for x in di:
  if x["resolved"] and ("explorer" in x["spec"].lower() or "property" in x["spec"].lower() or any(k in x["clause"] for k in ["Explorer","Property"])):
   mounted.append(Path(x["resolved"]))
 # Also extract JSX component names in contexts around Explorer and map to imports.
 names=set()
 for x in route:
  names.update(re.findall(r'<([A-Z][A-Za-z0-9_$]*)\b',x["context"]))
 for x in di:
  if x["resolved"] and any(n in x["clause"] for n in names): mounted.append(Path(x["resolved"]))
 mounted=list(dict.fromkeys(mounted))

 print("\n----- CANDIDATE MOUNTED EXPLORER FILES -----")
 for p in mounted: print(p)

 signals=[]
 terms=["sciip:global-property-search","sciip.globalSearchQuery","resolveGlobalPropertySearch","sessionStorage","addEventListener","candidate","searchResult","selectedProperty"]
 scan=set(mounted)
 # follow one import layer from mounted components
 for p in list(mounted):
  if p.is_file():
   t=p.read_text(errors="replace")
   for x in imps(p,t):
    if x["resolved"]: scan.add(Path(x["resolved"]))
 for p in sorted(scan):
  if not p.is_file():continue
  t=p.read_text(errors="replace")
  hits=[]
  for term in terms:
   for m in re.finditer(re.escape(term),t,re.I):
    hits.append({"term":term,"line":line(t,m.start()),"context":ctx(t,line(t,m.start()),8)})
  if hits:
   signals.append({"file":str(p),"sha256":sha(p),"hits":hits})
 print("\n----- HANDOFF / SEARCH SIGNALS -----")
 for s in signals:
  print("\n###",s["file"],s["sha256"])
  for h in s["hits"]:
   print(f"\n[{h['term']}] line {h['line']}\n{h['context']}")

 listener=any(any(h["term"]=="sciip:global-property-search" for h in s["hits"]) for s in signals)
 session=any(any(h["term"]=="sciip.globalSearchQuery" for h in s["hits"]) for s in signals)
 resolver=any(any(h["term"]=="resolveGlobalPropertySearch" for h in s["hits"]) for s in signals)

 if not route:
  diagnosis="BROKER_DESTINATION_EXPLORER_BRANCH_NOT_FOUND"
 elif not mounted:
  diagnosis="EXPLORER_BRANCH_FOUND_MOUNT_TARGET_UNRESOLVED"
 elif listener and session and resolver:
  diagnosis="EXPLORER_HANDOFF_COMPONENT_CHAIN_RESOLVED"
 elif listener and session:
  diagnosis="EXPLORER_HANDOFF_PRESENT_RESOLVER_BINDING_REQUIRES_NEXT_TRACE"
 elif session and not listener:
  diagnosis="SESSION_HANDOFF_PRESENT_GLOBAL_EVENT_LISTENER_ABSENT_IN_MOUNT_CHAIN"
 elif listener and not session:
  diagnosis="GLOBAL_EVENT_HANDOFF_PRESENT_SESSION_FALLBACK_ABSENT_IN_MOUNT_CHAIN"
 else:
  diagnosis="EXPLORER_MOUNT_RESOLVED_HANDOFF_NOT_BOUND_IN_SCANNED_CHAIN"

 result={"framework":"SCIIP_EXPLORER_4_R4_R2_R3_EXACT_IMPORT_AND_EXPLORER_HANDOFF_TRACE",
 "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"DIAGNOSTIC_COMPLETE","diagnosis":diagnosis,
 "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False},
 "broker":{"path":str(broker),"sha256":sha(broker),"expectedShaMatch":sha(broker)==EXPECTED_BROKER,"BrokerDestinationImport":broker_import},
 "brokerDestination":{"path":str(dest),"sha256":sha(dest),"imports":di,"explorerRouteEvidence":route},
 "mountedCandidates":[str(p) for p in mounted],"signals":signals}
 (ev/"exact_import_explorer_handoff_trace.json").write_text(json.dumps(result,indent=2)+"\n")
 print("\nSTATUS: DIAGNOSTIC_COMPLETE")
 print("DIAGNOSIS:",diagnosis)
 print("EVIDENCE:",ev/"exact_import_explorer_handoff_trace.json")
 return 0
if __name__=="__main__":raise SystemExit(main())
