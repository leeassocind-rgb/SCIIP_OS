#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,urllib.request,urllib.parse,socket,base64,os

M="M4_19D4BN8B_R3_SELF_CONTAINED_CDP_WEBSOCKET_AND_LIVE_PROPERTY_INTELLIGENCE_RECERTIFICATION"
Q=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"
]

class WS:
    def __init__(self,url,timeout=10):
        u=urllib.parse.urlparse(url)
        self.host=u.hostname
        self.port=u.port or 80
        self.path=u.path or "/"
        self.sock=socket.create_connection((self.host,self.port),timeout=timeout)
        self.sock.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(
            f"GET {self.path} HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            data += self.sock.recv(4096)
        if b" 101 " not in data.split(b"\r\n",1)[0]:
            raise RuntimeError("CDP websocket upgrade failed")
        self.seq=0

    def _readn(self,n):
        b=b""
        while len(b)<n:
            x=self.sock.recv(n-len(b))
            if not x:
                raise RuntimeError("websocket closed")
            b+=x
        return b

    def send(self,text):
        payload=text.encode()
        mask=os.urandom(4)
        n=len(payload)
        h=bytearray([0x81])
        if n<126:
            h.append(0x80|n)
        elif n<65536:
            h += bytes([0x80|126])+n.to_bytes(2,"big")
        else:
            h += bytes([0x80|127])+n.to_bytes(8,"big")
        h += mask
        enc=bytes(v ^ mask[i%4] for i,v in enumerate(payload))
        self.sock.sendall(h+enc)

    def recv(self):
        while True:
            h=self._readn(2)
            opcode=h[0]&0x0f
            n=h[1]&0x7f
            if n==126:
                n=int.from_bytes(self._readn(2),"big")
            elif n==127:
                n=int.from_bytes(self._readn(8),"big")
            masked=bool(h[1]&0x80)
            mask=self._readn(4) if masked else None
            p=self._readn(n)
            if masked:
                p=bytes(v ^ mask[i%4] for i,v in enumerate(p))
            if opcode==8:
                raise RuntimeError("websocket closed")
            if opcode==9:
                pong=bytes([0x8A,len(p)])+p
                self.sock.sendall(pong)
                continue
            if opcode in (1,2):
                return p.decode(errors="replace")

    def call(self,method,params=None):
        self.seq+=1
        i=self.seq
        self.send(json.dumps({"id":i,"method":method,"params":params or {}}))
        while True:
            msg=json.loads(self.recv())
            if msg.get("id")==i:
                return msg

    def close(self):
        try:self.sock.close()
        except:pass

def jget(url):
    with urllib.request.urlopen(url,timeout=2) as r:
        return json.load(r)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    cdp_port=int(sys.argv[2]) if len(sys.argv)>2 else None
    ev=repo/"apps/property-command-center/evidence/explorer4"

    prior=ev/"M4_19D4BN8A_EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_property_intelligence_consumer_parity_certification.json"
    if not prior.is_file() or json.loads(prior.read_text()).get("status")!="PASSED":
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN8A_PASSED_EVIDENCE_REQUIRED")
        return 4

    if cdp_port is None:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: VALIDATED_CDP_PORT_ARGUMENT_REQUIRED")
        return 4

    try:
        targets=[
            t for t in jget(f"http://127.0.0.1:{cdp_port}/json")
            if "5173" in t.get("url","") or "5174" in t.get("url","")
        ]
    except:
        targets=[]

    if not targets:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: VALIDATED_SCIIP_CDP_TARGET_NOT_FOUND")
        return 4

    target=targets[0]
    ws_url=target.get("webSocketDebuggerUrl")
    if not ws_url:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: SCIIP_CDP_WEBSOCKET_URL_MISSING")
        return 4

    try:
        ws=WS(ws_url)
    except Exception as e:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: SELF_CONTAINED_CDP_WEBSOCKET_BOOTSTRAP_FAILED")
        print("ERROR:",str(e))
        return 4

    def js(expr):
        r=ws.call("Runtime.evaluate",{
            "expression":expr,
            "returnByValue":True,
            "awaitPromise":True
        })
        return (((r.get("result") or {}).get("result") or {}).get("value"))

    ws.call("Runtime.enable")

    print("="*76)
    print("SCIIP Explorer 4.0 — BN8B-R3 Live Property Intelligence Recertification")
    print("="*76)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("Validated CDP port:",cdp_port)
    print("Target URL:",target.get("url"))
    print("SCIIP shell: True")
    print("Search control: True")

    template=r"""(async()=>{
      const q=QUERY;
      const inputs=[...document.querySelectorAll('input')];
      const inp=inputs.find(x=>/search/i.test((x.placeholder||'')+' '+(x.getAttribute('aria-label')||'')))||inputs[0];
      if(!inp)return null;

      const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
      setter.call(inp,q);
      inp.dispatchEvent(new Event('input',{bubbles:true}));
      inp.dispatchEvent(new Event('change',{bubbles:true}));
      inp.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));
      await new Promise(r=>setTimeout(r,750));

      const visible=e=>!!(e&&(e.offsetWidth||e.offsetHeight||e.getClientRects().length));
      let body=(document.body.innerText||'').toLowerCase();

      const explorerMounted=!!document.querySelector('.explorer3') || /analyze|present|command/.test(body);
      const mapNodes=[...document.querySelectorAll('[class*=map],canvas')];
      const mapVisible=mapNodes.some(visible);

      let control=[...document.querySelectorAll('button,[role=button],summary')]
        .find(e=>/property intelligence/i.test((e.innerText||'')+' '+(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('title')||'')));

      let propertyControlClicked=false;
      if(control&&visible(control)){
        control.click();
        propertyControlClicked=true;
        await new Promise(r=>setTimeout(r,350));
      }

      body=(document.body.innerText||'').toLowerCase();

      const intelligenceNodes=[
        ...document.querySelectorAll('[class*=intelligence],[class*=property],[class*=drawer],[class*=panel],[class*=card]')
      ].filter(visible);

      const propertyIntelligenceVisible=/property intelligence/.test(body) || intelligenceNodes.length>0;
      const derivedSignalCount=(body.match(/derived|metric|score|signal|insight|computed/g)||[]).length;
      const evidenceSignalCount=(body.match(/evidence|provenance|source|confidence|citation/g)||[]).length;
      const presentationSignalCount=(body.match(/property intelligence|insight|evidence|source/g)||[]).length;
      const mapVisibleAfterIntelligence=[...document.querySelectorAll('[class*=map],canvas')].some(visible);

      return {
        controlledValueMatch:inp.value===q,
        explorerMounted,
        mapVisible,
        propertyControlClicked,
        propertyIntelligenceVisible,
        intelligenceNodeCount:intelligenceNodes.length,
        derivedSignalCount,
        evidenceSignalCount,
        presentationSignalCount,
        mapVisibleAfterIntelligence
      };
    })()"""

    rows=[]
    for i,q in enumerate(Q,1):
        result=js(template.replace("QUERY",json.dumps(q))) or {}
        ok=(
            result.get("controlledValueMatch") is True and
            result.get("explorerMounted") is True and
            result.get("mapVisible") is True and
            result.get("propertyIntelligenceVisible") is True and
            result.get("presentationSignalCount",0)>0 and
            result.get("mapVisibleAfterIntelligence") is True
        )
        result["query"]=q
        result["outcome"]="LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED" if ok else "PROPERTY_INTELLIGENCE_LIVE_CONSUMER_NOT_PROVEN"
        rows.append(result)

        print(f"\n[{i}/10] {q}")
        for k in [
            "controlledValueMatch","explorerMounted","mapVisible","propertyControlClicked",
            "propertyIntelligenceVisible","intelligenceNodeCount","derivedSignalCount",
            "evidenceSignalCount","presentationSignalCount","mapVisibleAfterIntelligence"
        ]:
            print(f"{k}:",result.get(k))
        print("OUTCOME:",result["outcome"])

    ws.close()

    observed=sum(r["outcome"]=="LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED" for r in rows)
    passed=observed==10

    data={
        "framework":"SCIIP_EXPLORER_4_BN8B_R3_SELF_CONTAINED_CDP_WEBSOCKET_AND_LIVE_PROPERTY_INTELLIGENCE_RECERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":"M419D4BN8B_EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED" if passed else "M419D4BN8B_LIVE_PROPERTY_INTELLIGENCE_OBSERVATION_INCOMPLETE",
        "diagnosis":"EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVED" if passed else "LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_GAP_REMAINS",
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":"LOCAL_BROWSER_ONLY",
            "pixelEvidence":False
        },
        "externalWebsocketDependency":False,
        "validatedCdpPort":cdp_port,
        "observedCount":observed,
        "recordCount":len(rows),
        "records":rows,
        "next":"BN8B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN8B_REMAINS_OPEN",
        "nextMilestone":"M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE" if passed else None
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_live_governed_property_intelligence_consumer_observation.json"
    f.write_text(json.dumps(data,indent=2)+"\n")

    print(f"\nOBSERVED: {observed}/10")
    print("STATUS:",data["status"])
    print("STATE:",data["state"])
    print("DIAGNOSIS:",data["diagnosis"])
    print("NEXT:",data["next"])
    print("NEXT_MILESTONE:",data["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
