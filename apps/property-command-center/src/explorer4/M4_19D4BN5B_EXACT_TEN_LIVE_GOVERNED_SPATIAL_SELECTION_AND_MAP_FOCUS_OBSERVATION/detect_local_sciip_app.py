#!/usr/bin/env python3
import json,urllib.request
PORTS=[5173,5174,4173,3000,3001,8080,8000,8888]
def fetch(u):
    try:
        with urllib.request.urlopen(u,timeout=1.5) as r:return r.status,r.read(250000).decode(errors="replace")
    except:return None,None
def main():
    xs=[]
    for p in PORTS:
        for h in ["127.0.0.1","localhost"]:
            u=f"http://{h}:{p}/";s,b=fetch(u)
            if not s:continue
            low=(b or "").lower()
            score=(10 if "sciip" in low else 0)+(5 if "property command center" in low or "property-command-center" in low else 0)+(1 if "vite" in low else 0)
            xs.append({"url":u,"status":s,"score":score})
    if not xs:
        print(json.dumps({"status":"BLOCKED","diagnosis":"BLOCKED_LOCAL_SCIIP_APP_UNAVAILABLE"}));return 4
    xs.sort(key=lambda x:(x["score"],x["status"]==200),reverse=True)
    print(json.dumps({"status":"READY","url":xs[0]["url"],"candidates":xs},indent=2));return 0
if __name__=="__main__":raise SystemExit(main())
