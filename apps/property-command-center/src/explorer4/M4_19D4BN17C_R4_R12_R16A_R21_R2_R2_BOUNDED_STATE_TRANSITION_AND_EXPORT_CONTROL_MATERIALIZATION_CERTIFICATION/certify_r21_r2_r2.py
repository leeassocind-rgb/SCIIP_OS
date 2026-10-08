#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_BOUNDED_STATE_TRANSITION_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFICATION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R2_R1_SOURCE_ROUTE_TO_LIVE_NAVIGATION_BINDING_RESOLUTION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def get(url):
    try:
        with urllib.request.urlopen(url,timeout=2) as r:
            return r.read().decode("utf-8","ignore")
    except:
        return None

def ws_targets(port=9333):
    try:
        x=get(f"http://127.0.0.1:{port}/json")
        return json.loads(x) if x else []
    except:
        return []

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:
            raise RuntimeError(f"bad websocket url: {u!r}")
        host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),timeout=5)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode())
        b=b""
        while b"\r\n\r\n" not in b:
            b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:
            raise RuntimeError("websocket handshake failed")
        self.i=0
    def send(self,obj):
        payload=json.dumps(obj).encode(); mask=os.urandom(4); n=len(payload)
        h=bytearray([0x81])
        if n<126:
            h.append(0x80|n)
        elif n<65536:
            h.extend([0x80|126]);h.extend(struct.pack("!H",n))
        else:
            h.extend([0x80|127]);h.extend(struct.pack("!Q",n))
        masked=bytes(b^mask[i%4] for i,b in enumerate(payload))
        self.s.sendall(bytes(h)+mask+masked)
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        b1,b2=h;n=b2&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b2&128 else None
        data=b""
        while len(data)<n:
            data+=self.s.recv(n-len(data))
        if mask:
            data=bytes(b^mask[i%4] for i,b in enumerate(data))
        if (b1&15)==1:
            try:return json.loads(data.decode())
            except:return None
        return None
    def call(self,method,params=None):
        self.i+=1
        i=self.i
        self.send({"id":i,"method":method,"params":params or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:
                return x

def evaluate(w,expr):
    r=w.call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result") or {}).get("result") or {}).get("value")

PRE=r"""(() => {
 const txt=(document.body?.innerText||"");
 const els=[...document.querySelectorAll("button,a,[role=button]")];
 const candidates=els.map((el,i)=>({
   i,tag:el.tagName,text:(el.innerText||el.textContent||"").trim(),
   aria:el.getAttribute("aria-label")||"",title:el.getAttribute("title")||"",
   disabled:!!el.disabled,visible:!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length),
   cls:el.className||""
 })).filter(x=>x.visible);
 const exact=candidates.filter(x=>/^Generate Client Listing Report$/i.test(x.text));
 const exports=candidates.filter(x=>/^(Export|Download Client Listing Report)$/i.test(x.text) ||
   /Download Client Listing Report/i.test([x.text,x.aria,x.title].join(" ")));
 return {href:location.href,bodyHasAssignment:/Assignment/i.test(txt),
   exactGenerateControls:exact,exportControls:exports};
})()"""

CLICK=r"""(() => {
 const els=[...document.querySelectorAll("button")].filter(el=>!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length));
 const exact=els.filter(el=>/^Generate Client Listing Report$/i.test((el.innerText||el.textContent||"").trim()) && !el.disabled);
 if(exact.length!==1) return {clicked:false,reason:"EXACT_GENERATE_CONTROL_COUNT_"+exact.length,count:exact.length};
 exact[0].click();
 return {clicked:true,text:(exact[0].innerText||exact[0].textContent||"").trim(),className:exact[0].className||""};
})()"""

POST=r"""(() => {
 const txt=(document.body?.innerText||"");
 const els=[...document.querySelectorAll("button,a,[role=button]")];
 const controls=els.map((el,i)=>({
   i,tag:el.tagName,text:(el.innerText||el.textContent||"").trim(),
   aria:el.getAttribute("aria-label")||"",title:el.getAttribute("title")||"",
   disabled:!!el.disabled,visible:!!(el.offsetWidth||el.offsetHeight||el.getClientRects().length),
   cls:el.className||""
 })).filter(x=>x.visible && /export|download client listing report/i.test([x.text,x.aria,x.title].join(" ")));
 return {
   href:location.href,
   bodyHasInstitutionalReportReview:/Institutional Report|Client Listing Report/i.test(txt),
   bodyHasDownloadClientListingReport:/Download Client Listing Report/i.test(txt),
   controls
 };
})()"""

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    pp=ev/PREV/"source_route_to_live_navigation_binding_resolution.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_R1_EVIDENCE_REQUIRED")
        return 4
    prev=loadj(pp)
    expected="SOURCE_STATE_MOUNT_OWNER_AND_LIVE_NAVIGATION_CONTROL_BINDING_RESOLVED"
    if prev.get("status")!="PASSED" or prev.get("classification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_R1_STATE_OWNER_AND_LIVE_BINDING_REQUIRED")
        return 5

    owner=app/"src/broker-product/ListingAssignmentProductionHouse.jsx"
    report=app/"src/broker-product/InstitutionalReportReview.jsx"
    if not owner.exists() or not report.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_SOURCE_OWNER_FILES_MISSING")
        return 6

    osrc=owner.read_text(errors="ignore")
    rsrc=report.read_text(errors="ignore")
    source_state_contract=bool(re.search(r'\[\s*showReportReview\s*,\s*setShowReportReview\s*\]\s*=\s*(?:React\.)?useState\s*\(\s*false\s*\)',osrc))
    source_generate_contract=bool(re.search(
        r'onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*setShowReportReview\s*\(\s*true\s*\)\s*\}[^>]*>.*?Generate Client Listing Report',
        osrc,re.S|re.I))
    source_mount_contract=bool(re.search(r'showReportReview\s*&&[\s\S]{0,3000}<InstitutionalReportReview\b',osrc,re.I))
    source_export_contract=bool(re.search(
        r'onClick\s*=\s*\{[^}]*exportReport[^}]*\}[\s\S]{0,1000}Download Client Listing Report',
        rsrc,re.S|re.I))

    targets=ws_targets(9333)
    pages=[t for t in targets if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    if not pages:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: LIVE_CDP_TARGET_REQUIRED")
        return 7

    w=WS(pages[0]["webSocketDebuggerUrl"])
    w.call("Runtime.enable")
    before=evaluate(w,PRE) or {}
    exact_before=before.get("exactGenerateControls") or []

    if len(exact_before)!=1:
        status="DIAGNOSTIC_COMPLETE"
        cls="EXACT_GENERATE_CLIENT_LISTING_REPORT_CONTROL_NOT_UNIQUELY_MATERIALIZED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R1_ASSIGNMENT_WORKSPACE_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_DIAGNOSIS"
        click_result={"clicked":False,"reason":"PRECONDITION_EXACT_CONTROL_NOT_UNIQUE"}
        after={}
    else:
        click_result=evaluate(w,CLICK) or {}
        time.sleep(0.5)
        after=evaluate(w,POST) or {}
        controls=after.get("controls") or []
        exact_export=[
            x for x in controls
            if re.search(
                r'Download Client Listing Report',
                (x.get("text","")+" "+x.get("aria","")+" "+x.get("title","")),
                re.I
            )
        ]
        export_visible=any(x.get("visible") for x in exact_export)

        if click_result.get("clicked") and after.get("bodyHasInstitutionalReportReview") and export_visible:
            status="PASSED"
            cls="BOUNDED_SHOW_REPORT_REVIEW_STATE_TRANSITION_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFIED"
            nxt="M4_19D4BN17C_R4_R12_R16A_R21_R3_EXPORT_CONTROL_NON_INVOCATIVE_EVENT_BINDING_AND_POST_CLICK_GUARD_DESIGN"
        else:
            status="DIAGNOSTIC_COMPLETE"
            cls="SHOW_REPORT_REVIEW_STATE_TRANSITION_EXECUTED_EXPORT_CONTROL_MATERIALIZATION_INCOMPLETE"
            nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R1_REPORT_REVIEW_MOUNT_AND_EXPORT_CONTROL_RENDER_DIAGNOSIS"

    controls_after=after.get("controls") or []
    exact_after=[
        x for x in controls_after
        if re.search(
            r'Download Client Listing Report',
            (x.get("text","")+" "+x.get("aria","")+" "+x.get("title","")),
            re.I
        )
    ]
    export_visible=any(x.get("visible") for x in exact_after)
    export_enabled=any(x.get("visible") and not x.get("disabled") for x in exact_after)

    checks={
        "r21R2R1Passed":True,
        "exactSourceStateContractResolved":source_state_contract,
        "exactGenerateControlSourceContractResolved":source_generate_contract,
        "exactReportReviewMountContractResolved":source_mount_contract,
        "exactExportControlSourceContractResolved":source_export_contract,
        "exactGenerateControlUniqueBeforeAction":len(exact_before)==1,
        "boundedStateTransitionOnly":True,
        "exportControlInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "pixelEvidenceOff":True
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"bounded_state_transition_and_export_control_materialization_certification.json"
    data={
        "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R21_R2_R2_BOUNDED_STATE_TRANSITION_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":"M419D4BN17C_R4_R12_R16A_R21_R2_R2_BOUNDED_STATE_TRANSITION_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFIED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R2_R2_MATERIALIZATION_INCOMPLETE",
        "r21R2R1Classification":prev.get("classification"),
        "sourceContracts":{
            "state":source_state_contract,
            "generateControl":source_generate_contract,
            "mount":source_mount_contract,
            "exportControl":source_export_contract
        },
        "before":before,
        "stateTransition":click_result,
        "after":after,
        "exportControlVisible":export_visible,
        "exportControlEnabled":export_enabled,
        "classification":cls,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "pixelEvidence":False,
            "stateTransitionAuthority":"BOUNDED_SINGLE_GENERATE_CLIENT_LISTING_REPORT_CLICK_ONLY",
            "exportControlInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R2-R2 Bounded State Transition + Export Control Materialization Certification")
    print("="*120)
    print("R21_R2_R1_CLASSIFICATION:",prev.get("classification"))
    print("SOURCE_STATE_CONTRACT:",source_state_contract)
    print("SOURCE_GENERATE_CONTROL_CONTRACT:",source_generate_contract)
    print("SOURCE_MOUNT_CONTRACT:",source_mount_contract)
    print("SOURCE_EXPORT_CONTROL_CONTRACT:",source_export_contract)
    print("EXACT_GENERATE_CONTROL_COUNT_BEFORE:",len(exact_before))
    print("STATE_TRANSITION:",json.dumps(click_result))
    print("REPORT_REVIEW_VISIBLE_AFTER:",after.get("bodyHasInstitutionalReportReview"))
    print("EXPORT_CONTROL_VISIBLE_AFTER:",export_visible)
    print("EXPORT_CONTROL_ENABLED_AFTER:",export_enabled)
    print("CLASSIFICATION:",cls)

    print("\n----- EXPORT CONTROLS AFTER -----")
    for x in controls_after:
        print(json.dumps(x))

    print("\n----- CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",data["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
