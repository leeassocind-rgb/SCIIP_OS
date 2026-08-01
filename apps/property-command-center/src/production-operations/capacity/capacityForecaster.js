const freeze=v=>Object.freeze(v);
export function forecastCapacity({samples=[],horizonDays=30,thresholds={cpuPct:80,memoryPct:85,storagePct:85}}={}){
 const latest=samples[samples.length-1]||{};
 const growth=(field)=>{
  if(samples.length<2)return 0;
  const first=Number(samples[0][field]||0),last=Number(latest[field]||0);
  return Number(((last-first)/Math.max(1,samples.length-1)).toFixed(4));
 };
 const project=(field)=>Number((Number(latest[field]||0)+growth(field)*horizonDays).toFixed(2));
 const projections=freeze({cpuPct:project('cpuPct'),memoryPct:project('memoryPct'),storagePct:project('storagePct')});
 const risks=[];
 if(projections.cpuPct>=thresholds.cpuPct)risks.push('CPU_CAPACITY');
 if(projections.memoryPct>=thresholds.memoryPct)risks.push('MEMORY_CAPACITY');
 if(projections.storagePct>=thresholds.storagePct)risks.push('STORAGE_CAPACITY');
 return freeze({horizonDays,projections,risks:freeze(risks),riskCount:risks.length,status:risks.length?'WATCH':'HEALTHY',forecasted:true,productionWritesGoverned:true,autonomousExecutionAllowed:false});
}
