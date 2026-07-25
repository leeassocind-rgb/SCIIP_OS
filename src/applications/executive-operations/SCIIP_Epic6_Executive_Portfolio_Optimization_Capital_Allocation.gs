/**
 * SCIIP_OS v7.0 — Epic 6 Sprint 6
 * Executive Portfolio Optimization & Capital Allocation
 */
var SCIIP_EPIC6_PORTFOLIO_OPTIMIZATION = (function () {
  var VERSION = 'v7.0-epic6-sprint6.0';
  var FRAMEWORK = 'SCIIP_V7_EPIC6_SPRINT6_EXECUTIVE_PORTFOLIO_OPTIMIZATION_CAPITAL_ALLOCATION';
  var state_ = { analyses: [], plans: [], approvals: [], executions: [], audit: [] };

  function now_() { return new Date().toISOString(); }
  function id_(prefix) {
    var raw = (typeof Utilities !== 'undefined' && Utilities.getUuid) ? Utilities.getUuid() : String(Date.now()) + String(Math.random());
    return prefix + '-' + String(raw).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
  }
  function copy_(v) { return JSON.parse(JSON.stringify(v)); }
  function num_(v, fallback) { var n = Number(v); return isFinite(n) ? n : fallback; }
  function clamp_(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function audit_(type, entityId, payload) {
    state_.audit.push({ auditId: id_('AUDIT'), type: type, entityId: entityId, payload: copy_(payload || {}), occurredAt: now_(), permanent: true });
  }
  function strategyScore_(p) {
    var returnScore = clamp_(num_(p.expectedReturnPct, 0) * 5, 0, 30);
    var strategicFit = clamp_(num_(p.strategicFit, 50) * 0.25, 0, 25);
    var market = clamp_(num_(p.marketStrength, 50) * 0.20, 0, 20);
    var execution = clamp_((100 - num_(p.executionRisk, 50)) * 0.15, 0, 15);
    var liquidity = clamp_(num_(p.liquidityScore, 50) * 0.10, 0, 10);
    return Math.round((returnScore + strategicFit + market + execution + liquidity) * 100) / 100;
  }
  function recommend_(p, score) {
    var vacancy = num_(p.vacancyPct, 0);
    var capex = num_(p.capitalRequired, 0);
    if (p.allowedStrategies && p.allowedStrategies.length === 1) return p.allowedStrategies[0];
    if (score >= 80 && capex > 0) return 'DEVELOP';
    if (score >= 68 && vacancy > 5) return 'LEASE';
    if (score < 48 || num_(p.executionRisk, 0) >= 75) return 'SELL';
    return 'HOLD';
  }
  function validateProperty_(p, i) {
    if (!p || !p.propertyId) throw new Error('propertyId is required at index ' + i);
    if (num_(p.capitalRequired, -1) < 0) throw new Error('capitalRequired must be non-negative for ' + p.propertyId);
  }
  function analyze(request) {
    request = request || {};
    var properties = request.properties || [];
    if (!properties.length) throw new Error('At least one property is required.');
    var analysisId = id_('OPT');
    var scored = properties.map(function (p, i) {
      validateProperty_(p, i);
      var score = strategyScore_(p);
      return {
        propertyId: p.propertyId,
        address: p.address || '',
        score: score,
        recommendedStrategy: recommend_(p, score),
        capitalRequired: num_(p.capitalRequired, 0),
        expectedReturnPct: num_(p.expectedReturnPct, 0),
        executionRisk: num_(p.executionRisk, 50),
        strategicFit: num_(p.strategicFit, 50),
        evidence: copy_(p.evidence || []),
        lineage: copy_(p.lineage || { source: 'executive-operations' })
      };
    }).sort(function (a, b) { return b.score - a.score; });
    var analysis = {
      analysisId: analysisId,
      name: request.name || 'Executive Portfolio Optimization',
      budget: num_(request.budget, 0),
      properties: scored,
      status: 'ANALYZED',
      generatedAt: now_(),
      reviewRequired: true,
      lineagePreserved: true
    };
    state_.analyses.push(analysis);
    audit_('PORTFOLIO_ANALYZED', analysisId, { properties: scored.length, budget: analysis.budget });
    return copy_(analysis);
  }
  function buildPlan(analysisId, options) {
    options = options || {};
    var analysis = state_.analyses.filter(function (a) { return a.analysisId === analysisId; })[0];
    if (!analysis) throw new Error('Analysis not found: ' + analysisId);
    var budget = num_(options.budget, analysis.budget);
    var remaining = budget;
    var allocations = [];
    analysis.properties.forEach(function (p) {
      var required = p.capitalRequired;
      var allocate = required > 0 && required <= remaining && p.recommendedStrategy !== 'SELL';
      var amount = allocate ? required : 0;
      if (allocate) remaining -= amount;
      allocations.push({
        propertyId: p.propertyId,
        score: p.score,
        strategy: p.recommendedStrategy,
        requested: required,
        allocated: amount,
        status: allocate ? 'FUNDED' : (p.recommendedStrategy === 'SELL' ? 'NO_CAPITAL_SELL' : 'DEFERRED'),
        expectedReturnPct: p.expectedReturnPct,
        evidence: copy_(p.evidence),
        lineage: copy_(p.lineage)
      });
    });
    var plan = {
      planId: id_('CAPPLAN'), analysisId: analysisId, budget: budget,
      allocatedCapital: budget - remaining, remainingCapital: remaining,
      allocations: allocations, status: 'PROPOSED', generatedAt: now_(),
      approvalRequired: true, destructiveExecutionEnabledByDefault: false,
      lineagePreserved: true
    };
    state_.plans.push(plan);
    audit_('CAPITAL_PLAN_PROPOSED', plan.planId, { analysisId: analysisId, allocatedCapital: plan.allocatedCapital });
    return copy_(plan);
  }
  function decide(planId, action, options) {
    options = options || {};
    var plan = state_.plans.filter(function (p) { return p.planId === planId; })[0];
    if (!plan) throw new Error('Plan not found: ' + planId);
    action = String(action || '').toUpperCase();
    if (['APPROVE', 'REJECT', 'RETURN'].indexOf(action) < 0) throw new Error('Unsupported decision action: ' + action);
    var status = action === 'APPROVE' ? 'APPROVED' : (action === 'REJECT' ? 'REJECTED' : 'RETURNED_FOR_REVISION');
    plan.status = status;
    var approval = {
      approvalId: id_('CAPAPP'), planId: planId, status: status,
      reviewer: options.reviewer || 'Executive Reviewer', rationale: options.rationale || '',
      decidedAt: now_(), permanent: true
    };
    state_.approvals.push(approval);
    audit_('CAPITAL_PLAN_' + status, planId, approval);
    return copy_(approval);
  }
  function execute(planId, options) {
    options = options || {};
    var plan = state_.plans.filter(function (p) { return p.planId === planId; })[0];
    if (!plan) throw new Error('Plan not found: ' + planId);
    if (plan.status !== 'APPROVED') throw new Error('Plan must be APPROVED before execution.');
    var destructive = !!options.destructive;
    var certified = options.certificationToken && options.certificationToken === options.expectedCertificationToken;
    var status = destructive && !certified ? 'BLOCKED_GOVERNANCE' : (destructive ? 'CERTIFIED_EXECUTION_READY' : 'DRY_RUN_COMPLETED');
    var execution = {
      executionId: id_('CAPEXEC'), planId: planId, status: status,
      allocationsProcessed: plan.allocations.length,
      fundedProperties: plan.allocations.filter(function (a) { return a.status === 'FUNDED'; }).length,
      allocatedCapital: plan.allocatedCapital,
      receiptId: id_('CAPRECEIPT'), executedAt: now_(),
      destructive: destructive, tokenValidated: !!certified,
      lineagePreserved: true, rollbackAvailable: destructive && certified
    };
    state_.executions.push(execution);
    audit_('CAPITAL_PLAN_EXECUTION_' + status, planId, execution);
    return copy_(execution);
  }
  function dashboard() {
    return {
      framework: FRAMEWORK, version: VERSION, workspace: 'executive-operations',
      portalStatus: 'OPERATIONAL', analyses: copy_(state_.analyses), plans: copy_(state_.plans),
      approvals: copy_(state_.approvals), executions: copy_(state_.executions), auditEvents: copy_(state_.audit),
      reviewRequired: true, lineagePreserved: true, destructiveCapitalExecutionEnabledByDefault: false
    };
  }
  function resetForTest_() { state_ = { analyses: [], plans: [], approvals: [], executions: [], audit: [] }; }
  function certify() {
    resetForTest_();
    var analysis = analyze({
      name: 'Representative Executive Capital Review', budget: 18000000,
      properties: [
        { propertyId: 'P-LOWELL', address: '2125 W Lowell St, Rialto', capitalRequired: 10000000, expectedReturnPct: 12, strategicFit: 95, marketStrength: 85, executionRisk: 20, liquidityScore: 72, vacancyPct: 0, evidence: ['LEASE_ROLL', 'MARKET_FORECAST'] },
        { propertyId: 'P-SOUTHBAY', address: '2765 Lexington Way', capitalRequired: 8000000, expectedReturnPct: 9, strategicFit: 82, marketStrength: 78, executionRisk: 30, liquidityScore: 80, vacancyPct: 8, evidence: ['PROPERTY_CURRENT'] },
        { propertyId: 'P-LEGACY', address: 'Legacy Industrial Asset', capitalRequired: 6000000, expectedReturnPct: 3, strategicFit: 35, marketStrength: 40, executionRisk: 82, liquidityScore: 55, vacancyPct: 20, evidence: ['RISK_REVIEW'] }
      ]
    });
    var plan = buildPlan(analysis.analysisId, {});
    var approval = decide(plan.planId, 'APPROVE', { reviewer: 'Executive Committee', rationale: 'Approve constrained plan.' });
    var dryRun = execute(plan.planId, { destructive: false });
    var blocked = execute(plan.planId, { destructive: true, certificationToken: 'INVALID', expectedCertificationToken: 'VALID' });
    var tests = [
      analysis.properties.length === 3,
      analysis.properties[0].score >= analysis.properties[1].score,
      plan.allocatedCapital <= plan.budget,
      plan.allocations.some(function (a) { return a.status === 'DEFERRED' || a.status === 'NO_CAPITAL_SELL'; }),
      approval.status === 'APPROVED',
      dryRun.status === 'DRY_RUN_COMPLETED',
      blocked.status === 'BLOCKED_GOVERNANCE',
      dryRun.receiptId.indexOf('CAPRECEIPT-') === 0,
      state_.audit.length >= 5,
      dashboard().destructiveCapitalExecutionEnabledByDefault === false
    ];
    var failures = [];
    tests.forEach(function (pass, i) { if (!pass) failures.push('test' + (i + 1)); });
    return {
      framework: FRAMEWORK, version: VERSION,
      status: failures.length ? 'FAILED' : 'PASSED', testsRun: tests.length, failures: failures,
      result: {
        workspace: 'executive-operations', portalStatus: 'OPERATIONAL', properties: analysis.properties.length,
        topProperty: analysis.properties[0].propertyId, strategies: analysis.properties.map(function (p) { return p.recommendedStrategy; }),
        budget: plan.budget, allocatedCapital: plan.allocatedCapital, remainingCapital: plan.remainingCapital,
        fundedProperties: plan.allocations.filter(function (a) { return a.status === 'FUNDED'; }).length,
        deferredProperties: plan.allocations.filter(function (a) { return a.status === 'DEFERRED'; }).length,
        approvalStatus: approval.status, executionStatus: dryRun.status, destructiveExecution: blocked.status,
        receipts: 2, auditEvents: state_.audit.length, reviewRequired: true, lineagePreserved: true,
        destructiveCapitalExecutionEnabledByDefault: false
      }
    };
  }
  return { analyze: analyze, buildPlan: buildPlan, decide: decide, execute: execute, dashboard: dashboard, certify: certify };
})();

function sciipGetEpic6ExecutivePortfolioOptimizationCapitalAllocation() {
  return SCIIP_EPIC6_PORTFOLIO_OPTIMIZATION.dashboard();
}
function sciipCreateEpic6PortfolioOptimization(request) {
  return SCIIP_EPIC6_PORTFOLIO_OPTIMIZATION.analyze(request);
}
function sciipBuildEpic6CapitalAllocationPlan(analysisId, options) {
  return SCIIP_EPIC6_PORTFOLIO_OPTIMIZATION.buildPlan(analysisId, options);
}
function sciipActionEpic6CapitalAllocationPlan(planId, action, options) {
  return SCIIP_EPIC6_PORTFOLIO_OPTIMIZATION.decide(planId, action, options);
}
function sciipExecuteEpic6CapitalAllocationPlan(planId, options) {
  return SCIIP_EPIC6_PORTFOLIO_OPTIMIZATION.execute(planId, options);
}
function sciipTestV7Epic6ExecutivePortfolioOptimizationCapitalAllocation() {
  var output = SCIIP_EPIC6_PORTFOLIO_OPTIMIZATION.certify();
  Logger.log(JSON.stringify(output));
  return output;
}
