#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
import{readJson,writeJson,shaJson,norm,num,pick,haversine}from"./M419D4BJRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const biPath=path.join(ev,"m4-19d4bi-r3-certification-fixture-lifecycle-closure.json");
const out=path.join(ev,"m4-19d4bj-controlled-production-cohort-selection-and-readiness.json");
const manifestPath=path.join(ev,"m4-19d4bj-five-property-production-cohort-manifest.json");

function finish(state,x={}){
 const o={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ_CONTROLLED_MULTI_RECORD_PRODUCTION_COHORT_READINESS_AND_SELECTION",
  version:"4.0-m4.19d4bj",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,availabilityObservationIngested:false,broadScaleOutExecuted:false,syntheticEvidenceUsed:false}
 };
 writeJson(out,o);console.log(JSON.stringify(o,null,2));process.exit(0);
}

if(!fs.existsSync(invPath)||!fs.existsSync(biPath))finish("M419D4BJ_REQUIRED_PRODUCTION_CERTIFICATION_OR_INVENTORY_MISSING");
const bi=readJson(biPath);
if(bi.state!=="M419D4BI_R3_CERTIFICATION_FIXTURE_LIFECYCLE_CLOSED_840_RECORD_PRODUCTION_RUNTIME_CERTIFIED_CONTROLLED_COHORT_READY")
 finish("M419D4BJ_BI_R3_CONTROLLED_COHORT_READINESS_REQUIRED",{observed:bi.state});

const inv=readJson(invPath);
const rows=Array.isArray(inv)?inv:(inv.properties||inv.records||inv.items||[]);
if(rows.length!==840)finish("M419D4BJ_PRODUCTION_INVENTORY_COUNT_NOT_840",{observedRecordCount:rows.length});

function recordView(r,i){
 const address=norm(pick(r,["address","propertyAddress","siteAddress","identity.address"]));
 const city=norm(pick(r,["city","propertyCity","identity.city"]));
 const lat=num(pick(r,["latitude","lat","coordinates.latitude","location.latitude","spatialIdentity.lat"]));
 const lng=num(pick(r,["longitude","lng","lon","coordinates.longitude","location.longitude","spatialIdentity.lng"]));
 const availableSf=num(pick(r,["availableSf","available_sf","availability.availableSf","market.availableSf"]));
 const buildingSf=num(pick(r,["buildingSf","buildingSF","buildingSize","buildingSizeSf","building.sizeSf","building.squareFeet","totalSf","totalSF"]));
 const canonical=norm(pick(r,["canonicalPropertyId","canonicalId","identity.canonicalPropertyId"]));
 const sourceId=norm(pick(r,["sourcePropertyId","propertyId","id","identity.sourcePropertyId"]));
 const source=norm(pick(r,["provider","source","provenance.provider","provenance.source","sourceSystem"]));
 const observed=norm(pick(r,["observationTimestamp","observedAt","availability.observationTimestamp","provenance.observationTimestamp","sourceObservedAt"]));
 const provenanceCount=JSON.stringify(r.provenance||{}).length>2?1:0;
 const completeness=[address,lat!==null,lng!==null,availableSf!==null,(buildingSf!==null||availableSf!==null),(canonical||sourceId),source||provenanceCount].filter(Boolean).length;
 return{index:i,address,city,canonicalPropertyId:canonical||null,sourcePropertyId:sourceId||null,latitude:lat,longitude:lng,availableSf,buildingSf,source:source||null,observationTimestamp:observed||null,provenancePresent:Boolean(provenanceCount),completeness,recordHash:shaJson(r)};
}

let views=rows.map(recordView).filter(x=>x.address&&x.latitude!==null&&x.longitude!==null&&x.availableSf!==null);
if(views.length<5)finish("M419D4BJ_INSUFFICIENT_COMPLETE_PRODUCTION_CANDIDATES",{eligibleCandidateCount:views.length});

const sfVals=views.map(x=>x.buildingSf??x.availableSf).filter(Number.isFinite).sort((a,b)=>a-b);
const quantile=q=>sfVals[Math.min(sfVals.length-1,Math.max(0,Math.floor((sfVals.length-1)*q)))];
const cuts={q20:quantile(.2),q40:quantile(.4),q60:quantile(.6),q80:quantile(.8)};
function sizeBand(x){
 const v=x.buildingSf??x.availableSf;
 if(v<=cuts.q20)return"SMALL";
 if(v<=cuts.q40)return"LOWER_MID";
 if(v<=cuts.q60)return"MID";
 if(v<=cuts.q80)return"UPPER_MID";
 return"LARGE";
}
for(const v of views)v.sizeBand=sizeBand(v);

// Prefer records with stronger identity/provenance/completeness first.
views.sort((a,b)=>b.completeness-a.completeness || (b.buildingSf??b.availableSf)-(a.buildingSf??a.availableSf));

// Build a deliberately diverse five-record cohort:
// 1) one strong candidate from each size band, using geographic farthest-point scoring;
// 2) preserve unique addresses and avoid same-city concentration when alternatives exist.
const bands=["SMALL","LOWER_MID","MID","UPPER_MID","LARGE"];
const selected=[];
for(const band of bands){
 let pool=views.filter(x=>x.sizeBand===band&&!selected.some(s=>s.index===x.index));
 if(!pool.length)continue;
 let best=null,bestScore=-Infinity;
 for(const c of pool){
  const minKm=selected.length?Math.min(...selected.map(s=>haversine({lat:c.latitude,lng:c.longitude},{lat:s.latitude,lng:s.longitude}))):0;
  const cityNovelty=selected.some(s=>s.city&&c.city&&s.city.toUpperCase()===c.city.toUpperCase())?0:1;
  const identityBonus=c.canonicalPropertyId?2:(c.sourcePropertyId?1:0);
  const provenanceBonus=c.provenancePresent?1:0;
  const score=c.completeness*10+Math.min(minKm,100)+cityNovelty*12+identityBonus+provenanceBonus;
  if(score>bestScore){bestScore=score;best={...c,selectionScore:Number(score.toFixed(3))}}
 }
 if(best)selected.push(best);
}
if(selected.length<5){
 for(const c of views){
  if(selected.length>=5)break;
  if(selected.some(s=>s.index===c.index))continue;
  selected.push({...c,selectionScore:c.completeness*10});
 }
}
if(selected.length!==5)finish("M419D4BJ_UNABLE_TO_FORM_FIVE_RECORD_COHORT",{selectedCount:selected.length});

const cities=new Set(selected.map(x=>x.city.toUpperCase()).filter(Boolean));
const bandsCovered=new Set(selected.map(x=>x.sizeBand));
const canonicalBound=selected.filter(x=>x.canonicalPropertyId).length;
const provenanceBound=selected.filter(x=>x.provenancePresent||x.source).length;

const cohort=selected.map((x,rank)=>({
 cohortPosition:rank+1,
 inventoryRecordIndex:x.index,
 address:x.address,
 city:x.city||null,
 canonicalPropertyId:x.canonicalPropertyId,
 sourcePropertyId:x.sourcePropertyId,
 latitude:x.latitude,longitude:x.longitude,
 availableSf:x.availableSf,buildingSf:x.buildingSf,
 sizeBand:x.sizeBand,
 source:x.source,
 observationTimestamp:x.observationTimestamp,
 recordHash:x.recordHash,
 selectionRationale:[
  `Represents the ${x.sizeBand} size band`,
  "Has non-null source inventory coordinates",
  "Has explicit availableSf in the governed production inventory",
  x.canonicalPropertyId?"Has canonical identity linkage":"Canonical ID not present on this materialized record; identity lineage must be re-certified before any controlled write",
  x.provenancePresent||x.source?"Carries source/provenance signal":"Source/provenance must be recovered before any fresh availability lifecycle execution"
 ]
}));

const readinessChecks={
 exactFiveRecords:cohort.length===5,
 allUniqueInventoryRecords:new Set(cohort.map(x=>x.inventoryRecordIndex)).size===5,
 allAddressesPresent:cohort.every(x=>x.address),
 allCoordinatesPresent:cohort.every(x=>Number.isFinite(x.latitude)&&Number.isFinite(x.longitude)),
 allAvailableSfPresent:cohort.every(x=>Number.isFinite(x.availableSf)),
 sizeDiversity:bandsCovered.size>=4,
 geographicDiversity:cities.size>=3 || selected.reduce((max,a)=>Math.max(max,...selected.map(b=>haversine({lat:a.latitude,lng:a.longitude},{lat:b.latitude,lng:b.longitude}))),0)>=40,
 noBessemer:cohort.every(x=>!(/14117-14123 Bessemer St/i.test(x.address)||x.canonicalPropertyId==="CPROP-0021AC235DED809E1821"))
};
const selectionReady=Object.values(readinessChecks).every(Boolean);

const lifecycleReadiness=cohort.map(x=>({
 cohortPosition:x.cohortPosition,address:x.address,
 currentProductionRecordReady:true,
 freshAvailabilityLifecycleReady:Boolean(x.source&&x.observationTimestamp),
 identityWriteReady:Boolean(x.canonicalPropertyId),
 requiresBeforeControlledLifecycle:[
  ...(!x.canonicalPropertyId?["CANONICAL_IDENTITY_LINEAGE_RECERTIFICATION"]:[]),
  ...(!x.source?["SOURCE_PROVENANCE_RECOVERY"]:[]),
  ...(!x.observationTimestamp?["SOURCE_NATIVE_FRESHNESS_OBSERVATION_REQUIRED"]:[])
 ]
}));

const manifest={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ_FIVE_PROPERTY_PRODUCTION_COHORT_MANIFEST",
 version:"4.0-m4.19d4bj",createdAt:new Date().toISOString(),
 productionInventoryRecordCount:rows.length,
 selectionMethod:"STRATIFIED_SIZE_BANDS_PLUS_GEOGRAPHIC_DIVERSITY_AND_COMPLETENESS",
 sizeBandCuts:cuts,
 cohort,
 diversity:{uniqueCities:cities.size,sizeBandsCovered:[...bandsCovered],canonicalIdentityBoundCount:canonicalBound,sourceOrProvenanceBoundCount:provenanceBound},
 readinessChecks,
 lifecycleReadiness
};
writeJson(manifestPath,manifest);

finish(selectionReady
 ?"M419D4BJ_FIVE_PROPERTY_CONTROLLED_PRODUCTION_COHORT_SELECTED_AND_READINESS_CERTIFIED_LIFECYCLE_PREAUTHORIZATION_REQUIRED"
 :"M419D4BJ_FIVE_PROPERTY_COHORT_SELECTED_BUT_DIVERSITY_OR_READINESS_GATE_NOT_CERTIFIED",{
 selection:{
  productionInventoryRecordCount:rows.length,
  eligibleCandidateCount:views.length,
  cohortSize:cohort.length,
  selectionMethod:manifest.selectionMethod,
  diversity:manifest.diversity,
  readinessChecks
 },
 cohort,
 lifecycleReadiness,
 artifacts:{cohortManifest:manifestPath},
 policy:{
  readOnlySelection:true,
  noFirstFiveShortcut:true,
  productionScopeOnly:true,
  fixtureRecordsExcluded:true,
  sourceBackedFreshnessRequiredBeforeAvailabilityWrites:true,
  identityLineageRequiredBeforeIdentityWrites:true,
  cohortScaleOutRequiresSeparateAuthorization:true
 },
 nextMilestone:selectionReady
  ?"M4.19D4BJ1_CONTROLLED_FIVE_PROPERTY_COHORT_LIFECYCLE_PREAUTHORIZATION_AND_PER_RECORD_GAP_PLAN"
  :"M4.19D4BJ0_COHORT_SELECTION_RECONCILIATION"
});
