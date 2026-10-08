#!/usr/bin/env python3
import base64, hashlib, json, os, socket, struct, subprocess, sys, tempfile, time, urllib.request, shutil
from pathlib import Path
from urllib.parse import urlparse

app = Path(sys.argv[1]).resolve()
evidence = app / "evidence"
chrome = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
port = 9223
server_url = "http://127.0.0.1:5173/"
result_path = evidence / "m4-19d4bk2-r2-r1-cdp-navigation-result.json"
shot_path = evidence / "m4-19d4bk2-r2-r1-post-navigation-screenshot.png"
stderr_path = evidence / "m4-19d4bk2-r2-r1-chrome-stderr.log"

def get_json(url, timeout=2):
    with urllib.request.urlopen(url, timeout=timeout) as r:
        return json.loads(r.read().decode())

class SimpleWebSocket:
    def __init__(self, url, timeout=10):
        u=urlparse(url)
        if u.scheme!="ws":
            raise RuntimeError("only ws:// supported for localhost CDP")
        self.sock=socket.create_connection((u.hostname, u.port or 80), timeout=timeout)
        self.sock.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        path=u.path or "/"
        if u.query:
            path += "?" + u.query
        req=(
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {u.hostname}:{u.port or 80}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            chunk=self.sock.recv(4096)
            if not chunk:
                raise RuntimeError("websocket handshake closed")
            data+=chunk
        header=data.split(b"\r\n\r\n",1)[0].decode("latin1")
        if " 101 " not in header:
            raise RuntimeError("websocket handshake failed: "+header[:500])
        accept=None
        for line in header.split("\r\n")[1:]:
            if ":" in line:
                k,v=line.split(":",1)
                if k.lower()=="sec-websocket-accept":
                    accept=v.strip()
        expected=base64.b64encode(hashlib.sha1((key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest()).decode()
        if accept!=expected:
            raise RuntimeError("websocket accept mismatch")
        self.buffer=data.split(b"\r\n\r\n",1)[1]

    def _recv_exact(self,n):
        out=b""
        if self.buffer:
            take=min(n,len(self.buffer))
            out,self.buffer=self.buffer[:take],self.buffer[take:]
        while len(out)<n:
            chunk=self.sock.recv(n-len(out))
            if not chunk:
                raise RuntimeError("websocket closed")
            out+=chunk
        return out

    def send_text(self,text):
        payload=text.encode()
        mask=os.urandom(4)
        n=len(payload)
        frame=bytearray([0x81])
        if n<126:
            frame.append(0x80|n)
        elif n<65536:
            frame.append(0x80|126); frame.extend(struct.pack("!H",n))
        else:
            frame.append(0x80|127); frame.extend(struct.pack("!Q",n))
        frame.extend(mask)
        frame.extend(bytes(b ^ mask[i%4] for i,b in enumerate(payload)))
        self.sock.sendall(frame)

    def recv_text(self):
        fragments=[]
        opcode0=None
        while True:
            h=self._recv_exact(2)
            b1,b2=h[0],h[1]
            fin=bool(b1&0x80)
            opcode=b1&0x0f
            masked=bool(b2&0x80)
            n=b2&0x7f
            if n==126:
                n=struct.unpack("!H",self._recv_exact(2))[0]
            elif n==127:
                n=struct.unpack("!Q",self._recv_exact(8))[0]
            mask=self._recv_exact(4) if masked else None
            payload=self._recv_exact(n) if n else b""
            if mask:
                payload=bytes(b ^ mask[i%4] for i,b in enumerate(payload))
            if opcode==0x8:
                raise RuntimeError("websocket close frame")
            if opcode==0x9:
                self._send_control(0xA,payload)
                continue
            if opcode==0xA:
                continue
            if opcode in (0x1,0x2):
                opcode0=opcode
                fragments=[payload]
            elif opcode==0x0:
                fragments.append(payload)
            else:
                continue
            if fin:
                data=b"".join(fragments)
                if opcode0==0x1:
                    return data.decode("utf8")
                return data.decode("utf8","replace")

    def _send_control(self,opcode,payload=b""):
        mask=os.urandom(4)
        frame=bytearray([0x80|opcode,0x80|len(payload)])
        frame.extend(mask)
        frame.extend(bytes(b ^ mask[i%4] for i,b in enumerate(payload)))
        self.sock.sendall(frame)

    def close(self):
        try:
            self._send_control(0x8,b"")
        except Exception:
            pass
        try:
            self.sock.close()
        except Exception:
            pass

def cdp(ws, method, params=None, counter=[0]):
    counter[0]+=1
    msg={"id":counter[0],"method":method}
    if params is not None:
        msg["params"]=params
    ws.send_text(json.dumps(msg))
    deadline=time.time()+12
    while time.time()<deadline:
        data=json.loads(ws.recv_text())
        if data.get("id")==counter[0]:
            if "error" in data:
                raise RuntimeError(str(data["error"]))
            return data.get("result",{})
    raise RuntimeError("CDP response timeout: "+method)


cohort = [
 {"cohortPosition":1,"canonicalPropertyId":"CPROP-180EEB612A4D37606E8E","sourcePropertyId":"BASE-B493146CC958A489","address":"875 - 935 W 8th St"},
 {"cohortPosition":2,"canonicalPropertyId":"CPROP-1CD86C211D87DF59EA8B","sourcePropertyId":"BASE-D0DAEEC1169DB8AE","address":"28381 Vincent Moraga Dr"},
 {"cohortPosition":3,"canonicalPropertyId":"CPROP-E6D149A779AB8FF87903","sourcePropertyId":"BASE-21763A41D1B7F2EA","address":"28470 Witherspoon Pkwy"},
 {"cohortPosition":4,"canonicalPropertyId":"CPROP-FC9F27B977691FD4E43C","sourcePropertyId":"BASE-5499DCB1F8D084A1","address":"NE of Adelanto Rd and Innovation Way"},
 {"cohortPosition":5,"canonicalPropertyId":"CPROP-1D472AF481E398F4110B","sourcePropertyId":"BASE-ED16E98D4F63EA53","address":"NE of Little Morongo Rd and Dillon Rd"}
]

profile=tempfile.mkdtemp(prefix="sciip-bk3-chrome-")
stderr_path=evidence/"m4-19d4bk3-chrome-stderr.log"
result_path=evidence/"m4-19d4bk3-interactive-search-result.json"
shot_dir=evidence/"m4-19d4bk3-screenshots"
shot_dir.mkdir(parents=True,exist_ok=True)
stderr_f=open(stderr_path,"w")
proc=subprocess.Popen([
    chrome,"--headless=new","--disable-gpu","--no-first-run","--no-default-browser-check",
    "--disable-background-networking","--remote-allow-origins=*",
    f"--remote-debugging-port={port}",f"--user-data-dir={profile}",
    "--window-size=1600,1000",server_url
],stdout=subprocess.DEVNULL,stderr=stderr_f)

ws=None
try:
    print("[BK3] Chrome launched; acquiring Explorer runtime",flush=True)
    targets=None
    for _ in range(50):
        try:
            targets=get_json(f"http://127.0.0.1:{port}/json")
            if targets: break
        except Exception: time.sleep(.2)
    if not targets: raise RuntimeError("Chrome DevTools target unavailable")
    page=next((t for t in targets if t.get("type")=="page"),targets[0])
    ws=SimpleWebSocket(page["webSocketDebuggerUrl"],timeout=12)
    cdp(ws,"Page.enable"); cdp(ws,"Runtime.enable"); time.sleep(2)

    def eval_js(expr):
        r=cdp(ws,"Runtime.evaluate",{"expression":expr,"returnByValue":True,"awaitPromise":True})
        return r.get("result",{}).get("value")

    nav=eval_js("""(() => {
      const els=[...document.querySelectorAll('a,button,[role="button"]')]
        .filter(x=>(x.innerText||x.textContent||"").trim()==="Explorer");
      if(els.length!==1)return {clicked:false,count:els.length};
      els[0].click(); return {clicked:true,count:1};
    })()""")
    if not nav or not nav.get("clicked"): raise RuntimeError("unique Explorer navigation control not activated")
    time.sleep(2)

    exact=eval_js("""(() => [...document.querySelectorAll('input')].filter(
      x=>x.type==="search" && x.placeholder==="Search SCIIP…" && x.getAttribute("aria-label")==="Search SCIIP"
    ).length)()""")
    if exact != 1: raise RuntimeError(f"exact Search SCIIP control count={exact}")

    results=[]
    for item in cohort:
        q=item["address"]
        payload=json.dumps(q)
        print(f"[BK3] searching {item['cohortPosition']}/5: {q}",flush=True)
        typed=eval_js(f"""(() => {{
          const x=[...document.querySelectorAll('input')].find(
            x=>x.type==="search" && x.placeholder==="Search SCIIP…" && x.getAttribute("aria-label")==="Search SCIIP"
          );
          if(!x)return {{ok:false}};
          const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;
          setter.call(x,{payload});
          x.dispatchEvent(new Event('input',{{bubbles:true}}));
          x.dispatchEvent(new Event('change',{{bubbles:true}}));
          x.focus();
          return {{ok:true,value:x.value}};
        }})()""")
        time.sleep(1.25)

        inspect=eval_js(f"""(() => {{
          const body=document.body?document.body.innerText:"";
          const q={payload};
          const candidates=[...document.querySelectorAll('button,a,[role="option"],[role="button"],li,div')]
            .filter(el=>{{
              const t=(el.innerText||el.textContent||"").trim();
              return t && (t.includes(q) || t.includes(q.replace(" - ","–")));
            }})
            .map((el,i)=>({{i,tag:el.tagName,role:el.getAttribute("role"),text:(el.innerText||el.textContent||"").trim().slice(0,1000)}}))
            .slice(0,20);
          return {{bodyHasAddress:body.includes(q)||body.includes(q.replace(" - ","–")),candidates}};
        }})()""")

        clickres=eval_js(f"""(() => {{
          const q={payload};
          const els=[...document.querySelectorAll('button,a,[role="option"],li')]
            .filter(el=>{{
              const t=(el.innerText||el.textContent||"").trim();
              return t.includes(q)||t.includes(q.replace(" - ","–"));
            }});
          if(!els.length)return {{clicked:false,count:0}};
          els[0].click();
          return {{clicked:true,count:els.length,tag:els[0].tagName,text:(els[0].innerText||els[0].textContent||"").trim().slice(0,1000)}};
        }})()""")
        time.sleep(1.25)

        post=eval_js(f"""(() => {{
          const body=document.body?document.body.innerText:"";
          const addr={payload};
          return {{
            addressVisible:body.includes(addr)||body.includes(addr.replace(" - ","–")),
            canonicalVisible:body.includes({json.dumps(item["canonicalPropertyId"])}),
            sourceVisible:body.includes({json.dumps(item["sourcePropertyId"])}),
            bodyExcerpt:body.slice(0,12000)
          }};
        }})()""")

        shot=cdp(ws,"Page.captureScreenshot",{"format":"png"}).get("data")
        sp=shot_dir/f"{item['cohortPosition']}.png"
        if shot: sp.write_bytes(base64.b64decode(shot))
        results.append({**item,"typed":typed,"preSelection":inspect,"selection":clickres,"postSelection":post,"screenshot":str(sp)})

        # Clear before next query.
        eval_js("""(() => {
          const x=[...document.querySelectorAll('input')].find(x=>x.type==="search"&&x.getAttribute("aria-label")==="Search SCIIP");
          if(x){const s=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;s.call(x,"");x.dispatchEvent(new Event('input',{bubbles:true}));}
          return true;
        })()""")
        time.sleep(.4)

    result={"navigation":nav,"exactSearchControlCount":exact,"cohort":results}
    result_path.write_text(json.dumps(result,indent=2)+"\n")
    print(json.dumps(result))
finally:
    if ws: ws.close()
    try:
        proc.terminate(); proc.wait(timeout=3)
    except Exception:
        try: proc.kill()
        except Exception: pass
    stderr_f.close()
    shutil.rmtree(profile,ignore_errors=True)
