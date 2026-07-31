import React,{useMemo}from'react';
import{BookOpenCheck,ShieldCheck}from'lucide-react';
import{createCopilotEvidenceViewModel}from'../enterprise-intelligence/copilot-ui/index.js';

export default function CopilotEvidencePanel({copilot}){
 const view=useMemo(()=>createCopilotEvidenceViewModel({copilot}),[copilot]);
 return <section className="production-panel">
  <header><BookOpenCheck size={17}/><h2>Copilot evidence</h2></header>
  <div className="production-row"><span><strong>{view.grounded?'Grounded answer':'Insufficient evidence'}</strong><small>Confidence {(view.confidence*100).toFixed(0)}% · {view.evidenceCount} references</small></span><ShieldCheck size={17}/></div>
  {view.citations.map((citation,index)=><div className="production-row" key={`${citation.kind}-${citation.id}-${index}`}><span><strong>{citation.kind}</strong><small>{citation.label||citation.id}</small></span></div>)}
 </section>;
}
