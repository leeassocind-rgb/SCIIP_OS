#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repo = path.resolve(process.argv[2] || process.cwd());
const app = path.join(repo, 'apps/property-command-center');

function requireFile(rel) {
  const file = path.join(repo, rel);
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${rel}`);
  return file;
}

const packageFile = requireFile('apps/property-command-center/package.json');
const mainFile = requireFile('apps/property-command-center/src/main.jsx');
const registryFile = requireFile('apps/property-command-center/src/product/workspaceRegistry.js');

const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
const main = fs.readFileSync(mainFile, 'utf8');
const registry = fs.readFileSync(registryFile, 'utf8');

function walk(directory, collector = []) {
  if (!fs.existsSync(directory)) return collector;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full, collector);
    else collector.push(full);
  }
  return collector;
}

const srcFiles = walk(path.join(app, 'src'));
const testFiles = walk(path.join(app, 'tests'));
const componentFiles = srcFiles.filter(file => file.endsWith('.jsx') && file.includes(`${path.sep}components${path.sep}`));
const uiFiles = srcFiles.filter(file => file.includes(`${path.sep}components${path.sep}ui${path.sep}`));
const cssFiles = srcFiles.filter(file => file.endsWith('.css'));
const scripts = Object.keys(pkg.scripts || {});
const testScripts = scripts.filter(key => key.startsWith('test:'));
const certificationScripts = scripts.filter(key => key.startsWith('certify:'));

const lazyImports = [...main.matchAll(/const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(/g)].map(match => match[1]);
const routeLabels = [...main.matchAll(/selectedTab===['"]([^'"]+)['"]/g)].map(match => match[1]);
const commonMatch = registry.match(/const\s+common\s*=\s*\[(.*?)\];/s);
const commonLabels = commonMatch
  ? [...commonMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1])
  : [];

const duplicateCandidates = [...srcFiles, ...testFiles]
  .map(file => path.relative(repo, file))
  .filter(file => /(?:^|\/).+(?:\s2| copy| duplicate)\.[^/]+$/i.test(file));

const validationDataFiles = srcFiles
  .filter(file => file.includes(`${path.sep}production-validation${path.sep}`))
  .filter(file => fs.statSync(file).size >= 1024 * 1024)
  .map(file => ({
    path: path.relative(repo, file),
    bytes: fs.statSync(file).size
  }))
  .sort((a, b) => b.bytes - a.bytes);

const result = {
  framework: 'SCIIP_PHASE19_PRODUCT_SURFACE_INVENTORY',
  status: 'PASSED',
  generatedAt: new Date().toISOString(),
  repository: repo,
  application: app,
  sourceFiles: srcFiles.length,
  testFiles: testFiles.length,
  componentFiles: componentFiles.length,
  sharedUiPrimitiveFiles: uiFiles.length,
  cssFiles: cssFiles.length,
  packageScripts: scripts.length,
  testScripts: testScripts.length,
  certificationScripts: certificationScripts.length,
  lazyWorkspaceImports: lazyImports.length,
  routedWorkspaceLabels: new Set(routeLabels).size,
  commonWorkspaceLabels: new Set(commonLabels).size,
  mainJsxBytes: Buffer.byteLength(main),
  workspaceRegistryBytes: Buffer.byteLength(registry),
  duplicateCandidates,
  largeValidationDataFiles: validationDataFiles,
  findings: {
    navigationSurfaceRequiresSimplification: new Set(commonLabels).size > 12,
    mainRouterRequiresExtraction: Buffer.byteLength(main) > 20000,
    sharedUiLibraryRequiresExpansion: uiFiles.length < 12,
    packageScriptsRequireManifestMigration: scripts.length > 100,
    validationDataRequiresExternalization: validationDataFiles.length > 0
  }
};

const outputDir = path.join(repo, 'reports/phase19');
fs.mkdirSync(outputDir, { recursive: true });
const outputFile = path.join(outputDir, 'product-surface-inventory.json');
fs.writeFileSync(outputFile, JSON.stringify(result, null, 2) + '\n');

console.log(JSON.stringify(result, null, 2));
