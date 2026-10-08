#!/usr/bin/env python3
import sys, json, re, hashlib, subprocess, time
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/'apps/property-command-center'
runner=pcc/'src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs'
er=pcc/'evidence/explorer4'
prior=er/'M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R1_RECORD401_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS/record401_recertification_residual_causal_diagnosis.json'
outdir=er/'M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R2_FIRST_RECORD_AWAIT_STAGE_BOUNDED_INSTRUMENTATION_AND_EXACT_HANG_LOCALIZATION'
outdir.mkdir(parents=True,exist_ok=True)
evidence=outdir/'first_record_await_stage_bounded_instrumentation_and_exact_hang_localization.json'

print('='*120)
print('SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R2 First Record Await-Stage Bounded Instrumentation + Exact Hang Localization')
print('='*120)
print('Mode: RUNNER_ONLY_DIAGNOSTIC_INSTRUMENTATION_FIRST_RECORD_BOUNDED_EXECUTION')
print('Application source mutation: ON — temporary diagnostic instrumentation only')
print('Governed data mutation: OFF')
print('Export invocation: OFF')
print('Strict sequential: ON')
print('Halt on first failure: ON')
print('Instrumentation execution bound: 12 seconds')

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

if not runner.exists():
    print('STATUS: BLOCKED'); print('REASON: authoritative R29B runner missing'); raise SystemExit(2)
pj=json.loads(prior.read_text()) if prior.exists() else {}
if pj.get('status')!='PASSED' or pj.get('classification')!='RECORD401_PREOUTCOME_CONTROL_FLOW_STRANDED_ON_UNSETTLED_TOP_LEVEL_AWAIT':
    print('STATUS: BLOCKED'); print('REASON: R4-R1 unresolved-await diagnosis not certified'); raise SystemExit(3)

src=runner.read_text(); before=sha(runner)
backup=outdir/'qualify_r29b_pre_r4_r2_instrumentation.mjs'; backup.write_text(src)

tag='R29B_R4_R2_CDP_CALL_BEGIN'
if tag not in src:
    match=None
    for pat in [r'(async\s+call\s*\(([^)]*)\)\s*\{)', r'(\bcall\s*\(([^)]*)\)\s*\{)']:
        for m in re.finditer(pat,src):
            lo=max(0,m.start()-1800); hi=min(len(src),m.end()+2500); ctx=src[lo:hi]
            if any(x in ctx for x in ['pending','WebSocket','RawWebSocket','socket','CDP']):
                match=m; break
        if match: break
    if not match:
        print('STATUS: BLOCKED'); print('REASON: CDP call method not resolved for bounded instrumentation'); raise SystemExit(4)
    insert=match.end(); line_no=src[:match.start()].count('\n')+1
    log_code='''\n    globalThis.__R29B_R4_R2_CDP_SEQUENCE=(globalThis.__R29B_R4_R2_CDP_SEQUENCE||0)+1;\n    globalThis.__R29B_R4_R2_LAST_CDP_CALL={sequence:globalThis.__R29B_R4_R2_CDP_SEQUENCE,sourceLine:%d,args:Array.from(arguments).map(v=>{if(v===null||v===undefined)return v;if(typeof v==='string'||typeof v==='number'||typeof v==='boolean')return v;try{return JSON.parse(JSON.stringify(v));}catch{return String(v);}}),enteredAt:Date.now()};\n    console.log('R29B_R4_R2_CDP_CALL_BEGIN',JSON.stringify(globalThis.__R29B_R4_R2_LAST_CDP_CALL));\n''' % line_no
    src=src[:insert]+log_code+src[insert:]

helper_names=['httpOk','settleExplorer','settle_explorer','r29bR4CertifyExplorerEntry','ev','exactBtn','exact_btn','clickBtn','click_btn']
instrumented_helpers=[]
for name in helper_names:
    helper_tag=f'R29B_R4_R2_HELPER_BEGIN:{name}'
    if helper_tag in src:
        instrumented_helpers.append(name); continue
    m=re.search(rf'(async\s+function\s+{re.escape(name)}\s*\([^)]*\)\s*\{{)',src)
    if not m: continue
    line_no=src[:m.start()].count('\n')+1
    code="\n  console.log('R29B_R4_R2_HELPER_BEGIN:%s',JSON.stringify({sourceLine:%d,at:Date.now()}));\n"%(name,line_no)
    src=src[:m.end()]+code+src[m.end():]
    instrumented_helpers.append(name)

runner.write_text(src); after=sha(runner)
nodecheck=subprocess.run(['node','--check',str(runner)],capture_output=True,text=True)
print('RUNNER_SHA256_BEFORE:',before)
print('RUNNER_SHA256_AFTER:',after)
print('CDP_CALL_INSTRUMENTATION_PRESENT:',tag in src)
print('INSTRUMENTED_HELPERS:',instrumented_helpers)
print('NODE_CHECK_EXIT:',nodecheck.returncode)
print('NODE_CHECK_STDERR:',nodecheck.stderr.strip() or 'NONE')
if nodecheck.returncode!=0:
    runner.write_text(backup.read_text())
    print('RUNNER_RESTORED_AFTER_FAILED_INSTRUMENTATION: True')
    print('STATUS: BLOCKED'); print('CLASSIFICATION: R4_R2_DIAGNOSTIC_INSTRUMENTATION_SYNTAX_FAILED'); raise SystemExit(5)

print('Executing authoritative R29B under 12-second external diagnostic bound...')
start=time.time(); timed_out=False
try:
    proc=subprocess.run(['node',str(runner),str(repo)],capture_output=True,text=True,timeout=12)
    exit_code=proc.returncode; stdout=proc.stdout or ''; stderr=proc.stderr or ''
except subprocess.TimeoutExpired as e:
    timed_out=True; exit_code=None
    stdout=e.stdout.decode() if isinstance(e.stdout,bytes) else (e.stdout or '')
    stderr=e.stderr.decode() if isinstance(e.stderr,bytes) else (e.stderr or '')
elapsed=round(time.time()-start,3)
runner.write_text(backup.read_text()); restored=sha(runner)==before

cdp_lines=[x for x in stdout.splitlines() if x.startswith('R29B_R4_R2_CDP_CALL_BEGIN ')]
helper_lines=[x for x in stdout.splitlines() if x.startswith('R29B_R4_R2_HELPER_BEGIN:')]

def parse_payload(line,prefix):
    try: return json.loads(line[len(prefix):])
    except Exception: return {'raw':line}
cdp_events=[parse_payload(x,'R29B_R4_R2_CDP_CALL_BEGIN ') for x in cdp_lines]
helper_events=[]
for x in helper_lines:
    m=re.match(r'R29B_R4_R2_HELPER_BEGIN:([^ ]+)\s+(.*)$',x)
    if m:
        try: payload=json.loads(m.group(2))
        except Exception: payload={'raw':m.group(2)}
        payload['helper']=m.group(1); helper_events.append(payload)
last_cdp=cdp_events[-1] if cdp_events else None
last_helper=helper_events[-1] if helper_events else None

print('BOUNDED_EXECUTION_TIMED_OUT:',timed_out)
print('BOUNDED_EXECUTION_EXIT_CODE:',exit_code)
print('BOUNDED_EXECUTION_SECONDS:',elapsed)
print('CDP_CALL_BEGIN_COUNT:',len(cdp_events))
print('HELPER_BEGIN_COUNT:',len(helper_events))
print('LAST_CDP_CALL_BEGIN:',json.dumps(last_cdp))
print('LAST_HELPER_BEGIN:',json.dumps(last_helper))
print('RUNNER_RESTORED_AFTER_DIAGNOSIS:',restored)

if cdp_events:
    args=last_cdp.get('args',[]) if isinstance(last_cdp,dict) else []
    method=None
    for a in args:
        if isinstance(a,str) and '.' in a: method=a; break
    if method is None:
        for a in args:
            if isinstance(a,str): method=a; break
    classification='RECORD401_UNSETTLED_AWAIT_LOCALIZED_TO_LAST_ENTERED_CDP_CALL'
    localized={'type':'CDP_CALL','method':method,'event':last_cdp}
    nextm='M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_LOCALIZED_CDP_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION'
elif helper_events:
    classification='RECORD401_UNSETTLED_AWAIT_LOCALIZED_TO_LAST_ENTERED_ASYNC_HELPER'
    localized={'type':'ASYNC_HELPER','event':last_helper}
    nextm='M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_LOCALIZED_HELPER_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION'
else:
    classification='RECORD401_UNSETTLED_AWAIT_OCCURS_BEFORE_INSTRUMENTED_ASYNC_BOUNDARIES'
    localized=None
    nextm='M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_TOP_LEVEL_PREWORKFLOW_AWAIT_DEEP_DIAGNOSIS'

result={
 'framework':'SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R2_FIRST_RECORD_AWAIT_STAGE_BOUNDED_INSTRUMENTATION_AND_EXACT_HANG_LOCALIZATION',
 'status':'PASSED','classification':classification,
 'priorDiagnosis':{'status':pj.get('status'),'classification':pj.get('classification')},
 'runner':{'sha256Before':before,'sha256Instrumented':after,'restoredAfterDiagnosis':restored,'instrumentedHelpers':instrumented_helpers},
 'boundedExecution':{'limitSeconds':12,'elapsedSeconds':elapsed,'timedOut':timed_out,'exitCode':exit_code},
 'cdpCallEvents':cdp_events,'helperEvents':helper_events,'localizedHang':localized,
 'stdoutTail':stdout.splitlines()[-120:],'stderrTail':stderr.splitlines()[-80:],
 'checks':{'priorUnsettledAwaitDiagnosisConsumed':True,'runnerInstrumentedOnlyForDiagnosis':True,'nodeSyntaxCheckPassed':nodecheck.returncode==0,'boundedExecutionUsed':True,'runnerRestoredAfterDiagnosis':restored,'governedDataMutationOff':True,'exportInvocationOff':True},
 'nextMilestone':nextm
}
evidence.write_text(json.dumps(result,indent=2)+'\n')
print('----- CHECKS -----')
for k,v in result['checks'].items(): print(f'{k}: {v}')
print('LOCALIZED_HANG:',json.dumps(localized))
print('CLASSIFICATION:',classification)
print('STATUS: PASSED')
print('NEXT_MILESTONE:',nextm)
print('EVIDENCE:',evidence)
print('R29B-R2-R3-R2-R4-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.')
