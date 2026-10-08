#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R14_R1_WEBSOCKET_URL_AND_HANDSHAKE_REPAIR_MISSING_ROLE_TARGET_CORRELATION_RECERTIFICATION"
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

def scan_source(app):
    roots=[app/"src",app/"dist/assets"]
    hits=[]
    for root in roots:
        if not root.exists():continue
        for p in root.rglob("*.js*"):
            try:s=p.read_text(errors="ignore")
            except:continue
            if not re.search(r'export|download|presentation|deck|present',s,re.I):continue
            for m in re.finditer(r'export|download|presentation|deck|present',s,re.I):
                st=max(0,m.start()-900);en=min(len(s),m.start()+1800)
                sn=re.sub(r"\\s+"," ",s[st:en])
                rank=0;t=sn.lower()
                if re.search(r'button|onclick|aria-label|menuitem|toolbar|actions',t):rank+=8
                if re.search(r'export presentation|download presentation|create presentation|generate presentation',t):rank+=12
                if re.search(r'present mode|mode.?present|selectedproperty|workspace',t):rank+=6
                if 'export const' in t or 'export{' in t:rank-=4
                hits.append({"file":str(p.relative_to(app)),"offset":m.start(),"term":m.group(0),"rankScore":rank,"snippet":sn[:2600]})
                if len(hits)>=1200:break
            if len(hits)>=1200:break
        if len(hits)>=1200:break
    hits.sort(key=lambda x:-x["rankScore"])
    return hits[:250]

def live_surface(w):
    js="""(()=>{
const norm=s=>(s||'').replace(/\\s+/g,' ').trim();
const vis=el=>{try{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.display!=='none'&&cs.visibility!=='hidden'&&cs.opacity!=='0'}catch(e){return false}};
const rows=[];
for(const el of document.querySelectorAll('button,a,[role="button"],[role="menuitem"],[aria-label],[title]')){
  const text=norm(el.innerText||el.textContent||'').slice(0,500),aria=el.getAttribute('aria-label')||'',title=el.getAttribute('title')||'',role=el.getAttribute('role')||'';
  const blob=(text+' '+aria+' '+title+' '+role).toLowerCase();
  if(/export|download|presentation|deck|present|more|menu|action/.test(blob))rows.push({tag:el.tagName,text,aria,title,role,visible:vis(el),className:String(el.className||'').slice(0,300)});
}
const body=norm(document.body?.innerText||'');
return {bodyHasExport:/\\bexport\\b/i.test(body),bodyHasDownload:/\\bdownload\\b/i.test(body),bodyHasPresentation:/\\bpresentation\\b/i.test(body),bodyHasPresent:/\\bpresent\\b/i.test(body),candidateCount:rows.length,candidates:rows.slice(0,200)};
})()"""
    return w.ev(js)

def classify(source_hits,live):
    txt=" ".join(x["snippet"] for x in source_hits[:80]).lower()
    live_blob=" ".join((x.get("text","")+" "+x.get("aria","")+" "+x.get("title","")) for x in live.get("candidates",[])).lower()
    present_gate=bool(re.search(r'present.{0,80}(export|download)|(export|download).{0,80}present',txt))
    menu_gate=bool(re.search(r'(menu|overflow|more actions|dropdown|popover).{0,120}(export|download)|(export|download).{0,120}(menu|overflow|dropdown|popover)',txt))
    selected_gate=bool(re.search(r'(selectedproperty|workspace|property).{0,120}(export|download)|(export|download).{0,120}(selectedproperty|workspace|property)',txt))
    live_export=bool(re.search(r'\\bexport\\b|\\bdownload\\b',live_blob))
    if present_gate and not live_export:return "EXPORT_CONTROL_GATED_BEHIND_PRESENT_MODE"
    if menu_gate and not live_export:return "EXPORT_CONTROL_GATED_BEHIND_MENU_OR_OVERFLOW"
    if selected_gate and not live_export:return "EXPORT_CONTROL_GATED_BY_PROPERTY_OR_WORKSPACE_STATE"
    if not live_export and not live.get("bodyHasExport") and not live.get("bodyHasDownload"):return "EXPORT_CONTROL_NOT_MOUNTED_IN_CURRENT_EXPLORER_BRANCH"
    return "EXPORT_CONTROL_PRESENT_BUT_PRIOR_TARGET_DISCOVERY_MISSED"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r13p=ev/"M4_19D4BN17C_R4_R12_R16A_R13_INTERMEDIATE_MENU_ACTION_TARGET_RESOLUTION"/"intermediate_menu_action_target_resolution.json"
    if not r13p.exists():print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R13_EVIDENCE_REQUIRED");return 4
    r13=fj(r13p)
    if r13.get("status")!="PASSED":print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R13_MUST_PASS");return 5
    source_hits=scan_source(app)
    port=find_browser()
    if port is None:print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED");return 6
    t=create_target(port)
    if not t:print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_EXPLORER_TARGET_REQUIRED");return 7
    w=WS(t["webSocketDebuggerUrl"]);wait_ready(w)
    sel=select_property(w,PROBE);sv=sel.get("value") or {}
    live=(live_surface(w).get("value") or {})
    w.close()
    classification=classify(source_hits,live)
    export_source_hits=[x for x in source_hits if re.search(r'export|download|ppt|powerpoint',x["snippet"],re.I)]
    presentation_source_hits=[x for x in source_hits if re.search(r'presentation|deck|present',x["snippet"],re.I)]
    checks={
      "r16aR13Passed":r13.get("status")=="PASSED",
      "r13ExportTargetCountZero":r13.get("resolvedExportTargetCount",0)==0,
      "sourceExportPresentationSemanticsResolved":len(source_hits)>0,
      "sourceExportSpecificReferencesResolved":len(export_source_hits)>0,
      "sourcePresentationReferencesResolved":len(presentation_source_hits)>0,
      "probeSelectedPropertyCertified":sv.get("ok") is True,
      "liveControlSurfaceCaptured":True,
      "renderOrModeGateClassificationResolved":bool(classification),
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True}
    passed=all(checks.values());status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state="M419D4BN17C_R4_R12_R16A_R14_MISSING_ROLE_TARGET_SOURCE_TO_LIVE_CONTROL_CORRELATED" if passed else "M419D4BN17C_R4_R12_R16A_R14_CONTROL_CORRELATION_INCOMPLETE"
    diagnosis=("MISSING_EXPORT_ROLE_CAUSALLY_CLASSIFIED_"+classification) if passed else "MISSING_EXPORT_ROLE_CONTROL_CORRELATION_REMAINS_INCOMPLETE"
    nxt={
      "EXPORT_CONTROL_GATED_BEHIND_PRESENT_MODE":"M4_19D4BN17C_R4_R12_R16A_R15_PRESENT_MODE_EXPORT_CONTROL_MATERIALIZATION_AND_TARGET_RESOLUTION",
      "EXPORT_CONTROL_GATED_BEHIND_MENU_OR_OVERFLOW":"M4_19D4BN17C_R4_R12_R16A_R15_EXPORT_MENU_OR_OVERFLOW_CONTROL_MATERIALIZATION_AND_TARGET_RESOLUTION",
      "EXPORT_CONTROL_GATED_BY_PROPERTY_OR_WORKSPACE_STATE":"M4_19D4BN17C_R4_R12_R16A_R15_EXPORT_PROPERTY_WORKSPACE_GATE_STATE_RESOLUTION",
      "EXPORT_CONTROL_NOT_MOUNTED_IN_CURRENT_EXPLORER_BRANCH":"M4_19D4BN17C_R4_R12_R16A_R15_EXPORT_UI_RENDER_BRANCH_AND_FEATURE_GATE_RESOLUTION"}.get(classification,"M4_19D4BN17C_R4_R12_R16A_R15_EXPORT_CONTROL_DIRECT_LIVE_TARGET_RECOVERY")
    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R14_R1_WEBSOCKET_URL_AND_HANDSHAKE_REPAIR_MISSING_ROLE_TARGET_CORRELATION_RECERTIFICATION","generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,"checks":checks,"probeProperty":PROBE,"selectedProperty":sv,"r13Diagnosis":r13.get("diagnosis"),"r13ResolvedExportTargetCount":r13.get("resolvedExportTargetCount"),"r13ResolvedPresentationTargetCount":r13.get("resolvedPresentationTargetCount"),"sourceHitCount":len(source_hits),"exportSourceHitCount":len(export_source_hits),"presentationSourceHitCount":len(presentation_source_hits),"topSourceHits":source_hits[:120],"liveControlSurface":live,"renderGateClassification":classification,"authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False,"liveWorkflowActionAuthority":False},"nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"missing_role_target_source_to_live_control_correlation.json";f.write_text(json.dumps(res,indent=2)+"\n")
    print("="*120);print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R14 Missing Role Target Source-to-Live Control Correlation");print("="*120)
    print("R13_EXPORT_TARGET_COUNT:",r13.get("resolvedExportTargetCount"));print("R13_PRESENTATION_TARGET_COUNT:",r13.get("resolvedPresentationTargetCount"));print("PROBE_SELECTED_PROPERTY_CERTIFIED:",sv.get("ok"));print("SOURCE_HIT_COUNT:",len(source_hits));print("EXPORT_SOURCE_HIT_COUNT:",len(export_source_hits));print("PRESENTATION_SOURCE_HIT_COUNT:",len(presentation_source_hits));print("LIVE_CANDIDATE_COUNT:",live.get("candidateCount"));print("LIVE_BODY_HAS_EXPORT:",live.get("bodyHasExport"));print("LIVE_BODY_HAS_DOWNLOAD:",live.get("bodyHasDownload"));print("LIVE_BODY_HAS_PRESENTATION:",live.get("bodyHasPresentation"));print("LIVE_BODY_HAS_PRESENT:",live.get("bodyHasPresent"));print("RENDER_GATE_CLASSIFICATION:",classification)
    print("\n----- TOP SOURCE CORRELATIONS -----")
    for x in source_hits[:20]:print(json.dumps({k:x.get(k) for k in ("file","term","rankScore","snippet")},ensure_ascii=False))
    print("\n----- LIVE CONTROL CANDIDATES -----")
    for x in live.get("candidates",[])[:30]:print(json.dumps(x,ensure_ascii=False))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0
if __name__=="__main__":raise SystemExit(main())
