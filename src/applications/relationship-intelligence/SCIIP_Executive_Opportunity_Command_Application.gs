/** Sprint 9 application facade and North Star declaration. */
var SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND_APPLICATION=(function(){
  'use strict';
  var NORTH_STAR='SCIIP_OS is the operating system for industrial real estate. It ingests market data, preserves history, connects knowledge, powers GIS, and enables professionals to analyze, manage, and act from one trusted platform.';
  function run(input){input=input||{};var discovery=input.discovery;if(!discovery&&typeof SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY!=='undefined')discovery=SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.discover(input.discoveryInput||{});var workspace=SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND.buildWorkspace({opportunities:(discovery&&discovery.opportunities)||input.opportunities||[],properties:input.properties||[],companies:input.companies||[],approvals:input.approvals||[]});return {version:SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND.VERSION,northStar:NORTH_STAR,capabilities:['CONNECTS_KNOWLEDGE','POWERS_GIS','ANALYZE','MANAGE','ACT','ONE_TRUSTED_PLATFORM'],workspace:workspace,briefing:SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND.briefing(workspace),reviewRequired:true,destructiveCommitEnabled:false};}
  return {NORTH_STAR:NORTH_STAR,run:run};
}());
