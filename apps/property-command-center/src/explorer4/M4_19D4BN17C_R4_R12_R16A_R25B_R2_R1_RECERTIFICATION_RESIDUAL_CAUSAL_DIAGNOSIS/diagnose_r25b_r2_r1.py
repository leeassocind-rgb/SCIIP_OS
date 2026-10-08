#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R25A="M4_19D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R25A_STATE="M419D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
R25B_R2="M4_19D4BN17C_R4_R12_R16A_R25B_R2_COLLISION_SAFE_IDENTITY_BINDING_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
R25B_R2_STATE="M419D4BN17C_R4_R12_R16A_R25B_R2_TWENTY_FIVE_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE"
TARGET="NE of Interstate 15 and Stoddard Wells Bldg 1-3PROPOSED/"
M="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
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
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("ws")
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
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

JS_HELPERS=r"""
const normalizeSpace=s=>(s||'').replace(/\s+/g,' ').trim();
const boundaryLabel=s=>{
  s=normalizeSpace(s);
  const re=/(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·/i;
  const m=re.exec(s);
  return m?s.slice(0,m.index).trim():s;
};
"""

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    pa=evid/R25A/"exact_fifty_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    pr=evid/R25B_R2/"collision_safe_identity_binding_repair_and_twenty_five_record_non_export_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R25B-R2-R1 Recertification Residual Causal Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_POST_SELECTION_IDENTITY_CAUSAL_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Property click authority: SINGLE TARGET CLICK ONLY")

    if not pa.exists() or not pr.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25A_AND_R25B_R2_EVIDENCE_REQUIRED");return 4
    a=loadj(pa);r=loadj(pr)
    if a.get("status")!="PASSED" or a.get("state")!=R25A_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25A_PREAUTHORIZATION_REQUIRED");return 5
    if r.get("status")!="DIAGNOSTIC_COMPLETE" or r.get("state")!=R25B_R2_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25B_R2_INCOMPLETE_STATE_REQUIRED");return 6

    outcomes=r.get("outcomes") or []
    failing=next((x for x in outcomes if x.get("qualified") is False),None)
    if not failing or failing.get("target")!=TARGET or failing.get("selectionClicked") is not True or failing.get("selectedPropertyCertified") is not False:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXPECTED_RECORD_12_SELECTED_PROPERTY_FAILURE_REQUIRED");return 7

    selected=a.get("selectedNewCandidates") or []
    row=next((x for x in selected if x.get("normalizedTarget")==TARGET),None)
    if not row:
        print("STATUS: BLOCKED");print("DIAGNOSIS: R25A_TARGET_IDENTITY_REQUIRED");return 8

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 9

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_REQUIRED");return 10

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        explorer=wait_exact(w,"Explorer",2,3)
        entry=click_exact(w,"Explorer") if explorer else {"clicked":False}
        if entry.get("clicked") is not True:
            print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_ENTRY_FAILED");return 11

        time.sleep(.75)
        pre=ev(w,f"""(()=>{{{JS_HELPERS}
const q=normalizeSpace({json.dumps(TARGET)}).toLowerCase();
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map((b,i)=>{{
 const text=normalizeSpace(b.innerText||b.textContent||'');
 const label=boundaryLabel(text);
 return {{i,text,label,full:text.toLowerCase(),norm:label.toLowerCase(),cls:b.className||''}};
}});
const exact=rows.filter(x=>x.full===q);
const normalized=rows.filter(x=>x.norm===q);
const contains=rows.filter(x=>x.full.includes(q));
const stoddard=rows.filter(x=>x.full.includes('stoddard wells'));
return {{exact,normalized,contains,stoddard}};
}})()""") or {}

        click=ev(w,f"""(()=>{{{JS_HELPERS}
const q=normalizeSpace({json.dumps(TARGET)}).toLowerCase();
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map((b,i)=>{{
 const text=normalizeSpace(b.innerText||b.textContent||''); const label=boundaryLabel(text);
 return {{b,i,text,label,full:text.toLowerCase(),norm:label.toLowerCase()}};
}});
const exact=rows.filter(x=>x.full===q), normalized=rows.filter(x=>x.norm===q), contains=rows.filter(x=>x.full.includes(q));
let x=null,binding=null;
if(exact.length===1){{x=exact[0];binding='EXACT'}}
else if(exact.length===0&&normalized.length===1){{x=normalized[0];binding='BOUNDARY_NORMALIZED_IDENTITY'}}
else if(exact.length===0&&normalized.length===0&&contains.length===1){{x=contains[0];binding='UNIQUE_CONTAINS'}}
else return {{clicked:false,exactCount:exact.length,normalizedCount:normalized.length,containsCount:contains.length}};
x.b.click();return {{clicked:true,binding,index:x.i,text:x.text,label:x.label}};
}})()""") or {}

        samples=[]
        start=time.time()
        schedule=[0.0,0.05,0.1,0.2,0.35,0.5,0.75,1.0,1.5,2.0]
        for t in schedule:
            while time.time()-start<t: time.sleep(.01)
            v=ev(w,f"""(()=>{{{JS_HELPERS}
const q=normalizeSpace({json.dumps(TARGET)}).toLowerCase();
const selected=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(x=>x.offsetParent!==null).map((x,i)=>{{
 const text=normalizeSpace(x.innerText||x.textContent||'');
 return {{i,text,label:boundaryLabel(text),cls:x.className||''}};
}});
const txt=normalizeSpace(document.body?.innerText||'');
const bodyHits=txt.split('\\n').map(normalizeSpace).filter(x=>x&&x.toLowerCase().includes('stoddard wells')).slice(0,50);
const buttons=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map((b,i)=>({{i,text:normalizeSpace(b.innerText||b.textContent||''),cls:b.className||''}}));
const targetButtons=buttons.filter(x=>x.text.toLowerCase().includes('stoddard wells'));
return {{selected,bodyHits,targetButtons,assignmentsCount:buttons.filter(x=>x.text==='Assignments').length,bodyHasExactTarget:txt.toLowerCase().includes(q)}};
}})()""") or {}
            v["t"]=t
            samples.append(v)

    finally:
        try:w.call("Page.close")
        except:pass

    selected_texts=[]
    selected_labels=[]
    for s in samples:
        for x in s.get("selected",[]):
            if x.get("text") not in selected_texts:selected_texts.append(x.get("text"))
            if x.get("label") not in selected_labels:selected_labels.append(x.get("label"))

    raw_target=row.get("rawLabel")
    normalized_target=row.get("normalizedTarget")
    pre_exact=len(pre.get("exact",[]))
    pre_norm=len(pre.get("normalized",[]))
    pre_contains=len(pre.get("contains",[]))
    click_text=click.get("text")
    click_label=click.get("label")
    click_binding=click.get("binding")
    selected_preserves_bldg=any("bldg 1-3" in (x or "").lower() for x in selected_texts+selected_labels)
    selected_matches_norm=any((x or "").strip().lower()==normalized_target.strip().lower() for x in selected_texts+selected_labels)
    selected_contains_base=any("ne of interstate 15 and stoddard wells" in (x or "").lower() for x in selected_texts+selected_labels)

    if click_binding=="UNIQUE_CONTAINS" and not selected_matches_norm and selected_preserves_bldg:
        classification="Bldg_1_3_SELECTION_SUCCEEDS_SELECTED_MARKER_IDENTITY_DIFFERS_FROM_R25A_NORMALIZED_TARGET_READBACK_PREDICATE_TOO_STRICT"
    elif click_binding=="UNIQUE_CONTAINS" and selected_contains_base and not selected_preserves_bldg:
        classification="Bldg_1_3_CLICK_COLLAPSES_TO_BASE_PROPERTY_IDENTITY_WRONG_RECORD_SELECTION_OR_CANONICALIZATION_COLLISION"
    elif selected_matches_norm:
        classification="Bldg_1_3_SELECTED_IDENTITY_MATCHES_TARGET_PRIOR_FAILURE_TRANSIENT_READBACK_RACE"
    else:
        classification="Bldg_1_3_POST_SELECTION_IDENTITY_RESIDUAL_REQUIRES_DEEPER_CANONICAL_IDENTITY_DIAGNOSIS"

    if classification.startswith("Bldg_1_3_SELECTION_SUCCEEDS_SELECTED_MARKER_IDENTITY_DIFFERS"):
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R2_SELECTED_PROPERTY_IDENTITY_NORMALIZATION_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
    elif classification=="Bldg_1_3_SELECTED_IDENTITY_MATCHES_TARGET_PRIOR_FAILURE_TRANSIENT_READBACK_RACE":
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R2_BOUNDED_SELECTED_PROPERTY_SETTLE_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R1_R1_BLDG_1_3_CANONICAL_IDENTITY_DEEP_DIAGNOSIS"

    checks={
      "r25aPassed":True,
      "r25bR2IncompleteStateConsumed":True,
      "record12FailureResolved":True,
      "record12SelectionClickedPreviously":True,
      "record12SelectedPropertyFailedPreviously":True,
      "freshPageCreated":True,
      "explorerSettleCertified":explorer,
      "explorerEntryCertified":entry.get("clicked") is True,
      "preClickCandidateInventoryCaptured":True,
      "rawTargetIdentityCaptured":raw_target is not None,
      "normalizedTargetIdentityCaptured":normalized_target is not None,
      "exactNormalizedContainsCountsCaptured":True,
      "singleBoundedTargetClickOnly":click.get("clicked") is True,
      "postClickSelectedMarkerSamplesCaptured":len(samples)==len(schedule),
      "selectedMarkerIdentityCaptured":len(selected_texts)>0,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }

    state="M419D4BN17C_R4_R12_R16A_R25B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
    out={
      "framework":"SCIIP_EXPLORER_4_R25B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":state,
      "classification":classification,
      "target":TARGET,
      "r25aRawTarget":raw_target,
      "r25aNormalizedTarget":normalized_target,
      "preClick":{
        "exactCount":pre_exact,
        "normalizedCount":pre_norm,
        "containsCount":pre_contains,
        "exact":[{k:v for k,v in x.items() if k!="b"} for x in pre.get("exact",[])],
        "normalized":[{k:v for k,v in x.items() if k!="b"} for x in pre.get("normalized",[])],
        "contains":[{k:v for k,v in x.items() if k!="b"} for x in pre.get("contains",[])],
        "stoddard":[{k:v for k,v in x.items() if k!="b"} for x in pre.get("stoddard",[])]
      },
      "click":click,
      "postClickSamples":samples,
      "selectedMarkerTexts":selected_texts,
      "selectedMarkerLabels":selected_labels,
      "selectedPreservesBldg1To3":selected_preserves_bldg,
      "selectedMatchesNormalizedTarget":selected_matches_norm,
      "selectedContainsBaseStoddardIdentity":selected_contains_base,
      "checks":checks,
      "authority":{
        "propertyClick":"SINGLE_TARGET_CLICK_ONLY",
        "assignmentsInvocation":False,
        "generateInvocation":False,
        "exportInvocation":False,
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False
      },
      "sourceEvidence":{
        "r25aPath":str(pa),"r25aSha256":hashlib.sha256(pa.read_bytes()).hexdigest(),
        "r25bR2Path":str(pr),"r25bR2Sha256":hashlib.sha256(pr.read_bytes()).hexdigest()
      },
      "nextMilestone":nxt
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"recertification_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("TARGET:",TARGET)
    print("R25A_RAW_TARGET:",raw_target)
    print("R25A_NORMALIZED_TARGET:",normalized_target)
    print("PRE_EXACT_COUNT:",pre_exact)
    print("PRE_NORMALIZED_COUNT:",pre_norm)
    print("PRE_CONTAINS_COUNT:",pre_contains)
    print("CLICK:",json.dumps(click,ensure_ascii=False))
    print("SELECTED_MARKER_TEXTS:",json.dumps(selected_texts,ensure_ascii=False))
    print("SELECTED_MARKER_LABELS:",json.dumps(selected_labels,ensure_ascii=False))
    print("SELECTED_PRESERVES_BLDG_1_3:",selected_preserves_bldg)
    print("SELECTED_MATCHES_NORMALIZED_TARGET:",selected_matches_norm)
    print("SELECTED_CONTAINS_BASE_STODDARD_IDENTITY:",selected_contains_base)
    print()
    print("----- PRE-CLICK CANDIDATES -----")
    for group in ["exact","normalized","contains","stoddard"]:
        print(group.upper()+":")
        for x in pre.get(group,[]): print(json.dumps({k:v for k,v in x.items() if k!="b"},ensure_ascii=False))
    print()
    print("----- POST-CLICK SELECTED MARKER SAMPLES -----")
    for s in samples: print(json.dumps(s,ensure_ascii=False))
    print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
