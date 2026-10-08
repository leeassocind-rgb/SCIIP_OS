import sys,json,time,os,subprocess,tempfile,urllib.request,urllib.parse,socket,struct,base64,secrets,shutil
url,out,*addresses=sys.argv[1:]

def chrome_path():
    for p in ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
              "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
              "/Applications/Chromium.app/Contents/MacOS/Chromium"]:
        if os.path.exists(p): return p
    for n in ["google-chrome","chromium","chromium-browser"]:
        p=shutil.which(n)
        if p:return p
    return None

chrome=chrome_path()
if not chrome: raise SystemExit("ERROR: Chrome not found")

class WS:
    def __init__(self,url,timeout=30):
        u=urllib.parse.urlparse(url); host=u.hostname; port=u.port or 80
        s=socket.create_connection((host,port),timeout=timeout); s.settimeout(timeout); self.s=s
        key=base64.b64encode(secrets.token_bytes(16)).decode()
        pth=(u.path or "/")+("?" + u.query if u.query else "")
        req=f"GET {pth} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        s.sendall(req.encode()); d=b""
        while b"\r\n\r\n" not in d:
            c=s.recv(4096)
            if not c: raise RuntimeError("WebSocket handshake closed")
            d+=c
        if b" 101 " not in d.split(b"\r\n\r\n",1)[0]: raise RuntimeError("WebSocket handshake failed")
    def exact(self,n):
        d=b""
        while len(d)<n:
            c=self.s.recv(n-len(d))
            if not c: raise RuntimeError("WebSocket closed")
            d+=c
        return d
    def send(self,text):
        p=text.encode(); n=len(p)
        if n<126:h=bytes([0x81,0x80|n])
        elif n<65536:h=bytes([0x81,0x80|126])+struct.pack("!H",n)
        else:h=bytes([0x81,0x80|127])+struct.pack("!Q",n)
        m=secrets.token_bytes(4); self.s.sendall(h+m+bytes(b^m[i%4] for i,b in enumerate(p)))
    def recv(self):
        parts=[]; started=False
        while True:
            b1,b2=self.exact(2); fin=bool(b1&0x80); op=b1&15; n=b2&127
            if n==126:n=struct.unpack("!H",self.exact(2))[0]
            elif n==127:n=struct.unpack("!Q",self.exact(8))[0]
            key=self.exact(4) if b2&128 else None; p=self.exact(n)
            if key:p=bytes(b^key[i%4] for i,b in enumerate(p))
            if op==8: raise RuntimeError("WebSocket closed")
            if op==1:
                parts=[p]; started=True
                if fin:return b"".join(parts).decode()
            elif op==0 and started:
                parts.append(p)
                if fin:return b"".join(parts).decode()
    def close(self):
        try:self.s.close()
        except:pass

port=9240
profile=tempfile.mkdtemp(prefix="sciip-r7e-r1-")
proc=subprocess.Popen([
    chrome,f"--remote-debugging-port={port}",f"--user-data-dir={profile}",
    "--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check",
    "--disable-extensions","--window-size=1440,900",url
],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

def getj(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.load(r)

ws=None
try:
    targets=None
    selected=None
    for _ in range(60):
        try:
            targets=getj(f"http://127.0.0.1:{port}/json")
            pages=[t for t in targets if t.get("type")=="page" and t.get("webSocketDebuggerUrl")]
            exact=[t for t in pages if t.get("url","").startswith("http://127.0.0.1:5173")]
            if exact:
                selected=exact[0]; break
        except: pass
        time.sleep(.25)

    if not selected:
        diag=[{"id":t.get("id"),"type":t.get("type"),"url":t.get("url"),"title":t.get("title")} for t in (targets or [])]
        print("ERROR: Explorer page CDP target not found:",json.dumps(diag,indent=2))
        raise SystemExit(4)

    print(f"[R7E-R1] selected CDP target type={selected.get('type')} url={selected.get('url')}",flush=True)
    ws=WS(selected["webSocketDebuggerUrl"]); seq=0

    def call(method,params=None):
        global seq
        seq+=1; ident=seq
        ws.send(json.dumps({"id":ident,"method":method,"params":params or {}}))
        while True:
            m=json.loads(ws.recv())
            if m.get("id")==ident:
                if "error" in m: raise RuntimeError(str(m["error"]))
                return m

    def expr(s):
        r=call("Runtime.evaluate",{"expression":s,"awaitPromise":True,"returnByValue":True})
        return r.get("result",{}).get("result",{}).get("value")

    call("Page.enable"); call("Runtime.enable")
    # Ensure exact runtime URL even if Chrome opened a related local page.
    current=expr("location.href")
    if not str(current).startswith("http://127.0.0.1:5173"):
        call("Page.navigate",{"url":url}); time.sleep(3)
    else:
        time.sleep(2)

    nav=expr("""(()=>{const e=[...document.querySelectorAll('a,button,[role="button"]')].find(x=>(x.textContent||'').trim()==='Explorer');if(!e)return {found:false,clicked:false};e.scrollIntoView({block:'center'});e.focus();e.click();return {found:true,clicked:true,tag:e.tagName};})()""") or {"found":False,"clicked":False}
    sc=0
    for _ in range(40):
        sc=expr("""(()=>[...document.querySelectorAll('input')].filter(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip')).length)()""") or 0
        if sc==1: break
        time.sleep(.25)

    navigation={
      "selectedTargetType":selected.get("type"),
      "selectedTargetUrl":selected.get("url"),
      "extensionTargetSelected":str(selected.get("url","")).startswith("chrome-extension://"),
      "explorerControlFound":bool(nav.get("found")),
      "activationAttempted":bool(nav.get("clicked")),
      "searchControlCount":sc,
      "activationSucceeded":bool(nav.get("clicked") and sc==1),
      "urlAfter":expr("location.href")
    }

    recs=[]
    evidence_dir=os.path.join(os.path.dirname(out),"m4-19d4bn2-r7e-r1-live-search-evidence")
    os.makedirs(evidence_dir,exist_ok=True)

    if navigation["activationSucceeded"]:
        search="""[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'))"""
        for i,a in enumerate(addresses,1):
            print(f"[R7E-R1] record {i}/10 search: {a}",flush=True)
            norm=" ".join(a.lower().split())
            expr(f"""(()=>{{const x={search};if(!x)return false;x.focus();x.select();return true}})()""")
            call("Input.dispatchKeyEvent",{"type":"rawKeyDown","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
            call("Input.dispatchKeyEvent",{"type":"keyUp","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
            time.sleep(.15)
            pre=expr(f"""(()=>{{const x={search};return x?x.value:null}})()""")
            if pre:
                expr(f"""(()=>{{const x={search};if(!x)return false;x.focus();x.select();return true}})()""")
                call("Input.dispatchKeyEvent",{"type":"rawKeyDown","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
                call("Input.dispatchKeyEvent",{"type":"keyUp","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
                time.sleep(.15)
                pre=expr(f"""(()=>{{const x={search};return x?x.value:null}})()""")

            dispatched=0
            for ch in a:
                call("Input.dispatchKeyEvent",{"type":"char","text":ch,"unmodifiedText":ch}); dispatched+=1
            time.sleep(.4)
            val=expr(f"""(()=>{{const x={search};return x?x.value:null}})()""")

            candidate=None
            for _ in range(30):
                candidate=expr(f"""(()=>{{const n={json.dumps(norm)};const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(n));if(!b)return null;const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {{text:b.innerText,positiveGeometry:r.width>0&&r.height>0,computedVisible:s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0,inViewport:r.bottom>0&&r.right>0&&r.top<innerHeight&&r.left<innerWidth}};}})()""")
                if candidate: break
                time.sleep(.2)

            selected_ok=False
            if candidate:
                selected_ok=bool(expr(f"""(()=>{{const n={json.dumps(norm)};const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(n));if(!b)return false;b.click();return true;}})()"""))
            time.sleep(.6)

            post=expr(f"""(()=>{{const n={json.dumps(norm)};const els=[...document.querySelectorAll('body *')].filter(e=>(e.textContent||'').toLowerCase().replace(/\\s+/g,' ').includes(n));const vis=els.map(e=>{{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {{text:(e.textContent||'').slice(0,500),positiveGeometry:r.width>0&&r.height>0,computedVisible:s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity)>0}}}}).filter(x=>x.positiveGeometry&&x.computedVisible);return vis[0]||null;}})()""")

            html=expr("document.documentElement.outerHTML") or ""
            html_path=os.path.join(evidence_dir,f"{i}.html")
            with open(html_path,"w",encoding="utf-8") as fh: fh.write(html)

            rec={
              "cohortPosition":i,"address":a,
              "preQueryValueEmpty":pre=="",
              "queryTyped":val is not None,
              "inputValueMatchesQuery":val==a,
              "nativeCharacterEventsDispatched":dispatched,
              "matchingRenderedCandidateVisible":bool(candidate),
              "matchingCandidateHasPositiveGeometry":bool(candidate and candidate.get("positiveGeometry")),
              "matchingCandidateComputedVisible":bool(candidate and candidate.get("computedVisible")),
              "selectionActivated":selected_ok,
              "postSelectionAddressVisible":bool(post),
              "postSelectionAddressHasPositiveGeometry":bool(post and post.get("positiveGeometry")),
              "postSelectionAddressComputedVisible":bool(post and post.get("computedVisible")),
              "frozenHtmlPresent":os.path.exists(html_path) and os.path.getsize(html_path)>0
            }
            print(f"[R7E-R1] record {i}/10 exact={rec['inputValueMatchesQuery']} candidate={rec['matchingRenderedCandidateVisible']} selected={selected_ok} postVisible={rec['postSelectionAddressVisible']}",flush=True)
            recs.append(rec)

    with open(out,"w") as fh:
        json.dump({"navigation":navigation,"records":recs},fh,indent=2); fh.write("\n")
finally:
    if ws:
        try:ws.close()
        except:pass
    proc.terminate()
    try:proc.wait(timeout=3)
    except:proc.kill()
    shutil.rmtree(profile,ignore_errors=True)
