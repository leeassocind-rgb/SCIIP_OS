import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repoRoot = process.cwd();
const componentPath = path.join(repoRoot, 'apps/property-command-center/src/components/GISIntelligenceWorkspace.jsx');
const storePath = path.join(repoRoot, 'apps/property-command-center/src/knowledge/graphStore.js');
const failures = [];
const component = fs.readFileSync(componentPath, 'utf8');
const store = fs.readFileSync(storePath, 'utf8');

if (!component.includes("import{readGraph}from'../knowledge/graphStore.js';")) failures.push('GIS workspace must import readGraph');
if (component.includes('loadGraph')) failures.push('Legacy loadGraph reference remains');
if (!/export function readGraph\s*\(/.test(store)) failures.push('graphStore does not export readGraph');
if (!component.includes('readGraph()')) failures.push('GIS workspace does not invoke readGraph');

const result = {
  framework: 'SCIIP_RELEASE_1_SPRINT_7_1_GIS_GRAPHSTORE_COMPATIBILITY',
  version: 'release-1-sprint-7.1',
  status: failures.length ? 'FAILED' : 'PASSED',
  testsRun: 4,
  failures,
  result: {
    applicationId: 'property-command-center',
    graphStoreBinding: failures.length ? 'INVALID' : 'COMPATIBLE',
    importedApi: 'readGraph',
    buildGate: 'REQUIRED'
  }
};
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
