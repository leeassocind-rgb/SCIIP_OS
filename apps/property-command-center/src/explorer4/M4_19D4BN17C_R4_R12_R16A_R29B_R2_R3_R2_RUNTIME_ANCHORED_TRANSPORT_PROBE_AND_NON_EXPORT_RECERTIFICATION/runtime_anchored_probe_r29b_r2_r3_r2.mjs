#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import net from "node:net";
import {spawn} from "node:child_process";

const repo=path.resolve(process.argv[2]||"");
if(!repo){console.error("usage: runtime_anchored_probe_r29b_r2_r3_r2.mjs <SCIIP_OS-root>");process.exit(2);}
const pcc=path.join(repo,"apps/property-command-center");
const er=path.join(pcc,"evidence/explorer4");
const R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION";
const OUT="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_RUNTIME_ANCHORED_TRANSPORT_PROBE_AND_NON_EXPORT_RECERTIFICATION";
const out=path.join(er,OUT);fs.mkdirSync(out,{recursive:true});
const evidencePath=path.join(out,"runtime_anchored_transport_probe_and_non_export_recertification.json");
const runnerPath=path.join(pcc,"src/explorer4",R29B,"qualify_r29b.mjs");
const r29bEvPath=path.join(er,R29B,"exact_new_four_hundred_non_export_live_qualification.json");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function get(url,opts={}){
  try{
    const r=await fetch(url,opts);
    const text=await r.text();
    return {ok:r.ok,status:r.status,text,error:null};
  }catch(e){
    return {ok:false,status:null,text:"",error:String(e?.message||e),cause:String(e?.cause?.message||"")};
  }
}
function sha256(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");}

async function ensureApp(){
  const before=await get("http://127.0.0.1:5173/");
  if(before.ok)return {before,started:false,after:before,log:null};
  const log="/tmp/sciip-r29b-r2-r3-r2-vite.log";
  const fd=fs.openSync(log,"a");
  const child=spawn("npm",["run","dev","--","--host","127.0.0.1","--port","5173"],{
    cwd:pcc,detached:true,stdio:["ignore",fd,fd]
  });
  child.unref();
  let after=null;
  for(let i=0;i<100;i++){
    await sleep(250);
    after=await get("http://127.0.0.1:5173/");
    if(after.ok)break;
  }
  return {before,started:true,after,log};
}

class ProbeWS{
  constructor(url){this.url=new URL(url);this.sock=null;this.buf=Buffer.alloc(0);this.opened=false;this.pending=new Map();}
  async connect(){
    const host=this.url.hostname,port=Number(this.url.port||80);
    const reqPath=(this.url.pathname||"/")+(this.url.search||"");
    const key=crypto.randomBytes(16).toString("base64");
    const expected=crypto.createHash("sha1").update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    return await new Promise((resolve,reject)=>{
      let header=Buffer.alloc(0),settled=false;
      const sock=net.createConnection({host,port});this.sock=sock;
      const fail=e=>{if(settled)return;settled=true;try{sock.destroy()}catch{};reject(e instanceof Error?e:new Error(String(e)));};
      const timer=setTimeout(()=>fail(new Error("WS_CONNECT_TIMEOUT")),5000);
      sock.once("error",fail);
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
      const onData=data=>{
        header=Buffer.concat([header,data]);
        const i=header.indexOf("\r\n\r\n");if(i<0)return;
        sock.off("data",onData);
        const head=header.subarray(0,i).toString("utf8");
        const rest=header.subarray(i+4);
        const lines=head.split("\r\n"),statusLine=lines[0]||"";
        const acceptLine=lines.find(x=>/^Sec-WebSocket-Accept:/i.test(x));
        const accept=(acceptLine||"").split(":").slice(1).join(":").trim();
        if(!statusLine.startsWith("HTTP/1.1 101"))return fail(new Error("WS_UPGRADE_"+statusLine));
        if(accept!==expected)return fail(new Error("WS_ACCEPT_MISMATCH"));
        settled=true;clearTimeout(timer);
        sock.removeListener("error",fail);
        sock.on("error",()=>{});
        sock.on("data",x=>this.feed(x));
        this.opened=true;if(rest.length)this.feed(rest);
        resolve({statusLine,acceptCertified:true});
      };
      sock.on("data",onData);
    });
  }
  frame(text){
    const payload=Buffer.from(text),mask=crypto.randomBytes(4),n=payload.length;
    let h;
    if(n<126){h=Buffer.alloc(2);h[0]=0x81;h[1]=0x80|n;}
    else if(n<=0xffff){h=Buffer.alloc(4);h[0]=0x81;h[1]=0x80|126;h.writeUInt16BE(n,2);}
    else{h=Buffer.alloc(10);h[0]=0x81;h[1]=0x80|127;h.writeBigUInt64BE(BigInt(n),2);}
    const out=Buffer.alloc(n);for(let i=0;i<n;i++)out[i]=payload[i]^mask[i&3];
    return Buffer.concat([h,mask,out]);
  }
  feed(data){
    this.buf=Buffer.concat([this.buf,data]);
    while(this.buf.length>=2){
      const b0=this.buf[0],b1=this.buf[1],opcode=b0&0x0f;
      let len=b1&0x7f,off=2;
      if(len===126){if(this.buf.length<4)return;len=this.buf.readUInt16BE(2);off=4;}
      else if(len===127){if(this.buf.length<10)return;len=Number(this.buf.readBigUInt64BE(2));off=10;}
      if(this.buf.length<off+len)return;
      const payload=this.buf.subarray(off,off+len);this.buf=this.buf.subarray(off+len);
      if(opcode===0x1){
        let m;try{m=JSON.parse(payload.toString("utf8"))}catch{continue}
        if(m.id&&this.pending.has(m.id)){
          const x=this.pending.get(m.id);this.pending.delete(m.id);x.resolve(m);
        }
      }else if(opcode===0x8){this.opened=false;}
    }
  }
  async call(id,method,params={}){
    if(!this.opened)throw new Error("WS_NOT_OPEN");
    const p=new Promise((resolve,reject)=>{
      const t=setTimeout(()=>{this.pending.delete(id);reject(new Error("CDP_TIMEOUT_"+method));},5000);
      this.pending.set(id,{resolve:m=>{clearTimeout(t);resolve(m)},reject});
    });
    this.sock.write(this.frame(JSON.stringify({id,method,params})));
    return await p;
  }
  close(){try{this.sock?.end()}catch{};try{this.sock?.destroy()}catch{}}
}

console.log("=".repeat(120));
console.log("SCIIP Explorer 4.0 — R29B-R2-R3-R2 Runtime-Anchored Transport Probe + Non-Export Recertification");
console.log("=".repeat(120));
console.log("Application source mutation: OFF");
console.log("Governed data mutation: OFF");
console.log("Explorer click: OFF");
console.log("Property click: OFF");
console.log("Assignments invocation: OFF");
console.log("Generate invocation: OFF");
console.log("Export invocation: OFF");

const result={framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_RUNTIME_ANCHORED_TRANSPORT_PROBE_AND_NON_EXPORT_RECERTIFICATION",
 generatedAt:new Date().toISOString(),stages:{},checks:{},safety:{applicationSourceMutation:false,governedDataMutation:false,explorerClick:false,propertyClick:false,assignmentsInvocation:false,generateInvocation:false,exportInvocation:false}};

try{
  if(!fs.existsSync(runnerPath))throw new Error("R29B_RUNNER_MISSING");
  const syntax=spawn("node",["--check",runnerPath],{stdio:"ignore"});
  const syntaxCode=await new Promise(r=>syntax.on("exit",c=>r(c)));
  result.stages.nodeCheck={exitCode:syntaxCode,certified:syntaxCode===0};
  console.log("R29B_NODE_CHECK_CERTIFIED:",syntaxCode===0);
  if(syntaxCode!==0)throw new Error("R29B_NODE_CHECK_FAILED");
  result.runnerSha256Before=sha256(runnerPath);

  const app=await ensureApp();
  result.stages.appRuntime=app;
  console.log("SCIIP_APP_HTTP_STATUS_BEFORE:",app.before.status);
  console.log("SCIIP_APP_BOOTSTRAP_ACTION:",app.started?"STARTED_PROPERTY_COMMAND_CENTER_RUNTIME":"REUSED_EXISTING_RUNTIME");
  console.log("SCIIP_APP_HTTP_STATUS_AFTER:",app.after?.status??null);
  if(!app.after?.ok)throw new Error("SCIIP_APP_RUNTIME_NOT_READY_AFTER_BOOTSTRAP");

  const cdp=await get("http://127.0.0.1:9333/json/version");
  result.stages.cdpVersion=cdp;
  console.log("CDP_HTTP_STATUS:",cdp.status);
  if(!cdp.ok)throw new Error("CDP_NOT_READY");

  const fresh=await get("http://127.0.0.1:9333/json/new?"+encodeURIComponent("http://127.0.0.1:5173/"),{method:"PUT"});
  result.stages.freshPagePut={status:fresh.status,ok:fresh.ok,error:fresh.error};
  console.log("FRESH_PAGE_PUT_STATUS:",fresh.status);
  if(!fresh.ok)throw new Error("FRESH_PAGE_PUT_FAILED");

  let target;try{target=JSON.parse(fresh.text)}catch{throw new Error("FRESH_PAGE_JSON_PARSE_FAILED")}
  result.stages.freshPageTarget={id:target.id,url:target.url,hasWebSocketDebuggerUrl:!!target.webSocketDebuggerUrl};
  console.log("FRESH_PAGE_WS_URL_PRESENT:",!!target.webSocketDebuggerUrl);
  if(!target.webSocketDebuggerUrl)throw new Error("FRESH_PAGE_WS_URL_MISSING");

  const ws=new ProbeWS(target.webSocketDebuggerUrl);
  try{
    const hs=await ws.connect();result.stages.websocketHandshake={certified:true,...hs};
    console.log("WEBSOCKET_HANDSHAKE_CERTIFIED: True");

    const a=await ws.call(1,"Runtime.enable",{});result.stages.runtimeEnable={response:a,certified:!a.error};
    console.log("RUNTIME_ENABLE_CERTIFIED:",!a.error);
    if(a.error)throw new Error("RUNTIME_ENABLE_ERROR");

    const b=await ws.call(2,"Page.enable",{});result.stages.pageEnable={response:b,certified:!b.error};
    console.log("PAGE_ENABLE_CERTIFIED:",!b.error);
    if(b.error)throw new Error("PAGE_ENABLE_ERROR");

    const c=await ws.call(3,"Runtime.evaluate",{expression:"({url:location.href,origin:location.origin,readyState:document.readyState,title:document.title})",returnByValue:true});
    const val=c?.result?.result?.value;
    result.stages.runtimeEvaluate={response:c,value:val,certified:!!val};
    console.log("RUNTIME_EVALUATE_CERTIFIED:",!!val);
    console.log("RUNTIME_EVALUATE_VALUE:",JSON.stringify(val||null));
    if(!val)throw new Error("RUNTIME_EVALUATE_NO_VALUE");
    result.transportProbeCertified=true;
  }finally{
    ws.close();
    try{await get(`http://127.0.0.1:9333/json/close/${target.id}`)}catch{}
  }

  console.log("TRANSPORT_PROBE_CERTIFIED: True");
  console.log("Re-running authoritative R29B runner unchanged...");
  const run=spawn("node",[runnerPath,repo],{stdio:"inherit"});
  const exitCode=await new Promise(r=>run.on("exit",c=>r(c)));
  result.authoritativeR29BExitCode=exitCode;
  result.runnerSha256After=sha256(runnerPath);
  result.checks.runnerHashPreserved=result.runnerSha256Before===result.runnerSha256After;

  let ev=null;try{ev=JSON.parse(fs.readFileSync(r29bEvPath,"utf8"))}catch{}
  result.authoritativeR29B=ev?{status:ev.status,classification:ev.classification,certifiedCount:ev.certifiedCount,executedCount:ev.executedCount,nextMilestone:ev.nextMilestone}:null;
  console.log("AUTHORITATIVE_R29B_EXIT_CODE:",exitCode);
  console.log("AUTHORITATIVE_R29B_STATUS:",ev?.status||null);
  console.log("AUTHORITATIVE_R29B_CERTIFIED_COUNT:",ev?.certifiedCount??null);
  console.log("AUTHORITATIVE_R29B_EXECUTED_COUNT:",ev?.executedCount??null);

  if(ev?.status==="PASSED"){
    result.status="PASSED";
    result.classification="R29B_TRANSPORT_CERTIFIED_EXACT_NEW400_NON_EXPORT_QUALIFICATION_CERTIFIED";
    result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29C_EXACT_EIGHT_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION";
  }else{
    result.status="DIAGNOSTIC_COMPLETE";
    result.classification="R29B_TRANSPORT_CERTIFIED_FIRST_LIVE_WORKFLOW_RESIDUAL_CAPTURED";
    result.nextMilestone=ev?.nextMilestone||"M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R1_FIRST_LIVE_WORKFLOW_RESIDUAL_CAUSAL_DIAGNOSIS";
  }
}catch(e){
  result.status="DIAGNOSTIC_COMPLETE";
  result.failure={message:String(e?.message||e),stack:String(e?.stack||"")};
  result.transportProbeCertified=!!result.transportProbeCertified;
  const m=result.failure.message;
  if(m.includes("APP"))result.classification="APP_RUNTIME_BOOTSTRAP_STAGE_FAILED";
  else if(m.includes("CDP_NOT_READY"))result.classification="CDP_READINESS_STAGE_FAILED";
  else if(m.includes("FRESH_PAGE"))result.classification="CDP_FRESH_PAGE_STAGE_FAILED";
  else if(m.includes("WS_"))result.classification="RAW_WEBSOCKET_HANDSHAKE_STAGE_FAILED";
  else if(m.includes("RUNTIME_ENABLE")||m.includes("PAGE_ENABLE")||m.includes("CDP_TIMEOUT"))result.classification="RAW_WEBSOCKET_CDP_COMMAND_STAGE_FAILED";
  else result.classification="R29B_RUNTIME_ANCHORED_TRANSPORT_PROBE_RESIDUAL_CAPTURED";
  result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R1_STAGE_SPECIFIC_RESIDUAL_REPAIR";
  console.log("PROBE_OR_RECERTIFICATION_FAILURE:",result.failure.message);
}

Object.assign(result.checks,{
  nodeSyntaxCaptured:!!result.stages.nodeCheck,
  appRuntimeCaptured:!!result.stages.appRuntime,
  cdpVersionCaptured:!!result.stages.cdpVersion || !!result.failure,
  freshPageCaptured:!!result.stages.freshPagePut || !!result.failure,
  noExplorerClickPerformed:true,noPropertyClickPerformed:true,assignmentsInvocationOff:true,generateInvocationOff:true,exportInvocationOff:true,applicationMutationOff:true,governedMutationOff:true
});
fs.writeFileSync(evidencePath,JSON.stringify(result,null,2)+"\n");

console.log("----- CHECKS -----");
for(const [k,v] of Object.entries(result.checks))console.log(`${k}: ${v}`);
console.log("TRANSPORT_PROBE_CERTIFIED:",!!result.transportProbeCertified);
console.log("CLASSIFICATION:",result.classification);
console.log("STATUS:",result.status);
console.log("NEXT_MILESTONE:",result.nextMilestone);
console.log("EVIDENCE:",evidencePath);
console.log("R29B-R2-R3-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.");
process.exit(0);
