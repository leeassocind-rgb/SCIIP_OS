#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const target = path.resolve(process.argv[2] || process.cwd());

const prohibitedNames = new Set([
  '.env',
  '.git',
  'node_modules',
  'dist',
  '.sciip-backups',
  '.sciip-cache',
  '__MACOSX',
  '.DS_Store'
]);

const prohibited = [];
const duplicateCandidates = [];

function walk(directory) {
  if (!fs.existsSync(directory)) throw new Error(`Target does not exist: ${directory}`);

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    const rel = path.relative(target, full);

    if (prohibitedNames.has(entry.name)) {
      prohibited.push(rel);
      if (entry.isDirectory()) continue;
    }

    if (entry.isDirectory()) {
      walk(full);
    } else if (/(?:\s2|\scopy|\sduplicate)(?=\.[^.]+$)/i.test(entry.name)) {
      duplicateCandidates.push(rel);
    }
  }
}

walk(target);

const result = {
  framework: 'SCIIP_PHASE19_RELEASE_PACKAGE_VERIFICATION',
  status: prohibited.length === 0 ? 'PASSED' : 'BLOCKED',
  target,
  prohibitedArtifactCount: prohibited.length,
  prohibitedArtifacts: prohibited.sort(),
  duplicateCandidateCount: duplicateCandidates.length,
  duplicateCandidates: duplicateCandidates.sort()
};

console.log(JSON.stringify(result, null, 2));
if (result.status !== 'PASSED') process.exitCode = 1;
