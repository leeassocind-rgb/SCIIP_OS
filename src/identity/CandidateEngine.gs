/* ==========================================================
   SCIIP_OS
   Module: Identity
   File: CandidateEngine.gs

   Purpose:
   Creates and manages asset candidates.

   Candidates represent observations that have not yet
   been resolved into canonical SCIIP assets.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_CANDIDATE_SHEET =
  'PROPERTY_CANDIDATES';

/**
 * Returns candidate sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetCandidateSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_CANDIDATE_SHEET
  );
}

/**
 * Initializes candidate sheet.
 */
function sciipInitializeCandidateSheet() {
  const sheet =
    sciipGetCandidateSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Candidate_ID',
    'Business_Key',
    'Address',
    'City',
    'Zip',
    'APN',
    'Status',
    'Confidence',
    'Source',
    'Created_At'
  ]);
}

/**
 * Creates a candidate from an observation.
 *
 * @param {Object} observation
 * @returns {Object}
 */
function sciipCreateCandidate(
  observation
) {
  sciipInitializeCandidateSheet();

  const identity =
    sciipCreateCanonicalIdentity(
      observation
    );

  const candidateId =
    'CANDIDATE_' +
    sciipUuid()
      .replace(/-/g, '')
      .substring(0, 16)
      .toUpperCase();

  const candidate = {
    candidateId: candidateId,
    businessKey:
      identity.businessKey,
    address:
      identity.canonicalAddress,
    city:
      identity.canonicalCity,
    zip:
      identity.canonicalZip,
    apn:
      identity.canonicalApn,
    status: 'PENDING',
    confidence: 0,
    source:
      observation.source ||
      'UNKNOWN',
    createdAt:
      sciipNowIso()
  };

  sciipAppendRow(
    SCIIP_CANDIDATE_SHEET,
    [
      candidate.candidateId,
      candidate.businessKey,
      candidate.address,
      candidate.city,
      candidate.zip,
      candidate.apn,
      candidate.status,
      candidate.confidence,
      candidate.source,
      candidate.createdAt
    ]
  );

  return candidate;
}

/**
 * Processes an observation.
 *
 * MATCH
 * REVIEW
 * CREATE_ASSET
 *
 * @param {Object} observation
 * @returns {Object}
 */
function sciipProcessCandidate(
  observation
) {
  const result =
    sciipResolveObservation(
      observation
    );

  if (
    result.action === 'MATCH'
  ) {
    return {
      action: 'MATCH',
      asset: result.asset,
      confidence:
        result.confidence
    };
  }

  const candidate =
    sciipCreateCandidate(
      observation
    );

  return {
    action: result.action,
    candidate: candidate,
    confidence:
      result.confidence
  };
}

/**
 * Returns candidate statistics.
 *
 * @returns {Object}
 */
function sciipGetCandidateStats() {
  const rows =
    sciipGetSheetValues(
      SCIIP_CANDIDATE_SHEET
    );

  return {
    candidateCount:
      rows.length > 0
        ? rows.length - 1
        : 0,
    generatedAt:
      sciipNowIso()
  };
}

/**
 * Processor entry point.
 *
 * @param {Object=} context
 * @returns {Object}
 */
function sciipRunCandidateEngine(
  context
) {
  sciipInitializeCandidateSheet();

  return {
    status: 'SUCCESS',
    processor:
      'CandidateEngine',
    generatedAt:
      sciipNowIso()
  };
}