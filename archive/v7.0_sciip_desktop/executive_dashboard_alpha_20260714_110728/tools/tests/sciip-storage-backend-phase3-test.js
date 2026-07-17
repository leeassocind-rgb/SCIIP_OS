#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '../..');
const backendPath = path.join(root, 'src/shared/002_SCIIP_StorageBackend.gs');
const runtimePath = path.join(root, 'src/shared/001_SCIIP_StorageRuntime.gs');
const failures = [];
const context = {
  console,
  Utilities: { formatDate: () => '2026-07-13' },
  Session: { getScriptTimeZone: () => 'America/Los_Angeles' },
  SpreadsheetApp: { getActiveSpreadsheet: () => null },
  Date
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(backendPath, 'utf8'), context, { filename: backendPath });
vm.runInContext(fs.readFileSync(runtimePath, 'utf8'), context, { filename: runtimePath });
const backend = context.SCIIP_STORAGE_BACKEND;
const runtime = context.SCIIP_STORAGE_RUNTIME;
if (!backend || backend.VERSION !== 'v6.1') failures.push('backend namespace not initialized');
if (!runtime || runtime.VERSION !== 'v6.1') failures.push('storage runtime not initialized');
const expected = ['BIGQUERY', 'CLOUD_SQL', 'FIRESTORE', 'GOOGLE_SHEETS', 'LOCAL_RUNTIME'];
const names = backend.list().map(x => x.name);
expected.forEach(name => { if (!names.includes(name)) failures.push(`missing backend ${name}`); });
backend.use('LOCAL_RUNTIME');
let result = backend.execute({ operation: 'append', collection: 'test', data: [{ id: 1 }, { id: 2 }] });
if (!result.ok || result.recordsWritten !== 2) failures.push('local append failed');
result = backend.execute({ operation: 'read', collection: 'test' });
if (!result.ok || result.recordsRead !== 2 || result.data.length !== 2) failures.push('local read failed');
backend.use('BIGQUERY');
result = backend.healthCheck();
if (result.ok !== false || result.status !== 'BACKEND_UNAVAILABLE') failures.push('BigQuery did not fail closed');
const calls = [];
backend.configure({ BigQueryClient: { execute: request => { calls.push(request); return { ok: true, status: 'SUCCESS', recordsRead: 1, recordsWritten: 0 }; } } });
result = backend.healthCheck('BIGQUERY');
if (!result.ok || calls.length !== 1) failures.push('injected BigQuery client was not used');
runtime.configure({ DateService: { dateKey: () => '2026-07-13' } });
runtime.useBackend('LOCAL_RUNTIME');
const cfg = { processorNumber: 11900, processorName: 'StorageAbstractionReadiness', component: 'Runtime Storage Abstraction', sourceSheet: 'SOURCE', targetSheet: 'TARGET', statusField: 'storageAbstractionReadinessStatus', nextAction: 'Run 11910.' };
result = runtime.executeControlPlaneOnly(cfg);
const payload = JSON.parse(result.message);
if (payload.storageBackend !== 'LOCAL_RUNTIME') failures.push('runtime did not expose selected backend');
if (!payload.backendHealth || payload.backendHealth.status !== 'AVAILABLE') failures.push('runtime backend health missing');
if (result.status !== 'SKIPPED_NO_INPUTS') failures.push('capacity-safe status changed');
if (failures.length) {
  console.error(JSON.stringify({ status: 'FAILED', failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: 'PASSED', abstraction: 'SCIIP_STORAGE_BACKEND', backends: expected, failClosedExternalAdapters: true, localRuntimeOperational: true, runtimeIntegration: true }, null, 2));
