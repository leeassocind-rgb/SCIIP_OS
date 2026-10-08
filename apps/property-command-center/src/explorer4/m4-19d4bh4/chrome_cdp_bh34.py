#!/usr/bin/env python3
import sys,json,socket,base64,os,struct,urllib.request

PORT=int(sys.argv[1]); MODE=sys.argv[2]; OUT=sys.argv[3]
ADDRESS=sys.argv[4] if len(sys.argv)>4 else ""

tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{PORT}/json"))
tab=next(t for t in tabs if t.get("type")=="page" and t.get("webSocketDebuggerUrl"))
u=tab["webSocketDebuggerUrl"][5:]
hp,pth=u.split("/",1); host,prt=hp.split(":"); prt=int(prt)
s=socket.create_connection((host,prt),timeout=5)
key=base64.b64encode(os.urandom(16)).decode()
req=(f"GET /{pth} HTTP/1.1\r\nHost: {host}:{prt}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
     f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
s.sendall(req.encode())
buf=b""
while b"\r\n\r\n" not in buf: buf+=s.recv(4096)

def rx(n):
    b=b""
    while len(b)<n:
        q=s.recv(n-len(b))
        if not q: raise EOFError("websocket closed")
        b+=q
    return b

def send_obj(o):
    p=json.dumps(o).encode(); m=os.urandom(4); n=len(p); h=bytearray([0x81])
    if n<126: h.append(0x80|n)
    elif n<65536: h.extend([0xFE]); h.extend(struct.pack("!H",n))
    else: h.extend([0xFF]); h.extend(struct.pack("!Q",n))
    h.extend(m); s.sendall(bytes(h)+bytes(p[i]^m[i%4] for i in range(n)))

def recv_obj():
    while True:
        h=rx(2); op=h[0]&15; n=h[1]&127
        if n==126: n=struct.unpack("!H",rx(2))[0]
        elif n==127: n=struct.unpack("!Q",rx(8))[0]
        mask=rx(4) if h[1]&128 else b""; p=rx(n)
        if mask: p=bytes(p[i]^mask[i%4] for i in range(n))
        if op==1: return json.loads(p.decode(errors="replace"))

seq=0
def call(method,params=None):
    global seq
    seq+=1
    msg={"id":seq,"method":method}
    if params is not None: msg["params"]=params
    send_obj(msg)
    while True:
        r=recv_obj()
        if r.get("id")==seq:
            if "error" in r: raise RuntimeError(str(r["error"]))
            return r.get("result",{})

def ev(expr):
    r=call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True,"userGesture":True})
    return r.get("result",{}).get("value")

call("Runtime.enable")

if MODE=="inspect":
    script=r"""
(async()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 await sleep(500);
 const all=[...document.querySelectorAll('*')];
 const visible=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
 const txt=e=>(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,500);
 const attrs=e=>({
   tag:e.tagName.toLowerCase(), id:e.id||null, role:e.getAttribute('role'),
   type:e.getAttribute('type'), placeholder:e.getAttribute('placeholder'),
   ariaLabel:e.getAttribute('aria-label'), ariaExpanded:e.getAttribute('aria-expanded'),
   contenteditable:e.getAttribute('contenteditable'), tabIndex:e.tabIndex,
   className:typeof e.className==='string'?e.className.slice(0,300):null, text:txt(e)
 });
 const controls=all.filter(e=>visible(e)&&(
   ['INPUT','BUTTON','TEXTAREA','SELECT'].includes(e.tagName) ||
   e.getAttribute('role') || e.getAttribute('contenteditable')==='true' ||
   /search|find|property|address|command/i.test(
     [e.id,e.className,e.getAttribute('aria-label'),e.getAttribute('placeholder'),txt(e)].join(' ')
   )
 )).slice(0,400).map((e,i)=>({index:i,...attrs(e)}));
 return {url:location.href,title:document.title,bodyText:(document.body?.innerText||'').slice(0,40000),controls};
})()
"""
    result=ev(script)

elif MODE=="execute":
    address_json=json.dumps(ADDRESS)
    script=r"""
(async()=>{
 const target=__ADDRESS__;
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const visible=e=>!!(e.offsetWidth||e.offsetHeight||e.getClientRects().length);
 const text=e=>(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ');
 const rankButton=e=>{
   const s=[e.id,e.className,e.getAttribute('aria-label'),e.getAttribute('title'),text(e)].join(' ');
   return (/search/i.test(s)?10:0)+(/find/i.test(s)?7:0)+(/property/i.test(s)?5:0)+(/address/i.test(s)?4:0)+(/command/i.test(s)?2:0);
 };
 const before={text:(document.body?.innerText||'').slice(0,30000)};
 let action={opened:false,opener:null,editor:null,clickedResult:false,resultText:null};

 let editors=[...document.querySelectorAll('input,textarea,[contenteditable="true"],[role="combobox"],[role="searchbox"]')]
   .filter(visible);
 if(!editors.length){
   const buttons=[...document.querySelectorAll('button,[role="button"],a')]
     .filter(visible).map(e=>({e,score:rankButton(e)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
   if(buttons[0]){
     action.opener={score:buttons[0].score,text:text(buttons[0].e).slice(0,300),
       aria:buttons[0].e.getAttribute('aria-label'),id:buttons[0].e.id||null};
     buttons[0].e.click(); action.opened=true; await sleep(700);
   }
   editors=[...document.querySelectorAll('input,textarea,[contenteditable="true"],[role="combobox"],[role="searchbox"]')].filter(visible);
 }
 if(!editors.length) return {ok:false,reason:'NO_EDITOR_AFTER_OPENER',action,bodyText:(document.body?.innerText||'').slice(0,40000)};

 const scoreEditor=e=>{
   const s=[e.id,e.className,e.getAttribute('aria-label'),e.getAttribute('placeholder'),e.getAttribute('role')].join(' ');
   return (/search/i.test(s)?10:0)+(/address/i.test(s)?8:0)+(/property/i.test(s)?6:0)+(/find/i.test(s)?5:0)+(e.tagName==='INPUT'?2:0);
 };
 const editor=editors.map(e=>({e,score:scoreEditor(e)})).sort((a,b)=>b.score-a.score)[0];
 const e=editor.e; action.editor={tag:e.tagName.toLowerCase(),score:editor.score,placeholder:e.getAttribute('placeholder'),
   aria:e.getAttribute('aria-label'),role:e.getAttribute('role'),contenteditable:e.getAttribute('contenteditable')};

 e.focus();
 if(e instanceof HTMLInputElement || e instanceof HTMLTextAreaElement){
   const proto=e instanceof HTMLInputElement?HTMLInputElement.prototype:HTMLTextAreaElement.prototype;
   const setter=Object.getOwnPropertyDescriptor(proto,'value')?.set;
   if(setter)setter.call(e,target); else e.value=target;
   e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));
 }else{
   e.textContent=target; e.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:target}));
 }
 await sleep(1200);

 const candidates=[...document.querySelectorAll('[role="option"],[role="menuitem"],li,button,a,div')]
   .filter(x=>visible(x)&&text(x).toLowerCase().includes(target.toLowerCase()))
   .sort((a,b)=>text(a).length-text(b).length);
 if(candidates[0]){
   action.resultText=text(candidates[0]).slice(0,500);
   candidates[0].click(); action.clickedResult=true; await sleep(1600);
 }else{
   e.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
   e.dispatchEvent(new KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
   await sleep(1500);
 }
 return {ok:true,action,url:location.href,title:document.title,
   bodyText:(document.body?.innerText||'').slice(0,60000),
   html:(document.documentElement?.outerHTML||'').slice(0,200000)};
})()
"""
    result=ev(script.replace("__ADDRESS__",address_json))
else:
    raise SystemExit("unknown mode")

with open(OUT,"w") as f: json.dump(result,f,indent=2)
print(json.dumps(result))
