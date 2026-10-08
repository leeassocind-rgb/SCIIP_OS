import React from'react';

const label=value=>String(value||'').replaceAll('_',' ');

export default function LightBoxParcelPanel({state}){
  if(state.phase==='DISABLED')return(
    <div className="explorer3__lightbox-state">
      <strong>LightBox enrichment</strong>
      <span>Server proxy not configured</span>
    </div>
  );
  if(state.phase==='LOADING')return(
    <div className="explorer3__lightbox-state">
      <strong>LightBox enrichment</strong>
      <span>Resolving parcel…</span>
    </div>
  );
  if(state.phase==='ERROR')return(
    <div className="explorer3__lightbox-state">
      <strong>LightBox enrichment</strong>
      <span>Unavailable · {label(state.error?.code)}</span>
    </div>
  );
  if(state.phase!=='READY')return null;
  const resolution=state.result?.resolution;
  const top=resolution?.top;
  return(
    <div className="explorer3__lightbox-state">
      <strong>LightBox parcel resolution</strong>
      <span>{label(resolution?.status)} · {resolution?.confidence||0}%</span>
      {top?.apn&&<span>APN {top.apn}</span>}
      {state.result?.cache&&<span>{state.result.cache.hit?'Cached':'Live'} response</span>}
    </div>
  );
}
