#!/usr/bin/env node
'use strict';
const assert = require('assert');
const A = require('../supersheets/sciip-multidimensional-market-cube.cjs');
const B = require('../supersheets/sciip-market-trend-momentum.cjs');
const C = require('../supersheets/sciip-explainable-market-forecasting.cjs');
const D = require('../supersheets/sciip-executive-market-command-center.cjs');
let tests = 0;
const t = (name, fn) => { fn(); tests += 1; };
const input = { priorities: [
  {priorityId:'P1',geography:'IE WEST',period:'2026-06',category:'OPPORTUNITY',priorityScore:80,buildingSf:250000,powerAmps:4000,tenantSector:'LOGISTICS'},
  {priorityId:'P2',geography:'IE WEST',period:'2026-07',category:'HIGH_PRIORITY_OPPORTUNITY',priorityScore:90,buildingSf:250000,powerAmps:4000,tenantSector:'LOGISTICS'},
  {priorityId:'P3',geography:'SOUTH BAY',period:'2026-07',category:'RISK',priorityScore:35,buildingSf:100000,powerAmps:2000,tenantSector:'AEROSPACE'}
]};
const a=A.run(input);
t('a pass',()=>assert.equal(a.status,'PASSED'));
t('cells',()=>assert(a.cells.length>=2));
t('dims',()=>assert.equal(a.summary.dimensions,6));
t('evidence',()=>assert(a.cells.every(x=>x.evidenceIds.length)));
const ar=A.run(input,a);t('a rerun',()=>assert.equal(ar.summary.cellsCreated,0));
const b=B.run(a);t('b pass',()=>assert.equal(b.status,'PASSED'));t('trends',()=>assert.equal(b.trends.length,a.cells.length));t('direction',()=>assert(b.trends.every(x=>['UP','DOWN','FLAT'].includes(x.direction))));
const br=B.run(a,b);t('b rerun',()=>assert.equal(br.summary.trendsCreated,0));
const c=C.run(b);t('c pass',()=>assert.equal(c.status,'PASSED'));t('two horizons',()=>assert.equal(c.forecasts.length,b.trends.length*2));t('bounds',()=>assert(c.forecasts.every(x=>x.lowerBound<=x.forecastScore&&x.upperBound>=x.forecastScore)));t('assumptions',()=>assert(c.forecasts.every(x=>x.assumptions.length)));
const cr=C.run(b,c);t('c rerun',()=>assert.equal(cr.summary.forecastsCreated,0));
const d=D.run({cube:a,trends:b,forecasts:c});t('d pass',()=>assert.equal(d.status,'PASSED'));t('brief',()=>assert(d.executiveBrief.headline));t('heatmap',()=>assert.equal(d.marketHeatmap.length,a.cells.length));
for(const g of ['appendOnlyCubeLedger','incrementalAggregation','evidenceLinked','duplicateSafe']) t('a '+g,()=>assert(a.governance[g]));
for(const g of ['appendOnlyTrendLedger','rollingMetrics','evidenceLinked','duplicateSafe']) t('b '+g,()=>assert(b.governance[g]));
for(const g of ['appendOnlyForecastLedger','confidenceIntervals','scenarioAssumptions','humanReviewGated','duplicateSafe']) t('c '+g,()=>assert(c.governance[g]));
for(const g of ['readOnlyExecutiveLayer','evidenceLinked','approvalRequired','noAutonomousExecution']) t('d '+g,()=>assert(d.governance[g]));
for(const x of a.cells) t('cube id',()=>assert(x.cubeCellId.startsWith('CUBE-')));
for(const x of b.trends) t('trend id',()=>assert(x.trendId.startsWith('TRD-')));
for(const x of c.forecasts) t('forecast id',()=>assert(x.forecastId.startsWith('FCST-')));
console.log(JSON.stringify({framework:'SCIIP_RELEASE_5_5_BATCH_3_14_TO_3_17_MULTIDIMENSIONAL_MARKET_INTELLIGENCE',version:'196.17.0',status:'PASSED',testsRun:tests,failures:[],result:{multidimensionalMarketCube:true,trendMomentum:true,explainableForecasting:true,executiveCommandCenter:true,batchCertified:true}},null,2));
