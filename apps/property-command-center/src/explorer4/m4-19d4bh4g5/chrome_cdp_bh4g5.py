#!/usr/bin/env python3
import sys,json,socket,base64,os,struct,urllib.request
P=int(sys.argv[1]);OUT=sys.argv[2];TARGET=sys.argv[3]
tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{P}/json"));page=next(x for x in tabs if x.get("type")=="page" and x.get("webSocketDebuggerUrl"))
u=page["webSocketDebuggerUrl"][5:];hp,pth=u.split("/",1);host,port=hp.split(":");s=socket.create_connection((host,int(port)),timeout=8)
k=base64.b64encode(os.urandom(16)).decode();s.sendall((f"GET /{pth} HTTP/1.1\r\nHost: {hp}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode());b=b""
while b"\r\n\r\n" not in b:b+=s.recv(4096)
def rx(n):
 b=b""
 while len(b)<n:
  q=s.recv(n-len(b))
  if not q:raise EOFError()
  b+=q
 return b
def send(o):
 q=json.dumps(o).encode();m=os.urandom(4);n=len(q);h=bytearray([129])
 if n<126:h.append(128|n)
 elif n<65536:h.append(254);h.extend(struct.pack("!H",n))
 else:h.append(255);h.extend(struct.pack("!Q",n))
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
a=json.dumps(TARGET)
script=r"""(async()=>{const sleep=m=>new Promise(r=>setTimeout(r,m)),vis=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length),txt=e=>(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ');await sleep(2200);
const inv=await fetch('/explorer/governed-base-inventory.json',{cache:'no-store'}).then(r=>r.json());const rows=Array.isArray(inv)?inv:(inv?.properties||inv?.records||inv?.items||[]);
const bessemer=rows.filter(r=>/14117-14123 Bessemer St/i.test(String(r?.address||''))||r?.canonicalPropertyId==='CPROP-0021AC235DED809E1821').length;
const nav=[...document.querySelectorAll('button,a,[role="button"],[role="tab"]')].filter(e=>vis(e)&&txt(e)==='Explorer');if(nav.length===1){nav[0].click();await sleep(1800)}
const searches=[...document.querySelectorAll('input')].filter(e=>vis(e)&&e.type==='search'&&(/Search SCIIP/i.test(e.placeholder||'')||/Search SCIIP/i.test(e.getAttribute('aria-label')||'')));
let searchResult={found:false};if(searches.length===1){const x=searches[0],set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(x,__TARGET__);x.dispatchEvent(new Event('input',{bubbles:true}));x.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1500);const body=document.body?.innerText||'';searchResult={found:true,value:x.value,targetVisible:body.toUpperCase().includes(String(__TARGET__).toUpperCase()),bodyExcerpt:body.slice(0,12000)}}
return{inventoryCount:rows.length,bessemerCount:bessemer,explorerNavCount:nav.length,explorerMounted:document.body?.innerText?.includes('Property Intelligence')||document.body?.innerText?.includes('Explorer'),searchControlCount:searches.length,searchResult,href:location.href}})()""".replace("__TARGET__",a)
r=ev(script);open(OUT,"w").write(json.dumps(r,indent=2));print(json.dumps(r))
