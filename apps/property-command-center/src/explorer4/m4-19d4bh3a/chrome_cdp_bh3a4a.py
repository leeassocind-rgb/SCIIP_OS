#!/usr/bin/env python3
import sys,json,socket,base64,os,struct,urllib.request
P=int(sys.argv[1]);MODE=sys.argv[2];OUT=sys.argv[3];ADDR=sys.argv[4] if len(sys.argv)>4 else ""
tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{P}/json"));t=next(x for x in tabs if x.get("type")=="page" and x.get("webSocketDebuggerUrl"))
u=t["webSocketDebuggerUrl"][5:];hp,pth=u.split("/",1);h,p=hp.split(":");s=socket.create_connection((h,int(p)),timeout=5)
k=base64.b64encode(os.urandom(16)).decode();s.sendall((f"GET /{pth} HTTP/1.1\r\nHost: {hp}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
b=b""
while b"\r\n\r\n" not in b:b+=s.recv(4096)
def rx(n):
 b=b""
 while len(b)<n:b+=s.recv(n-len(b))
 return b
def send(o):
 q=json.dumps(o).encode();m=os.urandom(4);n=len(q);z=bytearray([129])
 if n<126:z.append(128|n)
 elif n<65536:z.append(254);z.extend(struct.pack("!H",n))
 else:z.append(255);z.extend(struct.pack("!Q",n))
 z.extend(m);s.sendall(bytes(z)+bytes(q[i]^m[i%4] for i in range(n)))
def recv():
 while 1:
  h=rx(2);op=h[0]&15;n=h[1]&127
  if n==126:n=struct.unpack("!H",rx(2))[0]
  elif n==127:n=struct.unpack("!Q",rx(8))[0]
  m=rx(4) if h[1]&128 else b"";q=rx(n)
  if m:q=bytes(q[i]^m[i%4] for i in range(n))
  if op==1:return json.loads(q.decode(errors="replace"))
i=0
def call(m,p=None):
 global i;i+=1;o={"id":i,"method":m}
 if p is not None:o["params"]=p
 send(o)
 while 1:
  r=recv()
  if r.get("id")==i:return r
def ev(x):
 r=call("Runtime.evaluate",{"expression":x,"returnByValue":True,"awaitPromise":True,"userGesture":True})
 return r.get("result",{}).get("result",{}).get("value")
call("Runtime.enable")
if MODE=="inspect":
 script=r"""(()=>{const V=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length),A=e=>({tag:e.tagName.toLowerCase(),type:e.type||null,role:e.getAttribute('role'),placeholder:e.getAttribute('placeholder'),aria:e.getAttribute('aria-label'),cls:typeof e.className==='string'?e.className:null,text:(e.innerText||'').trim().slice(0,300)});return{url:location.href,title:document.title,body:(document.body?.innerText||'').slice(0,30000),controls:[...document.querySelectorAll('input,button,[role="search"],[role="combobox"],[role="searchbox"]')].filter(V).map(A)}})()"""
elif MODE=="execute":
 a=json.dumps(ADDR)
 script=r"""(async()=>{const sleep=m=>new Promise(r=>setTimeout(r,m)),V=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);let e=[...document.querySelectorAll('input')].filter(V).find(x=>x.type==='search'&&x.getAttribute('aria-label')==='Search SCIIP')||[...document.querySelectorAll('input')].filter(V).find(x=>/Search SCIIP/i.test(x.placeholder||''));if(!e)return{ok:false,reason:'EXACT_RUNTIME_SEARCH_INPUT_NOT_FOUND',body:(document.body?.innerText||'').slice(0,30000)};e.focus();let set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(e,__A__);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1200);let q=__A__.toLowerCase(),cs=[...document.querySelectorAll('button,a,[role="option"],li,article,div')].filter(x=>V(x)&&(x.innerText||'').toLowerCase().includes(q)).sort((x,y)=>(x.innerText||'').length-(y.innerText||'').length);let clicked=null;if(cs[0]){clicked=(cs[0].innerText||'').trim().slice(0,500);cs[0].click();await sleep(1400)}else{e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true}));await sleep(1200)}return{ok:true,clicked,body:(document.body?.innerText||'').slice(0,60000),html:(document.documentElement?.outerHTML||'').slice(0,250000)}})()""".replace("__A__",a)
else:raise SystemExit(2)
r=ev(script);open(OUT,"w").write(json.dumps(r,indent=2));print(json.dumps(r))
