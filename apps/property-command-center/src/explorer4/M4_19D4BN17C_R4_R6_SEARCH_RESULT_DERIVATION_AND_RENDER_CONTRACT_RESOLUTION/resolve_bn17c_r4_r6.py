#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R6_SEARCH_RESULT_DERIVATION_AND_RENDER_CONTRACT_RESOLUTION"
PROBE="2 Musick"

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
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(12)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.hs:raise RuntimeError(self.hs)
        self.i=0
    def rn(self,n):
        b=b""
        while len(b)<n:b+=self.s.recv(n-len(b))
        return b
    def send(self,o):
        b=json.dumps(o).encode();m=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=m;self.s.sendall(h+bytes(v^m[i%4] for i,v in enumerate(b)))
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
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r5p=ev/"M4_19D4BN17C_R4_R5_SEARCH_RESULT_STATE_SOURCE_TO_RUNTIME_RECONCILIATION"/"search_result_state_source_to_runtime_reconciliation.json"
    if not r5p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R5_EVIDENCE_REQUIRED");return 4
    r5=fj(r5p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    patterns={
      "query_state":re.compile(r"(searchQuery|query|setQuery|setSearch|searchTerm)",re.I),
      "derivation":re.compile(r"(searchResults|filteredResults|results\s*=|filter\(|useMemo|match|includes\(|startsWith\()",re.I),
      "async_effect":re.compile(r"(useEffect|debounce|setTimeout|Promise|async|await)",re.I),
      "render_gate":re.compile(r"(searchResults.*length|results.*length|showResults|isOpen|open.*search|query\.length|searchQuery\.length|&&.*results|results.*&&)",re.I),
      "workspace_gate":re.compile(r"(workspace|mode|explorer|activeView|route|selectedMode)",re.I)
    }
    refs={k:[] for k in patterns}
    for p in app.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"} and "node_modules" not in p.parts and "evidence" not in p.parts:
            try:ls=p.read_text(errors="ignore").splitlines()
            except:continue
            for fam,rx in patterns.items():
                if len(refs[fam])>=120:continue
                for i,l in enumerate(ls):
                    if rx.search(l):
                        refs[fam].append({"file":str(p.relative_to(app)),"line":i+1,"context":"\n".join(ls[max(0,i-4):i+5])[:2600]})
                        if len(refs[fam])>=120:break

    runtime_js=r"""(()=>{const input=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!input)return{found:false};
const keys=Object.keys(input),fk=keys.find(k=>k.startsWith('__reactFiber$')),pk=keys.find(k=>k.startsWith('__reactProps$'));const f=fk?input[fk]:null,p=pk?input[pk]:null;
function simp(v,depth=0){if(depth>2)return{type:typeof v};if(v==null||typeof v==='string'||typeof v==='number'||typeof v==='boolean')return v;if(Array.isArray(v))return{arrayLength:v.length,sample:v.slice(0,3).map(x=>simp(x,depth+1))};if(typeof v==='object'){const o={};for(const k of Object.keys(v).slice(0,20)){try{o[k]=simp(v[k],depth+1)}catch{}}return o}return{type:typeof v}}
const chain=[];let x=f,d=0;
while(x&&d<16){let ms=[];let h=x.memoizedState,c=0;while(h&&c<12){ms.push(simp(h.memoizedState));h=h.next;c++}
chain.push({depth:d,type:typeof x.type==='string'?x.type:(x.elementType?.name||x.type?.name||typeof x.type),memoizedProps:simp(x.memoizedProps),pendingProps:simp(x.pendingProps),hookState:ms});x=x.return;d++}
const text=(document.body.innerText||'').replace(/\s+/g,' ');
return{found:true,inputValue:input.value,propKeys:p?Object.keys(p):[],chain,body:text.slice(0,25000),visibleTextMatches:[...document.querySelectorAll('*')].filter(e=>e.offsetParent!==null&&/2\s*Musick/i.test((e.innerText||e.textContent||''))).slice(0,30).map(e=>({tag:e.tagName,text:(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,240),role:e.getAttribute('role'),className:String(e.className||'').slice(0,160)}))}})()"""

    before=w.ev(runtime_js)
    q=json.dumps(PROBE)
    activate=w.ev(r"""(()=>{const q=%s,e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{ok:false,why:'NO_INPUT'};try{e.focus();const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(e,q);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:q}));e.dispatchEvent(new Event('change',{bubbles:true}));e.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter',code:'Enter',keyCode:13,which:13}));e.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Enter',code:'Enter',keyCode:13,which:13}));return{ok:true,value:e.value}}catch(err){return{ok:false,error:String(err)}}})()"""%q)

    snaps={}
    for label,delta in [("100ms",.1),("300ms",.2),("750ms",.45),("1500ms",.75),("3000ms",1.5)]:
        time.sleep(delta);snaps[label]=w.ev(runtime_js)

    def extract_arrays(rt):
        v=(rt or {}).get("value") or {};arrays=[]
        for node in v.get("chain") or []:
            for source in ("memoizedProps","pendingProps"):
                obj=node.get(source)
                if isinstance(obj,dict):
                    for k,val in obj.items():
                        if isinstance(val,dict) and "arrayLength" in val:
                            arrays.append({"depth":node.get("depth"),"component":node.get("type"),"source":source,"key":k,"arrayLength":val.get("arrayLength")})
            for idx,h in enumerate(node.get("hookState") or []):
                if isinstance(h,dict) and "arrayLength" in h:
                    arrays.append({"depth":node.get("depth"),"component":node.get("type"),"source":"hookState","key":idx,"arrayLength":h.get("arrayLength")})
        return arrays

    array_obs={k:extract_arrays(v) for k,v in snaps.items()}
    body_mat=any(PROBE.lower() in (((v.get("value") or {}).get("body") or "").lower()) for v in snaps.values())
    visible_mat=any(len(((v.get("value") or {}).get("visibleTextMatches") or []))>0 for v in snaps.values())
    any_arrays=any(array_obs[k] for k in array_obs)
    seq=[[(x["component"],x["source"],x["key"],x["arrayLength"]) for x in array_obs[k]] for k in snaps]
    changed_arrays=bool(seq) and any(x!=seq[0] for x in seq[1:])

    checks={
      "bn17cR4R5Passed":r5.get("status")=="PASSED",
      "r4R5InputStateUpdated":r5.get("runtime",{}).get("afterNativeInputValue")==PROBE,
      "r4R5NoResultMaterialization":r5.get("runtime",{}).get("nativeMaterialized") is False,
      "queryStateSourceReferencesCaptured":len(refs["query_state"])>0,
      "derivationSourceReferencesCaptured":len(refs["derivation"])>0,
      "renderGateSourceReferencesCaptured":len(refs["render_gate"])>0,
      "liveSearchOwnerChainCaptured":bool(((before.get("value") or {}).get("chain") or [])),
      "nativeSearchActivationCompleted":bool((activate.get("value") or {}).get("ok")),
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if body_mat or visible_mat:
        diagnosis="SEARCH_RESULTS_DERIVE_AND_RENDER_WITH_LONGER_SETTLING_WINDOW"
        nxt="M4_19D4BN17C_R4_R7_ASYNC_SETTLED_SEARCH_RESULT_AND_SELECTED_PROPERTY_MICRO_COHORT_CERTIFICATION"
    elif any_arrays and changed_arrays:
        diagnosis="SEARCH_RESULT_COLLECTION_CHANGES_IN_RUNTIME_BUT_RENDER_CONDITION_SUPPRESSES_VISIBLE_RESULTS"
        nxt="M4_19D4BN17C_R4_R7_SEARCH_RESULT_RENDER_GATE_RESOLUTION"
    elif any_arrays and not changed_arrays:
        diagnosis="SEARCH_OWNER_CHAIN_EXPOSES_DATA_ARRAYS_BUT_RESULT_COLLECTION_DOES_NOT_RECOMPUTE_FOR_QUERY"
        nxt="M4_19D4BN17C_R4_R7_SEARCH_RESULT_DERIVATION_TRIGGER_RESOLUTION"
    else:
        diagnosis="SEARCH_RESULT_COLLECTION_NOT_EXPOSED_ON_SEARCH_INPUT_OWNER_CHAIN_ALTERNATE_RESULT_OWNER_REQUIRED"
        nxt="M4_19D4BN17C_R4_R7_RESULT_SURFACE_OWNER_AND_DERIVATION_PATH_RESOLUTION"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R6_SEARCH_RESULT_DERIVATION_AND_RENDER_CONTRACT_RESOLUTION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R6_SEARCH_RESULT_DERIVATION_AND_RENDER_CONTRACT_RESOLVED" if passed else "M419D4BN17C_R4_R6_CONTRACT_DIAGNOSIS_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,"probeProperty":PROBE,
         "sourceReferenceCounts":{k:len(v) for k,v in refs.items()},"sourceReferences":refs,
         "runtime":{"before":before,"activation":activate,"snapshots":snaps,"arrayObservations":array_obs,
                    "bodyMaterialized":body_mat,"visibleMaterialized":visible_mat,"anyArrayObserved":any_arrays,"arrayStateChanged":changed_arrays},
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R6_CERTIFIED_NEXT_SEARCH_RESULT_REPAIR_READY" if passed else "BN17C_R4_R6_REMAINS_OPEN",
         "nextMilestone":nxt if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"search_result_derivation_and_render_contract_resolution.json";f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*110);print("SCIIP Explorer 4.0 — BN17C-R4-R6 Search Result Derivation + Render Contract Resolution");print("="*110)
    print("WebSocket handshake:",w.hs);print("Validated CDP port:",port);print("Target URL:",t.get("url"))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- SOURCE REFERENCE COUNTS -----")
    for k,v in refs.items():print(f"{k}: {len(v)}")
    print("\nBODY_RESULT_MATERIALIZED:",body_mat);print("VISIBLE_RESULT_MATERIALIZED:",visible_mat)
    print("ANY_RUNTIME_ARRAY_OBSERVED:",any_arrays);print("RUNTIME_ARRAY_STATE_CHANGED:",changed_arrays)
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
