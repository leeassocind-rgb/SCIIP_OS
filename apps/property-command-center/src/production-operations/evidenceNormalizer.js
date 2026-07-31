import crypto from 'node:crypto';

const id = (prefix, value) =>
  `${prefix}-${crypto.createHash('sha256').update(String(value)).digest('hex').slice(0, 20)}`;

export function normalizeAddress(value = '') {
  return String(value)
    .toUpperCase()
    .replace(/[.,#]/g, ' ')
    .replace(/\bSTREET\b/g, 'ST')
    .replace(/\bAVENUE\b/g, 'AVE')
    .replace(/\bBOULEVARD\b/g, 'BLVD')
    .replace(/\bROAD\b/g, 'RD')
    .replace(/\bDRIVE\b/g, 'DR')
    .replace(/\bHIGHWAY\b/g, 'HWY')
    .replace(/\s+/g, ' ')
    .trim();
}

export function propertyIdentityCandidate({ address, city, state = 'CA', postalCode, apn, latitude, longitude } = {}) {
  const normalizedAddress = normalizeAddress(address);
  const normalizedCity = String(city || '').toUpperCase().trim();
  const normalizedState = String(state || '').toUpperCase().trim();
  const normalizedPostalCode = String(postalCode || '').slice(0, 5);
  const normalizedApn = String(apn || '').replace(/\D/g, '');
  const coordinateKey = Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))
    ? `${Number(latitude).toFixed(6)},${Number(longitude).toFixed(6)}`
    : '';

  const strongest = normalizedApn
    ? `APN|${normalizedApn}`
    : normalizedAddress
      ? `ADDRESS|${normalizedAddress}|${normalizedCity}|${normalizedState}|${normalizedPostalCode}`
      : coordinateKey
        ? `COORD|${coordinateKey}`
        : '';

  return {
    candidatePropertyId: strongest ? id('PROP-CAND', strongest) : null,
    normalizedAddress,
    normalizedCity,
    normalizedState,
    normalizedPostalCode,
    normalizedApn,
    coordinateKey,
    identityBasis: normalizedApn ? 'APN' : normalizedAddress ? 'ADDRESS' : coordinateKey ? 'COORDINATE' : 'INSUFFICIENT',
    mergeStatus: 'STAGED_NOT_COMMITTED'
  };
}

export function buildEvidenceStaging(extractions = []) {
  return extractions.map(extraction => ({
    evidenceId: id('EVD', `${extraction.sourceSha256 || extraction.sourcePath}|${extraction.extractionId}`),
    sourceId: extraction.sourceId,
    extractionId: extraction.extractionId,
    documentClass: extraction.documentClass,
    parserId: extraction.parserId,
    parserVersion: extraction.parserVersion,
    sourcePath: extraction.sourcePath,
    sourceSha256: extraction.sourceSha256,
    extractionStatus: extraction.status,
    inspection: extraction.inspection || null,
    confidence: extraction.status === 'INSPECTED' ? 0.70 : 0,
    reviewRequired: extraction.status !== 'INSPECTED',
    ledgerMode: 'APPEND_ONLY_STAGING',
    commitStatus: 'NOT_COMMITTED'
  }));
}
