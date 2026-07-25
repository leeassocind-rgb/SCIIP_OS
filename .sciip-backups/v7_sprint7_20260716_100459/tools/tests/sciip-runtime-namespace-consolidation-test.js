#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const shared = path.join(root, 'src/shared');
const files = fs.readdirSync(shared).filter(f => f.endsWith('.gs'));
const declarations = [];
for (const file of files) {
  const text = fs.readFileSync(path.join(shared, file), 'utf8');
  if (/^var\s+SCIIP_RUNTIME\s*=/m.test(text)) declarations.push(file);
}
const compat = fs.readFileSync(path.join(shared, 'SCIIP_RuntimeCompatibility.gs'), 'utf8');
const required = ['result','compactPayload','createContext','getSpreadsheet','ensureSheet','runTransaction','runBaseProcessor','log','logInfo','logWarn','logErrorEvent','logDebug','logAudit'];
const missing = required.filter(name => !compat.includes("bind('" + name + "'"));
const scattered = [];
for (const file of files) {
  if (file === 'SCIIP_RuntimeCompatibility.gs' || file === 'SCIIP_RuntimeCommon.gs') continue;
  const text = fs.readFileSync(path.join(shared, file), 'utf8');
  for (const name of required) {
    const re = new RegExp('SCIIP_RUNTIME\\.' + name + '\\s*=');
    if (re.test(text)) scattered.push(file + ':' + name);
  }
}
const ok = declarations.length === 1 && declarations[0] === '000_SCIIP_RuntimeNamespace.gs' && missing.length === 0 && scattered.length === 0;
console.log(JSON.stringify({status: ok ? 'PASSED':'FAILED', namespaceOwners: declarations, missingAliases: missing, scatteredAliases: scattered}, null, 2));
process.exit(ok ? 0 : 1);
