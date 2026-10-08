#!/usr/bin/env python3
import sys,json,socket,base64,os,struct,urllib.request,time
P=int(sys.argv[1]);OUT=sys.argv[2];ADDR=sys.argv[3]
tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{P}/json"))
t=next(x for x in tabs if x.get("type")=="page" and x.get("webSocketDebuggerUrl"))
u=t["webSocketDebuggerUrl"][5:];hp,pth=u.split("/",1);host,port=hp.split(":")
s=socket.create_connection((host,int(port)),timeout=5)
k=base64.b64encode(os.urandom(16)).decode()
s.sendall((f"GET /{pth} HTTP/1.1\r\nHost: {hp}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
buf=b""
while b"\r\n\r\n" not in buf:buf+=s.recv(4096)
def rx(n):
 b=b""
 while len(b)<n:
  q=s.recv(n-len(b))
  if not q:raise EOFError("ws closed")
  b+=q
 return b
def send(o):
 q=json.dumps(o).encode();m=os.urandom(4);n=len(q);h=bytearray([129])
 if n<126:h.append(128|n)
 elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
 else:h.extend([255]);h.extend(struct.pack("!Q",n))
 h.extend(m);s.sendall(bytes(h)+bytes(q[i]^m[i%4] for i in range(n)))
def recv():
 while True:
  h=rx(2);op=h[0]&15;n=h[1]&127
  if n==126:n=struct.unpack("!H",rx(2))[0]
  elif n==127:n=struct.unpack("!Q",rx(8))[0]
  m=rx(4) if h[1]&128 else b"";q=rx(n)
  if m:q=bytes(q[i]^m[i%4] for i in range(n))
  if op==1:return json.loads(q.decode(errors="replace"))
seq=0
def call(m,p=None):
 global seq;seq+=1;o={"id":seq,"method":m}
 if p is not None:o["params"]=p
 send(o)
 while True:
  r=recv()
  if r.get("id")==seq:return r
def ev(x):
 r=call("Runtime.evaluate",{"expression":x,"returnByValue":True,"awaitPromise":True,"userGesture":True})
 return r.get("result",{}).get("result",{}).get("value")
call("Runtime.enable");call("Page.enable")
a=json.dumps(ADDR)
script=r"""(async()=>{
 const address=__ADDR__,sleep=m=>new Promise(r=>setTimeout(r,m));
 const vis=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
 const text=e=>(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ');
 const norm=s=>String(s||'').toUpperCase().replace(/[,\s]+/g,' ').trim();

 await sleep(1600);

 // 1. Activate exact shell Explorer nav, as certified by BH3C1.
 const navs=[...document.querySelectorAll('button,a,[role="button"],[role="tab"]')]
   .filter(e=>vis(e)&&text(e)==='Explorer');
 if(navs.length!==1)return{ok:false,phase:'NAV',reason:'EXACT_EXPLORER_NAV_NOT_UNIQUE',count:navs.length};
 navs[0].click(); await sleep(2200);

 // 2. Bind exact certified Search SCIIP input.
 const inputs=[...document.querySelectorAll('input')].filter(vis);
 const search=inputs.filter(e=>e.type==='search'&&
   (/Search SCIIP/i.test(e.placeholder||'')||/Search SCIIP/i.test(e.getAttribute('aria-label')||'')));
 if(search.length!==1)return{ok:false,phase:'SEARCH_BIND',reason:'EXACT_SEARCH_NOT_UNIQUE',count:search.length,
   inputs:inputs.map(e=>({type:e.type,placeholder:e.placeholder,aria:e.getAttribute('aria-label')}))};
 const e=search[0]; e.focus();
 const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')?.set;
 if(setter)setter.call(e,address);else e.value=address;
 e.dispatchEvent(new Event('input',{bubbles:true}));
 e.dispatchEvent(new Event('change',{bubbles:true}));
 await sleep(1200);

 // 3. Collect only reasonably interactive address-bearing result candidates.
 const selectors='[role="option"],[role="menuitem"],button,a,li,[data-testid],[data-property-id]';
 let results=[...document.querySelectorAll(selectors)].filter(x=>vis(x)&&norm(text(x)).includes(norm(address)));
 results.sort((x,y)=>text(x).length-text(y).length);
 let clicked=false,clickedText=null;
 if(results.length){
   clickedText=text(results[0]).slice(0,1000);results[0].click();clicked=true;await sleep(1800);
 }else{
   e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
   e.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
   await sleep(1700);
   results=[...document.querySelectorAll(selectors)].filter(x=>vis(x)&&norm(text(x)).includes(norm(address)));
   results.sort((x,y)=>text(x).length-text(y).length);
   if(results.length){clickedText=text(results[0]).slice(0,1000);results[0].click();clicked=true;await sleep(1500);}
 }

 const body=document.body?.innerText||'';
 const html=document.documentElement?.outerHTML||'';
 return{
   ok:true,phase:'COMPLETE',clicked,clickedText,
   search:{type:e.type,placeholder:e.placeholder,aria:e.getAttribute('aria-label'),value:e.value},
   href:location.href,title:document.title,
   bodyText:body.slice(0,80000),
   html:html.slice(0,300000),
   resultCandidateCount:results.length
 };
})()""".replace("__ADDR__",a)
r=ev(script)
open(OUT,"w").write(json.dumps(r,indent=2))
print(json.dumps(r))
