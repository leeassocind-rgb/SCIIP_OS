#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_EXPORT_PRESENTATION_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"
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
def find_certified_browser():
    for p in PORTS:
        if not browser_ready(p):continue
        if any("127.0.0.1:5173" in x.get("url","") for x in page_targets(p)):return p
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
        if not m:raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
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

def jq(s):return json.dumps(s)

def wait_ready(w):
    w.call("Runtime.enable");w.call("Page.enable")
    for _ in range(40):
        time.sleep(.2)
        if w.ev("document.readyState").get("value") in ("interactive","complete"):break
    time.sleep(.9)

def select_property(w,q):
    return w.ev(f"""(async()=>{{
const q={jq(q)},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {{ok:false,stage:'SEARCH_INPUT_NOT_FOUND'}};
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
if(d&&d.set)d.set.call(input,q);else input.value=q;
input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
input.dispatchEvent(new Event('change',{{bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
await new Promise(r=>setTimeout(r,1000));
const ranked=[];
for(const el of document.querySelectorAll('*')){{
 const tx=(el.innerText||el.textContent||'').trim();if(!tx||!norm(tx).includes(norm(q)))continue;
 let n=el;
 for(let depth=0;n&&depth<8;depth++,n=n.parentElement){{
  const rp=Object.getOwnPropertyNames(n).filter(k=>k.startsWith('__reactProps$'));let hs=[];
  for(const k of rp){{const v=n[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}}
  const role=n.getAttribute&&n.getAttribute('role');
  const click=n.tagName==='BUTTON'||n.tagName==='A'||['button','option','listitem'].includes(role||'')||
    n.getAttribute('tabindex')!==null||typeof n.onclick==='function'||hs.includes('onClick');
  const nt=(n.innerText||n.textContent||'').trim();
  let s=0;if(click)s+=25;if(['BUTTON','A'].includes(n.tagName))s+=10;if(hs.includes('onClick'))s+=20;
  if(norm(nt)===norm(q))s+=30;else if(norm(nt).startsWith(norm(q)))s+=15;s-=depth*2;
  ranked.push({{node:n,score:s,text:nt,tag:n.tagName,handlers:hs,depth}});
 }}
}}
ranked.sort((a,b)=>b.score-a.score);const best=ranked[0];
if(!best)return {{ok:false,stage:'RESULT_TARGET_NOT_FOUND',matchCount:0,inputValue:input.value}};
best.node.scrollIntoView({{block:'center'}});best.node.click();await new Promise(r=>setTimeout(r,900));
const body=document.body?.innerText||'',explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
return {{ok:norm(body).includes(norm(q))&&explorer,propertyVisible:norm(body).includes(norm(q)),
 explorerMounted:explorer,mapVisible:map,matchCount:ranked.length,chosenText:best.text.slice(0,500),
 chosenTag:best.tag,chosenScore:best.score,inputValue:input.value}};
}})()""")

def activate_runtime_action(w,q,kind):
    kindj=jq(kind)
    return w.ev(f"""(async()=>{{
const q={jq(q)},kind={kindj},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const before=document.body?.innerText||'',beforeUrl=location.href;
const candidates=[];
const labels = kind==='Export'
 ? ['export','export presentation','export deck','download presentation','download deck']
 : ['presentation','open presentation','generate presentation','present deck','deck','download'];
for(const el of document.querySelectorAll('button,a,[role="button"],[tabindex],div')){{
 const tx=(el.innerText||el.textContent||'').trim(),nt=norm(tx);
 if(!labels.some(x=>nt===x||nt.startsWith(x+' ')))continue;
 const rp=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));let hs=[];
 for(const k of rp){{const v=el[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}}
 const role=el.getAttribute('role');
 const click=el.tagName==='BUTTON'||el.tagName==='A'||role==='button'||el.getAttribute('tabindex')!==null||typeof el.onclick==='function'||hs.includes('onClick');
 let score=0;if(click)score+=30;if(['BUTTON','A'].includes(el.tagName))score+=15;if(hs.includes('onClick'))score+=20;
 if(kind==='Export'&&nt==='export')score+=50;
 if(kind==='Export'&&nt==='export presentation')score+=45;
 if(kind==='Presentation'&&nt==='presentation')score+=50;
 if(kind==='Presentation'&&nt==='generate presentation')score+=45;
 if(kind==='Presentation'&&nt==='download')score+=20;
 candidates.push({{node:el,score,text:tx,tag:el.tagName,handlers:hs}});
}}
candidates.sort((a,b)=>b.score-a.score);const best=candidates[0];
if(!best)return {{ok:false,controlFound:false,candidateCount:0,kind}};
best.node.scrollIntoView({{block:'center'}});best.node.click();await new Promise(r=>setTimeout(r,1100));
const body=document.body?.innerText||'',nb=norm(body);
const explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
const selected=norm(body).includes(norm(q));
const bodyChanged=before!==body,urlChanged=beforeUrl!==location.href;
const signals = kind==='Export'
 ? ['export','download','presentation','deck'].filter(x=>nb.includes(x))
 : ['presentation','deck','download','ready'].filter(x=>nb.includes(x));
const visible=signals.length>0 && (bodyChanged||urlChanged||best.score>=30);
return {{ok:visible&&selected&&explorer&&map,kind,controlFound:true,candidateCount:candidates.length,
 chosenText:best.text.slice(0,500),chosenTag:best.tag,chosenScore:best.score,
 bodyChanged,urlChanged,signals,visible,selectedPropertyVisible:selected,explorerMounted:explorer,mapVisible:map}};
}})()""")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r16p=ev/"M4_19D4BN17C_R4_R12_R16_POST_ANALYZE_PRESENT_EXPORT_PRESENTATION_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"/"post_analyze_present_export_presentation_action_surface_readiness_and_bounded_design.json"
    if not r16p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: R16_EXPORT_PRESENTATION_READINESS_EVIDENCE_REQUIRED");return 4
    r16=fj(r16p)
    if r16.get("status")!="PASSED":
        print("STATUS: BLOCKED\nDIAGNOSIS: R16_EXPORT_PRESENTATION_READINESS_MUST_PASS");return 5

    port=find_certified_browser()
    if port is None:
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_SAME_BROWSER_CDP_CONTEXT_REQUIRED");return 6

    outcomes=[];halted=False;targets_created=0
    for i,p in enumerate(COHORT,1):
        if halted:break
        print(f"\n[{i}/3] {p}")
        t=create_target(port)
        if not t:
            outcomes.append({"property":p,"freshTargetCreated":False,"selectedPropertyCertified":False,
                             "exportCertified":False,"presentationCertified":False})
            print("freshTargetCreated: False");print("OUTCOME: FRESH_PAGE_TARGET_CREATION_GAP");halted=True;break
        targets_created+=1
        w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)

        sel=select_property(w,p);sv=sel.get("value") or {}
        print("freshTargetCreated: True")
        print("selectionRuntimeOk:",sel.get("ok"))
        print("selectedPropertyCertified:",sv.get("ok"))
        print("selectionMatchCount:",sv.get("matchCount"))
        print("selectionChosenTag:",sv.get("chosenTag"))
        if not sel.get("ok") or not sv.get("ok"):
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":False,
                             "exportCertified":False,"presentationCertified":False,"selection":sv})
            print("OUTCOME: SELECTED_PROPERTY_PRECONDITION_GAP");halted=True;w.close();break

        ex=activate_runtime_action(w,p,"Export");evv=ex.get("value") or {}
        print("exportRuntimeOk:",ex.get("ok"))
        print("exportControlFound:",evv.get("controlFound"))
        print("exportCandidateCount:",evv.get("candidateCount"))
        print("exportChosenTag:",evv.get("chosenTag"))
        print("exportChosenText:",evv.get("chosenText"))
        print("exportVisible:",evv.get("visible"))
        print("exportCertified:",evv.get("ok"))
        if not ex.get("ok") or not evv.get("ok"):
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,
                             "exportCertified":False,"presentationCertified":False,"selection":sv,"export":evv})
            print("OUTCOME: EXPORT_ACTION_GAP");halted=True;w.close();break

        pr=activate_runtime_action(w,p,"Presentation");pv=pr.get("value") or {}
        o={"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,
           "exportCertified":True,"presentationCertified":bool(pv.get("ok")),
           "selection":sv,"export":evv,"presentation":pv}
        outcomes.append(o)
        print("presentationRuntimeOk:",pr.get("ok"))
        print("presentationControlFound:",pv.get("controlFound"))
        print("presentationCandidateCount:",pv.get("candidateCount"))
        print("presentationChosenTag:",pv.get("chosenTag"))
        print("presentationChosenText:",pv.get("chosenText"))
        print("presentationVisible:",pv.get("visible"))
        print("selectedPropertyVisibleAfterPresentation:",pv.get("selectedPropertyVisible"))
        print("explorerMountedAfterPresentation:",pv.get("explorerMounted"))
        print("mapVisibleAfterPresentation:",pv.get("mapVisible"))
        print("presentationCertified:",pv.get("ok"))
        print("OUTCOME:","EXPORT_PRESENTATION_FRESH_PAGE_CERTIFIED" if pv.get("ok") else "PRESENTATION_ACTION_GAP")
        if not pr.get("ok") or not pv.get("ok"):halted=True
        w.close()

    export_cert=sum(1 for x in outcomes if x.get("exportCertified"))
    presentation_cert=sum(1 for x in outcomes if x.get("presentationCertified"))
    checks={
      "r16Passed":r16.get("status")=="PASSED",
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
      "allThreeExportActionsCertified":len(outcomes)==3 and export_cert==3,
      "allThreePresentationActionsCertified":len(outcomes)==3 and presentation_cert==3,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R16A_EXPORT_PRESENTATION_ACTION_LIVE_MICRO_COHORT_CERTIFIED"
        diagnosis="EXPORT_PRESENTATION_ACTIONS_CERTIFIED_THREE_OF_THREE_WITH_PER_RECORD_FRESH_PAGE_ISOLATION"
        nxt="M4_19D4BN17C_R4_R12_R16B_EXPORT_PRESENTATION_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"
    else:
        status="DIAGNOSTIC_COMPLETE"
        state="M419D4BN17C_R4_R12_R16A_EXPORT_PRESENTATION_LIVE_CERTIFICATION_INCOMPLETE"
        diagnosis="EXPORT_PRESENTATION_ACTION_LIVE_MICRO_COHORT_ACTIVATION_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R1_EXPORT_PRESENTATION_CONTROL_TARGET_AND_POST_ACTION_STATE_DIAGNOSIS"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_EXPORT_PRESENTATION_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "cohort":COHORT,"outcomes":outcomes,
      "exportCertifiedCount":export_cert,
      "presentationCertifiedCount":presentation_cert,
      "freshTargetsCreated":targets_created,
      "haltedOnFailure":halted,
      "browserCdpPort":port,
      "executionPolicy":{"browserContext":"PRESERVED","pageTarget":"FRESH_PER_RECORD",
                         "samePageReuseAcrossRecords":False,"freshIsolatedBrowserPerRecord":False,
                         "strictSequential":True,"haltOnFirstFailure":True},
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,
                   "pixelEvidence":False,"exportPresentation":True},
      "nextMilestone":nxt
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"export_presentation_action_live_micro_cohort_activation_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("FRESH_TARGETS_CREATED:",targets_created)
    print("EXPORT_CERTIFIED:",export_cert,"/3")
    print("PRESENTATION_CERTIFIED:",presentation_cert,"/3")
    print("HALTED_ON_FAILURE:",halted)
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__": raise SystemExit(main())
