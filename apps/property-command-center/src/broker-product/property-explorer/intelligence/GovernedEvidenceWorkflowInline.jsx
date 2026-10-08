import React,{useMemo,useState}from'react';
import{resolveGovernedPropertyIntelligenceActionContext}from'./GovernedPropertyIntelligenceActionContext.js';
import{publishGovernedPropertyIntelligenceActionEvent}from'./GovernedPropertyIntelligenceActionEvents.js';
import{evidenceEvents,evidenceWorkflow,openEvidenceReview,attachEvidence,verifyEvidence}from'./GovernedEvidenceWorkflow.js';
import{promotionEvents,latestPromotionState,decidePromotion}from'./GovernedPromotionDecision.js';
import'./GovernedEvidenceWorkflowInline.css';
import GovernedCanonicalPromotionExecutionInline from'./GovernedCanonicalPromotionExecutionInline.jsx';
const statusLabel=s=>String(s||'NOT_STARTED').replaceAll('_',' ');
const canonicalValue=(property,key)=>property?.[key]??property?.canonical?.[key]??property?.attributes?.[key]??'—';
export default function GovernedEvidenceWorkflowInline({property,gaps=[]}){
 const[revision,setRevision]=useState(0),[drafts,setDrafts]=useState({});
 const actionContext=useMemo(
  ()=>resolveGovernedPropertyIntelligenceActionContext({property,gaps,source:'EVIDENCE_WORKFLOW'}),
  [property,gaps]
 );
 const actionProperty=actionContext.property;
 const workflow=useMemo(()=>evidenceWorkflow(actionProperty,gaps),[actionProperty,gaps,revision]);
 if(!workflow.items.length)return null;
 const patch=(k,p)=>setDrafts(d=>({...d,[k]:{...(d[k]||{}),...p}}));
 return <section className="governed-evidence" data-milestone="M2.24" aria-label="Evidence Review and Governed Promotion Decision">
  <header className="governed-evidence__header"><div className="governed-evidence__heading"><span>GOVERNED EVIDENCE</span><strong>Evidence Review &amp; Promotion Decision</strong></div><em>{workflow.items.length} tracked</em></header>
  <p className="governed-evidence__intro">Review evidence against the current canonical value. Verification and promotion remain separate governed decisions.</p>
  <div className="governed-evidence__rows">{workflow.items.map(item=>{const d=drafts[item.fieldKey]||{},s=item.evidenceStatus||'NOT_STARTED',e=item.evidence,p=latestPromotionState(actionProperty,item.fieldKey);return <div className="governed-evidence__row governed-evidence__row--review" key={item.fieldKey}>
   <div className="governed-evidence__identity"><strong>{item.label||item.fieldKey}</strong><span>{item.recommendedSource||item.source||'Governed source'}</span></div>
   <span className={`governed-evidence__status governed-evidence__status--${s.toLowerCase()}`}>{statusLabel(s)}</span>
   {['EVIDENCE_ATTACHED','VERIFIED','REJECTED'].includes(s)&&<div className="governed-evidence__comparison"><div><span>CANONICAL</span><strong>{String(canonicalValue(actionProperty,item.fieldKey))}</strong></div><div><span>EVIDENCE</span><strong>{String(e?.value??'—')}</strong><small>{e?.source||'—'}</small></div></div>}
   <div className="governed-evidence__controls">
    {s==='NOT_STARTED'&&<button type="button" className="governed-evidence__button" onClick={()=>{(()=>{const result=openEvidenceReview({property:actionProperty,gap:item});publishGovernedPropertyIntelligenceActionEvent({action:'OPEN_EVIDENCE_REVIEW',property:actionProperty,gap:item,result,source:'EVIDENCE_WORKFLOW'});return result;})();setRevision(v=>v+1)}}>Review Evidence</button>}
    {s==='REQUESTED'&&<div className="governed-evidence__intake"><input placeholder="Observed value" value={d.value||''} onChange={x=>patch(item.fieldKey,{value:x.target.value})}/><input placeholder="Verified source" value={d.source||''} onChange={x=>patch(item.fieldKey,{source:x.target.value})}/><button type="button" className="governed-evidence__button" onClick={()=>{(()=>{const result=attachEvidence({property:actionProperty,fieldKey:item.fieldKey,value:d.value,source:d.source,reference:'M2_24_REVIEW'});publishGovernedPropertyIntelligenceActionEvent({action:'ATTACH_EVIDENCE',property:actionProperty,fieldKey:item.fieldKey,result,source:'EVIDENCE_WORKFLOW'});return result;})();setRevision(v=>v+1)}}>Attach</button></div>}
    {s==='EVIDENCE_ATTACHED'&&<div className="governed-evidence__actions"><button type="button" className="governed-evidence__button" onClick={()=>{(()=>{const result=verifyEvidence({property:actionProperty,fieldKey:item.fieldKey,decision:'VERIFIED',rationale:d.rationale||''});publishGovernedPropertyIntelligenceActionEvent({action:'VERIFY_EVIDENCE',property:actionProperty,fieldKey:item.fieldKey,decision:'VERIFIED',result,source:'EVIDENCE_WORKFLOW'});return result;})();setRevision(v=>v+1)}}>Verify</button><button type="button" className="governed-evidence__button governed-evidence__button--secondary" onClick={()=>{(()=>{const result=verifyEvidence({property:actionProperty,fieldKey:item.fieldKey,decision:'REJECTED',rationale:d.rationale||''});publishGovernedPropertyIntelligenceActionEvent({action:'VERIFY_EVIDENCE',property:actionProperty,fieldKey:item.fieldKey,decision:'REJECTED',result,source:'EVIDENCE_WORKFLOW'});return result;})();setRevision(v=>v+1)}}>Reject</button></div>}
    {s==='VERIFIED'&&!p&&<div className="governed-evidence__promotion"><span>VERIFIED — PROMOTION ELIGIBLE</span><div className="governed-evidence__actions"><button type="button" className="governed-evidence__button" onClick={()=>{(()=>{const result=decidePromotion({property:actionProperty,fieldKey:item.fieldKey,evidence:e,decision:'PROMOTE',rationale:d.rationale||''});publishGovernedPropertyIntelligenceActionEvent({action:'DECIDE_PROMOTION',property:actionProperty,fieldKey:item.fieldKey,decision:'PROMOTE',result,source:'EVIDENCE_WORKFLOW'});return result;})();setRevision(v=>v+1)}}>Approve Promotion</button><button type="button" className="governed-evidence__button governed-evidence__button--secondary" onClick={()=>{(()=>{const result=decidePromotion({property:actionProperty,fieldKey:item.fieldKey,evidence:e,decision:'HOLD',rationale:d.rationale||''});publishGovernedPropertyIntelligenceActionEvent({action:'DECIDE_PROMOTION',property:actionProperty,fieldKey:item.fieldKey,decision:'HOLD',result,source:'EVIDENCE_WORKFLOW'});return result;})();setRevision(v=>v+1)}}>Hold</button></div></div>}
    {s==='VERIFIED'&&p&&<span className="governed-evidence__complete">Promotion decision: {p.status.replaceAll('_',' ')}</span>}
    {s==='REJECTED'&&<span className="governed-evidence__complete">Evidence rejected — canonical unchanged</span>}
   </div></div>})}    <GovernedCanonicalPromotionExecutionInline
      property={property}
      gaps={gaps}
      evidenceEvents={evidenceEvents(property)}
      promotionDecisions={promotionEvents(property)}
    />
  </div>
  <footer className="governed-evidence__footer"><span>Canonical writes: OFF</span><span>Approval ≠ execution</span><span>Automatic promotion: OFF</span></footer>
 </section>;
}
