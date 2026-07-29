const KEY='sciip.r55.aircre-extraction-registry.v1';
const parse=v=>{try{return JSON.parse(v)||[]}catch{return[]}};
export function readExtractions(storage=globalThis.localStorage){return parse(storage?.getItem?.(KEY));}
export function importCertifiedExtraction(payload,storage=globalThis.localStorage){if(payload?.framework!=='SCIIP_AIR_CRE_CERTIFIED_CONNECTOR')throw new Error('Select a SCIIP AIR CRE certified extraction JSON file.');const current=readExtractions(storage);const incoming=payload.documents||[];const ids=new Set(current.map(x=>x.document?.documentId));const added=incoming.filter(x=>!ids.has(x.document?.documentId));const next=[...added,...current].sort((a,b)=>(b.document?.reportDate||'').localeCompare(a.document?.reportDate||''));storage?.setItem?.(KEY,JSON.stringify(next));return {added:added.length,duplicates:incoming.length-added.length,registry:next};}
export function clearExtractions(storage=globalThis.localStorage){storage?.removeItem?.(KEY);return []}
