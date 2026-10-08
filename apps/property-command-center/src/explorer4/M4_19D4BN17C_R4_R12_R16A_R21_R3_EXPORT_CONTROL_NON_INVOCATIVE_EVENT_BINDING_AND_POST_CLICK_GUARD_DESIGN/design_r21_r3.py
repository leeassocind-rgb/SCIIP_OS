#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R12_R16A_R21_R3_EXPORT_CONTROL_NON_INVOCATIVE_EVENT_BINDING_AND_POST_CLICK_GUARD_DESIGN"
PREV="M4_19D4BN17C_R4_R12_R16A_R21_R2_R2_R4_BOUNDED_REPORT_REVIEW_ENTRY_AND_EXPORT_CONTROL_MATERIALIZATION_CERTIFICATION"

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

def compact(s,n=9000):
    return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    pp=evid/PREV/"bounded_report_review_entry_and_export_control_materialization_certification.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R21_R2_R2_R4_EVIDENCE_REQUIRED")
        return 4

    prev=loadj(pp)
    expected="BOUNDED_REPORT_REVIEW_ENTRY_CERTIFIED_EXPORT_CONTROL_MATERIALIZED"
    if prev.get("status")!="PASSED" or prev.get("classification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CERTIFIED_EXPORT_CONTROL_MATERIALIZATION_REQUIRED")
        return 5

    report=app/"src/broker-product/InstitutionalReportReview.jsx"
    engine=app/"src/product-realism/assignment/institutionalReportEngine.js"

    if not report.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: INSTITUTIONAL_REPORT_REVIEW_SOURCE_REQUIRED")
        return 6

    rsrc=report.read_text(errors="ignore")

    # Source binding around exact control.
    exact_control_hits=[]
    for m in re.finditer(r'Download Client Listing Report',rsrc,re.I):
        window=rsrc[max(0,m.start()-5000):min(len(rsrc),m.start()+5000)]
        handler_names=[]
        for hm in re.finditer(r'onClick\s*=\s*\{\s*([A-Za-z_$][\w$]*)\s*\}',window):
            handler_names.append(hm.group(1))
        exact_control_hits.append({
            "line":rsrc.count("\n",0,m.start())+1,
            "handlerCandidates":handler_names,
            "snippet":compact(window)
        })

    handler_defs=[]
    for name in sorted(set(x for hit in exact_control_hits for x in hit["handlerCandidates"])):
        patterns=[
            re.compile(rf'const\s+{re.escape(name)}\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>\s*\{{([\s\S]*?)\n\}}'),
            re.compile(rf'function\s+{re.escape(name)}\s*\(([^)]*)\)\s*\{{([\s\S]*?)\n\}}')
        ]
        for pat in patterns:
            m=pat.search(rsrc)
            if m:
                body=m.group(2)
                handler_defs.append({
                    "name":name,
                    "params":m.group(1),
                    "line":rsrc.count("\n",0,m.start())+1,
                    "callsExportReport":"exportReport" in body,
                    "downloadSignals":bool(re.search(r'Blob|URL\.createObjectURL|download|href|click\(',body,re.I)),
                    "returnSignals":re.findall(r'return\s+([^;\n]+)',body)[:20],
                    "snippet":compact(body,12000)
                })
                break

    # Direct exportReport source definition / imported engine role.
    export_report_refs=[]
    for m in re.finditer(r'\bexportReport\b',rsrc):
        export_report_refs.append({
            "line":rsrc.count("\n",0,m.start())+1,
            "snippet":compact(rsrc[max(0,m.start()-1800):m.start()+2600],4500)
        })

    engine_info={}
    if engine.exists():
        esrc=engine.read_text(errors="ignore")
        engine_info={
            "file":str(engine.relative_to(app)),
            "hasExportReport":"exportReport" in esrc,
            "exportReportDefinitionCount":len(re.findall(r'\bexportReport\b',esrc)),
            "blobSignal":bool(re.search(r'Blob|data:|text/csv|application/pdf|application/json',esrc,re.I)),
            "filenameSignal":bool(re.search(r'fileName|filename|download',esrc,re.I))
        }

    # Live exact control handler metadata without invocation.
    pages=[t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    live={}
    if pages:
        w=WS(pages[0]["webSocketDebuggerUrl"])
        w.call("Runtime.enable")
        live=evaluate(w,r"""(() => {
          const xs=[...document.querySelectorAll('button')].filter(el =>
            el.offsetParent!==null &&
            (el.innerText||el.textContent||'').trim()==='Download Client Listing Report'
          );
          return {
            count:xs.length,
            controls:xs.map((el,i)=>{
              const propsKey=Object.keys(el).find(k=>k.startsWith('__reactProps$'));
              const props=propsKey?el[propsKey]:null;
              const f=props&&props.onClick;
              return {
                i,text:(el.innerText||el.textContent||'').trim(),disabled:!!el.disabled,
                cls:String(el.className||''),propsKey:propsKey||null,
                hasOnClick:typeof f==='function',
                handlerName:typeof f==='function'?(f.name||'anonymous'):null,
                handlerLength:typeof f==='function'?f.length:null,
                handlerSource:typeof f==='function'?String(f).slice(0,5000):null
              };
            })
          };
        })()""") or {}

    controls=live.get("controls") or []
    exact_live_unique=live.get("count")==1
    live_handler=controls[0] if len(controls)==1 else {}
    live_handler_bound=bool(live_handler.get("hasOnClick"))

    # Guard design: observe only signals that can prove a future export action.
    guard_contract={
        "preconditions":[
            "exactly one visible enabled Download Client Listing Report button",
            "InstitutionalReportReview visible",
            "source handler binding resolved",
            "live React onClick binding resolved"
        ],
        "beforeSnapshot":[
            "URL","body length","visible report-review state",
            "existing download anchors","existing blob/object URLs if observable",
            "console/runtime exception baseline"
        ],
        "postClickSuccessSignals":[
            "handler returns without exception",
            "download/anchor/object-URL or explicit export-return signal observed",
            "report-review remains mounted",
            "Explorer shell remains mounted"
        ],
        "failureSignals":[
            "uncaught exception","control count changes unexpectedly",
            "report-review unmounts unexpectedly","navigation leaves SCIIP origin",
            "no export-specific signal"
        ],
        "authorityPolicy":{
            "singleExactExportClickOnly":True,
            "strictSequential":True,
            "haltOnFirstFailure":True,
            "readAfterActionRequired":True,
            "networkAuthorityOff":True,
            "applicationMutationOff":True,
            "governedMutationOff":True,
            "pixelEvidenceOff":True
        }
    }

    source_binding_resolved=bool(exact_control_hits and handler_defs and any(x["callsExportReport"] for x in handler_defs))
    if exact_live_unique and live_handler_bound and source_binding_resolved:
        cls="EXACT_EXPORT_CONTROL_SOURCE_AND_LIVE_EVENT_BINDING_RESOLVED_GUARDED_INVOCATION_DESIGN_CERTIFIED"
        status="PASSED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R4_SINGLE_RECORD_GUARDED_EXPORT_INVOCATION_CERTIFICATION"
    elif exact_live_unique and source_binding_resolved:
        cls="EXACT_EXPORT_CONTROL_SOURCE_BINDING_RESOLVED_LIVE_REACT_HANDLER_BINDING_PARTIAL"
        status="DIAGNOSTIC_COMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R3_R1_LIVE_REACT_EXPORT_HANDLER_INSTANCE_RESOLUTION"
    else:
        cls="EXPORT_CONTROL_EVENT_BINDING_RESOLUTION_INCOMPLETE"
        status="DIAGNOSTIC_COMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R21_R3_R1_EXPORT_HANDLER_SOURCE_LIVE_PARITY_DIAGNOSIS"

    checks={
        "r21R2R2R4Passed":prev.get("status")=="PASSED",
        "materializedExportControlClassificationConsumed":True,
        "exactExportControlSourceInspected":True,
        "exportHandlerDefinitionsResolved":bool(handler_defs),
        "sourceExportReportBindingResolved":source_binding_resolved,
        "liveExactExportControlInspected":bool(pages),
        "liveExactExportControlUnique":exact_live_unique,
        "liveReactOnClickBindingResolved":live_handler_bound,
        "guardContractDefined":True,
        "exportControlInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    out=evid/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"export_control_non_invocative_event_binding_and_post_click_guard_design.json"

    data={
        "framework":"SCIIP_EXPLORER_4_R21_R3_EXPORT_CONTROL_NON_INVOCATIVE_EVENT_BINDING_AND_POST_CLICK_GUARD_DESIGN",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":"M419D4BN17C_R4_R12_R16A_R21_R3_EXPORT_CONTROL_EVENT_BINDING_AND_GUARD_DESIGN_CERTIFIED" if status=="PASSED" else "M419D4BN17C_R4_R12_R16A_R21_R3_EVENT_BINDING_INCOMPLETE",
        "priorClassification":prev.get("classification"),
        "exactControlSourceHitCount":len(exact_control_hits),
        "exactControlSourceHits":exact_control_hits[:20],
        "handlerDefinitionCount":len(handler_defs),
        "handlerDefinitions":handler_defs[:20],
        "exportReportReferenceCount":len(export_report_refs),
        "exportReportReferences":export_report_refs[:50],
        "engineInfo":engine_info,
        "cdpTargetAvailable":bool(pages),
        "liveControl":live,
        "sourceBindingResolved":source_binding_resolved,
        "liveHandlerBound":live_handler_bound,
        "guardContract":guard_contract,
        "classification":cls,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "exportControlInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R21-R3 Export Control Non-Invocative Event Binding + Post-Click Guard Design")
    print("="*120)
    print("R21_R2_R2_R4_CLASSIFICATION:",prev.get("classification"))
    print("EXACT_CONTROL_SOURCE_HIT_COUNT:",len(exact_control_hits))
    print("HANDLER_DEFINITION_COUNT:",len(handler_defs))
    print("SOURCE_EXPORT_REPORT_BINDING_RESOLVED:",source_binding_resolved)
    print("CDP_TARGET_AVAILABLE:",bool(pages))
    print("LIVE_EXACT_EXPORT_CONTROL_COUNT:",live.get("count"))
    print("LIVE_REACT_ONCLICK_BINDING_RESOLVED:",live_handler_bound)
    print("CLASSIFICATION:",cls)

    print("\n----- SOURCE HANDLERS -----")
    for x in handler_defs:
        print(json.dumps(x))

    print("\n----- LIVE EXPORT CONTROL -----")
    for x in controls:
        print(json.dumps(x))

    print("\n----- GUARD CONTRACT -----")
    print(json.dumps(guard_contract,indent=2))

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
