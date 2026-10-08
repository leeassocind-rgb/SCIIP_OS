import sys,json,time,os,subprocess,tempfile,urllib.request,urllib.parse,socket,ssl,struct,base64,secrets,shutil

url,out,*addresses=sys.argv[1:]

def find_chrome():
    candidates=[
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
    ]
    for c in candidates:
        if os.path.exists(c): return c
    for c in ["google-chrome","chromium","chromium-browser"]:
        p=shutil.which(c)
        if p:return p
    return None

chrome=find_chrome()
if not chrome:
    print("ERROR: Chrome not found")
    sys.exit(3)

class WebSocketClient:
    def __init__(self,url,timeout=60):
        u=urllib.parse.urlparse(url)
        self.host=u.hostname
        self.port=u.port or (443 if u.scheme=="wss" else 80)
        self.path=(u.path or "/")+("?" + u.query if u.query else "")
        raw=socket.create_connection((self.host,self.port),timeout=timeout)
        if u.scheme=="wss":
            ctx=ssl.create_default_context()
            raw=ctx.wrap_socket(raw,server_hostname=self.host)
        self.s=raw
        self.s.settimeout(timeout)

        key=base64.b64encode(secrets.token_bytes(16)).decode()
        req=(
            f"GET {self.path} HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.s.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            chunk=self.s.recv(4096)
            if not chunk: raise RuntimeError("WebSocket handshake closed")
            data+=chunk
        head=data.split(b"\r\n\r\n",1)[0].decode(errors="replace")
        if " 101 " not in head:
            raise RuntimeError("WebSocket handshake failed: "+head.splitlines()[0])

    def _recv_exact(self,n):
        data=b""
        while len(data)<n:
            chunk=self.s.recv(n-len(data))
            if not chunk: raise RuntimeError("WebSocket closed")
            data+=chunk
        return data

    def send_text(self,text):
        payload=text.encode()
        first=0x81
        maskbit=0x80
        n=len(payload)
        if n<126:
            hdr=bytes([first,maskbit|n])
        elif n<65536:
            hdr=bytes([first,maskbit|126])+struct.pack("!H",n)
        else:
            hdr=bytes([first,maskbit|127])+struct.pack("!Q",n)
        mask=secrets.token_bytes(4)
        masked=bytes(b ^ mask[i%4] for i,b in enumerate(payload))
        self.s.sendall(hdr+mask+masked)

    def _send_control(self,opcode,payload=b""):
        first=0x80|opcode
        n=len(payload)
        if n>125: payload=payload[:125]; n=len(payload)
        hdr=bytes([first,0x80|n])
        mask=secrets.token_bytes(4)
        masked=bytes(b ^ mask[i%4] for i,b in enumerate(payload))
        self.s.sendall(hdr+mask+masked)

    def _recv_frame(self):
        b1,b2=self._recv_exact(2)
        fin=bool(b1&0x80)
        opcode=b1&0x0F
        masked=bool(b2&0x80)
        n=b2&0x7F
        if n==126:n=struct.unpack("!H",self._recv_exact(2))[0]
        elif n==127:n=struct.unpack("!Q",self._recv_exact(8))[0]
        mask=self._recv_exact(4) if masked else None
        payload=self._recv_exact(n)
        if mask: payload=bytes(b ^ mask[i%4] for i,b in enumerate(payload))
        return fin,opcode,payload

    def recv_text(self):
        fragments=[]
        text_started=False
        while True:
            fin,opcode,payload=self._recv_frame()
            if opcode==0x8:
                raise RuntimeError("WebSocket closed by peer")
            if opcode==0x9:
                self._send_control(0xA,payload)
                continue
            if opcode==0xA:
                continue
            if opcode==0x1:
                fragments=[payload]
                text_started=True
                if fin:return b"".join(fragments).decode()
                continue
            if opcode==0x0 and text_started:
                fragments.append(payload)
                if fin:return b"".join(fragments).decode()
                continue
            if opcode==0x2:
                # CDP should be JSON text; ignore unexpected binary frames.
                continue

    def close(self):
        try:self._send_control(0x8,b"")
        except:pass
        try:self.s.close()
        except:pass

port=9232
profile=tempfile.mkdtemp(prefix="sciip-bn2r2-chrome-")
proc=subprocess.Popen([
    chrome,
    f"--remote-debugging-port={port}",
    f"--user-data-dir={profile}",
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--hide-scrollbars",
    "about:blank"
],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

def getjson(u):
    with urllib.request.urlopen(u,timeout=3) as r:
        return json.load(r)

ws=None
try:
    tabs=None
    for _ in range(40):
        try:
            tabs=getjson(f"http://127.0.0.1:{port}/json")
            if tabs: break
        except Exception:
            time.sleep(.25)
    if not tabs: raise RuntimeError("Chrome CDP unavailable")

    ws=WebSocketClient(tabs[0]["webSocketDebuggerUrl"],timeout=60)
    seq=0

    def call(method,params=None):
        global seq
        seq+=1
        ident=seq
        ws.send_text(json.dumps({"id":ident,"method":method,"params":params or {}}))
        started=time.time()
        while True:
            m=json.loads(ws.recv_text())
            if m.get("id")==ident:
                if "error" in m:
                    raise RuntimeError(f"CDP {method} error: {m['error']}")
                return m
            if time.time()-started>60:
                raise TimeoutError(f"CDP {method} exceeded 60 seconds")

    def expr(s):
        r=call("Runtime.evaluate",{"expression":s,"awaitPromise":True,"returnByValue":True})
        return r.get("result",{}).get("result",{}).get("value")

    call("Page.enable")
    call("Runtime.enable")
    call("Page.setLifecycleEventsEnabled",{"enabled":True})
    call("Page.navigate",{"url":url})
    time.sleep(3)

    activated=expr("""(()=>{const els=[...document.querySelectorAll('a,button')];const e=els.find(x=>x.textContent.trim()==='Explorer');if(!e)return false;e.click();return true})()""")
    time.sleep(3)

    sc=expr("""(()=>{const a=[...document.querySelectorAll('input')];return a.filter(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip')).length})()""") or 0

    shots=os.path.join(os.path.dirname(out),"m4-19d4bn2-r2-screenshots")
    os.makedirs(shots,exist_ok=True)
    recs=[]

    for i,a in enumerate(addresses,1):
        print(f"[BN2-R2] record {i}/10 search: {a}",flush=True)
        q=json.dumps(a)
        typed=expr(f"""(()=>{{const x=[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'));if(!x)return false;x.focus();const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(x,{q});x.dispatchEvent(new Event('input',{{bubbles:true}}));x.dispatchEvent(new Event('change',{{bubbles:true}}));return true}})()""")
        time.sleep(1)

        norm=" ".join(a.lower().split())
        candidates=expr("""(()=>[...document.querySelectorAll('button')].map(b=>b.innerText).filter(Boolean))()""") or []
        match=[t for t in candidates if norm in " ".join(t.lower().split())]

        selected=False
        if match:
            selected=expr(f"""(()=>{{const n={json.dumps(norm)};const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(n));if(!b)return false;b.click();return true}})()""")
        time.sleep(.7)

        post=bool(expr(f"""document.body.innerText.toLowerCase().replace(/\\s+/g,' ').includes({json.dumps(norm)})"""))

        shot=os.path.join(shots,f"{i}.png")
        print(f"[BN2-R2] record {i}/10 screenshot capture started",flush=True)
        r=call("Page.captureScreenshot",{
            "format":"png",
            "captureBeyondViewport":False,
            "fromSurface":True,
            "optimizeForSpeed":True
        })
        data=r.get("result",{}).get("data")
        if data:
            with open(shot,"wb") as fh:
                fh.write(base64.b64decode(data))
        print(f"[BN2-R2] record {i}/10 screenshot capture completed present={os.path.exists(shot)}",flush=True)

        recs.append({
            "cohortPosition":i,
            "address":a,
            "queryTyped":bool(typed),
            "candidateCount":len(candidates),
            "matchingRenderedCandidateCount":len(match),
            "matchingRenderedCandidateVisible":bool(match),
            "matchingCandidateText":match[0] if match else None,
            "selectionActivated":bool(selected),
            "postSelectionAddressVisible":post,
            "screenshot":shot,
            "screenshotPresent":os.path.exists(shot)
        })

        expr("""(()=>{const x=[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'));if(x){const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(x,'');x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));}})()""")
        time.sleep(.3)

    result={
        "explorerActivated":bool(activated),
        "searchControlVisible":sc==1,
        "searchControlCount":sc,
        "records":recs
    }
    with open(out,"w") as fh:
        json.dump(result,fh,indent=2)
        fh.write("\n")
finally:
    if ws:
        try:ws.close()
        except:pass
    proc.terminate()
    try:proc.wait(timeout=3)
    except:proc.kill()
    shutil.rmtree(profile,ignore_errors=True)
