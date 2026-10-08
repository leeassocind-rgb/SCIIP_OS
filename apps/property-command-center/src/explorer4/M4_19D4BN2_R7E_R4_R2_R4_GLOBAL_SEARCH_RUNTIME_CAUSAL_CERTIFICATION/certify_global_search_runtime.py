#!/usr/bin/env python3
import sys,re,json,hashlib
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN2_R7E_R4_R2_R4_GLOBAL_SEARCH_RUNTIME_CAUSAL_CERTIFICATION"
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def relresolve(src,spec):
 p=(src.parent/spec).resolve()
 candidates=[p,Path(str(p)+".jsx"),Path(str(p)+".js"),Path(str(p)+".tsx"),Path(str(p)+".ts"),p/"index.jsx",p/"index.js"]
 return next((x for x in candidates if x.is_file()),None)
def imports(p,t):
 out=[]
 for m in re.finditer(r'import\s+([^;]+?)\s+from\s*[\'"]([^\'"]+)[\'"]',t):
  out.append((m.group(1).strip(),m.group(2),relresolve(p,m.group(2)) if m.group(2).startswith(".") else None))
 return out
def snippet(t,needle,r=6):
 i=t.find(needle)
 if i<0:return None
 ls=t.splitlines();n=t[:i].count("\n")+1;a=max(1,n-r);b=min(len(ls),n+r)
 return {"line":n,"text":"\n".join(f"{j:5d}: {ls[j-1]}" for j in range(a,b+1))}
def main():
 repo=Path(sys.argv[1]).expanduser().resolve()
 app=repo/"apps/property-command-center"; src=app/"src"
 ev=app/"evidence/explorer4"/M;ev.mkdir(parents=True,exist_ok=True)
 broker=src/"components/SCIIPBrokerApp.jsx"
 dest=src/"broker-product/BrokerDestination.jsx"
 prop=src/"broker-product/property-explorer/PropertyExplorer.jsx"
 for p in [broker,dest,prop]:
  if not p.is_file(): print("BLOCKED missing",p);return 4
 pt=prop.read_text(errors="replace")
 pi=imports(prop,pt)
 explorer=None
 for clause,spec,res in pi:
  if res and ("Explorer3" in clause or "explorer3" in spec.lower()): explorer=res;break
 if explorer is None:
  # print source so next trace is grounded
  print("----- PropertyExplorer.jsx -----");print(pt)
  print("STATUS: BLOCKED_EXPLORER3_IMPORT_UNRESOLVED");return 5
 et=explorer.read_text(errors="replace");bt=broker.read_text(errors="replace")
 checks={
 "brokerPersistsQuery":"sessionStorage.setItem('sciip.globalSearchQuery',query)" in bt or 'sessionStorage.setItem("sciip.globalSearchQuery",query)' in bt,
 "brokerNavigatesExplorer":"setNav('Explorer')" in bt or 'setNav("Explorer")' in bt,
 "brokerDispatchesEvent":"sciip:global-property-search" in bt and "dispatchEvent" in bt,
 "resolverDefined":"function resolveGlobalPropertySearch" in et,
 "listenerBound":"addEventListener('sciip:global-property-search'" in et or 'addEventListener("sciip:global-property-search"' in et,
 "pendingSessionRead":"sessionStorage.getItem('sciip.globalSearchQuery')" in et or 'sessionStorage.getItem("sciip.globalSearchQuery")' in et,
 "pendingDeferredExecution":"requestAnimationFrame(()=>execute(pending))" in et,
 "matchSelectsProperty":"selectProperty(resolution.property.id)" in et,
 "matchFocusesProperty":"setFocusPropertyId(resolution.property.id)" in et,
 "matchAdvancesFocusKey":"setFocusRequestKey(key=>key+1)" in et,
 "matchClearsSession":"sessionStorage.removeItem('sciip.globalSearchQuery')" in et or 'sessionStorage.removeItem("sciip.globalSearchQuery")' in et,
 "nonMatchFeedback":"setGlobalSearchFeedback({status:resolution.status" in et,
 "noMatchUI":"globalSearchFeedback?.status==='NO_MATCH'" in et,
 "ambiguousUI":"globalSearchFeedback?.status==='AMBIGUOUS'" in et,
 "mapConsumesFocus":"focusPropertyId={focusPropertyId}" in et and "focusRequestKey={focusRequestKey}" in et,
 }
 print("============================================================")
 print("SCIIP Explorer 4.0 — R4-R2-R4 Runtime Causal Certification")
 print("============================================================")
 print("PropertyExplorer:",prop)
 print("Explorer runtime:",explorer)
 print("Explorer SHA256:",sha(explorer))
 print("\n----- CAUSAL CONTRACT -----")
 for k,v in checks.items():print(f"{k}: {v}")
 print("\n----- PROPERTY EXPLORER ROUTE -----")
 print(pt)
 print("\n----- CRITICAL SOURCE WINDOWS -----")
 for needle in ["function resolveGlobalPropertySearch","const execute=query=>","addEventListener('sciip:global-property-search'","const searchResults=","<ExplorerMap"]:
  s=snippet(et,needle)
  if s: print(f"\n### {needle} @ {s['line']}\n{s['text']}")
 passed=all(checks.values())
 diagnosis="GLOBAL_SEARCH_RUNTIME_CAUSAL_CONTRACT_CERTIFIED" if passed else "GLOBAL_SEARCH_RUNTIME_CAUSAL_CONTRACT_INCOMPLETE"
 result={"framework":"SCIIP_EXPLORER_4_R4_R2_R4_GLOBAL_SEARCH_RUNTIME_CAUSAL_CERTIFICATION",
 "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "BLOCKED",
 "diagnosis":diagnosis,"authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False},
 "route":{"broker":str(broker),"brokerDestination":str(dest),"propertyExplorer":str(prop),"explorerRuntime":str(explorer)},
 "sha256":{"broker":sha(broker),"brokerDestination":sha(dest),"propertyExplorer":sha(prop),"explorerRuntime":sha(explorer)},
 "checks":checks}
 (ev/"global_search_runtime_causal_certification.json").write_text(json.dumps(result,indent=2)+"\n")
 print("\nSTATUS:",result["status"]);print("DIAGNOSIS:",diagnosis);print("EVIDENCE:",ev/"global_search_runtime_causal_certification.json")
 return 0 if passed else 6
if __name__=="__main__": raise SystemExit(main())
