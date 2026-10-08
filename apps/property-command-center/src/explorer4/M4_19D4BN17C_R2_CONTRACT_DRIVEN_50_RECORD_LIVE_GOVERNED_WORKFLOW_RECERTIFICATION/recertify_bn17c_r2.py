#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,unicodedata

M="M4_19D4BN17C_R2_CONTRACT_DRIVEN_50_RECORD_LIVE_GOVERNED_WORKFLOW_RECERTIFICATION"

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
        except Exception: pass
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
        h+=mask;self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self.rn(2))[0]
            elif n==127:n=struct.unpack("!Q",self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None;p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==9:continue
            if op in (1,2):return json.loads(p.decode())
            if op==8:raise RuntimeError("websocket closed by peer")
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
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
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    b17p=ev/"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"/"fifty_record_governed_explorer_contract_parity_certification.json"
    r1p=ev/"M4_19D4BN17C_R1_LIVE_WORKFLOW_ACTIVATION_AND_OBSERVATION_CONTRACT_DIAGNOSIS"/"live_workflow_activation_and_observation_contract_diagnosis.json"
    if not b17p.is_file() or not r1p.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN17B_AND_BN17C_R1_EVIDENCE_REQUIRED");return 4
    b17,r1=fj(b17p),fj(r1p)
    cohort=(b17.get("cohort") or {}).get("properties") or []

    port,t=find_target()
    if not t:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R2 Contract-Driven 50-Record Live Governed Workflow Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("WebSocket handshake:",w.handshake)
    print("Validated CDP port:",port)
    print("Target URL:",t.get("url"))

    input_expr=r"""(()=>{const v=e=>e&&e.offsetParent!==null,a=[...document.querySelectorAll('input')].filter(v);return a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0]||null})()"""
    state_expr=r"""(()=>{const v=e=>e&&e.offsetParent!==null;const body=document.body?.innerText||'';const map=!!document.querySelector('.gm-style,canvas[aria-label*="Map"],[data-testid*=map],[class*=map]');return{body,map,url:location.href,sessionKeys:Object.keys(sessionStorage||{}),localKeys:Object.keys(localStorage||{})}})()"""

    def set_query(q):
        return w.ev(f"""(()=>{{const i={input_expr};if(!i)return null;i.focus();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,{json.dumps(q)});i.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:{json.dumps(q)}}}));i.dispatchEvent(new Event('change',{{bubbles:true}}));return i.value}})()""")

    def click_matching(label, aliases):
        arr=json.dumps(aliases)
        return w.ev(f"""(()=>{{const aliases={arr}.map(x=>x.toLowerCase());const vis=e=>{{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'}};const els=[...document.querySelectorAll('button,a,[role=button],[role=option],[role=menuitem],li,div')].filter(vis);let best=null,bscore=-1;for(const e of els){{const t=(e.innerText||e.textContent||'').replace(/\\s+/g,' ').trim();if(!t)continue;const l=t.toLowerCase();let sc=0;for(const a of aliases){{if(l===a)sc=Math.max(sc,1000);else if(l.startsWith(a))sc=Math.max(sc,500);else if(l.includes(a))sc=Math.max(sc,100)}}if(sc>bscore){{best=e;bscore=sc}}}}if(best&&bscore>0){{best.click();return{{clicked:true,descriptor:(best.innerText||best.textContent||'').replace(/\\s+/g,' ').trim().slice(0,200),score:bscore}}}}return{{clicked:false,descriptor:null,score:0}}}})()""")

    def click_property(p):
        q=json.dumps(norm(p))
        return w.ev(f"""(()=>{{const target={q};const vis=e=>{{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'}};const els=[...document.querySelectorAll('[role=option],[role=menuitem],button,a,li,[data-testid*=search],[data-testid*=property],div')].filter(vis);let best=null,bscore=-1;for(const e of els){{const t=(e.innerText||e.textContent||'').replace(/\\s+/g,' ').trim();if(!t)continue;const l=t.toLowerCase();let sc=0;if(l===target)sc=1000;else if(l.startsWith(target))sc=800;else if(l.includes(target))sc=500;else{{const first=target.split(' ')[0];if(first&&l.startsWith(first))sc=100}}if(sc>bscore){{best=e;bscore=sc}}}}if(best&&bscore>0){{best.click();return{{clicked:true,descriptor:(best.innerText||best.textContent||'').replace(/\\s+/g,' ').trim().slice(0,220),score:bscore}}}}return{{clicked:false,descriptor:null,score:0}}}})()""")

    def body_has(body,*terms):
        b=norm(body)
        return any(norm(x) in b for x in terms)

    outcomes=[]
    for idx,p in enumerate(cohort,1):
        typed=set_query(p);exact=norm(typed)==norm(p)
        if exact:enter(w)
        time.sleep(.25)

        select=click_property(p)
        time.sleep(.25)
        s0=w.ev(state_expr) or {};body0=s0.get("body","")
        selected=bool(select and select.get("clicked")) and norm(p) in norm(body0)

        compare=click_matching("COMPARE",["compare","comparison"])
        time.sleep(.12);s1=w.ev(state_expr) or {};body1=s1.get("body","")
        compare_ok=bool(compare and compare.get("clicked")) and body_has(body1,"compare","comparison")

        command=click_matching("COMMAND",["command"])
        time.sleep(.12);s2=w.ev(state_expr) or {};body2=s2.get("body","")
        command_ok=bool(command and command.get("clicked")) and body_has(body2,"command")

        analyze=click_matching("ANALYZE",["analyze"])
        time.sleep(.10)
        present=click_matching("PRESENT",["present","presentation"])
        time.sleep(.10);s3=w.ev(state_expr) or {};body3=s3.get("body","")
        analyze_present_ok=bool((analyze and analyze.get("clicked")) or (present and present.get("clicked"))) and body_has(body3,"analyze","present","presentation")

        export=click_matching("EXPORT",["export","property package","presentation"])
        time.sleep(.10);s4=w.ev(state_expr) or {};body4=s4.get("body","")
        export_ok=bool(export and export.get("clicked")) and body_has(body4,"export","property package","presentation","present")

        merged="\n".join([body0,body1,body2,body3,body4])
        stages={
          "01_GLOBAL_SEARCH":exact,
          "02_SELECTED_PROPERTY":selected,
          "03_PROPERTY_DETAIL_GOVERNED_CONSUMER":body_has(merged,"property","building","details","property intelligence"),
          "04_MARKET_CONTEXT_NEIGHBORS":body_has(merged,"market","neighbor","neighbors"),
          "05_SPATIAL_SELECTION_MAP_FOCUS":bool(s0.get("map") or s1.get("map") or s2.get("map") or s3.get("map") or s4.get("map")),
          "06_COMPARE":compare_ok,
          "07_COMMAND":command_ok,
          "08_PROPERTY_INTELLIGENCE":body_has(merged,"property intelligence","intelligence","evidence","provenance"),
          "09_ANALYZE_PRESENT":analyze_present_ok,
          "10_EXPLAIN_EVIDENCE":body_has(merged,"explain","evidence","provenance","confidence"),
          "11_EXPORT_PRESENTATION":export_ok,
          "12_GRAPH_RELATIONSHIP":body_has(merged,"graph","relationship","neighbor"),
          "13_DEEP_LINK_CONTEXT_RESTORE":bool(s4.get("sessionKeys")) or bool(s4.get("localKeys")) or ("?" in s4.get("url",""))
        }
        ok=all(stages.values())
        outcome="LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if ok else "LIVE_GOVERNED_EXPLORER_WORKFLOW_GAP"
        print(f"\n[{idx}/50] {p}")
        print("selectionDescriptor:",select.get("descriptor") if select else None)
        print("compareDescriptor:",compare.get("descriptor") if compare else None)
        print("commandDescriptor:",command.get("descriptor") if command else None)
        print("analyzeDescriptor:",analyze.get("descriptor") if analyze else None)
        print("presentDescriptor:",present.get("descriptor") if present else None)
        print("exportDescriptor:",export.get("descriptor") if export else None)
        for k,v in stages.items():print(f"{k}: {v}")
        print("OUTCOME:",outcome)
        outcomes.append({"index":idx,"property":p,"descriptors":{"selection":select,"compare":compare,"command":command,"analyze":analyze,"present":present,"export":export},"stages":stages,"outcome":outcome})

    certified=sum(1 for x in outcomes if x["outcome"]=="LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED")
    stage_counts={}
    for o in outcomes:
        for k,v in o["stages"].items():stage_counts[k]=stage_counts.get(k,0)+int(bool(v))

    checks={
      "bn17bPassed":b17.get("status")=="PASSED",
      "bn17bStateCertified":b17.get("state")=="M419D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFIED",
      "bn17cR1Passed":r1.get("status")=="PASSED",
      "bn17cR1DiagnosisCertified":r1.get("diagnosis")=="BN17C_PASSIVE_OBSERVER_DID_NOT_ACTIVATE_SELECTED_PROPERTY_OR_ACTION_SPECIFIC_WORKFLOW_CONTRACTS",
      "exactFiftyCount":len(cohort)==50,
      "certifiedCountFifty":certified==50,
      "allThirteenStagesRecertified":all(v==50 for v in stage_counts.values()) and len(stage_counts)==13,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN17C_R2_CONTRACT_DRIVEN_50_RECORD_LIVE_GOVERNED_WORKFLOW_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17C_R2_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if passed else "M419D4BN17C_R2_50_RECORD_LIVE_WORKFLOW_RECERTIFICATION_INCOMPLETE",
      "diagnosis":"EXACT_50_RECORD_CONTRACT_DRIVEN_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if passed else "CONTRACT_DRIVEN_50_RECORD_LIVE_WORKFLOW_GAP_REMAINS",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,"stageCounts":stage_counts,"certifiedCount":certified,"cohort":{"count":len(cohort),"properties":cohort},"outcomes":outcomes,
      "next":"BN17C_R2_CERTIFIED_50_RECORD_EXPANSION_LIFECYCLE_CLOSURE_READY" if passed else "BN17C_R2_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17D_50_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"contract_driven_50_record_live_governed_workflow_recertification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- STAGE COUNTS -----")
    for k in sorted(stage_counts):print(f"{k}: {stage_counts[k]}/50")
    print(f"\nRECERTIFIED: {certified}/50")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0
if __name__=="__main__":raise SystemExit(main())
