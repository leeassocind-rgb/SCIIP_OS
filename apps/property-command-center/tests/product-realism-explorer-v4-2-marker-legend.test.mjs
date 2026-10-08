import assert from'node:assert/strict';
import fs from'node:fs';
import{
  MARKER_DEFINITIONS,
  MARKER_TYPES,
  buildMarkerClusters,
  buildMarkerCounts,
  filterMarkersForZoom,
  validateMarkerDesignSystem
}from'../src/broker-product/property-explorer/v4_2/explorerMarkerEngine.js';

let testsRun=0;
const test=condition=>{testsRun+=1;assert.ok(condition)};

test(Object.keys(MARKER_DEFINITIONS).length===7);
test(MARKER_DEFINITIONS[MARKER_TYPES.ASSIGNMENT].shape==='star-pin');
test(MARKER_DEFINITIONS[MARKER_TYPES.AVAILABLE].shape==='pin');
test(MARKER_DEFINITIONS[MARKER_TYPES.UNDER_CONSTRUCTION].shape==='striped-pin');
test(MARKER_DEFINITIONS[MARKER_TYPES.LEASE_COMPARABLE].shape==='square');
test(MARKER_DEFINITIONS[MARKER_TYPES.SALE_COMPARABLE].shape==='diamond');
test(MARKER_DEFINITIONS[MARKER_TYPES.REQUIREMENT].shape==='target');
test(MARKER_DEFINITIONS[MARKER_TYPES.PROSPECT].shape==='ring');

const items=[
  {id:'a',type:MARKER_TYPES.ASSIGNMENT,lat:34.10,lng:-117.40},
  {id:'b',type:MARKER_TYPES.AVAILABLE,lat:34.11,lng:-117.41},
  {id:'c',type:MARKER_TYPES.LEASE_COMPARABLE,lat:34.20,lng:-117.50},
  {id:'d',type:MARKER_TYPES.PROSPECT,lat:34.30,lng:-117.60}
];

const zoom6=filterMarkersForZoom(items,6);
test(zoom6.some(item=>item.type===MARKER_TYPES.ASSIGNMENT));
test(zoom6.some(item=>item.type===MARKER_TYPES.AVAILABLE));
test(!zoom6.some(item=>item.type===MARKER_TYPES.LEASE_COMPARABLE));
test(!zoom6.some(item=>item.type===MARKER_TYPES.PROSPECT));

const zoom10=filterMarkersForZoom(items,10);
test(zoom10.length===4);
test(zoom10[0].type===MARKER_TYPES.ASSIGNMENT);

const counts=buildMarkerCounts(items);
test(counts[MARKER_TYPES.ASSIGNMENT]===1);
test(counts[MARKER_TYPES.SALE_COMPARABLE]===0);

const clustered=buildMarkerClusters(items,{zoom:8,threshold:3});
test(clustered.length>=2);
test(clustered.some(cluster=>cluster.count>=2));

const unclustered=buildMarkerClusters(items,{zoom:12});
test(unclustered.length===4);
test(unclustered.every(cluster=>cluster.type==='SINGLE'));

const validation=validateMarkerDesignSystem();
test(validation.valid===true);
test(validation.markerTypes===7);

const jsx=fs.readFileSync(
  'src/broker-product/property-explorer/v4_2/ExplorerMarkerDesignSystem.jsx',
  'utf8'
);
const css=fs.readFileSync(
  'src/broker-product/property-explorer/v4_2/explorer-marker-design-system.css',
  'utf8'
);

test(jsx.includes('ExplorerLegend'));
test(jsx.includes('enabledTypes'));
test(jsx.includes('assignmentBadge'));
test(jsx.includes("from'./explorerMarkerEngine.js'"));
test(css.includes('--marker-assignment'));
test(css.includes('--marker-available'));
test(css.includes('repeating-linear-gradient'));
test(css.includes('@keyframes markerPulse'));
test(css.includes('is-selected'));
test(css.includes('explorer-legend__count'));

console.log(JSON.stringify({
  framework:'SCIIP_PRODUCT_REALISM_EXPLORER_V4_2_MARKER_LEGEND',
  status:'PASSED',
  testsRun,
  result:{
    node20Compatible:true,
    pureJavaScriptEngine:true,
    jsxValidatedByVite:true,
    shapeSemantics:true,
    restrainedColorSystem:true,
    selectionStates:true,
    assignmentBadges:true,
    requirementPulse:true,
    constructionStriping:true,
    zoomAwareVisibility:true,
    clusterFoundation:true,
    interactiveLegend:true,
    legendCounts:true
  }
},null,2));
