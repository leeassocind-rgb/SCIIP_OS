import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const repo = process.cwd();
const componentPath = path.join(repo, 'apps/property-command-center/src/components/RealTimeIntelligenceCenter.jsx');
const packagePath = path.join(repo, 'apps/property-command-center/package.json');
const failures = [];
const tests = [];

function test(name, assertion) {
  try {
    if (!assertion()) throw new Error('assertion returned false');
    tests.push({ test: name, status: 'PASSED' });
  } catch (error) {
    failures.push({ test: name, error: error.message });
    tests.push({ test: name, status: 'FAILED' });
  }
}

const source = fs.readFileSync(componentPath, 'utf8');
const appPackage = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

test('ComponentExists', () => fs.existsSync(componentPath));
test('ComponentExportsDefaultFunction', () => /export\s+default\s+function\s+RealTimeIntelligenceCenter/.test(source));
test('ComponentReturnIsClosed', () => source.includes('</section>') && /\);\s*\}\s*$/.test(source));
test('RuntimeImportPresent', () => source.includes("../real-time-intelligence/realTimeRuntime.js"));
test('CapabilityRenderingPresent', () => source.includes('CAPABILITIES.map'));
test('GovernanceNoticePresent', () => source.includes('Autonomous consequential actions remain blocked'));
test('AccessibleHeadingPresent', () => source.includes('aria-labelledby="real-time-intelligence-title"'));
test('PatchVersionApplied', () => appPackage.version === '153.0.0');

const result = {
  framework: 'SCIIP_RELEASE_5_REAL_TIME_INTELLIGENCE_PLATFORM_BATCH_3_1_UI_HOTFIX',
  version: 'release-5-real-time-intelligence-platform-batch-3.1',
  status: failures.length ? 'FAILED' : 'PASSED',
  testsRun: tests.length,
  failures,
  result: {
    applicationId: 'property-command-center',
    applicationVersion: appPackage.version,
    componentStatus: failures.length ? 'INVALID' : 'REAL_TIME_INTELLIGENCE_UI_REPAIRED',
    originalGovernanceSuiteRequired: true,
    productionBuildRequired: true,
  },
  tests,
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
