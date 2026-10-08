#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R2="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R2_ALONDRA_BUILDING_PROJECT_ENTITY_GRANULARITY_RECONCILIATION_AND_CANONICAL_BINDING_CONTRACT"
R2_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_R2_ALONDRA_BUILDING_PROJECT_ENTITY_GRANULARITY_AND_CANONICAL_BINDING_CONTRACT_CERTIFIED"
R2_CLASS="ALONDRA_422277_SF_RESOLVED_AS_THREE_BUILDING_PROJECT_AGGREGATE_181831_SF_RESOLVED_AS_BUILDING_1_CANONICAL_BINDING_GRANULARITY_CERTIFIED"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION"

ADDRESS="112 W Alondra Blvd"
BUILDING_SF="181,831"
AGGREGATE_SF="422,277"
BUILDING_KEY="112 W Alondra Blvd|181831"
PORT=9333
APP="http://127.0.0.1:5173/"
STATUS_RE=r"(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·"

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
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return{{clicked:false,count:x.length}};x[0].click();return{{clicked:true,count:1}}}})()""") or {}

def wait_building_key(w,seconds=5.0,n=3):
    st=time.time();con=0;last=None
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(ADDRESS.lower())},re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),m=re.exec(text),label=m?text.slice(0,m.index).trim():text;
 const sm=/·\\s*([\\d,]+)\\s*SF/i.exec(text); return{{text,label:label.toLowerCase(),sf:sm?sm[1]:null}};
}});
const addr=rows.filter(x=>x.label===q), building=addr.filter(x=>x.sf==={json.dumps(BUILDING_SF)}), agg=addr.filter(x=>x.sf==={json.dumps(AGGREGATE_SF)});
return{{addressCount:addr.length,buildingCount:building.length,aggregateCount:agg.length,
buildingTexts:building.map(x=>x.text),aggregateTexts:agg.map(x=>x.text)}};
}})()""") or {}
        last=v
        ok=v.get("addressCount")==2 and v.get("buildingCount")==1 and v.get("aggregateCount")==1
        con=con+1 if ok else 0
        if con>=n:return True,last
        time.sleep(.15)
    return False,last

def click_building(w):
    return ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(ADDRESS.lower())},re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),m=re.exec(text),label=m?text.slice(0,m.index).trim():text;
 const sm=/·\\s*([\\d,]+)\\s*SF/i.exec(text);return{{text,label:label.toLowerCase(),sf:sm?sm[1]:null,b}};
}});
const building=rows.filter(x=>x.label===q&&x.sf==={json.dumps(BUILDING_SF)});
const agg=rows.filter(x=>x.label===q&&x.sf==={json.dumps(AGGREGATE_SF)});
if(building.length!==1||agg.length!==1)return{{clicked:false,buildingCount:building.length,aggregateCount:agg.length}};
building[0].b.click();return{{clicked:true,text:building[0].text,aggregateExcluded:true}};
}})()""") or {}

def wait_selected_building(w,seconds=2.0,n=3):
    st=time.time();con=0;last=None
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(ADDRESS.lower())};
const xs=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),sm=/·\\s*([\\d,]+)\\s*SF/i.exec(text);
 return{{text,starts:text.toLowerCase().startsWith(q),sf:sm?sm[1]:null}};
}});
return{{count:xs.length,buildingMatch:xs.filter(x=>x.starts&&x.sf==={json.dumps(BUILDING_SF)}).length,
aggregateMatch:xs.filter(x=>x.starts&&x.sf==={json.dumps(AGGREGATE_SF)}).length,texts:xs.map(x=>x.text)}};
}})()""") or {}
        last=v
        ok=v.get("count")==1 and v.get("buildingMatch")==1 and v.get("aggregateMatch")==0
        con=con+1 if ok else 0
        if con>=n:return True,last
        time.sleep(.1)
    return False,last

def wait_review(w,seconds=3.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        v=ev(w,r"""(()=>{const txt=document.body?.innerText||'';const d=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{review:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),downloadCount:d.length,enabled:d.length===1&&!d[0].disabled}})()""") or {}
        ok=v.get("review") and v.get("downloadCount")==1 and v.get("enabled")
        con=con+1 if ok else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def handler(w):
    return ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return{count:x.length,name:null,enabled:false};const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));const f=k&&x[0][k]&&x[0][k].onClick;return{count:1,name:typeof f==='function'?(f.name||'anonymous'):null,enabled:!x[0].disabled}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R2/"alondra_building_project_entity_granularity_reconciliation_and_canonical_binding_contract.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R2-R3 Building/Project-Aware Alondra Non-Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Export invocation: OFF")
    print("Canonical building key:",BUILDING_KEY)
    print("Project aggregate excluded: 422,277 SF")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26B_R2_R2_EVIDENCE_REQUIRED");return 4
    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=R2_STATE or d.get("classification")!=R2_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BUILDING_PROJECT_GRANULARITY_CONTRACT_REQUIRED");return 5

    contract=d.get("canonicalBindingContract") or {}
    if (contract.get("building1") or {}).get("canonicalKey")!=BUILDING_KEY:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BUILDING_1_KEY_REQUIRED");return 6
    if (contract.get("projectAggregate") or {}).get("aggregateSf")!=422277:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_PROJECT_AGGREGATE_REQUIRED");return 7
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 8

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_REQUIRED");return 9

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        explorer_settle=settle_exact(w,"Explorer",2.0,3)
        explorer_entry=click_exact(w,"Explorer") if explorer_settle else {}
        binding,binding_readback=wait_building_key(w,5.0,3) if explorer_entry.get("clicked") else (False,None)
        selection=click_building(w) if binding else {}
        selected,selected_readback=wait_selected_building(w,2.0,3) if selection.get("clicked") else (False,None)

        assignments_settle=settle_exact(w,"Assignments",2.0,3) if selected else False
        assignments_entry=click_exact(w,"Assignments") if assignments_settle else {}
        generate_settle=settle_exact(w,"Generate Client Listing Report",2.0,3) if assignments_entry.get("clicked") else False
        generate_click=click_exact(w,"Generate Client Listing Report") if generate_settle else {}
        review=wait_review(w,3.0,3) if generate_click.get("clicked") else False
        h=handler(w) if review else {}
        export_control=review and h.get("count")==1 and h.get("enabled") is True
        live_handler=h.get("name")=="exportReport"
        continuity=ev(w,r"""(()=>({explorer:[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer'),sameOrigin:location.origin==='http://127.0.0.1:5173'}))()""") or {}

        certified=all([
          explorer_settle,explorer_entry.get("clicked") is True,binding,
          (binding_readback or {}).get("buildingCount")==1,(binding_readback or {}).get("aggregateCount")==1,
          selection.get("clicked") is True,selection.get("aggregateExcluded") is True,
          selected,(selected_readback or {}).get("aggregateMatch")==0,
          assignments_entry.get("clicked") is True,generate_click.get("clicked") is True,
          review,export_control,live_handler,
          continuity.get("explorer") is True,continuity.get("sameOrigin") is True
        ])

        checks={
          "r26bR2R2Passed":True,
          "buildingProjectGranularityContractConsumed":True,
          "building1CanonicalKeyConsumed":True,
          "projectAggregateCanonicalKeyConsumed":True,
          "addressOnlyBindingNotUsed":True,
          "freshPageCreated":True,
          "explorerSettleCertified":explorer_settle,
          "explorerEntryCertified":explorer_entry.get("clicked") is True,
          "twoGranularitiesObservedAtAddress":(binding_readback or {}).get("addressCount")==2,
          "building181831Unique":(binding_readback or {}).get("buildingCount")==1,
          "projectAggregate422277Unique":(binding_readback or {}).get("aggregateCount")==1,
          "buildingProjectAwareBindingCertified":binding,
          "building1Selected":selection.get("clicked") is True,
          "projectAggregateExplicitlyExcluded":selection.get("aggregateExcluded") is True,
          "selectedBuildingReadbackCertified":selected,
          "selectedAggregateReadbackAbsent":(selected_readback or {}).get("aggregateMatch")==0,
          "assignmentsEntryCertified":assignments_entry.get("clicked") is True,
          "directGenerateToReportReviewCertified":generate_click.get("clicked") is True and review,
          "exportControlCertified":export_control,
          "liveHandlerCertified":live_handler,
          "explorerContinuityCertified":continuity.get("explorer") is True,
          "sameOriginCertified":continuity.get("sameOrigin") is True,
          "exportInvocationOff":True,
          "applicationMutationOff":True,
          "governedMutationOff":True
        }

        status="PASSED" if certified else "DIAGNOSTIC_COMPLETE"
        state=("M419D4BN17C_R4_R12_R16A_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFIED"
               if certified else
               "M419D4BN17C_R4_R12_R16A_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION_INCOMPLETE")
        classification=("ALONDRA_BUILDING_1_181831_SF_SELECTED_AND_NON_EXPORT_WORKFLOW_RECERTIFIED_PROJECT_AGGREGATE_422277_SF_EXCLUDED"
                        if certified else
                        "ALONDRA_BUILDING_PROJECT_AWARE_NON_EXPORT_RECERTIFICATION_GAP_REMAINS")
        nxt=("M4_19D4BN17C_R4_R12_R16A_R26B_R3_RESUME_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
             if certified else
             "M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

        out={
          "framework":"SCIIP_EXPLORER_4_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION",
          "generatedAt":datetime.now(timezone.utc).isoformat(),
          "status":status,"state":state,"classification":classification,
          "buildingCanonicalKey":BUILDING_KEY,
          "projectAggregateSf":422277,
          "bindingReadback":binding_readback,
          "selection":selection,
          "selectedReadback":selected_readback,
          "checks":checks,
          "authority":{"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False},
          "sourceEvidence":{"r26bR2R2Path":str(p),"r26bR2R2Sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
          "nextMilestone":nxt
        }
        od=evid/M;od.mkdir(parents=True,exist_ok=True)
        ef=od/"building_project_aware_alondra_non_export_recertification.json"
        ef.write_text(json.dumps(out,indent=2)+"\n")

        print("BUILDING_CANONICAL_KEY:",BUILDING_KEY)
        print("PROJECT_AGGREGATE_SF: 422277")
        print("EXPLORER_SETTLE_CERTIFIED:",explorer_settle)
        print("EXPLORER_ENTRY_CERTIFIED:",explorer_entry.get("clicked") is True)
        print("ADDRESS_RECORD_COUNT:",(binding_readback or {}).get("addressCount"))
        print("BUILDING_181831_COUNT:",(binding_readback or {}).get("buildingCount"))
        print("PROJECT_AGGREGATE_422277_COUNT:",(binding_readback or {}).get("aggregateCount"))
        print("BUILDING_PROJECT_AWARE_BINDING_CERTIFIED:",binding)
        print("BUILDING_1_SELECTED:",selection.get("clicked") is True)
        print("PROJECT_AGGREGATE_EXCLUDED:",selection.get("aggregateExcluded") is True)
        print("SELECTED_BUILDING_READBACK_CERTIFIED:",selected)
        print("ASSIGNMENTS_ENTRY_CERTIFIED:",assignments_entry.get("clicked") is True)
        print("REPORT_REVIEW_ENTRY_CERTIFIED:",review)
        print("EXPORT_CONTROL_CERTIFIED:",export_control)
        print("LIVE_HANDLER_CERTIFIED:",live_handler)
        print("EXPLORER_CONTINUITY:",continuity.get("explorer") is True)
        print("SAME_ORIGIN:",continuity.get("sameOrigin") is True)
        print("EXPORT_INVOCATION: OFF")
        print("\n----- CHECKS -----")
        for k,v in checks.items():print(f"{k}: {v}")
        print("STATUS:",status)
        print("STATE:",state)
        print("CLASSIFICATION:",classification)
        print("NEXT_MILESTONE:",nxt)
        print("EVIDENCE:",ef)
        return 0
    finally:
        try:w.call("Page.close")
        except:pass

if __name__=="__main__":
    raise SystemExit(main())
