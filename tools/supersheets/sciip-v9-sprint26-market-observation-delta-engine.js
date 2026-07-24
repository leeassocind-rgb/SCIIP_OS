#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const MATERIAL_FIELDS = Object.freeze([
  'askingRate', 'askingRateType', 'askingPrice', 'availableSf', 'buildingSf',
  'officeSf', 'clearHeightFt', 'powerAmps', 'dockHighDoors', 'gradeLevelDoors',
  'availabilityDate', 'listingStatus', 'transactionType', 'brokerage', 'notes'
]);

function hash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function stableId(prefix, key) {
  return `${prefix}|${crypto.createHash('sha256').update(String(key)).digest('hex').slice(0, 18).toUpperCase()}`;
}

function text(value) {
  return String(value ?? '').trim();
}

function numberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[$,%\s,]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function normalizeToken(value) {
  return text(value).toUpperCase().replace(/\bSTREET\b/g, 'ST').replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bBOULEVARD\b/g, 'BLVD').replace(/\bROAD\b/g, 'RD').replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bHIGHWAY\b/g, 'HWY').replace(/[^A-Z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeApn(value) {
  return text(value).toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function canonicalPropertyKey(record) {
  const apns = Array.isArray(record.apns) ? record.apns : text(record.apn).split(/[|,;]/);
  const normalizedApns = apns.map(normalizeApn).filter(Boolean).sort();
  if (normalizedApns.length) return `APN:${normalizedApns.join('+')}`;
  const address = normalizeToken(record.address);
  const city = normalizeToken(record.city);
  const postalCode = text(record.postalCode).replace(/\D/g, '').slice(0, 5);
  if (!address || !city) throw new Error(`Property identity requires APN or address+city: ${JSON.stringify(record)}`);
  return `ADDR:${address}|${city}|${postalCode}`;
}

function canonicalListingKey(record) {
  const listingNumber = normalizeToken(record.listingNumber);
  if (listingNumber) return `AIR:${listingNumber}`;
  const propertyKey = canonicalPropertyKey(record);
  const transactionType = normalizeToken(record.transactionType || 'UNKNOWN');
  const unit = normalizeToken(record.unit || record.suite || 'WHOLE');
  return `${propertyKey}|${transactionType}|${unit}`;
}

function normalizeStatus(value) {
  const v = normalizeToken(value);
  if (/\bLEASED\b/.test(v)) return 'LEASED';
  if (/\bSOLD\b/.test(v)) return 'SOLD';
  if (/\bPENDING\b|\bUNDER CONTRACT\b/.test(v)) return 'PENDING';
  if (/\bWITHDRAWN\b|\bCANCELLED\b|\bCANCELED\b/.test(v)) return 'WITHDRAWN';
  if (/\bAVAILABLE\b|\bFOR LEASE\b|\bFOR SALE\b|\bNEW LISTING\b/.test(v)) return 'AVAILABLE';
  return v || 'UNKNOWN';
}

function normalizeTransactionType(value) {
  const v = normalizeToken(value);
  if (/SALE/.test(v)) return 'SALE';
  if (/LEASE|SUBLEASE/.test(v)) return 'LEASE';
  return v || 'UNKNOWN';
}

function normalizeObservation(record, snapshotDate, source = {}) {
  const propertyKey = canonicalPropertyKey(record);
  const listingKey = canonicalListingKey(record);
  return {
    observationId: stableId('OBSERVATION', `${snapshotDate}|${listingKey}|${source.fileName || ''}|${source.rowNumber || ''}`),
    snapshotDate,
    canonicalPropertyId: stableId('PROPERTY', propertyKey),
    canonicalListingId: stableId('LISTING', listingKey),
    propertyKey,
    listingKey,
    listingNumber: text(record.listingNumber) || null,
    apns: (Array.isArray(record.apns) ? record.apns : text(record.apn).split(/[|,;]/)).map(text).filter(Boolean),
    address: text(record.address),
    city: text(record.city),
    postalCode: text(record.postalCode),
    region: text(record.region || record.market || 'UNASSIGNED'),
    submarket: text(record.submarket || ''),
    unit: text(record.unit || record.suite || ''),
    transactionType: normalizeTransactionType(record.transactionType),
    listingStatus: normalizeStatus(record.listingStatus || record.status),
    askingRate: numberOrNull(record.askingRate),
    askingRateType: text(record.askingRateType).toUpperCase() || null,
    askingPrice: numberOrNull(record.askingPrice),
    availableSf: numberOrNull(record.availableSf),
    buildingSf: numberOrNull(record.buildingSf),
    officeSf: numberOrNull(record.officeSf),
    clearHeightFt: numberOrNull(record.clearHeightFt),
    powerAmps: numberOrNull(record.powerAmps),
    dockHighDoors: numberOrNull(record.dockHighDoors),
    gradeLevelDoors: numberOrNull(record.gradeLevelDoors),
    availabilityDate: text(record.availabilityDate) || null,
    brokerage: text(record.brokerage) || null,
    notes: text(record.notes) || null,
    latitude: numberOrNull(record.latitude),
    longitude: numberOrNull(record.longitude),
    source: {
      fileName: text(source.fileName || record.sourceFile),
      format: text(source.format || record.sourceFormat).toUpperCase() || null,
      rowNumber: source.rowNumber ?? record.rowNumber ?? null,
      pageNumber: source.pageNumber ?? record.pageNumber ?? null,
      checksum: text(source.checksum || record.sourceChecksum) || null
    }
  };
}

function valuesEqual(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

function changedFields(previous, current) {
  return MATERIAL_FIELDS.filter(field => !valuesEqual(previous[field], current[field])).map(field => ({
    field,
    previousValue: previous[field] ?? null,
    newValue: current[field] ?? null
  }));
}

function classifyChange(previous, current, changes) {
  if (previous.listingStatus !== current.listingStatus) {
    if (current.listingStatus === 'LEASED') return 'LEASED';
    if (current.listingStatus === 'SOLD') return 'SOLD';
    if (current.listingStatus === 'WITHDRAWN') return 'WITHDRAWN';
    return 'STATUS_CHANGED';
  }
  if (changes.some(x => x.field === 'askingRate')) {
    const before = previous.askingRate;
    const after = current.askingRate;
    if (before !== null && after !== null) return after < before ? 'RATE_REDUCED' : 'RATE_INCREASED';
    return 'RATE_CHANGED';
  }
  if (changes.some(x => x.field === 'askingPrice')) {
    const before = previous.askingPrice;
    const after = current.askingPrice;
    if (before !== null && after !== null) return after < before ? 'PRICE_REDUCED' : 'PRICE_INCREASED';
    return 'PRICE_CHANGED';
  }
  if (changes.some(x => x.field === 'availableSf')) return 'AVAILABLE_SF_CHANGED';
  return 'MATERIAL_CHANGE';
}

function eventRecord(type, date, observation, previous, changes, confidence = 'HIGH', inferred = false) {
  const key = [type, date, observation?.canonicalListingId || previous?.canonicalListingId, changes].map(v => JSON.stringify(v)).join('|');
  return {
    eventId: stableId('MARKET_EVENT', key),
    eventType: type,
    effectiveDate: date,
    canonicalPropertyId: observation?.canonicalPropertyId || previous?.canonicalPropertyId,
    canonicalListingId: observation?.canonicalListingId || previous?.canonicalListingId,
    region: observation?.region || previous?.region || 'UNASSIGNED',
    transactionType: observation?.transactionType || previous?.transactionType || 'UNKNOWN',
    availableSf: observation?.availableSf ?? previous?.availableSf ?? null,
    changes,
    confidence,
    inferred,
    sourceObservationId: observation?.observationId || null,
    previousObservationId: previous?.observationId || null,
    evidence: observation?.source || previous?.source || null
  };
}

function median(values) {
  const nums = values.filter(Number.isFinite).sort((a, b) => a - b);
  if (!nums.length) return null;
  const mid = Math.floor(nums.length / 2);
  return nums.length % 2 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
}

function weightedAverage(records, valueField, weightField) {
  let numerator = 0; let denominator = 0;
  for (const r of records) {
    const value = r[valueField]; const weight = r[weightField];
    if (Number.isFinite(value) && Number.isFinite(weight) && weight > 0) {
      numerator += value * weight; denominator += weight;
    }
  }
  return denominator ? numerator / denominator : null;
}

function sum(records, field) {
  return records.reduce((total, row) => total + (Number.isFinite(row[field]) ? row[field] : 0), 0);
}

function groupBy(records, keyFn) {
  const result = new Map();
  for (const record of records) {
    const key = keyFn(record);
    if (!result.has(key)) result.set(key, []);
    result.get(key).push(record);
  }
  return result;
}

function inventoryMetrics(records) {
  const available = records.filter(r => r.listingStatus === 'AVAILABLE');
  const lease = available.filter(r => r.transactionType === 'LEASE');
  const sale = available.filter(r => r.transactionType === 'SALE');
  return {
    availableListingCount: available.length,
    availableSf: sum(available, 'availableSf'),
    leaseListingCount: lease.length,
    leaseAvailableSf: sum(lease, 'availableSf'),
    saleListingCount: sale.length,
    saleAvailableSf: sum(sale, 'availableSf'),
    medianLeaseRate: median(lease.map(r => r.askingRate)),
    weightedAverageLeaseRate: weightedAverage(lease, 'askingRate', 'availableSf'),
    medianSalePricePerSf: median(sale.map(r => r.askingPrice)),
    weightedAverageSalePricePerSf: weightedAverage(sale, 'askingPrice', 'availableSf')
  };
}

function buildIndicators(previousRecords, currentRecords, events) {
  const regions = new Set([...previousRecords, ...currentRecords, ...events].map(r => r.region || 'UNASSIGNED'));
  const output = [];
  for (const region of [...regions].sort()) {
    const before = previousRecords.filter(r => (r.region || 'UNASSIGNED') === region);
    const after = currentRecords.filter(r => (r.region || 'UNASSIGNED') === region);
    const regionEvents = events.filter(r => (r.region || 'UNASSIGNED') === region);
    const prior = inventoryMetrics(before);
    const current = inventoryMetrics(after);
    const newListings = regionEvents.filter(e => e.eventType === 'NEW_LISTING');
    const leased = regionEvents.filter(e => e.eventType === 'LEASED');
    const sold = regionEvents.filter(e => e.eventType === 'SOLD');
    const confirmedRemoved = regionEvents.filter(e => e.eventType === 'CONFIRMED_REMOVAL');
    output.push({
      region,
      prior,
      current,
      flow: {
        newListingCount: newListings.length,
        newAvailableSf: sum(newListings, 'availableSf'),
        leasedCount: leased.length,
        leasedSf: sum(leased, 'availableSf'),
        soldCount: sold.length,
        soldSf: sum(sold, 'availableSf'),
        confirmedRemovalCount: confirmedRemoved.length,
        confirmedRemovalSf: sum(confirmedRemoved, 'availableSf'),
        grossAbsorptionIndicatorSf: sum([...leased, ...sold, ...confirmedRemoved], 'availableSf'),
        netAvailableInventoryChangeSf: current.availableSf - prior.availableSf
      },
      rate: {
        priorMedianLeaseRate: prior.medianLeaseRate,
        currentMedianLeaseRate: current.medianLeaseRate,
        medianLeaseRateChange: prior.medianLeaseRate !== null && current.medianLeaseRate !== null ? current.medianLeaseRate - prior.medianLeaseRate : null,
        priorWeightedAverageLeaseRate: prior.weightedAverageLeaseRate,
        currentWeightedAverageLeaseRate: current.weightedAverageLeaseRate,
        weightedAverageLeaseRateChange: prior.weightedAverageLeaseRate !== null && current.weightedAverageLeaseRate !== null ? current.weightedAverageLeaseRate - prior.weightedAverageLeaseRate : null
      }
    });
  }
  return output;
}

function buildCompetitiveSets(currentRecords) {
  return [...groupBy(currentRecords.filter(r => r.listingStatus === 'AVAILABLE'), r => r.region || 'UNASSIGNED').entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([region, listings]) => ({
      region,
      listingCount: listings.length,
      availableSf: sum(listings, 'availableSf'),
      listings: listings.sort((a, b) => (b.availableSf || 0) - (a.availableSf || 0)).map(r => ({
        canonicalPropertyId: r.canonicalPropertyId,
        canonicalListingId: r.canonicalListingId,
        listingNumber: r.listingNumber,
        address: r.address,
        city: r.city,
        transactionType: r.transactionType,
        availableSf: r.availableSf,
        askingRate: r.askingRate,
        askingPrice: r.askingPrice,
        listingStatus: r.listingStatus,
        latitude: r.latitude,
        longitude: r.longitude
      }))
    }));
}

function compareSnapshots(input) {
  const previousDate = input.previousSnapshot?.date;
  const currentDate = input.currentSnapshot?.date;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(previousDate || '')) throw new Error('previousSnapshot.date must be YYYY-MM-DD');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(currentDate || '')) throw new Error('currentSnapshot.date must be YYYY-MM-DD');
  if (currentDate <= previousDate) throw new Error('currentSnapshot.date must be after previousSnapshot.date');
  const absenceThreshold = Math.max(2, Number(input.policy?.absenceConfirmationDays || 2));
  const priorAbsences = input.priorAbsenceStreaks || {};
  const previous = (input.previousSnapshot.records || []).map((r, i) => normalizeObservation(r, previousDate, { ...input.previousSnapshot.source, rowNumber: r.rowNumber ?? i + 1 }));
  const current = (input.currentSnapshot.records || []).map((r, i) => normalizeObservation(r, currentDate, { ...input.currentSnapshot.source, rowNumber: r.rowNumber ?? i + 1 }));
  const priorByListing = new Map(previous.map(r => [r.canonicalListingId, r]));
  const currentByListing = new Map(current.map(r => [r.canonicalListingId, r]));
  const events = [];
  const absenceStreaks = {};

  for (const now of current) {
    const before = priorByListing.get(now.canonicalListingId);
    if (!before) {
      events.push(eventRecord('NEW_LISTING', currentDate, now, null, [{ field: 'listingStatus', previousValue: null, newValue: now.listingStatus }]));
      continue;
    }
    const changes = changedFields(before, now);
    if (changes.length) events.push(eventRecord(classifyChange(before, now, changes), currentDate, now, before, changes));
  }

  for (const before of previous) {
    if (currentByListing.has(before.canonicalListingId)) continue;
    const streak = Number(priorAbsences[before.canonicalListingId] || 0) + 1;
    absenceStreaks[before.canonicalListingId] = streak;
    const confirmed = streak >= absenceThreshold;
    events.push(eventRecord(confirmed ? 'CONFIRMED_REMOVAL' : 'REMOVAL_CANDIDATE', currentDate, null, before,
      [{ field: 'presence', previousValue: 'PRESENT', newValue: 'ABSENT' }], confirmed ? 'MEDIUM' : 'LOW', true));
  }

  const availableProperties = new Map();
  for (const record of current.filter(r => r.listingStatus === 'AVAILABLE')) {
    if (!availableProperties.has(record.canonicalPropertyId)) availableProperties.set(record.canonicalPropertyId, []);
    availableProperties.get(record.canonicalPropertyId).push(record.canonicalListingId);
  }

  const result = {
    framework: 'SCIIP_V9_SPRINT26_MARKET_OBSERVATION_DELTA_ENGINE',
    version: 'v9.0-sprint26.0',
    generatedAt: new Date().toISOString(),
    status: 'PASSED',
    comparison: { previousDate, currentDate, absenceConfirmationDays: absenceThreshold },
    summary: {
      previousObservations: previous.length,
      currentObservations: current.length,
      events: events.length,
      newListings: events.filter(e => e.eventType === 'NEW_LISTING').length,
      leased: events.filter(e => e.eventType === 'LEASED').length,
      sold: events.filter(e => e.eventType === 'SOLD').length,
      materialChanges: events.filter(e => ['MATERIAL_CHANGE', 'STATUS_CHANGED', 'RATE_REDUCED', 'RATE_INCREASED', 'RATE_CHANGED', 'PRICE_REDUCED', 'PRICE_INCREASED', 'PRICE_CHANGED', 'AVAILABLE_SF_CHANGED'].includes(e.eventType)).length,
      removalCandidates: events.filter(e => e.eventType === 'REMOVAL_CANDIDATE').length,
      confirmedRemovals: events.filter(e => e.eventType === 'CONFIRMED_REMOVAL').length,
      availableProperties: availableProperties.size,
      availableListings: current.filter(r => r.listingStatus === 'AVAILABLE').length
    },
    events: events.sort((a, b) => a.eventType.localeCompare(b.eventType) || a.canonicalListingId.localeCompare(b.canonicalListingId)),
    canonicalAvailablePropertyIndex: [...availableProperties.entries()].map(([canonicalPropertyId, canonicalListingIds]) => ({ canonicalPropertyId, canonicalListingIds })),
    competitiveSets: buildCompetitiveSets(current),
    indicators: buildIndicators(previous, current, events),
    nextAbsenceStreaks: absenceStreaks,
    governance: {
      eventSourced: true,
      snapshotIsObservationNotCanonicalState: true,
      inferredRemovalRequiresConfirmation: true,
      sourceEvidencePreserved: true,
      canonicalWrites: 0,
      commitEnabled: false,
      approvalRequired: true
    }
  };
  result.evidenceDigest = hash({ previous, current, events: result.events, indicators: result.indicators });
  return result;
}

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    const key = argv[i].slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    args[key] = value;
  }
  return args;
}

function runCli() {
  const args = parseArgs(process.argv);
  if (!args.input || !args.output) throw new Error('Usage: --input <snapshot-comparison.json> --output <result.json>');
  const input = JSON.parse(fs.readFileSync(args.input, 'utf8'));
  const result = compareSnapshots(input);
  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ framework: result.framework, status: result.status, summary: result.summary }));
}

module.exports = { compareSnapshots, normalizeObservation, canonicalPropertyKey, canonicalListingKey, inventoryMetrics };
if (require.main === module) {
  try { runCli(); } catch (error) { console.error(error.stack || error); process.exit(1); }
}
