#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R9_CANONICAL_BOUND_SEARCH_FUNCTION_LIVE_MICRO_COHORT_MATERIALIZATION_CERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def gj(u):
    with urllib.request.urlopen(u,timeout=2) as r:return json.loads(r.read())
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
        if not m: raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.hs: raise RuntimeError(self.hs)
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
    def ev(self,e):
        x=self.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
        r=x.get("result",{});rr=r.get("result",{});ex=r.get("exceptionDetails")
        return {"ok":not x.get("error") and ex is None,"value":rr.get("value"),"exceptionDetails":ex,"topLevelError":x.get("error")}

def jsq(s): return json.dumps(s)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r8p=ev/"M4_19D4BN17C_R4_R12_R8_INGRESS_ALIAS_CLOSURE_TO_RESULT_DERIVATION_BINDING_RESOLUTION"/"ingress_alias_closure_to_result_derivation_binding_resolution.json"
    if not r8p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R4_R12_R8_EVIDENCE_REQUIRED");return 4
    r8=fj(r8p)
    if r8.get("status")!="PASSED" or r8.get("resolvedPath")!=["j","c","a"]:
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_CANONICAL_J_C_A_PATH_REQUIRED");return 5

    port,t=target()
    if not t:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: LIVE_CDP_TARGET_REQUIRED_FOR_BOUND_SEARCH_MATERIALIZATION")
        print("NEXT: START_OR_RESTORE_SCIIP_EXPLORER_DEBUG_TARGET")
        return 6

    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")
    outcomes=[]

    for idx,p in enumerate(COHORT,1):
        script=f"""(async()=>{{
 const q={jsq(p)};
 const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
 if(!input)return {{searchInputFound:false,query:q}};
 const before={{value:input.value,body:(document.body?.innerText||'').slice(0,120000)}};
 input.focus();
 const proto=Object.getPrototypeOf(input);
 const desc=Object.getOwnPropertyDescriptor(proto,'value')||Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
 if(desc&&desc.set)desc.set.call(input,q);else input.value=q;
 input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
 input.dispatchEvent(new Event('change',{{bubbles:true}}));
 input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
 input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
 await new Promise(r=>setTimeout(r,700));
 const body=document.body?.innerText||'';
 const nodes=[...document.querySelectorAll('button,a,[role="button"],[role="option"],[role="listitem"],div,li')];
 const exactNodes=[];
 for(const el of nodes){{
   const tx=(el.innerText||el.textContent||'').trim();
   if(tx&&norm(tx).includes(norm(q))) exactNodes.push({{
     tag:el.tagName,
     text:tx.slice(0,500),
     role:el.getAttribute('role'),
     cls:String(el.className||'').slice(0,240)
   }});
   if(exactNodes.length>=30)break;
 }}
 const bodyHasExact=norm(body).includes(norm(q));
 return {{
   searchInputFound:true,
   query:q,
   finalInputValue:input.value,
   inputValueExact:norm(input.value)===norm(q),
   bodyChanged:before.body!==body.slice(0,120000),
   bodyHasExact,
   exactNodeCount:exactNodes.length,
   exactNodes,
   resultMaterialized:bodyHasExact&&exactNodes.length>0
 }};
}})()"""
        rr=w.ev(script)
        val=rr.get("value") or {}
        outcome={
          "property":p,
          "runtimeEvaluationOk":rr.get("ok"),
          "searchInputFound":val.get("searchInputFound",False),
          "inputValueExact":val.get("inputValueExact",False),
          "bodyChanged":val.get("bodyChanged",False),
          "bodyHasExact":val.get("bodyHasExact",False),
          "exactNodeCount":val.get("exactNodeCount",0),
          "resultMaterialized":val.get("resultMaterialized",False),
          "details":val
        }
        outcomes.append(outcome)
        print(f"\n[{idx}/3] {p}")
        for k in ("runtimeEvaluationOk","searchInputFound","inputValueExact","bodyChanged","bodyHasExact","exactNodeCount","resultMaterialized"):
            print(f"{k}: {outcome[k]}")
        print("OUTCOME:", "CANONICAL_BOUND_SEARCH_RESULT_MATERIALIZED" if outcome["resultMaterialized"] else "CANONICAL_BOUND_SEARCH_RESULT_GAP")

    materialized=sum(1 for x in outcomes if x["resultMaterialized"])
    exact_inputs=sum(1 for x in outcomes if x["inputValueExact"])
    all_eval=all(x["runtimeEvaluationOk"] for x in outcomes)

    checks={
      "bn17cR4R12R8Passed":r8.get("status")=="PASSED",
      "canonicalPathJtoCtoA":r8.get("resolvedPath")==["j","c","a"],
      "exactThreeRecordMicroCohort":len(outcomes)==3,
      "allRuntimeEvaluationsSucceeded":all_eval,
      "allSearchInputsFound":all(x["searchInputFound"] for x in outcomes),
      "allInputValuesExact":exact_inputs==3,
      "allThreeResultsMaterialized":materialized==3,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "pixelEvidenceOff":True,
      "selectedPropertyActivationOff":True,
      "downstreamWorkflowActionAuthorityOff":True
    }
    passed=all(checks.values())

    if passed:
        diagnosis="CANONICAL_J_C_A_BOUND_SEARCH_PATH_LIVE_RESULT_MATERIALIZATION_CERTIFIED_THREE_OF_THREE"
        nxt="M4_19D4BN17C_R4_R12_R10_CANONICAL_SEARCH_RESULT_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_CERTIFICATION"
        state="M419D4BN17C_R4_R12_R9_CANONICAL_BOUND_SEARCH_LIVE_MATERIALIZATION_CERTIFIED"
        status="PASSED"
    else:
        diagnosis="CANONICAL_BOUND_SEARCH_INPUT_EXECUTED_BUT_RESULT_MATERIALIZATION_REMAINS_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R10_LIVE_RESULT_RENDER_GATE_AND_QUERY_DERIVATION_RECONCILIATION"
        state="M419D4BN17C_R4_R12_R9_LIVE_MATERIALIZATION_INCOMPLETE"
        status="DIAGNOSTIC_COMPLETE"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R9_CANONICAL_BOUND_SEARCH_FUNCTION_LIVE_MICRO_COHORT_MATERIALIZATION_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,
      "checks":checks,"cohort":COHORT,"outcomes":outcomes,
      "materializedCount":materialized,
      "canonicalPath":["j","c","a"],
      "ingressArgumentContract":"EVENT_OBJECT_WITH_TARGET_VALUE",
      "downstreamArgumentContract":"QUERY_VALUE_OR_QUERY_STATE",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,"selectedPropertyActivation":False,"downstreamWorkflowActions":False},
      "next":"BN17C_R4_R12_R9_CERTIFIED_SELECTED_PROPERTY_ACTIVATION_READY" if passed else "BN17C_R4_R12_R9_REMAINS_OPEN",
      "nextMilestone":nxt
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"canonical_bound_search_function_live_micro_cohort_materialization_certification.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("MATERIALIZED:",materialized,"/3")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT:",res["next"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
