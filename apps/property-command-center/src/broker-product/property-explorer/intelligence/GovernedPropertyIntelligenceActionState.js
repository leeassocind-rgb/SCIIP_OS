// SCIIP Explorer 3.0 — M2.51
// Governed Property Intelligence Action-State UI Synchronization
// Presentation-only projection of the latest property-scoped governed action event.
const freeze=x=>Object.freeze(x);
function propertyIdOf(value){if(value==null)return null;if(typeof value==='string'||typeof value==='number')return String(value);return value?.propertyId||value?.id||value?.canonicalPropertyId||value?.parcelId||value?.apn||null;}
const ACTION_STATE=freeze({REQUEST_ACQUISITION:'REQUESTED',OPEN_EVIDENCE_REVIEW:'IN_REVIEW',ATTACH_EVIDENCE:'EVIDENCE_ATTACHED',VERIFY_EVIDENCE:'VERIFIED',DECIDE_PROMOTION:'DECIDED'});
export function resolveGovernedPropertyIntelligenceActionState({property,lastEvent=null,revision=0}={}){
 const propertyId=propertyIdOf(property); const eventMatches=!!lastEvent&&!!propertyId&&lastEvent.propertyId===propertyId;
 const action=eventMatches?lastEvent.action:null; const decision=eventMatches?lastEvent.decision:null;
 let state=action?(ACTION_STATE[action]||'UPDATED'):'READY';
 if(action==='VERIFY_EVIDENCE'&&decision==='REJECTED')state='REJECTED';
 if(action==='DECIDE_PROMOTION'&&decision==='PROMOTE')state='PROMOTION_APPROVED';
 if(action==='DECIDE_PROMOTION'&&decision==='HOLD')state='ON_HOLD';
 return freeze({milestone:'M2.51',status:propertyId?'ACTIVE':'NO_SELECTION',propertyId,revision,action,decision,state,fieldKey:eventMatches?lastEvent.fieldKey:null,createdAt:eventMatches?lastEvent.createdAt:null,invariants:freeze({propertyScoped:true,governedEventAuthoritative:true,presentationOnly:true,actionEngineMutation:false,canonicalExecutionMutation:false,automaticCanonicalWrites:false})});
}
