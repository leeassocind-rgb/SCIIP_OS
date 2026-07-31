const freeze=value=>Object.freeze(value);
const normalize=value=>String(value??'').trim().toUpperCase().replace(/[^A-Z0-9]/g,'');

function keyFor(entity={}) {
  if (entity.type==='PROPERTY') return normalize(entity.apn)||normalize(entity.address);
  if (entity.type==='TENANT'||entity.type==='COMPANY') return normalize(entity.domain)||normalize(entity.legalName||entity.name);
  if (entity.type==='PERSON') return `${normalize(entity.email)}|${normalize(entity.name)}`;
  return normalize(entity.id||entity.name);
}

export function resolveEnterpriseEntities({entities=[],minimumConfidence=0.92}={}) {
  const registry=new Map();
  const decisions=[];

  for (const entity of entities) {
    const key=keyFor(entity);
    const registryKey=key?`${entity.type}:${key}`:null;
    const existing=registryKey?registry.get(registryKey):null;
    const confidence=!key?0:(entity.domain||entity.apn||entity.email)?1:0.94;
    const canonicalId=existing?.canonicalId||`${entity.type||'ENTITY'}-${String(registry.size+1).padStart(6,'0')}`;
    const decision=freeze({
      sourceId:entity.id||null,
      type:entity.type||'UNKNOWN',
      canonicalId,
      resolution:!key?'REVIEW_REQUIRED':existing&&confidence>=minimumConfidence?'AUTO_LINK':existing?'POSSIBLE_MATCH':'NEW_CANONICAL',
      confidence,
      humanReviewRequired:!key||Boolean(existing&&confidence<minimumConfidence),
      destructiveMergeAllowed:false
    });
    decisions.push(decision);
    if (registryKey&&!existing) registry.set(registryKey,{canonicalId,entity:freeze({...entity})});
  }

  return freeze({
    decisions:freeze(decisions),
    registrySize:registry.size,
    newCanonical:decisions.filter(item=>item.resolution==='NEW_CANONICAL').length,
    autoLinked:decisions.filter(item=>item.resolution==='AUTO_LINK').length,
    reviewRequired:decisions.filter(item=>item.humanReviewRequired).length,
    destructiveMergeAllowed:false
  });
}
