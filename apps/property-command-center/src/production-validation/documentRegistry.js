const KEY='sciip.r55.production-document-registry.v1';
const safeParse=value=>{try{return JSON.parse(value)||[]}catch{return[]}};
export function readDocumentRegistry(storage=globalThis.localStorage){return safeParse(storage?.getItem?.(KEY));}
export function registerDocument(document,storage=globalThis.localStorage){
 const current=readDocumentRegistry(storage);const duplicate=current.find(x=>x.fingerprint===document.fingerprint);
 if(duplicate)return Object.freeze({duplicate:true,document:duplicate,registry:current});
 const entry=Object.freeze({...document,registeredAt:new Date().toISOString(),sourceType:'AIR_CRE_DAILY_SUPERSHEET_PDF',immutable:true});
 const registry=Object.freeze([entry,...current].sort((a,b)=>(b.reportDate||'').localeCompare(a.reportDate||'')));
 storage?.setItem?.(KEY,JSON.stringify(registry));return Object.freeze({duplicate:false,document:entry,registry});
}
export function clearDocumentRegistry(storage=globalThis.localStorage){storage?.removeItem?.(KEY);return []}
export const DOCUMENT_REGISTRY_KEY=KEY;