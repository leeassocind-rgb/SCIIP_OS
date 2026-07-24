const fs = require('fs');
const path = require('path');
const vm = require('vm');
const root = path.resolve(__dirname, '../..');
const enginePath = path.join(root, 'src/applications/data-sources-review/SCIIP_V8_Sprint3_Review_Engine.gs');
const testPath = path.join(root, 'src/tests/SCIIP_V8_Sprint3_Tests.gs');
const failures = [];
for (const p of [enginePath, testPath]) if (!fs.existsSync(p)) failures.push(`Missing ${p}`);
if (!failures.length) {
  const context = { console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(enginePath,'utf8'), context);
  vm.runInContext(fs.readFileSync(testPath,'utf8'), context);
  const r = context.sciipTestV8Sprint3ValidationEntityResolutionReviewWorkspace();
  if (r.status !== 'PASSED') failures.push(...r.failures.map(x=>JSON.stringify(x)));
  if (r.testsRun !== 14) failures.push(`Expected 14 tests, got ${r.testsRun}`);
}
const out = { framework:'SCIIP_V8_SPRINT3_NODE_CERTIFICATION', version:'v8.0-sprint3.0', status:failures.length?'FAILED':'PASSED', failures };
console.log(JSON.stringify(out,null,2));
process.exit(failures.length?1:0);
