/** SCIIP_OS compiled bundle: 03_identity_001.gs
 * sources: 14
 * generated: 2026-07-17T17:22:40.224Z
 */
/* ==========================================================
   SCIIP_OS
   Module: Identity
   File: AliasProcessor.gs

   Purpose:
   Manages SCIIP asset aliases.

   Aliases allow multiple observed identities
   to resolve to a single canonical asset.

   Examples:

   5517 AYON AVE
   5517 AYON AVENUE
   5517 AYON

   → Same Asset

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

const SCIIP_ALIAS_SHEET = 'PROPERTY_ALIAS';

/**
 * Returns alias sheet.
 *
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function sciipGetAliasSheet() {
  return sciipGetOrCreateSheet(
    SCIIP_ALIAS_SHEET
  );
}

/**
 * Creates alias table if missing.
 */
function sciipInitializeAliasSheet() {
  const sheet = sciipGetAliasSheet();

  if (sheet.getLastRow() > 0) {
    return;
  }

  sheet.appendRow([
    'Alias_ID',
    'Asset_ID',
    'Alias_Type',
    'Alias_Value',
    'Canonical_Value',
    'Created_At',
    'Source'
  ]);
}

/**
 * Creates a new alias.
 *
 * @param {Object} alias
 * @returns {Object}
 */
function sciipCreateAlias(alias) {
  sciipInitializeAliasSheet();

  const aliasId =
    'ALIAS_' +
    sciipUuid()
      .replace(/-/g, '')
      .substring(0, 16)
      .toUpperCase();

  const row = [
    aliasId,
    alias.assetId,
    alias.aliasType,
    alias.aliasValue,
    alias.canonicalValue,
    sciipNowIso(),
    alias.source || 'SCIIP'
  ];

  sciipAppendRow(
    SCIIP_ALIAS_SHEET,
    row
  );

  return {
    aliasId: aliasId,
    assetId: alias.assetId,
    aliasType: alias.aliasType,
    aliasValue: alias.aliasValue,
    canonicalValue:
      alias.canonicalValue
  };
}

/**
 * Creates an address alias.
 *
 * @param {string} assetId
 * @param {string} observedAddress
 * @param {string} canonicalAddress
 * @returns {Object}
 */
function sciipCreateAddressAlias(
  assetId,
  observedAddress,
  canonicalAddress
) {
  return sciipCreateAlias({
    assetId: assetId,
    aliasType: 'ADDRESS',
    aliasValue: observedAddress,
    canonicalValue:
      canonicalAddress,
    source: 'MATCH_ENGINE'
  });
}

/**
 * Finds aliases for an asset.
 *
 * @param {string} assetId
 * @returns {Array}
 */
function sciipGetAliasesByAssetId(
  assetId
) {
  sciipInitializeAliasSheet();

  const rows =
    sciipGetSheetValues(
      SCIIP_ALIAS_SHEET
    );

  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0];
  const assetIndex =
    headers.indexOf('Asset_ID');

  return rows
    .slice(1)
    .filter(function(row) {
      return (
        row[assetIndex] === assetId
      );
    })
    .map(function(row) {
      const obj = {};

      headers.forEach(
        function(header, index) {
          obj[header] =
            row[index];
        }
      );

      return obj;
    });
}

/**
 * Returns alias statistics.
 *
 * @returns {Object}
 */
function sciipGetAliasStats() {
  const rows =
    sciipGetSheetValues(
      SCIIP_ALIAS_SHEET
    );

  return {
    aliasCount:
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
 * Future:
 * - Auto-alias generation
 * - Fuzzy matching
 * - APN aliases
 * - Campus aliases
 *
 * @param {Object=} context
 * @returns {Object}
 */
function sciipRunAliasProcessor(
  context
) {
  sciipInitializeAliasSheet();

  return {
    status: 'SUCCESS',
    processor: 'AliasProcessor',
    generatedAt:
      sciipNowIso()
  };
}

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

/* ==========================================================
   SCIIP_OS
   Module: Identity
   File: CanonicalIdentity.gs

   Purpose:
   Creates and manages canonical asset identity.

   Canonical identity is the foundation of SCIIP's
   Asset-Centric architecture.

   Every observation ultimately resolves to a
   canonical Asset_ID.

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Creates a canonical identity object.
 *
 * @param {Object} input
 * @returns {Object}
 */
function sciipCreateCanonicalIdentity(input) {
  const record = input || {};

  const address = sciipAddressNormalize(
    sciipCoalesce(
      record.address,
      record.Address,
      record.canonicalAddress
    )
  );

  const city = sciipCityNormalize(
    sciipCoalesce(
      record.city,
      record.City,
      record.canonicalCity
    )
  );

  const zip = sciipZipNormalize(
    sciipCoalesce(
      record.zip,
      record.Zip,
      record.canonicalZip
    )
  );

  const apn = sciipNormalizeToken(
    sciipCoalesce(
      record.apn,
      record.APN,
      record.canonicalApn
    )
  );

  const businessKey = sciipAssetBusinessKey(
    address,
    city,
    zip
  );

  return {
    businessKey: businessKey,
    canonicalAddress: address,
    canonicalCity: city,
    canonicalZip: zip,
    canonicalApn: apn,
    generatedAt: sciipNowIso()
  };
}

/**
 * Compares two identity objects.
 *
 * Returns a confidence score between 0 and 100.
 *
 * @param {Object} identityA
 * @param {Object} identityB
 * @returns {number}
 */
function sciipIdentityConfidence(
  identityA,
  identityB
) {
  if (!identityA || !identityB) {
    return 0;
  }

  let score = 0;

  if (
    identityA.businessKey &&
    identityA.businessKey === identityB.businessKey
  ) {
    score += 70;
  }

  if (
    identityA.canonicalAddress &&
    identityA.canonicalAddress === identityB.canonicalAddress
  ) {
    score += 20;
  }

  if (
    identityA.canonicalApn &&
    identityA.canonicalApn === identityB.canonicalApn
  ) {
    score += 10;
  }

  return Math.min(score, 100);
}

/**
 * Returns true when two identities
 * are considered a match.
 *
 * @param {Object} identityA
 * @param {Object} identityB
 * @returns {boolean}
 */
function sciipIdentityMatch(
  identityA,
  identityB
) {
  return sciipIdentityConfidence(
    identityA,
    identityB
  ) >= 90;
}

/**
 * Creates a deterministic identity key.
 *
 * Used for graph linking and matching.
 *
 * @param {Object} identity
 * @returns {string}
 */
function sciipIdentityKey(identity) {
  return sciipCreateBusinessKey([
    identity.businessKey,
    identity.canonicalApn
  ]);
}

/* ==========================================================
   SCIIP_OS
   Module: Identity
   File: MatchEngine.gs

   Purpose:
   Resolves observations against existing SCIIP assets.

   The Match Engine is responsible for determining whether
   an observation should:

   - Match an existing Asset
   - Create a new Asset
   - Enter Manual Review

   Source of Truth:
   GitHub

   Runtime:
   Google Apps Script
========================================================== */

/**
 * Match confidence thresholds.
 */
const SCIIP_MATCH_THRESHOLDS = {
  AUTO_MATCH: 90,
  REVIEW_REQUIRED: 70,
  NEW_ASSET: 69
};

/**
 * Attempts to resolve an observation.
 *
 * @param {Object} observation
 * @returns {Object}
 */
function sciipResolveObservation(observation) {
  const identity = sciipCreateCanonicalIdentity(
    observation
  );

  const asset = sciipFindAsset(
    identity.businessKey
  );

  if (!asset) {
    return {
      action: 'CREATE_ASSET',
      confidence: 0,
      identity: identity,
      asset: null
    };
  }

  const assetIdentity =
    sciipCreateCanonicalIdentity(asset);

  const confidence =
    sciipIdentityConfidence(
      identity,
      assetIdentity
    );

  if (
    confidence >=
    SCIIP_MATCH_THRESHOLDS.AUTO_MATCH
  ) {
    return {
      action: 'MATCH',
      confidence: confidence,
      identity: identity,
      asset: asset
    };
  }

  if (
    confidence >=
    SCIIP_MATCH_THRESHOLDS.REVIEW_REQUIRED
  ) {
    return {
      action: 'REVIEW',
      confidence: confidence,
      identity: identity,
      asset: asset
    };
  }

  return {
    action: 'CREATE_ASSET',
    confidence: confidence,
    identity: identity,
    asset: null
  };
}

/**
 * Returns the best matching asset.
 *
 * Current implementation:
 * Business key lookup.
 *
 * Future implementation:
 * - APN matching
 * - GIS matching
 * - Alias matching
 * - Fuzzy address matching
 * - Campus matching
 *
 * @param {Object} observation
 * @returns {Object|null}
 */
function sciipFindBestAssetMatch(
  observation
) {
  const result =
    sciipResolveObservation(
      observation
    );

  return result.asset || null;
}

/**
 * Determines whether an observation
 * requires manual review.
 *
 * @param {Object} observation
 * @returns {boolean}
 */
function sciipRequiresManualReview(
  observation
) {
  const result =
    sciipResolveObservation(
      observation
    );

  return result.action === 'REVIEW';
}

/**
 * Returns a human-readable
 * match summary.
 *
 * @param {Object} observation
 * @returns {Object}
 */
function sciipMatchSummary(
  observation
) {
  const result =
    sciipResolveObservation(
      observation
    );

  return {
    action: result.action,
    confidence: result.confidence,
    businessKey:
      result.identity.businessKey,
    assetId:
      result.asset
        ? (
            result.asset.Asset_ID ||
            result.asset.assetId
          )
        : null
  };
}

/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6660_IdentityExecutionReadinessProcessor.gs
 * Processor: 6660_IdentityExecutionReadiness
 * Purpose: Prepares the identity execution layer after accepted asset execution records exist.
 */

function sciipRun6660_IdentityExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6660_IdentityExecutionReadiness',
    action: 'IDENTITY_EXECUTION_READINESS',
    targetSheet: 'IDENTITY_EXECUTION_READINESS',
    ledgerSheet: 'IDENTITY_EXECUTION_READINESS_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Prepares the identity execution layer after accepted asset execution records exist.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'ASSET_ACCEPTANCE',
          requiredSourceStatus: 'ASSET_EXECUTION_ACCEPTED',
          executionStatus: 'IDENTITY_EXECUTION_READY',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6670_IdentityCandidateImportProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6660|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_READY',
        sourceSheet: 'ASSET_ACCEPTANCE',
        sourceStatusRequired: 'ASSET_EXECUTION_ACCEPTED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Prepares the identity execution layer after accepted asset execution records exist.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_READY',
        sourceSheet: 'ASSET_ACCEPTANCE',
        sourceStatusRequired: 'ASSET_EXECUTION_ACCEPTED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EXECUTION_READY',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6670_IdentityCandidateImportProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_EXECUTION_READY',
          sourceSheet: 'ASSET_ACCEPTANCE',
          requiredSourceStatus: 'ASSET_EXECUTION_ACCEPTED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6670_IdentityCandidateImportProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_READY',
        sourceSheet: 'ASSET_ACCEPTANCE',
        sourceStatusRequired: 'ASSET_EXECUTION_ACCEPTED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EXECUTION_READY',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6670_IdentityCandidateImportProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6660_IdentityExecutionReadinessProcessor() {
  return sciipRun6660_IdentityExecutionReadinessProcessor();
}

function sciipTest6660_IdentityExecutionReadinessProcessor() {
  var result = sciipRun6660_IdentityExecutionReadinessProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6660_IdentityExecutionReadinessProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6670_IdentityCandidateImportProcessor.gs
 * Processor: 6670_IdentityCandidateImport
 * Purpose: Imports identity candidates from the accepted asset execution layer for canonical identity processing.
 */

function sciipRun6670_IdentityCandidateImportProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6670_IdentityCandidateImport',
    action: 'IDENTITY_CANDIDATE_IMPORT',
    targetSheet: 'IDENTITY_CANDIDATE_IMPORT',
    ledgerSheet: 'IDENTITY_CANDIDATE_IMPORT_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Imports identity candidates from the accepted asset execution layer for canonical identity processing.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_EXECUTION_READINESS',
          requiredSourceStatus: 'IDENTITY_EXECUTION_READY',
          executionStatus: 'IDENTITY_CANDIDATES_IMPORTED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6680_IdentityAliasResolutionProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6670|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_CANDIDATES_IMPORTED',
        sourceSheet: 'IDENTITY_EXECUTION_READINESS',
        sourceStatusRequired: 'IDENTITY_EXECUTION_READY',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Imports identity candidates from the accepted asset execution layer for canonical identity processing.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_CANDIDATES_IMPORTED',
        sourceSheet: 'IDENTITY_EXECUTION_READINESS',
        sourceStatusRequired: 'IDENTITY_EXECUTION_READY',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_CANDIDATES_IMPORTED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6680_IdentityAliasResolutionProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_CANDIDATES_IMPORTED',
          sourceSheet: 'IDENTITY_EXECUTION_READINESS',
          requiredSourceStatus: 'IDENTITY_EXECUTION_READY',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6680_IdentityAliasResolutionProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_CANDIDATES_IMPORTED',
        sourceSheet: 'IDENTITY_EXECUTION_READINESS',
        sourceStatusRequired: 'IDENTITY_EXECUTION_READY',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_CANDIDATES_IMPORTED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6680_IdentityAliasResolutionProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6670_IdentityCandidateImportProcessor() {
  return sciipRun6670_IdentityCandidateImportProcessor();
}

function sciipTest6670_IdentityCandidateImportProcessor() {
  var result = sciipRun6670_IdentityCandidateImportProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6670_IdentityCandidateImportProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6680_IdentityAliasResolutionProcessor.gs
 * Processor: 6680_IdentityAliasResolution
 * Purpose: Resolves durable property and asset aliases for identity-safe processing.
 */

function sciipRun6680_IdentityAliasResolutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6680_IdentityAliasResolution',
    action: 'IDENTITY_ALIAS_RESOLUTION',
    targetSheet: 'IDENTITY_ALIAS_RESOLUTION',
    ledgerSheet: 'IDENTITY_ALIAS_RESOLUTION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Resolves durable property and asset aliases for identity-safe processing.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_CANDIDATE_IMPORT',
          requiredSourceStatus: 'IDENTITY_CANDIDATES_IMPORTED',
          executionStatus: 'IDENTITY_ALIASES_RESOLVED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6690_ParentAddressResolutionProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6680|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_ALIASES_RESOLVED',
        sourceSheet: 'IDENTITY_CANDIDATE_IMPORT',
        sourceStatusRequired: 'IDENTITY_CANDIDATES_IMPORTED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Resolves durable property and asset aliases for identity-safe processing.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_ALIASES_RESOLVED',
        sourceSheet: 'IDENTITY_CANDIDATE_IMPORT',
        sourceStatusRequired: 'IDENTITY_CANDIDATES_IMPORTED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_ALIASES_RESOLVED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6690_ParentAddressResolutionProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_ALIASES_RESOLVED',
          sourceSheet: 'IDENTITY_CANDIDATE_IMPORT',
          requiredSourceStatus: 'IDENTITY_CANDIDATES_IMPORTED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6690_ParentAddressResolutionProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_ALIASES_RESOLVED',
        sourceSheet: 'IDENTITY_CANDIDATE_IMPORT',
        sourceStatusRequired: 'IDENTITY_CANDIDATES_IMPORTED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_ALIASES_RESOLVED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6690_ParentAddressResolutionProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6680_IdentityAliasResolutionProcessor() {
  return sciipRun6680_IdentityAliasResolutionProcessor();
}

function sciipTest6680_IdentityAliasResolutionProcessor() {
  var result = sciipRun6680_IdentityAliasResolutionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6680_IdentityAliasResolutionProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6690_ParentAddressResolutionProcessor.gs
 * Processor: 6690_ParentAddressResolution
 * Purpose: Resolves parent address identities so property records can be grouped without overwrites.
 */

function sciipRun6690_ParentAddressResolutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6690_ParentAddressResolution',
    action: 'PARENT_ADDRESS_RESOLUTION',
    targetSheet: 'PARENT_ADDRESS_RESOLUTION',
    ledgerSheet: 'PARENT_ADDRESS_RESOLUTION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Resolves parent address identities so property records can be grouped without overwrites.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
          requiredSourceStatus: 'IDENTITY_ALIASES_RESOLVED',
          executionStatus: 'PARENT_ADDRESSES_RESOLVED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6700_CanonicalIdentityCreationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6690|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'PARENT_ADDRESSES_RESOLVED',
        sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
        sourceStatusRequired: 'IDENTITY_ALIASES_RESOLVED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Resolves parent address identities so property records can be grouped without overwrites.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'PARENT_ADDRESSES_RESOLVED',
        sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
        sourceStatusRequired: 'IDENTITY_ALIASES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'PARENT_ADDRESSES_RESOLVED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6700_CanonicalIdentityCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'PARENT_ADDRESSES_RESOLVED',
          sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
          requiredSourceStatus: 'IDENTITY_ALIASES_RESOLVED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6700_CanonicalIdentityCreationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'PARENT_ADDRESSES_RESOLVED',
        sourceSheet: 'IDENTITY_ALIAS_RESOLUTION',
        sourceStatusRequired: 'IDENTITY_ALIASES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'PARENT_ADDRESSES_RESOLVED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6700_CanonicalIdentityCreationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6690_ParentAddressResolutionProcessor() {
  return sciipRun6690_ParentAddressResolutionProcessor();
}

function sciipTest6690_ParentAddressResolutionProcessor() {
  var result = sciipRun6690_ParentAddressResolutionProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6690_ParentAddressResolutionProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6700_CanonicalIdentityCreationProcessor.gs
 * Processor: 6700_CanonicalIdentityCreation
 * Purpose: Creates canonical durable identity records for assets, properties, addresses, and parent addresses.
 */

function sciipRun6700_CanonicalIdentityCreationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6700_CanonicalIdentityCreation',
    action: 'CANONICAL_IDENTITY_CREATION',
    targetSheet: 'CANONICAL_IDENTITY_CREATION',
    ledgerSheet: 'CANONICAL_IDENTITY_CREATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Creates canonical durable identity records for assets, properties, addresses, and parent addresses.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
          requiredSourceStatus: 'PARENT_ADDRESSES_RESOLVED',
          executionStatus: 'CANONICAL_IDENTITIES_CREATED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6710_IdentityRelationshipBindingProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6700|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'CANONICAL_IDENTITIES_CREATED',
        sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
        sourceStatusRequired: 'PARENT_ADDRESSES_RESOLVED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Creates canonical durable identity records for assets, properties, addresses, and parent addresses.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'CANONICAL_IDENTITIES_CREATED',
        sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
        sourceStatusRequired: 'PARENT_ADDRESSES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'CANONICAL_IDENTITIES_CREATED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6710_IdentityRelationshipBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'CANONICAL_IDENTITIES_CREATED',
          sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
          requiredSourceStatus: 'PARENT_ADDRESSES_RESOLVED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6710_IdentityRelationshipBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'CANONICAL_IDENTITIES_CREATED',
        sourceSheet: 'PARENT_ADDRESS_RESOLUTION',
        sourceStatusRequired: 'PARENT_ADDRESSES_RESOLVED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'CANONICAL_IDENTITIES_CREATED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6710_IdentityRelationshipBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6700_CanonicalIdentityCreationProcessor() {
  return sciipRun6700_CanonicalIdentityCreationProcessor();
}

function sciipTest6700_CanonicalIdentityCreationProcessor() {
  var result = sciipRun6700_CanonicalIdentityCreationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6700_CanonicalIdentityCreationProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6710_IdentityRelationshipBindingProcessor.gs
 * Processor: 6710_IdentityRelationshipBinding
 * Purpose: Binds canonical identities to asset, address, parent address, city, zip, and status relationships.
 */

function sciipRun6710_IdentityRelationshipBindingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6710_IdentityRelationshipBinding',
    action: 'IDENTITY_RELATIONSHIP_BINDING',
    targetSheet: 'IDENTITY_RELATIONSHIP_BINDING',
    ledgerSheet: 'IDENTITY_RELATIONSHIP_BINDING_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Binds canonical identities to asset, address, parent address, city, zip, and status relationships.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'CANONICAL_IDENTITY_CREATION',
          requiredSourceStatus: 'CANONICAL_IDENTITIES_CREATED',
          executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6720_IdentityEventGenerationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6710|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        sourceSheet: 'CANONICAL_IDENTITY_CREATION',
        sourceStatusRequired: 'CANONICAL_IDENTITIES_CREATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Binds canonical identities to asset, address, parent address, city, zip, and status relationships.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        sourceSheet: 'CANONICAL_IDENTITY_CREATION',
        sourceStatusRequired: 'CANONICAL_IDENTITIES_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6720_IdentityEventGenerationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
          sourceSheet: 'CANONICAL_IDENTITY_CREATION',
          requiredSourceStatus: 'CANONICAL_IDENTITIES_CREATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6720_IdentityEventGenerationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        sourceSheet: 'CANONICAL_IDENTITY_CREATION',
        sourceStatusRequired: 'CANONICAL_IDENTITIES_CREATED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6720_IdentityEventGenerationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6710_IdentityRelationshipBindingProcessor() {
  return sciipRun6710_IdentityRelationshipBindingProcessor();
}

function sciipTest6710_IdentityRelationshipBindingProcessor() {
  var result = sciipRun6710_IdentityRelationshipBindingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6710_IdentityRelationshipBindingProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6720_IdentityEventGenerationProcessor.gs
 * Processor: 6720_IdentityEventGeneration
 * Purpose: Generates permanent identity events for the SCIIP event-sourced history layer.
 */

function sciipRun6720_IdentityEventGenerationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6720_IdentityEventGeneration',
    action: 'IDENTITY_EVENT_GENERATION',
    targetSheet: 'IDENTITY_EVENT_GENERATION',
    ledgerSheet: 'IDENTITY_EVENT_GENERATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Generates permanent identity events for the SCIIP event-sourced history layer.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_RELATIONSHIP_BINDING',
          requiredSourceStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
          executionStatus: 'IDENTITY_EVENTS_GENERATED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6730_IdentityGraphBindingProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6720|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_EVENTS_GENERATED',
        sourceSheet: 'IDENTITY_RELATIONSHIP_BINDING',
        sourceStatusRequired: 'IDENTITY_RELATIONSHIPS_BOUND',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Generates permanent identity events for the SCIIP event-sourced history layer.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EVENTS_GENERATED',
        sourceSheet: 'IDENTITY_RELATIONSHIP_BINDING',
        sourceStatusRequired: 'IDENTITY_RELATIONSHIPS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EVENTS_GENERATED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6730_IdentityGraphBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_EVENTS_GENERATED',
          sourceSheet: 'IDENTITY_RELATIONSHIP_BINDING',
          requiredSourceStatus: 'IDENTITY_RELATIONSHIPS_BOUND',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6730_IdentityGraphBindingProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EVENTS_GENERATED',
        sourceSheet: 'IDENTITY_RELATIONSHIP_BINDING',
        sourceStatusRequired: 'IDENTITY_RELATIONSHIPS_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EVENTS_GENERATED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6730_IdentityGraphBindingProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6720_IdentityEventGenerationProcessor() {
  return sciipRun6720_IdentityEventGenerationProcessor();
}

function sciipTest6720_IdentityEventGenerationProcessor() {
  var result = sciipRun6720_IdentityEventGenerationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6720_IdentityEventGenerationProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6730_IdentityGraphBindingProcessor.gs
 * Processor: 6730_IdentityGraphBinding
 * Purpose: Binds identity events to the knowledge graph execution layer for graph-native asset intelligence.
 */

function sciipRun6730_IdentityGraphBindingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6730_IdentityGraphBinding',
    action: 'IDENTITY_GRAPH_BINDING',
    targetSheet: 'IDENTITY_GRAPH_BINDING',
    ledgerSheet: 'IDENTITY_GRAPH_BINDING_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Binds identity events to the knowledge graph execution layer for graph-native asset intelligence.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_EVENT_GENERATION',
          requiredSourceStatus: 'IDENTITY_EVENTS_GENERATED',
          executionStatus: 'IDENTITY_GRAPH_BOUND',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6740_IdentityExecutionCertificationProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6730|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_GRAPH_BOUND',
        sourceSheet: 'IDENTITY_EVENT_GENERATION',
        sourceStatusRequired: 'IDENTITY_EVENTS_GENERATED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Binds identity events to the knowledge graph execution layer for graph-native asset intelligence.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_GRAPH_BOUND',
        sourceSheet: 'IDENTITY_EVENT_GENERATION',
        sourceStatusRequired: 'IDENTITY_EVENTS_GENERATED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_GRAPH_BOUND',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6740_IdentityExecutionCertificationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_GRAPH_BOUND',
          sourceSheet: 'IDENTITY_EVENT_GENERATION',
          requiredSourceStatus: 'IDENTITY_EVENTS_GENERATED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6740_IdentityExecutionCertificationProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_GRAPH_BOUND',
        sourceSheet: 'IDENTITY_EVENT_GENERATION',
        sourceStatusRequired: 'IDENTITY_EVENTS_GENERATED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_GRAPH_BOUND',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6740_IdentityExecutionCertificationProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6730_IdentityGraphBindingProcessor() {
  return sciipRun6730_IdentityGraphBindingProcessor();
}

function sciipTest6730_IdentityGraphBindingProcessor() {
  var result = sciipRun6730_IdentityGraphBindingProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6730_IdentityGraphBindingProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6740_IdentityExecutionCertificationProcessor.gs
 * Processor: 6740_IdentityExecutionCertification
 * Purpose: Certifies the identity execution layer for production acceptance.
 */

function sciipRun6740_IdentityExecutionCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6740_IdentityExecutionCertification',
    action: 'IDENTITY_EXECUTION_CERTIFICATION',
    targetSheet: 'IDENTITY_EXECUTION_CERTIFICATION',
    ledgerSheet: 'IDENTITY_EXECUTION_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Certifies the identity execution layer for production acceptance.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_GRAPH_BINDING',
          requiredSourceStatus: 'IDENTITY_GRAPH_BOUND',
          executionStatus: 'IDENTITY_EXECUTION_CERTIFIED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6750_IdentityAcceptanceProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6740|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_CERTIFIED',
        sourceSheet: 'IDENTITY_GRAPH_BINDING',
        sourceStatusRequired: 'IDENTITY_GRAPH_BOUND',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Certifies the identity execution layer for production acceptance.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_CERTIFIED',
        sourceSheet: 'IDENTITY_GRAPH_BINDING',
        sourceStatusRequired: 'IDENTITY_GRAPH_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EXECUTION_CERTIFIED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6750_IdentityAcceptanceProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_EXECUTION_CERTIFIED',
          sourceSheet: 'IDENTITY_GRAPH_BINDING',
          requiredSourceStatus: 'IDENTITY_GRAPH_BOUND',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6750_IdentityAcceptanceProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_CERTIFIED',
        sourceSheet: 'IDENTITY_GRAPH_BINDING',
        sourceStatusRequired: 'IDENTITY_GRAPH_BOUND',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EXECUTION_CERTIFIED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6750_IdentityAcceptanceProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6740_IdentityExecutionCertificationProcessor() {
  return sciipRun6740_IdentityExecutionCertificationProcessor();
}

function sciipTest6740_IdentityExecutionCertificationProcessor() {
  var result = sciipRun6740_IdentityExecutionCertificationProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6740_IdentityExecutionCertificationProcessor',
    result: result
  }));
  return result;
}


/**
 * SCIIP_OS v5.5 / Runtime v5.2
 * File: 6750_IdentityAcceptanceProcessor.gs
 * Processor: 6750_IdentityAcceptance
 * Purpose: Accepts the identity execution layer and authorizes graph execution readiness.
 */

function sciipRun6750_IdentityAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '6750_IdentityAcceptance',
    action: 'IDENTITY_ACCEPTANCE',
    targetSheet: 'IDENTITY_ACCEPTANCE',
    ledgerSheet: 'IDENTITY_ACCEPTANCE_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Accepts the identity execution layer and authorizes graph execution readiness.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          sourceSheet: 'IDENTITY_EXECUTION_CERTIFICATION',
          requiredSourceStatus: 'IDENTITY_EXECUTION_CERTIFIED',
          executionStatus: 'IDENTITY_EXECUTION_ACCEPTED',
          runtimeMilestone: 'v5.4-runtime-6200',
          domainMilestone: 'v5.5-identity-execution',
          nextProcessor: '6760_GraphExecutionReadinessProcessor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      if (typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined') errors.push('Missing SCIIP_RUNTIME_PROCESSOR_BASE.');
      if (typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_SHEET_FACTORY.');
      if (typeof SCIIP_RUNTIME_RESULT_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_RESULT_FACTORY.');
      if (typeof SCIIP_RUNTIME_PAYLOAD_FACTORY === 'undefined') errors.push('Missing SCIIP_RUNTIME_PAYLOAD_FACTORY.');
      if (typeof SCIIP_RUNTIME_CONTEXT === 'undefined') errors.push('Missing SCIIP_RUNTIME_CONTEXT.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var headers = [
        'businessKey',
        'transactionId',
        'processor',
        'executionStatus',
        'sourceSheet',
        'sourceStatusRequired',
        'recordsRead',
        'recordsCreated',
        'identityExecutionId',
        'identityBusinessKey',
        'identityStatus',
        'identityPayloadJson',
        'runtimeMilestone',
        'domainMilestone',
        'nextProcessor',
        'frameworkVersion',
        'createdAt'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, headers);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, headers);

      var now = new Date();
      var identityExecutionId = '6750|' + context.businessKey;
      var identityBusinessKey = 'IDENTITY_EXECUTION|' + context.businessKey;
      var identityPayload = {
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_ACCEPTED',
        sourceSheet: 'IDENTITY_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'IDENTITY_EXECUTION_CERTIFIED',
        targetSheet: definition.targetSheet,
        transactionId: transaction.transactionId,
        generatedAt: now.toISOString(),
        summary: 'Accepts the identity execution layer and authorizes graph execution readiness.'
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_ACCEPTED',
        sourceSheet: 'IDENTITY_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'IDENTITY_EXECUTION_CERTIFIED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EXECUTION_ACCEPTED',
        identityPayloadJson: JSON.stringify(identityPayload),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6760_GraphExecutionReadinessProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 1,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          executionStatus: 'IDENTITY_EXECUTION_ACCEPTED',
          sourceSheet: 'IDENTITY_EXECUTION_CERTIFICATION',
          requiredSourceStatus: 'IDENTITY_EXECUTION_CERTIFIED',
          recordsRead: 1,
          recordsCreated: 1,
          transactionId: transaction.transactionId,
          nextProcessor: '6760_GraphExecutionReadinessProcessor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.ledgerSheet, headers, {
        businessKey: context.businessKey,
        transactionId: transaction.transactionId,
        processor: context.processor,
        executionStatus: 'IDENTITY_EXECUTION_ACCEPTED',
        sourceSheet: 'IDENTITY_EXECUTION_CERTIFICATION',
        sourceStatusRequired: 'IDENTITY_EXECUTION_CERTIFIED',
        recordsRead: 1,
        recordsCreated: 1,
        identityExecutionId: identityExecutionId,
        identityBusinessKey: identityBusinessKey,
        identityStatus: 'IDENTITY_EXECUTION_ACCEPTED',
        identityPayloadJson: JSON.stringify(result),
        runtimeMilestone: 'v5.4-runtime-6200',
        domainMilestone: 'v5.5-identity-execution',
        nextProcessor: '6760_GraphExecutionReadinessProcessor',
        frameworkVersion: SCIIP_RUNTIME_PROCESSOR_BASE.VERSION,
        createdAt: now
      });

      return result;
    }
  });
}

function run6750_IdentityAcceptanceProcessor() {
  return sciipRun6750_IdentityAcceptanceProcessor();
}

function sciipTest6750_IdentityAcceptanceProcessor() {
  var result = sciipRun6750_IdentityAcceptanceProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTest6750_IdentityAcceptanceProcessor',
    result: result
  }));
  return result;
}
