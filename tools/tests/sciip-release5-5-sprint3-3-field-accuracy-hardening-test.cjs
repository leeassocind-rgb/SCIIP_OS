#!/usr/bin/env node
'use strict';
const assert=require('assert'),path=require('path');
const parser=require('../supersheets/sciip-air-cre-certified-parser.cjs');
const files=process.argv.slice(2);if(!files.length)throw new Error('Provide one or more AIR CRE PDFs');
let tests=0,failures=[];function test(name,fn){tests++;try{fn()}catch(e){failures.push({test:name,error:e.message})}}
const docs=files.map(f=>parser.parsePdf(path.resolve(f)));
test('rate type normalization',()=>{assert.strictEqual(parser.normalizeRateType('G'),'GRS');assert.strictEqual(parser.normalizeRateType('Gross'),'GRS');assert.strictEqual(parser.normalizeRateType('Modified Gross'),'MG');assert.strictEqual(parser.normalizeRateType('Full Service Gross'),'FSG');assert.strictEqual(parser.normalizeRateType('Industrial Gross'),'IG');assert.strictEqual(parser.normalizeRateType('NNN'),'NNN')});
test('slash loading parsing',()=>assert.deepStrictEqual(parser.parseLoading(['17/2'],''),{dockHigh:17,groundLevel:2,dhSignal:true,glSignal:true}));
test('named loading parsing',()=>{const x=parser.parseLoading([], '12 Dock High and 2 Ground Level doors');assert.strictEqual(x.dockHigh,12);assert.strictEqual(x.groundLevel,2)});
test('single-sided loading remains explicit',()=>{const x=parser.parseLoading([], '8 DH');assert.strictEqual(x.dockHigh,8);assert.strictEqual(x.groundLevel,null);assert.strictEqual(x.dhSignal,true);assert.strictEqual(x.glSignal,false)});
for(const d of docs){
 test(`${d.document.fileName}: industrial observations`,()=>assert(d.observations.length>0));
 test(`${d.document.fileName}: land excluded`,()=>assert(d.excludedObservations.some(x=>x.assetType==='LAND')));
 test(`${d.document.fileName}: no land ingested`,()=>assert.strictEqual(d.summary.landRecordsIngested,0));
 test(`${d.document.fileName}: critical completeness`,()=>assert.strictEqual(d.summary.criticalCompleteness,100));
 test(`${d.document.fileName}: no critical review`,()=>assert.strictEqual(d.summary.criticalReviewRequired,0));
 test(`${d.document.fileName}: rate type false positives suppressed`,()=>assert.strictEqual(d.reviewSummary.byField.rateType||0,0));
 test(`${d.document.fileName}: loading review precision`,()=>assert.strictEqual((d.reviewSummary.byField.dockHigh||0)+(d.reviewSummary.byField.groundLevel||0),0));
 test(`${d.document.fileName}: evidence preserved`,()=>assert(d.observations.every(x=>x.evidence&&x.evidence.sourceFile&&x.evidence.page)));
}
const result={documents:docs.length,pages:docs.reduce((s,d)=>s+d.document.pageCount,0),sourceObservations:docs.reduce((s,d)=>s+d.summary.sourceRecords,0),industrialObservations:docs.reduce((s,d)=>s+d.summary.industrialRecords,0),landExcluded:docs.reduce((s,d)=>s+d.summary.landExcluded,0),landRecordsIngested:docs.reduce((s,d)=>s+d.summary.landRecordsIngested,0),reviewRequired:docs.reduce((s,d)=>s+d.summary.reviewRequired,0),criticalReviewRequired:docs.reduce((s,d)=>s+d.summary.criticalReviewRequired,0),criticalCompleteness:docs.map(d=>d.summary.criticalCompleteness)};
console.log(JSON.stringify({framework:'SCIIP_RELEASE_5_5_SPRINT_3_3_AIR_CRE_FIELD_ACCURACY_HARDENING',version:'196.3.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures,result},null,2));if(failures.length)process.exit(1);
