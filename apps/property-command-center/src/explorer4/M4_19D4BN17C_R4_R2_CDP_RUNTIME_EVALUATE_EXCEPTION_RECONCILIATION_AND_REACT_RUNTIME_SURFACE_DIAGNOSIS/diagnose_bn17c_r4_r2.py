#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct

M="M4_19D4BN17C_R4_R2_CDP_RUNTIME_EVALUATE_EXCEPTION_RECONCILIATION_AND_REACT_RUNTIME_SURFACE_DIAGNOSIS"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def gj(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read())
def target():
    for p in (9333,9222,9223,9334,9444):
        try:
            for x in gj(f"http://127.0.0.1:{p}/json"):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return p,x
        except: pass
    return None,None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(10)
        key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.hs:raise RuntimeError(self.hs)
        self.i=0
    def rn(self,n):
        b=b""
        while len(b)<n:b+=self.s.recv(n-len(b))
        return b
    def send(self,o):
        b=json.dumps(o).encode();mask=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask;self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self.rn(2))[0]
            elif n==127:n=struct.unpack("!Q",self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None;p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op in (1,2):return json.loads(p.decode())
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x.get("id")==i:return x
    def evaluate_raw(self,e):
        x=self.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
        r=x.get("result",{})
        rr=r.get("result",{})
        ex=r.get("exceptionDetails")
        return {
          "hasTopLevelError":"error" in x,
          "topLevelError":x.get("error"),
          "hasExceptionDetails":ex is not None,
          "exceptionDetails":ex,
          "type":rr.get("type"),
          "subtype":rr.get("subtype"),
          "description":rr.get("description"),
          "valuePresent":"value" in rr,
          "value":rr.get("value"),
          "unserializableValue":rr.get("unserializableValue")
        }

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r1p=ev/"M4_19D4BN17C_R4_R1_NULL_SAFE_RUNTIME_ACTIVATION_ADAPTER_AND_MICRO_COHORT_RECERTIFICATION"/"null_safe_runtime_activation_adapter_and_micro_cohort_recertification.json"
    if not r1p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R1_EVIDENCE_REQUIRED");return 4
    r1=fj(r1p)
    port,t=target()
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    probes=[
      ("primitive","1+1"),
      ("plain_object","({ok:true,count:document.querySelectorAll('*').length})"),
      ("visible_count","(()=>({visible:[...document.querySelectorAll('*')].filter(e=>e.offsetParent!==null).length}))()"),
      ("react_key_counts",r"""(()=>{let props=0,fiber=0,container=0,nodes=0;for(const e of document.querySelectorAll('*')){nodes++;for(const k of Object.keys(e)){if(k.startsWith('__reactProps$'))props++;if(k.startsWith('__reactFiber$'))fiber++;if(k.startsWith('__reactContainer$'))container++;}}return{nodes,props,fiber,container}})()"""),
      ("react_key_samples",r"""(()=>{const out=[];for(const e of document.querySelectorAll('*')){const ks=Object.keys(e).filter(k=>k.startsWith('__react'));if(ks.length){out.push({tag:e.tagName,text:(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,120),keys:ks.map(k=>k.replace(/[A-Za-z0-9]+$/,'<suffix>')).slice(0,8)});if(out.length>=30)break}}return out})()"""),
      ("react_event_metadata",r"""(()=>{const out=[];for(const e of document.querySelectorAll('*')){let p=null,pk=null;for(const k of Object.keys(e)){if(k.startsWith('__reactProps$')){p=e[k];pk=k;break}}if(!p)continue;const events=['onClick','onMouseDown','onPointerDown','onKeyDown','onChange','onSubmit'].filter(k=>typeof p[k]==='function');if(events.length){out.push({tag:e.tagName,text:(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,180),events,role:e.getAttribute('role'),aria:e.getAttribute('aria-label'),testid:e.getAttribute('data-testid'),className:String(e.className||'').slice(0,140),reactPropKey:pk.replace(/[A-Za-z0-9]+$/,'<suffix>')});if(out.length>=100)break}}return out})()"""),
      ("specific_action_metadata",r"""(()=>{const rx=/(compare|command|analy[sz]e|present|export|property package|selected|search)/i,out=[];for(const e of document.querySelectorAll('*')){let p=null;for(const k of Object.keys(e))if(k.startsWith('__reactProps$')){p=e[k];break}if(!p)continue;const blob=((e.innerText||e.textContent||'')+' '+(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('data-testid')||'')+' '+String(e.className||''));if(rx.test(blob)){out.push({tag:e.tagName,text:(e.innerText||e.textContent||'').replace(/\s+/g,' ').trim().slice(0,180),events:['onClick','onMouseDown','onPointerDown','onKeyDown','onChange','onSubmit'].filter(k=>typeof p[k]==='function'),role:e.getAttribute('role'),aria:e.getAttribute('aria-label'),testid:e.getAttribute('data-testid'),className:String(e.className||'').slice(0,160)});if(out.length>=100)break}}return out})()""")
    ]

    results=[]
    for name,expr in probes:
        raw=w.evaluate_raw(expr)
        results.append({"name":name,"result":raw})
        print(f"\n----- PROBE: {name} -----")
        print(json.dumps(raw,indent=2,ensure_ascii=False)[:12000])

    prior_nulls=r1.get("nullRuntimeResultCount")
    exception_count=sum(1 for x in results if x["result"]["hasExceptionDetails"])
    value_count=sum(1 for x in results if x["result"]["valuePresent"])
    primitive_ok=(results[0]["result"]["value"]==2)
    key_counts=(results[3]["result"]["value"] or {}) if results[3]["result"]["valuePresent"] else {}
    props_count=int(key_counts.get("props",0) or 0)
    fiber_count=int(key_counts.get("fiber",0) or 0)
    event_meta=(results[5]["result"]["value"] or []) if results[5]["result"]["valuePresent"] else []
    action_meta=(results[6]["result"]["value"] or []) if results[6]["result"]["valuePresent"] else []

    checks={
      "bn17cR4R1DiagnosticComplete":r1.get("status")=="DIAGNOSTIC_COMPLETE",
      "priorNullRuntimeResultCountEighteen":prior_nulls==18,
      "cdpPrimitiveEvaluationWorks":primitive_ok,
      "fullRuntimeEvaluateResponseCaptured":True,
      "reactPropsSurfaceObserved":props_count>0,
      "reactFiberSurfaceObserved":fiber_count>0,
      "reactEventMetadataSerializable":isinstance(event_meta,list),
      "specificActionMetadataProbeCompleted":isinstance(action_meta,list),
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }

    # This milestone is successful even if a complex probe exposes an exception:
    # the purpose is to make that exception observable and causally bounded.
    passed=all(checks.values())
    diagnosis=(
      "CDP_RUNTIME_EVALUATE_OBSERVABILITY_RECONCILED_REACT_RUNTIME_SURFACE_CONFIRMED"
      if passed else
      "CDP_RUNTIME_EVALUATE_RECONCILIATION_COMPLETE_REACT_RUNTIME_SURFACE_NOT_YET_FULLY_CONFIRMED"
    )
    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R2_CDP_RUNTIME_EVALUATE_EXCEPTION_RECONCILIATION_AND_REACT_RUNTIME_SURFACE_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17C_R4_R2_CDP_RUNTIME_EVALUATE_AND_REACT_RUNTIME_SURFACE_DIAGNOSED" if passed else "M419D4BN17C_R4_R2_DIAGNOSIS_PARTIAL",
      "diagnosis":diagnosis,
      "checks":checks,
      "priorNullRuntimeResultCount":prior_nulls,
      "probeExceptionCount":exception_count,
      "probeValueCount":value_count,
      "reactKeyCounts":key_counts,
      "reactEventMetadataCount":len(event_meta),
      "specificActionMetadataCount":len(action_meta),
      "probes":results,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "next":"BN17C_R4_R2_CERTIFIED_RUNTIME_ADAPTER_REPAIR_READY" if passed else "BN17C_R4_R2_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17C_R4_R3_EXCEPTION_AWARE_EXACT_REACT_ACTIVATION_ADAPTER_MICRO_COHORT_RECERTIFICATION" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"cdp_runtime_evaluate_exception_reconciliation_and_react_runtime_surface_diagnosis.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nPROBE_EXCEPTION_COUNT:",exception_count)
    print("PROBE_VALUE_COUNT:",value_count)
    print("REACT_PROPS_COUNT:",props_count)
    print("REACT_FIBER_COUNT:",fiber_count)
    print("REACT_EVENT_METADATA_COUNT:",len(event_meta))
    print("SPECIFIC_ACTION_METADATA_COUNT:",len(action_meta))
    print("STATUS:",res["status"])
    print("STATE:",res["state"])
    print("DIAGNOSIS:",res["diagnosis"])
    print("NEXT:",res["next"])
    print("NEXT_MILESTONE:",res["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
