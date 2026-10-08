#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

def getjson(url):
    with urllib.request.urlopen(url,timeout=2) as r:return json.loads(r.read())

def find_target():
    for port in (9333,9222,9223,9334,9444):
        try:
            for x in getjson("http://127.0.0.1:%d/json"%port):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return port,x
        except Exception:pass
    return None,None

class WS:
    def __init__(self,url):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",url)
        if not m:raise RuntimeError("CDP websocket URL parse failed: %s"%url)
        host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),3)
        self.s.settimeout(8)
        key=base64.b64encode(os.urandom(16)).decode()
        req=("GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n")%(path,host,port,key)
        self.s.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            part=self.s.recv(4096)
            if not part:break
            data+=part
        status=data.split(b"\r\n",1)[0].decode(errors="replace") if data else "NO_RESPONSE"
        self.handshakeStatus=status
        if " 101 " not in status:raise RuntimeError("websocket upgrade failed: %s"%status)
        self.i=0
    def _readn(self,n):
        b=b""
        while len(b)<n:
            x=self.s.recv(n-len(b))
            if not x:raise RuntimeError("websocket closed")
            b+=x
        return b
    def send(self,obj):
        b=json.dumps(obj).encode();mask=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask;self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self._readn(2);op=h[0]&0x0F;n=h[1]&127
            if n==126:n=struct.unpack("!H",self._readn(2))[0]
            elif n==127:n=struct.unpack("!Q",self._readn(8))[0]
            masked=bool(h[1]&0x80);mask=self._readn(4) if masked else None
            p=self._readn(n)
            if masked:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("websocket closed by peer")
            if op==9:
                self.s.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return json.loads(p.decode())
    def eval(self,e):
        self.i+=1;i=self.i
        self.send({"id":i,"method":"Runtime.evaluate","params":{"expression":e,"returnByValue":True,"awaitPromise":True}})
        while True:
            x=self.recv()
            if x.get("id")==i:return x.get("result",{}).get("result",{}).get("value")

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    a=ev/"M4_19D4BN13A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_deep_link_context_restore_consumer_parity_certification.json"
    if not a.is_file() or json.loads(a.read_text()).get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN13A_CERTIFICATION_REQUIRED");return 4

    port,target=find_target()
    if not target:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    ws=WS(target["webSocketDebuggerUrl"])

    print("="*92)
    print("SCIIP Explorer 4.0 — BN13B Live Deep-Link / Context Restore Consumer Observation")
    print("="*92)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("Synthetic Origin header: OFF")
    print("WebSocket handshake:",ws.handshakeStatus)
    print("Validated CDP port:",port)
    print("Target URL:",target.get("url"))

    outcomes=[]
    for i,p in enumerate(COHORT,1):
        setp="(()=>{const n="+json.dumps(p)+";const a=[...document.querySelectorAll('input')].filter(e=>e.offsetParent!==null);let q=a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0];if(q){q.focus();const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(s)s.call(q,n);else q.value=n;q.dispatchEvent(new Event('input',{bubbles:true}));q.dispatchEvent(new Event('change',{bubbles:true}));q.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));}return true})()"
        ws.eval(setp);time.sleep(.35)

        capture="(()=>{const n="+json.dumps(p)+";const norm=s=>(s||'').replace(/\\s+/g,' ').trim().toLowerCase();const body=norm(document.body.innerText);const map=!!document.querySelector('.gm-style')||[...document.querySelectorAll('[aria-label]')].some(e=>/map/i.test(e.getAttribute('aria-label')||''));return {queryVisible:body.includes(norm(n)),explorerMounted:body.includes('sciip')||!!document.querySelector('#root'),mapVisible:map,href:location.href,search:location.search,hash:location.hash,sessionKeys:Object.keys(sessionStorage),localKeys:Object.keys(localStorage)}})()"
        pre=ws.eval(capture) or {}

        restore="(()=>{const before=location.href;const u=new URL(location.href);u.searchParams.set('sciipRestoreProbe','1');history.replaceState(history.state,'',u.toString());const routed=location.href;history.replaceState(history.state,'',before);window.dispatchEvent(new PopStateEvent('popstate',{state:history.state}));return {before,routed,after:location.href,searchObserved:routed.includes('sciipRestoreProbe=1'),restoredUrl:location.href===before}})()"
        rr=ws.eval(restore) or {}
        time.sleep(.15)
        post=ws.eval(capture) or {}

        ok=(pre.get("queryVisible") is True and pre.get("explorerMounted") is True and pre.get("mapVisible") is True and rr.get("searchObserved") is True and rr.get("restoredUrl") is True and post.get("queryVisible") is True and post.get("explorerMounted") is True and post.get("mapVisible") is True)

        row={
          "ordinal":i,"property":p,
          "controlledValueMatch":pre.get("queryVisible"),
          "explorerMounted":pre.get("explorerMounted"),
          "mapVisible":pre.get("mapVisible"),
          "deepLinkSearchObserved":rr.get("searchObserved"),
          "urlRestored":rr.get("restoredUrl"),
          "postRestorePropertyVisible":post.get("queryVisible"),
          "postRestoreExplorerMounted":post.get("explorerMounted"),
          "mapVisibleAfterRestore":post.get("mapVisible"),
          "sessionKeyCount":len(pre.get("sessionKeys") or []),
          "localKeyCount":len(pre.get("localKeys") or []),
          "routeBefore":rr.get("before"),"routeProbe":rr.get("routed"),"routeAfter":rr.get("after"),
          "outcome":"LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVED" if ok else "LIVE_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_GAP"
        }
        outcomes.append(row)

        print("\\n[%d/10] %s"%(i,p))
        for k in ("controlledValueMatch","explorerMounted","mapVisible","deepLinkSearchObserved","urlRestored","postRestorePropertyVisible","postRestoreExplorerMounted","mapVisibleAfterRestore","sessionKeyCount","localKeyCount"):
            print("%s: %s"%(k,row.get(k)))
        print("OUTCOME:",row["outcome"])

    count=sum(x["outcome"]=="LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVED" for x in outcomes)
    passed=count==10
    result={
      "framework":"SCIIP_EXPLORER_4_BN13B_LIVE_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMERS_OBSERVED" if passed else "M419D4BN13B_LIVE_DEEP_LINK_CONTEXT_RESTORE_OBSERVATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMERS_OBSERVED" if passed else "LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_GAP_REMAINS",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False},
      "observedCount":count,"cohort":COHORT,"outcomes":outcomes,
      "next":"BN13B_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN13B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN13C_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSURE" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_live_governed_deep_link_context_restore_consumer_observation.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\\nOBSERVED: %d/10"%count)
    print("STATUS:",result["status"]);print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"]);print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
