#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,socket,base64,os,struct,time

M="M4_19D4BN17C_R4_R12_R16A_R22A_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_PREAUTHORIZATION_AND_TARGET_QUALIFICATION"
PREV="M4_19D4BN17C_R4_R12_R16A_R22_EXPORT_BOUNDED_MICRO_COHORT_EXPANSION_READINESS_AND_DESIGN"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def get(url):
    try:
        with urllib.request.urlopen(url,timeout=3) as r:
            return r.read().decode("utf-8","ignore")
    except:
        return None

def targets(port=9333):
    try:
        return json.loads(get(f"http://127.0.0.1:{port}/json") or "[]")
    except:
        return []

def new_target(url,port=9333):
    # Chrome CDP may support PUT /json/new?url
    req=urllib.request.Request(f"http://127.0.0.1:{port}/json/new?{urllib.parse.quote(url,safe=':/?=&')}",method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=3) as r:
            return json.loads(r.read().decode())
    except Exception:
        return None

class WS:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        if not m:
            raise RuntimeError(f"bad websocket url: {u!r}")
        host,port,path=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((host,port),timeout=5)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode())
        b=b""
        while b"\r\n\r\n" not in b:
            b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]:
            raise RuntimeError("websocket handshake failed")
        self.i=0

    def send(self,obj):
        payload=json.dumps(obj).encode()
        mask=os.urandom(4); n=len(payload)
        h=bytearray([0x81])
        if n<126:
            h.append(0x80|n)
        elif n<65536:
            h.extend([0x80|126]); h.extend(struct.pack("!H",n))
        else:
            h.extend([0x80|127]); h.extend(struct.pack("!Q",n))
        masked=bytes(b^mask[i%4] for i,b in enumerate(payload))
        self.s.sendall(bytes(h)+mask+masked)

    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        b1,b2=h; n=b2&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b2&128 else None
        data=b""
        while len(data)<n:
            data+=self.s.recv(n-len(data))
        if mask:
            data=bytes(b^mask[i%4] for i,b in enumerate(data))
        if (b1&15)==1:
            try:return json.loads(data.decode())
            except:return None
        return None

    def call(self,method,params=None):
        self.i+=1; i=self.i
        self.send({"id":i,"method":method,"params":params or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:
                return x

def ev(w,expr):
    r=w.call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result") or {}).get("result") or {}).get("value")

def click_exact_button(w,text):
    q=json.dumps(text)
    return ev(w,f"""(() => {{
      const xs=[...document.querySelectorAll('button')].filter(el =>
        el.offsetParent!==null && !el.disabled &&
        (el.innerText||el.textContent||'').trim()==={q}
      );
      if(xs.length!==1) return {{clicked:false,count:xs.length,reason:'EXACT_CONTROL_NOT_UNIQUE'}};
      xs[0].click();
      return {{clicked:true,count:1,text:{q}}};
    }})()""") or {}

def body_has(w,text):
    q=json.dumps(text)
    return bool(ev(w,f"(() => (document.body?.innerText||'').includes({q}))()"))

def exact_button_info(w,text):
    q=json.dumps(text)
    return ev(w,f"""(() => {{
      const xs=[...document.querySelectorAll('button')].filter(el =>
        el.offsetParent!==null &&
        (el.innerText||el.textContent||'').trim()==={q}
      );
      return {{
        count:xs.length,
        controls:xs.map((el,i)=>{{
          const propsKey=Object.keys(el).find(k=>k.startsWith('__reactProps$'));
          const props=propsKey?el[propsKey]:null;
          const f=props&&props.onClick;
          return {{
            i,text:(el.innerText||el.textContent||'').trim(),
            disabled:!!el.disabled,visible:true,cls:String(el.className||''),
            hasOnClick:typeof f==='function',
            handlerName:typeof f==='function'?(f.name||'anonymous'):null,
            handlerLength:typeof f==='function'?f.length:null
          }};
        }})
      }};
    }})()""") or {}

def close_target(w):
    try:
        w.call("Page.close")
        return True
    except:
        return False

def main():
    import urllib.parse
    globals()["urllib"].parse = urllib.parse

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"

    pp=evid/PREV/"export_bounded_micro_cohort_expansion_readiness_and_design.json"
    if not pp.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R22_EVIDENCE_REQUIRED")
        return 4

    prev=loadj(pp)
    expected="SINGLE_RECORD_EXPORT_CLOSED_EXACT_THREE_RECORD_BOUNDED_EXPANSION_POLICY_CERTIFIED"
    if prev.get("status")!="PASSED" or prev.get("classification")!=expected:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R22_BOUNDED_EXPANSION_POLICY_CERTIFICATION_REQUIRED")
        return 5

    # Source-level contracts must still be present before any qualification UI actions.
    owner=app/"src/broker-product/ListingAssignmentProductionHouse.jsx"
    report=app/"src/broker-product/InstitutionalReportReview.jsx"
    broker=app/"src/broker-product/SCIIPBrokerApp.jsx"

    source_contracts={
        "brokerAssignmentsNavBinding":False,
        "generateReportBinding":False,
        "reportReviewMountGate":False,
        "downloadReportBinding":False
    }

    if broker.exists():
        s=broker.read_text(errors="ignore")
        source_contracts["brokerAssignmentsNavBinding"]=bool(
            re.search(r'Assignments',s) and re.search(r'setNav',s)
        )
    if owner.exists():
        s=owner.read_text(errors="ignore")
        source_contracts["generateReportBinding"]=bool(re.search(
            r'Generate Client Listing Report',s,re.I
        ) and re.search(r'setShowReportReview\s*\(\s*true\s*\)',s))
        source_contracts["reportReviewMountGate"]=bool(re.search(
            r'showReportReview\s*&&[\s\S]{0,3000}<InstitutionalReportReview\b',s,re.I
        ))
    if report.exists():
        s=report.read_text(errors="ignore")
        source_contracts["downloadReportBinding"]=bool(
            re.search(r'Download Client Listing Report',s,re.I) and
            re.search(r'onClick\s*=\s*\{\s*exportReport\s*\}',s)
        )

    if not all(source_contracts.values()):
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CERTIFIED_SOURCE_EXPORT_PATH_CONTRACTS_NOT_PRESERVED")
        print("SOURCE_CONTRACTS:",json.dumps(source_contracts))
        return 6

    # Must have an already-running certified browser context.
    pages=[t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    if not pages:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED")
        return 7

    base_url="http://127.0.0.1:5173/"
    outcomes=[]
    halted=False

    for idx,record in enumerate(COHORT,1):
        # Create a fresh page target in the SAME browser context.
        nt=new_target(base_url)
        if not nt or not nt.get("webSocketDebuggerUrl"):
            outcomes.append({
                "record":record,"freshTargetCreated":False,
                "qualified":False,"failure":"FRESH_TARGET_CREATION_FAILED"
            })
            halted=True
            break

        w=WS(nt["webSocketDebuggerUrl"])
        w.call("Runtime.enable")
        w.call("Page.enable")
        time.sleep(.6)

        outcome={
            "record":record,
            "freshTargetCreated":True,
            "selectedPropertyCertified":False,
            "assignmentsEntryCertified":False,
            "generateControlCertified":False,
            "reportReviewEntryCertified":False,
            "exportControlCertified":False,
            "liveHandlerCertified":False,
            "qualified":False
        }

        # Search/select record using exact visible button text containment.
        recq=json.dumps(record)
        selection=ev(w,f"""(() => {{
          const all=[...document.querySelectorAll('button')].filter(el=>el.offsetParent!==null&&!el.disabled);
          const exact=all.filter(el=>(el.innerText||el.textContent||'').trim().includes({recq}));
          if(exact.length===0) return {{clicked:false,count:0}};
          exact.sort((a,b)=>((a.innerText||'').length-(b.innerText||'').length));
          exact[0].click();
          return {{clicked:true,count:exact.length,text:(exact[0].innerText||'').trim().slice(0,500)}};
        }})()""") or {}
        outcome["selectionAction"]=selection
        time.sleep(.6)
        outcome["selectedPropertyCertified"]=body_has(w,record)

        if not outcome["selectedPropertyCertified"]:
            outcome["failure"]="SELECTED_PROPERTY_READBACK_FAILED"
            outcomes.append(outcome); close_target(w); halted=True; break

        # Enter Assignments workspace.
        assignments=click_exact_button(w,"Assignments")
        outcome["assignmentsAction"]=assignments
        time.sleep(.6)
        outcome["assignmentsEntryCertified"]=bool(assignments.get("clicked")) and (
            body_has(w,"Client production house") or body_has(w,"Brookfield")
        )

        if not outcome["assignmentsEntryCertified"]:
            outcome["failure"]="ASSIGNMENTS_ENTRY_FAILED"
            outcomes.append(outcome); close_target(w); halted=True; break

        # Generate-report control must uniquely materialize.
        gen=exact_button_info(w,"Generate Client Listing Report")
        outcome["generateControl"]=gen
        outcome["generateControlCertified"]=(
            gen.get("count")==1 and
            not (gen.get("controls") or [{}])[0].get("disabled")
        )

        if not outcome["generateControlCertified"]:
            outcome["failure"]="GENERATE_CONTROL_NOT_QUALIFIED"
            outcomes.append(outcome); close_target(w); halted=True; break

        # Enter report review. Qualification authority allows this state transition,
        # but DOES NOT allow Export invocation.
        gen_click=click_exact_button(w,"Generate Client Listing Report")
        outcome["reportReviewAction"]=gen_click
        time.sleep(.6)
        outcome["reportReviewEntryCertified"]=bool(gen_click.get("clicked")) and (
            body_has(w,"Review Client Listing Report") or body_has(w,"Institutional Reporting Engine")
        )

        if not outcome["reportReviewEntryCertified"]:
            outcome["failure"]="REPORT_REVIEW_ENTRY_FAILED"
            outcomes.append(outcome); close_target(w); halted=True; break

        # Exact Export control and live handler parity.
        exp=exact_button_info(w,"Download Client Listing Report")
        outcome["exportControl"]=exp
        controls=exp.get("controls") or []
        outcome["exportControlCertified"]=(
            exp.get("count")==1 and
            len(controls)==1 and
            controls[0].get("visible") and
            not controls[0].get("disabled")
        )
        outcome["liveHandlerCertified"]=(
            len(controls)==1 and
            controls[0].get("hasOnClick") and
            controls[0].get("handlerName")=="exportReport"
        )

        outcome["qualified"]=all([
            outcome["freshTargetCreated"],
            outcome["selectedPropertyCertified"],
            outcome["assignmentsEntryCertified"],
            outcome["generateControlCertified"],
            outcome["reportReviewEntryCertified"],
            outcome["exportControlCertified"],
            outcome["liveHandlerCertified"]
        ])

        if not outcome["qualified"]:
            outcome["failure"]="EXPORT_TARGET_QUALIFICATION_FAILED"
            outcomes.append(outcome); close_target(w); halted=True; break

        outcome["failure"]=None
        outcomes.append(outcome)
        close_target(w)
        time.sleep(.25)

    all_three=len(outcomes)==3 and all(x.get("qualified") for x in outcomes)

    checks={
        "r22Passed":prev.get("status")=="PASSED",
        "r22PolicyClassificationConsumed":True,
        "sourceExportPathContractsPreserved":all(source_contracts.values()),
        "certifiedBrowserContextAvailable":True,
        "freshPagePerRecordPolicyUsed":all(x.get("freshTargetCreated") for x in outcomes) if outcomes else False,
        "samePageReuseAcrossRecords":False,
        "freshIsolatedBrowserPerRecord":False,
        "strictSequentialObserved":True,
        "haltOnFirstFailureObserved":True,
        "allExecutedSelectedPropertiesCertified":all(x.get("selectedPropertyCertified") for x in outcomes) if outcomes else False,
        "allExecutedAssignmentsEntriesCertified":all(x.get("assignmentsEntryCertified") for x in outcomes) if outcomes else False,
        "allExecutedGenerateControlsCertified":all(x.get("generateControlCertified") for x in outcomes) if outcomes else False,
        "allExecutedReportReviewEntriesCertified":all(x.get("reportReviewEntryCertified") for x in outcomes) if outcomes else False,
        "allExecutedExportControlsCertified":all(x.get("exportControlCertified") for x in outcomes) if outcomes else False,
        "allExecutedLiveHandlersCertified":all(x.get("liveHandlerCertified") for x in outcomes) if outcomes else False,
        "allThreeTargetsQualified":all_three,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    if all_three:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R16A_R22A_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_PREAUTHORIZED"
        cls="EXACT_THREE_RECORD_EXPORT_TARGETS_QUALIFIED_AND_PREAUTHORIZED_FOR_BOUNDED_LIVE_EXECUTION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_LIVE_MICRO_COHORT_CERTIFICATION"
    else:
        status="DIAGNOSTIC_COMPLETE"
        state="M419D4BN17C_R4_R12_R16A_R22A_TARGET_QUALIFICATION_INCOMPLETE"
        cls="EXACT_THREE_RECORD_EXPORT_TARGET_QUALIFICATION_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R22A_R1_EXPORT_TARGET_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

    out=evid/M
    out.mkdir(parents=True,exist_ok=True)
    ef=out/"exact_three_record_export_micro_cohort_preauthorization_and_target_qualification.json"

    data={
        "framework":"SCIIP_EXPLORER_4_R22A_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_PREAUTHORIZATION_AND_TARGET_QUALIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":state,
        "classification":cls,
        "cohort":COHORT,
        "sourceContracts":source_contracts,
        "outcomes":outcomes,
        "qualifiedCount":sum(1 for x in outcomes if x.get("qualified")),
        "haltedOnFailure":halted,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "selectionAuthority":True,
            "assignmentsEntryAuthority":True,
            "reportReviewEntryAuthority":True,
            "exportInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22A Exact Three-Record Export Micro-Cohort Preauthorization + Target Qualification")
    print("="*120)
    print("R22_CLASSIFICATION:",prev.get("classification"))
    print("COHORT_SIZE:",len(COHORT))
    print("CERTIFIED_BROWSER_CONTEXT: PRESERVED")
    print("FRESH_PAGE_PER_RECORD: True")
    print("STRICT_SEQUENTIAL: True")
    print("HALT_ON_FIRST_FAILURE: True")
    print("EXPORT_INVOCATION: OFF")

    for i,x in enumerate(outcomes,1):
        print(f"\n[{i}/{len(COHORT)}] {x['record']}")
        print("freshTargetCreated:",x.get("freshTargetCreated"))
        print("selectedPropertyCertified:",x.get("selectedPropertyCertified"))
        print("assignmentsEntryCertified:",x.get("assignmentsEntryCertified"))
        print("generateControlCertified:",x.get("generateControlCertified"))
        print("reportReviewEntryCertified:",x.get("reportReviewEntryCertified"))
        print("exportControlCertified:",x.get("exportControlCertified"))
        print("liveHandlerCertified:",x.get("liveHandlerCertified"))
        print("qualified:",x.get("qualified"))
        print("failure:",x.get("failure"))

    print("\n----- CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("QUALIFIED:",sum(1 for x in outcomes if x.get("qualified")),"/3")
    print("HALTED_ON_FAILURE:",halted)
    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
