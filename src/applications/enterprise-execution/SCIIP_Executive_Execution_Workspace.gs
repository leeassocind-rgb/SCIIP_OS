var SCIIP_EXECUTIVE_EXECUTION_WORKSPACE=(function(){'use strict';
function build(input){input=input||{};return {id:'enterprise-autonomous-execution-work-management',name:'Enterprise Autonomous Execution & Work Management',sections:['execution-summary','initiatives','work-queue','dependencies','critical-path','bottlenecks','sla-monitor','approvals','scorecard','executive-briefing'],scorecard:input.scorecard,criticalPath:input.criticalPath,approvalsPending:Number(input.approvalsPending||0)};}
return {build:build};})();
