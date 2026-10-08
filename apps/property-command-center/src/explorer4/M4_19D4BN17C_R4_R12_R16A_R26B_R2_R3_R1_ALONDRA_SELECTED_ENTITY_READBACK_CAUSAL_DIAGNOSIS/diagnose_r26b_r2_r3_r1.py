#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R3="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION"
R3_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION_INCOMPLETE"
R3_CLASS="ALONDRA_BUILDING_PROJECT_AWARE_NON_EXPORT_RECERTIFICATION_GAP_REMAINS"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_ALONDRA_SELECTED_ENTITY_READBACK_CAUSAL_DIAGNOSIS"

ADDRESS="112 W Alondra Blvd"
BUILDING_SF="181,831"
AGGREGATE_SF="422,277"
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

def settle_exact(w,text,seconds=2.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()===t);if(x.length!==1)return false;x[0].click();return true}})()""") is True

def wait_building_surface(w,seconds=5.0,n=3):
    st=time.time();con=0;last=None
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(ADDRESS.lower())},re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),m=re.exec(text),label=m?text.slice(0,m.index).trim():text;
 const sm=/·\\s*([\\d,]+)\\s*SF/i.exec(text);return{{text,label:label.toLowerCase(),sf:sm?sm[1]:null}};
}});
const addr=rows.filter(x=>x.label===q), b=addr.filter(x=>x.sf==={json.dumps(BUILDING_SF)}), a=addr.filter(x=>x.sf==={json.dumps(AGGREGATE_SF)});
return{{addressCount:addr.length,buildingCount:b.length,aggregateCount:a.length}};
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
const x=rows.filter(r=>r.label===q&&r.sf==={json.dumps(BUILDING_SF)});
if(x.length!==1)return{{clicked:false,count:x.length}};
x[0].b.click();return{{clicked:true,count:1,text:x[0].text}};
}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R3/"building_project_aware_alondra_non_export_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R2-R3-R1 Alondra Selected-Entity Readback Causal Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_SELECTED_ENTITY_READBACK_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Single bounded property click: BUILDING 1 ONLY")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26B_R2_R3_EVIDENCE_REQUIRED");return 4
    d=loadj(p)
    if d.get("status")!="DIAGNOSTIC_COMPLETE" or d.get("state")!=R3_STATE or d.get("classification")!=R3_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXPECTED_R26B_R2_R3_INCOMPLETE_EVIDENCE_REQUIRED");return 5

    c=d.get("checks") or {}
    prereq=all([
      c.get("buildingProjectAwareBindingCertified") is True,
      c.get("building1Selected") is True,
      c.get("projectAggregateExplicitlyExcluded") is True,
      c.get("selectedBuildingReadbackCertified") is False,
      c.get("selectedAggregateReadbackAbsent") is True
    ])
    if not prereq:
        print("STATUS: BLOCKED");print("DIAGNOSIS: EXPECTED_SELECTION_READBACK_RESIDUAL_REQUIRED");return 6

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7
    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_REQUIRED");return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        if not settle_exact(w,"Explorer",2.0,3) or not click_exact(w,"Explorer"):
            print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_ENTRY_REQUIRED");return 9
        ok,surface=wait_building_surface(w,5.0,3)
        if not ok:
            print("STATUS: BLOCKED");print("DIAGNOSIS: BUILDING_PROJECT_SURFACE_REQUIRED");return 10
        sel=click_building(w)
        if not sel.get("clicked"):
            print("STATUS: BLOCKED");print("DIAGNOSIS: BUILDING_1_SELECTION_REQUIRED");return 11

        samples=[]
        t0=time.time()
        for delay in [0.0,0.05,0.1,0.2,0.35,0.5,0.75,1.0,1.5,2.0]:
            while time.time()-t0<delay: time.sleep(.01)
            v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),addr={json.dumps(ADDRESS.lower())};
const selected=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(x=>x.offsetParent!==null).map(x=>({{
 text:ns(x.innerText||x.textContent||''),className:String(x.className||''),id:x.id||null,
 data:[...x.attributes].filter(a=>a.name.startsWith('data-')).reduce((o,a)=>(o[a.name]=a.value,o),{{}}),
 ariaSelected:x.getAttribute('aria-selected')
}}));
const allSelectedLike=[...document.querySelectorAll('[class*="selected"],[aria-selected="true"]')].filter(x=>x.offsetParent!==null).slice(0,30).map(x=>({{
 tag:x.tagName,text:ns(x.innerText||x.textContent||''),className:String(x.className||''),ariaSelected:x.getAttribute('aria-selected')
}}));
const body=ns(document.body?.innerText||'');
const addressVisible=body.toLowerCase().includes(addr);
const sf181=body.includes('181,831');
const sf422=body.includes('422,277');
const assignments=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Assignments').length;
return{{selectedMarkers:selected,selectedMarkerCount:selected.length,allSelectedLike,addressVisible,sf181Visible:sf181,sf422Visible:sf422,assignmentsCount:assignments}};
}})()""") or {}
            v["t"]=delay;samples.append(v)

        # derive stable selected-marker characteristics
        marker_texts=[]
        marker_counts=[]
        sf181_vis=[]
        sf422_vis=[]
        for s in samples:
            marker_counts.append(s.get("selectedMarkerCount",0))
            marker_texts += [x.get("text","") for x in s.get("selectedMarkers",[])]
            sf181_vis.append(bool(s.get("sf181Visible")))
            sf422_vis.append(bool(s.get("sf422Visible")))
        unique_marker_texts=[]
        for x in marker_texts:
            if x not in unique_marker_texts: unique_marker_texts.append(x)

        marker_stable=all(x==1 for x in marker_counts[-5:])
        address_marker=any(x.strip().lower()==ADDRESS.lower() for x in unique_marker_texts)
        marker_contains_sf181=any("181,831" in x for x in unique_marker_texts)
        marker_contains_sf422=any("422,277" in x for x in unique_marker_texts)

        # body/detail surface can preserve SF even when marker label is address-only
        sf181_stable=all(sf181_vis[-5:])
        sf422_stable=all(sf422_vis[-5:])

        if marker_stable and address_marker and not marker_contains_sf181 and sf181_stable:
            classification="SELECTED_MARKER_IS_ADDRESS_ONLY_WHILE_BUILDING_181831_REMAINS_STABLE_IN_SELECTED_DETAIL_SURFACE"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_COMPOSITE_SELECTED_ENTITY_READBACK_REPAIR_AND_ALONDRA_NON_EXPORT_RECERTIFICATION"
        elif marker_stable and marker_contains_sf181:
            classification="SELECTED_MARKER_CARRIES_BUILDING_SF_PRIOR_FAILURE_TRANSIENT"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_SELECTED_MARKER_SETTLE_REPAIR_AND_ALONDRA_NON_EXPORT_RECERTIFICATION"
        else:
            classification="SELECTED_ENTITY_READBACK_SURFACE_REQUIRES_ADDITIONAL_CANONICAL_HINT_DISCOVERY"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_SELECTED_ENTITY_CANONICAL_HINT_DEEP_DIAGNOSIS"

        checks={
          "r26bR2R3IncompleteStateConsumed":True,
          "buildingProjectAwareBindingPreviouslyCertified":True,
          "building1PreviouslySelected":True,
          "projectAggregatePreviouslyExcluded":True,
          "freshPageCreated":True,
          "explorerEntryCertified":True,
          "buildingProjectSurfaceCertified":ok,
          "singleBuilding1ClickPerformed":sel.get("clicked") is True,
          "selectedReadbackSamplesCaptured":len(samples)==10,
          "selectedMarkerInventoryCaptured":True,
          "selectedLikeInventoryCaptured":True,
          "buildingSfVisibilityCaptured":True,
          "projectAggregateSfVisibilityCaptured":True,
          "assignmentsInvocationOff":True,
          "generateInvocationOff":True,
          "exportInvocationOff":True,
          "applicationMutationOff":True,
          "governedMutationOff":True
        }

        out={
          "framework":"SCIIP_EXPLORER_4_R26B_R2_R3_R1_ALONDRA_SELECTED_ENTITY_READBACK_CAUSAL_DIAGNOSIS",
          "generatedAt":datetime.now(timezone.utc).isoformat(),
          "status":"PASSED",
          "state":"M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_ALONDRA_SELECTED_ENTITY_READBACK_CAUSE_DIAGNOSED",
          "classification":classification,
          "targetAddress":ADDRESS,
          "targetBuildingSf":BUILDING_SF,
          "projectAggregateSf":AGGREGATE_SF,
          "selection":sel,
          "samples":samples,
          "derived":{
            "selectedMarkerStableLastFive":marker_stable,
            "selectedMarkerTexts":unique_marker_texts,
            "selectedMarkerAddressOnlyObserved":address_marker and not marker_contains_sf181 and not marker_contains_sf422,
            "selectedMarkerContainsBuildingSf":marker_contains_sf181,
            "selectedMarkerContainsProjectAggregateSf":marker_contains_sf422,
            "building181831VisibleStableLastFive":sf181_stable,
            "projectAggregate422277VisibleStableLastFive":sf422_stable
          },
          "checks":checks,
          "authority":{
            "singleBoundedPropertyClick":"BUILDING_1_ONLY",
            "assignmentsInvocation":False,"generateInvocation":False,"exportInvocation":False,
            "applicationSourceMutation":False,"governedDataMutation":False
          },
          "sourceEvidence":{
            "r26bR2R3Path":str(p),
            "r26bR2R3Sha256":hashlib.sha256(p.read_bytes()).hexdigest()
          },
          "nextMilestone":nxt
        }

        od=evid/M;od.mkdir(parents=True,exist_ok=True)
        ef=od/"alondra_selected_entity_readback_causal_diagnosis.json"
        ef.write_text(json.dumps(out,indent=2)+"\n")

        print("TARGET:",ADDRESS)
        print("TARGET_BUILDING_SF:",BUILDING_SF)
        print("PROJECT_AGGREGATE_SF:",AGGREGATE_SF)
        print("BUILDING_1_CLICKED:",sel.get("clicked") is True)
        print("SELECTED_MARKER_STABLE_LAST_FIVE:",marker_stable)
        print("SELECTED_MARKER_TEXTS:",json.dumps(unique_marker_texts))
        print("SELECTED_MARKER_ADDRESS_ONLY_OBSERVED:",address_marker and not marker_contains_sf181 and not marker_contains_sf422)
        print("SELECTED_MARKER_CONTAINS_BUILDING_SF:",marker_contains_sf181)
        print("SELECTED_MARKER_CONTAINS_PROJECT_AGGREGATE_SF:",marker_contains_sf422)
        print("BUILDING_181831_VISIBLE_STABLE_LAST_FIVE:",sf181_stable)
        print("PROJECT_AGGREGATE_422277_VISIBLE_STABLE_LAST_FIVE:",sf422_stable)
        print("\n----- TIMING SAMPLES -----")
        for s in samples: print(json.dumps(s,ensure_ascii=False))
        print("\n----- CHECKS -----")
        for k,v in checks.items(): print(f"{k}: {v}")
        print("CLASSIFICATION:",classification)
        print("STATUS: PASSED")
        print("STATE:",out["state"])
        print("NEXT_MILESTONE:",nxt)
        print("EVIDENCE:",ef)
        return 0
    finally:
        try:w.call("Page.close")
        except:pass

if __name__=="__main__":
    raise SystemExit(main())
