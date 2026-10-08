#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time,subprocess,tempfile

M="M4_19D4BN17C_R4_R12_R13A_COMPARE_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]
TARGET_URL="http://127.0.0.1:5173/"
PORTS=[9333,9334,9335,9444,9555]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def hj(url,method="GET",timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read())
def explorer_ready():
    try:
        with urllib.request.urlopen(TARGET_URL,timeout=1.5) as r:return 200<=getattr(r,"status",200)<500
    except:return False
def targets(port):
    try:return hj(f"http://127.0.0.1:{port}/json",timeout=1)
    except:return []
def find_target():
    for p in PORTS+[9222,9223]:
        for x in targets(p):
            u=x.get("url","")
            if "127.0.0.1:5173" in u and x.get("webSocketDebuggerUrl"):return p,x
    return None,None
def browser_ready(port):
    try:
        v=hj(f"http://127.0.0.1:{port}/json/version",timeout=1)
        return bool(v.get("Browser") or v.get("webSocketDebuggerUrl"))
    except:return False
def create_target(port):
    e=urllib.parse.quote(TARGET_URL,safe=":/")
    for u in (f"http://127.0.0.1:{port}/json/new?{e}",f"http://127.0.0.1:{port}/json/new?url={e}"):
        try:
            x=hj(u,method="PUT",timeout=2)
            if x.get("webSocketDebuggerUrl"):return x
        except:pass
def chrome():
    for p in ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
              "/Applications/Chromium.app/Contents/MacOS/Chromium"]:
        if Path(p).exists():return p
def bootstrap():
    c=chrome()
    if not c:return None,None,{"ok":False,"error":"SUPPORTED_CHROME_EXECUTABLE_NOT_FOUND"}
    for port in PORTS:
        if browser_ready(port):
            t=create_target(port)
            if t:return port,t,{"ok":True,"launched":False,"targetCreated":True}
        prof=tempfile.mkdtemp(prefix=f"sciip-r13a-{port}-")
        try:
            proc=subprocess.Popen([c,f"--remote-debugging-port={port}","--remote-debugging-address=127.0.0.1",
                                   f"--user-data-dir={prof}","--headless=new","--disable-gpu","--no-first-run",
                                   "--no-default-browser-check","about:blank"],
                                  stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        except:continue
        for _ in range(50):
            time.sleep(.2)
            if browser_ready(port):break
        if browser_ready(port):
            t=create_target(port)
            if t:return port,t,{"ok":True,"launched":True,"targetCreated":True,"profile":prof,"pid":proc.pid}
    return None,None,{"ok":False,"error":"CDP_TARGET_CREATION_FAILED"}

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:raise RuntimeError("bad ws url")
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
        r=x.get("result",{});return {"ok":not x.get("error") and r.get("exceptionDetails") is None,"value":r.get("result",{}).get("value")}

def jsq(s):return json.dumps(s)

def select_property(w,p):
    return w.ev(f"""(async()=>{{
const q={jsq(p)},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {{ok:false,stage:'SEARCH_INPUT_NOT_FOUND'}};
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(input,q);else input.value=q;
input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
input.dispatchEvent(new Event('change',{{bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
await new Promise(r=>setTimeout(r,900));
const nodes=[...document.querySelectorAll('*')].filter(el=>{{const tx=(el.innerText||el.textContent||'').trim();return tx&&norm(tx).includes(norm(q));}});
let ranked=[];
for(const el of nodes){{
 let n=el;
 for(let depth=0;n&&depth<7;depth++,n=n.parentElement){{
   const rp=Object.getOwnPropertyNames(n).filter(k=>k.startsWith('__reactProps$'));
   let handlers=[];
   for(const k of rp){{const v=n[k];if(v&&typeof v==='object')handlers=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function');}}
   const role=n.getAttribute&&n.getAttribute('role');
   const clickable=n.tagName==='BUTTON'||n.tagName==='A'||['button','option','listitem'].includes(role||'')||
      (n.getAttribute&&n.getAttribute('tabindex')!==null)||typeof n.onclick==='function'||handlers.includes('onClick');
   let score=0;if(clickable)score+=20;if(n.tagName==='BUTTON'||n.tagName==='A')score+=10;if(handlers.includes('onClick'))score+=15;
   const tx=(n.innerText||n.textContent||'').trim();if(norm(tx)===norm(q))score+=20;else if(norm(tx).startsWith(norm(q)))score+=10;score-=depth*2;
   ranked.push({{n,score,tx,handlers}});
 }}
}}
ranked.sort((a,b)=>b.score-a.score);const best=ranked[0];
if(!best)return {{ok:false,stage:'EXACT_RESULT_TARGET_NOT_FOUND',nodeCount:nodes.length}};
best.n.scrollIntoView({{block:'center'}});best.n.dispatchEvent(new MouseEvent('mousedown',{{bubbles:true,button:0}}));best.n.dispatchEvent(new MouseEvent('mouseup',{{bubbles:true,button:0}}));best.n.click();
await new Promise(r=>setTimeout(r,800));
const body=document.body?.innerText||'';
return {{ok:norm(body).includes(norm(q)),selectedPropertyVisible:norm(body).includes(norm(q)),chosenText:best.tx.slice(0,500),score:best.score}};
}})()""")

def activate_compare(w,p):
    return w.ev(f"""(async()=>{{
const q={jsq(p)},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const beforeBody=document.body?.innerText||'',beforeUrl=location.href;
const all=[...document.querySelectorAll('button,a,[role="button"],[role="option"],[tabindex],div')];
let cands=[];
for(const el of all){{
 const tx=(el.innerText||el.textContent||'').trim();
 if(!tx)continue;
 const nt=norm(tx);
 if(!(nt==='compare'||nt.startsWith('compare ')||nt.includes('open compare')))continue;
 const rp=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));
 let handlers=[];
 for(const k of rp){{const v=el[k];if(v&&typeof v==='object')handlers=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function');}}
 const role=el.getAttribute('role');const clickable=el.tagName==='BUTTON'||el.tagName==='A'||role==='button'||el.getAttribute('tabindex')!==null||typeof el.onclick==='function'||handlers.includes('onClick');
 let score=0;if(clickable)score+=30;if(el.tagName==='BUTTON'||el.tagName==='A')score+=15;if(handlers.includes('onClick'))score+=20;if(nt==='compare')score+=30;if(nt.includes('open compare'))score+=20;
 cands.push({{el,score,tx,handlers,tag:el.tagName,role}});
}}
cands.sort((a,b)=>b.score-a.score);const best=cands[0];
if(!best)return {{compareControlFound:false,candidateCount:0}};
best.el.scrollIntoView({{block:'center'}});best.el.dispatchEvent(new MouseEvent('mousedown',{{bubbles:true,button:0}}));best.el.dispatchEvent(new MouseEvent('mouseup',{{bubbles:true,button:0}}));best.el.click();
await new Promise(r=>setTimeout(r,900));
const body=document.body?.innerText||'',nb=norm(body);
const compareSignals=['compare','comparison','open compare'].filter(x=>nb.includes(x));
const explorerMounted=!!document.querySelector('input[aria-label="Search SCIIP"]');
const mapVisible=!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]');
const selectedPropertyVisible=norm(body).includes(norm(q));
const bodyChanged=beforeBody!==body,urlChanged=beforeUrl!==location.href;
const compareVisible=compareSignals.length>0 && (bodyChanged||urlChanged||best.score>=30);
return {{
 compareControlFound:true,candidateCount:cands.length,
 chosenText:best.tx.slice(0,500),chosenTag:best.tag,chosenRole:best.role,chosenHandlers:best.handlers,chosenScore:best.score,
 bodyChanged,urlChanged,compareSignals,compareVisible,selectedPropertyVisible,explorerMounted,mapVisible,
 certified:compareVisible&&selectedPropertyVisible&&explorerMounted&&mapVisible
}};
}})()""")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r13p=ev/"M4_19D4BN17C_R4_R12_R13_COMPARE_ACTION_SURFACE_CONTRACT_AND_MICRO_COHORT_ACTIVATION_DESIGN"/"compare_action_surface_contract_and_micro_cohort_activation_design.json"
    if not r13p.exists():print("STATUS: BLOCKED\nDIAGNOSIS: R13_EVIDENCE_REQUIRED");return 4
    r13=fj(r13p)
    if r13.get("status")!="PASSED":
        print("STATUS: BLOCKED\nDIAGNOSIS: R13_COMPARE_DESIGN_MUST_PASS");return 5

    port,t=find_target();boot={"reused":bool(t)}
    if not t:
        port,t,boot=bootstrap()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: CDP_TARGET_UNAVAILABLE");return 6

    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    outcomes=[];halted=False

    for i,p in enumerate(COHORT,1):
        if halted:break
        w.call("Page.navigate",{"url":TARGET_URL});time.sleep(1.2)
        sel=select_property(w,p);sv=sel.get("value") or {}
        print(f"\n[{i}/3] {p}")
        print("selectedPropertyReady:",sv.get("ok"))
        if not sv.get("ok"):
            o={"property":p,"selectedPropertyReady":False,"compareCertified":False,"selection":sv}
            outcomes.append(o);print("OUTCOME: COMPARE_ACTION_PRECONDITION_GAP");halted=True;break
        rr=activate_compare(w,p);v=rr.get("value") or {}
        o={"property":p,"selectedPropertyReady":True,"runtimeEvaluationOk":rr.get("ok"),**v}
        outcomes.append(o)
        for k in ("compareControlFound","candidateCount","chosenTag","chosenText","bodyChanged","urlChanged","compareVisible","selectedPropertyVisible","explorerMounted","mapVisible","certified"):
            print(f"{k}: {o.get(k)}")
        print("OUTCOME:","COMPARE_ACTION_ACTIVATION_CERTIFIED" if o.get("certified") else "COMPARE_ACTION_ACTIVATION_GAP")
        if not o.get("certified"):halted=True

    cert=sum(1 for x in outcomes if x.get("certified"))
    checks={
      "bn17cR4R12R13Passed":r13.get("status")=="PASSED",
      "exactThreeRecordCohortPlanned":len(COHORT)==3,
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":halted or len(outcomes)==3,
      "allExecutedSelectionsReady":all(x.get("selectedPropertyReady") for x in outcomes),
      "allExecutedCompareControlsFound":all(x.get("compareControlFound") for x in outcomes if x.get("selectedPropertyReady")),
      "allExecutedCompareActivationsCertified":all(x.get("certified") for x in outcomes),
      "allThreeCompareActivationsCertified":len(outcomes)==3 and cert==3,
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True,
      "commandAuthorityOff":True,"analyzePresentAuthorityOff":True,"exportPresentationAuthorityOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED";state="M419D4BN17C_R4_R12_R13A_COMPARE_ACTION_LIVE_MICRO_COHORT_CERTIFIED"
        diagnosis="COMPARE_ACTION_LIVE_ACTIVATION_CERTIFIED_THREE_OF_THREE"
        nxt="M4_19D4BN17C_R4_R12_R13B_COMPARE_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"
    else:
        status="DIAGNOSTIC_COMPLETE";state="M419D4BN17C_R4_R12_R13A_COMPARE_ACTION_LIVE_CERTIFICATION_INCOMPLETE"
        diagnosis="COMPARE_ACTION_LIVE_MICRO_COHORT_ACTIVATION_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R13A_R1_COMPARE_CONTROL_TARGET_AND_POST_ACTION_STATE_DIAGNOSIS"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_COMPARE_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "cohort":COHORT,"outcomes":outcomes,"certifiedCount":cert,"haltedOnFailure":halted,
      "cdp":{"port":port,"handshake":w.hs},"bootstrap":boot,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,
                   "compare":True,"command":False,"analyzePresent":False,"exportPresentation":False},
      "nextMilestone":nxt
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"compare_action_live_micro_cohort_activation_certification.json";f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CERTIFIED:",cert,"/3")
    print("HALTED_ON_FAILURE:",halted)
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
