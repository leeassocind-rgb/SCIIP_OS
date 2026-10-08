import{buildDecisionLifecycleRegistry}from'./DecisionLifecycle.js';
import{reconcilePropertyPresentation}from'./CanonicalStateReconciler.js';
import{getDecisionWorkflowState}from'./GovernedDecisionStore.js';
import{buildCanonicalExecutionHistory}from'./CanonicalExecutionHistory.js';
import{resolveCanonicalPropertyFields}from'./CanonicalPropertyFieldResolver.js';

function freeze(value){return Object.freeze(value);}
function pct(n,d){return d?Math.round((n/d)*100):0;}

export function buildGovernedPropertyState(property,model){
  const propertyId=
    property?.id||
    property?.propertyId||
    property?.canonicalPropertyId||
    model?.propertyId||
    model?.id||
    null;

  const provenance=model?.propertyProvenance||null;
  const reconciled=reconcilePropertyPresentation(propertyId,provenance);
  const fieldKeys=(provenance?.fields||[]).map(x=>x.key);
  const lifecycle=buildDecisionLifecycleRegistry(propertyId,fieldKeys);
  const workflow=getDecisionWorkflowState({propertyId});
  const history=buildCanonicalExecutionHistory(propertyId);

  const fields=resolveCanonicalPropertyFields(property,model,reconciled.fields||[]);
  const totalFields=fields.length;
  const canonicalPresent=fields.filter(x=>x.effectiveCanonicalValue!==null&&x.effectiveCanonicalValue!==undefined&&x.effectiveCanonicalValue!=='').length;
  const externallySupported=fields.filter(x=>x.externalValue!==null&&x.externalValue!==undefined&&x.externalValue!=='').length;
  const agreed=fields.filter(x=>x.effectiveAgreementState==='AGREED').length;
  const enrichmentOnly=fields.filter(x=>x.effectiveAgreementState==='ENRICHMENT_ONLY').length;
  const review=fields.filter(x=>x.effectiveAgreementState==='REVIEW').length;
  const canonicalOnly=fields.filter(x=>x.effectiveAgreementState==='CANONICAL_ONLY').length;

  const pendingGovernance=
    workflow.counts.pending+
    lifecycle.counts.approved+
    lifecycle.counts.proposed;

  const activeOverlays=history.counts.activeOverlays;
  const rolledBack=lifecycle.counts.rolledBack;
  const unresolvedGovernance=enrichmentOnly+review+pendingGovernance;

  const completenessPct=pct(canonicalPresent,totalFields);
  const corroborationPct=pct(agreed,totalFields);
  const externalCoveragePct=pct(externallySupported,totalFields);

  let confidenceScore=100;
  confidenceScore-=Math.max(0,100-completenessPct)*0.35;
  confidenceScore-=Math.max(0,100-corroborationPct)*0.25;
  confidenceScore-=review*12;
  confidenceScore-=enrichmentOnly*6;
  confidenceScore-=pendingGovernance*5;
  confidenceScore=Math.max(0,Math.min(100,Math.round(confidenceScore)));

  let confidence='LOW';
  if(confidenceScore>=85&&review===0)confidence='HIGH';
  else if(confidenceScore>=65)confidence='MEDIUM';

  let state='GOVERNED';
  if(review>0)state='REVIEW_REQUIRED';
  else if(pendingGovernance>0)state='GOVERNANCE_PENDING';
  else if(enrichmentOnly>0)state='ENRICHMENT_AVAILABLE';
  else if(activeOverlays>0)state='GOVERNED_CANONICAL';
  else if(canonicalPresent===totalFields&&totalFields>0)state='CANONICAL_COMPLETE';

  return freeze({
    status:'ACTIVE',
    propertyId,
    canonicalAuthority:'SCIIP',
    state,
    confidence,
    confidenceScore,
    metrics:freeze({
      totalFields,
      canonicalPresent,
      externallySupported,
      agreed,
      enrichmentOnly,
      review,
      canonicalOnly,
      completenessPct,
      corroborationPct,
      externalCoveragePct,
      pendingGovernance,
      activeOverlays,
      rolledBack,
      unresolvedGovernance
    }),
    lifecycle,
    workflow,
    history,
    reconciled
  });
}
