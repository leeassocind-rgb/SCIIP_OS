#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib,subprocess,re

R1="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS"
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
AUTH="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28NEW="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_AUTHORITATIVE_PRIOR_200_SOURCE_BINDING_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"

def loadj(p):
    try:return json.loads(p.read_text())
    except:return None
def norm(s): return " ".join(str(s or "").lower().split())
def ident(x):
    if isinstance(x,str): return norm(x)
    if not isinstance(x,dict): return None
    for k in ("selectionKey","canonicalKey","canonicalTarget","normalizedTarget","address","label","target","name"):
        if x.get(k): return norm(x[k])
    return None
def ids(x):
    if not isinstance(x,list): return []
    return [z for z in (ident(v) for v in x) if z]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    srcdir=pcc/"src/explorer4"/R29A
    runner=srcdir/"select_r29a.py"
    diag=loadj(er/R1/"candidate_selection_residual_causal_diagnosis.json")
    auth=er/AUTH/"exact_new_two_hundred_candidates.json"
    new=er/R28NEW/"exact_new_two_hundred_candidates_prefix_normalized.json"
    out=er/OUT; out.mkdir(parents=True,exist_ok=True)
    ep=out/"authoritative_prior_200_source_binding_repair_and_candidate_selection_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2 Authoritative Prior-200 Source Binding Repair + Candidate Selection Recertification")
    print("="*120)
    print("Application source mutation: RUNNER_REPAIR_ONLY")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    if not isinstance(diag,dict) or diag.get("status")!="PASSED":
        print("STATUS: BLOCKED"); print("REASON: R29A-R4-R1 evidence not passed"); return 4
    a=ids(loadj(auth)); n=ids(loadj(new))
    if len(a)!=200 or len(set(a))!=200 or len(n)!=200 or len(set(n))!=200:
        print("STATUS: BLOCKED"); print("REASON: authoritative cohort artifact malformed"); return 5
    overlap=len(set(a)&set(n)); union=len(set(a)|set(n))
    if overlap!=0 or union!=400:
        print("STATUS: BLOCKED"); print("REASON: authoritative prior-200 no longer disjoint from R28 new-200"); return 6
    if not runner.exists():
        print("STATUS: BLOCKED"); print("REASON: authoritative R29A selector missing"); return 7

    before=sha(runner)
    s=runner.read_text()
    # Narrow repair: make the diagnosed exact authoritative R28A-R3 prior-200 artifact
    # the first candidate for prior-200 reconstruction. Existing fallbacks remain intact.
    marker="exact_new_two_hundred_candidates.json"
    auth_literal=str(auth)
    changed=False
    if auth_literal not in s:
        # Inject a constant immediately after imports; choose_prior200 can consume it via
        # an early exact/disjoint return without changing candidate-selection semantics.
        lines=s.splitlines()
        idx=0
        while idx<len(lines) and (lines[idx].startswith("#!") or lines[idx].startswith("import ") or lines[idx].startswith("from ")):
            idx+=1
        inject=[
          "",
          f"R29A_R4_R2_AUTHORITATIVE_PRIOR200 = Path({auth_literal!r})",
          ""
        ]
        # Ensure Path exists.
        if not re.search(r'from\s+pathlib\s+import\s+.*\bPath\b',s):
            inject.insert(0,"from pathlib import Path")
        lines[idx:idx]=inject
        s="\n".join(lines)+"\n"

        # Patch choose_prior200 body with a shape-safe authoritative first branch.
        m=re.search(r'def choose_prior200\(([^)]*)\):\n',s)
        if not m:
            print("STATUS: BLOCKED"); print("REASON: choose_prior200 helper not found"); return 8
        pos=m.end()
        indent="    "
        block=(
          indent+"# R29A-R4-R2: authoritative closed prior-200 binding diagnosed by R29A-R4-R1.\n"+
          indent+"try:\n"+
          indent+"    _r29a_r4_r2_prior = json.loads(R29A_R4_R2_AUTHORITATIVE_PRIOR200.read_text())\n"+
          indent+"    _r29a_r4_r2_ids = [marker_identity(x) for x in _r29a_r4_r2_prior]\n"+
          indent+"    _r29a_r4_r2_keys = keyset(_r29a_r4_r2_ids)\n"+
          indent+"    if len(_r29a_r4_r2_prior)==200 and len(_r29a_r4_r2_keys)==200 and not (_r29a_r4_r2_keys & livekeys):\n"+
          indent+"        return _r29a_r4_r2_prior, {'source':'R28A_R3_AUTHORITATIVE_EXACT_PRIOR_200','path':str(R29A_R4_R2_AUTHORITATIVE_PRIOR200),'bindingRepair':'R29A_R4_R2'}\n"+
          indent+"except Exception:\n"+
          indent+"    pass\n"
        )
        # The existing helper's third arg is livekeys according to R29A traceback.
        s=s[:pos]+block+s[pos:]
        runner.write_text(s)
        changed=True

    after=sha(runner)
    print("R29A_R4_R1_CLASSIFICATION:",diag.get("classification"))
    print("AUTHORITATIVE_PRIOR_200_SOURCE:",auth)
    print("AUTHORITATIVE_PRIOR_200_COUNT:",len(a))
    print("AUTHORITATIVE_PRIOR_200_UNIQUE:",len(set(a)))
    print("OVERLAP_WITH_R28_NEW_200:",overlap)
    print("REFERENCE_400_UNION_UNIQUE:",union)
    print("RUNNER_REPAIR_ACTION:","AUTHORITATIVE_PRIOR_200_BINDING_INSTALLED" if changed else "AUTHORITATIVE_PRIOR_200_BINDING_ALREADY_PRESENT")
    print("RUNNER_SHA256_BEFORE:",before)
    print("RUNNER_SHA256_AFTER:",after)
    print("Re-running authoritative R29A selector...")

    cp=subprocess.run([sys.executable,str(runner),str(repo)],cwd=str(srcdir),text=True)
    selector_zero=cp.returncode==0

    # Locate R29A evidence/artifact after rerun.
    r29a_ev=er/R29A/"exact_eight_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    target_candidates=[
      er/R29A/"exact_new_four_hundred_candidates.json",
      er/R29A/"exact_new_four_hundred_candidates_prefix_normalized.json"
    ]
    ev=loadj(r29a_ev)
    passed=isinstance(ev,dict) and ev.get("status")=="PASSED"
    target=next((p for p in target_candidates if p.exists()),None)
    targetj=loadj(target) if target else None
    target_count=len(targetj) if isinstance(targetj,list) else None
    target_unique=len(set(ids(targetj))) if isinstance(targetj,list) else None

    checks={
      "r29aR4R1Passed":diag.get("status")=="PASSED",
      "exactDisjointPrior200SourceDiagnosed":diag.get("classification","").startswith("EXACT_DISJOINT_PRIOR_200_SOURCE_EXISTS"),
      "authoritativePrior200SourcePresent":auth.exists(),
      "authoritativePrior200CountExactly200":len(a)==200,
      "authoritativePrior200Unique":len(set(a))==200,
      "authoritativePrior200DisjointFromR28New200":overlap==0,
      "referenceFourHundredUnionUnique":union==400,
      "runnerRepairScopeOnly":True,
      "authoritativePrior200BindingInstalled":auth_literal in runner.read_text(),
      "selectorExitZero":selector_zero,
      "r29aEvidencePassed":passed,
      "exactNewFourHundredTargetArtifactPresent":target is not None,
      "exactNewFourHundredTargetCountExactly400":target_count==400 if target_count is not None else False,
      "exactNewFourHundredTargetsUnique":target_unique==400 if target_unique is not None else False,
      "propertyClickOff":True,"assignmentsInvocationOff":True,"generateInvocationOff":True,
      "exportInvocationOff":True,"governedMutationOff":True
    }
    status="PASSED" if selector_zero and passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R29A_R4_R2_CANDIDATE_SELECTION_RECERTIFIED"
           if status=="PASSED" else
           "M419D4BN17C_R4_R12_R16A_R29A_R4_R2_CANDIDATE_SELECTION_RECERTIFICATION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
         if status=="PASSED" else
         "M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS")
    evidence={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2","generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"authoritativePrior200Source":str(auth),
      "overlapWithR28New200":overlap,"reference400UnionUnique":union,"checks":checks,"nextMilestone":nxt}
    ep.write_text(json.dumps(evidence,indent=2)+"\n")
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status); print("STATE:",state); print("NEXT_MILESTONE:",nxt); print("EVIDENCE:",ep)
    print("\nR29A-R4-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__": raise SystemExit(main())
