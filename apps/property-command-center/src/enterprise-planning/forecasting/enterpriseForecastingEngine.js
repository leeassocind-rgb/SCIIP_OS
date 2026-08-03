const freeze = value => Object.freeze(value);

export function generateEnterpriseForecast({series=[],horizon=4,confidenceLevel=.9}={}) {
  const values = series.map(item => Number(item.value || 0));
  const last = values.at(-1) || 0;
  const first = values[0] || 0;
  const periods = Math.max(1, values.length - 1);
  const trend = Number(((last - first) / periods).toFixed(4));
  const volatility = values.length > 1
    ? Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value - (values.reduce((a,b)=>a+b,0)/values.length), 2), 0) / values.length)
    : 0;

  const forecast = Array.from({length:horizon}, (_,index) => {
    const point = last + trend * (index + 1);
    const spread = volatility * Math.sqrt(index + 1);
    return freeze({
      period:index + 1,
      forecast:Number(point.toFixed(2)),
      lowerBound:Number((point - spread).toFixed(2)),
      upperBound:Number((point + spread).toFixed(2))
    });
  });

  return freeze({
    history: freeze(series.map(item=>freeze({...item}))),
    forecast: freeze(forecast),
    horizon,
    confidenceLevel,
    trend,
    volatility:Number(volatility.toFixed(4)),
    assumptionsVisible:true,
    evidenceBacked:true,
    autonomousCommitmentAllowed:false
  });
}
