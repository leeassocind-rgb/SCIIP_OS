const STORAGE_KEY='sciip.supersheet.ingestion.ledger.v1';
const stableHash = value => {let hash=2166136261;for(const char of value){hash^=char.charCodeAt(0);hash=Math.imul(hash,16777619)}return (hash>>>0).toString(16).padStart(8,'0')};

export function createIngestionId(fileName,rows){return `ING-${stableHash(`${fileName}|${JSON.stringify(rows)}`)}`;}
export function readLedger(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}}
export function appendLedger(entry){const ledger=readLedger();if(ledger.some(item=>item.ingestionId===entry.ingestionId))return {duplicate:true,ledger};const next=[entry,...ledger].slice(0,100);localStorage.setItem(STORAGE_KEY,JSON.stringify(next));return {duplicate:false,ledger:next};}
export function clearLedger(){localStorage.removeItem(STORAGE_KEY)}
