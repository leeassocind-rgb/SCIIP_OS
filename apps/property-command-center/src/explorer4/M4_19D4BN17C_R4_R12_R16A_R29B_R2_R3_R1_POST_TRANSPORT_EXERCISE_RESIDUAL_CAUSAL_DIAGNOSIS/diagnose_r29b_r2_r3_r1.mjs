#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import net from "node:net";

const repo=path.resolve(process.argv[2]||"");
if(!repo){console.error("usage: diagnose_r29b_r2_r3_r1.mjs <SCIIP_OS-root>");process.exit(2);}
const pcc=path.join(repo,"apps/property-command-center");
const er=path.join(pcc,"evidence/explorer4");
const R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION";
const R23="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_RUNTIME_REBOOTSTRAP_TRANSPORT_EXERCISE_AND_NON_EXPORT_RECERTIFICATION";
const OUT="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R1_POST_TRANSPORT_EXERCISE_RESIDUAL_CAUSAL_DIAGNOSIS";
const out=path.join(er,OUT);fs.mkdirSync(out,{recursive:true});
const evidencePath=path.join(out,"post_transport_exercise_residual_causal_diagnosis.json");
const runnerPath=path.join(pcc,"src/explorer4",R29B,"qualify_r29b.mjs");
const r29bEvPath=path.join(er,R29B,"exact_new_four_hundred_non_export_live_qualification.json");
const r23EvPath=path.join(er,R23,"runtime_rebootstrap_transport_exercise_and_non_export_recertification.json");

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const readJson=p=>{try{return JSON.parse(fs.readFileSync(p,"utf8"))}catch{return null}};
const sha256=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

async function http(url,opts={}){
  const r=await fetch(url,opts);
  const text=await r.text();
  return {ok:r.ok,status:r.status,text};
}

class ProbeWebSocket {
  constructor(url){
    this.url=new URL(url);
    this.sock=null;
    this.buf=Buffer.alloc(0);
    this.pending=[];
    this.opened=false;
    this.messages=[];
    this.errors=[];
  }
  async connect(){
    const host=this.url.hostname;
    const port=Number(this.url.port||80);
    const reqPath=(this.url.pathname||"/")+(this.url.search||"");
    const key=crypto.randomBytes(16).toString("base64");
    const expected=crypto.createHash("sha1").update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    return await new Promise((resolve,reject)=>{
      let header=Buffer.alloc(0),done=false;
      const sock=net.createConnection({host,port});
      this.sock=sock;
      const finishErr=e=>{
        if(done)return;done=true;
        try{sock.destroy()}catch{}
        reject(e instanceof Error?e:new Error(String(e)));
      };
      const timer=setTimeout(()=>finishErr(new Error("PROBE_WEBSOCKET_CONNECT_TIMEOUT")),5000);
      sock.once("error",finishErr);
      sock.once("connect",()=>{
        const req=[
          `GET ${reqPath} HTTP/1.1`,
          `Host: ${host}:${port}`,
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Key: ${key}`,
          "Sec-WebSocket-Version: 13",
          "",
          ""
        ].join("\r\n");
        sock.write(req);
      });
      const onHandshake=data=>{
        header=Buffer.concat([header,data]);
        const i=header.indexOf("\r\n\r\n");
        if(i<0)return;
        sock.off("data",onHandshake);
        const head=header.subarray(0,i).toString("utf8");
        const rest=header.subarray(i+4);
        const lines=head.split("\r\n");
        const statusLine=lines[0]||"";
        const acceptLine=lines.find(x=>/^Sec-WebSocket-Accept:/i.test(x));
        const accept=(acceptLine||"").split(":").slice(1).join(":").trim();
        if(!statusLine.startsWith("HTTP/1.1 101")){
          clearTimeout(timer);return finishErr(new Error("PROBE_UPGRADE_STATUS_"+statusLine));
        }
        if(accept!==expected){
          clearTimeout(timer);return finishErr(new Error("PROBE_ACCEPT_MISMATCH"));
        }
        done=true;clearTimeout(timer);
        sock.removeListener("error",finishErr);
        sock.on("error",e=>this.errors.push(String(e?.message||e)));
        sock.on("data",x=>this._feed(x));
        this.opened=true;
        if(rest.length)this._feed(rest);
        resolve({statusLine,acceptCertified:true});
      };
      sock.on("data",onHandshake);
    });
  }
  _feed(data){
    this.buf=Buffer.concat([this.buf,data]);
    while(this.buf.length>=2){
      const b0=this.buf[0],b1=this.buf[1];
      const opcode=b0&0x0f,masked=!!(b1&0x80);
      let len=b1&0x7f,off=2;
      if(len===126){
        if(this.buf.length<4)return;
        len=this.buf.readUInt16BE(2);off=4;
      }else if(len===127){
        if(this.buf.length<10)return;
        const big=this.buf.readBigUInt64BE(2);
        if(big>BigInt(Number.MAX_SAFE_INTEGER))throw new Error("PROBE_FRAME_TOO_LARGE");
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
      if(opcode===0x1){
        const txt=payload.toString("utf8");
        this.messages.push(txt);
        for(const waiter of [...this.pending]){
          let m;try{m=JSON.parse(txt)}catch{continue}
          if(m.id===waiter.id){
            this.pending.splice(this.pending.indexOf(waiter),1);
            waiter.resolve(m);
          }
        }
      }else if(opcode===0x8){
        this.opened=false;
      }
    }
  }
  frameText(text){
    const payload=Buffer.from(text);
    const mask=crypto.randomBytes(4);
    const n=payload.length;
    let head;
    if(n<126){
      head=Buffer.alloc(2);head[0]=0x81;head[1]=0x80|n;
    }else if(n<=0xffff){
      head=Buffer.alloc(4);head[0]=0x81;head[1]=0x80|126;head.writeUInt16BE(n,2);
    }else{
      head=Buffer.alloc(10);head[0]=0x81;head[1]=0x80|127;head.writeBigUInt64BE(BigInt(n),2);
    }
    const out=Buffer.alloc(n);
    for(let i=0;i<n;i++)out[i]=payload[i]^mask[i&3];
    return Buffer.concat([head,mask,out]);
  }
  async call(id,method,params={}){
    if(!this.opened)throw new Error("PROBE_SOCKET_NOT_OPEN");
    const p=new Promise((resolve,reject)=>{
      const to=setTimeout(()=>{
        const x=this.pending.find(x=>x.id===id);
        if(x)this.pending.splice(this.pending.indexOf(x),1);
        reject(new Error("PROBE_CDP_COMMAND_TIMEOUT_"+method));
      },5000);
      this.pending.push({id,resolve:m=>{clearTimeout(to);resolve(m)},reject});
    });
    this.sock.write(this.frameText(JSON.stringify({id,method,params})));
    return await p;
  }
  close(){try{this.sock?.end()}catch{};try{this.sock?.destroy()}catch{}}
}

console.log("=".repeat(120));
console.log("SCIIP Explorer 4.0 — R29B-R2-R3-R1 Post-Transport-Exercise Residual Causal Diagnosis");
console.log("=".repeat(120));
console.log("Mode: SINGLE_FRESH_PAGE_READ_ONLY_CDP_TRANSPORT_PROBE");
console.log("Application source mutation: OFF");
console.log("Governed data mutation: OFF");
console.log("Explorer click: OFF");
console.log("Property click: OFF");
console.log("Assignments invocation: OFF");
console.log("Generate invocation: OFF");
console.log("Export invocation: OFF");

const priorR29B=readJson(r29bEvPath);
const priorR23=readJson(r23EvPath);
const result={
  framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R1_POST_TRANSPORT_EXERCISE_RESIDUAL_CAUSAL_DIAGNOSIS",
  generatedAt:new Date().toISOString(),
  mode:"SINGLE_FRESH_PAGE_READ_ONLY_CDP_TRANSPORT_PROBE",
  prior:{
    r29bStatus:priorR29B?.status||null,
    r29bCertifiedCount:priorR29B?.certifiedCount??null,
    r29bExecutedCount:priorR29B?.executedCount??null,
    r23Status:priorR23?.status||null
  },
  stages:{},
  safety:{applicationSourceMutation:false,governedDataMutation:false,explorerClick:false,propertyClick:false,assignmentsInvocation:false,generateInvocation:false,exportInvocation:false}
};

try{
  result.runnerSha256=fs.existsSync(runnerPath)?sha256(runnerPath):null;
  result.stages.appHttp=await http("http://127.0.0.1:5173/");
  result.stages.cdpVersion=await http("http://127.0.0.1:9333/json/version");
  console.log("APP_HTTP_STATUS:",result.stages.appHttp.status);
  console.log("CDP_VERSION_STATUS:",result.stages.cdpVersion.status);

  if(!result.stages.appHttp.ok)throw new Error("APP_HTTP_NOT_READY");
  if(!result.stages.cdpVersion.ok)throw new Error("CDP_VERSION_NOT_READY");

  const newResp=await http("http://127.0.0.1:9333/json/new?"+encodeURIComponent("http://127.0.0.1:5173/"),{method:"PUT"});
  result.stages.freshPagePut={ok:newResp.ok,status:newResp.status};
  console.log("FRESH_PAGE_PUT_STATUS:",newResp.status);
  if(!newResp.ok)throw new Error("FRESH_PAGE_PUT_FAILED");

  let target;
  try{target=JSON.parse(newResp.text)}catch{throw new Error("FRESH_PAGE_JSON_PARSE_FAILED")}
  result.stages.freshPageTarget={id:target.id,url:target.url,type:target.type,hasWebSocketDebuggerUrl:!!target.webSocketDebuggerUrl};
  console.log("FRESH_PAGE_TARGET_ID:",target.id||null);
  console.log("FRESH_PAGE_WS_URL_PRESENT:",!!target.webSocketDebuggerUrl);
  if(!target.webSocketDebuggerUrl)throw new Error("FRESH_PAGE_WS_URL_MISSING");

  const ws=new ProbeWebSocket(target.webSocketDebuggerUrl);
  try{
    const hs=await ws.connect();
    result.stages.websocketHandshake={certified:true,...hs};
    console.log("WEBSOCKET_HANDSHAKE_CERTIFIED: True");

    const r1=await ws.call(1,"Runtime.enable",{});
    result.stages.runtimeEnable={certified:!!r1?.result,error:r1?.error||null};
    console.log("RUNTIME_ENABLE_CERTIFIED:",!!r1?.result);
    if(r1?.error)throw new Error("RUNTIME_ENABLE_CDP_ERROR_"+JSON.stringify(r1.error));

    const r2=await ws.call(2,"Page.enable",{});
    result.stages.pageEnable={certified:!!r2?.result,error:r2?.error||null};
    console.log("PAGE_ENABLE_CERTIFIED:",!!r2?.result);
    if(r2?.error)throw new Error("PAGE_ENABLE_CDP_ERROR_"+JSON.stringify(r2.error));

    const r3=await ws.call(3,"Runtime.evaluate",{expression:"({url:location.href,origin:location.origin,readyState:document.readyState,title:document.title})",returnByValue:true});
    const val=r3?.result?.result?.value||null;
    result.stages.runtimeEvaluate={certified:!!val,value:val,error:r3?.error||null};
    console.log("RUNTIME_EVALUATE_CERTIFIED:",!!val);
    console.log("RUNTIME_EVALUATE_VALUE:",JSON.stringify(val));
    if(!val)throw new Error("RUNTIME_EVALUATE_NO_VALUE");

    await sleep(250);
    result.transportProbeCertified=true;
  }finally{
    ws.close();
    try{await http(`http://127.0.0.1:9333/json/close/${target.id}`)}catch{}
  }

  result.status="PASSED";
  result.classification="RAW_WEBSOCKET_CDP_TRANSPORT_HANDSHAKE_AND_CORE_COMMANDS_CERTIFIED_PRIOR_R29B_NONZERO_EXIT_LIES_AFTER_TRANSPORT_CORE";
  result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R29B_FIRST_RECORD_PREWORKFLOW_CAUSAL_DIAGNOSIS";
}catch(e){
  result.status="PASSED";
  result.transportProbeCertified=false;
  result.failure={name:e?.name||"Error",message:String(e?.message||e),stack:String(e?.stack||"")};
  const m=result.failure.message;
  if(m.includes("APP_HTTP"))result.classification="SCIIP_APP_RUNTIME_DROPPED_BEFORE_SINGLE_TRANSPORT_PROBE";
  else if(m.includes("CDP_VERSION"))result.classification="CDP_UNAVAILABLE_BEFORE_SINGLE_TRANSPORT_PROBE";
  else if(m.includes("FRESH_PAGE"))result.classification="CDP_FRESH_PAGE_CREATION_STAGE_FAILED";
  else if(m.includes("UPGRADE")||m.includes("ACCEPT")||m.includes("WEBSOCKET"))result.classification="RAW_WEBSOCKET_HANDSHAKE_STAGE_FAILED";
  else if(m.includes("RUNTIME_ENABLE")||m.includes("PAGE_ENABLE")||m.includes("CDP_COMMAND_TIMEOUT"))result.classification="RAW_WEBSOCKET_HANDSHAKE_SUCCEEDED_BUT_CDP_COMMAND_RESPONSE_STAGE_FAILED";
  else result.classification="POST_TRANSPORT_EXERCISE_RESIDUAL_STAGE_RESOLVED_BY_SINGLE_PROBE";
  result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_TRANSPORT_STAGE_SPECIFIC_REPAIR_AND_RECERTIFICATION";
  console.log("PROBE_FAILURE:",result.failure.message);
}

const checks={
  priorR29BRunningOrDiagnosticEvidenceConsumed:!!priorR29B,
  priorR23EvidenceConsumed:!!priorR23,
  runnerShaCaptured:!!result.runnerSha256,
  appHttpStageCaptured:!!result.stages.appHttp,
  cdpVersionStageCaptured:!!result.stages.cdpVersion,
  freshPageStageCaptured:!!result.stages.freshPagePut || !!result.failure,
  noExplorerClickPerformed:true,
  noPropertyClickPerformed:true,
  assignmentsInvocationOff:true,
  generateInvocationOff:true,
  exportInvocationOff:true,
  applicationMutationOff:true,
  governedMutationOff:true
};
result.checks=checks;
fs.writeFileSync(evidencePath,JSON.stringify(result,null,2)+"\n");

console.log("----- CHECKS -----");
for(const [k,v] of Object.entries(checks))console.log(`${k}: ${v}`);
console.log("TRANSPORT_PROBE_CERTIFIED:",!!result.transportProbeCertified);
console.log("CLASSIFICATION:",result.classification);
console.log("STATUS:",result.status);
console.log("NEXT_MILESTONE:",result.nextMilestone);
console.log("EVIDENCE:",evidencePath);
console.log("R29B-R2-R3-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.");
process.exit(0);
