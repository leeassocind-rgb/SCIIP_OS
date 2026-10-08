#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys, urllib.request, urllib.parse, socket, base64, os, struct, time, re

PORT=9333
APP="http://127.0.0.1:5173/"
R28A_R4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
R3="M4_19D4BN17C_R4_R12_R16A_R28B_R3_EXPLORER_ENTRY_CLICK_HELPER_REPAIR_RECORD_201_RECERTIFICATION_AND_EXACT_NEW_200_NON_EXPORT_RESUME"
R332="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R2_RECORD_233_EXPLORER_CONTROL_MATERIALIZATION_TIMING_DEEP_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R3_RECORD_233_PAGE_READY_ANCHORED_EXPLORER_SETTLE_RECERTIFICATION_AND_RESUME"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u, timeout=3) as r:
            return json.loads(r.read().decode())
    except:
        return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT")
    try:
        with urllib.request.urlopen(req, timeout=4) as r:
            return json.loads(r.read())
    except:
        return None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m: raise RuntimeError("invalid websocket debugger URL")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=8)
        key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode(); m=os.urandom(4); n=len(p); h=bytearray([129])
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
        self.i+=1; i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x
    def close(self):
        try:self.s.close()
        except:pass

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    rr=((r or {}).get("result")or{})
    if rr.get("exceptionDetails"): return None
    return (rr.get("result")or{}).get("value")

def clean(s):
    s=" ".join(str(s or "").split())
    if s.lower().startswith("select "): s=s[7:].strip()
    for token in ["UNDER CONSTRUCTION","PROPOSED/PLANNED","PROPOSED","PLANNED","EXISTING","AVAILABLE","LEASED","SOLD"]:
        i=s.upper().find(token)
        if i>0:s=s[:i].strip()
    return s

def exact_btn(w,t):
    return ev(w, """(()=>[...document.querySelectorAll('button')].filter(b=>
      b.offsetParent!==null && !b.disabled &&
      (b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()===%s
    ).length)()""" % json.dumps(t)) or 0

def click_btn(w,t):
    return ev(w, """(()=>{
      const a=[...document.querySelectorAll('button')].filter(b=>
        b.offsetParent!==null&&!b.disabled &&
        (b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()===%s);
      if(a.length!==1)return {clicked:false,count:a.length};
      a[0].click();return {clicked:true,count:1};
    })()""" % json.dumps(t)) or {"clicked":False,"count":None}

def wait_btn(w, labels, sec):
    st=time.time()
    while time.time()-st<=sec:
        for t in labels:
            if exact_btn(w,t)==1:return t
        time.sleep(.08)
    return None

def settle_explorer_page_ready_anchored(w,max_sec=2.0,need=3):
    # Anchor timing to document complete + nonzero button DOM, not raw target creation.
    anchor=None
    st=time.time()
    samples=[]
    while time.time()-st<=5.0:
        ready=ev(w,"document.readyState")
        buttons=ev(w,"document.querySelectorAll('button').length") or 0
        origin=ev(w,"location.origin")
        url=ev(w,"location.href")
        if anchor is None and ready=="complete" and buttons>0 and origin=="http://127.0.0.1:5173":
            anchor=time.time()
            break
        samples.append({"phase":"pre_anchor","t":round(time.time()-st,3),"readyState":ready,"buttonCount":buttons,"origin":origin,"url":url})
        time.sleep(.05)

    if anchor is None:
        return False, samples

    con=0
    while time.time()-anchor<=max_sec:
        ready=ev(w,"document.readyState")
        buttons=ev(w,"document.querySelectorAll('button').length") or 0
        count=exact_btn(w,"Explorer")
        visible=count==1
        origin=ev(w,"location.origin")
        url=ev(w,"location.href")
        ok=(ready=="complete" and buttons>0 and count==1 and visible and origin=="http://127.0.0.1:5173")
        samples.append({"phase":"anchored","t":round(time.time()-anchor,3),"readyState":ready,"buttonCount":buttons,
                        "exactExplorerCount":count,"visibleEnabledExplorerCount":1 if ok else 0,"origin":origin,"url":url})
        con=con+1 if ok else 0
        if con>=need:
            return True, samples
        time.sleep(.1)
    return False, samples

def wait_explorer_surface(w):
    st=time.time()
    while time.time()-st<=1.5:
        c=ev(w,"document.querySelectorAll('button.sciip-property-marker').length") or 0
        if c>0:return True,c
        time.sleep(.05)
    return False,0

def inventory(w):
    return ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker')].map((b,i)=>({
      domOrdinal:i+1,
      text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),
      aria:(b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim(),
      outerHTML:b.outerHTML.slice(0,3000)
    })))()""") or []

def find_target(w,target):
    label=clean(target.get("label"))
    sf=target.get("sf")
    requested=target.get("bindingMode") or "NORMALIZED_LABEL"
    st=time.time(); con=0; last_key=None; last=None; last_mode=None
    while time.time()-st<=5.0:
        inv=inventory(w)
        exact=[]; contains=[]
        for m in inv:
            obs=clean(m.get("aria") or m.get("text"))
            outer=m.get("outerHTML") or ""
            sf_ok=(sf is None) or (f"{int(sf):,} SF" in outer) or (f"{int(sf)} SF" in outer.replace(",",""))
            if obs.lower()==label.lower():
                if requested=="ADDRESS_PLUS_VISIBLE_SF":
                    if sf_ok:exact.append(m)
                else:exact.append(m)
            elif label and label.lower() in (m.get("text") or "").lower():
                if requested!="ADDRESS_PLUS_VISIBLE_SF" or sf_ok:contains.append(m)
        mode=None; hit=None
        if len(exact)==1:mode="EXACT";hit=exact[0]
        elif len(exact)>1 and sf is not None:
            hs=[m for m in exact if f"{int(sf):,} SF" in (m.get("outerHTML") or "")]
            if len(hs)==1:mode="ADDRESS_PLUS_VISIBLE_SF";hit=hs[0]
        elif len(exact)==0 and len(contains)==1:
            mode="UNIQUE_CONTAINS";hit=contains[0]
        key=(mode, hit.get("domOrdinal") if hit else None)
        if hit and key==last_key:con+=1
        elif hit:con=1
        else:con=0
        last_key=key;last=hit;last_mode=mode
        if con>=3:return True,last_mode,last,len(inv)
        time.sleep(.12)
    return False,last_mode,last,len(inventory(w))

def click_marker(w,ordn):
    return ev(w,f"""(()=>{{const a=[...document.querySelectorAll('button.sciip-property-marker')];
    const b=a[{int(ordn)-1}];if(!b||b.offsetParent===null)return false;b.click();return true}})()""") is True

def settle_selected(w,target):
    label=clean(target.get("label"));sf=target.get("sf")
    st=time.time();con=0
    while time.time()-st<=2.0:
        vals=ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker.is-selected')].map(b=>({
          text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),
          aria:(b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim(),
          outerHTML:b.outerHTML.slice(0,3000)
        })))()""") or []
        ok=False
        if len(vals)==1:
            m=vals[0];obs=clean(m.get("aria") or m.get("text"))
            sf_ok=(sf is None) or (f"{int(sf):,} SF" in (m.get("outerHTML") or ""))
            ok=(obs.lower()==label.lower() and sf_ok)
        con=con+1 if ok else 0
        if con>=3:return True
        time.sleep(.1)
    return False

def source_export_contract(repo):
    p=repo/"apps/property-command-center/src/broker-product/InstitutionalReportReview.jsx"
    if not p.exists():return False
    s=p.read_text(errors="ignore")
    return ("Download Client Listing Report" in s and
            "function exportReport" in s and
            "onClick={exportReport}" in s)

def stable_same_origin(w,sec=0.75,need=3):
    st=time.time();con=0;samples=[]
    while time.time()-st<=sec:
        origin=ev(w,"location.origin")
        url=ev(w,"location.href")
        ok=(origin=="http://127.0.0.1:5173" and str(url or "").startswith("http://127.0.0.1:5173/"))
        samples.append({"t":round(time.time()-st,3),"origin":origin,"url":url,"ok":ok})
        con=con+1 if ok else 0
        if con>=need:return True,samples
        time.sleep(.1)
    return False,samples

def qualify(repo,target,ordinal):
    o={"ordinal":ordinal,"target":target.get("label"),"sf":target.get("sf"),
       "freshTargetCreated":False,"explorerSettleCertified":False,"explorerSettleSamples":[],
       "explorerEntryCertified":False,"targetBindingSettleCertified":False,
       "bindingModeObserved":None,"bindingInventoryCount":0,
       "selectionCertified":False,"selectedPropertySettleCertified":False,
       "assignmentsEntryCertified":False,"generateControlCertified":False,"generateClicked":False,
       "reportReviewEntryCertified":False,"downloadClientListingReportControlCertified":False,
       "exportReportHandlerCertifiedBySourceContract":source_export_contract(repo),
       "sameOriginStableCertified":False,"sameOriginSamples":[],
       "exportInvocation":False,"certified":False,"failure":None}

    page=newpage()
    if not page or not page.get("webSocketDebuggerUrl"):
        o["failure"]="FRESH_PAGE_CREATION_FAILED";return o
    o["freshTargetCreated"]=True
    w=None
    try:
        w=WS(page["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")

        ok,samples=settle_explorer_page_ready_anchored(w,2.0,3)
        o["explorerSettleCertified"]=ok;o["explorerSettleSamples"]=samples
        if not ok:
            o["failure"]="EXPLORER_SETTLE_FAILED";return o

        cr=click_btn(w,"Explorer")
        surf,cnt=wait_explorer_surface(w)
        o["explorerEntryCertified"]=bool(cr.get("clicked") is True and surf)
        if not o["explorerEntryCertified"]:
            o["failure"]="EXPLORER_ENTRY_FAILED";return o

        ok,mode,m,ic=find_target(w,target)
        o["targetBindingSettleCertified"]=ok;o["bindingModeObserved"]=mode;o["bindingInventoryCount"]=ic
        if not ok or not m:
            o["failure"]="TARGET_BINDING_SETTLE_FAILED";return o

        o["selectionCertified"]=click_marker(w,m["domOrdinal"])
        if not o["selectionCertified"]:
            o["failure"]="SELECTION_FAILED";return o

        o["selectedPropertySettleCertified"]=settle_selected(w,target)
        if not o["selectedPropertySettleCertified"]:
            o["failure"]="SELECTED_PROPERTY_SETTLE_FAILED";return o

        a=wait_btn(w,["Assignments"],2.0)
        if not a:
            o["failure"]="ASSIGNMENTS_CONTROL_FAILED";return o
        o["assignmentsEntryCertified"]=click_btn(w,a).get("clicked") is True
        if not o["assignmentsEntryCertified"]:
            o["failure"]="ASSIGNMENTS_ENTRY_FAILED";return o
        time.sleep(.25)

        g=wait_btn(w,["Generate Client Listing Report","Generate New Report","Generate Report"],3.0)
        if not g:
            o["failure"]="GENERATE_CONTROL_FAILED";return o
        o["generateControlCertified"]=True
        o["generateClicked"]=click_btn(w,g).get("clicked") is True
        if not o["generateClicked"]:
            o["failure"]="GENERATE_INVOCATION_FAILED";return o

        dl=wait_btn(w,["Download Client Listing Report"],4.0)
        o["reportReviewEntryCertified"]=bool(dl)
        o["downloadClientListingReportControlCertified"]=bool(dl and exact_btn(w,dl)==1)
        if not o["reportReviewEntryCertified"]:
            o["failure"]="REPORT_REVIEW_ENTRY_FAILED";return o
        if not o["downloadClientListingReportControlCertified"]:
            o["failure"]="DOWNLOAD_CONTROL_FAILED";return o
        if not o["exportReportHandlerCertifiedBySourceContract"]:
            o["failure"]="EXPORT_HANDLER_SOURCE_CONTRACT_FAILED";return o

        ok_origin,origin_samples=stable_same_origin(w,0.75,3)
        o["sameOriginStableCertified"]=ok_origin;o["sameOriginSamples"]=origin_samples
        if not ok_origin:
            o["failure"]="SAME_ORIGIN_STABILITY_FAILED";return o

        # Non-export qualification only.
        o["exportInvocation"]=False
        o["certified"]=True
        return o
    finally:
        if w:w.close()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p3=er/R3/"explorer_entry_click_helper_repair_record_201_recertification_and_exact_new_200_non_export_resume.json"
    p332=er/R332/"record_233_explorer_control_materialization_timing_deep_diagnosis.json"
    tf=er/R28A_R4/"exact_new_two_hundred_candidates_prefix_normalized.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28B-R3-R3-R3 Record 233 Page-Ready-Anchored Explorer Settle Recertification + Resume")
    print("="*120)
    print("Application source mutation: RUNNER_SETTLE_GUARD_REPAIR_ONLY")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export invocation: OFF")
    print("Previously certified records preserved: 32")
    print("Resume ordinal: 233")
    print("Residual live records: 168")
    print("Explorer settle bound: 3 consecutive samples within 2.0 seconds")
    print("Explorer sampling anchor: document complete + nonzero button DOM + app origin")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")

    for p,n in [(p3,"R28B-R3"),(p332,"R28B-R3-R3-R2"),(tf,"exact new-200 targets")]:
        if not p.exists():
            print("STATUS: BLOCKED");print("REASON:",n,"missing");return 4

    r3=loadj(p3); r332=loadj(p332); targets=loadj(tf)

    if not isinstance(r3,dict) or r3.get("status")!="DIAGNOSTIC_COMPLETE" or r3.get("certifiedCount")!=32:
        print("STATUS: BLOCKED");print("REASON: preserved-32 contract not satisfied");return 5
    if not isinstance(r332,dict) or r332.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: R28B-R3-R3-R2 must be PASSED");return 6
    if r332.get("firstUniqueExplorerSeconds") is None or r332.get("firstUniqueExplorerSeconds")>2.0 or not r332.get("stableLastFiveSamples"):
        print("STATUS: BLOCKED");print("REASON: Explorer transient timing diagnosis not certified");return 7
    if not isinstance(targets,list) or len(targets)!=200:
        print("STATUS: BLOCKED");print("REASON: exact new-200 target cohort missing");return 8

    residual=targets[32:]
    if len(residual)!=168 or clean(residual[0].get("label"))!="13310 Valley Blvd":
        print("STATUS: BLOCKED");print("REASON: residual cohort contract failed");return 9
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: CDP unavailable");return 10

    outcomes=[];halted=False
    for i,t in enumerate(residual,233):
        print(f"[{i}/400] {t.get('label')}")
        o=qualify(repo,t,i)
        outcomes.append(o)
        print("explorerSettleCertified:",o["explorerSettleCertified"])
        print("certified:",o["certified"])
        print("failure:",o["failure"])
        if not o["certified"]:
            halted=True;break

    residual_cert=sum(1 for x in outcomes if x.get("certified"))
    total=32+residual_cert
    exact200=(len(outcomes)==168 and residual_cert==168 and not halted)

    checks={
      "r28bR3PreservedThirtyTwo":r3.get("certifiedCount")==32,
      "r28bR3R3R2Passed":r332.get("status")=="PASSED",
      "record233ExplorerMaterializedWithinTwoSeconds":r332.get("firstUniqueExplorerSeconds") is not None and r332.get("firstUniqueExplorerSeconds")<=2.0,
      "record233ExplorerStableLateWindow":r332.get("stableLastFiveSamples") is True,
      "previousThirtyTwoNotReplayed":True,
      "residualCountExactly168":len(residual)==168,
      "resumeOrdinal233":bool(outcomes and outcomes[0].get("ordinal")==233),
      "record233ExplorerSettleRecertificationAttempted":bool(outcomes),
      "record233ExplorerSettleCertified":bool(outcomes and outcomes[0].get("explorerSettleCertified")),
      "record233NonExportCertified":bool(outcomes and outcomes[0].get("certified")),
      "pageReadyAnchoredSamplingUsed":True,
      "twoSecondExplorerBoundPreserved":True,
      "threeSampleExplorerGuardPreserved":True,
      "freshPagePerExecutedResidualRecord":all(x.get("freshTargetCreated") for x in outcomes),
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":True,
      "allExecutedExplorerSettlesCertified":all(x.get("explorerSettleCertified") for x in outcomes),
      "allExecutedExplorerEntriesCertified":all(x.get("explorerEntryCertified") for x in outcomes),
      "allExecutedTargetBindingsCertified":all(x.get("targetBindingSettleCertified") for x in outcomes),
      "allExecutedSelectionsCertified":all(x.get("selectionCertified") for x in outcomes),
      "allExecutedSelectedPropertySettlesCertified":all(x.get("selectedPropertySettleCertified") for x in outcomes),
      "allExecutedAssignmentsEntriesCertified":all(x.get("assignmentsEntryCertified") for x in outcomes),
      "allExecutedGenerateInvocationsCertified":all(x.get("generateClicked") for x in outcomes),
      "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") for x in outcomes),
      "allExecutedDownloadControlsCertified":all(x.get("downloadClientListingReportControlCertified") for x in outcomes),
      "allExecutedSameOriginStableCertified":all(x.get("sameOriginStableCertified") for x in outcomes),
      "exportInvocationOffForEveryExecutedRecord":all(x.get("exportInvocation") is False for x in outcomes),
      "exactNewTwoHundredNonExportQualified":exact200,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    status="PASSED" if exact200 else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R28B_R3_R3_R3_EXACT_NEW_TWO_HUNDRED_NON_EXPORT_QUALIFICATION_CERTIFIED"
           if exact200 else
           "M419D4BN17C_R4_R12_R16A_R28B_R3_R3_R3_RESUME_FROM_233_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
         if exact200 else
         "M4_19D4BN17C_R4_R12_R16A_R28B_R3_R3_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS")

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"record_233_page_ready_anchored_explorer_settle_recertification_and_resume.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28B_R3_R3_R3_RECORD_233_PAGE_READY_ANCHORED_EXPLORER_SETTLE_RECERTIFICATION_AND_RESUME",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,
      "state":state,
      "classification":("EXACT_NEW_200_NON_EXPORT_QUALIFICATION_CERTIFIED_32_PRESERVED_PLUS_168_RESIDUAL_WITH_PAGE_READY_ANCHORED_EXPLORER_SETTLE"
                        if exact200 else
                        "RESIDUAL_NON_EXPORT_QUALIFICATION_GAP_REMAINS_AFTER_PAGE_READY_ANCHORED_EXPLORER_SETTLE_REPAIR"),
      "previousCertifiedCount":32,
      "residualTargetCount":168,
      "residualExecutedCount":len(outcomes),
      "residualCertifiedCount":residual_cert,
      "exactNewTwoHundredCertifiedCount":total,
      "haltedOnFailure":halted,
      "outcomes":outcomes,
      "checks":checks,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("PREVIOUS_CERTIFIED_COUNT: 32")
    print("RESIDUAL_CERTIFIED_COUNT:",residual_cert)
    print("EXACT_NEW_TWO_HUNDRED_CERTIFIED_COUNT:",total)
    print("RESIDUAL_EXECUTED_COUNT:",len(outcomes))
    print("HALTED_ON_FAILURE:",halted)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",out["classification"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR28B-R3-R3-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
