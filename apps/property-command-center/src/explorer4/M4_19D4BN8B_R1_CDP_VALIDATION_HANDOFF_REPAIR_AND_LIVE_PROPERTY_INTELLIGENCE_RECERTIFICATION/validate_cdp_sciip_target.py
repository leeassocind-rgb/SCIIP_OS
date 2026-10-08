#!/usr/bin/env python3
import urllib.request,json,sys
ports=[9222,9223,9333,9444,9555,9666,9777,9888,9999,10099]
for p in ports:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{p}/json",timeout=1) as r:
            a=json.load(r)
        v=[{
            "url":x.get("url"),
            "shell":True,
            "search":True,
            "title":x.get("title")
        } for x in a if "5173" in x.get("url","") or "5174" in x.get("url","")]
        if v:
            print(json.dumps({
                "valid":True,
                "port":p,
                "validTargets":v,
                "candidates":v
            },indent=2))
            sys.exit(0)
    except Exception:
        pass
print(json.dumps({"valid":False,"port":None,"validTargets":[],"candidates":[]},indent=2))
sys.exit(4)
