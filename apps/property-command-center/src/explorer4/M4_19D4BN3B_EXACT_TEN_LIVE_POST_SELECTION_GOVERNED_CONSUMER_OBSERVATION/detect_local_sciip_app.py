#!/usr/bin/env python3
import sys,json,urllib.request
PORTS=[5173,5174,4173,3000,3001,8080,8000,8888]

def fetch(url):
    try:
        with urllib.request.urlopen(url,timeout=1.5) as r:
            return r.status,r.read(300000).decode(errors="replace")
    except Exception:
        return None,None

def main():
    candidates=[]
    for port in PORTS:
        for host in ["127.0.0.1","localhost"]:
            url=f"http://{host}:{port}/"
            status,body=fetch(url)
            if not status: continue
            low=(body or "").lower()
            score=(10 if "sciip" in low else 0)+(5 if "property command center" in low or "property-command-center" in low else 0)+(1 if "vite" in low else 0)
            candidates.append({"url":url,"status":status,"score":score})
    if not candidates:
        print(json.dumps({"status":"BLOCKED","diagnosis":"BLOCKED_LOCAL_SCIIP_APP_UNAVAILABLE"}))
        return 4
    candidates.sort(key=lambda x:(x["score"],x["status"]==200),reverse=True)
    print(json.dumps({"status":"READY","url":candidates[0]["url"],"candidates":candidates},indent=2))
    return 0
if __name__=="__main__":
    raise SystemExit(main())
