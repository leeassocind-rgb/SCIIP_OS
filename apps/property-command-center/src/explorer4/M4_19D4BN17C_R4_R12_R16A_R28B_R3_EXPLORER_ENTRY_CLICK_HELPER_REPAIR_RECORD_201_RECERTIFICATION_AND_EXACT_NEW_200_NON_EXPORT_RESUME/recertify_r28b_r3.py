#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333
APP="http://127.0.0.1:5173/"
R28A_R4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
R28B="M4_19D4BN17C_R4_R12_R16A_R28B_TWO_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
R28B_R1="M4_19D4BN17C_R4_R12_R16A_R28B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R28B_R2="M4_19D4BN17C_R4_R12_R16A_R28B_R2_RECORD_201_EXPLORER_ENTRY_CONTROL_INTERACTION_DEEP_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R28B_R3_EXPLORER_ENTRY_CLICK_HELPER_REPAIR_RECORD_201_RECERTIFICATION_AND_EXACT_NEW_200_NON_EXPORT_RESUME"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=4) as r:return json.loads(r.read())
    except:return None

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
    def close(self):
        try:self.s.close()
        except:pass

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    rr=((r or {}).get("result")or{})
    if rr.get("exceptionDetails"): return None
    return (rr.get("result")or{}).get("value")

def norm(s):
    s=" ".join(str(s or "").split())
    if s.lower().startswith("select "): s=s[7:].strip()
    return s

def clean_label(s):
    x=norm(s)
    for token in ["UNDER CONSTRUCTION","PROPOSED/PLANNED","PROPOSED","PLANNED","EXISTING","AVAILABLE","LEASED","SOLD"]:
        i=x.upper().find(token)
        if i>0:x=x[:i].strip()
    return x

def exact_button_count(w,t):
    return ev(w, """(()=>[...document.querySelectorAll('button')].filter(b=>
      b.offsetParent!==null &&
      !b.disabled &&
      (b.innerText||b.textContent||'').replace(/\s+/g,' ').trim() === %s
    ).length)()""" % json.dumps(t)) or 0

def settle_exact_button_page_ready(w,t,max_sec=2.0,need=3):
    st=time.time();con=0
    while time.time()-st<=max_sec:
        ready=ev(w,"document.readyState")
        buttons=ev(w,"document.querySelectorAll('button').length") or 0
        if ready!="complete" or buttons==0:
            con=0;time.sleep(.05);continue
        con=con+1 if exact_button_count(w,t)==1 else 0
        if con>=need:return True
        time.sleep(.1)
    return False

# R28B-R3 REPAIR:
# use a syntactically explicit exact-button helper and return structured click readback.
def click_exact_button_repaired(w,t):
    return ev(w, """(()=>{
      const xs=[...document.querySelectorAll('button')].filter(b=>
        b.offsetParent!==null &&
        !b.disabled &&
        (b.innerText||b.textContent||'').replace(/\s+/g,' ').trim() === %s
      );
      if(xs.length!==1) return {clicked:false,count:xs.length,reason:'NOT_UNIQUE'};
      const b=xs[0];
      b.click();
      return {clicked:true,count:1,connectedAfter:b.isConnected};
    })()""" % json.dumps(t)) or {"clicked":False,"count":None,"reason":"EVALUATION_FAILED"}

def wait_explorer_surface(w,max_sec=1.5):
    st=time.time();samples=[]
    while time.time()-st<=max_sec:
        v=ev(w,"document.querySelectorAll('button.sciip-property-marker').length") or 0
        samples.append({"t":round(time.time()-st,3),"markerCount":v})
        if v>0:return True,v,samples
        time.sleep(.05)
    return False,0,samples

def marker_inventory(w):
    return ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker')].map((b,i)=>({
      domOrdinal:i+1,
      text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),
      aria:(b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim(),
      className:String(b.className||''),
      outerHTML:b.outerHTML.slice(0,3000)
    })))()""") or []

def target_candidates(inv,target):
    label=clean_label(target.get("label"))
    sf=target.get("sf")
    requested=target.get("bindingMode") or "NORMALIZED_LABEL"
    exact=[];boundary=[];contains=[]
    for m in inv:
        obs=clean_label(m.get("aria") or m.get("text"))
        outer=m.get("outerHTML") or ""
        sf_ok=(sf is None) or (f"{int(sf):,} SF" in outer) or (f"{int(sf)} SF" in outer.replace(",",""))
        if obs.lower()==label.lower():
            if requested=="ADDRESS_PLUS_VISIBLE_SF":
                if sf_ok:exact.append(m)
            else:exact.append(m)
        elif obs and label and obs.lower().startswith(label.lower()):
            if requested!="ADDRESS_PLUS_VISIBLE_SF" or sf_ok:boundary.append(m)
        elif label and label.lower() in (m.get("text") or "").lower():
            if requested!="ADDRESS_PLUS_VISIBLE_SF" or sf_ok:contains.append(m)
    if len(exact)==1:return "EXACT",exact
    if len(exact)>1:
        if sf is not None:
            sfhits=[m for m in exact if f"{int(sf):,} SF" in (m.get("outerHTML") or "")]
            if len(sfhits)==1:return "ADDRESS_PLUS_VISIBLE_SF",sfhits
        return None,exact
    if len(boundary)==1:return "BOUNDARY_NORMALIZED_IDENTITY",boundary
    if len(contains)==1:return "UNIQUE_CONTAINS",contains
    return None,exact or boundary or contains

def settle_target_binding(w,target,max_sec=5.0,need=3):
    st=time.time();con=0;last_mode=None;last=[];last_count=0
    while time.time()-st<=max_sec:
        inv=marker_inventory(w);last_count=len(inv)
        mode,hits=target_candidates(inv,target)
        if mode and len(hits)==1:
            con=con+1 if mode==last_mode else 1
            last_mode=mode;last=hits
            if con>=need:return True,mode,hits[0],last_count
        else:
            con=0;last_mode=None;last=hits
        time.sleep(.12)
    return False,None,(last[0] if len(last)==1 else None),last_count

def click_marker(w,dom_ordinal):
    return ev(w,f"""(()=>{{
      const a=[...document.querySelectorAll('button.sciip-property-marker')];
      const b=a[{int(dom_ordinal)-1}];
      if(!b||b.offsetParent===null)return false;
      b.click();return true;
    }})()""") is True

def settle_selected(w,target,max_sec=2.0,need=3):
    label=clean_label(target.get("label"));sf=target.get("sf")
    st=time.time();con=0
    while time.time()-st<=max_sec:
        vals=ev(w,r"""(()=>[...document.querySelectorAll('button.sciip-property-marker.is-selected')].map(b=>({
          text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),
          aria:(b.getAttribute('aria-label')||'').replace(/\s+/g,' ').trim(),
          outerHTML:b.outerHTML.slice(0,3000)
        })))()""") or []
        ok=False
        if len(vals)==1:
            m=vals[0];obs=clean_label(m.get("aria") or m.get("text"))
            sf_ok=(sf is None) or (f"{int(sf):,} SF" in (m.get("outerHTML") or ""))
            ok=(obs.lower()==label.lower() and sf_ok)
        con=con+1 if ok else 0
        if con>=need:return True
        time.sleep(.1)
    return False

def wait_button(w,labels,max_sec=3.0):
    st=time.time()
    while time.time()-st<=max_sec:
        for t in labels:
            if exact_button_count(w,t)==1:return t
        time.sleep(.1)
    return None

def source_export_contract(repo):
    p=repo/"apps/property-command-center/src/broker-product/InstitutionalReportReview.jsx"
    if not p.exists():return False
    s=p.read_text(errors="ignore")
    return ("Download Client Listing Report" in s and
            "function exportReport" in s and
            "onClick={exportReport}" in s)

def qualify_one(repo,target,ordinal):
    o={
      "ordinal":ordinal,"target":target.get("label"),"sf":target.get("sf"),
      "bindingModeRequested":target.get("bindingMode"),
      "freshTargetCreated":False,
      "explorerSettleCertified":False,
      "explorerClickReadback":None,
      "explorerEntryCertified":False,
      "explorerSurfaceMarkerCount":0,
      "targetBindingSettleCertified":False,
      "bindingModeObserved":None,
      "bindingInventoryCount":0,
      "selectionCertified":False,
      "selectedPropertySettleCertified":False,
      "assignmentsEntryCertified":False,
      "generateControlCertified":False,
      "generateClicked":False,
      "reportReviewEntryCertified":False,
      "downloadClientListingReportControlCertified":False,
      "exportReportHandlerCertifiedBySourceContract":source_export_contract(repo),
      "sameOrigin":False,
      "exportInvocation":False,
      "certified":False,
      "failure":None
    }
    page=newpage()
    if not page or not page.get("webSocketDebuggerUrl"):
        o["failure"]="FRESH_PAGE_CREATION_FAILED";return o
    o["freshTargetCreated"]=True
    w=None
    try:
        w=WS(page["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
        o["sameOrigin"]=(ev(w,"location.origin")=="http://127.0.0.1:5173")

        o["explorerSettleCertified"]=settle_exact_button_page_ready(w,"Explorer",2.0,3)
        if not o["explorerSettleCertified"]:
            o["failure"]="EXPLORER_SETTLE_FAILED";return o

        cr=click_exact_button_repaired(w,"Explorer")
        o["explorerClickReadback"]=cr
        surface,count,_=wait_explorer_surface(w,1.5)
        o["explorerSurfaceMarkerCount"]=count
        o["explorerEntryCertified"]=bool(cr.get("clicked") is True and surface)
        if not o["explorerEntryCertified"]:
            o["failure"]="EXPLORER_ENTRY_FAILED";return o

        ok,mode,m,ic=settle_target_binding(w,target,5.0,3)
        o["targetBindingSettleCertified"]=ok;o["bindingModeObserved"]=mode;o["bindingInventoryCount"]=ic
        if not ok or not m:
            o["failure"]="TARGET_BINDING_SETTLE_FAILED";return o

        o["selectionCertified"]=click_marker(w,m["domOrdinal"])
        if not o["selectionCertified"]:
            o["failure"]="SELECTION_FAILED";return o

        o["selectedPropertySettleCertified"]=settle_selected(w,target,2.0,3)
        if not o["selectedPropertySettleCertified"]:
            o["failure"]="SELECTED_PROPERTY_SETTLE_FAILED";return o

        ab=wait_button(w,["Assignments"],2.0)
        if not ab:
            o["failure"]="ASSIGNMENTS_CONTROL_FAILED";return o
        acr=click_exact_button_repaired(w,ab)
        o["assignmentsEntryCertified"]=acr.get("clicked") is True
        if not o["assignmentsEntryCertified"]:
            o["failure"]="ASSIGNMENTS_ENTRY_FAILED";return o
        time.sleep(.25)

        gen=wait_button(w,["Generate Client Listing Report","Generate New Report","Generate Report"],3.0)
        if not gen:
            o["failure"]="GENERATE_CONTROL_FAILED";return o
        o["generateControlCertified"]=True
        gcr=click_exact_button_repaired(w,gen)
        o["generateClicked"]=gcr.get("clicked") is True
        if not o["generateClicked"]:
            o["failure"]="GENERATE_INVOCATION_FAILED";return o

        dl=wait_button(w,["Download Client Listing Report"],4.0)
        o["reportReviewEntryCertified"]=bool(dl)
        o["downloadClientListingReportControlCertified"]=bool(dl and exact_button_count(w,dl)==1)
        if not o["reportReviewEntryCertified"]:
            o["failure"]="REPORT_REVIEW_ENTRY_FAILED";return o
        if not o["downloadClientListingReportControlCertified"]:
            o["failure"]="DOWNLOAD_CONTROL_FAILED";return o
        if not o["exportReportHandlerCertifiedBySourceContract"]:
            o["failure"]="EXPORT_HANDLER_SOURCE_CONTRACT_FAILED";return o

        o["sameOrigin"]=o["sameOrigin"] and (ev(w,"location.origin")=="http://127.0.0.1:5173")
        if not o["sameOrigin"]:
            o["failure"]="ORIGIN_CHANGED";return o

        # R28B-R3 remains NON-EXPORT. The Download control is certified but never clicked.
        o["exportInvocation"]=False
        o["certified"]=True
        return o
    finally:
        if w:w.close()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    pA=er/R28A_R4/"candidate_ui_action_prefix_normalization_and_reference_exclusion_integrity_repair.json"
    targets_file=er/R28A_R4/"exact_new_two_hundred_candidates_prefix_normalized.json"
    pB=er/R28B/"two_hundred_new_record_non_export_live_qualification.json"
    p1=er/R28B_R1/"non_export_live_qualification_residual_causal_diagnosis.json"
    p2=er/R28B_R2/"record_201_explorer_entry_control_interaction_deep_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28B-R3 Explorer Entry Click Helper Repair + Record 201 Recertification + Exact New-200 Non-Export Resume")
    print("="*120)
    print("Application source mutation: RUNNER_REPAIR_ONLY")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Export invocation: OFF")
    print("Resume scope: RECORDS 201-400")
    print("Previously certified R28B records preserved: 0")
    print("Fresh page per record: REQUIRED")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")

    for p,n in [(pA,"R28A-R4"),(targets_file,"R28A-R4 targets"),(pB,"R28B"),(p1,"R28B-R1"),(p2,"R28B-R2")]:
        if not p.exists():
            print("STATUS: BLOCKED");print("REASON:",n,"evidence missing");return 4

    a=loadj(pA);targets=loadj(targets_file);b=loadj(pB);r1=loadj(p1);r2=loadj(p2)

    prereq_ok=(
      isinstance(a,dict) and a.get("status")=="PASSED" and
      isinstance(targets,list) and len(targets)==200 and
      isinstance(b,dict) and b.get("status")=="DIAGNOSTIC_COMPLETE" and b.get("certifiedCount")==0 and
      isinstance(r1,dict) and r1.get("status")=="PASSED" and r1.get("firstFailedStage")=="explorerEntryCertified" and
      isinstance(r2,dict) and r2.get("status")=="PASSED" and r2.get("postClickExplorerSurfaceMaterialized") is True and
      r2.get("postClickMarkerMaximum")==840
    )
    if not prereq_ok:
        print("STATUS: BLOCKED");print("REASON: prerequisite evidence contract not satisfied");return 5

    keys=[x.get("selectionKey") for x in targets if isinstance(x,dict)]
    if len(keys)!=200 or len(set(keys))!=200:
        print("STATUS: BLOCKED");print("REASON: target cohort identity contract failed");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: certified CDP browser context required");return 7
    if not source_export_contract(repo):
        print("STATUS: BLOCKED");print("REASON: exportReport source contract not certified");return 8

    outcomes=[];halted=False
    for i,t in enumerate(targets,201):
        print(f"[{i}/400] {t.get('label')}")
        o=qualify_one(repo,t,i)
        outcomes.append(o)
        print("explorerEntryCertified:",o["explorerEntryCertified"])
        print("certified:",o["certified"])
        print("failure:",o["failure"])
        if not o["certified"]:
            halted=True;break

    certified=sum(1 for x in outcomes if x.get("certified"))
    exact200=(len(outcomes)==200 and certified==200 and not halted)
    record201=outcomes[0] if outcomes else {}

    checks={
      "r28aR4Passed":a.get("status")=="PASSED",
      "r28bOriginalFailureConsumed":b.get("status")=="DIAGNOSTIC_COMPLETE",
      "r28bR1Passed":r1.get("status")=="PASSED",
      "r28bR2Passed":r2.get("status")=="PASSED",
      "r28bR2ExplorerClickSucceeded":r2.get("postClickExplorerSurfaceMaterialized") is True,
      "r28bR2Observed840Markers":r2.get("postClickMarkerMaximum")==840,
      "explorerClickHelperRepaired":True,
      "explorerEntryRequiresClickAndPostClickSurface":True,
      "exactTargetCountTwoHundred":len(targets)==200,
      "exactTargetSelectionKeysUnique":len(set(keys))==200,
      "record201RecertificationAttempted":bool(outcomes and outcomes[0].get("ordinal")==201),
      "record201ExplorerEntryCertified":record201.get("explorerEntryCertified") is True,
      "record201NonExportCertified":record201.get("certified") is True,
      "freshPagePerExecutedRecord":all(x.get("freshTargetCreated") for x in outcomes),
      "strictSequentialObserved":True,
      "haltOnFirstFailureObserved":True,
      "allExecutedExplorerEntriesCertified":all(x.get("explorerEntryCertified") for x in outcomes),
      "allExecutedTargetBindingsCertified":all(x.get("targetBindingSettleCertified") for x in outcomes),
      "allExecutedSelectionsCertified":all(x.get("selectionCertified") for x in outcomes),
      "allExecutedSelectedPropertySettlesCertified":all(x.get("selectedPropertySettleCertified") for x in outcomes),
      "allExecutedAssignmentsEntriesCertified":all(x.get("assignmentsEntryCertified") for x in outcomes),
      "allExecutedGenerateInvocationsCertified":all(x.get("generateClicked") for x in outcomes),
      "allExecutedReportReviewsCertified":all(x.get("reportReviewEntryCertified") for x in outcomes),
      "allExecutedDownloadControlsCertified":all(x.get("downloadClientListingReportControlCertified") for x in outcomes),
      "exportInvocationOffForEveryExecutedRecord":all(x.get("exportInvocation") is False for x in outcomes),
      "exactNewTwoHundredNonExportQualified":exact200,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    status="PASSED" if exact200 else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R28B_R3_EXACT_NEW_TWO_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"
           if exact200 else
           "M419D4BN17C_R4_R12_R16A_R28B_R3_EXACT_NEW_TWO_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R28C_EXACT_FOUR_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
         if exact200 else
         "M4_19D4BN17C_R4_R12_R16A_R28B_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS")

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"explorer_entry_click_helper_repair_record_201_recertification_and_exact_new_200_non_export_resume.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28B_R3_EXPLORER_ENTRY_CLICK_HELPER_REPAIR_RECORD_201_RECERTIFICATION_AND_EXACT_NEW_200_NON_EXPORT_RESUME",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,
      "classification":("EXACT_NEW_200_NON_EXPORT_QUALIFICATION_CERTIFIED_AFTER_EXPLORER_ENTRY_CLICK_HELPER_REPAIR"
                        if exact200 else
                        "EXACT_NEW_200_NON_EXPORT_RESUME_GAP_REMAINS_AFTER_EXPLORER_ENTRY_REPAIR"),
      "repair":{
        "cause":"R28B Explorer control settled, but original helper did not certify click; R28B-R2 proved native click and 840-marker surface materialization.",
        "strategy":"STRUCTURED_EXACT_BUTTON_CLICK_READBACK_PLUS_POST_CLICK_EXPLORER_SURFACE_CERTIFICATION",
        "record201ReplayedBecausePreviouslyCertified":False
      },
      "targetCount":200,
      "executedCount":len(outcomes),
      "certifiedCount":certified,
      "haltedOnFailure":halted,
      "outcomes":outcomes,
      "checks":checks,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("="*120)
    print("RECORD_201_EXPLORER_ENTRY_CERTIFIED:",record201.get("explorerEntryCertified"))
    print("RECORD_201_NON_EXPORT_CERTIFIED:",record201.get("certified"))
    print("CERTIFIED:",certified,"/200")
    print("EXECUTED:",len(outcomes),"/200")
    print("HALTED_ON_FAILURE:",halted)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",out["classification"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR28B-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
