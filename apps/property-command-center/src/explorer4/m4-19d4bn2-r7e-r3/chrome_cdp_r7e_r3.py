import sys,json,time,os,subprocess,tempfile,urllib.request,urllib.parse,socket,struct,base64,secrets,shutil
url,out,*qs=sys.argv[1:]; chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"; port=9243; prof=tempfile.mkdtemp(prefix="sciip-r7e-r3-")
p=subprocess.Popen([chrome,f"--remote-debugging-port={port}",f"--user-data-dir={prof}","--headless=new","--disable-gpu","--disable-extensions","--no-first-run",url],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
class W:
 def __init__(s,u):
  q=urllib.parse.urlparse(u);s.x=socket.create_connection((q.hostname,q.port),30);s.x.settimeout(30);k=base64.b64encode(secrets.token_bytes(16)).decode();s.x.sendall(f"GET {q.path} HTTP/1.1\r\nHost: {q.hostname}:{q.port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n".encode());d=b""
  while b"\r\n\r\n" not in d:d+=s.x.recv(4096)
 def ex(s,n):
  d=b""
  while len(d)<n:d+=s.x.recv(n-len(d))
  return d
 def send(s,t):
  b=t.encode();n=len(b);h=bytes([129,128|(n if n<126 else 126)])+(struct.pack("!H",n) if n>=126 else b"");m=secrets.token_bytes(4);s.x.sendall(h+m+bytes(v^m[i%4] for i,v in enumerate(b)))
 def recv(s):
  parts=[]
  while 1:
   a,b=s.ex(2);fin=a&128;op=a&15;n=b&127
   if n==126:n=struct.unpack("!H",s.ex(2))[0]
   elif n==127:n=struct.unpack("!Q",s.ex(8))[0]
   z=s.ex(n)
   if op==1:parts=[z]
   elif op==0:parts.append(z)
   if fin and parts:return b"".join(parts).decode()
w=None
try:
 t=None
 for _ in range(50):
  try:
   with urllib.request.urlopen(f"http://127.0.0.1:{port}/json") as r:
    a=json.load(r); b=[x for x in a if x.get("type")=="page" and str(x.get("url","")).startswith("http://127.0.0.1:5173")]
    if b:t=b[0];break
  except:pass
  time.sleep(.2)
 if not t:raise SystemExit("Explorer page target absent")
 w=W(t["webSocketDebuggerUrl"]); seq=0
 def call(m,p={}):
  global seq;seq+=1;i=seq;w.send(json.dumps({"id":i,"method":m,"params":p}))
  while 1:
   x=json.loads(w.recv())
   if x.get("id")==i:return x
 def e(x):return call("Runtime.evaluate",{"expression":x,"returnByValue":True}).get("result",{}).get("result",{}).get("value")
 call("Runtime.enable");time.sleep(2)
 e("(()=>{const z=[...document.querySelectorAll('a,button,[role=button]')].find(x=>(x.textContent||'').trim()==='Explorer');if(z)z.click()})()");time.sleep(.6)
 S="[...document.querySelectorAll('input')].find(e=>((e.placeholder||'')+' '+(e.getAttribute('aria-label')||'')).toLowerCase().includes('search sciip'))"
 R=[]
 for i,q in enumerate(qs,1):
  e("(()=>{let x="+S+";x.focus();x.select()})()");call("Input.dispatchKeyEvent",{"type":"rawKeyDown","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8});call("Input.dispatchKeyEvent",{"type":"keyUp","key":"Backspace","code":"Backspace","windowsVirtualKeyCode":8})
  for c in q:call("Input.dispatchKeyEvent",{"type":"char","text":c,"unmodifiedText":c})
  time.sleep(.7)
  js="(()=>{const x="+S+";const vis=e=>{let r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!='none'&&s.visibility!='hidden'};let all=[...document.querySelectorAll('body *')];let near=all.filter(e=>vis(e)&&e!==x&&(e.innerText||e.textContent||'').trim()).map(e=>{let r=e.getBoundingClientRect();return {tag:e.tagName,role:e.getAttribute('role'),cls:String(e.className||'').slice(0,160),text:(e.innerText||e.textContent||'').trim().replace(/\\s+/g,' ').slice(0,500),x:Math.round(r.x),y:Math.round(r.y),w:Math.round(r.width),h:Math.round(r.height)}}).filter(o=>o.y<500).slice(-120);return {value:x&&x.value,bodyText:(document.body.innerText||'').slice(0,12000),visibleTop:near,html:(document.body.outerHTML||'').slice(0,120000)}})()"
  snap=e(js); print(f"[R7E-R3] {i}/10 {q}: value={snap.get('value')!r} bodyContains={q.lower() in snap.get('bodyText','').lower()}",flush=True);R.append({"position":i,"query":q,"snapshot":snap})
 with open(out,"w") as f:json.dump({"target":t["url"],"records":R},f,indent=2)
finally:
 if w:
  try:w.x.close()
  except:pass
 p.terminate();shutil.rmtree(prof,ignore_errors=True)
