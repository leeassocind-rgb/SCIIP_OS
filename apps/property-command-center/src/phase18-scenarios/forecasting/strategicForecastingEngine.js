const freeze=v=>Object.freeze(v);

export function generateStrategicForecasts({series=[],horizonPeriods=4}={}) {
  const forecasts=series.map(item=>{
    const history=(item.values||[]).map(Number);
    const latest=history.at(-1)||0;
    const previous=history.at(-2)??latest;
    const trend=latest-previous;
    const projected=Array.from({length:horizonPeriods},(_,index)=>Number((latest+trend*(index+1)).toFixed(2)));
    return freeze({
      seriesId:item.seriesId,
      latest,
      trend,
      projected:freeze(projected),
      direction:trend>0?'UP':trend<0?'DOWN':'FLAT',
      methodology:'LINEAR_TREND',
      assumptionsVisible:true
    });
  });

  return freeze({
    forecasts:freeze(forecasts),
    total:forecasts.length,
    horizonPeriods,
    methodologyVisible:true,
    evidenceRequired:true,
    autonomousForecastChangesAllowed:false
  });
}
