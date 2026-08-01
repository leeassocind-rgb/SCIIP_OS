const freeze=v=>Object.freeze(v);
export function runRecoveryDrill({scenario,controls={},results={}}={}){
 const safe=controls.productionTrafficAffected===false&&controls.productionWritesAffected===false;
 const passed=safe&&results.recovered===true&&Number(results.recoveryMinutes||Infinity)<=Number(scenario?.rtoMinutes||0);
 return freeze({
  scenarioId:scenario?.scenarioId||null,
  safe,
  recovered:Boolean(results.recovered),
  recoveryMinutes:Number(results.recoveryMinutes||0),
  rtoMinutes:Number(scenario?.rtoMinutes||0),
  rtoMet:passed,
  status:passed?'PASSED':'FAILED',
  evidence:freeze([...(results.evidence||[])]),
  productionTrafficAffected:false,
  productionWritesAffected:false
 });
}
