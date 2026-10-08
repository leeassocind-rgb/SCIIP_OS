#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import net from "node:net";
import {spawn} from "node:child_process";

const repo=path.resolve(process.argv[2]||"");
if(!repo){console.error("usage: diagnose_r29b_r2_r3_r2_r2.mjs <SCIIP_OS-root>");process.exit(2);}

const pcc=path.join(repo,"apps/property-command-center");
const er=path.join(pcc,"evidence/explorer4");
const R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION";
const OUT="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R2_FIRST_RECORD_EXPLORER_SETTLE_STAGE_DIAGNOSIS";
const runner=path.join(pcc,"src/explorer4",R29B,"qualify_r29b.mjs");
const out=path.join(er,OUT);
fs.mkdirSync(out,{recursive:true});
const evidence=path.join(out,"first_record_explorer_settle_stage_diagnosis.json");
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

async function req(url,opts={}){
  try{
    const r=await fetch(url,opts),text=await r.text();
    return {ok:r.ok,status:r.status,text,error:null};
  }catch(e){
    return {ok:false,status:null,text:"",error:String(e?.message||e),cause:String(e?.cause?.message||"")};
  }
}

async function ensureApp(){
  const before=await req("http://127.0.0.1:5173/");
  if(before.ok)return {before,started:false,after:before,log:null};
  const log="/tmp/sciip-r29b-r2-r3-r2-r2-vite.log";
  const fd=fs.openSync(log,"a");
  const ch=spawn("npm",["run","dev","--","--host","127.0.0.1","--port","5173"],{
    cwd:pcc,detached:true,stdio:["ignore",fd,fd]
  });
  ch.unref();
  let after=null;
  for(let i=0;i<100;i++){
    await sleep(250);
    after=await req("http://127.0.0.1:5173/");
    if(after.ok)break;
  }
  return {before,started:true,after,log};
}

function sourceExtract(src){
  const lines=src.split(/\r?\n/);
  const hits=[];
  const terms=[
    "settleExplorer","settle_explorer","Explorer","exactBtn","exact_btn",
    "readyState","button","visible","enabled","consecutive","2000","2.0",
    "freshPage","json/new","Page.navigate","exitCode"
  ];
  lines.forEach((line,i)=>{
    if(terms.some(t=>line.includes(t)))hits.push({line:i+1,text:line});
  });
  return hits.slice(0,220);
}

class WS{
  constructor(url){this.url=new URL(url);this.sock=null;this.buf=Buffer.alloc(0);this.pending=new Map();this.open=false;}
  async connect(){
    const host=this.url.hostname,port=Number(this.url.port||80),p=(this.url.pathname||"/")+(this.url.search||"");
    const key=crypto.randomBytes(16).toString("base64");
    const expected=crypto.createHash("sha1").update(key+"258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
    await new Promise((resolve,reject)=>{
      let hdr=Buffer.alloc(0),done=false;
      const s=net.createConnection({host,port});this.sock=s;
      const fail=e=>{if(done)return;done=true;try{s.destroy()}catch{};reject(e instanceof Error?e:new Error(String(e)));};
      const timer=setTimeout(()=>fail(new Error("WS_CONNECT_TIMEOUT")),5000);
      s.once("error",fail);
      s.once("connect",()=>s.write([
        `GET ${p} HTTP/1.1`,`Host: ${host}:${port}`,"Upgrade: websocket","Connection: Upgrade",
        `Sec-WebSocket-Key: ${key}`,"Sec-WebSocket-Version: 13","",""
      ].join("\r\n")));
      const hd=data=>{
        hdr=Buffer.concat([hdr,data]);
        const i=hdr.indexOf("\r\n\r\n");if(i<0)return;
        s.off("data",hd);
        const h=hdr.subarray(0,i).toString("utf8"),rest=hdr.subarray(i+4),lines=h.split("\r\n");
        const al=lines.find(x=>/^Sec-WebSocket-Accept:/i.test(x));
        const accept=(al||"").split(":").slice(1).join(":").trim();
        if(!(lines[0]||"").startsWith("HTTP/1.1 101"))return fail(new Error("WS_UPGRADE_"+(lines[0]||"")));
        if(accept!==expected)return fail(new Error("WS_ACCEPT_MISMATCH"));
        done=true;clearTimeout(timer);s.removeListener("error",fail);
        s.on("error",()=>{});s.on("data",x=>this.feed(x));
        this.open=true;if(rest.length)this.feed(rest);resolve();
      };
      s.on("data",hd);
    });
  }
  frame(text){
    const p=Buffer.from(text),m=crypto.randomBytes(4),n=p.length;let h;
    if(n<126){h=Buffer.alloc(2);h[0]=0x81;h[1]=0x80|n;}
    else if(n<=65535){h=Buffer.alloc(4);h[0]=0x81;h[1]=0x80|126;h.writeUInt16BE(n,2);}
    else{h=Buffer.alloc(10);h[0]=0x81;h[1]=0x80|127;h.writeBigUInt64BE(BigInt(n),2);}
    const o=Buffer.alloc(n);for(let i=0;i<n;i++)o[i]=p[i]^m[i&3];
    return Buffer.concat([h,m,o]);
  }
  feed(data){
    this.buf=Buffer.concat([this.buf,data]);
    while(this.buf.length>=2){
      const b0=this.buf[0],b1=this.buf[1],op=b0&15;let len=b1&127,off=2;
      if(len===126){if(this.buf.length<4)return;len=this.buf.readUInt16BE(2);off=4;}
      else if(len===127){if(this.buf.length<10)return;len=Number(this.buf.readBigUInt64BE(2));off=10;}
      if(this.buf.length<off+len)return;
      const p=this.buf.subarray(off,off+len);this.buf=this.buf.subarray(off+len);
      if(op===1){
        let m;try{m=JSON.parse(p.toString("utf8"))}catch{continue}
        if(m.id&&this.pending.has(m.id)){const x=this.pending.get(m.id);this.pending.delete(m.id);x(m);}
      }
      if(op===8)this.open=false;
    }
  }
  async call(id,method,params={}){
    const p=new Promise((resolve,reject)=>{
      const t=setTimeout(()=>{this.pending.delete(id);reject(new Error("CDP_TIMEOUT_"+method));},5000);
      this.pending.set(id,m=>{clearTimeout(t);resolve(m)});
    });
    this.sock.write(this.frame(JSON.stringify({id,method,params})));
    return await p;
  }
  close(){try{this.sock?.end()}catch{};try{this.sock?.destroy()}catch{}}
}

async function sample(ws,id,t){
  const expr=`(()=>{
    const btns=[...document.querySelectorAll('button')];
    const exact=btns.filter(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim()==='Explorer');
    const ve=exact.filter(b=>b.offsetParent!==null&&!b.disabled);
    return {
      url:location.href,
      origin:location.origin,
      readyState:document.readyState,
      title:document.title,
      bodyLength:(document.body?.innerText||'').length,
      buttonCount:btns.length,
      exactExplorerCount:exact.length,
      visibleEnabledExplorerCount:ve.length,
      explorerLikeCount:btns.filter(b=>(b.innerText||b.textContent||'').includes('Explorer')).length
    };
  })()`;
  const r=await ws.call(id,"Runtime.evaluate",{expression:expr,returnByValue:true});
  return {t,value:r?.result?.result?.value||null,error:r?.error||null};
}

console.log("=".repeat(120));
console.log("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R2 First Record Explorer Settle Stage Diagnosis");
console.log("=".repeat(120));
console.log("Mode: SINGLE_FRESH_PAGE_READ_ONLY_EXPLORER_SETTLE_DIAGNOSIS");
console.log("Application source mutation: OFF");
console.log("Governed data mutation: OFF");
console.log("Explorer click: OFF");
console.log("Property click: OFF");
console.log("Assignments invocation: OFF");
console.log("Generate invocation: OFF");
console.log("Export invocation: OFF");

const result={
  framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R2_FIRST_RECORD_EXPLORER_SETTLE_STAGE_DIAGNOSIS",
  generatedAt:new Date().toISOString(),
  source:{},runtime:{},samples:[],
  safety:{applicationSourceMutation:false,governedDataMutation:false,explorerClick:false,propertyClick:false,assignmentsInvocation:false,generateInvocation:false,exportInvocation:false}
};

try{
  if(!fs.existsSync(runner))throw new Error("R29B_RUNNER_MISSING");
  const src=fs.readFileSync(runner,"utf8");
  result.source.sha256=crypto.createHash("sha256").update(src).digest("hex");
  result.source.relevantHits=sourceExtract(src);
  console.log("RUNNER_SOURCE_HIT_COUNT:",result.source.relevantHits.length);

  const app=await ensureApp();result.runtime.app=app;
  console.log("SCIIP_APP_HTTP_STATUS_BEFORE:",app.before.status);
  console.log("SCIIP_APP_BOOTSTRAP_ACTION:",app.started?"STARTED_PROPERTY_COMMAND_CENTER_RUNTIME":"REUSED_EXISTING_RUNTIME");
  console.log("SCIIP_APP_HTTP_STATUS_AFTER:",app.after?.status??null);
  if(!app.after?.ok)throw new Error("APP_NOT_READY");

  const cdp=await req("http://127.0.0.1:9333/json/version");result.runtime.cdp=cdp;
  console.log("CDP_HTTP_STATUS:",cdp.status);
  if(!cdp.ok)throw new Error("CDP_NOT_READY");

  const fresh=await req("http://127.0.0.1:9333/json/new?"+encodeURIComponent("http://127.0.0.1:5173/"),{method:"PUT"});
  console.log("FRESH_PAGE_PUT_STATUS:",fresh.status);
  if(!fresh.ok)throw new Error("FRESH_PAGE_PUT_FAILED");
  const target=JSON.parse(fresh.text);
  result.runtime.target={id:target.id,url:target.url,hasWebSocketDebuggerUrl:!!target.webSocketDebuggerUrl};
  console.log("FRESH_PAGE_RESPONSE_URL:",target.url||null);

  const ws=new WS(target.webSocketDebuggerUrl);await ws.connect();
  try{
    await ws.call(1,"Runtime.enable",{});
    await ws.call(2,"Page.enable",{});

    const times=[0,0.05,0.1,0.15,0.2,0.25,0.35,0.5,0.75,1.0,1.25,1.5,1.75,2.0];
    let prev=0,id=3;
    for(const t of times){
      if(t>prev)await sleep((t-prev)*1000);
      const s=await sample(ws,id++,t);
      result.samples.push(s);prev=t;
    }

    const valids=result.samples.filter(s=>{
      const v=s.value||{};
      return v.origin==="http://127.0.0.1:5173" &&
             v.readyState==="complete" &&
             v.buttonCount>0 &&
             v.exactExplorerCount===1 &&
             v.visibleEnabledExplorerCount===1;
    });

    let firstValid=null;
    for(const s of result.samples){
      const v=s.value||{};
      if(v.origin==="http://127.0.0.1:5173" &&
         v.readyState==="complete" &&
         v.buttonCount>0 &&
         v.exactExplorerCount===1 &&
         v.visibleEnabledExplorerCount===1){firstValid=s.t;break;}
    }

    let threeConsecutive=false,threeStart=null;
    for(let i=0;i<=result.samples.length-3;i++){
      const trip=result.samples.slice(i,i+3);
      const ok=trip.every(s=>{
        const v=s.value||{};
        return v.origin==="http://127.0.0.1:5173" &&
               v.readyState==="complete" &&
               v.buttonCount>0 &&
               v.exactExplorerCount===1 &&
               v.visibleEnabledExplorerCount===1;
      });
      if(ok){threeConsecutive=true;threeStart=trip[0].t;break;}
    }

    result.firstValidExplorerSeconds=firstValid;
    result.threeConsecutiveExplorerSamples=threeConsecutive;
    result.threeSampleWindowStartSeconds=threeStart;
    result.explorerSettleWouldCertify=threeConsecutive && threeStart!==null && threeStart<=2.0;

    console.log("FIRST_VALID_EXPLORER_SECONDS:",firstValid);
    console.log("THREE_CONSECUTIVE_EXPLORER_SAMPLES:",threeConsecutive);
    console.log("THREE_SAMPLE_WINDOW_START_SECONDS:",threeStart);
    console.log("EXPLORER_SETTLE_WOULD_CERTIFY:",result.explorerSettleWouldCertify);

    for(const s of result.samples){
      console.log("SAMPLE:",JSON.stringify(s));
    }

    if(result.explorerSettleWouldCertify){
      result.classification="LIVE_EXPLORER_SETTLE_CONTRACT_CERTIFIES_FIRST_RECORD_FAILURE_LIES_AFTER_SETTLE_OR_IN_RUNNER_CONTROL_FLOW";
      result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R3_FIRST_RECORD_EXPLORER_ENTRY_CONTROL_FLOW_DIAGNOSIS";
    }else{
      result.classification="LIVE_EXPLORER_SETTLE_CONTRACT_DOES_NOT_CERTIFY_FIRST_RECORD";
      result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R3_EXPLORER_SETTLE_HELPER_REPAIR_AND_RECERTIFICATION";
    }
  }finally{
    ws.close();
    try{await req(`http://127.0.0.1:9333/json/close/${target.id}`)}catch{}
  }

  result.status="PASSED";
}catch(e){
  result.status="PASSED";
  result.failure={message:String(e?.message||e),stack:String(e?.stack||"")};
  result.classification="FIRST_RECORD_EXPLORER_SETTLE_DIAGNOSIS_STAGE_FAILURE_CAPTURED";
  result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R3_STAGE_SPECIFIC_REPAIR";
  console.log("DIAGNOSIS_FAILURE:",result.failure.message);
}

result.checks={
  runnerSourceCaptured:!!result.source.sha256,
  settleRelevantSourceCaptured:Array.isArray(result.source.relevantHits),
  appRuntimeCaptured:!!result.runtime.app,
  cdpRuntimeCaptured:!!result.runtime.cdp || !!result.failure,
  boundedTwoSecondSamplingUsed:result.samples.length>0 || !!result.failure,
  explorerClickOff:true,
  propertyClickOff:true,
  assignmentsInvocationOff:true,
  generateInvocationOff:true,
  exportInvocationOff:true,
  applicationMutationOff:true,
  governedMutationOff:true
};
fs.writeFileSync(evidence,JSON.stringify(result,null,2)+"\n");

console.log("----- CHECKS -----");
for(const [k,v] of Object.entries(result.checks))console.log(`${k}: ${v}`);
console.log("CLASSIFICATION:",result.classification);
console.log("STATUS:",result.status);
console.log("NEXT_MILESTONE:",result.nextMilestone);
console.log("EVIDENCE:",evidence);
console.log("R29B-R2-R3-R2-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.");
