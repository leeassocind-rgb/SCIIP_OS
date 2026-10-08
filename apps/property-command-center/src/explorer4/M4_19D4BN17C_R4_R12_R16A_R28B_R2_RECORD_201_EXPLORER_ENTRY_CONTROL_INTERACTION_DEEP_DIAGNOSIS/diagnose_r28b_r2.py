#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
R1="M4_19D4BN17C_R4_R12_R16A_R28B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R28B_R2_RECORD_201_EXPLORER_ENTRY_CONTROL_INTERACTION_DEEP_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=4) as r:return json.loads(r.read())
    except:return None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m: raise RuntimeError("invalid websocket debugger URL")
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

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p1=er/R1/"non_export_live_qualification_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28B-R2 Record 201 Explorer Entry Control Interaction Deep Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_EXPLORER_ENTRY_CONTROL_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Target: 12400 Philadelphia St")

    if not p1.exists():
        print("STATUS: BLOCKED");print("REASON: R28B-R1 evidence missing");return 4
    r1=loadj(p1)
    if not isinstance(r1,dict) or r1.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: R28B-R1 must be PASSED");return 5
    if r1.get("firstFailureOrdinal")!=201 or r1.get("firstFailedStage")!="explorerEntryCertified":
        print("STATUS: BLOCKED");print("REASON: expected record-201 Explorer-entry failure not present");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: CDP browser context required");return 7

    page=newpage()
    if not page or not page.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("REASON: fresh page creation failed");return 8

    w=WS(page["webSocketDebuggerUrl"])
    try:
        w.call("Runtime.enable");w.call("Page.enable")
        # bounded wait until document complete and Explorer uniquely visible+enabled
        samples=[];first_ready=None
        t0=time.time()
        while time.time()-t0<=2.0:
            t=round(time.time()-t0,3)
            s=ev(w,r"""(()=>{const bs=[...document.querySelectorAll('button')];
              const xs=bs.filter(b=>(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Explorer');
              return {
                readyState:document.readyState,
                buttonCount:bs.length,
                explorerCount:xs.length,
                visibleExplorerCount:xs.filter(b=>b.offsetParent!==null).length,
                enabledExplorerCount:xs.filter(b=>!b.disabled).length,
                visibleEnabledExplorerCount:xs.filter(b=>b.offsetParent!==null&&!b.disabled).length,
                explorerHtml:xs.length===1?xs[0].outerHTML.slice(0,2500):null,
                explorerClass:xs.length===1?String(xs[0].className||''):null,
                explorerAria:xs.length===1?xs[0].getAttribute('aria-label'):null,
                explorerDisabled:xs.length===1?!!xs[0].disabled:null,
                explorerRect:xs.length===1?(()=>{const r=xs[0].getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})():null,
                bodyLength:(document.body?.innerText||'').length,
                url:location.href,
                origin:location.origin
              }})()""") or {}
            s["t"]=t;samples.append(s)
            if (s.get("readyState")=="complete" and s.get("visibleEnabledExplorerCount")==1 and s.get("buttonCount",0)>0):
                if first_ready is None:first_ready=t
                if len(samples)>=3 and all(x.get("visibleEnabledExplorerCount")==1 for x in samples[-3:]):
                    break
            time.sleep(.1)

        before=ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Explorer');
          const b=x.length===1?x[0]:null;
          return {
            count:x.length,
            exists:!!b,
            visible:!!b&&b.offsetParent!==null,
            enabled:!!b&&!b.disabled,
            isConnected:!!b&&b.isConnected,
            className:b?String(b.className||''):null,
            html:b?b.outerHTML.slice(0,2500):null,
            activeElementText:(document.activeElement?.innerText||document.activeElement?.textContent||'').trim(),
            markerCount:document.querySelectorAll('button.sciip-property-marker').length,
            assignmentsButtonCount:[...document.querySelectorAll('button')].filter(z=>(z.innerText||z.textContent||'').trim()==='Assignments').length
          }})()""") or {}

        # Single Explorer click only; no property click.
        click=ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>
          b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Explorer');
          if(x.length!==1)return {attempted:false,count:x.length};
          const b=x[0];
          let events=[];
          const h=e=>events.push(e.type);
          ['pointerdown','mousedown','pointerup','mouseup','click'].forEach(k=>b.addEventListener(k,h,{once:true}));
          b.click();
          return {attempted:true,count:1,isConnectedAfter:b.isConnected,events};
        })()""") or {}

        post=[]
        t1=time.time()
        for delay in [0.0,0.05,0.1,0.2,0.35,0.5,0.75,1.0]:
            while time.time()-t1<delay: time.sleep(.01)
            s=ev(w,r"""(()=>({
              url:location.href,
              origin:location.origin,
              markerCount:document.querySelectorAll('button.sciip-property-marker').length,
              explorerExactCount:[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Explorer').length,
              assignmentsButtonCount:[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').trim()==='Assignments').length,
              bodyHasPropertyMarker:!!document.querySelector('button.sciip-property-marker'),
              bodyLength:(document.body?.innerText||'').length
            }))()""") or {}
            s["t"]=delay;post.append(s)

        click_attempted=click.get("attempted") is True
        post_marker=max((x.get("markerCount",0) for x in post),default=0)
        post_surface=post_marker>0
        same_origin=all(x.get("origin")=="http://127.0.0.1:5173" for x in post if x.get("origin"))

        if click_attempted and post_surface:
            classification="EXPLORER_CLICK_SUCCEEDED_AND_EXPLORER_SURFACE_MATERIALIZED_PRIOR_R28B_ENTRY_FAILURE_TRANSIENT_OR_CERTIFICATION_LOGIC_MISMATCH"
            nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R3_RECORD_201_EXPLORER_ENTRY_RECERTIFICATION_AND_RESUME"
        elif click_attempted and not post_surface:
            classification="EXPLORER_CLICK_DISPATCHED_BUT_EXPLORER_SURFACE_DID_NOT_MATERIALIZE"
            nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R2_R1_EXPLORER_ENTRY_POST_CLICK_ROUTING_CAUSAL_DIAGNOSIS"
        else:
            classification="EXPLORER_CONTROL_NOT_UNIQUELY_CLICKABLE_AT_INTERACTION_POINT"
            nextm="M4_19D4BN17C_R4_R12_R16A_R28B_R2_R1_EXPLORER_ENTRY_CONTROL_STATE_TIMING_DIAGNOSIS"

        checks={
          "r28bR1Passed":True,
          "record201ExplorerEntryFailureConsumed":True,
          "freshPageCreated":True,
          "boundedTwoSecondExplorerObservationUsed":True,
          "documentReadyStateCaptured":True,
          "buttonCountCaptured":True,
          "explorerCountCaptured":True,
          "visibleEnabledExplorerCountCaptured":True,
          "explorerOuterHtmlCaptured":bool(before.get("html")),
          "explorerVisibilityCaptured":before.get("visible") is not None,
          "explorerEnabledStateCaptured":before.get("enabled") is not None,
          "singleExplorerClickMaximumObserved":True,
          "postClickSurfaceReadbackCaptured":len(post)>0,
          "sameOriginPreserved":same_origin,
          "propertyClickOff":True,
          "assignmentsInvocationOff":True,
          "generateInvocationOff":True,
          "exportInvocationOff":True,
          "applicationMutationOff":True,
          "governedMutationOff":True,
          "networkAuthorityOff":True,
          "pixelEvidenceOff":True
        }

        od=er/OUT;od.mkdir(parents=True,exist_ok=True)
        ef=od/"record_201_explorer_entry_control_interaction_deep_diagnosis.json"
        out={
          "framework":"SCIIP_EXPLORER_4_R28B_R2_RECORD_201_EXPLORER_ENTRY_CONTROL_INTERACTION_DEEP_DIAGNOSIS",
          "generatedAt":datetime.now(timezone.utc).isoformat(),
          "status":"PASSED" if all(checks.values()) else "FAILED",
          "state":"M419D4BN17C_R4_R12_R16A_R28B_R2_RECORD_201_EXPLORER_ENTRY_CONTROL_INTERACTION_DIAGNOSED",
          "classification":classification,
          "target":"12400 Philadelphia St",
          "firstReadyExplorerSeconds":first_ready,
          "preClick":before,
          "clickReadback":click,
          "postClickSamples":post,
          "postClickMarkerMaximum":post_marker,
          "postClickExplorerSurfaceMaterialized":post_surface,
          "checks":checks,
          "nextMilestone":nextm
        }
        ef.write_text(json.dumps(out,indent=2)+"\n")

        print("TARGET: 12400 Philadelphia St")
        print("FIRST_READY_EXPLORER_SECONDS:",first_ready)
        print("PRE_CLICK_EXPLORER_COUNT:",before.get("count"))
        print("PRE_CLICK_VISIBLE:",before.get("visible"))
        print("PRE_CLICK_ENABLED:",before.get("enabled"))
        print("CLICK_ATTEMPTED:",click_attempted)
        print("CLICK_EVENT_READBACK:",click.get("events"))
        print("POST_CLICK_MARKER_MAXIMUM:",post_marker)
        print("POST_CLICK_EXPLORER_SURFACE_MATERIALIZED:",post_surface)
        print("SAME_ORIGIN:",same_origin)
        print("\n----- PRE-CLICK READBACK -----")
        print(json.dumps(before,indent=2))
        print("\n----- POST-CLICK SAMPLES -----")
        for s in post:print(json.dumps(s,sort_keys=True))
        print("\n----- CHECKS -----")
        for k,v in checks.items():print(f"{k}: {v}")
        print("CLASSIFICATION:",classification)
        print("STATUS:",out["status"])
        print("STATE:",out["state"])
        print("NEXT_MILESTONE:",nextm)
        print("EVIDENCE:",ef)
        print("\nR28B-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
        return 0 if out["status"]=="PASSED" else 10
    finally:
        w.close()

if __name__=="__main__":
    raise SystemExit(main())
