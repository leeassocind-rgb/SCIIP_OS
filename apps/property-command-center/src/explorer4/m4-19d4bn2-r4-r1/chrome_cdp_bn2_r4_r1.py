import sys,json,time,os,subprocess,tempfile,urllib.request,urllib.parse,socket,ssl,struct,base64,secrets,shutil,re
from pathlib import Path

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
    print("ERROR: Chrome not found"); sys.exit(3)

class WebSocketClient:
    def __init__(self,url,timeout=30):
        u=urllib.parse.urlparse(url)
        self.host=u.hostname; self.port=u.port or (443 if u.scheme=="wss" else 80)
        self.path=(u.path or "/")+("?" + u.query if u.query else "")
        raw=socket.create_connection((self.host,self.port),timeout=timeout)
        if u.scheme=="wss":
            raw=ssl.create_default_context().wrap_socket(raw,server_hostname=self.host)
        self.s=raw; self.s.settimeout(timeout)
        key=base64.b64encode(secrets.token_bytes(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.s.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            chunk=self.s.recv(4096)
            if not chunk: raise RuntimeError("WebSocket handshake closed")
            data+=chunk
        if " 101 " not in data.split(b"\r\n\r\n",1)[0].decode(errors="replace"):
            raise RuntimeError("WebSocket handshake failed")

    def _recv_exact(self,n):
        d=b""
        while len(d)<n:
            c=self.s.recv(n-len(d))
            if not c: raise RuntimeError("WebSocket closed")
            d+=c
        return d

    def send_text(self,text):
        p=text.encode(); n=len(p)
        if n<126:h=bytes([0x81,0x80|n])
        elif n<65536:h=bytes([0x81,0x80|126])+struct.pack("!H",n)
        else:h=bytes([0x81,0x80|127])+struct.pack("!Q",n)
        m=secrets.token_bytes(4); q=bytes(b ^ m[i%4] for i,b in enumerate(p))
        self.s.sendall(h+m+q)

    def _frame(self):
        b1,b2=self._recv_exact(2); fin=bool(b1&0x80); op=b1&0x0F; mask=bool(b2&0x80); n=b2&0x7F
        if n==126:n=struct.unpack("!H",self._recv_exact(2))[0]
        elif n==127:n=struct.unpack("!Q",self._recv_exact(8))[0]
        key=self._recv_exact(4) if mask else None; p=self._recv_exact(n)
        if key:p=bytes(b ^ key[i%4] for i,b in enumerate(p))
        return fin,op,p

    def recv_text(self):
        parts=[]; started=False
        while True:
            fin,op,p=self._frame()
            if op==8:raise RuntimeError("WebSocket closed")
            if op==9:continue
            if op==1:
                parts=[p]; started=True
                if fin:return b"".join(parts).decode()
            elif op==0 and started:
                parts.append(p)
                if fin:return b"".join(parts).decode()

    def close(self):
        try:self.s.close()
        except:pass

port=9234
profile=tempfile.mkdtemp(prefix="sciip-bn2r4-cdp-")
proc=subprocess.Popen([chrome,f"--remote-debugging-port={port}",f"--user-data-dir={profile}","--headless=new","--disable-gpu",
                       "--no-first-run","--no-default-browser-check","--window-size=1440,900","about:blank"],
                       stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

def getjson(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.load(r)

ws=None
try:
    tabs=None
    for _ in range(40):
        try:
            tabs=getjson(f"http://127.0.0.1:{port}/json")
            if tabs:break
        except:time.sleep(.25)
    if not tabs:raise RuntimeError("Chrome CDP unavailable")
    ws=WebSocketClient(tabs[0]["webSocketDebuggerUrl"])
    seq=0

    def call(method,params=None):
        global seq
        seq+=1; ident=seq
        ws.send_text(json.dumps({"id":ident,"method":method,"params":params or {}}))
        while True:
            m=json.loads(ws.recv_text())
            if m.get("id")==ident:
                if "error" in m:raise RuntimeError(f"CDP {method}: {m['error']}")
                return m

    def expr(s):
        r=call("Runtime.evaluate",{"expression":s,"awaitPromise":True,"returnByValue":True})
        return r.get("result",{}).get("result",{}).get("value")

    call("Page.enable"); call("Runtime.enable"); call("Page.navigate",{"url":url}); time.sleep(3)
    activated=expr("""(()=>{const e=[...document.querySelectorAll('a,button')].find(x=>x.textContent.trim()==='Explorer');if(!e)return false;e.click();return true})()""")
    time.sleep(3)
    sc=expr("""(()=>[...document.querySelectorAll('input')].filter(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip')).length)()""") or 0

    evidence_dir=os.path.join(os.path.dirname(out),"m4-19d4bn2-r4-static-visual-evidence")
    os.makedirs(evidence_dir,exist_ok=True)
    recs=[]

    for i,a in enumerate(addresses,1):
        print(f"[BN2-R4] record {i}/10 search: {a}",flush=True)
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

        # Freeze current live DOM after successful selection.
        outer=expr("document.documentElement.outerHTML") or ""
        # Prevent scripts from re-hydrating/replacing the captured state; keep stylesheet links.
        frozen=re.sub(r"<script\\b[^>]*>[\\s\\S]*?</script\\s*>","",outer,flags=re.I)
        if "<head" in frozen.lower():
            frozen=re.sub(r"(<head[^>]*>)",r'\\1<base href="http://127.0.0.1:5173/">',frozen,count=1,flags=re.I)
        html_path=os.path.join(evidence_dir,f"{i}.html")
        png_path=os.path.join(evidence_dir,f"{i}.png")
        with open(html_path,"w",encoding="utf-8") as fh:fh.write(frozen)

        print(f"[BN2-R4] record {i}/10 static snapshot render started",flush=True)
        render_profile=tempfile.mkdtemp(prefix=f"sciip-bn2r4-render-{i}-")
        try:
            cmd=[chrome,"--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check",
                 "--hide-scrollbars","--window-size=1440,900",f"--user-data-dir={render_profile}",
                 "--run-all-compositor-stages-before-draw","--virtual-time-budget=2500",
                 f"--screenshot={png_path}",Path(html_path).resolve().as_uri()]
            rr=subprocess.run(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=25)
        finally:
            shutil.rmtree(render_profile,ignore_errors=True)
        png_present=os.path.exists(png_path) and os.path.getsize(png_path)>0
        html_present=os.path.exists(html_path) and os.path.getsize(html_path)>0
        print(f"[BN2-R4] record {i}/10 static snapshot render completed status={rr.returncode} png={png_present}",flush=True)

        recs.append({
            "cohortPosition":i,"address":a,"queryTyped":bool(typed),
            "candidateCount":len(candidates),"matchingRenderedCandidateCount":len(match),
            "matchingRenderedCandidateVisible":bool(match),"matchingCandidateText":match[0] if match else None,
            "selectionActivated":bool(selected),"postSelectionAddressVisible":post,
            "snapshotMethod":"LIVE_DOM_OUTERHTML_STATIC_FREEZE",
            "snapshotHtml":html_path,"snapshotHtmlPresent":html_present,
            "visualEvidenceMethod":"SEPARATE_CHROME_HEADLESS_CLI_STATIC_DOM_SCREENSHOT",
            "visualEvidence":png_path,"visualEvidencePresent":png_present,
            "visualRenderExitCode":rr.returncode
        })

        expr("""(()=>{const x=[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'));if(x){const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(x,'');x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));}})()""")
        time.sleep(.3)

    with open(out,"w") as fh:
        json.dump({"explorerActivated":bool(activated),"searchControlVisible":sc==1,"searchControlCount":sc,"records":recs},fh,indent=2);fh.write("\n")
finally:
    if ws:
        try:ws.close()
        except:pass
    proc.terminate()
    try:proc.wait(timeout=3)
    except:proc.kill()
    shutil.rmtree(profile,ignore_errors=True)
