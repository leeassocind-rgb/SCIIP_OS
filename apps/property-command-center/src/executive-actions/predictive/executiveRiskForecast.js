export function forecastExecutiveRisk(history=[]){
  const values=history.map(r=>Number(r.riskScore)).filter(Number.isFinite);
  if(!values.length)return Object.freeze({projectedRiskScore:0,direction:'UNKNOWN',confidence:'LOW'});
  const last=values.at(-1), first=values[0], delta=values.length>1?(last-first)/(values.length-1):0;
  const projected=Math.max(0,Math.min(100,Math.round((last+delta)*100)/100));
  return Object.freeze({projectedRiskScore:projected,direction:delta>1?'RISING':delta<-1?'FALLING':'STABLE',confidence:values.length>=5?'HIGH':values.length>=3?'MEDIUM':'LOW'});
}
