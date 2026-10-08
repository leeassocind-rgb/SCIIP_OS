#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_BOUNDED_SELECTION_SETTLE_READBACK_AND_THIRD_RECORD_EXPORT_RECERTIFICATION"
R1="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R7_R1_THIRD_RECORD_SELECTION_STABILITY_AND_READBACK_TIMING_DIAGNOSIS"
TARGET="8700 - 8750 Rex Rd"
PORT=9333
APP="http://127.0.0.1:5173/"

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
        if not m:raise RuntimeError("bad websocket")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:
            raise RuntimeError("websocket handshake failed")
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
        self.i+=1;i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length,reason:'EXACT_CONTROL_NOT_UNIQUE'}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def click_target(w):
    return ev(w,f"""(()=>{{const T={json.dumps(TARGET)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));if(xs.length!==1)return{{clicked:false,count:xs.length,candidates:xs.map(x=>(x.innerText||x.textContent||'').trim())}};xs[0].click();return{{clicked:true,count:1,text:(xs[0].innerText||xs[0].textContent||'').trim()}}}})()""") or {}

def selection_snapshot(w):
    return ev(w,f"""(()=>{{const T={json.dumps(TARGET)},txt=document.body?.innerText||'';const sm=[...document.querySelectorAll('.sciip-property-marker.is-selected')].map(x=>(x.innerText||x.textContent||'').trim());return{{
      targetVisible:txt.toLowerCase().includes(T.toLowerCase()),
      selectedMarkerMatchesTarget:sm.some(x=>x.toLowerCase().includes(T.toLowerCase())),
      selectedMarkerTexts:sm,
      assignmentsCount:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==='Assignments').length
    }}}})()""") or {}

def bounded_selection_readback(w):
    # Require 3 consecutive agreeing samples within 2.0 seconds.
    samples=[]
    consecutive=0
    start=time.time()
    while time.time()-start<=2.0:
        s=selection_snapshot(w)
        s["elapsedSeconds"]=round(time.time()-start,3)
        ok=bool(s.get("targetVisible") and s.get("selectedMarkerMatchesTarget") and s.get("assignmentsCount")==1)
        s["sampleCertified"]=ok
        samples.append(s)
        consecutive=consecutive+1 if ok else 0
        if consecutive>=3:
            return {"certified":True,"samples":samples,"consecutiveCertifiedSamples":consecutive}
        time.sleep(.1)
    return {"certified":False,"samples":samples,"consecutiveCertifiedSamples":consecutive}

INSTALL=r"""(() => {
  window.__sciipExportProbe={anchorClicks:0,createObjectURLCalls:0,downloads:[],events:[],errors:[],unhandled:[]};
  window.addEventListener('error',e=>window.__sciipExportProbe.errors.push(String(e.message||e.error||'error')));
  window.addEventListener('unhandledrejection',e=>window.__sciipExportProbe.unhandled.push(String(e.reason||'unhandledrejection')));
  const oc=URL.createObjectURL?.bind(URL);
  if(oc)URL.createObjectURL=function(obj){
    window.__sciipExportProbe.createObjectURLCalls++;
    window.__sciipExportProbe.events.push({type:'createObjectURL',blobType:obj?.type||'',size:obj?.size||null});
    return oc(obj)
  };
  const oa=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){
    window.__sciipExportProbe.anchorClicks++;
    window.__sciipExportProbe.downloads.push({download:this.download||'',href:(this.href||'').slice(0,500)});
    return oa.call(this)
  };
  return {installed:true};
})()"""

def inspect(w):
    return ev(w,f"""(()=>{{const T={json.dumps(TARGET)},txt=document.body?.innerText||'',buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null);const dl=buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{{
      targetVisible:txt.toLowerCase().includes(T.toLowerCase()),
      generateCount:buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Generate Client Listing Report').length,
      reportReviewVisible:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),
      download:dl.map(x=>{{const k=Object.keys(x).find(k=>k.startsWith('__reactProps$'));const p=k?x[k]:null,f=p&&p.onClick;return{{disabled:!!x.disabled,handlerName:typeof f==='function'?(f.name||'anonymous'):null,hasOnClick:typeof f==='function'}}}}),
      explorerMounted:/SCIIP Explorer|Property Explorer|Client production house/i.test(txt),
      url:location.href,
      probe:window.__sciipExportProbe||null
    }}}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; evid=app/"evidence/explorer4"

    p=evid/R1/"third_record_selection_stability_and_readback_timing_diagnosis.json"
    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R22B_R2_R7_R1_EVIDENCE_REQUIRED");return 4
    r1=loadj(p)
    if r1.get("classification")!="THIRD_RECORD_SELECTION_STABLE_IMMEDIATE_R7_FAILURE_IS_TRANSIENT_EXECUTION_RACE":
        print("STATUS: BLOCKED");print("DIAGNOSIS: STABLE_IMMEDIATE_SELECTION_RACE_CLASSIFICATION_REQUIRED");return 5

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 6

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_CREATION_FAILED");return 7

    w=W(n["webSocketDebuggerUrl"])
    w.call("Runtime.enable");w.call("Page.enable");time.sleep(.8)

    out={"target":TARGET,"freshTargetCreated":True}

    out["explorerEntry"]=click_exact(w,"Explorer")
    time.sleep(.6)
    out["selection"]=click_target(w)
    out["selectionSettleReadback"]=bounded_selection_readback(w)
    out["selectedPropertyCertified"]=bool(
        out["explorerEntry"].get("clicked") and
        out["selection"].get("clicked") and
        out["selectionSettleReadback"].get("certified")
    )

    if not out["selectedPropertyCertified"]:
        out["status"]="DIAGNOSTIC_COMPLETE";out["failure"]="BOUNDED_SELECTION_READBACK_FAILED"
    else:
        out["assignmentsEntry"]=click_exact(w,"Assignments");time.sleep(.6)
        s1=inspect(w)
        out["assignmentsEntryCertified"]=bool(out["assignmentsEntry"].get("clicked") and s1.get("generateCount")==1)

        if not out["assignmentsEntryCertified"]:
            out["status"]="DIAGNOSTIC_COMPLETE";out["failure"]="ASSIGNMENTS_ENTRY_FAILED"
        else:
            out["generateAction"]=click_exact(w,"Generate Client Listing Report");time.sleep(.7)
            s2=inspect(w)
            dls=s2.get("download") or []
            out["reportReviewEntryCertified"]=bool(out["generateAction"].get("clicked") and s2.get("reportReviewVisible"))
            out["exportControlCertified"]=len(dls)==1 and not dls[0].get("disabled")
            out["liveHandlerCertified"]=len(dls)==1 and dls[0].get("hasOnClick") and dls[0].get("handlerName")=="exportReport"

            if not (out["reportReviewEntryCertified"] and out["exportControlCertified"] and out["liveHandlerCertified"]):
                out["status"]="DIAGNOSTIC_COMPLETE";out["failure"]="EXPORT_PRECONDITION_FAILED"
            else:
                out["probeInstall"]=ev(w,INSTALL) or {}
                out["exportAction"]=click_exact(w,"Download Client Listing Report")
                time.sleep(1.0)
                s3=inspect(w);probe=s3.get("probe") or {}

                pdf_events=[x for x in probe.get("events",[]) if x.get("type")=="createObjectURL" and x.get("blobType")=="application/pdf"]
                pdf_downloads=[x for x in probe.get("downloads",[]) if str(x.get("download","")).lower().endswith(".pdf")]

                out["artifact"]={
                    "pdfEventCount":len(pdf_events),
                    "pdfDownloadCount":len(pdf_downloads),
                    "filename":pdf_downloads[0].get("download") if len(pdf_downloads)==1 else None,
                    "mimeType":"application/pdf" if len(pdf_events)==1 else None,
                    "sizeBytes":pdf_events[0].get("size") if len(pdf_events)==1 else None
                }
                out["runtimeErrorCount"]=len(probe.get("errors") or [])
                out["unhandledRejectionCount"]=len(probe.get("unhandled") or [])
                out["postPublishReportReviewUnmountCertified"]=not bool(s3.get("reportReviewVisible"))
                out["explorerContinuity"]=bool(s3.get("explorerMounted"))
                out["sameOrigin"]=str(s3.get("url") or "").startswith(APP.rstrip("/"))

                out["certified"]=all([
                    out["exportAction"].get("clicked"),
                    out["artifact"]["pdfEventCount"]==1,
                    out["artifact"]["pdfDownloadCount"]==1,
                    out["artifact"]["mimeType"]=="application/pdf",
                    isinstance(out["artifact"]["sizeBytes"],int) and out["artifact"]["sizeBytes"]>0,
                    out["runtimeErrorCount"]==0,
                    out["unhandledRejectionCount"]==0,
                    out["postPublishReportReviewUnmountCertified"],
                    out["explorerContinuity"],
                    out["sameOrigin"]
                ])
                out["status"]="PASSED" if out["certified"] else "DIAGNOSTIC_COMPLETE"
                out["failure"]=None if out["certified"] else "EXPORT_OR_ARTIFACT_CERTIFICATION_FAILED"

    try:w.call("Page.close")
    except:pass

    cert=bool(out.get("certified"))
    state="M419D4BN17C_R4_R12_R16A_R22B_R2_R8_THIRD_RECORD_EXPORT_CERTIFIED" if cert else "M419D4BN17C_R4_R12_R16A_R22B_R2_R8_THIRD_RECORD_EXPORT_INCOMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R22C_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_LIFECYCLE_CLOSURE" if cert else "M4_19D4BN17C_R4_R12_R16A_R22B_R2_R8_R1_THIRD_RECORD_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS"

    data={
      "framework":"SCIIP_EXPLORER_4_R22B_R2_R8_BOUNDED_SELECTION_SETTLE_READBACK_AND_THIRD_RECORD_EXPORT_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":out.get("status","DIAGNOSTIC_COMPLETE"),
      "state":state,
      "classification":"THIRD_RECORD_BOUNDED_SETTLE_SELECTION_AND_EXPORT_RECERTIFIED" if cert else "THIRD_RECORD_BOUNDED_SETTLE_SELECTION_OR_EXPORT_GAP_REMAINS",
      "outcome":out,
      "checks":{
        "r22bR2R7R1Passed":True,
        "stableImmediateSelectionRaceConsumed":True,
        "freshPageRequired":True,
        "explorerFirstSelectionRequired":True,
        "threeConsecutiveSelectionSamplesRequired":True,
        "maximumSelectionSettleWindowSeconds":2.0,
        "selectedMarkerReadbackRequired":True,
        "assignmentsReadbackRequired":True,
        "exactOneExportClickMaximum":True,
        "pdfArtifactReadbackRequired":True,
        "postPublishUnmountRequired":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
      },
      "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"bounded_selection_settle_readback_and_third_record_export_recertification.json"
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22B-R2-R8 Bounded Selection Settle Readback + Third-Record Export Recertification")
    print("="*120)
    print("freshTargetCreated:",out.get("freshTargetCreated"))
    print("explorerEntryCertified:",(out.get("explorerEntry") or {}).get("clicked"))
    print("selectionClicked:",(out.get("selection") or {}).get("clicked"))
    print("selectionSettleCertified:",(out.get("selectionSettleReadback") or {}).get("certified"))
    print("selectionSampleCount:",len((out.get("selectionSettleReadback") or {}).get("samples") or []))
    print("consecutiveCertifiedSamples:",(out.get("selectionSettleReadback") or {}).get("consecutiveCertifiedSamples"))
    print("selectedPropertyCertified:",out.get("selectedPropertyCertified"))
    print("assignmentsEntryCertified:",out.get("assignmentsEntryCertified"))
    print("reportReviewEntryCertified:",out.get("reportReviewEntryCertified"))
    print("exportControlCertified:",out.get("exportControlCertified"))
    print("liveHandlerCertified:",out.get("liveHandlerCertified"))
    a=out.get("artifact") or {}
    print("exportClicked:",(out.get("exportAction") or {}).get("clicked"))
    print("pdfDownloadCount:",a.get("pdfDownloadCount"))
    print("pdfEventCount:",a.get("pdfEventCount"))
    print("pdfFilename:",a.get("filename"))
    print("pdfSizeBytes:",a.get("sizeBytes"))
    print("runtimeErrorCount:",out.get("runtimeErrorCount"))
    print("unhandledRejectionCount:",out.get("unhandledRejectionCount"))
    print("postPublishReportReviewUnmountCertified:",out.get("postPublishReportReviewUnmountCertified"))
    print("explorerContinuity:",out.get("explorerContinuity"))
    print("sameOrigin:",out.get("sameOrigin"))
    print("certified:",cert)
    print("failure:",out.get("failure"))
    print("STATUS:",data["status"])
    print("STATE:",state)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
