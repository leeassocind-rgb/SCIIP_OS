const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const cert = path.join(root, 'src/applications/data-sources-review/SCIIP_V8_Sprint3_Release_Certification.gs');
const failures = [];
if (!fs.existsSync(cert)) failures.push('Certification source missing');
else {
  const text = fs.readFileSync(cert, 'utf8');
  if (!text.includes('function sciipTestV8Sprint3ValidationEntityResolutionReviewWorkspace()')) failures.push('Public test function missing');
  if (!text.includes('SCIIP_V8_SPRINT3_VALIDATION_ENTITY_RESOLUTION_REVIEW_WORKSPACE')) failures.push('Framework marker missing');
}
console.log(JSON.stringify({framework:'SCIIP_V8_SPRINT3_COMPILED_CERTIFICATION_HOTFIX',status:failures.length?'FAILED':'PASSED',failures},null,2));
if (failures.length) process.exit(1);
