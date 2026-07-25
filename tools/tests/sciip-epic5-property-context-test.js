#!/usr/bin/env node
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.resolve(__dirname,'../..'),dir=path.join(root,'src/applications/property-command-center');
const files=['SCIIP_Epic5_Property_Command_Core.gs','SCIIP_Epic5_Property_Context_Engine.gs','SCIIP_Epic5_Property_Context_Tests.gs'];
const ctx={Logger:{log:()=>{}},console};vm.createContext(ctx);files.forEach(f=>vm.runInContext(fs.readFileSync(path.join(dir,f),'utf8'),ctx,{filename:f}));
const r=ctx.sciipTestV7Epic5PropertyContextEngine();if(r.status!=='PASSED')throw new Error(JSON.stringify(r));console.log(JSON.stringify(r));
