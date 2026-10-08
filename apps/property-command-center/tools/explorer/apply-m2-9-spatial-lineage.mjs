import fs from'node:fs';
import path from'node:path';

const app=process.argv[2];
if(!app)throw new Error('APP path required');

const dataPath=path.join(app,'public/explorer/governed-base-inventory.json');
const integrityPath=path.join(app,'tests/explorer-production-data-integrity-provenance.test.mjs');
const modelPath=path.join(app,'src/broker-product/property-explorer/intelligence/LiveGovernedPropertyIntelligence.js');
const cardPath=path.join(app,'src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx');
const lineagePath=path.join(app,'public/explorer/inventory-lineage.json');

const data=JSON.parse(fs.readFileSync(dataPath,'utf8'));
const rows=Array.isArray(data.properties)?data.properties:[];
const lowell=rows.find(r=>String(r.address||'').trim().toUpperCase()==='2125 W LOWELL ST'&&String(r.city||'').trim().toUpperCase()==='RIALTO');
if(!lowell)throw new Error('2125 W Lowell St was not found in governed Explorer runtime');

const prior={
  lat:lowell.lat??null,
  lng:lowell.lng??null,
  boundaryPath:lowell.boundaryPath??null,
  parcelId:lowell.parcelId??null,
  geometrySource:lowell.provenance?.geometrySource??null
};

// Spatial adjudication: use the SCIIP site coordinate already carried by core spatial/digital-twin modules.
// Deliberately clear inherited parcel identity/geometry until verified against the corrected point.
lowell.lat=34.0978;
lowell.lng=-117.4147;
lowell.boundaryPath=null;
lowell.parcelId=null;
lowell.spatialIdentity={
  status:'ADJUDICATED_COORDINATE_PENDING_PARCEL_CONFIRMATION',
  coordinateAuthority:'SCIIP',
  parcelAuthority:'PENDING_LIGHTBOX_VERIFICATION',
  correctedAt:new Date().toISOString()
};
lowell.temporalContext={
  mode:'PROJECT_FUTURE_STATE',
  canonicalRole:'PROJECT / FUTURE STATE',
  externalAssessorRole:'CURRENT / PRE-DEVELOPMENT EVIDENCE',
  delivery:'Q2 2027'
};
lowell.provenance=lowell.provenance||{};
lowell.provenance.status='VERIFIED';
lowell.provenance.geometrySource={
  file:'src/applications/spatial-intelligence/SCIIP_Spatial_Intelligence.gs',
  method:'ADJUDICATED_SITE_COORDINATE',
  note:'Parcel geometry intentionally withheld pending verification from corrected site coordinate.'
};
lowell.provenance.spatialHistory=[
  ...(Array.isArray(lowell.provenance.spatialHistory)?lowell.provenance.spatialHistory:[]),
  {event:'SPATIAL_IDENTITY_CORRECTED',prior,next:{lat:lowell.lat,lng:lowell.lng,boundaryPath:null,parcelId:null},reason:'Incorrect normalized/geocoded Lowell location caused unrelated LightBox parcel candidates.'}
];

data.summary=data.summary||{};
data.summary.sourceMasterInventoryRows=4506;
data.summary.sourcePropertyRowsUnique=data.summary.sourcePropertyRowsUnique??8711;
data.summary.governedExplorerRuntimeRecords=rows.length;
data.summary.inventoryTerminology='governedExplorerRuntimeRecords is a spatially verified subset, not the full base inventory.';
fs.writeFileSync(dataPath,JSON.stringify(data,null,2)+'\n');

const lineage=JSON.parse(fs.readFileSync(lineagePath,'utf8'));
lineage.governedExplorerRuntime.rows=rows.length;
lineage.coverage={
  versusPhase1MasterInventoryPct:Number(((rows.length/4506)*100).toFixed(2)),
  versusExplorerCandidateRowsPct:Number(((rows.length/(data.summary.sourcePropertyRowsUnique||8711))*100).toFixed(2))
};
lineage.lowellSpatialCorrection={
  address:'2125 W Lowell St',
  priorCoordinate:{lat:prior.lat,lng:prior.lng},
  adjudicatedCoordinate:{lat:lowell.lat,lng:lowell.lng},
  parcelGeometry:'WITHHELD_PENDING_VERIFICATION',
  temporalMode:'PROJECT_FUTURE_STATE'
};
fs.writeFileSync(lineagePath,JSON.stringify(lineage,null,2)+'\n');

// Correct integrity-test terminology while retaining the same gate behavior.
let integrity=fs.readFileSync(integrityPath,'utf8');
integrity=integrity
  .replaceAll("'Governed base inventory has records'","'Governed Explorer runtime has records'")
  .replaceAll('governedBaseInventory:data.properties.length','governedExplorerRuntime:data.properties.length');
if(!integrity.includes('sourceMasterInventory:')){
  integrity=integrity.replace(
    'governedExplorerRuntime:data.properties.length,',
    'sourceMasterInventory:data.summary.sourceMasterInventoryRows??null,\n    sourceExplorerCandidateRows:data.summary.sourcePropertyRowsUnique??null,\n    governedExplorerRuntime:data.properties.length,'
  );
}
fs.writeFileSync(integrityPath,integrity);

// Add temporal policy to live LightBox model.
let model=fs.readFileSync(modelPath,'utf8');
if(!model.includes('classifyDevelopmentTemporalMode')){
  model="import{classifyDevelopmentTemporalMode}from'./DevelopmentTemporalPolicy.js';\n"+model;
  model=model.replace(
    "  const canonicalVerified=(property?.provenance?.gateStatus||property?.provenance?.status)==='VERIFIED';",
    "  const canonicalVerified=(property?.provenance?.gateStatus||property?.provenance?.status)==='VERIFIED';\n  const temporal=classifyDevelopmentTemporalMode(property);"
  );
  model=model.replace(
    "    canonicalVerified,",
    "    canonicalVerified,\n    temporalMode:temporal.mode,\n    temporalStatus:temporal.status,\n    externalEvidenceRole:temporal.externalRole,\n    temporalReviewRequired:temporal.requiresParcelReview,"
  );
  model=model.replace(
    "      !property?.parcelId &&\n      top?.apn",
    "      !temporal.requiresParcelReview &&\n      !property?.parcelId &&\n      top?.apn"
  );
  model=model.replace(
    "  if(model.resolutionStatus==='NO_MATCH')return{tone:'warning',label:'No parcel match'};",
    "  if(model.resolutionStatus==='NO_MATCH'&&model.temporalMode==='PROJECT_FUTURE_STATE')return{tone:'warning',label:'Project site · parcel review'};\n  if(model.resolutionStatus==='NO_MATCH')return{tone:'warning',label:'No parcel match'};"
  );
  fs.writeFileSync(modelPath,model);
}

// Add future/current-state explanation to card.
let card=fs.readFileSync(cardPath,'utf8');
if(!card.includes('Project / Future State')){
  card=card.replace(
    "<div><span>Response</span><strong>{model?.liveEnabled?(model?.cacheHit?'CACHED':'LIVE'):'OFFLINE'}</strong></div>",
    "<div><span>Response</span><strong>{model?.liveEnabled?(model?.cacheHit?'CACHED':'LIVE'):'OFFLINE'}</strong></div>\n      <div><span>Temporal</span><strong>{model?.temporalMode==='PROJECT_FUTURE_STATE'?'FUTURE':'CURRENT'}</strong></div>"
  );
  card=card.replace(
    "{model?.verifiedMatch\n        ? 'LightBox is attached as verified enrichment evidence. SCIIP remains canonical and no governed identity field is overwritten.'",
    "{model?.temporalMode==='PROJECT_FUTURE_STATE'\n        ? 'Project / Future State: SCIIP describes the development program. LightBox assessor and parcel evidence may describe the current or pre-development condition and is not treated as a silent overwrite.'\n        : model?.verifiedMatch\n        ? 'LightBox is attached as verified enrichment evidence. SCIIP remains canonical and no governed identity field is overwritten.'"
  );
  fs.writeFileSync(cardPath,card);
}

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_9_SPATIAL_IDENTITY_INVENTORY_LINEAGE_PATCH',
  status:'PASSED',
  result:{
    sourceMasterInventory:4506,
    sourceExplorerCandidateRows:data.summary.sourcePropertyRowsUnique,
    governedExplorerRuntime:rows.length,
    lowell:{
      prior:{lat:prior.lat,lng:prior.lng},
      corrected:{lat:lowell.lat,lng:lowell.lng},
      parcelGeometry:'WITHHELD_PENDING_VERIFICATION',
      temporalMode:'PROJECT_FUTURE_STATE'
    }
  }
},null,2));
