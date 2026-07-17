/** SCIIP_OS v7.0 Integration Sprint 3D — portfolio optimization. */
var SCIIP_PORTFOLIO_OPTIMIZER=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3d';
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}function num_(v){v=Number(v||0);return isFinite(v)?v:0;}
  function optimize(request){request=request||{};var assets=request.assets||[],budget=num_(request.budget),maxAssets=Math.max(1,Number(request.maxAssets)||assets.length||1),scored=assets.map(function(a){var value=num_(a.valueScore||a.score||50),cost=num_(a.acquisitionCost||a.cost),risk=num_(a.riskScore||0),utility=value-risk*0.35;return {asset:clone_(a),assetId:String(a.id||a.twinId||a.propertyId||''),cost:cost,utility:utility,ratio:cost>0?utility/cost:utility};}).sort(function(a,b){return b.ratio-a.ratio||b.utility-a.utility;});var selected=[],spent=0,totalUtility=0;scored.forEach(function(x){if(selected.length>=maxAssets)return;if(budget>0&&spent+x.cost>budget)return;selected.push(x);spent+=x.cost;totalUtility+=x.utility;});return {version:VERSION,status:'OPTIMIZED',selected:selected,totalSelected:selected.length,totalCost:spent,totalUtility:Math.round(totalUtility*100)/100,remainingBudget:budget>0?budget-spent:null,method:'DETERMINISTIC_GREEDY_UTILITY_RATIO',generatedAt:new Date().toISOString()};}
  return {VERSION:VERSION,optimize:optimize};
})();
function sciipOptimizePortfolioV7(request){return SCIIP_PORTFOLIO_OPTIMIZER.optimize(request||{});}
