#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const repo = process.argv[2] || process.cwd();
const shared = path.join(repo, 'src', 'shared');
const context = {
  console,
  Date,
  JSON,
  Object,
  Array,
  String,
  Error,
  Utilities: { formatDate: () => '2026-07-13' },
  Session: { getScriptTimeZone: () => 'America/Los_Angeles' },
  SpreadsheetApp: { getActiveSpreadsheet: () => null },
  Logger: { log: () => {} },
  SCIIP_RUNTIME_LOGGING: { write: x => x, info: x => x, warn: x => x, error: x => x },
  SCIIP_RUNTIME_TRANSACTION_MANAGER: { run: (c,p,fn) => fn ? fn() : {} },
  sciipDateKey: () => '2026-07-13',
  sciipGraphCreateNode: x => x,
  sciipGraphCreateEdge: x => x,
  sciipGetGraphNodeSheet: () => null,
  sciipCreateCanonicalIdentity: x => x,
  sciipCreateCampus: x => x,
  sciipGetCampusSheet: () => null
};
vm.createContext(context);
['003_SCIIP_ServiceContainer.gs', '002_SCIIP_StorageBackend.gs', '001_SCIIP_StorageRuntime.gs'].forEach(file => {
  vm.runInContext(fs.readFileSync(path.join(shared, file), 'utf8'), context, { filename: file });
});
const c = context.SCIIP_SERVICE_CONTAINER;
const missing = c.CORE_SERVICES.filter(name => !c.has(name));
const mock = { dateKey: () => '2099-12-31' };
const scoped = c.withOverrides({ DateService: mock }, x => x.resolve('DateService').dateKey());
const restored = c.resolve('DateService') !== mock;
context.SCIIP_STORAGE_RUNTIME.configure({ DateService: mock });
const runtimeInjection = context.SCIIP_STORAGE_RUNTIME.getServices().DateService === mock;
context.SCIIP_STORAGE_RUNTIME.reset();
const result = {
  status: !missing.length && scoped === '2099-12-31' && restored && runtimeInjection ? 'PASSED' : 'FAILED',
  container: 'SCIIP_SERVICE_CONTAINER',
  coreServices: c.CORE_SERVICES,
  missingServices: missing,
  scopedOverridesRestore: restored,
  storageRuntimeIntegration: runtimeInjection,
  registrations: c.snapshot().length
};
console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASSED') process.exit(1);
