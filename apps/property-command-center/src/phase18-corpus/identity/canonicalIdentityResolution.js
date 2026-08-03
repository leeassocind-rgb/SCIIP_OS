const freeze=v=>Object.freeze(v);

const norm=value=>String(value||'').trim().toLowerCase().replace(/[^a-z0-9]/g,'');

export function resolveCanonicalIdentities({records=[]}={}) {
  const groups=new Map();

  for(const record of records){
    const key=record.canonicalKey||[
      norm(record.address),
      norm(record.city),
      norm(record.state),
      norm(record.postalCode)
    ].join('|');

    if(!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(record);
  }

  const identities=[...groups.entries()].map(([key,members],index)=>freeze({
    canonicalId:`CANON-${String(index+1).padStart(5,'0')}`,
    canonicalKey:key,
    memberIds:freeze(members.map(m=>m.recordId)),
    memberCount:members.length,
    reviewRequired:members.some(m=>m.confidence!==undefined&&Number(m.confidence)<.85),
    status:members.some(m=>m.confidence!==undefined&&Number(m.confidence)<.85)?'REVIEW_REQUIRED':'RESOLVED'
  }));

  return freeze({
    identities:freeze(identities),
    totalRecords:records.length,
    canonicalCount:identities.length,
    duplicateRecords:records.length-identities.length,
    permanentIdentityHistory:true,
    autonomousMergeAllowed:false
  });
}
