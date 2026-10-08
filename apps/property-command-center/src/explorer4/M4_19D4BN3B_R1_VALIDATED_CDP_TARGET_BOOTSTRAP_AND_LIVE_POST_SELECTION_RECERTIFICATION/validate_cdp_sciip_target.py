#!/usr/bin/env python3
from __future__ import annotations
import sys,json,urllib.request,urllib.parse,socket,base64,os

class WS:
    def __init__(self,url,timeout=5):
        u=urllib.parse.urlparse(url)
        self.host=u.hostname;self.port=u.port or 80;self.path=u.path or "/"
        self.sock=socket.create_connection((self.host,self.port),timeout=timeout)
        self.sock.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\nUpgrade: websocket\r\n"
             f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.sock.sendall(req.encode());d=b""
        while b"\r\n\r\n" not in d:d+=self.sock.recv(4096)
        if b" 101 " not in d.split(b"\r\n",1)[0]:raise RuntimeError("upgrade failed")
        self.n=0
    def _n(self,n):
        b=b""
        while len(b)<n:
            x=self.sock.recv(n-len(b))
            if not x:raise RuntimeError("closed")
            b+=x
        return b
    def send(self,s):
        b=s.encode();m=os.urandom(4);n=len(b);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0x80|126])+n.to_bytes(2,"big")
        else:h+=bytes([0x80|127])+n.to_bytes(8,"big")
        h+=m;self.sock.sendall(h+bytes(v^m[i%4] for i,v in enumerate(b)))
    def recv(self):
        while True:
            h=self._n(2);op=h[0]&15;n=h[1]&127
            if n==126:n=int.from_bytes(self._n(2),"big")
            elif n==127:n=int.from_bytes(self._n(8),"big")
            masked=bool(h[1]&128);m=self._n(4) if masked else None;p=self._n(n)
            if masked:p=bytes(v^m[i%4] for i,v in enumerate(p))
            if op==8:raise RuntimeError("closed")
            if op==9:self.sock.sendall(bytes([0x8A,len(p)])+p);continue
            if op in (1,2):return p.decode(errors="replace")
    def call(self,method,params=None):
        self.n+=1;i=self.n;self.send(json.dumps({"id":i,"method":method,"params":params or {}}))
        while True:
            x=json.loads(self.recv())
            if x.get("id")==i:return x.get("result",{})
def js(ws,e):
    r=ws.call("Runtime.evaluate",{"expression":e,"returnByValue":True})
    return (r.get("result") or {}).get("value")
def main():
    port=int(sys.argv[1])
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/json",timeout=2) as r: targets=json.load(r)
    except Exception:
        print(json.dumps({"valid":False,"reason":"CDP_UNAVAILABLE","port":port}));return 1
    candidates=[]
    for t in targets:
        if t.get("type")!="page":continue
        url=t.get("url","")
        if url.startswith("chrome-extension://"):continue
        if not(url.startswith("http://localhost") or url.startswith("http://127.0.0.1")):continue
        try:
            ws=WS(t["webSocketDebuggerUrl"])
            shell=js(ws,"!!document.querySelector('.broker-shell,.sciip-ds-root,.explorer3')")
            search=js(ws,'!!document.querySelector(\'input[aria-label="Search SCIIP"]\')')
            candidates.append({"url":url,"shell":bool(shell),"search":bool(search),"title":js(ws,"document.title")})
        except Exception:pass
    valid=[x for x in candidates if x["shell"] and x["search"]]
    print(json.dumps({"valid":bool(valid),"port":port,"validTargets":valid,"candidates":candidates},indent=2))
    return 0 if valid else 1
if __name__=="__main__":raise SystemExit(main())
