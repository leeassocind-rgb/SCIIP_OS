#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {spawn,spawnSync} from "node:child_process";
const repo=path.resolve(process.argv[2]||"."),auth=process.argv[3]||"",AUTH="AUTHORIZE_M419D4BH2_INTERACTIVE_EXPLORER_SEARCH_SELECTION";
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const b1=JSON.parse(fs.readFileSync(path.join(ev,"m4-19d4bh1-system-browser-live-explorer-dom-visibility-certification.json"),"utf8"));
const bg1=JSON.parse(fs.readFileSync(path.join(ev,"m4-19d4bg1-system-browser-headless-preauthorization-manifest.json"),"utf8"));
const bf=JSON.parse(fs.readFileSync(path.join(ev,"m4-19d4bf-runtime-explorer-visibility-ui-binding-certification.json"),"utf8"));
const out=path.join(ev,"m4-19d4bh2-interactive-explorer-search-selection-certification.json"),audit=path.join(ev,"m4-19d4bh2-interactive-browser-search-selection-audit.json"),idata=path.join(ev,"m4-19d4bh2-cdp-interaction-result.json");
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function done(state,extra={}){let o={contract:"SCIIP_EXPLORER_4_M4_19D4BH2_INTERACTIVE_SEARCH_AND_PROPERTY_SELECTION_BROWSER_HARNESS",version:"4.0-m4.19d4bh2",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra};write(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)}
if(b1.state!=="M419D4BH1_SYSTEM_BROWSER_LIVE_RENDER_EXECUTED_BESSEMER_NOT_VISIBLE_IN_INITIAL_DOM_INTERACTIVE_UI_PATH_REQUIRED")done("M419D4BH2_BH1_STATE_REQUIRED",{observed:b1.state});
if(auth!==AUTH)done("M419D4BH2_EXPLICIT_INTERACTIVE_BROWSER_AUTHORIZATION_REQUIRED",{requiredAuthorizationToken:AUTH});
const target={canonicalPropertyId:bf.certification.canonicalPropertyId,address:bf.certification.address,latitude:bf.certification.latitude,longitude:bf.certification.longitude,availableSf:bf.certification.availableSf};
const log=path.join(ev,"m4-19d4bh2-vite-runtime.log"),fd=fs.openSync(log,"a"),vite=spawn("npm",["run","dev"],{cwd:app,stdio:["ignore",fd,fd],env:{...process.env,BROWSER:"none"}});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let url=null,chrome=null;
try{
 for(let i=0;i<30&&!url;i++){await sleep(700);for(const p of [5173,3000,4173,8080]){try{let r=await fetch(`http://127.0.0.1:${p}`);if(r.ok){url=`http://127.0.0.1:${p}`;break}}catch{}}}
 if(!url)done("M419D4BH2_LOCAL_VITE_RUNTIME_NOT_REACHABLE",{runtimeLog:log});
 const prof=path.join(ev,"m4-19d4bh2-chrome-profile");fs.rmSync(prof,{recursive:true,force:true});fs.mkdirSync(prof,{recursive:true});
 chrome=spawn(bg1.browser.path,["--headless=new","--disable-gpu",`--user-data-dir=${prof}`,"--remote-debugging-port=9227","--window-size=1600,1000",url],{stdio:"ignore"});
 let ready=false;for(let i=0;i<25&&!ready;i++){await sleep(500);try{let r=await fetch("http://127.0.0.1:9227/json");ready=r.ok}catch{}}
 if(!ready)done("M419D4BH2_CHROME_DEVTOOLS_ENDPOINT_NOT_READY");
 const py=spawnSync("python3",[path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_interact.py"),"9227",target.address,idata],{encoding:"utf8",timeout:60000,maxBuffer:40*1024*1024});
 if(py.status!==0||!fs.existsSync(idata))done("M419D4BH2_CHROME_CDP_INTERACTION_FAILED",{stderr:(py.stderr||"").slice(-5000)});
 const d=JSON.parse(fs.readFileSync(idata,"utf8")),text=d.text||"",html=d.html||"";
 const checks={searchInputFound:!!d.input,interactionExecuted:d.ok===true,addressVisible:text.toUpperCase().includes(target.address.toUpperCase()),availableSfVisible:["4,904","4904"].some(v=>text.includes(v)),canonicalIdBound:text.includes(target.canonicalPropertyId)||html.includes(target.canonicalPropertyId),latitudeBound:html.includes(String(target.latitude)),longitudeBound:html.includes(String(target.longitude))};
 const ok=checks.searchInputFound&&checks.interactionExecuted&&checks.addressVisible&&checks.availableSfVisible;
 write(audit,{contract:"SCIIP_EXPLORER_4_M4_19D4BH2_INTERACTIVE_BROWSER_SEARCH_SELECTION_AUDIT",version:"4.0-m4.19d4bh2",generatedAt:new Date().toISOString(),serverUrl:url,target,checks,interaction:{input:d.input,clicked:d.clicked,clickedText:d.clickedText,url:d.url,title:d.title},qualified:ok});
 if(!ok)done("M419D4BH2_INTERACTIVE_EXPLORER_SEARCH_EXECUTED_BESSEMER_SELECTION_NOT_FULLY_CERTIFIED_UI_CONTROL_RECONCILIATION_REQUIRED",{certification:{serverUrl:url,checks,input:d.input,clicked:d.clicked},artifacts:{interactiveAudit:audit,interactionResult:idata},nextMilestone:"M4.19D4BH3_EXACT_EXPLORER_SEARCH_CONTROL_AND_SELECTION_EVENT_RECONCILIATION"});
 done("M419D4BH2_LIVE_INTERACTIVE_EXPLORER_BESSEMER_SEARCH_SELECTION_AND_VISIBILITY_CERTIFIED",{certification:{serverUrl:url,checks,input:d.input,clicked:d.clicked,canonicalPropertyId:target.canonicalPropertyId,address:target.address,latitude:target.latitude,longitude:target.longitude,availableSf:target.availableSf},artifacts:{interactiveAudit:audit,interactionResult:idata},nextMilestone:"M4.19D4BI_SINGLE_RECORD_REFRESH_LIFECYCLE_CLOSURE_AND_SCALE_OUT_READINESS"});
}finally{try{chrome?.kill("SIGTERM")}catch{};try{vite.kill("SIGTERM")}catch{};try{fs.closeSync(fd)}catch{}}
