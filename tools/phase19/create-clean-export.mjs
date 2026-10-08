#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const repo = path.resolve(process.argv[2] || process.cwd());
const destination = path.resolve(
  process.argv[3] || path.join(path.dirname(repo), `${path.basename(repo)}-clean-export`)
);

const excludedNames = new Set([
  '.env',
  '.git',
  'node_modules',
  'dist',
  '.sciip-backups',
  '.sciip-cache',
  '__MACOSX',
  '.DS_Store'
]);

const excludedPrefixes = [
  'archive',
  'apps/property-command-center/public/production-validation-data'
];

function normalize(rel) {
  return rel.split(path.sep).join('/');
}

function excluded(rel, name) {
  const normalized = normalize(rel);
  return excludedNames.has(name) ||
    excludedPrefixes.some(prefix => normalized === prefix || normalized.startsWith(`${prefix}/`));
}

if (!fs.existsSync(path.join(repo, 'apps/property-command-center/package.json'))) {
  throw new Error('Wrong repository location: Property Command Center package.json not found');
}

fs.rmSync(destination, { recursive: true, force: true });
fs.mkdirSync(destination, { recursive: true });

const manifest = [];
const omitted = [];

function copyTree(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    const rel = path.relative(repo, source);

    if (excluded(rel, entry.name)) {
      omitted.push(normalize(rel));
      continue;
    }

    const output = path.join(destination, rel);

    if (entry.isDirectory()) {
      fs.mkdirSync(output, { recursive: true });
      copyTree(source);
    } else {
      fs.mkdirSync(path.dirname(output), { recursive: true });
      fs.copyFileSync(source, output);
      const bytes = fs.statSync(source).size;
      const sha256 = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex');
      manifest.push({ path: normalize(rel), bytes, sha256 });
    }
  }
}

copyTree(repo);
manifest.sort((a, b) => a.path.localeCompare(b.path));
omitted.sort();

const metadata = {
  framework: 'SCIIP_PHASE19_CLEAN_EXPORT',
  status: 'CREATED',
  source: repo,
  destination,
  generatedAt: new Date().toISOString(),
  fileCount: manifest.length,
  totalBytes: manifest.reduce((sum, item) => sum + item.bytes, 0),
  omitted,
  files: manifest
};

fs.mkdirSync(path.join(destination, 'reports/phase19'), { recursive: true });
fs.writeFileSync(
  path.join(destination, 'reports/phase19/clean-export-manifest.json'),
  JSON.stringify(metadata, null, 2) + '\n'
);

console.log(JSON.stringify({
  framework: metadata.framework,
  status: metadata.status,
  source: metadata.source,
  destination: metadata.destination,
  fileCount: metadata.fileCount,
  totalBytes: metadata.totalBytes,
  omittedCount: omitted.length
}, null, 2));
