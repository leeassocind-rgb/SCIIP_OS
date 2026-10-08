#!/usr/bin/env python3
from pathlib import Path
import json, sys, time, urllib.request, urllib.parse

PORT=9333
APP_URL="http://127.0.0.1:5173/"

def req_json(url,method="GET"):
    try:
        r=urllib.request.Request(url,method=method)
        with urllib.request.urlopen(r,timeout=3) as x:
            return json.loads(x.read().decode("utf-8","ignore"))
    except Exception:
        return None

def targets():
    x=req_json(f"http://127.0.0.1:{PORT}/json")
    return x if isinstance(x,list) else []

def sciip_pages():
    return [t for t in targets() if t.get("type")=="page" and "127.0.0.1:5173" in (t.get("url") or "")]

def main():
    version=req_json(f"http://127.0.0.1:{PORT}/json/version")
    if not version:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: ACTIVE_CDP_SERVER_REQUIRED")
        return 4

    existing=sciip_pages()
    if existing:
        print("TARGET_MATERIALIZATION_STATUS: EXISTING_SCIIP_PAGE_REUSED")
        print("SCIIP_PAGE_TARGET_COUNT:",len(existing))
        print("TARGET_ID:",existing[0].get("id"))
        print("TARGET_URL:",existing[0].get("url"))
        return 0

    encoded=urllib.parse.quote(APP_URL,safe=":/?=&")
    created=req_json(f"http://127.0.0.1:{PORT}/json/new?{encoded}",method="PUT")
    if not created:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: CDP_JSON_NEW_TARGET_CREATION_FAILED")
        return 5

    deadline=time.time()+8
    pages=[]
    while time.time()<deadline:
        pages=sciip_pages()
        if pages:
            break
        time.sleep(.25)

    if not pages:
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: SCIIP_PAGE_TARGET_DID_NOT_MATERIALIZE_AFTER_JSON_NEW")
        return 6

    print("TARGET_MATERIALIZATION_STATUS: SCIIP_PAGE_CREATED_IN_EXISTING_CDP_CONTEXT")
    print("CREATED_TARGET_ID:",created.get("id"))
    print("SCIIP_PAGE_TARGET_COUNT:",len(pages))
    print("TARGET_ID:",pages[0].get("id"))
    print("TARGET_URL:",pages[0].get("url"))
    print("WEBSOCKET_AVAILABLE:",bool(pages[0].get("webSocketDebuggerUrl")))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
