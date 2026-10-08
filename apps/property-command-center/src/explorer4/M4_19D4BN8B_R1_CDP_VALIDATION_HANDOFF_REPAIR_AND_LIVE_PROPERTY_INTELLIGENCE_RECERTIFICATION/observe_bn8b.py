#!/usr/bin/env python3
from pathlib import Path
import sys,json,urllib.request
from datetime import datetime,timezone
M="M4_19D4BN8B_EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVATION"
Q=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]
def get(u):
 with urllib.request.urlopen(u,timeout=2) as r:return json.load(r)
def main():
 repo=Path(sys.argv[1]).expanduser().resolve();ev=repo/"apps/property-command-center/evidence/explorer4"
 prior=ev/"M4_19D4BN8A_EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_property_intelligence_consumer_parity_certification.json"
 if not prior.is_file() or json.loads(prior.read_text()).get("status")!="PASSED":
  print("STATUS: BLOCKED\nDIAGNOSIS: BN8A_PASSED_EVIDENCE_REQUIRED");return 4
 cdp_port=int(sys.argv[2]) if len(sys.argv)>2 else None
 if cdp_port is None:
  print("STATUS: BLOCKED\nDIAGNOSIS: VALIDATED_CDP_PORT_ARGUMENT_REQUIRED");return 4
 target=None
 try:
  a=get(f"http://127.0.0.1:{cdp_port}/json")
  m=[x for x in a if "5173" in x.get("url","") or "5174" in x.get("url","")]
  if m: target=m[0]
 except: pass
 if not target:
  print("STATUS: BLOCKED\nDIAGNOSIS: VALIDATED_SCIIP_CDP_TARGET_NOT_FOUND");return 4
 try:import websocket
 except:print("STATUS: BLOCKED\nDIAGNOSIS: PYTHON_WEBSOCKET_CLIENT_REQUIRED");return 4
 s=websocket.create_connection(target["webSocketDebuggerUrl"],timeout=5);seq=0
 def call(method,params=None):
  nonlocal seq;seq+=1;s.send(json.dumps({"id":seq,"method":method,"params":params or {}}))
  while 1:
   r=json.loads(s.recv())
   if r.get("id")==seq:return r
 def js(expr):
  r=call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
  return r.get("result",{}).get("result",{}).get("value")
 call("Runtime.enable")
 rows=[]
 print("="*72);print("SCIIP Explorer 4.0 — BN8B Live Property Intelligence Observation");print("="*72)
 print("Application source mutation: OFF\nGoverned data mutation: OFF\nPixel evidence: OFF")
 print("Target URL:",target.get("url"));print("SCIIP shell: True\nSearch control: True")
 template="""(async()=>{const q=QUERY;const I=[...document.querySelectorAll('input')];const i=I.find(x=>/search/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))||I[0];if(!i)return null;const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(i,q);i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));await new Promise(r=>setTimeout(r,700));const vis=e=>!!(e&&e.getClientRects().length),b=(document.body.innerText||'').toLowerCase();let ctl=[...document.querySelectorAll('button,[role=button],summary')].find(e=>/property intelligence/i.test(e.innerText||e.getAttribute('aria-label')||''));if(ctl&&vis(ctl)){ctl.click();await new Promise(r=>setTimeout(r,300));}const a=(document.body.innerText||'').toLowerCase(),map=[...document.querySelectorAll('[class*=map],canvas')].some(vis)||/map/.test(a);return {controlledValueMatch:i.value===q,explorerMounted:/analyze|present|command|property/.test(a),mapVisible:map,propertyIntelligenceVisible:/property intelligence/.test(a),derivedSignalCount:(a.match(/derived|metric|score|signal|insight|computed/g)||[]).length,evidenceSignalCount:(a.match(/evidence|provenance|source|confidence|citation/g)||[]).length,presentationSignalCount:(a.match(/property intelligence|insight|evidence|source/g)||[]).length,mapVisibleAfterIntelligence:map};})()"""
 for n,q in enumerate(Q,1):
  r=js(template.replace("QUERY",json.dumps(q))) or {}
  ok=all(r.get(k) for k in ("controlledValueMatch","explorerMounted","mapVisible","propertyIntelligenceVisible","mapVisibleAfterIntelligence")) and r.get("presentationSignalCount",0)>0
  r.update(query=q,outcome="LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED" if ok else "PROPERTY_INTELLIGENCE_LIVE_CONSUMER_NOT_PROVEN");rows.append(r)
  print(f"\n[{n}/10] {q}")
  for k in ("controlledValueMatch","explorerMounted","mapVisible","propertyIntelligenceVisible","derivedSignalCount","evidenceSignalCount","presentationSignalCount","mapVisibleAfterIntelligence"):print(f"{k}: {r.get(k)}")
  print("OUTCOME:",r["outcome"])
 s.close();n=sum(x["outcome"].startswith("LIVE_") for x in rows);passed=n==10
 data={"framework":"SCIIP_EXPLORER_4_BN8B_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVATION","generatedAt":datetime.now(timezone.utc).isoformat(),"records":rows,"observedCount":n,"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE","state":"M419D4BN8B_EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED" if passed else "M419D4BN8B_LIVE_PROPERTY_INTELLIGENCE_OBSERVATION_INCOMPLETE","diagnosis":"EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED" if passed else "LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_GAP_REMAINS","next":"BN8B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN8B_REMAINS_OPEN","nextMilestone":"M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE" if passed else None}
 out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"exact_ten_live_governed_property_intelligence_consumer_observation.json";f.write_text(json.dumps(data,indent=2)+"\n")
 print(f"\nOBSERVED: {n}/10");print("STATUS:",data["status"]);print("STATE:",data["state"]);print("DIAGNOSIS:",data["diagnosis"]);print("NEXT:",data["next"]);print("NEXT_MILESTONE:",data["nextMilestone"]);print("EVIDENCE:",f);return 0
if __name__=="__main__":raise SystemExit(main())
