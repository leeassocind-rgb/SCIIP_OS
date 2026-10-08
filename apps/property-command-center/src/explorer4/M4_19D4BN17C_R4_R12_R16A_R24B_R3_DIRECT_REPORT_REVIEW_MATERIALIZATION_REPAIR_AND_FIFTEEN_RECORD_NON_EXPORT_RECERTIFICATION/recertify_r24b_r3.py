#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R24A="M4_19D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R1="M4_19D4BN17C_R4_R12_R16A_R24B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R24B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
R1_CLASS="GENERATE_CLICK_DIRECTLY_MATERIALIZES_REPORT_REVIEW_R24B_R2_ERRONEOUS_EXTRA_REPORT_REVIEW_BUTTON_ASSUMPTION"
M="M4_19D4BN17C_R4_R12_R16A_R24B_R3_DIRECT_REPORT_REVIEW_MATERIALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
PORT=9333; APP="http://127.0.0.1:5173/"

RAW_FALLBACK=[
"9400 Holly Rd","SE of Adelanto Rd and Rancho RdPROPOSED ·","SE of Emerald Rd and Rancho RdPROPOSED ·",
"29701 Agoura Rd","1150 N Ocean Cir","1210 N Tustin Ave","1211 N Miller St","1215 N Van Buren St",
"1515 - 1715 E Winston Rd","1547 S State College Blvd","1661 - 1701 S State College Blvd (Portfolio)",
"1771 S Lewis St","2000 - 2050 E Winston Rd","2872 E La Palma Ave","3125 E Coronado St"]

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
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5);k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("ws")
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

def norm_candidate(raw):
    s=re.sub(r"\s+"," ",raw or "").strip()
    m=re.match(r"^(.*?)(?=(?:EXISTING|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U/C)\s*·)",s,re.I)
    return m.group(1).strip() if m else s

def wait_exact(w,text,seconds=2.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        ok=c==1;con=con+1 if ok else 0;s.append({"t":round(time.time()-st,3),"count":c,"valid":ok})
        if con>=n:return True,s
        time.sleep(.1)
    return False,s

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1}}}})()""") or {}

def wait_target(w,target,seconds=5.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(target.lower())},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').toLowerCase().includes(q));return{{count:x.length,texts:x.map(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim())}}}})()""") or {"count":0}
        ok=v.get("count")==1;con=con+1 if ok else 0;v["t"]=round(time.time()-st,3);v["valid"]=ok;s.append(v)
        if con>=n:return True,s
        time.sleep(.15)
    return False,s

def click_target(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target.lower())},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').toLowerCase().includes(q));if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,text:(x[0].innerText||x[0].textContent||'').replace(/\\s+/g,' ').trim()}}}})()""") or {}

def wait_selected(w,target,seconds=2.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(target.lower())},x=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);const t=x.map(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim());return{{selectedCount:x.length,matchCount:t.filter(z=>z.toLowerCase().includes(q)).length,texts:t}}}})()""") or {}
        ok=v.get("selectedCount")==1 and v.get("matchCount")==1;con=con+1 if ok else 0;v["t"]=round(time.time()-st,3);v["valid"]=ok;s.append(v)
        if con>=n:return True,s
        time.sleep(.1)
    return False,s

def wait_direct_review(w,seconds=3.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        v=ev(w,r"""(()=> {
          const txt=document.body?.innerText||'';
          const d=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');
          return {
            reviewVisible:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),
            downloadCount:d.length,
            downloadEnabled:d.length===1&&!d[0].disabled
          };
        })()""") or {}
        ok=v.get("reviewVisible") and v.get("downloadCount")==1 and v.get("downloadEnabled")
        con=con+1 if ok else 0;v["t"]=round(time.time()-st,3);v["valid"]=bool(ok);s.append(v)
        if con>=n:return True,s
        time.sleep(.1)
    return False,s

def handler_cert(w):
    return ev(w,r"""(()=> {
      const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');
      if(x.length!==1)return {count:x.length,handlerName:null,hasOnClick:false};
      const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));
      const p=k?x[0][k]:null,f=p&&p.onClick;
      return {count:1,handlerName:typeof f==='function'?(f.name||'anonymous'):null,hasOnClick:typeof f==='function'};
    })()""") or {}

def continuity(w):
    return ev(w,r"""(()=>({explorer:[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer'),sameOrigin:location.origin==='http://127.0.0.1:5173'}))()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/"apps/property-command-center"; e=app/"evidence/explorer4"
    a=e/R24A/"exact_twenty_five_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    r1=e/R1/"recertification_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24B-R3 Direct Report Review Materialization Repair + Fifteen-Record Non-Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export invocation: OFF")
    print("Fresh page per record: REQUIRED")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")
    print("Report Review transition: Generate click MUST directly materialize Review + Download control")

    if not a.exists() or not r1.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING");return 4
    A=loadj(a);D=loadj(r1)
    if A.get("status")!="PASSED" or D.get("status")!="PASSED" or D.get("state")!=R1_STATE or D.get("classification")!=R1_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: DIRECT_REPORT_REVIEW_CAUSE_NOT_CERTIFIED");return 5
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 6

    raws=RAW_FALLBACK
    targets=[norm_candidate(x) for x in raws]
    outcomes=[];halted=False

    for i,(raw,target) in enumerate(zip(raws,targets),1):
        o={"ordinal":i,"rawTarget":raw,"target":target}
        n=newpage();o["freshTargetCreated"]=bool(n and n.get("webSocketDebuggerUrl"))
        if not o["freshTargetCreated"]:
            o["qualified"]=False;o["failure"]="FRESH_PAGE_FAILED";outcomes.append(o);halted=True
        else:
            w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
            try:
                ex,_=wait_exact(w,"Explorer",2.0,3);o["explorerSettleCertified"]=ex
                ee=click_exact(w,"Explorer") if ex else {};o["explorerEntryClicked"]=ee.get("clicked") is True
                tb,_=wait_target(w,target,5.0,3) if o["explorerEntryClicked"] else (False,[]);o["targetBindingSettleCertified"]=tb
                sc=click_target(w,target) if tb else {};o["selectionClicked"]=sc.get("clicked") is True;o["selectionBoundText"]=sc.get("text")
                ss,_=wait_selected(w,target,2.0,3) if o["selectionClicked"] else (False,[]);o["selectedPropertyCertified"]=ss
                ass,_=wait_exact(w,"Assignments",2.0,3) if ss else (False,[]);o["assignmentsControlCertified"]=ass
                ae=click_exact(w,"Assignments") if ass else {};o["assignmentsEntryCertified"]=ae.get("clicked") is True
                gen,_=wait_exact(w,"Generate Client Listing Report",2.0,3) if o["assignmentsEntryCertified"] else (False,[]);o["generateControlCertified"]=gen
                ge=click_exact(w,"Generate Client Listing Report") if gen else {};o["generateClicked"]=ge.get("clicked") is True
                dr,_=wait_direct_review(w,3.0,3) if o["generateClicked"] else (False,[]);o["reportReviewEntryCertified"]=dr
                h=handler_cert(w) if dr else {};o["exportControlCertified"]=dr;o["liveHandlerCertified"]=h.get("hasOnClick") and h.get("handlerName")=="exportReport"
                c=continuity(w);o["explorerContinuity"]=c.get("explorer") is True;o["sameOrigin"]=c.get("sameOrigin") is True
                o["qualified"]=all([o["explorerSettleCertified"],o["explorerEntryClicked"],o["targetBindingSettleCertified"],
                    o["selectionClicked"],o["selectedPropertyCertified"],o["assignmentsControlCertified"],o["assignmentsEntryCertified"],
                    o["generateControlCertified"],o["generateClicked"],o["reportReviewEntryCertified"],o["exportControlCertified"],
                    o["liveHandlerCertified"],o["explorerContinuity"],o["sameOrigin"]])
                o["failure"]=None if o["qualified"] else "NON_EXPORT_QUALIFICATION_FAILED"
                outcomes.append(o)
                if not o["qualified"]:halted=True
            finally:
                try:w.call("Page.close")
                except:pass

        print(f"[{i}/15] {raw}")
        for k in ["target","explorerSettleCertified","targetBindingSettleCertified","selectedPropertyCertified",
                  "assignmentsEntryCertified","generateControlCertified","generateClicked","reportReviewEntryCertified",
                  "exportControlCertified","liveHandlerCertified","explorerContinuity","sameOrigin","qualified","failure"]:
            print(f"{k}: {o.get(k)}")
        print()
        if halted:break

    all15=len(outcomes)==15 and all(x.get("qualified") is True for x in outcomes)
    status="PASSED" if all15 else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R24B_R3_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_RECERTIFIED"
           if all15 else
           "M419D4BN17C_R4_R12_R16A_R24B_R3_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE")
    classification=("FIFTEEN_NEW_RECORDS_DIRECT_REPORT_REVIEW_MATERIALIZATION_AND_EXPORT_BINDING_NON_EXPORT_QUALIFIED"
                    if all15 else
                    "FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
           if all15 else
           "M4_19D4BN17C_R4_R12_R16A_R24B_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    checks={
        "r24aPassed":True,
        "r24bR2R1DirectMaterializationCauseConsumed":True,
        "candidateStatusSuffixNormalizationPreserved":True,
        "freshPagePerRecordPolicyUsed":all(x.get("freshTargetCreated") is True for x in outcomes),
        "strictSequentialObserved":True,
        "haltOnFirstFailureObserved":halted or all15,
        "allExecutedExplorerSettlesCertified":all(x.get("explorerSettleCertified") is True for x in outcomes),
        "allExecutedTargetBindingsCertified":all(x.get("targetBindingSettleCertified") is True for x in outcomes),
        "allExecutedSelectionsCertified":all(x.get("selectedPropertyCertified") is True for x in outcomes),
        "allExecutedAssignmentsCertified":all(x.get("assignmentsEntryCertified") is True for x in outcomes),
        "allExecutedGenerateControlsCertified":all(x.get("generateControlCertified") is True for x in outcomes),
        "allExecutedGenerateClicksCertified":all(x.get("generateClicked") is True for x in outcomes),
        "allExecutedDirectReportReviewsCertified":all(x.get("reportReviewEntryCertified") is True for x in outcomes),
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

    out={"framework":"SCIIP_EXPLORER_4_R24B_R3_DIRECT_REPORT_REVIEW_MATERIALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"classification":classification,
         "rawTargets":raws,"normalizedTargets":targets,"outcomes":outcomes,"checks":checks,
         "repair":{"candidateLabelNormalization":"STATUS_SUFFIX_BOUNDARY_ONLY","reportReviewTransition":"GENERATE_DIRECTLY_MATERIALIZES_REVIEW_AND_DOWNLOAD_CONTROL","intermediateReportReviewButtonRequired":False},
         "authority":{"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "nextMilestone":nextm}
    od=e/M;od.mkdir(parents=True,exist_ok=True);ef=od/"direct_report_review_materialization_repair_and_fifteen_record_non_export_recertification.json";ef.write_text(json.dumps(out,indent=2)+"\n")
    print("="*120);print(f"QUALIFIED: {sum(1 for x in outcomes if x.get('qualified'))} /15");print("HALTED_ON_FAILURE:",halted);print("EXPORT_INVOCATION: OFF")
    print("STATUS:",status);print("STATE:",state);print("CLASSIFICATION:",classification);print("NEXT_MILESTONE:",nextm);print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":raise SystemExit(main())
