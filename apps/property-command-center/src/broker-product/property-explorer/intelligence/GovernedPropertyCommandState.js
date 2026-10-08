// SCIIP Explorer 3.0 — M2.26
// Governed Property State Command Layer
// Read-only property-level reconstruction over existing append-only governance stores.
import{evidenceEvents}from'./GovernedEvidenceWorkflow.js';
import{promotionEvents}from'./GovernedPromotionDecision.js';
import{buildCanonicalExecutionHistory}from'./CanonicalExecutionHistory.js';
import{buildDecisionLifecycleRegistry}from'./DecisionLifecycle.js';

const freeze=x=>Object.freeze(x);
const propertyIdOf=p=>p?.id||p?.propertyId||p?.canonicalPropertyId||p?.parcelId||p?.apn||p?.address||null;
const timeOf=x=>x?.occurredAt||x?.createdAt||x?.timestamp||null;
const newest=(items=[])=>items.filter(Boolean).sort((a,b)=>String(timeOf(b)||'').localeCompare(String(timeOf(a)||'')))[0]||null;

export function buildGovernedPropertyCommandState(property,model){
  const propertyId=propertyIdOf(property);
  const fieldKeys=[...new Set((model?.propertyProvenance?.fields||[]).map(x=>x?.key).filter(Boolean))];
  const evidence=evidenceEvents(property)||[];
  const promotions=promotionEvents(property)||[];
  const execution=buildCanonicalExecutionHistory(propertyId);
  const lifecycle=buildDecisionLifecycleRegistry(propertyId,fieldKeys);
  const lifecycleFields=lifecycle?.fields||[];
  const activeCanonicalOverlays=execution?.activeOverlays||[];
  const executionEvents=execution?.events||[];

  const promotionEligible=evidence.filter(e=>
    e?.status==='VERIFIED'&&!promotions.some(p=>p?.fieldKey===e?.fieldKey)
  );

  const approvedForExecution=promotions.filter(p=>
    p?.status==='APPROVED_FOR_PROMOTION' &&
    !activeCanonicalOverlays.some(o=>o?.fieldKey===p?.fieldKey) &&
    !lifecycleFields.some(x=>x?.fieldKey===p?.fieldKey&&['EXECUTED','CLOSED'].includes(x?.state))
  );

  const held=promotions.filter(p=>p?.status==='HELD');
  const unresolvedGovernance=lifecycleFields.filter(x=>
    !['UNRESOLVED','EXECUTED','CLOSED','ROLLED_BACK'].includes(x?.state)
  );

  const pendingActions=[
    ...promotionEligible.map(x=>freeze({type:'PROMOTION_DECISION',fieldKey:x.fieldKey,label:'Promotion decision required'})),
    ...approvedForExecution.map(x=>freeze({type:'EXECUTION',fieldKey:x.fieldKey,label:'Approved promotion awaiting execution'})),
    ...unresolvedGovernance.map(x=>freeze({type:'GOVERNANCE',fieldKey:x.fieldKey,label:String(x.state||'ACTION_REQUIRED').replaceAll('_',' ')}))
  ];

  const rolledBackChanges=executionEvents.filter(x=>x?.rolledBack===true);
  const executedChanges=executionEvents.filter(x=>x?.rolledBack!==true);
  const lastGovernedChange=newest([...executionEvents,...promotions,...evidence]);

  const canonicalState=activeCanonicalOverlays.length
    ?'OVERLAY_ACTIVE'
    :rolledBackChanges.length
      ?'RECONCILED'
      :'CANONICAL';

  return freeze({
    status:'ACTIVE',
    milestone:'M2.26',
    propertyId,
    canonicalState,
    activeCanonicalOverlays:freeze([...activeCanonicalOverlays]),
    pendingActions:freeze(pendingActions),
    promotionEligible:freeze(promotionEligible),
    approvedForExecution:freeze(approvedForExecution),
    held:freeze(held),
    executedChanges:freeze(executedChanges),
    rolledBackChanges:freeze(rolledBackChanges),
    unresolvedGovernance:freeze(unresolvedGovernance),
    lifecycleSummary:freeze({
      evidence:evidence.length,
      promotionDecisions:promotions.length,
      activeOverlays:activeCanonicalOverlays.length,
      pendingActions:pendingActions.length,
      executions:execution?.counts?.executions||executedChanges.length,
      rollbacks:execution?.counts?.rollbacks||rolledBackChanges.length
    }),
    lastGovernedChange,
    invariants:freeze({
      automaticCanonicalWrites:false,
      appendOnlyHistory:true,
      refreshReconstructed:true,
      propertyScoped:true
    })
  });
}
