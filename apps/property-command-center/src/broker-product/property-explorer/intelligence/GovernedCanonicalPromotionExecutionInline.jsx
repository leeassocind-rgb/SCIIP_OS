import React,{useMemo,useState}from'react';
import{
  activeCanonicalOverlays,
  executeApprovedPromotion,
  rollbackCanonicalPromotion
}from'./GovernedCanonicalPromotionExecution.js';

function latestByField(events=[]){
  const out={};
  for(const e of events||[]){
    if(e?.fieldKey)out[e.fieldKey]=e;
  }
  return out;
}

export default function GovernedCanonicalPromotionExecutionInline({
  property,
  gaps=[],
  evidenceEvents=[],
  promotionDecisions=[]
}){
  const[revision,setRevision]=useState(0);
  const[rollbackReasons,setRollbackReasons]=useState({});

  const overlays=useMemo(
    ()=>activeCanonicalOverlays(property),
    [property,revision]
  );

  const evidence=useMemo(()=>latestByField(evidenceEvents),[evidenceEvents]);
  const decisions=useMemo(()=>latestByField(promotionDecisions),[promotionDecisions]);

  const eligible=(gaps||[]).filter(g=>{
    const d=decisions[g.fieldKey];
    const ev=evidence[g.fieldKey];
    const approved=
      d?.status==='APPROVED'||
      d?.decision==='APPROVED'||
      d?.decision==='APPROVE'||
      d?.approved===true;
    const verified=
      ev?.status==='VERIFIED'||
      ev?.decision==='VERIFIED';
    return approved&&verified;
  });

  const tracked=(gaps||[]).filter(g=>
    overlays[g.fieldKey]||eligible.some(x=>x.fieldKey===g.fieldKey)
  );

  if(!tracked.length)return null;

  return <div className="intelligence-gaps__execution" data-milestone="M2.25">
    <div className="intelligence-gaps__acquisition-header">
      <div>
        <span>CANONICAL EXECUTION</span>
        <strong>Governed Promotion Execution</strong>
      </div>
      <em>{Object.keys(overlays).length} active</em>
    </div>

    <p>
      Only verified evidence with an approved promotion decision may execute.
      Execution creates a reversible governed canonical overlay; base records are never mutated.
    </p>

    {tracked.map(item=>{
      const overlay=overlays[item.fieldKey];
      const decision=decisions[item.fieldKey];
      const ev=evidence[item.fieldKey];
      const approved=
        decision?.status==='APPROVED'||
        decision?.decision==='APPROVED'||
        decision?.decision==='APPROVE'||
        decision?.approved===true;
      const verified=ev?.status==='VERIFIED'||ev?.decision==='VERIFIED';

      return <div className="intelligence-gaps__execution-row" key={item.fieldKey}>
        <div className="intelligence-gaps__evidence-meta">
          <strong>{item.label||item.fieldKey}</strong>
          <span>{overlay?'CANONICAL OVERLAY ACTIVE':(approved&&verified?'READY TO EXECUTE':'BLOCKED')}</span>
        </div>

        {overlay?
          <>
            <div className="intelligence-gaps__execution-values">
              <span>Prior</span><strong>{String(overlay.beforeValue??'—')}</strong>
              <span>Current</span><strong>{String(overlay.value)}</strong>
            </div>
            <input
              aria-label={`${item.fieldKey} rollback reason`}
              placeholder="Rollback reason"
              value={rollbackReasons[item.fieldKey]||''}
              onChange={e=>setRollbackReasons(r=>({...r,[item.fieldKey]:e.target.value}))}
            />
            <button type="button" className="secondary" onClick={()=>{
              rollbackCanonicalPromotion({
                property,
                executionId:overlay.executionId,
                reason:rollbackReasons[item.fieldKey]
              });
              setRevision(v=>v+1);
            }}>Rollback</button>
          </>
        :
          <button type="button" onClick={()=>{
            executeApprovedPromotion({
              property,
              fieldKey:item.fieldKey,
              approved:true,
              promotionDecisionId:decision?.id||decision?.decisionId,
              evidenceEventId:ev?.id||ev?.evidenceEventId,
              beforeValue:item.canonicalValue??item.currentCanonicalValue??null,
              promotedValue:ev?.value??ev?.observedValue,
              source:ev?.source||item.recommendedSource||'VERIFIED_EVIDENCE'
            });
            setRevision(v=>v+1);
          }}>Execute Promotion</button>
        }
      </div>
    })}

    <div className="intelligence-gaps__acquisition-footer">
      <span>Base mutation: FORBIDDEN</span>
      <span>Rollback: GOVERNED</span>
    </div>
  </div>;
}
