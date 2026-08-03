const freeze=v=>Object.freeze(v);
const clean=v=>String(v??'').trim().toUpperCase().replace(/[^\w]/g,'');
const roundCoord=v=>Number.isFinite(Number(v))?Number(Number(v).toFixed(5)):null;

function canonicalKey(record={}){
  const apn=clean(record.apn||record.parcelNumber);
  if(apn)return `APN:${apn}`;
  const address=clean(record.address||record.streetAddress);
  const city=clean(record.city);
  const state=clean(record.state||record.region);
  if(address)return `ADDR:${address}|${city}|${state}`;
  const lat=roundCoord(record.latitude),lon=roundCoord(record.longitude);
  if(lat!==null&&lon!==null)return `GEO:${lat}|${lon}`;
  return null;
}
function confidence(record,key){
  if(!key)return 0;
  if(key.startsWith('APN:'))return 1;
  if(key.startsWith('ADDR:'))return record.city?0.95:0.86;
  if(key.startsWith('GEO:'))return 0.8;
  return 0;
}
export function createPropertyIdentityResolver({minimumAutoMergeConfidence=0.94}={}){
  const registry=new Map(),decisions=[];
  const resolve=(record={},context={})=>{
    const key=canonicalKey(record),score=confidence(record,key),existing=key?registry.get(key):null;
    const decision=freeze({
      decisionId:`IDENTITY-${decisions.length+1}`,
      sourceRecordId:record.id||context.sourceRecordId||null,
      canonicalKey:key,
      canonicalPropertyId:existing?.canonicalPropertyId||`PROPERTY-${String(registry.size+1).padStart(6,'0')}`,
      resolution:!key?'REVIEW_REQUIRED':existing&&score>=minimumAutoMergeConfidence?'AUTO_MERGE':existing?'POSSIBLE_MATCH':'NEW_CANONICAL',
      confidence:Number(score.toFixed(2)),
      evidence:freeze({
        apn:Boolean(record.apn||record.parcelNumber),
        address:Boolean(record.address||record.streetAddress),
        city:Boolean(record.city),
        coordinates:roundCoord(record.latitude)!==null&&roundCoord(record.longitude)!==null
      }),
      destructiveMergeAllowed:false,
      humanReviewRequired:!key||Boolean(existing&&score<minimumAutoMergeConfidence),
      occurredAt:new Date().toISOString()
    });
    decisions.push(decision);
    if(key&&!existing)registry.set(key,{canonicalPropertyId:decision.canonicalPropertyId,record:freeze({...record})});
    return decision;
  };
  const resolveBatch=(records=[])=>{
    const resolved=records.map((record,index)=>resolve(record,{sourceRecordId:record.id||`ROW-${index+1}`}));
    return freeze({
      total:resolved.length,
      newCanonical:resolved.filter(d=>d.resolution==='NEW_CANONICAL').length,
      autoMerged:resolved.filter(d=>d.resolution==='AUTO_MERGE').length,
      possibleMatches:resolved.filter(d=>d.resolution==='POSSIBLE_MATCH').length,
      reviewRequired:resolved.filter(d=>d.humanReviewRequired).length,
      destructiveMergeAllowed:false,
      decisions:freeze(resolved)
    });
  };
  return freeze({resolve,resolveBatch,decisions:()=>freeze([...decisions]),registrySize:()=>registry.size});
}
