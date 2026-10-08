#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

PREV="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R3_ADDRESS_ONLY_BUILDING_MARKER_CANONICAL_BINDING_DIAGNOSIS"
PREV_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R3_ADDRESS_ONLY_BUILDING_MARKER_CANONICAL_BINDING_DIAGNOSED"
PREV_CLASS="ALONDRA_BUILDING_1_CANONICAL_IDENTITY_RECOVERABLE_FROM_SELECTED_MARKER_HIDDEN_CARD_DESPITE_ADDRESS_ONLY_VISIBLE_LABEL"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_BUILDING_1_SELECTED_ENTITY_READBACK_REPAIR_AND_NON_EXPORT_RECERTIFICATION"

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

def wait_building_marker(w,seconds=10.0,n=3):
    st=time.time();con=0;last=None
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(ADDRESS.lower())};
const ms=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled);
const rows=ms.map(b=>({{b,text:ns(b.innerText||b.textContent||''),html:b.outerHTML,className:String(b.className||''),aria:b.getAttribute('aria-label')}}));
const addr=rows.filter(x=>x.html.toLowerCase().includes(q));
const build=addr.filter(x=>x.html.includes('181,831 SF'));
const agg=addr.filter(x=>x.html.includes('422,277 SF'));
return{{addressCount:addr.length,buildingCount:build.length,aggregateCount:agg.length,
buildingSelected:build.filter(x=>x.className.includes('is-selected')).length,
aggregateSelected:agg.filter(x=>x.className.includes('is-selected')).length,
buildingTexts:build.map(x=>x.text),aggregateTexts:agg.map(x=>x.text)}};
}})()""") or {}
        last=v
        ok=v.get("buildingCount")==1 and v.get("aggregateCount")==1
        con=con+1 if ok else 0
        if con>=n:return True,last
        time.sleep(.15)
    return False,last

def click_building_by_hidden_card(w):
    return ev(w,f"""(()=>{{
const q={json.dumps(ADDRESS.lower())};
const ms=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled);
const build=ms.filter(b=>b.outerHTML.toLowerCase().includes(q)&&b.outerHTML.includes('181,831 SF')&&!b.outerHTML.includes('422,277 SF'));
const agg=ms.filter(b=>b.outerHTML.toLowerCase().includes(q)&&b.outerHTML.includes('422,277 SF'));
if(build.length!==1||agg.length!==1)return{{clicked:false,buildingCount:build.length,aggregateCount:agg.length}};
build[0].click();return{{clicked:true,buildingCount:1,aggregateCount:1}};
}})()""") or {}

def wait_selected_contract(w,seconds=3.0,n=3):
    st=time.time();con=0;last=None
    while time.time()-st<=seconds:
        v=ev(w,f"""(()=>{{
const q={json.dumps(ADDRESS.lower())};
const selected=[...document.querySelectorAll('button.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);
const build=selected.filter(b=>b.outerHTML.toLowerCase().includes(q)&&b.outerHTML.includes('181,831 SF')&&!b.outerHTML.includes('422,277 SF'));
const agg=selected.filter(b=>b.outerHTML.toLowerCase().includes(q)&&b.outerHTML.includes('422,277 SF'));
let ws=null;try{{ws=JSON.parse(localStorage.getItem('sciip.explorer3.workspace.v1')||'null')}}catch{{}}
return{{selectedCount:selected.length,buildingMatch:build.length,aggregateMatch:agg.length,
selectedPropertyId:ws?.selectedPropertyId||null,selectedTexts:selected.map(b=>(b.innerText||b.textContent||'').trim())}};
}})()""") or {}
        last=v
        ok=v.get("selectedCount")==1 and v.get("buildingMatch")==1 and v.get("aggregateMatch")==0 and bool(v.get("selectedPropertyId"))
        con=con+1 if ok else 0
        if con>=n:return True,last
        time.sleep(.1)
    return False,last

def wait_review(w,seconds=4.0,n=3):
    st=time.time();con=0;last=None
    while time.time()-st<=seconds:
        v=ev(w,r"""(()=>{const txt=document.body?.innerText||'';const d=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{review:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),downloadCount:d.length,enabled:d.length===1&&!d[0].disabled}})()""") or {}
        last=v
        ok=v.get("review") and v.get("downloadCount")==1 and v.get("enabled")
        con=con+1 if ok else 0
        if con>=n:return True,last
        time.sleep(.1)
    return False,last

def handler(w):
    return ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return{count:x.length,name:null,enabled:false};const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));const f=k&&x[0][k]&&x[0][k].onClick;return{count:1,name:typeof f==='function'?(f.name||'anonymous'):null,enabled:!x[0].disabled}})()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/PREV/"address_only_building_marker_canonical_binding_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R2-R3-R2 Building 1 Selected-Entity Readback Repair + Non-Export Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Export invocation: OFF")
    print("Binding surface: selected SCIIP property marker + hidden 181,831 SF card")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26B_R2_R3_R1_R3_EVIDENCE_REQUIRED");return 4
    d=loadj(p)
    if d.get("status")!="PASSED" or d.get("state")!=PREV_STATE or d.get("classification")!=PREV_CLASS:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_SELECTED_MARKER_CANONICAL_CONTRACT_REQUIRED");return 5

    contract=d.get("canonicalBindingContract") or {}
    if contract.get("canonicalKey")!="112 W Alondra Blvd|181831":
        print("STATUS: BLOCKED");print("DIAGNOSIS: BUILDING_1_CANONICAL_KEY_REQUIRED");return 6

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: ACTIVE_CDP_REQUIRED");return 7
    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("DIAGNOSIS: FRESH_PAGE_REQUIRED");return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    try:
        explorer=settle_exact(w,"Explorer",3.0,3)
        entered=click_exact(w,"Explorer") if explorer else False
        surface,surface_readback=wait_building_marker(w,10.0,3) if entered else (False,None)
        selection=click_building_by_hidden_card(w) if surface else {}
        selected,selected_readback=wait_selected_contract(w,3.0,3) if selection.get("clicked") else (False,None)

        ass_settle=settle_exact(w,"Assignments",3.0,3) if selected else False
        ass_entry=click_exact(w,"Assignments") if ass_settle else False
        gen_settle=settle_exact(w,"Generate Client Listing Report",3.0,3) if ass_entry else False
        gen_click=click_exact(w,"Generate Client Listing Report") if gen_settle else False
        review,review_readback=wait_review(w,4.0,3) if gen_click else (False,None)
        h=handler(w) if review else {}
        export_control=review and h.get("count")==1 and h.get("enabled") is True
        live_handler=h.get("name")=="exportReport"
        cont=ev(w,r"""(()=>({explorer:[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer'),sameOrigin:location.origin==='http://127.0.0.1:5173'}))()""") or {}

        certified=all([
          explorer,entered,surface,
          (surface_readback or {}).get("buildingCount")==1,
          (surface_readback or {}).get("aggregateCount")==1,
          selection.get("clicked") is True,selected,
          (selected_readback or {}).get("buildingMatch")==1,
          (selected_readback or {}).get("aggregateMatch")==0,
          bool((selected_readback or {}).get("selectedPropertyId")),
          ass_entry,gen_click,review,export_control,live_handler,
          cont.get("explorer") is True,cont.get("sameOrigin") is True
        ])

        checks={
          "r26bR2R3R1R3Passed":True,
          "canonicalBindingContractConsumed":True,
          "freshPageCreated":True,
          "explorerSettleCertified":explorer,
          "explorerEntryCertified":entered,
          "buildingAndAggregateSurfaceCertified":surface,
          "buildingMarkerUniqueByHiddenCard":(surface_readback or {}).get("buildingCount")==1,
          "aggregateMarkerUnique":(surface_readback or {}).get("aggregateCount")==1,
          "building1ClickedByHiddenCardIdentity":selection.get("clicked") is True,
          "selectedBuildingReadbackCertified":selected,
          "selectedMarkerContainsBuildingSf":(selected_readback or {}).get("buildingMatch")==1,
          "selectedMarkerExcludesAggregateSf":(selected_readback or {}).get("aggregateMatch")==0,
          "selectedPropertyIdPresent":bool((selected_readback or {}).get("selectedPropertyId")),
          "assignmentsEntryCertified":ass_entry,
          "directGenerateToReportReviewCertified":gen_click and review,
          "exportControlCertified":export_control,
          "liveHandlerCertified":live_handler,
          "explorerContinuityCertified":cont.get("explorer") is True,
          "sameOriginCertified":cont.get("sameOrigin") is True,
          "exportInvocationOff":True,
          "applicationMutationOff":True,
          "governedMutationOff":True
        }

        status="PASSED" if certified else "DIAGNOSTIC_COMPLETE"
        state=("M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_BUILDING_1_SELECTED_ENTITY_READBACK_REPAIRED_NON_EXPORT_RECERTIFIED"
               if certified else
               "M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_BUILDING_1_SELECTED_ENTITY_READBACK_REPAIR_INCOMPLETE")
        classification=("ALONDRA_BUILDING_1_SELECTED_MARKER_HIDDEN_CARD_CANONICAL_READBACK_AND_NON_EXPORT_WORKFLOW_CERTIFIED_PROJECT_AGGREGATE_EXCLUDED"
                        if certified else
                        "ALONDRA_SELECTED_ENTITY_READBACK_OR_NON_EXPORT_WORKFLOW_GAP_REMAINS")
        nxt=("M4_19D4BN17C_R4_R12_R16A_R26B_R3_RESUME_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
             if certified else
             "M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_R1_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS")

        out={
          "framework":"SCIIP_EXPLORER_4_R26B_R2_R3_R2_BUILDING_1_SELECTED_ENTITY_READBACK_REPAIR_AND_NON_EXPORT_RECERTIFICATION",
          "generatedAt":datetime.now(timezone.utc).isoformat(),
          "status":status,"state":state,"classification":classification,
          "target":ADDRESS,
          "buildingCanonicalKey":"112 W Alondra Blvd|181831",
          "projectAggregateSf":422277,
          "surfaceReadback":surface_readback,
          "selection":selection,
          "selectedReadback":selected_readback,
          "reviewReadback":review_readback,
          "checks":checks,
          "authority":{"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False},
          "sourceEvidence":{"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
          "nextMilestone":nxt
        }
        od=evid/M;od.mkdir(parents=True,exist_ok=True)
        ef=od/"building_1_selected_entity_readback_repair_and_non_export_recertification.json"
        ef.write_text(json.dumps(out,indent=2)+"\n")

        print("TARGET:",ADDRESS)
        print("BUILDING_CANONICAL_KEY: 112 W Alondra Blvd|181831")
        print("PROJECT_AGGREGATE_SF: 422277")
        print("EXPLORER_SETTLE_CERTIFIED:",explorer)
        print("EXPLORER_ENTRY_CERTIFIED:",entered)
        print("BUILDING_AND_AGGREGATE_SURFACE_CERTIFIED:",surface)
        print("BUILDING_1_CLICKED_BY_HIDDEN_CARD_IDENTITY:",selection.get("clicked") is True)
        print("SELECTED_BUILDING_READBACK_CERTIFIED:",selected)
        print("SELECTED_PROPERTY_ID:",(selected_readback or {}).get("selectedPropertyId"))
        print("ASSIGNMENTS_ENTRY_CERTIFIED:",ass_entry)
        print("REPORT_REVIEW_ENTRY_CERTIFIED:",review)
        print("EXPORT_CONTROL_CERTIFIED:",export_control)
        print("LIVE_HANDLER_CERTIFIED:",live_handler)
        print("EXPLORER_CONTINUITY:",cont.get("explorer") is True)
        print("SAME_ORIGIN:",cont.get("sameOrigin") is True)
        print("EXPORT_INVOCATION: OFF")
        print("\n----- CHECKS -----")
        for k,v in checks.items(): print(f"{k}: {v}")
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
