#!/usr/bin/env node
'use strict';
const assert=require('assert'); const {run,classify}=require('../supersheets/sciip-property-lifecycle-intelligence.cjs');
let tests=0; const t=(name,fn)=>{fn();tests++};
const base={recalculatedTemporalEvents:[
 {eventId:'1',canonicalPropertyId:'P-1',snapshotDate:'2026-01-01',status:'AVAILABLE',availableSf:100000},
 {eventId:'2',canonicalPropertyId:'P-1',snapshotDate:'2026-02-01',status:'LEASED',availableSf:0},
 {eventId:'3',canonicalPropertyId:'P-2',snapshotDate:'2026-01-01',status:'AVAILABLE',availableSf:50000},
 {eventId:'4',canonicalPropertyId:'P-2',snapshotDate:'2026-03-01',status:'AVAILABLE',availableSf:75000},
 {eventId:'5',canonicalPropertyId:'P-3',snapshotDate:'2026-01-01',status:'UNDER CONSTRUCTION'},
 {eventId:'6',canonicalPropertyId:'P-3',snapshotDate:'2026-07-01',status:'DELIVERED'}]};
const out=run(base,{});
t('framework',()=>assert.equal(out.framework,'SCIIP_PROPERTY_LIFECYCLE_INTELLIGENCE'));
t('version',()=>assert.equal(out.version,'196.9.0'));
t('status',()=>assert.equal(out.status,'PASSED'));
t('source count',()=>assert.equal(out.summary.sourceTemporalEvents,6));
t('created',()=>assert.equal(out.summary.lifecycleEventsCreated,6));
t('properties',()=>assert.equal(out.summary.propertiesWithLifecycle,3));
t('append only',()=>assert(out.governance.appendOnlyLifecycleLedger));
t('duplicate safe governance',()=>assert(out.governance.duplicateSafe));
t('source preserved',()=>assert(out.governance.sourceEventsPreserved));
t('rollups',()=>assert(out.governance.propertyLevelRollups));
t('leased',()=>assert(out.lifecycleEvents.some(x=>x.eventType==='LEASED')));
t('expansion',()=>assert(out.lifecycleEvents.some(x=>x.eventType==='EXPANSION')));
t('delivered',()=>assert(out.lifecycleEvents.some(x=>x.eventType==='DELIVERED')));
t('under construction',()=>assert(out.lifecycleEvents.some(x=>x.eventType==='UNDER_CONSTRUCTION')));
t('immutable',()=>assert(out.lifecycleEvents.every(x=>x.immutable)));
t('business keys',()=>assert(out.lifecycleEvents.every(x=>x.businessKey)));
t('ids',()=>assert(out.lifecycleEvents.every(x=>x.lifecycleEventId.startsWith('PLC-'))));
const again=run(base,out);
t('rerun creates zero',()=>assert.equal(again.summary.lifecycleEventsCreated,0));
t('rerun skips six',()=>assert.equal(again.summary.duplicateSafeSkips,6));
t('rerun total stable',()=>assert.equal(again.summary.totalLifecycleEvents,6));
t('state present',()=>assert(again.propertyLifecycles.every(x=>x.currentLifecycleState)));
t('history preserved',()=>assert(again.propertyLifecycles.every(x=>x.historyPreserved)));
t('new availability classify',()=>assert.equal(classify({status:'AVAILABLE'},null),'NEW_AVAILABILITY'));
t('demolition classify',()=>assert.equal(classify({status:'DEMOLISHED'},null),'DEMOLITION'));
t('redevelopment classify',()=>assert.equal(classify({status:'REDEVELOPMENT'},null),'REDEVELOPMENT'));
t('renewal classify',()=>assert.equal(classify({status:'RENEWED'},null),'RENEWAL'));
t('contraction classify',()=>assert.equal(classify({status:'AVAILABLE',availableSf:25},{status:'AVAILABLE',availableSf:50}),'CONTRACTION'));
t('no longer observed classify',()=>assert.equal(classify({status:'LEASED',availableSf:0},{status:'AVAILABLE',availableSf:50}),'LEASED'));
t('explicit event honored',()=>assert.equal(classify({eventType:'DEMOLITION'},null),'DEMOLITION'));
t('event counts object',()=>assert.equal(typeof out.summary.eventTypeCounts,'object'));
t('canonical IDs',()=>assert(out.lifecycleEvents.every(x=>x.canonicalPropertyId)));
t('effective dates',()=>assert(out.lifecycleEvents.every(x=>x.effectiveAt)));
t('confidence',()=>assert(out.lifecycleEvents.every(x=>x.confidence)));
t('source event IDs',()=>assert(out.lifecycleEvents.every(x=>x.sourceEventId)));
t('identity flag boolean',()=>assert(out.lifecycleEvents.every(x=>typeof x.identityExecutionApplied==='boolean')));
t('latest dates',()=>assert(out.propertyLifecycles.every(x=>x.lastLifecycleEventAt)));
console.log(JSON.stringify({framework:'SCIIP_RELEASE_5_5_SPRINT_3_9_PROPERTY_LIFECYCLE_INTELLIGENCE',version:'196.9.0',status:'PASSED',testsRun:tests,failures:[],result:{appendOnlyLifecycleLedger:true,duplicateSafe:true,propertyLevelRollups:true,lifecycleClassification:true}},null,2));
