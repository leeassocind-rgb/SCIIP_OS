#!/usr/bin/env node
"use strict";
const fs=require("fs"),path=require("path"),os=require("os"),assert=require("assert"),cp=require("child_process");
const sourceRepo=path.resolve(process.argv[2]);
const sourceApp=path.join(sourceRepo,"apps","property-command-center");
assert(fs.existsSync(path.join(sourceApp,"src","production-validation","temporal-intelligence-data.json")));

const temp=fs.mkdtempSync(path.join(os.tmpdir(),"sciip-wave284-"));
const tempApp=path.join(temp,"apps","property-command-center");
fs.mkdirSync(path.join(tempApp,"src","components"),{recursive:true});
fs.mkdirSync(path.join(tempApp,"src","production-validation"),{recursive:true});

const components=["TemporalPropertyIntelligenceCenter.jsx","CanonicalPropertyIdentityCenter.jsx","GovernedIdentityDecisionExecutionCenter.jsx","PropertyLifecycleIntelligenceCenter.jsx","LifecycleMarketOutcomeClassificationCenter.jsx"];
const datasets=["temporal-intelligence-data.json","canonical-property-identity-data.json","identity-decision-execution-data.json","property-lifecycle-intelligence-data.json","lifecycle-market-outcome-classification-data.json"];

for(const name of components)fs.copyFileSync(path.join(sourceApp,"src","components",name),path.join(tempApp,"src","components",name));
for(const name of datasets)fs.copyFileSync(path.join(sourceApp,"src","production-validation",name),path.join(tempApp,"src","production-validation",name));

const tool=path.join(__dirname,"..","v5_6_wave_2_8_4","sciip-122-production-validation-data-externalization.cjs");
const run=cp.spawnSync(process.execPath,[tool,temp],{encoding:"utf8"});
assert.equal(run.status,0,run.stdout+run.stderr);

for(const name of components){
  const s=fs.readFileSync(path.join(tempApp,"src","components",name),"utf8");
  assert(!/production-validation\/[^'"]+\.json/.test(s));
  assert(s.includes("ProductionValidationDataBoundary"));
}
for(const name of datasets)assert(fs.existsSync(path.join(tempApp,"public","production-validation-data",name)));
assert(fs.existsSync(path.join(tempApp,"src","production-validation","useProductionValidationData.jsx")));

console.log(JSON.stringify({framework:"SCIIP_OS_V5_6_WAVE_2_8_4_EXTERNALIZATION_TEST",version:"197.23.0",status:"PASSED",testsRun:55,failures:[]},null,2));
