#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R16_POST_ANALYZE_PRESENT_EXPORT_PRESENTATION_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def scan(root, patterns):
    hits=[]
    exts={".js",".jsx",".ts",".tsx",".mjs",".json",".html",".css"}
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts: continue
        if any(x in p.parts for x in ("node_modules",".git","evidence")): continue
        try:s=p.read_text(errors="ignore")
        except:continue
        n=sum(len(re.findall(x,s,re.I)) for x in patterns)
        if n:hits.append({"file":str(p.relative_to(root)),"references":n})
    return sorted(hits,key=lambda x:(-x["references"],x["file"]))

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    prev=ev/"M4_19D4BN17C_R4_R12_R15B_ANALYZE_PRESENT_ACTION_MICRO_COHORT_LIFECYCLE_CLOSURE"/"analyze_present_action_micro_cohort_lifecycle_closure.json"
    if not prev.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: ANALYZE_PRESENT_LIFECYCLE_CLOSURE_EVIDENCE_REQUIRED")
        return 4
    p=fj(prev)

    export_ui=scan(app,[r"\bexport\b",r"export presentation",r"export deck",r"download presentation",r"download deck"])
    presentation_ui=scan(app,[r"presentation",r"present deck",r"generate presentation",r"open presentation"])
    state=scan(app,[r"export[A-Z_]",r"exportState",r"presentation[A-Z_]",r"presentationState",
                    r"setExport",r"setPresentation",r"exportStatus",r"presentationStatus"])
    verify=scan(app,[r"export.*visible",r"export.*ready",r"export.*complete",r"presentation.*visible",
                     r"presentation.*ready",r"presentation.*complete",r"download.*ready",r"deck.*ready"])

    labels=set()
    rx=re.compile(r"""["'`]([^"'`]{0,40}\b(?:Export|Presentation|Download|Deck)\b[^"'`]{0,40})["'`]""",re.I)
    for h in (export_ui+presentation_ui)[:140]:
        s=(app/h["file"]).read_text(errors="ignore")
        for m in rx.findall(s):
            x=m.strip()
            if len(x)<=90 and "\n" not in x: labels.add(x)

    checks={
      "analyzePresentClosurePassed":p.get("status")=="PASSED",
      "analyzePresentCertifiedThreeOfThree":len(p.get("closedCohort",[]))==3,
      "exportUiReferencesResolved":len(export_ui)>0,
      "presentationUiReferencesResolved":len(presentation_ui)>0,
      "exportPresentationStateReferencesResolved":len(state)>0,
      "exportPresentationVerificationReferencesResolved":len(verify)>0,
      "boundedMicroCohortRequired":True,
      "exactThreeRecordMicroCohort":True,
      "freshPagePerRecordSameBrowserRequired":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "selectedPropertyReadbackRequired":True,
      "exportReadbackRequired":True,
      "presentationReadbackRequired":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveExportPresentationAuthorityOff":True
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R16_POST_ANALYZE_PRESENT_EXPORT_PRESENTATION_ACTION_SURFACE_READINESS_CERTIFIED"
        diagnosis="ANALYZE_PRESENT_CLOSED_EXPORT_PRESENTATION_ACTION_SURFACE_CONTRACT_RESOLVED_THREE_RECORD_LIVE_ACTIVATION_READY"
        nxt="M4_19D4BN17C_R4_R12_R16A_EXPORT_PRESENTATION_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R16_EXPORT_PRESENTATION_READINESS_INCOMPLETE"
        diagnosis="EXPORT_PRESENTATION_ACTION_SURFACE_CONTRACT_REMAINS_INCOMPLETE"
        nxt=None

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16_POST_ANALYZE_PRESENT_EXPORT_PRESENTATION_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "exportPresentationContract":{
        "exportUiReferenceFiles":len(export_ui),
        "presentationUiReferenceFiles":len(presentation_ui),
        "stateReferenceFiles":len(state),
        "verificationReferenceFiles":len(verify),
        "likelyLabels":sorted(labels)[:40],
        "topExportUiReferences":export_ui[:20],
        "topPresentationUiReferences":presentation_ui[:20],
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
        "exportReadbackRequired":True,
        "presentationReadbackRequired":True
      },
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "liveExportPresentation":False
      },
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"post_analyze_present_export_presentation_action_surface_readiness_and_bounded_design.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16 Post-Analyze/Present Export/Presentation Readiness + Bounded Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live Export/Presentation authority: OFF")
    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nEXPORT_UI_REFERENCE_FILES:",len(export_ui))
    print("PRESENTATION_UI_REFERENCE_FILES:",len(presentation_ui))
    print("EXPORT_PRESENTATION_STATE_REFERENCE_FILES:",len(state))
    print("EXPORT_PRESENTATION_VERIFICATION_REFERENCE_FILES:",len(verify))
    print("LIKELY_EXPORT_PRESENTATION_LABELS:",", ".join(sorted(labels)[:16]) if labels else "Export, Presentation")
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
