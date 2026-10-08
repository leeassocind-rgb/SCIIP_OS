#!/usr/bin/env python3
from __future__ import annotations
import sys,json,time,urllib.request,urllib.parse,socket,base64,os
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVATION"
EXPECTED=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

class WS:
    def __init__(self,u,timeout=12):
        x=urllib.parse.urlparse(u);self.h=x.hostname;self.p=x.port or 80;self.path=x.path or "/"
        self.s=socket.create_connection((self.h,self.p),timeout=timeout);self.s.settimeout(timeout)
        k=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.h}:{self.p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode());d=b""
        while b"\r\n\r\n" not in d:d+=self.s.recv(4096)
        if b" 101 " not in d.split(b"\r\n",1)[0]:raise RuntimeError("upgrade")
        self.n=0
    def rn(self,n):
        b=b""
        while len(b)<n:
            x=self.s.recv(n-len(b))
            if not x:raise RuntimeError("closed")
            b+=x
        return b
    def send(self,x):
        b=x.encode();m=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0x80|126])+n.to_bytes(2,"big")
        else:h+=bytes([0x80|127])+n.to_bytes(8,"big")
        h+=m;self.s.sendall(h+bytes(v^m[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=int.from_bytes(self.rn(2),"big")
            elif n==127:n=int.from_bytes(self.rn(8),"big")
            masked=bool(h[1]&128);m=self.rn(4) if masked else None;p=self.rn(n)
            if masked:p=bytes(v^m[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("closed")
            if op==9:self.s.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return p.decode(errors="replace")
    def call(self,m,p=None):
        self.n+=1;i=self.n;self.send(json.dumps({"id":i,"method":m,"params":p or {}}))
        while True:
            x=json.loads(self.recv())
            if x.get("id")==i:return x.get("result",{})

def gj(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.load(r)
def js(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True});return (r.get("result") or {}).get("value")
def target(p):
    fs=[]
    for t in gj(f"http://127.0.0.1:{p}/json"):
        if t.get("type")!="page":continue
        u=t.get("url","")
        if u.startswith("chrome-extension://"):continue
        if not(u.startswith("http://localhost") or u.startswith("http://127.0.0.1")):continue
        try:
            w=WS(t["webSocketDebuggerUrl"])
            sh=js(w,"!!document.querySelector('.broker-shell,.sciip-ds-root,.explorer3')")
            se=js(w,'!!document.querySelector(\'input[aria-label="Search SCIIP"]\')')
            fs.append((bool(sh),bool(se),u,w))
        except:pass
    if not fs:return None
    fs.sort(key=lambda x:(x[0],x[1]),reverse=True);return fs[0]

def observe(w):
    return js(w, """(()=>{const map=document.querySelector('.explorer3__map-shell,[class*=map]');
const palette=[...document.querySelectorAll('[class*=command],[class*=palette],[role=dialog],[role=listbox]')].filter(n=>!!(n.offsetWidth||n.offsetHeight||n.getClientRects().length));
const actionNodes=[...document.querySelectorAll('[data-action],[data-command],[data-id],[role=option],[role=menuitem],button')];
const strings=actionNodes.map(n=>((n.getAttribute('data-action')||'')+' '+(n.getAttribute('data-command')||'')+' '+(n.getAttribute('data-id')||'')+' '+(n.innerText||'')+' '+(n.getAttribute('aria-label')||'')+' '+(n.getAttribute('title')||'')).trim().toLowerCase()).filter(Boolean);
const has=(x)=>strings.some(s=>s.includes(x));
return {
 explorer:!!document.querySelector('.explorer3'),
 mapVisible:!!map&&!!(map.offsetWidth||map.offsetHeight||map.getClientRects().length),
 paletteVisibleCount:palette.length,
 actionNodeCount:actionNodes.length,
 propertyAction:has('property'),
 marketAction:has('market'),
 neighborsAction:has('neighbor'),
 compareAction:has('compare'),
 explainAction:has('explain'),
 commandAction:has('command'),
 sampleActions:strings.filter(s=>/property|market|neighbor|compare|explain|command/.test(s)).slice(0,30)
};})()""")

def open_command(w):
    return js(w, """(()=>{const nodes=[...document.querySelectorAll('button,[role=button],[role=menuitem]')];
const n=nodes.find(x=>{const s=((x.innerText||'')+' '+(x.getAttribute('aria-label')||'')+' '+(x.getAttribute('title')||'')).trim().toLowerCase();return s==='command'||s.includes('command');});
if(!n)return false;n.click();return true;})()""")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();port=int(sys.argv[2])
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4";outdir=ev/M;outdir.mkdir(parents=True,exist_ok=True)
    prereq=ev/"M4_19D4BN7A_EXACT_TEN_GOVERNED_COMMAND_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_command_consumer_parity_certification.json"
    if not prereq.is_file() or json.loads(prereq.read_text()).get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN7A_CERTIFIED_EVIDENCE_REQUIRED");return 4

    print("="*72)
    print("SCIIP Explorer 4.0 — BN7B Live Governed Command Consumer Observation")
    print("="*72)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")

    ch=None
    for _ in range(30):
        try:
            ch=target(port)
            if ch and ch[0] and ch[1]:break
        except:ch=None
        time.sleep(.4)
    if not ch:
        print("STATUS: BLOCKED");print("DIAGNOSIS: BLOCKED_CDP_BOOTSTRAP_FAILED");return 5

    shell,search,url,w=ch
    print("Target URL:",url);print("SCIIP shell:",shell);print("Search control:",search)

    records=[]
    for i,q in enumerate(EXPECTED,1):
        print(f"\n[{i}/10] {q}")
        js(w,"""(()=>{const h=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Home');if(h)h.click();return true;})()""")
        time.sleep(.3)

        qj=json.dumps(q)
        js(w, """(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"]');if(!e)return false;
const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
e.focus();s.call(e,%s);
e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:%s}));
e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()"""%(qj,qj))
        time.sleep(.2)
        val=js(w,'document.querySelector(\'input[aria-label="Search SCIIP"]\')?.value')
        vm=(val==q)
        js(w,"""(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"]');if(!e)return false;
e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));return true;})()""")
        time.sleep(1.0)

        pre=observe(w)
        opened=open_command(w)
        time.sleep(.5)
        post=observe(w)

        all_routes=all([post.get("propertyAction"),post.get("marketAction"),post.get("neighborsAction"),post.get("compareAction"),post.get("explainAction")])

        if not vm: outcome="REACT_SEARCH_STATE_NOT_PROVEN"
        elif not pre.get("explorer"): outcome="EXPLORER_NOT_MOUNTED"
        elif not pre.get("mapVisible"): outcome="MAP_NOT_VISIBLE"
        elif not opened: outcome="COMMAND_SURFACE_NOT_ACTIVATED"
        elif post.get("paletteVisibleCount",0)<=0: outcome="COMMAND_CONSUMER_NOT_VISIBLE"
        elif not all_routes: outcome="COMMAND_ACTION_ROUTE_SET_NOT_OBSERVED"
        elif not post.get("mapVisible"): outcome="MAP_NOT_VISIBLE_WITH_COMMAND"
        else: outcome="LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED"

        rec={"query":q,"controlledValueMatch":vm,"commandSurfaceOpened":opened,"pre":pre,"post":post,
             "allCommandRoutesObserved":all_routes,"outcome":outcome}
        records.append(rec)

        print("controlledValueMatch:",vm)
        print("explorerMounted:",pre.get("explorer"))
        print("mapVisible:",pre.get("mapVisible"))
        print("commandSurfaceOpened:",opened)
        print("paletteVisibleCount:",post.get("paletteVisibleCount"))
        print("propertyAction:",post.get("propertyAction"))
        print("marketAction:",post.get("marketAction"))
        print("neighborsAction:",post.get("neighborsAction"))
        print("compareAction:",post.get("compareAction"))
        print("explainAction:",post.get("explainAction"))
        print("mapVisibleWithCommand:",post.get("mapVisible"))
        print("OUTCOME:",outcome)

    target_out="LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED"
    n=sum(x["outcome"]==target_out for x in records)
    ok=n==10

    result={
      "framework":"SCIIP_EXPLORER_4_BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if ok else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN7B_EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED" if ok else "M419D4BN7B_LIVE_COMMAND_OBSERVATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_GOVERNED_COMMAND_CONSUMER_OBSERVED" if ok else "LIVE_GOVERNED_COMMAND_CONSUMER_GAP_REMAINS",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":"LOCAL_BROWSER_ONLY","pixelEvidence":False},
      "observedCount":n,"recordCount":len(records),"records":records,
      "next":"BN7B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if ok else "BN7B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSURE" if ok else None
    }

    f=outdir/"exact_ten_live_governed_command_consumer_observation.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print(f"\nOBSERVED: {n}/10")
    print("STATUS:",result["status"]);print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"]);print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0
if __name__=="__main__":raise SystemExit(main())
