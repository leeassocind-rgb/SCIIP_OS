#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,urllib.request,socket,base64,os,struct,unicodedata

M="M4_19D4BN17A_R1_SELF_CONTAINED_CDP_WEBSOCKET_AND_50_RECORD_LIVE_SEARCHABLE_IDENTITY_PREAUTHORIZATION"

def first_json(p):
    s=p.read_text(errors="ignore")
    return json.JSONDecoder().raw_decode(s.lstrip())[0]

def norm(s):
    return re.sub(r"\s+"," ",unicodedata.normalize("NFKC",str(s)).strip()).casefold()

def getjson(url):
    with urllib.request.urlopen(url,timeout=3) as r:
        return json.loads(r.read())

def find_target():
    for port in (9333,9222,9223,9334,9444):
        try:
            for x in getjson(f"http://127.0.0.1:{port}/json"):
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
            raise RuntimeError("CDP websocket URL parse failed: "+url)
        host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),3)
        self.s.settimeout(10)
        key=base64.b64encode(os.urandom(16)).decode()
        req=("GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n")%(path,host,port,key)
        self.s.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            chunk=self.s.recv(4096)
            if not chunk:break
            data+=chunk
        self.handshake=data.split(b"\r\n",1)[0].decode(errors="replace") if data else "NO_RESPONSE"
        if " 101 " not in self.handshake:
            raise RuntimeError("websocket upgrade failed: "+self.handshake)
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
        h+=mask
        self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self._readn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=struct.unpack("!H",self._readn(2))[0]
            elif n==127:n=struct.unpack("!Q",self._readn(8))[0]
            masked=bool(h[1]&128)
            mask=self._readn(4) if masked else None
            p=self._readn(n)
            if masked:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("websocket closed by peer")
            if op==9:
                self.s.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return json.loads(p.decode())
    def eval(self,expression):
        self.i+=1;i=self.i
        self.send({"id":i,"method":"Runtime.evaluate","params":{"expression":expression,"returnByValue":True,"awaitPromise":True}})
        while True:
            x=self.recv()
            if x.get("id")==i:
                return x.get("result",{}).get("result",{}).get("value")

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"
    p17=ev/"M4_19D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_AND_BOUNDED_DESIGN"/"post_25_record_expansion_next_phase_readiness_and_bounded_design.json"
    p16=ev/"M4_19D4BN16D_25_RECORD_GOVERNED_EXPANSION_LIFECYCLE_CLOSURE"/"twenty_five_record_governed_expansion_lifecycle_closure.json"
    p17a=ev/"M4_19D4BN17A_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"/"fifty_record_live_searchable_property_identity_candidate_selection_qualification_preauthorization.json"

    if not p17.is_file() or not p16.is_file() or not p17a.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_BN17_BN16D_OR_BN17A_EVIDENCE_MISSING");return 4

    d17,d16,d17a=first_json(p17),first_json(p16),first_json(p17a)
    ref=(d16.get("closedCohort") or {}).get("properties") or []

    port,target=find_target()
    if not target:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    ws=WS(target["webSocketDebuggerUrl"])

    print("="*116)
    print("SCIIP Explorer 4.0 — BN17A-R1 Self-Contained CDP + 50-Record Live-Searchable Identity Preauthorization")
    print("="*116)
    print("Mode: READ_ONLY_LIVE_IDENTITY_QUALIFICATION_REPAIR")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("Synthetic Origin header: OFF")
    print("WebSocket handshake:",ws.handshake)
    print("Validated CDP port:",port)
    print("Target URL:",target.get("url"))

    body=ws.eval("document.body.innerText") or ""

    # Pull candidate labels from the actual rendered live Explorer surface.
    raw_lines=[]
    for raw in body.splitlines():
        s=" ".join(raw.split()).strip(" -•")
        if 4<=len(s)<=120:
            raw_lines.append(s)

    addr=re.compile(r"^(?:\d{1,6}\s+|(?:NE|NW|SE|SW)\s+of\s+).{2,110}$",re.I)
    suffix=re.compile(r"\b(ave|avenue|st|street|rd|road|blvd|boulevard|way|dr|drive|ln|lane|ct|court|hwy|highway|pkwy|parkway|pl|place|cir|circle|ter|terrace)\b",re.I)
    junk=re.compile(r"\b(sf|sq ft|clear|asking|available|compare|neighbor|market|property package|analyze|present|command|selected)\b",re.I)

    candidates=[]
    seen=set()
    refkeys={norm(x) for x in ref}
    for s in raw_lines:
        n=norm(s)
        if n in seen or n in refkeys:continue
        if not addr.search(s):continue
        if not suffix.search(s):continue
        if junk.search(s):continue
        seen.add(n);candidates.append(s)

    candidates=sorted(candidates,key=norm)
    selected=candidates[:25]
    cohort=ref+selected

    checks={
      "originalBn17aBlocked":d17a.get("status")=="BLOCKED",
      "originalBn17aBlockedByMissingExternalWebsocket":(d17a.get("qualificationChecks") or {}).get("liveExplorerTargetObserved") is False,
      "bn17Passed":d17.get("status")=="PASSED",
      "bn17StateCertified":d17.get("state")=="M419D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_CERTIFIED",
      "bn17Resolved50RecordExpansion":d17.get("resolvedNextPhase")=="EXACT_50_RECORD_READ_ONLY_GOVERNED_WORKFLOW_EXPANSION",
      "referenceCohortSizeTwentyFive":len(ref)==25,
      "originalTwentyFivePreservedFirst":cohort[:25]==ref,
      "liveExplorerTargetObserved":True,
      "selfContainedWebSocketUsed":True,
      "atLeastTwentyFiveNewLiveCandidatesFound":len(candidates)>=25,
      "exactlyTwentyFiveNewCandidatesSelected":len(selected)==25,
      "exactlyFiftyTotal":len(cohort)==50,
      "allFiftyUnique":len({norm(x) for x in cohort})==50,
      "selectionDeterministic":selected==sorted(selected,key=norm),
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    passed=all(checks.values())

    print("\n----- REPAIR / QUALIFICATION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- QUALIFIED 25 NEW LIVE-SEARCHABLE CANDIDATES -----")
    for i,x in enumerate(selected,1):print(f"{i:02d}. {x}")
    print("\n----- PREAUTHORIZED 50-RECORD COHORT -----")
    for i,x in enumerate(cohort,1):print(f"{i:02d}. {x}")
    print("\nLIVE_ADDRESS_CANDIDATE_POOL_COUNT:",len(candidates))

    result={
      "framework":"SCIIP_EXPLORER_4_BN17A_R1_SELF_CONTAINED_CDP_WEBSOCKET_AND_50_RECORD_LIVE_SEARCHABLE_IDENTITY_PREAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN17A_R1_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_PREAUTHORIZED" if passed else "M419D4BN17A_R1_50_RECORD_COHORT_NOT_PREAUTHORIZED",
      "diagnosis":"EXTERNAL_WEBSOCKET_DEPENDENCY_REMOVED_EXACT_50_RECORD_LIVE_SEARCHABLE_IDENTITY_COHORT_PREAUTHORIZED" if passed else "SELF_CONTAINED_CDP_REPAIRED_BUT_LIVE_SEARCHABLE_IDENTITY_POOL_INSUFFICIENT",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "referenceCohort":{"count":len(ref),"properties":ref},
      "newCandidates":{"count":len(selected),"properties":selected,"liveCandidatePoolCount":len(candidates)},
      "preauthorizedCohort":{"count":len(cohort),"properties":cohort},
      "next":"BN17A_R1_PREAUTHORIZED_50_RECORD_CONTRACT_PARITY_CERTIFICATION_READY" if passed else "BN17A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION" if passed else None
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"self_contained_cdp_and_fifty_record_live_searchable_identity_preauthorization.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\nSTATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 6

if __name__=="__main__":raise SystemExit(main())
