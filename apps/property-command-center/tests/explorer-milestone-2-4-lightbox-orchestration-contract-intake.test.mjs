import fs from'node:fs';
import os from'node:os';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';
import{analyzeOpenApiContract}from'../server/lightbox/OpenApiContractIntake.mjs';
import{VerifiedContractRegistry}from'../server/lightbox/VerifiedContractRegistry.mjs';
import{LightBoxEnrichmentOrchestrator}from'../server/lightbox/LightBoxEnrichmentOrchestrator.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const read=rel=>fs.readFileSync(path.join(app,rel),'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

const tmp=path.join(os.tmpdir(),`sciip-openapi-${Date.now()}.json`);
fs.writeFileSync(tmp,JSON.stringify({
  openapi:'3.0.3',
  info:{title:'LightBox Structures API',version:'1'},
  paths:{
    '/structures/{id}':{
      get:{operationId:'getStructure',tags:['Structures'],summary:'Get a structure'}
    }
  }
}));
const analysis=analyzeOpenApiContract(tmp);
fs.unlinkSync(tmp);
check('OpenAPI intake recognizes valid JSON contract',analysis.operationCount===1);
check('OpenAPI intake classifies Structures capability',analysis.capabilities.includes('structures'));
check('Imported contract remains pending review',analysis.status==='CONTRACT_IMPORTED_PENDING_REVIEW');

const registry=new VerifiedContractRegistry(path.join(app,'server/lightbox/openapi/verified-contracts.json'));
check('Parcel geometry remains active verified',registry.isActive('parcels.geometry')===true);
check('Structures remain inactive until certified',registry.byCapability('structures')[0].status==='AWAITING_OPENAPI');
check('Registry readiness distinguishes active and pending',registry.readiness().active.length===1&&registry.readiness().awaiting.length>=1);

const fakeService={
  async parcelByPoint(){return{ok:true,status:200,resolution:{status:'VERIFIED_MATCH'}};}
};
const orchestrator=new LightBoxEnrichmentOrchestrator({service:fakeService,registry});
const result=await orchestrator.enrichSelectedProperty(
  {id:'P-1',lat:34,lng:-117,address:'Test',city:'Fontana',zip:'92337'},
  {requested:['parcels','structures','zoning']}
);
check('Orchestrator activates verified parcel enrichment',Boolean(result.enrichments.parcels));
check('Orchestrator blocks unverified Structures',result.blocked.structures.code==='CONTRACT_NOT_ACTIVE');
check('Orchestrator blocks unverified Zoning',result.blocked.zoning.code==='CONTRACT_NOT_ACTIVE');
check('Orchestrator preserves SCIIP canonical authority',result.canonicalAuthority==='SCIIP');

check('Proxy exposes readiness endpoint',read('server/lightbox/proxy-server.mjs').includes('/api/lightbox/readiness'));
check('Proxy exposes governed enrichment endpoint',read('server/lightbox/proxy-server.mjs').includes('/api/lightbox/enrich'));
check('Browser exposes readiness without secrets',read('src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js').includes('fetchLightBoxReadiness'));
check('Browser still contains no x-api-key',!read('src/broker-product/property-explorer/integrations/lightbox/LightBoxBrowserClient.js').includes('x-api-key'));
check('Explorer displays enrichment readiness',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('LightBoxReadinessPanel'));
check('Contract importer never auto-activates',!read('server/lightbox/import-openapi-contract.mjs').includes('ACTIVE_VERIFIED'));
check('Verified manifest requires certification',JSON.parse(read('server/lightbox/openapi/verified-contracts.json')).policy.activationRequiresCertification===true);

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_4_LIGHTBOX_ENRICHMENT_ORCHESTRATION_CONTRACT_INTAKE',
  version:'3.0-m2.4',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    contractIntake:'ACTIVE',
    autoActivation:'FORBIDDEN',
    parcelContract:'ACTIVE_VERIFIED',
    progressiveEnrichment:'GOVERNED',
    readinessEndpoint:'ACTIVE',
    canonicalAuthority:'SCIIP'
  },
  checks
},null,2));
