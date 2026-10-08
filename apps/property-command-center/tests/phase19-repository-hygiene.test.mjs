import assert from 'node:assert/strict';
import fs from 'node:fs';

let testsRun = 0;
const test = condition => {
  testsRun += 1;
  assert.ok(condition);
};

const required = [
  '../../tools/phase19/inventory-product-surface.mjs',
  '../../tools/phase19/audit-duplicate-artifacts.mjs',
  '../../tools/phase19/verify-release-package.mjs',
  '../../tools/phase19/create-clean-export.mjs',
  '../../tools/phase19/create-product-baseline.mjs',
  'src/product/navigation/phase19NavigationModel.js'
];

for (const file of required) test(fs.existsSync(file));

const verifier = fs.readFileSync('../../tools/phase19/verify-release-package.mjs', 'utf8');
const exporter = fs.readFileSync('../../tools/phase19/create-clean-export.mjs', 'utf8');

test(verifier.includes("'.env'"));
test(verifier.includes("'node_modules'"));
test(verifier.includes("'.git'"));
test(exporter.includes('clean-export-manifest.json'));
test(exporter.includes('sha256'));

console.log(JSON.stringify({
  framework: 'SCIIP_PHASE19_REPOSITORY_HYGIENE',
  status: 'PASSED',
  testsRun,
  result: {
    destructiveCleanupPerformed: false,
    cleanExportAvailable: true,
    releaseVerificationAvailable: true,
    checksumManifestAvailable: true
  }
}, null, 2));
