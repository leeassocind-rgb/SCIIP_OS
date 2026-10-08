#!/usr/bin/env python3
import sys,json,socket,base64,os,struct,urllib.request
P=int(sys.argv[1]);OUT=sys.argv[2];ADDR=sys.argv[3]
tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{P}/json"));t=next(x for x in tabs if x.get("type")=="page" and x.get("webSocketDebuggerUrl"))
u=t["webSocketDebuggerUrl"][5:];hp,pth=u.split("/",1);host,port=hp.split(":");s=socket.create_connection((host,int(port)),timeout=5)
k=base64.b64encode(os.urandom(16)).decode();s.sendall((f"GET /{pth} HTTP/1.1\r\nHost: {hp}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode());b=b""
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
call("Runtime.enable")
a=json.dumps(ADDR)
script=r"""(async()=>{const address=__A__,sleep=m=>new Promise(r=>setTimeout(r,m)),vis=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length),text=e=>(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ');await sleep(1500);
let nav=[...document.querySelectorAll('button,a,[role="button"],[role="tab"]')].filter(e=>vis(e)&&text(e)==='Explorer');if(nav.length===1){nav[0].click();await sleep(1800)}
let e=[...document.querySelectorAll('input')].filter(vis).find(x=>x.type==='search'&&(/Search SCIIP/i.test(x.placeholder||'')||/Search SCIIP/i.test(x.getAttribute('aria-label')||'')));if(!e)return{ok:false,reason:'SEARCH_INPUT_MISSING'};
e.focus();let set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(e,address);e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));await sleep(1600);
const body=document.body?.innerText||'',html=document.documentElement?.outerHTML||'';
const interactive=[...document.querySelectorAll('button,a,[role="option"],[role="menuitem"],li,[data-testid],[data-property-id]')].filter(vis).map(x=>({tag:x.tagName.toLowerCase(),role:x.getAttribute('role'),text:text(x).slice(0,1000),testid:x.getAttribute('data-testid'),propertyId:x.getAttribute('data-property-id')})).filter(x=>/BESSEMER|14117/i.test(x.text));
const globals={};
for(const k of Object.keys(window).filter(k=>/property|search|explorer|sciip/i.test(k)).slice(0,150)){try{let v=window[k];if(v&&typeof v==='object'){let st=JSON.stringify(v);if(st&&/BESSEMER|14117/i.test(st))globals[k]=st.slice(0,10000)}}catch{}}
return{ok:true,href:location.href,searchValue:e.value,bodyText:body.slice(0,80000),html:html.slice(0,250000),interactiveBessemer:interactive,matchingGlobals:globals}})()""".replace("__A__",a)
r=ev(script);open(OUT,"w").write(json.dumps(r,indent=2));print(json.dumps(r))
