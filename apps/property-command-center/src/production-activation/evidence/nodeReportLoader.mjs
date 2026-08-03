import fs from 'node:fs';
import path from 'node:path';

export function loadJsonReport(filePath) {
  const resolved = path.resolve(filePath);
  const stat = fs.statSync(resolved);
  const payload = JSON.parse(fs.readFileSync(resolved, 'utf8'));
  return Object.freeze({ source: resolved, bytes: stat.size, modifiedAt: stat.mtime.toISOString(), payload });
}

export function loadPhase5ReportSet(paths = {}) {
  const result = {};
  for (const [key, filePath] of Object.entries(paths)) if (filePath) result[key] = loadJsonReport(filePath);
  return Object.freeze(result);
}
