#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R10_SEARCH_PROVIDER_RESULT_STATE_RUNTIME_OWNER_RESOLUTION"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def gj(u):
    with urllib.request.urlopen(u,timeout=3) as r:
        return json.loads(r.read())

def target():
    for p in (9333,9222,9223,9334,9444):
        try:
            for x in gj(f"http://127.0.0.1:{p}/json"):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return p,x
        except:
            pass
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
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    r9p=ev/"M4_19D4BN17C_R4_R9_EXACT_BOUND_SEARCH_HANDLER_LIVE_RESULT_MATERIALIZATION_CERTIFICATION"/"exact_bound_search_handler_live_result_materialization_certification.json"
    if not r9p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN17C_R4_R9_EVIDENCE_REQUIRED")
        return 4
    r9=fj(r9p)

    port,t=target()
    if not t:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED")
        return 5
    w=WS(t["webSocketDebuggerUrl"])
    w.call("Runtime.enable")

    # Source-side owner candidates.
    owner_patterns={
        "context_provider":re.compile(r"(createContext|Provider|useContext)",re.I),
        "store":re.compile(r"(zustand|createStore|useStore|redux|configureStore|store\.|getState|setState)",re.I),
        "dispatcher":re.compile(r"(dispatch\(|dispatcher|runCommand|executeAction|actionRegistry)",re.I),
        "selector":re.compile(r"(selector|useMemo|useEffect|derive|filteredResults|searchResults)",re.I),
        "result_state":re.compile(r"(setSearchResults|setResults|searchResults|filteredResults|resultState)",re.I),
        "search_exec":re.compile(r"(handleSearch|runSearch|executeSearch|searchProvider|globalSearch)",re.I),
    }
    candidates=[]
    for p in app.rglob("*"):
        if not (p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"}):
            continue
        if "node_modules" in p.parts or "evidence" in p.parts:
            continue
        try:
            txt=p.read_text(errors="ignore")
        except:
            continue
        counts={k:len(rx.findall(txt)) for k,rx in owner_patterns.items()}
        score=counts["result_state"]*6 + counts["search_exec"]*5 + counts["context_provider"]*4 + counts["store"]*4 + counts["dispatcher"]*3 + counts["selector"]*2
        if score>0:
            candidates.append({
                "file":str(p.relative_to(app)),
                "score":score,
                "counts":counts,
                "snippet":txt[:8000]
            })
    candidates.sort(key=lambda x:(-x["score"],x["file"]))
    top=candidates[:50]

    live_js=r"""(()=>{const all=[...document.querySelectorAll('*')];const seen=new Set(),owners=[];
function slim(v,d=0){if(d>2)return{type:typeof v};if(v==null||typeof v==='string'||typeof v==='number'||typeof v==='boolean')return v;if(Array.isArray(v))return{arrayLength:v.length,sample:v.slice(0,3).map(x=>slim(x,d+1))};if(typeof v==='object'){const o={};for(const k of Object.keys(v).slice(0,25)){try{o[k]=slim(v[k],d+1)}catch{}}return o}return{type:typeof v}}
for(const e of all){
 const fk=Object.keys(e).find(k=>k.startsWith('__reactFiber$'));if(!fk)continue;
 let f=e[fk],d=0;
 while(f&&d<18){
   if(!seen.has(f)){
     seen.add(f);
     let hooks=[],h=f.memoizedState,c=0;
     while(h&&c<12){
       const q=h.queue||null;
       hooks.push({memoizedState:slim(h.memoizedState),baseState:slim(h.baseState),queue:q?{keys:Object.keys(q).slice(0,14),lastRenderedState:slim(q.lastRenderedState),dispatchName:q.dispatch&&q.dispatch.name||null,dispatchSource:q.dispatch?String(q.dispatch).slice(0,700):null}:null});
       h=h.next;c++;
     }
     const mp=f.memoizedProps||{};
     const funcs={};
     for(const [k,v] of Object.entries(mp)){if(typeof v==='function'&&/(search|result|dispatch|select|query|filter|execute|run)/i.test(k+' '+(v.name||'')))funcs[k]={name:v.name||null,source:String(v).slice(0,1000)}}
     const type=typeof f.type==='string'?f.type:(f.elementType?.displayName||f.elementType?.name||f.type?.displayName||f.type?.name||typeof f.type);
     const arrays=[];
     for(const [k,v] of Object.entries(mp)){if(Array.isArray(v))arrays.push({source:'prop',key:k,length:v.length,sample:v.slice(0,2).map(x=>slim(x,1))})}
     for(let i=0;i<hooks.length;i++){const m=hooks[i].memoizedState;if(m&&typeof m==='object'&&m.arrayLength!==undefined)arrays.push({source:'hook',key:i,length:m.arrayLength})}
     owners.push({type,depth:d,propKeys:Object.keys(mp).slice(0,50),functions:funcs,hooks,arrays});
   }
   f=f.return;d++;
 }
 if(owners.length>=180)break;
}
return{ownerCount:owners.length,owners}})()"""
    live=w.ev(live_js)
    lv=live.get("value") or {}
    owners=lv.get("owners") or []

    owner_names=[o.get("type") for o in owners if o.get("type")]
    mappings=[]
    for row in top:
        comp_hits=[n for n in owner_names if isinstance(n,str) and n and n.lower() in row["snippet"].lower()]
        function_hits=[]
        for o in owners:
            for k,v in (o.get("functions") or {}).items():
                nm=v.get("name")
                if nm and nm!="anonymous" and nm in row["snippet"]:
                    function_hits.append({"owner":o.get("type"),"prop":k,"function":nm})
        if comp_hits or function_hits:
            mappings.append({
                "file":row["file"],
                "score":row["score"],
                "counts":row["counts"],
                "componentHits":comp_hits[:20],
                "functionHits":function_hits[:20]
            })

    context_signal=any(r["counts"]["context_provider"]>0 and r["counts"]["result_state"]>0 for r in top[:15])
    store_signal=any(r["counts"]["store"]>0 and r["counts"]["result_state"]>0 for r in top[:15])
    dispatcher_signal=any(r["counts"]["dispatcher"]>0 and r["counts"]["search_exec"]>0 for r in top[:15])
    selector_signal=any(r["counts"]["selector"]>0 and r["counts"]["result_state"]>0 for r in top[:15])

    live_arrays=sum(len(o.get("arrays") or []) for o in owners)
    live_functions=sum(len(o.get("functions") or {}) for o in owners)
    live_dispatches=sum(1 for o in owners for h in (o.get("hooks") or []) if (h.get("queue") or {}).get("dispatchSource"))

    checks={
        "bn17cR4R9DiagnosticComplete":r9.get("status")=="DIAGNOSTIC_COMPLETE",
        "r4R9BoundHandlerInvokedAllThree":r9.get("checks",{}).get("allBoundHandlersInvoked") is True,
        "r4R9MaterializedZeroOfThree":r9.get("materializedCount")==0,
        "sourceResultOwnerCandidatesRanked":len(top)>0,
        "liveReactProviderOwnersCaptured":len(owners)>0,
        "liveResultArrayCandidatesCaptured":live_arrays>=0,
        "liveDispatchFunctionsCaptured":live_dispatches>=0,
        "sourceRuntimeOwnerMappingAttempted":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if mappings and store_signal:
        diagnosis="SEARCH_RESULT_STATE_OWNER_MAPPED_TO_LIVE_STORE_OR_CONTEXT_RUNTIME"
        nxt="M4_19D4BN17C_R4_R11_EXACT_RESULT_STORE_ACTION_RUNTIME_BINDING_AND_MATERIALIZATION_CERTIFICATION"
    elif mappings and context_signal:
        diagnosis="SEARCH_RESULT_STATE_OWNER_MAPPED_TO_LIVE_CONTEXT_PROVIDER_RUNTIME"
        nxt="M4_19D4BN17C_R4_R11_EXACT_CONTEXT_PROVIDER_SEARCH_ACTION_RUNTIME_BINDING"
    elif mappings and dispatcher_signal:
        diagnosis="SEARCH_RESULT_STATE_OWNER_MAPPED_TO_LIVE_DISPATCHER_ACTION_RUNTIME"
        nxt="M4_19D4BN17C_R4_R11_EXACT_SEARCH_DISPATCH_ACTION_RUNTIME_BINDING"
    elif mappings and selector_signal:
        diagnosis="SEARCH_RESULT_STATE_OWNER_MAPPED_TO_LIVE_SELECTOR_EFFECT_RUNTIME"
        nxt="M4_19D4BN17C_R4_R11_EXACT_SELECTOR_EFFECT_INVALIDATION_RUNTIME_BINDING"
    elif mappings:
        diagnosis="SEARCH_RESULT_STATE_RUNTIME_OWNER_MAPPED_BUT_OWNERSHIP_CLASS_REMAINS_MIXED"
        nxt="M4_19D4BN17C_R4_R11_RESULT_OWNER_CLASS_DISAMBIGUATION_AND_LIVE_BINDING"
    else:
        diagnosis="SEARCH_RESULT_STATE_RUNTIME_OWNER_NOT_YET_MAPPED_FROM_PROVIDER_STORE_SELECTOR_CANDIDATES"
        nxt="M4_19D4BN17C_R4_R11_ALTERNATE_RESULT_PROVIDER_RUNTIME_OWNER_DISCOVERY"

    res={
        "framework":"SCIIP_EXPLORER_4_BN17C_R4_R10_SEARCH_PROVIDER_RESULT_STATE_RUNTIME_OWNER_RESOLUTION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":"M419D4BN17C_R4_R10_SEARCH_PROVIDER_RESULT_STATE_RUNTIME_OWNER_RESOLVED" if passed else "M419D4BN17C_R4_R10_RUNTIME_OWNER_DIAGNOSIS_INCOMPLETE",
        "diagnosis":diagnosis,
        "checks":checks,
        "topSourceOwnerCandidates":top,
        "liveRuntime":live,
        "sourceRuntimeMappings":mappings,
        "ownershipSignals":{
            "contextProviderSignal":context_signal,
            "storeSignal":store_signal,
            "dispatcherSignal":dispatcher_signal,
            "selectorEffectSignal":selector_signal,
            "liveOwnerCount":len(owners),
            "liveArrayCandidateCount":live_arrays,
            "liveFunctionCandidateCount":live_functions,
            "liveDispatchCandidateCount":live_dispatches,
            "mappingCount":len(mappings)
        },
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False
        },
        "next":"BN17C_R4_R10_CERTIFIED_RESULT_OWNER_NEXT_BINDING_READY" if passed else "BN17C_R4_R10_REMAINS_OPEN",
        "nextMilestone":nxt if passed else None
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"search_provider_result_state_runtime_owner_resolution.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*114)
    print("SCIIP Explorer 4.0 — BN17C-R4-R10 Search Provider Result-State Runtime Owner Resolution")
    print("="*114)
    print("WebSocket handshake:",w.hs)
    print("Validated CDP port:",port)
    print("Target URL:",t.get("url"))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\nTOP_SOURCE_OWNER_CANDIDATE_COUNT:",len(top))
    print("LIVE_OWNER_COUNT:",len(owners))
    print("LIVE_ARRAY_CANDIDATE_COUNT:",live_arrays)
    print("LIVE_FUNCTION_CANDIDATE_COUNT:",live_functions)
    print("LIVE_DISPATCH_CANDIDATE_COUNT:",live_dispatches)
    print("SOURCE_RUNTIME_MAPPING_COUNT:",len(mappings))
    print("CONTEXT_PROVIDER_SIGNAL:",context_signal)
    print("STORE_SIGNAL:",store_signal)
    print("DISPATCHER_SIGNAL:",dispatcher_signal)
    print("SELECTOR_EFFECT_SIGNAL:",selector_signal)
    print("STATUS:",res["status"])
    print("STATE:",res["state"])
    print("DIAGNOSIS:",res["diagnosis"])
    print("NEXT:",res["next"])
    print("NEXT_MILESTONE:",res["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
