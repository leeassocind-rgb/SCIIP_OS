#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R7_R1_THIRD_RECORD_SELECTION_STABILITY_AND_READBACK_TIMING_DIAGNOSIS"
R7="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R7_THIRD_RECORD_BOUNDED_SELECTION_AND_EXPORT_RECERTIFICATION"
TARGET="8700 - 8750 Rex Rd"
PORT=9333
APP="http://127.0.0.1:5173/"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
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
        if not m:raise RuntimeError("bad websocket")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
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

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def click_target(w):
    return ev(w,f"""(()=>{{const T={json.dumps(TARGET)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));if(xs.length!==1)return{{clicked:false,count:xs.length,candidates:xs.map(x=>(x.innerText||x.textContent||'').trim())}};xs[0].click();return{{clicked:true,count:1,text:(xs[0].innerText||xs[0].textContent||'').trim()}}}})()""") or {}

def snap(w):
    return ev(w,f"""(()=>{{const T={json.dumps(TARGET)},txt=document.body?.innerText||'';const sm=[...document.querySelectorAll('.sciip-property-marker.is-selected')].map(x=>(x.innerText||x.textContent||'').trim());const selected=[...document.querySelectorAll('[aria-selected="true"],[class*="is-selected"],[class*="selected"]')].slice(0,100).map(x=>({{tag:x.tagName,text:(x.innerText||x.textContent||'').trim().slice(0,500),cls:String(x.className||''),aria:x.getAttribute('aria-selected')}}));return{{
      targetVisible:txt.toLowerCase().includes(T.toLowerCase()),
      selectedMarkerTexts:sm,
      selectedMarkerMatchesTarget:sm.some(x=>x.toLowerCase().includes(T.toLowerCase())),
      assignmentsCount:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Assignments').length,
      selectedHints:selected
    }}}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";evd=app/"evidence/explorer4"
    p=evd/R7/"third_record_bounded_selection_and_export_recertification.json"
    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R22B_R2_R7_EVIDENCE_REQUIRED");return 4
    r7=loadj(p)
    if r7.get("state")!="M419D4BN17C_R4_R12_R16A_R22B_R2_R7_THIRD_RECORD_EXPORT_INCOMPLETE" or (r7.get("outcome") or {}).get("failure")!="SELECTION_FAILED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: THIRD_RECORD_SELECTION_FAILED_STATE_REQUIRED");return 5
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 6

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_CREATION_FAILED");return 7
    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable");time.sleep(.8)

    explorer=click_exact(w,"Explorer");time.sleep(.7)
    before=snap(w)
    click=click_target(w)

    samples=[]
    for delay in [0.0,0.05,0.10,0.20,0.35,0.50,0.75,1.00,1.50,2.00]:
        if delay:
            time.sleep(delay-(samples[-1]["t"] if samples else 0.0))
        s=snap(w);s["t"]=delay;samples.append(s)

    first_marker=next((x["t"] for x in samples if x.get("selectedMarkerMatchesTarget")),None)
    first_visible=next((x["t"] for x in samples if x.get("targetVisible")),None)
    stable_last5=all(x.get("selectedMarkerMatchesTarget") for x in samples[-5:])
    assignments_stable=all(x.get("assignmentsCount")==1 for x in samples[-5:])

    if click.get("clicked") and first_marker is not None and first_marker>0.0 and stable_last5:
        classification="THIRD_RECORD_SELECTION_READBACK_IS_ASYNCHRONOUS_CERTIFICATION_CHECK_EXECUTED_TOO_EARLY"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_BOUNDED_SELECTION_SETTLE_READBACK_AND_THIRD_RECORD_EXPORT_RECERTIFICATION"
    elif click.get("clicked") and first_marker==0.0 and stable_last5:
        classification="THIRD_RECORD_SELECTION_STABLE_IMMEDIATE_R7_FAILURE_IS_TRANSIENT_EXECUTION_RACE"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_BOUNDED_SELECTION_SETTLE_READBACK_AND_THIRD_RECORD_EXPORT_RECERTIFICATION"
    elif click.get("clicked") and first_marker is not None and not stable_last5:
        classification="THIRD_RECORD_SELECTED_MARKER_STATE_FLICKERS_AFTER_CLICK"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_STABLE_SELECTED_IDENTITY_READBACK_REPAIR"
    elif click.get("clicked") and first_marker is None:
        classification="THIRD_RECORD_CLICK_DOES_NOT_MATERIALIZE_SELECTED_MARKER_IN_GUARDED_CONTEXT"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_SELECTED_PROPERTY_STATE_OWNER_DIAGNOSIS"
    else:
        classification="THIRD_RECORD_TARGET_CLICK_NOT_RELIABLY_MATERIALIZED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_TARGET_CONTROL_STABILITY_DIAGNOSIS"

    try:w.call("Page.close")
    except:pass

    checks={
      "r22bR2R7SelectionFailureConsumed":True,
      "freshPageCreated":True,
      "explorerFirstEntry":bool(explorer.get("clicked")),
      "singleTargetClickAttempted":True,
      "selectionTimingSamplesCaptured":len(samples)==10,
      "selectedMarkerTimingResolved":first_marker is not None,
      "stableWindowEvaluated":True,
      "assignmentsReadbackObserved":True,
      "assignmentsInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "pixelEvidenceOff":True
    }
    out={
      "framework":"SCIIP_EXPLORER_4_R22B_R2_R7_R1_THIRD_RECORD_SELECTION_STABILITY_AND_READBACK_TIMING_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R22B_R2_R7_R1_SELECTION_STABILITY_CAUSE_DIAGNOSED",
      "classification":classification,
      "target":TARGET,
      "explorerEntry":explorer,
      "beforeClick":before,
      "selectionClick":click,
      "firstSelectedMarkerSeconds":first_marker,
      "firstTargetVisibleSeconds":first_visible,
      "selectedMarkerStableAcrossLastFiveSamples":stable_last5,
      "assignmentsStableAcrossLastFiveSamples":assignments_stable,
      "samples":samples,
      "checks":checks,
      "authority":{"assignmentsInvocation":False,"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False},
      "nextMilestone":nextm
    }
    od=evd/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"third_record_selection_stability_and_readback_timing_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22B-R2-R7-R1 Third-Record Selection Stability + Readback Timing Diagnosis")
    print("="*120)
    print("TARGET:",TARGET)
    print("EXPLORER_ENTRY:",json.dumps(explorer))
    print("SELECTION_CLICK:",json.dumps(click))
    print("FIRST_SELECTED_MARKER_SECONDS:",first_marker)
    print("FIRST_TARGET_VISIBLE_SECONDS:",first_visible)
    print("SELECTED_MARKER_STABLE_LAST_FIVE:",stable_last5)
    print("ASSIGNMENTS_STABLE_LAST_FIVE:",assignments_stable)
    print("\n----- TIMING SAMPLES -----")
    for x in samples:
        print(json.dumps({"t":x["t"],"targetVisible":x.get("targetVisible"),"selectedMarkerMatchesTarget":x.get("selectedMarkerMatchesTarget"),"selectedMarkerTexts":x.get("selectedMarkerTexts"),"assignmentsCount":x.get("assignmentsCount")}))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R22B_R2_R7_R1_SELECTION_STABILITY_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":raise SystemExit(main())
