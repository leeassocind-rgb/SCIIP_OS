#!/usr/bin/env python3
from __future__ import annotations
import sys,json,time,urllib.request,urllib.parse,socket,base64,os,re
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN4B_R1_CANONICAL_SELECTED_IDENTITY_RECONCILIATION_AND_LIVE_MARKET_NEIGHBOR_RECERTIFICATION"
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
            w=WS(t["webSocketDebuggerUrl"]);sh=js(w,"!!document.querySelector('.broker-shell,.sciip-ds-root,.explorer3')");se=js(w,'!!document.querySelector(\'input[aria-label="Search SCIIP"]\')')
            fs.append((bool(sh),bool(se),u,w))
        except:pass
    if not fs:return None
    fs.sort(key=lambda x:(x[0],x[1]),reverse=True);return fs[0]

def norm(s):
    return re.sub(r'[^a-z0-9]+',' ',str(s or '').lower()).strip()

def tokens_from_bn3b(record):
    chunks=[]
    for side in ["beforeDrawer","afterDrawer"]:
        d=record.get(side) or {}
        chunks += d.get("selectedSignals") or []
        chunks += [d.get("drawerText") or "", d.get("intelligenceText") or ""]
    text=" ".join(chunks)
    nt=norm(text)
    # favor address-like tokens / numbers, omit generic UI vocabulary
    stop={"property","explorer","market","neighbors","building","intelligence","selected","map","available","owner","status","clear","height","square","feet","sf"}
    words=[w for w in nt.split() if len(w)>=2 and w not in stop]
    nums=[w for w in words if any(c.isdigit() for c in w)]
    # retain up to 8 distinctive tokens, preferring numeric/address tokens
    ordered=[]
    for w in nums+words:
        if w not in ordered: ordered.append(w)
    return ordered[:8]

def obs(w,toks):
    tj=json.dumps(toks)
    return js(w, """(()=>{const body=document.body?.innerText||'';
const ribbon=document.querySelector('.explorer3__market-context,[class*=market-context],[class*=market-ribbon],[class*=ribbon]');
const drawer=document.querySelector('.explorer3__drawer,[class*=context-drawer],[class*=drawer]');
const map=document.querySelector('.explorer3__map-shell,[class*=map]');
const rel=[...document.querySelectorAll('[class*=neighbor],[data-relationship],[class*=relationship]')];
const lower=body.toLowerCase();
const toks=%s;
const matched=toks.filter(t=>lower.includes(t.toLowerCase()));
return {explorer:!!document.querySelector('.explorer3'),
identityMatchedTokens:matched,identityTokenCount:toks.length,
identityContinuity:matched.length>=Math.min(2,Math.max(1,toks.length)),
marketRibbonVisible:!!ribbon&&!!(ribbon.offsetWidth||ribbon.offsetHeight||ribbon.getClientRects().length),
drawerVisible:!!drawer&&!!(drawer.offsetWidth||drawer.offsetHeight||drawer.getClientRects().length),
drawerText:drawer?.innerText?.slice(0,6000)||null,
mapVisible:!!map&&!!(map.offsetWidth||map.offsetHeight||map.getClientRects().length),
neighborSignalCount:rel.length,
neighborText:rel.map(x=>x.innerText||'').join('\\n').slice(0,5000)};})()"""%tj)

def click(w,label):
    return js(w, """(()=>{const want=%s.toLowerCase();const bs=[...document.querySelectorAll('button')];
const b=bs.find(x=>{const s=((x.innerText||'')+' '+(x.getAttribute('aria-label')||'')+' '+(x.getAttribute('title')||'')).trim().toLowerCase();return s===want||s.includes(want);});if(!b)return false;b.click();return true;})()"""%json.dumps(label))

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();port=int(sys.argv[2])
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4";outdir=ev/M;outdir.mkdir(parents=True,exist_ok=True)
    bn3b=ev/"M4_19D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMER_OBSERVATION"/"exact_ten_live_post_selection_governed_consumer_observation.json"
    bn4a=ev/"M4_19D4BN4A_EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFICATION"/"exact_ten_market_context_neighbor_parity_certification.json"
    if not bn3b.is_file() or not bn4a.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_CERTIFIED_EVIDENCE_MISSING");return 4
    b3=json.loads(bn3b.read_text());b4=json.loads(bn4a.read_text())
    if b3.get("status")!="PASSED" or b4.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_CERTIFIED_EVIDENCE_NOT_PASSED");return 5

    baseline={r.get("query"):r for r in (b3.get("records") or [])}
    print("="*60);print("SCIIP Explorer 4.0 — BN4B-R1 Canonical Identity Live Recertification");print("="*60)
    ch=None
    for _ in range(30):
        try:
            ch=target(port)
            if ch and ch[0] and ch[1]:break
        except:ch=None
        time.sleep(.4)
    if not ch:print("STATUS: BLOCKED");print("DIAGNOSIS: BLOCKED_CDP_BOOTSTRAP_FAILED");return 6
    shell,search,url,w=ch;print("Target URL:",url);print("SCIIP shell:",shell);print("Search control:",search)
    records=[]
    for i,q in enumerate(EXPECTED,1):
        base=baseline.get(q) or {}
        toks=tokens_from_bn3b(base)
        print(f"\n[{i}/10] {q}")
        print("canonicalIdentityTokens:",toks)
        if not toks:
            records.append({"query":q,"outcome":"CANONICAL_IDENTITY_BASELINE_UNAVAILABLE"});continue
        js(w,"""(()=>{const h=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Home');if(h)h.click();sessionStorage.removeItem('sciip.globalSearchQuery');return true;})()""");time.sleep(.3)
        qj=json.dumps(q)
        js(w, """(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"]');if(!e)return false;const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;e.focus();s.call(e,%s);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:%s}));e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()"""%(qj,qj));time.sleep(.2)
        val=js(w,'document.querySelector(\'input[aria-label="Search SCIIP"]\')?.value');vm=val==q
        js(w,"""(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"]');if(!e)return false;e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));return true;})()""");time.sleep(1.0)
        pre=obs(w,toks);mc=click(w,"Market");time.sleep(.5);market=obs(w,toks);nc=click(w,"Neighbors");time.sleep(.5);neigh=obs(w,toks)

        if not vm:out="REACT_SEARCH_STATE_NOT_PROVEN"
        elif not pre.get("explorer"):out="EXPLORER_NOT_MOUNTED"
        elif not pre.get("identityContinuity"):out="CANONICAL_SELECTED_IDENTITY_NOT_OBSERVED"
        elif not pre.get("marketRibbonVisible"):out="MARKET_CONTEXT_RIBBON_NOT_VISIBLE"
        elif not mc or not market.get("drawerVisible"):out="MARKET_DRAWER_NOT_VISIBLE"
        elif not nc or not neigh.get("drawerVisible"):out="NEIGHBORS_DRAWER_NOT_VISIBLE"
        elif not neigh.get("mapVisible"):out="MAP_NOT_VISIBLE"
        elif (neigh.get("neighborSignalCount") or 0)<=0:out="NEIGHBOR_SIGNALS_NOT_OBSERVED"
        elif not neigh.get("identityContinuity"):out="CANONICAL_IDENTITY_LOST_THROUGH_NEIGHBOR_FLOW"
        else:out="LIVE_MARKET_CONTEXT_AND_NEIGHBOR_CANONICAL_IDENTITY_CONTINUITY_CERTIFIED"

        records.append({"query":q,"canonicalIdentityTokens":toks,"controlledValueMatch":vm,"pre":pre,"marketControlClicked":mc,"market":market,"neighborsControlClicked":nc,"neighbors":neigh,"outcome":out})
        print("controlledValueMatch:",vm);print("identityContinuityPre:",pre.get("identityContinuity"),pre.get("identityMatchedTokens"));print("marketRibbonVisible:",pre.get("marketRibbonVisible"));print("marketDrawerVisible:",market.get("drawerVisible"));print("neighborsDrawerVisible:",neigh.get("drawerVisible"));print("mapVisible:",neigh.get("mapVisible"));print("neighborSignalCount:",neigh.get("neighborSignalCount"));print("identityContinuityNeighbors:",neigh.get("identityContinuity"),neigh.get("identityMatchedTokens"));print("OUTCOME:",out)

    target_out="LIVE_MARKET_CONTEXT_AND_NEIGHBOR_CANONICAL_IDENTITY_CONTINUITY_CERTIFIED"
    n=sum(r.get("outcome")==target_out for r in records);ok=n==10
    result={"framework":"SCIIP_EXPLORER_4_BN4B_R1_CANONICAL_SELECTED_IDENTITY_RECONCILIATION_AND_LIVE_MARKET_NEIGHBOR_RECERTIFICATION","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if ok else "DIAGNOSTIC_COMPLETE","state":"M419D4BN4B_R1_EXACT_TEN_LIVE_MARKET_CONTEXT_AND_NEIGHBOR_CANONICAL_IDENTITY_CONTINUITY_CERTIFIED" if ok else "M419D4BN4B_R1_RECERTIFICATION_INCOMPLETE","diagnosis":"EXACT_TEN_LIVE_MARKET_CONTEXT_AND_NEIGHBOR_CANONICAL_IDENTITY_CONTINUITY_CERTIFIED" if ok else "LIVE_MARKET_CONTEXT_OR_NEIGHBOR_CANONICAL_IDENTITY_GAP_REMAINS","authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":"LOCAL_BROWSER_ONLY","pixelEvidence":False},"certifiedCount":n,"recordCount":len(records),"records":records,"next":"BN4B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if ok else "BN4B_REMAINS_OPEN","nextMilestone":"M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE" if ok else None}
    outfile=outdir/"canonical_selected_identity_live_market_neighbor_recertification.json";outfile.write_text(json.dumps(result,indent=2)+"\n")
    print(f"\nCERTIFIED: {n}/10");print("STATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"]);print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",outfile);return 0
if __name__=="__main__":raise SystemExit(main())
