#!/usr/bin/env python3
from __future__ import annotations
import sys, urllib.request, socket, json, re
from pathlib import Path

PORTS=[5173,5174,4173,3000,3001,8080,8000,8888]

def fetch(url):
    try:
        with urllib.request.urlopen(url,timeout=1.5) as r:
            data=r.read(300000).decode(errors="replace")
            return r.status, data
    except Exception:
        return None,None

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    candidates=[]
    for port in PORTS:
        for host in ["127.0.0.1","localhost"]:
            url=f"http://{host}:{port}/"
            status,body=fetch(url)
            if status:
                score=0
                low=(body or "").lower()
                if "sciip" in low: score+=10
                if "property-command-center" in low: score+=5
                if "vite" in low: score+=1
                candidates.append({"url":url,"status":status,"score":score,"sample":(body or "")[:500]})
    if not candidates:
        print(json.dumps({"status":"BLOCKED","diagnosis":"BLOCKED_LOCAL_SCIIP_APP_UNAVAILABLE","candidates":[]}))
        return 4
    candidates.sort(key=lambda x:(x["score"],x["status"]==200),reverse=True)
    best=candidates[0]
    print(json.dumps({"status":"READY","diagnosis":"LOCAL_APP_DETECTED","url":best["url"],"candidates":candidates},indent=2))
    return 0

if __name__=="__main__":
    raise SystemExit(main())
