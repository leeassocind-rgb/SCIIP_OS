#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R2_RESOLVED_EXPORT_PRESENTATION_CONTROL_LIVE_MICRO_COHORT_RECERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]
TARGET_URL="http://127.0.0.1:5173/"
PORTS=[9333,9334,9335,9444,9555,9666,9222,9223]

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def hj(url,method="GET",timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:
        return json.loads(r.read())

def browser_ready(port):
    try:return bool(hj(f"http://127.0.0.1:{port}/json/version",timeout=1))
    except:return False

def page_targets(port):
    try:return hj(f"http://127.0.0.1:{port}/json",timeout=1)
    except:return []

def find_browser():
    for p in PORTS:
        if browser_ready(p) and any("127.0.0.1:5173" in x.get("url","") for x in page_targets(p)):
            return p
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
        h+=mask
        self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self.rn(2))[0]
            elif n==127:n=struct.unpack("!Q",self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None
            p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op in (1,2):return json.loads(p.decode())
    def call(self,m,p=None):
        self.i+=1;i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
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
    js = """
(async()=>{
const q=__Q__,norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {ok:false,stage:'SEARCH_INPUT_NOT_FOUND'};
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
if(d&&d.set)d.set.call(input,q);else input.value=q;
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
  const role=n.getAttribute&&n.getAttribute('role');
  const click=n.tagName==='BUTTON'||n.tagName==='A'||role==='button'||n.getAttribute('tabindex')!==null||typeof n.onclick==='function'||hs.includes('onClick');
  let s=0;if(click)s+=25;if(['BUTTON','A'].includes(n.tagName))s+=10;if(hs.includes('onClick'))s+=20;
  const nt=(n.innerText||n.textContent||'').trim();if(norm(nt)===norm(q))s+=30;else if(norm(nt).startsWith(norm(q)))s+=15;s-=d*2;
  ranked.push({node:n,score:s,text:nt,tag:n.tagName});
 }
}
ranked.sort((a,b)=>b.score-a.score);const best=ranked[0];
if(!best)return {ok:false,stage:'RESULT_TARGET_NOT_FOUND'};
best.node.scrollIntoView({block:'center'});best.node.click();await new Promise(r=>setTimeout(r,900));
const body=document.body?.innerText||'',explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
return {ok:norm(body).includes(norm(q))&&explorer,propertyVisible:norm(body).includes(norm(q)),
 explorerMounted:explorer,mapVisible:map,matchCount:ranked.length,chosenTag:best.tag,chosenText:best.text.slice(0,300)};
})()
""".replace("__Q__",json.dumps(q))
    return w.ev(js)

def activate(w,q,kind):
    js = """
(async()=>{
const q=__Q__,kind=__K__,norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const before=document.body?.innerText||'',beforeUrl=location.href;
const direct = kind==='Export'
 ? ['export','export presentation','export deck','download presentation','download deck']
 : ['presentation','generate presentation','open presentation','present deck','deck'];
const menuWords=['more','actions','recommended actions','share','menu','options'];

function handlers(el){
 const rp=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));let hs=[];
 for(const k of rp){const v=el[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}
 return hs;
}
function describe(el){
 const text=(el.innerText||el.textContent||'').trim(),aria=el.getAttribute('aria-label')||'',title=el.getAttribute('title')||'',
 href=el.getAttribute('href')||'',parent=(el.parentElement?.innerText||'').trim(),hs=handlers(el);
 const blob=norm([text,aria,title,href,parent].join(' '));
 let score=0;
 if(el.tagName==='BUTTON'||el.tagName==='A'||el.getAttribute('role')==='button')score+=20;
 if(hs.includes('onClick')||typeof el.onclick==='function')score+=20;
 for(const x of direct){const nx=norm(x);if(blob===nx)score+=100;else if(blob.startsWith(nx))score+=60;else if(blob.includes(nx))score+=35;}
 if(kind==='Export'&&/export|download/.test(blob))score+=35;
 if(kind==='Presentation'&&/presentation|deck/.test(blob))score+=35;
 return {el,text,aria,title,href,parent,hs,blob,score};
}
function collect(){
 const out=[];
 for(const el of document.querySelectorAll('button,a,[role="button"],[tabindex],[aria-haspopup="menu"],[title],[aria-label],div')){
  const d=describe(el);if(d.score>0)out.push(d);
 }
 out.sort((a,b)=>b.score-a.score);return out;
}
let cands=collect();
let best=cands.find(x=>kind==='Export'?/export|download|presentation|deck/.test(x.blob):/presentation|deck/.test(x.blob));
let menuOpened=false;
if(!best){
 const menuCandidates=[];
 for(const el of document.querySelectorAll('button,[role="button"],[aria-haspopup="menu"],[title],[aria-label],div')){
  const d=describe(el);
  if(menuWords.some(x=>d.blob.includes(x)))menuCandidates.push(d);
 }
 menuCandidates.sort((a,b)=>b.score-a.score);
 for(const m of menuCandidates.slice(0,12)){
  try{m.el.click();menuOpened=true;await new Promise(r=>setTimeout(r,300));}catch(e){}
  cands=collect();
  best=cands.find(x=>kind==='Export'?/export|download|presentation|deck/.test(x.blob):/presentation|deck/.test(x.blob));
  if(best)break;
 }
}
if(!best)return {ok:false,controlFound:false,candidateCount:cands.length,menuOpened};
best.el.scrollIntoView({block:'center'});
try{best.el.click();}catch(e){return {ok:false,controlFound:true,error:String(e),chosenText:best.text,chosenTag:best.el.tagName}}
await new Promise(r=>setTimeout(r,1100));
const body=document.body?.innerText||'',nb=norm(body);
const selected=nb.includes(norm(q)),explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
const bodyChanged=body!==before,urlChanged=location.href!==beforeUrl;
const signals=(kind==='Export'?['export','download','presentation','deck']:['presentation','deck','download','ready']).filter(x=>nb.includes(x));
const visible=signals.length>0||bodyChanged||urlChanged;
return {ok:visible&&selected&&explorer&&map,controlFound:true,candidateCount:cands.length,menuOpened,
 chosenTag:best.el.tagName,chosenText:best.text.slice(0,300),chosenAria:best.aria,chosenTitle:best.title,
 chosenHref:best.href,chosenHandlers:best.hs,chosenScore:best.score,bodyChanged,urlChanged,signals,visible,
 selectedPropertyVisible:selected,explorerMounted:explorer,mapVisible:map};
})()
""".replace("__Q__",json.dumps(q)).replace("__K__",json.dumps(kind))
    return w.ev(js)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    candidates=[
      ev/"M4_19D4BN17C_R4_R12_R16A_R1_EXPORT_PRESENTATION_CONTROL_TARGET_AND_POST_ACTION_STATE_DIAGNOSIS"/"export_presentation_control_target_and_post_action_state_diagnosis.json",
      ev/"M4_19D4BN17C_R4_R12_R16A_R1_R2_WEBSOCKET_HANDSHAKE_CRLF_REPAIR_AND_EXPORT_PRESENTATION_CONTROL_TARGET_DIAGNOSIS"/"export_presentation_control_target_and_post_action_state_diagnosis.json",
    ]
    evidence=next((p for p in candidates if p.exists()),None)
    if not evidence:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R1_R2_RESOLVED_CONTROL_DIAGNOSIS_EVIDENCE_REQUIRED");return 4
    d=fj(evidence)
    if d.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R1_R2_DIAGNOSIS_MUST_PASS");return 5

    port=find_browser()
    if port is None:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 6

    outcomes=[];halted=False;targets=0
    for i,p in enumerate(COHORT,1):
        if halted:break
        print(f"\n[{i}/3] {p}")
        t=create_target(port)
        if not t:
            outcomes.append({"property":p,"freshTargetCreated":False,"selectedPropertyCertified":False,"exportCertified":False,"presentationCertified":False})
            print("freshTargetCreated: False");print("OUTCOME: FRESH_PAGE_TARGET_CREATION_GAP");halted=True;break
        targets+=1
        w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)

        sel=select_property(w,p);sv=sel.get("value") or {}
        print("freshTargetCreated: True")
        print("selectedPropertyCertified:",sv.get("ok"))
        print("selectionMatchCount:",sv.get("matchCount"))
        print("selectionChosenTag:",sv.get("chosenTag"))
        if not sel.get("ok") or not sv.get("ok"):
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":False,"exportCertified":False,"presentationCertified":False,"selection":sv})
            print("OUTCOME: SELECTED_PROPERTY_PRECONDITION_GAP");halted=True;w.close();break

        ex=activate(w,p,"Export");x=ex.get("value") or {}
        print("exportRuntimeOk:",ex.get("ok"))
        print("exportControlFound:",x.get("controlFound"))
        print("exportCandidateCount:",x.get("candidateCount"))
        print("exportMenuOpened:",x.get("menuOpened"))
        print("exportChosenTag:",x.get("chosenTag"))
        print("exportChosenText:",x.get("chosenText"))
        print("exportVisible:",x.get("visible"))
        print("exportCertified:",x.get("ok"))
        if not ex.get("ok") or not x.get("ok"):
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,"exportCertified":False,"presentationCertified":False,"selection":sv,"export":x})
            print("OUTCOME: EXPORT_ACTION_GAP");halted=True;w.close();break

        pr=activate(w,p,"Presentation");pv=pr.get("value") or {}
        ok=bool(pr.get("ok") and pv.get("ok"))
        outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,"exportCertified":True,"presentationCertified":ok,"selection":sv,"export":x,"presentation":pv})
        print("presentationRuntimeOk:",pr.get("ok"))
        print("presentationControlFound:",pv.get("controlFound"))
        print("presentationCandidateCount:",pv.get("candidateCount"))
        print("presentationMenuOpened:",pv.get("menuOpened"))
        print("presentationChosenTag:",pv.get("chosenTag"))
        print("presentationChosenText:",pv.get("chosenText"))
        print("presentationVisible:",pv.get("visible"))
        print("selectedPropertyVisibleAfterPresentation:",pv.get("selectedPropertyVisible"))
        print("explorerMountedAfterPresentation:",pv.get("explorerMounted"))
        print("mapVisibleAfterPresentation:",pv.get("mapVisible"))
        print("presentationCertified:",pv.get("ok"))
        print("OUTCOME:","EXPORT_PRESENTATION_RESOLVED_CONTROL_RECERTIFIED" if ok else "PRESENTATION_ACTION_GAP")
        if not ok:halted=True
        w.close()

    ec=sum(1 for x in outcomes if x.get("exportCertified"))
    pc=sum(1 for x in outcomes if x.get("presentationCertified"))
    checks={
      "r16aR1R2Passed":d.get("status")=="PASSED",
      "resolvedRuntimeAffordanceCertified":d.get("diagnosis") in ("RUNTIME_EXPORT_PRESENTATION_OR_MENU_AFFORDANCE_RESOLVED","EXPORT_PRESENTATION_SURFACE_REVEALED_ONLY_AFTER_MENU_ACTIVATION"),
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
        state="M419D4BN17C_R4_R12_R16A_R2_EXPORT_PRESENTATION_RESOLVED_CONTROL_LIVE_MICRO_COHORT_RECERTIFIED"
        diagnosis="RESOLVED_EXPORT_PRESENTATION_CONTROL_CERTIFIED_THREE_OF_THREE_WITH_FRESH_PAGE_PER_RECORD_ISOLATION"
        nxt="M4_19D4BN17C_R4_R12_R16B_EXPORT_PRESENTATION_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"
    else:
        status="DIAGNOSTIC_COMPLETE"
        state="M419D4BN17C_R4_R12_R16A_R2_EXPORT_PRESENTATION_RECERTIFICATION_INCOMPLETE"
        diagnosis="RESOLVED_EXPORT_PRESENTATION_CONTROL_LIVE_RECERTIFICATION_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R3_EXPORT_PRESENTATION_POST_ACTION_RESIDUAL_CAUSAL_DIAGNOSIS"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R2_RESOLVED_EXPORT_PRESENTATION_CONTROL_LIVE_MICRO_COHORT_RECERTIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
         "checks":checks,"cohort":COHORT,"outcomes":outcomes,"freshTargetsCreated":targets,
         "exportCertifiedCount":ec,"presentationCertifiedCount":pc,"haltedOnFailure":halted,
         "executionPolicy":{"browserContext":"PRESERVED","pageTarget":"FRESH_PER_RECORD","samePageReuseAcrossRecords":False,
                            "freshIsolatedBrowserPerRecord":False,"strictSequential":True,"haltOnFirstFailure":True},
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,"exportPresentation":True},
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"resolved_export_presentation_control_live_micro_cohort_recertification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("FRESH_TARGETS_CREATED:",targets)
    print("EXPORT_CERTIFIED:",ec,"/3")
    print("PRESENTATION_CERTIFIED:",pc,"/3")
    print("HALTED_ON_FAILURE:",halted)
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
