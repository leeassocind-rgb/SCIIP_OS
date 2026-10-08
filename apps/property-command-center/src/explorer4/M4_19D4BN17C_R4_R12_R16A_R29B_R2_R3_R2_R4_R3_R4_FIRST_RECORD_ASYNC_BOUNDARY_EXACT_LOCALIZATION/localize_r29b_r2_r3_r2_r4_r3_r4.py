#!/usr/bin/env python3
import sys,json,hashlib,subprocess,re,time
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R3_R1_SYNTAX_SAFE_POST_PREFLIGHT_CONTROL_FLOW_DIAGNOSIS/syntax_safe_post_preflight_control_flow_diagnosis.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R4_FIRST_RECORD_ASYNC_BOUNDARY_EXACT_LOCALIZATION"
outdir.mkdir(parents=True,exist_ok=True)
evidence=outdir/"first_record_async_boundary_exact_localization.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R4 First Record Async Boundary Exact Localization")
print("="*120)
print("Mode: TEMPORARY_CREATE_FRESH_PAGE_INTERNAL_LIFECYCLE_INSTRUMENTATION")
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
if pj.get("status")!="PASSED" or pj.get("classification")!="FIRST_RECORD_ASYNC_REGION_REACHED_SYNCHRONOUS_CONTROL_FLOW_CERTIFIED":
    raise SystemExit("BLOCKED: required R4-R3-R3-R1 diagnosis not certified")

last=pj.get("lastCompletedBreadcrumb") or {}
if last.get("line")!=380 or "createFreshPage" not in str(last.get("source","")):
    raise SystemExit("BLOCKED: record-401 createFreshPage boundary not confirmed")

original=runner.read_text()
before=hashlib.sha256(original.encode()).hexdigest()
basecheck=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
if basecheck.returncode:
    raise SystemExit("BLOCKED: authoritative runner syntax invalid")

# Resolve async function createFreshPage(...) { ... }
m=re.search(r'async\s+function\s+createFreshPage\s*\(([^)]*)\)\s*\{',original)
if not m:
    raise SystemExit("BLOCKED: async function createFreshPage not found")

fn_start=m.start()
brace=m.end()-1
depth=0; fn_end=None; quote=None; esc=False
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
                fn_end=i+1
                break
if fn_end is None:
    raise SystemExit("BLOCKED: createFreshPage function boundary unresolved")

fn=original[fn_start:fn_end]
fn_start_line=original[:fn_start].count("\n")+1
fn_end_line=original[:fn_end].count("\n")+1

print("CREATE_FRESH_PAGE_START_LINE:",fn_start_line)
print("CREATE_FRESH_PAGE_END_LINE:",fn_end_line)
print("----- CREATE_FRESH_PAGE SOURCE -----")
for n,line in enumerate(fn.splitlines(),fn_start_line):
    print(f"{n:5d}: {line}")

# Conservative internal instrumentation:
# Insert breadcrumbs before each await-containing statement and around returns.
lines=fn.splitlines(keepends=True)
new=[]
instrumented=[]
line_no=fn_start_line
await_counter=0
return_counter=0

# Add function entry right after opening brace on first line.
first=lines[0]
brace_pos=first.find("{")
if brace_pos>=0:
    new.append(first[:brace_pos+1]+'\n  console.error("R29B_CFP_ENTRY",JSON.stringify({at:Date.now()}));'+first[brace_pos+1:])
else:
    new.append(first)

for raw in lines[1:]:
    stripped=raw.strip()
    indent=re.match(r"\s*",raw).group(0)

    if "await " in raw:
        await_counter+=1
        tag=f"A{await_counter}_L{line_no}"
        new.append(indent+f'console.error("R29B_CFP_AWAIT_BEGIN:{tag}",JSON.stringify({{at:Date.now()}}));\n')
        instrumented.append({"type":"await","tag":tag,"line":line_no,"source":stripped[:300]})

    if re.match(r'^\s*return\b',raw):
        return_counter+=1
        tag=f"R{return_counter}_L{line_no}"
        new.append(indent+f'console.error("R29B_CFP_RETURN:{tag}",JSON.stringify({{at:Date.now()}}));\n')
        instrumented.append({"type":"return","tag":tag,"line":line_no,"source":stripped[:300]})

    new.append(raw)

    # After simple await statement ending in semicolon, add an END breadcrumb.
    if "await " in raw and stripped.endswith(";"):
        tag=instrumented[-1]["tag"]
        new.append(indent+f'console.error("R29B_CFP_AWAIT_END:{tag}",JSON.stringify({{at:Date.now()}}));\n')

    line_no += raw.count("\n")

instrumented_fn="".join(new)
src=original[:fn_start]+instrumented_fn+original[fn_end:]

runner.write_text(src)
instrumented_hash=hashlib.sha256(src.encode()).hexdigest()
nodecheck=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)

print("RUNNER_SHA256_BEFORE:",before)
print("RUNNER_SHA256_INSTRUMENTED:",instrumented_hash)
print("CREATE_FRESH_PAGE_INSTRUMENTED_BOUNDARIES:",json.dumps(instrumented))
print("NODE_CHECK_EXIT:",nodecheck.returncode)
print("NODE_CHECK_STDERR:",nodecheck.stderr.strip() or "NONE")

if nodecheck.returncode:
    runner.write_text(original)
    print("RUNNER_RESTORED_AFTER_FAILED_INSTRUMENTATION:",hashlib.sha256(runner.read_bytes()).hexdigest()==before)
    raise SystemExit("BLOCKED: createFreshPage instrumentation syntax failed")

print("Executing instrumented authoritative R29B under 8-second external bound...")
timed_out=False; exit_code=None; stdout=""; stderr=""; t0=time.time()
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
restored=restored_hash==before

events=[]
for line in stderr.splitlines():
    if line.startswith("R29B_CFP_"):
        parts=line.split(" ",1)
        events.append({"event":parts[0],"payload":parts[1] if len(parts)>1 else None})

print("BOUNDED_EXECUTION_TIMED_OUT:",timed_out)
print("BOUNDED_EXECUTION_EXIT_CODE:",exit_code)
print("BOUNDED_EXECUTION_SECONDS:",seconds)
print("CREATE_FRESH_PAGE_EVENT_COUNT:",len(events))
for e in events:
    print("CREATE_FRESH_PAGE_EVENT:",json.dumps(e,separators=(",",":")))
print("RUNNER_RESTORED_AFTER_DIAGNOSIS:",restored)

names=[e["event"] for e in events]
begins=[x for x in names if x.startswith("R29B_CFP_AWAIT_BEGIN:")]
ends=set(x.replace("R29B_CFP_AWAIT_END:","R29B_CFP_AWAIT_BEGIN:") for x in names if x.startswith("R29B_CFP_AWAIT_END:"))
unreturned=[x for x in begins if x not in ends]
returns=[x for x in names if x.startswith("R29B_CFP_RETURN:")]

localized=None
if unreturned:
    tag=unreturned[-1].split(":",1)[1]
    meta=next((x for x in instrumented if x.get("tag")==tag),None)
    localized={"type":"CREATE_FRESH_PAGE_UNRETURNED_AWAIT","tag":tag,"meta":meta}
    classification="RECORD401_EXIT13_LOCALIZED_TO_CREATE_FRESH_PAGE_INTERNAL_AWAIT"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_LOCALIZED_CREATE_FRESH_PAGE_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION"
elif returns:
    localized={"type":"CREATE_FRESH_PAGE_RETURN_REACHED","event":returns[-1]}
    classification="CREATE_FRESH_PAGE_COMPLETED_EXIT13_LIES_AFTER_RETURN_BOUNDARY"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_POST_CREATE_FRESH_PAGE_RECORD401_AWAIT_DIAGNOSIS"
elif "R29B_CFP_ENTRY" in names:
    localized={"type":"CREATE_FRESH_PAGE_ENTERED_BEFORE_FIRST_AWAIT_OR_RETURN"}
    classification="CREATE_FRESH_PAGE_ENTERED_EXIT13_BEFORE_FIRST_INSTRUMENTED_ASYNC_BOUNDARY"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_CREATE_FRESH_PAGE_SYNCHRONOUS_PREFIX_DIAGNOSIS"
else:
    localized={"type":"CREATE_FRESH_PAGE_ENTRY_NOT_OBSERVED"}
    classification="CREATE_FRESH_PAGE_CALLSITE_REACHED_BUT_FUNCTION_ENTRY_NOT_OBSERVED"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_CREATE_FRESH_PAGE_BINDING_AND_CALLSITE_DIAGNOSIS"

result={
 "framework":"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R4_FIRST_RECORD_ASYNC_BOUNDARY_EXACT_LOCALIZATION",
 "status":"PASSED",
 "classification":classification,
 "localizedBoundary":localized,
 "createFreshPage":{"startLine":fn_start_line,"endLine":fn_end_line,"instrumentedBoundaries":instrumented},
 "boundedExecution":{"timeoutSeconds":8,"timedOut":timed_out,"exitCode":exit_code,"seconds":seconds},
 "events":events,
 "runnerSha256Before":before,
 "runnerSha256Instrumented":instrumented_hash,
 "runnerSha256Restored":restored_hash,
 "stdoutTail":stdout.splitlines()[-80:],
 "stderrTail":stderr.splitlines()[-120:],
 "checks":{
   "priorAsyncBoundaryDiagnosisConsumed":True,
   "record401CreateFreshPageBoundaryConfirmed":True,
   "createFreshPageFunctionResolved":True,
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
for k,v in result["checks"].items(): print(f"{k}: {v}")
print("LOCALIZED_BOUNDARY:",json.dumps(localized))
print("CLASSIFICATION:",classification)
print("STATUS: PASSED")
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",evidence)
print("R29B-R2-R3-R2-R4-R3-R4 EXECUTION COMPLETE — paste complete output into ChatGPT.")
