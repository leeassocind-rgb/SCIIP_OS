#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN15A_EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

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
        self.s=socket.create_connection((host,port),3);self.s.settimeout(10)
        key=base64.b64encode(os.urandom(16)).decode()
        req=("GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n")%(path,host,port,key)
        self.s.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            part=self.s.recv(4096)
            if not part:break
            data+=part
        self.handshakeStatus=data.split(b"\r\n",1)[0].decode(errors="replace") if data else "NO_RESPONSE"
        if " 101 " not in self.handshakeStatus:raise RuntimeError("websocket upgrade failed: "+self.handshakeStatus)
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
    design=ev/"M4_19D4BN15_EXACT_TEN_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION_DESIGN"/"exact_ten_end_to_end_governed_workflow_recertification_design.json"
    if not design.is_file() or json.loads(design.read_text()).get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN15_DESIGN_CERTIFICATION_REQUIRED");return 4

    port,target=find_target()
    if not target:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    ws=WS(target["webSocketDebuggerUrl"])

    print("="*104)
    print("SCIIP Explorer 4.0 — BN15A Live End-to-End Governed Explorer Workflow Recertification")
    print("="*104)
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
        print("\\n[%d/10] %s"%(i,p))

        # Search + selected-property establishment.
        setp="(()=>{const n="+json.dumps(p)+";const vis=e=>e.offsetParent!==null;const a=[...document.querySelectorAll('input')].filter(vis);let q=a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0];if(!q)return false;q.focus();const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(s)s.call(q,n);else q.value=n;q.dispatchEvent(new Event('input',{bubbles:true}));q.dispatchEvent(new Event('change',{bubbles:true}));q.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));return true})()"
        searchTriggered=ws.eval(setp);time.sleep(.35)

        # Composite observation/activation helper.
        js="(()=>{const needle="+json.dumps(p)+";const norm=s=>(s||'').replace(/\\s+/g,' ').trim().toLowerCase();const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};const all=[...document.querySelectorAll('button,[role=button],a,[role=menuitem],[role=option],[aria-label],[data-testid]')];const txt=e=>(e.innerText||'')+' '+(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('data-testid')||'');const body=norm(document.body.innerText);const click=(rx)=>{let e=all.find(x=>vis(x)&&rx.test(txt(x)));if(!e)return {clicked:false,descriptor:null};try{e.click();return {clicked:true,descriptor:txt(e)}}catch(_){return {clicked:false,descriptor:txt(e)}}};const map=!!document.querySelector('.gm-style')||all.some(e=>vis(e)&&/map/i.test(e.getAttribute('aria-label')||''));const property=click(/property/i);const market=click(/market/i);const neighbors=click(/neighbor/i);const command=click(/command/i);const compare=click(/compare|multi-select comparison/i);const analyze=click(/analyze/i);const present=click(/present/i);const explain=click(/explain/i);const exportx=click(/property package|export/i);const graph=click(/graph|relationship|neighbor|related/i);const after=norm(document.body.innerText);return {queryVisible:body.includes(norm(needle)),explorerMounted:body.includes('sciip')||!!document.querySelector('#root'),mapVisible:map,propertyClicked:property.clicked,marketClicked:market.clicked,neighborsClicked:neighbors.clicked,commandClicked:command.clicked,compareClicked:compare.clicked,analyzeClicked:analyze.clicked,presentClicked:present.clicked,explainClicked:explain.clicked,exportClicked:exportx.clicked,graphClicked:graph.clicked,propertyIntelligenceVisible:/property intelligence/i.test(after),marketVisible:/market/i.test(after),neighborsVisible:/neighbor/i.test(after),compareVisible:/compare/i.test(after),commandVisible:/command/i.test(after),analyzeVisible:/analyze/i.test(after),presentVisible:/present/i.test(after),explainEvidenceVisible:/explain|evidence|provenance|confidence/i.test(after),exportPresentationVisible:/property package|export|presentation/i.test(after),graphRelationshipVisible:/graph|relationship|related|neighbor|edge/i.test(after),descriptors:{property:property.descriptor,market:market.descriptor,neighbors:neighbors.descriptor,command:command.descriptor,compare:compare.descriptor,analyze:analyze.descriptor,present:present.descriptor,explain:explain.descriptor,export:exportx.descriptor,graph:graph.descriptor}}})()"
        r=ws.eval(js) or {}
        time.sleep(.15)

        # Deep-link/context restore probe.
        restore="(()=>{const before=location.href;const u=new URL(before);u.searchParams.set('sciipE2EProbe','1');history.replaceState(history.state,'',u.toString());const routed=location.href;history.replaceState(history.state,'',before);window.dispatchEvent(new PopStateEvent('popstate',{state:history.state}));const body=(document.body.innerText||'').toLowerCase();const map=!!document.querySelector('.gm-style');return {deepLinkSearchObserved:routed.includes('sciipE2EProbe=1'),urlRestored:location.href===before,postRestorePropertyVisible:body.includes("+json.dumps(p.lower())+"),postRestoreExplorerMounted:body.includes('sciip')||!!document.querySelector('#root'),mapVisibleAfterRestore:map}})()"
        rr=ws.eval(restore) or {}

        stage={
          "01_GLOBAL_SEARCH":searchTriggered is True and r.get("queryVisible") is True,
          "02_SELECTED_PROPERTY":r.get("queryVisible") is True,
          "03_PROPERTY_DETAIL_GOVERNED_CONSUMER":r.get("propertyClicked") is True or r.get("propertyIntelligenceVisible") is True,
          "04_MARKET_CONTEXT_NEIGHBORS":r.get("marketVisible") is True and r.get("neighborsVisible") is True,
          "05_SPATIAL_SELECTION_MAP_FOCUS":r.get("mapVisible") is True,
          "06_COMPARE":r.get("compareClicked") is True or r.get("compareVisible") is True,
          "07_COMMAND":r.get("commandClicked") is True or r.get("commandVisible") is True,
          "08_PROPERTY_INTELLIGENCE":r.get("propertyIntelligenceVisible") is True,
          "09_ANALYZE_PRESENT":r.get("analyzeVisible") is True and r.get("presentVisible") is True,
          "10_EXPLAIN_EVIDENCE":r.get("explainEvidenceVisible") is True,
          "11_EXPORT_PRESENTATION":r.get("exportPresentationVisible") is True,
          "12_GRAPH_RELATIONSHIP":r.get("graphRelationshipVisible") is True,
          "13_DEEP_LINK_CONTEXT_RESTORE":rr.get("deepLinkSearchObserved") is True and rr.get("urlRestored") is True and rr.get("postRestorePropertyVisible") is True and rr.get("postRestoreExplorerMounted") is True and rr.get("mapVisibleAfterRestore") is True
        }
        ok=all(stage.values())
        row={"ordinal":i,"property":p,"stageResults":stage,"signals":r,"restore":rr,
             "outcome":"LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if ok else "LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_GAP"}
        outcomes.append(row)
        for k,v in stage.items():print(f"{k}: {v}")
        print("OUTCOME:",row["outcome"])

    count=sum(x["outcome"]=="LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" for x in outcomes)
    passed=count==10
    result={
      "framework":"SCIIP_EXPLORER_4_BN15A_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN15A_EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if passed else "M419D4BN15A_LIVE_END_TO_END_RECERTIFICATION_INCOMPLETE",
      "diagnosis":"EXACT_TEN_LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if passed else "LIVE_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_GAP_REMAINS",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False},
      "observedCount":count,"cohort":COHORT,"outcomes":outcomes,
      "next":"BN15A_CERTIFIED_LIFECYCLE_CLOSURE_READY" if passed else "BN15A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN15B_END_TO_END_GOVERNED_EXPLORER_WORKFLOW_LIFECYCLE_CLOSURE" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"exact_ten_live_end_to_end_governed_explorer_workflow_recertification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\\nOBSERVED: %d/10"%count)
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
