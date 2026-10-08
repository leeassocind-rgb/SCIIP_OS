import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';
import{LightBoxCache}from'../server/lightbox/LightBoxCache.mjs';
import{scoreParcelCandidate,resolveParcelCandidate,mergeLightBoxParcelEnrichment}from'../server/lightbox/LightBoxParcelResolution.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const read=rel=>fs.readFileSync(path.join(app,rel),'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

const subject={id:'P-1',address:'13032 Slover Ave',city:'Fontana',zip:'92337',lat:34.063, lng:-117.519,landAcres:10};
const exact={id:'LB-1',apn:'0238-000-01',location:{streetAddress:'13032 Slover Ave',locality:'Fontana',postalCode:'92337',geometry:{wkt:'POLYGON((0 0,1 0,1 1,0 0))'}}};
const wrong={id:'LB-2',apn:'0238-000-02',location:{streetAddress:'10641 Etiwanda Ave',locality:'Fontana',postalCode:'92337'}};

const exactScore=scoreParcelCandidate(subject,exact);
const wrongScore=scoreParcelCandidate(subject,wrong);
check('Exact parcel scores above unrelated parcel',exactScore.score>wrongScore.score);
const resolution=resolveParcelCandidate(subject,[wrong,exact]);
check('Exact parcel resolves verified',resolution.status==='VERIFIED_MATCH');
check('Resolution selects correct parcel',resolution.top.parcel.id==='LB-1');

const merged=mergeLightBoxParcelEnrichment(subject,resolution);
check('Canonical id preserved',merged.property.id==='P-1');
check('Canonical address preserved',merged.property.address==='13032 Slover Ave');
check('Canonical coordinates preserved',merged.property.lat===subject.lat&&merged.property.lng===subject.lng);
check('LightBox can fill blank parcel id only',merged.property.parcelId==='0238-000-01');
check('Audit confirms no canonical overwrite',merged.audit.canonicalIdentityOverwritten===false);

const cache=new LightBoxCache({ttlMs:1000,maxEntries:2});
cache.set('a',{ok:true});
check('Cache returns stored value',cache.get('a').ok===true);
cache.set('b',{ok:true}); cache.set('c',{ok:true});
check('Cache enforces max entries',cache.stats().entries===2);

check('Browser uses proxy resolve endpoint',read('src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js').includes('/api/lightbox/parcel/resolve'));
check('Browser never sends x-api-key',!read('src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js').includes('x-api-key'));
check('Proxy accepts subject-aware POST',read('server/lightbox/proxy-server.mjs').includes("'/api/lightbox/parcel/resolve'"));
check('Selected-property hook activates resolution',read('src/broker-product/property-explorer/integrations/lightbox/useLightBoxParcelEnrichment.js').includes('resolveLightBoxParcel'));
check('Explorer exposes live LightBox state',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('LightBoxParcelPanel'));
check('Unverified LightBox capabilities remain guarded',read('server/lightbox/GuardedCapabilityAdapter.mjs').includes('LIGHTBOX_SCHEMA_REQUIRED'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_3_VERIFIED_LIGHTBOX_ENRICHMENT_ACTIVATION',
  version:'3.0-m2.3',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    liveActivation:'PARCEL_RESOLUTION',
    canonicalIdentity:'PROTECTED',
    candidateScoring:'ACTIVE',
    responseCache:'ACTIVE',
    browserSecrets:'FORBIDDEN',
    unverifiedCapabilities:'BLOCKED'
  },
  checks
},null,2));
