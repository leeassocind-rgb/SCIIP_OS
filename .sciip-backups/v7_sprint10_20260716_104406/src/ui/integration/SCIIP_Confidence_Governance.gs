/** SCIIP_OS v7.0 Sprint 5B — Confidence Governance. */
var SCIIP_CONFIDENCE_GOVERNANCE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-5b', history=[];
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function num_(v){var n=Number(v);return isFinite(n)?n:0;}

  function assess(request){
    request=request||{};
    var evidenceCount=num_(request.evidenceCount);
    var sourceQuality=Math.max(0,Math.min(100,num_(request.sourceQuality)));
    var freshness=Math.max(0,Math.min(100,num_(request.freshness)));
    var consistency=Math.max(0,Math.min(100,num_(request.consistency)));
    var score=Math.round(((Math.min(evidenceCount,10)/10)*25 + sourceQuality*0.30 + freshness*0.20 + consistency*0.25)*100)/100;
    var level=score>=85?'HIGH':score>=65?'MEDIUM':'LOW';
    var decision=level==='LOW'?'HUMAN_REVIEW_REQUIRED':'AUTONOMOUS_ACTION_ALLOWED';
    var result={score:score,level:level,decision:decision,assessedAt:new Date().toISOString(),
      factors:{evidenceCount:evidenceCount,sourceQuality:sourceQuality,freshness:freshness,consistency:consistency}};
    history.push(clone_(result)); return result;
  }
  function snapshot(){return {version:VERSION,status:'AVAILABLE',assessments:clone_(history)};}
  function reset(){history=[];return true;}
  return {VERSION:VERSION,assess:assess,snapshot:snapshot,reset:reset};
})();
