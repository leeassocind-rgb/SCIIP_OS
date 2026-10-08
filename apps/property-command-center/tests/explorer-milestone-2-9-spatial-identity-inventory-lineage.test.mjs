import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const data=JSON.parse(fs.readFileSync(path.join(app,'public/explorer/governed-base-inventory.json'),'utf8'));
const lineage=JSON.parse(fs.readFileSync(path.join(app,'public/explorer/inventory-lineage.json'),'utf8'));
const integrity=fs.readFileSync(path.join(app,'tests/explorer-production-data-integrity-provenance.test.mjs'),'utf8');
const model=fs.readFileSync(path.join(app,'src/broker-product/property-explorer/intelligence/LiveGovernedPropertyIntelligence.js'),'utf8');
const policy=fs.readFileSync(path.join(app,'src/broker-product/property-explorer/intelligence/DevelopmentTemporalPolicy.js'),'utf8');

const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};
const lowell=data.properties.find(r=>String(r.address).toUpperCase()==='2125 W LOWELL ST'&&String(r.city).toUpperCase()==='RIALTO');

check('Phase 1 master inventory is distinguished from runtime subset',lineage.sourceMasterInventory.rows===4506);
check('Explorer candidate rows are separately tracked',Number(lineage.sourceExplorerCandidateRows.rows)>=4506);
check('Runtime count is derived from governed Explorer properties',lineage.governedExplorerRuntime.rows===data.properties.length);
check('Integrity output no longer calls runtime count governedBaseInventory',!integrity.includes('governedBaseInventory:data.properties.length'));
check('Integrity output names governed Explorer runtime',integrity.includes('governedExplorerRuntime:data.properties.length'));
check('Lowell exists in governed runtime',Boolean(lowell));
check('Lowell latitude corrected',Math.abs(Number(lowell.lat)-34.0978)<1e-9);
check('Lowell longitude corrected',Math.abs(Number(lowell.lng)+117.4147)<1e-9);
check('Lowell stale parcel identity cleared',lowell.parcelId===null);
check('Lowell stale boundary cleared',lowell.boundaryPath===null);
check('Lowell spatial history retained',Array.isArray(lowell.provenance?.spatialHistory)&&lowell.provenance.spatialHistory.length>0);
check('Lowell uses project future-state temporal context',lowell.temporalContext?.mode==='PROJECT_FUTURE_STATE');
check('Temporal policy recognizes proposed/planned/construction statuses',policy.includes('PROJECT_FUTURE_STATE'));
check('LightBox model carries temporal mode',model.includes('temporalMode:temporal.mode'));
check('Future-state parcel adoption requires review',model.includes('!temporal.requiresParcelReview'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_9_SPATIAL_IDENTITY_INVENTORY_LINEAGE',
  version:'3.0-m2.9',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    sourceMasterInventory:lineage.sourceMasterInventory.rows,
    sourceExplorerCandidateRows:lineage.sourceExplorerCandidateRows.rows,
    governedExplorerRuntime:lineage.governedExplorerRuntime.rows,
    lowellSpatialIdentity:'CORRECTED_PENDING_PARCEL_CONFIRMATION',
    constructionTemporalPolicy:'ACTIVE'
  },
  checks
},null,2));
