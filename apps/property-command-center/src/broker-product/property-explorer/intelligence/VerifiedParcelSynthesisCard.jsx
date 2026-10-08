import React from'react';
import{formatSynthesisMoney,formatSynthesisPercent}from'./VerifiedParcelSynthesis.js';

function Metric({label,value,sub=null}){
  return <div className="parcel-synthesis__metric">
    <span>{label}</span><strong>{value??'—'}</strong>{sub&&<small>{sub}</small>}
  </div>;
}

export default function VerifiedParcelSynthesisCard({model}){
  const synthesis=model?.parcelSynthesis;
  if(!synthesis||synthesis.status!=='ACTIVE')return null;

  const aligned=synthesis.site?.alignmentStatus==='ALIGNED';
  const posture=synthesis.posture==='CORROBORATED'?'Corroborated':`${synthesis.reviewCount} review`;

  return <details className="parcel-synthesis">
    <summary>
      <div>
        <span>SCIIP × VERIFIED EXTERNAL EVIDENCE</span>
        <strong>Parcel Intelligence Synthesis</strong>
      </div>
      <em>{posture}</em>
    </summary>

    <div className="parcel-synthesis__notice">
      Derived interpretation only. SCIIP remains canonical; synthesis never mutates governed fields.
    </div>

    <div className="parcel-synthesis__metrics">
      <Metric
        label="Site Alignment"
        value={aligned?'ALIGNED':synthesis.site?.alignmentStatus}
        sub={synthesis.site?.deltaPct==null?'No comparison':`${formatSynthesisPercent(synthesis.site.deltaPct)} variance`}
      />
      <Metric
        label="SCIIP Site"
        value={synthesis.site?.sciipLandAcres==null?'—':`${synthesis.site.sciipLandAcres.toFixed(2)} ac`}
      />
      <Metric
        label="LightBox Site"
        value={synthesis.site?.externalLandAcres==null?'—':`${synthesis.site.externalLandAcres.toFixed(2)} ac`}
      />
      <Metric
        label="Classification"
        value={synthesis.classification?.status||'—'}
        sub={synthesis.classification?.industrialSupport?'Industrial supported':null}
      />
      <Metric
        label="Assessed Total"
        value={formatSynthesisMoney(synthesis.assessment?.total)}
        sub={synthesis.assessment?.year||null}
      />
      <Metric
        label="Improvements"
        value={formatSynthesisPercent(synthesis.assessment?.improvementPct)}
      />
    </div>

    <div className="parcel-synthesis__signals">
      {synthesis.signals.map(signal=><div className={`parcel-synthesis__signal parcel-synthesis__signal--${signal.severity.toLowerCase()}`} key={signal.id}>
        <div><strong>{signal.title}</strong><span>{signal.detail}</span></div>
        <em>{signal.severity}</em>
      </div>)}
    </div>

    <div className="parcel-synthesis__footer">
      <span>Authority: SCIIP</span>
      <span>Evidence: LightBox</span>
      <span>Reviews: {synthesis.reviewCount}</span>
    </div>
  </details>;
}
