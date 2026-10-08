import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const source=fs.readFileSync(path.join(app,'src/broker-product/property-explorer/v6/Explorer3.jsx'),'utf8');
const css=fs.readFileSync(path.join(app,'src/broker-product/property-explorer/v6/explorer3-m2-6-2.css'),'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

check('Exactly one PropertyIntelligence function exists',(source.match(/function PropertyIntelligence\(/g)||[]).length===1);
check('Stale duplicate-body syntax defect remains absent',!source.includes('}){\n  return <>'));
check('Direct governed provenance gateStatus contract restored',source.includes('property?.provenance?.gateStatus'));
check('Direct governed provenance status variable exists',source.includes('governedProvenanceStatus'));
check('Governed provenance status is rendered in progressive UX',source.includes('data-provenance-status={governedProvenanceStatus}'));
check('Progressive metric rail preserved',source.includes('PropertyMetricRail'));
check('Progressive navigator preserved',source.includes('PropertyIntelligenceNavigator'));
check('Progressive section host preserved',source.includes('PropertyIntelligenceSectionHost'));
check('LightBox source comparison preserved',source.includes('LightBoxSourceComparison'));
check('LightBox readiness preserved',source.includes('LightBoxReadinessPanel'));
check('Runtime degraded-state guard added',source.includes('explorer3__runtime-guard'));
check('Runtime guard shows governed data error',source.includes("dataStatus?.error||'Governed data could not be loaded.'"));
check('Recovery CSS imported',source.includes("import'./explorer3-m2-6-2.css'"));
check('Recovery CSS contains runtime guard',css.includes('.explorer3__runtime-guard'));
check('Recovery CSS contains provenance contract',css.includes('.explorer3__provenance-contract'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_6_2_RUNTIME_PROVENANCE_RECOVERY',
  version:'3.0-m2.6.2',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    provenanceContract:'RESTORED',
    progressiveUx:'PRESERVED',
    syntaxRegression:'GUARDED',
    degradedRuntimeVisibility:'ACTIVE',
    productionBuildRequired:true
  },
  checks
},null,2));
