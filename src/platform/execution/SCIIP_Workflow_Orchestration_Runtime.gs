var SCIIP_WORKFLOW_ORCHESTRATION_RUNTIME = (function () {
  'use strict';
  function create(){var runs=[],counter=0;
    return {execute:function(definition,context){definition=definition||{};var steps=definition.steps||[];if(!definition.id||!steps.length)throw new Error('INVALID_WORKFLOW_DEFINITION');var run={runId:'RUN-'+(++counter),workflowId:definition.id,status:'RUNNING',steps:[],context:context||{}};
      for(var i=0;i<steps.length;i++){var step=steps[i];if(step.requiresApproval&&!(context&&context.approved===true)){run.status='WAITING_FOR_APPROVAL';run.steps.push({stepId:step.id,status:'BLOCKED_APPROVAL'});runs.push(run);return JSON.parse(JSON.stringify(run));}
        try{var result=step.execute(context||{});run.steps.push({stepId:step.id,status:'COMPLETED',result:result});}catch(e){run.steps.push({stepId:step.id,status:'FAILED',error:String(e.message||e)});run.status='FAILED';runs.push(run);return JSON.parse(JSON.stringify(run));}}
      run.status='COMPLETED';runs.push(run);return JSON.parse(JSON.stringify(run));},history:function(){return JSON.parse(JSON.stringify(runs));}};
  }
  return {create:create};
})();
