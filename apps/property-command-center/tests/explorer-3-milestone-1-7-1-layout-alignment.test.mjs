import fs from 'node:fs';
import path from 'node:path';
const cssPath=path.resolve('src/broker-product/property-explorer/v6/explorer3.css');
const css=fs.readFileSync(cssPath,'utf8');
const checks=[
 ['milestone marker',css.includes('Milestone 1.7.1 — map-relative alignment refinement')],
 ['topbar single centered grid',css.includes('grid-template-columns:1fr!important')],
 ['brand edge anchored',css.includes('.explorer3__brand{')&&css.includes('position:absolute!important')],
 ['mode switch centered',css.includes('.explorer3__mode-switch{')&&css.includes('justify-self:center!important')],
 ['legend right of search',css.includes('left:calc(50% + 300px)!important')],
 ['drawer-aware legend offset',css.includes('var(--explorer3-intelligence-width) / 2')],
 ['desktop compact fallback',css.includes('@media(max-width:1180px)')&&css.includes('right:18px!important')],
 ['mobile right anchor',css.includes('right:12px!important;bottom:76px!important')],
];
const failures=checks.filter(([,ok])=>!ok).map(([name])=>name);
console.log(JSON.stringify({framework:'SCIIP_EXPLORER_3_MILESTONE_1_7_1_LAYOUT_ALIGNMENT',version:'3.0-m1.7.1',status:failures.length?'FAILED':'PASSED',testsRun:checks.length,failures},null,2));
if(failures.length) process.exit(1);
