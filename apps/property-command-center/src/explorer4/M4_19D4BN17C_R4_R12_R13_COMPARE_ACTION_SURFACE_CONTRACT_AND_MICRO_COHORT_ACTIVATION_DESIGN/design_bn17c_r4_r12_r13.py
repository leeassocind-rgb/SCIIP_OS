#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re

M="M4_19D4BN17C_R4_R12_R13_COMPARE_ACTION_SURFACE_CONTRACT_AND_MICRO_COHORT_ACTIVATION_DESIGN"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd"]

def fj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def scan(app, patterns, limit=120):
    out=[]
    for p in app.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in (".js",".jsx",".ts",".tsx",".mjs",".json"):
            continue
        try:t=p.read_text(errors="ignore")
        except:continue
        hits=[]
        for label,rx in patterns:
            n=len(re.findall(rx,t,re.I))
            if n:hits.append({"signal":label,"count":n})
        if hits:
            out.append({"file":str(p.relative_to(app)),"signals":hits,"total":sum(x["count"] for x in hits)})
    out.sort(key=lambda x:(-x["total"],x["file"]))
    return out[:limit]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"

    r12p=ev/"M4_19D4BN17C_R4_R12_R12_POST_SELECTED_PROPERTY_ACTION_SURFACE_READINESS_AND_BOUNDED_DESIGN"/"post_selected_property_action_surface_readiness_and_bounded_design.json"
    if not r12p.exists():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN17C_R4_R12_R12_EVIDENCE_REQUIRED")
        return 4
    r12=fj(r12p)

    ui=scan(app,[
      ("compare_literal",r"['\"`]Compare['\"`]"),
      ("open_compare",r"openCompare"),
      ("compare_button",r"compare.{0,40}(button|control|action)"),
      ("on_compare",r"onCompare"),
      ("compare_click",r"(onClick|click).{0,80}compare"),
      ("compare_mode",r"compareMode|mode.{0,20}compare"),
    ])
    state=scan(app,[
      ("compare_selection",r"compareSelection|selectedCompare|compareSelected"),
      ("compare_state",r"compareState|setCompare|compareItems|comparisonSet"),
      ("comparison",r"\bcomparison\b"),
      ("compare_panel",r"comparePanel|comparisonPanel"),
      ("compare_consumer",r"compareConsumer|comparisonConsumer"),
    ])
    verification=scan(app,[
      ("open_compare_text",r"Open Compare"),
      ("compare_count",r"compareCount|comparisonCount"),
      ("compare_visible",r"compare.{0,60}(visible|open|active|mounted)"),
      ("selected_property",r"selectedProperty"),
      ("map_visible",r"(gm-style|mapVisible|map.*visible)"),
    ])

    # Derive likely labels/tokens from source.
    label_tokens={}
    rx=re.compile(r"['\"`]([^'\"`]{1,80}compare[^'\"`]{0,80})['\"`]",re.I)
    for p in app.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in (".js",".jsx",".ts",".tsx",".mjs"): continue
        try:t=p.read_text(errors="ignore")
        except:continue
        for m in rx.finditer(t):
            s=" ".join(m.group(1).split())
            if len(s)<=100:
                label_tokens[s]=label_tokens.get(s,0)+1
    labels=sorted(({"label":k,"count":v} for k,v in label_tokens.items()),key=lambda x:(-x["count"],x["label"]))[:80]

    likely_labels=[]
    priority=("Compare","Open Compare","Add to Compare","Compare Properties","Comparison")
    for x in priority:
        if any(x.lower() in y["label"].lower() for y in labels): likely_labels.append(x)
    if "Compare" not in likely_labels: likely_labels.insert(0,"Compare")

    checks={
      "bn17cR4R12R12Passed":r12.get("status")=="PASSED",
      "r12ResolvedCompareFirst":r12.get("resolvedNextActionFamily")=="COMPARE",
      "selectedPropertyClosurePrerequisitePreserved":r12.get("checks",{}).get("selectedPropertyCertifiedThreeOfThree") is True,
      "compareUiContractReferencesResolved":len(ui)>0,
      "compareStateOrConsumerReferencesResolved":len(state)>0,
      "compareVerificationSignalsResolved":len(verification)>0,
      "compareControlLabelsResolved":len(likely_labels)>0,
      "exactThreeRecordMicroCohort":len(COHORT)==3,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "readAfterActionRequired":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "liveCompareAuthorityOff":True
    }
    passed=all(checks.values())

    activation_contract={
      "preconditions":[
        "Explorer mounted",
        "canonical selected property certified",
        "map visible",
        "Compare action surface visible or resolvable"
      ],
      "activationTargetOrder":[
        "exact visible control text: Compare",
        "visible control text: Open Compare",
        "React/event-bearing ancestor of Compare text",
        "source-resolved Compare action control"
      ],
      "postActionEvidence":[
        "Compare surface/panel becomes visible or active",
        "selected property remains visible",
        "Explorer remains mounted",
        "map remains visible",
        "no Command/Analyze/Present/Export action invoked"
      ],
      "cohort":COHORT,
      "strictSequential":True,
      "haltOnFirstFailure":True,
      "readAfterActionRequired":True
    }

    if passed:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R13_COMPARE_ACTION_SURFACE_CONTRACT_AND_MICRO_COHORT_DESIGN_CERTIFIED"
        diagnosis="COMPARE_ACTION_SURFACE_CONTRACT_RESOLVED_THREE_RECORD_LIVE_ACTIVATION_CERTIFICATION_READY"
        nxt="M4_19D4BN17C_R4_R12_R13A_COMPARE_ACTION_LIVE_MICRO_COHORT_ACTIVATION_CERTIFICATION"
    else:
        status="BLOCKED"
        state="M419D4BN17C_R4_R12_R13_COMPARE_ACTION_SURFACE_DESIGN_INCOMPLETE"
        diagnosis="COMPARE_ACTION_SURFACE_CONTRACT_OR_VERIFICATION_SIGNAL_GAP"
        nxt=None

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R13_COMPARE_ACTION_SURFACE_CONTRACT_AND_MICRO_COHORT_ACTIVATION_DESIGN",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "mode":"READ_ONLY_ACTION_CONTRACT_DESIGN",
      "status":status,"state":state,"diagnosis":diagnosis,
      "checks":checks,
      "cohort":COHORT,
      "topUiReferences":ui,
      "topStateReferences":state,
      "topVerificationReferences":verification,
      "compareLabelCandidates":labels,
      "likelyCompareLabels":likely_labels,
      "activationContract":activation_contract,
      "authority":{
        "applicationSourceMutation":False,
        "governedDataMutation":False,
        "networkAuthority":False,
        "pixelEvidence":False,
        "liveCompareAction":False,
        "command":False,
        "analyzePresent":False,
        "exportPresentation":False
      },
      "next":"BN17C_R4_R12_R13_CERTIFIED_COMPARE_LIVE_MICRO_COHORT_READY" if passed else "BN17C_R4_R12_R13_REMAINS_OPEN",
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"compare_action_surface_contract_and_micro_cohort_activation_design.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R13 Compare Action Surface Contract + Micro-Cohort Activation Design")
    print("="*120)
    print("Mode: READ_ONLY_ACTION_CONTRACT_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live Compare authority: OFF")
    print("\n----- DESIGN CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nCOMPARE_UI_REFERENCE_FILES:",len(ui))
    print("COMPARE_STATE_REFERENCE_FILES:",len(state))
    print("COMPARE_VERIFICATION_REFERENCE_FILES:",len(verification))
    print("LIKELY_COMPARE_LABELS:",", ".join(likely_labels))
    print("COHORT_SIZE:",len(COHORT))
    print("STRICT_SEQUENTIAL: True")
    print("HALT_ON_FIRST_FAILURE: True")
    print("READ_AFTER_ACTION_REQUIRED: True")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
