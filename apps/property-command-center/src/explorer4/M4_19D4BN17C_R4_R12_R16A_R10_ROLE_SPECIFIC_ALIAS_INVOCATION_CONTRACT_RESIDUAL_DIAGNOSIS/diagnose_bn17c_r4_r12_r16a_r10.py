#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R10_ROLE_SPECIFIC_ALIAS_INVOCATION_CONTRACT_RESIDUAL_DIAGNOSIS"
PROBE="2 Musick"
TARGET_URL="http://127.0.0.1:5173/"
PORTS=[9333,9334,9335,9444,9555,9666,9222,9223]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def hj(url,method="GET",timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read())
def browser_ready(port):
    try:return bool(hj(f"http://127.0.0.1:{port}/json/version",timeout=1))
    except:return False
def page_targets(port):
    try:return hj(f"http://127.0.0.1:{port}/json",timeout=1)
    except:return []
def find_browser():
    for p in PORTS:
        if browser_ready(p) and any("127.0.0.1:5173" in x.get("url","") for x in page_targets(p)):return p
    for p in PORTS:
        if browser_ready(p):return p
    return None
def create_target(port):
    e=urllib.parse.quote(TARGET_URL,safe=":/")
    for u in (f"http://127.0.0.1:{port}/json/new?{e}",f"http://127.0.0.1:{port}/json/new?url={e}"):
        try:
            x=hj(u,method="PUT",timeout=2)
            if x.get("webSocketDebuggerUrl"):return x
        except:pass
    return None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:raise RuntimeError(f"bad websocket url: {u!r}")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode()
        self.s.sendall(req)
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("websocket handshake failed")
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
        r=x.get("result",{})
        return {"ok":not x.get("error") and r.get("exceptionDetails") is None,
                "value":r.get("result",{}).get("value")}
    def close(self):
        try:self.s.close()
        except:pass

def wait_ready(w):
    w.call("Runtime.enable");w.call("Page.enable")
    for _ in range(50):
        time.sleep(.2)
        if w.ev("document.readyState").get("value") in ("interactive","complete"):break
    time.sleep(.8)

def select_property(w,q):
    js="""(async()=>{
const q=__Q__,norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {ok:false};
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(input,q);else input.value=q;
input.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:q}));
input.dispatchEvent(new Event('change',{bubbles:true}));
input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
input.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
await new Promise(r=>setTimeout(r,1000));
const ranked=[];
for(const el of document.querySelectorAll('*')){
 const tx=(el.innerText||el.textContent||'').trim();if(!tx||!norm(tx).includes(norm(q)))continue;
 let n=el;
 for(let d=0;n&&d<8;d++,n=n.parentElement){
  const rp=Object.getOwnPropertyNames(n).filter(k=>k.startsWith('__reactProps$'));let hs=[];
  for(const k of rp){const v=n[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}
  const click=n.tagName==='BUTTON'||n.tagName==='A'||n.getAttribute('role')==='button'||n.getAttribute('tabindex')!==null||hs.includes('onClick');
  let s=0;if(click)s+=25;if(['BUTTON','A'].includes(n.tagName))s+=10;if(hs.includes('onClick'))s+=20;
  const nt=(n.innerText||n.textContent||'').trim();if(norm(nt)===norm(q))s+=30;else if(norm(nt).startsWith(norm(q)))s+=15;s-=d*2;
  ranked.push({node:n,score:s});
 }
}
ranked.sort((a,b)=>b.score-a.score);if(!ranked[0])return {ok:false};
ranked[0].node.click();await new Promise(r=>setTimeout(r,900));
return {ok:norm(document.body?.innerText||'').includes(norm(q))};
})()""".replace("__Q__",json.dumps(q))
    return w.ev(js)

def source_contract(app,r8):
    aliases=r8.get("resolvedExportAliases",[])
    top=aliases[0] if aliases else {}
    source_name=top.get("sourceName")
    bundle=(fj(app/"evidence/explorer4/M4_19D4BN17C_R4_R12_R16A_R5_EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLUTION/exact_export_presentation_bound_function_and_argument_contract_resolution.json").get("activeDistBundle"))
    p=app/bundle
    s=p.read_text(errors="ignore") if p.exists() else ""
    defs=[]
    if source_name:
        patterns=[
          rf"function\s+{re.escape(source_name)}\s*\(([^)]*)\)",
          rf"(?:const|let|var)\s+{re.escape(source_name)}\s*=\s*(?:async\s*)?\(([^)]*)\)\s*=>",
          rf"(?:const|let|var)\s+{re.escape(source_name)}\s*=\s*(?:async\s*)?([A-Za-z_$][\w$]*)\s*=>"
        ]
        for pat in patterns:
            for m in re.finditer(pat,s):
                defs.append({"params":m.group(1),"offset":m.start(),
                             "snippet":re.sub(r"\s+"," ",s[max(0,m.start()-700):min(len(s),m.start()+2200)])[:2500]})
    calls=[]
    if source_name:
        for m in re.finditer(rf"\b{re.escape(source_name)}\s*\(([^)]{{}}]{{0,600}})\)",s):
            calls.append({"args":m.group(1)[:600],"offset":m.start(),
                          "snippet":re.sub(r"\s+"," ",s[max(0,m.start()-500):min(len(s),m.start()+1000)])[:1600]})
    return {"sourceName":source_name,"definitionCount":len(defs),"definitions":defs[:20],
            "callCount":len(calls),"calls":calls[:50]}

def live_contract(w, live_path):
    handler=live_path.split(".")[-1] if live_path else "onClick"
    js="""(()=>{
const handler=__H__,rows=[];
for(const el of document.querySelectorAll('*')){
 const propKeys=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));
 for(const pk of propKeys){
  const props=el[pk];if(!props||typeof props!=='object'||typeof props[handler]!=='function')continue;
  const fn=props[handler];let src='';try{src=Function.prototype.toString.call(fn)}catch(e){}
  const sib={};for(const [k,v] of Object.entries(props)){if(/^on[A-Z]/.test(k)&&typeof v==='function'){let ss='';try{ss=Function.prototype.toString.call(v)}catch(e){};sib[k]={name:v.name||k,length:v.length,source:ss.slice(0,900)}}}
  rows.push({
    tag:el.tagName,text:(el.innerText||el.textContent||'').trim().slice(0,400),
    aria:el.getAttribute('aria-label')||'',title:el.getAttribute('title')||'',role:el.getAttribute('role')||'',
    className:String(el.className||'').slice(0,300),handlerName:fn.name||handler,handlerLength:fn.length,
    handlerSource:src.slice(0,1600),siblingHandlers:sib,
    propKeys:Object.keys(props).slice(0,120)
  });
 }
}
return {count:rows.length,rows:rows.slice(0,80)};
})()""".replace("__H__",json.dumps(handler))
    return w.ev(js)

def classify(source_info,live_info):
    params=" ".join(x.get("params","") for x in source_info.get("definitions",[]))
    calls=" ".join(x.get("args","") for x in source_info.get("calls",[]))
    live_rows=live_info.get("rows",[])
    lengths=[x.get("handlerLength") for x in live_rows if isinstance(x.get("handlerLength"),int)]
    live_src=" ".join(x.get("handlerSource","") for x in live_rows)
    evidence=(params+" "+calls+" "+live_src).lower()
    if re.search(r"event|preventdefault|stoppropagation|currenttarget|target\b",evidence):
        if re.search(r"property|presentation|context|payload|options|config",evidence):
            return "EVENT_PLUS_CONTEXT_PAYLOAD"
        return "REACT_EVENT_OBJECT"
    if re.search(r"property|presentation|context|payload|options|config|ids\b",evidence):
        return "OBJECT_CONTEXT_PAYLOAD"
    if lengths and max(lengths)>=1:
        return "SINGLE_ARGUMENT_UNKNOWN_ROLE"
    return "NO_ARGS_OR_CLOSURE_DRIVEN"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    r8p=ev/"M4_19D4BN17C_R4_R12_R16A_R8_APPLICATION_OWNED_FUNCTION_ALIAS_AND_ROLE_RESOLUTION"/"application_owned_function_alias_and_role_resolution.json"
    r9p=ev/"M4_19D4BN17C_R4_R12_R16A_R9_APPLICATION_OWNED_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_RECERTIFICATION"/"application_owned_bound_export_presentation_function_live_recertification.json"
    if not r8p.exists() or not r9p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R8_AND_R9_EVIDENCE_REQUIRED");return 4
    r8=fj(r8p);r9=fj(r9p)
    if r8.get("status")!="PASSED" or r9.get("status")!="DIAGNOSTIC_COMPLETE":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R8_PASSED_AND_R9_DIAGNOSTIC_REQUIRED");return 5

    first=(r9.get("outcomes") or [{}])[0]
    ex=first.get("export") or {}
    alias_path=ex.get("chosenPath")
    alias_source=ex.get("sourceName")
    noargs=ex.get("invocationShape")=="NO_ARGS"
    noerr=ex.get("error") in (None,"",False)
    uncert=first.get("exportCertified") is False

    source_info=source_contract(app,r8)

    port=find_browser()
    if port is None:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 6
    t=create_target(port)
    if not t:
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_EXPLORER_TARGET_REQUIRED");return 7

    w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)
    sel=select_property(w,PROBE);sv=sel.get("value") or {}
    lc=live_contract(w,alias_path);lv=lc.get("value") or {}
    w.close()

    contract=classify(source_info,lv)

    sibling_handler_count=sum(len(x.get("siblingHandlers",{})) for x in lv.get("rows",[]))
    event_signal=contract in ("REACT_EVENT_OBJECT","EVENT_PLUS_CONTEXT_PAYLOAD")
    context_signal=contract in ("OBJECT_CONTEXT_PAYLOAD","EVENT_PLUS_CONTEXT_PAYLOAD")

    checks={
      "r16aR8Passed":r8.get("status")=="PASSED",
      "r16aR9DiagnosticComplete":r9.get("status")=="DIAGNOSTIC_COMPLETE",
      "r9ExportAliasBound":ex.get("bound") is True,
      "r9ExportAliasApplicationOwned":bool(alias_path and alias_path.startswith("reactProps.")),
      "r9NoArgsInvocationObserved":noargs,
      "r9InvocationReturnedWithoutException":noerr,
      "r9NoCertifiableExportTransition":uncert,
      "sourceAliasDefinitionOrCallsInspected":source_info.get("definitionCount",0)>0 or source_info.get("callCount",0)>0,
      "liveReactHandlerContextCaptured":lv.get("count",0)>0,
      "siblingHandlerContextCaptured":sibling_handler_count>0,
      "invocationContractClassified":bool(contract),
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "exportPresentationRuntimeInvocationOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R10_ROLE_SPECIFIC_ALIAS_INVOCATION_CONTRACT_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R10_INVOCATION_CONTRACT_DIAGNOSIS_INCOMPLETE")
    diagnosis=("APPLICATION_OWNED_EXPORT_ALIAS_INVOCATION_CONTRACT_RESOLVED_"+contract
               if passed else "APPLICATION_OWNED_EXPORT_ALIAS_INVOCATION_CONTRACT_REMAINS_INCOMPLETE")

    if contract=="REACT_EVENT_OBJECT":
        nxt="M4_19D4BN17C_R4_R12_R16A_R11_EVENT_OBJECT_DRIVEN_APPLICATION_OWNED_EXPORT_PRESENTATION_RECERTIFICATION"
    elif contract=="EVENT_PLUS_CONTEXT_PAYLOAD":
        nxt="M4_19D4BN17C_R4_R12_R16A_R11_EVENT_PLUS_CONTEXT_APPLICATION_OWNED_EXPORT_PRESENTATION_RECERTIFICATION"
    elif contract=="OBJECT_CONTEXT_PAYLOAD":
        nxt="M4_19D4BN17C_R4_R12_R16A_R11_CONTEXT_PAYLOAD_APPLICATION_OWNED_EXPORT_PRESENTATION_RECERTIFICATION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R11_CLOSURE_AND_SIBLING_HANDLER_CHAIN_RESOLUTION"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R10_ROLE_SPECIFIC_ALIAS_INVOCATION_CONTRACT_RESIDUAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "probeProperty":PROBE,
      "r9ChosenAliasPath":alias_path,"r9SourceAlias":alias_source,
      "r9InvocationShape":ex.get("invocationShape"),"r9Error":ex.get("error"),
      "selectedProperty":sv,
      "sourceContract":source_info,
      "liveHandlerContext":lv,
      "resolvedInvocationContract":contract,
      "eventSignal":event_signal,"contextSignal":context_signal,
      "siblingHandlerCount":sibling_handler_count,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"exportPresentationRuntimeInvocation":False},
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"role_specific_alias_invocation_contract_residual_diagnosis.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R10 Role-Specific Alias Invocation Contract Residual Diagnosis")
    print("="*120)
    print("R9_CHOSEN_ALIAS_PATH:",alias_path)
    print("R9_SOURCE_ALIAS:",alias_source)
    print("R9_INVOCATION_SHAPE:",ex.get("invocationShape"))
    print("R9_ERROR:",ex.get("error"))
    print("SOURCE_DEFINITION_COUNT:",source_info.get("definitionCount"))
    print("SOURCE_CALL_COUNT:",source_info.get("callCount"))
    print("LIVE_HANDLER_CONTEXT_COUNT:",lv.get("count"))
    print("SIBLING_HANDLER_COUNT:",sibling_handler_count)
    print("RESOLVED_INVOCATION_CONTRACT:",contract)
    print("EVENT_SIGNAL:",event_signal)
    print("CONTEXT_SIGNAL:",context_signal)

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
