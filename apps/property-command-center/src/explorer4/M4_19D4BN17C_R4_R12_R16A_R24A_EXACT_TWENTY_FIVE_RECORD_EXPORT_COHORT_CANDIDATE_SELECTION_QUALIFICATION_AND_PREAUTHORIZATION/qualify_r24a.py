#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R24="M4_19D4BN17C_R4_R12_R16A_R24_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
R24_STATE="M419D4BN17C_R4_R12_R16A_R24_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_CERTIFIED"
M="M4_19D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"

PORT=9333
APP="http://127.0.0.1:5173/"

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
        if not m: raise RuntimeError("bad websocket")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("websocket handshake failed")
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

def count_exact_button(w,text):
    return ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0

def wait_unique_exact_button(w,text,max_seconds=2.0,required_consecutive=3):
    start=time.time();samples=[];consecutive=0
    while time.time()-start<=max_seconds:
        c=count_exact_button(w,text)
        ok=(c==1)
        samples.append({"elapsedSeconds":round(time.time()-start,3),"count":c,"certified":ok})
        consecutive=consecutive+1 if ok else 0
        if consecutive>=required_consecutive:
            return {"certified":True,"samples":samples,"consecutiveCertifiedSamples":consecutive}
        time.sleep(.1)
    return {"certified":False,"samples":samples,"consecutiveCertifiedSamples":consecutive}

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length,reason:'EXACT_CONTROL_NOT_UNIQUE'}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def inventory(w):
    return ev(w,r"""(()=> {
      const normalize=s=>(s||'').replace(/\s+/g,' ').trim();
      const buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled);
      const candidates=[];
      for(const b of buttons){
        const txt=normalize(b.innerText||b.textContent||'');
        if(!txt)continue;
        if(/^(Explorer|Assignments|Generate Client Listing Report|Download Client Listing Report)$/i.test(txt))continue;
        const m=txt.match(/^(.+?)(?:EXISTING|AVAILABLE|PLANNED|UNDER CONSTRUCTION|LEASED|SOLD|\d[\d,]*\s*SF)/i);
        const label=normalize(m?m[1]:txt);
        const addressish=/\d/.test(label) && /\b(Ave|Avenue|Rd|Road|St|Street|Blvd|Boulevard|Dr|Drive|Way|Ln|Lane|Ct|Court|Pkwy|Parkway|Pl|Place|Hwy|Highway|Musick|Portfolio)\b/i.test(label);
        const markerish=b.classList.contains('sciip-property-marker') || b.closest('.sciip-property-card,.property-card,[data-property-id]');
        if(addressish || markerish){
          candidates.push({label,fullText:txt,className:b.className||'',domIndex:buttons.indexOf(b)});
        }
      }
      const seen=new Set(),dedup=[];
      for(const c of candidates){
        const k=c.label.toLowerCase();
        if(seen.has(k))continue;
        seen.add(k);dedup.push(c);
      }
      return {buttonCount:buttons.length,candidates:dedup};
    })()""") or {"buttonCount":0,"candidates":[]}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"
    p=evid/R24/"export_next_progressive_expansion_readiness_and_policy_design.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24A Exact Twenty-Five Record Export Cohort Candidate Selection + Preauthorization")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Assignments invocation: OFF")
    print("Export invocation: OFF")
    print("Live candidate inventory: ON")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R24_POLICY_EVIDENCE_REQUIRED");return 4
    r=loadj(p)
    if r.get("status")!="PASSED" or r.get("state")!=R24_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R24_POLICY_CERTIFICATION_REQUIRED");return 5

    reference=r.get("referenceCohort") or []
    if len(reference)!=10:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXACT_TEN_REFERENCE_COHORT_REQUIRED");return 6
    if r.get("nextCohortSize")!=25 or r.get("newLiveExpansionRecordsRequired")!=15:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R24_EXACT_TWENTY_FIVE_POLICY_REQUIRED");return 7
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 8

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_EXPLORER_PAGE_REQUIRED");return 9

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    explorer=wait_unique_exact_button(w,"Explorer",2.0,3)
    entry=click_exact(w,"Explorer") if explorer.get("certified") else {"clicked":False}
    time.sleep(.75)
    inv=inventory(w) if entry.get("clicked") else {"buttonCount":0,"candidates":[]}
    try:w.call("Page.close")
    except:pass

    refkeys={x.lower() for x in reference}
    pool=[c for c in inv.get("candidates",[]) if c.get("label","").lower() not in refkeys]
    selected=pool[:15]
    selected_labels=[x["label"] for x in selected]
    exact25=reference+selected_labels

    checks={
        "r24Passed":True,
        "r24PolicyStateCertified":True,
        "freshExplorerPageUsed":True,
        "explorerEntrySettleCertified":explorer.get("certified") is True,
        "explorerEntryCertified":entry.get("clicked") is True,
        "candidateInventoryCaptured":len(inv.get("candidates",[]))>0,
        "referenceTenPreserved":len(reference)==10 and exact25[:10]==reference,
        "fifteenNewCandidatesResolved":len(selected_labels)==15,
        "exactTwentyFiveCandidateCohortResolved":len(exact25)==25,
        "exactTwentyFiveCandidateCohortUnique":len({x.lower() for x in exact25})==25,
        "deterministicDomOrderUsed":True,
        "fiveSecondTargetBindingPolicyConsumed":(r.get("eligibilityContract") or {}).get("targetBindingSettleMaximumSeconds")==5.0,
        "threeSampleTargetBindingPolicyConsumed":(r.get("eligibilityContract") or {}).get("targetBindingSettleConsecutiveSamples")==3,
        "freshPagePerRecordPolicyConsumed":(r.get("executionPolicy") or {}).get("freshPagePerRecord") is True,
        "strictSequentialPolicyConsumed":(r.get("executionPolicy") or {}).get("strictSequential") is True,
        "haltOnFirstFailurePolicyConsumed":(r.get("executionPolicy") or {}).get("haltOnFirstFailure") is True,
        "oneExportClickMaximumPolicyConsumed":(r.get("executionPolicy") or {}).get("maximumExportClicksPerRecord")==1,
        "eligibilityContractConsumed":bool(r.get("eligibilityContract")),
        "exportInvocationOff":True,
        "assignmentsInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    passed=all(checks.values())
    state=("M419D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_INCOMPLETE")
    classification=("EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_REFERENCE_TEN_PLUS_FIFTEEN_NEW_CANDIDATES_PREAUTHORIZED_FOR_NON_EXPORT_QUALIFICATION"
                    if passed else
                    "EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_GAP_REMAINS")
    nextm=("M4_19D4BN17C_R4_R12_R16A_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
           if passed else
           "M4_19D4BN17C_R4_R12_R16A_R24A_R1_CANDIDATE_SELECTION_RESIDUAL_DIAGNOSIS")

    out={
        "framework":"SCIIP_EXPLORER_4_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
        "state":state,
        "classification":classification,
        "sourceEvidence":{"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
        "referenceCohort":reference,
        "candidateInventoryCount":len(inv.get("candidates",[])),
        "candidateInventory":inv.get("candidates",[]),
        "newCandidatePoolCount":len(pool),
        "selectedNewCandidates":selected,
        "exactTwentyFiveCandidateCohort":exact25,
        "selectionPolicy":{
            "source":"LIVE_EXPLORER_VISIBLE_ACTIONABLE_PROPERTY_CONTROLS",
            "ordering":"DETERMINISTIC_DOM_ORDER",
            "referenceRecordsExcludedFromNewPool":True,
            "newCandidateCountRequired":15
        },
        "checks":checks,
        "authority":{
            "assignmentsInvocation":False,
            "exportInvocation":False,
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False
        },
        "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_twenty_five_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print()
    print("REFERENCE_COHORT_SIZE:",len(reference))
    print("CANDIDATE_INVENTORY_COUNT:",len(inv.get("candidates",[])))
    print("NEW_CANDIDATE_POOL_COUNT:",len(pool))
    print("SELECTED_NEW_CANDIDATE_COUNT:",len(selected_labels))
    print("EXACT_TWENTY_FIVE_COHORT_SIZE:",len(exact25))
    print()
    print("----- EXACT TWENTY-FIVE CANDIDATE COHORT -----")
    for i,x in enumerate(exact25,1):
        status="REFERENCE_CERTIFIED" if i<=10 else "NEW_PREAUTHORIZED"
        print(f"{i}. {x} [{status}]")
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",out["status"])
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0 if passed else 9

if __name__=="__main__":
    raise SystemExit(main())
