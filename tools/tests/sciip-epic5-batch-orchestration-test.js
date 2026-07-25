#!/usr/bin/env node
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'src/applications/data-sources/SCIIP_Epic5_Multi_SuperSheet_Batch_Orchestrator.gs');
if(!fs.existsSync(file)) throw new Error('Build 3H source missing: '+file);
const code=fs.readFileSync(file,'utf8');
const props={};
const sandbox={console,Date,JSON,Math,Utilities:{getUuid:()=>`node-${Date.now()}-${Math.random()}`},Session:{getActiveUser:()=>({getEmail:()=> 'node-certifier@example.com'})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]||null,setProperty:(k,v)=>{props[k]=v},deleteProperty:k=>{delete props[k]}})}};
vm.createContext(sandbox);vm.runInContext(code,sandbox,{filename:file});
const out=sandbox.sciipTestV7Epic5MultiSuperSheetBatchOrchestration();
if(!out||out.status!=='PASSED') { console.error(JSON.stringify(out,null,2)); process.exit(1); }
console.log(JSON.stringify(out));
