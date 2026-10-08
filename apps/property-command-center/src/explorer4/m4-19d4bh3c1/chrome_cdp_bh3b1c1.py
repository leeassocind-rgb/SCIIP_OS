#!/usr/bin/env python3
import sys,json,socket,base64,os,struct,urllib.request,time
P=int(sys.argv[1]); OUT=sys.argv[2]
tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{P}/json"))
t=next(x for x in tabs if x.get("type")=="page" and x.get("webSocketDebuggerUrl"))
u=t["webSocketDebuggerUrl"][5:]; hp,pth=u.split("/",1); host,port=hp.split(":")
s=socket.create_connection((host,int(port)),timeout=5)
k=base64.b64encode(os.urandom(16)).decode()
s.sendall((f"GET /{pth} HTTP/1.1\r\nHost: {hp}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
b=b""
while b"\r\n\r\n" not in b:b+=s.recv(4096)
def rx(n):
 b=b""
 while len(b)<n:b+=s.recv(n-len(b))
 return b
def send(o):
 q=json.dumps(o).encode();m=os.urandom(4);n=len(q);h=bytearray([129])
 if n<126:h.append(128|n)
 elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
 else:h.extend([255]);h.extend(struct.pack("!Q",n))
 h.extend(m);s.sendall(bytes(h)+bytes(q[i]^m[i%4] for i in range(n)))
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
call("Runtime.enable");call("Page.enable")
script=r"""(async()=>{const sleep=m=>new Promise(r=>setTimeout(r,m));await sleep(1800);
const vis=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
const all=[...document.querySelectorAll('button,a,[role="button"],[role="tab"]')].filter(vis);
const cand=all.filter(e=>(e.innerText||e.textContent||'').trim()==='Explorer');
const before={href:location.href,body:(document.body?.innerText||'').slice(0,12000),
 candidates:cand.map(e=>({tag:e.tagName,role:e.getAttribute('role'),href:e.href||null,cls:typeof e.className==='string'?e.className:null}))};
let clicked=false;if(cand.length===1){cand[0].click();clicked=true;await sleep(3000)}
const inputs=[...document.querySelectorAll('input')].filter(vis).map(e=>({type:e.type,placeholder:e.placeholder,aria:e.getAttribute('aria-label'),value:e.value||'',cls:typeof e.className==='string'?e.className:null}));
const body=(document.body?.innerText||'').slice(0,50000);
return{before,clicked,after:{href:location.href,pathname:location.pathname,title:document.title,body,inputs,
 controls:[...document.querySelectorAll('button,a,[role]')].filter(vis).map(e=>({tag:e.tagName.toLowerCase(),text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,300),role:e.getAttribute('role'),aria:e.getAttribute('aria-label'),href:e.href||null})).slice(0,400)}}})()"""
r=ev(script)
open(OUT,"w").write(json.dumps(r,indent=2))
print(json.dumps(r))
