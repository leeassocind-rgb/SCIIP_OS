#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

import net from "node:net";
const repo=path.resolve(process.argv[2]||"");
if(!repo){console.error("usage: qualify_r29b.mjs <SCIIP_OS-root>");process.exit(2);}
const pcc=path.join(repo,"apps/property-command-center");
const er=path.join(pcc,"evidence/explorer4");
const R1R7="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R7_REFERENCE400_DOWNSTREAM_COHORT_REQUALIFICATION";
const OUT="M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION";
const out=path.join(er,OUT); fs.mkdirSync(out,{recursive:true});
const evidencePath=path.join(out,"exact_new_four_hundred_non_export_live_qualification.json");
const targetPath=path.join(er,R1R7,"exact_new_four_hundred_candidates_requalified.json");
const r1r7Path=path.join(er,R1R7,"reference400_downstream_cohort_requalification.json");

const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const norm=s=>String(s??"").toLowerCase().replace(/\s+/g," ").trim();
const cleanAddress=s=>norm(s).replace(/^select\s+/,"").split("|")[0].trim();
const sfFromKey=s=>{const m=norm(s).match(/\|(\d{3,})$/);return m?Number(m[1]):null;};
const sfFromText=s=>{const m=String(s??"").replace(/,/g,"").match(/(\d{3,})\s*SF/i);return m?Number(m[1]):null;};
const sha256=p=>crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

function readJson(p){return JSON.parse(fs.readFileSync(p,"utf8"));}
async function httpJson(url,options={}){
  const r=await fetch(url,options);
  if(!r.ok) throw new Error(`${options.method||"GET"} ${url} -> ${r.status}`);
  const t=await r.text(); return t?JSON.parse(t):{};
}
async function httpOk(url){
  // R29B-R2-R3-R2-R4-R3: bounded Node-20-safe HTTP preflight.
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),2000);
  try{
    const r=await fetch(url,{
      method:'GET',
      signal:controller.signal,
      cache:'no-store'
    });
    return !!r && r.ok===true;
  }catch(_e){
    return false;
  }finally{
    clearTimeout(timeout);
  }
}


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
        if(!String(lines[0]||"").startsWith("HTTP/1.1 101"))return fail(new Error("raw websocket upgrade failed: "+(lines[0]||"")));
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

class CDP {
  constructor(wsUrl){this.wsUrl=wsUrl;this.ws=null;this.id=0;this.pending=new Map();this.events=[];}
  async open(){
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
  }
  _onData(chunk){
    if(!chunk||!chunk.length)return;
    this.__r29bRxBuffer=Buffer.concat([this.__r29bRxBuffer||Buffer.alloc(0),Buffer.from(chunk)]);
    while(this.__r29bRxBuffer.length>=2){
      const b=this.__r29bRxBuffer;
      const b0=b[0], b1=b[1];
      const fin=(b0&0x80)!==0, opcode=b0&0x0f, masked=(b1&0x80)!==0;
      let len=b1&0x7f, off=2;
      if(len===126){
        if(b.length<4)return;
        len=b.readUInt16BE(2); off=4;
      }else if(len===127){
        if(b.length<10)return;
        const n=b.readBigUInt64BE(2);
        if(n>BigInt(Number.MAX_SAFE_INTEGER))throw new Error('CDP_FRAME_TOO_LARGE');
        len=Number(n); off=10;
      }
      let mask=null;
      if(masked){
        if(b.length<off+4)return;
        mask=b.subarray(off,off+4); off+=4;
      }
      if(b.length<off+len)return;
      let payload=Buffer.from(b.subarray(off,off+len));
      this.__r29bRxBuffer=b.subarray(off+len);
      if(mask)for(let i=0;i<payload.length;i++)payload[i]^=mask[i&3];

      if(opcode===0x8){
        try{this.socket?.end();}catch{}
        continue;
      }
      if(opcode===0x9){
        const m=crypto.randomBytes(4);
        let h;
        if(payload.length<126){
          h=Buffer.alloc(2); h[0]=0x8a; h[1]=0x80|payload.length;
        }else{
          h=Buffer.alloc(4); h[0]=0x8a; h[1]=0x80|126; h.writeUInt16BE(payload.length,2);
        }
        const q=Buffer.alloc(payload.length);
        for(let i=0;i<payload.length;i++)q[i]=payload[i]^m[i&3];
        this.socket.write(Buffer.concat([h,m,q]));
        continue;
      }
      if(opcode!==0x1 && opcode!==0x0)continue;

      if(opcode===0x1)this.__r29bTextParts=[];
      this.__r29bTextParts=this.__r29bTextParts||[];
      this.__r29bTextParts.push(payload);
      if(!fin)continue;
      const text=Buffer.concat(this.__r29bTextParts).toString('utf8');
      this.__r29bTextParts=[];
      let msg;
      try{msg=JSON.parse(text);}catch{continue;}
      if(msg&&msg.id!=null&&this.pending.has(msg.id)){
        const p=this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if(msg.error)p.reject(new Error('CDP '+(msg.error.message||JSON.stringify(msg.error))));
        else p.resolve(msg.result);
      }
    }
  }

  call(method,params={}){
    const id=++this.id;
    return new Promise((resolve,reject)=>{
      this.pending.set(id,{resolve,reject});
      {
        const __r29bPayload=Buffer.from(JSON.stringify({id,method,params}),"utf8");
        const __r29bMask=crypto.randomBytes(4);
        let __r29bHeader;
        if(__r29bPayload.length<126){
          __r29bHeader=Buffer.alloc(2); __r29bHeader[0]=0x81; __r29bHeader[1]=0x80|__r29bPayload.length;
        }else if(__r29bPayload.length<=0xffff){
          __r29bHeader=Buffer.alloc(4); __r29bHeader[0]=0x81; __r29bHeader[1]=0x80|126; __r29bHeader.writeUInt16BE(__r29bPayload.length,2);
        }else{
          __r29bHeader=Buffer.alloc(10); __r29bHeader[0]=0x81; __r29bHeader[1]=0x80|127; __r29bHeader.writeBigUInt64BE(BigInt(__r29bPayload.length),2);
        }
        const __r29bMasked=Buffer.alloc(__r29bPayload.length);
        for(let __r29bI=0;__r29bI<__r29bPayload.length;__r29bI++) __r29bMasked[__r29bI]=__r29bPayload[__r29bI]^__r29bMask[__r29bI&3];
        this.socket.write(Buffer.concat([__r29bHeader,__r29bMask,__r29bMasked]));
      }
      setTimeout(()=>{if(this.pending.has(id)){this.pending.delete(id);reject(new Error(`CDP timeout ${method}`));}},10000);
    });
  }
  async eval(expression){
    const r=await this.call("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails) throw new Error("Runtime.evaluate exception");
    return r.result?.value;
  }
  close(){try{this.ws?.close()}catch{}}
}

async function createFreshPage(){
  const u="http://127.0.0.1:9333/json/new?"+encodeURIComponent("http://127.0.0.1:5173/");
  const t=await httpJson(u,{method:"PUT"});
  if(!t.webSocketDebuggerUrl) throw new Error("fresh CDP page missing websocket URL");
  const c=new CDP(t.webSocketDebuggerUrl);
  const R29B_R5_CDP_OPEN_BOUND_MS=2000;
  let __r29b_r5_open_timer=null;
  try{
    await Promise.race([
      c.open(),
      new Promise((_,reject)=>{
        __r29b_r5_open_timer=setTimeout(
          ()=>reject(new Error("R29B_CDP_OPEN_TIMEOUT_2000MS")),
          R29B_R5_CDP_OPEN_BOUND_MS
        );
      })
    ]);
  }finally{
    if(__r29b_r5_open_timer!==null)clearTimeout(__r29b_r5_open_timer);
  }
  await c.call("Runtime.enable"); await c.call("Page.enable");
  return {target:t,cdp:c};
}
async function closePage(target,cdp){
  cdp.close();
  try{await fetch(`http://127.0.0.1:9333/json/close/${target.id}`)}catch{}
}

async function waitUntil(fn,maxMs=5000,step=80){
  const start=Date.now();
  while(Date.now()-start<=maxMs){
    try{const v=await fn();if(v)return v;}catch{}
    await sleep(step);
  }
  return null;
}
async function bodySnapshot(cdp){
  return await cdp.eval(`(()=>({url:location.href,origin:location.origin,readyState:document.readyState,
    body:(document.body?.innerText||""),buttons:[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null).map(b=>(b.innerText||b.textContent||"").replace(/\\s+/g," ").trim()),
    markerCount:document.querySelectorAll('.sciip-property-marker').length}))()`);
}
async function settleHome(cdp){
  let consecutive=0;
  const start=Date.now();
  while(Date.now()-start<=5000){
    const s=await cdp.eval(`(()=>({r:document.readyState,b:document.querySelectorAll('button').length,o:location.origin,
      e:[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&((b.innerText||b.textContent||"").replace(/\\s+/g," ").trim()==="Explorer")).length}))()`);
    if(s?.r==="complete" && s?.b>0 && s?.o==="http://127.0.0.1:5173" && s?.e===1) consecutive++; else consecutive=0;
    if(consecutive>=3)return true;
    await sleep(80);
  }
  return false;
}
async function clickExactButton(cdp,label){
  return await cdp.eval(`(()=>{const n=${JSON.stringify(label)},a=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&((b.innerText||b.textContent||"").replace(/\\s+/g," ").trim()===n));if(a.length!==1)return {clicked:false,count:a.length};a[0].click();return {clicked:true,count:1};})()`);
}
async function enterExplorer(cdp){
  const r=await clickExactButton(cdp,"Explorer");
  if(!r?.clicked)return false;
  return !!(await waitUntil(()=>cdp.eval(`document.querySelectorAll('.sciip-property-marker').length>=800`),3000,80));
}
async function bindAndSelect(cdp,target){
  const sk=String(target.selectionKey||target.key||target.label||"");
  const addr=cleanAddress(sk || target.label);
  const wantSf=sfFromKey(sk) ?? (Number(target.sf||0) || null);
  const payload=await cdp.eval(`(()=>{const addr=${JSON.stringify(addr)},wantSf=${JSON.stringify(wantSf)};
    const norm=s=>String(s||"").toLowerCase().replace(/\\s+/g," ").trim();
    const sf=t=>{const m=String(t||"").replace(/,/g,"").match(/(\\d{3,})\\s*SF\\b/i);return m?Number(m[1]):null;};
    const ms=[...document.querySelectorAll('.sciip-property-marker')].filter(el=>el.offsetParent!==null).map((el,i)=>{
      const aria=norm(el.getAttribute('aria-label')||"").replace(/^select\\s+/,"");
      const text=norm(el.innerText||el.textContent||"");
      return {i,aria,text,sf:sf(el.innerText||el.textContent||""),el};
    });
    let a=ms.filter(x=>x.aria===addr || x.aria.startsWith(addr+"|"));
    if(wantSf)a=a.filter(x=>x.sf===wantSf);
    if(a.length!==1){
      a=ms.filter(x=>(x.aria.includes(addr)||x.text.includes(addr)) && (!wantSf||x.sf===wantSf));
    }
    if(a.length!==1)return {selected:false,count:a.length,addr,wantSf,candidates:a.slice(0,8).map(x=>({aria:x.aria,sf:x.sf}))};
    a[0].el.click();return {selected:true,count:1,addr,wantSf};
  })()`);
  if(!payload?.selected)return payload;
  const ok=await waitUntil(()=>cdp.eval(`(()=>{const t=${JSON.stringify(addr)};return (document.body?.innerText||"").toLowerCase().includes(t)})()`),2000,80);
  return {...payload,settled:!!ok};
}
async function enterAssignments(cdp){
  const r=await clickExactButton(cdp,"Assignments");
  if(!r?.clicked)return false;
  return !!(await waitUntil(()=>cdp.eval(`(()=>{const t=(document.body?.innerText||"");return t.includes("Generate Client Listing Report")||t.includes("Client Listing Report")})()`),2500,80));
}
async function generateReport(cdp){
  let r=await clickExactButton(cdp,"Generate Client Listing Report");
  if(!r?.clicked){
    const alt=await cdp.eval(`(()=>{const a=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&/Generate.*Client Listing Report/i.test((b.innerText||b.textContent||"").replace(/\\s+/g," ").trim()));if(a.length!==1)return {clicked:false,count:a.length};a[0].click();return {clicked:true,count:1};})()`);
    r=alt;
  }
  if(!r?.clicked)return false;
  return !!(await waitUntil(()=>cdp.eval(`(()=>{const t=(document.body?.innerText||"");return t.includes("Download Client Listing Report")})()`),3000,80));
}
async function certifyDownload(cdp){
  return await cdp.eval(`(()=>{const a=[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&((b.innerText||b.textContent||"").replace(/\\s+/g," ").trim()==="Download Client Listing Report"));return {count:a.length,certified:a.length===1};})()`);
}
function exportHandlerSourceContract(){
  const exts=new Set([".js",".jsx",".ts",".tsx"]);
  let hasHandler=false,hasLabel=false;
  function walk(dir){
    for(const ent of fs.readdirSync(dir,{withFileTypes:true})){
      if(ent.name==="node_modules"||ent.name==="dist"||ent.name.startsWith("."))continue;
      const p=path.join(dir,ent.name);
      if(ent.isDirectory())walk(p);
      else if(exts.has(path.extname(ent.name))){
        let s="";try{s=fs.readFileSync(p,"utf8")}catch{}
        if(s.includes("exportReport"))hasHandler=true;
        if(s.includes("Download Client Listing Report"))hasLabel=true;
      }
      if(hasHandler&&hasLabel)return;
    }
  }
  walk(path.join(pcc,"src"));
  return hasHandler&&hasLabel;
}
function writeEvidence(state){fs.writeFileSync(evidencePath,JSON.stringify(state,null,2)+"\n");}

const r1r7=readJson(r1r7Path);
const targets=readJson(targetPath);
const sourceContract=exportHandlerSourceContract();
const targetHash=sha256(targetPath);

console.log("=".repeat(120));
console.log("SCIIP Explorer 4.0 — R29B Exact New Four-Hundred Non-Export Live Qualification");
console.log("=".repeat(120));
console.log("Application source mutation: OFF");
console.log("Governed data mutation: OFF");
console.log("Network authority: OFF");
console.log("Pixel evidence: OFF");
console.log("Export invocation: OFF");
console.log("Fresh page per record: REQUIRED");
console.log("Strict sequential: ON");
console.log("Halt on first failure: ON");
console.log("Live qualification scope: EXACT NEW 400 ONLY");
console.log("TARGET_ARTIFACT:",targetPath);
console.log("TARGET_ARTIFACT_SHA256:",targetHash);

if(r1r7.status!=="PASSED"||targets.length!==400||new Set(targets.map(x=>String(x.selectionKey||x.key||x.label))).size!==400){
  console.log("STATUS: BLOCKED");
  console.log("REASON: R1-R7 or exact New-400 target contract invalid");
  process.exit(4);
}
if(!(await httpOk("http://127.0.0.1:5173/")) || !(await httpOk("http://127.0.0.1:9333/json/version"))){
  console.log("STATUS: BLOCKED");
  console.log("REASON: SCIIP runtime or CDP unavailable");
  process.exit(5);
}

const state={
  framework:"SCIIP_EXPLORER_4_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION",
  generatedAt:new Date().toISOString(),
  status:"RUNNING",
  targetArtifact:targetPath,targetArtifactSha256:targetHash,
  targetCount:400,
  exportInvocation:false,
  sourceContract:{exportReportHandlerCertified:sourceContract},
  outcomes:[]
};
writeEvidence(state);

let halted=false;
for(let i=0;i<targets.length;i++){
  const ordinal=401+i;
  const t=targets[i];
  const label=t.label||t.selectionKey||t.key||`record-${ordinal}`;
  const o={ordinal,target:label,selectionKey:t.selectionKey||t.key||null,freshTargetCreated:false,
    explorerSettleCertified:false,explorerEntryCertified:false,targetBindingSettleCertified:false,
    selectionCertified:false,selectedPropertySettleCertified:false,assignmentsEntryCertified:false,
    generateControlCertified:false,generateClicked:false,reportReviewEntryCertified:false,
    downloadClientListingReportControlCertified:false,exportReportHandlerCertifiedBySourceContract:sourceContract,
    sameOrigin:false,exportInvocation:false,certified:false,failure:null};
  let targetPage=null,cdp=null;
  try{
    ({target:targetPage,cdp}=await createFreshPage());o.freshTargetCreated=true;
    o.explorerSettleCertified=await settleHome(cdp);
    if(!o.explorerSettleCertified)throw new Error("EXPLORER_SETTLE_FAILED");

    o.explorerEntryCertified = await r29bR4CertifyExplorerEntry(cdp);
    if(!o.explorerEntryCertified)throw new Error("EXPLORER_ENTRY_FAILED");

    const sel=await bindAndSelect(cdp,t);
    o.targetBindingSettleCertified=!!sel?.selected;
    o.selectionCertified=!!sel?.selected;
    o.selectedPropertySettleCertified=!!sel?.settled;
    o.bindingReadback=sel;
    if(!o.targetBindingSettleCertified)throw new Error("TARGET_BINDING_FAILED");
    if(!o.selectedPropertySettleCertified)throw new Error("SELECTED_PROPERTY_SETTLE_FAILED");

    o.assignmentsEntryCertified=await enterAssignments(cdp);
    if(!o.assignmentsEntryCertified)throw new Error("ASSIGNMENTS_ENTRY_FAILED");

    o.generateControlCertified=!!(await cdp.eval(`(()=>[...document.querySelectorAll('button')].filter(b=>b.offsetParent!==null&&!b.disabled&&/Generate.*Client Listing Report/i.test((b.innerText||b.textContent||"").replace(/\\s+/g," ").trim())).length===1)()`));
    if(!o.generateControlCertified)throw new Error("GENERATE_CONTROL_FAILED");

    o.generateClicked=true;
    o.reportReviewEntryCertified=await generateReport(cdp);
    if(!o.reportReviewEntryCertified)throw new Error("REPORT_REVIEW_ENTRY_FAILED");

    const dl=await certifyDownload(cdp);
    o.downloadClientListingReportControlCertified=!!dl?.certified;
    o.downloadControlCount=dl?.count;
    if(!o.downloadClientListingReportControlCertified)throw new Error("DOWNLOAD_CONTROL_FAILED");

    const snap=await bodySnapshot(cdp);
    o.sameOrigin=snap?.origin==="http://127.0.0.1:5173";
    if(!o.sameOrigin)throw new Error("ORIGIN_CHANGED");
    if(!sourceContract)throw new Error("EXPORT_HANDLER_SOURCE_CONTRACT_FAILED");

    o.certified=true;
  }catch(e){
    o.failure=String(e?.message||e);
    halted=true;
  }finally{
    if(cdp&&targetPage)await closePage(targetPage,cdp);
  }
  state.outcomes.push(o);
  state.generatedAt=new Date().toISOString();
  state.status=halted?"DIAGNOSTIC_COMPLETE":"RUNNING";
  writeEvidence(state);
  console.log(`[${ordinal}/800] ${label}`);
  console.log("certified:",o.certified);
  console.log("failure:",o.failure);
  if(halted)break;
}

const certified=state.outcomes.filter(x=>x.certified).length;
const executed=state.outcomes.length;
const exactQualified=certified===400&&executed===400&&!halted;
state.status=exactQualified?"PASSED":"DIAGNOSTIC_COMPLETE";
state.state=exactQualified
 ?"M419D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION_CLOSED"
 :"M419D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION_INCOMPLETE";
state.classification=exactQualified
 ?"EXACT_NEW_400_NON_EXPORT_LIVE_QUALIFICATION_CERTIFIED"
 :"EXACT_NEW_400_NON_EXPORT_QUALIFICATION_GAP_REMAINS";
state.certifiedCount=certified;state.executedCount=executed;state.haltedOnFailure=halted;
state.nextMilestone=exactQualified
 ?"M4_19D4BN17C_R4_R12_R16A_R29C_EXACT_EIGHT_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"
 :"M4_19D4BN17C_R4_R12_R16A_R29B_R1_NON_EXPORT_LIVE_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS";
writeEvidence(state);

console.log("=".repeat(120));
console.log("CERTIFIED:",certified,"/400");
console.log("EXECUTED:",executed,"/400");
console.log("HALTED_ON_FAILURE:",halted);
console.log("EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_QUALIFIED:",exactQualified);
console.log("STATUS:",state.status);
console.log("STATE:",state.state);
console.log("CLASSIFICATION:",state.classification);
console.log("NEXT_MILESTONE:",state.nextMilestone);
console.log("EVIDENCE:",evidencePath);
console.log("R29B EXECUTION COMPLETE — paste complete output into ChatGPT.");
process.exit(0);


async function r29bR4CertifyExplorerEntry(cdp){
  const pre = await cdp.eval(`(()=>{
    const a=[...document.querySelectorAll('button')].filter(b =>
      b.offsetParent!==null &&
      !b.disabled &&
      (b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Explorer'
    );
    return {count:a.length};
  })()`);
  if(!pre || pre.count!==1) return false;

  const click = await cdp.eval(`(()=>{
    const a=[...document.querySelectorAll('button')].filter(b =>
      b.offsetParent!==null &&
      !b.disabled &&
      (b.innerText||b.textContent||'').replace(/\s+/g,' ').trim()==='Explorer'
    );
    if(a.length!==1)return {clicked:false,count:a.length};
    a[0].click();
    return {clicked:true,count:1};
  })()`);
  if(!click || click.clicked!==true || click.count!==1) return false;

  const start=Date.now();
  let consecutive=0;
  while(Date.now()-start<=1500){
    const s=await cdp.eval(`(()=>({
      origin:location.origin,
      readyState:document.readyState,
      markerCount:document.querySelectorAll('.sciip-property-marker').length
    }))()`);
    const ok=!!s &&
      s.origin==='http://127.0.0.1:5173' &&
      s.readyState==='complete' &&
      Number(s.markerCount||0)>0;
    consecutive=ok?consecutive+1:0;
    if(consecutive>=3)return true;
    await new Promise(r=>setTimeout(r,50));
  }
  return false;
}

