import{getCanonicalOverlay}from'./CanonicalPromotionExecutor.js';
import{listCanonicalExecutionEvents}from'./CanonicalPromotionExecutor.js';

function freeze(value){return Object.freeze(value);}
function text(v){return String(v??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function number(v){const n=Number(v);return Number.isFinite(n)?n:null;}

function latestRollback(propertyId,fieldKey){
  return listCanonicalExecutionEvents({propertyId})
    .filter(x=>x.fieldKey===fieldKey&&x.eventType==='CANONICAL_ATTRIBUTE_PROMOTION_ROLLED_BACK')
    .sort((a,b)=>String(b.occurredAt||'').localeCompare(String(a.occurredAt||'')))[0]||null;
}

function latestExecution(propertyId,fieldKey){
  return listCanonicalExecutionEvents({propertyId})
    .filter(x=>x.fieldKey===fieldKey&&x.eventType==='CANONICAL_ATTRIBUTE_PROMOTION_EXECUTED')
    .sort((a,b)=>String(b.occurredAt||'').localeCompare(String(a.occurredAt||'')))[0]||null;
}

function effectiveCanonical(propertyId,field){
  const overlay=getCanonicalOverlay(propertyId,field.key);
  if(overlay)return freeze({value:overlay.value,source:'GOVERNED_OVERLAY',restored:false});

  const rb=latestRollback(propertyId,field.key);
  const ex=latestExecution(propertyId,field.key);
  if(rb&&(!ex||String(rb.occurredAt)>=String(ex.occurredAt))){
    return freeze({value:rb.canonicalAfter??null,source:'ROLLBACK_RESTORED',restored:true});
  }
  return freeze({value:field?.canonical?.value??null,source:'MODEL_CANONICAL',restored:false});
}

function equivalent(field,a,b){
  if(a==null&&b==null)return false;
  if(a==null||b==null)return false;
  if(['landAcres','buildingSf','assessedTotal','clearHeight','powerAmps'].includes(field.key)){
    const A=number(a),B=number(b);
    if(A==null||B==null)return false;
    if(A===0)return A===B;
    return Math.abs(B-A)/Math.abs(A)*100<=3;
  }
  if(field.key==='parcelId'){
    return String(a).replace(/\D/g,'')===String(b).replace(/\D/g,'');
  }
  if(['propertyType','landUse'].includes(field.key)){
    const A=text(a),B=text(b);
    if(A===B||A.includes(B)||B.includes(A))return true;
    const industrial=['industrial','warehouse','distribution','logistics','manufacturing'];
    return industrial.some(t=>A.includes(t))&&industrial.some(t=>B.includes(t));
  }
  return text(a)===text(b);
}

export function reconcileFieldPresentation(propertyId,field){
  const canonical=effectiveCanonical(propertyId,field);
  const external=field?.externalValue??null;

  let agreementState;
  if(canonical.value==null&&external==null)agreementState='NO_DATA';
  else if(canonical.value!=null&&external==null)agreementState='CANONICAL_ONLY';
  else if(canonical.value==null&&external!=null)agreementState='ENRICHMENT_ONLY';
  else agreementState=equivalent(field,canonical.value,external)?'AGREED':'REVIEW';

  return freeze({
    ...field,
    effectiveCanonicalValue:canonical.value,
    canonicalSource:canonical.source,
    restoredByRollback:canonical.restored,
    effectiveAgreementState:agreementState,
    effectiveConflictState:agreementState==='AGREED'?'ALIGNED':
      agreementState==='REVIEW'?'REVIEW':'NONE'
  });
}

export function reconcilePropertyPresentation(propertyId,provenance){
  const fields=(provenance?.fields||[]).map(field=>reconcileFieldPresentation(propertyId,field));
  return freeze({
    status:'ACTIVE',
    propertyId,
    fields:freeze(fields),
    counts:freeze({
      agreed:fields.filter(x=>x.effectiveAgreementState==='AGREED').length,
      enrichmentOnly:fields.filter(x=>x.effectiveAgreementState==='ENRICHMENT_ONLY').length,
      review:fields.filter(x=>x.effectiveAgreementState==='REVIEW').length,
      canonicalOnly:fields.filter(x=>x.effectiveAgreementState==='CANONICAL_ONLY').length
    })
  });
}
