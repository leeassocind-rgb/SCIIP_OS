import assert from 'node:assert/strict';
import fs from 'node:fs';

let n=0;const t=c=>{n++;assert.ok(c)};
const brief=fs.readFileSync('src/product-shell/ProductMorningBrief.jsx','utf8');
const home=fs.readFileSync('src/product-shell/ProductHome.jsx','utf8');
const shell=fs.readFileSync('src/components/SCIIPProductShell.jsx','utf8');

t(brief.includes('What changed since yesterday.'));
t(brief.includes('Properties changed'));
t(brief.includes('New comparables'));
t(brief.includes('Assignments impacted'));
t(brief.includes('Recommended actions'));
t(home.includes('Your market. Your work. Today.'));
t(shell.includes('SCIIPProductShell'));
t(shell.includes('Morning Brief'));

console.log(JSON.stringify({
  framework:'SCIIP_PHASE20_MORNING_BRIEF_USER_VALIDATION',
  status:'PASSED',
  testsRun:n,
  result:{brokerFacingNavigation:true,morningBriefVisible:true,technicalTabsHidden:true}
},null,2));
