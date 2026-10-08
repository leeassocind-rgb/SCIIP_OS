#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,ast,hashlib,subprocess,shutil,re

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R1="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R1_COMPARATOR_REPAIR_SYNTAX_RESIDUAL_CAUSAL_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_COMPARATOR_REPAIR_SYNTAX_ONLY_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"

BAD="    if len(_r29a_r4_r2_prior)==200 and len(_r29a_r4_r2_keys)==200 and len(_r29a_r4_r2_new_keys)==200 and not (_r29a_r4_r2_keys & _r29a_r4_r2_new_keys):"
GOOD="        if len(_r29a_r4_r2_prior)==200 and len(_r29a_r4_r2_keys)==200 and len(_r29a_r4_r2_new_keys)==200 and not (_r29a_r4_r2_keys & _r29a_r4_r2_new_keys):"

def loadj(p):
    try:return json.loads(p.read_text())
    except:return None

def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()

def target_id(x):
    if isinstance(x,str): return " ".join(x.lower().split())
    if not isinstance(x,dict): return None
    for k in ("selectionKey","canonicalKey","canonicalTarget","normalizedTarget","address","label","target","name"):
        if x.get(k): return " ".join(str(x[k]).lower().split())
    return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    runner=pcc/"src/explorer4"/R29A/"select_r29a.py"
    diag=er/R1/"comparator_repair_syntax_residual_causal_diagnosis.json"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"comparator_repair_syntax_only_repair_and_candidate_selection_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2 Comparator Repair Syntax-Only Repair + Candidate Selection Recertification")
    print("="*120)
    print("Mode: RUNNER_ONLY_SYNTAX_REPAIR_AND_SELECTOR_RECERTIFICATION")
    print("Application source mutation: RUNNER_SYNTAX_REPAIR_ONLY")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    j=loadj(diag)
    if not isinstance(j,dict) or j.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: R29A-R4-R2-R2-R1 diagnosis missing or not passed");return 4
    expected="COMPARATOR_REPAIR_INTRODUCED_PYTHON_SYNTAX_ERROR_IN_AUTHORITATIVE_PRIOR200_BRANCH"
    if j.get("classification")!=expected:
        print("STATUS: BLOCKED");print("REASON: diagnosis does not authorize syntax-only repair");return 5
    if not runner.exists():
        print("STATUS: BLOCKED");print("REASON: authoritative R29A selector missing");return 6

    src=runner.read_text()
    before=sha(runner)

    # Confirm exact diagnosed source shape before mutation.
    if GOOD in src:
        action="SYNTAX_INDENTATION_ALREADY_REPAIRED"
    elif BAD in src:
        backup=out/"select_r29a_pre_syntax_only_repair.py"
        if not backup.exists():shutil.copy2(runner,backup)
        src=src.replace(BAD,GOOD,1)
        runner.write_text(src)
        action="LINE_187_IF_INDENTATION_REPAIRED_4_TO_8_SPACES"
    else:
        print("STATUS: BLOCKED")
        print("REASON: exact diagnosed malformed line not found; refusing broad mutation")
        return 7

    after=sha(runner)
    repaired_src=runner.read_text()

    syntax_ok=False
    syntax_error=None
    try:
        ast.parse(repaired_src)
        syntax_ok=True
    except SyntaxError as e:
        syntax_error={"lineno":e.lineno,"offset":e.offset,"msg":e.msg,"text":(e.text or "").rstrip()}

    py_compile_ok=False
    if syntax_ok:
        cp_compile=subprocess.run([sys.executable,"-m","py_compile",str(runner)],capture_output=True,text=True)
        py_compile_ok=cp_compile.returncode==0
    else:
        cp_compile=None

    comparator_new200=(
      "_r29a_r4_r2_new_keys = keyset(new200)" in repaired_src and
      "_r29a_r4_r2_keys & _r29a_r4_r2_new_keys" in repaired_src
    )
    obsolete_livekeys="_r29a_r4_r2_keys & livekeys" in repaired_src
    page_ready_preserved=(
      "ready=='complete'" in repaired_src and
      "buttons>0" in repaired_src and
      "origin==APP_ORIGIN" in repaired_src
    )
    two_sec_preserved="time.time()-anchor<=2.0" in repaired_src
    three_sample_preserved="consecutive>=3" in repaired_src

    print("DIAGNOSIS_CLASSIFICATION:",j.get("classification"))
    print("SYNTAX_REPAIR_ACTION:",action)
    print("RUNNER_SHA256_BEFORE:",before)
    print("RUNNER_SHA256_AFTER:",after)
    print("AST_PARSE_CERTIFIED:",syntax_ok)
    print("PY_COMPILE_CERTIFIED:",py_compile_ok)
    print("NEW200_COMPARATOR_PRESERVED:",comparator_new200)
    print("OBSOLETE_LIVEKEYS_COMPARATOR_ABSENT:",not obsolete_livekeys)
    print("PAGE_READY_ANCHOR_PRESERVED:",page_ready_preserved)
    print("TWO_SECOND_BOUND_PRESERVED:",two_sec_preserved)
    print("THREE_SAMPLE_GUARD_PRESERVED:",three_sample_preserved)

    if not syntax_ok or not py_compile_ok:
        print("STATUS: DIAGNOSTIC_COMPLETE")
        print("REASON: selector still fails syntax certification")
        if syntax_error:print("SYNTAX_ERROR:",json.dumps(syntax_error))
        return 8

    print("\nRe-running authoritative R29A selector...\n")
    cp=subprocess.run([sys.executable,str(runner),str(repo)],cwd=str(runner.parent))

    r29a_ev=er/R29A/"exact_eight_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    r29a=loadj(r29a_ev) if r29a_ev.exists() else None
    target_candidates=[
      er/R29A/"exact_new_four_hundred_candidates.json",
      er/R29A/"exact_new_four_hundred_candidates_prefix_normalized.json",
      er/R29A/"exact_new_four_hundred_targets.json"
    ]
    target=next((p for p in target_candidates if p.exists()),None)
    tj=loadj(target) if target else None
    tcount=len(tj) if isinstance(tj,list) else None
    tids=[z for z in (target_id(x) for x in (tj or [])) if z] if isinstance(tj,list) else []
    tunique=len(set(tids)) if tids else None

    checks={
      "r29aR4R2R2R1Passed":j.get("status")=="PASSED",
      "exactSyntaxCauseConsumed":j.get("classification")==expected,
      "syntaxRepairScopeOnly":True,
      "line187IndentationRepaired":GOOD in repaired_src,
      "astParseCertified":syntax_ok,
      "pyCompileCertified":py_compile_ok,
      "new200ComparatorPreserved":comparator_new200,
      "obsoleteLivekeysComparatorAbsent":not obsolete_livekeys,
      "pageReadyAnchorPreserved":page_ready_preserved,
      "twoSecondExplorerBoundPreserved":two_sec_preserved,
      "threeSampleExplorerGuardPreserved":three_sample_preserved,
      "selectorExitZero":cp.returncode==0,
      "r29aEvidencePresent":r29a_ev.exists(),
      "r29aStatusPassed":isinstance(r29a,dict) and r29a.get("status")=="PASSED",
      "exactNewFourHundredTargetArtifactPresent":target is not None,
      "exactNewFourHundredTargetCountExactly400":tcount==400,
      "exactNewFourHundredTargetsUnique":tunique==400,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "governedMutationOff":True
    }

    ok=all(checks.values())
    status="PASSED" if ok else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_SYNTAX_REPAIRED_EXACT_NEW400_CANDIDATE_SELECTION_RECERTIFIED"
           if ok else
           "M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_POST_SYNTAX_REPAIR_CANDIDATE_SELECTION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
         if ok else
         "M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R1_POST_SYNTAX_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS")

    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_COMPARATOR_REPAIR_SYNTAX_ONLY_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,
      "classification":("COMPARATOR_REPAIR_SYNTAX_FIXED_NEW200_DISJOINTNESS_PRESERVED_EXACT_NEW400_CANDIDATE_SELECTION_RECERTIFIED"
                        if ok else "POST_SYNTAX_REPAIR_R29A_CANDIDATE_SELECTION_GAP_REMAINS"),
      "syntaxRepairAction":action,
      "runnerSha256Before":before,
      "runnerSha256After":after,
      "r29aEvidence":str(r29a_ev),
      "targetArtifact":str(target) if target else None,
      "checks":checks,
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("CLASSIFICATION:",ev["classification"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if ok else 1

if __name__=="__main__":
    raise SystemExit(main())
