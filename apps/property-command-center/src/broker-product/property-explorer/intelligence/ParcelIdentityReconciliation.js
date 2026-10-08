import{buildVerifiedParcelIntelligence}from'./VerifiedParcelIntelligence.js';
import{buildVerifiedParcelSynthesis}from'./VerifiedParcelSynthesis.js';
import{buildPropertyIntelligenceProvenance}from'./PropertyIntelligenceProvenance.js';
import{buildGovernedAttributeResolution}from'./GovernedAttributeResolution.js';
const digits=v=>String(v??'').replace(/\D/g,'');

export function normalizeParcelApn(value){
  const x=digits(value);
  return x.length>=8?x:null;
}

export function normalizeStreet(value=''){
  return String(value??'').toLowerCase()
    .replace(/\bavenue\b/g,'ave').replace(/\bstreet\b/g,'st')
    .replace(/\broad\b/g,'rd').replace(/\bboulevard\b/g,'blvd')
    .replace(/\bdrive\b/g,'dr').replace(/\bhighway\b/g,'hwy')
    .replace(/\bnorth\b/g,'n').replace(/\bsouth\b/g,'s')
    .replace(/\beast\b/g,'e').replace(/\bwest\b/g,'w')
    .replace(/[^a-z0-9 ]+/g,' ').replace(/\s+/g,' ').trim();
}

function collect(root,test,limit=120){
  const out=[],seen=new Set();
  function walk(value,path='root',depth=0){
    if(out.length>=limit||depth>8||value==null)return;
    if(typeof value!=='object')return;
    if(seen.has(value))return;
    seen.add(value);
    if(Array.isArray(value)){value.forEach((v,i)=>walk(v,`${path}[${i}]`,depth+1));return;}
    for(const [key,val] of Object.entries(value)){
      if(test(key,val,path))out.push({key,value:val,path:`${path}.${key}`});
      walk(val,`${path}.${key}`,depth+1);
    }
  }
  walk(root);
  return out;
}

function candidateApns(state){
  return collect(state,(k,v)=>{
    const key=String(k).toLowerCase();
    return typeof v==='string'&&['apn','parcelapn','alternateapn','parcelid'].includes(key);
  }).map(x=>({...x,normalized:normalizeParcelApn(x.value)})).filter(x=>x.normalized);
}

function candidateAddresses(state){
  return collect(state,(k,v)=>{
    const key=String(k).toLowerCase();
    return typeof v==='string'&&['streetaddress','address','label','siteaddress','situsaddress'].includes(key);
  }).map(x=>({...x,normalized:normalizeStreet(x.value)})).filter(x=>x.normalized);
}

function addressAligned(a,b){
  a=normalizeStreet(a); b=normalizeStreet(b);
  if(!a||!b)return false;
  if(a===b)return true;
  const na=a.match(/^(\d+[a-z]?)/)?.[1], nb=b.match(/^(\d+[a-z]?)/)?.[1];
  if(!na||na!==nb)return false;
  const aa=a.split(' ').slice(1), bb=b.split(' ').slice(1);
  return aa.filter(x=>bb.includes(x)).length>=Math.min(2,Math.max(1,aa.length));
}

function futureState(property){
  const s=String(property?.status||'').toUpperCase();
  return ['UNDER CONSTRUCTION','PROPOSED','PLANNED','FUTURE'].some(x=>s.includes(x));
}


function finitePercent(value){
  const n=Number(value);
  if(!Number.isFinite(n))return null;
  if(n>=0&&n<=1)return Math.round(n*100);
  if(n>=0&&n<=100)return Math.round(n);
  return null;
}

function deepCandidates(root,test,limit=160){
  const rows=[],seen=new Set();
  function walk(value,path='root',depth=0){
    if(rows.length>=limit||depth>8||value==null)return;
    if(typeof value!=='object')return;
    if(seen.has(value))return;
    seen.add(value);
    if(Array.isArray(value)){
      value.forEach((v,i)=>walk(v,`${path}[${i}]`,depth+1));
      return;
    }
    for(const [key,val] of Object.entries(value)){
      if(test(key,val,path))rows.push({key,value:val,path:`${path}.${key}`});
      walk(val,`${path}.${key}`,depth+1);
    }
  }
  walk(root);
  return rows;
}

export function extractLightBoxSourceConfidence(lightBoxState,baseModel={}){
  const direct=[
    baseModel?.sourceConfidence,
    baseModel?.candidateConfidence,
    lightBoxState?.sourceConfidence,
    lightBoxState?.candidateConfidence,
    lightBoxState?.matchConfidence,
    lightBoxState?.confidence,
    lightBoxState?.resolution?.matchConfidence,
    lightBoxState?.resolution?.confidence,
    lightBoxState?.resolution?.score,
    lightBoxState?.result?.matchConfidence,
    lightBoxState?.result?.confidence
  ];
  for(const value of direct){
    const pct=finitePercent(value);
    if(pct!==null)return pct;
  }

  const candidates=deepCandidates(lightBoxState,(key,val,path)=>{
    const k=String(key).toLowerCase();
    return ['matchconfidence','candidateconfidence','confidence','score'].includes(k)
      && finitePercent(val)!==null
      && /(resolution|resolve|candidate|match|parcel|result)/i.test(path);
  }).map(row=>({
    ...row,
    pct:finitePercent(row.value),
    rank:/matchconfidence/i.test(row.key)?100:
      /candidateconfidence/i.test(row.key)?95:
      /resolution/i.test(row.path)?80:
      /parcel/i.test(row.path)?70:
      /score/i.test(row.key)?50:40
  })).sort((a,b)=>b.rank-a.rank);

  return candidates[0]?.pct??null;
}


function conflictFieldName(item){
  return String(
    item?.field??
    item?.fieldName??
    item?.name??
    item?.key??
    item?.attribute??
    'unknown'
  );
}

function conflictValue(item,names){
  for(const name of names){
    if(item?.[name]!==undefined&&item?.[name]!==null)return item[name];
  }
  return null;
}

export function extractLightBoxConflictDetails(lightBoxState,baseModel={}){
  const arrays=[
    baseModel?.conflicts,
    baseModel?.conflictReport?.conflicts,
    lightBoxState?.conflicts,
    lightBoxState?.conflictReport?.conflicts,
    lightBoxState?.resolution?.conflicts,
    lightBoxState?.resolution?.conflictReport?.conflicts
  ].filter(Array.isArray);

  let source=arrays.find(items=>items.length)||[];

  if(!source.length){
    const discovered=deepCandidates(lightBoxState,(key,val,path)=>
      String(key).toLowerCase()==='conflicts'&&Array.isArray(val)&&/conflict/i.test(path)
    ).map(row=>row.value).find(items=>items.length);
    source=discovered||[];
  }

  return Object.freeze(source.map((item,index)=>Object.freeze({
    id:String(item?.id??`conflict-${index+1}`),
    field:conflictFieldName(item),
    sciipValue:conflictValue(item,['authoritativeValue','canonicalValue','sciipValue','currentValue','leftValue','value']),
    externalValue:conflictValue(item,['candidateValue','externalValue','lightBoxValue','incomingValue','rightValue','sourceValue']),
    sourceType:String(item?.sourceType??item?.provider??item?.source??'LIGHTBOX'),
    raw:item
  })));
}

function conflictClass(field=''){
  const f=String(field).toLowerCase().replace(/[^a-z0-9]/g,'');
  if(/^(apn|parcelapn|parcelid|alternateapn)$/.test(f))return'PARCEL_ID';
  if(/(address|streetaddress|siteaddress|situsaddress|locality|city|postal|zipcode|zip|regioncode)/.test(f))return'ADDRESS';
  if(/(latitude|longitude|geometry|representativepoint|centroid)/.test(f))return'SPATIAL';
  return'ATTRIBUTE';
}

function classifyConflictDetails(details,reconciliation){
  return Object.freeze((details||[]).map(item=>{
    const domain=conflictClass(item.field);
    const resolved=
      (domain==='PARCEL_ID'&&Boolean(reconciliation?.apnEquivalent))||
      (domain==='ADDRESS'&&Boolean(reconciliation?.addressAligned));

    return Object.freeze({
      ...item,
      domain,
      disposition:resolved?'RESOLVED_REPRESENTATION':
        domain==='ATTRIBUTE'?'ATTRIBUTE_REVIEW':'IDENTITY_REVIEW',
      identityBearing:domain!=='ATTRIBUTE',
      resolvedByNormalization:resolved
    });
  }));
}
export function extractLightBoxEvidenceConflicts(lightBoxState,baseModel={}){
  const direct=[
    baseModel?.evidenceConflictCount,
    baseModel?.conflictCount,
    baseModel?.conflicts?.length,
    lightBoxState?.evidenceConflictCount,
    lightBoxState?.conflictCount,
    lightBoxState?.conflicts?.length,
    lightBoxState?.conflictReport?.conflictCount,
    lightBoxState?.conflictReport?.conflicts?.length,
    lightBoxState?.resolution?.conflictCount,
    lightBoxState?.resolution?.conflicts?.length,
    lightBoxState?.resolution?.conflictReport?.conflictCount,
    lightBoxState?.resolution?.conflictReport?.conflicts?.length
  ];
  for(const value of direct){
    const n=Number(value);
    if(Number.isInteger(n)&&n>=0)return n;
  }

  const candidates=deepCandidates(lightBoxState,(key,val,path)=>{
    const k=String(key).toLowerCase();
    if(k==='conflictcount'&&Number.isInteger(Number(val)))return true;
    if(k==='conflicts'&&Array.isArray(val))return true;
    return false;
  }).map(row=>({
    ...row,
    count:Array.isArray(row.value)?row.value.length:Number(row.value),
    rank:/conflictreport/i.test(row.path)?100:/resolution/i.test(row.path)?80:50
  })).filter(row=>Number.isInteger(row.count)&&row.count>=0)
    .sort((a,b)=>b.rank-a.rank);

  return candidates[0]?.count??0;
}

export function reconcileParcelIdentity(property,lightBoxState,baseModel={}){
  const canonicalApn=normalizeParcelApn(property?.parcelId||property?.apn||property?.parcelApn);
  const apns=candidateApns(lightBoxState);
  const addresses=candidateAddresses(lightBoxState);
  const apnHit=canonicalApn?apns.find(x=>x.normalized===canonicalApn):null;
  const canonicalAddress=property?.address||property?.streetAddress||'';
  const addressHit=addresses.find(x=>addressAligned(canonicalAddress,x.value))||null;
  const future=futureState(property);
  const strong=Boolean(apnHit&&addressHit&&!future);
  const rawSourceConfidence=extractLightBoxSourceConfidence(lightBoxState,baseModel);
  const sourceConfidence=rawSourceConfidence??0;
  const identityConfidence=strong?Math.max(sourceConfidence,92):sourceConfidence;
  const evidenceConflictCount=extractLightBoxEvidenceConflicts(lightBoxState,baseModel);
  const rawConflictDetails=extractLightBoxConflictDetails(lightBoxState,baseModel);
  const reconciliationIdentity=Object.freeze({
    apnEquivalent:Boolean(apnHit),
    addressAligned:Boolean(addressHit)
  });
  const conflictDetails=classifyConflictDetails(rawConflictDetails,reconciliationIdentity);
  const identityConflictCount=conflictDetails.length
    ?conflictDetails.filter(item=>item.identityBearing&&!item.resolvedByNormalization).length
    :strong?0:Math.max(0,evidenceConflictCount-(apnHit?1:0)-(addressHit?1:0));
  const attributeConflictCount=conflictDetails.filter(item=>item.domain==='ATTRIBUTE').length;
  const resolvedRepresentationCount=conflictDetails.filter(item=>item.resolvedByNormalization).length;

  const next={
    ...baseModel,
    sourceConfidence:rawSourceConfidence,
    candidateConfidence:rawSourceConfidence,
    identityConfidence,
    confidence:identityConfidence,
    matchConfidence:identityConfidence,
    conflictCount:identityConflictCount,
    identityConflictCount,
    attributeConflictCount,
    resolvedRepresentationCount,
    evidenceConflictDetails:conflictDetails,
    parcelEnrichment:buildVerifiedParcelIntelligence(property,lightBoxState,{verifiedMatch:strong,matchedExternalApn:apnHit?.value??null}),
    parcelSynthesis:buildVerifiedParcelSynthesis(property,buildVerifiedParcelIntelligence(property,lightBoxState,{verifiedMatch:strong,matchedExternalApn:apnHit?.value??null})),
    propertyProvenance:buildPropertyIntelligenceProvenance(property,buildVerifiedParcelIntelligence(property,lightBoxState,{verifiedMatch:strong,matchedExternalApn:apnHit?.value??null}),buildVerifiedParcelSynthesis(property,buildVerifiedParcelIntelligence(property,lightBoxState,{verifiedMatch:strong,matchedExternalApn:apnHit?.value??null}))),
    evidenceConflictCount,
    canonicalConflictCount:Number(property?.canonicalConflictCount??property?.canonicalConflicts?.length??0)||0,
    conflictSemantics:Object.freeze({
      identity:'Conflicts remaining after parcel identity normalization and reconciliation.',
      evidence:'Raw field-level disagreements detected between governed SCIIP evidence and LightBox evidence before identity normalization.',
      canonical:'Conflicts intrinsic to canonical SCIIP lineage, if separately present.',
      sourceConfidence:'Original external candidate/resolver confidence before governed reconciliation.',
      identityConfidence:'Final governed confidence in property-to-parcel identity.'
    }),
    reconciliation:Object.freeze({
      status:strong?'VERIFIED_IDENTITY':future?'FUTURE_STATE_REVIEW':'REVIEW_REQUIRED',
      canonicalApn,
      matchedExternalApn:apnHit?.value??null,
      apnEquivalent:Boolean(apnHit),
      canonicalAddress:canonicalAddress||null,
      matchedExternalAddress:addressHit?.value??null,
      addressAligned:Boolean(addressHit),
      futureState:future,
      evidenceRule:'EXACT_NORMALIZED_APN_PLUS_ALIGNED_SITUS_ADDRESS',
      silentOverwrite:false
    })
  };
  next.attributeResolution=buildGovernedAttributeResolution(next.propertyProvenance);


  if(strong){
    next.resolutionStatus='VERIFIED_MATCH';
    next.parcelMatch='VERIFIED_MATCH';
    next.verifiedMatch=true;
    next.reviewRequired=false;
  }else if(future){
    next.reviewRequired=true;
  }
  return Object.freeze(next);
}
