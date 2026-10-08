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
        d=b""
        while b"\r\n\r\n" not in d:
            c=self.s.recv(4096)
            if not c: raise RuntimeError("WebSocket handshake closed")
            d+=c
        if " 101 " not in d.split(b"\r\n\r\n",1)[0].decode(errors="replace"):
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

    def recv_text(self):
        parts=[]; started=False
        while True:
            b1,b2=self._recv_exact(2); fin=bool(b1&0x80); op=b1&0x0F; masked=bool(b2&0x80); n=b2&0x7F
            if n==126:n=struct.unpack("!H",self._recv_exact(2))[0]
            elif n==127:n=struct.unpack("!Q",self._recv_exact(8))[0]
            key=self._recv_exact(4) if masked else None
            p=self._recv_exact(n)
            if key:p=bytes(b ^ key[i%4] for i,b in enumerate(p))
            if op==8:raise RuntimeError("WebSocket closed")
            if op==1:
                parts=[p]; started=True
                if fin:return b"".join(parts).decode()
            elif op==0 and started:
                parts.append(p)
                if fin:return b"".join(parts).decode()

    def close(self):
        try:self.s.close()
        except:pass

port=9235
profile=tempfile.mkdtemp(prefix="sciip-bn2r5-cdp-")
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

    evidence_dir=os.path.join(os.path.dirname(out),"m4-19d4bn2-r5-rendered-dom-evidence")
    os.makedirs(evidence_dir,exist_ok=True)
    recs=[]

    for i,a in enumerate(addresses,1):
        print(f"[BN2-R5] record {i}/10 search: {a}",flush=True)
        q=json.dumps(a)
        norm=" ".join(a.lower().split())

        typed=expr(f"""(()=>{{const x=[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'));if(!x)return false;x.focus();const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(x,{q});x.dispatchEvent(new Event('input',{{bubbles:true}}));x.dispatchEvent(new Event('change',{{bubbles:true}}));return true}})()""")
        time.sleep(1)

        candidate=expr(f"""(()=>{{
          const n={json.dumps(norm)};
          const btn=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(n));
          if(!btn)return null;
          const r=btn.getBoundingClientRect(), s=getComputedStyle(btn);
          return {{
            tag:btn.tagName,text:btn.innerText,
            rect:{{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,left:r.left,right:r.right,bottom:r.bottom}},
            style:{{display:s.display,visibility:s.visibility,opacity:s.opacity,pointerEvents:s.pointerEvents}},
            inViewport:r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth,
            positiveGeometry:r.width>0&&r.height>0,
            computedVisible:s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0
          }};
        }})()""")

        match=bool(candidate)
        selected=False
        if match:
            selected=expr(f"""(()=>{{const n={json.dumps(norm)};const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(n));if(!b)return false;b.click();return true}})()""")
        time.sleep(.7)

        post=expr(f"""(()=>{{
          const n={json.dumps(norm)};
          const els=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0 && (e.textContent||'').toLowerCase().replace(/\\s+/g,' ').includes(n));
          const visible=els.map(e=>{{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {{
            tag:e.tagName,text:e.textContent,
            rect:{{x:r.x,y:r.y,width:r.width,height:r.height,top:r.top,left:r.left,right:r.right,bottom:r.bottom}},
            style:{{display:s.display,visibility:s.visibility,opacity:s.opacity}},
            positiveGeometry:r.width>0&&r.height>0,
            computedVisible:s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0,
            inViewport:r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth
          }}}}).filter(x=>x.positiveGeometry&&x.computedVisible);
          return visible[0]||null;
        }})()""")

        outer=expr("document.documentElement.outerHTML") or ""
        html_path=os.path.join(evidence_dir,f"{i}.html")
        layout_path=os.path.join(evidence_dir,f"{i}.layout.json")
        with open(html_path,"w",encoding="utf-8") as fh:fh.write(outer)

        layout={
            "address":a,
            "queryNormalized":norm,
            "viewport":{"width":expr("innerWidth"),"height":expr("innerHeight"),"devicePixelRatio":expr("devicePixelRatio")},
            "candidate":candidate,
            "postSelectionAddressNode":post,
            "bodyTextContainsAddress":bool(expr(f"""document.body.innerText.toLowerCase().replace(/\\s+/g,' ').includes({json.dumps(norm)})"""))
        }
        with open(layout_path,"w",encoding="utf-8") as fh:
            json.dump(layout,fh,indent=2); fh.write("\n")

        rec={
            "cohortPosition":i,
            "address":a,
            "queryTyped":bool(typed),
            "matchingRenderedCandidateVisible":match,
            "matchingCandidateTag":candidate.get("tag") if candidate else None,
            "matchingCandidateText":candidate.get("text") if candidate else None,
            "matchingCandidateHasPositiveGeometry":bool(candidate and candidate.get("positiveGeometry")),
            "matchingCandidateComputedVisible":bool(candidate and candidate.get("computedVisible")),
            "matchingCandidateInViewport":bool(candidate and candidate.get("inViewport")),
            "selectionActivated":bool(selected),
            "postSelectionAddressVisible":bool(post),
            "postSelectionAddressHasPositiveGeometry":bool(post and post.get("positiveGeometry")),
            "postSelectionAddressComputedVisible":bool(post and post.get("computedVisible")),
            "postSelectionAddressInViewport":bool(post and post.get("inViewport")),
            "snapshotHtml":html_path,
            "snapshotHtmlPresent":os.path.exists(html_path) and os.path.getsize(html_path)>0,
            "layoutEvidence":layout_path,
            "layoutEvidencePresent":os.path.exists(layout_path) and os.path.getsize(layout_path)>0
        }
        print(f"[BN2-R5] record {i}/10 candidateVisible={rec['matchingRenderedCandidateVisible']} selected={rec['selectionActivated']} postVisible={rec['postSelectionAddressVisible']}",flush=True)
        recs.append(rec)

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
