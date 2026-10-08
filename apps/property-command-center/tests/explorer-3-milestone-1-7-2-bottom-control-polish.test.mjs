import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const cssPath = path.join(root,'src/broker-product/property-explorer/v6/explorer3.css');
const css = fs.readFileSync(cssPath,'utf8');
const checks = [
  ['shared bottom baseline', css.includes('--explorer3-bottom-baseline:18px')],
  ['shared control height', css.includes('--explorer3-bottom-control-height:50px')],
  ['search uses baseline', css.includes('bottom:var(--explorer3-bottom-baseline)!important')],
  ['legend uses shared height', css.includes('.explorer3__legend-layers-toggle{height:var(--explorer3-bottom-control-height)!important')],
  ['drawer footer baseline padding', css.includes('padding:10px 12px var(--explorer3-bottom-baseline)!important')],
  ['drawer buttons normalized', css.includes('min-height:var(--explorer3-bottom-control-height)!important')],
  ['google control reserve', css.includes('calc(100% - 330px)')],
  ['utility rail lifted', css.includes('.explorer3__map-rail{bottom:96px!important;right:18px!important}')],
];
const failures = checks.filter(([,ok])=>!ok).map(([name])=>name);
const result = {framework:'SCIIP_EXPLORER_3_MILESTONE_1_7_2_BOTTOM_CONTROL_POLISH',version:'explorer-3.0-m1.7.2',status:failures.length?'FAILED':'PASSED',testsRun:checks.length,failures};
console.log(JSON.stringify(result,null,2));
if (failures.length) process.exit(1);
