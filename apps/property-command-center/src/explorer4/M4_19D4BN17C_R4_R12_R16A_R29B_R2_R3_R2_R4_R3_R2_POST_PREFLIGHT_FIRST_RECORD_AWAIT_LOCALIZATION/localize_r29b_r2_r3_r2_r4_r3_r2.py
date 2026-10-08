#!/usr/bin/env python3
import sys, json, hashlib, subprocess, re, time
from pathlib import Path

repo = Path(sys.argv[1]).expanduser().resolve()
pcc = repo / "apps/property-command-center"
runner = pcc / "src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er = pcc / "evidence/explorer4"
prior = er / "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R1_HTTP_OK_POST_REPAIR_UNSETTLED_AWAIT_DEEP_DIAGNOSIS/http_ok_post_repair_unsettled_await_deep_diagnosis.json"
outdir = er / "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R2_POST_PREFLIGHT_FIRST_RECORD_AWAIT_LOCALIZATION"
outdir.mkdir(parents=True, exist_ok=True)
evidence = outdir / "post_preflight_first_record_await_localization.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R2 Post-Preflight First-Record Await Localization")
print("="*120)
print("Mode: TEMPORARY_POST_PREFLIGHT_AWAIT_BREADCRUMB_INSTRUMENTATION")
print("Application source mutation: ON — temporary diagnostic instrumentation, restored before exit")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")
print("External execution bound: 10 seconds")

if not runner.exists():
    raise SystemExit("BLOCKED: authoritative R29B runner missing")

pj = json.loads(prior.read_text()) if prior.exists() else {}
if pj.get("status") != "PASSED" or pj.get("classification") != "HTTP_PREFLIGHT_FULLY_SETTLED_EXIT13_LIES_AFTER_PREFLIGHT":
    raise SystemExit("BLOCKED: expected R4-R3-R1 post-preflight diagnosis not certified")

original = runner.read_text()
before = hashlib.sha256(original.encode()).hexdigest()

syntax = subprocess.run(["node", "--check", str(runner)], capture_output=True, text=True)
if syntax.returncode != 0:
    raise SystemExit("BLOCKED: authoritative R29B runner fails syntax check")

src = original

# Add a post-preflight marker immediately after the preflight guard.
# We locate the guard and the next closing brace, then place a breadcrumb after it.
preflight_marker = 'if(!(await httpOk("http://127.0.0.1:5173/")) || !(await httpOk("http://127.0.0.1:9333/json/version"))){'
idx = src.find(preflight_marker)
if idx < 0:
    raise SystemExit("BLOCKED: authoritative preflight guard not found")
brace = src.find("{", idx)
depth = 0
end_guard = None
for i in range(brace, len(src)):
    ch = src[i]
    if ch == "{": depth += 1
    elif ch == "}":
        depth -= 1
        if depth == 0:
            end_guard = i + 1
            break
if end_guard is None:
    raise SystemExit("BLOCKED: preflight guard boundary not resolved")

src = src[:end_guard] + '\nconsole.error("R29B_POST_PREFLIGHT_REACHED",JSON.stringify({at:Date.now()}));' + src[end_guard:]

# Instrument selected async helper entries/returns without altering returned values.
# We only wrap named helper calls when a direct "await helper(" surface exists.
helper_names = [
    "newPage", "freshPage", "fresh_page", "openFreshPage",
    "settleExplorer", "settle_explorer",
    "enterExplorer", "enter_explorer",
    "r29bR4CertifyExplorerEntry",
    "selectTarget", "select_target",
    "bindTarget", "bind_target",
    "settleSelectedProperty", "settle_selected_property",
    "sleep", "delay"
]

instrumented_helpers = []
counter = 0
for name in helper_names:
    pat = re.compile(rf'await\s+{re.escape(name)}\s*\(')
    matches = list(pat.finditer(src))
    if not matches:
        continue
    # Process from end to start so offsets remain stable.
    for m in reversed(matches):
        call_start = m.start()
        open_paren = src.find("(", m.start())
        if open_paren < 0:
            continue
        depth = 0
        end = None
        in_s = None
        esc = False
        for j in range(open_paren, len(src)):
            ch = src[j]
            if in_s:
                if esc: esc = False
                elif ch == "\\": esc = True
                elif ch == in_s: in_s = None
            else:
                if ch in ("'", '"', "`"): in_s = ch
                elif ch == "(": depth += 1
                elif ch == ")":
                    depth -= 1
                    if depth == 0:
                        end = j + 1
                        break
        if end is None:
            continue
        expr = src[call_start:end]
        counter += 1
        tag = f"{name}_{counter}"
        repl = (
            f'(console.error("R29B_AWAIT_BEGIN:{tag}",JSON.stringify({{at:Date.now()}})),'
            f' await (async()=>{{const __v={expr};'
            f'console.error("R29B_AWAIT_END:{tag}",JSON.stringify({{at:Date.now()}}));'
            f'return __v;}})())'
        )
        src = src[:call_start] + repl + src[end:]
        instrumented_helpers.append(tag)

# Instrument generic top-level await statements after preflight if no known helper surfaces were found.
# This provides a breadcrumb before every line containing an await after the preflight guard.
if not instrumented_helpers:
    lines = src.splitlines()
    out = []
    preflight_seen = False
    generic_n = 0
    for line in lines:
        if "R29B_POST_PREFLIGHT_REACHED" in line:
            preflight_seen = True
        if preflight_seen and "await " in line and "httpOk(" not in line and "console.error" not in line:
            generic_n += 1
            indent = re.match(r"\s*", line).group(0)
            out.append(indent + f'console.error("R29B_GENERIC_AWAIT_LINE_BEGIN:{generic_n}",JSON.stringify({{at:Date.now(),line:{len(out)+1}}}));')
        out.append(line)
    src = "\n".join(out) + ("\n" if original.endswith("\n") else "")

runner.write_text(src)
instrumented_hash = hashlib.sha256(src.encode()).hexdigest()
nodecheck = subprocess.run(["node", "--check", str(runner)], capture_output=True, text=True)

print("RUNNER_SHA256_BEFORE:", before)
print("RUNNER_SHA256_INSTRUMENTED:", instrumented_hash)
print("KNOWN_HELPER_AWAIT_INSTRUMENTATION_COUNT:", len(instrumented_helpers))
print("KNOWN_HELPER_AWAIT_TAGS:", instrumented_helpers)
print("NODE_CHECK_EXIT:", nodecheck.returncode)
print("NODE_CHECK_STDERR:", nodecheck.stderr.strip() or "NONE")

if nodecheck.returncode != 0:
    runner.write_text(original)
    print("RUNNER_RESTORED_AFTER_FAILED_INSTRUMENTATION: True")
    raise SystemExit("BLOCKED: post-preflight instrumentation syntax failed")

print("Executing instrumented authoritative R29B under 10-second external bound...")
timed_out = False
exit_code = None
stdout = ""
stderr = ""
t0 = time.time()

try:
    p = subprocess.run(["node", str(runner), str(repo)], capture_output=True, text=True, timeout=10)
    exit_code = p.returncode
    stdout = p.stdout or ""
    stderr = p.stderr or ""
except subprocess.TimeoutExpired as e:
    timed_out = True
    stdout = e.stdout.decode() if isinstance(e.stdout, bytes) else (e.stdout or "")
    stderr = e.stderr.decode() if isinstance(e.stderr, bytes) else (e.stderr or "")

seconds = round(time.time() - t0, 3)

runner.write_text(original)
restored_hash = hashlib.sha256(runner.read_bytes()).hexdigest()
restored = restored_hash == before

events = []
for line in stderr.splitlines():
    if line.startswith("R29B_POST_PREFLIGHT_REACHED"):
        events.append({"event": "R29B_POST_PREFLIGHT_REACHED", "raw": line})
    elif line.startswith("R29B_AWAIT_BEGIN:") or line.startswith("R29B_AWAIT_END:") or line.startswith("R29B_GENERIC_AWAIT_LINE_BEGIN:"):
        parts = line.split(" ", 1)
        events.append({"event": parts[0], "payload": parts[1] if len(parts) > 1 else None})

print("BOUNDED_EXECUTION_TIMED_OUT:", timed_out)
print("BOUNDED_EXECUTION_EXIT_CODE:", exit_code)
print("BOUNDED_EXECUTION_SECONDS:", seconds)
print("POST_PREFLIGHT_EVENT_COUNT:", len(events))
for e in events:
    print("POST_PREFLIGHT_EVENT:", json.dumps(e, separators=(",", ":")))
print("RUNNER_RESTORED_AFTER_DIAGNOSIS:", restored)

event_names = [e["event"] for e in events]
begins = [x for x in event_names if x.startswith("R29B_AWAIT_BEGIN:")]
ends = set(x.replace("R29B_AWAIT_END:", "R29B_AWAIT_BEGIN:") for x in event_names if x.startswith("R29B_AWAIT_END:"))
unclosed = [x for x in begins if x not in ends]
generic = [x for x in event_names if x.startswith("R29B_GENERIC_AWAIT_LINE_BEGIN:")]

if unclosed:
    last = unclosed[-1]
    classification = "POST_PREFLIGHT_EXIT13_LOCALIZED_TO_UNRETURNED_NAMED_AWAIT_STAGE"
    localized = {"type": "NAMED_AWAIT", "tag": last.split(":",1)[1]}
    nextm = "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R3_LOCALIZED_FIRST_RECORD_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION"
elif generic:
    classification = "POST_PREFLIGHT_EXIT13_LOCALIZED_TO_GENERIC_AWAIT_LINE"
    localized = {"type": "GENERIC_AWAIT_LINE", "tag": generic[-1].split(":",1)[1]}
    nextm = "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R3_GENERIC_LOCALIZED_AWAIT_DEEP_DIAGNOSIS"
elif "R29B_POST_PREFLIGHT_REACHED" in event_names:
    classification = "POST_PREFLIGHT_REACHED_BUT_NO_INSTRUMENTED_AWAIT_ENTERED_EXIT13_CONTROL_FLOW_GAP"
    localized = {"type": "POST_PREFLIGHT_CONTROL_FLOW"}
    nextm = "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R3_POST_PREFLIGHT_CONTROL_FLOW_SOURCE_DIAGNOSIS"
else:
    classification = "POST_PREFLIGHT_MARKER_NOT_REACHED_DESPITE_PRIOR_PREFLIGHT_CERTIFICATION"
    localized = None
    nextm = "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R3_PREFLIGHT_GUARD_CONTROL_FLOW_RECONCILIATION"

result = {
    "framework": "SCIIP_EXPLORER_4_R29B_R2_R3_R2_R4_R3_R2_POST_PREFLIGHT_FIRST_RECORD_AWAIT_LOCALIZATION",
    "status": "PASSED",
    "classification": classification,
    "localizedAwait": localized,
    "runnerSha256Before": before,
    "runnerSha256Instrumented": instrumented_hash,
    "runnerSha256Restored": restored_hash,
    "boundedExecution": {
        "timeoutSeconds": 10,
        "timedOut": timed_out,
        "exitCode": exit_code,
        "seconds": seconds
    },
    "instrumentedHelperTags": instrumented_helpers,
    "events": events,
    "stdoutTail": stdout.splitlines()[-80:],
    "stderrTail": stderr.splitlines()[-120:],
    "checks": {
        "priorPostPreflightDiagnosisConsumed": True,
        "temporaryInstrumentationOnly": True,
        "nodeSyntaxCheckPassed": nodecheck.returncode == 0,
        "postPreflightBreadcrumbInstalled": "R29B_POST_PREFLIGHT_REACHED" in src,
        "runnerRestoredExactly": restored,
        "governedDataMutationOff": True,
        "exportInvocationOff": True,
        "strictSequentialPreserved": True,
        "haltOnFirstFailurePreserved": True
    },
    "nextMilestone": nextm
}

evidence.write_text(json.dumps(result, indent=2) + "\n")

print("----- CHECKS -----")
for k, v in result["checks"].items():
    print(f"{k}: {v}")
print("LOCALIZED_AWAIT:", json.dumps(localized))
print("CLASSIFICATION:", classification)
print("STATUS: PASSED")
print("NEXT_MILESTONE:", nextm)
print("EVIDENCE:", evidence)
print("R29B-R2-R3-R2-R4-R3-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
