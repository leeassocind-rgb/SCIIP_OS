import assert from'node:assert/strict';
import { createCheckpointStore } from '../src/enterprise-operations/checkpointStore.js';
import {
  createIngestionRecoveryJournal,
  createIngestionReplayPlan,
  createIngestionRecoveryEngine
} from '../src/production-hardening/recovery/index.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};

const direct=createIngestionReplayPlan({
  operationId:'ING-45-DIRECT',
  backupId:'BACKUP-45',
  checkpoint:{stream:'supersheet:45',offset:4},
  failedChunk:5,
  totalChunks:10,
  error:new Error('Parser failed')
});
t(direct.status==='PENDING_APPROVAL');
t(direct.resumeChunk===5);
t(direct.remainingChunks===5);
t(!direct.replayAuthorized);
t(direct.destructiveExecutionBlocked);
t(direct.duplicateSafe);
t(!direct.sourceMutationAllowed);

const checkpointStore=createCheckpointStore();
const journal=createIngestionRecoveryJournal();
const engine=createIngestionRecoveryEngine({checkpointStore,journal});
t(engine.snapshot().status==='OPERATIONAL');
t(engine.snapshot().approvalRequired);
t(!engine.snapshot().destructiveExecutionAllowed);

const first=engine.recordCheckpoint({stream:'supersheet:45',operationId:'ING-45-1',offset:3,updatedAt:'2026-07-31T20:00:00Z'});
t(first.offset===3);
const older=engine.recordCheckpoint({stream:'supersheet:45',operationId:'ING-45-1',offset:2,updatedAt:'2026-07-31T20:01:00Z'});
t(older.offset===3);
t(older.ignored);

const failure=engine.recordFailure({
  operationId:'ING-45-1',
  stream:'supersheet:45',
  backupId:'BACKUP-45-1',
  failedChunk:3,
  totalChunks:8,
  error:Object.assign(new Error('Chunk parse failed'),{code:'CHUNK_PARSE'})
});
t(failure.resumeChunk===3);
t(failure.remainingChunks===5);
t(failure.error.code==='CHUNK_PARSE');
t(!failure.replayAuthorized);

let blocked=false;
try{engine.replay({operationId:'ING-45-1',executeChunk:()=>true})}catch{blocked=true}
t(blocked);

const approved=engine.approveReplay({
  operationId:'ING-45-1',
  actorId:'BROKER-1',
  reason:'Verified checkpoint and source file.'
});
t(approved.replayAuthorized);
t(approved.status==='READY_FOR_REPLAY');
t(approved.approvedBy==='BROKER-1');
t(!approved.destructiveExecutionBlocked);

const executed=[];
const completed=engine.replay({
  operationId:'ING-45-1',
  executeChunk:chunk=>{executed.push(chunk);return{status:'OK'}}
});
t(completed.status==='REPLAY_COMPLETED');
t(completed.replayedChunks===5);
t(executed.join(',')==='3,4,5,6,7');
t(completed.finalCheckpoint.offset===8);
t(completed.duplicateSafe);
t(!completed.sourceMutationAllowed);

t(engine.snapshot().failures===1);
t(engine.snapshot().replays===1);
t(engine.snapshot().checkpoints===1);
t(engine.snapshot().journalEntries>=8);
t(engine.getJournal().every((entry,index)=>entry.sequence===index+1));
t(engine.snapshot().appendOnly);

const duplicate=journal.append({
  id:'CUSTOM-1',
  operationId:'ING-45-1',
  type:'CUSTOM'
});
t(!duplicate.duplicate);
const duplicateAgain=journal.append({
  id:'CUSTOM-1',
  operationId:'ING-45-1',
  type:'CUSTOM'
});
t(duplicateAgain.duplicate);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE4_SPRINT45_INGESTION_ERROR_RECOVERY_REPLAY',
  status:'PASSED',
  testsRun:tests,
  result:{
    replayedChunks:completed.replayedChunks,
    finalCheckpoint:completed.finalCheckpoint.offset,
    journalEntries:engine.snapshot().journalEntries,
    approvalRequired:true,
    appendOnly:true,
    duplicateSafe:true,
    destructiveExecutionAllowed:false,
    recoveryStatus:'CERTIFIED'
  }
},null,2));
