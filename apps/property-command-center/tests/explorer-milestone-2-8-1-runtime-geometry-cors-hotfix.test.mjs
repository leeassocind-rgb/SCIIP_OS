import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath,pathToFileURL}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const enginePath=path.join(app,'src/broker-product/property-explorer/v6/governedSpatialEngine.js');
const proxyPath=path.join(app,'server/lightbox/proxy-server.mjs');
const engine=fs.readFileSync(enginePath,'utf8');
const proxy=fs.readFileSync(proxyPath,'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

check('Spatial engine normalizes null geometry',engine.includes('const safePath=Array.isArray(path)?path:[]'));
check('Spatial engine maps only normalized path',engine.includes('return safePath'));
check('Spatial item dereference is null safe',engine.includes('item?.lat')&&engine.includes('item?.lng'));
check('Proxy allows POST requests',proxy.includes("access-control-allow-methods','GET,POST,OPTIONS"));
check('Proxy preflight allows content-type',proxy.includes("access-control-allow-headers','content-type, accept"));
check('Proxy origin restriction remains active',proxy.includes('originAllowed(origin)'));
check('SCIIP canonical authority remains preserved',proxy.includes("canonicalAuthority:'SCIIP'"));
check('LightBox self-test remains active',proxy.includes('/api/lightbox/self-test'));

const mod=await import(pathToFileURL(enginePath).href);
const bounds=mod.polygonBounds(null);
check('polygonBounds(null) returns null instead of throwing',bounds===null);

const context=mod.buildGovernedNeighborContext(
  {id:'A',lat:34,lng:-117,boundaryPath:null},
  [{id:'B',lat:34.001,lng:-117.001,boundaryPath:null,provenance:{status:'VERIFIED'}}]
);
check('Neighbor engine tolerates null subject and property boundaries',Array.isArray(context.neighbors));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_8_1_RUNTIME_GEOMETRY_CORS_HOTFIX',
  version:'3.0-m2.8.1',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    nullGeometryCrash:'CORRECTED',
    corsContentTypePreflight:'CORRECTED',
    originRestriction:'PRESERVED',
    canonicalAuthority:'SCIIP'
  },
  checks
},null,2));
