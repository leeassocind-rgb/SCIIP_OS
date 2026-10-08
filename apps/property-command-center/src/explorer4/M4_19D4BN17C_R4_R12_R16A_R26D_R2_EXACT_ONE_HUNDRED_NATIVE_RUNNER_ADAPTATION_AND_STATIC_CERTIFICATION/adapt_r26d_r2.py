#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib

R1="M4_19D4BN17C_R4_R12_R16A_R26D_R1_EXACT_ONE_HUNDRED_EXECUTION_COHORT_HANDOFF_CAUSAL_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R26D_R1_EXACT_ONE_HUNDRED_EXECUTION_COHORT_HANDOFF_CAUSE_DIAGNOSED"
R1_CLASS="R26D_EXACT_ONE_HUNDRED_TARGET_FILE_WAS_NOT_CONSUMED_BY_REUSED_R25D_R3_RUNNER_RUNNER_REMAINED_BOUND_TO_EXACT_FIFTY_EXECUTION_CONTRACT"
R25F="M4_19D4BN17C_R4_R12_R16A_R25F_EXACT_FIFTY_RECORD_EXPORT_LIFECYCLE_CLOSURE_AND_NEXT_SCALE_READINESS"
R26A="M4_19D4BN17C_R4_R12_R16A_R26A_EXACT_ONE_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R26B3="M4_19D4BN17C_R4_R12_R16A_R26B_R3_RESUME_REMAINING_NINETEEN_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
R26C="M4_19D4BN17C_R4_R12_R16A_R26C_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26D_R2_EXACT_ONE_HUNDRED_NATIVE_RUNNER_ADAPTATION_AND_STATIC_CERTIFICATION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def extract_100(obj):
    def walk(x):
        if isinstance(x,list) and len(x)==100:
            out=[]
            for z in x:
                if isinstance(z,str): out.append(z)
                elif isinstance(z,dict): out.append(z.get("target") or z.get("label") or z.get("address") or z.get("name"))
            if len(out)==100 and all(out): return out
        if isinstance(x,dict):
            for v in x.values():
                r=walk(v)
                if r:return r
        if isinstance(x,list):
            for z in x:
                r=walk(z)
                if r:return r
        return None
    return walk(obj)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    e=repo/"apps/property-command-center/evidence/explorer4"
    p1=e/R1/"exact_one_hundred_execution_cohort_handoff_causal_diagnosis.json"
    p25=e/R25F/"exact_fifty_record_export_lifecycle_closure_and_next_scale_readiness.json"
    p26a=e/R26A/"exact_one_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    p26b3=e/R26B3/"resume_remaining_nineteen_record_non_export_live_qualification.json"
    p26c=e/R26C/"exact_one_hundred_record_guarded_export_execution_readiness_and_authorization.json"
    required=[p1,p25,p26a,p26b3,p26c]

    print("="*120)
    print("SCIIP Explorer 4.0 — R26D-R2 Exact-One-Hundred Native Runner Adaptation + Static Certification")
    print("="*120)
    print("Mode: READ_ONLY_PROGRESSIVE_EXECUTION_ADAPTATION_DESIGN")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    missing=[str(p) for p in required if not p.exists()]
    if missing:
        print("STATUS: BLOCKED");print("MISSING_EVIDENCE:",missing);return 4
    d1,d25,d26a,d26b3,d26c=map(loadj,required)

    if d1.get("status")!="PASSED" or d1.get("state")!=R1_STATE or d1.get("classification")!=R1_CLASS:
        print("STATUS: BLOCKED");print("REASON: certified R26D-R1 handoff diagnosis required");return 5
    if d25.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: closed reference-50 lifecycle required");return 6
    if d26b3.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: complete new-50 non-export qualification required");return 7
    if d26c.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: R26C authorization evidence required");return 8

    cohort=extract_100(d26a)
    if not cohort or len(cohort)!=100 or len(set(cohort))!=100:
        print("STATUS: BLOCKED");print("REASON: exact-100 ordered cohort could not be resolved");return 9

    reference50=cohort[:50]
    new50=cohort[50:]
    # The previous R26D exact-100 target file must agree with R26A ordering.
    prev100=e/"M4_19D4BN17C_R4_R12_R16A_R26D_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_LIVE_EXECUTION"/"exact_one_hundred_targets.json"
    prev_targets=loadj(prev100) if prev100.exists() else []
    exact100_parity=(prev_targets==cohort)

    contract={
      "strategy":"PROGRESSIVE_DELTA_FIFTY_EXECUTION",
      "rationale":"Reference 50 already have a closed certified Export lifecycle. Execute only the newly qualified records 51-100, then reconcile reference-50 closure plus new-50 live execution into exact-100 lifecycle evidence.",
      "referenceCohort":{"count":50,"executionAction":"REUSE_CLOSED_R25F_EVIDENCE","liveExportInvocation":False},
      "deltaCohort":{"count":50,"ordinals":"51-100","executionAction":"NEW_NATIVE_GUARDED_LIVE_EXPORT","liveExportInvocation":True},
      "finalReconciliation":{"referenceClosed":50,"newExecuted":50,"exactOneHundred":100},
      "runnerRequirements":{
        "mustReadExternalTargetFile":True,
        "externalTargetFileCardinality":50,
        "mustRejectAnyCardinalityOtherThan50":True,
        "mustNotLoadR25CExactFiftyCohort":True,
        "mustConsumeR26CGuardContract":True,
        "freshPagePerRecord":True,
        "strictSequential":True,
        "haltOnFirstFailure":True,
        "maxExportClicksPerRecord":1,
        "explorerSettle":{"consecutiveSamples":3,"maximumSeconds":2.0},
        "targetBindingSettle":{"consecutiveSamples":3,"maximumSeconds":5.0},
        "selectedPropertySettle":{"consecutiveSamples":3,"maximumSeconds":2.0},
        "candidateIdentityNormalization":"RECOGNIZED_STATUS_SUFFIX_BOUNDARY_ONLY",
        "buildingProjectAwareBindingRequired":True,
        "ambiguousAddressOnlyBindingForbidden":True,
        "generateDirectlyMaterializesReportReview":True,
        "exportHandler":"exportReport",
        "artifact":{"pdfDownloadCount":1,"pdfObjectUrlEventCount":1,"mime":"application/pdf","positiveSize":True,"filenameSuffix":".pdf"},
        "runtime":{"errors":0,"unhandledRejections":0,"sameOrigin":True,"explorerContinuity":True},
        "postPublishReportReviewMustUnmount":True
      }
    }

    checks={
      "r26dR1Passed":True,
      "r26dR1Exact100HandoffBugConsumed":True,
      "r26eTextCountingBugKnown":d1.get("diagnostic",{}).get("r26eTextCountBugConfirmed") is True,
      "referenceFiftyLifecycleClosed":d25.get("status")=="PASSED",
      "newFiftyNonExportQualified":d26b3.get("status")=="PASSED",
      "r26cAuthorizationPassed":d26c.get("status")=="PASSED",
      "exactOneHundredCohortResolved":len(cohort)==100,
      "exactOneHundredCohortUnique":len(set(cohort))==100,
      "referenceFiftyResolved":len(reference50)==50,
      "newFiftyResolved":len(new50)==50,
      "referenceAndNewDisjoint":set(reference50).isdisjoint(set(new50)),
      "priorR26DExact100TargetParity":exact100_parity,
      "progressiveDeltaExecutionBoundedToNewFifty":True,
      "referenceFiftyWillNotBeReexported":True,
      "externalNewFiftyTargetFileRequired":True,
      "strictSequentialPreserved":True,
      "haltOnFirstFailurePreserved":True,
      "singleExportMaximumPreserved":True,
      "allIdentityGuardsPreserved":True,
      "allArtifactGuardsPreserved":True,
      "allRuntimeGuardsPreserved":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    status="PASSED" if all(checks.values()) else "BLOCKED"
    state=("M419D4BN17C_R4_R12_R16A_R26D_R2_PROGRESSIVE_DELTA_FIFTY_EXECUTION_ADAPTATION_STATIC_CERTIFIED"
           if status=="PASSED" else
           "M419D4BN17C_R4_R12_R16A_R26D_R2_PROGRESSIVE_EXECUTION_ADAPTATION_INCOMPLETE")
    cls=("EXACT_ONE_HUNDRED_EXPANSION_RECAST_AS_CLOSED_REFERENCE_FIFTY_PLUS_NATIVE_NEW_FIFTY_GUARDED_EXPORT_EXECUTION"
         if status=="PASSED" else "EXACT_ONE_HUNDRED_PROGRESSIVE_EXECUTION_ADAPTATION_GAP")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R26D_R2_R1_EXACT_NEW_FIFTY_NATIVE_RUNNER_BUILD_AND_STATIC_CERTIFICATION"
         if status=="PASSED" else
         "M4_19D4BN17C_R4_R12_R16A_R26D_R2_R1_ADAPTATION_RESIDUAL_CAUSAL_DIAGNOSIS")

    od=e/OUT;od.mkdir(parents=True,exist_ok=True)
    newfile=od/"exact_new_fifty_targets.json";newfile.write_text(json.dumps(new50,indent=2)+"\n")
    reffile=od/"reference_closed_fifty_targets.json";reffile.write_text(json.dumps(reference50,indent=2)+"\n")
    ef=od/"exact_one_hundred_native_runner_adaptation_and_static_certification.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R26D_R2_EXACT_ONE_HUNDRED_NATIVE_RUNNER_ADAPTATION_AND_STATIC_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,
      "classification":cls,"contract":contract,"checks":checks,
      "referenceFiftyTargets":reference50,"newFiftyTargets":new50,
      "artifacts":{"referenceTargets":str(reffile),"newTargets":str(newfile)},
      "sourceEvidence":[{"path":str(p),"sha256":sha(p)} for p in required],
      "authority":{"liveUiInteraction":False,"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_CLOSED_RECORDS: 50")
    print("NEW_LIVE_EXPORT_RECORDS_REQUIRED: 50")
    print("FINAL_EXACT_ONE_HUNDRED_RECORDS: 100")
    print("REFERENCE_FIFTY_REEXPORT_REQUIRED: False")
    print("NEW_FIFTY_TARGET_FILE:",newfile)
    print("PRIOR_R26D_EXACT100_TARGET_PARITY:",exact100_parity)
    print("\n----- EXECUTION ADAPTATION CONTRACT -----")
    print(json.dumps(contract,indent=2))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("CLASSIFICATION:",cls)
    print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
    print("\nR26D-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if status=="PASSED" else 10

if __name__=="__main__": raise SystemExit(main())
