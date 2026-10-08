#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R1_EXPORT_PRESENTATION_CONTROL_TARGET_AND_POST_ACTION_STATE_DIAGNOSIS"
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
        if not m:raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\\r\\nHost: {h}:{p}\\r\\nUpgrade: websocket\\r\\nConnection: Upgrade\\r\\nSec-WebSocket-Key: {k}\\r\\nSec-WebSocket-Version: 13\\r\\n\\r\\n").encode())
        b=b""
        while b"\\r\\n\\r\\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\\r\\n",1)[0]:raise RuntimeError("websocket handshake failed")
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
                "value":r.get("result",{}).get("value"),
                "exceptionDetails":r.get("exceptionDetails")}
    def close(self):
        try:self.s.close()
        except:pass

def jq(s):return json.dumps(s)
def wait_ready(w):
    w.call("Runtime.enable");w.call("Page.enable")
    for _ in range(40):
        time.sleep(.2)
        if w.ev("document.readyState").get("value") in ("interactive","complete"):break
    time.sleep(.8)

def select_property(w,q):
    js = f'''(async()=>{{
const q={jq(PROBE)},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {{ok:false}};
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(input,q);else input.value=q;
input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
input.dispatchEvent(new Event('change',{{bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
await new Promise(r=>setTimeout(r,900));
const ranked=[];
for(const el of document.querySelectorAll('*')){{
 const tx=(el.innerText||el.textContent||'').trim();if(!tx||!norm(tx).includes(norm(q)))continue;
 let n=el;
 for(let d=0;n&&d<8;d++,n=n.parentElement){{
  const rp=Object.getOwnPropertyNames(n).filter(k=>k.startsWith('__reactProps$'));let hs=[];
  for(const k of rp){{const v=n[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}}
  const role=n.getAttribute&&n.getAttribute('role');
  const click=n.tagName==='BUTTON'||n.tagName==='A'||role==='button'||n.getAttribute('tabindex')!==null||typeof n.onclick==='function'||hs.includes('onClick');
  let s=0;if(click)s+=25;if(['BUTTON','A'].includes(n.tagName))s+=10;if(hs.includes('onClick'))s+=20;
  const nt=(n.innerText||n.textContent||'').trim();if(norm(nt)===norm(q))s+=30;else if(norm(nt).startsWith(norm(q)))s+=15;s-=d*2;
  ranked.push({{node:n,score:s}});
 }}
}}
ranked.sort((a,b)=>b.score-a.score);if(!ranked[0])return {{ok:false}};
ranked[0].node.click();await new Promise(r=>setTimeout(r,800));
const body=document.body?.innerText||'';
return {{ok:norm(body).includes(norm(q)),bodyHasProperty:norm(body).includes(norm(q))}};
}})()'''
    return w.ev(js)

def capture_controls(w):
    js = '''(()=> {
const out=[];
for(const el of document.querySelectorAll('*')){
 const cs=getComputedStyle(el),rect=el.getBoundingClientRect();
 if(cs.display==='none'||cs.visibility==='hidden'||rect.width<1||rect.height<1)continue;
 const tag=el.tagName,role=el.getAttribute('role'),tab=el.getAttribute('tabindex');
 const rp=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));let hs=[];
 for(const k of rp){const v=el[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}
 const eventBearing=tag==='BUTTON'||tag==='A'||role==='button'||tab!==null||typeof el.onclick==='function'||hs.length>0;
 if(!eventBearing)continue;
 const text=(el.innerText||el.textContent||'').trim();
 const aria=el.getAttribute('aria-label')||'',title=el.getAttribute('title')||'',href=el.getAttribute('href')||'';
 const download=el.getAttribute('download')||'',parent=(el.parentElement?.innerText||'').trim().slice(0,300);
 out.push({tag,role,text:text.slice(0,300),aria,title,href,download,handlers:hs,parentText:parent,
   score:(/export|presentation|present|download|deck|share|more|actions|menu|ellipsis|pdf|ppt|powerpoint/i.test([text,aria,title,href,download,parent].join(' '))?50:0)+
         (tag==='BUTTON'?10:0)+(hs.includes('onClick')?10:0)});
}
out.sort((a,b)=>b.score-a.score);
return {count:out.length,top:out.slice(0,150)};
})()'''
    return w.ev(js)

def probe_menus(w):
    js = '''(async()=> {
const norm=s=>(s||'').toLowerCase().replace(/\s+/g,' ').trim();
const before=document.body?.innerText||'';
const candidates=[];
for(const el of document.querySelectorAll('button,[role="button"],[aria-haspopup="menu"],[title],[aria-label]')){
 const t=norm([el.innerText,el.textContent,el.getAttribute('aria-label'),el.getAttribute('title')].join(' '));
 if(/more|menu|actions|options|ellipsis|share/.test(t)||el.getAttribute('aria-haspopup')==='menu')candidates.push(el);
}
const observations=[];
for(const el of candidates.slice(0,12)){
 const desc=((el.innerText||el.textContent||'')+' '+(el.getAttribute('aria-label')||'')+' '+(el.getAttribute('title')||'')).trim();
 try{el.click();await new Promise(r=>setTimeout(r,250));}catch{}
 const body=document.body?.innerText||'';
 const hits=(body.match(/.{0,40}(export|presentation|download|deck|powerpoint|ppt|pdf).{0,80}/ig)||[]).slice(0,20);
 observations.push({trigger:desc.slice(0,200),bodyChanged:body!==before,hits});
 if(el.getAttribute('aria-expanded')==='true')try{el.click();await new Promise(r=>setTimeout(r,100));}catch{}
}
return {candidateCount:candidates.length,observations};
})()'''
    return w.ev(js)

def source_scan(app):
    pats=[r"export presentation",r"download presentation",r"generate presentation",r"\bexport\b",r"\bdeck\b",r"powerpoint",r"\bpptx?\b",r"download"]
    hits=[]
    for p in app.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs",".json"}:continue
        if any(x in p.parts for x in ("node_modules",".git","evidence")):continue
        try:s=p.read_text(errors="ignore")
        except:continue
        n=sum(len(re.findall(x,s,re.I)) for x in pats)
        if n:hits.append({"file":str(p.relative_to(app)),"references":n})
    return sorted(hits,key=lambda x:(-x["references"],x["file"]))[:120]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r16ap=ev/"M4_19D4BN17C_R4_R12_R16A_EXPORT_PRESENTATION_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"/"export_presentation_action_live_micro_cohort_activation_certification.json"
    if not r16ap.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: R16A_EVIDENCE_REQUIRED");return 4
    r16a=fj(r16ap)
    port=find_browser()
    if port is None:
        print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 5
    t=create_target(port)
    if not t:
        print("STATUS: BLOCKED\nDIAGNOSIS: FRESH_EXPLORER_TARGET_REQUIRED");return 6

    w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)
    sel=select_property(w,PROBE);sv=sel.get("value") or {}
    controls=capture_controls(w).get("value") or {}
    menus=probe_menus(w).get("value") or {}
    after_controls=capture_controls(w).get("value") or {}
    w.close()
    src=source_scan(app)

    keyword_controls=[]
    for x in after_controls.get("top",[]):
        blob=" ".join(str(x.get(k,"")) for k in ("text","aria","title","href","download","parentText"))
        if re.search(r"export|presentation|download|deck|share|more|action|menu|ellipsis|pdf|ppt|powerpoint",blob,re.I):
            keyword_controls.append(x)

    checks={
      "r16aDiagnosticComplete":r16a.get("status")=="DIAGNOSTIC_COMPLETE",
      "r16aExportControlNotFound":bool(r16a.get("outcomes")) and r16a["outcomes"][0].get("export",{}).get("controlFound") is False,
      "probeSelectedPropertyCertified":sv.get("ok") is True,
      "eventBearingRuntimeControlsCaptured":controls.get("count",0)>0,
      "menuOverflowProbeCompleted":isinstance(menus.get("observations"),list),
      "postMenuRuntimeControlsCaptured":after_controls.get("count",0)>0,
      "sourceExportPresentationReferencesCaptured":len(src)>0,
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True,
      "exportPresentationExecutionAuthorityOff":True
    }

    if keyword_controls:
        classification="RUNTIME_EXPORT_PRESENTATION_OR_MENU_AFFORDANCE_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R2_RESOLVED_EXPORT_PRESENTATION_CONTROL_LIVE_MICRO_COHORT_RECERTIFICATION"
    elif any(o.get("hits") for o in menus.get("observations",[])):
        classification="EXPORT_PRESENTATION_SURFACE_REVEALED_ONLY_AFTER_MENU_ACTIVATION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R2_RESOLVED_EXPORT_PRESENTATION_CONTROL_LIVE_MICRO_COHORT_RECERTIFICATION"
    else:
        classification="NO_DIRECT_RUNTIME_EXPORT_CONTROL_EXPORT_LIKELY_CONTEXTUAL_OR_NON_UI_SERVICE_PATH"
        nxt="M4_19D4BN17C_R4_R12_R16A_R2_EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_BINDING_RESOLUTION"

    passed=all(checks.values())
    status="PASSED" if passed else "BLOCKED"
    state="M419D4BN17C_R4_R12_R16A_R1_EXPORT_PRESENTATION_CONTROL_TARGET_DIAGNOSIS_CERTIFIED" if passed else "M419D4BN17C_R4_R12_R16A_R1_DIAGNOSIS_INCOMPLETE"
    diagnosis=classification if passed else "EXPORT_PRESENTATION_CONTROL_TARGET_DIAGNOSIS_INCOMPLETE"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R1_EXPORT_PRESENTATION_CONTROL_TARGET_AND_POST_ACTION_STATE_DIAGNOSIS",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
         "checks":checks,"probeProperty":PROBE,"selection":sv,"runtimeControlsBeforeMenu":controls,
         "menuProbe":menus,"runtimeControlsAfterMenu":after_controls,"keywordRelevantControls":keyword_controls[:80],
         "sourceReferences":src,"authority":{"applicationSourceMutation":False,"governedDataMutation":False,
         "pixelEvidence":False,"exportPresentationExecution":False},"nextMilestone":nxt}

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"export_presentation_control_target_and_post_action_state_diagnosis.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R1-R1 WebSocket Parser Repair + Export/Presentation Control Target Diagnosis")
    print("REPAIR: OVER_ESCAPED_WEBSOCKET_PORT_REGEX_CORRECTED")
    print("="*120)
    print("PROBE_PROPERTY:",PROBE)
    print("SELECTED_PROPERTY_CERTIFIED:",sv.get("ok"))
    print("EVENT_BEARING_CONTROL_COUNT:",controls.get("count"))
    print("MENU_OVERFLOW_TRIGGER_COUNT:",menus.get("candidateCount"))
    print("POST_MENU_EVENT_BEARING_CONTROL_COUNT:",after_controls.get("count"))
    print("KEYWORD_RELEVANT_RUNTIME_CONTROL_COUNT:",len(keyword_controls))
    print("SOURCE_REFERENCE_FILE_COUNT:",len(src))
    print("\n----- TOP RELEVANT RUNTIME CONTROLS -----")
    for x in keyword_controls[:25]:
        print(json.dumps({k:x.get(k) for k in ("tag","role","text","aria","title","href","download","handlers","parentText")},ensure_ascii=False))
    print("\n----- MENU PROBE OBSERVATIONS -----")
    for x in menus.get("observations",[])[:20]:print(json.dumps(x,ensure_ascii=False))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0 if passed else 7

if __name__=="__main__":raise SystemExit(main())
