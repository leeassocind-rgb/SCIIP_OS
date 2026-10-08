#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,urllib.request,urllib.parse,socket,base64,os

M="M4_19D4BN10B_R2_EXACT_TEN_LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RECERTIFICATION"
Q=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

class WS:
    def __init__(self,url,timeout=10):
        u=urllib.parse.urlparse(url)
        self.host=u.hostname; self.port=u.port or 80; self.path=u.path or "/"
        self.s=socket.create_connection((self.host,self.port),timeout=timeout); self.s.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\n"
             "Upgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode()); data=b""
        while b"\r\n\r\n" not in data:data+=self.s.recv(4096)
        if b" 101 " not in data.split(b"\r\n",1)[0]:raise RuntimeError("websocket upgrade failed")
        self.seq=0
    def rn(self,n):
        b=b""
        while len(b)<n:
            x=self.s.recv(n-len(b))
            if not x:raise RuntimeError("websocket closed")
            b+=x
        return b
    def send(self,text):
        p=text.encode();mask=os.urandom(4);n=len(p);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0x80|126])+n.to_bytes(2,"big")
        else:h+=bytes([0x80|127])+n.to_bytes(8,"big")
        h+=mask;self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(p)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=int.from_bytes(self.rn(2),"big")
            elif n==127:n=int.from_bytes(self.rn(8),"big")
            masked=bool(h[1]&128);mask=self.rn(4) if masked else None;p=self.rn(n)
            if masked:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("websocket closed")
            if op==9:self.s.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return p.decode(errors="replace")
    def call(self,method,params=None):
        self.seq+=1;i=self.seq
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
        try:ts=jget(f"http://127.0.0.1:{p}/json")
        except:continue
        for t in ts:
            if t.get("type")!="page":continue
            u=t.get("url","");title=t.get("title","")
            if ("5173" in u or "5174" in u or "SCIIP Property Command Center" in title) and t.get("webSocketDebuggerUrl"):
                return p,t
    return None,None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    a=ev/"M4_19D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_explain_evidence_consumer_parity_certification.json"
    r1=ev/"M4_19D4BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RESOLUTION"/"explain_evidence_activation_path_resolution.json"
    if not a.is_file() or json.loads(a.read_text()).get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN10A_PASSED_EVIDENCE_REQUIRED");return 4
    if not r1.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN10B_R1_EVIDENCE_REQUIRED");return 4
    rr=json.loads(r1.read_text())
    if rr.get("status")!="PASSED" or rr.get("routeType")!="ACTION_DISPATCHER":
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTION_DISPATCHER_ROUTE_NOT_CERTIFIED");return 4

    port,target=resolve_target()
    if not target:
        print("STATUS: BLOCKED");print("DIAGNOSIS: SCIIP_CDP_TARGET_NOT_FOUND");return 4
    ws=WS(target["webSocketDebuggerUrl"])
    def js(expr):
        r=ws.call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
        return (((r.get("result") or {}).get("result") or {}).get("value"))
    ws.call("Runtime.enable")

    print("="*86)
    print("SCIIP Explorer 4.0 — BN10B-R2 Live Explain/Evidence Activation-Path Recertification")
    print("="*86)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("Resolved route: ACTION_DISPATCHER")
    print("Validated CDP port:",port)
    print("Target URL:",target.get("url"))

    template=r"""(async()=>{
      const q=QUERY;
      const sleep=m=>new Promise(r=>setTimeout(r,m));
      const visible=e=>!!e&&!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
      const controls=()=>[...document.querySelectorAll('button,[role="button"],[role="tab"],[role="menuitem"],input,[data-testid]')];
      const text=e=>((e.innerText||e.value||e.getAttribute('aria-label')||e.getAttribute('title')||'')+'').trim();

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

      let command=controls().find(e=>visible(e)&&/^command$/i.test(text(e)));
      let commandSurfaceOpened=false;
      if(command){command.click();commandSurfaceOpened=true;await sleep(250);}
      if(!commandSurfaceOpened){
        document.dispatchEvent(new KeyboardEvent('keydown',{key:'k',code:'KeyK',metaKey:true,bubbles:true}));
        await sleep(250);
        commandSurfaceOpened=/compare selected property|open property|explain selected property|explain/i.test(body());
      }

      const afterCommandControls=controls();
      let explain=afterCommandControls.find(e=>visible(e)&&/explain selected property|explain property|^explain$/i.test(text(e)));
      let explainActionClicked=false;
      let explainActionDescriptor=null;
      if(explain){
        explainActionDescriptor=text(explain);
        explain.click();
        explainActionClicked=true;
        await sleep(350);
      }

      const b=(body()||'').toLowerCase();
      const evidenceSignalCount=(b.match(/evidence|source|provenance|confidence|citation/g)||[]).length;
      const explanationSignalCount=(b.match(/explain|why|reason|rationale/g)||[]).length;
      const explainConsumerVisible=explainActionClicked && evidenceSignalCount>0 && explanationSignalCount>0;

      return {
        controlledValueMatch:search.value===q,
        explorerMounted,
        mapVisible,
        commandSurfaceOpened,
        explainActionClicked,
        explainActionDescriptor,
        explainConsumerVisible,
        evidenceSignalCount,
        explanationSignalCount,
        mapVisibleAfterExplain:mapNow()
      };
    })()"""

    rows=[]
    for i,q in enumerate(Q,1):
        r=js(template.replace("QUERY",json.dumps(q))) or {}
        ok=(
          r.get("controlledValueMatch") is True and
          r.get("explorerMounted") is True and
          r.get("mapVisible") is True and
          r.get("commandSurfaceOpened") is True and
          r.get("explainActionClicked") is True and
          r.get("explainConsumerVisible") is True and
          (r.get("evidenceSignalCount") or 0)>0 and
          (r.get("explanationSignalCount") or 0)>0 and
          r.get("mapVisibleAfterExplain") is True
        )
        r["query"]=q
        r["outcome"]="LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTIVATION_PATH_CERTIFIED" if ok else "LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_GAP"
        rows.append(r)
        print(f"\n[{i}/10] {q}")
        for k in ["controlledValueMatch","explorerMounted","mapVisible","commandSurfaceOpened","explainActionClicked",
                  "explainActionDescriptor","explainConsumerVisible","evidenceSignalCount","explanationSignalCount","mapVisibleAfterExplain"]:
            print(f"{k}:",r.get(k))
        print("OUTCOME:",r["outcome"])

    ws.close()
    n=sum(x["outcome"]=="LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTIVATION_PATH_CERTIFIED" for x in rows)
    passed=n==10
    result={
      "framework":"SCIIP_EXPLORER_4_BN10B_R2_EXACT_TEN_LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN10B_R2_EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTIVATION_PATH_CERTIFIED" if passed else "M419D4BN10B_R2_RECERTIFICATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTIVATION_PATH_CERTIFIED" if passed else "LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTIVATION_PATH_GAP_REMAINS",
      "routeType":"ACTION_DISPATCHER","certifiedCount":n,"records":rows,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":"LOCAL_BROWSER_ONLY","pixelEvidence":False},
      "next":"BN10B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN10B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_live_explain_evidence_activation_path_recertification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print(f"\nCERTIFIED: {n}/10")
    print("STATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
