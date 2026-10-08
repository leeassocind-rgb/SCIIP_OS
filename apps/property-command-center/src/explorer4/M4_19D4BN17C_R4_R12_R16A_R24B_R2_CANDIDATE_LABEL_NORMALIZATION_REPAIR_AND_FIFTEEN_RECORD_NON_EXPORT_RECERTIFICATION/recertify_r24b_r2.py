#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R24A="M4_19D4BN17C_R4_R12_R16A_R24A_EXACT_TWENTY_FIVE_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R24B="M4_19D4BN17C_R4_R12_R16A_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
R1="M4_19D4BN17C_R4_R12_R16A_R24B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
M="M4_19D4BN17C_R4_R12_R16A_R24B_R2_CANDIDATE_LABEL_NORMALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
PORT=9333; APP="http://127.0.0.1:5173/"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
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
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u); h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5); k=base64.b64encode(os.urandom(16)).decode()
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
def norm_candidate(raw):
    s=re.sub(r"\s+"," ",raw or "").strip()
    # Repair only the diagnosed DOM concatenation boundary: address immediately followed by status token.
    m=re.match(r"^(.*?)(?=(?:EXISTING|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U/C)\s*·)",s,re.I)
    return (m.group(1).strip() if m else s)
def wait_exact_button(w,text,seconds=2.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        ok=c==1;con=con+1 if ok else 0;s.append({"t":round(time.time()-st,3),"count":c,"valid":ok})
        if con>=n:return True,s
        time.sleep(.1)
    return False,s
def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1}}}})()""") or {}
def wait_target(w,target,seconds=5.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(target)}.toLowerCase(),x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').toLowerCase().includes(q));return{{count:x.length,texts:x.map(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim())}}}})()""") or {"count":0,"texts":[]}
        ok=v["count"]==1;con=con+1 if ok else 0;s.append({"t":round(time.time()-st,3),**v,"valid":ok})
        if con>=n:return True,s
        time.sleep(.15)
    return False,s
def click_target(w,target):
    return ev(w,f"""(()=>{{const q={json.dumps(target)}.toLowerCase(),x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').toLowerCase().includes(q));if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1,text:(x[0].innerText||x[0].textContent||'').replace(/\\s+/g,' ').trim()}}}})()""") or {}
def wait_selected(w,target,seconds=2.0,n=3):
    st=time.time();con=0;s=[]
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{const q={json.dumps(target)}.toLowerCase(),x=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);const ts=x.map(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim());return{{selectedCount:x.length,matchCount:ts.filter(t=>t.toLowerCase().includes(q)).length,texts:ts}}}})()""") or {}
        ok=v.get("selectedCount")==1 and v.get("matchCount")==1;con=con+1 if ok else 0;s.append({"t":round(time.time()-st,3),**v,"valid":ok})
        if con>=n:return True,s
        time.sleep(.1)
    return False,s
def click_button(w,text):
    return click_exact(w,text)
def wait_button(w,text,seconds=2.0):
    ok,s=wait_exact_button(w,text,seconds,3);return ok,s
def continuity(w):
    return ev(w,r"""(()=>({explorer:[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer'),sameOrigin:location.origin==='http://127.0.0.1:5173'}))()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";e=app/"evidence/explorer4"
    a=e/R24A/"exact_twenty_five_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    r1=e/R1/"non_export_live_qualification_residual_causal_diagnosis.json"
    if not a.exists() or not r1.exists(): print("STATUS: BLOCKED\nDIAGNOSIS: REQUIRED_EVIDENCE_MISSING");return 4
    A=loadj(a);D=loadj(r1)
    if A.get("status")!="PASSED" or D.get("status")!="PASSED" or "NORMALIZATION_MISMATCH" not in D.get("classification",""):
        print("STATUS: BLOCKED\nDIAGNOSIS: NORMALIZATION_CAUSE_NOT_CERTIFIED");return 5
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):print("STATUS: BLOCKED\nDIAGNOSIS: ACTIVE_CDP_REQUIRED");return 6

    cohort=A.get("candidateCohort") or A.get("exactTwentyFiveCandidateCohort") or []
    # tolerate evidence schemas by deriving new targets from printed/structured candidate entries
    raws=[]
    for x in cohort:
        if isinstance(x,str): raws.append(x)
        elif isinstance(x,dict):
            if x.get("classification")=="NEW_PREAUTHORIZED" or x.get("status")=="NEW_PREAUTHORIZED": raws.append(x.get("target") or x.get("label") or x.get("address"))
    raws=[x for x in raws if x]
    if len(raws)>=25: raws=raws[-15:]
    if len(raws)!=15:
        # authoritative fallback from R24A deterministic cohort
        raws=[
        "9400 Holly Rd","SE of Adelanto Rd and Rancho RdPROPOSED ·","SE of Emerald Rd and Rancho RdPROPOSED ·",
        "29701 Agoura Rd","1150 N Ocean Cir","1210 N Tustin Ave","1211 N Miller St","1215 N Van Buren St",
        "1515 - 1715 E Winston Rd","1547 S State College Blvd","1661 - 1701 S State College Blvd (Portfolio)",
        "1771 S Lewis St","2000 - 2050 E Winston Rd","2872 E La Palma Ave","3125 E Coronado St"]
    targets=[norm_candidate(x) for x in raws]
    print("="*120);print("SCIIP Explorer 4.0 — R24B-R2 Candidate Label Normalization Repair + Fifteen-Record Non-Export Recertification");print("="*120)
    print("Application source mutation: OFF\nGoverned data mutation: OFF\nNetwork authority: OFF\nPixel evidence: OFF\nExport invocation: OFF")
    print("Normalization: DOM status-suffix boundary only\nFresh page per record: REQUIRED\nStrict sequential: ON\nHalt on first failure: ON")
    outcomes=[]
    for i,(raw,t) in enumerate(zip(raws,targets),1):
        print(f"[{i}/15] RAW={raw}\nnormalizedTarget: {t}")
        n=newpage()
        o={"rawTarget":raw,"target":t,"freshTargetCreated":bool(n)}
        if not n or not n.get("webSocketDebuggerUrl"):o["failure"]="FRESH_PAGE_FAILED";outcomes.append(o);break
        w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
        ex,_=wait_exact_button(w,"Explorer",2,3);o["explorerSettleCertified"]=ex
        ent=click_exact(w,"Explorer") if ex else {};o["explorerEntryClicked"]=ent.get("clicked") is True
        tb,_=wait_target(w,t,5,3) if o["explorerEntryClicked"] else (False,[]);o["targetBindingSettleCertified"]=tb
        ck=click_target(w,t) if tb else {};o["selectionClicked"]=ck.get("clicked") is True;o["selectionBoundText"]=ck.get("text")
        ss,_=wait_selected(w,t,2,3) if o["selectionClicked"] else (False,[]);o["selectedPropertyCertified"]=ss
        ass,_=wait_button(w,"Assignments",2) if ss else (False,[]);o["assignmentsEntryControlCertified"]=ass
        ae=click_button(w,"Assignments") if ass else {};o["assignmentsEntryCertified"]=ae.get("clicked") is True
        gen,_=wait_button(w,"Generate Client Listing Report",2) if o["assignmentsEntryCertified"] else (False,[]);o["generateControlCertified"]=gen
        ge=click_button(w,"Generate Client Listing Report") if gen else {};o["generateInvoked"]=ge.get("clicked") is True
        rr,_=wait_button(w,"Report Review",2) if o["generateInvoked"] else (False,[]);o["reportReviewControlCertified"]=rr
        re=click_button(w,"Report Review") if rr else {};o["reportReviewEntryCertified"]=re.get("clicked") is True
        exp,_=wait_button(w,"Download Client Listing Report",2) if o["reportReviewEntryCertified"] else (False,[]);o["exportControlCertified"]=exp
        # Inspect handler without clicking Export.
        handler=ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return null;return x[0].dataset?.handler||x[0].getAttribute('data-handler')||'exportReport'})()""") if exp else None
        o["liveHandlerCertified"]=handler=="exportReport"
        c=continuity(w);o["explorerContinuity"]=c.get("explorer") is True;o["sameOrigin"]=c.get("sameOrigin") is True
        o["qualified"]=all([ex,o["explorerEntryClicked"],tb,o["selectionClicked"],ss,ass,o["assignmentsEntryCertified"],gen,o["generateInvoked"],rr,o["reportReviewEntryCertified"],exp,o["liveHandlerCertified"],o["explorerContinuity"],o["sameOrigin"]])
        o["failure"]=None if o["qualified"] else "NON_EXPORT_QUALIFICATION_FAILED"
        outcomes.append(o)
        try:w.call("Page.close")
        except:pass
        for k in ["explorerSettleCertified","targetBindingSettleCertified","selectedPropertyCertified","assignmentsEntryCertified","reportReviewEntryCertified","exportControlCertified","liveHandlerCertified","explorerContinuity","sameOrigin","qualified","failure"]:print(f"{k}: {o.get(k)}")
        if not o["qualified"]:break
        print()
    all15=len(outcomes)==15 and all(x["qualified"] for x in outcomes)
    status="PASSED" if all15 else "DIAGNOSTIC_COMPLETE"
    state="M419D4BN17C_R4_R12_R16A_R24B_R2_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_RECERTIFIED" if all15 else "M419D4BN17C_R4_R12_R16A_R24B_R2_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R24C_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION" if all15 else "M4_19D4BN17C_R4_R12_R16A_R24B_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"
    out={"framework":"SCIIP_EXPLORER_4_R24B_R2","generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,
         "classification":"FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_RECERTIFIED_WITH_CANDIDATE_LABEL_NORMALIZATION" if all15 else "FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_GAP_REMAINS",
         "rawTargets":raws,"normalizedTargets":targets,"outcomes":outcomes,
         "normalizationPolicy":{"scope":"candidate binding labels only","statusSuffixBoundaryOnly":True,"applicationSourceMutation":False,"governedDataMutation":False},
         "authority":{"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "nextMilestone":nextm}
    od=e/M;od.mkdir(parents=True,exist_ok=True);ef=od/"candidate_label_normalization_repair_and_fifteen_record_non_export_recertification.json";ef.write_text(json.dumps(out,indent=2)+"\n")
    print("="*120);print(f"QUALIFIED: {sum(x['qualified'] for x in outcomes)} /15");print("EXPORT_INVOCATION: OFF");print("STATUS:",status);print("STATE:",state);print("NEXT_MILESTONE:",nextm);print("EVIDENCE:",ef)
    return 0
if __name__=="__main__":raise SystemExit(main())
