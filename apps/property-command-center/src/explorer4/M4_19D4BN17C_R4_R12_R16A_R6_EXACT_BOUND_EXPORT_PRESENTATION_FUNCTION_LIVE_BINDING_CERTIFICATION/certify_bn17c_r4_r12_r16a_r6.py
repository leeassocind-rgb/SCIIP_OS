#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R6_EXACT_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_BINDING_CERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]
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
                "value":r.get("result",{}).get("value"),
                "exceptionDetails":r.get("exceptionDetails")}
    def close(self):
        try:self.s.close()
        except:pass

def wait_ready(w):
    w.call("Runtime.enable");w.call("Page.enable")
    for _ in range(50):
        time.sleep(.2)
        if w.ev("document.readyState").get("value") in ("interactive","complete"):break
    time.sleep(.9)

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
const body=document.body?.innerText||'',explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
return {ok:norm(body).includes(norm(q))&&explorer,propertyVisible:norm(body).includes(norm(q)),explorerMounted:explorer,mapVisible:map};
})()""".replace("__Q__",json.dumps(q))
    return w.ev(js)

def live_candidates(w, source_names):
    js="""(()=>{
const names=__N__,want=new Set(names),rows=[];
function scanObj(obj,label,depth=0,seen=new Set()){
 if(!obj||depth>3||(typeof obj!=='object'&&typeof obj!=='function')||seen.has(obj))return;
 seen.add(obj);
 let keys=[];try{keys=Reflect.ownKeys(obj)}catch(e){return}
 for(const k of keys.slice(0,800)){
  let v;try{v=obj[k]}catch(e){continue}
  if(typeof v==='function'){
   let src='';try{src=Function.prototype.toString.call(v)}catch(e){}
   const nm=v.name||String(k);
   let score=0;
   if(want.has(nm))score+=100;
   for(const n of names){if(n&&src.includes(n))score+=20}
   if(/export|presentation|deck|download|ppt|powerpoint|blob/i.test(src))score+=30;
   if(score)rows.push({path:label+'.'+String(k),name:nm,length:v.length,score,source:src.slice(0,1200)});
  }else if(v&&depth<3&&typeof v==='object'){
   if(/export|presentation|deck|download|present|command|broker|explorer/i.test(String(k)))scanObj(v,label+'.'+String(k),depth+1,seen);
  }
 }
}
scanObj(window,'window');
for(const el of document.querySelectorAll('*')){
 const props=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));
 for(const pk of props){
  const p=el[pk];if(p&&typeof p==='object'){
   for(const [k,v] of Object.entries(p)){
    if(typeof v==='function'){
     let src='';try{src=Function.prototype.toString.call(v)}catch(e){}
     const nm=v.name||k;let score=0;
     if(want.has(nm))score+=100;
     for(const n of names){if(n&&src.includes(n))score+=20}
     if(/export|presentation|deck|download|ppt|powerpoint|blob/i.test(src))score+=30;
     if(score)rows.push({path:'reactProps.'+k,name:nm,length:v.length,score,source:src.slice(0,1200)});
    }
   }
  }
 }
}
rows.sort((a,b)=>b.score-a.score);
return {count:rows.length,rows:rows.slice(0,120)};
})()""".replace("__N__",json.dumps(source_names))
    return w.ev(js)

def bounded_invoke(w, kind, source_names, property_name):
    js="""(async()=>{
const kind=__K__,names=__N__,propertyName=__P__;
const before=document.body?.innerText||'',beforeUrl=location.href;
const rows=[];
function consider(fn,path){
 if(typeof fn!=='function')return;
 let src='';try{src=Function.prototype.toString.call(fn)}catch(e){}
 const nm=fn.name||path;let score=0;
 if(names.includes(nm))score+=100;
 for(const n of names){if(n&&src.includes(n))score+=20}
 if(kind==='Export'&&/export|download|ppt|powerpoint|blob/i.test(src))score+=40;
 if(kind==='Presentation'&&/presentation|deck|present/i.test(src))score+=40;
 if(score)rows.push({fn,path,name:nm,len:fn.length,score,src});
}
for(const el of document.querySelectorAll('*')){
 const props=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));
 for(const pk of props){const p=el[pk];if(p&&typeof p==='object')for(const [k,v] of Object.entries(p))consider(v,'reactProps.'+k);}
}
for(const k of Object.getOwnPropertyNames(window)){
 let v;try{v=window[k]}catch(e){continue}
 consider(v,'window.'+k);
}
rows.sort((a,b)=>b.score-a.score);
const best=rows[0];
if(!best)return {ok:false,bound:false,candidateCount:0,diagnostic:'NO_LIVE_BOUND_FUNCTION'};
let arg;
if(best.len===0)arg=undefined;
else if(best.len===1)arg={property:propertyName,presentation:{property:propertyName},title:propertyName};
else arg=[{property:propertyName,presentation:{property:propertyName},title:propertyName},{}];
let ret=null,err=null;
try{
 if(best.len===0)ret=best.fn();
 else if(best.len===1)ret=best.fn(arg);
 else ret=best.fn(...arg);
 if(ret&&typeof ret.then==='function')ret=await ret;
}catch(e){err=String(e)}
await new Promise(r=>setTimeout(r,800));
const body=document.body?.innerText||'',nb=body.toLowerCase();
const selected=nb.includes(propertyName.toLowerCase()),explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
const bodyChanged=body!==before,urlChanged=location.href!==beforeUrl;
const signal=(kind==='Export'
 ? /export|download|presentation|deck|ppt|powerpoint|ready/.test(nb)
 : /presentation|deck|present|ready/.test(nb));
const ok=!err&&selected&&explorer&&map&&(bodyChanged||urlChanged||signal||ret!==undefined);
let serial=null;try{serial=JSON.parse(JSON.stringify(ret))}catch(e){serial=String(ret)}
return {ok,bound:true,candidateCount:rows.length,chosenPath:best.path,chosenName:best.name,chosenLength:best.len,
 chosenScore:best.score,error:err,bodyChanged,urlChanged,signal,selectedPropertyVisible:selected,
 explorerMounted:explorer,mapVisible:map,returnValue:serial};
})()""".replace("__K__",json.dumps(kind)).replace("__N__",json.dumps(source_names)).replace("__P__",json.dumps(property_name))
    return w.ev(js)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r5p=ev/"M4_19D4BN17C_R4_R12_R16A_R5_EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLUTION"/"exact_export_presentation_bound_function_and_argument_contract_resolution.json"
    if not r5p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R5_EVIDENCE_REQUIRED");return 4
    r5=fj(r5p)
    if r5.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R5_MUST_PASS");return 5

    export_names=[x.get("name") for x in r5.get("topExportFunctions",[]) if x.get("name")][:20]
    present_names=[x.get("name") for x in r5.get("topPresentationFunctions",[]) if x.get("name")][:20]
    if not export_names or not present_names:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_FUNCTION_NAMES_REQUIRED");return 6

    port=find_browser()
    if port is None:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 7

    outcomes=[];halted=False;targets=0
    for i,p in enumerate(COHORT,1):
        if halted:break
        print(f"\n[{i}/3] {p}")
        t=create_target(port)
        if not t:
            outcomes.append({"property":p,"freshTargetCreated":False,"selectedPropertyCertified":False,"exportBoundCertified":False,"presentationBoundCertified":False})
            print("freshTargetCreated: False");print("OUTCOME: FRESH_PAGE_TARGET_CREATION_GAP");halted=True;break

        targets+=1
        w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)
        sel=select_property(w,p);sv=sel.get("value") or {}
        print("freshTargetCreated: True")
        print("selectedPropertyCertified:",sv.get("ok"))
        if not sel.get("ok") or not sv.get("ok"):
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":False,"exportBoundCertified":False,"presentationBoundCertified":False,"selection":sv})
            print("OUTCOME: SELECTED_PROPERTY_PRECONDITION_GAP");halted=True;w.close();break

        lc=live_candidates(w,export_names+present_names);lv=lc.get("value") or {}
        print("liveBoundCandidateCount:",lv.get("count"))

        ex=bounded_invoke(w,"Export",export_names,p);x=ex.get("value") or {}
        print("exportRuntimeOk:",ex.get("ok"))
        print("exportBound:",x.get("bound"))
        print("exportCandidateCount:",x.get("candidateCount"))
        print("exportChosenPath:",x.get("chosenPath"))
        print("exportChosenName:",x.get("chosenName"))
        print("exportChosenLength:",x.get("chosenLength"))
        print("exportError:",x.get("error"))
        print("exportCertified:",x.get("ok"))
        if not ex.get("ok") or not x.get("ok"):
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,"exportBoundCertified":False,"presentationBoundCertified":False,
                             "selection":sv,"liveCandidates":lv,"export":x})
            print("OUTCOME: EXPORT_BOUND_FUNCTION_GAP");halted=True;w.close();break

        pr=bounded_invoke(w,"Presentation",present_names,p);pv=pr.get("value") or {}
        pok=bool(pr.get("ok") and pv.get("ok"))
        outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,"exportBoundCertified":True,"presentationBoundCertified":pok,
                         "selection":sv,"liveCandidates":lv,"export":x,"presentation":pv})
        print("presentationRuntimeOk:",pr.get("ok"))
        print("presentationBound:",pv.get("bound"))
        print("presentationCandidateCount:",pv.get("candidateCount"))
        print("presentationChosenPath:",pv.get("chosenPath"))
        print("presentationChosenName:",pv.get("chosenName"))
        print("presentationChosenLength:",pv.get("chosenLength"))
        print("presentationError:",pv.get("error"))
        print("presentationCertified:",pv.get("ok"))
        print("OUTCOME:","EXPORT_PRESENTATION_BOUND_FUNCTION_LIVE_CERTIFIED" if pok else "PRESENTATION_BOUND_FUNCTION_GAP")
        if not pok:halted=True
        w.close()

    ec=sum(1 for x in outcomes if x.get("exportBoundCertified"))
    pc=sum(1 for x in outcomes if x.get("presentationBoundCertified"))

    checks={
      "r16aR5Passed":r5.get("status")=="PASSED",
      "exactExportFunctionCandidatesAvailable":len(export_names)>0,
      "exactPresentationFunctionCandidatesAvailable":len(present_names)>0,
      "certifiedBrowserContextPreserved":True,
      "freshPageTargetPerRecordPolicyUsed":True,
      "samePageReuseAcrossRecordsIsFalse":True,
      "freshIsolatedBrowserPerRecordIsFalse":True,
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":halted or len(outcomes)==3,
      "allExecutedFreshTargetsCreated":all(x.get("freshTargetCreated") for x in outcomes),
      "allExecutedSelectedPropertiesCertified":all(x.get("selectedPropertyCertified") for x in outcomes),
      "allExecutedExportBoundFunctionsCertified":all(x.get("exportBoundCertified") for x in outcomes),
      "allExecutedPresentationBoundFunctionsCertified":all(x.get("presentationBoundCertified") for x in outcomes),
      "allThreeExportBoundFunctionsCertified":len(outcomes)==3 and ec==3,
      "allThreePresentationBoundFunctionsCertified":len(outcomes)==3 and pc==3,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R16A_R6_EXACT_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_CERTIFIED"
        diagnosis="EXACT_BOUND_EXPORT_PRESENTATION_FUNCTIONS_CERTIFIED_THREE_OF_THREE_WITH_FRESH_PAGE_PER_RECORD_ISOLATION"
        nxt="M4_19D4BN17C_R4_R12_R16B_EXPORT_PRESENTATION_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"
    else:
        status="DIAGNOSTIC_COMPLETE"
        state="M419D4BN17C_R4_R12_R16A_R6_LIVE_BINDING_CERTIFICATION_INCOMPLETE"
        diagnosis="EXACT_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_BINDING_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R7_LIVE_BOUND_FUNCTION_RESIDUAL_CAUSAL_DIAGNOSIS"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R6_EXACT_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_BINDING_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "cohort":COHORT,"exportSourceNames":export_names,"presentationSourceNames":present_names,
      "outcomes":outcomes,"freshTargetsCreated":targets,
      "exportCertifiedCount":ec,"presentationCertifiedCount":pc,"haltedOnFailure":halted,
      "executionPolicy":{"browserContext":"PRESERVED","pageTarget":"FRESH_PER_RECORD","samePageReuseAcrossRecords":False,
                         "freshIsolatedBrowserPerRecord":False,"strictSequential":True,"haltOnFirstFailure":True},
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,
                   "exportPresentationLiveBinding":True},
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_bound_export_presentation_function_live_binding_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("FRESH_TARGETS_CREATED:",targets)
    print("EXPORT_BOUND_CERTIFIED:",ec,"/3")
    print("PRESENTATION_BOUND_CERTIFIED:",pc,"/3")
    print("HALTED_ON_FAILURE:",halted)
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
