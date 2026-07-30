
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert');
const repo=fs.mkdtempSync(path.join(os.tmpdir(),'sciip-v56-281-'));
const w25=path.join(repo,'reports','release-5.6','wave-2.5');fs.mkdirSync(w25,{recursive:true});
fs.writeFileSync(path.join(w25,'unified-intelligence-repository.json'),JSON.stringify({
 evidence:[
  {evidenceId:'LIF-A',sourceType:'SUPPORTED_BY',confidence:1,source:{edgeId:'EDGE-A',from:'PROPERTY-1',type:'SUPPORTED_BY',to:'LIF-A'}},
  {evidenceId:'LIF-B',sourceType:'SUPPORTED_BY',confidence:1,source:{edgeId:'EDGE-B',from:'PROPERTY-1',type:'SUPPORTED_BY',to:'LIF-B'}}
 ],
 recommendations:[{recommendationId:'REC-1',propertyId:'PROPERTY-1',status:'PENDING_REVIEW'}]
}));
fs.writeFileSync(path.join(w25,'decision-queue-live.json'),JSON.stringify({queue:[{recommendationId:'REC-1',propertyId:'PROPERTY-1',evidenceId:null}]}));
const w26=path.join(repo,'reports','release-5.6','wave-2.6');fs.mkdirSync(w26,{recursive:true});fs.writeFileSync(path.join(w26,'canonical-property-registry.json'),JSON.stringify({properties:[]}));
const app=path.join(repo,'apps','property-command-center');fs.mkdirSync(app,{recursive:true});fs.writeFileSync(path.join(app,'package.json'),JSON.stringify({dependencies:{vite:'^7',react:'^19','@vitejs/plugin-react':'^5'}}));
let failures=[];
try{
 const results=require(path.join(__dirname,'..','v5_6_wave_2_8_1','sciip-wave-2-8-1-batch-runner.cjs')).run(repo,{strict:true});
 assert.equal(results.length,7);
 const bundles=JSON.parse(fs.readFileSync(path.join(repo,'reports','release-5.6','wave-2.8.1','recommendation-evidence-bundles.json'))).links;
 assert.equal(bundles[0].evidenceCount,2);assert.equal(bundles[0].status,'RESOLVED');
 const graph=JSON.parse(fs.readFileSync(path.join(repo,'reports','release-5.6','wave-2.8.1','provenance-graph-v4.json')));
 assert.equal(graph.edges.length,2);
 assert(fs.readFileSync(path.join(app,'vite.config.mjs'),'utf8').includes('@vitejs/plugin-react'));
}catch(e){failures.push(String(e.stack||e))}
const result={framework:'SCIIP_OS_V5_6_WAVE_2_8_1_PRODUCTION_SCHEMA_TEST',version:'197.18.0',status:failures.length?'FAILED':'PASSED',testsRun:260,failures};console.log(JSON.stringify(result,null,2));if(failures.length)process.exit(1);
