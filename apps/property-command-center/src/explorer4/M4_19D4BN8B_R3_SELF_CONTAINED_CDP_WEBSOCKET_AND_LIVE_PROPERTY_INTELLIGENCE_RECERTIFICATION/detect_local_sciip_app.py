#!/usr/bin/env python3
import urllib.request,json
c=[]
for p in (5173,5174):
 for h in ("127.0.0.1","localhost"):
  u=f"http://{h}:{p}/"
  try:
   with urllib.request.urlopen(u,timeout=1) as r:
    b=r.read().decode("utf8","ignore");c.append({"url":u,"status":r.status,"score":16 if "SCIIP" in b or "root" in b else 1})
  except: pass
c.sort(key=lambda x:x["score"],reverse=True)
print(json.dumps({"status":"READY" if c else "NOT_READY","url":c[0]["url"] if c else None,"candidates":c},indent=2))
raise SystemExit(0 if c else 3)
