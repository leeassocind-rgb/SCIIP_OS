import { registerExecutiveSignalType } from '../../executive-signals/executiveSignalRegistry.js';
export const EXECUTIVE_AI_SIGNAL_TYPES=Object.freeze({
  ADVISORY_READY:'EXECUTIVE_AI_ADVISORY_READY',
  APPROVAL_REQUIRED:'EXECUTIVE_AI_APPROVAL_REQUIRED',
  EVIDENCE_REVIEW_REQUIRED:'EXECUTIVE_AI_EVIDENCE_REVIEW_REQUIRED'
});
export function registerExecutiveAISignalTypes(){return Object.freeze([
  {type:EXECUTIVE_AI_SIGNAL_TYPES.ADVISORY_READY,source:'executive-ai',description:'Evidence-grounded executive AI advisory ready.',defaultSeverity:'MEDIUM',schemaVersion:'1.0.0',assignmentScoped:true,propertyScoped:true,consequential:false},
  {type:EXECUTIVE_AI_SIGNAL_TYPES.APPROVAL_REQUIRED,source:'executive-ai',description:'Executive AI plan requires broker approval.',defaultSeverity:'HIGH',schemaVersion:'1.0.0',assignmentScoped:true,propertyScoped:true,consequential:false},
  {type:EXECUTIVE_AI_SIGNAL_TYPES.EVIDENCE_REVIEW_REQUIRED,source:'executive-ai',description:'Executive AI evidence grounding is insufficient.',defaultSeverity:'HIGH',schemaVersion:'1.0.0',assignmentScoped:true,propertyScoped:true,consequential:false}
].map(registerExecutiveSignalType))}
