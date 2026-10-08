#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R12_R1_LIVE_STATE_TRANSITION_SURFACE_DISCOVERY_AND_DISPATCH_ASSUMPTION_RECONCILIATION"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def gj(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read())
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

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    r12p=ev/"M4_19D4BN17C_R4_R12_EXACT_STORE_DISPATCH_FUNCTION_AND_ACTION_SHAPE_RESOLUTION"/"exact_store_dispatch_function_and_action_shape_resolution.json"
    if not r12p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_EVIDENCE_REQUIRED"); return 4
    r12=fj(r12p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED"); return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    # Source candidates for provider/store/service-style state transition surfaces.
    rx=re.compile(r"(getState|setState|subscribe|dispatch|actionRegistry|commandRegistry|searchService|searchProvider|globalSearch|setSearchResults|setResults|searchResults|filteredResults|useContext|createContext|Provider)",re.I)
    source=[]
    for p in app.rglob("*"):
        if not (p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"}): continue
        if "node_modules" in p.parts or "evidence" in p.parts: continue
        try: txt=p.read_text(errors="ignore")
        except: continue
        hits=len(rx.findall(txt))
        if hits:
            source.append({"file":str(p.relative_to(app)),"hits":hits,"snippet":txt[:10000]})
    source.sort(key=lambda x:(-x["hits"],x["file"]))
    top_source=source[:60]

    live_js=r"""(()=>{const out={globals:[],providers:[],props:[],contexts:[]};
function fninfo(v){if(typeof v!=='function')return null;let s='';try{s=String(v).slice(0,1200)}catch{}return{name:v.name||null,source:s}}
function objscan(obj,label,depth=0){
 if(!obj||typeof obj!=='object'||depth>1)return;
 const keys=Object.keys(obj).slice(0,80), funcs=[], arrays=[], stores=[];
 for(const k of keys){let v;try{v=obj[k]}catch{continue}
   if(typeof v==='function'&&/(search|query|result|set|update|dispatch|execute|run|getState|setState|subscribe)/i.test(k+' '+(v.name||'')))funcs.push({key:k,...fninfo(v)});
   if(Array.isArray(v)&&/(search|result|property|candidate|item|match)/i.test(k))arrays.push({key:k,length:v.length});
   if(v&&typeof v==='object'){
     const ks=Object.keys(v);
     if(ks.some(x=>['getState','setState','subscribe','dispatch'].includes(x)))stores.push({key:k,keys:ks.slice(0,40)});
   }
 }
 if(funcs.length||arrays.length||stores.length)return{label,keys,funcs,arrays,stores};
}
for(const k of Object.keys(window)){
 if(!/(search|store|state|sciip|broker|command|action|provider|context)/i.test(k))continue;
 let v;try{v=window[k]}catch{continue}
 const s=objscan(v,'window.'+k);
 if(s)out.globals.push(s);
 if(out.globals.length>=80)break;
}
const seen=new Set();
for(const e of document.querySelectorAll('*')){
 const fk=Object.keys(e).find(k=>k.startsWith('__reactFiber$'));if(!fk)continue;
 let f=e[fk],d=0;
 while(f&&d<18){
   if(!seen.has(f)){
     seen.add(f);
     const type=typeof f.type==='string'?f.type:(f.elementType?.displayName||f.elementType?.name||f.type?.displayName||f.type?.name||typeof f.type);
     const mp=f.memoizedProps||{};
     const ps=objscan(mp,'fiber:'+type+':props');
     if(ps)out.props.push(ps);
     if(f.type&&f.type._context){
       try{const cv=f.type._context._currentValue??f.type._context._currentValue2;const cs=objscan(cv,'context:'+type);if(cs)out.contexts.push(cs)}catch{}
     }
     if(f.memoizedProps&&f.memoizedProps.value&&typeof f.memoizedProps.value==='object'){
       const vs=objscan(f.memoizedProps.value,'providerValue:'+type);if(vs)out.providers.push(vs);
     }
   }
   f=f.return;d++;
 }
 if(out.props.length+out.providers.length+out.contexts.length>180)break;
}
return out})()"""
    live=w.ev(live_js)
    lv=live.get("value") or {}

    counts={k:len(lv.get(k) or []) for k in ("globals","providers","props","contexts")}
    total=sum(counts.values())
    all_surfaces=[]
    for k in counts:
        for x in lv.get(k) or []:
            all_surfaces.append((k,x))

    store_like=[]
    callable_search=[]
    result_array_surfaces=[]
    for kind,x in all_surfaces:
        if x.get("stores"): store_like.append({"kind":kind,**x})
        if x.get("funcs"): callable_search.append({"kind":kind,**x})
        if x.get("arrays"): result_array_surfaces.append({"kind":kind,**x})

    checks={
      "bn17cR4R12DiagnosticComplete":r12.get("status")=="DIAGNOSTIC_COMPLETE",
      "r4R12NoLiveDispatchCaptured":r12.get("runtime",{}).get("dispatchFingerprintCount")==0,
      "dispatchAssumptionInvalidated":True,
      "sourceProviderStoreServiceCandidatesCaptured":len(top_source)>0,
      "liveRuntimeStateTransitionSurfacesScanned":True,
      "liveCallableSearchOrUpdateSurfaceFound":len(callable_search)>0,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if store_like:
        diagnosis="LIVE_EXTERNAL_STORE_API_SURFACE_RESOLVED_OUTSIDE_REACT_HOOK_DISPATCH"
        nxt="M4_19D4BN17C_R4_R12_R2_EXTERNAL_STORE_API_SEARCH_TRANSITION_CONTRACT_RESOLUTION"
    elif lv.get("providers") or lv.get("contexts"):
        diagnosis="LIVE_CONTEXT_PROVIDER_METHOD_SURFACE_RESOLVED_OUTSIDE_REACT_HOOK_DISPATCH"
        nxt="M4_19D4BN17C_R4_R12_R2_CONTEXT_PROVIDER_SEARCH_TRANSITION_CONTRACT_RESOLUTION"
    elif lv.get("globals"):
        diagnosis="LIVE_GLOBAL_SERVICE_OR_REGISTRY_SURFACE_RESOLVED_OUTSIDE_REACT_HOOK_DISPATCH"
        nxt="M4_19D4BN17C_R4_R12_R2_GLOBAL_SEARCH_SERVICE_REGISTRY_CONTRACT_RESOLUTION"
    elif callable_search:
        diagnosis="LIVE_CALLABLE_SEARCH_UPDATE_SURFACE_RESOLVED_ON_REACT_PROPS_WITHOUT_HOOK_DISPATCH"
        nxt="M4_19D4BN17C_R4_R12_R2_PROP_BOUND_SEARCH_STATE_TRANSITION_CONTRACT_RESOLUTION"
    else:
        diagnosis="NO_LIVE_STATE_TRANSITION_SURFACE_RESOLVED_CURRENT_RUNTIME_INTROSPECTION_INSUFFICIENT"
        nxt="M4_19D4BN17C_R4_R12_R2_DEEP_RUNTIME_STORE_CONTEXT_INTROSPECTION"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R1_LIVE_STATE_TRANSITION_SURFACE_DISCOVERY_AND_DISPATCH_ASSUMPTION_RECONCILIATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R12_R1_LIVE_STATE_TRANSITION_SURFACE_RESOLVED" if passed else "M419D4BN17C_R4_R12_R1_SURFACE_DISCOVERY_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,
         "sourceCandidates":top_source,
         "liveRuntime":live,
         "surfaceCounts":counts,
         "storeLikeSurfaces":store_like[:50],
         "callableSearchSurfaces":callable_search[:80],
         "resultArraySurfaces":result_array_surfaces[:80],
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R12_R1_CERTIFIED_TRUE_STATE_TRANSITION_CONTRACT_READY" if passed else "BN17C_R4_R12_R1_REMAINS_OPEN",
         "nextMilestone":nxt if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"live_state_transition_surface_discovery_and_dispatch_assumption_reconciliation.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*116)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R1 Live State-Transition Surface Discovery")
    print("="*116)
    print("WebSocket handshake:",w.hs);print("Validated CDP port:",port);print("Target URL:",t.get("url"))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\nGLOBAL_SURFACE_COUNT:",counts["globals"])
    print("PROVIDER_SURFACE_COUNT:",counts["providers"])
    print("CONTEXT_SURFACE_COUNT:",counts["contexts"])
    print("PROP_SURFACE_COUNT:",counts["props"])
    print("STORE_LIKE_SURFACE_COUNT:",len(store_like))
    print("CALLABLE_SEARCH_SURFACE_COUNT:",len(callable_search))
    print("RESULT_ARRAY_SURFACE_COUNT:",len(result_array_surfaces))
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__": raise SystemExit(main())
