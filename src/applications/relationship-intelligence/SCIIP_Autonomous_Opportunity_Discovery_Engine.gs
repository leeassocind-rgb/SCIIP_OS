/** SCIIP_OS v7.0 — Epic 3 Sprint 8: Autonomous Opportunity Discovery */
var SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY = (function () {
  'use strict';
  var VERSION='v7.0-epic3-sprint8.0';
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function num(v,d){var n=Number(v);return isFinite(n)?n:(d===undefined?0:d);}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function hash(prefix,s){var h=2166136261,i;for(i=0;i<s.length;i+=1){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return prefix+'-'+('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  function evidence(items){var seen={},out=[];(items||[]).forEach(function(x){if(!x)return;var e={sourceId:text(x.sourceId||x.id),sourceType:upper(x.sourceType||x.type||'UNKNOWN'),observedAt:text(x.observedAt||x.date),reference:text(x.reference||x.note||x.url),confidence:clamp(num(x.confidence,50),0,100)};var k=[e.sourceId,e.observedAt,e.reference].join('|');if(!seen[k]){seen[k]=1;out.push(e);}});return out;}
  function score(signal){
    var demand=clamp(num(signal.demandScore,50),0,100), fit=clamp(num(signal.propertyFitScore,50),0,100), network=clamp(num(signal.networkScore,50),0,100), timing=clamp(num(signal.timingScore,50),0,100), confidence=clamp(num(signal.confidence,50),0,100), risk=clamp(num(signal.riskScore,0),0,100);
    return Math.round(clamp((demand*.25+fit*.25+network*.2+timing*.15+confidence*.15)-(risk*.2),0,100)*100)/100;
  }
  function classify(signal){var t=upper(signal.type||signal.opportunityType);if(t)return t;if(signal.tenantId)return 'TENANT_REPRESENTATION';if(signal.propertyId&&upper(signal.intent)==='ACQUIRE')return 'ACQUISITION';if(signal.propertyId)return 'PROPERTY_POSITIONING';return 'MARKET_INTELLIGENCE';}
  function discover(input){
    input=input||{};var seen={},opportunities=[],rejected=[];
    (input.signals||[]).forEach(function(s){
      var ev=evidence((s.evidence||[]).concat(input.sharedEvidence||[]));
      var businessKey=text(s.businessKey)||[classify(s),text(s.propertyId),text(s.companyId||s.tenantId),text(s.marketId),text(s.observedAt)].join('|');
      if(seen[businessKey])return;seen[businessKey]=1;
      var sc=score(s), minimum=clamp(num(input.minimumScore,55),0,100), minimumEvidence=Math.max(1,num(input.minimumEvidence,1));
      if(sc<minimum||ev.length<minimumEvidence){rejected.push({businessKey:businessKey,score:sc,reason:sc<minimum?'BELOW_SCORE_THRESHOLD':'INSUFFICIENT_EVIDENCE'});return;}
      opportunities.push({id:text(s.id)||hash('OPP',businessKey),businessKey:businessKey,type:classify(s),title:text(s.title)||classify(s).replace(/_/g,' '),propertyId:text(s.propertyId),companyId:text(s.companyId||s.tenantId),marketId:text(s.marketId),score:sc,confidence:clamp(num(s.confidence,50),0,100),riskScore:clamp(num(s.riskScore,0),0,100),priority:sc>=85?'CRITICAL':sc>=70?'HIGH':'MEDIUM',status:'DISCOVERED',observedAt:text(s.observedAt),expiresAt:text(s.expiresAt),evidence:ev,rationale:(s.rationale||[]).map(text).filter(Boolean),recommendedAction:text(s.recommendedAction||'REVIEW_AND_QUALIFY'),approvalRequired:true,autonomousExecution:false,metadata:clone(s.metadata||{})});
    });
    opportunities.sort(function(a,b){return b.score-a.score||a.id.localeCompare(b.id);});
    return {version:VERSION,status:'COMPLETED',opportunities:opportunities,rejected:rejected,duplicateSafe:true,reviewRequired:true,destructiveCommitEnabled:false};
  }
  function detectChanges(previous,current){var before={},changes=[];(previous||[]).forEach(function(x){before[x.businessKey||x.id]=x;});(current||[]).forEach(function(x){var k=x.businessKey||x.id,p=before[k];if(!p)changes.push({type:'NEW',opportunity:x});else if(num(x.score)!==num(p.score)||upper(x.status)!==upper(p.status))changes.push({type:'CHANGED',opportunity:x,previousScore:num(p.score),scoreDelta:Math.round((num(x.score)-num(p.score))*100)/100});delete before[k];});Object.keys(before).forEach(function(k){changes.push({type:'CLOSED',opportunity:before[k]});});return {version:VERSION,count:changes.length,changes:changes};}
  function recommendations(discovery){return (discovery.opportunities||[]).slice(0,10).map(function(o,i){return {rank:i+1,opportunityId:o.id,action:o.recommendedAction,priority:o.priority,score:o.score,evidenceCount:o.evidence.length,approvalRequired:true,explanation:[o.title,'Score '+o.score,'Supported by '+o.evidence.length+' governed evidence item(s)'].join('. ')};});}
  function executiveSummary(discovery){var ops=discovery.opportunities||[],high=ops.filter(function(o){return o.priority==='CRITICAL'||o.priority==='HIGH';});return {version:VERSION,total:ops.length,highPriority:high.length,topOpportunity:ops.length?ops[0]:null,summary:ops.length?(ops.length+' governed opportunities discovered; '+high.length+' require priority review.'):'No governed opportunities met current thresholds.',reviewRequired:true};}
  return {VERSION:VERSION,score:score,discover:discover,detectChanges:detectChanges,recommendations:recommendations,executiveSummary:executiveSummary};
}());
