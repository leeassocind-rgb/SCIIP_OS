"use strict";
const assert = require("assert");
const path = require("path");
const {
  validateCorpus, conceptMetrics, safeDivide, VERSION
} = require(path.resolve(__dirname, "../../supersheets/parser-platform/sciip-ile-corpus-validator.js"));

let testsRun=0; const failures=[];
function test(name,fn){try{fn();testsRun+=1;}catch(e){failures.push({test:name,error:e.stack||String(e)});}}

const cases = [
  {
    caseId:"C1",
    legacyEvidence:[
      {concept:"CLEAR_HEIGHT",value:36,unit:"FT"},
      {concept:"POWER",value:{amps:2000}}
    ],
    ileEvidence:[
      {concept:"CLEAR_HEIGHT",value:36,unit:"FT"},
      {concept:"POWER",value:{amps:4000}}
    ]
  },
  {
    caseId:"C2",
    legacyEvidence:[{concept:"BUILDING_AREA",value:100000,unit:"SF"}],
    ileEvidence:[
      {concept:"BUILDING_AREA",value:100000,unit:"SF"},
      {concept:"ESFR",value:true}
    ]
  }
];

test("version",()=>assert.strictEqual(VERSION,"ile-v1.0.0-sprint7.0"));
test("safe divide zero",()=>assert.strictEqual(safeDivide(1,0),0));
test("requires array",()=>assert.throws(()=>validateCorpus({}),/array/));
test("validates cases",()=>assert.strictEqual(validateCorpus(cases).totals.cases,2));
test("counts comparisons",()=>assert.strictEqual(validateCorpus(cases).totals.comparisons,4));
test("counts matches",()=>assert.strictEqual(validateCorpus(cases).totals.match,2));
test("counts mismatches",()=>assert.strictEqual(validateCorpus(cases).totals.mismatch,1));
test("counts ILE expansion",()=>assert.strictEqual(validateCorpus(cases).totals.ileOnly,1));
test("agreement metric",()=>assert.strictEqual(validateCorpus(cases).metrics.agreementRate,0.5));
test("mismatch metric",()=>assert.strictEqual(validateCorpus(cases).metrics.mismatchRate,0.25));
test("passes permissive threshold",()=>assert.strictEqual(validateCorpus(cases).status,"PASSED"));
test("fails strict threshold",()=>assert.strictEqual(validateCorpus(cases,{minimumAgreementRate:0.9}).status,"FAILED"));
test("concept metrics",()=>assert.ok(conceptMetrics(validateCorpus(cases)).length>=3));
test("concept metrics sorted",()=>{
  const r=conceptMetrics(validateCorpus(cases)).map(x=>x.concept);
  assert.deepStrictEqual(r,[...r].sort());
});
test("corpus not mutated",()=>{
  const before=JSON.stringify(cases); validateCorpus(cases); assert.strictEqual(JSON.stringify(cases),before);
});
test("diagnostic only",()=>assert.strictEqual(validateCorpus(cases).governance.diagnosticOnly,true));
test("zero writes",()=>assert.strictEqual(validateCorpus(cases).governance.productionWrites,0));
test("deterministic",()=>assert.deepStrictEqual(validateCorpus(cases),validateCorpus(cases)));

const report={
 framework:"SCIIP_ILE_SPRINT7_CORPUS_VALIDATION_CERTIFICATION",
 version:VERSION,status:failures.length?"FAILED":"PASSED",testsRun,failures,
 result:{
  differentialValidation:true,agreementMetrics:true,conceptMetrics:true,
  thresholdGovernance:true,corpusMutation:false,deterministic:true,
  executionMode:"DIAGNOSTIC_ONLY",productionWrites:0,existingParserAuthoritative:true
 }
};
console.log(JSON.stringify(report)); process.exitCode=failures.length?1:0;
