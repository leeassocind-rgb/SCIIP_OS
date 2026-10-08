#!/usr/bin/env python3
from __future__ import annotations
import sys, json, time, urllib.request, urllib.parse, socket, base64, os
from pathlib import Path
from datetime import datetime, timezone

M="M4_19D4BN2_R7E_R4_R5_LIVE_GLOBAL_SEARCH_OUTCOME_RECONCILIATION"
QUERIES=[
"2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd",
"NE of Citrus Ave and Santa Ana Ave","120 S Cedar Ave","1350 S Woodruff Way",
"1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St","927 E 9th St",
"13900 Carmenita Rd"]

class WS:
    def __init__(self,url,timeout=15):
        u=urllib.parse.urlparse(url)
        self.host=u.hostname; self.port=u.port or 80; self.path=u.path or "/"
        self.sock=socket.create_connection((self.host,self.port),timeout=timeout)
        self.sock.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {self.path} HTTP/1.1\r\nHost: {self.host}:{self.port}\r\nUpgrade: websocket\r\n"
             f"Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n")
        self.sock.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            data+=self.sock.recv(4096)
        if b" 101 " not in data.split(b"\r\n",1)[0]: raise RuntimeError("websocket upgrade failed")
        self.n=0
    def _readn(self,n):
        out=b""
        while len(out)<n:
            b=self.sock.recv(n-len(out))
            if not b: raise RuntimeError("socket closed")
            out+=b
        return out
    def send_text(self,s):
        b=s.encode(); mask=os.urandom(4); n=len(b); head=bytearray([0x81])
        if n<126: head.append(0x80|n)
        elif n<65536: head+=bytes([0x80|126])+n.to_bytes(2,"big")
        else: head+=bytes([0x80|127])+n.to_bytes(8,"big")
        head+=mask; payload=bytes(x^mask[i%4] for i,x in enumerate(b)); self.sock.sendall(head+payload)
    def recv_text(self):
        while True:
            h=self._readn(2); op=h[0]&0x0f; n=h[1]&0x7f
            if n==126: n=int.from_bytes(self._readn(2),"big")
            elif n==127: n=int.from_bytes(self._readn(8),"big")
            masked=h[1]&0x80; mask=self._readn(4) if masked else None; p=self._readn(n)
            if masked: p=bytes(x^mask[i%4] for i,x in enumerate(p))
            if op==8: raise RuntimeError("websocket closed")
            if op==9: self.sock.sendall(bytes([0x8A,len(p)])+p); continue
            if op in (1,2): return p.decode(errors="replace")
    def call(self,method,params=None):
        self.n+=1; ident=self.n
        self.send_text(json.dumps({"id":ident,"method":method,"params":params or {}}))
        while True:
            msg=json.loads(self.recv_text())
            if msg.get("id")==ident:
                if "error" in msg: raise RuntimeError(str(msg["error"]))
                return msg.get("result",{})

def get_json(url):
    with urllib.request.urlopen(url,timeout=3) as r: return json.load(r)

def js(ws,expr):
    r=ws.call("Runtime.evaluate",{"expression":expr,"returnByValue":True})
    return (r.get("result") or {}).get("value")

def pick_target(port):
    targets=get_json(f"http://127.0.0.1:{port}/json")
    found=[]
    for t in targets:
        if t.get("type")!="page": continue
        url=t.get("url","")
        if not (url.startswith("http://localhost") or url.startswith("http://127.0.0.1")): continue
        ws=WS(t["webSocketDebuggerUrl"],8)
        try:
            shell=js(ws,"!!document.querySelector('.broker-shell, .sciip-ds-root, .explorer3')")
            search=js(ws,'!!document.querySelector(\'input[aria-label="Search SCIIP"]\')')
            found.append((bool(shell),bool(search),url,t,ws))
        except Exception:
            try: ws.sock.close()
            except Exception: pass
    if not found: return None
    found.sort(key=lambda x:(x[0],x[1]),reverse=True)
    return found[0]

def snap(ws,q):
    expr="""(()=>{const input=document.querySelector('input[aria-label=\"Search SCIIP\"]');const feedback=[...document.querySelectorAll('.explorer3__global-search-feedback')].map(x=>x.innerText.trim());const body=document.body?.innerText||'';return {url:location.href,inputValue:input?.value??null,sessionQuery:sessionStorage.getItem('sciip.globalSearchQuery'),explorer:!!document.querySelector('.explorer3'),feedback,selected:[...document.querySelectorAll('[class*=selected],[aria-selected=\"true\"],[data-selected=\"true\"]')].map(x=>x.innerText||x.getAttribute('aria-label')||'').filter(Boolean).slice(0,20),bodyHasQuery:body.toLowerCase().includes(%s.toLowerCase()),bodyExcerpt:body.slice(0,7000)};})()""" % json.dumps(q)
    return js(ws,expr)

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"/M; ev.mkdir(parents=True,exist_ok=True)
    print("============================================================")
    print("SCIIP Explorer 4.0 — R4-R5 Live Global Search Outcome")
    print("============================================================")
    print("Mode: LIVE_DIAGNOSTIC_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Pixel evidence: OFF")
    chosen=None; chosen_port=None
    for p in [9222,9223,9333,9515]:
        try:
            x=pick_target(p)
            if x: chosen=x; chosen_port=p; break
        except Exception: pass
    if not chosen:
        result={"status":"BLOCKED","diagnosis":"BLOCKED_BROWSER_TARGET_UNAVAILABLE"}; (ev/"live_global_search_outcome.json").write_text(json.dumps(result,indent=2)+"\n")
        print("STATUS: BLOCKED"); print("DIAGNOSIS: BLOCKED_BROWSER_TARGET_UNAVAILABLE"); return 4
    shell,search,url,target,ws=chosen
    print("CDP port:",chosen_port); print("Target URL:",url); print("SCIIP shell:",shell); print("Search control:",search)
    if not shell:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: BLOCKED_NON_SCIIP_BROWSER_TARGET"); return 5
    records=[]
    for i,q in enumerate(QUERIES,1):
        print(f"\n[{i}/10] {q}")
        js(ws,"(()=>{const home=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='Home');if(home)home.click();sessionStorage.removeItem('sciip.globalSearchQuery');return true;})()")
        time.sleep(.3)
        qj=json.dumps(q)
        inject=js(ws,"(()=>{const el=document.querySelector('input[aria-label=\"Search SCIIP\"]');if(!el)return {ok:false};const setter=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;el.focus();setter.call(el,%s);el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:%s}));el.dispatchEvent(new Event('change',{bubbles:true}));return {ok:true,value:el.value};})()"%(qj,qj))
        time.sleep(.25)
        value_after=js(ws,'document.querySelector(\'input[aria-label="Search SCIIP"]\')?.value'); react_value_match=(value_after==q)
        js(ws,"(()=>{const el=document.querySelector('input[aria-label=\"Search SCIIP\"]');if(!el)return false;el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true,cancelable:true}));return true;})()")
        time.sleep(1.2)
        s=snap(ws,q); feedback=" ".join(s.get("feedback") or []).lower(); body=(s.get("bodyExcerpt") or "").lower()
        if not react_value_match: outcome="REACT_SEARCH_STATE_NOT_PROVEN"
        elif not s.get("explorer") and s.get("sessionQuery") is None: outcome="ENTER_HANDLER_OR_NAV_NOT_REACHED"
        elif not s.get("explorer"): outcome="EXPLORER_NOT_MOUNTED"
        elif "property not found" in feedback: outcome="NO_MATCH_RENDERED"
        elif "multiple governed properties match" in feedback: outcome="AMBIGUOUS_RENDERED"
        elif s.get("sessionQuery") is None and (q.lower() in body or s.get("selected")): outcome="MATCH_AUTO_SELECTED_OR_POST_VISIBLE"
        elif s.get("sessionQuery") is not None: outcome="SEARCH_HANDLER_NOT_EXECUTED_OR_PENDING"
        else: outcome="UNRESOLVED"
        records.append({"query":q,"inject":inject,"controlledValue":value_after,"reactValueMatch":react_value_match,"snapshot":{k:v for k,v in s.items() if k!="bodyExcerpt"},"outcome":outcome})
        print("controlledValueMatch:",react_value_match); print("explorerMounted:",s.get("explorer")); print("sessionQuery:",s.get("sessionQuery")); print("feedback:",s.get("feedback")); print("selectedSignals:",len(s.get("selected") or [])); print("bodyHasQuery:",s.get("bodyHasQuery")); print("OUTCOME:",outcome)
    counts={}
    for r in records: counts[r["outcome"]]=counts.get(r["outcome"],0)+1
    acceptable={"MATCH_AUTO_SELECTED_OR_POST_VISIBLE","AMBIGUOUS_RENDERED","NO_MATCH_RENDERED"}; passed=all(r["outcome"] in acceptable for r in records)
    diagnosis="EXACT_TEN_GLOBAL_SEARCH_OUTCOMES_OBSERVED" if passed else "EXACT_TEN_GLOBAL_SEARCH_RUNTIME_GAP_REMAINS"
    result={"framework":"SCIIP_EXPLORER_4_R4_R5_LIVE_GLOBAL_SEARCH_OUTCOME_RECONCILIATION","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE","diagnosis":diagnosis,"authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":"LOCAL_BROWSER_ONLY","pixelEvidence":False},"target":{"url":url,"cdpPort":chosen_port},"counts":counts,"records":records}
    (ev/"live_global_search_outcome.json").write_text(json.dumps(result,indent=2)+"\n")
    print("\nCOUNTS:",json.dumps(counts,sort_keys=True)); print("STATUS:",result["status"]); print("DIAGNOSIS:",diagnosis); print("EVIDENCE:",ev/"live_global_search_outcome.json")
    return 0
if __name__=="__main__": raise SystemExit(main())
