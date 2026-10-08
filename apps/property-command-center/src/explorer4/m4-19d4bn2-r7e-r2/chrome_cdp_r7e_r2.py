import sys,json,time,os,subprocess,tempfile,urllib.request,urllib.parse,socket,struct,base64,secrets,shutil
url,out,*addresses=sys.argv[1:]
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if not os.path.exists(chrome): raise SystemExit("ERROR: Google Chrome not found")
class WS:
 def __init__(self,u):
  q=urllib.parse.urlparse(u); self.s=socket.create_connection((q.hostname,q.port or 80),30); self.s.settimeout(30)
  k=base64.b64encode(secrets.token_bytes(16)).decode(); p=(q.path or "/")+("?"+q.query if q.query else "")
  self.s.sendall(f"GET {p} HTTP/1.1\r\nHost: {q.hostname}:{q.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n".encode()); d=b""
  while b"\r\n\r\n" not in d:d+=self.s.recv(4096)
  if b" 101 " not in d.split(b"\r\n\r\n")[0]:raise RuntimeError("WS handshake failed")
 def ex(self,n):
  d=b""
  while len(d)<n:d+=self.s.recv(n-len(d))
  return d
 def send(self,t):
  p=t.encode();n=len(p);h=bytes([129,128|(n if n<126 else 126)])+(struct.pack("!H",n) if n>=126 else b"");m=secrets.token_bytes(4);self.s.sendall(h+m+bytes(b^m[i%4] for i,b in enumerate(p)))
 def recv(self):
  parts=[]
  while 1:
   a,b=self.ex(2);fin=a&128;op=a&15;n=b&127
   if n==126:n=struct.unpack("!H",self.ex(2))[0]
   elif n==127:n=struct.unpack("!Q",self.ex(8))[0]
   p=self.ex(n)
   if op==1:parts=[p]
   elif op==0:parts.append(p)
   if fin and parts:return b"".join(parts).decode()
 def close(self):self.s.close()
port=9241; profile=tempfile.mkdtemp(prefix="sciip-r7e-r2-")
proc=subprocess.Popen([chrome,f"--remote-debugging-port={port}",f"--user-data-dir={profile}","--headless=new","--disable-gpu","--disable-extensions","--no-first-run","--window-size=1440,900",url],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
def getj(u):
 with urllib.request.urlopen(u,timeout=3) as r:return json.load(r)
ws=None
try:
 selected=None
 for _ in range(60):
  try:
   ts=getj(f"http://127.0.0.1:{port}/json")
   ps=[t for t in ts if t.get("type")=="page" and str(t.get("url","")).startswith("http://127.0.0.1:5173") and t.get("webSocketDebuggerUrl")]
   if ps:selected=ps[0];break
  except:pass
  time.sleep(.25)
 if not selected:raise SystemExit("ERROR: Explorer page target not found")
 print(f"[R7E-R2] selected CDP target type=page url={selected['url']}",flush=True)
 ws=WS(selected["webSocketDebuggerUrl"]); seq=0
 def call(m,p=None):
  global seq;seq+=1;i=seq;ws.send(json.dumps({"id":i,"method":m,"params":p or {}}))
  while 1:
   x=json.loads(ws.recv())
   if x.get("id")==i:
    if "error" in x:raise RuntimeError(x["error"])
    return x
 def expr(s):
  x=call("Runtime.evaluate",{"expression":s,"awaitPromise":True,"returnByValue":True});return x.get("result",{}).get("result",{}).get("value")
 call("Runtime.enable");call("Page.enable");time.sleep(2)
 nav=expr("""(()=>{const e=[...document.querySelectorAll('a,button,[role=button]')].find(x=>(x.textContent||'').trim()==='Explorer');if(!e)return false;e.click();return true})()""");time.sleep(.8)
 search="""[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'))"""
 sc=expr(f"(()=>{search}?1:0)()")
 records=[]
 for i,a in enumerate(addresses,1):
  print(f"[R7E-R2] record {i}/10 search: {a}",flush=True); n=" ".join(a.lower().split())
  expr(f"(()=>{{const x={search};x.focus();x.select();return true}})()")
  call("Input.dispatchKeyEvent",{"type":"rawKeyDown","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8});call("Input.dispatchKeyEvent",{"type":"keyUp","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
  for ch in a:call("Input.dispatchKeyEvent",{"type":"char","text":ch,"unmodifiedText":ch})
  time.sleep(.5); val=expr(f"(()=>{{const x={search};return x&&x.value}})()")
  # Reconcile actual result-control contract: visible smallest text-bearing element, then nearest interactive ancestor.
  cand=None
  for _ in range(25):
   cand=expr(f"""(()=>{{const q={json.dumps(n)};const vis=e=>{{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0}};let es=[...document.querySelectorAll('body *')].filter(e=>e.tagName!=='SCRIPT'&&e.tagName!=='STYLE'&&vis(e)&&((e.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(q)));es=es.filter(e=>![...e.children].some(c=>vis(c)&&((c.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(q))));if(!es.length)return null;const e=es.sort((a,b)=>a.getBoundingClientRect().width*a.getBoundingClientRect().height-b.getBoundingClientRect().width*b.getBoundingClientRect().height)[0];const c=e.closest('button,a,[role=button],[role=option],[role=listitem],[tabindex]')||e;const r=c.getBoundingClientRect();return {{leafTag:e.tagName,controlTag:c.tagName,role:c.getAttribute('role'),tabindex:c.getAttribute('tabindex'),text:(c.innerText||e.innerText||'').slice(0,300),positiveGeometry:r.width>0&&r.height>0}}}})()""")
   if cand:break
   time.sleep(.2)
  clicked=False
  if cand:
   clicked=bool(expr(f"""(()=>{{const q={json.dumps(n)};const vis=e=>{{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0}};let es=[...document.querySelectorAll('body *')].filter(e=>e.tagName!=='SCRIPT'&&e.tagName!=='STYLE'&&vis(e)&&((e.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(q)));es=es.filter(e=>![...e.children].some(c=>vis(c)&&((c.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(q))));if(!es.length)return false;const e=es.sort((a,b)=>a.getBoundingClientRect().width*a.getBoundingClientRect().height-b.getBoundingClientRect().width*b.getBoundingClientRect().height)[0];const c=e.closest('button,a,[role=button],[role=option],[role=listitem],[tabindex]')||e;c.scrollIntoView({{block:'center'}});c.click();return true}})()"""))
  time.sleep(.5)
  # Selection proof must exclude search-result descendants and require a visible address outside result popup/listbox.
  post=expr(f"""(()=>{{const q={json.dumps(n)};const vis=e=>{{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden'&&+s.opacity>0}};const es=[...document.querySelectorAll('body *')].filter(e=>vis(e)&&((e.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(q))&&!e.closest('[role=listbox]')&&!e.closest('[role=option]'));const leaf=es.filter(e=>![...e.children].some(c=>vis(c)&&((c.innerText||'').toLowerCase().replace(/\\s+/g,' ').includes(q))));return leaf.length>0}})()""")
  print(f"[R7E-R2] record {i}/10 exact={val==a} candidate={bool(cand)} control={cand.get('controlTag') if cand else None}/{cand.get('role') if cand else None} selected={clicked} postVisible={bool(post)}",flush=True)
  records.append({"cohortPosition":i,"address":a,"inputValueMatchesQuery":val==a,"matchingRenderedCandidateVisible":bool(cand),"candidateControlContract":cand,"selectionActivated":clicked,"postSelectionAddressVisible":bool(post)})
 with open(out,"w") as f:json.dump({"navigation":{"selectedTargetType":selected["type"],"selectedTargetUrl":selected["url"],"explorerControlFound":bool(nav),"searchControlCount":sc,"activationSucceeded":bool(nav and sc==1)},"records":records},f,indent=2)
finally:
 if ws:
  try:ws.close()
  except:pass
 proc.terminate()
 try:proc.wait(timeout=2)
 except:proc.kill()
 shutil.rmtree(profile,ignore_errors=True)
