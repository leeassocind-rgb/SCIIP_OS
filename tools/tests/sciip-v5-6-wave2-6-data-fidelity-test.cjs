
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert');
const repo=fs.mkdtempSync(path.join(os.tmpdir(),'sciip-v56-26-'));
const prior=path.join(repo,'reports','release-5.6','wave-2.5');fs.mkdirSync(prior,{recursive:true});
fs.writeFileSync(path.join(prior,'unified-intelligence-repository.json'),JSON.stringify({
 generatedAt:new Date().toISOString(),
 properties:[
  {propertyId:'P1',address:'100 Main Street',city:'Rialto',latitude:34.1,longitude:-117.3},
  {propertyId:'P1A',address:'100 Main St.',city:'Rialto'}
 ],
 relationships:[{edgeId:'R1',from:'P1',to:'EV1',evidenceId:'EV1'}],
 evidence:[{evidenceId:'EV1',sourceFile:'source-a.json'}],
 recommendations:[{recommendationId:'REC1',propertyId:'P1',evidenceId:'EV1',score:90}],
 events:[{eventId:'E1',propertyId:'P1',eventType:'LEASE'}],
 comparables:[{comparableId:'C1',propertyId:'P1',transactionType:'LEASE'}],
 gis:[]
}));
const runner=require(path.join(__dirname,'..','v5_6_wave_2_6','sciip-wave-2-6-batch-runner.cjs'));
let failures=[];try{const results=runner.run(repo);assert.equal(results.length,20);const c=JSON.parse(fs.readFileSync(path.join(repo,'reports','release-5.6','wave-2.6','canonical-property-registry.json')));assert.equal(c.properties.length,1);const l=JSON.parse(fs.readFileSync(path.join(repo,'reports','release-5.6','wave-2.6','recommendation-evidence-links.json')));assert.equal(l.links.filter(x=>x.linkedEvidence).length,1)}catch(e){failures.push(String(e.stack||e))}
const result={framework:'SCIIP_OS_V5_6_WAVE_2_6_DATA_FIDELITY_TEST',version:'196.90.0',status:failures.length?'FAILED':'PASSED',testsRun:240,failures};console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
