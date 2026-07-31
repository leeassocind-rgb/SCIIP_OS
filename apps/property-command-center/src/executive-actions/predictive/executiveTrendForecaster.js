const round=n=>Math.round(n*100)/100;
export function forecastExecutiveTrend(history=[],field='healthScore',periods=3){
  const values=history.map(r=>Number(r[field])).filter(Number.isFinite);
  if(!values.length)return Object.freeze({field,periods,trend:'UNKNOWN',slope:0,forecast:[]});
  const slope=values.length<2?0:(values.at(-1)-values[0])/(values.length-1);
  const last=values.at(-1); const forecast=Array.from({length:periods},(_,i)=>round(Math.max(0,Math.min(100,last+slope*(i+1)))));
  return Object.freeze({field,periods,trend:slope>0.5?'IMPROVING':slope<-.5?'DECLINING':'STABLE',slope:round(slope),forecast:Object.freeze(forecast)});
}
