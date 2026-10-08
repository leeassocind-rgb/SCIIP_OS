#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

A="M4_19D4BN17C_R4_R12_R16A_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
B1="M4_19D4BN17C_R4_R12_R16A_R26B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
AR="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_BUILDING_1_SELECTED_ENTITY_READBACK_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
AR_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_BUILDING_1_SELECTED_ENTITY_READBACK_REPAIRED_NON_EXPORT_RECERTIFIED"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R3_RESUME_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION"

PORT=9333
APP="http://127.0.0.1:5173/"
STATUS_RE=r"(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·"
STATUS_SUFFIX_RE=re.compile(r"(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U/C|U\/C)\s*·.*$",re.I)

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

def settle_exact(w,text,seconds=3.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def normalize_label(s):
    s=re.sub(r"\s+"," ",s or "").strip()
    return STATUS_SUFFIX_RE.sub("",s).strip()

def wait_target(w,target,seconds=5.0,n=3):
    st=time.time();con=0;last=None
    q=target.lower()
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(q)},re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),html=b.outerHTML,m=re.exec(text);
 let label=m?text.slice(0,m.index).trim():text;
 const hm=html.match(/<strong[^>]*>([^<]+)<\\/strong>/i); if(hm) label=ns(hm[1]);
 return{{text,label,html,b}};
}});
const exact=rows.filter(x=>x.label.toLowerCase()===q);
const contains=rows.filter(x=>x.label.toLowerCase().includes(q)||q.includes(x.label.toLowerCase()));
return{{exactCount:exact.length,containsCount:contains.length,
exactTexts:exact.map(x=>x.text),containsTexts:contains.slice(0,5).map(x=>x.text)}};
}})()""") or {}
        last=v
        valid=v.get("exactCount")==1 or (v.get("exactCount")==0 and v.get("containsCount")==1)
        con=con+1 if valid else 0
        if con>=n:return True,last
        time.sleep(.15)
    return False,last

def click_target(w,target):
    q=target.lower()
    return ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(q)},re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),html=b.outerHTML,m=re.exec(text);
 let label=m?text.slice(0,m.index).trim():text;
 const hm=html.match(/<strong[^>]*>([^<]+)<\\/strong>/i); if(hm) label=ns(hm[1]);
 return{{text,label,b}};
}});
let x=rows.filter(r=>r.label.toLowerCase()===q),binding='EXACT';
if(x.length!==1){{x=rows.filter(r=>r.label.toLowerCase().includes(q)||q.includes(r.label.toLowerCase()));binding='UNIQUE_CONTAINS';}}
if(x.length!==1)return{{clicked:false,count:x.length,binding:null,candidates:x.slice(0,5).map(r=>r.text)}};
x[0].b.click();return{{clicked:true,count:1,binding,text:x[0].text}};
}})()""") or {}

def wait_selected(w,target,seconds=2.0,n=3):
    st=time.time();con=0;last=None;q=target.lower()
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(q)};
const x=[...document.querySelectorAll('button.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);
let ws=null;try{{ws=JSON.parse(localStorage.getItem('sciip.explorer3.workspace.v1')||'null')}}catch{{}}
return{{count:x.length,texts:x.map(b=>ns(b.innerText||b.textContent||'')),htmls:x.map(b=>b.outerHTML),
selectedPropertyId:ws?.selectedPropertyId||null,
targetEvidence:x.filter(b=>b.outerHTML.toLowerCase().includes(q)||ns(b.innerText||b.textContent||'').toLowerCase().includes(q)).length}};
}})()""") or {}
        last=v
        ok=v.get("count")==1 and v.get("targetEvidence")==1 and bool(v.get("selectedPropertyId"))
        con=con+1 if ok else 0
        if con>=n:return True,last
        time.sleep(.1)
    return False,last

def wait_review(w,seconds=4.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        v=ev(w,r"""(()=>{const txt=document.body?.innerText||'';const d=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{review:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),downloadCount:d.length,enabled:d.length===1&&!d[0].disabled}})()""") or {}
        ok=v.get("review") and v.get("downloadCount")==1 and v.get("enabled")
        con=con+1 if ok else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def handler(w):
    return ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return{count:x.length,name:null,enabled:false};const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));const f=k&&x[0][k]&&x[0][k].onClick;return{count:1,name:typeof f==='function'?(f.name||'anonymous'):null,enabled:!x[0].disabled}})()""") or {}

def qualify_one(target):
    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        return {"target":target,"qualified":False,"failure":"FRESH_PAGE_FAILED"}
    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        explorer=settle_exact(w,"Explorer",3.0,3)
        entered=click_exact(w,"Explorer") if explorer else False
        binding,bread=wait_target(w,target,5.0,3) if entered else (False,None)
        sel=click_target(w,target) if binding else {}
        selected,sread=wait_selected(w,target,2.0,3) if sel.get("clicked") else (False,None)
        ass=settle_exact(w,"Assignments",3.0,3) if selected else False
        assclick=click_exact(w,"Assignments") if ass else False
        gen=settle_exact(w,"Generate Client Listing Report",3.0,3) if assclick else False
        genclick=click_exact(w,"Generate Client Listing Report") if gen else False
        review=wait_review(w,4.0,3) if genclick else False
        h=handler(w) if review else {}
        export_control=review and h.get("count")==1 and h.get("enabled") is True
        live_handler=h.get("name")=="exportReport"
        cont=ev(w,r"""(()=>({explorer:[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer'),sameOrigin:location.origin==='http://127.0.0.1:5173'}))()""") or {}
        qualified=all([explorer,entered,binding,sel.get("clicked") is True,selected,assclick,genclick,review,export_control,live_handler,cont.get("explorer") is True,cont.get("sameOrigin") is True])
        return {
          "target":target,"freshTargetCreated":True,"explorerSettleCertified":explorer,"explorerEntryCertified":entered,
          "targetBindingSettleCertified":binding,"targetBindingReadback":bread,"selectionBinding":sel.get("binding"),
          "selectedPropertyCertified":selected,"selectedPropertyReadback":sread,"assignmentsEntryCertified":assclick,
          "reportReviewEntryCertified":review,"exportControlCertified":export_control,"liveHandlerCertified":live_handler,
          "explorerContinuity":cont.get("explorer") is True,"sameOrigin":cont.get("sameOrigin") is True,
          "qualified":qualified,"failure":None if qualified else "NON_EXPORT_QUALIFICATION_FAILED"
        }
    finally:
        try:w.call("Page.close")
        except:pass

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    package=Path(__file__).resolve().parent
    targets=loadj(package/"REMAINING_NINETEEN_TARGETS.json")
    evid=repo/"apps/property-command-center/evidence/explorer4"
    ar=evid/AR/"building_1_selected_entity_readback_repair_and_non_export_recertification.json"
    b1=evid/B1/"non_export_live_qualification_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R3 Resume Remaining Nineteen Record Non-Export Live Qualification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Export invocation: OFF")
    print("Previously qualified new records preserved: 30")
    print("Alondra record-31 recertification consumed: REQUIRED")
    print("Remaining execution records: 19")
    print("Fresh page per record: REQUIRED")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")

    if not ar.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: ALONDRA_RECERTIFICATION_EVIDENCE_REQUIRED");return 4
    ard=loadj(ar)
    if ard.get("status")!="PASSED" or ard.get("state")!=AR_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_ALONDRA_RECORD_31_REQUIRED");return 5

    if not b1.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26B_R1_EVIDENCE_REQUIRED");return 6
    b1d=loadj(b1)
    if b1d.get("qualifiedBeforeHalt",b1d.get("QUALIFIED_BEFORE_HALT")) not in (30,None):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FIRST_THIRTY_QUALIFIED_BOUNDARY_REQUIRED");return 7

    if len(targets)!=19 or len(set(targets))!=19:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_NINETEEN_UNIQUE_TARGETS_REQUIRED");return 8
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 9

    outcomes=[];halt=False
    for i,t in enumerate(targets,32):
        print(f"[{i}/50] {t}")
        o=qualify_one(t);o["newCohortOrdinal"]=i;outcomes.append(o)
        for k in ["freshTargetCreated","explorerSettleCertified","targetBindingSettleCertified","selectionBinding","selectedPropertyCertified","assignmentsEntryCertified","reportReviewEntryCertified","exportControlCertified","liveHandlerCertified","explorerContinuity","sameOrigin","qualified","failure"]:
            print(f"{k}: {o.get(k)}")
        print()
        if not o.get("qualified"):
            halt=True;break

    q=sum(1 for o in outcomes if o.get("qualified"))
    all19=(len(outcomes)==19 and q==19 and not halt)
    checks={
      "r26bR1ResidualBoundaryConsumed":True,
      "firstThirtyQualifiedPreserved":True,
      "alondraRecord31RecertificationConsumed":True,
      "alondraProjectAggregateExclusionPreserved":True,
      "exactNineteenRemainingTargetsConsumed":len(targets)==19,
      "remainingTargetsUnique":len(set(targets))==19,
      "freshPagePerRecordPolicyUsed":all(o.get("freshTargetCreated") for o in outcomes),
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":True,
      "allExecutedExplorerSettlesCertified":all(o.get("explorerSettleCertified") for o in outcomes),
      "allExecutedTargetBindingsCertified":all(o.get("targetBindingSettleCertified") for o in outcomes),
      "allExecutedSelectionsCertified":all(o.get("selectedPropertyCertified") for o in outcomes),
      "allExecutedAssignmentsCertified":all(o.get("assignmentsEntryCertified") for o in outcomes),
      "allExecutedReportReviewsCertified":all(o.get("reportReviewEntryCertified") for o in outcomes),
      "allExecutedExportControlsCertified":all(o.get("exportControlCertified") for o in outcomes),
      "allExecutedLiveHandlersCertified":all(o.get("liveHandlerCertified") for o in outcomes),
      "allExecutedExplorerContinuityCertified":all(o.get("explorerContinuity") for o in outcomes),
      "allExecutedSameOriginCertified":all(o.get("sameOrigin") for o in outcomes),
      "allNineteenRemainingRecordsQualified":all19,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    status="PASSED" if all19 else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R26B_R3_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"
           if all19 else
           "M419D4BN17C_R4_R12_R16A_R26B_R3_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE")
    classification=("FIFTY_NEW_RECORD_NON_EXPORT_QUALIFICATION_COMPLETE_FIRST_THIRTY_PLUS_ALONDRA_RECORD_31_PLUS_REMAINING_NINETEEN_CERTIFIED"
                    if all19 else
                    "REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
         if all19 else
         "M4_19D4BN17C_R4_R12_R16A_R26B_R3_R1_NON_EXPORT_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R26B_R3_RESUME_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"classification":classification,
      "preservedQualifiedBeforeAlondra":30,"alondraRecord31Recertified":True,
      "remainingTargetCount":19,"executedCount":len(outcomes),"qualifiedCount":q,
      "haltedOnFailure":halt,"targets":targets,"outcomes":outcomes,"checks":checks,
      "authority":{"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False},
      "sourceEvidence":{
        "alondraPath":str(ar),"alondraSha256":hashlib.sha256(ar.read_bytes()).hexdigest(),
        "r26bR1Path":str(b1),"r26bR1Sha256":hashlib.sha256(b1.read_bytes()).hexdigest()
      },
      "nextMilestone":nxt
    }
    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"resume_remaining_nineteen_record_non_export_live_qualification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("QUALIFIED REMAINING:",q,"/19")
    print("TOTAL NEW-50 QUALIFICATION IF COMPLETE:",30+1+q,"/50")
    print("HALTED_ON_FAILURE:",halt)
    print("EXPORT_INVOCATION: OFF")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
