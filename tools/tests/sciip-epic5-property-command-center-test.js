#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),vm=require('vm');const repo=path.resolve(__dirname,'..','..'),base=path.join(repo,'src','applications','property-command-center');
const files=['SCIIP_Epic5_Property_Command_Core.gs','SCIIP_Epic5_Property_Command_Application.gs','SCIIP_Epic5_Property_Command_Tests.gs'];const context={console,Date,JSON,Math,Number,String,Object,Array,Error,isFinite,Logger:{log(){}}};vm.createContext(context);for(const f of files){const p=path.join(base,f);if(!fs.existsSync(p))throw new Error('Missing Epic 5 file: '+f);vm.runInContext(fs.readFileSync(p,'utf8'),context,{filename:f});}
const result=context.sciipTestV7Epic5PropertyCommandCenter();console.log(JSON.stringify(result));if(result.status!=='PASSED')process.exit(1);
