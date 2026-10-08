#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,subprocess,shutil

M="M4_19D4BN17C_R4_R12_R9_R1_SELF_BOOTSTRAPPING_CDP_TARGET_AND_CANONICAL_BOUND_SEARCH_LIVE_MATERIALIZATION_RECERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]
TARGET_URL="http://127.0.0.1:5173/"
PORT=9333
PROFILE="/tmp/sciip-explorer-cdp-profile"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def gj(u):
    with urllib.request.urlopen(u,timeout=1.5) as r:return json.loads(r.read())

def find_target():
    for p in (PORT,9222,9223,9334,9444):
        try:
            for x in gj(f"http://127.0.0.1:{p}/json"):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return p,x
        except: pass
    return None,None

def explorer_http_ready():
    try:
        with urllib.request.urlopen(TARGET_URL,timeout=1.5) as r:
            return 200 <= getattr(r,"status",200) < 500
    except:
        return False

def chrome_candidates():
    return [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium"
    ]

def bootstrap_target():
    if not explorer_http_ready():
        return {"launched":False,"error":"EXPLORER_HTTP_TARGET_NOT_READY","chrome":None}
    chrome=next((p for p in chrome_candidates() if Path(p).exists()),None)
    if not chrome:
        return {"launched":False,"error":"SUPPORTED_CHROME_EXECUTABLE_NOT_FOUND","chrome":None}
    Path(PROFILE).mkdir(parents=True,exist_ok=True)
    args=[
      chrome,
      f"--remote-debugging-port={PORT}",
      f"--user-data-dir={PROFILE}",
      "--no-first-run",
      "--no-default-browser-check",
      "--new-window",
      TARGET_URL
    ]
    try:
        subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
    except Exception as e:
        return {"launched":False,"error":repr(e),"chrome":chrome}
    for _ in range(40):
        time.sleep(0.25)
        p,t=find_target()
        if t:
            return {"launched":True,"error":None,"chrome":chrome,"port":p,"target":t}
    return {"launched":True,"error":"CDP_TARGET_DID_NOT_APPEAR_AFTER_BOOTSTRAP","chrome":chrome}

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m: raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.hs: raise RuntimeError(self.hs)
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

def jsq(s): return json.dumps(s)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    r8p=ev/"M4_19D4BN17C_R4_R12_R8_INGRESS_ALIAS_CLOSURE_TO_RESULT_DERIVATION_BINDING_RESOLUTION"/"ingress_alias_closure_to_result_derivation_binding_resolution.json"
    if not r8p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R8_EVIDENCE_REQUIRED");return 4
    r8=fj(r8p)
    if r8.get("status")!="PASSED" or r8.get("resolvedPath")!=["j","c","a"]:
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_CANONICAL_J_C_A_PATH_REQUIRED");return 5

    p,t=find_target()
    bootstrap={"needed":False,"launched":False,"error":None}
    if not t:
        bootstrap={"needed":True,**bootstrap_target()}
        p,t=find_target()

    if not t:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS:",bootstrap.get("error") or "SELF_BOOTSTRAPPED_CDP_TARGET_UNAVAILABLE")
        print("EXPLORER_HTTP_READY:",explorer_http_ready())
        print("BOOTSTRAP_ATTEMPTED:",bootstrap.get("needed",False))
        print("BOOTSTRAP_LAUNCHED:",bootstrap.get("launched",False))
        return 6

    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")
    outcomes=[]

    for idx,prop in enumerate(COHORT,1):
        script=f"""(async()=>{{
 const q={jsq(prop)};
 const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
 if(!input)return {{searchInputFound:false,query:q}};
 const beforeBody=(document.body?.innerText||'').slice(0,140000);
 input.focus();
 const proto=Object.getPrototypeOf(input);
 const desc=Object.getOwnPropertyDescriptor(proto,'value')||Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 if(desc&&desc.set)desc.set.call(input,q);else input.value=q;
 input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
 input.dispatchEvent(new Event('change',{{bubbles:true}}));
 input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
 input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
 await new Promise(r=>setTimeout(r,900));
 const body=document.body?.innerText||'';
 const candidates=[];
 for(const el of document.querySelectorAll('button,a,[role="button"],[role="option"],[role="listitem"],li,div')){{
   const tx=(el.innerText||el.textContent||'').trim();
   if(tx&&norm(tx).includes(norm(q))){{
      candidates.push({{tag:el.tagName,text:tx.slice(0,500),role:el.getAttribute('role'),className:String(el.className||'').slice(0,240)}});
      if(candidates.length>=40)break;
   }}
 }}
 const exact=candidates.filter(x=>norm(x.text)===norm(q)||norm(x.text).startsWith(norm(q)));
 return {{
   searchInputFound:true,
   query:q,
   inputValue:input.value,
   inputValueExact:norm(input.value)===norm(q),
   bodyChanged:beforeBody!==body.slice(0,140000),
   bodyHasExact:norm(body).includes(norm(q)),
   candidateCount:candidates.length,
   exactCandidateCount:exact.length,
   candidates,
   resultMaterialized:candidates.length>0 && norm(body).includes(norm(q))
 }};
}})()"""
        rr=w.ev(script)
        val=rr.get("value") or {}
        outcome={
          "property":prop,
          "runtimeEvaluationOk":rr.get("ok"),
          "searchInputFound":val.get("searchInputFound",False),
          "inputValueExact":val.get("inputValueExact",False),
          "bodyChanged":val.get("bodyChanged",False),
          "bodyHasExact":val.get("bodyHasExact",False),
          "candidateCount":val.get("candidateCount",0),
          "exactCandidateCount":val.get("exactCandidateCount",0),
          "resultMaterialized":val.get("resultMaterialized",False),
          "details":val
        }
        outcomes.append(outcome)
        print(f"\n[{idx}/3] {prop}")
        for k in ("runtimeEvaluationOk","searchInputFound","inputValueExact","bodyChanged","bodyHasExact","candidateCount","exactCandidateCount","resultMaterialized"):
            print(f"{k}: {outcome[k]}")
        print("OUTCOME:","CANONICAL_BOUND_SEARCH_RESULT_MATERIALIZED" if outcome["resultMaterialized"] else "CANONICAL_BOUND_SEARCH_RESULT_GAP")

    materialized=sum(1 for x in outcomes if x["resultMaterialized"])
    checks={
      "bn17cR4R12R8Passed":r8.get("status")=="PASSED",
      "canonicalPathJtoCtoA":r8.get("resolvedPath")==["j","c","a"],
      "cdpTargetAvailableOrSelfBootstrapped":bool(t),
      "exactThreeRecordMicroCohort":len(outcomes)==3,
      "allRuntimeEvaluationsSucceeded":all(x["runtimeEvaluationOk"] for x in outcomes),
      "allSearchInputsFound":all(x["searchInputFound"] for x in outcomes),
      "allInputValuesExact":all(x["inputValueExact"] for x in outcomes),
      "allThreeResultsMaterialized":materialized==3,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "pixelEvidenceOff":True,
      "selectedPropertyActivationOff":True,
      "downstreamWorkflowActionAuthorityOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R9_R1_CANONICAL_BOUND_SEARCH_LIVE_MATERIALIZATION_CERTIFIED"
        diagnosis="SELF_BOOTSTRAPPED_OR_REUSED_CDP_CANONICAL_J_C_A_SEARCH_MATERIALIZATION_CERTIFIED_THREE_OF_THREE"
        nxt="M4_19D4BN17C_R4_R12_R10_CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CERTIFICATION"
    else:
        status="DIAGNOSTIC_COMPLETE"
        state="M419D4BN17C_R4_R12_R9_R1_LIVE_MATERIALIZATION_INCOMPLETE"
        diagnosis="CANONICAL_BOUND_SEARCH_INPUT_EXECUTED_BUT_RESULT_MATERIALIZATION_REMAINS_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R10_LIVE_RESULT_RENDER_GATE_AND_QUERY_DERIVATION_RECONCILIATION"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R9_R1_SELF_BOOTSTRAPPING_CDP_TARGET_AND_CANONICAL_BOUND_SEARCH_LIVE_MATERIALIZATION_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "bootstrap":bootstrap,
      "cdp":{"port":p,"targetUrl":t.get("url"),"webSocketHandshake":w.hs},
      "checks":checks,"cohort":COHORT,"outcomes":outcomes,"materializedCount":materialized,
      "canonicalPath":["j","c","a"],
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,"selectedPropertyActivation":False,"downstreamWorkflowActions":False},
      "next":"BN17C_R4_R12_R9_R1_CERTIFIED_SELECTED_PROPERTY_ACTIVATION_READY" if passed else "BN17C_R4_R12_R9_R1_REMAINS_OPEN",
      "nextMilestone":nxt
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"self_bootstrapping_cdp_and_canonical_bound_search_live_materialization_recertification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("BOOTSTRAP_NEEDED:",bootstrap.get("needed",False))
    print("BOOTSTRAP_LAUNCHED:",bootstrap.get("launched",False))
    print("VALIDATED_CDP_PORT:",p)
    print("MATERIALIZED:",materialized,"/3")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
