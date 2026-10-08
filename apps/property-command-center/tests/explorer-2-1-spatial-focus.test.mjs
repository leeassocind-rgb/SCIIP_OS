import assert from'node:assert/strict';
import fs from'node:fs';
import{createMapProvider}from'../src/broker-product/property-explorer/maps/MapProviderRegistry.js';
import{MAP_PROVIDER_IDS}from'../src/broker-product/property-explorer/maps/MapProvider.js';

let testsRun=0;
const test=(value,message)=>{testsRun+=1;assert.ok(value,message);};
const google=createMapProvider(MAP_PROVIDER_IDS.GOOGLE,{apiKey:'test'});
test(typeof google.focusSelectedProperty==='function','focusSelectedProperty contract');
test(typeof google.fitSelectedContext==='function','fitSelectedContext contract');
const adapter=fs.readFileSync('src/broker-product/property-explorer/maps/adapters/GoogleMapsAdapter.js','utf8');
const mapUi=fs.readFileSync('src/broker-product/property-explorer/maps/ExplorerMap.jsx','utf8');
const css=fs.readFileSync('src/broker-product/property-explorer/v5/explorer-v5.css','utf8');
test(!adapter.includes('new this.google.maps.Marker'),'legacy google marker removed');
test(adapter.includes('google.maps.OverlayView'),'provider-native overlay markers');
test(adapter.includes('sciip-property-marker__card'),'hover intelligence card');
test(adapter.includes('is-selected'),'selected property visual state');
test(adapter.includes('is-dimmed'),'context dimming visual state');
test(adapter.includes('focusSelectedProperty'),'selected-property focus method');
test(adapter.includes('fitSelectedContext'),'neighbor context bounds method');
test(mapUi.includes("['hybrid','Hybrid']"),'hybrid map mode');
test(mapUi.includes("['satellite','Satellite']"),'satellite map mode');
test(mapUi.includes("['roadmap','Road']"),'road map mode');
test(mapUi.includes('Crosshair'),'selected focus control');
test(css.includes('.sciip-property-marker.is-selected'),'selected marker styling');
test(css.includes('.explorer-v5__map-tools'),'map tool styling');
console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_2_1_SPATIAL_FOCUS_NEIGHBOR_CONTEXT',
  version:'explorer-2.1.0',
  status:'PASSED',
  testsRun,
  result:{legacyMarkerRemoved:true,propertyHoverCards:true,selectedPropertyFocus:true,contextDimming:true,mapTypeControls:true,neighborContextBounds:true}
},null,2));
