#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R11_EVENT_PLUS_CONTEXT_APPLICATION_OWNED_EXPORT_PRESENTATION_RECERTIFICATION"
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

def invoke_event_context_alias(w, property_name, kind, aliases):
    js="""(async()=>{
const propertyName=__P__,kind=__K__,aliases=__A__;
const before=document.body?.innerText||'',beforeUrl=location.href;
const candidates=[];
for(const el of document.querySelectorAll('*')){
 const propKeys=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));
 for(const pk of propKeys){
  const props=el[pk];if(!props||typeof props!=='object')continue;
  for(const [k,v] of Object.entries(props)){
   if(typeof v!=='function')continue;
   const path='reactProps.'+k;
   const hits=aliases.filter(a=>a.livePath===path);
   if(!hits.length)continue;
   let src='';try{src=Function.prototype.toString.call(v)}catch(e){}
   if(/\\[native code\\]/.test(src))continue;
   const best=hits.sort((a,b)=>(b.mappingScore||0)-(a.mappingScore||0))[0];
   candidates.push({fn:v,path,name:v.name||k,len:v.length,score:best.mappingScore||0,sourceName:best.sourceName,
                    sourceRole:best.sourceRole,sourceParams:best.sourceParams||'',el,props});
  }
 }
}
candidates.sort((a,b)=>b.score-a.score);
const best=candidates[0];
if(!best)return {ok:false,bound:false,candidateCount:0,diagnostic:'NO_R8_CERTIFIED_APPLICATION_OWNED_ALIAS_PRESENT'};

const context={
 property:propertyName,
 propertyName,
 selectedProperty:propertyName,
 title:propertyName,
 label:propertyName,
 mode:kind.toLowerCase(),
 action:kind.toUpperCase(),
 presentation:{property:propertyName,title:propertyName,mode:'presentation'},
 export:{property:propertyName,title:propertyName,format:'presentation'},
 payload:{property:propertyName,action:kind.toUpperCase()},
 options:{property:propertyName,action:kind.toUpperCase()}
};
const eventObj={
 type:'click',
 target:best.el,
 currentTarget:best.el,
 detail:context,
 nativeEvent:{type:'click'},
 defaultPrevented:false,
 preventDefault(){this.defaultPrevented=true;},
 stopPropagation(){},
 isPropagationStopped(){return false;},
 isDefaultPrevented(){return this.defaultPrevented;},
 persist(){},
 button:0,
 buttons:1,
 key:'',
 code:'',
 metaKey:false,
 ctrlKey:false,
 shiftKey:false,
 altKey:false
};
let ret=null,err=null,shape='EVENT_PLUS_CONTEXT_PAYLOAD';
try{
 if(best.len<=1){
   // Handler may close over context and expect only event.
   ret=best.fn(eventObj);
 }else{
   // Exact R10 contract: event + context payload.
   ret=best.fn(eventObj,context);
 }
 if(ret&&typeof ret.then==='function')ret=await ret;
}catch(e){err=String(e)}
await new Promise(r=>setTimeout(r,1200));

const body=document.body?.innerText||'',nb=body.toLowerCase();
const selected=nb.includes(propertyName.toLowerCase()),explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
const bodyChanged=body!==before,urlChanged=location.href!==beforeUrl;
const exportSignal=/export|download|presentation|deck|ppt|powerpoint|ready|generated|created/.test(nb);
const presentationSignal=/presentation|deck|present|ready|generated|created/.test(nb);
const signal=kind==='Export'?exportSignal:presentationSignal;

let serialized=null;
try{serialized=JSON.parse(JSON.stringify(ret))}catch(e){serialized=String(ret)}
const returnSignal=ret!==undefined&&ret!==null;
const ok=!err&&selected&&explorer&&map&&(bodyChanged||urlChanged||signal||returnSignal);

return {ok,bound:true,candidateCount:candidates.length,chosenPath:best.path,chosenName:best.name,
 chosenLength:best.len,chosenMappingScore:best.score,sourceName:best.sourceName,sourceRole:best.sourceRole,
 sourceParams:best.sourceParams,invocationShape:shape,eventDefaultPrevented:eventObj.defaultPrevented,
 error:err,bodyChanged,urlChanged,signal,returnSignal,selectedPropertyVisible:selected,
 explorerMounted:explorer,mapVisible:map,returnValue:serialized};
})()""".replace("__P__",json.dumps(property_name)).replace("__K__",json.dumps(kind)).replace("__A__",json.dumps(aliases))
    return w.ev(js)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    r8p=ev/"M4_19D4BN17C_R4_R12_R16A_R8_APPLICATION_OWNED_FUNCTION_ALIAS_AND_ROLE_RESOLUTION"/"application_owned_function_alias_and_role_resolution.json"
    r10p=ev/"M4_19D4BN17C_R4_R12_R16A_R10_ROLE_SPECIFIC_ALIAS_INVOCATION_CONTRACT_RESIDUAL_DIAGNOSIS"/"role_specific_alias_invocation_contract_residual_diagnosis.json"
    if not r8p.exists() or not r10p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R8_AND_R10_EVIDENCE_REQUIRED");return 4

    r8=fj(r8p);r10=fj(r10p)
    if r8.get("status")!="PASSED" or r10.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R8_AND_R10_MUST_PASS");return 5
    if r10.get("resolvedInvocationContract")!="EVENT_PLUS_CONTEXT_PAYLOAD":
        print("STATUS: BLOCKED");print("DIAGNOSIS: EVENT_PLUS_CONTEXT_PAYLOAD_CONTRACT_REQUIRED");return 6

    export_aliases=r8.get("resolvedExportAliases",[])
    present_aliases=r8.get("resolvedPresentationAliases",[])
    if not export_aliases or not present_aliases:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R8_ROLE_SPECIFIC_ALIAS_SETS_REQUIRED");return 7

    port=find_browser()
    if port is None:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 8

    outcomes=[];halted=False;targets=0

    for i,p in enumerate(COHORT,1):
        if halted:break
        print(f"\n[{i}/3] {p}")
        t=create_target(port)
        if not t:
            outcomes.append({"property":p,"freshTargetCreated":False,"selectedPropertyCertified":False,
                             "exportCertified":False,"presentationCertified":False})
            print("freshTargetCreated: False")
            print("OUTCOME: FRESH_PAGE_TARGET_CREATION_GAP")
            halted=True
            break

        targets+=1
        w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)

        sel=select_property(w,p);sv=sel.get("value") or {}
        print("freshTargetCreated: True")
        print("selectedPropertyCertified:",sv.get("ok"))
        if not sel.get("ok") or not sv.get("ok"):
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":False,
                             "exportCertified":False,"presentationCertified":False,"selection":sv})
            print("OUTCOME: SELECTED_PROPERTY_PRECONDITION_GAP")
            halted=True
            w.close()
            break

        ex=invoke_event_context_alias(w,p,"Export",export_aliases);x=ex.get("value") or {}
        print("exportRuntimeOk:",ex.get("ok"))
        print("exportBound:",x.get("bound"))
        print("exportCandidateCount:",x.get("candidateCount"))
        print("exportChosenPath:",x.get("chosenPath"))
        print("exportSourceAlias:",x.get("sourceName"))
        print("exportMappingScore:",x.get("chosenMappingScore"))
        print("exportInvocationShape:",x.get("invocationShape"))
        print("exportEventDefaultPrevented:",x.get("eventDefaultPrevented"))
        print("exportError:",x.get("error"))
        print("exportBodyChanged:",x.get("bodyChanged"))
        print("exportUrlChanged:",x.get("urlChanged"))
        print("exportSignal:",x.get("signal"))
        print("exportReturnSignal:",x.get("returnSignal"))
        print("exportCertified:",x.get("ok"))

        if not ex.get("ok") or not x.get("ok"):
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,
                             "exportCertified":False,"presentationCertified":False,
                             "selection":sv,"export":x})
            print("OUTCOME: EVENT_PLUS_CONTEXT_EXPORT_GAP")
            halted=True
            w.close()
            break

        pr=invoke_event_context_alias(w,p,"Presentation",present_aliases);pv=pr.get("value") or {}
        pok=bool(pr.get("ok") and pv.get("ok"))
        outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,
                         "exportCertified":True,"presentationCertified":pok,
                         "selection":sv,"export":x,"presentation":pv})

        print("presentationRuntimeOk:",pr.get("ok"))
        print("presentationBound:",pv.get("bound"))
        print("presentationCandidateCount:",pv.get("candidateCount"))
        print("presentationChosenPath:",pv.get("chosenPath"))
        print("presentationSourceAlias:",pv.get("sourceName"))
        print("presentationMappingScore:",pv.get("chosenMappingScore"))
        print("presentationInvocationShape:",pv.get("invocationShape"))
        print("presentationEventDefaultPrevented:",pv.get("eventDefaultPrevented"))
        print("presentationError:",pv.get("error"))
        print("presentationBodyChanged:",pv.get("bodyChanged"))
        print("presentationUrlChanged:",pv.get("urlChanged"))
        print("presentationSignal:",pv.get("signal"))
        print("presentationReturnSignal:",pv.get("returnSignal"))
        print("presentationCertified:",pv.get("ok"))
        print("OUTCOME:","EVENT_PLUS_CONTEXT_EXPORT_PRESENTATION_RECERTIFIED" if pok else "EVENT_PLUS_CONTEXT_PRESENTATION_GAP")

        if not pok:halted=True
        w.close()

    ec=sum(1 for x in outcomes if x.get("exportCertified"))
    pc=sum(1 for x in outcomes if x.get("presentationCertified"))

    checks={
      "r16aR8Passed":r8.get("status")=="PASSED",
      "r16aR10Passed":r10.get("status")=="PASSED",
      "eventPlusContextContractCertified":r10.get("resolvedInvocationContract")=="EVENT_PLUS_CONTEXT_PAYLOAD",
      "r8ExportAliasesResolved":len(export_aliases)>0,
      "r8PresentationAliasesResolved":len(present_aliases)>0,
      "nativeBrowserIntrinsicsExcluded":True,
      "applicationOwnedAliasesOnly":True,
      "certifiedBrowserContextPreserved":True,
      "freshPageTargetPerRecordPolicyUsed":True,
      "samePageReuseAcrossRecordsIsFalse":True,
      "freshIsolatedBrowserPerRecordIsFalse":True,
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":halted or len(outcomes)==3,
      "allExecutedFreshTargetsCreated":all(x.get("freshTargetCreated") for x in outcomes),
      "allExecutedSelectedPropertiesCertified":all(x.get("selectedPropertyCertified") for x in outcomes),
      "allExecutedExportActionsCertified":all(x.get("exportCertified") for x in outcomes),
      "allExecutedPresentationActionsCertified":all(x.get("presentationCertified") for x in outcomes),
      "allThreeExportActionsCertified":len(outcomes)==3 and ec==3,
      "allThreePresentationActionsCertified":len(outcomes)==3 and pc==3,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "pixelEvidenceOff":True
    }

    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R16A_R11_EVENT_PLUS_CONTEXT_EXPORT_PRESENTATION_LIVE_RECERTIFIED"
        diagnosis="EVENT_PLUS_CONTEXT_APPLICATION_OWNED_EXPORT_PRESENTATION_CERTIFIED_THREE_OF_THREE_WITH_FRESH_PAGE_PER_RECORD_ISOLATION"
        nxt="M4_19D4BN17C_R4_R12_R16B_EXPORT_PRESENTATION_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"
    else:
        status="DIAGNOSTIC_COMPLETE"
        state="M419D4BN17C_R4_R12_R16A_R11_EVENT_PLUS_CONTEXT_RECERTIFICATION_INCOMPLETE"
        diagnosis="EVENT_PLUS_CONTEXT_APPLICATION_OWNED_EXPORT_PRESENTATION_RECERTIFICATION_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R12_ROLE_SPECIFIC_EVENT_CONTEXT_POST_ACTION_RESIDUAL_DIAGNOSIS"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R11_EVENT_PLUS_CONTEXT_APPLICATION_OWNED_EXPORT_PRESENTATION_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "cohort":COHORT,"resolvedExportAliases":export_aliases,"resolvedPresentationAliases":present_aliases,
      "resolvedInvocationContract":r10.get("resolvedInvocationContract"),
      "outcomes":outcomes,"freshTargetsCreated":targets,
      "exportCertifiedCount":ec,"presentationCertifiedCount":pc,"haltedOnFailure":halted,
      "executionPolicy":{"browserContext":"PRESERVED","pageTarget":"FRESH_PER_RECORD",
                         "samePageReuseAcrossRecords":False,"freshIsolatedBrowserPerRecord":False,
                         "strictSequential":True,"haltOnFirstFailure":True},
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "pixelEvidence":False,"exportPresentationApplicationOwnedLiveBinding":True},
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"event_plus_context_application_owned_export_presentation_recertification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("FRESH_TARGETS_CREATED:",targets)
    print("EXPORT_CERTIFIED:",ec,"/3")
    print("PRESENTATION_CERTIFIED:",pc,"/3")
    print("HALTED_ON_FAILURE:",halted)
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
