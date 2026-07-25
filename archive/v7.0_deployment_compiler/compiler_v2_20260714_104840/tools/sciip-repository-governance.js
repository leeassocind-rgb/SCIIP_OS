#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process");
const ROOT=process.cwd(), POLICY_PATH=path.join(ROOT,"governance/repository-governance-policy.json");
const policy=JSON.parse(fs.readFileSync(POLICY_PATH,"utf8"));
function walk(d){if(!fs.existsSync(d))return[];return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const p=path.join(d,e.name);return e.isDirectory()?walk(p):[p]});}
function rel(p){return path.relative(ROOT,p).replace(/\\/g,"/");}
const errors=[],warnings=[];
const nodeMajor=Number(process.versions.node.split(".")[0]);
if(nodeMajor!==policy.nodeMajor && process.env.SCIIP_GOVERNANCE_ALLOW_NODE_MISMATCH!=="1") errors.push(`Node ${policy.nodeMajor} required; found ${process.versions.node}`);
if(nodeMajor!==policy.nodeMajor) warnings.push(`Validation override: Node ${policy.nodeMajor} expected; found ${process.versions.node}`);
for(const f of policy.requiredFiles||[]) if(!fs.existsSync(path.join(ROOT,f))) errors.push(`Missing required architecture file: ${f}`);
const procPattern=new RegExp(policy.processorFilenamePattern);
const exemptions=new Set(policy.processorFilenameExemptions||[]);
for(const f of walk(path.join(ROOT,"src/processors")).filter(f=>f.endsWith(".gs")&&path.basename(f).includes("Processor"))){const r=rel(f);if(!exemptions.has(r)&&!procPattern.test(path.basename(f)))errors.push(`Processor naming violation: ${r}`);}
let governanceOutput="";
try{governanceOutput=cp.execFileSync(process.execPath,[path.join(ROOT,"tools/sciip-architecture-governance.js")],{cwd:ROOT,encoding:"utf8",stdio:["ignore","pipe","pipe"]});}catch(e){governanceOutput=String(e.stdout||"")+String(e.stderr||"");errors.push("Architecture governance failed");}
const reportPath=path.join(ROOT,"governance/architecture-governance-report.json");
const report=fs.existsSync(reportPath)?JSON.parse(fs.readFileSync(reportPath,"utf8")):{metrics:{}};
const m=report.metrics||{};
for(const [k,max] of [["syntaxErrors",policy.maximumSyntaxErrors],["duplicateProcessorNumbers",policy.maximumDuplicateProcessorNumbers],["realDuplicateGlobals",policy.maximumDuplicateGlobals],["realPublicFunctionConflicts",policy.maximumPublicFunctionConflicts]]) if(Number(m[k]||0)>Number(max)) errors.push(`${k} exceeds policy: ${m[k]} > ${max}`);
const storageFiles=walk(path.join(ROOT,"src/processors/runtime/storage")).filter(f=>f.endsWith(".gs")&&/Processor\.gs$/.test(f));
let storageRuntimeAdoption=0,directStorageWrites=0;
for(const f of storageFiles){const s=fs.readFileSync(f,"utf8");if(/SCIIP_STORAGE_RUNTIME/.test(s))storageRuntimeAdoption++;if(/\b(setValue|setValues|appendRow|insertRows|deleteRows|clearContent)\s*\(/.test(s))directStorageWrites++;}
if(storageRuntimeAdoption<policy.minimumStorageRuntimeAdoption)errors.push(`Storage runtime adoption regressed: ${storageRuntimeAdoption} < ${policy.minimumStorageRuntimeAdoption}`);
if(directStorageWrites>policy.maximumDirectStorageWrites)errors.push(`Direct storage writes exceed policy: ${directStorageWrites} > ${policy.maximumDirectStorageWrites}`);
const result={status:errors.length?"FAILED":"PASSED",policyVersion:policy.version,node:process.versions.node,files:m.files||0,storageProcessorFiles:storageFiles.length,storageRuntimeAdoption,directStorageWrites,errors,warnings};
fs.writeFileSync(path.join(ROOT,"governance/repository-governance-report.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
if(errors.length)process.exit(1);
