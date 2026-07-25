/** SCIIP_OS v7.0 Sprint 5B — Autonomous Opportunity Engine. */
var SCIIP_AUTONOMOUS_OPPORTUNITY_ENGINE = (function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-5b', opportunities=[], nextId=1;

  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function num_(v){var n=Number(v);return isFinite(n)?n:0;}
  function band_(score){return score>=85?'PRIORITY':score>=70?'HIGH':score>=50?'MEDIUM':'LOW';}

  function scoreCandidate_(candidate, context){
    candidate=candidate||{}; context=context||{};
    var market=num_(candidate.marketScore||candidate.marketStrength);
    var fit=num_(candidate.tenantFit||candidate.fitScore);
    var suitability=num_(candidate.suitabilityScore||candidate.suitability);
    var timing=num_(candidate.timingScore||candidate.urgency);
    var risk=Math.max(0,Math.min(100,num_(candidate.riskScore)));
    var score=(market*0.25)+(fit*0.30)+(suitability*0.25)+(timing*0.20)-(risk*0.15);
    score=Math.max(0,Math.min(100,Math.round(score*100)/100));
    return {
      candidateId:String(candidate.id||candidate.propertyId||candidate.companyId||('candidate-'+nextId)),
      label:String(candidate.label||candidate.name||candidate.address||candidate.id||'Opportunity'),
      score:score,
      priority:band_(score),
      factors:{market:market,fit:fit,suitability:suitability,timing:timing,risk:risk},
      context:clone_(context)
    };
  }

  function detect(request){
    request=request||{};
    var candidates=request.candidates||[], context=request.context||{}, detected=[];
    for(var i=0;i<candidates.length;i+=1){
      var item=scoreCandidate_(candidates[i],context);
      if(item.score>=num_(request.minimumScore||50)) detected.push(item);
    }
    detected.sort(function(a,b){return b.score-a.score||a.candidateId.localeCompare(b.candidateId);});
    for(var j=0;j<detected.length;j+=1){
      detected[j].opportunityId='opportunity-'+nextId++;
      detected[j].status='OPEN';
      detected[j].createdAt=new Date().toISOString();
      opportunities.push(clone_(detected[j]));
    }
    return {version:VERSION,status:'COMPLETED',count:detected.length,opportunities:detected};
  }

  function list(filter){
    filter=filter||{};
    return clone_(opportunities.filter(function(o){
      return (!filter.status||o.status===filter.status) &&
             (!filter.priority||o.priority===filter.priority);
    }));
  }

  function updateStatus(id,status){
    for(var i=0;i<opportunities.length;i+=1){
      if(opportunities[i].opportunityId===id){
        opportunities[i].status=String(status||'OPEN');
        opportunities[i].updatedAt=new Date().toISOString();
        return clone_(opportunities[i]);
      }
    }
    throw new Error('OPPORTUNITY_NOT_FOUND');
  }

  function reset(){opportunities=[];nextId=1;return true;}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',count:opportunities.length,opportunities:clone_(opportunities)};}
  return {VERSION:VERSION,detect:detect,list:list,updateStatus:updateStatus,reset:reset,snapshot:snapshot};
})();
