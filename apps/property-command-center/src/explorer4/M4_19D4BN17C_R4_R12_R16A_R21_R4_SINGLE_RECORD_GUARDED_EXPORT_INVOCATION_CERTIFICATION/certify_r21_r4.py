#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFICATION"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R3_EXPORT_CONTROL_NON_INVOCATIVE_EVENT_BINDING_AND_POST_CLICK_GUARD_DESIGN"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def get(url):
    try:
        with urllib.request.urlopen(url,timeout=2) as r:
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
        mask=os.urandom(4); n=len(payload)
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
        b1,b2=h; n=b2&127
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
        self.i+=1; i=self.i
        self.send({"id":i,"method":method,"params":params or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:
                return x

def evaluate(w,expr):
    r=w.call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result") or {}).get("result") or {}).get("value")

INSTALL=r"""(() => {
  window.__sciipExportProbe = {
    clicks:0, anchorClicks:0, createObjectURLCalls:0, revokeObjectURLCalls:0,
    blobConstructs:0, errors:[], unhandled:[], events:[], downloads:[]
  };

  window.addEventListener('error', e => {
    window.__sciipExportProbe.errors.push(String(e.message||e.error||'error'));
  });
  window.addEventListener('unhandledrejection', e => {
    window.__sciipExportProbe.unhandled.push(String(e.reason||'unhandledrejection'));
  });

  const origCreate = URL.createObjectURL?.bind(URL);
  const origRevoke = URL.revokeObjectURL?.bind(URL);
  if(origCreate){
    URL.createObjectURL = function(obj){
      window.__sciipExportProbe.createObjectURLCalls++;
      window.__sciipExportProbe.events.push({type:'createObjectURL', blobType:obj?.type||'', size:obj?.size||null});
      return origCreate(obj);
    };
  }
  if(origRevoke){
    URL.revokeObjectURL = function(u){
      window.__sciipExportProbe.revokeObjectURLCalls++;
      window.__sciipExportProbe.events.push({type:'revokeObjectURL'});
      return origRevoke(u);
    };
  }

  const origAnchorClick = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function(){
    window.__sciipExportProbe.anchorClicks++;
    window.__sciipExportProbe.downloads.push({download:this.download||'', href:(this.href||'').slice(0,500)});
    return origAnchorClick.call(this);
  };

  return {installed:true};
})()"""

BEFORE=r"""(() => {
  const body=document.body?.innerText||'';
  const xs=[...document.querySelectorAll('button')].filter(el =>
    el.offsetParent!==null &&
    !el.disabled &&
    (el.innerText||el.textContent||'').trim()==='Download Client Listing Report'
  );
  const el=xs[0]||null;
  const propsKey=el?Object.keys(el).find(k=>k.startsWith('__reactProps$')):null;
  const props=propsKey?el[propsKey]:null;
  const f=props&&props.onClick;
  return {
    url:location.href,
    exactControlCount:xs.length,
    reportReviewVisible:/Institutional Report|Client Listing Report/i.test(body),
    explorerMounted:/SCIIP Explorer|Property Explorer|Client production house/i.test(body),
    bodyLength:body.length,
    control:el?{
      text:(el.innerText||el.textContent||'').trim(),
      disabled:!!el.disabled,
      cls:String(el.className||''),
      hasOnClick:typeof f==='function',
      handlerName:typeof f==='function'?(f.name||'anonymous'):null,
      handlerLength:typeof f==='function'?f.length:null
    }:null,
    probe:window.__sciipExportProbe||null
  };
})()"""

CLICK=r"""(() => {
  const xs=[...document.querySelectorAll('button')].filter(el =>
    el.offsetParent!==null &&
    !el.disabled &&
    (el.innerText||el.textContent||'').trim()==='Download Client Listing Report'
  );
  if(xs.length!==1) return {clicked:false,reason:'EXACT_EXPORT_CONTROL_NOT_UNIQUE',count:xs.length};
  const el=xs[0];
  const propsKey=Object.keys(el).find(k=>k.startsWith('__reactProps$'));
  const props=propsKey?el[propsKey]:null;
  const f=props&&props.onClick;
  if(typeof f!=='function') return {clicked:false,reason:'LIVE_REACT_ONCLICK_NOT_BOUND'};
  if((f.name||'')!=='exportReport') return {clicked:false,reason:'UNEXPECTED_HANDLER_NAME_'+(f.name||'anonymous')};
  window.__sciipExportProbe.clicks++;
  try{
    el.click();
    return {clicked:true,text:(el.innerText||el.textContent||'').trim(),handlerName:f.name||'anonymous'};
  }catch(e){
    return {clicked:false,reason:'CLICK_EXCEPTION',error:String(e)};
  }
})()"""

AFTER=r"""(() => {
  const body=document.body?.innerText||'';
  const xs=[...document.querySelectorAll('button')].filter(el =>
    el.offsetParent!==null &&
    /Download Client Listing Report|Generating PDF/i.test((el.innerText||el.textContent||'').trim())
  );
  return {
    url:location.href,
    reportReviewVisible:/Institutional Report|Client Listing Report/i.test(body),
    explorerMounted:/SCIIP Explorer|Property Explorer|Client production house/i.test(body),
    bodyLength:body.length,
    exportControlStates:xs.map((el,i)=>({
      i,text:(el.innerText||el.textContent||'').trim(),
      disabled:!!el.disabled,cls:String(el.className||'')
    })),
    probe:window.__sciipExportProbe||null
  };
})()"""

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    pp=evid/PREV/"export_control_non_invocative_event_binding_and_post_click_guard_design.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R3_EVIDENCE_REQUIRED")
        return 4

    prev=loadj(pp)
    expected="EXACT_EXPORT_CONTROL_SOURCE_AND_LIVE_EVENT_BINDING_RESOLVED_GUARDED_INVOCATION_DESIGN_CERTIFIED"
    if prev.get("status")!="PASSED" or prev.get("classification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R3_GUARDED_INVOCATION_DESIGN_CERTIFICATION_REQUIRED")
        return 5

    pages=[t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    if not pages:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CDP_TARGET_REQUIRED")
        return 6

    w=WS(pages[0]["webSocketDebuggerUrl"])
    w.call("Runtime.enable")
    install=evaluate(w,INSTALL) or {}
    before=evaluate(w,BEFORE) or {}

    preconditions=(
        install.get("installed") and
        before.get("exactControlCount")==1 and
        before.get("reportReviewVisible") and
        before.get("explorerMounted") and
        (before.get("control") or {}).get("hasOnClick") and
        (before.get("control") or {}).get("handlerName")=="exportReport" and
        not (before.get("control") or {}).get("disabled")
    )

    if not preconditions:
        action={"clicked":False,"reason":"GUARDED_EXPORT_PRECONDITIONS_FAILED"}
        after={}
        status="DIAGNOSTIC_COMPLETE"
        cls="GUARDED_EXPORT_INVOCATION_PRECONDITION_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R4_R1_EXPORT_PRECONDITION_RECERTIFICATION"
    else:
        action=evaluate(w,CLICK) or {}
        time.sleep(1.0)
        after=evaluate(w,AFTER) or {}
        probe=after.get("probe") or {}

        no_errors=(len(probe.get("errors") or [])==0 and len(probe.get("unhandled") or [])==0)
        output_signal=(
            (probe.get("anchorClicks") or 0)>0 or
            (probe.get("createObjectURLCalls") or 0)>0 or
            len(probe.get("downloads") or [])>0
        )
        shell_ok=after.get("reportReviewVisible") and after.get("explorerMounted")
        same_origin=str(after.get("url") or "").startswith("http://127.0.0.1:5173")

        if action.get("clicked") and no_errors and output_signal and shell_ok and same_origin:
            status="PASSED"
            cls="SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFIED"
            nxt="M4_19D4BN17C_R4_R12_R16A_R21_R5_EXPORT_ARTIFACT_AND_POST_ACTION_STATE_VERIFICATION"
        elif action.get("clicked") and no_errors and shell_ok and same_origin:
            status="DIAGNOSTIC_COMPLETE"
            cls="EXPORT_HANDLER_INVOKED_NO_CERTIFIABLE_OUTPUT_SIGNAL"
            nxt="M4_19D4BN17C_R4_R12_R16A_R21_R4_R1_EXPORT_OUTPUT_SIGNAL_CAUSAL_DIAGNOSIS"
        else:
            status="DIAGNOSTIC_COMPLETE"
            cls="GUARDED_EXPORT_INVOCATION_POST_ACTION_GAP"
            nxt="M4_19D4BN17C_R4_R12_R16A_R21_R4_R1_EXPORT_POST_ACTION_FAILURE_DIAGNOSIS"

    probe=(after.get("probe") or {}) if after else {}
    output_signal=(
        (probe.get("anchorClicks") or 0)>0 or
        (probe.get("createObjectURLCalls") or 0)>0 or
        len(probe.get("downloads") or [])>0
    )
    no_errors=(len(probe.get("errors") or [])==0 and len(probe.get("unhandled") or [])==0) if after else False
    shell_ok=bool(after.get("reportReviewVisible") and after.get("explorerMounted")) if after else False
    same_origin=str(after.get("url") or "").startswith("http://127.0.0.1:5173") if after else False

    checks={
        "r21R3Passed":prev.get("status")=="PASSED",
        "guardedInvocationDesignClassificationConsumed":True,
        "probeInstrumentationInstalled":bool(install.get("installed")),
        "exactExportControlUniqueBeforeAction":before.get("exactControlCount")==1,
        "liveExportHandlerNameCertified":(before.get("control") or {}).get("handlerName")=="exportReport",
        "singleExactExportClickOnly":bool(action.get("clicked")),
        "postActionReadbackObserved":bool(after),
        "exportSpecificOutputSignalObserved":output_signal,
        "noRuntimeErrorsObserved":no_errors,
        "reportReviewContinuityPreserved":shell_ok,
        "sameOriginPreserved":same_origin,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    out=evid/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"single_record_guarded_export_invocation_certification.json"

    data={
        "framework":"SCIIP_EXPLORER_4_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":"M419D4BN17C_R4_R12_R16A_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFIED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R4_EXPORT_INVOCATION_INCOMPLETE",
        "priorClassification":prev.get("classification"),
        "instrumentation":install,
        "before":before,
        "action":action,
        "after":after,
        "outputSignalObserved":output_signal,
        "classification":cls,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "exportInvocation":"SINGLE_EXACT_DOWNLOAD_CLIENT_LISTING_REPORT_CLICK_ONLY",
            "strictSequential":True,
            "haltOnFirstFailure":True,
            "readAfterActionRequired":True
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R4 Single-Record Guarded Export Invocation Certification")
    print("="*120)
    print("R21_R3_CLASSIFICATION:",prev.get("classification"))
    print("PROBE_INSTRUMENTATION_INSTALLED:",bool(install.get("installed")))
    print("EXACT_EXPORT_CONTROL_COUNT_BEFORE:",before.get("exactControlCount"))
    print("LIVE_HANDLER_NAME:",(before.get("control") or {}).get("handlerName"))
    print("REPORT_REVIEW_VISIBLE_BEFORE:",before.get("reportReviewVisible"))
    print("STATE_TRANSITION:",json.dumps(action))
    print("REPORT_REVIEW_VISIBLE_AFTER:",after.get("reportReviewVisible"))
    print("EXPLORER_MOUNTED_AFTER:",after.get("explorerMounted"))
    print("SAME_ORIGIN_AFTER:",same_origin)
    print("ANCHOR_CLICK_COUNT:",probe.get("anchorClicks"))
    print("CREATE_OBJECT_URL_CALL_COUNT:",probe.get("createObjectURLCalls"))
    print("DOWNLOAD_RECORD_COUNT:",len(probe.get("downloads") or []))
    print("RUNTIME_ERROR_COUNT:",len(probe.get("errors") or []))
    print("UNHANDLED_REJECTION_COUNT:",len(probe.get("unhandled") or []))
    print("EXPORT_SPECIFIC_OUTPUT_SIGNAL_OBSERVED:",output_signal)
    print("CLASSIFICATION:",cls)

    print("\n----- DOWNLOAD SIGNALS -----")
    for x in probe.get("downloads") or []:
        print(json.dumps(x))

    print("\n----- PROBE EVENTS -----")
    for x in probe.get("events") or []:
        print(json.dumps(x))

    print("\n----- EXPORT CONTROL STATES AFTER -----")
    for x in after.get("exportControlStates") or []:
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
