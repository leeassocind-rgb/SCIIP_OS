import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const file=path.join(app,'src/broker-product/property-explorer/v6/Explorer3.jsx');
const source=fs.readFileSync(file,'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

check('Exactly one PropertyIntelligence function exists',(source.match(/function PropertyIntelligence\(/g)||[]).length===1);
check('Known stale-body defect signature is absent',!source.includes('}){\n  return <>'));
check('Progressive metric rail remains wired',source.includes('PropertyMetricRail'));
check('Progressive navigator remains wired',source.includes('PropertyIntelligenceNavigator'));
check('Progressive section host remains wired',source.includes('PropertyIntelligenceSectionHost'));
check('Contextual transaction helper remains intact',source.includes('function ContextualTransactionDetails'));
check('Source comparison remains available',source.includes('LightBoxSourceComparison'));
check('LightBox readiness remains available',source.includes('LightBoxReadinessPanel'));
check('Governed snapshot remains available',source.includes('propertyIntelligenceSnapshot'));

const piStart=source.indexOf('function PropertyIntelligence(');
const helperStart=source.indexOf('function ContextualTransactionDetails',piStart);
check('PropertyIntelligence terminates before next helper',piStart>=0&&helperStart>piStart);
const segment=source.slice(piStart,helperStart);
check('Legacy disclosure stack is no longer duplicated in progressive function',!segment.includes('<DisclosureSection'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_6_1_SYNTAX_HOTFIX',
  version:'3.0-m2.6.1',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    staleDuplicateBody:'REMOVED',
    progressiveUx:'PRESERVED',
    lightBoxGovernance:'PRESERVED',
    regressionGuard:'ACTIVE'
  },
  checks
},null,2));
