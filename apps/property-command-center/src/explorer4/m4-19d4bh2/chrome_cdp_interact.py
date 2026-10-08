#!/usr/bin/env python3
import sys,json,socket,base64,os,struct,urllib.request
port=int(sys.argv[1]); addr=sys.argv[2]; out=sys.argv[3]
tabs=json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json"))
tab=next(t for t in tabs if t.get("type")=="page" and t.get("webSocketDebuggerUrl"))
u=tab["webSocketDebuggerUrl"][5:]; hp,pth=u.split("/",1); host,prt=hp.split(":"); prt=int(prt)
s=socket.create_connection((host,prt),timeout=5); key=base64.b64encode(os.urandom(16)).decode()
s.sendall((f"GET /{pth} HTTP/1.1\r\nHost: {host}:{prt}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
buf=b""
while b"\r\n\r\n" not in buf: buf+=s.recv(4096)
def rx(n):
    x=b""
    while len(x)<n:x+=s.recv(n-len(x))
    return x
def send(o):
    p=json.dumps(o).encode(); m=os.urandom(4); n=len(p); h=bytearray([0x81])
    if n<126:h.append(0x80|n)
    elif n<65536:h.extend([0xFE]);h.extend(struct.pack("!H",n))
    else:h.extend([0xFF]);h.extend(struct.pack("!Q",n))
    h.extend(m); s.sendall(bytes(h)+bytes(p[i]^m[i%4] for i in range(n)))
def recv():
    while True:
        h=rx(2); op=h[0]&15; n=h[1]&127
        if n==126:n=struct.unpack("!H",rx(2))[0]
        elif n==127:n=struct.unpack("!Q",rx(8))[0]
        mask=rx(4) if h[1]&128 else b""; p=rx(n)
        if mask:p=bytes(p[i]^mask[i%4] for i in range(n))
        if op==1:return json.loads(p.decode())
i=0
def call(method,params=None):
    global i
    i+=1; o={"id":i,"method":method}
    if params is not None:o["params"]=params
    send(o)
    while True:
        r=recv()
        if r.get("id")==i:return r.get("result",{})
def ev(expr):
    r=call("Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True,"userGesture":True})
    return r.get("result",{}).get("value")
call("Runtime.enable")
js = r'''(async()=>{
 const target=__ADDR__,sleep=ms=>new Promise(r=>setTimeout(r,ms));
 const ins=[...document.querySelectorAll("input")].filter(e=>e.offsetParent!==null).map((e,i)=>({e,i,s:(/search/i.test(e.placeholder||"")?5:0)+(/address/i.test(e.placeholder||"")?4:0)+(e.type==="search"?3:0)})).sort((a,b)=>b.s-a.s);
 const c=ins[0]; if(!c)return {ok:false,reason:"NO_INPUT"};
 c.e.focus(); const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set; set.call(c.e,target);
 c.e.dispatchEvent(new Event("input",{bubbles:true})); c.e.dispatchEvent(new Event("change",{bubbles:true})); await sleep(1200);
 let els=[...document.querySelectorAll("button,[role=option],[role=menuitem],li,a,div")].filter(e=>e.offsetParent!==null&&(e.innerText||"").toLowerCase().includes(target.toLowerCase())).sort((a,b)=>(a.innerText||"").length-(b.innerText||"").length);
 let clicked=false,clickedText=null;
 if(els[0]){els[0].click();clicked=true;clickedText=(els[0].innerText||"").slice(0,500);} else {c.e.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));}
 await sleep(1800);
 return {ok:true,input:{i:c.i,s:c.s,placeholder:c.e.placeholder,type:c.e.type},clicked,clickedText,text:(document.body?.innerText||"").slice(0,50000),html:(document.documentElement?.outerHTML||"").slice(0,150000),url:location.href,title:document.title};
})()'''.replace('__ADDR__', json.dumps(addr))
res=ev(js)
json.dump(res,open(out,'w'),indent=2)
print(json.dumps(res))
