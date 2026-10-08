#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
R27A="M4_19D4BN17C_R4_R12_R16A_R27A_EXACT_TWO_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R3R1="M4_19D4BN17C_R4_R12_R16A_R27B_R3_R1_NON_EXPORT_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
SRC_BIND="M4_19D4BN17C_R4_R12_R16A_R27B_R2_R3_INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE"
OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R3_R2_UNDER_CONSTRUCTION_STATUS_BOUNDARY_NORMALIZATION_REPAIR_AND_FIRST_RECORD_NON_EXPORT_RECERTIFICATION"

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
 text:txt(b),aria:b.getAttribute('aria-label'),status:b.getAttribute('data-property-status'),
 className:String(b.className||''),outerHTML:b.outerHTML.slice(0,1500)
}}));}})()""") or []

def bind_settle(w,target,sec=5.0,samples=3):
    st=time.time();c=0;last=None
    while time.time()-st<=sec:
        inv=candidate_inventory(w,target)
        # Canonical address target may bind only if exactly one normalized-prefix candidate exists.
        ok=(len(inv)==1)
        c=c+1 if ok else 0
        last={"count":len(inv),"inventory":inv}
        if c>=samples:return True,last
        time.sleep(.1)
    return False,last

def click_unique_candidate(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target)},bs=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled),txt=b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim();const x=bs.filter(b=>txt(b).startsWith(q));if(x.length!==1)return false;x[0].click();return true}})()""") is True

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p27a=er/R27A/"exact_new_one_hundred_targets.json"
    pdiag=er/R3R1/"non_export_recertification_residual_causal_diagnosis.json"
    pbind=er/SRC_BIND/"instrumented_first_record_non_export_control_surface_capture.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R3-R2 Under-Construction Status-Boundary Normalization Repair + First-Record Non-Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Export invocation: OFF")
    print("Target normalization repair: UNDER CONSTRUCTION recognized as status boundary")

    if not p27a.exists() or not pdiag.exists() or not pbind.exists():
        print("STATUS: BLOCKED");print("REASON: R27A targets, R27B-R3-R1 diagnosis, and R27B-R2-R3 source-binding evidence required");return 4

    targets=loadj(p27a);diag=loadj(pdiag);bind=loadj(pbind)
    if diag.get("status")!="PASSED" or diag.get("executionSummary",{}).get("firstFailedStage")!="targetBindingSettleCertified":
        print("STATUS: BLOCKED");print("REASON: certified record-101 target-binding diagnosis required");return 5

    raw=targets[0]
    clean=normalize_target(raw)
    if raw==clean or clean!="701 E Ball Rd":
        print("STATUS: BLOCKED");print("REASON: expected UNDER CONSTRUCTION boundary repair did not resolve 701 E Ball Rd");return 6

    bc=bind.get("checks") if isinstance(bind.get("checks"),dict) else {}
    if bind.get("status")!="PASSED" or bc.get("exportControlDirectlyBindsExportReport") is not True:
        print("STATUS: BLOCKED");print("REASON: certified source-level export control binding required");return 7

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: CDP browser context required");return 8

    p=newpage()
    if not p or not p.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("REASON: fresh page creation failed");return 9

    w=W(p["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")

    explorer=settle_exact_button(w,"Explorer",2.0)
    entered=click_exact_button(w,"Explorer") if explorer else False
    bound,readback=bind_settle(w,clean,5.0,3) if entered else (False,None)
    selected=click_unique_candidate(w,clean) if bound else False

    st=time.time();sc=0
    while selected and time.time()-st<=2:
        v=ev(w,"""(()=>!!document.querySelector('.sciip-property-marker[aria-pressed="true"],.sciip-property-marker.selected,[data-selected="true"]')||document.body.innerText.includes('Assignments'))()""")
        sc=sc+1 if v else 0
        if sc>=3:break
        time.sleep(.1)
    selected_settle=sc>=3

    assignments=settle_exact_button(w,"Assignments",2.0) and click_exact_button(w,"Assignments") if selected_settle else False
    time.sleep(.15)

    gen=None
    if assignments:
        for lab in ["Generate Client Listing Report","Generate"]:
            if settle_exact_button(w,lab,2.0):
                gen=lab;break
    generated=click_exact_button(w,gen) if gen else False

    st=time.time();ec=0
    while generated and time.time()-st<=4:
        ok=exact_button_count(w,"Download Client Listing Report")==1
        ec=ec+1 if ok else 0
        if ec>=3:break
        time.sleep(.1)
    export_control=ec>=3
    same_origin=str(ev(w,"location.origin") or "")=="http://127.0.0.1:5173"

    passed=all([explorer,entered,bound,selected,selected_settle,assignments,bool(gen),generated,export_control,same_origin])

    checks={
      "r27bR3R1Passed":True,
      "firstFailureWasTargetBindingSettle":True,
      "rawTargetContainsUnderConstructionSuffix":"UNDER CONSTRUCTION" in raw,
      "underConstructionBoundaryRecognized":True,
      "normalizedTargetEquals701EBallRd":clean=="701 E Ball Rd",
      "rawTargetNotUsedForCanonicalBinding":True,
      "freshPageCreated":True,
      "explorerSettleCertified":explorer,
      "explorerEntryCertified":entered,
      "targetBindingSettleCertified":bound,
      "uniqueNormalizedCandidateRequired":True,
      "ambiguousNormalizedCandidateForbidden":True,
      "selectionCertified":selected,
      "selectedPropertySettleCertified":selected_settle,
      "assignmentsEntryCertified":assignments,
      "generateControlCertified":bool(gen),
      "reportReviewEntryCertified":generated,
      "downloadClientListingReportControlCertified":export_control,
      "exportReportHandlerCertifiedBySourceContract":True,
      "sameOriginCertified":same_origin,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R27B_R3_R2_UNDER_CONSTRUCTION_STATUS_BOUNDARY_NORMALIZATION_REPAIRED_FIRST_RECORD_NON_EXPORT_RECERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R27B_R3_R2_FIRST_RECORD_NON_EXPORT_RECERTIFICATION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R27B_R4_EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGET_NORMALIZATION_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
         if passed else
         "M4_19D4BN17C_R4_R12_R16A_R27B_R3_R2_R1_FIRST_RECORD_NORMALIZED_BINDING_RESIDUAL_CAUSAL_DIAGNOSIS")

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"under_construction_status_boundary_normalization_repair_and_first_record_non_export_recertification.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R27B_R3_R2_UNDER_CONSTRUCTION_STATUS_BOUNDARY_NORMALIZATION_REPAIR_AND_FIRST_RECORD_NON_EXPORT_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,
      "rawTarget":raw,"normalizedTarget":clean,
      "bindingReadback":readback,
      "checks":checks,"exportInvocation":False,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("RAW_TARGET:",raw)
    print("NORMALIZED_TARGET:",clean)
    print("UNDER_CONSTRUCTION_BOUNDARY_REMOVED:",raw!=clean)
    print("TARGET_BINDING_SETTLE_CERTIFIED:",bound)
    print("SELECTION_CERTIFIED:",selected)
    print("SELECTED_PROPERTY_SETTLE_CERTIFIED:",selected_settle)
    print("ASSIGNMENTS_ENTRY_CERTIFIED:",assignments)
    print("REPORT_REVIEW_ENTRY_CERTIFIED:",generated)
    print("DOWNLOAD_CLIENT_LISTING_REPORT_CONTROL_CERTIFIED:",export_control)
    print("EXPORTREPORT_HANDLER_CERTIFIED_BY_SOURCE_CONTRACT: True")
    print("SAME_ORIGIN:",same_origin)
    print("EXPORT_INVOCATION: OFF")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR27B-R3-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if passed else 10

if __name__=="__main__":
    raise SystemExit(main())
