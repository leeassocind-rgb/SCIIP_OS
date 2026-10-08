#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repo = path.resolve(process.argv[2] || process.cwd());
const ignored = new Set(['node_modules', '.git', 'dist', '.sciip-backups', '.sciip-cache']);
const suspicious = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && ignored.has(entry.name)) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (
      /(?:\s2|\scopy|\sduplicate)(?=\.[^.]+$)/i.test(entry.name) ||
      entry.name === '.DS_Store' ||
      full.includes(`${path.sep}__MACOSX${path.sep}`)
    ) {
      suspicious.push(path.relative(repo, full));
    }
  }
}

walk(repo);
suspicious.sort();

const result = {
  framework: 'SCIIP_PHASE19_DUPLICATE_ARTIFACT_AUDIT',
  status: 'PASSED',
  repository: repo,
  suspiciousArtifactCount: suspicious.length,
  suspiciousArtifacts: suspicious,
  destructiveCleanupPerformed: false,
  reviewRequired: suspicious.length > 0
};

const outputDir = path.join(repo, 'reports/phase19');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, 'duplicate-artifact-audit.json'),
  JSON.stringify(result, null, 2) + '\n'
);

console.log(JSON.stringify(result, null, 2));
