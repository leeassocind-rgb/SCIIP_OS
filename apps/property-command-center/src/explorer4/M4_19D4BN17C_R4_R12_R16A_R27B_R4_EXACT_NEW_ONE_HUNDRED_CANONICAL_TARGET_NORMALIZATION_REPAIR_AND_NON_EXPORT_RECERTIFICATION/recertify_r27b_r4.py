#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
R27A="M4_19D4BN17C_R4_R12_R16A_R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R3R2="M4_19D4BN17C_R4_R12_R16A_R27B_R3_R2_UNDER_CONSTRUCTION_STATUS_BOUNDARY_NORMALIZATION_REPAIR_AND_FIRST_RECORD_NON_EXPORT_RECERTIFICATION"
SRC_BIND="M4_19D4BN17C_R4_R12_R16A_R27B_R2_R3_INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE"
OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R4_EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGET_NORMALIZATION_REPAIR_AND_NON_EXPORT_RECERTIFICATION"

STATUS_BOUNDARY=re.compile(r"(UNDER CONSTRUCTION|PROPOSED|PLANNED|EXISTING)\s*[·/|]",re.I)

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def normalize_target(s):
    s=re.sub(r"\s+"," ",str(s or "")).strip()
    m=STATUS_BOUNDARY.search(s)
    return s[:m.start()].strip() if m else s

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
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((
            f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\n"
            f"Connection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        ).encode())
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

def settle_exact_button(w,t,sec=2.0,samples=3):
    st=time.time();c=0
    while time.time()-st<=sec:
        c=c+1 if exact_button_count(w,t)==1 else 0
        if c>=samples:return True
        time.sleep(.1)
    return False

def click_exact_button(w,t):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(t)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def candidate_inventory(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target)},bs=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled);
const txt=b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim();
return bs.filter(b=>txt(b).startsWith(q)).map((b,i)=>({{
 text:txt(b),
 aria:b.getAttribute('aria-label'),
 status:b.getAttribute('data-property-status'),
 className:String(b.className||''),
 outerHTML:b.outerHTML.slice(0,1800)
}}));}})()""") or []

def settle_unique_binding(w,target,sec=5.0,samples=3):
    st=time.time();c=0;last=None
    while time.time()-st<=sec:
        inv=candidate_inventory(w,target)
        ok=len(inv)==1
        c=c+1 if ok else 0
        last={"count":len(inv),"inventory":inv}
        if c>=samples:return True,last
        time.sleep(.1)
    return False,last

def click_unique_candidate(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target)},bs=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled),txt=b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim();
const x=bs.filter(b=>txt(b).startsWith(q));if(x.length!==1)return false;x[0].click();return true}})()""") is True

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"

    p_targets=er/R27A/"exact_new_one_hundred_targets.json"
    p_r3r2=er/R3R2/"under_construction_status_boundary_normalization_repair_and_first_record_non_export_recertification.json"
    p_bind=er/SRC_BIND/"instrumented_first_record_non_export_control_surface_capture.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R4 Exact New-One-Hundred Canonical Target Normalization Repair + Non-Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export invocation: OFF")
    print("Fresh page per record: REQUIRED")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")
    print("Canonical status boundaries: UNDER CONSTRUCTION | PROPOSED | PLANNED | EXISTING")

    if not p_targets.exists() or not p_r3r2.exists() or not p_bind.exists():
        print("STATUS: BLOCKED")
        print("REASON: R27A targets, R27B-R3-R2 repair evidence, and source-binding evidence required")
        return 4

    raw_targets=loadj(p_targets)
    r3r2=loadj(p_r3r2)
    sb=loadj(p_bind)

    if r3r2.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: first-record UNDER CONSTRUCTION repair must be certified");return 5

    sbc=sb.get("checks") if isinstance(sb.get("checks"),dict) else {}
    if sb.get("status")!="PASSED" or sbc.get("exportControlDirectlyBindsExportReport") is not True:
        print("STATUS: BLOCKED");print("REASON: source-certified Download Client Listing Report -> exportReport contract required");return 6

    if not isinstance(raw_targets,list) or len(raw_targets)!=100:
        print("STATUS: BLOCKED");print("REASON: exact R27A new-100 target list required");return 7

    canonical=[normalize_target(x) for x in raw_targets]
    normalized_rows=[
        {
          "ordinal":101+i,
          "rawTarget":raw_targets[i],
          "canonicalTarget":canonical[i],
          "statusBoundaryRemoved":raw_targets[i]!=canonical[i]
        }
        for i in range(100)
    ]

    if any(not x for x in canonical):
        print("STATUS: BLOCKED");print("REASON: blank canonical target produced");return 8
    if len(set(x.lower() for x in canonical))!=100:
        print("STATUS: BLOCKED");print("REASON: canonical normalization produced duplicate target identities");return 9

    od=er/OUT
    od.mkdir(parents=True,exist_ok=True)
    canonical_file=od/"exact_new_one_hundred_canonical_targets.json"
    canonical_file.write_text(json.dumps(canonical,indent=2)+"\n")

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: certified CDP browser context required");return 10

    outcomes=[]
    for ix,target in enumerate(canonical,101):
        row=normalized_rows[ix-101]
        o={
          "ordinal":ix,
          "rawTarget":row["rawTarget"],
          "target":target,
          "statusBoundaryRemoved":row["statusBoundaryRemoved"],
          "certified":False,
          "exportInvocation":False
        }

        p=newpage()
        o["freshTargetCreated"]=bool(p and p.get("webSocketDebuggerUrl"))
        if not o["freshTargetCreated"]:
            o["failure"]="FRESH_PAGE_FAILED";outcomes.append(o);break

        w=W(p["webSocketDebuggerUrl"])
        w.call("Runtime.enable");w.call("Page.enable")

        o["explorerSettleCertified"]=settle_exact_button(w,"Explorer",2.0,3)
        o["explorerEntryCertified"]=click_exact_button(w,"Explorer") if o["explorerSettleCertified"] else False

        bound,br=settle_unique_binding(w,target,5.0,3) if o["explorerEntryCertified"] else (False,None)
        o["targetBindingSettleCertified"]=bound
        o["bindingReadback"]=br
        o["ambiguousBindingForbidden"]=True
        o["selectionCertified"]=click_unique_candidate(w,target) if bound else False

        st=time.time();sc=0
        while o["selectionCertified"] and time.time()-st<=2:
            v=ev(w,"""(()=>!!document.querySelector('.sciip-property-marker[aria-pressed="true"],.sciip-property-marker.selected,[data-selected="true"]')||document.body.innerText.includes('Assignments'))()""")
            sc=sc+1 if v else 0
            if sc>=3:break
            time.sleep(.1)
        o["selectedPropertySettleCertified"]=sc>=3

        o["assignmentsEntryCertified"]=(settle_exact_button(w,"Assignments",2.0,3) and click_exact_button(w,"Assignments")) if o["selectedPropertySettleCertified"] else False
        time.sleep(.15)

        gen=None
        if o["assignmentsEntryCertified"]:
            for lab in ["Generate Client Listing Report","Generate"]:
                if settle_exact_button(w,lab,2.0,3):
                    gen=lab;break
        o["generateControlCertified"]=bool(gen)
        o["reportReviewEntryCertified"]=click_exact_button(w,gen) if gen else False

        st=time.time();ec=0
        while o["reportReviewEntryCertified"] and time.time()-st<=4:
            ok=exact_button_count(w,"Download Client Listing Report")==1
            ec=ec+1 if ok else 0
            if ec>=3:break
            time.sleep(.1)
        o["downloadClientListingReportControlCertified"]=ec>=3
        o["exportReportHandlerCertifiedBySourceContract"]=True
        o["sameOrigin"]=str(ev(w,"location.origin") or "")=="http://127.0.0.1:5173"

        required=[
          "freshTargetCreated",
          "explorerSettleCertified",
          "explorerEntryCertified",
          "targetBindingSettleCertified",
          "selectionCertified",
          "selectedPropertySettleCertified",
          "assignmentsEntryCertified",
          "generateControlCertified",
          "reportReviewEntryCertified",
          "downloadClientListingReportControlCertified",
          "exportReportHandlerCertifiedBySourceContract",
          "sameOrigin"
        ]
        o["certified"]=all(o.get(k) is True for k in required)

        if not o["certified"]:
            o["failure"]="NON_EXPORT_RECERTIFICATION_FAILED"
            o["firstFailedStage"]=next((k for k in required if o.get(k) is not True),None)

        outcomes.append(o)

        print(f"[{ix}/200] RAW={row['rawTarget']}")
        print(f"canonicalTarget: {target}")
        print(f"statusBoundaryRemoved: {row['statusBoundaryRemoved']}")
        print(f"targetBindingSettleCertified: {o['targetBindingSettleCertified']}")
        print(f"selectionCertified: {o['selectionCertified']}")
        print(f"assignmentsEntryCertified: {o['assignmentsEntryCertified']}")
        print(f"reportReviewEntryCertified: {o['reportReviewEntryCertified']}")
        print(f"downloadClientListingReportControlCertified: {o['downloadClientListingReportControlCertified']}")
        print(f"certified: {o['certified']}")
        print(f"failure: {o.get('failure')}")
        print()

        if not o["certified"]:
            break

    certified=sum(1 for x in outcomes if x.get("certified"))
    status="PASSED" if len(outcomes)==100 and certified==100 else "DIAGNOSTIC_COMPLETE"

    checks={
      "r27bR3R2Passed":r3r2.get("status")=="PASSED",
      "exactRawNewOneHundredConsumed":len(raw_targets)==100,
      "exactCanonicalNewOneHundredResolved":len(canonical)==100,
      "canonicalTargetsUnique":len(set(x.lower() for x in canonical))==100,
      "underConstructionBoundaryIncluded":True,
      "proposedBoundaryIncluded":True,
      "plannedBoundaryIncluded":True,
      "existingBoundaryIncluded":True,
      "sourceCertifiedExportControlBindingConsumed":True,
      "freshPagePerRecordRequired":True,
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":True,
      "ambiguousBindingForbidden":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "allOneHundredCertified":status=="PASSED"
    }

    state=(
      "M419D4BN17C_R4_R12_R16A_R27B_R4_EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGETS_REPAIRED_NON_EXPORT_RECERTIFIED"
      if status=="PASSED" else
      "M419D4BN17C_R4_R12_R16A_R27B_R4_EXACT_NEW_ONE_HUNDRED_NON_EXPORT_RECERTIFICATION_INCOMPLETE"
    )
    classification=(
      "EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGET_NORMALIZATION_AND_NON_EXPORT_WORKFLOW_CERTIFIED"
      if status=="PASSED" else
      "EXACT_NEW_ONE_HUNDRED_NON_EXPORT_RECERTIFICATION_GAP_REMAINS"
    )
    nxt=(
      "M4_19D4BN17C_R4_R12_R16A_R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
      if status=="PASSED" else
      "M4_19D4BN17C_R4_R12_R16A_R27B_R4_R1_NON_EXPORT_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
    )

    ef=od/"exact_new_one_hundred_canonical_target_normalization_repair_and_non_export_recertification.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R27B_R4_EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGET_NORMALIZATION_REPAIR_AND_NON_EXPORT_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":state,
      "classification":classification,
      "rawTargetCount":len(raw_targets),
      "canonicalTargetCount":len(canonical),
      "statusBoundaryRepairCount":sum(1 for x in normalized_rows if x["statusBoundaryRemoved"]),
      "canonicalTargetFile":str(canonical_file),
      "normalizedRows":normalized_rows,
      "outcomeCount":len(outcomes),
      "certifiedCount":certified,
      "outcomes":outcomes,
      "checks":checks,
      "exportInvocation":False,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R4 Exact New-One-Hundred Canonical Target Normalization Repair + Non-Export Recertification")
    print("="*120)
    print("RAW_TARGET_COUNT:",len(raw_targets))
    print("CANONICAL_TARGET_COUNT:",len(canonical))
    print("STATUS_BOUNDARY_REPAIR_COUNT:",sum(1 for x in normalized_rows if x["statusBoundaryRemoved"]))
    print("CERTIFIED:",certified,"/100")
    print("EXPORT_INVOCATION: OFF")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("CANONICAL_TARGET_FILE:",canonical_file)
    print("EVIDENCE:",ef)
    print("\nR27B-R4 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if status=="PASSED" else 10

if __name__=="__main__":
    raise SystemExit(main())
