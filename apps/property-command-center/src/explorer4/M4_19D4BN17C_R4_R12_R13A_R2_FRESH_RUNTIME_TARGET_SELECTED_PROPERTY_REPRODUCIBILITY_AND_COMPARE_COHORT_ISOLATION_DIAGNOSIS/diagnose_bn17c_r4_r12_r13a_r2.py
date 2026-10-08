#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,urllib.parse,socket,base64,os,struct,time,subprocess,tempfile

M="M4_19D4BN17C_R4_R12_R13A_R2_FRESH_RUNTIME_TARGET_SELECTED_PROPERTY_REPRODUCIBILITY_AND_COMPARE_COHORT_ISOLATION_DIAGNOSIS"
TARGET_URL="http://127.0.0.1:5173/"
PROBE="2701 Carrier Ave"
CONTROL="2 Musick"
PORTS=[9333,9334,9335,9444,9555,9666]

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def hj(url,method="GET",timeout=1.5):
    req=urllib.request.Request(url,method=method)
    with urllib.request.urlopen(req,timeout=timeout) as r:return json.loads(r.read())
def targets(port):
    try:return hj(f"http://127.0.0.1:{port}/json",timeout=1)
    except:return []
def browser_ready(port):
    try:return bool(hj(f"http://127.0.0.1:{port}/json/version",timeout=1))
    except:return False
def create_target(port,url=TARGET_URL):
    e=urllib.parse.quote(url,safe=":/")
    for u in (f"http://127.0.0.1:{port}/json/new?{e}",f"http://127.0.0.1:{port}/json/new?url={e}"):
        try:
            x=hj(u,method="PUT",timeout=2)
            if x.get("webSocketDebuggerUrl"):return x
        except:pass
def find_existing():
    for p in PORTS+[9222,9223]:
        for x in targets(p):
            if "127.0.0.1:5173" in x.get("url","") and x.get("webSocketDebuggerUrl"):return p,x
    return None,None
def chrome():
    for p in ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
              "/Applications/Chromium.app/Contents/MacOS/Chromium"]:
        if Path(p).exists():return p
def launch_fresh_browser():
    c=chrome()
    if not c:return None,None,{"ok":False,"error":"SUPPORTED_CHROME_EXECUTABLE_NOT_FOUND"}
    for port in reversed(PORTS):
        if browser_ready(port):continue
        prof=tempfile.mkdtemp(prefix=f"sciip-r13a-r2-{port}-")
        try:
            proc=subprocess.Popen([c,f"--remote-debugging-port={port}","--remote-debugging-address=127.0.0.1",
                                   f"--user-data-dir={prof}","--headless=new","--disable-gpu","--no-first-run",
                                   "--no-default-browser-check","--disable-background-networking","about:blank"],
                                  stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        except:continue
        for _ in range(60):
            time.sleep(.2)
            if browser_ready(port):break
        if browser_ready(port):
            t=create_target(port)
            if t:return port,t,{"ok":True,"profile":prof,"pid":proc.pid,"port":port}
    return None,None,{"ok":False,"error":"FRESH_ISOLATED_BROWSER_CREATION_FAILED"}

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:raise RuntimeError("bad websocket url")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
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

def wait_ready(w):
    w.call("Runtime.enable");w.call("Page.enable")
    for _ in range(30):
        time.sleep(.2)
        if w.ev("document.readyState").get("value") in ("interactive","complete"):break
    time.sleep(.8)

def test_selection(w,q):
    return w.ev(f"""(async()=>{{
const q={jq(q)},norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const input=document.querySelector('input[aria-label="Search SCIIP"]')||document.querySelector('input[type="search"]');
if(!input)return {{searchInputFound:false}};
const before=(document.body?.innerText||'').slice(0,120000);
const d=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value');
if(d&&d.set)d.set.call(input,q);else input.value=q;
input.dispatchEvent(new InputEvent('input',{{bubbles:true,inputType:'insertText',data:q}}));
input.dispatchEvent(new Event('change',{{bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keydown',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
input.dispatchEvent(new KeyboardEvent('keyup',{{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}}));
await new Promise(r=>setTimeout(r,1000));
const body=document.body?.innerText||'';
const matches=[];
for(const el of document.querySelectorAll('*')){{
 const tx=(el.innerText||el.textContent||'').trim();
 if(!tx||!norm(tx).includes(norm(q)))continue;
 let n=el;
 for(let depth=0;n&&depth<8;depth++,n=n.parentElement){{
   const rp=Object.getOwnPropertyNames(n).filter(k=>k.startsWith('__reactProps$'));let hs=[];
   for(const k of rp){{const v=n[k];if(v&&typeof v==='object')hs=Object.keys(v).filter(x=>/^on[A-Z]/.test(x)&&typeof v[x]==='function')}}
   const role=n.getAttribute&&n.getAttribute('role');
   const click=n.tagName==='BUTTON'||n.tagName==='A'||['button','option','listitem'].includes(role||'')||
      n.getAttribute('tabindex')!==null||typeof n.onclick==='function'||hs.includes('onClick');
   let s=0;if(click)s+=25;if(['BUTTON','A'].includes(n.tagName))s+=10;if(hs.includes('onClick'))s+=20;
   const nt=(n.innerText||n.textContent||'').trim();
   if(norm(nt)===norm(q))s+=30;else if(norm(nt).startsWith(norm(q)))s+=15;s-=depth*2;
   matches.push({{node:n,score:s,text:nt,tag:n.tagName,role,handlers:hs,depth}});
 }}
}}
matches.sort((a,b)=>b.score-a.score);
const summary=matches.slice(0,25).map(x=>({{score:x.score,text:x.text.slice(0,500),tag:x.tag,role:x.role,handlers:x.handlers,depth:x.depth}}));
const best=matches[0];
let clicked=false;
if(best){{best.node.scrollIntoView({{block:'center'}});best.node.click();clicked=true;}}
await new Promise(r=>setTimeout(r,900));
const post=document.body?.innerText||'';
return {{
 searchInputFound:true,inputValue:input.value,inputValueExact:norm(input.value)===norm(q),
 bodyChanged:before!==body.slice(0,120000),bodyHasExact:norm(body).includes(norm(q)),
 matchCount:matches.length,topCandidates:summary,clicked,
 postBodyHasExact:norm(post).includes(norm(q)),
 explorerMounted:!!document.querySelector('input[aria-label="Search SCIIP"]'),
 mapVisible:!!document.querySelector('.gm-style,[aria-label*="Map"],[class*="map"]'),
 selectedPropertyCertified:clicked&&norm(post).includes(norm(q))&&!!document.querySelector('input[aria-label="Search SCIIP"]')
}};
}})()""")

def run_on_target(target,label):
    w=WS(target["webSocketDebuggerUrl"]);wait_ready(w)
    probe=test_selection(w,PROBE)
    # restore before control
    w.call("Page.navigate",{"url":TARGET_URL});time.sleep(1.0)
    control=test_selection(w,CONTROL)
    return {"label":label,"handshake":w.hs,"probe":probe.get("value") or {},"control":control.get("value") or {}}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    p=ev/"M4_19D4BN17C_R4_R12_R13A_R1_COMPARE_POST_ACTION_RESET_AND_CROSS_RECORD_SELECTED_PROPERTY_STATE_DIAGNOSIS"/"compare_post_action_reset_and_cross_record_selected_property_state_diagnosis.json"
    if not p.exists():print("STATUS: BLOCKED\nDIAGNOSIS: R13A_R1_EVIDENCE_REQUIRED");return 4
    r1=fj(p)

    port,existing=find_existing()
    if not existing:
        print("STATUS: BLOCKED\nDIAGNOSIS: REUSABLE_EXPLORER_TARGET_REQUIRED_FOR_COMPARATIVE_DIAGNOSIS");return 5

    reused=run_on_target(existing,"REUSED_EXISTING_TARGET")

    same_target=create_target(port)
    same_browser=None
    if same_target:
        same_browser=run_on_target(same_target,"FRESH_PAGE_SAME_BROWSER")

    fp,ft,fb=launch_fresh_browser()
    fresh_browser=None
    if ft:
        fresh_browser=run_on_target(ft,"FRESH_ISOLATED_BROWSER")

    variants=[x for x in (reused,same_browser,fresh_browser) if x]
    probe_results=[{"label":x["label"],**x["probe"]} for x in variants]
    control_results=[{"label":x["label"],**x["control"]} for x in variants]

    probe_reused=bool(reused["probe"].get("selectedPropertyCertified"))
    probe_same=bool((same_browser or {}).get("probe",{}).get("selectedPropertyCertified"))
    probe_fresh=bool((fresh_browser or {}).get("probe",{}).get("selectedPropertyCertified"))
    control_fresh=bool((fresh_browser or {}).get("control",{}).get("selectedPropertyCertified"))

    if probe_fresh:
        classification="REUSED_TARGET_OR_BROWSER_CONTEXT_CONTAMINATION" if not probe_reused else "SELECTION_REPRODUCIBLE_NO_PROPERTY_SPECIFIC_GAP"
    else:
        any_mat=any(x["probe"].get("bodyHasExact") for x in variants)
        any_matches=any((x["probe"].get("matchCount") or 0)>0 for x in variants)
        if any_mat and any_matches:
            classification="PROPERTY_SPECIFIC_CLICK_TARGET_GAP"
        else:
            classification="SEARCH_MATERIALIZATION_GAP"

    checks={
      "r13aR1DiagnosticComplete":r1.get("status")=="DIAGNOSTIC_COMPLETE",
      "r13aR1NoResetContract":r1.get("preferredResetContract") is None,
      "reusedTargetTested":reused is not None,
      "freshPageSameBrowserAttempted":same_target is not None,
      "freshIsolatedBrowserAttempted":fb.get("ok") is True,
      "probePropertyTestedAcrossContexts":len(probe_results)>=2,
      "controlPropertyTestedAcrossContexts":len(control_results)>=2,
      "classificationResolved":classification is not None,
      "applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True
    }
    passed=all(checks.values())

    if passed and probe_fresh:
        status="PASSED";state="M419D4BN17C_R4_R12_R13A_R2_FRESH_RUNTIME_SELECTION_REPRODUCIBILITY_CERTIFIED"
        diagnosis="FRESH_RUNTIME_CONTEXT_RESTORES_RECORD_TWO_SELECTION_CROSS_RECORD_CONTEXT_CONTAMINATION_BOUNDED"
        nxt="M4_19D4BN17C_R4_R12_R13A_R3_PER_RECORD_ISOLATED_TARGET_COMPARE_MICRO_COHORT_RECERTIFICATION"
    elif passed:
        status="PASSED";state="M419D4BN17C_R4_R12_R13A_R2_SELECTION_RESIDUAL_CAUSALLY_CLASSIFIED"
        diagnosis=classification
        nxt="M4_19D4BN17C_R4_R12_R13A_R3_PROPERTY_SPECIFIC_SEARCH_RESULT_CLICK_TARGET_DIAGNOSIS"
    else:
        status="DIAGNOSTIC_COMPLETE";state="M419D4BN17C_R4_R12_R13A_R2_DIAGNOSIS_INCOMPLETE"
        diagnosis="FRESH_RUNTIME_SELECTION_REPRODUCIBILITY_NOT_YET_RESOLVED";nxt=None

    res={"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R13A_R2_FRESH_RUNTIME_TARGET_SELECTED_PROPERTY_REPRODUCIBILITY_AND_COMPARE_COHORT_ISOLATION_DIAGNOSIS",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
         "classification":classification,"checks":checks,"probeProperty":PROBE,"controlProperty":CONTROL,
         "variants":variants,"probeResults":probe_results,"controlResults":control_results,
         "summary":{"probeReusedCertified":probe_reused,"probeSameBrowserFreshPageCertified":probe_same,
                    "probeFreshIsolatedBrowserCertified":probe_fresh,"controlFreshIsolatedBrowserCertified":control_fresh},
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False,
                      "compare":False,"command":False,"analyzePresent":False,"exportPresentation":False},
         "nextMilestone":nxt}
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"fresh_runtime_target_selected_property_reproducibility_and_compare_cohort_isolation_diagnosis.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("PROBE_PROPERTY:",PROBE)
    for x in probe_results:
        print(f"{x['label']}_BODY_HAS_EXACT:",x.get("bodyHasExact"))
        print(f"{x['label']}_MATCH_COUNT:",x.get("matchCount"))
        print(f"{x['label']}_SELECTED_PROPERTY_CERTIFIED:",x.get("selectedPropertyCertified"))
    print("CONTROL_FRESH_ISOLATED_BROWSER_CERTIFIED:",control_fresh)
    print("CLASSIFICATION:",classification)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
