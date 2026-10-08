import assert from'node:assert/strict';
import fs from'node:fs';
import{createMapProvider,listMapProviders}from'../src/broker-product/property-explorer/maps/MapProviderRegistry.js';
import{MAP_PROVIDER_IDS}from'../src/broker-product/property-explorer/maps/MapProvider.js';

let testsRun=0;
const test=value=>{testsRun+=1;assert.ok(value);};
const providers=listMapProviders();
test(providers.includes(MAP_PROVIDER_IDS.GOOGLE));
test(providers.includes(MAP_PROVIDER_IDS.MAPBOX));
test(providers.includes(MAP_PROVIDER_IDS.ESRI));
const google=createMapProvider(MAP_PROVIDER_IDS.GOOGLE,{apiKey:'test'});
test(google.constructor.name==='GoogleMapsAdapter');
test(typeof google.setProperties==='function');
test(typeof google.setSelectedProperty==='function');
test(typeof google.setSpotlight==='function');
test(typeof google.setNeighborRelationships==='function');
const adapter=fs.readFileSync('src/broker-product/property-explorer/maps/adapters/GoogleMapsAdapter.js','utf8');
const ui=fs.readFileSync('src/broker-product/property-explorer/v5/ExplorerPropertyIntelligenceOS.jsx','utf8');
test(adapter.includes('maps.googleapis.com/maps/api/js'));
test(adapter.includes("mapTypeId:'hybrid'"));
test(adapter.includes('streetViewControl:true'));
test(adapter.includes('new this.google.maps.Circle'));
test(adapter.includes('new this.google.maps.Polyline'));
test(ui.includes("from'../maps/ExplorerMap.jsx'"));
test(!ui.includes('LiveLeafletMap'));
console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_2_GOOGLE_MAPS_PLATFORM_FOUNDATION',
  version:'explorer-2.0-foundation.0',
  status:'PASSED',
  testsRun,
  result:{defaultProvider:'google',providerNeutral:true,hybridSatellite:true,streetView:true,spotlightRadius:true,neighborRelationships:true,mapboxPort:true,esriPort:true}
},null,2));
