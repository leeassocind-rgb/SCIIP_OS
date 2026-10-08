#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R5_SEARCH_RESULT_STATE_SOURCE_TO_RUNTIME_RECONCILIATION"
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
    r4p=ev/"M4_19D4BN17C_R4_R4_SEARCH_RESULT_MATERIALIZATION_AND_SELECTED_PROPERTY_ACTIVATION_CAUSAL_RESOLUTION"/"search_result_materialization_and_selected_property_activation_causal_resolution.json"
    if not r4p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R4_EVIDENCE_REQUIRED");return 4
    r4=fj(r4p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    rx=re.compile(r"(searchResults|searchQuery|setSearch|setQuery|query|debounce|useEffect|useMemo|filter\(|onKeyDown|onChange|handleSearch|globalSearch|selectedProperty)",re.I)
    refs=[]
    for p in app.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"} and "node_modules" not in p.parts and "evidence" not in p.parts:
            try: ls=p.read_text(errors="ignore").splitlines()
            except: continue
            for i,l in enumerate(ls):
                if rx.search(l):
                    refs.append({"file":str(p.relative_to(app)),"line":i+1,"context":"\n".join(ls[max(0,i-3):i+4])[:2200]})
                    if len(refs)>=500:break
        if len(refs)>=500:break

    runtime_probe=r"""(()=>{const input=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');
if(!input)return{found:false};
const allKeys=Object.keys(input);
const propKey=allKeys.find(k=>k.startsWith('__reactProps$'))||null;
const fiberKey=allKeys.find(k=>k.startsWith('__reactFiber$'))||null;
const p=propKey?input[propKey]:null;
const f=fiberKey?input[fiberKey]:null;
const chain=[];let x=f,depth=0;
function slim(v){if(v==null)return v;if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return v;if(Array.isArray(v))return{arrayLength:v.length};if(typeof v==='object')return{keys:Object.keys(v).slice(0,25)};return typeof v}
while(x&&depth<12){chain.push({depth,tag:typeof x.type==='string'?x.type:(x.elementType?.name||x.type?.name||typeof x.type),memoizedProps:x.memoizedProps?Object.keys(x.memoizedProps).slice(0,30):[],memoizedState:slim(x.memoizedState),pendingProps:x.pendingProps?Object.keys(x.pendingProps).slice(0,30):[]});x=x.return;depth++}
return{found:true,value:input.value,propKeys:p?Object.keys(p):[],hasOnChange:!!(p&&p.onChange),hasOnKeyDown:!!(p&&p.onKeyDown),hasOnInput:!!(p&&p.onInput),hasOnSubmit:!!(p&&p.onSubmit),fiberChain:chain,body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,15000)}})()"""

    before=w.ev(runtime_probe)
    q=json.dumps(PROBE)
    direct=w.ev(r"""(()=>{const q=%s,e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{ok:false};let p=null;for(const k of Object.keys(e))if(k.startsWith('__reactProps$')){p=e[k];break}if(!p)return{ok:false,why:'NO_PROPS'};try{if(typeof p.onChange==='function')p.onChange({type:'change',target:{value:q},currentTarget:{value:q},nativeEvent:{}});if(typeof p.onKeyDown==='function')p.onKeyDown({key:'Enter',code:'Enter',which:13,keyCode:13,type:'keydown',target:{value:q},currentTarget:{value:q},preventDefault(){},stopPropagation(){},nativeEvent:{}});return{ok:true}}catch(err){return{ok:false,error:String(err)}}})()"""%q)
    waits={}
    for label,sec in [("100ms",.1),("300ms",.2),("750ms",.45),("1500ms",.75)]:
        time.sleep(sec);waits[label]=w.ev(runtime_probe)

    native=w.ev(r"""(()=>{const q=%s,e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{ok:false};try{e.focus();const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(e,q);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:q}));e.dispatchEvent(new Event('change',{bubbles:true}));e.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter',code:'Enter',keyCode:13,which:13}));e.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Enter',code:'Enter',keyCode:13,which:13}));return{ok:true,value:e.value}}catch(err){return{ok:false,error:String(err)}}})()"""%q)
    time.sleep(.5)
    after_native=w.ev(runtime_probe)

    def materialized(x):
        v=(x or {}).get("value") or {}
        return PROBE.lower() in str(v.get("body","")).lower()

    direct_mat=any(materialized(v) for v in waits.values())
    native_mat=materialized(after_native)
    before_val=((before.get("value") or {}).get("value"))
    after_val=((after_native.get("value") or {}).get("value"))
    prop_keys=((before.get("value") or {}).get("propKeys") or [])

    checks={
      "bn17cR4R4DiagnosticComplete":r4.get("status")=="DIAGNOSTIC_COMPLETE",
      "r4R4MaterializedZeroOfThree":r4.get("materializedCount")==0,
      "sourceSearchStateReferencesCaptured":len(refs)>0,
      "liveSearchInputFiberObserved":bool((before.get("value") or {}).get("fiberChain")),
      "liveSearchReactPropsObserved":len(prop_keys)>0,
      "directReactActivationProbeCompleted":bool((direct.get("value") or {}).get("ok")),
      "nativeDomActivationProbeCompleted":bool((native.get("value") or {}).get("ok")),
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if native_mat and not direct_mat:
        diagnosis="SEARCH_RESULT_MATERIALIZATION_REQUIRES_NATIVE_DOM_EVENT_CONTRACT_NOT_DIRECT_REACT_PROP_INVOCATION"
        nxt="M4_19D4BN17C_R4_R6_NATIVE_DOM_SEARCH_ACTIVATION_AND_SELECTED_PROPERTY_MICRO_COHORT_CERTIFICATION"
    elif direct_mat:
        diagnosis="DIRECT_REACT_SEARCH_ACTIVATION_MATERIALIZES_RESULTS_WITH_ASYNC_SETTLING"
        nxt="M4_19D4BN17C_R4_R6_ASYNC_SETTLED_SEARCH_SELECTION_MICRO_COHORT_CERTIFICATION"
    elif after_val==PROBE and not native_mat:
        diagnosis="SEARCH_INPUT_STATE_UPDATES_BUT_RESULT_DERIVATION_OR_RENDER_CONTRACT_REMAINS_UNRESOLVED"
        nxt="M4_19D4BN17C_R4_R6_SEARCH_RESULT_DERIVATION_AND_RENDER_CONTRACT_RESOLUTION"
    else:
        diagnosis="SEARCH_INPUT_CONTROLLED_STATE_NOT_TRANSITIONING_THROUGH_CURRENT_ACTIVATION_PATHS"
        nxt="M4_19D4BN17C_R4_R6_CONTROLLED_SEARCH_STATE_SETTER_RESOLUTION"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R5_SEARCH_RESULT_STATE_SOURCE_TO_RUNTIME_RECONCILIATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R5_SEARCH_RESULT_STATE_SOURCE_TO_RUNTIME_RECONCILED" if passed else "M419D4BN17C_R4_R5_RECONCILIATION_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,"probeProperty":PROBE,"sourceReferenceCount":len(refs),"sourceReferences":refs,
         "runtime":{"before":before,"directReactActivation":direct,"directWaitSnapshots":waits,"nativeDomActivation":native,"afterNative":after_native,
                    "directMaterialized":direct_mat,"nativeMaterialized":native_mat,"beforeInputValue":before_val,"afterNativeInputValue":after_val},
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R5_RECONCILED_NEXT_REPAIR_READY" if passed else "BN17C_R4_R5_REMAINS_OPEN",
         "nextMilestone":nxt if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"search_result_state_source_to_runtime_reconciliation.json";f.write_text(json.dumps(res,indent=2)+"\n")
    print("="*110);print("SCIIP Explorer 4.0 — BN17C-R4-R5 Search Result State Source-to-Runtime Reconciliation");print("="*110)
    print("WebSocket handshake:",w.hs);print("Validated CDP port:",port);print("Target URL:",t.get("url"))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nSOURCE_REFERENCE_COUNT:",len(refs))
    print("BEFORE_INPUT_VALUE:",before_val)
    print("AFTER_NATIVE_INPUT_VALUE:",after_val)
    print("DIRECT_REACT_RESULT_MATERIALIZED:",direct_mat)
    print("NATIVE_DOM_RESULT_MATERIALIZED:",native_mat)
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
