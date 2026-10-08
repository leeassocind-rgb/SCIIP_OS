#!/usr/bin/env python3
import sys,json,hashlib,subprocess,re,time,urllib.request
from pathlib import Path

repo=Path(sys.argv[1]).expanduser().resolve()
pcc=repo/"apps/property-command-center"
runner=pcc/"src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
er=pcc/"evidence/explorer4"
prior=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_LOCALIZED_CREATE_FRESH_PAGE_AWAIT_LIFECYCLE_REPAIR_AND_RECORD401_RECERTIFICATION/localized_createfreshpage_await_lifecycle_repair_and_record401_recertification.json"
outdir=er/"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_CDP_OPEN_HANDSHAKE_COMPLETION_REPAIR_AND_RECORD401_RECERTIFICATION"
outdir.mkdir(parents=True,exist_ok=True)
evidence=outdir/"cdp_open_handshake_completion_repair_and_record401_recertification.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R4-R3-R5-R1 CDP Open Handshake Completion Repair + Record401 Recertification")
print("="*120)
print("Application source mutation: ON — CDP.open handshake completion repair only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")

if not runner.exists(): raise SystemExit("BLOCKED: authoritative R29B runner missing")
pj=json.loads(prior.read_text()) if prior.exists() else {}
if pj.get("classification")!="NODE_EXIT13_CLEARED_CDP_OPEN_TIMEOUT_NOW_EXPLICIT":
    raise SystemExit("BLOCKED: expected explicit CDP open timeout diagnosis not certified")

original=runner.read_text()
before=hashlib.sha256(original.encode()).hexdigest()
if subprocess.run(["node","--check",str(runner)],capture_output=True).returncode:
    raise SystemExit("BLOCKED: authoritative runner syntax invalid")

cm=re.search(r'class\s+CDP\s*\{',original)
if not cm: raise SystemExit("BLOCKED: CDP class not found")
class_start=cm.start()
brace=original.find("{",cm.start())
depth=0; class_end=None; q=None; esc=False
for i in range(brace,len(original)):
    ch=original[i]
    if q:
        if esc: esc=False
        elif ch=="\\": esc=True
        elif ch==q: q=None
    else:
        if ch in ("'",'"','`'): q=ch
        elif ch=="{": depth+=1
        elif ch=="}":
            depth-=1
            if depth==0: class_end=i+1; break
if class_end is None: raise SystemExit("BLOCKED: CDP class boundary unresolved")
cls=original[class_start:class_end]
om=re.search(r'async\s+open\s*\(\s*\)\s*\{',cls)
if not om: raise SystemExit("BLOCKED: async CDP.open not found")
open_abs=class_start+om.start()
open_brace=class_start+om.end()-1
depth=0; open_end=None; q=None; esc=False
for i in range(open_brace,len(original)):
    ch=original[i]
    if q:
        if esc: esc=False
        elif ch=="\\": esc=True
        elif ch==q: q=None
    else:
        if ch in ("'",'"','`'): q=ch
        elif ch=="{": depth+=1
        elif ch=="}":
            depth-=1
            if depth==0: open_end=i+1; break
if open_end is None: raise SystemExit("BLOCKED: CDP.open boundary unresolved")

open_src=original[open_abs:open_end]
print("CDP_OPEN_START_LINE:",original[:open_abs].count("\n")+1)
print("CDP_OPEN_END_LINE:",original[:open_end].count("\n")+1)
print("----- EXISTING CDP.OPEN SOURCE -----")
print(open_src)

repair = r'''async open(){
    if(this.__r29bOpenPromise)return this.__r29bOpenPromise;
    this.__r29bOpenPromise=new Promise((resolve,reject)=>{
      let settled=false, upgraded=false, headerBuf=Buffer.alloc(0);
      const ok=()=>{if(settled)return;settled=true;this.__r29bOpen=true;resolve(true);};
      const bad=(e)=>{if(settled)return;settled=true;reject(e instanceof Error?e:new Error(String(e||"CDP_OPEN_FAILED")));};
      try{
        const wsUrl=this.url||this.wsUrl||this.webSocketDebuggerUrl||this.wsURL||this._url;
        if(!wsUrl)throw new Error("CDP_OPEN_MISSING_WEBSOCKET_URL");
        const u=new URL(wsUrl), host=u.hostname, port=Number(u.port||80), path=(u.pathname||"/")+(u.search||"");
        const key=crypto.randomBytes(16).toString("base64");
        const socket=net.createConnection({host,port});
        this.socket=socket; this.sock=socket; this.ws=socket;
        socket.once("error",(e)=>bad(e||new Error("CDP_SOCKET_ERROR")));
        socket.once("close",()=>{if(!upgraded)bad(new Error("CDP_SOCKET_CLOSED_BEFORE_UPGRADE"));});
        socket.once("connect",()=>{
          socket.write([
            `GET ${path} HTTP/1.1`,
            `Host: ${host}:${port}`,
            "Upgrade: websocket",
            "Connection: Upgrade",
            `Sec-WebSocket-Key: ${key}`,
            "Sec-WebSocket-Version: 13",
            "",
            ""
          ].join("\r\n"));
        });
        const onHandshakeData=(chunk)=>{
          if(upgraded)return;
          headerBuf=Buffer.concat([headerBuf,Buffer.from(chunk)]);
          const marker=headerBuf.indexOf("\r\n\r\n");
          if(marker<0)return;
          const head=headerBuf.subarray(0,marker).toString("utf8");
          const rest=headerBuf.subarray(marker+4);
          const first=(head.split("\r\n")[0]||"").trim();
          if(!first.startsWith("HTTP/1.1 101")&&!first.startsWith("HTTP/1.0 101")){
            socket.off("data",onHandshakeData);
            bad(new Error("CDP_WEBSOCKET_UPGRADE_FAILED:"+first));
            try{socket.destroy();}catch{}
            return;
          }
          upgraded=true;
          socket.off("data",onHandshakeData);
          const h=(typeof this._onData==="function"&&this._onData.bind(this))||
                  (typeof this.onData==="function"&&this.onData.bind(this))||
                  (typeof this.handleData==="function"&&this.handleData.bind(this))||
                  (typeof this._handleData==="function"&&this._handleData.bind(this));
          if(h){socket.on("data",h); if(rest.length)h(rest);}
          ok();
        };
        socket.on("data",onHandshakeData);
      }catch(e){bad(e);}
    });
    return this.__r29bOpenPromise;
  }'''

repaired=original[:open_abs]+repair+original[open_end:]

if "node:crypto" not in repaired:
    ims=list(re.finditer(r'^import .*?;\s*$',repaired,re.M)); pos=ims[-1].end() if ims else 0
    repaired=repaired[:pos]+'\nimport crypto from "node:crypto";'+repaired[pos:]
if "node:net" not in repaired:
    ims=list(re.finditer(r'^import .*?;\s*$',repaired,re.M)); pos=ims[-1].end() if ims else 0
    repaired=repaired[:pos]+'\nimport net from "node:net";'+repaired[pos:]

runner.write_text(repaired)
after=hashlib.sha256(runner.read_bytes()).hexdigest()
nc=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)
print("RUNNER_SHA256_BEFORE:",before)
print("RUNNER_SHA256_AFTER:",after)
print("NODE_CHECK_EXIT:",nc.returncode)
print("NODE_CHECK_STDERR:",nc.stderr.strip() or "NONE")
if nc.returncode: raise SystemExit("BLOCKED: repaired runner syntax invalid")

def hs(u):
    try:
        with urllib.request.urlopen(u,timeout=1.5) as r:return r.status
    except:return None
a0=hs("http://127.0.0.1:5173/"); c0=hs("http://127.0.0.1:9333/json/version")
print("SCIIP_APP_HTTP_STATUS_BEFORE:",a0)
print("CDP_HTTP_STATUS_BEFORE:",c0)
if a0!=200:
    with open("/tmp/sciip-r29b-r5-r1-vite.log","ab") as f:
        subprocess.Popen(["npm","run","dev","--","--host","127.0.0.1","--port","5173"],cwd=str(pcc),stdout=f,stderr=f,start_new_session=True)
    for _ in range(40):
        time.sleep(.25)
        if hs("http://127.0.0.1:5173/")==200:break
a1=hs("http://127.0.0.1:5173/"); c1=hs("http://127.0.0.1:9333/json/version")
print("SCIIP_APP_HTTP_STATUS_AFTER:",a1)
print("CDP_HTTP_STATUS_AFTER:",c1)

print("Re-running authoritative R29B...")
to=False; ec=None; so=""; se=""; t0=time.time()
try:
    p=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=25)
    ec=p.returncode; so=p.stdout or ""; se=p.stderr or ""
except subprocess.TimeoutExpired as e:
    to=True; so=e.stdout or ""; se=e.stderr or ""
secs=round(time.time()-t0,3)

r29bev=er/"M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/exact_new_four_hundred_non_export_live_qualification.json"
rj={}
if r29bev.exists():
    try:rj=json.loads(r29bev.read_text())
    except:pass
o401=next((o for o in (rj.get("outcomes") or []) if o.get("ordinal")==401),None)
fresh=bool((o401 or {}).get("freshTargetCreated"))
cert=bool((o401 or {}).get("certified"))
timeout_absent="R29B_CDP_OPEN_TIMEOUT_2000MS" not in (so+se+json.dumps(o401 or {}))
print("AUTHORITATIVE_R29B_TIMED_OUT:",to)
print("AUTHORITATIVE_R29B_EXIT_CODE:",ec)
print("AUTHORITATIVE_R29B_SECONDS:",secs)
print("AUTHORITATIVE_R29B_STATUS:",rj.get("status"))
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",rj.get("certifiedCount"))
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",rj.get("executedCount"))
print("RECORD401_OUTCOME:",json.dumps(o401,separators=(",",":")) if o401 else None)
print("CDP_OPEN_TIMEOUT_ABSENT:",timeout_absent)
print("RECORD401_FRESH_TARGET_CREATED:",fresh)
print("RECORD401_RECERTIFIED:",cert)

if cert:
    classification="CDP_OPEN_HANDSHAKE_COMPLETION_REPAIRED_RECORD401_RECERTIFIED"; status="PASSED"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R6_EXACT_NEW400_NON_EXPORT_QUALIFICATION_RESUME"
elif fresh:
    classification="CDP_OPEN_HANDSHAKE_COMPLETION_REPAIRED_NEXT_RECORD401_WORKFLOW_RESIDUAL_CAPTURED"; status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R2_POST_CDP_OPEN_RECORD401_RESIDUAL_CAUSAL_DIAGNOSIS"
else:
    classification="CDP_OPEN_HANDSHAKE_REPAIR_RESIDUAL_REMAINS"; status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R1_CDP_OPEN_POST_REPAIR_RESIDUAL_DIAGNOSIS"

result={"framework":"SCIIP_EXPLORER_4_R29B_R5_R1","status":status,"classification":classification,
"runnerSha256Before":before,"runnerSha256After":after,
"runtime":{"appAfter":a1,"cdpAfter":c1},
"authoritativeR29B":{"exitCode":ec,"timedOut":to,"seconds":secs,"status":rj.get("status"),"certifiedCount":rj.get("certifiedCount"),"executedCount":rj.get("executedCount")},
"cdpOpenTimeoutAbsent":timeout_absent,"record401FreshTargetCreated":fresh,"record401Recertified":cert,"record401Outcome":o401,
"governedDataMutationOff":True,"exportInvocationOff":True,"nextMilestone":nextm}
evidence.write_text(json.dumps(result,indent=2)+"\n")
print("CLASSIFICATION:",classification)
print("STATUS:",status)
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",evidence)
print("R29B-R2-R3-R2-R4-R3-R5-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
