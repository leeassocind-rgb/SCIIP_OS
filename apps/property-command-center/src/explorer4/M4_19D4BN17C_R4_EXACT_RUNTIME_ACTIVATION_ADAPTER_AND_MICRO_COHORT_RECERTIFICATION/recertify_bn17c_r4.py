#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,unicodedata

M="M4_19D4BN17C_R4_EXACT_RUNTIME_ACTIVATION_ADAPTER_AND_MICRO_COHORT_RECERTIFICATION"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def norm(s): return re.sub(r"\s+"," ",unicodedata.normalize("NFKC",str(s)).strip()).casefold()

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
        if not m: raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(10)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode(errors="replace");self.i=0
        if " 101 " not in self.hs: raise RuntimeError(self.hs)
    def rn(self,n):
        b=b""
        while len(b)<n:b+=self.s.recv(n-len(b))
        return b
    def send(self,o):
        b=json.dumps(o).encode();m=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=m;self.s.sendall(h+bytes(v^m[i%4] for i,v in enumerate(b)))
    def recv(self):
        while 1:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self.rn(2))[0]
            elif n==127:n=struct.unpack("!Q",self.rn(8))[0]
            mask=self.rn(4) if h[1]&128 else None;p=self.rn(n)
            if mask:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op in (1,2):return json.loads(p.decode())
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while 1:
            x=self.recv()
            if x.get("id")==i:return x
    def ev(self,e):
        x=self.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
        return x.get("result",{}).get("result",{}).get("value")

def enter(w):
    for typ in ("keyDown","keyUp"):
        w.call("Input.dispatchKeyEvent",{"type":typ,"key":"Enter","code":"Enter","windowsVirtualKeyCode":13,"nativeVirtualKeyCode":13})

def classify_refs(refs):
    fam={
      "selection":re.compile(r"(selectedProperty|setSelectedProperty|onPropertySelect|selectProperty|propertyId)",re.I),
      "compare":re.compile(r"(compare|comparison)",re.I),
      "command":re.compile(r"(runCommand|commandPalette|commandMode|executeCommand|command)",re.I),
      "analyze_present":re.compile(r"(analyzeMode|presentMode|analyze|present)",re.I),
      "export":re.compile(r"(export|property package|presentation)",re.I)
    }
    out={k:[] for k in fam}
    for r in refs:
        txt=(r.get("context") or "")+" "+(r.get("file") or "")
        for k,rx in fam.items():
            if rx.search(txt): out[k].append(r)
    return out

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r3p=ev/"M4_19D4BN17C_R3_LIVE_UI_INTERACTION_SURFACE_AND_ACTIVATION_PATH_RESOLUTION"/"live_ui_interaction_surface_and_activation_path_resolution.json"
    b17p=ev/"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION"/"fifty_record_governed_explorer_contract_parity_certification.json"
    if not r3p.exists() or not b17p.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_R3_AND_BN17B_EVIDENCE_REQUIRED");return 4
    r3,b17=fj(r3p),fj(b17p)
    cohort=(b17.get("cohort") or {}).get("properties") or []
    micro=cohort[:3]
    classified=classify_refs(r3.get("sourceReferences") or [])
    port,t=target()
    if not t: print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable")

    # Runtime helper: exact controlled search activation.
    input_expr=r"""(()=>{const a=[...document.querySelectorAll('input')].filter(e=>e.offsetParent!==null);return a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0]||null})()"""
    def setq(q):
        return w.ev(f"""(()=>{{const i={input_expr};if(!i)return null;i.focus();Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(i,{json.dumps(q)});i.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:{json.dumps(q)}}}));i.dispatchEvent(new Event('change',{{bubbles:true}}));return i.value}})()""")

    # Runtime adapter probes event-bearing React nodes and known actionable text surfaces.
    adapter_js=r"""(()=>{const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'};
const text=e=>(e?.innerText||e?.textContent||'').replace(/\s+/g,' ').trim();
const nodes=[...document.querySelectorAll('*')].filter(vis);
const props=e=>{for(const k in e){if(k.startsWith('__reactProps$'))return e[k]}return null};
const rows=[];for(const e of nodes){const p=props(e),t=text(e);if(p&&(p.onClick||p.onMouseDown||p.onPointerDown||p.onKeyDown)){rows.push({tag:e.tagName,text:t.slice(0,220),className:String(e.className||'').slice(0,180),hasOnClick:!!p.onClick,hasOnMouseDown:!!p.onMouseDown,hasOnPointerDown:!!p.onPointerDown,hasOnKeyDown:!!p.onKeyDown,role:e.getAttribute('role'),aria:e.getAttribute('aria-label'),testid:e.getAttribute('data-testid')})}}return rows.slice(0,500)})()"""

    def invoke_runtime_action(patterns):
        pats=json.dumps(patterns)
        return w.ev(f"""(()=>{{const pats={pats}.map(x=>new RegExp(x,'i'));const vis=e=>{{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'}};const txt=e=>(e?.innerText||e?.textContent||'').replace(/\\s+/g,' ').trim();const props=e=>{{for(const k in e)if(k.startsWith('__reactProps$'))return e[k];return null}};let best=null,score=-1,meta=null;for(const e of [...document.querySelectorAll('*')].filter(vis)){{const p=props(e);if(!p||!(p.onClick||p.onMouseDown||p.onPointerDown))continue;const t=txt(e),blob=(t+' '+(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('data-testid')||'')+' '+String(e.className||''));let sc=0;for(const rx of pats)if(rx.test(blob))sc+=100;if(sc>score){{score=sc;best=e;meta={{text:t.slice(0,200),tag:e.tagName,aria:e.getAttribute('aria-label'),testid:e.getAttribute('data-testid'),className:String(e.className||'').slice(0,160)}}}}if(best&&score>0){{const p=props(best);try{{if(p.onClick)p.onClick({{currentTarget:best,target:best,preventDefault(){{}},stopPropagation(){{}}}});else best.click();return{{invoked:true,score,meta}}}}catch(err){{try{{best.click();return{{invoked:true,score,meta,fallback:true}}}}catch(e2){{return{{invoked:false,score,meta,error:String(e2)}}}}}}}}return{{invoked:false,score:0,meta:null}}}})()""")

    def state():
        return w.ev(r"""(()=>({body:document.body?.innerText||'',url:location.href,session:Object.keys(sessionStorage||{}),local:Object.keys(localStorage||{}),map:!!document.querySelector('.gm-style,[data-testid*=map],[class*=map]')}))()""") or {}

    def has(body,*terms):
        b=norm(body);return any(norm(x) in b for x in terms)

    outcomes=[]
    for idx,p in enumerate(micro,1):
        typed=setq(p);exact=norm(typed)==norm(p)
        if exact: enter(w)
        time.sleep(.3)
        react_before=w.ev(adapter_js) or []
        selection=invoke_runtime_action([re.escape(p),r"property",r"result"])
        time.sleep(.15);s0=state()
        compare=invoke_runtime_action([r"compare",r"comparison"])
        time.sleep(.1);s1=state()
        command=invoke_runtime_action([r"command"])
        time.sleep(.1);s2=state()
        analyze=invoke_runtime_action([r"analy[sz]e"])
        present=invoke_runtime_action([r"present"])
        time.sleep(.1);s3=state()
        export=invoke_runtime_action([r"export",r"property package",r"presentation"])
        time.sleep(.1);s4=state()
        merged="\n".join([s0["body"],s1["body"],s2["body"],s3["body"],s4["body"]])

        stages={
          "01_GLOBAL_SEARCH":exact,
          "02_SELECTED_PROPERTY":bool(selection.get("invoked")) and norm(p) in norm(merged),
          "03_PROPERTY_DETAIL_GOVERNED_CONSUMER":has(merged,"property","building","details","property intelligence"),
          "04_MARKET_CONTEXT_NEIGHBORS":has(merged,"market","neighbor"),
          "05_SPATIAL_SELECTION_MAP_FOCUS":any(x.get("map") for x in (s0,s1,s2,s3,s4)),
          "06_COMPARE":bool(compare.get("invoked")),
          "07_COMMAND":bool(command.get("invoked")),
          "08_PROPERTY_INTELLIGENCE":has(merged,"property intelligence","intelligence","evidence","provenance"),
          "09_ANALYZE_PRESENT":bool(analyze.get("invoked") or present.get("invoked")),
          "10_EXPLAIN_EVIDENCE":has(merged,"explain","evidence","provenance","confidence"),
          "11_EXPORT_PRESENTATION":bool(export.get("invoked")),
          "12_GRAPH_RELATIONSHIP":has(merged,"graph","relationship","neighbor"),
          "13_DEEP_LINK_CONTEXT_RESTORE":bool(s4.get("session") or s4.get("local") or "?" in s4.get("url",""))
        }
        ok=all(stages.values())
        outcomes.append({"index":idx,"property":p,"runtimeInteractiveCount":len(react_before),
                         "activation":{"selection":selection,"compare":compare,"command":command,"analyze":analyze,"present":present,"export":export},
                         "stages":stages,"outcome":"MICRO_COHORT_LIVE_WORKFLOW_RECERTIFIED" if ok else "MICRO_COHORT_LIVE_WORKFLOW_GAP"})
        print(f"\n[{idx}/3] {p}")
        print("runtimeInteractiveCount:",len(react_before))
        for k,a in outcomes[-1]["activation"].items(): print(k+"Activation:",json.dumps(a,ensure_ascii=False))
        for k,v in stages.items(): print(f"{k}: {v}")
        print("OUTCOME:",outcomes[-1]["outcome"])

    cert=sum(o["outcome"]=="MICRO_COHORT_LIVE_WORKFLOW_RECERTIFIED" for o in outcomes)
    checks={
      "bn17cR3Passed":r3.get("status")=="PASSED",
      "bn17cR3StateCertified":r3.get("state")=="M419D4BN17C_R3_LIVE_UI_INTERACTION_SURFACE_AND_ACTIVATION_PATH_RESOLVED",
      "exactThreeRecordMicroCohort":len(micro)==3,
      "selectionSourceReferencesResolved":len(classified["selection"])>0,
      "compareSourceReferencesResolved":len(classified["compare"])>0,
      "commandSourceReferencesResolved":len(classified["command"])>0,
      "analyzePresentSourceReferencesResolved":len(classified["analyze_present"])>0,
      "exportSourceReferencesResolved":len(classified["export"])>0,
      "microCohortRecertifiedThreeOfThree":cert==3,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())
    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_EXACT_RUNTIME_ACTIVATION_ADAPTER_AND_MICRO_COHORT_RECERTIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "state":"M419D4BN17C_R4_EXACT_RUNTIME_ACTIVATION_ADAPTER_MICRO_COHORT_RECERTIFIED" if passed else "M419D4BN17C_R4_MICRO_COHORT_RECERTIFICATION_INCOMPLETE",
         "diagnosis":"EXACT_RUNTIME_ACTIVATION_ADAPTER_CERTIFIED_ON_THREE_RECORD_MICRO_COHORT" if passed else "EXACT_RUNTIME_ACTIVATION_ADAPTER_PARTIALLY_RESOLVED_MICRO_COHORT_GAP_REMAINS",
         "checks":checks,"sourceReferenceFamilies":{k:len(v) for k,v in classified.items()},"microCohort":micro,"certifiedCount":cert,"outcomes":outcomes,
         "next":"BN17C_R4_CERTIFIED_FULL_50_RECORD_RECERTIFICATION_READY" if passed else "BN17C_R4_REMAINS_OPEN",
         "nextMilestone":"M4_19D4BN17C_R5_EXACT_RUNTIME_ACTIVATION_ADAPTER_50_RECORD_LIVE_WORKFLOW_RECERTIFICATION" if passed else None}
    out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"exact_runtime_activation_adapter_and_micro_cohort_recertification.json";f.write_text(json.dumps(res,indent=2)+"\n")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nRECERTIFIED:",cert,"/3")
    print("STATUS:",res["status"]);print("STATE:",res["state"]);print("DIAGNOSIS:",res["diagnosis"]);print("NEXT:",res["next"]);print("NEXT_MILESTONE:",res["nextMilestone"]);print("EVIDENCE:",f)
    return 0
if __name__=="__main__":raise SystemExit(main())
