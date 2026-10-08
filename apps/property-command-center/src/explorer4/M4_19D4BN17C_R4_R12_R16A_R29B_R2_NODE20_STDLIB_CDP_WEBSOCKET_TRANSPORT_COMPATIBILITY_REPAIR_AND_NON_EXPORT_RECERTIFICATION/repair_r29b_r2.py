#!/usr/bin/env python3
from pathlib import Path
import sys, hashlib, subprocess, json

R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION"

repo=Path(sys.argv[1]).expanduser().resolve()
runner=repo/"apps/property-command-center/src/explorer4"/R29B/"qualify_r29b.mjs"
if not runner.exists():
    print("STATUS: BLOCKED")
    print("REASON: authoritative R29B runner absent")
    raise SystemExit(4)

before=runner.read_text()
before_hash=hashlib.sha256(before.encode()).hexdigest()

old_open = '''  async open(){
    this.ws=new WebSocket(this.wsUrl);
    await new Promise((resolve,reject)=>{
      const to=setTimeout(()=>reject(new Error("CDP websocket open timeout")),5000);
      this.ws.onopen=()=>{clearTimeout(to);resolve();};
      this.ws.onerror=e=>{clearTimeout(to);reject(new Error("CDP websocket error"));};
    });
    this.ws.onmessage=e=>{
      let m;try{m=JSON.parse(e.data)}catch{return}
      if(m.id && this.pending.has(m.id)){
        const {resolve,reject}=this.pending.get(m.id);this.pending.delete(m.id);
        if(m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result);
      } else if(m.method){this.events.push(m);}
    };
  }
'''

raw_ws = r'''
class RawWebSocket {
  constructor(url){
    this.url=new URL(url);
    this.sock=null;
    this.buf=Buffer.alloc(0);
    this.opened=false;
    this.onopen=null;
    this.onerror=null;
    this.onmessage=null;
    this.onclose=null;
  }
  async connect(){
    const net=await import("node:net");
    const crypto=await import("node:crypto");
    const host=this.url.hostname;
    const port=Number(this.url.port||80);
    const reqPath=(this.url.pathname||"/")+(this.url.search||"");
    const key=crypto.randomBytes(16).toString("base64");
    const expected=crypto.createHash("sha1").update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    await new Promise((resolve,reject)=>{
      let header=Buffer.alloc(0);
      const sock=net.createConnection({host,port});
      this.sock=sock;
      const fail=e=>{try{sock.destroy()}catch{};reject(e instanceof Error?e:new Error(String(e)));};
      sock.setTimeout(5000,()=>fail(new Error("raw websocket connect timeout")));
      sock.once("error",fail);
      sock.once("connect",()=>{
        const request=[
          `GET ${reqPath} HTTP/1.1`,
          `Host: ${host}:${port}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "\\r\\n"
        ].join("\\r\\n");
        sock.write(request);
      });
      const onHandshake=data=>{
        header=Buffer.concat([header,data]);
        const i=header.indexOf("\\r\\n\\r\\n");
        if(i<0)return;
        sock.off("data",onHandshake);
        const head=header.subarray(0,i).toString("utf8");
        const rest=header.subarray(i+4);
        const lines=head.split("\\r\\n");
        if(!/^HTTP\\/1\\.1 101\\b/.test(lines[0]||""))return fail(new Error("raw websocket upgrade failed: "+(lines[0]||"")));
        const acceptLine=lines.find(x=>/^Sec-WebSocket-Accept:/i.test(x));
        const accept=(acceptLine||"").split(":").slice(1).join(":").trim();
        if(accept!==expected)return fail(new Error("raw websocket accept mismatch"));
        sock.setTimeout(0);
        sock.removeListener("error",fail);
        sock.on("error",e=>this.onerror?.(e));
        sock.on("close",()=>this.onclose?.());
        sock.on("data",x=>this._feed(x));
        this.opened=true;
        if(rest.length)this._feed(rest);
        this.onopen?.();
        resolve();
      };
      sock.on("data",onHandshake);
    });
  }
  async _frame(opcode,payload){
    const crypto=await import("node:crypto");
    payload=Buffer.isBuffer(payload)?payload:Buffer.from(payload);
    const mask=crypto.randomBytes(4);
    let head;
    const n=payload.length;
    if(n<126){
      head=Buffer.alloc(2);head[0]=0x80|opcode;head[1]=0x80|n;
    }else if(n<=0xffff){
      head=Buffer.alloc(4);head[0]=0x80|opcode;head[1]=0x80|126;head.writeUInt16BE(n,2);
    }else{
      head=Buffer.alloc(10);head[0]=0x80|opcode;head[1]=0x80|127;head.writeBigUInt64BE(BigInt(n),2);
    }
    const out=Buffer.alloc(n);
    for(let i=0;i<n;i++)out[i]=payload[i]^mask[i&3];
    return Buffer.concat([head,mask,out]);
  }
  async send(data){
    if(!this.opened||!this.sock)throw new Error("raw websocket not open");
    this.sock.write(await this._frame(0x1,Buffer.from(String(data))));
  }
  async _pong(payload){
    if(this.sock?.writable)this.sock.write(await this._frame(0xA,payload));
  }
  _feed(data){
    this.buf=Buffer.concat([this.buf,data]);
    while(this.buf.length>=2){
      const b0=this.buf[0],b1=this.buf[1];
      const fin=!!(b0&0x80),opcode=b0&0x0f,masked=!!(b1&0x80);
      let len=b1&0x7f,off=2;
      if(len===126){
        if(this.buf.length<4)return;
        len=this.buf.readUInt16BE(2);off=4;
      }else if(len===127){
        if(this.buf.length<10)return;
        const big=this.buf.readBigUInt64BE(2);
        if(big>BigInt(Number.MAX_SAFE_INTEGER))throw new Error("raw websocket frame too large");
        len=Number(big);off=10;
      }
      let mask=null;
      if(masked){
        if(this.buf.length<off+4)return;
        mask=this.buf.subarray(off,off+4);off+=4;
      }
      if(this.buf.length<off+len)return;
      let payload=Buffer.from(this.buf.subarray(off,off+len));
      this.buf=this.buf.subarray(off+len);
      if(mask)for(let i=0;i<payload.length;i++)payload[i]^=mask[i&3];
      if(opcode===0x8){
        this.opened=false;
        try{this.sock?.end()}catch{}
        continue;
      }
      if(opcode===0x9){
        this._pong(payload).catch(()=>{});
        continue;
      }
      if(opcode===0xA)continue;
      if(opcode===0x1){
        this.onmessage?.({data:payload.toString("utf8")});
        continue;
      }
      if(opcode===0x0 && fin){
        this.onmessage?.({data:payload.toString("utf8")});
      }
    }
  }
  close(){
    this.opened=false;
    try{this.sock?.end()}catch{}
    try{this.sock?.destroy()}catch{}
  }
}
'''

new_open = '''  async open(){
    this.ws=new RawWebSocket(this.wsUrl);
    this.ws.onmessage=e=>{
      let m;try{m=JSON.parse(e.data)}catch{return}
      if(m.id && this.pending.has(m.id)){
        const {resolve,reject}=this.pending.get(m.id);this.pending.delete(m.id);
        if(m.error) reject(new Error(JSON.stringify(m.error))); else resolve(m.result);
      } else if(m.method){this.events.push(m);}
    };
    this.ws.onerror=e=>{};
    await this.ws.connect();
  }
'''

if old_open in before:
    anchor=before.find("class CDP {")
    if anchor<0:
        print("STATUS: BLOCKED")
        print("REASON: CDP class anchor missing")
        raise SystemExit(5)
    after=before[:anchor]+raw_ws+"\\n"+before[anchor:]
    after=after.replace(old_open,new_open,1)
elif "class RawWebSocket {" in before and "this.ws=new RawWebSocket(this.wsUrl);" in before:
    after=before
else:
    print("STATUS: BLOCKED")
    print("REASON: exact diagnosed WebSocket transport surface not found")
    raise SystemExit(6)

runner.write_text(after)
after_hash=hashlib.sha256(after.encode()).hexdigest()
syntax=subprocess.run(["node","--check",str(runner)],capture_output=True,text=True)

checks={
  "rawStdlibWebSocketInstalled":"class RawWebSocket {" in after,
  "browserGlobalWebSocketDependencyRemoved":"this.ws=new WebSocket(this.wsUrl);" not in after,
  "cdpUsesRawWebSocket":"this.ws=new RawWebSocket(this.wsUrl);" in after,
  "nodeNetTransportUsed":'import("node:net")' in after,
  "maskedClientFramesImplemented":"mask=crypto.randomBytes(4)" in after,
  "largeFrameLengthsSupported":"readBigUInt64BE" in after and "writeBigUInt64BE" in after,
  "pingPongHandled":"opcode===0x9" in after and "_pong(payload)" in after,
  "nodeSyntaxCheckPassed":syntax.returncode==0,
  "exportInvocationOffPreserved":"Export invocation: OFF" in after,
  "freshPagePerRecordPreserved":"Fresh page per record: REQUIRED" in after,
  "strictSequentialPreserved":"Strict sequential: ON" in after,
  "haltOnFirstFailurePreserved":"Halt on first failure: ON" in after,
}

print("="*120)
print("SCIIP Explorer 4.0 — R29B-R2 Node20 Stdlib CDP WebSocket Transport Compatibility Repair")
print("="*120)
print("Application source mutation: ON — R29B runner transport-only repair")
print("Governed data mutation: OFF")
print("Export invocation: OFF")
print("RUNNER_SHA256_BEFORE:",before_hash)
print("RUNNER_SHA256_AFTER:",after_hash)
print("NODE_CHECK_STDERR:",syntax.stderr.strip() or "NONE")
print("----- CHECKS -----")
for k,v in checks.items():print(f"{k}: {v}")

if not all(checks.values()):
    print("STATUS: BLOCKED")
    print("CLASSIFICATION: R29B_R2_TRANSPORT_REPAIR_CERTIFICATION_FAILED")
    raise SystemExit(7)

print("TRANSPORT_REPAIR_CERTIFIED: True")
print("Re-running authoritative R29B runner...")
run=subprocess.run(["node",str(runner),str(repo)])
print("AUTHORITATIVE_R29B_EXIT_CODE:",run.returncode)

ev=repo/"apps/property-command-center/evidence/explorer4"/R29B/"exact_new_four_hundred_non_export_live_qualification.json"
st=None
if ev.exists():
    try:st=json.loads(ev.read_text())
    except:pass

print("AUTHORITATIVE_R29B_STATUS:",(st or {}).get("status"))
print("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",(st or {}).get("certifiedCount"))
print("AUTHORITATIVE_R29B_EXECUTED_COUNT:",(st or {}).get("executedCount"))
print("AUTHORITATIVE_R29B_CLASSIFICATION:",(st or {}).get("classification"))

if (st or {}).get("status")=="PASSED":
    print("STATUS: PASSED")
    print("STATE: M419D4BN17C_R4_R12_R16A_R29B_R2_NODE20_CDP_TRANSPORT_REPAIRED_R29B_EXACT_NEW400_NON_EXPORT_QUALIFICATION_CERTIFIED")
    print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R29C_EXACT_EIGHT_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION")
else:
    print("STATUS: DIAGNOSTIC_COMPLETE")
    print("CLASSIFICATION: R29B_LIVE_QUALIFICATION_RESIDUAL_REMAINS_AFTER_NODE20_CDP_TRANSPORT_REPAIR")
    print("NEXT_MILESTONE:",(st or {}).get("nextMilestone") or "M4_19D4BN17C_R4_R12_R16A_R29B_R2_R1_POST_TRANSPORT_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS")

print("R29B-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
raise SystemExit(0)
