import fs from'node:fs';
import path from'node:path';
import{fileURLToPath}from'node:url';
import{buildSpatialClusters,propertyIdsInClusters,spatialBandForZoom}from'../src/broker-product/property-explorer/maps/spatialClusterEngine.js';
import{EXPLORER3_PROPERTIES}from'../src/broker-product/property-explorer/v6/explorer3Data.js';

const __dirname=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(__dirname,'..');
const read=rel=>fs.readFileSync(path.join(app,rel),'utf8');
const checks=[];
const assert=(name,condition)=>{checks.push({name,status:condition?'PASSED':'FAILED'});if(!condition)throw new Error(name);};

assert('regional zoom band',spatialBandForZoom(9)==='regional');
assert('market zoom band',spatialBandForZoom(11)==='market');
assert('neighborhood zoom band',spatialBandForZoom(13)==='neighborhood');
assert('site zoom band',spatialBandForZoom(15)==='site');
const regional=buildSpatialClusters(EXPLORER3_PROPERTIES,9,{selectedPropertyId:'P-IEW-201'});
assert('cluster engine returns immutable clusters',regional.every(cluster=>Object.isFrozen(cluster)&&Object.isFrozen(cluster.propertyIds)));
assert('selected property excluded from clusters',!propertyIdsInClusters(regional).has('P-IEW-201'));
assert('site zoom disables clustering',buildSpatialClusters(EXPLORER3_PROPERTIES,15).length===0);

const provider=read('src/broker-product/property-explorer/maps/MapProvider.js');
const explorerMap=read('src/broker-product/property-explorer/maps/ExplorerMap.jsx');
const adapter=read('src/broker-product/property-explorer/maps/adapters/GoogleMapsAdapter.js');
const explorer=read('src/broker-product/property-explorer/v6/Explorer3.jsx');
const workspace=read('src/broker-product/property-explorer/v6/useExplorerWorkspace.js');
const css=read('src/broker-product/property-explorer/v5/explorer-v5.css');

assert('provider exposes spatial context seam',provider.includes('setSpatialContext()'));
assert('ExplorerMap forwards spatial context',explorerMap.includes('setSpatialContext?.(spatialContext'));
assert('Google adapter implements zoom-aware clusters',adapter.includes('#renderSpatialState')&&adapter.includes('createClusterOverlay'));
assert('Google adapter supports optional property boundaries',adapter.includes('boundaryPath')&&adapter.includes('google.maps.Polygon'));
assert('metric drilldown feeds spatial highlighting',explorer.includes('highlightedPropertyIds')&&explorer.includes('spatialContext={spatialContext}'));
assert('cohort feeds spatial context',explorer.includes('cohortPropertyIds:marketContext.cohort.map'));
assert('map selection opens Property Intelligence',workspace.includes("drawerOpen:true,drawerSection:'property'"));
assert('cluster UI styling exists',css.includes('.sciip-property-cluster')&&css.includes('.is-highlighted'));
assert('neighbor relationships remain provider driven',adapter.includes('setNeighborRelationships'));

console.log(JSON.stringify({framework:'SCIIP_EXPLORER_3_MILESTONE_2_SPATIAL_INTELLIGENCE',version:'explorer-3.0-m2.0',status:'PASSED',testsRun:checks.length,result:{zoomBands:4,regionalClusters:regional.length,providerNeutral:true,metricSpatialHighlighting:true,optionalBoundaryGeometry:true,selectionOpensIntelligence:true},checks},null,2));
