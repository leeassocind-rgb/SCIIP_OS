/** SCIIP_OS v7.0 Sprint 5A — continuous portfolio scoring and predictive indicators. */
var SCIIP_CONTINUOUS_PORTFOLIO_SCORING=(function(){
'use strict';var VERSION='v7.0-integration-sprint-5a',runs=[];
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}function num(v){var n=Number(v);return isFinite(n)?n:0;}function clamp(v){return Math.max(0,Math.min(100,v));}
function scoreAsset(asset,weights){asset=asset||{};weights=weights||{};var factors={suitability:num(asset.suitability),infrastructure:num(asset.infrastructure),labor:num(asset.labor),market:num(asset.market),tenantFit:num(asset.tenantFit),risk:100-num(asset.risk)};var defaults={suitability:25,infrastructure:20,labor:15,market:15,tenantFit:20,risk:5},total=0,weighted=0,contributions=[];Object.keys(defaults).forEach(function(k){var w=num(weights[k] == null ? defaults[k] : weights[k]);total+=w;weighted+=clamp(factors[k])*w;contributions.push({factor:k,value:clamp(factors[k]),weight:w});});var score=total?Math.round(weighted/total*100)/100:0;return {entityId:String(asset.entityId||asset.id||''),label:String(asset.label||asset.name||asset.entityId||asset.id||''),score:score,band:score>=85?'EXCELLENT':score>=70?'STRONG':score>=55?'MODERATE':'WEAK',contributions:contributions};}
function run(request){request=request||{};var rows=(request.assets||[]).map(function(a){return scoreAsset(a,request.weights);}).sort(function(a,b){return b.score-a.score||a.entityId.localeCompare(b.entityId);});var result={id:'portfolio-score-run-'+(runs.length+1),version:VERSION,status:'COMPLETED',count:rows.length,rankings:rows,generatedAt:new Date().toISOString()};runs.push(result);return clone(result);}
function snapshot(){return {version:VERSION,status:'AVAILABLE',runs:clone(runs)};}return {VERSION:VERSION,scoreAsset:scoreAsset,run:run,snapshot:snapshot};
})();

var SCIIP_PREDICTIVE_MARKET_INDICATORS=(function(){
'use strict';var VERSION='v7.0-integration-sprint-5a';
function num(v){var n=Number(v);return isFinite(n)?n:0;}function round(v){return Math.round(v*100)/100;}
function forecast(request){request=request||{};var values=(request.values||[]).map(num),horizon=Math.max(1,Math.min(Number(request.horizon)||3,24));if(!values.length)return {version:VERSION,status:'EMPTY',forecast:[]};var changes=[];for(var i=1;i<values.length;i+=1)changes.push(values[i]-values[i-1]);var slope=changes.length?changes.reduce(function(a,b){return a+b;},0)/changes.length:0,last=values[values.length-1],out=[];for(var h=1;h<=horizon;h+=1)out.push({period:h,value:round(last+slope*h)});return {version:VERSION,status:'COMPLETED',direction:slope>0?'UP':slope<0?'DOWN':'FLAT',slope:round(slope),confidence:values.length>=4?'HIGH':values.length>=2?'MEDIUM':'LOW',forecast:out};}
return {VERSION:VERSION,forecast:forecast};
})();
function sciipContinuousPortfolioScoringV7(request){return SCIIP_CONTINUOUS_PORTFOLIO_SCORING.run(request||{});}function sciipPredictiveMarketIndicatorsV7(request){return SCIIP_PREDICTIVE_MARKET_INDICATORS.forecast(request||{});}
