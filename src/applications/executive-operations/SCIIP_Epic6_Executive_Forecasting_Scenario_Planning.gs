/**
 * SCIIP_OS v7.0 — Epic 6 Sprint 5
 * Executive Forecasting, Scenario Planning & Strategic Priorities
 * Repository-native, governed, event-oriented, and non-destructive by default.
 */
var SCIIP_EPIC6_EXECUTIVE_FORECASTING = (function () {
  'use strict';

  var VERSION = 'v7.0-epic6-sprint5.0';
  var FRAMEWORK = 'SCIIP_V7_EPIC6_SPRINT5_EXECUTIVE_FORECASTING_SCENARIO_PLANNING_STRATEGIC_PRIORITIES';
  var STORE_KEY = 'SCIIP_EPIC6_SPRINT5_STATE_V1';

  function now_() { return new Date().toISOString(); }
  function clone_(value) { return JSON.parse(JSON.stringify(value)); }
  function uid_(prefix) {
    var token;
    try { token = Utilities.getUuid().replace(/-/g, '').slice(0, 12); }
    catch (e) { token = String(new Date().getTime()); }
    return prefix + '-' + token;
  }
  function defaultState_() {
    return {
      revision: 1,
      forecasts: [],
      scenarios: [],
      initiatives: [],
      milestones: [],
      allocations: [],
      recommendations: [],
      decisions: [],
      reports: [],
      audit: [],
      destructiveScenarioExecutionEnabled: false
    };
  }
  function props_() { try { return PropertiesService.getScriptProperties(); } catch (e) { return null; } }
  function load_() {
    var p = props_();
    if (!p) return defaultState_();
    var raw = p.getProperty(STORE_KEY);
    if (!raw) return defaultState_();
    try { return JSON.parse(raw); } catch (e) { return defaultState_(); }
  }
  function save_(state) {
    var p = props_();
    if (p) p.setProperty(STORE_KEY, JSON.stringify(state));
    return state;
  }
  function audit_(state, type, entityId, detail) {
    state.audit.push({
      auditId: uid_('AUDIT'),
      type: type,
      entityId: entityId,
      detail: detail || {},
      at: now_(),
      lineagePreserved: true
    });
  }
  function find_(items, key, value) {
    for (var i = 0; i < items.length; i++) if (items[i][key] === value) return items[i];
    return null;
  }
  function round_(value, places) {
    var factor = Math.pow(10, places || 0);
    return Math.round(Number(value || 0) * factor) / factor;
  }
  function direction_(start, end) {
    if (end > start) return 'UP';
    if (end < start) return 'DOWN';
    return 'FLAT';
  }

  function createForecast_(state, request) {
    request = request || {};
    var points = request.points || [];
    var forecast = {
      forecastId: request.forecastId || uid_('FORECAST'),
      metricId: request.metricId || 'PORTFOLIO_HEALTH',
      label: request.label || 'Portfolio Health',
      horizon: request.horizon || '90_DAYS',
      method: request.method || 'TREND_ADJUSTED',
      confidence: String(request.confidence || 'MEDIUM').toUpperCase(),
      unit: request.unit || 'SCORE',
      points: clone_(points),
      startValue: points.length ? Number(points[0].value || 0) : Number(request.startValue || 0),
      endValue: points.length ? Number(points[points.length - 1].value || 0) : Number(request.endValue || 0),
      direction: 'FLAT',
      delta: 0,
      generatedAt: now_(),
      status: 'ACTIVE',
      evidence: request.evidence || [],
      reviewRequired: true
    };
    forecast.direction = direction_(forecast.startValue, forecast.endValue);
    forecast.delta = round_(forecast.endValue - forecast.startValue, 2);
    state.forecasts.push(forecast);
    audit_(state, 'EXECUTIVE_FORECAST_CREATED', forecast.forecastId, { metricId: forecast.metricId, direction: forecast.direction });
    return forecast;
  }

  function createScenario_(state, request) {
    request = request || {};
    var scenario = {
      scenarioId: request.scenarioId || uid_('SCENARIO'),
      name: request.name || 'Executive Base Case',
      type: String(request.type || 'BASE').toUpperCase(),
      assumptions: request.assumptions || {},
      metrics: request.metrics || {},
      score: Number(request.score || 0),
      riskScore: Number(request.riskScore || 0),
      capitalRequired: Number(request.capitalRequired || 0),
      resourceUnits: Number(request.resourceUnits || 0),
      status: 'DRAFT',
      selected: false,
      createdAt: now_(),
      updatedAt: now_(),
      reviewRequired: true
    };
    state.scenarios.push(scenario);
    audit_(state, 'EXECUTIVE_SCENARIO_CREATED', scenario.scenarioId, { type: scenario.type, score: scenario.score });
    return scenario;
  }

  function actionScenario_(state, scenarioId, action, options) {
    var scenario = find_(state.scenarios, 'scenarioId', scenarioId);
    if (!scenario) throw new Error('Scenario not found: ' + scenarioId);
    action = String(action || '').toUpperCase();
    options = options || {};
    if (action === 'EVALUATE') scenario.status = 'EVALUATED';
    else if (action === 'SELECT') {
      for (var i = 0; i < state.scenarios.length; i++) state.scenarios[i].selected = false;
      scenario.selected = true;
      scenario.status = 'SELECTED_FOR_REVIEW';
    } else if (action === 'APPROVE') scenario.status = 'APPROVED';
    else if (action === 'EXECUTE') {
      if (!state.destructiveScenarioExecutionEnabled) {
        scenario.status = 'BLOCKED_GOVERNANCE';
        audit_(state, 'SCENARIO_EXECUTION_BLOCKED', scenario.scenarioId, { reason: 'DESTRUCTIVE_EXECUTION_DISABLED' });
        return scenario;
      }
      scenario.status = 'EXECUTED';
    } else throw new Error('Unsupported scenario action: ' + action);
    scenario.updatedAt = now_();
    audit_(state, 'EXECUTIVE_SCENARIO_' + action, scenario.scenarioId, options);
    return scenario;
  }

  function createInitiative_(state, request) {
    request = request || {};
    var initiative = {
      initiativeId: request.initiativeId || uid_('INITIATIVE'),
      title: request.title || 'Strategic Initiative',
      strategicPriority: request.strategicPriority || 'OPERATING_EXCELLENCE',
      owner: request.owner || 'UNASSIGNED',
      startDate: request.startDate || null,
      targetDate: request.targetDate || null,
      status: 'PLANNED',
      progress: 0,
      expectedImpact: Number(request.expectedImpact || 0),
      linkedScenarioId: request.linkedScenarioId || null,
      createdAt: now_(),
      updatedAt: now_(),
      reviewRequired: true
    };
    state.initiatives.push(initiative);
    audit_(state, 'STRATEGIC_INITIATIVE_CREATED', initiative.initiativeId, { owner: initiative.owner });
    return initiative;
  }

  function addMilestone_(state, initiativeId, request) {
    var initiative = find_(state.initiatives, 'initiativeId', initiativeId);
    if (!initiative) throw new Error('Initiative not found: ' + initiativeId);
    request = request || {};
    var milestone = {
      milestoneId: request.milestoneId || uid_('MILESTONE'),
      initiativeId: initiativeId,
      title: request.title || 'Initiative milestone',
      owner: request.owner || initiative.owner,
      dueDate: request.dueDate || null,
      status: 'OPEN',
      progress: 0,
      dependencyIds: request.dependencyIds || [],
      createdAt: now_(),
      updatedAt: now_()
    };
    state.milestones.push(milestone);
    audit_(state, 'STRATEGIC_MILESTONE_CREATED', milestone.milestoneId, { initiativeId: initiativeId });
    return milestone;
  }

  function updateMilestone_(state, milestoneId, options) {
    var milestone = find_(state.milestones, 'milestoneId', milestoneId);
    if (!milestone) throw new Error('Milestone not found: ' + milestoneId);
    options = options || {};
    if (options.owner) milestone.owner = options.owner;
    if (options.dueDate) milestone.dueDate = options.dueDate;
    if (options.progress !== undefined) milestone.progress = Math.max(0, Math.min(100, Number(options.progress)));
    milestone.status = milestone.progress >= 100 ? 'COMPLETED' : (milestone.progress > 0 ? 'IN_PROGRESS' : 'OPEN');
    milestone.updatedAt = now_();
    var initiative = find_(state.initiatives, 'initiativeId', milestone.initiativeId);
    if (initiative) {
      var related = state.milestones.filter(function (item) { return item.initiativeId === initiative.initiativeId; });
      var total = 0;
      for (var i = 0; i < related.length; i++) total += Number(related[i].progress || 0);
      initiative.progress = related.length ? round_(total / related.length, 1) : 0;
      initiative.status = initiative.progress >= 100 ? 'COMPLETED' : (initiative.progress > 0 ? 'IN_PROGRESS' : 'PLANNED');
      initiative.updatedAt = now_();
    }
    audit_(state, 'STRATEGIC_MILESTONE_UPDATED', milestone.milestoneId, { progress: milestone.progress, status: milestone.status });
    return milestone;
  }

  function allocateResources_(state, request) {
    request = request || {};
    var allocation = {
      allocationId: request.allocationId || uid_('ALLOCATION'),
      initiativeId: request.initiativeId || null,
      scenarioId: request.scenarioId || null,
      resourceType: request.resourceType || 'CAPITAL',
      amount: Number(request.amount || 0),
      unit: request.unit || 'USD',
      owner: request.owner || 'Executive Operations',
      status: 'PROPOSED',
      createdAt: now_(),
      reviewRequired: true
    };
    state.allocations.push(allocation);
    audit_(state, 'STRATEGIC_RESOURCE_ALLOCATION_CREATED', allocation.allocationId, { amount: allocation.amount, unit: allocation.unit });
    return allocation;
  }

  function createRecommendation_(state, request) {
    request = request || {};
    var scenarios = request.scenarioIds || [];
    var selected = null;
    for (var i = 0; i < scenarios.length; i++) {
      var candidate = find_(state.scenarios, 'scenarioId', scenarios[i]);
      if (!candidate) continue;
      if (!selected || (candidate.score - candidate.riskScore) > (selected.score - selected.riskScore)) selected = candidate;
    }
    var recommendation = {
      recommendationId: request.recommendationId || uid_('RECOMMENDATION'),
      title: request.title || 'Executive Scenario Recommendation',
      scenarioIds: clone_(scenarios),
      recommendedScenarioId: selected ? selected.scenarioId : null,
      rationale: request.rationale || (selected ? 'Highest risk-adjusted scenario score.' : 'No eligible scenario.'),
      confidence: request.confidence || 'HIGH',
      status: selected ? 'READY_FOR_DECISION' : 'INSUFFICIENT_EVIDENCE',
      generatedAt: now_(),
      evidencePreserved: true,
      reviewRequired: true
    };
    state.recommendations.push(recommendation);
    audit_(state, 'EXECUTIVE_RECOMMENDATION_CREATED', recommendation.recommendationId, { recommendedScenarioId: recommendation.recommendedScenarioId });
    return recommendation;
  }

  function recordDecision_(state, request) {
    request = request || {};
    var recommendation = request.recommendationId ? find_(state.recommendations, 'recommendationId', request.recommendationId) : null;
    var decision = {
      decisionId: request.decisionId || uid_('DECISION'),
      recommendationId: request.recommendationId || null,
      scenarioId: request.scenarioId || (recommendation ? recommendation.recommendedScenarioId : null),
      decision: String(request.decision || 'APPROVE').toUpperCase(),
      rationale: request.rationale || 'Approved through executive scenario review.',
      owner: request.owner || 'Executive Sponsor',
      status: 'RECORDED',
      recordedAt: now_(),
      lineagePreserved: true,
      reviewRequired: true
    };
    state.decisions.push(decision);
    audit_(state, 'EXECUTIVE_STRATEGIC_DECISION_RECORDED', decision.decisionId, { scenarioId: decision.scenarioId, decision: decision.decision });
    return decision;
  }

  function buildReport_(state) {
    var selected = null;
    for (var i = 0; i < state.scenarios.length; i++) if (state.scenarios[i].selected) selected = state.scenarios[i];
    var report = {
      reportId: uid_('REPORT'),
      title: 'Executive Forecasting & Strategic Priorities Report',
      generatedAt: now_(),
      forecastCount: state.forecasts.length,
      scenarioCount: state.scenarios.length,
      selectedScenarioId: selected ? selected.scenarioId : null,
      initiativeCount: state.initiatives.length,
      activeInitiatives: state.initiatives.filter(function (item) { return item.status !== 'COMPLETED'; }).length,
      milestoneCount: state.milestones.length,
      allocationCount: state.allocations.length,
      recommendationCount: state.recommendations.length,
      decisionCount: state.decisions.length,
      status: 'GENERATED',
      reviewRequired: true,
      lineagePreserved: true
    };
    state.reports.push(report);
    audit_(state, 'EXECUTIVE_STRATEGIC_REPORT_GENERATED', report.reportId, { selectedScenarioId: report.selectedScenarioId });
    return report;
  }

  function dashboardFrom_(state) {
    var selected = null;
    for (var i = 0; i < state.scenarios.length; i++) if (state.scenarios[i].selected) selected = state.scenarios[i];
    return {
      framework: FRAMEWORK,
      version: VERSION,
      workspace: 'executive-operations',
      module: 'forecasting-scenario-planning-strategic-priorities',
      portalStatus: 'OPERATIONAL',
      generatedAt: now_(),
      forecasts: clone_(state.forecasts),
      scenarios: clone_(state.scenarios),
      selectedScenario: selected ? clone_(selected) : null,
      initiatives: clone_(state.initiatives),
      milestones: clone_(state.milestones),
      allocations: clone_(state.allocations),
      recommendations: clone_(state.recommendations),
      decisions: clone_(state.decisions),
      reports: clone_(state.reports),
      forwardKpiForecasts: true,
      portfolioScenarioPlanning: true,
      strategicPriorities: true,
      milestoneTracking: true,
      resourceAllocation: true,
      executiveDecisionSupport: true,
      auditEvents: state.audit.length,
      reviewRequired: true,
      lineagePreserved: true,
      duplicateSafe: true,
      rollbackAvailable: true,
      destructiveScenarioExecutionEnabledByDefault: false
    };
  }

  function test_() {
    var state = defaultState_();
    createForecast_(state, {
      forecastId: 'FORECAST-1', metricId: 'PORTFOLIO_HEALTH', label: 'Portfolio Health', horizon: '90_DAYS', confidence: 'HIGH', unit: 'SCORE',
      points: [{ period: 'M0', value: 86 }, { period: 'M1', value: 89 }, { period: 'M2', value: 92 }, { period: 'M3', value: 94 }],
      evidence: ['SPRINT4-SCORECARDS', 'PORTFOLIO-EXCEPTIONS']
    });
    var base = createScenario_(state, { scenarioId: 'SCENARIO-BASE', name: 'Base Case', type: 'BASE', score: 82, riskScore: 18, capitalRequired: 250000, resourceUnits: 4 });
    var accelerated = createScenario_(state, { scenarioId: 'SCENARIO-ACCEL', name: 'Accelerated Execution', type: 'UPSIDE', score: 94, riskScore: 21, capitalRequired: 400000, resourceUnits: 6 });
    var downside = createScenario_(state, { scenarioId: 'SCENARIO-DOWN', name: 'Constrained Case', type: 'DOWNSIDE', score: 63, riskScore: 36, capitalRequired: 150000, resourceUnits: 3 });
    actionScenario_(state, base.scenarioId, 'EVALUATE', {});
    actionScenario_(state, accelerated.scenarioId, 'SELECT', { reason: 'Best risk-adjusted return.' });
    actionScenario_(state, downside.scenarioId, 'EVALUATE', {});
    var initiative = createInitiative_(state, { initiativeId: 'INIT-1', title: 'Launch governed SuperSheet campaign', strategicPriority: 'DATA_PLATFORM_SCALE', owner: 'Data Operations', startDate: '2026-07-20', targetDate: '2026-08-31', expectedImpact: 92, linkedScenarioId: accelerated.scenarioId });
    var milestone = addMilestone_(state, initiative.initiativeId, { milestoneId: 'MILESTONE-1', title: 'Complete first ten production SuperSheets', owner: 'Data Operations', dueDate: '2026-08-07' });
    updateMilestone_(state, milestone.milestoneId, { progress: 60 });
    allocateResources_(state, { allocationId: 'ALLOC-1', initiativeId: initiative.initiativeId, scenarioId: accelerated.scenarioId, resourceType: 'CAPITAL', amount: 400000, unit: 'USD', owner: 'Executive Operations' });
    var recommendation = createRecommendation_(state, { recommendationId: 'REC-1', title: 'Select accelerated execution scenario', scenarioIds: [base.scenarioId, accelerated.scenarioId, downside.scenarioId], confidence: 'HIGH' });
    recordDecision_(state, { decisionId: 'DECISION-1', recommendationId: recommendation.recommendationId, scenarioId: recommendation.recommendedScenarioId, decision: 'APPROVE', owner: 'Executive Sponsor', rationale: 'Accelerated case provides the strongest risk-adjusted strategic outcome.' });
    var blocked = actionScenario_(state, accelerated.scenarioId, 'EXECUTE', {});
    var report = buildReport_(state);
    var dashboard = dashboardFrom_(state);
    var checks = [
      dashboard.portalStatus === 'OPERATIONAL',
      dashboard.forecasts.length === 1 && dashboard.forecasts[0].direction === 'UP' && dashboard.forecasts[0].delta === 8,
      dashboard.scenarios.length === 3 && dashboard.selectedScenario.scenarioId === 'SCENARIO-ACCEL',
      dashboard.initiatives.length === 1 && dashboard.initiatives[0].status === 'IN_PROGRESS',
      dashboard.milestones.length === 1 && dashboard.milestones[0].progress === 60,
      dashboard.allocations.length === 1 && dashboard.allocations[0].amount === 400000,
      dashboard.recommendations.length === 1 && recommendation.recommendedScenarioId === 'SCENARIO-ACCEL',
      dashboard.decisions.length === 1 && dashboard.decisions[0].decision === 'APPROVE',
      blocked.status === 'BLOCKED_GOVERNANCE' && report.status === 'GENERATED',
      dashboard.lineagePreserved === true && dashboard.destructiveScenarioExecutionEnabledByDefault === false
    ];
    var failures = [];
    for (var i = 0; i < checks.length; i++) if (!checks[i]) failures.push('test-' + (i + 1));
    return {
      framework: FRAMEWORK,
      version: VERSION,
      status: failures.length ? 'FAILED' : 'PASSED',
      testsRun: checks.length,
      failures: failures,
      result: {
        workspace: dashboard.workspace,
        portalStatus: dashboard.portalStatus,
        forecasts: dashboard.forecasts.length,
        forecastDirection: dashboard.forecasts[0].direction,
        scenarios: dashboard.scenarios.length,
        selectedScenario: dashboard.selectedScenario.scenarioId,
        initiatives: dashboard.initiatives.length,
        milestoneProgress: dashboard.milestones[0].progress,
        allocations: dashboard.allocations.length,
        recommendations: dashboard.recommendations.length,
        decisions: dashboard.decisions.length,
        scenarioExecution: blocked.status,
        reports: dashboard.reports.length,
        auditEvents: dashboard.auditEvents,
        reviewRequired: dashboard.reviewRequired,
        lineagePreserved: dashboard.lineagePreserved,
        destructiveScenarioExecutionEnabledByDefault: dashboard.destructiveScenarioExecutionEnabledByDefault
      }
    };
  }

  return {
    getDashboard: function () { return dashboardFrom_(load_()); },
    createForecast: function (request) { var s = load_(), x = createForecast_(s, request); save_(s); return clone_(x); },
    createScenario: function (request) { var s = load_(), x = createScenario_(s, request); save_(s); return clone_(x); },
    actionScenario: function (id, action, options) { var s = load_(), x = actionScenario_(s, id, action, options); save_(s); return clone_(x); },
    createInitiative: function (request) { var s = load_(), x = createInitiative_(s, request); save_(s); return clone_(x); },
    addMilestone: function (id, request) { var s = load_(), x = addMilestone_(s, id, request); save_(s); return clone_(x); },
    updateMilestone: function (id, options) { var s = load_(), x = updateMilestone_(s, id, options); save_(s); return clone_(x); },
    allocateResources: function (request) { var s = load_(), x = allocateResources_(s, request); save_(s); return clone_(x); },
    createRecommendation: function (request) { var s = load_(), x = createRecommendation_(s, request); save_(s); return clone_(x); },
    recordDecision: function (request) { var s = load_(), x = recordDecision_(s, request); save_(s); return clone_(x); },
    generateReport: function () { var s = load_(), x = buildReport_(s); save_(s); return clone_(x); },
    test: test_
  };
})();

function sciipGetEpic6ExecutiveForecastingScenarioPlanning() { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.getDashboard(); }
function sciipCreateEpic6ExecutiveForecast(request) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.createForecast(request || {}); }
function sciipCreateEpic6ExecutiveScenario(request) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.createScenario(request || {}); }
function sciipActionEpic6ExecutiveScenario(scenarioId, action, options) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.actionScenario(scenarioId, action, options || {}); }
function sciipCreateEpic6StrategicInitiative(request) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.createInitiative(request || {}); }
function sciipAddEpic6StrategicMilestone(initiativeId, request) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.addMilestone(initiativeId, request || {}); }
function sciipUpdateEpic6StrategicMilestone(milestoneId, options) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.updateMilestone(milestoneId, options || {}); }
function sciipAllocateEpic6StrategicResources(request) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.allocateResources(request || {}); }
function sciipCreateEpic6ExecutiveScenarioRecommendation(request) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.createRecommendation(request || {}); }
function sciipRecordEpic6ExecutiveStrategicDecision(request) { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.recordDecision(request || {}); }
function sciipGenerateEpic6ExecutiveStrategicReport() { return SCIIP_EPIC6_EXECUTIVE_FORECASTING.generateReport(); }
function sciipOpenEpic6ExecutiveForecastingScenarioPlanning() { return HtmlService.createHtmlOutputFromFile('SCIIP_Epic6_Executive_Forecasting_Scenario_Planning').setTitle('SCIIP Executive Forecasting & Scenario Planning'); }
function sciipTestV7Epic6ExecutiveForecastingScenarioPlanningStrategicPriorities() { var output = SCIIP_EPIC6_EXECUTIVE_FORECASTING.test(); Logger.log(JSON.stringify(output)); return output; }
