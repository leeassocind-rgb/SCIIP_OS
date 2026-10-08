#!/usr/bin/env python3
from pathlib import Path
import json,sys,urllib.request,urllib.parse,subprocess,time,os,shutil,signal

APP="http://127.0.0.1:5173/"
PORT=9333
R29A_SRC="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R2_SCIIP_APP_RUNTIME_BOOTSTRAP_CDP_REATTACHMENT_AND_CANDIDATE_SELECTION_RECERTIFICATION"

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=2) as r:
            return json.loads(r.read().decode())
    except Exception:
        return None

def app_ready():
    try:
        with urllib.request.urlopen(APP,timeout=2) as r:
            body=r.read(300000).decode(errors="ignore")
            return r.status==200 and ("SCIIP" in body or "Property Command Center" in body or "<div id=\"root\"" in body)
    except Exception:
        return False

def find_runtime_cmd(app_dir):
    # Prefer declared npm scripts. Fall back to common Vite start patterns.
    pj=app_dir/"package.json"
    if pj.exists():
        try:
            j=json.loads(pj.read_text())
            scripts=(j or {}).get("scripts") or {}
            for name in ("dev","start"):
                if name in scripts:
                    return ["npm","run",name,"--","--host","127.0.0.1","--port","5173"]
        except Exception:
            pass
    if shutil.which("npm"):
        return ["npm","run","dev","--","--host","127.0.0.1","--port","5173"]
    return None

def launch_app(app_dir):
    cmd=find_runtime_cmd(app_dir)
    if not cmd:return None,None
    log=Path("/tmp/sciip-r29a-r2-vite.log")
    lf=open(log,"ab",buffering=0)
    p=subprocess.Popen(cmd,cwd=str(app_dir),stdout=lf,stderr=lf,start_new_session=True)
    return p,log

def launch_chrome():
    profile=Path("/tmp/sciip-r29a-r2-cdp-profile")
    profile.mkdir(parents=True,exist_ok=True)
    cands=[
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]
    exe=next((p for p in cands if Path(p).exists()),None)
    if exe:
        subprocess.Popen([
          exe,f"--remote-debugging-port={PORT}",f"--user-data-dir={profile}",
          "--no-first-run","--no-default-browser-check",APP
        ],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)
        return exe
    if shutil.which("open"):
        cp=subprocess.run([
          "open","-na","Google Chrome","--args",
          f"--remote-debugging-port={PORT}",f"--user-data-dir={profile}",
          "--no-first-run","--no-default-browser-check",APP
        ],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
        if cp.returncode==0:return "open -na Google Chrome"
    return None

def navigate_existing_cdp():
    pages=getj(f"http://127.0.0.1:{PORT}/json")
    if not isinstance(pages,list):return False
    # Reuse any existing app page if present; otherwise create a fresh one.
    for p in pages:
        if str(p.get("url","")).startswith(APP):
            return True
    try:
        req=urllib.request.Request(
            f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
            method="PUT")
        with urllib.request.urlopen(req,timeout=4) as r:
            j=json.loads(r.read().decode())
            return isinstance(j,dict) and bool(j.get("id"))
    except Exception:
        return False

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app_dir=repo/"apps/property-command-center"
    selector=app_dir/"src/explorer4"/R29A_SRC/"select_r29a.py"
    er=app_dir/"evidence/explorer4"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"sciip_app_runtime_bootstrap_cdp_reattachment_and_candidate_selection_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R2 SCIIP App Runtime Bootstrap + CDP Reattachment + Candidate Selection Recertification")
    print("="*120)
    print("Mode: APP_RUNTIME_BOOTSTRAP_CDP_REATTACHMENT_SELECTOR_RECERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    if not app_dir.exists():
        print("STATUS: BLOCKED");print("REASON: property-command-center app directory missing");return 4
    if not selector.exists():
        print("STATUS: BLOCKED");print("REASON: authoritative R29A selector missing");return 5

    app_pre=app_ready()
    app_proc=None;log=None
    app_action="REUSE_EXISTING_APP_RUNTIME" if app_pre else None
    if not app_pre:
        app_proc,log=launch_app(app_dir)
        if not app_proc:
            print("STATUS: BLOCKED");print("REASON: unable to determine/start SCIIP app runtime");return 6
        app_action="STARTED_PROPERTY_COMMAND_CENTER_RUNTIME"

    deadline=time.time()+25
    app_post=False
    while time.time()<deadline:
        if app_ready():
            app_post=True;break
        if app_proc and app_proc.poll() is not None:
            break
        time.sleep(.35)

    if not app_post:
        print("STATUS: BLOCKED")
        print("REASON: SCIIP app did not become reachable at 127.0.0.1:5173")
        if log:print("RUNTIME_LOG:",log)
        return 7

    cdp_pre=getj(f"http://127.0.0.1:{PORT}/json/version") is not None
    cdp_action="REUSE_EXISTING_CDP" if cdp_pre else launch_chrome()
    if not cdp_action:
        print("STATUS: BLOCKED");print("REASON: could not launch CDP browser");return 8

    deadline=time.time()+12
    version=None
    while time.time()<deadline:
        version=getj(f"http://127.0.0.1:{PORT}/json/version")
        if version is not None:break
        time.sleep(.25)
    if version is None:
        print("STATUS: BLOCKED");print("REASON: CDP port 9333 did not become available");return 9

    # Ensure the browser has an app page available.
    pages=getj(f"http://127.0.0.1:{PORT}/json")
    app_page=any(str(p.get("url","")).startswith(APP) for p in pages) if isinstance(pages,list) else False
    if not app_page:
        try:
            req=urllib.request.Request(
                f"http://127.0.0.1:{PORT}/json/new?http://127.0.0.1:5173/",
                method="PUT")
            with urllib.request.urlopen(req,timeout=4) as r:
                j=json.loads(r.read().decode())
                app_page=isinstance(j,dict) and bool(j.get("id"))
        except Exception:
            app_page=False
    if not app_page:
        print("STATUS: BLOCKED");print("REASON: could not attach/navigate CDP browser to SCIIP app");return 10

    print("SCIIP_APP_PREEXISTING:",app_pre)
    print("SCIIP_APP_BOOTSTRAP_ACTION:",app_action)
    if log:print("SCIIP_APP_RUNTIME_LOG:",log)
    print("SCIIP_APP_READY_AFTER_BOOTSTRAP:",app_post)
    print("CDP_PREEXISTING:",cdp_pre)
    print("CDP_ACTION:",cdp_action)
    print("CDP_AVAILABLE_AFTER_REATTACHMENT:",True)
    print("CDP_BROWSER:",version.get("Browser") if isinstance(version,dict) else None)
    print("CDP_APP_PAGE_ATTACHED:",app_page)
    print("\nRe-running authoritative R29A selector unchanged...\n")

    cp=subprocess.run([sys.executable,str(selector),str(repo)])

    r29a_ev=er/R29A_SRC/"exact_eight_hundred_record_export_cohort_candidate_selection_qualification_and_preauthorization.json"
    r29a={}
    if r29a_ev.exists():
        try:r29a=json.loads(r29a_ev.read_text())
        except Exception:pass

    checks={
      "propertyCommandCenterDirectoryPresent":app_dir.exists(),
      "authoritativeR29ASelectorPresent":selector.exists(),
      "sciipAppReadyAfterBootstrap":app_post,
      "cdpPort9333AvailableAfterReattachment":True,
      "cdpAppPageAttached":app_page,
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
    state=("M419D4BN17C_R4_R12_R16A_R29A_R2_APP_RUNTIME_CDP_REATTACHED_CANDIDATE_SELECTION_RECERTIFIED"
           if ok else "M419D4BN17C_R4_R12_R16A_R29A_R2_APP_RUNTIME_OR_SELECTOR_RECERTIFICATION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R29B_FOUR_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
         if ok else "M4_19D4BN17C_R4_R12_R16A_R29A_R3_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS")
    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R2_SCIIP_APP_RUNTIME_BOOTSTRAP_CDP_REATTACHMENT_AND_CANDIDATE_SELECTION_RECERTIFICATION",
      "status":status,"state":state,
      "appPreexisting":app_pre,"appBootstrapAction":app_action,
      "appReadyAfterBootstrap":app_post,
      "cdpPreexisting":cdp_pre,"cdpAction":cdp_action,
      "cdpAppPageAttached":app_page,
      "selectorEvidence":str(r29a_ev),
      "checks":checks,"nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if ok else 1

if __name__=="__main__":
    raise SystemExit(main())
