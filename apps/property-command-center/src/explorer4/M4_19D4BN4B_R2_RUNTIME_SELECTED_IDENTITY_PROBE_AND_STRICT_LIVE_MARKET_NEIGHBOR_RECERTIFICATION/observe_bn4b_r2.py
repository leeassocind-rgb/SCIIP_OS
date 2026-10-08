#!/usr/bin/env python3
from __future__ import annotations
import sys,json,time,urllib.request,urllib.parse,socket,base64,os,re
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN4B_R2_RUNTIME_SELECTED_IDENTITY_PROBE_AND_STRICT_LIVE_MARKET_NEIGHBOR_RECERTIFICATION"
EXPECTED=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]
GENERIC={"10","5","1","2","3","4","6","7","8","9","15","20","24","25","30","40","45","47","48","50","60","80","100","120","sf","ft","mi","m","market","property","neighbors","neighbor","available","selected","map","status","owner","building","industrial","portfolio","ave","rd","st","way"}

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

def normalize(s):
    return re.sub(r'[^a-z0-9]+',' ',str(s or '').lower()).strip()

def query_tokens(q):
    toks=[x for x in normalize(q).split() if len(x)>=2 and x not in GENERIC]
    # prioritize meaningful street numbers/names, exclude directional/filler
    stop={"ne","of","and","s","e","w","n","the"}
    toks=[x for x in toks if x not in stop]
    return toks

def probe(w,q):
    qj=json.dumps(q)
    return js(w, """(()=>{const body=document.body?.innerText||'';
const attrs=n=>{const o={};for(const a of [...n.attributes||[]]){if(a.name.startsWith('data-')||['aria-label','title','id','role','aria-selected'].includes(a.name))o[a.name]=a.value;}return o;};
const selected=[...document.querySelectorAll('[aria-selected="true"],[data-selected="true"],[class*=selected],[class*=active]')].slice(0,60).map(n=>({tag:n.tagName,text:(n.innerText||n.textContent||'').trim().slice(0,800),attrs:attrs(n)}));
const headings=[...document.querySelectorAll('h1,h2,h3,h4,strong,[role="heading"]')].slice(0,100).map(n=>({text:(n.innerText||n.textContent||'').trim().slice(0,600),attrs:attrs(n)})).filter(x=>x.text);
const identityNodes=[...document.querySelectorAll('[data-property-id],[data-id],[data-property],[data-selected-property-id],[aria-label],[title]')].slice(0,200).map(n=>({tag:n.tagName,text:(n.innerText||n.textContent||'').trim().slice(0,500),attrs:attrs(n)}));
const mapNodes=[...document.querySelectorAll('[class*=map] button,[class*=marker],[aria-label*=map i],[title]')].slice(0,120).map(n=>({text:(n.innerText||n.textContent||'').trim().slice(0,500),attrs:attrs(n)}));
const ribbon=document.querySelector('.explorer3__market-context,[class*=market-context],[class*=market-ribbon],[class*=ribbon]');
const drawer=document.querySelector('.explorer3__drawer,[class*=context-drawer],[class*=drawer]');
const map=document.querySelector('.explorer3__map-shell,[class*=map]');
const rel=[...document.querySelectorAll('[class*=neighbor],[data-relationship],[class*=relationship]')];
const addr=[...new Set((body.match(/\\b\\d{1,6}(?:\\s*-\\s*\\d{1,6})?\\s+[A-Z0-9][A-Za-z0-9.'’\\- ]{2,60}\\b/g)||[]).slice(0,80))];
return {
 query:%s,
 explorer:!!document.querySelector('.explorer3'),
 marketRibbonVisible:!!ribbon&&!!(ribbon.offsetWidth||ribbon.offsetHeight||ribbon.getClientRects().length),
 drawerVisible:!!drawer&&!!(drawer.offsetWidth||drawer.offsetHeight||drawer.getClientRects().length),
 drawerText:drawer?.innerText?.slice(0,8000)||null,
 mapVisible:!!map&&!!(map.offsetWidth||map.offsetHeight||map.getClientRects().length),
 neighborSignalCount:rel.length,
 selectedNodes:selected,headings,identityNodes,mapNodes,addressLikeStrings:addr,
 bodyExcerpt:body.slice(0,12000)
};})()"""%qj)

def flatten_strings(p):
    out=[]
    for k in ["bodyExcerpt","drawerText"]:
        if p.get(k):out.append(p[k])
    for k in ["selectedNodes","headings","identityNodes","mapNodes"]:
        for x in p.get(k) or []:
            out.append(x.get("text") or "")
            for v in (x.get("attrs") or {}).values():out.append(str(v))
    out += p.get("addressLikeStrings") or []
    return [x for x in out if x]

def identity_signature(q,pre,post):
    qt=query_tokens(q)
    pretext=normalize(" ".join(flatten_strings(pre)))
    posttext=normalize(" ".join(flatten_strings(post)))
    q_matches_pre=[t for t in qt if t in pretext]
    q_matches_post=[t for t in qt if t in posttext]

    # exact/stable DOM attribute anchors, excluding generic booleans and short noise
    def anchors(p):
        a=set()
        for group in ["selectedNodes","identityNodes","mapNodes"]:
            for x in p.get(group) or []:
                attrs=x.get("attrs") or {}
                for k,v in attrs.items():
                    nv=normalize(v)
                    if k.startswith("data-") and nv and nv not in {"true","false","selected","active"} and len(nv)>=3:
                        a.add((k,nv))
                txt=normalize(x.get("text") or "")
                if txt and len(txt)>=5 and any(t in txt for t in qt):
                    a.add(("text",txt[:160]))
        return a

    pa=anchors(pre); po=anchors(post); stable=sorted(pa & po)
    # Require at least one query-specific token that is not generic in BOTH phases,
    # or one stable explicit data/text identity anchor.
    meaningful=[t for t in qt if t not in GENERIC and (len(t)>=3 or t.isdigit())]
    shared_query=[t for t in meaningful if t in q_matches_pre and t in q_matches_post]
    proven=bool(stable) or bool(shared_query)
    return {
      "queryTokens":qt,
      "preMatchedQueryTokens":q_matches_pre,
      "postMatchedQueryTokens":q_matches_post,
      "stableAnchors":[{"kind":k,"value":v} for k,v in stable[:20]],
      "sharedMeaningfulQueryTokens":shared_query,
      "identityProven":proven
    }

def click(w,label):
    return js(w, """(()=>{const want=%s.toLowerCase();const bs=[...document.querySelectorAll('button')];
const b=bs.find(x=>{const s=((x.innerText||'')+' '+(x.getAttribute('aria-label')||'')+' '+(x.getAttribute('title')||'')).trim().toLowerCase();return s===want||s.includes(want);});if(!b)return false;b.click();return true;})()"""%json.dumps(label))

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();port=int(sys.argv[2])
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4";outdir=ev/M;outdir.mkdir(parents=True,exist_ok=True)
    bn4a=ev/"M4_19D4BN4A_EXACT_TEN_POST_SELECTION_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_PARITY_CERTIFICATION"/"exact_ten_market_context_neighbor_parity_certification.json"
    if not bn4a.is_file() or json.loads(bn4a.read_text()).get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN4A_CERTIFIED_EVIDENCE_REQUIRED");return 4

    print("="*60);print("SCIIP Explorer 4.0 — BN4B-R2 Strict Runtime Selected Identity Probe");print("="*60)
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
        js(w,"""(()=>{const h=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Home');if(h)h.click();sessionStorage.removeItem('sciip.globalSearchQuery');return true;})()""");time.sleep(.3)
        qj=json.dumps(q)
        js(w, """(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"]');if(!e)return false;const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;e.focus();s.call(e,%s);e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:%s}));e.dispatchEvent(new Event('change',{bubbles:true}));return true;})()"""%(qj,qj));time.sleep(.2)
        val=js(w,'document.querySelector(\'input[aria-label="Search SCIIP"]\')?.value');vm=val==q
        js(w,"""(()=>{const e=document.querySelector('input[aria-label="Search SCIIP"]');if(!e)return false;e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));return true;})()""");time.sleep(1.0)

        pre=probe(w,q)
        mc=click(w,"Market");time.sleep(.5);market=probe(w,q)
        nc=click(w,"Neighbors");time.sleep(.5);post=probe(w,q)
        sig=identity_signature(q,pre,post)

        if not vm:out="REACT_SEARCH_STATE_NOT_PROVEN"
        elif not pre.get("explorer"):out="EXPLORER_NOT_MOUNTED"
        elif not sig["identityProven"]:out="STRICT_SELECTED_IDENTITY_NOT_PROVEN"
        elif not pre.get("marketRibbonVisible"):out="MARKET_CONTEXT_RIBBON_NOT_VISIBLE"
        elif not mc or not market.get("drawerVisible"):out="MARKET_DRAWER_NOT_VISIBLE"
        elif not nc or not post.get("drawerVisible"):out="NEIGHBORS_DRAWER_NOT_VISIBLE"
        elif not post.get("mapVisible"):out="MAP_NOT_VISIBLE"
        elif (post.get("neighborSignalCount") or 0)<=0:out="NEIGHBOR_SIGNALS_NOT_OBSERVED"
        else:out="LIVE_MARKET_CONTEXT_AND_NEIGHBOR_STRICT_SELECTED_IDENTITY_CONTINUITY_CERTIFIED"

        rec={"query":q,"controlledValueMatch":vm,"identitySignature":sig,
             "marketControlClicked":mc,"neighborsControlClicked":nc,
             "pre":pre,"market":market,"postNeighbor":post,"outcome":out}
        records.append(rec)

        print("controlledValueMatch:",vm)
        print("queryTokens:",sig["queryTokens"])
        print("preMatchedQueryTokens:",sig["preMatchedQueryTokens"])
        print("postMatchedQueryTokens:",sig["postMatchedQueryTokens"])
        print("stableAnchors:",sig["stableAnchors"][:5])
        print("identityProven:",sig["identityProven"])
        print("marketRibbonVisible:",pre.get("marketRibbonVisible"))
        print("marketDrawerVisible:",market.get("drawerVisible"))
        print("neighborsDrawerVisible:",post.get("drawerVisible"))
        print("mapVisible:",post.get("mapVisible"))
        print("neighborSignalCount:",post.get("neighborSignalCount"))
        print("OUTCOME:",out)

    target_out="LIVE_MARKET_CONTEXT_AND_NEIGHBOR_STRICT_SELECTED_IDENTITY_CONTINUITY_CERTIFIED"
    n=sum(r["outcome"]==target_out for r in records);ok=n==10
    result={"framework":"SCIIP_EXPLORER_4_BN4B_R2_RUNTIME_SELECTED_IDENTITY_PROBE_AND_STRICT_LIVE_MARKET_NEIGHBOR_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if ok else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN4B_R2_EXACT_TEN_LIVE_MARKET_CONTEXT_AND_NEIGHBOR_STRICT_SELECTED_IDENTITY_CONTINUITY_CERTIFIED" if ok else "M419D4BN4B_R2_RECERTIFICATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_MARKET_CONTEXT_AND_NEIGHBOR_STRICT_SELECTED_IDENTITY_CONTINUITY_CERTIFIED" if ok else "STRICT_SELECTED_IDENTITY_OR_MARKET_NEIGHBOR_GAP_REMAINS",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":"LOCAL_BROWSER_ONLY","pixelEvidence":False},
      "certifiedCount":n,"recordCount":len(records),"records":records,
      "next":"BN4B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if ok else "BN4B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN4C_MARKET_CONTEXT_AND_NEIGHBOR_GOVERNED_LIFECYCLE_CLOSURE" if ok else None}
    outfile=outdir/"runtime_selected_identity_strict_market_neighbor_recertification.json"
    outfile.write_text(json.dumps(result,indent=2)+"\n")
    print(f"\nCERTIFIED: {n}/10");print("STATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"]);print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",outfile)
    return 0
if __name__=="__main__":raise SystemExit(main())
