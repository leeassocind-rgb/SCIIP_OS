import{getCanonicalOverlayValue}from'./CanonicalPromotionExecutor.js';
function freeze(value){return Object.freeze(value);}
function num(value){const n=Number(value);return Number.isFinite(n)?n:null;}
function digits(value=''){return String(value??'').replace(/\D/g,'');}
function text(value=''){return String(value??'').trim();}
function normText(value=''){return text(value).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}

function firstDefined(...values){
  for(const value of values){
    if(value!==undefined&&value!==null&&value!=='')return value;
  }
  return null;
}

function canonicalField(property,key){
  const propertyId=property?.id||property?.propertyId||property?.canonicalPropertyId||null;
  const map={
    parcelId:()=>firstDefined(property?.parcelId,property?.apn,property?.parcelApn),
    landAcres:()=>firstDefined(property?.landAcres,property?.landAreaAcres,property?.siteAcres,property?.acres,property?.lotAcres,property?.site?.acres),
    buildingSf:()=>firstDefined(property?.buildingSf,property?.buildingSF,property?.buildingArea,property?.squareFeet,property?.sf,property?.building?.sf),
    propertyType:()=>firstDefined(property?.propertyType,property?.assetType,property?.buildingType,property?.use),
    owner:()=>firstDefined(property?.owner,property?.ownership,property?.ownerName),
    assessedTotal:()=>firstDefined(property?.assessedTotal,property?.assessment?.total),
    landUse:()=>firstDefined(property?.landUse,property?.zoningUse),
    clearHeight:()=>firstDefined(property?.clearHeight,property?.clearHt,property?.clear),
    powerAmps:()=>firstDefined(property?.powerAmps,property?.power,property?.amps)
  };
  const base=map[key]?.()??null;
  return getCanonicalOverlayValue(propertyId,key,base);
}

function externalField(parcel,key){
  const map={
    parcelId:()=>firstDefined(parcel?.apn,parcel?.parcelApn,parcel?.alternateApn),
    landAcres:()=>parcel?.site?.calculatedLotAreaAcres??null,
    buildingSf:()=>null,
    propertyType:()=>firstDefined(parcel?.propertyType?.typeDescription,parcel?.propertyType?.classDescription),
    owner:()=>firstDefined(parcel?.owner?.name,parcel?.ownership?.name),
    assessedTotal:()=>parcel?.assessment?.total??null,
    landUse:()=>firstDefined(parcel?.landUse?.normalizedDescription,parcel?.landUse?.description),
    clearHeight:()=>null,
    powerAmps:()=>null
  };
  return map[key]?.()??null;
}

function fieldType(key){
  if(['landAcres','buildingSf','assessedTotal','clearHeight','powerAmps'].includes(key))return'NUMBER';
  if(key==='parcelId')return'PARCEL_ID';
  if(['propertyType','landUse'].includes(key))return'CLASSIFICATION';
  return'TEXT';
}

function normalizeValue(key,value){
  if(value===null||value===undefined||value==='')return null;
  const type=fieldType(key);
  if(type==='NUMBER')return num(value);
  if(type==='PARCEL_ID')return digits(value);
  if(type==='CLASSIFICATION')return normText(value);
  return normText(value);
}

function classificationEquivalent(a,b){
  const A=normText(a),B=normText(b);
  if(!A||!B)return false;
  if(A===B||A.includes(B)||B.includes(A))return true;
  const industrial=['industrial','warehouse','distribution','logistics','manufacturing'];
  return industrial.some(term=>A.includes(term))&&industrial.some(term=>B.includes(term));
}

function agreementFor(key,canonical,external){
  if(canonical==null&&external==null)return freeze({state:'NO_DATA',deltaPct:null});
  if(canonical!=null&&external==null)return freeze({state:'CANONICAL_ONLY',deltaPct:null});
  if(canonical==null&&external!=null)return freeze({state:'ENRICHMENT_ONLY',deltaPct:null});

  const type=fieldType(key);
  if(type==='NUMBER'){
    const a=num(canonical),b=num(external);
    if(a===null||b===null)return freeze({state:'REVIEW',deltaPct:null});
    const delta=a===0?(a===b?0:null):Math.abs(b-a)/Math.abs(a)*100;
    if(delta===null)return freeze({state:'REVIEW',deltaPct:null});
    if(delta<=3)return freeze({state:'AGREED',deltaPct:delta});
    if(delta<=10)return freeze({state:'REVIEW',deltaPct:delta});
    return freeze({state:'CONFLICT',deltaPct:delta});
  }

  if(type==='PARCEL_ID'){
    return freeze({state:digits(canonical)===digits(external)?'AGREED':'CONFLICT',deltaPct:null});
  }

  if(type==='CLASSIFICATION'){
    return freeze({state:classificationEquivalent(canonical,external)?'AGREED':'REVIEW',deltaPct:null});
  }

  return freeze({state:normText(canonical)===normText(external)?'AGREED':'REVIEW',deltaPct:null});
}

function confidenceFor(state,identityConfidence){
  const identity=Number(identityConfidence)||0;
  if(state==='AGREED')return identity>=90?'HIGH':'MEDIUM';
  if(state==='CANONICAL_ONLY')return'HIGH';
  if(state==='ENRICHMENT_ONLY')return identity>=90?'MEDIUM':'LOW';
  if(state==='REVIEW')return'MEDIUM';
  if(state==='CONFLICT')return'LOW';
  return'UNRATED';
}

function temporalFor(property,parcel){
  const raw=String(property?.temporalState??property?.temporal??'CURRENT').toUpperCase();
  return freeze({
    canonical:raw,
    evidence:parcel?.status==='VERIFIED_ENRICHMENT'?'CURRENT_OR_RECORDED':'UNKNOWN'
  });
}

function sourceEvidence(parcel,key,value){
  if(value==null)return freeze([]);
  return freeze([freeze({
    provider:'LightBox',
    authority:'EXTERNAL_EVIDENCE',
    value,
    parcelId:parcel?.lightBoxParcelId||null,
    apn:parcel?.apn||parcel?.parcelApn||null,
    sourcePath:parcel?.sourcePath||null
  })]);
}

const FIELD_DEFINITIONS=freeze([
  freeze({key:'parcelId',label:'Parcel ID',group:'Identity'}),
  freeze({key:'landAcres',label:'Land Area',group:'Site'}),
  freeze({key:'buildingSf',label:'Building SF',group:'Building'}),
  freeze({key:'propertyType',label:'Property Type',group:'Classification'}),
  freeze({key:'landUse',label:'Land Use',group:'Classification'}),
  freeze({key:'owner',label:'Ownership',group:'Ownership'}),
  freeze({key:'assessedTotal',label:'Assessed Total',group:'Assessment'}),
  freeze({key:'clearHeight',label:'Clear Height',group:'Building'}),
  freeze({key:'powerAmps',label:'Power',group:'Building'})
]);

export function buildPropertyIntelligenceProvenance(property,parcelEnrichment,parcelSynthesis){
  const identityConfidence=Number(parcelSynthesis?.identityConfidence??property?.identityConfidence??0)||0;
  const temporal=temporalFor(property,parcelEnrichment);

  const fields=FIELD_DEFINITIONS.map(def=>{
    const canonical=canonicalField(property,def.key);
    const external=externalField(parcelEnrichment,def.key);
    const agreement=agreementFor(def.key,canonical,external);
    const normalizedCanonical=normalizeValue(def.key,canonical);
    const normalizedExternal=normalizeValue(def.key,external);

    return freeze({
      ...def,
      type:fieldType(def.key),
      canonical:freeze({
        value:canonical,
        normalizedValue:normalizedCanonical,
        authority:'SCIIP',
        governed:true
      }),
      evidence:sourceEvidence(parcelEnrichment,def.key,external),
      externalValue:external,
      normalizedExternalValue:normalizedExternal,
      agreementState:agreement.state,
      deltaPct:agreement.deltaPct,
      confidence:confidenceFor(agreement.state,identityConfidence||92),
      temporal,
      conflictState:agreement.state==='CONFLICT'?'CONFLICT':
        agreement.state==='REVIEW'?'REVIEW':
        agreement.state==='AGREED'?'ALIGNED':'NONE',
      provenance:freeze({
        canonicalSource:'SCIIP',
        externalSources:external==null?freeze([]):freeze(['LightBox']),
        mergePolicy:'ENRICH_NEVER_OVERWRITE'
      })
    });
  });

  const counts=fields.reduce((acc,field)=>{
    acc.total+=1;
    if(field.agreementState==='AGREED')acc.agreed+=1;
    if(field.agreementState==='REVIEW')acc.review+=1;
    if(field.agreementState==='CONFLICT')acc.conflicts+=1;
    if(field.agreementState==='ENRICHMENT_ONLY')acc.enrichmentOnly+=1;
    if(field.agreementState==='CANONICAL_ONLY')acc.canonicalOnly+=1;
    return acc;
  },{total:0,agreed:0,review:0,conflicts:0,enrichmentOnly:0,canonicalOnly:0});

  return freeze({
    status:'ACTIVE',
    canonicalAuthority:'SCIIP',
    mergePolicy:'ENRICH_NEVER_OVERWRITE',
    fields:freeze(fields),
    counts:freeze(counts),
    posture:counts.conflicts>0?'CONFLICT':
      counts.review>0?'REVIEW':
      counts.agreed>0?'CORROBORATED':'CANONICAL',
    fieldContract:freeze([
      'canonicalValue',
      'sourceEvidence',
      'normalizedValue',
      'confidence',
      'conflictState',
      'temporalState',
      'provenance'
    ])
  });
}

export function findProvenanceField(model,key){
  return model?.fields?.find(field=>field.key===key)||null;
}

export function formatProvenanceValue(field,value){
  if(value===null||value===undefined||value==='')return'—';
  if(field?.key==='landAcres')return `${Number(value).toFixed(2)} ac`;
  if(field?.key==='buildingSf')return Number(value).toLocaleString('en-US')+' SF';
  if(field?.key==='assessedTotal')return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number(value));
  if(field?.key==='clearHeight')return `${Number(value)}'`;
  if(field?.key==='powerAmps')return `${Number(value).toLocaleString('en-US')} A`;
  return String(value);
}
