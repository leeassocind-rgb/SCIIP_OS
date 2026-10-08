#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R4_BOUNDED_REPORT_REVIEW_ENTRY_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFICATION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R3_BOUNDED_ASSIGNMENTS_ENTRY_AND_GENERATE_CONTROL_MATERIALIZATION_CERTIFICATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def get(url):
    try:
        with urllib.request.urlopen(url, timeout=2) as r:
            return r.read().decode("utf-8","ignore")
    except:
        return None

def targets():
    try:
        return json.loads(get("http://127.0.0.1:9333/json") or "[]")
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
        payload=json.dumps(obj).encode()
        mask=os.urandom(4)
        n=len(payload)
        h=bytearray([0x81])
        if n<126:
            h.append(0x80|n)
        elif n<65536:
            h.extend([0x80|126]); h.extend(struct.pack("!H",n))
        else:
            h.extend([0x80|127]); h.extend(struct.pack("!Q",n))
        masked=bytes(b^mask[i%4] for i,b in enumerate(payload))
        self.s.sendall(bytes(h)+mask+masked)

    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        b1,b2=h
        n=b2&127
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

BEFORE=r"""(() => ({
  url: location.href,
  generateControls: [...document.querySelectorAll('button')].filter(el =>
    el.offsetParent!==null &&
    !el.disabled &&
    (el.innerText||el.textContent||'').trim()==='Generate Client Listing Report'
  ).map((el,i)=>({i,text:(el.innerText||el.textContent||'').trim(),cls:String(el.className||''),disabled:!!el.disabled})),
  exportControls: [...document.querySelectorAll('button,a,[role=button]')].filter(el =>
    el.offsetParent!==null &&
    /export|download client listing report/i.test([
      (el.innerText||el.textContent||'').trim(),
      el.getAttribute('aria-label')||'',
      el.getAttribute('title')||''
    ].join(' '))
  ).map((el,i)=>({i,tag:el.tagName,text:(el.innerText||el.textContent||'').trim(),aria:el.getAttribute('aria-label')||'',title:el.getAttribute('title')||'',disabled:!!el.disabled,cls:String(el.className||'')})),
  brookfield:/Brookfield/i.test(document.body.innerText||''),
  productionHouse:/Client production house/i.test(document.body.innerText||'')
}))()"""

CLICK=r"""(() => {
  const xs=[...document.querySelectorAll('button')].filter(el =>
    el.offsetParent!==null &&
    !el.disabled &&
    (el.innerText||el.textContent||'').trim()==='Generate Client Listing Report'
  );
  if(xs.length!==1) return {clicked:false,reason:'PRECONDITION_EXACT_GENERATE_CONTROL_NOT_UNIQUE',count:xs.length};
  xs[0].click();
  return {clicked:true,count:1,text:(xs[0].innerText||xs[0].textContent||'').trim(),cls:String(xs[0].className||'')};
})()"""

AFTER=r"""(() => {
  const body=document.body.innerText||'';
  const all=[...document.querySelectorAll('button,a,[role=button]')];
  const semantic=all.filter(el => el.offsetParent!==null && /export|download client listing report/i.test([
    (el.innerText||el.textContent||'').trim(),
    el.getAttribute('aria-label')||'',
    el.getAttribute('title')||''
  ].join(' '))).map((el,i)=>({
    i,tag:el.tagName,text:(el.innerText||el.textContent||'').trim(),
    aria:el.getAttribute('aria-label')||'',title:el.getAttribute('title')||'',
    disabled:!!el.disabled,visible:true,cls:String(el.className||'')
  }));
  const exactExport=semantic.filter(x =>
    /^(Export|Export Report|Download Client Listing Report)$/i.test(x.text) ||
    /Download Client Listing Report/i.test([x.text,x.aria,x.title].join(' '))
  );
  return {
    url:location.href,
    institutionalReportReviewVisible:/Institutional Report|Client Listing Report/i.test(body),
    reportReviewSignals:{
      clientListingReport:/Client Listing Report/i.test(body),
      institutionalReport:/Institutional Report/i.test(body),
      reportReview:/Report Review|Review Report/i.test(body)
    },
    semanticControls:semantic,
    exactExportControls:exactExport,
    bodySample:body.slice(0,18000)
  };
})()"""

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    pp=evid/PREV/"bounded_assignments_entry_and_generate_control_materialization_certification.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_R2_R3_EVIDENCE_REQUIRED")
        return 4
    prev=loadj(pp)
    expected="BOUNDED_ASSIGNMENTS_ENTRY_CERTIFIED_GENERATE_CLIENT_LISTING_REPORT_CONTROL_MATERIALIZED"
    if prev.get("status")!="PASSED" or prev.get("classification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_R2_R3_GENERATE_CONTROL_MATERIALIZATION_CERTIFICATION_REQUIRED")
        return 5

    # Exact source contract recertification before allowing the one click.
    owner=app/"src/broker-product/ListingAssignmentProductionHouse.jsx"
    report=app/"src/broker-product/InstitutionalReportReview.jsx"
    if not owner.exists() or not report.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REQUIRED_SOURCE_FILES_MISSING")
        return 6

    osrc=owner.read_text(errors="ignore")
    rsrc=report.read_text(errors="ignore")
    source_generate_binding=bool(re.search(
        r'onClick\s*=\s*\{\s*\(\s*\)\s*=>\s*setShowReportReview\s*\(\s*true\s*\)\s*\}[^>]*>.*?Generate Client Listing Report',
        osrc,re.S|re.I
    ))
    source_mount_gate=bool(re.search(
        r'showReportReview\s*&&[\s\S]{0,3000}<InstitutionalReportReview\b',
        osrc,re.I
    ))
    source_export_binding=bool(re.search(
        r'onClick\s*=\s*\{[^}]*exportReport[^}]*\}[\s\S]{0,1200}Download Client Listing Report',
        rsrc,re.S|re.I
    ))

    pages=[t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    if not pages:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CDP_TARGET_REQUIRED")
        return 7

    w=WS(pages[0]["webSocketDebuggerUrl"])
    w.call("Runtime.enable")
    before=evaluate(w,BEFORE) or {}
    gen=before.get("generateControls") or []

    if len(gen)!=1 or not source_generate_binding or not source_mount_gate or not source_export_binding:
        action={"clicked":False,"reason":"EXACT_SOURCE_OR_LIVE_PRECONDITION_FAILED","liveGenerateCount":len(gen)}
        after={}
        status="DIAGNOSTIC_COMPLETE"
        cls="REPORT_REVIEW_ENTRY_PRECONDITION_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R4_R1_REPORT_REVIEW_ENTRY_PRECONDITION_RECERTIFICATION"
    else:
        action=evaluate(w,CLICK) or {}
        time.sleep(.8)
        after=evaluate(w,AFTER) or {}
        exact=(after.get("exactExportControls") or [])
        export_visible=any(x.get("visible") for x in exact)
        export_enabled=any(x.get("visible") and not x.get("disabled") for x in exact)

        if action.get("clicked") and after.get("institutionalReportReviewVisible") and export_visible:
            status="PASSED"
            cls="BOUNDED_REPORT_REVIEW_ENTRY_CERTIFIED_EXPORT_CONTROL_MATERIALIZED"
            nxt="M4_19D4BN17C_R4_R12_R16A_R21_R3_EXPORT_CONTROL_NON_INVOCATIVE_EVENT_BINDING_AND_POST_CLICK_GUARD_DESIGN"
        elif action.get("clicked") and after.get("institutionalReportReviewVisible"):
            status="DIAGNOSTIC_COMPLETE"
            cls="REPORT_REVIEW_ENTRY_CERTIFIED_EXPORT_CONTROL_NOT_MATERIALIZED"
            nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R4_R1_EXPORT_CONTROL_RENDER_GATE_DIAGNOSIS"
        else:
            status="DIAGNOSTIC_COMPLETE"
            cls="REPORT_REVIEW_STATE_TRANSITION_EXECUTED_MOUNT_INCOMPLETE"
            nxt="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R4_R1_REPORT_REVIEW_MOUNT_STATE_DIAGNOSIS"

    exact_after=(after.get("exactExportControls") or [])
    export_visible=any(x.get("visible") for x in exact_after)
    export_enabled=any(x.get("visible") and not x.get("disabled") for x in exact_after)

    checks={
        "r21R2R2R3Passed":prev.get("status")=="PASSED",
        "generateControlMaterializationClassificationConsumed":True,
        "exactGenerateSourceBindingResolved":source_generate_binding,
        "exactReportReviewMountGateResolved":source_mount_gate,
        "exactExportSourceBindingResolved":source_export_binding,
        "exactGenerateControlUniqueBeforeAction":len(gen)==1,
        "singleBoundedGenerateClickOnly":bool(action.get("clicked")),
        "reportReviewReadbackRequired":True,
        "exportControlReadbackRequired":True,
        "exportControlInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "pixelEvidenceOff":True
    }

    out=evid/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"bounded_report_review_entry_and_export_control_materialization_certification.json"
    data={
        "framework":"SCIIP_EXPLORER_4_R21_R2_R2_R4_BOUNDED_REPORT_REVIEW_ENTRY_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":"M419D4BN17C_R4_R12_R16A_R21_R2_R2_R4_BOUNDED_REPORT_REVIEW_ENTRY_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFIED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R2_R2_R4_EXPORT_CONTROL_MATERIALIZATION_INCOMPLETE",
        "priorClassification":prev.get("classification"),
        "sourceContracts":{
            "generateBinding":source_generate_binding,
            "reportReviewMountGate":source_mount_gate,
            "exportBinding":source_export_binding
        },
        "before":before,
        "stateTransition":action,
        "after":after,
        "exportControlVisible":export_visible,
        "exportControlEnabled":export_enabled,
        "classification":cls,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "pixelEvidence":False,
            "reportReviewEntryInvocation":"SINGLE_EXACT_GENERATE_CLIENT_LISTING_REPORT_CLICK_ONLY",
            "exportControlInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R2-R2-R4 Bounded Report Review Entry + Export Control Materialization Certification")
    print("="*120)
    print("R21_R2_R2_R3_CLASSIFICATION:",prev.get("classification"))
    print("SOURCE_GENERATE_BINDING:",source_generate_binding)
    print("SOURCE_REPORT_REVIEW_MOUNT_GATE:",source_mount_gate)
    print("SOURCE_EXPORT_BINDING:",source_export_binding)
    print("EXACT_GENERATE_CONTROL_COUNT_BEFORE:",len(gen))
    print("STATE_TRANSITION:",json.dumps(action))
    print("REPORT_REVIEW_VISIBLE_AFTER:",after.get("institutionalReportReviewVisible"))
    print("EXACT_EXPORT_CONTROL_COUNT_AFTER:",len(exact_after))
    print("EXPORT_CONTROL_VISIBLE_AFTER:",export_visible)
    print("EXPORT_CONTROL_ENABLED_AFTER:",export_enabled)
    print("CLASSIFICATION:",cls)

    print("\n----- EXPORT CONTROLS AFTER -----")
    for x in exact_after:
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
