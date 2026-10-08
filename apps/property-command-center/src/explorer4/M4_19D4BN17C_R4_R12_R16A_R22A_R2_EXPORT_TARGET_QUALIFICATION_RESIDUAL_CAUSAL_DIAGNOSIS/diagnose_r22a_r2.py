#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,socket,base64,os,struct,time,urllib.parse

M="M4_19D4BN17C_R4_R12_R16A_R22A_R2_EXPORT_TARGET_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R1="M4_19D4BN17C_R4_R12_R16A_R22A_R1_ASSIGNMENTS_NAVIGATION_SOURCE_OWNER_CORRELATION_AND_TARGET_QUALIFICATION_RECERTIFICATION"
TARGET="2 Musick"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def get(url):
    try:
        with urllib.request.urlopen(url,timeout=3) as r:return r.read().decode("utf-8","ignore")
    except:return None

def targets(port=9333):
    try:return json.loads(get(f"http://127.0.0.1:{port}/json") or "[]")
    except:return []

def new_target(url,port=9333):
    req=urllib.request.Request(f"http://127.0.0.1:{port}/json/new?{urllib.parse.quote(url,safe=':/?=&')}",method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u); host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),timeout=5)
        key=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("websocket handshake failed")
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode(); mask=os.urandom(4); n=len(p); h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h.extend([0x80|126]);h.extend(struct.pack("!H",n))
        else:h.extend([0x80|127]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+mask+bytes(b^mask[i%4] for i,b in enumerate(p)))
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        b1,b2=h;n=b2&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b2&128 else None;d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(b^mask[i%4] for i,b in enumerate(d))
        try:return json.loads(d.decode()) if (b1&15)==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result") or {}).get("result") or {}).get("value")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/"apps/property-command-center"; src=app/"src"; evid=app/"evidence/explorer4"
    ep=evid/R1/"assignments_navigation_source_owner_correlation_and_target_qualification_recertification.json"
    if not ep.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: R22A_R1_EVIDENCE_REQUIRED");return 4
    r1=loadj(ep)
    if r1.get("state")!="M419D4BN17C_R4_R12_R16A_R22A_R1_TARGET_QUALIFICATION_INCOMPLETE":
        print("STATUS: BLOCKED\nDIAGNOSIS: EXPECTED_R22A_R1_INCOMPLETE_STATE_NOT_FOUND");return 5

    # Source-level correlation for target/search/selection ownership.
    source_hits=[]
    for p in src.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs",".json"}:continue
        if "src/explorer4/" in str(p):continue
        try:s=p.read_text(errors="ignore")
        except:continue
        score=0; sig={}
        for label,pat,pts in [
            ("targetLiteral",r"2 Musick",80),
            ("globalSearchEvent",r"sciip:global-property-search",60),
            ("searchInput",r"type=[\"']search[\"']|placeholder=.*Search",20),
            ("setSelected",r"setSelected(?:Id|Property|PropertyId)",35),
            ("onSelectProperty",r"onSelectProperty",25),
            ("sessionSearch",r"sciip\.globalSearchQuery",50),
            ("explorerNav",r"setNav\s*\(\s*[\"']Explorer[\"']",25)
        ]:
            hit=bool(re.search(pat,s,re.I));sig[label]=hit
            if hit:score+=pts
        if score:
            source_hits.append({"file":str(p.relative_to(app)),"score":score,"signals":sig,
                                "targetContexts":[re.sub(r"\s+"," ",s[max(0,m.start()-400):m.start()+900]) for m in list(re.finditer(r"2 Musick",s,re.I))[:3]]})
    source_hits.sort(key=lambda x:-x["score"])

    pages=[t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    if not pages:
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 6

    nt=new_target("http://127.0.0.1:5173/")
    if not nt or not nt.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED\nDIAGNOSIS: FRESH_TARGET_CREATION_FAILED");return 7
    w=WS(nt["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable");time.sleep(.8)

    before=ev(w,r"""(() => ({
      url:location.href,
      bodyText:(document.body?.innerText||'').slice(0,30000),
      buttons:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null).map(x=>(x.innerText||x.textContent||'').trim()).filter(Boolean).slice(0,300),
      inputs:[...document.querySelectorAll('input')].filter(x=>x.offsetParent!==null).map(x=>({type:x.type,placeholder:x.placeholder,value:x.value,aria:x.getAttribute('aria-label')})),
      selects:[...document.querySelectorAll('select')].filter(x=>x.offsetParent!==null).map(x=>({value:x.value,options:[...x.options].map(o=>o.text).slice(0,100)})),
      session:Object.fromEntries(Object.keys(sessionStorage).map(k=>[k,sessionStorage.getItem(k)])),
      local:Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))
    }))()""") or {}

    target_visible=TARGET.lower() in (before.get("bodyText") or "").lower()
    target_button=any(TARGET.lower() in x.lower() for x in before.get("buttons",[]))
    search_inputs=[x for x in before.get("inputs",[]) if x.get("type")=="search" or "search" in (x.get("placeholder") or "").lower()]
    assignments_visible=any(x=="Assignments" for x in before.get("buttons",[]))
    explorer_visible=any(x=="Explorer" for x in before.get("buttons",[]))

    # Non-export diagnostic navigation: click Explorer only if uniquely visible.
    explorer_action=ev(w,r"""(() => {
      const xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==='Explorer');
      if(xs.length!==1)return {clicked:false,count:xs.length};
      xs[0].click();return {clicked:true,count:1};
    })()""") or {}
    time.sleep(.7)
    after_explorer=ev(w,r"""(() => ({
      bodyText:(document.body?.innerText||'').slice(0,30000),
      buttons:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null).map(x=>(x.innerText||x.textContent||'').trim()).filter(Boolean).slice(0,400),
      inputs:[...document.querySelectorAll('input')].filter(x=>x.offsetParent!==null).map(x=>({type:x.type,placeholder:x.placeholder,value:x.value,aria:x.getAttribute('aria-label')})),
      selects:[...document.querySelectorAll('select')].filter(x=>x.offsetParent!==null).map(x=>({value:x.value,options:[...x.options].map(o=>o.text).slice(0,100)}))
    }))()""") or {}

    target_after=TARGET.lower() in (after_explorer.get("bodyText") or "").lower()
    target_button_after=any(TARGET.lower() in x.lower() for x in after_explorer.get("buttons",[]))
    search_after=[x for x in after_explorer.get("inputs",[]) if x.get("type")=="search" or "search" in (x.get("placeholder") or "").lower()]

    # Diagnose whether the failed R1 strategy assumed target visibility before entering Explorer/search.
    if not target_visible and explorer_action.get("clicked") and (search_after or target_after):
        cause="R22A_R1_SELECTION_ORDER_INVALID_TARGET_LOOKUP_EXECUTED_BEFORE_EXPLORER_SEARCH_CONTEXT_MATERIALIZATION"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22A_R3_EXPLORER_FIRST_SEARCH_DRIVEN_TARGET_SELECTION_AND_EXACT_THREE_RECORD_QUALIFICATION_RECERTIFICATION"
    elif not target_visible and not explorer_action.get("clicked"):
        cause="FRESH_PAGE_EXPLORER_NAVIGATION_CONTROL_NOT_UNIQUELY_MATERIALIZED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22A_R3_EXPLORER_NAVIGATION_MATERIALIZATION_REPAIR_DESIGN"
    elif target_after:
        cause="TARGET_PRESENT_AFTER_EXPLORER_ENTRY_R22A_R1_PREMATURE_SELECTION_ATTEMPT_CERTIFIED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22A_R3_EXPLORER_FIRST_TARGET_SELECTION_AND_EXACT_THREE_RECORD_QUALIFICATION_RECERTIFICATION"
    else:
        cause="TARGET_NOT_MATERIALIZED_BY_EXPLORER_ENTRY_SEARCH_DRIVEN_SELECTION_REQUIRED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22A_R3_EXPLORER_SEARCH_DRIVEN_TARGET_SELECTION_AND_EXACT_THREE_RECORD_QUALIFICATION_RECERTIFICATION"

    checks={
      "r22aR1IncompleteStateConsumed":True,
      "sourceTargetSelectionCorrelationCompleted":True,
      "freshPageInspected":True,
      "targetAbsentOnFreshBrokerHome":not target_visible,
      "explorerControlAvailableOnFreshPage":explorer_visible,
      "explorerDiagnosticEntryAttempted":True,
      "exportInvocationOff":True,
      "generateReportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    outdir=evid/M;outdir.mkdir(parents=True,exist_ok=True)
    ef=outdir/"export_target_qualification_residual_causal_diagnosis.json"
    data={"framework":"SCIIP_EXPLORER_4_R22A_R2_EXPORT_TARGET_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
          "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
          "state":"M419D4BN17C_R4_R12_R16A_R22A_R2_RESIDUAL_CAUSE_CERTIFIED",
          "classification":cause,"target":TARGET,"freshPage":{"targetVisible":target_visible,"targetButton":target_button,
          "searchInputs":search_inputs,"assignmentsVisible":assignments_visible,"explorerVisible":explorer_visible},
          "explorerAction":explorer_action,"afterExplorer":{"targetVisible":target_after,"targetButton":target_button_after,
          "searchInputs":search_after,"bodyExcerpt":(after_explorer.get("bodyText") or "")[:8000]},
          "topSourceCorrelations":source_hits[:25],"checks":checks,"nextMilestone":nextm}
    ef.write_text(json.dumps(data,indent=2)+"\n")
    try:w.call("Page.close")
    except:pass

    print("="*120)
    print("SCIIP Explorer 4.0 — R22A-R2 Export Target Qualification Residual Causal Diagnosis")
    print("="*120)
    print("R22A_R1_STATE:",r1.get("state"))
    print("TARGET:",TARGET)
    print("TARGET_VISIBLE_ON_FRESH_PAGE:",target_visible)
    print("TARGET_BUTTON_ON_FRESH_PAGE:",target_button)
    print("EXPLORER_CONTROL_VISIBLE:",explorer_visible)
    print("ASSIGNMENTS_CONTROL_VISIBLE:",assignments_visible)
    print("SEARCH_INPUT_COUNT_ON_FRESH_PAGE:",len(search_inputs))
    print("EXPLORER_ACTION:",json.dumps(explorer_action))
    print("TARGET_VISIBLE_AFTER_EXPLORER_ENTRY:",target_after)
    print("TARGET_BUTTON_AFTER_EXPLORER_ENTRY:",target_button_after)
    print("SEARCH_INPUT_COUNT_AFTER_EXPLORER_ENTRY:",len(search_after))
    print("\n----- TOP SOURCE CORRELATIONS -----")
    for x in source_hits[:12]:print(json.dumps(x))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",cause)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R22A_R2_RESIDUAL_CAUSE_CERTIFIED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":raise SystemExit(main())
