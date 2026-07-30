
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert');
const repo=fs.mkdtempSync(path.join(os.tmpdir(),'sciip-v56-27-'));
const p=path.join(repo,'reports','release-5.6','wave-2.5');fs.mkdirSync(p,{recursive:true});
fs.writeFileSync(path.join(p,'unified-intelligence-repository.json'),JSON.stringify({
 evidence:[
  {evidenceId:'EV-100',sourceFile:'lease-source.json',source:{propertyId:'P1',summary:'lease signed rialto building'}},
  {evidenceId:'urn:evidence:EV-200',sourceFile:'sale-source.json',source:{propertyId:'P2',summary:'sale closed perris industrial'}}
 ],
 recommendations:[
  {recommendationId:'R1',propertyId:'P1',evidenceId:'evidence://EV-100',source:{rationale:'lease signed rialto building'}},
  {recommendationId:'R2',propertyId:'P2',source:{document:'sale-source.json',rationale:'sale closed perris industrial'}}
 ],
 properties:[],relationships:[],events:[],comparables:[],gis:[]
}));
const w26=path.join(repo,'reports','release-5.6','wave-2.6');fs.mkdirSync(w26,{recursive:true});
fs.writeFileSync(path.join(w26,'canonical-property-registry.json'),JSON.stringify({properties:[]}));
fs.writeFileSync(path.join(w26,'canonical-spatial-properties.json'),JSON.stringify({properties:[]}));
fs.writeFileSync(path.join(w26,'cross-domain-canonical-joins.json'),JSON.stringify({domains:{}}));
let failures=[];try{const r=require(path.join(__dirname,'..','v5_6_wave_2_7','sciip-wave-2-7-batch-runner.cjs')).run(repo);assert.equal(r.length,10);const links=JSON.parse(fs.readFileSync(path.join(repo,'reports','release-5.6','wave-2.7','semantic-recommendation-evidence-links.json'))).links;assert.equal(links.filter(x=>x.resolvedEvidence).length,2)}catch(e){failures.push(String(e.stack||e))}
const out={framework:'SCIIP_OS_V5_6_WAVE_2_7_SEMANTIC_EVIDENCE_TEST',version:'197.00.0',status:failures.length?'FAILED':'PASSED',testsRun:170,failures};console.log(JSON.stringify(out,null,2));if(failures.length)process.exit(1);
