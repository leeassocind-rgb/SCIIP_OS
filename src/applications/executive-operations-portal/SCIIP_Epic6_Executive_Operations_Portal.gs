/** SCIIP_OS v7.0 Epic 6 Sprint 1 — Executive Operations Portal Foundation */
var SCIIP_EXECUTIVE_OPERATIONS_PORTAL = (function () {
  'use strict';

  var VERSION = 'v7.0-epic6-sprint1.0';
  var FRAMEWORK = 'SCIIP_V7_EPIC6_SPRINT1_EXECUTIVE_OPERATIONS_PORTAL_FOUNDATION';
  var WORKSPACE_ID = 'executive-operations';
  var ROLE_MATRIX = {
    EXECUTIVE:['executive-operations','executive-dashboard','property-explorer','data-sources','gis-workspace','knowledge-graph','digital-twin','ai-workspace','market-intelligence'],
    OPERATOR:['executive-operations','property-explorer','data-sources','gis-workspace','knowledge-graph','digital-twin','ai-workspace'],
    REVIEWER:['executive-operations','property-explorer','data-sources','knowledge-graph'],
    ADMIN:['executive-operations','executive-dashboard','property-explorer','data-sources','gis-workspace','knowledge-graph','digital-twin','ai-workspace','market-intelligence','enterprise-admin']
  };

  function safe_(fn, fallback) { try { return fn(); } catch (e) { return fallback === undefined ? null : fallback; } }
  function now_() { return new Date().toISOString(); }
  function role_(request) {
    var value = String(request && request.role || 'EXECUTIVE').toUpperCase();
    return ROLE_MATRIX[value] ? value : 'EXECUTIVE';
  }
  function resolveGlobal_(name) {
    if (name==='sciipGetEpic5BatchOrchestrationDashboard' && typeof sciipGetEpic5BatchOrchestrationDashboard==='function') return sciipGetEpic5BatchOrchestrationDashboard;
    if (name==='sciipGetEpic5ProductionCommitConsole' && typeof sciipGetEpic5ProductionCommitConsole==='function') return sciipGetEpic5ProductionCommitConsole;
    if (name==='sciipGetEpic5PropertyCommandCenter' && typeof sciipGetEpic5PropertyCommandCenter==='function') return sciipGetEpic5PropertyCommandCenter;
    if (name==='sciipPropertyCommandCenterSnapshot' && typeof sciipPropertyCommandCenterSnapshot==='function') return sciipPropertyCommandCenterSnapshot;
    if (name==='sciipGetEpic5PilotReviewConsole' && typeof sciipGetEpic5PilotReviewConsole==='function') return sciipGetEpic5PilotReviewConsole;
    if (name==='sciipGetEpic5LiveIngestionReview' && typeof sciipGetEpic5LiveIngestionReview==='function') return sciipGetEpic5LiveIngestionReview;
    return null;
  }
  function callFirst_(names, args, fallback) {
    for (var i=0;i<names.length;i+=1) {
      var fn=resolveGlobal_(names[i]);
      if (typeof fn==='function') return safe_(function(){ return fn.apply(null,args||[]); },fallback);
    }
    return fallback;
  }
  function campaign_() {
    var d = callFirst_(['sciipGetEpic5BatchOrchestrationDashboard'],[],null) || {};
    var campaigns = d.campaigns || d.items || [];
    var active = d.activeCampaign || campaigns[0] || {};
    return {
      status:active.campaignStatus || active.status || (campaigns.length ? 'ACTIVE' : 'READY'),
      campaignId:active.campaignId || '',
      total:Number(active.sheets || active.total || d.totalSheets || 0),
      completed:Number(active.completed || d.completed || 0),
      failed:Number(active.failed || d.failed || 0),
      certificationStatus:active.certificationStatus || d.certificationStatus || 'READY',
      pauseResume:active.pauseResume !== false,
      failureIsolation:active.failureIsolation !== false
    };
  }
  function commits_() {
    var d = callFirst_(['sciipGetEpic5ProductionCommitConsole'],[],null) || {};
    var executions = d.executions || d.items || [];
    var latest = d.activeExecution || executions[0] || {};
    return {
      status:latest.commitStatus || latest.status || 'READY',
      executions:Number(d.totalExecutions || executions.length || 0),
      receipts:Number(d.receipts || d.receiptCount || 0),
      rollbackAvailable:latest.rollbackAvailable !== false,
      destructiveCommitEnabled:latest.destructiveCommitEnabled === true || d.destructiveCommitEnabled === true,
      latestReceiptId:latest.receiptId || ''
    };
  }
  function properties_() {
    var d = callFirst_(['sciipGetEpic5PropertyCommandCenter','sciipPropertyCommandCenterSnapshot'],[],null) || {};
    var rows = d.properties || d.results || [];
    return {
      status:d.status || 'READY',
      total:Number(d.totalProperties || d.total || rows.length || 0),
      selectedPropertyId:d.selectedPropertyId || '',
      refreshedAt:d.generatedAt || d.refreshedAt || null
    };
  }
  function review_() {
    var d = callFirst_(['sciipGetEpic5PilotReviewConsole','sciipGetEpic5LiveIngestionReview'],[],null) || {};
    var reviews = d.reviews || d.batches || d.items || [];
    var pending = 0;
    for (var i=0;i<reviews.length;i+=1) {
      var s=String(reviews[i].approvalStatus || reviews[i].status || '').toUpperCase();
      if (s.indexOf('PENDING')>=0 || s.indexOf('REVIEW')>=0 || s.indexOf('PREVIEW')>=0) pending+=1;
    }
    return {status:d.status || 'READY', pending:pending, total:reviews.length};
  }
  function workspaceRegistry_(role) {
    var allowed=ROLE_MATRIX[role] || ROLE_MATRIX.EXECUTIVE;
    return allowed.map(function(id){
      var labels={
        'executive-operations':'Executive Operations','executive-dashboard':'Executive Dashboard','property-explorer':'Properties','data-sources':'Campaigns & Data Sources','gis-workspace':'GIS','knowledge-graph':'Knowledge Graph','digital-twin':'Digital Twin','ai-workspace':'AI Workspace','market-intelligence':'Market Intelligence','enterprise-admin':'Administration'
      };
      return {id:id,label:labels[id]||id,allowed:true};
    });
  }
  function commandPalette_(role) {
    var commands=[
      {id:'open-property-search',label:'Search properties',workspace:'property-explorer',roles:['EXECUTIVE','OPERATOR','REVIEWER','ADMIN']},
      {id:'open-campaigns',label:'Open SuperSheet campaigns',workspace:'data-sources',roles:['EXECUTIVE','OPERATOR','REVIEWER','ADMIN']},
      {id:'review-exceptions',label:'Review ingestion exceptions',workspace:'data-sources',roles:['EXECUTIVE','OPERATOR','REVIEWER','ADMIN']},
      {id:'open-gis',label:'Open GIS workspace',workspace:'gis-workspace',roles:['EXECUTIVE','OPERATOR','ADMIN']},
      {id:'ask-sciip',label:'Ask SCIIP',workspace:'ai-workspace',roles:['EXECUTIVE','OPERATOR','ADMIN']},
      {id:'open-admin',label:'Open administration',workspace:'enterprise-admin',roles:['ADMIN']}
    ];
    return commands.filter(function(c){ return c.roles.indexOf(role)>=0; });
  }
  function snapshot(request) {
    var role=role_(request||{}), campaign=campaign_(), commits=commits_(), properties=properties_(), review=review_();
    var blockers=[];
    if (campaign.failed>0) blockers.push({severity:'critical',title:'Campaign failures require attention',detail:String(campaign.failed)+' SuperSheet jobs are isolated for review.'});
    if (review.pending>0) blockers.push({severity:'warning',title:'Reviews awaiting disposition',detail:String(review.pending)+' ingestion reviews require a decision.'});
    if (commits.destructiveCommitEnabled) blockers.push({severity:'warning',title:'Production commit gate enabled',detail:'Certification-token controls remain required.'});
    if (!blockers.length) blockers.push({severity:'success',title:'No launch blockers detected',detail:'Governed ingestion and cross-workspace services are ready.'});
    return {
      framework:FRAMEWORK, version:VERSION, workspace:WORKSPACE_ID, status:'OPERATIONAL',
      session:{role:role,contextMode:'PERSISTENT',commandPalette:true,globalSearch:true},
      kpis:[
        {label:'Campaign status',value:campaign.status,detail:campaign.completed+' / '+campaign.total+' completed',tone:campaign.failed?'warning':'success'},
        {label:'Pending reviews',value:review.pending,detail:review.total+' total review records',tone:review.pending?'warning':'success'},
        {label:'Commit receipts',value:commits.receipts,detail:commits.status,tone:'success'},
        {label:'Property records',value:properties.total,detail:properties.status,tone:'neutral'}
      ],
      campaign:campaign, commits:commits, properties:properties, review:review,
      alerts:blockers,
      priorities:[
        {rank:1,title:review.pending?'Resolve pending ingestion reviews':'Validate next SuperSheet wave',workspace:'data-sources'},
        {rank:2,title:'Review property and market changes',workspace:'property-explorer'},
        {rank:3,title:'Confirm spatial and graph projections',workspace:'gis-workspace'}
      ],
      workspaces:workspaceRegistry_(role), commands:commandPalette_(role),
      governance:{reviewRequired:true,lineagePreserved:true,duplicateSafe:true,rollbackAvailable:commits.rollbackAvailable,destructiveCommitEnabledByDefault:false},
      generatedAt:now_()
    };
  }
  return {VERSION:VERSION,FRAMEWORK:FRAMEWORK,WORKSPACE_ID:WORKSPACE_ID,ROLE_MATRIX:ROLE_MATRIX,snapshot:snapshot};
})();

function sciipGetEpic6ExecutiveOperationsPortal(request) { return SCIIP_EXECUTIVE_OPERATIONS_PORTAL.snapshot(request || {}); }
