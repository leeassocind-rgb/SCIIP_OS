const fs = require('fs');
const path = require('path');

const required = [
  'src/ui/SCIIP_MobileUI.gs',
  'src/ui/SCIIP_MobileUI_App.html',
  'src/ui/SCIIP_MobileUI_Styles.html',
  'src/ui/SCIIP_MobileUI_Tests.gs'
];

const failures = required.filter(file => !fs.existsSync(path.join(process.cwd(), file)));
if (failures.length) {
  console.error(JSON.stringify({ status: 'FAILED', failures }, null, 2));
  process.exit(1);
}

const gs = fs.readFileSync(path.join(process.cwd(), required[0]), 'utf8');
const html = fs.readFileSync(path.join(process.cwd(), required[1]), 'utf8');
const css = fs.readFileSync(path.join(process.cwd(), required[2]), 'utf8');

const checks = {
  namespace: gs.includes('SCIIP_MOBILE_UI'),
  sixWorkspaces: (gs.match(/id: '/g) || []).length >= 6,
  bottomTabs: html.includes('sciip-mobile-tabs'),
  touchTargets: css.includes('min-height: 52px') && css.includes('width: 44px'),
  safeArea: css.includes('safe-area-inset-bottom'),
  reducedMotion: css.includes('prefers-reduced-motion'),
  responsive: css.includes('@media')
};

const failed = Object.keys(checks).filter(k => !checks[k]);

console.log(JSON.stringify({
  framework: 'SCIIP_MOBILE_UI_ALPHA_CERTIFICATION',
  version: 'v7.0-alpha.1',
  status: failed.length ? 'FAILED' : 'PASSED',
  checks,
  failures: failed
}, null, 2));

if (failed.length) process.exit(1);
