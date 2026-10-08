import React from'react';

const fmt=value=>{
  if(value===null||value===undefined||value==='')return'—';
  if(typeof value==='number')return new Intl.NumberFormat().format(value);
  return String(value);
};

export default function LightBoxSourceComparison({state}){
  if(state?.phase!=='READY')return null;
  const report=state.result?.conflictReport;
  if(!report)return null;
  const conflicts=report.conflicts||[];
  return(
    <div className="explorer3__source-compare">
      <div className="explorer3__source-compare-head">
        <strong>Source Comparison</strong>
        <span className={report.status==='ALIGNED'?'is-aligned':'is-review'}>
          {report.status==='ALIGNED'?'Sources aligned':`${report.conflictCount} review ${report.conflictCount===1?'item':'items'}`}
        </span>
      </div>
      {conflicts.length===0?(
        <p>LightBox parcel evidence does not conflict with governed SCIIP fields.</p>
      ):(
        <div className="explorer3__source-compare-list">
          {conflicts.slice(0,8).map(row=>{
            const canonical=row.authoritative;
            const external=row.conflicts?.[0];
            return(
              <div className="explorer3__source-compare-row" key={row.field}>
                <strong>{row.field}</strong>
                <span><b>SCIIP</b> {fmt(canonical?.value)}</span>
                <span><b>{external?.provider||'External'}</b> {fmt(external?.value)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
