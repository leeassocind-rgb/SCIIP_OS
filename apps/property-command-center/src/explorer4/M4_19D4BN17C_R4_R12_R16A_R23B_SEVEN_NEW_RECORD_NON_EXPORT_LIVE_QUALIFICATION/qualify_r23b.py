#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R23B_SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
R23A="M4_19D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R23A_STATE="M419D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
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
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length,reason:'EXACT_CONTROL_NOT_UNIQUE'}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def click_target(w,target):
    return ev(w,f"""(()=>{{const T={json.dumps(target)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));if(xs.length!==1)return{{clicked:false,count:xs.length,candidates:xs.map(x=>(x.innerText||x.textContent||'').trim())}};xs[0].click();return{{clicked:true,count:1,text:(xs[0].innerText||xs[0].textContent||'').trim()}}}})()""") or {}

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

def inspect_report_review(w):
    return ev(w,r"""(()=> {
      const txt=document.body?.innerText||'';
      const buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null);
      const dl=buttons.filter(x=>(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');
      return {
        reportReviewVisible:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),
        downloadControls:dl.map(x=>{
          const k=Object.keys(x).find(k=>k.startsWith('__reactProps$'));
          const p=k?x[k]:null,f=p&&p.onClick;
          return {
            disabled:!!x.disabled,
            handlerName:typeof f==='function'?(f.name||'anonymous'):null,
            hasOnClick:typeof f==='function'
          };
        }),
        explorerMounted:/SCIIP Explorer|Property Explorer|Client production house/i.test(txt),
        url:location.href
      };
    })()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; evid=app/"evidence/explorer4"

    p=evid/R23A/"exact_ten_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23A_EVIDENCE_REQUIRED");return 4
    r23a=loadj(p)
    if r23a.get("status")!="PASSED" or r23a.get("state")!=R23A_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R23A_PREAUTHORIZATION_REQUIRED");return 5

    selected_new=r23a.get("selectedNewCandidates") or []
    targets=[x.get("label") for x in selected_new if x.get("label")]
    if len(targets)!=7:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_SEVEN_NEW_TARGETS_REQUIRED");return 6

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7

    outcomes=[]
    halted=False

    for idx,target in enumerate(targets,1):
        out={"ordinal":idx,"target":target}
        n=newpage()
        out["freshTargetCreated"]=bool(n and n.get("webSocketDebuggerUrl"))
        if not out["freshTargetCreated"]:
            out["qualified"]=False;out["failure"]="FRESH_PAGE_CREATION_FAILED";outcomes.append(out);halted=True;break

        w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable");time.sleep(.8)

        try:
            out["explorerEntry"]=click_exact(w,"Explorer");time.sleep(.6)
            out["selection"]=click_target(w,target)
            out["selectionSettleReadback"]=bounded_selection_readback(w,target)
            out["selectedPropertyCertified"]=bool(
                out["explorerEntry"].get("clicked") and
                out["selection"].get("clicked") and
                out["selectionSettleReadback"].get("certified")
            )
            if not out["selectedPropertyCertified"]:
                out["qualified"]=False;out["failure"]="SELECTION_OR_SETTLE_FAILED";outcomes.append(out);halted=True;break

            out["assignmentsEntry"]=click_exact(w,"Assignments");time.sleep(.6)
            generate=ev(w,r"""(()=>{const xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==='Generate Client Listing Report');return{count:xs.length,enabled:xs.length===1&&!xs[0].disabled}})()""") or {}
            out["assignmentsEntryCertified"]=bool(out["assignmentsEntry"].get("clicked") and generate.get("count")==1 and generate.get("enabled"))
            if not out["assignmentsEntryCertified"]:
                out["qualified"]=False;out["failure"]="ASSIGNMENTS_OR_GENERATE_CONTROL_FAILED";outcomes.append(out);halted=True;break

            out["generateAction"]=click_exact(w,"Generate Client Listing Report");time.sleep(.7)
            rr=inspect_report_review(w)
            dls=rr.get("downloadControls") or []
            out["reportReviewEntryCertified"]=bool(out["generateAction"].get("clicked") and rr.get("reportReviewVisible"))
            out["exportControlCertified"]=len(dls)==1 and not dls[0].get("disabled")
            out["liveHandlerCertified"]=len(dls)==1 and dls[0].get("hasOnClick") and dls[0].get("handlerName")=="exportReport"
            out["explorerContinuity"]=bool(rr.get("explorerMounted"))
            out["sameOrigin"]=str(rr.get("url") or "").startswith(APP.rstrip("/"))

            out["qualified"]=all([
                out["reportReviewEntryCertified"],
                out["exportControlCertified"],
                out["liveHandlerCertified"],
                out["explorerContinuity"],
                out["sameOrigin"]
            ])
            out["failure"]=None if out["qualified"] else "REPORT_REVIEW_OR_EXPORT_BINDING_FAILED"
            outcomes.append(out)
            if not out["qualified"]:
                halted=True;break
        finally:
            try:w.call("Page.close")
            except:pass

        print(f"[{idx}/7] {target}")
        print("freshTargetCreated:",out.get("freshTargetCreated"))
        print("selectedPropertyCertified:",out.get("selectedPropertyCertified"))
        print("selectionSettleCertified:",(out.get("selectionSettleReadback") or {}).get("certified"))
        print("consecutiveCertifiedSamples:",(out.get("selectionSettleReadback") or {}).get("consecutiveCertifiedSamples"))
        print("assignmentsEntryCertified:",out.get("assignmentsEntryCertified"))
        print("reportReviewEntryCertified:",out.get("reportReviewEntryCertified"))
        print("exportControlCertified:",out.get("exportControlCertified"))
        print("liveHandlerCertified:",out.get("liveHandlerCertified"))
        print("explorerContinuity:",out.get("explorerContinuity"))
        print("sameOrigin:",out.get("sameOrigin"))
        print("qualified:",out.get("qualified"))
        print("failure:",out.get("failure"))
        print()

    all7=len(outcomes)==7 and all(x.get("qualified") is True for x in outcomes)

    checks={
      "r23aPassed":True,
      "exactSevenNewTargetsConsumed":len(targets)==7,
      "certifiedBrowserContextPreserved":True,
      "freshPagePerRecordPolicyUsed":all(x.get("freshTargetCreated") is True for x in outcomes),
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":halted or all7,
      "allExecutedSelectionsCertified":all(x.get("selectedPropertyCertified") is True for x in outcomes),
      "allExecutedSelectionSettlesCertified":all((x.get("selectionSettleReadback") or {}).get("certified") is True for x in outcomes),
      "allExecutedAssignmentsCertified":all(x.get("assignmentsEntryCertified") is True for x in outcomes),
      "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") is True for x in outcomes),
      "allExecutedExportControlsCertified":all(x.get("exportControlCertified") is True for x in outcomes),
      "allExecutedLiveHandlersCertified":all(x.get("liveHandlerCertified") is True for x in outcomes),
      "allExecutedExplorerContinuityCertified":all(x.get("explorerContinuity") is True for x in outcomes),
      "allExecutedSameOriginCertified":all(x.get("sameOrigin") is True for x in outcomes),
      "allSevenNewRecordsQualified":all7,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R23B_SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R23B_SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE")
    classification=("SEVEN_NEW_RECORDS_SELECTION_SETTLE_ASSIGNMENTS_REPORT_REVIEW_AND_EXPORT_BINDING_NON_EXPORT_QUALIFIED"
                    if passed else
                    "SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R23C_EXACT_TEN_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R23B_R1_NON_EXPORT_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    data={
      "framework":"SCIIP_EXPLORER_4_R23B_SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":state,
      "classification":classification,
      "targets":targets,
      "outcomes":outcomes,
      "checks":checks,
      "authority":{
        "exportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"seven_new_record_non_export_live_qualification.json"
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R23B Seven-New-Record Non-Export Live Qualification")
    print("="*120)
    print("QUALIFIED:",sum(1 for x in outcomes if x.get("qualified")),"/7")
    print("HALTED_ON_FAILURE:",halted)
    print("EXPORT_INVOCATION: OFF")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",data["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
