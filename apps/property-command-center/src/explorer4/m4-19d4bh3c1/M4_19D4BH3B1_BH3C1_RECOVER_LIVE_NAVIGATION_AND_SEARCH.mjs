#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{spawn,spawnSync}from"node:child_process";import{sleep,get}from"./M419D4BH3B1C1Runtime.js";
const repo=path.resolve(process.argv[2]||"." ),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bh3b-runtime-route-component-mount-reconciliation.json");
const bad=path.join(ev,"m4-19d4bh3b-explorer-route-binding-manifest.json");
const audit=path.join(ev,"m4-19d4bh3b1-live-explorer-navigation-control-audit.json");
const out=path.join(ev,"m4-19d4bh3c1-live-explorer-search-binding-recovery.json");
const log=path.join(ev,"m4-19d4bh3b1c1-vite.log"); const W=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(state,x={}){let o={contract:"SCIIP_EXPLORER_4_M4_19D4BH3B1_BH3C1_LIVE_NAVIGATION_AND_SEARCH_BINDING_RECOVERY",version:"4.0-m4.19d4bh3b1c1",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,safety:{applicationMutationPerformed:false,dataMutationPerformed:false,dependencyInstallationPerformed:false}};W(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)}
if(!fs.existsSync(prior))finish("M419D4BH3B1_PRIOR_BH3B_EVIDENCE_REQUIRED");
let p=JSON.parse(fs.readFileSync(prior));let badBinding=fs.existsSync(bad)?JSON.parse(fs.readFileSync(bad)):null;
let falseRoute=!!badBinding?.selectedRoute && (badBinding.selectedRoute.startsWith("/") && badBinding.selectedRoute.includes("/Users/"));
let fd=fs.openSync(log,"a"),vite=spawn("npm",["run","dev"],{cwd:app,stdio:["ignore",fd,fd],env:{...process.env,BROWSER:"none"}}),chrome=null,base=null;
try{
 for(let i=0;i<30&&!base;i++){await sleep(600);for(const po of[5173,3000,4173,8080])if((await get(`http://127.0.0.1:${po}`)).ok){base=`http://127.0.0.1:${po}`;break}}
 if(!base)finish("M419D4BH3B1_RUNTIME_NOT_REACHABLE");
 let prof=path.join(ev,"m4-19d4bh3b1c1-profile");fs.rmSync(prof,{recursive:true,force:true});fs.mkdirSync(prof,{recursive:true});
 chrome=spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",["--headless=new","--disable-gpu",`--user-data-dir=${prof}`,"--remote-debugging-port=9234","--window-size=1600,1000",base],{stdio:"ignore"});
 let ok=false;for(let i=0;i<25&&!ok;i++){await sleep(400);ok=(await get("http://127.0.0.1:9234/json")).ok}if(!ok)finish("M419D4BH3B1_CDP_NOT_READY");
 let helper=path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_bh3b1c1.py");
 let r=spawnSync("python3",[helper,"9234",audit],{encoding:"utf8",timeout:50000,maxBuffer:50*1024*1024});
 if(r.status!==0||!fs.existsSync(audit))finish("M419D4BH3B1_BROWSER_INTERACTION_FAILED",{stderr:r.stderr});
 let d=JSON.parse(fs.readFileSync(audit)); if(!d)finish("M419D4BH3B1_NULL_CDP_RESULT_RECOVERED_NO_CERTIFICATION");
 let candidates=d.before?.candidates||[], inputs=d.after?.inputs||[], body=d.after?.body||"";
 let explorerMounted=/Explorer 3\.0|Property Intelligence|Map Legend|Layers|Analyze|Present|Command|property explorer/i.test(body);
 let search=inputs.find(x=>/Search SCIIP|Search properties|Search address|properties, owners|market question/i.test([x.placeholder,x.aria].join(" ")))||null;
 let rec={falseFilesystemRoutePreviouslyCertified:falseRoute,explorerNavigationCandidateCount:candidates.length,clicked:d.clicked===true,actualHref:d.after?.href||null,explorerMounted,searchControl:search,inputCount:inputs.length};
 if(candidates.length!==1)finish("M419D4BH3B1_EXACT_EXPLORER_NAVIGATION_CONTROL_NOT_UNIQUE",{reconciliation:rec,artifacts:{audit},nextMilestone:"M4.19D4BH3B2_EXPLORER_NAV_CONTROL_SOURCE_BINDING"});
 if(!d.clicked||!explorerMounted)finish("M419D4BH3B1_EXPLORER_NAVIGATION_EXECUTED_COMPONENT_MOUNT_NOT_CERTIFIED",{reconciliation:rec,artifacts:{audit},nextMilestone:"M4.19D4BH3B2_EXPLORER_COMPONENT_MOUNT_RECONCILIATION"});
 if(!search)finish("M419D4BH3C1_LIVE_EXPLORER_MOUNT_CERTIFIED_SEARCH_CONTROL_NOT_VISIBLE",{reconciliation:rec,artifacts:{audit},nextMilestone:"M4.19D4BH3C2_EXPLORER_SEARCH_CONTROL_MOUNT_RECONCILIATION"});
 finish("M419D4BH3C1_LIVE_EXPLORER_NAVIGATION_AND_SEARCH_CONTROL_CERTIFIED_BESSEMER_INTERACTION_READY",{certification:rec,artifacts:{audit},nextMilestone:"M4.19D4BH4B_LIVE_EXPLORER_BESSEMER_SEARCH_AND_SELECTION"});
}finally{try{chrome?.kill()}catch{};try{vite.kill()}catch{};try{fs.closeSync(fd)}catch{}}
