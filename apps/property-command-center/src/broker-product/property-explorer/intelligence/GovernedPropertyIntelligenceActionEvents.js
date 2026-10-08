// SCIIP Explorer 3.0 — M2.49
// Governed Property Intelligence Action Event Synchronization
//
// Standardized read-only browser event boundary for governed Property Intelligence
// actions. Underlying action engines remain authoritative and unchanged.

const freeze=x=>Object.freeze(x);
const EVENT_NAME='sciip:governed-property-intelligence-action';

function propertyIdOf(value){
  if(value==null)return null;
  if(typeof value==='string'||typeof value==='number')return String(value);
  return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;
}

export function buildGovernedPropertyIntelligenceActionEvent({
  action,
  property,
  fieldKey=null,
  gap=null,
  result=null,
  decision=null,
  source='PROPERTY_INTELLIGENCE'
}={}){
  const event=freeze({
    milestone:'M2.49',
    type:'GOVERNED_PROPERTY_INTELLIGENCE_ACTION',
    action:String(action||'UNKNOWN'),
    propertyId:propertyIdOf(property),
    fieldKey:fieldKey||gap?.fieldKey||null,
    decision:decision||null,
    source,
    result,
    createdAt:new Date().toISOString(),
    invariants:freeze({
      actionEngineAuthoritative:true,
      acquisitionEngineMutation:false,
      evidenceEngineMutation:false,
      promotionEngineMutation:false,
      canonicalExecutionMutation:false,
      eventIsPresentationOnly:true,
      automaticCanonicalWrites:false
    })
  });
  return event;
}

export function publishGovernedPropertyIntelligenceActionEvent(input){
  const event=buildGovernedPropertyIntelligenceActionEvent(input);
  try{
    globalThis?.window?.dispatchEvent(
      new CustomEvent(EVENT_NAME,{detail:event})
    );
  }catch{}
  return event;
}

export function governedPropertyIntelligenceActionEventName(){
  return EVENT_NAME;
}
