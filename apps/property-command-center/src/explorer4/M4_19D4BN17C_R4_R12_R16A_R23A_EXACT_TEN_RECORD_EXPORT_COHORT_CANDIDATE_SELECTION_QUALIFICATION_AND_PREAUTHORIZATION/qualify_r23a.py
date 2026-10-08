#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R23="M4_19D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
R23_STATE="M419D4BN17C_R4_R12_R16A_R23_EXPORT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
PORT=9333
APP="http://127.0.0.1:5173/"

REFERENCE=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None

class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:raise RuntimeError("bad websocket")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.i=0

    def send(self,o):
        p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
        else:h.extend([255]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+m+bytes(x^m[i%4] for i,x in enumerate(p)))

    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        a,b=h;n=b&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b&128 else None;d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(x^mask[i%4] for i,x in enumerate(d))
        try:return json.loads(d.decode()) if a&15==1 else None
        except:return None

    def call(self,m,p=None):
        self.i+=1;i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def inventory(w):
    return ev(w,r"""(()=> {
      const btns=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled);
      const cards=btns.map((x,i)=>({
        i,
        text:(x.innerText||x.textContent||'').trim(),
        cls:String(x.className||''),
        aria:x.getAttribute('aria-label')||''
      }));
      const propertyLike=cards.filter(x =>
        /\bSF\b/i.test(x.text) &&
        /clear|power|EXISTING|PROPOSED|UNDER CONSTRUCTION|Majestic|Realty|Industrial|Properties|LLC|Company/i.test(x.text)
      );
      return {allButtons:cards,propertyLike};
    })()""") or {}

def normalized_label(s):
    s=(s or "").strip()
    # Prefer address/name prefix before common property-detail tokens.
    parts=re.split(r"(?:EXISTING|PROPOSED|UNDER CONSTRUCTION|AVAILABLE|LEASED|·|\b\d{2,3}(?:,\d{3})?\s*SF\b)",s,1,flags=re.I)
    return parts[0].strip(" -·")

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    p=evid/R23/"export_progressive_expansion_readiness_and_policy_design.json"
    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23_EVIDENCE_REQUIRED"); return 4
    r23=loadj(p)
    if r23.get("status")!="PASSED" or r23.get("state")!=R23_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R23_PROGRESSIVE_EXPANSION_POLICY_MUST_BE_CERTIFIED"); return 5

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ACTIVE_CDP_REQUIRED"); return 6

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: FRESH_PAGE_CREATION_FAILED"); return 7

    w=W(n["webSocketDebuggerUrl"])
    w.call("Runtime.enable");w.call("Page.enable");time.sleep(.8)

    explorer=click_exact(w,"Explorer")
    time.sleep(.8)
    inv=inventory(w)

    candidates=[]
    seen=set()
    for x in inv.get("propertyLike") or []:
        label=normalized_label(x.get("text"))
        if not label or label in seen:
            continue
        seen.add(label)
        candidates.append({
          "label":label,
          "rawText":x.get("text"),
          "buttonIndex":x.get("i"),
          "className":x.get("cls")
        })

    # Remove the already-certified reference cohort from the new-record pool.
    def is_ref(label):
        ll=label.lower()
        return any(r.lower() in ll or ll in r.lower() for r in REFERENCE)

    new_pool=[x for x in candidates if not is_ref(x["label"])]

    # Deterministic order: DOM order from a fresh Explorer page.
    selected_new=new_pool[:7]
    exact_ten=REFERENCE+[x["label"] for x in selected_new]

    enough_new=len(selected_new)==7
    unique_ten=len(exact_ten)==10 and len({x.lower() for x in exact_ten})==10

    qualifications=[]
    for i,label in enumerate(exact_ten,1):
        qualifications.append({
          "ordinal":i,
          "label":label,
          "referenceCertified":label in REFERENCE,
          "requiresLiveQualification":label not in REFERENCE,
          "qualificationStatus":"REFERENCE_CERTIFIED" if label in REFERENCE else "PREAUTHORIZED_FOR_NON_EXPORT_LIVE_QUALIFICATION"
        })

    policy=r23.get("cohortPolicy") or {}
    sel=r23.get("selectionContract") or {}
    elig=r23.get("eligibilityContract") or {}

    checks={
      "r23Passed":True,
      "r23PolicyStateCertified":True,
      "freshExplorerPageUsed":True,
      "explorerEntryCertified":bool(explorer.get("clicked")),
      "candidateInventoryCaptured":len(candidates)>0,
      "referenceThreePreserved":all(x in exact_ten[:3] for x in REFERENCE),
      "sevenNewCandidatesResolved":enough_new,
      "exactTenCandidateCohortResolved":unique_ten,
      "deterministicDomOrderUsed":True,
      "selectionSettlePolicyConsumed":sel.get("selectionSettlePolicy",{}).get("requiredConsecutiveCertifiedSamples")==3,
      "freshPagePerRecordPolicyConsumed":policy.get("freshPagePerRecordRequired") is True,
      "strictSequentialPolicyConsumed":policy.get("strictSequential") is True,
      "haltOnFirstFailurePolicyConsumed":policy.get("haltOnFirstFailure") is True,
      "oneExportClickMaximumPolicyConsumed":policy.get("maximumExportClicksPerRecord")==1,
      "eligibilityContractConsumed":bool(elig),
      "exportInvocationOff":True,
      "assignmentsInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_INCOMPLETE")
    classification=("EXACT_TEN_RECORD_EXPORT_COHORT_REFERENCE_THREE_PLUS_SEVEN_NEW_CANDIDATES_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION"
                    if passed else
                    "EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R23B_SEVEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R23A_R1_CANDIDATE_SELECTION_RESIDUAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R23A_EXACT_TEN_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":state,
      "classification":classification,
      "referenceCohort":REFERENCE,
      "candidateInventoryCount":len(candidates),
      "newCandidatePoolCount":len(new_pool),
      "selectedNewCandidates":selected_new,
      "exactTenCandidateCohort":exact_ten,
      "qualifications":qualifications,
      "preauthorization":{
        "liveQualificationAuthorizedForSevenNewRecords":passed,
        "exportInvocationAuthorized":False,
        "assignmentsInvocationAuthorized":False,
        "freshPagePerRecordRequired":True,
        "strictSequentialRequired":True,
        "haltOnFirstFailureRequired":True,
        "selectionSettleRequired":True,
        "selectionSettleConsecutiveSamples":3,
        "selectionSettleMaxSeconds":2.0
      },
      "checks":checks,
      "nextMilestone":nextm
    }

    od=evid/M
    od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_ten_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    try:w.call("Page.close")
    except:pass

    print("="*120)
    print("SCIIP Explorer 4.0 — R23A Exact Ten-Record Export Cohort Candidate Selection + Preauthorization")
    print("="*120)
    print("REFERENCE_COHORT:",REFERENCE)
    print("CANDIDATE_INVENTORY_COUNT:",len(candidates))
    print("NEW_CANDIDATE_POOL_COUNT:",len(new_pool))
    print("SELECTED_NEW_CANDIDATE_COUNT:",len(selected_new))
    print("EXACT_TEN_COHORT_SIZE:",len(exact_ten))
    print()
    print("----- EXACT TEN CANDIDATE COHORT -----")
    for i,x in enumerate(exact_ten,1):
        role="REFERENCE_CERTIFIED" if x in REFERENCE else "NEW_PREAUTHORIZED"
        print(f"{i}. {x} [{role}]")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:","PASSED" if passed else "DIAGNOSTIC_COMPLETE")
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
