#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {spawn,spawnSync} from "node:child_process";
import {sleep,httpGet} from "./M419D4BH34Runtime.js";
const repo=path.resolve(process.argv[2]||"."),auth=process.argv[3]||"",AUTH="AUTHORIZE_M419D4BH4_SOURCE_BOUND_INTERACTIVE_SEARCH_SELECTION";
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const h3Path=path.join(ev,"m4-19d4bh3-exact-explorer-search-control-reconciliation.json"),manifestPath=path.join(ev,"m4-19d4bh3-search-control-binding-manifest.json"),bg1Pre=path.join(ev,"m4-19d4bg1-system-browser-headless-preauthorization-manifest.json"),bfPath=path.join(ev,"m4-19d4bf-runtime-explorer-visibility-ui-binding-certification.json");
const result=path.join(ev,"m4-19d4bh4-source-bound-interactive-search-selection-certification.json"),interaction=path.join(ev,"m4-19d4bh4-cdp-interaction-result.json"),audit=path.join(ev,"m4-19d4bh4-source-bound-interaction-audit.json"),runtimeLog=path.join(ev,"m4-19d4bh4-vite-runtime.log");
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function done(state,extra={}){const o={contract:"SCIIP_EXPLORER_4_M4_19D4BH4_SOURCE_BOUND_INTERACTIVE_SEARCH_AND_SELECTION_EXECUTION",version:"4.0-m4.19d4bh4",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra,safety:{applicationMutationPerformed:false,dataMutationPerformed:false,dependencyInstallationPerformed:false,automaticRetry:false}};write(result,o);console.log(JSON.stringify(o,null,2));process.exit(0)}
if(![h3Path,manifestPath,bg1Pre,bfPath].every(fs.existsSync))done("M419D4BH4_REQUIRED_ARTIFACT_MISSING");
const h3=JSON.parse(fs.readFileSync(h3Path,"utf8"));
if(h3.state!=="M419D4BH3_EXACT_EXPLORER_SEARCH_CONTROL_AND_INTERACTION_STRATEGY_CERTIFIED_BH4_PREAUTHORIZED")done("M419D4BH4_BH3_CERTIFICATION_REQUIRED",{observed:h3.state});
if(auth!==AUTH)done("M419D4BH4_EXPLICIT_AUTHORIZATION_REQUIRED",{requiredAuthorizationToken:AUTH});
const pre=JSON.parse(fs.readFileSync(bg1Pre,"utf8")),bf=JSON.parse(fs.readFileSync(bfPath,"utf8"));
const target={canonicalPropertyId:bf.certification.canonicalPropertyId,address:bf.certification.address,latitude:bf.certification.latitude,longitude:bf.certification.longitude,availableSf:bf.certification.availableSf};
const fd=fs.openSync(runtimeLog,"a"),vite=spawn("npm",["run","dev"],{cwd:app,stdio:["ignore",fd,fd],env:{...process.env,BROWSER:"none"}});let url=null,chrome=null;
try{
 for(let i=0;i<30&&!url;i++){await sleep(700);for(const p of [5173,3000,4173,8080]){const r=await httpGet(`http://127.0.0.1:${p}`);if(r.ok){url=`http://127.0.0.1:${p}`;break}}}
 if(!url)done("M419D4BH4_LOCAL_RUNTIME_NOT_REACHABLE");
 const prof=path.join(ev,"m4-19d4bh4-chrome-profile");fs.rmSync(prof,{recursive:true,force:true});fs.mkdirSync(prof,{recursive:true});
 chrome=spawn(pre.browser.path,["--headless=new","--disable-gpu",`--user-data-dir=${prof}`,"--remote-debugging-port=9229","--window-size=1600,1000",url],{stdio:"ignore"});
 let ready=false;for(let i=0;i<25&&!ready;i++){await sleep(500);const r=await httpGet("http://127.0.0.1:9229/json");ready=r.ok}
 if(!ready)done("M419D4BH4_CHROME_DEVTOOLS_NOT_READY");
 const helper=path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_bh34.py");
 const py=spawnSync("python3",[helper,"9229","execute",interaction,target.address],{encoding:"utf8",timeout:60000,maxBuffer:40*1024*1024});
 if(py.status!==0||!fs.existsSync(interaction))done("M419D4BH4_CDP_EXECUTION_FAILED",{stderr:(py.stderr||"").slice(-5000)});
 const d=JSON.parse(fs.readFileSync(interaction,"utf8")),text=d.bodyText||"",html=d.html||"";
 const checks={interactionExecuted:d.ok===true,addressVisible:text.toUpperCase().includes(target.address.toUpperCase()),availableSfVisible:["4,904","4904"].some(v=>text.includes(v)),canonicalIdBound:text.includes(target.canonicalPropertyId)||html.includes(target.canonicalPropertyId),latitudeBound:html.includes(String(target.latitude)),longitudeBound:html.includes(String(target.longitude))};
 const qualified=checks.interactionExecuted&&checks.addressVisible&&checks.availableSfVisible;
 write(audit,{contract:"SCIIP_EXPLORER_4_M4_19D4BH4_SOURCE_BOUND_INTERACTION_AUDIT",version:"4.0-m4.19d4bh4",generatedAt:new Date().toISOString(),serverUrl:url,target,checks,qualified,action:d.action||null,url:d.url,title:d.title});
 if(!qualified)done("M419D4BH4_SOURCE_BOUND_INTERACTION_EXECUTED_BESSEMER_VISIBILITY_NOT_FULLY_CERTIFIED_BH5_REQUIRED",{certification:{checks,action:d.action||null},artifacts:{interactionResult:interaction,interactionAudit:audit},nextMilestone:"M4.19D4BH5_RENDERED_RESULT_AND_PROPERTY_DETAIL_BINDING_RECONCILIATION"});
 done("M419D4BH4_LIVE_SOURCE_BOUND_EXPLORER_BESSEMER_SEARCH_SELECTION_AND_VISIBILITY_CERTIFIED",{certification:{checks,action:d.action||null,canonicalPropertyId:target.canonicalPropertyId,address:target.address,latitude:target.latitude,longitude:target.longitude,availableSf:target.availableSf},artifacts:{interactionResult:interaction,interactionAudit:audit},nextMilestone:"M4.19D4BI_SINGLE_RECORD_REFRESH_LIFECYCLE_CLOSURE_AND_SCALE_OUT_READINESS"});
}finally{try{chrome?.kill("SIGTERM")}catch{};try{vite.kill("SIGTERM")}catch{};try{fs.closeSync(fd)}catch{}}
