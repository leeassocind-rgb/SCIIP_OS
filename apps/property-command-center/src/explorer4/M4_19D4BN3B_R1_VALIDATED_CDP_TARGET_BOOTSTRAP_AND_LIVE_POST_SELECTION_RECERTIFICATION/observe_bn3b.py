#!/usr/bin/env python3
from __future__ import annotations
import sys,json,time,urllib.request,urllib.parse,socket,base64,os
from pathlib import Path
from datetime import datetime,timezone

M="M4_19D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMER_OBSERVATION"
EXPECTED=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

class WS:
    def __init__(self,url,timeout=15):
        u=urllib.parse.urlparse(url)
        self.host=u.hostname; self.port=u.port or 80; self.path=u.path or "/"
        self.sock=socket.create_connection((self.host,self.port),timeout=timeout)
        self.sock.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\nUpgrade: websocket\r\n"
             f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.sock.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data: data+=self.sock.recv(4096)
        if b" 101 " not in data.split(b"\r\n",1)[0]: raise RuntimeError("websocket upgrade failed")
        self.n=0
    def _readn(self,n):
        out=b""
        while len(out)<n:
            b=self.sock.recv(n-len(out))
            if not b: raise RuntimeError("socket closed")
            out+=b
        return out
    def send(self,s):
        b=s.encode(); mask=os.urandom(4); n=len(b); h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0x80|126])+n.to_bytes(2,"big")
        else:h+=bytes([0x80|127])+n.to_bytes(8,"big")
        h+=mask
        self.sock.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self._readn(2);op=h[0]&0x0f;n=h[1]&0x7f
            if n==126:n=int.from_bytes(self._readn(2),"big")
            elif n==127:n=int.from_bytes(self._readn(8),"big")
            masked=bool(h[1]&0x80);mask=self._readn(4) if masked else None;p=self._readn(n)
            if masked:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("websocket closed")
            if op==9:
                self.sock.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return p.decode(errors="replace")
    def call(self,method,params=None):
        self.n+=1;i=self.n
        self.send(json.dumps({"id":i,"method":method,"params":params or {}}))
        while True:
            m=json.loads(self.recv())
            if m.get("id")==i:
                if "error" in m: raise RuntimeError(str(m["error"]))
                return m.get("result",{})

def get_json(url):
    with urllib.request.urlopen(url,timeout=3) as r:return json.load(r)

def js(ws,expr):
    r=ws.call("Runtime.evaluate",{"expression":expr,"returnByValue":True})
    return (r.get("result") or {}).get("value")

def target(port):
    found=[]
    for t in get_json(f"http://127.0.0.1:{port}/json"):
        if t.get("type")!="page":continue
        url=t.get("url","")
        if url.startswith("chrome-extension://"):continue
        if not(url.startswith("http://localhost") or url.startswith("http://127.0.0.1")):continue
        try:
            ws=WS(t["webSocketDebuggerUrl"],8)
            shell=js(ws,"!!document.querySelector('.broker-shell,.sciip-ds-root,.explorer3')")
            search=js(ws,'!!document.querySelector(\'input[aria-label="Search SCIIP"]\')')
            found.append((bool(shell),bool(search),url,t,ws))
        except Exception:pass
    if not found:return None
    found.sort(key=lambda x:(x[0],x[1]),reverse=True)
    return found[0]

def observe(ws,q):
    qj=json.dumps(q)
    return js(ws, """(()=>{const body=document.body?.innerText||'';
const drawer=document.querySelector('.explorer3__drawer,[class*=context-drawer],[class*=drawer]');
const map=document.querySelector('.explorer3__map-shell,[class*=map]');
const intelligence=[...document.querySelectorAll('[class*=intelligence],[data-m2-44],[data-m2-45],[data-m2-46]')];
return {
 explorer:!!document.querySelector('.explorer3'),
 sessionQuery:sessionStorage.getItem('sciip.globalSearchQuery'),
 bodyHasQuery:body.toLowerCase().includes(%s.toLowerCase()),
 drawerVisible:!!drawer && !!(drawer.offsetWidth||drawer.offsetHeight||drawer.getClientRects().length),
 drawerText:drawer?.innerText?.slice(0,5000)||null,
 mapVisible:!!map && !!(map.offsetWidth||map.offsetHeight||map.getClientRects().length),
 intelligenceNodeCount:intelligence.length,
 intelligenceText:intelligence.map(x=>x.innerText||'').join('\\n').slice(0,5000),
 selectedSignals:[...document.querySelectorAll('[aria-selected="true"],[data-selected="true"],.selected,.active')]
   .map(x=>(x.innerText||x.getAttribute('aria-label')||'').trim()).filter(Boolean).slice(0,30)
};})()""" % qj)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); port=int(sys.argv[2])
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"/M;ev.mkdir(parents=True,exist_ok=True)
    print("============================================================")
    print("SCIIP Explorer 4.0 — BN3B Live Post-Selection Consumer Observation")
    print("============================================================")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    chosen=None
    for _ in range(30):
        try:
            chosen=target(port)
            if chosen and chosen[0] and chosen[1]:break
        except Exception:chosen=None
        time.sleep(.5)
    if not chosen:
        print("STATUS: BLOCKED");print("DIAGNOSIS: BLOCKED_CDP_BOOTSTRAP_FAILED");return 4
    shell,search,url,t,ws=chosen
    print("Target URL:",url);print("SCIIP shell:",shell);print("Search control:",search)
    if not(shell and search):
        print("STATUS: BLOCKED");print("DIAGNOSIS: BLOCKED_SCIIP_PAGE_NOT_READY");return 5

    records=[]
    for i,q in enumerate(EXPECTED,1):
        print(f"\n[{i}/10] {q}")
        js(ws,"""(()=>{const h=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Home');if(h)h.click();sessionStorage.removeItem('sciip.globalSearchQuery');return true;})()""")
        time.sleep(.3)
        qj=json.dumps(q)
        js(ws, """(()=>{const el=document.querySelector('input[aria-label="Search SCIIP"]');if(!el)return false;
const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;el.focus();setter.call(el,%s);
el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:%s}));
el.dispatchEvent(new Event('change',{bubbles:true}));return true;})()"""%(qj,qj))
        time.sleep(.25)
        value=js(ws,'document.querySelector(\'input[aria-label="Search SCIIP"]\')?.value')
        value_match=value==q
        js(ws, """(()=>{const el=document.querySelector('input[aria-label="Search SCIIP"]');if(!el)return false;
el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));return true;})()""")
        time.sleep(1.0)
        pre=observe(ws,q)

        # Find live Property MapRail button by exact visible text / title / aria-label.
        clicked=js(ws, """(()=>{const nodes=[...document.querySelectorAll('button')];
const b=nodes.find(x=>{
 const s=((x.innerText||'')+' '+(x.getAttribute('aria-label')||'')+' '+(x.getAttribute('title')||'')).trim().toLowerCase();
 return s==='property'||s.includes(' property');
}); if(!b)return false;b.click();return true;})()""")
        time.sleep(.6)
        post=observe(ws,q)

        if not value_match: outcome="REACT_SEARCH_STATE_NOT_PROVEN"
        elif not pre.get("explorer"): outcome="EXPLORER_NOT_MOUNTED"
        elif not pre.get("bodyHasQuery"): outcome="POST_SELECTION_PROPERTY_VISIBILITY_NOT_PROVEN"
        elif not clicked: outcome="PROPERTY_DRAWER_CONTROL_NOT_FOUND"
        elif not post.get("drawerVisible"): outcome="PROPERTY_DRAWER_NOT_VISIBLE"
        elif not post.get("bodyHasQuery"): outcome="POST_SELECTION_PROPERTY_VISIBILITY_NOT_PROVEN"
        else: outcome="POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED"

        rec={"query":q,"controlledValueMatch":value_match,"propertyControlClicked":clicked,
             "beforeDrawer":pre,"afterDrawer":post,"outcome":outcome}
        records.append(rec)
        print("controlledValueMatch:",value_match)
        print("explorerMounted:",pre.get("explorer"))
        print("postSelectionQueryVisible:",pre.get("bodyHasQuery"))
        print("propertyControlClicked:",clicked)
        print("drawerVisible:",post.get("drawerVisible"))
        print("mapVisible:",post.get("mapVisible"))
        print("intelligenceNodeCount:",post.get("intelligenceNodeCount"))
        print("OUTCOME:",outcome)

    passed=sum(r["outcome"]=="POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED" for r in records)
    ok=passed==10
    result={
      "framework":"SCIIP_EXPLORER_4_BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMER_OBSERVATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if ok else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN3B_EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED" if ok else "M419D4BN3B_LIVE_POST_SELECTION_OBSERVATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_POST_SELECTION_GOVERNED_CONSUMERS_OBSERVED" if ok else "LIVE_POST_SELECTION_GOVERNED_CONSUMER_GAP_REMAINS",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":"LOCAL_BROWSER_ONLY","pixelEvidence":False},
      "recordCount":len(records),"observedCount":passed,"records":records,
      "nextBoundary":{"state":"BN3B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if ok else "BN3B_REMAINS_OPEN",
                      "recommendedNextMilestone":"M4_19D4BN3C_POST_SELECTION_GOVERNED_CONSUMER_LIFECYCLE_CLOSURE" if ok else None}
    }
    out=ev/"exact_ten_live_post_selection_governed_consumer_observation.json"
    out.write_text(json.dumps(result,indent=2)+"\n")
    print("\nOBSERVED:",f"{passed}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["nextBoundary"]["state"])
    print("NEXT_MILESTONE:",result["nextBoundary"]["recommendedNextMilestone"])
    print("EVIDENCE:",out)
    return 0
if __name__=="__main__":raise SystemExit(main())
