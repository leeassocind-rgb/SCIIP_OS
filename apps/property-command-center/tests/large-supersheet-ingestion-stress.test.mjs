import assert from'node:assert/strict';
import{
  generateSyntheticSuperSheet,
  runLargeSuperSheetStress,
  evaluateLargeSuperSheetStress
}from'../src/production-hardening/ingestion/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
const fixture=generateSyntheticSuperSheet({rows:100000,duplicateEvery:10000});
t(fixture.rows===100000);
t(fixture.headers.length===8);
t(fixture.bytes>1000000);
t(fixture.checksum.length===8);

const observed=[];
const result=runLargeSuperSheetStress({
  text:fixture.text,
  chunkSize:5000,
  checkpointEvery:10000,
  onCheckpoint:item=>observed.push(item)
});
t(result.inputRows===100000);
t(result.processedRows===99991);
t(result.duplicates===9);
t(result.rejected===0);
t(result.uniqueIds===99991);
t(result.chunks===20);
t(result.chunkSize===5000);
t(result.checkpoints.length===9);
t(observed.length===9);
t(result.checkpoints.every(item=>item.resumable));
t(result.duplicateSafe);
t(result.resumable);
t(!result.sourceMutationAllowed);
t(result.throughputRowsPerSecond>0);
t(result.durationMs>=0);
t(Object.isFrozen(result));

const certification=evaluateLargeSuperSheetStress(result,{
  minimumThroughputRowsPerSecond:1000,
  maximumRejectRatePct:0,
  maximumDuplicateDrift:0
});
t(certification.passed);
t(certification.status==='STRESS_CERTIFIED');
t(certification.gates.accounting);
t(certification.gates.duplicateSafe);
t(certification.gates.resumable);

const malformed='Property_ID,Address\n,Missing id\nP-1,Valid';
const rejected=runLargeSuperSheetStress({text:malformed,chunkSize:1});
t(rejected.rejected===1);
t(rejected.processedRows===1);
t(rejected.duplicateSafe);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE4_SPRINT43_LARGE_SUPERSHEET_INGESTION_STRESS',
  status:'PASSED',
  testsRun:tests,
  result:{
    inputRows:result.inputRows,
    processedRows:result.processedRows,
    duplicates:result.duplicates,
    rejected:result.rejected,
    chunks:result.chunks,
    checkpoints:result.checkpoints.length,
    throughputRowsPerSecond:result.throughputRowsPerSecond,
    duplicateSafe:true,
    resumable:true,
    stressStatus:certification.status
  }
},null,2));
