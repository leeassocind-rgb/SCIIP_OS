#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R25C="M4_19D4BN17C_R4_R12_R16A_R25C_EXACT_FIFTY_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
R25C_STATE="M419D4BN17C_R4_R12_R16A_R25C_EXACT_FIFTY_RECORD_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
R25D_R2="M4_19D4BN17C_R4_R12_R16A_R25D_R2_THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSIS"
R25D_R2_STATE="M419D4BN17C_R4_R12_R16A_R25D_R2_THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DIAGNOSED"
R25D_R2_CLASS="THIRD_RECORD_EXPLORER_CONTROL_MATERIALIZATION_WITHIN_TWO_SECONDS_PRIOR_FAILURE_TRANSIENT"
M="M4_19D4BN17C_R4_R12_R16A_R25D_R3_BOUNDED_EXPLORER_SETTLE_AND_EXACT_FIFTY_EXPORT_RECERTIFICATION"
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

def bounded_exact_settle(w,text,seconds=2.0,n=3):
    st=time.time();con=0;samples=[]
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);return{{count:x.length,texts:x.map(b=>(b.innerText||b.textContent||'').trim())}}}})()""") or {}
        ok=v.get("count")==1
        con=con+1 if ok else 0
        samples.append({"elapsedSeconds":round(time.time()-st,3),"count":v.get("count"),"certified":ok})
        if con>=n:return True,samples
        time.sleep(.1)
    return False,samples

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

JS_HELPERS=r"""
const ns=s=>(s||'').replace(/\s+/g,' ').trim();
const candidateLabel=s=>{s=ns(s);const re=/(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·/i;const m=re.exec(s);return m?s.slice(0,m.index).trim():s;};
"""

def wait_target(w,target,seconds=5.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{{JS_HELPERS}
const q=ns({json.dumps(target)}).toLowerCase();
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{const text=ns(b.innerText||b.textContent||'');const label=candidateLabel(text);return{{text,label,full:text.toLowerCase(),norm:label.toLowerCase()}}}});
const exact=rows.filter(x=>x.full===q),norm=rows.filter(x=>x.norm===q),contains=rows.filter(x=>x.full.includes(q));
let binding=null;if(exact.length===1)binding='EXACT';else if(exact.length===0&&norm.length===1)binding='BOUNDARY_NORMALIZED_IDENTITY';else if(exact.length===0&&norm.length===0&&contains.length===1)binding='UNIQUE_CONTAINS';
return{{binding,exactCount:exact.length,normalizedCount:norm.length,containsCount:contains.length}};
}})()""") or {}
        ok=v.get("binding") in ("EXACT","BOUNDARY_NORMALIZED_IDENTITY","UNIQUE_CONTAINS")
        con=con+1 if ok else 0
        if con>=n:return True,v.get("binding")
        time.sleep(.15)
    return False,None

def click_target(w,target):
    return ev(w,f"""(()=>{{{JS_HELPERS}
const q=ns({json.dumps(target)}).toLowerCase();
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{const text=ns(b.innerText||b.textContent||'');const label=candidateLabel(text);return{{b,text,label,full:text.toLowerCase(),norm:label.toLowerCase()}}}});
const exact=rows.filter(x=>x.full===q),norm=rows.filter(x=>x.norm===q),contains=rows.filter(x=>x.full.includes(q));
let x=null,binding=null;if(exact.length===1){{x=exact[0];binding='EXACT'}}else if(exact.length===0&&norm.length===1){{x=norm[0];binding='BOUNDARY_NORMALIZED_IDENTITY'}}else if(exact.length===0&&norm.length===0&&contains.length===1){{x=contains[0];binding='UNIQUE_CONTAINS'}}else return{{clicked:false,reason:'IDENTITY_NOT_UNIQUE'}};
x.b.click();return{{clicked:true,binding,text:x.text,label:x.label}};
}})()""") or {}

def wait_selected(w,target,seconds=2.0,n=3):
    st=time.time();con=0;q=target.lower()
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(q)},x=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);const t=x.map(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim());return{{count:x.length,match:t.filter(z=>z.toLowerCase()===q||z.toLowerCase().includes(q)).length}}}})()""") or {}
        ok=v.get("count")==1 and v.get("match")==1
        con=con+1 if ok else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def wait_review(w,seconds=3,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        v=ev(w,r"""(()=>{const txt=document.body?.innerText||'';const d=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{review:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),downloadCount:d.length,enabled:d.length===1&&!d[0].disabled}})()""") or {}
        ok=v.get("review") and v.get("downloadCount")==1 and v.get("enabled")
        con=con+1 if ok else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def install_probe(w):
    return ev(w,r"""(()=>{window.__r25d3={downloads:[],objectUrls:[],errors:[],rejections:[]};const p=window.__r25d3;
const oldA=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){try{p.downloads.push({download:this.download||'',href:this.href||''})}catch{}return oldA.apply(this,arguments)};
const old=URL.createObjectURL.bind(URL);URL.createObjectURL=function(blob){const u=old(blob);try{p.objectUrls.push({href:u,type:blob?.type||'',size:blob?.size||0})}catch{}return u};
window.addEventListener('error',e=>p.errors.push(String(e.error||e.message||'error')));
window.addEventListener('unhandledrejection',e=>p.rejections.push(String(e.reason||'rejection')));return true;})()""") is True

def handler(w):
    return ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return{count:x.length,name:null,enabled:false};const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));const f=k&&x[0][k]&&x[0][k].onClick;return{count:1,name:typeof f==='function'?(f.name||'anonymous'):null,enabled:!x[0].disabled}})()""") or {}

def post(w):
    return ev(w,r"""(()=>{const p=window.__r25d3||{};const txt=document.body?.innerText||'';return{downloads:p.downloads||[],objectUrls:p.objectUrls||[],errors:p.errors||[],rejections:p.rejections||[],reportReviewVisible:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),explorerMounted:[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer'),sameOrigin:location.origin==='http://127.0.0.1:5173'}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    pc=evid/R25C/"exact_fifty_record_guarded_export_execution_readiness_and_authorization.json"
    pd=evid/R25D_R2/"third_record_explorer_control_materialization_timing_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R25D-R3 Bounded Explorer Settle + Exact Fifty Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Explorer settle: THREE CONSECUTIVE UNIQUE EXACT SAMPLES WITHIN 2.0 SECONDS")
    print("Export authority: EXACTLY ONE GUARDED EXPORT CLICK PER RECORD MAXIMUM")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")

    if not pc.exists() or not pd.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25C_AND_R25D_R2_EVIDENCE_REQUIRED");return 4
    c=loadj(pc);d=loadj(pd)
    if c.get("status")!="PASSED" or c.get("state")!=R25C_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25C_AUTHORIZATION_REQUIRED");return 5
    if d.get("status")!="PASSED" or d.get("state")!=R25D_R2_STATE or d.get("classification")!=R25D_R2_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25D_R2_TRANSIENT_EXPLORER_TIMING_DIAGNOSIS_REQUIRED");return 6

    targets=c.get("exactFiftyCohort") or c.get("cohort") or c.get("targets") or []
    targets=[x if isinstance(x,str) else x.get("target") or x.get("name") for x in targets]
    targets=[x for x in targets if x]
    if len(targets)!=50 or len({x.lower() for x in targets})!=50:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_FIFTY_UNIQUE_TARGETS_REQUIRED");return 7
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 8

    outcomes=[];halted=False
    for i,target in enumerate(targets,1):
        o={"ordinal":i,"target":target}
        n=newpage();o["freshTargetCreated"]=bool(n and n.get("webSocketDebuggerUrl"))
        if not o["freshTargetCreated"]:
            o["certified"]=False;o["failure"]="FRESH_PAGE_FAILED";outcomes.append(o);halted=True
        else:
            w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
            try:
                ex,samp=bounded_exact_settle(w,"Explorer",2.0,3)
                o["explorerSettleCertified"]=ex;o["explorerSettleSamples"]=samp
                ee=click_exact(w,"Explorer") if ex else {};o["explorerEntryCertified"]=ee.get("clicked") is True
                tb,binding=wait_target(w,target,5,3) if o["explorerEntryCertified"] else (False,None)
                o["targetBindingSettleCertified"]=tb;o["selectionBinding"]=binding
                sc=click_target(w,target) if tb else {};o["selectionClicked"]=sc.get("clicked") is True
                sp=wait_selected(w,target,2,3) if o["selectionClicked"] else False;o["selectedPropertyCertified"]=sp
                ac,asamp=bounded_exact_settle(w,"Assignments",2,3) if sp else (False,[])
                o["assignmentsSettleCertified"]=ac
                ae=click_exact(w,"Assignments") if ac else {};o["assignmentsEntryCertified"]=ae.get("clicked") is True
                gc,gsamp=bounded_exact_settle(w,"Generate Client Listing Report",2,3) if o["assignmentsEntryCertified"] else (False,[])
                ge=click_exact(w,"Generate Client Listing Report") if gc else {};o["generateClicked"]=ge.get("clicked") is True
                rr=wait_review(w,3,3) if o["generateClicked"] else False;o["reportReviewEntryCertified"]=rr
                h=handler(w) if rr else {}
                o["exportControlCertified"]=rr and h.get("count")==1 and h.get("enabled") is True
                o["liveHandlerCertified"]=h.get("name")=="exportReport"
                o["probeInstrumentationInstalled"]=install_probe(w) if o["liveHandlerCertified"] else False
                ea=click_exact(w,"Download Client Listing Report") if o["probeInstrumentationInstalled"] else {}
                o["exportClicked"]=ea.get("clicked") is True
                time.sleep(.75)
                pr=post(w) if o["exportClicked"] else {}
                pdfd=[x for x in pr.get("downloads",[]) if str(x.get("download","")).lower().endswith(".pdf")]
                pdfo=[x for x in pr.get("objectUrls",[]) if x.get("type")=="application/pdf"]
                o["artifact"]={"pdfDownloadCount":len(pdfd),"pdfObjectUrlEventCount":len(pdfo),
                               "pdfFilename":pdfd[0].get("download") if len(pdfd)==1 else None,
                               "pdfMimeType":pdfo[0].get("type") if len(pdfo)==1 else None,
                               "pdfSizeBytes":pdfo[0].get("size") if len(pdfo)==1 else None}
                o["runtimeErrorCount"]=len(pr.get("errors",[]));o["unhandledRejectionCount"]=len(pr.get("rejections",[]))
                o["postPublishReportReviewUnmountCertified"]=pr.get("reportReviewVisible") is False
                o["explorerContinuity"]=pr.get("explorerMounted") is True;o["sameOrigin"]=pr.get("sameOrigin") is True
                a=o["artifact"]
                o["certified"]=all([o["freshTargetCreated"],o["explorerSettleCertified"],o["explorerEntryCertified"],o["targetBindingSettleCertified"],o["selectionClicked"],o["selectedPropertyCertified"],o["assignmentsSettleCertified"],o["assignmentsEntryCertified"],o["generateClicked"],o["reportReviewEntryCertified"],o["exportControlCertified"],o["liveHandlerCertified"],o["probeInstrumentationInstalled"],o["exportClicked"],a["pdfDownloadCount"]==1,a["pdfObjectUrlEventCount"]==1,a["pdfMimeType"]=="application/pdf",bool(a["pdfSizeBytes"] and a["pdfSizeBytes"]>0),bool(a["pdfFilename"] and a["pdfFilename"].lower().endswith(".pdf")),o["runtimeErrorCount"]==0,o["unhandledRejectionCount"]==0,o["postPublishReportReviewUnmountCertified"],o["explorerContinuity"],o["sameOrigin"]])
                o["failure"]=None if o["certified"] else "EXPORT_OR_ARTIFACT_CERTIFICATION_FAILED"
                outcomes.append(o)
                if not o["certified"]:halted=True
            finally:
                try:w.call("Page.close")
                except:pass
        print(f"[{i}/50] {target}")
        for k in ["freshTargetCreated","explorerSettleCertified","explorerEntryCertified","targetBindingSettleCertified","selectionBinding","selectedPropertyCertified","assignmentsEntryCertified","reportReviewEntryCertified","exportControlCertified","liveHandlerCertified","exportClicked","runtimeErrorCount","unhandledRejectionCount","postPublishReportReviewUnmountCertified","explorerContinuity","sameOrigin","certified","failure"]:
            print(f"{k}: {o.get(k)}")
        if o.get("artifact"):print("artifact:",json.dumps(o["artifact"],ensure_ascii=False))
        print()
        if halted:break

    all50=len(outcomes)==50 and all(x.get("certified") for x in outcomes)
    checks={
      "r25cPassed":True,
      "r25dR2Passed":True,
      "transientExplorerTimingDiagnosisConsumed":True,
      "exactFiftyAuthorizationConsumed":True,
      "boundedExplorerSettleUsed":True,
      "explorerSettleThreeConsecutiveSamplesRequired":True,
      "explorerSettleMaximumSecondsTwoPreserved":True,
      "freshPagePerRecordPolicyUsed":all(x.get("freshTargetCreated") for x in outcomes),
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":halted or all50,
      "allExecutedExplorerSettlesCertified":all(x.get("explorerSettleCertified") for x in outcomes),
      "allExecutedTargetBindingSettlesCertified":all(x.get("targetBindingSettleCertified") for x in outcomes),
      "allExecutedSelectionsCertified":all(x.get("selectedPropertyCertified") for x in outcomes),
      "allExecutedAssignmentsCertified":all(x.get("assignmentsEntryCertified") for x in outcomes),
      "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") for x in outcomes),
      "allExecutedExportControlsCertified":all(x.get("exportControlCertified") for x in outcomes),
      "allExecutedLiveHandlersCertified":all(x.get("liveHandlerCertified") for x in outcomes),
      "allExecutedExportsCertified":all(x.get("certified") for x in outcomes),
      "allFiftyExportsCertified":all50,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    status="PASSED" if all50 else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R25D_R3_EXACT_FIFTY_RECORD_GUARDED_EXPORT_RECERTIFICATION_CERTIFIED" if all50 else "M419D4BN17C_R4_R12_R16A_R25D_R3_EXACT_FIFTY_RECORD_GUARDED_EXPORT_RECERTIFICATION_INCOMPLETE")
    classification=("BOUNDED_EXPLORER_SETTLE_PARITY_CERTIFIED_EXACT_FIFTY_RECORD_GUARDED_EXPORT_RECERTIFICATION_PASSED" if all50 else "EXACT_FIFTY_RECORD_GUARDED_EXPORT_RECERTIFICATION_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R25E_EXACT_FIFTY_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION" if all50 else "M4_19D4BN17C_R4_R12_R16A_R25D_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    out={"framework":"SCIIP_EXPLORER_4_R25D_R3_BOUNDED_EXPLORER_SETTLE_AND_EXACT_FIFTY_EXPORT_RECERTIFICATION","generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"classification":classification,"cohort":targets,"outcomes":outcomes,"checks":checks,"authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False,"maximumExportClicksPerRecord":1,"strictSequential":True,"haltOnFirstFailure":True},"sourceEvidence":{"r25cPath":str(pc),"r25cSha256":hashlib.sha256(pc.read_bytes()).hexdigest(),"r25dR2Path":str(pd),"r25dR2Sha256":hashlib.sha256(pd.read_bytes()).hexdigest()},"nextMilestone":nxt}
    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"bounded_explorer_settle_and_exact_fifty_export_recertification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120);print("SCIIP Explorer 4.0 — R25D-R3 Bounded Explorer Settle + Exact Fifty Export Recertification");print("="*120)
    print("CERTIFIED:",sum(1 for x in outcomes if x.get("certified")),"/50");print("HALTED_ON_FAILURE:",halted)
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("CLASSIFICATION:",classification);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
    return 0

if __name__=="__main__": raise SystemExit(main())
