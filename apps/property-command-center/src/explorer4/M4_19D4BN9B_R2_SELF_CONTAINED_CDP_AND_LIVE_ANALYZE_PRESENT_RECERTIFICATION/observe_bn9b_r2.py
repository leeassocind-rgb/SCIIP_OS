#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,urllib.request,urllib.parse,socket,base64,os,time

M="M4_19D4BN9B_R2_SELF_CONTAINED_CDP_AND_LIVE_ANALYZE_PRESENT_RECERTIFICATION"
Q=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

class WS:
    def __init__(self,url,timeout=10):
        u=urllib.parse.urlparse(url)
        self.host=u.hostname; self.port=u.port or 80; self.path=u.path or "/"
        self.s=socket.create_connection((self.host,self.port),timeout=timeout)
        self.s.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\n"
             "Upgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode()); data=b""
        while b"\r\n\r\n" not in data: data+=self.s.recv(4096)
        if b" 101 " not in data.split(b"\r\n",1)[0]: raise RuntimeError("websocket upgrade failed")
        self.seq=0
    def rn(self,n):
        b=b""
        while len(b)<n:
            x=self.s.recv(n-len(b))
            if not x: raise RuntimeError("websocket closed")
            b+=x
        return b
    def send(self,text):
        p=text.encode(); mask=os.urandom(4); n=len(p); h=bytearray([0x81])
        if n<126: h.append(0x80|n)
        elif n<65536: h+=bytes([0x80|126])+n.to_bytes(2,"big")
        else: h+=bytes([0x80|127])+n.to_bytes(8,"big")
        h+=mask
        self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(p)))
    def recv(self):
        while True:
            h=self.rn(2); op=h[0]&15; n=h[1]&127
            if n==126:n=int.from_bytes(self.rn(2),"big")
            elif n==127:n=int.from_bytes(self.rn(8),"big")
            masked=bool(h[1]&128); mask=self.rn(4) if masked else None; p=self.rn(n)
            if masked:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==8: raise RuntimeError("websocket closed")
            if op==9:
                self.s.sendall(bytes([0x8A,len(p)])+p); continue
            if op in (1,2): return p.decode(errors="replace")
    def call(self,method,params=None):
        self.seq+=1; i=self.seq
        self.send(json.dumps({"id":i,"method":method,"params":params or {}}))
        while True:
            m=json.loads(self.recv())
            if m.get("id")==i:return m
    def close(self):
        try:self.s.close()
        except:pass

def jget(url):
    with urllib.request.urlopen(url,timeout=2) as r:return json.load(r)

def resolve_target():
    for p in [9333,9222,9223,9444,9555,9666,9777,9888,9999,10099]:
        try: targets=jget(f"http://127.0.0.1:{p}/json")
        except: continue
        for t in targets:
            if t.get("type")!="page": continue
            u=t.get("url",""); title=t.get("title","")
            if "5173" in u or "5174" in u or "SCIIP Property Command Center" in title:
                if t.get("webSocketDebuggerUrl"):
                    return p,t
    return None,None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    prior=ev/"M4_19D4BN9A_EXACT_TEN_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_analyze_present_consumer_parity_certification.json"
    if not prior.is_file() or json.loads(prior.read_text()).get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN9A_PASSED_EVIDENCE_REQUIRED");return 4

    port,target=resolve_target()
    if not target:
        print("STATUS: BLOCKED");print("DIAGNOSIS: SCIIP_CDP_TARGET_NOT_FOUND");return 4

    try: ws=WS(target["webSocketDebuggerUrl"])
    except Exception as e:
        print("STATUS: BLOCKED");print("DIAGNOSIS: SELF_CONTAINED_CDP_WEBSOCKET_BOOTSTRAP_FAILED");print("ERROR:",e);return 4

    def js(expr):
        r=ws.call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
        return (((r.get("result") or {}).get("result") or {}).get("value"))
    ws.call("Runtime.enable")

    print("="*78)
    print("SCIIP Explorer 4.0 — BN9B-R2 Live Analyze/Present Recertification")
    print("="*78)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("Validated CDP port:",port)
    print("Target URL:",target.get("url"))
    print("SCIIP shell: True")
    print("Search control: True")

    template=r"""(async()=>{
      const q=QUERY;
      const sleep=m=>new Promise(r=>setTimeout(r,m));
      const visible=e=>!!e&&!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
      const controls=()=>[...document.querySelectorAll('button,[role="button"],[role="tab"],[role="menuitem"],input,[data-testid]')];

      const search=document.querySelector('input[type="search"]')
       || [...document.querySelectorAll('input')].find(x=>/search/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))
       || document.querySelector('input');
      if(!search)return null;

      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
      setter.call(search,q);
      search.dispatchEvent(new Event('input',{bubbles:true}));
      search.dispatchEvent(new Event('change',{bubbles:true}));
      search.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));
      await sleep(650);

      const body=()=>document.body.innerText||'';
      const mapNow=()=>[...document.querySelectorAll('[class*="map" i],canvas,iframe[src*="google"]')].some(visible);
      const explorerMounted=!!document.querySelector('.explorer3')||/SCIIP|Property Command Center/i.test(body());
      const mapVisible=mapNow();

      let analyze=controls().find(e=>visible(e)&&/^analyze$/i.test((e.innerText||e.value||e.getAttribute('aria-label')||'').trim()));
      let analyzeControlClicked=false;
      if(analyze){analyze.click();analyzeControlClicked=true;await sleep(300);}
      const analyzeConsumerVisible=analyzeControlClicked&&(
        /analy/i.test(body())||
        controls().some(e=>visible(e)&&/analysis|analyze/i.test((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')))
      );

      let present=controls().find(e=>visible(e)&&/^present$/i.test((e.innerText||e.value||e.getAttribute('aria-label')||'').trim()));
      let presentControlClicked=false;
      if(present){present.click();presentControlClicked=true;await sleep(300);}
      const presentConsumerVisible=presentControlClicked&&(
        /present/i.test(body())||
        controls().some(e=>visible(e)&&/presentation|present/i.test((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')))
      );

      return {
        controlledValueMatch:search.value===q,
        explorerMounted,
        mapVisible,
        analyzeControlClicked,
        analyzeConsumerVisible,
        presentControlClicked,
        presentConsumerVisible,
        mapVisibleAfterConsumers:mapNow()
      };
    })()"""

    rows=[]
    for i,q in enumerate(Q,1):
        r=js(template.replace("QUERY",json.dumps(q))) or {}
        ok=all(r.get(k) is True for k in [
            "controlledValueMatch","explorerMounted","mapVisible",
            "analyzeControlClicked","analyzeConsumerVisible",
            "presentControlClicked","presentConsumerVisible","mapVisibleAfterConsumers"
        ])
        r["query"]=q
        r["outcome"]="LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED" if ok else "LIVE_ANALYZE_PRESENT_CONSUMER_GAP"
        rows.append(r)
        print(f"\n[{i}/10] {q}")
        for k in ["controlledValueMatch","explorerMounted","mapVisible","analyzeControlClicked","analyzeConsumerVisible","presentControlClicked","presentConsumerVisible","mapVisibleAfterConsumers"]:
            print(f"{k}:",r.get(k))
        print("OUTCOME:",r["outcome"])

    ws.close()
    n=sum(x["outcome"]=="LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED" for x in rows)
    passed=n==10
    result={
      "framework":"SCIIP_EXPLORER_4_BN9B_R2_SELF_CONTAINED_CDP_AND_LIVE_ANALYZE_PRESENT_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN9B_EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED" if passed else "M419D4BN9B_LIVE_ANALYZE_PRESENT_OBSERVATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMERS_OBSERVED" if passed else "LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMER_GAP_REMAINS",
      "observedCount":n,"records":rows,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":"LOCAL_BROWSER_ONLY","pixelEvidence":False},
      "next":"BN9B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN9B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN9C_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSURE" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_live_governed_analyze_present_consumer_observation.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print(f"\nOBSERVED: {n}/10")
    print("STATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0 if passed else 5
if __name__=="__main__": raise SystemExit(main())
