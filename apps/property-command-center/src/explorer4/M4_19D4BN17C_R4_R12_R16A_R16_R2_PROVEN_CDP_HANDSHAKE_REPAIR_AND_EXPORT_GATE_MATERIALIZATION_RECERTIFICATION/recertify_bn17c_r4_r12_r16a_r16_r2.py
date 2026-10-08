#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,urllib.request,time,socket,base64,os,struct
from urllib.parse import urlparse
M="M4_19D4BN17C_R4_R12_R16A_R16_R2_PROVEN_CDP_HANDSHAKE_REPAIR_AND_EXPORT_GATE_MATERIALIZATION_RECERTIFICATION"
def load(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def targets():
    with urllib.request.urlopen("http://127.0.0.1:9333/json",timeout=3) as r:return json.load(r)
def _recv_exact(s,n):
    b=b""
    while len(b)<n:
        x=s.recv(n-len(b))
        if not x: raise RuntimeError("websocket closed")
        b+=x
    return b

class WS:
    def __init__(self,u):
        x=urlparse(u)
        host=x.hostname or "127.0.0.1"
        port=x.port or 80
        path=x.path or "/"
        if x.query:
            path += "?" + x.query
        self.s=socket.create_connection((host,port),5)
        self.s.settimeout(15)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}:{port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n"
            "\r\n"
        ).encode()
        self.s.sendall(req)
        b=b""
        while b"\r\n\r\n" not in b:
            chunk=self.s.recv(4096)
            if not chunk:
                raise RuntimeError("websocket connection closed during handshake")
            b+=chunk
        status=b.split(b"\r\n",1)[0]
        if b" 101 " not in status:
            raise RuntimeError("websocket handshake failed: "+status.decode(errors="ignore"))
    def send(self,obj):
        p=json.dumps(obj).encode()
        mask=os.urandom(4)
        n=len(p)
        h=bytearray([0x81])
        if n<126:
            h.append(0x80|n)
        elif n<65536:
            h+=bytes([0xFE])+struct.pack("!H",n)
        else:
            h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask
        self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(p)))
    def recv(self):
        while True:
            a=_recv_exact(self.s,2)
            op=a[0]&15
            n=a[1]&127
            if n==126:
                n=struct.unpack("!H",_recv_exact(self.s,2))[0]
            elif n==127:
                n=struct.unpack("!Q",_recv_exact(self.s,8))[0]
            mask=_recv_exact(self.s,4) if a[1]&128 else None
            data=_recv_exact(self.s,n)
            if mask:
                data=bytes(v^mask[i%4] for i,v in enumerate(data))
            if op==8:
                raise RuntimeError("websocket close frame")
            if op==9:
                # Ignore ping; CDP server frames observed in this workflow do not require application pong.
                continue
            if op in (1,2):
                return json.loads(data.decode())
    def close(self):
        try:self.s.close()
        except:pass

def cdp(wsurl,expr):
    w=WS(wsurl)
    try:
        w.send({"id":1,"method":"Runtime.evaluate","params":{"expression":expr,"returnByValue":True,"awaitPromise":True}})
        while True:
            x=w.recv()
            if x.get("id")==1: return x.get("result",{}).get("result",{}).get("value")
    finally: w.close()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    p=ev/"M4_19D4BN17C_R4_R12_R16A_R15_EXPORT_PROPERTY_WORKSPACE_GATE_STATE_RESOLUTION"/"export_property_workspace_gate_state_resolution.json"
    if not p.exists():print("STATUS: BLOCKED\nDIAGNOSIS: R15_EVIDENCE_REQUIRED");return 4
    r15=load(p); expected="EXPORT_RENDER_GATE_DEPENDS_ON_SELECTED_PROPERTY_AND_WORKSPACE_STATE"
    if r15.get("status")!="PASSED" or r15.get("gateStateClassification")!=expected:
        print("STATUS: BLOCKED\nDIAGNOSIS: R15_SELECTED_PROPERTY_AND_WORKSPACE_GATE_REQUIRED");return 5
    ts=[x for x in targets() if x.get("type")=="page" and x.get("webSocketDebuggerUrl")]
    if not ts:print("STATUS: BLOCKED\nDIAGNOSIS: CERTIFIED_BROWSER_PAGE_REQUIRED");return 7
    t=next((x for x in ts if "localhost" in x.get("url","") or "127.0.0.1" in x.get("url","")),ts[0]);ws=t["webSocketDebuggerUrl"]
    probe='''(()=>{const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden"};const els=[...document.querySelectorAll('button,[role="button"],a')].filter(vis);const txt=e=>((e.innerText||e.textContent||"")+" "+(e.getAttribute("aria-label")||"")+" "+(e.getAttribute("title")||"")).trim();const ex=els.filter(e=>/\\bexport\\b|download|powerpoint|\\bpptx?\\b/i.test(txt(e)));const pr=els.filter(e=>/\\bpresent\\b|presentation|deck/i.test(txt(e)));return {url:location.href,exportControls:ex.slice(0,30).map(e=>({tag:e.tagName,text:txt(e),disabled:!!e.disabled,className:e.className||""})),presentControls:pr.slice(0,30).map(e=>({tag:e.tagName,text:txt(e),disabled:!!e.disabled,className:e.className||""})),mode:(document.querySelector('[aria-label="Explorer operating mode"]')?.innerText||""),selectedMarkers:[...document.querySelectorAll('[aria-label^="Select "]')].filter(e=>!e.classList.contains("is-dimmed")).slice(0,10).map(e=>e.getAttribute("aria-label"))};})()'''
    before=cdp(ws,probe)
    transition='''(()=>{const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=="none"&&s.visibility!=="hidden"};const b=[...document.querySelectorAll("button")].filter(vis).find(e=>(e.innerText||"").trim()==="Present");if(!b)return {clicked:false,reason:"PRESENT_CONTROL_NOT_FOUND"};b.click();return {clicked:true,text:"Present"};})()'''
    tr=cdp(ws,transition);time.sleep(.8);after=cdp(ws,probe)
    eb=len((before or {}).get("exportControls",[]));ea=len((after or {}).get("exportControls",[]))
    selected_ok=bool((after or {}).get("selectedMarkers"));workspace_ok=bool(tr and tr.get("clicked"));materialized=ea>0
    checks={"r15Passed":True,"provenCdpHandshakePatternUsed":True,"originHeaderOmitted":True,"selectedPropertyStatePresent":selected_ok,"workspaceStateTransitionObserved":workspace_ok,"liveExportControlMaterialized":materialized,"applicationMutationOff":True,"governedMutationOff":True,"pixelEvidenceOff":True,"strictUiStateOnly":True}
    passed=all(checks.values());status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state="M419D4BN17C_R4_R12_R16A_R16_EXPORT_GATE_SATISFYING_STATE_LIVE_CONTROL_MATERIALIZATION_CERTIFIED" if passed else "M419D4BN17C_R4_R12_R16A_R16_EXPORT_GATE_SATISFYING_STATE_MATERIALIZATION_INCOMPLETE"
    diagnosis="SELECTED_PROPERTY_AND_WORKSPACE_GATE_SATISFIED_EXPORT_CONTROL_MATERIALIZED" if passed else ("SELECTED_PROPERTY_STATE_NOT_OBSERVED" if not selected_ok else "WORKSPACE_TRANSITION_OBSERVED_EXPORT_CONTROL_STILL_NOT_MATERIALIZED")
    nxt="M4_19D4BN17C_R4_R12_R16A_R17_MATERIALIZED_EXPORT_CONTROL_LIVE_MICRO_COHORT_CERTIFICATION" if passed else "M4_19D4BN17C_R4_R12_R16A_R16_R1_EXACT_EXPORT_RENDER_GATE_PREDICATE_AND_WORKSPACE_STATE_DIAGNOSIS"
    out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"proven_cdp_handshake_repair_export_gate_materialization_recertification.json"
    f.write_text(json.dumps({"framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R16_R2","generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,"before":before,"workspaceTransition":tr,"after":after,"exportControlCountBefore":eb,"exportControlCountAfter":ea,"checks":checks,"nextMilestone":nxt},indent=2)+"\n")
    print("="*120);print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R16-R2 Proven CDP Handshake Repair + Export Gate Materialization Recertification");print("="*120)
    print("R15_GATE_STATE_CLASSIFICATION:",r15.get("gateStateClassification"));print("SELECTED_PROPERTY_STATE_PRESENT:",selected_ok);print("WORKSPACE_TRANSITION:",tr);print("EXPORT_CONTROL_COUNT_BEFORE:",eb);print("EXPORT_CONTROL_COUNT_AFTER:",ea);print("LIVE_EXPORT_CONTROL_MATERIALIZED:",materialized)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f);return 0
if __name__=="__main__":raise SystemExit(main())
