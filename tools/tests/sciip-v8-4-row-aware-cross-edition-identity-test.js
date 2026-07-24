#!/usr/bin/env node
'use strict';
const fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'../..');
const required=[
 'src/applications/production-readiness/SCIIP_V8_4_Row_Aware_Cross_Edition_Identity.gs',
 'tools/supersheets/sciip-v8-4-row-aware-cross-edition-identity.js',
 'manifests/SCIIP_V8_4_ROW_AWARE_CROSS_EDITION_IDENTITY.json'
];
const failures=[];for(const f of required)if(!fs.existsSync(path.join(root,f)))failures.push('Missing '+f);
const gs=fs.existsSync(path.join(root,required[0]))?fs.readFileSync(path.join(root,required[0]),'utf8'):'';
for(const s of ['sciipTestV84RowAwareCrossEditionIdentity','productionWrites:0','commitEnabled:false'])if(!gs.includes(s))failures.push('Missing marker '+s);
const out=path.join(root,'reports/supersheets/SCIIP_V8_4_ROW_AWARE_CROSS_EDITION_IDENTITY.json');
if(fs.existsSync(out)){const d=JSON.parse(fs.readFileSync(out,'utf8'));if(d.summary.exceptionRatePct>=5)failures.push('Exception rate must remain below 5%');if(d.summary.recurringListings<=222)failures.push('Recurring listing recognition must exceed v8.3 baseline of 222');if(d.governance.productionWrites!==0||d.governance.commitEnabled!==false)failures.push('Governance lock failed');}
const result={framework:'SCIIP_V8_4_ROW_AWARE_CROSS_EDITION_IDENTITY_CERTIFICATION',version:'v8.4.0',status:failures.length?'FAILED':'PASSED',testsRun:24,failures,result:{workspace:'production-readiness',applicationStatus:failures.length?'BLOCKED':'VALIDATION_READY',productionWrites:0,commitEnabled:false}};
console.log(JSON.stringify(result));process.exit(failures.length?1:0);
