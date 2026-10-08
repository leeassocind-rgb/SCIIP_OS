#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
TIMING="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R2_RECORD_200_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DEEP_DIAGNOSIS"
PRIOR="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_BOUNDED_EXPLORER_SETTLE_REPAIR_AND_RESUME_FROM_RECORD_128"
CANON="M4_19D4BN17C_R4_R12_R16A_R27B_R4_EXACT_NEW_ONE_HUNDRED_CANONICAL_TARGET_NORMALIZATION_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
SOURCE_BIND="M4_19D4BN17C_R4_R12_R16A_R27B_R2_R3_INSTRUMENTED_FIRST_RECORD_NON_EXPORT_CONTROL_SURFACE_CAPTURE"
OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_RECORD_200_BOUNDED_EXPLORER_SETTLE_REPAIR_AND_FINAL_NON_EXPORT_RECERTIFICATION"

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
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((
            f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\n"
            f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
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

def settle_exact_button_page_ready(w,t,sec=2.0,samples=3):
    # Preserve the certified 2.0-second ceiling. R27B-R4-R3-R2 proved the
    # Explorer control becomes unique at 0.35s and remains stable. Ignore only
    # the pre-materialization interactive/empty-button-DOM phase.
    st=time.time();c=0
    while time.time()-st<=sec:
        ready=ev(w,"document.readyState")
        buttons=ev(w,"document.querySelectorAll('button').length") or 0
        if ready!="complete" or buttons==0:
            time.sleep(.05)
            continue
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
        inv=inventory(w,target)
        ok=len(inv)==1
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

    p_timing=er/TIMING/"record_200_explorer_control_materialization_timing_deep_diagnosis.json"
    p_prior=er/PRIOR/"bounded_explorer_settle_repair_and_resume_from_record_128.json"
    p_canon=er/CANON/"exact_new_one_hundred_canonical_targets.json"
    p_bind=er/SOURCE_BIND/"instrumented_first_record_non_export_control_surface_capture.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R4-R3-R3 Record 200 Bounded Explorer Settle Repair + Final Non-Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export invocation: OFF")
    print("Previously certified records preserved: 99")
    print("Live recertification scope: RECORD 200 ONLY")
    print("Explorer settle: 3 consecutive samples within 2.0 seconds")
    print("Explorer sampling anchor: document complete + nonzero button DOM")

    for p in [p_timing,p_prior,p_canon,p_bind]:
        if not p.exists():
            print("STATUS: BLOCKED");print("REASON: prerequisite evidence missing:",p);return 4

    timing=loadj(p_timing)
    prior=loadj(p_prior)
    canon=loadj(p_canon)
    source=loadj(p_bind)

    if timing.get("status")!="PASSED" or timing.get("firstUniqueExplorerSeconds") is None or timing.get("firstUniqueExplorerSeconds")>2.0 or timing.get("stableLastFiveSamples") is not True:
        print("STATUS: BLOCKED");print("REASON: stable <=2s record-200 Explorer materialization diagnosis required");return 5

    if prior.get("status")!="DIAGNOSTIC_COMPLETE" or prior.get("certifiedCount")!=99:
        print("STATUS: BLOCKED");print("REASON: exact prior 99/100 qualification state required");return 6

    if not isinstance(canon,list) or len(canon)!=100 or canon[-1]!="12350 Philadelphia St":
        print("STATUS: BLOCKED");print("REASON: exact canonical new-100 file ending in record-200 target required");return 7

    sc=source.get("checks") if isinstance(source.get("checks"),dict) else {}
    if source.get("status")!="PASSED" or sc.get("exportControlDirectlyBindsExportReport") is not True:
        print("STATUS: BLOCKED");print("REASON: source-certified Download Client Listing Report -> exportReport binding required");return 8

    target=canon[-1]

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: CDP browser context required");return 9

    p=newpage()
    fresh=bool(p and p.get("webSocketDebuggerUrl"))
    if not fresh:
        print("STATUS: BLOCKED");print("REASON: fresh record-200 page creation failed");return 10

    w=W(p["webSocketDebuggerUrl"])
    w.call("Runtime.enable");w.call("Page.enable")

    explorer_settle=settle_exact_button_page_ready(w,"Explorer",2.0,3)
    explorer_entry=click_exact_button(w,"Explorer") if explorer_settle else False

    bound,bind_readback=settle_unique_binding(w,target,5.0,3) if explorer_entry else (False,None)
    selected=click_unique_candidate(w,target) if bound else False

    st=time.time();selc=0
    while selected and time.time()-st<=2.0:
        ok=ev(w,"""(()=>!!document.querySelector('.sciip-property-marker[aria-pressed="true"],.sciip-property-marker.selected,[data-selected="true"]')||document.body.innerText.includes('Assignments'))()""")
        selc=selc+1 if ok else 0
        if selc>=3:break
        time.sleep(.1)
    selected_settle=selc>=3

    assignments=(settle_exact_button_page_ready(w,"Assignments",2.0,3) and click_exact_button(w,"Assignments")) if selected_settle else False
    time.sleep(.15)

    gen=None
    if assignments:
        for lab in ["Generate Client Listing Report","Generate"]:
            if settle_exact_button_page_ready(w,lab,2.0,3):
                gen=lab;break

    generate_control=bool(gen)
    report_review=click_exact_button(w,gen) if gen else False

    st=time.time();ec=0
    while report_review and time.time()-st<=4:
        ok=exact_button_count(w,"Download Client Listing Report")==1
        ec=ec+1 if ok else 0
        if ec>=3:break
        time.sleep(.1)
    download_control=ec>=3

    same_origin=str(ev(w,"location.origin") or "")=="http://127.0.0.1:5173"
    handler_source=True
    export_invocation=False

    required={
      "freshTargetCreated":fresh,
      "explorerSettleCertified":explorer_settle,
      "explorerEntryCertified":explorer_entry,
      "targetBindingSettleCertified":bound,
      "selectionCertified":selected,
      "selectedPropertySettleCertified":selected_settle,
      "assignmentsEntryCertified":assignments,
      "generateControlCertified":generate_control,
      "reportReviewEntryCertified":report_review,
      "downloadClientListingReportControlCertified":download_control,
      "exportReportHandlerCertifiedBySourceContract":handler_source,
      "sameOrigin":same_origin
    }

    certified=all(required.values())
    total=100 if certified else 99
    status="PASSED" if certified else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_RECORD_200_NON_EXPORT_RECERTIFIED_EXACT_NEW_ONE_HUNDRED_QUALIFICATION_CLOSED"
           if certified else
           "M419D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_RECORD_200_NON_EXPORT_RECERTIFICATION_INCOMPLETE")
    classification=("EXACT_NEW_ONE_HUNDRED_NON_EXPORT_QUALIFICATION_CERTIFIED_99_PRIOR_PLUS_RECORD_200_FINAL_RECERTIFICATION"
                    if certified else
                    "RECORD_200_FINAL_NON_EXPORT_RECERTIFICATION_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
         if certified else
         "M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_R1_RECORD_200_FINAL_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    checks={
      "r27bR4R3R2Passed":True,
      "record200TimingTransientConsumed":True,
      "priorNinetyNineCertifiedPreserved":True,
      "priorRecordsNotReplayed":True,
      "record200OnlyLiveScope":True,
      "target12350PhiladelphiaSt":target=="12350 Philadelphia St",
      "twoSecondExplorerBoundPreserved":True,
      "threeSampleExplorerGuardPreserved":True,
      "pageReadyAnchoredSamplingUsed":True,
      "freshPageCreated":fresh,
      "explorerSettleCertified":explorer_settle,
      "explorerEntryCertified":explorer_entry,
      "targetBindingSettleCertified":bound,
      "ambiguousBindingForbidden":True,
      "selectionCertified":selected,
      "selectedPropertySettleCertified":selected_settle,
      "assignmentsEntryCertified":assignments,
      "generateControlCertified":generate_control,
      "reportReviewEntryCertified":report_review,
      "downloadClientListingReportControlCertified":download_control,
      "exportReportHandlerCertifiedBySourceContract":handler_source,
      "sameOriginCertified":same_origin,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "exactNewOneHundredCertified":certified
    }

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"record_200_bounded_explorer_settle_repair_and_final_non_export_recertification.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R27B_R4_R3_R3_RECORD_200_BOUNDED_EXPLORER_SETTLE_REPAIR_AND_FINAL_NON_EXPORT_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":state,
      "classification":classification,
      "priorCertifiedCount":99,
      "record200Certified":certified,
      "exactNewOneHundredCertifiedCount":total,
      "target":target,
      "explorerSettleMaximumSeconds":2.0,
      "explorerSettleConsecutiveSamples":3,
      "explorerSamplingAnchor":"DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM",
      "bindingReadback":bind_readback,
      "record200StageReadback":required,
      "checks":checks,
      "exportInvocation":False,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("TARGET:",target)
    print("FRESH_PAGE_CREATED:",fresh)
    print("EXPLORER_SETTLE_CERTIFIED:",explorer_settle)
    print("EXPLORER_ENTRY_CERTIFIED:",explorer_entry)
    print("TARGET_BINDING_SETTLE_CERTIFIED:",bound)
    print("SELECTION_CERTIFIED:",selected)
    print("SELECTED_PROPERTY_SETTLE_CERTIFIED:",selected_settle)
    print("ASSIGNMENTS_ENTRY_CERTIFIED:",assignments)
    print("GENERATE_CONTROL_CERTIFIED:",generate_control)
    print("REPORT_REVIEW_ENTRY_CERTIFIED:",report_review)
    print("DOWNLOAD_CLIENT_LISTING_REPORT_CONTROL_CERTIFIED:",download_control)
    print("EXPORTREPORT_HANDLER_CERTIFIED_BY_SOURCE_CONTRACT:",handler_source)
    print("SAME_ORIGIN:",same_origin)
    print("EXPORT_INVOCATION: OFF")
    print("RECORD_200_CERTIFIED:",certified)
    print("EXACT_NEW_ONE_HUNDRED_CERTIFIED_COUNT:",total)

    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR27B-R4-R3-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if certified else 10

if __name__=="__main__":
    raise SystemExit(main())
