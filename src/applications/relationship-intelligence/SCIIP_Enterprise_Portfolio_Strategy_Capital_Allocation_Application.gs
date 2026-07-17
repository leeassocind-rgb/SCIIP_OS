/** Sprint 13 application descriptor and orchestration. */
var SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_APPLICATION=(function(){
  'use strict';
  function descriptor(){return {id:'enterprise-portfolio-strategy-capital-allocation',version:SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.VERSION,workspace:'executive-opportunity-command',northStar:['analyze','manage','act','one-trusted-platform'],dependencies:['epic3-sprint12'],reviewRequired:true,autonomousCapitalDeployment:false,destructiveCommitEnabled:false};}
  function run(input){input=input||{};var allocation=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.allocate(input.actions||[],input.constraints||{});return {descriptor:descriptor(),allocation:allocation,scenarios:SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.scenarios(input.actions||[],input.constraints||{}),mapPoints:SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.mapProjection(allocation),summary:SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.portfolioSummary(allocation)};}
  return {descriptor:descriptor,run:run};
}());
