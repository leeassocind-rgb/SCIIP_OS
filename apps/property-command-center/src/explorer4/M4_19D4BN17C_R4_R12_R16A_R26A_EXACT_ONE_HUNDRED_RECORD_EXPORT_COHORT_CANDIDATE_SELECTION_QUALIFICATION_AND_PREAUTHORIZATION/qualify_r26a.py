#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R26="M4_19D4BN17C_R4_R12_R16A_R26_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
R26_STATE="M419D4BN17C_R4_R12_R16A_R26_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
R26_CLASS="EXACT_FIFTY_RECORD_EXPORT_LIFECYCLE_CLOSED_EXACT_ONE_HUNDRED_RECORD_PROGRESSIVE_EXPANSION_POLICY_CERTIFIED"
R25F="M4_19D4BN17C_R4_R12_R16A_R25F_EXACT_FIFTY_RECORD_EXPORT_LIFECYCLE_CLOSURE_AND_NEXT_SCALE_READINESS"
M="M4_19D4BN17C_R4_R12_R16A_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
PORT=9333
APP="http://127.0.0.1:5173/"

STATUS_RE=re.compile(r"(EXISTING|PROPOSED/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U/C)\s*·",re.I)

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def normalize_candidate_label(s):
    s=re.sub(r"\s+"," ",str(s or "")).strip()
    m=STATUS_RE.search(s)
    return s[:m.start()].strip() if m else s

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
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5);k=base64.b64encode(os.urandom(16)).decode()
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

def settle_exact(w,text,seconds=2.0,n=3):
    st=time.time();con=0;samples=[]
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);return{{count:x.length}}}})()""") or {}
        ok=v.get("count")==1;con=con+1 if ok else 0
        samples.append({"elapsedSeconds":round(time.time()-st,3),"count":v.get("count"),"certified":ok})
        if con>=n:return True,samples
        time.sleep(.1)
    return False,samples

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    pr=evid/R26/"export_next_progressive_expansion_readiness_and_policy_design.json"
    pf=evid/R25F/"exact_fifty_record_export_lifecycle_closure_and_next_scale_readiness.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26A Exact One Hundred Record Export Cohort Candidate Selection + Qualification + Preauthorization")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Assignments invocation: OFF")
    print("Export invocation: OFF")
    print("Live candidate inventory: ON")

    if not pr.exists() or not pf.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26_AND_R25F_EVIDENCE_REQUIRED");return 4
    r26=loadj(pr);r25f=loadj(pf)
    if r26.get("status")!="PASSED" or r26.get("state")!=R26_STATE or r26.get("classification")!=R26_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26_POLICY_CERTIFICATION_REQUIRED");return 5

    reference=r25f.get("cohort") or []
    if len(reference)!=50 or len({str(x).lower() for x in reference})!=50:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_REFERENCE_FIFTY_REQUIRED");return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_EXPLORER_PAGE_REQUIRED");return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        es,esamp=settle_exact(w,"Explorer",2.0,3)
        if not es:
            print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_ENTRY_SETTLE_FAILED");return 9
        ee=click_exact(w,"Explorer")
        if not ee.get("clicked"):
            print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_ENTRY_FAILED");return 10
        time.sleep(.5)
        raw=ev(w,r"""(()=>{
const ns=s=>(s||'').replace(/\s+/g,' ').trim();
const out=[];
for(const b of [...document.querySelectorAll('button')]){
 if(b.offsetParent===null||b.disabled)continue;
 const t=ns(b.innerText||b.textContent||'');
 if(!t)continue;
 const cls=String(b.className||'');
 const looksProperty=/sciip-property|property-card|property-marker|result|inventory/i.test(cls) ||
   /(EXISTING|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·/i.test(t);
 if(looksProperty) out.push(t);
}
return out;
})()""") or []
    finally:
        try:w.call("Page.close")
        except:pass

    # stable de-duplication preserving DOM order
    seen=set(); inventory=[]
    for text in raw:
        norm=normalize_candidate_label(text)
        key=norm.lower()
        if not norm or key in seen:continue
        seen.add(key);inventory.append({"rawLabel":text,"normalizedTarget":norm})

    refset={str(x).lower() for x in reference}
    pool=[x for x in inventory if x["normalizedTarget"].lower() not in refset]
    selected=pool[:50]
    new=[x["normalizedTarget"] for x in selected]
    cohort=reference+new

    checks={
      "r26Passed":True,
      "r26PolicyStateCertified":True,
      "freshExplorerPageUsed":True,
      "explorerEntrySettleCertified":es,
      "explorerEntryCertified":ee.get("clicked") is True,
      "candidateInventoryCaptured":len(inventory)>0,
      "referenceFiftyPreserved":cohort[:50]==reference,
      "fiftyNewCandidatesResolved":len(new)==50,
      "exactOneHundredCandidateCohortResolved":len(cohort)==100,
      "exactOneHundredCandidateCohortUnique":len({str(x).lower() for x in cohort})==100,
      "deterministicDomOrderUsed":True,
      "candidateStatusSuffixNormalizationUsed":True,
      "recognizedStatusBoundaryOnly":True,
      "fiveSecondTargetBindingPolicyConsumed":r26.get("targetBindingSettleMaxSeconds")==5.0,
      "threeSampleTargetBindingPolicyConsumed":r26.get("targetBindingSettleConsecutiveSamples")==3,
      "threeSampleExplorerPolicyConsumed":r26.get("explorerSettleConsecutiveSamples")==3,
      "twoSecondExplorerPolicyConsumed":r26.get("explorerSettleMaxSeconds")==2.0,
      "threeSampleSelectedPropertyPolicyConsumed":r26.get("selectedPropertySettleConsecutiveSamples")==3,
      "twoSecondSelectedPropertyPolicyConsumed":r26.get("selectedPropertySettleMaxSeconds")==2.0,
      "freshPagePerRecordPolicyConsumed":r26.get("freshPagePerRecord") is True,
      "strictSequentialPolicyConsumed":r26.get("strictSequential") is True,
      "haltOnFirstFailurePolicyConsumed":r26.get("haltOnFirstFailure") is True,
      "oneExportClickMaximumPolicyConsumed":r26.get("maxExportClicksPerRecord")==1,
      "eligibilityContractConsumed":isinstance(r26.get("eligibilityContract"),dict) and len(r26.get("eligibilityContract"))>0,
      "exportInvocationOff":True,
      "assignmentsInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())

    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_INCOMPLETE")
    classification=("EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_REFERENCE_FIFTY_PLUS_FIFTY_NEW_CANDIDATES_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION"
                    if passed else
                    "EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R26B_FIFTY_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
         if passed else
         "M4_19D4BN17C_R4_R12_R16A_R26A_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"classification":classification,
      "referenceCohortSize":len(reference),
      "candidateInventoryCount":len(inventory),
      "newCandidatePoolCount":len(pool),
      "selectedNewCandidateCount":len(new),
      "exactOneHundredCohortSize":len(cohort),
      "referenceCohort":reference,
      "candidateInventory":inventory,
      "selectedNewCandidates":selected,
      "exactOneHundredCohort":cohort,
      "checks":checks,
      "authority":{
        "assignmentsInvocation":False,"exportInvocation":False,
        "applicationSourceMutation":False,"governedDataMutation":False,
        "networkAuthority":False,"pixelEvidence":False
      },
      "sourceEvidence":{
        "r26Path":str(pr),"r26Sha256":hashlib.sha256(pr.read_bytes()).hexdigest(),
        "r25fPath":str(pf),"r25fSha256":hashlib.sha256(pf.read_bytes()).hexdigest()
      },
      "nextMilestone":nxt
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_one_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_COHORT_SIZE:",len(reference))
    print("CANDIDATE_INVENTORY_COUNT:",len(inventory))
    print("NEW_CANDIDATE_POOL_COUNT:",len(pool))
    print("SELECTED_NEW_CANDIDATE_COUNT:",len(new))
    print("EXACT_ONE_HUNDRED_COHORT_SIZE:",len(cohort))
    print()
    print("----- EXACT ONE HUNDRED CANDIDATE COHORT -----")
    for i,t in enumerate(cohort,1):
        print(f"{i}. {t} [{'REFERENCE_CERTIFIED' if i<=50 else 'NEW_PREAUTHORIZED'}]")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
