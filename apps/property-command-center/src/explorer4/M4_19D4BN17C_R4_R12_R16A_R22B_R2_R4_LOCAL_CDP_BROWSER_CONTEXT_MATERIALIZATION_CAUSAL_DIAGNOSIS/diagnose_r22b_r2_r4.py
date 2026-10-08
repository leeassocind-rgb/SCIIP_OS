#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, os, subprocess, sys, time, urllib.request, socket, shutil

M="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R4_LOCAL_CDP_BROWSER_CONTEXT_MATERIALIZATION_CAUSAL_DIAGNOSIS"
APP_URL="http://127.0.0.1:5173/"
CDP_PORT=9333

def fetch(url, timeout=2):
    try:
        with urllib.request.urlopen(url,timeout=timeout) as r:
            return {"ok":True,"status":getattr(r,"status",200),"text":r.read().decode("utf-8","ignore")}
    except Exception as e:
        return {"ok":False,"error":repr(e)}

def port_open(host,port):
    try:
        s=socket.create_connection((host,port),timeout=1)
        s.close()
        return True
    except:
        return False

def ps_lines():
    try:
        out=subprocess.check_output(["ps","-ax","-o","pid=,command="],text=True,stderr=subprocess.DEVNULL)
        return [x.strip() for x in out.splitlines() if x.strip()]
    except:
        return []

def find_chrome():
    candidates=[
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium"
    ]
    for c in candidates:
        if Path(c).exists():
            return c
    return shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chrome")

def get_json(url):
    r=fetch(url)
    if not r["ok"]: return None
    try:return json.loads(r["text"])
    except:return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"
    outdir=evid/M
    outdir.mkdir(parents=True,exist_ok=True)
    ef=outdir/"local_cdp_browser_context_materialization_causal_diagnosis.json"

    app_probe=fetch(APP_URL)
    chrome=find_chrome()
    pre_port=port_open("127.0.0.1",CDP_PORT)
    pre_version=get_json(f"http://127.0.0.1:{CDP_PORT}/json/version")
    pre_targets=get_json(f"http://127.0.0.1:{CDP_PORT}/json")
    pre_proc=[x for x in ps_lines() if "Google Chrome" in x or "Chromium" in x]

    profile=app/".sciip-explorer4-cdp-profile-r4"
    profile.mkdir(parents=True,exist_ok=True)
    stdout_log=outdir/"chrome_stdout.log"
    stderr_log=outdir/"chrome_stderr.log"

    launch_attempted=False
    launch_pid=None
    launch_returncode=None
    command=[]

    if chrome:
        command=[
          chrome,
          f"--remote-debugging-port={CDP_PORT}",
          "--remote-debugging-address=127.0.0.1",
          f"--user-data-dir={profile}",
          "--no-first-run",
          "--no-default-browser-check",
          "--disable-background-mode",
          "--disable-component-update",
          APP_URL
        ]
        launch_attempted=True
        so=open(stdout_log,"w")
        se=open(stderr_log,"w")
        p=subprocess.Popen(command,stdout=so,stderr=se,start_new_session=True)
        launch_pid=p.pid

    samples=[]
    for i in range(20):
        time.sleep(.5)
        samples.append({
          "tSeconds":round((i+1)*.5,1),
          "portOpen":port_open("127.0.0.1",CDP_PORT),
          "versionAvailable":get_json(f"http://127.0.0.1:{CDP_PORT}/json/version") is not None,
          "targetCount":len(get_json(f"http://127.0.0.1:{CDP_PORT}/json") or [])
        })
        if samples[-1]["versionAvailable"] and samples[-1]["targetCount"]>0:
            break

    post_port=port_open("127.0.0.1",CDP_PORT)
    post_version=get_json(f"http://127.0.0.1:{CDP_PORT}/json/version")
    post_targets=get_json(f"http://127.0.0.1:{CDP_PORT}/json")
    post_proc=[x for x in ps_lines() if "Google Chrome" in x or "Chromium" in x]

    stderr_text=stderr_log.read_text(errors="ignore") if stderr_log.exists() else ""
    stdout_text=stdout_log.read_text(errors="ignore") if stdout_log.exists() else ""

    sciip_targets=[]
    for t in post_targets or []:
        if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or ""):
            sciip_targets.append(t)

    if not app_probe["ok"]:
        classification="VITE_APP_NOT_REACHABLE_BROWSER_CONTEXT_CANNOT_MATERIALIZE"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R5_LOCAL_APP_RUNTIME_RESTART_AND_CDP_CONTEXT_RECERTIFICATION"
    elif not chrome:
        classification="CHROME_EXECUTABLE_NOT_RESOLVED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R5_BROWSER_EXECUTABLE_RESOLUTION_AND_CDP_CONTEXT_RECERTIFICATION"
    elif post_version is None and post_port:
        classification="CDP_PORT_BOUND_BUT_DEVTOOLS_HTTP_ENDPOINT_UNAVAILABLE"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R5_CDP_PORT_COLLISION_OR_NON_CHROME_OWNER_RESOLUTION"
    elif post_version is None and not post_port:
        low=stderr_text.lower()
        if "remote debugging" in low or "user-data-dir" in low or "profile" in low:
            classification="CHROME_LAUNCH_REJECTED_OR_PROFILE_BOOTSTRAP_FAILED"
        else:
            classification="CHROME_PROCESS_LAUNCH_ATTEMPTED_CDP_PORT_NEVER_BOUND"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R5_EXACT_CHROME_LAUNCH_CONTRACT_REPAIR_AND_CONTEXT_RECERTIFICATION"
    elif post_version is not None and not sciip_targets:
        classification="CDP_ACTIVE_BUT_SCIIP_PAGE_TARGET_NOT_MATERIALIZED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R5_CDP_SCIIP_PAGE_TARGET_MATERIALIZATION_REPAIR"
    else:
        classification="LOCAL_CDP_BROWSER_CONTEXT_MATERIALIZED_DIAGNOSIS_CLEARED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R22B_R2_R5_CDP_CONTEXT_PRESERVED_THREE_RECORD_EXPORT_RECERTIFICATION"

    checks={
      "appReachabilityInspected":True,
      "chromeExecutableResolved":bool(chrome),
      "preLaunchPortInspected":True,
      "preLaunchDevtoolsEndpointInspected":True,
      "chromeLaunchAttempted":launch_attempted,
      "postLaunchPortInspected":True,
      "postLaunchDevtoolsEndpointInspected":True,
      "postLaunchTargetsInspected":True,
      "chromeStdoutCaptured":stdout_log.exists(),
      "chromeStderrCaptured":stderr_log.exists(),
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "exportInvocationOff":True,
      "workflowInteractionOff":True,
      "pixelEvidenceOff":True
    }

    data={
      "framework":"SCIIP_EXPLORER_4_R22B_R2_R4_LOCAL_CDP_BROWSER_CONTEXT_MATERIALIZATION_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R22B_R2_R4_LOCAL_CDP_BROWSER_CONTEXT_CAUSE_DIAGNOSED",
      "classification":classification,
      "appProbe":{"ok":app_probe.get("ok"),"status":app_probe.get("status"),"error":app_probe.get("error")},
      "chromeExecutable":chrome,
      "profile":str(profile),
      "launchCommand":command,
      "launchPid":launch_pid,
      "pre":{"portOpen":pre_port,"version":pre_version,"targetCount":len(pre_targets or []),"chromeProcessCount":len(pre_proc)},
      "samples":samples,
      "post":{"portOpen":post_port,"version":post_version,"targetCount":len(post_targets or []),"sciipTargetCount":len(sciip_targets),"chromeProcessCount":len(post_proc)},
      "stderrTail":stderr_text[-12000:],
      "stdoutTail":stdout_text[-12000:],
      "checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"exportInvocation":False,"workflowInteraction":False,"pixelEvidence":False},
      "nextMilestone":nextm
    }
    ef.write_text(json.dumps(data,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — R22B-R2-R4 Local CDP Browser Context Materialization Causal Diagnosis")
    print("="*120)
    print("APP_REACHABLE:",app_probe.get("ok"))
    print("APP_HTTP_STATUS:",app_probe.get("status"))
    print("CHROME_EXECUTABLE:",chrome)
    print("PRE_CDP_PORT_OPEN:",pre_port)
    print("PRE_DEVTOOLS_VERSION_AVAILABLE:",pre_version is not None)
    print("LAUNCH_ATTEMPTED:",launch_attempted)
    print("LAUNCH_PID:",launch_pid)
    print("POST_CDP_PORT_OPEN:",post_port)
    print("POST_DEVTOOLS_VERSION_AVAILABLE:",post_version is not None)
    print("POST_TARGET_COUNT:",len(post_targets or []))
    print("SCIIP_PAGE_TARGET_COUNT:",len(sciip_targets))
    print("\n----- LAUNCH SAMPLES -----")
    for x in samples: print(json.dumps(x))
    print("\n----- CHROME STDERR TAIL -----")
    print(stderr_text[-6000:] if stderr_text else "(empty)")
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R22B_R2_R4_LOCAL_CDP_BROWSER_CONTEXT_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
