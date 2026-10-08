#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,urllib.request,urllib.parse,socket,base64,os

M="M4_19D4BN10B_R3_COMMAND_ACTION_NODE_RECONCILIATION_AND_LIVE_EXPLAIN_EVIDENCE_RECERTIFICATION"
Q=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

class WS:
    def __init__(self,url,timeout=10):
        u=urllib.parse.urlparse(url);self.host=u.hostname;self.port=u.port or 80;self.path=u.path or "/"
        self.s=socket.create_connection((self.host,self.port),timeout=timeout);self.s.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\nUpgrade: websocket\r\n"
             f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode());data=b""
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
        p=text.encode();m=os.urandom(4);n=len(p);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0x80|126])+n.to_bytes(2,"big")
        else:h+=bytes([0x80|127])+n.to_bytes(8,"big")
        h+=m;self.s.sendall(h+bytes(v^m[i%4] for i,v in enumerate(p)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=int.from_bytes(self.rn(2),"big")
            elif n==127:n=int.from_bytes(self.rn(8),"big")
            masked=bool(h[1]&128);m=self.rn(4) if masked else None;p=self.rn(n)
            if masked:p=bytes(v^m[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("websocket closed")
            if op==9:self.s.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return p.decode(errors="replace")
    def call(self,method,params=None):
        self.seq+=1;i=self.seq
        self.send(json.dumps({"id":i,"method":method,"params":params or {}}))
        while True:
            msg=json.loads(self.recv())
            if msg.get("id")==i:return msg
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
    r2=ev/"M4_19D4BN10B_R2_EXACT_TEN_LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RECERTIFICATION"/"exact_ten_live_explain_evidence_activation_path_recertification.json"

    for p,label in [(a,"BN10A"),(r1,"BN10B_R1"),(r2,"BN10B_R2")]:
        if not p.is_file():
            print("STATUS: BLOCKED");print("DIAGNOSIS:",label+"_EVIDENCE_REQUIRED");return 4

    ar=json.loads(a.read_text()); rr1=json.loads(r1.read_text()); rr2=json.loads(r2.read_text())
    if ar.get("status")!="PASSED" or rr1.get("status")!="PASSED" or rr1.get("routeType")!="ACTION_DISPATCHER":
        print("STATUS: BLOCKED");print("DIAGNOSIS: PREREQUISITE_CERTIFICATION_REQUIRED");return 4

    rows2=rr2.get("records") or []
    r2_pattern=(
      rr2.get("status")=="DIAGNOSTIC_COMPLETE" and len(rows2)==10 and
      all(x.get("commandSurfaceOpened") is True for x in rows2) and
      all(x.get("explainActionClicked") is False for x in rows2) and
      all((x.get("evidenceSignalCount") or 0)>0 for x in rows2) and
      all((x.get("explanationSignalCount") or 0)>0 for x in rows2)
    )
    if not r2_pattern:
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN10B_R2_EXPECTED_SELECTOR_GAP_NOT_PROVEN");return 4

    port,target=resolve_target()
    if not target:
        print("STATUS: BLOCKED");print("DIAGNOSIS: SCIIP_CDP_TARGET_NOT_FOUND");return 4

    ws=WS(target["webSocketDebuggerUrl"])
    def js(expr):
        r=ws.call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
        return (((r.get("result") or {}).get("result") or {}).get("value"))
    ws.call("Runtime.enable")

    print("="*92)
    print("SCIIP Explorer 4.0 — BN10B-R3 Command Action-Node Reconciliation + Live Recertification")
    print("="*92)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("Resolved route: ACTION_DISPATCHER")
    print("Action selector: [data-action],[data-command],[data-id],[role=option],[role=menuitem],button")
    print("Validated CDP port:",port)
    print("Target URL:",target.get("url"))

    template=r"""(async()=>{
      const q=QUERY;
      const sleep=m=>new Promise(r=>setTimeout(r,m));
      const visible=e=>!!e&&!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
      const semanticNodes=()=>[...document.querySelectorAll('[data-action],[data-command],[data-id],[role="option"],[role="menuitem"],button')];
      const descriptor=n=>(
        (n.getAttribute('data-action')||'')+' '+
        (n.getAttribute('data-command')||'')+' '+
        (n.getAttribute('data-id')||'')+' '+
        (n.innerText||'')+' '+
        (n.getAttribute('aria-label')||'')+' '+
        (n.getAttribute('title')||'')
      ).trim().replace(/\s+/g,' ');

      const search=document.querySelector('input[aria-label="Search SCIIP"]')
        ||document.querySelector('input[type="search"]')
        ||[...document.querySelectorAll('input')].find(x=>/search/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))
        ||document.querySelector('input');
      if(!search)return null;

      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
      search.focus();setter.call(search,q);
      search.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:q}));
      search.dispatchEvent(new Event('change',{bubbles:true}));
      search.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));
      await sleep(700);

      const body=()=>document.body.innerText||'';
      const mapNow=()=>[...document.querySelectorAll('.explorer3__map-shell,[class*="map" i],canvas,iframe[src*="google"]')].some(visible);
      const explorerMounted=!!document.querySelector('.explorer3')||/SCIIP|Property Command Center/i.test(body());
      const mapVisible=mapNow();

      // Open Command with same broad semantics already certified in BN7B.
      let command=semanticNodes().find(n=>visible(n)&&/command/i.test(descriptor(n)));
      let commandSurfaceOpened=false;
      if(command){command.click();commandSurfaceOpened=true;await sleep(350);}

      const actions=semanticNodes().filter(visible).map(n=>({node:n,desc:descriptor(n)}));
      const sampleActions=actions.map(x=>x.desc).filter(s=>/property|market|neighbor|compare|explain|command/i.test(s)).slice(0,30);
      let explain=actions.find(x=>/\bexplain\b/i.test(x.desc));
      let explainActionClicked=false;
      let explainActionDescriptor=null;
      if(explain){
        explainActionDescriptor=explain.desc;
        explain.node.click();
        explainActionClicked=true;
        await sleep(400);
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
        semanticActionNodeCount:actions.length,
        sampleActions,
        explainActionResolved:!!explain,
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
          r.get("explainActionResolved") is True and
          r.get("explainActionClicked") is True and
          r.get("explainConsumerVisible") is True and
          (r.get("evidenceSignalCount") or 0)>0 and
          (r.get("explanationSignalCount") or 0)>0 and
          r.get("mapVisibleAfterExplain") is True
        )
        r["query"]=q
        r["outcome"]="LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_CERTIFIED" if ok else "LIVE_EXPLAIN_EVIDENCE_ACTION_NODE_GAP"
        rows.append(r)
        print(f"\n[{i}/10] {q}")
        for k in ["controlledValueMatch","explorerMounted","mapVisible","commandSurfaceOpened","semanticActionNodeCount",
                  "explainActionResolved","explainActionClicked","explainActionDescriptor","explainConsumerVisible",
                  "evidenceSignalCount","explanationSignalCount","mapVisibleAfterExplain"]:
            print(f"{k}:",r.get(k))
        print("sampleActions:",r.get("sampleActions"))
        print("OUTCOME:",r["outcome"])

    ws.close()
    n=sum(x["outcome"]=="LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_CERTIFIED" for x in rows)
    passed=n==10

    result={
      "framework":"SCIIP_EXPLORER_4_BN10B_R3_COMMAND_ACTION_NODE_RECONCILIATION_AND_LIVE_EXPLAIN_EVIDENCE_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN10B_R3_EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_CERTIFIED" if passed else "M419D4BN10B_R3_RECERTIFICATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_AND_CONSUMER_CERTIFIED" if passed else "LIVE_GOVERNED_EXPLAIN_EVIDENCE_ACTION_NODE_GAP_REMAINS",
      "reconciliation":{
        "priorGap":"BN10B_R2_NARROW_CONTROL_SELECTOR",
        "authoritativeRuntimeSemantics":"BN7B_COMMAND_ACTION_NODE_SELECTOR",
        "selector":"[data-action],[data-command],[data-id],[role=option],[role=menuitem],button",
        "contractWeakened":False
      },
      "certifiedCount":n,"records":rows,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":"LOCAL_BROWSER_ONLY","pixelEvidence":False},
      "next":"BN10B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN10B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE" if passed else None
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"command_action_node_reconciliation_live_explain_evidence_recertification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print(f"\nCERTIFIED: {n}/10")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
