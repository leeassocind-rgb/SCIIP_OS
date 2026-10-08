import sys,json,time,os,subprocess,tempfile,urllib.request,urllib.parse,socket,ssl,struct,base64,secrets,shutil

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
        path=(u.path or "/")+("?" + u.query if u.query else "")
        req=f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n"
        s.sendall(req.encode()); d=b""
        while b"\r\n\r\n" not in d:d+=s.recv(4096)
        if b" 101 " not in d.split(b"\r\n\r\n",1)[0]:raise RuntimeError("WebSocket handshake failed")
    def exact(self,n):
        d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        return d
    def send(self,text):
        p=text.encode(); n=len(p)
        h=bytes([0x81,0x80|n]) if n<126 else (bytes([0x81,0x80|126])+struct.pack("!H",n) if n<65536 else bytes([0x81,0x80|127])+struct.pack("!Q",n))
        m=secrets.token_bytes(4); self.s.sendall(h+m+bytes(b^m[i%4] for i,b in enumerate(p)))
    def recv(self):
        parts=[]; started=False
        while True:
            b1,b2=self.exact(2); fin=bool(b1&0x80); op=b1&15; n=b2&127
            if n==126:n=struct.unpack("!H",self.exact(2))[0]
            elif n==127:n=struct.unpack("!Q",self.exact(8))[0]
            key=self.exact(4) if b2&128 else None; p=self.exact(n)
            if key:p=bytes(b^key[i%4] for i,b in enumerate(p))
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

port=9237; profile=tempfile.mkdtemp(prefix="sciip-bn2r7-")
proc=subprocess.Popen([chrome,f"--remote-debugging-port={port}",f"--user-data-dir={profile}","--headless=new","--disable-gpu","--no-first-run","--window-size=1440,900","about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)

def getj(u):
    with urllib.request.urlopen(u,timeout=3) as r:return json.load(r)

ws=None
try:
    tabs=None
    for _ in range(40):
        try:
            tabs=getj(f"http://127.0.0.1:{port}/json")
            if tabs:break
        except:time.sleep(.25)
    if not tabs:raise RuntimeError("CDP unavailable")
    ws=WS(tabs[0]["webSocketDebuggerUrl"]); seq=0
    def call(method,params=None):
        global seq; seq+=1; ident=seq
        ws.send(json.dumps({"id":ident,"method":method,"params":params or {}}))
        while True:
            m=json.loads(ws.recv())
            if m.get("id")==ident:
                if "error" in m:raise RuntimeError(str(m["error"]))
                return m
    def expr(s):
        r=call("Runtime.evaluate",{"expression":s,"awaitPromise":True,"returnByValue":True})
        return r.get("result",{}).get("result",{}).get("value")

    call("Page.enable"); call("Runtime.enable"); call("Page.navigate",{"url":url}); time.sleep(3)
    activated=expr("""(()=>{const e=[...document.querySelectorAll('a,button')].find(x=>x.textContent.trim()==='Explorer');if(!e)return false;e.click();return true})()"""); time.sleep(3)
    search="""[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'))"""
    sc=expr("""(()=>[...document.querySelectorAll('input')].filter(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip')).length)()""") or 0
    contract=expr(f"""(()=>{{const x={search};if(!x)return null;const ks=Object.keys(x);const pk=ks.find(k=>k.startsWith('__reactProps$'));const p=pk?x[pk]:null;return {{
      placeholder:x.placeholder,ariaLabel:x.getAttribute('aria-label'),type:x.type,
      reactPropsKeyPresent:!!pk,reactOnChange:!!(p&&p.onChange),reactOnInput:!!(p&&p.onInput),
      parentText:(x.parentElement?.innerText||'').slice(0,500)
    }}}})()""")

    evidence_dir=os.path.join(os.path.dirname(out),"m4-19d4bn2-r7-search-evidence"); os.makedirs(evidence_dir,exist_ok=True)
    recs=[]
    for i,a in enumerate(addresses,1):
        print(f"[BN2-R7] record {i}/10 native-char search: {a}",flush=True)
        norm=" ".join(a.lower().split())
        expr(f"""(()=>{{const x={search};if(!x)return false;x.focus();x.setSelectionRange(0,x.value.length);return true}})()""")
        call("Input.dispatchKeyEvent",{"type":"rawKeyDown","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
        call("Input.dispatchKeyEvent",{"type":"keyUp","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
        time.sleep(.15)
        pre=expr(f"""(()=>{{const x={search};return x?x.value:null}})()""")
        # If field wasn't emptied, select all and send a second real Backspace, still no value assignment.
        if pre:
            expr(f"""(()=>{{const x={search};x.focus();x.setSelectionRange(0,x.value.length);return true}})()""")
            call("Input.dispatchKeyEvent",{"type":"rawKeyDown","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
            call("Input.dispatchKeyEvent",{"type":"keyUp","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
            time.sleep(.15)
            pre=expr(f"""(()=>{{const x={search};return x?x.value:null}})()""")

        dispatched=0
        for ch in a:
            call("Input.dispatchKeyEvent",{"type":"char","text":ch,"unmodifiedText":ch})
            dispatched+=1
        time.sleep(.4)
        val=expr(f"""(()=>{{const x={search};return x?x.value:null}})()""")

        candidate=None
        for _ in range(25):
            candidate=expr(f"""(()=>{{const n={json.dumps(norm)};const b=[...document.querySelectorAll('button')].find(x=>(x.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(n));if(!b)return null;const r=b.getBoundingClientRect(),s=getComputedStyle(b);return {{text:b.innerText,width:r.width,height:r.height,display:s.display,visibility:s.visibility,opacity:s.opacity}}}})()""")
            if candidate:break
            time.sleep(.2)

        buttons=expr("""(()=>[...document.querySelectorAll('button')].map(b=>b.innerText).filter(Boolean))()""") or []
        body=expr("document.body.innerText") or ""
        ep=os.path.join(evidence_dir,f"{i}.json")
        evidence={"address":a,"preQueryValue":pre,"inputValue":val,"candidate":candidate,"renderedButtons":buttons,"bodyExcerpt":body[:4000]}
        with open(ep,"w") as fh:json.dump(evidence,fh,indent=2);fh.write("\n")

        rec={
          "cohortPosition":i,"address":a,
          "preQueryValueEmpty":pre=="",
          "queryTyped":val is not None,
          "inputValue":val,
          "inputValueMatchesQuery":val==a,
          "nativeCharacterEventsDispatched":dispatched,
          "renderedButtonCount":len(buttons),
          "matchingRenderedCandidateVisible":bool(candidate),
          "matchingCandidateText":candidate.get("text") if candidate else None,
          "diagnosticEvidence":ep
        }
        print(f"[BN2-R7] record {i}/10 preEmpty={rec['preQueryValueEmpty']} exactValue={rec['inputValueMatchesQuery']} candidate={rec['matchingRenderedCandidateVisible']} buttons={len(buttons)}",flush=True)
        recs.append(rec)

    with open(out,"w") as fh:
        json.dump({"explorerActivated":bool(activated),"searchControlVisible":sc==1,"searchControlCount":sc,"searchControlContract":contract,"records":recs},fh,indent=2);fh.write("\n")
finally:
    if ws:
        try:ws.close()
        except:pass
    proc.terminate()
    try:proc.wait(timeout=3)
    except:proc.kill()
    shutil.rmtree(profile,ignore_errors=True)
