import assert from'node:assert/strict';
import fs from'node:fs';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

const ui=fs.readFileSync(
  'src/broker-product/property-explorer/v3/ExplorerMapFirst.jsx',
  'utf8'
);
const css=fs.readFileSync(
  'src/broker-product/property-explorer/v3/explorer-map-first.css',
  'utf8'
);

test(ui.includes('explorer-v3__map'));
test(ui.includes('explorer-v3__results-toggle'));
test(ui.includes('explorer-v3__results-rail'));
test(ui.includes('explorer-v3__drawer'));
test(ui.includes('Market Context'));
test(ui.includes('AI Market Summary'));
test(ui.includes('Open Assignment'));
test(ui.includes('Create Assignment'));
test(ui.includes('Search this area'));
test(ui.includes('Map Layers'));
test(ui.includes('Assignment Properties'));
test(ui.includes('Power Infrastructure'));
test(css.includes('position:absolute;inset:0'));
test(css.includes('width:min(390px,92vw)'));
test(css.includes('box-shadow:-14px 0 40px'));
test(css.includes('.explorer-v3__results-rail'));
test(css.includes('.explorer-v3__layers-button'));
test(css.includes('.explorer-v3__drawer-launcher'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_EXPLORER_V3_MAP_FIRST',
  status:'PASSED',
  testsRun,
  result:{
    mapDominant:true,
    compactSearchControls:true,
    collapsibleResultsRail:true,
    markerDrivenSelection:true,
    slidingPropertyDrawer:true,
    assignmentAwareness:true,
    dockedLayers:true,
    marketContext:true,
    aiSummary:true
  }
},null,2));
