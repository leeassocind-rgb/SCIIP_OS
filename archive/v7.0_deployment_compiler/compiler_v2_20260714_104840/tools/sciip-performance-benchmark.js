#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process"),crypto=require("crypto");
const ROOT=process.cwd();
const baseline=JSON.parse(fs.readFileSync(path.join(ROOT,"governance/performance-baseline.json"),"utf8"));
function now(){return Number(process.hrtime.bigint())/1e6;}
function run(name,script){const start=now();let ok=true,error="";try{cp.execFileSync(process.execPath,[path.join(ROOT,script)],{cwd:ROOT,stdio:"pipe",env:{...process.env,SCIIP_GOVERNANCE_ALLOW_NODE_MISMATCH:"1"}});}catch(e){ok=false;error=String(e.stderr||e.stdout||e.message).slice(0,500);}return {name,ok,durationMs:+(now()-start).toFixed(2),error};}
function walk(dir){const out=[];const stack=[dir];while(stack.length){const d=stack.pop();for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())stack.push(p);else out.push(p);}}return out;}
const invStart=now();const files=walk(path.join(ROOT,"src"));let bytes=0;for(const f of files)bytes+=fs.statSync(f).size;const inventoryMs=+(now()-invStart).toFixed(2);
const architecture=run("architectureGovernance","tools/sciip-architecture-governance.js");
const repository=run("repositoryGovernance","tools/sciip-repository-governance.js");
const rssMb=+(process.memoryUsage().rss/1024/1024).toFixed(2);
const fps=+(files.length/Math.max(inventoryMs/1000,0.001)).toFixed(2);
const t=baseline.thresholds;
const checks={
 architectureGovernance:architecture.ok&&architecture.durationMs<=t.architectureGovernanceMs,
 repositoryGovernance:repository.ok&&repository.durationMs<=t.repositoryGovernanceMs,
 sourceInventory:inventoryMs<=t.sourceInventoryMs,
 memory:rssMb<=t.peakRssMb,
 throughput:fps>=t.minimumFilesPerSecond
};
const failures=Object.entries(checks).filter(([,v])=>!v).map(([k])=>k);
const report={framework:"SCIIP_PERFORMANCE_CERTIFICATION",version:baseline.version,status:failures.length?"FAILED":"PASSED",measuredAt:new Date().toISOString(),node:process.versions.node,files:files.length,bytes,filesPerSecond:fps,peakRssMb:rssMb,metrics:{architectureGovernanceMs:architecture.durationMs,repositoryGovernanceMs:repository.durationMs,sourceInventoryMs:inventoryMs},thresholds:t,checks,failures};
report.certificateId=crypto.createHash("sha256").update(JSON.stringify(report)).digest("hex").slice(0,24).toUpperCase();
fs.writeFileSync(path.join(ROOT,"governance/performance-certification.json"),JSON.stringify(report,null,2)+"\n");
console.log(JSON.stringify(report,null,2));if(failures.length)process.exit(1);
