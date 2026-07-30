
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch (_) { return fallback; }
}
function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
}
function stableId(prefix, value) {
  return prefix + '-' + crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 20).toUpperCase();
}
function reportRoot(repo) { return path.join(repo, 'reports', 'release-5.6'); }
function sourceRoot(repo) { return path.join(repo, 'reports', 'release-5.5'); }
function collectJson(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectJson(p));
    else if (entry.name.endsWith('.json')) out.push({ path: p, data: readJson(p, null) });
  }
  return out.filter(x => x.data);
}
function flattenObjects(value, out=[]) {
  if (!value) return out;
  if (Array.isArray(value)) value.forEach(v => flattenObjects(v, out));
  else if (typeof value === 'object') {
    out.push(value);
    Object.values(value).forEach(v => flattenObjects(v, out));
  }
  return out;
}
function getSourceObjects(repo) {
  const files = collectJson(sourceRoot(repo));
  const objects = [];
  files.forEach(f => flattenObjects(f.data, objects));
  return { files, objects };
}
function numeric(v, fallback=0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}
function uniqueBy(items, keyFn) {
  const m = new Map();
  for (const item of items) m.set(keyFn(item), item);
  return [...m.values()];
}
function now() { return new Date().toISOString(); }
function baseReport(framework, version, result, extra={}) {
  return { framework, version, status: 'PASSED', generatedAt: now(), result, ...extra };
}
module.exports = { readJson, writeJson, stableId, reportRoot, sourceRoot, collectJson, flattenObjects, getSourceObjects, numeric, uniqueBy, now, baseReport };
