const fs = require('fs');
const path = require('path');

const root = process.cwd();
const required = [
  'src/ui/SCIIP_EnterpriseAdministration.gs',
  'src/ui/SCIIP_EnterpriseAdministration_App.html',
  'src/ui/SCIIP_EnterpriseAdministration_Styles.html',
  'src/ui/SCIIP_EnterpriseAdministration_Tests.gs'
];

const failures = required.filter(file => !fs.existsSync(path.join(root, file)));
if (failures.length) {
  console.error(JSON.stringify({status:'FAILED', failures}, null, 2));
  process.exit(1);
}

const source = fs.readFileSync(path.join(root, required[0]), 'utf8');
const checks = {
  namespace: source.includes('SCIIP_ENTERPRISE_ADMIN'),
  snapshot: source.includes('getSnapshot'),
  governance: source.includes('governanceSnapshot_'),
  deployment: source.includes('deploymentSnapshot_'),
  storage: source.includes('GOOGLE_SHEETS'),
  session: source.includes('sessionSnapshot_')
};

const failed = Object.keys(checks).filter(k => !checks[k]);
console.log(JSON.stringify({
  framework: 'SCIIP_ENTERPRISE_ADMINISTRATION_ALPHA_CERTIFICATION',
  version: 'v7.0-alpha.1',
  status: failed.length ? 'FAILED' : 'PASSED',
  checks,
  failures: failed
}, null, 2));

if (failed.length) process.exit(1);
