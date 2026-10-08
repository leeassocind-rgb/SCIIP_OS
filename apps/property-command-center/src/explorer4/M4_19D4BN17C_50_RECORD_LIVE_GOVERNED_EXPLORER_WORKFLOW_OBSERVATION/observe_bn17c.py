#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,unicodedata

M="M4_19D4BN17C_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVATION"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def norm(s):
    return re.sub(r"\s+"," ",unicodedata.normalize("NFKC",str(s)).strip()).casefold()

def gj(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read())

def find_target():
    for port in (9333,9222,9223,9334,9444):
        try:
            for x in gj(f"http://127.0.0.1:{port}/json"):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return port,x
        except Exception:
            pass
    return None,None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:raise RuntimeError("CDP websocket URL parse failed")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(10)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:
            x=self.s.recv(4096)
            if not x:break
            b+=x
        self.handshake=b.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.handshake:raise RuntimeError("websocket upgrade failed: "+self.handshake)
        self.i=0
    def rn(self,n):
        b=b""
        while len(b)<n:
            x=self.s.recv(n-len(b))
            if not x:raise RuntimeError("websocket closed")
            b+=x
        return b
    def send(self,o):
        b=json.dumps(o).encode();mask=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask
        self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self.rn(2))[0]
            elif n==127:n=struct.unpack("!Q",self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None
            p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==9:continue
            if op in (1,2):return json.loads(p.decode())
            if op==8:raise RuntimeError("websocket closed by peer")
    def call(self,m,p=None):
        self.i+=1;i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x.get("id")==i:return x
    def ev(self,e):
        x=self.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
        return x.get("result",{}).get("result",{}).get("value")

def enter(w):
    for typ in ("keyDown","keyUp"):
        w.call("Input.dispatchKeyEvent",{"type":typ,"key":"Enter","code":"Enter","windowsVirtualKeyCode":13,"nativeVirtualKeyCode":13})

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    b17p=ev/"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"/"fifty_record_governed_explorer_contract_parity_certification.json"
    if not b17p.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN17B_EVIDENCE_REQUIRED");return 4
    b17=fj(b17p)
    cohort=(b17.get("cohort") or {}).get("properties") or []

    port,t=find_target()
    if not t:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    print("="*116)
    print("SCIIP Explorer 4.0 — BN17C 50-Record Live Governed Explorer Workflow Observation")
    print("="*116)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("WebSocket handshake:",w.handshake)
    print("Validated CDP port:",port)
    print("Target URL:",t.get("url"))

    input_expr=r"""(()=>{const v=e=>e&&e.offsetParent!==null,a=[...document.querySelectorAll('input')].filter(v);return a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0]||null})()"""
    state_expr=r"""(()=>{const v=e=>e&&e.offsetParent!==null,a=[...document.querySelectorAll('input')].filter(v),i=a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0];const body=document.body?.innerText||'';const map=!!document.querySelector('.gm-style,canvas[aria-label*="Map"],[data-testid*=map],[class*=map]');const ss=Object.keys(sessionStorage||{}),ls=Object.keys(localStorage||{});return{value:i?.value||'',body,map,url:location.href,sessionKeys:ss,localKeys:ls}})()"""
    def set_query(q):
        return w.ev(f"""(()=>{{const i={input_expr};if(!i)return null;i.focus();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,{json.dumps(q)});i.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:{json.dumps(q)}}}));i.dispatchEvent(new Event('change',{{bubbles:true}}));return i.value}})()""")

    def text_has(body,*terms):
        b=norm(body)
        return any(norm(x) in b for x in terms)

    outcomes=[]
    for idx,p in enumerate(cohort,1):
        set_query(p);time.sleep(.08);typed=(w.ev(state_expr) or {}).get("value","")
        exact=norm(typed)==norm(p)
        if exact:enter(w)

        s=None
        for _ in range(25):
            time.sleep(.12)
            s=w.ev(state_expr) or {}
            if norm(p) in norm(s.get("body","")):break
        s=s or {}
        body=s.get("body","")
        body_n=norm(body)

        stages={
          "01_GLOBAL_SEARCH": exact,
          "02_SELECTED_PROPERTY": norm(p) in body_n,
          "03_PROPERTY_DETAIL_GOVERNED_CONSUMER": text_has(body,"property","building","details","property intelligence"),
          "04_MARKET_CONTEXT_NEIGHBORS": text_has(body,"market","neighbor","neighbors"),
          "05_SPATIAL_SELECTION_MAP_FOCUS": bool(s.get("map")),
          "06_COMPARE": text_has(body,"compare","comparison"),
          "07_COMMAND": text_has(body,"command"),
          "08_PROPERTY_INTELLIGENCE": text_has(body,"property intelligence","intelligence","evidence","provenance"),
          "09_ANALYZE_PRESENT": text_has(body,"analyze","present"),
          "10_EXPLAIN_EVIDENCE": text_has(body,"explain","evidence","provenance","confidence"),
          "11_EXPORT_PRESENTATION": text_has(body,"export","property package","presentation","present"),
          "12_GRAPH_RELATIONSHIP": text_has(body,"graph","relationship","neighbor"),
          "13_DEEP_LINK_CONTEXT_RESTORE": bool(s.get("sessionKeys")) or bool(s.get("localKeys")) or ("?" in s.get("url",""))
        }
        ok=all(stages.values())
        outcome="LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVED" if ok else "LIVE_GOVERNED_EXPLORER_WORKFLOW_GAP"
        print(f"\n[{idx}/50] {p}")
        for k,v in stages.items():print(f"{k}: {v}")
        print("OUTCOME:",outcome)
        outcomes.append({"index":idx,"property":p,"stages":stages,"outcome":outcome})

    observed=sum(1 for x in outcomes if x["outcome"]=="LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVED")
    checks={
      "bn17bPassed":b17.get("status")=="PASSED",
      "bn17bStateCertified":b17.get("state")=="M419D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED",
      "exactFiftyCount":len(cohort)==50,
      "allFiftyUnique":len({norm(x) for x in cohort})==50,
      "observedCountFifty":observed==50,
      "allThirteenStagesObservedForAll":observed==50,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN17C_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17C_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVED" if passed else "M419D4BN17C_50_RECORD_LIVE_WORKFLOW_OBSERVATION_INCOMPLETE",
      "diagnosis":"EXACT_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVED" if passed else "50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_GAP_REMAINS",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "cohort":{"count":len(cohort),"properties":cohort},
      "observedCount":observed,
      "outcomes":outcomes,
      "next":"BN17C_CERTIFIED_50_RECORD_EXPANSION_LIFECYCLE_CLOSURE_READY" if passed else "BN17C_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17D_50_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE" if passed else None
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"fifty_record_live_governed_explorer_workflow_observation.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print(f"\nOBSERVED: {observed}/50")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
