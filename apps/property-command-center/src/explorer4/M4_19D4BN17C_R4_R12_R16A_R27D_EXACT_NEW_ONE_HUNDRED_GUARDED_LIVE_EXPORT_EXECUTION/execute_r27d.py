#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
AUTH="M4_19D4BN17C_R4_R12_R16A_R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
CANON="M4_19D4BN17C_R4_R12_R16A_R27B_R4_EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGET_NORMALIZATION_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION"
EXPLORER_SAMPLING_ANCHOR="DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

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
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
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

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def exact_button_count(w,t):
    return ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)}).length)()""") or 0

def settle_exact_button_page_ready(w,t,sec=2.0,samples=3):
    st=time.time();c=0
    while time.time()-st<=sec:
        ready=ev(w,"document.readyState")
        buttons=ev(w,"document.querySelectorAll('button').length") or 0
        if ready!="complete" or buttons==0:
            time.sleep(.05);continue
        c=c+1 if exact_button_count(w,t)==1 else 0
        if c>=samples:return True
        time.sleep(.1)
    return False

def click_exact_button(w,t):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def inventory(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target)},bs=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled),txt=b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim();return bs.filter(b=>txt(b).startsWith(q)).map(b=>({{text:txt(b),aria:b.getAttribute('aria-label'),status:b.getAttribute('data-property-status'),className:String(b.className||''),outerHTML:b.outerHTML.slice(0,1800)}}));}})()""") or []

def settle_unique_binding(w,target,sec=5.0,samples=3):
    st=time.time();c=0;last=None
    while time.time()-st<=sec:
        inv=inventory(w,target);ok=len(inv)==1
        c=c+1 if ok else 0
        last={"count":len(inv),"inventory":inv}
        if c>=samples:return True,last
        time.sleep(.1)
    return False,last

def click_unique_candidate(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target)},bs=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled),txt=b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim();const x=bs.filter(b=>txt(b).startsWith(q));if(x.length!==1)return false;x[0].click();return true}})()""") is True

def install_probe(w):
    js=r"""(()=>{
      window.__SCIIP_R27D={downloads:[],objectUrls:[],errors:[],rejections:[]};
      const P=URL.createObjectURL.bind(URL);
      URL.createObjectURL=function(o){try{window.__SCIIP_R27D.objectUrls.push({type:o&&o.type,size:o&&o.size});}catch(e){} return P(o)};
      window.addEventListener('error',e=>window.__SCIIP_R27D.errors.push(String(e.message||e.error||e)));
      window.addEventListener('unhandledrejection',e=>window.__SCIIP_R27D.rejections.push(String(e.reason||e)));
      const A=HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click=function(){try{window.__SCIIP_R27D.downloads.push({download:this.download||null,href:String(this.href||'')});}catch(e){} return A.call(this)};
      return true;
    })()"""
    return ev(w,js) is True

def probe(w):
    return ev(w,"window.__SCIIP_R27D||null") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    pa=er/AUTH/"exact_two_hundred_guarded_export_execution_readiness_and_authorization.json"
    pt=er/CANON/"exact_new_one_hundred_canonical_targets.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27D Exact New One-Hundred Guarded Live Export Execution")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Reference closed records: 100")
    print("Live delta records: 100")
    print("Reference re-export: FORBIDDEN")
    print("Fresh page per record: REQUIRED")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")
    print("Explorer sampling anchor:",EXPLORER_SAMPLING_ANCHOR)
    print("Export authority: EXACTLY ONE GUARDED EXPORT CLICK PER RECORD MAXIMUM")

    if not pa.exists() or not pt.exists():
        print("STATUS: BLOCKED");print("REASON: R27C authorization and canonical new-100 targets required");return 4
    auth=loadj(pa);targets=loadj(pt)
    if auth.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: R27C authorization must be PASSED");return 5
    if not isinstance(targets,list) or len(targets)!=100 or len(set(x.lower() for x in targets))!=100:
        print("STATUS: BLOCKED");print("REASON: exact unique canonical new-100 target file required");return 6
    if os.environ.get("SCIIP_R27D_LIVE_EXPORT_AUTHORIZED")!="YES":
        print("STATUS: BLOCKED");print("REASON: certified wrapper authorization gate missing");return 7
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: CDP browser context required");return 8

    outcomes=[]
    for ordinal,target in enumerate(targets,101):
        o={"ordinal":ordinal,"target":target,"certified":False,"exportClicked":False}
        p=newpage();o["freshTargetCreated"]=bool(p and p.get("webSocketDebuggerUrl"))
        if not o["freshTargetCreated"]:
            o["failure"]="FRESH_PAGE_FAILED";outcomes.append(o);break

        w=W(p["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
        o["explorerSettleCertified"]=settle_exact_button_page_ready(w,"Explorer",2.0,3)
        o["explorerEntryCertified"]=click_exact_button(w,"Explorer") if o["explorerSettleCertified"] else False

        bound,br=settle_unique_binding(w,target,5.0,3) if o["explorerEntryCertified"] else (False,None)
        o["targetBindingSettleCertified"]=bound;o["bindingReadback"]=br
        o["selectionCertified"]=click_unique_candidate(w,target) if bound else False

        st=time.time();c=0
        while o["selectionCertified"] and time.time()-st<=2:
            ok=ev(w,"""(()=>!!document.querySelector('.sciip-property-marker[aria-pressed="true"],.sciip-property-marker.selected,[data-selected="true"]')||document.body.innerText.includes('Assignments'))()""")
            c=c+1 if ok else 0
            if c>=3:break
            time.sleep(.1)
        o["selectedPropertySettleCertified"]=c>=3

        o["assignmentsEntryCertified"]=(settle_exact_button_page_ready(w,"Assignments",2.0,3) and click_exact_button(w,"Assignments")) if o["selectedPropertySettleCertified"] else False
        time.sleep(.15)

        gen=None
        if o["assignmentsEntryCertified"]:
            for lab in ["Generate Client Listing Report","Generate"]:
                if settle_exact_button_page_ready(w,lab,2.0,3):
                    gen=lab;break
        o["generateControlCertified"]=bool(gen)
        o["reportReviewEntryCertified"]=click_exact_button(w,gen) if gen else False

        st=time.time();ec=0
        while o["reportReviewEntryCertified"] and time.time()-st<=4:
            ok=exact_button_count(w,"Download Client Listing Report")==1
            ec=ec+1 if ok else 0
            if ec>=3:break
            time.sleep(.1)
        o["exportControlCertified"]=ec>=3
        o["probeInstrumentationInstalled"]=install_probe(w) if o["exportControlCertified"] else False

        # Single-click maximum. No retry.
        if o["probeInstrumentationInstalled"]:
            o["exportClicked"]=click_exact_button(w,"Download Client Listing Report")

        time.sleep(.7)
        pr=probe(w)
        downloads=pr.get("downloads") or []
        objs=pr.get("objectUrls") or []
        errs=pr.get("errors") or []
        rejs=pr.get("rejections") or []
        pdfobjs=[x for x in objs if str(x.get("type") or "")=="application/pdf"]
        pdfdls=[x for x in downloads if str(x.get("download") or "").lower().endswith(".pdf")]

        o["artifact"]={
          "pdfDownloadCount":len(pdfdls),
          "pdfObjectUrlEventCount":len(pdfobjs),
          "pdfFilename":pdfdls[0].get("download") if len(pdfdls)==1 else None,
          "pdfMimeType":pdfobjs[0].get("type") if len(pdfobjs)==1 else None,
          "pdfSizeBytes":pdfobjs[0].get("size") if len(pdfobjs)==1 else None
        }
        o["runtimeErrorCount"]=len(errs)
        o["unhandledRejectionCount"]=len(rejs)
        o["postPublishReportReviewUnmountCertified"]=exact_button_count(w,"Download Client Listing Report")==0 if o["exportClicked"] else False
        o["explorerContinuity"]=exact_button_count(w,"Explorer")==1
        o["sameOrigin"]=str(ev(w,"location.origin") or "")=="http://127.0.0.1:5173"

        a=o["artifact"]
        o["certified"]=all([
          o.get("freshTargetCreated"),o.get("explorerSettleCertified"),o.get("explorerEntryCertified"),
          o.get("targetBindingSettleCertified"),o.get("selectionCertified"),o.get("selectedPropertySettleCertified"),
          o.get("assignmentsEntryCertified"),o.get("generateControlCertified"),o.get("reportReviewEntryCertified"),
          o.get("exportControlCertified"),o.get("probeInstrumentationInstalled"),o.get("exportClicked"),
          a["pdfDownloadCount"]==1,a["pdfObjectUrlEventCount"]==1,a["pdfMimeType"]=="application/pdf",
          isinstance(a["pdfSizeBytes"],(int,float)) and a["pdfSizeBytes"]>0,
          isinstance(a["pdfFilename"],str) and a["pdfFilename"].lower().endswith(".pdf"),
          o["runtimeErrorCount"]==0,o["unhandledRejectionCount"]==0,
          o["postPublishReportReviewUnmountCertified"],o["explorerContinuity"],o["sameOrigin"]
        ])
        if not o["certified"]:o["failure"]="EXPORT_OR_ARTIFACT_CERTIFICATION_FAILED"
        outcomes.append(o)

        print(f"[{ordinal}/200] {target}")
        print("certified:",o["certified"])
        print("failure:",o.get("failure"))
        print("artifact:",json.dumps(o["artifact"]))
        print()

        if not o["certified"]:break

    certified=sum(1 for x in outcomes if x.get("certified"))
    status="PASSED" if len(outcomes)==100 and certified==100 else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION_CERTIFIED"
           if status=="PASSED" else
           "M419D4BN17C_R4_R12_R16A_R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R27E_EXACT_TWO_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE"
         if status=="PASSED" else
         "M4_19D4BN17C_R4_R12_R16A_R27D_R1_LIVE_EXPORT_RESIDUAL_CAUSAL_DIAGNOSIS")

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_new_one_hundred_guarded_live_export_execution.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,
      "referenceClosedCount":100,
      "liveDeltaTargetCount":100,
      "referenceReexported":False,
      "explorerSamplingAnchor":EXPLORER_SAMPLING_ANCHOR,
      "outcomeCount":len(outcomes),
      "certifiedCount":certified,
      "outcomes":outcomes,
      "checks":{
        "r27cAuthorizationConsumed":True,
        "exactNewOneHundredTargetsConsumed":True,
        "referenceOneHundredNotReexported":True,
        "freshPagePerRecordUsed":True,
        "strictSequentialObserved":True,
        "haltOnFirstFailureObserved":True,
        "singleExportMaximumPerRecordPreserved":True,
        "pageReadyAnchoredExplorerSamplingPreserved":True,
        "allExecutedArtifactsCertified":all(x.get("certified") for x in outcomes) if outcomes else False,
        "allNewOneHundredCertified":status=="PASSED",
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
      },
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R27D Exact New One-Hundred Guarded Live Export Execution")
    print("="*120)
    print("CERTIFIED:",certified,"/100")
    print("REFERENCE_ONE_HUNDRED_REEXPORTED: False")
    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR27D EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if status=="PASSED" else 10

if __name__=="__main__":
    raise SystemExit(main())
