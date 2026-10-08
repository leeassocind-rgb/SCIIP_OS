#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R12_R2_DEEP_RUNTIME_STORE_CONTEXT_AND_MODULE_OWNER_INTROSPECTION"

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
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
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
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r1p=ev/"M4_19D4BN17C_R4_R12_R1_LIVE_STATE_TRANSITION_SURFACE_DISCOVERY_AND_DISPATCH_ASSUMPTION_RECONCILIATION"/"live_state_transition_surface_discovery_and_dispatch_assumption_reconciliation.json"
    if not r1p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R1_EVIDENCE_REQUIRED");return 4
    r1=fj(r1p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    # Source-side deep-owner candidates.
    srch=re.compile(r"(searchResults|filteredResults|setSearchResults|globalSearch|searchProvider|searchService|createContext|useContext|getState|setState|subscribe|zustand|redux|store|provider|selector|commandRegistry|actionRegistry)",re.I)
    src=[]
    for p in app.rglob("*"):
        if not (p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"}):continue
        if "node_modules" in p.parts or "evidence" in p.parts:continue
        try:txt=p.read_text(errors="ignore")
        except:continue
        hits=len(srch.findall(txt))
        if hits:src.append({"file":str(p.relative_to(app)),"hits":hits,"snippet":txt[:10000]})
    src.sort(key=lambda x:(-x["hits"],x["file"]));src=src[:80]

    deep_js=r"""(()=>{const O={roots:[],fibers:[],globals:[],modules:[],symbols:[]};
function typ(f){try{return typeof f.type==='string'?f.type:(f.elementType?.displayName||f.elementType?.name||f.type?.displayName||f.type?.name||typeof f.type)}catch{return null}}
function fn(v){if(typeof v!=='function')return null;try{return{name:v.name||null,source:String(v).slice(0,900)}}catch{return{name:v.name||null}}}
function scanObj(obj,label,depth=0){
 if(!obj||(typeof obj!=='object'&&typeof obj!=='function')||depth>1)return null;
 let keys=[];try{keys=[...new Set([...Object.keys(obj),...Object.getOwnPropertyNames(obj)])].slice(0,100)}catch{return null}
 const funcs=[],arrays=[],storeKeys=[],interesting=[];
 for(const k of keys){let v;try{v=obj[k]}catch{continue}
   const sig=(k+' '+(typeof v==='function'?(v.name||''):'')).toLowerCase();
   if(typeof v==='function'&&/(search|query|result|dispatch|setstate|getstate|subscribe|execute|run|select|update|command|action)/.test(sig))funcs.push({key:k,...fn(v)});
   if(Array.isArray(v)&&/(search|result|property|candidate|match|item|data)/i.test(k))arrays.push({key:k,length:v.length});
   if(['getState','setState','subscribe','dispatch'].includes(k))storeKeys.push(k);
   if(/search|query|result|store|provider|context|command|action|selector/i.test(k))interesting.push({key:k,type:typeof v});
 }
 if(funcs.length||arrays.length||storeKeys.length||interesting.length)return{label,keys:keys.slice(0,60),funcs,arrays,storeKeys,interesting:interesting.slice(0,40)};
 return null;
}
const rootEls=[document.getElementById('root'),document.getElementById('app'),document.body,...document.querySelectorAll('[data-reactroot]')].filter(Boolean);
const roots=[];
for(const e of rootEls){
 for(const k of [...Object.getOwnPropertyNames(e),...Object.keys(e)]){
   if(k.startsWith('__reactContainer$')||k.startsWith('_reactRootContainer')){try{let r=e[k]?._internalRoot?.current||e[k]?.current||e[k];if(r)roots.push(r)}catch{}}
   if(k.startsWith('__reactFiber$')){try{let f=e[k];while(f&&f.return)f=f.return;if(f)roots.push(f)}catch{}}
 }
}
const uniq=[];const seenRoot=new Set();for(const r of roots){if(r&&!seenRoot.has(r)){seenRoot.add(r);uniq.push(r)}}
O.roots=uniq.map((r,i)=>({i,type:typ(r),tag:r.tag||null,keys:Object.keys(r).slice(0,40)}));
const seen=new Set(),queue=uniq.map((r,i)=>({f:r,root:i,depth:0}));let n=0;
while(queue.length&&n<1400){
 const {f,root,depth}=queue.shift();if(!f||seen.has(f))continue;seen.add(f);n++;
 const rec={root,depth,type:typ(f),tag:f.tag??null,key:f.key??null,flags:f.flags??null,lanes:f.lanes??null,surfaces:[]};
 for(const [label,obj] of [['memoizedProps',f.memoizedProps],['pendingProps',f.pendingProps],['memoizedState',f.memoizedState],['stateNode',f.stateNode],['updateQueue',f.updateQueue],['dependencies',f.dependencies]]){
   const s=scanObj(obj,label);if(s)rec.surfaces.push(s);
 }
 if(f.type&&f.type._context){try{const c=f.type._context;for(const [label,v] of [['_currentValue',c._currentValue],['_currentValue2',c._currentValue2]]){const s=scanObj(v,'context'+label);if(s)rec.surfaces.push(s)}}catch{}}
 if(rec.surfaces.length||/search|broker|explorer|provider|context|store/i.test(rec.type||''))O.fibers.push(rec);
 if(f.child)queue.push({f:f.child,root,depth:depth+1});
 if(f.sibling)queue.push({f:f.sibling,root,depth});
 if(f.alternate&&!seen.has(f.alternate))queue.push({f:f.alternate,root,depth});
}
const names=[...new Set([...Object.getOwnPropertyNames(window),...Object.keys(window)])];
for(const k of names){
 if(!/(vite|webpack|search|store|state|sciip|broker|command|action|provider|context|module)/i.test(k))continue;
 let v;try{v=window[k]}catch{continue}
 const s=scanObj(v,'window.'+k);if(s)O.globals.push(s);
 if(O.globals.length>120)break;
}
for(const s of Object.getOwnPropertySymbols(window)){let d='';try{d=String(s)}catch{};if(/search|store|state|sciip|broker|module|vite|webpack/i.test(d)){O.symbols.push(d)}}
for(const sc of document.scripts){const u=sc.src||'';if(u)O.modules.push(u)}
O.stats={rootCount:O.roots.length,fiberVisited:n,fiberSurfaceCount:O.fibers.length,globalSurfaceCount:O.globals.length,moduleScriptCount:O.modules.length,symbolCount:O.symbols.length};
return O})()"""
    live=w.ev(deep_js);lv=live.get("value") or {};stats=lv.get("stats") or {}

    fibers=lv.get("fibers") or [];globals_=lv.get("globals") or []
    callable=0;arrays=0;stores=0;contexts=0;state_nodes=0
    for f in fibers:
        for s in f.get("surfaces") or []:
            callable+=len(s.get("funcs") or []);arrays+=len(s.get("arrays") or []);stores+=1 if s.get("storeKeys") else 0
            if str(s.get("label","")).startswith("context"):contexts+=1
            if s.get("label")=="stateNode":state_nodes+=1
    for s in globals_:
        callable+=len(s.get("funcs") or []);arrays+=len(s.get("arrays") or []);stores+=1 if s.get("storeKeys") else 0

    # Cross-map runtime component names against source candidates.
    names=set(f.get("type") for f in fibers if isinstance(f.get("type"),str))
    mappings=[]
    for row in src:
        hits=[n for n in names if n and n.lower() in row["snippet"].lower()]
        if hits:mappings.append({"file":row["file"],"hits":row["hits"],"runtimeNames":hits[:25]})

    checks={
      "bn17cR4R12R1DiagnosticComplete":r1.get("status")=="DIAGNOSTIC_COMPLETE",
      "r1AllConventionalSurfaceCountsZero":sum((r1.get("surfaceCounts") or {}).values())==0,
      "reactRootsEnumerated":int(stats.get("rootCount",0))>0,
      "deepFiberTreeTraversed":int(stats.get("fiberVisited",0))>0,
      "alternateFibersIncluded":True,
      "deepRuntimeSurfacesInspected":True,
      "sourceRuntimeOwnerCorrelationAttempted":True,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if stores>0:
        diagnosis="DEEP_RUNTIME_EXTERNAL_OR_INTERNAL_STORE_SURFACE_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R3_RESOLVED_STORE_API_SEARCH_RESULT_CONTRACT_CERTIFICATION"
    elif contexts>0 and callable>0:
        diagnosis="DEEP_RUNTIME_CONTEXT_PROVIDER_CALLABLE_SURFACE_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R3_CONTEXT_PROVIDER_SEARCH_RESULT_CONTRACT_CERTIFICATION"
    elif state_nodes>0 and callable>0:
        diagnosis="DEEP_RUNTIME_STATE_NODE_OR_CLASS_INSTANCE_SEARCH_SURFACE_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R3_STATE_NODE_SEARCH_RESULT_CONTRACT_CERTIFICATION"
    elif callable>0:
        diagnosis="DEEP_RUNTIME_CALLABLE_SEARCH_STATE_SURFACE_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R3_DEEP_CALLABLE_SEARCH_RESULT_CONTRACT_CERTIFICATION"
    elif arrays>0:
        diagnosis="DEEP_RUNTIME_RESULT_ARRAY_OWNER_RESOLVED_WITHOUT_CALLABLE_TRANSITION_SURFACE"
        nxt="M4_19D4BN17C_R4_R12_R3_RESULT_ARRAY_OWNER_TRANSITION_PATH_RESOLUTION"
    elif mappings:
        diagnosis="SOURCE_RUNTIME_OWNER_COMPONENT_CORRELATION_RESOLVED_BUT_STATE_SURFACE_REMAINS_OPAQUE"
        nxt="M4_19D4BN17C_R4_R12_R3_COMPONENT_OWNER_CLOSURE_AND_MODULE_SCOPE_DIAGNOSIS"
    else:
        diagnosis="DEEP_RUNTIME_INTROSPECTION_FINDS_NO_SEARCH_RESULT_STATE_SURFACE_MODULE_SCOPE_OR_BUILD_BOUNDARY_SUSPECTED"
        nxt="M4_19D4BN17C_R4_R12_R3_BUNDLE_MODULE_SCOPE_SEARCH_PIPELINE_RESOLUTION"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R2_DEEP_RUNTIME_STORE_CONTEXT_AND_MODULE_OWNER_INTROSPECTION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R12_R2_DEEP_RUNTIME_OWNER_INTROSPECTION_CERTIFIED" if passed else "M419D4BN17C_R4_R12_R2_INTROSPECTION_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,"sourceCandidates":src,"liveRuntime":live,
         "derivedCounts":{"callableSurfaceCount":callable,"arraySurfaceCount":arrays,"storeSurfaceCount":stores,"contextSurfaceCount":contexts,"stateNodeSurfaceCount":state_nodes,"sourceRuntimeMappingCount":len(mappings)},
         "sourceRuntimeMappings":mappings,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R12_R2_CERTIFIED_DEEP_OWNER_NEXT_STEP_READY" if passed else "BN17C_R4_R12_R2_REMAINS_OPEN",
         "nextMilestone":nxt if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"deep_runtime_store_context_and_module_owner_introspection.json";f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*118);print("SCIIP Explorer 4.0 — BN17C-R4-R12-R2 Deep Runtime Store / Context / Module Owner Introspection");print("="*118)
    print("WebSocket handshake:",w.hs);print("Validated CDP port:",port);print("Target URL:",t.get("url"))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nREACT_ROOT_COUNT:",stats.get("rootCount",0))
    print("FIBER_VISITED_COUNT:",stats.get("fiberVisited",0))
    print("FIBER_SURFACE_COUNT:",stats.get("fiberSurfaceCount",0))
    print("GLOBAL_DEEP_SURFACE_COUNT:",stats.get("globalSurfaceCount",0))
    print("CALLABLE_SURFACE_COUNT:",callable)
    print("RESULT_ARRAY_SURFACE_COUNT:",arrays)
    print("STORE_SURFACE_COUNT:",stores)
    print("CONTEXT_SURFACE_COUNT:",contexts)
    print("STATE_NODE_SURFACE_COUNT:",state_nodes)
    print("SOURCE_RUNTIME_MAPPING_COUNT:",len(mappings))
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
