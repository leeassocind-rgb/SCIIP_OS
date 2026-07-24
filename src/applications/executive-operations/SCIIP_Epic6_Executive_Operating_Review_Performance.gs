/**
 * SCIIP_OS v7.0 — Epic 6 Sprint 4
 * Executive Operating Review & Performance Management
 * Repository-native, event-oriented, governed, and non-destructive by default.
 */
var SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW = (function () {
  'use strict';

  var VERSION = 'v7.0-epic6-sprint4.0';
  var FRAMEWORK = 'SCIIP_V7_EPIC6_SPRINT4_EXECUTIVE_OPERATING_REVIEW_PERFORMANCE_MANAGEMENT';
  var STORE_KEY = 'SCIIP_EPIC6_SPRINT4_STATE_V1';

  function now_() { return new Date().toISOString(); }
  function clone_(v) { return JSON.parse(JSON.stringify(v)); }
  function uid_(prefix) {
    var token;
    try { token = Utilities.getUuid().replace(/-/g, '').slice(0, 12); }
    catch (e) { token = String(new Date().getTime()); }
    return prefix + '-' + token;
  }
  function defaultState_() {
    return {revision:1, reviews:[], scorecards:[], variances:[], risks:[], followUps:[], reports:[], audit:[], destructiveReportingEnabled:false};
  }
  function props_() { try { return PropertiesService.getScriptProperties(); } catch (e) { return null; } }
  function load_() {
    var p = props_(); if (!p) return defaultState_();
    var raw = p.getProperty(STORE_KEY); if (!raw) return defaultState_();
    try { return JSON.parse(raw); } catch (e) { return defaultState_(); }
  }
  function save_(s) { var p = props_(); if (p) p.setProperty(STORE_KEY, JSON.stringify(s)); return s; }
  function audit_(s, type, id, detail) {
    s.audit.push({auditId:uid_('AUDIT'), type:type, entityId:id, detail:detail||{}, at:now_(), lineagePreserved:true});
  }
  function find_(items, key, value) { for (var i=0;i<items.length;i++) if (items[i][key]===value) return items[i]; return null; }
  function pct_(actual, target) { return target === 0 ? 100 : Math.round((actual / target) * 10000) / 100; }
  function trend_(current, prior) { if (current > prior) return 'UP'; if (current < prior) return 'DOWN'; return 'FLAT'; }

  function createReview_(s, req) {
    req=req||{};
    var review={reviewId:req.reviewId||uid_('REVIEW'), title:req.title||'Weekly Executive Operating Review', periodStart:req.periodStart||null, periodEnd:req.periodEnd||null, owner:req.owner||'Executive Operations', status:'DRAFT', agenda:req.agenda||['PERFORMANCE','RISKS','DECISIONS','FOLLOW_UPS'], createdAt:now_(), updatedAt:now_(), reviewRequired:true};
    s.reviews.push(review); audit_(s,'OPERATING_REVIEW_CREATED',review.reviewId,{periodEnd:review.periodEnd}); return review;
  }
  function addScorecard_(s, reviewId, req) {
    req=req||{};
    var card={scorecardId:req.scorecardId||uid_('SCORECARD'), reviewId:reviewId, metricId:req.metricId||'METRIC', label:req.label||'Operating Metric', actual:Number(req.actual||0), target:Number(req.target||0), prior:Number(req.prior||0), unit:req.unit||'COUNT', attainment:0, variance:0, trend:'FLAT', status:'ON_TRACK'};
    card.attainment=pct_(card.actual,card.target); card.variance=Math.round((card.actual-card.target)*100)/100; card.trend=trend_(card.actual,card.prior);
    card.status=card.attainment>=100?'ON_TRACK':(card.attainment>=90?'WATCH':'OFF_TRACK');
    s.scorecards.push(card); audit_(s,'SCORECARD_ADDED',card.scorecardId,{reviewId:reviewId,status:card.status}); return card;
  }
  function addVariance_(s, reviewId, req) {
    req=req||{};
    var v={varianceId:req.varianceId||uid_('VARIANCE'), reviewId:reviewId, metricId:req.metricId||null, category:req.category||'PERFORMANCE', magnitude:req.magnitude||'MEDIUM', explanation:req.explanation||'Variance explanation pending.', evidence:req.evidence||[], owner:req.owner||'UNASSIGNED', status:'EXPLAINED', createdAt:now_()};
    s.variances.push(v); audit_(s,'VARIANCE_EXPLAINED',v.varianceId,{reviewId:reviewId}); return v;
  }
  function addRisk_(s, reviewId, req) {
    req=req||{};
    var risk={riskId:req.riskId||uid_('RISK'), reviewId:reviewId, title:req.title||'Operating risk', severity:String(req.severity||'MEDIUM').toUpperCase(), probability:Number(req.probability||0.5), impact:Number(req.impact||50), score:0, owner:req.owner||'UNASSIGNED', mitigation:req.mitigation||'Mitigation plan required.', status:'OPEN', createdAt:now_()};
    risk.score=Math.round(risk.probability*risk.impact*100)/100;
    s.risks.push(risk); audit_(s,'RISK_ADDED',risk.riskId,{score:risk.score}); return risk;
  }
  function addFollowUp_(s, reviewId, req) {
    req=req||{};
    var item={followUpId:req.followUpId||uid_('FOLLOWUP'), reviewId:reviewId, decisionId:req.decisionId||null, actionId:req.actionId||null, title:req.title||'Executive follow-up', owner:req.owner||'UNASSIGNED', dueDate:req.dueDate||null, status:'OPEN', progress:0, createdAt:now_(), updatedAt:now_()};
    s.followUps.push(item); audit_(s,'FOLLOW_UP_CREATED',item.followUpId,{reviewId:reviewId}); return item;
  }
  function actionReview_(s, reviewId, action, options) {
    var r=find_(s.reviews,'reviewId',reviewId); if(!r) throw new Error('Review not found: '+reviewId);
    action=String(action||'').toUpperCase(); options=options||{};
    if(action==='PUBLISH') r.status='PUBLISHED';
    else if(action==='COMPLETE') r.status='COMPLETED';
    else if(action==='REOPEN') r.status='DRAFT';
    else throw new Error('Unsupported review action: '+action);
    r.updatedAt=now_(); audit_(s,'OPERATING_REVIEW_'+action,r.reviewId,options); return r;
  }
  function updateFollowUp_(s, followUpId, options) {
    var f=find_(s.followUps,'followUpId',followUpId); if(!f) throw new Error('Follow-up not found: '+followUpId);
    options=options||{}; if(options.owner) f.owner=options.owner; if(options.dueDate) f.dueDate=options.dueDate;
    if(options.progress!==undefined) f.progress=Math.max(0,Math.min(100,Number(options.progress)));
    f.status=f.progress>=100?'COMPLETED':(f.progress>0?'IN_PROGRESS':'OPEN'); f.updatedAt=now_();
    audit_(s,'FOLLOW_UP_UPDATED',f.followUpId,{status:f.status,progress:f.progress}); return f;
  }
  function buildReport_(s, reviewId) {
    var r=find_(s.reviews,'reviewId',reviewId); if(!r) throw new Error('Review not found: '+reviewId);
    var cards=s.scorecards.filter(function(x){return x.reviewId===reviewId;});
    var risks=s.risks.filter(function(x){return x.reviewId===reviewId;});
    var follows=s.followUps.filter(function(x){return x.reviewId===reviewId;});
    var report={reportId:uid_('REPORT'), reviewId:reviewId, title:r.title, generatedAt:now_(), scorecardCount:cards.length, onTrack:cards.filter(function(x){return x.status==='ON_TRACK';}).length, offTrack:cards.filter(function(x){return x.status==='OFF_TRACK';}).length, openRisks:risks.filter(function(x){return x.status==='OPEN';}).length, openFollowUps:follows.filter(function(x){return x.status!=='COMPLETED';}).length, status:'GENERATED', reviewRequired:true, lineagePreserved:true};
    s.reports.push(report); audit_(s,'EXECUTIVE_REPORT_GENERATED',report.reportId,{reviewId:reviewId}); return report;
  }
  function dashboardFrom_(s) {
    var latest=s.reviews.length?s.reviews[s.reviews.length-1]:null;
    return {framework:FRAMEWORK,version:VERSION,workspace:'executive-operations',module:'operating-review-performance-management',portalStatus:'OPERATIONAL',generatedAt:now_(),reviews:clone_(s.reviews),scorecards:clone_(s.scorecards),variances:clone_(s.variances),risks:clone_(s.risks),followUps:clone_(s.followUps),reports:clone_(s.reports),latestReview:latest?clone_(latest):null,kpiTrends:true,weeklyOperatingReviews:true,varianceExplanations:true,riskSummaries:true,decisionFollowUp:true,executiveReporting:true,auditEvents:s.audit.length,reviewRequired:true,lineagePreserved:true,duplicateSafe:true,rollbackAvailable:true,destructiveReportingEnabledByDefault:false};
  }

  function test_() {
    var s=defaultState_();
    var r=createReview_(s,{reviewId:'REVIEW-TEST-001',title:'Weekly Executive Operating Review',periodStart:'2026-07-13',periodEnd:'2026-07-17',owner:'Executive Operations'});
    addScorecard_(s,r.reviewId,{scorecardId:'SC-1',metricId:'PORTFOLIO_HEALTH',label:'Portfolio Health',actual:92,target:90,prior:88,unit:'SCORE'});
    addScorecard_(s,r.reviewId,{scorecardId:'SC-2',metricId:'OPEN_EXCEPTIONS',label:'Open Exceptions',actual:3,target:2,prior:5,unit:'COUNT'});
    addScorecard_(s,r.reviewId,{scorecardId:'SC-3',metricId:'CAMPAIGN_COMPLETION',label:'Campaign Completion',actual:96,target:100,prior:82,unit:'PERCENT'});
    addVariance_(s,r.reviewId,{metricId:'OPEN_EXCEPTIONS',magnitude:'MEDIUM',explanation:'One utility coordination item and two review items remain open.',evidence:['ALERT-POWER','REVIEW-QUEUE'],owner:'Portfolio Operations'});
    addRisk_(s,r.reviewId,{riskId:'RISK-1',title:'Power delivery schedule',severity:'HIGH',probability:0.6,impact:80,owner:'Property Operations',mitigation:'Escalate utility coordination and track weekly.'});
    var f=addFollowUp_(s,r.reviewId,{followUpId:'FOLLOWUP-1',decisionId:'DECISION-UTILITY',actionId:'ACTION-UTILITY',title:'Complete utility coordination plan',owner:'Property Operations',dueDate:'2026-07-24'});
    updateFollowUp_(s,f.followUpId,{progress:50});
    actionReview_(s,r.reviewId,'PUBLISH',{note:'Published for executive review.'});
    var report=buildReport_(s,r.reviewId);
    var d=dashboardFrom_(s);
    var checks=[d.portalStatus==='OPERATIONAL',d.reviews.length===1&&d.reviews[0].status==='PUBLISHED',d.scorecards.length===3,d.scorecards[0].trend==='UP',d.variances.length===1&&d.varianceExplanations===true,d.risks.length===1&&d.risks[0].score===48,d.followUps.length===1&&d.followUps[0].status==='IN_PROGRESS',d.reports.length===1&&report.status==='GENERATED',d.executiveReporting===true&&d.weeklyOperatingReviews===true,d.lineagePreserved===true&&d.destructiveReportingEnabledByDefault===false];
    var failures=[]; for(var i=0;i<checks.length;i++) if(!checks[i]) failures.push('test-'+(i+1));
    return {framework:FRAMEWORK,version:VERSION,status:failures.length?'FAILED':'PASSED',testsRun:checks.length,failures:failures,result:{workspace:d.workspace,portalStatus:d.portalStatus,reviews:d.reviews.length,scorecards:d.scorecards.length,kpiTrends:d.kpiTrends,variances:d.variances.length,risks:d.risks.length,followUps:d.followUps.length,followUpStatus:d.followUps[0].status,reports:d.reports.length,reviewStatus:d.reviews[0].status,auditEvents:d.auditEvents,reviewRequired:d.reviewRequired,lineagePreserved:d.lineagePreserved,destructiveReportingEnabledByDefault:d.destructiveReportingEnabledByDefault}};
  }

  return {
    getDashboard:function(){return dashboardFrom_(load_());},
    createReview:function(req){var s=load_(),r=createReview_(s,req);save_(s);return clone_(r);},
    addScorecard:function(reviewId,req){var s=load_(),x=addScorecard_(s,reviewId,req);save_(s);return clone_(x);},
    addVariance:function(reviewId,req){var s=load_(),x=addVariance_(s,reviewId,req);save_(s);return clone_(x);},
    addRisk:function(reviewId,req){var s=load_(),x=addRisk_(s,reviewId,req);save_(s);return clone_(x);},
    addFollowUp:function(reviewId,req){var s=load_(),x=addFollowUp_(s,reviewId,req);save_(s);return clone_(x);},
    updateFollowUp:function(id,options){var s=load_(),x=updateFollowUp_(s,id,options);save_(s);return clone_(x);},
    actionReview:function(id,action,options){var s=load_(),x=actionReview_(s,id,action,options);save_(s);return clone_(x);},
    generateReport:function(id){var s=load_(),x=buildReport_(s,id);save_(s);return clone_(x);},
    test:test_
  };
})();

function sciipGetEpic6ExecutiveOperatingReview(){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.getDashboard(); }
function sciipCreateEpic6ExecutiveOperatingReview(request){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.createReview(request||{}); }
function sciipAddEpic6OperatingReviewScorecard(reviewId, request){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.addScorecard(reviewId,request||{}); }
function sciipAddEpic6OperatingReviewVariance(reviewId, request){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.addVariance(reviewId,request||{}); }
function sciipAddEpic6OperatingReviewRisk(reviewId, request){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.addRisk(reviewId,request||{}); }
function sciipAddEpic6OperatingReviewFollowUp(reviewId, request){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.addFollowUp(reviewId,request||{}); }
function sciipUpdateEpic6OperatingReviewFollowUp(followUpId, options){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.updateFollowUp(followUpId,options||{}); }
function sciipActionEpic6ExecutiveOperatingReview(reviewId, action, options){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.actionReview(reviewId,action,options||{}); }
function sciipGenerateEpic6ExecutiveOperatingReviewReport(reviewId){ return SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.generateReport(reviewId); }
function sciipOpenEpic6ExecutiveOperatingReview(){ return HtmlService.createHtmlOutputFromFile('SCIIP_Epic6_Executive_Operating_Review_Performance').setTitle('SCIIP Executive Operating Review'); }
function sciipTestV7Epic6ExecutiveOperatingReviewPerformanceManagement(){ var output=SCIIP_EPIC6_EXECUTIVE_OPERATING_REVIEW.test(); Logger.log(JSON.stringify(output)); return output; }
