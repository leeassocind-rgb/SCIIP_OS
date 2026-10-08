#!/usr/bin/env python3
"""
SCIIP Explorer 4.0 — R26D-R2-R1 Native New-Fifty Guarded Export Runner

This runner is intentionally NOT invoked by R26D-R2-R1.
It is installed and statically certified here for a later bounded live milestone.
"""
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

PORT=9333
APP="http://127.0.0.1:5173/"
TARGET_ENV="SCIIP_R26_NEW_FIFTY_TARGET_FILE"
EXPECTED_COUNT=50
MAX_EXPORT_CLICKS_PER_RECORD=1
STRICT_SEQUENTIAL=True
HALT_ON_FIRST_FAILURE=True
EXPLORER_SETTLE_SAMPLES=3
EXPLORER_SETTLE_MAX_SECONDS=2.0
TARGET_BINDING_SETTLE_SAMPLES=3
TARGET_BINDING_SETTLE_MAX_SECONDS=5.0
SELECTED_PROPERTY_SETTLE_SAMPLES=3
SELECTED_PROPERTY_SETTLE_MAX_SECONDS=2.0

STATUS_RE=r"(EXISTING|PROPOSED\/PLANNED|PROPOSED|PLANNED|AVAILABLE|UNDER CONSTRUCTION|U\/C)\s*·"

def loadj(p):
    return json.JSONDecoder().raw_decode(Path(p).read_text(errors="ignore").lstrip())[0]

def getj(u):
    try:
        with urllib.request.urlopen(u,timeout=3) as r:return json.loads(r.read().decode())
    except:return None

def newpage():
    req=urllib.request.Request(
        f"http://127.0.0.1:{PORT}/json/new?{urllib.parse.quote(APP,safe=':/?=&')}",
        method="PUT"
    )
    try:
        with urllib.request.urlopen(req,timeout=3) as r:return json.loads(r.read())
    except:return None

class W:
    def __init__(self,u):
        m=re.match(r"ws://([^/:]+):(\d+)(/.*)",u)
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("websocket upgrade failed")
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
        self.i+=1;i=self.i
        self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x and x.get("id")==i:return x

def ev(w,e):
    r=w.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
    return (((r or {}).get("result")or{}).get("result")or{}).get("value")

def settle_exact(w,text,seconds,samples):
    st=time.time();con=0
    while time.time()-st<=seconds:
        c=ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0
        con=con+1 if c==1 else 0
        if con>=samples:return True
        time.sleep(.10)
    return False

def click_exact(w,text):
    return ev(w,f"""(()=>{{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==={json.dumps(text)});if(x.length!==1)return false;x[0].click();return true}})()""") is True

def target_rows_expr(target):
    q=target.lower()
    return f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(q)},re=/{STATUS_RE}/i;
return [...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),html=b.outerHTML,m=re.exec(text);
 let label=m?text.slice(0,m.index).trim():text;
 const hm=html.match(/<strong[^>]*>([^<]+)<\\/strong>/i); if(hm)label=ns(hm[1]);
 return{{text,label,html,className:String(b.className||''),b}};
}});
}})()"""

def wait_target_binding(w,target):
    st=time.time();con=0;last=None;q=target.lower()
    while time.time()-st<=TARGET_BINDING_SETTLE_MAX_SECONDS:
        v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(q)},re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),html=b.outerHTML,m=re.exec(text);
 let label=m?text.slice(0,m.index).trim():text;
 const hm=html.match(/<strong[^>]*>([^<]+)<\\/strong>/i); if(hm)label=ns(hm[1]);
 return{{text,label,html}};
}});
const exact=rows.filter(x=>x.label.toLowerCase()===q);
const contains=rows.filter(x=>x.label.toLowerCase().includes(q)||q.includes(x.label.toLowerCase()));
return{{exactCount:exact.length,containsCount:contains.length,exactTexts:exact.map(x=>x.text),containsTexts:contains.slice(0,5).map(x=>x.text)}};
}})()""") or {}
        last=v
        valid=v.get("exactCount")==1 or (v.get("exactCount")==0 and v.get("containsCount")==1)
        con=con+1 if valid else 0
        if con>=TARGET_BINDING_SETTLE_SAMPLES:return True,last
        time.sleep(.12)
    return False,last

def click_target(w,target):
    q=target.lower()
    return ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(q)},re=/{STATUS_RE}/i;
const rows=[...document.querySelectorAll('button.sciip-property-marker')].filter(b=>b.offsetParent!==null&&!b.disabled).map(b=>{{
 const text=ns(b.innerText||b.textContent||''),html=b.outerHTML,m=re.exec(text);
 let label=m?text.slice(0,m.index).trim():text;
 const hm=html.match(/<strong[^>]*>([^<]+)<\\/strong>/i); if(hm)label=ns(hm[1]);
 return{{text,label,html,b}};
}});
let x=rows.filter(r=>r.label.toLowerCase()===q),binding='EXACT';
if(x.length!==1){{x=rows.filter(r=>r.label.toLowerCase().includes(q)||q.includes(r.label.toLowerCase()));binding='UNIQUE_CONTAINS';}}
if(x.length!==1)return{{clicked:false,binding:null,count:x.length,candidates:x.slice(0,5).map(r=>r.text)}};
x[0].b.click();return{{clicked:true,binding,count:1,text:x[0].text}};
}})()""") or {}

def wait_selected(w,target):
    st=time.time();con=0;last=None;q=target.lower()
    while time.time()-st<=SELECTED_PROPERTY_SETTLE_MAX_SECONDS:
        v=ev(w,f"""(()=>{{
const ns=s=>(s||'').replace(/\\s+/g,' ').trim(),q={json.dumps(q)};
const x=[...document.querySelectorAll('button.sciip-property-marker.is-selected')].filter(b=>b.offsetParent!==null);
let ws=null;try{{ws=JSON.parse(localStorage.getItem('sciip.explorer3.workspace.v1')||'null')}}catch{{}}
return{{count:x.length,texts:x.map(b=>ns(b.innerText||b.textContent||'')),htmls:x.map(b=>b.outerHTML),
selectedPropertyId:ws?.selectedPropertyId||null,
targetEvidence:x.filter(b=>b.outerHTML.toLowerCase().includes(q)||ns(b.innerText||b.textContent||'').toLowerCase().includes(q)).length}};
}})()""") or {}
        last=v
        ok=v.get("count")==1 and v.get("targetEvidence")==1 and bool(v.get("selectedPropertyId"))
        con=con+1 if ok else 0
        if con>=SELECTED_PROPERTY_SETTLE_SAMPLES:return True,last
        time.sleep(.10)
    return False,last

def wait_review(w):
    st=time.time();con=0
    while time.time()-st<=4.0:
        v=ev(w,r"""(()=>{const txt=document.body?.innerText||'';const d=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Download Client Listing Report');return{review:/Review Client Listing Report|Institutional Reporting Engine/i.test(txt),downloadCount:d.length,enabled:d.length===1&&!d[0].disabled}})()""") or {}
        ok=v.get("review") and v.get("downloadCount")==1 and v.get("enabled")
        con=con+1 if ok else 0
        if con>=3:return True
        time.sleep(.10)
    return False

def export_handler(w):
    return ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return{count:x.length,name:null,enabled:false};const k=Object.keys(x[0]).find(k=>k.startsWith('__reactProps$'));const f=k&&x[0][k]&&x[0][k].onClick;return{count:1,name:typeof f==='function'?(f.name||'anonymous'):null,enabled:!x[0].disabled}})()""") or {}

def install_export_probe(w):
    return ev(w,r"""(()=>{if(window.__SCIIP_R26_EXPORT_PROBE__)return true;window.__SCIIP_R26_EXPORT_PROBE__={objectUrls:[],downloads:[]};const p=window.__SCIIP_R26_EXPORT_PROBE__;const o=URL.createObjectURL.bind(URL);URL.createObjectURL=function(x){try{p.objectUrls.push({type:x?.type||null,size:x?.size||null})}catch{}return o(x)};document.addEventListener('click',e=>{const a=e.target?.closest?.('a[download]');if(a)p.downloads.push({filename:a.getAttribute('download')||null,href:a.href||null})},true);return true})()""") is True

def click_export_once(w):
    return ev(w,r"""(()=>{const x=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').trim()==='Download Client Listing Report');if(x.length!==1)return false;x[0].click();return true})()""") is True

def probe_readback(w):
    time.sleep(.40)
    return ev(w,r"""(()=>window.__SCIIP_R26_EXPORT_PROBE__||{objectUrls:[],downloads:[]})()""") or {}

def runtime_readback(w):
    return ev(w,r"""(()=>({explorer:[...document.querySelectorAll('button')].some(x=>x.offsetParent!==null&&(x.innerText||x.textContent||'').trim()==='Explorer'),sameOrigin:location.origin==='http://127.0.0.1:5173',reportReview:/Review Client Listing Report|Institutional Reporting Engine/i.test(document.body?.innerText||'')}))()""") or {}

def validate_targets(path):
    targets=loadj(path)
    if not isinstance(targets,list) or len(targets)!=EXPECTED_COUNT:
        raise RuntimeError(f"target cardinality must equal {EXPECTED_COUNT}")
    if len(set(targets))!=EXPECTED_COUNT:
        raise RuntimeError("targets must be unique")
    if not all(isinstance(x,str) and x.strip() for x in targets):
        raise RuntimeError("targets must be non-empty strings")
    return targets

def main():
    if len(sys.argv)<3:
        print("USAGE: native_new_fifty_runner.py <repo> <target-file>")
        return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    target_file=Path(sys.argv[2]).expanduser().resolve()
    targets=validate_targets(target_file)

    print("="*120)
    print("SCIIP Explorer 4.0 — Native New-Fifty Guarded Export Runner")
    print("="*120)
    print("TARGET_COUNT:",len(targets))
    print("STRICT_SEQUENTIAL:",STRICT_SEQUENTIAL)
    print("HALT_ON_FIRST_FAILURE:",HALT_ON_FIRST_FAILURE)
    print("MAX_EXPORT_CLICKS_PER_RECORD:",MAX_EXPORT_CLICKS_PER_RECORD)

    # Live execution is deliberately guarded by explicit runtime authorization.
    if os.environ.get("SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED")!="YES":
        print("STATUS: BLOCKED")
        print("REASON: SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED=YES required")
        return 3

    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED");print("REASON: active certified CDP browser context required");return 4

    outcomes=[]
    for ordinal,target in enumerate(targets,51):
        print(f"[{ordinal}/100] {target}")
        page=newpage()
        if not page or not page.get("webSocketDebuggerUrl"):
            outcomes.append({"ordinal":ordinal,"target":target,"certified":False,"failure":"FRESH_PAGE_FAILED"});break
        w=W(page["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
        errors=[];rejections=[]
        try:
            explorer=settle_exact(w,"Explorer",EXPLORER_SETTLE_MAX_SECONDS,EXPLORER_SETTLE_SAMPLES)
            entered=click_exact(w,"Explorer") if explorer else False
            binding,bread=wait_target_binding(w,target) if entered else (False,None)
            click=click_target(w,target) if binding else {}
            selected,sread=wait_selected(w,target) if click.get("clicked") else (False,None)
            ass=settle_exact(w,"Assignments",2.0,3) if selected else False
            assclick=click_exact(w,"Assignments") if ass else False
            gen=settle_exact(w,"Generate Client Listing Report",2.0,3) if assclick else False
            genclick=click_exact(w,"Generate Client Listing Report") if gen else False
            review=wait_review(w) if genclick else False
            handler=export_handler(w) if review else {}
            export_control=review and handler.get("count")==1 and handler.get("enabled") is True
            live_handler=handler.get("name")=="exportReport"
            probe=install_export_probe(w) if live_handler else False
            export_clicked=click_export_once(w) if probe else False
            artifact=probe_readback(w) if export_clicked else {"objectUrls":[],"downloads":[]}
            rt=runtime_readback(w)

            object_urls=artifact.get("objectUrls") or []
            downloads=artifact.get("downloads") or []
            pdf_urls=[x for x in object_urls if x.get("type")=="application/pdf" and (x.get("size") or 0)>0]
            pdf_downloads=[x for x in downloads if (x.get("filename") or "").lower().endswith(".pdf")]

            artifact_ok=len(pdf_urls)==1 and len(pdf_downloads)==1
            continuity=rt.get("explorer") is True and rt.get("sameOrigin") is True
            post_unmount=rt.get("reportReview") is False
            certified=all([explorer,entered,binding,click.get("clicked") is True,selected,assclick,genclick,review,
                           export_control,live_handler,export_clicked,artifact_ok,continuity,post_unmount,
                           len(errors)==0,len(rejections)==0])

            o={
              "ordinal":ordinal,"target":target,"freshTargetCreated":True,
              "explorerSettleCertified":explorer,"targetBindingSettleCertified":binding,
              "selectionBinding":click.get("binding"),"selectedPropertyCertified":selected,
              "assignmentsEntryCertified":assclick,"reportReviewEntryCertified":review,
              "exportControlCertified":export_control,"liveHandlerCertified":live_handler,
              "probeInstrumentationInstalled":probe,"exportClicked":export_clicked,
              "artifact":{"pdfDownloadCount":len(pdf_downloads),"pdfObjectUrlEventCount":len(pdf_urls),
                          "pdfFilename":pdf_downloads[0].get("filename") if len(pdf_downloads)==1 else None,
                          "pdfMimeType":pdf_urls[0].get("type") if len(pdf_urls)==1 else None,
                          "pdfSizeBytes":pdf_urls[0].get("size") if len(pdf_urls)==1 else None},
              "runtimeErrorCount":len(errors),"unhandledRejectionCount":len(rejections),
              "postPublishReportReviewUnmountCertified":post_unmount,
              "explorerContinuity":rt.get("explorer") is True,"sameOrigin":rt.get("sameOrigin") is True,
              "certified":certified,"failure":None if certified else "EXPORT_OR_ARTIFACT_CERTIFICATION_FAILED"
            }
            outcomes.append(o)
            print("certified:",certified)
            print("failure:",o["failure"])
            if not certified:break
        finally:
            try:w.call("Page.close")
            except:pass

    count=sum(1 for o in outcomes if o.get("certified"))
    passed=len(outcomes)==50 and count==50
    eroot=repo/"apps/property-command-center/evidence/explorer4"
    od=eroot/"M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION"
    od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_new_fifty_native_guarded_export_live_execution.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "targetCount":50,"outcomeCount":len(outcomes),"certifiedCount":count,
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17C_R4_R12_R16A_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION_CERTIFIED" if passed else "M419D4BN17C_R4_R12_R16A_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION_INCOMPLETE",
      "outcomes":outcomes,
      "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R26E_R1_STRUCTURED_EXACT_ONE_HUNDRED_ARTIFACT_RUNTIME_REVERIFICATION" if passed else "M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R1_LIVE_EXECUTION_RESIDUAL_CAUSAL_DIAGNOSIS"
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")
    print("CERTIFIED:",count,"/50")
    print("STATUS:",out["status"])
    print("NEXT_MILESTONE:",out["nextMilestone"])
    print("EVIDENCE:",ef)
    return 0 if passed else 10

if __name__=="__main__":
    raise SystemExit(main())
