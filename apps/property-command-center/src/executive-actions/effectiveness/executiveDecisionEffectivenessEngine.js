import {createExecutiveDecisionScorecard} from './executiveDecisionScorecard.js';
import {benchmarkExecutiveDecisions} from './executiveDecisionBenchmark.js';
import {generateExecutiveDecisionRecommendations} from './executiveDecisionRecommendationEngine.js';
export function createExecutiveDecisionEffectivenessEngine({maxOutcomes=500}={}) {
  const outcomes=new Map();let ingested=0,duplicatesIgnored=0,failures=0,startedAt=null;
  const api={
    start(){startedAt ||= new Date().toISOString();return api.snapshot('OPERATIONAL');},
    stop(){return api.snapshot('STOPPED');},
    ingest(row={}){try{const id=row.outcomeId||row.id;if(!id)throw new Error('Outcome id is required');if(outcomes.has(id)){duplicatesIgnored++;return Object.freeze({status:'DUPLICATE_IGNORED'});}outcomes.set(id,Object.freeze({...row}));ingested++;while(outcomes.size>maxOutcomes)outcomes.delete(outcomes.keys().next().value);return Object.freeze({status:'INGESTED'});}catch(error){failures++;return Object.freeze({status:'FAILED',error:String(error?.message||error)});}},
    getOutcomes(){return Object.freeze([...outcomes.values()]);},
    getBenchmarks(){return benchmarkExecutiveDecisions([...outcomes.values()]);},
    getScorecard(decisionType='UNCLASSIFIED'){const rows=[...outcomes.values()].filter(r=>(r.decisionType||r.workflowType||'UNCLASSIFIED')===decisionType);const scorecard=createExecutiveDecisionScorecard({decisionType,outcomes:rows});const benchmark=api.getBenchmarks().find(b=>b.decisionType===decisionType)||null;return Object.freeze({...scorecard,recommendations:generateExecutiveDecisionRecommendations({kpis:scorecard.kpis,trend:scorecard.trend,benchmark})});},
    getPortfolio(){const benchmarks=api.getBenchmarks();return Object.freeze({generatedAt:new Date().toISOString(),scorecards:Object.freeze(benchmarks.map(b=>api.getScorecard(b.decisionType))),benchmarks,readOnly:true});},
    snapshot(forced){return Object.freeze({status:forced||(startedAt?'OPERATIONAL':'READY'),startedAt,ingested,retainedOutcomes:outcomes.size,maxOutcomes,duplicatesIgnored,failures,readOnly:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false,decisionTraceability:true});}
  };return api;
}
