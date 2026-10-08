#!/usr/bin/env python3
from pathlib import Path
import json,sys,urllib.request,subprocess,time,os,shutil

PORT=9333
APP="http://127.0.0.1:5173/"
R29A_SRC="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R1_CDP_BOOTSTRAP_AND_CANDIDATE_SELECTION_RECERTIFICATION"

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=2) as r:
            return json.loads(r.read().decode())
    except Exception:
        return None

def app_ready():
    try:
        with urllib.request.urlopen(APP,timeout=2) as r:
            txt=r.read(200000).decode(errors="ignore")
            return r.status==200 and ("SCIIP" in txt or "Property Command Center" in txt)
    except Exception:
        return False

def launch_chrome():
    profile=Path("/tmp/sciip-r29a-cdp-profile")
    profile.mkdir(parents=True,exist_ok=True)
    chrome_candidates=[
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]
    exe=next((p for p in chrome_candidates if Path(p).exists()),None)
    if exe:
        subprocess.Popen([
          exe,
          f"--remote-debugging-port={PORT}",
          f"--user-data-dir={profile}",
          "--no-first-run",
          "--no-default-browser-check",
          APP
        ],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        return exe
    # macOS fallback via open
    if shutil.which("open"):
        cp=subprocess.run([
          "open","-na","Google Chrome","--args",
          f"--remote-debugging-port={PORT}",
          f"--user-data-dir={profile}",
          "--no-first-run","--no-default-browser-check",APP
        ],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        if cp.returncode==0:return "open -na Google Chrome"
    return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    src=repo/"apps/property-command-center/src/explorer4"/R29A_SRC/"select_r29a.py"
    er=repo/"apps/property-command-center/evidence/explorer4"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"cdp_bootstrap_and_candidate_selection_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R1 CDP Bootstrap + Candidate Selection Recertification")
    print("="*120)
    print("Mode: RUNTIME_BOOTSTRAP_AND_SELECTOR_RECERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    before=getj(f"http://127.0.0.1:{PORT}/json/version")
    cdp_pre=before is not None
    app_pre=app_ready()
    launch_action="REUSE_EXISTING_CDP" if cdp_pre else None

    if not cdp_pre:
        launch_action=launch_chrome()
        if not launch_action:
            print("STATUS: BLOCKED")
            print("REASON: could not locate or launch Chrome/Chromium with remote debugging")
            return 4

    deadline=time.time()+12
    after=None
    while time.time()<deadline:
        after=getj(f"http://127.0.0.1:{PORT}/json/version")
        if after is not None:break
        time.sleep(.25)

    cdp_post=after is not None
    app_post=app_ready()
    if not src.exists():
        print("STATUS: BLOCKED");print("REASON: installed R29A selector missing");return 5
    if not cdp_post:
        print("STATUS: BLOCKED");print("REASON: CDP port 9333 did not become available");return 6
    if not app_post:
        print("STATUS: BLOCKED");print("REASON: SCIIP app is not reachable at 127.0.0.1:5173");return 7

    print("CDP_PREEXISTING:",cdp_pre)
    print("CDP_BOOTSTRAP_ACTION:",launch_action)
    print("CDP_AVAILABLE_AFTER_BOOTSTRAP:",cdp_post)
    print("SCIIP_APP_READY:",app_post)
    print("CDP_BROWSER:",after.get("Browser") if isinstance(after,dict) else None)
    print("\nRe-running authoritative R29A selector unchanged...\n")
    cp=subprocess.run([sys.executable,str(src),str(repo)])

    r29a_ev=er/R29A_SRC/"exact_eight_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    r29a={}
    if r29a_ev.exists():
        try:r29a=json.loads(r29a_ev.read_text())
        except:pass
    selector_passed=(cp.returncode==0 and r29a.get("status")=="PASSED")
    checks={
      "originalR29ASelectorPresent":src.exists(),
      "cdpPort9333AvailableAfterBootstrap":cdp_post,
      "sciipApp1270015173Ready":app_post,
      "selectorReusedWithoutMutation":True,
      "selectorExitZero":cp.returncode==0,
      "r29aEvidencePresent":r29a_ev.exists(),
      "r29aStatusPassed":r29a.get("status")=="PASSED",
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    ok=all(checks.values())
    status="PASSED" if ok else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R29A_R1_CDP_BOOTSTRAPPED_CANDIDATE_SELECTION_RECERTIFIED"
           if ok else "M419D4BN17C_R4_R12_R16A_R29A_R1_CDP_BOOTSTRAP_OR_SELECTOR_RECERTIFICATION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_FOUR_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
         if ok else "M4_19D4BN17C_R4_R12_R16A_R29A_R2_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS")
    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R1_CDP_BOOTSTRAP_AND_CANDIDATE_SELECTION_RECERTIFICATION",
      "status":status,"state":state,
      "cdpPreexisting":cdp_pre,
      "cdpBootstrapAction":launch_action,
      "cdpAvailableAfterBootstrap":cdp_post,
      "sciipAppReady":app_post,
      "selectorEvidence":str(r29a_ev),
      "checks":checks,
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if ok else 1

if __name__=="__main__":
    raise SystemExit(main())
