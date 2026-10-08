#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib,subprocess,shutil

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
R29A_R3="M4_19D4BN17C_R4_R12_R16A_R29A_R3_EXPLORER_CONTROL_SETTLE_RESIDUAL_CAUSAL_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_PAGE_READY_ANCHORED_EXPLORER_SETTLE_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"

OLD = """def settle_explorer(w):
    st=time.time();anchor=None
    while time.time()-st<=5:
        if ev(w,'document.readyState')=='complete' and (ev(w,\"document.querySelectorAll('button').length\") or 0)>0 and ev(w,'location.origin')==APP_ORIGIN:anchor=time.time();break
        time.sleep(.05)
    if anchor is None:return False
    con=0
    while time.time()-anchor<=2:
        ok=exact_btn(w,'Explorer')==1 and ev(w,'location.origin')==APP_ORIGIN;con=con+1 if ok else 0
        if con>=3:return True
        time.sleep(.1)
    return False
"""

NEW = """def settle_explorer(w):
    # R29A-R4 page-ready anchored Explorer settle repair.
    # Preserve certified policy: app origin + document complete + nonzero
    # button DOM, then 3 consecutive unique Explorer samples within 2.0 sec.
    st=time.time();anchor=None
    while time.time()-st<=5.0:
        ready=ev(w,'document.readyState')
        buttons=ev(w,\"document.querySelectorAll('button').length\")
        origin=ev(w,'location.origin')
        if ready=='complete' and isinstance(buttons,(int,float)) and buttons>0 and origin==APP_ORIGIN:
            anchor=time.time();break
        time.sleep(.05)
    if anchor is None:return False
    consecutive=0
    while time.time()-anchor<=2.0:
        ready=ev(w,'document.readyState')
        buttons=ev(w,\"document.querySelectorAll('button').length\")
        origin=ev(w,'location.origin')
        explorer_count=exact_btn(w,'Explorer')
        valid=(ready=='complete' and isinstance(buttons,(int,float)) and buttons>0 and origin==APP_ORIGIN and explorer_count==1)
        consecutive=consecutive+1 if valid else 0
        if consecutive>=3:return True
        time.sleep(.10)
    return False
"""

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def loadj(p):
    try:return json.loads(p.read_text())
    except:return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/'apps/property-command-center'
    src=app/'src/explorer4'/R29A/'select_r29a.py'
    er=app/'evidence/explorer4'
    diag=er/R29A_R3/'explorer_control_settle_residual_causal_diagnosis.json'
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/'page_ready_anchored_explorer_settle_repair_and_candidate_selection_recertification.json'
    print('='*120)
    print('SCIIP Explorer 4.0 — R29A-R4 Page-Ready Anchored Explorer Settle Repair + Candidate Selection Recertification')
    print('='*120)
    print('Mode: RUNNER_ONLY_SETTLE_HELPER_REPAIR_AND_SELECTOR_RECERTIFICATION')
    print('Application source mutation: RUNNER_REPAIR_ONLY')
    print('Governed data mutation: OFF')
    print('Property click: OFF')
    print('Assignments invocation: OFF')
    print('Generate invocation: OFF')
    print('Export invocation: OFF')
    j=loadj(diag)
    if not isinstance(j,dict) or j.get('status')!='PASSED':
        print('STATUS: BLOCKED');print('REASON: authoritative R29A-R3 diagnosis missing');return 4
    first=j.get('firstUniqueExplorerSeconds');stable=j.get('stableLastFiveSamples')
    if first is None or float(first)>2.0 or stable is not True:
        print('STATUS: BLOCKED');print('REASON: R29A-R3 did not prove stable Explorer materialization within two seconds');return 5
    if not src.exists():
        print('STATUS: BLOCKED');print('REASON: installed R29A selector missing');return 6
    before=sha(src);text=src.read_text()
    if NEW in text:
        action='ALREADY_PATCHED_HASH_VERIFIED'
    elif OLD in text:
        backup=out/'select_r29a_pre_r4.py'
        if not backup.exists():shutil.copy2(src,backup)
        src.write_text(text.replace(OLD,NEW,1));action='SETTLE_HELPER_PATCHED'
    else:
        print('STATUS: BLOCKED');print('REASON: exact R29A settle helper source shape not recognized; refusing broad mutation');return 7
    after=sha(src);patched=NEW in src.read_text();s=src.read_text()
    two_sec='time.time()-anchor<=2.0' in s
    three_sample='consecutive>=3' in s
    page_ready="ready=='complete'" in s and 'buttons>0' in s and 'origin==APP_ORIGIN' in s
    print('R29A_R3_FIRST_UNIQUE_EXPLORER_SECONDS:',first)
    print('R29A_R3_STABLE_LAST_FIVE_SAMPLES:',stable)
    print('RUNNER_REPAIR_ACTION:',action)
    print('RUNNER_SHA256_BEFORE:',before)
    print('RUNNER_SHA256_AFTER:',after)
    print('TWO_SECOND_BOUND_PRESERVED:',two_sec)
    print('THREE_SAMPLE_GUARD_PRESERVED:',three_sample)
    print('PAGE_READY_ANCHOR_PRESERVED:',page_ready)
    print('\nRe-running R29A candidate-selection workflow...\n')
    cp=subprocess.run([sys.executable,str(src),str(repo)])
    r29a_ev=er/R29A/'exact_eight_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json'
    r29a=loadj(r29a_ev) if r29a_ev.exists() else {}
    target=er/R29A/'exact_new_four_hundred_candidates.json'
    checks={
      'r29aR3Passed':True,
      'r29aR3ExplorerMaterializedWithinTwoSeconds':float(first)<=2.0,
      'r29aR3ExplorerStable':stable is True,
      'runnerRepairScopeOnly':True,
      'exactSettleHelperPatchInstalled':patched,
      'pageReadyAnchorPreserved':page_ready,
      'twoSecondExplorerBoundPreserved':two_sec,
      'threeSampleExplorerGuardPreserved':three_sample,
      'selectorExitZero':cp.returncode==0,
      'r29aEvidencePresent':r29a_ev.exists(),
      'r29aStatusPassed':isinstance(r29a,dict) and r29a.get('status')=='PASSED',
      'exactNewFourHundredTargetArtifactPresent':target.exists(),
      'propertyClickOff':True,'assignmentsInvocationOff':True,'generateInvocationOff':True,'exportInvocationOff':True,'governedMutationOff':True}
    ok=all(checks.values())
    status='PASSED' if ok else 'DIAGNOSTIC_COMPLETE'
    state='M419D4BN17C_R4_R12_R16A_R29A_R4_PAGE_READY_EXPLORER_SETTLE_REPAIRED_EXACT_NEW_400_CANDIDATE_SELECTION_RECERTIFIED' if ok else 'M419D4BN17C_R4_R12_R16A_R29A_R4_SELECTOR_RECERTIFICATION_INCOMPLETE'
    nxt='M4_19D4BN17C_R4_R12_R16A_R29B_FOUR_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION' if ok else 'M4_19D4BN17C_R4_R12_R16A_R29A_R4_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS'
    evd={'framework':'SCIIP_EXPLORER_4_R29A_R4_PAGE_READY_ANCHORED_EXPLORER_SETTLE_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION','generatedAt':datetime.now(timezone.utc).isoformat(),'status':status,'state':state,'classification':'R29A_TRANSIENT_EXPLORER_SETTLE_REPAIRED_WITH_PAGE_READY_ANCHORED_THREE_SAMPLE_TWO_SECOND_GUARD_EXACT_NEW_400_CANDIDATE_SELECTION_RECERTIFIED' if ok else 'R29A_POST_SETTLE_REPAIR_CANDIDATE_SELECTION_GAP_REMAINS','runnerRepairAction':action,'runnerSha256Before':before,'runnerSha256After':after,'r29aEvidence':str(r29a_ev),'targetArtifact':str(target) if target.exists() else None,'targetArtifactSha256':sha(target) if target.exists() else None,'checks':checks,'nextMilestone':nxt}
    ep.write_text(json.dumps(evd,indent=2)+'\n')
    print('\n----- CHECKS -----')
    for k,v in checks.items():print(f'{k}: {v}')
    print('STATUS:',status);print('STATE:',state);print('CLASSIFICATION:',evd['classification']);print('NEXT_MILESTONE:',nxt);print('EVIDENCE:',ep)
    print('\nR29A-R4 EXECUTION COMPLETE — paste complete output into ChatGPT.')
    return 0 if ok else 1
if __name__=='__main__':raise SystemExit(main())
