import {analyzeExecutiveAlternatives} from './executiveAlternativeAnalysis.js';
import {rankExecutiveRecommendations} from './executiveRecommendationRanker.js';
import {createExecutiveRecommendationScorecard} from './executiveRecommendationScorecard.js';
import {generateExecutivePlaybook} from './executivePlaybookGenerator.js';
export function createExecutiveRecommendationEngine({maxDecisions=100}={}){
  let status='READY',decisionsProcessed=0,duplicatesIgnored=0,failures=0; const records=new Map();
  const snapshot=()=>Object.freeze({status,decisionsProcessed,retainedDecisions:records.size,duplicatesIgnored,failures,readOnly:true,advisoryOnly:true,humanApprovalRequired:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false,decisionTraceability:true});
  return Object.freeze({
    start(){status='OPERATIONAL';return snapshot();},stop(){status='STOPPED';return snapshot();},snapshot,
    prescribe(input={}){try{const decisionId=String(input.decisionId||'').trim();if(!decisionId)throw new Error('decisionId is required');if(records.has(decisionId)){duplicatesIgnored++;return Object.freeze({status:'DUPLICATE_IGNORED',decisionId,...records.get(decisionId)});}const analyses=analyzeExecutiveAlternatives(input.alternatives||[],input.constraints||{});const ranked=rankExecutiveRecommendations(analyses);const scorecards=ranked.map((row,index)=>createExecutiveRecommendationScorecard({recommendationId:`REC:${decisionId}:${index+1}`,decisionId,rankedAlternative:row,generatedAt:input.generatedAt||new Date(0).toISOString()}));const playbook=generateExecutivePlaybook({decisionId,scorecards});const result=Object.freeze({decisionId,analyses,rankedRecommendations:ranked,scorecards:Object.freeze(scorecards),playbook,sourceForecastId:input.sourceForecastId||null,sourceSignalIds:Object.freeze([...new Set(scorecards.flatMap(s=>s.sourceSignalIds))])});records.set(decisionId,result);while(records.size>maxDecisions)records.delete(records.keys().next().value);decisionsProcessed++;return Object.freeze({status:'PRESCRIPTION_GENERATED',...result});}catch(error){failures++;throw error;}},
    get(decisionId){return records.get(decisionId)||null;},getAll(){return Object.freeze([...records.values()]);}
  });
}
