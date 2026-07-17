/** SCIIP_OS v7.0 Integration Sprint 3D — explainable scenario comparison. */
var SCIIP_SCENARIO_COMPARISON_ENGINE=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3d';
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function compare(runs){runs=(runs||[]).filter(Boolean);if(runs.length<2)throw new Error('AT_LEAST_TWO_SIMULATION_RUNS_REQUIRED');var rows=runs.map(function(run){var winner=run.winner||{};return {runId:run.id,scenarioId:run.scenarioId,winnerId:winner.candidateId||null,winnerLabel:winner.label||null,winnerScore:Number(winner.score||0),eligibleCount:Number(run.eligibleCount||0),candidateCount:Number(run.candidateCount||0),violations:winner.violations||[]};}).sort(function(a,b){return b.winnerScore-a.winnerScore;});var best=rows[0],second=rows[1],delta=Math.round((best.winnerScore-second.winnerScore)*100)/100;return {version:VERSION,status:'COMPARED',scenarios:clone_(rows),bestScenarioId:best.scenarioId,bestRunId:best.runId,scoreDelta:delta,explanation:'Scenario '+best.scenarioId+' ranked first because its leading candidate scored '+best.winnerScore+', '+delta+' points above the next scenario.',generatedAt:new Date().toISOString()};}
  return {VERSION:VERSION,compare:compare};
})();
function sciipCompareScenariosV7(runs){return SCIIP_SCENARIO_COMPARISON_ENGINE.compare(runs||[]);}
