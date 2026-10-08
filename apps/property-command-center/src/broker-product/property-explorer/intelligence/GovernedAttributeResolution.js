function freeze(value){return Object.freeze(value);}
function nowIso(){return new Date().toISOString();}

const ELIGIBLE_STATES=new Set(['ENRICHMENT_ONLY','REVIEW','CONFLICT']);

export function buildGovernedAttributeResolution(propertyProvenance){
  const fields=Array.isArray(propertyProvenance?.fields)?propertyProvenance.fields:[];
  const items=fields
    .filter(field=>ELIGIBLE_STATES.has(field.agreementState))
    .map(field=>freeze({
      id:`resolution:${field.key}`,
      fieldKey:field.key,
      label:field.label,
      group:field.group,
      agreementState:field.agreementState,
      conflictState:field.conflictState,
      confidence:field.confidence,
      canonicalValue:field.canonical?.value??null,
      externalValue:field.externalValue??null,
      normalizedCanonicalValue:field.canonical?.normalizedValue??null,
      normalizedExternalValue:field.normalizedExternalValue??null,
      canonicalAuthority:field.canonical?.authority||'SCIIP',
      evidenceSources:freeze((field.evidence||[]).map(item=>item.provider).filter(Boolean)),
      provenance:field.provenance,
      decisionStatus:'UNRESOLVED',
      eligibleForProposal:field.externalValue!==null&&field.externalValue!==undefined,
      automaticWriteAllowed:false
    }));

  return freeze({
    status:'ACTIVE',
    authority:'SCIIP',
    automaticWrites:false,
    approvalRequired:true,
    items:freeze(items),
    counts:freeze({
      total:items.length,
      enrichmentOnly:items.filter(x=>x.agreementState==='ENRICHMENT_ONLY').length,
      review:items.filter(x=>x.agreementState==='REVIEW').length,
      conflicts:items.filter(x=>x.agreementState==='CONFLICT').length
    }),
    policy:freeze({
      ACCEPT:'CREATE_PROMOTION_PROPOSAL',
      REJECT:'RETAIN_CANONICAL_AND_RECORD_REJECTION',
      DEFER:'RETAIN_UNRESOLVED_FOR_REVIEW',
      COMMIT:'SEPARATE_GOVERNED_APPROVAL_REQUIRED'
    })
  });
}

export function createAttributeResolutionDecision(item,action,{
  actor='CURRENT_USER',
  reason='',
  timestamp=nowIso()
}={}){
  if(!item)throw new Error('Resolution item required');
  if(!['ACCEPT','REJECT','DEFER'].includes(action))throw new Error(`Unsupported resolution action: ${action}`);

  if(action==='ACCEPT'&&!item.eligibleForProposal){
    throw new Error('Cannot accept attribute without external evidence');
  }

  const status=
    action==='ACCEPT'?'PROPOSED_PROMOTION':
    action==='REJECT'?'REJECTED_EXTERNAL_EVIDENCE':
    'DEFERRED_REVIEW';

  return freeze({
    id:`decision:${item.fieldKey}:${timestamp}`,
    fieldKey:item.fieldKey,
    label:item.label,
    action,
    status,
    actor,
    reason:String(reason||''),
    decidedAt:timestamp,
    canonicalBefore:item.canonicalValue,
    externalEvidence:item.externalValue,
    normalizedExternalValue:item.normalizedExternalValue,
    canonicalAuthority:'SCIIP',
    canonicalMutation:false,
    approvalRequired:action==='ACCEPT',
    nextStep:action==='ACCEPT'?'GOVERNED_APPROVAL':
      action==='REJECT'?'CLOSE_EVIDENCE':
      'REVIEW_QUEUE',
    audit:freeze({
      source:item.evidenceSources,
      confidence:item.confidence,
      agreementState:item.agreementState,
      mergePolicy:item.provenance?.mergePolicy||'ENRICH_NEVER_OVERWRITE'
    })
  });
}

export function applyResolutionDecision(resolutionModel,decision){
  if(!resolutionModel||resolutionModel.status!=='ACTIVE')return resolutionModel;
  if(!decision)return resolutionModel;
  const items=resolutionModel.items.map(item=>
    item.fieldKey===decision.fieldKey
      ?freeze({...item,decisionStatus:decision.status,lastDecision:decision})
      :item
  );
  return freeze({...resolutionModel,items:freeze(items)});
}

export function dispatchResolutionDecision(decision){
  if(typeof window==='undefined'||!window.dispatchEvent)return false;
  window.dispatchEvent(new CustomEvent('sciip:governed-attribute-resolution',{detail:decision}));
  return true;
}
