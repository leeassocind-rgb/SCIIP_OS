#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),vm=require("vm");
const ROOT=process.cwd(),SRC=path.join(ROOT,"src"),GOV=path.join(ROOT,"governance");
const POLICY=path.join(GOV,"architecture-governance-policy.json");
const REPORT=path.join(GOV,"architecture-governance-report.json");
const SUMMARY=path.join(GOV,"architecture-governance-summary.md");
const policy=fs.existsSync(POLICY)?JSON.parse(fs.readFileSync(POLICY,"utf8")):{};
function walk(d){if(!fs.existsSync(d))return[];return fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{const f=path.join(d,e.name);return e.isDirectory()?walk(f):[f]})}
function rel(f){return path.relative(ROOT,f).replace(/\\/g,"/")}
function strip(s){return s.replace(/\/\*[\s\S]*?\*\//g,m=>m.replace(/[^\n]/g," ")).replace(/\/\/[^\n]*/g,m=>" ".repeat(m.length))}
function uniq(a){return [...new Set(a)]}
function any(v,rs){return (rs||[]).some(r=>new RegExp(r).test(v))}
const files=walk(SRC).filter(f=>f.endsWith(".gs") && !(policy.ignoredPathPrefixes||[]).some(p=>rel(f).startsWith(p)));
const funcs=new Map(),globals=new Map(),procNums=new Map();
const errors=[],warnings=[],allowed=[];
const metrics={files:files.length,syntaxErrors:0,duplicateProcessorNumbers:0,realDuplicateGlobals:0,realPublicFunctionConflicts:0,warningFunctionDuplicates:0,allowedNamespaceExtensions:0,allowedCompatibilityDuplicates:0,storageProcessorFiles:0,storageRuntimeBaseFiles:0,storageWriteFiles:0,lockServiceFiles:0};
for(const f of files){
  const src=fs.readFileSync(f,"utf8"),clean=strip(src),r=rel(f),base=path.basename(f);
  try{new vm.Script(src,{filename:r})}catch(e){metrics.syntaxErrors++;errors.push({type:"SYNTAX_ERROR",file:r,message:String(e.message||e)})}
  for(const m of clean.matchAll(/\bfunction\s+([A-Za-z_$][\w$]*)\s*\(/g)){if(!funcs.has(m[1]))funcs.set(m[1],[]);funcs.get(m[1]).push(r)}
  for(const m of clean.matchAll(/^\s*var\s+([A-Za-z_$][\w$]*)\s*=\s*([^;\n]+)/gm)){if(!globals.has(m[1]))globals.set(m[1],[]);globals.get(m[1]).push({file:r,expression:m[2].trim()})}
  const pm=base.match(/^(\d+)_.*Processor\.gs$/);if(pm&&r.startsWith("src/processors/")){if(!procNums.has(pm[1]))procNums.set(pm[1],[]);procNums.get(pm[1]).push(r)}
  if(r.startsWith("src/processors/runtime/storage/")&&/Processor\.gs$/.test(base)){metrics.storageProcessorFiles++;if(/SCIIP_RUNTIME_PROCESSOR_BASE|SCIIP_RUNTIME\.(PROCESSOR_BASE|runProcessor|executeProcessor)/.test(src))metrics.storageRuntimeBaseFiles++;if(/\b(setValue|setValues|appendRow|insertRows|deleteRows|clearContent)\s*\(/.test(clean))metrics.storageWriteFiles++}
  if(/LockService/.test(src))metrics.lockServiceFiles++;
}
for(const [n,ls] of procNums){const u=uniq(ls);if(u.length>1){metrics.duplicateProcessorNumbers++;errors.push({type:"DUPLICATE_PROCESSOR_NUMBER",name:n,locations:u})}}
for(const [n,defs] of globals){const locs=uniq(defs.map(d=>d.file));if(locs.length<2)continue;const ns=defs.every(d=>{const e=d.expression.replace(/\s+/g," ");return e===`${n} || {}`||e===`(typeof ${n} !== 'undefined' ? ${n} : {})`||e===`(typeof ${n} !== "undefined" ? ${n} : {})`});if((policy.allowedNamespaceGlobals||[]).includes(n)&&ns){metrics.allowedNamespaceExtensions++;allowed.push({type:"NAMESPACE_EXTENSION",name:n,locations:locs})}else{metrics.realDuplicateGlobals++;errors.push({type:"DUPLICATE_GLOBAL",name:n,locations:locs})}}
for(const [n,ls] of funcs){const locs=uniq(ls);if(locs.length<2)continue;const compat=locs.every(f=>any(f,policy.allowedFilePatterns));const someCompat=locs.some(f=>any(f,policy.allowedFilePatterns));const critical=any(n,policy.criticalPublicFunctionPatterns);const warn=any(n,policy.warningFunctionPatterns);if(compat||(someCompat&&!critical)){metrics.allowedCompatibilityDuplicates++;allowed.push({type:"COMPATIBILITY_DUPLICATE",name:n,locations:locs})}else if(critical){metrics.realPublicFunctionConflicts++;errors.push({type:"PUBLIC_FUNCTION_CONFLICT",name:n,locations:locs})}else if(warn){metrics.warningFunctionDuplicates++;warnings.push({type:"HELPER_OR_TEST_DUPLICATE",name:n,locations:locs})}else{metrics.realPublicFunctionConflicts++;errors.push({type:"FUNCTION_CONFLICT",name:n,locations:locs})}}
const report={generatedAt:new Date().toISOString(),policyVersion:"v6.1",metrics,errors,warnings,allowed};
fs.mkdirSync(GOV,{recursive:true});fs.writeFileSync(REPORT,JSON.stringify(report,null,2)+"\n");
const md=["# SCIIP_OS Architecture Governance Summary","",`Generated: ${report.generatedAt}`,"","## Errors",`- Syntax errors: ${metrics.syntaxErrors}`,`- Duplicate processor numbers: ${metrics.duplicateProcessorNumbers}`,`- Real duplicate globals: ${metrics.realDuplicateGlobals}`,`- Public/function conflicts: ${metrics.realPublicFunctionConflicts}`,"","## Warnings",`- Helper/test duplicates: ${metrics.warningFunctionDuplicates}`,"","## Allowed",`- Namespace extensions: ${metrics.allowedNamespaceExtensions}`,`- Compatibility duplicates: ${metrics.allowedCompatibilityDuplicates}`,"","## Storage signals",`- Storage processor files: ${metrics.storageProcessorFiles}`,`- Runtime-base recognized: ${metrics.storageRuntimeBaseFiles}`,`- Direct write calls: ${metrics.storageWriteFiles}`,`- LockService usage: ${metrics.lockServiceFiles}`,"",`Overall status: ${errors.length?"FAILED":"PASSED"}`].join("\n");
fs.writeFileSync(SUMMARY,md+"\n");console.log(JSON.stringify(metrics,null,2));if(errors.length){console.error(`ARCHITECTURE GOVERNANCE FAILED: ${errors.length} error finding(s)`);process.exit(1)}console.log("ARCHITECTURE GOVERNANCE PASSED");
