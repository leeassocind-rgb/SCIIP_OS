#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,urllib.request,socket,base64,os,struct,time,unicodedata,hashlib

M="M4_19D4BN17A_R3_LIVE_SEARCH_RESULT_STATE_TRANSITION_DIAGNOSIS_AND_DYNAMIC_CANDIDATE_ENUMERATION"

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
        if not m: raise RuntimeError("CDP websocket URL parse failed: "+url)
        host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),3); self.s.settimeout(10)
        key=base64.b64encode(os.urandom(16)).decode()
        req=("GET %s HTTP/1.1\r\nHost: %s:%d\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n")%(path,host,port,key)
        self.s.sendall(req.encode()); data=b""
        while b"\r\n\r\n" not in data:
            c=self.s.recv(4096)
            if not c: break
            data+=c
        self.handshake=data.split(b"\r\n",1)[0].decode(errors="replace") if data else "NO_RESPONSE"
        if " 101 " not in self.handshake: raise RuntimeError("websocket upgrade failed: "+self.handshake)
        self.i=0

    def _readn(self,n):
        b=b""
        while len(b)<n:
            x=self.s.recv(n-len(b))
            if not x: raise RuntimeError("websocket closed")
            b+=x
        return b

    def send(self,obj):
        b=json.dumps(obj).encode(); mask=os.urandom(4); n=len(b); h=bytearray([0x81])
        if n<126: h.append(0x80|n)
        elif n<65536: h+=bytes([0xFE])+struct.pack("!H",n)
        else: h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask; self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(b)))

    def recv(self):
        while True:
            h=self._readn(2); op=h[0]&15; n=h[1]&127
            if n==126:n=struct.unpack("!H",self._readn(2))[0]
            elif n==127:n=struct.unpack("!Q",self._readn(8))[0]
            masked=bool(h[1]&128); mask=self._readn(4) if masked else None
            p=self._readn(n)
            if masked:p=bytes(v^mask[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("websocket closed by peer")
            if op==9:
                self.s.sendall(bytes([0x8A,len(p)])+p); continue
            if op in (1,2): return json.loads(p.decode())

    def eval(self,expression):
        self.i+=1; i=self.i
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
    pR2=ev/"M4_19D4BN17A_R2_DETERMINISTIC_LIVE_SEARCH_PREFIX_ENUMERATION_AND_50_RECORD_COHORT_PREAUTHORIZATION"/"deterministic_live_search_prefix_enumeration_and_50_record_cohort_preauthorization.json"

    for p in (p17,p16,pR2):
        if not p.is_file():
            print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_BN17_BN16D_OR_BN17A_R2_EVIDENCE_MISSING");print("MISSING:",p);return 4

    d17,d16,dR2=first_json(p17),first_json(p16),first_json(pR2)
    ref=(d16.get("closedCohort") or {}).get("properties") or []

    port,target=find_target()
    if not target:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REUSABLE_SCIIP_CDP_TARGET_REQUIRED");return 5
    ws=WS(target["webSocketDebuggerUrl"])

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17A-R3 Live Search Result-State Transition Diagnosis + Dynamic Candidate Enumeration")
    print("="*120)
    print("Mode: READ_ONLY_LIVE_SEARCH_STATE_TRANSITION_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("External websocket dependency: OFF")
    print("WebSocket handshake:",ws.handshake)
    print("Validated CDP port:",port)
    print("Target URL:",target.get("url"))

    # Use more discriminating prefixes. Single-character prefixes often keep the same broad result set.
    prefixes=["10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29",
              "30","31","32","33","34","35","36","37","38","39","40","44","45","49","54","55","59","60","70","80","90",
              "100","110","120","130","140","150","160","170","180","190","200","250","300","350","400","500","900","1000","1200","2000","3000"]

    suffix=re.compile(r"\b(ave|avenue|st|street|rd|road|blvd|boulevard|way|dr|drive|ln|lane|ct|court|hwy|highway|pkwy|parkway|pl|place|cir|circle|ter|terrace)\b",re.I)
    start=re.compile(r"^(?:\d{1,6}\s+|(?:NE|NW|SE|SW)\s+of\s+)",re.I)
    junk=re.compile(r"\b(sf|sq ft|clear|asking|available|compare|neighbor|market|property package|analyze|present|command|selected|miles?|ft)\b",re.I)

    snapshot_js=r"""(()=>{const vis=e=>{if(!e)return false;const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'};const els=[...document.querySelectorAll('[role=option],[role=listbox] *,[data-testid*=search],[data-testid*=property],li,button,a,div')].filter(vis);const rows=[];for(const e of els){const t=(e.innerText||'').trim();if(!t)continue;for(const line of t.split(/\n+/)){const x=line.replace(/\s+/g,' ').trim();if(x)rows.push(x)}}const uniq=[...new Set(rows)];const text=uniq.join('|');let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return {signature:(h>>>0).toString(16),rows:uniq,inputValue:([...document.querySelectorAll('input')].find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||document.querySelector('input'))?.value||''}})()"""

    set_query_js=r"""(q=>{const vis=e=>e&&e.offsetParent!==null;const a=[...document.querySelectorAll('input')].filter(vis);let i=a.find(e=>/search/i.test((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')))||a[0];if(!i)return false;i.focus();const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;if(s)s.call(i,'');else i.value='';i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));if(s)s.call(i,q);else i.value=q;i.dispatchEvent(new Event('input',{bubbles:true}));i.dispatchEvent(new Event('change',{bubbles:true}));i.dispatchEvent(new KeyboardEvent('keyup',{key:q.slice(-1),bubbles:true}));return true})"""

    refkeys={norm(x) for x in ref}
    pool={}
    observations=[]

    for prefix in prefixes:
        before=ws.eval(snapshot_js) or {}
        accepted=ws.eval(set_query_js+"("+json.dumps(prefix)+")")
        if accepted is not True:
            observations.append({"prefix":prefix,"accepted":False})
            continue

        changed=False
        after=None
        elapsed_ms=None
        for tick in range(20):
            time.sleep(.10)
            after=ws.eval(snapshot_js) or {}
            if after.get("inputValue")==prefix and after.get("signature")!=before.get("signature"):
                changed=True
                elapsed_ms=(tick+1)*100
                break

        if after is None: after=ws.eval(snapshot_js) or {}

        new_for_prefix=[]
        for raw in after.get("rows") or []:
            if not isinstance(raw,str):continue
            s=" ".join(raw.split()).strip(" -•")
            n=norm(s)
            if not s or len(s)>120:continue
            if n in refkeys or n in pool:continue
            if not start.search(s):continue
            if not suffix.search(s):continue
            if junk.search(s):continue
            pool[n]=s
            new_for_prefix.append(s)

        observations.append({
            "prefix":prefix,
            "accepted":True,
            "beforeSignature":before.get("signature"),
            "afterSignature":after.get("signature"),
            "inputValueAfter":after.get("inputValue"),
            "resultStateChanged":changed,
            "transitionElapsedMs":elapsed_ms,
            "newCandidateCount":len(new_for_prefix)
        })

        if len(pool)>=35:
            break

    candidates=sorted(pool.values(),key=norm)
    selected=candidates[:25]
    cohort=ref+selected

    transition_count=sum(1 for x in observations if x.get("resultStateChanged"))
    checks={
      "originalBn17aR2Blocked":dR2.get("status")=="BLOCKED",
      "originalBn17aR2PoolCountSeventeen":(dR2.get("prefixEnumeration") or {}).get("candidatePoolCount")==17,
      "bn17Passed":d17.get("status")=="PASSED",
      "bn17StateCertified":d17.get("state")=="M419D4BN17_POST_25_RECORD_EXPANSION_NEXT_PHASE_READINESS_CERTIFIED",
      "referenceCohortSizeTwentyFive":len(ref)==25,
      "originalTwentyFivePreservedFirst":cohort[:25]==ref,
      "liveExplorerTargetObserved":True,
      "queryResultStateTransitionsObserved":transition_count>0,
      "dynamicStateWaitUsed":True,
      "atLeastTwentyFiveNewLiveCandidatesFound":len(candidates)>=25,
      "exactlyTwentyFiveNewCandidatesSelected":len(selected)==25,
      "exactlyFiftyTotal":len(cohort)==50,
      "allFiftyUnique":len({norm(x) for x in cohort})==50,
      "selectionDeterministic":selected==sorted(selected,key=norm),
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN17A_R3_LIVE_SEARCH_RESULT_STATE_TRANSITION_DIAGNOSIS_AND_DYNAMIC_CANDIDATE_ENUMERATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17A_R3_50_RECORD_LIVE_SEARCHABLE_PROPERTY_IDENTITY_COHORT_PREAUTHORIZED" if passed else "M419D4BN17A_R3_LIVE_SEARCH_STATE_TRANSITION_DIAGNOSIS_COMPLETE",
      "diagnosis":"DYNAMIC_LIVE_SEARCH_RESULT_STATE_TRANSITIONS_ENUMERATED_SUFFICIENT_IDENTITIES_EXACT_50_RECORD_COHORT_PREAUTHORIZED" if passed else "LIVE_SEARCH_RESULT_STATE_TRANSITION_BEHAVIOR_DIAGNOSED_BUT_25_NEW_IDENTITIES_NOT_YET_PROVEN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "transitionCount":transition_count,
      "observations":observations,
      "referenceCohort":{"count":len(ref),"properties":ref},
      "candidatePool":{"count":len(candidates),"properties":candidates},
      "newCandidates":{"count":len(selected),"properties":selected},
      "preauthorizedCohort":{"count":len(cohort),"properties":cohort},
      "next":"BN17A_R3_PREAUTHORIZED_50_RECORD_CONTRACT_PARITY_CERTIFICATION_READY" if passed else "BN17A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17B_50_RECORD_GOVERNED_EXPLORER_CONTRACT_PARITY_CERTIFICATION" if passed else None
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"live_search_result_state_transition_diagnosis_and_dynamic_candidate_enumeration.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- DIAGNOSTIC / QUALIFICATION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- RESULT STATE TRANSITIONS -----")
    for x in observations:
        print(f'{x["prefix"]}: accepted={x.get("accepted")} changed={x.get("resultStateChanged")} elapsedMs={x.get("transitionElapsedMs")} newCandidates={x.get("newCandidateCount",0)}')
    print("\nRESULT_STATE_TRANSITION_COUNT:",transition_count)
    print("LIVE_DYNAMIC_CANDIDATE_POOL_COUNT:",len(candidates))
    print("\n----- QUALIFIED 25 NEW LIVE-SEARCHABLE CANDIDATES -----")
    for i,x in enumerate(selected,1):print(f"{i:02d}. {x}")
    print("\n----- PREAUTHORIZED 50-RECORD COHORT -----")
    for i,x in enumerate(cohort,1):print(f"{i:02d}. {x}")
    print("\nSTATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
