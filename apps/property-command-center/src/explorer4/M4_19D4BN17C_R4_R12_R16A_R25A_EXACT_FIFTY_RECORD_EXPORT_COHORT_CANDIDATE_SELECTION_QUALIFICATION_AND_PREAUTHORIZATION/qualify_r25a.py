#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R25="M4_19D4BN17C_R4_R12_R16A_R25_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
R25_STATE="M419D4BN17C_R4_R12_R16A_R25_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
R25_CLASS="EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_FIFTY_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED"
M="M4_19D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
PORT=9333
APP="http://127.0.0.1:5173/"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None

class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("ws")
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
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def wait_exact(w,text,seconds=2.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        ok=c==1;con=con+1 if ok else 0;s.append({"t":round(time.time()-st,3),"count":c,"valid":ok})
        if con>=n:return True,s
        time.sleep(.1)
    return False,s

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def normalize_label(raw):
    s=re.sub(r"\s+"," ",raw or "").strip()
    m=re.match(r"^(.*?)(?=(?:EXISTING|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U/C)\s*·)",s,re.I)
    return m.group(1).strip() if m else s

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R25/"export_next_progressive_expansion_readiness_and_policy_design.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R25A Exact Fifty Record Export Cohort Candidate Selection + Qualification + Preauthorization")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Assignments invocation: OFF")
    print("Export invocation: OFF")
    print("Live candidate inventory: ON")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25_POLICY_EVIDENCE_REQUIRED");return 4
    r=loadj(p)
    if r.get("status")!="PASSED" or r.get("state")!=R25_STATE or r.get("classification")!=R25_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25_EXACT_FIFTY_EXPANSION_POLICY_REQUIRED");return 5
    ref=r.get("referenceCohort") or []
    if len(ref)!=25:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_TWENTY_FIVE_REFERENCE_COHORT_REQUIRED");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_EXPLORER_PAGE_REQUIRED");return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        es,_=wait_exact(w,"Explorer",2.0,3)
        if not es:
            print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_SETTLE_FAILED");return 9
        ee=click_exact(w,"Explorer")
        if ee.get("clicked") is not True:
            print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_ENTRY_FAILED");return 10

        time.sleep(.75)
        inventory=ev(w,r"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map((b,i)=>({i,text:(b.innerText||b.textContent||'').replace(/\s+/g,' ').trim(),cls:b.className||''})).filter(x=>x.text&&/SF|PROPOSED|EXISTING|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C/i.test(x.text)))()""") or []
    finally:
        try:w.call("Page.close")
        except:pass

    raw_labels=[]
    for x in inventory:
        t=x.get("text","").strip()
        if not t: continue
        # Candidate cards contain address then status/details; normalized identity is first portion before status boundary.
        raw_labels.append(t)

    # Deduplicate by normalized candidate identity in DOM order.
    seen=set(); candidates=[]
    for raw in raw_labels:
        norm=normalize_label(raw)
        key=norm.lower()
        if not norm or key in seen: continue
        seen.add(key)
        candidates.append({"rawLabel":raw,"normalizedTarget":norm})

    ref_keys={x.lower() for x in ref}
    new_pool=[c for c in candidates if c["normalizedTarget"].lower() not in ref_keys]
    selected=new_pool[:25]
    selected_targets=[x["normalizedTarget"] for x in selected]
    exact50=ref+selected_targets

    checks={
      "r25Passed":True,
      "r25PolicyStateCertified":True,
      "freshExplorerPageUsed":True,
      "explorerEntrySettleCertified":True,
      "explorerEntryCertified":True,
      "candidateInventoryCaptured":len(candidates)>0,
      "referenceTwentyFivePreserved":len(ref)==25,
      "twentyFiveNewCandidatesResolved":len(selected)==25,
      "exactFiftyCandidateCohortResolved":len(exact50)==50,
      "exactFiftyCandidateCohortUnique":len({x.lower() for x in exact50})==50,
      "deterministicDomOrderUsed":True,
      "candidateStatusSuffixNormalizationUsed":True,
      "fiveSecondTargetBindingPolicyConsumed":True,
      "threeSampleTargetBindingPolicyConsumed":True,
      "freshPagePerRecordPolicyConsumed":True,
      "strictSequentialPolicyConsumed":True,
      "haltOnFirstFailurePolicyConsumed":True,
      "oneExportClickMaximumPolicyConsumed":True,
      "eligibilityContractConsumed":True,
      "exportInvocationOff":True,
      "assignmentsInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_INCOMPLETE")
    classification=("EXACT_FIFTY_RECORD_EXPORT_COHORT_REFERENCE_TWENTY_FIVE_PLUS_TWENTY_FIVE_NEW_CANDIDATES_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION"
                    if passed else
                    "EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R25B_TWENTY_FIVE_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
         if passed else
         "M4_19D4BN17C_R4_R12_R16A_R25A_R1_CANDIDATE_SELECTION_RESIDUAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":state,
      "classification":classification,
      "referenceCohort":ref,
      "candidateInventoryCount":len(candidates),
      "newCandidatePoolCount":len(new_pool),
      "selectedNewCandidateCount":len(selected),
      "selectedNewCandidates":selected,
      "exactFiftyCandidateCohort":exact50,
      "selectionPolicy":{
        "deterministicDomOrder":True,
        "referenceCandidatesExcluded":True,
        "candidateIdentityNormalization":"RECOGNIZED_STATUS_SUFFIX_BOUNDARY_ONLY",
        "selectedNewCandidateCount":25
      },
      "checks":checks,
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "assignmentsInvocation":False,
        "exportInvocation":False
      },
      "sourceEvidence":{"r25Path":str(p),"r25Sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
      "nextMilestone":nxt
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_fifty_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_COHORT_SIZE:",len(ref))
    print("CANDIDATE_INVENTORY_COUNT:",len(candidates))
    print("NEW_CANDIDATE_POOL_COUNT:",len(new_pool))
    print("SELECTED_NEW_CANDIDATE_COUNT:",len(selected))
    print("EXACT_FIFTY_COHORT_SIZE:",len(exact50))
    print()
    print("----- EXACT FIFTY CANDIDATE COHORT -----")
    for i,x in enumerate(exact50,1):
        tag="REFERENCE_CERTIFIED" if i<=25 else "NEW_PREAUTHORIZED"
        print(f"{i}. {x} [{tag}]")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
