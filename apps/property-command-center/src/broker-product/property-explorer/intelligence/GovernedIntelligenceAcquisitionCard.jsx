import React,{useMemo,useState}from'react';
import{acquisitionWorkflow,requestIntelligenceAcquisition}from'./GovernedIntelligenceAcquisition.js';
import{resolveGovernedPropertyIntelligenceActionContext}from'./GovernedPropertyIntelligenceActionContext.js';
import{publishGovernedPropertyIntelligenceActionEvent}from'./GovernedPropertyIntelligenceActionEvents.js';
export default function GovernedIntelligenceAcquisitionCard({property,gaps=[]}){
 const[rev,setRev]=useState(0);
 const actionContext=useMemo(
  ()=>resolveGovernedPropertyIntelligenceActionContext({property,gaps,source:'ACQUISITION_CARD'}),
  [property,gaps]
 );
 const actionProperty=actionContext.property;
 const w=useMemo(()=>acquisitionWorkflow(actionProperty,gaps),[actionProperty,gaps,rev]);
 if(!w.items.length)return null;
 return <section className="sciip-governed-card sciip-acquisition-card"><div className="sciip-card-eyebrow">GOVERNED ACQUISITION</div><div className="sciip-card-title-row"><strong>Intelligence Acquisition Workflow</strong><span>{w.items.length} actionable</span></div><p>Genuine intelligence gaps can become governed acquisition requests. External evidence remains evidence-only until separately verified and promoted.</p>{w.items.map(x=><div className="sciip-acquisition-row" key={x.fieldKey}><div><strong>{x.label||x.fieldLabel||x.fieldKey}</strong><small>{x.type||x.gapType} · Priority {x.priority??'—'}</small></div>{x.acquisitionStatus==='NOT_REQUESTED'?<button type="button" onClick={()=>{(()=>{const result=requestIntelligenceAcquisition({property:actionProperty,gap:x});publishGovernedPropertyIntelligenceActionEvent({action:'REQUEST_ACQUISITION',property:actionProperty,gap:x,result,source:'ACQUISITION_CARD'});return result;})();setRev(v=>v+1)}}>Request</button>:<span>{x.acquisitionStatus}</span>}</div>)}<footer><span>Canonical writes: OFF</span><span>Promotion required</span></footer></section>
}