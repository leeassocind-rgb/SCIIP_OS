#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '../..');
const runtimePath = path.join(root, 'src/shared/001_SCIIP_StorageRuntime.gs');
const runtimeSource = fs.readFileSync(runtimePath, 'utf8');
const failures = [];
const processors = [];
for (let number = 11900; number <= 11990; number += 10) {
  const dir = path.join(root, 'src/processors/runtime/storage');
  const file = fs.readdirSync(dir).find(name => name.startsWith(String(number) + '_') && name.endsWith('.gs'));
  if (!file) { failures.push(`missing pilot processor ${number}`); continue; }
  const source = fs.readFileSync(path.join(dir, file), 'utf8');
  processors.push(file);
  if (!source.includes('SCIIP_STORAGE_RUNTIME.executeControlPlaneOnly(cfg)')) failures.push(`${file} does not use SCIIP_STORAGE_RUNTIME`);
  if (source.includes('SCIIP_DISTRIBUTED_RUNTIME_STORAGE.executeControlPlaneOnly(cfg)')) failures.push(`${file} retains legacy runtime call`);
}
const logs = [];
const context = {
  console,
  Utilities: { formatDate: () => '2026-07-13' },
  Session: { getScriptTimeZone: () => 'America/Los_Angeles' },
  SpreadsheetApp: { getActiveSpreadsheet: () => null },
  Date,
};
vm.createContext(context);
vm.runInContext(runtimeSource, context, { filename: runtimePath });
const runtime = context.SCIIP_STORAGE_RUNTIME;
if (!runtime || runtime.VERSION !== 'v6.1') failures.push('canonical runtime was not initialized');
runtime.configure({
  DateService: { dateKey: () => '2026-07-13' },
  StorageService: { getActiveSpreadsheetSafe: () => null, getWorkbookCellCount: () => 10000000 },
  LoggingService: { info: (event, result) => logs.push({ event, result }) }
});
const cfg = { processorNumber: 11900, processorName: 'StorageAbstractionReadiness', component: 'Runtime Storage Abstraction', sourceSheet: 'SOURCE', targetSheet: 'TARGET', statusField: 'storageAbstractionReadinessStatus', nextAction: 'Run 11910.' };
const result = runtime.executeControlPlaneOnly(cfg);
const payload = JSON.parse(result.message);
if (result.status !== 'SKIPPED_NO_INPUTS') failures.push('unexpected runtime status');
if (result.frameworkVersion !== 'v6.1') failures.push('unexpected framework version');
if (!payload.capacityState.atOrAboveLimit) failures.push('capacity-safe state not preserved');
if (logs.length !== 1) failures.push('injected logging service was not called');
let validationThrown = false;
try { runtime.executeControlPlaneOnly({}); } catch (err) { validationThrown = true; }
if (!validationThrown) failures.push('invalid configuration was not rejected');
if (failures.length) {
  console.error(JSON.stringify({ status: 'FAILED', failures }, null, 2));
  process.exit(1);
}
console.log(JSON.stringify({ status: 'PASSED', runtime: 'SCIIP_STORAGE_RUNTIME', pilotProcessors: processors.length, range: '11900-11990', dependencyInjection: true, capacitySafe: true }, null, 2));
