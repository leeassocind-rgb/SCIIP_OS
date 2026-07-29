#!/usr/bin/env node
'use strict';
const assert=require('assert'),path=require('path');
const parser=require('../supersheets/sciip-air-cre-certified-parser.cjs');
const files=process.argv.slice(2);if(!files.length)throw new Error('Provide one or more AIR CRE PDFs');
let tests=0,failures=[];function test(name,fn){tests++;try{fn()}catch(e){failures.push({test:name,error:e.message})}}
const docs=files.map(f=>parser.parsePdf(path.resolve(f)));
test('documents parsed',()=>assert.strictEqual(docs.length,files.length));
for(const d of docs){
 test(`${d.document.fileName}: industrial observations`,()=>assert(d.observations.length>0));
 test(`${d.document.fileName}: land discovered`,()=>assert(d.excludedObservations.some(x=>x.assetType==='LAND')));
 test(`${d.document.fileName}: land never ingested`,()=>assert.strictEqual(d.observations.filter(x=>x.section==='LAND').length,0));
 test(`${d.document.fileName}: exclusions governed`,()=>assert(d.excludedObservations.filter(x=>x.assetType==='LAND').every(x=>x.ingestionDecision==='EXCLUDED'&&x.exclusionReason==='LAND_INGESTION_DISABLED')));
 test(`${d.document.fileName}: exclusion evidence`,()=>assert(d.excludedObservations.every(x=>x.evidence&&x.evidence.sourceFile&&x.evidence.page&&Array.isArray(x.evidence.rawLines))));
 test(`${d.document.fileName}: critical completeness`,()=>assert.strictEqual(d.summary.criticalCompleteness,100));
 test(`${d.document.fileName}: source reconciliation`,()=>assert.strictEqual(d.summary.sourceRecords,d.observations.length+d.excludedObservations.length));
}
test('zero land records ingested',()=>assert.strictEqual(docs.reduce((s,d)=>s+d.summary.landRecordsIngested,0),0));
test('no unknown silently ingested',()=>assert(docs.every(d=>d.observations.every(x=>x.section==='INDUSTRIAL'))));
const result={documents:docs.length,pages:docs.reduce((s,d)=>s+d.document.pageCount,0),sourceObservations:docs.reduce((s,d)=>s+d.summary.sourceRecords,0),industrialObservations:docs.reduce((s,d)=>s+d.summary.industrialRecords,0),landExcluded:docs.reduce((s,d)=>s+d.summary.landExcluded,0),unknownExcluded:docs.reduce((s,d)=>s+d.summary.unknownExcluded,0),landRecordsIngested:docs.reduce((s,d)=>s+d.summary.landRecordsIngested,0),criticalCompleteness:docs.map(d=>d.summary.criticalCompleteness)};
console.log(JSON.stringify({framework:'SCIIP_RELEASE_5_5_SPRINT_3_2_AIR_CRE_LAND_EXCLUSION_GATE',version:'196.2.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures,result},null,2));if(failures.length)process.exit(1);
