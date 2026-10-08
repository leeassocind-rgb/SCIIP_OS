const PREFIX='sciip:explorer3:governed-recovery:';
const key=id=>PREFIX+String(id||'');
export function readGovernedRecoverySession(id){if(!id)return null;try{const r=globalThis?.window?.sessionStorage?.getItem(key(id));return r?JSON.parse(r):null}catch{return null}}
export function writeGovernedRecoverySession(id,recovery){if(!id||!recovery)return false;try{globalThis?.window?.sessionStorage?.setItem(key(id),JSON.stringify({...recovery,propertyId:id,persistedAt:new Date().toISOString(),persistence:'SESSION'}));return true}catch{return false}}
export function clearGovernedRecoverySession(id){if(!id)return false;try{globalThis?.window?.sessionStorage?.removeItem(key(id));return true}catch{return false}}
export function recoverySessionKey(id){return key(id)}
