import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const cssPath = path.join(root,'src/broker-product/property-explorer/v6/explorer3.css');
const css = fs.readFileSync(cssPath,'utf8');
const checks = [
  ['bottom search dock removed', /\.explorer3__search-dock,\s*\n\.explorer3__search-collapsed\{\s*\n\s*display:none!important;/.test(css)],
  ['legend edge control at bottom left', css.includes('.explorer3__legend-layers{\n  left:18px!important;')],
  ['drawer-open legend follows usable map', css.includes('left:calc(var(--explorer3-intelligence-width) + 18px)!important')],
  ['legend expands inward from left edge', css.includes('transform-origin:bottom left!important')],
  ['drawer footer no shared toolbar baseline', css.includes('padding:10px 12px 12px!important')],
  ['google lower-right reserved', css.includes('top:190px!important;\n  bottom:auto!important;\n  right:18px!important')],
  ['legend compact height restored', css.includes('height:44px!important')],
  ['mobile legend stays edge anchored', css.includes('left:12px!important;\n    right:auto!important;\n    bottom:12px!important')],
];
const failures = checks.filter(([,ok])=>!ok).map(([name])=>name);
const result = {framework:'SCIIP_EXPLORER_3_MILESTONE_1_7_3_MAP_CANVAS_RESET',version:'explorer-3.0-m1.7.3',status:failures.length?'FAILED':'PASSED',testsRun:checks.length,failures};
console.log(JSON.stringify(result,null,2));
if (failures.length) process.exit(1);
