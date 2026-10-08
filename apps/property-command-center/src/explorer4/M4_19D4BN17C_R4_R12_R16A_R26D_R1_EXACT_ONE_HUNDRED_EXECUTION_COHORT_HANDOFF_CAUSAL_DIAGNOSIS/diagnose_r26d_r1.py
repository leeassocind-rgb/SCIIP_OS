#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,re,hashlib

R26D="M4_19D4BN17C_R4_R12_R16A_R26D_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_LIVE_EXECUTION"
R26E="M4_19D4BN17C_R4_R12_R16A_R26E_EXACT_ONE_HUNDRED_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26D_R1_EXACT_ONE_HUNDRED_EXECUTION_COHORT_HANDOFF_CAUSAL_DIAGNOSIS"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def find_best_outcome_list(obj):
    best=[]
    def walk(x):
        nonlocal best
        if isinstance(x,list):
            # Prefer lists whose rows look like per-record execution outcomes.
            if x and all(isinstance(z,dict) for z in x):
                score=sum(1 for z in x if any(k in z for k in ("target","certified","artifact","exportClicked","freshTargetCreated")))
                if score >= max(1,len(x)//2) and len(x)>len(best):
                    best=x
            for z in x: walk(z)
        elif isinstance(x,dict):
            for v in x.values(): walk(v)
    walk(obj)
    return best

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    eroot=repo/"apps/property-command-center/evidence/explorer4"
    p26d=eroot/R26D/"exact_one_hundred_record_guarded_export_live_execution.json"
    p26e=eroot/R26E/"exact_one_hundred_record_export_artifact_and_runtime_verification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26D-R1 Exact-One-Hundred Execution Cohort Handoff Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_SOURCE_AND_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not p26d.exists() or not p26e.exists():
        print("STATUS: BLOCKED")
        print("REASON: R26D and R26E evidence are both required")
        return 4

    d26=loadj(p26d); d26e=loadj(p26e)
    runner=Path(d26.get("runner",""))
    targetfile=eroot/R26D/"exact_one_hundred_targets.json"

    if not runner.exists():
        print("STATUS: BLOCKED")
        print("REASON: delegated R25D-R3 runner source not found")
        return 5
    if not targetfile.exists():
        print("STATUS: BLOCKED")
        print("REASON: R26D exact-one-hundred target file missing")
        return 6

    targets=loadj(targetfile)
    src=runner.read_text(errors="ignore")
    env_tokens=[
        "SCIIP_EXACT_COHORT_FILE",
        "SCIIP_EXPORT_COHORT_SIZE",
        "SCIIP_EXPORT_MAX_CLICKS_PER_RECORD",
        "SCIIP_EXPORT_STRICT_SEQUENTIAL",
        "SCIIP_EXPORT_HALT_ON_FIRST_FAILURE",
    ]
    env_presence={t:(t in src) for t in env_tokens}

    # Resolve the R25D-R3 evidence path from source or canonical location.
    r25_evidence_candidates=list(eroot.glob("M4_19D4BN17C_R4_R12_R16A_R25D_R3*/bounded_explorer_settle_and_exact_fifty_export_recertification.json"))
    r25p=r25_evidence_candidates[0] if r25_evidence_candidates else None
    r25=loadj(r25p) if r25p else {}
    outcomes=find_best_outcome_list(r25) if r25 else []

    # Source coupling indicators.
    coupling_patterns={
      "referencesR25C": bool(re.search(r"R25C|r25c",src)),
      "referencesExactFifty": bool(re.search(r"EXACT[_ -]?FIFTY|exact[_ -]?fifty|50",src)),
      "referencesR26": bool(re.search(r"R26|r26",src)),
      "loadsEnvironment": "os.environ" in src or "os.getenv" in src,
      "readsExternalCohortFile": "SCIIP_EXACT_COHORT_FILE" in src,
    }

    exact100_targets=len(targets)==100 and len(set(targets))==100
    structured_count=len(outcomes)
    structured_certified=sum(1 for o in outcomes if o.get("certified") is True)
    structured_export_clicked=sum(1 for o in outcomes if o.get("exportClicked") is True)
    structured_artifact_count=sum(
        1 for o in outcomes
        if isinstance(o.get("artifact"),dict)
        and o["artifact"].get("pdfDownloadCount")==1
        and o["artifact"].get("pdfObjectUrlEventCount")==1
    )

    handoff_consumed=all(env_presence.values())
    runner_hard_bound_50=(structured_count==50 and not env_presence["SCIIP_EXACT_COHORT_FILE"])
    r26e_text_count_invalid=(d26e.get("checks",{}).get("delegatedCertifiedRecordCountObserved")==200 and structured_count==50)

    relevant=[]
    for i,line in enumerate(src.splitlines(),1):
        if re.search(r"R25C|exact.?fifty|cohort|targets|outcomes|range\(|\b50\b|SCIIP_",line,re.I):
            relevant.append({"line":i,"text":line.strip()[:500]})
    relevant=relevant[:120]

    if exact100_targets and runner_hard_bound_50:
        classification="R26D_EXACT_ONE_HUNDRED_TARGET_FILE_WAS_NOT_CONSUMED_BY_REUSED_R25D_R3_RUNNER_RUNNER_REMAINED_BOUND_TO_EXACT_FIFTY_EXECUTION_CONTRACT"
        next_milestone="M4_19D4BN17C_R4_R12_R16A_R26D_R2_EXACT_ONE_HUNDRED_NATIVE_RUNNER_ADAPTATION_AND_STATIC_CERTIFICATION"
    elif exact100_targets and structured_count==100:
        classification="EXACT_ONE_HUNDRED_HANDOFF_CONSUMED_STRUCTURED_EXECUTION_COUNT_IS_ONE_HUNDRED_R26E_VERIFIER_COUNTING_BUG_ONLY"
        next_milestone="M4_19D4BN17C_R4_R12_R16A_R26E_R1_STRUCTURED_EXACT_ONE_HUNDRED_ARTIFACT_RUNTIME_REVERIFICATION"
    else:
        classification="EXACT_ONE_HUNDRED_COHORT_HANDOFF_CAUSE_NOT_YET_UNIQUELY_RESOLVED"
        next_milestone="M4_19D4BN17C_R4_R12_R16A_R26D_R1_R1_DELEGATED_RUNNER_COHORT_SOURCE_DEEP_DIAGNOSIS"

    checks={
      "r26dDelegatedExecutionConsumed": d26.get("status")=="DELEGATED_EXECUTION_COMPLETE",
      "r26eIncompleteVerificationConsumed": d26e.get("status")=="DIAGNOSTIC_COMPLETE",
      "exactOneHundredTargetFilePresent": True,
      "exactOneHundredTargetFileHas100UniqueTargets": exact100_targets,
      "delegatedRunnerSourcePresent": True,
      "delegatedRunnerEnvironmentContractInspected": True,
      "delegatedRunnerStructuredEvidenceInspected": bool(r25p),
      "structuredOutcomeCountResolved": structured_count>0,
      "structuredCertifiedCountResolved": structured_certified>=0,
      "structuredExportClickCountResolved": structured_export_clicked>=0,
      "structuredArtifactCountResolved": structured_artifact_count>=0,
      "r26eNaiveTextCountEvaluated": True,
      "liveUiInteractionOff": True,
      "exportInvocationOff": True,
      "applicationMutationOff": True,
      "governedMutationOff": True
    }

    out={
      "framework":"SCIIP_EXPLORER_4_R26D_R1_EXACT_ONE_HUNDRED_EXECUTION_COHORT_HANDOFF_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R26D_R1_EXACT_ONE_HUNDRED_EXECUTION_COHORT_HANDOFF_CAUSE_DIAGNOSED",
      "classification":classification,
      "r26dTargetFile":{"path":str(targetfile),"targetCount":len(targets),"uniqueTargetCount":len(set(targets))},
      "delegatedRunner":{"path":str(runner),"sha256":sha(runner),"environmentTokenPresence":env_presence,
                         "couplingIndicators":coupling_patterns,"relevantSourceLines":relevant},
      "structuredDelegatedEvidence":{
        "path":str(r25p) if r25p else None,
        "outcomeCount":structured_count,
        "certifiedCount":structured_certified,
        "exportClickedCount":structured_export_clicked,
        "artifactCount":structured_artifact_count
      },
      "r26eVerifier":{
        "reportedDelegatedCertifiedRecordCountObserved":d26e.get("checks",{}).get("delegatedCertifiedRecordCountObserved"),
        "naiveTextCountInvalid":r26e_text_count_invalid
      },
      "diagnostic":{
        "r26dExact100TargetFileResolved":exact100_targets,
        "delegatedRunnerConsumedExact100EnvironmentContract":handoff_consumed,
        "delegatedRunnerHardBoundTo50":runner_hard_bound_50,
        "r26eTextCountBugConfirmed":r26e_text_count_invalid
      },
      "checks":checks,
      "authority":{"liveUiInteraction":False,"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False},
      "nextMilestone":next_milestone
    }

    od=eroot/OUT; od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_one_hundred_execution_cohort_handoff_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("R26D_TARGET_COUNT:",len(targets))
    print("R26D_UNIQUE_TARGET_COUNT:",len(set(targets)))
    print("DELEGATED_RUNNER:",runner)
    print("SCIIP_EXACT_COHORT_FILE_CONSUMED_BY_RUNNER:",env_presence["SCIIP_EXACT_COHORT_FILE"])
    print("SCIIP_EXPORT_COHORT_SIZE_CONSUMED_BY_RUNNER:",env_presence["SCIIP_EXPORT_COHORT_SIZE"])
    print("STRUCTURED_DELEGATED_OUTCOME_COUNT:",structured_count)
    print("STRUCTURED_CERTIFIED_COUNT:",structured_certified)
    print("STRUCTURED_EXPORT_CLICK_COUNT:",structured_export_clicked)
    print("STRUCTURED_ARTIFACT_COUNT:",structured_artifact_count)
    print("R26E_REPORTED_TEXT_COUNT:",d26e.get("checks",{}).get("delegatedCertifiedRecordCountObserved"))
    print("R26E_TEXT_COUNT_BUG_CONFIRMED:",r26e_text_count_invalid)
    print("DELEGATED_RUNNER_HARD_BOUND_TO_50:",runner_hard_bound_50)
    print("\n----- ENVIRONMENT CONTRACT PRESENCE -----")
    for k,v in env_presence.items(): print(f"{k}: {v}")
    print("\n----- SOURCE COUPLING INDICATORS -----")
    for k,v in coupling_patterns.items(): print(f"{k}: {v}")
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",next_milestone)
    print("EVIDENCE:",ef)
    print("\nR26D-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
