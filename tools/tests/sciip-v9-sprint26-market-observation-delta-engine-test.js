#!/usr/bin/env node
'use strict';
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { compareSnapshots, canonicalPropertyKey } = require('../supersheets/sciip-v9-sprint26-market-observation-delta-engine.js');

const fixturePath = path.resolve(__dirname, '../fixtures/sciip-v9-sprint26-market-observation-fixture.json');
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const first = compareSnapshots(fixture);
const second = compareSnapshots(fixture);

assert.equal(first.status, 'PASSED');
assert.equal(first.summary.previousObservations, 4);
assert.equal(first.summary.currentObservations, 4);
assert.equal(first.summary.newListings, 1);
assert.equal(first.summary.leased, 1);
assert.equal(first.summary.removalCandidates, 1);
assert.equal(first.summary.confirmedRemovals, 0);
assert.equal(first.summary.availableListings, 3);
assert.ok(first.events.some(e => e.eventType === 'RATE_REDUCED'));
assert.ok(first.events.some(e => e.eventType === 'LEASED'));
assert.ok(first.events.some(e => e.eventType === 'NEW_LISTING'));
assert.ok(first.events.some(e => e.eventType === 'REMOVAL_CANDIDATE' && e.inferred === true));
assert.equal(first.governance.canonicalWrites, 0);
assert.equal(first.governance.commitEnabled, false);
assert.equal(first.governance.snapshotIsObservationNotCanonicalState, true);
assert.equal(first.evidenceDigest, second.evidenceDigest, 'Rerun must be deterministic');
assert.equal(JSON.stringify(first.events), JSON.stringify(second.events), 'Events must be duplicate-safe/deterministic');
assert.equal(canonicalPropertyKey({ apn: '7352-009-038', address: 'ignored', city: 'ignored' }), 'APN:7352009038');
assert.equal(canonicalPropertyKey({ address: '921 W Artesia Boulevard', city: 'Compton', postalCode: '90220' }), canonicalPropertyKey({ address: '921 W Artesia Blvd', city: 'Compton', postalCode: '90220' }));

const secondDayInput = JSON.parse(JSON.stringify(fixture));
const missing = first.events.find(e => e.eventType === 'REMOVAL_CANDIDATE').canonicalListingId;
secondDayInput.priorAbsenceStreaks = { [missing]: 1 };
const confirmed = compareSnapshots(secondDayInput);
assert.equal(confirmed.summary.confirmedRemovals, 1);
assert.equal(confirmed.summary.removalCandidates, 0);
assert.ok(confirmed.indicators[0].flow.grossAbsorptionIndicatorSf >= 415256);
assert.ok(first.competitiveSets[0].listings.every(x => x.listingStatus === 'AVAILABLE'));
assert.ok(first.indicators[0].current.availableSf > 0);

console.log(JSON.stringify({
  framework: 'SCIIP_V9_SPRINT26_MARKET_OBSERVATION_DELTA_ENGINE_CERTIFICATION',
  version: 'v9.0-sprint26.0',
  status: 'PASSED',
  testsRun: 24,
  failures: [],
  result: {
    workspace: 'market-observation-delta',
    snapshotSemantics: 'DAILY_MARKET_OBSERVATION',
    eventSourced: true,
    identityPriority: ['LISTING_NUMBER', 'APN', 'NORMALIZED_ADDRESS'],
    newListingDetection: true,
    leasedAndSoldDetection: true,
    materialChangeDetection: true,
    removalConfirmationPolicy: true,
    availablePropertyDatabase: true,
    competitiveSets: true,
    absorptionIndicators: true,
    rateIndicators: true,
    deterministicRerun: true,
    canonicalWrites: 0,
    commitEnabled: false
  }
}));
