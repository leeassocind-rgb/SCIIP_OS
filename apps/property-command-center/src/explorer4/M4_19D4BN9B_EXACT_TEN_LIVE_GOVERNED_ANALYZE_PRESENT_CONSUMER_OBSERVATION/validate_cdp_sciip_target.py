#!/usr/bin/env python3
import json,urllib.request,sys
for p in [9333,9222,9223]:
 try:
  x=json.load(urllib.request.urlopen(f"http://127.0.0.1:{p}/json",timeout=1))
  v=[t for t in x if "SCIIP Property Command Center" in t.get("title","") or "127.0.0.1:5173" in t.get("url","")]
  if v:
   print(json.dumps({"valid":True,"port":p,"validTargets":[{"url":t.get("url"),"title":t.get("title")} for t in v]},indent=2));sys.exit(0)
 except: pass
print(json.dumps({"valid":False}));sys.exit(5)
