/** SCIIP_OS v7.0 — Epic 3 Sprint 13: Enterprise Portfolio Strategy and Capital Allocation */
var SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION=(function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint13.0';
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function num(v,d){v=Number(v);return isFinite(v)?v:(d||0);}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function round(v){return Math.round(v*100)/100;}
  function hash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  function normalizeAction(a){
    var capital=Math.max(0,num(a.capitalRequired,0)), expected=Math.max(0,num(a.expectedValue,0));
    var confidence=clamp(num(a.confidence,50),0,100), market=clamp(num(a.marketScore,50),0,100), execution=clamp(num(a.executionHealth,50),0,100), evidence=clamp(num(a.evidenceQuality,0),0,100), risk=clamp(num(a.riskScore,50),0,100), strategic=clamp(num(a.strategicFit,50),0,100);
    var returnScore=capital?clamp(expected/capital*50,0,100):0;
    var score=round(strategic*.22+market*.18+confidence*.16+execution*.14+evidence*.12+returnScore*.18-risk*.20);
    return {actionId:text(a.actionId||('ACT-'+hash(text(a.opportunityId)+'|'+text(a.assetId)+'|'+upper(a.actionType)))),opportunityId:text(a.opportunityId),assetId:text(a.assetId),market:upper(a.market||'UNKNOWN'),assetType:upper(a.assetType||'UNKNOWN'),actionType:upper(a.actionType||'REVIEW'),capitalRequired:capital,expectedValue:expected,confidence:confidence,marketScore:market,executionHealth:execution,evidenceQuality:evidence,riskScore:risk,strategicFit:strategic,returnScore:round(returnScore),priorityScore:clamp(score,0,100),latitude:a.latitude===null||a.latitude===undefined?null:num(a.latitude,0),longitude:a.longitude===null||a.longitude===undefined?null:num(a.longitude,0),evidenceIds:(a.evidenceIds||[]).map(text).filter(Boolean),requiresHumanApproval:true,autonomousCapitalDeployment:false,destructiveCommitEnabled:false};
  }
  function rank(actions,policy){
    policy=policy||{};var minEvidence=num(policy.minimumEvidenceQuality,60),minConfidence=num(policy.minimumConfidence,60),rows=(actions||[]).map(normalizeAction),eligible=[],rejected=[];
    rows.forEach(function(r){var reasons=[];if(r.capitalRequired<=0)reasons.push('CAPITAL_REQUIRED');if(r.evidenceQuality<minEvidence)reasons.push('INSUFFICIENT_EVIDENCE');if(r.confidence<minConfidence)reasons.push('LOW_CONFIDENCE');if(!r.evidenceIds.length)reasons.push('EVIDENCE_IDS_REQUIRED');if(reasons.length)rejected.push({action:r,reasons:reasons});else eligible.push(r);});
    eligible.sort(function(a,b){return b.priorityScore-a.priorityScore||a.capitalRequired-b.capitalRequired||a.actionId.localeCompare(b.actionId);});
    return {eligible:eligible,rejected:rejected,policy:{minimumEvidenceQuality:minEvidence,minimumConfidence:minConfidence},reviewRequired:true};
  }
  function allocate(actions,constraints){
    constraints=constraints||{};var ranked=rank(actions,constraints),budget=Math.max(0,num(constraints.totalCapital,0)),marketCaps=constraints.marketCaps||{},assetCaps=constraints.assetTypeCaps||{},used=0,selected=[],deferred=[],marketUse={},assetUse={};
    ranked.eligible.forEach(function(a){var marketCap=marketCaps[a.market]===undefined?budget:num(marketCaps[a.market],budget),assetCap=assetCaps[a.assetType]===undefined?budget:num(assetCaps[a.assetType],budget),reason='';if(used+a.capitalRequired>budget)reason='TOTAL_CAPITAL_CONSTRAINT';else if((marketUse[a.market]||0)+a.capitalRequired>marketCap)reason='MARKET_CAP_CONSTRAINT';else if((assetUse[a.assetType]||0)+a.capitalRequired>assetCap)reason='ASSET_TYPE_CAP_CONSTRAINT';if(reason){deferred.push({action:a,reason:reason});return;}selected.push(a);used+=a.capitalRequired;marketUse[a.market]=(marketUse[a.market]||0)+a.capitalRequired;assetUse[a.assetType]=(assetUse[a.assetType]||0)+a.capitalRequired;});
    return {allocationId:'ALLOC-'+hash(JSON.stringify(selected.map(function(a){return a.actionId;}))+'|'+budget),selected:selected,deferred:deferred,rejected:ranked.rejected,totalCapital:budget,allocatedCapital:used,remainingCapital:round(budget-used),marketAllocation:marketUse,assetTypeAllocation:assetUse,status:selected.length?'PENDING_APPROVAL':'NO_ACTIONS_SELECTED',requiresHumanApproval:true,autonomousCapitalDeployment:false,destructiveCommitEnabled:false};
  }
  function scenarios(actions,constraints){
    var base=constraints||{},conservative=Object.assign({},base,{minimumEvidenceQuality:Math.max(75,num(base.minimumEvidenceQuality,60)),minimumConfidence:Math.max(75,num(base.minimumConfidence,60)),totalCapital:num(base.totalCapital,0)*.75}),growth=Object.assign({},base,{minimumEvidenceQuality:Math.max(60,num(base.minimumEvidenceQuality,60)),minimumConfidence:Math.max(60,num(base.minimumConfidence,60)),totalCapital:num(base.totalCapital,0)*1.15});
    return [{scenarioId:'CONSERVATIVE',result:allocate(actions,conservative)},{scenarioId:'BALANCED',result:allocate(actions,base)},{scenarioId:'GROWTH',result:allocate(actions,growth)}];
  }
  function approve(allocation,decision){decision=decision||{};if(!allocation)return {status:'REJECTED',reason:'ALLOCATION_REQUIRED'};if(upper(decision.action)!=='APPROVE')return {status:'REJECTED',reason:'EXPLICIT_APPROVAL_REQUIRED'};if(!text(decision.approvedBy))return {status:'REJECTED',reason:'APPROVER_REQUIRED'};return {eventId:'CAP-'+hash(allocation.allocationId+'|'+decision.approvedBy+'|'+text(decision.approvedAt)),eventType:'CAPITAL_ALLOCATION_APPROVED',allocationId:allocation.allocationId,approvedCapital:allocation.allocatedCapital,approvedActionIds:allocation.selected.map(function(a){return a.actionId;}),approvedBy:text(decision.approvedBy),approvedAt:decision.approvedAt||new Date().toISOString(),status:'APPROVED_NOT_DEPLOYED',deploymentRequiresControlledWorkflow:true,autonomousCapitalDeployment:false,appendOnly:true};}
  function mapProjection(allocation){return (allocation&&allocation.selected||[]).filter(function(a){return a.latitude!==null&&a.longitude!==null;}).map(function(a){return {actionId:a.actionId,assetId:a.assetId,latitude:a.latitude,longitude:a.longitude,priorityScore:a.priorityScore,capitalRequired:a.capitalRequired,market:a.market};});}
  function portfolioSummary(allocation){var rows=allocation&&allocation.selected||[];return {selectedActions:rows.length,allocatedCapital:allocation?allocation.allocatedCapital:0,remainingCapital:allocation?allocation.remainingCapital:0,weightedPriorityScore:rows.length?round(rows.reduce(function(n,a){return n+a.priorityScore*a.capitalRequired;},0)/Math.max(1,rows.reduce(function(n,a){return n+a.capitalRequired;},0))):0,markets:Object.keys(allocation&&allocation.marketAllocation||{}).length,assetTypes:Object.keys(allocation&&allocation.assetTypeAllocation||{}).length,reviewRequired:true,autonomousCapitalDeployment:false};}
  return {VERSION:VERSION,normalizeAction:normalizeAction,rank:rank,allocate:allocate,scenarios:scenarios,approve:approve,mapProjection:mapProjection,portfolioSummary:portfolioSummary};
}());
