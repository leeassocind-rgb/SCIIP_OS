#!/usr/bin/env python3
import json, os, subprocess, sys, time, urllib.request, tempfile, signal
from pathlib import Path

try:
    import websocket
except Exception as e:
    print(json.dumps({"error":"websocket-client unavailable","detail":str(e)}))
    sys.exit(3)

app = Path(sys.argv[1]).resolve()
evidence = app / "evidence"
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
port = 9223
server_url = "http://127.0.0.1:5173/"
result_path = evidence / "m4-19d4bk2-r2-cdp-navigation-result.json"
shot_path = evidence / "m4-19d4bk2-r2-post-navigation-screenshot.png"

def get_json(url, timeout=2):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode())

def cdp(ws, method, params=None, idn=[0]):
    idn[0] += 1
    msg={"id":idn[0],"method":method}
    if params is not None: msg["params"]=params
    ws.send(json.dumps(msg))
    while True:
        data=json.loads(ws.recv())
        if data.get("id")==idn[0]:
            if "error" in data:
                raise RuntimeError(str(data["error"]))
            return data.get("result",{})

profile = tempfile.mkdtemp(prefix="sciip-bk2r2-chrome-")
proc = subprocess.Popen([
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
], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

try:
    targets=None
    for _ in range(50):
        try:
            targets=get_json(f"http://127.0.0.1:{port}/json")
            if targets: break
        except Exception:
            time.sleep(.2)
    if not targets:
        raise RuntimeError("Chrome DevTools target not available")

    page=next((t for t in targets if t.get("type")=="page"),targets[0])
    ws=websocket.create_connection(page["webSocketDebuggerUrl"], timeout=10)

    cdp(ws,"Page.enable")
    cdp(ws,"Runtime.enable")
    time.sleep(2)

    def eval_js(expr):
        return cdp(ws,"Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True}).get("result",{}).get("value")

    before=eval_js("""(() => ({
      href: location.href,
      text: document.body ? document.body.innerText.slice(0,5000) : "",
      inputs: [...document.querySelectorAll('input')].map(x=>({type:x.type,placeholder:x.placeholder,aria:x.getAttribute('aria-label'),value:x.value})),
      explorerCandidates: [...document.querySelectorAll('a,button,[role="button"]')].filter(x => (x.innerText||x.textContent||"").trim()==="Explorer").map((x,i)=>({i,tag:x.tagName,href:x.href||null,text:(x.innerText||x.textContent||"").trim()}))
    }))()""")

    click=eval_js("""(() => {
      const els=[...document.querySelectorAll('a,button,[role="button"]')].filter(x => (x.innerText||x.textContent||"").trim()==="Explorer");
      if(els.length!==1) return {clicked:false,count:els.length};
      els[0].click();
      return {clicked:true,count:1,tag:els[0].tagName,href:els[0].href||null};
    })()""")

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

    cdp(ws,"Page.captureScreenshot",{"format":"png"})
    shot=cdp(ws,"Page.captureScreenshot",{"format":"png"}).get("data")
    if shot:
        import base64
        shot_path.write_bytes(base64.b64decode(shot))

    result={"before":before,"click":click,"after":after}
    result_path.write_text(json.dumps(result,indent=2)+"\n")
    print(json.dumps(result))
finally:
    try: ws.close()
    except Exception: pass
    try: proc.terminate()
    except Exception: pass
    try: proc.wait(timeout=3)
    except Exception:
        try: proc.kill()
        except Exception: pass
    shutil.rmtree(profile, ignore_errors=True)
