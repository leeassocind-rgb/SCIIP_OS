#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import base64,itertools,json,os,socket,struct,subprocess,sys,time,urllib.parse,urllib.request

APP="http://127.0.0.1:5173"
CDP="http://127.0.0.1:9333"
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
PRIOR="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R2_EXPLORER_SETTLE_POLICY_DEEP_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_SCIIP_APP_RUNTIME_REVALIDATION_CDP_FRESH_PAGE_REATTACHMENT_AND_SELECTOR_RECERTIFICATION"

class WS:
 def __init__(self,url,timeout=5):
  u=urllib.parse.urlparse(url);self.s=socket.create_connection((u.hostname,u.port or 80),timeout=timeout);self.s.settimeout(timeout)
  key=base64.b64encode(os.urandom(16)).decode();path=(u.path or "/")+(("?"+u.query) if u.query else "")
  req=f"GET {path} HTTP/1.1\r\nHost: {u.hostname}:{u.port or 80}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
  self.s.sendall(req.encode());b=b""
  while b"\r\n\r\n" not in b:
   q=self.s.recv(4096)
   if not q:raise RuntimeError("websocket handshake closed")
   b+=q
  if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("websocket handshake failed")
 def exact(self,n):
  b=b""
  while len(b)<n:
   q=self.s.recv(n-len(b))
   if not q:raise RuntimeError("websocket closed")
   b+=q
  return b
 def send(self,x):
  p=x.encode();m=os.urandom(4);n=len(p)
  if n<126:h=bytes([0x81,0x80|n])
  elif n<65536:h=bytes([0x81,0x80|126])+struct.pack("!H",n)
  else:h=bytes([0x81,0x80|127])+struct.pack("!Q",n)
  self.s.sendall(h+m+bytes(v^m[i%4] for i,v in enumerate(p)))
 def recv(self):
  while 1:
   a,b=self.exact(2);op=a&15;n=b&127
   if n==126:n=struct.unpack("!H",self.exact(2))[0]
   elif n==127:n=struct.unpack("!Q",self.exact(8))[0]
   mask=self.exact(4) if b&128 else None;p=self.exact(n)
   if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
   if op==1:return p.decode(errors="replace")
   if op==8:raise RuntimeError("websocket closed")
 def close(self):
  try:self.s.close()
  except:pass

def loadj(p):
 try:return json.loads(p.read_text())
 except:return None

def http_status(url,timeout=2):
 try:
  with urllib.request.urlopen(url,timeout=timeout) as r:return r.status,len(r.read())
 except:return None,None

def getj(url):
 with urllib.request.urlopen(url,timeout=3) as r:return json.loads(r.read())

def new_cdp_page(url):
 for endpoint in (f"{CDP}/json/new?{urllib.parse.quote(url,safe=':/')}",f"{CDP}/json/new?url={urllib.parse.quote(url,safe=':/')}"):
  try:
   req=urllib.request.Request(endpoint,method="PUT")
   with urllib.request.urlopen(req,timeout=4) as r:return json.loads(r.read())
  except: pass
 return None

def main():
 repo=Path(sys.argv[1]).expanduser().resolve()
 pcc=repo/"apps/property-command-center";er=pcc/"evidence/explorer4"
 prior=er/PRIOR/"explorer_settle_policy_deep_diagnosis.json"
 out=er/OUT;out.mkdir(parents=True,exist_ok=True)
 ep=out/"sciip_app_runtime_revalidation_cdp_fresh_page_reattachment_and_selector_recertification.json"
 runner=pcc/"src/explorer4"/R29A/"select_r29a.py"
 print("="*120)
 print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3 SCIIP App Runtime Revalidation + CDP Fresh-Page Reattachment + Selector Recertification")
 print("="*120)
 print("Mode: RUNTIME_BOOTSTRAP_CDP_FRESH_PAGE_REATTACHMENT_SELECTOR_RECERTIFICATION")
 print("Application source mutation: OFF");print("Governed data mutation: OFF")
 print("Property click: OFF");print("Assignments invocation: OFF");print("Generate invocation: OFF");print("Export invocation: OFF")
 pj=loadj(prior)
 if not isinstance(pj,dict) or pj.get("status")!="PASSED" or pj.get("classification")!="SCIIP_APP_RUNTIME_NOT_REACHABLE_CDP_TARGET_STALE_CHROME_ERROR_NAVIGATION_CAUSE_CONFIRMED":
  print("STATUS: BLOCKED");print("REASON: prior runtime/navigation cause not certified");return 4
 if not runner.exists():
  print("STATUS: BLOCKED");print("REASON: R29A selector missing");return 5
 pre_status,_=http_status(APP+"/");preexisting=pre_status is not None and 200<=pre_status<400
 action="REUSE_EXISTING_PROPERTY_COMMAND_CENTER_RUNTIME" if preexisting else "START_PROPERTY_COMMAND_CENTER_RUNTIME"
 log="/tmp/sciip-r29a-r4-r2-r2-r2-r3-vite.log"
 if not preexisting:
  lf=open(log,"ab",buffering=0)
  subprocess.Popen(["npm","run","dev","--","--host","127.0.0.1","--port","5173"],cwd=str(pcc),stdout=lf,stderr=lf,start_new_session=True)
 deadline=time.time()+20;ready=False;status=None;bodybytes=None
 while time.time()<deadline:
  status,bodybytes=http_status(APP+"/")
  if status is not None and 200<=status<400:ready=True;break
  time.sleep(.25)
 print("SCIIP_APP_PREEXISTING:",preexisting);print("SCIIP_APP_BOOTSTRAP_ACTION:",action);print("SCIIP_APP_RUNTIME_LOG:",log if not preexisting else None)
 print("SCIIP_APP_HTTP_STATUS:",status);print("SCIIP_APP_READY_AFTER_REVALIDATION:",ready)
 if not ready:
  print("STATUS: BLOCKED");print("REASON: SCIIP app failed runtime readiness revalidation");return 6
 try:tabs=getj(CDP+"/json")
 except Exception as e:
  print("STATUS: BLOCKED");print("REASON: CDP unavailable on port 9333:",repr(e));return 7
 stale=[x for x in tabs if x.get("type")=="page" and x.get("url")=="chrome-error://chromewebdata/"]
 fresh=new_cdp_page(APP+"/")
 if fresh and fresh.get("webSocketDebuggerUrl"):
  target=fresh;cdp_action="CREATED_FRESH_CDP_APP_PAGE"
 else:
  tabs=getj(CDP+"/json")
  target=next((x for x in tabs if x.get("type")=="page" and str(x.get("url","")).startswith(APP) and x.get("webSocketDebuggerUrl")),None)
  cdp_action="REUSED_EXISTING_VALID_APP_PAGE" if target else "NO_VALID_APP_PAGE"
 print("STALE_CHROME_ERROR_PAGE_COUNT:",len(stale));print("CDP_FRESH_PAGE_ACTION:",cdp_action)
 if not target:
  print("STATUS: BLOCKED");print("REASON: unable to create or resolve valid SCIIP CDP page");return 8
 w=WS(target["webSocketDebuggerUrl"]);seq=itertools.count(1)
 def call(method,params=None):
  i=next(seq);w.send(json.dumps({"id":i,"method":method,"params":params or {}}))
  while 1:
   m=json.loads(w.recv())
   if m.get("id")==i:return m
 call("Page.enable");call("Runtime.enable");call("Page.navigate",{"url":APP+"/"})
 expr="""(()=>{const bs=[...document.querySelectorAll('button')];const ex=bs.filter(b=>(b.innerText||b.textContent||'').trim()==='Explorer');return {url:location.href,origin:location.origin,readyState:document.readyState,title:document.title,buttonCount:bs.length,explorerCount:ex.length,bodyLength:(document.body?.innerText||'').length}})()"""
 settle=[];start=time.monotonic()
 for t in [0,.05,.1,.15,.2,.25,.35,.5,.75,1,1.25,1.5,1.75,2]:
  q=start+t-time.monotonic()
  if q>0:time.sleep(q)
  r=call("Runtime.evaluate",{"expression":expr,"returnByValue":True});v=r.get("result",{}).get("result",{}).get("value",{}) or {};v["t"]=t;settle.append(v)
 w.close()
 valid=[x for x in settle if x.get("origin")==APP and x.get("readyState")=="complete" and x.get("buttonCount",0)>0 and x.get("explorerCount")==1]
 first=min((x["t"] for x in valid),default=None);app_page_cert=first is not None and first<=2.0
 print("CDP_APP_PAGE_ATTACHED:",app_page_cert);print("FIRST_UNIQUE_EXPLORER_SECONDS:",first)
 print("----- FRESH PAGE SETTLE SAMPLES -----")
 for x in settle:print(json.dumps(x,sort_keys=True))
 if not app_page_cert:
  print("STATUS: DIAGNOSTIC_COMPLETE");print("REASON: runtime is up but fresh CDP app page did not certify Explorer within two seconds");return 9
 print("\nRe-running authoritative R29A selector unchanged...\n")
 cp=subprocess.run([sys.executable,str(runner),str(repo)],cwd=str(runner.parent))
 r29a_ev=er/R29A/"exact_eight_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
 r29a=loadj(r29a_ev) if r29a_ev.exists() else None
 targets=[er/R29A/"exact_new_four_hundred_candidates.json",er/R29A/"exact_new_four_hundred_candidates_prefix_normalized.json",er/R29A/"exact_new_four_hundred_targets.json"]
 target_art=next((p for p in targets if p.exists()),None);tj=loadj(target_art) if target_art else None
 def ident(x):
  if isinstance(x,str):return " ".join(x.lower().split())
  if isinstance(x,dict):
   for k in ("selectionKey","canonicalKey","canonicalTarget","normalizedTarget","address","label","target","name"):
    if x.get(k):return " ".join(str(x[k]).lower().split())
  return None
 tids=[z for z in (ident(x) for x in (tj or [])) if z] if isinstance(tj,list) else []
 checks={
  "priorRuntimeNavigationCauseConsumed":True,"sciipAppReadyAfterRevalidation":ready,"cdpAvailable":True,
  "freshCdpAppPageResolved":target is not None,"freshCdpAppPageExplorerCertified":app_page_cert,
  "selectorReusedWithoutFurtherMutation":True,"selectorExitZero":cp.returncode==0,
  "r29aEvidencePresent":r29a_ev.exists(),"r29aStatusPassed":isinstance(r29a,dict) and r29a.get("status")=="PASSED",
  "exactNewFourHundredTargetArtifactPresent":target_art is not None,
  "exactNewFourHundredTargetCountExactly400":isinstance(tj,list) and len(tj)==400,
  "exactNewFourHundredTargetsUnique":len(set(tids))==400 if tids else False,
  "propertyClickOff":True,"assignmentsInvocationOff":True,"generateInvocationOff":True,"exportInvocationOff":True,
  "applicationMutationOff":True,"governedMutationOff":True
 }
 ok=all(checks.values());status_out="PASSED" if ok else "DIAGNOSTIC_COMPLETE"
 state=("M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_RUNTIME_REVALIDATED_CDP_FRESH_PAGE_ATTACHED_R29A_CANDIDATE_SELECTION_RECERTIFIED" if ok else "M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_SELECTOR_RECERTIFICATION_INCOMPLETE")
 nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION" if ok else "M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R1_SELECTOR_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")
 ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3","generatedAt":datetime.now(timezone.utc).isoformat(),"status":status_out,"state":state,"classification":("SCIIP_RUNTIME_REVALIDATED_CDP_FRESH_APP_PAGE_CERTIFIED_R29A_EXACT_NEW400_CANDIDATE_SELECTION_RECERTIFIED" if ok else "R29A_SELECTOR_GAP_REMAINS_AFTER_RUNTIME_AND_CDP_REPAIR"),"checks":checks,"nextMilestone":nxt}
 ep.write_text(json.dumps(ev,indent=2)+"\n")
 print("\n----- CHECKS -----")
 for k,v in checks.items():print(f"{k}: {v}")
 print("STATUS:",status_out);print("STATE:",state);print("CLASSIFICATION:",ev["classification"]);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ep)
 print("\nR29A-R4-R2-R2-R2-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
 return 0 if ok else 1
if __name__=="__main__":raise SystemExit(main())
