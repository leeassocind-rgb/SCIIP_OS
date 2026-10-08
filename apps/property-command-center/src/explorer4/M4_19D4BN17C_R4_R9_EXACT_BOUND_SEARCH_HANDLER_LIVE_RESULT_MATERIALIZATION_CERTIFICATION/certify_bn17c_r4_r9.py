#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R9_EXACT_BOUND_SEARCH_HANDLER_LIVE_RESULT_MATERIALIZATION_CERTIFICATION"
MICRO=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def gj(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read())
def norm(s): return re.sub(r"[^a-z0-9]+"," ",str(s).lower()).strip()

def target():
    for p in (9333,9222,9223,9334,9444):
        try:
            for x in gj(f"http://127.0.0.1:{p}/json"):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return p,x
        except: pass
    return None,None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m: raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(12)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.hs: raise RuntimeError(self.hs)
        self.i=0
    def rn(self,n):
        b=b""
        while len(b)<n:b+=self.s.recv(n-len(b))
        return b
    def send(self,o):
        b=json.dumps(o).encode();mask=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask;self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self.rn(2))[0]
            elif n==127:n=struct.unpack("!Q",self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None;p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op in (1,2):return json.loads(p.decode())
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x.get("id")==i:return x
    def ev(self,e):
        x=self.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
        r=x.get("result",{});rr=r.get("result",{});ex=r.get("exceptionDetails")
        return {"ok":not x.get("error") and ex is None,"value":rr.get("value"),"exceptionDetails":ex,"description":rr.get("description"),"topLevelError":x.get("error")}

def js(s): return json.dumps(s)

def live_inventory(w,q):
    return w.ev(r"""(()=>{const q=%s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const N=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const rows=[];
for(const e of document.querySelectorAll('*')){
 if(e.offsetParent===null)continue;
 const txt=(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim();
 const nt=N(txt);
 if(nt&&q&&(nt.includes(q)||q.includes(nt)))rows.push({tag:e.tagName,text:txt.slice(0,300),role:e.getAttribute('role'),aria:e.getAttribute('aria-label'),className:String(e.className||'').slice(0,160)});
 if(rows.length>=100)break;
}
return{body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,35000),url:location.href,matches:rows}})()"""%js(q))

def invoke_bound_handler(w,q):
    return w.ev(r"""(()=>{const q=%s;
const input=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');
if(!input)return{invoked:false,diagnostic:'SEARCH_INPUT_NOT_FOUND'};
function props(e){for(const k of Object.keys(e))if(k.startsWith('__reactProps$'))return e[k];return null}
const p=props(input);
const attempts=[];
function call(fn,label,arg){try{if(typeof fn!=='function')return false;fn(arg);attempts.push({label,ok:true,name:fn.name||null});return true}catch(err){attempts.push({label,ok:false,error:String(err),name:fn&&fn.name||null});return false}}
let invoked=false;
if(p){
 if(typeof p.onChange==='function')invoked=call(p.onChange,'input.onChange',{type:'change',target:{value:q},currentTarget:{value:q},nativeEvent:{}})||invoked;
 if(typeof p.onKeyDown==='function')invoked=call(p.onKeyDown,'input.onKeyDown',{type:'keydown',key:'Enter',code:'Enter',which:13,keyCode:13,target:{value:q},currentTarget:{value:q},preventDefault(){},stopPropagation(){},nativeEvent:{}})||invoked;
}
let fkey=Object.keys(input).find(k=>k.startsWith('__reactFiber$')),f=fkey?input[fkey]:null,depth=0;
while(f&&depth<15){
 const mp=f.memoizedProps||{};
 for(const [k,v] of Object.entries(mp)){
   if(typeof v!=='function')continue;
   if(!/(search|query|submit|change|key|execute|run)/i.test(k+' '+(v.name||'')))continue;
   const arg=/submit|search|execute|run/i.test(k+' '+(v.name||''))?q:{type:'change',target:{value:q},currentTarget:{value:q},key:'Enter',code:'Enter',preventDefault(){},stopPropagation(){},nativeEvent:{}};
   invoked=call(v,'ownerDepth'+depth+'.'+k,arg)||invoked;
 }
 f=f.return;depth++;
}
return{invoked,attempts}})()"""%js(q))

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r8p=ev/"M4_19D4BN17C_R4_R8_EXACT_SOURCE_SEARCH_HANDLER_RUNTIME_BINDING_RESOLUTION"/"exact_source_search_handler_runtime_binding_resolution.json"
    if not r8p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R8_EVIDENCE_REQUIRED");return 4
    r8=fj(r8p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    outcomes=[]
    for i,p in enumerate(MICRO,1):
        print(f"\n[{i}/3] {p}")
        pre=live_inventory(w,p)
        inv=invoke_bound_handler(w,p)
        snaps=[]
        for ms,sec in [(100,.1),(300,.2),(750,.45),(1500,.75)]:
            time.sleep(sec)
            s=live_inventory(w,p)
            snaps.append({"ms":ms,"snapshot":s})
        materialized=False
        exact_match=False
        best_matches=[]
        for s in snaps:
            v=s["snapshot"].get("value") or {}
            if norm(p) in norm(v.get("body","")):
                materialized=True
            for m in v.get("matches") or []:
                if norm(m.get("text",""))==norm(p):
                    exact_match=True
                    best_matches.append(m)
        attempts=(inv.get("value") or {}).get("attempts") or []
        invoked=bool((inv.get("value") or {}).get("invoked"))
        print("boundHandlerInvoked:",invoked)
        print("handlerAttemptCount:",len(attempts))
        print("resultMaterialized:",materialized)
        print("exactPropertyResultObserved:",exact_match)
        outcomes.append({"property":p,"boundHandler":inv,"snapshots":snaps,"materialized":materialized,"exactPropertyResultObserved":exact_match,"handlerAttemptCount":len(attempts),"handlerInvoked":invoked,"exactMatches":best_matches})

    mat=sum(1 for x in outcomes if x["materialized"])
    exact=sum(1 for x in outcomes if x["exactPropertyResultObserved"])
    all_invoked=all(x["handlerInvoked"] for x in outcomes)

    checks={
      "bn17cR4R8Passed":r8.get("status")=="PASSED",
      "r4R8ExactHandlerOwnerMapped":r8.get("diagnosis")=="EXACT_SOURCE_SEARCH_HANDLER_OWNER_MAPPED_TO_LIVE_REACT_RUNTIME",
      "exactThreeRecordMicroCohort":len(outcomes)==3,
      "allBoundHandlersInvoked":all_invoked,
      "allThreeResultsMaterialized":mat==3,
      "allThreeExactPropertyResultsObserved":exact==3,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed:
        diagnosis="EXACT_BOUND_SEARCH_HANDLER_MATERIALIZES_EXACT_LIVE_PROPERTY_RESULTS_ON_MICRO_COHORT"
        nxt="M4_19D4BN17C_R4_R10_EXACT_RESULT_SELECTION_AND_SELECTED_PROPERTY_MICRO_COHORT_CERTIFICATION"
    elif all_invoked and mat==0:
        diagnosis="BOUND_SEARCH_HANDLER_INVOKES_BUT_RESULT_PROVIDER_DOES_NOT_MATERIALIZE_ON_LIVE_SURFACE"
        nxt="M4_19D4BN17C_R4_R10_SEARCH_PROVIDER_RESULT_STATE_RUNTIME_OWNER_RESOLUTION"
    elif all_invoked and mat>0:
        diagnosis="BOUND_SEARCH_HANDLER_PARTIALLY_MATERIALIZES_RESULTS_MICRO_COHORT_PARITY_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R10_SEARCH_RESULT_PARITY_CAUSAL_DIAGNOSIS"
    else:
        diagnosis="EXACT_BOUND_SEARCH_HANDLER_INVOCATION_NOT_YET_CERTIFIED_ON_ALL_MICRO_COHORT_RECORDS"
        nxt="M4_19D4BN17C_R4_R10_BOUND_HANDLER_ARGUMENT_AND_EVENT_SHAPE_RESOLUTION"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R9_EXACT_BOUND_SEARCH_HANDLER_LIVE_RESULT_MATERIALIZATION_CERTIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R9_EXACT_BOUND_SEARCH_HANDLER_LIVE_RESULT_MATERIALIZATION_CERTIFIED" if passed else "M419D4BN17C_R4_R9_RESULT_MATERIALIZATION_INCOMPLETE",
         "diagnosis":diagnosis,
         "checks":checks,
         "materializedCount":mat,
         "exactPropertyResultCount":exact,
         "outcomes":outcomes,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R9_CERTIFIED_SELECTED_PROPERTY_BOUNDARY_READY" if passed else "BN17C_R4_R9_REMAINS_OPEN",
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_bound_search_handler_live_result_materialization_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("MATERIALIZED:",mat,"/3")
    print("EXACT_PROPERTY_RESULTS:",exact,"/3")
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
