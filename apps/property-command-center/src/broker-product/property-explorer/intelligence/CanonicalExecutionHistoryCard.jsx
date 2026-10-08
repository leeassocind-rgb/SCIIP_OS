import React,{useEffect,useMemo,useState}from'react';
import{
  buildCanonicalExecutionHistory,
  rollbackExecution
}from'./CanonicalExecutionHistory.js';

function propertyIdOf(property){
  return property?.id||property?.propertyId||property?.canonicalPropertyId||null;
}

function fmt(value){
  if(value===null||value===undefined||value==='')return'—';
  return typeof value==='number'?value.toLocaleString('en-US'):String(value);
}

function fmtTime(value){
  if(!value)return'—';
  try{return new Date(value).toLocaleString()}catch{return String(value)}
}

export default function CanonicalExecutionHistoryCard({property}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>buildCanonicalExecutionHistory(propertyId));
  const[pendingRollback,setPendingRollback]=useState(null);
  const[reason,setReason]=useState('');
  const[lastRollback,setLastRollback]=useState(null);
  const[error,setError]=useState('');

  useEffect(()=>{
    const refresh=(event)=>{
      const eventPropertyId=event?.detail?.propertyId??null;
      if(eventPropertyId&&propertyId&&eventPropertyId!==propertyId)return;
      setState(buildCanonicalExecutionHistory(propertyId));
    };

    refresh();
    window.addEventListener('sciip:canonical-promotion-executed',refresh);
    window.addEventListener('sciip:canonical-promotion-rolled-back',refresh);
    window.addEventListener('storage',refresh);

    return()=>{
      window.removeEventListener('sciip:canonical-promotion-executed',refresh);
      window.removeEventListener('sciip:canonical-promotion-rolled-back',refresh);
      window.removeEventListener('storage',refresh);
    };
  },[propertyId]);

  const requestRollback=(overlay)=>{
    setPendingRollback(overlay);
    setReason('');
    setError('');
  };

  const cancelRollback=()=>{
    setPendingRollback(null);
    setReason('');
    setError('');
  };

  const confirmRollback=()=>{
    try{
      const result=rollbackExecution(propertyId,pendingRollback.fieldKey,{
        reason,
        confirmed:true
      });
      setLastRollback(result.event);
      setState(result.history);
      setPendingRollback(null);
      setReason('');
      setError('');

      window.dispatchEvent(new CustomEvent('sciip:canonical-promotion-rolled-back',{
        detail:{
          propertyId,
          fieldKey:result.event.fieldKey,
          restoredCanonicalValue:result.restoredCanonicalValue,
          event:result.event
        }
      }));

      window.dispatchEvent(new CustomEvent('sciip:property-intelligence-refresh',{
        detail:{
          propertyId,
          cause:'CANONICAL_ROLLBACK',
          fieldKey:result.event.fieldKey
        }
      }));
    }catch(err){
      setError(String(err?.message||err));
    }
  };

  if(!state||state.status!=='ACTIVE')return null;

  return <details className="execution-history" open>
    <summary>
      <div><span>CANONICAL GOVERNANCE</span><strong>Execution History & Rollback</strong></div>
      <em>{state.counts.activeOverlays} active</em>
    </summary>

    <div className="execution-history__notice">
      Rollback is a governed canonical action. A reason and explicit confirmation are required. Prior execution history is never deleted.
    </div>

    <div className="execution-history__summary">
      <span>{state.counts.executions} executions</span>
      <span>{state.counts.rollbacks} rollbacks</span>
      <span>{state.counts.activeOverlays} active overlays</span>
    </div>

    {state.activeOverlays.length>0&&<div className="execution-history__active">
      {state.activeOverlays.map(overlay=><div className="execution-history__overlay" key={overlay.overlayId}>
        <div><strong>{overlay.fieldKey}</strong><span>ACTIVE CANONICAL OVERLAY</span></div>
        <div><span>Prior</span><strong>{fmt(overlay.priorCanonicalValue)}</strong></div>
        <div><span>Current</span><strong>{fmt(overlay.value)}</strong></div>
        <button type="button" onClick={()=>requestRollback(overlay)}>Rollback</button>
      </div>)}
    </div>}

    {pendingRollback&&<div className="execution-history__confirm">
      <div>
        <strong>Confirm governed rollback</strong>
        <span>{pendingRollback.fieldKey}: {fmt(pendingRollback.value)} → {fmt(pendingRollback.priorCanonicalValue)}</span>
      </div>
      <label>
        <span>Reason required</span>
        <input
          value={reason}
          onChange={e=>setReason(e.target.value)}
          placeholder="Why is this rollback required?"
        />
      </label>
      {error&&<small className="execution-history__error">{error}</small>}
      <div className="execution-history__confirm-actions">
        <button type="button" onClick={cancelRollback}>Cancel</button>
        <button type="button" onClick={confirmRollback} disabled={!reason.trim()}>Confirm rollback</button>
      </div>
    </div>}

    {state.events.length===0?
      <div className="execution-history__empty">No canonical execution events yet.</div>:
      <div className="execution-history__events">
        {state.events.map(event=><div className="execution-history__event" key={event.eventId}>
          <div className="execution-history__event-title">
            <strong>{event.fieldKey}</strong>
            <em>{event.rolledBack?'ROLLBACK':'EXECUTION'}</em>
          </div>
          <div className="execution-history__event-values">
            <span>{fmt(event.canonicalBefore)} → {fmt(event.canonicalAfter)}</span>
          </div>
          <div className="execution-history__event-meta">
            <span>{event.actor}</span>
            <span>{fmtTime(event.occurredAt)}</span>
          </div>
          {event.reason&&<div className="execution-history__event-reason">{event.reason}</div>}
          <small>{event.eventId}</small>
        </div>)}
      </div>}

    {lastRollback&&<div className="execution-history__rollback-audit">
      <strong>Rollback recorded</strong>
      <span>{lastRollback.fieldKey}: {fmt(lastRollback.canonicalBefore)} → {fmt(lastRollback.canonicalAfter)}</span>
      <small>{lastRollback.reason}</small>
      <small>{lastRollback.eventId}</small>
    </div>}

    <div className="execution-history__footer">
      <span>Authority: SCIIP</span>
      <span>History: append-only</span>
      <span>Rollback: confirmed + reasoned</span>
    </div>
  </details>;
}
