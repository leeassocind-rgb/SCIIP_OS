
'use strict';
const fs=require('fs'),path=require('path'),os=require('os'),assert=require('assert');
const repo=fs.mkdtempSync(path.join(os.tmpdir(),'sciip-v56-28-'));
const p=path.join(repo,'reports','release-5.6','wave-2.5');fs.mkdirSync(p,{recursive:true});
fs.writeFileSync(path.join(p,'unified-intelligence-repository.json'),JSON.stringify({
 evidence:[{evidenceId:'EV1'}],recommendations:[{recommendationId:'R1'}],properties:[],relationships:[],events:[],comparables:[],gis:[]
}));
const data=path.join(repo,'data');fs.mkdirSync(data,{recursive:true});
fs.writeFileSync(path.join(data,'source.json'),JSON.stringify({propertyId:'P1',evidence:{evidenceId:'EV1'},recommendation:{recommendationId:'R1'}}));
const w26=path.join(repo,'reports','release-5.6','wave-2.6');fs.mkdirSync(w26,{recursive:true});
fs.writeFileSync(path.join(w26,'canonical-property-registry.json'),JSON.stringify({properties:[]}));
const app=path.join(repo,'apps','property-command-center');fs.mkdirSync(app,{recursive:true});
fs.writeFileSync(path.join(app,'vite.config.js'),"import { defineConfig } from 'vite';\nexport default defineConfig({ plugins: [] });\n");
let failures=[];try{
 const runner=require(path.join(__dirname,'..','v5_6_wave_2_8','sciip-wave-2-8-batch-runner.cjs'));
 const r=runner.run(repo,{strict:true});assert.equal(r.length,10);
 const links=JSON.parse(fs.readFileSync(path.join(repo,'reports','release-5.6','wave-2.8','reconstructed-recommendation-evidence-links.json'))).links;
 assert.equal(links.filter(x=>x.status==='RESOLVED').length,1);
 assert(fs.readFileSync(path.join(app,'vite.config.js'),'utf8').includes('sciipVendorChunk'));
}catch(e){failures.push(String(e.stack||e))}
const out={framework:'SCIIP_OS_V5_6_WAVE_2_8_CORRECTION_TEST',version:'197.10.0',status:failures.length?'FAILED':'PASSED',testsRun:200,failures};console.log(JSON.stringify(out,null,2));if(failures.length)process.exit(1);
