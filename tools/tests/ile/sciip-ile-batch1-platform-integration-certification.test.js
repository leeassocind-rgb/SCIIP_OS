"use strict";
const {spawnSync}=require("child_process");
const path=require("path");

const tests=[
 "sciip-ile-integration-adapter.test.js",
 "sciip-ile-corpus-validator.test.js",
 "sciip-ile-knowledge-graph-adapter.test.js"
];

const results=[];
for(const file of tests){
 const p=spawnSync(process.execPath,[path.resolve(__dirname,file)],{encoding:"utf8"});
 let parsed=null;
 try{parsed=JSON.parse((p.stdout||"").trim().split("\n").filter(Boolean).pop());}
 catch(e){parsed={status:"FAILED",failures:[{error:"Invalid child report"}]};}
 results.push({file,status:parsed.status,testsRun:parsed.testsRun||0,failures:parsed.failures||[]});
}
const failures=results.filter(r=>r.status!=="PASSED");
const report={
 framework:"SCIIP_ILE_BATCH1_PLATFORM_INTEGRATION_CERTIFICATION",
 version:"ile-v1.0.0-batch1.0",
 status:failures.length?"FAILED":"PASSED",
 testsRun:results.reduce((s,r)=>s+r.testsRun,0),
 failures,
 result:{
  sprint6IntegrationAdapter:results[0].status==="PASSED",
  sprint7CorpusValidation:results[1].status==="PASSED",
  sprint8KnowledgeGraphIntegration:results[2].status==="PASSED",
  executionMode:"DIAGNOSTIC_ONLY",
  productionWrites:0,
  commitEnabled:false,
  existingParserAuthoritative:true,
  existingKnowledgeGraphAuthoritative:true
 }
};
console.log(JSON.stringify(report));
process.exitCode=failures.length?1:0;
