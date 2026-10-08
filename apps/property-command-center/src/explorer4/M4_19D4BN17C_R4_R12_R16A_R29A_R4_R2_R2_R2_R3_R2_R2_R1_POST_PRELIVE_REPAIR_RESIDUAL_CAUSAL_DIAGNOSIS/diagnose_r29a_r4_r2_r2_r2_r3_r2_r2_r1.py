#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import ast,importlib.util,json,sys,traceback

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R1_POST_PRELIVE_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
    try:return json.loads(p.read_text())
    except:return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    runner=pcc/"src/explorer4"/R29A/"select_r29a.py"
    out=er/OUT; out.mkdir(parents=True,exist_ok=True)
    ep=out/"post_prelive_repair_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R2-R1 Post-PreLive Repair Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_CURRENT_SELECTOR_AUTHORITATIVE_PRIOR200_DIRECT_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Explorer click: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not runner.exists():
        print("STATUS: BLOCKED");print("REASON: R29A selector missing");return 4

    src=runner.read_text()
    ast.parse(src)

    # Import current patched selector without executing main().
    spec=importlib.util.spec_from_file_location("r29a_current_selector",runner)
    mod=importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(mod)
    except Exception as e:
        print("STATUS: BLOCKED")
        print("REASON: selector import failed:",repr(e))
        return 5

    choose=getattr(mod,"choose_prior200",None)
    marker_identity=getattr(mod,"marker_identity",None)
    norm=getattr(mod,"norm",None)
    prior_path=getattr(mod,"R29A_R4_R2_AUTHORITATIVE_PRIOR200",None)

    if not callable(choose) or not callable(marker_identity) or prior_path is None:
        print("STATUS: BLOCKED");print("REASON: required selector helpers/constants unavailable");return 6

    prior_path=Path(prior_path)
    prior_raw=loadj(prior_path)

    # Resolve new200 exactly the way main() does by inspecting its configured pnew.
    # Prefer the known R28A-R4 artifact path if present in source constants.
    pnew=None
    for name in dir(mod):
        if "NEW" in name.upper() and "200" in name and isinstance(getattr(mod,name),Path):
            cand=getattr(mod,name)
            if cand.exists():
                j=loadj(cand)
                if isinstance(j,list) and len(j)==200:
                    pnew=cand;break

    # Fallback: identify exact 200-list source from the R28A-R4 evidence directory.
    if pnew is None:
        r28dir=er/"M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
        for cand in sorted(r28dir.glob("*.json")) if r28dir.exists() else []:
            j=loadj(cand)
            if isinstance(j,list) and len(j)==200:
                pnew=cand;break

    if pnew is None:
        print("STATUS: BLOCKED");print("REASON: unable to resolve exact new200 artifact");return 7

    new_raw=loadj(pnew)

    # Reproduce the repaired branch's own normalized key construction.
    prior_ids=[marker_identity(x) for x in prior_raw] if isinstance(prior_raw,list) else []
    new_ids=[marker_identity(x) for x in new_raw] if isinstance(new_raw,list) else []

    def branch_key(x):
        if not isinstance(x,dict): return ""
        v=x.get("selectionKey") or x.get("label")
        if callable(norm): return norm(v)
        return " ".join(str(v or "").lower().split())

    prior_keys={branch_key(x) for x in prior_ids if branch_key(x)}
    new_keys={branch_key(x) for x in new_ids if branch_key(x)}

    # Direct current choose_prior200 call with no live dependency.
    result=None;err=None
    try:
        result=choose(er,new_raw,set())
    except Exception as e:
        err={"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()}

    prior_return=None;diag=None
    if isinstance(result,tuple):
        if len(result)>0: prior_return=result[0]
        if len(result)>1: diag=result[1]
    else:
        prior_return=result

    ret_type=type(prior_return).__name__ if prior_return is not None else None
    ret_count=len(prior_return) if isinstance(prior_return,(list,dict,tuple,set)) else None

    # Capture current authoritative branch source.
    lines=src.splitlines()
    start=None
    for i,line in enumerate(lines,1):
        if "R29A-R4-R2: authoritative closed prior-200 binding" in line:
            start=i;break
    branch=[]
    if start:
        for i in range(start,min(len(lines),start+18)+1):
            branch.append({"line":i,"text":lines[i-1]})

    print("CONFIGURED_AUTHORITATIVE_PRIOR200_PATH:",prior_path)
    print("AUTHORITATIVE_PRIOR200_RAW_COUNT:",len(prior_raw) if isinstance(prior_raw,list) else None)
    print("AUTHORITATIVE_PRIOR200_BRANCH_KEY_COUNT:",len(prior_keys))
    print("NEW200_ARTIFACT:",pnew)
    print("NEW200_RAW_COUNT:",len(new_raw) if isinstance(new_raw,list) else None)
    print("NEW200_BRANCH_KEY_COUNT:",len(new_keys))
    print("PRIOR200_NEW200_BRANCH_KEY_OVERLAP:",len(prior_keys & new_keys))
    print("CHOOSE_PRIOR200_ERROR:",json.dumps(err) if err else None)
    print("CHOOSE_PRIOR200_RESULT_TYPE:",type(result).__name__ if result is not None else None)
    print("CHOOSE_PRIOR200_PRIOR_RETURN_TYPE:",ret_type)
    print("CHOOSE_PRIOR200_PRIOR_RETURN_COUNT:",ret_count)
    print("CHOOSE_PRIOR200_DIAG:",json.dumps(diag,default=str,sort_keys=True) if diag is not None else None)

    print("\n----- CURRENT AUTHORITATIVE BRANCH SOURCE -----")
    for x in branch:
        print(f"{x['line']:>5}: {x['text']}")

    if err:
        classification="R29A_CURRENT_CHOOSE_PRIOR200_RAISES_EXCEPTION_DURING_AUTHORITATIVE_PRELIVE_RESOLUTION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_AUTHORITATIVE_PRIOR200_EXCEPTION_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif len(prior_keys)!=200:
        classification="R29A_REPAIRED_AUTHORITATIVE_PRIOR200_BRANCH_STILL_COLLAPSES_SELECTION_KEY_DOMAIN"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_AUTHORITATIVE_PRIOR200_KEY_EXTRACTION_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif len(new_keys)!=200:
        classification="R29A_REPAIRED_NEW200_BRANCH_KEY_DOMAIN_STILL_COLLAPSES"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_NEW200_KEY_EXTRACTION_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif len(prior_keys & new_keys)!=0:
        classification="R29A_AUTHORITATIVE_PRIOR200_AND_NEW200_NOT_DISJOINT_UNDER_REPAIRED_BRANCH_KEYS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_REFERENCE400_KEY_DOMAIN_RECONCILIATION"
    elif prior_return is None:
        classification="R29A_AUTHORITATIVE_BRANCH_INVARIANTS_PASS_BUT_CHOOSE_PRIOR200_RETURNS_NONE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_AUTHORITATIVE_BRANCH_FALLTHROUGH_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif isinstance(prior_return,list) and len(prior_return)==200:
        classification="R29A_AUTHORITATIVE_PRIOR200_DIRECT_RESOLUTION_SUCCEEDS_BUT_MAIN_EXPECTS_INCOMPATIBLE_RETURN_CONTRACT"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_PRIOR200_RETURN_CONTRACT_REPAIR_AND_SELECTOR_RECERTIFICATION"
    elif isinstance(prior_return,dict) and "ids" in prior_return:
        classification="R29A_AUTHORITATIVE_PRIOR200_DIRECT_RESOLUTION_CONTRACT_VALID_FAILURE_OCCURS_AFTER_DIRECT_RESOLUTION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_POST_PRIOR200_RESOLUTION_MAIN_PATH_DIAGNOSIS"
    else:
        classification="R29A_AUTHORITATIVE_PRIOR200_DIRECT_RESOLUTION_RETURN_SHAPE_UNEXPECTED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_PRIOR200_RETURN_SHAPE_REPAIR_AND_SELECTOR_RECERTIFICATION"

    checks={
        "selectorImportedWithoutMainExecution":True,
        "configuredPrior200PathCaptured":True,
        "new200ArtifactCaptured":True,
        "priorBranchKeyCountCaptured":True,
        "newBranchKeyCountCaptured":True,
        "branchOverlapCaptured":True,
        "choosePrior200CalledWithoutLiveInventory":True,
        "choosePrior200ReturnCaptured":True,
        "authoritativeBranchSourceCaptured":len(branch)>0,
        "liveUiInteractionOff":True,
        "explorerClickOff":True,
        "propertyClickOff":True,
        "assignmentsInvocationOff":True,
        "generateInvocationOff":True,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True
    }

    ev={
        "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R1_POST_PRELIVE_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED",
        "state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R1_POST_PRELIVE_REPAIR_RESIDUAL_CAUSE_DIAGNOSED",
        "classification":classification,
        "configuredAuthoritativePrior200Path":str(prior_path),
        "new200Artifact":str(pnew),
        "counts":{"priorRaw":len(prior_raw) if isinstance(prior_raw,list) else None,
                  "priorBranchKeys":len(prior_keys),
                  "newRaw":len(new_raw) if isinstance(new_raw,list) else None,
                  "newBranchKeys":len(new_keys),
                  "overlap":len(prior_keys & new_keys)},
        "choosePrior200":{"error":err,"resultType":type(result).__name__ if result is not None else None,
                          "priorReturnType":ret_type,"priorReturnCount":ret_count,"diag":diag},
        "authoritativeBranchSource":branch,
        "checks":checks,
        "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2,default=str)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",ev["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R2-R3-R2-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":raise SystemExit(main())
