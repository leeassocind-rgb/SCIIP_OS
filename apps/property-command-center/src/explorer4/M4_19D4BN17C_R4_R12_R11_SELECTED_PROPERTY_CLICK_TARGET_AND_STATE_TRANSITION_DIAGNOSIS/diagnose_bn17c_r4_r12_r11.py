#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time,subprocess,tempfile

M="M4_19D4BN17C_R4_R12_R11_SELECTED_PROPERTY_CLICK_TARGET_AND_STATE_TRANSITION_DIAGNOSIS"
TARGET_URL="http://127.0.0.1:5173/"
PROBE="2 Musick"
PASSING=["2701 Carrier Ave","8700 - 8750 Rex Rd"]
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
            if "127.0.0.1:5173" in x.get("url","") and x.get("webSocketDebuggerUrl"):return p,x
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
    if not c:return None,None
    for port in PORTS:
        if browser_ready(port):
            t=create_target(port)
            if t:return port,t
        prof=tempfile.mkdtemp(prefix=f"sciip-r11-{port}-")
        try:
            subprocess.Popen([c,f"--remote-debugging-port={port}","--remote-debugging-address=127.0.0.1",
                              f"--user-data-dir={prof}","--headless=new","--disable-gpu","--no-first-run",
                              "--no-default-browser-check","about:blank"],
                             stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        except:continue
        for _ in range(50):
            time.sleep(.2)
            if browser_ready(port):break
        if browser_ready(port):
            t=create_target(port)
            if t:return port,t
    return None,None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode()
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

def capture(w,q,activate=False):
    return w.ev(f"""(async()=>{{
const q={jsq(q)},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {{searchInputFound:false}};
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(input,q);else input.value=q;
input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
input.dispatchEvent(new Event('change',{{bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
await new Promise(r=>setTimeout(r,900));
const all=[...document.querySelectorAll('*')];
const matches=[];
for(const el of all){{
 const tx=(el.innerText||el.textContent||'').trim();
 if(!tx||!norm(tx).includes(norm(q)))continue;
 const chain=[];let n=el;
 for(let depth=0;n&&depth<7;depth++,n=n.parentElement){{
   const attrs={{}};
   for(const k of ['role','tabindex','href','aria-label','data-testid']){{const v=n.getAttribute&&n.getAttribute(k);if(v!=null)attrs[k]=v}}
   const keys=Object.getOwnPropertyNames(n).filter(k=>k.startsWith('__reactProps$')||k.startsWith('__reactFiber$'));
   let reactHandlers=[];
   for(const k of keys){{
      const v=n[k];
      if(k.startsWith('__reactProps$')&&v&&typeof v==='object')reactHandlers=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function');
   }}
   const clickable=n.tagName==='BUTTON'||n.tagName==='A'||['button','option','listitem'].includes((n.getAttribute&&n.getAttribute('role'))||'')||
      (n.getAttribute&&n.getAttribute('tabindex')!==null)||typeof n.onclick==='function'||reactHandlers.length>0;
   chain.push({{tag:n.tagName,text:(n.innerText||n.textContent||'').trim().slice(0,500),className:String(n.className||'').slice(0,240),attrs,reactHandlers,clickable}});
 }}
 matches.push({{text:tx.slice(0,500),chain}});
 if(matches.length>=60)break;
}}
const scored=[];
for(let mi=0;mi<matches.length;mi++)for(let di=0;di<matches[mi].chain.length;di++){{
 const n=matches[mi].chain[di];let s=0;
 if(n.clickable)s+=20;if(n.tag==='BUTTON'||n.tag==='A')s+=10;if(n.reactHandlers.includes('onClick'))s+=15;
 if(norm(n.text)===norm(q))s+=20;else if(norm(n.text).startsWith(norm(q)))s+=10;
 s-=di*2;scored.push({{matchIndex:mi,depth:di,score:s,node:n}});
}}
scored.sort((a,b)=>b.score-a.score);
let activation=null;
if({str(activate).lower()}&&scored.length){{
 const best=scored[0],base=matches[best.matchIndex];
 let n=[...document.querySelectorAll('*')].find(el=>{{const tx=(el.innerText||el.textContent||'').trim();return norm(tx).includes(norm(q));}});
 for(let i=0;n&&i<best.depth;i++)n=n.parentElement;
 const beforeUrl=location.href,beforeBody=document.body?.innerText||'';
 if(n){{n.scrollIntoView({{block:'center'}});n.dispatchEvent(new MouseEvent('mousedown',{{bubbles:true,button:0}}));n.dispatchEvent(new MouseEvent('mouseup',{{bubbles:true,button:0}}));n.click();}}
 await new Promise(r=>setTimeout(r,900));
 const body=document.body?.innerText||'';
 activation={{beforeUrl,afterUrl:location.href,urlChanged:beforeUrl!==location.href,bodyChanged:beforeBody!==body,
   propertyVisible:norm(body).includes(norm(q)),explorerMounted:!!document.querySelector('input[aria-label="Search SCIIP"]'),
   mapVisible:!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]'),best}};
}}
return {{searchInputFound:true,matchCount:matches.length,matches,topScored:scored.slice(0,20),activation}};
}})()""")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r10p=ev/"M4_19D4BN17C_R4_R12_R10_CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CERTIFICATION"/"canonical_search_result_selected_property_activation_micro_cohort_certification.json"
    if not r10p.exists():print("STATUS: BLOCKED\nDIAGNOSIS: R10_EVIDENCE_REQUIRED");return 4
    r10=fj(r10p)
    port,t=find_target()
    if not t:port,t=bootstrap()
    if not t:print("STATUS: BLOCKED\nDIAGNOSIS: CDP_TARGET_UNAVAILABLE");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable");w.call("Page.navigate",{"url":TARGET_URL});time.sleep(1.2)

    pass_caps={}
    for p in PASSING:
        rr=capture(w,p,False);pass_caps[p]=rr.get("value") or {}
    probe=capture(w,PROBE,True);pv=probe.get("value") or {}
    act=pv.get("activation") or {}

    print("PROBE_PROPERTY:",PROBE)
    print("PROBE_MATCH_COUNT:",pv.get("matchCount",0))
    print("PROBE_TOP_SCORE:",((pv.get("topScored") or [{}])[0]).get("score"))
    print("PROBE_TOP_TAG:",(((pv.get("topScored") or [{}])[0]).get("node") or {}).get("tag"))
    print("PROBE_TOP_REACT_HANDLERS:",(((pv.get("topScored") or [{}])[0]).get("node") or {}).get("reactHandlers"))
    print("ACTIVATION_URL_CHANGED:",act.get("urlChanged"))
    print("ACTIVATION_BODY_CHANGED:",act.get("bodyChanged"))
    print("ACTIVATION_PROPERTY_VISIBLE:",act.get("propertyVisible"))
    print("ACTIVATION_EXPLORER_MOUNTED:",act.get("explorerMounted"))
    print("ACTIVATION_MAP_VISIBLE:",act.get("mapVisible"))

    selected=bool(act.get("propertyVisible") and act.get("explorerMounted"))
    checks={
      "r10DiagnosticComplete":r10.get("status")=="DIAGNOSTIC_COMPLETE",
      "r10CertifiedTwoOfThree":r10.get("certifiedCount")==2,
      "twoMusickWasSoleGap":sum(1 for x in r10.get("outcomes",[]) if not x.get("selectedPropertyCertified"))==1,
      "probeSearchInputFound":pv.get("searchInputFound") is True,
      "probeMatchingNodesCaptured":pv.get("matchCount",0)>0,
      "clickableAncestorScoringCompleted":len(pv.get("topScored") or [])>0,
      "boundedActivationProbeCompleted":bool(act),
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())
    if passed and selected:
        status="PASSED";state="M419D4BN17C_R4_R12_R11_TWO_MUSICK_CLICK_TARGET_AND_STATE_TRANSITION_CERTIFIED"
        diagnosis="TWO_MUSICK_CLICK_TARGET_RESOLVED_SELECTED_PROPERTY_ACTIVATION_CERTIFIED_MICRO_COHORT_CAN_CLOSE"
        nxt="M4_19D4BN17C_R4_R12_R10_R1_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_RECERTIFICATION_AND_CLOSURE"
    elif passed:
        status="PASSED";state="M419D4BN17C_R4_R12_R11_CLICK_TARGET_DIAGNOSIS_CERTIFIED"
        diagnosis="TWO_MUSICK_RESULT_NODE_STRUCTURE_RESOLVED_BUT_SELECTED_PROPERTY_STATE_TRANSITION_REMAINS_OPEN"
        nxt="M4_19D4BN17C_R4_R12_R12_EXACT_REACT_CLICK_HANDLER_AND_SELECTED_PROPERTY_STATE_SETTER_BINDING"
    else:
        status="DIAGNOSTIC_COMPLETE";state="M419D4BN17C_R4_R12_R11_DIAGNOSIS_INCOMPLETE"
        diagnosis="TWO_MUSICK_CLICK_TARGET_STRUCTURE_REMAINS_UNRESOLVED";nxt=None

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R11_SELECTED_PROPERTY_CLICK_TARGET_AND_STATE_TRANSITION_DIAGNOSIS",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
         "checks":checks,"probeProperty":PROBE,"passingComparators":pass_caps,"probe":pv,"selectedPropertyCertified":selected,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,
                      "compare":False,"command":False,"analyzePresent":False,"exportPresentation":False},
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"selected_property_click_target_and_state_transition_diagnosis.json";f.write_text(json.dumps(res,indent=2)+"\n")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("SELECTED_PROPERTY_CERTIFIED:",selected)
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
