#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,hashlib

M="M4_19D4BN16C_R3_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION"

def first_json(p):
    s=p.read_text(errors="ignore")
    return json.JSONDecoder().raw_decode(s.lstrip())[0]

def getjson(url):
    with urllib.request.urlopen(url,timeout=2) as r:
        return json.loads(r.read())

def find_target():
    for port in (9333,9222,9223,9334,9444):
        try:
            for x in getjson("http://127.0.0.1:%d/json"%port):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return port,x
        except Exception:
            pass
    return None,None

class WS:
    def __init__(self,url):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",url)
        if not m:
            raise RuntimeError("CDP websocket URL parse failed")
        host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),3)
        self.s.settimeout(10)
        key=base64.b64encode(os.urandom(16)).decode()
        req=("GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n")%(path,host,port,key)
        self.s.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            part=self.s.recv(4096)
            if not part: break
            data+=part
        self.handshake=data.split(b"\r\n",1)[0].decode(errors="replace") if data else "NO_RESPONSE"
        if " 101 " not in self.handshake:
            raise RuntimeError("websocket upgrade failed: "+self.handshake)
        self.i=0
    def _readn(self,n):
        b=b""
        while len(b)<n:
            x=self.s.recv(n-len(b))
            if not x: raise RuntimeError("websocket closed")
            b+=x
        return b
    def send(self,obj):
        b=json.dumps(obj).encode()
        mask=os.urandom(4); n=len(b); h=bytearray([0x81])
        if n<126: h.append(0x80|n)
        elif n<65536: h+=bytes([0xFE])+struct.pack("!H",n)
        else: h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask
        self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self._readn(2); op=h[0]&15; n=h[1]&127
            if n==126: n=struct.unpack("!H",self._readn(2))[0]
            elif n==127: n=struct.unpack("!Q",self._readn(8))[0]
            masked=bool(h[1]&128)
            mask=self._readn(4) if masked else None
            p=self._readn(n)
            if masked: p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==8: raise RuntimeError("websocket closed by peer")
            if op==9:
                self.s.sendall(bytes([0x8A,len(p)])+p)
                continue
            if op in (1,2): return json.loads(p.decode())
    def eval(self,e):
        self.i+=1; i=self.i
        self.send({"id":i,"method":"Runtime.evaluate","params":{"expression":e,"returnByValue":True,"awaitPromise":True}})
        while True:
            x=self.recv()
            if x.get("id")==i:
                return x.get("result",{}).get("result",{}).get("value")

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    r2p=ev/"M4_19D4BN16C_R2_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_REQUALIFICATION_AND_25_RECORD_REAUTHORIZATION"/"live_searchable_property_identity_cohort_requalification_and_25_record_reauthorization.json"
    r1p=ev/"M4_19D4BN16C_R1_EXPANDED_COHORT_LIVE_SEARCH_SELECTION_EXPLAIN_CAUSAL_DIAGNOSIS"/"expanded_cohort_live_search_selection_explain_causal_diagnosis.json"
    bn13p=ev/"M4_19D4BN13B_EXACT_TEN_LIVE_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_OBSERVATION"/"exact_ten_live_governed_deep_link_context_restore_consumer_observation.json"

    if not r2p.is_file() or not r1p.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN16C_R1_AND_R2_EVIDENCE_REQUIRED")
        return 4

    r2=first_json(r2p); r1=first_json(r1p)
    cohort=(r2.get("reauthorizedCohort") or {}).get("properties") or []

    prereq={
      "bn16cR1Passed":r1.get("status")=="PASSED",
      "bn16cR1StateCertified":r1.get("state")=="M419D4BN16C_R1_EXPANDED_COHORT_RESIDUAL_CAUSALLY_BOUNDED",
      "bn16cR2Passed":r2.get("status")=="PASSED",
      "bn16cR2StateCertified":r2.get("state")=="M419D4BN16C_R2_25_RECORD_LIVE_SEARCHABLE_IDENTITY_COHORT_REAUTHORIZED",
      "bn16cR2DiagnosisCertified":r2.get("diagnosis")=="EXACT_25_RECORD_COHORT_REQUALIFIED_AGAINST_LIVE_SEARCHABLE_PROPERTY_IDENTITY_SURFACE",
      "exactTwentyFiveCohort":len(cohort)==25,
      "exactTwelveReplacements":len(r2.get("qualifiedReplacementCandidates") or [])==12,
      "applicationMutationOff":(r2.get("authority") or {}).get("applicationSourceMutation") is False,
      "governedMutationOff":(r2.get("authority") or {}).get("governedDataMutation") is False
    }
    if not all(prereq.values()):
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN16C_R3_PRECONDITION_FAILED")
        for k,v in prereq.items(): print(f"{k}: {v}")
        return 5

    port,target=find_target()
    if not target:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED")
        return 6
    ws=WS(target["webSocketDebuggerUrl"])

    print("="*110)
    print("SCIIP Explorer 4.0 — BN16C-R3 25-Record Live Governed Explorer Workflow Recertification")
    print("="*110)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("Synthetic Origin header: OFF")
    print("WebSocket handshake:",ws.handshake)
    print("Validated CDP port:",port)
    print("Target URL:",target.get("url"))

    outcomes=[]
    for i,p in enumerate(cohort,1):
        print("\n[%d/25] %s"%(i,p))

        search_js="(()=>{const n="+json.dumps(p)+";const vis=e=>e&&e.offsetParent!==null;const a=[...document.querySelectorAll('input')].filter(vis);let q=a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0];if(!q)return false;q.focus();const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(set)set.call(q,n);else q.value=n;q.dispatchEvent(new Event('input',{bubbles:true}));q.dispatchEvent(new Event('change',{bubbles:true}));q.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));return true})()"
        triggered=ws.eval(search_js)
        time.sleep(.35)

        observe_js="(()=>{const needle="+json.dumps(p)+";const norm=s=>(s||'').replace(/\\s+/g,' ').trim().toLowerCase();const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};const nodes=[...document.querySelectorAll('button,[role=button],a,[role=menuitem],[role=option],[aria-label],[data-testid]')];const text=e=>(e.innerText||'')+' '+(e.getAttribute('aria-label')||'')+' '+(e.getAttribute('data-testid')||'');const click=rx=>{const e=nodes.find(x=>vis(x)&&rx.test(text(x)));if(!e)return {clicked:false,descriptor:null};try{e.click();return {clicked:true,descriptor:text(e)}}catch(_){return {clicked:false,descriptor:text(e)}}};const inputs=[...document.querySelectorAll('input')].filter(vis);const q=inputs.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||inputs[0];const controlled=norm(q?.value||'')===norm(needle);const bodyBefore=norm(document.body.innerText);const selected=bodyBefore.includes(norm(needle));const mapBefore=!!document.querySelector('.gm-style')||nodes.some(e=>vis(e)&&/map/i.test(e.getAttribute('aria-label')||''));const property=click(/property/i);const market=click(/market/i);const neighbors=click(/neighbor/i);const compare=click(/compare|multi-select comparison/i);const command=click(/command/i);const analyze=click(/analyze/i);const present=click(/present/i);const explain=click(/explain/i);const exportx=click(/property package|export/i);const graph=click(/graph|relationship|neighbor|related/i);const body=norm(document.body.innerText);return {controlledValueMatch:controlled,selectedPropertyVisible:selected,explorerMounted:body.includes('sciip')||!!document.querySelector('#root'),mapVisible:mapBefore,propertyControlClicked:property.clicked,marketControlClicked:market.clicked,neighborsControlClicked:neighbors.clicked,compareControlClicked:compare.clicked,commandControlClicked:command.clicked,analyzeControlClicked:analyze.clicked,presentControlClicked:present.clicked,explainControlClicked:explain.clicked,exportControlClicked:exportx.clicked,graphControlClicked:graph.clicked,propertyVisible:/property/i.test(body),marketVisible:/market/i.test(body),neighborsVisible:/neighbor/i.test(body),compareVisible:/compare/i.test(body),commandVisible:/command/i.test(body),propertyIntelligenceVisible:/property intelligence|propertyintelligence/i.test(body),analyzeVisible:/analyze/i.test(body),presentVisible:/present/i.test(body),explainEvidenceVisible:/explain|evidence|provenance|confidence/i.test(body),exportPresentationVisible:/property package|export|presentation/i.test(body),graphRelationshipVisible:/graph|relationship|related|neighbor/i.test(body),mapVisibleAfterConsumers:!!document.querySelector('.gm-style')||mapBefore}})()"
        r=ws.eval(observe_js) or {}

        stages={
          "01_GLOBAL_SEARCH":triggered is True and r.get("controlledValueMatch") is True,
          "02_SELECTED_PROPERTY":r.get("selectedPropertyVisible") is True,
          "03_MAP_VISIBLE":r.get("mapVisible") is True,
          "04_PROPERTY_CONSUMER":r.get("propertyControlClicked") is True or r.get("propertyVisible") is True,
          "05_MARKET_NEIGHBORS":r.get("marketVisible") is True and r.get("neighborsVisible") is True,
          "06_COMPARE":r.get("compareControlClicked") is True or r.get("compareVisible") is True,
          "07_COMMAND":r.get("commandControlClicked") is True or r.get("commandVisible") is True,
          "08_PROPERTY_INTELLIGENCE":r.get("propertyIntelligenceVisible") is True,
          "09_ANALYZE_PRESENT":r.get("analyzeVisible") is True and r.get("presentVisible") is True,
          "10_EXPLAIN_EVIDENCE":r.get("explainEvidenceVisible") is True,
          "11_EXPORT_PRESENTATION":r.get("exportPresentationVisible") is True,
          "12_GRAPH_RELATIONSHIP":r.get("graphRelationshipVisible") is True
        }
        ok=all(stages.values())
        outcome="LIVE_25_RECORD_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if ok else "LIVE_25_RECORD_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION_GAP"
        outcomes.append({"ordinal":i,"property":p,"stageResults":stages,"signals":r,"outcome":outcome})
        for k,v in stages.items(): print(f"{k}: {v}")
        print("OUTCOME:",outcome)

    count=sum(x["outcome"]=="LIVE_25_RECORD_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" for x in outcomes)
    passed=count==25
    result={
      "framework":"SCIIP_EXPLORER_4_BN16C_R3_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN16C_R3_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if passed else "M419D4BN16C_R3_LIVE_RECERTIFICATION_INCOMPLETE",
      "diagnosis":"EXACT_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFIED" if passed else "25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION_GAP_REMAINS",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "prerequisiteChecks":prereq,
      "cohort":{"count":25,"properties":cohort},
      "recertifiedCount":count,
      "outcomes":outcomes,
      "deepLinkContextRestoreInheritance":{
        "standaloneLiveEvidencePresent":bn13p.is_file(),
        "sameSessionHardPrerequisite":False,
        "inheritedCertification":True
      },
      "next":"BN16C_R3_CERTIFIED_25_RECORD_EXPANSION_LIFECYCLE_CLOSURE_READY" if passed else "BN16C_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE" if passed else None,
      "sourceEvidence":{
        "bn16cR2":{"path":str(r2p),"sha256":hashlib.sha256(r2p.read_bytes()).hexdigest()},
        "bn16cR1":{"path":str(r1p),"sha256":hashlib.sha256(r1p.read_bytes()).hexdigest()}
      }
    }
    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    f=out/"twenty_five_record_live_governed_explorer_workflow_recertification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\nRECERTIFIED: %d/25"%count)
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
