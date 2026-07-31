import assert from 'node:assert/strict';
import {createExecutiveRecommendationEngine,analyzeExecutiveAlternatives,rankExecutiveRecommendations,evaluateExecutiveConstraints,calculateEvidenceStrength} from '../src/executive-actions/prescriptive/index.js';
let tests=0;const test=(name,fn)=>{fn();tests++;};
const evidence=(id,c=.9)=>[{evidenceId:id,summary:id,confidence:c,sourceSignalIds:[`SIG:${id}`]}];
const alternatives=[
 {alternativeId:'ALT-A',expectedBenefitScore:92,riskScore:25,estimatedCost:400,estimatedDays:10,capabilities:['LEGAL'],evidence:evidence('A',.95)},
 {alternativeId:'ALT-B',expectedBenefitScore:78,riskScore:15,estimatedCost:200,estimatedDays:5,capabilities:['LEGAL'],evidence:evidence('B',.8)},
 {alternativeId:'ALT-C',expectedBenefitScore:99,riskScore:60,estimatedCost:900,estimatedDays:30,capabilities:[],evidence:evidence('C',.7)},
 {alternativeId:'ALT-D',expectedBenefitScore:88,riskScore:20,estimatedCost:100,estimatedDays:4,capabilities:['LEGAL'],evidence:[]}
];
const constraints={maxCost:500,maxDays:15,maxRiskScore:50,requiredCapabilities:['LEGAL']};
test('constraint pass',()=>assert.equal(evaluateExecutiveConstraints(alternatives[0],constraints).feasible,true));
test('constraint fail',()=>assert.equal(evaluateExecutiveConstraints(alternatives[2],constraints).feasible,false));
test('cost violation',()=>assert.ok(evaluateExecutiveConstraints(alternatives[2],constraints).violations.includes('MAX_COST_EXCEEDED')));
test('duration violation',()=>assert.ok(evaluateExecutiveConstraints(alternatives[2],constraints).violations.includes('MAX_DURATION_EXCEEDED')));
test('risk violation',()=>assert.ok(evaluateExecutiveConstraints(alternatives[2],constraints).violations.includes('MAX_RISK_EXCEEDED')));
test('capability violation',()=>assert.ok(evaluateExecutiveConstraints(alternatives[2],constraints).violations.some(v=>v.startsWith('MISSING_CAPABILITY'))));
test('evidence high',()=>assert.equal(calculateEvidenceStrength(evidence('A',.95)).strength,'HIGH'));
test('evidence none',()=>assert.equal(calculateEvidenceStrength([]).strength,'NONE'));
const analyses=analyzeExecutiveAlternatives(alternatives,constraints);
test('all alternatives analyzed',()=>assert.equal(analyses.length,4));
test('infeasible excluded',()=>assert.equal(analyses[2].eligible,false));
test('no evidence excluded',()=>assert.equal(analyses[3].eligible,false));
test('eligible A',()=>assert.equal(analyses[0].eligible,true));
test('eligible B',()=>assert.equal(analyses[1].eligible,true));
const ranked=rankExecutiveRecommendations(analyses);
test('rank count',()=>assert.equal(ranked.length,2));
test('rank numbering',()=>assert.deepEqual(ranked.map(r=>r.rank),[1,2]));
test('rank descending',()=>assert.ok(ranked[0].utilityScore>=ranked[1].utilityScore));
const engine=createExecutiveRecommendationEngine({maxDecisions:2});
test('ready',()=>assert.equal(engine.snapshot().status,'READY'));
test('start',()=>assert.equal(engine.start().status,'OPERATIONAL'));
const result=engine.prescribe({decisionId:'DEC-1',sourceForecastId:'FC-1',alternatives,constraints,generatedAt:'2026-07-31T16:00:00.000Z'});
test('generated',()=>assert.equal(result.status,'PRESCRIPTION_GENERATED'));
test('scorecards',()=>assert.equal(result.scorecards.length,2));
test('playbook',()=>assert.equal(result.playbook.status,'ADVISORY_DRAFT'));
test('approval required',()=>assert.equal(result.playbook.humanApprovalRequired,true));
test('workflow mutation false',()=>assert.equal(result.scorecards[0].workflowMutationAllowed,false));
test('autonomous false',()=>assert.equal(result.scorecards[0].autonomousExecutionAllowed,false));
test('traceability',()=>assert.ok(result.sourceSignalIds.length>0));
test('immutable',()=>assert.equal(Object.isFrozen(result.scorecards[0]),true));
const dup=engine.prescribe({decisionId:'DEC-1',alternatives,constraints});
test('duplicate ignored',()=>assert.equal(dup.status,'DUPLICATE_IGNORED'));
test('duplicate metric',()=>assert.equal(engine.snapshot().duplicatesIgnored,1));
test('retrieval',()=>assert.equal(engine.get('DEC-1').decisionId,'DEC-1'));
test('bounded retention',()=>{engine.prescribe({decisionId:'DEC-2',alternatives,constraints});engine.prescribe({decisionId:'DEC-3',alternatives,constraints});assert.equal(engine.snapshot().retainedDecisions,2);});
test('stop',()=>assert.equal(engine.stop().status,'STOPPED'));
assert.equal(tests,31);
console.log(JSON.stringify({framework:'SCIIP_PHASE2_SPRINT9_EXECUTIVE_PRESCRIPTIVE_INTELLIGENCE',status:'PASSED',testsRun:tests,result:{status:engine.snapshot().status,decisionsProcessed:engine.snapshot().decisionsProcessed,retainedDecisions:engine.snapshot().retainedDecisions,duplicatesIgnored:engine.snapshot().duplicatesIgnored,recommendationsGenerated:result.scorecards.length,alternativesAnalyzed:result.analyses.length,playbookSteps:result.playbook.steps.length,readOnly:true,advisoryOnly:true,humanApprovalRequired:true,workflowMutationAllowed:false,autonomousExecutionAllowed:false,decisionTraceability:true}},null,2));
