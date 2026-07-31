const ABBREVIATIONS = [[/\bstreet\b/g,'st'],[/\bavenue\b/g,'ave'],[/\bboulevard\b/g,'blvd'],[/\broad\b/g,'rd'],[/\bdrive\b/g,'dr'],[/\blane\b/g,'ln'],[/\bhighway\b/g,'hwy'],[/\bnorth\b/g,'n'],[/\bsouth\b/g,'s'],[/\beast\b/g,'e'],[/\bwest\b/g,'w']];
export function normalizeAddress(value='') {
  let v=String(value).toLowerCase().replace(/#\s*[a-z0-9-]+\b/g,' ').replace(/[,]/g,' ').replace(/\b(suite|ste|unit)\s+[a-z0-9-]+\b/g,' ').replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  for (const [pattern,replacement] of ABBREVIATIONS) v=v.replace(pattern,replacement);
  return v.replace(/\s+/g,' ').trim();
}
export function normalizeApn(value='') { return String(value).toUpperCase().replace(/[^A-Z0-9]/g,''); }
export function identityKey(input={}) {
  const apn=normalizeApn(input.apn);
  if (apn) return `APN:${apn}`;
  const address=normalizeAddress(input.address || input.streetAddress);
  const city=String(input.city||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const state=String(input.state||'CA').toUpperCase();
  if (address) return `ADDR:${address}|${city}|${state}`;
  if (Number.isFinite(Number(input.latitude)) && Number.isFinite(Number(input.longitude))) return `GEO:${Number(input.latitude).toFixed(5)},${Number(input.longitude).toFixed(5)}`;
  return null;
}
export function createPropertyIdentityService(seed=[]) {
  const identities=new Map(); const aliases=new Map(); let seq=0;
  for (const item of seed) { identities.set(item.propertyId,{...item}); seq++; for(const alias of item.aliases||[]) aliases.set(alias,item.propertyId); }
  return Object.freeze({
    resolve(observation={}) {
      const key=identityKey(observation);
      if (!key) return {status:'REVIEW_REQUIRED',reason:'INSUFFICIENT_IDENTITY_FIELDS',confidence:0};
      const existingId=aliases.get(key);
      if(existingId) return {status:'MATCHED',propertyId:existingId,identity:{...identities.get(existingId)},matchKey:key,confidence:key.startsWith('APN:')?1:0.96};
      const propertyId=`PROP-${String(++seq).padStart(8,'0')}`;
      const identity={propertyId,canonicalAddress:observation.address||observation.streetAddress||null,city:observation.city||null,state:observation.state||'CA',apn:observation.apn||null,latitude:observation.latitude??null,longitude:observation.longitude??null,aliases:[key],createdAt:observation.observedAt||new Date().toISOString()};
      identities.set(propertyId,identity); aliases.set(key,propertyId);
      return {status:'CREATED',propertyId,identity:{...identity},matchKey:key,confidence:key.startsWith('APN:')?1:0.93};
    },
    addAlias(propertyId,input={}) { if(!identities.has(propertyId)) throw new Error(`Unknown property: ${propertyId}`); const key=identityKey(input); if(!key) return false; aliases.set(key,propertyId); const i=identities.get(propertyId); if(!i.aliases.includes(key)) i.aliases.push(key); return true; },
    list() { return [...identities.values()].map(x=>JSON.parse(JSON.stringify(x))); },
    count() { return identities.size; }
  });
}
