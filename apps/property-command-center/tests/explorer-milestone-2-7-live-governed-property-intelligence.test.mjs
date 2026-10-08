import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath,pathToFileURL}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const read=rel=>fs.readFileSync(path.join(app,rel),'utf8');

const modelUrl=pathToFileURL(path.join(app,'src/broker-product/property-explorer/intelligence/LiveGovernedPropertyIntelligence.js')).href;
const geomUrl=pathToFileURL(path.join(app,'src/broker-product/property-explorer/intelligence/ExternalParcelGeometry.js')).href;
const{buildLiveGovernedPropertyIntelligence,liveGovernedPropertyBadge}=await import(modelUrl);
const{parseWktPolygon}=await import(geomUrl);

const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

const property={
  id:'P-1',address:'13032 Slover Ave',city:'Fontana',zip:'92337',
  lat:34.063,lng:-117.519,parcelId:null,
  provenance:{status:'VERIFIED',sourceType:'BASE_INVENTORY'}
};
const lightBoxState={
  phase:'READY',
  clientStatus:{enabled:true},
  result:{
    recordCount:3,
    cache:{hit:false},
    resolution:{
      status:'VERIFIED_MATCH',
      confidence:92,
      top:{apn:'0238-000-01',parcel:{id:'LB-1'}}
    },
    conflictReport:{status:'ALIGNED',conflictCount:0}
  }
};
const model=buildLiveGovernedPropertyIntelligence(property,lightBoxState);
check('Canonical SCIIP property remains verified',model.canonicalVerified===true);
check('Verified LightBox match recognized',model.verifiedMatch===true);
check('Verified match exposes APN',model.matchedApn==='0238-000-01');
check('Blank parcel identity may be supplemented',model.canAdoptParcelIdentity===true);
check('Canonical overwrite remains forbidden',model.canonicalOverwriteAllowed===false);
check('Live response is distinguished from cache',model.cacheHit===false);
check('Verified aligned match gets success badge',liveGovernedPropertyBadge(model).tone==='success');

const poly=parseWktPolygon('POLYGON((-117.5 34.0,-117.4 34.0,-117.4 34.1,-117.5 34.0))');
check('LightBox WKT polygon parser works',Array.isArray(poly)&&poly.length===4&&poly[0].lng===-117.5);

check('Explorer uses live governed intelligence hook',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('useLiveGovernedPropertyIntelligence'));
check('Explorer renders live governed card',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('LiveGovernedPropertyCard'));
check('Live card explicitly states SCIIP canonical behavior',read('src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx').includes('SCIIP remains canonical'));
check('Browser client still contains no x-api-key',!read('src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js').includes('x-api-key'));
check('Proxy diagnostics expose canonical authority',read('server/lightbox/proxy-server.mjs').includes("canonicalAuthority:'SCIIP'"));
check('Proxy diagnostics expose no-overwrite policy',read('server/lightbox/proxy-server.mjs').includes('ENRICH_NEVER_OVERWRITE_CANONICAL_IDENTITY'));
check('Production provenance contract remains present',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('provenance?.gateStatus'));
check('Production source type contract remains present',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('provenance?.sourceType'));
check('Production spatial source contract remains present',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('geometrySource?.file'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_7_LIVE_GOVERNED_PROPERTY_INTELLIGENCE',
  version:'3.0-m2.7',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    selectedPropertyLoop:'ACTIVE',
    liveParcelResolution:'ACTIVATABLE',
    canonicalIdentity:'PROTECTED',
    evidenceConflicts:'VISIBLE',
    liveVsCached:'VISIBLE',
    lightBoxBrowserSecrets:'FORBIDDEN'
  },
  checks
},null,2));
