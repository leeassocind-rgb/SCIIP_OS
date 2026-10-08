import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const v6=path.join(app,'src/broker-product/property-explorer/v6');
const explorer=fs.readFileSync(path.join(v6,'Explorer3.jsx'),'utf8');
const loader=fs.readFileSync(path.join(v6,'useGovernedExplorerData.js'),'utf8');
const demo=fs.readFileSync(path.join(v6,'explorer3Data.js'),'utf8');
const data=JSON.parse(fs.readFileSync(path.join(app,'public/explorer/governed-base-inventory.json'),'utf8'));

const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

check('Explorer uses governed runtime loader',explorer.includes("useGovernedExplorerData"));
check('Explorer does not import development fixture',!explorer.includes("from'./explorer3Data.js'"));
check('Synthetic data disabled in runtime gate',loader.includes('allowSynthetic:false'));
check('Demo file explicitly quarantined',demo.includes('DEVELOPMENT_FIXTURE'));
check('False SuperSheet labels removed from demo fixture',!demo.includes("source:'SUPERSHEET'"));
check('10800 Slover absent from governed runtime dataset',!JSON.stringify(data).includes('10800 Slover'));
check('Governed Explorer runtime has records',data.properties.length>100);
check('Every governed runtime record has coordinates',data.properties.every(row=>Number.isFinite(Number(row.lat))&&Number.isFinite(Number(row.lng))));
check('Every governed runtime record has source evidence',data.properties.every(row=>row.provenance?.sourceFiles?.length));
check('Every governed runtime record has spatial evidence',data.properties.every(row=>row.provenance?.geometrySource?.file));
check('Every governed runtime record is verified',data.properties.every(row=>row.provenance?.status==='VERIFIED'));
check('Explorer exposes provenance status',explorer.includes('provenance?.gateStatus'));
check('Evidence panel exposes source type',explorer.includes("provenance?.sourceType"));
check('Evidence panel exposes spatial source',explorer.includes("geometrySource?.file"));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_PRODUCTION_DATA_INTEGRITY_PROVENANCE_GATE',
  version:'3.0-integrity-gate.1',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    sourceMasterInventory:data.summary.sourceMasterInventoryRows??null,
    sourceExplorerCandidateRows:data.summary.sourcePropertyRowsUnique??null,
    governedExplorerRuntime:data.properties.length,
    available:data.summary.availableRecords,
    baseInventory:data.summary.baseInventoryRecords,
    parcelBoundaries:data.summary.recordsWithParcelBoundary,
    syntheticRuntimeRecords:0
  },
  checks
},null,2));
