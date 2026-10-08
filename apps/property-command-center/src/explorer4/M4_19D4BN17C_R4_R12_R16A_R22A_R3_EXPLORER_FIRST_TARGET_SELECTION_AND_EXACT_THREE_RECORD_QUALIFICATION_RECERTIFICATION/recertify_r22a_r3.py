#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time
M="M4_19D4BN17C_R4_R12_R16A_R22A_R3_EXPLORER_FIRST_TARGET_SELECTION_AND_EXACT_THREE_RECORD_QUALIFICATION_RECERTIFICATION"
R2="M4_19D4BN17C_R4_R12_R16A_R22A_R2_EXPORT_TARGET_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
TARGETS=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]
def loadj(p):return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def get(u):
 try:
  with urllib.request.urlopen(u,timeout=3) as r:return r.read().decode("utf8","ignore")
 except:return None
def pages():
 try:return json.loads(get("http://127.0.0.1:9333/json") or "[]")
 except:return []
def newpage():
 req=urllib.request.Request("http://127.0.0.1:9333/json/new?http%3A%2F%2F127.0.0.1%3A5173%2F",method="PUT")
 try:
  with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
 except:return None
class W:
 def __init__(self,u):
  m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3);self.s=socket.create_connection((h,p),timeout=5)
  k=base64.b64encode(os.urandom(16)).decode();self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode());b=b""
  while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
  self.i=0
 def send(self,o):
  p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
  if n<126:h.append(128|n)
  elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
  else:h.extend([255]);h.extend(struct.pack("!Q",n))
  self.s.sendall(bytes(h)+m+bytes(x^m[i%4] for i,x in enumerate(p)))
 def recv(self):
  h=self.s.recv(2)
  if len(h)<2:return None
  a,b=h;n=b&127
  if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
  elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
  mask=self.s.recv(4) if b&128 else None;d=b""
  while len(d)<n:d+=self.s.recv(n-len(d))
  if mask:d=bytes(x^mask[i%4] for i,x in enumerate(d))
  try:return json.loads(d.decode()) if a&15==1 else None
  except:return None
 def call(self,m,p={}):
  self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p})
  while True:
   x=self.recv()
   if x and x.get("id")==i:return x
def ev(w,e):
 r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
 return (((r or {}).get("result")or{}).get("result")or{}).get("value")
def click_exact(w,text):
 return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length}};xs[0].click();return{{clicked:true,count:1}}}})()""")
def inspect(w,target):
 return ev(w,f"""(()=>{{const T={json.dumps(target)},txt=document.body?.innerText||'';return{{targetVisible:txt.toLowerCase().includes(T.toLowerCase()),targetButtons:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase())).map(x=>(x.innerText||x.textContent||'').trim()),assignments:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Assignments').length,generate:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Generate Client Listing Report').length,download:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report').map(x=>({{disabled:x.disabled,hasOnClick:!!Object.values(x).find(v=>v&&typeof v==='object'&&typeof v.onClick==='function')}})),body:txt.slice(0,12000)}}}})()""")
def main():
 repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";e=app/"evidence/explorer4"
 r2p=e/R2/"export_target_qualification_residual_causal_diagnosis.json"
 if not r2p.exists():print("STATUS: BLOCKED\nDIAGNOSIS: R22A_R2_EVIDENCE_REQUIRED");return 4
 r2=loadj(r2p)
 if r2.get("classification")!="R22A_R1_SELECTION_ORDER_INVALID_TARGET_LOOKUP_EXECUTED_BEFORE_EXPLORER_SEARCH_CONTEXT_MATERIALIZATION":print("STATUS: BLOCKED\nDIAGNOSIS: R22A_R2_CAUSE_NOT_CERTIFIED");return 5
 if not [x for x in pages() if x.get("type")=="page" and "127.0.0.1:5173" in x.get("url","")]:print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 6
 results=[];halt=False
 for i,t in enumerate(TARGETS,1):
  n=newpage()
  if not n or not n.get("webSocketDebuggerUrl"):results.append({"target":t,"failure":"FRESH_PAGE_FAILED"});halt=True;break
  w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable");time.sleep(.7)
  ex=click_exact(w,"Explorer");time.sleep(.7);a=inspect(w,t)
  sel={"clicked":False,"count":len(a.get("targetButtons",[]))}
  if len(a.get("targetButtons",[]))==1:
   sel=ev(w,f"""(()=>{{const T={json.dumps(t)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));if(xs.length!==1)return{{clicked:false,count:xs.length}};xs[0].click();return{{clicked:true,count:1,text:(xs[0].innerText||xs[0].textContent||'').trim()}}}})()""");time.sleep(.5)
  b=inspect(w,t)
  selected=bool(sel and sel.get("clicked") and b.get("targetVisible"))
  ass=click_exact(w,"Assignments") if selected else {"clicked":False,"count":0};time.sleep(.6)
  c=inspect(w,t)
  gen_ok=c.get("generate")==1
  gen=click_exact(w,"Generate Client Listing Report") if gen_ok else {"clicked":False,"count":c.get("generate",0)};time.sleep(.6)
  d=inspect(w,t)
  dl=d.get("download",[]); export_ok=len(dl)==1 and not dl[0].get("disabled") and dl[0].get("hasOnClick")
  qualified=selected and ass.get("clicked") and gen.get("clicked") and export_ok
  fail=None if qualified else ("SELECTED_PROPERTY_READBACK_FAILED" if not selected else "ASSIGNMENTS_ENTRY_FAILED" if not ass.get("clicked") else "GENERATE_CONTROL_FAILED" if not gen_ok else "REPORT_REVIEW_EXPORT_CONTROL_FAILED")
  results.append({"index":i,"target":t,"freshTargetCreated":True,"explorerEntry":ex,"targetVisibleAfterExplorer":a.get("targetVisible"),"targetButtonCount":len(a.get("targetButtons",[])),"selection":sel,"selectedPropertyCertified":selected,"assignmentsEntryCertified":bool(ass.get("clicked")),"generateControlCertified":gen_ok,"reportReviewEntryCertified":bool(gen.get("clicked")),"exportControlCertified":export_ok,"liveHandlerCertified":export_ok,"qualified":qualified,"failure":fail})
  try:w.call("Page.close")
  except:pass
  if not qualified:halt=True;break
 allq=len(results)==3 and all(x["qualified"] for x in results)
 state="M419D4BN17C_R4_R12_R16A_R22A_R3_EXACT_THREE_RECORD_TARGET_QUALIFICATION_CERTIFIED" if allq else "M419D4BN17C_R4_R12_R16A_R22A_R3_TARGET_QUALIFICATION_INCOMPLETE"
 nxt="M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION" if allq else "M4_19D4BN17C_R4_R12_R16A_R22A_R4_TARGET_QUALIFICATION_RESIDUAL_DIAGNOSIS"
 out={"framework":"SCIIP_EXPLORER_4_R22A_R3","status":"PASSED" if allq else "DIAGNOSTIC_COMPLETE","state":state,"classification":"EXACT_THREE_RECORD_EXPORT_TARGETS_QUALIFIED_EXPORT_INVOCATION_OFF" if allq else "TARGET_QUALIFICATION_INCOMPLETE","results":results,"qualified":sum(x["qualified"] for x in results),"haltedOnFailure":halt,"exportInvocationOff":True,"applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True,"nextMilestone":nxt,"generatedAt":datetime.now(timezone.utc).isoformat()}
 od=e/M;od.mkdir(parents=True,exist_ok=True);ep=od/"explorer_first_target_selection_and_exact_three_record_qualification_recertification.json";ep.write_text(json.dumps(out,indent=2)+"\n")
 print("="*120);print("SCIIP Explorer 4.0 — R22A-R3 Explorer-First Exact Three-Record Qualification Recertification");print("="*120)
 for x in results:
  print(f"\n[{x['index']}/3] {x['target']}")
  for k in ["freshTargetCreated","targetVisibleAfterExplorer","targetButtonCount","selectedPropertyCertified","assignmentsEntryCertified","generateControlCertified","reportReviewEntryCertified","exportControlCertified","liveHandlerCertified","qualified","failure"]:print(f"{k}: {x.get(k)}")
 print("\nQUALIFIED:",out["qualified"],"/3");print("HALTED_ON_FAILURE:",halt);print("EXPORT_INVOCATION: OFF");print("STATUS:",out["status"]);print("STATE:",state);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ep)
 return 0
if __name__=="__main__":raise SystemExit(main())
