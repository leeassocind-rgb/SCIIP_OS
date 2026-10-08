#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,re

PORT=9333;APP="http://127.0.0.1:5173/"
def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None
def newpage():
    req=urllib.request.Request(f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",method="PUT")
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None
class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u);h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5);k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();m=os.urandom(4);n=len(p);h=bytearray([129])
        if n<126:h.append(128|n)
        elif n<65536:h.extend([254]);h.extend(struct.pack("!H",n))
        else:h.extend([255]);h.extend(struct.pack("!Q",n))
        self.s.sendall(bytes(h)+m+bytes(x^m[i%4] for i,x in enumerate(p)))
    def recv(self):
        h=self.s.recv(2)
        if len(h)<2:return None
        a,b=h;n=b&127
        if n==126:n=struct.unpack("!H",self.s.recv(2))[0]
        elif n==127:n=struct.unpack("!Q",self.s.recv(8))[0]
        mask=self.s.recv(4) if b&128 else None;d=b""
        while len(d)<n:d+=self.s.recv(n-len(d))
        if mask:d=bytes(x^mask[i%4] for i,x in enumerate(d))
        try:return json.loads(d.decode()) if a&15==1 else None
        except:return None
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x
def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")
def settle_exact(w,text,seconds=2.0,samples=3):
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=samples:return True
        time.sleep(.1)
    return False
def click_exact(w,text):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)});if(x.length!==1)return false;x[0].click();return true}})()""") is True
def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    print("="*120);print("SCIIP Explorer 4.0 — R26D-R2-R2-R2-R1 Alondra Single-Record Non-Export Native Recertification");print("="*120)
    print("Export invocation: OFF")
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: certified CDP browser context required");return 4
    p=newpage()
    if not p or not p.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED");print("REASON: fresh page failed");return 5
    w=W(p["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    explorer=settle_exact(w,"Explorer");entered=click_exact(w,"Explorer") if explorer else False
    st=time.time();con=0;surf={}
    while entered and time.time()-st<=5:
        surf=ev(w,r"""(()=>{const rows=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled);
const addr=rows.filter(b=>b.outerHTML.toLowerCase().includes('112 w alondra blvd')||(b.innerText||b.textContent||'').toLowerCase().includes('112 w alondra blvd'));
const building=addr.filter(b=>/181[, ]?831\s*SF/i.test(b.outerHTML));const aggregate=addr.filter(b=>/422[, ]?277\s*SF/i.test(b.outerHTML));
return {addressCount:addr.length,buildingCount:building.length,aggregateCount:aggregate.length};})()""") or {}
        ok=surf.get("buildingCount")==1 and surf.get("aggregateCount")==1;con=con+1 if ok else 0
        if con>=3:break
        time.sleep(.12)
    binding=con>=3
    click=ev(w,r"""(()=>{const rows=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled);
const addr=rows.filter(b=>b.outerHTML.toLowerCase().includes('112 w alondra blvd')||(b.innerText||b.textContent||'').toLowerCase().includes('112 w alondra blvd'));
const building=addr.filter(b=>/181[, ]?831\s*SF/i.test(b.outerHTML));const aggregate=addr.filter(b=>/422[, ]?277\s*SF/i.test(b.outerHTML));
if(building.length!==1||aggregate.length!==1)return false;building[0].click();return true;})()""") is True if binding else False
    st=time.time();con=0;sread={}
    while click and time.time()-st<=2:
        sread=ev(w,r"""(()=>{const x=[...document.querySelectorAll('button.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);
let ws=null;try{ws=JSON.parse(localStorage.getItem('sciip.explorer3.workspace.v1')||'null')}catch{}
const building=x.filter(b=>/181[, ]?831\s*SF/i.test(b.outerHTML)&&!/422[, ]?277\s*SF/i.test(b.outerHTML));
return {selectedCount:x.length,buildingCount:building.length,selectedPropertyId:ws?.selectedPropertyId||null};})()""") or {}
        ok=sread.get("selectedCount")==1 and sread.get("buildingCount")==1 and bool(sread.get("selectedPropertyId"));con=con+1 if ok else 0
        if con>=3:break
        time.sleep(.1)
    selected=con>=3
    ass=settle_exact(w,"Assignments") if selected else False;assclick=click_exact(w,"Assignments") if ass else False
    gen=settle_exact(w,"Generate Client Listing Report") if assclick else False;genclick=click_exact(w,"Generate Client Listing Report") if gen else False
    st=time.time();con=0;review={}
    while genclick and time.time()-st<=4:
        review=ev(w,r"""(()=>{const txt=document.body?.innerText||'';const d=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{review:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),downloadCount:d.length,enabled:d.length===1&&!d[0].disabled}})()""") or {}
        ok=review.get("review") and review.get("downloadCount")==1 and review.get("enabled");con=con+1 if ok else 0
        if con>=3:break
        time.sleep(.1)
    review_ok=con>=3
    handler=ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return{count:x.length,name:null,enabled:false};const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));const f=k&&x[0][k]&&x[0][k].onClick;return{count:1,name:typeof f==='function'?(f.name||'anonymous'):null,enabled:!x[0].disabled}})()""") or {}
    live=handler.get("count")==1 and handler.get("enabled") is True and handler.get("name")=="exportReport"
    passed=all([explorer,entered,binding,click,selected,assclick,genclick,review_ok,live])
    out={"framework":"SCIIP_EXPLORER_4_R26D_R2_R2_R2_R1_ALONDRA_SINGLE_RECORD_NON_EXPORT_NATIVE_RECERTIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
         "target":"112 W Alondra Blvd","canonicalKey":"112 W Alondra Blvd|181831","projectAggregateSf":422277,
         "explorerSettleCertified":explorer,"explorerEntryCertified":entered,"buildingProjectSurfaceCertified":binding,
         "building1Clicked":click,"selectedBuildingReadbackCertified":selected,"selectedPropertyId":sread.get("selectedPropertyId"),
         "assignmentsEntryCertified":assclick,"reportReviewEntryCertified":review_ok,"exportControlCertified":live,
         "liveHandlerCertified":handler.get("name")=="exportReport","exportInvocation":False,
         "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R26D_R2_R3_RESUME_ALONDRA_AND_REMAINING_NINETEEN_NATIVE_GUARDED_EXPORT_EXECUTION" if passed else "M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_R1_R1_ALONDRA_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"}
    od=repo/"apps/property-command-center/evidence/explorer4/M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_R1_ALONDRA_SINGLE_RECORD_NON_EXPORT_NATIVE_RECERTIFICATION";od.mkdir(parents=True,exist_ok=True)
    ef=od/"alondra_single_record_non_export_native_recertification.json";ef.write_text(json.dumps(out,indent=2)+"\n")
    print("BUILDING_PROJECT_SURFACE_CERTIFIED:",binding);print("BUILDING_1_CLICKED:",click);print("SELECTED_BUILDING_READBACK_CERTIFIED:",selected)
    print("ASSIGNMENTS_ENTRY_CERTIFIED:",assclick);print("REPORT_REVIEW_ENTRY_CERTIFIED:",review_ok);print("LIVE_HANDLER_CERTIFIED:",handler.get("name")=="exportReport")
    print("EXPORT_INVOCATION: OFF");print("STATUS:",out["status"]);print("NEXT_MILESTONE:",out["nextMilestone"]);print("EVIDENCE:",ef)
    return 0 if passed else 10
if __name__=="__main__": raise SystemExit(main())
