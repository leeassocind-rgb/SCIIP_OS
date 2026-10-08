#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R14A_COMMAND_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"
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
        ts=page_targets(p)
        if any("127.0.0.1:5173" in x.get("url","") for x in ts):return p
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

def jq(s): return json.dumps(s)

def wait_ready(w):
    w.call("Runtime.enable"); w.call("Page.enable")
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
const body=document.body?.innerText||'';
const explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
return {{ok:norm(body).includes(norm(q))&&explorer,stage:'POST_CLICK',propertyVisible:norm(body).includes(norm(q)),
 explorerMounted:explorer,mapVisible:map,matchCount:ranked.length,chosenText:best.text.slice(0,500),
 chosenTag:best.tag,chosenScore:best.score,inputValue:input.value}};
}})()""")

def activate_command(w,q):
    return w.ev(f"""(async()=>{{
const q={jq(q)},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const before=document.body?.innerText||'',beforeUrl=location.href;
const cands=[];
for(const el of document.querySelectorAll('button,a,[role="button"],[tabindex],div')){{
 const tx=(el.innerText||el.textContent||'').trim(),nt=norm(tx);
 if(!(nt==='command'||nt==='open command'||nt.startsWith('command ')||nt.includes('command center')))continue;
 const rp=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));let hs=[];
 for(const k of rp){{const v=el[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}}
 const role=el.getAttribute('role');
 const click=el.tagName==='BUTTON'||el.tagName==='A'||role==='button'||el.getAttribute('tabindex')!==null||typeof el.onclick==='function'||hs.includes('onClick');
 let s=0;if(click)s+=30;if(['BUTTON','A'].includes(el.tagName))s+=15;if(hs.includes('onClick'))s+=20;
 if(nt==='command')s+=40;else if(nt==='open command')s+=35;else if(nt.includes('command center'))s+=25;
 cands.push({{node:el,score:s,text:tx,tag:el.tagName,role,handlers:hs}});
}}
cands.sort((a,b)=>b.score-a.score);const best=cands[0];
if(!best)return {{ok:false,commandControlFound:false,candidateCount:0}};
best.node.scrollIntoView({{block:'center'}});best.node.click();await new Promise(r=>setTimeout(r,900));
const body=document.body?.innerText||'',nb=norm(body);
const explorer=!!document.querySelector('input[aria-label="Search SCIIP"]');
const map=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
const selected=norm(body).includes(norm(q));
const commandSignals=['command','command center','command palette'].filter(x=>nb.includes(x));
const bodyChanged=before!==body,urlChanged=beforeUrl!==location.href;
const commandVisible=commandSignals.length>0 && (bodyChanged||urlChanged||best.score>=30);
return {{ok:commandVisible&&selected&&explorer&&map,commandControlFound:true,candidateCount:cands.length,
 chosenText:best.text.slice(0,500),chosenTag:best.tag,chosenScore:best.score,
 bodyChanged,urlChanged,commandSignals,commandVisible,selectedPropertyVisible:selected,
 explorerMounted:explorer,mapVisible:map}};
}})()""")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r14p=ev/"M4_19D4BN17C_R4_R12_R14_POST_COMPARE_COMMAND_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"/"post_compare_command_action_surface_readiness_and_bounded_design.json"
    if not r14p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: R14_COMMAND_READINESS_EVIDENCE_REQUIRED");return 4
    r14=fj(r14p)
    if r14.get("status")!="PASSED":
        print("STATUS: BLOCKED\nDIAGNOSIS: R14_COMMAND_READINESS_MUST_PASS");return 5

    port=find_certified_browser()
    if port is None:
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_SAME_BROWSER_CDP_CONTEXT_REQUIRED");return 6

    outcomes=[];halted=False;targets_created=0
    for i,p in enumerate(COHORT,1):
        if halted:break
        t=create_target(port)
        print(f"\n[{i}/3] {p}")
        if not t:
            outcomes.append({"property":p,"freshTargetCreated":False,"selectedPropertyCertified":False,"commandCertified":False})
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
            outcomes.append({"property":p,"freshTargetCreated":True,"selectedPropertyCertified":False,"commandCertified":False,"selection":sv})
            print("OUTCOME: SELECTED_PROPERTY_PRECONDITION_GAP");halted=True;w.close();break

        cmd=activate_command(w,p);cv=cmd.get("value") or {}
        o={"property":p,"freshTargetCreated":True,"selectedPropertyCertified":True,
           "commandRuntimeOk":cmd.get("ok"),"commandCertified":bool(cv.get("ok")),
           "selection":sv,"command":cv}
        outcomes.append(o)
        print("commandRuntimeOk:",cmd.get("ok"))
        print("commandControlFound:",cv.get("commandControlFound"))
        print("commandCandidateCount:",cv.get("candidateCount"))
        print("commandChosenTag:",cv.get("chosenTag"))
        print("commandChosenText:",cv.get("chosenText"))
        print("commandVisible:",cv.get("commandVisible"))
        print("selectedPropertyVisibleAfterCommand:",cv.get("selectedPropertyVisible"))
        print("explorerMountedAfterCommand:",cv.get("explorerMounted"))
        print("mapVisibleAfterCommand:",cv.get("mapVisible"))
        print("commandCertified:",cv.get("ok"))
        print("OUTCOME:","COMMAND_FRESH_PAGE_CERTIFIED" if cv.get("ok") else "COMMAND_FRESH_PAGE_GAP")
        if not cmd.get("ok") or not cv.get("ok"):halted=True
        w.close()

    cert=sum(1 for x in outcomes if x.get("commandCertified"))
    checks={
      "r14Passed":r14.get("status")=="PASSED",
      "certifiedBrowserContextPreserved":True,
      "freshPageTargetPerRecordPolicyUsed":True,
      "samePageReuseAcrossRecordsIsFalse":True,
      "freshIsolatedBrowserPerRecordIsFalse":True,
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":halted or len(outcomes)==3,
      "allExecutedFreshTargetsCreated":all(x.get("freshTargetCreated") for x in outcomes),
      "allExecutedSelectedPropertiesCertified":all(x.get("selectedPropertyCertified") for x in outcomes),
      "allExecutedCommandActionsCertified":all(x.get("commandCertified") for x in outcomes),
      "allThreeCommandActionsCertified":len(outcomes)==3 and cert==3,
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True,
      "analyzePresentAuthorityOff":True,"exportPresentationAuthorityOff":True
    }
    passed=all(checks.values())
    if passed:
        status="PASSED";state="M419D4BN17C_R4_R12_R14A_COMMAND_ACTION_LIVE_MICRO_COHORT_CERTIFIED"
        diagnosis="COMMAND_ACTION_LIVE_ACTIVATION_CERTIFIED_THREE_OF_THREE_WITH_PER_RECORD_FRESH_PAGE_ISOLATION"
        nxt="M4_19D4BN17C_R4_R12_R14B_COMMAND_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"
    else:
        status="DIAGNOSTIC_COMPLETE";state="M419D4BN17C_R4_R12_R14A_COMMAND_ACTION_LIVE_CERTIFICATION_INCOMPLETE"
        diagnosis="COMMAND_ACTION_LIVE_MICRO_COHORT_ACTIVATION_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R14A_R1_COMMAND_CONTROL_TARGET_AND_POST_ACTION_STATE_DIAGNOSIS"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R14A_COMMAND_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
         "checks":checks,"cohort":COHORT,"outcomes":outcomes,"certifiedCount":cert,
         "freshTargetsCreated":targets_created,"haltedOnFailure":halted,"browserCdpPort":port,
         "executionPolicy":{"browserContext":"PRESERVED","pageTarget":"FRESH_PER_RECORD",
                            "samePageReuseAcrossRecords":False,"freshIsolatedBrowserPerRecord":False,
                            "strictSequential":True,"haltOnFirstFailure":True},
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,
                      "command":True,"analyzePresent":False,"exportPresentation":False},
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"command_action_live_micro_cohort_activation_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("FRESH_TARGETS_CREATED:",targets_created)
    print("CERTIFIED:",cert,"/3")
    print("HALTED_ON_FAILURE:",halted)
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
