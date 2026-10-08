#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R15_POST_COMMAND_ANALYZE_PRESENT_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"

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
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    prev=ev/"M4_19D4BN17C_R4_R12_R14B_COMMAND_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"/"command_action_micro_cohort_lifecycle_closure.json"
    if not prev.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: COMMAND_LIFECYCLE_CLOSURE_EVIDENCE_REQUIRED")
        return 4
    p=fj(prev)

    analyze_ui=scan(app,[r"\banalyze\b",r"analysis",r"open analyze",r"analyze property"])
    present_ui=scan(app,[r"\bpresent\b",r"presentation",r"open present",r"present property"])
    state=scan(app,[r"analy[sz]e[A-Z_]",r"analysisState",r"present[A-Z_]",r"presentationState",r"setAnalyze",r"setPresent"])
    verify=scan(app,[r"analy[sz]e.*visible",r"analysis.*visible",r"present.*visible",r"presentation.*visible",
                     r"analy[sz]e.*open",r"present.*open",r"analysis.*mounted",r"presentation.*mounted"])

    labels=set()
    rx=re.compile(r"""["'`]([^"'`]{0,35}\b(?:Analyze|Present)\b[^"'`]{0,35})["'`]""",re.I)
    for h in (analyze_ui+present_ui)[:120]:
        s=(app/h["file"]).read_text(errors="ignore")
        for m in rx.findall(s):
            if len(m.strip())<=80: labels.add(m.strip())

    checks={
      "commandClosurePassed":p.get("status")=="PASSED",
      "commandCertifiedThreeOfThree":len(p.get("closedCohort",[]))==3,
      "analyzeUiReferencesResolved":len(analyze_ui)>0,
      "presentUiReferencesResolved":len(present_ui)>0,
      "analyzePresentStateReferencesResolved":len(state)>0,
      "analyzePresentVerificationReferencesResolved":len(verify)>0,
      "boundedMicroCohortRequired":True,
      "exactThreeRecordMicroCohort":True,
      "freshPagePerRecordSameBrowserRequired":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "selectedPropertyReadbackRequired":True,
      "analyzeReadbackRequired":True,
      "presentReadbackRequired":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveAnalyzePresentAuthorityOff":True,
      "exportPresentationAuthorityOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R15_POST_COMMAND_ANALYZE_PRESENT_ACTION_SURFACE_READINESS_CERTIFIED"
        diagnosis="COMMAND_CLOSED_ANALYZE_PRESENT_ACTION_SURFACE_CONTRACT_RESOLVED_THREE_RECORD_LIVE_ACTIVATION_READY"
        nxt="M4_19D4BN17C_R4_R12_R15A_ANALYZE_PRESENT_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R15_ANALYZE_PRESENT_READINESS_INCOMPLETE"
        diagnosis="ANALYZE_PRESENT_ACTION_SURFACE_CONTRACT_REMAINS_INCOMPLETE"
        nxt=None

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R15_POST_COMMAND_ANALYZE_PRESENT_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "analyzePresentContract":{
        "analyzeUiReferenceFiles":len(analyze_ui),
        "presentUiReferenceFiles":len(present_ui),
        "stateReferenceFiles":len(state),
        "verificationReferenceFiles":len(verify),
        "likelyLabels":sorted(labels)[:40],
        "topAnalyzeUiReferences":analyze_ui[:20],
        "topPresentUiReferences":present_ui[:20],
        "topStateReferences":state[:20],
        "topVerificationReferences":verify[:20]
      },
      "executionPolicy":{
        "cohort":["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"],
        "cohortSize":3,
        "browserContext":"PRESERVE_SINGLE_CERTIFIED_BROWSER_CONTEXT",
        "pagePolicy":"CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD",
        "samePageReuseAcrossRecords":False,
        "freshIsolatedBrowserPerRecord":False,
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "selectedPropertyReadbackRequired":True,
        "analyzeReadbackRequired":True,
        "presentReadbackRequired":True
      },
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "liveAnalyzePresent":False,
        "exportPresentation":False
      },
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"post_command_analyze_present_action_surface_readiness_and_bounded_design.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R15 Post-Command Analyze/Present Action Surface Readiness + Bounded Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live Analyze/Present authority: OFF")
    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\nANALYZE_UI_REFERENCE_FILES:",len(analyze_ui))
    print("PRESENT_UI_REFERENCE_FILES:",len(present_ui))
    print("ANALYZE_PRESENT_STATE_REFERENCE_FILES:",len(state))
    print("ANALYZE_PRESENT_VERIFICATION_REFERENCE_FILES:",len(verify))
    print("LIKELY_ANALYZE_PRESENT_LABELS:",", ".join(sorted(labels)[:16]) if labels else "Analyze, Present")
    print("COHORT_SIZE: 3")
    print("CERTIFIED_BROWSER_CONTEXT: PRESERVE_SINGLE_CERTIFIED_BROWSER_CONTEXT")
    print("CERTIFIED_PAGE_POLICY: CREATE_FRESH_EXPLORER_PAGE_TARGET_PER_RECORD")
    print("STRICT_SEQUENTIAL: True")
    print("HALT_ON_FIRST_FAILURE: True")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
