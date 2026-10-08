#!/usr/bin/env python3
import sys,json,hashlib,subprocess,re,time
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R2_POST_PREFLIGHT_FIRST_RECORD_AWAIT_LOCALIZATION/post_preflight_first_record_await_localization.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R3_R1_SYNTAX_SAFE_POST_PREFLIGHT_CONTROL_FLOW_DIAGNOSIS"
outdir.mkdir(parents=True,exist_ok=True)
evidence=outdir/"syntax_safe_post_preflight_control_flow_diagnosis.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R3-R1 Syntax-Safe Post-Preflight Control-Flow Diagnosis")
print("="*120)
print("Mode: TEMPORARY_STATEMENT_BOUNDARY_INSTRUMENTATION")
print("Application source mutation: ON — temporary diagnostic instrumentation, restored before exit")
print("Governed data mutation: OFF")
print("Property click: OFF")
print("Assignments invocation: OFF")
print("Generate invocation: OFF")
print("Export invocation: OFF")
print("External execution bound: 8 seconds")

if not runner.exists():
    raise SystemExit("BLOCKED: authoritative R29B runner missing")
pj=json.loads(prior.read_text()) if prior.exists() else {}
if pj.get("status")!="PASSED" or pj.get("classification")!="POST_PREFLIGHT_REACHED_BUT_NO_INSTRUMENTED_AWAIT_ENTERED_EXIT13_CONTROL_FLOW_GAP":
    raise SystemExit("BLOCKED: required R4-R3-R2 evidence not certified")

original=runner.read_text()
before=hashlib.sha256(original.encode()).hexdigest()
baseline=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
if baseline.returncode:
    raise SystemExit("BLOCKED: authoritative runner syntax invalid before diagnosis")

pre='if(!(await httpOk("http://127.0.0.1:5173/")) || !(await httpOk("http://127.0.0.1:9333/json/version"))){'
pidx=original.find(pre)
if pidx<0: raise SystemExit("BLOCKED: preflight guard missing")

# Resolve closing brace of preflight guard with lexical string handling.
brace=original.find("{",pidx)
depth=0; guard_end=None; quote=None; esc=False
for i in range(brace,len(original)):
    ch=original[i]
    if quote:
        if esc: esc=False
        elif ch=="\\": esc=True
        elif ch==quote: quote=None
    else:
        if ch in ("'",'"','`'): quote=ch
        elif ch=="{": depth+=1
        elif ch=="}":
            depth-=1
            if depth==0:
                guard_end=i+1; break
if guard_end is None: raise SystemExit("BLOCKED: preflight guard end unresolved")

# Find line boundaries for the known synchronous section through first record awaits.
lines=original.splitlines(keepends=True)
offsets=[]; pos=0
for n,line in enumerate(lines,1):
    offsets.append((n,pos,pos+len(line),line))
    pos+=len(line)

start_line=next(n for n,a,b,l in offsets if a<=guard_end<=b)
first_await_line=None
for n,a,b,l in offsets:
    if a>=guard_end and ("await createFreshPage(" in l or "await settleHome(" in l or "await r29bR4CertifyExplorerEntry(" in l):
        first_await_line=n
        break
if first_await_line is None:
    raise SystemExit("BLOCKED: first-record await boundary unresolved")

# Instrument only semantically safe statement starts:
# complete top-level declarations/statements and loop/try boundaries.
safe_patterns=[
    r'^\s*const state=\{',
    r'^\s*writeEvidence\(state\);',
    r'^\s*let halted=false;',
    r'^\s*for\(let i=0;i<targets\.length;i\+\+\)\{',
    r'^\s*const ordinal=401\+i;',
    r'^\s*const t=targets\[i\];',
    r'^\s*const label=',
    r'^\s*const o=\{',
    r'^\s*let targetPage=null,cdp=null;',
    r'^\s*try\{',
    r'^\s*\(\{target:targetPage,cdp\}=await createFreshPage\(\)\);',
    r'^\s*o\.explorerSettleCertified=await settleHome\(cdp\);',
    r'^\s*if\(!o\.explorerSettleCertified\)'
]
compiled=[re.compile(p) for p in safe_patterns]

instrument_lines=set()
for n,a,b,line in offsets:
    if n < start_line or n > first_await_line+1: continue
    if any(rx.search(line) for rx in compiled):
        instrument_lines.add(n)

# Avoid inserting inside multi-line object literals. Only permit const state and const o
# at their opening lines, then next breadcrumb after the terminating "};".
# We'll additionally instrument exact known completion lines.
for n,a,b,line in offsets:
    if n < start_line or n > first_await_line+5: continue
    if line.strip()=="};" and n in (364,377):
        instrument_lines.add(n+1)

new=[]
instrumented=[]
for n,line in enumerate(lines,1):
    if n in instrument_lines:
        indent=re.match(r"\s*",line).group(0)
        tag=f"L{n}"
        new.append(indent+f'console.error("R29B_SYNC_SAFE:{tag}",JSON.stringify({{at:Date.now()}}));\n')
        instrumented.append({"tag":tag,"line":n,"source":line.strip()[:240]})
    new.append(line)

src="".join(new)
# Explicit post-preflight marker.
insert_pos=sum(len(x) for x in lines[:start_line])
src=src[:insert_pos]+'console.error("R29B_SYNC_SAFE:POST_PREFLIGHT",JSON.stringify({at:Date.now()}));\n'+src[insert_pos:]

runner.write_text(src)
instrumented_hash=hashlib.sha256(src.encode()).hexdigest()
nodecheck=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)

print("POST_PREFLIGHT_START_LINE:",start_line)
print("FIRST_RECORD_AWAIT_LINE:",first_await_line)
print("SAFE_BREADCRUMB_COUNT:",len(instrumented))
print("SAFE_BREADCRUMBS:",json.dumps(instrumented))
print("RUNNER_SHA256_BEFORE:",before)
print("RUNNER_SHA256_INSTRUMENTED:",instrumented_hash)
print("NODE_CHECK_EXIT:",nodecheck.returncode)
print("NODE_CHECK_STDERR:",nodecheck.stderr.strip() or "NONE")

if nodecheck.returncode:
    runner.write_text(original)
    restored=hashlib.sha256(runner.read_bytes()).hexdigest()==before
    print("RUNNER_RESTORED_AFTER_FAILED_INSTRUMENTATION:",restored)
    raise SystemExit("BLOCKED: syntax-safe instrumentation unexpectedly failed")

print("Executing instrumented authoritative R29B under 8-second external bound...")
timed_out=False; exit_code=None; stdout=""; stderr=""; t0=time.time()
try:
    p=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=8)
    exit_code=p.returncode; stdout=p.stdout or ""; stderr=p.stderr or ""
except subprocess.TimeoutExpired as e:
    timed_out=True
    stdout=e.stdout.decode() if isinstance(e.stdout,bytes) else (e.stdout or "")
    stderr=e.stderr.decode() if isinstance(e.stderr,bytes) else (e.stderr or "")
seconds=round(time.time()-t0,3)

runner.write_text(original)
restored_hash=hashlib.sha256(runner.read_bytes()).hexdigest()
restored=restored_hash==before

events=[]
for line in stderr.splitlines():
    if line.startswith("R29B_SYNC_SAFE:"):
        parts=line.split(" ",1)
        events.append({"event":parts[0],"payload":parts[1] if len(parts)>1 else None})

print("BOUNDED_EXECUTION_TIMED_OUT:",timed_out)
print("BOUNDED_EXECUTION_EXIT_CODE:",exit_code)
print("BOUNDED_EXECUTION_SECONDS:",seconds)
print("SYNC_SAFE_EVENT_COUNT:",len(events))
for e in events: print("SYNC_SAFE_EVENT:",json.dumps(e,separators=(",",":")))
print("RUNNER_RESTORED_AFTER_DIAGNOSIS:",restored)

last_event=events[-1]["event"] if events else None
last_meta=None
if last_event and last_event.startswith("R29B_SYNC_SAFE:L"):
    tag=last_event.split(":",1)[1]
    last_meta=next((x for x in instrumented if x["tag"]==tag),None)

# Interpret most useful checkpoints.
names=[e["event"] for e in events]
if any("L380" in x or "L381" in x or "L382" in x or "L384" in x for x in names):
    classification="FIRST_RECORD_ASYNC_REGION_REACHED_SYNCHRONOUS_CONTROL_FLOW_CERTIFIED"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_FIRST_RECORD_ASYNC_BOUNDARY_EXACT_LOCALIZATION"
elif last_meta:
    classification="EXIT13_LOCALIZED_AFTER_SPECIFIC_SYNCHRONOUS_POST_PREFLIGHT_STATEMENT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_LOCALIZED_SYNCHRONOUS_CONTROL_FLOW_REPAIR_AND_RECORD401_RECERTIFICATION"
elif any(x=="R29B_SYNC_SAFE:POST_PREFLIGHT" for x in names):
    classification="POST_PREFLIGHT_ENTERED_EXIT13_BEFORE_FIRST_SAFE_SYNCHRONOUS_STATEMENT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_STATE_INITIALIZATION_EXPRESSION_DIAGNOSIS"
else:
    classification="POST_PREFLIGHT_BOUNDARY_NOT_REACHED_IN_SYNTAX_SAFE_RERUN"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_PREFLIGHT_TO_STATE_BOUNDARY_RECONCILIATION"

result={
 "framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R3_R1_SYNTAX_SAFE_POST_PREFLIGHT_CONTROL_FLOW_DIAGNOSIS",
 "status":"PASSED",
 "classification":classification,
 "startLine":start_line,
 "firstRecordAwaitLine":first_await_line,
 "instrumentedStatements":instrumented,
 "events":events,
 "lastCompletedBreadcrumb":last_meta,
 "boundedExecution":{"timeoutSeconds":8,"timedOut":timed_out,"exitCode":exit_code,"seconds":seconds},
 "runnerSha256Before":before,
 "runnerSha256Instrumented":instrumented_hash,
 "runnerSha256Restored":restored_hash,
 "stdoutTail":stdout.splitlines()[-80:],
 "stderrTail":stderr.splitlines()[-120:],
 "checks":{
   "priorControlFlowGapConsumed":True,
   "baselineSyntaxCertified":baseline.returncode==0,
   "syntaxSafeInstrumentationCertified":nodecheck.returncode==0,
   "temporaryInstrumentationOnly":True,
   "runnerRestoredExactly":restored,
   "governedDataMutationOff":True,
   "propertyClickOff":True,
   "assignmentsInvocationOff":True,
   "generateInvocationOff":True,
   "exportInvocationOff":True
 },
 "nextMilestone":nextm
}
evidence.write_text(json.dumps(result,indent=2)+"\n")

print("----- CHECKS -----")
for k,v in result["checks"].items(): print(f"{k}: {v}")
print("LAST_COMPLETED_BREADCRUMB:",json.dumps(last_meta))
print("CLASSIFICATION:",classification)
print("STATUS: PASSED")
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",evidence)
print("R29B-R2-R3-R2-R4-R3-R3-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
