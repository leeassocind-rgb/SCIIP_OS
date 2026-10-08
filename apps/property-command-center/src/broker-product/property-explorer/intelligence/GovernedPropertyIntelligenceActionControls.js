// SCIIP Explorer 3.0 — M2.52
// Governed Property Intelligence Action Controls & Transition Enforcement
const freeze=x=>Object.freeze(x);
const ALL=freeze(['REQUEST_ACQUISITION','OPEN_EVIDENCE_REVIEW','ATTACH_EVIDENCE','VERIFY_EVIDENCE','DECIDE_PROMOTION']);
const NEXT=freeze({
 READY:['REQUEST_ACQUISITION'],
 REQUESTED:['OPEN_EVIDENCE_REVIEW'],
 IN_REVIEW:['ATTACH_EVIDENCE','VERIFY_EVIDENCE'],
 EVIDENCE_ATTACHED:['VERIFY_EVIDENCE'],
 VERIFIED:['DECIDE_PROMOTION'],
 REJECTED:['OPEN_EVIDENCE_REVIEW'],
 DECIDED:[],
 PROMOTION_APPROVED:[],
 ON_HOLD:['OPEN_EVIDENCE_REVIEW'],
 UPDATED:ALL
});
export function resolveGovernedPropertyIntelligenceActionControls(actionState={}){
 const state=actionState?.state||'READY';
 const allowed=freeze([...(NEXT[state]||[])]);
 return freeze({milestone:'M2.52',propertyId:actionState?.propertyId||null,revision:Number(actionState?.revision||0),state,allowedActions:allowed,blockedActions:freeze(ALL.filter(x=>!allowed.includes(x))),invariants:freeze({stateAware:true,propertyScoped:true,revisionAware:true,uiBoundaryOnly:true,engineAuthoritative:true,actionEngineMutation:false,canonicalExecutionMutation:false,automaticCanonicalWrites:false})});
}
export function isGovernedPropertyIntelligenceActionAllowed(controls,action){return !!action&&!!controls?.allowedActions?.includes(action);}
export function inferGovernedPropertyIntelligenceActionFromControl(control){
 const explicit=control?.dataset?.governedAction;if(explicit)return explicit;
 const text=String(control?.textContent||'').trim().toLowerCase();
 if(text==='request'||text.includes('request acquisition'))return 'REQUEST_ACQUISITION';
 if(text.includes('review evidence'))return 'OPEN_EVIDENCE_REVIEW';
 if(text.includes('attach evidence'))return 'ATTACH_EVIDENCE';
 if(text.includes('verify evidence')||text==='verify'||text==='reject')return 'VERIFY_EVIDENCE';
 if(text.includes('promote')||text.includes('hold'))return 'DECIDE_PROMOTION';
 return null;
}
