import React from'react';
const fmt=(value,suffix='')=>{
  if(value===null||value===undefined||value==='—')return'—';
  if(typeof value==='number')return `${new Intl.NumberFormat().format(value)}${suffix}`;
  return `${value}${suffix}`;
};
export default function PropertyMetricRail({snapshot}){
  const metrics=[
    ['Building',fmt(snapshot.buildingSf,' SF')],
    ['Land',fmt(snapshot.landAcres,' AC')],
    ['Clear',fmt(snapshot.clearHeightFt,"'")],
    ['Power',fmt(snapshot.powerAmps,' A')],
    [snapshot.askingRate!=='—'?'Asking':'Parcel',snapshot.askingRate!=='—'?snapshot.askingRate:snapshot.parcelId]
  ];
  return <div className="explorer3__metric-rail">
    {metrics.map(([label,value])=><div className="explorer3__metric-rail-item" key={label}><strong>{value}</strong><span>{label}</span></div>)}
  </div>;
}
