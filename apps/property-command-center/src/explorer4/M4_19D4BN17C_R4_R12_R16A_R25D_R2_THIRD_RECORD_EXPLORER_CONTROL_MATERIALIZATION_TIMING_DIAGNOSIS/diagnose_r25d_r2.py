#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R25D_R1="M4_19D4BN17C_R4_R12_R16A_R25D_R1_GUARDED_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS"
R25D_R1_STATE="M419D4BN17C_R4_R12_R16A_R25D_R1_GUARDED_EXPORT_RESIDUAL_CAUSE_DIAGNOSED"
R25D_R1_CLASS="THIRD_RECORD_FRESH_PAGE_CREATED_BUT_EXPLORER_CONTROL_DID_NOT_SETTLE"
TARGET="8700 - 8750 Rex Rd"
M="M4_19D4BN17C_R4_R12_R16A_R25D_R2_THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSIS"
PORT=9333
APP="http://127.0.0.1:5173/"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None

class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("ws")
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
        mask=self.s.recv(4) if b&128 else None;d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(x^mask[i%4] for i,x in enumerate(d))
        try:return json.loads(d.decode()) if a&15==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R25D_R1/"guarded_export_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R25D-R2 Third Record Explorer Control Materialization Timing Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_EXPLORER_TIMING_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25D_R1_EVIDENCE_REQUIRED");return 4
    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=R25D_R1_STATE or d.get("classification")!=R25D_R1_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_EXPLORER_MATERIALIZATION_CAUSE_REQUIRED");return 5
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 6

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_REQUIRED");return 7

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    schedule=[0.0,0.05,0.1,0.15,0.2,0.25,0.35,0.5,0.75,1.0,1.25,1.5,1.75,2.0,2.5,3.0,4.0,5.0]
    samples=[]
    st=time.time()
    try:
        for t in schedule:
            while time.time()-st<t: time.sleep(.005)
            v=ev(w,r"""(()=>{
const ns=s=>(s||'').replace(/\s+/g,' ').trim();
const buttons=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map((b,i)=>({i,text:ns(b.innerText||b.textContent||''),disabled:!!b.disabled,cls:b.className||''}));
const exact=buttons.filter(x=>x.text==='Explorer'&&!x.disabled);
const like=buttons.filter(x=>/Explorer/i.test(x.text)&&!x.disabled);
const assignments=buttons.filter(x=>x.text==='Assignments'&&!x.disabled);
return{
 exactExplorerCount:exact.length,
 explorerLikeCount:like.length,
 exactExplorerTexts:exact.map(x=>x.text),
 explorerLikeTexts:like.slice(0,20).map(x=>x.text),
 assignmentsCount:assignments.length,
 buttonCount:buttons.length,
 bodyLength:(document.body?.innerText||'').length,
 readyState:document.readyState,
 url:location.href
};
})()""") or {}
            v["t"]=t
            samples.append(v)
    finally:
        try:w.call("Page.close")
        except:pass

    exact_times=[s["t"] for s in samples if s.get("exactExplorerCount")==1]
    first_unique=exact_times[0] if exact_times else None
    stable_last_five=(len(samples)>=5 and all(s.get("exactExplorerCount")==1 for s in samples[-5:]))
    valid_after_2=[s for s in samples if s["t"]>=2.0 and s.get("exactExplorerCount")==1]

    if first_unique is not None and first_unique<=2.0 and stable_last_five:
        classification="THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_WITHIN_TWO_SECONDS_PRIOR_FAILURE_TRANSIENT"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25D_R3_BOUNDED_EXPLORER_SETTLE_AND_EXACT_FIFTY_EXPORT_RECERTIFICATION"
    elif first_unique is not None and first_unique>2.0 and stable_last_five:
        classification="THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_DELAYED_BEYOND_EXISTING_TWO_SECOND_GUARD"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25D_R3_EXTENDED_BOUNDED_EXPLORER_SETTLE_AND_EXACT_FIFTY_EXPORT_RECERTIFICATION"
    else:
        classification="THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_UNSTABLE_OR_ABSENT"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25D_R2_R1_EXPLORER_CONTROL_MATERIALIZATION_DEEP_CAUSAL_DIAGNOSIS"

    checks={
      "r25dR1Passed":True,
      "explorerMaterializationCauseConsumed":True,
      "freshPageCreated":True,
      "boundedFiveSecondObservationUsed":True,
      "exactExplorerCountsCaptured":True,
      "explorerLikeCountsCaptured":True,
      "buttonCountsCaptured":True,
      "readyStateCaptured":True,
      "firstUniqueExplorerTimeResolved":first_unique is not None,
      "stabilityWindowEvaluated":True,
      "noExplorerClickPerformed":True,
      "noPropertyClickPerformed":True,
      "assignmentsInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    state="M419D4BN17C_R4_R12_R16A_R25D_R2_THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSED"
    out={
      "framework":"SCIIP_EXPLORER_4_R25D_R2_THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":state,
      "classification":classification,
      "target":TARGET,
      "firstUniqueExplorerSeconds":first_unique,
      "stableLastFiveSamples":stable_last_five,
      "validSampleCountAtOrAfterTwoSeconds":len(valid_after_2),
      "samples":samples,
      "checks":checks,
      "authority":{
        "explorerClick":False,
        "propertyClick":False,
        "assignmentsInvocation":False,
        "exportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "sourceEvidence":{"r25dR1Path":str(p),"r25dR1Sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
      "nextMilestone":nxt
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"third_record_explorer_control_materialization_timing_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("TARGET:",TARGET)
    print("FIRST_UNIQUE_EXPLORER_SECONDS:",first_unique)
    print("STABLE_LAST_FIVE_SAMPLES:",stable_last_five)
    print("VALID_SAMPLE_COUNT_AT_OR_AFTER_2S:",len(valid_after_2))
    print()
    print("----- TIMING SAMPLES -----")
    for s in samples: print(json.dumps(s,ensure_ascii=False))
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
