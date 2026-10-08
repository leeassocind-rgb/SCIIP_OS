import React,{useEffect,useMemo,useState}from'react';
import{buildIntelligenceQualityModel}from'./IntelligenceQualityModel.js';

function propertyIdOf(property){
  return property?.id||property?.propertyId||property?.canonicalPropertyId||null;
}

function Dimension({title,score,label,detail}){
  return <div className="intelligence-quality__dimension">
    <div><span>{title}</span><strong>{score}/100</strong></div>
    <em>{label}</em>
    <small>{detail}</small>
  </div>;
}

export default function IntelligenceQualityCard({property,model}){
  const propertyId=useMemo(()=>propertyIdOf(property),[property]);
  const[state,setState]=useState(()=>buildIntelligenceQualityModel(property,model));

  useEffect(()=>{
    const refresh=(event)=>{
      const eventPropertyId=event?.detail?.propertyId??null;
      if(eventPropertyId&&propertyId&&eventPropertyId!==propertyId)return;
      setState(buildIntelligenceQualityModel(property,model));
    };

    refresh();
    const events=[
      'sciip:governed-decision-persisted',
      'sciip:governed-approval-updated',
      'sciip:canonical-promotion-executed',
      'sciip:canonical-promotion-rolled-back',
      'sciip:property-intelligence-refresh'
    ];
    for(const name of events)window.addEventListener(name,refresh);
    window.addEventListener('storage',refresh);

    return()=>{
      for(const name of events)window.removeEventListener(name,refresh);
      window.removeEventListener('storage',refresh);
    };
  },[propertyId,property,model]);

  if(!state||state.status!=='ACTIVE')return null;

  return <details className="intelligence-quality" open>
    <summary>
      <div><span>PROPERTY INTELLIGENCE</span><strong>Intelligence Quality</strong></div>
      <em>{state.overall.quality}</em>
    </summary>

    <div className="intelligence-quality__hero">
      <div>
        <span>PROPERTY INTELLIGENCE QUALITY</span>
        <strong>{state.overall.score}/100</strong>
        <em>{state.overall.quality}</em>
      </div>
      <p>Quality separates how much SCIIP knows from how reliable the known information is and how cleanly it is governed.</p>
    </div>

    <div className="intelligence-quality__dimensions">
      <Dimension
        title="Coverage"
        score={state.coverage.score}
        label={state.coverage.label}
        detail={`${state.coverage.knownFields} of ${state.coverage.totalFields} governed fields known`}
      />
      <Dimension
        title="Confidence"
        score={state.confidence.score}
        label={state.confidence.label}
        detail={`${state.confidence.assessedFields} known fields assessed; missing fields excluded`}
      />
      <Dimension
        title="Governance Health"
        score={state.governance.score}
        label={state.governance.label}
        detail={`${state.governance.reviewRequired} review · ${state.governance.pendingGovernance} pending`}
      />
    </div>

    <div className="intelligence-quality__principle">
      <strong>Missing data ≠ low confidence.</strong>
      <span>Coverage measures completeness. Confidence measures the reliability of information SCIIP actually has.</span>
    </div>

    <div className="intelligence-quality__footer">
      <span>Weights: 35% coverage · 40% confidence · 25% governance</span>
      <span>Authority: SCIIP</span>
    </div>
  </details>;
}
