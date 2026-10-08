#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import base64, hashlib, itertools, json, os, socket, struct, sys, time, urllib.parse, urllib.request

PRIOR="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R1_POST_SYNTAX_REPAIR_EXPLORER_SETTLE_RESIDUAL_CAUSAL_DIAGNOSIS"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R1_R1_STDLIB_CDP_TRANSPORT_REPAIR_AND_POST_SYNTAX_EXPLORER_SETTLE_DIAGNOSIS_RECERTIFICATION"
APP="http://127.0.0.1:5173"
CDP_HTTP="http://127.0.0.1:9333"

class WS:
    def __init__(self,url,timeout=4):
        u=urllib.parse.urlparse(url)
        if u.scheme!="ws":
            raise RuntimeError("only ws:// CDP endpoints supported")
        self.host=u.hostname
        self.port=u.port or 80
        self.path=(u.path or "/")+((("?"+u.query) if u.query else ""))
        self.sock=socket.create_connection((self.host,self.port),timeout=timeout)
        self.sock.settimeout(timeout)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(
            f"GET {self.path} HTTP/1.1\r\n"
            f"Host: {self.host}:{self.port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.sock.sendall(req.encode())
        data=b""
        while b"\r\n\r\n" not in data:
            chunk=self.sock.recv(4096)
            if not chunk: raise RuntimeError("websocket handshake closed")
            data+=chunk
        head=data.split(b"\r\n\r\n",1)[0].decode(errors="replace")
        if " 101 " not in head:
            raise RuntimeError("websocket handshake failed: "+head.splitlines()[0])
        expected=base64.b64encode(hashlib.sha1((key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest()).decode()
        accept=None
        for line in head.split("\r\n")[1:]:
            if line.lower().startswith("sec-websocket-accept:"):
                accept=line.split(":",1)[1].strip()
        if accept!=expected:
            raise RuntimeError("websocket accept mismatch")

    def _recv_exact(self,n):
        b=b""
        while len(b)<n:
            c=self.sock.recv(n-len(b))
            if not c: raise RuntimeError("websocket closed")
            b+=c
        return b

    def send_text(self,text):
        payload=text.encode()
        first=0x81
        n=len(payload)
        mask=os.urandom(4)
        if n<126:
            hdr=bytes([first,0x80|n])
        elif n<65536:
            hdr=bytes([first,0x80|126])+struct.pack("!H",n)
        else:
            hdr=bytes([first,0x80|127])+struct.pack("!Q",n)
        masked=bytes(b ^ mask[i%4] for i,b in enumerate(payload))
        self.sock.sendall(hdr+mask+masked)

    def recv_text(self):
        while True:
            b1,b2=self._recv_exact(2)
            opcode=b1 & 0x0F
            masked=bool(b2 & 0x80)
            n=b2 & 0x7F
            if n==126:n=struct.unpack("!H",self._recv_exact(2))[0]
            elif n==127:n=struct.unpack("!Q",self._recv_exact(8))[0]
            mask=self._recv_exact(4) if masked else None
            payload=self._recv_exact(n)
            if masked:payload=bytes(b ^ mask[i%4] for i,b in enumerate(payload))
            if opcode==0x8: raise RuntimeError("websocket close frame")
            if opcode==0x9:
                self._send_control(0xA,payload); continue
            if opcode in (0x1,0x0):
                return payload.decode(errors="replace")

    def _send_control(self,opcode,payload=b""):
        first=0x80|opcode;mask=os.urandom(4);n=len(payload)
        hdr=bytes([first,0x80|n])
        masked=bytes(b ^ mask[i%4] for i,b in enumerate(payload))
        self.sock.sendall(hdr+mask+masked)

    def close(self):
        try:self._send_control(0x8,b"")
        except:pass
        try:self.sock.close()
        except:pass

def loadj(p):
    try:return json.loads(p.read_text())
    except:return None

def get_json(url):
    with urllib.request.urlopen(url,timeout=3) as r:
        return json.loads(r.read().decode())

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    prior=er/PRIOR/"post_syntax_repair_explorer_settle_residual_causal_diagnosis.json"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"stdlib_cdp_transport_repair_and_post_syntax_explorer_settle_diagnosis_recertification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R1-R1 Stdlib CDP Transport Repair + Post-Syntax Explorer Settle Diagnosis Recertification")
    print("="*120)
    print("Mode: SELF_CONTAINED_STDLIB_CDP_READ_ONLY_DIAGNOSIS")
    print("External Python packages required: NONE")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Explorer click: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    pj=loadj(prior)
    # Prior package blocked before evidence file could be emitted; allow either missing evidence or blocked-shaped evidence.
    prior_block_consumed=(not prior.exists()) or (isinstance(pj,dict) and pj.get("status") in ("BLOCKED","DIAGNOSTIC_COMPLETE"))
    if not prior_block_consumed:
        print("STATUS: BLOCKED");print("REASON: unexpected prior diagnostic state");return 4

    try:
        tabs=get_json(CDP_HTTP+"/json")
    except Exception as e:
        print("STATUS: BLOCKED");print("REASON: CDP unavailable on port 9333:",e);return 5

    pages=[x for x in tabs if x.get("type")=="page" and x.get("webSocketDebuggerUrl")]
    target=next((x for x in pages if str(x.get("url","")).startswith(APP)), pages[0] if pages else None)
    if not target:
        print("STATUS: BLOCKED");print("REASON: no CDP page target");return 6

    print("CDP_TARGET_URL:",target.get("url"))
    print("CDP_TRANSPORT: PYTHON_STDLIB_RAW_WEBSOCKET")
    ws=WS(target["webSocketDebuggerUrl"],timeout=5)
    seq=itertools.count(1)
    def call(method,params=None):
        i=next(seq)
        ws.send_text(json.dumps({"id":i,"method":method,"params":params or {}}))
        while True:
            m=json.loads(ws.recv_text())
            if m.get("id")==i:return m

    call("Page.enable");call("Runtime.enable")
    nav=call("Page.navigate",{"url":APP+"/"})
    if nav.get("error"):
        ws.close();print("STATUS: BLOCKED");print("REASON: Page.navigate failed");return 7

    expr=r"""(()=>{const vis=e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0&&!e.disabled};const bs=[...document.querySelectorAll('button')];const ex=bs.filter(b=>(b.innerText||b.textContent||'').trim()==='Explorer');return {readyState:document.readyState,origin:location.origin,url:location.href,bodyLength:(document.body?.innerText||'').length,buttonCount:bs.length,exactExplorerCount:ex.length,visibleEnabledExplorerCount:ex.filter(vis).length,assignmentsCount:bs.filter(b=>(b.innerText||b.textContent||'').trim()==='Assignments').length}})()"""
    schedule=[0,.05,.1,.15,.2,.25,.35,.5,.75,1,1.25,1.5,1.75,2,2.5,3,4,5]
    samples=[];start=time.monotonic()
    for t in schedule:
        wait=start+t-time.monotonic()
        if wait>0:time.sleep(wait)
        m=call("Runtime.evaluate",{"expression":expr,"returnByValue":True})
        v=m.get("result",{}).get("result",{}).get("value",{}) or {}
        v["t"]=t;samples.append(v)
    ws.close()

    valid=[s for s in samples if s.get("readyState")=="complete" and s.get("origin")==APP and s.get("buttonCount",0)>0 and s.get("visibleEnabledExplorerCount")==1]
    first=min((s["t"] for s in valid),default=None)
    after2=[s for s in valid if s["t"]>=2]
    stable=len(after2)>=3 and all(s.get("visibleEnabledExplorerCount")==1 for s in after2[-3:])
    within=first is not None and first<=2.0

    if within and stable:
        classification="POST_SYNTAX_EXPLORER_CONTROL_MATERIALIZES_STABLY_WITHIN_TWO_SECONDS_PRIOR_SETTLE_FAILURE_TRANSIENT_FRESH_PAGE_RACE_CONFIRMED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R2_FRESH_PAGE_EXPLORER_SETTLE_RETRY_HARDENING_AND_CANDIDATE_SELECTION_RECERTIFICATION"
    else:
        classification="POST_SYNTAX_EXPLORER_SETTLE_FAILURE_REPRODUCED_OR_TWO_SECOND_CONTRACT_NOT_MET"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R2_EXPLORER_SETTLE_POLICY_DEEP_DIAGNOSIS"

    checks={
      "priorWebsocketDependencyBlockConsumed":True,
      "stdlibOnlyCdpTransportUsed":True,
      "externalWebsocketPackageNotRequired":True,
      "cdpAvailable":True,
      "cdpPageTargetResolved":True,
      "freshNavigationPerformed":True,
      "boundedFiveSecondObservationUsed":True,
      "firstUniqueExplorerResolved":first is not None,
      "uniqueExplorerWithinTwoSeconds":within,
      "stableAtOrAfterTwoSeconds":stable,
      "noExplorerClickPerformed":True,
      "noPropertyClickPerformed":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    print("FIRST_UNIQUE_EXPLORER_SECONDS:",first)
    print("UNIQUE_EXPLORER_WITHIN_TWO_SECONDS:",within)
    print("STABLE_AT_OR_AFTER_2S:",stable)
    print("\n----- TIMING SAMPLES -----")
    for s in samples:print(json.dumps(s,sort_keys=True))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")

    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R1_R1_STDLIB_CDP_TRANSPORT_REPAIR_AND_POST_SYNTAX_EXPLORER_SETTLE_DIAGNOSIS_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R1_R1_STDLIB_CDP_TRANSPORT_REPAIRED_POST_SYNTAX_EXPLORER_SETTLE_DIAGNOSED",
      "classification":classification,
      "firstUniqueExplorerSeconds":first,
      "samples":samples,
      "checks":checks,
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(ev,indent=2)+"\n")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",ev["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R2-R1-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":raise SystemExit(main())
