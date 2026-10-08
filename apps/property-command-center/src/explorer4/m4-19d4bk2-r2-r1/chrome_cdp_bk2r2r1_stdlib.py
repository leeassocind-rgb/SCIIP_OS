#!/usr/bin/env python3
import base64, hashlib, json, os, socket, struct, subprocess, sys, tempfile, time, urllib.request, shutil
from pathlib import Path
from urllib.parse import urlparse

app = Path(sys.argv[1]).resolve()
evidence = app / "evidence"
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
port = 9223
server_url = "http://127.0.0.1:5173/"
result_path = evidence / "m4-19d4bk2-r2-r1-cdp-navigation-result.json"
shot_path = evidence / "m4-19d4bk2-r2-r1-post-navigation-screenshot.png"
stderr_path = evidence / "m4-19d4bk2-r2-r1-chrome-stderr.log"

def get_json(url, timeout=2):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode())

class SimpleWebSocket:
    def __init__(self, url, timeout=10):
        u=urlparse(url)
        if u.scheme!="ws":
            raise RuntimeError("only ws:// supported for localhost CDP")
        self.sock=socket.create_connection((u.hostname, u.port or 80), timeout=timeout)
        self.sock.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        path=u.path or "/"
        if u.query:
            path += "?" + u.query
        req=(
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {u.hostname}:{u.port or 80}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            chunk=self.sock.recv(4096)
            if not chunk:
                raise RuntimeError("websocket handshake closed")
            data+=chunk
        header=data.split(b"\r\n\r\n",1)[0].decode("latin1")
        if " 101 " not in header:
            raise RuntimeError("websocket handshake failed: "+header[:500])
        accept=None
        for line in header.split("\r\n")[1:]:
            if ":" in line:
                k,v=line.split(":",1)
                if k.lower()=="sec-websocket-accept":
                    accept=v.strip()
        expected=base64.b64encode(hashlib.sha1((key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest()).decode()
        if accept!=expected:
            raise RuntimeError("websocket accept mismatch")
        self.buffer=data.split(b"\r\n\r\n",1)[1]

    def _recv_exact(self,n):
        out=b""
        if self.buffer:
            take=min(n,len(self.buffer))
            out,self.buffer=self.buffer[:take],self.buffer[take:]
        while len(out)<n:
            chunk=self.sock.recv(n-len(out))
            if not chunk:
                raise RuntimeError("websocket closed")
            out+=chunk
        return out

    def send_text(self,text):
        payload=text.encode()
        mask=os.urandom(4)
        n=len(payload)
        frame=bytearray([0x81])
        if n<126:
            frame.append(0x80|n)
        elif n<65536:
            frame.append(0x80|126); frame.extend(struct.pack("!H",n))
        else:
            frame.append(0x80|127); frame.extend(struct.pack("!Q",n))
        frame.extend(mask)
        frame.extend(bytes(b ^ mask[i%4] for i,b in enumerate(payload)))
        self.sock.sendall(frame)

    def recv_text(self):
        fragments=[]
        opcode0=None
        while True:
            h=self._recv_exact(2)
            b1,b2=h[0],h[1]
            fin=bool(b1&0x80)
            opcode=b1&0x0f
            masked=bool(b2&0x80)
            n=b2&0x7f
            if n==126:
                n=struct.unpack("!H",self._recv_exact(2))[0]
            elif n==127:
                n=struct.unpack("!Q",self._recv_exact(8))[0]
            mask=self._recv_exact(4) if masked else None
            payload=self._recv_exact(n) if n else b""
            if mask:
                payload=bytes(b ^ mask[i%4] for i,b in enumerate(payload))
            if opcode==0x8:
                raise RuntimeError("websocket close frame")
            if opcode==0x9:
                self._send_control(0xA,payload)
                continue
            if opcode==0xA:
                continue
            if opcode in (0x1,0x2):
                opcode0=opcode
                fragments=[payload]
            elif opcode==0x0:
                fragments.append(payload)
            else:
                continue
            if fin:
                data=b"".join(fragments)
                if opcode0==0x1:
                    return data.decode("utf8")
                return data.decode("utf8","replace")

    def _send_control(self,opcode,payload=b""):
        mask=os.urandom(4)
        frame=bytearray([0x80|opcode,0x80|len(payload)])
        frame.extend(mask)
        frame.extend(bytes(b ^ mask[i%4] for i,b in enumerate(payload)))
        self.sock.sendall(frame)

    def close(self):
        try:
            self._send_control(0x8,b"")
        except Exception:
            pass
        try:
            self.sock.close()
        except Exception:
            pass

def cdp(ws, method, params=None, counter=[0]):
    counter[0]+=1
    msg={"id":counter[0],"method":method}
    if params is not None:
        msg["params"]=params
    ws.send_text(json.dumps(msg))
    deadline=time.time()+12
    while time.time()<deadline:
        data=json.loads(ws.recv_text())
        if data.get("id")==counter[0]:
            if "error" in data:
                raise RuntimeError(str(data["error"]))
            return data.get("result",{})
    raise RuntimeError("CDP response timeout: "+method)

profile=tempfile.mkdtemp(prefix="sciip-bk2r2r1-chrome-")
stderr_f=open(stderr_path,"w")
proc=subprocess.Popen([
    chrome,
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--remote-allow-origins=*",
    f"--remote-debugging-port={port}",
    f"--user-data-dir={profile}",
    "--window-size=1600,1000",
    server_url
], stdout=subprocess.DEVNULL, stderr=stderr_f)

ws=None
try:
    print("[BK2-R2-R1] Chrome launched; waiting for DevTools target", flush=True)
    targets=None
    for i in range(50):
        try:
            targets=get_json(f"http://127.0.0.1:{port}/json")
            if targets:
                break
        except Exception:
            time.sleep(.2)
    if not targets:
        raise RuntimeError("Chrome DevTools target not available within 10 seconds")

    page=next((t for t in targets if t.get("type")=="page"),targets[0])
    print("[BK2-R2-R1] DevTools page target acquired", flush=True)
    ws=SimpleWebSocket(page["webSocketDebuggerUrl"],timeout=12)
    print("[BK2-R2-R1] dependency-free WebSocket handshake complete", flush=True)

    cdp(ws,"Page.enable")
    cdp(ws,"Runtime.enable")
    time.sleep(2)

    def eval_js(expr):
        r=cdp(ws,"Runtime.evaluate",{
            "expression":expr,
            "returnByValue":True,
            "awaitPromise":True
        })
        return r.get("result",{}).get("value")

    before=eval_js("""(() => ({
      href: location.href,
      text: document.body ? document.body.innerText.slice(0,5000) : "",
      inputs: [...document.querySelectorAll('input')].map(x=>({type:x.type,placeholder:x.placeholder,aria:x.getAttribute('aria-label'),value:x.value})),
      explorerCandidates: [...document.querySelectorAll('a,button,[role="button"]')]
        .filter(x => (x.innerText||x.textContent||"").trim()==="Explorer")
        .map((x,i)=>({i,tag:x.tagName,href:x.href||null,text:(x.innerText||x.textContent||"").trim()}))
    }))()""")
    print(f"[BK2-R2-R1] Explorer navigation candidates={len(before.get('explorerCandidates',[])) if isinstance(before,dict) else 'unknown'}", flush=True)

    click=eval_js("""(() => {
      const els=[...document.querySelectorAll('a,button,[role="button"]')]
        .filter(x => (x.innerText||x.textContent||"").trim()==="Explorer");
      if(els.length!==1) return {clicked:false,count:els.length};
      els[0].click();
      return {clicked:true,count:1,tag:els[0].tagName,href:els[0].href||null};
    })()""")
    print("[BK2-R2-R1] Explorer navigation activation executed", flush=True)

    time.sleep(2.5)

    after=eval_js("""(() => {
      const inputs=[...document.querySelectorAll('input')].map(x=>({
        type:x.type,
        placeholder:x.placeholder,
        aria:x.getAttribute('aria-label'),
        value:x.value
      }));
      const exact=inputs.filter(x=>x.type==="search" && x.placeholder==="Search SCIIP…" && x.aria==="Search SCIIP");
      const body=document.body ? document.body.innerText : "";
      return {
        href:location.href,
        explorerMounted: body.includes("Map Legend & Layers") || body.includes("MARKET CONTEXT") || exact.length===1,
        searchControlCount:exact.length,
        searchControls:exact,
        bodyExcerpt:body.slice(0,8000)
      };
    })()""")
    print(f"[BK2-R2-R1] exact Search SCIIP controls={after.get('searchControlCount') if isinstance(after,dict) else 'unknown'}", flush=True)

    shot=cdp(ws,"Page.captureScreenshot",{"format":"png"}).get("data")
    if shot:
        shot_path.write_bytes(base64.b64decode(shot))
        print("[BK2-R2-R1] screenshot captured", flush=True)

    result={"before":before,"click":click,"after":after}
    result_path.write_text(json.dumps(result,indent=2)+"\n")
    print(json.dumps(result))
finally:
    if ws:
        ws.close()
    try:
        proc.terminate()
        proc.wait(timeout=3)
    except Exception:
        try: proc.kill()
        except Exception: pass
    stderr_f.close()
    shutil.rmtree(profile, ignore_errors=True)
