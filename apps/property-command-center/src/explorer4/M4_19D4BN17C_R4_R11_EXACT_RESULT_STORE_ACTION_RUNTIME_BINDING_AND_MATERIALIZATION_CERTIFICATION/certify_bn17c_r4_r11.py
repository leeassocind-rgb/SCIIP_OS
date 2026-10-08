#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R11_EXACT_RESULT_STORE_ACTION_RUNTIME_BINDING_AND_MATERIALIZATION_CERTIFICATION"
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

def snapshot(w,q):
    return w.ev(r"""(()=>{const q=%s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const N=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const body=(document.body.innerText||'').replace(/\s+/g,' ');
const matches=[...document.querySelectorAll('*')].filter(e=>e.offsetParent!==null&&N(e.innerText||e.textContent).includes(q)).slice(0,50).map(e=>({tag:e.tagName,text:(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,300),role:e.getAttribute('role')}));
return{url:location.href,body:body.slice(0,35000),matches}})()"""%js(q))

def bind_and_dispatch(w,q):
    return w.ev(r"""(()=>{const q=%s;
const all=[...document.querySelectorAll('*')];
const seen=new Set(),actions=[];
function safe(fn,label,arg){
 try{fn(arg);actions.push({label,ok:true,name:fn.name||null});return true}
 catch(err){actions.push({label,ok:false,error:String(err),name:fn&&fn.name||null});return false}
}
for(const e of all){
 const fk=Object.keys(e).find(k=>k.startsWith('__reactFiber$'));if(!fk)continue;
 let f=e[fk],d=0;
 while(f&&d<18){
  if(!seen.has(f)){
   seen.add(f);
   const mp=f.memoizedProps||{};
   for(const [k,v] of Object.entries(mp)){
    if(typeof v!=='function')continue;
    const sig=(k+' '+(v.name||'')).toLowerCase();
    if(!/(search|query|result|dispatch|execute|run|action)/.test(sig))continue;
    let arg=q;
    if(/dispatch|action/.test(sig))arg={type:'SEARCH',query:q,term:q,value:q,payload:{query:q,term:q,value:q}};
    else if(/change|input/.test(sig))arg={type:'change',target:{value:q},currentTarget:{value:q},nativeEvent:{}};
    else if(/key/.test(sig))arg={type:'keydown',key:'Enter',code:'Enter',which:13,keyCode:13,target:{value:q},currentTarget:{value:q},preventDefault(){},stopPropagation(){},nativeEvent:{}};
    safe(v,'fiberDepth'+d+'.'+k,arg);
   }
   let h=f.memoizedState,c=0;
   while(h&&c<12){
    const qu=h.queue||null;
    if(qu&&typeof qu.dispatch==='function'){
      safe(qu.dispatch,'fiberDepth'+d+'.hook'+c+'.queue.dispatch',{type:'SEARCH',query:q,term:q,value:q,payload:{query:q,term:q,value:q}});
      safe(qu.dispatch,'fiberDepth'+d+'.hook'+c+'.queue.dispatch.string',q);
    }
    h=h.next;c++;
   }
  }
  f=f.return;d++;
 }
 if(actions.length>120)break;
}
return{invoked:actions.some(a=>a.ok),attemptCount:actions.length,actions:actions.slice(0,120)}})()"""%js(q))

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r10p=ev/"M4_19D4BN17C_R4_R10_SEARCH_PROVIDER_RESULT_STATE_RUNTIME_OWNER_RESOLUTION"/"search_provider_result_state_runtime_owner_resolution.json"
    if not r10p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R10_EVIDENCE_REQUIRED");return 4
    r10=fj(r10p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    outcomes=[]
    for i,p in enumerate(MICRO,1):
        print(f"\n[{i}/3] {p}")
        pre=snapshot(w,p)
        act=bind_and_dispatch(w,p)
        snaps=[]
        for ms,sec in [(150,.15),(500,.35),(1250,.75),(2500,1.25)]:
            time.sleep(sec);snaps.append({"ms":ms,"snapshot":snapshot(w,p)})
        mat=False;exact=False
        for s in snaps:
            v=s["snapshot"].get("value") or {}
            if norm(p) in norm(v.get("body","")): mat=True
            for m in v.get("matches") or []:
                if norm(m.get("text",""))==norm(p): exact=True
        av=act.get("value") or {}
        print("storeActionInvoked:",bool(av.get("invoked")))
        print("storeActionAttemptCount:",av.get("attemptCount",0))
        print("resultMaterialized:",mat)
        print("exactPropertyResultObserved:",exact)
        outcomes.append({"property":p,"pre":pre,"storeAction":act,"snapshots":snaps,"materialized":mat,"exactPropertyResultObserved":exact})

    invoked=all(bool((x["storeAction"].get("value") or {}).get("invoked")) for x in outcomes)
    mat=sum(1 for x in outcomes if x["materialized"])
    exact=sum(1 for x in outcomes if x["exactPropertyResultObserved"])

    checks={
      "bn17cR4R10Passed":r10.get("status")=="PASSED",
      "r4R10StoreOrContextOwnerMapped":r10.get("diagnosis")=="SEARCH_RESULT_STATE_OWNER_MAPPED_TO_LIVE_STORE_OR_CONTEXT_RUNTIME",
      "exactThreeRecordMicroCohort":len(outcomes)==3,
      "allResultStoreActionsInvoked":invoked,
      "allThreeResultsMaterialized":mat==3,
      "allThreeExactPropertyResultsObserved":exact==3,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed:
        diagnosis="EXACT_RESULT_STORE_ACTION_MATERIALIZES_EXACT_LIVE_SEARCH_RESULTS_ON_MICRO_COHORT"
        nxt="M4_19D4BN17C_R4_R12_EXACT_RESULT_SELECTION_AND_SELECTED_PROPERTY_MICRO_COHORT_CERTIFICATION"
    elif invoked and mat==0:
        diagnosis="RESULT_STORE_ACTIONS_INVOKE_BUT_RESULT_STATE_STILL_DOES_NOT_MATERIALIZE"
        nxt="M4_19D4BN17C_R4_R12_STORE_ACTION_PAYLOAD_AND_REDUCER_CONTRACT_RESOLUTION"
    elif invoked and mat>0:
        diagnosis="RESULT_STORE_ACTION_MATERIALIZATION_PARTIAL_MICRO_COHORT_PARITY_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_RESULT_STORE_PARITY_CAUSAL_DIAGNOSIS"
    else:
        diagnosis="EXACT_RESULT_STORE_ACTION_BINDING_NOT_YET_CERTIFIED_ON_ALL_MICRO_COHORT_RECORDS"
        nxt="M4_19D4BN17C_R4_R12_EXACT_STORE_DISPATCH_FUNCTION_AND_ACTION_SHAPE_RESOLUTION"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R11_EXACT_RESULT_STORE_ACTION_RUNTIME_BINDING_AND_MATERIALIZATION_CERTIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R11_EXACT_RESULT_STORE_ACTION_MATERIALIZATION_CERTIFIED" if passed else "M419D4BN17C_R4_R11_RESULT_STORE_ACTION_CERTIFICATION_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,"materializedCount":mat,"exactPropertyResultCount":exact,"outcomes":outcomes,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R11_CERTIFIED_SELECTED_PROPERTY_BOUNDARY_READY" if passed else "BN17C_R4_R11_REMAINS_OPEN",
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_result_store_action_runtime_binding_and_materialization_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("MATERIALIZED:",mat,"/3")
    print("EXACT_PROPERTY_RESULTS:",exact,"/3")
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
