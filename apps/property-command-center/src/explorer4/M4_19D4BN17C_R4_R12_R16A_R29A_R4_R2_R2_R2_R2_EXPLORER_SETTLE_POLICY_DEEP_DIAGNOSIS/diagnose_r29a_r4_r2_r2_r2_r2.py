#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import base64,hashlib,itertools,json,os,socket,struct,sys,time,urllib.parse,urllib.request

APP="http://127.0.0.1:5173"
CDP="http://127.0.0.1:9333"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R2_EXPLORER_SETTLE_POLICY_DEEP_DIAGNOSIS"

class WS:
 def __init__(self,url,timeout=5):
  u=urllib.parse.urlparse(url);self.s=socket.create_connection((u.hostname,u.port or 80),timeout=timeout);self.s.settimeout(timeout)
  key=base64.b64encode(os.urandom(16)).decode(); path=(u.path or "/")+(("?"+u.query) if u.query else "")
  req=f"GET {path} HTTP/1.1\r\nHost: {u.hostname}:{u.port or 80}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
  self.s.sendall(req.encode());b=b""
  while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
  if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("WS handshake failed")
 def exact(self,n):
  b=b""
  while len(b)<n:b+=self.s.recv(n-len(b))
  return b
 def send(self,x):
  p=x.encode();m=os.urandom(4);n=len(p)
  h=bytes([0x81,0x80|n]) if n<126 else bytes([0x81,0x80|126])+struct.pack("!H",n) if n<65536 else bytes([0x81,0x80|127])+struct.pack("!Q",n)
  self.s.sendall(h+m+bytes(v^m[i%4] for i,v in enumerate(p)))
 def recv(self):
  while 1:
   a,b=self.exact(2);op=a&15;n=b&127
   if n==126:n=struct.unpack("!H",self.exact(2))[0]
   elif n==127:n=struct.unpack("!Q",self.exact(8))[0]
   mask=self.exact(4) if b&128 else None;p=self.exact(n)
   if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
   if op==1:return p.decode()
   if op==8:raise RuntimeError("WS closed")
 def close(self):
  try:self.s.close()
  except:pass

def getj(url):
 with urllib.request.urlopen(url,timeout=3) as r:return json.loads(r.read())

def main():
 repo=Path(sys.argv[1]).expanduser().resolve()
 out=repo/"apps/property-command-center/evidence/explorer4"/OUT;out.mkdir(parents=True,exist_ok=True)
 ep=out/"explorer_settle_policy_deep_diagnosis.json"
 print("="*120);print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R2 Explorer Settle Policy Deep Diagnosis");print("="*120)
 print("Mode: READ_ONLY_RUNTIME_NAVIGATION_AND_SETTLE_CAUSAL_DIAGNOSIS")
 print("Application source mutation: OFF\nGoverned data mutation: OFF\nExplorer click: OFF\nProperty click: OFF\nAssignments invocation: OFF\nGenerate invocation: OFF\nExport invocation: OFF")
 try:
  # Critical distinction missed by R1-R1: HTTP reachability and CDP target existence are separate.
  http_status=None;http_body_len=None;http_error=None
  try:
   with urllib.request.urlopen(APP+"/",timeout=3) as r:
    body=r.read();http_status=r.status;http_body_len=len(body)
  except Exception as e:http_error=repr(e)
  tabs=getj(CDP+"/json")
  pages=[x for x in tabs if x.get("type")=="page" and x.get("webSocketDebuggerUrl")]
  target=next((x for x in pages if str(x.get("url","")).startswith(APP)),pages[0] if pages else None)
  if not target:raise RuntimeError("no CDP page target")
  w=WS(target["webSocketDebuggerUrl"]);seq=itertools.count(1)
  def call(method,params=None):
   i=next(seq);w.send(json.dumps({"id":i,"method":method,"params":params or {}}))
   while 1:
    m=json.loads(w.recv())
    if m.get("id")==i:return m
  call("Page.enable");call("Runtime.enable")
  before=call("Runtime.evaluate",{"expression":"({url:location.href,origin:location.origin,readyState:document.readyState,title:document.title})","returnByValue":True})["result"]["result"].get("value")
  nav=call("Page.navigate",{"url":APP+"/"})
  samples=[];start=time.monotonic()
  expr="""(()=>({url:location.href,origin:location.origin,readyState:document.readyState,title:document.title,body:(document.body?.innerText||'').slice(0,500),buttons:[...document.querySelectorAll('button')].map(b=>(b.innerText||b.textContent||'').trim()),explorer:[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').trim()==='Explorer').length}))()"""
  for t in [0,.1,.25,.5,1,2,3,5]:
   z=start+t-time.monotonic()
   if z>0:time.sleep(z)
   r=call("Runtime.evaluate",{"expression":expr,"returnByValue":True})
   samples.append({"t":t,**(r["result"]["result"].get("value") or {})})
  w.close()
 except Exception as e:
  print("STATUS: BLOCKED");print("REASON:",repr(e));return 4

 chrome_error=all(s.get("url")=="chrome-error://chromewebdata/" for s in samples[1:])
 app_reachable=(http_status is not None and 200<=http_status<400)
 nav_error_text=json.dumps(nav)
 print("HTTP_APP_STATUS:",http_status)
 print("HTTP_APP_BODY_BYTES:",http_body_len)
 print("HTTP_APP_ERROR:",http_error)
 print("CDP_TARGET_BEFORE_NAVIGATION:",json.dumps(before,sort_keys=True))
 print("PAGE_NAVIGATE_RESPONSE:",nav_error_text)
 print("CHROME_ERROR_PERSISTED:",chrome_error)
 print("APP_HTTP_REACHABLE:",app_reachable)
 print("\n----- POST-NAVIGATION SAMPLES -----")
 for s in samples:print(json.dumps(s,sort_keys=True))
 if not app_reachable and chrome_error:
  cls="SCIIP_APP_RUNTIME_NOT_REACHABLE_CDP_TARGET_STALE_CHROME_ERROR_NAVIGATION_CAUSE_CONFIRMED"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_SCIIP_APP_RUNTIME_REVALIDATION_AND_CDP_FRESH_PAGE_REATTACHMENT_BEFORE_SELECTOR_RECERTIFICATION"
 elif app_reachable and chrome_error:
  cls="SCIIP_APP_HTTP_REACHABLE_BUT_CDP_NAVIGATION_RESOLVES_CHROME_ERROR_TARGET_OR_NAVIGATION_PATH_CAUSE"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_FRESH_CDP_TARGET_CREATION_AND_NAVIGATION_REVALIDATION"
 else:
  cls="CHROME_ERROR_NOT_PERSISTENT_EXPLORER_SETTLE_LOGIC_REQUIRES_FRESH_SELECTOR_LEVEL_DIAGNOSIS"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_SELECTOR_SETTLE_STATE_MACHINE_DIAGNOSIS"
 checks={"httpReachabilityCaptured":True,"cdpTargetStateCaptured":True,"pageNavigateResponseCaptured":True,"chromeErrorPersistenceEvaluated":True,"navigationAndExplorerSettleSeparated":True,"noExplorerClickPerformed":True,"noPropertyClickPerformed":True,"assignmentsInvocationOff":True,"generateInvocationOff":True,"exportInvocationOff":True,"applicationMutationOff":True,"governedMutationOff":True}
 print("\n----- CHECKS -----")
 for k,v in checks.items():print(f"{k}: {v}")
 ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R2_EXPLORER_SETTLE_POLICY_DEEP_DIAGNOSIS","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED","state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R2_EXPLORER_SETTLE_POLICY_DEEP_CAUSE_DIAGNOSED","classification":cls,"http":{"status":http_status,"bodyBytes":http_body_len,"error":http_error},"cdpTargetBeforeNavigation":before,"pageNavigateResponse":nav,"samples":samples,"checks":checks,"nextMilestone":nxt}
 ep.write_text(json.dumps(ev,indent=2)+"\n")
 print("CLASSIFICATION:",cls);print("STATUS: PASSED");print("STATE:",ev["state"]);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ep)
 print("\nR29A-R4-R2-R2-R2-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
 return 0
if __name__=="__main__":raise SystemExit(main())
