import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  analyzeBuildAssets,
  evaluateBuildAssetBudget,
  writeBuildAssetManifest
} from '../src/production-hardening/build/index.js';

let tests = 0;
const t = (condition, message) => { tests++; assert.ok(condition, message || `Assertion ${tests} failed`); };

const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'sciip-build-'));
const assets = path.join(temp, 'assets');
fs.mkdirSync(assets, { recursive: true });
fs.writeFileSync(path.join(temp, 'index.html'), '<!doctype html><div id="root"></div>');
fs.writeFileSync(path.join(assets, 'index-main.js'), 'console.log("entry");'.repeat(100));
fs.writeFileSync(path.join(assets, 'vendor-react.js'), 'export const react=true;'.repeat(200));
for (const name of ['gis','search','a','b','c','d']) {
  fs.writeFileSync(path.join(assets, `component-${name}.js`), `export const ${name.replace('-','_')}=true;`.repeat(40));
}
fs.writeFileSync(path.join(assets, 'index.css'), 'body{margin:0}'.repeat(100));

const analysis = analyzeBuildAssets({ distDirectory: temp, generatedAt: '2026-07-31T21:00:00.000Z' });
t(analysis.generatedAt === '2026-07-31T21:00:00.000Z');
t(analysis.counts.total === 10);
t(analysis.counts.javascript === 8);
t(analysis.counts.css === 1);
t(analysis.counts.html === 1);
t(analysis.totals.bytes > 0);
t(analysis.totals.gzipBytes > 0);
t(analysis.largestAssets.length > 0);
t(analysis.manifestVersion === '1.0.0');
t(Object.isFrozen(analysis));

const certification = evaluateBuildAssetBudget(analysis, {
  maximumShellGzipKb: 100,
  maximumEntryGzipKb: 20,
  maximumVendorReactGzipKb: 20,
  maximumCssGzipKb: 10,
  maximumDuplicateGroups: 10,
  minimumJavaScriptChunks: 8
});
t(certification.passed);
t(certification.status === 'BUILD_OPTIMIZATION_CERTIFIED');
t(certification.gates.shellGzip);
t(certification.gates.entryGzip);
t(certification.gates.vendorReactGzip);
t(certification.gates.cssGzip);
t(certification.gates.codeSplitting);
t(certification.metrics.javascriptChunks === 8);

const outputFile = path.join(temp, 'reports', 'build-asset-manifest.json');
const manifest = writeBuildAssetManifest({ analysis, certification, outputFile });
t(fs.existsSync(outputFile));
t(manifest.framework === 'SCIIP_BUILD_ASSET_MANIFEST');
t(manifest.certification.passed);

const failed = evaluateBuildAssetBudget(analysis, { maximumShellGzipKb: 0.001, minimumJavaScriptChunks: 20 });
t(!failed.passed);
t(failed.status === 'BUILD_BUDGET_EXCEEDED');
t(!failed.gates.shellGzip);
t(!failed.gates.codeSplitting);

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE4_SPRINT47_BUILD_BUNDLE_OPTIMIZATION',
  status: 'PASSED',
  testsRun: tests,
  result: {
    assets: analysis.counts.total,
    javascriptChunks: analysis.counts.javascript,
    totalGzipKb: certification.metrics.totalGzipKb,
    codeSplitting: true,
    manifestWritten: true,
    optimizationStatus: certification.status
  }
}, null, 2));
