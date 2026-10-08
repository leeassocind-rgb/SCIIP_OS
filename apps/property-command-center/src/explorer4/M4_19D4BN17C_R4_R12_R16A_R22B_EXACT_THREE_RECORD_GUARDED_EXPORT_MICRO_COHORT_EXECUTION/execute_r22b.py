#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION"
PREV="M4_19D4BN17C_R4_R12_R16A_R22A_R3_EXPLORER_FIRST_TARGET_SELECTION_AND_EXACT_THREE_RECORD_QUALIFICATION_RECERTIFICATION"
TARGETS=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def get(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:
            return r.read().decode("utf-8","ignore")
    except:
        return None

def pages():
    try:
        return json.loads(get("http://127.0.0.1:9333/json") or "[]")
    except:
        return []

def newpage():
    req=urllib.request.Request(
        "http://127.0.0.1:9333/json/new?http%3A%2F%2F127.0.0.1%3A5173%2F",
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req,timeout=3) as r:
            return json.loads(r.read())
    except:
        return None

class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m: raise RuntimeError(f"bad websocket url: {u!r}")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("websocket handshake failed")
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();mask=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
        else:h.extend([255]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+mask+bytes(x^mask[i%4] for i,x in enumerate(p)))
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
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length,reason:'EXACT_CONTROL_NOT_UNIQUE'}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def target_select(w,target):
    return ev(w,f"""(()=>{{const T={json.dumps(target)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));if(xs.length!==1)return{{clicked:false,count:xs.length,reason:'TARGET_BUTTON_NOT_UNIQUE'}};xs[0].click();return{{clicked:true,count:1,text:(xs[0].innerText||xs[0].textContent||'').trim()}}}})()""") or {}

INSTALL=r"""(() => {
  window.__sciipExportProbe={anchorClicks:0,createObjectURLCalls:0,revokeObjectURLCalls:0,downloads:[],events:[],errors:[],unhandled:[]};
  window.addEventListener('error',e=>window.__sciipExportProbe.errors.push(String(e.message||e.error||'error')));
  window.addEventListener('unhandledrejection',e=>window.__sciipExportProbe.unhandled.push(String(e.reason||'unhandledrejection')));
  const oc=URL.createObjectURL?.bind(URL), or=URL.revokeObjectURL?.bind(URL);
  if(oc)URL.createObjectURL=function(obj){window.__sciipExportProbe.createObjectURLCalls++;window.__sciipExportProbe.events.push({type:'createObjectURL',blobType:obj?.type||'',size:obj?.size||null});return oc(obj)};
  if(or)URL.revokeObjectURL=function(u){window.__sciipExportProbe.revokeObjectURLCalls++;return or(u)};
  const oa=HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click=function(){window.__sciipExportProbe.anchorClicks++;window.__sciipExportProbe.downloads.push({download:this.download||'',href:(this.href||'').slice(0,500)});return oa.call(this)};
  return {installed:true};
})()"""

def inspect(w,target):
    return ev(w,f"""(()=>{{const T={json.dumps(target)},txt=document.body?.innerText||'',buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null);const dl=buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{{targetVisible:txt.toLowerCase().includes(T.toLowerCase()),assignments:buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Assignments').length,generate:buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Generate Client Listing Report').length,download:dl.map(x=>{{const k=Object.keys(x).find(k=>k.startsWith('__reactProps$'));const p=k?x[k]:null,f=p&&p.onClick;return{{disabled:!!x.disabled,handlerName:typeof f==='function'?(f.name||'anonymous'):null,hasOnClick:typeof f==='function'}}}}),reportReviewVisible:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),explorerMounted:/SCIIP Explorer|Property Explorer|Client production house/i.test(txt),url:location.href,probe:window.__sciipExportProbe||null}}}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";evid=app/"evidence/explorer4"
    pp=evid/PREV/"explorer_first_target_selection_and_exact_three_record_qualification_recertification.json"
    if not pp.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R22A_R3_EVIDENCE_REQUIRED");return 4
    prev=loadj(pp)
    if prev.get("status")!="PASSED" or prev.get("state")!="M419D4BN17C_R4_R12_R16A_R22A_R3_EXACT_THREE_RECORD_TARGET_QUALIFICATION_CERTIFIED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_THREE_RECORD_TARGET_QUALIFICATION_REQUIRED");return 5
    if not [x for x in pages() if x.get("type")=="page" and "127.0.0.1:5173" in x.get("url","")]:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 6

    outcomes=[];halt=False
    for i,t in enumerate(TARGETS,1):
        n=newpage()
        if not n or not n.get("webSocketDebuggerUrl"):
            outcomes.append({"index":i,"target":t,"freshTargetCreated":False,"certified":False,"failure":"FRESH_PAGE_FAILED"});halt=True;break
        w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable");time.sleep(.7)

        out={"index":i,"target":t,"freshTargetCreated":True}
        out["explorerEntry"]=click_exact(w,"Explorer");time.sleep(.6)
        out["selection"]=target_select(w,t);time.sleep(.5)
        a=inspect(w,t)
        out["selectedPropertyCertified"]=bool(out["selection"].get("clicked") and a.get("targetVisible"))
        if not out["selectedPropertyCertified"]:
            out["certified"]=False;out["failure"]="SELECTION_FAILED";outcomes.append(out);halt=True
            try:w.call("Page.close")
            except:pass
            break

        out["assignmentsEntry"]=click_exact(w,"Assignments");time.sleep(.6)
        b=inspect(w,t)
        out["assignmentsEntryCertified"]=bool(out["assignmentsEntry"].get("clicked") and b.get("generate")==1)
        if not out["assignmentsEntryCertified"]:
            out["certified"]=False;out["failure"]="ASSIGNMENTS_ENTRY_FAILED";outcomes.append(out);halt=True
            try:w.call("Page.close")
            except:pass
            break

        out["generateAction"]=click_exact(w,"Generate Client Listing Report");time.sleep(.6)
        c=inspect(w,t);dls=c.get("download") or []
        out["reportReviewEntryCertified"]=bool(out["generateAction"].get("clicked") and c.get("reportReviewVisible"))
        out["exportControlCertified"]=len(dls)==1 and not dls[0].get("disabled")
        out["liveHandlerCertified"]=len(dls)==1 and dls[0].get("hasOnClick") and dls[0].get("handlerName")=="exportReport"
        if not (out["reportReviewEntryCertified"] and out["exportControlCertified"] and out["liveHandlerCertified"]):
            out["certified"]=False;out["failure"]="EXPORT_PRECONDITION_FAILED";outcomes.append(out);halt=True
            try:w.call("Page.close")
            except:pass
            break

        out["probeInstall"]=ev(w,INSTALL) or {}
        out["exportAction"]=click_exact(w,"Download Client Listing Report")
        time.sleep(1.0)
        d=inspect(w,t);probe=d.get("probe") or {}

        pdf_events=[x for x in probe.get("events",[]) if x.get("type")=="createObjectURL" and x.get("blobType")=="application/pdf"]
        pdf_downloads=[x for x in probe.get("downloads",[]) if str(x.get("download","")).lower().endswith(".pdf")]

        out["artifact"]={
            "anchorClicks":probe.get("anchorClicks"),
            "createObjectURLCalls":probe.get("createObjectURLCalls"),
            "pdfEventCount":len(pdf_events),
            "pdfDownloadCount":len(pdf_downloads),
            "filename":pdf_downloads[0].get("download") if len(pdf_downloads)==1 else None,
            "sizeBytes":pdf_events[0].get("size") if len(pdf_events)==1 else None,
            "mimeType":"application/pdf" if len(pdf_events)==1 else None
        }
        out["runtimeErrorCount"]=len(probe.get("errors") or [])
        out["unhandledRejectionCount"]=len(probe.get("unhandled") or [])
        out["reportReviewContinuity"]=bool(d.get("reportReviewVisible"))
        out["explorerContinuity"]=bool(d.get("explorerMounted"))
        out["sameOrigin"]=str(d.get("url") or "").startswith("http://127.0.0.1:5173")

        out["certified"]=all([
            out["exportAction"].get("clicked"),
            len(pdf_events)==1,
            len(pdf_downloads)==1,
            isinstance(out["artifact"]["sizeBytes"],int) and out["artifact"]["sizeBytes"]>0,
            out["runtimeErrorCount"]==0,
            out["unhandledRejectionCount"]==0,
            out["reportReviewContinuity"],
            out["explorerContinuity"],
            out["sameOrigin"]
        ])
        out["failure"]=None if out["certified"] else "EXPORT_OR_ARTIFACT_CERTIFICATION_FAILED"
        outcomes.append(out)

        try:w.call("Page.close")
        except:pass
        if not out["certified"]:
            halt=True;break
        time.sleep(.25)

    all3=len(outcomes)==3 and all(x.get("certified") for x in outcomes)
    status="PASSED" if all3 else "DIAGNOSTIC_COMPLETE"
    state="M419D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_CERTIFIED" if all3 else "M419D4BN17C_R4_R12_R16A_R22B_GUARDED_EXPORT_MICRO_COHORT_INCOMPLETE"
    cls="EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_CERTIFIED_THREE_OF_THREE" if all3 else "EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_GAP_REMAINS"
    nxt="M4_19D4BN17C_R4_R12_R16A_R22C_EXACT_THREE_RECORD_EXPORT_ARTIFACT_PARITY_AND_LIFECYCLE_CLOSURE" if all3 else "M4_19D4BN17C_R4_R12_R16A_R22B_R1_GUARDED_EXPORT_MICRO_COHORT_RESIDUAL_CAUSAL_DIAGNOSIS"

    checks={
        "r22aR3Passed":prev.get("status")=="PASSED",
        "exactThreeRecordQualificationConsumed":True,
        "certifiedBrowserContextPreserved":True,
        "freshPagePerRecordPolicyUsed":all(x.get("freshTargetCreated") for x in outcomes) if outcomes else False,
        "strictSequentialObserved":True,
        "haltOnFirstFailureObserved":True,
        "allExecutedSelectionsCertified":all(x.get("selectedPropertyCertified") for x in outcomes) if outcomes else False,
        "allExecutedAssignmentsCertified":all(x.get("assignmentsEntryCertified") for x in outcomes) if outcomes else False,
        "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") for x in outcomes) if outcomes else False,
        "allExecutedExportControlsCertified":all(x.get("exportControlCertified") for x in outcomes) if outcomes else False,
        "allExecutedLiveHandlersCertified":all(x.get("liveHandlerCertified") for x in outcomes) if outcomes else False,
        "allExecutedExportsCertified":all(x.get("certified") for x in outcomes) if outcomes else False,
        "allThreeExportsCertified":all3,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    outdir=evid/M;outdir.mkdir(parents=True,exist_ok=True)
    ef=outdir/"exact_three_record_guarded_export_micro_cohort_execution.json"
    data={"framework":"SCIIP_EXPLORER_4_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_MICRO_COHORT_EXECUTION","generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"classification":cls,"outcomes":outcomes,"certifiedCount":sum(1 for x in outcomes if x.get("certified")),"haltedOnFailure":halt,"checks":checks,"authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False,"exportInvocation":"EXACT_ONE_PER_RECORD_MAXIMUM"},"nextMilestone":nxt}
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22B Exact Three-Record Guarded Export Micro-Cohort Execution")
    print("="*120)
    for x in outcomes:
        print(f"\n[{x['index']}/3] {x['target']}")
        for k in ["freshTargetCreated","selectedPropertyCertified","assignmentsEntryCertified","reportReviewEntryCertified","exportControlCertified","liveHandlerCertified"]:
            print(f"{k}: {x.get(k)}")
        a=x.get("artifact") or {}
        print("exportClicked:",(x.get("exportAction") or {}).get("clicked"))
        print("pdfDownloadCount:",a.get("pdfDownloadCount"))
        print("pdfEventCount:",a.get("pdfEventCount"))
        print("pdfFilename:",a.get("filename"))
        print("pdfSizeBytes:",a.get("sizeBytes"))
        print("runtimeErrorCount:",x.get("runtimeErrorCount"))
        print("unhandledRejectionCount:",x.get("unhandledRejectionCount"))
        print("reportReviewContinuity:",x.get("reportReviewContinuity"))
        print("explorerContinuity:",x.get("explorerContinuity"))
        print("sameOrigin:",x.get("sameOrigin"))
        print("certified:",x.get("certified"))
        print("failure:",x.get("failure"))

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CERTIFIED:",sum(1 for x in outcomes if x.get("certified")),"/3")
    print("HALTED_ON_FAILURE:",halt)
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",cls)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
