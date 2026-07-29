import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '../..');
const src = path.join(root, 'apps/property-command-center/src');
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const imp = name => import(pathToFileURL(path.join(src, 'decision-intelligence', name)).href);

const id = await imp('decisionIdentity.js');
const sc = await imp('scenarioModel.js');
const fc = await imp('forecastEngine.js');
const rp = await imp('riskPropagation.js');
const po = await imp('portfolioOptimizer.js');
const rc = await imp('recommendationComparison.js');
const ex = await imp('explainabilityEngine.js');
const dl = await imp('decisionLedger.js');
const dr = await imp('decisionReplay.js');
const sa = await imp('sensitivityAnalysis.js');
const dg = await imp('decisionGovernance.js');
const rt = await imp('decisionRuntime.js');

test('DeterministicDecisionIdentity', () => assert.equal(
  id.createDecisionIdentity({ assignmentId: 'p-1', decisionType: 'lease' }),
  id.createDecisionIdentity({ assignmentId: 'p-1', decisionType: 'lease' })
));
test('DecisionIdentityPrefix', () => assert.ok(id.assertDecisionIdentity('DEC-P-1-LEASE')));
test('DecisionIdentityRequired', () => assert.throws(() => id.createDecisionIdentity({})));
test('DecisionIdentityNormalization', () => assert.equal(
  id.createDecisionIdentity({ assignmentId: ' p 1 ', decisionType: 'site selection' }),
  'DEC-P-1-SITE-SELECTION'
));

const scenario = sc.createScenario({ id: 'A', probability: 2, financial: { revenue: 10, cost: 3, capex: 2 } });
test('ScenarioImmutable', () => assert.ok(Object.isFrozen(scenario)));
test('ScenarioProbabilityBounded', () => assert.equal(scenario.probability, 1));
test('ScenarioEconomics', () => assert.equal(sc.compareScenarioEconomics(scenario).net, 5));
test('ScenarioIdRequired', () => assert.throws(() => sc.createScenario({})));

const forecast = fc.forecastSeries({ baseline: 100, growthRate: 0.1, periods: 3, volatility: 0.1 });
test('ForecastPeriods', () => assert.equal(forecast.length, 3));
test('ForecastGrowth', () => assert.equal(forecast[0].expected, 110));
test('ForecastBounds', () => assert.ok(forecast[0].low < forecast[0].high));
test('ForecastDirection', () => assert.equal(fc.forecastDirection(forecast), 'UP'));

const risks = rp.propagateRisk(
  [{ id: 'A', risk: 90 }, { id: 'B', risk: 10 }],
  [{ from: 'A', to: 'B', weight: 0.8 }]
);
test('RiskPropagation', () => assert.equal(risks.find(x => x.id === 'B').risk, 72));
test('RiskBounded', () => assert.ok(risks.every(x => x.risk <= 100)));
test('RiskSeverity', () => assert.equal(risks.find(x => x.id === 'A').severity, 'CRITICAL'));
test('RiskImmutable', () => assert.ok(Object.isFrozen(risks)));

const optimized = po.optimizePortfolio(
  [{ id: 'A', value: 100, risk: 10, cost: 60 }, { id: 'B', value: 90, risk: 5, cost: 40 }],
  { budget: 100, maxSelections: 2 }
);
test('PortfolioBudget', () => assert.equal(optimized.totalCost, 100));
test('PortfolioSelections', () => assert.equal(optimized.selected.length, 2));
test('PortfolioConstraint', () => assert.equal(optimized.constraintStatus, 'SATISFIED'));
test('PortfolioUtility', () => assert.ok(optimized.totalUtility > 0));

const compared = rc.compareRecommendations([
  { id: 'A', impact: 90, confidence: 90, risk: 10 },
  { id: 'B', impact: 50, confidence: 50, risk: 80 }
]);
test('RecommendationWinner', () => assert.equal(compared.winner.id, 'A'));
test('RecommendationRanked', () => assert.equal(compared.ranked.length, 2));
test('RecommendationScoreBounded', () => assert.ok(compared.winner.score <= 100));
test('RecommendationTieFlag', () => assert.equal(typeof compared.tie, 'boolean'));

const explanation = ex.explainDecision({
  decisionId: 'D1', recommendation: 'A', evidence: [{ confidence: 90 }, { confidence: 80 }], assumptions: ['x'], alternatives: ['B']
});
test('ExplainabilityConfidence', () => assert.equal(explanation.confidence, 85));
test('ExplainabilityEvidence', () => assert.equal(explanation.evidenceCount, 2));
test('ExplainabilityBrokerReview', () => assert.equal(explanation.brokerReviewRequired, true));
test('ExplainabilityDecisionRequired', () => assert.throws(() => ex.explainDecision({})));

const ledger = dl.createDecisionLedger();
const entry = { decisionId: 'D1', actor: 'broker', eventType: 'CREATED', timestamp: '2026-01-01' };
test('LedgerAppend', () => assert.equal(ledger.append(entry).inserted, true));
test('LedgerDuplicateSafe', () => assert.equal(ledger.append(entry).inserted, false));
test('LedgerRead', () => assert.equal(ledger.read('D1').length, 1));
test('LedgerActorRequired', () => assert.throws(() => ledger.append({ decisionId: 'D2' })));

const replay = dr.replayDecision([
  { timestamp: '2026-01-01', eventType: 'A', patch: { status: 'OPEN' } },
  { timestamp: '2026-02-01', eventType: 'B', patch: { status: 'APPROVED' } }
], new Date('2026-01-15'));
test('DecisionReplayTemporal', () => assert.equal(replay.status, 'OPEN'));
test('DecisionReplayLastEvent', () => assert.equal(replay.lastEvent, 'A'));
test('DecisionReplayDefault', () => assert.equal(dr.replayDecision([]).status, 'DRAFT'));
test('DecisionReplayImmutable', () => assert.ok(Object.isFrozen(replay)));

const sensitivity = sa.analyzeSensitivity({
  baseValue: 100,
  variables: { rent: { low: -10, high: 20, weight: 2 }, cost: { low: -5, high: 5, weight: 1 } }
});
test('SensitivityTopDriver', () => assert.equal(sensitivity.topDriver, 'rent'));
test('SensitivityDrivers', () => assert.equal(sensitivity.drivers.length, 2));
test('SensitivityBase', () => assert.equal(sensitivity.baseValue, 100));
test('SensitivityImmutable', () => assert.ok(Object.isFrozen(sensitivity)));

const governance = dg.evaluateDecisionGovernance({
  evidenceCount: 2, confidence: 90, explanation: 'x', consequential: true, brokerApproved: false
});
test('BrokerApprovalRequired', () => assert.ok(governance.blockers.includes('BROKER_APPROVAL_REQUIRED')));
test('ConsequentialBlocked', () => assert.equal(governance.autonomousExecutionAllowed, false));
test('GovernanceApproval', () => assert.equal(
  dg.evaluateDecisionGovernance({ evidenceCount: 1, confidence: 80, explanation: 'x', consequential: true, brokerApproved: true }).status,
  'APPROVED'
));
test('EvidenceRequired', () => assert.ok(
  dg.evaluateDecisionGovernance({ confidence: 90, explanation: 'x' }).blockers.includes('EVIDENCE_REQUIRED')
));

const runtime = rt.runDecisionIntelligence({
  assignmentId: 'P1', decisionType: 'strategy', brokerApproved: false, evidence: [{ confidence: 90 }],
  scenarios: [{ id: 'A', probability: 0.8, financial: { revenue: 10, cost: 2, capex: 1 } }]
});
test('RuntimeOperational', () => assert.equal(runtime.applicationStatus, 'DECISION_INTELLIGENCE_OPERATIONAL'));
test('RuntimeScenario', () => assert.equal(runtime.scenarios.length, 1));
test('RuntimeGovernance', () => assert.equal(runtime.brokerApproval, 'REQUIRED'));
test('RuntimeAutonomyBlocked', () => assert.equal(runtime.autonomousConsequentialActions, 'BLOCKED'));

const main = fs.readFileSync(path.join(src, 'main.jsx'), 'utf8');
const registry = fs.readFileSync(path.join(src, 'product/workspaceRegistry.js'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'apps/property-command-center/package.json'), 'utf8'));
test('WorkspaceRegistration', () => assert.ok(registry.includes('Decision Intelligence')));
test('MainApplicationWiring', () => assert.ok(
  main.includes('DecisionIntelligenceCenter') && main.includes("selectedTab==='Decision Intelligence'")
));
test('GovernedDecisionUI', () => assert.ok(
  fs.existsSync(path.join(src, 'components/DecisionIntelligenceCenter.jsx')) &&
  fs.existsSync(path.join(src, 'decision-intelligence.css'))
));
test('DeveloperCommandsAndVersion', () => assert.equal(pkg.version, '93.0.0'));

const failures = [];
for (const current of tests) {
  try { await current.fn(); }
  catch (error) { failures.push({ test: current.name, error: error.message }); }
}

const result = {
  framework: 'SCIIP_RELEASE_4_DECISION_INTELLIGENCE_PLATFORM_BATCH_3',
  version: 'release-4-decision-intelligence-platform-batch-3.0',
  status: failures.length ? 'FAILED' : 'PASSED',
  testsRun: tests.length,
  failures,
  result: {
    applicationId: 'property-command-center',
    applicationStatus: 'DECISION_INTELLIGENCE_OPERATIONAL',
    scenarioModeling: 'ACTIVE',
    forecasting: 'ACTIVE',
    riskPropagation: 'ACTIVE',
    portfolioOptimization: 'ACTIVE',
    decisionReplay: 'ACTIVE',
    explainability: 'REQUIRED',
    decisionHistory: 'APPEND_ONLY',
    brokerApproval: 'REQUIRED',
    autonomousConsequentialActions: 'BLOCKED'
  },
  tests: tests.map(current => ({
    test: current.name,
    status: failures.some(failure => failure.test === current.name) ? 'FAILED' : 'PASSED'
  }))
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);
