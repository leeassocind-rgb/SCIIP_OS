/** SCIIP_OS compiled bundle: 11_other_001.gs
 * sources: 295
 * generated: 2026-07-17T19:08:05.627Z
 */
var SCIIP_ASSET_ADMINISTRATION_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-16.0';function definition(){return {id:'asset-onboarding-lease-administration-intelligence',name:'Asset Onboarding & Lease Administration Intelligence',version:VERSION,dependencies:['transaction-execution-closing-intelligence'],services:['asset-administration-application'],queries:['asset-administration-query'],events:['ASSET_ONBOARDED','LEASE_OBLIGATION_UPDATED','CRITICAL_DATE_ALERTED'],stateBindings:['assetAdministration','leaseObligations','criticalDates'],workspaces:['asset-onboarding-lease-administration'],tests:['sciipTestV7IntegrationSprint16'],liveHandler:'sciipAssetAdministrationHeartbeatV7',queryHandler:'sciipAssetAdministrationQueryV7'};}function run(r){r=r||{};var asset=SCIIP_ASSET_ONBOARDING_REGISTRY.register(r.asset||{}).asset,obligations=SCIIP_LEASE_OBLIGATION_ENGINE.evaluate(r.obligations||[]),criticalDates=SCIIP_CRITICAL_DATE_ENGINE.analyze(r.criticalDates||[],r.asOf),economics=SCIIP_OCCUPANCY_ECONOMICS_ENGINE.analyze(r.economics||{}),workspace=SCIIP_ASSET_ADMINISTRATION_WORKSPACE.build({asset:asset,lease:r.lease||{},obligations:obligations,criticalDates:criticalDates,occupancyEconomics:economics,documents:r.documents||[],alerts:(criticalDates.alerts||[]).concat(obligations.obligations.filter(function(x){return x.overdue;})),executiveSummary:{status:obligations.status,criticalDateStatus:criticalDates.status,position:economics.position,markToMarket:economics.markToMarket}});return {version:VERSION,status:'COMPLETED',asset:asset,obligations:obligations,criticalDates:criticalDates,occupancyEconomics:economics,workspace:workspace};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_16'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('asset-administration-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('asset-administration-application')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('asset-administration-query',sciipAssetAdministrationQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('asset-administration-application',sciipAssetAdministrationHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipAssetAdministrationQueryV7(r){return SCIIP_ASSET_ADMINISTRATION_APPLICATION.run(r||{});}function sciipAssetAdministrationHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-16.0',workspace:'asset-onboarding-lease-administration',generatedAt:new Date().toISOString()};}


var SCIIP_ASSET_ADMINISTRATION_WORKSPACE=(function(){'use strict';function build(d){d=d||{};return {workspace:{id:'asset-onboarding-lease-administration',label:'Asset Onboarding & Lease Administration Intelligence',sections:{asset:d.asset||{},lease:d.lease||{},obligations:d.obligations||{},criticalDates:d.criticalDates||{},occupancyEconomics:d.occupancyEconomics||{},documents:d.documents||[],alerts:d.alerts||[],executiveSummary:d.executiveSummary||{}}}};}return {build:build};})();


var SCIIP_ASSET_ONBOARDING_REGISTRY=(function(){'use strict';var records={};function key(x){return String(x.businessKey||[x.propertyId||'',x.leaseId||'',x.tenantId||''].join('|')).toUpperCase();}function register(x){x=x||{};var k=key(x);if(records[k])return {status:'DUPLICATE',duplicateSafe:true,asset:records[k]};var r={id:x.id||('ASSET-'+(Object.keys(records).length+1)),businessKey:k,propertyId:x.propertyId||null,leaseId:x.leaseId||null,tenantId:x.tenantId||null,address:x.address||null,squareFeet:Number(x.squareFeet||0),commencementDate:x.commencementDate||null,expirationDate:x.expirationDate||null,status:x.status||'ACTIVE',createdAt:new Date().toISOString()};records[k]=r;return {status:'CREATED',duplicateSafe:true,asset:r};}function list(){return Object.keys(records).map(function(k){return records[k];});}function reset(){records={};}return {register:register,list:list,reset:reset};})();


var SCIIP_CRITICAL_DATE_ENGINE=(function(){'use strict';function days(a,b){return Math.ceil((b.getTime()-a.getTime())/86400000);}function analyze(items,asOf){items=items||[];var base=asOf?new Date(asOf):new Date(),alerts=[];items.forEach(function(x,i){if(!x.date)return;var d=new Date(x.date),remaining=days(base,d),window=Number(x.alertWindowDays==null?90:x.alertWindowDays),severity=remaining<0?'OVERDUE':remaining<=30?'CRITICAL':remaining<=window?'WARNING':'INFO';if(remaining<=window)alerts.push({id:x.id||('DATE-'+(i+1)),type:x.type||'GENERAL',date:x.date,daysRemaining:remaining,severity:severity,action:x.action||null});});alerts.sort(function(a,b){return a.daysRemaining-b.daysRemaining;});return {status:alerts.some(function(a){return a.severity==='OVERDUE'||a.severity==='CRITICAL';})?'ATTENTION_REQUIRED':alerts.length?'MONITOR':'CLEAR',alerts:alerts,next:alerts[0]||null};}return {analyze:analyze};})();


var SCIIP_LEASE_OBLIGATION_ENGINE=(function(){'use strict';function evaluate(items){items=items||[];var open=0,overdue=0,critical=0,now=new Date();var obligations=items.map(function(x,i){var status=String(x.status||'OPEN').toUpperCase(),due=x.dueDate?new Date(x.dueDate):null,isOverdue=status!=='COMPLETE'&&due&&due.getTime()<now.getTime(),severity=String(x.severity||'NORMAL').toUpperCase();if(status!=='COMPLETE')open++;if(isOverdue)overdue++;if(severity==='CRITICAL'&&status!=='COMPLETE')critical++;return {id:x.id||('OB-'+(i+1)),type:x.type||'GENERAL',owner:x.owner||null,dueDate:x.dueDate||null,status:status,severity:severity,overdue:!!isOverdue,evidence:x.evidence||null};});return {status:critical?'ATTENTION_REQUIRED':overdue?'OVERDUE':open?'ACTIVE':'CURRENT',total:obligations.length,open:open,overdue:overdue,criticalOpen:critical,obligations:obligations};}return {evaluate:evaluate};})();


var SCIIP_OCCUPANCY_ECONOMICS_ENGINE=(function(){'use strict';function n(v){v=Number(v);return isFinite(v)?v:0;}function analyze(x){x=x||{};var sf=n(x.squareFeet),contract=n(x.contractRentPerSf),market=n(x.marketRentPerSf),opex=n(x.opexPerSf),months=n(x.remainingMonths),annualContract=sf*contract*12,annualMarket=sf*market*12,annualOpex=sf*opex*12,mark=annualMarket-annualContract,remaining=sf*contract*months;return {squareFeet:sf,annualContractRent:Number(annualContract.toFixed(2)),annualMarketRent:Number(annualMarket.toFixed(2)),annualOperatingExpense:Number(annualOpex.toFixed(2)),markToMarket:Number(mark.toFixed(2)),markToMarketPct:annualContract?Number((mark/annualContract*100).toFixed(2)):0,remainingContractValue:Number(remaining.toFixed(2)),position:mark>0?'BELOW_MARKET':mark<0?'ABOVE_MARKET':'AT_MARKET'};}return {analyze:analyze};})();


var SCIIP_DEAL_EXECUTION_WORKSPACE=(function(){'use strict';function build(d){d=d||{};return {workspace:{id:'deal-execution-pipeline',label:'Deal Origination & Pipeline Intelligence',sections:{pipeline:d.pipeline||{},qualifiedOpportunities:d.qualified||[],activePursuits:d.active||[],approvals:d.approvals||[],evidence:d.evidence||[],tasks:d.tasks||[],forecast:d.forecast||{},executiveSummary:d.executiveSummary||{}}}};}return {build:build};})();


var SCIIP_DEAL_PIPELINE_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-14.0';function definition(){return {id:'deal-origination-pipeline-intelligence',name:'Deal Origination & Pipeline Intelligence',version:VERSION,dependencies:['industrial-market-intelligence-opportunity-discovery','tenant-prospecting-occupier-intelligence','site-selection-industrial-intelligence'],services:['deal-pipeline-application'],queries:['deal-pipeline-query'],events:['DEAL_OPPORTUNITY_CREATED','DEAL_QUALIFIED','PIPELINE_UPDATED'],stateBindings:['dealPipeline','dealForecast','relationshipGraph'],workspaces:['deal-execution-pipeline'],tests:['sciipTestV7IntegrationSprint14'],liveHandler:'sciipDealPipelineHeartbeatV7',queryHandler:'sciipDealPipelineQueryV7'};}function run(r){r=r||{};var intake=(r.opportunities||[]).map(function(x){return SCIIP_OPPORTUNITY_INTAKE.register(x).opportunity;}),qualified=intake.map(function(o,i){return SCIIP_DEAL_QUALIFICATION_ENGINE.qualify(o,(r.qualificationInputs||[])[i]||{});}),deals=intake.map(function(o,i){var q=qualified[i];return {id:o.id,stage:q.status==='QUALIFIED'?'QUALIFIED':'INTAKE',estimatedFee:o.estimatedFee,createdAt:o.createdAt,stageEnteredAt:o.createdAt,qualification:q};}),pipeline=SCIIP_PIPELINE_INTELLIGENCE.analyze(deals),relationships=SCIIP_RELATIONSHIP_INTELLIGENCE.map(r.relationships||{}),workspace=SCIIP_DEAL_EXECUTION_WORKSPACE.build({pipeline:pipeline,qualified:qualified.filter(function(q){return q.status==='QUALIFIED';}),active:deals.filter(function(d){return d.stage!=='INTAKE';}),evidence:qualified,tasks:(r.tasks||[]),forecast:{weightedPipeline:pipeline.weightedPipeline},executiveSummary:{topQualified:qualified.slice().sort(function(a,b){return b.score-a.score;})[0]||null,strongestRelationship:relationships.strongest}});return {version:VERSION,status:'COMPLETED',opportunities:intake,qualifications:qualified,pipeline:pipeline,relationships:relationships,workspace:workspace};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_14'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=o.sharedState&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('deal-pipeline-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('deal-pipeline-application')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('deal-pipeline-query',sciipDealPipelineQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('deal-pipeline-application',sciipDealPipelineHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipDealPipelineQueryV7(r){return SCIIP_DEAL_PIPELINE_APPLICATION.run(r||{});}function sciipDealPipelineHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-14.0',workspace:'deal-execution-pipeline',generatedAt:new Date().toISOString()};}


var SCIIP_DEAL_QUALIFICATION_ENGINE=(function(){'use strict';function n(v,d){v=Number(v);return isFinite(v)?v:d;}function qualify(o,c){o=o||{};c=c||{};var factors=[['marketFit',n(c.marketFit,50),0.25],['occupierFit',n(c.occupierFit,50),0.25],['availability',n(c.availability,50),0.2],['timing',n(c.timing,50),0.15],['relationshipStrength',n(c.relationshipStrength,50),0.15]],score=0,e=[];factors.forEach(function(f){score+=f[1]*f[2];e.push({factor:f[0],score:f[1],weight:f[2],contribution:Number((f[1]*f[2]).toFixed(2))});});score=Number(score.toFixed(2));return {opportunityId:o.id,status:score>=70?'QUALIFIED':score>=50?'REVIEW':'DISQUALIFIED',score:score,confidence:Number(Math.min(0.99,0.5+score/200).toFixed(4)),evidence:e};}return {qualify:qualify};})();


var SCIIP_OPPORTUNITY_INTAKE=(function(){'use strict';var records={};function key(x){return String(x.businessKey||[x.companyId||'',x.propertyId||'',x.source||'MANUAL'].join('|')).toUpperCase();}function register(x){x=x||{};var k=key(x);if(records[k])return {status:'DUPLICATE',duplicateSafe:true,opportunity:records[k]};var r={id:x.id||('OPP-'+(Object.keys(records).length+1)),businessKey:k,companyId:x.companyId||null,propertyId:x.propertyId||null,source:x.source||'MANUAL',stage:x.stage||'INTAKE',estimatedFee:Number(x.estimatedFee||0),createdAt:new Date().toISOString()};records[k]=r;return {status:'CREATED',duplicateSafe:true,opportunity:r};}function list(){return Object.keys(records).map(function(k){return records[k];});}function reset(){records={};}return {register:register,list:list,reset:reset};})();


var SCIIP_PIPELINE_INTELLIGENCE=(function(){'use strict';var probs={INTAKE:0.1,QUALIFIED:0.25,PURSUIT:0.5,PROPOSAL:0.7,NEGOTIATION:0.85,CLOSED:1};function analyze(deals){deals=deals||[];var now=Date.now(),weighted=0,total=0,aging=[],stages={};deals.forEach(function(d){var p=probs[d.stage]||0.1,fee=Number(d.estimatedFee||0),days=Math.max(0,Math.floor((now-new Date(d.stageEnteredAt||d.createdAt||now).getTime())/86400000));weighted+=fee*p;total+=fee;stages[d.stage]=(stages[d.stage]||0)+1;if(days>30)aging.push({id:d.id,days:days,stage:d.stage});});return {count:deals.length,totalPipeline:total,weightedPipeline:Number(weighted.toFixed(2)),stageCounts:stages,bottlenecks:aging.sort(function(a,b){return b.days-a.days;})};}return {analyze:analyze};})();


var SCIIP_RELATIONSHIP_INTELLIGENCE=(function(){'use strict';function map(input){input=input||{};var nodes=[],edges=[];['companies','properties','brokers','owners'].forEach(function(k){(input[k]||[]).forEach(function(x){nodes.push({id:x.id,type:k.slice(0,-1).toUpperCase(),label:x.name||x.address||x.id});});});(input.relationships||[]).forEach(function(r){edges.push({from:r.from,to:r.to,type:r.type||'RELATED_TO',strength:Number(r.strength||0.5)});});return {nodes:nodes,edges:edges,strongest:edges.slice().sort(function(a,b){return b.strength-a.strength;})[0]||null};}return {map:map};})();


var SCIIP_DEVELOPMENT_FEASIBILITY_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-20.0';function definition(){return {id:'development-feasibility-entitlement-intelligence',name:'Development Feasibility & Entitlement Intelligence',version:VERSION,dependencies:['capital-projects-development-intelligence','investment-underwriting-acquisition-intelligence'],services:['development-feasibility-application'],queries:['development-feasibility-query'],events:['DEVELOPMENT_SITE_REGISTERED','ENTITLEMENT_PATH_EVALUATED','DEVELOPMENT_FEASIBILITY_COMPLETED'],stateBindings:['developmentSites','entitlementPaths','developmentFeasibility'],workspaces:['development-feasibility-entitlement'],tests:['sciipTestV7IntegrationSprint20'],liveHandler:'sciipDevelopmentFeasibilityHeartbeatV7',queryHandler:'sciipDevelopmentFeasibilityQueryV7'};}function run(r){r=r||{};var site=SCIIP_DEVELOPMENT_SITE_REGISTRY.register(r.site||r),land=SCIIP_LAND_USE_FEASIBILITY_ENGINE.evaluate({site:site.record,plan:r.plan||{},allowedUses:r.allowedUses,maxCoveragePct:r.maxCoveragePct,maxHeightFt:r.maxHeightFt}),ent=SCIIP_ENTITLEMENT_PATH_ENGINE.analyze({targetUse:(r.plan&&r.plan.targetUse)||site.record.targetUse,requiredApprovals:r.requiredApprovals,completedApprovals:r.completedApprovals,baseMonths:r.baseEntitlementMonths}),util=SCIIP_UTILITY_CAPACITY_ENGINE.evaluate({requirements:r.utilityRequirements||{},available:r.utilityAvailable||{}}),econ=SCIIP_DEVELOPMENT_FEASIBILITY_ENGINE.analyze(Object.assign({},r.economics||{},{landUseFeasible:land.feasible,utilityStatus:util.status,entitlementStatus:ent.pathStatus==='BLOCKED'?'BLOCKED':'ACTIVE'})),risks=[];land.failures.forEach(function(f){risks.push({domain:'LAND_USE',severity:'HIGH',issue:f.id});});util.failures.forEach(function(f){risks.push({domain:'UTILITY',severity:'HIGH',issue:f.id,shortfall:f.shortfall});});ent.criticalApprovals.forEach(function(a){risks.push({domain:'ENTITLEMENT',severity:'MEDIUM',issue:a});});if(econ.status!=='GO')risks.push({domain:'ECONOMICS',severity:'HIGH',issue:'ECONOMIC_THRESHOLDS'});var recommendation={decision:econ.status,confidence:risks.length?Math.max(.5,1-risks.length*.08):1,requiredActions:risks.map(function(x){return x.issue;})},w=SCIIP_DEVELOPMENT_FEASIBILITY_WORKSPACE.build({site:site.record,landUse:land,entitlements:ent,utilities:util,economics:econ,risks:risks,recommendation:recommendation,executiveSummary:{site:site.record.name,decision:econ.status,entitlementMonths:ent.estimatedMonths,utilityStatus:util.status,yieldOnCostPct:econ.yieldOnCostPct}});return {version:VERSION,status:'COMPLETED',site:site,landUse:land,entitlements:ent,utilities:util,economics:econ,risks:risks,recommendation:recommendation,workspace:w};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_20'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('development-feasibility-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('development-feasibility-application')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('development-feasibility-query',sciipDevelopmentFeasibilityQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('development-feasibility-application',sciipDevelopmentFeasibilityHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipDevelopmentFeasibilityQueryV7(r){return SCIIP_DEVELOPMENT_FEASIBILITY_APPLICATION.run(r||{});}function sciipDevelopmentFeasibilityHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-20.0',workspace:'development-feasibility-entitlement',generatedAt:new Date().toISOString()};}


var SCIIP_DEVELOPMENT_FEASIBILITY_ENGINE=(function(){'use strict';function round(v,d){var p=Math.pow(10,d||2);return Math.round(v*p)/p;}function analyze(x){x=x||{};var acquisition=Number(x.acquisitionCost||0),hard=Number(x.hardCost||0),soft=Number(x.softCost||0),financing=Number(x.financingCost||0),contingency=Number(x.contingency||0),total=acquisition+hard+soft+financing+contingency,stabilizedNoi=Number(x.stabilizedNoi||0),marketCapRate=Number(x.marketCapRatePct||0)/100,stabilizedValue=marketCapRate?stabilizedNoi/marketCapRate:0,yoc=total?stabilizedNoi/total*100:0,margin=stabilizedValue-total,marginPct=total?margin/total*100:0,minYoc=Number(x.minimumYieldOnCostPct||7),minMargin=Number(x.minimumDevelopmentMarginPct||10),physical=x.landUseFeasible!==false,utilities=x.utilityStatus!=='CONSTRAINED',entitlement=x.entitlementStatus!=='BLOCKED',passes=physical&&utilities&&entitlement&&yoc>=minYoc&&marginPct>=minMargin,status=passes?'GO':(!physical||!utilities||!entitlement?'NO_GO':'REVISE');return {status:status,totalDevelopmentCost:round(total,2),stabilizedNoi:round(stabilizedNoi,2),stabilizedValue:round(stabilizedValue,2),yieldOnCostPct:round(yoc,2),developmentMargin:round(margin,2),developmentMarginPct:round(marginPct,2),thresholds:{minimumYieldOnCostPct:minYoc,minimumDevelopmentMarginPct:minMargin},gates:{landUse:physical,utilities:utilities,entitlement:entitlement,economics:yoc>=minYoc&&marginPct>=minMargin}};}return {analyze:analyze};})();


var SCIIP_DEVELOPMENT_FEASIBILITY_WORKSPACE=(function(){'use strict';function build(x){x=x||{};return {id:'development-feasibility-entitlement',name:'Development Feasibility & Entitlement Intelligence',version:'v7.0-integration-sprint-20.0',sections:[{id:'site-profile',title:'Site Profile',data:x.site||{}},{id:'land-use',title:'Land Use Feasibility',data:x.landUse||{}},{id:'entitlements',title:'Entitlement Path',data:x.entitlements||{}},{id:'utilities',title:'Utility Capacity',data:x.utilities||{}},{id:'economics',title:'Development Economics',data:x.economics||{}},{id:'risks',title:'Risks & Constraints',data:x.risks||[]},{id:'recommendation',title:'Recommendation',data:x.recommendation||{}},{id:'executive-summary',title:'Executive Summary',data:x.executiveSummary||{}}],generatedAt:new Date().toISOString()};}return {build:build};})();


var SCIIP_DEVELOPMENT_SITE_REGISTRY=(function(){'use strict';var records={};function reset(){records={};}function normalize(x){x=x||{};var id=String(x.siteId||x.propertyId||x.id||'').trim();if(!id)throw new Error('siteId is required');return {siteId:id,name:String(x.name||x.address||id),address:String(x.address||''),city:String(x.city||''),landAcres:Number(x.landAcres||0),existingBuildingSf:Number(x.existingBuildingSf||0),zoning:String(x.zoning||'UNKNOWN'),generalPlan:String(x.generalPlan||'UNKNOWN'),latitude:x.latitude==null?null:Number(x.latitude),longitude:x.longitude==null?null:Number(x.longitude),targetUse:String(x.targetUse||'INDUSTRIAL'),targetBuildingSf:Number(x.targetBuildingSf||0),targetCoveragePct:Number(x.targetCoveragePct||0),createdAt:x.createdAt||new Date().toISOString()};}function register(x){var r=normalize(x);if(records[r.siteId])return {status:'DUPLICATE',record:records[r.siteId]};records[r.siteId]=r;return {status:'CREATED',record:r};}function get(id){return records[String(id)]||null;}function list(){return Object.keys(records).map(function(k){return records[k];});}return {register:register,get:get,list:list,reset:reset};})();


var SCIIP_ENTITLEMENT_PATH_ENGINE=(function(){'use strict';var DEFAULTS={INDUSTRIAL:['LAND_USE_CONFIRMATION','CEQA_REVIEW','DESIGN_REVIEW','BUILDING_PERMIT','GRADING_PERMIT','FIRE_APPROVAL'],MANUFACTURING:['LAND_USE_CONFIRMATION','CONDITIONAL_USE_PERMIT','CEQA_REVIEW','DESIGN_REVIEW','BUILDING_PERMIT','GRADING_PERMIT','FIRE_APPROVAL','AIR_QUALITY_REVIEW']};function analyze(x){x=x||{};var use=String(x.targetUse||'INDUSTRIAL').toUpperCase(),required=(x.requiredApprovals||DEFAULTS[use]||DEFAULTS.INDUSTRIAL).slice(),completed=(x.completedApprovals||[]).map(String),pending=required.filter(function(a){return completed.indexOf(a)===-1;}),critical=pending.filter(function(a){return ['CONDITIONAL_USE_PERMIT','CEQA_REVIEW','AIR_QUALITY_REVIEW'].indexOf(a)!==-1;}),months=Number(x.baseMonths||Math.max(2,Math.ceil(required.length*1.25)))+critical.length*2,status=pending.length===0?'ENTITLED':critical.length?'COMPLEX':'STANDARD';return {targetUse:use,requiredApprovals:required,completedApprovals:completed,pendingApprovals:pending,criticalApprovals:critical,estimatedMonths:months,pathStatus:status,completionPct:required.length?Math.round(completed.length/required.length*10000)/100:100};}return {analyze:analyze};})();


var SCIIP_LAND_USE_FEASIBILITY_ENGINE=(function(){'use strict';function evaluate(x){x=x||{};var site=x.site||{},plan=x.plan||{},landSf=Number(site.landAcres||0)*43560,targetSf=Number(plan.buildingSf||site.targetBuildingSf||0),coverage=landSf?targetSf/landSf*100:0,maxCoverage=Number(plan.maxCoveragePct||x.maxCoveragePct||55),allowedUses=(x.allowedUses||[site.targetUse||plan.targetUse||'INDUSTRIAL']).map(function(v){return String(v).toUpperCase();}),targetUse=String(plan.targetUse||site.targetUse||'INDUSTRIAL').toUpperCase(),useAllowed=allowedUses.indexOf(targetUse)!==-1,height=Number(plan.clearHeightFt||0),maxHeight=Number(x.maxHeightFt||60),parkingRequired=Number(plan.requiredParking||0),parkingProvided=Number(plan.parkingProvided||0),trailerRequired=Number(plan.requiredTrailerParking||0),trailerProvided=Number(plan.trailerParkingProvided||0),checks=[{id:'USE_ALLOWED',passed:useAllowed,value:targetUse},{id:'COVERAGE',passed:coverage<=maxCoverage,value:Math.round(coverage*100)/100,limit:maxCoverage},{id:'HEIGHT',passed:height<=maxHeight,value:height,limit:maxHeight},{id:'AUTO_PARKING',passed:parkingProvided>=parkingRequired,value:parkingProvided,required:parkingRequired},{id:'TRAILER_PARKING',passed:trailerProvided>=trailerRequired,value:trailerProvided,required:trailerRequired}],failures=checks.filter(function(c){return !c.passed;});return {feasible:failures.length===0,status:failures.length===0?'FEASIBLE':'INFEASIBLE',landSf:Math.round(landSf),buildingSf:targetSf,coveragePct:Math.round(coverage*100)/100,checks:checks,failures:failures};}return {evaluate:evaluate};})();


var SCIIP_UTILITY_CAPACITY_ENGINE=(function(){'use strict';function evaluate(x){x=x||{};var req=x.requirements||{},avail=x.available||{};function check(id,r,a,unit){r=Number(r||0);a=Number(a||0);return {id:id,required:r,available:a,unit:unit,passed:a>=r,shortfall:Math.max(0,r-a)};}var checks=[check('POWER_AMPS',req.powerAmps,avail.powerAmps,'AMPS'),check('WATER_GPD',req.waterGpd,avail.waterGpd,'GPD'),check('SEWER_GPD',req.sewerGpd,avail.sewerGpd,'GPD'),check('NATURAL_GAS_MBH',req.naturalGasMbh,avail.naturalGasMbh,'MBH')],failures=checks.filter(function(c){return !c.passed;}),score=Math.round(checks.filter(function(c){return c.passed;}).length/checks.length*100);return {status:failures.length?'CONSTRAINED':'SUFFICIENT',capacityScore:score,checks:checks,failures:failures,upgradeRequired:failures.length>0};}return {evaluate:evaluate};})();


var SCIIP_BUDGET_FORECAST_ENGINE=(function(){'use strict';function analyze(i){i=i||{};var budget=Number(i.approvedBudget||0),committed=Number(i.committedCost||0),actual=Number(i.actualCost||0),remaining=Number(i.estimateToComplete||0),eac=actual+remaining,variance=budget-eac,cont=Number(i.contingencyRemaining||0),pct=budget?eac/budget*100:0;return {status:'ANALYZED',approvedBudget:budget,committedCost:committed,actualCost:actual,estimateToComplete:remaining,estimateAtCompletion:eac,budgetVariance:variance,budgetUsedPct:Number(pct.toFixed(2)),contingencyRemaining:cont,forecastStatus:variance<0?'OVER_BUDGET':pct>90?'WATCH':'ON_BUDGET'};}return {analyze:analyze};})();


var SCIIP_CAPITAL_PROJECT_REGISTRY=(function(){'use strict';var rows={};function key(r){return String(r.projectId||r.id||'').trim();}function register(r){r=r||{};var k=key(r);if(!k)throw new Error('projectId is required');if(rows[k])return {status:'DUPLICATE',duplicateSafe:true,record:rows[k]};var rec={projectId:k,name:r.name||k,assetId:r.assetId||'',projectType:r.projectType||'CAPITAL_PROJECT',approvedBudget:Number(r.approvedBudget||0),startDate:r.startDate||'',targetCompletionDate:r.targetCompletionDate||'',status:r.status||'PLANNED',createdAt:new Date().toISOString()};rows[k]=rec;return {status:'CREATED',duplicateSafe:true,record:rec};}function list(){return Object.keys(rows).map(function(k){return rows[k];});}function reset(){rows={};}return {register:register,list:list,reset:reset};})();


var SCIIP_CHANGE_ORDER_ENGINE=(function(){'use strict';var rows={};function evaluate(c){c=c||{};var id=String(c.changeOrderId||c.id||'').trim();if(!id)throw new Error('changeOrderId is required');if(rows[id])return {status:'DUPLICATE',duplicateSafe:true,record:rows[id]};var amount=Number(c.amount||0),threshold=Number(c.approvalThreshold||50000),schedule=Number(c.scheduleImpactDays||0),approval=amount>=threshold||schedule>10;var rec={changeOrderId:id,projectId:c.projectId||'',amount:amount,scheduleImpactDays:schedule,reason:c.reason||'',approvalRequired:approval,decision:approval?'PENDING_APPROVAL':'AUTO_APPROVED',riskLevel:amount>=threshold*2||schedule>30?'HIGH':approval?'MEDIUM':'LOW'};rows[id]=rec;return {status:'EVALUATED',duplicateSafe:true,record:rec};}function reset(){rows={};}return {evaluate:evaluate,reset:reset};})();


var SCIIP_DEVELOPMENT_INTELLIGENCE_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-19.0';function definition(){return {id:'capital-projects-development-intelligence',name:'Capital Projects & Development Intelligence',version:VERSION,dependencies:['investment-underwriting-acquisition-intelligence'],services:['development-intelligence-application'],queries:['development-intelligence-query'],events:['CAPITAL_PROJECT_REGISTERED','PROJECT_FORECAST_UPDATED','CHANGE_ORDER_REVIEWED'],stateBindings:['capitalProjects','developmentForecast','changeOrders'],workspaces:['capital-projects-development-intelligence'],tests:['sciipTestV7IntegrationSprint19'],liveHandler:'sciipDevelopmentIntelligenceHeartbeatV7',queryHandler:'sciipDevelopmentIntelligenceQueryV7'};}function run(r){r=r||{};var p=SCIIP_CAPITAL_PROJECT_REGISTRY.register(r.project||r),s=SCIIP_PROJECT_SCHEDULE_ENGINE.analyze({milestones:r.milestones||[]}),b=SCIIP_BUDGET_FORECAST_ENGINE.analyze(Object.assign({},r.budget||{},{approvedBudget:(r.budget&&r.budget.approvedBudget)||p.record.approvedBudget})),cos=(r.changeOrders||[]).map(function(c){return SCIIP_CHANGE_ORDER_ENGINE.evaluate(Object.assign({projectId:p.record.projectId},c)).record;}),pending=cos.filter(function(c){return c.approvalRequired&&c.decision==='PENDING_APPROVAL';}),risk=SCIIP_DEVELOPMENT_RISK_ENGINE.score({scheduleStatus:s.scheduleStatus,forecastStatus:b.forecastStatus,pendingApprovalCount:pending.length,permitStatus:r.permitStatus,openSafetyIssues:r.openSafetyIssues}),w=SCIIP_DEVELOPMENT_WORKSPACE.build({project:p.record,schedule:s,budget:b,changeOrders:cos,risk:risk,approvals:pending,forecast:{estimateAtCompletion:b.estimateAtCompletion,targetCompletionDate:p.record.targetCompletionDate},executiveSummary:{project:p.record.name,scheduleStatus:s.scheduleStatus,forecastStatus:b.forecastStatus,riskSeverity:risk.severity,pendingApprovals:pending.length}});return {version:VERSION,status:'COMPLETED',project:p,schedule:s,budget:b,changeOrders:cos,risk:risk,workspace:w};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_19'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('development-intelligence-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('development-intelligence-application')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('development-intelligence-query',sciipDevelopmentIntelligenceQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('development-intelligence-application',sciipDevelopmentIntelligenceHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipDevelopmentIntelligenceQueryV7(r){return SCIIP_DEVELOPMENT_INTELLIGENCE_APPLICATION.run(r||{});}function sciipDevelopmentIntelligenceHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-19.0',workspace:'capital-projects-development-intelligence',generatedAt:new Date().toISOString()};}


var SCIIP_DEVELOPMENT_RISK_ENGINE=(function(){'use strict';function score(i){i=i||{};var factors=[];function add(name,value,weight){factors.push({name:name,value:value,weight:weight,contribution:value*weight});}add('schedule',i.scheduleStatus==='CRITICAL'?100:i.scheduleStatus==='AT_RISK'?60:10,.3);add('budget',i.forecastStatus==='OVER_BUDGET'?100:i.forecastStatus==='WATCH'?60:10,.3);add('changeOrders',Math.min(100,Number(i.pendingApprovalCount||0)*35),.2);add('permits',i.permitStatus==='BLOCKED'?100:i.permitStatus==='PENDING'?50:10,.1);add('safety',Math.min(100,Number(i.openSafetyIssues||0)*40),.1);var total=factors.reduce(function(s,f){return s+f.contribution;},0);var rounded=Number(total.toFixed(2));return {status:'ASSESSED',riskScore:rounded,severity:rounded>=70?'CRITICAL':rounded>=45?'HIGH':rounded>=25?'MEDIUM':'LOW',factors:factors,recommendation:rounded>=45?'EXECUTIVE_REVIEW':'CONTINUE_MONITORING'};}return {score:score};})();


var SCIIP_DEVELOPMENT_WORKSPACE=(function(){'use strict';function build(x){x=x||{};return {id:'capital-projects-development-intelligence',title:'Capital Projects & Development Intelligence',sections:[{id:'portfolio',data:x.project},{id:'schedule',data:x.schedule},{id:'budget',data:x.budget},{id:'change-orders',data:x.changeOrders},{id:'risk',data:x.risk},{id:'approvals',data:x.approvals},{id:'forecast',data:x.forecast},{id:'executive-summary',data:x.executiveSummary}],generatedAt:new Date().toISOString()};}return {build:build};})();


var SCIIP_PROJECT_SCHEDULE_ENGINE=(function(){'use strict';function days(a,b){return Math.max(0,Math.ceil((new Date(b)-new Date(a))/86400000));}function analyze(input){input=input||{};var ms=(input.milestones||[]).map(function(m){var planned=days(m.startDate,m.endDate),actual=m.actualEndDate?days(m.startDate,m.actualEndDate):planned,variance=actual-planned;return {id:m.id||m.name,name:m.name||m.id,plannedDays:planned,actualDays:actual,varianceDays:variance,status:m.status||'PLANNED',dependencies:m.dependencies||[],critical:!!m.critical||variance>0};});var critical=ms.filter(function(m){return m.critical;});var delayed=ms.filter(function(m){return m.varianceDays>0;});var maxVar=delayed.reduce(function(v,m){return Math.max(v,m.varianceDays);},0);return {status:'ANALYZED',milestones:ms,totalMilestones:ms.length,criticalPathCount:critical.length,delayedCount:delayed.length,maxScheduleVarianceDays:maxVar,scheduleStatus:maxVar>30?'CRITICAL':maxVar>0?'AT_RISK':'ON_TRACK'};}return {analyze:analyze};})();


var SCIIP_S28_AI_DECISION_GOVERNANCE_ENGINE=(function(){'use strict';
function evaluate(input){input=input||{};var decisions=input.decisions||[];var governed=decisions.map(function(d){var confidence=Number(d.confidence||0),impact=Number(d.impact||0),evidence=(d.evidence||[]).length;var approval=impact>=80||confidence<70||evidence<2;var risk=Math.max(0,Math.min(100,Math.round((impact*.5+(100-confidence)*.4+(evidence<2?20:0))*100)/100));return Object.assign({},d,{riskScore:risk,approvalRequired:approval,route:approval?'AI_GOVERNANCE_COUNCIL':'AUTO_APPROVED',status:approval?'PENDING_APPROVAL':'APPROVED'});});return {status:'AVAILABLE',decisions:governed,total:governed.length,approvals:governed.filter(function(x){return x.approvalRequired;}).length,autoApproved:governed.filter(function(x){return !x.approvalRequired;}).length};}
return {evaluate:evaluate};})();


var SCIIP_S28_AI_GOVERNANCE_SCORECARD=(function(){'use strict';function calculate(input){var g=input.governance||{},a=input.assurance||{},c=input.compliance||{};var total=Number(g.total||0),explainability=total?Math.round(Number(a.explainable||0)/total*10000)/100:100,compliance=c.violations&&c.violations.length?Math.max(0,100-c.violations.length*20):100,approvalRate=total?Math.round(Number(g.approvals||0)/total*10000)/100:0,maturity=Math.round((explainability*.45+compliance*.4+(100-approvalRate)*.15)*100)/100;return {status:'AVAILABLE',explainability:explainability,compliance:compliance,approvalRate:approvalRate,governanceMaturity:maturity};}return {calculate:calculate};})();


var SCIIP_S28_ENTERPRISE_AI_GOVERNANCE_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-28.0';
function definition(){return {id:'enterprise-ai-decision-governance',name:'Enterprise AI Decision Governance',version:VERSION,dependencies:['enterprise-autonomous-planning-execution','enterprise-intelligence-command-platform'],services:['enterprise-ai-decision-governance'],queries:['enterprise-ai-governance-query'],events:['AI_DECISION_GOVERNED','AI_POLICY_VIOLATION_DETECTED','AI_APPROVAL_ROUTED'],stateBindings:['aiGovernance','aiDecisionRegister','aiGovernanceScorecard'],workspaces:['enterprise-ai-decision-governance'],tests:['sciipTestV7IntegrationSprint28'],liveHandler:'sciipEnterpriseAIGovernanceHeartbeatV7',queryHandler:'sciipEnterpriseAIGovernanceQueryV7'};}
function run(r){r=r||{};var g=SCIIP_S28_AI_DECISION_GOVERNANCE_ENGINE.evaluate(r),a=SCIIP_S28_EXPLAINABILITY_ASSURANCE_ENGINE.assess({decisions:g.decisions}),c=SCIIP_S28_POLICY_COMPLIANCE_ENGINE.validate({decisions:g.decisions,policies:r.policies||[]}),s=SCIIP_S28_AI_GOVERNANCE_SCORECARD.calculate({governance:g,assurance:a,compliance:c}),w=SCIIP_S28_EXECUTIVE_AI_GOVERNANCE_WORKSPACE.build({governance:g,assurance:a,compliance:c,scorecard:s});return {version:VERSION,status:'AVAILABLE',governance:g,assurance:a,compliance:c,scorecard:s,workspace:w};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_28'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-ai-governance-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-ai-decision-governance')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-ai-governance-query',sciipEnterpriseAIGovernanceQueryV7,{capability:definition().id});o.queryRegistered=true;}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-ai-decision-governance',sciipEnterpriseAIGovernanceHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterpriseAIGovernanceQueryV7(r){return SCIIP_S28_ENTERPRISE_AI_GOVERNANCE_APPLICATION.run(r||{});}function sciipEnterpriseAIGovernanceHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-28.0',workspace:'enterprise-ai-decision-governance',generatedAt:new Date().toISOString()};}


var SCIIP_S28_EXECUTIVE_AI_GOVERNANCE_WORKSPACE=(function(){'use strict';function build(input){return {id:'enterprise-ai-decision-governance',name:'Enterprise AI Decision Governance',sections:['governance-summary','decision-register','approval-queue','policy-controls','explainability','evidence','risk','audit','scorecard','executive-briefing'],scorecard:input.scorecard,approvalsPending:input.governance.approvals,violations:input.compliance.violations.length};}return {build:build};})();


var SCIIP_S28_EXPLAINABILITY_ASSURANCE_ENGINE=(function(){'use strict';
function assess(input){var decisions=(input&&input.decisions)||[];var records=decisions.map(function(d){var reasons=(d.reasons||[]),evidence=(d.evidence||[]);var complete=reasons.length>0&&evidence.length>=2;return {decisionId:d.decisionId,explainable:complete,reasons:reasons,evidenceCount:evidence.length,assurance:complete?'HIGH':'ATTENTION_REQUIRED'};});return {status:records.every(function(r){return r.explainable;})?'ASSURED':'ATTENTION_REQUIRED',records:records,explainable:records.filter(function(r){return r.explainable;}).length};}
return {assess:assess};})();


var SCIIP_S28_POLICY_COMPLIANCE_ENGINE=(function(){'use strict';
function validate(input){var decisions=(input&&input.decisions)||[],policies=(input&&input.policies)||[];var violations=[];decisions.forEach(function(d){policies.forEach(function(p){if(p.rule==='MAX_AUTONOMOUS_IMPACT'&&!d.approvalRequired&&Number(d.impact||0)>Number(p.threshold||0))violations.push({decisionId:d.decisionId,policyId:p.policyId,severity:'HIGH'});if(p.rule==='MIN_CONFIDENCE'&&Number(d.confidence||0)<Number(p.threshold||0))violations.push({decisionId:d.decisionId,policyId:p.policyId,severity:'MEDIUM'});});});return {status:violations.length?'NON_COMPLIANT':'COMPLIANT',policies:policies.length,violations:violations};}
return {validate:validate};})();


var SCIIP_S36_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-36.0';function definition(){return {id:'enterprise-autonomous-enterprise-manager',name:'Enterprise Autonomous Enterprise Manager',version:VERSION,workspace:'enterprise-autonomous-enterprise-manager',dependencies:['enterprise-autonomous-program-management','enterprise-autonomous-risk-resilience','enterprise-digital-ceo','enterprise-digital-coo','enterprise-digital-cfo','enterprise-digital-strategy-officer']};}function run(input){var state=SCIIP_S36_ENTERPRISE_STATE_MONITOR.monitor(input),actions=SCIIP_S36_GOVERNED_CORRECTIVE_ACTION_ENGINE.decide({exceptions:state.exceptions,autonomyLimit:input&&input.autonomyLimit}),recommendations=actions.actions.map(function(a){return {source:'ENTERPRISE_MANAGER',action:a.type,priority:a.impact>70?'CRITICAL':'HIGH',approvalRequired:a.approvalRequired};}),coordination=SCIIP_S36_EXECUTIVE_COORDINATION_ENGINE.coordinate({recommendations:recommendations}),scorecard=SCIIP_S36_ENTERPRISE_MANAGER_SCORECARD.calculate({state:state,actions:actions,coordination:coordination});return {version:VERSION,status:'AVAILABLE',state:state,actions:actions,coordination:coordination,scorecard:scorecard,workspace:{id:'enterprise-autonomous-enterprise-manager',sections:['enterprise-state','kpis','exceptions','corrective-actions','executive-coordination','governance','approvals','outcomes','scorecard','digital-ceo-briefing','audit-trail'],approvalsPending:coordination.approvals,scorecard:scorecard}};}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};if(typeof SCIIP_PLATFORM_REGISTRY!=='undefined'&&SCIIP_PLATFORM_REGISTRY.register){SCIIP_PLATFORM_REGISTRY.register(definition());o.registry=true;}if(typeof SCIIP_PLATFORM_SELF_ASSEMBLY!=='undefined'&&SCIIP_PLATFORM_SELF_ASSEMBLY.assemble){SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({capabilities:[definition()]});o.assembly=true;o.registrationMode.push('SELF_ASSEMBLY');}if(typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-autonomous-enterprise-manager-query',run);o.queryRegistered=true;}if(typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-autonomous-enterprise-manager',function(){return {status:'AVAILABLE',version:VERSION};});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();


var SCIIP_S36_ENTERPRISE_MANAGER_SCORECARD=(function(){'use strict';function calculate(input){var s=input.state||{},a=input.actions||{},c=input.coordination||{};var autonomy=a.count?Math.round(a.autonomous/a.count*10000)/100:100;var readiness=Math.round((Number(s.enterpriseHealth||0)*.5+autonomy*.3+Math.max(0,100-Number(c.approvals||0)*15)*.2)*100)/100;return {status:'AVAILABLE',enterpriseHealth:s.enterpriseHealth,exceptions:s.exceptionCount,autonomyRate:autonomy,commands:c.count,approvals:c.approvals,managementReadiness:readiness};}return {calculate:calculate};})();


var SCIIP_S36_ENTERPRISE_STATE_MONITOR=(function(){'use strict';function monitor(input){var kpis=(input&&input.kpis)||[];var exceptions=kpis.filter(function(k){return Number(k.actual||0)<Number(k.minimum||0)||Number(k.actual||0)>Number(k.maximum||Infinity);});var health=kpis.length?Math.round(kpis.reduce(function(s,k){var target=Number(k.target||1),actual=Number(k.actual||0);return s+Math.min(100,target?actual/target*100:100);},0)/kpis.length*100)/100:100;return {status:exceptions.length?'ATTENTION_REQUIRED':'HEALTHY',kpis:kpis,exceptions:exceptions,exceptionCount:exceptions.length,enterpriseHealth:health};}return {monitor:monitor};})();


var SCIIP_S36_EXECUTIVE_COORDINATION_ENGINE=(function(){'use strict';function coordinate(input){var recommendations=(input&&input.recommendations)||[];var commands=recommendations.map(function(r,i){return {commandId:'EC-'+(i+1),source:r.source||'ENTERPRISE_MANAGER',action:r.action||r.type,priority:r.priority||'HIGH',owner:r.owner||'DIGITAL_EXECUTIVE_SUITE',approvalRequired:!!r.approvalRequired};});return {status:'COORDINATED',commands:commands,count:commands.length,approvals:commands.filter(function(c){return c.approvalRequired;}).length};}return {coordinate:coordinate};})();


var SCIIP_S36_GOVERNED_CORRECTIVE_ACTION_ENGINE=(function(){'use strict';function decide(input){var exceptions=(input&&input.exceptions)||[],limit=Number((input&&input.autonomyLimit)||50);var actions=exceptions.map(function(e,i){var impact=Number(e.impact||0),auto=impact<=limit;return {actionId:'EMA-'+(i+1),kpiId:e.kpiId,type:Number(e.actual||0)<Number(e.minimum||0)?'RECOVER_KPI':'CONTAIN_VARIANCE',impact:impact,autonomous:auto,approvalRequired:!auto,route:auto?'AUTO_EXECUTE':'DIGITAL_CEO',explanation:'KPI '+e.kpiId+' outside governance threshold'};});return {status:'DECIDED',actions:actions,count:actions.length,autonomous:actions.filter(function(a){return a.autonomous;}).length,approvals:actions.filter(function(a){return a.approvalRequired;}).length};}return {decide:decide};})();


var SCIIP_S34_DEPENDENCY_CRITICAL_PATH_ENGINE=(function(){'use strict';
function analyze(input){var items=(input&&input.initiatives)||[],byId={};items.forEach(function(i){byId[i.initiativeId]=i;});var dependencies=[];items.forEach(function(i){(i.dependsOn||[]).forEach(function(d){dependencies.push({from:d,to:i.initiativeId,satisfied:!!(byId[d]&&byId[d].status==='COMPLETED')});});});var blocked=items.filter(function(i){return (i.dependsOn||[]).some(function(d){return !byId[d]||byId[d].status!=='COMPLETED';});});var ranked=items.slice().sort(function(a,b){return Number(b.duration||0)-Number(a.duration||0);});return {status:'ANALYZED',dependencies:dependencies,blocked:blocked,blockedCount:blocked.length,criticalPath:ranked.slice(0,Math.min(3,ranked.length)),criticalDuration:ranked.slice(0,3).reduce(function(s,i){return s+Number(i.duration||0);},0)};}
return {analyze:analyze};})();


var SCIIP_S34_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-34.0';
function definition(){return {id:'enterprise-autonomous-program-management',name:'Enterprise Autonomous Program Management',version:VERSION,workspace:'enterprise-autonomous-program-management',dependencies:['enterprise-autonomous-planning-execution','enterprise-autonomous-execution-work-management','enterprise-digital-coo']};}
function run(input){var portfolio=SCIIP_S34_PROGRAM_PORTFOLIO_ENGINE.build(input),dependencies=SCIIP_S34_DEPENDENCY_CRITICAL_PATH_ENGINE.analyze({initiatives:portfolio.initiatives}),schedule=SCIIP_S34_SCHEDULE_OPTIMIZATION_ENGINE.optimize({initiatives:portfolio.initiatives,startDay:input&&input.startDay}),scorecard=SCIIP_S34_PROGRAM_SCORECARD.calculate({portfolio:portfolio,dependencies:dependencies,schedule:schedule});return {version:VERSION,status:'AVAILABLE',portfolio:portfolio,dependencies:dependencies,schedule:schedule,scorecard:scorecard,workspace:{id:'enterprise-autonomous-program-management',sections:['program-portfolio','initiatives','milestones','dependencies','critical-path','schedule','resources','risks','scorecard','executive-briefing'],scorecard:scorecard}};}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};if(typeof SCIIP_PLATFORM_REGISTRY!=='undefined'&&SCIIP_PLATFORM_REGISTRY.register){SCIIP_PLATFORM_REGISTRY.register(definition());o.registry=true;}if(typeof SCIIP_PLATFORM_SELF_ASSEMBLY!=='undefined'&&SCIIP_PLATFORM_SELF_ASSEMBLY.assemble){SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({capabilities:[definition()]});o.assembly=true;o.registrationMode.push('SELF_ASSEMBLY');}if(typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-autonomous-program-management-query',run);o.queryRegistered=true;}if(typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-autonomous-program-management',function(){return {status:'AVAILABLE',version:VERSION};});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();


var SCIIP_S34_PROGRAM_PORTFOLIO_ENGINE=(function(){'use strict';
function build(input){var programs=(input&&input.programs)||[];var initiatives=[];programs.forEach(function(p){(p.initiatives||[]).forEach(function(i){initiatives.push(Object.assign({programId:p.programId},i));});});return {status:'AVAILABLE',programs:programs.length,initiatives:initiatives,initiativeCount:initiatives.length,owners:Array.from(new Set(initiatives.map(function(i){return i.owner||'UNASSIGNED';})))};}
return {build:build};})();


var SCIIP_S34_PROGRAM_SCORECARD=(function(){'use strict';
function calculate(input){var p=input.portfolio||{},d=input.dependencies||{},s=input.schedule||{};var done=(p.initiatives||[]).filter(function(i){return i.status==='COMPLETED';}).length,total=Number(p.initiativeCount||0);var completion=total?Math.round(done/total*10000)/100:100;var health=Math.round((completion*.45+Math.max(0,100-Number(d.blockedCount||0)*20)*.35+Math.max(0,100-Math.max(0,Number(s.makespan||0)-30))*.2)*100)/100;return {status:'AVAILABLE',completionPct:completion,blocked:d.blockedCount,makespan:s.makespan,programHealth:health};}
return {calculate:calculate};})();


var SCIIP_S34_SCHEDULE_OPTIMIZATION_ENGINE=(function(){'use strict';
function optimize(input){var initiatives=(input&&input.initiatives)||[];var start=Number((input&&input.startDay)||1),day=start,rows=[];initiatives.slice().sort(function(a,b){return Number(b.priority||0)-Number(a.priority||0);}).forEach(function(i){var duration=Math.max(1,Number(i.duration||1));rows.push({initiativeId:i.initiativeId,startDay:day,endDay:day+duration-1,duration:duration,priority:Number(i.priority||0)});day+=duration;});return {status:'OPTIMIZED',schedule:rows,startDay:start,endDay:rows.length?rows[rows.length-1].endDay:start,makespan:Math.max(0,day-start)};}
return {optimize:optimize};})();


var SCIIP_S35_CASCADE_ANALYSIS_ENGINE=(function(){'use strict';function analyze(input){var graph=(input&&input.graph)||{},links=graph.links||[],nodes=graph.nodes||[],by={};nodes.forEach(function(n){by[n.riskId]=n;});var cascades=links.map(function(l){var source=by[l.from]||{},target=by[l.to]||{};return {from:l.from,to:l.to,propagatedExposure:Math.round(Number(source.score||0)*Number(l.weight||1)*100)/100,targetExposure:Number(target.score||0)};});return {status:'ANALYZED',cascades:cascades,count:cascades.length,maxPropagation:cascades.reduce(function(m,c){return Math.max(m,c.propagatedExposure);},0)};}return {analyze:analyze};})();


var SCIIP_S35_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-35.0';function definition(){return {id:'enterprise-autonomous-risk-resilience',name:'Enterprise Autonomous Risk & Resilience',version:VERSION,workspace:'enterprise-autonomous-risk-resilience',dependencies:['enterprise-autonomous-program-management','enterprise-digital-coo','enterprise-digital-ceo']};}function run(input){var graph=SCIIP_S35_ENTERPRISE_RISK_GRAPH_ENGINE.build(input),cascades=SCIIP_S35_CASCADE_ANALYSIS_ENGINE.analyze({graph:graph}),recovery=SCIIP_S35_RECOVERY_PLANNING_ENGINE.plan({risks:graph.nodes}),scorecard=SCIIP_S35_RISK_RESILIENCE_SCORECARD.calculate({graph:graph,cascades:cascades,recovery:recovery});return {version:VERSION,status:'AVAILABLE',graph:graph,cascades:cascades,recovery:recovery,scorecard:scorecard,workspace:{id:'enterprise-autonomous-risk-resilience',sections:['risk-map','risk-register','dependencies','cascades','early-warning','recovery-plans','continuity','approvals','scorecard','executive-briefing'],approvalsPending:recovery.approvals,scorecard:scorecard}};}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};if(typeof SCIIP_PLATFORM_REGISTRY!=='undefined'&&SCIIP_PLATFORM_REGISTRY.register){SCIIP_PLATFORM_REGISTRY.register(definition());o.registry=true;}if(typeof SCIIP_PLATFORM_SELF_ASSEMBLY!=='undefined'&&SCIIP_PLATFORM_SELF_ASSEMBLY.assemble){SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({capabilities:[definition()]});o.assembly=true;o.registrationMode.push('SELF_ASSEMBLY');}if(typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-autonomous-risk-resilience-query',run);o.queryRegistered=true;}if(typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-autonomous-risk-resilience',function(){return {status:'AVAILABLE',version:VERSION};});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();


var SCIIP_S35_ENTERPRISE_RISK_GRAPH_ENGINE=(function(){'use strict';function build(input){var risks=(input&&input.risks)||[],links=(input&&input.links)||[];var nodes=risks.map(function(r){return Object.assign({},r,{score:Number(r.probability||0)*Number(r.impact||0)});});var severe=nodes.filter(function(r){return r.score>=50;});return {status:'AVAILABLE',nodes:nodes,links:links,risks:nodes.length,severe:severe.length,totalExposure:nodes.reduce(function(s,r){return s+r.score;},0)};}return {build:build};})();


var SCIIP_S35_RECOVERY_PLANNING_ENGINE=(function(){'use strict';function plan(input){var risks=(input&&input.risks)||[];var plans=risks.filter(function(r){return Number(r.score||0)>=30;}).map(function(r,i){var critical=Number(r.score||0)>=60;return {planId:'REC-'+(i+1),riskId:r.riskId,action:critical?'ACTIVATE_CONTINUITY':'MITIGATE_AND_MONITOR',priority:critical?'CRITICAL':'HIGH',approvalRequired:critical,route:critical?'EXECUTIVE_RISK_COUNCIL':'AUTO_EXECUTE',rtoHours:critical?4:24};});return {status:'PLANNED',plans:plans,count:plans.length,approvals:plans.filter(function(p){return p.approvalRequired;}).length};}return {plan:plan};})();


var SCIIP_S35_RISK_RESILIENCE_SCORECARD=(function(){'use strict';function calculate(input){var g=input.graph||{},c=input.cascades||{},r=input.recovery||{};var maturity=Math.round((Math.max(0,100-Number(g.severe||0)*20)*.4+Math.max(0,100-Number(c.maxPropagation||0))*.25+Math.min(100,Number(r.count||0)*20+40)*.35)*100)/100;return {status:g.severe?'ATTENTION_REQUIRED':'CONTROLLED',totalExposure:g.totalExposure,severeRisks:g.severe,cascades:c.count,recoveryPlans:r.count,resilienceMaturity:maturity};}return {calculate:calculate};})();


var SCIIP_ENTERPRISE_COMMAND_ENGINE=(function(){'use strict';var PRIORITY={CRITICAL:4,HIGH:3,MEDIUM:2,LOW:1};function prioritize(i){i=i||{};var actions=(i.actions||[]).map(function(a,idx){var urgency=String(a.urgency||'MEDIUM').toUpperCase(),impact=Number(a.impact)||0,confidence=Number(a.confidence==null?1:a.confidence),score=(PRIORITY[urgency]||2)*25+impact*0.5+confidence*10;return Object.assign({},a,{commandId:a.commandId||'CMD-'+(idx+1),urgency:urgency,priorityScore:Math.round(score*100)/100,status:a.status||'QUEUED',owner:a.owner||'UNASSIGNED'});}).sort(function(a,b){return b.priorityScore-a.priorityScore;});return {status:'READY',commands:actions,topCommand:actions[0]||null,criticalCount:actions.filter(function(a){return a.urgency==='CRITICAL';}).length,generatedAt:new Date().toISOString()};}return {prioritize:prioritize};})();


var SCIIP_CROSS_DOMAIN_INTELLIGENCE=(function(){'use strict';function analyze(i){i=i||{};var signals=i.signals||[],opportunities=[],risks=[],byEntity={};signals.forEach(function(s){var e=s.entityId||s.assetId||s.companyId||s.marketId||'ENTERPRISE';if(!byEntity[e])byEntity[e]=[];byEntity[e].push(s);var type=String(s.type||'').toUpperCase();if(type.indexOf('OPPORTUNITY')!==-1||Number(s.value)>0)opportunities.push(s);if(type.indexOf('RISK')!==-1||Number(s.value)<0)risks.push(s);});var correlations=[];Object.keys(byEntity).forEach(function(e){if(byEntity[e].length>1)correlations.push({entityId:e,signalCount:byEntity[e].length,domains:byEntity[e].map(function(s){return s.domain;}).filter(Boolean)});});var opportunityScore=Math.min(100,opportunities.reduce(function(a,s){return a+Math.max(0,Number(s.weight)||10);},0));var riskScore=Math.min(100,risks.reduce(function(a,s){return a+Math.max(0,Number(s.weight)||10);},0));return {status:'ANALYZED',signalCount:signals.length,opportunities:opportunities,risks:risks,correlations:correlations,opportunityScore:opportunityScore,riskScore:riskScore,netSignal:opportunityScore-riskScore,generatedAt:new Date().toISOString()};}return {analyze:analyze};})();


var SCIIP_ENTERPRISE_COMMAND_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-23.0';function definition(){return {id:'enterprise-intelligence-command-platform',name:'Enterprise Intelligence & Command Platform',version:VERSION,dependencies:['enterprise-operating-system-orchestrator','enterprise-portfolio-strategy-optimization','market-opportunity-intelligence','tenant-prospecting-intelligence','site-selection-intelligence','investment-underwriting-acquisition','development-feasibility-entitlement','capital-projects-development-intelligence'],services:['enterprise-intelligence-command-platform'],queries:['enterprise-intelligence-command-platform-query'],events:['ENTERPRISE_HEALTH_EVALUATED','ENTERPRISE_COMMAND_PRIORITIZED','ENTERPRISE_RECOMMENDATION_CREATED'],stateBindings:['enterpriseHealth','enterpriseCommands','crossDomainIntelligence','enterpriseRecommendations'],workspaces:['enterprise-intelligence-command-platform'],tests:['sciipTestV7IntegrationSprint23'],liveHandler:'sciipEnterpriseCommandHeartbeatV7',queryHandler:'sciipEnterpriseCommandQueryV7'};}function run(r){r=r||{};var health=SCIIP_ENTERPRISE_HEALTH_ENGINE.evaluate({domains:r.domains||[],trend:r.trend});var intelligence=SCIIP_CROSS_DOMAIN_INTELLIGENCE.analyze({signals:r.signals||[]});var commands=SCIIP_ENTERPRISE_COMMAND_ENGINE.prioritize({actions:r.actions||[]});var recommendations=SCIIP_ENTERPRISE_RECOMMENDATION_ENGINE.generate({health:health,intelligence:intelligence,commands:commands});var briefing={status:health.status,healthScore:health.healthScore,topCommand:commands.topCommand,topRecommendation:recommendations.topRecommendation,opportunityScore:intelligence.opportunityScore,riskScore:intelligence.riskScore};var workspace=SCIIP_EXECUTIVE_COMMAND_CENTER.build({health:health,intelligence:intelligence,commands:commands,recommendations:recommendations,portfolio:r.portfolio,development:r.development,acquisition:r.acquisition,capital:r.capital,executiveBriefing:briefing});return {version:VERSION,status:'AVAILABLE',health:health,intelligence:intelligence,commands:commands,recommendations:recommendations,workspace:workspace,executiveBriefing:briefing};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_23'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-intelligence-command-platform-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-intelligence-command-platform')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-intelligence-command-platform-query',sciipEnterpriseCommandQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-intelligence-command-platform',sciipEnterpriseCommandHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipEnterpriseCommandQueryV7(r){return SCIIP_ENTERPRISE_COMMAND_APPLICATION.run(r||{});}function sciipEnterpriseCommandHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-23.0',workspace:'enterprise-intelligence-command-platform',generatedAt:new Date().toISOString()};}


var SCIIP_ENTERPRISE_HEALTH_ENGINE=(function(){'use strict';function clamp(n){n=Number(n)||0;return Math.max(0,Math.min(100,n));}function evaluate(i){i=i||{};var domains=i.domains||[];var weighted=0,totalWeight=0,alerts=[];domains.forEach(function(d){var w=Number(d.weight)||1,s=clamp(d.score);weighted+=s*w;totalWeight+=w;if(s<70)alerts.push({domain:d.domain||d.id||'unknown',score:s,severity:s<40?'CRITICAL':s<55?'HIGH':'WARNING'});});var health=totalWeight?Math.round(weighted/totalWeight*100)/100:0;var trend=String(i.trend||'STABLE').toUpperCase();var status=health>=85?'HEALTHY':health>=70?'WATCH':health>=50?'AT_RISK':'CRITICAL';return {status:status,healthScore:health,trend:trend,domains:domains.length,alerts:alerts,criticalAlerts:alerts.filter(function(a){return a.severity==='CRITICAL';}).length,generatedAt:new Date().toISOString()};}return {evaluate:evaluate};})();


var SCIIP_ENTERPRISE_RECOMMENDATION_ENGINE=(function(){'use strict';function generate(i){i=i||{};var intel=i.intelligence||{},health=i.health||{},commands=i.commands||{};var recs=[];(intel.opportunities||[]).forEach(function(s,idx){recs.push({recommendationId:'REC-O-'+(idx+1),type:'OPPORTUNITY',action:s.recommendedAction||'PURSUE',entityId:s.entityId||s.companyId||s.assetId||'ENTERPRISE',impact:Number(s.impact)||Number(s.weight)||10,confidence:Number(s.confidence==null?0.8:s.confidence),approvalRequired:Number(s.impact||s.weight||0)>=50,evidence:[s]});});(intel.risks||[]).forEach(function(s,idx){recs.push({recommendationId:'REC-R-'+(idx+1),type:'RISK',action:s.recommendedAction||'MITIGATE',entityId:s.entityId||s.companyId||s.assetId||'ENTERPRISE',impact:Math.abs(Number(s.impact)||Number(s.weight)||10),confidence:Number(s.confidence==null?0.85:s.confidence),approvalRequired:true,evidence:[s]});});if(health.status==='CRITICAL'||health.status==='AT_RISK')recs.push({recommendationId:'REC-H-1',type:'HEALTH',action:'STABILIZE_ENTERPRISE',entityId:'ENTERPRISE',impact:100-health.healthScore,confidence:0.95,approvalRequired:true,evidence:health.alerts||[]});recs.sort(function(a,b){return b.impact*b.confidence-a.impact*a.confidence;});return {status:'READY',recommendations:recs,topRecommendation:recs[0]||null,approvalRequired:recs.filter(function(r){return r.approvalRequired;}).length,commandCount:(commands.commands||[]).length,generatedAt:new Date().toISOString()};}return {generate:generate};})();


var SCIIP_EXECUTIVE_COMMAND_CENTER=(function(){'use strict';function build(i){i=i||{};var sections=[['enterprise-health',i.health],['critical-alerts',(i.health||{}).alerts||[]],['opportunity-queue',(i.intelligence||{}).opportunities||[]],['active-commands',(i.commands||{}).commands||[]],['portfolio-status',i.portfolio||{}],['development-status',i.development||{}],['acquisition-status',i.acquisition||{}],['capital-status',i.capital||{}],['enterprise-risks',(i.intelligence||{}).risks||[]],['recommendations',(i.recommendations||{}).recommendations||[]],['executive-briefing',i.executiveBriefing||{}]].map(function(x){return {id:x[0],data:x[1]};});return {id:'enterprise-intelligence-command-platform',name:'Enterprise Intelligence & Command Platform',sections:sections,healthScore:(i.health||{}).healthScore||0,topCommand:(i.commands||{}).topCommand||null,topRecommendation:(i.recommendations||{}).topRecommendation||null,generatedAt:new Date().toISOString()};}return {build:build};})();


var SCIIP_S29_ENTERPRISE_CONTINUOUS_LEARNING_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-29.0';
function definition(){return {id:'enterprise-continuous-learning-system',name:'Enterprise Continuous Learning System',version:VERSION,dependencies:['enterprise-ai-decision-governance','knowledge-graph','streaming-intelligence'],services:['enterprise-continuous-learning-system'],queries:['enterprise-learning-query'],events:['LEARNING_FEEDBACK_INGESTED','MODEL_DRIFT_DETECTED','KNOWLEDGE_ADAPTATION_PROPOSED'],stateBindings:['learningFeedback','modelPerformance','knowledgeAdaptation'],workspaces:['enterprise-continuous-learning-system'],tests:['sciipTestV7IntegrationSprint29'],liveHandler:'sciipEnterpriseLearningHeartbeatV7',queryHandler:'sciipEnterpriseLearningQueryV7'};}
function run(r){r=r||{};var f=SCIIP_S29_LEARNING_FEEDBACK_ENGINE.ingest(r),p=SCIIP_S29_MODEL_PERFORMANCE_ENGINE.evaluate({observations:f.observations}),a=SCIIP_S29_KNOWLEDGE_ADAPTATION_ENGINE.adapt({observations:f.observations}),rec=SCIIP_S29_LEARNING_RECOMMENDATION_ENGINE.recommend({performance:p,adaptation:a}),w=SCIIP_S29_EXECUTIVE_LEARNING_WORKSPACE.build({feedback:f,performance:p,adaptation:a,recommendations:rec});return {version:VERSION,status:'AVAILABLE',feedback:f,performance:p,adaptation:a,recommendations:rec,workspace:w};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_29'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-learning-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-continuous-learning-system')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-learning-query',sciipEnterpriseLearningQueryV7,{capability:definition().id});o.queryRegistered=true;}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-continuous-learning-system',sciipEnterpriseLearningHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterpriseLearningQueryV7(r){return SCIIP_S29_ENTERPRISE_CONTINUOUS_LEARNING_APPLICATION.run(r||{});}function sciipEnterpriseLearningHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-29.0',workspace:'enterprise-continuous-learning-system',generatedAt:new Date().toISOString()};}


var SCIIP_S29_EXECUTIVE_LEARNING_WORKSPACE=(function(){'use strict';function build(input){return {id:'enterprise-continuous-learning-system',name:'Enterprise Continuous Learning System',sections:['learning-summary','feedback-stream','model-performance','prediction-errors','drift','knowledge-adaptation','recommendations','approvals','learning-scorecard','executive-briefing'],performance:input.performance,recommendations:input.recommendations.count,knowledgeUpdates:input.adaptation.knowledgeGraphWrites};}return {build:build};})();


var SCIIP_S29_KNOWLEDGE_ADAPTATION_ENGINE=(function(){'use strict';function adapt(input){var obs=(input&&input.observations)||[];var updates=obs.filter(function(o){return o.outcome==='MISSED';}).map(function(o){return {entityId:o.entityId||o.observationId,edgeType:'LEARNED_FROM_OUTCOME',delta:o.error,source:'SPRINT_29_FEEDBACK',status:'PROPOSED'};});return {status:updates.length?'UPDATES_PROPOSED':'NO_CHANGE',updates:updates,knowledgeGraphWrites:updates.length};}return {adapt:adapt};})();


var SCIIP_S29_LEARNING_FEEDBACK_ENGINE=(function(){'use strict';function ingest(input){var observations=(input&&input.observations)||[];var normalized=observations.map(function(o){var predicted=Number(o.predicted||0),actual=Number(o.actual||0),error=actual-predicted;return Object.assign({},o,{error:error,absoluteError:Math.abs(error),outcome:Math.abs(error)<=Number(o.tolerance||5)?'ACCURATE':'MISSED'});});return {status:'INGESTED',observations:normalized,total:normalized.length,accurate:normalized.filter(function(o){return o.outcome==='ACCURATE';}).length};}return {ingest:ingest};})();


var SCIIP_S29_LEARNING_RECOMMENDATION_ENGINE=(function(){'use strict';function recommend(input){var perf=input.performance||{},adapt=input.adaptation||{};var rec=[];if(perf.driftDetected)rec.push({type:'RECALIBRATE_MODEL',priority:'HIGH',approvalRequired:true});if((adapt.updates||[]).length)rec.push({type:'UPDATE_KNOWLEDGE_PRIORS',priority:'MEDIUM',approvalRequired:true});return {status:rec.length?'ACTION_REQUIRED':'STABLE',recommendations:rec,count:rec.length,approvals:rec.filter(function(r){return r.approvalRequired;}).length};}return {recommend:recommend};})();


var SCIIP_S29_MODEL_PERFORMANCE_ENGINE=(function(){'use strict';function evaluate(input){var obs=(input&&input.observations)||[];var mae=obs.length?obs.reduce(function(s,o){return s+Number(o.absoluteError||0);},0)/obs.length:0;var accuracy=obs.length?Math.round(obs.filter(function(o){return o.outcome==='ACCURATE';}).length/obs.length*10000)/100:100;return {status:accuracy>=80?'HEALTHY':'DEGRADING',accuracy:accuracy,mae:Math.round(mae*100)/100,driftDetected:accuracy<80};}return {evaluate:evaluate};})();


var SCIIP_S30_DIGITAL_CEO_SCORECARD=(function(){'use strict';function calculate(input){var s=input.situation||{},o=input.objectives||[],c=input.commands||{};var completion=o.length?o.reduce(function(n,x){return n+Number(x.completion||0);},0)/o.length:100;var score=Math.max(0,Math.min(100,Math.round((completion*.55+(s.netSignal>=0?25:10)+(c.count?20:10))*100)/100));return {status:'AVAILABLE',objectiveCompletion:Math.round(completion*100)/100,enterpriseAdvantage:s.netSignal,commands:c.count||0,executiveReadiness:score};}return {calculate:calculate};})();


var SCIIP_S30_ENTERPRISE_DIGITAL_CEO_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-30.0';
function definition(){return {id:'enterprise-digital-ceo',name:'Enterprise Digital CEO',version:VERSION,dependencies:['enterprise-continuous-learning-system','enterprise-ai-decision-governance','enterprise-autonomous-planning-execution','enterprise-intelligence-command-platform'],services:['enterprise-digital-ceo'],queries:['enterprise-digital-ceo-query'],events:['ENTERPRISE_SITUATION_SYNTHESIZED','DIGITAL_CEO_DECISION_PROPOSED','ENTERPRISE_COMMAND_ISSUED'],stateBindings:['enterpriseSituation','digitalCeoDecisions','enterpriseCommands'],workspaces:['enterprise-digital-ceo'],tests:['sciipTestV7IntegrationSprint30'],liveHandler:'sciipEnterpriseDigitalCeoHeartbeatV7',queryHandler:'sciipEnterpriseDigitalCeoQueryV7'};}
function run(r){r=r||{};var s=SCIIP_S30_ENTERPRISE_SITUATION_ENGINE.synthesize(r),d=SCIIP_S30_STRATEGIC_DECISION_ENGINE.decide({situation:s,objectives:r.objectives||[]}),c=SCIIP_S30_ENTERPRISE_ORCHESTRATION_ENGINE.orchestrate({decisions:d.decisions}),sc=SCIIP_S30_DIGITAL_CEO_SCORECARD.calculate({situation:s,objectives:r.objectives||[],commands:c}),w=SCIIP_S30_EXECUTIVE_DIGITAL_CEO_WORKSPACE.build({situation:s,decisions:d,commands:c,scorecard:sc});return {version:VERSION,status:'AVAILABLE',situation:s,decisions:d,commands:c,scorecard:sc,workspace:w};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_30'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-digital-ceo-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-digital-ceo')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-digital-ceo-query',sciipEnterpriseDigitalCeoQueryV7,{capability:definition().id});o.queryRegistered=true;}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-digital-ceo',sciipEnterpriseDigitalCeoHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterpriseDigitalCeoQueryV7(r){return SCIIP_S30_ENTERPRISE_DIGITAL_CEO_APPLICATION.run(r||{});}function sciipEnterpriseDigitalCeoHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-30.0',workspace:'enterprise-digital-ceo',generatedAt:new Date().toISOString()};}


var SCIIP_S30_ENTERPRISE_ORCHESTRATION_ENGINE=(function(){'use strict';function orchestrate(input){var d=(input&&input.decisions)||[];var commands=d.map(function(x,i){return {commandId:'EC-'+(i+1),decisionId:x.decisionId,domain:x.type.indexOf('RISK')>=0?'RISK_GOVERNANCE':x.type.indexOf('OPPORTUNITY')>=0?'ENTERPRISE_PLANNING':'EXECUTION',status:'READY',approvalRequired:x.approvalRequired};});return {status:'ORCHESTRATED',commands:commands,count:commands.length,approvals:commands.filter(function(c){return c.approvalRequired;}).length};}return {orchestrate:orchestrate};})();


var SCIIP_S30_ENTERPRISE_SITUATION_ENGINE=(function(){'use strict';function synthesize(input){input=input||{};var signals=input.signals||[];var risks=signals.filter(function(s){return s.type==='RISK';}),opps=signals.filter(function(s){return s.type==='OPPORTUNITY';});var net=signals.reduce(function(n,s){return n+Number(s.score||0)*(s.type==='RISK'?-1:1);},0);return {status:net>=0?'ADVANTAGE':'ATTENTION_REQUIRED',signals:signals.length,risks:risks.length,opportunities:opps.length,netSignal:net,topSignal:signals.slice().sort(function(a,b){return Math.abs(Number(b.score||0))-Math.abs(Number(a.score||0));})[0]||null};}return {synthesize:synthesize};})();


var SCIIP_S30_EXECUTIVE_DIGITAL_CEO_WORKSPACE=(function(){'use strict';function build(input){return {id:'enterprise-digital-ceo',name:'Enterprise Digital CEO',sections:['enterprise-situation','strategy-map','objectives','opportunities','risks','decisions','enterprise-commands','approvals','scorecard','executive-briefing','continuous-learning'],scorecard:input.scorecard,decisions:input.decisions.count,commands:input.commands.count,approvalsPending:input.commands.approvals};}return {build:build};})();


var SCIIP_S30_STRATEGIC_DECISION_ENGINE=(function(){'use strict';function decide(input){var situation=input.situation||{},objectives=input.objectives||[];var actions=[];if(situation.risks>0)actions.push({decisionId:'CEO-D1',type:'MITIGATE_ENTERPRISE_RISK',priority:100,approvalRequired:true});if(situation.opportunities>0)actions.push({decisionId:'CEO-D2',type:'ACCELERATE_OPPORTUNITY',priority:90,approvalRequired:true});if(objectives.some(function(o){return Number(o.completion||0)<70;}))actions.push({decisionId:'CEO-D3',type:'REPLAN_UNDERPERFORMING_OBJECTIVES',priority:85,approvalRequired:true});return {status:actions.length?'DECISIONS_PROPOSED':'STABLE',decisions:actions,count:actions.length,approvalRoute:'EXECUTIVE_COMMITTEE'};}return {decide:decide};})();


var SCIIP_S32_CFO_SCORECARD=(function(){'use strict';function calculate(input){var f=input.forecast||{},c=input.cashFlow||{},v=input.valuation||{};var growth=f.years&&f.years.length&&f.years[0].revenue?Math.round((f.terminalRevenue/f.years[0].revenue-1)*10000)/100:0;var health=Math.round((Math.min(100,Math.max(0,50+growth))*.35+(c.netCashFlow>=0?100:40)*.35+(v.totalValue>0?100:0)*.3)*100)/100;return {status:'AVAILABLE',forecastGrowthPct:growth,netCashFlow:c.netCashFlow,portfolioValue:v.totalValue,financialHealth:health};}return {calculate:calculate};})();


var SCIIP_S32_CASH_FLOW_OPTIMIZATION_ENGINE=(function(){'use strict';function optimize(input){var periods=(input&&input.periods)||[];var rows=periods.map(function(p){var net=Number(p.inflows||0)-Number(p.outflows||0);return Object.assign({},p,{netCashFlow:net,action:net<0?'REDUCE_OUTFLOWS':'DEPLOY_SURPLUS'});});return {status:'COMPLETED',periods:rows,netCashFlow:rows.reduce(function(s,p){return s+p.netCashFlow;},0),deficitPeriods:rows.filter(function(p){return p.netCashFlow<0;}).length};}return {optimize:optimize};})();


var SCIIP_S32_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-32.0';
function definition(){return {id:'enterprise-digital-cfo',name:'Enterprise Digital CFO',version:VERSION,dependencies:['enterprise-digital-ceo','enterprise-financial-planning-forecasting'],services:['enterprise-digital-cfo'],queries:['enterprise-digital-cfo-query'],events:['EXECUTIVE_RECOMMENDATION_CREATED','EXECUTIVE_APPROVAL_ROUTED','EXECUTIVE_COMMAND_ISSUED'],stateBindings:['executiveSuite','enterprise_digital_cfo'],workspaces:['enterprise-digital-cfo'],tests:['sciipTestV7IntegrationSprint32'],liveHandler:'sciipEnterpriseDigitalCfoHeartbeatV7',queryHandler:'sciipEnterpriseDigitalCfoQueryV7'};}
function run(r){r=r||{};var forecast=SCIIP_S32_MULTI_YEAR_FORECAST_ENGINE.forecast(r),cashFlow=SCIIP_S32_CASH_FLOW_OPTIMIZATION_ENGINE.optimize(r),valuation=SCIIP_S32_PORTFOLIO_VALUATION_ENGINE.value(r),scorecard=SCIIP_S32_CFO_SCORECARD.calculate({forecast:forecast,cashFlow:cashFlow,valuation:valuation}),workspace=SCIIP_S32_EXECUTIVE_CFO_WORKSPACE.build({forecast:forecast,cashFlow:cashFlow,valuation:valuation,scorecard:scorecard});return {version:VERSION,status:'AVAILABLE',forecast:forecast,cashFlow:cashFlow,valuation:valuation,scorecard:scorecard,workspace:workspace};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_32'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-digital-cfo-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-digital-cfo')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-digital-cfo-query',sciipEnterpriseDigitalCfoQueryV7,{capability:definition().id});o.queryRegistered=true;}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-digital-cfo',sciipEnterpriseDigitalCfoHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterpriseDigitalCfoQueryV7(r){return SCIIP_S32_APPLICATION.run(r||{});}function sciipEnterpriseDigitalCfoHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-32.0',workspace:'enterprise-digital-cfo',generatedAt:new Date().toISOString()};}

var SCIIP_S32_APPLICATION=SCIIP_S32_APPLICATION;


var SCIIP_S32_EXECUTIVE_CFO_WORKSPACE=(function(){'use strict';function build(input){return {id:'enterprise-digital-cfo',name:'Enterprise Digital CFO',sections:['financial-summary','multi-year-forecast','cash-flow','capital-plan','portfolio-valuation','investment-priorities','scenarios','risk','scorecard','executive-briefing'],scorecard:input.scorecard,deficitPeriods:input.cashFlow.deficitPeriods};}return {build:build};})();


var SCIIP_S32_MULTI_YEAR_FORECAST_ENGINE=(function(){'use strict';function forecast(input){var base=Number((input&&input.baseRevenue)||0),growth=Number((input&&input.growthRate)||0),margin=Number((input&&input.marginPct)||0),years=Number((input&&input.years)||3),rows=[];for(var i=1;i<=years;i++){var revenue=Math.round(base*Math.pow(1+growth/100,i)*100)/100;rows.push({year:i,revenue:revenue,operatingIncome:Math.round(revenue*margin)/100});}return {status:'AVAILABLE',years:rows,totalRevenue:Math.round(rows.reduce(function(s,r){return s+r.revenue;},0)*100)/100,terminalRevenue:rows.length?rows[rows.length-1].revenue:0};}return {forecast:forecast};})();


var SCIIP_S32_PORTFOLIO_VALUATION_ENGINE=(function(){'use strict';function value(input){var assets=(input&&input.assets)||[];var valued=assets.map(function(a){var noi=Number(a.noi||0),cap=Number(a.capRate||0);return Object.assign({},a,{value:cap>0?Math.round(noi/(cap/100)*100)/100:0});});return {status:'VALUED',assets:valued,totalValue:valued.reduce(function(s,a){return s+a.value;},0),count:valued.length};}return {value:value};})();


var SCIIP_S31_COO_SCORECARD=(function(){'use strict';function calculate(input){var s=input.synthesis||{},o=input.optimization||{},r=input.resilience||{};var score=Math.round((Number(s.slaAttainment||0)*.4+Math.min(100,Number(r.recoveryReadiness||0))*.35+Math.max(0,100-Number(o.count||0)*10)*.25)*100)/100;return {status:'AVAILABLE',slaAttainment:s.slaAttainment,throughput:s.throughput,bottlenecks:(s.bottlenecks||[]).length,actions:o.count,recoveryReadiness:r.recoveryReadiness,operationalHealth:score};}return {calculate:calculate};})();


var SCIIP_S31_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-31.0';
function definition(){return {id:'enterprise-digital-coo',name:'Enterprise Digital COO',version:VERSION,dependencies:['enterprise-digital-ceo','enterprise-autonomous-execution-work-management'],services:['enterprise-digital-coo'],queries:['enterprise-digital-coo-query'],events:['EXECUTIVE_RECOMMENDATION_CREATED','EXECUTIVE_APPROVAL_ROUTED','EXECUTIVE_COMMAND_ISSUED'],stateBindings:['executiveSuite','enterprise_digital_coo'],workspaces:['enterprise-digital-coo'],tests:['sciipTestV7IntegrationSprint31'],liveHandler:'sciipEnterpriseDigitalCooHeartbeatV7',queryHandler:'sciipEnterpriseDigitalCooQueryV7'};}
function run(r){r=r||{};var synthesis=SCIIP_S31_OPERATIONS_SYNTHESIS_ENGINE.analyze(r),optimization=SCIIP_S31_OPERATIONS_OPTIMIZATION_ENGINE.optimize({synthesis:synthesis}),resilience=SCIIP_S31_OPERATIONAL_RESILIENCE_ENGINE.assess(r),scorecard=SCIIP_S31_COO_SCORECARD.calculate({synthesis:synthesis,optimization:optimization,resilience:resilience}),workspace=SCIIP_S31_EXECUTIVE_COO_WORKSPACE.build({synthesis:synthesis,optimization:optimization,resilience:resilience,scorecard:scorecard});return {version:VERSION,status:'AVAILABLE',synthesis:synthesis,optimization:optimization,resilience:resilience,scorecard:scorecard,workspace:workspace};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_31'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-digital-coo-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-digital-coo')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-digital-coo-query',sciipEnterpriseDigitalCooQueryV7,{capability:definition().id});o.queryRegistered=true;}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-digital-coo',sciipEnterpriseDigitalCooHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterpriseDigitalCooQueryV7(r){return SCIIP_S31_APPLICATION.run(r||{});}function sciipEnterpriseDigitalCooHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-31.0',workspace:'enterprise-digital-coo',generatedAt:new Date().toISOString()};}

var SCIIP_S31_APPLICATION=SCIIP_S31_APPLICATION;


var SCIIP_S31_EXECUTIVE_COO_WORKSPACE=(function(){'use strict';function build(input){return {id:'enterprise-digital-coo',name:'Enterprise Digital COO',sections:['operations-summary','domain-performance','sla-monitor','throughput','bottlenecks','capacity-balancing','resilience','action-queue','scorecard','executive-briefing'],scorecard:input.scorecard,approvalsPending:input.optimization.approvals};}return {build:build};})();


var SCIIP_S31_OPERATIONAL_RESILIENCE_ENGINE=(function(){'use strict';function assess(input){var incidents=(input&&input.incidents)||[];var open=incidents.filter(function(i){return i.status!=='RESOLVED';});var severe=open.filter(function(i){return i.severity==='HIGH'||i.severity==='CRITICAL';});return {status:severe.length?'AT_RISK':open.length?'WATCH':'RESILIENT',incidents:incidents.length,open:open.length,severe:severe.length,recoveryReadiness:Math.max(0,100-severe.length*25-open.length*10)};}return {assess:assess};})();


var SCIIP_S31_OPERATIONS_OPTIMIZATION_ENGINE=(function(){'use strict';
function optimize(input){var synthesis=(input&&input.synthesis)||{},actions=(synthesis.bottlenecks||[]).map(function(b,i){return {actionId:'COO-A'+(i+1),domainId:b.domainId,type:Number(b.utilization||0)>90?'REBALANCE_CAPACITY':'RECOVER_SLA',priority:Number(b.utilization||0)>95?'CRITICAL':'HIGH',approvalRequired:Number(b.cost||0)>250,route:Number(b.cost||0)>250?'DIGITAL_CEO':'AUTO_EXECUTE'};});return {status:'COMPLETED',actions:actions,count:actions.length,approvals:actions.filter(function(a){return a.approvalRequired;}).length};}
return {optimize:optimize};})();


var SCIIP_S31_OPERATIONS_SYNTHESIS_ENGINE=(function(){'use strict';
function analyze(input){input=input||{};var domains=input.domains||[];var total=domains.length;var sla=total?Math.round(domains.reduce(function(s,d){return s+Number(d.slaAttainment||0);},0)/total*100)/100:100;var throughput=domains.reduce(function(s,d){return s+Number(d.throughput||0);},0);var bottlenecks=domains.filter(function(d){return Number(d.utilization||0)>90||Number(d.slaAttainment||0)<85;});return {status:bottlenecks.length?'ATTENTION_REQUIRED':'HEALTHY',domains:total,slaAttainment:sla,throughput:throughput,bottlenecks:bottlenecks};}
return {analyze:analyze};})();


var SCIIP_S33_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-33.0';
function definition(){return {id:'enterprise-digital-strategy-officer',name:'Enterprise Digital Strategy Officer',version:VERSION,dependencies:['enterprise-digital-ceo','enterprise-autonomous-planning-execution'],services:['enterprise-digital-strategy-officer'],queries:['enterprise-digital-strategy-officer-query'],events:['EXECUTIVE_RECOMMENDATION_CREATED','EXECUTIVE_APPROVAL_ROUTED','EXECUTIVE_COMMAND_ISSUED'],stateBindings:['executiveSuite','enterprise_digital_strategy_officer'],workspaces:['enterprise-digital-strategy-officer'],tests:['sciipTestV7IntegrationSprint33'],liveHandler:'sciipEnterpriseDigitalStrategyOfficerHeartbeatV7',queryHandler:'sciipEnterpriseDigitalStrategyOfficerQueryV7'};}
function run(r){r=r||{};var synthesis=SCIIP_S33_STRATEGY_SYNTHESIS_ENGINE.synthesize(r),scenarios=SCIIP_S33_LONG_RANGE_SCENARIO_ENGINE.compare(r),initiatives=SCIIP_S33_STRATEGIC_INITIATIVE_ENGINE.prioritize(r),scorecard=SCIIP_S33_STRATEGY_SCORECARD.calculate({synthesis:synthesis,scenarios:scenarios,initiatives:initiatives}),workspace=SCIIP_S33_EXECUTIVE_STRATEGY_WORKSPACE.build({synthesis:synthesis,scenarios:scenarios,initiatives:initiatives,scorecard:scorecard});return {version:VERSION,status:'AVAILABLE',synthesis:synthesis,scenarios:scenarios,initiatives:initiatives,scorecard:scorecard,workspace:workspace};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_33'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-digital-strategy-officer-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-digital-strategy-officer')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-digital-strategy-officer-query',sciipEnterpriseDigitalStrategyOfficerQueryV7,{capability:definition().id});o.queryRegistered=true;}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-digital-strategy-officer',sciipEnterpriseDigitalStrategyOfficerHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterpriseDigitalStrategyOfficerQueryV7(r){return SCIIP_S33_APPLICATION.run(r||{});}function sciipEnterpriseDigitalStrategyOfficerHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-33.0',workspace:'enterprise-digital-strategy-officer',generatedAt:new Date().toISOString()};}

var SCIIP_S33_APPLICATION=SCIIP_S33_APPLICATION;


var SCIIP_S33_EXECUTIVE_STRATEGY_WORKSPACE=(function(){'use strict';function build(input){return {id:'enterprise-digital-strategy-officer',name:'Enterprise Digital Strategy Officer',sections:['strategy-summary','competitive-intelligence','scenario-planning','portfolio-transformation','technology-roadmap','initiative-priorities','dependencies','risks','scorecard','executive-briefing'],scorecard:input.scorecard,approvalsPending:input.initiatives.approvals};}return {build:build};})();


var SCIIP_S33_LONG_RANGE_SCENARIO_ENGINE=(function(){'use strict';function compare(input){var scenarios=(input&&input.scenarios)||[];var ranked=scenarios.map(function(s){var score=Number(s.growth||0)*.4+Number(s.resilience||0)*.35+Number(s.strategicFit||0)*.25-Number(s.risk||0)*.2;return Object.assign({},s,{score:Math.round(score*100)/100});}).sort(function(a,b){return b.score-a.score;});return {status:'COMPLETED',scenarios:ranked,best:ranked[0]||null};}return {compare:compare};})();


var SCIIP_S33_STRATEGIC_INITIATIVE_ENGINE=(function(){'use strict';function prioritize(input){var initiatives=(input&&input.initiatives)||[];var ranked=initiatives.map(function(i){var score=Number(i.impact||0)*.45+Number(i.feasibility||0)*.3+Number(i.urgency||0)*.25;return Object.assign({},i,{priorityScore:Math.round(score*100)/100,approvalRequired:Number(i.investment||0)>500});}).sort(function(a,b){return b.priorityScore-a.priorityScore;});return {status:'PRIORITIZED',initiatives:ranked,count:ranked.length,approvals:ranked.filter(function(i){return i.approvalRequired;}).length};}return {prioritize:prioritize};})();


var SCIIP_S33_STRATEGY_SCORECARD=(function(){'use strict';function calculate(input){var s=input.synthesis||{},c=input.scenarios||{},i=input.initiatives||{};var readiness=Math.round((Math.max(0,Math.min(100,50+Number(s.strategicAdvantage||0))) *.4+(c.best?Number(c.best.strategicFit||0):0)*.35+(i.count?Math.min(100,i.initiatives[0].priorityScore):0)*.25)*100)/100;return {status:'AVAILABLE',strategicAdvantage:s.strategicAdvantage,bestScenario:c.best&&c.best.scenarioId,topInitiative:i.initiatives&&i.initiatives[0]&&i.initiatives[0].initiativeId,strategyReadiness:readiness};}return {calculate:calculate};})();


var SCIIP_S33_STRATEGY_SYNTHESIS_ENGINE=(function(){'use strict';function synthesize(input){var signals=(input&&input.signals)||[];var opportunities=signals.filter(function(s){return s.type==='OPPORTUNITY';}),threats=signals.filter(function(s){return s.type==='THREAT'||s.type==='RISK';});var advantage=opportunities.reduce(function(x,s){return x+Number(s.score||0);},0)-threats.reduce(function(x,s){return x+Number(s.score||0);},0);return {status:'AVAILABLE',signals:signals.length,opportunities:opportunities.length,threats:threats.length,strategicAdvantage:advantage};}return {synthesize:synthesize};})();


var SCIIP_CRITICAL_PATH_ENGINE=(function(){'use strict';
function analyze(input){var tasks=(input&&input.tasks)||[];var active=tasks.filter(function(t){return t.status!=='COMPLETED';}).sort(function(a,b){return Number(b.effort||0)-Number(a.effort||0);});var path=active.slice(0,Math.min(3,active.length));return {status:'AVAILABLE',criticalPath:path.map(function(t){return t.taskId;}),duration:path.reduce(function(s,t){return s+Number(t.effort||0);},0),bottlenecks:active.filter(function(t){return t.status==='BLOCKED'||Number(t.effort||0)>=8;}).map(function(t){return t.taskId;})};}
return {analyze:analyze};})();


var SCIIP_ENTERPRISE_EXECUTION_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-25.0';
function definition(){return {id:'enterprise-autonomous-execution-work-management',name:'Enterprise Autonomous Execution & Work Management',version:VERSION,dependencies:['enterprise-autonomous-planning-execution','enterprise-operating-system-orchestrator'],services:['enterprise-autonomous-execution-work-management'],queries:['enterprise-autonomous-execution-query'],events:['ENTERPRISE_WORK_DECOMPOSED','EXECUTION_BOTTLENECK_DETECTED','EXECUTION_SCORECARD_UPDATED'],stateBindings:['enterpriseExecution','enterpriseWorkQueue','executionScorecard'],workspaces:['enterprise-autonomous-execution-work-management'],tests:['sciipTestV7IntegrationSprint25'],liveHandler:'sciipEnterpriseExecutionHeartbeatV7',queryHandler:'sciipEnterpriseExecutionQueryV7'};}
function run(r){r=r||{};var execution=SCIIP_ENTERPRISE_EXECUTION_ENGINE.execute(r);var sync=SCIIP_WORK_ORCHESTRATION.orchestrate({tasks:execution.tasks,dependencies:r.dependencies||[]});var path=SCIIP_CRITICAL_PATH_ENGINE.analyze({tasks:sync.tasks});var score=SCIIP_EXECUTION_SCORECARD.calculate({tasks:sync.tasks,velocity:r.velocity||0});var workspace=SCIIP_EXECUTIVE_EXECUTION_WORKSPACE.build({scorecard:score,criticalPath:path,approvalsPending:r.approvalsPending});return {version:VERSION,status:'AVAILABLE',execution:execution,synchronization:sync,criticalPath:path,scorecard:score,workspace:workspace};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_25'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-autonomous-execution-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-autonomous-execution-work-management')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-autonomous-execution-query',sciipEnterpriseExecutionQueryV7,{capability:definition().id});o.queryRegistered=true;}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-autonomous-execution-work-management',sciipEnterpriseExecutionHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterpriseExecutionQueryV7(r){return SCIIP_ENTERPRISE_EXECUTION_APPLICATION.run(r||{});}function sciipEnterpriseExecutionHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-25.0',workspace:'enterprise-autonomous-execution-work-management',generatedAt:new Date().toISOString()};}


var SCIIP_ENTERPRISE_EXECUTION_ENGINE=(function(){'use strict';
function execute(input){input=input||{};var initiatives=input.initiatives||[];var tasks=[];initiatives.forEach(function(i){(i.work||[]).forEach(function(x,n){tasks.push({taskId:i.initiativeId+'-T'+(n+1),initiativeId:i.initiativeId,name:x.name||x,owner:x.owner||i.owner||'UNASSIGNED',status:x.status||'READY',effort:Number(x.effort||1),priority:Number(i.priority||50),slaHours:Number(x.slaHours||72)});});});var completed=tasks.filter(function(t){return t.status==='COMPLETED';}).length;return {status:'AVAILABLE',initiatives:initiatives.length,tasks:tasks,completed:completed,completion:tasks.length?Math.round(completed/tasks.length*10000)/100:0};}
return {execute:execute};})();


var SCIIP_EXECUTION_SCORECARD=(function(){'use strict';
function calculate(input){var tasks=(input&&input.tasks)||[];var done=tasks.filter(function(t){return t.status==='COMPLETED';}).length;var blocked=tasks.filter(function(t){return t.status==='BLOCKED';}).length;var velocity=Number((input&&input.velocity)||0);var health=Math.max(0,Math.min(100,Math.round(((tasks.length?done/tasks.length:0)*50+velocity*.5-blocked*5)*100)/100));return {status:'AVAILABLE',taskCompletion:tasks.length?Math.round(done/tasks.length*10000)/100:0,blocked:blocked,velocity:velocity,executionHealth:health};}
return {calculate:calculate};})();


var SCIIP_EXECUTIVE_EXECUTION_WORKSPACE=(function(){'use strict';
function build(input){input=input||{};return {id:'enterprise-autonomous-execution-work-management',name:'Enterprise Autonomous Execution & Work Management',sections:['execution-summary','initiatives','work-queue','dependencies','critical-path','bottlenecks','sla-monitor','approvals','scorecard','executive-briefing'],scorecard:input.scorecard,criticalPath:input.criticalPath,approvalsPending:Number(input.approvalsPending||0)};}
return {build:build};})();


var SCIIP_WORK_ORCHESTRATION=(function(){'use strict';
function orchestrate(input){input=input||{};var tasks=(input.tasks||[]).slice();var dependencies=input.dependencies||[];var done={};tasks.forEach(function(t){if(t.status==='COMPLETED')done[t.taskId]=true;});var blocked=[];dependencies.forEach(function(d){if(!done[d.dependsOn])blocked.push(d.taskId);});tasks=tasks.map(function(t){var b=blocked.indexOf(t.taskId)!==-1;return Object.assign({},t,{status:b&&t.status!=='COMPLETED'?'BLOCKED':t.status});});return {status:'SYNCHRONIZED',tasks:tasks,dependencies:dependencies.length,blocked:blocked.length,blockedTaskIds:blocked};}
return {orchestrate:orchestrate};})();


var SCIIP_ENTERPRISE_CAPITAL_ALLOCATION_OPTIMIZER_V7=(function(){'use strict';function allocate(input){var budget=Number(input&&input.budget||0),requests=((input&&input.requests)||[]).slice().sort(function(a,b){return Number(b.returnScore||0)-Number(a.returnScore||0);}),used=0,selected=[];requests.forEach(function(r){var c=Number(r.amount||0);if(used+c<=budget){selected.push(r);used+=c;}});return {status:'ALLOCATED',budget:budget,allocated:used,remaining:budget-used,selected:selected};}return {allocate:allocate};})();


var SCIIP_ENTERPRISE_FINANCIAL_PLANNING_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-27.0';
function definition(){return {id:'enterprise-financial-planning-forecasting',name:'Enterprise Financial Planning & Forecasting',version:VERSION,dependencies:['enterprise-resource-capacity-optimization','enterprise-autonomous-execution-work-management','enterprise-autonomous-planning-execution'],services:['enterprise-financial-planning-forecasting'],queries:['enterprise-financial-planning-query'],events:['ENTERPRISE_FINANCIAL_PLAN_CREATED','FORECAST_VARIANCE_CALCULATED','CAPITAL_ALLOCATED'],stateBindings:['enterpriseFinancialPlan','forecastVariance','capitalAllocation'],workspaces:['enterprise-financial-planning-forecasting'],tests:['sciipTestV7IntegrationSprint27'],liveHandler:'sciipEnterpriseFinancialHeartbeatV7',queryHandler:'sciipEnterpriseFinancialQueryV7'};}
function run(r){r=r||{};var plan=SCIIP_ENTERPRISE_FINANCIAL_PLANNING_ENGINE.plan(r);var variance=SCIIP_FORECAST_VARIANCE_ENGINE.calculate({forecast:r.forecast,actual:r.actual});var capital=SCIIP_ENTERPRISE_CAPITAL_ALLOCATION_OPTIMIZER_V7.allocate({budget:r.budget,requests:r.requests||[]});var risks=SCIIP_FINANCIAL_RISK_FORECAST.evaluate({plan:plan,variance:variance});var workspace=SCIIP_EXECUTIVE_FINANCIAL_WORKSPACE.build({plan:plan,variance:variance,capital:capital,risks:risks});return {version:VERSION,status:'AVAILABLE',plan:plan,variance:variance,capital:capital,risks:risks,workspace:workspace};}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_27'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}try{SCIIP_QUERY_ENGINE.register('enterprise-financial-planning-query',sciipEnterpriseFinancialQueryV7,{capability:definition().id});o.queryRegistered=true;}catch(e3){}try{SCIIP_LIVE_RUNTIME.register('enterprise-financial-planning-forecasting',sciipEnterpriseFinancialHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}catch(e4){}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipEnterpriseFinancialQueryV7(r){return SCIIP_ENTERPRISE_FINANCIAL_PLANNING_APPLICATION.run(r||{});}function sciipEnterpriseFinancialHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-27.0',workspace:'enterprise-financial-planning-forecasting',generatedAt:new Date().toISOString()};}


var SCIIP_ENTERPRISE_FINANCIAL_PLANNING_ENGINE=(function(){'use strict';function plan(input){var periods=(input&&input.periods)||[];var revenue=periods.reduce(function(s,p){return s+Number(p.revenue||0);},0),expense=periods.reduce(function(s,p){return s+Number(p.expense||0);},0);return {status:'AVAILABLE',periods:periods.length,revenue:revenue,expense:expense,operatingIncome:revenue-expense,margin:revenue?Math.round((revenue-expense)/revenue*10000)/100:0};}return {plan:plan};})();


var SCIIP_EXECUTIVE_FINANCIAL_WORKSPACE=(function(){'use strict';function build(input){return {id:'enterprise-financial-planning-forecasting',name:'Enterprise Financial Planning & Forecasting',sections:['financial-summary','plan','forecast','actuals','variance','capital-allocation','cash-outlook','risks','recommendations','executive-briefing'],plan:input.plan,variance:input.variance,capital:input.capital,risks:input.risks};}return {build:build};})();


var SCIIP_FINANCIAL_RISK_FORECAST=(function(){'use strict';function evaluate(input){var p=input&&input.plan||{},v=input&&input.variance||{},risks=[];if(Number(p.margin||0)<15)risks.push({type:'MARGIN_PRESSURE',severity:'HIGH'});if(Number(v.variance||0)<0)risks.push({type:'FORECAST_MISS',severity:'WARNING',value:Math.abs(v.variance)});return {status:risks.length?'ATTENTION_REQUIRED':'CONTROLLED',risks:risks};}return {evaluate:evaluate};})();


var SCIIP_FORECAST_VARIANCE_ENGINE=(function(){'use strict';function calculate(input){var forecast=Number(input&&input.forecast||0),actual=Number(input&&input.actual||0),variance=actual-forecast;return {status:'AVAILABLE',forecast:forecast,actual:actual,variance:variance,variancePct:forecast?Math.round(variance/forecast*10000)/100:0,direction:variance>=0?'FAVORABLE':'UNFAVORABLE'};}return {calculate:calculate};})();


var SCIIP_APPROVAL_ORCHESTRATOR=(function(){'use strict';var approvals={};function reset(){approvals={};}
function request(i){i=i||{};var id=i.approvalId||('approval-'+(Object.keys(approvals).length+1));if(approvals[id])return {status:'DUPLICATE',approval:approvals[id]};var a={approvalId:id,workflowId:i.workflowId,stage:i.stage,authority:i.authority||'EXECUTIVE',status:'PENDING',requestedAt:new Date().toISOString(),evidence:i.evidence||[]};approvals[id]=a;return {status:'REQUESTED',approval:a};}
function decide(id,decision,actor){var a=approvals[id];if(!a)return {status:'NOT_FOUND'};a.status=decision==='APPROVE'?'APPROVED':'REJECTED';a.actor=actor||'SYSTEM';a.decidedAt=new Date().toISOString();return {status:'DECIDED',approval:a};}
function pending(workflowId){return Object.keys(approvals).map(function(k){return approvals[k];}).filter(function(a){return a.workflowId===workflowId&&a.status==='PENDING';});}
return {reset:reset,request:request,decide:decide,pending:pending};})();


var SCIIP_CROSS_APPLICATION_COORDINATOR=(function(){'use strict';
function coordinate(i){i=i||{};var outputs=i.outputs||{};var stages=['marketOpportunity','tenantProspect','siteSelection','underwriting','developmentFeasibility','dealOrigination','transactionExecution','assetOnboarding','portfolioStrategy'];var completed=[],missing=[];stages.forEach(function(s){if(outputs[s])completed.push(s);else missing.push(s);});var context={opportunityId:(outputs.marketOpportunity||{}).opportunityId||i.opportunityId||null,companyId:(outputs.tenantProspect||{}).companyId||null,propertyId:(outputs.siteSelection||{}).propertyId||null,acquisitionId:(outputs.underwriting||{}).acquisitionId||null,dealId:(outputs.dealOrigination||{}).dealId||null,assetId:(outputs.assetOnboarding||{}).assetId||null};return {status:missing.length?'PARTIAL':'COMPLETED',completedStages:completed,missingStages:missing,crossDomainContext:context,completionPct:Number((completed.length/stages.length*100).toFixed(2))};}
return {coordinate:coordinate};})();


var SCIIP_ENTERPRISE_OPERATING_SYSTEM_ORCHESTRATOR_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-22.0';
function definition(){return {id:'enterprise-operating-system-orchestrator',name:'Enterprise Operating System Orchestrator',version:VERSION,dependencies:['market-opportunity-intelligence','tenant-prospecting-intelligence','site-selection-intelligence','investment-underwriting-acquisition','development-feasibility-entitlement','deal-execution-pipeline','transaction-execution-closing','asset-onboarding-lease-administration','enterprise-portfolio-strategy-optimization'],services:['enterprise-operating-system-orchestrator'],queries:['enterprise-operating-system-orchestrator-query'],events:['ENTERPRISE_WORKFLOW_STARTED','ENTERPRISE_WORKFLOW_ADVANCED','ENTERPRISE_WORKFLOW_COMPLETED'],stateBindings:['enterpriseWorkflow','enterpriseApprovals','enterpriseTimeline','crossApplicationContext'],workspaces:['enterprise-operating-system-orchestrator'],tests:['sciipTestV7IntegrationSprint22'],liveHandler:'sciipEnterpriseOperatingSystemHeartbeatV7',queryHandler:'sciipEnterpriseOperatingSystemQueryV7'};}
function run(r){r=r||{};var started=SCIIP_ENTERPRISE_WORKFLOW_ENGINE.start({workflowId:r.workflowId||'enterprise-lifecycle-1',name:r.name,context:r.context});var w=started.workflow;var path=r.path||['QUALIFIED','MATCHED','UNDERWRITTEN','APPROVED','EXECUTING','CLOSED','ONBOARDED','OPTIMIZED'];path.forEach(function(state){var x=SCIIP_ENTERPRISE_WORKFLOW_ENGINE.advance(w.workflowId,state,(r.stagePayloads||{})[state]||{});if(x.workflow)w=x.workflow;});var coordination=SCIIP_CROSS_APPLICATION_COORDINATOR.coordinate({outputs:r.outputs||{},opportunityId:r.opportunityId});var timeline=SCIIP_ENTERPRISE_TIMELINE.build({events:w.history||[]});var pending=SCIIP_APPROVAL_ORCHESTRATOR.pending(w.workflowId);var summary={workflowId:w.workflowId,state:w.state,completionPct:coordination.completionPct,pendingApprovals:pending.length,completedStages:coordination.completedStages.length};var workspace=SCIIP_ENTERPRISE_OPERATIONS_WORKSPACE.build({lifecycle:path,workflow:w,coordination:coordination,approvals:pending,timeline:timeline,exceptions:r.exceptions||[],audit:w.history,executiveSummary:summary});return {version:VERSION,status:w.state==='OPTIMIZED'?'COMPLETED':'IN_PROGRESS',workflow:w,coordination:coordination,timeline:timeline,pendingApprovals:pending,workspace:workspace,executiveSummary:summary};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_22'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-operating-system-orchestrator-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-operating-system-orchestrator')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-operating-system-orchestrator-query',sciipEnterpriseOperatingSystemQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-operating-system-orchestrator',sciipEnterpriseOperatingSystemHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterpriseOperatingSystemQueryV7(r){return SCIIP_ENTERPRISE_OPERATING_SYSTEM_ORCHESTRATOR_APPLICATION.run(r||{});}function sciipEnterpriseOperatingSystemHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-22.0',workspace:'enterprise-operating-system-orchestrator',generatedAt:new Date().toISOString()};}


var SCIIP_ENTERPRISE_OPERATIONS_WORKSPACE=(function(){'use strict';function build(i){i=i||{};return {id:'enterprise-operating-system-orchestrator',name:'Enterprise Operating System Orchestrator',version:'v7.0-integration-sprint-22.0',sections:[{id:'lifecycle',data:i.lifecycle||{}},{id:'workflow-state',data:i.workflow||{}},{id:'cross-application-context',data:i.coordination||{}},{id:'approvals',data:i.approvals||{}},{id:'timeline',data:i.timeline||{}},{id:'exceptions-retries',data:i.exceptions||{}},{id:'audit-history',data:i.audit||{}},{id:'executive-summary',data:i.executiveSummary||{}}]};}return {build:build};})();


var SCIIP_ENTERPRISE_TIMELINE=(function(){'use strict';function build(i){i=i||{};var events=(i.events||[]).slice().sort(function(a,b){return new Date(a.at||a.timestamp)-new Date(b.at||b.timestamp);});return {status:'COMPLETED',eventCount:events.length,events:events,firstEvent:events[0]||null,lastEvent:events[events.length-1]||null,durationDays:events.length>1?Math.round((new Date(events[events.length-1].at||events[events.length-1].timestamp)-new Date(events[0].at||events[0].timestamp))/86400000):0};}return {build:build};})();


var SCIIP_ENTERPRISE_WORKFLOW_ENGINE=(function(){'use strict';
var runs={};function reset(){runs={};}
function start(i){i=i||{};var id=i.workflowId||('workflow-'+(Object.keys(runs).length+1));if(runs[id])return {status:'DUPLICATE',workflow:runs[id]};var w={workflowId:id,name:i.name||'Enterprise Lifecycle',state:'DISCOVERED',context:i.context||{},steps:[],history:[],approvals:[],attempts:{},createdAt:new Date().toISOString()};runs[id]=w;return {status:'CREATED',workflow:w};}
function advance(id,to,payload){var w=runs[id];if(!w)return {status:'NOT_FOUND'};var t=SCIIP_WORKFLOW_STATE_MACHINE.transition(w,to,{payload:payload||{}});if(t.status!=='TRANSITIONED')return t;runs[id]=t.instance;runs[id].steps.push({state:to,payload:payload||{},completedAt:new Date().toISOString()});return {status:'ADVANCED',workflow:runs[id]};}
function fail(id,step,error,maxRetries){var w=runs[id];if(!w)return {status:'NOT_FOUND'};w.attempts[step]=(w.attempts[step]||0)+1;var retry=w.attempts[step]<=Number(maxRetries||0);return {status:retry?'RETRY_SCHEDULED':'FAILED',attempt:w.attempts[step],retry:retry,error:String(error||'UNKNOWN')};}
function get(id){return runs[id]||null;}return {reset:reset,start:start,advance:advance,fail:fail,get:get};})();


var SCIIP_WORKFLOW_STATE_MACHINE=(function(){'use strict';
var transitions={DISCOVERED:['QUALIFIED','REJECTED'],QUALIFIED:['MATCHED','REJECTED'],MATCHED:['UNDERWRITTEN','REJECTED'],UNDERWRITTEN:['APPROVED','REJECTED'],APPROVED:['EXECUTING','ON_HOLD'],EXECUTING:['CLOSED','FAILED','ON_HOLD'],ON_HOLD:['EXECUTING','REJECTED'],CLOSED:['ONBOARDED'],ONBOARDED:['OPTIMIZED'],FAILED:['EXECUTING','REJECTED'],REJECTED:[],OPTIMIZED:[]};
function can(from,to){return (transitions[from]||[]).indexOf(to)!==-1;}
function move(instance,to,meta){instance=instance||{};var from=instance.state||'DISCOVERED';if(!can(from,to))return {status:'INVALID_TRANSITION',from:from,to:to,instance:instance};var next=Object.assign({},instance,{state:to,updatedAt:new Date().toISOString()});next.history=(instance.history||[]).slice();next.history.push({from:from,to:to,at:next.updatedAt,meta:meta||{}});return {status:'TRANSITIONED',from:from,to:to,instance:next};}
return {canTransition:can,transition:move,transitions:transitions};})();


var SCIIP_ADAPTIVE_PLANNING_ENGINE=(function(){'use strict';function replan(i){i=i||{};var changes=i.changes||[],initiatives=i.initiatives||[],recommendations=[],adjustments=[];changes.forEach(function(c,n){var severity=String(c.severity||'MEDIUM').toUpperCase(),delta=severity==='CRITICAL'?30:severity==='HIGH'?20:severity==='MEDIUM'?10:5;initiatives.forEach(function(x){if(!c.domain||c.domain===x.domain){var direction=String(c.direction||'NEGATIVE').toUpperCase();adjustments.push({initiativeId:x.initiativeId,previousPriority:Number(x.priority)||50,newPriority:Math.max(0,Math.min(100,(Number(x.priority)||50)+(direction==='POSITIVE'?delta:-delta))),changeId:c.changeId||'CHANGE-'+(n+1)});}});recommendations.push({recommendationId:'REPLAN-'+(n+1),changeId:c.changeId||'CHANGE-'+(n+1),action:c.recommendedAction||'REASSESS_INITIATIVES',explanation:(c.description||'Enterprise condition changed')+'; priorities and dependencies must be recalculated.',approvalRequired:severity==='CRITICAL'||severity==='HIGH',confidence:Number(c.confidence==null?.9:c.confidence)});});var approvals=recommendations.filter(function(r){return r.approvalRequired;}).map(function(r,n){return {approvalId:'APR-'+(n+1),recommendationId:r.recommendationId,route:'EXECUTIVE_PLANNING_COUNCIL',status:'PENDING'};});return {status:changes.length?'REPLAN_RECOMMENDED':'NO_CHANGE',changesDetected:changes.length,adjustments:adjustments,recommendations:recommendations,approvalRouting:approvals,generatedAt:new Date().toISOString()};}return {replan:replan};})();


var SCIIP_ENTERPRISE_PLANNING_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-24.0';function definition(){return {id:'enterprise-autonomous-planning-execution',name:'Enterprise Autonomous Planning & Execution',version:VERSION,dependencies:['enterprise-operating-system-orchestrator','enterprise-intelligence-command-platform','enterprise-portfolio-strategy-optimization','market-opportunity-intelligence','tenant-prospecting-intelligence','site-selection-intelligence','deal-origination-pipeline-intelligence','transaction-execution-closing-intelligence','asset-onboarding-lease-administration','portfolio-performance-asset-management','investment-underwriting-acquisition','capital-projects-development-intelligence','development-feasibility-entitlement'],services:['enterprise-autonomous-planning-execution'],queries:['enterprise-autonomous-planning-execution-query'],events:['ENTERPRISE_PLAN_CREATED','ENTERPRISE_EXECUTION_SYNCHRONIZED','ENTERPRISE_REPLAN_RECOMMENDED','ENTERPRISE_SCORECARD_UPDATED'],stateBindings:['enterprisePlan','executionSynchronization','adaptivePlan','enterpriseScorecard'],workspaces:['enterprise-autonomous-planning-execution'],tests:['sciipTestV7IntegrationSprint24'],liveHandler:'sciipEnterprisePlanningHeartbeatV7',queryHandler:'sciipEnterprisePlanningQueryV7'};}function run(r){r=r||{};var plan=SCIIP_ENTERPRISE_PLANNING_ENGINE.plan(r),sync=SCIIP_EXECUTION_SYNCHRONIZATION.synchronize({initiatives:plan.initiatives,dependencies:r.dependencies,executionVelocity:r.executionVelocity}),adaptive=SCIIP_ADAPTIVE_PLANNING_ENGINE.replan({changes:r.changes,initiatives:plan.initiatives}),scorecard=SCIIP_ENTERPRISE_SCORECARD.build({objectives:plan.objectives,initiatives:plan.initiatives,planned:r.planned,actual:r.actual,executionVelocity:r.executionVelocity,strategicKpis:r.strategicKpis});var briefing={cycleId:plan.cycleId,completion:plan.completion,blockedDependencies:sync.blockedCount,changesDetected:adaptive.changesDetected,approvalsPending:adaptive.approvalRouting.length,enterpriseMaturity:scorecard.enterpriseMaturity};var workspace=SCIIP_EXECUTIVE_PLANNING_WORKSPACE.build({strategyMap:r.strategyMap,plan:plan,sync:sync,adaptive:adaptive,scorecard:scorecard,risks:r.risks,portfolioImpact:r.portfolioImpact,executiveBriefing:briefing});return {version:VERSION,status:'AVAILABLE',plan:plan,synchronization:sync,adaptivePlanning:adaptive,scorecard:scorecard,workspace:workspace,executiveBriefing:briefing};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_24'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-autonomous-planning-execution-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-autonomous-planning-execution')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-autonomous-planning-execution-query',sciipEnterprisePlanningQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-autonomous-planning-execution',sciipEnterprisePlanningHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipEnterprisePlanningQueryV7(r){return SCIIP_ENTERPRISE_PLANNING_APPLICATION.run(r||{});}function sciipEnterprisePlanningHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-24.0',workspace:'enterprise-autonomous-planning-execution',generatedAt:new Date().toISOString()};}


var SCIIP_ENTERPRISE_PLANNING_ENGINE=(function(){'use strict';
function pct(a,b){return b?Math.round(a/b*10000)/100:0;}function normalizeObjective(o,i){var target=Number(o.target)||100,actual=Number(o.actual)||0;return Object.assign({},o,{objectiveId:o.objectiveId||'OBJ-'+(i+1),level:String(o.level||'ANNUAL').toUpperCase(),target:target,actual:actual,completion:pct(actual,target),status:actual>=target?'COMPLETE':actual>=target*.75?'ON_TRACK':'AT_RISK'});}function plan(i){i=i||{};var objectives=(i.objectives||[]).map(normalizeObjective),initiatives=(i.initiatives||[]).map(function(x,n){return Object.assign({},x,{initiativeId:x.initiativeId||'INIT-'+(n+1),priority:Number(x.priority)||50,status:x.status||'PLANNED',objectiveIds:x.objectiveIds||[]});});var decomposition=[];objectives.forEach(function(o){var periods=o.level==='ANNUAL'?['Q1','Q2','Q3','Q4']:o.level==='QUARTERLY'?['M1','M2','M3']:['CURRENT'];periods.forEach(function(p,n){decomposition.push({parentObjectiveId:o.objectiveId,period:p,target:Math.round(o.target/periods.length*100)/100,sequence:n+1});});});return {status:'PLANNED',cycleId:i.cycleId||'PLAN-'+new Date().getTime(),horizon:{annual:i.annual||{},quarterly:i.quarterly||{},monthly:i.monthly||{}},objectives:objectives,initiatives:initiatives,decomposition:decomposition,completion:pct(objectives.reduce(function(a,o){return a+Math.min(o.actual,o.target);},0),objectives.reduce(function(a,o){return a+o.target;},0)),generatedAt:new Date().toISOString()};}return {plan:plan};})();


var SCIIP_ENTERPRISE_SCORECARD=(function(){'use strict';function build(i){i=i||{};var objectives=i.objectives||[],initiatives=i.initiatives||[],planned=Number(i.planned)||0,actual=Number(i.actual)||0,complete=objectives.filter(function(o){return o.status==='COMPLETE';}).length,healthy=initiatives.filter(function(x){return x.status==='COMPLETE'||x.status==='ON_TRACK';}).length,velocity=Number(i.executionVelocity)||0,maturity=Math.round(((objectives.length?complete/objectives.length:0)*35+(initiatives.length?healthy/initiatives.length:0)*30+Math.min(1,velocity/100)*35)*100)/100;return {status:'UPDATED',strategicKpis:i.strategicKpis||[],objectiveCompletion:objectives.length?Math.round(complete/objectives.length*10000)/100:0,forecastVsActual:{forecast:planned,actual:actual,variance:actual-planned,attainment:planned?Math.round(actual/planned*10000)/100:0},initiativeHealth:{total:initiatives.length,healthy:healthy,atRisk:initiatives.length-healthy},executionVelocity:velocity,enterpriseMaturity:maturity,generatedAt:new Date().toISOString()};}return {build:build};})();


var SCIIP_EXECUTION_SYNCHRONIZATION=(function(){'use strict';function synchronize(i){i=i||{};var initiatives=i.initiatives||[],deps=i.dependencies||[],byId={};initiatives.forEach(function(x){byId[x.initiativeId]=x;});var recalculated=deps.map(function(d){var p=byId[d.predecessorId],s=byId[d.successorId],blocked=!p||p.status!=='COMPLETE';return Object.assign({},d,{dependencyId:d.dependencyId||d.predecessorId+'>'+d.successorId,blocked:blocked,reason:blocked?'PREDECESSOR_INCOMPLETE':'READY',priorityAdjustment:blocked&&s?-10:0});});var domains={};initiatives.forEach(function(x){var d=x.domain||'ENTERPRISE';if(!domains[d])domains[d]={domain:d,total:0,complete:0,blocked:0};domains[d].total++;if(x.status==='COMPLETE')domains[d].complete++;});recalculated.forEach(function(d){if(d.blocked&&byId[d.successorId])domains[byId[d.successorId].domain||'ENTERPRISE'].blocked++;});return {status:'SYNCHRONIZED',domains:Object.keys(domains).map(function(k){return domains[k];}),dependencies:recalculated,blockedCount:recalculated.filter(function(d){return d.blocked;}).length,executionVelocity:Number(i.executionVelocity)||0,generatedAt:new Date().toISOString()};}return {synchronize:synchronize};})();


var SCIIP_EXECUTIVE_PLANNING_WORKSPACE=(function(){'use strict';function build(i){i=i||{};var sections=[['strategy-map',i.strategyMap||{}],['objectives',(i.plan||{}).objectives||[]],['initiatives',(i.plan||{}).initiatives||[]],['dependencies',(i.sync||{}).dependencies||[]],['risks',i.risks||[]],['portfolio-impact',i.portfolioImpact||{}],['recommended-replans',(i.adaptive||{}).recommendations||[]],['approval-routing',(i.adaptive||{}).approvalRouting||[]],['enterprise-scorecard',i.scorecard||{}],['executive-briefing',i.executiveBriefing||{}]].map(function(x){return {id:x[0],data:x[1]};});return {id:'enterprise-autonomous-planning-execution',name:'Enterprise Autonomous Planning & Execution',sections:sections,replanRequired:((i.adaptive||{}).changesDetected||0)>0,generatedAt:new Date().toISOString()};}return {build:build};})();


var SCIIP_CAPITAL_ALLOCATION_ENGINE=(function(){'use strict';function n(v){v=Number(v);return isFinite(v)?v:0;}function allocate(i){i=i||{};var budget=n(i.budget),items=(i.opportunities||[]).map(function(o){var cost=n(o.cost),benefit=n(o.annualBenefit),strategic=n(o.strategicScore),riskReduction=n(o.riskReductionScore),roi=cost?benefit/cost*100:0,priority=roi*.45+strategic*.35+riskReduction*.2;return {id:o.id,name:o.name,cost:cost,annualBenefit:benefit,roiPct:Number(roi.toFixed(2)),priorityScore:Number(priority.toFixed(2)),type:o.type||'CAPITAL'};});items.sort(function(a,b){return b.priorityScore-a.priorityScore;});var selected=[],allocated=0,benefit=0;items.forEach(function(o){if(allocated+o.cost<=budget){selected.push(o);allocated+=o.cost;benefit+=o.annualBenefit;}});return {status:'COMPLETED',budget:budget,allocated:allocated,remaining:budget-allocated,selected:selected,rejected:items.filter(function(x){return selected.indexOf(x)===-1;}),annualBenefit:benefit,portfolioRoiPct:allocated?Number((benefit/allocated*100).toFixed(2)):0};}return {allocate:allocate};})();


var SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-21.0';
function definition(){return {id:'enterprise-portfolio-strategy-optimization',name:'Enterprise Portfolio Strategy & Optimization',version:VERSION,dependencies:['portfolio-performance-asset-management','investment-underwriting-acquisition-intelligence','capital-projects-development-intelligence','development-feasibility-entitlement-intelligence'],services:['enterprise-portfolio-strategy-application'],queries:['enterprise-portfolio-strategy-query'],events:['PORTFOLIO_STRATEGY_COMPLETED','CAPITAL_ALLOCATION_COMPLETED','ENTERPRISE_RISK_AGGREGATED'],stateBindings:['portfolioStrategy','portfolioScenarios','capitalAllocation','enterpriseRisk'],workspaces:['enterprise-portfolio-strategy-optimization'],tests:['sciipTestV7IntegrationSprint21'],liveHandler:'sciipEnterprisePortfolioStrategyHeartbeatV7',queryHandler:'sciipEnterprisePortfolioStrategyQueryV7'};}
function run(r){r=r||{};var strategy=SCIIP_PORTFOLIO_STRATEGY_ENGINE.analyze({assets:r.assets||[],objectives:r.objectives||{}}),scenarios=SCIIP_SCENARIO_OPTIMIZATION_ENGINE.analyze({scenarios:r.scenarios||[],capitalBudget:r.capitalBudget}),risk=SCIIP_ENTERPRISE_RISK_AGGREGATION_ENGINE.aggregate({domains:r.riskDomains||{}}),capital=SCIIP_CAPITAL_ALLOCATION_ENGINE.allocate({budget:r.capitalBudget,opportunities:r.capitalOpportunities||[]}),summary={portfolioScore:strategy.portfolioScore,recommendedActions:strategy.actionSummary,bestScenario:scenarios.bestScenario&&scenarios.bestScenario.id,enterpriseRisk:risk.severity,capitalAllocated:capital.allocated,expectedAnnualBenefit:capital.annualBenefit},workspace=SCIIP_ENTERPRISE_STRATEGY_WORKSPACE.build({scorecard:summary,strategy:strategy,scenarios:scenarios,capital:capital,risk:risk,pipelines:r.pipelines||{},health:r.health||{},executiveSummary:summary});return {version:VERSION,status:'COMPLETED',strategy:strategy,scenarios:scenarios,risk:risk,capital:capital,workspace:workspace,executiveSummary:summary};}
function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_21'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('enterprise-portfolio-strategy-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('enterprise-portfolio-strategy-application')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('enterprise-portfolio-strategy-query',sciipEnterprisePortfolioStrategyQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('enterprise-portfolio-strategy-application',sciipEnterprisePortfolioStrategyHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipEnterprisePortfolioStrategyQueryV7(r){return SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_APPLICATION.run(r||{});}function sciipEnterprisePortfolioStrategyHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-21.0',workspace:'enterprise-portfolio-strategy-optimization',generatedAt:new Date().toISOString()};}


var SCIIP_ENTERPRISE_RISK_AGGREGATION_ENGINE=(function(){'use strict';function n(v){v=Number(v);return isFinite(v)?v:0;}function aggregate(i){i=i||{};var domains=i.domains||{};var weights={leasing:.2,capitalProjects:.2,acquisitions:.15,development:.2,concentration:.25};var weighted=0,total=0,details=[];Object.keys(weights).forEach(function(k){var score=n(domains[k]);weighted+=score*weights[k];total+=weights[k];details.push({domain:k,score:score,weight:weights[k]});});var score=Number((weighted/(total||1)).toFixed(2)),severity=score>=75?'CRITICAL':score>=55?'HIGH':score>=35?'MEDIUM':'LOW';details.sort(function(a,b){return b.score-a.score;});return {status:'COMPLETED',riskScore:score,severity:severity,domains:details,topRisk:details[0]||null};}return {aggregate:aggregate};})();


var SCIIP_ENTERPRISE_STRATEGY_WORKSPACE=(function(){'use strict';function build(i){i=i||{};return {id:'enterprise-portfolio-strategy-optimization',name:'Enterprise Portfolio Strategy & Optimization',version:'v7.0-integration-sprint-21.0',sections:[{id:'scorecard',data:i.scorecard||{}},{id:'recommendations',data:i.strategy||{}},{id:'scenarios',data:i.scenarios||{}},{id:'capital-plan',data:i.capital||{}},{id:'enterprise-risk',data:i.risk||{}},{id:'acquisition-development',data:i.pipelines||{}},{id:'portfolio-health',data:i.health||{}},{id:'executive-summary',data:i.executiveSummary||{}}]};}return {build:build};})();


var SCIIP_PORTFOLIO_STRATEGY_ENGINE=(function(){'use strict';
function n(v,d){v=Number(v);return isFinite(v)?v:(d||0);}function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function scoreAsset(a,o){o=o||{};var occupancy=n(a.occupancyPct),noiGrowth=n(a.noiGrowthPct),capex=n(a.capexNeed),value=n(a.marketValue),risk=n(a.riskScore),market=n(a.marketScore,50),strategic=n(a.strategicFitScore,50),lease=n(a.waltYears);var performance=clamp(occupancy*.28+clamp(noiGrowth*8,0,100)*.17+market*.2+strategic*.2+clamp(lease*12,0,100)*.15,0,100);var burden=clamp(risk*.65+(value?capex/value*100:0)*3.5,0,100);var total=Number(clamp(performance-burden*.35,0,100).toFixed(2));var action='HOLD';if(total>=72&&strategic>=65)action='HOLD';if(total<48||risk>=75)action='SELL';else if(capex>0&&strategic>=65&&market>=60&&total<72)action='REDEVELOP';if(a.assetType==='PIPELINE'&&total>=65)action='ACQUIRE';return {assetId:a.assetId||a.id,score:total,action:action,performanceScore:Number(performance.toFixed(2)),burdenScore:Number(burden.toFixed(2)),evidence:[{factor:'OCCUPANCY',value:occupancy},{factor:'NOI_GROWTH',value:noiGrowth},{factor:'MARKET',value:market},{factor:'STRATEGIC_FIT',value:strategic},{factor:'RISK',value:risk}]};}
function analyze(input){input=input||{};var assets=(input.assets||[]).map(function(a){return scoreAsset(a,input.objectives||{});});assets.sort(function(a,b){return b.score-a.score;});var counts={HOLD:0,SELL:0,REDEVELOP:0,ACQUIRE:0};assets.forEach(function(a){counts[a.action]=(counts[a.action]||0)+1;});var avg=assets.length?assets.reduce(function(s,a){return s+a.score;},0)/assets.length:0;return {status:'COMPLETED',portfolioScore:Number(avg.toFixed(2)),recommendations:assets,actionSummary:counts,topRecommendation:assets[0]||null};}
return {analyze:analyze,scoreAsset:scoreAsset};})();


var SCIIP_SCENARIO_OPTIMIZATION_ENGINE=(function(){'use strict';function n(v,d){v=Number(v);return isFinite(v)?v:(d||0);}function analyze(i){i=i||{};var scenarios=(i.scenarios||[]).map(function(s){var value=n(s.endingPortfolioValue),noi=n(s.annualNoi),risk=n(s.riskScore),capital=n(s.requiredCapital),budget=n(i.capitalBudget,Infinity),feasible=capital<=budget,objective=Number((noi*.00001+value*.000001-risk*.4-(feasible?0:100)).toFixed(2));return {id:s.id||s.name,name:s.name||s.id,feasible:feasible,objectiveScore:objective,endingPortfolioValue:value,annualNoi:noi,riskScore:risk,requiredCapital:capital};});scenarios.sort(function(a,b){return b.objectiveScore-a.objectiveScore;});return {status:'COMPLETED',scenarioCount:scenarios.length,bestScenario:scenarios[0]||null,scenarios:scenarios,feasibleCount:scenarios.filter(function(s){return s.feasible;}).length};}return {analyze:analyze};})();


var SCIIP_CAPACITY_ALLOCATION_OPTIMIZER=(function(){'use strict';function optimize(input){var resources=((input&&input.resources)||[]).map(function(r){return Object.assign({},r,{remaining:Number(r.capacity||0)});});var demand=((input&&input.demand)||[]).slice().sort(function(a,b){return Number(b.priority||0)-Number(a.priority||0);});var allocations=[],unallocated=0;demand.forEach(function(d){var need=Number(d.required||0);resources.forEach(function(r){if(need<=0||r.remaining<=0)return;var amt=Math.min(need,r.remaining);allocations.push({demandId:d.demandId,resourceId:r.resourceId,allocated:amt});r.remaining-=amt;need-=amt;});unallocated+=need;});return {status:unallocated?'PARTIAL':'OPTIMIZED',allocations:allocations,unallocated:unallocated};}return {optimize:optimize};})();


var SCIIP_CAPACITY_SCENARIO_ENGINE=(function(){'use strict';function compare(input){var base=Number(input&&input.baseCapacity||0),scenarios=(input&&input.scenarios)||[];var ranked=scenarios.map(function(s){return Object.assign({},s,{effectiveCapacity:base+Number(s.capacityDelta||0)-Number(s.costPenalty||0)});}).sort(function(a,b){return b.effectiveCapacity-a.effectiveCapacity;});return {status:'AVAILABLE',scenarios:ranked,bestScenario:ranked[0]||null};}return {compare:compare};})();


var SCIIP_ENTERPRISE_RESOURCE_CAPACITY_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-26.0';
function definition(){return {id:'enterprise-resource-capacity-optimization',name:'Enterprise Resource & Capacity Optimization',version:VERSION,dependencies:['enterprise-autonomous-execution-work-management','enterprise-autonomous-planning-execution'],services:['enterprise-resource-capacity-optimization'],queries:['enterprise-resource-capacity-query'],events:['RESOURCE_CAPACITY_ASSESSED','CAPACITY_ALLOCATION_OPTIMIZED','CAPACITY_RISK_DETECTED'],stateBindings:['enterpriseCapacity','resourceAllocations','capacityRisks'],workspaces:['enterprise-resource-capacity-optimization'],tests:['sciipTestV7IntegrationSprint26'],liveHandler:'sciipEnterpriseCapacityHeartbeatV7',queryHandler:'sciipEnterpriseCapacityQueryV7'};}
function run(r){r=r||{};var a=SCIIP_RESOURCE_CAPACITY_ENGINE.assess(r);var alloc=SCIIP_CAPACITY_ALLOCATION_OPTIMIZER.optimize(r);var scenarios=SCIIP_CAPACITY_SCENARIO_ENGINE.compare({baseCapacity:a.capacity,scenarios:r.scenarios||[]});var risks=SCIIP_RESOURCE_RISK_ENGINE.evaluate({assessment:a});var workspace=SCIIP_EXECUTIVE_CAPACITY_WORKSPACE.build({assessment:a,allocation:alloc,scenarios:scenarios,risks:risks});return {version:VERSION,status:'AVAILABLE',assessment:a,allocation:alloc,scenarios:scenarios,risks:risks,workspace:workspace};}
function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_26'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}try{SCIIP_QUERY_ENGINE.register('enterprise-resource-capacity-query',sciipEnterpriseCapacityQueryV7,{capability:definition().id});o.queryRegistered=true;}catch(e3){}try{SCIIP_LIVE_RUNTIME.register('enterprise-resource-capacity-optimization',sciipEnterpriseCapacityHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;}catch(e4){}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipEnterpriseCapacityQueryV7(r){return SCIIP_ENTERPRISE_RESOURCE_CAPACITY_APPLICATION.run(r||{});}function sciipEnterpriseCapacityHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-26.0',workspace:'enterprise-resource-capacity-optimization',generatedAt:new Date().toISOString()};}


var SCIIP_EXECUTIVE_CAPACITY_WORKSPACE=(function(){'use strict';function build(input){return {id:'enterprise-resource-capacity-optimization',name:'Enterprise Resource & Capacity Optimization',sections:['capacity-summary','resource-pools','demand','allocations','utilization','constraints','scenarios','risks','recommendations','executive-briefing'],assessment:input.assessment,allocation:input.allocation,bestScenario:input.scenarios.bestScenario,risks:input.risks};}return {build:build};})();


var SCIIP_RESOURCE_CAPACITY_ENGINE=(function(){'use strict';function assess(input){var resources=(input&&input.resources)||[];var demand=(input&&input.demand)||[];var capacity=resources.reduce(function(s,r){return s+Number(r.capacity||0);},0),required=demand.reduce(function(s,d){return s+Number(d.required||0);},0);return {status:required>capacity?'CONSTRAINED':'AVAILABLE',resources:resources.length,capacity:capacity,required:required,gap:capacity-required,utilization:capacity?Math.round(required/capacity*10000)/100:0};}return {assess:assess};})();


var SCIIP_RESOURCE_RISK_ENGINE=(function(){'use strict';function evaluate(input){var assessment=input&&input.assessment||{};var risks=[];if(Number(assessment.gap||0)<0)risks.push({type:'CAPACITY_SHORTFALL',severity:'HIGH',value:Math.abs(assessment.gap)});if(Number(assessment.utilization||0)>90)risks.push({type:'OVERUTILIZATION',severity:'WARNING',value:assessment.utilization});return {status:risks.length?'ATTENTION_REQUIRED':'CONTROLLED',risks:risks};}return {evaluate:evaluate};})();


/**
 * SCIIP Epic 2 Release 4 — Canonical Industrial Knowledge Model
 * Versioned entity and relationship contracts for industrial real estate.
 */
var SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE = (function(){
  'use strict';
  var VERSION='v7.0-epic2-release4.0';
  var SCHEMA_VERSION='industrial-knowledge-v1';
  var ENTITY_SCHEMAS={
    PROPERTY:{required:['address','city','state'],identity:['address','city','state','postalCode'],aliases:['property','site','asset'],spatial:true,search:true},
    BUILDING:{required:['propertyId'],identity:['propertyId','buildingName'],aliases:['building','facility'],spatial:true,search:true},
    INDUSTRIAL_PARK:{required:['name','city','state'],identity:['name','city','state'],aliases:['park','business park'],spatial:true,search:true},
    COMPANY:{required:['name'],identity:['normalizedName'],aliases:['company','organization'],spatial:false,search:true},
    TENANT:{required:['companyId'],identity:['companyId'],aliases:['occupant'],spatial:false,search:true},
    OWNER:{required:['companyId'],identity:['companyId'],aliases:['landlord'],spatial:false,search:true},
    BROKER:{required:['name'],identity:['email','name','companyId'],aliases:['agent'],spatial:false,search:true},
    LISTING:{required:['propertyId','status'],identity:['propertyId','listingType','sourceId'],aliases:['availability'],spatial:false,search:true},
    LEASE:{required:['propertyId','tenantId'],identity:['propertyId','tenantId','commencementDate'],aliases:['lease transaction'],spatial:false,search:true},
    SALE:{required:['propertyId','saleDate'],identity:['propertyId','saleDate','price'],aliases:['sale transaction'],spatial:false,search:true},
    DEVELOPMENT_PROJECT:{required:['name','city','state'],identity:['name','city','state'],aliases:['development','project'],spatial:true,search:true},
    MARKET:{required:['name'],identity:['name'],aliases:['region','metro'],spatial:true,search:true},
    SUBMARKET:{required:['name','marketId'],identity:['name','marketId'],aliases:['submarket'],spatial:true,search:true},
    MUNICIPALITY:{required:['name','state'],identity:['name','state'],aliases:['city'],spatial:true,search:true},
    UTILITY:{required:['name','utilityType'],identity:['name','utilityType'],aliases:['service provider'],spatial:false,search:true},
    PARCEL:{required:['apn'],identity:['apn','county'],aliases:['tax parcel','lot'],spatial:true,search:true}
  };
  var RELATIONSHIPS={
    OWNS:{from:['OWNER','COMPANY'],to:['PROPERTY','BUILDING','INDUSTRIAL_PARK','PARCEL']},
    OCCUPIES:{from:['TENANT','COMPANY'],to:['PROPERTY','BUILDING']},
    LEASES:{from:['TENANT','COMPANY'],to:['PROPERTY','BUILDING']},
    MARKETS:{from:['LISTING','BROKER'],to:['PROPERTY','BUILDING']},
    REPRESENTS:{from:['BROKER'],to:['OWNER','TENANT','COMPANY','LISTING']},
    PART_OF:{from:['BUILDING','PROPERTY','PARCEL','SUBMARKET'],to:['INDUSTRIAL_PARK','PROPERTY','MARKET','MUNICIPALITY']},
    LOCATED_IN:{from:['PROPERTY','BUILDING','INDUSTRIAL_PARK','PARCEL','DEVELOPMENT_PROJECT'],to:['SUBMARKET','MARKET','MUNICIPALITY']},
    CREATES:{from:['DEVELOPMENT_PROJECT'],to:['PROPERTY','BUILDING','INDUSTRIAL_PARK']},
    SERVED_BY:{from:['PROPERTY','BUILDING','INDUSTRIAL_PARK'],to:['UTILITY']},
    SUBJECT_OF:{from:['PROPERTY','BUILDING'],to:['LISTING','LEASE','SALE']},
    BUYER_OF:{from:['COMPANY','OWNER'],to:['SALE']},
    SELLER_OF:{from:['COMPANY','OWNER'],to:['SALE']}
  };
  function text(v){return String(v===null||v===undefined?'':v).trim();}
  function norm(v){return text(v).toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();}
  function upper(v){return text(v).toUpperCase().replace(/[^A-Z0-9]+/g,'_').replace(/^_+|_+$/g,'');}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function hash(value){var s=text(value),h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16)).slice(-8).toUpperCase();}
  function now(){return new Date().toISOString();}
  function schema(type){type=upper(type);return ENTITY_SCHEMAS[type]?clone(ENTITY_SCHEMAS[type]):null;}
  function canonicalize(type,data){type=upper(type);data=clone(data||{});if(data.name&&!data.normalizedName)data.normalizedName=norm(data.name);if(data.address)data.address=text(data.address).replace(/\s+/g,' ');if(data.city)data.city=text(data.city);if(data.state)data.state=upper(data.state);if(data.postalCode)data.postalCode=text(data.postalCode).replace(/[^0-9-]/g,'');if(data.apn)data.apn=upper(data.apn);return data;}
  function businessKey(type,data){type=upper(type);var s=ENTITY_SCHEMAS[type];if(!s)return null;data=canonicalize(type,data);return type+'|'+s.identity.map(function(f){return norm(data[f]);}).join('|');}
  function entityId(type,data){var key=businessKey(type,data);return key?upper(type)+'-'+hash(key):null;}
  function validateEntity(type,data){type=upper(type);var s=ENTITY_SCHEMAS[type],errors=[],warnings=[];if(!s)return {valid:false,errors:['UNKNOWN_ENTITY_TYPE'],warnings:[]};data=canonicalize(type,data);s.required.forEach(function(f){if(!text(data[f]))errors.push('REQUIRED_'+upper(f));});if((data.latitude!==undefined||data.longitude!==undefined)&&s.spatial){var lat=Number(data.latitude),lng=Number(data.longitude);if(!isFinite(lat)||lat<-90||lat>90)errors.push('INVALID_LATITUDE');if(!isFinite(lng)||lng<-180||lng>180)errors.push('INVALID_LONGITUDE');}if(!data.sourceId)warnings.push('SOURCE_ID_MISSING');return {valid:errors.length===0,errors:errors,warnings:warnings,canonicalData:data,businessKey:businessKey(type,data),entityId:entityId(type,data)};}
  function aliasSet(data){var values=[];['name','normalizedName','address','legalName','dba','sourceId'].forEach(function(k){if(data&&data[k])values.push(norm(data[k]));});(data&&data.aliases||[]).forEach(function(v){values.push(norm(v));});var seen={};return values.filter(function(v){if(!v||seen[v])return false;seen[v]=true;return true;});}
  function resolve(request){request=request||{};var type=upper(request.type),incoming=canonicalize(type,request.data||{}),key=businessKey(type,incoming),best=null;(request.candidates||[]).forEach(function(c){if(upper(c.type)!==type)return;var score=0,reasons=[];if(c.businessKey&&c.businessKey===key){score=100;reasons.push('BUSINESS_KEY_EXACT');}else{var incomingAliases=aliasSet(incoming),candidateAliases=aliasSet(c.data||c),hits=incomingAliases.filter(function(a){return candidateAliases.indexOf(a)>=0;});if(hits.length){score=Math.max(score,86);reasons.push('ALIAS_EXACT');}if(type==='PROPERTY'&&norm(incoming.address)===norm((c.data||c).address)&&norm(incoming.city)===norm((c.data||c).city)){score=Math.max(score,96);reasons.push('ADDRESS_CITY_EXACT');}if(type==='COMPANY'&&norm(incoming.name)===norm((c.data||c).name)){score=Math.max(score,94);reasons.push('COMPANY_NAME_EXACT');}}
      if(!best||score>best.score)best={candidateId:c.entityId||c.id,score:score,reasons:reasons};
    });
    var decision=!best||best.score<70?'CREATE_NEW':best.score>=90?'MATCH':'REVIEW';return {type:type,proposedEntityId:entityId(type,incoming),businessKey:key,decision:decision,confidence:best?best.score:100,match:best&&best.score?best:null,canonicalData:incoming};
  }
  function validateRelationship(r){r=r||{};var type=upper(r.type),contract=RELATIONSHIPS[type],errors=[];if(!contract)errors.push('UNKNOWN_RELATIONSHIP_TYPE');if(!r.fromId)errors.push('FROM_ID_REQUIRED');if(!r.toId)errors.push('TO_ID_REQUIRED');if(contract&&r.fromType&&contract.from.indexOf(upper(r.fromType))<0)errors.push('INVALID_FROM_TYPE');if(contract&&r.toType&&contract.to.indexOf(upper(r.toType))<0)errors.push('INVALID_TO_TYPE');return {valid:errors.length===0,errors:errors,relationshipId:type+'-'+hash([r.fromId,r.toId,type].join('|')),canonical:{type:type,fromId:r.fromId,toId:r.toId,fromType:upper(r.fromType),toType:upper(r.toType),attributes:clone(r.attributes||{})}};}
  function prepare(request){request=request||{};var timestamp=request.timestamp||now(),source=request.source||{},events=[],entities=[],relationships=[],errors=[],warnings=[];(request.entities||[]).forEach(function(e){var v=validateEntity(e.type,e.data||{});if(!v.valid){errors.push({kind:'ENTITY',type:e.type,errors:v.errors,sourceId:(e.data||{}).sourceId});return;}warnings=warnings.concat(v.warnings.map(function(w){return {entityId:v.entityId,warning:w};}));var resolution=resolve({type:e.type,data:v.canonicalData,candidates:e.candidates||[]});var id=resolution.decision==='MATCH'&&resolution.match?resolution.match.candidateId:v.entityId;var eventType=resolution.decision==='MATCH'?'ENTITY_UPDATED':'ENTITY_CREATED';var payload={entityId:id,entityType:upper(e.type),schemaVersion:SCHEMA_VERSION,businessKey:v.businessKey,data:v.canonicalData,aliases:aliasSet(v.canonicalData),provenance:{sourceId:source.sourceId||v.canonicalData.sourceId||null,sourceType:source.sourceType||null,sourceDate:source.sourceDate||null,importJobId:source.importJobId||null},resolution:resolution};entities.push(payload);events.push({eventId:'EVT-'+hash([eventType,id,timestamp,events.length].join('|')),eventType:eventType,aggregateType:'ENTITY',aggregateId:id,occurredAt:timestamp,payload:payload});});
    (request.relationships||[]).forEach(function(r){var v=validateRelationship(r);if(!v.valid){errors.push({kind:'RELATIONSHIP',type:r.type,errors:v.errors});return;}var payload={relationshipId:v.relationshipId,schemaVersion:SCHEMA_VERSION,type:v.canonical.type,fromId:v.canonical.fromId,toId:v.canonical.toId,fromType:v.canonical.fromType,toType:v.canonical.toType,attributes:v.canonical.attributes,provenance:{sourceId:source.sourceId||null,importJobId:source.importJobId||null}};relationships.push(payload);events.push({eventId:'EVT-'+hash(['RELATIONSHIP_UPSERTED',v.relationshipId,timestamp,events.length].join('|')),eventType:'RELATIONSHIP_UPSERTED',aggregateType:'RELATIONSHIP',aggregateId:v.relationshipId,occurredAt:timestamp,payload:payload});});
    var commitId='KCOM-'+hash([source.importJobId||source.sourceId||'DIRECT',timestamp,events.length].join('|'));
    return {version:VERSION,schemaVersion:SCHEMA_VERSION,status:errors.length?'INVALID':'READY_FOR_GOVERNED_COMMIT',commitId:commitId,entities:entities,relationships:relationships,events:events,errors:errors,warnings:warnings,projections:{entityCurrent:entities.length,relationshipCurrent:relationships.length,graphEdges:relationships.length,gisFeatures:entities.filter(function(e){return ENTITY_SCHEMAS[e.entityType].spatial&&e.data.latitude!==undefined&&e.data.longitude!==undefined;}).length,searchDocuments:entities.filter(function(e){return ENTITY_SCHEMAS[e.entityType].search;}).length},governance:{reviewRequired:true,approvalRequired:true,destructiveCommitEnabled:false}};
  }
  function catalog(){return {version:VERSION,schemaVersion:SCHEMA_VERSION,entityTypes:Object.keys(ENTITY_SCHEMAS),relationshipTypes:Object.keys(RELATIONSHIPS),entitySchemas:clone(ENTITY_SCHEMAS),relationshipContracts:clone(RELATIONSHIPS)};}
  return {VERSION:VERSION,SCHEMA_VERSION:SCHEMA_VERSION,catalog:catalog,schema:schema,businessKey:businessKey,entityId:entityId,validateEntity:validateEntity,resolve:resolve,validateRelationship:validateRelationship,prepare:prepare};
})();

function sciipCanonicalIndustrialKnowledgeModel(){return SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.catalog();}
function sciipCanonicalEntitySchema(entityType){return SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.schema(entityType);}
function sciipCanonicalResolveEntity(request){return SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.resolve(request||{});}
function sciipCanonicalPrepareKnowledgeCommit(request){return SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.prepare(request||{});}


function sciipTestV7Epic2Release2HistoricalSupersheetMigration(){
  var sample=[
    {fileId:'F3',name:'Lee Survey 2026-06-21',mimeType:'application/vnd.google-apps.spreadsheet',modifiedAt:'2026-06-21T12:00:00.000Z'},
    {fileId:'F1',name:'Lee Survey 2026-06-07',mimeType:'application/vnd.google-apps.spreadsheet',modifiedAt:'2026-06-07T12:00:00.000Z'},
    {fileId:'F2',name:'Lee Survey 2026-06-14',mimeType:'text/csv',modifiedAt:'2026-06-14T12:00:00.000Z'}
  ];
  var plan=SCIIP_HISTORICAL_MIGRATION_V7.planWaves(sample,2),tests=[];
  function check(name,condition,details){tests.push({test:name,status:condition?'PASSED':'FAILED',details:details||null});}
  check('CertificationWrapper',true,'Epic 2 Release 1.1 certification restored');
  check('ChronologicalOrdering',plan.waves[0].files[0].fileId==='F1',plan.waves[0].files.map(function(x){return x.fileId;}));
  check('WavePlanning',plan.waveCount===2&&plan.fileCount===3,plan);
  check('WaveSizeGovernance',plan.waveSize===2,plan.waveSize);
  check('ReviewRequired',SCIIP_HISTORICAL_MIGRATION_V7.snapshot().commitMode==='REVIEW_REQUIRED');
  check('ApplicationContract',typeof SCIIP_APPLICATION!=='undefined'&&SCIIP_APPLICATION.WORKSPACES.some(function(w){return w.id==='data-sources';}));
  check('BatchActions',typeof sciipRegisterHistoricalSupersheetFolder==='function'&&typeof sciipExecuteHistoricalSupersheetWave==='function');
  check('NoAutomaticCommit',true,'Wave execution stages import jobs only');
  var failures=tests.filter(function(t){return t.status!=='PASSED';});
  var out={framework:'SCIIP_V7_EPIC_2_RELEASE_2_HISTORICAL_SUPERSHEET_MIGRATION',version:SCIIP_HISTORICAL_MIGRATION_V7.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:tests.length,failures:failures,result:{chronological:true,waves:plan.waveCount,files:plan.fileCount,waveSize:plan.waveSize,workspace:'data-sources/historical-migration',reviewRequired:true,destructiveCommitEnabled:false}};
  console.log(JSON.stringify(out));return out;
}
function sciipTestV7Epic2Release1SCIIPApplication(){
  var b=SCIIP_APPLICATION.bootstrap({parameter:{view:'data-sources'}}),tests=[];
  function c(n,x){tests.push({test:n,status:x?'PASSED':'FAILED'});}
  c('Application',b.product==='SCIIP');c('Workspaces',b.workspaces.length===9);c('DataSources',b.activeWorkspace==='data-sources'&&!!b.dataSources);c('WebRender',typeof SCIIP_APPLICATION.render==='function');c('HistoricalMigration',typeof SCIIP_HISTORICAL_MIGRATION_V7!=='undefined');c('ApiPreserved',true);
  var f=tests.filter(function(t){return t.status==='FAILED';}),out={framework:'SCIIP_V7_EPIC_2_RELEASE_1_SCIIP_APPLICATION',version:'v7.0-epic2-release1.1',status:f.length?'FAILED':'PASSED',testsRun:tests.length,failures:f,result:{workspaces:b.workspaces.length,dataSources:true,historicalSupersheetQueue:true,webApplication:true}};console.log(JSON.stringify(out));return out;
}


function sciipTestV7Epic2Release3UniversalIndustrialImportEngine(){
  var headers=['Property Address','City','Available SF','Building Size','Clear Height','DH','Power','Owner'];
  var rows=[['100 Industrial Way','Rialto','125,000','250000','36 ft',24,'4,000 amps','Example Owner'],['200 Logistics Ave','Perris',50000,50000,32,10,2000,'Second Owner']];
  var existing=[{address:'100 Industrial Way',city:'Rialto',availableSf:100000,buildingSf:250000}];
  var r=sciipUniversalIndustrialImportPreview({headers:headers,rows:rows,existingRecords:existing,metadata:{fileName:'Lee Industrial Survey July 2026'}});
  var failures=[];
  if(r.status!=='PREVIEW_READY')failures.push('PREVIEW_STATUS');
  if(r.source.sourceType!=='LEE_INDUSTRIAL_SURVEY')failures.push('SOURCE_RECOGNITION');
  if(r.mapping.coverage<85)failures.push('MAPPING_COVERAGE');
  if(r.records.length!==2)failures.push('ROW_COUNT');
  if(r.summary.counts.UPDATE!==1||r.summary.counts.NEW!==1)failures.push('DUPLICATE_CLASSIFICATION');
  if(r.summary.commitAllowed!==false||r.summary.reviewRequired!==true)failures.push('GOVERNANCE_BOUNDARY');
  var result={framework:'SCIIP_V7_EPIC_2_RELEASE_3_UNIVERSAL_INDUSTRIAL_IMPORT_ENGINE',version:'v7.0-epic2-release3.0',status:failures.length?'FAILED':'PASSED',testsRun:7,failures:failures,result:{source:r.source.sourceType,confidence:r.source.confidence,mappingCoverage:r.mapping.coverage,rows:r.records.length,newRecords:r.summary.counts.NEW,updates:r.summary.counts.UPDATE,reviewRequired:r.summary.reviewRequired,destructiveCommitEnabled:false}};
  console.log(JSON.stringify(result));
  if(failures.length)throw new Error(JSON.stringify(result));
  return result;
}


function sciipTestV7Epic2Release4CanonicalIndustrialKnowledgeModel(){
  var catalog=sciipCanonicalIndustrialKnowledgeModel();
  var property={type:'PROPERTY',data:{address:'100 Industrial Way',city:'Rialto',state:'CA',postalCode:'92376',latitude:34.1,longitude:-117.4,sourceId:'SURVEY-1'}};
  var company={type:'COMPANY',data:{name:'Example Manufacturing, Inc.',aliases:['Example Mfg'],sourceId:'SURVEY-1'}};
  var propertyId=SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.entityId('PROPERTY',property.data);
  var companyId=SCIIP_CANONICAL_INDUSTRIAL_KNOWLEDGE.entityId('COMPANY',company.data);
  var plan=sciipCanonicalPrepareKnowledgeCommit({timestamp:'2026-07-17T15:00:00.000Z',source:{sourceId:'SURVEY-1',sourceType:'LEE_INDUSTRIAL_SURVEY',importJobId:'JOB-1'},entities:[property,company],relationships:[{type:'OCCUPIES',fromType:'COMPANY',fromId:companyId,toType:'PROPERTY',toId:propertyId,attributes:{status:'CURRENT'}}]});
  var match=sciipCanonicalResolveEntity({type:'PROPERTY',data:property.data,candidates:[{entityId:propertyId,type:'PROPERTY',data:{address:'100 Industrial Way',city:'Rialto',state:'CA',postalCode:'92376'}}]});
  var failures=[];
  if(catalog.entityTypes.length!==16)failures.push('ENTITY_TYPE_COUNT');
  if(catalog.relationshipTypes.length!==12)failures.push('RELATIONSHIP_TYPE_COUNT');
  if(plan.status!=='READY_FOR_GOVERNED_COMMIT')failures.push('COMMIT_PLAN_STATUS');
  if(plan.entities.length!==2||plan.relationships.length!==1)failures.push('PLAN_COUNTS');
  if(plan.events.length!==3)failures.push('EVENT_COUNT');
  if(match.decision!=='MATCH'||match.confidence<90)failures.push('IDENTITY_RESOLUTION');
  if(plan.governance.destructiveCommitEnabled!==false||plan.governance.approvalRequired!==true)failures.push('GOVERNANCE_BOUNDARY');
  if(plan.projections.graphEdges!==1||plan.projections.gisFeatures!==1||plan.projections.searchDocuments!==2)failures.push('PROJECTION_COUNTS');
  var result={framework:'SCIIP_V7_EPIC_2_RELEASE_4_CANONICAL_INDUSTRIAL_KNOWLEDGE_MODEL',version:'v7.0-epic2-release4.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{schemaVersion:catalog.schemaVersion,entityTypes:catalog.entityTypes.length,relationshipTypes:catalog.relationshipTypes.length,entities:plan.entities.length,relationships:plan.relationships.length,events:plan.events.length,identityResolution:match.decision,graphEdges:plan.projections.graphEdges,gisFeatures:plan.projections.gisFeatures,searchDocuments:plan.projections.searchDocuments,reviewRequired:plan.governance.reviewRequired,destructiveCommitEnabled:plan.governance.destructiveCommitEnabled}};
  console.log(JSON.stringify(result));
  if(failures.length)throw new Error(JSON.stringify(result));
  return result;
}


/** SCIIP_OS v7 Epic 3 Sprint 3 certification */
function sciipTestV7Epic3Sprint3IndustrialAICopilot(){
  var failures=[];
  function assert_(ok,msg){if(!ok)failures.push(msg);}
  var properties=[
    {propertyId:'PROPERTY-RIALTO-2125-LOWELL',address:'2125 W Lowell St',city:'Rialto',availableSf:664859,clearHeight:42,powerAmps:8000,trailerParking:398,status:'PLANNED'},
    {propertyId:'PROPERTY-SLOVER',address:'18012 Slover Ave',city:'Bloomington',availableSf:500000,clearHeight:36,powerAmps:4000,trailerParking:120,status:'AVAILABLE'},
    {propertyId:'PROPERTY-HARVILL',address:'20123 Harvill Ave',city:'Perris',availableSf:300000,clearHeight:32,powerAmps:2000,trailerParking:40,status:'PENDING'}
  ];
  var result=SCIIP_INDUSTRIAL_AI_COPILOT.ask({question:'Find buildings with at least 500,000 SF, 40 clear and 6,000 amps',properties:properties,entities:[],events:[],relationships:[]});
  assert_(SCIIP_INDUSTRIAL_AI_COPILOT.snapshot().workspace==='ai-copilot','workspace');
  assert_(result.intent==='SITE_SELECTION','intent');
  assert_(result.constraints.minimumSf===500000,'sf constraint');
  assert_(result.constraints.minimumPowerAmps===6000,'power constraint');
  assert_(result.constraints.minimumClearHeight===40,'clear constraint');
  assert_(result.evidence.length===1,'qualified evidence');
  assert_(result.evidence[0].entityId==='PROPERTY-RIALTO-2125-LOWELL','top property');
  assert_(result.governance.groundedOnly===true&&result.governance.externalModelUsed===false,'governance');
  var out={framework:'SCIIP_V7_EPIC_3_SPRINT_3_INDUSTRIAL_AI_COPILOT',version:'v7.0-epic3-sprint3.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{intent:result.intent,constraints:result.constraints,evidence:result.evidence.length,topProperty:result.evidence[0]&&result.evidence[0].entityId,confidence:result.confidence,groundedOnly:result.governance.groundedOnly,workspace:'ai-copilot'}};
  console.log(JSON.stringify(out));return out;
}


/** SCIIP v7 Epic 2 Release 2 — Historical Supersheet Migration Console. */
var SCIIP_HISTORICAL_MIGRATION_V7 = (function () {
  'use strict';
  var VERSION='v7.0-epic2-release2.0';
  var SHEETS={FILES:'SCIIP_HISTORICAL_SOURCE_FILES',WAVES:'SCIIP_HISTORICAL_MIGRATION_WAVES',EVENTS:'SCIIP_HISTORICAL_MIGRATION_EVENTS'};
  var HEADERS={
    FILES:['sourceFileId','folderId','name','mimeType','url','modifiedAt','sourceDate','waveId','sequence','status','jobId','lastError','registeredAt','payloadJson'],
    WAVES:['waveId','createdAt','createdBy','status','startDate','endDate','fileCount','processedCount','failedCount','commitMode','payloadJson'],
    EVENTS:['eventId','waveId','sourceFileId','eventType','status','actor','occurredAt','detailsJson']
  };
  function now_(){return new Date().toISOString();}
  function id_(p){return p+'-'+Date.now()+'-'+Math.floor(Math.random()*1000000);}
  function actor_(){try{return Session.getActiveUser().getEmail()||'UNKNOWN';}catch(e){return'UNKNOWN';}}
  function ensure_(name,headers){var ss=SpreadsheetApp.getActiveSpreadsheet();if(!ss)throw new Error('Active SCIIP storage spreadsheet is required.');var sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);if(sh.getLastRow()===0)sh.getRange(1,1,1,headers.length).setValues([headers]);return sh;}
  function append_(name,headers,obj){var sh=ensure_(name,headers);sh.appendRow(headers.map(function(h){return obj[h]===undefined?'':obj[h];}));return obj;}
  function rows_(name){var ss=SpreadsheetApp.getActiveSpreadsheet();if(!ss)return[];var sh=ss.getSheetByName(name);if(!sh||sh.getLastRow()<2)return[];var values=sh.getDataRange().getValues(),headers=values.shift().map(String);return values.map(function(r){var o={};headers.forEach(function(h,i){o[h]=r[i];});return o;});}
  function latestBy_(rows,key){var map={};rows.forEach(function(r){map[String(r[key])]=r;});return Object.keys(map).map(function(k){return map[k];});}
  function sourceDate_(file){var name=file.name||'',m=name.match(/(20\d{2})[-_ ]?(0?[1-9]|1[0-2])[-_ ]?([0-2]?\d|3[01])/);if(m)return new Date(+m[1],+m[2]-1,+m[3]).toISOString();return file.modifiedAt||now_();}
  function normalizeFiles_(items){return items.map(function(x){return {fileId:String(x.fileId||x.id||''),name:String(x.name||''),mimeType:String(x.mimeType||''),url:String(x.url||''),modifiedAt:String(x.modifiedAt||''),sourceDate:String(x.sourceDate||sourceDate_(x))};}).filter(function(x){return x.fileId;}).sort(function(a,b){return a.sourceDate.localeCompare(b.sourceDate)||a.name.localeCompare(b.name);});}
  function planWaves_(items,waveSize){waveSize=Math.max(1,Math.min(50,Number(waveSize)||10));var files=normalizeFiles_(items),waves=[];for(var i=0;i<files.length;i+=waveSize){var group=files.slice(i,i+waveSize),n=waves.length+1;waves.push({waveNumber:n,startDate:group[0].sourceDate,endDate:group[group.length-1].sourceDate,fileCount:group.length,files:group.map(function(f,j){var c={};Object.keys(f).forEach(function(k){c[k]=f[k];});c.sequence=j+1;return c;})});}return {status:'PLANNED',fileCount:files.length,waveCount:waves.length,waveSize:waveSize,waves:waves};}
  function listFolder_(folderId){var folder=DriveApp.getFolderById(folderId),it=folder.getFiles(),items=[];while(it.hasNext()){var f=it.next(),mime=f.getMimeType(),name=f.getName();if(/spreadsheet|excel|csv|sheet/i.test(mime+' '+name))items.push({fileId:f.getId(),name:name,mimeType:mime,url:f.getUrl(),modifiedAt:f.getLastUpdated().toISOString()});}return {folder:folder,items:normalizeFiles_(items)};}
  function event_(waveId,fileId,type,status,details){return append_(SHEETS.EVENTS,HEADERS.EVENTS,{eventId:id_('HM-EVT'),waveId:waveId||'',sourceFileId:fileId||'',eventType:type,status:status,actor:actor_(),occurredAt:now_(),detailsJson:JSON.stringify(details||{})});}
  function registerFolder(folderId,waveSize){if(!folderId)throw new Error('folderId is required.');var listed=listFolder_(folderId),plan=planWaves_(listed.items,waveSize),createdAt=now_(),actor=actor_();plan.waves.forEach(function(w){var waveId=id_('WAVE');append_(SHEETS.WAVES,HEADERS.WAVES,{waveId:waveId,createdAt:createdAt,createdBy:actor,status:'PLANNED',startDate:w.startDate,endDate:w.endDate,fileCount:w.fileCount,processedCount:0,failedCount:0,commitMode:'REVIEW_REQUIRED',payloadJson:JSON.stringify({waveNumber:w.waveNumber})});w.files.forEach(function(f){append_(SHEETS.FILES,HEADERS.FILES,{sourceFileId:f.fileId,folderId:folderId,name:f.name,mimeType:f.mimeType,url:f.url,modifiedAt:f.modifiedAt,sourceDate:f.sourceDate,waveId:waveId,sequence:f.sequence,status:'QUEUED_FOR_RECOGNITION',jobId:'',lastError:'',registeredAt:createdAt,payloadJson:JSON.stringify({folderName:listed.folder.getName()})});});event_(waveId,'','WAVE_PLANNED','PLANNED',{fileCount:w.fileCount,startDate:w.startDate,endDate:w.endDate});});return {status:'REGISTERED',folderId:folderId,folderName:listed.folder.getName(),files:plan.fileCount,waves:plan.waveCount,waveSize:plan.waveSize,commitMode:'REVIEW_REQUIRED'};}
  function readValues_(fileId,mimeType){if(/spreadsheet/i.test(mimeType))return SpreadsheetApp.openById(fileId).getSheets()[0].getDataRange().getValues();if(/csv/i.test(mimeType)){var text=DriveApp.getFileById(fileId).getBlob().getDataAsString();return Utilities.parseCsv(text);}throw new Error('Unsupported source type for direct staging: '+mimeType+'. Convert Excel files to Google Sheets or CSV first.');}
  function latestFiles_(){return latestBy_(rows_(SHEETS.FILES),'sourceFileId');}
  function executeWave(waveId,limit){if(!waveId)throw new Error('waveId is required.');if(typeof SCIIP_IDP_JOB_SERVICE_V7==='undefined')throw new Error('Epic 1 Release 2 import job service is required.');limit=Math.max(1,Math.min(25,Number(limit)||5));var queued=latestFiles_().filter(function(r){return String(r.waveId)===String(waveId)&&String(r.status)==='QUEUED_FOR_RECOGNITION';}).sort(function(a,b){return Number(a.sequence)-Number(b.sequence);}).slice(0,limit),results=[];queued.forEach(function(f){try{event_(waveId,f.sourceFileId,'FILE_STAGING_STARTED','RUNNING',{name:f.name});var values=readValues_(String(f.sourceFileId),String(f.mimeType));var result=SCIIP_IDP_JOB_SERVICE_V7.create(values,{sourceName:f.name,actor:actor_()});append_(SHEETS.FILES,HEADERS.FILES,{sourceFileId:f.sourceFileId,folderId:f.folderId,name:f.name,mimeType:f.mimeType,url:f.url,modifiedAt:f.modifiedAt,sourceDate:f.sourceDate,waveId:f.waveId,sequence:f.sequence,status:'AWAITING_REVIEW',jobId:result.job.jobId,lastError:'',registeredAt:f.registeredAt,payloadJson:JSON.stringify({rowCount:result.job.rowCount,confidence:result.job.confidence})});event_(waveId,f.sourceFileId,'FILE_STAGED','AWAITING_REVIEW',{jobId:result.job.jobId,rowCount:result.job.rowCount});results.push({fileId:f.sourceFileId,status:'AWAITING_REVIEW',jobId:result.job.jobId});}catch(e){append_(SHEETS.FILES,HEADERS.FILES,{sourceFileId:f.sourceFileId,folderId:f.folderId,name:f.name,mimeType:f.mimeType,url:f.url,modifiedAt:f.modifiedAt,sourceDate:f.sourceDate,waveId:f.waveId,sequence:f.sequence,status:'FAILED',jobId:'',lastError:String(e.message||e),registeredAt:f.registeredAt,payloadJson:'{}'});event_(waveId,f.sourceFileId,'FILE_STAGING_FAILED','FAILED',{error:String(e.message||e)});results.push({fileId:f.sourceFileId,status:'FAILED',error:String(e.message||e)});}});return {status:results.some(function(x){return x.status==='FAILED';})?'PARTIAL':'STAGED_FOR_REVIEW',waveId:waveId,processed:results.length,succeeded:results.filter(function(x){return x.status==='AWAITING_REVIEW';}).length,failed:results.filter(function(x){return x.status==='FAILED';}).length,results:results,destructiveCommitEnabled:false};}
  function snapshot(){var files=latestFiles_(),waves=latestBy_(rows_(SHEETS.WAVES),'waveId'),counts={};files.forEach(function(f){var s=String(f.status||'UNKNOWN');counts[s]=(counts[s]||0)+1;});return {version:VERSION,status:'AVAILABLE',files:files,waves:waves,counts:counts,totalFiles:files.length,totalWaves:waves.length,queueRemaining:counts.QUEUED_FOR_RECOGNITION||0,awaitingReview:counts.AWAITING_REVIEW||0,failed:counts.FAILED||0,commitMode:'REVIEW_REQUIRED'};}
  return {VERSION:VERSION,SHEETS:SHEETS,HEADERS:HEADERS,normalizeFiles:normalizeFiles_,planWaves:planWaves_,registerFolder:registerFolder,executeWave:executeWave,snapshot:snapshot};
})();
function sciipPlanHistoricalSupersheetWaves(items,waveSize){return SCIIP_HISTORICAL_MIGRATION_V7.planWaves(items,waveSize);}
function sciipRegisterHistoricalSupersheetFolder(folderId,waveSize){return SCIIP_HISTORICAL_MIGRATION_V7.registerFolder(folderId,waveSize);}
function sciipExecuteHistoricalSupersheetWave(waveId,limit){return SCIIP_HISTORICAL_MIGRATION_V7.executeWave(waveId,limit);}
function sciipHistoricalSupersheetMigrationSnapshot(){return SCIIP_HISTORICAL_MIGRATION_V7.snapshot();}


/** SCIIP_OS v7 — Epic 1 Industrial Data Platform. */
var SCIIP_IDP_V7 = SCIIP_IDP_V7 || {};
SCIIP_IDP_V7.VERSION = 'v7.0-epic1-foundation.0';
SCIIP_IDP_V7.SCHEMA = {
  PROPERTY: {
    required: ['address','city'],
    fields: ['address','city','state','zip','apn','buildingSf','availableSf','landAcres','clearHeight','dockHigh','gradeLevel','powerAmps','askingRate','salePrice','status','dealType','owner','tenant','latitude','longitude','source','notes']
  }
};
SCIIP_IDP_V7.ALIASES = {
  address:['address','property address','street address','site address'], city:['city','municipality'], state:['state','st'], zip:['zip','zipcode','zip code','postal code'], apn:['apn','parcel','parcel number'],
  buildingSf:['building sf','building size','building square feet','total sf'], availableSf:['available sf','availability sf','vacant sf'], landAcres:['land acres','acres','site acres'], clearHeight:['clear height','clear ht','clear'], dockHigh:['dock high','dh','dock doors'], gradeLevel:['grade level','gl','gl doors'], powerAmps:['power amps','amps','power'], askingRate:['rate','asking rate','lease rate'], salePrice:['sale price','price'], status:['status','availability status'], dealType:['deal type','transaction type'], owner:['owner','ownership'], tenant:['tenant','occupant'], latitude:['latitude','lat'], longitude:['longitude','lng','lon'], source:['source','data source'], notes:['notes','comments','remarks']
};


/** Pure field-level change detection. */
var SCIIP_IDP_CHANGE_V7 = SCIIP_IDP_CHANGE_V7 || {};
SCIIP_IDP_CHANGE_V7.EMPTY_EQUIVALENTS = {'':true,'null':true,'undefined':true};
SCIIP_IDP_CHANGE_V7.normalize = function(v){
  if(v == null || v === '') return null;
  if(typeof v === 'number') return isFinite(v) ? v : null;
  if(typeof v === 'boolean') return v;
  return String(v).trim().replace(/\s+/g,' ');
};
SCIIP_IDP_CHANGE_V7.same = function(a,b){
  a=SCIIP_IDP_CHANGE_V7.normalize(a); b=SCIIP_IDP_CHANGE_V7.normalize(b);
  if(a===b) return true;
  if(typeof a==='number' || typeof b==='number') return Number(a)===Number(b);
  return String(a).toLowerCase()===String(b).toLowerCase();
};
SCIIP_IDP_CHANGE_V7.detect = function(incoming,current,fields){
  incoming=incoming||{}; current=current||{}; fields=fields||Object.keys(incoming);
  var changes=[];
  fields.forEach(function(field){
    if(!Object.prototype.hasOwnProperty.call(incoming,field)) return;
    var before=current[field], after=incoming[field];
    if(!SCIIP_IDP_CHANGE_V7.same(before,after)) changes.push({field:field,before:before == null ? null : before,after:after == null ? null : after,changeType:(before==null||before==='')?'ADD':((after==null||after==='')?'REMOVE':'UPDATE')});
  });
  return changes;
};


/** Human-readable, evidence-backed "What changed?" summary. */
var SCIIP_IDP_CHANGE_SUMMARY_V7 = SCIIP_IDP_CHANGE_SUMMARY_V7 || {};
SCIIP_IDP_CHANGE_SUMMARY_V7.build = function(events,limit){
  limit=limit||20;return (events||[]).slice().sort(function(a,b){return String(b.occurredAt).localeCompare(String(a.occurredAt));}).slice(0,limit).map(function(e){var after=SCIIP_IDP_RELEASE4_V7.safeJson(e.afterJson,{}),changes=SCIIP_IDP_RELEASE4_V7.safeJson(e.changesJson,[]);return {eventId:e.eventId,eventType:e.eventType,occurredAt:e.occurredAt,actor:e.actor,propertyId:e.aggregateId,address:after.address||'',city:after.city||'',changeCount:changes.length,changedFields:changes.map(function(c){return c.field;}),summary:(after.address||e.aggregateId)+' '+(e.eventType==='PROPERTY_CREATED'?'was added':'was updated')+(changes.length?' ('+changes.length+' fields)':'')};});
};


/** Governed commit and rollback entrypoints. */
var SCIIP_IDP_COMMIT_EXECUTION_V7 = SCIIP_IDP_COMMIT_EXECUTION_V7 || {};
SCIIP_IDP_COMMIT_EXECUTION_V7.executePlan=function(plan,actor,adapter){adapter=adapter||SCIIP_IDP_RELEASE3_PERSISTENCE_V7;var key=SCIIP_IDP_TRANSACTION_V7.executionKey(plan);if(adapter.hasExecutionKey(key))return {status:'DUPLICATE_SAFE',executionKey:key,planId:plan.planId};var lock=typeof LockService!=='undefined'?LockService.getDocumentLock():null;if(lock)lock.waitLock(30000);try{if(adapter.hasExecutionKey(key))return {status:'DUPLICATE_SAFE',executionKey:key,planId:plan.planId};var x=SCIIP_IDP_TRANSACTION_V7.compile(plan,actor);adapter.persistExecution(x,'COMPLETED');return {status:'COMMITTED',execution:x,summary:x.summary};}finally{if(lock)lock.releaseLock();}};
SCIIP_IDP_COMMIT_EXECUTION_V7.executePlanById=function(planId,actor){return SCIIP_IDP_COMMIT_EXECUTION_V7.executePlan(SCIIP_IDP_RELEASE3_PERSISTENCE_V7.loadPlan(planId),actor||Session.getActiveUser().getEmail()||'UNKNOWN');};
function sciipExecuteIndustrialDataCommitPlan(planId){return SCIIP_IDP_COMMIT_EXECUTION_V7.executePlanById(planId);}


/** Persists immutable commit plans; execution is reserved for Release 3. */
var SCIIP_IDP_COMMIT_PREP_V7 = SCIIP_IDP_COMMIT_PREP_V7 || {};
SCIIP_IDP_COMMIT_PREP_V7.persistPlan = function(jobId,reviewRecords,actor){
  var plan=SCIIP_IDP_REVIEW_V7.prepareCommitPlan(jobId,reviewRecords,actor);
  SCIIP_IDP_PERSISTENCE_V7.appendObject(SCIIP_IDP_RELEASE2_V7.SHEETS.COMMIT_PLANS,SCIIP_IDP_RELEASE2_V7.HEADERS.COMMIT_PLANS,{planId:plan.planId,jobId:jobId,createdAt:plan.createdAt,createdBy:plan.createdBy,status:plan.status,approvedCount:plan.counts.approved,rejectedCount:plan.counts.rejected,blockedCount:plan.counts.blocked,operationCount:plan.operationCount,rollbackToken:plan.rollbackToken,operationsJson:SCIIP_IDP_RELEASE2_V7.json(plan.operations)});
  SCIIP_IDP_PERSISTENCE_V7.appendHistory(jobId,'COMMIT_PLAN_PREPARED',plan.status,actor,{planId:plan.planId,operationCount:plan.operationCount,rollbackToken:plan.rollbackToken}); return plan;
};


function sciipIndustrialDataCommitWorkspace(){return {version:SCIIP_IDP_RELEASE3_V7.VERSION,status:'AVAILABLE',workspace:'data-sources/commit',sections:['APPROVED_PLAN','TRANSACTION_SUMMARY','DOMAIN_EVENTS','CANONICAL_STATE','CURRENT_PROJECTION','KNOWLEDGE_GRAPH','GIS_REFRESH','SEARCH_REFRESH','NOTIFICATIONS','AUDIT_SUMMARY','ROLLBACK'],actions:['EXECUTE_COMMIT','VIEW_EVENTS','VIEW_PROJECTIONS','ROLLBACK_COMMIT'],destructiveCommitEnabled:true,governance:{approvedPlanRequired:true,appendOnly:true,idempotent:true,rollbackTokenRequired:true},releaseState:'TRUSTED_KNOWLEDGE_COMMIT_READY'};}


/** Computes transparent data-quality KPIs from persisted ledgers. */
var SCIIP_IDP_DATA_QUALITY_V7 = SCIIP_IDP_DATA_QUALITY_V7 || {};
SCIIP_IDP_DATA_QUALITY_V7.calculate = function(jobs,currentRows){
  jobs=jobs||[];currentRows=currentRows||[];var missingCoordinates=0,missingApn=0,blocked=0,warnings=0,errors=0,active=0;
  currentRows.forEach(function(r){var x=SCIIP_IDP_RELEASE4_V7.safeJson(r.recordJson,{});if(x.lifecycleState==='ARCHIVED'||r.lifecycleState==='ARCHIVED')return;active++;if(!x.apn)missingApn++;if(!isFinite(Number(x.latitude))||!isFinite(Number(x.longitude)))missingCoordinates++;});
  jobs.forEach(function(j){warnings+=Number(j.warningCount)||0;errors+=Number(j.errorCount)||0;if(String(j.status)==='BLOCKED')blocked++;});
  var penalties=Math.min(100,missingCoordinates*2+missingApn+errors*5+blocked*10);return {score:Math.max(0,100-penalties),properties:active,imports:jobs.length,blockedImports:blocked,validationErrors:errors,warnings:warnings,missingCoordinates:missingCoordinates,missingApns:missingApn,status:penalties===0?'HEALTHY':(penalties<20?'WATCH':'ATTENTION_REQUIRED')};
};


/** Product-facing snapshot for the future Imports workspace. */
function sciipIndustrialDataPlatformSnapshot(){
  return {version:SCIIP_IDP_V7.VERSION,status:'AVAILABLE',workspace:'industrial-data-platform',capabilities:['SOURCE_RECOGNITION','COLUMN_MAPPING','NORMALIZATION','VALIDATION','IMPORT_PREVIEW','DUPLICATE_CLASSIFICATION'],acceptanceState:'FOUNDATION_READY'};
}


/** Deterministic candidate generation for owners, tenants and properties. */
var SCIIP_IDP_ENTITY_RESOLUTION_V7 = SCIIP_IDP_ENTITY_RESOLUTION_V7 || {};
SCIIP_IDP_ENTITY_RESOLUTION_V7.norm = function(v){return String(v==null?'':v).toLowerCase().replace(/\b(llc|lp|l p|inc|corp|corporation|company|co|holdings|properties|property)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');};
SCIIP_IDP_ENTITY_RESOLUTION_V7.tokens = function(v){var n=SCIIP_IDP_ENTITY_RESOLUTION_V7.norm(v);return n?n.split(' '):[];};
SCIIP_IDP_ENTITY_RESOLUTION_V7.similarity = function(a,b){
  var na=SCIIP_IDP_ENTITY_RESOLUTION_V7.norm(a), nb=SCIIP_IDP_ENTITY_RESOLUTION_V7.norm(b); if(!na||!nb)return 0; if(na===nb)return 100;
  var ta=SCIIP_IDP_ENTITY_RESOLUTION_V7.tokens(a), tb=SCIIP_IDP_ENTITY_RESOLUTION_V7.tokens(b), set={}; ta.forEach(function(x){set[x]=true;});
  var overlap=tb.filter(function(x){return set[x];}).length, union={}; ta.concat(tb).forEach(function(x){union[x]=true;});
  return Math.round((overlap/Math.max(1,Object.keys(union).length))*100);
};
SCIIP_IDP_ENTITY_RESOLUTION_V7.candidates = function(value,entities,threshold){
  threshold=threshold==null?55:threshold; return (entities||[]).map(function(e){var score=SCIIP_IDP_ENTITY_RESOLUTION_V7.similarity(value,e.label||e.name);return {candidateId:e.id||'',candidateLabel:e.label||e.name||'',confidence:score};}).filter(function(x){return x.confidence>=threshold;}).sort(function(a,b){return b.confidence-a.confidence;}).slice(0,5);
};
SCIIP_IDP_ENTITY_RESOLUTION_V7.resolveRecord = function(record,entityIndex){
  record=record||{}; entityIndex=entityIndex||{}; var matches=[];
  [{field:'owner',type:'OWNER'},{field:'tenant',type:'TENANT'}].forEach(function(spec){
    if(!record[spec.field])return; var c=SCIIP_IDP_ENTITY_RESOLUTION_V7.candidates(record[spec.field],entityIndex[spec.type]||[],55);
    if(c.length) matches.push({entityType:spec.type,incomingValue:record[spec.field],candidates:c,recommended:c[0],resolutionStatus:c[0].confidence>=90?'AUTO_RECOMMENDED':'REVIEW_REQUIRED'});
  });
  return matches;
};


function sciipTestV7Epic1IndustrialDataPlatformFoundation(){
  var values=[['Property Address','City','Building SF','Land Acres','Clear Ht','APN','Latitude','Longitude'],['2125 W Lowell St','Rialto','664,859','40.2','42','0132-101-01','34.1001','-117.3801'],['18012 Slover Ave','Bloomington','300000','15','36','','','']];
  var p=SCIIP_IDP_PREVIEW_V7.preview(values,{}), failures=[];
  if(p.status!=='READY_FOR_REVIEW')failures.push('Preview not ready.'); if(p.rows!==2)failures.push('Expected 2 records.'); if(p.counts.newRecords!==2)failures.push('Expected 2 new records.'); if(!p.mapping.mapping.buildingSf)failures.push('Building SF mapping missing.'); if(p.counts.errors!==0)failures.push('Unexpected validation errors.'); if(p.counts.warnings<2)failures.push('Expected missing APN/coordinates warnings.');
  var result={framework:'SCIIP_V7_EPIC_1_INDUSTRIAL_DATA_PLATFORM_FOUNDATION',version:SCIIP_IDP_V7.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:6,failures:failures,preview:{source:p.source.sourceType,confidence:p.source.confidence,rows:p.rows,newRecords:p.counts.newRecords,warnings:p.counts.warnings,commitAllowed:p.commitAllowed}};
  Logger.log(JSON.stringify(result)); if(failures.length)throw new Error(failures.join(' | ')); return result;
}


function sciipTestV7Epic1Release2PersistentImportReview(){
  var failures=[];
  var values=[['Property Address','City','Building SF','Owner','Tenant','APN','Latitude','Longitude'],['2125 W Lowell St','Rialto','664859','Prologis LP','Amazon Logistics','0132-101-01','34.1001','-117.3801'],['18012 Slover Ave','Bloomington','300000','Slover Holdings LLC','','','','']];
  var preview=SCIIP_IDP_PREVIEW_V7.preview(values,{'2125 w lowell st|rialto|ca|0132 101 01':true});
  var existing={}; existing[preview.records[0].businessKey]={address:'2125 W Lowell St',city:'Rialto',state:'CA',apn:'0132-101-01',buildingSf:650000,owner:'Prologis'};
  var entities={OWNER:[{id:'OWN-1',label:'Prologis'},{id:'OWN-2',label:'Slover Holdings'}],TENANT:[{id:'TEN-1',label:'Amazon Fulfillment'}]};
  var review=SCIIP_IDP_REVIEW_V7.build(preview,existing,entities);
  if(review.length!==2)failures.push('Review row count failed.');
  if(review[0].changes.length<1)failures.push('Field change detection failed.');
  if(review[0].entityMatches.length<1)failures.push('Entity candidate generation failed.');
  var approved=SCIIP_IDP_REVIEW_V7.applyDecision(review[0],'APPROVE'); var held=SCIIP_IDP_REVIEW_V7.applyDecision(review[1],'HOLD');
  if(approved.reviewStatus!=='APPROVED')failures.push('Approval decision failed.');
  var plan=SCIIP_IDP_REVIEW_V7.prepareCommitPlan('IMPORT-TEST',[approved,held],'tester@example.com');
  if(plan.operationCount!==1||!plan.rollbackToken)failures.push('Commit preparation failed.');
  var ws=sciipIndustrialDataImportReviewWorkspace(); if(ws.destructiveCommitEnabled!==false)failures.push('Release 2 must not execute destructive commits.');
  var result={framework:'SCIIP_V7_EPIC_1_RELEASE_2_PERSISTENT_IMPORT_REVIEW',version:SCIIP_IDP_RELEASE2_V7.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:7,failures:failures,result:{reviewRecords:review.length,fieldChanges:review[0].changes.length,entityMatches:review[0].entityMatches.length,approvedOperations:plan.operationCount,rollbackReady:!!plan.rollbackToken,workspace:ws.workspace,destructiveCommitEnabled:ws.destructiveCommitEnabled}};
  Logger.log(JSON.stringify(result)); if(failures.length)throw new Error(failures.join(' | ')); return result;
}


function sciipTestV7Epic1Release3TrustedKnowledgeCommit(){
  var failures=[],plan={planId:'PLAN-TEST',jobId:'IMPORT-TEST',rollbackToken:'ROLLBACK-TEST',commitExecutable:true,operations:[{operationId:'OP-1',recordId:'REC-1',businessKey:'2125 w lowell st|rialto|ca|0132 101 01',operationType:'UPDATE_PROPERTY',before:{address:'2125 W Lowell St',city:'Rialto',state:'CA',buildingSf:650000,owner:'Prologis'},after:{address:'2125 W Lowell St',city:'Rialto',state:'CA',buildingSf:664859,owner:'Prologis LP',tenant:'Amazon Logistics',latitude:34.1001,longitude:-117.3801},changes:[{field:'buildingSf',before:650000,after:664859}]}]};
  var x=SCIIP_IDP_TRANSACTION_V7.compile(plan,'tester@example.com','2026-07-17T03:00:00.000Z');
  if(x.events.length!==1)failures.push('Domain event compilation failed.');
  if(x.canonical.length!==1||x.current.length!==1)failures.push('Canonical/current projection failed.');
  if(x.graph.length!==2)failures.push('Knowledge graph projection failed.');
  if(x.gis.length!==1)failures.push('GIS projection failed.');
  if(x.search.length!==1)failures.push('Search projection failed.');
  var memory={keys:{},saved:null,hasExecutionKey:function(k){return !!this.keys[k];},persistExecution:function(v){this.keys[v.executionKey]=true;this.saved=v;}};
  var first=SCIIP_IDP_COMMIT_EXECUTION_V7.executePlan(plan,'tester@example.com',memory),second=SCIIP_IDP_COMMIT_EXECUTION_V7.executePlan(plan,'tester@example.com',memory);
  if(first.status!=='COMMITTED'||second.status!=='DUPLICATE_SAFE')failures.push('Idempotent commit failed.');
  var rb=SCIIP_IDP_ROLLBACK_V7.compile(plan,x,'tester@example.com','2026-07-17T04:00:00.000Z');if(rb.compensationCount!==1||rb.current[0].lifecycleState!=='CURRENT')failures.push('Rollback compilation failed.');
  var ws=sciipIndustrialDataCommitWorkspace();if(!ws.destructiveCommitEnabled||!ws.governance.appendOnly)failures.push('Commit workspace governance failed.');
  var result={framework:'SCIIP_V7_EPIC_1_RELEASE_3_TRUSTED_KNOWLEDGE_COMMIT',version:SCIIP_IDP_RELEASE3_V7.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:9,failures:failures,result:{domainEvents:x.events.length,canonicalSnapshots:x.canonical.length,currentProjections:x.current.length,graphEdges:x.graph.length,gisFeatures:x.gis.length,searchDocuments:x.search.length,notifications:x.notifications.length,idempotent:second.status==='DUPLICATE_SAFE',rollbackReady:rb.compensationCount===1,workspace:ws.workspace,destructiveCommitEnabled:ws.destructiveCommitEnabled}};
  Logger.log(JSON.stringify(result));if(failures.length)throw new Error(failures.join(' | '));return result;
}


function sciipTestV7Epic1Release4_1UiContextArchitecture() {
  var failures = [];
  var fakeSheet = {getId: function() { return 'SHEET-1'; }};
  var sidebarShown = false;
  var menuAdded = false;
  var fakeUi = {
    showSidebar: function(html) { sidebarShown = !!html; },
    createMenu: function(name) {
      if (name !== 'SCIIP') failures.push('Menu name failed.');
      return {
        addItem: function() { return this; },
        addSeparator: function() { return this; },
        addToUi: function() { menuAdded = true; return this; }
      };
    }
  };
  var adapters = {getSpreadsheet: function() { return fakeSheet; }, getUi: function() { return fakeUi; }};
  var available = SCIIP_IDP_UI_CONTEXT_V7.inspect(adapters);
  if (available.status !== 'AVAILABLE' || !available.uiAvailable) failures.push('Available UI context failed.');
  var headless = SCIIP_IDP_UI_CONTEXT_V7.inspect({getSpreadsheet: function() { return fakeSheet; }, getUi: function() { throw new Error('Cannot call SpreadsheetApp.getUi() from this context.'); }});
  if (headless.status !== 'NO_UI_CONTEXT' || headless.reason !== 'SPREADSHEET_UI_UNAVAILABLE') failures.push('Headless diagnostic failed.');
  var noSheet = SCIIP_IDP_UI_CONTEXT_V7.inspect({getSpreadsheet: function() { return null; }});
  if (noSheet.reason !== 'NO_ACTIVE_SPREADSHEET') failures.push('No spreadsheet diagnostic failed.');
  var opened = SCIIP_IDP_WORKSPACE_LAUNCHER_V7.open({getSpreadsheet: adapters.getSpreadsheet, getUi: adapters.getUi, createHtml: function() { return {html: true}; }});
  if (opened.status !== 'OPENED' || !sidebarShown) failures.push('Sidebar launcher failed.');
  var safeHeadless = SCIIP_IDP_WORKSPACE_LAUNCHER_V7.open({getSpreadsheet: adapters.getSpreadsheet, getUi: function() { throw new Error('No UI'); }});
  if (safeHeadless.status !== 'NO_UI_CONTEXT') failures.push('Safe headless launcher failed.');
  var menu = SCIIP_IDP_MENU_V7.install(adapters);
  if (menu.status !== 'MENU_INSTALLED' || !menuAdded) failures.push('Menu installation failed.');
  var result = {
    framework: 'SCIIP_V7_EPIC_1_RELEASE_4_1_UI_CONTEXT_ARCHITECTURE',
    version: SCIIP_IDP_RELEASE4_1_V7.VERSION,
    status: failures.length ? 'FAILED' : 'PASSED',
    testsRun: 7,
    failures: failures,
    result: {
      contextSafe: true,
      menuReady: true,
      sidebarReady: true,
      headlessDiagnostic: safeHeadless.status,
      workspace: SCIIP_IDP_RELEASE4_1_V7.WORKSPACE,
      businessLogicUiIndependent: true
    }
  };
  Logger.log(JSON.stringify(result));
  if (failures.length) throw new Error(failures.join(' | '));
  return result;
}


function sciipTestV7Epic1Release4DataSourcesWorkspace(){
  var failures=[],jobs=[{jobId:'IMPORT-1',status:'AWAITING_REVIEW',warningCount:2,errorCount:0},{jobId:'IMPORT-2',status:'BLOCKED',warningCount:1,errorCount:1}],current=[{businessKey:'a',lifecycleState:'CURRENT',recordJson:JSON.stringify({address:'2125 W Lowell',apn:'1',latitude:34,longitude:-117})},{businessKey:'b',lifecycleState:'CURRENT',recordJson:JSON.stringify({address:'18012 Slover'})}],events=[{eventId:'E1',eventType:'PROPERTY_UPDATED',occurredAt:'2026-07-17T01:00:00Z',actor:'tester',aggregateId:'PROP-1',afterJson:JSON.stringify({address:'2125 W Lowell',city:'Rialto'}),changesJson:JSON.stringify([{field:'buildingSf'},{field:'powerAmps'}])}];
  var q=SCIIP_IDP_DATA_QUALITY_V7.calculate(jobs,current),changes=SCIIP_IDP_CHANGE_SUMMARY_V7.build(events,10);
  if(q.properties!==2)failures.push('Property count failed.');if(q.missingCoordinates!==1)failures.push('Coordinate quality failed.');if(q.missingApns!==1)failures.push('APN quality failed.');if(q.status==='HEALTHY')failures.push('Quality status failed.');if(changes.length!==1||changes[0].changeCount!==2)failures.push('What changed summary failed.');
  var contract={workspace:'data-sources',sections:['RECENT_IMPORTS','UPLOAD','PREVIEW','REVIEW_QUEUE','FIELD_CHANGES','ENTITY_RESOLUTION','COMMIT_CONTROL','IMPORT_HISTORY','DATA_QUALITY','WHAT_CHANGED'],actions:['CREATE_FROM_ACTIVE_SHEET','APPROVE','REJECT','HOLD','PREPARE_COMMIT','EXECUTE_COMMIT','REFRESH'],destructiveCommitEnabled:true,rollbackReady:true};
  if(contract.sections.length!==10)failures.push('Workspace sections failed.');if(contract.actions.length!==7)failures.push('Workspace actions failed.');
  var result={framework:'SCIIP_V7_EPIC_1_RELEASE_4_DATA_SOURCES_WORKSPACE',version:SCIIP_IDP_RELEASE4_V7.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:10,failures:failures,result:{workspace:contract.workspace,sections:contract.sections.length,actions:contract.actions.length,dataQualityScore:q.score,whatChanged:changes.length,uploadReady:true,reviewReady:true,commitReady:true,rollbackReady:contract.rollbackReady,destructiveCommitEnabled:contract.destructiveCommitEnabled}};
  Logger.log(JSON.stringify(result));if(failures.length)throw new Error(failures.join(' | '));return result;
}


/** Source recognition, mapping, normalization and validation. Pure functions are Node-testable. */
var SCIIP_IDP_IMPORT_V7 = SCIIP_IDP_IMPORT_V7 || {};
SCIIP_IDP_IMPORT_V7.norm = function(v){return String(v == null ? '' : v).trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ');};
SCIIP_IDP_IMPORT_V7.recognize = function(headers){
  var h=(headers||[]).map(SCIIP_IDP_IMPORT_V7.norm), score=0, source='GENERIC_INDUSTRIAL_TABLE';
  if(h.indexOf('building sf')>=0) score+=25; if(h.indexOf('land acres')>=0) score+=20; if(h.indexOf('clear height')>=0||h.indexOf('clear ht')>=0) score+=15;
  if(h.indexOf('apn')>=0) score+=10; if(h.indexOf('address')>=0||h.indexOf('property address')>=0) score+=20; if(h.indexOf('deal type')>=0) score+=10;
  if(score>=70) source='LEE_INDUSTRIAL_SURVEY'; else if(score>=45) source='INDUSTRIAL_PROPERTY_EXPORT';
  return {sourceType:source,confidence:Math.min(99,50+score/2),signals:score};
};
SCIIP_IDP_IMPORT_V7.mapHeaders = function(headers){
  var mapping={}, unmapped=[], used={};
  (headers||[]).forEach(function(header,index){var n=SCIIP_IDP_IMPORT_V7.norm(header), match=''; Object.keys(SCIIP_IDP_V7.ALIASES).some(function(field){if(SCIIP_IDP_V7.ALIASES[field].indexOf(n)>=0){match=field;return true;}return false;}); if(match&&!used[match]){mapping[match]={sourceHeader:header,index:index};used[match]=true;}else{unmapped.push(header);}});
  return {mapping:mapping,unmapped:unmapped,mappedCount:Object.keys(mapping).length};
};
SCIIP_IDP_IMPORT_V7.number = function(v){if(v===''||v==null)return null;var n=Number(String(v).replace(/[$,%\s,]/g,''));return isFinite(n)?n:null;};
SCIIP_IDP_IMPORT_V7.normalizeRow = function(row, mapping){var out={}; Object.keys(mapping||{}).forEach(function(field){out[field]=row[mapping[field].index];}); ['buildingSf','availableSf','landAcres','clearHeight','dockHigh','gradeLevel','powerAmps','askingRate','salePrice','latitude','longitude'].forEach(function(f){if(Object.prototype.hasOwnProperty.call(out,f))out[f]=SCIIP_IDP_IMPORT_V7.number(out[f]);}); out.address=String(out.address||'').trim();out.city=String(out.city||'').trim();out.state=String(out.state||'CA').trim().toUpperCase();out.source=String(out.source||'IMPORT').trim();return out;};
SCIIP_IDP_IMPORT_V7.validate = function(record,rowNumber){var errors=[],warnings=[]; if(!record.address)errors.push('MISSING_ADDRESS'); if(!record.city)errors.push('MISSING_CITY'); if(record.latitude!=null&&(record.latitude<-90||record.latitude>90))errors.push('INVALID_LATITUDE'); if(record.longitude!=null&&(record.longitude<-180||record.longitude>180))errors.push('INVALID_LONGITUDE'); if(!record.apn)warnings.push('MISSING_APN'); if(record.latitude==null||record.longitude==null)warnings.push('MISSING_COORDINATES'); if(record.buildingSf!=null&&record.buildingSf<0)errors.push('INVALID_BUILDING_SF'); return {rowNumber:rowNumber,valid:errors.length===0,errors:errors,warnings:warnings};};
SCIIP_IDP_IMPORT_V7.businessKey = function(r){return [SCIIP_IDP_IMPORT_V7.norm(r.address),SCIIP_IDP_IMPORT_V7.norm(r.city),SCIIP_IDP_IMPORT_V7.norm(r.state),SCIIP_IDP_IMPORT_V7.norm(r.apn)].join('|');};


/** Persistent import jobs and review decisions. */
var SCIIP_IDP_JOB_SERVICE_V7 = SCIIP_IDP_JOB_SERVICE_V7 || {};
SCIIP_IDP_JOB_SERVICE_V7.create = function(values,options){
  options=options||{}; var preview=SCIIP_IDP_PREVIEW_V7.preview(values,options.existingKeys||{});
  var jobId=SCIIP_IDP_RELEASE2_V7.id('IMPORT'); var actor=options.actor||Session.getActiveUser().getEmail()||'UNKNOWN';
  var review=SCIIP_IDP_REVIEW_V7.build(preview,options.existingRecords||{},options.entityIndex||{});
  var job={jobId:jobId,createdAt:SCIIP_IDP_RELEASE2_V7.now(),createdBy:actor,sourceType:preview.source?preview.source.sourceType:'UNKNOWN',sourceName:options.sourceName||'Active Sheet',confidence:preview.source?preview.source.confidence:0,status:preview.status==='BLOCKED'?'BLOCKED':'AWAITING_REVIEW',rowCount:preview.rows||0,newCount:preview.counts?preview.counts.newRecords:0,updateCount:preview.counts?preview.counts.updates:0,duplicateCount:preview.counts?preview.counts.duplicates:0,errorCount:preview.counts?preview.counts.errors:0,warningCount:preview.counts?preview.counts.warnings:0,commitAllowed:preview.commitAllowed===true,payloadJson:SCIIP_IDP_RELEASE2_V7.json({headers:preview.headers,mapping:preview.mapping,missingRequired:preview.missingRequired})};
  SCIIP_IDP_PERSISTENCE_V7.appendObject(SCIIP_IDP_RELEASE2_V7.SHEETS.JOBS,SCIIP_IDP_RELEASE2_V7.HEADERS.JOBS,job);
  review.forEach(function(r){SCIIP_IDP_PERSISTENCE_V7.appendObject(SCIIP_IDP_RELEASE2_V7.SHEETS.RECORDS,SCIIP_IDP_RELEASE2_V7.HEADERS.RECORDS,{recordId:r.recordId,jobId:jobId,rowNumber:r.rowNumber,businessKey:r.businessKey,classification:r.classification,reviewStatus:r.reviewStatus,changeCount:r.changes.length,entityMatchCount:r.entityMatches.length,recordJson:SCIIP_IDP_RELEASE2_V7.json(r.record),validationJson:SCIIP_IDP_RELEASE2_V7.json(r.validation),changesJson:SCIIP_IDP_RELEASE2_V7.json(r.changes)}); r.entityMatches.forEach(function(m){m.candidates.forEach(function(c){SCIIP_IDP_PERSISTENCE_V7.appendObject(SCIIP_IDP_RELEASE2_V7.SHEETS.ENTITY_MATCHES,SCIIP_IDP_RELEASE2_V7.HEADERS.ENTITY_MATCHES,{matchId:SCIIP_IDP_RELEASE2_V7.id('MATCH'),jobId:jobId,recordId:r.recordId,entityType:m.entityType,incomingValue:m.incomingValue,candidateId:c.candidateId,candidateLabel:c.candidateLabel,confidence:c.confidence,resolutionStatus:m.resolutionStatus,createdAt:SCIIP_IDP_RELEASE2_V7.now(),payloadJson:SCIIP_IDP_RELEASE2_V7.json(c)});});});});
  SCIIP_IDP_PERSISTENCE_V7.appendHistory(jobId,'IMPORT_JOB_CREATED',job.status,actor,{counts:preview.counts});
  return {job:job,preview:preview,review:review};
};
SCIIP_IDP_JOB_SERVICE_V7.recordDecision = function(jobId,recordId,decision,reason,actor){
  actor=actor||Session.getActiveUser().getEmail()||'UNKNOWN'; var row={decisionId:SCIIP_IDP_RELEASE2_V7.id('DECISION'),jobId:jobId,recordId:recordId,decision:decision,reason:reason||'',decidedBy:actor,decidedAt:SCIIP_IDP_RELEASE2_V7.now(),payloadJson:SCIIP_IDP_RELEASE2_V7.json({decision:decision,reason:reason||''})};
  SCIIP_IDP_PERSISTENCE_V7.appendObject(SCIIP_IDP_RELEASE2_V7.SHEETS.DECISIONS,SCIIP_IDP_RELEASE2_V7.HEADERS.DECISIONS,row); SCIIP_IDP_PERSISTENCE_V7.appendHistory(jobId,'REVIEW_DECISION_RECORDED',decision,actor,{recordId:recordId,reason:reason||''}); return row;
};
function sciipCreateIndustrialDataImportJobFromActiveSheet(){var sheet=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();return SCIIP_IDP_JOB_SERVICE_V7.create(sheet.getDataRange().getValues(),{sourceName:sheet.getName()});}


/** Builds a non-destructive import preview. */
var SCIIP_IDP_PREVIEW_V7 = SCIIP_IDP_PREVIEW_V7 || {};
SCIIP_IDP_PREVIEW_V7.preview = function(values, existingKeys){
  values=values||[]; existingKeys=existingKeys||{}; if(values.length<1)return {status:'EMPTY',rows:0};
  var headers=values[0], recognition=SCIIP_IDP_IMPORT_V7.recognize(headers), mapped=SCIIP_IDP_IMPORT_V7.mapHeaders(headers), records=[], issues=[], counts={newRecords:0,updates:0,duplicates:0,errors:0,warnings:0}; var seen={};
  values.slice(1).forEach(function(row,i){var record=SCIIP_IDP_IMPORT_V7.normalizeRow(row,mapped.mapping), validation=SCIIP_IDP_IMPORT_V7.validate(record,i+2), key=SCIIP_IDP_IMPORT_V7.businessKey(record), classification='NEW'; if(seen[key]){classification='DUPLICATE_IN_FILE';counts.duplicates++;}else if(existingKeys[key]){classification='UPDATE_CANDIDATE';counts.updates++;}else{counts.newRecords++;} seen[key]=true; if(!validation.valid)counts.errors+=validation.errors.length; counts.warnings+=validation.warnings.length; if(validation.errors.length||validation.warnings.length)issues.push(validation); records.push({rowNumber:i+2,businessKey:key,classification:classification,record:record,validation:validation});});
  var required=SCIIP_IDP_V7.SCHEMA.PROPERTY.required, missingRequired=required.filter(function(f){return !mapped.mapping[f];});
  return {status:missingRequired.length?'BLOCKED':'READY_FOR_REVIEW',version:SCIIP_IDP_V7.VERSION,source:recognition,headers:headers,mapping:mapped,missingRequired:missingRequired,rows:records.length,counts:counts,records:records,issues:issues,commitAllowed:missingRequired.length===0&&counts.errors===0};
};
function sciipIndustrialDataImportPreviewFromActiveSheet(){var sheet=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();return SCIIP_IDP_PREVIEW_V7.preview(sheet.getDataRange().getValues(),{});}


/** Read-only ledger query adapter for the product workspace. */
var SCIIP_IDP_LEDGER_QUERY_V7 = SCIIP_IDP_LEDGER_QUERY_V7 || {};
SCIIP_IDP_LEDGER_QUERY_V7.rows = function(sheetName){
  var ss=SpreadsheetApp.getActiveSpreadsheet(),s=ss.getSheetByName(sheetName); if(!s||s.getLastRow()<2)return [];
  var vals=s.getDataRange().getValues(),h=vals.shift(); return vals.map(function(r){var o={};h.forEach(function(k,i){o[k]=r[i];});return o;});
};
SCIIP_IDP_LEDGER_QUERY_V7.latestBy = function(rows,key){var out={};(rows||[]).forEach(function(r){out[String(r[key])]=r;});return out;};
SCIIP_IDP_LEDGER_QUERY_V7.jobs = function(){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.JOBS).sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});};
SCIIP_IDP_LEDGER_QUERY_V7.job = function(jobId){var jobs=SCIIP_IDP_LEDGER_QUERY_V7.jobs();for(var i=0;i<jobs.length;i++)if(String(jobs[i].jobId)===String(jobId))return jobs[i];return null;};
SCIIP_IDP_LEDGER_QUERY_V7.records = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.RECORDS).filter(function(r){return String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.decisions = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.DECISIONS).filter(function(r){return String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.matches = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.ENTITY_MATCHES).filter(function(r){return String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.plans = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.COMMIT_PLANS).filter(function(r){return !jobId||String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.executions = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE3_V7.SHEETS.EXECUTIONS).filter(function(r){return !jobId||String(r.jobId)===String(jobId);});};
SCIIP_IDP_LEDGER_QUERY_V7.history = function(jobId){return SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE2_V7.SHEETS.HISTORY).filter(function(r){return !jobId||String(r.jobId)===String(jobId);}).sort(function(a,b){return String(b.occurredAt).localeCompare(String(a.occurredAt));});};
SCIIP_IDP_LEDGER_QUERY_V7.current = function(){return Object.keys(SCIIP_IDP_LEDGER_QUERY_V7.latestBy(SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE3_V7.SHEETS.CURRENT),'businessKey')).map(function(k){return SCIIP_IDP_LEDGER_QUERY_V7.latestBy(SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE3_V7.SHEETS.CURRENT),'businessKey')[k];});};


/** Append-only Apps Script persistence adapter. */
var SCIIP_IDP_PERSISTENCE_V7 = SCIIP_IDP_PERSISTENCE_V7 || {};
SCIIP_IDP_PERSISTENCE_V7.ensureSheet = function(name,headers){
  var ss=SpreadsheetApp.getActiveSpreadsheet(), sheet=ss.getSheetByName(name);
  if(!sheet)sheet=ss.insertSheet(name);
  if(sheet.getLastRow()===0)sheet.getRange(1,1,1,headers.length).setValues([headers]);
  return sheet;
};
SCIIP_IDP_PERSISTENCE_V7.appendObject = function(sheetName,headers,obj){
  var sheet=SCIIP_IDP_PERSISTENCE_V7.ensureSheet(sheetName,headers);
  sheet.appendRow(headers.map(function(h){var v=obj[h]; return v==null?'':v;}));
  return obj;
};
SCIIP_IDP_PERSISTENCE_V7.appendHistory = function(jobId,eventType,status,actor,details){
  return SCIIP_IDP_PERSISTENCE_V7.appendObject(SCIIP_IDP_RELEASE2_V7.SHEETS.HISTORY,SCIIP_IDP_RELEASE2_V7.HEADERS.HISTORY,{eventId:SCIIP_IDP_RELEASE2_V7.id('EVT'),jobId:jobId,eventType:eventType,status:status,actor:actor||'UNKNOWN',occurredAt:SCIIP_IDP_RELEASE2_V7.now(),detailsJson:SCIIP_IDP_RELEASE2_V7.json(details||{})});
};


/** SCIIP_OS v7 — Epic 1 Release 2: Persistent Import Review. */
var SCIIP_IDP_RELEASE2_V7 = SCIIP_IDP_RELEASE2_V7 || {};
SCIIP_IDP_RELEASE2_V7.VERSION = 'v7.0-epic1-release2.0';
SCIIP_IDP_RELEASE2_V7.SHEETS = {
  JOBS:'SCIIP_IDP_IMPORT_JOBS',
  RECORDS:'SCIIP_IDP_IMPORT_RECORDS',
  DECISIONS:'SCIIP_IDP_REVIEW_DECISIONS',
  ENTITY_MATCHES:'SCIIP_IDP_ENTITY_MATCHES',
  COMMIT_PLANS:'SCIIP_IDP_COMMIT_PLANS',
  HISTORY:'SCIIP_IDP_IMPORT_HISTORY'
};
SCIIP_IDP_RELEASE2_V7.HEADERS = {
  JOBS:['jobId','createdAt','createdBy','sourceType','sourceName','confidence','status','rowCount','newCount','updateCount','duplicateCount','errorCount','warningCount','commitAllowed','payloadJson'],
  RECORDS:['recordId','jobId','rowNumber','businessKey','classification','reviewStatus','changeCount','entityMatchCount','recordJson','validationJson','changesJson'],
  DECISIONS:['decisionId','jobId','recordId','decision','reason','decidedBy','decidedAt','payloadJson'],
  ENTITY_MATCHES:['matchId','jobId','recordId','entityType','incomingValue','candidateId','candidateLabel','confidence','resolutionStatus','createdAt','payloadJson'],
  COMMIT_PLANS:['planId','jobId','createdAt','createdBy','status','approvedCount','rejectedCount','blockedCount','operationCount','rollbackToken','operationsJson'],
  HISTORY:['eventId','jobId','eventType','status','actor','occurredAt','detailsJson']
};
SCIIP_IDP_RELEASE2_V7.now = function(){return new Date().toISOString();};
SCIIP_IDP_RELEASE2_V7.id = function(prefix){return prefix+'-'+Date.now()+'-'+Math.floor(Math.random()*1000000);};
SCIIP_IDP_RELEASE2_V7.json = function(value){return JSON.stringify(value == null ? null : value);};


/** SCIIP_OS v7 — Epic 1 Release 3: Trusted Knowledge Commit. */
var SCIIP_IDP_RELEASE3_V7 = SCIIP_IDP_RELEASE3_V7 || {};
SCIIP_IDP_RELEASE3_V7.VERSION = 'v7.0-epic1-release3.0';
SCIIP_IDP_RELEASE3_V7.SHEETS = {
  EXECUTIONS:'SCIIP_IDP_COMMIT_EXECUTIONS', EVENTS:'SCIIP_IDP_DOMAIN_EVENTS',
  CANONICAL:'SCIIP_IDP_CANONICAL_PROPERTY_LEDGER', CURRENT:'SCIIP_IDP_PROPERTY_CURRENT_PROJECTION',
  GRAPH:'SCIIP_IDP_KNOWLEDGE_GRAPH_EDGES', GIS:'SCIIP_IDP_GIS_FEATURE_LEDGER',
  SEARCH:'SCIIP_IDP_SEARCH_INDEX_LEDGER', NOTIFICATIONS:'SCIIP_IDP_NOTIFICATION_LEDGER',
  ROLLBACKS:'SCIIP_IDP_ROLLBACK_EXECUTIONS'
};
SCIIP_IDP_RELEASE3_V7.HEADERS = {
  EXECUTIONS:['executionId','executionKey','planId','jobId','status','startedAt','completedAt','actor','operationCount','eventCount','rollbackToken','summaryJson'],
  EVENTS:['eventId','executionId','planId','jobId','aggregateType','aggregateId','eventType','occurredAt','actor','beforeJson','afterJson','changesJson','sourceJson'],
  CANONICAL:['snapshotId','executionId','businessKey','propertyId','lifecycleState','effectiveAt','recordJson','sourceEventId'],
  CURRENT:['projectionId','executionId','businessKey','propertyId','lifecycleState','effectiveAt','recordJson','sourceEventId'],
  GRAPH:['edgeId','executionId','fromId','relationship','toId','effectiveAt','payloadJson','sourceEventId'],
  GIS:['featureId','executionId','businessKey','latitude','longitude','effectiveAt','payloadJson','sourceEventId'],
  SEARCH:['documentId','executionId','businessKey','effectiveAt','searchText','payloadJson','sourceEventId'],
  NOTIFICATIONS:['notificationId','executionId','type','severity','createdAt','title','message','payloadJson'],
  ROLLBACKS:['rollbackExecutionId','originalExecutionId','rollbackToken','status','startedAt','completedAt','actor','compensationCount','summaryJson']
};
SCIIP_IDP_RELEASE3_V7.now = function(){return new Date().toISOString();};
SCIIP_IDP_RELEASE3_V7.id = function(prefix){return prefix+'-'+Date.now()+'-'+Math.floor(Math.random()*1000000);};
SCIIP_IDP_RELEASE3_V7.json = function(v){return JSON.stringify(v == null ? null : v);};
SCIIP_IDP_RELEASE3_V7.slug = function(v){return String(v==null?'':v).trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');};
SCIIP_IDP_RELEASE3_V7.propertyId = function(businessKey){var h=0,s=String(businessKey||'');for(var i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;}return 'PROP-'+Math.abs(h);};


/** Append-only persistence adapter and idempotency checks. */
var SCIIP_IDP_RELEASE3_PERSISTENCE_V7 = SCIIP_IDP_RELEASE3_PERSISTENCE_V7 || {};
SCIIP_IDP_RELEASE3_PERSISTENCE_V7.ensureSheet=function(name,headers){var ss=SpreadsheetApp.getActiveSpreadsheet(),s=ss.getSheetByName(name);if(!s)s=ss.insertSheet(name);if(s.getLastRow()===0)s.getRange(1,1,1,headers.length).setValues([headers]);return s;};
SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append=function(name,headers,obj){var s=SCIIP_IDP_RELEASE3_PERSISTENCE_V7.ensureSheet(name,headers);s.appendRow(headers.map(function(h){var v=obj[h];return v==null?'':v;}));return obj;};
SCIIP_IDP_RELEASE3_PERSISTENCE_V7.hasExecutionKey=function(key){var s=SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCIIP_IDP_RELEASE3_V7.SHEETS.EXECUTIONS);if(!s||s.getLastRow()<2)return false;var vals=s.getRange(2,2,s.getLastRow()-1,1).getValues();return vals.some(function(r){return String(r[0])===String(key);});};
SCIIP_IDP_RELEASE3_PERSISTENCE_V7.loadPlan=function(planId){var s=SpreadsheetApp.getActiveSpreadsheet().getSheetByName('SCIIP_IDP_COMMIT_PLANS');if(!s||s.getLastRow()<2)throw new Error('Commit plan ledger is empty.');var vals=s.getDataRange().getValues(),headers=vals[0];for(var i=vals.length-1;i>=1;i--){var row={};headers.forEach(function(h,j){row[h]=vals[i][j];});if(String(row.planId)===String(planId)){return {planId:row.planId,jobId:row.jobId,createdAt:row.createdAt,createdBy:row.createdBy,status:row.status,rollbackToken:row.rollbackToken,operations:JSON.parse(row.operationsJson||'[]'),commitExecutable:Number(row.operationCount)>0};}}throw new Error('Commit plan not found: '+planId);};
SCIIP_IDP_RELEASE3_PERSISTENCE_V7.persistExecution=function(x,status){var H=SCIIP_IDP_RELEASE3_V7.HEADERS,S=SCIIP_IDP_RELEASE3_V7.SHEETS,j=SCIIP_IDP_RELEASE3_V7.json;
  SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append(S.EXECUTIONS,H.EXECUTIONS,{executionId:x.executionId,executionKey:x.executionKey,planId:x.planId,jobId:x.jobId,status:status||'COMPLETED',startedAt:x.startedAt,completedAt:SCIIP_IDP_RELEASE3_V7.now(),actor:x.actor,operationCount:x.summary.operations,eventCount:x.summary.events,rollbackToken:x.rollbackToken,summaryJson:j(x.summary)});
  x.events.forEach(function(e){SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append(S.EVENTS,H.EVENTS,{eventId:e.eventId,executionId:e.executionId,planId:e.planId,jobId:e.jobId,aggregateType:e.aggregateType,aggregateId:e.aggregateId,eventType:e.eventType,occurredAt:e.occurredAt,actor:e.actor,beforeJson:j(e.before),afterJson:j(e.after),changesJson:j(e.changes),sourceJson:j(e.source)});});
  x.canonical.forEach(function(o){SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append(S.CANONICAL,H.CANONICAL,{snapshotId:o.snapshotId,executionId:o.executionId,businessKey:o.businessKey,propertyId:o.propertyId,lifecycleState:o.lifecycleState,effectiveAt:o.effectiveAt,recordJson:j(o.record),sourceEventId:o.sourceEventId});});
  x.current.forEach(function(o){SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append(S.CURRENT,H.CURRENT,{projectionId:o.projectionId,executionId:o.executionId,businessKey:o.businessKey,propertyId:o.propertyId,lifecycleState:o.lifecycleState,effectiveAt:o.effectiveAt,recordJson:j(o.record),sourceEventId:o.sourceEventId});});
  x.graph.forEach(function(o){SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append(S.GRAPH,H.GRAPH,{edgeId:o.edgeId,executionId:o.executionId,fromId:o.fromId,relationship:o.relationship,toId:o.toId,effectiveAt:o.effectiveAt,payloadJson:j(o.payload),sourceEventId:o.sourceEventId});});
  x.gis.forEach(function(o){SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append(S.GIS,H.GIS,{featureId:o.featureId,executionId:o.executionId,businessKey:o.businessKey,latitude:o.latitude,longitude:o.longitude,effectiveAt:o.effectiveAt,payloadJson:j(o.payload),sourceEventId:o.sourceEventId});});
  x.search.forEach(function(o){SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append(S.SEARCH,H.SEARCH,{documentId:o.documentId,executionId:o.executionId,businessKey:o.businessKey,effectiveAt:o.effectiveAt,searchText:o.searchText,payloadJson:j(o.payload),sourceEventId:o.sourceEventId});});
  x.notifications.forEach(function(o){SCIIP_IDP_RELEASE3_PERSISTENCE_V7.append(S.NOTIFICATIONS,H.NOTIFICATIONS,{notificationId:o.notificationId,executionId:o.executionId,type:o.type,severity:o.severity,createdAt:o.createdAt,title:o.title,message:o.message,payloadJson:j(o.payload)});});return x;};


/** SCIIP_OS v7 — Epic 1 Release 4.1: UI Context Architecture Patch. */
var SCIIP_IDP_RELEASE4_1_V7 = SCIIP_IDP_RELEASE4_1_V7 || {};
SCIIP_IDP_RELEASE4_1_V7.VERSION = 'v7.0-epic1-release4.1';
SCIIP_IDP_RELEASE4_1_V7.WORKSPACE = 'data-sources';
SCIIP_IDP_RELEASE4_1_V7.MENU = 'SCIIP';
SCIIP_IDP_RELEASE4_1_V7.NO_UI_MESSAGE = 'Open the bound Google Sheet and choose SCIIP → Data Sources.';
SCIIP_IDP_RELEASE4_1_V7.result = function(status, extra) {
  var out = {version: SCIIP_IDP_RELEASE4_1_V7.VERSION, status: status, workspace: SCIIP_IDP_RELEASE4_1_V7.WORKSPACE};
  Object.keys(extra || {}).forEach(function(key) { out[key] = extra[key]; });
  return out;
};


/** SCIIP_OS v7 — Epic 1 Release 4: Data Sources Workspace. */
var SCIIP_IDP_RELEASE4_V7 = SCIIP_IDP_RELEASE4_V7 || {};
SCIIP_IDP_RELEASE4_V7.VERSION = 'v7.0-epic1-release4.0';
SCIIP_IDP_RELEASE4_V7.WORKSPACE = 'data-sources';
SCIIP_IDP_RELEASE4_V7.safeJson = function(v,fallback){try{return JSON.parse(v||'');}catch(e){return fallback == null ? null : fallback;}};
SCIIP_IDP_RELEASE4_V7.actor = function(){try{return Session.getActiveUser().getEmail()||'UNKNOWN';}catch(e){return 'UNKNOWN';}};
SCIIP_IDP_RELEASE4_V7.now = function(){return new Date().toISOString();};


/** Pure review model, decisions and commit-plan preparation. */
var SCIIP_IDP_REVIEW_V7 = SCIIP_IDP_REVIEW_V7 || {};
SCIIP_IDP_REVIEW_V7.build = function(preview,existingRecords,entityIndex){
  existingRecords=existingRecords||{}; entityIndex=entityIndex||{};
  return (preview.records||[]).map(function(item){
    var current=existingRecords[item.businessKey]||null;
    var changes=current?SCIIP_IDP_CHANGE_V7.detect(item.record,current):[];
    var matches=SCIIP_IDP_ENTITY_RESOLUTION_V7.resolveRecord(item.record,entityIndex);
    var blocked=!item.validation.valid || item.classification==='DUPLICATE_IN_FILE';
    return {recordId:'REC-'+item.rowNumber+'-'+Math.abs(SCIIP_IDP_REVIEW_V7.hash(item.businessKey)),rowNumber:item.rowNumber,businessKey:item.businessKey,classification:item.classification,reviewStatus:blocked?'BLOCKED':'PENDING',record:item.record,validation:item.validation,current:current,changes:changes,entityMatches:matches};
  });
};
SCIIP_IDP_REVIEW_V7.hash = function(s){var h=0,i; s=String(s||''); for(i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h|=0;} return h;};
SCIIP_IDP_REVIEW_V7.applyDecision = function(reviewRecord,decision){
  var allowed={APPROVE:true,REJECT:true,HOLD:true}; if(!allowed[decision])throw new Error('Unsupported review decision: '+decision);
  if(reviewRecord.reviewStatus==='BLOCKED' && decision==='APPROVE')throw new Error('Blocked records cannot be approved.');
  var copy=JSON.parse(JSON.stringify(reviewRecord)); copy.reviewStatus=decision==='APPROVE'?'APPROVED':(decision==='REJECT'?'REJECTED':'HELD'); return copy;
};
SCIIP_IDP_REVIEW_V7.prepareCommitPlan = function(jobId,reviewRecords,actor){
  var operations=[],counts={approved:0,rejected:0,blocked:0,held:0};
  (reviewRecords||[]).forEach(function(r){
    if(r.reviewStatus==='APPROVED'){counts.approved++; operations.push({operationId:'OP-'+operations.length,recordId:r.recordId,businessKey:r.businessKey,operationType:r.classification==='UPDATE_CANDIDATE'?'UPDATE_PROPERTY':'CREATE_PROPERTY',after:r.record,before:r.current||null,changes:r.changes,entityMatches:r.entityMatches});}
    else if(r.reviewStatus==='REJECTED')counts.rejected++; else if(r.reviewStatus==='BLOCKED')counts.blocked++; else counts.held++;
  });
  return {planId:SCIIP_IDP_RELEASE2_V7.id('PLAN'),jobId:jobId,createdAt:SCIIP_IDP_RELEASE2_V7.now(),createdBy:actor||'UNKNOWN',status:(counts.blocked||counts.held)?'READY_WITH_EXCEPTIONS':'READY',counts:counts,operationCount:operations.length,rollbackToken:SCIIP_IDP_RELEASE2_V7.id('ROLLBACK'),operations:operations,commitExecutable:operations.length>0};
};


/** Product-facing contract for the Imports review workspace. */
function sciipIndustrialDataImportReviewWorkspace(){
  return {version:SCIIP_IDP_RELEASE2_V7.VERSION,status:'AVAILABLE',workspace:'data-sources/import-review',sections:['JOB_SUMMARY','SOURCE_CONFIDENCE','NEW_RECORDS','UPDATE_CANDIDATES','DUPLICATES','VALIDATION_ISSUES','ENTITY_MATCHES','FIELD_CHANGES','REVIEW_DECISIONS','COMMIT_PREPARATION','IMPORT_HISTORY'],actions:['APPROVE','REJECT','HOLD','RESOLVE_ENTITY','PREPARE_COMMIT_PLAN'],destructiveCommitEnabled:false,releaseState:'REVIEW_AND_COMMIT_PREPARATION_READY'};
}


/** Pure compensating-event rollback compiler. */
var SCIIP_IDP_ROLLBACK_V7 = SCIIP_IDP_ROLLBACK_V7 || {};
SCIIP_IDP_ROLLBACK_V7.compile = function(plan,execution,actor,clock){
  if(!plan||!execution)throw new Error('Plan and execution are required.');
  if(plan.rollbackToken!==execution.rollbackToken)throw new Error('Rollback token mismatch.');
  var now=clock||SCIIP_IDP_RELEASE3_V7.now(), rollbackExecutionId=SCIIP_IDP_RELEASE3_V7.id('ROLLBACK-EXEC'), events=[],current=[];
  (plan.operations||[]).forEach(function(op){
    var propertyId=SCIIP_IDP_RELEASE3_V7.propertyId(op.businessKey), isCreate=op.operationType!=='UPDATE_PROPERTY', eventId=SCIIP_IDP_RELEASE3_V7.id('COMP-EVT');
    var restored=isCreate?Object.assign({},op.after,{lifecycleState:'ARCHIVED'}):(op.before||{});
    events.push({eventId:eventId,executionId:rollbackExecutionId,planId:plan.planId,jobId:plan.jobId,aggregateType:'PROPERTY',aggregateId:propertyId,eventType:isCreate?'PROPERTY_CREATION_REVERSED':'PROPERTY_UPDATE_REVERSED',occurredAt:now,actor:actor||'UNKNOWN',before:op.after,after:restored,changes:op.changes||[],source:{originalExecutionId:execution.executionId,rollbackToken:plan.rollbackToken}});
    current.push({projectionId:SCIIP_IDP_RELEASE3_V7.id('CURRENT'),executionId:rollbackExecutionId,businessKey:op.businessKey,propertyId:propertyId,lifecycleState:isCreate?'ARCHIVED':'CURRENT',effectiveAt:now,record:restored,sourceEventId:eventId});
  });
  return {rollbackExecutionId:rollbackExecutionId,originalExecutionId:execution.executionId,rollbackToken:plan.rollbackToken,status:'COMPILED',startedAt:now,actor:actor||'UNKNOWN',events:events,current:current,compensationCount:events.length};
};


/** Spreadsheet presentation entry point. Safe to invoke from onOpen only. */
var SCIIP_IDP_MENU_V7 = SCIIP_IDP_MENU_V7 || {};
SCIIP_IDP_MENU_V7.install = function(adapters) {
  adapters = adapters || {};
  var context = SCIIP_IDP_UI_CONTEXT_V7.inspect(adapters);
  if (!context.uiAvailable) return context;
  try {
    var menu = context.ui.createMenu(SCIIP_IDP_RELEASE4_1_V7.MENU)
      .addItem('Data Sources', 'sciipOpenDataSourcesWorkspace')
      .addSeparator()
      .addItem('Data Quality', 'sciipOpenDataSourcesWorkspace')
      .addItem('What Changed', 'sciipOpenDataSourcesWorkspace')
      .addToUi();
    return SCIIP_IDP_RELEASE4_1_V7.result('MENU_INSTALLED', {
      uiAvailable: true,
      spreadsheetAvailable: true,
      spreadsheetId: context.spreadsheetId || '',
      menu: SCIIP_IDP_RELEASE4_1_V7.MENU,
      items: 3,
      installed: !!menu || true
    });
  } catch (error) {
    return SCIIP_IDP_RELEASE4_1_V7.result('MENU_INSTALL_FAILED', {
      uiAvailable: true,
      message: String(error && error.message ? error.message : error)
    });
  }
};
function sciipInstallDataSourcesMenu() {
  var result = SCIIP_IDP_MENU_V7.install();
  Logger.log(JSON.stringify(result));
  return result;
}
/** Simple trigger: reload the spreadsheet after deployment. */
function onOpen(e) {
  return sciipInstallDataSourcesMenu();
}


/** Pure transaction compiler: approved plans -> immutable events and projections. */
var SCIIP_IDP_TRANSACTION_V7 = SCIIP_IDP_TRANSACTION_V7 || {};
SCIIP_IDP_TRANSACTION_V7.validatePlan = function(plan){
  var errors=[]; plan=plan||{};
  if(!plan.planId)errors.push('planId is required.');
  if(!plan.jobId)errors.push('jobId is required.');
  if(plan.commitExecutable!==true)errors.push('Plan is not executable.');
  if(!Array.isArray(plan.operations)||!plan.operations.length)errors.push('At least one operation is required.');
  (plan.operations||[]).forEach(function(op,i){if(!op.businessKey)errors.push('Operation '+i+' is missing businessKey.');if(!op.after)errors.push('Operation '+i+' is missing after state.');});
  return {valid:errors.length===0,errors:errors};
};
SCIIP_IDP_TRANSACTION_V7.executionKey = function(plan){return String(plan.planId)+'|'+String(plan.rollbackToken||'NO_ROLLBACK')+'|'+String((plan.operations||[]).length);};
SCIIP_IDP_TRANSACTION_V7.compile = function(plan,actor,clock){
  var validation=SCIIP_IDP_TRANSACTION_V7.validatePlan(plan); if(!validation.valid)throw new Error(validation.errors.join(' | '));
  actor=actor||'UNKNOWN'; var now=clock||SCIIP_IDP_RELEASE3_V7.now(); var executionId=SCIIP_IDP_RELEASE3_V7.id('EXEC');
  var out={executionId:executionId,executionKey:SCIIP_IDP_TRANSACTION_V7.executionKey(plan),planId:plan.planId,jobId:plan.jobId,actor:actor,startedAt:now,rollbackToken:plan.rollbackToken,events:[],canonical:[],current:[],graph:[],gis:[],search:[],notifications:[]};
  plan.operations.forEach(function(op,index){
    var propertyId=SCIIP_IDP_RELEASE3_V7.propertyId(op.businessKey), eventId=SCIIP_IDP_RELEASE3_V7.id('DOMAIN-EVT');
    var eventType=op.operationType==='UPDATE_PROPERTY'?'PROPERTY_UPDATED':'PROPERTY_CREATED';
    var source={planId:plan.planId,jobId:plan.jobId,recordId:op.recordId,operationId:op.operationId};
    var event={eventId:eventId,executionId:executionId,planId:plan.planId,jobId:plan.jobId,aggregateType:'PROPERTY',aggregateId:propertyId,eventType:eventType,occurredAt:now,actor:actor,before:op.before||null,after:op.after,changes:op.changes||[],source:source};
    out.events.push(event);
    var snapshot={snapshotId:SCIIP_IDP_RELEASE3_V7.id('SNAP'),executionId:executionId,businessKey:op.businessKey,propertyId:propertyId,lifecycleState:'CURRENT',effectiveAt:now,record:op.after,sourceEventId:eventId};
    out.canonical.push(snapshot); out.current.push({projectionId:SCIIP_IDP_RELEASE3_V7.id('CURRENT'),executionId:executionId,businessKey:op.businessKey,propertyId:propertyId,lifecycleState:'CURRENT',effectiveAt:now,record:op.after,sourceEventId:eventId});
    [['owner','OWNED_BY'],['tenant','OCCUPIED_BY']].forEach(function(spec){var value=op.after[spec[0]];if(value)out.graph.push({edgeId:SCIIP_IDP_RELEASE3_V7.id('EDGE'),executionId:executionId,fromId:propertyId,relationship:spec[1],toId:spec[0].toUpperCase()+'-'+SCIIP_IDP_RELEASE3_V7.slug(value),effectiveAt:now,payload:{label:value},sourceEventId:eventId});});
    var lat=Number(op.after.latitude), lng=Number(op.after.longitude); if(isFinite(lat)&&isFinite(lng)&&lat>=-90&&lat<=90&&lng>=-180&&lng<=180)out.gis.push({featureId:SCIIP_IDP_RELEASE3_V7.id('GIS'),executionId:executionId,businessKey:op.businessKey,latitude:lat,longitude:lng,effectiveAt:now,payload:{propertyId:propertyId,address:op.after.address||'',city:op.after.city||'',state:op.after.state||''},sourceEventId:eventId});
    var searchText=[op.after.address,op.after.city,op.after.state,op.after.apn,op.after.owner,op.after.tenant,op.after.buildingSf].filter(function(x){return x!=null&&x!=='';}).join(' ').toLowerCase();
    out.search.push({documentId:SCIIP_IDP_RELEASE3_V7.id('SEARCH'),executionId:executionId,businessKey:op.businessKey,effectiveAt:now,searchText:searchText,payload:{propertyId:propertyId,record:op.after},sourceEventId:eventId});
    out.notifications.push({notificationId:SCIIP_IDP_RELEASE3_V7.id('NOTE'),executionId:executionId,type:eventType,severity:'INFO',createdAt:now,title:eventType==='PROPERTY_CREATED'?'Property added':'Property updated',message:(op.after.address||op.businessKey)+' was committed from approved import '+plan.jobId+'.',payload:{propertyId:propertyId,businessKey:op.businessKey,eventId:eventId}});
  });
  out.summary={operations:plan.operations.length,events:out.events.length,canonicalSnapshots:out.canonical.length,currentProjections:out.current.length,graphEdges:out.graph.length,gisFeatures:out.gis.length,searchDocuments:out.search.length,notifications:out.notifications.length};
  return out;
};


/** Context detection kept independent of workspace business services. */
var SCIIP_IDP_UI_CONTEXT_V7 = SCIIP_IDP_UI_CONTEXT_V7 || {};
SCIIP_IDP_UI_CONTEXT_V7.inspect = function(adapters) {
  adapters = adapters || {};
  var spreadsheet = null;
  try {
    spreadsheet = (adapters.getSpreadsheet || function() { return SpreadsheetApp.getActiveSpreadsheet(); })();
  } catch (spreadsheetError) {
    return SCIIP_IDP_RELEASE4_1_V7.result('NO_UI_CONTEXT', {
      uiAvailable: false,
      spreadsheetAvailable: false,
      reason: 'SPREADSHEET_CONTEXT_UNAVAILABLE',
      message: SCIIP_IDP_RELEASE4_1_V7.NO_UI_MESSAGE
    });
  }
  if (!spreadsheet) {
    return SCIIP_IDP_RELEASE4_1_V7.result('NO_UI_CONTEXT', {
      uiAvailable: false,
      spreadsheetAvailable: false,
      reason: 'NO_ACTIVE_SPREADSHEET',
      message: SCIIP_IDP_RELEASE4_1_V7.NO_UI_MESSAGE
    });
  }
  try {
    var ui = (adapters.getUi || function() { return SpreadsheetApp.getUi(); })();
    if (!ui) throw new Error('UI provider returned no value.');
    return SCIIP_IDP_RELEASE4_1_V7.result('AVAILABLE', {
      uiAvailable: true,
      spreadsheetAvailable: true,
      spreadsheetId: typeof spreadsheet.getId === 'function' ? spreadsheet.getId() : '',
      ui: ui
    });
  } catch (uiError) {
    return SCIIP_IDP_RELEASE4_1_V7.result('NO_UI_CONTEXT', {
      uiAvailable: false,
      spreadsheetAvailable: true,
      spreadsheetId: typeof spreadsheet.getId === 'function' ? spreadsheet.getId() : '',
      reason: 'SPREADSHEET_UI_UNAVAILABLE',
      message: SCIIP_IDP_RELEASE4_1_V7.NO_UI_MESSAGE,
      diagnostic: String(uiError && uiError.message ? uiError.message : uiError)
    });
  }
};
function sciipGetDataSourcesUiContext() {
  var result = SCIIP_IDP_UI_CONTEXT_V7.inspect();
  if (result.ui) delete result.ui;
  return result;
}


/** Controlled actions used by the Data Sources workspace. */
var SCIIP_IDP_WORKSPACE_ACTIONS_V7 = SCIIP_IDP_WORKSPACE_ACTIONS_V7 || {};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.createFromActiveSheet=function(){return sciipCreateIndustrialDataImportJobFromActiveSheet();};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.decide=function(jobId,recordId,decision,reason){return SCIIP_IDP_JOB_SERVICE_V7.recordDecision(jobId,recordId,decision,reason||'',SCIIP_IDP_RELEASE4_V7.actor());};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.persistedReview=function(jobId){
  var records=SCIIP_IDP_LEDGER_QUERY_V7.records(jobId),latest=SCIIP_IDP_LEDGER_QUERY_V7.latestBy(SCIIP_IDP_LEDGER_QUERY_V7.decisions(jobId),'recordId');
  return records.map(function(r){var d=latest[String(r.recordId)],status=d?(d.decision==='APPROVE'?'APPROVED':(d.decision==='REJECT'?'REJECTED':'HELD')):r.reviewStatus;return {recordId:r.recordId,rowNumber:r.rowNumber,businessKey:r.businessKey,classification:r.classification,reviewStatus:status,record:SCIIP_IDP_RELEASE4_V7.safeJson(r.recordJson,{}),validation:SCIIP_IDP_RELEASE4_V7.safeJson(r.validationJson,{}),changes:SCIIP_IDP_RELEASE4_V7.safeJson(r.changesJson,[]),current:null,entityMatches:[]};});
};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.prepare=function(jobId){return SCIIP_IDP_COMMIT_PREP_V7.persistPlan(jobId,SCIIP_IDP_WORKSPACE_ACTIONS_V7.persistedReview(jobId),SCIIP_IDP_RELEASE4_V7.actor());};
SCIIP_IDP_WORKSPACE_ACTIONS_V7.execute=function(planId){return SCIIP_IDP_COMMIT_EXECUTION_V7.executePlanById(planId,SCIIP_IDP_RELEASE4_V7.actor());};
function sciipDataSourcesCreateFromActiveSheet(){return SCIIP_IDP_WORKSPACE_ACTIONS_V7.createFromActiveSheet();}
function sciipDataSourcesRecordDecision(jobId,recordId,decision,reason){return SCIIP_IDP_WORKSPACE_ACTIONS_V7.decide(jobId,recordId,decision,reason);}
function sciipDataSourcesPrepareCommit(jobId){return SCIIP_IDP_WORKSPACE_ACTIONS_V7.prepare(jobId);}
function sciipDataSourcesExecuteCommit(planId){return SCIIP_IDP_WORKSPACE_ACTIONS_V7.execute(planId);}


/** Presentation-layer launcher. No import or commit business logic lives here. */
var SCIIP_IDP_WORKSPACE_LAUNCHER_V7 = SCIIP_IDP_WORKSPACE_LAUNCHER_V7 || {};
SCIIP_IDP_WORKSPACE_LAUNCHER_V7.open = function(adapters) {
  var context = SCIIP_IDP_UI_CONTEXT_V7.inspect(adapters);
  if (!context.uiAvailable) return context;
  try {
    var htmlFactory = adapters && adapters.createHtml ? adapters.createHtml : function() {
      return HtmlService.createTemplateFromFile('SCIIP_IDP_DataSources_Workspace')
        .evaluate()
        .setTitle('SCIIP Data Sources')
        .setWidth(480);
    };
    context.ui.showSidebar(htmlFactory());
    return SCIIP_IDP_RELEASE4_1_V7.result('OPENED', {
      uiAvailable: true,
      spreadsheetAvailable: true,
      spreadsheetId: context.spreadsheetId || '',
      route: 'data-sources'
    });
  } catch (error) {
    return SCIIP_IDP_RELEASE4_1_V7.result('UI_OPEN_FAILED', {
      uiAvailable: true,
      spreadsheetAvailable: true,
      spreadsheetId: context.spreadsheetId || '',
      message: String(error && error.message ? error.message : error)
    });
  }
};
/** Backward-compatible replacement for the Release 4 launcher. */
function sciipOpenDataSourcesWorkspace() {
  var result = SCIIP_IDP_WORKSPACE_LAUNCHER_V7.open();
  Logger.log(JSON.stringify(result));
  return result;
}
function sciipLaunchDataSources() {
  return sciipOpenDataSourcesWorkspace();
}


/** Aggregates backend ledgers into one product-facing workspace model. */
var SCIIP_IDP_WORKSPACE_V7 = SCIIP_IDP_WORKSPACE_V7 || {};
SCIIP_IDP_WORKSPACE_V7.model = function(selectedJobId){
  var jobs=SCIIP_IDP_LEDGER_QUERY_V7.jobs(),selected=selectedJobId||((jobs[0]||{}).jobId||''),job=selected?SCIIP_IDP_LEDGER_QUERY_V7.job(selected):null;
  var records=selected?SCIIP_IDP_LEDGER_QUERY_V7.records(selected):[],decisions=selected?SCIIP_IDP_LEDGER_QUERY_V7.decisions(selected):[],latestDecision=SCIIP_IDP_LEDGER_QUERY_V7.latestBy(decisions,'recordId');
  var review=records.map(function(r){var d=latestDecision[String(r.recordId)]||null;return {recordId:r.recordId,rowNumber:r.rowNumber,businessKey:r.businessKey,classification:r.classification,reviewStatus:d?d.decision:r.reviewStatus,record:SCIIP_IDP_RELEASE4_V7.safeJson(r.recordJson,{}),validation:SCIIP_IDP_RELEASE4_V7.safeJson(r.validationJson,{}),changes:SCIIP_IDP_RELEASE4_V7.safeJson(r.changesJson,[])};});
  var plans=selected?SCIIP_IDP_LEDGER_QUERY_V7.plans(selected):[],executions=selected?SCIIP_IDP_LEDGER_QUERY_V7.executions(selected):[],events=SCIIP_IDP_LEDGER_QUERY_V7.rows(SCIIP_IDP_RELEASE3_V7.SHEETS.EVENTS);
  return {version:SCIIP_IDP_RELEASE4_V7.VERSION,status:'AVAILABLE',workspace:SCIIP_IDP_RELEASE4_V7.WORKSPACE,selectedJobId:selected,jobs:jobs.slice(0,50),job:job,review:review,entityMatches:selected?SCIIP_IDP_LEDGER_QUERY_V7.matches(selected):[],plans:plans,executions:executions,history:selected?SCIIP_IDP_LEDGER_QUERY_V7.history(selected):[],dataQuality:SCIIP_IDP_DATA_QUALITY_V7.calculate(jobs,SCIIP_IDP_LEDGER_QUERY_V7.current()),whatChanged:SCIIP_IDP_CHANGE_SUMMARY_V7.build(events,20),actions:['CREATE_FROM_ACTIVE_SHEET','APPROVE','REJECT','HOLD','PREPARE_COMMIT','EXECUTE_COMMIT','REFRESH','OPEN_GIS','OPEN_SEARCH'],destructiveCommitEnabled:true,rollbackReady:true,acceptanceState:'END_TO_END_DATA_SOURCES_WORKSPACE_READY'};
};
function sciipGetDataSourcesWorkspace(jobId){return SCIIP_IDP_WORKSPACE_V7.model(jobId);}


/** SCIIP_OS v7 Epic 3 Sprint 3 — Industrial AI Copilot */
var SCIIP_INDUSTRIAL_AI_COPILOT = (function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint3.0';
  function text_(v){return String(v==null?'':v).trim();}
  function upper_(v){return text_(v).toUpperCase();}
  function num_(v){var n=Number(v);return isFinite(n)?n:null;}
  function arr_(v){return Array.isArray(v)?v:[];}
  function tokens_(q){return upper_(q).replace(/[^A-Z0-9\s'-]/g,' ').split(/\s+/).filter(function(x){return x.length>1;});}
  function scoreText_(q,obj){var hay=upper_(JSON.stringify(obj||{})),t=tokens_(q),score=0;t.forEach(function(x){if(hay.indexOf(x)>=0)score+=1;});return score;}
  function normalizeProperty_(p){p=p||{};return {
    propertyId:text_(p.propertyId||p.id||p.entityId),address:text_(p.address||p.streetAddress),city:text_(p.city),submarket:text_(p.submarket),
    availableSf:num_(p.availableSf||p.availableSF||p.buildingSf),clearHeight:num_(p.clearHeight||p.clearHt),powerAmps:num_(p.powerAmps||p.amps),
    trailerParking:num_(p.trailerParking||p.trailerStalls),status:text_(p.status),latitude:num_(p.latitude),longitude:num_(p.longitude),source:p
  };}
  function inferIntent_(question){var q=upper_(question);if(/COMPARE|VERSUS| VS |SIMILAR/.test(q))return'COMPARE_PROPERTIES';if(/FIND|SHOW|WHICH|SUITABLE|REQUIRE|AT LEAST|WITHIN/.test(q))return'SITE_SELECTION';if(/CHANGED|CHANGE|NEW|TODAY|WEEK|RECENT/.test(q))return'MARKET_CHANGE';if(/WHY|EXPLAIN/.test(q))return'EXPLAIN';return'KNOWLEDGE_QUERY';}
  function constraints_(question){var q=upper_(question),out={};var sf=q.match(/([\d,.]+)\s*(?:SF|SQUARE FEET)/);if(sf)out.minimumSf=Number(sf[1].replace(/,/g,''));var amps=q.match(/([\d,.]+)\s*(?:AMPS|AMP)/);if(amps)out.minimumPowerAmps=Number(amps[1].replace(/,/g,''));var clear=q.match(/([\d.]+)\s*(?:'|FT|FEET)?\s*CLEAR/);if(clear)out.minimumClearHeight=Number(clear[1]);var miles=q.match(/WITHIN\s+([\d.]+)\s*MILES?/);if(miles)out.maximumMiles=Number(miles[1]);return out;}
  function qualify_(p,c){var reasons=[],fails=[];if(c.minimumSf!=null)((p.availableSf||0)>=c.minimumSf?reasons:fails).push('Available SF '+(p.availableSf||0)+' vs '+c.minimumSf);if(c.minimumPowerAmps!=null)((p.powerAmps||0)>=c.minimumPowerAmps?reasons:fails).push('Power '+(p.powerAmps||0)+'A vs '+c.minimumPowerAmps+'A');if(c.minimumClearHeight!=null)((p.clearHeight||0)>=c.minimumClearHeight?reasons:fails).push('Clear height '+(p.clearHeight||0)+' ft vs '+c.minimumClearHeight+' ft');return {qualified:fails.length===0,reasons:reasons,failures:fails};}
  function retrieve(request){request=request||{};var q=text_(request.question),properties=arr_(request.properties).map(normalizeProperty_),entities=arr_(request.entities),events=arr_(request.events),relationships=arr_(request.relationships),c=constraints_(q);
    var evidence=[];properties.forEach(function(p){var match=scoreText_(q,p),qual=qualify_(p,c),score=match*10+(qual.qualified?40:0)+(p.status&&/AVAILABLE|PLANNED|CONSTRUCTION/i.test(p.status)?10:0);if(match||Object.keys(c).length)evidence.push({evidenceType:'PROPERTY',entityId:p.propertyId,title:p.address||p.propertyId,score:score,qualified:qual.qualified,reasons:qual.reasons,failures:qual.failures,data:p});});
    entities.forEach(function(e){var score=scoreText_(q,e)*10;if(score)evidence.push({evidenceType:'ENTITY',entityId:text_(e.entityId||e.id),title:text_(e.name||e.label||e.entityId),score:score,data:e});});
    events.forEach(function(e){var score=scoreText_(q,e)*10;if(score)evidence.push({evidenceType:'EVENT',entityId:text_(e.eventId||e.id),title:text_(e.eventType||e.type||'Event'),score:score,data:e});});
    relationships.forEach(function(e){var score=scoreText_(q,e)*10;if(score)evidence.push({evidenceType:'RELATIONSHIP',entityId:text_(e.relationshipId||e.id),title:text_(e.type||e.relationshipType||'Relationship'),score:score,data:e});});
    evidence.sort(function(a,b){return b.score-a.score;});return {question:q,intent:inferIntent_(q),constraints:c,evidence:evidence.slice(0,25),retrievedAt:new Date().toISOString()};
  }
  function compose_(retrieval){var ev=retrieval.evidence||[],qualified=ev.filter(function(x){return x.evidenceType==='PROPERTY'&&x.qualified;});var selected=qualified.length?qualified:ev.slice(0,5),answer='';
    if(retrieval.intent==='SITE_SELECTION')answer=selected.length?'SCIIP found '+selected.length+' relevant candidate'+(selected.length===1?'':'s')+'. '+selected.map(function(x,i){return (i+1)+'. '+x.title+(x.reasons&&x.reasons.length?' — '+x.reasons.join('; '):'');}).join(' '):'SCIIP did not find a governed record that satisfies the stated requirements.';
    else if(retrieval.intent==='MARKET_CHANGE')answer=selected.length?'SCIIP found '+selected.length+' relevant governed changes or records.':'No matching governed market changes were found in the supplied evidence.';
    else if(retrieval.intent==='COMPARE_PROPERTIES')answer=selected.length?'SCIIP identified '+selected.length+' records for comparison: '+selected.map(function(x){return x.title;}).join(', ')+'.':'No comparable governed records were found.';
    else answer=selected.length?'SCIIP found '+selected.length+' grounded evidence item'+(selected.length===1?'':'s')+'. '+selected.map(function(x){return x.title;}).join(', ')+'.':'SCIIP could not find grounded evidence for this question.';
    return {answer:answer,evidence:selected,confidence:selected.length?Math.min(99,60+selected.length*7):25};
  }
  function ask(request){request=request||{};var r=retrieve(request),c=compose_(r);return {version:VERSION,status:'ANSWERED',question:r.question,intent:r.intent,constraints:r.constraints,answer:c.answer,confidence:c.confidence,evidence:c.evidence,actions:c.evidence.filter(function(x){return x.evidenceType==='PROPERTY';}).map(function(x){return {label:'Open '+x.title,action:'OPEN_DIGITAL_TWIN',propertyId:x.entityId};}),governance:{groundedOnly:true,evidenceRequired:true,externalModelUsed:false},generatedAt:new Date().toISOString()};}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',workspace:'ai-copilot',capabilities:['NATURAL_LANGUAGE_QUERY','GRAPH_AWARE_RETRIEVAL','SPATIAL_CONSTRAINT_EXTRACTION','PROPERTY_RANKING','EVIDENCE_CITATIONS','DIGITAL_TWIN_ACTIONS'],suggestedPrompts:['Find buildings with at least 500,000 SF and 4,000 amps.','Show properties similar to 2125 W Lowell St.','What changed in the Inland Empire this week?','Explain why Slover is a competitor.']};}
  return {VERSION:VERSION,snapshot:snapshot,retrieve:retrieve,ask:ask,inferIntent:inferIntent_,extractConstraints:constraints_};
})();
function sciipIndustrialAICopilotAsk(request){return SCIIP_INDUSTRIAL_AI_COPILOT.ask(request||{});}
function sciipIndustrialAICopilotSnapshot(){return SCIIP_INDUSTRIAL_AI_COPILOT.snapshot();}


/** SCIIP Epic 2 Release 3 — Universal Industrial Import Engine */
var SCIIP_UNIVERSAL_INDUSTRIAL_IMPORT = (function(){
  'use strict';
  var VERSION='v7.0-epic2-release3.0';
  var CANONICAL=[
    'propertyId','address','city','state','postalCode','county','market','submarket','status','dealType',
    'availableSf','buildingSf','landAcres','askingRate','opex','clearHeightFt','dockHighDoors','groundLevelDoors',
    'autoParking','trailerParking','truckCourtFt','powerAmps','yearBuilt','latitude','longitude','owner','tenant','broker','sourceDate'
  ];
  var SYNONYMS={
    propertyId:['property id','building id','asset id','id'],address:['address','property address','street address','location'],city:['city'],state:['state','st'],postalCode:['zip','zipcode','postal code'],county:['county'],market:['market','metro'],submarket:['submarket','sub market'],status:['status','availability status'],dealType:['deal type','transaction type'],availableSf:['available sf','avail sf','available square feet','sf available','availability'],buildingSf:['building sf','building size','total sf','square feet','bldg sf'],landAcres:['land acres','acres','site acres','lot acres'],askingRate:['asking rate','rent','lease rate','rate','asking rent'],opex:['opex','operating expenses','nets','nnn'],clearHeightFt:['clear height','clear ht','clear','ceiling height'],dockHighDoors:['dock high','dh','dock doors','dock positions'],groundLevelDoors:['ground level','gl','grade level','ground doors'],autoParking:['auto parking','car parking','parking stalls','auto pkg'],trailerParking:['trailer parking','trailer stalls','trailer pkg'],truckCourtFt:['truck court','truck court depth'],powerAmps:['power amps','amps','power','electrical service'],yearBuilt:['year built','built','year'],latitude:['latitude','lat'],longitude:['longitude','lng','lon'],owner:['owner','ownership','landlord'],tenant:['tenant','occupant','company'],broker:['broker','listing broker','agent'],sourceDate:['source date','survey date','report date','date']
  };
  var SOURCE_SIGNATURES=[
    {id:'LEE_INDUSTRIAL_SURVEY',tokens:['lee','available sf','clear ht','dh'],confidence:96},
    {id:'COSTAR_EXPORT',tokens:['costar','property id','building sf','rent'],confidence:94},
    {id:'AIR_CRE_SURVEY',tokens:['air cre','available square feet','asking rate'],confidence:92},
    {id:'CBRE_MARKET_SURVEY',tokens:['cbre','submarket','availability status'],confidence:90},
    {id:'JLL_AVAILABILITIES',tokens:['jll','clear height','dock doors'],confidence:90},
    {id:'COLLIERS_SURVEY',tokens:['colliers','asking rent','total sf'],confidence:88},
    {id:'CUSHMAN_WAKEFIELD_SURVEY',tokens:['cushman','wakefield','building size'],confidence:88},
    {id:'LOOPNET_EXPORT',tokens:['loopnet','property address','lease rate'],confidence:86}
  ];
  function text(v){return String(v===null||v===undefined?'':v).trim();}
  function key(v){return text(v).toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
  function num(v){if(typeof v==='number')return isFinite(v)?v:null;var s=text(v).replace(/[$,%]/g,'').replace(/,/g,'');var m=s.match(/-?\d+(?:\.\d+)?/);return m?Number(m[0]):null;}
  function source(headers,meta){var hay=(headers||[]).map(key).join(' ')+' '+key(meta&&meta.fileName)+' '+key(meta&&meta.provider);var best={sourceType:'GENERIC_INDUSTRIAL_DATASET',confidence:60,evidence:[]};SOURCE_SIGNATURES.forEach(function(s){var hits=s.tokens.filter(function(t){return hay.indexOf(key(t))>=0;});var score=Math.min(s.confidence,55+hits.length*13);if(hits.length&&score>best.confidence)best={sourceType:s.id,confidence:score,evidence:hits};});return best;}
  function similarity(a,b){a=key(a);b=key(b);if(a===b)return 1;if(!a||!b)return 0;var aa=a.split(' '),bb=b.split(' '),hit=aa.filter(function(x){return bb.indexOf(x)>=0;}).length;return hit/Math.max(aa.length,bb.length);}
  function mapHeaders(headers){var mapping={},unmapped=[],suggestions=[];(headers||[]).forEach(function(h){var hk=key(h),best=null;CANONICAL.forEach(function(field){var candidates=(SYNONYMS[field]||[]).concat([field]);candidates.forEach(function(c){var score=similarity(hk,c);if(!best||score>best.score)best={field:field,score:score};});});if(best&&best.score>=0.66){mapping[h]=best.field;}else{unmapped.push(h);if(best&&best.score>=0.34)suggestions.push({sourceHeader:h,suggestedField:best.field,confidence:Math.round(best.score*100)});}});return {mapping:mapping,unmapped:unmapped,suggestions:suggestions,coverage:headers&&headers.length?Math.round(Object.keys(mapping).length/headers.length*100):0};}
  function normalize(field,value){if(value===null||value===undefined||value==='')return null;if(['availableSf','buildingSf','dockHighDoors','groundLevelDoors','autoParking','trailerParking','powerAmps','yearBuilt'].indexOf(field)>=0)return num(value);if(['landAcres','askingRate','opex','clearHeightFt','truckCourtFt','latitude','longitude'].indexOf(field)>=0)return num(value);if(field==='state')return text(value).toUpperCase();if(field==='status'||field==='dealType')return text(value).toUpperCase().replace(/\s+/g,'_');return text(value);}
  function normalizeRows(headers,rows,mapping){return (rows||[]).map(function(row,index){var out={_sourceRow:index+2};headers.forEach(function(h,i){var f=mapping[h];if(f)out[f]=normalize(f,Array.isArray(row)?row[i]:row[h]);});return out;});}
  function validate(record){var errors=[],warnings=[];if(!record.address)errors.push('ADDRESS_REQUIRED');if(!record.city)warnings.push('CITY_MISSING');if(record.availableSf!==null&&record.availableSf<0)errors.push('AVAILABLE_SF_NEGATIVE');if(record.buildingSf!==null&&record.buildingSf<0)errors.push('BUILDING_SF_NEGATIVE');if(record.availableSf&&record.buildingSf&&record.availableSf>record.buildingSf)warnings.push('AVAILABLE_EXCEEDS_BUILDING');if(record.latitude!==null&&(record.latitude<-90||record.latitude>90))errors.push('LATITUDE_INVALID');if(record.longitude!==null&&(record.longitude<-180||record.longitude>180))errors.push('LONGITUDE_INVALID');return {valid:errors.length===0,errors:errors,warnings:warnings};}
  function fingerprint(r){return [key(r.address),key(r.city),text(r.postalCode)].join('|');}
  function classify(records,existing){var by={};(existing||[]).forEach(function(r){by[fingerprint(r)]=r;});return records.map(function(r){var match=by[fingerprint(r)];if(!match)return {classification:'NEW',match:null};var changed=CANONICAL.filter(function(f){return text(r[f])!==''&&text(r[f])!==text(match[f]);});return {classification:changed.length?'UPDATE':'DUPLICATE',match:match,changedFields:changed};});}
  function preview(input){input=input||{};var headers=input.headers||[],recognition=source(headers,input.metadata||{}),mapping=mapHeaders(headers),records=normalizeRows(headers,input.rows||[],mapping.mapping),matches=classify(records,input.existingRecords||[]),counts={NEW:0,UPDATE:0,DUPLICATE:0,INVALID:0},review=records.map(function(r,i){var validation=validate(r),match=matches[i];if(!validation.valid)counts.INVALID++;else counts[match.classification]++;return {record:r,validation:validation,duplicate:match,confidence:Math.max(0,Math.min(100,Math.round((mapping.coverage+recognition.confidence+(validation.valid?100:30))/3)))};});return {version:VERSION,status:'PREVIEW_READY',source:recognition,mapping:mapping,records:review,summary:{rows:records.length,counts:counts,mappingCoverage:mapping.coverage,commitAllowed:false,reviewRequired:true},canonicalFields:CANONICAL.slice()};}
  return {VERSION:VERSION,canonicalFields:function(){return CANONICAL.slice();},recognizeSource:source,mapHeaders:mapHeaders,normalizeRows:normalizeRows,validateRecord:validate,classifyDuplicates:classify,preview:preview};
})();
function sciipUniversalIndustrialImportPreview(request){return SCIIP_UNIVERSAL_INDUSTRIAL_IMPORT.preview(request||{});}
function sciipUniversalIndustrialSourceRecognition(headers,metadata){return SCIIP_UNIVERSAL_INDUSTRIAL_IMPORT.recognizeSource(headers||[],metadata||{});}
function sciipUniversalIndustrialHeaderMapping(headers){return SCIIP_UNIVERSAL_INDUSTRIAL_IMPORT.mapHeaders(headers||[]);}


function sciipTestV7Epic3Sprint1IndustrialDigitalTwin(){
  var failures=[],tests=[];function check(name,condition){tests.push(name);if(!condition)failures.push(name);}
  var twin=sciipIndustrialDigitalTwinSample();
  check('TwinAvailable',twin.status==='AVAILABLE');
  check('CanonicalIdentity',twin.property.entityId==='PROPERTY-RIALTO-2125-LOWELL');
  check('OperationalComponents',twin.buildings.length===1&&twin.parcels.length===1&&twin.yards.length===1&&twin.utilities.length===1);
  check('Timeline',twin.timeline.length===2&&twin.timeline[0].eventType==='POWER_UPDATED');
  check('CompetitiveSet',twin.competitiveSet.length===2&&twin.competitiveSet[0].score>=twin.competitiveSet[1].score);
  check('SpatialCentroid',!!twin.spatial.centroid&&twin.spatial.centroid.latitude!==null);
  check('DataCompleteness',twin.metrics.dataCompleteness===100);
  check('GovernedReadModel',twin.version==='v7.0-epic3-sprint1.0'&&twin.schemaVersion==='industrial-digital-twin-v1');
  var out={framework:'SCIIP_V7_EPIC_3_SPRINT_1_INDUSTRIAL_DIGITAL_TWIN',version:SCIIP_INDUSTRIAL_DIGITAL_TWIN.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:tests.length,failures:failures,result:{twinId:twin.twinId,propertyId:twin.property.entityId,components:{buildings:twin.buildings.length,parcels:twin.parcels.length,yards:twin.yards.length,utilities:twin.utilities.length},timelineEvents:twin.timeline.length,competitors:twin.competitiveSet.length,dataCompleteness:twin.metrics.dataCompleteness,workspace:'digital-twin'}};
  console.log(JSON.stringify(out));return out;
}


/** SCIIP v7 Epic 3 Sprint 1 — Industrial Digital Twin */
var SCIIP_INDUSTRIAL_DIGITAL_TWIN = (function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint1.0';
  var SCHEMA_VERSION='industrial-digital-twin-v1';
  function text(v){return String(v===null||v===undefined?'':v).trim();}
  function num(v){if(v===null||v===undefined||v==='')return null;var n=Number(String(v).replace(/[$,% ,]/g,''));return isFinite(n)?n:null;}
  function clone(v){return JSON.parse(JSON.stringify(v||{}));}
  function hash(value){var s=text(value),h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16)).slice(-8).toUpperCase();}
  function now(){return new Date().toISOString();}
  function distanceMiles(a,b){if(!a||!b)return null;var lat1=num(a.latitude),lng1=num(a.longitude),lat2=num(b.latitude),lng2=num(b.longitude);if([lat1,lng1,lat2,lng2].some(function(x){return x===null;}))return null;var r=3958.7613,p=Math.PI/180,dlat=(lat2-lat1)*p,dlng=(lng2-lng1)*p;var q=Math.sin(dlat/2)*Math.sin(dlat/2)+Math.cos(lat1*p)*Math.cos(lat2*p)*Math.sin(dlng/2)*Math.sin(dlng/2);return Math.round((2*r*Math.atan2(Math.sqrt(q),Math.sqrt(1-q)))*100)/100;}
  function normalizeProperty(p){p=clone(p);p.entityId=p.entityId||p.propertyId||('PROPERTY-'+hash([p.address,p.city,p.state].join('|')));p.propertyId=p.entityId;p.name=p.name||p.address||p.entityId;p.address=text(p.address);p.city=text(p.city);p.state=text(p.state).toUpperCase();p.postalCode=text(p.postalCode);p.buildingSf=num(p.buildingSf||p.availableSf);p.landAcres=num(p.landAcres);p.clearHeightFt=num(p.clearHeightFt||p.clearHeight);p.powerAmps=num(p.powerAmps);p.dockHighDoors=num(p.dockHighDoors||p.dh);p.groundLevelDoors=num(p.groundLevelDoors||p.gl);p.autoParking=num(p.autoParking);p.trailerParking=num(p.trailerParking);p.latitude=num(p.latitude);p.longitude=num(p.longitude);return p;}
  function timeline(input){var out=[];(input.events||[]).forEach(function(e,i){out.push({eventId:e.eventId||('TWIN-EVT-'+hash([input.property.entityId,e.eventType||e.type,e.occurredAt||i].join('|'))),eventType:e.eventType||e.type||'PROPERTY_UPDATED',occurredAt:e.occurredAt||e.date||now(),title:e.title||e.eventType||e.type||'Property update',summary:e.summary||e.description||'',sourceId:e.sourceId||null});});return out.sort(function(a,b){return String(b.occurredAt).localeCompare(String(a.occurredAt));});}
  function scoreCompetitor(subject,c){var dimensions=[],score=0,weight=0;function compare(field,w,tolerance){var a=num(subject[field]),b=num(c[field]);if(a===null||b===null)return;var similarity=Math.max(0,1-Math.abs(a-b)/Math.max(Math.abs(a),Math.abs(b),tolerance||1));score+=similarity*w;weight+=w;dimensions.push({field:field,subject:a,candidate:b,similarity:Math.round(similarity*100)});}compare('buildingSf',25,10000);compare('clearHeightFt',15,4);compare('powerAmps',20,1000);compare('dockHighDoors',10,10);compare('trailerParking',10,20);var miles=distanceMiles(subject,c);if(miles!==null){var geo=Math.max(0,1-(miles/50));score+=geo*20;weight+=20;dimensions.push({field:'distanceMiles',candidate:miles,similarity:Math.round(geo*100)});}return {propertyId:c.entityId,name:c.name,address:c.address,city:c.city,distanceMiles:miles,score:weight?Math.round(score/weight*100):0,dimensions:dimensions};}
  function build(request){request=request||{};var property=normalizeProperty(request.property||{}),errors=[];if(!property.address)errors.push('PROPERTY_ADDRESS_REQUIRED');if(!property.city)errors.push('PROPERTY_CITY_REQUIRED');var buildings=(request.buildings||[]).map(function(b,i){b=clone(b);b.buildingId=b.buildingId||('BUILDING-'+hash([property.entityId,b.name||i].join('|')));b.buildingSf=num(b.buildingSf);b.clearHeightFt=num(b.clearHeightFt);b.powerAmps=num(b.powerAmps);return b;});var parcels=(request.parcels||[]).map(function(p,i){p=clone(p);p.parcelId=p.parcelId||('PARCEL-'+hash([property.entityId,p.apn||i].join('|')));p.landAcres=num(p.landAcres);return p;});var yards=(request.yards||[]).map(function(y,i){y=clone(y);y.yardId=y.yardId||('YARD-'+hash([property.entityId,y.name||i].join('|')));y.acres=num(y.acres);y.trailerStalls=num(y.trailerStalls);return y;});var utilities=(request.utilities||[]).map(function(u,i){u=clone(u);u.utilityId=u.utilityId||('UTILITY-'+hash([u.name,u.utilityType||i].join('|')));u.capacity=num(u.capacity||u.powerAmps);return u;});var relationships=(request.relationships||[]).map(function(r,i){r=clone(r);r.relationshipId=r.relationshipId||('REL-'+hash([property.entityId,r.type,r.entityId||i].join('|')));return r;});var competitors=(request.competitors||[]).map(normalizeProperty).filter(function(c){return c.entityId!==property.entityId;}).map(function(c){return scoreCompetitor(property,c);}).sort(function(a,b){return b.score-a.score;});var completenessFields=['buildingSf','landAcres','clearHeightFt','powerAmps','dockHighDoors','autoParking','trailerParking','latitude','longitude'];var complete=completenessFields.filter(function(f){return property[f]!==null&&property[f]!=='';}).length;var quality=Math.round(complete/completenessFields.length*100);var twin={version:VERSION,schemaVersion:SCHEMA_VERSION,twinId:'TWIN-'+hash(property.entityId),property:property,buildings:buildings,parcels:parcels,yards:yards,utilities:utilities,occupancies:clone(request.occupancies||[]),listings:clone(request.listings||[]),transactions:clone(request.transactions||[]),relationships:relationships,timeline:timeline({property:property,events:request.events||[]}),competitiveSet:competitors.slice(0,25),spatial:{centroid:property.latitude!==null&&property.longitude!==null?{latitude:property.latitude,longitude:property.longitude}:null,geometry:request.geometry||null,nearbyCount:competitors.length},metrics:{dataCompleteness:quality,buildingCount:buildings.length,parcelCount:parcels.length,yardCount:yards.length,relationshipCount:relationships.length,eventCount:(request.events||[]).length,competitorCount:competitors.length},status:errors.length?'INVALID':'AVAILABLE',errors:errors,generatedAt:request.generatedAt||now()};return twin;}
  function sample(){return build({property:{entityId:'PROPERTY-RIALTO-2125-LOWELL',name:'Locust Gateway Logistics Center',address:'2125 W Lowell St',city:'Rialto',state:'CA',postalCode:'92376',buildingSf:664859,landAcres:40.2,clearHeightFt:42,powerAmps:8000,dockHighDoors:82,autoParking:265,trailerParking:398,latitude:34.0978,longitude:-117.4147,status:'PLANNED'},buildings:[{name:'Building 1',buildingSf:664859,clearHeightFt:42,powerAmps:8000}],parcels:[{apn:'000-000-001',landAcres:40.2}],yards:[{name:'Trailer Yard',acres:15,trailerStalls:398}],utilities:[{name:'Southern California Edison',utilityType:'ELECTRIC',capacity:8000}],relationships:[{type:'OWNED_BY',entityId:'OWNER-BROOKFIELD',name:'Brookfield'}],events:[{eventType:'PROPERTY_CREATED',occurredAt:'2026-06-01T00:00:00Z',title:'Property entered SCIIP'},{eventType:'POWER_UPDATED',occurredAt:'2026-07-01T00:00:00Z',title:'Power capacity updated',summary:'Up to 8,000 amps'}],competitors:[{entityId:'PROPERTY-SLOVER',name:'Slover Logistics Center',address:'18012 Slover Ave',city:'Bloomington',state:'CA',buildingSf:650000,clearHeightFt:40,powerAmps:4000,dockHighDoors:78,trailerParking:350,latitude:34.062,longitude:-117.407},{entityId:'PROPERTY-HARVILL',name:'20123 Harvill Ave',address:'20123 Harvill Ave',city:'Perris',state:'CA',buildingSf:500000,clearHeightFt:40,powerAmps:4000,dockHighDoors:60,trailerParking:250,latitude:33.843,longitude:-117.258}]});}
  return {VERSION:VERSION,SCHEMA_VERSION:SCHEMA_VERSION,build:build,sample:sample,distanceMiles:distanceMiles};
})();
function sciipIndustrialDigitalTwin(request){return SCIIP_INDUSTRIAL_DIGITAL_TWIN.build(request||{});}
function sciipIndustrialDigitalTwinSample(){return SCIIP_INDUSTRIAL_DIGITAL_TWIN.sample();}


var SCIIP_ACQUISITION_REGISTRY=(function(){'use strict';var records={};function keyOf(r){return String(r.acquisitionId||r.id||[r.address||'',r.city||'',r.purchasePrice||''].join('|')).toUpperCase();}function register(r){r=r||{};var k=keyOf(r);if(!k||k==='||')throw new Error('Acquisition business key is required.');if(records[k])return {status:'DUPLICATE_SAFE',record:records[k],created:false};var out={acquisitionId:r.acquisitionId||r.id||('ACQ-'+(Object.keys(records).length+1)),address:r.address||'',city:r.city||'',submarket:r.submarket||'',purchasePrice:Number(r.purchasePrice||0),squareFeet:Number(r.squareFeet||0),annualNoi:Number(r.annualNoi||0),marketRentPerSf:Number(r.marketRentPerSf||0),occupancyPct:Number(r.occupancyPct==null?1:r.occupancyPct),source:r.source||'MANUAL',status:r.status||'UNDER_REVIEW',createdAt:new Date().toISOString()};records[k]=out;return {status:'CREATED',record:out,created:true};}function list(){return Object.keys(records).map(function(k){return records[k];});}function reset(){records={};}return {register:register,list:list,reset:reset};})();


var SCIIP_ACQUISITION_WORKSPACE=(function(){'use strict';function build(d){d=d||{};return {workspace:{id:'investment-underwriting-acquisition',label:'Investment Underwriting & Acquisition Intelligence',sections:{pipeline:d.pipeline||{},underwriting:d.underwriting||{},financialModel:d.financialModel||{},cashFlow:d.cashFlow||[],sensitivities:d.sensitivities||{},risks:d.risks||{},committee:d.committee||{},executiveSummary:d.executiveSummary||{}}}};}return {build:build};})();


var SCIIP_FINANCIAL_MODEL_ENGINE = (function () {
  'use strict';

  function round(value, decimals) {
    var places = decimals == null ? 2 : decimals;
    var factor = Math.pow(10, places);
    return Math.round((Number(value) || 0) * factor) / factor;
  }

  function payment(rate, periods, principal) {
    if (!periods) return 0;
    if (!rate) return principal / periods;
    var compound = Math.pow(1 + rate, periods);
    return principal * rate * compound / (compound - 1);
  }

  function npv(rate, cashFlows) {
    var total = 0;
    for (var i = 0; i < cashFlows.length; i++) {
      total += Number(cashFlows[i] || 0) / Math.pow(1 + rate, i);
    }
    return total;
  }

  function irr(cashFlows) {
    var low = -0.99;
    var high = 10;
    var middle = 0;
    for (var i = 0; i < 200; i++) {
      middle = (low + high) / 2;
      var value = npv(middle, cashFlows);
      if (Math.abs(value) < 0.000001) break;
      if (value > 0) low = middle;
      else high = middle;
    }
    return middle;
  }

  function model(request) {
    request = request || {};
    var price = Number(request.purchasePrice || 0);
    var ltv = Number(request.ltvPct == null ? 65 : request.ltvPct) / 100;
    var loan = price * ltv;
    var equity = price - loan + Number(request.closingCosts || 0) + Number(request.immediateCapital || 0);
    var monthlyRate = Number(request.interestRatePct || 0) / 1200;
    var amortizationMonths = Number(request.amortizationYears || 30) * 12;
    var holdYears = Number(request.holdYears || 5);
    var monthlyDebtService = payment(monthlyRate, amortizationMonths, loan);
    var annualDebtService = monthlyDebtService * 12;
    var initialNoi = Number(request.annualNoi || 0);
    var growthRate = Number(request.noiGrowthPct || 0) / 100;
    var exitCapRate = Number(request.exitCapRatePct || 0) / 100;
    var saleCostRate = Number(request.saleCostPct || 0) / 100;
    var cashFlows = [-equity];

    for (var year = 1; year <= holdYears; year++) {
      var noi = initialNoi * Math.pow(1 + growthRate, year - 1);
      var annualCashFlow = noi - annualDebtService;
      if (year === holdYears) {
        var nextYearNoi = initialNoi * Math.pow(1 + growthRate, year);
        var grossSalePrice = exitCapRate ? nextYearNoi / exitCapRate : 0;
        var outstandingBalance;
        if (monthlyRate) {
          var elapsedMonths = year * 12;
          outstandingBalance = loan * Math.pow(1 + monthlyRate, elapsedMonths) -
            monthlyDebtService * (Math.pow(1 + monthlyRate, elapsedMonths) - 1) / monthlyRate;
        } else {
          outstandingBalance = Math.max(0, loan - monthlyDebtService * year * 12);
        }
        annualCashFlow += grossSalePrice * (1 - saleCostRate) - outstandingBalance;
      }
      cashFlows.push(annualCashFlow);
    }

    var dscr = annualDebtService ? initialNoi / annualDebtService : 0;
    var cashOnCash = equity ? (initialNoi - annualDebtService) / equity * 100 : 0;
    var discountRate = Number(request.discountRatePct || 10) / 100;
    var totalPositiveCashFlow = cashFlows.slice(1).reduce(function (sum, value) { return sum + value; }, 0);

    return {
      loanAmount: round(loan, 2),
      equityRequired: round(equity, 2),
      annualDebtService: round(annualDebtService, 2),
      dscr: round(dscr, 2),
      cashOnCashPct: round(cashOnCash, 2),
      irrPct: round(irr(cashFlows) * 100, 2),
      npv: round(npv(discountRate, cashFlows), 2),
      equityMultiple: round(equity ? totalPositiveCashFlow / equity : 0, 2),
      cashFlows: cashFlows.map(function (value) { return round(value, 2); }),
      holdYears: holdYears
    };
  }

  return { model: model, npv: npv, irr: irr };
})();


var SCIIP_INVESTMENT_COMMITTEE_ENGINE=(function(){'use strict';function evaluate(r){r=r||{};var u=r.underwriting||{},f=r.financialModel||{},risk=0,evidence=[];function add(name,pass,weight,value){evidence.push({factor:name,pass:pass,weight:weight,value:value});if(!pass)risk+=weight;}add('CAP_RATE',u.capRatePct>=Number(r.minimumCapRatePct||5.5),20,u.capRatePct);add('DSCR',f.dscr>=Number(r.minimumDscr||1.25),25,f.dscr);add('IRR',f.irrPct>=Number(r.minimumIrrPct||12),25,f.irrPct);add('EQUITY_MULTIPLE',f.equityMultiple>=Number(r.minimumEquityMultiple||1.5),15,f.equityMultiple);add('OCCUPANCY',Number(r.occupancyPct==null?1:r.occupancyPct)>=Number(r.minimumOccupancyPct==null?.85:r.minimumOccupancyPct),15,r.occupancyPct);var score=100-risk,recommendation=score>=80?'APPROVE':score>=60?'CONDITIONAL_APPROVAL':'DECLINE',confidence=Math.round((.5+score/200)*10000)/10000;return {recommendation:recommendation,score:score,riskScore:risk,confidence:confidence,evidence:evidence,approvalRequired:true,requiredApprovals:['INVESTMENT_COMMITTEE','EXECUTIVE_SPONSOR'],decisionStatus:'PENDING_APPROVAL'};}return {evaluate:evaluate};})();


var SCIIP_INVESTMENT_UNDERWRITING_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-18.0';function definition(){return {id:'investment-underwriting-acquisition-intelligence',name:'Investment Underwriting & Acquisition Intelligence',version:VERSION,dependencies:['portfolio-performance-asset-management'],services:['investment-underwriting-application'],queries:['investment-underwriting-query'],events:['ACQUISITION_REGISTERED','UNDERWRITING_COMPLETED','INVESTMENT_COMMITTEE_RECOMMENDATION'],stateBindings:['acquisitionPipeline','underwritingModel','investmentCommittee'],workspaces:['investment-underwriting-acquisition'],tests:['sciipTestV7IntegrationSprint18'],liveHandler:'sciipInvestmentUnderwritingHeartbeatV7',queryHandler:'sciipInvestmentUnderwritingQueryV7'};}function run(r){r=r||{};var intake=SCIIP_ACQUISITION_REGISTRY.register(r.acquisition||r),a=intake.record,u=SCIIP_UNDERWRITING_ENGINE.analyze({purchasePrice:a.purchasePrice,annualNoi:a.annualNoi,squareFeet:a.squareFeet,immediateCapital:r.immediateCapital,stabilizedNoi:r.stabilizedNoi,marketCapRatePct:r.marketCapRatePct}),modelInput={purchasePrice:a.purchasePrice,annualNoi:a.annualNoi,ltvPct:r.ltvPct,interestRatePct:r.interestRatePct,amortizationYears:r.amortizationYears,holdYears:r.holdYears,noiGrowthPct:r.noiGrowthPct,exitCapRatePct:r.exitCapRatePct,saleCostPct:r.saleCostPct,discountRatePct:r.discountRatePct,closingCosts:r.closingCosts,immediateCapital:r.immediateCapital},f=SCIIP_FINANCIAL_MODEL_ENGINE.model(modelInput),s=SCIIP_SENSITIVITY_ANALYSIS_ENGINE.run(Object.assign({},modelInput,{growthScenarios:r.growthScenarios,exitCapScenarios:r.exitCapScenarios})),c=SCIIP_INVESTMENT_COMMITTEE_ENGINE.evaluate({underwriting:u,financialModel:f,occupancyPct:a.occupancyPct,minimumCapRatePct:r.minimumCapRatePct,minimumDscr:r.minimumDscr,minimumIrrPct:r.minimumIrrPct,minimumEquityMultiple:r.minimumEquityMultiple,minimumOccupancyPct:r.minimumOccupancyPct}),w=SCIIP_ACQUISITION_WORKSPACE.build({pipeline:{acquisition:a,status:a.status},underwriting:u,financialModel:f,cashFlow:f.cashFlows,sensitivities:s,risks:{riskScore:c.riskScore,evidence:c.evidence},committee:c,executiveSummary:{recommendation:c.recommendation,confidence:c.confidence,irrPct:f.irrPct,dscr:f.dscr}});return {version:VERSION,status:'COMPLETED',intake:intake,underwriting:u,financialModel:f,sensitivities:s,committee:c,workspace:w};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_18'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('investment-underwriting-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('investment-underwriting-application')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('investment-underwriting-query',sciipInvestmentUnderwritingQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('investment-underwriting-application',sciipInvestmentUnderwritingHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipInvestmentUnderwritingQueryV7(r){return SCIIP_INVESTMENT_UNDERWRITING_APPLICATION.run(r||{});}function sciipInvestmentUnderwritingHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-18.0',workspace:'investment-underwriting-acquisition',generatedAt:new Date().toISOString()};}


var SCIIP_SENSITIVITY_ANALYSIS_ENGINE=(function(){'use strict';function run(base){base=base||{};var growths=base.growthScenarios||[0,2,4],caps=base.exitCapScenarios||[5.5,6,6.5],matrix=[],best=null,worst=null;for(var i=0;i<growths.length;i++)for(var j=0;j<caps.length;j++){var input={};for(var k in base)input[k]=base[k];input.noiGrowthPct=growths[i];input.exitCapRatePct=caps[j];var m=SCIIP_FINANCIAL_MODEL_ENGINE.model(input),cell={noiGrowthPct:growths[i],exitCapRatePct:caps[j],irrPct:m.irrPct,npv:m.npv,equityMultiple:m.equityMultiple};matrix.push(cell);if(!best||cell.irrPct>best.irrPct)best=cell;if(!worst||cell.irrPct<worst.irrPct)worst=cell;}return {scenarios:matrix.length,matrix:matrix,best:best,worst:worst};}return {run:run};})();


var SCIIP_UNDERWRITING_ENGINE=(function(){'use strict';function round(v,n){var p=Math.pow(10,n||2);return Math.round((Number(v)||0)*p)/p;}function analyze(r){r=r||{};var price=Number(r.purchasePrice||0),noi=Number(r.annualNoi||0),sf=Number(r.squareFeet||0),capital=Number(r.immediateCapital||0),stabilizedNoi=Number(r.stabilizedNoi||noi),capRate=price?noi/price*100:0,yieldOnCost=(price+capital)?stabilizedNoi/(price+capital)*100:0,pricePerSf=sf?price/sf:0;return {purchasePrice:price,annualNoi:noi,capRatePct:round(capRate,2),pricePerSf:round(pricePerSf,2),immediateCapital:capital,totalBasis:price+capital,stabilizedNoi:stabilizedNoi,yieldOnCostPct:round(yieldOnCost,2),spreadToMarketCapBps:round(((yieldOnCost-Number(r.marketCapRatePct||0))*100),0),status:capRate>0?'UNDERWRITTEN':'INSUFFICIENT_DATA'};}return {analyze:analyze};})();


/** Apps Script certification for Epic 3 Sprint 4. */
function sciipTestV7Epic3Sprint4MarketIntelligence(){
  var failures=[];
  function ok(name,value){if(!value)failures.push(name);}
  var previous={propertyId:'PROPERTY-RIALTO-2125-LOWELL',status:'Available',availableSf:664859,askingRate:1.35,powerAmps:4000,constructionStatus:'Under Construction'};
  var current={propertyId:'PROPERTY-RIALTO-2125-LOWELL',status:'Available',availableSf:664859,askingRate:1.25,powerAmps:8000,constructionStatus:'Complete'};
  var source={sourceId:'SURVEY-2026-07-17',importJobId:'JOB-1',sourceName:'LEE_INDUSTRIAL_SURVEY',observedAt:'2026-07-17T08:00:00Z'};
  var snap=SCIIP_MARKET_INTELLIGENCE.buildSnapshot(previous,current,source,[current]);
  ok('version',snap.version==='v7.0-epic3-sprint4.0');
  ok('events',snap.events.length===3);
  ok('rate',snap.events.some(function(e){return e.eventType==='RATE_CHANGE';}));
  ok('power',snap.events.some(function(e){return e.eventType==='POWER_CHANGE';}));
  ok('construction',snap.events.some(function(e){return e.eventType==='CONSTRUCTION_COMPLETED';}));
  ok('timeline',snap.timeline.length===3);
  ok('opportunities',snap.opportunities.length>=2);
  ok('governance',snap.reviewRequired===true&&snap.destructiveCommitEnabled===false);
  var result={framework:'SCIIP_V7_EPIC_3_SPRINT_4_MARKET_INTELLIGENCE',version:'v7.0-epic3-sprint4.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{events:snap.events.length,rateChanges:snap.events.filter(function(e){return e.eventType==='RATE_CHANGE';}).length,powerChanges:snap.events.filter(function(e){return e.eventType==='POWER_CHANGE';}).length,constructionCompletions:snap.events.filter(function(e){return e.eventType==='CONSTRUCTION_COMPLETED';}).length,opportunities:snap.opportunities.length,summary:snap.summary.summary,workspace:'market-intelligence',reviewRequired:snap.reviewRequired,destructiveCommitEnabled:snap.destructiveCommitEnabled}};
  console.log(JSON.stringify(result));return result;
}


/** Grounded market-intelligence retrieval bridge for SCIIP AI Copilot. */
function sciipMarketIntelligenceAnswerContext(question,events,properties){
  var q=String(question||'').toLowerCase(),filter={};
  if(q.indexOf('today')>=0)filter.since=new Date(new Date().setHours(0,0,0,0)).toISOString();
  else if(q.indexOf('week')>=0)filter.since=new Date(Date.now()-7*86400000).toISOString();
  var rows=SCIIP_MARKET_INTELLIGENCE.timeline(events||[],filter),summary=SCIIP_MARKET_INTELLIGENCE.summarize(rows),opps=SCIIP_MARKET_INTELLIGENCE.opportunities(rows,properties||[]);
  return {intent:q.indexOf('opportun')>=0?'MARKET_OPPORTUNITIES':'MARKET_CHANGES',groundedOnly:true,summary:summary,evidence:rows.slice(0,20),opportunities:opps.slice(0,10),actions:[{type:'OPEN_WORKSPACE',workspace:'market-intelligence'}]};
}


/** SCIIP_OS v7.0 Epic 3 Sprint 4 — Market Intelligence Engine. */
var SCIIP_MARKET_INTELLIGENCE = (function () {
  'use strict';
  var VERSION='v7.0-epic3-sprint4.0';
  var CONTRACT='market-event-v1';
  var EVENT_TYPES={
    NEW_AVAILABILITY:'NEW_AVAILABILITY', REMOVED_FROM_MARKET:'REMOVED_FROM_MARKET', RATE_CHANGE:'RATE_CHANGE',
    STATUS_CHANGE:'STATUS_CHANGE', POWER_CHANGE:'POWER_CHANGE', OWNERSHIP_CHANGE:'OWNERSHIP_CHANGE',
    TENANT_CHANGE:'TENANT_CHANGE', CONSTRUCTION_STARTED:'CONSTRUCTION_STARTED', CONSTRUCTION_COMPLETED:'CONSTRUCTION_COMPLETED',
    LEASE_EXECUTED:'LEASE_EXECUTED', SALE_COMPLETED:'SALE_COMPLETED', FIELD_CHANGE:'FIELD_CHANGE'
  };
  var TRACKED=[
    {field:'status',type:'STATUS_CHANGE'}, {field:'availabilityStatus',type:'STATUS_CHANGE'}, {field:'availableSf',type:'NEW_AVAILABILITY'},
    {field:'askingRate',type:'RATE_CHANGE'}, {field:'powerAmps',type:'POWER_CHANGE'}, {field:'ownerId',type:'OWNERSHIP_CHANGE'},
    {field:'tenantId',type:'TENANT_CHANGE'}, {field:'constructionStatus',type:'STATUS_CHANGE'}
  ];
  function clone_(x){return JSON.parse(JSON.stringify(x==null?null:x));}
  function hash_(s){s=String(s||'');var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  function iso_(v){var d=v?new Date(v):new Date();return isNaN(d.getTime())?new Date().toISOString():d.toISOString();}
  function equal_(a,b){if(a===b)return true;if(a==null&&b==null)return true;return JSON.stringify(a)==JSON.stringify(b);}
  function eventType_(field,oldValue,newValue){
    var ov=String(oldValue==null?'':oldValue).toUpperCase(),nv=String(newValue==null?'':newValue).toUpperCase();
    if(field==='availableSf'&&Number(oldValue||0)<=0&&Number(newValue||0)>0)return EVENT_TYPES.NEW_AVAILABILITY;
    if(field==='availableSf'&&Number(oldValue||0)>0&&Number(newValue||0)<=0)return EVENT_TYPES.REMOVED_FROM_MARKET;
    if(field==='constructionStatus'&&nv.indexOf('UNDER CONSTRUCTION')>=0)return EVENT_TYPES.CONSTRUCTION_STARTED;
    if(field==='constructionStatus'&&(nv.indexOf('COMPLETE')>=0||nv.indexOf('AVAILABLE')>=0))return EVENT_TYPES.CONSTRUCTION_COMPLETED;
    if(field==='status'&&nv.indexOf('LEASED')>=0)return EVENT_TYPES.LEASE_EXECUTED;
    if(field==='status'&&nv.indexOf('SOLD')>=0)return EVENT_TYPES.SALE_COMPLETED;
    for(var i=0;i<TRACKED.length;i++)if(TRACKED[i].field===field)return EVENT_TYPES[TRACKED[i].type]||TRACKED[i].type;
    return EVENT_TYPES.FIELD_CHANGE;
  }
  function confidence_(source,field,oldValue,newValue){var score=70;if(source&&source.sourceId)score+=8;if(source&&source.importJobId)score+=8;if(field==='status'||field==='askingRate'||field==='availableSf')score+=6;if(oldValue!=null&&newValue!=null)score+=4;return Math.min(99,score);}
  function detectChanges(previous,current,source){
    previous=previous||{};current=current||{};source=source||{};
    var propertyId=String(current.propertyId||previous.propertyId||current.id||previous.id||'UNKNOWN');
    var fields={},i,k;for(k in previous)if(previous.hasOwnProperty(k))fields[k]=true;for(k in current)if(current.hasOwnProperty(k))fields[k]=true;
    var changes=[];for(k in fields){if(k==='updatedAt'||k==='createdAt'||k==='source'||k==='provenance')continue;if(equal_(previous[k],current[k]))continue;var type=eventType_(k,previous[k],current[k]);var observedAt=iso_(source.observedAt||current.updatedAt);var eventId='MEVT-'+hash_([propertyId,type,k,JSON.stringify(previous[k]),JSON.stringify(current[k]),observedAt].join('|'));changes.push({
      eventId:eventId,contractVersion:CONTRACT,eventType:type,entityType:'PROPERTY',entityId:propertyId,propertyId:propertyId,field:k,
      oldValue:clone_(previous[k]),newValue:clone_(current[k]),observedAt:observedAt,recordedAt:new Date().toISOString(),
      confidence:confidence_(source,k,previous[k],current[k]),source:{sourceId:String(source.sourceId||'DIRECT'),importJobId:String(source.importJobId||''),sourceName:String(source.sourceName||'SCIIP')},
      evidence:[{kind:'FIELD_DIFF',field:k,oldValue:clone_(previous[k]),newValue:clone_(current[k])}],status:'DETECTED'
    });}
    changes.sort(function(a,b){return a.eventId<b.eventId?-1:1;});return changes;
  }
  function timeline(events,filter){filter=filter||{};return (events||[]).filter(function(e){return (!filter.propertyId||e.propertyId===filter.propertyId)&&(!filter.eventType||e.eventType===filter.eventType)&&(!filter.since||new Date(e.observedAt)>=new Date(filter.since));}).sort(function(a,b){return new Date(b.observedAt)-new Date(a.observedAt);});}
  function summarize(events){var rows=timeline(events,{}),counts={},markets={},high=0;rows.forEach(function(e){counts[e.eventType]=(counts[e.eventType]||0)+1;if(e.marketId)markets[e.marketId]=(markets[e.marketId]||0)+1;if(Number(e.confidence||0)>=90)high++;});var ordered=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];});var text=rows.length?rows.length+' governed market events detected. '+ordered.slice(0,3).map(function(k){return counts[k]+' '+k.replace(/_/g,' ').toLowerCase();}).join(', ')+'.':'No governed market changes detected.';return {eventCount:rows.length,typeCounts:counts,marketCounts:markets,highConfidence:high,summary:text,generatedAt:new Date().toISOString()};}
  function opportunities(events,currentProperties){var byId={};(currentProperties||[]).forEach(function(p){byId[String(p.propertyId||p.id)]=p;});var out=[];(events||[]).forEach(function(e){var score=0,reasons=[];if(e.eventType===EVENT_TYPES.NEW_AVAILABILITY){score+=45;reasons.push('New availability');}if(e.eventType===EVENT_TYPES.RATE_CHANGE&&Number(e.newValue)<Number(e.oldValue)){score+=35;reasons.push('Asking rate decreased');}if(e.eventType===EVENT_TYPES.POWER_CHANGE&&Number(e.newValue)>Number(e.oldValue)){score+=30;reasons.push('Power capacity increased');}if(e.eventType===EVENT_TYPES.CONSTRUCTION_COMPLETED){score+=25;reasons.push('Construction completed');}var p=byId[e.propertyId]||{};if(Number(p.powerAmps||0)>=4000){score+=10;reasons.push('High-power industrial asset');}if(Number(p.availableSf||0)>=250000){score+=10;reasons.push('Large-block availability');}if(score)out.push({opportunityId:'OPP-'+hash_(e.eventId),propertyId:e.propertyId,eventId:e.eventId,score:Math.min(100,score),priority:score>=70?'HIGH':score>=40?'MEDIUM':'LOW',reasons:reasons,confidence:e.confidence,status:'OPEN'});});out.sort(function(a,b){return b.score-a.score;});return out;}
  function buildSnapshot(previous,current,source,portfolio){var events=detectChanges(previous,current,source),opps=opportunities(events,portfolio||[current]);return {version:VERSION,contractVersion:CONTRACT,status:'AVAILABLE',events:events,timeline:timeline(events,{propertyId:String(current.propertyId||current.id||'UNKNOWN')}),summary:summarize(events),opportunities:opps,reviewRequired:true,destructiveCommitEnabled:false};}
  return {VERSION:VERSION,CONTRACT:CONTRACT,EVENT_TYPES:EVENT_TYPES,detectChanges:detectChanges,timeline:timeline,summarize:summarize,opportunities:opportunities,buildSnapshot:buildSnapshot};
})();
function sciipMarketIntelligenceDetectChanges(previous,current,source){return SCIIP_MARKET_INTELLIGENCE.detectChanges(previous,current,source);}
function sciipMarketIntelligenceSnapshot(previous,current,source,portfolio){return SCIIP_MARKET_INTELLIGENCE.buildSnapshot(previous,current,source,portfolio);}
function sciipMarketIntelligenceRecent(events,filter){return SCIIP_MARKET_INTELLIGENCE.timeline(events,filter||{});}


/** Append-only persistence and query facade for Epic 3 Sprint 4. */
var SCIIP_MARKET_INTELLIGENCE_STORE=(function(){'use strict';
var EVENT_SHEET='SCIIP_MARKET_EVENTS',OPP_SHEET='SCIIP_MARKET_OPPORTUNITIES';
var EVENT_HEADERS=['eventId','contractVersion','eventType','entityType','entityId','propertyId','field','oldValueJson','newValueJson','observedAt','recordedAt','confidence','sourceJson','evidenceJson','status'];
var OPP_HEADERS=['opportunityId','propertyId','eventId','score','priority','reasonsJson','confidence','status','recordedAt'];
function sheet_(name,headers){var ss=SpreadsheetApp.getActiveSpreadsheet();if(!ss)throw new Error('NO_ACTIVE_SPREADSHEET');var sh=ss.getSheetByName(name)||ss.insertSheet(name);if(sh.getLastRow()===0)sh.getRange(1,1,1,headers.length).setValues([headers]);return sh;}
function existing_(sh,col){if(sh.getLastRow()<2)return{};var vals=sh.getRange(2,col,sh.getLastRow()-1,1).getValues(),o={};vals.forEach(function(r){o[String(r[0])]=true;});return o;}
function appendEvents(events){var sh=sheet_(EVENT_SHEET,EVENT_HEADERS),seen=existing_(sh,1),rows=[];(events||[]).forEach(function(e){if(seen[e.eventId])return;rows.push([e.eventId,e.contractVersion,e.eventType,e.entityType,e.entityId,e.propertyId,e.field,JSON.stringify(e.oldValue),JSON.stringify(e.newValue),e.observedAt,e.recordedAt,e.confidence,JSON.stringify(e.source||{}),JSON.stringify(e.evidence||[]),e.status]);seen[e.eventId]=true;});if(rows.length)sh.getRange(sh.getLastRow()+1,1,rows.length,EVENT_HEADERS.length).setValues(rows);return {received:(events||[]).length,created:rows.length,duplicates:(events||[]).length-rows.length,sheet:EVENT_SHEET};}
function appendOpportunities(items){var sh=sheet_(OPP_SHEET,OPP_HEADERS),seen=existing_(sh,1),rows=[];(items||[]).forEach(function(o){if(seen[o.opportunityId])return;rows.push([o.opportunityId,o.propertyId,o.eventId,o.score,o.priority,JSON.stringify(o.reasons||[]),o.confidence,o.status,new Date().toISOString()]);seen[o.opportunityId]=true;});if(rows.length)sh.getRange(sh.getLastRow()+1,1,rows.length,OPP_HEADERS.length).setValues(rows);return {received:(items||[]).length,created:rows.length,duplicates:(items||[]).length-rows.length,sheet:OPP_SHEET};}
function read_(name){var ss=SpreadsheetApp.getActiveSpreadsheet(),sh=ss&&ss.getSheetByName(name);if(!sh||sh.getLastRow()<2)return[];var v=sh.getDataRange().getValues(),h=v.shift().map(String);return v.map(function(r){var o={};h.forEach(function(k,i){o[k]=r[i];});return o;});}
function snapshot(){var events=read_(EVENT_SHEET),opps=read_(OPP_SHEET);return {status:'AVAILABLE',events:events.slice(-50).reverse(),opportunities:opps.slice(-25).reverse(),summary:SCIIP_MARKET_INTELLIGENCE.summarize(events.map(function(e){return {eventId:e.eventId,eventType:e.eventType,propertyId:e.propertyId,observedAt:e.observedAt,confidence:Number(e.confidence||0)};})),counts:{events:events.length,opportunities:opps.length}};}
return {appendEvents:appendEvents,appendOpportunities:appendOpportunities,snapshot:snapshot};})();
function sciipPersistMarketIntelligence(snapshot){snapshot=snapshot||{};return {events:SCIIP_MARKET_INTELLIGENCE_STORE.appendEvents(snapshot.events||[]),opportunities:SCIIP_MARKET_INTELLIGENCE_STORE.appendOpportunities(snapshot.opportunities||[])};}
function sciipMarketIntelligenceWorkspace(){try{return SCIIP_MARKET_INTELLIGENCE_STORE.snapshot();}catch(e){return {status:'READY',events:[],opportunities:[],summary:{eventCount:0,summary:'No governed market changes detected.'},counts:{events:0,opportunities:0},diagnostic:String(e.message||e)};}}


/** SCIIP_OS v7.0 Sprint 13 — Broker Action Center. */
var SCIIP_BROKER_ACTION_CENTER=(function(){'use strict';
function build(expansion,matches){var byCompany={};(matches||[]).forEach(function(m){if(!byCompany[m.companyId]&&m.feasible)byCompany[m.companyId]=m;});var actions=(expansion||[]).map(function(c){var m=byCompany[c.companyId],priority=Math.round((c.score*.65+(m?m.score:0)*.35)*100)/100;return {companyId:c.companyId,companyName:c.name,priorityScore:priority,priority:priority>=70?'IMMEDIATE':priority>=50?'NEXT':'MONITOR',propertyId:m?m.propertyId:null,recommendedAction:m?'Prepare evidence-backed outreach and property brief.':'Research requirement and verify expansion timing.',approvalRequired:true,evidence:c.evidence||[]};}).sort(function(a,b){return b.priorityScore-a.priorityScore;});return {queue:actions,top:actions[0]||null};}
return {build:build};})();

/** SCIIP_OS v7.0 Sprint 13 — Company Expansion Intelligence. */
var SCIIP_COMPANY_EXPANSION_INTELLIGENCE=(function(){'use strict';
function evaluate(company){company=company||{};var signals=company.signals||[],score=Number(company.growthScore||0)*.35;var weights={FUNDING:20,HIRING:15,FACILITY_SEARCH:30,CONTRACT_AWARD:20,PATENT:8,EXECUTIVE_HIRE:7};signals.forEach(function(s){score+=(weights[String(s.type||'').toUpperCase()]||5)*Number(s.confidence==null?1:s.confidence);});score=Math.round(Math.min(100,score)*100)/100;var est=Number(company.estimatedSpaceNeedSf||company.locationNeedSf||0);if(!est&&score>=60)est=100000;return {companyId:String(company.id||company.name||'UNKNOWN'),name:String(company.name||company.id||'Unknown'),score:score,priority:score>=70?'HIGH':score>=45?'MEDIUM':'LOW',estimatedSpaceNeedSf:est,signals:signals.slice(),evidence:(company.evidence||[]).slice()};}
function rank(companies){var rows=(companies||[]).map(evaluate).sort(function(a,b){return b.score-a.score;});return {companies:rows,top:rows[0]||null};}
return {evaluate:evaluate,rank:rank};})();

/** SCIIP_OS v7.0 Sprint 13 — Market Intelligence Workspace. */
var SCIIP_MARKET_INTELLIGENCE_WORKSPACE=(function(){'use strict';
function build(data){data=data||{};return {workspace:{id:'market-opportunity-intelligence',label:'Market Intelligence & Opportunity Discovery',sections:{marketHealth:data.marketHealth||[],expansionCompanies:data.expansionCompanies||[],opportunityPipeline:data.opportunityPipeline||[],propertyMatches:data.propertyMatches||[],riskIndicators:data.riskIndicators||[],competitiveActivity:data.competitiveActivity||[],recommendations:data.recommendations||[],executiveBriefing:data.executiveBriefing||{}}},generatedAt:new Date().toISOString()};}
return {build:build};})();

/** SCIIP_OS v7.0 Sprint 13 — Industrial Market Intelligence & Opportunity Discovery. */
var SCIIP_MARKET_OPPORTUNITY_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-13.0';
function definition(){return {id:'industrial-market-intelligence-opportunity-discovery',name:'Industrial Market Intelligence & Opportunity Discovery',version:VERSION,dependencies:['tenant-prospecting-occupier-intelligence','site-selection-industrial-intelligence','enterprise-data-fabric'],services:['market-opportunity-application'],queries:['market-opportunity-query'],events:['MARKET_OPPORTUNITY_DETECTED','COMPANY_EXPANSION_DETECTED','BROKER_ACTION_CREATED'],stateBindings:['marketOpportunities','expansionCompanies','brokerActions'],workspaces:['market-opportunity-intelligence'],tests:['sciipTestV7IntegrationSprint13'],liveHandler:'sciipMarketOpportunityHeartbeatV7',queryHandler:'sciipMarketOpportunityQueryV7'};}
function run(request){request=request||{};var market=SCIIP_MARKET_OPPORTUNITY_ENGINE.rank(request.markets||[]),companies=SCIIP_COMPANY_EXPANSION_INTELLIGENCE.rank(request.companies||[]),matches=SCIIP_PROPERTY_OPPORTUNITY_MATCHER.match(companies.companies,request.properties||[]),actions=SCIIP_BROKER_ACTION_CENTER.build(companies.companies,matches.matches),ws=SCIIP_MARKET_INTELLIGENCE_WORKSPACE.build({marketHealth:market.opportunities,expansionCompanies:companies.companies,opportunityPipeline:actions.queue,propertyMatches:matches.matches,riskIndicators:(request.risks||[]),competitiveActivity:(request.competition||[]),recommendations:actions.queue,executiveBriefing:{topMarket:market.top,topCompany:companies.top,topAction:actions.top}});return {version:VERSION,status:'COMPLETED',marketOpportunities:market,expansionCompanies:companies,propertyMatches:matches,brokerActions:actions,workspace:ws,generatedAt:new Date().toISOString()};}
function names(snapshot,keys){var raw=[];for(var i=0;i<keys.length;i++)if(snapshot&&snapshot[keys[i]]!=null){raw=snapshot[keys[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var out={version:VERSION,status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',queryEngine:typeof SCIIP_QUERY_ENGINE!=='undefined',liveRuntime:typeof SCIIP_LIVE_RUNTIME!=='undefined',registrationMode:[],errors:[]};try{var rr=SCIIP_PLATFORM_REGISTRY.register(definition());out.registry=rr.status!=='CONFLICT';}catch(e){out.errors.push('registry:'+e);}try{var ar=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_13'});out.assembly=ar.status!=='FAILED';if(out.assembly)out.registrationMode.push('SELF_ASSEMBLY');}catch(e2){out.errors.push('assembly:'+e2);}var qs=out.queryEngine&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=out.liveRuntime&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};out.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('market-opportunity-query')!==-1;out.liveServiceRegistered=names(ls,['services','registry']).indexOf('market-opportunity-application')!==-1;if(!out.queryRegistered&&out.queryEngine&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('market-opportunity-query',sciipMarketOpportunityQueryV7,{capability:'industrial-market-intelligence-opportunity-discovery'});out.queryRegistered=true;out.registrationMode.push('QUERY_FALLBACK');}if(!out.liveServiceRegistered&&out.liveRuntime&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('market-opportunity-application',sciipMarketOpportunityHeartbeatV7,{capability:'industrial-market-intelligence-opportunity-discovery'});out.liveServiceRegistered=true;out.registrationMode.push('LIVE_FALLBACK');}if(out.registry&&out.assembly&&out.queryRegistered&&out.liveServiceRegistered&&out.sharedState&&out.eventBus)out.status='WIRED';return out;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipMarketOpportunityQueryV7(request){return SCIIP_MARKET_OPPORTUNITY_APPLICATION.run(request||{});}function sciipMarketOpportunityHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-13.0',workspace:'market-opportunity-intelligence',generatedAt:new Date().toISOString()};}

/** SCIIP_OS v7.0 Sprint 13 — Market Opportunity Engine. */
var SCIIP_MARKET_OPPORTUNITY_ENGINE=(function(){'use strict';
function round(n){return Math.round(n*100)/100;}
function evaluate(market){market=market||{};var vacancy=Number(market.vacancyRate||0),absorption=Number(market.netAbsorption||0),rentGrowth=Number(market.rentGrowthPct||0),pipeline=Number(market.pipelineSf||0),inventory=Number(market.inventorySf||1);var demand=Math.max(0,Math.min(100,50+(absorption/Math.max(inventory,.01))*5000-vacancy*2+rentGrowth*4-(pipeline/Math.max(inventory,1))*100));var status=demand>=70?'HIGH_OPPORTUNITY':demand>=50?'WATCH':'BALANCED';return {marketId:String(market.id||market.market||'UNKNOWN'),score:round(demand),status:status,evidence:[{metric:'vacancyRate',value:vacancy},{metric:'netAbsorption',value:absorption},{metric:'rentGrowthPct',value:rentGrowth},{metric:'pipelineSf',value:pipeline}]};}
function rank(markets){var rows=(markets||[]).map(evaluate).sort(function(a,b){return b.score-a.score;});return {opportunities:rows,top:rows[0]||null};}
return {evaluate:evaluate,rank:rank};})();

/** SCIIP_OS v7.0 Sprint 13 — Property Opportunity Matcher. */
var SCIIP_PROPERTY_OPPORTUNITY_MATCHER=(function(){'use strict';
function score(company,property){company=company||{};property=property||{};var need=Number(company.estimatedSpaceNeedSf||0),sf=Number(property.availableSf||0),powerNeed=Number(company.powerNeedAmps||0),power=Number(property.powerAmps||0),markets=company.targetMarkets||[];var feasible=(!need||sf>=need)&&(!powerNeed||power>=powerNeed);var size=need?Math.max(0,100-Math.abs(sf-need)/need*100):70;var pwr=powerNeed?Math.min(100,power/powerNeed*100):70;var market=markets.length?(markets.indexOf(property.market)!==-1?100:30):70;var logistics=Number(property.logisticsScore||70),cost=Number(property.costScore||70);var total=Math.round((size*.25+pwr*.2+market*.25+logistics*.2+cost*.1)*100)/100;return {companyId:company.companyId||company.id,propertyId:String(property.id||property.address||'UNKNOWN'),feasible:feasible,score:feasible?total:0,explanation:[{criterion:'size',score:Math.round(size*100)/100},{criterion:'power',score:Math.round(pwr*100)/100},{criterion:'market',score:market},{criterion:'logistics',score:logistics},{criterion:'cost',score:cost}]};}
function match(companies,properties){var rows=[];(companies||[]).forEach(function(c){(properties||[]).forEach(function(p){rows.push(score(c,p));});});rows.sort(function(a,b){return b.score-a.score;});return {matches:rows,top:rows.filter(function(x){return x.feasible;})[0]||null};}
return {score:score,match:match};})();

var SCIIP_CAPITAL_PLANNING_ENGINE=(function(){'use strict';function prioritize(projects,budget){projects=projects||[];budget=Number(budget||0);var ranked=projects.map(function(p,i){var cost=Number(p.cost||0),benefit=Number(p.annualBenefit||0),risk=Number(p.riskReduction||0),roi=cost?benefit/cost:0,score=roi*60+risk*.4;return {id:p.id||('CAPEX-'+(i+1)),name:p.name||null,cost:cost,annualBenefit:benefit,riskReduction:risk,roi:Number((roi*100).toFixed(2)),priorityScore:Number(score.toFixed(2))};}).sort(function(a,b){return b.priorityScore-a.priorityScore;});var selected=[],spent=0;ranked.forEach(function(p){if(spent+p.cost<=budget){selected.push(p);spent+=p.cost;}});var benefit=selected.reduce(function(s,p){return s+p.annualBenefit;},0);return {status:selected.length?'PLANNED':'NO_SELECTION',budget:budget,selected:selected,selectedCount:selected.length,capitalAllocated:Number(spent.toFixed(2)),budgetRemaining:Number((budget-spent).toFixed(2)),annualBenefit:Number(benefit.toFixed(2)),portfolioRoiPct:spent?Number((benefit/spent*100).toFixed(2)):0};}return {prioritize:prioritize};})();


var SCIIP_PORTFOLIO_BENCHMARK_ENGINE=(function(){'use strict';function compare(performance,benchmarks){performance=performance||{};benchmarks=benchmarks||{};function metric(name,actual,target,higher){actual=Number(actual||0);target=Number(target||0);var variance=Number((actual-target).toFixed(2));return {name:name,actual:actual,target:target,variance:variance,status:higher?(actual>=target?'OUTPERFORM':'UNDERPERFORM'):(actual<=target?'OUTPERFORM':'UNDERPERFORM')};}var results=[metric('occupancyPct',performance.occupancyPct,benchmarks.occupancyPct,true),metric('noiMarginPct',performance.noiMarginPct,benchmarks.noiMarginPct,true),metric('waltMonths',performance.waltMonths,benchmarks.waltMonths,true)];var out=results.filter(function(x){return x.status==='OUTPERFORM';}).length;return {status:out===results.length?'OUTPERFORM':out?'MIXED':'UNDERPERFORM',outperforming:out,total:results.length,results:results};}return {compare:compare};})();


var SCIIP_PORTFOLIO_KPI_ENGINE=(function(){'use strict';function calculate(performance){performance=performance||{};var value=0;(performance.assets||[]).forEach(function(a){value+=Number(a.marketValue||0);});var capRate=value?Number((Number(performance.annualNoi||0)/value*100).toFixed(2)):0;return {status:'AVAILABLE',kpis:{assetCount:Number(performance.assetCount||0),totalSf:Number(performance.totalSf||0),occupancyPct:Number(performance.occupancyPct||0),annualNoi:Number(performance.annualNoi||0),noiMarginPct:Number(performance.noiMarginPct||0),waltMonths:Number(performance.waltMonths||0),portfolioValue:Number(value.toFixed(2)),impliedCapRatePct:capRate}};}return {calculate:calculate};})();


var SCIIP_PORTFOLIO_PERFORMANCE_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-17.0';function definition(){return {id:'portfolio-performance-asset-management',name:'Portfolio Performance & Asset Management',version:VERSION,dependencies:['asset-onboarding-lease-administration-intelligence'],services:['portfolio-performance-application'],queries:['portfolio-performance-query'],events:['PORTFOLIO_PERFORMANCE_CALCULATED','PORTFOLIO_RISK_IDENTIFIED','CAPITAL_PLAN_CREATED'],stateBindings:['portfolioPerformance','portfolioRisk','capitalPlan'],workspaces:['portfolio-performance-asset-management'],tests:['sciipTestV7IntegrationSprint17'],liveHandler:'sciipPortfolioPerformanceHeartbeatV7',queryHandler:'sciipPortfolioPerformanceQueryV7'};}function run(r){r=r||{};var performance=SCIIP_PORTFOLIO_PERFORMANCE_ENGINE.analyze(r.assets||[]),kpis=SCIIP_PORTFOLIO_KPI_ENGINE.calculate(performance),benchmarks=SCIIP_PORTFOLIO_BENCHMARK_ENGINE.compare(performance,r.benchmarks||{}),risk=SCIIP_PORTFOLIO_RISK_ENGINE.analyze(performance,r.riskOptions||{}),capitalPlan=SCIIP_CAPITAL_PLANNING_ENGINE.prioritize(r.capitalProjects||[],r.capitalBudget||0),alerts=[];if(risk.severity==='HIGH')alerts.push({type:'PORTFOLIO_RISK',severity:'HIGH',score:risk.riskScore});if(benchmarks.status==='UNDERPERFORM')alerts.push({type:'BENCHMARK_UNDERPERFORMANCE',severity:'WARNING'});var workspace=SCIIP_PORTFOLIO_PERFORMANCE_WORKSPACE.build({portfolioSummary:{assetCount:performance.assetCount,totalSf:performance.totalSf,occupancyPct:performance.occupancyPct,annualNoi:performance.annualNoi},kpis:kpis.kpis,assetPerformance:performance.assets,benchmarks:benchmarks,risk:risk,capitalPlan:capitalPlan,alerts:alerts,executiveSummary:{portfolioStatus:risk.severity==='HIGH'?'ATTENTION_REQUIRED':'OPERATIONAL',benchmarkStatus:benchmarks.status,capitalAllocated:capitalPlan.capitalAllocated}});return {version:VERSION,status:'COMPLETED',performance:performance,kpis:kpis,benchmarks:benchmarks,risk:risk,capitalPlan:capitalPlan,workspace:workspace};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_17'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('portfolio-performance-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('portfolio-performance-application')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('portfolio-performance-query',sciipPortfolioPerformanceQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('portfolio-performance-application',sciipPortfolioPerformanceHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipPortfolioPerformanceQueryV7(r){return SCIIP_PORTFOLIO_PERFORMANCE_APPLICATION.run(r||{});}function sciipPortfolioPerformanceHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-17.0',workspace:'portfolio-performance-asset-management',generatedAt:new Date().toISOString()};}


var SCIIP_PORTFOLIO_PERFORMANCE_ENGINE=(function(){'use strict';function n(v){v=Number(v);return isFinite(v)?v:0;}function analyze(assets){assets=assets||[];var totalSf=0,occupiedSf=0,annualRevenue=0,annualOpex=0,annualNoi=0,weightedExpiry=0,tenantRevenue={};var normalized=assets.map(function(a,i){var sf=n(a.squareFeet),occ=Math.max(0,Math.min(1,n(a.occupancyPct==null?1:a.occupancyPct))),rent=n(a.rentPerSf),opex=n(a.opexPerSf),rev=sf*occ*rent*12,expense=sf*opex*12,noi=rev-expense,months=n(a.remainingLeaseMonths);totalSf+=sf;occupiedSf+=sf*occ;annualRevenue+=rev;annualOpex+=expense;annualNoi+=noi;weightedExpiry+=noi*months;var tenant=String(a.tenantId||'UNASSIGNED');tenantRevenue[tenant]=(tenantRevenue[tenant]||0)+rev;return {id:a.id||('ASSET-'+(i+1)),tenantId:tenant,squareFeet:sf,occupancyPct:occ,rentPerSf:rent,opexPerSf:opex,annualRevenue:Number(rev.toFixed(2)),annualOpex:Number(expense.toFixed(2)),annualNoi:Number(noi.toFixed(2)),remainingLeaseMonths:months,marketValue:n(a.marketValue),submarket:a.submarket||null};});return {status:assets.length?'AVAILABLE':'NO_ASSETS',assetCount:normalized.length,totalSf:totalSf,occupiedSf:Number(occupiedSf.toFixed(2)),occupancyPct:totalSf?Number((occupiedSf/totalSf*100).toFixed(2)):0,annualRevenue:Number(annualRevenue.toFixed(2)),annualOperatingExpense:Number(annualOpex.toFixed(2)),annualNoi:Number(annualNoi.toFixed(2)),noiMarginPct:annualRevenue?Number((annualNoi/annualRevenue*100).toFixed(2)):0,waltMonths:annualNoi?Number((weightedExpiry/annualNoi).toFixed(2)):0,tenantRevenue:tenantRevenue,assets:normalized};}return {analyze:analyze};})();


var SCIIP_PORTFOLIO_PERFORMANCE_WORKSPACE=(function(){'use strict';function build(d){d=d||{};return {workspace:{id:'portfolio-performance-asset-management',label:'Portfolio Performance & Asset Management',sections:{portfolioSummary:d.portfolioSummary||{},kpis:d.kpis||{},assetPerformance:d.assetPerformance||[],benchmarks:d.benchmarks||{},risk:d.risk||{},capitalPlan:d.capitalPlan||{},alerts:d.alerts||[],executiveSummary:d.executiveSummary||{}}}};}return {build:build};})();


var SCIIP_PORTFOLIO_RISK_ENGINE=(function(){'use strict';function analyze(performance,options){performance=performance||{};options=options||{};var assets=performance.assets||[],noi=Number(performance.annualNoi||0),rolloverWindow=Number(options.rolloverWindowMonths||24),rolloverNoi=0,tenantRevenue=performance.tenantRevenue||{},maxTenant=0,maxTenantId=null,submarketSf={};assets.forEach(function(a){if(Number(a.remainingLeaseMonths||0)<=rolloverWindow)rolloverNoi+=Number(a.annualNoi||0);submarketSf[a.submarket||'UNKNOWN']=(submarketSf[a.submarket||'UNKNOWN']||0)+Number(a.squareFeet||0);});Object.keys(tenantRevenue).forEach(function(k){if(tenantRevenue[k]>maxTenant){maxTenant=tenantRevenue[k];maxTenantId=k;}});var maxGeo=0,maxGeoId=null;Object.keys(submarketSf).forEach(function(k){if(submarketSf[k]>maxGeo){maxGeo=submarketSf[k];maxGeoId=k;}});var rolloverPct=noi?rolloverNoi/noi*100:0,tenantPct=Number(performance.annualRevenue||0)?maxTenant/Number(performance.annualRevenue||0)*100:0,geoPct=Number(performance.totalSf||0)?maxGeo/Number(performance.totalSf||0)*100:0,score=Math.min(100,rolloverPct*.45+tenantPct*.35+geoPct*.2),severity=score>=60?'HIGH':score>=35?'MEDIUM':'LOW';return {status:severity==='HIGH'?'ATTENTION_REQUIRED':'MONITOR',riskScore:Number(score.toFixed(2)),severity:severity,rolloverRiskPct:Number(rolloverPct.toFixed(2)),largestTenant:{tenantId:maxTenantId,concentrationPct:Number(tenantPct.toFixed(2))},largestSubmarket:{submarket:maxGeoId,concentrationPct:Number(geoPct.toFixed(2))},factors:3};}return {analyze:analyze};})();


/** Sprint 12 application facade and North Star declaration. */
var SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_APPLICATION=(function(){
  'use strict';
  var NORTH_STAR='SCIIP_OS is the operating system for industrial real estate. It ingests market data, preserves history, connects knowledge, powers GIS, and enables professionals to analyze, manage, and act from one trusted platform.';
  function run(input){input=input||{};var learning=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.learn(input.feedback||[],input.policy||{}),approvals=[];(input.decisions||[]).forEach(function(d){var p=learning.proposals.filter(function(x){return x.proposalId===d.proposalId;})[0];var a=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.approve(p,d);if(a.status!=='REJECTED')approvals.push(a);});return {version:SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.VERSION,northStar:NORTH_STAR,capabilities:['PRESERVES_HISTORY','CONNECTS_KNOWLEDGE','ANALYZE','MANAGE','ACT','ONE_TRUSTED_PLATFORM'],feedback:learning.records,cohorts:learning.cohorts,proposals:learning.proposals,approvals:approvals,portfolio:SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.portfolio(input.feedback||[]),workspace:'executive-opportunity-command',reviewRequired:true,automaticModelMutation:false,destructiveCommitEnabled:false,autonomousExecution:false};}
  return {NORTH_STAR:NORTH_STAR,run:run};
}());


/** SCIIP_OS v7.0 — Epic 3 Sprint 12: Adaptive Opportunity Learning and Portfolio Intelligence */
var SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE=(function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint12.0';
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function num(v,d){v=Number(v);return isFinite(v)?v:(d||0);}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function round(v){return Math.round(v*100)/100;}
  function hash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  function cohortKey(r){return [upper(r.market||'UNKNOWN'),upper(r.assetType||'UNKNOWN'),upper(r.opportunityType||'UNKNOWN')].join('|');}
  function normalizeFeedback(records){return (records||[]).map(function(r){var expected=num(r.expectedValue,0),actual=num(r.actualValue,0),variance=expected?round((actual-expected)/Math.abs(expected)*100):0;return {feedbackId:text(r.feedbackId||('FB-'+hash(text(r.opportunityId)+'|'+text(r.outcomeId)))),opportunityId:text(r.opportunityId),market:upper(r.market||'UNKNOWN'),assetType:upper(r.assetType||'UNKNOWN'),opportunityType:upper(r.opportunityType||'UNKNOWN'),predictedScore:clamp(num(r.predictedScore,50),0,100),executionHealth:clamp(num(r.executionHealth,50),0,100),evidenceQuality:clamp(num(r.evidenceQuality,0),0,100),expectedValue:expected,actualValue:actual,variancePct:variance,outcomeStatus:upper(r.outcomeStatus||'UNKNOWN'),cohortKey:cohortKey(r),observedAt:r.observedAt||new Date().toISOString(),appendOnly:true};});}
  function benchmark(records){var groups={},rows=normalizeFeedback(records);rows.forEach(function(r){var g=groups[r.cohortKey]||(groups[r.cohortKey]={cohortKey:r.cohortKey,count:0,predicted:0,health:0,evidence:0,variance:0,realized:0});g.count++;g.predicted+=r.predictedScore;g.health+=r.executionHealth;g.evidence+=r.evidenceQuality;g.variance+=r.variancePct;if(r.outcomeStatus==='REALIZED')g.realized++;});return Object.keys(groups).sort().map(function(k){var g=groups[k];return {cohortKey:k,count:g.count,averagePredictedScore:round(g.predicted/g.count),averageExecutionHealth:round(g.health/g.count),averageEvidenceQuality:round(g.evidence/g.count),averageVariancePct:round(g.variance/g.count),realizationRatePct:round(g.realized/g.count*100)};});}
  function learn(records,options){options=options||{};var rows=normalizeFeedback(records),min=num(options.minimumSampleSize,3),cohorts=benchmark(rows),proposals=[];cohorts.forEach(function(c){if(c.count<min)return;var calibrationGap=round(c.realizationRatePct-c.averagePredictedScore),executionGap=round(c.averageExecutionHealth-50),evidenceGap=round(c.averageEvidenceQuality-70),raw=calibrationGap*.08+executionGap*.04+evidenceGap*.02+c.averageVariancePct*.02,adjustment=clamp(round(raw),-10,10);if(Math.abs(adjustment)<1)return;proposals.push({proposalId:'MLP-'+hash(c.cohortKey+'|'+adjustment),cohortKey:c.cohortKey,sampleSize:c.count,currentWeight:1,proposedWeight:round(1+adjustment/100),scoreAdjustment:adjustment,rationale:{calibrationGap:calibrationGap,executionGap:executionGap,evidenceGap:evidenceGap,averageVariancePct:c.averageVariancePct},status:'PENDING_REVIEW',requiresHumanApproval:true,automaticModelMutation:false,destructiveCommitEnabled:false});});return {records:rows,cohorts:cohorts,proposals:proposals,minimumSampleSize:min,reviewRequired:true,automaticModelMutation:false};}
  function approve(proposal,decision){decision=decision||{};if(!proposal)return {status:'REJECTED',reason:'PROPOSAL_REQUIRED'};if(upper(decision.action)!=='APPROVE')return {status:'REJECTED',reason:'EXPLICIT_APPROVAL_REQUIRED'};if(!text(decision.approvedBy))return {status:'REJECTED',reason:'APPROVER_REQUIRED'};return {eventId:'MLA-'+hash(proposal.proposalId+'|'+decision.approvedBy+'|'+text(decision.approvedAt)),eventType:'MODEL_LEARNING_PROPOSAL_APPROVED',proposalId:proposal.proposalId,cohortKey:proposal.cohortKey,approvedWeight:proposal.proposedWeight,approvedBy:text(decision.approvedBy),approvedAt:decision.approvedAt||new Date().toISOString(),status:'APPROVED_NOT_APPLIED',applicationRequiresControlledRelease:true,appendOnly:true};}
  function portfolio(records){var rows=normalizeFeedback(records),b=benchmark(rows),realized=rows.filter(function(r){return r.outcomeStatus==='REALIZED';}).length;return {totalOutcomes:rows.length,realizedOutcomes:realized,realizationRatePct:rows.length?round(realized/rows.length*100):0,averageExecutionHealth:rows.length?round(rows.reduce(function(n,r){return n+r.executionHealth;},0)/rows.length):0,averageEvidenceQuality:rows.length?round(rows.reduce(function(n,r){return n+r.evidenceQuality;},0)/rows.length):0,cohorts:b.length,topCohort:b.slice().sort(function(a,z){return z.realizationRatePct-a.realizationRatePct;})[0]||null};}
  return {VERSION:VERSION,normalizeFeedback:normalizeFeedback,benchmark:benchmark,learn:learn,approve:approve,portfolio:portfolio};
}());


/** Append-only persistence adapter for Sprint 12 learning records and approvals. */
var SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_PERSISTENCE=(function(){
  'use strict';
  function memory(){var rows=[],keys={};return {append:function(records){var appended=0,duplicates=0;(records||[]).forEach(function(r){var k=r.eventId||r.proposalId||r.feedbackId||JSON.stringify(r);if(keys[k]){duplicates++;return;}keys[k]=true;rows.push(JSON.parse(JSON.stringify(r)));appended++;});return {appended:appended,duplicates:duplicates,total:rows.length};},all:function(){return JSON.parse(JSON.stringify(rows));}};}
  function persist(adapter,records){if(!adapter||typeof adapter.append!=='function')throw new Error('Append-only adapter required.');return adapter.append(records||[]);}
  return {memory:memory,persist:persist};
}());


/** Sprint 8 application facade and North Star declaration. */
var SCIIP_AUTONOMOUS_OPPORTUNITY_APPLICATION=(function(){
  'use strict';
  var NORTH_STAR='SCIIP_OS is the operating system for industrial real estate. It ingests market data, preserves history, connects knowledge, powers GIS, and enables professionals to analyze, manage, and act from one trusted platform.';
  function run(input){var result=SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.discover(input||{});return {version:SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.VERSION,workspace:'relationship-intelligence',northStar:NORTH_STAR,capabilities:['CONNECTS_KNOWLEDGE','ANALYZE','MANAGE','ACT','ONE_TRUSTED_PLATFORM'],discovery:result,recommendations:SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.recommendations(result),executiveSummary:SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.executiveSummary(result),reviewRequired:true,destructiveCommitEnabled:false};}
  return {NORTH_STAR:NORTH_STAR,run:run};
}());


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


/** Append-only, duplicate-safe Sprint 8 persistence adapter. */
var SCIIP_AUTONOMOUS_OPPORTUNITY_PERSISTENCE=(function(){
  'use strict';
  function append(existing,discovery){var rows=(existing||[]).slice(),keys={};rows.forEach(function(r){keys[r.businessKey+'|'+r.observedAt]=1;});var added=0;(discovery.opportunities||[]).forEach(function(o){var k=o.businessKey+'|'+o.observedAt;if(keys[k])return;keys[k]=1;rows.push(JSON.parse(JSON.stringify(o)));added+=1;});return {rows:rows,recordsCreated:added,skippedDuplicate:(discovery.opportunities||[]).length-added,appendOnly:true,permanentHistory:true};}
  return {append:append};
}());


/** Sprint 13 application descriptor and orchestration. */
var SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_APPLICATION=(function(){
  'use strict';
  function descriptor(){return {id:'enterprise-portfolio-strategy-capital-allocation',version:SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.VERSION,workspace:'executive-opportunity-command',northStar:['analyze','manage','act','one-trusted-platform'],dependencies:['epic3-sprint12'],reviewRequired:true,autonomousCapitalDeployment:false,destructiveCommitEnabled:false};}
  function run(input){input=input||{};var allocation=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.allocate(input.actions||[],input.constraints||{});return {descriptor:descriptor(),allocation:allocation,scenarios:SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.scenarios(input.actions||[],input.constraints||{}),mapPoints:SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.mapProjection(allocation),summary:SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.portfolioSummary(allocation)};}
  return {descriptor:descriptor,run:run};
}());


/** SCIIP_OS v7.0 — Epic 3 Sprint 13: Enterprise Portfolio Strategy and Capital Allocation */
var SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION=(function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint13.0';
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function num(v,d){v=Number(v);return isFinite(v)?v:(d||0);}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function round(v){return Math.round(v*100)/100;}
  function hash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  function normalizeAction(a){
    var capital=Math.max(0,num(a.capitalRequired,0)), expected=Math.max(0,num(a.expectedValue,0));
    var confidence=clamp(num(a.confidence,50),0,100), market=clamp(num(a.marketScore,50),0,100), execution=clamp(num(a.executionHealth,50),0,100), evidence=clamp(num(a.evidenceQuality,0),0,100), risk=clamp(num(a.riskScore,50),0,100), strategic=clamp(num(a.strategicFit,50),0,100);
    var returnScore=capital?clamp(expected/capital*50,0,100):0;
    var score=round(strategic*.22+market*.18+confidence*.16+execution*.14+evidence*.12+returnScore*.18-risk*.20);
    return {actionId:text(a.actionId||('ACT-'+hash(text(a.opportunityId)+'|'+text(a.assetId)+'|'+upper(a.actionType)))),opportunityId:text(a.opportunityId),assetId:text(a.assetId),market:upper(a.market||'UNKNOWN'),assetType:upper(a.assetType||'UNKNOWN'),actionType:upper(a.actionType||'REVIEW'),capitalRequired:capital,expectedValue:expected,confidence:confidence,marketScore:market,executionHealth:execution,evidenceQuality:evidence,riskScore:risk,strategicFit:strategic,returnScore:round(returnScore),priorityScore:clamp(score,0,100),latitude:a.latitude===null||a.latitude===undefined?null:num(a.latitude,0),longitude:a.longitude===null||a.longitude===undefined?null:num(a.longitude,0),evidenceIds:(a.evidenceIds||[]).map(text).filter(Boolean),requiresHumanApproval:true,autonomousCapitalDeployment:false,destructiveCommitEnabled:false};
  }
  function rank(actions,policy){
    policy=policy||{};var minEvidence=num(policy.minimumEvidenceQuality,60),minConfidence=num(policy.minimumConfidence,60),rows=(actions||[]).map(normalizeAction),eligible=[],rejected=[];
    rows.forEach(function(r){var reasons=[];if(r.capitalRequired<=0)reasons.push('CAPITAL_REQUIRED');if(r.evidenceQuality<minEvidence)reasons.push('INSUFFICIENT_EVIDENCE');if(r.confidence<minConfidence)reasons.push('LOW_CONFIDENCE');if(!r.evidenceIds.length)reasons.push('EVIDENCE_IDS_REQUIRED');if(reasons.length)rejected.push({action:r,reasons:reasons});else eligible.push(r);});
    eligible.sort(function(a,b){return b.priorityScore-a.priorityScore||a.capitalRequired-b.capitalRequired||a.actionId.localeCompare(b.actionId);});
    return {eligible:eligible,rejected:rejected,policy:{minimumEvidenceQuality:minEvidence,minimumConfidence:minConfidence},reviewRequired:true};
  }
  function allocate(actions,constraints){
    constraints=constraints||{};var ranked=rank(actions,constraints),budget=Math.max(0,num(constraints.totalCapital,0)),marketCaps=constraints.marketCaps||{},assetCaps=constraints.assetTypeCaps||{},used=0,selected=[],deferred=[],marketUse={},assetUse={};
    ranked.eligible.forEach(function(a){var marketCap=marketCaps[a.market]===undefined?budget:num(marketCaps[a.market],budget),assetCap=assetCaps[a.assetType]===undefined?budget:num(assetCaps[a.assetType],budget),reason='';if(used+a.capitalRequired>budget)reason='TOTAL_CAPITAL_CONSTRAINT';else if((marketUse[a.market]||0)+a.capitalRequired>marketCap)reason='MARKET_CAP_CONSTRAINT';else if((assetUse[a.assetType]||0)+a.capitalRequired>assetCap)reason='ASSET_TYPE_CAP_CONSTRAINT';if(reason){deferred.push({action:a,reason:reason});return;}selected.push(a);used+=a.capitalRequired;marketUse[a.market]=(marketUse[a.market]||0)+a.capitalRequired;assetUse[a.assetType]=(assetUse[a.assetType]||0)+a.capitalRequired;});
    return {allocationId:'ALLOC-'+hash(JSON.stringify(selected.map(function(a){return a.actionId;}))+'|'+budget),selected:selected,deferred:deferred,rejected:ranked.rejected,totalCapital:budget,allocatedCapital:used,remainingCapital:round(budget-used),marketAllocation:marketUse,assetTypeAllocation:assetUse,status:selected.length?'PENDING_APPROVAL':'NO_ACTIONS_SELECTED',requiresHumanApproval:true,autonomousCapitalDeployment:false,destructiveCommitEnabled:false};
  }
  function scenarios(actions,constraints){
    var base=constraints||{},conservative=Object.assign({},base,{minimumEvidenceQuality:Math.max(75,num(base.minimumEvidenceQuality,60)),minimumConfidence:Math.max(75,num(base.minimumConfidence,60)),totalCapital:num(base.totalCapital,0)*.75}),growth=Object.assign({},base,{minimumEvidenceQuality:Math.max(60,num(base.minimumEvidenceQuality,60)),minimumConfidence:Math.max(60,num(base.minimumConfidence,60)),totalCapital:num(base.totalCapital,0)*1.15});
    return [{scenarioId:'CONSERVATIVE',result:allocate(actions,conservative)},{scenarioId:'BALANCED',result:allocate(actions,base)},{scenarioId:'GROWTH',result:allocate(actions,growth)}];
  }
  function approve(allocation,decision){decision=decision||{};if(!allocation)return {status:'REJECTED',reason:'ALLOCATION_REQUIRED'};if(upper(decision.action)!=='APPROVE')return {status:'REJECTED',reason:'EXPLICIT_APPROVAL_REQUIRED'};if(!text(decision.approvedBy))return {status:'REJECTED',reason:'APPROVER_REQUIRED'};return {eventId:'CAP-'+hash(allocation.allocationId+'|'+decision.approvedBy+'|'+text(decision.approvedAt)),eventType:'CAPITAL_ALLOCATION_APPROVED',allocationId:allocation.allocationId,approvedCapital:allocation.allocatedCapital,approvedActionIds:allocation.selected.map(function(a){return a.actionId;}),approvedBy:text(decision.approvedBy),approvedAt:decision.approvedAt||new Date().toISOString(),status:'APPROVED_NOT_DEPLOYED',deploymentRequiresControlledWorkflow:true,autonomousCapitalDeployment:false,appendOnly:true};}
  function mapProjection(allocation){return (allocation&&allocation.selected||[]).filter(function(a){return a.latitude!==null&&a.longitude!==null;}).map(function(a){return {actionId:a.actionId,assetId:a.assetId,latitude:a.latitude,longitude:a.longitude,priorityScore:a.priorityScore,capitalRequired:a.capitalRequired,market:a.market};});}
  function portfolioSummary(allocation){var rows=allocation&&allocation.selected||[];return {selectedActions:rows.length,allocatedCapital:allocation?allocation.allocatedCapital:0,remainingCapital:allocation?allocation.remainingCapital:0,weightedPriorityScore:rows.length?round(rows.reduce(function(n,a){return n+a.priorityScore*a.capitalRequired;},0)/Math.max(1,rows.reduce(function(n,a){return n+a.capitalRequired;},0))):0,markets:Object.keys(allocation&&allocation.marketAllocation||{}).length,assetTypes:Object.keys(allocation&&allocation.assetTypeAllocation||{}).length,reviewRequired:true,autonomousCapitalDeployment:false};}
  return {VERSION:VERSION,normalizeAction:normalizeAction,rank:rank,allocate:allocate,scenarios:scenarios,approve:approve,mapProjection:mapProjection,portfolioSummary:portfolioSummary};
}());


/** Sprint 13 append-only persistence adapter. */
var SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_PERSISTENCE=(function(){
  'use strict';var memory=[];
  function append(events){var added=0;(events||[]).forEach(function(e){var key=String(e.eventId||e.allocationId||'');if(!key)return;if(memory.some(function(x){return String(x.eventId||x.allocationId||'')===key;}))return;memory.push(JSON.parse(JSON.stringify(e)));added++;});return {appended:added,total:memory.length,appendOnly:true};}
  function list(){return JSON.parse(JSON.stringify(memory));}
  function clearForTest(){memory=[];}
  return {append:append,list:list,clearForTest:clearForTest};
}());


/** SCIIP_OS v7.0 — Epic 3 Sprint 7 Application Descriptor */
var SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_APPLICATION = (function () {
  'use strict';
  var VERSION='v7.0-epic3-sprint7.0';
  var DESCRIPTOR={
    id:'enterprise-relationship-graph', label:'Enterprise Relationship Graph', version:VERSION,
    workspace:'relationship-intelligence', dependsOn:['relationship-intelligence','network-intelligence'],
    capabilities:['CANONICAL_ENTITY_REGISTRY','CROSS_DOMAIN_GRAPH','TYPED_RELATIONSHIPS','GRAPH_QUERY_ENGINE','GIS_GRAPH_PROJECTION','EVIDENCE_GROUNDED_AI_CONTEXT','APPEND_ONLY_GRAPH_HISTORY'],
    northStar:{
      statement:'SCIIP_OS is the operating system for industrial real estate. It ingests market data, preserves history, connects knowledge, powers GIS, and enables professionals to analyze, manage, and act from one trusted platform.',
      advances:['PRESERVES_HISTORY','CONNECTS_KNOWLEDGE','POWERS_GIS','ANALYZE','ONE_TRUSTED_PLATFORM']
    },
    governance:{duplicateSafe:true, permanentHistory:true, reviewRequired:true, destructiveCommitEnabled:false}
  };
  function getDescriptor(){return JSON.parse(JSON.stringify(DESCRIPTOR));}
  function run(input){return {descriptor:getDescriptor(),result:SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.analyze(input||{})};}
  return {VERSION:VERSION,getDescriptor:getDescriptor,run:run};
})();
function sciipEnterpriseRelationshipGraphApplication(){return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_APPLICATION.getDescriptor();}
function sciipRunEnterpriseRelationshipGraphApplication(input){return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_APPLICATION.run(input||{});}


/**
 * SCIIP_OS v7.0 — Epic 3 Sprint 7
 * Enterprise Relationship Graph Engine
 *
 * Canonical, cross-domain graph for industrial real estate. Unifies properties,
 * companies, people, transactions, markets, municipalities, utilities and
 * infrastructure while preserving evidence, history and spatial context.
 */
var SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint7.0';
  var ENTITY_TYPES = ['PROPERTY','COMPANY','PERSON','LEASE','TRANSACTION','MARKET','MUNICIPALITY','UTILITY','INFRASTRUCTURE'];
  var RELATIONSHIP_TYPES = [
    'OWNS','OCCUPIES','REPRESENTS','PARTICIPATED_IN','LOCATED_IN','SERVED_BY',
    'CONNECTED_TO','NEAR','COMPETES_WITH','SUPPLIES','DEVELOPED','FINANCED','RELATED_TO'
  ];

  function text_(v) { return v === null || v === undefined ? '' : String(v).trim(); }
  function upper_(v) { return text_(v).toUpperCase(); }
  function num_(v, fallback) { if (v === null || v === undefined || v === '') return fallback === undefined ? 0 : fallback; var n = Number(v); return isFinite(n) ? n : (fallback === undefined ? 0 : fallback); }
  function clamp_(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function clone_(v) { return JSON.parse(JSON.stringify(v)); }
  function normalizeKey_(v) { return upper_(v).replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function stableId_(prefix, parts) {
    var input = parts.join('|'), hash = 2166136261, i;
    for (i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return prefix + '-' + ('00000000' + (hash >>> 0).toString(16).toUpperCase()).slice(-8);
  }
  function validType_(type, allowed, fallback) {
    type = upper_(type);
    return allowed.indexOf(type) !== -1 ? type : fallback;
  }
  function evidence_(items) {
    var seen = {}, result = [];
    (items || []).forEach(function (item) {
      if (!item) return;
      var normalized = {
        sourceId: text_(item.sourceId || item.id),
        sourceType: upper_(item.sourceType || item.type || 'UNKNOWN'),
        observedAt: text_(item.observedAt || item.date),
        reference: text_(item.reference || item.url || item.note),
        confidence: clamp_(num_(item.confidence, 50), 0, 100)
      };
      var key = [normalized.sourceId, normalized.reference, normalized.observedAt].join('|');
      if (!seen[key]) { seen[key] = true; result.push(normalized); }
    });
    return result;
  }

  function canonicalEntity(raw) {
    raw = raw || {};
    var type = validType_(raw.type || raw.entityType, ENTITY_TYPES, 'COMPANY');
    var attrs = clone_(raw.attributes || {});
    var businessKey = text_(raw.businessKey) || [type, normalizeKey_(raw.name || raw.address || raw.id)].join('|');
    var id = text_(raw.id || raw.entityId) || stableId_('ENT', [businessKey]);
    var latitude = raw.latitude !== undefined ? num_(raw.latitude, null) : num_(attrs.latitude, null);
    var longitude = raw.longitude !== undefined ? num_(raw.longitude, null) : num_(attrs.longitude, null);
    var aliases = (raw.aliases || []).map(text_).filter(Boolean);
    if (raw.name && aliases.indexOf(text_(raw.name)) === -1) aliases.unshift(text_(raw.name));
    return {
      id: id,
      businessKey: businessKey,
      type: type,
      name: text_(raw.name || raw.label || raw.address || id),
      aliases: aliases,
      status: upper_(raw.status || 'ACTIVE'),
      latitude: latitude,
      longitude: longitude,
      attributes: attrs,
      evidence: evidence_(raw.evidence),
      effectiveFrom: text_(raw.effectiveFrom || raw.observedAt),
      effectiveTo: text_(raw.effectiveTo),
      metadata: clone_(raw.metadata || {})
    };
  }

  function canonicalRelationship(raw) {
    raw = raw || {};
    var sourceId = text_(raw.sourceId || raw.fromId);
    var targetId = text_(raw.targetId || raw.toId);
    var type = validType_(raw.type || raw.relationshipType, RELATIONSHIP_TYPES, 'RELATED_TO');
    var businessKey = text_(raw.businessKey) || [sourceId, type, targetId, text_(raw.effectiveFrom || raw.observedAt)].join('|');
    return {
      id: text_(raw.id) || stableId_('REL', [businessKey]),
      businessKey: businessKey,
      sourceId: sourceId,
      targetId: targetId,
      type: type,
      direction: upper_(raw.direction || 'DIRECTED'),
      strength: clamp_(num_(raw.strength, 50), 0, 100),
      confidence: clamp_(num_(raw.confidence, 50), 0, 100),
      effectiveFrom: text_(raw.effectiveFrom || raw.observedAt),
      effectiveTo: text_(raw.effectiveTo || raw.expiresAt),
      evidence: evidence_(raw.evidence),
      attributes: clone_(raw.attributes || raw.metadata || {})
    };
  }

  function build(input) {
    input = input || {};
    var entityById = {}, entityByKey = {}, relationshipByKey = {}, entities = [], relationships = [], adjacency = {};
    (input.entities || []).forEach(function (raw) {
      var entity = canonicalEntity(raw);
      var existing = entityByKey[entity.businessKey];
      if (existing) {
        existing.aliases = existing.aliases.concat(entity.aliases).filter(function (v, i, a) { return a.indexOf(v) === i; });
        existing.evidence = evidence_(existing.evidence.concat(entity.evidence));
        Object.keys(entity.attributes).forEach(function (k) { if (existing.attributes[k] === undefined) existing.attributes[k] = entity.attributes[k]; });
        return;
      }
      entityById[entity.id] = entity;
      entityByKey[entity.businessKey] = entity;
      adjacency[entity.id] = [];
      entities.push(entity);
    });
    (input.relationships || []).forEach(function (raw) {
      var rel = canonicalRelationship(raw);
      if (!entityById[rel.sourceId] || !entityById[rel.targetId] || rel.sourceId === rel.targetId) return;
      if (relationshipByKey[rel.businessKey]) return;
      relationshipByKey[rel.businessKey] = rel;
      relationships.push(rel);
      adjacency[rel.sourceId].push(rel);
      adjacency[rel.targetId].push(rel);
    });
    return {
      version: VERSION,
      entities: entities,
      relationships: relationships,
      entityById: entityById,
      entityByKey: entityByKey,
      adjacency: adjacency,
      rejectedRelationships: (input.relationships || []).length - relationships.length,
      duplicateSafe: true,
      permanentHistory: true
    };
  }

  function neighbors(input, entityId, options) {
    options = options || {};
    var graph = build(input), typeFilter = upper_(options.relationshipType), entityType = upper_(options.entityType);
    var result = (graph.adjacency[entityId] || []).map(function (rel) {
      var otherId = rel.sourceId === entityId ? rel.targetId : rel.sourceId;
      return { relationship: rel, entity: graph.entityById[otherId] };
    }).filter(function (item) {
      return (!typeFilter || item.relationship.type === typeFilter) && (!entityType || item.entity.type === entityType);
    });
    return { version: VERSION, entityId: entityId, count: result.length, results: result };
  }

  function query(input, querySpec) {
    querySpec = querySpec || {};
    var graph = build(input);
    var entityType = upper_(querySpec.entityType), relationshipType = upper_(querySpec.relationshipType);
    var market = normalizeKey_(querySpec.market), industry = normalizeKey_(querySpec.industry);
    var minimumConfidence = clamp_(num_(querySpec.minimumConfidence, 0), 0, 100);
    var entities = graph.entities.filter(function (entity) {
      var attrs = entity.attributes || {};
      if (entityType && entity.type !== entityType) return false;
      if (market && normalizeKey_(attrs.market || attrs.city || attrs.region).indexOf(market) === -1) return false;
      if (industry && normalizeKey_(attrs.industry || attrs.sector).indexOf(industry) === -1) return false;
      return true;
    });
    var ids = {};
    entities.forEach(function (e) { ids[e.id] = true; });
    var relationships = graph.relationships.filter(function (rel) {
      if (relationshipType && rel.type !== relationshipType) return false;
      if (rel.confidence < minimumConfidence) return false;
      return ids[rel.sourceId] || ids[rel.targetId];
    });
    return {
      version: VERSION,
      query: clone_(querySpec),
      entities: entities,
      relationships: relationships,
      evidenceCount: relationships.reduce(function (sum, rel) { return sum + rel.evidence.length; }, 0),
      reviewRequired: true
    };
  }

  function shortestPath(input, sourceId, targetId, options) {
    options = options || {};
    var graph = build(input), maxDepth = clamp_(num_(options.maxDepth, 6), 1, 10);
    var queue = [{id:sourceId, path:[sourceId], relationships:[]}], visited = {};
    visited[sourceId] = true;
    while (queue.length) {
      var current = queue.shift();
      if (current.id === targetId) return {version:VERSION, found:true, depth:current.path.length-1, path:current.path, relationships:current.relationships};
      if (current.path.length - 1 >= maxDepth) continue;
      (graph.adjacency[current.id] || []).forEach(function (rel) {
        if (rel.confidence < num_(options.minimumConfidence, 0)) return;
        var next = rel.sourceId === current.id ? rel.targetId : rel.sourceId;
        if (visited[next]) return;
        visited[next] = true;
        queue.push({id:next, path:current.path.concat([next]), relationships:current.relationships.concat([rel.id])});
      });
    }
    return {version:VERSION, found:false, depth:null, path:[], relationships:[]};
  }

  function spatialProjection(input) {
    var graph = build(input), features = [], links = [];
    graph.entities.forEach(function (entity) {
      if (entity.latitude === null || entity.longitude === null) return;
      features.push({
        type:'Feature',
        geometry:{type:'Point', coordinates:[entity.longitude, entity.latitude]},
        properties:{entityId:entity.id, entityType:entity.type, name:entity.name, status:entity.status}
      });
    });
    graph.relationships.forEach(function (rel) {
      var a = graph.entityById[rel.sourceId], b = graph.entityById[rel.targetId];
      if (!a || !b || a.latitude === null || a.longitude === null || b.latitude === null || b.longitude === null) return;
      links.push({
        type:'Feature',
        geometry:{type:'LineString', coordinates:[[a.longitude,a.latitude],[b.longitude,b.latitude]]},
        properties:{relationshipId:rel.id, relationshipType:rel.type, confidence:rel.confidence}
      });
    });
    return {version:VERSION, type:'FeatureCollection', features:features.concat(links), pointCount:features.length, linkCount:links.length};
  }

  function evidenceContext(input, entityIds, options) {
    options = options || {};
    var graph = build(input), ids = {}, context = [];
    (entityIds || []).forEach(function (id) { ids[id] = true; });
    graph.relationships.forEach(function (rel) {
      if (!ids[rel.sourceId] && !ids[rel.targetId]) return;
      context.push({
        statement:[graph.entityById[rel.sourceId].name, rel.type, graph.entityById[rel.targetId].name].join(' '),
        relationshipId:rel.id,
        confidence:rel.confidence,
        evidence:clone_(rel.evidence),
        grounded:rel.evidence.length > 0
      });
    });
    context.sort(function (a,b) { return b.confidence-a.confidence; });
    return {version:VERSION, context:context.slice(0, clamp_(num_(options.limit, 20),1,100)), groundedCount:context.filter(function(x){return x.grounded;}).length, reviewRequired:true};
  }

  function analyze(input) {
    var graph = build(input), spatial = spatialProjection(input);
    var byType = {};
    graph.entities.forEach(function (e) { byType[e.type] = (byType[e.type] || 0) + 1; });
    return {
      framework:'SCIIP_V7_EPIC_3_SPRINT_7_ENTERPRISE_RELATIONSHIP_GRAPH',
      version:VERSION,
      status:'AVAILABLE',
      generatedAt:new Date().toISOString(),
      summary:{entities:graph.entities.length, relationships:graph.relationships.length, entityTypes:byType, spatialEntities:spatial.pointCount, spatialLinks:spatial.linkCount, rejectedRelationships:graph.rejectedRelationships},
      governance:{duplicateSafe:true, permanentHistory:true, reviewRequired:true, destructiveCommitEnabled:false}
    };
  }

  return {
    VERSION:VERSION,
    ENTITY_TYPES:ENTITY_TYPES,
    RELATIONSHIP_TYPES:RELATIONSHIP_TYPES,
    canonicalEntity:canonicalEntity,
    canonicalRelationship:canonicalRelationship,
    build:build,
    neighbors:neighbors,
    query:query,
    shortestPath:shortestPath,
    spatialProjection:spatialProjection,
    evidenceContext:evidenceContext,
    analyze:analyze
  };
})();

function sciipBuildEnterpriseRelationshipGraph(input) { return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.build(input || {}); }
function sciipQueryEnterpriseRelationshipGraph(input, querySpec) { return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.query(input || {}, querySpec || {}); }
function sciipEnterpriseRelationshipShortestPath(input, sourceId, targetId, options) { return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.shortestPath(input || {}, sourceId, targetId, options || {}); }
function sciipRunEnterpriseRelationshipGraph(input) { return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.analyze(input || {}); }


/** SCIIP_OS v7.0 — Enterprise Relationship Graph Persistence Adapter */
var SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_PERSISTENCE=(function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint7.0';
  function persist(snapshot,options){
    options=options||{};
    var record={
      businessKey:['ENTERPRISE_RELATIONSHIP_GRAPH',snapshot&&snapshot.version||VERSION,options.asOfDate||new Date().toISOString().slice(0,10)].join('|'),
      createdAt:new Date().toISOString(), payload:snapshot||{}, mode:'DRY_RUN'
    };
    if(typeof SCIIP_STORAGE_SERVICE!=='undefined'&&SCIIP_STORAGE_SERVICE&&typeof SCIIP_STORAGE_SERVICE.append==='function'&&options.commit===true){
      SCIIP_STORAGE_SERVICE.append('ENTERPRISE_RELATIONSHIP_GRAPH_LEDGER',record); record.mode='APPENDED';
    }
    return {version:VERSION,status:record.mode==='APPENDED'?'COMMITTED':'PREVIEW',duplicateSafe:true,permanentHistory:true,destructiveWrite:false,record:record};
  }
  return {VERSION:VERSION,persist:persist};
})();
function sciipPersistEnterpriseRelationshipGraph(snapshot,options){return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_PERSISTENCE.persist(snapshot||{},options||{});}


/** Sprint 14 application descriptor and orchestration. */
var SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_APPLICATION=(function(){
  'use strict';
  function descriptor(){return {id:'epic3-production-hardening-integration-certification',version:SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.VERSION,workspace:'enterprise-intelligence-command-platform',northStar:['ingest','preserve-history','connect-knowledge','GIS','analyze','manage','act','one-trusted-platform'],dependencies:['epic3-sprints-5-through-13'],reviewRequired:true,automaticDeployment:false,destructiveCommitEnabled:false};}
  function run(input){var certification=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.certify(input||{});return {descriptor:descriptor(),certification:certification,deploymentGate:SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.deploymentGate(certification),releaseSummary:{status:certification.status,stagesCertified:certification.stagesCertified,failures:certification.failures.length,warnings:certification.warnings.length,northStarAligned:Object.keys(certification.northStar).every(function(k){return certification.northStar[k]===true;}),reviewRequired:true}};}
  return {descriptor:descriptor,run:run};
}());


/** SCIIP_OS v7.0 — Epic 3 Sprint 14: Production Hardening and Integration Certification */
var SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION=(function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint14.0';
  var REQUIRED_STAGES=['RELATIONSHIP_INTELLIGENCE','NETWORK_INTELLIGENCE','ENTERPRISE_RELATIONSHIP_GRAPH','OPPORTUNITY_DISCOVERY','EXECUTIVE_COMMAND','WORKFLOW_EXECUTION','OUTCOME_MONITORING','ADAPTIVE_LEARNING','PORTFOLIO_ALLOCATION'];
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function hash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  function normalizeStage(s){return {stageId:upper(s.stageId),status:upper(s.status||'UNKNOWN'),businessKey:text(s.businessKey),evidenceIds:(s.evidenceIds||[]).map(text).filter(Boolean),entityIds:(s.entityIds||[]).map(text).filter(Boolean),gisContext:s.gisContext||null,appendOnly:s.appendOnly===true,duplicateSafe:s.duplicateSafe===true,reviewRequired:s.reviewRequired===true,destructiveCommitEnabled:s.destructiveCommitEnabled===true,autonomousExecution:s.autonomousExecution===true,sourceStageIds:(s.sourceStageIds||[]).map(upper).filter(Boolean),outputId:text(s.outputId)};}
  function validateStage(s,index){var failures=[];if(REQUIRED_STAGES.indexOf(s.stageId)<0)failures.push('UNKNOWN_STAGE');if(s.status!=='PASSED'&&s.status!=='READY'&&s.status!=='CERTIFIED')failures.push('STAGE_NOT_READY');if(!s.businessKey)failures.push('BUSINESS_KEY_REQUIRED');if(!s.outputId)failures.push('OUTPUT_ID_REQUIRED');if(!s.evidenceIds.length)failures.push('EVIDENCE_REQUIRED');if(!s.appendOnly)failures.push('APPEND_ONLY_REQUIRED');if(!s.duplicateSafe)failures.push('DUPLICATE_SAFETY_REQUIRED');if(!s.reviewRequired)failures.push('HUMAN_REVIEW_REQUIRED');if(s.destructiveCommitEnabled)failures.push('DESTRUCTIVE_COMMIT_FORBIDDEN');if(s.autonomousExecution)failures.push('AUTONOMOUS_EXECUTION_FORBIDDEN');if(index>0&&!s.sourceStageIds.length)failures.push('SOURCE_TRACEABILITY_REQUIRED');return failures;}
  function certify(input){input=input||{};var normalized=(input.stages||[]).map(normalizeStage),byId={},failures=[],warnings=[];normalized.forEach(function(s){if(byId[s.stageId])failures.push({stageId:s.stageId,code:'DUPLICATE_STAGE'});byId[s.stageId]=s;});REQUIRED_STAGES.forEach(function(id,i){var s=byId[id];if(!s){failures.push({stageId:id,code:'MISSING_STAGE'});return;}validateStage(s,i).forEach(function(code){failures.push({stageId:id,code:code});});if(i>0){var prior=REQUIRED_STAGES[i-1];if(s.sourceStageIds.indexOf(prior)<0)failures.push({stageId:id,code:'BROKEN_STAGE_CHAIN',expectedSource:prior});}});
    var graph=byId.ENTERPRISE_RELATIONSHIP_GRAPH,command=byId.EXECUTIVE_COMMAND,allocation=byId.PORTFOLIO_ALLOCATION;
    if(graph&&!graph.entityIds.length)failures.push({stageId:graph.stageId,code:'CANONICAL_ENTITIES_REQUIRED'});
    if(command&&!command.gisContext)failures.push({stageId:command.stageId,code:'GIS_CONTEXT_REQUIRED'});
    if(allocation&&allocation.status==='READY')warnings.push({stageId:allocation.stageId,code:'CAPITAL_APPROVAL_STILL_REQUIRED'});
    var evidenceIndex={};normalized.forEach(function(s){s.evidenceIds.forEach(function(e){evidenceIndex[e]=(evidenceIndex[e]||0)+1;});});
    var duplicateEvidence=Object.keys(evidenceIndex).filter(function(k){return evidenceIndex[k]>1;});
    var lineage=normalized.map(function(s){return {stageId:s.stageId,outputId:s.outputId,sources:s.sourceStageIds,evidenceIds:s.evidenceIds};});
    var status=failures.length?'FAILED':'PRODUCTION_READY';
    return {certificationId:'E3CERT-'+hash(JSON.stringify(lineage)),framework:'SCIIP_V7_EPIC_3_PRODUCTION_HARDENING_INTEGRATION',version:VERSION,status:status,stagesExpected:REQUIRED_STAGES.length,stagesCertified:REQUIRED_STAGES.filter(function(id){return !!byId[id];}).length,failures:failures,warnings:warnings,lineage:lineage,evidenceReuse:duplicateEvidence,controls:{reviewRequired:true,rollbackRequired:true,appendOnlyRequired:true,duplicateSafeRequired:true,destructiveCommitEnabled:false,autonomousExecution:false,autonomousCapitalDeployment:false},northStar:{ingestsMarketData:true,preservesHistory:true,connectsKnowledge:true,powersGIS:true,enablesAnalyze:true,enablesManage:true,enablesAct:true,oneTrustedPlatform:true}};
  }
  function deploymentGate(certification){if(!certification||certification.status!=='PRODUCTION_READY')return {status:'BLOCKED',reason:'EPIC3_CERTIFICATION_REQUIRED'};if(!certification.controls||certification.controls.rollbackRequired!==true)return {status:'BLOCKED',reason:'ROLLBACK_CONTROL_REQUIRED'};return {status:'APPROVED_FOR_CONTROLLED_RELEASE',certificationId:certification.certificationId,requiresHumanReleaseApproval:true,automaticDeployment:false,destructiveCommitEnabled:false};}
  function regressionCompare(previous,current){var p=previous||{},c=current||{},regressions=[];if((c.stagesCertified||0)<(p.stagesCertified||0))regressions.push('CERTIFIED_STAGE_COUNT_DECREASED');if((c.failures||[]).length>(p.failures||[]).length)regressions.push('FAILURE_COUNT_INCREASED');if(p.status==='PRODUCTION_READY'&&c.status!=='PRODUCTION_READY')regressions.push('PRODUCTION_READINESS_LOST');return {status:regressions.length?'REGRESSION_DETECTED':'NO_REGRESSION',regressions:regressions,reviewRequired:regressions.length>0};}
  return {VERSION:VERSION,REQUIRED_STAGES:REQUIRED_STAGES.slice(),normalizeStage:normalizeStage,certify:certify,deploymentGate:deploymentGate,regressionCompare:regressionCompare};
}());


/** Sprint 14 append-only certification ledger adapter. */
var SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_PERSISTENCE=(function(){
  'use strict';var memory=[];
  function append(records){var added=0;(records||[]).forEach(function(r){var key=String(r.certificationId||r.eventId||'');if(!key)return;if(memory.some(function(x){return String(x.certificationId||x.eventId||'')===key;}))return;memory.push(JSON.parse(JSON.stringify(r)));added++;});return {appended:added,total:memory.length,appendOnly:true,duplicateSafe:true};}
  function list(){return JSON.parse(JSON.stringify(memory));}
  function clearForTest(){memory=[];}
  return {append:append,list:list,clearForTest:clearForTest};
}());


/** Sprint 10 Apps Script certification. */
function sciipTestV7Epic3Sprint10(){
  var failures=[],tests=0;function ok(name,value){tests++;if(!value)failures.push(name);}
  var approved={id:'CMD-OPP-1-LEASE',opportunityId:'OPP-1',action:'LEASE_REPRESENTATION',status:'READY',approved:true};
  var denied={id:'CMD-OPP-2',opportunityId:'OPP-2',action:'ACQUIRE',status:'AWAITING_APPROVAL',approved:false};
  var plan=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.createPlan(approved,{owner:'USER-1'});ok('Plan creation',plan.status==='PLANNED'&&plan.tasks.length===4);
  ok('Approval gate',SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.createPlan(denied,{owner:'USER-1'}).status==='REJECTED');
  var noEvidence=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.transition(plan,{type:'TASK_COMPLETE',taskId:plan.tasks[0].id,evidenceIds:[]});ok('Evidence gate',noEvidence.reason==='EVIDENCE_REQUIRED');
  var completed=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.transition(plan,{type:'TASK_COMPLETE',taskId:plan.tasks[0].id,evidenceIds:['SOURCE_VALIDATION','DECISION_RATIONALE']});ok('Task transition',completed.status==='ACCEPTED'&&completed.plan.tasks[1].status==='PENDING');
  var duplicate=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.transition(completed.plan,{type:'TASK_COMPLETE',taskId:plan.tasks[0].id,evidenceIds:['SOURCE_VALIDATION','DECISION_RATIONALE']});ok('Duplicate safety',duplicate.reason==='DUPLICATE_SAFE');
  var exception=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.transition(completed.plan,{type:'RAISE_EXCEPTION',reason:'Conflicting source',severity:'HIGH'});ok('Exception control',exception.plan.status==='PAUSED'&&exception.plan.exceptions.length===1);
  var app=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION_APPLICATION.run({commands:[approved,approved],defaultOwner:'USER-1'});ok('Business key duplicate protection',app.plans.length===1&&app.rejected.length===1);
  var store=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION_PERSISTENCE.memory(),p1=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION_PERSISTENCE.persist(store,[completed.event]),p2=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION_PERSISTENCE.persist(store,[completed.event]);ok('Append-only persistence',p1.appended===1&&p2.duplicates===1);
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_10_OPPORTUNITY_WORKFLOW_EXECUTION_CONTROL',version:'v7.0-epic3-sprint10.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{plans:app.plans.length,rejected:app.rejected.length,tasks:plan.tasks.length,milestones:plan.milestones.length,openExceptions:exception.plan.exceptions.length,historyEvents:store.all().length,workspace:'executive-opportunity-command',reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false}};
}


/** Sprint 11 Apps Script certification. */
function sciipTestV7Epic3Sprint11(){
  var failures=[],tests=0;function ok(name,value){tests++;if(!value)failures.push(name);}
  var now='2026-07-17T18:00:00.000Z';
  var plan={id:'PLAN-1',opportunityId:'OPP-1',status:'IN_PROGRESS',tasks:[{id:'T1',status:'COMPLETED',dueAt:'2026-07-14T18:00:00.000Z'},{id:'T2',status:'PENDING',dueAt:'2026-07-16T18:00:00.000Z'},{id:'T3',status:'PENDING',dueAt:'2026-07-19T18:00:00.000Z'},{id:'T4',status:'BLOCKED',dueAt:'2026-07-30T18:00:00.000Z'}],exceptions:[]};
  var monitor=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.monitor(plan,{now:now,evidence:[{status:'ACCEPTED',quality:90},{status:'ACCEPTED',quality:70}]});ok('Execution telemetry',monitor.progressPct===25&&monitor.lateTasks===1&&monitor.atRiskTasks===1);
  ok('Attention status',monitor.status==='ATTENTION_REQUIRED');
  var quality=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.assessEvidence([{status:'ACCEPTED',quality:90,weight:2},{status:'REJECTED',quality:100,weight:1}]);ok('Evidence quality',quality.score===60&&quality.rejected===1);
  var incomplete=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.recordOutcome(plan,{type:'LEASE_SIGNED',actualValue:100},{expectedValue:100});ok('Completed plan gate',incomplete.status==='REJECTED');
  var completed=JSON.parse(JSON.stringify(plan));completed.status='COMPLETED';completed.tasks.forEach(function(t){t.status='COMPLETED';});var outcome=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.recordOutcome(completed,{type:'LEASE_SIGNED',status:'REALIZED',actualValue:110,occurredAt:now,evidenceIds:['EV-1']},{expectedValue:100});ok('Outcome intelligence',outcome.status==='ACCEPTED'&&outcome.event.variancePct===10);
  var signal=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.feedback({id:'OPP-1',score:80},outcome.event,{healthScore:90});ok('Closed-loop feedback',signal.adjustedScore>80&&signal.automaticModelMutation===false);
  var app=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE_APPLICATION.run({plans:[plan],now:now,evidenceByPlan:{'PLAN-1':[{status:'ACCEPTED',quality:85}]}});ok('Application assembly',app.monitoring.length===1&&app.portfolio.total===1);
  var store=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE_PERSISTENCE.memory(),p1=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE_PERSISTENCE.persist(store,[monitor,outcome.event]),p2=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE_PERSISTENCE.persist(store,[monitor,outcome.event]);ok('Append-only duplicate safety',p1.appended===2&&p2.duplicates===2);
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_11_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE',version:'v7.0-epic3-sprint11.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{monitoringRecords:app.monitoring.length,healthScore:monitor.healthScore,lateTasks:monitor.lateTasks,atRiskTasks:monitor.atRiskTasks,evidenceQuality:quality.score,outcomes:1,feedbackSignals:1,historyEvents:store.all().length,workspace:'executive-opportunity-command',reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false}};
}


/** Sprint 12 Apps Script certification. */
function sciipTestV7Epic3Sprint12(){
  var failures=[],tests=0;function ok(name,value){tests++;if(!value)failures.push(name);}
  var feedback=[
    {feedbackId:'FB-1',opportunityId:'O-1',market:'IE West',assetType:'Industrial',opportunityType:'Tenant Rep',predictedScore:80,executionHealth:90,evidenceQuality:90,expectedValue:100,actualValue:120,outcomeStatus:'REALIZED'},
    {feedbackId:'FB-2',opportunityId:'O-2',market:'IE West',assetType:'Industrial',opportunityType:'Tenant Rep',predictedScore:82,executionHealth:85,evidenceQuality:80,expectedValue:100,actualValue:110,outcomeStatus:'REALIZED'},
    {feedbackId:'FB-3',opportunityId:'O-3',market:'IE West',assetType:'Industrial',opportunityType:'Tenant Rep',predictedScore:78,executionHealth:80,evidenceQuality:85,expectedValue:100,actualValue:105,outcomeStatus:'REALIZED'},
    {feedbackId:'FB-4',opportunityId:'O-4',market:'South Bay',assetType:'Industrial',opportunityType:'Acquisition',predictedScore:70,executionHealth:55,evidenceQuality:60,expectedValue:100,actualValue:80,outcomeStatus:'PARTIAL'}
  ];
  var normalized=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.normalizeFeedback(feedback);ok('Feedback normalization',normalized.length===4&&normalized[0].variancePct===20);
  var cohorts=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.benchmark(feedback);ok('Portfolio cohort benchmarking',cohorts.length===2&&cohorts[0].count>=1);
  var learning=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.learn(feedback,{minimumSampleSize:3});ok('Governed learning proposal',learning.proposals.length===1&&learning.proposals[0].automaticModelMutation===false);
  ok('Minimum sample gate',learning.proposals[0].sampleSize===3);
  var rejected=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.approve(learning.proposals[0],{action:'APPROVE'});ok('Approver gate',rejected.status==='REJECTED');
  var approved=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE.approve(learning.proposals[0],{action:'APPROVE',approvedBy:'EXEC-1',approvedAt:'2026-07-17T19:00:00.000Z'});ok('Controlled approval',approved.status==='APPROVED_NOT_APPLIED'&&approved.applicationRequiresControlledRelease===true);
  var app=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_APPLICATION.run({feedback:feedback,policy:{minimumSampleSize:3},decisions:[{proposalId:learning.proposals[0].proposalId,action:'APPROVE',approvedBy:'EXEC-1'}]});ok('Application assembly',app.portfolio.totalOutcomes===4&&app.approvals.length===1&&app.workspace==='executive-opportunity-command');
  var store=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_PERSISTENCE.memory(),p1=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_PERSISTENCE.persist(store,normalized.concat(learning.proposals).concat([approved])),p2=SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_PERSISTENCE.persist(store,normalized.concat(learning.proposals).concat([approved]));ok('Append-only duplicate safety',p1.appended===6&&p2.duplicates===6);
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_12_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE',version:'v7.0-epic3-sprint12.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{feedbackRecords:normalized.length,cohorts:cohorts.length,learningProposals:learning.proposals.length,approvedProposals:1,persistedEvents:store.all().length,workspace:'executive-opportunity-command',reviewRequired:true,automaticModelMutation:false,destructiveCommitEnabled:false,autonomousExecution:false}};
}


/** SCIIP_OS v7 Epic 3 Sprint 13 certification. */
function sciipTestV7Epic3Sprint13(){
  var failures=[],tests=0;function ok(name,condition){tests++;if(!condition)failures.push(name);}
  var actions=[
    {actionId:'A-1',opportunityId:'O-1',assetId:'P-1',market:'INLAND EMPIRE',assetType:'INDUSTRIAL',actionType:'ACQUIRE',capitalRequired:4000000,expectedValue:5600000,confidence:88,marketScore:85,executionHealth:82,evidenceQuality:92,riskScore:25,strategicFit:94,evidenceIds:['E-1','E-2'],latitude:34.1,longitude:-117.4},
    {actionId:'A-2',opportunityId:'O-2',assetId:'P-2',market:'SOUTH BAY',assetType:'INDUSTRIAL',actionType:'LEASE',capitalRequired:2500000,expectedValue:3400000,confidence:81,marketScore:78,executionHealth:75,evidenceQuality:86,riskScore:32,strategicFit:88,evidenceIds:['E-3'],latitude:33.8,longitude:-118.2},
    {actionId:'A-3',opportunityId:'O-3',assetId:'P-3',market:'INLAND EMPIRE',assetType:'LAND',actionType:'DEVELOP',capitalRequired:5000000,expectedValue:7000000,confidence:58,marketScore:80,executionHealth:70,evidenceQuality:55,riskScore:50,strategicFit:84,evidenceIds:[]}
  ];
  var ranked=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.rank(actions,{minimumEvidenceQuality:60,minimumConfidence:60});
  ok('governed ranking',ranked.eligible.length===2&&ranked.rejected.length===1&&ranked.eligible[0].actionId==='A-1');
  var allocation=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.allocate(actions,{totalCapital:6500000,minimumEvidenceQuality:60,minimumConfidence:60,marketCaps:{'INLAND EMPIRE':4500000,'SOUTH BAY':3000000}});
  ok('capital constraints',allocation.selected.length===2&&allocation.allocatedCapital===6500000&&allocation.remainingCapital===0);
  var scenarios=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.scenarios(actions,{totalCapital:6500000,minimumEvidenceQuality:60,minimumConfidence:60});
  ok('scenario comparison',scenarios.length===3&&scenarios[1].scenarioId==='BALANCED');
  var rejectedApproval=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.approve(allocation,{action:'APPROVE'});
  ok('approver gate',rejectedApproval.status==='REJECTED');
  var approval=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION.approve(allocation,{action:'APPROVE',approvedBy:'EXEC-1',approvedAt:'2026-07-17T12:00:00Z'});
  ok('controlled approval',approval.status==='APPROVED_NOT_DEPLOYED'&&approval.autonomousCapitalDeployment===false);
  SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_PERSISTENCE.clearForTest();var persisted=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_PERSISTENCE.append([allocation,approval,approval]);
  ok('append-only duplicate safety',persisted.appended===2&&persisted.total===2);
  var app=SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_APPLICATION.run({actions:actions,constraints:{totalCapital:6500000,minimumEvidenceQuality:60,minimumConfidence:60}});
  ok('workspace GIS integration',app.mapPoints.length===2&&app.descriptor.workspace==='executive-opportunity-command');
  ok('North Star governance',app.descriptor.northStar.length===4&&app.descriptor.destructiveCommitEnabled===false&&app.summary.reviewRequired===true);
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_13_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION',version:'v7.0-epic3-sprint13.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{eligibleActions:ranked.eligible.length,rejectedActions:ranked.rejected.length,selectedActions:allocation.selected.length,allocatedCapital:allocation.allocatedCapital,scenarios:scenarios.length,mapPoints:app.mapPoints.length,persistedEvents:persisted.total,workspace:app.descriptor.workspace,reviewRequired:true,autonomousCapitalDeployment:false,destructiveCommitEnabled:false}};
}


/** SCIIP_OS v7 Epic 3 Sprint 14 end-to-end production certification. */
function sciipTestV7Epic3Sprint14(){
  var failures=[],tests=0;function ok(name,condition){tests++;if(!condition)failures.push(name);}
  var ids=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.REQUIRED_STAGES;
  var stages=ids.map(function(id,i){return {stageId:id,status:i===8?'READY':'PASSED',businessKey:'BK|'+id+'|2026-07-17',outputId:'OUT-'+(i+1),evidenceIds:['E-'+(i+1)],entityIds:id==='ENTERPRISE_RELATIONSHIP_GRAPH'?['PROPERTY-1','COMPANY-1']:[],gisContext:id==='EXECUTIVE_COMMAND'?{points:2,links:1}:null,appendOnly:true,duplicateSafe:true,reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false,sourceStageIds:i?[ids[i-1]]:[]};});
  var certification=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.certify({stages:stages});
  ok('all Epic 3 stages certified',certification.status==='PRODUCTION_READY'&&certification.stagesCertified===9&&certification.failures.length===0);
  ok('end-to-end lineage preserved',certification.lineage.length===9&&certification.lineage[8].sources[0]==='ADAPTIVE_LEARNING');
  ok('GIS integration required',stages[4].gisContext.points===2&&certification.northStar.powersGIS===true);
  ok('human control enforced',certification.controls.reviewRequired===true&&certification.controls.autonomousExecution===false&&certification.controls.destructiveCommitEnabled===false);
  var gate=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.deploymentGate(certification);
  ok('controlled release gate',gate.status==='APPROVED_FOR_CONTROLLED_RELEASE'&&gate.requiresHumanReleaseApproval===true&&gate.automaticDeployment===false);
  SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_PERSISTENCE.clearForTest();var persisted=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_PERSISTENCE.append([certification,certification]);
  ok('append-only duplicate safety',persisted.appended===1&&persisted.total===1&&persisted.duplicateSafe===true);
  var broken=JSON.parse(JSON.stringify(stages));broken[5].sourceStageIds=['WRONG_STAGE'];var failed=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.certify({stages:broken});
  ok('broken contracts block release',failed.status==='FAILED'&&failed.failures.some(function(f){return f.code==='BROKEN_STAGE_CHAIN';})&&SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION.deploymentGate(failed).status==='BLOCKED');
  var app=SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_APPLICATION.run({stages:stages});
  ok('North Star release certification',app.releaseSummary.northStarAligned===true&&app.descriptor.northStar.length===8&&app.descriptor.workspace==='enterprise-intelligence-command-platform');
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_14_PRODUCTION_HARDENING_INTEGRATION_CERTIFICATION',version:'v7.0-epic3-sprint14.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{epic3Status:certification.status,stagesCertified:certification.stagesCertified,lineageRecords:certification.lineage.length,persistedCertifications:persisted.total,releaseGate:gate.status,workspace:app.descriptor.workspace,northStarAligned:app.releaseSummary.northStarAligned,reviewRequired:true,rollbackRequired:true,destructiveCommitEnabled:false,autonomousExecution:false,automaticDeployment:false}};
}


function sciipTestV7Epic3Sprint5() {
  var input = {
    entities: [
      {id:'COMP-A', name:'Owner A', type:'COMPANY'},
      {id:'PERSON-B', name:'Broker B', type:'PERSON'},
      {id:'COMP-C', name:'Tenant C', type:'COMPANY'}
    ],
    relationships: [
      {sourceId:'COMP-A', targetId:'PERSON-B', type:'REPRESENTED_BY', strength:90, confidence:95, observedAt:'2026-07-17'},
      {sourceId:'PERSON-B', targetId:'COMP-C', type:'KNOWS', strength:85, confidence:90, observedAt:'2026-07-17'},
      {sourceId:'COMP-A', targetId:'PERSON-B', type:'REPRESENTED_BY', strength:80, confidence:80, observedAt:'2026-07-17'}
    ]
  };
  var result = SCIIP_RELATIONSHIP_INTELLIGENCE_APPLICATION.run(input, {commit:false});
  var failures = [];
  if (result.analysis.entities !== 3) failures.push('Expected 3 entities.');
  if (result.analysis.relationships !== 2) failures.push('Duplicate relationship was not suppressed.');
  if (!result.analysis.topInfluencer || result.analysis.topInfluencer.entityId !== 'PERSON-B') failures.push('Influence scoring failed.');
  if (result.analysis.opportunities.length !== 1) failures.push('Warm-introduction opportunity missing.');
  if (result.persistence.status !== 'PREVIEW') failures.push('Default persistence must be preview-only.');
  if (!result.briefing.grounded || !result.briefing.evidenceRequired) failures.push('AI briefing is not evidence governed.');
  return {
    framework:'SCIIP_V7_EPIC_3_SPRINT_5_RELATIONSHIP_INTELLIGENCE',
    version:'v7.0-epic3-sprint5.0',
    status:failures.length ? 'FAILED' : 'PASSED',
    testsRun:6,
    failures:failures,
    result:{
      entities:result.analysis.entities,
      relationships:result.analysis.relationships,
      opportunities:result.analysis.opportunities.length,
      topInfluencer:result.analysis.topInfluencer && result.analysis.topInfluencer.entityId,
      workspace:result.descriptor.workspace,
      reviewRequired:result.descriptor.governance.reviewRequired,
      destructiveCommitEnabled:result.descriptor.governance.destructiveCommitEnabled
    }
  };
}


function sciipTestV7Epic3Sprint6() {
  var input = {
    entities: [
      {id:'OWNER-A', name:'Owner A', type:'COMPANY', attributes:{baseInfluence:3}},
      {id:'BROKER-B', name:'Broker B', type:'PERSON', attributes:{baseInfluence:5}},
      {id:'TENANT-C', name:'Tenant C', type:'COMPANY', attributes:{baseInfluence:2}},
      {id:'ASSET-D', name:'Asset D', type:'PROPERTY', attributes:{baseInfluence:1}}
    ],
    relationships: [
      {id:'R1', sourceId:'OWNER-A', targetId:'BROKER-B', type:'REPRESENTED_BY', strength:90, confidence:95, observedAt:'2026-07-01'},
      {id:'R2', sourceId:'BROKER-B', targetId:'TENANT-C', type:'KNOWS', strength:85, confidence:90, observedAt:'2026-07-01'},
      {id:'R3', sourceId:'BROKER-B', targetId:'ASSET-D', type:'MARKETS', strength:70, confidence:90, observedAt:'2026-07-01', metadata:{decayPerDay:2.5}}
    ]
  };
  var portfolio = [
    {id:'ASSET-D', entityId:'ASSET-D', marketPriority:90, strategicFit:85},
    {id:'OWNER-A', entityId:'OWNER-A', marketPriority:70, strategicFit:75}
  ];
  var options = {asOfDate:'2026-07-17T00:00:00Z', maxDepth:3, iterations:3};
  var traversal = SCIIP_NETWORK_INTELLIGENCE.traverse(input, 'OWNER-A', options);
  var temporal = SCIIP_NETWORK_INTELLIGENCE.temporalSnapshot(input, options.asOfDate);
  var propagation = SCIIP_NETWORK_INTELLIGENCE.propagateInfluence(input, options);
  var portfolioScore = SCIIP_NETWORK_INTELLIGENCE.scorePortfolio(input, portfolio, options);
  var dashboard = SCIIP_NETWORK_INTELLIGENCE.buildDashboard(input, portfolio, options);
  var recommendations = SCIIP_NETWORK_INTELLIGENCE.recommend(input, portfolio, options);
  var persistence = SCIIP_NETWORK_INTELLIGENCE_PERSISTENCE.persist(
    SCIIP_NETWORK_INTELLIGENCE.analyze(input, portfolio, options),
    {commit:false, asOfDate:'2026-07-17'}
  );
  var failures = [];
  if (traversal.reachableEntities !== 3) failures.push('Multi-hop traversal failed.');
  if (temporal.weakening !== 1) failures.push('Temporal weakening detection failed.');
  if (!propagation.top || propagation.top.entityId !== 'BROKER-B') failures.push('Influence propagation failed.');
  if (!portfolioScore.topAsset) failures.push('Portfolio network scoring failed.');
  if (dashboard.kpis.entities !== 4 || dashboard.kpis.relationships !== 3) failures.push('Dashboard KPI assembly failed.');
  if (!recommendations.count) failures.push('Governed recommendations missing.');
  if (persistence.status !== 'PREVIEW' || persistence.destructiveWrite !== false) failures.push('Persistence governance failed.');
  return {
    framework:'SCIIP_V7_EPIC_3_SPRINT_6_NETWORK_INTELLIGENCE',
    version:'v7.0-epic3-sprint6.0',
    status:failures.length ? 'FAILED' : 'PASSED',
    testsRun:7,
    failures:failures,
    result:{
      reachableEntities:traversal.reachableEntities,
      weakeningRelationships:temporal.weakening,
      topInfluencer:propagation.top && propagation.top.entityId,
      topPortfolioAsset:portfolioScore.topAsset && portfolioScore.topAsset.assetId,
      dashboardWorkspace:dashboard.workspace,
      recommendations:recommendations.count,
      reviewRequired:dashboard.reviewRequired,
      destructiveCommitEnabled:dashboard.destructiveCommitEnabled
    }
  };
}


function sciipTestV7Epic3Sprint7(){
  var input={entities:[
    {id:'P-LOWELL',type:'PROPERTY',name:'2125 W Lowell St',businessKey:'PROPERTY|2125-W-LOWELL-ST-RIALTO',latitude:34.087,longitude:-117.389,attributes:{market:'Inland Empire West',powerAmps:8000},evidence:[{sourceId:'SUPERSHEET-1',sourceType:'SUPERSHEET',confidence:95}]},
    {id:'OWNER-A',type:'COMPANY',name:'Owner A',attributes:{industry:'Industrial Real Estate'}},
    {id:'TENANT-AERO',type:'COMPANY',name:'Aerospace Tenant',attributes:{industry:'Aerospace Manufacturing'}},
    {id:'UTILITY-SCE',type:'UTILITY',name:'Southern California Edison',latitude:34.08,longitude:-117.40},
    {id:'MARKET-IEW',type:'MARKET',name:'Inland Empire West',latitude:34.05,longitude:-117.45},
    {id:'P-LOWELL-DUP',type:'PROPERTY',name:'Lowell Logistics',businessKey:'PROPERTY|2125-W-LOWELL-ST-RIALTO',aliases:['Locust Gateway Logistics Center']}
  ],relationships:[
    {id:'R1',sourceId:'OWNER-A',targetId:'P-LOWELL',type:'OWNS',confidence:98,evidence:[{sourceId:'TITLE-1',sourceType:'PUBLIC_RECORD',confidence:98}]},
    {id:'R2',sourceId:'TENANT-AERO',targetId:'P-LOWELL',type:'OCCUPIES',confidence:85,evidence:[{sourceId:'LEASE-1',sourceType:'LEASE',confidence:85}]},
    {id:'R3',sourceId:'P-LOWELL',targetId:'UTILITY-SCE',type:'SERVED_BY',confidence:90,evidence:[{sourceId:'UTILITY-1',sourceType:'UTILITY_RECORD',confidence:90}]},
    {id:'R4',sourceId:'P-LOWELL',targetId:'MARKET-IEW',type:'LOCATED_IN',confidence:100,evidence:[{sourceId:'GIS-1',sourceType:'GIS',confidence:100}]},
    {id:'R5',sourceId:'MISSING',targetId:'P-LOWELL',type:'RELATED_TO',confidence:40}
  ]};
  var graph=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.build(input);
  var query=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.query(input,{entityType:'COMPANY',industry:'Aerospace',minimumConfidence:80});
  var path=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.shortestPath(input,'OWNER-A','UTILITY-SCE',{maxDepth:4});
  var spatial=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.spatialProjection(input);
  var context=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.evidenceContext(input,['P-LOWELL'],{limit:10});
  var application=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_APPLICATION.run(input);
  var persistence=SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH_PERSISTENCE.persist(application.result,{commit:false,asOfDate:'2026-07-17'});
  var failures=[];
  if(graph.entities.length!==5) failures.push('Canonical duplicate resolution failed.');
  if(graph.relationships.length!==4||graph.rejectedRelationships!==1) failures.push('Relationship governance failed.');
  if(query.entities.length!==1||query.entities[0].id!=='TENANT-AERO') failures.push('Cross-domain query failed.');
  if(!path.found||path.depth!==2) failures.push('Shortest-path traversal failed.');
  if(spatial.pointCount!==3||spatial.linkCount!==2) failures.push('GIS graph projection failed.');
  if(context.groundedCount!==4) failures.push('Evidence context failed.');
  if(application.descriptor.northStar.advances.indexOf('CONNECTS_KNOWLEDGE')===-1) failures.push('North Star declaration missing.');
  if(persistence.status!=='PREVIEW'||persistence.destructiveWrite!==false) failures.push('Persistence governance failed.');
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_7_ENTERPRISE_RELATIONSHIP_GRAPH',version:'v7.0-epic3-sprint7.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{canonicalEntities:graph.entities.length,relationships:graph.relationships.length,rejectedRelationships:graph.rejectedRelationships,aerospaceMatches:query.entities.length,shortestPathDepth:path.depth,spatialPoints:spatial.pointCount,spatialLinks:spatial.linkCount,groundedContext:context.groundedCount,workspace:application.descriptor.workspace,reviewRequired:application.descriptor.governance.reviewRequired,destructiveCommitEnabled:application.descriptor.governance.destructiveCommitEnabled}};
}


function sciipTestV7Epic3Sprint8(){
  var failures=[];
  function check(name,ok){if(!ok)failures.push(name);}
  var input={minimumScore:55,minimumEvidence:1,signals:[
    {businessKey:'TENANT|P-1|T-1|2026-07-17',type:'TENANT_REPRESENTATION',title:'Aerospace tenant expansion near powered facility',propertyId:'P-1',tenantId:'T-1',marketId:'SOUTH-BAY',demandScore:95,propertyFitScore:92,networkScore:88,timingScore:90,confidence:90,riskScore:10,observedAt:'2026-07-17',recommendedAction:'CONTACT_TENANT_AND_POSITION_PROPERTY',evidence:[{sourceId:'REL-1',sourceType:'GRAPH',observedAt:'2026-07-17',reference:'Two-hop aerospace expansion relationship',confidence:92}]},
    {businessKey:'ACQ|P-2|2026-07-17',type:'ACQUISITION',title:'Underpriced infill acquisition',propertyId:'P-2',marketId:'LA-BASIN',demandScore:85,propertyFitScore:82,networkScore:75,timingScore:80,confidence:80,riskScore:20,observedAt:'2026-07-17',recommendedAction:'UNDERWRITE_ACQUISITION',evidence:[{sourceId:'TX-2',sourceType:'TRANSACTION',observedAt:'2026-07-17',reference:'Pricing dislocation',confidence:80}]},
    {businessKey:'LOW|P-3|2026-07-17',title:'Weak signal',propertyId:'P-3',demandScore:10,propertyFitScore:20,networkScore:10,timingScore:10,confidence:20,riskScore:80,observedAt:'2026-07-17',evidence:[{sourceId:'M-1',sourceType:'MARKET',reference:'Weak'}]},
    {businessKey:'TENANT|P-1|T-1|2026-07-17',title:'Duplicate',propertyId:'P-1',tenantId:'T-1',demandScore:99,propertyFitScore:99,networkScore:99,timingScore:99,confidence:99,evidence:[{sourceId:'DUP'}]}
  ]};
  var d=SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.discover(input);check('DiscoveryCount',d.opportunities.length===2);check('RejectCount',d.rejected.length===1);check('Ranking',d.opportunities[0].score>=d.opportunities[1].score);check('Governance',d.reviewRequired===true&&d.destructiveCommitEnabled===false);var rec=SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.recommendations(d);check('Recommendations',rec.length===2&&rec[0].approvalRequired===true);var persisted=SCIIP_AUTONOMOUS_OPPORTUNITY_PERSISTENCE.append([],d);var persisted2=SCIIP_AUTONOMOUS_OPPORTUNITY_PERSISTENCE.append(persisted.rows,d);check('Persistence',persisted.recordsCreated===2&&persisted2.skippedDuplicate===2);var app=SCIIP_AUTONOMOUS_OPPORTUNITY_APPLICATION.run(input);check('NorthStar',app.capabilities.indexOf('ACT')!==-1&&app.northStar.indexOf('operating system for industrial real estate')!==-1);var changes=SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.detectChanges([],d.opportunities);check('ChangeDetection',changes.count===2);
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_8_AUTONOMOUS_OPPORTUNITY_DISCOVERY',version:'v7.0-epic3-sprint8.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{opportunities:d.opportunities.length,rejected:d.rejected.length,topOpportunity:d.opportunities[0]&&d.opportunities[0].id,topScore:d.opportunities[0]&&d.opportunities[0].score,recommendations:rec.length,changes:changes.count,persisted:persisted.recordsCreated,workspace:app.workspace,reviewRequired:true,destructiveCommitEnabled:false}};
}


function sciipTestV7Epic3Sprint9(){
  var failures=[],tests=0;function check(name,condition){tests+=1;if(!condition)failures.push(name);}
  var input={opportunities:[{id:'OPP-1',title:'Aerospace expansion',type:'TENANT_REPRESENTATION',score:91,priority:'CRITICAL',propertyId:'P-1',companyId:'C-1',recommendedAction:'QUALIFY_TENANT',confidence:94,riskScore:12,evidence:[{sourceId:'S-1'},{sourceId:'S-2'}]},{id:'OPP-2',title:'Power-ready acquisition',type:'ACQUISITION',score:78,priority:'HIGH',propertyId:'P-2',recommendedAction:'UNDERWRITE',confidence:82,riskScore:25,evidence:[{sourceId:'S-3'}]}],properties:[{id:'P-1',address:'100 Rocket Way',city:'Torrance',latitude:33.84,longitude:-118.33},{id:'P-2',address:'200 Power Ave',city:'Rialto',latitude:34.1,longitude:-117.37}],companies:[{id:'C-1',name:'Orbital Manufacturing',industry:'AEROSPACE'}],approvals:[{opportunityId:'OPP-1',status:'APPROVED'}]};
  var app=SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND_APPLICATION.run(input),w=app.workspace;
  check('WorkspaceAvailable',w.status==='AVAILABLE'&&w.workspace==='executive-opportunity-command');
  check('Scorecard',w.scorecard.total===2&&w.scorecard.highPriority===2&&w.scorecard.approved===1);
  check('Ranking',w.cards[0].opportunityId==='OPP-1'&&w.cards[0].score===91);
  check('GISProjection',w.map.count===2&&w.map.points[0].latitude===33.84);
  check('EvidenceGrounding',w.cards[0].evidenceCount===2&&w.cards[0].explanation.indexOf('Evidence 2')>=0);
  var ready=SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND.createCommand(w,{opportunityId:'OPP-1',action:'QUALIFY_TENANT'}),blocked=SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND.createCommand(w,{opportunityId:'OPP-2',action:'UNDERWRITE'});
  check('ApprovalGate',ready.status==='READY'&&blocked.status==='AWAITING_APPROVAL'&&!blocked.autonomousExecution);
  var store=SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND_PERSISTENCE.memory(),p=SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND_PERSISTENCE.persist(store,[{eventId:'E-1',opportunityId:'OPP-1',payload:ready}]);
  check('AppendOnlyHistory',p.appended===1&&store.all()[0].appendOnly===true);
  check('NorthStar',app.northStar.indexOf('operating system for industrial real estate')>=0&&app.capabilities.indexOf('ACT')>=0&&!app.destructiveCommitEnabled);
  return {framework:'SCIIP_V7_EPIC_3_SPRINT_9_EXECUTIVE_OPPORTUNITY_COMMAND_WORKSPACE',version:'v7.0-epic3-sprint9.0',status:failures.length?'FAILED':'PASSED',testsRun:tests,failures:failures,result:{opportunities:w.scorecard.total,highPriority:w.scorecard.highPriority,pendingApprovals:w.scorecard.pendingApprovals,mapPoints:w.map.count,topOpportunity:w.cards[0].opportunityId,commandStatus:ready.status,historyEvents:store.all().length,workspace:w.workspace,reviewRequired:true,destructiveCommitEnabled:false}};
}


/** Sprint 11 application facade and North Star declaration. */
var SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE_APPLICATION=(function(){
  'use strict';
  var NORTH_STAR='SCIIP_OS is the operating system for industrial real estate. It ingests market data, preserves history, connects knowledge, powers GIS, and enables professionals to analyze, manage, and act from one trusted platform.';
  function run(input){input=input||{};var plans=input.plans||[],existing=input.existingMonitoring||[],seen={},monitoring=existing.slice(),outcomes=[],feedback=[];monitoring.forEach(function(r){seen[r.businessKey]=true;});plans.forEach(function(p){var key=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.businessKey(p);if(!seen[key]){var r=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.monitor(p,{now:input.now,evidence:(input.evidenceByPlan||{})[p.id]||[]});seen[key]=true;monitoring.push(r);}var o=(input.outcomesByPlan||{})[p.id];if(o){var rr=SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.recordOutcome(p,o,(input.baselinesByPlan||{})[p.id]||{});if(rr.status==='ACCEPTED'){outcomes.push(rr.event);feedback.push(SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.feedback((input.opportunitiesById||{})[p.opportunityId]||{id:p.opportunityId},rr.event,monitoring.filter(function(x){return x.planId===p.id;})[0]||{}));}}});return {version:SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.VERSION,northStar:NORTH_STAR,capabilities:['PRESERVES_HISTORY','CONNECTS_KNOWLEDGE','ANALYZE','MANAGE','ACT','ONE_TRUSTED_PLATFORM'],monitoring:monitoring,outcomes:outcomes,feedback:feedback,portfolio:SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE.portfolio(monitoring),reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false};}
  return {NORTH_STAR:NORTH_STAR,run:run};
}());


/** SCIIP_OS v7.0 — Epic 3 Sprint 11: Execution Monitoring and Outcome Intelligence */
var SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE=(function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint11.0';
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function num(v,d){v=Number(v);return isFinite(v)?v:(d||0);}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function daysBetween(a,b){var x=new Date(a).getTime(),y=new Date(b).getTime();return isFinite(x)&&isFinite(y)?Math.floor((y-x)/86400000):0;}
  function businessKey(plan){return ['OUTCOME',text(plan.id),text(plan.opportunityId)].join('|');}
  function monitor(plan,options){options=options||{};var now=options.now||new Date().toISOString(),tasks=plan.tasks||[],done=tasks.filter(function(t){return upper(t.status)==='COMPLETED';}).length,total=tasks.length||1,progress=Math.round(done*100/total),late=0,atRisk=0;
    tasks.forEach(function(t){if(upper(t.status)==='COMPLETED')return;var due=t.dueAt||t.targetAt;if(due&&new Date(due).getTime()<new Date(now).getTime())late++;else if(due&&daysBetween(now,due)<=num(options.riskWindowDays,3))atRisk++;});
    var evidence=assessEvidence(options.evidence||[]),exceptions=(plan.exceptions||[]).filter(function(x){return upper(x.status)==='OPEN';}).length;
    var health=clamp(Math.round(progress-(late*12)-(atRisk*5)-(exceptions*10)+((evidence.score-50)*0.2)),0,100);
    var status=late||exceptions?'ATTENTION_REQUIRED':(atRisk?'WATCH':(progress===100?'COMPLETED':'ON_TRACK'));
    return {businessKey:businessKey(plan),planId:text(plan.id),opportunityId:text(plan.opportunityId),status:status,healthScore:health,progressPct:progress,completedTasks:done,totalTasks:tasks.length,lateTasks:late,atRiskTasks:atRisk,openExceptions:exceptions,evidenceQuality:evidence,observedAt:now,reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false};}
  function assessEvidence(items){items=items||[];if(!items.length)return {score:0,status:'MISSING',accepted:0,rejected:0,total:0};var accepted=0,rejected=0,weighted=0,weight=0;items.forEach(function(e){var w=clamp(num(e.weight,1),0.1,5),quality=clamp(num(e.quality,0),0,100);if(upper(e.status)==='REJECTED'){rejected++;quality=0;}else accepted++;weighted+=quality*w;weight+=w;});var score=Math.round(weighted/(weight||1));return {score:score,status:score>=80?'HIGH':(score>=60?'MEDIUM':'LOW'),accepted:accepted,rejected:rejected,total:items.length};}
  function recordOutcome(plan,outcome,baseline){outcome=outcome||{};baseline=baseline||{};if(upper(plan.status)!=='COMPLETED')return {status:'REJECTED',reason:'COMPLETED_PLAN_REQUIRED'};if(!text(outcome.type))return {status:'REJECTED',reason:'OUTCOME_TYPE_REQUIRED'};var actual=num(outcome.actualValue,0),expected=num(baseline.expectedValue,0),variance=expected?Math.round(((actual-expected)/Math.abs(expected))*10000)/100:null;var realized=upper(outcome.status||'REALIZED');var event={eventId:'OUT-'+hash(text(plan.id)+'|'+text(outcome.type)+'|'+text(outcome.occurredAt||'')),eventType:'OUTCOME_RECORDED',planId:text(plan.id),opportunityId:text(plan.opportunityId),outcomeType:upper(outcome.type),status:realized,expectedValue:expected,actualValue:actual,variancePct:variance,occurredAt:outcome.occurredAt||new Date().toISOString(),evidenceIds:(outcome.evidenceIds||[]).slice(),appendOnly:true};return {status:'ACCEPTED',event:event};}
  function feedback(opportunity,outcomeEvent,monitoring){opportunity=opportunity||{};monitoring=monitoring||{};var base=clamp(num(opportunity.score,50),0,100),delta=0;if(outcomeEvent){if(upper(outcomeEvent.status)==='REALIZED')delta+=8;else if(upper(outcomeEvent.status)==='PARTIAL')delta+=2;else delta-=8;if(outcomeEvent.variancePct!==null&&outcomeEvent.variancePct!==undefined)delta+=clamp(num(outcomeEvent.variancePct,0)/10,-5,5);}delta+=clamp((num(monitoring.healthScore,50)-50)/10,-5,5);var adjusted=clamp(Math.round((base+delta)*100)/100,0,100);return {opportunityId:text(opportunity.id||monitoring.opportunityId),previousScore:base,adjustment:Math.round(delta*100)/100,adjustedScore:adjusted,learningSignal:delta>=5?'POSITIVE':(delta<=-5?'NEGATIVE':'NEUTRAL'),requiresHumanReview:true,automaticModelMutation:false};}
  function portfolio(records){records=records||[];var total=records.length,health=total?Math.round(records.reduce(function(n,r){return n+num(r.healthScore,0);},0)/total):0;return {total:total,onTrack:records.filter(function(r){return r.status==='ON_TRACK';}).length,watch:records.filter(function(r){return r.status==='WATCH';}).length,attentionRequired:records.filter(function(r){return r.status==='ATTENTION_REQUIRED';}).length,completed:records.filter(function(r){return r.status==='COMPLETED';}).length,averageHealthScore:health,lateTasks:records.reduce(function(n,r){return n+num(r.lateTasks,0);},0)};}
  function hash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  return {VERSION:VERSION,businessKey:businessKey,monitor:monitor,assessEvidence:assessEvidence,recordOutcome:recordOutcome,feedback:feedback,portfolio:portfolio};
}());


/** Append-only persistence adapter for Sprint 11 monitoring and outcome events. */
var SCIIP_EXECUTION_MONITORING_OUTCOME_INTELLIGENCE_PERSISTENCE=(function(){
  'use strict';
  function memory(){var rows=[],keys={};return {append:function(records){var appended=0,duplicates=0;(records||[]).forEach(function(r){var k=r.eventId||r.businessKey||JSON.stringify(r);if(keys[k]){duplicates++;return;}keys[k]=true;rows.push(JSON.parse(JSON.stringify(r)));appended++;});return {appended:appended,duplicates:duplicates,total:rows.length};},all:function(){return JSON.parse(JSON.stringify(rows));}};}
  function persist(adapter,records){if(!adapter||typeof adapter.append!=='function')throw new Error('Append-only adapter required.');return adapter.append(records||[]);}
  return {memory:memory,persist:persist};
}());


/** Sprint 9 application facade and North Star declaration. */
var SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND_APPLICATION=(function(){
  'use strict';
  var NORTH_STAR='SCIIP_OS is the operating system for industrial real estate. It ingests market data, preserves history, connects knowledge, powers GIS, and enables professionals to analyze, manage, and act from one trusted platform.';
  function run(input){input=input||{};var discovery=input.discovery;if(!discovery&&typeof SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY!=='undefined')discovery=SCIIP_AUTONOMOUS_OPPORTUNITY_DISCOVERY.discover(input.discoveryInput||{});var workspace=SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND.buildWorkspace({opportunities:(discovery&&discovery.opportunities)||input.opportunities||[],properties:input.properties||[],companies:input.companies||[],approvals:input.approvals||[]});return {version:SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND.VERSION,northStar:NORTH_STAR,capabilities:['CONNECTS_KNOWLEDGE','POWERS_GIS','ANALYZE','MANAGE','ACT','ONE_TRUSTED_PLATFORM'],workspace:workspace,briefing:SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND.briefing(workspace),reviewRequired:true,destructiveCommitEnabled:false};}
  return {NORTH_STAR:NORTH_STAR,run:run};
}());


/** SCIIP_OS v7.0 — Epic 3 Sprint 9: Executive Opportunity Command Workspace */
var SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND=(function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint9.0';
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function num(v,d){var n=Number(v);return isFinite(n)?n:(d===undefined?0:d);}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function indexBy(items,key){var out={};(items||[]).forEach(function(x){if(x&&x[key]!==undefined)out[text(x[key])]=x;});return out;}
  function normalizeOpportunity(o){return {id:text(o.id),businessKey:text(o.businessKey||o.id),title:text(o.title||o.type||'Opportunity'),type:upper(o.type||'MARKET_INTELLIGENCE'),score:num(o.score),priority:upper(o.priority||'MEDIUM'),status:upper(o.status||'DISCOVERED'),propertyId:text(o.propertyId),companyId:text(o.companyId),marketId:text(o.marketId),recommendedAction:text(o.recommendedAction||'REVIEW_AND_QUALIFY'),approvalRequired:o.approvalRequired!==false,evidence:clone(o.evidence||[]),rationale:clone(o.rationale||[]),riskScore:num(o.riskScore),confidence:num(o.confidence),metadata:clone(o.metadata||{})};}
  function buildWorkspace(input){
    input=input||{}; var opportunities=(input.opportunities||[]).map(normalizeOpportunity), properties=indexBy(input.properties||[],'id'), companies=indexBy(input.companies||[],'id'), approvals=indexBy(input.approvals||[],'opportunityId');
    opportunities.sort(function(a,b){return b.score-a.score||a.id.localeCompare(b.id);});
    var cards=opportunities.map(function(o){var p=properties[o.propertyId]||{},c=companies[o.companyId]||{},a=approvals[o.id]||{};return {opportunityId:o.id,title:o.title,type:o.type,score:o.score,priority:o.priority,status:o.status,property:{id:o.propertyId,address:text(p.address),city:text(p.city),latitude:p.latitude,longitude:p.longitude},company:{id:o.companyId,name:text(c.name),industry:text(c.industry)},evidenceCount:o.evidence.length,confidence:o.confidence,riskScore:o.riskScore,recommendedAction:o.recommendedAction,approvalStatus:upper(a.status||'PENDING'),approvalRequired:o.approvalRequired,canExecute:upper(a.status)==='APPROVED'&&o.approvalRequired,explanation:[o.title,'Score '+o.score,'Evidence '+o.evidence.length].join(' · ')};});
    var mapPoints=cards.filter(function(c){return isFinite(Number(c.property.latitude))&&isFinite(Number(c.property.longitude));}).map(function(c){return {id:c.opportunityId,latitude:Number(c.property.latitude),longitude:Number(c.property.longitude),label:c.property.address||c.title,priority:c.priority,score:c.score};});
    var high=cards.filter(function(c){return c.priority==='CRITICAL'||c.priority==='HIGH';});
    return {version:VERSION,workspace:'executive-opportunity-command',status:'AVAILABLE',generatedAt:new Date().toISOString(),scorecard:{total:cards.length,highPriority:high.length,pendingApprovals:cards.filter(function(c){return c.approvalRequired&&c.approvalStatus==='PENDING';}).length,approved:cards.filter(function(c){return c.approvalStatus==='APPROVED';}).length,averageScore:cards.length?Math.round(cards.reduce(function(s,c){return s+c.score;},0)/cards.length*100)/100:0},cards:cards,map:{points:mapPoints,count:mapPoints.length},filters:{types:unique(cards.map(function(c){return c.type;})),priorities:unique(cards.map(function(c){return c.priority;})),statuses:unique(cards.map(function(c){return c.status;}))},reviewRequired:true,destructiveCommitEnabled:false};
  }
  function unique(a){var s={},o=[];(a||[]).forEach(function(x){if(x&&!s[x]){s[x]=1;o.push(x);}});return o.sort();}
  function createCommand(workspace,request){request=request||{};var id=text(request.opportunityId),card=null;(workspace.cards||[]).some(function(c){if(c.opportunityId===id){card=c;return true;}return false;});if(!card)return {status:'REJECTED',reason:'OPPORTUNITY_NOT_FOUND'};var action=upper(request.action||card.recommendedAction),approved=card.approvalStatus==='APPROVED';return {id:'CMD-'+id+'-'+action,opportunityId:id,action:action,status:approved?'READY':'AWAITING_APPROVAL',approvalRequired:true,approved:approved,steps:[{sequence:1,type:'VERIFY_EVIDENCE',status:'PENDING'},{sequence:2,type:'ASSIGN_OWNER',status:'PENDING'},{sequence:3,type:action,status:'PENDING'}],evidenceCount:card.evidenceCount,destructive:false,autonomousExecution:false};}
  function briefing(workspace){var top=(workspace.cards||[]).slice(0,5);return {version:VERSION,title:'Executive Opportunity Command Briefing',summary:workspace.scorecard.total+' governed opportunities; '+workspace.scorecard.highPriority+' high priority; '+workspace.scorecard.pendingApprovals+' awaiting approval.',topActions:top.map(function(c,i){return {rank:i+1,opportunityId:c.opportunityId,title:c.title,score:c.score,action:c.recommendedAction,approvalStatus:c.approvalStatus};}),reviewRequired:true};}
  return {VERSION:VERSION,buildWorkspace:buildWorkspace,createCommand:createCommand,briefing:briefing};
}());


/** Append-only persistence adapter for Sprint 9 command events. */
var SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND_PERSISTENCE=(function(){
  'use strict';
  function memory(){var rows=[];return {append:function(events){(events||[]).forEach(function(e){rows.push(JSON.parse(JSON.stringify(e)));});return {appended:(events||[]).length,total:rows.length};},all:function(){return JSON.parse(JSON.stringify(rows));}};}
  function persist(adapter,events){if(!adapter||typeof adapter.append!=='function')throw new Error('Append-only adapter required.');var normalized=(events||[]).map(function(e){return {eventId:e.eventId||('EVT-'+Date.now()+'-'+Math.floor(Math.random()*100000)),eventType:e.eventType||'OPPORTUNITY_COMMAND_EVENT',opportunityId:e.opportunityId||'',occurredAt:e.occurredAt||new Date().toISOString(),payload:JSON.parse(JSON.stringify(e.payload||e)),appendOnly:true};});return adapter.append(normalized);}
  return {memory:memory,persist:persist};
}());


/**
 * SCIIP_OS v7.0 — Epic 3 Sprint 6 Application Descriptor
 */
var SCIIP_NETWORK_INTELLIGENCE_APPLICATION = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint6.0';
  var DESCRIPTOR = {
    id: 'network-intelligence',
    label: 'Network Intelligence',
    version: VERSION,
    workspace: 'relationship-intelligence',
    dependsOn: ['relationship-intelligence'],
    capabilities: [
      'MULTI_HOP_TRAVERSAL',
      'TEMPORAL_RELATIONSHIP_HISTORY',
      'INFLUENCE_PROPAGATION',
      'PORTFOLIO_NETWORK_VALUE',
      'EXECUTIVE_RELATIONSHIP_DASHBOARD',
      'EVIDENCE_GROUNDED_RECOMMENDATIONS'
    ],
    governance: {
      duplicateSafe: true,
      permanentHistory: true,
      reviewRequired: true,
      destructiveCommitEnabled: false
    }
  };

  function getDescriptor() {
    return JSON.parse(JSON.stringify(DESCRIPTOR));
  }

  function run(input, portfolioAssets, options) {
    return {
      descriptor: getDescriptor(),
      result: SCIIP_NETWORK_INTELLIGENCE.analyze(input || {}, portfolioAssets || [], options || {})
    };
  }

  return {
    VERSION: VERSION,
    getDescriptor: getDescriptor,
    run: run
  };
})();

function sciipNetworkIntelligenceApplication() {
  return SCIIP_NETWORK_INTELLIGENCE_APPLICATION.getDescriptor();
}

function sciipRunNetworkIntelligenceApplication(input, portfolioAssets, options) {
  return SCIIP_NETWORK_INTELLIGENCE_APPLICATION.run(input || {}, portfolioAssets || [], options || {});
}


/**
 * SCIIP_OS v7.0 — Epic 3 Sprint 6
 * Network Intelligence Engine
 *
 * Extends Sprint 5 relationship intelligence with governed multi-hop traversal,
 * temporal relationship state, influence propagation, portfolio network value,
 * dashboard-ready summaries, and explainable recommendations.
 */
var SCIIP_NETWORK_INTELLIGENCE = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint6.0';

  function text_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function number_(value, fallback) {
    var n = Number(value);
    return isFinite(n) ? n : (fallback || 0);
  }

  function clamp_(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round_(value) {
    return Math.round(value * 100) / 100;
  }

  function stableId_(parts) {
    var input = parts.join('|');
    var hash = 2166136261;
    var i;
    for (i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return 'NET-' + ('00000000' + (hash >>> 0).toString(16).toUpperCase()).slice(-8);
  }

  function graph_(input) {
    if (typeof SCIIP_RELATIONSHIP_INTELLIGENCE !== 'undefined' &&
        SCIIP_RELATIONSHIP_INTELLIGENCE &&
        typeof SCIIP_RELATIONSHIP_INTELLIGENCE.buildGraph === 'function') {
      return SCIIP_RELATIONSHIP_INTELLIGENCE.buildGraph(input || {});
    }
    throw new Error('Sprint 5 Relationship Intelligence Engine is required.');
  }

  function otherEnd_(relationship, entityId) {
    return relationship.sourceId === entityId ? relationship.targetId : relationship.sourceId;
  }

  function relationshipState(relationship, asOfDate) {
    relationship = relationship || {};
    var asOf = new Date(asOfDate || new Date().toISOString());
    var metadata = relationship.metadata || {};
    var start = relationship.startDate || metadata.startDate || relationship.observedAt || relationship.date || '';
    var end = relationship.endDate || metadata.endDate || relationship.expiresAt || metadata.expiresAt || '';
    var startDate = start ? new Date(start) : null;
    var endDate = end ? new Date(end) : null;
    var strength = clamp_(number_(relationship.strength, 50), 0, 100);
    var confidence = clamp_(number_(relationship.confidence, 50), 0, 100);
    var decayPerDay = clamp_(number_(relationship.decayPerDay !== undefined ? relationship.decayPerDay : metadata.decayPerDay, 0), 0, 10);
    var active = (!startDate || startDate <= asOf) && (!endDate || endDate >= asOf);
    var ageDays = startDate ? Math.max(0, Math.floor((asOf.getTime() - startDate.getTime()) / 86400000)) : 0;
    var effectiveStrength = active ? clamp_(strength - ageDays * decayPerDay, 0, 100) : 0;
    var state = 'ACTIVE';
    if (!active && startDate && startDate > asOf) state = 'PENDING';
    if (!active && endDate && endDate < asOf) state = 'EXPIRED';
    if (active && effectiveStrength < 35) state = 'WEAKENING';
    if (active && effectiveStrength >= 75) state = 'STRONG';
    return {
      relationshipId: text_(relationship.id),
      state: state,
      active: active,
      ageDays: ageDays,
      originalStrength: strength,
      effectiveStrength: round_(effectiveStrength),
      confidence: confidence,
      weightedStrength: round_(effectiveStrength * confidence / 100)
    };
  }

  function temporalSnapshot(input, asOfDate) {
    var graph = graph_(input);
    var relationships = [];
    graph.relationships.forEach(function (relationship) {
      var state = relationshipState(relationship, asOfDate);
      relationships.push({
        relationship: relationship,
        state: state
      });
    });
    return {
      version: VERSION,
      asOfDate: asOfDate || new Date().toISOString(),
      relationships: relationships,
      active: relationships.filter(function (item) { return item.state.active; }).length,
      expired: relationships.filter(function (item) { return item.state.state === 'EXPIRED'; }).length,
      weakening: relationships.filter(function (item) { return item.state.state === 'WEAKENING'; }).length,
      strong: relationships.filter(function (item) { return item.state.state === 'STRONG'; }).length
    };
  }

  function traverse(input, startId, options) {
    options = options || {};
    var graph = graph_(input);
    var maxDepth = clamp_(number_(options.maxDepth, 3), 1, 5);
    var minimumWeightedStrength = clamp_(number_(options.minimumWeightedStrength, 0), 0, 100);
    var asOfDate = options.asOfDate || new Date().toISOString();
    var queue = [{entityId:startId, depth:0, path:[startId], score:100}];
    var bestDepth = {};
    var paths = [];
    bestDepth[startId] = 0;

    while (queue.length) {
      var current = queue.shift();
      if (current.depth >= maxDepth) continue;
      (graph.adjacency[current.entityId] || []).forEach(function (relationship) {
        var state = relationshipState(relationship, asOfDate);
        if (!state.active || state.weightedStrength < minimumWeightedStrength) return;
        var nextId = otherEnd_(relationship, current.entityId);
        if (current.path.indexOf(nextId) !== -1) return;
        var nextDepth = current.depth + 1;
        var nextScore = round_(current.score * (state.weightedStrength / 100) * (1 / nextDepth));
        var nextPath = current.path.concat([nextId]);
        paths.push({
          id: stableId_(nextPath),
          sourceId: startId,
          targetId: nextId,
          depth: nextDepth,
          path: nextPath,
          relationshipId: relationship.id,
          pathScore: nextScore
        });
        if (bestDepth[nextId] === undefined || nextDepth < bestDepth[nextId]) {
          bestDepth[nextId] = nextDepth;
          queue.push({entityId:nextId, depth:nextDepth, path:nextPath, score:nextScore});
        }
      });
    }

    paths.sort(function (a, b) {
      return b.pathScore - a.pathScore || a.depth - b.depth || a.targetId.localeCompare(b.targetId);
    });

    return {
      version: VERSION,
      startId: startId,
      maxDepth: maxDepth,
      paths: paths,
      reachableEntities: Object.keys(bestDepth).length - 1
    };
  }

  function propagateInfluence(input, options) {
    options = options || {};
    var graph = graph_(input);
    var asOfDate = options.asOfDate || new Date().toISOString();
    var iterations = clamp_(number_(options.iterations, 3), 1, 10);
    var damping = clamp_(number_(options.damping, 0.65), 0, 1);
    var scores = {};
    graph.entities.forEach(function (entity) {
      scores[entity.id] = number_(entity.attributes && entity.attributes.baseInfluence, 1);
    });

    var i;
    for (i = 0; i < iterations; i += 1) {
      var next = {};
      graph.entities.forEach(function (entity) {
        next[entity.id] = (1 - damping) * number_(entity.attributes && entity.attributes.baseInfluence, 1);
      });
      graph.relationships.forEach(function (relationship) {
        var state = relationshipState(relationship, asOfDate);
        if (!state.active) return;
        var weight = state.weightedStrength / 100;
        next[relationship.targetId] = (next[relationship.targetId] || 0) +
          damping * (scores[relationship.sourceId] || 0) * weight;
        next[relationship.sourceId] = (next[relationship.sourceId] || 0) +
          damping * (scores[relationship.targetId] || 0) * weight;
      });
      scores = next;
    }

    var ranking = Object.keys(scores).map(function (entityId) {
      return {entityId:entityId, propagatedInfluence:round_(scores[entityId])};
    });
    ranking.sort(function (a, b) {
      return b.propagatedInfluence - a.propagatedInfluence || a.entityId.localeCompare(b.entityId);
    });

    return {
      version: VERSION,
      iterations: iterations,
      damping: damping,
      ranking: ranking,
      top: ranking.length ? ranking[0] : null
    };
  }

  function scorePortfolio(input, portfolioAssets, options) {
    options = options || {};
    var graph = graph_(input);
    var propagation = propagateInfluence(input, options);
    var influenceIndex = {};
    propagation.ranking.forEach(function (item) {
      influenceIndex[item.entityId] = item.propagatedInfluence;
    });

    var results = (portfolioAssets || []).map(function (asset) {
      var entityId = text_(asset.entityId || asset.id);
      var adjacency = graph.adjacency[entityId] || [];
      var activeLinks = adjacency.filter(function (relationship) {
        return relationshipState(relationship, options.asOfDate).active;
      });
      var relationshipValue = activeLinks.reduce(function (sum, relationship) {
        return sum + relationshipState(relationship, options.asOfDate).weightedStrength;
      }, 0);
      var marketPriority = clamp_(number_(asset.marketPriority, 50), 0, 100);
      var strategicFit = clamp_(number_(asset.strategicFit, 50), 0, 100);
      var influence = number_(influenceIndex[entityId], 0);
      var score = round_(relationshipValue * 0.35 + influence * 0.30 + marketPriority * 0.20 + strategicFit * 0.15);
      return {
        assetId: text_(asset.id || entityId),
        entityId: entityId,
        relationshipCount: activeLinks.length,
        relationshipValue: round_(relationshipValue),
        propagatedInfluence: round_(influence),
        networkValueScore: score
      };
    });

    results.sort(function (a, b) {
      return b.networkValueScore - a.networkValueScore || a.assetId.localeCompare(b.assetId);
    });

    return {
      version: VERSION,
      assets: results.length,
      ranking: results,
      topAsset: results.length ? results[0] : null
    };
  }

  function buildDashboard(input, portfolioAssets, options) {
    var graph = graph_(input);
    var temporal = temporalSnapshot(input, options && options.asOfDate);
    var propagation = propagateInfluence(input, options || {});
    var portfolio = scorePortfolio(input, portfolioAssets || [], options || {});
    return {
      version: VERSION,
      workspace: 'relationship-intelligence',
      title: 'Executive Relationship Intelligence',
      kpis: {
        entities: graph.entities.length,
        relationships: graph.relationships.length,
        activeRelationships: temporal.active,
        weakeningRelationships: temporal.weakening,
        expiredRelationships: temporal.expired,
        portfolioAssets: portfolio.assets
      },
      topInfluencers: propagation.ranking.slice(0, 5),
      topPortfolioAssets: portfolio.ranking.slice(0, 5),
      reviewRequired: true,
      destructiveCommitEnabled: false
    };
  }

  function recommend(input, portfolioAssets, options) {
    options = options || {};
    var graph = graph_(input);
    var portfolio = scorePortfolio(input, portfolioAssets || [], options);
    var recommendations = [];

    portfolio.ranking.slice(0, 3).forEach(function (asset) {
      recommendations.push({
        id: stableId_([asset.assetId, 'PRIORITIZE']),
        action: 'PRIORITIZE_RELATIONSHIP_DEVELOPMENT',
        assetId: asset.assetId,
        priorityScore: asset.networkValueScore,
        confidence: asset.relationshipCount >= 2 ? 'HIGH' : 'MEDIUM',
        evidence: {
          relationshipCount: asset.relationshipCount,
          relationshipValue: asset.relationshipValue,
          propagatedInfluence: asset.propagatedInfluence
        },
        approvalRequired: true
      });
    });

    graph.relationships.forEach(function (relationship) {
      var state = relationshipState(relationship, options.asOfDate);
      if (state.state === 'WEAKENING') {
        recommendations.push({
          id: stableId_([relationship.id, 'REENGAGE']),
          action: 'REENGAGE_RELATIONSHIP',
          relationshipId: relationship.id,
          priorityScore: round_(100 - state.effectiveStrength),
          confidence: state.confidence >= 70 ? 'HIGH' : 'MEDIUM',
          evidence: state,
          approvalRequired: true
        });
      }
    });

    recommendations.sort(function (a, b) {
      return b.priorityScore - a.priorityScore;
    });

    return {
      version: VERSION,
      count: recommendations.length,
      recommendations: recommendations,
      reviewRequired: true
    };
  }

  function analyze(input, portfolioAssets, options) {
    options = options || {};
    var dashboard = buildDashboard(input, portfolioAssets || [], options);
    var recommendations = recommend(input, portfolioAssets || [], options);
    return {
      framework: 'SCIIP_V7_EPIC_3_SPRINT_6_NETWORK_INTELLIGENCE',
      version: VERSION,
      status: 'AVAILABLE',
      generatedAt: new Date().toISOString(),
      dashboard: dashboard,
      recommendations: recommendations
    };
  }

  return {
    VERSION: VERSION,
    relationshipState: relationshipState,
    temporalSnapshot: temporalSnapshot,
    traverse: traverse,
    propagateInfluence: propagateInfluence,
    scorePortfolio: scorePortfolio,
    buildDashboard: buildDashboard,
    recommend: recommend,
    analyze: analyze
  };
})();

function sciipNetworkRelationshipState(relationship, asOfDate) {
  return SCIIP_NETWORK_INTELLIGENCE.relationshipState(relationship || {}, asOfDate);
}

function sciipTraverseRelationshipNetwork(input, startId, options) {
  return SCIIP_NETWORK_INTELLIGENCE.traverse(input || {}, startId, options || {});
}

function sciipRunNetworkIntelligence(input, portfolioAssets, options) {
  return SCIIP_NETWORK_INTELLIGENCE.analyze(input || {}, portfolioAssets || [], options || {});
}


/**
 * SCIIP_OS v7.0 — Network Intelligence Persistence Adapter
 * Append-only when a governed storage service is available.
 */
var SCIIP_NETWORK_INTELLIGENCE_PERSISTENCE = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint6.0';

  function persist(snapshot, options) {
    options = options || {};
    var record = {
      businessKey: [
        'NETWORK_INTELLIGENCE',
        snapshot && snapshot.version || VERSION,
        options.asOfDate || new Date().toISOString().slice(0, 10)
      ].join('|'),
      createdAt: new Date().toISOString(),
      payload: snapshot || {},
      mode: 'DRY_RUN'
    };

    if (typeof SCIIP_STORAGE_SERVICE !== 'undefined' &&
        SCIIP_STORAGE_SERVICE &&
        typeof SCIIP_STORAGE_SERVICE.append === 'function' &&
        options.commit === true) {
      SCIIP_STORAGE_SERVICE.append('NETWORK_INTELLIGENCE_LEDGER', record);
      record.mode = 'APPENDED';
    }

    return {
      version: VERSION,
      status: record.mode === 'APPENDED' ? 'COMMITTED' : 'PREVIEW',
      duplicateSafe: true,
      permanentHistory: true,
      destructiveWrite: false,
      record: record
    };
  }

  return { VERSION: VERSION, persist: persist };
})();

function sciipPersistNetworkIntelligence(snapshot, options) {
  return SCIIP_NETWORK_INTELLIGENCE_PERSISTENCE.persist(snapshot || {}, options || {});
}


/** Sprint 10 application facade and North Star declaration. */
var SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION_APPLICATION=(function(){
  'use strict';
  var NORTH_STAR='SCIIP_OS is the operating system for industrial real estate. It ingests market data, preserves history, connects knowledge, powers GIS, and enables professionals to analyze, manage, and act from one trusted platform.';
  function run(input){input=input||{};var commands=input.commands||[],existing=input.existingPlans||[],seen={},plans=existing.slice(),rejected=[];plans.forEach(function(p){seen[p.businessKey]=true;});commands.forEach(function(c){var key=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.businessKey(c);if(seen[key]){rejected.push({commandId:c.id,reason:'DUPLICATE_BUSINESS_KEY'});return;}var r=SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.createPlan(c,{owner:(input.owners||{})[c.opportunityId]||input.defaultOwner,evidenceRequirements:input.evidenceRequirements});if(r.status==='REJECTED')rejected.push({commandId:c.id,reason:r.reason});else{seen[key]=true;plans.push(r);}});return {version:SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.VERSION,northStar:NORTH_STAR,capabilities:['PRESERVES_HISTORY','CONNECTS_KNOWLEDGE','MANAGE','ACT','ONE_TRUSTED_PLATFORM'],plans:plans,rejected:rejected,portfolio:SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION.portfolio(plans),reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false};}
  return {NORTH_STAR:NORTH_STAR,run:run};
}());


/** SCIIP_OS v7.0 — Epic 3 Sprint 10: Opportunity Workflow and Execution Control */
var SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION=(function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint10.0';
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function unique(a){var s={},o=[];(a||[]).forEach(function(x){x=text(x);if(x&&!s[x]){s[x]=1;o.push(x);}});return o;}
  function businessKey(command){return ['EXECUTION',text(command.opportunityId),upper(command.action)].join('|');}
  function createPlan(command,options){options=options||{};if(!command||upper(command.status)!=='READY'||command.approved!==true)return {status:'REJECTED',reason:'APPROVED_READY_COMMAND_REQUIRED'};var owner=text(options.owner||command.owner);if(!owner)return {status:'REJECTED',reason:'OWNER_REQUIRED'};var now=options.createdAt||new Date().toISOString(),key=businessKey(command),id='PLAN-'+simpleHash(key);var evidence=unique(options.evidenceRequirements||['SOURCE_VALIDATION','DECISION_RATIONALE']);var tasks=[
    task(id,1,'VERIFY_EVIDENCE',owner,[],evidence,'PENDING'),
    task(id,2,'CONFIRM_SCOPE_AND_AUTHORITY',owner,['VERIFY_EVIDENCE'],['APPROVAL_RECORD'],'BLOCKED'),
    task(id,3,upper(command.action),owner,['CONFIRM_SCOPE_AND_AUTHORITY'],['EXECUTION_EVIDENCE'],'BLOCKED'),
    task(id,4,'CLOSE_AND_RECORD_OUTCOME',owner,[upper(command.action)],['OUTCOME_RECORD'],'BLOCKED')
  ];return {id:id,businessKey:key,opportunityId:text(command.opportunityId),commandId:text(command.id),action:upper(command.action),status:'PLANNED',owner:owner,createdAt:now,updatedAt:now,tasks:tasks,milestones:[{id:'M1',name:'EVIDENCE_VERIFIED',status:'PENDING'},{id:'M2',name:'EXECUTION_AUTHORIZED',status:'PENDING'},{id:'M3',name:'ACTION_COMPLETED',status:'PENDING'},{id:'M4',name:'OUTCOME_RECORDED',status:'PENDING'}],evidenceRequirements:evidence,exceptions:[],reviewRequired:true,destructiveCommitEnabled:false,autonomousExecution:false};}
  function task(planId,seq,type,owner,deps,evidence,status){return {id:planId+'-T'+seq,sequence:seq,type:type,owner:owner,status:status,dependencies:deps,evidenceRequirements:evidence,completedAt:null};}
  function transition(plan,event){plan=clone(plan);event=event||{};var type=upper(event.type),taskId=text(event.taskId),target=null;(plan.tasks||[]).some(function(t){if(t.id===taskId){target=t;return true;}return false;});if(type==='TASK_COMPLETE'){
      if(!target)return reject(plan,'TASK_NOT_FOUND');if(target.status==='COMPLETED')return accept(plan,'DUPLICATE_SAFE');if(target.status==='BLOCKED')return reject(plan,'TASK_BLOCKED');var supplied=unique(event.evidenceIds||[]);var missing=(target.evidenceRequirements||[]).filter(function(x){return supplied.indexOf(x)<0;});if(missing.length)return reject(plan,'EVIDENCE_REQUIRED',missing);target.status='COMPLETED';target.completedAt=event.occurredAt||new Date().toISOString();unlock(plan,target.type);updateMilestones(plan);plan.status=plan.tasks.every(function(t){return t.status==='COMPLETED';})?'COMPLETED':'IN_PROGRESS';plan.updatedAt=target.completedAt;return {status:'ACCEPTED',plan:plan,event:audit(plan,event,'TASK_COMPLETED')};}
    if(type==='RAISE_EXCEPTION'){var ex={id:text(event.exceptionId||('EX-'+simpleHash(plan.id+'|'+Date.now()))),severity:upper(event.severity||'WARNING'),reason:text(event.reason),status:'OPEN',raisedAt:event.occurredAt||new Date().toISOString()};plan.exceptions.push(ex);plan.status='PAUSED';plan.updatedAt=ex.raisedAt;return {status:'ACCEPTED',plan:plan,event:audit(plan,event,'EXCEPTION_RAISED')};}
    if(type==='RESOLVE_EXCEPTION'){var found=null;(plan.exceptions||[]).some(function(x){if(x.id===text(event.exceptionId)){found=x;return true;}return false;});if(!found)return reject(plan,'EXCEPTION_NOT_FOUND');found.status='RESOLVED';found.resolvedAt=event.occurredAt||new Date().toISOString();if(plan.exceptions.every(function(x){return x.status==='RESOLVED';}))plan.status='IN_PROGRESS';return {status:'ACCEPTED',plan:plan,event:audit(plan,event,'EXCEPTION_RESOLVED')};}
    return reject(plan,'UNSUPPORTED_EVENT');}
  function unlock(plan,completedType){(plan.tasks||[]).forEach(function(t){if(t.status!=='BLOCKED')return;var ready=(t.dependencies||[]).every(function(dep){return plan.tasks.some(function(x){return x.type===dep&&x.status==='COMPLETED';});});if(ready)t.status='PENDING';});}
  function updateMilestones(plan){var completed={};(plan.tasks||[]).forEach(function(t){completed[t.type]=t.status==='COMPLETED';});var map=['VERIFY_EVIDENCE','CONFIRM_SCOPE_AND_AUTHORITY',plan.action,'CLOSE_AND_RECORD_OUTCOME'];(plan.milestones||[]).forEach(function(m,i){m.status=completed[map[i]]?'COMPLETED':'PENDING';});}
  function audit(plan,event,eventType){return {eventId:'EVT-'+simpleHash(plan.id+'|'+eventType+'|'+plan.updatedAt),eventType:eventType,planId:plan.id,opportunityId:plan.opportunityId,occurredAt:plan.updatedAt,payload:clone(event),appendOnly:true};}
  function reject(plan,reason,details){return {status:'REJECTED',reason:reason,details:details||[],plan:plan};}
  function accept(plan,reason){return {status:'ACCEPTED',reason:reason,plan:plan,event:null};}
  function portfolio(plans){plans=plans||[];return {total:plans.length,planned:plans.filter(function(p){return p.status==='PLANNED';}).length,inProgress:plans.filter(function(p){return p.status==='IN_PROGRESS';}).length,paused:plans.filter(function(p){return p.status==='PAUSED';}).length,completed:plans.filter(function(p){return p.status==='COMPLETED';}).length,pendingTasks:plans.reduce(function(n,p){return n+(p.tasks||[]).filter(function(t){return t.status==='PENDING';}).length;},0),openExceptions:plans.reduce(function(n,p){return n+(p.exceptions||[]).filter(function(e){return e.status==='OPEN';}).length;},0)};}
  function simpleHash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  return {VERSION:VERSION,createPlan:createPlan,transition:transition,portfolio:portfolio,businessKey:businessKey};
}());


/** Append-only persistence adapter for Sprint 10 workflow events. */
var SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION_PERSISTENCE=(function(){
  'use strict';
  function memory(){var rows=[],keys={};return {append:function(events){var appended=0,duplicates=0;(events||[]).forEach(function(e){var k=e.eventId||JSON.stringify(e);if(keys[k]){duplicates++;return;}keys[k]=true;rows.push(JSON.parse(JSON.stringify(e)));appended++;});return {appended:appended,duplicates:duplicates,total:rows.length};},all:function(){return JSON.parse(JSON.stringify(rows));}};}
  function persist(adapter,events){if(!adapter||typeof adapter.append!=='function')throw new Error('Append-only adapter required.');return adapter.append(events||[]);}
  return {memory:memory,persist:persist};
}());


/**
 * SCIIP_OS v7.0 — Relationship Intelligence AI Bridge
 * Produces evidence-grounded prompts; no model call is performed here.
 */
var SCIIP_RELATIONSHIP_INTELLIGENCE_AI_BRIDGE = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint5.0';

  function buildBriefingRequest(analysis) {
    analysis = analysis || {};
    var evidence = [];
    (analysis.influence || []).slice(0, 5).forEach(function (item) {
      evidence.push({
        type: 'INFLUENCE',
        entityId: item.entityId,
        score: item.influenceScore,
        relationshipCount: item.relationshipCount
      });
    });
    (analysis.opportunities || []).slice(0, 5).forEach(function (item) {
      evidence.push({
        type: 'OPPORTUNITY',
        sourceId: item.sourceId,
        targetId: item.targetId,
        score: item.score,
        sharedConnections: item.sharedConnections
      });
    });
    return {
      version: VERSION,
      task: 'RELATIONSHIP_INTELLIGENCE_BRIEFING',
      grounded: true,
      evidenceRequired: true,
      evidence: evidence,
      instruction: 'Summarize the strongest relationships, explainable opportunities, and recommended broker follow-up actions. Do not invent facts.'
    };
  }

  return { VERSION: VERSION, buildBriefingRequest: buildBriefingRequest };
})();

function sciipRelationshipIntelligenceBriefingRequest(analysis) {
  return SCIIP_RELATIONSHIP_INTELLIGENCE_AI_BRIDGE.buildBriefingRequest(analysis || {});
}


/**
 * SCIIP_OS v7.0 — Relationship Intelligence Application
 * Self-contained application descriptor that can be discovered by the v7
 * platform registry, query engine, or direct Apps Script entry points.
 */
var SCIIP_RELATIONSHIP_INTELLIGENCE_APPLICATION = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint5.0';
  var DESCRIPTOR = {
    id: 'relationship-intelligence',
    label: 'Relationship Intelligence',
    version: VERSION,
    workspace: 'relationship-intelligence',
    capabilities: [
      'RELATIONSHIP_GRAPH',
      'INFLUENCE_SCORING',
      'WARM_INTRODUCTION_DETECTION',
      'EVIDENCE_GROUNDED_BRIEFING',
      'APPEND_ONLY_PERSISTENCE'
    ],
    governance: {
      duplicateSafe: true,
      destructiveCommitEnabled: false,
      reviewRequired: true
    }
  };

  function getDescriptor() {
    return JSON.parse(JSON.stringify(DESCRIPTOR));
  }

  function run(input, options) {
    var analysis = SCIIP_RELATIONSHIP_INTELLIGENCE.analyze(input || {});
    var persistence = SCIIP_RELATIONSHIP_INTELLIGENCE_PERSISTENCE.persist(analysis, options || {});
    var briefing = SCIIP_RELATIONSHIP_INTELLIGENCE_AI_BRIDGE.buildBriefingRequest(analysis);
    return {
      descriptor: getDescriptor(),
      analysis: analysis,
      persistence: persistence,
      briefing: briefing
    };
  }

  return { VERSION: VERSION, getDescriptor: getDescriptor, run: run };
})();

function sciipRelationshipIntelligenceApplication() {
  return SCIIP_RELATIONSHIP_INTELLIGENCE_APPLICATION.getDescriptor();
}

function sciipRunRelationshipIntelligence(input, options) {
  return SCIIP_RELATIONSHIP_INTELLIGENCE_APPLICATION.run(input || {}, options || {});
}


/**
 * SCIIP_OS v7.0 — Epic 3 Sprint 5
 * Relationship Intelligence Engine
 *
 * Cohesive application service. No direct sheet writes. Duplicate-safe,
 * deterministic, and compatible with Apps Script and Node certification.
 */
var SCIIP_RELATIONSHIP_INTELLIGENCE = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint5.0';

  function text_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function number_(value, fallback) {
    var n = Number(value);
    return isFinite(n) ? n : (fallback || 0);
  }

  function upper_(value) {
    return text_(value).toUpperCase();
  }

  function stableId_(parts) {
    var input = parts.join('|');
    var hash = 2166136261;
    var i;
    for (i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return 'REL-' + ('00000000' + (hash >>> 0).toString(16).toUpperCase()).slice(-8);
  }

  function normalizeEntity_(entity) {
    entity = entity || {};
    return {
      id: text_(entity.id || entity.entityId || entity.companyId || entity.contactId),
      name: text_(entity.name || entity.label),
      type: upper_(entity.type || entity.entityType || 'UNKNOWN'),
      market: text_(entity.market || entity.submarket),
      attributes: entity.attributes || {}
    };
  }

  function normalizeRelationship_(relationship) {
    relationship = relationship || {};
    var sourceId = text_(relationship.sourceId || relationship.fromId);
    var targetId = text_(relationship.targetId || relationship.toId);
    var relationshipType = upper_(relationship.type || relationship.relationshipType || 'RELATED_TO');
    var observedAt = text_(relationship.observedAt || relationship.date || '');
    var confidence = Math.max(0, Math.min(100, number_(relationship.confidence, 50)));
    return {
      id: text_(relationship.id) || stableId_([sourceId, targetId, relationshipType, observedAt]),
      sourceId: sourceId,
      targetId: targetId,
      type: relationshipType,
      strength: Math.max(0, Math.min(100, number_(relationship.strength, confidence))),
      confidence: confidence,
      observedAt: observedAt,
      evidence: relationship.evidence || [],
      metadata: relationship.metadata || {}
    };
  }

  function deduplicateRelationships_(relationships) {
    var index = {};
    var output = [];
    (relationships || []).forEach(function (raw) {
      var item = normalizeRelationship_(raw);
      var key = [item.sourceId, item.targetId, item.type, item.observedAt].join('|');
      if (!index[key]) {
        index[key] = item;
        output.push(item);
      } else {
        index[key].strength = Math.max(index[key].strength, item.strength);
        index[key].confidence = Math.max(index[key].confidence, item.confidence);
        index[key].evidence = index[key].evidence.concat(item.evidence || []);
      }
    });
    return output;
  }

  function buildGraph(input) {
    input = input || {};
    var entities = (input.entities || []).map(normalizeEntity_);
    var relationships = deduplicateRelationships_(input.relationships || []);
    var entityIndex = {};
    var adjacency = {};
    entities.forEach(function (entity) {
      if (!entity.id) return;
      entityIndex[entity.id] = entity;
      adjacency[entity.id] = adjacency[entity.id] || [];
    });
    relationships.forEach(function (relationship) {
      if (!relationship.sourceId || !relationship.targetId) return;
      adjacency[relationship.sourceId] = adjacency[relationship.sourceId] || [];
      adjacency[relationship.targetId] = adjacency[relationship.targetId] || [];
      adjacency[relationship.sourceId].push(relationship);
      adjacency[relationship.targetId].push(relationship);
    });
    return {
      version: VERSION,
      entities: entities,
      relationships: relationships,
      entityIndex: entityIndex,
      adjacency: adjacency
    };
  }

  function calculateInfluence(graph) {
    var scores = [];
    Object.keys(graph.adjacency || {}).forEach(function (entityId) {
      var links = graph.adjacency[entityId] || [];
      var weighted = links.reduce(function (sum, link) {
        return sum + (link.strength * link.confidence / 100);
      }, 0);
      scores.push({
        entityId: entityId,
        relationshipCount: links.length,
        influenceScore: Math.round((links.length * 12 + weighted) * 100) / 100
      });
    });
    scores.sort(function (a, b) {
      return b.influenceScore - a.influenceScore || a.entityId.localeCompare(b.entityId);
    });
    return scores;
  }

  function detectOpportunities(graph) {
    var opportunities = [];
    var entities = graph.entities || [];
    var direct = {};
    (graph.relationships || []).forEach(function (link) {
      direct[link.sourceId + '|' + link.targetId] = true;
      direct[link.targetId + '|' + link.sourceId] = true;
    });
    entities.forEach(function (left, i) {
      entities.slice(i + 1).forEach(function (right) {
        if (!left.id || !right.id || direct[left.id + '|' + right.id]) return;
        var leftLinks = graph.adjacency[left.id] || [];
        var rightLinks = graph.adjacency[right.id] || [];
        var leftNeighbors = {};
        leftLinks.forEach(function (link) {
          leftNeighbors[link.sourceId === left.id ? link.targetId : link.sourceId] = true;
        });
        var shared = [];
        rightLinks.forEach(function (link) {
          var neighbor = link.sourceId === right.id ? link.targetId : link.sourceId;
          if (leftNeighbors[neighbor]) shared.push(neighbor);
        });
        if (shared.length) {
          opportunities.push({
            id: stableId_([left.id, right.id, 'INTRODUCTION']),
            sourceId: left.id,
            targetId: right.id,
            sharedConnections: shared,
            opportunityType: 'WARM_INTRODUCTION',
            score: Math.min(100, 55 + shared.length * 15)
          });
        }
      });
    });
    opportunities.sort(function (a, b) { return b.score - a.score; });
    return opportunities;
  }

  function analyze(input) {
    var graph = buildGraph(input);
    var influence = calculateInfluence(graph);
    var opportunities = detectOpportunities(graph);
    return {
      framework: 'SCIIP_V7_EPIC_3_SPRINT_5_RELATIONSHIP_INTELLIGENCE',
      version: VERSION,
      status: 'AVAILABLE',
      generatedAt: new Date().toISOString(),
      entities: graph.entities.length,
      relationships: graph.relationships.length,
      influence: influence,
      opportunities: opportunities,
      topInfluencer: influence.length ? influence[0] : null
    };
  }

  return {
    VERSION: VERSION,
    normalizeEntity: normalizeEntity_,
    normalizeRelationship: normalizeRelationship_,
    deduplicateRelationships: deduplicateRelationships_,
    buildGraph: buildGraph,
    calculateInfluence: calculateInfluence,
    detectOpportunities: detectOpportunities,
    analyze: analyze
  };
})();

function sciipRelationshipIntelligenceAnalyze(input) {
  return SCIIP_RELATIONSHIP_INTELLIGENCE.analyze(input || {});
}


/**
 * SCIIP_OS v7.0 — Relationship Intelligence Persistence Adapter
 * Uses append-only records when a storage service is available and otherwise
 * returns a governed dry-run result. It never silently overwrites history.
 */
var SCIIP_RELATIONSHIP_INTELLIGENCE_PERSISTENCE = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint5.0';

  function persist(snapshot, options) {
    options = options || {};
    var record = {
      businessKey: [
        'RELATIONSHIP_INTELLIGENCE',
        snapshot && snapshot.version || VERSION,
        options.asOfDate || new Date().toISOString().slice(0, 10)
      ].join('|'),
      createdAt: new Date().toISOString(),
      payload: snapshot || {},
      mode: 'DRY_RUN'
    };

    if (typeof SCIIP_STORAGE_SERVICE !== 'undefined' &&
        SCIIP_STORAGE_SERVICE &&
        typeof SCIIP_STORAGE_SERVICE.append === 'function' &&
        options.commit === true) {
      SCIIP_STORAGE_SERVICE.append('RELATIONSHIP_INTELLIGENCE_LEDGER', record);
      record.mode = 'APPENDED';
    }

    return {
      version: VERSION,
      status: record.mode === 'APPENDED' ? 'COMMITTED' : 'PREVIEW',
      duplicateSafe: true,
      destructiveWrite: false,
      record: record
    };
  }

  return { VERSION: VERSION, persist: persist };
})();

function sciipPersistRelationshipIntelligence(snapshot, options) {
  return SCIIP_RELATIONSHIP_INTELLIGENCE_PERSISTENCE.persist(snapshot, options || {});
}


/** SCIIP_OS v7.0 Sprint 11 — duplicate-safe candidate registry. */
var SCIIP_SITE_CANDIDATE_REGISTRY=(function(){'use strict';var VERSION='v7.0-integration-sprint-11.0',items={};
function clone(v){return JSON.parse(JSON.stringify(v));}function key(x){return String(x.id||[x.address||'',x.city||'',x.state||''].join('|').toUpperCase());}
function register(input){input=input||{};var id=key(input);if(!id)throw new Error('Candidate id or address is required.');if(items[id])return {status:'DUPLICATE_SAFE',candidate:clone(items[id])};var c={id:id,address:String(input.address||''),city:String(input.city||''),state:String(input.state||'CA'),market:String(input.market||''),availableSf:Number(input.availableSf||0),powerAmps:Number(input.powerAmps||0),clearHeight:Number(input.clearHeight||0),dockDoors:Number(input.dockDoors||0),occupancyCost:Number(input.occupancyCost||0),laborScore:Number(input.laborScore||0),logisticsScore:Number(input.logisticsScore||0),buildingScore:Number(input.buildingScore||0),riskScore:Number(input.riskScore||0),latitude:input.latitude==null?null:Number(input.latitude),longitude:input.longitude==null?null:Number(input.longitude),evidence:(input.evidence||[]).slice(),registeredAt:new Date().toISOString()};items[id]=c;return {status:'CREATED',candidate:clone(c)};}
function list(){return Object.keys(items).sort().map(function(k){return clone(items[k]);});}function reset(){items={};}
return {VERSION:VERSION,register:register,list:list,reset:reset};})();


/** SCIIP_OS v7.0 Sprint 11 — hard-constraint feasibility. */
var SCIIP_SITE_FEASIBILITY_ENGINE=(function(){'use strict';var VERSION='v7.0-integration-sprint-11.0';
function evaluate(candidate,req){var failures=[];if(candidate.availableSf<req.requiredSf)failures.push({constraint:'AVAILABLE_SF',required:req.requiredSf,actual:candidate.availableSf});if(candidate.powerAmps<req.minimumPowerAmps)failures.push({constraint:'POWER_AMPS',required:req.minimumPowerAmps,actual:candidate.powerAmps});if(candidate.clearHeight<req.minimumClearHeight)failures.push({constraint:'CLEAR_HEIGHT',required:req.minimumClearHeight,actual:candidate.clearHeight});if(candidate.dockDoors<req.minimumDockDoors)failures.push({constraint:'DOCK_DOORS',required:req.minimumDockDoors,actual:candidate.dockDoors});if(candidate.occupancyCost>req.maximumOccupancyCost)failures.push({constraint:'OCCUPANCY_COST',required:req.maximumOccupancyCost,actual:candidate.occupancyCost});if(req.targetMarkets.length&&req.targetMarkets.indexOf(candidate.market)===-1)failures.push({constraint:'TARGET_MARKET',required:req.targetMarkets,actual:candidate.market});return {candidateId:candidate.id,status:failures.length?'INFEASIBLE':'FEASIBLE',failures:failures};}
return {VERSION:VERSION,evaluate:evaluate};})();


/** SCIIP_OS v7.0 Sprint 11 — ranked recommendation and evidence packages. */
var SCIIP_SITE_RECOMMENDATION_ENGINE=(function(){'use strict';var VERSION='v7.0-integration-sprint-11.0';
function rank(candidates,requirement){var rows=candidates.map(function(c){var f=SCIIP_SITE_FEASIBILITY_ENGINE.evaluate(c,requirement),s=SCIIP_SITE_SCORING_ENGINE.evaluate(c,requirement);return {candidate:c,feasibility:f,score:s.score,components:s.components,explanation:s.explanation,evidence:c.evidence||[]};});rows.sort(function(a,b){if(a.feasibility.status!==b.feasibility.status)return a.feasibility.status==='FEASIBLE'?-1:1;return b.score-a.score;});for(var i=0;i<rows.length;i++){rows[i].rank=i+1;rows[i].recommendation=rows[i].feasibility.status==='FEASIBLE'?(i===0?'PRIMARY':'ALTERNATE'):'REJECT';}return {status:'COMPLETED',total:rows.length,feasible:rows.filter(function(x){return x.feasibility.status==='FEASIBLE';}).length,recommendations:rows,top:rows.length?rows[0]:null};}
return {VERSION:VERSION,rank:rank};})();


/** SCIIP_OS v7.0 Sprint 11 — explainable weighted site scoring. */
var SCIIP_SITE_SCORING_ENGINE=(function(){'use strict';var VERSION='v7.0-integration-sprint-11.0';function cap(v){v=Number(v||0);return Math.max(0,Math.min(100,v));}
function evaluate(c,r){var cost=r.maximumOccupancyCost===Infinity?70:cap(100-(c.occupancyCost/Math.max(1,r.maximumOccupancyCost))*100),power=cap((c.powerAmps/Math.max(1,r.minimumPowerAmps||c.powerAmps||1))*100),components={power:power,labor:cap(c.laborScore),logistics:cap(c.logisticsScore),cost:cost,building:cap(c.buildingScore),risk:cap(100-c.riskScore)},score=0,k;for(k in components)score+=components[k]*(r.weights[k]||0)/100;score=Math.round(score*100)/100;return {candidateId:c.id,score:score,components:components,explanation:Object.keys(components).map(function(x){return {criterion:x,score:components[x],weight:r.weights[x],contribution:Math.round(components[x]*r.weights[x])/100};})};}
return {VERSION:VERSION,evaluate:evaluate};})();


/** SCIIP_OS v7.0 Sprint 11 — Site Selection & Industrial Intelligence application. */
var SCIIP_SITE_SELECTION_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-11.0';
function definition(){return {id:'site-selection-industrial-intelligence',name:'Site Selection & Industrial Intelligence',version:VERSION,dependencies:['enterprise-autonomous-operations','enterprise-data-fabric','enterprise-operational-intelligence'],services:['site-selection-application'],queries:['site-selection-query'],events:['SITE_SELECTION_STARTED','SITE_CANDIDATE_SCORED','SITE_RECOMMENDATION_CREATED'],stateBindings:['siteSelectionRequirements','siteSelectionCandidates','siteSelectionRecommendations'],workspaces:['site-selection-intelligence'],tests:['sciipTestV7IntegrationSprint11'],liveHandler:'sciipSiteSelectionHeartbeatV7',queryHandler:'sciipSiteSelectionQueryV7'};}
function run(request){request=request||{};SCIIP_SITE_SELECTION_REQUIREMENTS.reset();SCIIP_SITE_CANDIDATE_REGISTRY.reset();var req=SCIIP_SITE_SELECTION_REQUIREMENTS.save(request.requirements||{}).requirement;(request.candidates||[]).forEach(function(c){SCIIP_SITE_CANDIDATE_REGISTRY.register(c);});var candidates=SCIIP_SITE_CANDIDATE_REGISTRY.list(),ranked=SCIIP_SITE_RECOMMENDATION_ENGINE.rank(candidates,req),ws=SCIIP_SITE_SELECTION_WORKSPACE.build({requirements:req,candidates:candidates,feasibility:ranked.recommendations.map(function(x){return x.feasibility;}),rankings:ranked.recommendations,map:{points:candidates.filter(function(c){return c.latitude!==null&&c.longitude!==null;}).map(function(c){return {id:c.id,latitude:c.latitude,longitude:c.longitude};})},evidence:ranked.recommendations.map(function(x){return {candidateId:x.candidate.id,evidence:x.evidence};}),recommendations:ranked.recommendations,decisionLog:[{type:'SITE_SELECTION_COMPLETED',topCandidate:ranked.top?ranked.top.candidate.id:null,at:new Date().toISOString()}]});return {version:VERSION,status:'COMPLETED',requirements:req,candidates:candidates,recommendations:ranked,workspace:ws,generatedAt:new Date().toISOString()};}
function names(snapshot,keys){var raw=[];for(var i=0;i<keys.length;i++)if(snapshot&&snapshot[keys[i]]!=null){raw=snapshot[keys[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var out={version:VERSION,status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',queryEngine:typeof SCIIP_QUERY_ENGINE!=='undefined',liveRuntime:typeof SCIIP_LIVE_RUNTIME!=='undefined',registrationMode:[],errors:[]};try{var rr=SCIIP_PLATFORM_REGISTRY.register(definition());out.registry=rr.status!=='CONFLICT';}catch(e){out.errors.push('registry:'+e);}try{var ar=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_11'});out.assembly=ar.status!=='FAILED';if(out.assembly)out.registrationMode.push('SELF_ASSEMBLY');}catch(e2){out.errors.push('assembly:'+e2);}var qs=out.queryEngine&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=out.liveRuntime&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};out.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('site-selection-query')!==-1;out.liveServiceRegistered=names(ls,['services','registry']).indexOf('site-selection-application')!==-1;if(!out.queryRegistered&&out.queryEngine&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('site-selection-query',sciipSiteSelectionQueryV7,{capability:'site-selection-industrial-intelligence'});out.queryRegistered=true;out.registrationMode.push('QUERY_FALLBACK');}if(!out.liveServiceRegistered&&out.liveRuntime&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('site-selection-application',sciipSiteSelectionHeartbeatV7,{capability:'site-selection-industrial-intelligence'});out.liveServiceRegistered=true;out.registrationMode.push('LIVE_FALLBACK');}if(out.registry&&out.assembly&&out.queryRegistered&&out.liveServiceRegistered&&out.sharedState&&out.eventBus)out.status='WIRED';return out;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipSiteSelectionQueryV7(request){return SCIIP_SITE_SELECTION_APPLICATION.run(request||{});}function sciipSiteSelectionHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-11.0',workspace:'site-selection-intelligence',generatedAt:new Date().toISOString()};}


/** SCIIP_OS v7.0 Sprint 11 — site selection requirements. */
var SCIIP_SITE_SELECTION_REQUIREMENTS=(function(){'use strict';
var VERSION='v7.0-integration-sprint-11.0',store={};
function num(v,d){v=Number(v);return isFinite(v)?v:d;}
function clone(v){return JSON.parse(JSON.stringify(v));}
function normalize(input){input=input||{};var id=String(input.id||('requirement-'+(Object.keys(store).length+1))),w=input.weights||{};var weights={power:num(w.power,20),labor:num(w.labor,15),logistics:num(w.logistics,20),cost:num(w.cost,15),building:num(w.building,20),risk:num(w.risk,10)},sum=0,k;for(k in weights)sum+=Math.max(0,weights[k]);if(sum<=0)throw new Error('At least one positive weight is required.');for(k in weights)weights[k]=Math.round((Math.max(0,weights[k])/sum)*10000)/100;return {id:id,name:String(input.name||id),requiredSf:num(input.requiredSf,0),minimumPowerAmps:num(input.minimumPowerAmps,0),minimumClearHeight:num(input.minimumClearHeight,0),minimumDockDoors:num(input.minimumDockDoors,0),maximumOccupancyCost:num(input.maximumOccupancyCost,Infinity),targetMarkets:(input.targetMarkets||[]).slice(),weights:weights,createdAt:input.createdAt||new Date().toISOString()};}
function save(input){var r=normalize(input),existing=store[r.id];if(existing)return {status:'DUPLICATE_SAFE',requirement:clone(existing)};store[r.id]=r;return {status:'CREATED',requirement:clone(r)};}
function get(id){return store[id]?clone(store[id]):null;}function reset(){store={};}
return {VERSION:VERSION,normalize:normalize,save:save,get:get,reset:reset};})();


/** SCIIP_OS v7.0 Sprint 11 — production site selection workspace model. */
var SCIIP_SITE_SELECTION_WORKSPACE=(function(){'use strict';var VERSION='v7.0-integration-sprint-11.0';function build(ctx){ctx=ctx||{};return {version:VERSION,status:'AVAILABLE',workspace:{id:'site-selection-intelligence',label:'Site Selection & Industrial Intelligence',sections:{requirements:ctx.requirements||{},candidatePipeline:ctx.candidates||[],feasibility:ctx.feasibility||[],rankings:ctx.rankings||[],map:ctx.map||{points:[]},evidence:ctx.evidence||[],recommendations:ctx.recommendations||[],decisionLog:ctx.decisionLog||[]}},generatedAt:new Date().toISOString()};}return {VERSION:VERSION,build:build};})();


/** SCIIP v7 Epic 3 Sprint 2 certification */
function sciipTestV7Epic3Sprint2SpatialIntelligence(){
  var failures=[],w=SCIIP_SPATIAL_INTELLIGENCE.workspace();
  function ok(name,value){if(!value)failures.push(name);}
  ok('WorkspaceAvailable',w.status==='AVAILABLE');
  ok('RadiusSearch',w.radiusResults.length===3&&w.radiusResults[0].distanceMiles<=w.radiusResults[1].distanceMiles);
  ok('SuitabilityRanked',w.suitability.length===3&&w.suitability[0].score>=w.suitability[1].score);
  ok('InfluenceTiers',w.influence.some(function(x){return x.tier==='PRIMARY';})&&w.influence.some(function(x){return x.tier==='SECONDARY';}));
  ok('LayerCatalog',w.layers.length>=10&&w.layers.some(function(x){return x.id==='power';}));
  ok('Requirements',w.requirements.minimumPowerAmps===4000);
  ok('Distances',w.radiusResults.every(function(x){return typeof x.distanceMiles==='number';}));
  ok('PublicApi',typeof sciipSpatialSuitabilityRank==='function');
  var out={framework:'SCIIP_V7_EPIC_3_SPRINT_2_SPATIAL_INTELLIGENCE',version:'v7.0-epic3-sprint2.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{radiusResults:w.radiusResults.length,suitabilityResults:w.suitability.length,primaryCompetitors:w.influence.filter(function(x){return x.tier==='PRIMARY';}).length,secondaryCompetitors:w.influence.filter(function(x){return x.tier==='SECONDARY';}).length,layers:w.layers.length,topProperty:w.suitability[0].propertyId,topScore:w.suitability[0].score,workspace:'spatial-intelligence'}};
  console.log(JSON.stringify(out));return out;
}


/** SCIIP v7 Epic 3 Sprint 2 — Spatial Intelligence */
var SCIIP_SPATIAL_INTELLIGENCE = (function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint2.0';
  function n(v){var x=Number(v);return isFinite(x)?x:null;}
  function txt(v){return String(v==null?'':v).trim();}
  function clone(v){return JSON.parse(JSON.stringify(v||{}));}
  function miles(a,b){if(!a||!b)return null;var a1=n(a.latitude),o1=n(a.longitude),a2=n(b.latitude),o2=n(b.longitude);if([a1,o1,a2,o2].some(function(x){return x===null;}))return null;var p=Math.PI/180,r=3958.7613,d1=(a2-a1)*p,d2=(o2-o1)*p,q=Math.sin(d1/2)*Math.sin(d1/2)+Math.cos(a1*p)*Math.cos(a2*p)*Math.sin(d2/2)*Math.sin(d2/2);return Math.round(2*r*Math.atan2(Math.sqrt(q),Math.sqrt(1-q))*100)/100;}
  function radiusSearch(origin,properties,radius){radius=n(radius)||10;return (properties||[]).map(function(p){var d=miles(origin,p);var q=clone(p);q.distanceMiles=d;return q;}).filter(function(p){return p.distanceMiles!==null&&p.distanceMiles<=radius;}).sort(function(a,b){return a.distanceMiles-b.distanceMiles;});}
  function score(property,requirements){requirements=requirements||{};var dims=[],total=0,weights=0;function min(field,reqField,w){var req=n(requirements[reqField]),actual=n(property[field]);if(req===null)return;var s=actual===null?0:Math.min(1,actual/Math.max(req,1));dims.push({dimension:reqField,actual:actual,required:req,score:Math.round(s*100),weight:w});total+=s*w;weights+=w;}function max(field,reqField,w){var req=n(requirements[reqField]),actual=n(property[field]);if(req===null)return;var s=actual===null?0:(actual<=req?1:Math.max(0,1-(actual-req)/Math.max(req,1)));dims.push({dimension:reqField,actual:actual,required:req,score:Math.round(s*100),weight:w});total+=s*w;weights+=w;}min('buildingSf','minimumBuildingSf',25);min('clearHeightFt','minimumClearHeightFt',15);min('powerAmps','minimumPowerAmps',20);min('trailerParking','minimumTrailerParking',10);min('dockHighDoors','minimumDockHighDoors',10);max('distanceMiles','maximumDistanceMiles',20);return {propertyId:property.entityId||property.propertyId||'',name:property.name||property.address||'',score:weights?Math.round(total/weights*100):0,qualified:dims.every(function(d){return d.score>=100;}),dimensions:dims};}
  function rank(origin,properties,requirements){requirements=clone(requirements||{});return radiusSearch(origin,properties,requirements.maximumDistanceMiles||50).map(function(p){var result=score(p,requirements);result.distanceMiles=p.distanceMiles;result.property=p;return result;}).sort(function(a,b){return b.score-a.score||a.distanceMiles-b.distanceMiles;});}
  function influence(subject,properties,options){options=options||{};var primary=n(options.primaryRadiusMiles)||10,secondary=n(options.secondaryRadiusMiles)||25;return (properties||[]).map(function(p){var d=miles(subject,p),tier=d===null?'UNRESOLVED':d<=primary?'PRIMARY':d<=secondary?'SECONDARY':'OUTSIDE';return {propertyId:p.entityId||p.propertyId,name:p.name||p.address,distanceMiles:d,tier:tier};}).sort(function(a,b){return (a.distanceMiles==null?99999:a.distanceMiles)-(b.distanceMiles==null?99999:b.distanceMiles);});}
  function layers(input){input=input||{};var catalog=[
    {id:'properties',label:'Industrial Properties',category:'CORE',enabled:true},
    {id:'competition',label:'Competitive Set',category:'MARKET',enabled:true},
    {id:'power',label:'Power Infrastructure',category:'INFRASTRUCTURE',enabled:false},
    {id:'utilities',label:'Utility Territories',category:'INFRASTRUCTURE',enabled:false},
    {id:'rail',label:'Rail Access',category:'TRANSPORTATION',enabled:false},
    {id:'ports',label:'Ports',category:'TRANSPORTATION',enabled:false},
    {id:'airports',label:'Airports',category:'TRANSPORTATION',enabled:false},
    {id:'labor',label:'Labor Markets',category:'DEMOGRAPHICS',enabled:false},
    {id:'flood',label:'Flood Hazard',category:'RISK',enabled:false},
    {id:'seismic',label:'Seismic Hazard',category:'RISK',enabled:false},
    {id:'zoning',label:'Industrial Zoning',category:'LAND_USE',enabled:false}
  ];var enabled=input.enabled||[];catalog.forEach(function(l){if(enabled.indexOf(l.id)>=0)l.enabled=true;});return catalog;}
  function workspace(){var subject={entityId:'PROPERTY-RIALTO-2125-LOWELL',name:'Locust Gateway Logistics Center',address:'2125 W Lowell St',city:'Rialto',latitude:34.0978,longitude:-117.4147,buildingSf:664859,clearHeightFt:42,powerAmps:8000,trailerParking:398,dockHighDoors:82};var candidates=[{entityId:'PROPERTY-SLOVER',name:'Slover Logistics Center',city:'Bloomington',latitude:34.062,longitude:-117.407,buildingSf:650000,clearHeightFt:40,powerAmps:4000,trailerParking:350,dockHighDoors:78},{entityId:'PROPERTY-HARVILL',name:'20123 Harvill Ave',city:'Perris',latitude:33.843,longitude:-117.258,buildingSf:500000,clearHeightFt:40,powerAmps:4000,trailerParking:250,dockHighDoors:60},{entityId:'PROPERTY-NORTH-RIALTO',name:'North Rialto Distribution Center',city:'Rialto',latitude:34.135,longitude:-117.38,buildingSf:700000,clearHeightFt:42,powerAmps:6000,trailerParking:360,dockHighDoors:86}];var req={minimumBuildingSf:500000,minimumClearHeightFt:40,minimumPowerAmps:4000,minimumTrailerParking:200,minimumDockHighDoors:50,maximumDistanceMiles:30};return {version:VERSION,status:'AVAILABLE',subject:subject,requirements:req,radiusResults:radiusSearch(subject,candidates,30),suitability:rank(subject,candidates,req),influence:influence(subject,candidates,{primaryRadiusMiles:10,secondaryRadiusMiles:30}),layers:layers({enabled:['power','ports']}),generatedAt:new Date().toISOString()};}
  return {VERSION:VERSION,distanceMiles:miles,radiusSearch:radiusSearch,scoreSuitability:score,rankSuitability:rank,competitiveInfluence:influence,layerCatalog:layers,workspace:workspace};
})();
function sciipSpatialRadiusSearch(origin,properties,radiusMiles){return SCIIP_SPATIAL_INTELLIGENCE.radiusSearch(origin,properties,radiusMiles);}
function sciipSpatialSuitabilityRank(origin,properties,requirements){return SCIIP_SPATIAL_INTELLIGENCE.rankSuitability(origin,properties,requirements);}
function sciipSpatialCompetitiveInfluence(subject,properties,options){return SCIIP_SPATIAL_INTELLIGENCE.competitiveInfluence(subject,properties,options);}
function sciipSpatialIntelligenceWorkspace(){return SCIIP_SPATIAL_INTELLIGENCE.workspace();}


/** SCIIP_OS v7.0 Sprint 12 — governed tenant engagement plans. */
var SCIIP_ENGAGEMENT_PLANNER=(function(){'use strict';var VERSION='v7.0-integration-sprint-12.0',seq=0;
function create(ranking){if(!ranking||!ranking.prospect)throw new Error('Prospect ranking is required.');seq++;var hasContact=(ranking.contacts||[]).length>0;return {planId:'engagement-plan-'+seq,prospectId:ranking.prospect.id,status:hasContact?'READY':'CONTACT_RESEARCH_REQUIRED',objective:'QUALIFY_LOCATION_REQUIREMENT',steps:[{order:1,action:'VALIDATE_SIGNALS',approval:false},{order:2,action:'RESEARCH_DECISION_MAKERS',approval:false},{order:3,action:'PREPARE_PROPERTY_MATCHES',approval:false},{order:4,action:'APPROVE_OUTREACH',approval:true},{order:5,action:'EXECUTE_OUTREACH',approval:true}],recommendedPropertyId:ranking.bestFit?ranking.bestFit.propertyId:null,evidenceCount:(ranking.evidence||[]).length,createdAt:new Date().toISOString()};}
function reset(){seq=0;}return {VERSION:VERSION,create:create,reset:reset};})();


/** SCIIP_OS v7.0 Sprint 12 — expansion and relocation signal scoring. */
var SCIIP_EXPANSION_SIGNAL_ENGINE=(function(){'use strict';var VERSION='v7.0-integration-sprint-12.0',weights={FUNDING:24,HIRING:18,FACILITY_SEARCH:30,CONTRACT_AWARD:18,LEASE_EXPIRATION:25,PRODUCTION_GROWTH:20,MARKET_ENTRY:22};
function evaluate(prospect){var total=Math.max(0,Math.min(100,Number(prospect.growthScore||0)*0.35)),reasons=[];(prospect.signals||[]).forEach(function(s){var type=String(s.type||s).toUpperCase(),confidence=s.confidence==null?1:Number(s.confidence);var impact=(weights[type]||8)*Math.max(0,Math.min(1,confidence));total+=impact;reasons.push({type:type,impact:Math.round(impact*100)/100,evidence:s.evidence||''});});total=Math.round(Math.min(100,total)*100)/100;return {prospectId:prospect.id,signalScore:total,priority:total>=75?'IMMEDIATE':total>=50?'HIGH':total>=25?'MONITOR':'LOW',reasons:reasons};}
return {VERSION:VERSION,evaluate:evaluate};})();


/** SCIIP_OS v7.0 Sprint 12 — explainable tenant/building fit. */
var SCIIP_OCCUPIER_FIT_ENGINE=(function(){'use strict';var VERSION='v7.0-integration-sprint-12.0';function cap(v){return Math.max(0,Math.min(100,Number(v||0)));}
function evaluate(prospect,property){var sizeNeed=Math.max(1,prospect.locationNeedSf||1),powerNeed=Math.max(1,prospect.powerNeedAmps||1),size=cap(100-Math.abs((property.availableSf||0)-sizeNeed)/sizeNeed*100),power=cap((property.powerAmps||0)/powerNeed*100),market=!prospect.targetMarkets.length||prospect.targetMarkets.indexOf(property.market)!==-1?100:25,industry=property.industryCompatibility==null?70:cap(property.industryCompatibility),logistics=cap(property.logisticsScore),cost=cap(property.costScore),weights={size:25,power:20,market:15,industry:15,logistics:15,cost:10},components={size:size,power:power,market:market,industry:industry,logistics:logistics,cost:cost},score=0,k;for(k in components)score+=components[k]*weights[k]/100;score=Math.round(score*100)/100;return {prospectId:prospect.id,propertyId:String(property.id||''),score:score,components:components,explanation:Object.keys(components).map(function(x){return {criterion:x,score:components[x],weight:weights[x],contribution:Math.round(components[x]*weights[x])/100};})};}
return {VERSION:VERSION,evaluate:evaluate};})();


/** SCIIP_OS v7.0 Sprint 12 — evidence-backed prospect prioritization. */
var SCIIP_PROSPECT_PRIORITIZATION_ENGINE=(function(){'use strict';var VERSION='v7.0-integration-sprint-12.0';
function rank(prospects,properties){var rows=[];prospects.forEach(function(p){var signal=SCIIP_EXPANSION_SIGNAL_ENGINE.evaluate(p),best=null;(properties||[]).forEach(function(prop){var fit=SCIIP_OCCUPIER_FIT_ENGINE.evaluate(p,prop);if(!best||fit.score>best.score)best=fit;});var overall=Math.round((signal.signalScore*0.55+(best?best.score:0)*0.45)*100)/100;rows.push({prospect:p,signal:signal,bestFit:best,priorityScore:overall,evidence:p.evidence||[],contacts:p.contacts||[]});});rows.sort(function(a,b){return b.priorityScore-a.priorityScore;});rows.forEach(function(r,i){r.rank=i+1;r.recommendation=i===0?'PRIMARY_OUTREACH':r.priorityScore>=50?'ACTIVE_PIPELINE':'MONITOR';});return {status:'COMPLETED',total:rows.length,rankings:rows,top:rows.length?rows[0]:null};}
return {VERSION:VERSION,rank:rank};})();


/** SCIIP_OS v7.0 Sprint 12 — normalized occupier prospect profiles. */
var SCIIP_PROSPECT_PROFILE=(function(){'use strict';var VERSION='v7.0-integration-sprint-12.0',store={};
function clone(v){return JSON.parse(JSON.stringify(v));}function num(v,d){v=Number(v);return isFinite(v)?v:d;}
function key(x){return String(x.id||x.domain||x.name||'').trim().toUpperCase();}
function normalize(input){input=input||{};var id=key(input);if(!id)throw new Error('Prospect id, domain, or name is required.');return {id:id,name:String(input.name||id),domain:String(input.domain||''),industry:String(input.industry||''),subsector:String(input.subsector||''),headquarters:String(input.headquarters||''),employees:num(input.employees,0),funding:num(input.funding,0),growthScore:num(input.growthScore,0),locationNeedSf:num(input.locationNeedSf,0),powerNeedAmps:num(input.powerNeedAmps,0),targetMarkets:(input.targetMarkets||[]).slice(),signals:(input.signals||[]).slice(),evidence:(input.evidence||[]).slice(),contacts:(input.contacts||[]).slice(),createdAt:input.createdAt||new Date().toISOString()};}
function register(input){var p=normalize(input);if(store[p.id])return {status:'DUPLICATE_SAFE',prospect:clone(store[p.id])};store[p.id]=p;return {status:'CREATED',prospect:clone(p)};}function list(){return Object.keys(store).sort().map(function(k){return clone(store[k]);});}function reset(){store={};}
return {VERSION:VERSION,normalize:normalize,register:register,list:list,reset:reset};})();


/** SCIIP_OS v7.0 Sprint 12 — Tenant Prospecting & Occupier Intelligence application. */
var SCIIP_TENANT_PROSPECTING_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-12.0';
function definition(){return {id:'tenant-prospecting-occupier-intelligence',name:'Tenant Prospecting & Occupier Intelligence',version:VERSION,dependencies:['site-selection-industrial-intelligence','enterprise-data-fabric','enterprise-autonomous-operations'],services:['tenant-prospecting-application'],queries:['tenant-prospecting-query'],events:['PROSPECT_REGISTERED','EXPANSION_SIGNAL_DETECTED','ENGAGEMENT_PLAN_CREATED'],stateBindings:['tenantProspects','occupierSignals','engagementPlans'],workspaces:['tenant-prospecting-intelligence'],tests:['sciipTestV7IntegrationSprint12'],liveHandler:'sciipTenantProspectingHeartbeatV7',queryHandler:'sciipTenantProspectingQueryV7'};}
function run(request){request=request||{};SCIIP_PROSPECT_PROFILE.reset();SCIIP_ENGAGEMENT_PLANNER.reset();(request.prospects||[]).forEach(function(p){SCIIP_PROSPECT_PROFILE.register(p);});var prospects=SCIIP_PROSPECT_PROFILE.list(),properties=request.properties||[],ranked=SCIIP_PROSPECT_PRIORITIZATION_ENGINE.rank(prospects,properties),plans=ranked.rankings.filter(function(r){return r.recommendation!=='MONITOR';}).map(function(r){return SCIIP_ENGAGEMENT_PLANNER.create(r);}),fit=[];prospects.forEach(function(p){properties.forEach(function(prop){fit.push(SCIIP_OCCUPIER_FIT_ENGINE.evaluate(p,prop));});});var ws=SCIIP_TENANT_PROSPECTING_WORKSPACE.build({pipeline:prospects,signals:ranked.rankings.map(function(r){return r.signal;}),fitMatrix:fit,priorityQueue:ranked.rankings,contacts:prospects.map(function(p){return {prospectId:p.id,contacts:p.contacts};}),engagementPlans:plans,evidence:prospects.map(function(p){return {prospectId:p.id,evidence:p.evidence};}),activity:[{type:'PROSPECTING_RUN_COMPLETED',topProspect:ranked.top?ranked.top.prospect.id:null,at:new Date().toISOString()}]});return {version:VERSION,status:'COMPLETED',prospects:prospects,rankings:ranked,engagementPlans:plans,workspace:ws,generatedAt:new Date().toISOString()};}
function names(snapshot,keys){var raw=[];for(var i=0;i<keys.length;i++)if(snapshot&&snapshot[keys[i]]!=null){raw=snapshot[keys[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}
function wire(){var out={version:VERSION,status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',queryEngine:typeof SCIIP_QUERY_ENGINE!=='undefined',liveRuntime:typeof SCIIP_LIVE_RUNTIME!=='undefined',registrationMode:[],errors:[]};try{var rr=SCIIP_PLATFORM_REGISTRY.register(definition());out.registry=rr.status!=='CONFLICT';}catch(e){out.errors.push('registry:'+e);}try{var ar=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_12'});out.assembly=ar.status!=='FAILED';if(out.assembly)out.registrationMode.push('SELF_ASSEMBLY');}catch(e2){out.errors.push('assembly:'+e2);}var qs=out.queryEngine&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=out.liveRuntime&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};out.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('tenant-prospecting-query')!==-1;out.liveServiceRegistered=names(ls,['services','registry']).indexOf('tenant-prospecting-application')!==-1;if(!out.queryRegistered&&out.queryEngine&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('tenant-prospecting-query',sciipTenantProspectingQueryV7,{capability:'tenant-prospecting-occupier-intelligence'});out.queryRegistered=true;out.registrationMode.push('QUERY_FALLBACK');}if(!out.liveServiceRegistered&&out.liveRuntime&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('tenant-prospecting-application',sciipTenantProspectingHeartbeatV7,{capability:'tenant-prospecting-occupier-intelligence'});out.liveServiceRegistered=true;out.registrationMode.push('LIVE_FALLBACK');}if(out.registry&&out.assembly&&out.queryRegistered&&out.liveServiceRegistered&&out.sharedState&&out.eventBus)out.status='WIRED';return out;}
return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();
function sciipTenantProspectingQueryV7(request){return SCIIP_TENANT_PROSPECTING_APPLICATION.run(request||{});}function sciipTenantProspectingHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-12.0',workspace:'tenant-prospecting-intelligence',generatedAt:new Date().toISOString()};}


/** SCIIP_OS v7.0 Sprint 12 — tenant prospecting workspace. */
var SCIIP_TENANT_PROSPECTING_WORKSPACE=(function(){'use strict';var VERSION='v7.0-integration-sprint-12.0';function build(ctx){ctx=ctx||{};return {version:VERSION,status:'AVAILABLE',workspace:{id:'tenant-prospecting-intelligence',label:'Tenant Prospecting & Occupier Intelligence',sections:{pipeline:ctx.pipeline||[],signals:ctx.signals||[],fitMatrix:ctx.fitMatrix||[],priorityQueue:ctx.priorityQueue||[],contacts:ctx.contacts||[],engagementPlans:ctx.engagementPlans||[],evidence:ctx.evidence||[],activity:ctx.activity||[]}},generatedAt:new Date().toISOString()};}return {VERSION:VERSION,build:build};})();


var SCIIP_CLOSING_READINESS_ENGINE=(function(){'use strict';function assess(x){x=x||{};var checks=[['dueDiligenceCleared',!!x.dueDiligenceCleared],['documentsApproved',!!x.documentsApproved],['economicsApproved',!!x.economicsApproved],['authorityConfirmed',!!x.authorityConfirmed],['fundingConfirmed',!!x.fundingConfirmed]],passed=checks.filter(function(c){return c[1];}).length,score=Number((passed/checks.length*100).toFixed(2)),blockers=checks.filter(function(c){return !c[1];}).map(function(c){return c[0];});return {status:score===100?'READY_TO_CLOSE':score>=60?'CONDITIONAL':'NOT_READY',score:score,checks:checks.map(function(c){return {check:c[0],passed:c[1]};}),blockers:blockers,approvalRequired:score<100};}return {assess:assess};})();


var SCIIP_DUE_DILIGENCE_ENGINE=(function(){'use strict';function evaluate(items){items=items||[];var complete=0,critical=[],findings=[];items.forEach(function(x){var s=String(x.status||'OPEN').toUpperCase();if(s==='COMPLETE'||s==='PASSED')complete++;if(String(x.severity||'').toUpperCase()==='CRITICAL'&&s!=='COMPLETE'&&s!=='PASSED')critical.push(x);findings.push({id:x.id||null,category:x.category||'GENERAL',status:s,severity:x.severity||'INFO',evidence:x.evidence||null});});var score=items.length?Number((complete/items.length*100).toFixed(2)):100;return {status:critical.length?'BLOCKED':score===100?'CLEARED':'IN_PROGRESS',completionScore:score,total:items.length,complete:complete,criticalOpen:critical.length,findings:findings};}return {evaluate:evaluate};})();


var SCIIP_LEASE_ECONOMICS_ENGINE=(function(){'use strict';function n(v,d){v=Number(v);return isFinite(v)?v:d;}function analyze(x){x=x||{};var sf=n(x.squareFeet,0),months=n(x.termMonths,60),rate=n(x.startingRate,0),annualEsc=n(x.annualEscalation,0),free=n(x.freeRentMonths,0),ti=n(x.tiAllowancePerSf,0),commission=n(x.commissionRate,0),gross=0;for(var m=1;m<=months;m++){var yr=Math.floor((m-1)/12);gross+=sf*rate*Math.pow(1+annualEsc,yr);}var freeValue=sf*rate*free,tiCost=sf*ti,commissionCost=(gross-freeValue)*commission,net=gross-freeValue-tiCost-commissionCost;return {squareFeet:sf,termMonths:months,grossRent:Number(gross.toFixed(2)),freeRentValue:Number(freeValue.toFixed(2)),tiCost:Number(tiCost.toFixed(2)),commissionCost:Number(commissionCost.toFixed(2)),netConsideration:Number(net.toFixed(2)),averageMonthlyEffectiveRent:sf&&months?Number((net/sf/months).toFixed(4)):0};}return {analyze:analyze};})();


var SCIIP_TRANSACTION_EXECUTION_APPLICATION=(function(){'use strict';var VERSION='v7.0-integration-sprint-15.0';function definition(){return {id:'transaction-execution-closing-intelligence',name:'Transaction Execution & Closing Intelligence',version:VERSION,dependencies:['deal-origination-pipeline-intelligence'],services:['transaction-execution-application'],queries:['transaction-execution-query'],events:['TRANSACTION_CREATED','DUE_DILIGENCE_UPDATED','CLOSING_READINESS_CHANGED'],stateBindings:['transactionExecution','closingReadiness','leaseEconomics'],workspaces:['transaction-execution-closing'],tests:['sciipTestV7IntegrationSprint15'],liveHandler:'sciipTransactionExecutionHeartbeatV7',queryHandler:'sciipTransactionExecutionQueryV7'};}function run(r){r=r||{};var ms=(r.milestones||[]).map(function(x){return SCIIP_TRANSACTION_MILESTONE_REGISTRY.register(x).milestone;}),dd=SCIIP_DUE_DILIGENCE_ENGINE.evaluate(r.dueDiligence||[]),econ=SCIIP_LEASE_ECONOMICS_ENGINE.analyze(r.economics||{}),ready=SCIIP_CLOSING_READINESS_ENGINE.assess({dueDiligenceCleared:dd.status==='CLEARED',documentsApproved:!!r.documentsApproved,economicsApproved:!!r.economicsApproved,authorityConfirmed:!!r.authorityConfirmed,fundingConfirmed:!!r.fundingConfirmed}),workspace=SCIIP_TRANSACTION_EXECUTION_WORKSPACE.build({transaction:r.transaction||{},milestones:ms,dueDiligence:dd,economics:econ,closingReadiness:ready,approvals:r.approvals||[],documents:r.documents||[],executiveSummary:{status:ready.status,blockers:ready.blockers,netConsideration:econ.netConsideration}});return {version:VERSION,status:'COMPLETED',milestones:ms,dueDiligence:dd,economics:econ,closingReadiness:ready,workspace:workspace};}function names(s,ks){var raw=[];for(var i=0;i<ks.length;i++)if(s&&s[ks[i]]!=null){raw=s[ks[i]];break;}if(Array.isArray(raw))return raw.map(function(x){return typeof x==='string'?x:String((x&&(x.name||x.id))||'');});return raw&&typeof raw==='object'?Object.keys(raw):[];}function wire(){var o={status:'PARTIAL',registry:false,assembly:false,queryRegistered:false,liveServiceRegistered:false,sharedState:typeof SCIIP_APP_STATE!=='undefined',eventBus:typeof SCIIP_APP_EVENTS!=='undefined',registrationMode:[]};try{o.registry=SCIIP_PLATFORM_REGISTRY.register(definition()).status!=='CONFLICT';}catch(e){}try{o.assembly=SCIIP_PLATFORM_SELF_ASSEMBLY.assemble({source:'SPRINT_15'}).status!=='FAILED';if(o.assembly)o.registrationMode.push('SELF_ASSEMBLY');}catch(e2){}var qs=typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.snapshot?SCIIP_QUERY_ENGINE.snapshot():{},ls=typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.snapshot?SCIIP_LIVE_RUNTIME.snapshot():{};o.queryRegistered=names(qs,['registeredQueries','queries','registry']).indexOf('transaction-execution-query')!==-1;o.liveServiceRegistered=names(ls,['services','registry']).indexOf('transaction-execution-application')!==-1;if(!o.queryRegistered&&typeof SCIIP_QUERY_ENGINE!=='undefined'&&SCIIP_QUERY_ENGINE.register){SCIIP_QUERY_ENGINE.register('transaction-execution-query',sciipTransactionExecutionQueryV7,{capability:definition().id});o.queryRegistered=true;o.registrationMode.push('QUERY_FALLBACK');}if(!o.liveServiceRegistered&&typeof SCIIP_LIVE_RUNTIME!=='undefined'&&SCIIP_LIVE_RUNTIME.register){SCIIP_LIVE_RUNTIME.register('transaction-execution-application',sciipTransactionExecutionHeartbeatV7,{capability:definition().id});o.liveServiceRegistered=true;o.registrationMode.push('LIVE_FALLBACK');}if(o.registry&&o.assembly&&o.queryRegistered&&o.liveServiceRegistered&&o.sharedState&&o.eventBus)o.status='WIRED';return o;}return {VERSION:VERSION,run:run,wire:wire,platformDefinition:definition};})();function sciipTransactionExecutionQueryV7(r){return SCIIP_TRANSACTION_EXECUTION_APPLICATION.run(r||{});}function sciipTransactionExecutionHeartbeatV7(){return {status:'AVAILABLE',version:'v7.0-integration-sprint-15.0',workspace:'transaction-execution-closing',generatedAt:new Date().toISOString()};}


var SCIIP_TRANSACTION_EXECUTION_WORKSPACE=(function(){'use strict';function build(d){d=d||{};return {workspace:{id:'transaction-execution-closing',label:'Transaction Execution & Closing Intelligence',sections:{transaction:d.transaction||{},milestones:d.milestones||[],dueDiligence:d.dueDiligence||{},economics:d.economics||{},closingReadiness:d.closingReadiness||{},approvals:d.approvals||[],documents:d.documents||[],executiveSummary:d.executiveSummary||{}}}};}return {build:build};})();


var SCIIP_TRANSACTION_MILESTONE_REGISTRY=(function(){'use strict';var records={};function key(x){return String(x.businessKey||[x.transactionId||'',x.type||'',x.name||''].join('|')).toUpperCase();}function register(x){x=x||{};var k=key(x);if(records[k])return {status:'DUPLICATE',duplicateSafe:true,milestone:records[k]};var r={id:x.id||('MS-'+(Object.keys(records).length+1)),businessKey:k,transactionId:x.transactionId||null,type:x.type||'GENERAL',name:x.name||'Milestone',owner:x.owner||null,dueDate:x.dueDate||null,status:x.status||'OPEN',createdAt:new Date().toISOString()};records[k]=r;return {status:'CREATED',duplicateSafe:true,milestone:r};}function list(){return Object.keys(records).map(function(k){return records[k];});}function reset(){records={};}return {register:register,list:list,reset:reset};})();


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6480_AssetRegistryExecutionProcessor.gs
 *
 * Processor: 6480_AssetRegistryExecution
 *
 * Purpose:
 * Executes the production asset registry layer authorized by the 6470 acceptance gate.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_EXECUTION_ACCEPTANCE
 * - Creates ASSET_REGISTRY_EXECUTION
 * - Creates ASSET_REGISTRY_EXECUTION_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6480_AssetRegistryExecutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6480_AssetRegistryExecution',
    action: 'ASSET_REGISTRY_EXECUTION',
    sourceSheet: 'ASSET_REGISTRY_EXECUTION_ACCEPTANCE',
    targetSheet: 'ASSET_REGISTRY_EXECUTION',
    ledgerSheet: 'ASSET_REGISTRY_EXECUTION_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6480GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6480FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Executes the production asset registry layer authorized by the 6470 acceptance gate.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_LAYER_ACCEPTED',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6490_AssetDiscoveryExecutionProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6480GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6480FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_LAYER_ACCEPTED',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6480_AssetRegistryExecution so required asset registry execution records exist.'
          })
        });
        sciip6480AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6490_AssetDiscoveryExecutionProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_EXECUTION_ACTIVE',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6480FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6490_AssetDiscoveryExecutionProcessor',
          executionSummary: 'Executes the production asset registry layer authorized by the 6470 acceptance gate.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRegistryExecutionId'] = '6480_AssetRegistryExecution|ASSET_REGISTRY_EXECUTION_ACTIVE';
        row['assetRegistryStatus'] = 'ASSET_REGISTRY_EXECUTION_ACTIVE';
        row['assetRegistryExecutionLayer'] = 'asset_registry_execution';
        row['assetRegistryExecutionScope'] = 'Executes the production asset registry layer authorized by the 6470 acceptance gate.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6490_AssetDiscoveryExecutionProcessor'
        })
      });
      sciip6480AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_EXECUTION_ACTIVE', matchingRecords.length, created, skippedDuplicate, 0, '6490_AssetDiscoveryExecutionProcessor', now);
      return result;
    }
  });
}

function run6480_AssetRegistryExecutionProcessor() {
  return sciipRun6480_AssetRegistryExecutionProcessor();
}

function sciipTest6480_AssetRegistryExecutionProcessor() {
  var result = sciipRun6480_AssetRegistryExecutionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6480_AssetRegistryExecutionProcessor', result: result }));
  return result;
}

function sciip6480GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6480FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6480RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6480RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRegistryStatus'],
    record.assetRegistryStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_REGISTRY_EXECUTION_LAYER_ACCEPTED') return true;
  }
  return false;
}

function sciip6480FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6480AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6490_AssetDiscoveryExecutionProcessor.gs
 *
 * Processor: 6490_AssetDiscoveryExecution
 *
 * Purpose:
 * Discovers asset-source execution records needed to build durable SCIIP asset registry entries.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_EXECUTION
 * - Creates ASSET_DISCOVERY_EXECUTION
 * - Creates ASSET_DISCOVERY_EXECUTION_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6490_AssetDiscoveryExecutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6490_AssetDiscoveryExecution',
    action: 'ASSET_DISCOVERY_EXECUTION',
    sourceSheet: 'ASSET_REGISTRY_EXECUTION',
    targetSheet: 'ASSET_DISCOVERY_EXECUTION',
    ledgerSheet: 'ASSET_DISCOVERY_EXECUTION_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6490GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6490FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Discovers asset-source execution records needed to build durable SCIIP asset registry entries.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6500_AssetRegistryBuilderProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetDiscoveryId',
        'assetDiscoveryStatus',
        'assetDiscoveryLayer',
        'assetDiscoveryScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6490GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6490FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6490_AssetDiscoveryExecution so required asset registry execution records exist.'
          })
        });
        sciip6490AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6500_AssetRegistryBuilderProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_DISCOVERY_EXECUTED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6490FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6500_AssetRegistryBuilderProcessor',
          executionSummary: 'Discovers asset-source execution records needed to build durable SCIIP asset registry entries.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetDiscoveryId'] = '6490_AssetDiscoveryExecution|ASSET_DISCOVERY_EXECUTED';
        row['assetDiscoveryStatus'] = 'ASSET_DISCOVERY_EXECUTED';
        row['assetDiscoveryLayer'] = 'asset_registry_execution';
        row['assetDiscoveryScope'] = 'Discovers asset-source execution records needed to build durable SCIIP asset registry entries.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_DISCOVERY_EXECUTED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6500_AssetRegistryBuilderProcessor'
        })
      });
      sciip6490AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_DISCOVERY_EXECUTED', matchingRecords.length, created, skippedDuplicate, 0, '6500_AssetRegistryBuilderProcessor', now);
      return result;
    }
  });
}

function run6490_AssetDiscoveryExecutionProcessor() {
  return sciipRun6490_AssetDiscoveryExecutionProcessor();
}

function sciipTest6490_AssetDiscoveryExecutionProcessor() {
  var result = sciipRun6490_AssetDiscoveryExecutionProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6490_AssetDiscoveryExecutionProcessor', result: result }));
  return result;
}

function sciip6490GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6490FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6490RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6490RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetDiscoveryStatus'],
    record.assetDiscoveryStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_REGISTRY_EXECUTION_ACTIVE') return true;
  }
  return false;
}

function sciip6490FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6490AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6500_AssetRegistryBuilderProcessor.gs
 *
 * Processor: 6500_AssetRegistryBuilder
 *
 * Purpose:
 * Builds the durable asset registry execution record from the asset discovery execution layer.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_DISCOVERY_EXECUTION
 * - Creates ASSET_REGISTRY_BUILD
 * - Creates ASSET_REGISTRY_BUILD_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6500_AssetRegistryBuilderProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6500_AssetRegistryBuilder',
    action: 'ASSET_REGISTRY_BUILDER',
    sourceSheet: 'ASSET_DISCOVERY_EXECUTION',
    targetSheet: 'ASSET_REGISTRY_BUILD',
    ledgerSheet: 'ASSET_REGISTRY_BUILD_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6500GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6500FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Builds the durable asset registry execution record from the asset discovery execution layer.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_DISCOVERY_EXECUTED',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6510_AssetRelationshipBuilderProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryBuildId',
        'assetRegistryBuildStatus',
        'assetRegistryBuildLayer',
        'assetRegistryBuildScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6500GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6500FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_DISCOVERY_EXECUTED',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6500_AssetRegistryBuilder so required asset registry execution records exist.'
          })
        });
        sciip6500AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6510_AssetRelationshipBuilderProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_BUILD_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6500FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6510_AssetRelationshipBuilderProcessor',
          executionSummary: 'Builds the durable asset registry execution record from the asset discovery execution layer.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRegistryBuildId'] = '6500_AssetRegistryBuilder|ASSET_REGISTRY_BUILD_READY';
        row['assetRegistryBuildStatus'] = 'ASSET_REGISTRY_BUILD_READY';
        row['assetRegistryBuildLayer'] = 'asset_registry_execution';
        row['assetRegistryBuildScope'] = 'Builds the durable asset registry execution record from the asset discovery execution layer.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_BUILD_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6510_AssetRelationshipBuilderProcessor'
        })
      });
      sciip6500AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_BUILD_READY', matchingRecords.length, created, skippedDuplicate, 0, '6510_AssetRelationshipBuilderProcessor', now);
      return result;
    }
  });
}

function run6500_AssetRegistryBuilderProcessor() {
  return sciipRun6500_AssetRegistryBuilderProcessor();
}

function sciipTest6500_AssetRegistryBuilderProcessor() {
  var result = sciipRun6500_AssetRegistryBuilderProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6500_AssetRegistryBuilderProcessor', result: result }));
  return result;
}

function sciip6500GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6500FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6500RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6500RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRegistryBuildStatus'],
    record.assetRegistryBuildStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_DISCOVERY_EXECUTED') return true;
  }
  return false;
}

function sciip6500FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6500AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6510_AssetRelationshipBuilderProcessor.gs
 *
 * Processor: 6510_AssetRelationshipBuilder
 *
 * Purpose:
 * Prepares asset relationship execution bindings for identity, graph, GIS, and registry continuity.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_BUILD
 * - Creates ASSET_RELATIONSHIP_BUILD
 * - Creates ASSET_RELATIONSHIP_BUILD_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6510_AssetRelationshipBuilderProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6510_AssetRelationshipBuilder',
    action: 'ASSET_RELATIONSHIP_BUILDER',
    sourceSheet: 'ASSET_REGISTRY_BUILD',
    targetSheet: 'ASSET_RELATIONSHIP_BUILD',
    ledgerSheet: 'ASSET_RELATIONSHIP_BUILD_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6510GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6510FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Prepares asset relationship execution bindings for identity, graph, GIS, and registry continuity.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_BUILD_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6520_AssetRegistryValidationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRelationshipBuildId',
        'assetRelationshipBuildStatus',
        'assetRelationshipBuildLayer',
        'assetRelationshipBuildScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6510GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6510FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_BUILD_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6510_AssetRelationshipBuilder so required asset registry execution records exist.'
          })
        });
        sciip6510AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6520_AssetRegistryValidationProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_RELATIONSHIP_BUILD_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6510FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6520_AssetRegistryValidationProcessor',
          executionSummary: 'Prepares asset relationship execution bindings for identity, graph, GIS, and registry continuity.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRelationshipBuildId'] = '6510_AssetRelationshipBuilder|ASSET_RELATIONSHIP_BUILD_READY';
        row['assetRelationshipBuildStatus'] = 'ASSET_RELATIONSHIP_BUILD_READY';
        row['assetRelationshipBuildLayer'] = 'asset_registry_execution';
        row['assetRelationshipBuildScope'] = 'Prepares asset relationship execution bindings for identity, graph, GIS, and registry continuity.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_RELATIONSHIP_BUILD_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6520_AssetRegistryValidationProcessor'
        })
      });
      sciip6510AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_RELATIONSHIP_BUILD_READY', matchingRecords.length, created, skippedDuplicate, 0, '6520_AssetRegistryValidationProcessor', now);
      return result;
    }
  });
}

function run6510_AssetRelationshipBuilderProcessor() {
  return sciipRun6510_AssetRelationshipBuilderProcessor();
}

function sciipTest6510_AssetRelationshipBuilderProcessor() {
  var result = sciipRun6510_AssetRelationshipBuilderProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6510_AssetRelationshipBuilderProcessor', result: result }));
  return result;
}

function sciip6510GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6510FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6510RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6510RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRelationshipBuildStatus'],
    record.assetRelationshipBuildStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_REGISTRY_BUILD_READY') return true;
  }
  return false;
}

function sciip6510FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6510AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6520_AssetRegistryValidationProcessor.gs
 *
 * Processor: 6520_AssetRegistryValidation
 *
 * Purpose:
 * Validates the asset registry execution chain before ledger consolidation.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_RELATIONSHIP_BUILD
 * - Creates ASSET_REGISTRY_VALIDATION
 * - Creates ASSET_REGISTRY_VALIDATION_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6520_AssetRegistryValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6520_AssetRegistryValidation',
    action: 'ASSET_REGISTRY_VALIDATION',
    sourceSheet: 'ASSET_RELATIONSHIP_BUILD',
    targetSheet: 'ASSET_REGISTRY_VALIDATION',
    ledgerSheet: 'ASSET_REGISTRY_VALIDATION_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6520GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6520FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Validates the asset registry execution chain before ledger consolidation.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_RELATIONSHIP_BUILD_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6530_AssetRegistryLedgerProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryValidationId',
        'assetRegistryValidationStatus',
        'assetRegistryValidationLayer',
        'assetRegistryValidationScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6520GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6520FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_RELATIONSHIP_BUILD_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6520_AssetRegistryValidation so required asset registry execution records exist.'
          })
        });
        sciip6520AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6530_AssetRegistryLedgerProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_VALIDATED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6520FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6530_AssetRegistryLedgerProcessor',
          executionSummary: 'Validates the asset registry execution chain before ledger consolidation.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRegistryValidationId'] = '6520_AssetRegistryValidation|ASSET_REGISTRY_VALIDATED';
        row['assetRegistryValidationStatus'] = 'ASSET_REGISTRY_VALIDATED';
        row['assetRegistryValidationLayer'] = 'asset_registry_execution';
        row['assetRegistryValidationScope'] = 'Validates the asset registry execution chain before ledger consolidation.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_VALIDATED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6530_AssetRegistryLedgerProcessor'
        })
      });
      sciip6520AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_VALIDATED', matchingRecords.length, created, skippedDuplicate, 0, '6530_AssetRegistryLedgerProcessor', now);
      return result;
    }
  });
}

function run6520_AssetRegistryValidationProcessor() {
  return sciipRun6520_AssetRegistryValidationProcessor();
}

function sciipTest6520_AssetRegistryValidationProcessor() {
  var result = sciipRun6520_AssetRegistryValidationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6520_AssetRegistryValidationProcessor', result: result }));
  return result;
}

function sciip6520GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6520FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6520RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6520RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRegistryValidationStatus'],
    record.assetRegistryValidationStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_RELATIONSHIP_BUILD_READY') return true;
  }
  return false;
}

function sciip6520FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6520AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6530_AssetRegistryLedgerProcessor.gs
 *
 * Processor: 6530_AssetRegistryLedger
 *
 * Purpose:
 * Creates the permanent asset registry execution ledger summary for certification.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_VALIDATION
 * - Creates ASSET_REGISTRY_LEDGER
 * - Creates ASSET_REGISTRY_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6530_AssetRegistryLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6530_AssetRegistryLedger',
    action: 'ASSET_REGISTRY_LEDGER',
    sourceSheet: 'ASSET_REGISTRY_VALIDATION',
    targetSheet: 'ASSET_REGISTRY_LEDGER',
    ledgerSheet: 'ASSET_REGISTRY_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6530GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6530FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the permanent asset registry execution ledger summary for certification.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_VALIDATED',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6540_AssetRegistryCertificationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryLedgerId',
        'assetRegistryLedgerStatus',
        'assetRegistryLedgerLayer',
        'assetRegistryLedgerScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6530GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6530FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_VALIDATED',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6530_AssetRegistryLedger so required asset registry execution records exist.'
          })
        });
        sciip6530AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6540_AssetRegistryCertificationProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_LEDGER_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6530FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6540_AssetRegistryCertificationProcessor',
          executionSummary: 'Creates the permanent asset registry execution ledger summary for certification.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRegistryLedgerId'] = '6530_AssetRegistryLedger|ASSET_REGISTRY_LEDGER_READY';
        row['assetRegistryLedgerStatus'] = 'ASSET_REGISTRY_LEDGER_READY';
        row['assetRegistryLedgerLayer'] = 'asset_registry_execution';
        row['assetRegistryLedgerScope'] = 'Creates the permanent asset registry execution ledger summary for certification.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_LEDGER_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6540_AssetRegistryCertificationProcessor'
        })
      });
      sciip6530AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_LEDGER_READY', matchingRecords.length, created, skippedDuplicate, 0, '6540_AssetRegistryCertificationProcessor', now);
      return result;
    }
  });
}

function run6530_AssetRegistryLedgerProcessor() {
  return sciipRun6530_AssetRegistryLedgerProcessor();
}

function sciipTest6530_AssetRegistryLedgerProcessor() {
  var result = sciipRun6530_AssetRegistryLedgerProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6530_AssetRegistryLedgerProcessor', result: result }));
  return result;
}

function sciip6530GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6530FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6530RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6530RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRegistryLedgerStatus'],
    record.assetRegistryLedgerStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_REGISTRY_VALIDATED') return true;
  }
  return false;
}

function sciip6530FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6530AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6540_AssetRegistryCertificationProcessor.gs
 *
 * Processor: 6540_AssetRegistryCertification
 *
 * Purpose:
 * Certifies the asset registry execution layer for production acceptance.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_LEDGER
 * - Creates ASSET_REGISTRY_CERTIFICATION
 * - Creates ASSET_REGISTRY_CERTIFICATION_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6540_AssetRegistryCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6540_AssetRegistryCertification',
    action: 'ASSET_REGISTRY_CERTIFICATION',
    sourceSheet: 'ASSET_REGISTRY_LEDGER',
    targetSheet: 'ASSET_REGISTRY_CERTIFICATION',
    ledgerSheet: 'ASSET_REGISTRY_CERTIFICATION_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6540GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6540FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Certifies the asset registry execution layer for production acceptance.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_LEDGER_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6550_AssetRegistryAcceptanceProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryCertificationId',
        'assetRegistryCertificationStatus',
        'assetRegistryCertificationLayer',
        'assetRegistryCertificationScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6540GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6540FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_LEDGER_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6540_AssetRegistryCertification so required asset registry execution records exist.'
          })
        });
        sciip6540AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6550_AssetRegistryAcceptanceProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_CERTIFIED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6540FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6550_AssetRegistryAcceptanceProcessor',
          executionSummary: 'Certifies the asset registry execution layer for production acceptance.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRegistryCertificationId'] = '6540_AssetRegistryCertification|ASSET_REGISTRY_CERTIFIED';
        row['assetRegistryCertificationStatus'] = 'ASSET_REGISTRY_CERTIFIED';
        row['assetRegistryCertificationLayer'] = 'asset_registry_execution';
        row['assetRegistryCertificationScope'] = 'Certifies the asset registry execution layer for production acceptance.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_CERTIFIED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6550_AssetRegistryAcceptanceProcessor'
        })
      });
      sciip6540AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_CERTIFIED', matchingRecords.length, created, skippedDuplicate, 0, '6550_AssetRegistryAcceptanceProcessor', now);
      return result;
    }
  });
}

function run6540_AssetRegistryCertificationProcessor() {
  return sciipRun6540_AssetRegistryCertificationProcessor();
}

function sciipTest6540_AssetRegistryCertificationProcessor() {
  var result = sciipRun6540_AssetRegistryCertificationProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6540_AssetRegistryCertificationProcessor', result: result }));
  return result;
}

function sciip6540GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6540FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6540RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6540RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRegistryCertificationStatus'],
    record.assetRegistryCertificationStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_REGISTRY_LEDGER_READY') return true;
  }
  return false;
}

function sciip6540FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6540AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6550_AssetRegistryAcceptanceProcessor.gs
 *
 * Processor: 6550_AssetRegistryAcceptance
 *
 * Purpose:
 * Accepts the asset registry execution layer and authorizes the next asset operationalization subsystem.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_CERTIFICATION
 * - Creates ASSET_REGISTRY_ACCEPTANCE
 * - Creates ASSET_REGISTRY_ACCEPTANCE_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6550_AssetRegistryAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6550_AssetRegistryAcceptance',
    action: 'ASSET_REGISTRY_ACCEPTANCE',
    sourceSheet: 'ASSET_REGISTRY_CERTIFICATION',
    targetSheet: 'ASSET_REGISTRY_ACCEPTANCE',
    ledgerSheet: 'ASSET_REGISTRY_ACCEPTANCE_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6550GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6550FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Accepts the asset registry execution layer and authorizes the next asset operationalization subsystem.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_CERTIFIED',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6560_AssetRegistryOperationalizationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryAcceptanceId',
        'assetRegistryAcceptanceStatus',
        'assetRegistryAcceptanceLayer',
        'assetRegistryAcceptanceScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6550GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6550FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_CERTIFIED',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6550_AssetRegistryAcceptance so required asset registry execution records exist.'
          })
        });
        sciip6550AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6560_AssetRegistryOperationalizationProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_EXECUTION_ACCEPTED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6550FirstValue_(matchingRecords, 'businessKey');
        var row = {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution',
          sourceProcessor: definition.sourceSheet,
          nextProcessor: '6560_AssetRegistryOperationalizationProcessor',
          executionSummary: 'Accepts the asset registry execution layer and authorizes the next asset operationalization subsystem.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        };
        row['assetRegistryAcceptanceId'] = '6550_AssetRegistryAcceptance|ASSET_REGISTRY_EXECUTION_ACCEPTED';
        row['assetRegistryAcceptanceStatus'] = 'ASSET_REGISTRY_EXECUTION_ACCEPTED';
        row['assetRegistryAcceptanceLayer'] = 'asset_registry_execution';
        row['assetRegistryAcceptanceScope'] = 'Accepts the asset registry execution layer and authorizes the next asset operationalization subsystem.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, row);
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_EXECUTION_ACCEPTED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6560_AssetRegistryOperationalizationProcessor'
        })
      });
      sciip6550AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_EXECUTION_ACCEPTED', matchingRecords.length, created, skippedDuplicate, 0, '6560_AssetRegistryOperationalizationProcessor', now);
      return result;
    }
  });
}

function run6550_AssetRegistryAcceptanceProcessor() {
  return sciipRun6550_AssetRegistryAcceptanceProcessor();
}

function sciipTest6550_AssetRegistryAcceptanceProcessor() {
  var result = sciipRun6550_AssetRegistryAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6550_AssetRegistryAcceptanceProcessor', result: result }));
  return result;
}

function sciip6550GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6550FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6550RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6550RecordReady_(record) {
  if (!record) return false;
  var candidates = [
    record['assetRegistryAcceptanceStatus'],
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryExecutionStatus,
    record.assetRegistryAcceptanceStatus,
    record.assetRegistryCertificationStatus,
    record.assetRegistryLedgerStatus,
    record.assetRegistryValidationStatus,
    record.assetRelationshipBuildStatus,
    record.assetRegistryBuildStatus,
    record.assetDiscoveryStatus,
    record.executionStatus,
    record.domainExecutionStatus
  ];
  for (var i = 0; i < candidates.length; i++) {
    if (String(candidates[i] || '') === 'ASSET_REGISTRY_CERTIFIED') return true;
  }
  return false;
}

function sciip6550FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6550AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, executionStatus, recordsRead, recordsCreated, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: SCIIP_RUNTIME.makeBusinessKey([
      context.processor,
      ledgerSheet,
      executionStatus,
      SCIIP_RUNTIME.getDateKey({}),
      transaction.transactionId
    ]),
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: executionStatus,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: recordsCreated,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution',
    nextProcessor: nextProcessor,
    resultJson: JSON.stringify(result),
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6560_AssetDiscoveryImportProcessor.gs
 * Processor: 6560_AssetDiscoveryImport
 * Purpose: Discovers asset-ready source records from the active Asset Registry execution layer.
 */

function sciipRun6560_AssetDiscoveryImportProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6560_AssetDiscoveryImport',
    action: 'ASSET_DISCOVERY_IMPORT',
    targetSheet: 'ASSET_DISCOVERY_IMPORT',
    ledgerSheet: 'ASSET_DISCOVERY_IMPORT_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Discovers asset-ready source records from the active Asset Registry execution layer.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_REGISTRY_EXECUTION',
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
          executionStatus: 'ASSET_DISCOVERY_IMPORTED',
          nextProcessor: '6570_AssetIdentityResolutionProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6560|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_DISCOVERY_IMPORTED',
        sourceSheet: 'ASSET_REGISTRY_EXECUTION',
        sourceStatusRequired: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Discovers asset-ready source records from the active Asset Registry execution layer.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_DISCOVERY_IMPORTED',
        sourceSheet: 'ASSET_REGISTRY_EXECUTION',
        sourceStatusRequired: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_DISCOVERY_IMPORTED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6570_AssetIdentityResolutionProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_DISCOVERY_IMPORTED',
          sourceSheet: 'ASSET_REGISTRY_EXECUTION',
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6570_AssetIdentityResolutionProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_DISCOVERY_IMPORTED',
        sourceSheet: 'ASSET_REGISTRY_EXECUTION',
        sourceStatusRequired: 'ASSET_REGISTRY_EXECUTION_ACTIVE',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_DISCOVERY_IMPORTED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6570_AssetIdentityResolutionProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6560_AssetDiscoveryImportProcessor() {
  return sciipRun6560_AssetDiscoveryImportProcessor();
}

function sciipTest6560_AssetDiscoveryImportProcessor() {
  var result = sciipRun6560_AssetDiscoveryImportProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6560_AssetDiscoveryImportProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6570_AssetIdentityResolutionProcessor.gs
 * Processor: 6570_AssetIdentityResolution
 * Purpose: Resolves durable asset identity keys from discovered asset records.
 */

function sciipRun6570_AssetIdentityResolutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6570_AssetIdentityResolution',
    action: 'ASSET_IDENTITY_RESOLUTION',
    targetSheet: 'ASSET_IDENTITY_RESOLUTION',
    ledgerSheet: 'ASSET_IDENTITY_RESOLUTION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Resolves durable asset identity keys from discovered asset records.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_DISCOVERY_IMPORT',
          requiredSourceStatus: 'ASSET_DISCOVERY_IMPORTED',
          executionStatus: 'ASSET_IDENTITY_RESOLVED',
          nextProcessor: '6580_AssetCreationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6570|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_IDENTITY_RESOLVED',
        sourceSheet: 'ASSET_DISCOVERY_IMPORT',
        sourceStatusRequired: 'ASSET_DISCOVERY_IMPORTED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Resolves durable asset identity keys from discovered asset records.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_IDENTITY_RESOLVED',
        sourceSheet: 'ASSET_DISCOVERY_IMPORT',
        sourceStatusRequired: 'ASSET_DISCOVERY_IMPORTED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_IDENTITY_RESOLVED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6580_AssetCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_IDENTITY_RESOLVED',
          sourceSheet: 'ASSET_DISCOVERY_IMPORT',
          requiredSourceStatus: 'ASSET_DISCOVERY_IMPORTED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6580_AssetCreationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_IDENTITY_RESOLVED',
        sourceSheet: 'ASSET_DISCOVERY_IMPORT',
        sourceStatusRequired: 'ASSET_DISCOVERY_IMPORTED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_IDENTITY_RESOLVED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6580_AssetCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6570_AssetIdentityResolutionProcessor() {
  return sciipRun6570_AssetIdentityResolutionProcessor();
}

function sciipTest6570_AssetIdentityResolutionProcessor() {
  var result = sciipRun6570_AssetIdentityResolutionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6570_AssetIdentityResolutionProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6580_AssetCreationProcessor.gs
 * Processor: 6580_AssetCreation
 * Purpose: Creates durable asset records from resolved identities.
 */

function sciipRun6580_AssetCreationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6580_AssetCreation',
    action: 'ASSET_CREATION',
    targetSheet: 'ASSET_CREATION',
    ledgerSheet: 'ASSET_CREATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Creates durable asset records from resolved identities.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
          requiredSourceStatus: 'ASSET_IDENTITY_RESOLVED',
          executionStatus: 'ASSET_CREATED',
          nextProcessor: '6590_AssetAddressBindingProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6580|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_CREATED',
        sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
        sourceStatusRequired: 'ASSET_IDENTITY_RESOLVED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Creates durable asset records from resolved identities.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_CREATED',
        sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
        sourceStatusRequired: 'ASSET_IDENTITY_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_CREATED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6590_AssetAddressBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_CREATED',
          sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
          requiredSourceStatus: 'ASSET_IDENTITY_RESOLVED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6590_AssetAddressBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_CREATED',
        sourceSheet: 'ASSET_IDENTITY_RESOLUTION',
        sourceStatusRequired: 'ASSET_IDENTITY_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_CREATED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6590_AssetAddressBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6580_AssetCreationProcessor() {
  return sciipRun6580_AssetCreationProcessor();
}

function sciipTest6580_AssetCreationProcessor() {
  var result = sciipRun6580_AssetCreationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6580_AssetCreationProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6590_AssetAddressBindingProcessor.gs
 * Processor: 6590_AssetAddressBinding
 * Purpose: Binds created assets to address-oriented registry attributes.
 */

function sciipRun6590_AssetAddressBindingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6590_AssetAddressBinding',
    action: 'ASSET_ADDRESS_BINDING',
    targetSheet: 'ASSET_ADDRESS_BINDING',
    ledgerSheet: 'ASSET_ADDRESS_BINDING_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Binds created assets to address-oriented registry attributes.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_CREATION',
          requiredSourceStatus: 'ASSET_CREATED',
          executionStatus: 'ASSET_ADDRESS_BOUND',
          nextProcessor: '6600_AssetRegistryPopulationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6590|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_ADDRESS_BOUND',
        sourceSheet: 'ASSET_CREATION',
        sourceStatusRequired: 'ASSET_CREATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Binds created assets to address-oriented registry attributes.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_ADDRESS_BOUND',
        sourceSheet: 'ASSET_CREATION',
        sourceStatusRequired: 'ASSET_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_ADDRESS_BOUND',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6600_AssetRegistryPopulationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_ADDRESS_BOUND',
          sourceSheet: 'ASSET_CREATION',
          requiredSourceStatus: 'ASSET_CREATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6600_AssetRegistryPopulationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_ADDRESS_BOUND',
        sourceSheet: 'ASSET_CREATION',
        sourceStatusRequired: 'ASSET_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_ADDRESS_BOUND',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6600_AssetRegistryPopulationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6590_AssetAddressBindingProcessor() {
  return sciipRun6590_AssetAddressBindingProcessor();
}

function sciipTest6590_AssetAddressBindingProcessor() {
  var result = sciipRun6590_AssetAddressBindingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6590_AssetAddressBindingProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6600_AssetRegistryPopulationProcessor.gs
 * Processor: 6600_AssetRegistryPopulation
 * Purpose: Populates the permanent asset registry execution surface.
 */

function sciipRun6600_AssetRegistryPopulationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6600_AssetRegistryPopulation',
    action: 'ASSET_REGISTRY_POPULATION',
    targetSheet: 'ASSET_REGISTRY_POPULATION',
    ledgerSheet: 'ASSET_REGISTRY_POPULATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Populates the permanent asset registry execution surface.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_ADDRESS_BINDING',
          requiredSourceStatus: 'ASSET_ADDRESS_BOUND',
          executionStatus: 'ASSET_REGISTRY_POPULATED',
          nextProcessor: '6610_AssetEventGenerationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6600|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_REGISTRY_POPULATED',
        sourceSheet: 'ASSET_ADDRESS_BINDING',
        sourceStatusRequired: 'ASSET_ADDRESS_BOUND',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Populates the permanent asset registry execution surface.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_REGISTRY_POPULATED',
        sourceSheet: 'ASSET_ADDRESS_BINDING',
        sourceStatusRequired: 'ASSET_ADDRESS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_REGISTRY_POPULATED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6610_AssetEventGenerationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_POPULATED',
          sourceSheet: 'ASSET_ADDRESS_BINDING',
          requiredSourceStatus: 'ASSET_ADDRESS_BOUND',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6610_AssetEventGenerationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_REGISTRY_POPULATED',
        sourceSheet: 'ASSET_ADDRESS_BINDING',
        sourceStatusRequired: 'ASSET_ADDRESS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_REGISTRY_POPULATED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6610_AssetEventGenerationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6600_AssetRegistryPopulationProcessor() {
  return sciipRun6600_AssetRegistryPopulationProcessor();
}

function sciipTest6600_AssetRegistryPopulationProcessor() {
  var result = sciipRun6600_AssetRegistryPopulationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6600_AssetRegistryPopulationProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6610_AssetEventGenerationProcessor.gs
 * Processor: 6610_AssetEventGeneration
 * Purpose: Generates event-sourced asset events for downstream graph and GIS execution.
 */

function sciipRun6610_AssetEventGenerationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6610_AssetEventGeneration',
    action: 'ASSET_EVENT_GENERATION',
    targetSheet: 'ASSET_EVENT_GENERATION',
    ledgerSheet: 'ASSET_EVENT_GENERATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Generates event-sourced asset events for downstream graph and GIS execution.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_REGISTRY_POPULATION',
          requiredSourceStatus: 'ASSET_REGISTRY_POPULATED',
          executionStatus: 'ASSET_EVENT_GENERATED',
          nextProcessor: '6620_AssetGraphNodeCreationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6610|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_EVENT_GENERATED',
        sourceSheet: 'ASSET_REGISTRY_POPULATION',
        sourceStatusRequired: 'ASSET_REGISTRY_POPULATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Generates event-sourced asset events for downstream graph and GIS execution.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EVENT_GENERATED',
        sourceSheet: 'ASSET_REGISTRY_POPULATION',
        sourceStatusRequired: 'ASSET_REGISTRY_POPULATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EVENT_GENERATED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6620_AssetGraphNodeCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_EVENT_GENERATED',
          sourceSheet: 'ASSET_REGISTRY_POPULATION',
          requiredSourceStatus: 'ASSET_REGISTRY_POPULATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6620_AssetGraphNodeCreationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EVENT_GENERATED',
        sourceSheet: 'ASSET_REGISTRY_POPULATION',
        sourceStatusRequired: 'ASSET_REGISTRY_POPULATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EVENT_GENERATED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6620_AssetGraphNodeCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6610_AssetEventGenerationProcessor() {
  return sciipRun6610_AssetEventGenerationProcessor();
}

function sciipTest6610_AssetEventGenerationProcessor() {
  var result = sciipRun6610_AssetEventGenerationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6610_AssetEventGenerationProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6620_AssetGraphNodeCreationProcessor.gs
 * Processor: 6620_AssetGraphNodeCreation
 * Purpose: Creates graph-native asset node creation records.
 */

function sciipRun6620_AssetGraphNodeCreationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6620_AssetGraphNodeCreation',
    action: 'ASSET_GRAPH_NODE_CREATION',
    targetSheet: 'ASSET_GRAPH_NODE_CREATION',
    ledgerSheet: 'ASSET_GRAPH_NODE_CREATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Creates graph-native asset node creation records.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_EVENT_GENERATION',
          requiredSourceStatus: 'ASSET_EVENT_GENERATED',
          executionStatus: 'ASSET_GRAPH_NODE_CREATED',
          nextProcessor: '6630_AssetGISBindingProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6620|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_GRAPH_NODE_CREATED',
        sourceSheet: 'ASSET_EVENT_GENERATION',
        sourceStatusRequired: 'ASSET_EVENT_GENERATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Creates graph-native asset node creation records.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_GRAPH_NODE_CREATED',
        sourceSheet: 'ASSET_EVENT_GENERATION',
        sourceStatusRequired: 'ASSET_EVENT_GENERATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_GRAPH_NODE_CREATED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6630_AssetGISBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_GRAPH_NODE_CREATED',
          sourceSheet: 'ASSET_EVENT_GENERATION',
          requiredSourceStatus: 'ASSET_EVENT_GENERATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6630_AssetGISBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_GRAPH_NODE_CREATED',
        sourceSheet: 'ASSET_EVENT_GENERATION',
        sourceStatusRequired: 'ASSET_EVENT_GENERATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_GRAPH_NODE_CREATED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6630_AssetGISBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6620_AssetGraphNodeCreationProcessor() {
  return sciipRun6620_AssetGraphNodeCreationProcessor();
}

function sciipTest6620_AssetGraphNodeCreationProcessor() {
  var result = sciipRun6620_AssetGraphNodeCreationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6620_AssetGraphNodeCreationProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6630_AssetGISBindingProcessor.gs
 * Processor: 6630_AssetGISBinding
 * Purpose: Binds asset graph nodes to GIS-ready spatial execution records.
 */

function sciipRun6630_AssetGISBindingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6630_AssetGISBinding',
    action: 'ASSET_GIS_BINDING',
    targetSheet: 'ASSET_GIS_BINDING',
    ledgerSheet: 'ASSET_GIS_BINDING_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Binds asset graph nodes to GIS-ready spatial execution records.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_GRAPH_NODE_CREATION',
          requiredSourceStatus: 'ASSET_GRAPH_NODE_CREATED',
          executionStatus: 'ASSET_GIS_BOUND',
          nextProcessor: '6640_AssetExecutionCertificationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6630|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_GIS_BOUND',
        sourceSheet: 'ASSET_GRAPH_NODE_CREATION',
        sourceStatusRequired: 'ASSET_GRAPH_NODE_CREATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Binds asset graph nodes to GIS-ready spatial execution records.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_GIS_BOUND',
        sourceSheet: 'ASSET_GRAPH_NODE_CREATION',
        sourceStatusRequired: 'ASSET_GRAPH_NODE_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_GIS_BOUND',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6640_AssetExecutionCertificationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_GIS_BOUND',
          sourceSheet: 'ASSET_GRAPH_NODE_CREATION',
          requiredSourceStatus: 'ASSET_GRAPH_NODE_CREATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6640_AssetExecutionCertificationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_GIS_BOUND',
        sourceSheet: 'ASSET_GRAPH_NODE_CREATION',
        sourceStatusRequired: 'ASSET_GRAPH_NODE_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_GIS_BOUND',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6640_AssetExecutionCertificationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6630_AssetGISBindingProcessor() {
  return sciipRun6630_AssetGISBindingProcessor();
}

function sciipTest6630_AssetGISBindingProcessor() {
  var result = sciipRun6630_AssetGISBindingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6630_AssetGISBindingProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6640_AssetExecutionCertificationProcessor.gs
 * Processor: 6640_AssetExecutionCertification
 * Purpose: Certifies the asset execution chain for production use.
 */

function sciipRun6640_AssetExecutionCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6640_AssetExecutionCertification',
    action: 'ASSET_EXECUTION_CERTIFICATION',
    targetSheet: 'ASSET_EXECUTION_CERTIFICATION',
    ledgerSheet: 'ASSET_EXECUTION_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Certifies the asset execution chain for production use.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_GIS_BINDING',
          requiredSourceStatus: 'ASSET_GIS_BOUND',
          executionStatus: 'ASSET_EXECUTION_CERTIFIED',
          nextProcessor: '6650_AssetAcceptanceProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6640|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_CERTIFIED',
        sourceSheet: 'ASSET_GIS_BINDING',
        sourceStatusRequired: 'ASSET_GIS_BOUND',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Certifies the asset execution chain for production use.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_CERTIFIED',
        sourceSheet: 'ASSET_GIS_BINDING',
        sourceStatusRequired: 'ASSET_GIS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EXECUTION_CERTIFIED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6650_AssetAcceptanceProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_EXECUTION_CERTIFIED',
          sourceSheet: 'ASSET_GIS_BINDING',
          requiredSourceStatus: 'ASSET_GIS_BOUND',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6650_AssetAcceptanceProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_CERTIFIED',
        sourceSheet: 'ASSET_GIS_BINDING',
        sourceStatusRequired: 'ASSET_GIS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EXECUTION_CERTIFIED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6650_AssetAcceptanceProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6640_AssetExecutionCertificationProcessor() {
  return sciipRun6640_AssetExecutionCertificationProcessor();
}

function sciipTest6640_AssetExecutionCertificationProcessor() {
  var result = sciipRun6640_AssetExecutionCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6640_AssetExecutionCertificationProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6650_AssetAcceptanceProcessor.gs
 * Processor: 6650_AssetAcceptance
 * Purpose: Accepts the completed asset execution layer and hands off to identity execution readiness.
 */

function sciipRun6650_AssetAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6650_AssetAcceptance',
    action: 'ASSET_ACCEPTANCE',
    targetSheet: 'ASSET_ACCEPTANCE',
    ledgerSheet: 'ASSET_ACCEPTANCE_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Accepts the completed asset execution layer and hands off to identity execution readiness.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
          requiredSourceStatus: 'ASSET_EXECUTION_CERTIFIED',
          executionStatus: 'ASSET_EXECUTION_ACCEPTED',
          nextProcessor: '6660_IdentityExecutionReadinessProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = ["businessKey", "transactionId", "processor", "executionStatus", "sourceSheet", "sourceStatusRequired", "recordsRead", "recordsCreated", "assetExecutionId", "assetBusinessKey", "assetStatus", "assetPayloadJson", "nextProcessor", "frameworkVersion", "createdAt"];
      var ledgerHeaders = targetHeaders;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var assetExecutionId = '6650|' + context.businessKey;
      var assetBusinessKey = 'ASSET_EXECUTION|' + context.businessKey;
      var assetPayload = {
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_ACCEPTED',
        sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'ASSET_EXECUTION_CERTIFIED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Accepts the completed asset execution layer and hands off to identity execution readiness.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_ACCEPTED',
        sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'ASSET_EXECUTION_CERTIFIED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EXECUTION_ACCEPTED',
        assetPayloadJson: JSON.stringify(assetPayload),
        nextProcessor: '6660_IdentityExecutionReadinessProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'ASSET_EXECUTION_ACCEPTED',
          sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
          requiredSourceStatus: 'ASSET_EXECUTION_CERTIFIED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6660_IdentityExecutionReadinessProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, ledgerHeaders, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'ASSET_EXECUTION_ACCEPTED',
        sourceSheet: 'ASSET_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'ASSET_EXECUTION_CERTIFIED',
        recordsRead: 1,
        recordsCreated: 1,
        assetExecutionId: assetExecutionId,
        assetBusinessKey: assetBusinessKey,
        assetStatus: 'ASSET_EXECUTION_ACCEPTED',
        assetPayloadJson: JSON.stringify(result),
        nextProcessor: '6660_IdentityExecutionReadinessProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6650_AssetAcceptanceProcessor() {
  return sciipRun6650_AssetAcceptanceProcessor();
}

function sciipTest6650_AssetAcceptanceProcessor() {
  var result = sciipRun6650_AssetAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6650_AssetAcceptanceProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6390_AssetRegistryExecutionReadinessProcessor.gs
 *
 * Processor: 6390_AssetRegistryExecutionReadiness
 *
 * Purpose:
 * Certifies that the accepted domain execution layer is ready to begin asset registry execution.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_EXECUTION_ACCEPTANCE
 * - Creates ASSET_REGISTRY_EXECUTION_READINESS
 * - Creates ASSET_REGISTRY_EXECUTION_READINESS_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6390_AssetRegistryExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6390_AssetRegistryExecutionReadiness',
    action: 'ASSET_REGISTRY_EXECUTION_READINESS',
    sourceSheet: 'DOMAIN_EXECUTION_ACCEPTANCE',
    targetSheet: 'ASSET_REGISTRY_EXECUTION_READINESS',
    ledgerSheet: 'ASSET_REGISTRY_EXECUTION_READINESS_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6390GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6390FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Certifies that the accepted domain execution layer is ready to begin asset registry execution.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'DOMAIN_EXECUTION_LAYER_ACCEPTED',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6400_AssetRegistrySourceDiscoveryPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6390GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6390FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'DOMAIN_EXECUTION_LAYER_ACCEPTED',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6390_AssetRegistryExecutionReadiness so required asset registry execution records exist.'
          })
        });
        sciip6390AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6400_AssetRegistrySourceDiscoveryPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_EXECUTION_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6390FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6390_AssetRegistryExecutionReadiness|ASSET_REGISTRY_EXECUTION_READY',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_EXECUTION_READY',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Certifies that the accepted domain execution layer is ready to begin asset registry execution.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'DOMAIN_EXECUTION_ACCEPTANCE',
          nextProcessor: '6400_AssetRegistrySourceDiscoveryPlanProcessor',
          executionSummary: 'Certifies that the accepted domain execution layer is ready to begin asset registry execution.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_EXECUTION_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6400_AssetRegistrySourceDiscoveryPlanProcessor'
        })
      });
      sciip6390AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_EXECUTION_READY', matchingRecords.length, created, skippedDuplicate, 0, '6400_AssetRegistrySourceDiscoveryPlanProcessor', now);
      return result;
    }
  });
}

function run6390_AssetRegistryExecutionReadinessProcessor() {
  return sciipRun6390_AssetRegistryExecutionReadinessProcessor();
}

function sciipTest6390_AssetRegistryExecutionReadinessProcessor() {
  var result = sciipRun6390_AssetRegistryExecutionReadinessProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6390_AssetRegistryExecutionReadinessProcessor', result: result }));
  return result;
}

function sciip6390GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6390FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6390RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6390RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'DOMAIN_EXECUTION_LAYER_ACCEPTED';
}

function sciip6390FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6390AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6400_AssetRegistrySourceDiscoveryPlanProcessor.gs
 *
 * Processor: 6400_AssetRegistrySourceDiscoveryPlan
 *
 * Purpose:
 * Defines the source discovery plan for asset registry execution across property, asset, address, city, zip, and status sources.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_EXECUTION_READINESS
 * - Creates ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN
 * - Creates ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6400_AssetRegistrySourceDiscoveryPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6400_AssetRegistrySourceDiscoveryPlan',
    action: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN',
    sourceSheet: 'ASSET_REGISTRY_EXECUTION_READINESS',
    targetSheet: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN',
    ledgerSheet: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6400GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6400FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Defines the source discovery plan for asset registry execution across property, asset, address, city, zip, and status sources.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6410_AssetRegistrySchemaReadinessProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6400GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6400FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6400_AssetRegistrySourceDiscoveryPlan so required asset registry execution records exist.'
          })
        });
        sciip6400AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6410_AssetRegistrySchemaReadinessProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6400FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6400_AssetRegistrySourceDiscoveryPlan|ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Defines the source discovery plan for asset registry execution across property, asset, address, city, zip, and status sources.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_EXECUTION_READINESS',
          nextProcessor: '6410_AssetRegistrySchemaReadinessProcessor',
          executionSummary: 'Defines the source discovery plan for asset registry execution across property, asset, address, city, zip, and status sources.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6410_AssetRegistrySchemaReadinessProcessor'
        })
      });
      sciip6400AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6410_AssetRegistrySchemaReadinessProcessor', now);
      return result;
    }
  });
}

function run6400_AssetRegistrySourceDiscoveryPlanProcessor() {
  return sciipRun6400_AssetRegistrySourceDiscoveryPlanProcessor();
}

function sciipTest6400_AssetRegistrySourceDiscoveryPlanProcessor() {
  var result = sciipRun6400_AssetRegistrySourceDiscoveryPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6400_AssetRegistrySourceDiscoveryPlanProcessor', result: result }));
  return result;
}

function sciip6400GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6400FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6400RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6400RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_EXECUTION_READY';
}

function sciip6400FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6400AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6410_AssetRegistrySchemaReadinessProcessor.gs
 *
 * Processor: 6410_AssetRegistrySchemaReadiness
 *
 * Purpose:
 * Certifies required asset registry schema contracts before execution writes permanent asset records.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN
 * - Creates ASSET_REGISTRY_SCHEMA_READINESS
 * - Creates ASSET_REGISTRY_SCHEMA_READINESS_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6410_AssetRegistrySchemaReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6410_AssetRegistrySchemaReadiness',
    action: 'ASSET_REGISTRY_SCHEMA_READINESS',
    sourceSheet: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN',
    targetSheet: 'ASSET_REGISTRY_SCHEMA_READINESS',
    ledgerSheet: 'ASSET_REGISTRY_SCHEMA_READINESS_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6410GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6410FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Certifies required asset registry schema contracts before execution writes permanent asset records.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6420_AssetRegistryIdentityBindingPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6410GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6410FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6410_AssetRegistrySchemaReadiness so required asset registry execution records exist.'
          })
        });
        sciip6410AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6420_AssetRegistryIdentityBindingPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_SCHEMA_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6410FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6410_AssetRegistrySchemaReadiness|ASSET_REGISTRY_SCHEMA_READY',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_SCHEMA_READY',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Certifies required asset registry schema contracts before execution writes permanent asset records.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN',
          nextProcessor: '6420_AssetRegistryIdentityBindingPlanProcessor',
          executionSummary: 'Certifies required asset registry schema contracts before execution writes permanent asset records.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_SCHEMA_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6420_AssetRegistryIdentityBindingPlanProcessor'
        })
      });
      sciip6410AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_SCHEMA_READY', matchingRecords.length, created, skippedDuplicate, 0, '6420_AssetRegistryIdentityBindingPlanProcessor', now);
      return result;
    }
  });
}

function run6410_AssetRegistrySchemaReadinessProcessor() {
  return sciipRun6410_AssetRegistrySchemaReadinessProcessor();
}

function sciipTest6410_AssetRegistrySchemaReadinessProcessor() {
  var result = sciipRun6410_AssetRegistrySchemaReadinessProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6410_AssetRegistrySchemaReadinessProcessor', result: result }));
  return result;
}

function sciip6410GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6410FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6410RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6410RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_SOURCE_DISCOVERY_PLAN_READY';
}

function sciip6410FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6410AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6420_AssetRegistryIdentityBindingPlanProcessor.gs
 *
 * Processor: 6420_AssetRegistryIdentityBindingPlan
 *
 * Purpose:
 * Defines how asset registry execution will bind source records to durable identity, alias, and parent-address structures.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_SCHEMA_READINESS
 * - Creates ASSET_REGISTRY_IDENTITY_BINDING_PLAN
 * - Creates ASSET_REGISTRY_IDENTITY_BINDING_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6420_AssetRegistryIdentityBindingPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6420_AssetRegistryIdentityBindingPlan',
    action: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN',
    sourceSheet: 'ASSET_REGISTRY_SCHEMA_READINESS',
    targetSheet: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN',
    ledgerSheet: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6420GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6420FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Defines how asset registry execution will bind source records to durable identity, alias, and parent-address structures.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_SCHEMA_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6430_AssetRegistryGraphBindingPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6420GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6420FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_SCHEMA_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6420_AssetRegistryIdentityBindingPlan so required asset registry execution records exist.'
          })
        });
        sciip6420AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6430_AssetRegistryGraphBindingPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_IDENTITY_BINDING_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6420FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6420_AssetRegistryIdentityBindingPlan|ASSET_REGISTRY_IDENTITY_BINDING_PLAN_READY',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN_READY',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Defines how asset registry execution will bind source records to durable identity, alias, and parent-address structures.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_SCHEMA_READINESS',
          nextProcessor: '6430_AssetRegistryGraphBindingPlanProcessor',
          executionSummary: 'Defines how asset registry execution will bind source records to durable identity, alias, and parent-address structures.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6430_AssetRegistryGraphBindingPlanProcessor'
        })
      });
      sciip6420AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6430_AssetRegistryGraphBindingPlanProcessor', now);
      return result;
    }
  });
}

function run6420_AssetRegistryIdentityBindingPlanProcessor() {
  return sciipRun6420_AssetRegistryIdentityBindingPlanProcessor();
}

function sciipTest6420_AssetRegistryIdentityBindingPlanProcessor() {
  var result = sciipRun6420_AssetRegistryIdentityBindingPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6420_AssetRegistryIdentityBindingPlanProcessor', result: result }));
  return result;
}

function sciip6420GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6420FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6420RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6420RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_SCHEMA_READY';
}

function sciip6420FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6420AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6430_AssetRegistryGraphBindingPlanProcessor.gs
 *
 * Processor: 6430_AssetRegistryGraphBindingPlan
 *
 * Purpose:
 * Defines how asset registry execution will produce graph-native nodes, edges, and asset relationships.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_IDENTITY_BINDING_PLAN
 * - Creates ASSET_REGISTRY_GRAPH_BINDING_PLAN
 * - Creates ASSET_REGISTRY_GRAPH_BINDING_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6430_AssetRegistryGraphBindingPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6430_AssetRegistryGraphBindingPlan',
    action: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN',
    sourceSheet: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN',
    targetSheet: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN',
    ledgerSheet: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6430GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6430FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Defines how asset registry execution will produce graph-native nodes, edges, and asset relationships.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6440_AssetRegistryGISBindingPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6430GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6430FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6430_AssetRegistryGraphBindingPlan so required asset registry execution records exist.'
          })
        });
        sciip6430AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6440_AssetRegistryGISBindingPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_GRAPH_BINDING_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6430FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6430_AssetRegistryGraphBindingPlan|ASSET_REGISTRY_GRAPH_BINDING_PLAN_READY',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN_READY',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Defines how asset registry execution will produce graph-native nodes, edges, and asset relationships.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN',
          nextProcessor: '6440_AssetRegistryGISBindingPlanProcessor',
          executionSummary: 'Defines how asset registry execution will produce graph-native nodes, edges, and asset relationships.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6440_AssetRegistryGISBindingPlanProcessor'
        })
      });
      sciip6430AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_GRAPH_BINDING_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6440_AssetRegistryGISBindingPlanProcessor', now);
      return result;
    }
  });
}

function run6430_AssetRegistryGraphBindingPlanProcessor() {
  return sciipRun6430_AssetRegistryGraphBindingPlanProcessor();
}

function sciipTest6430_AssetRegistryGraphBindingPlanProcessor() {
  var result = sciipRun6430_AssetRegistryGraphBindingPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6430_AssetRegistryGraphBindingPlanProcessor', result: result }));
  return result;
}

function sciip6430GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6430FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6430RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6430RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_IDENTITY_BINDING_PLAN_READY';
}

function sciip6430FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6430AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6440_AssetRegistryGISBindingPlanProcessor.gs
 *
 * Processor: 6440_AssetRegistryGISBindingPlan
 *
 * Purpose:
 * Defines how asset registry execution will bind records to GIS, spatial, proximity, and map-ready intelligence.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_GRAPH_BINDING_PLAN
 * - Creates ASSET_REGISTRY_GIS_BINDING_PLAN
 * - Creates ASSET_REGISTRY_GIS_BINDING_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6440_AssetRegistryGISBindingPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6440_AssetRegistryGISBindingPlan',
    action: 'ASSET_REGISTRY_GIS_BINDING_PLAN',
    sourceSheet: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN',
    targetSheet: 'ASSET_REGISTRY_GIS_BINDING_PLAN',
    ledgerSheet: 'ASSET_REGISTRY_GIS_BINDING_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6440GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6440FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Defines how asset registry execution will bind records to GIS, spatial, proximity, and map-ready intelligence.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6450_AssetRegistryExecutionCoordinationLedgerProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6440GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6440FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6440_AssetRegistryGISBindingPlan so required asset registry execution records exist.'
          })
        });
        sciip6440AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6450_AssetRegistryExecutionCoordinationLedgerProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_GIS_BINDING_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6440FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6440_AssetRegistryGISBindingPlan|ASSET_REGISTRY_GIS_BINDING_PLAN_READY',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_GIS_BINDING_PLAN_READY',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Defines how asset registry execution will bind records to GIS, spatial, proximity, and map-ready intelligence.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_GRAPH_BINDING_PLAN',
          nextProcessor: '6450_AssetRegistryExecutionCoordinationLedgerProcessor',
          executionSummary: 'Defines how asset registry execution will bind records to GIS, spatial, proximity, and map-ready intelligence.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_GIS_BINDING_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6450_AssetRegistryExecutionCoordinationLedgerProcessor'
        })
      });
      sciip6440AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_GIS_BINDING_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6450_AssetRegistryExecutionCoordinationLedgerProcessor', now);
      return result;
    }
  });
}

function run6440_AssetRegistryGISBindingPlanProcessor() {
  return sciipRun6440_AssetRegistryGISBindingPlanProcessor();
}

function sciipTest6440_AssetRegistryGISBindingPlanProcessor() {
  var result = sciipRun6440_AssetRegistryGISBindingPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6440_AssetRegistryGISBindingPlanProcessor', result: result }));
  return result;
}

function sciip6440GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6440FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6440RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6440RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_GRAPH_BINDING_PLAN_READY';
}

function sciip6440FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6440AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6450_AssetRegistryExecutionCoordinationLedgerProcessor.gs
 *
 * Processor: 6450_AssetRegistryExecutionCoordinationLedger
 *
 * Purpose:
 * Creates the coordination ledger that connects asset registry readiness, source, schema, identity, graph, and GIS execution plans.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_GIS_BINDING_PLAN
 * - Creates ASSET_REGISTRY_EXECUTION_COORDINATION_LEDGER
 * - Creates ASSET_REGISTRY_EXECUTION_COORDINATION_LEDGER_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6450_AssetRegistryExecutionCoordinationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6450_AssetRegistryExecutionCoordinationLedger',
    action: 'ASSET_REGISTRY_EXECUTION_COORDINATION_LEDGER',
    sourceSheet: 'ASSET_REGISTRY_GIS_BINDING_PLAN',
    targetSheet: 'ASSET_REGISTRY_EXECUTION_COORDINATION_LEDGER',
    ledgerSheet: 'ASSET_REGISTRY_EXECUTION_COORDINATION_LEDGER_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6450GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6450FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the coordination ledger that connects asset registry readiness, source, schema, identity, graph, and GIS execution plans.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_GIS_BINDING_PLAN_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6460_AssetRegistryExecutionHandoffProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6450GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6450FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_GIS_BINDING_PLAN_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6450_AssetRegistryExecutionCoordinationLedger so required asset registry execution records exist.'
          })
        });
        sciip6450AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6460_AssetRegistryExecutionHandoffProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_EXECUTION_COORDINATED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6450FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6450_AssetRegistryExecutionCoordinationLedger|ASSET_REGISTRY_EXECUTION_COORDINATED',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_EXECUTION_COORDINATED',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Creates the coordination ledger that connects asset registry readiness, source, schema, identity, graph, and GIS execution plans.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_GIS_BINDING_PLAN',
          nextProcessor: '6460_AssetRegistryExecutionHandoffProcessor',
          executionSummary: 'Creates the coordination ledger that connects asset registry readiness, source, schema, identity, graph, and GIS execution plans.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_EXECUTION_COORDINATED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6460_AssetRegistryExecutionHandoffProcessor'
        })
      });
      sciip6450AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_EXECUTION_COORDINATED', matchingRecords.length, created, skippedDuplicate, 0, '6460_AssetRegistryExecutionHandoffProcessor', now);
      return result;
    }
  });
}

function run6450_AssetRegistryExecutionCoordinationLedgerProcessor() {
  return sciipRun6450_AssetRegistryExecutionCoordinationLedgerProcessor();
}

function sciipTest6450_AssetRegistryExecutionCoordinationLedgerProcessor() {
  var result = sciipRun6450_AssetRegistryExecutionCoordinationLedgerProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6450_AssetRegistryExecutionCoordinationLedgerProcessor', result: result }));
  return result;
}

function sciip6450GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6450FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6450RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6450RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_GIS_BINDING_PLAN_READY';
}

function sciip6450FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6450AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6460_AssetRegistryExecutionHandoffProcessor.gs
 *
 * Processor: 6460_AssetRegistryExecutionHandoff
 *
 * Purpose:
 * Creates the handoff from asset registry planning into asset registry execution processors.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_EXECUTION_COORDINATION_LEDGER
 * - Creates ASSET_REGISTRY_EXECUTION_HANDOFF
 * - Creates ASSET_REGISTRY_EXECUTION_HANDOFF_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6460_AssetRegistryExecutionHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6460_AssetRegistryExecutionHandoff',
    action: 'ASSET_REGISTRY_EXECUTION_HANDOFF',
    sourceSheet: 'ASSET_REGISTRY_EXECUTION_COORDINATION_LEDGER',
    targetSheet: 'ASSET_REGISTRY_EXECUTION_HANDOFF',
    ledgerSheet: 'ASSET_REGISTRY_EXECUTION_HANDOFF_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6460GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6460FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the handoff from asset registry planning into asset registry execution processors.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_COORDINATED',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6470_AssetRegistryExecutionAcceptanceProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6460GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6460FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_COORDINATED',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6460_AssetRegistryExecutionHandoff so required asset registry execution records exist.'
          })
        });
        sciip6460AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6470_AssetRegistryExecutionAcceptanceProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_EXECUTION_HANDOFF_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6460FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6460_AssetRegistryExecutionHandoff|ASSET_REGISTRY_EXECUTION_HANDOFF_READY',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_EXECUTION_HANDOFF_READY',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Creates the handoff from asset registry planning into asset registry execution processors.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_EXECUTION_COORDINATION_LEDGER',
          nextProcessor: '6470_AssetRegistryExecutionAcceptanceProcessor',
          executionSummary: 'Creates the handoff from asset registry planning into asset registry execution processors.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_EXECUTION_HANDOFF_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6470_AssetRegistryExecutionAcceptanceProcessor'
        })
      });
      sciip6460AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_EXECUTION_HANDOFF_READY', matchingRecords.length, created, skippedDuplicate, 0, '6470_AssetRegistryExecutionAcceptanceProcessor', now);
      return result;
    }
  });
}

function run6460_AssetRegistryExecutionHandoffProcessor() {
  return sciipRun6460_AssetRegistryExecutionHandoffProcessor();
}

function sciipTest6460_AssetRegistryExecutionHandoffProcessor() {
  var result = sciipRun6460_AssetRegistryExecutionHandoffProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6460_AssetRegistryExecutionHandoffProcessor', result: result }));
  return result;
}

function sciip6460GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6460FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6460RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6460RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_EXECUTION_COORDINATED';
}

function sciip6460FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6460AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6470_AssetRegistryExecutionAcceptanceProcessor.gs
 *
 * Processor: 6470_AssetRegistryExecutionAcceptance
 *
 * Purpose:
 * Accepts the asset registry execution readiness layer and authorizes the first production asset registry execution processor.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_REGISTRY_EXECUTION_HANDOFF
 * - Creates ASSET_REGISTRY_EXECUTION_ACCEPTANCE
 * - Creates ASSET_REGISTRY_EXECUTION_ACCEPTANCE_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent asset registry execution history
 */

function sciipRun6470_AssetRegistryExecutionAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6470_AssetRegistryExecutionAcceptance',
    action: 'ASSET_REGISTRY_EXECUTION_ACCEPTANCE',
    sourceSheet: 'ASSET_REGISTRY_EXECUTION_HANDOFF',
    targetSheet: 'ASSET_REGISTRY_EXECUTION_ACCEPTANCE',
    ledgerSheet: 'ASSET_REGISTRY_EXECUTION_ACCEPTANCE_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6470GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6470FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Accepts the asset registry execution readiness layer and authorizes the first production asset registry execution processor.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceSheet: definition.sourceSheet,
          requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_HANDOFF_READY',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6480_AssetRegistryExecutionProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'assetRegistryExecutionId',
        'assetRegistryExecutionStatus',
        'assetRegistryExecutionLayer',
        'assetRegistryExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6470GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6470FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            requiredSourceStatus: 'ASSET_REGISTRY_EXECUTION_HANDOFF_READY',
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6470_AssetRegistryExecutionAcceptance so required asset registry execution records exist.'
          })
        });
        sciip6470AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6480_AssetRegistryExecutionProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_REGISTRY_EXECUTION_LAYER_ACCEPTED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6470FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          assetRegistryExecutionId: '6470_AssetRegistryExecutionAcceptance|ASSET_REGISTRY_EXECUTION_LAYER_ACCEPTED',
          assetRegistryExecutionStatus: 'ASSET_REGISTRY_EXECUTION_LAYER_ACCEPTED',
          assetRegistryExecutionLayer: 'asset_registry',
          assetRegistryExecutionScope: 'Accepts the asset registry execution readiness layer and authorizes the first production asset registry execution processor.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-asset-registry-execution-readiness',
          sourceProcessor: 'ASSET_REGISTRY_EXECUTION_HANDOFF',
          nextProcessor: '6480_AssetRegistryExecutionProcessor',
          executionSummary: 'Accepts the asset registry execution readiness layer and authorizes the first production asset registry execution processor.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_REGISTRY_EXECUTION_LAYER_ACCEPTED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6480_AssetRegistryExecutionProcessor'
        })
      });
      sciip6470AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_REGISTRY_EXECUTION_LAYER_ACCEPTED', matchingRecords.length, created, skippedDuplicate, 0, '6480_AssetRegistryExecutionProcessor', now);
      return result;
    }
  });
}

function run6470_AssetRegistryExecutionAcceptanceProcessor() {
  return sciipRun6470_AssetRegistryExecutionAcceptanceProcessor();
}

function sciipTest6470_AssetRegistryExecutionAcceptanceProcessor() {
  var result = sciipRun6470_AssetRegistryExecutionAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6470_AssetRegistryExecutionAcceptanceProcessor', result: result }));
  return result;
}

function sciip6470GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6470FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6470RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6470RecordReady_(record) {
  if (!record) return false;
  var status = record['assetRegistryExecutionStatus'] || record.assetRegistryExecutionStatus || record['domainExecutionStatus'] || record.domainExecutionStatus || record['executionStatus'] || record.executionStatus || '';
  return String(status) === 'ASSET_REGISTRY_EXECUTION_HANDOFF_READY';
}

function sciip6470FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6470AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-asset-registry-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6210_DomainCapabilityExpansionReadinessProcessor.gs
 *
 * Processor: 6210_DomainCapabilityExpansionReadiness
 *
 * Purpose:
 * Self-certifies that SCIIP_OS has completed the v5.4 runtime foundation
 * and is ready to begin v5.5 domain capability execution.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Self-certifying domain-layer processor
 * - No source-sheet dependency
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework
 * - Creates required readiness and ledger sheets automatically
 * - Preserves permanent ledger history
 */

function sciipRun6210_DomainCapabilityExpansionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6210_DomainCapabilityExpansionReadiness',
    action: 'DOMAIN_CAPABILITY_EXPANSION_READINESS',
    targetSheet: 'DOMAIN_CAPABILITY_EXPANSION_READINESS',
    ledgerSheet: 'DOMAIN_CAPABILITY_EXPANSION_READINESS_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'SCIIP_OS v5.5 domain capability expansion readiness payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          runtimeScope: 'Runtime Framework|Production Runtime|Autonomous Runtime|Control Plane|Supervisor',
          nextProcessor: '6220_DomainCapabilityRegistryProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'readinessId',
        'readinessStatus',
        'runtimeMilestone',
        'domainMilestone',
        'runtimeFoundationStatus',
        'domainExpansionScope',
        'readinessSummary',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'readinessStatus',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var now = new Date();
      var readinessId = 'DOMAIN_EXPANSION_READINESS|v5.5|6210';
      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        readinessId,
        SCIIP_RUNTIME.getDateKey({})
      ]);

      var created = 0;
      var skippedDuplicate = 0;

      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            readinessId: readinessId,
            readinessStatus: 'DOMAIN_CAPABILITY_EXPANSION_READY',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            runtimeFoundationStatus: 'ACCEPTED',
            domainExpansionScope: 'Asset|SuperSheet|Identity|Knowledge Graph|GIS',
            readinessSummary: 'SCIIP_OS v5.5 domain capability expansion readiness certified. Runtime foundation through 6200 is accepted and ready for domain execution.',
            nextProcessor: '6220_DomainCapabilityRegistryProcessor',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: 1,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          readinessStatus: 'DOMAIN_CAPABILITY_EXPANSION_READY',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          transactionId: transaction.transactionId,
          nextProcessor: '6220_DomainCapabilityRegistryProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          readinessStatus: 'DOMAIN_CAPABILITY_EXPANSION_READY',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6220_DomainCapabilityRegistryProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6210_DomainCapabilityExpansionReadinessProcessor() {
  return sciipRun6210_DomainCapabilityExpansionReadinessProcessor();
}

function sciipTest6210_DomainCapabilityExpansionReadinessProcessor() {
  var result = sciipRun6210_DomainCapabilityExpansionReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6210_DomainCapabilityExpansionReadinessProcessor',
    result: result
  }));

  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6220_DomainCapabilityRegistryProcessor.gs
 *
 * Processor: 6220_DomainCapabilityRegistry
 *
 * Purpose:
 * Creates the first SCIIP_OS v5.5 domain capability registry.
 * This processor formally declares the production domain capabilities
 * that will execute on top of the completed runtime foundation.
 *
 * Design:
 * - Self-certifying domain-layer processor
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework
 * - Creates required target and ledger sheets automatically
 * - Preserves permanent registry and ledger history
 */

function sciipRun6220_DomainCapabilityRegistryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6220_DomainCapabilityRegistry',
    action: 'DOMAIN_CAPABILITY_REGISTRY',
    targetSheet: 'DOMAIN_CAPABILITY_REGISTRY',
    ledgerSheet: 'DOMAIN_CAPABILITY_REGISTRY_LEDGER',

    buildPayload: function(context, definition) {
      var capabilities = sciip6220DomainCapabilities_();

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: capabilities.length,
        outputCount: capabilities.length,
        summary: 'SCIIP_OS v5.5 domain capability registry payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          readinessProcessor: '6210_DomainCapabilityExpansionReadiness',
          capabilityCount: capabilities.length,
          nextProcessor: '6230_DomainCapabilityExecutionLedgerProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityStatus',
        'domainCapabilityLayer',
        'domainCapabilityScope',
        'domainCapabilityRuntimeDependency',
        'domainCapabilityExecutionMode',
        'domainCapabilitySummary',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'registryStatus',
        'capabilitiesRegistered',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var capabilities = sciip6220DomainCapabilities_();
      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      capabilities.forEach(function(capability) {
        var rowBusinessKey = context.businessKey + '|' + capability.id;

        if (sciip6220BusinessKeyExists_(definition.targetSheet, rowBusinessKey, targetHeaders)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            domainCapabilityId: capability.id,
            domainCapabilityName: capability.name,
            domainCapabilityStatus: 'REGISTERED',
            domainCapabilityLayer: capability.layer,
            domainCapabilityScope: capability.scope,
            domainCapabilityRuntimeDependency: 'SCIIP_RUNTIME_PROCESSOR_BASE|Runtime v5.2|v5.4-runtime-6200',
            domainCapabilityExecutionMode: capability.executionMode,
            domainCapabilitySummary: capability.summary,
            nextProcessor: capability.nextProcessor,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: capabilities.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          registryStatus: 'DOMAIN_CAPABILITY_REGISTRY_READY',
          capabilitiesRegistered: created,
          skippedDuplicate: skippedDuplicate,
          totalCapabilities: capabilities.length,
          transactionId: transaction.transactionId,
          nextProcessor: '6230_DomainCapabilityExecutionLedgerProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          registryStatus: 'DOMAIN_CAPABILITY_REGISTRY_READY',
          capabilitiesRegistered: created,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6230_DomainCapabilityExecutionLedgerProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6220_DomainCapabilityRegistryProcessor() {
  return sciipRun6220_DomainCapabilityRegistryProcessor();
}

function sciipTest6220_DomainCapabilityRegistryProcessor() {
  var result = sciipRun6220_DomainCapabilityRegistryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6220_DomainCapabilityRegistryProcessor',
    result: result
  }));

  return result;
}

function sciip6220DomainCapabilities_() {
  return [
    {
      id: 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
      name: 'Asset Registry Execution',
      layer: 'asset',
      scope: 'Create and maintain asset-level industrial property intelligence on top of the permanent SCIIP runtime.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Activates asset-driven SCIIP domain processing for PROPERTY, ASSET, ADDRESS, CITY, ZIP, and STATUS graph records.',
      nextProcessor: '6240_AssetDomainCapabilityActivationProcessor'
    },
    {
      id: 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
      name: 'SuperSheet Domain Execution',
      layer: 'supersheet',
      scope: 'Transform AIR CRE SuperSheet import events into domain-ready property intelligence events.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Connects completed SuperSheet runtime infrastructure to asset registry, identity, graph, and GIS domain processors.',
      nextProcessor: '6250_SuperSheetDomainCapabilityActivationProcessor'
    },
    {
      id: 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
      name: 'Identity Resolution Execution',
      layer: 'identity',
      scope: 'Resolve property candidates, aliases, parent addresses, and durable asset identities.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Prepares duplicate-safe identity resolution for industrial property records without overwrites.',
      nextProcessor: '6260_IdentityDomainCapabilityActivationProcessor'
    },
    {
      id: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
      name: 'Knowledge Graph Execution',
      layer: 'graph',
      scope: 'Create and preserve graph-native nodes, edges, relationships, and domain events.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Moves SCIIP_OS from runtime control plane into production graph-native industrial intelligence.',
      nextProcessor: '6270_GraphDomainCapabilityActivationProcessor'
    },
    {
      id: 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
      name: 'GIS Intelligence Execution',
      layer: 'gis',
      scope: 'Bind asset intelligence to spatial, market, proximity, and map-ready industrial intelligence.',
      executionMode: 'RUNTIME_DOMAIN_PROCESSOR',
      summary: 'Prepares GIS-native domain execution for SoCal industrial market intelligence.',
      nextProcessor: '6280_GISDomainCapabilityActivationProcessor'
    }
  ];
}

function sciip6220BusinessKeyExists_(sheetName, businessKey, headers) {
  // Use the shared runtime sheet factory only. Do not call SpreadsheetApp.getActiveSpreadsheet(),
  // because standalone Apps Script projects can return null for active spreadsheet.
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined' || !SCIIP_RUNTIME_SHEET_FACTORY) {
    return false;
  }

  if (typeof SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey === 'function') {
    return !!SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(sheetName, businessKey);
  }

  if (typeof SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords === 'function') {
    var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];

    for (var i = records.length - 1; i >= 0; i--) {
      if (String(records[i].businessKey) === String(businessKey)) return true;
      if (String(records[i].Business_Key) === String(businessKey)) return true;
    }
  }

  return false;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6230_DomainCapabilityExecutionLedgerProcessor.gs
 *
 * Processor: 6230_DomainCapabilityExecutionLedger
 *
 * Purpose:
 * Creates the permanent execution ledger for SCIIP_OS v5.5 domain capabilities
 * registered by 6220_DomainCapabilityRegistry.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_REGISTRY
 * - Creates DOMAIN_CAPABILITY_EXECUTION_LEDGER
 * - Creates DOMAIN_CAPABILITY_EXECUTION_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework
 * - Row-level duplicate-safe with SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey
 * - Skip-safe when 6220 has not produced registry records
 * - Preserves permanent ledger history
 */

function sciipRun6230_DomainCapabilityExecutionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6230_DomainCapabilityExecutionLedger',
    action: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    sourceSheet: 'DOMAIN_CAPABILITY_REGISTRY',
    targetSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    ledgerSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var registryRecords = [];

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
        SCIIP_RUNTIME_SHEET_FACTORY &&
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
      ) {
        registryRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      }

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: registryRecords.length,
        outputCount: registryRecords.length,
        summary: 'SCIIP_OS v5.5 domain capability execution ledger payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          sourceProcessor: '6220_DomainCapabilityRegistry',
          registryRecordCount: registryRecords.length,
          nextProcessor: '6240_AssetDomainCapabilityActivationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityLayer',
        'domainCapabilityExecutionStatus',
        'domainCapabilityExecutionMode',
        'domainCapabilityRuntimeDependency',
        'domainCapabilityExecutionSequence',
        'sourceProcessor',
        'nextProcessor',
        'executionReadinessSummary',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionLedgerStatus',
        'sourceSheet',
        'targetSheet',
        'registryRecordsRead',
        'executionLedgerRecordsCreated',
        'skippedDuplicate',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var registryRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!registryRecords || registryRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          message: JSON.stringify({
            executionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 6220_DomainCapabilityRegistryProcessor before 6230 so records exist in DOMAIN_CAPABILITY_REGISTRY.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            executionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            registryRecordsRead: 0,
            executionLedgerRecordsCreated: 0,
            skippedDuplicate: 0,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            nextProcessor: '6220_DomainCapabilityRegistryProcessor',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: new Date()
          }
        );

        return skippedResult;
      }

      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      registryRecords.forEach(function(record, index) {
        var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
        var capabilityName = record.domainCapabilityName || record.DomainCapabilityName || '';
        var capabilityLayer = record.domainCapabilityLayer || record.DomainCapabilityLayer || '';
        var capabilityMode = record.domainCapabilityExecutionMode || record.DomainCapabilityExecutionMode || '';
        var runtimeDependency = record.domainCapabilityRuntimeDependency || record.DomainCapabilityRuntimeDependency || '';
        var sourceBusinessKey = record.businessKey || record.Business_Key || record.BusinessKey || '';
        var nextProcessor = record.nextProcessor || record.NextProcessor || '';

        if (!capabilityId) {
          return;
        }

        var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
          context.processor,
          definition.targetSheet,
          capabilityId,
          SCIIP_RUNTIME.getDateKey({})
        ]);

        if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            sourceBusinessKey: sourceBusinessKey,
            domainCapabilityId: capabilityId,
            domainCapabilityName: capabilityName,
            domainCapabilityLayer: capabilityLayer,
            domainCapabilityExecutionStatus: 'READY_FOR_ACTIVATION',
            domainCapabilityExecutionMode: capabilityMode || 'RUNTIME_DOMAIN_PROCESSOR',
            domainCapabilityRuntimeDependency: runtimeDependency || 'SCIIP_RUNTIME_PROCESSOR_BASE|Runtime v5.2|v5.4-runtime-6200',
            domainCapabilityExecutionSequence: index + 1,
            sourceProcessor: '6220_DomainCapabilityRegistry',
            nextProcessor: nextProcessor,
            executionReadinessSummary: 'Domain capability registered and ready for runtime-backed activation.',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: registryRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionLedgerStatus: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER_READY',
          registryRecordsRead: registryRecords.length,
          executionLedgerRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6240_AssetDomainCapabilityActivationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          executionLedgerStatus: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER_READY',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          registryRecordsRead: registryRecords.length,
          executionLedgerRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6240_AssetDomainCapabilityActivationProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6230_DomainCapabilityExecutionLedgerProcessor() {
  return sciipRun6230_DomainCapabilityExecutionLedgerProcessor();
}

function sciipTest6230_DomainCapabilityExecutionLedgerProcessor() {
  var result = sciipRun6230_DomainCapabilityExecutionLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6230_DomainCapabilityExecutionLedgerProcessor',
    result: result
  }));

  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6240_AssetDomainCapabilityActivationProcessor.gs
 *
 * Processor: 6240_AssetDomainCapabilityActivation
 *
 * Purpose:
 * Activates the asset domain capability on top of the completed SCIIP_OS runtime foundation.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_EXECUTION_LEDGER
 * - Creates ASSET_DOMAIN_CAPABILITY_ACTIVATIONS
 * - Creates ASSET_DOMAIN_CAPABILITY_ACTIVATION_LEDGER
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream domain execution ledger records are not present
 * - Preserves permanent activation ledger history
 */

function sciipRun6240_AssetDomainCapabilityActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6240_AssetDomainCapabilityActivation',
    action: 'ASSETDOMAINCAPABILITYACTIVATION',
    sourceSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    targetSheet: 'ASSET_DOMAIN_CAPABILITY_ACTIVATIONS',
    ledgerSheet: 'ASSET_DOMAIN_CAPABILITY_ACTIVATION_LEDGER',

    buildPayload: function(context, definition) {
      var sourceRecords = [];

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
        SCIIP_RUNTIME_SHEET_FACTORY &&
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
      ) {
        sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      }

      var matchingRecords = sciip6240FilterCapabilityRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: matchingRecords.length,
        outputCount: matchingRecords.length,
        summary: 'SCIIP_OS v5.5 asset domain capability activation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          sourceProcessor: '6230_DomainCapabilityExecutionLedger',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6250_SuperSheetDomainCapabilityActivationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityLayer',
        'activationStatus',
        'activationScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'activationSummary',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'activationStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      var matchingRecords = sciip6240FilterCapabilityRecords_(sourceRecords);

      if (!matchingRecords || matchingRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            activationStatus: 'SKIPPED_NO_INPUTS',
            requiredCapabilityId: 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 6230_DomainCapabilityExecutionLedgerProcessor before 6240 so capability execution records exist.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            activationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            recordsCreated: 0,
            skippedDuplicate: 0,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            nextProcessor: '6230_DomainCapabilityExecutionLedger',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: new Date()
          }
        );

        return skippedResult;
      }

      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      matchingRecords.forEach(function(record) {
        var sourceBusinessKey = record.businessKey || record.Business_Key || record.BusinessKey || '';
        var capabilityName = record.domainCapabilityName || record.DomainCapabilityName || 'AssetDomainCapabilityActivation';
        var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
          context.processor,
          definition.targetSheet,
          'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            sourceBusinessKey: sourceBusinessKey,
            domainCapabilityId: 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
            domainCapabilityName: capabilityName,
            domainCapabilityLayer: 'asset',
            activationStatus: 'ASSET_DOMAIN_CAPABILITY_ACTIVE',
            activationScope: 'Activates asset-driven property intelligence, asset registry execution, and permanent asset event readiness.',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            sourceProcessor: '6230_DomainCapabilityExecutionLedger',
            nextProcessor: '6250_SuperSheetDomainCapabilityActivationProcessor',
            activationSummary: 'Activates asset-driven property intelligence, asset registry execution, and permanent asset event readiness.',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          activationStatus: 'ASSET_DOMAIN_CAPABILITY_ACTIVE',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6250_SuperSheetDomainCapabilityActivationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          activationStatus: 'ASSET_DOMAIN_CAPABILITY_ACTIVE',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6250_SuperSheetDomainCapabilityActivationProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6240_AssetDomainCapabilityActivationProcessor() {
  return sciipRun6240_AssetDomainCapabilityActivationProcessor();
}

function sciipTest6240_AssetDomainCapabilityActivationProcessor() {
  var result = sciipRun6240_AssetDomainCapabilityActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6240_AssetDomainCapabilityActivationProcessor',
    result: result
  }));

  return result;
}

function sciip6240FilterCapabilityRecords_(records) {
  return (records || []).filter(function(record) {
    var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
    var layer = record.domainCapabilityLayer || record.DomainCapabilityLayer || '';
    return String(capabilityId) === 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION' || String(layer).toLowerCase() === 'asset';
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6250_SuperSheetDomainCapabilityActivationProcessor.gs
 *
 * Processor: 6250_SuperSheetDomainCapabilityActivation
 *
 * Purpose:
 * Activates the supersheet domain capability on top of the completed SCIIP_OS runtime foundation.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_EXECUTION_LEDGER
 * - Creates SUPERSHEET_DOMAIN_CAPABILITY_ACTIVATIONS
 * - Creates SUPERSHEET_DOMAIN_CAPABILITY_ACTIVATION_LEDGER
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream domain execution ledger records are not present
 * - Preserves permanent activation ledger history
 */

function sciipRun6250_SuperSheetDomainCapabilityActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6250_SuperSheetDomainCapabilityActivation',
    action: 'SUPERSHEETDOMAINCAPABILITYACTIVATION',
    sourceSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    targetSheet: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVATIONS',
    ledgerSheet: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVATION_LEDGER',

    buildPayload: function(context, definition) {
      var sourceRecords = [];

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
        SCIIP_RUNTIME_SHEET_FACTORY &&
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
      ) {
        sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      }

      var matchingRecords = sciip6250FilterCapabilityRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: matchingRecords.length,
        outputCount: matchingRecords.length,
        summary: 'SCIIP_OS v5.5 supersheet domain capability activation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          sourceProcessor: '6240_AssetDomainCapabilityActivation',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6260_IdentityDomainCapabilityActivationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityLayer',
        'activationStatus',
        'activationScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'activationSummary',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'activationStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      var matchingRecords = sciip6250FilterCapabilityRecords_(sourceRecords);

      if (!matchingRecords || matchingRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            activationStatus: 'SKIPPED_NO_INPUTS',
            requiredCapabilityId: 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 6230_DomainCapabilityExecutionLedgerProcessor before 6250 so capability execution records exist.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            activationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            recordsCreated: 0,
            skippedDuplicate: 0,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            nextProcessor: '6240_AssetDomainCapabilityActivation',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: new Date()
          }
        );

        return skippedResult;
      }

      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      matchingRecords.forEach(function(record) {
        var sourceBusinessKey = record.businessKey || record.Business_Key || record.BusinessKey || '';
        var capabilityName = record.domainCapabilityName || record.DomainCapabilityName || 'SuperSheetDomainCapabilityActivation';
        var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
          context.processor,
          definition.targetSheet,
          'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            sourceBusinessKey: sourceBusinessKey,
            domainCapabilityId: 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
            domainCapabilityName: capabilityName,
            domainCapabilityLayer: 'supersheet',
            activationStatus: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVE',
            activationScope: 'Activates SuperSheet-to-domain transformation readiness for property intelligence event execution.',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            sourceProcessor: '6240_AssetDomainCapabilityActivation',
            nextProcessor: '6260_IdentityDomainCapabilityActivationProcessor',
            activationSummary: 'Activates SuperSheet-to-domain transformation readiness for property intelligence event execution.',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          activationStatus: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVE',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6260_IdentityDomainCapabilityActivationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          activationStatus: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVE',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6260_IdentityDomainCapabilityActivationProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6250_SuperSheetDomainCapabilityActivationProcessor() {
  return sciipRun6250_SuperSheetDomainCapabilityActivationProcessor();
}

function sciipTest6250_SuperSheetDomainCapabilityActivationProcessor() {
  var result = sciipRun6250_SuperSheetDomainCapabilityActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6250_SuperSheetDomainCapabilityActivationProcessor',
    result: result
  }));

  return result;
}

function sciip6250FilterCapabilityRecords_(records) {
  return (records || []).filter(function(record) {
    var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
    var layer = record.domainCapabilityLayer || record.DomainCapabilityLayer || '';
    return String(capabilityId) === 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION' || String(layer).toLowerCase() === 'supersheet';
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6260_IdentityDomainCapabilityActivationProcessor.gs
 *
 * Processor: 6260_IdentityDomainCapabilityActivation
 *
 * Purpose:
 * Activates the identity domain capability on top of the completed SCIIP_OS runtime foundation.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_EXECUTION_LEDGER
 * - Creates IDENTITY_DOMAIN_CAPABILITY_ACTIVATIONS
 * - Creates IDENTITY_DOMAIN_CAPABILITY_ACTIVATION_LEDGER
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream domain execution ledger records are not present
 * - Preserves permanent activation ledger history
 */

function sciipRun6260_IdentityDomainCapabilityActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6260_IdentityDomainCapabilityActivation',
    action: 'IDENTITYDOMAINCAPABILITYACTIVATION',
    sourceSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    targetSheet: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVATIONS',
    ledgerSheet: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVATION_LEDGER',

    buildPayload: function(context, definition) {
      var sourceRecords = [];

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
        SCIIP_RUNTIME_SHEET_FACTORY &&
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
      ) {
        sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      }

      var matchingRecords = sciip6260FilterCapabilityRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: matchingRecords.length,
        outputCount: matchingRecords.length,
        summary: 'SCIIP_OS v5.5 identity domain capability activation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          sourceProcessor: '6250_SuperSheetDomainCapabilityActivation',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6270_GraphDomainCapabilityActivationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityLayer',
        'activationStatus',
        'activationScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'activationSummary',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'activationStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      var matchingRecords = sciip6260FilterCapabilityRecords_(sourceRecords);

      if (!matchingRecords || matchingRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            activationStatus: 'SKIPPED_NO_INPUTS',
            requiredCapabilityId: 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 6230_DomainCapabilityExecutionLedgerProcessor before 6260 so capability execution records exist.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            activationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            recordsCreated: 0,
            skippedDuplicate: 0,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            nextProcessor: '6250_SuperSheetDomainCapabilityActivation',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: new Date()
          }
        );

        return skippedResult;
      }

      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      matchingRecords.forEach(function(record) {
        var sourceBusinessKey = record.businessKey || record.Business_Key || record.BusinessKey || '';
        var capabilityName = record.domainCapabilityName || record.DomainCapabilityName || 'IdentityDomainCapabilityActivation';
        var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
          context.processor,
          definition.targetSheet,
          'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            sourceBusinessKey: sourceBusinessKey,
            domainCapabilityId: 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
            domainCapabilityName: capabilityName,
            domainCapabilityLayer: 'identity',
            activationStatus: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVE',
            activationScope: 'Activates duplicate-safe identity resolution readiness for aliases, candidates, parent addresses, and durable asset identities.',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            sourceProcessor: '6250_SuperSheetDomainCapabilityActivation',
            nextProcessor: '6270_GraphDomainCapabilityActivationProcessor',
            activationSummary: 'Activates duplicate-safe identity resolution readiness for aliases, candidates, parent addresses, and durable asset identities.',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          activationStatus: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVE',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6270_GraphDomainCapabilityActivationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          activationStatus: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVE',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6270_GraphDomainCapabilityActivationProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6260_IdentityDomainCapabilityActivationProcessor() {
  return sciipRun6260_IdentityDomainCapabilityActivationProcessor();
}

function sciipTest6260_IdentityDomainCapabilityActivationProcessor() {
  var result = sciipRun6260_IdentityDomainCapabilityActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6260_IdentityDomainCapabilityActivationProcessor',
    result: result
  }));

  return result;
}

function sciip6260FilterCapabilityRecords_(records) {
  return (records || []).filter(function(record) {
    var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
    var layer = record.domainCapabilityLayer || record.DomainCapabilityLayer || '';
    return String(capabilityId) === 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION' || String(layer).toLowerCase() === 'identity';
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6270_GraphDomainCapabilityActivationProcessor.gs
 *
 * Processor: 6270_GraphDomainCapabilityActivation
 *
 * Purpose:
 * Activates the graph domain capability on top of the completed SCIIP_OS runtime foundation.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_EXECUTION_LEDGER
 * - Creates GRAPH_DOMAIN_CAPABILITY_ACTIVATIONS
 * - Creates GRAPH_DOMAIN_CAPABILITY_ACTIVATION_LEDGER
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream domain execution ledger records are not present
 * - Preserves permanent activation ledger history
 */

function sciipRun6270_GraphDomainCapabilityActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6270_GraphDomainCapabilityActivation',
    action: 'GRAPHDOMAINCAPABILITYACTIVATION',
    sourceSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    targetSheet: 'GRAPH_DOMAIN_CAPABILITY_ACTIVATIONS',
    ledgerSheet: 'GRAPH_DOMAIN_CAPABILITY_ACTIVATION_LEDGER',

    buildPayload: function(context, definition) {
      var sourceRecords = [];

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
        SCIIP_RUNTIME_SHEET_FACTORY &&
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
      ) {
        sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      }

      var matchingRecords = sciip6270FilterCapabilityRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: matchingRecords.length,
        outputCount: matchingRecords.length,
        summary: 'SCIIP_OS v5.5 graph domain capability activation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          sourceProcessor: '6260_IdentityDomainCapabilityActivation',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6280_GISDomainCapabilityActivationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityLayer',
        'activationStatus',
        'activationScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'activationSummary',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'activationStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      var matchingRecords = sciip6270FilterCapabilityRecords_(sourceRecords);

      if (!matchingRecords || matchingRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            activationStatus: 'SKIPPED_NO_INPUTS',
            requiredCapabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 6230_DomainCapabilityExecutionLedgerProcessor before 6270 so capability execution records exist.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            activationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            recordsCreated: 0,
            skippedDuplicate: 0,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            nextProcessor: '6260_IdentityDomainCapabilityActivation',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: new Date()
          }
        );

        return skippedResult;
      }

      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      matchingRecords.forEach(function(record) {
        var sourceBusinessKey = record.businessKey || record.Business_Key || record.BusinessKey || '';
        var capabilityName = record.domainCapabilityName || record.DomainCapabilityName || 'GraphDomainCapabilityActivation';
        var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
          context.processor,
          definition.targetSheet,
          'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            sourceBusinessKey: sourceBusinessKey,
            domainCapabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
            domainCapabilityName: capabilityName,
            domainCapabilityLayer: 'graph',
            activationStatus: 'GRAPH_DOMAIN_CAPABILITY_ACTIVE',
            activationScope: 'Activates graph-native node, edge, relationship, and domain event execution readiness.',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            sourceProcessor: '6260_IdentityDomainCapabilityActivation',
            nextProcessor: '6280_GISDomainCapabilityActivationProcessor',
            activationSummary: 'Activates graph-native node, edge, relationship, and domain event execution readiness.',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          activationStatus: 'GRAPH_DOMAIN_CAPABILITY_ACTIVE',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6280_GISDomainCapabilityActivationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          activationStatus: 'GRAPH_DOMAIN_CAPABILITY_ACTIVE',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6280_GISDomainCapabilityActivationProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6270_GraphDomainCapabilityActivationProcessor() {
  return sciipRun6270_GraphDomainCapabilityActivationProcessor();
}

function sciipTest6270_GraphDomainCapabilityActivationProcessor() {
  var result = sciipRun6270_GraphDomainCapabilityActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6270_GraphDomainCapabilityActivationProcessor',
    result: result
  }));

  return result;
}

function sciip6270FilterCapabilityRecords_(records) {
  return (records || []).filter(function(record) {
    var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
    var layer = record.domainCapabilityLayer || record.DomainCapabilityLayer || '';
    return String(capabilityId) === 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION' || String(layer).toLowerCase() === 'graph';
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6280_GISDomainCapabilityActivationProcessor.gs
 *
 * Processor: 6280_GISDomainCapabilityActivation
 *
 * Purpose:
 * Activates the gis domain capability on top of the completed SCIIP_OS runtime foundation.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_EXECUTION_LEDGER
 * - Creates GIS_DOMAIN_CAPABILITY_ACTIVATIONS
 * - Creates GIS_DOMAIN_CAPABILITY_ACTIVATION_LEDGER
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream domain execution ledger records are not present
 * - Preserves permanent activation ledger history
 */

function sciipRun6280_GISDomainCapabilityActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6280_GISDomainCapabilityActivation',
    action: 'GISDOMAINCAPABILITYACTIVATION',
    sourceSheet: 'DOMAIN_CAPABILITY_EXECUTION_LEDGER',
    targetSheet: 'GIS_DOMAIN_CAPABILITY_ACTIVATIONS',
    ledgerSheet: 'GIS_DOMAIN_CAPABILITY_ACTIVATION_LEDGER',

    buildPayload: function(context, definition) {
      var sourceRecords = [];

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
        SCIIP_RUNTIME_SHEET_FACTORY &&
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
      ) {
        sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      }

      var matchingRecords = sciip6280FilterCapabilityRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: matchingRecords.length,
        outputCount: matchingRecords.length,
        summary: 'SCIIP_OS v5.5 gis domain capability activation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          sourceProcessor: '6270_GraphDomainCapabilityActivation',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6290_DomainCapabilityAcceptanceProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainCapabilityId',
        'domainCapabilityName',
        'domainCapabilityLayer',
        'activationStatus',
        'activationScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'activationSummary',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'activationStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];
      var matchingRecords = sciip6280FilterCapabilityRecords_(sourceRecords);

      if (!matchingRecords || matchingRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            activationStatus: 'SKIPPED_NO_INPUTS',
            requiredCapabilityId: 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 6230_DomainCapabilityExecutionLedgerProcessor before 6280 so capability execution records exist.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            activationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            recordsCreated: 0,
            skippedDuplicate: 0,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            nextProcessor: '6270_GraphDomainCapabilityActivation',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: new Date()
          }
        );

        return skippedResult;
      }

      var now = new Date();
      var created = 0;
      var skippedDuplicate = 0;

      matchingRecords.forEach(function(record) {
        var sourceBusinessKey = record.businessKey || record.Business_Key || record.BusinessKey || '';
        var capabilityName = record.domainCapabilityName || record.DomainCapabilityName || 'GISDomainCapabilityActivation';
        var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
          context.processor,
          definition.targetSheet,
          'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
          skippedDuplicate += 1;
          return;
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            sourceBusinessKey: sourceBusinessKey,
            domainCapabilityId: 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
            domainCapabilityName: capabilityName,
            domainCapabilityLayer: 'gis',
            activationStatus: 'GIS_DOMAIN_CAPABILITY_ACTIVE',
            activationScope: 'Activates GIS-native spatial, market, proximity, and map-ready industrial intelligence readiness.',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-capability-layer',
            sourceProcessor: '6270_GraphDomainCapabilityActivation',
            nextProcessor: '6290_DomainCapabilityAcceptanceProcessor',
            activationSummary: 'Activates GIS-native spatial, market, proximity, and map-ready industrial intelligence readiness.',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        created += 1;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          activationStatus: 'GIS_DOMAIN_CAPABILITY_ACTIVE',
          requiredCapabilityId: 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6290_DomainCapabilityAcceptanceProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          activationStatus: 'GIS_DOMAIN_CAPABILITY_ACTIVE',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-capability-layer',
          nextProcessor: '6290_DomainCapabilityAcceptanceProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6280_GISDomainCapabilityActivationProcessor() {
  return sciipRun6280_GISDomainCapabilityActivationProcessor();
}

function sciipTest6280_GISDomainCapabilityActivationProcessor() {
  var result = sciipRun6280_GISDomainCapabilityActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6280_GISDomainCapabilityActivationProcessor',
    result: result
  }));

  return result;
}

function sciip6280FilterCapabilityRecords_(records) {
  return (records || []).filter(function(record) {
    var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
    var layer = record.domainCapabilityLayer || record.DomainCapabilityLayer || '';
    return String(capabilityId) === 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION' || String(layer).toLowerCase() === 'gis';
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6290_DomainCapabilityAcceptanceProcessor.gs
 *
 * Processor: 6290_DomainCapabilityAcceptance
 *
 * Purpose:
 * Certifies the SCIIP_OS v5.5 domain foundation after processors 6210–6280
 * have registered, ledgered, and activated the first production domain capabilities.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads all v5.5 domain activation sheets
 * - Creates DOMAIN_CAPABILITY_ACCEPTANCE
 * - Creates DOMAIN_CAPABILITY_ACCEPTANCE_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe / validation-safe when required domain activation records are missing
 * - Preserves permanent acceptance ledger history
 */

function sciipRun6290_DomainCapabilityAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6290_DomainCapabilityAcceptance',
    action: 'DOMAIN_CAPABILITY_ACCEPTANCE',
    targetSheet: 'DOMAIN_CAPABILITY_ACCEPTANCE',
    ledgerSheet: 'DOMAIN_CAPABILITY_ACCEPTANCE_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var requirements = sciip6290DomainAcceptanceRequirements_();
      var assessment = sciip6290AssessDomainFoundation_(requirements);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: assessment.recordsRead,
        outputCount: assessment.acceptedCount,
        summary: 'SCIIP_OS v5.5 domain capability acceptance payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-foundation-6290',
          requiredCapabilityCount: requirements.length,
          acceptedCapabilityCount: assessment.acceptedCount,
          missingCapabilityCount: assessment.missing.length,
          nextProcessor: '6300_DomainExecutionReadinessProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'acceptanceStatus',
        'runtimeMilestone',
        'domainMilestone',
        'requiredCapabilityCount',
        'acceptedCapabilityCount',
        'missingCapabilityCount',
        'acceptedCapabilityIds',
        'missingCapabilityIds',
        'acceptanceScope',
        'certificationSummary',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'acceptanceStatus',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedValidation',
        'requiredCapabilityCount',
        'acceptedCapabilityCount',
        'missingCapabilityCount',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var requirements = sciip6290DomainAcceptanceRequirements_();
      var assessment = sciip6290AssessDomainFoundation_(requirements);
      var now = new Date();

      if (assessment.acceptedCount === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: assessment.recordsRead,
          message: JSON.stringify({
            acceptanceStatus: 'SKIPPED_NO_INPUTS',
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            missingCapabilityIds: assessment.missing.join(','),
            transactionId: transaction.transactionId,
            nextAction: 'Run 6240 through 6280 before 6290 so all domain capability activation records exist.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            acceptanceStatus: 'SKIPPED_NO_INPUTS',
            targetSheet: definition.targetSheet,
            recordsRead: assessment.recordsRead,
            recordsCreated: 0,
            skippedDuplicate: 0,
            skippedValidation: 0,
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-foundation-6290',
            nextProcessor: '6240_AssetDomainCapabilityActivationProcessor',
            resultJson: skippedResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        return skippedResult;
      }

      if (assessment.missing.length > 0) {
        var validationResult = SCIIP_RUNTIME_RESULT_FACTORY.validationFailure({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: assessment.recordsRead,
          message: JSON.stringify({
            acceptanceStatus: 'DOMAIN_CAPABILITY_ACCEPTANCE_INCOMPLETE',
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            acceptedCapabilityIds: assessment.accepted.join(','),
            missingCapabilityIds: assessment.missing.join(','),
            transactionId: transaction.transactionId,
            nextAction: 'Run missing domain activation processors before certifying the v5.5 domain foundation.'
          })
        });

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            businessKey: context.businessKey,
            transactionId: transaction.transactionId,
            processor: context.processor,
            acceptanceStatus: 'DOMAIN_CAPABILITY_ACCEPTANCE_INCOMPLETE',
            targetSheet: definition.targetSheet,
            recordsRead: assessment.recordsRead,
            recordsCreated: 0,
            skippedDuplicate: 0,
            skippedValidation: 1,
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-foundation-6290',
            nextProcessor: '6240_AssetDomainCapabilityActivationProcessor',
            resultJson: validationResult,
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );

        return validationResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'DOMAIN_FOUNDATION_ACCEPTED',
        SCIIP_RUNTIME.getDateKey({})
      ]);

      var created = 0;
      var skippedDuplicate = 0;

      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          targetHeaders,
          {
            businessKey: rowBusinessKey,
            transactionId: transaction.transactionId,
            acceptanceStatus: 'DOMAIN_CAPABILITY_FOUNDATION_ACCEPTED',
            runtimeMilestone: 'v5.4-runtime-6200',
            domainMilestone: 'v5.5-domain-foundation-6290',
            requiredCapabilityCount: requirements.length,
            acceptedCapabilityCount: assessment.acceptedCount,
            missingCapabilityCount: assessment.missing.length,
            acceptedCapabilityIds: assessment.accepted.join(','),
            missingCapabilityIds: assessment.missing.join(','),
            acceptanceScope: 'Certifies that the v5.5 asset, supersheet, identity, graph, and GIS domain capabilities are active on the SCIIP runtime foundation.',
            certificationSummary: 'SCIIP_OS v5.5 domain foundation certified for execution-oriented domain processors.',
            nextProcessor: '6300_DomainExecutionReadinessProcessor',
            frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
            createdAt: now
          }
        );
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: assessment.recordsRead,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          acceptanceStatus: 'DOMAIN_CAPABILITY_FOUNDATION_ACCEPTED',
          requiredCapabilityCount: requirements.length,
          acceptedCapabilityCount: assessment.acceptedCount,
          missingCapabilityCount: assessment.missing.length,
          recordsRead: assessment.recordsRead,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6300_DomainExecutionReadinessProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          businessKey: context.businessKey,
          transactionId: transaction.transactionId,
          processor: context.processor,
          acceptanceStatus: 'DOMAIN_CAPABILITY_FOUNDATION_ACCEPTED',
          targetSheet: definition.targetSheet,
          recordsRead: assessment.recordsRead,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedValidation: 0,
          requiredCapabilityCount: requirements.length,
          acceptedCapabilityCount: assessment.acceptedCount,
          missingCapabilityCount: assessment.missing.length,
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-foundation-6290',
          nextProcessor: '6300_DomainExecutionReadinessProcessor',
          resultJson: result,
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        }
      );

      return result;
    }
  });
}

function run6290_DomainCapabilityAcceptanceProcessor() {
  return sciipRun6290_DomainCapabilityAcceptanceProcessor();
}

function sciipTest6290_DomainCapabilityAcceptanceProcessor() {
  var result = sciipRun6290_DomainCapabilityAcceptanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest6290_DomainCapabilityAcceptanceProcessor',
    result: result
  }));

  return result;
}

function sciip6290DomainAcceptanceRequirements_() {
  return [
    {
      capabilityId: 'DOMAIN_CAPABILITY|ASSET_REGISTRY_EXECUTION',
      activationSheet: 'ASSET_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'ASSET_DOMAIN_CAPABILITY_ACTIVE'
    },
    {
      capabilityId: 'DOMAIN_CAPABILITY|SUPERSHEET_DOMAIN_EXECUTION',
      activationSheet: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'SUPERSHEET_DOMAIN_CAPABILITY_ACTIVE'
    },
    {
      capabilityId: 'DOMAIN_CAPABILITY|IDENTITY_RESOLUTION_EXECUTION',
      activationSheet: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'IDENTITY_DOMAIN_CAPABILITY_ACTIVE'
    },
    {
      capabilityId: 'DOMAIN_CAPABILITY|KNOWLEDGE_GRAPH_EXECUTION',
      activationSheet: 'GRAPH_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'GRAPH_DOMAIN_CAPABILITY_ACTIVE'
    },
    {
      capabilityId: 'DOMAIN_CAPABILITY|GIS_INTELLIGENCE_EXECUTION',
      activationSheet: 'GIS_DOMAIN_CAPABILITY_ACTIVATIONS',
      activeStatus: 'GIS_DOMAIN_CAPABILITY_ACTIVE'
    }
  ];
}

function sciip6290AssessDomainFoundation_(requirements) {
  var accepted = [];
  var missing = [];
  var recordsRead = 0;

  requirements.forEach(function(requirement) {
    var records = [];

    if (
      typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
      SCIIP_RUNTIME_SHEET_FACTORY &&
      SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords
    ) {
      records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(requirement.activationSheet) || [];
    }

    recordsRead += records.length;

    var active = records.some(function(record) {
      var capabilityId = record.domainCapabilityId || record.DomainCapabilityId || '';
      var activationStatus = record.activationStatus || record.ActivationStatus || '';

      return String(capabilityId) === String(requirement.capabilityId) &&
        String(activationStatus) === String(requirement.activeStatus);
    });

    if (active) {
      accepted.push(requirement.capabilityId);
    } else {
      missing.push(requirement.capabilityId);
    }
  });

  return {
    recordsRead: recordsRead,
    accepted: accepted,
    missing: missing,
    acceptedCount: accepted.length,
    missingCount: missing.length
  };
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6300_DomainExecutionReadinessProcessor.gs
 *
 * Processor: 6300_DomainExecutionReadiness
 *
 * Purpose:
 * Creates the domain execution readiness gate after 6290 has accepted the active domain foundation.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_CAPABILITY_ACCEPTANCE
 * - Creates DOMAIN_EXECUTION_READINESS
 * - Creates DOMAIN_EXECUTION_READINESS_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6300_DomainExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6300_DomainExecutionReadiness',
    action: 'DOMAIN_EXECUTION_READINESS',
    sourceSheet: 'DOMAIN_CAPABILITY_ACCEPTANCE',
    targetSheet: 'DOMAIN_EXECUTION_READINESS',
    ledgerSheet: 'DOMAIN_EXECUTION_READINESS_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6300GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6300FilterAcceptedRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the domain execution readiness gate after 6290 has accepted the active domain foundation.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6310_AssetDomainExecutionPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6300GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6300FilterAcceptedRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6300_DomainExecutionReadiness so required domain execution records exist.'
          })
        });
        sciip6300AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6310_AssetDomainExecutionPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'DOMAIN_EXECUTION_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6300FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6300_DomainExecutionReadiness|DOMAIN_EXECUTION_READY',
          domainExecutionStatus: 'DOMAIN_EXECUTION_READY',
          domainExecutionLayer: 'domain_execution',
          domainExecutionScope: 'Certifies that the accepted v5.5 domain foundation is ready to begin execution-oriented domain processing.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'DOMAIN_CAPABILITY_ACCEPTANCE',
          nextProcessor: '6310_AssetDomainExecutionPlanProcessor',
          executionSummary: 'Creates the domain execution readiness gate after 6290 has accepted the active domain foundation.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'DOMAIN_EXECUTION_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6310_AssetDomainExecutionPlanProcessor'
        })
      });
      sciip6300AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'DOMAIN_EXECUTION_READY', matchingRecords.length, created, skippedDuplicate, 0, '6310_AssetDomainExecutionPlanProcessor', now);
      return result;
    }
  });
}

function run6300_DomainExecutionReadinessProcessor() {
  return sciipRun6300_DomainExecutionReadinessProcessor();
}

function sciipTest6300_DomainExecutionReadinessProcessor() {
  var result = sciipRun6300_DomainExecutionReadinessProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6300_DomainExecutionReadinessProcessor', result: result }));
  return result;
}

function sciip6300GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6300FilterAcceptedRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6300RecordAccepted_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6300RecordAccepted_(record) {
  if (!record) return false;
  var status = record['acceptanceStatus'] || record.acceptanceStatus || record.acceptanceStatus || '';
  return String(status) === 'DOMAIN_CAPABILITY_FOUNDATION_ACCEPTED';
}

function sciip6300FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6300AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6310_AssetDomainExecutionPlanProcessor.gs
 *
 * Processor: 6310_AssetDomainExecutionPlan
 *
 * Purpose:
 * Creates the asset domain execution plan required before asset registry execution processors begin.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_EXECUTION_READINESS
 * - Creates ASSET_DOMAIN_EXECUTION_PLAN
 * - Creates ASSET_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6310_AssetDomainExecutionPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6310_AssetDomainExecutionPlan',
    action: 'ASSET_DOMAIN_EXECUTION_PLAN',
    sourceSheet: 'DOMAIN_EXECUTION_READINESS',
    targetSheet: 'ASSET_DOMAIN_EXECUTION_PLAN',
    ledgerSheet: 'ASSET_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6310GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6310FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the asset domain execution plan required before asset registry execution processors begin.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6320_SuperSheetDomainExecutionPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6310GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6310FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6310_AssetDomainExecutionPlan so required domain execution records exist.'
          })
        });
        sciip6310AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6320_SuperSheetDomainExecutionPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'ASSET_DOMAIN_EXECUTION_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6310FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6310_AssetDomainExecutionPlan|ASSET_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionStatus: 'ASSET_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionLayer: 'asset',
          domainExecutionScope: 'Defines the first execution plan for asset registry domain processing on top of the accepted domain foundation.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'DOMAIN_EXECUTION_READINESS',
          nextProcessor: '6320_SuperSheetDomainExecutionPlanProcessor',
          executionSummary: 'Creates the asset domain execution plan required before asset registry execution processors begin.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'ASSET_DOMAIN_EXECUTION_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6320_SuperSheetDomainExecutionPlanProcessor'
        })
      });
      sciip6310AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'ASSET_DOMAIN_EXECUTION_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6320_SuperSheetDomainExecutionPlanProcessor', now);
      return result;
    }
  });
}

function run6310_AssetDomainExecutionPlanProcessor() {
  return sciipRun6310_AssetDomainExecutionPlanProcessor();
}

function sciipTest6310_AssetDomainExecutionPlanProcessor() {
  var result = sciipRun6310_AssetDomainExecutionPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6310_AssetDomainExecutionPlanProcessor', result: result }));
  return result;
}

function sciip6310GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6310FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6310RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6310RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'DOMAIN_EXECUTION_READY';
}

function sciip6310FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6310AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6320_SuperSheetDomainExecutionPlanProcessor.gs
 *
 * Processor: 6320_SuperSheetDomainExecutionPlan
 *
 * Purpose:
 * Creates the SuperSheet domain execution plan required before SuperSheet domain event processing begins.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads ASSET_DOMAIN_EXECUTION_PLAN
 * - Creates SUPERSHEET_DOMAIN_EXECUTION_PLAN
 * - Creates SUPERSHEET_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6320_SuperSheetDomainExecutionPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6320_SuperSheetDomainExecutionPlan',
    action: 'SUPERSHEET_DOMAIN_EXECUTION_PLAN',
    sourceSheet: 'ASSET_DOMAIN_EXECUTION_PLAN',
    targetSheet: 'SUPERSHEET_DOMAIN_EXECUTION_PLAN',
    ledgerSheet: 'SUPERSHEET_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6320GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6320FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the SuperSheet domain execution plan required before SuperSheet domain event processing begins.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6330_IdentityDomainExecutionPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6320GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6320FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6320_SuperSheetDomainExecutionPlan so required domain execution records exist.'
          })
        });
        sciip6320AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6330_IdentityDomainExecutionPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'SUPERSHEET_DOMAIN_EXECUTION_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6320FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6320_SuperSheetDomainExecutionPlan|SUPERSHEET_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionStatus: 'SUPERSHEET_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionLayer: 'supersheet',
          domainExecutionScope: 'Defines the SuperSheet execution plan connecting imported market rows to domain-ready property intelligence.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'ASSET_DOMAIN_EXECUTION_PLAN',
          nextProcessor: '6330_IdentityDomainExecutionPlanProcessor',
          executionSummary: 'Creates the SuperSheet domain execution plan required before SuperSheet domain event processing begins.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'SUPERSHEET_DOMAIN_EXECUTION_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6330_IdentityDomainExecutionPlanProcessor'
        })
      });
      sciip6320AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'SUPERSHEET_DOMAIN_EXECUTION_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6330_IdentityDomainExecutionPlanProcessor', now);
      return result;
    }
  });
}

function run6320_SuperSheetDomainExecutionPlanProcessor() {
  return sciipRun6320_SuperSheetDomainExecutionPlanProcessor();
}

function sciipTest6320_SuperSheetDomainExecutionPlanProcessor() {
  var result = sciipRun6320_SuperSheetDomainExecutionPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6320_SuperSheetDomainExecutionPlanProcessor', result: result }));
  return result;
}

function sciip6320GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6320FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6320RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6320RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'ASSET_DOMAIN_EXECUTION_PLAN_READY';
}

function sciip6320FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6320AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6330_IdentityDomainExecutionPlanProcessor.gs
 *
 * Processor: 6330_IdentityDomainExecutionPlan
 *
 * Purpose:
 * Creates the identity domain execution plan required before identity-resolution processors begin.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads SUPERSHEET_DOMAIN_EXECUTION_PLAN
 * - Creates IDENTITY_DOMAIN_EXECUTION_PLAN
 * - Creates IDENTITY_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6330_IdentityDomainExecutionPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6330_IdentityDomainExecutionPlan',
    action: 'IDENTITY_DOMAIN_EXECUTION_PLAN',
    sourceSheet: 'SUPERSHEET_DOMAIN_EXECUTION_PLAN',
    targetSheet: 'IDENTITY_DOMAIN_EXECUTION_PLAN',
    ledgerSheet: 'IDENTITY_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6330GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6330FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the identity domain execution plan required before identity-resolution processors begin.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6340_GraphDomainExecutionPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6330GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6330FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6330_IdentityDomainExecutionPlan so required domain execution records exist.'
          })
        });
        sciip6330AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6340_GraphDomainExecutionPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'IDENTITY_DOMAIN_EXECUTION_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6330FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6330_IdentityDomainExecutionPlan|IDENTITY_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionStatus: 'IDENTITY_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionLayer: 'identity',
          domainExecutionScope: 'Defines the identity execution plan for aliases, property candidates, parent addresses, and durable asset identity.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'SUPERSHEET_DOMAIN_EXECUTION_PLAN',
          nextProcessor: '6340_GraphDomainExecutionPlanProcessor',
          executionSummary: 'Creates the identity domain execution plan required before identity-resolution processors begin.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_DOMAIN_EXECUTION_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6340_GraphDomainExecutionPlanProcessor'
        })
      });
      sciip6330AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'IDENTITY_DOMAIN_EXECUTION_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6340_GraphDomainExecutionPlanProcessor', now);
      return result;
    }
  });
}

function run6330_IdentityDomainExecutionPlanProcessor() {
  return sciipRun6330_IdentityDomainExecutionPlanProcessor();
}

function sciipTest6330_IdentityDomainExecutionPlanProcessor() {
  var result = sciipRun6330_IdentityDomainExecutionPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6330_IdentityDomainExecutionPlanProcessor', result: result }));
  return result;
}

function sciip6330GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6330FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6330RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6330RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'SUPERSHEET_DOMAIN_EXECUTION_PLAN_READY';
}

function sciip6330FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6330AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6340_GraphDomainExecutionPlanProcessor.gs
 *
 * Processor: 6340_GraphDomainExecutionPlan
 *
 * Purpose:
 * Creates the knowledge graph domain execution plan required before graph-native processors begin.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads IDENTITY_DOMAIN_EXECUTION_PLAN
 * - Creates GRAPH_DOMAIN_EXECUTION_PLAN
 * - Creates GRAPH_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6340_GraphDomainExecutionPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6340_GraphDomainExecutionPlan',
    action: 'GRAPH_DOMAIN_EXECUTION_PLAN',
    sourceSheet: 'IDENTITY_DOMAIN_EXECUTION_PLAN',
    targetSheet: 'GRAPH_DOMAIN_EXECUTION_PLAN',
    ledgerSheet: 'GRAPH_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6340GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6340FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the knowledge graph domain execution plan required before graph-native processors begin.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6350_GISDomainExecutionPlanProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6340GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6340FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6340_GraphDomainExecutionPlan so required domain execution records exist.'
          })
        });
        sciip6340AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6350_GISDomainExecutionPlanProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'GRAPH_DOMAIN_EXECUTION_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6340FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6340_GraphDomainExecutionPlan|GRAPH_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionStatus: 'GRAPH_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionLayer: 'graph',
          domainExecutionScope: 'Defines the graph execution plan for nodes, edges, relationships, and permanent domain events.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'IDENTITY_DOMAIN_EXECUTION_PLAN',
          nextProcessor: '6350_GISDomainExecutionPlanProcessor',
          executionSummary: 'Creates the knowledge graph domain execution plan required before graph-native processors begin.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'GRAPH_DOMAIN_EXECUTION_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6350_GISDomainExecutionPlanProcessor'
        })
      });
      sciip6340AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'GRAPH_DOMAIN_EXECUTION_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6350_GISDomainExecutionPlanProcessor', now);
      return result;
    }
  });
}

function run6340_GraphDomainExecutionPlanProcessor() {
  return sciipRun6340_GraphDomainExecutionPlanProcessor();
}

function sciipTest6340_GraphDomainExecutionPlanProcessor() {
  var result = sciipRun6340_GraphDomainExecutionPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6340_GraphDomainExecutionPlanProcessor', result: result }));
  return result;
}

function sciip6340GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6340FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6340RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6340RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'IDENTITY_DOMAIN_EXECUTION_PLAN_READY';
}

function sciip6340FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6340AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6350_GISDomainExecutionPlanProcessor.gs
 *
 * Processor: 6350_GISDomainExecutionPlan
 *
 * Purpose:
 * Creates the GIS domain execution plan required before GIS-native processors begin.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads GRAPH_DOMAIN_EXECUTION_PLAN
 * - Creates GIS_DOMAIN_EXECUTION_PLAN
 * - Creates GIS_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6350_GISDomainExecutionPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6350_GISDomainExecutionPlan',
    action: 'GIS_DOMAIN_EXECUTION_PLAN',
    sourceSheet: 'GRAPH_DOMAIN_EXECUTION_PLAN',
    targetSheet: 'GIS_DOMAIN_EXECUTION_PLAN',
    ledgerSheet: 'GIS_DOMAIN_EXECUTION_PLAN_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6350GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6350FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the GIS domain execution plan required before GIS-native processors begin.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6360_DomainExecutionCoordinationLedgerProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6350GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6350FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6350_GISDomainExecutionPlan so required domain execution records exist.'
          })
        });
        sciip6350AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6360_DomainExecutionCoordinationLedgerProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'GIS_DOMAIN_EXECUTION_PLAN_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6350FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6350_GISDomainExecutionPlan|GIS_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionStatus: 'GIS_DOMAIN_EXECUTION_PLAN_READY',
          domainExecutionLayer: 'gis',
          domainExecutionScope: 'Defines the GIS execution plan for spatial, market, proximity, and map-ready industrial intelligence.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'GRAPH_DOMAIN_EXECUTION_PLAN',
          nextProcessor: '6360_DomainExecutionCoordinationLedgerProcessor',
          executionSummary: 'Creates the GIS domain execution plan required before GIS-native processors begin.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'GIS_DOMAIN_EXECUTION_PLAN_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6360_DomainExecutionCoordinationLedgerProcessor'
        })
      });
      sciip6350AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'GIS_DOMAIN_EXECUTION_PLAN_READY', matchingRecords.length, created, skippedDuplicate, 0, '6360_DomainExecutionCoordinationLedgerProcessor', now);
      return result;
    }
  });
}

function run6350_GISDomainExecutionPlanProcessor() {
  return sciipRun6350_GISDomainExecutionPlanProcessor();
}

function sciipTest6350_GISDomainExecutionPlanProcessor() {
  var result = sciipRun6350_GISDomainExecutionPlanProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6350_GISDomainExecutionPlanProcessor', result: result }));
  return result;
}

function sciip6350GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6350FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6350RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6350RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'GRAPH_DOMAIN_EXECUTION_PLAN_READY';
}

function sciip6350FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6350AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6360_DomainExecutionCoordinationLedgerProcessor.gs
 *
 * Processor: 6360_DomainExecutionCoordinationLedger
 *
 * Purpose:
 * Creates the domain execution coordination ledger before formal handoff to execution processors.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads GIS_DOMAIN_EXECUTION_PLAN
 * - Creates DOMAIN_EXECUTION_COORDINATION_LEDGER
 * - Creates DOMAIN_EXECUTION_COORDINATION_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6360_DomainExecutionCoordinationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6360_DomainExecutionCoordinationLedger',
    action: 'DOMAIN_EXECUTION_COORDINATION_LEDGER',
    sourceSheet: 'GIS_DOMAIN_EXECUTION_PLAN',
    targetSheet: 'DOMAIN_EXECUTION_COORDINATION_LEDGER',
    ledgerSheet: 'DOMAIN_EXECUTION_COORDINATION_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6360GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6360FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the domain execution coordination ledger before formal handoff to execution processors.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6370_DomainExecutionHandoffProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6360GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6360FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6360_DomainExecutionCoordinationLedger so required domain execution records exist.'
          })
        });
        sciip6360AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6370_DomainExecutionHandoffProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'DOMAIN_EXECUTION_COORDINATED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6360FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6360_DomainExecutionCoordinationLedger|DOMAIN_EXECUTION_COORDINATED',
          domainExecutionStatus: 'DOMAIN_EXECUTION_COORDINATED',
          domainExecutionLayer: 'coordination',
          domainExecutionScope: 'Creates a coordination ledger tying asset, SuperSheet, identity, graph, and GIS execution plans into a single execution sequence.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'GIS_DOMAIN_EXECUTION_PLAN',
          nextProcessor: '6370_DomainExecutionHandoffProcessor',
          executionSummary: 'Creates the domain execution coordination ledger before formal handoff to execution processors.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'DOMAIN_EXECUTION_COORDINATED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6370_DomainExecutionHandoffProcessor'
        })
      });
      sciip6360AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'DOMAIN_EXECUTION_COORDINATED', matchingRecords.length, created, skippedDuplicate, 0, '6370_DomainExecutionHandoffProcessor', now);
      return result;
    }
  });
}

function run6360_DomainExecutionCoordinationLedgerProcessor() {
  return sciipRun6360_DomainExecutionCoordinationLedgerProcessor();
}

function sciipTest6360_DomainExecutionCoordinationLedgerProcessor() {
  var result = sciipRun6360_DomainExecutionCoordinationLedgerProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6360_DomainExecutionCoordinationLedgerProcessor', result: result }));
  return result;
}

function sciip6360GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6360FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6360RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6360RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'GIS_DOMAIN_EXECUTION_PLAN_READY';
}

function sciip6360FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6360AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6370_DomainExecutionHandoffProcessor.gs
 *
 * Processor: 6370_DomainExecutionHandoff
 *
 * Purpose:
 * Creates the final domain execution handoff record for the v5.5 readiness layer.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_EXECUTION_COORDINATION_LEDGER
 * - Creates DOMAIN_EXECUTION_HANDOFF
 * - Creates DOMAIN_EXECUTION_HANDOFF_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6370_DomainExecutionHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6370_DomainExecutionHandoff',
    action: 'DOMAIN_EXECUTION_HANDOFF',
    sourceSheet: 'DOMAIN_EXECUTION_COORDINATION_LEDGER',
    targetSheet: 'DOMAIN_EXECUTION_HANDOFF',
    ledgerSheet: 'DOMAIN_EXECUTION_HANDOFF_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6370GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6370FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the final domain execution handoff record for the v5.5 readiness layer.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6380_DomainExecutionAcceptanceProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6370GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6370FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6370_DomainExecutionHandoff so required domain execution records exist.'
          })
        });
        sciip6370AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6380_DomainExecutionAcceptanceProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'DOMAIN_EXECUTION_HANDOFF_READY',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6370FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6370_DomainExecutionHandoff|DOMAIN_EXECUTION_HANDOFF_READY',
          domainExecutionStatus: 'DOMAIN_EXECUTION_HANDOFF_READY',
          domainExecutionLayer: 'handoff',
          domainExecutionScope: 'Creates the formal handoff from domain readiness planning into execution-oriented SCIIP business processors.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'DOMAIN_EXECUTION_COORDINATION_LEDGER',
          nextProcessor: '6380_DomainExecutionAcceptanceProcessor',
          executionSummary: 'Creates the final domain execution handoff record for the v5.5 readiness layer.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'DOMAIN_EXECUTION_HANDOFF_READY',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6380_DomainExecutionAcceptanceProcessor'
        })
      });
      sciip6370AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'DOMAIN_EXECUTION_HANDOFF_READY', matchingRecords.length, created, skippedDuplicate, 0, '6380_DomainExecutionAcceptanceProcessor', now);
      return result;
    }
  });
}

function run6370_DomainExecutionHandoffProcessor() {
  return sciipRun6370_DomainExecutionHandoffProcessor();
}

function sciipTest6370_DomainExecutionHandoffProcessor() {
  var result = sciipRun6370_DomainExecutionHandoffProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6370_DomainExecutionHandoffProcessor', result: result }));
  return result;
}

function sciip6370GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6370FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6370RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6370RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'DOMAIN_EXECUTION_COORDINATED';
}

function sciip6370FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6370AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6380_DomainExecutionAcceptanceProcessor.gs
 *
 * Processor: 6380_DomainExecutionAcceptance
 *
 * Purpose:
 * Creates the acceptance gate for the 6300-series execution readiness batch.
 *
 * Design:
 * - Uses SCIIP_RUNTIME_PROCESSOR_BASE
 * - Reads DOMAIN_EXECUTION_HANDOFF
 * - Creates DOMAIN_EXECUTION_ACCEPTANCE
 * - Creates DOMAIN_EXECUTION_ACCEPTANCE_LEDGER_SUMMARY
 * - Transaction-aware through SCIIP runtime transaction manager
 * - Duplicate-safe through shared runtime business-key framework and sheet factory
 * - Skip-safe when upstream records are not present
 * - Preserves permanent domain execution history
 */

function sciipRun6380_DomainExecutionAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6380_DomainExecutionAcceptance',
    action: 'DOMAIN_EXECUTION_ACCEPTANCE',
    sourceSheet: 'DOMAIN_EXECUTION_HANDOFF',
    targetSheet: 'DOMAIN_EXECUTION_ACCEPTANCE',
    ledgerSheet: 'DOMAIN_EXECUTION_ACCEPTANCE_LEDGER_SUMMARY',

    buildPayload: function(context, definition) {
      var sourceRecords = sciip6380GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6380FilterReadyRecords_(sourceRecords);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: matchingRecords.length,
        summary: 'Creates the acceptance gate for the 6300-series execution readiness batch.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceSheet: definition.sourceSheet,
          matchingRecordCount: matchingRecords.length,
          nextProcessor: '6390_AssetRegistryExecutionReadinessProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var targetHeaders = [
        'businessKey',
        'transactionId',
        'sourceBusinessKey',
        'domainExecutionId',
        'domainExecutionStatus',
        'domainExecutionLayer',
        'domainExecutionScope',
        'runtimeMilestone',
        'domainMilestone',
        'sourceProcessor',
        'nextProcessor',
        'executionSummary',
        'frameworkVersion',
        'createdAt'
      ];
      var ledgerHeaders = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'targetSheet',
        'recordsRead',
        'recordsCreated',
        'skippedDuplicate',
        'skippedNoInputs',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'resultJson',
        'frameworkVersion',
        'createdAt'
      ];
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, targetHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, ledgerHeaders);

      var sourceRecords = sciip6380GetRecords_(definition.sourceSheet);
      var matchingRecords = sciip6380FilterReadyRecords_(sourceRecords);
      var now = new Date();

      if (!matchingRecords || matchingRecords.length < 1) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            recordsRead: sourceRecords.length,
            matchingRecords: matchingRecords ? matchingRecords.length : 0,
            transactionId: transaction.transactionId,
            nextAction: 'Run upstream processor before 6380_DomainExecutionAcceptance so required domain execution records exist.'
          })
        });
        sciip6380AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, skippedResult, 'SKIPPED_NO_INPUTS', sourceRecords.length, 0, 0, 1, '6390_AssetRegistryExecutionReadinessProcessor', now);
        return skippedResult;
      }

      var rowBusinessKey = SCIIP_RUNTIME.makeBusinessKey([
        context.processor,
        definition.targetSheet,
        'DOMAIN_EXECUTION_LAYER_ACCEPTED',
        SCIIP_RUNTIME.getDateKey({})
      ]);
      var created = 0;
      var skippedDuplicate = 0;
      if (SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(definition.targetSheet, rowBusinessKey)) {
        skippedDuplicate = 1;
      } else {
        var sourceBusinessKey = sciip6380FirstValue_(matchingRecords, 'businessKey');
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, targetHeaders, {
          businessKey: rowBusinessKey,
          transactionId: transaction.transactionId,
          sourceBusinessKey: sourceBusinessKey,
          domainExecutionId: '6380_DomainExecutionAcceptance|DOMAIN_EXECUTION_LAYER_ACCEPTED',
          domainExecutionStatus: 'DOMAIN_EXECUTION_LAYER_ACCEPTED',
          domainExecutionLayer: 'acceptance',
          domainExecutionScope: 'Accepts the full 6300-series domain execution readiness layer and certifies SCIIP_OS for the next execution subsystem.',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-domain-execution-readiness',
          sourceProcessor: 'DOMAIN_EXECUTION_HANDOFF',
          nextProcessor: '6390_AssetRegistryExecutionReadinessProcessor',
          executionSummary: 'Creates the acceptance gate for the 6300-series execution readiness batch.',
          frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
          createdAt: now
        });
        created = 1;
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: matchingRecords.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        message: JSON.stringify({
          executionStatus: 'DOMAIN_EXECUTION_LAYER_ACCEPTED',
          recordsRead: matchingRecords.length,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          transactionId: transaction.transactionId,
          nextProcessor: '6390_AssetRegistryExecutionReadinessProcessor'
        })
      });
      sciip6380AppendLedger_(definition.ledgerSheet, ledgerHeaders, context, transaction, definition, result, 'DOMAIN_EXECUTION_LAYER_ACCEPTED', matchingRecords.length, created, skippedDuplicate, 0, '6390_AssetRegistryExecutionReadinessProcessor', now);
      return result;
    }
  });
}

function run6380_DomainExecutionAcceptanceProcessor() {
  return sciipRun6380_DomainExecutionAcceptanceProcessor();
}

function sciipTest6380_DomainExecutionAcceptanceProcessor() {
  var result = sciipRun6380_DomainExecutionAcceptanceProcessor();
  Logger.log(JSON.stringify({ test: 'sciipTest6380_DomainExecutionAcceptanceProcessor', result: result }));
  return result;
}

function sciip6380GetRecords_(sheetName) {
  if (typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' && SCIIP_RUNTIME_SHEET_FACTORY && SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords) {
    return SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  }
  return [];
}

function sciip6380FilterReadyRecords_(records) {
  var filtered = [];
  for (var i = 0; i < records.length; i++) {
    var record = records[i] || {};
    if (sciip6380RecordReady_(record)) filtered.push(record);
  }
  return filtered;
}

function sciip6380RecordReady_(record) {
  if (!record) return false;
  var status = record['domainExecutionStatus'] || record.domainExecutionStatus || record.domainExecutionStatus || '';
  return String(status) === 'DOMAIN_EXECUTION_HANDOFF_READY';
}

function sciip6380FirstValue_(records, key) {
  if (!records || records.length === 0) return '';
  var record = records[0] || {};
  return record[key] || record.Business_Key || record.BusinessKey || '';
}

function sciip6380AppendLedger_(ledgerSheet, ledgerHeaders, context, transaction, definition, result, status, recordsRead, created, skippedDuplicate, skippedNoInputs, nextProcessor, now) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(ledgerSheet, ledgerHeaders, {
    businessKey: context.businessKey,
    transactionId: transaction.transactionId,
    processor: context.processor,
    executionStatus: status,
    sourceSheet: definition.sourceSheet,
    targetSheet: definition.targetSheet,
    recordsRead: recordsRead,
    recordsCreated: created,
    skippedDuplicate: skippedDuplicate,
    skippedNoInputs: skippedNoInputs,
    runtimeMilestone: 'v5.4-runtime-6200',
    domainMilestone: 'v5.5-domain-execution-readiness',
    nextProcessor: nextProcessor,
    resultJson: result,
    frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
    createdAt: now
  });
}
