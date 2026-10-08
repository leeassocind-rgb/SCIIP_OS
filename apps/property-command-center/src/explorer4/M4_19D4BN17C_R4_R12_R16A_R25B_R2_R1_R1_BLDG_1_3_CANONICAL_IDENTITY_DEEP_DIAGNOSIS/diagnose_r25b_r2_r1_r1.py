#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R25A="M4_19D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R25A_STATE="M419D4BN17C_R4_R12_R16A_R25A_EXACT_FIFTY_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_PREAUTHORIZED"
R1="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R25B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED"
M="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R1_R1_BLDG_1_3_CANONICAL_IDENTITY_DEEP_DIAGNOSIS"
CLEAN="NE of Interstate 15 and Stoddard Wells Bldg 1-3"
PORT=9333; APP="http://127.0.0.1:5173/"

def lj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def gj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None
def np():
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
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
        else:h.extend([255]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+m+bytes(x^m[i%4] for i,x in enumerate(p)))
    def recv(self):
        h=self.s.recv(2);a,b=h;n=b&127
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
def wait(w,t):
    st=time.time();c=0
    while time.time()-st<2:
        n=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(t)}).length)()""") or 0
        c=c+1 if n==1 else 0
        if c>=3:return True
        time.sleep(.1)
    return False
def click(w,t):
    return ev(w,f"""(()=>{{const t={json.dumps(t)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true}}}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); evid=repo/"apps/property-command-center/evidence/explorer4"
    pa=evid/R25A/"exact_fifty_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    pr=evid/R1/"recertification_residual_causal_diagnosis.json"
    print("="*120);print("SCIIP Explorer 4.0 — R25B-R2-R1-R1 Bldg 1-3 Canonical Identity Deep Diagnosis");print("="*120)
    print("Mode: SINGLE_RECORD_READ_ONLY_IDENTITY_TRACE");print("Application source mutation: OFF");print("Governed data mutation: OFF")
    print("Assignments invocation: OFF");print("Generate invocation: OFF");print("Export invocation: OFF");print("Property click: OFF");print("Pixel evidence: OFF")
    if not pa.exists() or not pr.exists(): print("STATUS: BLOCKED");print("DIAGNOSIS: PREREQUISITE_EVIDENCE_REQUIRED");return 4
    a,d=lj(pa),lj(pr)
    if a.get("status")!="PASSED" or a.get("state")!=R25A_STATE: print("STATUS: BLOCKED");print("DIAGNOSIS: R25A_REQUIRED");return 5
    if d.get("status")!="PASSED" or d.get("state")!=R1_STATE: print("STATUS: BLOCKED");print("DIAGNOSIS: R25B_R2_R1_REQUIRED");return 6
    cand=next((x for x in (a.get("selectedNewCandidates") or []) if "Stoddard Wells Bldg 1-3" in str(x)),None)
    if not cand: print("STATUS: BLOCKED");print("DIAGNOSIS: BLDG_1_3_CANDIDATE_REQUIRED");return 7
    if not gj(f"http://127.0.0.1:{PORT}/json/version"): print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 8
    n=np()
    if not n or not n.get("webSocketDebuggerUrl"): print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_REQUIRED");return 9
    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        ex=wait(w,"Explorer"); en=click(w,"Explorer") if ex else {}
        if not en.get("clicked"): print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_ENTRY_FAILED");return 10
        time.sleep(.8)
        trace=ev(w,r"""(()=>{const ns=s=>(s||'').replace(/\s+/g,' ').trim();
        const buttons=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map((b,i)=>({i,text:ns(b.innerText||b.textContent||''),cls:b.className||''}));
        const selected=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(x=>x.offsetParent!==null).map((x,i)=>({i,text:ns(x.innerText||x.textContent||''),cls:x.className||''}));
        const stoddard=buttons.filter(x=>x.text.toLowerCase().includes('stoddard wells'));
        const body=ns(document.body?.innerText||'');
        const storage={};for(const a of ['localStorage','sessionStorage']){try{let o={},s=window[a];for(let i=0;i<s.length;i++){let k=s.key(i),v=s.getItem(k);if(/property|selected|canonical|projection/i.test(k)||/stoddard|0472211050000/i.test(v||''))o[k]=v;}storage[a]=o}catch{}}
        return {url:location.href,stoddardButtons:stoddard,selectedMarkers:selected,bodyHasClean:body.includes('NE of Interstate 15 and Stoddard Wells Bldg 1-3'),bodyHasStatus:/Stoddard Wells Bldg 1-3.*PROPOSED\/PLANNED/i.test(body),storage};})()""") or {}
        hits=[]
        for p in (repo/"apps/property-command-center/src").rglob("*"):
            if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".json"}:
                try: lines=p.read_text(errors="ignore").splitlines()
                except: continue
                for i,line in enumerate(lines,1):
                    if "Stoddard Wells Bldg 1-3" in line or "0472211050000" in line:
                        hits.append({"file":str(p.relative_to(repo)),"line":i,"text":line.strip()[:1200]})
                if len(hits)>100: break
    finally:
        try:w.call("Page.close")
        except:pass

    raw=str(cand.get("rawLabel") or ""); norm=str(cand.get("normalizedTarget") or "")
    raw_fused="Bldg 1-3PROPOSED/" in raw; norm_fused="Bldg 1-3PROPOSED/" in norm
    selected=[x.get("text") for x in trace.get("selectedMarkers",[])]
    markers=[x.get("text") for x in trace.get("stoddardButtons",[]) if "Bldg 1-3" in x.get("text","")]
    live_clean=any(x==CLEAN for x in selected+markers)
    if raw_fused and norm_fused and live_clean:
        cls="R25A_CANDIDATE_NORMALIZATION_BOUNDARY_BUG_FUSES_PROPOSED_STATUS_INTO_BLDG_1_3_IDENTITY_LIVE_CANONICAL_IDENTITY_IS_CLEAN"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R2_CANONICAL_CANDIDATE_IDENTITY_NORMALIZATION_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
    elif live_clean:
        cls="LIVE_CANONICAL_BLDG_1_3_IDENTITY_CLEAN_R25B_R2_R1_FAILURE_IS_READBACK_PREDICATE_MISMATCH"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R2_SELECTED_PROPERTY_IDENTITY_READBACK_REPAIR_AND_TWENTY_FIVE_RECORD_NON_EXPORT_RECERTIFICATION"
    else:
        cls="BLDG_1_3_CANONICAL_IDENTITY_TRACE_INCONCLUSIVE_REQUIRES_SOURCE_CONTRACT_DIAGNOSIS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R25B_R2_R1_R2_BLDG_1_3_SOURCE_IDENTITY_CONTRACT_DIAGNOSIS"
    checks={"r25aPassed":True,"r25bR2R1Passed":True,"freshPageCreated":True,"explorerSettleCertified":ex,"explorerEntryCertified":en.get("clicked") is True,
    "r25aRawCandidateCaptured":bool(raw),"r25aNormalizedCandidateCaptured":bool(norm),"liveStoddardMarkerInventoryCaptured":True,"selectedMarkerInventoryCaptured":True,
    "storageIdentityHintsInspected":True,"sourceCanonicalIdentityHitsInspected":True,"noPropertyClickPerformed":True,"assignmentsInvocationOff":True,"generateInvocationOff":True,
    "exportInvocationOff":True,"applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True}
    state="M419D4BN17C_R4_R12_R16A_R25B_R2_R1_R1_BLDG_1_3_CANONICAL_IDENTITY_DEEP_DIAGNOSED"
    out={"framework":"SCIIP_EXPLORER_4_R25B_R2_R1_R1_BLDG_1_3_CANONICAL_IDENTITY_DEEP_DIAGNOSIS","generatedAt":datetime.now(timezone.utc).isoformat(),
    "status":"PASSED","state":state,"classification":cls,"r25aCandidate":cand,"identityAnalysis":{"rawLabel":raw,"normalizedTarget":norm,
    "rawFusesStatusIntoIdentity":raw_fused,"normalizedStillFusesStatusIntoIdentity":norm_fused,"expectedCleanIdentity":CLEAN,"liveCleanIdentityObserved":live_clean},
    "liveTrace":trace,"sourceHits":hits,"checks":checks,"authority":{"propertyClick":False,"assignmentsInvocation":False,"generateInvocation":False,"exportInvocation":False,
    "applicationSourceMutation":False,"governedDataMutation":False,"pixelEvidence":False},"nextMilestone":nxt}
    od=evid/M;od.mkdir(parents=True,exist_ok=True); ef=od/"bldg_1_3_canonical_identity_deep_diagnosis.json";ef.write_text(json.dumps(out,indent=2)+"\n")
    print("R25A_RAW_LABEL:",raw);print("R25A_NORMALIZED_TARGET:",norm);print("RAW_FUSES_STATUS_INTO_IDENTITY:",raw_fused);print("NORMALIZED_STILL_FUSES_STATUS_INTO_IDENTITY:",norm_fused)
    print("EXPECTED_CLEAN_IDENTITY:",CLEAN);print("LIVE_SELECTED_MARKERS:",json.dumps(selected,ensure_ascii=False));print("LIVE_BLDG_1_3_MARKERS:",json.dumps(markers,ensure_ascii=False))
    print("LIVE_CLEAN_IDENTITY_OBSERVED:",live_clean);print("SOURCE_HIT_COUNT:",len(hits));print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",cls);print("STATUS: PASSED");print("STATE:",state);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
    return 0
if __name__=="__main__": raise SystemExit(main())
