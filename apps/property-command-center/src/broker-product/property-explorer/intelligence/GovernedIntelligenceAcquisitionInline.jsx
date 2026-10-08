import React,{useMemo,useState}from'react';
import{acquisitionWorkflow,requestIntelligenceAcquisition}from'./GovernedIntelligenceAcquisition.js';
import{resolveGovernedPropertyIntelligenceActionContext}from'./GovernedPropertyIntelligenceActionContext.js';
import{publishGovernedPropertyIntelligenceActionEvent}from'./GovernedPropertyIntelligenceActionEvents.js';
export default function GovernedIntelligenceAcquisitionInline({property,gaps=[]}){
 const[rev,setRev]=useState(0);
 const actionContext=useMemo(
  ()=>resolveGovernedPropertyIntelligenceActionContext({property,gaps,source:'ACQUISITION_INLINE'}),
  [property,gaps]
 );
 const actionProperty=actionContext.property;
 const w=useMemo(()=>acquisitionWorkflow(actionProperty,gaps),[actionProperty,gaps,rev]);
 if(!w.items.length)return null;
 return <div className="intelligence-gaps__acquisition" data-milestone="M2.22c"><div className="intelligence-gaps__acquisition-header"><div><span>GOVERNED ACQUISITION</span><strong>Intelligence Acquisition Workflow</strong></div><em>{w.items.length} actionable</em></div><p>Convert verified intelligence gaps into governed acquisition requests. External evidence remains evidence-only until separately verified and promoted.</p>{w.items.map(x=><div className="intelligence-gaps__acquisition-row" key={x.fieldKey}><div><strong>{x.label||x.fieldKey}</strong><span>{x.type?.replaceAll('_',' ')||'GAP'}</span><small>{x.recommendedSource||x.source||'Verified external source'}</small></div>{x.acquisitionStatus==='NOT_REQUESTED'?<button type="button" onClick={()=>{(()=>{const result=requestIntelligenceAcquisition({property:actionProperty,gap:x});publishGovernedPropertyIntelligenceActionEvent({action:'REQUEST_ACQUISITION',property:actionProperty,gap:x,result,source:'ACQUISITION_INLINE'});return result;})();setRev(v=>v+1)}}>Request</button>:<em>{x.acquisitionStatus}</em>}</div>)}<div className="intelligence-gaps__acquisition-footer"><span>Canonical writes: OFF</span><span>Promotion required</span></div></div>;
}
