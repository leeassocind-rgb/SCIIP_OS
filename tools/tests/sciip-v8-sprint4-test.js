const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '../..');
const enginePath = path.join(root, 'src/applications/data-sources-commit/SCIIP_V8_Sprint4_Governed_Commit_Engine.gs');
const certPath = path.join(root, 'src/applications/data-sources-commit/SCIIP_V8_Sprint4_Certification.gs');
const failures = [];
for (const p of [enginePath, certPath]) if (!fs.existsSync(p)) failures.push(`Missing ${p}`);
if (!failures.length) {
  const context = { console, Date, JSON };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(enginePath, 'utf8'), context);
  const result = context.SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.runCertificationScenario();
  if (result.executionStatus !== 'DRY_RUN_COMPLETED') failures.push('Dry run did not complete.');
  if (result.eventsAppended !== 4) failures.push('Expected 4 events.');
  if (result.graphStatus !== 'SYNCHRONIZED') failures.push('Graph not synchronized.');
  if (result.workspacesRefreshed !== 5) failures.push('Expected 5 refreshed workspaces.');
  if (result.destructiveCommitEnabled !== false) failures.push('Destructive commit enabled.');
  const certText = fs.readFileSync(certPath, 'utf8');
  if (!certText.includes('function sciipTestV8Sprint4GovernedCommitEventLedgerGraphSyncLiveRefresh()')) failures.push('Public test function missing.');
}
const output = { framework: 'SCIIP_V8_SPRINT4_NODE_CERTIFICATION', version: 'v8.0-sprint4.0', status: failures.length ? 'FAILED' : 'PASSED', testsRun: 7, failures };
console.log(JSON.stringify(output, null, 2));
process.exit(failures.length ? 1 : 0);
