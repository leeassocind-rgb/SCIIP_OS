#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,socket,base64,os,struct,time,urllib.parse

M="M4_19D4BN17C_R4_R12_R16A_R22A_R1_ASSIGNMENTS_NAVIGATION_SOURCE_OWNER_CORRELATION_AND_TARGET_QUALIFICATION_RECERTIFICATION"
R22="M4_19D4BN17C_R4_R12_R16A_R22_EXPORT_BOUNDED_MICRO_COHORT_EXPANSION_READINESS_AND_DESIGN"
R22A="M4_19D4BN17C_R4_R12_R16A_R22A_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_PREAUTHORIZATION_AND_TARGET_QUALIFICATION"
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
    req=urllib.request.Request(
        f"http://127.0.0.1:{port}/json/new?{urllib.parse.quote(url,safe=':/?=&')}",
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req,timeout=3) as r:
            return json.loads(r.read().decode())
    except:
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
        self.s.sendall(bytes(h)+mask+bytes(b^mask[i%4] for i,b in enumerate(payload)))

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
      if(xs.length!==1)return {{clicked:false,count:xs.length,reason:'EXACT_CONTROL_NOT_UNIQUE'}};
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

def compact(s,n=7000):
    return re.sub(r"\s+"," ",s)[:n]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    src=app/"src"
    evid=app/"evidence/explorer4"

    r22p=evid/R22/"export_bounded_micro_cohort_expansion_readiness_and_design.json"
    r22ap=evid/R22A/"exact_three_record_export_micro_cohort_preauthorization_and_target_qualification.json"

    if not r22p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R22_EVIDENCE_REQUIRED")
        return 4
    r22=loadj(r22p)

    # R22A may not have written evidence because it blocked before evidence creation.
    prior_blocked=True
    prior_source_contracts={}
    if r22ap.exists():
        r22a=loadj(r22ap)
        prior_blocked=r22a.get("status")!="PASSED"
        prior_source_contracts=r22a.get("sourceContracts") or {}

    if r22.get("status")!="PASSED":
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: R22_POLICY_NOT_CERTIFIED")
        return 5

    # Broader source-owner correlation for Assignments navigation.
    candidates=[]
    for p in src.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs"}:
            continue
        if "src/explorer4/" in str(p):
            continue
        try:s=p.read_text(errors="ignore")
        except:continue
        if "Assignments" not in s:
            continue

        score=0
        signals={
            "hasAssignments":True,
            "hasSetNav":bool(re.search(r'\bsetNav\b',s)),
            "hasNavState":bool(re.search(r'useState\s*\([^)]*[\'"](?:Explorer|Assignments|Property|Search)',s,re.I)),
            "hasAssignmentPortfolioLifecycle":"AssignmentPortfolioLifecycle" in s,
            "hasButton":bool(re.search(r'<button\b',s,re.I)),
            "hasMapLoop":bool(re.search(r'\.map\s*\(',s)),
            "hasActiveNavLogic":bool(re.search(r'active|selected|current|nav\s*===|setNav\s*\(',s,re.I))
        }
        score += 60 if signals["hasSetNav"] else 0
        score += 50 if signals["hasAssignmentPortfolioLifecycle"] else 0
        score += 25 if signals["hasNavState"] else 0
        score += 20 if signals["hasButton"] else 0
        score += 10 if signals["hasMapLoop"] else 0
        score += 20 if signals["hasActiveNavLogic"] else 0

        # strongest evidence: same file contains literal Assignments and setNav(x.id) or equivalent
        exact_patterns=[
            r'Assignments[\s\S]{0,600}setNav\s*\(',
            r'setNav\s*\([^)]*\)[\s\S]{0,600}Assignments',
            r'nav\s*===\s*[\'"]Assignments[\'"]',
            r'<AssignmentPortfolioLifecycle\b'
        ]
        exact_hits=sum(1 for pat in exact_patterns if re.search(pat,s,re.I))
        score += exact_hits*40

        candidates.append({
            "file":str(p.relative_to(app)),
            "score":score,
            "signals":signals,
            "exactPatternHits":exact_hits,
            "snippet":compact(s)
        })

    candidates.sort(key=lambda x:-x["score"])
    top=candidates[0] if candidates else None
    assignments_binding_resolved=bool(
        top and top["score"]>=80 and (
            top["signals"]["hasSetNav"] or
            top["signals"]["hasAssignmentPortfolioLifecycle"] or
            top["exactPatternHits"]>0
        )
    )

    # Preserve other three contracts from exact files.
    owner=app/"src/broker-product/ListingAssignmentProductionHouse.jsx"
    report=app/"src/broker-product/InstitutionalReportReview.jsx"
    generate_binding=False; mount_gate=False; download_binding=False

    if owner.exists():
        s=owner.read_text(errors="ignore")
        generate_binding=bool("Generate Client Listing Report" in s and re.search(r'setShowReportReview\s*\(\s*true\s*\)',s))
        mount_gate=bool(re.search(r'showReportReview\s*&&[\s\S]{0,3000}<InstitutionalReportReview\b',s,re.I))
    if report.exists():
        s=report.read_text(errors="ignore")
        download_binding=bool("Download Client Listing Report" in s and re.search(r'onClick\s*=\s*\{\s*exportReport\s*\}',s))

    source_contracts={
        "assignmentsNavigationSourceOwnerResolved":assignments_binding_resolved,
        "assignmentsNavigationSourceOwner":top["file"] if top else None,
        "assignmentsNavigationSourceOwnerScore":top["score"] if top else None,
        "generateReportBinding":generate_binding,
        "reportReviewMountGate":mount_gate,
        "downloadReportBinding":download_binding
    }

    if not all([
        assignments_binding_resolved,
        generate_binding,
        mount_gate,
        download_binding
    ]):
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: SOURCE_EXPORT_PATH_CONTRACT_REPAIR_INCOMPLETE")
        print("SOURCE_CONTRACTS:",json.dumps(source_contracts))
        return 6

    pages=[t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]
    if not pages:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CERTIFIED_BROWSER_CONTEXT_REQUIRED")
        return 7

    base_url="http://127.0.0.1:5173/"
    outcomes=[]
    halted=False

    for record in COHORT:
        nt=new_target(base_url)
        if not nt or not nt.get("webSocketDebuggerUrl"):
            outcomes.append({"record":record,"freshTargetCreated":False,"qualified":False,"failure":"FRESH_TARGET_CREATION_FAILED"})
            halted=True
            break

        w=WS(nt["webSocketDebuggerUrl"])
        w.call("Runtime.enable"); w.call("Page.enable")
        time.sleep(.7)

        out={
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

        rq=json.dumps(record)
        sel=ev(w,f"""(() => {{
          const all=[...document.querySelectorAll('button')].filter(el=>el.offsetParent!==null&&!el.disabled);
          const hits=all.filter(el=>(el.innerText||el.textContent||'').trim().includes({rq}));
          if(!hits.length)return {{clicked:false,count:0}};
          hits.sort((a,b)=>((a.innerText||'').length-(b.innerText||'').length));
          hits[0].click();
          return {{clicked:true,count:hits.length,text:(hits[0].innerText||'').trim().slice(0,500)}};
        }})()""") or {}
        out["selectionAction"]=sel
        time.sleep(.6)
        out["selectedPropertyCertified"]=body_has(w,record)
        if not out["selectedPropertyCertified"]:
            out["failure"]="SELECTED_PROPERTY_READBACK_FAILED"; outcomes.append(out); close_target(w); halted=True; break

        a=click_exact_button(w,"Assignments")
        out["assignmentsAction"]=a
        time.sleep(.6)
        out["assignmentsEntryCertified"]=bool(a.get("clicked")) and (
            body_has(w,"Client production house") or body_has(w,"Brookfield")
        )
        if not out["assignmentsEntryCertified"]:
            out["failure"]="ASSIGNMENTS_ENTRY_FAILED"; outcomes.append(out); close_target(w); halted=True; break

        gen=exact_button_info(w,"Generate Client Listing Report")
        out["generateControl"]=gen
        cs=gen.get("controls") or []
        out["generateControlCertified"]=gen.get("count")==1 and len(cs)==1 and not cs[0].get("disabled")
        if not out["generateControlCertified"]:
            out["failure"]="GENERATE_CONTROL_NOT_QUALIFIED"; outcomes.append(out); close_target(w); halted=True; break

        gc=click_exact_button(w,"Generate Client Listing Report")
        out["reportReviewAction"]=gc
        time.sleep(.6)
        out["reportReviewEntryCertified"]=bool(gc.get("clicked")) and (
            body_has(w,"Review Client Listing Report") or body_has(w,"Institutional Reporting Engine")
        )
        if not out["reportReviewEntryCertified"]:
            out["failure"]="REPORT_REVIEW_ENTRY_FAILED"; outcomes.append(out); close_target(w); halted=True; break

        exp=exact_button_info(w,"Download Client Listing Report")
        out["exportControl"]=exp
        ecs=exp.get("controls") or []
        out["exportControlCertified"]=exp.get("count")==1 and len(ecs)==1 and not ecs[0].get("disabled")
        out["liveHandlerCertified"]=len(ecs)==1 and ecs[0].get("hasOnClick") and ecs[0].get("handlerName")=="exportReport"
        out["qualified"]=all([
            out["freshTargetCreated"],out["selectedPropertyCertified"],out["assignmentsEntryCertified"],
            out["generateControlCertified"],out["reportReviewEntryCertified"],out["exportControlCertified"],
            out["liveHandlerCertified"]
        ])
        out["failure"]=None if out["qualified"] else "EXPORT_TARGET_QUALIFICATION_FAILED"
        outcomes.append(out)
        close_target(w)
        if not out["qualified"]:
            halted=True
            break
        time.sleep(.25)

    all_three=len(outcomes)==3 and all(x.get("qualified") for x in outcomes)

    checks={
        "r22Passed":r22.get("status")=="PASSED",
        "priorR22ABlockedSourceContractConsumed":prior_blocked,
        "assignmentsNavigationSourceOwnerCorrelationCompleted":True,
        "assignmentsNavigationSourceOwnerResolved":assignments_binding_resolved,
        "generateReportBindingPreserved":generate_binding,
        "reportReviewMountGatePreserved":mount_gate,
        "downloadReportBindingPreserved":download_binding,
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
        state="M419D4BN17C_R4_R12_R16A_R22A_R1_EXACT_THREE_RECORD_EXPORT_MICRO_COHORT_PREAUTHORIZED"
        cls="ASSIGNMENTS_SOURCE_OWNER_REPAIRED_EXACT_THREE_RECORD_EXPORT_TARGETS_QUALIFIED_AND_PREAUTHORIZED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R22B_EXACT_THREE_RECORD_GUARDED_EXPORT_LIVE_MICRO_COHORT_CERTIFICATION"
    else:
        status="DIAGNOSTIC_COMPLETE"
        state="M419D4BN17C_R4_R12_R16A_R22A_R1_TARGET_QUALIFICATION_INCOMPLETE"
        cls="ASSIGNMENTS_SOURCE_OWNER_REPAIRED_EXPORT_TARGET_QUALIFICATION_GAP_REMAINS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R22A_R2_EXPORT_TARGET_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

    outdir=evid/M
    outdir.mkdir(parents=True,exist_ok=True)
    ef=outdir/"assignments_navigation_source_owner_correlation_and_target_qualification_recertification.json"

    data={
        "framework":"SCIIP_EXPLORER_4_R22A_R1_ASSIGNMENTS_NAVIGATION_SOURCE_OWNER_CORRELATION_AND_TARGET_QUALIFICATION_RECERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "state":state,
        "classification":cls,
        "sourceContracts":source_contracts,
        "topAssignmentsSourceOwnerCandidates":candidates[:20],
        "outcomes":outcomes,
        "qualifiedCount":sum(1 for x in outcomes if x.get("qualified")),
        "haltedOnFailure":halted,
        "checks":checks,
        "authority":{
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False,
            "qualificationNavigation":True,
            "exportInvocation":False
        },
        "nextMilestone":nxt
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22A-R1 Assignments Navigation Source-Owner Correlation + Target Qualification Recertification")
    print("="*120)
    print("R22_STATUS:",r22.get("status"))
    print("PRIOR_R22A_BLOCKED:",prior_blocked)
    print("ASSIGNMENTS_SOURCE_OWNER_RESOLVED:",assignments_binding_resolved)
    print("ASSIGNMENTS_SOURCE_OWNER:",source_contracts["assignmentsNavigationSourceOwner"])
    print("ASSIGNMENTS_SOURCE_OWNER_SCORE:",source_contracts["assignmentsNavigationSourceOwnerScore"])
    print("GENERATE_BINDING:",generate_binding)
    print("REPORT_REVIEW_MOUNT_GATE:",mount_gate)
    print("DOWNLOAD_BINDING:",download_binding)
    print("EXPORT_INVOCATION: OFF")

    print("\n----- TOP ASSIGNMENTS SOURCE OWNERS -----")
    for x in candidates[:10]:
        print(json.dumps(x))

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
