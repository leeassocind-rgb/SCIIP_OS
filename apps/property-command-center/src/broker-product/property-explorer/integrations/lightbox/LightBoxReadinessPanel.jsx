import React from'react';

export default function LightBoxReadinessPanel({state}){
  if(!state||state.phase==='DISABLED')return null;
  if(state.phase==='LOADING')return <div className="explorer3__lightbox-readiness">Checking enrichment contracts…</div>;
  if(state.phase==='ERROR')return <div className="explorer3__lightbox-readiness">LightBox contract status unavailable</div>;
  const active=state.readiness?.activeContracts||[];
  const pending=state.readiness?.pendingContracts||[];
  return(
    <div className="explorer3__lightbox-readiness">
      <strong>LightBox enrichment readiness</strong>
      <span>{active.length} active verified</span>
      <span>{pending.length} awaiting contract certification</span>
    </div>
  );
}
