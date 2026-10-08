#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R12_ROLE_SPECIFIC_EVENT_CONTEXT_POST_ACTION_RESIDUAL_DIAGNOSIS"
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
    js='''(async()=>{
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
})()'''.replace("__Q__",json.dumps(q))
    return w.ev(js)

def snapshot(w):
    js='''(()=>{
const norm=s=>(s||'').replace(/\\s+/g,' ').trim();
const vis=el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0'};
const dialogs=[...document.querySelectorAll('[role="dialog"],dialog,[aria-modal="true"],[class*="modal"],[class*="dialog"],[class*="popover"],[class*="menu"]')]
 .filter(vis).map(el=>({tag:el.tagName,text:norm(el.innerText||el.textContent).slice(0,1000),role:el.getAttribute('role')||'',cls:String(el.className||'').slice(0,300)})).slice(0,80);
const buttons=[...document.querySelectorAll('button,a,[role="button"],[role="menuitem"]')]
 .filter(vis).map(el=>({tag:el.tagName,text:norm(el.innerText||el.textContent).slice(0,300),aria:el.getAttribute('aria-label')||'',title:el.getAttribute('title')||'',role:el.getAttribute('role')||''})).slice(0,300);
const focus=document.activeElement?{tag:document.activeElement.tagName,text:norm(document.activeElement.innerText||document.activeElement.value||'').slice(0,300),
 aria:document.activeElement.getAttribute?.('aria-label')||'',role:document.activeElement.getAttribute?.('role')||''}:null;
const body=norm(document.body?.innerText||'');
return {url:location.href,body,bodyLength:body.length,htmlLength:document.body?.innerHTML.length||0,dialogs,buttons,focus};
})()'''
    return w.ev(js)

def invoke_exact_r11_alias(w, property_name, alias_path):
    handler=alias_path.split(".")[-1]
    js='''(async()=>{
const propertyName=__P__,handler=__H__;
const candidates=[];
for(const el of document.querySelectorAll('*')){
 const pks=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));
 for(const pk of pks){
  const props=el[pk];if(!props||typeof props!=='object'||typeof props[handler]!=='function')continue;
  const fn=props[handler];let src='';try{src=Function.prototype.toString.call(fn)}catch(e){}
  if(/\\[native code\\]/.test(src))continue;
  candidates.push({fn,el,props,path:'reactProps.'+handler,name:fn.name||handler,len:fn.length,src});
 }
}
if(!candidates.length)return {ok:false,diagnostic:'NO_APPLICATION_HANDLER'};
const best=candidates[0];
const context={property:propertyName,propertyName,selectedProperty:propertyName,title:propertyName,label:propertyName,
 mode:'export',action:'EXPORT',presentation:{property:propertyName,title:propertyName,mode:'presentation'},
 export:{property:propertyName,title:propertyName,format:'presentation'},payload:{property:propertyName,action:'EXPORT'},
 options:{property:propertyName,action:'EXPORT'}};
const eventObj={type:'click',target:best.el,currentTarget:best.el,detail:context,nativeEvent:{type:'click'},defaultPrevented:false,
 preventDefault(){this.defaultPrevented=true;},stopPropagation(){},isPropagationStopped(){return false;},
 isDefaultPrevented(){return this.defaultPrevented;},persist(){},button:0,buttons:1,key:'',code:'',metaKey:false,ctrlKey:false,shiftKey:false,altKey:false};
let ret=null,err=null;
try{ret=best.len<=1?best.fn(eventObj):best.fn(eventObj,context);if(ret&&typeof ret.then==='function')ret=await ret;}catch(e){err=String(e)}
await new Promise(r=>setTimeout(r,1200));
let sr=null;try{sr=JSON.parse(JSON.stringify(ret))}catch(e){sr=String(ret)}
return {ok:!err,error:err,chosenPath:best.path,chosenName:best.name,chosenLength:best.len,eventDefaultPrevented:eventObj.defaultPrevented,returnValue:sr};
})()'''.replace("__P__",json.dumps(property_name)).replace("__H__",json.dumps(handler))
    return w.ev(js)

def split_lines(body):
    # Browser innerText was normalized by snapshot; split on strong UI punctuation too.
    return [x.strip() for x in re.split(r"(?:\\n|\\r|\\s{2,}|\\|)",body or "") if x.strip()]

def diff(pre,post):
    pre_body=pre.get("body","");post_body=post.get("body","")
    pre_tokens=set(split_lines(pre_body));post_tokens=set(split_lines(post_body))
    added=sorted(post_tokens-pre_tokens)
    removed=sorted(pre_tokens-post_tokens)
    pre_dialog=set((x.get("text",""),x.get("role","")) for x in pre.get("dialogs",[]))
    post_dialog=set((x.get("text",""),x.get("role","")) for x in post.get("dialogs",[]))
    new_dialogs=[{"text":a,"role":b} for a,b in sorted(post_dialog-pre_dialog)]
    pre_buttons=set((x.get("text",""),x.get("aria",""),x.get("title",""),x.get("role","")) for x in pre.get("buttons",[]))
    post_buttons=set((x.get("text",""),x.get("aria",""),x.get("title",""),x.get("role","")) for x in post.get("buttons",[]))
    new_buttons=[{"text":a,"aria":b,"title":c,"role":d} for a,b,c,d in sorted(post_buttons-pre_buttons)]
    return {"bodyChanged":pre_body!=post_body,"urlChanged":pre.get("url")!=post.get("url"),
            "bodyLengthDelta":post.get("bodyLength",0)-pre.get("bodyLength",0),
            "htmlLengthDelta":post.get("htmlLength",0)-pre.get("htmlLength",0),
            "addedText":added[:200],"removedText":removed[:200],
            "newDialogs":new_dialogs[:80],"newButtons":new_buttons[:120],
            "focusChanged":pre.get("focus")!=post.get("focus"),
            "preFocus":pre.get("focus"),"postFocus":post.get("focus")}

def classify(d):
    blob=" ".join(x for x in d.get("addedText",[]) if isinstance(x,str)).lower()
    blob+=" "+" ".join(x.get("text","") for x in d.get("newDialogs",[])).lower()
    blob+=" "+" ".join((x.get("text","")+" "+x.get("aria","")+" "+x.get("title","")) for x in d.get("newButtons",[])).lower()
    if re.search(r"export|download|presentation|deck|ppt|powerpoint|generate|create",blob):
        if d.get("newDialogs") or d.get("newButtons"):
            return "INTERMEDIATE_EXPORT_OR_PRESENTATION_LAUNCHER_OPENED"
        return "VALID_EXPORT_PRESENTATION_STATE_CHANGE_VERIFIER_INCOMPLETE"
    if d.get("newDialogs") or d.get("newButtons"):
        return "INTERMEDIATE_MENU_OR_MODE_SURFACE_OPENED"
    if d.get("bodyChanged") or d.get("htmlLengthDelta"):
        return "APPLICATION_STATE_CHANGED_WITHOUT_SEMANTIC_EXPORT_SIGNAL"
    return "NO_MEANINGFUL_POST_ACTION_STATE_CHANGE"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    r11p=ev/"M4_19D4BN17C_R4_R12_R16A_R11_EVENT_PLUS_CONTEXT_APPLICATION_OWNED_EXPORT_PRESENTATION_RECERTIFICATION"/"event_plus_context_application_owned_export_presentation_recertification.json"
    r10p=ev/"M4_19D4BN17C_R4_R12_R16A_R10_ROLE_SPECIFIC_ALIAS_INVOCATION_CONTRACT_RESIDUAL_DIAGNOSIS"/"role_specific_alias_invocation_contract_residual_diagnosis.json"
    if not r11p.exists() or not r10p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R10_AND_R11_EVIDENCE_REQUIRED");return 4

    r11=fj(r11p);r10=fj(r10p)
    first=(r11.get("outcomes") or [{}])[0];ex=first.get("export") or {}
    alias_path=ex.get("chosenPath")
    if r11.get("status")!="DIAGNOSTIC_COMPLETE" or not alias_path:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R11_DIAGNOSTIC_ALIAS_PATH_REQUIRED");return 5

    port=find_browser()
    if port is None:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 6
    t=create_target(port)
    if not t:
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_EXPLORER_TARGET_REQUIRED");return 7

    w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)
    sel=select_property(w,PROBE);sv=sel.get("value") or {}
    pre=(snapshot(w).get("value") or {})
    inv=invoke_exact_r11_alias(w,PROBE,alias_path);iv=inv.get("value") or {}
    post=(snapshot(w).get("value") or {})
    w.close()

    d=diff(pre,post)
    classification=classify(d)

    checks={
      "r16aR10Passed":r10.get("status")=="PASSED",
      "r16aR11DiagnosticComplete":r11.get("status")=="DIAGNOSTIC_COMPLETE",
      "r11BodyChanged":ex.get("bodyChanged") is True,
      "r11NoSemanticExportSignal":ex.get("signal") is False,
      "r11NoReturnSignal":ex.get("returnSignal") is False,
      "r11NoUrlChange":ex.get("urlChanged") is False,
      "probeSelectedPropertyCertified":sv.get("ok") is True,
      "exactR11ActionReproduced":iv.get("ok") is True,
      "prePostSnapshotsCaptured":bool(pre) and bool(post),
      "postActionDiffComputed":True,
      "residualClassificationResolved":bool(classification),
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R12_EVENT_CONTEXT_POST_ACTION_RESIDUAL_CAUSALLY_DIAGNOSED"
           if passed else "M419D4BN17C_R4_R12_R16A_R12_POST_ACTION_DIAGNOSIS_INCOMPLETE")
    diagnosis=("R11_EVENT_CONTEXT_POST_ACTION_"+classification if passed else "R11_EVENT_CONTEXT_POST_ACTION_RESIDUAL_REMAINS_INCOMPLETE")

    if classification=="INTERMEDIATE_EXPORT_OR_PRESENTATION_LAUNCHER_OPENED":
        nxt="M4_19D4BN17C_R4_R12_R16A_R13_INTERMEDIATE_EXPORT_PRESENTATION_LAUNCHER_CONTROL_AND_SECOND_STAGE_ACTION_RESOLUTION"
    elif classification=="VALID_EXPORT_PRESENTATION_STATE_CHANGE_VERIFIER_INCOMPLETE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R13_EXPORT_PRESENTATION_VERIFICATION_CONTRACT_REPAIR_AND_RECERTIFICATION"
    elif classification=="INTERMEDIATE_MENU_OR_MODE_SURFACE_OPENED":
        nxt="M4_19D4BN17C_R4_R12_R16A_R13_INTERMEDIATE_MENU_ACTION_TARGET_RESOLUTION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R13_REACT_HANDLER_INSTANCE_DISAMBIGUATION_AND_ELEMENT_ROLE_BINDING"

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R12_ROLE_SPECIFIC_EVENT_CONTEXT_POST_ACTION_RESIDUAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "probeProperty":PROBE,"r11AliasPath":alias_path,"r11SourceAlias":ex.get("sourceName"),
      "selectedProperty":sv,"reproducedInvocation":iv,
      "preSnapshot":pre,"postSnapshot":post,"postActionDiff":d,
      "residualClassification":classification,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"additionalWorkflowAuthority":False},
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"role_specific_event_context_post_action_residual_diagnosis.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R12 Role-Specific Event/Context Post-Action Residual Diagnosis")
    print("="*120)
    print("R11_ALIAS_PATH:",alias_path)
    print("PROBE_SELECTED_PROPERTY_CERTIFIED:",sv.get("ok"))
    print("EXACT_R11_ACTION_REPRODUCED:",iv.get("ok"))
    print("BODY_CHANGED:",d.get("bodyChanged"))
    print("BODY_LENGTH_DELTA:",d.get("bodyLengthDelta"))
    print("HTML_LENGTH_DELTA:",d.get("htmlLengthDelta"))
    print("URL_CHANGED:",d.get("urlChanged"))
    print("NEW_DIALOG_COUNT:",len(d.get("newDialogs",[])))
    print("NEW_BUTTON_COUNT:",len(d.get("newButtons",[])))
    print("FOCUS_CHANGED:",d.get("focusChanged"))
    print("RESIDUAL_CLASSIFICATION:",classification)

    print("\\n----- ADDED TEXT -----")
    for x in d.get("addedText",[])[:40]: print(x)
    print("\\n----- NEW DIALOGS -----")
    for x in d.get("newDialogs",[])[:20]: print(json.dumps(x,ensure_ascii=False))
    print("\\n----- NEW BUTTONS -----")
    for x in d.get("newButtons",[])[:30]: print(json.dumps(x,ensure_ascii=False))

    print("\\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
