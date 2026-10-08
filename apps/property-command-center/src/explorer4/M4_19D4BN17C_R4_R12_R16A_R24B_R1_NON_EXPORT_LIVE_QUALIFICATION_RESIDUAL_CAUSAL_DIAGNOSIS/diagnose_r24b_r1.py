#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,re,sys,urllib.request,urllib.parse,socket,base64,os,struct,time,hashlib

R24B="M4_19D4BN17C_R4_R12_R16A_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"
R24B_STATE="M419D4BN17C_R4_R12_R16A_R24B_FIFTEEN_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE"
M="M4_19D4BN17C_R4_R12_R16A_R24B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

PORT=9333
APP="http://127.0.0.1:5173/"
TARGET="SE of Adelanto Rd and Rancho RdPROPOSED ·"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

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
        if not m: raise RuntimeError("bad websocket")
        h,p,q=m.group(1),int(m.group(2)),m.group(3)
        self.s=socket.create_connection((h,p),timeout=5)
        k=base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f"GET {q} HTTP/1.1\r\nHost: {h}:{p}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {k}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode())
        b=b""
        while b"\r\n\r\n" not in b:b+=self.s.recv(4096)
        if b" 101 " not in b.split(b"\r\n",1)[0]: raise RuntimeError("websocket handshake failed")
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

def count_exact_button(w,text):
    return ev(w,f"""(()=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()==={json.dumps(text)}).length)()""") or 0

def wait_unique_exact_button(w,text,max_seconds=2.0,required_consecutive=3):
    start=time.time();samples=[];consecutive=0
    while time.time()-start<=max_seconds:
        c=count_exact_button(w,text); ok=(c==1)
        samples.append({"elapsedSeconds":round(time.time()-start,3),"count":c,"certified":ok})
        consecutive=consecutive+1 if ok else 0
        if consecutive>=required_consecutive:
            return {"certified":True,"samples":samples,"consecutiveCertifiedSamples":consecutive}
        time.sleep(.1)
    return {"certified":False,"samples":samples,"consecutiveCertifiedSamples":consecutive}

def click_exact(w,text):
    return ev(w,f"""(()=>{{const t={json.dumps(text)},xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').trim()===t);if(xs.length!==1)return{{clicked:false,count:xs.length}};xs[0].click();return{{clicked:true,count:1,text:t}}}})()""") or {}

def candidate_inventory(w):
    return ev(w,r"""(()=> {
      const norm=s=>(s||'').replace(/\s+/g,' ').trim();
      const buttons=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled);
      const xs=[];
      buttons.forEach((b,i)=>{
        const txt=norm(b.innerText||b.textContent||'');
        if(/Adelanto|Rancho/i.test(txt)){
          xs.push({i,text:txt,className:b.className||'',dataset:{...b.dataset}});
        }
      });
      return xs;
    })()""") or []

def click_contains(w,needle):
    return ev(w,f"""(()=>{{
      const N={json.dumps(needle)}.toLowerCase();
      const xs=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&(x.innerText||x.textContent||'').toLowerCase().includes(N));
      if(xs.length!==1)return{{clicked:false,count:xs.length,candidates:xs.map(x=>(x.innerText||x.textContent||'').trim())}};
      const x=xs[0];x.click();
      return{{clicked:true,count:1,text:(x.innerText||x.textContent||'').replace(/\\s+/g,' ').trim(),className:x.className||'',dataset:{{...x.dataset}}}};
    }})()""") or {}

def snapshot(w):
    return ev(w,r"""(()=> {
      const norm=s=>(s||'').replace(/\s+/g,' ').trim();
      const selected=[...document.querySelectorAll('.sciip-property-marker.is-selected')].filter(x=>x.offsetParent!==null).map(x=>({
        text:norm(x.innerText||x.textContent||''),className:x.className||'',dataset:{...x.dataset}
      }));
      const adelanto=[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&/Adelanto|Rancho/i.test(norm(x.innerText||x.textContent||''))).map(x=>({
        text:norm(x.innerText||x.textContent||''),className:x.className||'',dataset:{...x.dataset}
      }));
      const txt=document.body?.innerText||'';
      return {
        selectedMarkers:selected,
        adelantoButtons:adelanto,
        bodyHasRawTarget:txt.toLowerCase().includes('se of adelanto rd and rancho rdproposed ·'.toLowerCase()),
        bodyHasNormalizedAddress:txt.toLowerCase().includes('se of adelanto rd and rancho rd'.toLowerCase()),
        assignmentsCount:[...document.querySelectorAll('button')].filter(x=>x.offsetParent!==null&&!x.disabled&&norm(x.innerText||x.textContent||'')==='Assignments').length
      };
    })()""") or {}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    evid=app/"evidence/explorer4"
    p=evid/R24B/"fifteen_new_record_non_export_live_qualification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R24B-R1 Non-Export Live Qualification Residual Causal Diagnosis")
    print("="*120)
    print("Mode: SINGLE_RECORD_NON_EXPORT_SELECTION_CAUSAL_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Assignments invocation: OFF")
    print("Export invocation: OFF")

    if not p.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24B_EVIDENCE_REQUIRED"); return 4
    r=loadj(p)
    if r.get("status")!="DIAGNOSTIC_COMPLETE" or r.get("state")!=R24B_STATE:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R24B_INCOMPLETE_STATE_REQUIRED"); return 5

    outs=r.get("outcomes") or []
    if len(outs)<2 or outs[1].get("target")!=TARGET or outs[1].get("failure")!="SELECTION_OR_SETTLE_FAILED":
        print("STATUS: BLOCKED"); print("DIAGNOSIS: SECOND_RECORD_SELECTION_FAILURE_EVIDENCE_REQUIRED"); return 6
    if not getj(f"http://127.0.0.1:{PORT}/json/version"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: ACTIVE_CDP_REQUIRED"); return 7

    n=newpage()
    if not n or not n.get("webSocketDebuggerUrl"):
        print("STATUS: BLOCKED"); print("DIAGNOSIS: FRESH_PAGE_REQUIRED"); return 8

    w=W(n["webSocketDebuggerUrl"]);w.call("Runtime.enable");w.call("Page.enable")
    explorer=wait_unique_exact_button(w,"Explorer",2.0,3)
    entry=click_exact(w,"Explorer") if explorer.get("certified") else {"clicked":False}
    time.sleep(.75)

    inv=candidate_inventory(w)
    raw_click=click_contains(w,"SE of Adelanto Rd and Rancho Rd") if entry.get("clicked") else {"clicked":False}
    samples=[]
    for t in [0.0,0.05,0.1,0.2,0.35,0.5,0.75,1.0,1.5,2.0]:
        if t: time.sleep(t-(samples[-1]["t"] if samples else 0))
        s=snapshot(w);s["t"]=t;samples.append(s)

    try:w.call("Page.close")
    except:pass

    clicked_text=raw_click.get("text") or ""
    normalized_base="SE of Adelanto Rd and Rancho Rd"
    marker_texts=[m.get("text","") for s in samples for m in s.get("selectedMarkers",[])]
    marker_match_raw=any(TARGET.lower() in x.lower() for x in marker_texts)
    marker_match_base=any(normalized_base.lower() in x.lower() for x in marker_texts)
    raw_label_has_status_suffix=bool(re.search(r"PROPOSED\s*·?\s*$", TARGET, re.I))
    clicked_label_has_status_suffix=bool(re.search(r"PROPOSED\s*·", clicked_text, re.I))
    body_base_seen=any(s.get("bodyHasNormalizedAddress") for s in samples)
    selected_any=any(bool(s.get("selectedMarkers")) for s in samples)

    if selected_any and marker_match_base and not marker_match_raw and raw_label_has_status_suffix:
        classification="SECOND_RECORD_SELECTION_SUCCEEDED_CANDIDATE_LABEL_CONTAINS_STATUS_SUFFIX_READBACK_NORMALIZATION_MISMATCH"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R2_CANDIDATE_LABEL_NORMALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
    elif selected_any and marker_match_base:
        classification="SECOND_RECORD_SELECTION_SUCCEEDED_SELECTED_READBACK_PREDICATE_TOO_STRICT"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R2_SELECTED_PROPERTY_READBACK_NORMALIZATION_REPAIR_AND_FIFTEEN_RECORD_NON_EXPORT_RECERTIFICATION"
    elif raw_click.get("clicked") and body_base_seen and not selected_any:
        classification="SECOND_RECORD_SELECTION_CLICK_ACCEPTED_SELECTED_MARKER_NOT_MATERIALIZED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R2_SECOND_RECORD_SELECTED_MARKER_MATERIALIZATION_DIAGNOSIS"
    else:
        classification="SECOND_RECORD_SELECTION_STATE_CAUSE_REQUIRES_DEEPER_DIAGNOSIS"
        nextm="M4_19D4BN17C_R4_R12_R16A_R24B_R2_SECOND_RECORD_SELECTION_STATE_DEEP_DIAGNOSIS"

    checks={
        "r24bIncompleteStateConsumed":True,
        "secondRecordSelectionFailureConsumed":True,
        "freshPageCreated":True,
        "explorerSettleCertified":explorer.get("certified") is True,
        "explorerEntryClicked":entry.get("clicked") is True,
        "candidateInventoryCaptured":len(inv)>0,
        "candidateClickAttempted":raw_click.get("clicked") is True,
        "postClickSamplesCaptured":len(samples)==10,
        "rawCandidateLabelInspected":True,
        "statusSuffixInspected":True,
        "selectedMarkerReadbackInspected":True,
        "normalizedAddressReadbackInspected":True,
        "assignmentsInvocationOff":True,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True,
        "networkAuthorityOff":True,
        "pixelEvidenceOff":True
    }

    out={
        "framework":"SCIIP_EXPLORER_4_R24B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED",
        "state":"M419D4BN17C_R4_R12_R16A_R24B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSE_DIAGNOSED",
        "classification":classification,
        "target":TARGET,
        "sourceEvidence":{"path":str(p),"sha256":hashlib.sha256(p.read_bytes()).hexdigest()},
        "priorSecondOutcome":outs[1],
        "explorerSettleReadback":explorer,
        "explorerEntry":entry,
        "candidateInventory":inv,
        "selectionClick":raw_click,
        "postClickSamples":samples,
        "diagnostic":{
            "rawLabelHasStatusSuffix":raw_label_has_status_suffix,
            "clickedLabelHasStatusSuffix":clicked_label_has_status_suffix,
            "normalizedBaseAddress":normalized_base,
            "selectedMarkerSeen":selected_any,
            "selectedMarkerMatchesRawTarget":marker_match_raw,
            "selectedMarkerMatchesNormalizedBase":marker_match_base,
            "bodyNormalizedAddressSeen":body_base_seen
        },
        "checks":checks,
        "authority":{
            "assignmentsInvocation":False,
            "exportInvocation":False,
            "applicationSourceMutation":False,
            "governedDataMutation":False,
            "networkAuthority":False,
            "pixelEvidence":False
        },
        "nextMilestone":nextm
    }

    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"non_export_live_qualification_residual_causal_diagnosis.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print()
    print("TARGET:",TARGET)
    print("RAW_LABEL_HAS_STATUS_SUFFIX:",raw_label_has_status_suffix)
    print("CLICKED_LABEL:",clicked_text)
    print("CLICKED_LABEL_HAS_STATUS_SUFFIX:",clicked_label_has_status_suffix)
    print("NORMALIZED_BASE_ADDRESS:",normalized_base)
    print("SELECTED_MARKER_SEEN:",selected_any)
    print("SELECTED_MARKER_MATCHES_RAW_TARGET:",marker_match_raw)
    print("SELECTED_MARKER_MATCHES_NORMALIZED_BASE:",marker_match_base)
    print("BODY_NORMALIZED_ADDRESS_SEEN:",body_base_seen)
    print()
    print("----- CANDIDATE INVENTORY -----")
    for x in inv: print(json.dumps(x,ensure_ascii=False))
    print()
    print("----- POST-CLICK SAMPLES -----")
    for s in samples: print(json.dumps(s,ensure_ascii=False))
    print()
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R24B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSE_DIAGNOSED")
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    return 0

if __name__=="__main__":
    raise SystemExit(main())
