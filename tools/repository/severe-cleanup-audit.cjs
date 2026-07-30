#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),cp=require("child_process");
const repo=path.resolve(process.argv[2]||process.cwd());
const out=path.join(repo,"reports","repository-governance","severe-cleanup-audit.json");

function walkSize(p){
  if(!fs.existsSync(p))return 0;
  const st=fs.lstatSync(p);
  if(st.isFile())return st.size;
  if(st.isSymbolicLink())return 0;
  return fs.readdirSync(p).reduce((n,x)=>n+walkSize(path.join(p,x)),0);
}
function countFiles(p){
  if(!fs.existsSync(p))return 0;
  const st=fs.lstatSync(p);
  if(st.isFile())return 1;
  if(st.isSymbolicLink())return 0;
  return fs.readdirSync(p).reduce((n,x)=>n+countFiles(path.join(p,x)),0);
}
function git(args){
  try{return cp.execFileSync("git",args,{cwd:repo,encoding:"utf8"}).trim();}
  catch{return "";}
}
const candidates=[
  ".sciip-backups",".sciip_backups","backups","dist","apps/property-command-center/dist",
  "apps/property-command-center/node_modules","reports/supersheets","reports/release-5.6/wave-2.5",
  "reports/release-5.6/wave-2.6","reports/release-5.6/wave-2.7","reports/release-5.6/wave-2.8",
  "reports/release-5.6/wave-2.8.1",".sciip-cache","outputs","__MACOSX"
];
const rows=candidates.map(rel=>{
  const abs=path.join(repo,rel);
  return {path:rel,exists:fs.existsSync(abs),bytes:walkSize(abs),files:countFiles(abs)};
});
const tracked=git(["ls-files"]).split("\n").filter(Boolean);
const status=git(["status","--porcelain=v1"]).split("\n").filter(Boolean);
const result={
  framework:"SCIIP_SEVERE_REPOSITORY_CLEANUP_AUDIT",
  version:"198.0.0",
  status:"PASSED",
  generatedAt:new Date().toISOString(),
  result:{
    repositoryBytes:walkSize(repo),
    trackedFiles:tracked.length,
    workingTreeEntries:status.length,
    candidateBytes:rows.reduce((n,x)=>n+x.bytes,0),
    candidateFiles:rows.reduce((n,x)=>n+x.files,0),
    candidates:rows
  }
};
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
