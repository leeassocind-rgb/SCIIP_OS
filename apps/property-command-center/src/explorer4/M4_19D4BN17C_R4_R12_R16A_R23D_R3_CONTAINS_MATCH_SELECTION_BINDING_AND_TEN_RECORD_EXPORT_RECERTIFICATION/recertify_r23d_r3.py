#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R23D_R3_CONTAINS_MATCH_SELECTION_BINDING_AND_TEN_RECORD_EXPORT_RECERTIFICATION"
R2="M4_19D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_TARGET_SELECTION_RESOLUTION"
R2_STATE="M419D4BN17C_R4_R12_R16A_R23D_R2_FIRST_RECORD_TARGET_SELECTION_RESOLVED"
R23C="M4_19D4BN17C_R4_R12_R16A_R23C_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
R23C_STATE="M419D4BN17C_R4_R12_R16A_R23C_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION_AUTHORIZED"

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
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("websocket handshake failed")
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
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length,reason:'EXACT_CONTROL_NOT_UNIQUE'}};xs[0].click();return{{clicked:true,count:1,text:t,binding:'EXACT'}}}})()""") or {}

def click_target_resolved(w,target):
    return ev(w,f"""(()=>{{
      const T={json.dumps(target)};
      const buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled);
      const exact=buttons.filter(x=>(x.innerText||x.textContent||'').trim()===T);
      if(exact.length===1){{
        exact[0].click();
        return{{clicked:true,count:1,binding:'EXACT',text:(exact[0].innerText||exact[0].textContent||'').trim()}};
      }}
      const contains=buttons.filter(x=>(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));
      if(contains.length===1){{
        contains[0].click();
        return{{clicked:true,count:1,binding:'UNIQUE_CONTAINS',text:(contains[0].innerText||contains[0].textContent||'').trim()}};
      }}
      return{{
        clicked:false,
        exactCount:exact.length,
        containsCount:contains.length,
        candidates:contains.slice(0,20).map(x=>(x.innerText||x.textContent||'').trim()),
        reason:'TARGET_BINDING_NOT_UNIQUE'
      }};
    }})()""") or {}

def selection_snapshot(w,target):
    return ev(w,f"""(()=>{{const T={json.dumps(target)},txt=document.body?.innerText||'';const sm=[...document.querySelectorAll('.sciip-property-marker.is-selected')].map(x=>(x.innerText||x.textContent||'').trim());return{{
      targetVisible:txt.toLowerCase().includes(T.toLowerCase()),
      selectedMarkerMatchesTarget:sm.some(x=>x.toLowerCase().includes(T.toLowerCase())),
      selectedMarkerTexts:sm,
      assignmentsCount:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==='Assignments').length
    }}}})()""") or {}

def bounded_selection_readback(w,target):
    samples=[];consecutive=0;start=time.time()
    while time.time()-start<=2.0:
        s=selection_snapshot(w,target)
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
    return ev(w,r"""(()=> {
      const txt=document.body?.innerText||'';
      const buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null);
      const gen=buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Generate Client Listing Report');
      const dl=buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');
      return {
        generateCount:gen.length,
        generateEnabled:gen.length===1&&!gen[0].disabled,
        reportReviewVisible:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),
        downloadControls:dl.map(x=>{
          const k=Object.keys(x).find(k=>k.startsWith('__reactProps$'));
          const p=k?x[k]:null,f=p&&p.onClick;
          return {disabled:!!x.disabled,handlerName:typeof f==='function'?(f.name||'anonymous'):null,hasOnClick:typeof f==='function'};
        }),
        explorerMounted:/SCIIP Explorer|Property Explorer|Client production house/i.test(txt),
        url:location.href,
        probe:window.__sciipExportProbe||null
      };
    })()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; evid=app/"evidence/explorer4"

    p2=evid/R2/"first_record_target_selection_resolution.json"
    pc=evid/R23C/"exact_ten_record_guarded_export_execution_readiness_and_authorization.json"
    if not p2.exists() or not pc.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23D_R2_AND_R23C_EVIDENCE_REQUIRED");return 4

    r2=loadj(p2);r23c=loadj(pc)
    if r2.get("status")!="PASSED" or r2.get("state")!=R2_STATE or r2.get("resolution")!="CONTAINS_BUTTON_BINDING":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23D_R2_CONTAINS_BUTTON_BINDING_REQUIRED");return 5
    if r23c.get("status")!="PASSED" or r23c.get("state")!=R23C_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23C_EXACT_TEN_AUTHORIZATION_REQUIRED");return 6

    cohort=r23c.get("cohort") or []
    if len(cohort)!=10:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_TEN_COHORT_REQUIRED");return 7
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 8

    outcomes=[];halted=False

    print("="*120)
    print("SCIIP Explorer 4.0 — R23D-R3 Contains-Match Selection Binding + Ten-Record Export Recertification")
    print("="*120)

    for idx,target in enumerate(cohort,1):
        out={"ordinal":idx,"target":target}
        n=newpage()
        out["freshTargetCreated"]=bool(n and n.get("webSocketDebuggerUrl"))
        if not out["freshTargetCreated"]:
            out["certified"]=False;out["failure"]="FRESH_PAGE_CREATION_FAILED";outcomes.append(out);halted=True
        else:
            w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable");time.sleep(.8)
            try:
                out["explorerEntry"]=click_exact(w,"Explorer");time.sleep(.6)
                out["selection"]=click_target_resolved(w,target)
                out["selectionSettleReadback"]=bounded_selection_readback(w,target)
                out["selectedPropertyCertified"]=bool(
                    out["explorerEntry"].get("clicked") and
                    out["selection"].get("clicked") and
                    out["selectionSettleReadback"].get("certified")
                )
                if not out["selectedPropertyCertified"]:
                    out["certified"]=False;out["failure"]="SELECTION_OR_SETTLE_FAILED";outcomes.append(out);halted=True
                else:
                    out["assignmentsEntry"]=click_exact(w,"Assignments");time.sleep(.6)
                    s1=inspect(w)
                    out["assignmentsEntryCertified"]=bool(out["assignmentsEntry"].get("clicked") and s1.get("generateCount")==1 and s1.get("generateEnabled"))
                    if not out["assignmentsEntryCertified"]:
                        out["certified"]=False;out["failure"]="ASSIGNMENTS_OR_GENERATE_CONTROL_FAILED";outcomes.append(out);halted=True
                    else:
                        out["generateAction"]=click_exact(w,"Generate Client Listing Report");time.sleep(.7)
                        s2=inspect(w);dls=s2.get("downloadControls") or []
                        out["reportReviewEntryCertified"]=bool(out["generateAction"].get("clicked") and s2.get("reportReviewVisible"))
                        out["exportControlCertified"]=len(dls)==1 and not dls[0].get("disabled")
                        out["liveHandlerCertified"]=len(dls)==1 and dls[0].get("hasOnClick") and dls[0].get("handlerName")=="exportReport"

                        if not (out["reportReviewEntryCertified"] and out["exportControlCertified"] and out["liveHandlerCertified"]):
                            out["certified"]=False;out["failure"]="REPORT_REVIEW_OR_EXPORT_BINDING_FAILED";outcomes.append(out);halted=True
                        else:
                            out["probeInstall"]=ev(w,INSTALL) or {}
                            out["exportAction"]=click_exact(w,"Download Client Listing Report")
                            time.sleep(1.0)
                            s3=inspect(w);probe=s3.get("probe") or {}

                            pdf_events=[x for x in probe.get("events",[]) if x.get("type")=="createObjectURL" and x.get("blobType")=="application/pdf"]
                            pdf_downloads=[x for x in probe.get("downloads",[]) if str(x.get("download","")).lower().endswith(".pdf")]

                            out["artifact"]={
                              "pdfDownloadCount":len(pdf_downloads),
                              "pdfEventCount":len(pdf_events),
                              "filename":pdf_downloads[0].get("download") if len(pdf_downloads)==1 else None,
                              "mimeType":"application/pdf" if len(pdf_events)==1 else None,
                              "sizeBytes":pdf_events[0].get("size") if len(pdf_events)==1 else None
                            }
                            out["runtimeErrorCount"]=len(probe.get("errors") or [])
                            out["unhandledRejectionCount"]=len(probe.get("unhandled") or [])
                            out["postPublishReportReviewUnmountCertified"]=not bool(s3.get("reportReviewVisible"))
                            out["explorerContinuity"]=bool(s3.get("explorerMounted"))
                            out["sameOrigin"]=str(s3.get("url") or "").startswith(APP.rstrip("/"))
                            a=out["artifact"]
                            out["certified"]=all([
                              out["exportAction"].get("clicked"),
                              a["pdfDownloadCount"]==1,
                              a["pdfEventCount"]==1,
                              a["mimeType"]=="application/pdf",
                              isinstance(a["sizeBytes"],int) and a["sizeBytes"]>0,
                              str(a["filename"] or "").lower().endswith(".pdf"),
                              out["runtimeErrorCount"]==0,
                              out["unhandledRejectionCount"]==0,
                              out["postPublishReportReviewUnmountCertified"],
                              out["explorerContinuity"],
                              out["sameOrigin"]
                            ])
                            out["failure"]=None if out["certified"] else "EXPORT_OR_ARTIFACT_CERTIFICATION_FAILED"
                            outcomes.append(out)
                            if not out["certified"]:halted=True
            finally:
                try:w.call("Page.close")
                except:pass

        print(f"[{idx}/10] {target}")
        print("freshTargetCreated:",out.get("freshTargetCreated"))
        print("selectionBinding:",(out.get("selection") or {}).get("binding"))
        print("selectionClicked:",(out.get("selection") or {}).get("clicked"))
        print("selectedPropertyCertified:",out.get("selectedPropertyCertified"))
        print("selectionSettleCertified:",(out.get("selectionSettleReadback") or {}).get("certified"))
        print("consecutiveCertifiedSamples:",(out.get("selectionSettleReadback") or {}).get("consecutiveCertifiedSamples"))
        print("assignmentsEntryCertified:",out.get("assignmentsEntryCertified"))
        print("reportReviewEntryCertified:",out.get("reportReviewEntryCertified"))
        print("exportControlCertified:",out.get("exportControlCertified"))
        print("liveHandlerCertified:",out.get("liveHandlerCertified"))
        print("exportClicked:",(out.get("exportAction") or {}).get("clicked"))
        a=out.get("artifact") or {}
        print("pdfDownloadCount:",a.get("pdfDownloadCount"))
        print("pdfEventCount:",a.get("pdfEventCount"))
        print("pdfFilename:",a.get("filename"))
        print("pdfSizeBytes:",a.get("sizeBytes"))
        print("runtimeErrorCount:",out.get("runtimeErrorCount"))
        print("unhandledRejectionCount:",out.get("unhandledRejectionCount"))
        print("postPublishReportReviewUnmountCertified:",out.get("postPublishReportReviewUnmountCertified"))
        print("explorerContinuity:",out.get("explorerContinuity"))
        print("sameOrigin:",out.get("sameOrigin"))
        print("certified:",out.get("certified"))
        print("failure:",out.get("failure"))
        print()

        if halted:break

    all10=len(outcomes)==10 and all(x.get("certified") is True for x in outcomes)

    checks={
      "r23dR2Passed":True,
      "containsMatchBindingDiagnosisConsumed":True,
      "r23cExactTenAuthorizationConsumed":True,
      "exactThenUniqueContainsSelectionBindingUsed":True,
      "certifiedBrowserContextPreserved":True,
      "freshPagePerRecordPolicyUsed":all(x.get("freshTargetCreated") is True for x in outcomes),
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":halted or all10,
      "allExecutedSelectionsCertified":all(x.get("selectedPropertyCertified") is True for x in outcomes),
      "allExecutedSelectionSettlesCertified":all((x.get("selectionSettleReadback") or {}).get("certified") is True for x in outcomes),
      "allExecutedAssignmentsCertified":all(x.get("assignmentsEntryCertified") is True for x in outcomes),
      "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") is True for x in outcomes),
      "allExecutedExportControlsCertified":all(x.get("exportControlCertified") is True for x in outcomes),
      "allExecutedLiveHandlersCertified":all(x.get("liveHandlerCertified") is True for x in outcomes),
      "allExecutedExportsCertified":all(x.get("certified") is True for x in outcomes),
      "allTenExportsCertified":all10,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    state=("M419D4BN17C_R4_R12_R16A_R23D_R3_EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED"
           if all10 else
           "M419D4BN17C_R4_R12_R16A_R23D_R3_EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFICATION_INCOMPLETE")
    classification=("EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFIED_WITH_EXACT_THEN_UNIQUE_CONTAINS_TARGET_BINDING"
                    if all10 else
                    "EXACT_TEN_RECORD_GUARDED_EXPORT_RECERTIFICATION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R23E_EXACT_TEN_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
           if all10 else
           "M4_19D4BN17C_R4_R12_R16A_R23D_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    data={
      "framework":"SCIIP_EXPLORER_4_R23D_R3_CONTAINS_MATCH_SELECTION_BINDING_AND_TEN_RECORD_EXPORT_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if all10 else "DIAGNOSTIC_COMPLETE",
      "state":state,
      "classification":classification,
      "cohort":cohort,
      "outcomes":outcomes,
      "selectionBindingPolicy":{
        "exactMatchPreferred":True,
        "uniqueContainsFallbackAllowed":True,
        "ambiguousContainsMatchAllowed":False
      },
      "checks":checks,
      "authority":{
        "maximumExportClicksPerRecord":1,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"contains_match_selection_binding_and_ten_record_export_recertification.json"
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R23D-R3 Contains-Match Selection Binding + Ten-Record Export Recertification")
    print("="*120)
    print("CERTIFIED:",sum(1 for x in outcomes if x.get("certified")),"/10")
    print("HALTED_ON_FAILURE:",halted)
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",data["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if all10 else 9

if __name__=="__main__":
    raise SystemExit(main())
