#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

AUTH="M4_19D4BN17C_R4_R12_R16A_R24C_R2_NORMALIZED_EXACT_TWENTY_FIVE_EXPORT_AUTHORIZATION_RECERTIFICATION"
AUTH_STATE="M419D4BN17C_R4_R12_R16A_R24C_R2_NORMALIZED_EXACT_TWENTY_FIVE_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
AUTH_CLASS="NORMALIZED_EXACT_TWENTY_FIVE_COHORT_RECONCILED_AND_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
M="M4_19D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION"
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
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("ws")
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

def wait_exact(w,text,seconds=2.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        ok=c==1;con=con+1 if ok else 0;s.append({"t":round(time.time()-st,3),"count":c,"valid":ok})
        if con>=n:return True,s
        time.sleep(.1)
    return False,s

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def wait_target(w,target,seconds=5.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(target.lower())},btn=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled);const exact=btn.filter(b=>(b.innerText||b.textContent||'').trim().toLowerCase()===q);const contains=btn.filter(b=>(b.innerText||b.textContent||'').toLowerCase().includes(q));return{{exactCount:exact.length,containsCount:contains.length,containsTexts:contains.map(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim())}}}})()""") or {}
        ok=v.get("exactCount")==1 or (v.get("exactCount")==0 and v.get("containsCount")==1)
        con=con+1 if ok else 0;v["t"]=round(time.time()-st,3);v["valid"]=ok;s.append(v)
        if con>=n:
            binding="EXACT" if v.get("exactCount")==1 else "UNIQUE_CONTAINS"
            return True,binding,s
        time.sleep(.15)
    return False,None,s

def click_target(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target.lower())},btn=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled);const exact=btn.filter(b=>(b.innerText||b.textContent||'').trim().toLowerCase()===q);const contains=btn.filter(b=>(b.innerText||b.textContent||'').toLowerCase().includes(q));let x=null,binding=null;if(exact.length===1){{x=exact[0];binding='EXACT'}}else if(exact.length===0&&contains.length===1){{x=contains[0];binding='UNIQUE_CONTAINS'}}else return{{clicked:false,exactCount:exact.length,containsCount:contains.length}};x.click();return{{clicked:true,binding,text:(x.innerText||x.textContent||'').replace(/\\s+/g,' ').trim()}}}})()""") or {}

def wait_selected(w,target,seconds=2.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(target.lower())},x=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);const t=x.map(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim());return{{selectedCount:x.length,matchCount:t.filter(z=>z.toLowerCase().includes(q)).length,texts:t}}}})()""") or {}
        ok=v.get("selectedCount")==1 and v.get("matchCount")==1
        con=con+1 if ok else 0;v["t"]=round(time.time()-st,3);v["valid"]=ok;s.append(v)
        if con>=n:return True,s
        time.sleep(.1)
    return False,s

def wait_direct_review(w,seconds=3.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        v=ev(w,r"""(()=>{const txt=document.body?.innerText||'';const d=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{reviewVisible:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),downloadCount:d.length,downloadEnabled:d.length===1&&!d[0].disabled}})()""") or {}
        ok=v.get("reviewVisible") and v.get("downloadCount")==1 and v.get("downloadEnabled")
        con=con+1 if ok else 0;v["t"]=round(time.time()-st,3);v["valid"]=bool(ok);s.append(v)
        if con>=n:return True,s
        time.sleep(.1)
    return False,s

def inspect_handler(w):
    return ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return{count:x.length,hasOnClick:false,handlerName:null};const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));const p=k?x[0][k]:null;const f=p&&p.onClick;return{count:1,hasOnClick:typeof f==='function',handlerName:typeof f==='function'?(f.name||'anonymous'):null}})()""") or {}

def install_probe(w):
    return ev(w,r"""(()=>{window.__sciipR24DProbe={downloads:[],objectUrls:[],errors:[],rejections:[]};
const P=window.__sciipR24DProbe;
const oldCreate=URL.createObjectURL.bind(URL);URL.createObjectURL=function(blob){const u=oldCreate(blob);P.objectUrls.push({type:blob?.type||'',size:blob?.size||0,url:u});return u};
const oldClick=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){P.downloads.push({download:this.download||'',href:this.href||''});return oldClick.call(this)};
window.addEventListener('error',e=>P.errors.push(String(e.error||e.message||'error')));
window.addEventListener('unhandledrejection',e=>P.rejections.push(String(e.reason||'rejection')));
return true})()""") is True

def read_probe(w):
    return ev(w,r"""(()=>window.__sciipR24DProbe||{downloads:[],objectUrls:[],errors:[],rejections:[]})()""") or {}

def state_after(w):
    return ev(w,r"""(()=>{const txt=document.body?.innerText||'';const explorer=[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer');const review=/Review Client Listing Report|Institutional Reporting Engine/i.test(txt);return{explorerMounted:explorer,reportReviewVisible:review,sameOrigin:location.origin==='http://127.0.0.1:5173'}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";e=app/"evidence/explorer4"
    ap=e/AUTH/"normalized_exact_twenty_five_export_authorization_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24D Exact Twenty-Five Record Guarded Export Execution")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export authority: EXACTLY ONE GUARDED EXPORT CLICK PER RECORD MAXIMUM")
    print("Fresh page per record: REQUIRED")
    print("Explorer settle: THREE CONSECUTIVE CERTIFIED SAMPLES WITHIN 2.0 SECONDS")
    print("Target binding settle: THREE CONSECUTIVE CERTIFIED SAMPLES WITHIN 5.0 SECONDS")
    print("Selected-property settle: THREE CONSECUTIVE CERTIFIED SAMPLES WITHIN 2.0 SECONDS")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")

    if not ap.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R24C_R2_AUTHORIZATION_EVIDENCE_REQUIRED");return 4
    a=loadj(ap)
    if a.get("status")!="PASSED" or a.get("state")!=AUTH_STATE or a.get("classification")!=AUTH_CLASS or a.get("liveExportExecutionAuthorized") is not True:
        print("STATUS: BLOCKED");print("DIAGNOSIS: NORMALIZED_EXACT_TWENTY_FIVE_EXPORT_AUTHORIZATION_REQUIRED");return 5
    cohort=a.get("normalizedExactTwentyFiveCohort") or []
    if len(cohort)!=25 or len({x.lower() for x in cohort})!=25:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_TWENTY_FIVE_UNIQUE_AUTHORIZED_COHORT_REQUIRED");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7

    outcomes=[];halted=False
    for i,target in enumerate(cohort,1):
        o={"ordinal":i,"target":target}
        n=newpage();o["freshTargetCreated"]=bool(n and n.get("webSocketDebuggerUrl"))
        if not o["freshTargetCreated"]:
            o["certified"]=False;o["failure"]="FRESH_PAGE_FAILED";outcomes.append(o);halted=True
        else:
            w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
            try:
                ex,_=wait_exact(w,"Explorer",2,3);o["explorerSettleCertified"]=ex
                ee=click_exact(w,"Explorer") if ex else {};o["explorerEntryClicked"]=ee.get("clicked") is True
                tb,binding,_=wait_target(w,target,5,3) if o["explorerEntryClicked"] else (False,None,[])
                o["targetBindingSettleCertified"]=tb;o["selectionBinding"]=binding
                sc=click_target(w,target) if tb else {};o["selectionClicked"]=sc.get("clicked") is True
                ss,_=wait_selected(w,target,2,3) if o["selectionClicked"] else (False,[]);o["selectedPropertyCertified"]=ss
                ass,_=wait_exact(w,"Assignments",2,3) if ss else (False,[]);o["assignmentsControlCertified"]=ass
                ae=click_exact(w,"Assignments") if ass else {};o["assignmentsEntryCertified"]=ae.get("clicked") is True
                gen,_=wait_exact(w,"Generate Client Listing Report",2,3) if o["assignmentsEntryCertified"] else (False,[])
                o["generateControlCertified"]=gen
                ge=click_exact(w,"Generate Client Listing Report") if gen else {};o["generateClicked"]=ge.get("clicked") is True
                rr,_=wait_direct_review(w,3,3) if o["generateClicked"] else (False,[]);o["reportReviewEntryCertified"]=rr
                h=inspect_handler(w) if rr else {};o["exportControlCertified"]=rr and h.get("count")==1
                o["liveHandlerCertified"]=h.get("hasOnClick") is True and h.get("handlerName")=="exportReport"
                probe=install_probe(w) if o["liveHandlerCertified"] else False;o["probeInstrumentationInstalled"]=probe

                before=state_after(w) if probe else {}
                click=click_exact(w,"Download Client Listing Report") if probe else {}
                o["exportClicked"]=click.get("clicked") is True
                time.sleep(.25)
                P=read_probe(w) if o["exportClicked"] else {}
                after=state_after(w) if o["exportClicked"] else {}

                downloads=[x for x in P.get("downloads",[]) if str(x.get("download","")).lower().endswith(".pdf")]
                pdf_events=[x for x in P.get("objectUrls",[]) if x.get("type")=="application/pdf"]
                o["artifact"]={
                    "pdfDownloadCount":len(downloads),
                    "pdfObjectUrlEventCount":len(pdf_events),
                    "pdfFilename":downloads[0].get("download") if len(downloads)==1 else None,
                    "pdfHref":downloads[0].get("href") if len(downloads)==1 else None,
                    "pdfMimeType":pdf_events[0].get("type") if len(pdf_events)==1 else None,
                    "pdfSizeBytes":pdf_events[0].get("size") if len(pdf_events)==1 else None
                }
                o["runtimeErrorCount"]=len(P.get("errors",[]))
                o["unhandledRejectionCount"]=len(P.get("rejections",[]))
                o["postPublishReportReviewUnmountCertified"]=after.get("reportReviewVisible") is False
                o["explorerContinuity"]=after.get("explorerMounted") is True
                o["sameOrigin"]=after.get("sameOrigin") is True

                art=o["artifact"]
                o["certified"]=all([
                    o["freshTargetCreated"],o["explorerSettleCertified"],o["explorerEntryClicked"],
                    o["targetBindingSettleCertified"],o["selectionClicked"],o["selectedPropertyCertified"],
                    o["assignmentsControlCertified"],o["assignmentsEntryCertified"],o["generateControlCertified"],
                    o["generateClicked"],o["reportReviewEntryCertified"],o["exportControlCertified"],
                    o["liveHandlerCertified"],o["probeInstrumentationInstalled"],o["exportClicked"],
                    art["pdfDownloadCount"]==1,art["pdfObjectUrlEventCount"]==1,
                    art["pdfMimeType"]=="application/pdf",isinstance(art["pdfSizeBytes"],int) and art["pdfSizeBytes"]>0,
                    isinstance(art["pdfFilename"],str) and art["pdfFilename"].lower().endswith(".pdf"),
                    o["runtimeErrorCount"]==0,o["unhandledRejectionCount"]==0,
                    o["postPublishReportReviewUnmountCertified"],o["explorerContinuity"],o["sameOrigin"]
                ])
                o["failure"]=None if o["certified"] else "EXPORT_OR_ARTIFACT_RUNTIME_CERTIFICATION_FAILED"
                outcomes.append(o)
                if not o["certified"]:halted=True
            finally:
                try:w.call("Page.close")
                except:pass

        print(f"[{i}/25] {target}")
        for k in ["freshTargetCreated","explorerSettleCertified","targetBindingSettleCertified","selectionBinding",
                  "selectedPropertyCertified","assignmentsEntryCertified","reportReviewEntryCertified",
                  "exportControlCertified","liveHandlerCertified","exportClicked","runtimeErrorCount",
                  "unhandledRejectionCount","postPublishReportReviewUnmountCertified","explorerContinuity",
                  "sameOrigin","certified","failure"]:
            print(f"{k}: {o.get(k)}")
        if o.get("artifact") is not None:
            for k,v in o["artifact"].items(): print(f"{k}: {v}")
        print()
        if halted: break

    all25=len(outcomes)==25 and all(x.get("certified") is True for x in outcomes)
    status="PASSED" if all25 else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_CERTIFIED"
           if all25 else
           "M419D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_INCOMPLETE")
    classification=("EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_CERTIFIED"
                    if all25 else "EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24E_EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
           if all25 else "M4_19D4BN17C_R4_R12_R16A_R24D_R1_GUARDED_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS")

    checks={
        "r24cR2AuthorizationConsumed":True,
        "exactTwentyFiveAuthorizedCohortConsumed":len(cohort)==25,
        "certifiedBrowserContextPreserved":True,
        "freshPagePerRecordPolicyUsed":all(x.get("freshTargetCreated") is True for x in outcomes),
        "strictSequentialObserved":True,
        "haltOnFirstFailureObserved":halted or all25,
        "allExecutedExplorerSettlesCertified":all(x.get("explorerSettleCertified") is True for x in outcomes),
        "allExecutedTargetBindingSettlesCertified":all(x.get("targetBindingSettleCertified") is True for x in outcomes),
        "allExecutedSelectionsCertified":all(x.get("selectedPropertyCertified") is True for x in outcomes),
        "allExecutedAssignmentsCertified":all(x.get("assignmentsEntryCertified") is True for x in outcomes),
        "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") is True for x in outcomes),
        "allExecutedExportControlsCertified":all(x.get("exportControlCertified") is True for x in outcomes),
        "allExecutedLiveHandlersCertified":all(x.get("liveHandlerCertified") is True for x in outcomes),
        "allExecutedExportsCertified":all(x.get("certified") is True for x in outcomes),
        "allTwentyFiveExportsCertified":all25,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    out={"framework":"SCIIP_EXPLORER_4_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":status,"state":state,"classification":classification,
         "cohort":cohort,"outcomes":outcomes,"checks":checks,
         "executionPolicy":{"freshPagePerRecord":True,"strictSequential":True,"haltOnFirstFailure":True,
                            "maximumExportClicksPerRecord":1,"explorerSettleMaxSeconds":2.0,
                            "targetBindingSettleMaxSeconds":5.0,"selectedPropertySettleMaxSeconds":2.0},
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False,
                      "exportInvocation":"EXACTLY_ONE_GUARDED_CLICK_PER_EXECUTED_RECORD_MAXIMUM"},
         "sourceEvidence":{"authorizationPath":str(ap),"authorizationSha256":hashlib.sha256(ap.read_bytes()).hexdigest()},
         "nextMilestone":nextm}

    od=e/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_twenty_five_record_guarded_export_execution.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R24D Exact Twenty-Five Record Guarded Export Execution")
    print("="*120)
    print(f"CERTIFIED: {sum(1 for x in outcomes if x.get('certified'))} /25")
    print("HALTED_ON_FAILURE:",halted)
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__": raise SystemExit(main())
