#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,re,sys,urllib.request,socket,base64,os,struct
from urllib.parse import urlparse

M="M4_19D4BN17C_R4_R12_R16A_R17_EXPORT_CAPABILITY_FEATURE_PERMISSION_GATE_RUNTIME_STATE_RESOLUTION"

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
        x=urlparse(u); host=x.hostname or "127.0.0.1"; port=x.port or 80; path=x.path or "/"
        if x.query:path+="?"+x.query
        self.s=socket.create_connection((host,port),5);self.s.settimeout(15)
        key=base64.b64encode(os.urandom(16)).decode()
        req=(f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n"
             f"Sec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n").encode()
        self.s.sendall(req);b=b""
        while b"\r\n\r\n" not in b:
            x=self.s.recv(4096)
            if not x:raise RuntimeError("websocket closed during handshake")
            b+=x
        if b" 101 " not in b.split(b"\r\n",1)[0]:raise RuntimeError("websocket handshake failed")
        self.i=0
    def send(self,o):
        p=json.dumps(o).encode();mask=os.urandom(4);n=len(p);h=bytearray([0x81])
        if n<126:h.append(0x80|n)
        elif n<65536:h+=bytes([0xFE])+struct.pack("!H",n)
        else:h+=bytes([0xFF])+struct.pack("!Q",n)
        h+=mask;self.s.sendall(h+bytes(v^mask[i%4] for i,v in enumerate(p)))
    def recv(self):
        while True:
            a=_recv_exact(self.s,2);op=a[0]&15;n=a[1]&127
            if n==126:n=struct.unpack("!H",_recv_exact(self.s,2))[0]
            elif n==127:n=struct.unpack("!Q",_recv_exact(self.s,8))[0]
            data=_recv_exact(self.s,n)
            if op==8:raise RuntimeError("websocket close frame")
            if op==9:continue
            if op in (1,2):return json.loads(data.decode())
    def call(self,m,p=None):
        self.i+=1;i=self.i;self.send({"id":i,"method":m,"params":p or {}})
        while True:
            x=self.recv()
            if x.get("id")==i:return x
    def ev(self,e):
        x=self.call("Runtime.evaluate",{"expression":e,"returnByValue":True,"awaitPromise":True})
        r=x.get("result",{})
        return {"ok":not x.get("error") and r.get("exceptionDetails") is None,
                "value":r.get("result",{}).get("value")}
    def close(self):
        try:self.s.close()
        except:pass

def source_runtime_candidates(app):
    pats={
      "export":re.compile(r"\bexport\b|download|pptx?|powerpoint",re.I),
      "capability":re.compile(r"capabilit|canExport|supportsExport|exportEnabled|allowExport",re.I),
      "feature":re.compile(r"featureFlag|feature flag|isFeatureEnabled|featureOverrides|enabledByDefault",re.I),
      "permission":re.compile(r"permission|authorize|authorized|executionAuthorized|approvalRequired",re.I),
      "registry":re.compile(r"runtimeRegistry|getCapability|registerCapability|capabilityManifest|workspaceLoader",re.I),
      "workspace":re.compile(r"workspace|loadWorkspace|loadedWorkspace|workspaceState",re.I),
    }
    rows=[]
    for root in [app/"src",app/"dist/assets"]:
        if not root.exists():continue
        for p in root.rglob("*"):
            if not p.is_file() or p.suffix not in {".js",".jsx",".ts",".tsx",".mjs"}:continue
            try:s=p.read_text(errors="ignore")
            except:continue
            if not pats["export"].search(s):continue
            for m in pats["export"].finditer(s):
                a=max(0,m.start()-2200);b=min(len(s),m.start()+3200);sn=s[a:b]
                sig={k:bool(v.search(sn)) for k,v in pats.items()}
                if not any(sig[k] for k in ("capability","feature","permission","registry","workspace")):continue
                score=25+18*sig["capability"]+18*sig["feature"]+16*sig["permission"]+14*sig["registry"]+12*sig["workspace"]
                rows.append({"file":str(p.relative_to(app)),"offset":m.start(),"score":score,"signals":sig,
                             "snippet":re.sub(r"\s+"," ",sn)[:5000]})
                if len(rows)>=1400:break
            if len(rows)>=1400:break
        if len(rows)>=1400:break
    rows.sort(key=lambda x:-x["score"])
    return rows

def main():
    repo=Path(sys.argv[1]).expanduser().resolve();app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"
    r3p=ev/"M4_19D4BN17C_R4_R12_R16A_R16_R3_EXACT_EXPORT_RENDER_GATE_PREDICATE_AND_WORKSPACE_SUBSTATE_DIAGNOSIS"/"exact_export_render_gate_predicate_and_workspace_substate_diagnosis.json"
    if not r3p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16_R3_EVIDENCE_REQUIRED");return 4
    r3=load(r3p)
    if r3.get("status")!="PASSED" or r3.get("predicateClass")!="EXPORT_REQUIRES_CAPABILITY_FEATURE_OR_PERMISSION_GATE":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16_R3_CAPABILITY_FEATURE_PERMISSION_CLASSIFICATION_REQUIRED");return 5

    source=source_runtime_candidates(app)
    ts=[x for x in targets() if x.get("type")=="page" and x.get("webSocketDebuggerUrl")]
    if not ts:
        print("STATUS: BLOCKED");print("DIAGNOSIS: CERTIFIED_BROWSER_PAGE_REQUIRED");return 6
    t=next((x for x in ts if "localhost" in x.get("url","") or "127.0.0.1" in x.get("url","")),ts[0])
    w=WS(t["webSocketDebuggerUrl"])
    js="(()=>{\nconst out={globals:[],storage:{local:{},session:{}},react:[],scripts:[...document.scripts].map(s=>s.src).filter(Boolean)};\nconst pick=(o,pfx,depth=0,seen=new Set())=>{\n if(!o||depth>2||(typeof o!=='object'&&typeof o!=='function')||seen.has(o))return;\n seen.add(o);\n let ks=[];try{ks=Object.getOwnPropertyNames(o)}catch(e){return}\n for(const k of ks.slice(0,500)){\n   if(!/capab|feature|permission|export|present|workspace|registry|loaded|authoriz/i.test(k))continue;\n   let v;try{v=o[k]}catch(e){continue}\n   let sv;\n   if(v===null||['string','number','boolean','undefined'].includes(typeof v))sv=v;\n   else if(typeof v==='function')sv={type:'function',name:v.name||k,length:v.length};\n   else if(Array.isArray(v))sv={type:'array',length:v.length,sample:v.slice(0,12).map(x=>typeof x==='object'?'[object]':x)};\n   else sv={type:typeof v,keys:(()=>{try{return Object.keys(v).slice(0,40)}catch(e){return[]}})()};\n   out.globals.push({path:pfx+k,value:sv});\n }\n};\npick(window,'window.');\nfor(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(/capab|feature|permission|export|present|workspace|authoriz/i.test(k))out.storage.local[k]=localStorage.getItem(k)}\nfor(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);if(/capab|feature|permission|export|present|workspace|authoriz/i.test(k))out.storage.session[k]=sessionStorage.getItem(k)}\nfor(const el of document.querySelectorAll('*')){\n const pks=Object.getOwnPropertyNames(el).filter(k=>k.startsWith('__reactProps$'));\n for(const pk of pks){\n   const p=el[pk];if(!p||typeof p!=='object')continue;\n   const rec={tag:el.tagName,text:(el.innerText||el.textContent||'').trim().slice(0,220),props:{}};\n   for(const [k,v] of Object.entries(p)){\n     if(!/capab|feature|permission|export|present|workspace|authoriz|enabled|disabled/i.test(k))continue;\n     if(v===null||['string','number','boolean','undefined'].includes(typeof v))rec.props[k]=v;\n     else if(typeof v==='function')rec.props[k]={fn:v.name||k,length:v.length};\n     else if(Array.isArray(v))rec.props[k]={arrayLength:v.length};\n     else rec.props[k]={type:typeof v,keys:Object.keys(v||{}).slice(0,30)};\n   }\n   if(Object.keys(rec.props).length)out.react.push(rec);\n }\n}\nreturn out;\n})()"
    live=w.ev(js);w.close()
    lv=live.get("value") or {}

    blob=json.dumps(lv).lower()
    source_blob=" ".join(x["snippet"] for x in source[:80]).lower()
    signals={
      "featureFlagRuntimeSignal":bool(re.search(r"feature|enabledbydefault|isfeatureenabled|featureoverride",blob)),
      "capabilityRuntimeSignal":bool(re.search(r"capabilit|registry|getcapability|loadedworkspace",blob)),
      "permissionRuntimeSignal":bool(re.search(r"permission|authoriz|approvalrequired|executionauthorized",blob)),
      "exportRuntimeSignal":bool(re.search(r"export|download|ppt|powerpoint",blob)),
      "sourceFeatureContract":bool(re.search(r"featureflag|isfeatureenabled|featureoverrides",source_blob)),
      "sourceCapabilityContract":bool(re.search(r"capabilit|getcapability|runtimeregistry|workspaceloader",source_blob)),
      "sourcePermissionContract":bool(re.search(r"permission|authorized|approvalrequired|executionauthorized",source_blob))
    }

    if signals["featureFlagRuntimeSignal"] and signals["sourceFeatureContract"]:
        cls="LIVE_EXPORT_FEATURE_FLAG_OR_OVERRIDE_STATE_RESOLVED"
    elif signals["capabilityRuntimeSignal"] and signals["sourceCapabilityContract"]:
        cls="LIVE_EXPORT_CAPABILITY_REGISTRATION_OR_LOAD_STATE_RESOLVED"
    elif signals["permissionRuntimeSignal"] and signals["sourcePermissionContract"]:
        cls="LIVE_EXPORT_PERMISSION_OR_AUTHORIZATION_STATE_RESOLVED"
    elif signals["sourceFeatureContract"] and not signals["featureFlagRuntimeSignal"]:
        cls="EXPORT_FEATURE_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED"
    elif signals["sourceCapabilityContract"] and not signals["capabilityRuntimeSignal"]:
        cls="EXPORT_CAPABILITY_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED"
    elif signals["sourcePermissionContract"] and not signals["permissionRuntimeSignal"]:
        cls="EXPORT_PERMISSION_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED"
    else:
        cls="EXPORT_CAPABILITY_FEATURE_PERMISSION_RUNTIME_STATE_UNRESOLVED"

    checks={
      "r16R3Passed":r3.get("status")=="PASSED",
      "r16R3CapabilityFeaturePermissionClassification":r3.get("predicateClass")=="EXPORT_REQUIRES_CAPABILITY_FEATURE_OR_PERMISSION_GATE",
      "sourceGateRuntimeCandidatesResolved":len(source)>0,
      "liveRuntimeStateInspectionCompleted":live.get("ok") is True,
      "runtimeGateStateClassified":cls!="EXPORT_CAPABILITY_FEATURE_PERMISSION_RUNTIME_STATE_UNRESOLVED",
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,
      "pixelEvidenceOff":True,"liveWorkflowActionAuthorityOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R17_EXPORT_CAPABILITY_FEATURE_PERMISSION_RUNTIME_STATE_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R17_RUNTIME_STATE_RESOLUTION_INCOMPLETE")
    diagnosis=("EXPORT_CAPABILITY_FEATURE_PERMISSION_GATE_RUNTIME_CAUSALLY_CLASSIFIED_"+cls
               if passed else "EXPORT_CAPABILITY_FEATURE_PERMISSION_GATE_RUNTIME_STATE_REMAINS_UNRESOLVED")
    mapping={
      "LIVE_EXPORT_FEATURE_FLAG_OR_OVERRIDE_STATE_RESOLVED":"M4_19D4BN17C_R4_R12_R16A_R18_EXPORT_FEATURE_FLAG_VALUE_AND_ENABLEMENT_CONTRACT_RESOLUTION",
      "LIVE_EXPORT_CAPABILITY_REGISTRATION_OR_LOAD_STATE_RESOLVED":"M4_19D4BN17C_R4_R12_R16A_R18_EXPORT_CAPABILITY_REGISTRATION_LOAD_STATE_CONTRACT_RESOLUTION",
      "LIVE_EXPORT_PERMISSION_OR_AUTHORIZATION_STATE_RESOLVED":"M4_19D4BN17C_R4_R12_R16A_R18_EXPORT_PERMISSION_AUTHORIZATION_VALUE_CONTRACT_RESOLUTION",
      "EXPORT_FEATURE_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED":"M4_19D4BN17C_R4_R12_R16A_R18_EXPORT_FEATURE_FLAG_RUNTIME_OWNER_BINDING_DIAGNOSIS",
      "EXPORT_CAPABILITY_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED":"M4_19D4BN17C_R4_R12_R16A_R18_EXPORT_CAPABILITY_RUNTIME_OWNER_BINDING_DIAGNOSIS",
      "EXPORT_PERMISSION_GATE_SOURCE_PRESENT_RUNTIME_STATE_NOT_EXPOSED":"M4_19D4BN17C_R4_R12_R16A_R18_EXPORT_PERMISSION_RUNTIME_OWNER_BINDING_DIAGNOSIS"
    }
    nxt=mapping.get(cls,"M4_19D4BN17C_R4_R12_R16A_R17_R1_CAPABILITY_FEATURE_PERMISSION_GATE_DEEP_RUNTIME_OWNER_DIAGNOSIS")

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"export_capability_feature_permission_gate_runtime_state_resolution.json"
    f.write_text(json.dumps({
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R17_EXPORT_CAPABILITY_FEATURE_PERMISSION_GATE_RUNTIME_STATE_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"diagnosis":diagnosis,
      "r16R3PredicateClass":r3.get("predicateClass"),"sourceCandidateCount":len(source),
      "topSourceCandidates":source[:120],"liveRuntimeInspection":lv,"signals":signals,
      "runtimeGateClassification":cls,"checks":checks,
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"liveWorkflowActionAuthority":False},
      "nextMilestone":nxt
    },indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R17 Export Capability / Feature / Permission Gate Runtime State Resolution")
    print("="*120)
    print("R16_R3_PREDICATE_CLASS:",r3.get("predicateClass"))
    print("SOURCE_GATE_RUNTIME_CANDIDATE_COUNT:",len(source))
    print("LIVE_GLOBAL_SIGNAL_COUNT:",len(lv.get("globals",[])))
    print("LIVE_REACT_SIGNAL_COUNT:",len(lv.get("react",[])))
    print("LIVE_LOCAL_STORAGE_SIGNAL_COUNT:",len(lv.get("storage",{}).get("local",{})))
    print("LIVE_SESSION_STORAGE_SIGNAL_COUNT:",len(lv.get("storage",{}).get("session",{})))
    print("RUNTIME_GATE_CLASSIFICATION:",cls)
    print("SIGNALS:",json.dumps(signals))
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
