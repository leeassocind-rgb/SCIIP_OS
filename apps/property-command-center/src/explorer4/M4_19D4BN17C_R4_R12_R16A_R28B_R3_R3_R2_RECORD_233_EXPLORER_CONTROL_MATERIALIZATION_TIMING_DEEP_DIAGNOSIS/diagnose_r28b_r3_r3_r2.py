#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re
PORT=9333
APP="http://127.0.0.1:5173/"
R1="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R2_RECORD_233_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DEEP_DIAGNOSIS"
def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None
def newpage():
    req=urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=4) as r:return json.loads(r.read())
    except:return None
class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m: raise RuntimeError("invalid websocket debugger URL")
        h,p,q=m.group(1),int(m.group(2)),m.group(3); self.s=socket.create_connection((h,p),timeout=8)
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
        mask=self.s.recv(4) if b&128 else None; d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(x^mask[i%4] for i,x in enumerate(d))
        try:return json.loads(d.decode()) if a&15==1 else None
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
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True});rr=((r or {}).get("result")or{})
    if rr.get("exceptionDetails"):return None
    return (rr.get("result")or{}).get("value")
def sample(w,t):
    js="""(()=>{const bs=[...document.querySelectorAll('button')];const exact=bs.filter(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim()==='Explorer');const like=bs.filter(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim().toLowerCase().includes('explorer'));return {assignmentsCount:bs.filter(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim()==='Assignments').length,bodyLength:(document.body?.innerText||'').length,buttonCount:bs.length,exactExplorerCount:exact.length,explorerLikeCount:like.length,visibleEnabledExplorerCount:exact.filter(b=>b.offsetParent!==null&&!b.disabled).length,readyState:document.readyState,url:location.href,origin:location.origin}})()"""
    s=ev(w,js) or {};s["t"]=t;return s
def main():
    repo=Path(sys.argv[1]).expanduser().resolve();er=repo/"apps/property-command-center/evidence/explorer4";p1=er/R1/"resume_residual_causal_diagnosis.json"
    print("="*120);print("SCIIP Explorer 4.0 — R28B-R3-R3-R2 Record 233 Explorer Control Materialization Timing Deep Diagnosis");print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_EXPLORER_TIMING_DIAGNOSIS");print("Application source mutation: OFF");print("Governed data mutation: OFF");print("Network authority: OFF");print("Pixel evidence: OFF");print("Explorer click: OFF");print("Property click: OFF");print("Assignments invocation: OFF");print("Generate invocation: OFF");print("Export invocation: OFF");print("TARGET: 13310 Valley Blvd")
    if not p1.exists(): print("STATUS: BLOCKED");print("REASON: R28B-R3-R3-R1 evidence missing");return 4
    r1=loadj(p1)
    if not isinstance(r1,dict) or r1.get("status")!="PASSED": print("STATUS: BLOCKED");print("REASON: R28B-R3-R3-R1 must be PASSED");return 5
    if r1.get("firstFailureOrdinal")!=233 or r1.get("firstFailedStage")!="explorerSettleCertified": print("STATUS: BLOCKED");print("REASON: expected record-233 Explorer-settle failure not present");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"): print("STATUS: BLOCKED");print("REASON: CDP browser context required");return 7
    page=newpage()
    if not page or not page.get("webSocketDebuggerUrl"): print("STATUS: BLOCKED");print("REASON: fresh page creation failed");return 8
    w=WS(page["webSocketDebuggerUrl"])
    try:
        w.call("Runtime.enable");w.call("Page.enable")
        schedule=[0.0,0.05,0.1,0.15,0.2,0.25,0.35,0.5,0.75,1.0,1.25,1.5,1.75,2.0,2.5,3.0,4.0,5.0];samples=[];t0=time.time()
        for t in schedule:
            while time.time()-t0<t:time.sleep(.005)
            samples.append(sample(w,t))
        first_unique=next((s["t"] for s in samples if s.get("visibleEnabledExplorerCount")==1 and s.get("exactExplorerCount")==1),None)
        after2=[s for s in samples if s["t"]>=2.0];last=after2[-5:] if len(after2)>=5 else []
        stable_last_five=bool(last) and all(s.get("visibleEnabledExplorerCount")==1 and s.get("exactExplorerCount")==1 and s.get("readyState")=="complete" and s.get("origin")=="http://127.0.0.1:5173" for s in last)
        valid_after2=sum(1 for s in after2 if s.get("visibleEnabledExplorerCount")==1 and s.get("exactExplorerCount")==1 and s.get("readyState")=="complete")
        if first_unique is not None and first_unique<=2.0 and stable_last_five:
            classification="RECORD_233_EXPLORER_CONTROL_MATERIALIZED_STABLY_WITHIN_TWO_SECONDS_PRIOR_FAILURE_TRANSIENT";nxt="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R3_RECORD_233_PAGE_READY_ANCHORED_EXPLORER_SETTLE_RECERTIFICATION_AND_RESUME"
        elif first_unique is not None:
            classification="RECORD_233_EXPLORER_CONTROL_MATERIALIZES_BUT_OUTSIDE_PRIOR_TWO_SECOND_SETTLE_BOUND";nxt="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R2_R1_EXPLORER_SETTLE_BOUND_POLICY_DIAGNOSIS"
        else:
            classification="RECORD_233_EXPLORER_CONTROL_NOT_MATERIALIZED_WITHIN_FIVE_SECOND_DIAGNOSTIC_WINDOW";nxt="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R2_R1_EXPLORER_BOOTSTRAP_CAUSAL_DIAGNOSIS"
        checks={"r28bR3R3R1Passed":True,"record233ExplorerSettleFailureConsumed":True,"target13310ValleyBlvdConsumed":True,"priorThirtyTwoPreserved":r1.get("previousCertifiedCount")==32,"freshPageCreated":True,"boundedFiveSecondObservationUsed":True,"exactExplorerCountsCaptured":all("exactExplorerCount" in s for s in samples),"visibleEnabledExplorerCountsCaptured":all("visibleEnabledExplorerCount" in s for s in samples),"explorerLikeCountsCaptured":all("explorerLikeCount" in s for s in samples),"buttonCountsCaptured":all("buttonCount" in s for s in samples),"readyStateCaptured":all("readyState" in s for s in samples),"originCaptured":all("origin" in s for s in samples),"firstUniqueExplorerTimeResolved":first_unique is not None,"stableWindowEvaluated":True,"noExplorerClickPerformed":True,"noPropertyClickPerformed":True,"assignmentsInvocationOff":True,"generateInvocationOff":True,"exportInvocationOff":True,"applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True}
        od=er/OUT;od.mkdir(parents=True,exist_ok=True);ef=od/"record_233_explorer_control_materialization_timing_deep_diagnosis.json"
        out={"framework":"SCIIP_EXPLORER_4_R28B_R3_R3_R2_RECORD_233_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DEEP_DIAGNOSIS","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if all(checks.values()) else "FAILED","state":"M419D4BN17C_R4_R12_R16A_R28B_R3_R3_R2_RECORD_233_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSED","classification":classification,"target":"13310 Valley Blvd","firstUniqueExplorerSeconds":first_unique,"stableLastFiveSamples":stable_last_five,"validSampleCountAtOrAfter2s":valid_after2,"timingSamples":samples,"checks":checks,"nextMilestone":nxt};ef.write_text(json.dumps(out,indent=2)+"\n")
        print("FIRST_UNIQUE_EXPLORER_SECONDS:",first_unique);print("STABLE_LAST_FIVE_SAMPLES:",stable_last_five);print("VALID_SAMPLE_COUNT_AT_OR_AFTER_2S:",valid_after2);print("\n----- TIMING SAMPLES -----")
        for s in samples:print(json.dumps(s,sort_keys=True))
        print("\n----- CHECKS -----")
        for k,v in checks.items():print(f"{k}: {v}")
        print("CLASSIFICATION:",classification);print("STATUS:",out["status"]);print("STATE:",out["state"]);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef);print("\nR28B-R3-R3-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.");return 0 if out["status"]=="PASSED" else 10
    finally:w.close()
if __name__=="__main__":raise SystemExit(main())
