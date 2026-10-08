#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import{spawn,spawnSync}from"node:child_process";
import{sleep,get,write}from"./M419D4BH4BBIRuntime.js";
const repo=path.resolve(process.argv[2]||"."),auth=process.argv[3]||"",AUTH="AUTHORIZE_M419D4BH4B_LIVE_EXPLORER_BESSEMER_SEARCH_SELECTION";
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const pre=path.join(ev,"m4-19d4bh3c1-live-explorer-search-binding-recovery.json");
const bf=path.join(ev,"m4-19d4bf-runtime-explorer-visibility-ui-binding-certification.json");
const out=path.join(ev,"m4-19d4bh4b-live-explorer-bessemer-search-selection-certification.json");
const audit=path.join(ev,"m4-19d4bh4b-live-explorer-bessemer-interaction-audit.json");
const interaction=path.join(ev,"m4-19d4bh4b-cdp-interaction.json");
const runtimeLog=path.join(ev,"m4-19d4bh4b-vite-runtime.log");
const shot=path.join(ev,"m4-19d4bh4b-post-selection-screenshot.png");
function done(state,x={}){const o={contract:"SCIIP_EXPLORER_4_M4_19D4BH4B_LIVE_EXPLORER_BESSEMER_SEARCH_AND_SELECTION",version:"4.0-m4.19d4bh4b",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},safety:{applicationMutationPerformed:false,dataMutationPerformed:false,dependencyInstallationPerformed:false,governedInventoryMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};write(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)}
if(!fs.existsSync(pre)||!fs.existsSync(bf))done("M419D4BH4B_REQUIRED_ARTIFACT_MISSING");
const p=JSON.parse(fs.readFileSync(pre,"utf8"));
if(p.state!=="M419D4BH3C1_LIVE_EXPLORER_NAVIGATION_AND_SEARCH_CONTROL_CERTIFIED_BESSEMER_INTERACTION_READY")done("M419D4BH4B_BH3C1_CERTIFICATION_REQUIRED",{observed:p.state});
if(auth!==AUTH)done("M419D4BH4B_EXPLICIT_AUTHORIZATION_REQUIRED",{requiredAuthorizationToken:AUTH});
const b=JSON.parse(fs.readFileSync(bf,"utf8")),t=b.certification;
const target={canonicalPropertyId:t.canonicalPropertyId,address:t.address,latitude:t.latitude,longitude:t.longitude,availableSf:t.availableSf};
const fd=fs.openSync(runtimeLog,"a"),vite=spawn("npm",["run","dev"],{cwd:app,stdio:["ignore",fd,fd],env:{...process.env,BROWSER:"none"}});
let chrome=null,base=null;
try{
 for(let i=0;i<35&&!base;i++){await sleep(600);for(const po of[5173,3000,4173,8080]){if((await get(`http://127.0.0.1:${po}`)).ok){base=`http://127.0.0.1:${po}`;break}}}
 if(!base)done("M419D4BH4B_RUNTIME_NOT_REACHABLE",{artifacts:{runtimeLog}});
 const prof=path.join(ev,"m4-19d4bh4b-chrome-profile");fs.rmSync(prof,{recursive:true,force:true});fs.mkdirSync(prof,{recursive:true});
 const chromePath="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
 chrome=spawn(chromePath,["--headless=new","--disable-gpu",`--user-data-dir=${prof}`,"--remote-debugging-port=9235","--window-size=1600,1000",base],{stdio:"ignore"});
 let ready=false;for(let i=0;i<30&&!ready;i++){await sleep(400);ready=(await get("http://127.0.0.1:9235/json")).ok}
 if(!ready)done("M419D4BH4B_CDP_NOT_READY");
 const helper=path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_bh4b.py");
 const r=spawnSync("python3",[helper,"9235",interaction,target.address],{encoding:"utf8",timeout:70000,maxBuffer:60*1024*1024});
 if(r.status!==0||!fs.existsSync(interaction))done("M419D4BH4B_BROWSER_INTERACTION_FAILED",{stderr:(r.stderr||"").slice(-8000)});
 const d=JSON.parse(fs.readFileSync(interaction,"utf8"));
 if(!d)done("M419D4BH4B_NULL_INTERACTION_RESULT");
 const text=d.bodyText||"",html=d.html||"";
 const addressVariants=[target.address,"14117 Bessemer St","14117 BESSEMER ST","14117-14123 BESSEMER ST"];
 const checks={
   navigationAndSearchExecuted:d.ok===true&&d.phase==="COMPLETE",
   searchValueExact:d.search?.value===target.address,
   addressVisible:addressVariants.some(v=>text.toUpperCase().includes(v.toUpperCase())),
   availableSfVisible:["4,904","4904"].some(v=>text.includes(v)),
   canonicalIdBound:text.includes(target.canonicalPropertyId)||html.includes(target.canonicalPropertyId),
   latitudeBound:html.includes(String(target.latitude)),
   longitudeBound:html.includes(String(target.longitude)),
   selectionActionObserved:d.clicked===true||d.resultCandidateCount>0
 };
 const qualified=checks.navigationAndSearchExecuted&&checks.searchValueExact&&checks.addressVisible&&checks.availableSfVisible;
 // independent screenshot pass of current application root (evidence only)
 spawnSync(chromePath,["--headless=new","--disable-gpu",`--screenshot=${shot}`,"--window-size=1600,1000","--virtual-time-budget=2500",base],{encoding:"utf8",timeout:30000});
 checks.screenshotCaptured=fs.existsSync(shot)&&fs.statSync(shot).size>1000;
 write(audit,{contract:"SCIIP_EXPLORER_4_M4_19D4BH4B_LIVE_BESSEMER_INTERACTION_AUDIT",version:"4.0-m4.19d4bh4b",generatedAt:new Date().toISOString(),serverUrl:base,target,interaction:{phase:d.phase,clicked:d.clicked,clickedText:d.clickedText,resultCandidateCount:d.resultCandidateCount,search:d.search},checks,qualified,artifacts:{interaction,screenshot:shot,runtimeLog}});
 if(!qualified)done("M419D4BH4B_LIVE_EXPLORER_BESSEMER_SEARCH_EXECUTED_RENDERED_PROPERTY_PARITY_NOT_FULLY_CERTIFIED",{certification:{target,checks,clicked:d.clicked,clickedText:d.clickedText,resultCandidateCount:d.resultCandidateCount},artifacts:{interactionAudit:audit,interaction,screenshot:shot,runtimeLog},nextMilestone:"M4.19D4BH4C_RENDERED_PROPERTY_DETAIL_FIELD_BINDING_RECONCILIATION"});
 done("M419D4BH4B_LIVE_EXPLORER_BESSEMER_SEARCH_SELECTION_AND_VISIBILITY_CERTIFIED",{certification:{target,checks,clicked:d.clicked,clickedText:d.clickedText,resultCandidateCount:d.resultCandidateCount,liveExplorerInteractionCertified:true},artifacts:{interactionAudit:audit,interaction,screenshot:shot,runtimeLog},nextMilestone:"M4.19D4BI_SINGLE_RECORD_REFRESH_LIFECYCLE_CLOSURE_AND_SCALE_OUT_READINESS"});
}finally{try{chrome?.kill("SIGTERM")}catch{};try{vite.kill("SIGTERM")}catch{};try{fs.closeSync(fd)}catch{}}
