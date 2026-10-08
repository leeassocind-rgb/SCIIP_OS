// SCIIP Explorer 3.0 — M2.57
// Governed Property Intelligence Recovery Audit & Observability
//
// Property-scoped, session-scoped, append-only recovery observability.
// This module does not execute actions and never mutates canonical property truth.

const PREFIX='sciip:explorer3:governed-recovery-audit:';
const MAX_EVENTS=100;

const key=propertyId=>PREFIX+String(propertyId||'');

function safeWindow(){
  try{return globalThis?.window||null;}catch{return null;}
}

function readRaw(propertyId){
  if(!propertyId)return[];
  try{
    const raw=safeWindow()?.sessionStorage?.getItem(key(propertyId));
    const parsed=raw?JSON.parse(raw):[];
    return Array.isArray(parsed)?parsed:[];
  }catch{return[];}
}

function writeRaw(propertyId,events){
  if(!propertyId)return false;
  try{
    safeWindow()?.sessionStorage?.setItem(
      key(propertyId),
      JSON.stringify(events.slice(-MAX_EVENTS))
    );
    return true;
  }catch{return false;}
}

export function appendGovernedRecoveryAuditEvent({
  propertyId,
  type,
  state=null,
  retryCount=0,
  retryOf=null,
  action=null,
  fieldKey=null,
  decision=null,
  authoritative=false,
  metadata=null
}={}){
  if(!propertyId||!type)return null;
  const existing=readRaw(propertyId);
  const event=Object.freeze({
    milestone:'M2.57',
    eventId:`GRA-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
    propertyId,
    type:String(type),
    state,
    retryCount:Number(retryCount||0),
    retryOf:retryOf||null,
    action:action||null,
    fieldKey:fieldKey||null,
    decision:decision||null,
    authoritative:!!authoritative,
    metadata:metadata||null,
    occurredAt:new Date().toISOString(),
    appendOnly:true,
    automaticCanonicalWrites:false
  });
  writeRaw(propertyId,[...existing,event]);
  return event;
}

export function readGovernedRecoveryAudit(propertyId){
  return readRaw(propertyId);
}

export function clearGovernedRecoveryAudit(propertyId){
  if(!propertyId)return false;
  try{
    safeWindow()?.sessionStorage?.removeItem(key(propertyId));
    return true;
  }catch{return false;}
}

export function governedRecoveryAuditKey(propertyId){
  return key(propertyId);
}

export function summarizeGovernedRecoveryAudit(propertyId){
  const events=readRaw(propertyId);
  return Object.freeze({
    propertyId,
    events,
    eventCount:events.length,
    retryAttempts:events.filter(e=>e.type==='RETRY_STARTED').length,
    failures:events.filter(e=>e.type==='RETRY_FAILED'||e.type==='ACTION_FAILED').length,
    recoveries:events.filter(e=>e.type==='RECOVERED').length,
    lastEvent:events.at(-1)||null,
    appendOnly:true,
    sessionScoped:true,
    automaticCanonicalWrites:false
  });
}
