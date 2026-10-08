#!/usr/bin/env python3
from pathlib import Path
import json, os, subprocess, sys, time, urllib.request

PORT=9333
APP_URL="http://127.0.0.1:5173/"

def get_json(url):
    try:
        with urllib.request.urlopen(url,timeout=2) as r:
            return json.loads(r.read().decode())
    except:
        return None

def page_targets():
    x=get_json(f"http://127.0.0.1:{PORT}/json")
    return x if isinstance(x,list) else []

def context_ready():
    return any(t.get("type")=="page" and APP_URL.rstrip("/") in (t.get("url") or "") for t in page_targets())

def find_chrome():
    candidates=[
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      "/Applications/Chromium.app/Contents/MacOS/Chromium"
    ]
    for c in candidates:
        if Path(c).exists(): return c
    return None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"

    if context_ready():
        print("BROWSER_CONTEXT_STATUS: REUSED_EXISTING_CERTIFIED_CONTEXT")
        print("CDP_PORT:",PORT)
        print("APP_URL:",APP_URL)
        return 0

    chrome=find_chrome()
    if not chrome:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CHROME_EXECUTABLE_NOT_FOUND_FOR_LOCAL_CERTIFIED_CONTEXT_REACQUISITION")
        return 5

    profile=app/".sciip-explorer4-cdp-profile"
    profile.mkdir(parents=True,exist_ok=True)

    args=[
      chrome,
      f"--remote-debugging-port={PORT}",
      f"--user-data-dir={profile}",
      "--no-first-run",
      "--no-default-browser-check",
      APP_URL
    ]
    subprocess.Popen(args,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,start_new_session=True)

    deadline=time.time()+12
    while time.time()<deadline:
        if context_ready():
            print("BROWSER_CONTEXT_STATUS: REACQUIRED_LOCAL_CERTIFIED_CONTEXT")
            print("CDP_PORT:",PORT)
            print("APP_URL:",APP_URL)
            print("PROFILE:",profile)
            return 0
        time.sleep(.5)

    print("STATUS: BLOCKED")
    print("DIAGNOSIS: LOCAL_CDP_BROWSER_CONTEXT_DID_NOT_MATERIALIZE")
    return 6

if __name__=="__main__":
    raise SystemExit(main())
