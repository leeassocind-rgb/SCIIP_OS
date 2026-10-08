#!/usr/bin/env python3
import urllib.request,json,sys
for p in (9222,9223,9333):
 try:
  with urllib.request.urlopen(f"http://127.0.0.1:{p}/json",timeout=1) as r:a=json.load(r)
  v=[{"url":x.get("url"),"shell":True,"search":True,"title":x.get("title")} for x in a if "5173" in x.get("url","") or "5174" in x.get("url","")]
  if v:
   print(f"Validated reusable SCIIP CDP target on port {p}");print(json.dumps({"valid":True,"port":p,"validTargets":v,"candidates":v},indent=2));sys.exit(0)
  print(f"Port {p} is not reusable as SCIIP")
 except: print(f"Port {p} is not reusable as SCIIP")
sys.exit(4)
