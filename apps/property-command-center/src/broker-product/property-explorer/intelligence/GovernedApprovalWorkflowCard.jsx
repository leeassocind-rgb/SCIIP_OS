import React,{useEffect,useMemo,useState}from'react';
import{
  getDecisionWorkflowState,
  decidePromotion
}from'./GovernedDecisionStore.js';
import{
  executeApprovedPromotion,
  getCanonicalOverlay
}from'./CanonicalPromotionExecutor.js';

function propertyIdentity(property){
  return {
    propertyId:
      property?.id||
      property?.propertyId||
      property?.canonicalPropertyId||
      null
  };
}

export default function GovernedApprovalWorkflowCard({property}){
  const identity=useMemo(()=>propertyIdentity(property),[property]);
  const[state,setState]=useState(()=>getDecisionWorkflowState({propertyId:identity.propertyId}));
  const[lastExecution,setLastExecution]=useState(null);

  useEffect(()=>{
    const refresh=(event)=>{
      const eventPropertyId=event?.detail?.propertyId??null;
      if(eventPropertyId&&identity.propertyId&&eventPropertyId!==identity.propertyId)return;
      setState(getDecisionWorkflowState({propertyId:identity.propertyId}));
    };

    refresh();
    window.addEventListener('sciip:governed-decision-persisted',refresh);
    window.addEventListener('sciip:governed-approval-updated',refresh);
    window.addEventListener('sciip:canonical-promotion-executed',refresh);
    window.addEventListener('storage',refresh);

    return()=>{
      window.removeEventListener('sciip:governed-decision-persisted',refresh);
      window.removeEventListener('sciip:governed-approval-updated',refresh);
      window.removeEventListener('sciip:canonical-promotion-executed',refresh);
      window.removeEventListener('storage',refresh);
    };
  },[identity.propertyId]);

  const review=(promotion,action)=>{
    decidePromotion(promotion.promotionId,action);
    if(typeof window!=='undefined'){
      window.dispatchEvent(new CustomEvent('sciip:governed-approval-updated',{
        detail:{promotionId:promotion.promotionId,action,propertyId:identity.propertyId}
      }));
    }
    setState(getDecisionWorkflowState({propertyId:identity.propertyId}));
  };

  const execute=(promotion)=>{
    const result=executeApprovedPromotion(promotion);
    setLastExecution(result);
    if(typeof window!=='undefined'){
      window.dispatchEvent(new CustomEvent('sciip:canonical-promotion-executed',{
        detail:{
          propertyId:identity.propertyId,
          fieldKey:promotion.fieldKey,
          promotionId:promotion.promotionId,
          event:result.event
        }
      }));
    }
    setState(getDecisionWorkflowState({propertyId:identity.propertyId}));
  };

  if(!state||state.status!=='ACTIVE')return null;

  return <details className="approval-workflow" open>
    <summary>
      <div><span>GOVERNED APPROVAL WORKFLOW</span><strong>Decision Persistence & Approval</strong></div>
      <em>{state.counts.pending} pending</em>
    </summary>

    <div className="approval-workflow__notice">
      Approval and execution are separate. Only an approved promotion can be executed into the governed SCIIP canonical overlay. Every execution is immutable, attributable, and reversible.
    </div>

    <div className="approval-workflow__summary">
      <span>{state.counts.events} events</span>
      <span>{state.counts.pending} pending</span>
      <span>{state.counts.approved} approved</span>
      <span>{state.counts.rejected} rejected</span>
      <span>{state.counts.deferred} deferred</span>
    </div>

    {state.promotions.length===0?
      <div className="approval-workflow__empty">No promotion proposals yet. Accept an Attribute Resolution candidate to create one.</div>:
      <div className="approval-workflow__rows">
        {state.promotions.map(item=>{
          const executed=getCanonicalOverlay(item.propertyId,item.fieldKey);
          return <div className="approval-workflow__row" key={item.promotionId}>
            <div><strong>{item.fieldKey}</strong><span>{executed?'EXECUTED':item.status.replaceAll('_',' ')}</span></div>
            <div><span>Current SCIIP</span><strong>{item.canonicalBefore==null?'—':String(item.canonicalBefore)}</strong></div>
            <div><span>Proposed</span><strong>{item.proposedValue==null?'—':String(item.proposedValue)}</strong></div>
            <div className="approval-workflow__actions">
              {executed?
                <span className="approval-workflow__executed">CANONICAL · {String(executed.value)}</span>:
                item.status==='PENDING_APPROVAL'?<>
                  <button type="button" onClick={()=>review(item,'APPROVE')}>Approve</button>
                  <button type="button" onClick={()=>review(item,'REJECT')}>Reject</button>
                  <button type="button" onClick={()=>review(item,'DEFER')}>Defer</button>
                </>:
                item.status==='APPROVED_FOR_EXECUTION'?
                  <button type="button" className="approval-workflow__execute" onClick={()=>execute(item)}>Execute</button>:
                  <span>{item.status.replaceAll('_',' ')}</span>
              }
            </div>
          </div>;
        })}
      </div>}

    {lastExecution&&<div className="approval-workflow__execution-audit">
      <strong>Canonical promotion executed</strong>
      <span>{lastExecution.event.fieldKey}: {String(lastExecution.event.canonicalBefore??'—')} → {String(lastExecution.event.canonicalAfter??'—')}</span>
      <small>{lastExecution.event.eventId}</small>
      <small>Execution mode: governed overlay · reversible</small>
    </div>}

    <div className="approval-workflow__footer">
      <span>Persistence: {state.persistence}</span>
      <span>Event log: append-only</span>
      <span>Canonical execution: governed</span>
    </div>
  </details>;
}
