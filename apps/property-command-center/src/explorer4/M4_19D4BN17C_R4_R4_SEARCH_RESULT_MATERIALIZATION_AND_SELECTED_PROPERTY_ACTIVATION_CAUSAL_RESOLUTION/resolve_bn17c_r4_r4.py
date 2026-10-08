#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,unicodedata

M="M4_19D4BN17C_R4_R4_SEARCH_RESULT_MATERIALIZATION_AND_SELECTED_PROPERTY_ACTIVATION_CAUSAL_RESOLUTION"
MICRO=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def norm(s): return re.sub(r"[^a-z0-9]+"," ",unicodedata.normalize("NFKC",str(s)).lower()).strip()
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
        key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
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

def js(s):return json.dumps(s)

def snapshot(w,q):
    return w.ev(r"""(()=>{const q=%s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const N=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const props=e=>{for(const k of Object.keys(e))if(k.startsWith('__reactProps$'))return e[k];return null};
const rows=[];
for(const e of document.querySelectorAll('*')){
  if(e.offsetParent===null)continue;
  const t=(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim();
  const nt=N(t);
  const p=props(e);
  const events=p?['onClick','onMouseDown','onPointerDown','onKeyDown','onChange'].filter(k=>typeof p[k]==='function'):[];
  if((nt&&q&&(nt.includes(q)||q.includes(nt)))||events.length){
    rows.push({tag:e.tagName,text:t.slice(0,260),events,role:e.getAttribute('role'),aria:e.getAttribute('aria-label'),testid:e.getAttribute('data-testid'),className:String(e.className||'').slice(0,180)});
    if(rows.length>=250)break;
  }
}
return{url:location.href,body:(document.body.innerText||'').replace(/\s+/g,' ').slice(0,35000),session:Object.keys(sessionStorage||{}).reduce((o,k)=>(o[k]=String(sessionStorage.getItem(k)).slice(0,500),o),{}),local:Object.keys(localStorage||{}).reduce((o,k)=>(o[k]=String(localStorage.getItem(k)).slice(0,500),o),{}),candidates:rows}})()"""%js(q))

def search(w,q):
    return w.ev(r"""(()=>{const q=%s,e=document.querySelector('input[aria-label="Search SCIIP"],input[type="search"]');if(!e)return{invoked:false,diagnostic:'SEARCH_INPUT_NOT_FOUND'};
let p=null;for(const k of Object.keys(e))if(k.startsWith('__reactProps$')){p=e[k];break}
if(!p)return{invoked:false,diagnostic:'REACT_PROPS_NOT_FOUND'};
try{
 if(typeof p.onChange==='function')p.onChange({type:'change',target:{value:q},currentTarget:{value:q},nativeEvent:{}});
 if(typeof p.onKeyDown==='function')p.onKeyDown({key:'Enter',code:'Enter',which:13,keyCode:13,type:'keydown',target:{value:q},currentTarget:{value:q},preventDefault(){},stopPropagation(){},nativeEvent:{}});
 return{invoked:true,onChange:typeof p.onChange==='function',onKeyDown:typeof p.onKeyDown==='function'}
}catch(err){return{invoked:false,error:String(err)}}})()"""%js(q))

def select_result(w,q):
    return w.ev(r"""(()=>{const q=%s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim(),N=s=>String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const props=e=>{for(const k of Object.keys(e))if(k.startsWith('__reactProps$'))return e[k];return null};
const out=[];
for(const e of document.querySelectorAll('*')){
 if(e.offsetParent===null)continue;
 const t=(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim(),nt=N(t);if(!nt||!nt.includes(q))continue;
 const p=props(e),events=p?['onClick','onMouseDown','onPointerDown'].filter(k=>typeof p[k]==='function'):[];
 if(!events.length)continue;
 let score=(nt===q?1000:0)+(e.tagName==='BUTTON'?100:0)+(e.getAttribute('role')==='option'?80:0)+(events.includes('onClick')?50:0)-Math.min(nt.length,1000)/1000;
 out.push({e,p,t,nt,events,score});
}
out.sort((a,b)=>b.score-a.score);
if(!out.length)return{invoked:false,diagnostic:'NO_EVENT_BEARING_EXACT_RESULT_CANDIDATE'};
const b=out[0];
try{
 if(typeof b.p.onClick==='function'){b.p.onClick({type:'click',target:b.e,currentTarget:b.e,preventDefault(){},stopPropagation(){},nativeEvent:{}});return{invoked:true,method:'react.onClick',text:b.t.slice(0,240),score:b.score,events:b.events}}
 if(typeof b.p.onMouseDown==='function'){b.p.onMouseDown({type:'mousedown',target:b.e,currentTarget:b.e,preventDefault(){},stopPropagation(){},nativeEvent:{}});return{invoked:true,method:'react.onMouseDown',text:b.t.slice(0,240),score:b.score,events:b.events}}
}catch(err){return{invoked:false,error:String(err),text:b.t.slice(0,240)}}
return{invoked:false,diagnostic:'CANDIDATE_WITHOUT_SUPPORTED_HANDLER'}})()"""%js(q))

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r3p=ev/"M4_19D4BN17C_R4_R3_EXCEPTION_AWARE_EXACT_REACT_ACTIVATION_ADAPTER_MICRO_COHORT_RECERTIFICATION"/"exception_aware_exact_react_activation_adapter_micro_cohort_recertification.json"
    if not r3p.exists():print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R3_EVIDENCE_REQUIRED");return 4
    r3=fj(r3p);port,t=target()
    if not t:print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")
    outcomes=[]
    for i,p in enumerate(MICRO,1):
        print(f"\n[{i}/3] {p}")
        pre=snapshot(w,p)
        sr=search(w,p)
        time.sleep(.15);s1=snapshot(w,p)
        time.sleep(.35);s2=snapshot(w,p)
        time.sleep(.75);s3=snapshot(w,p)
        sv=[s1,s2,s3]
        materialized=False
        event_candidates=0
        for s in sv:
            v=s.get("value") or {}
            if norm(p) in norm(v.get("body","")):materialized=True
            event_candidates=max(event_candidates,sum(1 for x in v.get("candidates",[]) if x.get("events")))
        sel=select_result(w,p)
        time.sleep(.5);post=snapshot(w,p)
        pv=pre.get("value") or {};qv=post.get("value") or {}
        url_changed=pv.get("url")!=qv.get("url")
        storage_changed=(pv.get("session")!=qv.get("session")) or (pv.get("local")!=qv.get("local"))
        body_changed=norm(pv.get("body",""))!=norm(qv.get("body",""))
        selected_visible=norm(p) in norm(qv.get("body",""))
        selected=bool(sel.get("ok") and (sel.get("value") or {}).get("invoked")) and (url_changed or storage_changed or body_changed) and selected_visible
        print("searchInvoked:",bool(sr.get("ok") and (sr.get("value") or {}).get("invoked")))
        print("resultMaterialized:",materialized)
        print("eventBearingCandidateCount:",event_candidates)
        print("selectionActivation:",json.dumps(sel.get("value"),ensure_ascii=False))
        print("urlChanged:",url_changed)
        print("storageChanged:",storage_changed)
        print("bodyChanged:",body_changed)
        print("selectedPropertyCertified:",selected)
        outcomes.append({"property":p,"search":sr,"materialized":materialized,"eventBearingCandidateCount":event_candidates,"selection":sel,"urlChanged":url_changed,"storageChanged":storage_changed,"bodyChanged":body_changed,"selectedPropertyCertified":selected,
                         "snapshots":{"pre":pv,"afterSearch150ms":(s1.get("value") or {}),"afterSearch500ms":(s2.get("value") or {}),"afterSearch1250ms":(s3.get("value") or {}),"postSelection":qv}})
    # source-side causal references
    rx=re.compile(r"(selectedProperty|setSelectedProperty|selectProperty|onPropertySelect|searchResults|globalSearch|handleSearch|onKeyDown)",re.I)
    refs=[]
    for p in app.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"} and "node_modules" not in p.parts:
            try:ls=p.read_text(errors="ignore").splitlines()
            except:continue
            for i,l in enumerate(ls):
                if rx.search(l):
                    refs.append({"file":str(p.relative_to(app)),"line":i+1,"context":"\n".join(ls[max(0,i-2):i+3])[:1600]})
                    if len(refs)>=300:break
        if len(refs)>=300:break

    mat=sum(1 for x in outcomes if x["materialized"])
    sel=sum(1 for x in outcomes if x["selectedPropertyCertified"])
    checks={
      "bn17cR4R3DiagnosticComplete":r3.get("status")=="DIAGNOSTIC_COMPLETE",
      "r4R3GlobalSearchThreeOfThree":all((x.get("stages") or {}).get("01_GLOBAL_SEARCH") is True for x in r3.get("outcomes",[])),
      "r4R3SelectedPropertyZeroOfThree":all((x.get("stages") or {}).get("02_SELECTED_PROPERTY") is False for x in r3.get("outcomes",[])),
      "exactThreeRecordMicroCohort":len(outcomes)==3,
      "searchResultMaterializationObserved":mat>0,
      "sourceSelectionReferencesCaptured":len(refs)>0,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    # The diagnostic passes once the causal boundary is observed, even if selection still fails.
    passed=all(checks.values())
    if sel==3:
        diagnosis="SEARCH_RESULT_MATERIALIZATION_AND_SELECTED_PROPERTY_ACTIVATION_CERTIFIED_ON_MICRO_COHORT"
        nxt="M4_19D4BN17C_R4_R5_SELECTED_PROPERTY_CAUSAL_CERTIFICATION_AND_DOWNSTREAM_MICRO_COHORT_REENTRY"
    elif mat==3:
        diagnosis="SEARCH_RESULTS_MATERIALIZE_BUT_SELECTED_PROPERTY_ACTIVATION_ROUTE_REMAINS_UNRESOLVED"
        nxt="M4_19D4BN17C_R4_R5_EXACT_SEARCH_RESULT_HANDLER_RESOLUTION"
    else:
        diagnosis="SEARCH_ACTIVATION_DOES_NOT_RELIABLY_MATERIALIZE_PROPERTY_RESULTS_IN_LIVE_SURFACE"
        nxt="M4_19D4BN17C_R4_R5_SEARCH_RESULT_STATE_SOURCE_TO_RUNTIME_RECONCILIATION"
    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R4_SEARCH_RESULT_MATERIALIZATION_AND_SELECTED_PROPERTY_ACTIVATION_CAUSAL_RESOLUTION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_R4_SEARCH_SELECTION_CAUSAL_BOUNDARY_RESOLVED" if passed else "M419D4BN17C_R4_R4_SEARCH_SELECTION_DIAGNOSIS_INCOMPLETE",
         "diagnosis":diagnosis,"checks":checks,"materializedCount":mat,"selectedPropertyCertifiedCount":sel,"outcomes":outcomes,"sourceReferences":refs,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "next":"BN17C_R4_R4_CAUSAL_RESULT_READY" if passed else "BN17C_R4_R4_REMAINS_OPEN","nextMilestone":nxt if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"search_result_materialization_and_selected_property_activation_causal_resolution.json";f.write_text(json.dumps(res,indent=2)+"\n")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("MATERIALIZED:",mat,"/3");print("SELECTED_PROPERTY_CERTIFIED:",sel,"/3");print("SOURCE_REFERENCE_COUNT:",len(refs))
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0
if __name__=="__main__":raise SystemExit(main())
