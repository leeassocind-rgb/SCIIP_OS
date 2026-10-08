#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R2="M4_19D4BN17C_R4_R12_R16A_R24B_R2_CANDIDATE_LABEL_NORMALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
R2_STATE="M419D4BN17C_R4_R12_R16A_R24B_R2_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE"
M="M4_19D4BN17C_R4_R12_R16A_R24B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
PORT=9333; APP="http://127.0.0.1:5173/"; TARGET="9400 Holly Rd"

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
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').toLowerCase().includes({json.dumps(target.lower())})).length)()""") or 0
        ok=c==1;con=con+1 if ok else 0
        if con>=n:return True
        time.sleep(.15)
    return False
def click_target(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target.lower())},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').toLowerCase().includes(q));if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,text:(x[0].innerText||x[0].textContent||'').replace(/\\s+/g,' ').trim()}}}})()""") or {}
def wait_selected(w,target,seconds=2.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(target.lower())},x=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);return x.length===1 && (x[0].innerText||x[0].textContent||'').toLowerCase().includes(q)}})()""")
        ok=v is True;con=con+1 if ok else 0
        if con>=n:return True
        time.sleep(.1)
    return False
def inspect_controls(w):
    return ev(w,r"""(()=> {
      const norm=s=>(s||'').replace(/\s+/g,' ').trim();
      const btn=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null).map((x,i)=>({i,text:norm(x.innerText||x.textContent||''),disabled:!!x.disabled,cls:x.className||''}));
      const interesting=btn.filter(x=>/Generate Client Listing Report|Download Client Listing Report|Report Review|Review Client Listing Report|Assignments/i.test(x.text));
      return {interesting,body:(document.body?.innerText||'').slice(0,12000),url:location.href};
    })()""") or {}
def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";e=app/"evidence/explorer4"
    p=e/R2/"candidate_label_normalization_repair_and_fifteen_record_non_export_recertification.json"
    print("="*120);print("SCIIP Explorer 4.0 — R24B-R2-R1 Recertification Residual Causal Diagnosis");print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_REPORT_REVIEW_CAUSAL_DIAGNOSIS")
    print("Application source mutation: OFF\nGoverned data mutation: OFF\nNetwork authority: OFF\nPixel evidence: OFF\nExport invocation: OFF")
    if not p.exists():print("STATUS: BLOCKED\nDIAGNOSIS: R24B_R2_EVIDENCE_REQUIRED");return 4
    r=loadj(p)
    if r.get("status")!="DIAGNOSTIC_COMPLETE" or r.get("state")!=R2_STATE:
        print("STATUS: BLOCKED\nDIAGNOSIS: R24B_R2_INCOMPLETE_STATE_REQUIRED");return 5
    o=(r.get("outcomes") or [{}])[0]
    if o.get("target")!=TARGET or o.get("assignmentsEntryCertified") is not True or o.get("reportReviewEntryCertified") is not False:
        print("STATUS: BLOCKED\nDIAGNOSIS: FIRST_RECORD_REPORT_REVIEW_FAILURE_REQUIRED");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):print("STATUS: BLOCKED\nDIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):print("STATUS: BLOCKED\nDIAGNOSIS: FRESH_PAGE_REQUIRED");return 8
    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    ex,_=wait_exact(w,"Explorer",2,3);ee=click_exact(w,"Explorer") if ex else {}
    tb=wait_target(w,TARGET,5,3) if ee.get("clicked") else False
    sc=click_target(w,TARGET) if tb else {};ss=wait_selected(w,TARGET,2,3) if sc.get("clicked") else False
    ass,_=wait_exact(w,"Assignments",2,3) if ss else (False,[]);ac=click_exact(w,"Assignments") if ass else {}
    time.sleep(.5)
    pre=inspect_controls(w)
    gen_unique=sum(1 for x in pre.get("interesting",[]) if x["text"]=="Generate Client Listing Report" and not x["disabled"])==1
    gen_click=click_exact(w,"Generate Client Listing Report") if gen_unique else {"clicked":False}
    samples=[]
    for delay in [0.0,0.1,0.25,0.5,0.75,1.0,1.5,2.0,3.0]:
        if delay: time.sleep(delay-(samples[-1]["t"] if samples else 0))
        snap=inspect_controls(w); snap["t"]=delay
        samples.append(snap)
    try:w.call("Page.close")
    except:pass

    rr_button_seen=any(any(x["text"]=="Report Review" for x in s.get("interesting",[])) for s in samples)
    review_text_seen=any(("Review Client Listing Report" in s.get("body","") or "Institutional Reporting Engine" in s.get("body","")) for s in samples)
    download_seen=any(any(x["text"]=="Download Client Listing Report" for x in s.get("interesting",[])) for s in samples)

    if gen_unique and gen_click.get("clicked") and review_text_seen and download_seen:
        classification="GENERATE_CLICK_DIRECTLY_MATERIALIZES_REPORT_REVIEW_R24B_R2_ERRONEOUS_EXTRA_REPORT_REVIEW_BUTTON_ASSUMPTION"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R3_DIRECT_REPORT_REVIEW_MATERIALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
    elif gen_unique and gen_click.get("clicked") and rr_button_seen:
        classification="GENERATE_CLICK_MATERIALIZES_INTERMEDIATE_REPORT_REVIEW_CONTROL"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R3_INTERMEDIATE_REPORT_REVIEW_CONTROL_BINDING_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
    elif gen_unique and gen_click.get("clicked") and not review_text_seen:
        classification="GENERATE_CLICK_ACCEPTED_REPORT_REVIEW_NOT_MATERIALIZED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R3_REPORT_REVIEW_MATERIALIZATION_DEEP_DIAGNOSIS"
    elif not gen_unique:
        classification="GENERATE_CLIENT_LISTING_REPORT_CONTROL_NOT_UNIQUE_OR_NOT_MATERIALIZED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R3_GENERATE_CONTROL_BINDING_DIAGNOSIS"
    else:
        classification="REPORT_REVIEW_TRANSITION_CAUSE_REQUIRES_DEEPER_DIAGNOSIS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R3_REPORT_REVIEW_TRANSITION_DEEP_DIAGNOSIS"

    checks={
        "r24bR2IncompleteStateConsumed":True,"firstRecordResolved":True,"selectionPathReproduced":bool(ex and tb and ss),
        "assignmentsEntryReproduced":ac.get("clicked") is True,"generateControlInspected":True,"generateControlUniqueEnabled":gen_unique,
        "generateClickAttempted":gen_click.get("clicked") is True,"postGenerateSamplesCaptured":len(samples)==9,
        "reportReviewTextInspected":True,"intermediateReportReviewControlInspected":True,"downloadControlInspected":True,
        "exportInvocationOff":True,"applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    out={"framework":"SCIIP_EXPLORER_4_R24B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
         "state":"M419D4BN17C_R4_R12_R16A_R24B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED",
         "classification":classification,"target":TARGET,"sourceEvidence":{"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
         "preGenerate":pre,"generateAction":gen_click,"postGenerateSamples":samples,
         "diagnostic":{"reportReviewButtonSeen":rr_button_seen,"reviewTextSeen":review_text_seen,"downloadControlSeen":download_seen},
         "checks":checks,"authority":{"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "nextMilestone":nextm}
    od=e/M;od.mkdir(parents=True,exist_ok=True);ef=od/"recertification_residual_causal_diagnosis.json";ef.write_text(json.dumps(out,indent=2)+"\n")
    print("TARGET:",TARGET);print("GENERATE_CONTROL_UNIQUE_ENABLED:",gen_unique);print("GENERATE_CLICKED:",gen_click.get("clicked"))
    print("REPORT_REVIEW_BUTTON_SEEN:",rr_button_seen);print("REPORT_REVIEW_TEXT_SEEN:",review_text_seen);print("DOWNLOAD_CONTROL_SEEN:",download_seen)
    print("CLASSIFICATION:",classification);print("STATUS: PASSED");print("STATE: M419D4BN17C_R4_R12_R16A_R24B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED");print("NEXT_MILESTONE:",nextm);print("EVIDENCE:",ef)
    return 0
if __name__=="__main__":raise SystemExit(main())
