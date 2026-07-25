#!/usr/bin/env node
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..'); const file=path.join(root,'src/applications/data-sources/SCIIP_Epic5_Production_Commit_Console.gs');
if(!fs.existsSync(file)) throw new Error('Build 3G source missing');
const code=fs.readFileSync(file,'utf8'); const ctx={console,Date,JSON,Math,PropertiesService:undefined,Session:undefined,Utilities:{getUuid:()=> '12345678-1234-1234-1234-123456789abc'}}; vm.createContext(ctx); vm.runInContext(code,ctx);
const out=ctx.sciipTestV7Epic5ProductionCommitConsole(); if(out.status!=='PASSED') throw new Error(JSON.stringify(out)); console.log(JSON.stringify(out));
