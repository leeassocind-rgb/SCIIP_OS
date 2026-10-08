#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,re,time

APP="http://127.0.0.1:5173/"
APP_ORIGIN="http://127.0.0.1:5173"
PORT=9333
R29A_R2="M4_19D4BN17C_R4_R12_R16A_R29A_R2_SCIIP_APP_RUNTIME_BOOTSTRAP_CDP_REATTACHMENT_AND_CANDIDATE_SELECTION_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R3_EXPLORER_CONTROL_SETTLE_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    try:return json.loads(p.read_text())
    except:return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT")
    with urllib.request.urlopen(req,timeout=5) as r:return json.loads(r.read())

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:raise RuntimeError("invalid websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=10)
        key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
        else:h.extend([255]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+m+bytes(x^m[i%4] for i,x in enumerate(p)))
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        a,b=h;n=b&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b&128 else None
        data=b""
        while len(data)<n:data+=self.s.recv(n-len(data))
        if mask:data=bytes(x^mask[i%4] for i,x in enumerate(data))
        try:return json.loads(data.decode()) if a&15==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x
    def close(self):
        try:self.s.close()
        except:pass

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True})
    rr=((r or {}).get("result")or{})
    if rr.get("exceptionDetails"):return None
    return (rr.get("result")or{}).get("value")

def sample(w,t):
    return ev(w,r"""(()=>{
      const txt=b=>(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim();
      const bs=[...document.querySelectorAll('button')];
      const exact=bs.filter(b=>txt(b)==='Explorer');
      const like=bs.filter(b=>txt(b).toLowerCase().includes('explorer'));
      const vis=exact.filter(b=>b.offsetParent!==null&&!b.disabled);
      return {
        readyState:document.readyState,
        bodyLength:(document.body&&document.body.innerText||'').length,
        buttonCount:bs.length,
        exactExplorerCount:exact.length,
        explorerLikeCount:like.length,
        visibleEnabledExplorerCount:vis.length,
        assignmentsCount:bs.filter(b=>txt(b)==='Assignments').length,
        origin:location.origin,
        url:location.href
      }
    })()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    prior=er/R29A_R2/"sciip_app_runtime_bootstrap_cdp_reattachment_and_candidate_selection_recertification.json"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"explorer_control_settle_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R3 Explorer Control Settle Residual Causal Diagnosis")
    print("="*120)
    print("Mode: SINGLE_FRESH_PAGE_NON_EXPORT_EXPLORER_TIMING_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Explorer click: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    j=loadj(prior)
    if not isinstance(j,dict) or j.get("status")!="DIAGNOSTIC_COMPLETE":
        print("STATUS: BLOCKED");print("REASON: R29A-R2 diagnostic evidence missing or unexpected");return 4
    if not j.get("checks",{}).get("sciipAppReadyAfterBootstrap"):
        print("STATUS: BLOCKED");print("REASON: app runtime was not certified ready");return 5
    if not j.get("checks",{}).get("cdpPort9333AvailableAfterReattachment"):
        print("STATUS: BLOCKED");print("REASON: CDP was not certified ready");return 6

    page=newpage()
    if not page or not page.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("REASON: fresh page creation failed");return 7

    w=WS(page["webSocketDebuggerUrl"])
    w.call("Runtime.enable");w.call("Page.enable")
    times=[0.0,.05,.1,.15,.2,.25,.35,.5,.75,1.0,1.25,1.5,1.75,2.0,2.5,3.0,4.0,5.0]
    samples=[]
    t0=time.time()
    try:
        for t in times:
            while time.time()-t0<t:time.sleep(.005)
            s=sample(w,t);s["t"]=t;samples.append(s)
    finally:
        w.close()

    first_unique=None
    for s in samples:
        if s.get("exactExplorerCount")==1 and s.get("visibleEnabledExplorerCount")==1 and s.get("origin")==APP_ORIGIN:
            first_unique=s["t"];break
    stable_last_five=all(
        s.get("exactExplorerCount")==1 and s.get("visibleEnabledExplorerCount")==1 and s.get("origin")==APP_ORIGIN
        for s in samples[-5:]
    )
    valid_after_2=sum(
        1 for s in samples if s["t"]>=2.0 and s.get("exactExplorerCount")==1 and
        s.get("visibleEnabledExplorerCount")==1 and s.get("origin")==APP_ORIGIN
    )
    materialized_within_two=(first_unique is not None and first_unique<=2.0)

    checks={
      "r29aR2DiagnosticConsumed":True,
      "priorAppRuntimeCertifiedReady":True,
      "priorCdpCertifiedReady":True,
      "freshPageCreated":True,
      "boundedFiveSecondObservationUsed":True,
      "readyStateCaptured":all("readyState" in s for s in samples),
      "buttonCountsCaptured":all("buttonCount" in s for s in samples),
      "exactExplorerCountsCaptured":all("exactExplorerCount" in s for s in samples),
      "explorerLikeCountsCaptured":all("explorerLikeCount" in s for s in samples),
      "visibleEnabledExplorerCountsCaptured":all("visibleEnabledExplorerCount" in s for s in samples),
      "originCaptured":all("origin" in s for s in samples),
      "urlCaptured":all("url" in s for s in samples),
      "firstUniqueExplorerTimeResolved":first_unique is not None,
      "stableWindowEvaluated":True,
      "noExplorerClickPerformed":True,
      "noPropertyClickPerformed":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    classification=("EXPLORER_CONTROL_MATERIALIZED_STABLY_WITHIN_TWO_SECONDS_PRIOR_R29A_SETTLE_FAILURE_TRANSIENT_OR_SELECTOR_LOGIC_MISMATCH"
                    if materialized_within_two and stable_last_five
                    else "EXPLORER_CONTROL_MATERIALIZATION_EXCEEDS_CURRENT_TWO_SECOND_SETTLE_OR_REMAINS_UNSTABLE")
    status="PASSED"
    nxt=("M4_19D4BN17C_R4_R12_R16A_R29A_R4_PAGE_READY_ANCHORED_EXPLORER_SETTLE_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
         if materialized_within_two and stable_last_five
         else "M4_19D4BN17C_R4_R12_R16A_R29A_R4_EXPLORER_SETTLE_POLICY_REPAIR_AND_RECERTIFICATION")

    evd={
      "framework":"SCIIP_EXPLORER_4_R29A_R3_EXPLORER_CONTROL_SETTLE_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":"M419D4BN17C_R4_R12_R16A_R29A_R3_EXPLORER_CONTROL_SETTLE_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "firstUniqueExplorerSeconds":first_unique,
      "stableLastFiveSamples":stable_last_five,
      "validSampleCountAtOrAfter2s":valid_after_2,
      "samples":samples,
      "checks":checks,
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(evd,indent=2)+"\n")

    print("FIRST_UNIQUE_EXPLORER_SECONDS:",first_unique)
    print("STABLE_LAST_FIVE_SAMPLES:",stable_last_five)
    print("VALID_SAMPLE_COUNT_AT_OR_AFTER_2S:",valid_after_2)
    print("\n----- TIMING SAMPLES -----")
    for s in samples:print(json.dumps(s,sort_keys=True))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS:",status)
    print("STATE:",evd["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
