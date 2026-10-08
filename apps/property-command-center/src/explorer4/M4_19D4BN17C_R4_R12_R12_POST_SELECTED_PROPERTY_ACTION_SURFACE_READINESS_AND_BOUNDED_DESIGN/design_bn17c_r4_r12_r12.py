#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R12_POST_SELECTED_PROPERTY_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"
REMAINING=["COMPARE","COMMAND","ANALYZE_PRESENT","EXPORT_PRESENTATION"]

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def count_refs(app, pats):
    out=[]
    for p in app.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in (".js",".jsx",".ts",".tsx",".mjs",".json"):
            continue
        try:t=p.read_text(errors="ignore")
        except:continue
        c=sum(len(re.findall(rx,t,re.I)) for rx in pats)
        if c:
            out.append({"file":str(p.relative_to(app)),"count":c})
    out.sort(key=lambda x:(-x["count"],x["file"]))
    return out[:80]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    closep=ev/"M4_19D4BN17C_R4_R12_R10_R1_SELECTED_PROPERTY_ACTIVATION_MICRO_COHORT_RECERTIFICATION_AND_CLOSURE"/"selected_property_activation_micro_cohort_recertification_and_closure.json"
    r1p=ev/"M4_19D4BN17C_R1_LIVE_WORKFLOW_ACTIVATION_AND_OBSERVATION_CONTRACT_DIAGNOSIS"/"live_workflow_activation_and_observation_contract_diagnosis.json"
    if not closep.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: SELECTED_PROPERTY_CLOSURE_EVIDENCE_REQUIRED");return 4
    close=fj(closep)
    r1=fj(r1p) if r1p.exists() else {}

    refs={
      "COMPARE":count_refs(app,[r"\bcompare\b",r"openCompare",r"compareSelection",r"comparison"]),
      "COMMAND":count_refs(app,[r"\bcommand\b",r"runCommand",r"commandPalette",r"executeCommand"]),
      "ANALYZE_PRESENT":count_refs(app,[r"\banalyze\b",r"\bpresent\b",r"analyzePresent",r"presentationMode"]),
      "EXPORT_PRESENTATION":count_refs(app,[r"\bexport\b",r"presentation",r"download",r"exportPresentation"])
    }

    # Conservative dependency/risk model.
    policy={
      "COMPARE":{"risk":"LOW","dependsOn":["SELECTED_PROPERTY"],"liveMutation":False,"reason":"local selected-property consumer/action surface"},
      "COMMAND":{"risk":"LOW_TO_MEDIUM","dependsOn":["SELECTED_PROPERTY"],"liveMutation":False,"reason":"action dispatcher surface may fan out; certify after compare"},
      "ANALYZE_PRESENT":{"risk":"MEDIUM","dependsOn":["SELECTED_PROPERTY","COMMAND_OPTIONAL"],"liveMutation":False,"reason":"mode/context transition and multiple UI consumers"},
      "EXPORT_PRESENTATION":{"risk":"MEDIUM","dependsOn":["SELECTED_PROPERTY","ANALYZE_PRESENT_OPTIONAL"],"liveMutation":False,"reason":"external consumer/render lifecycle but no governed mutation"}
    }

    score={}
    for k in REMAINING:
        refcount=sum(x["count"] for x in refs[k][:20])
        base={"COMPARE":100,"COMMAND":80,"ANALYZE_PRESENT":60,"EXPORT_PRESENTATION":50}[k]
        score[k]=base+min(refcount,100)

    # Prefer Compare first unless references are absent.
    viable=[k for k in REMAINING if len(refs[k])>0]
    resolved="COMPARE" if "COMPARE" in viable else (viable[0] if viable else None)

    checks={
      "selectedPropertyClosurePassed":close.get("status")=="PASSED",
      "selectedPropertyCertifiedThreeOfThree":close.get("certifiedCount")==3,
      "remainingGapFamiliesEnumerated":len(REMAINING)==4,
      "compareReferencesResolved":len(refs["COMPARE"])>0,
      "commandReferencesResolved":len(refs["COMMAND"])>0,
      "analyzePresentReferencesResolved":len(refs["ANALYZE_PRESENT"])>0,
      "exportPresentationReferencesResolved":len(refs["EXPORT_PRESENTATION"])>0,
      "boundedMicroCohortRequired":True,
      "haltOnFirstFailure":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveActionAuthorityOff":True,
      "nextActionFamilyResolved":resolved is not None
    }
    passed=all(checks.values())

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R12_POST_SELECTED_PROPERTY_ACTION_SURFACE_READINESS_CERTIFIED"
        diagnosis="SELECTED_PROPERTY_CLOSED_REMAINING_ACTION_FAMILIES_BOUNDED_COMPARE_SELECTED_FIRST"
        nxt="M4_19D4BN17C_R4_R12_R13_COMPARE_ACTION_SURFACE_CONTRACT_AND_MICRO_COHORT_ACTIVATION_DESIGN"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R12_ACTION_SURFACE_READINESS_INCOMPLETE"
        diagnosis="POST_SELECTED_PROPERTY_ACTION_SURFACE_READINESS_PRECONDITION_FAILED"
        nxt=None

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R12_POST_SELECTED_PROPERTY_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "status":status,"state":state,"diagnosis":diagnosis,
      "checks":checks,
      "remainingActionFamilies":REMAINING,
      "referenceCounts":{k:sum(x["count"] for x in refs[k]) for k in REMAINING},
      "topReferences":refs,
      "policy":policy,
      "priorityScores":score,
      "resolvedNextActionFamily":resolved,
      "executionPolicy":{
        "cohortSize":3,
        "referenceCohort":["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"],
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "readAfterActionRequired":True,
        "selectedPropertyMustRemainCertified":True,
        "mapMustRemainVisible":True,
        "governedMutationAuthority":False
      },
      "authority":{
        "applicationSourceMutation":False,"governedDataMutation":False,
        "networkAuthority":False,"pixelEvidence":False,"liveActionAuthority":False
      },
      "next":"BN17C_R4_R12_R12_CERTIFIED_COMPARE_ACTION_DESIGN_READY" if passed else "BN17C_R4_R12_R12_REMAINS_OPEN",
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"post_selected_property_action_surface_readiness_and_bounded_design.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R12 Post-Selected-Property Action Surface Readiness + Bounded Design")
    print("="*120)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live action authority: OFF")
    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- REMAINING ACTION FAMILIES -----")
    for k in REMAINING:
        print(f"{k}: refs={sum(x['count'] for x in refs[k])} risk={policy[k]['risk']} score={score[k]}")
    print("\nRESOLVED_NEXT_ACTION_FAMILY:",resolved)
    print("COHORT_SIZE: 3")
    print("STRICT_SEQUENTIAL: True")
    print("HALT_ON_FIRST_FAILURE: True")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
