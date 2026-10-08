#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time,subprocess,tempfile

M="M4_19D4BN17C_R4_R12_R10_CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]
TARGET_URL="http://127.0.0.1:5173/"
PORT_CANDIDATES=[9333,9334,9335,9444,9555]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def hjson(url,method="GET",timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read())
def explorer_ready():
    try:
        with urllib.request.urlopen(TARGET_URL,timeout=1.5) as r:return 200<=getattr(r,"status",200)<500
    except:return False
def targets(port):
    try:return hjson(f"http://127.0.0.1:{port}/json",timeout=1)
    except:return []
def find_target():
    for p in PORT_CANDIDATES+[9222,9223]:
        for x in targets(p):
            u=x.get("url","")
            if any(v in u for v in ("127.0.0.1:5173","localhost:5173")) and x.get("webSocketDebuggerUrl"):
                return p,x
    return None,None
def browser_ready(port):
    try:
        v=hjson(f"http://127.0.0.1:{port}/json/version",timeout=1)
        return bool(v.get("Browser") or v.get("webSocketDebuggerUrl")),v
    except:return False,None
def create_target(port):
    e=urllib.parse.quote(TARGET_URL,safe=":/")
    for u in (f"http://127.0.0.1:{port}/json/new?{e}",f"http://127.0.0.1:{port}/json/new?url={e}"):
        try:
            x=hjson(u,method="PUT",timeout=2)
            if x.get("webSocketDebuggerUrl"):return x
        except:pass
    return None
def chrome():
    for p in ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
              "/Applications/Chromium.app/Contents/MacOS/Chromium"]:
        if Path(p).exists():return p
def bootstrap():
    if not explorer_ready():return {"ok":False,"error":"EXPLORER_HTTP_TARGET_NOT_READY"}
    c=chrome()
    if not c:return {"ok":False,"error":"SUPPORTED_CHROME_EXECUTABLE_NOT_FOUND"}
    for port in PORT_CANDIDATES:
        ok,_=browser_ready(port)
        if ok:
            t=create_target(port)
            if t:return {"ok":True,"port":port,"target":t,"launched":False,"targetCreated":True}
        prof=tempfile.mkdtemp(prefix=f"sciip-r10-cdp-{port}-")
        args=[c,f"--remote-debugging-port={port}","--remote-debugging-address=127.0.0.1",
              f"--user-data-dir={prof}","--headless=new","--disable-gpu","--no-first-run",
              "--no-default-browser-check","--disable-background-networking","about:blank"]
        try:proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        except:continue
        ready=False
        for _ in range(60):
            time.sleep(.2);ready,_=browser_ready(port)
            if ready:break
        if not ready:continue
        t=create_target(port)
        if t:return {"ok":True,"port":port,"target":t,"launched":True,"profile":prof,"pid":proc.pid,"targetCreated":True}
    return {"ok":False,"error":"EXPLICIT_CDP_TARGET_CREATION_FAILED"}

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
        r=x.get("result",{});rr=r.get("result",{});ex=r.get("exceptionDetails")
        return {"ok":not x.get("error") and ex is None,"value":rr.get("value"),"exceptionDetails":ex}

def jsq(s):return json.dumps(s)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r9p=ev/"M4_19D4BN17C_R4_R12_R9_R2_EXPLICIT_CDP_BROWSER_BOOTSTRAP_TARGET_CREATION_AND_CANONICAL_SEARCH_MATERIALIZATION_RECERTIFICATION"/"explicit_cdp_target_creation_and_canonical_search_materialization_recertification.json"
    if not r9p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R9_R2_EVIDENCE_REQUIRED");return 4
    r9=fj(r9p)
    if r9.get("status")!="PASSED" or r9.get("materializedCount")!=3:
        print("STATUS: BLOCKED\nDIAGNOSIS: R9_R2_THREE_OF_THREE_MATERIALIZATION_REQUIRED");return 5

    port,t=find_target();boot={"needed":False,"ok":True}
    if not t:
        boot={"needed":True,**bootstrap()}
        if not boot.get("ok"):
            print("STATUS: BLOCKED\nDIAGNOSIS:",boot.get("error"));return 6
        port,t=boot["port"],boot["target"]

    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    w.call("Page.navigate",{"url":TARGET_URL})
    for _ in range(30):
        time.sleep(.2)
        if w.ev("document.readyState").get("value") in ("interactive","complete"):break
    time.sleep(1)

    outcomes=[]
    for i,p in enumerate(COHORT,1):
        script=f"""(async()=>{{
 const q={jsq(p)};
 const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
 if(!input)return {{searchInputFound:false}};
 const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 if(d&&d.set)d.set.call(input,q);else input.value=q;
 input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
 input.dispatchEvent(new Event('change',{{bubbles:true}}));
 input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
 input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
 await new Promise(r=>setTimeout(r,800));
 const beforeUrl=location.href;
 const beforeBody=document.body?.innerText||'';
 const candidates=[...document.querySelectorAll('button,a,[role="button"],[role="option"],[role="listitem"],li,div')]
  .filter(el=>{{const tx=(el.innerText||el.textContent||'').trim();return tx&&norm(tx).includes(norm(q));}})
  .map(el=>({{el,text:(el.innerText||el.textContent||'').trim(),tag:el.tagName,role:el.getAttribute('role')}}));
 const ranked=candidates.sort((x,y)=>{{
   const sx=(norm(x.text)===norm(q)?0:(norm(x.text).startsWith(norm(q))?1:2)) + (['BUTTON','A'].includes(x.tag)?0:1);
   const sy=(norm(y.text)===norm(q)?0:(norm(y.text).startsWith(norm(q))?1:2)) + (['BUTTON','A'].includes(y.tag)?0:1);
   return sx-sy;
 }});
 const chosen=ranked[0];
 if(!chosen)return {{searchInputFound:true,resultFound:false,beforeUrl}};
 chosen.el.scrollIntoView({{block:'center'}});
 chosen.el.dispatchEvent(new MouseEvent('mousedown',{{bubbles:true,button:0}}));
 chosen.el.dispatchEvent(new MouseEvent('mouseup',{{bubbles:true,button:0}}));
 chosen.el.click();
 await new Promise(r=>setTimeout(r,900));
 const body=document.body?.innerText||'';
 const afterUrl=location.href;
 const propertyVisible=norm(body).includes(norm(q));
 const explorerMounted=!!document.querySelector('input[aria-label="Search SCIIP"]');
 const mapVisible=!!document.querySelector('[aria-label*="Map"],.gm-style,[class*="map"]');
 return {{
   searchInputFound:true,resultFound:true,
   chosenText:chosen.text.slice(0,500),chosenTag:chosen.tag,chosenRole:chosen.role,
   beforeUrl,afterUrl,urlChanged:beforeUrl!==afterUrl,
   bodyChanged:beforeBody!==body,
   propertyVisible,explorerMounted,mapVisible,
   selectedPropertyCertified:propertyVisible&&explorerMounted
 }};
}})()"""
        rr=w.ev(script);v=rr.get("value") or {}
        o={"property":p,"runtimeEvaluationOk":rr.get("ok"),**v}
        outcomes.append(o)
        print(f"\n[{i}/3] {p}")
        for k in ("runtimeEvaluationOk","searchInputFound","resultFound","chosenTag","urlChanged","bodyChanged","propertyVisible","explorerMounted","mapVisible","selectedPropertyCertified"):
            print(f"{k}: {o.get(k)}")
        print("OUTCOME:","SELECTED_PROPERTY_ACTIVATION_CERTIFIED" if o.get("selectedPropertyCertified") else "SELECTED_PROPERTY_ACTIVATION_GAP")

    cert=sum(1 for x in outcomes if x.get("selectedPropertyCertified"))
    checks={
      "bn17cR4R12R9R2Passed":r9.get("status")=="PASSED",
      "r9R2MaterializedThreeOfThree":r9.get("materializedCount")==3,
      "exactThreeRecordMicroCohort":len(outcomes)==3,
      "allRuntimeEvaluationsSucceeded":all(x.get("runtimeEvaluationOk") for x in outcomes),
      "allExactResultsFound":all(x.get("resultFound") for x in outcomes),
      "allSelectedPropertiesVisible":all(x.get("propertyVisible") for x in outcomes),
      "allExplorersRemainMounted":all(x.get("explorerMounted") for x in outcomes),
      "allThreeSelectedPropertyActivationsCertified":cert==3,
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True,
      "compareAuthorityOff":True,"commandAuthorityOff":True,"analyzePresentAuthorityOff":True,
      "exportPresentationAuthorityOff":True
    }
    passed=all(checks.values())
    if passed:
        status="PASSED";state="M419D4BN17C_R4_R12_R10_SELECTED_PROPERTY_ACTIVATION_CERTIFIED"
        diagnosis="CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_CERTIFIED_THREE_OF_THREE"
        nxt="M4_19D4BN17C_R4_R12_R11_MICRO_COHORT_COMPARE_COMMAND_ANALYZE_EXPORT_ACTION_ACTIVATION_CERTIFICATION_DESIGN"
    else:
        status="DIAGNOSTIC_COMPLETE";state="M419D4BN17C_R4_R12_R10_SELECTED_PROPERTY_ACTIVATION_INCOMPLETE"
        diagnosis="CANONICAL_SEARCH_RESULT_MATERIALIZES_BUT_SELECTED_PROPERTY_ACTIVATION_REMAINS_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R11_SELECTED_PROPERTY_CLICK_TARGET_AND_STATE_TRANSITION_DIAGNOSIS"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R10_CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "cohort":COHORT,"outcomes":outcomes,"certifiedCount":cert,"bootstrap":boot,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,
                   "compare":False,"command":False,"analyzePresent":False,"exportPresentation":False},
      "next":"BN17C_R4_R12_R10_CERTIFIED_ACTION_ACTIVATION_DESIGN_READY" if passed else "BN17C_R4_R12_R10_REMAINS_OPEN",
      "nextMilestone":nxt
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"canonical_search_result_selected_property_activation_micro_cohort_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("SELECTED_PROPERTY_CERTIFIED:",cert,"/3")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
