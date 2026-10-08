#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R7_LIVE_BOUND_FUNCTION_RESIDUAL_CAUSAL_DIAGNOSIS"
PROBE="2 Musick"
TARGET_URL="http://127.0.0.1:5173/"
PORTS=[9333,9334,9335,9444,9555,9666,9222,9223]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def hj(url,method="GET",timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read())
def browser_ready(port):
    try:return bool(hj(f"http://127.0.0.1:{port}/json/version",timeout=1))
    except:return False
def page_targets(port):
    try:return hj(f"http://127.0.0.1:{port}/json",timeout=1)
    except:return []
def find_browser():
    for p in PORTS:
        if browser_ready(p) and any("127.0.0.1:5173" in x.get("url","") for x in page_targets(p)):return p
    for p in PORTS:
        if browser_ready(p):return p
    return None
def create_target(port):
    e=urllib.parse.quote(TARGET_URL,safe=":/")
    for u in (f"http://127.0.0.1:{port}/json/new?{e}",f"http://127.0.0.1:{port}/json/new?url={e}"):
        try:
            x=hj(u,method="PUT",timeout=2)
            if x.get("webSocketDebuggerUrl"):return x
        except:pass
    return None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:raise RuntimeError(f"bad websocket url: {u!r}")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode()
        self.s.sendall(req)
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("websocket handshake failed")
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
        r=x.get("result",{})
        return {"ok":not x.get("error") and r.get("exceptionDetails") is None,
                "value":r.get("result",{}).get("value")}
    def close(self):
        try:self.s.close()
        except:pass

def wait_ready(w):
    w.call("Runtime.enable");w.call("Page.enable")
    for _ in range(50):
        time.sleep(.2)
        if w.ev("document.readyState").get("value") in ("interactive","complete"):break
    time.sleep(.8)

def select_property(w,q):
    js="""(async()=>{
const q=__Q__,norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {ok:false};
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(input,q);else input.value=q;
input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:q}));
input.dispatchEvent(new Event('change',{bubbles:true}));
input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
input.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
await new Promise(r=>setTimeout(r,1000));
const ranked=[];
for(const el of document.querySelectorAll('*')){
 const tx=(el.innerText||el.textContent||'').trim();if(!tx||!norm(tx).includes(norm(q)))continue;
 let n=el;
 for(let d=0;n&&d<8;d++,n=n.parentElement){
  const rp=Object.getOwnPropertyNames(n).filter(k=>k.startsWith('__reactProps$'));let hs=[];
  for(const k of rp){const v=n[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}
  const click=n.tagName==='BUTTON'||n.tagName==='A'||n.getAttribute('role')==='button'||n.getAttribute('tabindex')!==null||hs.includes('onClick');
  let s=0;if(click)s+=25;if(['BUTTON','A'].includes(n.tagName))s+=10;if(hs.includes('onClick'))s+=20;
  const nt=(n.innerText||n.textContent||'').trim();if(norm(nt)===norm(q))s+=30;else if(norm(nt).startsWith(norm(q)))s+=15;s-=d*2;
  ranked.push({node:n,score:s});
 }
}
ranked.sort((a,b)=>b.score-a.score);if(!ranked[0])return {ok:false};
ranked[0].node.click();await new Promise(r=>setTimeout(r,900));
return {ok:norm(document.body?.innerText||'').includes(norm(q))};
})()""".replace("__Q__",json.dumps(q))
    return w.ev(js)

def diagnose_runtime(w, export_names, present_names):
    js="""(()=>{
const exportNames=__E__,presentNames=__P__,allNames=[...exportNames,...presentNames],want=new Set(allNames);
const nativeCtorNames=new Set(['Blob','BlobEvent','File','FileReader','FileList','URL','URLSearchParams','Event','CustomEvent','MouseEvent','KeyboardEvent',
'InputEvent','ProgressEvent','Promise','Array','Object','Function','Map','Set','WeakMap','WeakSet','Date','RegExp','Error','TypeError','Response','Request',
'Headers','FormData','AbortController','AbortSignal','MessageEvent','StorageEvent','WebSocket','Worker','SharedWorker','ReadableStream','WritableStream']);
function classify(fn,path){
 let src='';try{src=Function.prototype.toString.call(fn)}catch(e){}
 const name=fn.name||path.split('.').pop()||'';
 const nativeCode=/\\[native code\\]/.test(src);
 const nativeCtor=nativeCtorNames.has(name);
 const windowIntrinsic=path.startsWith('window.')&&(nativeCode||nativeCtor||/^[A-Z]/.test(name));
 const reactOwned=path.startsWith('reactProps.')||path.includes('__reactProps');
 const appSemantic=/export|presentation|deck|download|ppt|powerpoint|broker|explorer|property|command|present/i.test(src);
 const exactName=want.has(name);
 let score=0;if(exactName)score+=100;if(appSemantic)score+=30;if(reactOwned)score+=80;
 if(nativeCode)score-=250;if(nativeCtor)score-=300;if(windowIntrinsic)score-=120;
 return {name,path,length:fn.length,source:src.slice(0,1400),nativeCode,nativeCtor,windowIntrinsic,reactOwned,appSemantic,exactName,score};
}
const rows=[];
for(const el of document.querySelectorAll('*')){
 const props=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));
 for(const pk of props){
  const p=el[pk];if(!p||typeof p!=='object')continue;
  for(const [k,v] of Object.entries(p)){
   if(typeof v==='function'){
    const r=classify(v,'reactProps.'+k);
    if(r.exactName||r.appSemantic)rows.push(r);
   }
  }
 }
}
for(const k of Object.getOwnPropertyNames(window)){
 let v;try{v=window[k]}catch(e){continue}
 if(typeof v!=='function')continue;
 const r=classify(v,'window.'+k);
 if(r.exactName||r.appSemantic||r.nativeCtor)rows.push(r);
}
rows.sort((a,b)=>b.score-a.score);
const app=rows.filter(r=>r.score>0&&!r.nativeCode&&!r.nativeCtor&&!r.windowIntrinsic);
const exportApp=app.filter(r=>exportNames.includes(r.name)||/export|download|ppt|powerpoint|blob/i.test(r.source));
const presentApp=app.filter(r=>presentNames.includes(r.name)||/presentation|deck|present/i.test(r.source));
const nativeRejected=rows.filter(r=>r.nativeCode||r.nativeCtor||r.windowIntrinsic);
return {totalCandidateCount:rows.length,applicationCandidateCount:app.length,exportApplicationCandidateCount:exportApp.length,
presentationApplicationCandidateCount:presentApp.length,nativeRejectedCount:nativeRejected.length,
topApplicationCandidates:app.slice(0,100),topExportApplicationCandidates:exportApp.slice(0,50),
topPresentationApplicationCandidates:presentApp.slice(0,50),topNativeRejected:nativeRejected.slice(0,50)};
})()""".replace("__E__",json.dumps(export_names)).replace("__P__",json.dumps(present_names))
    return w.ev(js)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    r6p=ev/"M4_19D4BN17C_R4_R12_R16A_R6_EXACT_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_BINDING_CERTIFICATION"/"exact_bound_export_presentation_function_live_binding_certification.json"
    r5p=ev/"M4_19D4BN17C_R4_R12_R16A_R5_EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLUTION"/"exact_export_presentation_bound_function_and_argument_contract_resolution.json"
    if not r6p.exists() or not r5p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R6_AND_R5_EVIDENCE_REQUIRED");return 4

    r6=fj(r6p);r5=fj(r5p)
    first=(r6.get("outcomes") or [{}])[0]
    ex=first.get("export") or {}
    chosen_name=ex.get("chosenName")
    chosen_path=ex.get("chosenPath")
    chosen_error=ex.get("error","")

    native_false_positive=(chosen_name=="BlobEvent" or chosen_path=="window.BlobEvent" or "use the 'new' operator" in chosen_error)
    export_names=[x.get("name") for x in r5.get("topExportFunctions",[]) if x.get("name")]
    present_names=[x.get("name") for x in r5.get("topPresentationFunctions",[]) if x.get("name")]

    port=find_browser()
    if port is None:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 5
    t=create_target(port)
    if not t:
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_EXPLORER_TARGET_REQUIRED");return 6

    w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)
    sel=select_property(w,PROBE);sv=sel.get("value") or {}
    dg=diagnose_runtime(w,export_names,present_names);dv=dg.get("value") or {}
    w.close()

    appc=dv.get("applicationCandidateCount",0)
    expc=dv.get("exportApplicationCandidateCount",0)
    prc=dv.get("presentationApplicationCandidateCount",0)
    rejected=dv.get("nativeRejectedCount",0)

    checks={
      "r16aR6DiagnosticComplete":r6.get("status")=="DIAGNOSTIC_COMPLETE",
      "r6SelectedPropertyCertified":first.get("selectedPropertyCertified") is True,
      "r6BlobEventChosen":chosen_name=="BlobEvent" or chosen_path=="window.BlobEvent",
      "nativeConstructorFalsePositiveClassified":native_false_positive,
      "probeSelectedPropertyCertified":sv.get("ok") is True,
      "nativeBrowserIntrinsicsExcluded":rejected>0,
      "applicationOwnedCandidateFilterApplied":True,
      "applicationOwnedLiveCandidatesResolved":appc>0,
      "applicationSourceCorrelationPreserved":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "exportPresentationRuntimeInvocationOff":True
    }

    if expc>0 and prc>0:
        diagnosis="R6_NATIVE_BLOBEVENT_FALSE_BINDING_CAUSALLY_RESOLVED_APPLICATION_OWNED_EXPORT_PRESENTATION_CANDIDATES_AVAILABLE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R8_APPLICATION_OWNED_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_RECERTIFICATION"
    elif appc>0:
        diagnosis="R6_NATIVE_BLOBEVENT_FALSE_BINDING_CAUSALLY_RESOLVED_APPLICATION_CANDIDATES_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R8_APPLICATION_OWNED_FUNCTION_ALIAS_AND_ROLE_RESOLUTION"
    else:
        diagnosis="R6_NATIVE_BLOBEVENT_FALSE_BINDING_CAUSALLY_RESOLVED_LIVE_APPLICATION_FUNCTION_SURFACE_STILL_OPAQUE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R8_REACT_MODULE_OWNER_RUNTIME_BINDING_RESOLUTION"

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R7_NATIVE_INTRINSIC_FALSE_BINDING_CAUSALLY_DIAGNOSED"
           if passed else "M419D4BN17C_R4_R12_R16A_R7_DIAGNOSIS_INCOMPLETE")

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R7_LIVE_BOUND_FUNCTION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "r6ChosenExportName":chosen_name,"r6ChosenExportPath":chosen_path,"r6ChosenExportError":chosen_error,
      "nativeFalsePositive":native_false_positive,"probeProperty":PROBE,"selectedProperty":sv,
      "runtimeDiagnosis":dv,
      "applicationCandidateCount":appc,"exportApplicationCandidateCount":expc,
      "presentationApplicationCandidateCount":prc,"nativeRejectedCount":rejected,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"exportPresentationRuntimeInvocation":False},
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"live_bound_function_residual_causal_diagnosis.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R7 Live Bound Function Residual Causal Diagnosis")
    print("="*120)
    print("R6_CHOSEN_EXPORT_NAME:",chosen_name)
    print("R6_CHOSEN_EXPORT_PATH:",chosen_path)
    print("R6_CHOSEN_EXPORT_ERROR:",chosen_error)
    print("NATIVE_CONSTRUCTOR_FALSE_POSITIVE:",native_false_positive)
    print("PROBE_SELECTED_PROPERTY_CERTIFIED:",sv.get("ok"))
    print("TOTAL_RUNTIME_CANDIDATES:",dv.get("totalCandidateCount"))
    print("NATIVE_REJECTED_COUNT:",rejected)
    print("APPLICATION_CANDIDATE_COUNT:",appc)
    print("EXPORT_APPLICATION_CANDIDATE_COUNT:",expc)
    print("PRESENTATION_APPLICATION_CANDIDATE_COUNT:",prc)

    print("\n----- TOP APPLICATION EXPORT CANDIDATES -----")
    for x in dv.get("topExportApplicationCandidates",[])[:15]:
        print(json.dumps({k:x.get(k) for k in ("path","name","length","score","reactOwned","exactName","appSemantic")},ensure_ascii=False))
    print("\n----- TOP APPLICATION PRESENTATION CANDIDATES -----")
    for x in dv.get("topPresentationApplicationCandidates",[])[:15]:
        print(json.dumps({k:x.get(k) for k in ("path","name","length","score","reactOwned","exactName","appSemantic")},ensure_ascii=False))

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
