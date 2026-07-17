/** SCIIP_OS v7.0 Sprint 3F — release gates and assurance certificate. */
var SCIIP_RELEASE_ASSURANCE_ENGINE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3f',certificates=[],nextId=1;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function certify(input){input=input||{};var gates=clone_(input.gates||[]),failed=gates.filter(function(g){return g.required!==false&&g.status!=='PASSED';}),status=failed.length?'BLOCKED':'CERTIFIED';var c={certificateId:'release-cert-'+nextId++,release:String(input.release||'v7.0'),status:status,gates:gates,passed:gates.length-failed.length,failed:failed.length,generatedAt:new Date().toISOString(),immutable:true};certificates.push(c);try{if(typeof SCIIP_DECISION_LEDGER!=='undefined')SCIIP_DECISION_LEDGER.record({businessKey:'RELEASE|'+c.release+'|'+c.certificateId,status:status==='CERTIFIED'?'APPROVED':'BLOCKED',rationale:'Release assurance '+status,evidence:c});}catch(e){}try{if(typeof SCIIP_AUDIT_TRAIL!=='undefined')SCIIP_AUDIT_TRAIL.append({businessKey:'RELEASE_AUDIT|'+c.certificateId,eventType:'RELEASE_CERTIFIED',entityId:c.release,payload:c});}catch(e){}return clone_(c);}
  function latest(){return certificates.length?clone_(certificates[certificates.length-1]):null;}
  function list(){return clone_(certificates);}
  function reset(){certificates=[];nextId=1;return true;}
  return {VERSION:VERSION,certify:certify,latest:latest,list:list,reset:reset};
})();
function sciipReleaseAssuranceCertifyV7(input){return SCIIP_RELEASE_ASSURANCE_ENGINE.certify(input||{});}
