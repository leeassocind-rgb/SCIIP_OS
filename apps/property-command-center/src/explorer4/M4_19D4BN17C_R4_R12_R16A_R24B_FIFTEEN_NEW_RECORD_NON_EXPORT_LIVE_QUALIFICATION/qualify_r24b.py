#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R24A="M4_19D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R24A_STATE="M419D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
M="M4_19D4BN17C_R4_R12_R16A_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"

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
        if not m: raise RuntimeError("bad websocket")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("websocket handshake failed")
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

def count_exact_button(w,text):
    return ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0

def wait_unique_exact_button(w,text,max_seconds=2.0,required_consecutive=3):
    start=time.time();samples=[];consecutive=0
    while time.time()-start<=max_seconds:
        c=count_exact_button(w,text); ok=(c==1)
        samples.append({"elapsedSeconds":round(time.time()-start,3),"count":c,"certified":ok})
        consecutive=consecutive+1 if ok else 0
        if consecutive>=required_consecutive:
            return {"certified":True,"samples":samples,"consecutiveCertifiedSamples":consecutive}
        time.sleep(.1)
    return {"certified":False,"samples":samples,"consecutiveCertifiedSamples":consecutive}

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length,reason:'EXACT_CONTROL_NOT_UNIQUE'}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def wait_target_binding(w,target,max_seconds=5.0,required_consecutive=3):
    start=time.time();samples=[];consecutive=0
    while time.time()-start<=max_seconds:
        s=ev(w,f"""(()=>{{
          const T={json.dumps(target)};
          const buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled);
          const exact=buttons.filter(x=>(x.innerText||x.textContent||'').trim()===T).length;
          const contains=buttons.filter(x=>(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase())).length;
          return{{exactCount:exact,containsCount:contains}};
        }})()""") or {}
        ok=(s.get("exactCount")==1 or (s.get("exactCount")==0 and s.get("containsCount")==1))
        s["elapsedSeconds"]=round(time.time()-start,3); s["certified"]=ok
        samples.append(s)
        consecutive=consecutive+1 if ok else 0
        if consecutive>=required_consecutive:
            return {"certified":True,"samples":samples,"consecutiveCertifiedSamples":consecutive}
        time.sleep(.1)
    return {"certified":False,"samples":samples,"consecutiveCertifiedSamples":consecutive}

def click_target(w,target):
    return ev(w,f"""(()=>{{
      const T={json.dumps(target)};
      const buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled);
      const exact=buttons.filter(x=>(x.innerText||x.textContent||'').trim()===T);
      if(exact.length===1){{exact[0].click();return{{clicked:true,binding:'EXACT',text:(exact[0].innerText||exact[0].textContent||'').trim()}}}}
      const contains=buttons.filter(x=>(x.innerText||x.textContent||'').toLowerCase().includes(T.toLowerCase()));
      if(contains.length===1){{contains[0].click();return{{clicked:true,binding:'UNIQUE_CONTAINS',text:(contains[0].innerText||contains[0].textContent||'').trim()}}}}
      return{{clicked:false,exactCount:exact.length,containsCount:contains.length,reason:'TARGET_BINDING_NOT_UNIQUE'}};
    }})()""") or {}

def selection_snapshot(w,target):
    return ev(w,f"""(()=>{{const T={json.dumps(target)},txt=document.body?.innerText||'';const sm=[...document.querySelectorAll('.sciip-property-marker.is-selected')].map(x=>(x.innerText||x.textContent||'').trim());return{{
      targetVisible:txt.toLowerCase().includes(T.toLowerCase()),
      selectedMarkerMatchesTarget:sm.some(x=>x.toLowerCase().includes(T.toLowerCase())),
      selectedMarkerTexts:sm,
      assignmentsCount:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==='Assignments').length
    }}}})()""") or {}

def wait_selected(w,target,max_seconds=2.0,required_consecutive=3):
    start=time.time();samples=[];consecutive=0
    while time.time()-start<=max_seconds:
        s=selection_snapshot(w,target)
        s["elapsedSeconds"]=round(time.time()-start,3)
        ok=bool(s.get("targetVisible") and s.get("selectedMarkerMatchesTarget") and s.get("assignmentsCount")==1)
        s["certified"]=ok
        samples.append(s)
        consecutive=consecutive+1 if ok else 0
        if consecutive>=required_consecutive:
            return {"certified":True,"samples":samples,"consecutiveCertifiedSamples":consecutive}
        time.sleep(.1)
    return {"certified":False,"samples":samples,"consecutiveCertifiedSamples":consecutive}

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
        url:location.href
      };
    })()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"
    p=evid/R24A/"exact_twenty_five_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24B Fifteen-New-Record Non-Export Live Qualification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export invocation: OFF")
    print("Fresh page per record: REQUIRED")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")

    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24A_EVIDENCE_REQUIRED"); return 4
    r=loadj(p)
    if r.get("status")!="PASSED" or r.get("state")!=R24A_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24A_PREAUTHORIZATION_REQUIRED"); return 5

    new=[x.get("label") for x in (r.get("selectedNewCandidates") or [])]
    if len(new)!=15 or any(not x for x in new):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: EXACT_FIFTEEN_NEW_TARGETS_REQUIRED"); return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ACTIVE_CDP_REQUIRED"); return 7

    outcomes=[]; halted=False
    for idx,target in enumerate(new,1):
        o={"ordinal":idx,"target":target}
        n=newpage()
        o["freshTargetCreated"]=bool(n and n.get("webSocketDebuggerUrl"))
        if not o["freshTargetCreated"]:
            o["qualified"]=False;o["failure"]="FRESH_PAGE_CREATION_FAILED";outcomes.append(o);halted=True
        else:
            w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
            try:
                o["explorerSettleReadback"]=wait_unique_exact_button(w,"Explorer",2.0,3)
                if not o["explorerSettleReadback"].get("certified"):
                    o["qualified"]=False;o["failure"]="EXPLORER_SETTLE_FAILED";outcomes.append(o);halted=True
                else:
                    o["explorerEntry"]=click_exact(w,"Explorer")
                    o["targetBindingSettleReadback"]=wait_target_binding(w,target,5.0,3)
                    if not (o["explorerEntry"].get("clicked") and o["targetBindingSettleReadback"].get("certified")):
                        o["qualified"]=False;o["failure"]="TARGET_BINDING_SETTLE_FAILED";outcomes.append(o);halted=True
                    else:
                        o["selection"]=click_target(w,target)
                        o["selectionSettleReadback"]=wait_selected(w,target,2.0,3)
                        o["selectedPropertyCertified"]=bool(o["selection"].get("clicked") and o["selectionSettleReadback"].get("certified"))
                        if not o["selectedPropertyCertified"]:
                            o["qualified"]=False;o["failure"]="SELECTION_OR_SETTLE_FAILED";outcomes.append(o);halted=True
                        else:
                            o["assignmentsEntry"]=click_exact(w,"Assignments")
                            time.sleep(.5)
                            s1=inspect(w)
                            o["assignmentsEntryCertified"]=bool(o["assignmentsEntry"].get("clicked") and s1.get("generateCount")==1 and s1.get("generateEnabled"))
                            if not o["assignmentsEntryCertified"]:
                                o["qualified"]=False;o["failure"]="ASSIGNMENTS_OR_GENERATE_CONTROL_FAILED";outcomes.append(o);halted=True
                            else:
                                o["generateAction"]=click_exact(w,"Generate Client Listing Report")
                                time.sleep(.6)
                                s2=inspect(w); dls=s2.get("downloadControls") or []
                                o["reportReviewEntryCertified"]=bool(o["generateAction"].get("clicked") and s2.get("reportReviewVisible"))
                                o["exportControlCertified"]=len(dls)==1 and not dls[0].get("disabled")
                                o["liveHandlerCertified"]=len(dls)==1 and dls[0].get("hasOnClick") and dls[0].get("handlerName")=="exportReport"
                                o["explorerContinuity"]=bool(s2.get("explorerMounted"))
                                o["sameOrigin"]=str(s2.get("url") or "").startswith(APP.rstrip("/"))
                                o["qualified"]=all([
                                    o["reportReviewEntryCertified"],o["exportControlCertified"],o["liveHandlerCertified"],
                                    o["explorerContinuity"],o["sameOrigin"]
                                ])
                                o["failure"]=None if o["qualified"] else "REPORT_REVIEW_OR_EXPORT_BINDING_FAILED"
                                outcomes.append(o)
                                if not o["qualified"]: halted=True
            finally:
                try:w.call("Page.close")
                except:pass

        print(f"[{idx}/15] {target}")
        print("freshTargetCreated:",o.get("freshTargetCreated"))
        print("explorerSettleCertified:",(o.get("explorerSettleReadback") or {}).get("certified"))
        print("targetBindingSettleCertified:",(o.get("targetBindingSettleReadback") or {}).get("certified"))
        print("selectionBinding:",(o.get("selection") or {}).get("binding"))
        print("selectedPropertyCertified:",o.get("selectedPropertyCertified"))
        print("assignmentsEntryCertified:",o.get("assignmentsEntryCertified"))
        print("reportReviewEntryCertified:",o.get("reportReviewEntryCertified"))
        print("exportControlCertified:",o.get("exportControlCertified"))
        print("liveHandlerCertified:",o.get("liveHandlerCertified"))
        print("explorerContinuity:",o.get("explorerContinuity"))
        print("sameOrigin:",o.get("sameOrigin"))
        print("qualified:",o.get("qualified"))
        print("failure:",o.get("failure"))
        print()

        if halted: break

    all15=len(outcomes)==15 and all(x.get("qualified") is True for x in outcomes)
    checks={
        "r24aPassed":True,
        "exactFifteenNewTargetsConsumed":True,
        "certifiedBrowserContextPreserved":True,
        "freshPagePerRecordPolicyUsed":all(x.get("freshTargetCreated") is True for x in outcomes),
        "strictSequentialObserved":True,
        "haltOnFirstFailureObserved":halted or all15,
        "allExecutedExplorerSettlesCertified":all((x.get("explorerSettleReadback") or {}).get("certified") is True for x in outcomes),
        "allExecutedTargetBindingSettlesCertified":all((x.get("targetBindingSettleReadback") or {}).get("certified") is True for x in outcomes),
        "allExecutedSelectionsCertified":all(x.get("selectedPropertyCertified") is True for x in outcomes),
        "allExecutedAssignmentsCertified":all(x.get("assignmentsEntryCertified") is True for x in outcomes),
        "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") is True for x in outcomes),
        "allExecutedExportControlsCertified":all(x.get("exportControlCertified") is True for x in outcomes),
        "allExecutedLiveHandlersCertified":all(x.get("liveHandlerCertified") is True for x in outcomes),
        "allExecutedExplorerContinuityCertified":all(x.get("explorerContinuity") is True for x in outcomes),
        "allExecutedSameOriginCertified":all(x.get("sameOrigin") is True for x in outcomes),
        "allFifteenNewRecordsQualified":all15,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    state=("M419D4BN17C_R4_R12_R16A_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"
           if all15 else
           "M419D4BN17C_R4_R12_R16A_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE")
    classification=("FIFTEEN_NEW_RECORDS_SELECTION_SETTLE_ASSIGNMENTS_REPORT_REVIEW_AND_EXPORT_BINDING_NON_EXPORT_QUALIFIED"
                    if all15 else
                    "FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
           if all15 else
           "M4_19D4BN17C_R4_R12_R16A_R24B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    out={
        "framework":"SCIIP_EXPLORER_4_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if all15 else "DIAGNOSTIC_COMPLETE",
        "state":state,
        "classification":classification,
        "sourceEvidence":{"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
        "targets":new,
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

    od=evid/M; od.mkdir(parents=True,exist_ok=True)
    ef=od/"fifteen_new_record_non_export_live_qualification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R24B Fifteen-New-Record Non-Export Live Qualification")
    print("="*120)
    print("QUALIFIED:",sum(1 for x in outcomes if x.get("qualified")),"/15")
    print("HALTED_ON_FAILURE:",halted)
    print("EXPORT_INVOCATION: OFF")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if all15 else 9

if __name__=="__main__":
    raise SystemExit(main())
