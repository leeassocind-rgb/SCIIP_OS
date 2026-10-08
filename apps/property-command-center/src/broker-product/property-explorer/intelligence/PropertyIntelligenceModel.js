import{buildCanonicalPropertySnapshot}from'./CanonicalPropertyFieldResolver.js';
import{publishCanonicalPropertyRuntime}from'./CanonicalPropertyRuntimeRegistry.js';
const compact=value=>value===null||value===undefined||value===''?'—':value;

export const INTELLIGENCE_SECTIONS=Object.freeze([
  {id:'snapshot',label:'Snapshot',priority:1,group:'CORE',defaultOpen:true},
  {id:'building',label:'Building & Site',priority:2,group:'CORE',defaultOpen:true},
  {id:'availability',label:'Availability',priority:3,group:'CORE',defaultOpen:true},
  {id:'ownership',label:'Ownership',priority:4,group:'CORE',defaultOpen:false},
  {id:'parcel',label:'Parcel & Spatial',priority:5,group:'PROPERTY',defaultOpen:false},
  {id:'assessment',label:'Assessment',priority:6,group:'PROPERTY',defaultOpen:false},
  {id:'zoning',label:'Zoning',priority:7,group:'PROPERTY',defaultOpen:false},
  {id:'structure',label:'Structure',priority:8,group:'PROPERTY',defaultOpen:false},
  {id:'transactions',label:'Transactions',priority:9,group:'CAPITAL',defaultOpen:false},
  {id:'infrastructure',label:'Infrastructure',priority:10,group:'LOCATION',defaultOpen:false},
  {id:'risk',label:'Risk',priority:11,group:'LOCATION',defaultOpen:false},
  {id:'neighbors',label:'Neighbors',priority:12,group:'LOCATION',defaultOpen:false},
  {id:'evidence',label:'Evidence',priority:13,group:'GOVERNANCE',defaultOpen:false}
]);

export function propertyIntelligenceSnapshot(property,{lightBoxParcel=null,lightBoxReadiness=null}={}){
  const canonicalSnapshot=buildCanonicalPropertySnapshot(property);
  publishCanonicalPropertyRuntime(property,canonicalSnapshot);
  const resolution=lightBoxParcel?.result?.resolution||null;
  const conflict=lightBoxParcel?.result?.conflictReport||null;
  return Object.freeze({
    propertyId:property?.id||null,
    address:property?.address||'—',
    location:[property?.city,property?.state].filter(Boolean).join(', '),
    status:property?.status||'UNKNOWN',
    recordType:property?.recordType||'BASE_INVENTORY',
    buildingSf:compact(canonicalSnapshot.buildingSf),
    landAcres:compact(canonicalSnapshot.landAcres),
    clearHeightFt:compact(canonicalSnapshot.clearHeightFt),
    powerAmps:compact(canonicalSnapshot.powerAmps),
    askingRate:compact(property?.askingRate),
    compRate:compact(property?.compRate),
    parcelId:compact(canonicalSnapshot.parcelId||resolution?.top?.apn),
    provenanceStatus:property?.provenance?.gateStatus||property?.provenance?.status||'UNVERIFIED',
    enrichmentStatus:lightBoxParcel?.phase||'DISABLED',
    enrichmentConfidence:resolution?.confidence||null,
    conflictCount:conflict?.conflictCount||0,
    activeContracts:lightBoxReadiness?.readiness?.activeContracts||[],
    pendingContracts:lightBoxReadiness?.readiness?.pendingContracts||[]
  });
}

export function sectionAvailability(property,{lightBoxParcel=null,lightBoxReadiness=null,neighbors=null}={}){
  const snapshot=propertyIntelligenceSnapshot(property,{lightBoxParcel,lightBoxReadiness});
  const active=new Set(snapshot.activeContracts);
  return Object.freeze({
    snapshot:true,
    building:Boolean(property?.buildingSf||property?.clearHeightFt||property?.powerAmps),
    availability:Boolean(property?.availableSf||property?.askingRate||String(property?.status||'').includes('AVAILABLE')),
    ownership:Boolean(property?.owner||property?.tenant),
    parcel:Boolean(property?.parcelId||property?.boundaryPath?.length||lightBoxParcel?.result?.resolution),
    assessment:active.has('assessment'),
    zoning:Boolean(property?.zoning)||active.has('zoning'),
    structure:active.has('structures'),
    transactions:active.has('transactions'),
    infrastructure:active.has('location-info'),
    risk:active.has('environmental'),
    neighbors:Boolean(neighbors?.rows?.length||neighbors?.relationships?.length),
    evidence:true
  });
}

export function visibleSections(property,context={}){
  const availability=sectionAvailability(property,context);
  return INTELLIGENCE_SECTIONS.filter(section=>availability[section.id]).sort((a,b)=>a.priority-b.priority);
}

export function sectionStatus(sectionId,property,context={}){
  const availability=sectionAvailability(property,context);
  if(!availability[sectionId])return'UNAVAILABLE';
  if(['assessment','structure','transactions','infrastructure','risk'].includes(sectionId))return'ENRICHMENT_READY';
  if(sectionId==='evidence'&&(context.lightBoxParcel?.result?.conflictReport?.conflictCount||0)>0)return'REVIEW_REQUIRED';
  return'AVAILABLE';
}
