var SCIIP_S34_PROGRAM_PORTFOLIO_ENGINE=(function(){'use strict';
function build(input){var programs=(input&&input.programs)||[];var initiatives=[];programs.forEach(function(p){(p.initiatives||[]).forEach(function(i){initiatives.push(Object.assign({programId:p.programId},i));});});return {status:'AVAILABLE',programs:programs.length,initiatives:initiatives,initiativeCount:initiatives.length,owners:Array.from(new Set(initiatives.map(function(i){return i.owner||'UNASSIGNED';})))};}
return {build:build};})();
