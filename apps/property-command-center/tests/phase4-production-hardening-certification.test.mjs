import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  generateSyntheticSuperSheet,
  runLargeSuperSheetStress,
  evaluateLargeSuperSheetStress
} from '../src/production-hardening/ingestion/index.js';
import {
  profileRuntimeWorkload,
  evaluateRuntimeProfile
} from '../src/production-hardening/performance/index.js';
import { createIngestionRecoveryEngine } from '../src/production-hardening/recovery/index.js';
import {
  createMemoryDurableStorage,
  createOfflineResilienceManager
} from '../src/production-hardening/offline/index.js';
import {
  analyzeBuildAssets,
  evaluateBuildAssetBudget
} from '../src/production-hardening/build/index.js';

let tests = 0;
const t = (condition, message) => {
  tests++;
  assert.ok(condition, message || `Assertion ${tests} failed`);
};

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const fixture = generateSyntheticSuperSheet({ rows: 50000, duplicateEvery: 5000 });
const stress = runLargeSuperSheetStress({
  text: fixture.text,
  chunkSize: 2500,
  checkpointEvery: 5000
});
const stressCert = evaluateLargeSuperSheetStress(stress, {
  minimumThroughputRowsPerSecond: 1000,
  maximumRejectRatePct: 0,
  maximumDuplicateDrift: 0
});
t(stressCert.passed);
t(stress.duplicateSafe);
t(stress.resumable);

const profileFixture = generateSyntheticSuperSheet({ rows: 10000 });
const profile = await profileRuntimeWorkload({
  name: 'phase4-certification-10k',
  iterations: 3,
  workload: () => runLargeSuperSheetStress({
    text: profileFixture.text,
    chunkSize: 1000,
    checkpointEvery: 5000
  })
});
const performanceCert = evaluateRuntimeProfile(profile, {
  maximumP95Ms: 5000,
  maximumHeapDeltaMb: 512,
  bundleKb: 400,
  loadMs: 1800,
  queryMs: 250
});
t(performanceCert.passed);
t(performanceCert.gates.latency);
t(performanceCert.gates.memory);
t(performanceCert.gates.existingPerformanceBudget);

const recovery = createIngestionRecoveryEngine();
recovery.recordCheckpoint({
  stream: 'phase4:certification',
  operationId: 'PH4-CERT',
  offset: 2,
  updatedAt: '2026-07-31T22:00:00.000Z'
});
recovery.recordFailure({
  operationId: 'PH4-CERT',
  stream: 'phase4:certification',
  backupId: 'BACKUP-PH4',
  failedChunk: 2,
  totalChunks: 5,
  error: new Error('Certification failure')
});
recovery.approveReplay({
  operationId: 'PH4-CERT',
  actorId: 'CERTIFIER-1',
  reason: 'Phase 4 controlled replay validation.'
});
const replay = recovery.replay({
  operationId: 'PH4-CERT',
  executeChunk: chunk => ({ chunk, ok: true })
});
t(replay.status === 'REPLAY_COMPLETED');
t(replay.replayedChunks === 3);
t(recovery.snapshot().approvalRequired);
t(!recovery.snapshot().destructiveExecutionAllowed);

let online = false;
const delivered = [];
const offline = createOfflineResilienceManager({
  storage: createMemoryDurableStorage(),
  connectivity: () => online,
  send: async item => {
    delivered.push(item.id);
    return { ok: true };
  }
});
await offline.submit({ id: 'PH4-OFFLINE-1' });
t(offline.snapshot().queued === 1);
online = true;
const synchronized = await offline.synchronize();
t(synchronized.status === 'FLUSHED');
t(delivered.includes('PH4-OFFLINE-1'));
t(offline.snapshot().offlineResilient);
t(!offline.snapshot().sourceMutationAllowed);

const dist = path.join(app, 'dist');
t(fs.existsSync(dist));
const buildAnalysis = analyzeBuildAssets({ distDirectory: dist });
const buildCert = evaluateBuildAssetBudget(buildAnalysis);
t(buildCert.passed);
t(buildCert.gates.codeSplitting);
t(buildCert.gates.shellGzip);
t(buildCert.gates.vendorReactGzip);

const phase4 = {
  ingestionStress: stressCert.passed,
  performanceMemory: performanceCert.passed,
  recoveryReplay: replay.status === 'REPLAY_COMPLETED',
  offlineResilience: synchronized.status === 'FLUSHED',
  buildOptimization: buildCert.passed
};
t(Object.values(phase4).every(Boolean));

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE4_SPRINT48_PRODUCTION_HARDENING_CERTIFICATION',
  status: 'PASSED',
  testsRun: tests,
  result: {
    ...phase4,
    stressRows: stress.inputRows,
    stressThroughputRowsPerSecond: stress.throughputRowsPerSecond,
    performanceP95Ms: profile.p95Ms,
    heapDeltaMb: performanceCert.heapDeltaMb,
    replayedChunks: replay.replayedChunks,
    offlineItemsDelivered: delivered.length,
    buildTotalGzipKb: buildCert.metrics.totalGzipKb,
    javascriptChunks: buildCert.metrics.javascriptChunks,
    duplicateSafe: true,
    approvalRequired: true,
    sourceMutationAllowed: false,
    phase4Status: 'CERTIFIED'
  }
}, null, 2));
