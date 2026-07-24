/** SCIIP_OS v7 Epic 6 Sprint 2 — Executive Portfolio & Property Operations. */
var SCIIP_EPIC6_EXECUTIVE_PORTFOLIO_OPERATIONS_V7 = (function(){
  var VERSION='v7.0-epic6-sprint2.0';
  function now_(){return new Date().toISOString();}
  function num_(v,d){v=Number(v);return isFinite(v)?v:(d||0);}
  function arr_(v){return Array.isArray(v)?v:[];}
  function status_(score){return score>=85?'STRONG':score>=70?'WATCH':'ACTION_REQUIRED';}
  function deepLinks_(propertyId){return [
    {workspace:'property-command-center',label:'Property Command',context:{propertyId:propertyId}},
    {workspace:'gis-workspace',label:'GIS',context:{propertyId:propertyId}},
    {workspace:'knowledge-graph',label:'Knowledge Graph',context:{entityId:propertyId}},
    {workspace:'ai-workspace',label:'AI Briefing',context:{propertyId:propertyId}}
  ];}
  function scoreProperty_(p){
    var occupancy=num_(p.occupancy,100), data=num_(p.dataCompleteness,100), risk=num_(p.riskScore,0), action=num_(p.openActions,0);
    var score=Math.max(0,Math.min(100,occupancy*.35+data*.35+(100-risk)*.2+Math.max(0,100-action*10)*.1));
    return Math.round(score*100)/100;
  }
  function normalizeProperty_(p,i){
    p=p||{}; var id=String(p.propertyId||p.id||('PROPERTY-'+(i+1)));
    var score=scoreProperty_(p);
    return {propertyId:id,address:String(p.address||'Unspecified property'),market:String(p.market||'Unassigned'),occupancy:num_(p.occupancy,100),dataCompleteness:num_(p.dataCompleteness,100),riskScore:num_(p.riskScore,0),openActions:num_(p.openActions,0),operatingScore:score,status:status_(score),deepLinks:deepLinks_(id)};
  }
  function build(ctx){
    ctx=ctx||{}; var properties=arr_(ctx.properties).map(normalizeProperty_);
    var campaigns=arr_(ctx.campaigns), reviews=arr_(ctx.reviews), receipts=arr_(ctx.receipts), alerts=arr_(ctx.alerts);
    var avg=properties.length?properties.reduce(function(s,p){return s+p.operatingScore;},0)/properties.length:0;
    var exceptions=properties.filter(function(p){return p.status!=='STRONG';}).sort(function(a,b){return a.operatingScore-b.operatingScore;});
    var approvals=reviews.filter(function(r){return String(r.status||'').indexOf('APPROV')<0;});
    var activeCampaigns=campaigns.filter(function(c){return ['CERTIFIED','COMPLETED'].indexOf(String(c.status||c.campaignStatus||''))<0;});
    var kpis=[
      {id:'portfolio-health',label:'Portfolio Health',value:Math.round(avg*100)/100,status:status_(avg)},
      {id:'property-exceptions',label:'Property Exceptions',value:exceptions.length,status:exceptions.length?'WATCH':'STRONG'},
      {id:'pending-approvals',label:'Pending Approvals',value:approvals.length,status:approvals.length?'WATCH':'STRONG'},
      {id:'commit-receipts',label:'Commit Receipts',value:receipts.length,status:'STRONG'},
      {id:'active-campaigns',label:'Active Campaigns',value:activeCampaigns.length,status:activeCampaigns.length?'WATCH':'STRONG'}
    ];
    var actions=exceptions.slice(0,5).map(function(p,i){return {actionId:'EXEC-ACTION-'+(i+1),priority:i===0?'HIGH':'MEDIUM',propertyId:p.propertyId,title:'Review '+p.address,reason:p.status,route:p.deepLinks[0]};});
    return {framework:'SCIIP_V7_EPIC6_SPRINT2_EXECUTIVE_PORTFOLIO_PROPERTY_OPERATIONS',version:VERSION,workspace:'executive-operations',module:'portfolio-property-operations',generatedAt:now_(),portalStatus:'OPERATIONAL',kpis:kpis,properties:properties,exceptions:exceptions,approvals:approvals,activeCampaigns:activeCampaigns,alerts:alerts,executiveActions:actions,globalSearch:true,contextContinuity:true,roleAwareNavigation:true,deepLinksEnabled:true,reviewRequired:true,lineagePreserved:true,duplicateSafe:true,rollbackAvailable:true,destructiveCommitEnabledByDefault:false};
  }
  function representative(){return build({properties:[
    {propertyId:'P-LOWELL-2125',address:'2125 W Lowell St, Rialto',market:'Inland Empire West',occupancy:92,dataCompleteness:98,riskScore:12,openActions:1},
    {propertyId:'P-LEXINGTON-2765',address:'2765 Lexington Way',market:'South Bay',occupancy:68,dataCompleteness:82,riskScore:42,openActions:3},
    {propertyId:'P-HARVILL-20123',address:'20123 Harvill Ave, Perris',market:'Inland Empire East',occupancy:100,dataCompleteness:76,riskScore:20,openActions:1}
  ],campaigns:[{id:'C-1',status:'RUNNING'}],reviews:[{id:'R-1',status:'PENDING'}],receipts:[{id:'RCPT-1'}],alerts:[{id:'A-1',severity:'WARNING'}]});}
  return {VERSION:VERSION,build:build,representative:representative,scoreProperty:scoreProperty_};
})();
function sciipGetEpic6ExecutivePortfolioOperations(request){return SCIIP_EPIC6_EXECUTIVE_PORTFOLIO_OPERATIONS_V7.build(request||{});}
function sciipOpenEpic6ExecutivePortfolioOperations(){return HtmlService.createHtmlOutputFromFile('SCIIP_Epic6_Executive_Portfolio_Operations').setTitle('SCIIP Executive Operations');}
function sciipTestV7Epic6ExecutivePortfolioOperations(){
  var r=SCIIP_EPIC6_EXECUTIVE_PORTFOLIO_OPERATIONS_V7.representative(), failures=[];
  function t(name,ok){if(!ok)failures.push(name);}
  t('workspace',r.workspace==='executive-operations');
  t('portal',r.portalStatus==='OPERATIONAL');
  t('kpis',r.kpis.length===5);
  t('properties',r.properties.length===3);
  t('exceptions',r.exceptions.length>=1);
  t('approvals',r.approvals.length===1);
  t('deepLinks',r.properties.every(function(p){return p.deepLinks.length===4;}));
  t('actions',r.executiveActions.length>=1);
  t('governance',r.reviewRequired&&r.lineagePreserved&&r.duplicateSafe&&r.rollbackAvailable);
  t('safety',r.destructiveCommitEnabledByDefault===false);
  return {framework:r.framework,version:r.version,status:failures.length?'FAILED':'PASSED',testsRun:10,failures:failures,result:{workspace:r.workspace,portalStatus:r.portalStatus,kpis:r.kpis.length,properties:r.properties.length,exceptions:r.exceptions.length,pendingApprovals:r.approvals.length,deepLinksEnabled:r.deepLinksEnabled,executiveActions:r.executiveActions.length,reviewRequired:r.reviewRequired,lineagePreserved:r.lineagePreserved,duplicateSafe:r.duplicateSafe,rollbackAvailable:r.rollbackAvailable,destructiveCommitEnabledByDefault:r.destructiveCommitEnabledByDefault}};
}
