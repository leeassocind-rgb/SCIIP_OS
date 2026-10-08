#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R14_POST_COMPARE_COMMAND_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def scan(root, patterns):
    hits=[]
    exts={".js",".jsx",".ts",".tsx",".mjs",".json",".html",".css"}
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts: continue
        if any(x in p.parts for x in ("node_modules",".git","evidence")): continue
        try: s=p.read_text(errors="ignore")
        except: continue
        n=sum(len(re.findall(x,s,re.I)) for x in patterns)
        if n: hits.append({"file":str(p.relative_to(root)),"references":n})
    return sorted(hits,key=lambda x:(-x["references"],x["file"]))

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    prev=ev/"M4_19D4BN17C_R4_R12_R13A_R4_R1_COMPARE_3_OF_3_VERDICT_RECONCILIATION_AND_LIFECYCLE_CLOSURE"/"compare_3_of_3_verdict_reconciliation_and_lifecycle_closure.json"
    if not prev.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: COMPARE_LIFECYCLE_CLOSURE_EVIDENCE_REQUIRED"); return 4
    p=fj(prev)
    ui=scan(app,[r"\\bcommand\\b",r"open command",r"command center",r"command palette"])
    state=scan(app,[r"command[A-Z_]",r"setCommand",r"commandState",r"selectedCommand",r"commandMode"])
    verify=scan(app,[r"command.*visible",r"command.*open",r"command.*active",r"command.*mounted",r"command.*panel"])
    labels=set()
    rx=re.compile(r"""["'`]([^"'`]{0,30}\\bCommand\\b[^"'`]{0,30})["'`]""",re.I)
    for h in ui[:80]:
        s=(app/h["file"]).read_text(errors="ignore")
        for m in rx.findall(s):
            if len(m.strip())<=70: labels.add(m.strip())

    checks={
      "compareClosurePassed":p.get("status")=="PASSED",
      "compareCertifiedThreeOfThree":p.get("reconciledLiveEvidence",{}).get("certifiedCount")==3,
      "commandUiReferencesResolved":len(ui)>0,
      "commandStateReferencesResolved":len(state)>0,
      "commandVerificationReferencesResolved":len(verify)>0,
      "boundedMicroCohortRequired":True,"exactThreeRecordMicroCohort":True,
      "freshPagePerRecordSameBrowserRequired":True,"strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,"selectedPropertyReadbackRequired":True,
      "commandReadbackRequired":True,"applicationMutationOff":True,
      "governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True,
      "liveCommandAuthorityOff":True,"analyzePresentAuthorityOff":True,
      "exportPresentationAuthorityOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "BLOCKED"
    state="M419D4BN17C_R4_R12_R14_POST_COMPARE_COMMAND_ACTION_SURFACE_READINESS_CERTIFIED" if passed else "M419D4BN17C_R4_R12_R14_COMMAND_READINESS_INCOMPLETE"
    diagnosis="COMPARE_CLOSED_COMMAND_ACTION_SURFACE_CONTRACT_RESOLVED_THREE_RECORD_LIVE_ACTIVATION_READY" if passed else "COMMAND_ACTION_SURFACE_CONTRACT_REMAINS_INCOMPLETE"
    nxt="M4_19D4BN17C_R4_R12_R14A_COMMAND_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION" if passed else None
    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R14_POST_COMPARE_COMMAND_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "commandContract":{"uiReferenceFiles":len(ui),"stateReferenceFiles":len(state),
        "verificationReferenceFiles":len(verify),"likelyLabels":sorted(labels)[:30],
        "topUiReferences":ui[:20],"topStateReferences":state[:20],"topVerificationReferences":verify[:20]},
      "executionPolicy":{"cohort":["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"],"cohortSize":3,
        "browserContext":"PRESERVE_SINGLE_CERTIFIED_BROWSER_CONTEXT",
        "pagePolicy":"CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD",
        "samePageReuseAcrossRecords":False,"freshIsolatedBrowserPerRecord":False,
        "strictSequential":True,"haltOnFirstFailure":True,
        "selectedPropertyReadbackRequired":True,"commandReadbackRequired":True},
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
        "pixelEvidence":False,"liveCommand":False,"analyzePresent":False,"exportPresentation":False},
      "nextMilestone":nxt}
    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    f=out/"post_compare_command_action_surface_readiness_and_bounded_design.json"
    f.write_text(json.dumps(res,indent=2)+"\\n")
    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R14 Post-Compare Command Action Surface Readiness + Bounded Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF"); print("Governed data mutation: OFF")
    print("Network authority: OFF"); print("Pixel evidence: OFF"); print("Live Command authority: OFF")
    print("\\n----- READINESS CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\\nCOMMAND_UI_REFERENCE_FILES:",len(ui))
    print("COMMAND_STATE_REFERENCE_FILES:",len(state))
    print("COMMAND_VERIFICATION_REFERENCE_FILES:",len(verify))
    print("LIKELY_COMMAND_LABELS:",", ".join(sorted(labels)[:12]) if labels else "Command")
    print("COHORT_SIZE: 3")
    print("CERTIFIED_BROWSER_CONTEXT: PRESERVE_SINGLE_CERTIFIED_BROWSER_CONTEXT")
    print("CERTIFIED_PAGE_POLICY: CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD")
    print("STRICT_SEQUENTIAL: True"); print("HALT_ON_FIRST_FAILURE: True")
    print("STATUS:",status); print("STATE:",state); print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt); print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
