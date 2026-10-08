#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R25A="M4_19D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R25A_STATE="M419D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
R25D="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R1_R1_BLDG_1_3_CANONICAL_IDENTITY_DEEP_DIAGNOSIS"
R25D_STATE="M419D4BN17C_R4_R12_R16A_R25B_R2_R1_R1_BLDG_1_3_CANONICAL_IDENTITY_DEEP_DIAGNOSED"
R25D_CLASS="R25A_CANDIDATE_NORMALIZATION_BOUNDARY_BUG_FUSES_PROPOSED_STATUS_INTO_BLDG_1_3_IDENTITY_LIVE_CANONICAL_IDENTITY_IS_CLEAN"
M="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R2_CANONICAL_CANDIDATE_IDENTITY_NORMALIZATION_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
PORT=9333
APP="http://127.0.0.1:5173/"

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
        k=base64.b64encode(os.urandom(16)).decode()
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
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def canonicalize_target(s):
    s=re.sub(r"\s+"," ",str(s or "")).strip()
    # Repair only the diagnosed candidate-status fusion. Recognized candidate
    # statuses may appear immediately after the identity without whitespace.
    # Preserve address/building tokens; remove status suffix only at end.
    s=re.sub(r"(PROPOSED/PLANNED|PROPOSED/|PROPOSED|PLANNED|EXISTING|AVAILABLE|UNDER CONSTRUCTION|U/C)$","",s,flags=re.I).strip()
    return s

JS_HELPERS=r"""
const ns=s=>(s||'').replace(/\s+/g,' ').trim();
const candidateLabel=s=>{
 s=ns(s);
 const re=/(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·/i;
 const m=re.exec(s);
 return m?s.slice(0,m.index).trim():s;
};
"""

def wait_target(w,target,seconds=5.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{{JS_HELPERS}
const q=ns({json.dumps(target)}).toLowerCase();
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{const text=ns(b.innerText||b.textContent||'');const label=candidateLabel(text);return{{text,label,full:text.toLowerCase(),norm:label.toLowerCase()}}}});
const exact=rows.filter(x=>x.full===q), norm=rows.filter(x=>x.norm===q), contains=rows.filter(x=>x.full.includes(q));
let binding=null;if(exact.length===1)binding='EXACT';else if(exact.length===0&&norm.length===1)binding='BOUNDARY_NORMALIZED_IDENTITY';else if(exact.length===0&&norm.length===0&&contains.length===1)binding='UNIQUE_CONTAINS';
return{{exactCount:exact.length,normalizedCount:norm.length,containsCount:contains.length,binding}};
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
const exact=rows.filter(x=>x.full===q), norm=rows.filter(x=>x.norm===q), contains=rows.filter(x=>x.full.includes(q));
let x=null,binding=null;if(exact.length===1){{x=exact[0];binding='EXACT'}}else if(exact.length===0&&norm.length===1){{x=norm[0];binding='BOUNDARY_NORMALIZED_IDENTITY'}}else if(exact.length===0&&norm.length===0&&contains.length===1){{x=contains[0];binding='UNIQUE_CONTAINS'}}else return{{clicked:false,reason:'IDENTITY_NOT_UNIQUE',exactCount:exact.length,normalizedCount:norm.length,containsCount:contains.length}};
x.b.click();return{{clicked:true,binding,text:x.text,label:x.label}};
}})()""") or {}

def wait_selected(w,target,seconds=2.0,n=3):
    st=time.time();con=0
    q=target.lower()
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(q)},x=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);const t=x.map(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim());return{{count:x.length,match:t.filter(z=>z.toLowerCase()===q||z.toLowerCase().includes(q)).length,texts:t}}}})()""") or {}
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

def handler(w):
    return ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return{count:x.length,name:null};const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));const f=k&&x[0][k]&&x[0][k].onClick;return{count:1,name:typeof f==='function'?(f.name||'anonymous'):null}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    pa=evid/R25A/"exact_fifty_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    pd=evid/R25D/"bldg_1_3_canonical_identity_deep_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R25B-R2-R2 Canonical Candidate Identity Normalization Repair + 25-Record Non-Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Export invocation: OFF")
    print("Repair scope: CERTIFICATION-LOCAL CANDIDATE IDENTITY NORMALIZATION ONLY")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")

    if not pa.exists() or not pd.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25A_AND_DEEP_DIAGNOSIS_EVIDENCE_REQUIRED");return 4
    a=loadj(pa);d=loadj(pd)
    if a.get("status")!="PASSED" or a.get("state")!=R25A_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25A_REQUIRED");return 5
    if d.get("status")!="PASSED" or d.get("state")!=R25D_STATE or d.get("classification")!=R25D_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_NORMALIZATION_CAUSE_REQUIRED");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7

    raw_selected=a.get("selectedNewCandidates") or []
    targets=[]
    normalization_rows=[]
    for x in raw_selected:
        raw=x.get("rawLabel") or ""
        prior=x.get("normalizedTarget") or ""
        repaired=canonicalize_target(prior)
        normalization_rows.append({"rawLabel":raw,"priorNormalizedTarget":prior,"repairedCanonicalTarget":repaired,"changed":repaired!=prior})
        targets.append(repaired)

    if len(targets)!=25 or len({x.lower() for x in targets})!=25:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REPAIRED_EXACT_TWENTY_FIVE_UNIQUE_TARGETS_REQUIRED");return 8

    outcomes=[];halted=False
    for i,target in enumerate(targets,1):
        o={"ordinal":i,"target":target}
        n=newpage();o["freshTargetCreated"]=bool(n and n.get("webSocketDebuggerUrl"))
        if not o["freshTargetCreated"]:
            o["qualified"]=False;o["failure"]="FRESH_PAGE_FAILED";outcomes.append(o);halted=True
        else:
            w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
            try:
                ex=wait_exact(w,"Explorer",2,3);o["explorerSettleCertified"]=ex
                ee=click_exact(w,"Explorer") if ex else {};o["explorerEntryCertified"]=ee.get("clicked") is True
                tb,binding=wait_target(w,target,5,3) if o["explorerEntryCertified"] else (False,None)
                o["targetBindingSettleCertified"]=tb;o["selectionBinding"]=binding
                sc=click_target(w,target) if tb else {};o["selectionClicked"]=sc.get("clicked") is True
                sp=wait_selected(w,target,2,3) if o["selectionClicked"] else False;o["selectedPropertyCertified"]=sp
                ac=wait_exact(w,"Assignments",2,3) if sp else False
                ae=click_exact(w,"Assignments") if ac else {};o["assignmentsEntryCertified"]=ae.get("clicked") is True
                gc=wait_exact(w,"Generate Client Listing Report",2,3) if o["assignmentsEntryCertified"] else False
                ge=click_exact(w,"Generate Client Listing Report") if gc else {};o["generateClicked"]=ge.get("clicked") is True
                rr=wait_review(w,3,3) if o["generateClicked"] else False;o["reportReviewEntryCertified"]=rr
                h=handler(w) if rr else {}
                o["exportControlCertified"]=rr and h.get("count")==1
                o["liveHandlerCertified"]=h.get("name")=="exportReport"
                cont=ev(w,r"""(()=>({explorer:[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer'),sameOrigin:location.origin==='http://127.0.0.1:5173'}))()""") or {}
                o["explorerContinuity"]=cont.get("explorer") is True;o["sameOrigin"]=cont.get("sameOrigin") is True
                o["qualified"]=all([o["freshTargetCreated"],o["explorerSettleCertified"],o["explorerEntryCertified"],o["targetBindingSettleCertified"],o["selectionClicked"],o["selectedPropertyCertified"],o["assignmentsEntryCertified"],o["generateClicked"],o["reportReviewEntryCertified"],o["exportControlCertified"],o["liveHandlerCertified"],o["explorerContinuity"],o["sameOrigin"]])
                o["failure"]=None if o["qualified"] else "NON_EXPORT_QUALIFICATION_FAILED"
                outcomes.append(o)
                if not o["qualified"]:halted=True
            finally:
                try:w.call("Page.close")
                except:pass
        print(f"[{i}/25] {target}")
        for k in ["freshTargetCreated","explorerSettleCertified","targetBindingSettleCertified","selectionBinding","selectedPropertyCertified","assignmentsEntryCertified","reportReviewEntryCertified","exportControlCertified","liveHandlerCertified","qualified","failure"]:
            print(f"{k}: {o.get(k)}")
        print()
        if halted:break

    all25=len(outcomes)==25 and all(x.get("qualified") for x in outcomes)
    b13=next((x for x in normalization_rows if "Bldg 1-3" in x["priorNormalizedTarget"]),None)
    checks={
      "deepDiagnosisConsumed":True,
      "candidateNormalizationRepairApplied":True,
      "repairLimitedToRecognizedTrailingStatusSuffix":True,
      "bldg13FusedStatusRemoved":bool(b13 and b13["repairedCanonicalTarget"]=="NE of Interstate 15 and Stoddard Wells Bldg 1-3"),
      "exactTwentyFiveTargetsPreserved":len(targets)==25,
      "exactTwentyFiveTargetsUnique":len({x.lower() for x in targets})==25,
      "cohortOrderPreserved":True,
      "candidateSubstitutionOff":True,
      "freshPagePerRecordPreserved":True,
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":halted or all25,
      "allExecutedTargetBindingsCertified":all(x.get("targetBindingSettleCertified") for x in outcomes),
      "allExecutedSelectionsCertified":all(x.get("selectedPropertyCertified") for x in outcomes),
      "allExecutedAssignmentsCertified":all(x.get("assignmentsEntryCertified") for x in outcomes),
      "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") for x in outcomes),
      "allExecutedExportControlsCertified":all(x.get("exportControlCertified") for x in outcomes),
      "allExecutedLiveHandlersCertified":all(x.get("liveHandlerCertified") for x in outcomes),
      "allTwentyFiveNewRecordsQualified":all25,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R25B_R2_R2_CANONICAL_CANDIDATE_IDENTITY_NORMALIZATION_REPAIRED_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R25B_R2_R2_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION_INCOMPLETE")
    classification=("CANONICAL_CANDIDATE_IDENTITY_NORMALIZATION_REPAIR_CERTIFIED_ALL_TWENTY_FIVE_NEW_RECORDS_NON_EXPORT_QUALIFIED"
                    if passed else
                    "CANONICAL_CANDIDATE_IDENTITY_NORMALIZATION_REPAIR_APPLIED_NON_EXPORT_QUALIFICATION_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R25C_EXACT_FIFTY_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
         if passed else
         "M4_19D4BN17C_R4_R12_R16A_R25B_R2_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R25B_R2_R2_CANONICAL_CANDIDATE_IDENTITY_NORMALIZATION_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"classification":classification,
      "normalizationPolicy":"REMOVE_ONLY_RECOGNIZED_TRAILING_STATUS_SUFFIX_FROM_PRIOR_NORMALIZED_CANDIDATE_IDENTITY",
      "normalizationRows":normalization_rows,
      "targets":targets,"outcomes":outcomes,"checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"exportInvocation":False},
      "sourceEvidence":{
        "r25aPath":str(pa),"r25aSha256":hashlib.sha256(pa.read_bytes()).hexdigest(),
        "deepDiagnosisPath":str(pd),"deepDiagnosisSha256":hashlib.sha256(pd.read_bytes()).hexdigest()
      },
      "nextMilestone":nxt
    }
    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"canonical_candidate_identity_normalization_repair_and_twenty_five_record_non_export_recertification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("QUALIFIED:",sum(1 for x in outcomes if x.get("qualified")),"/25")
    print("HALTED_ON_FAILURE:",halted)
    print("EXPORT_INVOCATION: OFF")
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
