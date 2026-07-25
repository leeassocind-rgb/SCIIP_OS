#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const ROOT=process.cwd();
const required=['src/api/SCIIP_API_Foundation.gs','src/api/SCIIP_API_Contract.gs','src/api/SCIIP_API_Tests.gs','governance/api-contract-v1.json','docs/SCIIP_API_FOUNDATION.md'];
const failures=[];
for(const file of required) if(!fs.existsSync(path.join(ROOT,file))) failures.push('missing:'+file);
let source=''; try{source=fs.readFileSync(path.join(ROOT,'src/api/SCIIP_API_Foundation.gs'),'utf8');}catch(_){ }
const checks={doGet:/function\s+doGet\s*\(/.test(source),doPost:/function\s+doPost\s*\(/.test(source),version:/VERSION\s*=\s*['"]v1['"]/.test(source),router:/function\s+dispatch\s*\(/.test(source),validation:/INVALID_JSON/.test(source),auth:/AUTH_NOT_CONFIGURED/.test(source),envelope:/requestId/.test(source)&&/timestamp/.test(source)&&/httpStatus/.test(source),failClosed:/if\s*\(!authProvider\)/.test(source)};
for(const [name,ok] of Object.entries(checks)) if(!ok) failures.push('check:'+name);
let contract=null; try{contract=JSON.parse(fs.readFileSync(path.join(ROOT,'governance/api-contract-v1.json'),'utf8'));}catch(e){failures.push('invalid-contract-json');}
if(contract && contract.apiVersion!=='v1') failures.push('contract-version');
const body={framework:'SCIIP_API_CERTIFICATION',version:'v6.1-phase7c',status:failures.length?'FAILED':'PASSED',certifiedAt:new Date().toISOString(),checks,failures};
body.certificateId=crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex').slice(0,24).toUpperCase();
fs.writeFileSync(path.join(ROOT,'governance/api-certification.json'),JSON.stringify(body,null,2)+'\n');
console.log(JSON.stringify(body,null,2));
if(failures.length) process.exit(1);
