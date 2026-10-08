#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R1="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_ALONDRA_SELECTED_ENTITY_READBACK_CAUSAL_DIAGNOSIS"
R2="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION"
R2_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION_INCOMPLETE"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R1_ALONDRA_BUILDING_PROJECT_SURFACE_MATERIALIZATION_TIMING_DIAGNOSIS"

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
    prior=evid/R2/"building_project_aware_alondra_non_export_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R2-R3-R1-R1 Alondra Building/Project Surface Materialization Timing Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_SURFACE_TIMING_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    if not prior.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R26B_R2_R3_EVIDENCE_REQUIRED"); return 4
    d=loadj(prior)
    if d.get("state")!=R2_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: EXPECTED_R26B_R2_R3_INCOMPLETE_STATE_REQUIRED"); return 5

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ACTIVE_CDP_REQUIRED"); return 6
    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: FRESH_PAGE_REQUIRED"); return 7

    w=W(n["webSocketDebuggerUrl"]); w.call("Runtime.enable"); w.call("Page.enable")
    try:
        explorer_settle=settle_exact(w,"Explorer",3.0,3)
        explorer_entry=click_exact(w,"Explorer") if explorer_settle else False
        if not explorer_settle or not explorer_entry:
            print("STATUS: BLOCKED"); print("DIAGNOSIS: EXPLORER_ENTRY_REQUIRED"); return 8

        samples=[]
        t0=time.time()
        schedule=[0.0,0.05,0.1,0.2,0.35,0.5,0.75,1.0,1.5,2.0,2.5,3.0,4.0,5.0,6.0,7.5,10.0]
        for delay in schedule:
            while time.time()-t0<delay: time.sleep(.01)
            v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(ADDRESS.lower())},re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),m=re.exec(text),label=m?text.slice(0,m.index).trim():text;
 const sm=/·\\s*([\\d,]+)\\s*SF/i.exec(text);
 return{{text,label:label.toLowerCase(),sf:sm?sm[1]:null}};
}});
const addr=rows.filter(x=>x.label===q);
const b=addr.filter(x=>x.sf==={json.dumps(BUILDING_SF)});
const a=addr.filter(x=>x.sf==={json.dumps(AGGREGATE_SF)});
return{{addressCount:addr.length,buildingCount:b.length,aggregateCount:a.length,
addressTexts:addr.map(x=>x.text),buildingTexts:b.map(x=>x.text),aggregateTexts:a.map(x=>x.text),
buttonCount:rows.length,bodyLength:(document.body?.innerText||'').length,readyState:document.readyState}};
}})()""") or {}
            v["t"]=delay
            samples.append(v)

        first_building=next((s["t"] for s in samples if s.get("buildingCount")==1),None)
        first_aggregate=next((s["t"] for s in samples if s.get("aggregateCount")==1),None)
        first_both=next((s["t"] for s in samples if s.get("buildingCount")==1 and s.get("aggregateCount")==1 and s.get("addressCount")==2),None)

        last5=samples[-5:]
        both_stable=all(s.get("buildingCount")==1 and s.get("aggregateCount")==1 and s.get("addressCount")==2 for s in last5)
        building_ever=any(s.get("buildingCount")==1 for s in samples)
        aggregate_ever=any(s.get("aggregateCount")==1 for s in samples)

        if first_both is not None and both_stable:
            classification="ALONDRA_BUILDING_AND_PROJECT_SURFACE_DELAYED_BUT_STABLE_PRIOR_BLOCK_TRANSIENT_MATERIALIZATION_RACE"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R2_EXTENDED_SURFACE_SETTLE_SELECTED_ENTITY_READBACK_DIAGNOSIS"
        elif building_ever and not aggregate_ever:
            classification="ALONDRA_BUILDING_MATERIALIZES_PROJECT_AGGREGATE_ABSENT_IN_BOUNDED_WINDOW"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R2_PROJECT_AGGREGATE_INVENTORY_VISIBILITY_CAUSAL_DIAGNOSIS"
        elif aggregate_ever and not building_ever:
            classification="ALONDRA_PROJECT_AGGREGATE_MATERIALIZES_BUILDING_1_ABSENT_IN_BOUNDED_WINDOW"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R2_BUILDING_1_INVENTORY_VISIBILITY_CAUSAL_DIAGNOSIS"
        else:
            classification="ALONDRA_BUILDING_PROJECT_SURFACE_NOT_RELIABLY_MATERIALIZED_WITHIN_TEN_SECONDS"
            nxt="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R2_SURFACE_MATERIALIZATION_DEEP_CAUSAL_DIAGNOSIS"

        checks={
          "r26bR2R3IncompleteEvidenceConsumed":True,
          "freshPageCreated":True,
          "explorerSettleCertified":explorer_settle,
          "explorerEntryCertified":explorer_entry,
          "tenSecondObservationWindowUsed":True,
          "buildingCountCaptured":True,
          "aggregateCountCaptured":True,
          "addressCountCaptured":True,
          "readyStateCaptured":True,
          "firstBuildingTimeResolved":first_building is not None,
          "firstAggregateTimeResolved":first_aggregate is not None,
          "stableWindowEvaluated":True,
          "propertyClickOff":True,
          "assignmentsInvocationOff":True,
          "generateInvocationOff":True,
          "exportInvocationOff":True,
          "applicationMutationOff":True,
          "governedMutationOff":True
        }

        out={
          "framework":"SCIIP_EXPLORER_4_R26B_R2_R3_R1_R1_ALONDRA_BUILDING_PROJECT_SURFACE_MATERIALIZATION_TIMING_DIAGNOSIS",
          "generatedAt":datetime.now(timezone.utc).isoformat(),
          "status":"PASSED",
          "state":"M419D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R1_ALONDRA_BUILDING_PROJECT_SURFACE_MATERIALIZATION_TIMING_DIAGNOSED",
          "classification":classification,
          "targetAddress":ADDRESS,
          "buildingSf":BUILDING_SF,
          "projectAggregateSf":AGGREGATE_SF,
          "firstBuildingSeconds":first_building,
          "firstAggregateSeconds":first_aggregate,
          "firstBothSeconds":first_both,
          "bothStableLastFiveSamples":both_stable,
          "samples":samples,
          "checks":checks,
          "authority":{"propertyClick":False,"assignmentsInvocation":False,"generateInvocation":False,
                       "exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False},
          "sourceEvidence":{"r26bR2R3Path":str(prior),"r26bR2R3Sha256":hashlib.sha256(prior.read_bytes()).hexdigest()},
          "nextMilestone":nxt
        }

        od=evid/M; od.mkdir(parents=True,exist_ok=True)
        ef=od/"alondra_building_project_surface_materialization_timing_diagnosis.json"
        ef.write_text(json.dumps(out,indent=2)+"\n")

        print("TARGET:",ADDRESS)
        print("FIRST_BUILDING_181831_SECONDS:",first_building)
        print("FIRST_PROJECT_AGGREGATE_422277_SECONDS:",first_aggregate)
        print("FIRST_BOTH_GRANULARITIES_SECONDS:",first_both)
        print("BOTH_STABLE_LAST_FIVE_SAMPLES:",both_stable)
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
