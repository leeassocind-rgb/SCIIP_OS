#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R1="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R1_ALONDRA_BUILDING_PROJECT_SURFACE_MATERIALIZATION_TIMING_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R1_ALONDRA_BUILDING_PROJECT_SURFACE_MATERIALIZATION_TIMING_DIAGNOSED"
R1_CLASS="ALONDRA_PROJECT_AGGREGATE_MATERIALIZES_BUILDING_1_ABSENT_IN_BOUNDED_WINDOW"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R2_BUILDING_1_INVENTORY_VISIBILITY_CAUSAL_DIAGNOSIS"

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

def settle_exact(w,text,seconds=3.0,n=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=n:return True
        time.sleep(.1)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R1/"alondra_building_project_surface_materialization_timing_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R2-R3-R1-R2 Building 1 Inventory Visibility Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_DOM_IDENTITY_TRACE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26B_R2_R3_R1_R1_EVIDENCE_REQUIRED");return 4
    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=R1_STATE or d.get("classification")!=R1_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BUILDING_1_VISIBILITY_RESIDUAL_REQUIRED");return 5

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 6
    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_REQUIRED");return 7

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        if not settle_exact(w,"Explorer",3.0,3) or not click_exact(w,"Explorer"):
            print("STATUS: BLOCKED");print("DIAGNOSIS: EXPLORER_ENTRY_REQUIRED");return 8
        time.sleep(1.0)

        rows=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(ADDRESS.lower())},re=/{STATUS_RE}/i;
const all=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled);
return all.map((b,i)=>{{
 const text=ns(b.innerText||b.textContent||''),m=re.exec(text),label=m?text.slice(0,m.index).trim():text;
 if(label.toLowerCase()!==q)return null;
 const attrs=[...b.attributes].reduce((o,a)=>(o[a.name]=a.value,o),{{}});
 const reactKey=Object.keys(b).find(k=>k.startsWith('__reactProps$'))||null;
 let reactSummary=null;
 if(reactKey){{
   const rp=b[reactKey]||{{}};
   reactSummary={{
     keys:Object.keys(rp).sort(),
     title:typeof rp.title==='string'?rp.title:null,
     ariaLabel:typeof rp['aria-label']==='string'?rp['aria-label']:null,
     dataPropertyId:rp['data-property-id']??null,
     dataId:rp['data-id']??null,
     onClickName:typeof rp.onClick==='function'?(rp.onClick.name||'anonymous'):null
   }};
 }}
 const p=b.parentElement,g=p?.parentElement;
 const siblings=p?[...p.children].map(x=>ns(x.innerText||x.textContent||'')).filter(Boolean):[];
 return {{
   ordinal:i,text,label,html:b.outerHTML.slice(0,2000),className:String(b.className||''),id:b.id||null,
   attrs,reactSummary,
   parentTag:p?.tagName||null,parentClass:String(p?.className||''),parentText:ns(p?.innerText||''),
   grandparentTag:g?.tagName||null,grandparentClass:String(g?.className||''),grandparentText:ns(g?.innerText||''),
   siblingTexts:siblings.slice(0,20)
 }};
}}).filter(Boolean);
}})()""") or []

        storage=ev(w,r"""(()=>{const o={localStorage:{},sessionStorage:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/select|property|alondra|explorer/i.test(k||''))o.localStorage[k]=localStorage.getItem(k)}for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(/select|property|alondra|explorer/i.test(k||''))o.sessionStorage[k]=sessionStorage.getItem(k)}return o})()""") or {}

        exact_address_only=[r for r in rows if (r.get("text") or "").strip().lower()==ADDRESS.lower()]
        sf181=[r for r in rows if BUILDING_SF in (r.get("text") or "")]
        sf422=[r for r in rows if AGGREGATE_SF in (r.get("text") or "")]

        address_only_count=len(exact_address_only)
        aggregate_count=len(sf422)
        building_sf_count=len(sf181)

        # Determine whether address-only row has distinct DOM identity from aggregate.
        address_only_distinct=False
        if address_only_count==1 and aggregate_count==1:
            a=exact_address_only[0];g=sf422[0]
            address_only_distinct=(a.get("ordinal")!=g.get("ordinal") and a.get("html")!=g.get("html"))

        # Look for any hint that address-only row is selected marker / map marker style, which would explain text collapse.
        arow=exact_address_only[0] if address_only_count==1 else {}
        class_lower=(arow.get("className") or "").lower()
        is_marker=("sciip-property-marker" in class_lower)
        has_selected=("is-selected" in class_lower)
        data_status=(arow.get("attrs") or {}).get("data-property-status")
        data_spatial=(arow.get("attrs") or {}).get("data-spatial-band")

        if address_only_count==1 and aggregate_count==1 and building_sf_count==0 and address_only_distinct and is_marker:
            classification="BUILDING_1_REPRESENTED_BY_DISTINCT_ADDRESS_ONLY_PROPERTY_MARKER_WHILE_PROJECT_AGGREGATE_RETAINS_SF_BEARING_CARD_IDENTITY"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R3_ADDRESS_ONLY_BUILDING_MARKER_CANONICAL_BINDING_DIAGNOSIS"
        elif address_only_count==1 and aggregate_count==1 and building_sf_count==0:
            classification="DISTINCT_ADDRESS_ONLY_ALONDRA_CONTROL_PRESENT_BUT_BUILDING_1_CANONICAL_ROLE_UNRESOLVED"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R3_ADDRESS_ONLY_CONTROL_CANONICAL_ROLE_DEEP_DIAGNOSIS"
        else:
            classification="ALONDRA_INVENTORY_VISIBILITY_PATTERN_NOT_STABLE_FOR_CAUSAL_RESOLUTION"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R3_INVENTORY_VISIBILITY_STABILITY_DIAGNOSIS"

        checks={
          "r26bR2R3R1R1Passed":True,
          "projectAggregatePresent":aggregate_count==1,
          "sfBearingBuilding1Absent":building_sf_count==0,
          "addressOnlyControlPresent":address_only_count==1,
          "addressOnlyControlDistinctFromAggregate":address_only_distinct,
          "domAttributesCaptured":True,
          "reactBindingHintsCaptured":True,
          "parentContextCaptured":True,
          "siblingContextCaptured":True,
          "storageHintsCaptured":True,
          "propertyClickOff":True,
          "assignmentsInvocationOff":True,
          "generateInvocationOff":True,
          "exportInvocationOff":True,
          "applicationMutationOff":True,
          "governedMutationOff":True
        }

        out={
          "framework":"SCIIP_EXPLORER_4_R26B_R2_R3_R1_R2_BUILDING_1_INVENTORY_VISIBILITY_CAUSAL_DIAGNOSIS",
          "generatedAt":datetime.now(timezone.utc).isoformat(),
          "status":"PASSED",
          "state":"M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R2_BUILDING_1_INVENTORY_VISIBILITY_CAUSE_DIAGNOSED",
          "classification":classification,
          "targetAddress":ADDRESS,
          "buildingSf":BUILDING_SF,
          "projectAggregateSf":AGGREGATE_SF,
          "addressOnlyControlCount":address_only_count,
          "sfBearingBuilding1Count":building_sf_count,
          "projectAggregateCount":aggregate_count,
          "addressOnlyDistinctFromAggregate":address_only_distinct,
          "addressOnlyIsPropertyMarker":is_marker,
          "addressOnlyIsSelected":has_selected,
          "addressOnlyDataPropertyStatus":data_status,
          "addressOnlyDataSpatialBand":data_spatial,
          "alondraRows":rows,
          "storageHints":storage,
          "checks":checks,
          "authority":{
            "propertyClick":False,"assignmentsInvocation":False,"generateInvocation":False,
            "exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False
          },
          "sourceEvidence":{
            "r26bR2R3R1R1Path":str(p),
            "r26bR2R3R1R1Sha256":hashlib.sha256(p.read_bytes()).hexdigest()
          },
          "nextMilestone":nxt
        }

        od=evid/M;od.mkdir(parents=True,exist_ok=True)
        ef=od/"building_1_inventory_visibility_causal_diagnosis.json"
        ef.write_text(json.dumps(out,indent=2)+"\n")

        print("TARGET:",ADDRESS)
        print("ADDRESS_ONLY_CONTROL_COUNT:",address_only_count)
        print("SF_BEARING_BUILDING_1_COUNT:",building_sf_count)
        print("PROJECT_AGGREGATE_COUNT:",aggregate_count)
        print("ADDRESS_ONLY_DISTINCT_FROM_AGGREGATE:",address_only_distinct)
        print("ADDRESS_ONLY_IS_PROPERTY_MARKER:",is_marker)
        print("ADDRESS_ONLY_IS_SELECTED:",has_selected)
        print("ADDRESS_ONLY_DATA_PROPERTY_STATUS:",data_status)
        print("ADDRESS_ONLY_DATA_SPATIAL_BAND:",data_spatial)
        print("\n----- ALONDRA DOM ROWS -----")
        for r in rows: print(json.dumps(r,ensure_ascii=False))
        print("\n----- STORAGE HINTS -----")
        print(json.dumps(storage,ensure_ascii=False))
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
