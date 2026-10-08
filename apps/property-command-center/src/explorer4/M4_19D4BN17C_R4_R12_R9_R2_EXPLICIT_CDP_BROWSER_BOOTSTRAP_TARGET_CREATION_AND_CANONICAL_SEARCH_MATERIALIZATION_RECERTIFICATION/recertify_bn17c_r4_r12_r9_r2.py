#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time,subprocess,tempfile

M="M4_19D4BN17C_R4_R12_R9_R2_EXPLICIT_CDP_BROWSER_BOOTSTRAP_TARGET_CREATION_AND_CANONICAL_SEARCH_MATERIALIZATION_RECERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]
TARGET_URL="http://127.0.0.1:5173/"
PORT_CANDIDATES=[9333,9334,9335,9444,9555]

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def http_json(url,method="GET",timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:
        return json.loads(r.read())

def explorer_http_ready():
    try:
        with urllib.request.urlopen(TARGET_URL,timeout=1.5) as r:
            return 200 <= getattr(r,"status",200) < 500
    except:
        return False

def list_targets(port):
    try:return http_json(f"http://127.0.0.1:{port}/json",timeout=1)
    except:return []

def find_explorer_target():
    for p in PORT_CANDIDATES+[9222,9223]:
        for x in list_targets(p):
            u=x.get("url","")
            if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                return p,x
    return None,None

def browser_endpoint_ready(port):
    try:
        v=http_json(f"http://127.0.0.1:{port}/json/version",timeout=1)
        return bool(v.get("Browser") or v.get("webSocketDebuggerUrl")),v
    except Exception:
        return False,None

def create_target(port):
    encoded=urllib.parse.quote(TARGET_URL,safe=":/")
    urls=[
      f"http://127.0.0.1:{port}/json/new?{encoded}",
      f"http://127.0.0.1:{port}/json/new?url={encoded}"
    ]
    errs=[]
    for u in urls:
        try:
            x=http_json(u,method="PUT",timeout=2)
            if x.get("webSocketDebuggerUrl"):return x,errs
        except Exception as e:errs.append(repr(e))
    return None,errs

def chrome_candidates():
    return [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium"
    ]

def bootstrap():
    if not explorer_http_ready():
        return {"ok":False,"error":"EXPLORER_HTTP_TARGET_NOT_READY"}
    chrome=next((p for p in chrome_candidates() if Path(p).exists()),None)
    if not chrome:return {"ok":False,"error":"SUPPORTED_CHROME_EXECUTABLE_NOT_FOUND"}
    attempts=[]
    for port in PORT_CANDIDATES:
        ready,_=browser_endpoint_ready(port)
        if ready:
            target,errs=create_target(port)
            if target:
                return {"ok":True,"chrome":chrome,"port":port,"profile":None,"launched":False,"targetCreated":True,"target":target,"createErrors":errs}
            # Existing CDP browser but target create failed; try next port with fresh browser.
        profile=tempfile.mkdtemp(prefix=f"sciip-explorer-cdp-{port}-")
        args=[
          chrome,
          f"--remote-debugging-port={port}",
          "--remote-debugging-address=127.0.0.1",
          f"--user-data-dir={profile}",
          "--headless=new",
          "--disable-gpu",
          "--no-first-run",
          "--no-default-browser-check",
          "--disable-background-networking",
          "about:blank"
        ]
        try:
            proc=subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        except Exception as e:
            attempts.append({"port":port,"profile":profile,"launchError":repr(e)})
            continue
        version=None
        for _ in range(60):
            time.sleep(0.2)
            ready,version=browser_endpoint_ready(port)
            if ready:break
        if not ready:
            attempts.append({"port":port,"profile":profile,"pid":proc.pid,"browserEndpointReady":False})
            continue
        target,errs=create_target(port)
        if target:
            # Wait until target appears in /json as well.
            seen=False
            for _ in range(40):
                time.sleep(0.15)
                for x in list_targets(port):
                    if x.get("id")==target.get("id") or "127.0.0.1:5173" in x.get("url",""):
                        target=x;seen=True;break
                if seen:break
            return {
              "ok":True,"chrome":chrome,"port":port,"profile":profile,"pid":proc.pid,
              "launched":True,"browserEndpointReady":True,"browserVersion":version,
              "targetCreated":True,"targetObservedInList":seen,"target":target,"createErrors":errs,
              "attempts":attempts
            }
        attempts.append({"port":port,"profile":profile,"pid":proc.pid,"browserEndpointReady":True,"targetCreateErrors":errs})
    return {"ok":False,"error":"EXPLICIT_CDP_TARGET_CREATION_FAILED","attempts":attempts}

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
        return {"ok":not x.get("error") and ex is None,"value":rr.get("value"),"exceptionDetails":ex,"topLevelError":x.get("error")}

def jsq(s):return json.dumps(s)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    r8p=ev/"M4_19D4BN17C_R4_R12_R8_INGRESS_ALIAS_CLOSURE_TO_RESULT_DERIVATION_BINDING_RESOLUTION"/"ingress_alias_closure_to_result_derivation_binding_resolution.json"
    if not r8p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R8_EVIDENCE_REQUIRED");return 4
    r8=fj(r8p)
    if r8.get("status")!="PASSED" or r8.get("resolvedPath")!=["j","c","a"]:
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_CANONICAL_J_C_A_PATH_REQUIRED");return 5

    port,target=find_explorer_target()
    boot={"needed":False,"ok":True,"reusedExistingTarget":True}
    if not target:
        boot={"needed":True,**bootstrap()}
        if boot.get("ok"):
            port=boot.get("port");target=boot.get("target")
        else:
            print("STATUS: BLOCKED")
            print("DIAGNOSIS:",boot.get("error"))
            print("EXPLORER_HTTP_READY:",explorer_http_ready())
            print("BOOTSTRAP_ATTEMPTS:",json.dumps(boot.get("attempts",[])))
            return 6

    # Give created target a moment to load Explorer.
    wsurl=target.get("webSocketDebuggerUrl")
    if not wsurl:
        print("STATUS: BLOCKED\nDIAGNOSIS: CREATED_TARGET_MISSING_WEBSOCKET_URL");return 7
    w=WS(wsurl);w.call("Runtime.enable")
    # Navigate explicitly in case target remained about:blank.
    w.call("Page.enable")
    w.call("Page.navigate",{"url":TARGET_URL})
    for _ in range(30):
        time.sleep(0.2)
        rr=w.ev("document.readyState")
        if rr.get("value") in ("interactive","complete"):break
    # Additional app mount settling.
    time.sleep(1.0)

    outcomes=[]
    for idx,prop in enumerate(COHORT,1):
        script=f"""(async()=>{{
 const q={jsq(prop)};
 const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
 if(!input)return {{searchInputFound:false,query:q,body:(document.body?.innerText||'').slice(0,1000)}};
 const before=(document.body?.innerText||'').slice(0,140000);
 input.focus();
 const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 if(d&&d.set)d.set.call(input,q);else input.value=q;
 input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
 input.dispatchEvent(new Event('change',{{bubbles:true}}));
 input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
 input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
 await new Promise(r=>setTimeout(r,1000));
 const body=document.body?.innerText||'';
 const candidates=[];
 for(const el of document.querySelectorAll('button,a,[role="button"],[role="option"],[role="listitem"],li,div')){{
   const tx=(el.innerText||el.textContent||'').trim();
   if(tx&&norm(tx).includes(norm(q))){{
     candidates.push({{tag:el.tagName,text:tx.slice(0,500),role:el.getAttribute('role'),className:String(el.className||'').slice(0,220)}});
     if(candidates.length>=40)break;
   }}
 }}
 const exact=candidates.filter(x=>norm(x.text)===norm(q)||norm(x.text).startsWith(norm(q)));
 return {{
   searchInputFound:true,query:q,inputValue:input.value,inputValueExact:norm(input.value)===norm(q),
   bodyChanged:before!==body.slice(0,140000),bodyHasExact:norm(body).includes(norm(q)),
   candidateCount:candidates.length,exactCandidateCount:exact.length,candidates,
   resultMaterialized:candidates.length>0&&norm(body).includes(norm(q))
 }};
}})()"""
        rr=w.ev(script);val=rr.get("value") or {}
        o={
          "property":prop,"runtimeEvaluationOk":rr.get("ok"),"searchInputFound":val.get("searchInputFound",False),
          "inputValueExact":val.get("inputValueExact",False),"bodyChanged":val.get("bodyChanged",False),
          "bodyHasExact":val.get("bodyHasExact",False),"candidateCount":val.get("candidateCount",0),
          "exactCandidateCount":val.get("exactCandidateCount",0),"resultMaterialized":val.get("resultMaterialized",False),
          "details":val
        }
        outcomes.append(o)
        print(f"\n[{idx}/3] {prop}")
        for k in ("runtimeEvaluationOk","searchInputFound","inputValueExact","bodyChanged","bodyHasExact","candidateCount","exactCandidateCount","resultMaterialized"):
            print(f"{k}: {o[k]}")
        print("OUTCOME:","CANONICAL_BOUND_SEARCH_RESULT_MATERIALIZED" if o["resultMaterialized"] else "CANONICAL_BOUND_SEARCH_RESULT_GAP")

    materialized=sum(1 for x in outcomes if x["resultMaterialized"])
    checks={
      "bn17cR4R12R8Passed":r8.get("status")=="PASSED",
      "canonicalPathJtoCtoA":r8.get("resolvedPath")==["j","c","a"],
      "explorerHttpReady":explorer_http_ready(),
      "browserCdpEndpointAvailable":bool(port),
      "explorerPageTargetAvailable":bool(target),
      "exactThreeRecordMicroCohort":len(outcomes)==3,
      "allRuntimeEvaluationsSucceeded":all(x["runtimeEvaluationOk"] for x in outcomes),
      "allSearchInputsFound":all(x["searchInputFound"] for x in outcomes),
      "allInputValuesExact":all(x["inputValueExact"] for x in outcomes),
      "allThreeResultsMaterialized":materialized==3,
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True,
      "selectedPropertyActivationOff":True,"downstreamWorkflowActionAuthorityOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED";state="M419D4BN17C_R4_R12_R9_R2_CANONICAL_BOUND_SEARCH_LIVE_MATERIALIZATION_CERTIFIED"
        diagnosis="EXPLICIT_CDP_TARGET_CREATED_CANONICAL_J_C_A_SEARCH_MATERIALIZATION_CERTIFIED_THREE_OF_THREE"
        nxt="M4_19D4BN17C_R4_R12_R10_CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CERTIFICATION"
    else:
        status="DIAGNOSTIC_COMPLETE";state="M419D4BN17C_R4_R12_R9_R2_LIVE_MATERIALIZATION_INCOMPLETE"
        diagnosis="EXPLICIT_CDP_TARGET_CREATED_CANONICAL_SEARCH_EXECUTED_RESULT_MATERIALIZATION_REMAINS_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R10_LIVE_RESULT_RENDER_GATE_AND_QUERY_DERIVATION_RECONCILIATION"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R9_R2_EXPLICIT_CDP_BROWSER_BOOTSTRAP_TARGET_CREATION_AND_CANONICAL_SEARCH_MATERIALIZATION_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "bootstrap":boot,"cdp":{"port":port,"targetId":target.get("id"),"targetUrl":target.get("url"),"handshake":w.hs},
      "checks":checks,"cohort":COHORT,"outcomes":outcomes,"materializedCount":materialized,
      "canonicalPath":["j","c","a"],
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,"selectedPropertyActivation":False,"downstreamWorkflowActions":False},
      "next":"BN17C_R4_R12_R9_R2_CERTIFIED_SELECTED_PROPERTY_ACTIVATION_READY" if passed else "BN17C_R4_R12_R9_R2_REMAINS_OPEN",
      "nextMilestone":nxt
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"explicit_cdp_target_creation_and_canonical_search_materialization_recertification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("BOOTSTRAP_NEEDED:",boot.get("needed",False))
    print("BROWSER_CDP_ENDPOINT_READY:",bool(port))
    print("TARGET_CREATED_EXPLICITLY:",boot.get("targetCreated",False))
    print("VALIDATED_CDP_PORT:",port)
    print("MATERIALIZED:",materialized,"/3")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
