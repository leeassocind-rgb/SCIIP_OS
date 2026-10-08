#!/usr/bin/env python3
from __future__ import annotations
import sys,json,urllib.request,urllib.parse,socket,base64,os
class WS:
    def __init__(self,u,timeout=5):
        x=urllib.parse.urlparse(u);self.h=x.hostname;self.p=x.port or 80;self.path=x.path or "/"
        self.s=socket.create_connection((self.h,self.p),timeout=timeout);self.s.settimeout(timeout)
        k=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.h}:{self.p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode());d=b""
        while b"\r\n\r\n" not in d:d+=self.s.recv(4096)
        if b" 101 " not in d.split(b"\r\n",1)[0]:raise RuntimeError("upgrade")
        self.n=0
    def rn(self,n):
        b=b""
        while len(b)<n:
            x=self.s.recv(n-len(b))
            if not x:raise RuntimeError("closed")
            b+=x
        return b
    def send(self,x):
        b=x.encode();m=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0x80|126])+n.to_bytes(2,"big")
        else:h+=bytes([0x80|127])+n.to_bytes(8,"big")
        h+=m;self.s.sendall(h+bytes(v^m[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self.rn(2);op=h[0]&15;n=h[1]&127
            if n==126:n=int.from_bytes(self.rn(2),"big")
            elif n==127:n=int.from_bytes(self.rn(8),"big")
            masked=bool(h[1]&128);m=self.rn(4) if masked else None;p=self.rn(n)
            if masked:p=bytes(v^m[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("closed")
            if op==9:self.s.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return p.decode(errors="replace")
    def call(self,m,p=None):
        self.n+=1;i=self.n;self.send(json.dumps({"id":i,"method":m,"params":p or {}}))
        while True:
            x=json.loads(self.recv())
            if x.get("id")==i:return x.get("result",{})
def js(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True});return (r.get("result") or {}).get("value")
def main():
    p=int(sys.argv[1])
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{p}/json",timeout=2) as r:ts=json.load(r)
    except:
        print(json.dumps({"valid":False,"port":p,"reason":"CDP_UNAVAILABLE"}));return 1
    cs=[]
    for t in ts:
        if t.get("type")!="page":continue
        u=t.get("url","")
        if u.startswith("chrome-extension://"):continue
        if not(u.startswith("http://localhost") or u.startswith("http://127.0.0.1")):continue
        try:
            w=WS(t["webSocketDebuggerUrl"])
            shell=js(w,"!!document.querySelector('.broker-shell,.sciip-ds-root,.explorer3')")
            search=js(w,'!!document.querySelector(\'input[aria-label="Search SCIIP"]\')')
            cs.append({"url":u,"shell":bool(shell),"search":bool(search),"title":js(w,"document.title")})
        except:pass
    vs=[x for x in cs if x["shell"] and x["search"]]
    print(json.dumps({"valid":bool(vs),"port":p,"validTargets":vs,"candidates":cs},indent=2));return 0 if vs else 1
if __name__=="__main__":raise SystemExit(main())
