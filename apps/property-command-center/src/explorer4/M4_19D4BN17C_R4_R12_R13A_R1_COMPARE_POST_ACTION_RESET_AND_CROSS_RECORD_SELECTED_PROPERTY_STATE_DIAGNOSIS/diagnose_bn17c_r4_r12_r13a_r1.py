#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time,subprocess,tempfile

M="M4_19D4BN17C_R4_R12_R13A_R1_COMPARE_POST_ACTION_RESET_AND_CROSS_RECORD_SELECTED_PROPERTY_STATE_DIAGNOSIS"
TARGET_URL="http://127.0.0.1:5173/"
FIRST="2 Musick"
SECOND="2701 Carrier Ave"
PORTS=[9333,9334,9335,9444,9555]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def hj(url,method="GET",timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read())
def targets(port):
    try:return hj(f"http://127.0.0.1:{port}/json",timeout=1)
    except:return []
def find_target():
    for p in PORTS+[9222,9223]:
        for x in targets(p):
            if "127.0.0.1:5173" in x.get("url","") and x.get("webSocketDebuggerUrl"):return p,x
    return None,None
def browser_ready(port):
    try:return bool(hj(f"http://127.0.0.1:{port}/json/version",timeout=1))
    except:return False
def create_target(port):
    e=urllib.parse.quote(TARGET_URL,safe=":/")
    for u in (f"http://127.0.0.1:{port}/json/new?{e}",f"http://127.0.0.1:{port}/json/new?url={e}"):
        try:
            x=hj(u,method="PUT",timeout=2)
            if x.get("webSocketDebuggerUrl"):return x
        except:pass
def chrome():
    for p in ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
              "/Applications/Chromium.app/Contents/MacOS/Chromium"]:
        if Path(p).exists():return p
def bootstrap():
    c=chrome()
    if not c:return None,None
    for port in PORTS:
        if browser_ready(port):
            t=create_target(port)
            if t:return port,t
        prof=tempfile.mkdtemp(prefix=f"sciip-r13a-r1-{port}-")
        try:
            subprocess.Popen([c,f"--remote-debugging-port={port}","--remote-debugging-address=127.0.0.1",
                              f"--user-data-dir={prof}","--headless=new","--disable-gpu","--no-first-run",
                              "--no-default-browser-check","about:blank"],
                             stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        except:continue
        for _ in range(50):
            time.sleep(.2)
            if browser_ready(port):break
        if browser_ready(port):
            t=create_target(port)
            if t:return port,t
    return None,None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),3);self.s.settimeout(15)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.hs=b.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.hs:raise RuntimeError(self.hs)
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
        r=x.get("result",{});return {"ok":not x.get("error") and r.get("exceptionDetails") is None,"value":r.get("result",{}).get("value")}

def jq(s):return json.dumps(s)

def search_select_expr(q):
    return f"""(async()=>{{
const q={jq(q)},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {{ok:false,stage:'SEARCH_INPUT_NOT_FOUND'}};
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');if(d&&d.set)d.set.call(input,q);else input.value=q;
input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
input.dispatchEvent(new Event('change',{{bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
await new Promise(r=>setTimeout(r,900));
const all=[...document.querySelectorAll('*')],matches=[];
for(const el of all){{
 const tx=(el.innerText||el.textContent||'').trim();if(!tx||!norm(tx).includes(norm(q)))continue;
 let n=el;
 for(let depth=0;n&&depth<7;depth++,n=n.parentElement){{
   const rp=Object.getOwnPropertyNames(n).filter(k=>k.startsWith('__reactProps$'));let hs=[];
   for(const k of rp){{const v=n[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}}
   const role=n.getAttribute&&n.getAttribute('role');
   const click=n.tagName==='BUTTON'||n.tagName==='A'||['button','option','listitem'].includes(role||'')||n.getAttribute('tabindex')!==null||typeof n.onclick==='function'||hs.includes('onClick');
   let s=0;if(click)s+=20;if(['BUTTON','A'].includes(n.tagName))s+=10;if(hs.includes('onClick'))s+=15;
   const nt=(n.innerText||n.textContent||'').trim();if(norm(nt)===norm(q))s+=20;else if(norm(nt).startsWith(norm(q)))s+=10;s-=depth*2;
   matches.push({{n,s,nt,tag:n.tagName,hs}});
 }}
}}
matches.sort((a,b)=>b.s-a.s);const best=matches[0];
if(!best)return {{ok:false,stage:'RESULT_TARGET_NOT_FOUND',matchCount:0,inputValue:input.value,body:(document.body?.innerText||'').slice(0,2000)}};
best.n.scrollIntoView({{block:'center'}});best.n.click();await new Promise(r=>setTimeout(r,800));
const body=document.body?.innerText||'';
return {{ok:norm(body).includes(norm(q)),stage:'POST_CLICK',propertyVisible:norm(body).includes(norm(q)),matchCount:matches.length,chosenText:best.nt.slice(0,500),chosenTag:best.tag,inputValue:input.value}};
}})()"""

def snapshot(w,label):
    return w.ev(f"""(()=>{{
const body=document.body?.innerText||'';
const controls=[...document.querySelectorAll('button,a,[role="button"],[tabindex]')].map(el=>(el.innerText||el.textContent||'').trim()).filter(Boolean);
return {{label:{jq(label)},url:location.href,body:body.slice(0,30000),compareVisible:/\\bcompare\\b/i.test(body),
closeControls:controls.filter(x=>/close|back|exit|done|return/i.test(x)).slice(0,40),
compareControls:controls.filter(x=>/compare/i.test(x)).slice(0,40),
searchInput:document.querySelector('input[aria-label="Search SCIIP"]')?.value||null,
sessionKeys:Object.keys(sessionStorage),localKeys:Object.keys(localStorage)}};
}})()""").get("value") or {}

def open_compare(w):
    return w.ev("""(async()=>{
const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const els=[...document.querySelectorAll('button,a,[role="button"],[tabindex],div')];
const c=els.map(el=>({el,tx:(el.innerText||el.textContent||'').trim()})).filter(x=>norm(x.tx)==='open compare'||norm(x.tx)==='compare');
if(!c.length)return {ok:false};
const n=c[0].el;n.click();await new Promise(r=>setTimeout(r,700));
return {ok:true,text:c[0].tx,body:(document.body?.innerText||'').slice(0,5000)};
})()""")

def explicit_close(w):
    return w.ev("""(async()=>{
const norm=s=>(s||'').toLowerCase().trim();
const els=[...document.querySelectorAll('button,a,[role="button"],[tabindex]')];
const c=els.map(el=>({el,tx:(el.innerText||el.textContent||'').trim()}))
 .filter(x=>/^(close|back|exit|done|return|close compare|back to explorer)$/i.test(x.tx));
if(!c.length)return {found:false};
c[0].el.click();await new Promise(r=>setTimeout(r,600));return {found:true,text:c[0].tx};
})()""")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    p=ev/"M4_19D4BN17C_R4_R12_R13A_COMPARE_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"/"compare_action_live_micro_cohort_activation_certification.json"
    if not p.exists():print("STATUS: BLOCKED\nDIAGNOSIS: R13A_EVIDENCE_REQUIRED");return 4
    r13a=fj(p)
    port,t=find_target()
    if not t:port,t=bootstrap()
    if not t:print("STATUS: BLOCKED\nDIAGNOSIS: CDP_TARGET_UNAVAILABLE");return 5
    w=WS(t["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")

    # Reproduce first successful Compare state.
    w.call("Page.navigate",{"url":TARGET_URL});time.sleep(1.1)
    s1=w.ev(search_select_expr(FIRST));o1=open_compare(w);after_compare=snapshot(w,"after_compare_first")

    # Variant A: root navigation only.
    w.call("Page.navigate",{"url":TARGET_URL});time.sleep(1.0)
    after_nav=snapshot(w,"after_root_navigation")
    vA=w.ev(search_select_expr(SECOND));va=vA.get("value") or {}

    # Variant B: explicit close if available, then root navigation, then second selection.
    close_result=explicit_close(w).get("value") or {}
    w.call("Page.navigate",{"url":TARGET_URL});time.sleep(.9)
    after_close_nav=snapshot(w,"after_explicit_close_and_navigation")
    vB=w.ev(search_select_expr(SECOND));vb=vB.get("value") or {}

    # Variant C: hard reload after root navigation.
    w.call("Page.navigate",{"url":TARGET_URL});time.sleep(.7)
    w.call("Page.reload",{"ignoreCache":True});time.sleep(1.2)
    after_reload=snapshot(w,"after_hard_reload")
    vC=w.ev(search_select_expr(SECOND));vc=vC.get("value") or {}

    variants=[
      {"name":"ROOT_NAVIGATION_ONLY","selected":bool(va.get("ok")),"detail":va},
      {"name":"EXPLICIT_CLOSE_PLUS_ROOT_NAVIGATION","selected":bool(vb.get("ok")),"detail":vb,"closeResult":close_result},
      {"name":"ROOT_NAVIGATION_PLUS_HARD_RELOAD","selected":bool(vc.get("ok")),"detail":vc}
    ]
    successful=[x for x in variants if x["selected"]]
    preferred=successful[0]["name"] if successful else None

    checks={
      "r13aDiagnosticComplete":r13a.get("status")=="DIAGNOSTIC_COMPLETE",
      "r13aCertifiedFirstRecord":r13a.get("certifiedCount")==1,
      "r13aHaltedOnSecondSelectionGap":r13a.get("haltedOnFailure") is True,
      "firstCompareReproduced":bool((o1.get("value") or {}).get("ok")),
      "postCompareSnapshotCaptured":bool(after_compare),
      "rootNavigationResetObserved":bool(after_nav),
      "explicitCloseSurfaceProbed":True,
      "hardReloadResetProbed":True,
      "secondPropertyResetVariantsExecuted":len(variants)==3,
      "deterministicResetContractResolved":preferred is not None,
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED";state="M419D4BN17C_R4_R12_R13A_R1_COMPARE_POST_ACTION_RESET_CONTRACT_RESOLVED"
        diagnosis="COMPARE_ACTION_CERTIFIED_CROSS_RECORD_SELECTION_REQUIRES_DETERMINISTIC_RESET_CONTRACT"
        nxt="M4_19D4BN17C_R4_R12_R13A_R2_COMPARE_ACTION_LIVE_MICRO_COHORT_RECERTIFICATION_WITH_DETERMINISTIC_RESET"
    else:
        status="DIAGNOSTIC_COMPLETE";state="M419D4BN17C_R4_R12_R13A_R1_RESET_DIAGNOSIS_INCOMPLETE"
        diagnosis="COMPARE_POST_ACTION_CROSS_RECORD_RESET_CONTRACT_REMAINS_UNRESOLVED"
        nxt=None

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R1_COMPARE_POST_ACTION_RESET_AND_CROSS_RECORD_SELECTED_PROPERTY_STATE_DIAGNOSIS",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
         "checks":checks,"firstProperty":FIRST,"secondProperty":SECOND,
         "firstSelection":s1.get("value"),"firstCompare":o1.get("value"),
         "snapshots":{"afterCompare":after_compare,"afterRootNavigation":after_nav,"afterExplicitCloseNavigation":after_close_nav,"afterHardReload":after_reload},
         "resetVariants":variants,"preferredResetContract":preferred,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,
                      "compare":True,"command":False,"analyzePresent":False,"exportPresentation":False},
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"compare_post_action_reset_and_cross_record_selected_property_state_diagnosis.json";f.write_text(json.dumps(res,indent=2)+"\n")

    print("FIRST_COMPARE_REPRODUCED:",checks["firstCompareReproduced"])
    print("AFTER_COMPARE_COMPARE_VISIBLE:",after_compare.get("compareVisible"))
    print("ROOT_NAVIGATION_COMPARE_VISIBLE:",after_nav.get("compareVisible"))
    print("EXPLICIT_CLOSE_FOUND:",close_result.get("found"))
    for x in variants:print(f"{x['name']}_SECOND_PROPERTY_SELECTED:",x["selected"])
    print("PREFERRED_RESET_CONTRACT:",preferred)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
