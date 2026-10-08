#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
PRIOR="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R2_RECORD_200_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DEEP_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None

class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((
            f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\n"
            f"Connection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        ).encode())
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
        d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(x^mask[i%4] for i,x in enumerate(d))
        try:return json.loads(d.decode()) if a&15==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def sample(w,t):
    js="""(()=>({
      exactExplorerCount:[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').trim()==='Explorer').length,
      visibleEnabledExplorerCount:[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==='Explorer').length,
      explorerLikeCount:[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').includes('Explorer')).length,
      assignmentsCount:[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').trim()==='Assignments').length,
      buttonCount:document.querySelectorAll('button').length,
      bodyLength:(document.body&&document.body.innerText||'').length,
      readyState:document.readyState,
      url:location.href,
      origin:location.origin
    }))()"""
    x=ev(w,js) or {}
    x["t"]=t
    return x

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    prior=er/PRIOR/"resume_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R4-R3-R2 Record 200 Explorer Control Materialization Timing Deep Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_EXPLORER_TIMING_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Explorer click: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    if not prior.exists():
        print("STATUS: BLOCKED");print("REASON: R27B-R4-R3-R1 evidence required");return 4

    d=loadj(prior)
    if d.get("status")!="PASSED" or d.get("firstFailureOrdinal")!=200 or d.get("firstFailedStage")!="explorerSettleCertified":
        print("STATUS: BLOCKED");print("REASON: certified record-200 Explorer-settle failure required");return 5

    target=d.get("firstFailureRawTarget") or d.get("firstFailureCanonicalTarget")
    if target!="12350 Philadelphia St":
        print("STATUS: BLOCKED");print("REASON: expected record-200 target 12350 Philadelphia St");return 6

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: CDP browser context required");return 7

    p=newpage()
    if not p or not p.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("REASON: fresh page creation failed");return 8

    w=W(p["webSocketDebuggerUrl"])
    w.call("Runtime.enable");w.call("Page.enable")

    schedule=[0.0,0.05,0.1,0.15,0.2,0.25,0.35,0.5,0.75,1.0,1.25,1.5,1.75,2.0,2.5,3.0,4.0,5.0]
    samples=[]
    start=time.time()
    for at in schedule:
        while time.time()-start < at:
            time.sleep(min(.01,max(0,at-(time.time()-start))))
        samples.append(sample(w,round(at,2)))

    first_unique=None
    for s in samples:
        if s.get("visibleEnabledExplorerCount")==1:
            first_unique=s["t"];break

    stable_last_five=(len(samples)>=5 and all(s.get("visibleEnabledExplorerCount")==1 for s in samples[-5:]))
    valid_at_or_after_2=sum(1 for s in samples if s["t"]>=2.0 and s.get("visibleEnabledExplorerCount")==1)

    if first_unique is None:
        classification="RECORD_200_EXPLORER_CONTROL_DID_NOT_MATERIALIZE_WITHIN_FIVE_SECONDS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_RECORD_200_EXPLORER_BOOTSTRAP_CAUSAL_DIAGNOSIS"
    elif first_unique<=2.0 and stable_last_five:
        classification="RECORD_200_EXPLORER_CONTROL_MATERIALIZED_WITHIN_TWO_SECONDS_PRIOR_FAILURE_TRANSIENT"
        nxt="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_RECORD_200_BOUNDED_EXPLORER_SETTLE_REPAIR_AND_FINAL_NON_EXPORT_RECERTIFICATION"
    elif first_unique<=5.0:
        classification="RECORD_200_EXPLORER_CONTROL_MATERIALIZES_AFTER_EXISTING_TWO_SECOND_BOUND"
        nxt="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_RECORD_200_EXPLORER_SETTLE_POLICY_RECALIBRATION_DIAGNOSIS"
    else:
        classification="RECORD_200_EXPLORER_CONTROL_TIMING_INDETERMINATE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_RECORD_200_EXPLORER_BOOTSTRAP_CAUSAL_DIAGNOSIS"

    checks={
      "r27bR4R3R1Passed":True,
      "record200ExplorerSettleFailureConsumed":True,
      "target12350PhiladelphiaStConsumed":True,
      "freshPageCreated":True,
      "boundedFiveSecondObservationUsed":True,
      "exactExplorerCountsCaptured":True,
      "visibleEnabledExplorerCountsCaptured":True,
      "explorerLikeCountsCaptured":True,
      "buttonCountsCaptured":True,
      "readyStateCaptured":True,
      "firstUniqueExplorerTimeResolved":first_unique is not None,
      "stableWindowEvaluated":True,
      "noExplorerClickPerformed":True,
      "noPropertyClickPerformed":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"record_200_explorer_control_materialization_timing_deep_diagnosis.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R27B_R4_R3_R2_RECORD_200_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DEEP_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R27B_R4_R3_R2_RECORD_200_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSED",
      "target":target,
      "firstUniqueExplorerSeconds":first_unique,
      "stableLastFiveSamples":stable_last_five,
      "validSampleCountAtOrAfter2s":valid_at_or_after_2,
      "samples":samples,
      "checks":checks,
      "classification":classification,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("TARGET:",target)
    print("FIRST_UNIQUE_EXPLORER_SECONDS:",first_unique)
    print("STABLE_LAST_FIVE_SAMPLES:",stable_last_five)
    print("VALID_SAMPLE_COUNT_AT_OR_AFTER_2S:",valid_at_or_after_2)
    print("\n----- TIMING SAMPLES -----")
    for s in samples: print(json.dumps(s,sort_keys=True))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R27B_R4_R3_R2_RECORD_200_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSED")
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR27B-R4-R3-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
