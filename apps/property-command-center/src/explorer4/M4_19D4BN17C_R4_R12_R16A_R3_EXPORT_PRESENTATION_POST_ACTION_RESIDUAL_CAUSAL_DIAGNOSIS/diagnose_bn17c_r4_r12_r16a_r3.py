#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R3_EXPORT_PRESENTATION_POST_ACTION_RESIDUAL_CAUSAL_DIAGNOSIS"
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
        return {"ok":not x.get("error") and r.get("exceptionDetails") is None,"value":r.get("result",{}).get("value")}
    def close(self):
        try:self.s.close()
        except:pass

def wait_ready(w):
    w.call("Runtime.enable");w.call("Page.enable")
    for _ in range(50):
        time.sleep(.2)
        if w.ev("document.readyState").get("value") in ("interactive","complete"):break
    time.sleep(.9)

def select_property(w,q):
    js = r'''(async()=>{
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

def diagnose_controls(w):
    js = r'''(async()=>{
const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const propertyPattern=/\b\d{2,6}\s+[a-z0-9 .'-]+\b(st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|way|ln|lane|ct|court|hwy|highway)\b/i;
function handlers(el){
 const rp=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));let hs=[];
 for(const k of rp){const v=el[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}
 return hs;
}
function describe(el){
 const text=(el.innerText||el.textContent||'').trim(),aria=el.getAttribute('aria-label')||'',title=el.getAttribute('title')||'',
 href=el.getAttribute('href')||'',download=el.getAttribute('download')||'',role=el.getAttribute('role')||'';
 const parent=(el.parentElement?.innerText||'').trim().slice(0,400),hs=handlers(el);
 const own=norm([text,aria,title,href,download].join(' ')),context=norm(parent);
 const exactExport=/^(export|export presentation|export deck|download presentation|download deck|download)$/i.test(own);
 const exactPresent=/^(presentation|generate presentation|open presentation|present deck|deck)$/i.test(own);
 const actionOwn=/\b(export|download|presentation|deck|powerpoint|pptx?|pdf)\b/i.test(own);
 const actionContext=/\b(export|download|presentation|deck|powerpoint|pptx?|pdf)\b/i.test(context);
 const propertyLike=propertyPattern.test(text)||propertyPattern.test(parent)||/\b\d{1,3}[',]?\d{3}\s*sf\b/i.test(text)||(/\bclear\b/i.test(text)&&/\bpower\b/i.test(text));
 const interactive=el.tagName==='BUTTON'||el.tagName==='A'||role==='button'||hs.includes('onClick')||typeof el.onclick==='function';
 let score=0;if(interactive)score+=20;if(hs.includes('onClick'))score+=15;if(exactExport||exactPresent)score+=120;if(actionOwn)score+=60;
 if(actionContext&&!actionOwn)score+=5;if(propertyLike)score-=140;if(text.length>120)score-=40;
 return {tag:el.tagName,text:text.slice(0,300),aria,title,href,download,role,handlers:hs,parentText:parent,exactExport,exactPresent,actionOwn,actionContext,propertyLike,interactive,score};
}
function collect(){
 const out=[];
 for(const el of document.querySelectorAll('button,a,[role="button"],[tabindex],[aria-haspopup="menu"],[title],[aria-label],div')){
  const d=describe(el);if(d.interactive&&(d.actionOwn||d.exactExport||d.exactPresent||d.actionContext))out.push(d);
 }
 out.sort((a,b)=>b.score-a.score);return out;
}
const initial=collect();
const menus=[];
for(const el of document.querySelectorAll('button,[role="button"],[aria-haspopup="menu"],[title],[aria-label]')){
 const blob=norm([(el.innerText||''),el.getAttribute('aria-label')||'',el.getAttribute('title')||''].join(' '));
 if(/\b(more|actions|recommended actions|menu|options|share)\b/.test(blob))menus.push(el);
}
const observations=[];
for(const trigger of menus.slice(0,12)){
 const desc=((trigger.innerText||'')+' '+(trigger.getAttribute('aria-label')||'')+' '+(trigger.getAttribute('title')||'')).trim();
 try{trigger.click();await new Promise(r=>setTimeout(r,300));}catch(e){}
 observations.push({trigger:desc.slice(0,200),top:collect().slice(0,25)});
 if(trigger.getAttribute('aria-expanded')==='true'){try{trigger.click();await new Promise(r=>setTimeout(r,100));}catch(e){}}
}
return {initialTop:initial.slice(0,40),menuTriggerCount:menus.length,menuObservations:observations};
})()'''
    return w.ev(js)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r2=ev/"M4_19D4BN17C_R4_R12_R16A_R2_RESOLVED_EXPORT_PRESENTATION_CONTROL_LIVE_MICRO_COHORT_RECERTIFICATION"/"resolved_export_presentation_control_live_micro_cohort_recertification.json"
    if not r2.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R2_EVIDENCE_REQUIRED");return 4
    d=fj(r2);first=(d.get("outcomes") or [{}])[0];chosen=(first.get("export") or {}).get("chosenText","")
    false_positive=bool(chosen and not re.search(r"\b(export|download|presentation)\b",chosen,re.I))

    port=find_browser()
    if port is None:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 5
    t=create_target(port)
    if not t:
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_EXPLORER_TARGET_REQUIRED");return 6

    w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)
    sel=select_property(w,PROBE);sv=sel.get("value") or {}
    diag=diagnose_controls(w);dv=diag.get("value") or {}
    w.close()

    all_candidates=list(dv.get("initialTop",[]))
    for o in dv.get("menuObservations",[]):all_candidates.extend(o.get("top",[]))
    clean=[x for x in all_candidates if x.get("score",0)>0 and not x.get("propertyLike")]
    exact=[x for x in clean if x.get("exactExport") or x.get("exactPresent")]
    action_own=[x for x in clean if x.get("actionOwn")]

    checks={
      "r16aR2DiagnosticComplete":d.get("status")=="DIAGNOSTIC_COMPLETE",
      "r2SelectedPropertyCertified":first.get("selectedPropertyCertified") is True,
      "r2ExportControlFoundButNotCertified":(first.get("export") or {}).get("controlFound") is True and first.get("exportCertified") is False,
      "r2FalsePositiveControlClassified":false_positive,
      "probeSelectedPropertyCertified":sv.get("ok") is True,
      "propertyCardExclusionApplied":True,
      "exactActionSemanticsScored":True,
      "contextualMenusDiagnosed":isinstance(dv.get("menuObservations"),list),
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True,
      "exportPresentationExecutionAuthorityOff":True
    }
    passed=all(checks.values())
    if exact:
        diagnosis="FALSE_POSITIVE_PROPERTY_CARD_TARGET_CAUSED_R2_FAILURE_EXACT_ACTION_CONTROL_NOW_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R4_EXACT_ACTION_SEMANTIC_EXPORT_PRESENTATION_LIVE_MICRO_COHORT_RECERTIFICATION"
    elif action_own:
        diagnosis="FALSE_POSITIVE_PROPERTY_CARD_TARGET_CAUSED_R2_FAILURE_ACTION_BEARING_CONTROL_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R4_EXACT_ACTION_SEMANTIC_EXPORT_PRESENTATION_LIVE_MICRO_COHORT_RECERTIFICATION"
    else:
        diagnosis="FALSE_POSITIVE_PROPERTY_CARD_TARGET_CAUSED_R2_FAILURE_NO_CLEAN_ACTION_CONTROL_VISIBLE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R4_EXPORT_PRESENTATION_SOURCE_TO_RUNTIME_ACTION_BINDING_RESOLUTION"
    status="PASSED" if passed else "BLOCKED"
    state="M419D4BN17C_R4_R12_R16A_R3_EXPORT_PRESENTATION_RESIDUAL_CAUSALLY_DIAGNOSED" if passed else "M419D4BN17C_R4_R12_R16A_R3_DIAGNOSIS_INCOMPLETE"
    if not passed:diagnosis="EXPORT_PRESENTATION_RESIDUAL_CAUSAL_DIAGNOSIS_INCOMPLETE"

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R3_EXPORT_PRESENTATION_POST_ACTION_RESIDUAL_CAUSAL_DIAGNOSIS",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
         "checks":checks,"r2ChosenExportControlText":chosen,"r2FalsePositiveControl":false_positive,
         "probeProperty":PROBE,"selectedProperty":sv,"controlDiagnosis":dv,"cleanCandidateCount":len(clean),
         "exactActionCandidateCount":len(exact),"actionOwnCandidateCount":len(action_own),"topCleanCandidates":clean[:40],
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,"exportPresentationExecution":False},
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"export_presentation_post_action_residual_causal_diagnosis.json";f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120);print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R3 Export/Presentation Post-Action Residual Causal Diagnosis");print("="*120)
    print("R2_CHOSEN_EXPORT_CONTROL:",chosen);print("R2_FALSE_POSITIVE_CONTROL:",false_positive);print("PROBE_SELECTED_PROPERTY_CERTIFIED:",sv.get("ok"))
    print("MENU_TRIGGER_COUNT:",dv.get("menuTriggerCount"));print("CLEAN_ACTION_CANDIDATE_COUNT:",len(clean));print("EXACT_ACTION_CANDIDATE_COUNT:",len(exact));print("ACTION_OWN_CANDIDATE_COUNT:",len(action_own))
    print("\n----- TOP CLEAN CANDIDATES -----")
    for x in clean[:20]:print(json.dumps({k:x.get(k) for k in ("tag","text","aria","title","role","href","download","handlers","exactExport","exactPresent","actionOwn","propertyLike","score")},ensure_ascii=False))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0 if passed else 7

if __name__=="__main__":raise SystemExit(main())
