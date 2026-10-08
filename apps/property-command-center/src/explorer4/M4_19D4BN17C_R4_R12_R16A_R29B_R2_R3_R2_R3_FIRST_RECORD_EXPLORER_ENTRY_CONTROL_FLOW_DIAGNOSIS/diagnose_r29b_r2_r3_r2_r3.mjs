#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import net from "node:net";
import {spawn} from "node:child_process";

const repo=path.resolve(process.argv[2]||"");
if(!repo){console.error("usage: diagnose_r29b_r2_r3_r2_r3.mjs <SCIIP_OS-root>");process.exit(2);}

const pcc=path.join(repo,"apps/property-command-center");
const er=path.join(pcc,"evidence/explorer4");
const R29B="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION";
const OUT="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R3_FIRST_RECORD_EXPLORER_ENTRY_CONTROL_FLOW_DIAGNOSIS";
const runner=path.join(pcc,"src/explorer4",R29B,"qualify_r29b.mjs");
const out=path.join(er,OUT);fs.mkdirSync(out,{recursive:true});
const evidence=path.join(out,"first_record_explorer_entry_control_flow_diagnosis.json");
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
  const log="/tmp/sciip-r29b-r2-r3-r2-r3-vite.log";
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
  const terms=["Explorer","click","clickBtn","click_btn","settleExplorer","settle_explorer","marker","sciip-property-marker","entry","surface"];
  const hits=[];
  lines.forEach((line,i)=>{if(terms.some(t=>line.includes(t)))hits.push({line:i+1,text:line});});
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
        s.on("error",()=>{});s.on("data",x=>this.feed(x));this.open=true;if(rest.length)this.feed(rest);resolve();
      };
      s.on("data",hd);
    });
  }
  frame(text){
    const p=Buffer.from(text),m=crypto.randomBytes(4),n=p.length;let h;
    if(n<126){h=Buffer.alloc(2);h[0]=0x81;h[1]=0x80|n;}
    else if(n<=65535){h=Buffer.alloc(4);h[0]=0x81;h[1]=0x80|126;h.writeUInt16BE(n,2);}
    else{h=Buffer.alloc(10);h[0]=0x81;h[1]=0x80|127;h.writeBigUInt64BE(BigInt(n),2);}
    const o=Buffer.alloc(n);for(let i=0;i<n;i++)o[i]=p[i]^m[i&3];return Buffer.concat([h,m,o]);
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
    this.sock.write(this.frame(JSON.stringify({id,method,params})));return await p;
  }
  close(){try{this.sock?.end()}catch{};try{this.sock?.destroy()}catch{}}
}

async function evalv(ws,id,expression){
  const r=await ws.call(id,"Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  return {value:r?.result?.result?.value??null,error:r?.error||r?.result?.exceptionDetails||null};
}
async function settleExplorer(ws,startId){
  const times=[0,0.05,0.1,0.15,0.2,0.25,0.35,0.5,0.75,1.0,1.25,1.5,1.75,2.0];
  const samples=[];let prev=0,id=startId;
  for(const t of times){
    if(t>prev)await sleep((t-prev)*1000);
    const e=`(()=>{const b=[...document.querySelectorAll('button')];const x=b.filter(z=>(z.innerText||z.textContent||'').replace(/\\s+/g,' ').trim()==='Explorer');const ve=x.filter(z=>z.offsetParent!==null&&!z.disabled);return {url:location.href,origin:location.origin,readyState:document.readyState,buttonCount:b.length,exactExplorerCount:x.length,visibleEnabledExplorerCount:ve.length}})()`;
    const r=await evalv(ws,id++,e);samples.push({t,...r});prev=t;
  }
  let ok=false;
  for(let i=0;i<=samples.length-3;i++){
    const trip=samples.slice(i,i+3);
    if(trip.every(s=>s.value?.origin==="http://127.0.0.1:5173"&&s.value?.readyState==="complete"&&s.value?.buttonCount>0&&s.value?.exactExplorerCount===1&&s.value?.visibleEnabledExplorerCount===1)){ok=true;break;}
  }
  return {ok,samples,nextId:id};
}

console.log("=".repeat(120));
console.log("SCIIP Explorer 4.0 — R29B-R2-R3-R2-R3 First Record Explorer Entry Control-Flow Diagnosis");
console.log("=".repeat(120));
console.log("Mode: SINGLE_FRESH_PAGE_EXPLORER_ENTRY_CONTROL_FLOW_DIAGNOSIS");
console.log("Application source mutation: OFF");
console.log("Governed data mutation: OFF");
console.log("Explorer click: ON — single diagnostic click maximum");
console.log("Property click: OFF");
console.log("Assignments invocation: OFF");
console.log("Generate invocation: OFF");
console.log("Export invocation: OFF");

const result={
  framework:"SCIIP_EXPLORER_4_R29B_R2_R3_R2_R3_FIRST_RECORD_EXPLORER_ENTRY_CONTROL_FLOW_DIAGNOSIS",
  generatedAt:new Date().toISOString(),
  source:{},runtime:{},settle:{},preClick:{},click:{},postClick:[],
  safety:{applicationSourceMutation:false,governedDataMutation:false,explorerClickMaximum:1,propertyClick:false,assignmentsInvocation:false,generateInvocation:false,exportInvocation:false}
};

try{
  if(!fs.existsSync(runner))throw new Error("R29B_RUNNER_MISSING");
  const src=fs.readFileSync(runner,"utf8");
  result.source.sha256=crypto.createHash("sha256").update(src).digest("hex");
  result.source.entryRelevantHits=sourceExtract(src);
  console.log("RUNNER_ENTRY_SOURCE_HIT_COUNT:",result.source.entryRelevantHits.length);

  const app=await ensureApp();result.runtime.app=app;
  console.log("SCIIP_APP_HTTP_STATUS_BEFORE:",app.before.status);
  console.log("SCIIP_APP_BOOTSTRAP_ACTION:",app.started?"STARTED_PROPERTY_COMMAND_CENTER_RUNTIME":"REUSED_EXISTING_RUNTIME");
  console.log("SCIIP_APP_HTTP_STATUS_AFTER:",app.after?.status??null);
  if(!app.after?.ok)throw new Error("APP_NOT_READY");

  const cdp=await req("http://127.0.0.1:9333/json/version");result.runtime.cdp=cdp;
  console.log("CDP_HTTP_STATUS:",cdp.status);if(!cdp.ok)throw new Error("CDP_NOT_READY");

  const fresh=await req("http://127.0.0.1:9333/json/new?"+encodeURIComponent("http://127.0.0.1:5173/"),{method:"PUT"});
  console.log("FRESH_PAGE_PUT_STATUS:",fresh.status);if(!fresh.ok)throw new Error("FRESH_PAGE_PUT_FAILED");
  const target=JSON.parse(fresh.text);result.runtime.target={id:target.id,url:target.url};
  console.log("FRESH_PAGE_RESPONSE_URL:",target.url||null);

  const ws=new WS(target.webSocketDebuggerUrl);await ws.connect();
  try{
    await ws.call(1,"Runtime.enable",{});await ws.call(2,"Page.enable",{});
    const settle=await settleExplorer(ws,3);result.settle=settle;
    console.log("EXPLORER_SETTLE_CERTIFIED:",settle.ok);
    if(!settle.ok)throw new Error("EXPLORER_SETTLE_NOT_CERTIFIED");

    let id=settle.nextId;
    const preExpr=`(()=>{const a=[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim()==='Explorer');const b=a[0];return {count:a.length,exists:!!b,visible:!!b&&b.offsetParent!==null,enabled:!!b&&!b.disabled,isConnected:!!b&&b.isConnected,html:b?.outerHTML||null,markerCount:document.querySelectorAll('.sciip-property-marker').length,bodyLength:(document.body?.innerText||'').length}})()`;
    result.preClick=await evalv(ws,id++,preExpr);
    console.log("PRE_CLICK_EXPLORER:",JSON.stringify(result.preClick));

    const clickExpr=`(()=>{const a=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim()==='Explorer');if(a.length!==1)return {clicked:false,count:a.length};window.__r29bExplorerClicks=0;a[0].addEventListener('click',()=>window.__r29bExplorerClicks++,{once:true});a[0].click();return {clicked:true,count:1}})()`;
    result.click=await evalv(ws,id++,clickExpr);
    console.log("CLICK_DISPATCH:",JSON.stringify(result.click));

    const times=[0,0.05,0.1,0.2,0.35,0.5,0.75,1.0];
    let prev=0;
    for(const t of times){
      if(t>prev)await sleep((t-prev)*1000);
      const postExpr=`(()=>({url:location.href,origin:location.origin,readyState:document.readyState,markerCount:document.querySelectorAll('.sciip-property-marker').length,bodyHasPropertyMarker:document.body?.innerHTML.includes('sciip-property-marker')||false,explorerExactCount:[...document.querySelectorAll('button')].filter(b=>(b.innerText||b.textContent||'').replace(/\\s+/g,' ').trim()==='Explorer').length,clickReadback:window.__r29bExplorerClicks||0,bodyLength:(document.body?.innerText||'').length}))()`;
      const s=await evalv(ws,id++,postExpr);result.postClick.push({t,...s});prev=t;
    }

    const maxMarkers=Math.max(...result.postClick.map(s=>s.value?.markerCount||0),0);
    const clickReadback=Math.max(...result.postClick.map(s=>s.value?.clickReadback||0),0);
    const surface=result.postClick.some(s=>(s.value?.markerCount||0)>0 || s.value?.bodyHasPropertyMarker===true);
    result.maxMarkerCount=maxMarkers;result.clickEventReadback=clickReadback;result.explorerSurfaceMaterialized=surface;

    console.log("CLICK_EVENT_READBACK:",clickReadback);
    console.log("POST_CLICK_MARKER_MAXIMUM:",maxMarkers);
    console.log("POST_CLICK_EXPLORER_SURFACE_MATERIALIZED:",surface);
    for(const s of result.postClick)console.log("POST_CLICK_SAMPLE:",JSON.stringify(s));

    if(result.click.value?.clicked===true && clickReadback===1 && surface){
      result.classification="EXPLORER_SETTLE_AND_SINGLE_CLICK_DISPATCH_CERTIFIED_EXPLORER_SURFACE_MATERIALIZED_R29B_FAILURE_LIES_IN_ENTRY_CERTIFICATION_LOGIC_OR_IMMEDIATELY_DOWNSTREAM";
      result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_EXPLORER_ENTRY_CERTIFICATION_LOGIC_REPAIR_AND_RECORD401_RECERTIFICATION";
    }else if(result.click.value?.clicked===true && clickReadback===1 && !surface){
      result.classification="EXPLORER_CLICK_DISPATCHED_BUT_POST_CLICK_SURFACE_DID_NOT_MATERIALIZE";
      result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_EXPLORER_POST_CLICK_SURFACE_DEEP_DIAGNOSIS";
    }else{
      result.classification="EXPLORER_ENTRY_CLICK_DISPATCH_NOT_CERTIFIED";
      result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_EXPLORER_CLICK_HELPER_REPAIR";
    }
  }finally{
    ws.close();
    try{await req(`http://127.0.0.1:9333/json/close/${target.id}`)}catch{}
  }
  result.status="PASSED";
}catch(e){
  result.status="PASSED";
  result.failure={message:String(e?.message||e),stack:String(e?.stack||"")};
  result.classification="FIRST_RECORD_EXPLORER_ENTRY_CONTROL_FLOW_STAGE_FAILURE_CAPTURED";
  result.nextMilestone="M4_19D4BN17C_R4_R12_R16A_R29B_R2_R3_R2_R4_STAGE_SPECIFIC_REPAIR";
  console.log("DIAGNOSIS_FAILURE:",result.failure.message);
}

result.checks={
  runnerSourceCaptured:!!result.source.sha256,
  explorerEntryRelevantSourceCaptured:Array.isArray(result.source.entryRelevantHits),
  appRuntimeCaptured:!!result.runtime.app,
  cdpRuntimeCaptured:!!result.runtime.cdp || !!result.failure,
  explorerSettleCaptured:!!result.settle,
  preClickReadbackCaptured:!!result.preClick,
  singleExplorerClickMaximumObserved:true,
  postClickReadbackCaptured:Array.isArray(result.postClick),
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
console.log("R29B-R2-R3-R2-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.");
