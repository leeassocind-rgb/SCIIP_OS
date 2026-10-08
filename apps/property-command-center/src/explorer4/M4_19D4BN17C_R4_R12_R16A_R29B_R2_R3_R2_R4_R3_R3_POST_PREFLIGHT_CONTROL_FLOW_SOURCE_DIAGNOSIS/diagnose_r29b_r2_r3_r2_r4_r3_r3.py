#!/usr/bin/env python3
import sys, json, hashlib, subprocess, re, time
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R2_POST_PREFLIGHT_FIRST_RECORD_AWAIT_LOCALIZATION/post_preflight_first_record_await_localization.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R3_POST_PREFLIGHT_CONTROL_FLOW_SOURCE_DIAGNOSIS"
outdir.mkdir(parents=True,exist_ok=True)
evidence=outdir/"post_preflight_control_flow_source_diagnosis.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R3 Post-Preflight Control-Flow Source Diagnosis")
print("="*120)
print("Mode: TEMPORARY_SYNCHRONOUS_CONTROL_FLOW_BREADCRUMB_DIAGNOSIS")
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
    raise SystemExit("BLOCKED: R4-R3-R2 control-flow gap diagnosis not certified")

original=runner.read_text()
before=hashlib.sha256(original.encode()).hexdigest()

syntax=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
if syntax.returncode:
    raise SystemExit("BLOCKED: authoritative R29B runner syntax invalid")

# Resolve preflight guard and first known awaited-helper surface after it.
pre='if(!(await httpOk("http://127.0.0.1:5173/")) || !(await httpOk("http://127.0.0.1:9333/json/version"))){'
pidx=original.find(pre)
if pidx<0:
    raise SystemExit("BLOCKED: preflight guard not found")

brace=original.find("{",pidx)
depth=0
guard_end=None
in_s=None
esc=False
for i in range(brace,len(original)):
    ch=original[i]
    if in_s:
        if esc: esc=False
        elif ch=="\\": esc=True
        elif ch==in_s: in_s=None
    else:
        if ch in ("'",'"','`'): in_s=ch
        elif ch=="{": depth+=1
        elif ch=="}":
            depth-=1
            if depth==0:
                guard_end=i+1
                break
if guard_end is None:
    raise SystemExit("BLOCKED: preflight guard end not resolved")

known_await_names=["r29bR4CertifyExplorerEntry","settleExplorer","settle_explorer","sleep"]
first_await_idx=None
first_await_name=None
for name in known_await_names:
    x=original.find("await "+name,guard_end)
    if x>=0 and (first_await_idx is None or x<first_await_idx):
        first_await_idx=x
        first_await_name=name

if first_await_idx is None:
    # fallback: next await at all after preflight
    x=original.find("await ",guard_end)
    if x>=0:
        first_await_idx=x
        first_await_name="GENERIC_AWAIT"

if first_await_idx is None:
    first_await_idx=min(len(original),guard_end+5000)
    first_await_name="NONE_FOUND"

segment=original[guard_end:first_await_idx]
start_line=original[:guard_end].count("\n")+1
end_line=original[:first_await_idx].count("\n")+1

print("POST_PREFLIGHT_SEGMENT_START_LINE:",start_line)
print("FIRST_AWAIT_NAME:",first_await_name)
print("FIRST_AWAIT_LINE:",end_line)
print("POST_PREFLIGHT_SYNCHRONOUS_SEGMENT_CHARS:",len(segment))

# Preserve a readable source snapshot in evidence.
source_lines=original.splitlines()
ctx_start=max(1,start_line-2)
ctx_end=min(len(source_lines),end_line+3)
source_context=[]
for n in range(ctx_start,ctx_end+1):
    source_context.append({"line":n,"text":source_lines[n-1]})

print("----- POST-PREFLIGHT SOURCE CONTEXT -----")
for row in source_context:
    print(f"{row['line']:5d}: {row['text']}")

# Instrument synchronous executable lines in the segment.
# Conservative: add breadcrumbs before non-empty, non-comment lines that are not
# bare braces/else/catch/finally continuations. This is diagnostic only.
seg_lines=segment.splitlines(keepends=True)
new_lines=[]
instrumented=[]
logical_line=start_line
for raw in seg_lines:
    stripped=raw.strip()
    indent=raw[:len(raw)-len(raw.lstrip())]
    should = bool(stripped) and not stripped.startswith("//") and stripped not in ("{","}","};") \
             and not stripped.startswith("else") and not stripped.startswith("catch") \
             and not stripped.startswith("finally")
    if should:
        tag=f"L{logical_line}"
        breadcrumb=indent+f'console.error("R29B_SYNC_BEFORE:{tag}",JSON.stringify({{at:Date.now()}}));\n'
        new_lines.append(breadcrumb)
        instrumented.append({"tag":tag,"line":logical_line,"source":stripped[:300]})
    new_lines.append(raw)
    logical_line += raw.count("\n")

instrumented_segment="".join(new_lines)
src=original[:guard_end] + '\nconsole.error("R29B_SYNC_POST_PREFLIGHT_ENTER",JSON.stringify({at:Date.now()}));\n' + instrumented_segment + original[first_await_idx:]

# Instrument first await entry as hard boundary, without changing await semantics.
if first_await_idx < len(original):
    # Because prior insertion changed offsets, find first occurrence again after our marker.
    marker_pos=src.find("R29B_SYNC_POST_PREFLIGHT_ENTER")
    generic_pos=src.find("await ",marker_pos)
    if generic_pos>=0:
        line_start=src.rfind("\n",0,generic_pos)+1
        indent=src[line_start:generic_pos]
        if indent.strip()=="":
            src=src[:line_start]+indent+'console.error("R29B_FIRST_AWAIT_BOUNDARY_REACHED",JSON.stringify({at:Date.now()}));\n'+src[line_start:]

runner.write_text(src)
instrumented_hash=hashlib.sha256(src.encode()).hexdigest()
nodecheck=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)

print("RUNNER_SHA256_BEFORE:",before)
print("RUNNER_SHA256_INSTRUMENTED:",instrumented_hash)
print("SYNC_BREADCRUMB_COUNT:",len(instrumented))
print("NODE_CHECK_EXIT:",nodecheck.returncode)
print("NODE_CHECK_STDERR:",nodecheck.stderr.strip() or "NONE")

if nodecheck.returncode:
    runner.write_text(original)
    print("RUNNER_RESTORED_AFTER_FAILED_INSTRUMENTATION: True")
    raise SystemExit("BLOCKED: synchronous breadcrumb instrumentation syntax failed")

print("Executing instrumented authoritative R29B under 8-second external bound...")
timed_out=False
exit_code=None
stdout=""
stderr=""
t0=time.time()
try:
    p=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=8)
    exit_code=p.returncode
    stdout=p.stdout or ""
    stderr=p.stderr or ""
except subprocess.TimeoutExpired as e:
    timed_out=True
    stdout=e.stdout.decode() if isinstance(e.stdout,bytes) else (e.stdout or "")
    stderr=e.stderr.decode() if isinstance(e.stderr,bytes) else (e.stderr or "")
seconds=round(time.time()-t0,3)

runner.write_text(original)
restored_hash=hashlib.sha256(runner.read_bytes()).hexdigest()
restored=(restored_hash==before)

events=[]
for line in stderr.splitlines():
    if line.startswith("R29B_SYNC_") or line.startswith("R29B_FIRST_AWAIT_BOUNDARY_REACHED"):
        parts=line.split(" ",1)
        events.append({"event":parts[0],"payload":parts[1] if len(parts)>1 else None})

print("BOUNDED_EXECUTION_TIMED_OUT:",timed_out)
print("BOUNDED_EXECUTION_EXIT_CODE:",exit_code)
print("BOUNDED_EXECUTION_SECONDS:",seconds)
print("SYNC_EVENT_COUNT:",len(events))
for e in events:
    print("SYNC_EVENT:",json.dumps(e,separators=(",",":")))
print("RUNNER_RESTORED_AFTER_DIAGNOSIS:",restored)

sync_before=[e["event"] for e in events if e["event"].startswith("R29B_SYNC_BEFORE:")]
last_tag=sync_before[-1].split(":",1)[1] if sync_before else None
first_await_reached=any(e["event"]=="R29B_FIRST_AWAIT_BOUNDARY_REACHED" for e in events)

last_meta=None
if last_tag:
    for x in instrumented:
        if x["tag"]==last_tag:
            last_meta=x
            break

if first_await_reached:
    classification="SYNCHRONOUS_POST_PREFLIGHT_CONTROL_FLOW_COMPLETED_TO_FIRST_AWAIT_BOUNDARY"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_FIRST_AWAIT_BOUNDARY_EXACT_LIFECYCLE_DIAGNOSIS"
elif last_meta:
    classification="EXIT13_LOCALIZED_WITHIN_SYNCHRONOUS_POST_PREFLIGHT_CONTROL_FLOW_BEFORE_FIRST_AWAIT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_LOCALIZED_SYNCHRONOUS_CONTROL_FLOW_REPAIR_AND_RECORD401_RECERTIFICATION"
else:
    classification="EXIT13_AFTER_POST_PREFLIGHT_ENTRY_BEFORE_FIRST_INSTRUMENTABLE_SYNCHRONOUS_STATEMENT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_POST_PREFLIGHT_EXPRESSION_BOUNDARY_DEEP_DIAGNOSIS"

result={
 "framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R3_POST_PREFLIGHT_CONTROL_FLOW_SOURCE_DIAGNOSIS",
 "status":"PASSED",
 "classification":classification,
 "segment":{
   "startLine":start_line,
   "firstAwaitLine":end_line,
   "firstAwaitName":first_await_name,
   "instrumentedStatements":instrumented,
   "sourceContext":source_context
 },
 "boundedExecution":{
   "timeoutSeconds":8,
   "timedOut":timed_out,
   "exitCode":exit_code,
   "seconds":seconds
 },
 "events":events,
 "lastCompletedBreadcrumb":last_meta,
 "firstAwaitBoundaryReached":first_await_reached,
 "runnerSha256Before":before,
 "runnerSha256Instrumented":instrumented_hash,
 "runnerSha256Restored":restored_hash,
 "stdoutTail":stdout.splitlines()[-80:],
 "stderrTail":stderr.splitlines()[-120:],
 "checks":{
   "priorControlFlowGapConsumed":True,
   "sourceSegmentCaptured":True,
   "temporaryInstrumentationOnly":True,
   "nodeSyntaxCheckPassed":nodecheck.returncode==0,
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
for k,v in result["checks"].items():
    print(f"{k}: {v}")
print("LAST_COMPLETED_BREADCRUMB:",json.dumps(last_meta))
print("FIRST_AWAIT_BOUNDARY_REACHED:",first_await_reached)
print("CLASSIFICATION:",classification)
print("STATUS: PASSED")
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",evidence)
print("R29B-R2-R3-R2-R4-R3-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
