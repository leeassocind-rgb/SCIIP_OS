import sys,json,time,os,subprocess,tempfile,urllib.request
try: import websocket
except Exception:
 print("ERROR: websocket-client Python module is required but not installed."); sys.exit(2)
url,out,*addresses=sys.argv[1:]
chrome_candidates=["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome","google-chrome","chromium"]
chrome=next((x for x in chrome_candidates if os.path.exists(x) or "/" not in x),None)
if not chrome: print("ERROR: Chrome not found"); sys.exit(3)
port=9229; profile=tempfile.mkdtemp(prefix="sciip-bn2-chrome-")
proc=subprocess.Popen([chrome,f"--remote-debugging-port={port}",f"--user-data-dir={profile}","--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check","about:blank"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def getjson(u):
 with urllib.request.urlopen(u,timeout=3) as r:return json.load(r)
try:
 for _ in range(30):
  try:
   tabs=getjson(f"http://127.0.0.1:{port}/json"); break
  except: time.sleep(.25)
 else: raise RuntimeError("Chrome CDP unavailable")
 wsurl=tabs[0]["webSocketDebuggerUrl"]
 ws=websocket.create_connection(wsurl,timeout=10)
 seq=0
 def call(method,params=None):
  global seq; seq+=1; ws.send(json.dumps({"id":seq,"method":method,"params":params or {}}))
  while True:
   m=json.loads(ws.recv())
   if m.get("id")==seq:return m
 def expr(s):
  r=call("Runtime.evaluate",{"expression":s,"awaitPromise":True,"returnByValue":True})
  return r.get("result",{}).get("result",{}).get("value")
 call("Page.enable"); call("Runtime.enable"); call("Page.navigate",{"url":url}); time.sleep(3)
 body=expr("document.body.innerText") or ""
 # Activate visible Explorer nav; do not infer a route.
 activated=expr("""(()=>{const els=[...document.querySelectorAll('a,button')];const e=els.find(x=>x.textContent.trim()==='Explorer');if(!e)return false;e.click();return true})()""")
 time.sleep(3)
 def search_control():
  return expr("""(()=>{const a=[...document.querySelectorAll('input')];const x=a.filter(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'));return x.length})()""") or 0
 sc=search_control()
 shots=os.path.join(os.path.dirname(out),"m4-19d4bn2-screenshots"); os.makedirs(shots,exist_ok=True)
 recs=[]
 for i,a in enumerate(addresses,1):
  q=json.dumps(a)
  typed=expr(f"""(()=>{{const x=[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'));if(!x)return false;x.focus();const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(x,{q});x.dispatchEvent(new Event('input',{{bubbles:true}}));x.dispatchEvent(new Event('change',{{bubbles:true}}));return true}})()""")
  time.sleep(1)
  norm=" ".join(a.lower().split())
  candidates=expr("""(()=>[...document.querySelectorAll('button')].map(b=>b.innerText).filter(Boolean))()""") or []
  match=[t for t in candidates if norm in " ".join(t.lower().split())]
  selected=False
  if match:
   selected=expr(f"""(()=>{{const n={json.dumps(norm)};const b=[...document.querySelectorAll('button')].find(x=>' '.concat(x.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(n));if(!b)return false;b.click();return true}})()""")
  time.sleep(.7)
  post=bool(expr(f"""document.body.innerText.toLowerCase().replace(/\\s+/g,' ').includes({json.dumps(norm)})"""))
  shot=os.path.join(shots,f"{i}.png")
  r=call("Page.captureScreenshot",{"format":"png","captureBeyondViewport":False})
  import base64
  data=r.get("result",{}).get("data")
  if data: open(shot,"wb").write(base64.b64decode(data))
  recs.append({"cohortPosition":i,"address":a,"queryTyped":bool(typed),"candidateCount":len(candidates),
   "matchingRenderedCandidateCount":len(match),"matchingRenderedCandidateVisible":bool(match),"matchingCandidateText":match[0] if match else None,
   "selectionActivated":bool(selected),"postSelectionAddressVisible":post,"screenshot":shot,"screenshotPresent":os.path.exists(shot)})
  # clear selection/search for next record
  expr("""(()=>{const x=[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'));if(x){const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(x,'');x.dispatchEvent(new Event('input',{bubbles:true}));}})()""")
  time.sleep(.3)
 result={"explorerActivated":bool(activated),"searchControlVisible":sc==1,"searchControlCount":sc,"records":recs}
 open(out,"w").write(json.dumps(result,indent=2)+"\n")
 ws.close()
finally:
 proc.terminate()
 try: proc.wait(timeout=3)
 except: proc.kill()
