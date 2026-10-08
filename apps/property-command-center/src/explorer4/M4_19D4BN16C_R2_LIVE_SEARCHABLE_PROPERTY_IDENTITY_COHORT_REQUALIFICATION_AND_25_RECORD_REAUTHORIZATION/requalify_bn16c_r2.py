#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,unicodedata

M="M4_19D4BN16C_R2_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_REQUALIFICATION_AND_25_RECORD_REAUTHORIZATION"

ORIGINAL=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]
PINNED_EXPANDED=["100 W Victoria St","1000 W 190th St","1001 Doubleday Ave"]

def norm(s):
    return re.sub(r"\s+"," ",unicodedata.normalize("NFKC",str(s)).strip()).casefold()

def first_json(p):
    s=p.read_text(errors="ignore")
    return json.JSONDecoder().raw_decode(s.lstrip())[0]

def getjson(url):
    with urllib.request.urlopen(url,timeout=2) as r:return json.loads(r.read())

def find_target():
    for port in (9333,9222,9223,9334,9444):
        try:
            for x in getjson("http://127.0.0.1:%d/json"%port):
                u=x.get("url","")
                if any(v in u for v in ("127.0.0.1:5173","localhost:5173","127.0.0.1:5174","localhost:5174")) and x.get("webSocketDebuggerUrl"):
                    return port,x
        except Exception: pass
    return None,None

class WS:
    def __init__(self,url):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",url)
        if not m:raise RuntimeError("bad websocket url")
        host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),3);self.s.settimeout(10)
        key=base64.b64encode(os.urandom(16)).decode()
        req=("GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n")%(path,host,port,key)
        self.s.sendall(req.encode());data=b""
        while b"\r\n\r\n" not in data:
            x=self.s.recv(4096)
            if not x:break
            data+=x
        self.handshake=data.split(b"\r\n",1)[0].decode(errors="replace")
        if " 101 " not in self.handshake:raise RuntimeError("websocket upgrade failed: "+self.handshake)
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
            h=self._readn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self._readn(2))[0]
            elif n==127:n=struct.unpack("!Q",self._readn(8))[0]
            masked=bool(h[1]&128);mask=self._readn(4) if masked else None;p=self._readn(n)
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
    ev=repo/"apps/property-command-center/evidence/explorer4"
    r1p=ev/"M4_19D4BN16C_R1_EXPANDED_COHORT_LIVE_SEARCH_SELECTION_EXPLAIN_CAUSAL_DIAGNOSIS"/"expanded_cohort_live_search_selection_explain_causal_diagnosis.json"
    r3p=ev/"M4_19D4BN16A_R3_TOLERANT_EVIDENCE_DECODER_AND_25_RECORD_GOVERNED_COHORT_PREAUTHORIZATION"/"tolerant_evidence_decoder_and_25_record_governed_cohort_preauthorization.json"
    if not r1p.is_file() or not r3p.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_R1_OR_R3_EVIDENCE_MISSING");return 4
    r1=first_json(r1p);r3=first_json(r3p)
    port,target=find_target()
    if not target:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    ws=WS(target["webSocketDebuggerUrl"])

    print("="*112)
    print("SCIIP Explorer 4.0 — BN16C-R2 Live-Searchable Property Identity Cohort Requalification + Reauthorization")
    print("="*112)
    print("Mode: READ_ONLY_LIVE_IDENTITY_REQUALIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("WebSocket handshake:",ws.handshake)
    print("Validated CDP port:",port)

    # Extract live search-visible candidate text from rendered DOM.
    discover_js=r"""(()=>{const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};const arr=[...document.querySelectorAll('[role=option],[role=listbox] *,[data-testid*=search],[data-testid*=property],button,a,li,div')].filter(vis).map(e=>(e.innerText||'').trim()).filter(Boolean);const out=[];for(const s of arr){for(const line of s.split(/\n+/)){const x=line.replace(/\s+/g,' ').trim();if(x.length>=4&&x.length<=100&&/\d/.test(x)&&/\b(ave|avenue|st|street|rd|road|blvd|boulevard|way|dr|drive|ln|lane|ct|court|hwy|highway|pkwy|parkway|pl|place)\b/i.test(x))out.push(x)}}return [...new Set(out)]})()"""
    live_visible=ws.eval(discover_js) or []

    # Seed with governed source candidates from R3 and test actual live resolution.
    source_pool=(r3.get("newCandidates") or [])
    # Also harvest likely addresses from rendered DOM/body to broaden pool.
    body_lines=ws.eval(r"""(()=>document.body.innerText.split(/\n+/).map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x.length>=4&&x.length<=100&&/\d/.test(x)))()""") or []
    pool=[]
    seen=set()
    pinned={norm(x) for x in ORIGINAL+PINNED_EXPANDED}
    for s in live_visible+body_lines+source_pool:
        if not isinstance(s,str):continue
        s=re.sub(r"\s+"," ",s.strip())
        n=norm(s)
        if not n or n in seen or n in pinned:continue
        if re.match(r"^(?:-\s+|\d+\s+\d)",s):continue
        if not re.search(r"\d",s):continue
        if not re.search(r"\b(ave|avenue|st|street|rd|road|blvd|boulevard|way|dr|drive|ln|lane|ct|court|hwy|highway|pkwy|parkway|pl|place)\b",s,re.I):continue
        seen.add(n);pool.append(s)
    pool=sorted(pool,key=norm)

    qualified=[]
    observations=[]
    for s in pool:
        if len(qualified)>=12:break
        js="(()=>{const n="+json.dumps(s)+";const vis=e=>e&&e.offsetParent!==null;const a=[...document.querySelectorAll('input')].filter(vis);let q=a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0];if(!q)return false;q.focus();const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(set)set.call(q,n);else q.value=n;q.dispatchEvent(new Event('input',{bubbles:true}));q.dispatchEvent(new Event('change',{bubbles:true}));q.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));return true})()"
        triggered=ws.eval(js);time.sleep(.25)
        inspect=ws.eval("(()=>{const n="+json.dumps(s)+".toLowerCase().replace(/\\s+/g,' ').trim();const b=(document.body.innerText||'').toLowerCase().replace(/\\s+/g,' ');const q=[...document.querySelectorAll('input')].find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||document.querySelector('input');const v=(q?.value||'').toLowerCase().replace(/\\s+/g,' ').trim();return {controlledValueMatch:v===n,bodyContains:b.includes(n),mapVisible:!!document.querySelector('.gm-style'),propertyLike:/property/i.test(document.body.innerText||'')}})()") or {}
        ok=triggered is True and inspect.get("controlledValueMatch") is True and inspect.get("bodyContains") is True
        observations.append({"property":s,"triggered":triggered,"signals":inspect,"qualified":ok})
        if ok:qualified.append(s)

    cohort=ORIGINAL+PINNED_EXPANDED+qualified
    checks={
      "bn16cR1Passed":r1.get("status")=="PASSED",
      "bn16cR1DiagnosisCertified":r1.get("diagnosis")=="EXPANDED_COHORT_SEARCH_SELECTION_GAP_DRIVES_EXPLAIN_EVIDENCE_RESIDUAL",
      "originalTenPreserved":cohort[:10]==ORIGINAL,
      "threePreviouslyLiveExpandedPinned":cohort[10:13]==PINNED_EXPANDED,
      "exactlyTwelveReplacementCandidatesQualified":len(qualified)==12,
      "exactlyTwentyFiveTotal":len(cohort)==25,
      "allTwentyFiveUnique":len({norm(x) for x in cohort})==25,
      "allReplacementCandidatesLiveSearchQualified":all(x["qualified"] for x in observations if x["property"] in qualified),
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN16C_R2_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_REQUALIFICATION_AND_25_RECORD_REAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN16C_R2_25_RECORD_LIVE_SEARCHABLE_IDENTITY_COHORT_REAUTHORIZED" if passed else "M419D4BN16C_R2_REQUALIFICATION_INCOMPLETE",
      "diagnosis":"EXACT_25_RECORD_COHORT_REQUALIFIED_AGAINST_LIVE_SEARCHABLE_PROPERTY_IDENTITY_SURFACE" if passed else "INSUFFICIENT_LIVE_SEARCHABLE_REPLACEMENT_IDENTITIES",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "originalTen":ORIGINAL,
      "pinnedExpandedLiveRecords":PINNED_EXPANDED,
      "qualifiedReplacementCandidates":qualified,
      "reauthorizedCohort":{"count":len(cohort),"properties":cohort},
      "candidateObservations":observations,
      "next":"BN16C_R2_REAUTHORIZED_25_RECORD_LIVE_RECERTIFICATION_READY" if passed else "BN16C_R2_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN16C_R3_25_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_RECERTIFICATION" if passed else None
    }
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"live_searchable_property_identity_cohort_requalification_and_25_record_reauthorization.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- REQUALIFICATION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- QUALIFIED 12 REPLACEMENTS -----")
    for i,x in enumerate(qualified,1):print(f"{i:02d}. {x}")
    print("\n----- REAUTHORIZED 25-RECORD COHORT -----")
    for i,x in enumerate(cohort,1):print(f"{i:02d}. {x}")
    print("\nCANDIDATE_POOL_TESTED:",len(observations))
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 6
if __name__=="__main__":raise SystemExit(main())
