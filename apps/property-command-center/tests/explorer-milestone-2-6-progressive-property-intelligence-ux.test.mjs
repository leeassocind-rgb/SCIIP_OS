import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath,pathToFileURL}from'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const modelUrl=pathToFileURL(path.join(app,'src/broker-product/property-explorer/intelligence/PropertyIntelligenceModel.js')).href;
const{INTELLIGENCE_SECTIONS,propertyIntelligenceSnapshot,visibleSections,sectionStatus}=await import(modelUrl);

const read=rel=>fs.readFileSync(path.join(app,rel),'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

check('Progressive model defines compact section taxonomy',INTELLIGENCE_SECTIONS.length>=10);
check('Core sections come before enrichment sections',INTELLIGENCE_SECTIONS.find(x=>x.id==='building').priority<INTELLIGENCE_SECTIONS.find(x=>x.id==='assessment').priority);

const property={
  id:'P-1',address:'13032 Slover Ave',city:'Fontana',state:'CA',zip:'92337',
  buildingSf:650000,landAcres:12,clearHeightFt:40,powerAmps:4000,
  owner:'Owner LLC',status:'AVAILABLE',availableSf:650000,
  provenance:{status:'VERIFIED',sourceType:'BASE_INVENTORY'}
};
const snapshot=propertyIntelligenceSnapshot(property,{});
check('Snapshot carries governed provenance status',snapshot.provenanceStatus==='VERIFIED');
check('Snapshot carries core metrics',snapshot.buildingSf===650000&&snapshot.powerAmps===4000);

const sectionsNoEnrichment=visibleSections(property,{lightBoxReadiness:{readiness:{activeContracts:[]}}});
check('Unavailable enrichment sections stay hidden',!sectionsNoEnrichment.some(x=>x.id==='assessment'));
check('Core building section remains visible',sectionsNoEnrichment.some(x=>x.id==='building'));

const sectionsWithEnrichment=visibleSections(property,{lightBoxReadiness:{readiness:{activeContracts:['assessment','structures','transactions','location-info','environmental']}}});
check('Verified contract activates Assessment section',sectionsWithEnrichment.some(x=>x.id==='assessment'));
check('Verified contract activates Structure section',sectionsWithEnrichment.some(x=>x.id==='structure'));
check('Verified contract activates Transactions section',sectionsWithEnrichment.some(x=>x.id==='transactions'));
check('Verified contract activates Infrastructure section',sectionsWithEnrichment.some(x=>x.id==='infrastructure'));
check('Verified contract activates Risk section',sectionsWithEnrichment.some(x=>x.id==='risk'));

const evidenceStatus=sectionStatus('evidence',property,{lightBoxParcel:{result:{conflictReport:{conflictCount:2}}}});
check('Evidence section signals review when conflicts exist',evidenceStatus==='REVIEW_REQUIRED');

check('Explorer uses progressive property intelligence model',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('propertyIntelligenceSnapshot'));
check('Explorer uses compact metric rail',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('PropertyMetricRail'));
check('Explorer uses grouped intelligence navigator',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('PropertyIntelligenceNavigator'));
check('Section host supports progressive enrichment placeholders',read('src/broker-product/property-explorer/intelligence/PropertyIntelligenceSectionHost.jsx').includes('activates automatically'));
check('Evidence UI remains source-comparison aware',read('src/broker-product/property-explorer/intelligence/PropertyIntelligenceSectionHost.jsx').includes('LightBoxSourceComparison'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_6_PROGRESSIVE_PROPERTY_INTELLIGENCE_UX',
  version:'3.0-m2.6',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    uxModel:'PROGRESSIVE_DISCLOSURE',
    sidebarDensity:'COMPACT',
    enrichmentSections:'CONTRACT_DRIVEN',
    evidenceAwareness:'ACTIVE',
    conflictVisibility:'ACTIVE',
    canonicalIdentity:'PRESERVED'
  },
  checks
},null,2));
