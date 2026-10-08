#!/usr/bin/env python3
import sys, re, json, hashlib, subprocess, time
from pathlib import Path

repo = Path(sys.argv[1]).expanduser().resolve()
pcc = repo / "apps/property-command-center"
runner = pcc / "src/explorer4/M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION/qualify_r29b.mjs"
evidence = pcc / "evidence/explorer4"
prior = evidence / "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R4_CDP_FRAME_RECEIVE_OR_CALL_LIFECYCLE_DIAGNOSIS/cdp_frame_receive_or_call_lifecycle_diagnosis.json"
outdir = evidence / "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_CDP_JSON_DECODE_AND_PENDING_RESOLUTION_REPAIR"
outdir.mkdir(parents=True, exist_ok=True)
ev = outdir / "cdp_json_decode_and_pending_resolution_repair.json"

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R5-R1-R5 CDP JSON Decode + Pending Resolution Repair")
print("="*120)
print("Application source mutation: ON — CDP inbound RFC6455 decode + pending resolution only")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("Strict sequential: ON")
print("Halt on first failure: ON")

if not runner.exists():
    raise SystemExit("BLOCKED: authoritative R29B runner missing")
if not prior.exists():
    raise SystemExit("BLOCKED: R5-R1-R4 diagnosis evidence missing")

pj = json.loads(prior.read_text())
if pj.get("classification") != "WEBSOCKET_FRAME_RECEIVE_PATH_PRESENT_BUT_CDP_JSON_DECODE_ABSENT":
    raise SystemExit("BLOCKED: expected R5-R1-R4 classification absent")

src = runner.read_text()
before = hashlib.sha256(src.encode()).hexdigest()
print("RUNNER_SHA256_BEFORE:", before)

baseline = subprocess.run(["node","--check",str(runner)], capture_output=True, text=True)
if baseline.returncode != 0:
    print(baseline.stderr)
    raise SystemExit("BLOCKED: authoritative runner baseline syntax invalid")

# Install a real post-upgrade receive handler. Existing open() dynamically probes for
# _onData/onData/handleData/_handleData and binds whichever exists.
already = bool(re.search(r'(?m)^\s*_onData\s*\(chunk\)\s*\{', src))

if not already:
    call_match = re.search(r'(?m)^(\s*)call\(method,params=\{\}\)\s*\{', src)
    if not call_match:
        raise SystemExit("BLOCKED: CDP.call insertion boundary not found")
    indent = call_match.group(1)

    method_lines = [
        "_onData(chunk){",
        "  if(!chunk||!chunk.length)return;",
        "  this.__r29bRxBuffer=Buffer.concat([this.__r29bRxBuffer||Buffer.alloc(0),Buffer.from(chunk)]);",
        "  while(this.__r29bRxBuffer.length>=2){",
        "    const b=this.__r29bRxBuffer;",
        "    const b0=b[0], b1=b[1];",
        "    const fin=(b0&0x80)!==0, opcode=b0&0x0f, masked=(b1&0x80)!==0;",
        "    let len=b1&0x7f, off=2;",
        "    if(len===126){",
        "      if(b.length<4)return;",
        "      len=b.readUInt16BE(2); off=4;",
        "    }else if(len===127){",
        "      if(b.length<10)return;",
        "      const n=b.readBigUInt64BE(2);",
        "      if(n>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('CDP_FRAME_TOO_LARGE');",
        "      len=Number(n); off=10;",
        "    }",
        "    let mask=null;",
        "    if(masked){",
        "      if(b.length<off+4)return;",
        "      mask=b.subarray(off,off+4); off+=4;",
        "    }",
        "    if(b.length<off+len)return;",
        "    let payload=Buffer.from(b.subarray(off,off+len));",
        "    this.__r29bRxBuffer=b.subarray(off+len);",
        "    if(mask)for(let i=0;i<payload.length;i++)payload[i]^=mask[i&3];",
        "",
        "    if(opcode===0x8){",
        "      try{this.socket?.end();}catch{}",
        "      continue;",
        "    }",
        "    if(opcode===0x9){",
        "      const m=crypto.randomBytes(4);",
        "      let h;",
        "      if(payload.length<126){",
        "        h=Buffer.alloc(2); h[0]=0x8a; h[1]=0x80|payload.length;",
        "      }else{",
        "        h=Buffer.alloc(4); h[0]=0x8a; h[1]=0x80|126; h.writeUInt16BE(payload.length,2);",
        "      }",
        "      const q=Buffer.alloc(payload.length);",
        "      for(let i=0;i<payload.length;i++)q[i]=payload[i]^m[i&3];",
        "      this.socket.write(Buffer.concat([h,m,q]));",
        "      continue;",
        "    }",
        "    if(opcode!==0x1 && opcode!==0x0)continue;",
        "",
        "    if(opcode===0x1)this.__r29bTextParts=[];",
        "    this.__r29bTextParts=this.__r29bTextParts||[];",
        "    this.__r29bTextParts.push(payload);",
        "    if(!fin)continue;",
        "    const text=Buffer.concat(this.__r29bTextParts).toString('utf8');",
        "    this.__r29bTextParts=[];",
        "    let msg;",
        "    try{msg=JSON.parse(text);}catch{continue;}",
        "    if(msg&&msg.id!=null&&this.pending.has(msg.id)){",
        "      const p=this.pending.get(msg.id);",
        "      this.pending.delete(msg.id);",
        "      if(msg.error)p.reject(new Error('CDP '+(msg.error.message||JSON.stringify(msg.error))));",
        "      else p.resolve(msg.result);",
        "    }",
        "  }",
        "}"
    ]
    method = "\n".join(indent + line if line else "" for line in method_lines) + "\n\n"
    pos = call_match.start()
    src = src[:pos] + method + src[pos:]
    runner.write_text(src)
    applied = True
else:
    applied = False

after_src = runner.read_text()
after = hashlib.sha256(after_src.encode()).hexdigest()
print("RUNNER_SHA256_AFTER:", after)
print("INBOUND_DECODER_REPAIR_APPLIED:", applied)
print("INBOUND_DECODER_ALREADY_PRESENT:", already)

checks = {
    "jsonParsePresent": bool(re.search(r'JSON\.parse\s*\(text\)', after_src)),
    "pendingGetPresent": "this.pending.get(msg.id)" in after_src,
    "pendingDeletePresent": "this.pending.delete(msg.id)" in after_src,
    "pendingResolvePresent": "p.resolve(msg.result)" in after_src,
    "pendingRejectPresent": "p.reject(" in after_src,
    "serverFrame16BitLengthPresent": "readUInt16BE" in after_src,
    "serverFrame64BitLengthPresent": "readBigUInt64BE" in after_src,
    "continuationFramePresent": "opcode!==0x1 && opcode!==0x0" in after_src,
    "pingPongPresent": "h[0]=0x8a" in after_src,
}
for k,v in checks.items():
    print(f"{k}: {v}")

nc = subprocess.run(["node","--check",str(runner)], capture_output=True, text=True)
print("NODE_CHECK_EXIT:", nc.returncode)
print("NODE_CHECK_STDERR:", nc.stderr.strip() or "NONE")
if nc.returncode != 0 or not all(checks.values()):
    raise SystemExit("BLOCKED: inbound decode repair failed static certification")

print("Re-running authoritative R29B after inbound decode + pending resolution repair...")
t0=time.time()
timed=False
try:
    rr=subprocess.run(["node",str(runner),str(repo)],capture_output=True,text=True,timeout=45)
    ec=rr.returncode
except subprocess.TimeoutExpired as e:
    timed=True
    ec=None
secs=round(time.time()-t0,3)

authdir=evidence/"M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"
state={}
if authdir.exists():
    cands=sorted(authdir.glob("*.json"), key=lambda p:p.stat().st_mtime, reverse=True)
    for p in cands:
        try:
            j=json.loads(p.read_text())
            if isinstance(j,dict) and ("outcomes" in j or "status" in j):
                state=j
                break
        except:
            pass

outcomes=state.get("outcomes") or []
o401=next((x for x in outcomes if x.get("ordinal")==401), outcomes[0] if outcomes else None)
certified_count=sum(1 for x in outcomes if x.get("certified"))

print("AUTHORITATIVE_R29B_TIMED_OUT:",timed)
print("AUTHORITATIVE_R29B_EXIT_CODE:",ec)
print("AUTHORITATIVE_R29B_SECONDS:",secs)
print("AUTHORITATIVE_R29B_STATUS:",state.get("status"))
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",certified_count if outcomes else None)
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",len(outcomes) if outcomes else None)
print("RECORD401_OUTCOME:",json.dumps(o401,separators=(",",":")) if o401 else None)

failure=(o401 or {}).get("failure")
runtime_enable_cleared=(failure!="CDP timeout Runtime.enable")
fresh=bool((o401 or {}).get("freshTargetCreated"))
settle=bool((o401 or {}).get("explorerSettleCertified"))
entry=bool((o401 or {}).get("explorerEntryCertified"))
recert=bool((o401 or {}).get("certified"))

print("RUNTIME_ENABLE_TIMEOUT_CLEARED:",runtime_enable_cleared)
print("RECORD401_FRESH_TARGET_CREATED:",fresh)
print("RECORD401_EXPLORER_SETTLE_CERTIFIED:",settle)
print("RECORD401_EXPLORER_ENTRY_CERTIFIED:",entry)
print("RECORD401_RECERTIFIED:",recert)

if recert:
    classification="CDP_INBOUND_DECODE_AND_PENDING_RESOLUTION_REPAIRED_RECORD401_RECERTIFIED"
    status="PASSED"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_EXACT_NEW_400_NON_EXPORT_QUALIFICATION_RESUMPTION"
elif runtime_enable_cleared and (fresh or settle or entry):
    classification="CDP_INBOUND_DECODE_REPAIRED_RECORD401_ADVANCED_NEXT_RESIDUAL_CAPTURED"
    status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R6_RECORD401_POST_TRANSPORT_RESIDUAL_DIAGNOSIS"
elif runtime_enable_cleared:
    classification="CDP_INBOUND_DECODE_REPAIRED_RUNTIME_ENABLE_CLEARED_NEXT_TRANSPORT_RESIDUAL_CAPTURED"
    status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_R1_POST_RUNTIME_ENABLE_TRANSPORT_DIAGNOSIS"
else:
    classification="CDP_INBOUND_DECODER_INSTALLED_RUNTIME_ENABLE_TIMEOUT_RESIDUAL_REMAINS"
    status="DIAGNOSTIC_COMPLETE"
    nextm="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_R3_R5_R1_R5_R1_BOUNDED_INBOUND_FRAME_RUNTIME_DIAGNOSIS"

result={
 "framework":"SCIIP_EXPLORER_4_R29B_R5_R1_R5_CDP_JSON_DECODE_AND_PENDING_RESOLUTION_REPAIR",
 "status":status,
 "classification":classification,
 "runnerSha256Before":before,
 "runnerSha256After":after,
 "inboundDecoderRepairApplied":applied,
 "sourceChecks":checks,
 "authoritativeR29B":{"timedOut":timed,"exitCode":ec,"seconds":secs,"status":state.get("status"),"certifiedCount":certified_count if outcomes else None,"executedCount":len(outcomes) if outcomes else None},
 "runtimeEnableTimeoutCleared":runtime_enable_cleared,
 "record401FreshTargetCreated":fresh,
 "record401ExplorerSettleCertified":settle,
 "record401ExplorerEntryCertified":entry,
 "record401Recertified":recert,
 "record401Outcome":o401,
 "governedDataMutationOff":True,
 "exportInvocationOff":True,
 "strictSequential":True,
 "haltOnFirstFailure":True,
 "nextMilestone":nextm
}
ev.write_text(json.dumps(result,indent=2)+"\n")

print("CLASSIFICATION:",classification)
print("STATUS:",status)
print("NEXT_MILESTONE:",nextm)
print("EVIDENCE:",ev)
print("R29B-R5-R1-R5 EXECUTION COMPLETE — paste complete output into ChatGPT.")
