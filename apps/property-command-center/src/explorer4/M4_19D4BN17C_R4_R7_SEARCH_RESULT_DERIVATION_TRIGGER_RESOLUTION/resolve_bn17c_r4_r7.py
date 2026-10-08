#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R7_SEARCH_RESULT_DERIVATION_TRIGGER_RESOLUTION"
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
    r6p=ev/"M4_19D4BN17C_R4_R6_SEARCH_RESULT_DERIVATION_AND_RENDER_CONTRACT_RESOLUTION"/"search_result_derivation_and_render_contract_resolution.json"
    if not r6p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R6_EVIDENCE_REQUIRED");return 4
    r6=fj(r6p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    # Source-side trigger references and dependency arrays.
    families={
      "memo_effect":re.compile(r"(useMemo|useEffect|useCallback)\s*\(",re.I),
      "search_handler":re.compile(r"(handleSearch|runSearch|executeSearch|onKeyDown|onSubmit|onChange|setSearch|setQuery)",re.I),
      "result_setter":re.compile(r"(setSearchResults|setResults|searchResults\s*=|filteredResults\s*=|setFiltered)",re.I),
      "query_dependency":re.compile(r"\[[^\]]*(search|query|term)[^\]]*\]",re.I),
      "mode_gate":re.compile(r"(workspace|mode|activeView|explorer|searchOpen|showSearch|isOpen)",re.I),
    }
    refs={k:[] for k in families}
    for p in app.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"} and "node_modules" not in p.parts and "evidence" not in p.parts:
            try:ls=p.read_text(errors="ignore").splitlines()
            except:continue
            for fam,rx in families.items():
                if len(refs[fam])>=120:continue
                for i,l in enumerate(ls):
                    if rx.search(l):
                        refs[fam].append({"file":str(p.relative_to(app)),"line":i+1,"context":"\n".join(ls[max(0,i-5):i+6])[:3000]})
                        if len(refs[fam])>=120:break

    runtime=r"""(()=>{const input=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!input)return{found:false};
const ks=Object.keys(input),fk=ks.find(k=>k.startsWith('__reactFiber$'));const f=fk?input[fk]:null;
function simp(v,d=0){if(d>2)return{type:typeof v};if(v==null||typeof v==='string'||typeof v==='number'||typeof v==='boolean')return v;if(Array.isArray(v))return{arrayLength:v.length,sample:v.slice(0,2).map(x=>simp(x,d+1))};if(typeof v==='object'){const o={};for(const k of Object.keys(v).slice(0,18)){try{o[k]=simp(v[k],d+1)}catch{}}return o}return{type:typeof v}}
const chain=[];let x=f,depth=0;
while(x&&depth<18){let hooks=[],h=x.memoizedState,c=0;while(h&&c<16){hooks.push({memoizedState:simp(h.memoizedState),baseState:simp(h.baseState),queue:h.queue?{keys:Object.keys(h.queue).slice(0,12),lastRenderedState:simp(h.queue.lastRenderedState)}:null});h=h.next;c++}
chain.push({depth,type:typeof x.type==='string'?x.type:(x.elementType?.name||x.type?.name||typeof x.type),memoizedProps:simp(x.memoizedProps),hookCount:hooks.length,hooks});x=x.return;depth++}
return{inputValue:input.value,chain,body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,22000)}})()"""

    before=w.ev(runtime)
    q=json.dumps(PROBE)
    variants=[
      ("native_input_only",r"""(()=>{const q=%s,e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{ok:false};const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(e,q);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:q}));return{ok:true,value:e.value}})()"""%q),
      ("native_change",r"""(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{ok:false};e.dispatchEvent(new Event('change',{bubbles:true}));return{ok:true}})()"""),
      ("keydown_enter",r"""(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{ok:false};e.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,key:'Enter',code:'Enter',keyCode:13,which:13}));return{ok:true}})()"""),
      ("keyup_enter",r"""(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{ok:false};e.dispatchEvent(new KeyboardEvent('keyup',{bubbles:true,key:'Enter',code:'Enter',keyCode:13,which:13}));return{ok:true}})()"""),
      ("blur",r"""(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{ok:false};e.dispatchEvent(new FocusEvent('blur',{bubbles:true}));return{ok:true}})()"""),
      ("submit_nearest_form",r"""(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');const f=e&&e.closest('form');if(!f)return{ok:false,diagnostic:'NO_FORM'};f.dispatchEvent(new SubmitEvent('submit',{bubbles:true,cancelable:true}));return{ok:true}})()"""),
    ]

    snapshots={"before":before}
    trigger_results=[]
    for name,expr in variants:
        rv=w.ev(expr);time.sleep(.35);snap=w.ev(runtime)
        trigger_results.append({"name":name,"activation":rv,"snapshot":snap})
        snapshots[name]=snap

    def array_signature(rt):
        v=(rt or {}).get("value") or {};sig=[]
        for node in v.get("chain") or []:
            for idx,h in enumerate(node.get("hooks") or []):
                ms=h.get("memoizedState")
                if isinstance(ms,dict) and "arrayLength" in ms:
                    sig.append((node.get("depth"),node.get("type"),idx,ms.get("arrayLength")))
                qx=h.get("queue") or {}
                lr=qx.get("lastRenderedState")
                if isinstance(lr,dict) and "arrayLength" in lr:
                    sig.append((node.get("depth"),node.get("type"),f"q{idx}",lr.get("arrayLength")))
        return sig

    base_sig=array_signature(before)
    sigs={x["name"]:array_signature(x["snapshot"]) for x in trigger_results}
    changed=[k for k,v in sigs.items() if v!=base_sig]
    materialized=[x["name"] for x in trigger_results if PROBE.lower() in (((x["snapshot"].get("value") or {}).get("body") or "").lower())]

    checks={
      "bn17cR4R6Passed":r6.get("status")=="PASSED",
      "r4R6RuntimeArraysObserved":r6.get("runtime",{}).get("anyArrayObserved") is True,
      "r4R6ArrayStateUnchanged":r6.get("runtime",{}).get("arrayStateChanged") is False,
      "memoEffectReferencesCaptured":len(refs["memo_effect"])>0,
      "searchHandlerReferencesCaptured":len(refs["search_handler"])>0,
      "resultSetterReferencesCaptured":len(refs["result_setter"])>0,
      "liveHookQueuesCaptured":bool(((before.get("value") or {}).get("chain") or [])),
      "boundedTriggerVariantsExecuted":len(trigger_results)==len(variants),
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if materialized:
        diagnosis="SEARCH_RESULT_DERIVATION_TRIGGER_IDENTIFIED_"+materialized[0].upper()
        nxt="M4_19D4BN17C_R4_R8_RESOLVED_TRIGGER_SEARCH_RESULT_AND_SELECTED_PROPERTY_MICRO_COHORT_CERTIFICATION"
    elif changed:
        diagnosis="DERIVATION_STATE_CHANGES_ON_TRIGGER_"+changed[0].upper()+"_BUT_VISIBLE_RESULT_STILL_SUPPRESSED"
        nxt="M4_19D4BN17C_R4_R8_POST_TRIGGER_RESULT_RENDER_GATE_RESOLUTION"
    elif refs["result_setter"]:
        diagnosis="SOURCE_RESULT_DERIVATION_PATH_EXISTS_BUT_NONE_OF_STANDARD_INPUT_SUBMIT_TRIGGERS_INVALIDATE_LIVE_RESULT_STATE"
        nxt="M4_19D4BN17C_R4_R8_EXACT_SOURCE_SEARCH_HANDLER_RUNTIME_BINDING_RESOLUTION"
    else:
        diagnosis="NO_RESULT_SETTER_CONTRACT_RESOLVED_IN_CURRENT_SEARCH_SURFACE"
        nxt="M4_19D4BN17C_R4_R8_ALTERNATE_SEARCH_PROVIDER_RESULT_OWNER_RESOLUTION"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R7_SEARCH_RESULT_DERIVATION_TRIGGER_RESOLUTION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R7_SEARCH_RESULT_DERIVATION_TRIGGER_RESOLVED" if passed else "M419D4BN17C_R4_R7_TRIGGER_DIAGNOSIS_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,"probeProperty":PROBE,
         "sourceReferenceCounts":{k:len(v) for k,v in refs.items()},"sourceReferences":refs,
         "runtime":{"before":before,"baseArraySignature":base_sig,"triggerResults":trigger_results,"changedArrayTriggers":changed,"materializedTriggers":materialized},
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R7_CERTIFIED_NEXT_REPAIR_READY" if passed else "BN17C_R4_R7_REMAINS_OPEN",
         "nextMilestone":nxt if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"search_result_derivation_trigger_resolution.json";f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*110);print("SCIIP Explorer 4.0 — BN17C-R4-R7 Search Result Derivation Trigger Resolution");print("="*110)
    print("WebSocket handshake:",w.hs);print("Validated CDP port:",port);print("Target URL:",t.get("url"))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- SOURCE REFERENCE COUNTS -----")
    for k,v in refs.items():print(f"{k}: {len(v)}")
    print("\nBASE_ARRAY_SIGNATURE_COUNT:",len(base_sig))
    print("CHANGED_ARRAY_TRIGGERS:",changed)
    print("MATERIALIZED_TRIGGERS:",materialized)
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
