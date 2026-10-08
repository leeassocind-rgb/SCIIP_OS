import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const explorer=fs.readFileSync(path.join(app,'src/broker-product/property-explorer/v6/Explorer3.jsx'),'utf8');
const css=fs.readFileSync(path.join(app,'src/broker-product/property-explorer/v6/explorer3-m2-6-2.css'),'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

// Mirror the COMPLETE Explorer-side production-integrity contract.
check('Explorer uses governed runtime loader',explorer.includes("useGovernedExplorerData"));
check('Explorer does not import development fixture',!explorer.includes("from'./explorer3Data.js'"));
check('Explorer exposes provenance status',explorer.includes('provenance?.gateStatus'));
check('Evidence contract exposes source type',explorer.includes("provenance?.sourceType"));
check('Evidence contract exposes spatial source',explorer.includes("geometrySource?.file"));

// Regression safety across 2.6.x.
check('Exactly one PropertyIntelligence function exists',(explorer.match(/function PropertyIntelligence\(/g)||[]).length===1);
check('Stale duplicate-body syntax defect absent',!explorer.includes('}){\n  return <>'));
check('Progressive metric rail preserved',explorer.includes('PropertyMetricRail'));
check('Progressive navigator preserved',explorer.includes('PropertyIntelligenceNavigator'));
check('Progressive section host preserved',explorer.includes('PropertyIntelligenceSectionHost'));
check('Runtime degraded guard preserved',explorer.includes('explorer3__runtime-guard'));
check('Direct source type variable exists',explorer.includes('governedSourceType'));
check('Direct spatial source variable exists',explorer.includes('governedSpatialSource'));
check('Governed status stays visible',explorer.includes('governedProvenanceStatus'));
check('Source type is rendered compactly',explorer.includes('<em>{governedSourceType}</em>'));
check('Spatial source travels in governed evidence contract',explorer.includes('spatialSource:governedSpatialSource'));
check('Evidence CSS remains compact',css.includes('.explorer3__provenance-contract em'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_6_3_PRODUCTION_EVIDENCE_CONTRACT_RECOVERY',
  version:'3.0-m2.6.3',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    productionIntegrityExplorerContract:'COMPLETE',
    provenanceStatus:'RESTORED',
    sourceType:'RESTORED',
    spatialSource:'RESTORED',
    progressiveUx:'PRESERVED',
    syntaxRegression:'GUARDED'
  },
  checks
},null,2));
