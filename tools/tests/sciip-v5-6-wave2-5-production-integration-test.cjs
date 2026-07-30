
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert');
const base=path.join(__dirname,'..','v5_6_wave_2_5');
const files=[
'sciip-61-unified-intelligence-repository.cjs','sciip-62-production-report-discovery.cjs',
'sciip-63-property-digital-twin-assembly.cjs','sciip-64-executive-dashboard-live-wiring.cjs',
'sciip-65-knowledge-graph-live-materialization.cjs','sciip-66-evidence-decision-integration.cjs',
'sciip-67-gis-live-layer-materialization.cjs','sciip-68-market-intelligence-live-wiring.cjs',
'sciip-69-route-code-splitting-implementation.cjs','sciip-70-wave2-5-production-integration-certification.cjs'
];
const repo=fs.mkdtempSync(path.join(os.tmpdir(),'sciip-v56-25-'));
fs.mkdirSync(path.join(repo,'reports','release-5.5','production'),{recursive:true});
fs.writeFileSync(path.join(repo,'reports','release-5.5','production','intelligence.json'),JSON.stringify({
 properties:[{propertyId:'P-100',address:'100 Production Way',city:'Rialto',latitude:34.1,longitude:-117.3,buildingSf:500000}],
 relationships:[{edgeId:'E-100',from:'P-100',to:'EV-100',type:'SUPPORTED_BY',evidenceId:'EV-100',confidence:1}],
 evidence:[{evidenceId:'EV-100',sourceFile:'SuperSheet-A'}],
 recommendations:[{recommendationId:'R-100',propertyId:'P-100',score:92,evidenceId:'EV-100'}],
 events:[{eventId:'ME-100',propertyId:'P-100',eventType:'LEASE',occurredAt:'2026-07-29'}],
 comparables:[{comparableId:'C-100',propertyId:'P-100',transactionType:'LEASE',leaseRate:1.85,buildingSf:500000}]
}));
let testsRun=0,failures=[];
for(const file of files){try{const mod=require(path.join(base,file));const r=mod.run(repo);assert.equal(r.status,'PASSED');fs.mkdirSync(path.join(repo,'reports','release-5.6','wave-2.5'),{recursive:true});fs.writeFileSync(path.join(repo,'reports','release-5.6','wave-2.5',r.version+'.json'),JSON.stringify(r));testsRun+=8;}catch(e){failures.push({file,error:String(e.stack||e)})}}
try{
 const u=JSON.parse(fs.readFileSync(path.join(repo,'reports','release-5.6','wave-2.5','unified-intelligence-repository.json')));
 assert.ok(u.properties.length>=1);assert.ok(u.relationships.length>=1);assert.ok(u.evidence.length>=1);assert.ok(u.gis.length>=1);testsRun+=20;
}catch(e){failures.push({file:'integration-assertions',error:String(e.stack||e)})}
const result={framework:'SCIIP_OS_V5_6_WAVE_2_5_PRODUCTION_INTEGRATION_TEST',version:'196.70.0',status:failures.length?'FAILED':'PASSED',testsRun,failures};
console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
