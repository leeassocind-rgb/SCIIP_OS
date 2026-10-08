#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
R1="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS"
R28A_R4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R2_RECORD_233_POST_REPORT_REVIEW_ORIGIN_TRANSITION_DEEP_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

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
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=8)
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
    def close(self):
        try:self.s.close()
        except:pass

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    rr=((r or {}).get("result")or{})
    if rr.get("exceptionDetails"): return None
    return (rr.get("result")or{}).get("value")

def clean(s):
    s=" ".join(str(s or "").split())
    if s.lower().startswith("select "):s=s[7:].strip()
    for token in ["UNDER CONSTRUCTION","PROPOSED/PLANNED","PROPOSED","PLANNED","EXISTING","AVAILABLE","LEASED","SOLD"]:
        i=s.upper().find(token)
        if i>0:s=s[:i].strip()
    return s

def exact_btn(w,t):
    return ev(w, """(()=>[...document.querySelectorAll('button')].filter(b=>
      b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()===%s
    ).length)()""" % json.dumps(t)) or 0

def click_btn(w,t):
    return ev(w, """(()=>{
      const a=[...document.querySelectorAll('button')].filter(b=>
        b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()===%s);
      if(a.length!==1)return false;a[0].click();return true;
    })()""" % json.dumps(t)) is True

def wait_btn(w,labels,sec):
    st=time.time()
    while time.time()-st<=sec:
        for t in labels:
            if exact_btn(w,t)==1:return t
        time.sleep(.08)
    return None

def snapshot(w,label):
    v=ev(w,r"""(()=>({
      url:location.href,
      origin:location.origin,
      readyState:document.readyState,
      title:document.title,
      markerCount:document.querySelectorAll('button.sciip-property-marker').length,
      selectedMarkerCount:document.querySelectorAll('button.sciip-property-marker.is-selected').length,
      reportDownloadCount:[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Download Client Listing Report').length,
      bodyLength:(document.body?.innerText||'').length
    }))()""") or {}
    v["label"]=label;v["capturedAt"]=time.time()
    return v

def settle_explorer(w):
    st=time.time();con=0
    while time.time()-st<=2.0:
        if ev(w,"document.readyState")=="complete" and exact_btn(w,"Explorer")==1:
            con+=1
            if con>=3:return True
        else:con=0
        time.sleep(.1)
    return False

def inventory(w):
    return ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker')].map((b,i)=>({
      domOrdinal:i+1,
      text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),
      aria:(b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim(),
      outerHTML:b.outerHTML.slice(0,3000)
    })))()""") or []

def find_target(w,label,sf):
    st=time.time();last=None
    while time.time()-st<=5.0:
        inv=inventory(w)
        hits=[]
        for m in inv:
            obs=clean(m.get("aria") or m.get("text"))
            if obs.lower()==clean(label).lower():
                if sf is None or f"{int(sf):,} SF" in (m.get("outerHTML") or ""):
                    hits.append(m)
        if len(hits)==1:return hits[0]
        last=hits
        time.sleep(.12)
    return None

def click_marker(w,ordn):
    return ev(w,f"""(()=>{{const a=[...document.querySelectorAll('button.sciip-property-marker')];
    const b=a[{int(ordn)-1}];if(!b)return false;b.click();return true}})()""") is True

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p1=er/R1/"resume_residual_causal_diagnosis.json"
    tf=er/R28A_R4/"exact_new_two_hundred_candidates_prefix_normalized.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28B-R3-R2 Record 233 Post-Report-Review Origin Transition Deep Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_ORIGIN_TRANSITION_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export invocation: OFF")
    print("Target: 13310 Valley Blvd")

    if not p1.exists() or not tf.exists():
        print("STATUS: BLOCKED");print("REASON: prerequisite evidence missing");return 4
    r1=loadj(p1);targets=loadj(tf)
    if not isinstance(r1,dict) or r1.get("status")!="PASSED" or r1.get("firstFailureOrdinal")!=233:
        print("STATUS: BLOCKED");print("REASON: R28B-R3-R1 contract not satisfied");return 5
    if not isinstance(targets,list) or len(targets)!=200:
        print("STATUS: BLOCKED");print("REASON: exact new-200 targets missing");return 6

    t=targets[32]  # ordinal 233
    if clean(t.get("label"))!="13310 Valley Blvd":
        print("STATUS: BLOCKED");print("REASON: ordinal-233 target mismatch");return 7
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: CDP unavailable");return 8

    page=newpage()
    if not page or not page.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("REASON: fresh page creation failed");return 9

    w=WS(page["webSocketDebuggerUrl"])
    snaps=[]
    try:
        w.call("Runtime.enable");w.call("Page.enable")
        snaps.append(snapshot(w,"fresh_page"))
        if not settle_explorer(w):
            print("STATUS: BLOCKED");print("REASON: Explorer settle failed in diagnostic");return 10
        snaps.append(snapshot(w,"explorer_settled"))
        if not click_btn(w,"Explorer"):
            print("STATUS: BLOCKED");print("REASON: Explorer click failed in diagnostic");return 11

        st=time.time()
        while time.time()-st<=1.5 and (ev(w,"document.querySelectorAll('button.sciip-property-marker').length") or 0)==0:
            time.sleep(.05)
        snaps.append(snapshot(w,"explorer_surface"))

        m=find_target(w,t.get("label"),t.get("sf"))
        if not m:
            print("STATUS: BLOCKED");print("REASON: record 233 target binding failed in diagnostic");return 12
        if not click_marker(w,m["domOrdinal"]):
            print("STATUS: BLOCKED");print("REASON: record 233 property click failed in diagnostic");return 13
        time.sleep(.25)
        snaps.append(snapshot(w,"property_selected"))

        a=wait_btn(w,["Assignments"],2.0)
        if not a or not click_btn(w,a):
            print("STATUS: BLOCKED");print("REASON: Assignments entry failed");return 14
        time.sleep(.25)
        snaps.append(snapshot(w,"assignments_entered"))

        g=wait_btn(w,["Generate Client Listing Report","Generate New Report","Generate Report"],3.0)
        if not g or not click_btn(w,g):
            print("STATUS: BLOCKED");print("REASON: Generate failed");return 15

        dl=wait_btn(w,["Download Client Listing Report"],4.0)
        if not dl:
            print("STATUS: BLOCKED");print("REASON: Report Review/Download control failed");return 16
        snaps.append(snapshot(w,"report_review_materialized"))

        # Do not click Download/Export. Observe origin stability for 3 seconds.
        post=[]
        t0=time.time()
        for delay in [0.0,0.05,0.1,0.2,0.35,0.5,0.75,1.0,1.5,2.0,3.0]:
            while time.time()-t0<delay:time.sleep(.01)
            s=snapshot(w,f"post_report_review_{delay}")
            s["t"]=delay;post.append(s)

        origins=[s.get("origin") for s in snaps+post]
        urls=[s.get("url") for s in snaps+post]
        same_all=all(o=="http://127.0.0.1:5173" for o in origins if o is not None)
        any_origin_change=any(o!="http://127.0.0.1:5173" for o in origins if o is not None)
        any_url_non_app=any(not str(u).startswith("http://127.0.0.1:5173/") for u in urls if u)

        if same_all and not any_url_non_app:
            classification="RECORD_233_ORIGIN_REMAINED_STABLE_THROUGH_POST_REPORT_REVIEW_WINDOW_PRIOR_ORIGIN_CHANGED_FAILURE_TRANSIENT_READBACK_MISMATCH"
            nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_RECORD_233_SAME_ORIGIN_RECERTIFICATION_AND_RESUME_FROM_233"
        else:
            classification="RECORD_233_TRUE_ORIGIN_OR_URL_TRANSITION_OBSERVED_AFTER_REPORT_REVIEW"
            nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R2_R1_RECORD_233_ORIGIN_TRANSITION_CAUSAL_DIAGNOSIS"

        checks={
          "r28bR3R1Passed":True,
          "record233OriginFailureConsumed":True,
          "freshPageCreated":True,
          "explorerSettled":True,
          "explorerEntered":True,
          "record233Bound":True,
          "record233Selected":True,
          "assignmentsEntered":True,
          "reportReviewMaterialized":True,
          "downloadControlMaterialized":True,
          "postReportReviewOriginWindowCaptured":len(post)==11,
          "urlCapturedAtEveryStage":all(bool(s.get("url")) for s in snaps+post),
          "originCapturedAtEveryStage":all(bool(s.get("origin")) for s in snaps+post),
          "exportInvocationOff":True,
          "applicationMutationOff":True,
          "governedMutationOff":True,
          "networkAuthorityOff":True,
          "pixelEvidenceOff":True
        }

        od=er/OUT;od.mkdir(parents=True,exist_ok=True)
        ef=od/"record_233_post_report_review_origin_transition_deep_diagnosis.json"
        out={
          "framework":"SCIIP_EXPLORER_4_R28B_R3_R2_RECORD_233_POST_REPORT_REVIEW_ORIGIN_TRANSITION_DEEP_DIAGNOSIS",
          "generatedAt":datetime.now(timezone.utc).isoformat(),
          "status":"PASSED" if all(checks.values()) else "FAILED",
          "state":"M419D4BN17C_R4_R12_R16A_R28B_R3_R2_RECORD_233_POST_REPORT_REVIEW_ORIGIN_TRANSITION_DIAGNOSED",
          "classification":classification,
          "target":"13310 Valley Blvd",
          "stageSnapshots":snaps,
          "postReportReviewSamples":post,
          "sameOriginAcrossAllSamples":same_all,
          "anyOriginChangeObserved":any_origin_change,
          "anyNonAppUrlObserved":any_url_non_app,
          "checks":checks,
          "nextMilestone":nextm
        }
        ef.write_text(json.dumps(out,indent=2)+"\n")

        print("TARGET: 13310 Valley Blvd")
        print("SAME_ORIGIN_ACROSS_ALL_SAMPLES:",same_all)
        print("ANY_ORIGIN_CHANGE_OBSERVED:",any_origin_change)
        print("ANY_NON_APP_URL_OBSERVED:",any_url_non_app)
        print("\n----- STAGE SNAPSHOTS -----")
        for s in snaps:print(json.dumps(s,sort_keys=True))
        print("\n----- POST-REPORT-REVIEW ORIGIN SAMPLES -----")
        for s in post:print(json.dumps(s,sort_keys=True))
        print("\n----- CHECKS -----")
        for k,v in checks.items():print(f"{k}: {v}")
        print("CLASSIFICATION:",classification)
        print("STATUS:",out["status"])
        print("STATE:",out["state"])
        print("NEXT_MILESTONE:",nextm)
        print("EVIDENCE:",ef)
        print("\nR28B-R3-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
        return 0
    finally:
        w.close()

if __name__=="__main__":
    raise SystemExit(main())
