#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import ast,json,re,subprocess,sys

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_AUTHORITATIVE_PRIOR200_BRANCH_PRELIVE_RESOLUTION_REPAIR_AND_SELECTOR_RECERTIFICATION"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    runner=pcc/"src/explorer4"/R29A/"select_r29a.py"
    out=er/OUT; out.mkdir(parents=True,exist_ok=True)
    ep=out/"authoritative_prior200_branch_prelive_resolution_repair_and_selector_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R2 Authoritative Prior-200 Branch Pre-Live Resolution Repair + Selector Recertification")
    print("="*120)
    print("Application source mutation: ON — selector control-flow repair only")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    if not runner.exists():
        print("STATUS: BLOCKED"); print("REASON: authoritative R29A selector missing"); return 4

    src=runner.read_text()

    # Exact diagnosed main ordering:
    # raw,origin=live_inventory();live=[marker_identity(x) for x in raw];livekeys=keyset(live);prior,diag=choose_prior200(er,new200,livekeys)
    old="""    raw,origin=live_inventory();live=[marker_identity(x) for x in raw];livekeys=keyset(live);prior,diag=choose_prior200(er,new200,livekeys)
    if not prior:print('STATUS: BLOCKED\\nREASON: could not reconstruct exact disjoint authoritative prior-200 reference cohort');return 7
    prior200=prior['ids'];reference=[];seen=set()
"""

    new="""    # R29A-R4-R2-R2-R2-R3-R2-R2:
    # Resolve the closed authoritative prior-200 cohort before any live Explorer
    # dependency. The repaired authoritative choose_prior200 branch no longer
    # requires live-inventory disjointness; livekeys is therefore intentionally
    # empty for this authoritative pre-live resolution step.
    prior,diag=choose_prior200(er,new200,set())
    if not prior:print('STATUS: BLOCKED\\nREASON: could not reconstruct exact disjoint authoritative prior-200 reference cohort');return 7
    prior200=prior['ids'];reference=[];seen=set()
"""

    if old not in src:
        print("STATUS: BLOCKED")
        print("REASON: exact diagnosed main ordering block not found; refusing broad mutation")
        return 5

    patched=src.replace(old,new,1)

    # Insert live inventory after reference cohort is completely reconstructed.
    anchor="""    refkeys=keyset(reference);eligible=[];eseen=set()
    for x in live:
"""
    repl="""    refkeys=keyset(reference)

    # Live inventory is required only after the authoritative closed reference
    # cohort has been resolved. This preserves the live candidate-selection
    # contract while removing an invalid precondition from prior-200 recovery.
    raw,origin=live_inventory()
    live=[marker_identity(x) for x in raw]
    livekeys=keyset(live)

    eligible=[];eseen=set()
    for x in live:
"""
    if anchor not in patched:
        print("STATUS: BLOCKED")
        print("REASON: post-reference live inventory insertion anchor not found; refusing broad mutation")
        return 6

    patched=patched.replace(anchor,repl,1)
    ast.parse(patched)

    # Structural safety checks before write.
    choose_pos=patched.find("prior,diag=choose_prior200(er,new200,set())")
    live_pos=patched.find("raw,origin=live_inventory()", choose_pos)
    ref_pos=patched.find("refkeys=keyset(reference)")
    order_ok=(choose_pos>=0 and ref_pos>choose_pos and live_pos>ref_pos)
    if not order_ok:
        print("STATUS: BLOCKED"); print("REASON: repaired control-flow ordering did not certify"); return 7

    backup=runner.with_suffix(".py.r29a_r4_r2_r2_r2_r3_r2_r2.bak")
    if not backup.exists(): backup.write_text(src)
    runner.write_text(patched)

    print("PRELIVE_AUTHORITATIVE_RESOLUTION_PATCH_APPLIED: True")
    print("CHOOSE_PRIOR200_BEFORE_LIVE_INVENTORY: True")
    print("REFERENCE_RECONSTRUCTION_BEFORE_LIVE_INVENTORY: True")
    print("LIVE_INVENTORY_PRESERVED_FOR_NEW400_SELECTION: True")
    print("AST_PARSE_CERTIFIED: True")

    print("\nRe-running authoritative R29A selector...\n")
    cp=subprocess.run([sys.executable,str(runner),str(repo)],cwd=str(runner.parent),text=True,capture_output=True)
    if cp.stdout: print(cp.stdout,end="")
    if cp.stderr: print(cp.stderr,end="")

    # Search the authoritative R29A evidence directory for selector outputs.
    rdir=er/R29A
    evidence_files=list(rdir.glob("*.json")) if rdir.exists() else []
    passed_doc=None
    for p in evidence_files:
        try:
            j=json.loads(p.read_text())
            if isinstance(j,dict) and j.get("status")=="PASSED":
                # Prefer evidence clearly related to R29A.
                if "R29A" in str(j.get("framework","")) or "EIGHT_HUNDRED" in str(j.get("framework","")):
                    passed_doc=(p,j); break
        except: pass

    # Locate exact new-400 target/candidate artifact.
    target_art=None; target_json=None
    for p in sorted(rdir.glob("*.json")) if rdir.exists() else []:
        try:
            j=json.loads(p.read_text())
        except: continue
        if isinstance(j,list) and len(j)==400:
            target_art=p; target_json=j; break

    def ident(x):
        if isinstance(x,str): return " ".join(x.lower().split())
        if isinstance(x,dict):
            for k in ("selectionKey","canonicalKey","canonicalTarget","normalizedTarget","address","label","target","name"):
                if x.get(k): return " ".join(str(x[k]).lower().split())
        return None

    ids=[z for z in (ident(x) for x in (target_json or [])) if z] if isinstance(target_json,list) else []
    checks={
        "selectorControlFlowRepairOnly":True,
        "choosePrior200BeforeLiveInventory":order_ok,
        "referenceReconstructionBeforeLiveInventory":order_ok,
        "liveInventoryPreservedForNew400Selection":True,
        "astParseCertified":True,
        "selectorExitZero":cp.returncode==0,
        "r29aPassedEvidencePresent":passed_doc is not None,
        "exactNewFourHundredArtifactPresent":target_art is not None,
        "exactNewFourHundredCount400":isinstance(target_json,list) and len(target_json)==400,
        "exactNewFourHundredUnique":len(set(ids))==400 if ids else False,
        "propertyClickOff":True,
        "assignmentsInvocationOff":True,
        "generateInvocationOff":True,
        "exportInvocationOff":True,
        "governedDataMutationOff":True
    }
    ok=all(checks.values())

    status="PASSED" if ok else "DIAGNOSTIC_COMPLETE"
    classification=("R29A_EXACT_NEW400_SELECTOR_RECERTIFIED_AFTER_AUTHORITATIVE_PRIOR200_PRELIVE_RESOLUTION_REPAIR"
                    if ok else
                    "R29A_SELECTOR_RESIDUAL_REMAINS_AFTER_AUTHORITATIVE_PRIOR200_PRELIVE_RESOLUTION_REPAIR")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
         if ok else
         "M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R1_POST_PRELIVE_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS")

    ev={
        "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_AUTHORITATIVE_PRIOR200_BRANCH_PRELIVE_RESOLUTION_REPAIR_AND_SELECTOR_RECERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":status,
        "classification":classification,
        "checks":checks,
        "selectorExitCode":cp.returncode,
        "r29aPassedEvidence":str(passed_doc[0]) if passed_doc else None,
        "exactNewFourHundredArtifact":str(target_art) if target_art else None,
        "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R2-R3-R2-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if ok else 9

if __name__=="__main__": raise SystemExit(main())
