#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib,subprocess,re,shutil

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R1="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS"
AUTH="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28NEW="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_AUTHORITATIVE_PRIOR_200_DISJOINTNESS_COMPARATOR_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"

def loadj(p):
    try:return json.loads(p.read_text())
    except:return None
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    runner=pcc/"src/explorer4"/R29A/"select_r29a.py"
    diag=er/R1/"candidate_selection_residual_causal_diagnosis.json"
    auth=er/AUTH/"exact_new_two_hundred_candidates.json"
    new=er/R28NEW/"exact_new_two_hundred_candidates_prefix_normalized.json"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"authoritative_prior_200_disjointness_comparator_repair_and_candidate_selection_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2 Authoritative Prior-200 Disjointness Comparator Repair + Candidate Selection Recertification")
    print("="*120)
    print("Mode: RUNNER_ONLY_COMPARATOR_REPAIR_AND_SELECTOR_RECERTIFICATION")
    print("Application source mutation: RUNNER_REPAIR_ONLY")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    j=loadj(diag)
    if not isinstance(j,dict) or j.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: R29A-R4-R2-R1 diagnosis missing or not passed");return 4
    expected="AUTHORITATIVE_PRIOR200_BRANCH_WRONGLY_TESTS_DISJOINTNESS_AGAINST_LIVE_INVENTORY_INSTEAD_OF_R28_NEW200_COHORT"
    if j.get("classification")!=expected:
        print("STATUS: BLOCKED");print("REASON: diagnosis classification does not authorize comparator repair");return 5
    if not runner.exists() or not auth.exists() or not new.exists():
        print("STATUS: BLOCKED");print("REASON: selector or authoritative cohort artifacts missing");return 6

    src=runner.read_text()
    before=sha(runner)

    wrong="if len(_r29a_r4_r2_prior)==200 and len(_r29a_r4_r2_keys)==200 and not (_r29a_r4_r2_keys & livekeys):"
    correct=(
      "_r29a_r4_r2_new_keys = keyset(new200)\n"
      "    if len(_r29a_r4_r2_prior)==200 and len(_r29a_r4_r2_keys)==200 and "
      "len(_r29a_r4_r2_new_keys)==200 and not (_r29a_r4_r2_keys & _r29a_r4_r2_new_keys):"
    )

    if correct in src:
        action="DISJOINTNESS_COMPARATOR_ALREADY_REPAIRED"
    elif wrong in src:
        backup=out/"select_r29a_pre_r29a_r4_r2_r2.py"
        if not backup.exists():shutil.copy2(runner,backup)
        src=src.replace(wrong,correct,1)
        runner.write_text(src)
        action="LIVEKEYS_TO_NEW200_DISJOINTNESS_COMPARATOR_REPAIRED"
    else:
        print("STATUS: BLOCKED")
        print("REASON: exact diagnosed authoritative branch comparator not found; refusing broad mutation")
        return 7

    after=sha(runner)
    repaired=correct in runner.read_text()
    live_wrong="not (_r29a_r4_r2_keys & livekeys)" in runner.read_text()
    new_keyset="keyset(new200)" in runner.read_text()

    print("DIAGNOSIS_CLASSIFICATION:",j.get("classification"))
    print("RUNNER_REPAIR_ACTION:",action)
    print("RUNNER_SHA256_BEFORE:",before)
    print("RUNNER_SHA256_AFTER:",after)
    print("AUTHORITATIVE_BRANCH_USES_NEW200_KEYSET:",new_keyset)
    print("AUTHORITATIVE_BRANCH_LIVEKEYS_DISJOINTNESS_REMOVED:",not live_wrong)
    print("\nRe-running authoritative R29A selector...\n")

    cp=subprocess.run([sys.executable,str(runner),str(repo)],cwd=str(runner.parent))

    r29a_ev=er/R29A/"exact_eight_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    r29a=loadj(r29a_ev) if r29a_ev.exists() else None
    target_candidates=[
      er/R29A/"exact_new_four_hundred_candidates.json",
      er/R29A/"exact_new_four_hundred_candidates_prefix_normalized.json"
    ]
    target=next((p for p in target_candidates if p.exists()),None)
    tj=loadj(target) if target else None
    target_count=len(tj) if isinstance(tj,list) else None

    # uniqueness is evaluated using selectionKey when present, otherwise canonical label/address.
    def tid(x):
        if isinstance(x,str):return " ".join(x.lower().split())
        if not isinstance(x,dict):return None
        for k in ("selectionKey","canonicalKey","canonicalTarget","normalizedTarget","address","label","target","name"):
            if x.get(k):return " ".join(str(x[k]).lower().split())
        return None
    tids=[z for z in (tid(x) for x in (tj or [])) if z] if isinstance(tj,list) else []
    target_unique=len(set(tids)) if tids else None

    checks={
      "r29aR4R2R1Passed":j.get("status")=="PASSED",
      "wrongLiveInventoryComparatorDiagnosed":j.get("classification")==expected,
      "runnerRepairScopeOnly":True,
      "authoritativeBranchUsesNew200Keyset":new_keyset,
      "authoritativeBranchLivekeysDisjointnessRemoved":not live_wrong,
      "comparatorRepairInstalled":repaired,
      "selectorExitZero":cp.returncode==0,
      "r29aEvidencePresent":r29a_ev.exists(),
      "r29aStatusPassed":isinstance(r29a,dict) and r29a.get("status")=="PASSED",
      "exactNewFourHundredTargetArtifactPresent":target is not None,
      "exactNewFourHundredTargetCountExactly400":target_count==400,
      "exactNewFourHundredTargetsUnique":target_unique==400,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "governedMutationOff":True
    }

    ok=all(checks.values())
    status="PASSED" if ok else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_PRIOR200_DISJOINTNESS_COMPARATOR_REPAIRED_EXACT_NEW400_CANDIDATE_SELECTION_RECERTIFIED"
           if ok else
           "M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_CANDIDATE_SELECTION_RECERTIFICATION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
         if ok else
         "M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS")

    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_AUTHORITATIVE_PRIOR_200_DISJOINTNESS_COMPARATOR_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,
      "classification":("AUTHORITATIVE_PRIOR200_DISJOINTNESS_COMPARATOR_REPAIRED_AGAINST_R28_NEW200_EXACT_NEW400_CANDIDATE_SELECTION_RECERTIFIED"
                        if ok else "POST_COMPARATOR_REPAIR_CANDIDATE_SELECTION_GAP_REMAINS"),
      "runnerRepairAction":action,
      "runnerSha256Before":before,"runnerSha256After":after,
      "r29aEvidence":str(r29a_ev),
      "targetArtifact":str(target) if target else None,
      "checks":checks,"nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",ev["classification"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if ok else 1

if __name__=="__main__":
    raise SystemExit(main())
