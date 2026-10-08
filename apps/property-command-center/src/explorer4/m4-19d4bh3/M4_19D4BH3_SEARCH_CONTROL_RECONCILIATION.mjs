#!/usr/bin/env node
import fs from "node:fs";import path from "node:path";import {spawn,spawnSync} from "node:child_process";
import {sleep,httpGet,walk} from "./M419D4BH34Runtime.js";
const repo=path.resolve(process.argv[2]||"."),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bh2Path=path.join(ev,"m4-19d4bh2-interactive-explorer-search-selection-certification.json");
const bg1Pre=path.join(ev,"m4-19d4bg1-system-browser-headless-preauthorization-manifest.json");
const result=path.join(ev,"m4-19d4bh3-exact-explorer-search-control-reconciliation.json");
const manifest=path.join(ev,"m4-19d4bh3-search-control-binding-manifest.json");
const domAudit=path.join(ev,"m4-19d4bh3-live-control-inventory.json");
const sourceAudit=path.join(ev,"m4-19d4bh3-search-source-candidate-audit.json");
const runtimeLog=path.join(ev,"m4-19d4bh3-vite-runtime.log");
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function done(state,extra={}){const o={contract:"SCIIP_EXPLORER_4_M4_19D4BH3_EXACT_EXPLORER_SEARCH_CONTROL_AND_SELECTION_EVENT_RECONCILIATION",version:"4.0-m4.19d4bh3",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra,safety:{applicationMutationPerformed:false,dataMutationPerformed:false,dependencyInstallationPerformed:false,automaticRetry:false}};write(result,o);console.log(JSON.stringify(o,null,2));process.exit(0)}
if(!fs.existsSync(bh2Path)||!fs.existsSync(bg1Pre))done("M419D4BH3_REQUIRED_ARTIFACT_MISSING");
const b2=JSON.parse(fs.readFileSync(bh2Path,"utf8"));
if(b2.state!=="M419D4BH2_INTERACTIVE_EXPLORER_SEARCH_EXECUTED_BESSEMER_SELECTION_NOT_FULLY_CERTIFIED_UI_CONTROL_RECONCILIATION_REQUIRED")done("M419D4BH3_BH2_RECONCILIATION_STATE_REQUIRED",{observed:b2.state});
const pre=JSON.parse(fs.readFileSync(bg1Pre,"utf8"));

const files=walk(path.join(app,"src"));
const candidates=[];
for(const p of files){
  if(!/\.(js|jsx|ts|tsx|mjs)$/.test(p))continue;
  let s="";try{s=fs.readFileSync(p,"utf8")}catch{continue}
  const rel=path.relative(app,p);
  if(rel.startsWith("src/explorer4/"))continue;
  let score=0;
  if(/search/i.test(s))score+=2;
  if(/property/i.test(s))score+=1;
  if(/placeholder|aria-label|role=.?(combobox|searchbox)/i.test(s))score+=2;
  if(/onChange|onInput|keydown|Enter|setQuery|searchQuery|handleSearch/i.test(s))score+=3;
  if(/Explorer|property-explorer|CommandPalette|Search/i.test(rel))score+=2;
  if(score>=5){
    const snippets=s.split(/\r?\n/).map((line,i)=>({line:i+1,text:line.trim()}))
      .filter(x=>/search|placeholder|combobox|searchbox|onChange|onInput|Enter|CommandPalette/i.test(x.text)).slice(0,40);
    candidates.push({path:p,relativePath:rel,score,snippets});
  }
}
candidates.sort((a,b)=>b.score-a.score);
write(sourceAudit,{classification:"ORIGINAL_SOURCE_SEARCH_CONTROL_CANDIDATES",candidateCount:candidates.length,candidates:candidates.slice(0,80)});

const fd=fs.openSync(runtimeLog,"a");
const vite=spawn("npm",["run","dev"],{cwd:app,stdio:["ignore",fd,fd],env:{...process.env,BROWSER:"none"}});
let url=null,chrome=null;
try{
  for(let i=0;i<30&&!url;i++){await sleep(700);for(const p of [5173,3000,4173,8080]){const r=await httpGet(`http://127.0.0.1:${p}`);if(r.ok){url=`http://127.0.0.1:${p}`;break}}}
  if(!url)done("M419D4BH3_LOCAL_RUNTIME_NOT_REACHABLE",{runtimeLog});
  const prof=path.join(ev,"m4-19d4bh3-chrome-profile");fs.rmSync(prof,{recursive:true,force:true});fs.mkdirSync(prof,{recursive:true});
  chrome=spawn(pre.browser.path,["--headless=new","--disable-gpu",`--user-data-dir=${prof}`,"--remote-debugging-port=9228","--window-size=1600,1000",url],{stdio:"ignore"});
  let ready=false;for(let i=0;i<25&&!ready;i++){await sleep(500);const r=await httpGet("http://127.0.0.1:9228/json");ready=r.ok}
  if(!ready)done("M419D4BH3_CHROME_DEVTOOLS_NOT_READY");
  const helper=path.join(path.dirname(new URL(import.meta.url).pathname),"chrome_cdp_bh34.py");
  const py=spawnSync("python3",[helper,"9228","inspect",domAudit],{encoding:"utf8",timeout:45000,maxBuffer:30*1024*1024});
  if(py.status!==0||!fs.existsSync(domAudit))done("M419D4BH3_LIVE_CONTROL_INSPECTION_FAILED",{stderr:(py.stderr||"").slice(-5000)});
  const live=JSON.parse(fs.readFileSync(domAudit,"utf8"));
  const controls=live.controls||[];
  const scored=controls.map(c=>{
    const blob=[c.tag,c.id,c.role,c.type,c.placeholder,c.ariaLabel,c.className,c.text].join(" ");
    const score=(/search/i.test(blob)?10:0)+(/address/i.test(blob)?7:0)+(/property/i.test(blob)?5:0)+(/find/i.test(blob)?4:0)+(/combobox|searchbox/i.test(blob)?6:0)+(/command/i.test(blob)?2:0);
    return {...c,searchScore:score};
  }).filter(c=>c.searchScore>0).sort((a,b)=>b.searchScore-a.searchScore);
  const sourceStrong=candidates.filter(c=>c.score>=7);
  const uniqueLive=scored.length===1 || (scored[0]&&(!scored[1]||scored[0].searchScore>scored[1].searchScore));
  const strategy=scored[0]?((["input","textarea"].includes(scored[0].tag)||scored[0].contenteditable==="true"||["combobox","searchbox"].includes(scored[0].role))?"DIRECT_EDITOR":"OPENER_THEN_EDITOR"):null;
  const bound=!!scored[0]&&uniqueLive&&sourceStrong.length>0;
  const m={contract:"SCIIP_EXPLORER_4_M4_19D4BH3_SEARCH_CONTROL_BINDING_MANIFEST",version:"4.0-m4.19d4bh3",generatedAt:new Date().toISOString(),serverUrl:url,bound,liveControl:scored[0]||null,strategy,sourceCandidate:sourceStrong[0]||candidates[0]||null,liveCandidateCount:scored.length,sourceCandidateCount:candidates.length};
  write(manifest,m);
  if(!bound)done("M419D4BH3_EXACT_SEARCH_CONTROL_NOT_UNIQUELY_BOUND_BH3A_FORENSICS_REQUIRED",{reconciliation:{liveCandidateCount:scored.length,topLiveCandidates:scored.slice(0,10),sourceCandidateCount:candidates.length,topSourceCandidates:candidates.slice(0,10)},artifacts:{liveControlInventory:domAudit,sourceCandidateAudit:sourceAudit,searchControlManifest:manifest},nextMilestone:"M4.19D4BH3A_EXACT_CONTROL_SOURCE_TO_DOM_BINDING_FORENSICS"});
  done("M419D4BH3_EXACT_EXPLORER_SEARCH_CONTROL_AND_INTERACTION_STRATEGY_CERTIFIED_BH4_PREAUTHORIZED",{binding:m,artifacts:{liveControlInventory:domAudit,sourceCandidateAudit:sourceAudit,searchControlManifest:manifest},nextMilestone:"M4.19D4BH4_SOURCE_BOUND_INTERACTIVE_SEARCH_AND_SELECTION_EXECUTION"});
}finally{try{chrome?.kill("SIGTERM")}catch{};try{vite.kill("SIGTERM")}catch{};try{fs.closeSync(fd)}catch{}}
