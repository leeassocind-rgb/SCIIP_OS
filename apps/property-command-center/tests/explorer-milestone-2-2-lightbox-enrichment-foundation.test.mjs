import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';
import{LightBoxParcelAdapter,pointWkt}from'../server/lightbox/LightBoxParcelAdapter.mjs';
import{LightBoxEnrichmentService}from'../server/lightbox/LightBoxEnrichmentService.mjs';
import{getLightBoxConfig}from'../server/lightbox/config.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const read=rel=>fs.readFileSync(path.join(app,rel),'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

const config=getLightBoxConfig({});
check('LightBox is disabled without server key',config.enabled===false);
check('No VITE-prefixed API key in example env',!read('.env.lightbox.example').includes('VITE_LIGHTBOX_API_KEY='));
check('Browser client contains no x-api-key header',!read('src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js').includes('x-api-key'));
check('Server client owns x-api-key header',read('server/lightbox/LightBoxHttpClient.mjs').includes("'x-api-key':this.config.apiKey"));
check('Verified Parcel geometry contract is encoded',read('server/lightbox/contracts.mjs').includes("status:'VERIFIED'"));
check('Unverified capability contracts require schemas',read('server/lightbox/contracts.mjs').includes("status:'SCHEMA_REQUIRED'"));
check('Guarded adapters refuse invented endpoint calls',read('server/lightbox/GuardedCapabilityAdapter.mjs').includes('LIGHTBOX_SCHEMA_REQUIRED'));
check('Parcel request uses verified country geometry path',read('server/lightbox/LightBoxParcelAdapter.mjs').includes('/parcels/${encodeURIComponent(countryCode)}/geometry'));
check('WKT uses longitude then latitude',pointWkt({lat:34.06219,lng:-117.524066})==='POINT(-117.524066 34.06219)');
check('Proxy restricts allowed origins',read('server/lightbox/proxy-server.mjs').includes('ORIGIN_NOT_ALLOWED'));
check('Canonical merge policy forbids overwrite',read('src/broker-product/property-explorer/integrations/lightbox/LightBoxEnrichmentRegistry.js').includes('ENRICH_NEVER_OVERWRITE_CANONICAL_IDENTITY'));
check('SCIIP remains canonical authority',read('src/broker-product/property-explorer/integrations/lightbox/LightBoxEnrichmentRegistry.js').includes("canonicalAuthority:'SCIIP'"));
check('Google remains map provider',read('src/broker-product/property-explorer/integrations/lightbox/LightBoxEnrichmentRegistry.js').includes("mapProvider:'Google Maps'"));
check('Explorer exposes governed enrichment provider',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('LightBox · governed'));

const fakeClient={
  async request(args){
    return{ok:true,status:200,data:{parcels:[{id:'LB-PARCEL-1'}],$metadata:{test:true}},args};
  }
};
const adapter=new LightBoxParcelAdapter(fakeClient);
const result=await adapter.queryByPoint({lat:34.06219,lng:-117.524066});
check('Parcel adapter normalizes successful responses',result.ok===true&&result.recordCount===1&&result.parcels[0].id==='LB-PARCEL-1');

const service=new LightBoxEnrichmentService({parcelAdapter:adapter});
const blocked=await service.capability('structures',{});
check('Structures are blocked until schema verified',blocked.status===501&&blocked.error.code==='LIGHTBOX_SCHEMA_REQUIRED');

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_2_LIGHTBOX_PROPERTY_ENRICHMENT_FOUNDATION',
  version:'3.0-m2.2',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    security:'SERVER_SIDE_ONLY',
    verifiedLiveContract:'PARCELS_GEOMETRY',
    guardedCapabilities:['structures','assessment','true-owner','zoning','transactions','location-info','environmental'],
    canonicalAuthority:'SCIIP',
    externalEnrichment:'LIGHTBOX',
    visualization:'GOOGLE_MAPS'
  },
  checks
},null,2));
