#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const repo = path.resolve(process.argv[2] || process.cwd());
const app = path.join(repo, 'apps/property-command-center');
const packageFile = path.join(app, 'package.json');
const mainFile = path.join(app, 'src/main.jsx');
const registryFile = path.join(app, 'src/product/workspaceRegistry.js');

for (const file of [packageFile, mainFile, registryFile]) {
  if (!fs.existsSync(file)) throw new Error(`Missing required file: ${file}`);
}

const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
const main = fs.readFileSync(mainFile, 'utf8');
const registry = fs.readFileSync(registryFile, 'utf8');

const lazyImports = [...main.matchAll(/const\s+([A-Za-z0-9_]+)\s*=\s*lazy\(/g)].length;
const conditionalRoutes = new Set(
  [...main.matchAll(/selectedTab===['"]([^'"]+)['"]/g)].map(match => match[1])
).size;

const commonMatch = registry.match(/const\s+common\s*=\s*\[(.*?)\];/s);
const commonTabs = commonMatch
  ? new Set([...commonMatch[1].matchAll(/['"]([^'"]+)['"]/g)].map(match => match[1])).size
  : 0;

const baseline = {
  framework: 'SCIIP_PHASE19_PRODUCT_BASELINE',
  status: 'BASELINED',
  generatedAt: new Date().toISOString(),
  metrics: {
    mainJsxBytes: Buffer.byteLength(main),
    workspaceRegistryBytes: Buffer.byteLength(registry),
    lazyWorkspaceImports: lazyImports,
    conditionalWorkspaceRoutes: conditionalRoutes,
    commonWorkspaceTabs: commonTabs,
    packageScriptCount: Object.keys(pkg.scripts || {}).length,
    primaryNavigationTarget: 8,
    dailyWorkflowDesignSystemCoveragePct: 0,
    realSuperSheetCorpusCertifiedPct: 0
  },
  phase19Targets: {
    primaryNavigationDestinations: 8,
    executivePriorityDiscoverySeconds: 30,
    assignmentComprehensionSeconds: 60,
    propertyComparisonSeconds: 120,
    workspaceTransitionMs: 250,
    localSearchResponseMs: 150,
    firstMeaningfulPaintMs: 2000,
    deterministicIngestionAccuracyPct: 99.9
  }
};

const outputDir = path.join(repo, 'reports/phase19');
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, 'product-readiness-baseline.json'),
  JSON.stringify(baseline, null, 2) + '\n'
);

console.log(JSON.stringify(baseline, null, 2));
