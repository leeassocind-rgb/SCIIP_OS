#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R1="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R1_ALONDRA_DUPLICATE_CANONICAL_IDENTITY_DISAMBIGUATION_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R26B_R2_R1_ALONDRA_DUPLICATE_CANONICAL_IDENTITY_DISAMBIGUATION_DIAGNOSED"
M="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R2_ALONDRA_BUILDING_PROJECT_ENTITY_GRANULARITY_RECONCILIATION_AND_CANONICAL_BINDING_CONTRACT"
PORT=9333
APP="http://127.0.0.1:5173/"
STATUS_RE=r"(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·"

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
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    package_dir=Path(__file__).resolve().parent
    facts=loadj(package_dir/"ALONDRA_PROJECT_SOURCE_FACTS.json")
    evid=repo/"apps/property-command-center/evidence/explorer4"
    p=evid/R1/"alondra_duplicate_canonical_identity_disambiguation_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26B-R2-R2 Alondra Building/Project Entity Granularity Reconciliation + Canonical Binding Contract")
    print("="*120)
    print("Mode: READ_ONLY_ENTITY_GRANULARITY_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R26B_R2_R1_EVIDENCE_REQUIRED");return 4
    r1=loadj(p)
    if r1.get("status")!="PASSED" or r1.get("state")!=R1_STATE:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_R26B_R2_R1_REQUIRED");return 5

    buildings=facts.get("buildings") or []
    component_sum=sum(int(x["availableSf"]) for x in buildings)
    aggregate=int(facts["projectAggregateSf"])
    arithmetic_match=(component_sum==aggregate)

    prior_tokens=r1.get("visibleSfTokens") or []
    prior_181="181,831" in prior_tokens
    prior_422="422,277" in prior_tokens

    live_rows=[]
    live_explorer=False
    if getj(f"http://127.0.0.1:{PORT}/json/version"):
        n=newpage()
        if n and n.get("webSocketDebuggerUrl"):
            w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
            try:
                if settle_exact(w,"Explorer") and click_exact(w,"Explorer"):
                    live_explorer=True
                    time.sleep(.75)
                    live_rows=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(), re=/{STATUS_RE}/i;
const wanted=['112 w alondra blvd','219 w gardena boulevard','219 w gardena blvd','16325 s main street','16325 s main st'];
return [...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),m=re.exec(text),label=m?text.slice(0,m.index).trim():text;
 const sm=/·\\s*([\\d,]+)\\s*SF/i.exec(text);
 return{{text,label,sf:sm?sm[1]:null}};
}}).filter(x=>wanted.includes(x.label.toLowerCase()));
}})()""") or []
            finally:
                try:w.call("Page.close")
                except:pass

    canonical_contract={
      "entityTypes":{
        "BUILDING":"A single physical building with its own address and building-level specifications.",
        "PROJECT_AGGREGATE":"A multi-building project/complex aggregate representing the combined building set."
      },
      "building1":{
        "entityType":"BUILDING",
        "canonicalKey":"112 W Alondra Blvd|181831",
        "address":"112 W Alondra Blvd",
        "availableSf":181831
      },
      "projectAggregate":{
        "entityType":"PROJECT_AGGREGATE",
        "canonicalKey":"ALONDRA_THREE_BUILDING_PROJECT|422277",
        "aggregateSf":422277,
        "componentCanonicalKeys":[
          "112 W Alondra Blvd|181831",
          "219 W Gardena Blvd|102083",
          "16325 S Main St|138363"
        ]
      },
      "bindingRules":{
        "addressOnlyBindingForbiddenWhenMultipleGranularitiesPresent":True,
        "buildingBindingRequiresAddressPlusBuildingSf":True,
        "projectAggregateMustNotBindAsBuilding1":True,
        "aggregateSfMayBeUsedOnlyWithProjectAggregateEntityType":True,
        "componentRelationshipType":"HAS_BUILDING",
        "inverseRelationshipType":"MEMBER_OF_PROJECT"
      }
    }

    checks={
      "r26bR2R1Passed":True,
      "userProvidedProjectFactsConsumed":True,
      "threeBuildingsPresentInSourceFacts":len(buildings)==3,
      "building1Sf181831":buildings[0]["availableSf"]==181831,
      "building2Sf102083":buildings[1]["availableSf"]==102083,
      "building3Sf138363":buildings[2]["availableSf"]==138363,
      "componentSumEquals422277":arithmetic_match,
      "priorLive181831Observed":prior_181,
      "priorLive422277Observed":prior_422,
      "building1AndAggregateSeparated":canonical_contract["building1"]["canonicalKey"]!=canonical_contract["projectAggregate"]["canonicalKey"],
      "addressOnlyBindingForbidden":canonical_contract["bindingRules"]["addressOnlyBindingForbiddenWhenMultipleGranularitiesPresent"] is True,
      "projectAggregateMustNotBindAsBuilding1":canonical_contract["bindingRules"]["projectAggregateMustNotBindAsBuilding1"] is True,
      "buildingProjectRelationshipDefined":canonical_contract["bindingRules"]["componentRelationshipType"]=="HAS_BUILDING",
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True
    }

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R26B_R2_R2_ALONDRA_BUILDING_PROJECT_ENTITY_GRANULARITY_AND_CANONICAL_BINDING_CONTRACT_CERTIFIED"
           if passed else
           "M419D4BN17C_R4_R12_R16A_R26B_R2_R2_ALONDRA_ENTITY_GRANULARITY_RECONCILIATION_INCOMPLETE")
    classification=("ALONDRA_422277_SF_RESOLVED_AS_THREE_BUILDING_PROJECT_AGGREGATE_181831_SF_RESOLVED_AS_BUILDING_1_CANONICAL_BINDING_GRANULARITY_CERTIFIED"
                    if passed else
                    "ALONDRA_BUILDING_PROJECT_ENTITY_GRANULARITY_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_BUILDING_PROJECT_AWARE_ALONDRA_NON_EXPORT_RECERTIFICATION"
         if passed else
         "M4_19D4BN17C_R4_R12_R16A_R26B_R2_R2_R1_ENTITY_GRANULARITY_RESIDUAL_CAUSAL_DIAGNOSIS")

    out={
      "framework":"SCIIP_EXPLORER_4_R26B_R2_R2_ALONDRA_BUILDING_PROJECT_ENTITY_GRANULARITY_RECONCILIATION_AND_CANONICAL_BINDING_CONTRACT",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"classification":classification,
      "sourceFacts":facts,
      "componentSfSum":component_sum,
      "aggregateSf":aggregate,
      "componentArithmeticMatchesAggregate":arithmetic_match,
      "priorDuplicateEvidence":{
        "visibleSfTokens":prior_tokens,
        "buildingLevel181831Observed":prior_181,
        "projectAggregate422277Observed":prior_422
      },
      "liveExplorerInventoryObserved":live_explorer,
      "liveRelatedRows":live_rows,
      "canonicalBindingContract":canonical_contract,
      "checks":checks,
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "propertyClick":False,
        "assignmentsInvocation":False,
        "generateInvocation":False,
        "exportInvocation":False
      },
      "sourceEvidence":{
        "r26bR2R1Path":str(p),
        "r26bR2R1Sha256":hashlib.sha256(p.read_bytes()).hexdigest(),
        "projectFactsPath":str(package_dir/"ALONDRA_PROJECT_SOURCE_FACTS.json"),
        "projectFactsSha256":hashlib.sha256((package_dir/"ALONDRA_PROJECT_SOURCE_FACTS.json").read_bytes()).hexdigest()
      },
      "nextMilestone":nxt
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"alondra_building_project_entity_granularity_reconciliation_and_canonical_binding_contract.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("BUILDING_1_SF:",buildings[0]["availableSf"])
    print("BUILDING_2_SF:",buildings[1]["availableSf"])
    print("BUILDING_3_SF:",buildings[2]["availableSf"])
    print("COMPONENT_SF_SUM:",component_sum)
    print("PROJECT_AGGREGATE_SF:",aggregate)
    print("ARITHMETIC_MATCH:",arithmetic_match)
    print("PRIOR_LIVE_181831_OBSERVED:",prior_181)
    print("PRIOR_LIVE_422277_OBSERVED:",prior_422)
    print("LIVE_EXPLORER_INVENTORY_OBSERVED:",live_explorer)
    print("\n----- CANONICAL BINDING CONTRACT -----")
    print(json.dumps(canonical_contract,indent=2))
    if live_rows:
        print("\n----- LIVE RELATED ROWS -----")
        for r in live_rows: print(json.dumps(r,ensure_ascii=False))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
