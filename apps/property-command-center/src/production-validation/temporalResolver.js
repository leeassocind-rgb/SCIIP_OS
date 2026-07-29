const normalize=value=>String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
export function createTemporalEntityKey(record={}){
 const address=normalize(record.address),city=normalize(record.city),suite=normalize(record.suite);
 if(!address)return null;return `PROPERTY:${address}:${city}:${suite}`;
}
export function resolveTemporalObservation(record,document){
 const entityKey=createTemporalEntityKey(record);if(!entityKey)return Object.freeze({status:'REVIEW_REQUIRED',reason:'ADDRESS_REQUIRED'});
 return Object.freeze({status:'RESOLVED',entityKey,observedAt:document.reportDate||document.registeredAt,sourceDocumentId:document.documentId,sourcePage:record.sourcePage||null,immutable:true,payload:Object.freeze({...record})});
}