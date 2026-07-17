/** SCIIP_OS compiled bundle: 11_other_004.gs
 * sources: 99
 * generated: 2026-07-17T17:34:24.925Z
 */
/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASES',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessorLegacy1910_();
      return sciipWrapLegacyRuntimeResult1910_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1910_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessorLegacy1910_() {
  const processor =
    '1910_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_CERTIFICATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'certificationScope',
      'certificationName',
      'certificationStatus',
      'certificationSummary',
      'certificationResult',
      'certifiedBusinessKey',
      'certifiedNodeType',
      'certifiedNodeKey',
      'certifiedNodeLabel',
      'certifiedRelationshipType',
      'certifiedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'certificationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const releaseSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseScope',
      'releaseName',
      'releaseStatus',
      'releaseSummary',
      'releaseResult',
      'releasedBusinessKey',
      'releasedNodeType',
      'releasedNodeKey',
      'releasedNodeLabel',
      'releasedRelationshipType',
      'releasedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releasePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(releaseSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const certificationResult = sourceRecord.certificationResult || 'CERTIFIED';
  const releaseResult =
    String(certificationResult).toUpperCase() === 'CERTIFIED'
      ? 'RELEASED'
      : 'BLOCKED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.certificationStatus || sourceRecord.sourceStatus || '',
    certificationResult,
    certifiedBusinessKey: sourceRecord.certifiedBusinessKey || '',
    certifiedNodeType: sourceRecord.certifiedNodeType || '',
    certifiedNodeKey: sourceRecord.certifiedNodeKey || '',
    certifiedNodeLabel: sourceRecord.certifiedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const releasePayload = {
    releaseType: 'ARCHITECTURE_REVIEW_RELEASE',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCertificationBusinessKey: sourceRecord.businessKey || '',
    certificationResult,
    releaseResult,
    releasedBusinessKey: sourceRecord.certifiedBusinessKey || '',
    releasedNodeType: sourceRecord.certifiedNodeType || '',
    releasedNodeKey: sourceRecord.certifiedNodeKey || '',
    releasedNodeLabel: sourceRecord.certifiedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    releasedAt: now.toISOString()
  };

  releaseSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.certificationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_RELEASE',
    'SCIIP_OS v5.0 Architecture Review Release',
    releaseResult,
    'Certified architecture-review output released for downstream platform evolution.',
    releaseResult,
    sourceRecord.certifiedBusinessKey || '',
    sourceRecord.certifiedNodeType || '',
    sourceRecord.certifiedNodeKey || '',
    sourceRecord.certifiedNodeLabel || '',
    sourceRecord.certifiedRelationshipType || '',
    sourceRecord.certifiedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(releasePayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleasesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessorLegacy1920_();
      return sciipWrapLegacyRuntimeResult1920_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1920_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessorLegacy1920_() {
  const processor =
    '1920_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseScope',
      'releaseName',
      'releaseStatus',
      'releaseSummary',
      'releaseResult',
      'releasedBusinessKey',
      'releasedNodeType',
      'releasedNodeKey',
      'releasedNodeLabel',
      'releasedRelationshipType',
      'releasedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releasePayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseLedgerScope',
      'releaseLedgerName',
      'releaseLedgerStatus',
      'releaseLedgerSummary',
      'ledgeredReleaseBusinessKey',
      'releaseResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releaseLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const releaseResult = sourceRecord.releaseResult || 'RELEASED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.releaseStatus || sourceRecord.sourceStatus || '',
    releaseResult,
    releasedBusinessKey: sourceRecord.releasedBusinessKey || '',
    releasedNodeType: sourceRecord.releasedNodeType || '',
    releasedNodeKey: sourceRecord.releasedNodeKey || '',
    releasedNodeLabel: sourceRecord.releasedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const releaseLedgerPayload = {
    releaseLedgerType: 'ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReleaseBusinessKey: sourceRecord.businessKey || '',
    releaseResult,
    ledgeredReleaseBusinessKey: sourceRecord.releasedBusinessKey || '',
    ledgeredNodeType: sourceRecord.releasedNodeType || '',
    ledgeredNodeKey: sourceRecord.releasedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.releasedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.releaseStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Release Ledger',
    'LEDGERED',
    'Architecture review release written into permanent release ledger history.',
    sourceRecord.businessKey || '',
    releaseResult,
    sourceRecord.releasedNodeType || '',
    sourceRecord.releasedNodeKey || '',
    sourceRecord.releasedNodeLabel || '',
    sourceRecord.releasedRelationshipType || '',
    sourceRecord.releasedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(releaseLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReleaseLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessorLegacy1930_();
      return sciipWrapLegacyRuntimeResult1930_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1930_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessorLegacy1930_() {
  const processor =
    '1930_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_RELEASE_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'releaseLedgerScope',
      'releaseLedgerName',
      'releaseLedgerStatus',
      'releaseLedgerSummary',
      'ledgeredReleaseBusinessKey',
      'releaseResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'releaseLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const promotionSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionScope',
      'promotionName',
      'promotionStatus',
      'promotionSummary',
      'promotionResult',
      'promotedBusinessKey',
      'promotedNodeType',
      'promotedNodeKey',
      'promotedNodeLabel',
      'promotedRelationshipType',
      'promotedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(promotionSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const releaseResult = sourceRecord.releaseResult || 'RELEASED';
  const promotionResult =
    String(releaseResult).toUpperCase() === 'RELEASED'
      ? 'PROMOTED'
      : 'NOT_PROMOTED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.releaseLedgerStatus || sourceRecord.sourceStatus || '',
    releaseResult,
    ledgeredReleaseBusinessKey: sourceRecord.ledgeredReleaseBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const promotionPayload = {
    promotionType: 'ARCHITECTURE_REVIEW_PROMOTION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReleaseLedgerBusinessKey: sourceRecord.businessKey || '',
    releaseResult,
    promotionResult,
    promotedBusinessKey: sourceRecord.ledgeredReleaseBusinessKey || '',
    promotedNodeType: sourceRecord.ledgeredNodeType || '',
    promotedNodeKey: sourceRecord.ledgeredNodeKey || '',
    promotedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    promotedAt: now.toISOString()
  };

  promotionSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.releaseLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_PROMOTION',
    'SCIIP_OS v5.0 Architecture Review Promotion',
    promotionResult,
    'Architecture review release ledger promoted for downstream autonomous platform evolution.',
    promotionResult,
    sourceRecord.ledgeredReleaseBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(promotionPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessorLegacy1940_();
      return sciipWrapLegacyRuntimeResult1940_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1940_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessorLegacy1940_() {
  const processor =
    '1940_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionScope',
      'promotionName',
      'promotionStatus',
      'promotionSummary',
      'promotionResult',
      'promotedBusinessKey',
      'promotedNodeType',
      'promotedNodeKey',
      'promotedNodeLabel',
      'promotedRelationshipType',
      'promotedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionLedgerScope',
      'promotionLedgerName',
      'promotionLedgerStatus',
      'promotionLedgerSummary',
      'ledgeredPromotionBusinessKey',
      'promotionResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const promotionResult = sourceRecord.promotionResult || 'PROMOTED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.promotionStatus || sourceRecord.sourceStatus || '',
    promotionResult,
    promotedBusinessKey: sourceRecord.promotedBusinessKey || '',
    promotedNodeType: sourceRecord.promotedNodeType || '',
    promotedNodeKey: sourceRecord.promotedNodeKey || '',
    promotedNodeLabel: sourceRecord.promotedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const promotionLedgerPayload = {
    promotionLedgerType: 'ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourcePromotionBusinessKey: sourceRecord.businessKey || '',
    promotionResult,
    ledgeredPromotionBusinessKey: sourceRecord.promotedBusinessKey || '',
    ledgeredNodeType: sourceRecord.promotedNodeType || '',
    ledgeredNodeKey: sourceRecord.promotedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.promotedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.promotionStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Promotion Ledger',
    'LEDGERED',
    'Architecture review promotion written into permanent promotion ledger history.',
    sourceRecord.businessKey || '',
    promotionResult,
    sourceRecord.promotedNodeType || '',
    sourceRecord.promotedNodeKey || '',
    sourceRecord.promotedNodeLabel || '',
    sourceRecord.promotedRelationshipType || '',
    sourceRecord.promotedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(promotionLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewPromotionLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENTS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENTS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessorLegacy1950_();
      return sciipWrapLegacyRuntimeResult1950_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1950_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessorLegacy1950_() {
  const processor =
    '1950_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_PROMOTION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'promotionLedgerScope',
      'promotionLedgerName',
      'promotionLedgerStatus',
      'promotionLedgerSummary',
      'ledgeredPromotionBusinessKey',
      'promotionResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'promotionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const deploymentSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentScope',
      'deploymentName',
      'deploymentStatus',
      'deploymentSummary',
      'deploymentResult',
      'deployedBusinessKey',
      'deployedNodeType',
      'deployedNodeKey',
      'deployedNodeLabel',
      'deployedRelationshipType',
      'deployedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(deploymentSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const promotionResult = sourceRecord.promotionResult || 'PROMOTED';

  const deploymentResult =
    String(promotionResult).toUpperCase() === 'PROMOTED'
      ? 'DEPLOYED'
      : 'NOT_DEPLOYED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.promotionLedgerStatus || sourceRecord.sourceStatus || '',
    promotionResult,
    ledgeredPromotionBusinessKey: sourceRecord.ledgeredPromotionBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const deploymentPayload = {
    deploymentType: 'ARCHITECTURE_REVIEW_DEPLOYMENT',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourcePromotionLedgerBusinessKey: sourceRecord.businessKey || '',
    promotionResult,
    deploymentResult,
    deployedBusinessKey: sourceRecord.ledgeredPromotionBusinessKey || '',
    deployedNodeType: sourceRecord.ledgeredNodeType || '',
    deployedNodeKey: sourceRecord.ledgeredNodeKey || '',
    deployedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    deployedAt: now.toISOString()
  };

  deploymentSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.promotionLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_DEPLOYMENT',
    'SCIIP_OS v5.0 Architecture Review Deployment',
    deploymentResult,
    'Architecture review promotion ledger deployed for downstream SCIIP_OS platform evolution.',
    deploymentResult,
    sourceRecord.ledgeredPromotionBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(deploymentPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessorLegacy1960_();
      return sciipWrapLegacyRuntimeResult1960_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1960_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessorLegacy1960_() {
  const processor =
    '1960_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentScope',
      'deploymentName',
      'deploymentStatus',
      'deploymentSummary',
      'deploymentResult',
      'deployedBusinessKey',
      'deployedNodeType',
      'deployedNodeKey',
      'deployedNodeLabel',
      'deployedRelationshipType',
      'deployedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentLedgerScope',
      'deploymentLedgerName',
      'deploymentLedgerStatus',
      'deploymentLedgerSummary',
      'ledgeredDeploymentBusinessKey',
      'deploymentResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const deploymentResult = sourceRecord.deploymentResult || 'DEPLOYED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.deploymentStatus || sourceRecord.sourceStatus || '',
    deploymentResult,
    deployedBusinessKey: sourceRecord.deployedBusinessKey || '',
    deployedNodeType: sourceRecord.deployedNodeType || '',
    deployedNodeKey: sourceRecord.deployedNodeKey || '',
    deployedNodeLabel: sourceRecord.deployedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const deploymentLedgerPayload = {
    deploymentLedgerType: 'ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceDeploymentBusinessKey: sourceRecord.businessKey || '',
    deploymentResult,
    ledgeredDeploymentBusinessKey: sourceRecord.deployedBusinessKey || '',
    ledgeredNodeType: sourceRecord.deployedNodeType || '',
    ledgeredNodeKey: sourceRecord.deployedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.deployedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.deploymentStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Deployment Ledger',
    'LEDGERED',
    'Architecture review deployment written into permanent deployment ledger history.',
    sourceRecord.businessKey || '',
    deploymentResult,
    sourceRecord.deployedNodeType || '',
    sourceRecord.deployedNodeKey || '',
    sourceRecord.deployedNodeLabel || '',
    sourceRecord.deployedRelationshipType || '',
    sourceRecord.deployedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(deploymentLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDeploymentLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessorLegacy1970_();
      return sciipWrapLegacyRuntimeResult1970_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1970_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessorLegacy1970_() {
  const processor =
    '1970_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DEPLOYMENT_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'deploymentLedgerScope',
      'deploymentLedgerName',
      'deploymentLedgerStatus',
      'deploymentLedgerSummary',
      'ledgeredDeploymentBusinessKey',
      'deploymentResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'deploymentLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const operationalizationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'operationalizationScope',
      'operationalizationName',
      'operationalizationStatus',
      'operationalizationSummary',
      'operationalizationResult',
      'operationalizedBusinessKey',
      'operationalizedNodeType',
      'operationalizedNodeKey',
      'operationalizedNodeLabel',
      'operationalizedRelationshipType',
      'operationalizedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'operationalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(operationalizationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const deploymentResult = sourceRecord.deploymentResult || 'DEPLOYED';

  const operationalizationResult =
    String(deploymentResult).toUpperCase() === 'DEPLOYED'
      ? 'OPERATIONALIZED'
      : 'NOT_OPERATIONALIZED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.deploymentLedgerStatus || sourceRecord.sourceStatus || '',
    deploymentResult,
    ledgeredDeploymentBusinessKey: sourceRecord.ledgeredDeploymentBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const operationalizationPayload = {
    operationalizationType: 'ARCHITECTURE_REVIEW_OPERATIONALIZATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceDeploymentLedgerBusinessKey: sourceRecord.businessKey || '',
    deploymentResult,
    operationalizationResult,
    operationalizedBusinessKey: sourceRecord.ledgeredDeploymentBusinessKey || '',
    operationalizedNodeType: sourceRecord.ledgeredNodeType || '',
    operationalizedNodeKey: sourceRecord.ledgeredNodeKey || '',
    operationalizedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    operationalizedAt: now.toISOString()
  };

  operationalizationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.deploymentLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_OPERATIONALIZATION',
    'SCIIP_OS v5.0 Architecture Review Operationalization',
    operationalizationResult,
    'Architecture review deployment ledger operationalized for active SCIIP_OS platform evolution.',
    operationalizationResult,
    sourceRecord.ledgeredDeploymentBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(operationalizationPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalizationProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessorLegacy1980_();
      return sciipWrapLegacyRuntimeResult1980_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1980_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessorLegacy1980_() {
  const processor =
    '1980_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONALIZATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'operationalizationScope',
      'operationalizationName',
      'operationalizationStatus',
      'operationalizationSummary',
      'operationalizationResult',
      'operationalizedBusinessKey',
      'operationalizedNodeType',
      'operationalizedNodeKey',
      'operationalizedNodeLabel',
      'operationalizedRelationshipType',
      'operationalizedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'operationalizationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'operationalLedgerScope',
      'operationalLedgerName',
      'operationalLedgerStatus',
      'operationalLedgerSummary',
      'ledgeredOperationalizationBusinessKey',
      'operationalizationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'operationalLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const operationalizationResult =
    sourceRecord.operationalizationResult || 'OPERATIONALIZED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.operationalizationStatus || sourceRecord.sourceStatus || '',
    operationalizationResult,
    operationalizedBusinessKey: sourceRecord.operationalizedBusinessKey || '',
    operationalizedNodeType: sourceRecord.operationalizedNodeType || '',
    operationalizedNodeKey: sourceRecord.operationalizedNodeKey || '',
    operationalizedNodeLabel: sourceRecord.operationalizedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const operationalLedgerPayload = {
    operationalLedgerType: 'ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceOperationalizationBusinessKey: sourceRecord.businessKey || '',
    operationalizationResult,
    ledgeredOperationalizationBusinessKey:
      sourceRecord.operationalizedBusinessKey || '',
    ledgeredNodeType: sourceRecord.operationalizedNodeType || '',
    ledgeredNodeKey: sourceRecord.operationalizedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.operationalizedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.operationalizationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Operational Ledger',
    'LEDGERED',
    'Architecture review operationalization written into permanent operational ledger history.',
    sourceRecord.businessKey || '',
    operationalizationResult,
    sourceRecord.operationalizedNodeType || '',
    sourceRecord.operationalizedNodeKey || '',
    sourceRecord.operationalizedNodeLabel || '',
    sourceRecord.operationalizedRelationshipType || '',
    sourceRecord.operationalizedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(operationalLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewOperationalLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESSS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESSS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessorLegacy1990_();
      return sciipWrapLegacyRuntimeResult1990_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1990_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessorLegacy1990_() {
  const processor =
    '1990_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_OPERATIONAL_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'operationalLedgerScope',
      'operationalLedgerName',
      'operationalLedgerStatus',
      'operationalLedgerSummary',
      'ledgeredOperationalizationBusinessKey',
      'operationalizationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'operationalLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const readinessSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'readinessScope',
      'readinessName',
      'readinessStatus',
      'readinessSummary',
      'readinessResult',
      'readyBusinessKey',
      'readyNodeType',
      'readyNodeKey',
      'readyNodeLabel',
      'readyRelationshipType',
      'readyRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'readinessPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(readinessSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const operationalizationResult =
    sourceRecord.operationalizationResult || 'OPERATIONALIZED';

  const readinessResult =
    String(operationalizationResult).toUpperCase() === 'OPERATIONALIZED'
      ? 'READY'
      : 'NOT_READY';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.operationalLedgerStatus || sourceRecord.sourceStatus || '',
    operationalizationResult,
    ledgeredOperationalizationBusinessKey:
      sourceRecord.ledgeredOperationalizationBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const readinessPayload = {
    readinessType: 'ARCHITECTURE_REVIEW_READINESS',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceOperationalLedgerBusinessKey: sourceRecord.businessKey || '',
    operationalizationResult,
    readinessResult,
    readyBusinessKey: sourceRecord.ledgeredOperationalizationBusinessKey || '',
    readyNodeType: sourceRecord.ledgeredNodeType || '',
    readyNodeKey: sourceRecord.ledgeredNodeKey || '',
    readyNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    readyAt: now.toISOString()
  };

  readinessSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.operationalLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_READINESS',
    'SCIIP_OS v5.0 Architecture Review Readiness',
    readinessResult,
    'Architecture review operational ledger evaluated for downstream readiness.',
    readinessResult,
    sourceRecord.ledgeredOperationalizationBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(readinessPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessorLegacy2000_();
      return sciipWrapLegacyRuntimeResult2000_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2000_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessorLegacy2000_() {
  const processor =
    '2000_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'readinessScope',
      'readinessName',
      'readinessStatus',
      'readinessSummary',
      'readinessResult',
      'readyBusinessKey',
      'readyNodeType',
      'readyNodeKey',
      'readyNodeLabel',
      'readyRelationshipType',
      'readyRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'readinessPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'readinessLedgerScope',
      'readinessLedgerName',
      'readinessLedgerStatus',
      'readinessLedgerSummary',
      'ledgeredReadinessBusinessKey',
      'readinessResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'readinessLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const readinessResult = sourceRecord.readinessResult || 'READY';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.readinessStatus || sourceRecord.sourceStatus || '',
    readinessResult,
    readyBusinessKey: sourceRecord.readyBusinessKey || '',
    readyNodeType: sourceRecord.readyNodeType || '',
    readyNodeKey: sourceRecord.readyNodeKey || '',
    readyNodeLabel: sourceRecord.readyNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const readinessLedgerPayload = {
    readinessLedgerType: 'ARCHITECTURE_REVIEW_READINESS_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReadinessBusinessKey: sourceRecord.businessKey || '',
    readinessResult,
    ledgeredReadinessBusinessKey: sourceRecord.readyBusinessKey || '',
    ledgeredNodeType: sourceRecord.readyNodeType || '',
    ledgeredNodeKey: sourceRecord.readyNodeKey || '',
    ledgeredNodeLabel: sourceRecord.readyNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.readinessStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_READINESS_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Readiness Ledger',
    'LEDGERED',
    'Architecture review readiness written into permanent readiness ledger history.',
    sourceRecord.businessKey || '',
    readinessResult,
    sourceRecord.readyNodeType || '',
    sourceRecord.readyNodeKey || '',
    sourceRecord.readyNodeLabel || '',
    sourceRecord.readyRelationshipType || '',
    sourceRecord.readyRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(readinessLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewReadinessLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessorLegacy2010_();
      return sciipWrapLegacyRuntimeResult2010_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2010_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessorLegacy2010_() {
  const processor =
    '2010_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_READINESS_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'readinessLedgerScope',
      'readinessLedgerName',
      'readinessLedgerStatus',
      'readinessLedgerSummary',
      'ledgeredReadinessBusinessKey',
      'readinessResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'readinessLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const activationSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationScope',
      'activationName',
      'activationStatus',
      'activationSummary',
      'activationResult',
      'activatedBusinessKey',
      'activatedNodeType',
      'activatedNodeKey',
      'activatedNodeLabel',
      'activatedRelationshipType',
      'activatedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(activationSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const readinessResult = sourceRecord.readinessResult || 'READY';

  const activationResult =
    String(readinessResult).toUpperCase() === 'READY'
      ? 'ACTIVATED'
      : 'NOT_ACTIVATED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.readinessLedgerStatus || sourceRecord.sourceStatus || '',
    readinessResult,
    ledgeredReadinessBusinessKey: sourceRecord.ledgeredReadinessBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const activationPayload = {
    activationType: 'ARCHITECTURE_REVIEW_ACTIVATION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceReadinessLedgerBusinessKey: sourceRecord.businessKey || '',
    readinessResult,
    activationResult,
    activatedBusinessKey: sourceRecord.ledgeredReadinessBusinessKey || '',
    activatedNodeType: sourceRecord.ledgeredNodeType || '',
    activatedNodeKey: sourceRecord.ledgeredNodeKey || '',
    activatedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    activatedAt: now.toISOString()
  };

  activationSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.readinessLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_ACTIVATION',
    'SCIIP_OS v5.0 Architecture Review Activation',
    activationResult,
    'Architecture review readiness ledger activated for autonomous SCIIP_OS platform evolution.',
    activationResult,
    sourceRecord.ledgeredReadinessBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(activationPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessorLegacy2020_();
      return sciipWrapLegacyRuntimeResult2020_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2020_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessorLegacy2020_() {
  const processor =
    '2020_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationScope',
      'activationName',
      'activationStatus',
      'activationSummary',
      'activationResult',
      'activatedBusinessKey',
      'activatedNodeType',
      'activatedNodeKey',
      'activatedNodeLabel',
      'activatedRelationshipType',
      'activatedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationLedgerScope',
      'activationLedgerName',
      'activationLedgerStatus',
      'activationLedgerSummary',
      'ledgeredActivationBusinessKey',
      'activationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const activationResult = sourceRecord.activationResult || 'ACTIVATED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.activationStatus || sourceRecord.sourceStatus || '',
    activationResult,
    activatedBusinessKey: sourceRecord.activatedBusinessKey || '',
    activatedNodeType: sourceRecord.activatedNodeType || '',
    activatedNodeKey: sourceRecord.activatedNodeKey || '',
    activatedNodeLabel: sourceRecord.activatedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const activationLedgerPayload = {
    activationLedgerType: 'ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceActivationBusinessKey: sourceRecord.businessKey || '',
    activationResult,
    ledgeredActivationBusinessKey: sourceRecord.activatedBusinessKey || '',
    ledgeredNodeType: sourceRecord.activatedNodeType || '',
    ledgeredNodeKey: sourceRecord.activatedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.activatedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.activationStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Activation Ledger',
    'LEDGERED',
    'Architecture review activation written into permanent activation ledger history.',
    sourceRecord.businessKey || '',
    activationResult,
    sourceRecord.activatedNodeType || '',
    sourceRecord.activatedNodeKey || '',
    sourceRecord.activatedNodeLabel || '',
    sourceRecord.activatedRelationshipType || '',
    sourceRecord.activatedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(activationLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewActivationLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessorLegacy2030_();
      return sciipWrapLegacyRuntimeResult2030_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2030_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessorLegacy2030_() {
  const processor =
    '2030_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_ACTIVATION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'activationLedgerScope',
      'activationLedgerName',
      'activationLedgerStatus',
      'activationLedgerSummary',
      'ledgeredActivationBusinessKey',
      'activationResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'activationLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const completionSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionScope',
      'completionName',
      'completionStatus',
      'completionSummary',
      'completionResult',
      'completedBusinessKey',
      'completedNodeType',
      'completedNodeKey',
      'completedNodeLabel',
      'completedRelationshipType',
      'completedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'completionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(completionSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const activationResult = sourceRecord.activationResult || 'ACTIVATED';

  const completionResult =
    String(activationResult).toUpperCase() === 'ACTIVATED'
      ? 'COMPLETED'
      : 'NOT_COMPLETED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.activationLedgerStatus || sourceRecord.sourceStatus || '',
    activationResult,
    ledgeredActivationBusinessKey: sourceRecord.ledgeredActivationBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const completionPayload = {
    completionType: 'ARCHITECTURE_REVIEW_COMPLETION',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceActivationLedgerBusinessKey: sourceRecord.businessKey || '',
    activationResult,
    completionResult,
    completedBusinessKey: sourceRecord.ledgeredActivationBusinessKey || '',
    completedNodeType: sourceRecord.ledgeredNodeType || '',
    completedNodeKey: sourceRecord.ledgeredNodeKey || '',
    completedNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    completedAt: now.toISOString()
  };

  completionSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.activationLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_COMPLETION',
    'SCIIP_OS v5.0 Architecture Review Completion',
    completionResult,
    'Architecture review activation ledger completed for SCIIP_OS v5.0 continuity track.',
    completionResult,
    sourceRecord.ledgeredActivationBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(completionPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessorLegacy2040_();
      return sciipWrapLegacyRuntimeResult2040_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2040_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessorLegacy2040_() {
  const processor =
    '2040_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionScope',
      'completionName',
      'completionStatus',
      'completionSummary',
      'completionResult',
      'completedBusinessKey',
      'completedNodeType',
      'completedNodeKey',
      'completedNodeLabel',
      'completedRelationshipType',
      'completedRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'completionPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionLedgerScope',
      'completionLedgerName',
      'completionLedgerStatus',
      'completionLedgerSummary',
      'ledgeredCompletionBusinessKey',
      'completionResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'completionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const completionResult = sourceRecord.completionResult || 'COMPLETED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.completionStatus || sourceRecord.sourceStatus || '',
    completionResult,
    completedBusinessKey: sourceRecord.completedBusinessKey || '',
    completedNodeType: sourceRecord.completedNodeType || '',
    completedNodeKey: sourceRecord.completedNodeKey || '',
    completedNodeLabel: sourceRecord.completedNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const completionLedgerPayload = {
    completionLedgerType: 'ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCompletionBusinessKey: sourceRecord.businessKey || '',
    completionResult,
    ledgeredCompletionBusinessKey: sourceRecord.completedBusinessKey || '',
    ledgeredNodeType: sourceRecord.completedNodeType || '',
    ledgeredNodeKey: sourceRecord.completedNodeKey || '',
    ledgeredNodeLabel: sourceRecord.completedNodeLabel || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.completionStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Completion Ledger',
    'LEDGERED',
    'Architecture review completion written into permanent completion ledger history.',
    sourceRecord.businessKey || '',
    completionResult,
    sourceRecord.completedNodeType || '',
    sourceRecord.completedNodeKey || '',
    sourceRecord.completedNodeLabel || '',
    sourceRecord.completedRelationshipType || '',
    sourceRecord.completedRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(completionLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewCompletionLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFFS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFFS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessorLegacy2050_();
      return sciipWrapLegacyRuntimeResult2050_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2050_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessorLegacy2050_() {
  const processor =
    '2050_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMPLETION_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'completionLedgerScope',
      'completionLedgerName',
      'completionLedgerStatus',
      'completionLedgerSummary',
      'ledgeredCompletionBusinessKey',
      'completionResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'completionLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const handoffSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffScope',
      'handoffName',
      'handoffStatus',
      'handoffSummary',
      'handoffResult',
      'handoffBusinessKey',
      'handoffNodeType',
      'handoffNodeKey',
      'handoffNodeLabel',
      'handoffRelationshipType',
      'handoffRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(handoffSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const completionResult = sourceRecord.completionResult || 'COMPLETED';

  const handoffResult =
    String(completionResult).toUpperCase() === 'COMPLETED'
      ? 'HANDOFF_READY'
      : 'HANDOFF_BLOCKED';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.completionLedgerStatus || sourceRecord.sourceStatus || '',
    completionResult,
    ledgeredCompletionBusinessKey:
      sourceRecord.ledgeredCompletionBusinessKey || '',
    ledgeredNodeType: sourceRecord.ledgeredNodeType || '',
    ledgeredNodeKey: sourceRecord.ledgeredNodeKey || '',
    ledgeredNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const handoffPayload = {
    handoffType: 'ARCHITECTURE_REVIEW_HANDOFF',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCompletionLedgerBusinessKey: sourceRecord.businessKey || '',
    completionResult,
    handoffResult,
    handoffBusinessKey: sourceRecord.ledgeredCompletionBusinessKey || '',
    handoffNodeType: sourceRecord.ledgeredNodeType || '',
    handoffNodeKey: sourceRecord.ledgeredNodeKey || '',
    handoffNodeLabel: sourceRecord.ledgeredNodeLabel || '',
    nextTrackRecommendation:
      'Begin framework abstraction review for repeated Architecture Review Track processor patterns.',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    handedOffAt: now.toISOString()
  };

  handoffSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.completionLedgerStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_HANDOFF',
    'SCIIP_OS v5.0 Architecture Review Handoff',
    handoffResult,
    'Architecture review completion ledger prepared for downstream handoff.',
    handoffResult,
    sourceRecord.ledgeredCompletionBusinessKey || '',
    sourceRecord.ledgeredNodeType || '',
    sourceRecord.ledgeredNodeKey || '',
    sourceRecord.ledgeredNodeLabel || '',
    sourceRecord.ledgeredRelationshipType || '',
    sourceRecord.ledgeredRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(handoffPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessorLegacy2060_();
      return sciipWrapLegacyRuntimeResult2060_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2060_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessorLegacy2060_() {
  const processor =
    '2060_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffScope',
      'handoffName',
      'handoffStatus',
      'handoffSummary',
      'handoffResult',
      'handoffBusinessKey',
      'handoffNodeType',
      'handoffNodeKey',
      'handoffNodeLabel',
      'handoffRelationshipType',
      'handoffRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffLedgerScope',
      'handoffLedgerName',
      'handoffLedgerStatus',
      'handoffLedgerSummary',
      'ledgeredHandoffBusinessKey',
      'handoffResult',
      'ledgeredNodeType',
      'ledgeredNodeKey',
      'ledgeredNodeLabel',
      'ledgeredRelationshipType',
      'ledgeredRelationshipTargetKey',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'handoffLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();
  const handoffResult = sourceRecord.handoffResult || 'HANDOFF_READY';

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus: sourceRecord.handoffStatus || sourceRecord.sourceStatus || '',
    handoffResult,
    handoffBusinessKey: sourceRecord.handoffBusinessKey || '',
    handoffNodeType: sourceRecord.handoffNodeType || '',
    handoffNodeKey: sourceRecord.handoffNodeKey || '',
    handoffNodeLabel: sourceRecord.handoffNodeLabel || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const handoffLedgerPayload = {
    handoffLedgerType: 'ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceHandoffBusinessKey: sourceRecord.businessKey || '',
    handoffResult,
    ledgeredHandoffBusinessKey: sourceRecord.handoffBusinessKey || '',
    ledgeredNodeType: sourceRecord.handoffNodeType || '',
    ledgeredNodeKey: sourceRecord.handoffNodeKey || '',
    ledgeredNodeLabel: sourceRecord.handoffNodeLabel || '',
    nextTrackRecommendation:
      'Proceed to reusable Architecture Review processor framework analysis after final handoff ledger.',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM_MEMORY',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.handoffStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Handoff Ledger',
    'LEDGERED',
    'Architecture review handoff written into permanent handoff ledger history.',
    sourceRecord.businessKey || '',
    handoffResult,
    sourceRecord.handoffNodeType || '',
    sourceRecord.handoffNodeKey || '',
    sourceRecord.handoffNodeLabel || '',
    sourceRecord.handoffRelationshipType || '',
    sourceRecord.handoffRelationshipTargetKey || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple || '',
    sourceRecord.architectureFinding || '',
    sourceRecord.architectureRecommendation || '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(handoffLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewHandoffLedgerProcessor',
      result
    })
  );

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2070_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2070_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEWS',
    ledgerSheet: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEWS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2070_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessorLegacy2070_();
      return sciipWrapLegacyRuntimeResult2070_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2070_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessorLegacy2070_() {
  const processor =
    '2070_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor';

  return sciipRunConfiguredContinuityProcessor_({
    processor: processor,

    sourceSheetName:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_HANDOFF_LEDGER',

    outputSheetName:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW',

    businessKeyPrefix:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW',

    createdCountField:
      'autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewsCreated',

    sourceHeaders: [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'handoffLedgerStatus',
      'handoffResult',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'createdAt'
    ],

    outputHeaders: [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'frameworkPatternReviewScope',
      'frameworkPatternReviewName',
      'frameworkPatternReviewStatus',
      'frameworkPatternReviewSummary',
      'frameworkPatternReviewResult',
      'reviewedBusinessKey',
      'reviewedPatternCategory',
      'reviewedPatternName',
      'repeatablePatternFinding',
      'frameworkRecommendation',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'frameworkPatternReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ],

    buildRow: function(ctx) {
      const sourceRecord = ctx.sourceRecord;

      const finding =
        'Architecture Review Track processors share repeated sheet initialization, source lookup, business-key duplicate detection, compact payload construction, append-row emission, and standardized result logging.';

      const recommendation =
        'Create a reusable SCIIP processor execution framework for linear processor chains with configurable source/output sheets, field mappings, payload builders, status fields, count fields, and ledger/event modes.';

      const payload = {
        reviewType: 'ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW',
        reviewedProcessorRange: '1700-2060',
        reviewedPatternCategory: 'REPEATED_PROCESSOR_BOILERPLATE',
        reviewedPatternName: 'Architecture Review Track processor chain pattern',
        repeatablePatternFinding: finding,
        frameworkRecommendation: recommendation,
        targetVersion: 'SCIIP_OS v5.1',
        reviewedAt: ctx.now.toISOString()
      };

      const compactSourcePayload = {
        sourceBusinessKey: sourceRecord.businessKey || '',
        sourceProcessor: sourceRecord.processor || '',
        sourceStatus: sourceRecord.handoffLedgerStatus || sourceRecord.sourceStatus || '',
        handoffResult: sourceRecord.handoffResult || '',
        reviewTrack: sourceRecord.reviewTrack || '',
        createdAt: sourceRecord.createdAt || ''
      };

      return [
        ctx.businessKey,
        ctx.dateKey,
        ctx.processor,
        sourceRecord.businessKey || '',
        sourceRecord.processor || '',
        sourceRecord.handoffLedgerStatus || sourceRecord.sourceStatus || '',
        'SCIIP_OS_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW',
        'SCIIP_OS v5.0 Architecture Review Framework Pattern Review',
        'REVIEWED',
        'Repeated Architecture Review Track processor patterns reviewed for framework abstraction.',
        'FRAMEWORK_PATTERN_IDENTIFIED',
        sourceRecord.businessKey || '',
        'REPEATED_PROCESSOR_BOILERPLATE',
        'Architecture Review Track processor chain pattern',
        finding,
        recommendation,
        'SCIIP_OS_ARCHITECTURE',
        'PROCESSOR_DRIVEN_EVENT_SOURCED_IDEMPOTENT_FRAMEWORK_ABSTRACTION',
        finding,
        recommendation,
        sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
        sourceRecord.currentVersion || 'SCIIP_OS v5.0',
        'SCIIP_OS v5.1',
        JSON.stringify(payload),
        JSON.stringify(compactSourcePayload),
        ctx.now.toISOString()
      ];
    }
  });
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGERS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGERS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessorLegacy2080_();
      return sciipWrapLegacyRuntimeResult2080_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2080_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessorLegacy2080_() {
  const processor =
    '2080_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'frameworkPatternReviewScope',
      'frameworkPatternReviewName',
      'frameworkPatternReviewStatus',
      'frameworkPatternReviewSummary',
      'frameworkPatternReviewResult',
      'reviewedBusinessKey',
      'reviewedPatternCategory',
      'reviewedPatternName',
      'repeatablePatternFinding',
      'frameworkRecommendation',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'frameworkPatternReviewPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const ledgerSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'frameworkPatternReviewLedgerScope',
      'frameworkPatternReviewLedgerName',
      'frameworkPatternReviewLedgerStatus',
      'frameworkPatternReviewLedgerSummary',
      'ledgeredPatternReviewBusinessKey',
      'frameworkPatternReviewResult',
      'ledgeredPatternCategory',
      'ledgeredPatternName',
      'ledgeredPatternFinding',
      'ledgeredFrameworkRecommendation',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'frameworkPatternReviewLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(ledgerSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgersCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const sourceRecord = sciipLatestRecordFromSheet_(sourceSheet);

  if (!sourceRecord) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgersCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const compactSourcePayload = {
    sourceBusinessKey: sourceRecord.businessKey || '',
    sourceProcessor: sourceRecord.processor || '',
    sourceStatus:
      sourceRecord.frameworkPatternReviewStatus ||
      sourceRecord.sourceStatus ||
      '',
    frameworkPatternReviewResult:
      sourceRecord.frameworkPatternReviewResult || '',
    reviewedPatternCategory: sourceRecord.reviewedPatternCategory || '',
    reviewedPatternName: sourceRecord.reviewedPatternName || '',
    reviewTrack: sourceRecord.reviewTrack || '',
    currentVersion: sourceRecord.currentVersion || '',
    targetVersion: sourceRecord.targetVersion || '',
    createdAt: sourceRecord.createdAt || ''
  };

  const frameworkPatternReviewLedgerPayload = {
    ledgerType: 'ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceFrameworkPatternReviewBusinessKey: sourceRecord.businessKey || '',
    frameworkPatternReviewResult:
      sourceRecord.frameworkPatternReviewResult ||
      'FRAMEWORK_PATTERN_IDENTIFIED',
    ledgeredPatternReviewBusinessKey: sourceRecord.businessKey || '',
    ledgeredPatternCategory:
      sourceRecord.reviewedPatternCategory ||
      'REPEATED_PROCESSOR_BOILERPLATE',
    ledgeredPatternName:
      sourceRecord.reviewedPatternName ||
      'Architecture Review Track processor chain pattern',
    ledgeredPatternFinding:
      sourceRecord.repeatablePatternFinding || '',
    ledgeredFrameworkRecommendation:
      sourceRecord.frameworkRecommendation || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    architecturePrinciple:
      sourceRecord.architecturePrinciple ||
      'PROCESSOR_DRIVEN_EVENT_SOURCED_IDEMPOTENT_FRAMEWORK_ABSTRACTION',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v5.0',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.1',
    ledgeredAt: now.toISOString()
  };

  ledgerSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.frameworkPatternReviewStatus || sourceRecord.sourceStatus || '',
    'SCIIP_OS_ARCHITECTURE_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',
    'SCIIP_OS v5.0 Architecture Review Framework Pattern Review Ledger',
    'LEDGERED',
    'Framework pattern review written into permanent framework pattern review ledger history.',
    sourceRecord.businessKey || '',
    sourceRecord.frameworkPatternReviewResult ||
      'FRAMEWORK_PATTERN_IDENTIFIED',
    sourceRecord.reviewedPatternCategory ||
      'REPEATED_PROCESSOR_BOILERPLATE',
    sourceRecord.reviewedPatternName ||
      'Architecture Review Track processor chain pattern',
    sourceRecord.repeatablePatternFinding || '',
    sourceRecord.frameworkRecommendation || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architecturePrinciple ||
      'PROCESSOR_DRIVEN_EVENT_SOURCED_IDEMPOTENT_FRAMEWORK_ABSTRACTION',
    sourceRecord.architectureFinding || sourceRecord.repeatablePatternFinding || '',
    sourceRecord.architectureRecommendation ||
      sourceRecord.frameworkRecommendation ||
      '',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v5.0',
    sourceRecord.targetVersion || 'SCIIP_OS v5.1',
    JSON.stringify(frameworkPatternReviewLedgerPayload),
    JSON.stringify(compactSourcePayload),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgersCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkPatternReviewLedgerProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATIONS',
    ledgerSheet: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessorLegacy2090_();
      return sciipWrapLegacyRuntimeResult2090_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult2090_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/************************************************************
 * SCIIP_OS v5.1 Architecture Review Track
 * 2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessorLegacy2090_() {
  const processor =
    '2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor';

  return sciipRunConfiguredContinuityProcessor_({
    processor: processor,

    sourceSheetName:
      'ARCH_REVIEW_FRAMEWORK_PATTERN_REVIEW_LEDGER',

    outputSheetName:
      'ARCH_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',

    businessKeyPrefix:
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',

    createdCountField:
      'autonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationsCreated',

    sourceHeaders: [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'frameworkPatternReviewLedgerScope',
      'frameworkPatternReviewLedgerName',
      'frameworkPatternReviewLedgerStatus',
      'frameworkPatternReviewLedgerSummary',
      'ledgeredPatternReviewBusinessKey',
      'frameworkPatternReviewResult',
      'ledgeredPatternCategory',
      'ledgeredPatternName',
      'ledgeredPatternFinding',
      'ledgeredFrameworkRecommendation',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'frameworkPatternReviewLedgerPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ],

    outputHeaders: [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'refactorRecommendationScope',
      'refactorRecommendationName',
      'refactorRecommendationStatus',
      'refactorRecommendationSummary',
      'refactorRecommendationResult',
      'recommendedFrameworkName',
      'recommendedFrameworkVersion',
      'recommendedRefactorType',
      'recommendedMigrationScope',
      'recommendedMigrationStrategy',
      'expectedBenefit',
      'riskAssessment',
      'architectureReviewScope',
      'architecturePrinciple',
      'architectureFinding',
      'architectureRecommendation',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'refactorRecommendationPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ],

    buildRow: function(ctx) {
      const sourceRecord = ctx.sourceRecord;

      const finding =
        sourceRecord.ledgeredPatternFinding ||
        sourceRecord.architectureFinding ||
        'Repeated Architecture Review Track processor boilerplate has been identified and ledgered.';

      const recommendation =
        'Adopt the shared SCIIP configured continuity processor framework for future linear processor chains, beginning with 2090+ and then progressively migrating 1700-2080 without changing external sheet contracts or business-key behavior.';

      const payload = {
        recommendationType: 'ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',
        recommendedFrameworkName: 'SCIIP Configured Continuity Processor Framework',
        recommendedFrameworkVersion: 'SCIIP_OS v5.1',
        recommendedRefactorType: 'NON_BREAKING_PROGRESSIVE_ABSTRACTION',
        recommendedMigrationScope: '1700-2080 Architecture Review Track processors',
        recommendedMigrationStrategy:
          'Use new framework for new processors first, then migrate prior processors one-by-one with identical inputs, outputs, business keys, result fields, and duplicate behavior.',
        expectedBenefit:
          'Reduced boilerplate, fewer naming errors, faster processor creation, centralized sheet alias handling, and consistent compact payload behavior.',
        riskAssessment:
          'Low if migration preserves external contracts and each migrated processor is validated with existing standalone tests.',
        sourceFrameworkPatternReviewLedgerBusinessKey: sourceRecord.businessKey || '',
        targetVersion: 'SCIIP_OS v5.1',
        recommendedAt: ctx.now.toISOString()
      };

      const compactSourcePayload = {
        sourceBusinessKey: sourceRecord.businessKey || '',
        sourceProcessor: sourceRecord.processor || '',
        sourceStatus:
          sourceRecord.frameworkPatternReviewLedgerStatus ||
          sourceRecord.sourceStatus ||
          '',
        frameworkPatternReviewResult:
          sourceRecord.frameworkPatternReviewResult || '',
        ledgeredPatternCategory: sourceRecord.ledgeredPatternCategory || '',
        ledgeredPatternName: sourceRecord.ledgeredPatternName || '',
        createdAt: sourceRecord.createdAt || ''
      };

      return [
        ctx.businessKey,
        ctx.dateKey,
        ctx.processor,
        sourceRecord.businessKey || '',
        sourceRecord.processor || '',
        sourceRecord.frameworkPatternReviewLedgerStatus ||
          sourceRecord.sourceStatus ||
          '',
        'SCIIP_OS_ARCHITECTURE_REVIEW_FRAMEWORK_REFACTOR_RECOMMENDATION',
        'SCIIP_OS v5.1 Framework Refactor Recommendation',
        'RECOMMENDED',
        'Framework refactor recommendation produced from ledgered Architecture Review Track pattern review.',
        'FRAMEWORK_REFACTOR_RECOMMENDED',
        'SCIIP Configured Continuity Processor Framework',
        'SCIIP_OS v5.1',
        'NON_BREAKING_PROGRESSIVE_ABSTRACTION',
        '1700-2080 Architecture Review Track processors',
        payload.recommendedMigrationStrategy,
        payload.expectedBenefit,
        payload.riskAssessment,
        sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
        'PROCESSOR_DRIVEN_EVENT_SOURCED_IDEMPOTENT_FRAMEWORK_ABSTRACTION',
        finding,
        recommendation,
        sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
        sourceRecord.currentVersion || 'SCIIP_OS v5.0',
        'SCIIP_OS v5.1',
        JSON.stringify(payload),
        JSON.stringify(compactSourcePayload),
        ctx.now.toISOString()
      ];
    }
  });
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Framework Validation Processor
 * File: 2460_RuntimeFrameworkValidationProcessor.gs
 *
 * Processor: 2460_RuntimeFrameworkValidation
 *
 * Purpose:
 * Validates the integrated SCIIP_OS v5.2 shared runtime framework:
 * RuntimeCommon, ResultFactory, PayloadFactory, SheetFactory,
 * Context, TransactionManager, RuntimeLogging, and ProcessorBase.
 */

function sciipRun2460_RuntimeFrameworkValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2460_RuntimeFrameworkValidation',
    action: 'RUNTIME_FRAMEWORK_VALIDATION',
    targetSheet: 'SCIIP_RUNTIME_FRAMEWORK_VALIDATION',
    ledgerSheet: 'SCIIP_RUNTIME_FRAMEWORK_VALIDATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 8,
        outputCount: 1,
        summary: 'Runtime framework integrated validation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          modules: [
            'SCIIP_RUNTIME',
            'SCIIP_RUNTIME_RESULT_FACTORY',
            'SCIIP_RUNTIME_PAYLOAD_FACTORY',
            'SCIIP_RUNTIME_SHEET_FACTORY',
            'SCIIP_RUNTIME_CONTEXT',
            'SCIIP_RUNTIME_TRANSACTION_MANAGER',
            'SCIIP_RUNTIME_LOGGING',
            'SCIIP_RUNTIME_PROCESSOR_BASE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      var requiredChecks = [
        {
          name: 'SCIIP_RUNTIME.runProcessor',
          valid:
            typeof SCIIP_RUNTIME !== 'undefined' &&
            typeof SCIIP_RUNTIME.runProcessor === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_RESULT_FACTORY.success',
          valid:
            typeof SCIIP_RUNTIME_RESULT_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_RESULT_FACTORY.success === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_PAYLOAD_FACTORY.create',
          valid:
            typeof SCIIP_RUNTIME_PAYLOAD_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_PAYLOAD_FACTORY.create === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet',
          valid:
            typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined' &&
            typeof SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_CONTEXT.create',
          valid:
            typeof SCIIP_RUNTIME_CONTEXT !== 'undefined' &&
            typeof SCIIP_RUNTIME_CONTEXT.create === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_TRANSACTION_MANAGER.run',
          valid:
            typeof SCIIP_RUNTIME_TRANSACTION_MANAGER !== 'undefined' &&
            typeof SCIIP_RUNTIME_TRANSACTION_MANAGER.run === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_LOGGING.info',
          valid:
            typeof SCIIP_RUNTIME_LOGGING !== 'undefined' &&
            typeof SCIIP_RUNTIME_LOGGING.info === 'function'
        },
        {
          name: 'SCIIP_RUNTIME_PROCESSOR_BASE.run',
          valid:
            typeof SCIIP_RUNTIME_PROCESSOR_BASE !== 'undefined' &&
            typeof SCIIP_RUNTIME_PROCESSOR_BASE.run === 'function'
        }
      ];

      requiredChecks.forEach(function(check) {
        if (!check.valid) {
          errors.push('Missing or invalid runtime module: ' + check.name);
        }
      });

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var validationSheet = definition.targetSheet;
      var validationLedgerSheet = definition.ledgerSheet;

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Validation_Status',
        'Modules_Validated',
        'Framework_Version',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Framework_Version',
        'Result_JSON'
      ];

      var modulesValidated = [
        'RuntimeCommon',
        'RuntimeResultFactory',
        'RuntimePayloadFactory',
        'RuntimeSheetFactory',
        'RuntimeContext',
        'RuntimeTransactionManager',
        'RuntimeLogging',
        'RuntimeProcessorBase'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        validationSheet,
        headers,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Validation_Status: 'PASSED',
          Modules_Validated: modulesValidated.join(', '),
          Framework_Version: 'v5.2',
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: modulesValidated.length,
        message: JSON.stringify({
          runtimeFrameworkValidation: 'PASSED',
          modulesValidated: modulesValidated.length,
          transactionId: transaction.transactionId,
          nextRecommendedBuild: '2470_RuntimeFrameworkCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        validationLedgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'VALIDATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Framework_Version: 'v5.2',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          modulesValidated: modulesValidated,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.2 runtime framework validation passed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2460_RuntimeFrameworkValidationProcessor() {
  var result = sciipRun2460_RuntimeFrameworkValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2460_RuntimeFrameworkValidationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.2
 * Runtime Framework Certification Processor
 * File: 2470_RuntimeFrameworkCertificationProcessor.gs
 *
 * Processor: 2470_RuntimeFrameworkCertification
 *
 * Purpose:
 * Formally certifies the SCIIP_OS v5.2 shared runtime framework
 * as validated, production-ready, duplicate-safe, and ready for
 * transition into v5.3 Autonomous Runtime.
 */

function sciipRun2470_RuntimeFrameworkCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2470_RuntimeFrameworkCertification',
    action: 'RUNTIME_FRAMEWORK_CERTIFICATION',
    targetSheet: 'SCIIP_RUNTIME_FRAMEWORK_CERTIFICATION',
    ledgerSheet: 'SCIIP_RUNTIME_FRAMEWORK_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime framework certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          validationProcessor: '2460_RuntimeFrameworkValidation',
          certifiedModules: [
            'SCIIP_RuntimeCommon',
            'SCIIP_RuntimeResultFactory',
            'SCIIP_RuntimePayloadFactory',
            'SCIIP_RuntimeSheetFactory',
            'SCIIP_RuntimeContext',
            'SCIIP_RuntimeTransactionManager',
            'SCIIP_RuntimeLogging',
            'SCIIP_RuntimeProcessorBase'
          ],
          nextMajorPhase: 'v5.3 Autonomous Runtime'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing certification sheet.');
      if (!definition.ledgerSheet) errors.push('Missing certification ledger sheet.');

      var requiredModules = [
        {
          name: 'SCIIP_RUNTIME',
          valid: typeof SCIIP_RUNTIME !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_RESULT_FACTORY',
          valid: typeof SCIIP_RUNTIME_RESULT_FACTORY !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_PAYLOAD_FACTORY',
          valid: typeof SCIIP_RUNTIME_PAYLOAD_FACTORY !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_SHEET_FACTORY',
          valid: typeof SCIIP_RUNTIME_SHEET_FACTORY !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_CONTEXT',
          valid: typeof SCIIP_RUNTIME_CONTEXT !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_TRANSACTION_MANAGER',
          valid: typeof SCIIP_RUNTIME_TRANSACTION_MANAGER !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_LOGGING',
          valid: typeof SCIIP_RUNTIME_LOGGING !== 'undefined'
        },
        {
          name: 'SCIIP_RUNTIME_PROCESSOR_BASE',
          valid: typeof SCIIP_RUNTIME_PROCESSOR_BASE !== 'undefined'
        }
      ];

      requiredModules.forEach(function(moduleCheck) {
        if (!moduleCheck.valid) {
          errors.push('Missing certified module: ' + moduleCheck.name);
        }
      });

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var certificationSheet = definition.targetSheet;
      var certificationLedgerSheet = definition.ledgerSheet;

      var headers = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Certification_Status',
        'Certified_Version',
        'Certified_Modules',
        'Certification_Statement',
        'Next_Phase',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Certified_Version',
        'Result_JSON'
      ];

      var certifiedModules = [
        'SCIIP_RuntimeCommon',
        'SCIIP_RuntimeResultFactory',
        'SCIIP_RuntimePayloadFactory',
        'SCIIP_RuntimeSheetFactory',
        'SCIIP_RuntimeContext',
        'SCIIP_RuntimeTransactionManager',
        'SCIIP_RuntimeLogging',
        'SCIIP_RuntimeProcessorBase'
      ];

      var certificationStatement =
        'SCIIP_OS v5.2 Runtime Framework is certified as shared-framework integrated, production-ready, idempotent, duplicate-safe, ledger-backed, transaction-aware, compact-payload compatible, and ready for v5.3 Autonomous Runtime.';

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        certificationSheet,
        headers,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: 'CERTIFIED',
          Certified_Version: 'v5.2',
          Certified_Modules: certifiedModules.join(', '),
          Certification_Statement: certificationStatement,
          Next_Phase: 'v5.3 Autonomous Runtime',
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: certifiedModules.length,
        message: JSON.stringify({
          certificationStatus: 'CERTIFIED',
          certifiedVersion: 'v5.2',
          certifiedModules: certifiedModules.length,
          transactionId: transaction.transactionId,
          nextPhase: 'v5.3 Autonomous Runtime'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        certificationLedgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'CERTIFICATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Certified_Version: 'v5.2',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          certifiedModules: certifiedModules,
          certificationStatement: certificationStatement,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.2 Runtime Framework certification completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2470_RuntimeFrameworkCertificationProcessor() {
  var result = sciipRun2470_RuntimeFrameworkCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2470_RuntimeFrameworkCertificationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v6.1 Repository Consolidation
 * Corrected filename. This source already implemented processor 2740.
 */
/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Ledger Processor
 * File: 2740_SuperSheetDataQualityLedgerProcessor.gs
 *
 * Processor: 2740_SuperSheetDataQualityLedger
 *
 * Purpose:
 * Creates a durable ledger summary from SUPERSHEET_DATA_QUALITY
 * records produced by 2730_SuperSheetDataQualityProcessor.
 *
 * This processor is non-destructive.
 * It does not modify source quality records.
 * It records batch-level data quality ledger entries only.
 */

function sciipRun2740_SuperSheetDataQualityLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2740_SuperSheetDataQualityLedger',
    action: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY',
    targetSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var qualityRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: qualityRecords.length,
        outputCount: qualityRecords.length ? 1 : 0,
        summary: 'SuperSheet data quality ledger summary payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_LEDGER',
          upstreamProcessor: '2730_SuperSheetDataQuality'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing source sheet.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var summaryHeaders = sciipGet2740_SuperSheetDataQualityLedgerSummaryHeaders_();
      var runtimeLedgerHeaders = sciipGet2740_SuperSheetDataQualityRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        summaryHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        runtimeLedgerHeaders
      );

      var qualityRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!qualityRecords || qualityRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2730_SuperSheetDataQualityProcessor after loading SuperSheet / Bridge rows.'
          })
        });

        sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Summary_Records_Created: 0,
            Auto_Promote_Ready: 0,
            Needs_Review: 0,
            New_Candidate: 0,
            Average_Quality_Score: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var assessmentDate = sciipResolve2740_LatestAssessmentDate_(qualityRecords) ||
        SCIIP_RUNTIME.getDateKey({});

      var ledgerBusinessKey = 'SUPERSHEET_DATA_QUALITY_LEDGER|' + assessmentDate;

      if (sciip2740_SummaryBusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: qualityRecords.length,
          processed: 0,
          message: JSON.stringify({
            dataQualityLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: qualityRecords.length,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: qualityRecords.length,
            Summary_Records_Created: 0,
            Auto_Promote_Ready: 0,
            Needs_Review: 0,
            New_Candidate: 0,
            Average_Quality_Score: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var recordsForDate = sciipFilter2740_QualityRecordsByAssessmentDate_(
        qualityRecords,
        assessmentDate
      );

      var summary = sciipSummarize2740_SuperSheetDataQualityRecords_(recordsForDate);

      var summaryRecord = {
        Ledger_Summary_ID: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY_' + Utilities.getUuid(),
        Business_Key: ledgerBusinessKey,
        Ledger_Date: assessmentDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: recordsForDate.length,
        Auto_Promote_Ready: summary.autoPromoteReady,
        Needs_Review: summary.needsReview,
        New_Candidate: summary.newCandidate,
        High_Quality_Count: summary.highQualityCount,
        Medium_Quality_Count: summary.mediumQualityCount,
        Low_Quality_Count: summary.lowQualityCount,
        Average_Quality_Score: summary.averageQualityScore,
        Lowest_Quality_Score: summary.lowestQualityScore,
        Highest_Quality_Score: summary.highestQualityScore,
        Dominant_Routing_Decision: summary.dominantRoutingDecision,
        Ledger_Status: summary.recordsAssessed > 0 ? 'DATA_QUALITY_LEDGER_RECORDED' : 'NO_RECORDS_FOR_DATE',
        Recommended_Next_Action: sciipDetermine2740_RecommendedNextAction_(summary),
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Summary_JSON: summary
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        summaryHeaders,
        summaryRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: qualityRecords.length,
        processed: recordsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          dataQualityLedgerStatus: summaryRecord.Ledger_Status,
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: qualityRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          ledgerDate: assessmentDate,
          ledgerBusinessKey: ledgerBusinessKey,
          autoPromoteReady: summary.autoPromoteReady,
          needsReview: summary.needsReview,
          newCandidate: summary.newCandidate,
          averageQualityScore: summary.averageQualityScore,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: summaryRecord.Recommended_Next_Action
        })
      });

      sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DATA_QUALITY_LEDGER_SUMMARY_RECORDED',
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: qualityRecords.length,
          Summary_Records_Created: 1,
          Auto_Promote_Ready: summary.autoPromoteReady,
          Needs_Review: summary.needsReview,
          New_Candidate: summary.newCandidate,
          Average_Quality_Score: summary.averageQualityScore,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: qualityRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality ledger summary completed.'
      });

      return result;
    }
  });
}

function sciipGet2740_SuperSheetDataQualityLedgerSummaryHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'High_Quality_Count',
    'Medium_Quality_Count',
    'Low_Quality_Count',
    'Average_Quality_Score',
    'Lowest_Quality_Score',
    'Highest_Quality_Score',
    'Dominant_Routing_Decision',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipGet2740_SuperSheetDataQualityRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Ledger_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Summary_Records_Created',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'Average_Quality_Score',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2740_LatestAssessmentDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2740_DateValue_(record.Assessment_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2740_QualityRecordsByAssessmentDate_(records, assessmentDate) {
  return records.filter(function(record) {
    return sciipNormalize2740_DateValue_(record.Assessment_Date) === assessmentDate;
  });
}

function sciipNormalize2740_DateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return text;
}

function sciipSummarize2740_SuperSheetDataQualityRecords_(records) {
  var totalScore = 0;
  var lowestScore = null;
  var highestScore = null;

  var counts = {
    AUTO_PROMOTE_READY: 0,
    NEEDS_REVIEW: 0,
    NEW_CANDIDATE: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0
  };

  records.forEach(function(record) {
    var score = Number(record.Overall_Quality_Score || 0);
    totalScore += score;

    if (lowestScore === null || score < lowestScore) lowestScore = score;
    if (highestScore === null || score > highestScore) highestScore = score;

    var routingDecision = String(record.Routing_Decision || '').trim();
    if (counts.hasOwnProperty(routingDecision)) counts[routingDecision]++;

    var qualityBand = String(record.Quality_Band || '').trim();
    if (counts.hasOwnProperty(qualityBand)) counts[qualityBand]++;
  });

  return {
    recordsAssessed: records.length,
    autoPromoteReady: counts.AUTO_PROMOTE_READY,
    needsReview: counts.NEEDS_REVIEW,
    newCandidate: counts.NEW_CANDIDATE,
    highQualityCount: counts.HIGH,
    mediumQualityCount: counts.MEDIUM,
    lowQualityCount: counts.LOW,
    averageQualityScore: records.length ? Math.round(totalScore / records.length) : 0,
    lowestQualityScore: lowestScore === null ? 0 : lowestScore,
    highestQualityScore: highestScore === null ? 0 : highestScore,
    dominantRoutingDecision: sciipDetermine2740_DominantRoutingDecision_(counts)
  };
}

function sciipDetermine2740_DominantRoutingDecision_(counts) {
  var decisions = [
    { name: 'AUTO_PROMOTE_READY', count: counts.AUTO_PROMOTE_READY || 0 },
    { name: 'NEEDS_REVIEW', count: counts.NEEDS_REVIEW || 0 },
    { name: 'NEW_CANDIDATE', count: counts.NEW_CANDIDATE || 0 }
  ];

  decisions.sort(function(a, b) {
    return b.count - a.count;
  });

  return decisions[0].count > 0 ? decisions[0].name : 'NO_RECORDS';
}

function sciipDetermine2740_RecommendedNextAction_(summary) {
  if (!summary || !summary.recordsAssessed) {
    return 'Run 2730_SuperSheetDataQualityProcessor after loading SuperSheet / Bridge rows.';
  }

  if (summary.newCandidate > 0 || summary.needsReview > 0) {
    return 'Route non-auto-promote records to approval and candidate review before promotion.';
  }

  return 'Proceed to matching and promotion processors with quality ledger available for audit.';
}

function sciip2740_SummaryBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2740_SuperSheetDataQualityRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2740_SuperSheetDataQualityLedgerProcessor() {
  var result = sciipRun2740_SuperSheetDataQualityLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2740_SuperSheetDataQualityLedgerProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 900_AutonomousGovernanceReviewProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousGovernanceReviewProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '900_AutonomousGovernanceReviewProcessor',
    action: 'AUTONOMOUS_GOVERNANCE_REVIEW_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_MONITORING',
    targetSheet: 'AUTONOMOUS_GOVERNANCE_REVIEWS',
    ledgerSheet: 'AUTONOMOUS_GOVERNANCE_REVIEWS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '900_AutonomousGovernanceReviewProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousGovernanceReviewProcessorLegacy900_();
      return sciipWrapLegacyRuntimeResult900_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult900_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * 900_AutonomousGovernanceReviewProcessor
 *******************************************************/

const AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME = '900_AutonomousGovernanceReviewProcessor';

const AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_MONITORING';
const AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_REVIEWS';

const AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA = [
  'Review_ID',
  'Business_Key',
  'Review_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Review_Title',
  'Review_Type',
  'Review_Summary',
  'Governance_Health',
  'Review_Decision',
  'Next_Action',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousGovernanceReviewProcessorLegacy900_() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousGovernanceReviewSheet_();

  const reviewDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET,
      'Monitoring_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_GOVERNANCE_REVIEW|${reviewDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
    resolvedReviewDate: reviewDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousGovernanceReviewsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceMonitoringForReviewDate_(reviewDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousGovernanceReviewsCreated: 0,
      reviewDate,
      completedAt: new Date().toISOString()
    };
  }

  const review = sciipBuildAutonomousGovernanceReview_({
    reviewDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousGovernanceReview_(review);

  return {
    processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousGovernanceReviewsCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousGovernanceReview_(payload) {
  const reviewId = `AUTONOMOUS_GOVERNANCE_REVIEW_${Utilities.getUuid()}`;

  return {
    Review_ID: reviewId,
    Business_Key: payload.businessKey,
    Review_Date: payload.reviewDate,
    Source_Sheet: AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Review_Title: `Autonomous Governance Review — ${payload.reviewDate}`,
    Review_Type: 'PROCESSOR_GOVERNANCE_STANDARD_REVIEW',
    Review_Summary: sciipCreateAutonomousGovernanceReviewSummary_(payload.sourceRows),
    Governance_Health: sciipResolveAutonomousGovernanceHealth_(payload.sourceRows),
    Review_Decision: sciipCreateAutonomousGovernanceReviewDecision_(payload.sourceRows),
    Next_Action: sciipCreateAutonomousGovernanceReviewNextAction_(payload.sourceRows),
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousGovernanceReviewSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_GOVERNANCE_REVIEW_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceMonitoringForReviewDate_(reviewDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_GOVERNANCE_REVIEW_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Monitoring_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_GOVERNANCE_REVIEW_PROCESSOR_NAME,
      error: 'MONITORING_DATE_COLUMN_NOT_FOUND',
      headers
    }));
    return [];
  }

  return values
    .slice(1)
    .filter(row => {
      const rawDate = row[dateIndex];
      const rowDate =
        rawDate instanceof Date
          ? sciipFormatDateKey_(rawDate)
          : String(rawDate).trim();

      return rowDate === reviewDate;
    })
    .map(row => sciipAutonomousGovernanceReviewRowToObject_(headers, row));
}

function sciipCreateAutonomousGovernanceReviewSummary_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} governance monitoring record(s).`,
    'The latest completed processing date standard remains active as a monitored governance rule.',
    'The governance chain now provides traceability from standard adoption through compliance, audit, enforcement, monitoring, and review.'
  ].join(' ');
}

function sciipResolveAutonomousGovernanceHealth_(sourceRows) {
  if (!sourceRows.length) return 'UNKNOWN';

  const hasActiveMonitoring = sourceRows.some(row => {
    return String(row.Monitoring_Status || '').trim().toUpperCase() === 'ACTIVE_MONITORING';
  });

  return hasActiveMonitoring ? 'HEALTHY' : 'REVIEW_REQUIRED';
}

function sciipCreateAutonomousGovernanceReviewDecision_(sourceRows) {
  return [
    'CONTINUE_STANDARD_ENFORCEMENT.',
    'Future downstream processors should continue to use the latest completed upstream processing date standard.',
    'The standard is suitable for ongoing SCIIP_OS processor governance.'
  ].join(' ');
}

function sciipCreateAutonomousGovernanceReviewNextAction_(sourceRows) {
  return [
    'Apply the standard to processor 910 and all later downstream processors.',
    'During future builds, verify first-run creation and second-run duplicate protection.',
    'Preserve each governance review as permanent operating-system history.'
  ].join('\n');
}

function sciipAppendAutonomousGovernanceReview_(review) {
  const sheet = sciipEnsureAutonomousGovernanceReviewSheet_();

  const row = AUTONOMOUS_GOVERNANCE_REVIEW_SCHEMA.map(header => review[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousGovernanceReviewRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousGovernanceReviewProcessor() {
  const result = sciipRunAutonomousGovernanceReviewProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousGovernanceReviewProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 910_AutonomousProcessorGuidanceProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorGuidanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '910_AutonomousProcessorGuidanceProcessor',
    action: 'AUTONOMOUS_PROCESSOR_GUIDANCE_BUILD',
    sourceSheet: 'AUTONOMOUS_GOVERNANCE_REVIEWS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_GUIDANCE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_GUIDANCE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '910_AutonomousProcessorGuidanceProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorGuidanceProcessorLegacy910_();
      return sciipWrapLegacyRuntimeResult910_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult910_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * 910_AutonomousProcessorGuidanceProcessor
 *******************************************************/

const AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME = '910_AutonomousProcessorGuidanceProcessor';

const AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET = 'AUTONOMOUS_GOVERNANCE_REVIEWS';
const AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_GUIDANCE';

const AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA = [
  'Guidance_ID',
  'Business_Key',
  'Guidance_Date',
  'Source_Sheet',
  'Source_Record_Count',
  'Guidance_Title',
  'Guidance_Type',
  'Processor_Build_Guidance',
  'Required_Architecture_Pattern',
  'Validation_Requirement',
  'Status',
  'Created_At',
  'Processor'
];

function sciipRunAutonomousProcessorGuidanceProcessorLegacy910_() {
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousProcessorGuidanceSheet_();

  const guidanceDate =
    sciipResolveLatestProcessingDate_(
      AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET,
      'Review_Date'
    ) || sciipFormatDateKey_(startedAt);

  const businessKey = `AUTONOMOUS_PROCESSOR_GUIDANCE|${guidanceDate}`;

  Logger.log(JSON.stringify({
    processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
    resolvedGuidanceDate: guidanceDate,
    businessKey
  }));

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      status: 'SUCCESS',
      autonomousProcessorGuidanceCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceRows = sciipGetAutonomousGovernanceReviewsForGuidanceDate_(guidanceDate);

  if (!sourceRows.length) {
    return {
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorGuidanceCreated: 0,
      guidanceDate,
      completedAt: new Date().toISOString()
    };
  }

  const guidance = sciipBuildAutonomousProcessorGuidance_({
    guidanceDate,
    businessKey,
    sourceRows,
    startedAt
  });

  sciipAppendAutonomousProcessorGuidance_(guidance);

  return {
    processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
    status: 'SUCCESS',
    autonomousProcessorGuidanceCreated: 1,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

/*******************************************************
 * Factory Functions
 *******************************************************/

function sciipBuildAutonomousProcessorGuidance_(payload) {
  const guidanceId = `AUTONOMOUS_PROCESSOR_GUIDANCE_${Utilities.getUuid()}`;

  return {
    Guidance_ID: guidanceId,
    Business_Key: payload.businessKey,
    Guidance_Date: payload.guidanceDate,
    Source_Sheet: AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET,
    Source_Record_Count: payload.sourceRows.length,
    Guidance_Title: `Autonomous Processor Guidance — ${payload.guidanceDate}`,
    Guidance_Type: 'PROCESSOR_BUILD_GOVERNANCE',
    Processor_Build_Guidance: sciipCreateAutonomousProcessorBuildGuidance_(payload.sourceRows),
    Required_Architecture_Pattern: sciipCreateAutonomousProcessorRequiredPattern_(payload.sourceRows),
    Validation_Requirement: sciipCreateAutonomousProcessorValidationRequirement_(payload.sourceRows),
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME
  };
}

/*******************************************************
 * Helper Functions
 *******************************************************/

function sciipEnsureAutonomousProcessorGuidanceSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_PROCESSOR_GUIDANCE_OUTPUT_SHEET);
    sheet.appendRow(AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA);
  }

  return sheet;
}

function sciipGetAutonomousGovernanceReviewsForGuidanceDate_(guidanceDate) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(AUTONOMOUS_PROCESSOR_GUIDANCE_INPUT_SHEET);

  if (!sheet) return [];

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(h => String(h).trim());
  const dateIndex = headers.indexOf('Review_Date');

  if (dateIndex === -1) {
    Logger.log(JSON.stringify({
      processor: AUTONOMOUS_PROCESSOR_GUIDANCE_PROCESSOR_NAME,
      error: 'REVIEW_DATE_COLUMN_NOT_FOUND',
      headers
    }));
    return [];
  }

  return values
    .slice(1)
    .filter(row => {
      const rawDate = row[dateIndex];
      const rowDate =
        rawDate instanceof Date
          ? sciipFormatDateKey_(rawDate)
          : String(rawDate).trim();

      return rowDate === guidanceDate;
    })
    .map(row => sciipAutonomousProcessorGuidanceRowToObject_(headers, row));
}

function sciipCreateAutonomousProcessorBuildGuidance_(sourceRows) {
  return [
    `SCIIP_OS reviewed ${sourceRows.length} governance review record(s).`,
    'Future downstream processors must follow the active latest completed processing date standard.',
    'Each processor should strengthen the knowledge graph, preserve permanent history, and remain deterministic, idempotent, and production ready.'
  ].join(' ');
}

function sciipCreateAutonomousProcessorRequiredPattern_(sourceRows) {
  return [
    'Required downstream date pattern:',
    '',
    'const processingDate =',
    '  sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt);',
    '',
    'const businessKey = `OUTPUT_TYPE|${processingDate}`;',
    '',
    'Use processingDate for source-row filtering.',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented duplicate checks.'
  ].join('\n');
}

function sciipCreateAutonomousProcessorValidationRequirement_(sourceRows) {
  return [
    'First run must create exactly one durable output record when source input exists.',
    'Second run must return SUCCESS with created count 0 and skippedDuplicate: 1.',
    'Execution logs must include the resolved processing date and business key.',
    'A SKIPPED_NO_INPUTS result must include the resolved date for diagnosis.'
  ].join('\n');
}

function sciipAppendAutonomousProcessorGuidance_(guidance) {
  const sheet = sciipEnsureAutonomousProcessorGuidanceSheet_();

  const row = AUTONOMOUS_PROCESSOR_GUIDANCE_SCHEMA.map(header => guidance[header] || '');

  sheet.appendRow(row);
}

function sciipAutonomousProcessorGuidanceRowToObject_(headers, row) {
  const obj = {};

  headers.forEach((header, index) => {
    obj[header] = row[index];
  });

  return obj;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousProcessorGuidanceProcessor() {
  const result = sciipRunAutonomousProcessorGuidanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorGuidanceProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 920_AutonomousProcessorExecutionPlanProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '920_AutonomousProcessorExecutionPlanProcessor',
    action: 'AUTONOMOUS_EXECUTION_PLAN_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_GUIDANCE',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '920_AutonomousProcessorExecutionPlanProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionPlanProcessorLegacy920_();
      return sciipWrapLegacyRuntimeResult920_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult920_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 920_AutonomousProcessorExecutionPlanProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_920_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_GUIDANCE';
const SCIIP_920_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS';
const SCIIP_920_INPUT_DATE_COLUMN = 'Guidance_Date';

const SCIIP_920_OUTPUT_HEADERS = [
  'Execution_Plan_ID',
  'Plan_Date',
  'Source_Guidance_ID',
  'Target_Processor',
  'Priority',
  'Execution_Action',
  'Required_Input',
  'Required_Output',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Test_Expectation',
  'Status',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_920_PROCESSOR = '920_AutonomousProcessorExecutionPlanProcessor';
const SCIIP_920_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_PLAN';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorExecutionPlanProcessorLegacy920_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_920_INPUT_SHEET);
  if (!inputSheet) {
    return sciip920Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip920EnsureSheet_(ss, SCIIP_920_OUTPUT_SHEET, SCIIP_920_OUTPUT_HEADERS);

  const resolvedPlanDate =
    sciipResolveLatestProcessingDate_(SCIIP_920_INPUT_SHEET, SCIIP_920_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_920_BUSINESS_PREFIX}|${resolvedPlanDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip920Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const guidanceRows = sciip920ReadRowsForDate_(inputSheet, SCIIP_920_INPUT_DATE_COLUMN, resolvedPlanDate);

  if (!guidanceRows.length) {
    return sciip920Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = guidanceRows.map((row, index) =>
    sciip920BuildExecutionPlan_(row, resolvedPlanDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_920_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip920Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip920BuildExecutionPlan_(row, planDate, businessKey, startedAt, index) {
  const sourceGuidanceId =
    row.Guidance_ID ||
    row.Autonomous_Guidance_ID ||
    row.Source_Guidance_ID ||
    `GUIDANCE_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    row.Processor ||
    row.Recommended_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const priority =
    row.Priority ||
    row.Guidance_Priority ||
    'NORMAL';

  const executionAction =
    row.Guidance ||
    row.Recommendation ||
    row.Processor_Guidance ||
    row.Action ||
    'Create next downstream SCIIP_OS processor using v4.1 architecture standards.';

  return [
    sciip920CreateId_('EXEC_PLAN'),
    planDate,
    sourceGuidanceId,
    targetProcessor,
    priority,
    executionAction,
    row.Required_Input || row.Input_Sheet || SCIIP_920_INPUT_SHEET,
    row.Required_Output || row.Output_Sheet || SCIIP_920_OUTPUT_SHEET,
    'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    'Converts autonomous processor guidance into build-ready execution plan history',
    'First run creates execution plans; second run returns skippedDuplicate = 1',
    'READY_FOR_BUILD',
    `${businessKey}|${targetProcessor}|${sourceGuidanceId}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip920ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_920_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip920EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip920CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip920Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_920_PROCESSOR,
    status,
    autonomousProcessorExecutionPlansCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorExecutionPlanProcessor() {
  const result = sciipRunAutonomousProcessorExecutionPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionPlanProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 930_AutonomousProcessorBuildTaskProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorBuildTaskProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '930_AutonomousProcessorBuildTaskProcessor',
    action: 'AUTONOMOUS_BUILD_TASK_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_BUILD_TASKS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_BUILD_TASKS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '930_AutonomousProcessorBuildTaskProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorBuildTaskProcessorLegacy930_();
      return sciipWrapLegacyRuntimeResult930_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult930_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 930_AutonomousProcessorBuildTaskProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_930_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_PLANS';
const SCIIP_930_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_BUILD_TASKS';
const SCIIP_930_INPUT_DATE_COLUMN = 'Plan_Date';

const SCIIP_930_OUTPUT_HEADERS = [
  'Build_Task_ID',
  'Build_Task_Date',
  'Source_Execution_Plan_ID',
  'Target_Processor',
  'Build_Phase',
  'Build_Task',
  'Required_Input',
  'Required_Output',
  'Acceptance_Criteria',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Status',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_930_PROCESSOR = '930_AutonomousProcessorBuildTaskProcessor';
const SCIIP_930_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_BUILD_TASK';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorBuildTaskProcessorLegacy930_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_930_INPUT_SHEET);
  if (!inputSheet) {
    return sciip930Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip930EnsureSheet_(ss, SCIIP_930_OUTPUT_SHEET, SCIIP_930_OUTPUT_HEADERS);

  const resolvedBuildDate =
    sciipResolveLatestProcessingDate_(SCIIP_930_INPUT_SHEET, SCIIP_930_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_930_BUSINESS_PREFIX}|${resolvedBuildDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip930Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const executionPlans = sciip930ReadRowsForDate_(inputSheet, SCIIP_930_INPUT_DATE_COLUMN, resolvedBuildDate);

  if (!executionPlans.length) {
    return sciip930Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = [];

  executionPlans.forEach((row, index) => {
    records.push(
      sciip930BuildTask_(row, resolvedBuildDate, businessKey, startedAt, index, 'SCHEMA', 'Define output sheet schema and required headers.'),
      sciip930BuildTask_(row, resolvedBuildDate, businessKey, startedAt, index, 'PROCESSOR', 'Implement main processor with resolved-date filtering and idempotent business key logic.'),
      sciip930BuildTask_(row, resolvedBuildDate, businessKey, startedAt, index, 'TEST', 'Implement and run standalone test function validating first run and duplicate rerun behavior.')
    );
  });

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_930_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip930Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip930BuildTask_(row, buildDate, businessKey, startedAt, index, phase, task) {
  const sourceExecutionPlanId =
    row.Execution_Plan_ID ||
    row.Source_Execution_Plan_ID ||
    `EXECUTION_PLAN_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  return [
    sciip930CreateId_('BUILD_TASK'),
    buildDate,
    sourceExecutionPlanId,
    targetProcessor,
    phase,
    task,
    row.Required_Input || SCIIP_930_INPUT_SHEET,
    row.Required_Output || 'Downstream processor output sheet',
    row.Test_Expectation || 'First run creates records; second run returns skippedDuplicate = 1',
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Transforms execution plans into build task history for autonomous processor development',
    'READY',
    `${businessKey}|${targetProcessor}|${sourceExecutionPlanId}|${phase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip930ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_930_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip930EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip930CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip930Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_930_PROCESSOR,
    status,
    autonomousProcessorBuildTasksCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorBuildTaskProcessor() {
  const result = sciipRunAutonomousProcessorBuildTaskProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorBuildTaskProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 940_AutonomousProcessorBuildValidationProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorBuildValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '940_AutonomousProcessorBuildValidationProcessor',
    action: 'AUTONOMOUS_BUILD_VALIDATION_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_BUILD_TASKS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '940_AutonomousProcessorBuildValidationProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorBuildValidationProcessorLegacy940_();
      return sciipWrapLegacyRuntimeResult940_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult940_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 940_AutonomousProcessorBuildValidationProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_940_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_BUILD_TASKS';
const SCIIP_940_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS';
const SCIIP_940_INPUT_DATE_COLUMN = 'Build_Task_Date';

const SCIIP_940_OUTPUT_HEADERS = [
  'Build_Validation_ID',
  'Validation_Date',
  'Source_Build_Task_ID',
  'Target_Processor',
  'Build_Phase',
  'Validation_Check',
  'Expected_Result',
  'Failure_Risk',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Validation_Status',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_940_PROCESSOR = '940_AutonomousProcessorBuildValidationProcessor';
const SCIIP_940_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATION';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorBuildValidationProcessorLegacy940_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_940_INPUT_SHEET);
  if (!inputSheet) {
    return sciip940Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip940EnsureSheet_(ss, SCIIP_940_OUTPUT_SHEET, SCIIP_940_OUTPUT_HEADERS);

  const resolvedValidationDate =
    sciipResolveLatestProcessingDate_(SCIIP_940_INPUT_SHEET, SCIIP_940_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_940_BUSINESS_PREFIX}|${resolvedValidationDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip940Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const buildTasks = sciip940ReadRowsForDate_(
    inputSheet,
    SCIIP_940_INPUT_DATE_COLUMN,
    resolvedValidationDate
  );

  if (!buildTasks.length) {
    return sciip940Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = buildTasks.map((row, index) =>
    sciip940BuildValidation_(row, resolvedValidationDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_940_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip940Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip940BuildValidation_(row, validationDate, businessKey, startedAt, index) {
  const sourceBuildTaskId =
    row.Build_Task_ID ||
    row.Source_Build_Task_ID ||
    `BUILD_TASK_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const buildPhase =
    row.Build_Phase ||
    'GENERAL';

  const validationCheck = sciip940ValidationCheckForPhase_(buildPhase, row);

  return [
    sciip940CreateId_('BUILD_VALIDATION'),
    validationDate,
    sourceBuildTaskId,
    targetProcessor,
    buildPhase,
    validationCheck.check,
    validationCheck.expected,
    validationCheck.risk,
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Creates permanent validation history for autonomous processor build tasks',
    'PENDING_VALIDATION',
    `${businessKey}|${targetProcessor}|${sourceBuildTaskId}|${buildPhase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip940ValidationCheckForPhase_(phase, row) {
  const normalizedPhase = String(phase || '').toUpperCase();

  if (normalizedPhase === 'SCHEMA') {
    return {
      check: 'Confirm output sheet exists, headers are complete, and no prior history is overwritten.',
      expected: 'Output sheet is created if missing; header row is frozen; records append below existing history.',
      risk: 'Schema drift or missing headers could break downstream processors.'
    };
  }

  if (normalizedPhase === 'PROCESSOR') {
    return {
      check: 'Confirm processor resolves latest input date, filters source rows by that date, and uses prefix business-key idempotency.',
      expected: 'First eligible run creates records; duplicate run returns skippedDuplicate = 1.',
      risk: 'Incorrect date resolution or idempotency could create duplicate or stale records.'
    };
  }

  if (normalizedPhase === 'TEST') {
    return {
      check: 'Confirm standalone test function logs structured JSON and validates duplicate behavior.',
      expected: 'Test returns SUCCESS with created count or skippedDuplicate = 1 on rerun.',
      risk: 'Insufficient test coverage could allow silent downstream failure.'
    };
  }

  return {
    check: row.Acceptance_Criteria || 'Confirm build task satisfies SCIIP_OS v4.1 architecture standards.',
    expected: 'Task is validated without overwriting prior history.',
    risk: 'Unvalidated task may weaken downstream processor chain.'
  };
}

function sciip940ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_940_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip940EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip940CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip940Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_940_PROCESSOR,
    status,
    autonomousProcessorBuildValidationsCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorBuildValidationProcessor() {
  const result = sciipRunAutonomousProcessorBuildValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorBuildValidationProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 950_AutonomousProcessorReadinessProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '950_AutonomousProcessorReadinessProcessor',
    action: 'AUTONOMOUS_READINESS_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_READINESS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_READINESS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '950_AutonomousProcessorReadinessProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorReadinessProcessorLegacy950_();
      return sciipWrapLegacyRuntimeResult950_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult950_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 950_AutonomousProcessorReadinessProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_950_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_BUILD_VALIDATIONS';
const SCIIP_950_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_READINESS';
const SCIIP_950_INPUT_DATE_COLUMN = 'Validation_Date';

const SCIIP_950_OUTPUT_HEADERS = [
  'Readiness_ID',
  'Readiness_Date',
  'Source_Validation_ID',
  'Target_Processor',
  'Build_Phase',
  'Readiness_Status',
  'Readiness_Rationale',
  'Required_Next_Action',
  'Blocking_Risk',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_950_PROCESSOR = '950_AutonomousProcessorReadinessProcessor';
const SCIIP_950_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_READINESS';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorReadinessProcessorLegacy950_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_950_INPUT_SHEET);
  if (!inputSheet) {
    return sciip950Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip950EnsureSheet_(ss, SCIIP_950_OUTPUT_SHEET, SCIIP_950_OUTPUT_HEADERS);

  const resolvedReadinessDate =
    sciipResolveLatestProcessingDate_(SCIIP_950_INPUT_SHEET, SCIIP_950_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_950_BUSINESS_PREFIX}|${resolvedReadinessDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip950Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const validations = sciip950ReadRowsForDate_(
    inputSheet,
    SCIIP_950_INPUT_DATE_COLUMN,
    resolvedReadinessDate
  );

  if (!validations.length) {
    return sciip950Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = validations.map((row, index) =>
    sciip950BuildReadiness_(row, resolvedReadinessDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_950_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip950Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip950BuildReadiness_(row, readinessDate, businessKey, startedAt, index) {
  const sourceValidationId =
    row.Build_Validation_ID ||
    row.Source_Validation_ID ||
    `BUILD_VALIDATION_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const buildPhase =
    row.Build_Phase ||
    'GENERAL';

  const validationStatus =
    row.Validation_Status ||
    'PENDING_VALIDATION';

  const readiness = sciip950ResolveReadiness_(validationStatus, buildPhase, row);

  return [
    sciip950CreateId_('READINESS'),
    readinessDate,
    sourceValidationId,
    targetProcessor,
    buildPhase,
    readiness.status,
    readiness.rationale,
    readiness.nextAction,
    readiness.blockingRisk,
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Creates permanent readiness signal from build validation history',
    `${businessKey}|${targetProcessor}|${sourceValidationId}|${buildPhase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip950ResolveReadiness_(validationStatus, buildPhase, row) {
  const status = String(validationStatus || '').toUpperCase();

  if (status === 'VALIDATED' || status === 'PASSED' || status === 'SUCCESS') {
    return {
      status: 'READY',
      rationale: 'Validation passed and processor build phase is ready for downstream use.',
      nextAction: 'Proceed to downstream processor implementation or orchestration.',
      blockingRisk: 'NONE'
    };
  }

  if (status === 'FAILED' || status === 'BLOCKED') {
    return {
      status: 'BLOCKED',
      rationale: row.Failure_Risk || 'Validation indicates a blocking issue.',
      nextAction: 'Resolve validation failure before advancing processor chain.',
      blockingRisk: row.Failure_Risk || 'Validation failure may break downstream processor reliability.'
    };
  }

  return {
    status: 'NEEDS_REVIEW',
    rationale: `Build phase ${buildPhase} has pending validation and should be reviewed before promotion.`,
    nextAction: 'Review validation check and confirm whether this phase is ready.',
    blockingRisk: row.Failure_Risk || 'Pending validation may allow incomplete processor work downstream.'
  };
}

function sciip950ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_950_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip950EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip950CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip950Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_950_PROCESSOR,
    status,
    autonomousProcessorReadinessCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorReadinessProcessor() {
  const result = sciipRunAutonomousProcessorReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorReadinessProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 960_AutonomousProcessorPromotionDecisionProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorPromotionDecisionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '960_AutonomousProcessorPromotionDecisionProcessor',
    action: 'AUTONOMOUS_PROMOTION_DECISION_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_READINESS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISIONS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '960_AutonomousProcessorPromotionDecisionProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorPromotionDecisionProcessorLegacy960_();
      return sciipWrapLegacyRuntimeResult960_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult960_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 960_AutonomousProcessorPromotionDecisionProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_960_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_READINESS';
const SCIIP_960_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISIONS';
const SCIIP_960_INPUT_DATE_COLUMN = 'Readiness_Date';

const SCIIP_960_OUTPUT_HEADERS = [
  'Promotion_Decision_ID',
  'Decision_Date',
  'Source_Readiness_ID',
  'Target_Processor',
  'Build_Phase',
  'Readiness_Status',
  'Promotion_Decision',
  'Decision_Rationale',
  'Required_Next_Action',
  'Blocking_Risk',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_960_PROCESSOR = '960_AutonomousProcessorPromotionDecisionProcessor';
const SCIIP_960_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISION';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorPromotionDecisionProcessorLegacy960_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_960_INPUT_SHEET);
  if (!inputSheet) {
    return sciip960Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip960EnsureSheet_(ss, SCIIP_960_OUTPUT_SHEET, SCIIP_960_OUTPUT_HEADERS);

  const resolvedDecisionDate =
    sciipResolveLatestProcessingDate_(SCIIP_960_INPUT_SHEET, SCIIP_960_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_960_BUSINESS_PREFIX}|${resolvedDecisionDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip960Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const readinessRows = sciip960ReadRowsForDate_(
    inputSheet,
    SCIIP_960_INPUT_DATE_COLUMN,
    resolvedDecisionDate
  );

  if (!readinessRows.length) {
    return sciip960Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = readinessRows.map((row, index) =>
    sciip960BuildPromotionDecision_(row, resolvedDecisionDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_960_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip960Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip960BuildPromotionDecision_(row, decisionDate, businessKey, startedAt, index) {
  const sourceReadinessId =
    row.Readiness_ID ||
    row.Source_Readiness_ID ||
    `READINESS_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const buildPhase =
    row.Build_Phase ||
    'GENERAL';

  const readinessStatus =
    row.Readiness_Status ||
    'NEEDS_REVIEW';

  const decision = sciip960ResolvePromotionDecision_(readinessStatus, row);

  return [
    sciip960CreateId_('PROMOTION_DECISION'),
    decisionDate,
    sourceReadinessId,
    targetProcessor,
    buildPhase,
    readinessStatus,
    decision.decision,
    decision.rationale,
    decision.nextAction,
    row.Blocking_Risk || decision.blockingRisk,
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Creates permanent promotion decision history from autonomous processor readiness signals',
    `${businessKey}|${targetProcessor}|${sourceReadinessId}|${buildPhase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip960ResolvePromotionDecision_(readinessStatus, row) {
  const status = String(readinessStatus || '').toUpperCase();

  if (status === 'READY') {
    return {
      decision: 'PROMOTE_TO_NEXT_STAGE',
      rationale: 'Processor readiness signal indicates this build phase is ready for downstream promotion.',
      nextAction: 'Advance processor toward downstream orchestration or implementation.',
      blockingRisk: 'NONE'
    };
  }

  if (status === 'BLOCKED') {
    return {
      decision: 'DO_NOT_PROMOTE',
      rationale: row.Readiness_Rationale || 'Readiness signal indicates a blocking condition.',
      nextAction: row.Required_Next_Action || 'Resolve blocking issue before promotion.',
      blockingRisk: row.Blocking_Risk || 'Blocked readiness may break downstream processor chain.'
    };
  }

  return {
    decision: 'HOLD_FOR_REVIEW',
    rationale: row.Readiness_Rationale || 'Readiness signal requires review before promotion.',
    nextAction: row.Required_Next_Action || 'Review readiness record and decide whether to promote.',
    blockingRisk: row.Blocking_Risk || 'Unreviewed readiness may allow incomplete processor work downstream.'
  };
}

function sciip960ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_960_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip960EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip960CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip960Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_960_PROCESSOR,
    status,
    autonomousProcessorPromotionDecisionsCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorPromotionDecisionProcessor() {
  const result = sciipRunAutonomousProcessorPromotionDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorPromotionDecisionProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 970_AutonomousProcessorOrchestrationQueueProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorOrchestrationQueueProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '970_AutonomousProcessorOrchestrationQueueProcessor',
    action: 'AUTONOMOUS_ORCHESTRATION_QUEUE_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISIONS',
    targetSheet: 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '970_AutonomousProcessorOrchestrationQueueProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorOrchestrationQueueProcessorLegacy970_();
      return sciipWrapLegacyRuntimeResult970_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult970_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 970_AutonomousProcessorOrchestrationQueueProcessor
 *******************************************************/

/***********************
 * Sheet Schema
 ***********************/
const SCIIP_970_INPUT_SHEET = 'AUTONOMOUS_PROCESSOR_PROMOTION_DECISIONS';
const SCIIP_970_OUTPUT_SHEET = 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE';
const SCIIP_970_INPUT_DATE_COLUMN = 'Decision_Date';

const SCIIP_970_OUTPUT_HEADERS = [
  'Orchestration_Queue_ID',
  'Queue_Date',
  'Source_Promotion_Decision_ID',
  'Target_Processor',
  'Build_Phase',
  'Promotion_Decision',
  'Queue_Status',
  'Queue_Action',
  'Queue_Rationale',
  'Required_Next_Action',
  'Blocking_Risk',
  'Architecture_Standard',
  'Knowledge_Graph_Impact',
  'Business_Key',
  'Created_At'
];

/***********************
 * Constants
 ***********************/
const SCIIP_970_PROCESSOR = '970_AutonomousProcessorOrchestrationQueueProcessor';
const SCIIP_970_BUSINESS_PREFIX = 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE';

/***********************
 * Main Processor
 ***********************/
function sciipRunAutonomousProcessorOrchestrationQueueProcessorLegacy970_() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(SCIIP_970_INPUT_SHEET);
  if (!inputSheet) {
    return sciip970Result_('SKIPPED_MISSING_INPUT', 0, 0, null, startedAt);
  }

  const outputSheet = sciip970EnsureSheet_(ss, SCIIP_970_OUTPUT_SHEET, SCIIP_970_OUTPUT_HEADERS);

  const resolvedQueueDate =
    sciipResolveLatestProcessingDate_(SCIIP_970_INPUT_SHEET, SCIIP_970_INPUT_DATE_COLUMN) ||
    sciipFormatDateKey_(startedAt);

  const businessKey = `${SCIIP_970_BUSINESS_PREFIX}|${resolvedQueueDate}`;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return sciip970Result_('SUCCESS', 0, 1, businessKey, startedAt);
  }

  const decisions = sciip970ReadRowsForDate_(
    inputSheet,
    SCIIP_970_INPUT_DATE_COLUMN,
    resolvedQueueDate
  );

  if (!decisions.length) {
    return sciip970Result_('SKIPPED_NO_INPUTS', 0, 0, businessKey, startedAt);
  }

  const records = decisions.map((row, index) =>
    sciip970BuildQueueRecord_(row, resolvedQueueDate, businessKey, startedAt, index)
  );

  outputSheet
    .getRange(outputSheet.getLastRow() + 1, 1, records.length, SCIIP_970_OUTPUT_HEADERS.length)
    .setValues(records);

  return sciip970Result_('SUCCESS', records.length, 0, businessKey, startedAt);
}

/***********************
 * Factory Functions
 ***********************/
function sciip970BuildQueueRecord_(row, queueDate, businessKey, startedAt, index) {
  const sourcePromotionDecisionId =
    row.Promotion_Decision_ID ||
    row.Source_Promotion_Decision_ID ||
    `PROMOTION_DECISION_ROW_${index + 1}`;

  const targetProcessor =
    row.Target_Processor ||
    'NEXT_AUTONOMOUS_PROCESSOR';

  const buildPhase =
    row.Build_Phase ||
    'GENERAL';

  const promotionDecision =
    row.Promotion_Decision ||
    'HOLD_FOR_REVIEW';

  const queue = sciip970ResolveQueueAction_(promotionDecision, row);

  return [
    sciip970CreateId_('ORCH_QUEUE'),
    queueDate,
    sourcePromotionDecisionId,
    targetProcessor,
    buildPhase,
    promotionDecision,
    queue.status,
    queue.action,
    queue.rationale,
    row.Required_Next_Action || queue.nextAction,
    row.Blocking_Risk || queue.blockingRisk,
    row.Architecture_Standard || 'Resolved latest processing date; prefix idempotency; event-sourced output; permanent history',
    row.Knowledge_Graph_Impact || 'Creates permanent autonomous orchestration queue history from promotion decisions',
    `${businessKey}|${targetProcessor}|${sourcePromotionDecisionId}|${buildPhase}`,
    startedAt.toISOString()
  ];
}

/***********************
 * Helper Functions
 ***********************/
function sciip970ResolveQueueAction_(promotionDecision, row) {
  const decision = String(promotionDecision || '').toUpperCase();

  if (decision === 'PROMOTE_TO_NEXT_STAGE') {
    return {
      status: 'QUEUED_FOR_ORCHESTRATION',
      action: 'ADVANCE_PROCESSOR_CHAIN',
      rationale: 'Promotion decision approved this processor phase for downstream orchestration.',
      nextAction: 'Schedule or execute next downstream processor build step.',
      blockingRisk: 'NONE'
    };
  }

  if (decision === 'DO_NOT_PROMOTE') {
    return {
      status: 'BLOCKED_FROM_ORCHESTRATION',
      action: 'HOLD_AND_REMEDIATE',
      rationale: row.Decision_Rationale || 'Promotion decision blocked this processor phase.',
      nextAction: row.Required_Next_Action || 'Resolve blocking issue before orchestration.',
      blockingRisk: row.Blocking_Risk || 'Blocked processor phase may weaken downstream chain reliability.'
    };
  }

  return {
    status: 'QUEUED_FOR_REVIEW',
    action: 'MANUAL_REVIEW_REQUIRED',
    rationale: row.Decision_Rationale || 'Promotion decision requires review before orchestration.',
    nextAction: row.Required_Next_Action || 'Review promotion decision and approve or block orchestration.',
    blockingRisk: row.Blocking_Risk || 'Unreviewed promotion decision may delay or compromise downstream orchestration.'
  };
}

function sciip970ReadRowsForDate_(sheet, dateColumnName, dateKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);
  const dateIndex = headers.indexOf(dateColumnName);

  if (dateIndex === -1) {
    throw new Error(`${SCIIP_970_PROCESSOR}: Missing input date column ${dateColumnName}`);
  }

  return values.slice(1)
    .filter(row => sciipFormatDateKey_(row[dateIndex]) === dateKey)
    .map(row => {
      const obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
}

function sciip970EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciip970CreateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciip970Result_(status, created, skippedDuplicate, businessKey, startedAt) {
  return {
    processor: SCIIP_970_PROCESSOR,
    status,
    autonomousProcessorOrchestrationQueueCreated: created,
    skippedDuplicate,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };
}

/***********************
 * Test Function
 ***********************/
function sciipTestAutonomousProcessorOrchestrationQueueProcessor() {
  const result = sciipRunAutonomousProcessorOrchestrationQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorOrchestrationQueueProcessor',
    result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 980_AutonomousProcessorExecutionMonitorProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionMonitorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '980_AutonomousProcessorExecutionMonitorProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_MONITORS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_MONITORS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '980_AutonomousProcessorExecutionMonitorProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionMonitorProcessorLegacy980_();
      return sciipWrapLegacyRuntimeResult980_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult980_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 980_AutonomousProcessorExecutionMonitorProcessor
 *******************************************************/

const SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR = {
  PROCESSOR: '980_AutonomousProcessorExecutionMonitorProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_ORCHESTRATION_QUEUE',
  INPUT_DATE_COLUMN: 'Orchestration_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR',

  OUTPUT_HEADERS: [
    'Execution_Monitor_ID',
    'Business_Key',
    'Monitor_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Execution_Risk_Reason',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionMonitorProcessorLegacy980_() {
  const cfg = SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionMonitorSheet_();

  const resolvedMonitorDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR|' + resolvedMonitorDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionMonitorsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);
  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionMonitorNoInput_(
      outputSheet,
      businessKey,
      resolvedMonitorDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects980_(inputSheet);
  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey980_(row[cfg.INPUT_DATE_COLUMN]) === resolvedMonitorDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionMonitorNoInput_(
      outputSheet,
      businessKey,
      resolvedMonitorDate,
      startedAt
    );
  }

  const monitor = sciipBuildAutonomousProcessorExecutionMonitor980_(
    sourceRows,
    businessKey,
    resolvedMonitorDate,
    startedAt
  );

  outputSheet.appendRow(sciipObjectToRow980_(monitor, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionMonitorsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    monitorDate: resolvedMonitorDate,
    queueItemsReviewed: monitor.Queue_Items_Reviewed,
    executionRiskLevel: monitor.Execution_Risk_Level,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionMonitor980_(sourceRows, businessKey, monitorDate, startedAt) {
  const cfg = SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR;

  const statusCounts = sciipCountExecutionStatuses980_(sourceRows);
  const highestPriority = sciipResolveHighestPriority980_(sourceRows);
  const risk = sciipResolveExecutionRisk980_(statusCounts, sourceRows);
  const recommendedAction = sciipResolveRecommendedExecutionAction980_(risk, statusCounts);

  return {
    Execution_Monitor_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Monitor_Date: monitorDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Queue_Items_Reviewed: sourceRows.length,
    Ready_Count: statusCounts.READY,
    Blocked_Count: statusCounts.BLOCKED,
    Hold_Count: statusCounts.HOLD,
    Executed_Count: statusCounts.EXECUTED,
    Failed_Count: statusCounts.FAILED,
    Pending_Count: statusCounts.PENDING,
    Highest_Priority: highestPriority,
    Execution_Risk_Level: risk.level,
    Execution_Risk_Reason: risk.reason,
    Recommended_Action: recommendedAction,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact980_(statusCounts, sourceRows),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionMonitorNoInput_(outputSheet, businessKey, monitorDate, startedAt) {
  const cfg = SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR;

  const record = {
    Execution_Monitor_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Monitor_Date: monitorDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Execution_Risk_Reason: 'No orchestration queue records were available for the resolved monitor date.',
    Recommended_Action: 'No autonomous processor execution action required.',
    Knowledge_Graph_Impact: 'No new execution-monitor evidence created from source queue inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow980_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionMonitorsCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionMonitorSheet_() {
  const cfg = SCIIP_980_AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects980_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow980_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey980_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipCountExecutionStatuses980_(rows) {
  const counts = {
    READY: 0,
    BLOCKED: 0,
    HOLD: 0,
    EXECUTED: 0,
    FAILED: 0,
    PENDING: 0
  };

  rows.forEach(function(row) {
    const status = sciipResolveQueueStatus980_(row);
    if (counts[status] === undefined) counts.PENDING++;
    else counts[status]++;
  });

  return counts;
}

function sciipResolveQueueStatus980_(row) {
  const raw =
    row.Execution_Status ||
    row.Queue_Status ||
    row.Orchestration_Status ||
    row.Status ||
    '';

  const status = String(raw).trim().toUpperCase();

  if (status.indexOf('READY') >= 0) return 'READY';
  if (status.indexOf('BLOCK') >= 0) return 'BLOCKED';
  if (status.indexOf('HOLD') >= 0) return 'HOLD';
  if (status.indexOf('EXECUT') >= 0 || status.indexOf('COMPLETE') >= 0) return 'EXECUTED';
  if (status.indexOf('FAIL') >= 0 || status.indexOf('ERROR') >= 0) return 'FAILED';

  return 'PENDING';
}

function sciipResolveHighestPriority980_(rows) {
  const rank = {
    CRITICAL: 5,
    HIGH: 4,
    MEDIUM: 3,
    NORMAL: 2,
    LOW: 1,
    NONE: 0
  };

  let highest = 'NONE';

  rows.forEach(function(row) {
    const raw =
      row.Priority ||
      row.Execution_Priority ||
      row.Orchestration_Priority ||
      'NORMAL';

    const priority = String(raw).trim().toUpperCase();

    if ((rank[priority] || 0) > rank[highest]) highest = priority;
  });

  return highest;
}

function sciipResolveExecutionRisk980_(counts, rows) {
  if (counts.FAILED > 0) {
    return {
      level: 'HIGH',
      reason: 'One or more autonomous processor queue items have failed execution status.'
    };
  }

  if (counts.BLOCKED > 0) {
    return {
      level: 'HIGH',
      reason: 'One or more autonomous processor queue items are blocked.'
    };
  }

  if (counts.HOLD > 0) {
    return {
      level: 'MEDIUM',
      reason: 'One or more autonomous processor queue items are on hold.'
    };
  }

  if (counts.READY > 0 && counts.EXECUTED === 0) {
    return {
      level: 'MEDIUM',
      reason: 'Queue contains ready work but no executed items for the monitor date.'
    };
  }

  if (rows.length > 0 && counts.PENDING === rows.length) {
    return {
      level: 'MEDIUM',
      reason: 'All queue items remain pending.'
    };
  }

  return {
    level: 'LOW',
    reason: 'No blocked or failed autonomous processor queue items detected.'
  };
}

function sciipResolveRecommendedExecutionAction980_(risk, counts) {
  if (risk.level === 'HIGH' && counts.FAILED > 0) {
    return 'Review failed autonomous processor queue items before continuing downstream execution.';
  }

  if (risk.level === 'HIGH' && counts.BLOCKED > 0) {
    return 'Resolve blocked autonomous processor dependencies before promotion to execution.';
  }

  if (risk.level === 'MEDIUM' && counts.HOLD > 0) {
    return 'Review held autonomous processor queue items and determine whether to release or defer.';
  }

  if (risk.level === 'MEDIUM') {
    return 'Continue monitoring queue readiness before launching additional autonomous execution.';
  }

  return 'Proceed with downstream autonomous execution monitoring.';
}

function sciipResolveKnowledgeGraphImpact980_(counts, rows) {
  if (rows.length === 0) {
    return 'No autonomous execution state was available to strengthen the knowledge graph.';
  }

  return [
    'Created permanent execution-monitor history for autonomous processor orchestration.',
    'Reviewed ' + rows.length + ' queue item(s).',
    'Ready=' + counts.READY,
    'Blocked=' + counts.BLOCKED,
    'Hold=' + counts.HOLD,
    'Executed=' + counts.EXECUTED,
    'Failed=' + counts.FAILED,
    'Pending=' + counts.PENDING
  ].join(' ');
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionMonitorProcessor() {
  const result = sciipRunAutonomousProcessorExecutionMonitorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionMonitorProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 990_AutonomousProcessorExecutionReadinessProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '990_AutonomousProcessorExecutionReadinessProcessor',
    action: 'AUTONOMOUS_PROCESSOR_EXECUTION_READINESS_BUILD',
    sourceSheet: '',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_READINESSS',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_READINESSS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '990_AutonomousProcessorExecutionReadinessProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionReadinessProcessorLegacy990_();
      return sciipWrapLegacyRuntimeResult990_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult990_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/*******************************************************
 * SCIIP_OS v4.1
 * 990_AutonomousProcessorExecutionReadinessProcessor
 *******************************************************/

const SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS = {
  PROCESSOR: '990_AutonomousProcessorExecutionReadinessProcessor',

  INPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_MONITOR',
  INPUT_DATE_COLUMN: 'Monitor_Date',

  OUTPUT_SHEET: 'AUTONOMOUS_PROCESSOR_EXECUTION_READINESS',

  OUTPUT_HEADERS: [
    'Execution_Readiness_ID',
    'Business_Key',
    'Readiness_Date',
    'Source_Sheet',
    'Source_Date_Column',
    'Source_Row_Count',
    'Monitor_Records_Reviewed',
    'Queue_Items_Reviewed',
    'Ready_Count',
    'Blocked_Count',
    'Hold_Count',
    'Executed_Count',
    'Failed_Count',
    'Pending_Count',
    'Highest_Priority',
    'Execution_Risk_Level',
    'Readiness_Status',
    'Readiness_Decision',
    'Readiness_Reason',
    'Recommended_Action',
    'Knowledge_Graph_Impact',
    'Processor_Status',
    'Created_At',
    'Created_By',
    'Processor'
  ]
};

/**
 * MAIN PROCESSOR
 */
function sciipRunAutonomousProcessorExecutionReadinessProcessorLegacy990_() {
  const cfg = SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS;
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const outputSheet = sciipEnsureAutonomousProcessorExecutionReadinessSheet_();

  const resolvedReadinessDate =
    sciipResolveLatestProcessingDate_(cfg.INPUT_SHEET, cfg.INPUT_DATE_COLUMN)
    || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_READINESS|' + resolvedReadinessDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    return {
      processor: cfg.PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionReadinessCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: startedAt.toISOString()
    };
  }

  const inputSheet = ss.getSheetByName(cfg.INPUT_SHEET);

  if (!inputSheet || inputSheet.getLastRow() < 2) {
    return sciipCreateAutonomousProcessorExecutionReadinessNoInput990_(
      outputSheet,
      businessKey,
      resolvedReadinessDate,
      startedAt
    );
  }

  const rows = sciipReadSheetObjects990_(inputSheet);

  const sourceRows = rows.filter(function(row) {
    return sciipNormalizeDateKey990_(row[cfg.INPUT_DATE_COLUMN]) === resolvedReadinessDate;
  });

  if (sourceRows.length === 0) {
    return sciipCreateAutonomousProcessorExecutionReadinessNoInput990_(
      outputSheet,
      businessKey,
      resolvedReadinessDate,
      startedAt
    );
  }

  const readinessRecord =
    sciipBuildAutonomousProcessorExecutionReadiness990_(
      sourceRows,
      businessKey,
      resolvedReadinessDate,
      startedAt
    );

  outputSheet.appendRow(
    sciipObjectToRow990_(readinessRecord, cfg.OUTPUT_HEADERS)
  );

  return {
    processor: cfg.PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionReadinessCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    readinessDate: resolvedReadinessDate,
    readinessStatus: readinessRecord.Readiness_Status,
    readinessDecision: readinessRecord.Readiness_Decision,
    completedAt: startedAt.toISOString()
  };
}

/**
 * FACTORY
 */
function sciipBuildAutonomousProcessorExecutionReadiness990_(sourceRows, businessKey, readinessDate, startedAt) {
  const cfg = SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS;

  const aggregate = sciipAggregateExecutionMonitorRows990_(sourceRows);
  const decision = sciipResolveExecutionReadinessDecision990_(aggregate);

  return {
    Execution_Readiness_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Readiness_Date: readinessDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: sourceRows.length,
    Monitor_Records_Reviewed: sourceRows.length,
    Queue_Items_Reviewed: aggregate.Queue_Items_Reviewed,
    Ready_Count: aggregate.Ready_Count,
    Blocked_Count: aggregate.Blocked_Count,
    Hold_Count: aggregate.Hold_Count,
    Executed_Count: aggregate.Executed_Count,
    Failed_Count: aggregate.Failed_Count,
    Pending_Count: aggregate.Pending_Count,
    Highest_Priority: aggregate.Highest_Priority,
    Execution_Risk_Level: aggregate.Execution_Risk_Level,
    Readiness_Status: decision.status,
    Readiness_Decision: decision.decision,
    Readiness_Reason: decision.reason,
    Recommended_Action: decision.action,
    Knowledge_Graph_Impact: sciipResolveKnowledgeGraphImpact990_(aggregate, decision),
    Processor_Status: 'SUCCESS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };
}

/**
 * NO INPUT FACTORY
 */
function sciipCreateAutonomousProcessorExecutionReadinessNoInput990_(outputSheet, businessKey, readinessDate, startedAt) {
  const cfg = SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS;

  const record = {
    Execution_Readiness_ID: Utilities.getUuid(),
    Business_Key: businessKey,
    Readiness_Date: readinessDate,
    Source_Sheet: cfg.INPUT_SHEET,
    Source_Date_Column: cfg.INPUT_DATE_COLUMN,
    Source_Row_Count: 0,
    Monitor_Records_Reviewed: 0,
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE',
    Readiness_Status: 'NOT_READY',
    Readiness_Decision: 'DEFER_EXECUTION',
    Readiness_Reason: 'No execution monitor records were available for the resolved readiness date.',
    Recommended_Action: 'Do not advance autonomous processor execution until monitor records exist.',
    Knowledge_Graph_Impact: 'Created permanent readiness history showing no available execution monitor inputs.',
    Processor_Status: 'SKIPPED_NO_INPUTS',
    Created_At: startedAt.toISOString(),
    Created_By: Session.getActiveUser().getEmail(),
    Processor: cfg.PROCESSOR
  };

  outputSheet.appendRow(sciipObjectToRow990_(record, cfg.OUTPUT_HEADERS));

  return {
    processor: cfg.PROCESSOR,
    status: 'SKIPPED_NO_INPUTS',
    autonomousProcessorExecutionReadinessCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    completedAt: startedAt.toISOString()
  };
}

/**
 * HELPERS
 */
function sciipEnsureAutonomousProcessorExecutionReadinessSheet_() {
  const cfg = SCIIP_990_AUTONOMOUS_PROCESSOR_EXECUTION_READINESS;
  const ss = sciipGetSpreadsheet_();

  let sheet = ss.getSheetByName(cfg.OUTPUT_SHEET);
  if (!sheet) sheet = ss.insertSheet(cfg.OUTPUT_SHEET);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cfg.OUTPUT_HEADERS);
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function sciipReadSheetObjects990_(sheet) {
  const values = sheet.getDataRange().getValues();
  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipObjectToRow990_(obj, headers) {
  return headers.map(function(header) {
    return obj[header] !== undefined ? obj[header] : '';
  });
}

function sciipNormalizeDateKey990_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) return sciipFormatDateKey_(parsed);

  return text;
}

function sciipAggregateExecutionMonitorRows990_(rows) {
  const aggregate = {
    Queue_Items_Reviewed: 0,
    Ready_Count: 0,
    Blocked_Count: 0,
    Hold_Count: 0,
    Executed_Count: 0,
    Failed_Count: 0,
    Pending_Count: 0,
    Highest_Priority: 'NONE',
    Execution_Risk_Level: 'NONE'
  };

  rows.forEach(function(row) {
    aggregate.Queue_Items_Reviewed += sciipNumber990_(row.Queue_Items_Reviewed);
    aggregate.Ready_Count += sciipNumber990_(row.Ready_Count);
    aggregate.Blocked_Count += sciipNumber990_(row.Blocked_Count);
    aggregate.Hold_Count += sciipNumber990_(row.Hold_Count);
    aggregate.Executed_Count += sciipNumber990_(row.Executed_Count);
    aggregate.Failed_Count += sciipNumber990_(row.Failed_Count);
    aggregate.Pending_Count += sciipNumber990_(row.Pending_Count);

    aggregate.Highest_Priority = sciipHigherPriority990_(
      aggregate.Highest_Priority,
      row.Highest_Priority
    );

    aggregate.Execution_Risk_Level = sciipHigherRisk990_(
      aggregate.Execution_Risk_Level,
      row.Execution_Risk_Level
    );
  });

  return aggregate;
}

function sciipResolveExecutionReadinessDecision990_(aggregate) {
  if (aggregate.Failed_Count > 0) {
    return {
      status: 'NOT_READY',
      decision: 'DEFER_EXECUTION',
      reason: 'Execution readiness failed because one or more monitored processor queue items failed.',
      action: 'Investigate failed queue items before advancing autonomous processor execution.'
    };
  }

  if (aggregate.Blocked_Count > 0) {
    return {
      status: 'NOT_READY',
      decision: 'DEFER_EXECUTION',
      reason: 'Execution readiness failed because one or more monitored processor queue items are blocked.',
      action: 'Resolve blocked dependencies before downstream autonomous execution.'
    };
  }

  if (aggregate.Hold_Count > 0) {
    return {
      status: 'CONDITIONALLY_READY',
      decision: 'HOLD_FOR_REVIEW',
      reason: 'Execution readiness is conditional because one or more queue items are on hold.',
      action: 'Review held items and either release, defer, or remove them from the execution queue.'
    };
  }

  if (aggregate.Queue_Items_Reviewed === 0) {
    return {
      status: 'NOT_READY',
      decision: 'DEFER_EXECUTION',
      reason: 'No queue items were reviewed by the execution monitor.',
      action: 'Wait for execution monitor records before advancing.'
    };
  }

  if (aggregate.Ready_Count > 0 || aggregate.Executed_Count > 0) {
    return {
      status: 'READY',
      decision: 'ADVANCE_EXECUTION',
      reason: 'Execution monitor shows available ready or executed work with no failed or blocked items.',
      action: 'Advance to downstream autonomous execution control.'
    };
  }

  return {
    status: 'CONDITIONALLY_READY',
    decision: 'CONTINUE_MONITORING',
    reason: 'Queue items exist but no ready or executed work was detected.',
    action: 'Continue monitoring until ready work is available.'
  };
}

function sciipResolveKnowledgeGraphImpact990_(aggregate, decision) {
  return [
    'Created permanent autonomous execution readiness decision history.',
    'Decision=' + decision.decision + '.',
    'Readiness=' + decision.status + '.',
    'Queue items reviewed=' + aggregate.Queue_Items_Reviewed + '.',
    'Ready=' + aggregate.Ready_Count + '.',
    'Blocked=' + aggregate.Blocked_Count + '.',
    'Failed=' + aggregate.Failed_Count + '.',
    'Hold=' + aggregate.Hold_Count + '.'
  ].join(' ');
}

function sciipNumber990_(value) {
  const n = Number(value);
  return isNaN(n) ? 0 : n;
}

function sciipHigherPriority990_(a, b) {
  const rank = {
    NONE: 0,
    LOW: 1,
    NORMAL: 2,
    MEDIUM: 3,
    HIGH: 4,
    CRITICAL: 5
  };

  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

function sciipHigherRisk990_(a, b) {
  const rank = {
    NONE: 0,
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4
  };

  const aa = String(a || 'NONE').trim().toUpperCase();
  const bb = String(b || 'NONE').trim().toUpperCase();

  return (rank[bb] || 0) > (rank[aa] || 0) ? bb : aa;
}

/**
 * TEST
 */
function sciipTestAutonomousProcessorExecutionReadinessProcessor() {
  const result = sciipRunAutonomousProcessorExecutionReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionReadinessProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Bootstrap Processor
 * File: 2480_AutonomousRuntimeBootstrapProcessor.gs
 *
 * Processor: 2480_AutonomousRuntimeBootstrap
 *
 * Purpose:
 * Boots the v5.3 Autonomous Runtime layer after v5.2 Runtime Framework certification.
 * Creates the foundational autonomous runtime control surfaces for dynamic loading,
 * scheduling, dispatching, monitoring, and orchestration.
 */

function sciipRun2480_AutonomousRuntimeBootstrapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2480_AutonomousRuntimeBootstrap',
    action: 'AUTONOMOUS_RUNTIME_BOOTSTRAP',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Autonomous runtime bootstrap payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorCertification: '2470_RuntimeFrameworkCertification',
          runtimeFrameworkVersion: 'v5.2',
          autonomousRuntimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing bootstrap sheet.');
      if (!definition.ledgerSheet) errors.push('Missing bootstrap ledger sheet.');

      if (
        typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined' ||
        typeof SCIIP_RUNTIME_PROCESSOR_BASE.run !== 'function'
      ) {
        errors.push('RuntimeProcessorBase unavailable.');
      }

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined' ||
        typeof SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet !== 'function'
      ) {
        errors.push('RuntimeSheetFactory unavailable.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var bootstrapHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Bootstrap_Status',
        'Runtime_Version',
        'Prior_Framework_Version',
        'Control_Surfaces_Created',
        'Next_Processor',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Result_JSON'
      ];

      var controlSurfaces = [
        'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP',
        'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP_LEDGER',
        'SCIIP_AUTONOMOUS_RUNTIME_CONTROL',
        'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
        'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
        'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
        'SCIIP_AUTONOMOUS_RUNTIME_MONITOR',
        'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_LEDGER'
      ];

      var controlHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Surface_Name',
        'Surface_Type',
        'Status',
        'Notes'
      ];

      controlSurfaces.forEach(function(surfaceName) {
        SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(surfaceName, controlHeaders);
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        bootstrapHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Bootstrap_Status: 'BOOTSTRAPPED',
          Runtime_Version: 'v5.3',
          Prior_Framework_Version: 'v5.2',
          Control_Surfaces_Created: controlSurfaces.join(', '),
          Next_Processor: '2490_AutonomousRuntimeRegistry',
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: controlSurfaces.length,
        message: JSON.stringify({
          bootstrapStatus: 'BOOTSTRAPPED',
          runtimeVersion: 'v5.3',
          controlSurfacesCreated: controlSurfaces.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2490_AutonomousRuntimeRegistry'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'BOOTSTRAP_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          controlSurfaces: controlSurfaces,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 Autonomous Runtime bootstrap completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2480_AutonomousRuntimeBootstrapProcessor() {
  var result = sciipRun2480_AutonomousRuntimeBootstrapProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2480_AutonomousRuntimeBootstrapProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Registry Processor
 * File: 2490_AutonomousRuntimeRegistryProcessor.gs
 *
 * Processor: 2490_AutonomousRuntimeRegistry
 *
 * Purpose:
 * Creates and maintains the v5.3 autonomous runtime registry.
 * This registry is the foundation for dynamic processor loading,
 * dispatch eligibility, scheduling, orchestration, and monitoring.
 */

function sciipRun2490_AutonomousRuntimeRegistryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2490_AutonomousRuntimeRegistry',
    action: 'AUTONOMOUS_RUNTIME_REGISTRY_BUILD',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 10,
        outputCount: 10,
        summary: 'Autonomous runtime registry payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2480_AutonomousRuntimeBootstrap',
          runtimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing runtime registry sheet.');
      if (!definition.ledgerSheet) errors.push('Missing runtime registry ledger sheet.');

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined' ||
        typeof SCIIP_RUNTIME_SHEET_FACTORY.appendObject !== 'function'
      ) {
        errors.push('RuntimeSheetFactory appendObject unavailable.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var registryHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Processor_Category',
        'Runtime_Status',
        'Dispatch_Eligible',
        'Default_Priority',
        'Default_Cadence',
        'Depends_On',
        'Produces',
        'Notes'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Processors_Registered',
        'Result_JSON'
      ];

      var registrySheet = definition.targetSheet;

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        registrySheet,
        registryHeaders
      );

      var registeredProcessors = [
        {
          Processor_Id: '2480',
          Processor_Name: 'AutonomousRuntimeBootstrap',
          Run_Function: 'sciipRun2480_AutonomousRuntimeBootstrapProcessor',
          Test_Function: 'sciipTest2480_AutonomousRuntimeBootstrapProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'ACTIVE',
          Dispatch_Eligible: 'NO',
          Default_Priority: 1,
          Default_Cadence: 'MANUAL',
          Depends_On: '2470_RuntimeFrameworkCertification',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_BOOTSTRAP',
          Notes: 'Bootstraps v5.3 autonomous runtime control surfaces.'
        },
        {
          Processor_Id: '2490',
          Processor_Name: 'AutonomousRuntimeRegistry',
          Run_Function: 'sciipRun2490_AutonomousRuntimeRegistryProcessor',
          Test_Function: 'sciipTest2490_AutonomousRuntimeRegistryProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'ACTIVE',
          Dispatch_Eligible: 'NO',
          Default_Priority: 1,
          Default_Cadence: 'MANUAL',
          Depends_On: '2480_AutonomousRuntimeBootstrap',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
          Notes: 'Creates runtime-discoverable processor registry.'
        },
        {
          Processor_Id: '2500',
          Processor_Name: 'AutonomousRuntimeLoader',
          Run_Function: 'sciipRun2500_AutonomousRuntimeLoaderProcessor',
          Test_Function: 'sciipTest2500_AutonomousRuntimeLoaderProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 2,
          Default_Cadence: 'ON_DEMAND',
          Depends_On: '2490_AutonomousRuntimeRegistry',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
          Notes: 'Loads eligible runtime processors from registry.'
        },
        {
          Processor_Id: '2510',
          Processor_Name: 'AutonomousRuntimeScheduleBuilder',
          Run_Function: 'sciipRun2510_AutonomousRuntimeScheduleBuilderProcessor',
          Test_Function: 'sciipTest2510_AutonomousRuntimeScheduleBuilderProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 3,
          Default_Cadence: 'DAILY',
          Depends_On: '2500_AutonomousRuntimeLoader',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
          Notes: 'Builds dynamic runtime execution schedule.'
        },
        {
          Processor_Id: '2520',
          Processor_Name: 'AutonomousRuntimeDispatchQueue',
          Run_Function: 'sciipRun2520_AutonomousRuntimeDispatchQueueProcessor',
          Test_Function: 'sciipTest2520_AutonomousRuntimeDispatchQueueProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 4,
          Default_Cadence: 'ON_DEMAND',
          Depends_On: '2510_AutonomousRuntimeScheduleBuilder',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
          Notes: 'Creates dispatch queue from dynamic runtime schedule.'
        },
        {
          Processor_Id: '2530',
          Processor_Name: 'AutonomousRuntimeDispatcher',
          Run_Function: 'sciipRun2530_AutonomousRuntimeDispatcherProcessor',
          Test_Function: 'sciipTest2530_AutonomousRuntimeDispatcherProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 5,
          Default_Cadence: 'ON_DEMAND',
          Depends_On: '2520_AutonomousRuntimeDispatchQueue',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER',
          Notes: 'Dispatches queued processor execution by registry metadata.'
        },
        {
          Processor_Id: '2540',
          Processor_Name: 'AutonomousRuntimeMonitor',
          Run_Function: 'sciipRun2540_AutonomousRuntimeMonitorProcessor',
          Test_Function: 'sciipTest2540_AutonomousRuntimeMonitorProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 6,
          Default_Cadence: 'DAILY',
          Depends_On: '2530_AutonomousRuntimeDispatcher',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_MONITOR',
          Notes: 'Monitors dynamic runtime execution health.'
        },
        {
          Processor_Id: '2550',
          Processor_Name: 'AutonomousRuntimeOrchestrator',
          Run_Function: 'sciipRun2550_AutonomousRuntimeOrchestratorProcessor',
          Test_Function: 'sciipTest2550_AutonomousRuntimeOrchestratorProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 7,
          Default_Cadence: 'DAILY',
          Depends_On: '2540_AutonomousRuntimeMonitor',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_LEDGER',
          Notes: 'Coordinates runtime scheduling, dispatch, and monitoring loop.'
        },
        {
          Processor_Id: '2560',
          Processor_Name: 'AutonomousRuntimeGovernance',
          Run_Function: 'sciipRun2560_AutonomousRuntimeGovernanceProcessor',
          Test_Function: 'sciipTest2560_AutonomousRuntimeGovernanceProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'YES',
          Default_Priority: 8,
          Default_Cadence: 'DAILY',
          Depends_On: '2550_AutonomousRuntimeOrchestrator',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_GOVERNANCE',
          Notes: 'Applies autonomous runtime governance and guardrails.'
        },
        {
          Processor_Id: '2570',
          Processor_Name: 'AutonomousRuntimeCertification',
          Run_Function: 'sciipRun2570_AutonomousRuntimeCertificationProcessor',
          Test_Function: 'sciipTest2570_AutonomousRuntimeCertificationProcessor',
          Processor_Category: 'AUTONOMOUS_RUNTIME',
          Runtime_Status: 'PLANNED',
          Dispatch_Eligible: 'NO',
          Default_Priority: 9,
          Default_Cadence: 'MANUAL',
          Depends_On: '2560_AutonomousRuntimeGovernance',
          Produces: 'SCIIP_AUTONOMOUS_RUNTIME_CERTIFICATION',
          Notes: 'Certifies v5.3 Autonomous Runtime.'
        }
      ];

      registeredProcessors.forEach(function(row) {
        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          registrySheet,
          registryHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: 'v5.3',
            Processor_Id: row.Processor_Id,
            Processor_Name: row.Processor_Name,
            Run_Function: row.Run_Function,
            Test_Function: row.Test_Function,
            Processor_Category: row.Processor_Category,
            Runtime_Status: row.Runtime_Status,
            Dispatch_Eligible: row.Dispatch_Eligible,
            Default_Priority: row.Default_Priority,
            Default_Cadence: row.Default_Cadence,
            Depends_On: row.Depends_On,
            Produces: row.Produces,
            Notes: row.Notes
          }
        );
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: registeredProcessors.length,
        processed: registeredProcessors.length,
        message: JSON.stringify({
          runtimeRegistryStatus: 'BUILT',
          runtimeVersion: 'v5.3',
          processorsRegistered: registeredProcessors.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2500_AutonomousRuntimeLoader'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'REGISTRY_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Processors_Registered: registeredProcessors.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          processorsRegistered: registeredProcessors.length,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime registry built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2490_AutonomousRuntimeRegistryProcessor() {
  var result = sciipRun2490_AutonomousRuntimeRegistryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2490_AutonomousRuntimeRegistryProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Loader Processor
 * File: 2500_AutonomousRuntimeLoaderProcessor.gs
 *
 * Processor: 2500_AutonomousRuntimeLoader
 *
 * Purpose:
 * Reads the autonomous runtime registry and creates a runtime load index
 * of processors eligible for dynamic scheduling and dispatch.
 */

function sciipRun2500_AutonomousRuntimeLoaderProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2500_AutonomousRuntimeLoader',
    action: 'AUTONOMOUS_RUNTIME_LOAD_INDEX_BUILD',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX_LEDGER',

    buildPayload: function(context, definition) {
      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: registryRecords.length,
        outputCount: 0,
        summary: 'Autonomous runtime loader payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2490_AutonomousRuntimeRegistry',
          runtimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing registry source sheet.');
      if (!definition.targetSheet) errors.push('Missing load index target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing load index ledger sheet.');

      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!registryRecords || registryRecords.length === 0) {
        errors.push('No runtime registry records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var loadIndexHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Runtime_Status',
        'Dispatch_Eligible',
        'Default_Priority',
        'Default_Cadence',
        'Depends_On',
        'Produces',
        'Load_Status',
        'Load_Reason',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Registry_Records_Read',
        'Processors_Loaded',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        loadIndexHeaders
      );

      var loaded = [];

      registryRecords.forEach(function(record) {
        var dispatchEligible =
          String(record.Dispatch_Eligible || '').toUpperCase() === 'YES';

        var activeOrPlanned = [
          'ACTIVE',
          'PLANNED'
        ].indexOf(String(record.Runtime_Status || '').toUpperCase()) !== -1;

        var hasRunFunction =
          String(record.Run_Function || '').trim() !== '';

        var shouldLoad = dispatchEligible && activeOrPlanned && hasRunFunction;

        var loadStatus = shouldLoad ? 'LOADED' : 'SKIPPED';

        var loadReason = shouldLoad
          ? 'Dispatch eligible and runtime-loadable.'
          : 'Not dispatch eligible, inactive, or missing run function.';

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          loadIndexHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: record.Runtime_Version || 'v5.3',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Runtime_Status: record.Runtime_Status || '',
            Dispatch_Eligible: record.Dispatch_Eligible || '',
            Default_Priority: record.Default_Priority || '',
            Default_Cadence: record.Default_Cadence || '',
            Depends_On: record.Depends_On || '',
            Produces: record.Produces || '',
            Load_Status: loadStatus,
            Load_Reason: loadReason,
            Source_Business_Key: context.businessKey
          }
        );

        if (shouldLoad) {
          loaded.push(record);
        }
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: loaded.length,
        recordsRead: registryRecords.length,
        processed: registryRecords.length,
        message: JSON.stringify({
          runtimeLoaderStatus: 'LOAD_INDEX_BUILT',
          runtimeVersion: 'v5.3',
          registryRecordsRead: registryRecords.length,
          processorsLoaded: loaded.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2510_AutonomousRuntimeScheduleBuilder'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'LOAD_INDEX_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Registry_Records_Read: registryRecords.length,
          Processors_Loaded: loaded.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          registryRecordsRead: registryRecords.length,
          processorsLoaded: loaded.length,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime load index built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2500_AutonomousRuntimeLoaderProcessor() {
  var result = sciipRun2500_AutonomousRuntimeLoaderProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2500_AutonomousRuntimeLoaderProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Schedule Builder Processor
 * File: 2510_AutonomousRuntimeScheduleBuilderProcessor.gs
 *
 * Processor: 2510_AutonomousRuntimeScheduleBuilder
 *
 * Purpose:
 * Reads the autonomous runtime load index and produces a dynamic
 * execution schedule for dispatch-eligible processors.
 */

function sciipRun2510_AutonomousRuntimeScheduleBuilderProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2510_AutonomousRuntimeScheduleBuilder',
    action: 'AUTONOMOUS_RUNTIME_SCHEDULE_BUILD',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE_LEDGER',

    buildPayload: function(context, definition) {
      var loadRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: loadRecords.length,
        outputCount: 0,
        summary: 'Autonomous runtime schedule builder payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2500_AutonomousRuntimeLoader',
          runtimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing load index source sheet.');
      if (!definition.targetSheet) errors.push('Missing runtime schedule target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing runtime schedule ledger sheet.');

      var loadRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!loadRecords || loadRecords.length === 0) {
        errors.push('No runtime load index records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var loadRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var scheduleHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Schedule_Date',
        'Schedule_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Default_Priority',
        'Default_Cadence',
        'Depends_On',
        'Produces',
        'Schedule_Status',
        'Dispatch_Eligible',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Load_Records_Read',
        'Schedule_Items_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        scheduleHeaders
      );

      var scheduleDate = SCIIP_RUNTIME.getDateKey({});
      var scheduled = [];

      loadRecords.forEach(function(record) {
        var loadStatus =
          String(record.Load_Status || '').toUpperCase();

        var dispatchEligible =
          String(record.Dispatch_Eligible || '').toUpperCase() === 'YES';

        var shouldSchedule =
          loadStatus === 'LOADED' && dispatchEligible;

        if (!shouldSchedule) return;

        var scheduleKey = SCIIP_RUNTIME.makeBusinessKey([
          'SCHEDULE',
          record.Processor_Id,
          record.Processor_Name,
          scheduleDate
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          scheduleHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: record.Runtime_Version || 'v5.3',
            Schedule_Date: scheduleDate,
            Schedule_Key: scheduleKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Default_Priority: record.Default_Priority || '',
            Default_Cadence: record.Default_Cadence || '',
            Depends_On: record.Depends_On || '',
            Produces: record.Produces || '',
            Schedule_Status: 'SCHEDULED',
            Dispatch_Eligible: record.Dispatch_Eligible || '',
            Source_Business_Key: context.businessKey
          }
        );

        scheduled.push(record);
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: scheduled.length,
        recordsRead: loadRecords.length,
        processed: loadRecords.length,
        message: JSON.stringify({
          runtimeScheduleStatus: 'SCHEDULE_BUILT',
          runtimeVersion: 'v5.3',
          loadRecordsRead: loadRecords.length,
          scheduleItemsCreated: scheduled.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2520_AutonomousRuntimeDispatchQueue'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'SCHEDULE_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Load_Records_Read: loadRecords.length,
          Schedule_Items_Created: scheduled.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          loadRecordsRead: loadRecords.length,
          scheduleItemsCreated: scheduled.length,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime schedule built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2510_AutonomousRuntimeScheduleBuilderProcessor() {
  var result = sciipRun2510_AutonomousRuntimeScheduleBuilderProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2510_AutonomousRuntimeScheduleBuilderProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Dispatch Queue Processor
 * File: 2520_AutonomousRuntimeDispatchQueueProcessor.gs
 *
 * Processor: 2520_AutonomousRuntimeDispatchQueue
 *
 * Purpose:
 * Reads the autonomous runtime schedule and creates a dispatch queue
 * of scheduled processors ready for future dynamic dispatch.
 */

function sciipRun2520_AutonomousRuntimeDispatchQueueProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2520_AutonomousRuntimeDispatchQueue',
    action: 'AUTONOMOUS_RUNTIME_DISPATCH_QUEUE_BUILD',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE_LEDGER',

    buildPayload: function(context, definition) {
      var scheduleRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: scheduleRecords.length,
        outputCount: 0,
        summary: 'Autonomous runtime dispatch queue payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2510_AutonomousRuntimeScheduleBuilder',
          runtimeVersion: 'v5.3'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing runtime schedule source sheet.');
      if (!definition.targetSheet) errors.push('Missing dispatch queue target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing dispatch queue ledger sheet.');

      var scheduleRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!scheduleRecords || scheduleRecords.length === 0) {
        errors.push('No runtime schedule records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var scheduleRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var queueHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Queue_Date',
        'Queue_Key',
        'Schedule_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Default_Priority',
        'Default_Cadence',
        'Depends_On',
        'Produces',
        'Queue_Status',
        'Dispatch_Attempts',
        'Last_Dispatch_At',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Schedule_Records_Read',
        'Queue_Items_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        queueHeaders
      );

      var queueDate = SCIIP_RUNTIME.getDateKey({});
      var queued = [];

      scheduleRecords.forEach(function(record) {
        var scheduleStatus =
          String(record.Schedule_Status || '').toUpperCase();

        var dispatchEligible =
          String(record.Dispatch_Eligible || '').toUpperCase() === 'YES';

        var hasRunFunction =
          String(record.Run_Function || '').trim() !== '';

        var shouldQueue =
          scheduleStatus === 'SCHEDULED' &&
          dispatchEligible &&
          hasRunFunction;

        if (!shouldQueue) return;

        var queueKey = SCIIP_RUNTIME.makeBusinessKey([
          'QUEUE',
          record.Processor_Id,
          record.Processor_Name,
          queueDate
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          queueHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: record.Runtime_Version || 'v5.3',
            Queue_Date: queueDate,
            Queue_Key: queueKey,
            Schedule_Key: record.Schedule_Key || '',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Default_Priority: record.Default_Priority || '',
            Default_Cadence: record.Default_Cadence || '',
            Depends_On: record.Depends_On || '',
            Produces: record.Produces || '',
            Queue_Status: 'QUEUED',
            Dispatch_Attempts: 0,
            Last_Dispatch_At: '',
            Source_Business_Key: context.businessKey
          }
        );

        queued.push(record);
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: queued.length,
        recordsRead: scheduleRecords.length,
        processed: scheduleRecords.length,
        message: JSON.stringify({
          runtimeDispatchQueueStatus: 'QUEUE_BUILT',
          runtimeVersion: 'v5.3',
          scheduleRecordsRead: scheduleRecords.length,
          queueItemsCreated: queued.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2530_AutonomousRuntimeDispatcher'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DISPATCH_QUEUE_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Schedule_Records_Read: scheduleRecords.length,
          Queue_Items_Created: queued.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          scheduleRecordsRead: scheduleRecords.length,
          queueItemsCreated: queued.length,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime dispatch queue built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2520_AutonomousRuntimeDispatchQueueProcessor() {
  var result = sciipRun2520_AutonomousRuntimeDispatchQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2520_AutonomousRuntimeDispatchQueueProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Dispatcher Processor
 * File: 2530_AutonomousRuntimeDispatcherProcessor.gs
 *
 * Processor: 2530_AutonomousRuntimeDispatcher
 *
 * Purpose:
 * Reads the autonomous runtime dispatch queue and records dry-run
 * dispatch decisions. This is intentionally non-executing until
 * governance and guardrails are certified.
 */

function sciipRun2530_AutonomousRuntimeDispatcherProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2530_AutonomousRuntimeDispatcher',
    action: 'AUTONOMOUS_RUNTIME_DISPATCH_DRY_RUN',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_DECISION_LEDGER',

    buildPayload: function(context, definition) {
      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: queueRecords.length,
        outputCount: 0,
        summary: 'Autonomous runtime dispatcher dry-run payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2520_AutonomousRuntimeDispatchQueue',
          runtimeVersion: 'v5.3',
          dispatchMode: 'DRY_RUN'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing dispatch queue source sheet.');
      if (!definition.targetSheet) errors.push('Missing dispatch ledger target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing dispatch decision ledger sheet.');

      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!queueRecords || queueRecords.length === 0) {
        errors.push('No autonomous runtime dispatch queue records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var dispatchHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Dispatch_Mode',
        'Dispatch_Key',
        'Queue_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Dispatch_Decision',
        'Dispatch_Status',
        'Dispatch_Reason',
        'Default_Priority',
        'Depends_On',
        'Produces',
        'Transaction_Id',
        'Source_Business_Key'
      ];

      var decisionLedgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Queue_Records_Read',
        'Dispatch_Decisions_Created',
        'Dispatches_Executed',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        dispatchHeaders
      );

      var dispatchDate = SCIIP_RUNTIME.getDateKey({});
      var decisionsCreated = 0;
      var dispatchesExecuted = 0;

      queueRecords.forEach(function(record) {
        var queueStatus =
          String(record.Queue_Status || '').toUpperCase();

        var hasRunFunction =
          String(record.Run_Function || '').trim() !== '';

        var dispatchDecision = 'DO_NOT_DISPATCH';
        var dispatchStatus = 'DRY_RUN_SKIPPED';
        var dispatchReason = 'Queue item is not dispatchable.';

        if (queueStatus === 'QUEUED' && hasRunFunction) {
          dispatchDecision = 'DISPATCHABLE';
          dispatchStatus = 'DRY_RUN_RECORDED';
          dispatchReason =
            'Dry-run dispatch decision recorded. Execution intentionally disabled until governance certification.';
        }

        var dispatchKey = SCIIP_RUNTIME.makeBusinessKey([
          'DISPATCH',
          record.Processor_Id,
          record.Processor_Name,
          dispatchDate,
          record.Queue_Key || ''
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          dispatchHeaders,
          {
            Timestamp: new Date(),
            Runtime_Version: record.Runtime_Version || 'v5.3',
            Dispatch_Mode: 'DRY_RUN',
            Dispatch_Key: dispatchKey,
            Queue_Key: record.Queue_Key || '',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Dispatch_Decision: dispatchDecision,
            Dispatch_Status: dispatchStatus,
            Dispatch_Reason: dispatchReason,
            Default_Priority: record.Default_Priority || '',
            Depends_On: record.Depends_On || '',
            Produces: record.Produces || '',
            Transaction_Id: transaction.transactionId,
            Source_Business_Key: context.businessKey
          }
        );

        decisionsCreated++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: decisionsCreated,
        recordsRead: queueRecords.length,
        processed: queueRecords.length,
        message: JSON.stringify({
          runtimeDispatcherStatus: 'DRY_RUN_DISPATCH_DECISIONS_RECORDED',
          runtimeVersion: 'v5.3',
          queueRecordsRead: queueRecords.length,
          dispatchDecisionsCreated: decisionsCreated,
          dispatchesExecuted: dispatchesExecuted,
          executionMode: 'DRY_RUN_ONLY',
          transactionId: transaction.transactionId,
          nextProcessor: '2540_AutonomousRuntimeMonitor'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        decisionLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DISPATCH_DRY_RUN_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Queue_Records_Read: queueRecords.length,
          Dispatch_Decisions_Created: decisionsCreated,
          Dispatches_Executed: dispatchesExecuted,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          queueRecordsRead: queueRecords.length,
          dispatchDecisionsCreated: decisionsCreated,
          dispatchesExecuted: dispatchesExecuted,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime dispatcher dry-run completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2530_AutonomousRuntimeDispatcherProcessor() {
  var result = sciipRun2530_AutonomousRuntimeDispatcherProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2530_AutonomousRuntimeDispatcherProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Monitor Processor
 * File: 2540_AutonomousRuntimeMonitorProcessor.gs
 *
 * Processor: 2540_AutonomousRuntimeMonitor
 *
 * Purpose:
 * Monitors v5.3 autonomous runtime health across registry, load index,
 * schedule, dispatch queue, and dispatch ledger surfaces.
 */

function sciipRun2540_AutonomousRuntimeMonitorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2540_AutonomousRuntimeMonitor',
    action: 'AUTONOMOUS_RUNTIME_MONITOR_BUILD',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_MONITOR',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_MONITOR_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 5,
        outputCount: 1,
        summary: 'Autonomous runtime monitor payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeVersion: 'v5.3',
          monitoredSurfaces: [
            'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
            'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
            'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
            'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
            'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing monitor target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing monitor ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var surfaces = [
        'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
        'SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX',
        'SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE',
        'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE',
        'SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER'
      ];

      var monitorHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor',
        'Business_Key',
        'Monitor_Status',
        'Surfaces_Checked',
        'Total_Records_Observed',
        'Registry_Count',
        'Load_Index_Count',
        'Schedule_Count',
        'Queue_Count',
        'Dispatch_Decision_Count',
        'Health_Summary_JSON',
        'Next_Processor'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Monitor_Status',
        'Result_JSON'
      ];

      var counts = {
        registry: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_REGISTRY').length,
        loadIndex: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_LOAD_INDEX').length,
        schedule: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_SCHEDULE').length,
        queue: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_QUEUE').length,
        dispatch: SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_AUTONOMOUS_RUNTIME_DISPATCH_LEDGER').length
      };

      var total =
        counts.registry +
        counts.loadIndex +
        counts.schedule +
        counts.queue +
        counts.dispatch;

      var monitorStatus = 'HEALTHY';

      if (counts.registry === 0) monitorStatus = 'ATTENTION_REQUIRED';
      if (counts.loadIndex === 0) monitorStatus = 'ATTENTION_REQUIRED';
      if (counts.schedule === 0) monitorStatus = 'ATTENTION_REQUIRED';
      if (counts.queue === 0) monitorStatus = 'ATTENTION_REQUIRED';

      var healthSummary = {
        runtimeVersion: 'v5.3',
        monitorStatus: monitorStatus,
        registryCount: counts.registry,
        loadIndexCount: counts.loadIndex,
        scheduleCount: counts.schedule,
        queueCount: counts.queue,
        dispatchDecisionCount: counts.dispatch,
        executionMode: 'DRY_RUN_MONITORED',
        checkedAt: new Date().toISOString()
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        monitorHeaders,
        {
          Timestamp: new Date(),
          Runtime_Version: 'v5.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Monitor_Status: monitorStatus,
          Surfaces_Checked: surfaces.join(', '),
          Total_Records_Observed: total,
          Registry_Count: counts.registry,
          Load_Index_Count: counts.loadIndex,
          Schedule_Count: counts.schedule,
          Queue_Count: counts.queue,
          Dispatch_Decision_Count: counts.dispatch,
          Health_Summary_JSON: healthSummary,
          Next_Processor: '2550_AutonomousRuntimeOrchestrator'
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: total,
        processed: surfaces.length,
        message: JSON.stringify({
          autonomousRuntimeMonitorStatus: monitorStatus,
          runtimeVersion: 'v5.3',
          surfacesChecked: surfaces.length,
          totalRecordsObserved: total,
          transactionId: transaction.transactionId,
          nextProcessor: '2550_AutonomousRuntimeOrchestrator'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MONITOR_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Monitor_Status: monitorStatus,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          healthSummary: healthSummary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime monitor completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2540_AutonomousRuntimeMonitorProcessor() {
  var result = sciipRun2540_AutonomousRuntimeMonitorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2540_AutonomousRuntimeMonitorProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Orchestrator Processor
 * File: 2550_AutonomousRuntimeOrchestratorProcessor.gs
 *
 * Processor: 2550_AutonomousRuntimeOrchestrator
 *
 * Purpose:
 * Summarizes autonomous runtime state and records the orchestration
 * decision loop without executing dynamic dispatch yet.
 */

function sciipRun2550_AutonomousRuntimeOrchestratorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2550_AutonomousRuntimeOrchestrator',
    action: 'AUTONOMOUS_RUNTIME_ORCHESTRATION_DECISION',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_MONITOR',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_LEDGER',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_DECISION_LEDGER',

    buildPayload: function(context, definition) {
      var monitorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: monitorRecords.length,
        outputCount: 1,
        summary: 'Autonomous runtime orchestrator payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2540_AutonomousRuntimeMonitor',
          runtimeVersion: 'v5.3',
          orchestrationMode: 'DRY_RUN'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing monitor source sheet.');
      if (!definition.targetSheet) errors.push('Missing orchestration ledger target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing orchestration decision ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var monitorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestMonitor =
        monitorRecords && monitorRecords.length
          ? monitorRecords[monitorRecords.length - 1]
          : null;

      var orchestrationHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor',
        'Business_Key',
        'Orchestration_Mode',
        'Monitor_Status',
        'Runtime_Readiness',
        'Orchestration_Decision',
        'Dispatch_Execution_Allowed',
        'Decision_Reason',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var decisionLedgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Runtime_Readiness',
        'Orchestration_Decision',
        'Result_JSON'
      ];

      var monitorStatus = latestMonitor
        ? String(latestMonitor.Monitor_Status || '')
        : 'NO_MONITOR_RECORD';

      var runtimeReadiness = 'READY_FOR_GOVERNANCE_REVIEW';
      var orchestrationDecision = 'CONTINUE_DRY_RUN_MODE';
      var dispatchExecutionAllowed = 'NO';
      var decisionReason =
        'Runtime surfaces are being orchestrated in dry-run mode until governance guardrails are certified.';

      if (monitorStatus === 'ATTENTION_REQUIRED' || monitorStatus === 'NO_MONITOR_RECORD') {
        runtimeReadiness = 'ATTENTION_REQUIRED';
        orchestrationDecision = 'PAUSE_DYNAMIC_EXECUTION';
        dispatchExecutionAllowed = 'NO';
        decisionReason =
          'Runtime monitor indicates attention required or no monitor record is available.';
      }

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        orchestrationHeaders,
        {
          Timestamp: new Date(),
          Runtime_Version: 'v5.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Orchestration_Mode: 'DRY_RUN',
          Monitor_Status: monitorStatus,
          Runtime_Readiness: runtimeReadiness,
          Orchestration_Decision: orchestrationDecision,
          Dispatch_Execution_Allowed: dispatchExecutionAllowed,
          Decision_Reason: decisionReason,
          Next_Processor: '2560_AutonomousRuntimeGovernance',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: monitorRecords.length,
        processed: 1,
        message: JSON.stringify({
          autonomousRuntimeOrchestrationStatus: 'DECISION_RECORDED',
          runtimeVersion: 'v5.3',
          monitorStatus: monitorStatus,
          runtimeReadiness: runtimeReadiness,
          orchestrationDecision: orchestrationDecision,
          dispatchExecutionAllowed: dispatchExecutionAllowed,
          transactionId: transaction.transactionId,
          nextProcessor: '2560_AutonomousRuntimeGovernance'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        decisionLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'ORCHESTRATION_DECISION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Runtime_Readiness: runtimeReadiness,
          Orchestration_Decision: orchestrationDecision,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          monitorStatus: monitorStatus,
          runtimeReadiness: runtimeReadiness,
          orchestrationDecision: orchestrationDecision,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime orchestration decision recorded.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2550_AutonomousRuntimeOrchestratorProcessor() {
  var result = sciipRun2550_AutonomousRuntimeOrchestratorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2550_AutonomousRuntimeOrchestratorProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Governance Processor
 * File: 2560_AutonomousRuntimeGovernanceProcessor.gs
 *
 * Processor: 2560_AutonomousRuntimeGovernance
 *
 * Purpose:
 * Applies governance guardrails to v5.3 Autonomous Runtime.
 * Keeps live dynamic dispatch blocked until explicitly certified.
 */

function sciipRun2560_AutonomousRuntimeGovernanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2560_AutonomousRuntimeGovernance',
    action: 'AUTONOMOUS_RUNTIME_GOVERNANCE_REVIEW',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_ORCHESTRATION_LEDGER',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_GOVERNANCE',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_GOVERNANCE_LEDGER',

    buildPayload: function(context, definition) {
      var orchestrationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: orchestrationRecords.length,
        outputCount: 1,
        summary: 'Autonomous runtime governance payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2550_AutonomousRuntimeOrchestrator',
          runtimeVersion: 'v5.3',
          governanceMode: 'SAFE_DRY_RUN'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing orchestration source sheet.');
      if (!definition.targetSheet) errors.push('Missing governance target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing governance ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var orchestrationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestOrchestration =
        orchestrationRecords && orchestrationRecords.length
          ? orchestrationRecords[orchestrationRecords.length - 1]
          : null;

      var governanceHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor',
        'Business_Key',
        'Governance_Status',
        'Governance_Mode',
        'Live_Dispatch_Allowed',
        'Required_Certification',
        'Orchestration_Decision',
        'Runtime_Readiness',
        'Guardrail_Decision',
        'Guardrail_Reason',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Governance_Status',
        'Live_Dispatch_Allowed',
        'Result_JSON'
      ];

      var orchestrationDecision = latestOrchestration
        ? String(latestOrchestration.Orchestration_Decision || '')
        : 'NO_ORCHESTRATION_RECORD';

      var runtimeReadiness = latestOrchestration
        ? String(latestOrchestration.Runtime_Readiness || '')
        : 'UNKNOWN';

      var governanceStatus = 'GOVERNED';
      var governanceMode = 'SAFE_DRY_RUN';
      var liveDispatchAllowed = 'NO';
      var requiredCertification = '2570_AutonomousRuntimeCertification';
      var guardrailDecision = 'LIVE_EXECUTION_BLOCKED';
      var guardrailReason =
        'Dynamic live dispatch remains blocked until v5.3 autonomous runtime certification explicitly permits live execution.';

      if (runtimeReadiness === 'ATTENTION_REQUIRED') {
        governanceStatus = 'ATTENTION_REQUIRED';
        guardrailDecision = 'LIVE_EXECUTION_BLOCKED_ATTENTION_REQUIRED';
        guardrailReason =
          'Runtime readiness indicates attention required. Live dispatch is blocked.';
      }

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        governanceHeaders,
        {
          Timestamp: new Date(),
          Runtime_Version: 'v5.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Governance_Status: governanceStatus,
          Governance_Mode: governanceMode,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Required_Certification: requiredCertification,
          Orchestration_Decision: orchestrationDecision,
          Runtime_Readiness: runtimeReadiness,
          Guardrail_Decision: guardrailDecision,
          Guardrail_Reason: guardrailReason,
          Next_Processor: '2570_AutonomousRuntimeCertification',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: orchestrationRecords.length,
        processed: 1,
        message: JSON.stringify({
          autonomousRuntimeGovernanceStatus: governanceStatus,
          runtimeVersion: 'v5.3',
          governanceMode: governanceMode,
          liveDispatchAllowed: liveDispatchAllowed,
          guardrailDecision: guardrailDecision,
          transactionId: transaction.transactionId,
          nextProcessor: '2570_AutonomousRuntimeCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'GOVERNANCE_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Governance_Status: governanceStatus,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          governanceStatus: governanceStatus,
          governanceMode: governanceMode,
          liveDispatchAllowed: liveDispatchAllowed,
          guardrailDecision: guardrailDecision,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime governance completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2560_AutonomousRuntimeGovernanceProcessor() {
  var result = sciipRun2560_AutonomousRuntimeGovernanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2560_AutonomousRuntimeGovernanceProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3
 * Autonomous Runtime Certification Processor
 * File: 2570_AutonomousRuntimeCertificationProcessor.gs
 *
 * Processor: 2570_AutonomousRuntimeCertification
 *
 * Purpose:
 * Certifies SCIIP_OS v5.3 Autonomous Runtime as complete in governed
 * dry-run mode. Live dynamic dispatch remains blocked until a future
 * explicit promotion authorizes execution mode.
 */

function sciipRun2570_AutonomousRuntimeCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2570_AutonomousRuntimeCertification',
    action: 'AUTONOMOUS_RUNTIME_CERTIFICATION',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_GOVERNANCE',
    targetSheet: 'SCIIP_AUTONOMOUS_RUNTIME_CERTIFICATION',
    ledgerSheet: 'SCIIP_AUTONOMOUS_RUNTIME_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      var governanceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: governanceRecords.length,
        outputCount: 1,
        summary: 'Autonomous runtime certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2560_AutonomousRuntimeGovernance',
          runtimeVersion: 'v5.3',
          certifiedMode: 'GOVERNED_DRY_RUN',
          liveDispatchAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing governance source sheet.');
      if (!definition.targetSheet) errors.push('Missing certification target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing certification ledger sheet.');

      var governanceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!governanceRecords || governanceRecords.length === 0) {
        errors.push('No governance records available for certification.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var governanceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestGovernance =
        governanceRecords && governanceRecords.length
          ? governanceRecords[governanceRecords.length - 1]
          : null;

      var certificationHeaders = [
        'Timestamp',
        'Runtime_Version',
        'Processor',
        'Business_Key',
        'Certification_Status',
        'Certified_Mode',
        'Live_Dispatch_Allowed',
        'Governance_Status',
        'Guardrail_Decision',
        'Certification_Statement',
        'Next_Phase',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Runtime_Version',
        'Certification_Status',
        'Certified_Mode',
        'Live_Dispatch_Allowed',
        'Result_JSON'
      ];

      var governanceStatus = latestGovernance
        ? String(latestGovernance.Governance_Status || '')
        : 'UNKNOWN';

      var guardrailDecision = latestGovernance
        ? String(latestGovernance.Guardrail_Decision || '')
        : 'UNKNOWN';

      var liveDispatchAllowed = 'NO';
      var certifiedMode = 'GOVERNED_DRY_RUN';
      var certificationStatus = 'CERTIFIED';

      if (governanceStatus === 'ATTENTION_REQUIRED') {
        certificationStatus = 'CERTIFIED_WITH_ATTENTION_REQUIRED';
      }

      var certificationStatement =
        'SCIIP_OS v5.3 Autonomous Runtime is certified as registry-driven, load-indexed, schedule-aware, queue-backed, dry-run dispatch-capable, monitored, orchestrated, and governance-protected. Live dynamic dispatch remains blocked until a future explicit promotion authorizes execution mode.';

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        certificationHeaders,
        {
          Timestamp: new Date(),
          Runtime_Version: 'v5.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Governance_Status: governanceStatus,
          Guardrail_Decision: guardrailDecision,
          Certification_Statement: certificationStatement,
          Next_Phase: 'v5.4 Autonomous Runtime Live Dispatch Promotion',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: governanceRecords.length,
        processed: 1,
        message: JSON.stringify({
          autonomousRuntimeCertificationStatus: certificationStatus,
          runtimeVersion: 'v5.3',
          certifiedMode: certifiedMode,
          liveDispatchAllowed: liveDispatchAllowed,
          governanceStatus: governanceStatus,
          guardrailDecision: guardrailDecision,
          transactionId: transaction.transactionId,
          nextPhase: 'v5.4 Autonomous Runtime Live Dispatch Promotion'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'AUTONOMOUS_RUNTIME_CERTIFICATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Runtime_Version: 'v5.3',
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          certificationStatus: certificationStatus,
          certifiedMode: certifiedMode,
          liveDispatchAllowed: liveDispatchAllowed,
          governanceStatus: governanceStatus,
          guardrailDecision: guardrailDecision,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3 autonomous runtime certification completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2570_AutonomousRuntimeCertificationProcessor() {
  var result = sciipRun2570_AutonomousRuntimeCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2570_AutonomousRuntimeCertificationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.1
 * Runtime Migration Framework Processor
 * File: 2580_RuntimeMigrationFrameworkProcessor.gs
 *
 * Processor: 2580_RuntimeMigrationFramework
 *
 * Purpose:
 * Initializes the processor migration framework for moving legacy SCIIP_OS
 * processors onto SCIIP_RuntimeProcessorBase without enabling live dispatch.
 */

function sciipRun2580_RuntimeMigrationFrameworkProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2580_RuntimeMigrationFramework',
    action: 'RUNTIME_MIGRATION_FRAMEWORK_BOOTSTRAP',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_FRAMEWORK',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_FRAMEWORK_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime migration framework bootstrap payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorPhase: 'v5.3 Autonomous Runtime',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          liveDispatchAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing migration framework sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration framework ledger sheet.');

      if (
        typeof SCIIP_RUNTIME_PROCESSOR_BASE === 'undefined' ||
        typeof SCIIP_RUNTIME_PROCESSOR_BASE.run !== 'function'
      ) {
        errors.push('RuntimeProcessorBase unavailable.');
      }

      if (
        typeof SCIIP_RUNTIME_SHEET_FACTORY === 'undefined' ||
        typeof SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet !== 'function'
      ) {
        errors.push('RuntimeSheetFactory unavailable.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var migrationFrameworkHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Migration_Phase',
        'Framework_Status',
        'Runtime_Base',
        'Live_Dispatch_Allowed',
        'Migration_Control_Surfaces',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Result_JSON'
      ];

      var controlSurfaces = [
        'SCIIP_RUNTIME_MIGRATION_FRAMEWORK',
        'SCIIP_RUNTIME_MIGRATION_FRAMEWORK_LEDGER',
        'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
        'SCIIP_PROCESSOR_MIGRATION_PLAN',
        'SCIIP_PROCESSOR_MIGRATION_QUEUE',
        'SCIIP_PROCESSOR_MIGRATION_LEDGER',
        'SCIIP_PROCESSOR_MIGRATION_VALIDATION',
        'SCIIP_PROCESSOR_MIGRATION_CERTIFICATION'
      ];

      var controlSurfaceHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Surface_Name',
        'Surface_Type',
        'Status',
        'Notes'
      ];

      controlSurfaces.forEach(function(surfaceName) {
        SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
          surfaceName,
          controlSurfaceHeaders
        );
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        migrationFrameworkHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Framework_Status: 'BOOTSTRAPPED',
          Runtime_Base: 'SCIIP_RUNTIME_PROCESSOR_BASE',
          Live_Dispatch_Allowed: 'NO',
          Migration_Control_Surfaces: controlSurfaces.join(', '),
          Next_Processor: '2590_ProcessorMigrationInventory',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: controlSurfaces.length,
        message: JSON.stringify({
          migrationFrameworkStatus: 'BOOTSTRAPPED',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          controlSurfacesCreated: controlSurfaces.length,
          liveDispatchAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2590_ProcessorMigrationInventory'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_FRAMEWORK_BOOTSTRAP_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          controlSurfaces: controlSurfaces,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 runtime migration framework bootstrapped.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2580_RuntimeMigrationFrameworkProcessor() {
  var result = sciipRun2580_RuntimeMigrationFrameworkProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2580_RuntimeMigrationFrameworkProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.1
 * Processor Migration Inventory Processor
 * File: 2590_ProcessorMigrationInventoryProcessor.gs
 *
 * Processor: 2590_ProcessorMigrationInventory
 *
 * Purpose:
 * Inventories runtime-registered processors and classifies their migration
 * readiness for adoption of SCIIP_RuntimeProcessorBase.
 */

function sciipRun2590_ProcessorMigrationInventoryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2590_ProcessorMigrationInventory',
    action: 'PROCESSOR_MIGRATION_INVENTORY_BUILD',
    sourceSheet: 'SCIIP_AUTONOMOUS_RUNTIME_REGISTRY',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_INVENTORY_LEDGER',

    buildPayload: function(context, definition) {
      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: registryRecords.length,
        outputCount: 0,
        summary: 'Processor migration inventory payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2580_RuntimeMigrationFramework',
          migrationPhase: 'v5.3.1 Runtime Refactor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing autonomous runtime registry source sheet.');
      if (!definition.targetSheet) errors.push('Missing processor migration inventory target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing processor migration inventory ledger sheet.');

      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!registryRecords || registryRecords.length === 0) {
        errors.push('No autonomous runtime registry records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var registryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var inventoryHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Processor_Category',
        'Runtime_Status',
        'Dispatch_Eligible',
        'Migration_Status',
        'Migration_Readiness',
        'Migration_Priority',
        'Recommended_Action',
        'Notes',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Registry_Records_Read',
        'Inventory_Items_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        inventoryHeaders
      );

      var inventoryCount = 0;

      registryRecords.forEach(function(record) {
        var processorName = String(record.Processor_Name || '');
        var runtimeStatus = String(record.Runtime_Status || '').toUpperCase();
        var dispatchEligible = String(record.Dispatch_Eligible || '').toUpperCase();
        var runFunction = String(record.Run_Function || '').trim();

        var migrationStatus = 'NEEDS_REVIEW';
        var migrationReadiness = 'UNKNOWN';
        var migrationPriority = 5;
        var recommendedAction = 'Review processor for runtime-base migration.';
        var notes = '';

        if (!runFunction) {
          migrationStatus = 'BLOCKED';
          migrationReadiness = 'MISSING_RUN_FUNCTION';
          migrationPriority = 9;
          recommendedAction = 'Add or verify run function before migration.';
          notes = 'Processor is missing a run function.';
        } else if (runtimeStatus === 'PLANNED') {
          migrationStatus = 'PLANNED';
          migrationReadiness = 'FUTURE_PROCESSOR';
          migrationPriority = 7;
          recommendedAction = 'Implement using SCIIP_RuntimeProcessorBase from inception.';
          notes = 'Planned processor should be born runtime-native.';
        } else if (processorName.indexOf('Runtime') !== -1) {
          migrationStatus = 'ALREADY_RUNTIME_NATIVE';
          migrationReadiness = 'READY';
          migrationPriority = 1;
          recommendedAction = 'No migration required; maintain as runtime-native.';
          notes = 'Runtime framework or autonomous runtime processor.';
        } else if (dispatchEligible === 'NO') {
          migrationStatus = 'LOW_PRIORITY';
          migrationReadiness = 'NOT_DISPATCH_ELIGIBLE';
          migrationPriority = 6;
          recommendedAction = 'Migrate later unless needed by autonomous runtime.';
          notes = 'Processor is not currently dispatch eligible.';
        } else {
          migrationStatus = 'NEEDS_MIGRATION';
          migrationReadiness = 'CANDIDATE';
          migrationPriority = 3;
          recommendedAction = 'Refactor processor to SCIIP_RuntimeProcessorBase.';
          notes = 'Dispatch-eligible processor should be runtime-native before live dispatch.';
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          inventoryHeaders,
          {
            Timestamp: new Date(),
            Migration_Phase: 'v5.3.1 Runtime Refactor',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Processor_Category: record.Processor_Category || '',
            Runtime_Status: record.Runtime_Status || '',
            Dispatch_Eligible: record.Dispatch_Eligible || '',
            Migration_Status: migrationStatus,
            Migration_Readiness: migrationReadiness,
            Migration_Priority: migrationPriority,
            Recommended_Action: recommendedAction,
            Notes: notes,
            Source_Business_Key: context.businessKey
          }
        );

        inventoryCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: inventoryCount,
        recordsRead: registryRecords.length,
        processed: registryRecords.length,
        message: JSON.stringify({
          processorMigrationInventoryStatus: 'BUILT',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          registryRecordsRead: registryRecords.length,
          inventoryItemsCreated: inventoryCount,
          transactionId: transaction.transactionId,
          nextProcessor: '2600_ProcessorMigrationPlan'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_INVENTORY_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Registry_Records_Read: registryRecords.length,
          Inventory_Items_Created: inventoryCount,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          registryRecordsRead: registryRecords.length,
          inventoryItemsCreated: inventoryCount,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration inventory built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2590_ProcessorMigrationInventoryProcessor() {
  var result = sciipRun2590_ProcessorMigrationInventoryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2590_ProcessorMigrationInventoryProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.1
 * Processor Migration Plan Processor
 * File: 2600_ProcessorMigrationPlanProcessor.gs
 *
 * Processor: 2600_ProcessorMigrationPlan
 *
 * Purpose:
 * Converts processor migration inventory into a prioritized migration plan.
 * Does not modify processor code. Produces an execution-ready plan for
 * downstream migration queue processors.
 */

function sciipRun2600_ProcessorMigrationPlanProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2600_ProcessorMigrationPlan',
    action: 'PROCESSOR_MIGRATION_PLAN_BUILD',
    sourceSheet: 'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_PLAN',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_PLAN_LEDGER',

    buildPayload: function(context, definition) {
      var inventoryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: inventoryRecords.length,
        outputCount: 0,
        summary: 'Processor migration plan payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2590_ProcessorMigrationInventory',
          migrationPhase: 'v5.3.1 Runtime Refactor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration inventory source sheet.');
      if (!definition.targetSheet) errors.push('Missing migration plan target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration plan ledger sheet.');

      var inventoryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!inventoryRecords || inventoryRecords.length === 0) {
        errors.push('No processor migration inventory records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var inventoryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var planHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Plan_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Migration_Status',
        'Migration_Readiness',
        'Migration_Priority',
        'Plan_Status',
        'Plan_Order',
        'Recommended_Action',
        'Migration_Strategy',
        'Risk_Level',
        'Requires_Manual_Review',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Inventory_Records_Read',
        'Plan_Items_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        planHeaders
      );

      var sortedRecords = inventoryRecords.slice().sort(function(a, b) {
        var aPriority = Number(a.Migration_Priority || 99);
        var bPriority = Number(b.Migration_Priority || 99);

        if (aPriority !== bPriority) return aPriority - bPriority;

        return String(a.Processor_Id || '').localeCompare(
          String(b.Processor_Id || '')
        );
      });

      var planCount = 0;

      sortedRecords.forEach(function(record, index) {
        var migrationStatus = String(record.Migration_Status || '');
        var migrationReadiness = String(record.Migration_Readiness || '');

        var planStatus = 'PLANNED';
        var migrationStrategy = 'REVIEW_AND_CLASSIFY';
        var riskLevel = 'MEDIUM';
        var requiresManualReview = 'YES';

        if (migrationStatus === 'ALREADY_RUNTIME_NATIVE') {
          planStatus = 'NO_ACTION_REQUIRED';
          migrationStrategy = 'MAINTAIN_RUNTIME_NATIVE';
          riskLevel = 'LOW';
          requiresManualReview = 'NO';
        } else if (migrationStatus === 'PLANNED') {
          planStatus = 'FUTURE_BUILD_STANDARD';
          migrationStrategy = 'BUILD_RUNTIME_NATIVE_FROM_START';
          riskLevel = 'LOW';
          requiresManualReview = 'NO';
        } else if (migrationStatus === 'NEEDS_MIGRATION') {
          planStatus = 'READY_FOR_QUEUE';
          migrationStrategy = 'REFACTOR_TO_RUNTIME_PROCESSOR_BASE';
          riskLevel = 'MEDIUM';
          requiresManualReview = 'YES';
        } else if (migrationStatus === 'LOW_PRIORITY') {
          planStatus = 'DEFERRED';
          migrationStrategy = 'MIGRATE_AFTER_DISPATCH_ELIGIBLE_PROCESSORS';
          riskLevel = 'LOW';
          requiresManualReview = 'YES';
        } else if (migrationStatus === 'BLOCKED') {
          planStatus = 'BLOCKED';
          migrationStrategy = 'RESOLVE_BLOCKER_BEFORE_MIGRATION';
          riskLevel = 'HIGH';
          requiresManualReview = 'YES';
        }

        if (migrationReadiness === 'MISSING_RUN_FUNCTION') {
          riskLevel = 'HIGH';
          requiresManualReview = 'YES';
        }

        var planKey = SCIIP_RUNTIME.makeBusinessKey([
          'MIGRATION_PLAN',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          planHeaders,
          {
            Timestamp: new Date(),
            Migration_Phase: 'v5.3.1 Runtime Refactor',
            Plan_Key: planKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Migration_Status: migrationStatus,
            Migration_Readiness: migrationReadiness,
            Migration_Priority: record.Migration_Priority || '',
            Plan_Status: planStatus,
            Plan_Order: index + 1,
            Recommended_Action: record.Recommended_Action || '',
            Migration_Strategy: migrationStrategy,
            Risk_Level: riskLevel,
            Requires_Manual_Review: requiresManualReview,
            Source_Business_Key: context.businessKey
          }
        );

        planCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: planCount,
        recordsRead: inventoryRecords.length,
        processed: inventoryRecords.length,
        message: JSON.stringify({
          processorMigrationPlanStatus: 'BUILT',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          inventoryRecordsRead: inventoryRecords.length,
          planItemsCreated: planCount,
          transactionId: transaction.transactionId,
          nextProcessor: '2610_ProcessorMigrationQueue'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_PLAN_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Inventory_Records_Read: inventoryRecords.length,
          Plan_Items_Created: planCount,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          inventoryRecordsRead: inventoryRecords.length,
          planItemsCreated: planCount,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration plan built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2600_ProcessorMigrationPlanProcessor() {
  var result = sciipRun2600_ProcessorMigrationPlanProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2600_ProcessorMigrationPlanProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * 260_ActionRecommendationProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert detected opportunities into recommended actions.
 *
 * Input:
 * - OPPORTUNITY
 *
 * Output:
 * - RECOMMENDED_ACTION
 ************************************************************/

const SCIIP_ACTION_RECOMMENDATION_PROCESSOR = '260_ActionRecommendationProcessor';
const SCIIP_RECOMMENDED_ACTION_SHEET = 'RECOMMENDED_ACTION';

const SCIIP_RECOMMENDED_ACTION_HEADERS = [
  'Action_ID',
  'Business_Key',
  'Opportunity_ID',
  'Opportunity_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Action_Type',
  'Recommended_Action',
  'Owner_Role',
  'Priority',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunActionRecommendationProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_RECOMMENDED_ACTION_SHEET, SCIIP_RECOMMENDED_ACTION_HEADERS);

  const opportunitySheet = ss.getSheetByName('OPPORTUNITY');
  const actionSheet = ss.getSheetByName(SCIIP_RECOMMENDED_ACTION_SHEET);

  if (!opportunitySheet) throw new Error('Missing OPPORTUNITY. Run 250 first.');

  const opportunities = sciipReadSheetAsObjects_(opportunitySheet).filter(function(o) {
    return String(o.Status || '').toUpperCase() === 'OPEN';
  });

  const existingKeys = sciipGetExistingColumnValues_(actionSheet, 'Business_Key');

  let opportunitiesReviewed = 0;
  let actionsCreated = 0;
  let skippedDuplicate = 0;

  opportunities.forEach(function(o) {
    opportunitiesReviewed++;

    const action = sciipCreateRecommendedAction_(o);

    if (existingKeys.has(action.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(actionSheet, SCIIP_RECOMMENDED_ACTION_HEADERS, action);
    existingKeys.add(action.Business_Key);
    actionsCreated++;
  });

  const result = {
    processor: SCIIP_ACTION_RECOMMENDATION_PROCESSOR,
    status: 'SUCCESS',
    opportunitiesReviewed: opportunitiesReviewed,
    actionsCreated: actionsCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * ACTION FACTORY
 ************************************************************/

function sciipCreateRecommendedAction_(opportunity) {
  const now = new Date().toISOString();

  const actionType = opportunity.Action_Type || 'REVIEW';
  const actionText = sciipBuildRecommendedActionText_(opportunity);

  const keyBasis = [
    opportunity.Business_Key,
    actionType,
    actionText
  ].join('|');

  const businessKey = 'RECOMMENDED_ACTION|' + sciipStableHash_(keyBasis);

  return {
    Action_ID: 'RA_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Opportunity_ID: opportunity.Opportunity_ID || '',
    Opportunity_Business_Key: opportunity.Business_Key || '',
    Market: opportunity.Market || '',
    Submarket: opportunity.Submarket || '',
    City: opportunity.City || '',
    Industry: opportunity.Industry || '',
    Action_Type: actionType,
    Recommended_Action: actionText,
    Owner_Role: sciipOwnerRoleForAction_(actionType),
    Priority: opportunity.Priority || 'MEDIUM',
    Confidence: sciipNormalizeConfidence_(opportunity.Confidence),
    Status: 'OPEN',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_ACTION_RECOMMENDATION_PROCESSOR,
    Notes: 'Generated from detected SCIIP opportunity.'
  };
}

/************************************************************
 * ACTION TEXT
 ************************************************************/

function sciipBuildRecommendedActionText_(o) {
  const location = o.City || o.Submarket || o.Market || 'the market';
  const actionType = String(o.Action_Type || '').toUpperCase();

  if (actionType === 'BROKER_REVIEW_RENT_POSITION') {
    return 'Review current asking rents, competing availabilities, and recent activity in ' + location + ' to determine whether lease pricing should be adjusted.';
  }

  if (actionType === 'TARGET_ADVANCED_MANUFACTURING_REQUIREMENTS') {
    return 'Identify and prioritize advanced manufacturing, aerospace, defense, robotics, and autonomy requirements active in or near ' + location + '.';
  }

  if (actionType === 'MAP_AND_TARGET_CLUSTER') {
    return 'Map the active cluster in ' + location + ', identify nearby tenants and suppliers, and create a targeted outreach list.';
  }

  if (actionType === 'PRIORITIZE_MARKET_OUTREACH') {
    return 'Prioritize broker, owner, and tenant outreach in ' + location + ' based on elevated SCIIP activity signals.';
  }

  return 'Review the opportunity in ' + location + ' and determine whether broker action, owner advisory, or tenant outreach is warranted.';
}

function sciipOwnerRoleForAction_(actionType) {
  const t = String(actionType || '').toUpperCase();

  if (t === 'BROKER_REVIEW_RENT_POSITION') return 'Leasing Broker';
  if (t === 'TARGET_ADVANCED_MANUFACTURING_REQUIREMENTS') return 'Tenant Rep / Market Research';
  if (t === 'MAP_AND_TARGET_CLUSTER') return 'GIS / Market Research';
  if (t === 'PRIORITIZE_MARKET_OUTREACH') return 'Brokerage Team';

  return 'Research Lead';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestActionRecommendationProcessor() {
  const result = sciipRunActionRecommendationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionRecommendationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.1
 * Processor Migration Queue Processor
 * File: 2610_ProcessorMigrationQueueProcessor.gs
 *
 * Processor: 2610_ProcessorMigrationQueue
 *
 * Purpose:
 * Converts the processor migration plan into a safe migration queue.
 * Only queues safe categories:
 * READY_FOR_QUEUE, FUTURE_BUILD_STANDARD, NO_ACTION_REQUIRED.
 * Blocked and deferred items remain excluded.
 */

function sciipRun2610_ProcessorMigrationQueueProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2610_ProcessorMigrationQueue',
    action: 'PROCESSOR_MIGRATION_QUEUE_BUILD',
    sourceSheet: 'SCIIP_PROCESSOR_MIGRATION_PLAN',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_QUEUE',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_QUEUE_LEDGER',

    buildPayload: function(context, definition) {
      var planRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: planRecords.length,
        outputCount: 0,
        summary: 'Processor migration queue payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2600_ProcessorMigrationPlan',
          migrationPhase: 'v5.3.1 Runtime Refactor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration plan source sheet.');
      if (!definition.targetSheet) errors.push('Missing migration queue target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration queue ledger sheet.');

      var planRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!planRecords || planRecords.length === 0) {
        errors.push('No processor migration plan records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var planRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var queueHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Queue_Key',
        'Plan_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Plan_Status',
        'Migration_Strategy',
        'Migration_Priority',
        'Plan_Order',
        'Queue_Status',
        'Queue_Reason',
        'Risk_Level',
        'Requires_Manual_Review',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Plan_Records_Read',
        'Queue_Items_Created',
        'Items_Excluded',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        queueHeaders
      );

      var queueableStatuses = [
        'READY_FOR_QUEUE',
        'FUTURE_BUILD_STANDARD',
        'NO_ACTION_REQUIRED'
      ];

      var queuedCount = 0;
      var excludedCount = 0;

      planRecords.forEach(function(record) {
        var planStatus = String(record.Plan_Status || '').toUpperCase();

        var shouldQueue = queueableStatuses.indexOf(planStatus) !== -1;

        if (!shouldQueue) {
          excludedCount++;
          return;
        }

        var queueKey = SCIIP_RUNTIME.makeBusinessKey([
          'MIGRATION_QUEUE',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        var queueStatus = 'QUEUED';
        var queueReason = 'Processor migration item queued.';

        if (planStatus === 'NO_ACTION_REQUIRED') {
          queueStatus = 'RECORDED_NO_ACTION_REQUIRED';
          queueReason = 'Processor already runtime-native; recorded for completeness.';
        }

        if (planStatus === 'FUTURE_BUILD_STANDARD') {
          queueStatus = 'RECORDED_FUTURE_STANDARD';
          queueReason = 'Future processor should be built runtime-native from inception.';
        }

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          queueHeaders,
          {
            Timestamp: new Date(),
            Migration_Phase: 'v5.3.1 Runtime Refactor',
            Queue_Key: queueKey,
            Plan_Key: record.Plan_Key || '',
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Plan_Status: record.Plan_Status || '',
            Migration_Strategy: record.Migration_Strategy || '',
            Migration_Priority: record.Migration_Priority || '',
            Plan_Order: record.Plan_Order || '',
            Queue_Status: queueStatus,
            Queue_Reason: queueReason,
            Risk_Level: record.Risk_Level || '',
            Requires_Manual_Review: record.Requires_Manual_Review || '',
            Source_Business_Key: context.businessKey
          }
        );

        queuedCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: queuedCount,
        recordsRead: planRecords.length,
        processed: planRecords.length,
        message: JSON.stringify({
          processorMigrationQueueStatus: 'BUILT',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          planRecordsRead: planRecords.length,
          queueItemsCreated: queuedCount,
          itemsExcluded: excludedCount,
          transactionId: transaction.transactionId,
          nextProcessor: '2620_ProcessorMigrationLedger'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_QUEUE_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Plan_Records_Read: planRecords.length,
          Queue_Items_Created: queuedCount,
          Items_Excluded: excludedCount,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          planRecordsRead: planRecords.length,
          queueItemsCreated: queuedCount,
          itemsExcluded: excludedCount,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration queue built.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2610_ProcessorMigrationQueueProcessor() {
  var result = sciipRun2610_ProcessorMigrationQueueProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2610_ProcessorMigrationQueueProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.1
 * Processor Migration Ledger Processor
 * File: 2620_ProcessorMigrationLedgerProcessor.gs
 *
 * Processor: 2620_ProcessorMigrationLedger
 *
 * Purpose:
 * Creates a permanent roll-up ledger summary of the runtime migration
 * framework, inventory, plan, and queue surfaces.
 */

function sciipRun2620_ProcessorMigrationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2620_ProcessorMigrationLedger',
    action: 'PROCESSOR_MIGRATION_LEDGER_BUILD',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_LEDGER',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_LEDGER_AUDIT',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 4,
        outputCount: 1,
        summary: 'Processor migration ledger payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2610_ProcessorMigrationQueue',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          sourceSurfaces: [
            'SCIIP_RUNTIME_MIGRATION_FRAMEWORK',
            'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
            'SCIIP_PROCESSOR_MIGRATION_PLAN',
            'SCIIP_PROCESSOR_MIGRATION_QUEUE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing processor migration ledger target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing processor migration ledger audit sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var frameworkRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_RUNTIME_MIGRATION_FRAMEWORK');

      var inventoryRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_MIGRATION_INVENTORY');

      var planRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_MIGRATION_PLAN');

      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_MIGRATION_QUEUE');

      var ledgerHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Framework_Records',
        'Inventory_Records',
        'Plan_Records',
        'Queue_Records',
        'Already_Runtime_Native',
        'Needs_Migration',
        'Planned_Runtime_Native',
        'Blocked',
        'Deferred',
        'Queued',
        'No_Action_Required',
        'Future_Build_Standard',
        'Summary_JSON',
        'Next_Processor',
        'Transaction_Id'
      ];

      var auditHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Audit_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Result_JSON'
      ];

      function countWhere(records, field, expected) {
        return records.filter(function(record) {
          return String(record[field] || '').toUpperCase() === expected;
        }).length;
      }

      var alreadyRuntimeNative =
        countWhere(inventoryRecords, 'Migration_Status', 'ALREADY_RUNTIME_NATIVE');

      var needsMigration =
        countWhere(inventoryRecords, 'Migration_Status', 'NEEDS_MIGRATION');

      var plannedRuntimeNative =
        countWhere(inventoryRecords, 'Migration_Status', 'PLANNED');

      var blocked =
        countWhere(inventoryRecords, 'Migration_Status', 'BLOCKED');

      var deferred =
        countWhere(planRecords, 'Plan_Status', 'DEFERRED');

      var queued =
        countWhere(queueRecords, 'Queue_Status', 'QUEUED');

      var noActionRequired =
        countWhere(queueRecords, 'Queue_Status', 'RECORDED_NO_ACTION_REQUIRED');

      var futureBuildStandard =
        countWhere(queueRecords, 'Queue_Status', 'RECORDED_FUTURE_STANDARD');

      var summary = {
        migrationPhase: 'v5.3.1 Runtime Refactor',
        frameworkRecords: frameworkRecords.length,
        inventoryRecords: inventoryRecords.length,
        planRecords: planRecords.length,
        queueRecords: queueRecords.length,
        alreadyRuntimeNative: alreadyRuntimeNative,
        needsMigration: needsMigration,
        plannedRuntimeNative: plannedRuntimeNative,
        blocked: blocked,
        deferred: deferred,
        queued: queued,
        noActionRequired: noActionRequired,
        futureBuildStandard: futureBuildStandard,
        liveDispatchAllowed: 'NO',
        summarizedAt: new Date().toISOString()
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_LEDGER_SUMMARY_RECORDED',
          Framework_Records: frameworkRecords.length,
          Inventory_Records: inventoryRecords.length,
          Plan_Records: planRecords.length,
          Queue_Records: queueRecords.length,
          Already_Runtime_Native: alreadyRuntimeNative,
          Needs_Migration: needsMigration,
          Planned_Runtime_Native: plannedRuntimeNative,
          Blocked: blocked,
          Deferred: deferred,
          Queued: queued,
          No_Action_Required: noActionRequired,
          Future_Build_Standard: futureBuildStandard,
          Summary_JSON: summary,
          Next_Processor: '2630_ProcessorMigrationValidation',
          Transaction_Id: transaction.transactionId
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead:
          frameworkRecords.length +
          inventoryRecords.length +
          planRecords.length +
          queueRecords.length,
        processed: 4,
        message: JSON.stringify({
          processorMigrationLedgerStatus: 'SUMMARY_RECORDED',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          summary: summary,
          transactionId: transaction.transactionId,
          nextProcessor: '2630_ProcessorMigrationValidation'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        auditHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Audit_Status: 'MIGRATION_LEDGER_AUDIT_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration ledger summary recorded.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2620_ProcessorMigrationLedgerProcessor() {
  var result = sciipRun2620_ProcessorMigrationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2620_ProcessorMigrationLedgerProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.1
 * Processor Migration Validation Processor
 * File: 2630_ProcessorMigrationValidationProcessor.gs
 *
 * Processor: 2630_ProcessorMigrationValidation
 *
 * Purpose:
 * Validates the processor migration framework outputs and confirms
 * safety constraints before certification.
 */

function sciipRun2630_ProcessorMigrationValidationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2630_ProcessorMigrationValidation',
    action: 'PROCESSOR_MIGRATION_VALIDATION',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_VALIDATION',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_VALIDATION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 5,
        outputCount: 1,
        summary: 'Processor migration validation payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2620_ProcessorMigrationLedger',
          migrationPhase: 'v5.3.1 Runtime Refactor'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing validation target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing validation ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var requiredSurfaces = [
        'SCIIP_RUNTIME_MIGRATION_FRAMEWORK',
        'SCIIP_PROCESSOR_MIGRATION_INVENTORY',
        'SCIIP_PROCESSOR_MIGRATION_PLAN',
        'SCIIP_PROCESSOR_MIGRATION_QUEUE',
        'SCIIP_PROCESSOR_MIGRATION_LEDGER'
      ];

      var validationHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Processor',
        'Business_Key',
        'Validation_Status',
        'Surfaces_Checked',
        'Missing_Surfaces',
        'Blocked_Items_In_Queue',
        'Deferred_Items_In_Queue',
        'Live_Dispatch_Allowed',
        'Validation_Summary_JSON',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Validation_Status',
        'Result_JSON'
      ];

      var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();
      var missingSurfaces = [];

      requiredSurfaces.forEach(function(surfaceName) {
        if (!ss.getSheetByName(surfaceName)) {
          missingSurfaces.push(surfaceName);
        }
      });

      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_MIGRATION_QUEUE');

      var blockedItemsInQueue = queueRecords.filter(function(record) {
        return String(record.Plan_Status || '').toUpperCase() === 'BLOCKED';
      }).length;

      var deferredItemsInQueue = queueRecords.filter(function(record) {
        return String(record.Plan_Status || '').toUpperCase() === 'DEFERRED';
      }).length;

      var liveDispatchAllowed = 'NO';

      var validationStatus = 'PASSED';

      if (
        missingSurfaces.length > 0 ||
        blockedItemsInQueue > 0 ||
        deferredItemsInQueue > 0 ||
        liveDispatchAllowed !== 'NO'
      ) {
        validationStatus = 'FAILED';
      }

      var validationSummary = {
        migrationPhase: 'v5.3.1 Runtime Refactor',
        validationStatus: validationStatus,
        surfacesChecked: requiredSurfaces.length,
        missingSurfaces: missingSurfaces,
        blockedItemsInQueue: blockedItemsInQueue,
        deferredItemsInQueue: deferredItemsInQueue,
        liveDispatchAllowed: liveDispatchAllowed,
        validatedAt: new Date().toISOString()
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        validationHeaders,
        {
          Timestamp: new Date(),
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Validation_Status: validationStatus,
          Surfaces_Checked: requiredSurfaces.join(', '),
          Missing_Surfaces: missingSurfaces.join(', '),
          Blocked_Items_In_Queue: blockedItemsInQueue,
          Deferred_Items_In_Queue: deferredItemsInQueue,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Validation_Summary_JSON: validationSummary,
          Next_Processor: '2640_ProcessorMigrationCertification',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        processed: requiredSurfaces.length,
        message: JSON.stringify({
          processorMigrationValidationStatus: validationStatus,
          migrationPhase: 'v5.3.1 Runtime Refactor',
          missingSurfaces: missingSurfaces.length,
          blockedItemsInQueue: blockedItemsInQueue,
          deferredItemsInQueue: deferredItemsInQueue,
          liveDispatchAllowed: liveDispatchAllowed,
          transactionId: transaction.transactionId,
          nextProcessor: '2640_ProcessorMigrationCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_VALIDATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Validation_Status: validationStatus,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          validationSummary: validationSummary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration validation completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2630_ProcessorMigrationValidationProcessor() {
  var result = sciipRun2630_ProcessorMigrationValidationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2630_ProcessorMigrationValidationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.1
 * Processor Migration Certification Processor
 * File: 2640_ProcessorMigrationCertificationProcessor.gs
 *
 * Processor: 2640_ProcessorMigrationCertification
 *
 * Purpose:
 * Certifies v5.3.1 as a safe processor migration planning framework.
 * No live dispatch is enabled. No legacy processor code is automatically modified.
 */

function sciipRun2640_ProcessorMigrationCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2640_ProcessorMigrationCertification',
    action: 'PROCESSOR_MIGRATION_CERTIFICATION',
    sourceSheet: 'SCIIP_PROCESSOR_MIGRATION_VALIDATION',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_CERTIFICATION',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      var validationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: validationRecords.length,
        outputCount: 1,
        summary: 'Processor migration certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2630_ProcessorMigrationValidation',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          liveDispatchAllowed: 'NO',
          automaticCodeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing validation source sheet.');
      if (!definition.targetSheet) errors.push('Missing certification target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing certification ledger sheet.');

      var validationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!validationRecords || validationRecords.length === 0) {
        errors.push('No migration validation records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var validationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestValidation =
        validationRecords && validationRecords.length
          ? validationRecords[validationRecords.length - 1]
          : null;

      var validationStatus = latestValidation
        ? String(latestValidation.Validation_Status || '')
        : 'UNKNOWN';

      var certificationStatus =
        validationStatus === 'PASSED'
          ? 'CERTIFIED'
          : 'CERTIFIED_WITH_ATTENTION_REQUIRED';

      var liveDispatchAllowed = 'NO';
      var automaticCodeModificationAllowed = 'NO';
      var certifiedMode = 'MIGRATION_PLANNING_ONLY';

      var certificationStatement =
        'SCIIP_OS v5.3.1 Runtime Refactor is certified as a safe migration planning and control framework. It inventories, plans, queues, validates, and records processor migration readiness. It does not enable live dynamic dispatch and does not automatically modify legacy processor code.';

      var certificationHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Processor',
        'Business_Key',
        'Certification_Status',
        'Certified_Mode',
        'Validation_Status',
        'Live_Dispatch_Allowed',
        'Automatic_Code_Modification_Allowed',
        'Certification_Statement',
        'Next_Phase',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Certification_Status',
        'Certified_Mode',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        certificationHeaders,
        {
          Timestamp: new Date(),
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Validation_Status: validationStatus,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Automatic_Code_Modification_Allowed: automaticCodeModificationAllowed,
          Certification_Statement: certificationStatement,
          Next_Phase: 'v5.3.2 Manual Runtime Processor Migration',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: validationRecords.length,
        processed: 1,
        message: JSON.stringify({
          processorMigrationCertificationStatus: certificationStatus,
          migrationPhase: 'v5.3.1 Runtime Refactor',
          certifiedMode: certifiedMode,
          validationStatus: validationStatus,
          liveDispatchAllowed: liveDispatchAllowed,
          automaticCodeModificationAllowed: automaticCodeModificationAllowed,
          transactionId: transaction.transactionId,
          nextPhase: 'v5.3.2 Manual Runtime Processor Migration'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_CERTIFICATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          certificationStatus: certificationStatus,
          certifiedMode: certifiedMode,
          validationStatus: validationStatus,
          liveDispatchAllowed: liveDispatchAllowed,
          automaticCodeModificationAllowed: automaticCodeModificationAllowed,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration certification completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2640_ProcessorMigrationCertificationProcessor() {
  var result = sciipRun2640_ProcessorMigrationCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2640_ProcessorMigrationCertificationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.3
 * Processor Analyzer Processor
 * File: 2650_ProcessorAnalyzerProcessor.gs
 *
 * Processor: 2650_ProcessorAnalyzer
 *
 * Purpose:
 * Analyzes processor migration queue records and determines whether each
 * processor is suitable for automated runtime migration, manual migration,
 * no-action recording, or future runtime-native build.
 *
 * This processor does not modify code.
 */

function sciipRun2650_ProcessorAnalyzerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2650_ProcessorAnalyzer',
    action: 'PROCESSOR_ANALYZER_RUN',
    sourceSheet: 'SCIIP_PROCESSOR_MIGRATION_QUEUE',
    targetSheet: 'SCIIP_PROCESSOR_ANALYZER',
    ledgerSheet: 'SCIIP_PROCESSOR_ANALYZER_LEDGER',

    buildPayload: function(context, definition) {
      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: queueRecords.length,
        outputCount: 0,
        summary: 'Processor analyzer payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationToolkitVersion: 'v5.3.3',
          priorPhase: 'v5.3.2 Runtime Processor Migration'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration queue source sheet.');
      if (!definition.targetSheet) errors.push('Missing processor analyzer target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing processor analyzer ledger sheet.');

      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!queueRecords || queueRecords.length === 0) {
        errors.push('No processor migration queue records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var analyzerHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Analysis_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Queue_Status',
        'Plan_Status',
        'Migration_Strategy',
        'Risk_Level',
        'Requires_Manual_Review',
        'Analyzer_Status',
        'Automation_Eligibility',
        'Recommended_Migration_Mode',
        'Detected_Patterns',
        'Blockers',
        'Next_Action',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Queue_Records_Read',
        'Analysis_Items_Created',
        'Automation_Candidates',
        'Manual_Review_Items',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        analyzerHeaders
      );

      var analysisCount = 0;
      var automationCandidates = 0;
      var manualReviewItems = 0;

      queueRecords.forEach(function(record) {
        var queueStatus = String(record.Queue_Status || '').toUpperCase();
        var planStatus = String(record.Plan_Status || '').toUpperCase();
        var migrationStrategy = String(record.Migration_Strategy || '').toUpperCase();
        var riskLevel = String(record.Risk_Level || '').toUpperCase();
        var requiresManualReview = String(record.Requires_Manual_Review || '').toUpperCase();
        var runFunction = String(record.Run_Function || '').trim();
        var testFunction = String(record.Test_Function || '').trim();

        var analyzerStatus = 'ANALYZED';
        var automationEligibility = 'MANUAL_REVIEW_REQUIRED';
        var recommendedMigrationMode = 'MANUAL_RUNTIME_MIGRATION';
        var detectedPatterns = [];
        var blockers = [];
        var nextAction = 'Review processor manually before migration.';

        if (!runFunction) {
          analyzerStatus = 'BLOCKED';
          automationEligibility = 'NOT_ELIGIBLE';
          recommendedMigrationMode = 'BLOCKED';
          blockers.push('Missing run function.');
          nextAction = 'Add run function before migration analysis.';
        } else {
          detectedPatterns.push('RUN_FUNCTION_PRESENT');
        }

        if (testFunction) {
          detectedPatterns.push('TEST_FUNCTION_PRESENT');
        } else {
          blockers.push('Missing test function.');
        }

        if (queueStatus === 'RECORDED_NO_ACTION_REQUIRED') {
          automationEligibility = 'NO_ACTION_REQUIRED';
          recommendedMigrationMode = 'RECORD_ONLY';
          nextAction = 'No migration needed; processor already runtime-native.';
        } else if (queueStatus === 'RECORDED_FUTURE_STANDARD') {
          automationEligibility = 'FUTURE_RUNTIME_NATIVE';
          recommendedMigrationMode = 'BUILD_RUNTIME_NATIVE_FROM_START';
          nextAction = 'Use RuntimeProcessorBase when this planned processor is implemented.';
        } else if (
          queueStatus === 'QUEUED' &&
          planStatus === 'READY_FOR_QUEUE' &&
          migrationStrategy === 'REFACTOR_TO_RUNTIME_PROCESSOR_BASE' &&
          riskLevel !== 'HIGH'
        ) {
          automationEligibility = 'PARTIAL_AUTOMATION_CANDIDATE';
          recommendedMigrationMode = 'GENERATE_RUNTIME_SKELETON_FOR_REVIEW';
          nextAction = 'Generate runtime-native skeleton and require manual approval.';
          automationCandidates++;
        } else {
          manualReviewItems++;
        }

        if (requiresManualReview === 'YES') {
          detectedPatterns.push('MANUAL_REVIEW_REQUIRED');
        }

        if (riskLevel === 'HIGH') {
          blockers.push('High-risk migration item.');
          automationEligibility = 'NOT_ELIGIBLE';
          recommendedMigrationMode = 'MANUAL_HIGH_RISK_REVIEW';
          nextAction = 'Manual architecture review required before migration.';
        }

        var analysisKey = SCIIP_RUNTIME.makeBusinessKey([
          'PROCESSOR_ANALYSIS',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          analyzerHeaders,
          {
            Timestamp: new Date(),
            Toolkit_Version: 'v5.3.3',
            Analysis_Key: analysisKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Queue_Status: record.Queue_Status || '',
            Plan_Status: record.Plan_Status || '',
            Migration_Strategy: record.Migration_Strategy || '',
            Risk_Level: record.Risk_Level || '',
            Requires_Manual_Review: record.Requires_Manual_Review || '',
            Analyzer_Status: analyzerStatus,
            Automation_Eligibility: automationEligibility,
            Recommended_Migration_Mode: recommendedMigrationMode,
            Detected_Patterns: detectedPatterns.join(', '),
            Blockers: blockers.join(', '),
            Next_Action: nextAction,
            Source_Business_Key: context.businessKey
          }
        );

        analysisCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: analysisCount,
        recordsRead: queueRecords.length,
        processed: queueRecords.length,
        message: JSON.stringify({
          processorAnalyzerStatus: 'ANALYSIS_COMPLETED',
          toolkitVersion: 'v5.3.3',
          queueRecordsRead: queueRecords.length,
          analysisItemsCreated: analysisCount,
          automationCandidates: automationCandidates,
          manualReviewItems: manualReviewItems,
          transactionId: transaction.transactionId,
          nextProcessor: '2660_RuntimeMigrationGenerator'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'PROCESSOR_ANALYSIS_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Queue_Records_Read: queueRecords.length,
          Analysis_Items_Created: analysisCount,
          Automation_Candidates: automationCandidates,
          Manual_Review_Items: manualReviewItems,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          queueRecordsRead: queueRecords.length,
          analysisItemsCreated: analysisCount,
          automationCandidates: automationCandidates,
          manualReviewItems: manualReviewItems,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 processor analyzer completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2650_ProcessorAnalyzerProcessor() {
  var result = sciipRun2650_ProcessorAnalyzerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2650_ProcessorAnalyzerProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.3
 * Runtime Migration Generator Processor
 * File: 2660_RuntimeMigrationGeneratorProcessor.gs
 *
 * Processor: 2660_RuntimeMigrationGenerator
 *
 * Purpose:
 * Generates review-only runtime migration skeleton records for eligible
 * processor analyzer items. Does not modify code or replace processors.
 */

function sciipRun2660_RuntimeMigrationGeneratorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2660_RuntimeMigrationGenerator',
    action: 'RUNTIME_MIGRATION_GENERATOR_RUN',
    sourceSheet: 'SCIIP_PROCESSOR_ANALYZER',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_GENERATOR',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_GENERATOR_LEDGER',

    buildPayload: function(context, definition) {
      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: analysisRecords.length,
        outputCount: 0,
        summary: 'Runtime migration generator payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationToolkitVersion: 'v5.3.3',
          priorProcessor: '2650_ProcessorAnalyzer',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing analyzer source sheet.');
      if (!definition.targetSheet) errors.push('Missing migration generator target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration generator ledger sheet.');

      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!analysisRecords || analysisRecords.length === 0) {
        errors.push('No processor analyzer records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var generatorHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Generation_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Automation_Eligibility',
        'Recommended_Migration_Mode',
        'Generation_Status',
        'Generation_Reason',
        'Proposed_File_Name',
        'Proposed_Run_Function',
        'Proposed_Test_Function',
        'Generated_Skeleton_Code',
        'Requires_Approval',
        'Code_Modification_Allowed',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Analysis_Records_Read',
        'Skeletons_Generated',
        'Items_Skipped',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        generatorHeaders
      );

      var skeletonsGenerated = 0;
      var itemsSkipped = 0;

      analysisRecords.forEach(function(record) {
        var eligibility = String(record.Automation_Eligibility || '').toUpperCase();
        var migrationMode = String(record.Recommended_Migration_Mode || '').toUpperCase();

        var shouldGenerate =
          eligibility === 'PARTIAL_AUTOMATION_CANDIDATE' &&
          migrationMode === 'GENERATE_RUNTIME_SKELETON_FOR_REVIEW';

        var generationStatus = shouldGenerate
          ? 'SKELETON_GENERATED_FOR_REVIEW'
          : 'SKIPPED';

        var generationReason = shouldGenerate
          ? 'Eligible for review-only runtime skeleton generation.'
          : 'Item is not eligible for automated skeleton generation.';

        var proposedFileName = shouldGenerate
          ? 'src/processors/' + record.Processor_Id + '_' + record.Processor_Name + 'Processor.gs'
          : '';

        var proposedRunFunction = shouldGenerate
          ? record.Run_Function
          : '';

        var proposedTestFunction = shouldGenerate
          ? record.Test_Function
          : '';

        var skeletonCode = shouldGenerate
          ? sciipGenerateRuntimeMigrationSkeleton2660_(record)
          : '';

        var generationKey = SCIIP_RUNTIME.makeBusinessKey([
          'RUNTIME_MIGRATION_GENERATOR',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          generatorHeaders,
          {
            Timestamp: new Date(),
            Toolkit_Version: 'v5.3.3',
            Generation_Key: generationKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Automation_Eligibility: record.Automation_Eligibility || '',
            Recommended_Migration_Mode: record.Recommended_Migration_Mode || '',
            Generation_Status: generationStatus,
            Generation_Reason: generationReason,
            Proposed_File_Name: proposedFileName,
            Proposed_Run_Function: proposedRunFunction,
            Proposed_Test_Function: proposedTestFunction,
            Generated_Skeleton_Code: skeletonCode,
            Requires_Approval: shouldGenerate ? 'YES' : 'NO',
            Code_Modification_Allowed: 'NO',
            Source_Business_Key: context.businessKey
          }
        );

        if (shouldGenerate) {
          skeletonsGenerated++;
        } else {
          itemsSkipped++;
        }
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: skeletonsGenerated,
        recordsRead: analysisRecords.length,
        processed: analysisRecords.length,
        message: JSON.stringify({
          runtimeMigrationGeneratorStatus: 'COMPLETED',
          toolkitVersion: 'v5.3.3',
          analysisRecordsRead: analysisRecords.length,
          skeletonsGenerated: skeletonsGenerated,
          itemsSkipped: itemsSkipped,
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2670_ProcessorParityValidator'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'RUNTIME_MIGRATION_GENERATOR_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Analysis_Records_Read: analysisRecords.length,
          Skeletons_Generated: skeletonsGenerated,
          Items_Skipped: itemsSkipped,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          analysisRecordsRead: analysisRecords.length,
          skeletonsGenerated: skeletonsGenerated,
          itemsSkipped: itemsSkipped,
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 runtime migration generator completed.'
      });

      return result;
    }
  });
}

function sciipGenerateRuntimeMigrationSkeleton2660_(record) {
  var processorName = record.Processor_Name || 'UnknownProcessor';
  var runFunction = record.Run_Function || 'sciipRunUnknownProcessor';
  var testFunction = record.Test_Function || 'sciipTestUnknownProcessor';

  return [
    '/**',
    ' * SCIIP_OS Runtime Migration Skeleton',
    ' * Processor: ' + processorName,
    ' * Generated for review only. Do not paste without manual validation.',
    ' */',
    '',
    'function ' + runFunction + '() {',
    '  return SCIIP_RUNTIME_PROCESSOR_BASE.run({',
    "    processor: '" + processorName + "',",
    "    action: 'DEFINE_ACTION',",
    "    sourceSheet: 'DEFINE_SOURCE_SHEET',",
    "    targetSheet: 'DEFINE_TARGET_SHEET',",
    "    ledgerSheet: 'DEFINE_LEDGER_SHEET',",
    '',
    '    buildPayload: function(context, definition) {',
    '      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({',
    '        processor: context.processor,',
    '        action: context.action,',
    '        businessKey: context.businessKey,',
    '        sourceSheet: definition.sourceSheet,',
    '        targetSheet: definition.targetSheet,',
    '        ledgerSheet: definition.ledgerSheet,',
    "        summary: 'Runtime migration skeleton payload created.'",
    '      });',
    '    },',
    '',
    '    validate: function(payload, context, definition) {',
    '      var errors = [];',
    '      if (!payload.businessKey) errors.push("Payload missing businessKey.");',
    '      if (!context.businessKey) errors.push("Context missing businessKey.");',
    '      return { valid: errors.length === 0, errors: errors };',
    '    },',
    '',
    '    execute: function(payload, context, transaction, definition) {',
    '      // TODO: migrate legacy business logic here.',
    '      return SCIIP_RUNTIME_RESULT_FACTORY.success({',
    '        processor: context.processor,',
    '        businessKey: context.businessKey,',
    '        recordsCreated: 0,',
    '        processed: 0,',
    "        message: 'Runtime migration skeleton executed.'",
    '      });',
    '    }',
    '  });',
    '}',
    '',
    'function ' + testFunction + '() {',
    '  var result = ' + runFunction + '();',
    "  Logger.log(JSON.stringify({ test: '" + testFunction + "', result: result }));",
    '  return result;',
    '}'
  ].join('\n');
}

/**
 * Standalone validation test.
 */
function sciipTest2660_RuntimeMigrationGeneratorProcessor() {
  var result = sciipRun2660_RuntimeMigrationGeneratorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2660_RuntimeMigrationGeneratorProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.3
 * Processor Parity Validator Processor
 * File: 2670_ProcessorParityValidatorProcessor.gs
 *
 * Processor: 2670_ProcessorParityValidator
 *
 * Purpose:
 * Validates generated runtime migration skeleton records for review-only
 * parity readiness. Handles zero generated skeletons safely.
 *
 * This processor does not execute generated code.
 * This processor does not modify source files.
 */

function sciipRun2670_ProcessorParityValidatorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2670_ProcessorParityValidator',
    action: 'PROCESSOR_PARITY_VALIDATION',
    sourceSheet: 'SCIIP_RUNTIME_MIGRATION_GENERATOR',
    targetSheet: 'SCIIP_PROCESSOR_PARITY_VALIDATION',
    ledgerSheet: 'SCIIP_PROCESSOR_PARITY_VALIDATION_LEDGER',

    buildPayload: function(context, definition) {
      var generatorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: generatorRecords.length,
        outputCount: 0,
        summary: 'Processor parity validator payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationToolkitVersion: 'v5.3.3',
          priorProcessor: '2660_RuntimeMigrationGenerator',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration generator source sheet.');
      if (!definition.targetSheet) errors.push('Missing parity validation target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing parity validation ledger sheet.');

      var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Runtime migration generator sheet does not exist.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var generatorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var validationHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Parity_Key',
        'Processor_Id',
        'Processor_Name',
        'Generation_Status',
        'Parity_Status',
        'Parity_Mode',
        'Skeleton_Present',
        'Run_Function_Present',
        'Test_Function_Present',
        'Requires_Approval',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Validation_Notes',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Generator_Records_Read',
        'Parity_Records_Created',
        'Candidates_Validated',
        'Candidates_Skipped',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        validationHeaders
      );

      var parityRecordsCreated = 0;
      var candidatesValidated = 0;
      var candidatesSkipped = 0;

      generatorRecords.forEach(function(record) {
        var generationStatus =
          String(record.Generation_Status || '').toUpperCase();

        var skeleton = String(record.Generated_Skeleton_Code || '').trim();
        var runFunction = String(record.Proposed_Run_Function || '').trim();
        var testFunction = String(record.Proposed_Test_Function || '').trim();

        var skeletonPresent = skeleton ? 'YES' : 'NO';
        var runFunctionPresent = runFunction ? 'YES' : 'NO';
        var testFunctionPresent = testFunction ? 'YES' : 'NO';

        var parityStatus = 'SKIPPED';
        var parityMode = 'NO_CODE_EXECUTION';
        var validationNotes = 'No generated skeleton available for parity validation.';

        if (generationStatus === 'SKELETON_GENERATED_FOR_REVIEW') {
          if (skeleton && runFunction && testFunction) {
            parityStatus = 'READY_FOR_MANUAL_PARITY_REVIEW';
            validationNotes =
              'Generated skeleton has run/test functions and requires manual parity review.';
            candidatesValidated++;
          } else {
            parityStatus = 'INCOMPLETE_GENERATED_SKELETON';
            validationNotes =
              'Generated skeleton is missing required run/test code.';
            candidatesSkipped++;
          }
        } else {
          candidatesSkipped++;
        }

        var parityKey = SCIIP_RUNTIME.makeBusinessKey([
          'PROCESSOR_PARITY',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          validationHeaders,
          {
            Timestamp: new Date(),
            Toolkit_Version: 'v5.3.3',
            Parity_Key: parityKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Generation_Status: record.Generation_Status || '',
            Parity_Status: parityStatus,
            Parity_Mode: parityMode,
            Skeleton_Present: skeletonPresent,
            Run_Function_Present: runFunctionPresent,
            Test_Function_Present: testFunctionPresent,
            Requires_Approval: record.Requires_Approval || '',
            Code_Execution_Allowed: 'NO',
            Code_Modification_Allowed: 'NO',
            Validation_Notes: validationNotes,
            Source_Business_Key: context.businessKey
          }
        );

        parityRecordsCreated++;
      });

      var overallStatus = 'COMPLETED';

      if (generatorRecords.length === 0) {
        overallStatus = 'COMPLETED_NO_GENERATOR_RECORDS';
      } else if (candidatesValidated === 0) {
        overallStatus = 'COMPLETED_NO_PARITY_CANDIDATES';
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: parityRecordsCreated,
        recordsRead: generatorRecords.length,
        processed: generatorRecords.length,
        message: JSON.stringify({
          processorParityValidationStatus: overallStatus,
          toolkitVersion: 'v5.3.3',
          generatorRecordsRead: generatorRecords.length,
          parityRecordsCreated: parityRecordsCreated,
          candidatesValidated: candidatesValidated,
          candidatesSkipped: candidatesSkipped,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2680_RuntimeMigrationReport'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'PROCESSOR_PARITY_VALIDATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Generator_Records_Read: generatorRecords.length,
          Parity_Records_Created: parityRecordsCreated,
          Candidates_Validated: candidatesValidated,
          Candidates_Skipped: candidatesSkipped,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          generatorRecordsRead: generatorRecords.length,
          parityRecordsCreated: parityRecordsCreated,
          candidatesValidated: candidatesValidated,
          candidatesSkipped: candidatesSkipped,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 processor parity validator completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2670_ProcessorParityValidatorProcessor() {
  var result = sciipRun2670_ProcessorParityValidatorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2670_ProcessorParityValidatorProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.3
 * Runtime Migration Report Processor
 * File: 2680_RuntimeMigrationReportProcessor.gs
 *
 * Processor: 2680_RuntimeMigrationReport
 *
 * Purpose:
 * Summarizes processor analyzer, runtime migration generator,
 * and processor parity validator outputs into a review-ready
 * migration toolkit report.
 *
 * This processor does not execute generated code.
 * This processor does not modify source files.
 */

function sciipRun2680_RuntimeMigrationReportProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2680_RuntimeMigrationReport',
    action: 'RUNTIME_MIGRATION_REPORT_BUILD',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_REPORT',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_REPORT_LEDGER',

    buildPayload: function(context, definition) {
      var analyzerRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_ANALYZER');

      var generatorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_RUNTIME_MIGRATION_GENERATOR');

      var parityRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_PARITY_VALIDATION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount:
          analyzerRecords.length +
          generatorRecords.length +
          parityRecords.length,
        outputCount: 1,
        summary: 'Runtime migration report payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationToolkitVersion: 'v5.3.3',
          priorProcessor: '2670_ProcessorParityValidator',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing migration report target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration report ledger sheet.');

      var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      [
        'SCIIP_PROCESSOR_ANALYZER',
        'SCIIP_RUNTIME_MIGRATION_GENERATOR',
        'SCIIP_PROCESSOR_PARITY_VALIDATION'
      ].forEach(function(sheetName) {
        if (!ss.getSheetByName(sheetName)) {
          errors.push('Missing required report source sheet: ' + sheetName);
        }
      });

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var analyzerRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_ANALYZER');

      var generatorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_RUNTIME_MIGRATION_GENERATOR');

      var parityRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_PARITY_VALIDATION');

      function countWhere(records, field, expected) {
        return records.filter(function(record) {
          return String(record[field] || '').toUpperCase() === expected;
        }).length;
      }

      var analyzerSummary = {
        totalAnalyzed: analyzerRecords.length,
        partialAutomationCandidates: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'PARTIAL_AUTOMATION_CANDIDATE'
        ),
        noActionRequired: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'NO_ACTION_REQUIRED'
        ),
        futureRuntimeNative: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'FUTURE_RUNTIME_NATIVE'
        ),
        notEligible: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'NOT_ELIGIBLE'
        ),
        manualReviewRequired: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'MANUAL_REVIEW_REQUIRED'
        )
      };

      var generatorSummary = {
        totalGeneratorRecords: generatorRecords.length,
        skeletonsGenerated: countWhere(
          generatorRecords,
          'Generation_Status',
          'SKELETON_GENERATED_FOR_REVIEW'
        ),
        skipped: countWhere(
          generatorRecords,
          'Generation_Status',
          'SKIPPED'
        ),
        codeModificationAllowed: 'NO'
      };

      var paritySummary = {
        totalParityRecords: parityRecords.length,
        readyForManualParityReview: countWhere(
          parityRecords,
          'Parity_Status',
          'READY_FOR_MANUAL_PARITY_REVIEW'
        ),
        incompleteGeneratedSkeletons: countWhere(
          parityRecords,
          'Parity_Status',
          'INCOMPLETE_GENERATED_SKELETON'
        ),
        skipped: countWhere(
          parityRecords,
          'Parity_Status',
          'SKIPPED'
        ),
        codeExecutionAllowed: 'NO',
        codeModificationAllowed: 'NO'
      };

      var reportStatus = 'REPORT_COMPLETED';

      if (
        analyzerSummary.partialAutomationCandidates === 0 &&
        generatorSummary.skeletonsGenerated === 0 &&
        paritySummary.readyForManualParityReview === 0
      ) {
        reportStatus = 'REPORT_COMPLETED_NO_AUTOMATION_CANDIDATES';
      }

      var reportNarrative =
        'SCIIP_OS v5.3.3 Runtime Migration Toolkit reviewed migration queue records, generated review-only migration outputs where eligible, and validated parity readiness without executing generated code or modifying source files. Current run identified ' +
        analyzerSummary.partialAutomationCandidates +
        ' partial automation candidates, generated ' +
        generatorSummary.skeletonsGenerated +
        ' skeletons, and found ' +
        paritySummary.readyForManualParityReview +
        ' items ready for manual parity review.';

      var reportHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Processor',
        'Business_Key',
        'Report_Status',
        'Processors_Analyzed',
        'Partial_Automation_Candidates',
        'Skeletons_Generated',
        'Parity_Ready_Items',
        'Items_Skipped',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Report_Narrative',
        'Analyzer_Summary_JSON',
        'Generator_Summary_JSON',
        'Parity_Summary_JSON',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Report_Status',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        reportHeaders,
        {
          Timestamp: new Date(),
          Toolkit_Version: 'v5.3.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Report_Status: reportStatus,
          Processors_Analyzed: analyzerSummary.totalAnalyzed,
          Partial_Automation_Candidates: analyzerSummary.partialAutomationCandidates,
          Skeletons_Generated: generatorSummary.skeletonsGenerated,
          Parity_Ready_Items: paritySummary.readyForManualParityReview,
          Items_Skipped: generatorSummary.skipped,
          Code_Execution_Allowed: 'NO',
          Code_Modification_Allowed: 'NO',
          Report_Narrative: reportNarrative,
          Analyzer_Summary_JSON: analyzerSummary,
          Generator_Summary_JSON: generatorSummary,
          Parity_Summary_JSON: paritySummary,
          Next_Processor: '2690_RuntimeMigrationToolkitCertification',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead:
          analyzerRecords.length +
          generatorRecords.length +
          parityRecords.length,
        processed: 3,
        message: JSON.stringify({
          runtimeMigrationReportStatus: reportStatus,
          toolkitVersion: 'v5.3.3',
          processorsAnalyzed: analyzerSummary.totalAnalyzed,
          partialAutomationCandidates: analyzerSummary.partialAutomationCandidates,
          skeletonsGenerated: generatorSummary.skeletonsGenerated,
          parityReadyItems: paritySummary.readyForManualParityReview,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2690_RuntimeMigrationToolkitCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'RUNTIME_MIGRATION_REPORT_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Report_Status: reportStatus,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          analyzerSummary: analyzerSummary,
          generatorSummary: generatorSummary,
          paritySummary: paritySummary,
          reportStatus: reportStatus,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 runtime migration report completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2680_RuntimeMigrationReportProcessor() {
  var result = sciipRun2680_RuntimeMigrationReportProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2680_RuntimeMigrationReportProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.3
 * Runtime Migration Toolkit Certification Processor
 * File: 2690_RuntimeMigrationToolkitCertificationProcessor.gs
 *
 * Processor: 2690_RuntimeMigrationToolkitCertification
 *
 * Purpose:
 * Certifies the v5.3.3 Runtime Migration Toolkit as a safe,
 * review-only migration assistance framework.
 *
 * This processor does not execute generated code.
 * This processor does not modify source files.
 */

function sciipRun2690_RuntimeMigrationToolkitCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2690_RuntimeMigrationToolkitCertification',
    action: 'RUNTIME_MIGRATION_TOOLKIT_CERTIFICATION',
    sourceSheet: 'SCIIP_RUNTIME_MIGRATION_REPORT',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_TOOLKIT_CERTIFICATION',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_TOOLKIT_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      var reportRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: reportRecords.length,
        outputCount: 1,
        summary: 'Runtime migration toolkit certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2680_RuntimeMigrationReport',
          toolkitVersion: 'v5.3.3',
          certifiedMode: 'REVIEW_ONLY',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration report source sheet.');
      if (!definition.targetSheet) errors.push('Missing toolkit certification target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing toolkit certification ledger sheet.');

      var reportRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!reportRecords || reportRecords.length === 0) {
        errors.push('No runtime migration report records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var reportRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestReport =
        reportRecords && reportRecords.length
          ? reportRecords[reportRecords.length - 1]
          : null;

      var reportStatus = latestReport
        ? String(latestReport.Report_Status || '')
        : 'UNKNOWN';

      var codeExecutionAllowed = 'NO';
      var codeModificationAllowed = 'NO';
      var certifiedMode = 'REVIEW_ONLY';

      var certificationStatus = 'CERTIFIED';

      if (!latestReport) {
        certificationStatus = 'CERTIFIED_WITH_ATTENTION_REQUIRED';
      }

      var certificationStatement =
        'SCIIP_OS v5.3.3 Runtime Migration Toolkit is certified as a safe review-only migration assistance framework. It can analyze processor migration records, generate review-only skeleton records, validate parity-readiness metadata, and produce migration reports. It does not execute generated code and does not modify source files.';

      var certificationHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Processor',
        'Business_Key',
        'Certification_Status',
        'Certified_Mode',
        'Report_Status',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Certification_Statement',
        'Next_Phase',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Certification_Status',
        'Certified_Mode',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        certificationHeaders,
        {
          Timestamp: new Date(),
          Toolkit_Version: 'v5.3.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Report_Status: reportStatus,
          Code_Execution_Allowed: codeExecutionAllowed,
          Code_Modification_Allowed: codeModificationAllowed,
          Certification_Statement: certificationStatement,
          Next_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: reportRecords.length,
        processed: 1,
        message: JSON.stringify({
          runtimeMigrationToolkitCertificationStatus: certificationStatus,
          toolkitVersion: 'v5.3.3',
          certifiedMode: certifiedMode,
          reportStatus: reportStatus,
          codeExecutionAllowed: codeExecutionAllowed,
          codeModificationAllowed: codeModificationAllowed,
          transactionId: transaction.transactionId,
          nextPhase: 'v5.3.4 Runtime Migration Candidate Expansion'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'RUNTIME_MIGRATION_TOOLKIT_CERTIFICATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          certificationStatus: certificationStatus,
          certifiedMode: certifiedMode,
          reportStatus: reportStatus,
          codeExecutionAllowed: codeExecutionAllowed,
          codeModificationAllowed: codeModificationAllowed,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 runtime migration toolkit certification completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2690_RuntimeMigrationToolkitCertificationProcessor() {
  var result = sciipRun2690_RuntimeMigrationToolkitCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2690_RuntimeMigrationToolkitCertificationProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.4
 * Runtime Migration Candidate Expansion Processor
 * File: 2700_RuntimeMigrationCandidateExpansionProcessor.gs
 *
 * Processor: 2700_RuntimeMigrationCandidateExpansion
 *
 * Purpose:
 * Expands runtime migration candidates beyond the current autonomous runtime
 * registry by creating a controlled candidate intake surface for legacy
 * processors. This does not modify code or execute generated migrations.
 */

function sciipRun2700_RuntimeMigrationCandidateExpansionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2700_RuntimeMigrationCandidateExpansion',
    action: 'RUNTIME_MIGRATION_CANDIDATE_EXPANSION',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATES',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_EXPANSION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime migration candidate expansion payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorPhase: 'v5.3.3 Runtime Migration Toolkit',
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing migration candidate target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing candidate expansion ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var candidateHeaders = [
        'Timestamp',
        'Expansion_Phase',
        'Candidate_Key',
        'Processor_Id',
        'Processor_Name',
        'File_Name',
        'Run_Function',
        'Test_Function',
        'Processor_Layer',
        'Migration_Source',
        'Candidate_Status',
        'Migration_Priority',
        'Risk_Level',
        'Recommended_Action',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Notes',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Expansion_Phase',
        'Candidates_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        candidateHeaders
      );

      var seedCandidates = [
        {
          Processor_Id: '320',
          Processor_Name: 'BriefingDigestProcessor',
          File_Name: '320_BriefingDigestProcessor.gs',
          Run_Function: 'sciipRunBriefingDigestProcessor',
          Test_Function: 'sciipTestBriefingDigestProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'MANUAL_CONFIRMED_MIGRATED',
          Candidate_Status: 'MIGRATED_RUNTIME_NATIVE',
          Migration_Priority: 1,
          Risk_Level: 'LOW',
          Recommended_Action: 'Record as migrated runtime-native baseline.',
          Notes: 'Already migrated successfully in v5.3.2.'
        },
        {
          Processor_Id: '330',
          Processor_Name: 'ExecutiveSummaryProcessor',
          File_Name: '330_ExecutiveSummaryProcessor.gs',
          Run_Function: 'sciipRunExecutiveSummaryProcessor',
          Test_Function: 'sciipTestExecutiveSummaryProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'MANUAL_CONFIRMED_MIGRATED',
          Candidate_Status: 'MIGRATED_RUNTIME_NATIVE',
          Migration_Priority: 1,
          Risk_Level: 'LOW',
          Recommended_Action: 'Record as migrated runtime-native baseline.',
          Notes: 'Already migrated successfully in v5.3.2.'
        },
        {
          Processor_Id: '340',
          Processor_Name: 'PlatformDailyReportProcessor',
          File_Name: '340_PlatformDailyReportProcessor.gs',
          Run_Function: 'sciipRunPlatformDailyReportProcessor',
          Test_Function: 'sciipTestPlatformDailyReportProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'LEGACY_LAYER_EXPANSION',
          Candidate_Status: 'CANDIDATE_FOR_REVIEW',
          Migration_Priority: 2,
          Risk_Level: 'MEDIUM',
          Recommended_Action: 'Review existing file and migrate to RuntimeProcessorBase if behavior is clear.',
          Notes: 'Likely follows 320/330 digest/report pattern.'
        },
        {
          Processor_Id: '350',
          Processor_Name: 'ExecutiveDashboardProcessor',
          File_Name: '350_ExecutiveDashboardProcessor.gs',
          Run_Function: 'sciipRunExecutiveDashboardProcessor',
          Test_Function: 'sciipTestExecutiveDashboardProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'LEGACY_LAYER_EXPANSION',
          Candidate_Status: 'CANDIDATE_FOR_REVIEW',
          Migration_Priority: 3,
          Risk_Level: 'MEDIUM',
          Recommended_Action: 'Review dashboard output schema before migration.',
          Notes: 'Dashboard processors may require stricter output parity review.'
        },
        {
          Processor_Id: '360',
          Processor_Name: 'CommandBriefProcessor',
          File_Name: '360_CommandBriefProcessor.gs',
          Run_Function: 'sciipRunCommandBriefProcessor',
          Test_Function: 'sciipTestCommandBriefProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'LEGACY_LAYER_EXPANSION',
          Candidate_Status: 'CANDIDATE_FOR_REVIEW',
          Migration_Priority: 4,
          Risk_Level: 'MEDIUM',
          Recommended_Action: 'Review command brief inputs and migrate after dashboard/report processors.',
          Notes: 'Candidate for runtime-base migration after report layer stabilizes.'
        }
      ];

      seedCandidates.forEach(function(candidate) {
        var candidateKey = SCIIP_RUNTIME.makeBusinessKey([
          'MIGRATION_CANDIDATE',
          candidate.Processor_Id,
          candidate.Processor_Name,
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          candidateHeaders,
          {
            Timestamp: new Date(),
            Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
            Candidate_Key: candidateKey,
            Processor_Id: candidate.Processor_Id,
            Processor_Name: candidate.Processor_Name,
            File_Name: candidate.File_Name,
            Run_Function: candidate.Run_Function,
            Test_Function: candidate.Test_Function,
            Processor_Layer: candidate.Processor_Layer,
            Migration_Source: candidate.Migration_Source,
            Candidate_Status: candidate.Candidate_Status,
            Migration_Priority: candidate.Migration_Priority,
            Risk_Level: candidate.Risk_Level,
            Recommended_Action: candidate.Recommended_Action,
            Code_Execution_Allowed: 'NO',
            Code_Modification_Allowed: 'NO',
            Notes: candidate.Notes,
            Source_Business_Key: context.businessKey
          }
        );
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: seedCandidates.length,
        processed: seedCandidates.length,
        message: JSON.stringify({
          candidateExpansionStatus: 'EXPANDED',
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          candidatesCreated: seedCandidates.length,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2710_RuntimeMigrationCandidateAnalyzer'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_CANDIDATE_EXPANSION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Candidates_Created: seedCandidates.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          candidatesCreated: seedCandidates.length,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.4 runtime migration candidate expansion completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2700_RuntimeMigrationCandidateExpansionProcessor() {
  var result = sciipRun2700_RuntimeMigrationCandidateExpansionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2700_RuntimeMigrationCandidateExpansionProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * 270_ActionExecutionTrackerProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert recommended actions into trackable execution items.
 *
 * Input:
 * - RECOMMENDED_ACTION
 *
 * Output:
 * - ACTION_TRACKER
 ************************************************************/

const SCIIP_ACTION_TRACKER_PROCESSOR = '270_ActionExecutionTrackerProcessor';
const SCIIP_ACTION_TRACKER_SHEET = 'ACTION_TRACKER';

const SCIIP_ACTION_TRACKER_HEADERS = [
  'Tracker_ID',
  'Business_Key',
  'Action_ID',
  'Action_Business_Key',
  'Opportunity_ID',
  'Opportunity_Business_Key',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Action_Type',
  'Recommended_Action',
  'Owner_Role',
  'Priority',
  'Confidence',
  'Execution_Status',
  'Assigned_To',
  'Due_Date',
  'Completed_At',
  'Outcome',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunActionExecutionTrackerProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_ACTION_TRACKER_SHEET, SCIIP_ACTION_TRACKER_HEADERS);

  const actionSheet = ss.getSheetByName('RECOMMENDED_ACTION');
  const trackerSheet = ss.getSheetByName(SCIIP_ACTION_TRACKER_SHEET);

  if (!actionSheet) throw new Error('Missing RECOMMENDED_ACTION. Run 260 first.');

  const actions = sciipReadSheetAsObjects_(actionSheet).filter(function(a) {
    return String(a.Status || '').toUpperCase() === 'OPEN';
  });

  const existingKeys = sciipGetExistingColumnValues_(trackerSheet, 'Business_Key');

  let actionsReviewed = 0;
  let trackersCreated = 0;
  let skippedDuplicate = 0;

  actions.forEach(function(action) {
    actionsReviewed++;

    const tracker = sciipCreateActionTracker_(action);

    if (existingKeys.has(tracker.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(trackerSheet, SCIIP_ACTION_TRACKER_HEADERS, tracker);
    existingKeys.add(tracker.Business_Key);
    trackersCreated++;
  });

  const result = {
    processor: SCIIP_ACTION_TRACKER_PROCESSOR,
    status: 'SUCCESS',
    actionsReviewed: actionsReviewed,
    trackersCreated: trackersCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * FACTORY
 ************************************************************/

function sciipCreateActionTracker_(action) {
  const now = new Date().toISOString();

  const keyBasis = [
    action.Business_Key,
    action.Action_Type,
    action.Recommended_Action
  ].join('|');

  const businessKey = 'ACTION_TRACKER|' + sciipStableHash_(keyBasis);

  return {
    Tracker_ID: 'AT_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Action_ID: action.Action_ID || '',
    Action_Business_Key: action.Business_Key || '',
    Opportunity_ID: action.Opportunity_ID || '',
    Opportunity_Business_Key: action.Opportunity_Business_Key || '',
    Market: action.Market || '',
    Submarket: action.Submarket || '',
    City: action.City || '',
    Industry: action.Industry || '',
    Action_Type: action.Action_Type || '',
    Recommended_Action: action.Recommended_Action || '',
    Owner_Role: action.Owner_Role || '',
    Priority: action.Priority || 'MEDIUM',
    Confidence: sciipNormalizeConfidence_(action.Confidence),
    Execution_Status: 'NOT_STARTED',
    Assigned_To: '',
    Due_Date: sciipDefaultDueDateForPriority_(action.Priority),
    Completed_At: '',
    Outcome: '',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_ACTION_TRACKER_PROCESSOR,
    Notes: 'Created from recommended action.'
  };
}

/************************************************************
 * DUE DATE LOGIC
 ************************************************************/

function sciipDefaultDueDateForPriority_(priority) {
  const p = String(priority || '').toUpperCase();
  const d = new Date();

  if (p === 'CRITICAL') d.setDate(d.getDate() + 1);
  else if (p === 'HIGH') d.setDate(d.getDate() + 3);
  else if (p === 'MEDIUM') d.setDate(d.getDate() + 7);
  else d.setDate(d.getDate() + 14);

  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestActionExecutionTrackerProcessor() {
  const result = sciipRunActionExecutionTrackerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionExecutionTrackerProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.4
 * Runtime Migration Candidate Analyzer Processor
 * File: 2710_RuntimeMigrationCandidateAnalyzerProcessor.gs
 *
 * Processor: 2710_RuntimeMigrationCandidateAnalyzer
 *
 * Purpose:
 * Analyzes expanded runtime migration candidates and recommends
 * the next processor to migrate.
 *
 * This processor does not execute candidate code.
 * This processor does not modify source files.
 */

function sciipRun2710_RuntimeMigrationCandidateAnalyzerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2710_RuntimeMigrationCandidateAnalyzer',
    action: 'RUNTIME_MIGRATION_CANDIDATE_ANALYSIS',
    sourceSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATES',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_ANALYSIS',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_ANALYSIS_LEDGER',

    buildPayload: function(context, definition) {
      var candidateRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: candidateRecords.length,
        outputCount: 0,
        summary: 'Runtime migration candidate analyzer payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2700_RuntimeMigrationCandidateExpansion',
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing candidate source sheet.');
      if (!definition.targetSheet) errors.push('Missing candidate analysis target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing candidate analysis ledger sheet.');

      var candidateRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!candidateRecords || candidateRecords.length === 0) {
        errors.push('No runtime migration candidate records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var candidateRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var analysisHeaders = [
        'Timestamp',
        'Expansion_Phase',
        'Analysis_Key',
        'Processor_Id',
        'Processor_Name',
        'File_Name',
        'Run_Function',
        'Test_Function',
        'Candidate_Status',
        'Migration_Priority',
        'Risk_Level',
        'Migration_Readiness',
        'Recommended_Order',
        'Recommended_Migration_Mode',
        'Recommended_Next_Action',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Notes',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Expansion_Phase',
        'Candidates_Read',
        'Analysis_Items_Created',
        'Next_Recommended_Processor',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        analysisHeaders
      );

      var sortedCandidates = candidateRecords.slice().sort(function(a, b) {
        var aPriority = Number(a.Migration_Priority || 99);
        var bPriority = Number(b.Migration_Priority || 99);

        if (aPriority !== bPriority) return aPriority - bPriority;

        return String(a.Processor_Id || '').localeCompare(
          String(b.Processor_Id || '')
        );
      });

      var analysisCount = 0;
      var nextRecommendedProcessor = '';

      sortedCandidates.forEach(function(candidate, index) {
        var candidateStatus =
          String(candidate.Candidate_Status || '').toUpperCase();

        var riskLevel =
          String(candidate.Risk_Level || '').toUpperCase();

        var migrationReadiness = 'UNKNOWN';
        var recommendedMode = 'MANUAL_REVIEW';
        var nextAction = 'Review candidate before migration.';

        if (candidateStatus === 'MIGRATED_RUNTIME_NATIVE') {
          migrationReadiness = 'ALREADY_MIGRATED';
          recommendedMode = 'RECORD_BASELINE';
          nextAction = 'No migration required; use as baseline pattern.';
        } else if (candidateStatus === 'CANDIDATE_FOR_REVIEW' && riskLevel !== 'HIGH') {
          migrationReadiness = 'READY_FOR_MANUAL_MIGRATION';
          recommendedMode = 'MANUAL_RUNTIME_BASE_MIGRATION';
          nextAction = 'Review source processor and migrate to SCIIP_RuntimeProcessorBase.';
        } else if (riskLevel === 'HIGH') {
          migrationReadiness = 'HIGH_RISK_REVIEW_REQUIRED';
          recommendedMode = 'ARCHITECTURE_REVIEW_FIRST';
          nextAction = 'Perform architecture review before migration.';
        }

        if (
          !nextRecommendedProcessor &&
          migrationReadiness === 'READY_FOR_MANUAL_MIGRATION'
        ) {
          nextRecommendedProcessor =
            candidate.Processor_Id + '_' + candidate.Processor_Name;
        }

        var analysisKey = SCIIP_RUNTIME.makeBusinessKey([
          'MIGRATION_CANDIDATE_ANALYSIS',
          candidate.Processor_Id || '',
          candidate.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          analysisHeaders,
          {
            Timestamp: new Date(),
            Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
            Analysis_Key: analysisKey,
            Processor_Id: candidate.Processor_Id || '',
            Processor_Name: candidate.Processor_Name || '',
            File_Name: candidate.File_Name || '',
            Run_Function: candidate.Run_Function || '',
            Test_Function: candidate.Test_Function || '',
            Candidate_Status: candidate.Candidate_Status || '',
            Migration_Priority: candidate.Migration_Priority || '',
            Risk_Level: candidate.Risk_Level || '',
            Migration_Readiness: migrationReadiness,
            Recommended_Order: index + 1,
            Recommended_Migration_Mode: recommendedMode,
            Recommended_Next_Action: nextAction,
            Code_Execution_Allowed: 'NO',
            Code_Modification_Allowed: 'NO',
            Notes: candidate.Notes || '',
            Source_Business_Key: context.businessKey
          }
        );

        analysisCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: analysisCount,
        recordsRead: candidateRecords.length,
        processed: candidateRecords.length,
        message: JSON.stringify({
          candidateAnalyzerStatus: 'ANALYSIS_COMPLETED',
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          candidatesRead: candidateRecords.length,
          analysisItemsCreated: analysisCount,
          nextRecommendedProcessor: nextRecommendedProcessor,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2720_RuntimeMigrationCandidateSelection'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_CANDIDATE_ANALYSIS_RECORDED',
          Transaction_Id: transaction.transactionId,
          Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Candidates_Read: candidateRecords.length,
          Analysis_Items_Created: analysisCount,
          Next_Recommended_Processor: nextRecommendedProcessor,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          candidatesRead: candidateRecords.length,
          analysisItemsCreated: analysisCount,
          nextRecommendedProcessor: nextRecommendedProcessor,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.4 runtime migration candidate analysis completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2710_RuntimeMigrationCandidateAnalyzerProcessor() {
  var result = sciipRun2710_RuntimeMigrationCandidateAnalyzerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2710_RuntimeMigrationCandidateAnalyzerProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.3.4
 * Runtime Migration Candidate Selection Processor
 * File: 2720_RuntimeMigrationCandidateSelectionProcessor.gs
 *
 * Processor: 2720_RuntimeMigrationCandidateSelection
 *
 * Purpose:
 * Selects the next processor migration target from candidate analysis.
 * This records the selected processor for manual runtime migration.
 *
 * This processor does not execute candidate code.
 * This processor does not modify source files.
 */

function sciipRun2720_RuntimeMigrationCandidateSelectionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2720_RuntimeMigrationCandidateSelection',
    action: 'RUNTIME_MIGRATION_CANDIDATE_SELECTION',
    sourceSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_ANALYSIS',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_SELECTION',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_SELECTION_LEDGER',

    buildPayload: function(context, definition) {
      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: analysisRecords.length,
        outputCount: 1,
        summary: 'Runtime migration candidate selection payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2710_RuntimeMigrationCandidateAnalyzer',
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing candidate analysis source sheet.');
      if (!definition.targetSheet) errors.push('Missing candidate selection target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing candidate selection ledger sheet.');

      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!analysisRecords || analysisRecords.length === 0) {
        errors.push('No runtime migration candidate analysis records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var eligibleRecords = analysisRecords.filter(function(record) {
        return String(record.Migration_Readiness || '').toUpperCase() ===
          'READY_FOR_MANUAL_MIGRATION';
      });

      eligibleRecords.sort(function(a, b) {
        var aOrder = Number(a.Recommended_Order || 999);
        var bOrder = Number(b.Recommended_Order || 999);

        if (aOrder !== bOrder) return aOrder - bOrder;

        return String(a.Processor_Id || '').localeCompare(
          String(b.Processor_Id || '')
        );
      });

      var selected = eligibleRecords.length ? eligibleRecords[0] : null;

      var selectionStatus = selected
        ? 'SELECTED'
        : 'NO_ELIGIBLE_CANDIDATE';

      var selectedProcessor = selected
        ? selected.Processor_Id + '_' + selected.Processor_Name
        : '';

      var selectionReason = selected
        ? 'Highest-priority ready-for-manual-migration candidate selected.'
        : 'No candidate with READY_FOR_MANUAL_MIGRATION readiness was available.';

      var selectionHeaders = [
        'Timestamp',
        'Expansion_Phase',
        'Processor',
        'Business_Key',
        'Selection_Status',
        'Selected_Processor_Id',
        'Selected_Processor_Name',
        'Selected_File_Name',
        'Selected_Run_Function',
        'Selected_Test_Function',
        'Selected_Processor',
        'Selection_Reason',
        'Recommended_Migration_Mode',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Next_Action',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Expansion_Phase',
        'Selection_Status',
        'Selected_Processor',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        selectionHeaders,
        {
          Timestamp: new Date(),
          Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Selection_Status: selectionStatus,
          Selected_Processor_Id: selected ? selected.Processor_Id || '' : '',
          Selected_Processor_Name: selected ? selected.Processor_Name || '' : '',
          Selected_File_Name: selected ? selected.File_Name || '' : '',
          Selected_Run_Function: selected ? selected.Run_Function || '' : '',
          Selected_Test_Function: selected ? selected.Test_Function || '' : '',
          Selected_Processor: selectedProcessor,
          Selection_Reason: selectionReason,
          Recommended_Migration_Mode: selected
            ? selected.Recommended_Migration_Mode || ''
            : '',
          Code_Execution_Allowed: 'NO',
          Code_Modification_Allowed: 'NO',
          Next_Action: selected
            ? 'Manually review and migrate selected processor using SCIIP_RuntimeProcessorBase.'
            : 'Expand candidate set or review analysis inputs.',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: analysisRecords.length,
        processed: eligibleRecords.length,
        message: JSON.stringify({
          candidateSelectionStatus: selectionStatus,
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          analysisRecordsRead: analysisRecords.length,
          eligibleCandidates: eligibleRecords.length,
          selectedProcessor: selectedProcessor,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextAction: selected
            ? 'Migrate ' + selectedProcessor
            : 'Expand candidate set'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_CANDIDATE_SELECTION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Selection_Status: selectionStatus,
          Selected_Processor: selectedProcessor,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          selectionStatus: selectionStatus,
          selectedProcessor: selectedProcessor,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.4 runtime migration candidate selection completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2720_RuntimeMigrationCandidateSelectionProcessor() {
  var result = sciipRun2720_RuntimeMigrationCandidateSelectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2720_RuntimeMigrationCandidateSelectionProcessor',
    result: result
  }));

  return result;
}

/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Processor
 * File: 2730_SuperSheetDataQualityProcessor.gs
 *
 * Processor: 2730_SuperSheetDataQuality
 *
 * Purpose:
 * Scores imported SuperSheet / Bridge records before downstream
 * matching, promotion, and knowledge graph mutation.
 *
 * This processor is non-destructive.
 * It does not modify source rows.
 * It does not promote records.
 * It only writes durable quality assessment records.
 */

function sciipRun2730_SuperSheetDataQualityProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2730_SuperSheetDataQuality',
    action: 'SUPERSHEET_DATA_QUALITY_ASSESSMENT',
    sourceSheet: 'APPROVAL_QUEUE',
    targetSheet: 'SUPERSHEET_DATA_QUALITY',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER',

    buildPayload: function(context, definition) {
      var sourceSheetName = sciipResolve2730_SuperSheetDataQualitySourceSheet_();
      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sourceSheetName);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: sourceSheetName,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length,
        summary: 'SuperSheet data quality assessment payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL',
          sourceResolutionMode: 'FIRST_AVAILABLE_NON_EMPTY_SOURCE',
          candidateSourceSheets: sciipGet2730_SuperSheetDataQualityCandidateSourceSheets_()
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var sourceSheetName = payload.sourceSheet ||
        sciipResolve2730_SuperSheetDataQualitySourceSheet_();

      var sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sourceSheetName);

      var qualityHeaders = sciipGet2730_SuperSheetDataQualityHeaders_();
      var ledgerHeaders = sciipGet2730_SuperSheetDataQualityLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        qualityHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        ledgerHeaders
      );

      if (!sourceRecords || sourceRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: sourceSheetName,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Load SuperSheet / Bridge rows before running data quality assessment.'
          })
        });

        sciipAppend2730_SuperSheetDataQualityLedger_(
          definition.ledgerSheet,
          ledgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: sourceSheetName,
            Source_Record_Count: 0,
            Records_Assessed: 0,
            Auto_Promote_Ready: 0,
            Needs_Review: 0,
            New_Candidate: 0,
            Average_Quality_Score: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var existingKeys = sciipGet2730_ExistingQualityRecordKeys_(definition.targetSheet);
      var assessed = [];
      var skippedDuplicateRecords = 0;

      sourceRecords.forEach(function(record, index) {
        var sourceRowNumber = index + 2;
        var sourceRecordKey = sciipBuild2730_SourceRecordKey_(
          sourceSheetName,
          sourceRowNumber,
          record
        );

        if (existingKeys[sourceRecordKey]) {
          skippedDuplicateRecords++;
          return;
        }

        var assessment = sciipAssess2730_SuperSheetRecordQuality_(
          record,
          sourceSheetName,
          sourceRowNumber,
          sourceRecordKey,
          context,
          transaction
        );

        assessed.push(assessment);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          qualityHeaders,
          assessment
        );
      });

      var summary = sciipSummarize2730_QualityAssessments_(assessed);

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: assessed.length,
        recordsRead: sourceRecords.length,
        processed: assessed.length,
        skippedDuplicate: skippedDuplicateRecords,
        message: JSON.stringify({
          dataQualityStatus: 'ASSESSMENT_COMPLETED',
          version: 'v5.4',
          sourceSheet: sourceSheetName,
          sourceRecordsRead: sourceRecords.length,
          qualityRecordsCreated: assessed.length,
          skippedDuplicateRecords: skippedDuplicateRecords,
          autoPromoteReady: summary.autoPromoteReady,
          needsReview: summary.needsReview,
          newCandidate: summary.newCandidate,
          averageQualityScore: summary.averageQualityScore,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: 'Run matching / approval queue processors using SUPERSHEET_DATA_QUALITY classifications.'
        })
      });

      sciipAppend2730_SuperSheetDataQualityLedger_(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'DATA_QUALITY_ASSESSMENT_RECORDED',
          Source_Sheet: sourceSheetName,
          Source_Record_Count: sourceRecords.length,
          Records_Assessed: assessed.length,
          Auto_Promote_Ready: summary.autoPromoteReady,
          Needs_Review: summary.needsReview,
          New_Candidate: summary.newCandidate,
          Average_Quality_Score: summary.averageQualityScore,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: sourceSheetName,
          sourceRecordsRead: sourceRecords.length,
          qualityRecordsCreated: assessed.length,
          skippedDuplicateRecords: skippedDuplicateRecords,
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality assessment completed.'
      });

      return result;
    }
  });
}

function sciipGet2730_SuperSheetDataQualityCandidateSourceSheets_() {
  return [
    'SUPERSHEET_BRIDGE_ROWS',
    'BRIDGE_IMPORT_ROWS',
    'APPROVAL_QUEUE'
  ];
}

function sciipResolve2730_SuperSheetDataQualitySourceSheet_() {
  var candidates = sciipGet2730_SuperSheetDataQualityCandidateSourceSheets_();

  for (var i = 0; i < candidates.length; i++) {
    var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(candidates[i]);
    if (records && records.length > 0) return candidates[i];
  }

  return 'APPROVAL_QUEUE';
}

function sciipGet2730_SuperSheetDataQualityHeaders_() {
  return [
    'Quality_Record_ID',
    'Business_Key',
    'Assessment_Date',
    'Source_Sheet',
    'Source_Row_Number',
    'Source_Record_Key',
    'Address_Value',
    'City_Value',
    'Building_Name_Value',
    'APN_Value',
    'Square_Feet_Value',
    'Latitude_Value',
    'Longitude_Value',
    'Address_Confidence',
    'City_Confidence',
    'Identity_Confidence',
    'Size_Confidence',
    'Geocode_Confidence',
    'Overall_Quality_Score',
    'Quality_Band',
    'Routing_Decision',
    'Review_Flags',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Source_JSON'
  ];
}

function sciipGet2730_SuperSheetDataQualityLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Ledger_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Records_Assessed',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'Average_Quality_Score',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipAssess2730_SuperSheetRecordQuality_(
  record,
  sourceSheetName,
  sourceRowNumber,
  sourceRecordKey,
  context,
  transaction
) {
  var addressValue = sciipPick2730_FirstPresentValue_(record, [
    'Address',
    'Property_Address',
    'Street_Address',
    'Building_Address',
    'Site_Address',
    'Full_Address',
    'Formatted_Address'
  ]);

  var cityValue = sciipPick2730_FirstPresentValue_(record, [
    'City',
    'Market_City',
    'Property_City'
  ]);

  var buildingNameValue = sciipPick2730_FirstPresentValue_(record, [
    'Building_Name',
    'Property_Name',
    'Project_Name',
    'Name',
    'Asset_Name'
  ]);

  var apnValue = sciipPick2730_FirstPresentValue_(record, [
    'APN',
    'Parcel',
    'Parcel_Number',
    'Assessor_Parcel_Number'
  ]);

  var squareFeetValue = sciipPick2730_FirstPresentValue_(record, [
    'SF',
    'Square_Feet',
    'Building_SF',
    'Available_SF',
    'Size_SF',
    'Total_SF'
  ]);

  var latitudeValue = sciipPick2730_FirstPresentValue_(record, [
    'Latitude',
    'Lat'
  ]);

  var longitudeValue = sciipPick2730_FirstPresentValue_(record, [
    'Longitude',
    'Long',
    'Lng'
  ]);

  var addressConfidence = sciipScore2730_AddressConfidence_(addressValue);
  var cityConfidence = sciipScore2730_CityConfidence_(cityValue);
  var identityConfidence = sciipScore2730_IdentityConfidence_(
    addressValue,
    buildingNameValue,
    apnValue
  );
  var sizeConfidence = sciipScore2730_SizeConfidence_(squareFeetValue);
  var geocodeConfidence = sciipScore2730_GeocodeConfidence_(
    latitudeValue,
    longitudeValue
  );

  var overallScore = Math.round(
    addressConfidence * 0.35 +
    cityConfidence * 0.15 +
    identityConfidence * 0.20 +
    sizeConfidence * 0.15 +
    geocodeConfidence * 0.15
  );

  var flags = sciipBuild2730_ReviewFlags_({
    addressValue: addressValue,
    cityValue: cityValue,
    buildingNameValue: buildingNameValue,
    apnValue: apnValue,
    squareFeetValue: squareFeetValue,
    latitudeValue: latitudeValue,
    longitudeValue: longitudeValue,
    addressConfidence: addressConfidence,
    cityConfidence: cityConfidence,
    identityConfidence: identityConfidence,
    sizeConfidence: sizeConfidence,
    geocodeConfidence: geocodeConfidence
  });

  var qualityBand = sciipDetermine2730_QualityBand_(overallScore);
  var routingDecision = sciipDetermine2730_RoutingDecision_(overallScore, flags);
  var nextAction = sciipDetermine2730_RecommendedNextAction_(routingDecision);

  return {
    Quality_Record_ID: 'SUPERSHEET_DATA_QUALITY_' + Utilities.getUuid(),
    Business_Key: 'SUPERSHEET_DATA_QUALITY|' + sourceRecordKey,
    Assessment_Date: SCIIP_RUNTIME.getDateKey({}),
    Source_Sheet: sourceSheetName,
    Source_Row_Number: sourceRowNumber,
    Source_Record_Key: sourceRecordKey,
    Address_Value: addressValue,
    City_Value: cityValue,
    Building_Name_Value: buildingNameValue,
    APN_Value: apnValue,
    Square_Feet_Value: squareFeetValue,
    Latitude_Value: latitudeValue,
    Longitude_Value: longitudeValue,
    Address_Confidence: addressConfidence,
    City_Confidence: cityConfidence,
    Identity_Confidence: identityConfidence,
    Size_Confidence: sizeConfidence,
    Geocode_Confidence: geocodeConfidence,
    Overall_Quality_Score: overallScore,
    Quality_Band: qualityBand,
    Routing_Decision: routingDecision,
    Review_Flags: flags.join('|'),
    Recommended_Next_Action: nextAction,
    Created_At: new Date().toISOString(),
    Processor: context.processor,
    Transaction_Id: transaction.transactionId,
    Source_JSON: record
  };
}

function sciipPick2730_FirstPresentValue_(record, candidateFields) {
  for (var i = 0; i < candidateFields.length; i++) {
    var key = candidateFields[i];
    if (
      record &&
      record.hasOwnProperty(key) &&
      record[key] !== null &&
      record[key] !== undefined &&
      String(record[key]).trim() !== ''
    ) {
      return String(record[key]).trim();
    }
  }

  return '';
}

function sciipScore2730_AddressConfidence_(value) {
  var text = String(value || '').trim();
  if (!text) return 0;

  var score = 40;
  if (/\d/.test(text)) score += 20;
  if (/(street|st\.?|avenue|ave\.?|road|rd\.?|boulevard|blvd\.?|drive|dr\.?|way|parkway|pkwy\.?|court|ct\.?|lane|ln\.?)$/i.test(text)) score += 20;
  if (text.length >= 8) score += 10;
  if (text.length >= 15) score += 10;

  return Math.min(score, 100);
}

function sciipScore2730_CityConfidence_(value) {
  var text = String(value || '').trim();
  if (!text) return 0;
  if (/^\d+$/.test(text)) return 25;
  if (text.length < 3) return 40;
  return 100;
}

function sciipScore2730_IdentityConfidence_(addressValue, buildingNameValue, apnValue) {
  var score = 0;
  if (String(addressValue || '').trim()) score += 45;
  if (String(buildingNameValue || '').trim()) score += 25;
  if (String(apnValue || '').trim()) score += 30;
  return Math.min(score, 100);
}

function sciipScore2730_SizeConfidence_(value) {
  var text = String(value || '').replace(/,/g, '').trim();
  if (!text) return 0;

  var number = Number(text);
  if (isNaN(number) || number <= 0) return 30;
  if (number < 1000) return 50;
  return 100;
}

function sciipScore2730_GeocodeConfidence_(latitudeValue, longitudeValue) {
  var latText = String(latitudeValue || '').trim();
  var lonText = String(longitudeValue || '').trim();

  if (!latText && !lonText) return 0;

  var lat = Number(latText);
  var lon = Number(lonText);

  if (isNaN(lat) || isNaN(lon)) return 25;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return 25;

  return 100;
}

function sciipBuild2730_ReviewFlags_(args) {
  var flags = [];

  if (!args.addressValue) flags.push('MISSING_ADDRESS');
  if (!args.cityValue) flags.push('MISSING_CITY');
  if (!args.buildingNameValue && !args.apnValue) flags.push('WEAK_IDENTITY_FIELDS');
  if (!args.squareFeetValue) flags.push('MISSING_SIZE');
  if (!args.latitudeValue || !args.longitudeValue) flags.push('MISSING_GEOCODE');
  if (args.addressConfidence < 70) flags.push('LOW_ADDRESS_CONFIDENCE');
  if (args.cityConfidence < 70) flags.push('LOW_CITY_CONFIDENCE');
  if (args.identityConfidence < 70) flags.push('LOW_IDENTITY_CONFIDENCE');
  if (args.sizeConfidence < 70) flags.push('LOW_SIZE_CONFIDENCE');
  if (args.geocodeConfidence < 70) flags.push('LOW_GEOCODE_CONFIDENCE');

  if (flags.length === 0) flags.push('NO_REVIEW_FLAGS');

  return flags;
}

function sciipDetermine2730_QualityBand_(score) {
  if (score >= 90) return 'HIGH';
  if (score >= 70) return 'MEDIUM';
  return 'LOW';
}

function sciipDetermine2730_RoutingDecision_(score, flags) {
  var flagText = flags.join('|');

  if (score >= 90 && flagText === 'NO_REVIEW_FLAGS') {
    return 'AUTO_PROMOTE_READY';
  }

  if (score >= 70) {
    return 'NEEDS_REVIEW';
  }

  return 'NEW_CANDIDATE';
}

function sciipDetermine2730_RecommendedNextAction_(routingDecision) {
  if (routingDecision === 'AUTO_PROMOTE_READY') {
    return 'Allow downstream match and promotion processors to evaluate for automated promotion.';
  }

  if (routingDecision === 'NEEDS_REVIEW') {
    return 'Route to manual review / approval queue before promotion.';
  }

  return 'Treat as possible new property candidate and preserve full source record for review.';
}

function sciipBuild2730_SourceRecordKey_(sourceSheetName, sourceRowNumber, record) {
  var candidateKey = sciipPick2730_FirstPresentValue_(record, [
    'Business_Key',
    'Source_Record_Key',
    'Property_ID',
    'Candidate_ID',
    'Approval_ID',
    'Asset_ID'
  ]);

  if (candidateKey) {
    return sourceSheetName + '|' + candidateKey;
  }

  var address = sciipPick2730_FirstPresentValue_(record, [
    'Address',
    'Property_Address',
    'Street_Address',
    'Building_Address',
    'Site_Address',
    'Full_Address',
    'Formatted_Address'
  ]);

  var city = sciipPick2730_FirstPresentValue_(record, [
    'City',
    'Market_City',
    'Property_City'
  ]);

  if (address || city) {
    return sourceSheetName + '|' + sciipNormalize2730_KeyPart_(address) + '|' + sciipNormalize2730_KeyPart_(city);
  }

  return sourceSheetName + '|ROW_' + sourceRowNumber;
}

function sciipNormalize2730_KeyPart_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function sciipGet2730_ExistingQualityRecordKeys_(targetSheetName) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);
  var keys = {};

  records.forEach(function(record) {
    var key = String(record.Source_Record_Key || '').trim();
    if (key) keys[key] = true;
  });

  return keys;
}

function sciipSummarize2730_QualityAssessments_(assessments) {
  var total = 0;
  var autoPromoteReady = 0;
  var needsReview = 0;
  var newCandidate = 0;

  assessments.forEach(function(row) {
    total += Number(row.Overall_Quality_Score || 0);

    if (row.Routing_Decision === 'AUTO_PROMOTE_READY') autoPromoteReady++;
    if (row.Routing_Decision === 'NEEDS_REVIEW') needsReview++;
    if (row.Routing_Decision === 'NEW_CANDIDATE') newCandidate++;
  });

  return {
    autoPromoteReady: autoPromoteReady,
    needsReview: needsReview,
    newCandidate: newCandidate,
    averageQualityScore: assessments.length
      ? Math.round(total / assessments.length)
      : 0
  };
}

function sciipAppend2730_SuperSheetDataQualityLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2730_SuperSheetDataQualityProcessor() {
  var result = sciipRun2730_SuperSheetDataQualityProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2730_SuperSheetDataQualityProcessor',
    result: result
  }));

  return result;
}


/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Digest Processor
 * File: 2750_SuperSheetDataQualityDigestProcessor.gs
 *
 * Processor: 2750_SuperSheetDataQualityDigest
 *
 * Purpose:
 * Creates an operator-facing digest from SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY
 * records produced by 2740_SuperSheetDataQualityLedgerProcessor.
 *
 * This processor is non-destructive and skip-safe.
 */

function sciipRun2750_SuperSheetDataQualityDigestProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2750_SuperSheetDataQualityDigest',
    action: 'SUPERSHEET_DATA_QUALITY_DIGEST_BUILD',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_DATA_QUALITY_DIGEST',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_DIGEST_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var ledgerSummaries = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: ledgerSummaries.length,
        outputCount: ledgerSummaries.length ? 1 : 0,
        summary: 'SuperSheet data quality digest payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_DIGEST',
          upstreamProcessor: '2740_SuperSheetDataQualityLedger'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing source sheet.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var digestHeaders = sciipGet2750_SuperSheetDataQualityDigestHeaders_();
      var runtimeLedgerHeaders = sciipGet2750_SuperSheetDataQualityDigestRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        digestHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        runtimeLedgerHeaders
      );

      var ledgerSummaries = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!ledgerSummaries || ledgerSummaries.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityDigestStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2740_SuperSheetDataQualityLedgerProcessor after 2730 creates quality records.'
          })
        });

        sciipAppend2750_SuperSheetDataQualityDigestRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Digest_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Digest_Records_Created: 0,
            Digest_Date: '',
            Digest_Rating: 'NO_INPUTS',
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var digestDate = sciipResolve2750_LatestLedgerDate_(ledgerSummaries) ||
        SCIIP_RUNTIME.getDateKey({});

      var digestBusinessKey = 'SUPERSHEET_DATA_QUALITY_DIGEST|' + digestDate;

      if (sciip2750_DigestBusinessKeyExists_(definition.targetSheet, digestBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: ledgerSummaries.length,
          processed: 0,
          message: JSON.stringify({
            dataQualityDigestStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: ledgerSummaries.length,
            digestBusinessKey: digestBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2750_SuperSheetDataQualityDigestRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Digest_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: ledgerSummaries.length,
            Digest_Records_Created: 0,
            Digest_Date: digestDate,
            Digest_Rating: 'DUPLICATE',
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var ledgerSummariesForDate = sciipFilter2750_LedgerSummariesByDate_(
        ledgerSummaries,
        digestDate
      );

      var digest = sciipBuild2750_SuperSheetDataQualityDigest_(ledgerSummariesForDate);

      var digestRecord = {
        Digest_ID: 'SUPERSHEET_DATA_QUALITY_DIGEST_' + Utilities.getUuid(),
        Business_Key: digestBusinessKey,
        Digest_Date: digestDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: ledgerSummariesForDate.length,
        Total_Records_Assessed: digest.totalRecordsAssessed,
        Auto_Promote_Ready: digest.autoPromoteReady,
        Needs_Review: digest.needsReview,
        New_Candidate: digest.newCandidate,
        Average_Quality_Score: digest.averageQualityScore,
        Digest_Rating: digest.digestRating,
        Data_Quality_Posture: digest.dataQualityPosture,
        Key_Risk: digest.keyRisk,
        Recommended_Next_Action: digest.recommendedNextAction,
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Digest_JSON: digest
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        digestHeaders,
        digestRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: ledgerSummaries.length,
        processed: ledgerSummariesForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          dataQualityDigestStatus: 'DIGEST_RECORDED',
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: ledgerSummaries.length,
          ledgerSummariesReviewedForDigestDate: ledgerSummariesForDate.length,
          digestDate: digestDate,
          digestBusinessKey: digestBusinessKey,
          totalRecordsAssessed: digest.totalRecordsAssessed,
          averageQualityScore: digest.averageQualityScore,
          digestRating: digest.digestRating,
          dataQualityPosture: digest.dataQualityPosture,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: digest.recommendedNextAction
        })
      });

      sciipAppend2750_SuperSheetDataQualityDigestRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Digest_Status: 'DIGEST_RECORDED',
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: ledgerSummaries.length,
          Digest_Records_Created: 1,
          Digest_Date: digestDate,
          Digest_Rating: digest.digestRating,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: ledgerSummaries.length,
          ledgerSummariesReviewedForDigestDate: ledgerSummariesForDate.length,
          digest: digest,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality digest completed.'
      });

      return result;
    }
  });
}

function sciipGet2750_SuperSheetDataQualityDigestHeaders_() {
  return [
    'Digest_ID',
    'Business_Key',
    'Digest_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Total_Records_Assessed',
    'Auto_Promote_Ready',
    'Needs_Review',
    'New_Candidate',
    'Average_Quality_Score',
    'Digest_Rating',
    'Data_Quality_Posture',
    'Key_Risk',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Digest_JSON'
  ];
}

function sciipGet2750_SuperSheetDataQualityDigestRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Digest_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Digest_Records_Created',
    'Digest_Date',
    'Digest_Rating',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2750_LatestLedgerDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2750_DateValue_(record.Ledger_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2750_LedgerSummariesByDate_(records, digestDate) {
  return records.filter(function(record) {
    return sciipNormalize2750_DateValue_(record.Ledger_Date) === digestDate;
  });
}

function sciipNormalize2750_DateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return text;
}

function sciipBuild2750_SuperSheetDataQualityDigest_(records) {
  var totalRecordsAssessed = 0;
  var autoPromoteReady = 0;
  var needsReview = 0;
  var newCandidate = 0;
  var weightedScoreTotal = 0;

  records.forEach(function(record) {
    var count = Number(record.Source_Record_Count || 0);
    var averageScore = Number(record.Average_Quality_Score || 0);

    totalRecordsAssessed += count;
    autoPromoteReady += Number(record.Auto_Promote_Ready || 0);
    needsReview += Number(record.Needs_Review || 0);
    newCandidate += Number(record.New_Candidate || 0);
    weightedScoreTotal += averageScore * count;
  });

  var averageQualityScore = totalRecordsAssessed
    ? Math.round(weightedScoreTotal / totalRecordsAssessed)
    : 0;

  var reviewBurden = needsReview + newCandidate;
  var digestRating = sciipDetermine2750_DigestRating_(averageQualityScore, reviewBurden, totalRecordsAssessed);
  var posture = sciipDetermine2750_DataQualityPosture_(digestRating, reviewBurden, totalRecordsAssessed);

  return {
    ledgerSummariesReviewed: records.length,
    totalRecordsAssessed: totalRecordsAssessed,
    autoPromoteReady: autoPromoteReady,
    needsReview: needsReview,
    newCandidate: newCandidate,
    averageQualityScore: averageQualityScore,
    reviewBurden: reviewBurden,
    digestRating: digestRating,
    dataQualityPosture: posture,
    keyRisk: sciipDetermine2750_KeyRisk_(averageQualityScore, needsReview, newCandidate, totalRecordsAssessed),
    recommendedNextAction: sciipDetermine2750_RecommendedNextAction_(digestRating, reviewBurden, totalRecordsAssessed)
  };
}

function sciipDetermine2750_DigestRating_(averageQualityScore, reviewBurden, totalRecordsAssessed) {
  if (!totalRecordsAssessed) return 'NO_RECORDS';
  if (averageQualityScore >= 90 && reviewBurden === 0) return 'GREEN';
  if (averageQualityScore >= 80 && reviewBurden <= Math.max(1, Math.ceil(totalRecordsAssessed * 0.10))) return 'GREEN_WITH_REVIEW';
  if (averageQualityScore >= 65) return 'YELLOW';
  return 'RED';
}

function sciipDetermine2750_DataQualityPosture_(digestRating, reviewBurden, totalRecordsAssessed) {
  if (digestRating === 'NO_RECORDS') return 'NO_SUPERSHEET_DATA_ASSESSED';
  if (digestRating === 'GREEN') return 'READY_FOR_AUTO_PROMOTION';
  if (digestRating === 'GREEN_WITH_REVIEW') return 'MOSTLY_READY_WITH_LIGHT_REVIEW';
  if (digestRating === 'YELLOW') return 'REVIEW_REQUIRED_BEFORE_PROMOTION';
  return 'HIGH_RISK_IMPORT_REQUIRES_MANUAL_REVIEW';
}

function sciipDetermine2750_KeyRisk_(averageQualityScore, needsReview, newCandidate, totalRecordsAssessed) {
  if (!totalRecordsAssessed) return 'No data quality records were available for digest.';
  if (newCandidate > 0) return 'New candidate records exist and should be reviewed before graph promotion.';
  if (needsReview > 0) return 'Some imported records require review before promotion.';
  if (averageQualityScore < 65) return 'Average data quality score is below the safe promotion threshold.';
  return 'No material data quality risk detected for this digest.';
}

function sciipDetermine2750_RecommendedNextAction_(digestRating, reviewBurden, totalRecordsAssessed) {
  if (!totalRecordsAssessed) {
    return 'Load SuperSheet / Bridge rows and rerun 2730, 2740, and 2750.';
  }

  if (digestRating === 'GREEN') {
    return 'Proceed to matching and promotion processors with digest available for audit.';
  }

  if (digestRating === 'GREEN_WITH_REVIEW') {
    return 'Review flagged records, then proceed to matching and promotion.';
  }

  return 'Pause promotion and resolve review/candidate records before knowledge graph ingestion.';
}

function sciip2750_DigestBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2750_SuperSheetDataQualityDigestRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2750_SuperSheetDataQualityDigestProcessor() {
  var result = sciipRun2750_SuperSheetDataQualityDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2750_SuperSheetDataQualityDigestProcessor',
    result: result
  }));

  return result;
}


/**
 * SCIIP_OS v5.4
 * SuperSheet Data Quality Certification Processor
 * File: 2760_SuperSheetDataQualityCertificationProcessor.gs
 *
 * Processor: 2760_SuperSheetDataQualityCertification
 *
 * Purpose:
 * Certifies the SuperSheet import data-quality posture based on
 * SUPERSHEET_DATA_QUALITY_DIGEST records produced by
 * 2750_SuperSheetDataQualityDigestProcessor.
 *
 * This processor is non-destructive and skip-safe.
 */

function sciipRun2760_SuperSheetDataQualityCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2760_SuperSheetDataQualityCertification',
    action: 'SUPERSHEET_DATA_QUALITY_CERTIFICATION_BUILD',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY_DIGEST',
    targetSheet: 'SUPERSHEET_DATA_QUALITY_CERTIFICATIONS',
    ledgerSheet: 'SUPERSHEET_DATA_QUALITY_CERTIFICATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var digests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: digests.length,
        outputCount: digests.length ? 1 : 0,
        summary: 'SuperSheet data quality certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_CERTIFICATION',
          upstreamProcessor: '2750_SuperSheetDataQualityDigest'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing source sheet.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var certificationHeaders = sciipGet2760_SuperSheetDataQualityCertificationHeaders_();
      var runtimeLedgerHeaders = sciipGet2760_SuperSheetDataQualityCertificationRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        certificationHeaders
      );

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.ledgerSheet,
        runtimeLedgerHeaders
      );

      var digests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!digests || digests.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            dataQualityCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2750_SuperSheetDataQualityDigestProcessor after 2740 creates ledger summaries.'
          })
        });

        sciipAppend2760_SuperSheetDataQualityCertificationRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Certification_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Certifications_Created: 0,
            Certification_Date: '',
            Certification_Decision: 'NO_INPUTS',
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var certificationDate = sciipResolve2760_LatestDigestDate_(digests) ||
        SCIIP_RUNTIME.getDateKey({});

      var certificationBusinessKey = 'SUPERSHEET_DATA_QUALITY_CERTIFICATION|' + certificationDate;

      if (sciip2760_CertificationBusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: digests.length,
          processed: 0,
          message: JSON.stringify({
            dataQualityCertificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: digests.length,
            certificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2760_SuperSheetDataQualityCertificationRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Certification_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: digests.length,
            Certifications_Created: 0,
            Certification_Date: certificationDate,
            Certification_Decision: 'DUPLICATE',
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var digestsForDate = sciipFilter2760_DigestsByDate_(digests, certificationDate);
      var latestDigest = sciipSelect2760_LatestDigestForDate_(digestsForDate);
      var certification = sciipBuild2760_SuperSheetDataQualityCertification_(latestDigest, digestsForDate);

      var certificationRecord = {
        Certification_ID: 'SUPERSHEET_DATA_QUALITY_CERTIFICATION_' + Utilities.getUuid(),
        Business_Key: certificationBusinessKey,
        Certification_Date: certificationDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: digestsForDate.length,
        Digest_Business_Key: certification.digestBusinessKey,
        Total_Records_Assessed: certification.totalRecordsAssessed,
        Average_Quality_Score: certification.averageQualityScore,
        Digest_Rating: certification.digestRating,
        Data_Quality_Posture: certification.dataQualityPosture,
        Certification_Decision: certification.certificationDecision,
        Certification_Status: certification.certificationStatus,
        Certification_Risk_Level: certification.certificationRiskLevel,
        Promotion_Gate: certification.promotionGate,
        Certification_Message: certification.certificationMessage,
        Required_Next_Action: certification.requiredNextAction,
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Certification_JSON: certification
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        certificationHeaders,
        certificationRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: digests.length,
        processed: digestsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          dataQualityCertificationStatus: 'CERTIFICATION_RECORDED',
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: digests.length,
          digestsReviewedForCertificationDate: digestsForDate.length,
          certificationDate: certificationDate,
          certificationBusinessKey: certificationBusinessKey,
          certificationDecision: certification.certificationDecision,
          certificationStatus: certification.certificationStatus,
          certificationRiskLevel: certification.certificationRiskLevel,
          promotionGate: certification.promotionGate,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: certification.requiredNextAction
        })
      });

      sciipAppend2760_SuperSheetDataQualityCertificationRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: certification.certificationStatus,
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: digests.length,
          Certifications_Created: 1,
          Certification_Date: certificationDate,
          Certification_Decision: certification.certificationDecision,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: digests.length,
          digestsReviewedForCertificationDate: digestsForDate.length,
          certification: certification,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet data quality certification completed.'
      });

      return result;
    }
  });
}

function sciipGet2760_SuperSheetDataQualityCertificationHeaders_() {
  return [
    'Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Digest_Business_Key',
    'Total_Records_Assessed',
    'Average_Quality_Score',
    'Digest_Rating',
    'Data_Quality_Posture',
    'Certification_Decision',
    'Certification_Status',
    'Certification_Risk_Level',
    'Promotion_Gate',
    'Certification_Message',
    'Required_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Certification_JSON'
  ];
}

function sciipGet2760_SuperSheetDataQualityCertificationRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Certification_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Certifications_Created',
    'Certification_Date',
    'Certification_Decision',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2760_LatestDigestDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2760_DateValue_(record.Digest_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2760_DigestsByDate_(records, certificationDate) {
  return records.filter(function(record) {
    return sciipNormalize2760_DateValue_(record.Digest_Date) === certificationDate;
  });
}

function sciipSelect2760_LatestDigestForDate_(records) {
  if (!records || records.length === 0) return null;

  var sorted = records.slice().sort(function(a, b) {
    return String(a.Created_At || '').localeCompare(String(b.Created_At || ''));
  });

  return sorted[sorted.length - 1];
}

function sciipNormalize2760_DateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return text;
}

function sciipBuild2760_SuperSheetDataQualityCertification_(digest, digestsForDate) {
  if (!digest) {
    return {
      digestsReviewed: 0,
      digestBusinessKey: '',
      totalRecordsAssessed: 0,
      averageQualityScore: 0,
      digestRating: 'NO_DIGEST',
      dataQualityPosture: 'NO_DIGEST_AVAILABLE',
      certificationDecision: 'NOT_CERTIFIED',
      certificationStatus: 'SKIPPED_NO_DIGEST',
      certificationRiskLevel: 'UNKNOWN',
      promotionGate: 'CLOSED',
      certificationMessage: 'No digest was available for certification.',
      requiredNextAction: 'Run 2750_SuperSheetDataQualityDigestProcessor.'
    };
  }

  var totalRecordsAssessed = Number(digest.Total_Records_Assessed || 0);
  var averageQualityScore = Number(digest.Average_Quality_Score || 0);
  var digestRating = String(digest.Digest_Rating || '').trim() || 'UNKNOWN';
  var dataQualityPosture = String(digest.Data_Quality_Posture || '').trim() || 'UNKNOWN';
  var needsReview = Number(digest.Needs_Review || 0);
  var newCandidate = Number(digest.New_Candidate || 0);

  var decision = sciipDetermine2760_CertificationDecision_(
    digestRating,
    averageQualityScore,
    needsReview,
    newCandidate,
    totalRecordsAssessed
  );

  return {
    digestsReviewed: digestsForDate.length,
    digestBusinessKey: String(digest.Business_Key || '').trim(),
    totalRecordsAssessed: totalRecordsAssessed,
    averageQualityScore: averageQualityScore,
    digestRating: digestRating,
    dataQualityPosture: dataQualityPosture,
    needsReview: needsReview,
    newCandidate: newCandidate,
    certificationDecision: decision.certificationDecision,
    certificationStatus: decision.certificationStatus,
    certificationRiskLevel: decision.certificationRiskLevel,
    promotionGate: decision.promotionGate,
    certificationMessage: decision.certificationMessage,
    requiredNextAction: decision.requiredNextAction
  };
}

function sciipDetermine2760_CertificationDecision_(digestRating, averageQualityScore, needsReview, newCandidate, totalRecordsAssessed) {
  if (!totalRecordsAssessed) {
    return {
      certificationDecision: 'NOT_CERTIFIED',
      certificationStatus: 'NO_RECORDS_ASSESSED',
      certificationRiskLevel: 'UNKNOWN',
      promotionGate: 'CLOSED',
      certificationMessage: 'No SuperSheet records were assessed by the data quality engine.',
      requiredNextAction: 'Load SuperSheet / Bridge rows and run 2730 through 2760 again.'
    };
  }

  if (digestRating === 'GREEN' && averageQualityScore >= 90 && needsReview === 0 && newCandidate === 0) {
    return {
      certificationDecision: 'CERTIFIED_FOR_AUTO_PROMOTION',
      certificationStatus: 'CERTIFIED',
      certificationRiskLevel: 'LOW',
      promotionGate: 'OPEN',
      certificationMessage: 'SuperSheet import quality is certified for automatic promotion.',
      requiredNextAction: 'Proceed to matching and promotion processors.'
    };
  }

  if (digestRating === 'GREEN_WITH_REVIEW' || (averageQualityScore >= 80 && newCandidate === 0)) {
    return {
      certificationDecision: 'CERTIFIED_WITH_REVIEW',
      certificationStatus: 'CONDITIONAL_CERTIFICATION',
      certificationRiskLevel: 'LOW_MEDIUM',
      promotionGate: 'REVIEW_REQUIRED',
      certificationMessage: 'SuperSheet import quality is mostly ready but flagged records require review before promotion.',
      requiredNextAction: 'Review flagged records, then proceed to matching and promotion.'
    };
  }

  if (digestRating === 'YELLOW' || averageQualityScore >= 65) {
    return {
      certificationDecision: 'NOT_CERTIFIED_REVIEW_REQUIRED',
      certificationStatus: 'REVIEW_REQUIRED',
      certificationRiskLevel: 'MEDIUM',
      promotionGate: 'CLOSED',
      certificationMessage: 'SuperSheet import quality requires manual review before knowledge graph ingestion.',
      requiredNextAction: 'Resolve review and candidate records before promotion.'
    };
  }

  return {
    certificationDecision: 'NOT_CERTIFIED_HIGH_RISK',
    certificationStatus: 'FAILED_CERTIFICATION',
    certificationRiskLevel: 'HIGH',
    promotionGate: 'CLOSED',
    certificationMessage: 'SuperSheet import quality is below certification threshold.',
    requiredNextAction: 'Pause promotion and remediate import normalization, identity, and address quality issues.'
  };
}

function sciip2760_CertificationBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2760_SuperSheetDataQualityCertificationRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2760_SuperSheetDataQualityCertificationProcessor() {
  var result = sciipRun2760_SuperSheetDataQualityCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2760_SuperSheetDataQualityCertificationProcessor',
    result: result
  }));

  return result;
}


/**
 * SCIIP_OS v5.4
 * SuperSheet Promotion Gate Processor
 * File: 2770_SuperSheetPromotionGateProcessor.gs
 *
 * Processor: 2770_SuperSheetPromotionGate
 *
 * Purpose:
 * Converts SuperSheet Data Quality Certifications into durable
 * promotion-gate decisions before matching, promotion, or knowledge
 * graph mutation can proceed.
 *
 * This processor is non-destructive and skip-safe.
 */

function sciipRun2770_SuperSheetPromotionGateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2770_SuperSheetPromotionGate',
    action: 'SUPERSHEET_PROMOTION_GATE_BUILD',
    sourceSheet: 'SUPERSHEET_DATA_QUALITY_CERTIFICATIONS',
    targetSheet: 'SUPERSHEET_PROMOTION_GATE',
    ledgerSheet: 'SUPERSHEET_PROMOTION_GATE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var certifications = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: certifications.length,
        outputCount: certifications.length ? 1 : 0,
        summary: 'SuperSheet promotion gate payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_PROMOTION_GATE',
          upstreamProcessor: '2760_SuperSheetDataQualityCertification'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing source sheet.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var gateHeaders = sciipGet2770_SuperSheetPromotionGateHeaders_();
      var runtimeLedgerHeaders = sciipGet2770_SuperSheetPromotionGateRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, gateHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, runtimeLedgerHeaders);

      var certifications = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!certifications || certifications.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionGateStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2760_SuperSheetDataQualityCertificationProcessor after 2750 creates digest records.'
          })
        });

        sciipAppend2770_SuperSheetPromotionGateRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Gate_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Gates_Created: 0,
            Gate_Date: '',
            Gate_Decision: 'NO_INPUTS',
            Promotion_Gate: 'CLOSED',
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var gateDate = sciipResolve2770_LatestCertificationDate_(certifications) ||
        SCIIP_RUNTIME.getDateKey({});

      var gateBusinessKey = 'SUPERSHEET_PROMOTION_GATE|' + gateDate;

      if (sciip2770_GateBusinessKeyExists_(definition.targetSheet, gateBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: certifications.length,
          processed: 0,
          message: JSON.stringify({
            promotionGateStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: certifications.length,
            gateBusinessKey: gateBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2770_SuperSheetPromotionGateRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Gate_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: certifications.length,
            Gates_Created: 0,
            Gate_Date: gateDate,
            Gate_Decision: 'DUPLICATE',
            Promotion_Gate: 'UNCHANGED',
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var certificationsForDate = sciipFilter2770_CertificationsByDate_(certifications, gateDate);
      var latestCertification = sciipSelect2770_LatestCertificationForDate_(certificationsForDate);
      var gate = sciipBuild2770_SuperSheetPromotionGate_(latestCertification, certificationsForDate);

      var gateRecord = {
        Promotion_Gate_ID: 'SUPERSHEET_PROMOTION_GATE_' + Utilities.getUuid(),
        Business_Key: gateBusinessKey,
        Gate_Date: gateDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: certificationsForDate.length,
        Certification_Business_Key: gate.certificationBusinessKey,
        Certification_Status: gate.certificationStatus,
        Certification_Decision: gate.certificationDecision,
        Certification_Risk_Level: gate.certificationRiskLevel,
        Data_Quality_Posture: gate.dataQualityPosture,
        Average_Quality_Score: gate.averageQualityScore,
        Total_Records_Assessed: gate.totalRecordsAssessed,
        Upstream_Promotion_Gate: gate.upstreamPromotionGate,
        Gate_Decision: gate.gateDecision,
        Gate_Status: gate.gateStatus,
        Gate_Risk_Level: gate.gateRiskLevel,
        Matching_Allowed: gate.matchingAllowed,
        Auto_Promotion_Allowed: gate.autoPromotionAllowed,
        Manual_Review_Required: gate.manualReviewRequired,
        Knowledge_Graph_Write_Allowed: gate.knowledgeGraphWriteAllowed,
        Required_Next_Action: gate.requiredNextAction,
        Gate_Message: gate.gateMessage,
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Gate_JSON: gate
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        gateHeaders,
        gateRecord
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: certifications.length,
        processed: certificationsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          promotionGateStatus: 'PROMOTION_GATE_RECORDED',
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: certifications.length,
          certificationsReviewedForGateDate: certificationsForDate.length,
          gateDate: gateDate,
          gateBusinessKey: gateBusinessKey,
          gateDecision: gate.gateDecision,
          gateStatus: gate.gateStatus,
          gateRiskLevel: gate.gateRiskLevel,
          matchingAllowed: gate.matchingAllowed,
          autoPromotionAllowed: gate.autoPromotionAllowed,
          knowledgeGraphWriteAllowed: gate.knowledgeGraphWriteAllowed,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: gate.requiredNextAction
        })
      });

      sciipAppend2770_SuperSheetPromotionGateRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Gate_Status: gate.gateStatus,
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: certifications.length,
          Gates_Created: 1,
          Gate_Date: gateDate,
          Gate_Decision: gate.gateDecision,
          Promotion_Gate: gate.upstreamPromotionGate,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: certifications.length,
          certificationsReviewedForGateDate: certificationsForDate.length,
          gate: gate,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet promotion gate completed.'
      });

      return result;
    }
  });
}

function sciipGet2770_SuperSheetPromotionGateHeaders_() {
  return [
    'Promotion_Gate_ID',
    'Business_Key',
    'Gate_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Business_Key',
    'Certification_Status',
    'Certification_Decision',
    'Certification_Risk_Level',
    'Data_Quality_Posture',
    'Average_Quality_Score',
    'Total_Records_Assessed',
    'Upstream_Promotion_Gate',
    'Gate_Decision',
    'Gate_Status',
    'Gate_Risk_Level',
    'Matching_Allowed',
    'Auto_Promotion_Allowed',
    'Manual_Review_Required',
    'Knowledge_Graph_Write_Allowed',
    'Required_Next_Action',
    'Gate_Message',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Gate_JSON'
  ];
}

function sciipGet2770_SuperSheetPromotionGateRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Gate_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Gates_Created',
    'Gate_Date',
    'Gate_Decision',
    'Promotion_Gate',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2770_LatestCertificationDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2770_DateValue_(record.Certification_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2770_CertificationsByDate_(records, gateDate) {
  return records.filter(function(record) {
    return sciipNormalize2770_DateValue_(record.Certification_Date) === gateDate;
  });
}

function sciipSelect2770_LatestCertificationForDate_(records) {
  if (!records || records.length === 0) return null;

  var sorted = records.slice().sort(function(a, b) {
    return String(a.Created_At || '').localeCompare(String(b.Created_At || ''));
  });

  return sorted[sorted.length - 1];
}

function sciipNormalize2770_DateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return text;
}

function sciipBuild2770_SuperSheetPromotionGate_(certification, certificationsForDate) {
  if (!certification) {
    return {
      certificationsReviewed: 0,
      certificationBusinessKey: '',
      certificationStatus: 'NO_CERTIFICATION',
      certificationDecision: 'NO_CERTIFICATION',
      certificationRiskLevel: 'UNKNOWN',
      dataQualityPosture: 'NO_CERTIFICATION_AVAILABLE',
      averageQualityScore: 0,
      totalRecordsAssessed: 0,
      upstreamPromotionGate: 'CLOSED',
      gateDecision: 'DO_NOT_PROMOTE',
      gateStatus: 'CLOSED_NO_CERTIFICATION',
      gateRiskLevel: 'UNKNOWN',
      matchingAllowed: 'NO',
      autoPromotionAllowed: 'NO',
      manualReviewRequired: 'YES',
      knowledgeGraphWriteAllowed: 'NO',
      requiredNextAction: 'Run 2760_SuperSheetDataQualityCertificationProcessor.',
      gateMessage: 'No data quality certification was available, so promotion is blocked.'
    };
  }

  var certificationStatus = String(certification.Certification_Status || '').trim() || 'UNKNOWN';
  var certificationDecision = String(certification.Certification_Decision || '').trim() || 'UNKNOWN';
  var certificationRiskLevel = String(certification.Certification_Risk_Level || '').trim() || 'UNKNOWN';
  var upstreamPromotionGate = String(certification.Promotion_Gate || '').trim() || 'CLOSED';
  var dataQualityPosture = String(certification.Data_Quality_Posture || '').trim() || 'UNKNOWN';
  var averageQualityScore = Number(certification.Average_Quality_Score || 0);
  var totalRecordsAssessed = Number(certification.Total_Records_Assessed || 0);

  var decision = sciipDetermine2770_GateDecision_(
    certificationStatus,
    certificationDecision,
    certificationRiskLevel,
    upstreamPromotionGate,
    averageQualityScore,
    totalRecordsAssessed
  );

  return {
    certificationsReviewed: certificationsForDate.length,
    certificationBusinessKey: String(certification.Business_Key || '').trim(),
    certificationStatus: certificationStatus,
    certificationDecision: certificationDecision,
    certificationRiskLevel: certificationRiskLevel,
    dataQualityPosture: dataQualityPosture,
    averageQualityScore: averageQualityScore,
    totalRecordsAssessed: totalRecordsAssessed,
    upstreamPromotionGate: upstreamPromotionGate,
    gateDecision: decision.gateDecision,
    gateStatus: decision.gateStatus,
    gateRiskLevel: decision.gateRiskLevel,
    matchingAllowed: decision.matchingAllowed,
    autoPromotionAllowed: decision.autoPromotionAllowed,
    manualReviewRequired: decision.manualReviewRequired,
    knowledgeGraphWriteAllowed: decision.knowledgeGraphWriteAllowed,
    requiredNextAction: decision.requiredNextAction,
    gateMessage: decision.gateMessage
  };
}

function sciipDetermine2770_GateDecision_(
  certificationStatus,
  certificationDecision,
  certificationRiskLevel,
  upstreamPromotionGate,
  averageQualityScore,
  totalRecordsAssessed
) {
  if (!totalRecordsAssessed) {
    return {
      gateDecision: 'DO_NOT_PROMOTE',
      gateStatus: 'CLOSED_NO_RECORDS_ASSESSED',
      gateRiskLevel: 'UNKNOWN',
      matchingAllowed: 'NO',
      autoPromotionAllowed: 'NO',
      manualReviewRequired: 'YES',
      knowledgeGraphWriteAllowed: 'NO',
      requiredNextAction: 'Load SuperSheet / Bridge rows and rerun 2730 through 2770.',
      gateMessage: 'No records were assessed, so promotion remains closed.'
    };
  }

  if (
    certificationStatus === 'CERTIFIED' &&
    certificationDecision === 'CERTIFIED_FOR_AUTO_PROMOTION' &&
    upstreamPromotionGate === 'OPEN' &&
    averageQualityScore >= 90
  ) {
    return {
      gateDecision: 'ALLOW_AUTO_PROMOTION',
      gateStatus: 'OPEN',
      gateRiskLevel: 'LOW',
      matchingAllowed: 'YES',
      autoPromotionAllowed: 'YES',
      manualReviewRequired: 'NO',
      knowledgeGraphWriteAllowed: 'YES',
      requiredNextAction: 'Proceed to match engine and automatic promotion processors.',
      gateMessage: 'Data quality certification allows automatic promotion.'
    };
  }

  if (
    certificationStatus === 'CONDITIONAL_CERTIFICATION' ||
    certificationDecision === 'CERTIFIED_WITH_REVIEW' ||
    upstreamPromotionGate === 'REVIEW_REQUIRED'
  ) {
    return {
      gateDecision: 'ALLOW_MATCHING_REQUIRE_REVIEW_BEFORE_PROMOTION',
      gateStatus: 'REVIEW_REQUIRED',
      gateRiskLevel: certificationRiskLevel || 'LOW_MEDIUM',
      matchingAllowed: 'YES',
      autoPromotionAllowed: 'NO',
      manualReviewRequired: 'YES',
      knowledgeGraphWriteAllowed: 'NO',
      requiredNextAction: 'Allow matching, but require manual approval before promotion or graph write.',
      gateMessage: 'Matching may proceed, but promotion requires review.'
    };
  }

  if (
    certificationStatus === 'REVIEW_REQUIRED' ||
    certificationDecision === 'NOT_CERTIFIED_REVIEW_REQUIRED'
  ) {
    return {
      gateDecision: 'HOLD_FOR_REVIEW',
      gateStatus: 'CLOSED_REVIEW_REQUIRED',
      gateRiskLevel: certificationRiskLevel || 'MEDIUM',
      matchingAllowed: 'NO',
      autoPromotionAllowed: 'NO',
      manualReviewRequired: 'YES',
      knowledgeGraphWriteAllowed: 'NO',
      requiredNextAction: 'Resolve data quality review flags before matching or promotion.',
      gateMessage: 'Promotion is blocked pending data quality review.'
    };
  }

  return {
    gateDecision: 'BLOCK_PROMOTION_HIGH_RISK',
    gateStatus: 'CLOSED_HIGH_RISK',
    gateRiskLevel: certificationRiskLevel || 'HIGH',
    matchingAllowed: 'NO',
    autoPromotionAllowed: 'NO',
    manualReviewRequired: 'YES',
    knowledgeGraphWriteAllowed: 'NO',
    requiredNextAction: 'Pause promotion and remediate source data quality issues.',
    gateMessage: 'Promotion is blocked due to failed or high-risk data quality certification.'
  };
}

function sciip2770_GateBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2770_SuperSheetPromotionGateRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2770_SuperSheetPromotionGateProcessor() {
  var result = sciipRun2770_SuperSheetPromotionGateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2770_SuperSheetPromotionGateProcessor',
    result: result
  }));

  return result;
}


/**
 * SCIIP_OS v5.4
 * SuperSheet Promotion Gate Ledger Processor
 * File: 2780_SuperSheetPromotionGateLedgerProcessor.gs
 *
 * Processor: 2780_SuperSheetPromotionGateLedger
 *
 * Purpose:
 * Creates a durable ledger summary from SUPERSHEET_PROMOTION_GATE
 * records produced by 2770_SuperSheetPromotionGateProcessor.
 *
 * This processor is non-destructive and skip-safe.
 */

function sciipRun2780_SuperSheetPromotionGateLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2780_SuperSheetPromotionGateLedger',
    action: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_PROMOTION_GATE',
    targetSheet: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      var gateRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: gateRecords.length,
        outputCount: gateRecords.length ? 1 : 0,
        summary: 'SuperSheet promotion gate ledger summary payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          version: 'v5.4',
          qualitySurface: 'SUPERSHEET_IMPORT_FIREWALL_PROMOTION_GATE_LEDGER',
          upstreamProcessor: '2770_SuperSheetPromotionGate'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing source sheet.');
      if (!definition.targetSheet) errors.push('Missing target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var summaryHeaders = sciipGet2780_SuperSheetPromotionGateLedgerSummaryHeaders_();
      var runtimeLedgerHeaders = sciipGet2780_SuperSheetPromotionGateRuntimeLedgerHeaders_();

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.targetSheet, summaryHeaders);
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(definition.ledgerSheet, runtimeLedgerHeaders);

      var gateRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!gateRecords || gateRecords.length === 0) {
        var skippedResult = SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionGateLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2770_SuperSheetPromotionGateProcessor after 2760 creates certification records.'
          })
        });

        sciipAppend2780_SuperSheetPromotionGateRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'SKIPPED_NO_INPUTS',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: 0,
            Summary_Records_Created: 0,
            Gate_Date: '',
            Open_Gates: 0,
            Review_Required_Gates: 0,
            Closed_Gates: 0,
            Auto_Promotion_Allowed: 0,
            Matching_Allowed: 0,
            Knowledge_Graph_Write_Allowed: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: skippedResult
          }
        );

        return skippedResult;
      }

      var gateDate = sciipResolve2780_LatestGateDate_(gateRecords) || SCIIP_RUNTIME.getDateKey({});
      var ledgerBusinessKey = 'SUPERSHEET_PROMOTION_GATE_LEDGER|' + gateDate;

      if (sciip2780_SummaryBusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        var duplicateResult = SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: gateRecords.length,
          processed: 0,
          message: JSON.stringify({
            promotionGateLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            sourceRecordsRead: gateRecords.length,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });

        sciipAppend2780_SuperSheetPromotionGateRuntimeLedger_(
          definition.ledgerSheet,
          runtimeLedgerHeaders,
          {
            Timestamp: new Date(),
            Processor: context.processor,
            Business_Key: context.businessKey,
            Ledger_Status: 'DUPLICATE_SKIPPED',
            Source_Sheet: definition.sourceSheet,
            Source_Record_Count: gateRecords.length,
            Summary_Records_Created: 0,
            Gate_Date: gateDate,
            Open_Gates: 0,
            Review_Required_Gates: 0,
            Closed_Gates: 0,
            Auto_Promotion_Allowed: 0,
            Matching_Allowed: 0,
            Knowledge_Graph_Write_Allowed: 0,
            Transaction_Id: transaction.transactionId,
            Result_JSON: duplicateResult
          }
        );

        return duplicateResult;
      }

      var recordsForDate = sciipFilter2780_GateRecordsByGateDate_(gateRecords, gateDate);
      var summary = sciipSummarize2780_SuperSheetPromotionGateRecords_(recordsForDate);

      var summaryRecord = {
        Ledger_Summary_ID: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY_' + Utilities.getUuid(),
        Business_Key: ledgerBusinessKey,
        Ledger_Date: gateDate,
        Source_Sheet: definition.sourceSheet,
        Source_Record_Count: recordsForDate.length,
        Open_Gates: summary.openGates,
        Review_Required_Gates: summary.reviewRequiredGates,
        Closed_Gates: summary.closedGates,
        Auto_Promotion_Allowed: summary.autoPromotionAllowed,
        Matching_Allowed: summary.matchingAllowed,
        Manual_Review_Required: summary.manualReviewRequired,
        Knowledge_Graph_Write_Allowed: summary.knowledgeGraphWriteAllowed,
        Low_Risk_Gates: summary.lowRiskGates,
        Medium_Risk_Gates: summary.mediumRiskGates,
        High_Risk_Gates: summary.highRiskGates,
        Dominant_Gate_Status: summary.dominantGateStatus,
        Dominant_Gate_Decision: summary.dominantGateDecision,
        Promotion_Posture: summary.promotionPosture,
        Ledger_Status: summary.recordsAssessed > 0 ? 'PROMOTION_GATE_LEDGER_RECORDED' : 'NO_GATE_RECORDS_FOR_DATE',
        Recommended_Next_Action: sciipDetermine2780_RecommendedNextAction_(summary),
        Created_At: new Date().toISOString(),
        Processor: context.processor,
        Transaction_Id: transaction.transactionId,
        Summary_JSON: summary
      };

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(definition.targetSheet, summaryHeaders, summaryRecord);

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: gateRecords.length,
        processed: recordsForDate.length,
        skippedDuplicate: 0,
        message: JSON.stringify({
          promotionGateLedgerStatus: summaryRecord.Ledger_Status,
          version: 'v5.4',
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: gateRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          ledgerDate: gateDate,
          ledgerBusinessKey: ledgerBusinessKey,
          openGates: summary.openGates,
          reviewRequiredGates: summary.reviewRequiredGates,
          closedGates: summary.closedGates,
          promotionPosture: summary.promotionPosture,
          transactionId: transaction.transactionId,
          nextProcessorRecommendation: summaryRecord.Recommended_Next_Action
        })
      });

      sciipAppend2780_SuperSheetPromotionGateRuntimeLedger_(
        definition.ledgerSheet,
        runtimeLedgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: summaryRecord.Ledger_Status,
          Source_Sheet: definition.sourceSheet,
          Source_Record_Count: gateRecords.length,
          Summary_Records_Created: 1,
          Gate_Date: gateDate,
          Open_Gates: summary.openGates,
          Review_Required_Gates: summary.reviewRequiredGates,
          Closed_Gates: summary.closedGates,
          Auto_Promotion_Allowed: summary.autoPromotionAllowed,
          Matching_Allowed: summary.matchingAllowed,
          Knowledge_Graph_Write_Allowed: summary.knowledgeGraphWriteAllowed,
          Transaction_Id: transaction.transactionId,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          sourceSheet: definition.sourceSheet,
          sourceRecordsRead: gateRecords.length,
          recordsAssessedForLedgerDate: recordsForDate.length,
          summary: summary,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.4 SuperSheet promotion gate ledger completed.'
      });

      return result;
    }
  });
}

function sciipGet2780_SuperSheetPromotionGateLedgerSummaryHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Open_Gates',
    'Review_Required_Gates',
    'Closed_Gates',
    'Auto_Promotion_Allowed',
    'Matching_Allowed',
    'Manual_Review_Required',
    'Knowledge_Graph_Write_Allowed',
    'Low_Risk_Gates',
    'Medium_Risk_Gates',
    'High_Risk_Gates',
    'Dominant_Gate_Status',
    'Dominant_Gate_Decision',
    'Promotion_Posture',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipGet2780_SuperSheetPromotionGateRuntimeLedgerHeaders_() {
  return [
    'Timestamp',
    'Processor',
    'Business_Key',
    'Ledger_Status',
    'Source_Sheet',
    'Source_Record_Count',
    'Summary_Records_Created',
    'Gate_Date',
    'Open_Gates',
    'Review_Required_Gates',
    'Closed_Gates',
    'Auto_Promotion_Allowed',
    'Matching_Allowed',
    'Knowledge_Graph_Write_Allowed',
    'Transaction_Id',
    'Result_JSON'
  ];
}

function sciipResolve2780_LatestGateDate_(records) {
  var dates = [];

  records.forEach(function(record) {
    var dateValue = sciipNormalize2780_DateValue_(record.Gate_Date);
    if (dateValue) dates.push(dateValue);
  });

  if (!dates.length) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipFilter2780_GateRecordsByGateDate_(records, gateDate) {
  return records.filter(function(record) {
    return sciipNormalize2780_DateValue_(record.Gate_Date) === gateDate;
  });
}

function sciipNormalize2780_DateValue_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  var text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  var parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return text;
}

function sciipSummarize2780_SuperSheetPromotionGateRecords_(records) {
  var summary = {
    recordsAssessed: records.length,
    openGates: 0,
    reviewRequiredGates: 0,
    closedGates: 0,
    autoPromotionAllowed: 0,
    matchingAllowed: 0,
    manualReviewRequired: 0,
    knowledgeGraphWriteAllowed: 0,
    lowRiskGates: 0,
    mediumRiskGates: 0,
    highRiskGates: 0,
    gateStatusCounts: {},
    gateDecisionCounts: {},
    dominantGateStatus: 'NONE',
    dominantGateDecision: 'NONE',
    promotionPosture: 'NO_GATE_RECORDS'
  };

  records.forEach(function(record) {
    var gateStatus = String(record.Gate_Status || '').trim() || 'UNKNOWN';
    var gateDecision = String(record.Gate_Decision || '').trim() || 'UNKNOWN';
    var gateRiskLevel = String(record.Gate_Risk_Level || '').trim().toUpperCase() || 'UNKNOWN';

    sciipIncrement2780_Count_(summary.gateStatusCounts, gateStatus);
    sciipIncrement2780_Count_(summary.gateDecisionCounts, gateDecision);

    if (gateStatus === 'OPEN') summary.openGates++;
    else if (gateStatus.indexOf('REVIEW') !== -1 || gateDecision.indexOf('REVIEW') !== -1) summary.reviewRequiredGates++;
    else summary.closedGates++;

    if (String(record.Auto_Promotion_Allowed || '').trim().toUpperCase() === 'YES') summary.autoPromotionAllowed++;
    if (String(record.Matching_Allowed || '').trim().toUpperCase() === 'YES') summary.matchingAllowed++;
    if (String(record.Manual_Review_Required || '').trim().toUpperCase() === 'YES') summary.manualReviewRequired++;
    if (String(record.Knowledge_Graph_Write_Allowed || '').trim().toUpperCase() === 'YES') summary.knowledgeGraphWriteAllowed++;

    if (gateRiskLevel === 'LOW') summary.lowRiskGates++;
    else if (gateRiskLevel.indexOf('MEDIUM') !== -1 || gateRiskLevel === 'UNKNOWN') summary.mediumRiskGates++;
    else summary.highRiskGates++;
  });

  summary.dominantGateStatus = sciipDetermine2780_DominantKey_(summary.gateStatusCounts) || 'NONE';
  summary.dominantGateDecision = sciipDetermine2780_DominantKey_(summary.gateDecisionCounts) || 'NONE';
  summary.promotionPosture = sciipDetermine2780_PromotionPosture_(summary);

  return summary;
}

function sciipDetermine2780_PromotionPosture_(summary) {
  if (!summary.recordsAssessed) return 'NO_GATE_RECORDS';
  if (summary.openGates > 0 && summary.autoPromotionAllowed > 0 && summary.knowledgeGraphWriteAllowed > 0) {
    return 'AUTO_PROMOTION_READY';
  }
  if (summary.matchingAllowed > 0 && summary.manualReviewRequired > 0) {
    return 'MATCHING_ALLOWED_REVIEW_REQUIRED';
  }
  if (summary.reviewRequiredGates > 0) return 'REVIEW_REQUIRED';
  return 'PROMOTION_BLOCKED';
}

function sciipDetermine2780_RecommendedNextAction_(summary) {
  if (!summary.recordsAssessed) {
    return 'Run 2770_SuperSheetPromotionGateProcessor after 2760 creates certification records.';
  }

  if (summary.promotionPosture === 'AUTO_PROMOTION_READY') {
    return 'Proceed to match engine and automatic promotion processors.';
  }

  if (summary.promotionPosture === 'MATCHING_ALLOWED_REVIEW_REQUIRED') {
    return 'Proceed to matching, but require manual approval before promotion or knowledge graph writes.';
  }

  if (summary.promotionPosture === 'REVIEW_REQUIRED') {
    return 'Resolve SuperSheet data quality review items before promotion.';
  }

  return 'Hold promotion and remediate SuperSheet source data quality issues.';
}

function sciipIncrement2780_Count_(counts, key) {
  counts[key] = Number(counts[key] || 0) + 1;
}

function sciipDetermine2780_DominantKey_(counts) {
  var dominant = '';
  var dominantCount = -1;

  Object.keys(counts || {}).forEach(function(key) {
    var count = Number(counts[key] || 0);
    if (count > dominantCount) {
      dominant = key;
      dominantCount = count;
    }
  });

  return dominant;
}

function sciip2780_SummaryBusinessKeyExists_(targetSheetName, businessKey) {
  var records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(targetSheetName);

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === String(businessKey || '').trim();
  });
}

function sciipAppend2780_SuperSheetPromotionGateRuntimeLedger_(sheetName, headers, row) {
  SCIIP_RUNTIME_SHEET_FACTORY.appendObject(sheetName, headers, row);
}

/**
 * Standalone validation test.
 */
function sciipTest2780_SuperSheetPromotionGateLedgerProcessor() {
  var result = sciipRun2780_SuperSheetPromotionGateLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2780_SuperSheetPromotionGateLedgerProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Production Intake
 * 2790_SuperSheetPromotionRoutingProcessor
 *
 * SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY → SUPERSHEET_PROMOTION_ROUTING
 *
 * Routes certified SuperSheet promotion gate outcomes into
 * downstream promotion, review, or candidate workflows.
 *******************************************************/

function sciipGet2790_SuperSheetPromotionRoutingProcessorName_() {
  return '2790_SuperSheetPromotionRouting';
}

function sciipGet2790_SuperSheetPromotionRoutingHeaders_() {
  return [
    'Routing_ID',
    'Business_Key',
    'Routing_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Routing_Status',
    'Auto_Promote_Count',
    'Needs_Review_Count',
    'New_Candidate_Count',
    'Hold_Count',
    'Routing_Decision',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2790_SuperSheetPromotionRoutingSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_PROMOTION_ROUTING',
    sciipGet2790_SuperSheetPromotionRoutingHeaders_()
  );
}

function sciipRun2790_SuperSheetPromotionRoutingProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2790_SuperSheetPromotionRoutingProcessorName_(),
    action: 'SUPERSHEET_PROMOTION_ROUTING_BUILD',
    sourceSheet: 'SUPERSHEET_PROMOTION_GATE_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_PROMOTION_ROUTING',
    ledgerSheet: 'SUPERSHEET_PROMOTION_ROUTING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet promotion routing payload created.',
        refs: {
          migrationVersion: 'v5.4.0',
          processorMigrated: true,
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const routingDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const routingBusinessKey = 'SUPERSHEET_PROMOTION_ROUTING|' + routingDate;

      if (sciip2790_BusinessKeyExists_(definition.targetSheet, routingBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2790_SuperSheetPromotionRoutingProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionRoutingStatus: 'DUPLICATE_SKIPPED',
            routingBusinessKey: routingBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2790_SuperSheetPromotionRoutingProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionRoutingStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2780_SuperSheetPromotionGateLedgerProcessor after 2770 creates gate records.'
          })
        });
      }

      const latestRecords = sciip2790_FilterLatestDateRecords_(sourceRecords);
      const counts = sciip2790_CountRouteClasses_(latestRecords);
      const decision = sciip2790_DetermineRoutingDecision_(counts);

      const row = [
        'SUPERSHEET_PROMOTION_ROUTING_' + Utilities.getUuid(),
        routingBusinessKey,
        routingDate,
        definition.sourceSheet,
        latestRecords.length,
        decision.status,
        counts.autoPromote,
        counts.needsReview,
        counts.newCandidate,
        counts.hold,
        decision.decision,
        decision.nextAction,
        new Date().toISOString(),
        sciipGet2790_SuperSheetPromotionRoutingProcessorName_()
      ];

      const sheet = sciipEnsure2790_SuperSheetPromotionRoutingSheet_();
      sheet.appendRow(row);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2790_SuperSheetPromotionRoutingProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: latestRecords.length,
        processed: 1,
        message: JSON.stringify({
          promotionRoutingStatus: decision.status,
          routingBusinessKey: routingBusinessKey,
          sourceRecordsReviewed: latestRecords.length,
          autoPromoteCount: counts.autoPromote,
          needsReviewCount: counts.needsReview,
          newCandidateCount: counts.newCandidate,
          holdCount: counts.hold,
          routingDecision: decision.decision,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciip2790_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2790_FilterLatestDateRecords_(records) {
  if (!records || !records.length) return [];

  const dateFields = [
    'Ledger_Date',
    'Gate_Date',
    'Summary_Date',
    'Created_At',
    'Completed_At'
  ];

  const dated = records.map(function(record) {
    return {
      record: record,
      dateKey: sciip2790_ResolveRecordDate_(record, dateFields)
    };
  }).filter(function(item) {
    return item.dateKey;
  });

  if (!dated.length) return records;

  const dates = dated.map(function(item) { return item.dateKey; }).sort();
  const latest = dates[dates.length - 1];

  return dated.filter(function(item) {
    return item.dateKey === latest;
  }).map(function(item) {
    return item.record;
  });
}

function sciip2790_ResolveRecordDate_(record, fields) {
  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    const normalized = sciip2790_NormalizeDate_(value);
    if (normalized) return normalized;
  }
  return '';
}

function sciip2790_NormalizeDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return '';
}

function sciip2790_CountRouteClasses_(records) {
  const counts = {
    autoPromote: 0,
    needsReview: 0,
    newCandidate: 0,
    hold: 0
  };

  records.forEach(function(record) {
    const text = [
      record.Routing_Decision,
      record.Gate_Decision,
      record.Promotion_Decision,
      record.Certification_Status,
      record.Quality_Status,
      record.Status,
      record.Message
    ].map(function(value) {
      return String(value || '').toUpperCase();
    }).join(' ');

    if (text.indexOf('AUTO_PROMOTE') !== -1 || text.indexOf('AUTO PROMOTE') !== -1 || text.indexOf('PROMOTE_READY') !== -1) {
      counts.autoPromote += 1;
    } else if (text.indexOf('NEW_CANDIDATE') !== -1 || text.indexOf('NEW CANDIDATE') !== -1 || text.indexOf('CANDIDATE') !== -1) {
      counts.newCandidate += 1;
    } else if (text.indexOf('REVIEW') !== -1 || text.indexOf('NEEDS_REVIEW') !== -1) {
      counts.needsReview += 1;
    } else {
      counts.hold += 1;
    }
  });

  return counts;
}

function sciip2790_DetermineRoutingDecision_(counts) {
  const total = counts.autoPromote + counts.needsReview + counts.newCandidate + counts.hold;

  if (!total) {
    return {
      status: 'NO_ROUTEABLE_RECORDS',
      decision: 'HOLD_ALL',
      nextAction: 'No routeable SuperSheet promotion gate records were found.'
    };
  }

  if (counts.hold > 0) {
    return {
      status: 'ROUTING_REVIEW_REQUIRED',
      decision: 'HOLD_AND_REVIEW',
      nextAction: 'Review held promotion gate records before releasing to downstream promotion.'
    };
  }

  if (counts.needsReview > 0 || counts.newCandidate > 0) {
    return {
      status: 'ROUTED_WITH_REVIEW_ITEMS',
      decision: 'ROUTE_TO_REVIEW_AND_CANDIDATE_WORKFLOWS',
      nextAction: 'Route review items to manual review and candidate records to candidate workflow.'
    };
  }

  return {
    status: 'ROUTED_AUTO_PROMOTE_READY',
    decision: 'ROUTE_TO_AUTO_PROMOTION',
    nextAction: 'Route certified records to downstream auto-promotion workflow.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2790_SuperSheetPromotionRoutingProcessor() {
  const result = sciipRun2790_SuperSheetPromotionRoutingProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2790_SuperSheetPromotionRoutingProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Production Intake
 * 2800_SuperSheetPromotionRoutingLedgerProcessor
 *
 * SUPERSHEET_PROMOTION_ROUTING → SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY
 *
 * Creates a durable ledger summary from SuperSheet promotion
 * routing outcomes produced by 2790.
 *******************************************************/

function sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_() {
  return '2800_SuperSheetPromotionRoutingLedger';
}

function sciipGet2800_SuperSheetPromotionRoutingLedgerHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Auto_Promote_Count',
    'Needs_Review_Count',
    'New_Candidate_Count',
    'Hold_Count',
    'Dominant_Routing_Status',
    'Dominant_Routing_Decision',
    'Routing_Posture',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipEnsure2800_SuperSheetPromotionRoutingLedgerSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY',
    sciipGet2800_SuperSheetPromotionRoutingLedgerHeaders_()
  );
}

function sciipRun2800_SuperSheetPromotionRoutingLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
    action: 'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_PROMOTION_ROUTING',
    targetSheet: 'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_PROMOTION_ROUTING_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet promotion routing ledger summary payload created.',
        refs: {
          migrationVersion: 'v5.4.0',
          processorMigrated: true,
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          inputSheets: [definition.sourceSheet],
          upstreamProcessor: '2790_SuperSheetPromotionRouting'
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_PROMOTION_ROUTING_LEDGER|' + ledgerDate;

      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            promotionRoutingLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2790_SuperSheetPromotionRoutingProcessor after 2780 creates routing source records.'
          })
        });
      }

      if (sciip2800_BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            promotionRoutingLedgerStatus: 'DUPLICATE_SKIPPED',
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const latestRecords = sciip2800_FilterLatestDateRecords_(sourceRecords);
      const summary = sciip2800_SummarizeRoutingRecords_(latestRecords);

      const row = [
        'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        latestRecords.length,
        summary.autoPromoteCount,
        summary.needsReviewCount,
        summary.newCandidateCount,
        summary.holdCount,
        summary.dominantRoutingStatus,
        summary.dominantRoutingDecision,
        summary.routingPosture,
        summary.ledgerStatus,
        sciip2800_DetermineNextAction_(summary),
        new Date().toISOString(),
        sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
        transaction.transactionId,
        JSON.stringify(summary)
      ];

      const sheet = sciipEnsure2800_SuperSheetPromotionRoutingLedgerSheet_();
      sheet.appendRow(row);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2800_SuperSheetPromotionRoutingLedgerProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: latestRecords.length,
        message: JSON.stringify({
          promotionRoutingLedgerStatus: summary.ledgerStatus,
          ledgerBusinessKey: ledgerBusinessKey,
          sourceRecordsReviewed: latestRecords.length,
          autoPromoteCount: summary.autoPromoteCount,
          needsReviewCount: summary.needsReviewCount,
          newCandidateCount: summary.newCandidateCount,
          holdCount: summary.holdCount,
          routingPosture: summary.routingPosture,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciip2800_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2800_FilterLatestDateRecords_(records) {
  if (!records || !records.length) return [];

  const dated = records.map(function(record) {
    return {
      record: record,
      dateKey: sciip2800_ResolveRecordDate_(record)
    };
  }).filter(function(item) {
    return item.dateKey;
  });

  if (!dated.length) return records;

  const dates = dated.map(function(item) { return item.dateKey; }).sort();
  const latest = dates[dates.length - 1];

  return dated.filter(function(item) {
    return item.dateKey === latest;
  }).map(function(item) {
    return item.record;
  });
}

function sciip2800_ResolveRecordDate_(record) {
  const fields = ['Routing_Date', 'Ledger_Date', 'Gate_Date', 'Created_At', 'Completed_At'];
  for (let i = 0; i < fields.length; i++) {
    const normalized = sciip2800_NormalizeDate_(record[fields[i]]);
    if (normalized) return normalized;
  }
  return '';
}

function sciip2800_NormalizeDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return '';
}

function sciip2800_SummarizeRoutingRecords_(records) {
  const summary = {
    recordsAssessed: records.length,
    autoPromoteCount: 0,
    needsReviewCount: 0,
    newCandidateCount: 0,
    holdCount: 0,
    routingStatusCounts: {},
    routingDecisionCounts: {},
    dominantRoutingStatus: 'NONE',
    dominantRoutingDecision: 'NONE',
    routingPosture: 'NO_ROUTING_RECORDS',
    ledgerStatus: 'NO_ROUTING_RECORDS'
  };

  records.forEach(function(record) {
    const status = String(record.Routing_Status || record.Status || 'UNKNOWN').trim() || 'UNKNOWN';
    const decision = String(record.Routing_Decision || record.Promotion_Decision || 'UNKNOWN').trim() || 'UNKNOWN';

    sciip2800_Increment_(summary.routingStatusCounts, status);
    sciip2800_Increment_(summary.routingDecisionCounts, decision);

    summary.autoPromoteCount += Number(record.Auto_Promote_Count || 0);
    summary.needsReviewCount += Number(record.Needs_Review_Count || 0);
    summary.newCandidateCount += Number(record.New_Candidate_Count || 0);
    summary.holdCount += Number(record.Hold_Count || 0);
  });

  summary.dominantRoutingStatus = sciip2800_DominantKey_(summary.routingStatusCounts) || 'NONE';
  summary.dominantRoutingDecision = sciip2800_DominantKey_(summary.routingDecisionCounts) || 'NONE';
  summary.routingPosture = sciip2800_DetermineRoutingPosture_(summary);
  summary.ledgerStatus = summary.recordsAssessed ? 'PROMOTION_ROUTING_LEDGER_RECORDED' : 'NO_ROUTING_RECORDS';

  return summary;
}

function sciip2800_DetermineRoutingPosture_(summary) {
  if (!summary.recordsAssessed) return 'NO_ROUTING_RECORDS';
  if (summary.holdCount > 0) return 'ROUTING_HELD_FOR_REVIEW';
  if (summary.needsReviewCount > 0 || summary.newCandidateCount > 0) return 'ROUTING_REVIEW_AND_CANDIDATE_WORKFLOWS';
  if (summary.autoPromoteCount > 0) return 'ROUTING_AUTO_PROMOTE_READY';
  return 'ROUTING_UNCLASSIFIED';
}

function sciip2800_DetermineNextAction_(summary) {
  if (!summary.recordsAssessed) {
    return 'Run 2790_SuperSheetPromotionRoutingProcessor after 2780 creates routing source records.';
  }
  if (summary.routingPosture === 'ROUTING_AUTO_PROMOTE_READY') {
    return 'Proceed to downstream auto-promotion workflow.';
  }
  if (summary.routingPosture === 'ROUTING_REVIEW_AND_CANDIDATE_WORKFLOWS') {
    return 'Route review records to manual approval and candidate records to candidate workflow.';
  }
  if (summary.routingPosture === 'ROUTING_HELD_FOR_REVIEW') {
    return 'Hold promotion and resolve routing review conditions.';
  }
  return 'Review SuperSheet promotion routing posture before downstream action.';
}

function sciip2800_Increment_(counts, key) {
  counts[key] = Number(counts[key] || 0) + 1;
}

function sciip2800_DominantKey_(counts) {
  let dominant = '';
  let dominantCount = -1;
  Object.keys(counts || {}).forEach(function(key) {
    const count = Number(counts[key] || 0);
    if (count > dominantCount) {
      dominant = key;
      dominantCount = count;
    }
  });
  return dominant;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2800_SuperSheetPromotionRoutingLedgerProcessor() {
  const result = sciipRun2800_SuperSheetPromotionRoutingLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2800_SuperSheetPromotionRoutingLedgerProcessor',
    result: result
  }));

  return result;
}


/************************************************************
 * 280_ActionOutcomeLearningProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Learn from completed action trackers.
 *
 * Input:
 * - ACTION_TRACKER
 *
 * Output:
 * - ACTION_OUTCOME
 ************************************************************/

const SCIIP_ACTION_OUTCOME_LEARNING_PROCESSOR = '280_ActionOutcomeLearningProcessor';
const SCIIP_ACTION_OUTCOME_SHEET = 'ACTION_OUTCOME';

const SCIIP_ACTION_OUTCOME_HEADERS = [
  'Outcome_ID',
  'Business_Key',
  'Tracker_ID',
  'Tracker_Business_Key',
  'Action_ID',
  'Opportunity_ID',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Action_Type',
  'Priority',
  'Execution_Status',
  'Outcome',
  'Outcome_Class',
  'Learning_Text',
  'Confidence',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunActionOutcomeLearningProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_ACTION_OUTCOME_SHEET, SCIIP_ACTION_OUTCOME_HEADERS);

  const trackerSheet = ss.getSheetByName('ACTION_TRACKER');
  const outcomeSheet = ss.getSheetByName(SCIIP_ACTION_OUTCOME_SHEET);

  if (!trackerSheet) throw new Error('Missing ACTION_TRACKER. Run 270 first.');

  const trackers = sciipReadSheetAsObjects_(trackerSheet).filter(function(t) {
    return String(t.Execution_Status || '').toUpperCase() === 'COMPLETED';
  });

  const existingKeys = sciipGetExistingColumnValues_(outcomeSheet, 'Business_Key');

  let trackersReviewed = 0;
  let outcomesCreated = 0;
  let skippedDuplicate = 0;

  trackers.forEach(function(t) {
    trackersReviewed++;

    const outcome = sciipCreateActionOutcome_(t);

    if (existingKeys.has(outcome.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(outcomeSheet, SCIIP_ACTION_OUTCOME_HEADERS, outcome);
    existingKeys.add(outcome.Business_Key);
    outcomesCreated++;
  });

  const result = {
    processor: SCIIP_ACTION_OUTCOME_LEARNING_PROCESSOR,
    status: 'SUCCESS',
    trackersReviewed: trackersReviewed,
    outcomesCreated: outcomesCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * FACTORY
 ************************************************************/

function sciipCreateActionOutcome_(tracker) {
  const now = new Date().toISOString();

  const outcomeClass = sciipClassifyActionOutcome_(tracker);
  const learningText = sciipBuildActionLearningText_(tracker, outcomeClass);

  const keyBasis = [
    tracker.Business_Key,
    tracker.Execution_Status,
    tracker.Outcome,
    outcomeClass
  ].join('|');

  const businessKey = 'ACTION_OUTCOME|' + sciipStableHash_(keyBasis);

  return {
    Outcome_ID: 'AO_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Tracker_ID: tracker.Tracker_ID || '',
    Tracker_Business_Key: tracker.Business_Key || '',
    Action_ID: tracker.Action_ID || '',
    Opportunity_ID: tracker.Opportunity_ID || '',
    Market: tracker.Market || '',
    Submarket: tracker.Submarket || '',
    City: tracker.City || '',
    Industry: tracker.Industry || '',
    Action_Type: tracker.Action_Type || '',
    Priority: tracker.Priority || '',
    Execution_Status: tracker.Execution_Status || '',
    Outcome: tracker.Outcome || '',
    Outcome_Class: outcomeClass,
    Learning_Text: learningText,
    Confidence: sciipNormalizeConfidence_(tracker.Confidence),
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_ACTION_OUTCOME_LEARNING_PROCESSOR,
    Notes: 'Generated from completed action tracker.'
  };
}

/************************************************************
 * CLASSIFICATION
 ************************************************************/

function sciipClassifyActionOutcome_(tracker) {
  const outcome = String(tracker.Outcome || '').toUpperCase();

  if (!outcome) return 'UNSPECIFIED_OUTCOME';

  if (
    outcome.indexOf('SUCCESS') >= 0 ||
    outcome.indexOf('MEETING') >= 0 ||
    outcome.indexOf('TOUR') >= 0 ||
    outcome.indexOf('PROPOSAL') >= 0 ||
    outcome.indexOf('LEASE') >= 0 ||
    outcome.indexOf('DEAL') >= 0
  ) {
    return 'POSITIVE_OUTCOME';
  }

  if (
    outcome.indexOf('NO RESPONSE') >= 0 ||
    outcome.indexOf('DECLINED') >= 0 ||
    outcome.indexOf('NOT INTERESTED') >= 0 ||
    outcome.indexOf('FAILED') >= 0
  ) {
    return 'NEGATIVE_OUTCOME';
  }

  if (
    outcome.indexOf('FOLLOW UP') >= 0 ||
    outcome.indexOf('PENDING') >= 0 ||
    outcome.indexOf('MONITOR') >= 0
  ) {
    return 'ONGOING_OUTCOME';
  }

  return 'NEUTRAL_OUTCOME';
}

function sciipBuildActionLearningText_(tracker, outcomeClass) {
  const location = tracker.City || tracker.Submarket || tracker.Market || 'the market';
  const actionType = tracker.Action_Type || 'action';

  if (outcomeClass === 'POSITIVE_OUTCOME') {
    return 'SCIIP learned that ' + actionType + ' produced a positive result in ' + location + '. Similar future opportunities may deserve higher priority.';
  }

  if (outcomeClass === 'NEGATIVE_OUTCOME') {
    return 'SCIIP learned that ' + actionType + ' did not produce a positive result in ' + location + '. Similar future opportunities may require stronger evidence or different outreach.';
  }

  if (outcomeClass === 'ONGOING_OUTCOME') {
    return 'SCIIP learned that ' + actionType + ' remains ongoing in ' + location + '. The opportunity should continue to be monitored.';
  }

  return 'SCIIP recorded an action outcome for ' + actionType + ' in ' + location + '.';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestActionOutcomeLearningProcessor() {
  const result = sciipRunActionOutcomeLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestActionOutcomeLearningProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.x Runtime Processor
 * 2810_SuperSheetImportReadinessProcessor
 *
 * SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_READINESS
 *******************************************************/

function sciipTest2810_SuperSheetImportReadinessProcessor() {
  const result = sciipRun2810_SuperSheetImportReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2810_SuperSheetImportReadinessProcessor',
    result: result
  }));

  return result;
}

function sciipRun2810_SuperSheetImportReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2810_SuperSheetImportReadiness',
    action: 'SUPERSHEET_IMPORT_READINESS_BUILD',
    sourceSheet: 'SUPERSHEET_PROMOTION_ROUTING_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_READINESS',
    ledgerSheet: 'SUPERSHEET_IMPORT_READINESS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import readiness payload created.',
        refs: {
          migrationVersion: 'v5.x',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importReadinessStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2800_SuperSheetPromotionRoutingLedgerProcessor after 2790 creates routing records.'
          })
        });
      }

      const sheet = sciipEnsure2810_SuperSheetImportReadinessSheet_();
      const latest = sourceRecords[sourceRecords.length - 1] || {};
      const assessmentDate = SCIIP_RUNTIME.getDateKey ? SCIIP_RUNTIME.getDateKey({}) : sciipFormatDateKey_(new Date());
      const importReadinessBusinessKey = 'SUPERSHEET_IMPORT_READINESS|' + assessmentDate;

      if (sciip2810_BusinessKeyExists_(definition.targetSheet, importReadinessBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importReadinessStatus: 'DUPLICATE_SKIPPED',
            importReadinessBusinessKey: importReadinessBusinessKey,
            sourceRecordsReviewed: sourceRecords.length,
            transactionId: transaction.transactionId
          })
        });
      }

      const routedReady = sciip2810_CountByText_(sourceRecords, ['AUTO_PROMOTE', 'READY', 'APPROVED']);
      const routedReview = sciip2810_CountByText_(sourceRecords, ['REVIEW', 'HOLD', 'MANUAL']);
      const routedCandidate = sciip2810_CountByText_(sourceRecords, ['CANDIDATE', 'NEW']);
      const total = sourceRecords.length;
      const readyPct = total ? Math.round((routedReady / total) * 10000) / 100 : 0;

      const readinessStatus = readyPct >= 80 && routedReview === 0
        ? 'READY_FOR_IMPORT'
        : routedReady > 0
          ? 'PARTIAL_READY_REVIEW_REQUIRED'
          : 'NOT_READY_REVIEW_REQUIRED';

      sheet.appendRow([
        'SUPERSHEET_IMPORT_READINESS_' + Utilities.getUuid(),
        importReadinessBusinessKey,
        assessmentDate,
        definition.sourceSheet,
        total,
        routedReady,
        routedReview,
        routedCandidate,
        readyPct,
        readinessStatus,
        readinessStatus === 'READY_FOR_IMPORT' ? 'ALLOW_CONTROLLED_IMPORT' : 'DO_NOT_IMPORT_YET',
        new Date().toISOString(),
        context.processor
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: total,
        processed: 1,
        message: JSON.stringify({
          importReadinessStatus: readinessStatus,
          importReadinessBusinessKey: importReadinessBusinessKey,
          sourceRecordsReviewed: total,
          readyForImportCount: routedReady,
          reviewRequiredCount: routedReview,
          candidateCount: routedCandidate,
          readyPct: readyPct,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipEnsure2810_SuperSheetImportReadinessSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet('SUPERSHEET_IMPORT_READINESS', [
    'Import_Readiness_ID',
    'Business_Key',
    'Assessment_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Ready_For_Import_Count',
    'Review_Required_Count',
    'Candidate_Count',
    'Ready_Percent',
    'Readiness_Status',
    'Import_Directive',
    'Created_At',
    'Processor'
  ]);
}

function sciip2810_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2810_CountByText_(records, tokens) {
  return records.filter(function(record) {
    const text = JSON.stringify(record || {}).toUpperCase();
    return tokens.some(function(token) {
      return text.indexOf(token) !== -1;
    });
  }).length;
}


/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Production Intake
 * 2820_SuperSheetImportReadinessLedgerProcessor
 *
 * SUPERSHEET_IMPORT_READINESS → SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY
 *
 * Creates a durable ledger summary from SuperSheet import
 * readiness outcomes produced by 2810.
 *******************************************************/

function sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_() {
  return '2820_SuperSheetImportReadinessLedger';
}

function sciipGet2820_SuperSheetImportReadinessLedgerHeaders_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Ready_For_Import_Count',
    'Review_Required_Count',
    'Candidate_Count',
    'Average_Ready_Percent',
    'Dominant_Readiness_Status',
    'Dominant_Import_Directive',
    'Import_Readiness_Posture',
    'Ledger_Status',
    'Recommended_Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipEnsure2820_SuperSheetImportReadinessLedgerSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY',
    sciipGet2820_SuperSheetImportReadinessLedgerHeaders_()
  );
}

function sciipRun2820_SuperSheetImportReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
    action: 'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_READINESS',
    targetSheet: 'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_READINESS_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import readiness ledger summary payload created.',
        refs: {
          migrationVersion: 'v5.4.0',
          processorMigrated: true,
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          inputSheets: [definition.sourceSheet],
          upstreamProcessor: '2810_SuperSheetImportReadiness'
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_READINESS_LEDGER|' + ledgerDate;

      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importReadinessLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2810_SuperSheetImportReadinessProcessor after 2800 creates routing ledger summaries.'
          })
        });
      }

      if (sciip2820_BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importReadinessLedgerStatus: 'DUPLICATE_SKIPPED',
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const latestRecords = sciip2820_FilterLatestDateRecords_(sourceRecords);
      const summary = sciip2820_SummarizeReadinessRecords_(latestRecords);

      const row = [
        'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        latestRecords.length,
        summary.readyForImportCount,
        summary.reviewRequiredCount,
        summary.candidateCount,
        summary.averageReadyPercent,
        summary.dominantReadinessStatus,
        summary.dominantImportDirective,
        summary.importReadinessPosture,
        summary.ledgerStatus,
        sciip2820_DetermineNextAction_(summary),
        new Date().toISOString(),
        sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
        transaction.transactionId,
        JSON.stringify(summary)
      ];

      const sheet = sciipEnsure2820_SuperSheetImportReadinessLedgerSheet_();
      sheet.appendRow(row);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2820_SuperSheetImportReadinessLedgerProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: latestRecords.length,
        message: JSON.stringify({
          importReadinessLedgerStatus: summary.ledgerStatus,
          ledgerBusinessKey: ledgerBusinessKey,
          sourceRecordsReviewed: latestRecords.length,
          readyForImportCount: summary.readyForImportCount,
          reviewRequiredCount: summary.reviewRequiredCount,
          candidateCount: summary.candidateCount,
          averageReadyPercent: summary.averageReadyPercent,
          importReadinessPosture: summary.importReadinessPosture,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciip2820_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2820_FilterLatestDateRecords_(records) {
  if (!records || !records.length) return [];

  const dated = records.map(function(record) {
    return {
      record: record,
      dateKey: sciip2820_ResolveRecordDate_(record)
    };
  }).filter(function(item) {
    return item.dateKey;
  });

  if (!dated.length) return records;

  const dates = dated.map(function(item) { return item.dateKey; }).sort();
  const latest = dates[dates.length - 1];

  return dated.filter(function(item) {
    return item.dateKey === latest;
  }).map(function(item) {
    return item.record;
  });
}

function sciip2820_ResolveRecordDate_(record) {
  const fields = ['Assessment_Date', 'Readiness_Date', 'Ledger_Date', 'Created_At', 'Completed_At'];
  for (let i = 0; i < fields.length; i++) {
    const normalized = sciip2820_NormalizeDate_(record[fields[i]]);
    if (normalized) return normalized;
  }
  return '';
}

function sciip2820_NormalizeDate_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return '';
}

function sciip2820_SummarizeReadinessRecords_(records) {
  const summary = {
    recordsAssessed: records.length,
    readyForImportCount: 0,
    reviewRequiredCount: 0,
    candidateCount: 0,
    readyPercentTotal: 0,
    readyPercentSamples: 0,
    averageReadyPercent: 0,
    readinessStatusCounts: {},
    importDirectiveCounts: {},
    dominantReadinessStatus: 'NONE',
    dominantImportDirective: 'NONE',
    importReadinessPosture: 'NO_READINESS_RECORDS',
    ledgerStatus: 'NO_READINESS_RECORDS'
  };

  records.forEach(function(record) {
    const status = String(record.Readiness_Status || record.Import_Readiness_Status || record.Status || 'UNKNOWN').trim() || 'UNKNOWN';
    const directive = String(record.Import_Directive || record.Directive || 'UNKNOWN').trim() || 'UNKNOWN';

    sciip2820_Increment_(summary.readinessStatusCounts, status);
    sciip2820_Increment_(summary.importDirectiveCounts, directive);

    summary.readyForImportCount += Number(record.Ready_For_Import_Count || 0);
    summary.reviewRequiredCount += Number(record.Review_Required_Count || 0);
    summary.candidateCount += Number(record.Candidate_Count || 0);

    const readyPercent = Number(record.Ready_Percent || record.Readiness_Percent || 0);
    if (!isNaN(readyPercent) && readyPercent > 0) {
      summary.readyPercentTotal += readyPercent;
      summary.readyPercentSamples += 1;
    }
  });

  summary.averageReadyPercent = summary.readyPercentSamples
    ? Math.round((summary.readyPercentTotal / summary.readyPercentSamples) * 100) / 100
    : 0;

  summary.dominantReadinessStatus = sciip2820_DominantKey_(summary.readinessStatusCounts) || 'NONE';
  summary.dominantImportDirective = sciip2820_DominantKey_(summary.importDirectiveCounts) || 'NONE';
  summary.importReadinessPosture = sciip2820_DetermineReadinessPosture_(summary);
  summary.ledgerStatus = summary.recordsAssessed ? 'IMPORT_READINESS_LEDGER_RECORDED' : 'NO_READINESS_RECORDS';

  return summary;
}

function sciip2820_DetermineReadinessPosture_(summary) {
  if (!summary.recordsAssessed) return 'NO_READINESS_RECORDS';
  if (summary.dominantImportDirective === 'ALLOW_CONTROLLED_IMPORT' || summary.dominantReadinessStatus === 'READY_FOR_IMPORT') {
    return 'IMPORT_READY';
  }
  if (summary.readyForImportCount > 0 && (summary.reviewRequiredCount > 0 || summary.candidateCount > 0)) {
    return 'PARTIAL_IMPORT_READY_REVIEW_REQUIRED';
  }
  if (summary.reviewRequiredCount > 0 || summary.candidateCount > 0) {
    return 'IMPORT_REVIEW_REQUIRED';
  }
  return 'IMPORT_NOT_READY_OR_UNCLASSIFIED';
}

function sciip2820_DetermineNextAction_(summary) {
  if (!summary.recordsAssessed) {
    return 'Run 2810_SuperSheetImportReadinessProcessor after 2800 creates routing ledger summaries.';
  }
  if (summary.importReadinessPosture === 'IMPORT_READY') {
    return 'Proceed to controlled SuperSheet import activation.';
  }
  if (summary.importReadinessPosture === 'PARTIAL_IMPORT_READY_REVIEW_REQUIRED') {
    return 'Separate ready records from review/candidate records before import activation.';
  }
  if (summary.importReadinessPosture === 'IMPORT_REVIEW_REQUIRED') {
    return 'Resolve review/candidate records before import activation.';
  }
  return 'Review SuperSheet import readiness before downstream action.';
}

function sciip2820_Increment_(counts, key) {
  counts[key] = Number(counts[key] || 0) + 1;
}

function sciip2820_DominantKey_(counts) {
  let dominant = '';
  let dominantCount = -1;
  Object.keys(counts || {}).forEach(function(key) {
    const count = Number(counts[key] || 0);
    if (count > dominantCount) {
      dominant = key;
      dominantCount = count;
    }
  });
  return dominant;
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2820_SuperSheetImportReadinessLedgerProcessor() {
  const result = sciipRun2820_SuperSheetImportReadinessLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2820_SuperSheetImportReadinessLedgerProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 Runtime Processor
 * 2830_SuperSheetImportCertificationProcessor
 *
 * SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_CERTIFICATIONS
 *******************************************************/

function sciipGet2830_SuperSheetImportCertificationProcessorName_() {
  return '2830_SuperSheetImportCertification';
}

function sciipGet2830_SuperSheetImportCertificationSourceSheet_() {
  return 'SUPERSHEET_IMPORT_READINESS_LEDGER_SUMMARY';
}

function sciipGet2830_SuperSheetImportCertificationTargetSheet_() {
  return 'SUPERSHEET_IMPORT_CERTIFICATIONS';
}

function sciipGet2830_SuperSheetImportCertificationLedgerSheet_() {
  return 'SUPERSHEET_IMPORT_CERTIFICATIONS_RUNTIME_LEDGER';
}

function sciipGet2830_SuperSheetImportCertificationHeaders_() {
  return [
    'Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Status',
    'Certification_Summary',
    'Import_Readiness_Status',
    'Promotion_Readiness_Status',
    'Recommended_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2830_SuperSheetImportCertificationSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2830_SuperSheetImportCertificationTargetSheet_(),
    sciipGet2830_SuperSheetImportCertificationHeaders_()
  );
}

function sciipRun2830_SuperSheetImportCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2830_SuperSheetImportCertificationProcessorName_(),
    action: 'SUPERSHEET_IMPORT_CERTIFICATION_BUILD',
    sourceSheet: sciipGet2830_SuperSheetImportCertificationSourceSheet_(),
    targetSheet: sciipGet2830_SuperSheetImportCertificationTargetSheet_(),
    ledgerSheet: sciipGet2830_SuperSheetImportCertificationLedgerSheet_(),

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import certification runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          processorVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2830_SuperSheetImportCertificationProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2820_SuperSheetImportReadinessLedgerProcessor after 2810 creates readiness records.'
          })
        });
      }

      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const certificationBusinessKey = 'SUPERSHEET_IMPORT_CERTIFICATION|' + certificationDate;

      if (sciip2830_BusinessKeyExists_(definition.targetSheet, certificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2830_SuperSheetImportCertificationProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importCertificationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            skippedDuplicate: 1,
            importCertificationBusinessKey: certificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const certification = sciip2830_BuildImportCertification_({
        businessKey: certificationBusinessKey,
        certificationDate: certificationDate,
        sourceRecords: sourceRecords,
        processor: sciipGet2830_SuperSheetImportCertificationProcessorName_()
      });

      const sheet = sciipEnsure2830_SuperSheetImportCertificationSheet_();
      sheet.appendRow(sciipGet2830_SuperSheetImportCertificationHeaders_().map(function(header) {
        return certification[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2830_SuperSheetImportCertificationProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          importCertificationStatus: certification.Certification_Status,
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          importReadinessLedgerRecordsReviewed: sourceRecords.length,
          importCertificationBusinessKey: certificationBusinessKey,
          recommendedAction: certification.Recommended_Action,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciip2830_BuildImportCertification_(args) {
  const readinessStatus = sciip2830_ResolveReadinessStatus_(args.sourceRows || args.sourceRecords || []);
  const promotionStatus = sciip2830_ResolvePromotionReadinessStatus_(args.sourceRows || args.sourceRecords || []);
  const certificationStatus = sciip2830_ResolveCertificationStatus_(readinessStatus, promotionStatus);
  const recommendedAction = sciip2830_ResolveRecommendedAction_(certificationStatus);

  return {
    Certification_ID: 'SUPERSHEET_IMPORT_CERTIFICATION_' + Utilities.getUuid(),
    Business_Key: args.businessKey,
    Certification_Date: args.certificationDate,
    Source_Sheet: sciipGet2830_SuperSheetImportCertificationSourceSheet_(),
    Source_Record_Count: (args.sourceRecords || []).length,
    Certification_Status: certificationStatus,
    Certification_Summary: sciip2830_BuildCertificationSummary_(certificationStatus, args.sourceRecords || []),
    Import_Readiness_Status: readinessStatus,
    Promotion_Readiness_Status: promotionStatus,
    Recommended_Action: recommendedAction,
    Created_At: new Date().toISOString(),
    Processor: args.processor
  };
}

function sciip2830_ResolveReadinessStatus_(records) {
  const text = JSON.stringify(records || {}).toUpperCase();
  if (text.indexOf('NOT_READY') !== -1 || text.indexOf('BLOCKED') !== -1 || text.indexOf('FAILED') !== -1) {
    return 'NOT_READY';
  }
  if (text.indexOf('READY') !== -1 || text.indexOf('PASS') !== -1 || text.indexOf('CERTIFIED') !== -1) {
    return 'READY';
  }
  return 'UNKNOWN';
}

function sciip2830_ResolvePromotionReadinessStatus_(records) {
  const text = JSON.stringify(records || {}).toUpperCase();
  if (text.indexOf('NEEDS_REVIEW') !== -1 || text.indexOf('REVIEW_REQUIRED') !== -1) {
    return 'REVIEW_REQUIRED';
  }
  if (text.indexOf('AUTO_PROMOTE_READY') !== -1 || text.indexOf('READY') !== -1 || text.indexOf('CERTIFIED') !== -1) {
    return 'PROMOTION_READY';
  }
  return 'UNKNOWN';
}

function sciip2830_ResolveCertificationStatus_(readinessStatus, promotionStatus) {
  if (readinessStatus === 'NOT_READY') return 'NOT_CERTIFIED';
  if (readinessStatus === 'READY' && promotionStatus === 'PROMOTION_READY') return 'CERTIFIED';
  if (readinessStatus === 'READY' && promotionStatus === 'REVIEW_REQUIRED') return 'CERTIFIED_WITH_REVIEW';
  return 'PENDING_INPUT_VALIDATION';
}

function sciip2830_ResolveRecommendedAction_(certificationStatus) {
  if (certificationStatus === 'CERTIFIED') return 'ALLOW_IMPORT_AND_PROMOTION';
  if (certificationStatus === 'CERTIFIED_WITH_REVIEW') return 'ALLOW_IMPORT_WITH_MANUAL_REVIEW';
  if (certificationStatus === 'NOT_CERTIFIED') return 'HOLD_IMPORT';
  return 'WAIT_FOR_COMPLETE_READINESS_INPUTS';
}

function sciip2830_BuildCertificationSummary_(certificationStatus, records) {
  return [
    'SuperSheet import certification status: ' + certificationStatus + '.',
    'Reviewed ' + (records || []).length + ' import readiness ledger summary record(s).',
    'This record controls whether SuperSheet data may proceed from intake protection into downstream matching and promotion workflows.'
  ].join(' ');
}

function sciip2830_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2830_SuperSheetImportCertificationProcessor() {
  const result = sciipRun2830_SuperSheetImportCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2830_SuperSheetImportCertificationProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Protection Layer
 * 2840_SuperSheetImportCertificationLedgerProcessor
 *
 * SUPERSHEET_IMPORT_CERTIFICATIONS → SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY
 *
 * Purpose:
 * Creates a durable ledger summary of SuperSheet import certification
 * outcomes before any downstream import activation occurs.
 *******************************************************/

function sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_() {
  return '2840_SuperSheetImportCertificationLedger';
}

function sciipGet2840_SuperSheetImportCertificationLedgerHeaders_() {
  return [
    'Ledger_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certified_Count',
    'Failed_Count',
    'Pending_Count',
    'Ledger_Status',
    'Ledger_Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2840_SuperSheetImportCertificationLedgerSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY',
    sciipGet2840_SuperSheetImportCertificationLedgerHeaders_()
  );
}

function sciipRun2840_SuperSheetImportCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_(),
    action: 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_CERTIFICATIONS',
    targetSheet: 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import certification ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsure2840_SuperSheetImportCertificationLedgerSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2830_SuperSheetImportCertificationProcessor after 2820 creates readiness ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const importCertificationLedgerBusinessKey = 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER|' + ledgerDate;

      if (sciip2840_RuntimeBusinessKeyPrefixExists_(definition.targetSheet, importCertificationLedgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importCertificationLedgerStatus: 'DUPLICATE_SKIPPED',
            skippedDuplicate: 1,
            importCertificationLedgerBusinessKey: importCertificationLedgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2840_CountImportCertificationStatuses_(sourceRecords);
      const ledgerStatus = sciip2840_DeriveImportCertificationLedgerStatus_(counts);
      const summary = sciip2840_CreateImportCertificationLedgerSummary_(counts, ledgerStatus);
      const nextAction = sciip2840_CreateImportCertificationLedgerNextAction_(ledgerStatus);

      outputSheet.appendRow([
        'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_' + Utilities.getUuid(),
        importCertificationLedgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.certified,
        counts.failed,
        counts.pending,
        ledgerStatus,
        summary,
        nextAction,
        new Date().toISOString(),
        sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2840_SuperSheetImportCertificationLedgerProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importCertificationLedgerStatus: ledgerStatus,
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          sourceRecordsReviewed: sourceRecords.length,
          certifiedCount: counts.certified,
          failedCount: counts.failed,
          pendingCount: counts.pending,
          transactionId: transaction.transactionId,
          nextProcessor: '2850_SuperSheetImportActivationProcessor'
        })
      });
    }
  });
}

function sciip2840_CountImportCertificationStatuses_(records) {
  const counts = {
    certified: 0,
    failed: 0,
    pending: 0
  };

  records.forEach(function(record) {
    const status = String(
      record.Certification_Status ||
      record.Import_Certification_Status ||
      record.Status ||
      ''
    ).trim().toUpperCase();

    if (status === 'CERTIFIED' || status === 'IMPORT_CERTIFIED' || status === 'PASS') {
      counts.certified += 1;
    } else if (status === 'FAILED' || status === 'FAIL' || status === 'BLOCKED') {
      counts.failed += 1;
    } else {
      counts.pending += 1;
    }
  });

  return counts;
}

function sciip2840_DeriveImportCertificationLedgerStatus_(counts) {
  if (counts.failed > 0) return 'IMPORT_CERTIFICATION_BLOCKED';
  if (counts.certified > 0 && counts.pending === 0) return 'IMPORT_CERTIFICATION_LEDGER_CERTIFIED';
  if (counts.certified > 0 && counts.pending > 0) return 'IMPORT_CERTIFICATION_PARTIAL';
  return 'IMPORT_CERTIFICATION_PENDING';
}

function sciip2840_CreateImportCertificationLedgerSummary_(counts, ledgerStatus) {
  return [
    'SuperSheet import certification ledger summary recorded.',
    'Status: ' + ledgerStatus + '.',
    'Certified: ' + counts.certified + '.',
    'Failed: ' + counts.failed + '.',
    'Pending or unclassified: ' + counts.pending + '.'
  ].join(' ');
}

function sciip2840_CreateImportCertificationLedgerNextAction_(ledgerStatus) {
  if (ledgerStatus === 'IMPORT_CERTIFICATION_LEDGER_CERTIFIED') {
    return 'Proceed to SuperSheet import activation review.';
  }

  if (ledgerStatus === 'IMPORT_CERTIFICATION_BLOCKED') {
    return 'Hold import activation and review failed certification records.';
  }

  return 'Continue upstream certification processing before activation.';
}

function sciip2840_RuntimeBusinessKeyPrefixExists_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2840_SuperSheetImportCertificationLedgerProcessor() {
  const result = sciipRun2840_SuperSheetImportCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2840_SuperSheetImportCertificationLedgerProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Protection Layer
 * 2850_SuperSheetImportCommandCenterProcessor
 *
 * SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY → SUPERSHEET_IMPORT_COMMAND_CENTER
 *
 * Purpose:
 * Surfaces SuperSheet import certification posture to the
 * command center before import activation or downstream matching.
 *******************************************************/

function sciipGet2850_SuperSheetImportCommandCenterProcessorName_() {
  return '2850_SuperSheetImportCommandCenter';
}

function sciipGet2850_SuperSheetImportCommandCenterHeaders_() {
  return [
    'Command_Center_ID',
    'Business_Key',
    'Command_Center_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Import_Command_Status',
    'Import_Posture',
    'Command_Severity',
    'Command_Summary',
    'Recommended_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2850_SuperSheetImportCommandCenterSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_COMMAND_CENTER',
    sciipGet2850_SuperSheetImportCommandCenterHeaders_()
  );
}

function sciipRun2850_SuperSheetImportCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2850_SuperSheetImportCommandCenterProcessorName_(),
    action: 'SUPERSHEET_IMPORT_COMMAND_CENTER_UPDATE',
    sourceSheet: 'SUPERSHEET_IMPORT_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_COMMAND_CENTER',
    ledgerSheet: 'SUPERSHEET_IMPORT_COMMAND_CENTER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import command center runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2850_SuperSheetImportCommandCenterProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importCommandCenterStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2840_SuperSheetImportCertificationLedgerProcessor after 2830 creates import certification records.'
          })
        });
      }

      const commandCenterDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const commandCenterBusinessKey = 'SUPERSHEET_IMPORT_COMMAND_CENTER|' + commandCenterDate;

      if (sciip2850_RuntimeBusinessKeyPrefixExists_(definition.targetSheet, commandCenterBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2850_SuperSheetImportCommandCenterProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importCommandCenterStatus: 'DUPLICATE_SKIPPED',
            skippedDuplicate: 1,
            importCommandCenterBusinessKey: commandCenterBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const posture = sciip2850_DeriveImportPosture_(sourceRecords);
      const commandStatus = sciip2850_DeriveCommandStatus_(posture);
      const severity = sciip2850_DeriveCommandSeverity_(posture);
      const summary = sciip2850_CreateCommandSummary_(posture, commandStatus, sourceRecords.length);
      const recommendedAction = sciip2850_CreateRecommendedAction_(posture);

      const outputSheet = sciipEnsure2850_SuperSheetImportCommandCenterSheet_();
      outputSheet.appendRow([
        'SUPERSHEET_IMPORT_COMMAND_CENTER_' + Utilities.getUuid(),
        commandCenterBusinessKey,
        commandCenterDate,
        definition.sourceSheet,
        sourceRecords.length,
        commandStatus,
        posture,
        severity,
        summary,
        recommendedAction,
        new Date().toISOString(),
        sciipGet2850_SuperSheetImportCommandCenterProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2850_SuperSheetImportCommandCenterProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importCommandCenterStatus: commandStatus,
          importPosture: posture,
          commandSeverity: severity,
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          sourceRecordsReviewed: sourceRecords.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2860_SuperSheetImportCommandCenterLedgerProcessor'
        })
      });
    }
  });
}

function sciip2850_DeriveImportPosture_(records) {
  const text = JSON.stringify(records || []).toUpperCase();

  if (text.indexOf('BLOCKED') !== -1 || text.indexOf('FAILED') !== -1 || text.indexOf('NOT_CERTIFIED') !== -1) {
    return 'IMPORT_BLOCKED';
  }

  if (text.indexOf('PARTIAL') !== -1 || text.indexOf('PENDING') !== -1 || text.indexOf('REVIEW') !== -1) {
    return 'IMPORT_REVIEW_REQUIRED';
  }

  if (text.indexOf('CERTIFIED') !== -1 || text.indexOf('READY') !== -1 || text.indexOf('PASS') !== -1) {
    return 'IMPORT_READY';
  }

  return 'IMPORT_UNKNOWN';
}

function sciip2850_DeriveCommandStatus_(posture) {
  if (posture === 'IMPORT_READY') return 'COMMAND_CENTER_IMPORT_READY';
  if (posture === 'IMPORT_BLOCKED') return 'COMMAND_CENTER_IMPORT_BLOCKED';
  if (posture === 'IMPORT_REVIEW_REQUIRED') return 'COMMAND_CENTER_REVIEW_REQUIRED';
  return 'COMMAND_CENTER_IMPORT_UNKNOWN';
}

function sciip2850_DeriveCommandSeverity_(posture) {
  if (posture === 'IMPORT_READY') return 'LOW';
  if (posture === 'IMPORT_BLOCKED') return 'HIGH';
  if (posture === 'IMPORT_REVIEW_REQUIRED') return 'MEDIUM';
  return 'MEDIUM';
}

function sciip2850_CreateCommandSummary_(posture, commandStatus, sourceRecordCount) {
  return [
    'SuperSheet import command center update recorded.',
    'Posture: ' + posture + '.',
    'Command status: ' + commandStatus + '.',
    'Reviewed ' + sourceRecordCount + ' import certification ledger summary record(s).'
  ].join(' ');
}

function sciip2850_CreateRecommendedAction_(posture) {
  if (posture === 'IMPORT_READY') {
    return 'Proceed to SuperSheet import activation planning.';
  }

  if (posture === 'IMPORT_BLOCKED') {
    return 'Hold import activation and review blocked certification ledger summaries.';
  }

  if (posture === 'IMPORT_REVIEW_REQUIRED') {
    return 'Route import posture to operator review before activation.';
  }

  return 'Wait for complete import certification ledger summaries before activation.';
}

function sciip2850_RuntimeBusinessKeyPrefixExists_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2850_SuperSheetImportCommandCenterProcessor() {
  const result = sciipRun2850_SuperSheetImportCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2850_SuperSheetImportCommandCenterProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Protection Layer
 * 2860_SuperSheetImportDailyBriefProcessor
 *
 * SUPERSHEET_IMPORT_COMMAND_CENTER → SUPERSHEET_IMPORT_DAILY_BRIEF
 *
 * Purpose:
 * Converts SuperSheet import command-center posture into a
 * daily operational brief before activation or downstream matching.
 *******************************************************/

function sciipGet2860_SuperSheetImportDailyBriefProcessorName_() {
  return '2860_SuperSheetImportDailyBrief';
}

function sciipGet2860_SuperSheetImportDailyBriefHeaders_() {
  return [
    'Daily_Brief_ID',
    'Business_Key',
    'Brief_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Brief_Status',
    'Import_Posture',
    'Brief_Severity',
    'Brief_Title',
    'Brief_Summary',
    'Recommended_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2860_SuperSheetImportDailyBriefSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_DAILY_BRIEF',
    sciipGet2860_SuperSheetImportDailyBriefHeaders_()
  );
}

function sciipRun2860_SuperSheetImportDailyBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2860_SuperSheetImportDailyBriefProcessorName_(),
    action: 'SUPERSHEET_IMPORT_DAILY_BRIEF_BUILD',
    sourceSheet: 'SUPERSHEET_IMPORT_COMMAND_CENTER',
    targetSheet: 'SUPERSHEET_IMPORT_DAILY_BRIEF',
    ledgerSheet: 'SUPERSHEET_IMPORT_DAILY_BRIEF_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import daily brief runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2860_SuperSheetImportDailyBriefProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importDailyBriefStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2850_SuperSheetImportCommandCenterProcessor after 2840 creates import certification ledger summaries.'
          })
        });
      }

      const briefDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const dailyBriefBusinessKey = 'SUPERSHEET_IMPORT_DAILY_BRIEF|' + briefDate;

      if (sciip2860_RuntimeBusinessKeyPrefixExists_(definition.targetSheet, dailyBriefBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2860_SuperSheetImportDailyBriefProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importDailyBriefStatus: 'DUPLICATE_SKIPPED',
            skippedDuplicate: 1,
            importDailyBriefBusinessKey: dailyBriefBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const posture = sciip2860_DeriveImportPosture_(sourceRecords);
      const briefStatus = sciip2860_DeriveBriefStatus_(posture);
      const severity = sciip2860_DeriveBriefSeverity_(posture);
      const briefTitle = sciip2860_CreateBriefTitle_(briefDate, posture);
      const briefSummary = sciip2860_CreateBriefSummary_(posture, briefStatus, sourceRecords.length);
      const recommendedAction = sciip2860_CreateRecommendedAction_(posture);

      const outputSheet = sciipEnsure2860_SuperSheetImportDailyBriefSheet_();
      outputSheet.appendRow([
        'SUPERSHEET_IMPORT_DAILY_BRIEF_' + Utilities.getUuid(),
        dailyBriefBusinessKey,
        briefDate,
        definition.sourceSheet,
        sourceRecords.length,
        briefStatus,
        posture,
        severity,
        briefTitle,
        briefSummary,
        recommendedAction,
        new Date().toISOString(),
        sciipGet2860_SuperSheetImportDailyBriefProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2860_SuperSheetImportDailyBriefProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importDailyBriefStatus: briefStatus,
          importPosture: posture,
          briefSeverity: severity,
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet,
          sourceRecordsReviewed: sourceRecords.length,
          transactionId: transaction.transactionId,
          nextProcessor: '2870_SuperSheetImportDailyBriefLedgerProcessor'
        })
      });
    }
  });
}

function sciip2860_DeriveImportPosture_(records) {
  const text = JSON.stringify(records || []).toUpperCase();

  if (text.indexOf('BLOCKED') !== -1 || text.indexOf('FAILED') !== -1 || text.indexOf('NOT_CERTIFIED') !== -1) {
    return 'IMPORT_BLOCKED';
  }

  if (text.indexOf('REVIEW') !== -1 || text.indexOf('PENDING') !== -1 || text.indexOf('PARTIAL') !== -1) {
    return 'IMPORT_REVIEW_REQUIRED';
  }

  if (text.indexOf('IMPORT_READY') !== -1 || text.indexOf('CERTIFIED') !== -1 || text.indexOf('READY') !== -1 || text.indexOf('PASS') !== -1) {
    return 'IMPORT_READY';
  }

  return 'IMPORT_UNKNOWN';
}

function sciip2860_DeriveBriefStatus_(posture) {
  if (posture === 'IMPORT_READY') return 'DAILY_BRIEF_IMPORT_READY';
  if (posture === 'IMPORT_BLOCKED') return 'DAILY_BRIEF_IMPORT_BLOCKED';
  if (posture === 'IMPORT_REVIEW_REQUIRED') return 'DAILY_BRIEF_REVIEW_REQUIRED';
  return 'DAILY_BRIEF_IMPORT_UNKNOWN';
}

function sciip2860_DeriveBriefSeverity_(posture) {
  if (posture === 'IMPORT_READY') return 'LOW';
  if (posture === 'IMPORT_BLOCKED') return 'HIGH';
  if (posture === 'IMPORT_REVIEW_REQUIRED') return 'MEDIUM';
  return 'MEDIUM';
}

function sciip2860_CreateBriefTitle_(briefDate, posture) {
  return 'SuperSheet Import Daily Brief — ' + briefDate + ' — ' + posture;
}

function sciip2860_CreateBriefSummary_(posture, briefStatus, sourceRecordCount) {
  return [
    'SuperSheet import daily brief generated from command-center posture.',
    'Posture: ' + posture + '.',
    'Brief status: ' + briefStatus + '.',
    'Reviewed ' + sourceRecordCount + ' command-center record(s).'
  ].join(' ');
}

function sciip2860_CreateRecommendedAction_(posture) {
  if (posture === 'IMPORT_READY') {
    return 'Proceed toward SuperSheet import activation and downstream matching preparation.';
  }

  if (posture === 'IMPORT_BLOCKED') {
    return 'Do not activate import. Review failed or blocked quality/certification conditions.';
  }

  if (posture === 'IMPORT_REVIEW_REQUIRED') {
    return 'Route import posture to operator review before activation.';
  }

  return 'Wait for command-center posture to resolve before import activation.';
}

function sciip2860_RuntimeBusinessKeyPrefixExists_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2860_SuperSheetImportDailyBriefProcessor() {
  const result = sciipRun2860_SuperSheetImportDailyBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2860_SuperSheetImportDailyBriefProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 Runtime Processor
 * 2870_SuperSheetImportFinalCertificationProcessor
 *
 * SUPERSHEET_IMPORT_DAILY_BRIEF → SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS
 *
 * Purpose:
 * Final certification layer for the SuperSheet import protection chain.
 * Certifies whether the SuperSheet intake firewall is ready before
 * production SuperSheet loading / promotion / matching activity.
 *******************************************************/

function sciipGetSuperSheetImportFinalCertificationProcessorName2870_() {
  return '2870_SuperSheetImportFinalCertification';
}

function sciipGetSuperSheetImportFinalCertificationHeaders2870_() {
  return [
    'Certification_ID',
    'Business_Key',
    'Certification_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Status',
    'Import_Readiness_Status',
    'Quality_Posture',
    'Promotion_Gate_Posture',
    'Command_Center_Posture',
    'Certification_Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureSuperSheetImportFinalCertificationSchema2870_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS',
    sciipGetSuperSheetImportFinalCertificationHeaders2870_()
  );
}

function sciipRunSuperSheetImportFinalCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
    action: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_BUILD',
    sourceSheet: 'SUPERSHEET_IMPORT_DAILY_BRIEF',
    targetSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS',
    ledgerSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const dailyBriefRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: dailyBriefRecords.length,
        outputCount: dailyBriefRecords.length ? 1 : 0,
        summary: 'SuperSheet import final certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeVersion: 'v5.4',
          originalProcessor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
          inputSheets: ['SUPERSHEET_IMPORT_DAILY_BRIEF']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureSuperSheetImportFinalCertificationSchema2870_();
      const certificationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const finalCertificationBusinessKey = 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION|' + certificationDate;

      if (sciipSuperSheetRuntimeBusinessKeyExists2870_(definition.targetSheet, finalCertificationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importFinalCertificationStatus: 'DUPLICATE_SKIPPED',
            finalCertificationBusinessKey: finalCertificationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const dailyBriefRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!dailyBriefRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importFinalCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2860_SuperSheetImportDailyBriefProcessor after 2850 creates command center updates.'
          })
        });
      }

      const latestBrief = sciipGetLatestSuperSheetRecord2870_(dailyBriefRecords);
      const certificationStatus = sciipResolveSuperSheetFinalCertificationStatus2870_(latestBrief);
      const row = sciipCreateSuperSheetFinalCertificationRow2870_({
        businessKey: finalCertificationBusinessKey,
        certificationDate: certificationDate,
        sourceRows: dailyBriefRecords,
        latestBrief: latestBrief,
        certificationStatus: certificationStatus,
        processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_()
      });

      outputSheet.appendRow(row);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetSuperSheetImportFinalCertificationProcessorName2870_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: dailyBriefRecords.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          importFinalCertificationStatus: certificationStatus,
          dailyBriefRecordsReviewed: dailyBriefRecords.length,
          finalCertificationsCreated: 1,
          finalCertificationBusinessKey: finalCertificationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: 'Production SuperSheet import / promotion workflow'
        })
      });
    }
  });
}

function sciipSuperSheetRuntimeBusinessKeyExists2870_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciipGetLatestSuperSheetRecord2870_(records) {
  if (!records || !records.length) return {};
  return records[records.length - 1] || {};
}

function sciipResolveSuperSheetFinalCertificationStatus2870_(brief) {
  const values = Object.keys(brief || {}).map(function(key) {
    return String(brief[key] || '').toUpperCase();
  }).join(' | ');

  if (values.indexOf('FAILED') !== -1 || values.indexOf('BLOCKED') !== -1 || values.indexOf('NOT_READY') !== -1) {
    return 'NOT_CERTIFIED';
  }

  if (values.indexOf('SKIPPED_NO_INPUTS') !== -1 || values.indexOf('NEEDS_REVIEW') !== -1 || values.indexOf('REVIEW_REQUIRED') !== -1) {
    return 'CONDITIONALLY_CERTIFIED_REVIEW_REQUIRED';
  }

  return 'CERTIFIED';
}

function sciipCreateSuperSheetFinalCertificationRow2870_(args) {
  const status = args.certificationStatus;

  return [
    'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_' + Utilities.getUuid(),
    args.businessKey,
    args.certificationDate,
    'SUPERSHEET_IMPORT_DAILY_BRIEF',
    args.sourceRows.length,
    status,
    sciipResolveImportReadinessPosture2870_(args.latestBrief),
    sciipResolveQualityPosture2870_(args.latestBrief),
    sciipResolvePromotionGatePosture2870_(args.latestBrief),
    sciipResolveCommandCenterPosture2870_(args.latestBrief),
    sciipCreateSuperSheetFinalCertificationSummary2870_(status, args.sourceRows.length),
    sciipCreateSuperSheetFinalCertificationNextAction2870_(status),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipResolveImportReadinessPosture2870_(record) {
  return String(record.Import_Readiness_Status || record.Readiness_Status || record.importReadinessStatus || 'UNKNOWN').trim() || 'UNKNOWN';
}

function sciipResolveQualityPosture2870_(record) {
  return String(record.Quality_Posture || record.Data_Quality_Posture || record.dataQualityStatus || 'UNKNOWN').trim() || 'UNKNOWN';
}

function sciipResolvePromotionGatePosture2870_(record) {
  return String(record.Promotion_Gate_Posture || record.PromotionGate_Status || record.promotionGateStatus || 'UNKNOWN').trim() || 'UNKNOWN';
}

function sciipResolveCommandCenterPosture2870_(record) {
  return String(record.Command_Center_Posture || record.Command_Center_Status || record.importCommandCenterStatus || 'UNKNOWN').trim() || 'UNKNOWN';
}

function sciipCreateSuperSheetFinalCertificationSummary2870_(status, count) {
  if (status === 'CERTIFIED') {
    return 'SuperSheet import firewall is certified based on ' + count + ' daily brief record(s). Production import may proceed subject to normal operator controls.';
  }

  if (status === 'CONDITIONALLY_CERTIFIED_REVIEW_REQUIRED') {
    return 'SuperSheet import firewall completed with review-required indicators based on ' + count + ' daily brief record(s). Operator review is recommended before production import.';
  }

  return 'SuperSheet import firewall is not certified. Production import should remain blocked until upstream quality/readiness issues are resolved.';
}

function sciipCreateSuperSheetFinalCertificationNextAction2870_(status) {
  if (status === 'CERTIFIED') {
    return 'Proceed to controlled SuperSheet production import / promotion workflow.';
  }

  if (status === 'CONDITIONALLY_CERTIFIED_REVIEW_REQUIRED') {
    return 'Review SuperSheet import daily brief and command center records before enabling production promotion.';
  }

  return 'Resolve upstream SuperSheet quality, readiness, certification, or command center issues before importing.';
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2870_SuperSheetImportFinalCertificationProcessor() {
  const result = sciipRunSuperSheetImportFinalCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2870_SuperSheetImportFinalCertificationProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Protection Layer
 * 2880_SuperSheetImportFinalCertificationLedgerProcessor
 *
 * SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS → SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY
 *
 * Purpose:
 * Creates a durable ledger summary of final SuperSheet import
 * certification outcomes before production SuperSheet import,
 * promotion, or matching activity proceeds.
 *******************************************************/

function sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_() {
  return '2880_SuperSheetImportFinalCertificationLedger';
}

function sciipGet2880_SuperSheetImportFinalCertificationLedgerHeaders_() {
  return [
    'Ledger_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certified_Count',
    'Conditional_Count',
    'Not_Certified_Count',
    'Pending_Count',
    'Ledger_Status',
    'Certification_Posture',
    'Ledger_Summary',
    'Next_Action',
    'Created_At',
    'Processor',
    'Transaction_Id',
    'Summary_JSON'
  ];
}

function sciipEnsure2880_SuperSheetImportFinalCertificationLedgerSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY',
    sciipGet2880_SuperSheetImportFinalCertificationLedgerHeaders_()
  );
}

function sciipRun2880_SuperSheetImportFinalCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
    action: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY',
    sourceSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATIONS',
    targetSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY',
    ledgerSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import final certification ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          runtimeVersion: 'v5.4',
          originalProcessor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
          inputSheets: [definition.sourceSheet],
          upstreamProcessor: '2870_SuperSheetImportFinalCertification'
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      if (!definition.ledgerSheet) errors.push('Definition missing ledgerSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER|' + ledgerDate;
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importFinalCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2870_SuperSheetImportFinalCertificationProcessor after 2860 creates daily brief records.'
          })
        });
      }

      if (sciip2880_BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importFinalCertificationLedgerStatus: 'DUPLICATE_SKIPPED',
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const latestRecords = sciip2880_FilterLatestDateRecords_(sourceRecords);
      const summary = sciip2880_SummarizeFinalCertificationRecords_(latestRecords);
      const sheet = sciipEnsure2880_SuperSheetImportFinalCertificationLedgerSheet_();

      sheet.appendRow([
        'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        latestRecords.length,
        summary.certifiedCount,
        summary.conditionalCount,
        summary.notCertifiedCount,
        summary.pendingCount,
        summary.ledgerStatus,
        summary.certificationPosture,
        sciip2880_CreateFinalCertificationLedgerSummary_(summary),
        sciip2880_CreateFinalCertificationLedgerNextAction_(summary),
        new Date().toISOString(),
        sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
        transaction.transactionId,
        JSON.stringify(summary)
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2880_SuperSheetImportFinalCertificationLedgerProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: latestRecords.length,
        message: JSON.stringify({
          importFinalCertificationLedgerStatus: summary.ledgerStatus,
          ledgerBusinessKey: ledgerBusinessKey,
          sourceRecordsReviewed: latestRecords.length,
          certifiedCount: summary.certifiedCount,
          conditionalCount: summary.conditionalCount,
          notCertifiedCount: summary.notCertifiedCount,
          pendingCount: summary.pendingCount,
          certificationPosture: summary.certificationPosture,
          transactionId: transaction.transactionId,
          nextProcessor: 'Controlled SuperSheet production import / promotion workflow'
        })
      });
    }
  });
}

function sciip2880_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2880_FilterLatestDateRecords_(records) {
  if (!records || !records.length) return [];

  const dated = records.map(function(record) {
    return {
      record: record,
      dateKey: sciip2880_ResolveRecordDate_(record)
    };
  }).filter(function(item) {
    return item.dateKey;
  });

  if (!dated.length) return records;

  const dates = dated.map(function(item) { return item.dateKey; }).sort();
  const latest = dates[dates.length - 1];

  return dated.filter(function(item) {
    return item.dateKey === latest;
  }).map(function(item) {
    return item.record;
  });
}

function sciip2880_ResolveRecordDate_(record) {
  const fields = [
    'Certification_Date',
    'Ledger_Date',
    'Assessment_Date',
    'Created_At',
    'Completed_At'
  ];

  for (let i = 0; i < fields.length; i++) {
    const normalized = sciip2880_NormalizeDate_(record[fields[i]]);
    if (normalized) return normalized;
  }

  return '';
}

function sciip2880_NormalizeDate_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  const text = String(value).trim();
  const match = text.match(/^\d{4}-\d{2}-\d{2}/);
  if (match) return match[0];

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }

  return '';
}

function sciip2880_SummarizeFinalCertificationRecords_(records) {
  const summary = {
    certifiedCount: 0,
    conditionalCount: 0,
    notCertifiedCount: 0,
    pendingCount: 0,
    totalRecords: records.length,
    ledgerStatus: 'FINAL_CERTIFICATION_PENDING',
    certificationPosture: 'UNKNOWN'
  };

  records.forEach(function(record) {
    const status = sciip2880_ResolveCertificationStatus_(record);

    if (status === 'CERTIFIED') {
      summary.certifiedCount += 1;
    } else if (status === 'CONDITIONALLY_CERTIFIED_REVIEW_REQUIRED' || status === 'CONDITIONAL' || status === 'REVIEW_REQUIRED') {
      summary.conditionalCount += 1;
    } else if (status === 'NOT_CERTIFIED' || status === 'FAILED' || status === 'BLOCKED') {
      summary.notCertifiedCount += 1;
    } else {
      summary.pendingCount += 1;
    }
  });

  summary.ledgerStatus = sciip2880_DeriveFinalCertificationLedgerStatus_(summary);
  summary.certificationPosture = sciip2880_DeriveFinalCertificationPosture_(summary);

  return summary;
}

function sciip2880_ResolveCertificationStatus_(record) {
  return String(
    record.Certification_Status ||
    record.Import_Final_Certification_Status ||
    record.Final_Certification_Status ||
    record.Status ||
    ''
  ).trim().toUpperCase();
}

function sciip2880_DeriveFinalCertificationLedgerStatus_(summary) {
  if (summary.notCertifiedCount > 0) return 'FINAL_CERTIFICATION_BLOCKED';
  if (summary.certifiedCount > 0 && summary.conditionalCount === 0 && summary.pendingCount === 0) return 'FINAL_CERTIFICATION_LEDGER_CERTIFIED';
  if (summary.certifiedCount > 0 || summary.conditionalCount > 0) return 'FINAL_CERTIFICATION_REVIEW_REQUIRED';
  return 'FINAL_CERTIFICATION_PENDING';
}

function sciip2880_DeriveFinalCertificationPosture_(summary) {
  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_LEDGER_CERTIFIED') return 'READY_FOR_CONTROLLED_IMPORT';
  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_REVIEW_REQUIRED') return 'OPERATOR_REVIEW_REQUIRED';
  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_BLOCKED') return 'IMPORT_BLOCKED';
  return 'AWAITING_FINAL_CERTIFICATION';
}

function sciip2880_CreateFinalCertificationLedgerSummary_(summary) {
  return [
    'SuperSheet import final certification ledger summary recorded.',
    'Ledger status: ' + summary.ledgerStatus + '.',
    'Certification posture: ' + summary.certificationPosture + '.',
    'Certified: ' + summary.certifiedCount + '.',
    'Conditional/review-required: ' + summary.conditionalCount + '.',
    'Not certified/blocked: ' + summary.notCertifiedCount + '.',
    'Pending or unclassified: ' + summary.pendingCount + '.'
  ].join(' ');
}

function sciip2880_CreateFinalCertificationLedgerNextAction_(summary) {
  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_LEDGER_CERTIFIED') {
    return 'Proceed to controlled SuperSheet production import / promotion workflow subject to operator release controls.';
  }

  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_REVIEW_REQUIRED') {
    return 'Review final certification records before enabling SuperSheet production import.';
  }

  if (summary.ledgerStatus === 'FINAL_CERTIFICATION_BLOCKED') {
    return 'Hold SuperSheet production import and resolve failed final certification records.';
  }

  return 'Continue upstream SuperSheet import certification processing before production import.';
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2880_SuperSheetImportFinalCertificationLedgerProcessor() {
  const result = sciipRun2880_SuperSheetImportFinalCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2880_SuperSheetImportFinalCertificationLedgerProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS Runtime Processor
 * 2890_SuperSheetImportSystemCertificationProcessor
 *
 * SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS
 *
 * Purpose:
 * Creates a system-level certification record for the
 * SuperSheet import firewall after final certification
 * ledger summaries exist.
 *
 * Runtime pattern:
 * - SCIIP_RuntimeProcessorBase
 * - Skip-safe when upstream records do not exist
 * - Duplicate-safe through shared runtime framework
 * - No destructive updates
 *******************************************************/

function sciipRun2890_SuperSheetImportSystemCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2890_SuperSheetImportSystemCertification',
    action: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_BUILD',
    sourceSheet: 'SUPERSHEET_IMPORT_FINAL_CERTIFICATION_LEDGER_SUMMARY',
    targetSheet: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS',
    ledgerSheet: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: records.length,
        outputCount: records.length ? 1 : 0,
        summary: 'SuperSheet import system certification payload created.',
        refs: {
          migrationVersion: 'v5.4.0',
          subsystem: 'SUPERSHEET_IMPORT_FIREWALL',
          sourceSheet: definition.sourceSheet,
          targetSheet: definition.targetSheet
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);
      const targetSheet = sciipEnsure2890_SuperSheetImportSystemCertificationSheet_();

      if (!sourceRecords || sourceRecords.length === 0) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importSystemCertificationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2880_SuperSheetImportFinalCertificationLedgerProcessor after 2870 creates final certification records.'
          })
        });
      }

      const latest = sourceRecords[sourceRecords.length - 1] || {};
      const certificationDate = SCIIP_RUNTIME.getDateKey({});
      const certificationKey = 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION|' + certificationDate;

      if (sciip2890_BusinessKeyExists_(definition.targetSheet, certificationKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: context.processor,
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importSystemCertificationStatus: 'DUPLICATE_SKIPPED',
            importSystemCertificationBusinessKey: certificationKey,
            sourceRecordsReviewed: sourceRecords.length,
            transactionId: transaction.transactionId
          })
        });
      }

      const finalStatus = String(
        latest.Final_Certification_Status ||
        latest.Certification_Status ||
        latest.Status ||
        latest.importFinalCertificationStatus ||
        ''
      ).trim().toUpperCase();

      const systemStatus = sciip2890_ResolveSystemCertificationStatus_(finalStatus, sourceRecords.length);
      const posture = sciip2890_ResolveSystemPosture_(systemStatus);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_' + Utilities.getUuid(),
        certificationKey,
        certificationDate,
        definition.sourceSheet,
        sourceRecords.length,
        systemStatus,
        posture,
        sciip2890_CreateSystemCertificationSummary_(systemStatus, sourceRecords.length),
        sciip2890_CreateSystemCertificationDecision_(systemStatus),
        sciip2890_CreateSystemCertificationNextAction_(systemStatus),
        transaction.transactionId,
        new Date().toISOString(),
        context.processor
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importSystemCertificationStatus: systemStatus,
          systemPosture: posture,
          sourceRecordsReviewed: sourceRecords.length,
          importSystemCertificationBusinessKey: certificationKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2900_SuperSheetImportSystemCertificationLedgerProcessor'
        })
      });
    }
  });
}

function sciipEnsure2890_SuperSheetImportSystemCertificationSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS',
    [
      'System_Certification_ID',
      'Business_Key',
      'Certification_Date',
      'Source_Sheet',
      'Source_Record_Count',
      'System_Certification_Status',
      'System_Posture',
      'Certification_Summary',
      'Certification_Decision',
      'Next_Action',
      'Transaction_ID',
      'Created_At',
      'Processor'
    ]
  );
}

function sciip2890_BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;

  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey || key.indexOf(businessKey + '|') === 0;
  });
}

function sciip2890_ResolveSystemCertificationStatus_(finalStatus, count) {
  if (!count) return 'NOT_CERTIFIED';
  if (finalStatus.indexOf('CERTIFIED') !== -1 || finalStatus.indexOf('PASS') !== -1) {
    return 'CERTIFIED';
  }
  if (finalStatus.indexOf('FAILED') !== -1 || finalStatus.indexOf('BLOCK') !== -1) {
    return 'NOT_CERTIFIED';
  }
  return 'REVIEW_REQUIRED';
}

function sciip2890_ResolveSystemPosture_(status) {
  if (status === 'CERTIFIED') return 'READY_FOR_CONTROLLED_SUPERSHEET_IMPORT';
  if (status === 'NOT_CERTIFIED') return 'IMPORT_BLOCKED';
  return 'IMPORT_REVIEW_REQUIRED';
}

function sciip2890_CreateSystemCertificationSummary_(status, count) {
  return [
    'SCIIP_OS reviewed ' + count + ' SuperSheet import final certification ledger summary record(s).',
    'System certification status: ' + status + '.',
    'This certification governs whether SuperSheet import may proceed into controlled production intake.'
  ].join(' ');
}

function sciip2890_CreateSystemCertificationDecision_(status) {
  if (status === 'CERTIFIED') return 'ALLOW_CONTROLLED_IMPORT';
  if (status === 'NOT_CERTIFIED') return 'BLOCK_IMPORT';
  return 'REQUIRE_OPERATOR_REVIEW';
}

function sciip2890_CreateSystemCertificationNextAction_(status) {
  if (status === 'CERTIFIED') {
    return 'Proceed to controlled SuperSheet import pilot and monitor downstream data quality, promotion gate, and match outcomes.';
  }
  if (status === 'NOT_CERTIFIED') {
    return 'Do not import SuperSheets. Review final certification failures and rerun the SuperSheet import firewall chain.';
  }
  return 'Review SuperSheet final certification ledger summaries before allowing import into matching and promotion workflows.';
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2890_SuperSheetImportSystemCertificationProcessor() {
  const result = sciipRun2890_SuperSheetImportSystemCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2890_SuperSheetImportSystemCertificationProcessor',
    result: result
  }));

  return result;
}


/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2900_SuperSheetImportSystemCertificationLedgerProcessor
 *
 * SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS
 *   → SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY
 *
 * Purpose:
 * Creates a durable ledger summary for SuperSheet import
 * system-level certification records.
 *******************************************************/

function sciipGet2900ProcessorName_() {
  return '2900_SuperSheetImportSystemCertificationLedger';
}

function sciipGet2900SourceSheet_() {
  return 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATIONS';
}

function sciipGet2900TargetSheet_() {
  return 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet2900Action_() {
  return 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet2900Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certified_Count',
    'Failed_Count',
    'Skipped_Count',
    'System_Certification_Ledger_Status',
    'System_Certification_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2900TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2900TargetSheet_(),
    sciipGet2900Headers_()
  );
}

function sciipRun2900_SuperSheetImportSystemCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2900ProcessorName_(),
    action: sciipGet2900Action_(),
    sourceSheet: sciipGet2900SourceSheet_(),
    targetSheet: sciipGet2900TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import system certification ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2900TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2900ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            importSystemCertificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2890_SuperSheetImportSystemCertificationProcessor after 2880 creates final certification ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER|' + ledgerDate;

      if (sciip2900BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2900ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            importSystemCertificationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2900CountCertificationStatuses_(sourceRecords);
      const posture = sciip2900ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.certified,
        counts.failed,
        counts.skipped,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2900ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2900ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          importSystemCertificationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          certifiedCount: counts.certified,
          failedCount: counts.failed,
          skippedCount: counts.skipped,
          systemCertificationPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2910_SuperSheetImportReleaseGateProcessor'
        })
      });
    }
  });
}

function sciip2900BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKey;
  });
}

function sciip2900CountCertificationStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (statusText.indexOf('CERTIFIED') !== -1 || statusText.indexOf('PASS') !== -1) {
      counts.certified += 1;
    } else if (statusText.indexOf('FAIL') !== -1 || statusText.indexOf('BLOCK') !== -1 || statusText.indexOf('NOT_CERTIFIED') !== -1) {
      counts.failed += 1;
    } else if (statusText.indexOf('SKIPPED') !== -1 || statusText.indexOf('NO_INPUT') !== -1) {
      counts.skipped += 1;
    } else {
      counts.skipped += 1;
    }

    return counts;
  }, { certified: 0, failed: 0, skipped: 0 });
}

function sciip2900ResolvePosture_(counts, total) {
  if (counts.failed > 0) {
    return {
      status: 'SYSTEM_CERTIFICATION_LEDGER_RECORDED_WITH_FAILURES',
      posture: 'IMPORT_NOT_READY',
      summary: 'SuperSheet import system certification ledger recorded failures or blocking conditions.',
      nextAction: 'Review failed certification records before releasing SuperSheet import workflow.'
    };
  }

  if (counts.certified > 0 && counts.certified === total) {
    return {
      status: 'SYSTEM_CERTIFICATION_LEDGER_CERTIFIED',
      posture: 'IMPORT_READY',
      summary: 'All SuperSheet import system certification records are certified.',
      nextAction: 'Proceed to SuperSheet import release gate.'
    };
  }

  if (counts.certified > 0) {
    return {
      status: 'SYSTEM_CERTIFICATION_LEDGER_PARTIAL_CERTIFICATION',
      posture: 'IMPORT_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import system certification records are certified, but not all records reached a certified posture.',
      nextAction: 'Review skipped or incomplete certification records before release.'
    };
  }

  return {
    status: 'SYSTEM_CERTIFICATION_LEDGER_UNCERTIFIED',
    posture: 'IMPORT_NOT_READY',
    summary: 'No certified SuperSheet import system certification records were found.',
    nextAction: 'Run upstream SuperSheet import certification processors with valid input records.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2900_SuperSheetImportSystemCertificationLedgerProcessor() {
  const result = sciipRun2900_SuperSheetImportSystemCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2900_SuperSheetImportSystemCertificationLedgerProcessor',
    result: result
  }));

  return result;
}


/************************************************************
 * 290_LearningWeightAdjustmentProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert action outcomes into reusable learning weights.
 *
 * Input:
 * - ACTION_OUTCOME
 *
 * Output:
 * - LEARNING_WEIGHT
 ************************************************************/

const SCIIP_LEARNING_WEIGHT_PROCESSOR = '290_LearningWeightAdjustmentProcessor';
const SCIIP_LEARNING_WEIGHT_SHEET = 'LEARNING_WEIGHT';

const SCIIP_LEARNING_WEIGHT_HEADERS = [
  'Weight_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Action_Type',
  'Outcome_Class',
  'Weight_Type',
  'Weight_Adjustment',
  'Learning_Text',
  'Confidence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunLearningWeightAdjustmentProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_LEARNING_WEIGHT_SHEET, SCIIP_LEARNING_WEIGHT_HEADERS);

  const outcomeSheet = ss.getSheetByName('ACTION_OUTCOME');
  const weightSheet = ss.getSheetByName(SCIIP_LEARNING_WEIGHT_SHEET);

  if (!outcomeSheet) throw new Error('Missing ACTION_OUTCOME. Run 280 first.');

  const outcomes = sciipReadSheetAsObjects_(outcomeSheet);
  const existingKeys = sciipGetExistingColumnValues_(weightSheet, 'Business_Key');

  let outcomesReviewed = 0;
  let weightsCreated = 0;
  let skippedDuplicate = 0;

  outcomes.forEach(function(outcome) {
    if (!outcome.Outcome_ID || !outcome.Business_Key) return;

    outcomesReviewed++;

    const weight = sciipCreateLearningWeight_(outcome);

    if (existingKeys.has(weight.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(weightSheet, SCIIP_LEARNING_WEIGHT_HEADERS, weight);
    existingKeys.add(weight.Business_Key);
    weightsCreated++;
  });

  const result = {
    processor: SCIIP_LEARNING_WEIGHT_PROCESSOR,
    status: 'SUCCESS',
    outcomesReviewed: outcomesReviewed,
    weightsCreated: weightsCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * FACTORY
 ************************************************************/

function sciipCreateLearningWeight_(outcome) {
  const now = new Date().toISOString();

  const adjustment = sciipWeightAdjustmentFromOutcome_(outcome);
  const weightType = sciipWeightTypeFromOutcome_(outcome);
  const learningText = sciipBuildLearningWeightText_(outcome, adjustment);

  const keyBasis = [
    outcome.Business_Key,
    outcome.Action_Type,
    outcome.Outcome_Class,
    weightType,
    adjustment
  ].join('|');

  const businessKey = 'LEARNING_WEIGHT|' + sciipStableHash_(keyBasis);

  return {
    Weight_ID: 'LW_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: 'ACTION_OUTCOME',
    Source_ID: outcome.Outcome_ID || '',
    Market: outcome.Market || '',
    Submarket: outcome.Submarket || '',
    City: outcome.City || '',
    Industry: outcome.Industry || '',
    Action_Type: outcome.Action_Type || '',
    Outcome_Class: outcome.Outcome_Class || '',
    Weight_Type: weightType,
    Weight_Adjustment: adjustment,
    Learning_Text: learningText,
    Confidence: sciipNormalizeConfidence_(outcome.Confidence),
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_LEARNING_WEIGHT_PROCESSOR,
    Notes: 'Generated from action outcome learning.'
  };
}

/************************************************************
 * WEIGHT LOGIC
 ************************************************************/

function sciipWeightAdjustmentFromOutcome_(outcome) {
  const c = String(outcome.Outcome_Class || '').toUpperCase();

  if (c === 'POSITIVE_OUTCOME') return 0.15;
  if (c === 'ONGOING_OUTCOME') return 0.05;
  if (c === 'NEUTRAL_OUTCOME') return 0;
  if (c === 'NEGATIVE_OUTCOME') return -0.1;
  if (c === 'UNSPECIFIED_OUTCOME') return 0;

  return 0;
}

function sciipWeightTypeFromOutcome_(outcome) {
  const actionType = String(outcome.Action_Type || '').toUpperCase();

  if (actionType.indexOf('RENT') >= 0 || actionType.indexOf('PRICING') >= 0) {
    return 'PRICING_ACTION_WEIGHT';
  }

  if (actionType.indexOf('ADVANCED_MANUFACTURING') >= 0) {
    return 'ADVANCED_MANUFACTURING_ACTION_WEIGHT';
  }

  if (actionType.indexOf('CLUSTER') >= 0 || actionType.indexOf('MAP') >= 0) {
    return 'CLUSTER_ACTION_WEIGHT';
  }

  if (actionType.indexOf('OUTREACH') >= 0) {
    return 'OUTREACH_ACTION_WEIGHT';
  }

  return 'GENERAL_ACTION_WEIGHT';
}

function sciipBuildLearningWeightText_(outcome, adjustment) {
  const location = outcome.City || outcome.Submarket || outcome.Market || 'the market';
  const actionType = outcome.Action_Type || 'action';

  if (adjustment > 0) {
    return 'Increase future weighting for ' + actionType + ' in ' + location + ' based on positive or ongoing outcome evidence.';
  }

  if (adjustment < 0) {
    return 'Decrease future weighting for ' + actionType + ' in ' + location + ' based on negative outcome evidence.';
  }

  return 'Maintain current weighting for ' + actionType + ' in ' + location + '.';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestLearningWeightAdjustmentProcessor() {
  const result = sciipRunLearningWeightAdjustmentProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestLearningWeightAdjustmentProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2910_SuperSheetImportReleaseGateProcessor
 *******************************************************/

function sciipGet2910ProcessorName_() {
  return '2910_SuperSheetImportReleaseGate';
}

function sciipGet2910SourceSheet_() {
  return 'SUPERSHEET_IMPORT_SYSTEM_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet2910TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE';
}

function sciipGet2910Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE';
}

function sciipGet2910Headers_() {
  return [
    'Release_Gate_ID',
    'Business_Key',
    'Gate_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Release_Gate_Status',
    'Release_Posture',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2910TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2910TargetSheet_(),
    sciipGet2910Headers_()
  );
}

function sciipRun2910_SuperSheetImportReleaseGateProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2910ProcessorName_(),
    action: sciipGet2910Action_(),
    sourceSheet: sciipGet2910SourceSheet_(),
    targetSheet: sciipGet2910TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_GATE_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release gate runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2910TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2910ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseGateStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2900_SuperSheetImportSystemCertificationLedgerProcessor after 2890 creates system certification records.'
          })
        });
      }

      const gateDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const gateBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_GATE|' + gateDate;

      if (sciip2910BusinessKeyExists_(definition.targetSheet, gateBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2910ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseGateStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            gateBusinessKey: gateBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const posture = sciip2910ResolveReleaseGatePosture_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_GATE_' + Utilities.getUuid(),
        gateBusinessKey,
        gateDate,
        definition.sourceSheet,
        sourceRecords.length,
        posture.status,
        posture.posture,
        posture.blockingReason,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2910ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2910ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseGateStatus: posture.status,
          releasePosture: posture.posture,
          blockingReason: posture.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          gateBusinessKey: gateBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2920_SuperSheetImportReleaseGateLedgerProcessor'
        })
      });
    }
  });
}

function sciip2910BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2910ResolveReleaseGatePosture_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('SYSTEM_CERTIFICATION_LEDGER_CERTIFIED') !== -1 ||
    statusText.indexOf('IMPORT_READY') !== -1
  ) {
    return {
      status: 'RELEASE_GATE_OPEN',
      posture: 'IMPORT_RELEASE_READY',
      blockingReason: '',
      summary: 'SuperSheet import system certification ledger is certified and ready for release.',
      nextAction: 'Proceed to release gate ledger summary.'
    };
  }

  if (
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('IMPORT_NOT_READY') !== -1
  ) {
    return {
      status: 'RELEASE_GATE_BLOCKED',
      posture: 'IMPORT_RELEASE_BLOCKED',
      blockingReason: 'System certification ledger indicates failed or blocking conditions.',
      summary: 'SuperSheet import release is blocked pending review.',
      nextAction: 'Review upstream certification failures before release.'
    };
  }

  return {
    status: 'RELEASE_GATE_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    blockingReason: 'System certification ledger did not produce a fully certified release posture.',
    summary: 'SuperSheet import release requires review before proceeding.',
    nextAction: 'Review system certification ledger summary before release.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2910_SuperSheetImportReleaseGateProcessor() {
  const result = sciipRun2910_SuperSheetImportReleaseGateProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2910_SuperSheetImportReleaseGateProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2920_SuperSheetImportReleaseGateLedgerProcessor
 *******************************************************/

function sciipGet2920ProcessorName_() {
  return '2920_SuperSheetImportReleaseGateLedger';
}

function sciipGet2920SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE';
}

function sciipGet2920TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_SUMMARY';
}

function sciipGet2920Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_SUMMARY';
}

function sciipGet2920Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Open_Count',
    'Blocked_Count',
    'Review_Required_Count',
    'Release_Gate_Ledger_Status',
    'Release_Gate_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2920TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2920TargetSheet_(),
    sciipGet2920Headers_()
  );
}

function sciipRun2920_SuperSheetImportReleaseGateLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2920ProcessorName_(),
    action: sciipGet2920Action_(),
    sourceSheet: sciipGet2920SourceSheet_(),
    targetSheet: sciipGet2920TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release gate ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2920TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2920ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseGateLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2910_SuperSheetImportReleaseGateProcessor after 2900 creates release-ready certification ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER|' + ledgerDate;

      if (sciip2920BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2920ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseGateLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2920CountReleaseGateStatuses_(sourceRecords);
      const posture = sciip2920ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.open,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2920ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2920ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseGateLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          openCount: counts.open,
          blockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          releaseGatePosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2930_SuperSheetImportReleaseAuthorizationProcessor'
        })
      });
    }
  });
}

function sciip2920BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2920CountReleaseGateStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RELEASE_GATE_OPEN') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_READY') !== -1
    ) {
      counts.open += 1;
    } else if (
      statusText.indexOf('RELEASE_GATE_BLOCKED') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { open: 0, blocked: 0, reviewRequired: 0 });
}

function sciip2920ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'RELEASE_GATE_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_RELEASE_BLOCKED',
      summary: 'SuperSheet import release gate ledger recorded blocking conditions.',
      nextAction: 'Review blocked release gate records before authorizing import release.'
    };
  }

  if (counts.open > 0 && counts.open === total) {
    return {
      status: 'RELEASE_GATE_LEDGER_OPEN',
      posture: 'IMPORT_RELEASE_READY',
      summary: 'All SuperSheet import release gate records are open and ready for release authorization.',
      nextAction: 'Proceed to SuperSheet import release authorization.'
    };
  }

  if (counts.open > 0) {
    return {
      status: 'RELEASE_GATE_LEDGER_PARTIAL_OPEN',
      posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import release gate records are open, but not all records reached release-ready posture.',
      nextAction: 'Review release gate records before authorization.'
    };
  }

  return {
    status: 'RELEASE_GATE_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    summary: 'No fully open SuperSheet import release gate records were found.',
    nextAction: 'Run upstream release gate processor with certified inputs.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2920_SuperSheetImportReleaseGateLedgerProcessor() {
  const result = sciipRun2920_SuperSheetImportReleaseGateLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2920_SuperSheetImportReleaseGateLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2930_SuperSheetImportReleaseAuthorizationProcessor
 *******************************************************/

function sciipGet2930ProcessorName_() {
  return '2930_SuperSheetImportReleaseAuthorization';
}

function sciipGet2930SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_SUMMARY';
}

function sciipGet2930TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATIONS';
}

function sciipGet2930Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION';
}

function sciipGet2930Headers_() {
  return [
    'Release_Authorization_ID',
    'Business_Key',
    'Authorization_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Release_Authorization_Status',
    'Authorization_Posture',
    'Authorization_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2930TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2930TargetSheet_(),
    sciipGet2930Headers_()
  );
}

function sciipRun2930_SuperSheetImportReleaseAuthorizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2930ProcessorName_(),
    action: sciipGet2930Action_(),
    sourceSheet: sciipGet2930SourceSheet_(),
    targetSheet: sciipGet2930TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release authorization runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2930TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2930ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseAuthorizationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2920_SuperSheetImportReleaseGateLedgerProcessor after 2910 creates release gate records.'
          })
        });
      }

      const authorizationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const authorizationBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION|' + authorizationDate;

      if (sciip2930BusinessKeyExists_(definition.targetSheet, authorizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2930ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseAuthorizationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            authorizationBusinessKey: authorizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const authorization = sciip2930ResolveAuthorization_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_' + Utilities.getUuid(),
        authorizationBusinessKey,
        authorizationDate,
        definition.sourceSheet,
        sourceRecords.length,
        authorization.status,
        authorization.posture,
        authorization.decision,
        authorization.blockingReason,
        authorization.summary,
        authorization.nextAction,
        new Date().toISOString(),
        sciipGet2930ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2930ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseAuthorizationStatus: authorization.status,
          authorizationPosture: authorization.posture,
          authorizationDecision: authorization.decision,
          blockingReason: authorization.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          authorizationBusinessKey: authorizationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2940_SuperSheetImportReleaseAuthorizationLedgerProcessor'
        })
      });
    }
  });
}

function sciip2930BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2930ResolveAuthorization_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('RELEASE_GATE_LEDGER_OPEN') !== -1 &&
    statusText.indexOf('IMPORT_RELEASE_READY') !== -1
  ) {
    return {
      status: 'RELEASE_AUTHORIZED',
      posture: 'IMPORT_RELEASE_AUTHORIZED',
      decision: 'AUTHORIZED',
      blockingReason: '',
      summary: 'SuperSheet import release is authorized based on open release gate ledger posture.',
      nextAction: 'Proceed to release authorization ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1
  ) {
    return {
      status: 'RELEASE_AUTHORIZATION_BLOCKED',
      posture: 'IMPORT_RELEASE_BLOCKED',
      decision: 'NOT_AUTHORIZED',
      blockingReason: 'Release gate ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import release authorization is blocked.',
      nextAction: 'Review release gate ledger blockers before authorization.'
    };
  }

  return {
    status: 'RELEASE_AUTHORIZATION_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Release gate ledger did not produce a fully open release posture.',
    summary: 'SuperSheet import release authorization requires review.',
    nextAction: 'Review release gate ledger summary before authorizing release.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2930_SuperSheetImportReleaseAuthorizationProcessor() {
  const result = sciipRun2930_SuperSheetImportReleaseAuthorizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2930_SuperSheetImportReleaseAuthorizationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2940_SuperSheetImportReleaseAuthorizationLedgerProcessor
 *******************************************************/

function sciipGet2940ProcessorName_() {
  return '2940_SuperSheetImportReleaseAuthorizationLedger';
}

function sciipGet2940SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATIONS';
}

function sciipGet2940TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet2940Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet2940Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Authorized_Count',
    'Blocked_Count',
    'Review_Required_Count',
    'Authorization_Ledger_Status',
    'Authorization_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2940TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2940TargetSheet_(),
    sciipGet2940Headers_()
  );
}

function sciipRun2940_SuperSheetImportReleaseAuthorizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2940ProcessorName_(),
    action: sciipGet2940Action_(),
    sourceSheet: sciipGet2940SourceSheet_(),
    targetSheet: sciipGet2940TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release authorization ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2940TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2940ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            authorizationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2930_SuperSheetImportReleaseAuthorizationProcessor after 2920 creates release gate ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER|' + ledgerDate;

      if (sciip2940BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2940ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            authorizationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2940CountAuthorizationStatuses_(sourceRecords);
      const posture = sciip2940ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.authorized,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2940ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2940ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          authorizationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          authorizedCount: counts.authorized,
          blockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          authorizationPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2950_SuperSheetImportReleaseCommandProcessor'
        })
      });
    }
  });
}

function sciip2940BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2940CountAuthorizationStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RELEASE_AUTHORIZED') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_AUTHORIZED') !== -1 ||
      statusText.indexOf('AUTHORIZED') !== -1
    ) {
      counts.authorized += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('NOT_AUTHORIZED') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { authorized: 0, blocked: 0, reviewRequired: 0 });
}

function sciip2940ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'AUTHORIZATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_RELEASE_BLOCKED',
      summary: 'SuperSheet import release authorization ledger recorded blocking conditions.',
      nextAction: 'Review blocked authorization records before issuing import release command.'
    };
  }

  if (counts.authorized > 0 && counts.authorized === total) {
    return {
      status: 'AUTHORIZATION_LEDGER_AUTHORIZED',
      posture: 'IMPORT_RELEASE_AUTHORIZED',
      summary: 'All SuperSheet import release authorization records are authorized.',
      nextAction: 'Proceed to SuperSheet import release command.'
    };
  }

  if (counts.authorized > 0) {
    return {
      status: 'AUTHORIZATION_LEDGER_PARTIAL_AUTHORIZATION',
      posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import release authorization records are authorized, but not all records reached authorized posture.',
      nextAction: 'Review authorization records before issuing release command.'
    };
  }

  return {
    status: 'AUTHORIZATION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    summary: 'No authorized SuperSheet import release authorization records were found.',
    nextAction: 'Run upstream authorization processor with release-ready ledger input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2940_SuperSheetImportReleaseAuthorizationLedgerProcessor() {
  const result = sciipRun2940_SuperSheetImportReleaseAuthorizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2940_SuperSheetImportReleaseAuthorizationLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2950_SuperSheetImportReleaseCommandProcessor
 *******************************************************/

function sciipGet2950ProcessorName_() {
  return '2950_SuperSheetImportReleaseCommand';
}

function sciipGet2950SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet2950TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMANDS';
}

function sciipGet2950Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMAND';
}

function sciipGet2950Headers_() {
  return [
    'Release_Command_ID',
    'Business_Key',
    'Command_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Release_Command_Status',
    'Command_Posture',
    'Command_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2950TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2950TargetSheet_(),
    sciipGet2950Headers_()
  );
}

function sciipRun2950_SuperSheetImportReleaseCommandProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2950ProcessorName_(),
    action: sciipGet2950Action_(),
    sourceSheet: sciipGet2950SourceSheet_(),
    targetSheet: sciipGet2950TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_COMMAND_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release command runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2950TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2950ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseCommandStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2940_SuperSheetImportReleaseAuthorizationLedgerProcessor after 2930 creates release authorization records.'
          })
        });
      }

      const commandDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const commandBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_COMMAND|' + commandDate;

      if (sciip2950BusinessKeyExists_(definition.targetSheet, commandBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2950ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseCommandStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            commandBusinessKey: commandBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const command = sciip2950ResolveReleaseCommand_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_COMMAND_' + Utilities.getUuid(),
        commandBusinessKey,
        commandDate,
        definition.sourceSheet,
        sourceRecords.length,
        command.status,
        command.posture,
        command.decision,
        command.blockingReason,
        command.summary,
        command.nextAction,
        new Date().toISOString(),
        sciipGet2950ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2950ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseCommandStatus: command.status,
          commandPosture: command.posture,
          commandDecision: command.decision,
          blockingReason: command.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          commandBusinessKey: commandBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2960_SuperSheetImportReleaseCommandLedgerProcessor'
        })
      });
    }
  });
}

function sciip2950BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2950ResolveReleaseCommand_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('AUTHORIZATION_LEDGER_AUTHORIZED') !== -1 &&
    statusText.indexOf('IMPORT_RELEASE_AUTHORIZED') !== -1
  ) {
    return {
      status: 'RELEASE_COMMAND_ISSUED',
      posture: 'IMPORT_RELEASE_COMMAND_ISSUED',
      decision: 'COMMAND_ISSUED',
      blockingReason: '',
      summary: 'SuperSheet import release command issued based on authorized release ledger posture.',
      nextAction: 'Proceed to release command ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1
  ) {
    return {
      status: 'RELEASE_COMMAND_BLOCKED',
      posture: 'IMPORT_RELEASE_BLOCKED',
      decision: 'COMMAND_NOT_ISSUED',
      blockingReason: 'Release authorization ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import release command is blocked.',
      nextAction: 'Review authorization ledger blockers before issuing release command.'
    };
  }

  return {
    status: 'RELEASE_COMMAND_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Release authorization ledger did not produce a fully authorized release posture.',
    summary: 'SuperSheet import release command requires review.',
    nextAction: 'Review authorization ledger summary before issuing release command.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2950_SuperSheetImportReleaseCommandProcessor() {
  const result = sciipRun2950_SuperSheetImportReleaseCommandProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2950_SuperSheetImportReleaseCommandProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2960_SuperSheetImportReleaseCommandLedgerProcessor
 *******************************************************/

function sciipGet2960ProcessorName_() {
  return '2960_SuperSheetImportReleaseCommandLedger';
}

function sciipGet2960SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMANDS';
}

function sciipGet2960TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_SUMMARY';
}

function sciipGet2960Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_SUMMARY';
}

function sciipGet2960Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Command_Issued_Count',
    'Command_Blocked_Count',
    'Review_Required_Count',
    'Release_Command_Ledger_Status',
    'Release_Command_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2960TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2960TargetSheet_(),
    sciipGet2960Headers_()
  );
}

function sciipRun2960_SuperSheetImportReleaseCommandLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2960ProcessorName_(),
    action: sciipGet2960Action_(),
    sourceSheet: sciipGet2960SourceSheet_(),
    targetSheet: sciipGet2960TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release command ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2960TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2960ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseCommandLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2950_SuperSheetImportReleaseCommandProcessor after 2940 creates release authorization ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER|' + ledgerDate;

      if (sciip2960BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2960ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseCommandLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2960CountCommandStatuses_(sourceRecords);
      const posture = sciip2960ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.commandIssued,
        counts.commandBlocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2960ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2960ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseCommandLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          commandIssuedCount: counts.commandIssued,
          commandBlockedCount: counts.commandBlocked,
          reviewRequiredCount: counts.reviewRequired,
          releaseCommandPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2970_SuperSheetImportExecutionHandoffProcessor'
        })
      });
    }
  });
}

function sciip2960BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2960CountCommandStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RELEASE_COMMAND_ISSUED') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_COMMAND_ISSUED') !== -1 ||
      statusText.indexOf('COMMAND_ISSUED') !== -1
    ) {
      counts.commandIssued += 1;
    } else if (
      statusText.indexOf('RELEASE_COMMAND_BLOCKED') !== -1 ||
      statusText.indexOf('COMMAND_NOT_ISSUED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.commandBlocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { commandIssued: 0, commandBlocked: 0, reviewRequired: 0 });
}

function sciip2960ResolvePosture_(counts, total) {
  if (counts.commandBlocked > 0) {
    return {
      status: 'RELEASE_COMMAND_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_RELEASE_BLOCKED',
      summary: 'SuperSheet import release command ledger recorded blocking conditions.',
      nextAction: 'Review blocked command records before execution handoff.'
    };
  }

  if (counts.commandIssued > 0 && counts.commandIssued === total) {
    return {
      status: 'RELEASE_COMMAND_LEDGER_ISSUED',
      posture: 'IMPORT_RELEASE_COMMAND_ISSUED',
      summary: 'All SuperSheet import release command records were issued successfully.',
      nextAction: 'Proceed to SuperSheet import execution handoff.'
    };
  }

  if (counts.commandIssued > 0) {
    return {
      status: 'RELEASE_COMMAND_LEDGER_PARTIAL_ISSUANCE',
      posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import release command records were issued, but not all records reached command-issued posture.',
      nextAction: 'Review release command records before execution handoff.'
    };
  }

  return {
    status: 'RELEASE_COMMAND_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    summary: 'No issued SuperSheet import release command records were found.',
    nextAction: 'Run upstream release command processor with authorized input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2960_SuperSheetImportReleaseCommandLedgerProcessor() {
  const result = sciipRun2960_SuperSheetImportReleaseCommandLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2960_SuperSheetImportReleaseCommandLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2970_SuperSheetImportExecutionHandoffProcessor
 *******************************************************/

function sciipGet2970ProcessorName_() {
  return '2970_SuperSheetImportExecutionHandoff';
}

function sciipGet2970SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_COMMAND_LEDGER_SUMMARY';
}

function sciipGet2970TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFFS';
}

function sciipGet2970Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF';
}

function sciipGet2970Headers_() {
  return [
    'Execution_Handoff_ID',
    'Business_Key',
    'Handoff_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Handoff_Status',
    'Execution_Posture',
    'Handoff_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2970TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2970TargetSheet_(),
    sciipGet2970Headers_()
  );
}

function sciipRun2970_SuperSheetImportExecutionHandoffProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2970ProcessorName_(),
    action: sciipGet2970Action_(),
    sourceSheet: sciipGet2970SourceSheet_(),
    targetSheet: sciipGet2970TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution handoff runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2970TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2970ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionHandoffStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2960_SuperSheetImportReleaseCommandLedgerProcessor after 2950 creates release command records.'
          })
        });
      }

      const handoffDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const handoffBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF|' + handoffDate;

      if (sciip2970BusinessKeyExists_(definition.targetSheet, handoffBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2970ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionHandoffStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            handoffBusinessKey: handoffBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const handoff = sciip2970ResolveExecutionHandoff_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_' + Utilities.getUuid(),
        handoffBusinessKey,
        handoffDate,
        definition.sourceSheet,
        sourceRecords.length,
        handoff.status,
        handoff.posture,
        handoff.decision,
        handoff.blockingReason,
        handoff.summary,
        handoff.nextAction,
        new Date().toISOString(),
        sciipGet2970ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2970ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionHandoffStatus: handoff.status,
          executionPosture: handoff.posture,
          handoffDecision: handoff.decision,
          blockingReason: handoff.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          handoffBusinessKey: handoffBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2980_SuperSheetImportExecutionHandoffLedgerProcessor'
        })
      });
    }
  });
}

function sciip2970BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2970ResolveExecutionHandoff_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('RELEASE_COMMAND_LEDGER_ISSUED') !== -1 &&
    statusText.indexOf('IMPORT_RELEASE_COMMAND_ISSUED') !== -1
  ) {
    return {
      status: 'EXECUTION_HANDOFF_CREATED',
      posture: 'IMPORT_EXECUTION_READY',
      decision: 'HANDOFF_CREATED',
      blockingReason: '',
      summary: 'SuperSheet import execution handoff created from issued release command ledger posture.',
      nextAction: 'Proceed to execution handoff ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_HANDOFF_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'HANDOFF_NOT_CREATED',
      blockingReason: 'Release command ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution handoff is blocked.',
      nextAction: 'Review release command ledger blockers before execution handoff.'
    };
  }

  return {
    status: 'EXECUTION_HANDOFF_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Release command ledger did not produce a command-issued posture.',
    summary: 'SuperSheet import execution handoff requires review.',
    nextAction: 'Review release command ledger summary before execution handoff.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2970_SuperSheetImportExecutionHandoffProcessor() {
  const result = sciipRun2970_SuperSheetImportExecutionHandoffProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2970_SuperSheetImportExecutionHandoffProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2980_SuperSheetImportExecutionHandoffLedgerProcessor
 *******************************************************/

function sciipGet2980ProcessorName_() {
  return '2980_SuperSheetImportExecutionHandoffLedger';
}

function sciipGet2980SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFFS';
}

function sciipGet2980TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet2980Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet2980Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Handoff_Created_Count',
    'Handoff_Blocked_Count',
    'Review_Required_Count',
    'Execution_Handoff_Ledger_Status',
    'Execution_Handoff_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2980TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2980TargetSheet_(),
    sciipGet2980Headers_()
  );
}

function sciipRun2980_SuperSheetImportExecutionHandoffLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2980ProcessorName_(),
    action: sciipGet2980Action_(),
    sourceSheet: sciipGet2980SourceSheet_(),
    targetSheet: sciipGet2980TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution handoff ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2980TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2980ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionHandoffLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2970_SuperSheetImportExecutionHandoffProcessor after 2960 creates release command ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER|' + ledgerDate;

      if (sciip2980BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2980ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionHandoffLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2980CountHandoffStatuses_(sourceRecords);
      const posture = sciip2980ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.handoffCreated,
        counts.handoffBlocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2980ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2980ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionHandoffLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          handoffCreatedCount: counts.handoffCreated,
          handoffBlockedCount: counts.handoffBlocked,
          reviewRequiredCount: counts.reviewRequired,
          executionHandoffPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2990_SuperSheetImportExecutionReadinessProcessor'
        })
      });
    }
  });
}

function sciip2980BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2980CountHandoffStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_HANDOFF_CREATED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_READY') !== -1 ||
      statusText.indexOf('HANDOFF_CREATED') !== -1
    ) {
      counts.handoffCreated += 1;
    } else if (
      statusText.indexOf('EXECUTION_HANDOFF_BLOCKED') !== -1 ||
      statusText.indexOf('HANDOFF_NOT_CREATED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.handoffBlocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { handoffCreated: 0, handoffBlocked: 0, reviewRequired: 0 });
}

function sciip2980ResolvePosture_(counts, total) {
  if (counts.handoffBlocked > 0) {
    return {
      status: 'EXECUTION_HANDOFF_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution handoff ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution handoff records before execution readiness.'
    };
  }

  if (counts.handoffCreated > 0 && counts.handoffCreated === total) {
    return {
      status: 'EXECUTION_HANDOFF_LEDGER_CREATED',
      posture: 'IMPORT_EXECUTION_READY',
      summary: 'All SuperSheet import execution handoff records were created successfully.',
      nextAction: 'Proceed to SuperSheet import execution readiness.'
    };
  }

  if (counts.handoffCreated > 0) {
    return {
      status: 'EXECUTION_HANDOFF_LEDGER_PARTIAL_HANDOFF',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution handoff records were created, but not all records reached execution-ready posture.',
      nextAction: 'Review execution handoff records before execution readiness.'
    };
  }

  return {
    status: 'EXECUTION_HANDOFF_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No created SuperSheet import execution handoff records were found.',
    nextAction: 'Run upstream execution handoff processor with issued release command input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2980_SuperSheetImportExecutionHandoffLedgerProcessor() {
  const result = sciipRun2980_SuperSheetImportExecutionHandoffLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2980_SuperSheetImportExecutionHandoffLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2990_SuperSheetImportExecutionReadinessProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_EXECUTION_READINESS
 *
 * Purpose:
 * Determines whether the SuperSheet import workflow is
 * ready to enter execution after firewall release handoff.
 *******************************************************/

function sciipGet2990ProcessorName_() {
  return '2990_SuperSheetImportExecutionReadiness';
}

function sciipGet2990SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet2990TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS';
}

function sciipGet2990Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS';
}

function sciipGet2990Headers_() {
  return [
    'Execution_Readiness_ID',
    'Business_Key',
    'Readiness_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Readiness_Status',
    'Execution_Readiness_Posture',
    'Readiness_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2990TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2990TargetSheet_(),
    sciipGet2990Headers_()
  );
}

function sciipRun2990_SuperSheetImportExecutionReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2990ProcessorName_(),
    action: sciipGet2990Action_(),
    sourceSheet: sciipGet2990SourceSheet_(),
    targetSheet: sciipGet2990TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_READINESS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution readiness runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure2990TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2990ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionReadinessStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2980_SuperSheetImportExecutionHandoffLedgerProcessor after 2970 creates execution handoff records.'
          })
        });
      }

      const readinessDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const readinessBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_READINESS|' + readinessDate;

      if (sciip2990BusinessKeyExists_(definition.targetSheet, readinessBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2990ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionReadinessStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            readinessBusinessKey: readinessBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const readiness = sciip2990ResolveExecutionReadiness_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_READINESS_' + Utilities.getUuid(),
        readinessBusinessKey,
        readinessDate,
        definition.sourceSheet,
        sourceRecords.length,
        readiness.status,
        readiness.posture,
        readiness.decision,
        readiness.blockingReason,
        readiness.summary,
        readiness.nextAction,
        new Date().toISOString(),
        sciipGet2990ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2990ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionReadinessStatus: readiness.status,
          executionReadinessPosture: readiness.posture,
          readinessDecision: readiness.decision,
          blockingReason: readiness.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          readinessBusinessKey: readinessBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3000_SuperSheetImportExecutionReadinessLedgerProcessor'
        })
      });
    }
  });
}

function sciip2990BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2990ResolveExecutionReadiness_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_HANDOFF_LEDGER_CREATED') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_READY') !== -1
  ) {
    return {
      status: 'EXECUTION_READY',
      posture: 'IMPORT_EXECUTION_READY',
      decision: 'READY_FOR_EXECUTION',
      blockingReason: '',
      summary: 'SuperSheet import execution readiness confirmed from execution handoff ledger.',
      nextAction: 'Proceed to execution readiness ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_READINESS_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'NOT_READY_FOR_EXECUTION',
      blockingReason: 'Execution handoff ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution readiness is blocked.',
      nextAction: 'Review execution handoff ledger blockers before execution.'
    };
  }

  return {
    status: 'EXECUTION_READINESS_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution handoff ledger did not produce a fully execution-ready posture.',
    summary: 'SuperSheet import execution readiness requires review.',
    nextAction: 'Review execution handoff ledger summary before execution.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2990_SuperSheetImportExecutionReadinessProcessor() {
  const result = sciipRun2990_SuperSheetImportExecutionReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2990_SuperSheetImportExecutionReadinessProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3000_SuperSheetImportExecutionReadinessLedgerProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_READINESS
 *   → SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY
 *******************************************************/

function sciipGet3000ProcessorName_() {
  return '3000_SuperSheetImportExecutionReadinessLedger';
}

function sciipGet3000SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS';
}

function sciipGet3000TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY';
}

function sciipGet3000Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY';
}

function sciipGet3000Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Ready_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Readiness_Ledger_Status',
    'Execution_Readiness_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3000TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3000TargetSheet_(),
    sciipGet3000Headers_()
  );
}

function sciipRun3000_SuperSheetImportExecutionReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3000ProcessorName_(),
    action: sciipGet3000Action_(),
    sourceSheet: sciipGet3000SourceSheet_(),
    targetSheet: sciipGet3000TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution readiness ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3000TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3000ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionReadinessLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2990_SuperSheetImportExecutionReadinessProcessor after 2980 creates execution handoff ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER|' + ledgerDate;

      if (sciip3000BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3000ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionReadinessLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3000CountExecutionReadinessStatuses_(sourceRecords);
      const posture = sciip3000ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3000ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3000ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionReadinessLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionReadyCount: counts.ready,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionReadinessPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3010_SuperSheetImportExecutionActivationProcessor'
        })
      });
    }
  });
}

function sciip3000BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3000CountExecutionReadinessStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_READY') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_READY') !== -1 ||
      statusText.indexOf('READY_FOR_EXECUTION') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('EXECUTION_READINESS_BLOCKED') !== -1 ||
      statusText.indexOf('NOT_READY_FOR_EXECUTION') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3000ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_READINESS_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution readiness ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution readiness records before execution activation.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'EXECUTION_READINESS_LEDGER_READY',
      posture: 'IMPORT_EXECUTION_READY',
      summary: 'All SuperSheet import execution readiness records are ready for execution.',
      nextAction: 'Proceed to SuperSheet import execution activation.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'EXECUTION_READINESS_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution readiness records are ready, but not all records reached execution-ready posture.',
      nextAction: 'Review execution readiness records before activation.'
    };
  }

  return {
    status: 'EXECUTION_READINESS_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No execution-ready SuperSheet import readiness records were found.',
    nextAction: 'Run upstream execution readiness processor with valid handoff ledger input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3000_SuperSheetImportExecutionReadinessLedgerProcessor() {
  const result = sciipRun3000_SuperSheetImportExecutionReadinessLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3000_SuperSheetImportExecutionReadinessLedgerProcessor',
    result: result
  }));

  return result;
}

/************************************************************
 * 300_IntelligenceFeedbackLoopProcessor.gs
 * SCIIP_OS v4.0
 *
 * Purpose:
 * Convert learning weights into reusable intelligence feedback.
 *
 * Input:
 * - LEARNING_WEIGHT
 *
 * Output:
 * - INTELLIGENCE_FEEDBACK
 ************************************************************/

const SCIIP_INTELLIGENCE_FEEDBACK_PROCESSOR = '300_IntelligenceFeedbackLoopProcessor';
const SCIIP_INTELLIGENCE_FEEDBACK_SHEET = 'INTELLIGENCE_FEEDBACK';

const SCIIP_INTELLIGENCE_FEEDBACK_HEADERS = [
  'Feedback_ID',
  'Business_Key',
  'Source_Type',
  'Source_ID',
  'Market',
  'Submarket',
  'City',
  'Industry',
  'Feedback_Type',
  'Feedback_Text',
  'Weight_Adjustment',
  'Confidence_Adjustment',
  'Priority_Adjustment',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

function sciipRunIntelligenceFeedbackLoopProcessor() {
  const startedAt = new Date();
  const ss = sciipGetRuntimeSpreadsheet_();

  sciipEnsureSheetWithHeaders_(ss, SCIIP_INTELLIGENCE_FEEDBACK_SHEET, SCIIP_INTELLIGENCE_FEEDBACK_HEADERS);

  const weightSheet = ss.getSheetByName('LEARNING_WEIGHT');
  const feedbackSheet = ss.getSheetByName(SCIIP_INTELLIGENCE_FEEDBACK_SHEET);

  if (!weightSheet) throw new Error('Missing LEARNING_WEIGHT. Run 290 first.');

  const weights = sciipReadSheetAsObjects_(weightSheet).filter(function(w) {
    return String(w.Status || '').toUpperCase() === 'ACTIVE';
  });

  const existingKeys = sciipGetExistingColumnValues_(feedbackSheet, 'Business_Key');

  let weightsReviewed = 0;
  let feedbackCreated = 0;
  let skippedDuplicate = 0;

  weights.forEach(function(w) {
    if (!w.Weight_ID || !w.Business_Key) return;

    weightsReviewed++;

    const feedback = sciipCreateIntelligenceFeedback_(w);

    if (existingKeys.has(feedback.Business_Key)) {
      skippedDuplicate++;
      return;
    }

    sciipAppendObjectRow_(feedbackSheet, SCIIP_INTELLIGENCE_FEEDBACK_HEADERS, feedback);
    existingKeys.add(feedback.Business_Key);
    feedbackCreated++;
  });

  const result = {
    processor: SCIIP_INTELLIGENCE_FEEDBACK_PROCESSOR,
    status: 'SUCCESS',
    weightsReviewed: weightsReviewed,
    feedbackCreated: feedbackCreated,
    skippedDuplicate: skippedDuplicate,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/************************************************************
 * FACTORY
 ************************************************************/

function sciipCreateIntelligenceFeedback_(weight) {
  const now = new Date().toISOString();

  const weightAdjustment = Number(weight.Weight_Adjustment || 0);
  const confidenceAdjustment = sciipConfidenceAdjustmentFromWeight_(weightAdjustment);
  const priorityAdjustment = sciipPriorityAdjustmentFromWeight_(weightAdjustment);
  const feedbackType = sciipFeedbackTypeFromWeight_(weight);
  const feedbackText = sciipBuildFeedbackText_(weight, confidenceAdjustment, priorityAdjustment);

  const keyBasis = [
    weight.Business_Key,
    feedbackType,
    weightAdjustment,
    confidenceAdjustment,
    priorityAdjustment
  ].join('|');

  const businessKey = 'INTELLIGENCE_FEEDBACK|' + sciipStableHash_(keyBasis);

  return {
    Feedback_ID: 'IF_' + sciipStableHash_(businessKey).substring(0, 16),
    Business_Key: businessKey,
    Source_Type: 'LEARNING_WEIGHT',
    Source_ID: weight.Weight_ID || '',
    Market: weight.Market || '',
    Submarket: weight.Submarket || '',
    City: weight.City || '',
    Industry: weight.Industry || '',
    Feedback_Type: feedbackType,
    Feedback_Text: feedbackText,
    Weight_Adjustment: weightAdjustment,
    Confidence_Adjustment: confidenceAdjustment,
    Priority_Adjustment: priorityAdjustment,
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SCIIP_INTELLIGENCE_FEEDBACK_PROCESSOR,
    Notes: 'Generated from learning weight.'
  };
}

/************************************************************
 * FEEDBACK LOGIC
 ************************************************************/

function sciipFeedbackTypeFromWeight_(weight) {
  const type = String(weight.Weight_Type || '').toUpperCase();

  if (type.indexOf('PRICING') >= 0) return 'PRICING_FEEDBACK';
  if (type.indexOf('ADVANCED_MANUFACTURING') >= 0) return 'ADVANCED_MANUFACTURING_FEEDBACK';
  if (type.indexOf('CLUSTER') >= 0) return 'CLUSTER_FEEDBACK';
  if (type.indexOf('OUTREACH') >= 0) return 'OUTREACH_FEEDBACK';

  return 'GENERAL_FEEDBACK';
}

function sciipConfidenceAdjustmentFromWeight_(weightAdjustment) {
  const w = Number(weightAdjustment || 0);

  if (w >= 0.15) return 0.05;
  if (w >= 0.05) return 0.02;
  if (w <= -0.1) return -0.04;

  return 0;
}

function sciipPriorityAdjustmentFromWeight_(weightAdjustment) {
  const w = Number(weightAdjustment || 0);

  if (w >= 0.15) return 1;
  if (w <= -0.1) return -1;

  return 0;
}

function sciipBuildFeedbackText_(weight, confidenceAdjustment, priorityAdjustment) {
  const location = weight.City || weight.Submarket || weight.Market || 'the market';
  const type = weight.Weight_Type || 'general intelligence';

  if (confidenceAdjustment > 0 || priorityAdjustment > 0) {
    return 'Increase future confidence or priority for ' + type + ' in ' + location + ' based on positive learning weight.';
  }

  if (confidenceAdjustment < 0 || priorityAdjustment < 0) {
    return 'Reduce future confidence or priority for ' + type + ' in ' + location + ' based on negative learning weight.';
  }

  return 'Maintain current confidence and priority for ' + type + ' in ' + location + '.';
}

/************************************************************
 * TEST
 ************************************************************/

function sciipTestIntelligenceFeedbackLoopProcessor() {
  const result = sciipRunIntelligenceFeedbackLoopProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestIntelligenceFeedbackLoopProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3010_SuperSheetImportExecutionActivationProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_EXECUTION_ACTIVATIONS
 *******************************************************/

function sciipGet3010ProcessorName_() {
  return '3010_SuperSheetImportExecutionActivation';
}

function sciipGet3010SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_READINESS_LEDGER_SUMMARY';
}

function sciipGet3010TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATIONS';
}

function sciipGet3010Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION';
}

function sciipGet3010Headers_() {
  return [
    'Execution_Activation_ID',
    'Business_Key',
    'Activation_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Activation_Status',
    'Execution_Activation_Posture',
    'Activation_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3010TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3010TargetSheet_(),
    sciipGet3010Headers_()
  );
}

function sciipRun3010_SuperSheetImportExecutionActivationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3010ProcessorName_(),
    action: sciipGet3010Action_(),
    sourceSheet: sciipGet3010SourceSheet_(),
    targetSheet: sciipGet3010TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution activation runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3010TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3010ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionActivationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3000_SuperSheetImportExecutionReadinessLedgerProcessor after 2990 creates execution readiness records.'
          })
        });
      }

      const activationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const activationBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION|' + activationDate;

      if (sciip3010BusinessKeyExists_(definition.targetSheet, activationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3010ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionActivationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            activationBusinessKey: activationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const activation = sciip3010ResolveExecutionActivation_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_' + Utilities.getUuid(),
        activationBusinessKey,
        activationDate,
        definition.sourceSheet,
        sourceRecords.length,
        activation.status,
        activation.posture,
        activation.decision,
        activation.blockingReason,
        activation.summary,
        activation.nextAction,
        new Date().toISOString(),
        sciipGet3010ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3010ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionActivationStatus: activation.status,
          executionActivationPosture: activation.posture,
          activationDecision: activation.decision,
          blockingReason: activation.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          activationBusinessKey: activationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3020_SuperSheetImportExecutionActivationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3010BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3010ResolveExecutionActivation_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_READINESS_LEDGER_READY') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_READY') !== -1
  ) {
    return {
      status: 'EXECUTION_ACTIVATED',
      posture: 'IMPORT_EXECUTION_ACTIVATED',
      decision: 'ACTIVATED',
      blockingReason: '',
      summary: 'SuperSheet import execution activated from ready execution-readiness ledger posture.',
      nextAction: 'Proceed to execution activation ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_ACTIVATION_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'NOT_ACTIVATED',
      blockingReason: 'Execution readiness ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution activation is blocked.',
      nextAction: 'Review execution readiness ledger blockers before activation.'
    };
  }

  return {
    status: 'EXECUTION_ACTIVATION_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution readiness ledger did not produce a fully ready execution posture.',
    summary: 'SuperSheet import execution activation requires review.',
    nextAction: 'Review execution readiness ledger summary before activation.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3010_SuperSheetImportExecutionActivationProcessor() {
  const result = sciipRun3010_SuperSheetImportExecutionActivationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3010_SuperSheetImportExecutionActivationProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3020_SuperSheetImportExecutionActivationLedgerProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_ACTIVATIONS
 *   → SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY
 *******************************************************/

function sciipGet3020ProcessorName_() {
  return '3020_SuperSheetImportExecutionActivationLedger';
}

function sciipGet3020SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATIONS';
}

function sciipGet3020TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY';
}

function sciipGet3020Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY';
}

function sciipGet3020Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Activated_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Activation_Ledger_Status',
    'Execution_Activation_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3020TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3020TargetSheet_(),
    sciipGet3020Headers_()
  );
}

function sciipRun3020_SuperSheetImportExecutionActivationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3020ProcessorName_(),
    action: sciipGet3020Action_(),
    sourceSheet: sciipGet3020SourceSheet_(),
    targetSheet: sciipGet3020TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution activation ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3020TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3020ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionActivationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3010_SuperSheetImportExecutionActivationProcessor after 3000 creates execution readiness ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER|' + ledgerDate;

      if (sciip3020BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3020ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionActivationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3020CountExecutionActivationStatuses_(sourceRecords);
      const posture = sciip3020ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.activated,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3020ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3020ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionActivationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionActivatedCount: counts.activated,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionActivationPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3030_SuperSheetImportExecutionControlProcessor'
        })
      });
    }
  });
}

function sciip3020BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3020CountExecutionActivationStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_ACTIVATED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_ACTIVATED') !== -1 ||
      statusText.indexOf('ACTIVATED') !== -1
    ) {
      counts.activated += 1;
    } else if (
      statusText.indexOf('EXECUTION_ACTIVATION_BLOCKED') !== -1 ||
      statusText.indexOf('NOT_ACTIVATED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { activated: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3020ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_ACTIVATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution activation ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution activation records before execution control.'
    };
  }

  if (counts.activated > 0 && counts.activated === total) {
    return {
      status: 'EXECUTION_ACTIVATION_LEDGER_ACTIVATED',
      posture: 'IMPORT_EXECUTION_ACTIVATED',
      summary: 'All SuperSheet import execution activation records were activated successfully.',
      nextAction: 'Proceed to SuperSheet import execution control.'
    };
  }

  if (counts.activated > 0) {
    return {
      status: 'EXECUTION_ACTIVATION_LEDGER_PARTIAL_ACTIVATION',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution activation records were activated, but not all records reached activated posture.',
      nextAction: 'Review execution activation records before execution control.'
    };
  }

  return {
    status: 'EXECUTION_ACTIVATION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No activated SuperSheet import execution activation records were found.',
    nextAction: 'Run upstream execution activation processor with ready execution input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3020_SuperSheetImportExecutionActivationLedgerProcessor() {
  const result = sciipRun3020_SuperSheetImportExecutionActivationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3020_SuperSheetImportExecutionActivationLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3030_SuperSheetImportExecutionControlProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_EXECUTION_CONTROLS
 *******************************************************/

function sciipGet3030ProcessorName_() {
  return '3030_SuperSheetImportExecutionControl';
}

function sciipGet3030SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ACTIVATION_LEDGER_SUMMARY';
}

function sciipGet3030TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROLS';
}

function sciipGet3030Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROL';
}

function sciipGet3030Headers_() {
  return [
    'Execution_Control_ID',
    'Business_Key',
    'Control_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Control_Status',
    'Execution_Control_Posture',
    'Control_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3030TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3030TargetSheet_(),
    sciipGet3030Headers_()
  );
}

function sciipRun3030_SuperSheetImportExecutionControlProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3030ProcessorName_(),
    action: sciipGet3030Action_(),
    sourceSheet: sciipGet3030SourceSheet_(),
    targetSheet: sciipGet3030TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution control runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3030TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3030ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionControlStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3020_SuperSheetImportExecutionActivationLedgerProcessor after 3010 creates execution activation records.'
          })
        });
      }

      const controlDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const controlBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_CONTROL|' + controlDate;

      if (sciip3030BusinessKeyExists_(definition.targetSheet, controlBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3030ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionControlStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            controlBusinessKey: controlBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const control = sciip3030ResolveExecutionControl_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_CONTROL_' + Utilities.getUuid(),
        controlBusinessKey,
        controlDate,
        definition.sourceSheet,
        sourceRecords.length,
        control.status,
        control.posture,
        control.decision,
        control.blockingReason,
        control.summary,
        control.nextAction,
        new Date().toISOString(),
        sciipGet3030ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3030ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionControlStatus: control.status,
          executionControlPosture: control.posture,
          controlDecision: control.decision,
          blockingReason: control.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          controlBusinessKey: controlBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3040_SuperSheetImportExecutionControlLedgerProcessor'
        })
      });
    }
  });
}

function sciip3030BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3030ResolveExecutionControl_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_ACTIVATION_LEDGER_ACTIVATED') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_ACTIVATED') !== -1
  ) {
    return {
      status: 'EXECUTION_CONTROL_OPEN',
      posture: 'IMPORT_EXECUTION_CONTROL_OPEN',
      decision: 'CONTROL_OPENED',
      blockingReason: '',
      summary: 'SuperSheet import execution control opened from activated execution ledger posture.',
      nextAction: 'Proceed to execution control ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_CONTROL_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'CONTROL_NOT_OPENED',
      blockingReason: 'Execution activation ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution control is blocked.',
      nextAction: 'Review execution activation ledger blockers before execution control.'
    };
  }

  return {
    status: 'EXECUTION_CONTROL_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution activation ledger did not produce a fully activated posture.',
    summary: 'SuperSheet import execution control requires review.',
    nextAction: 'Review execution activation ledger summary before execution control.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3030_SuperSheetImportExecutionControlProcessor() {
  const result = sciipRun3030_SuperSheetImportExecutionControlProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3030_SuperSheetImportExecutionControlProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3040_SuperSheetImportExecutionControlLedgerProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_CONTROLS
 *   → SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY
 *******************************************************/

function sciipGet3040ProcessorName_() {
  return '3040_SuperSheetImportExecutionControlLedger';
}

function sciipGet3040SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROLS';
}

function sciipGet3040TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY';
}

function sciipGet3040Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY';
}

function sciipGet3040Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Control_Open_Count',
    'Execution_Control_Blocked_Count',
    'Review_Required_Count',
    'Execution_Control_Ledger_Status',
    'Execution_Control_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3040TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3040TargetSheet_(),
    sciipGet3040Headers_()
  );
}

function sciipRun3040_SuperSheetImportExecutionControlLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3040ProcessorName_(),
    action: sciipGet3040Action_(),
    sourceSheet: sciipGet3040SourceSheet_(),
    targetSheet: sciipGet3040TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution control ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3040TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3040ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionControlLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3030_SuperSheetImportExecutionControlProcessor after 3020 creates execution activation ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER|' + ledgerDate;

      if (sciip3040BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3040ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionControlLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3040CountExecutionControlStatuses_(sourceRecords);
      const posture = sciip3040ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.open,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3040ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3040ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionControlLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionControlOpenCount: counts.open,
          executionControlBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionControlPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3050_SuperSheetImportExecutionDispatchProcessor'
        })
      });
    }
  });
}

function sciip3040BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3040CountExecutionControlStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_CONTROL_OPEN') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_CONTROL_OPEN') !== -1 ||
      statusText.indexOf('CONTROL_OPENED') !== -1
    ) {
      counts.open += 1;
    } else if (
      statusText.indexOf('EXECUTION_CONTROL_BLOCKED') !== -1 ||
      statusText.indexOf('CONTROL_NOT_OPENED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { open: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3040ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_CONTROL_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution control ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution control records before execution dispatch.'
    };
  }

  if (counts.open > 0 && counts.open === total) {
    return {
      status: 'EXECUTION_CONTROL_LEDGER_OPEN',
      posture: 'IMPORT_EXECUTION_CONTROL_OPEN',
      summary: 'All SuperSheet import execution control records are open.',
      nextAction: 'Proceed to SuperSheet import execution dispatch.'
    };
  }

  if (counts.open > 0) {
    return {
      status: 'EXECUTION_CONTROL_LEDGER_PARTIAL_OPEN',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution control records are open, but not all records reached control-open posture.',
      nextAction: 'Review execution control records before dispatch.'
    };
  }

  return {
    status: 'EXECUTION_CONTROL_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No open SuperSheet import execution control records were found.',
    nextAction: 'Run upstream execution control processor with activated execution input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3040_SuperSheetImportExecutionControlLedgerProcessor() {
  const result = sciipRun3040_SuperSheetImportExecutionControlLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3040_SuperSheetImportExecutionControlLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3050_SuperSheetImportExecutionDispatchProcessor
 *
 * SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY
 *   → SUPERSHEET_IMPORT_EXECUTION_DISPATCHES
 *******************************************************/

function sciipGet3050ProcessorName_() {
  return '3050_SuperSheetImportExecutionDispatch';
}

function sciipGet3050SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CONTROL_LEDGER_SUMMARY';
}

function sciipGet3050TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCHES';
}

function sciipGet3050Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH';
}

function sciipGet3050Headers_() {
  return [
    'Execution_Dispatch_ID',
    'Business_Key',
    'Dispatch_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Dispatch_Status',
    'Execution_Dispatch_Posture',
    'Dispatch_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3050TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3050TargetSheet_(),
    sciipGet3050Headers_()
  );
}

function sciipRun3050_SuperSheetImportExecutionDispatchProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3050ProcessorName_(),
    action: sciipGet3050Action_(),
    sourceSheet: sciipGet3050SourceSheet_(),
    targetSheet: sciipGet3050TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution dispatch runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3050TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3050ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionDispatchStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3040_SuperSheetImportExecutionControlLedgerProcessor after 3030 creates execution control records.'
          })
        });
      }

      const dispatchDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const dispatchBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH|' + dispatchDate;

      if (sciip3050BusinessKeyExists_(definition.targetSheet, dispatchBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3050ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionDispatchStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            dispatchBusinessKey: dispatchBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const dispatch = sciip3050ResolveExecutionDispatch_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_' + Utilities.getUuid(),
        dispatchBusinessKey,
        dispatchDate,
        definition.sourceSheet,
        sourceRecords.length,
        dispatch.status,
        dispatch.posture,
        dispatch.decision,
        dispatch.blockingReason,
        dispatch.summary,
        dispatch.nextAction,
        new Date().toISOString(),
        sciipGet3050ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3050ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionDispatchStatus: dispatch.status,
          executionDispatchPosture: dispatch.posture,
          dispatchDecision: dispatch.decision,
          blockingReason: dispatch.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          dispatchBusinessKey: dispatchBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3060_SuperSheetImportExecutionDispatchLedgerProcessor'
        })
      });
    }
  });
}

function sciip3050BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3050ResolveExecutionDispatch_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_CONTROL_LEDGER_OPEN') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_CONTROL_OPEN') !== -1
  ) {
    return {
      status: 'EXECUTION_DISPATCHED',
      posture: 'IMPORT_EXECUTION_DISPATCHED',
      decision: 'DISPATCHED',
      blockingReason: '',
      summary: 'SuperSheet import execution dispatched from open execution control ledger posture.',
      nextAction: 'Proceed to execution dispatch ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_DISPATCH_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'NOT_DISPATCHED',
      blockingReason: 'Execution control ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution dispatch is blocked.',
      nextAction: 'Review execution control ledger blockers before dispatch.'
    };
  }

  return {
    status: 'EXECUTION_DISPATCH_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution control ledger did not produce a fully open execution control posture.',
    summary: 'SuperSheet import execution dispatch requires review.',
    nextAction: 'Review execution control ledger summary before dispatch.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3050_SuperSheetImportExecutionDispatchProcessor() {
  const result = sciipRun3050_SuperSheetImportExecutionDispatchProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3050_SuperSheetImportExecutionDispatchProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3060_SuperSheetImportExecutionDispatchLedgerProcessor
 *******************************************************/

function sciipGet3060ProcessorName_() {
  return '3060_SuperSheetImportExecutionDispatchLedger';
}

function sciipGet3060SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCHES';
}

function sciipGet3060TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_SUMMARY';
}

function sciipGet3060Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_SUMMARY';
}

function sciipGet3060Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Dispatched_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Dispatch_Ledger_Status',
    'Execution_Dispatch_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3060TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3060TargetSheet_(),
    sciipGet3060Headers_()
  );
}

function sciipRun3060_SuperSheetImportExecutionDispatchLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3060ProcessorName_(),
    action: sciipGet3060Action_(),
    sourceSheet: sciipGet3060SourceSheet_(),
    targetSheet: sciipGet3060TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution dispatch ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3060TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3060ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionDispatchLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3050_SuperSheetImportExecutionDispatchProcessor after 3040 creates execution control ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER|' + ledgerDate;

      if (sciip3060BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3060ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionDispatchLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3060CountExecutionDispatchStatuses_(sourceRecords);
      const posture = sciip3060ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.dispatched,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3060ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3060ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionDispatchLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionDispatchedCount: counts.dispatched,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionDispatchPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3070_SuperSheetImportExecutionMonitorProcessor'
        })
      });
    }
  });
}

function sciip3060BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3060CountExecutionDispatchStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_DISPATCHED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_DISPATCHED') !== -1 ||
      statusText.indexOf('DISPATCHED') !== -1
    ) {
      counts.dispatched += 1;
    } else if (
      statusText.indexOf('EXECUTION_DISPATCH_BLOCKED') !== -1 ||
      statusText.indexOf('NOT_DISPATCHED') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { dispatched: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3060ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_DISPATCH_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution dispatch ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution dispatch records before execution monitoring.'
    };
  }

  if (counts.dispatched > 0 && counts.dispatched === total) {
    return {
      status: 'EXECUTION_DISPATCH_LEDGER_DISPATCHED',
      posture: 'IMPORT_EXECUTION_DISPATCHED',
      summary: 'All SuperSheet import execution dispatch records were dispatched successfully.',
      nextAction: 'Proceed to SuperSheet import execution monitoring.'
    };
  }

  if (counts.dispatched > 0) {
    return {
      status: 'EXECUTION_DISPATCH_LEDGER_PARTIAL_DISPATCH',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution dispatch records were dispatched, but not all records reached dispatched posture.',
      nextAction: 'Review execution dispatch records before monitoring.'
    };
  }

  return {
    status: 'EXECUTION_DISPATCH_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No dispatched SuperSheet import execution dispatch records were found.',
    nextAction: 'Run upstream execution dispatch processor with open execution control input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3060_SuperSheetImportExecutionDispatchLedgerProcessor() {
  const result = sciipRun3060_SuperSheetImportExecutionDispatchLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3060_SuperSheetImportExecutionDispatchLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3070_SuperSheetImportExecutionMonitorProcessor
 *******************************************************/

function sciipGet3070ProcessorName_() {
  return '3070_SuperSheetImportExecutionMonitor';
}

function sciipGet3070SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_DISPATCH_LEDGER_SUMMARY';
}

function sciipGet3070TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITORS';
}

function sciipGet3070Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITOR';
}

function sciipGet3070Headers_() {
  return [
    'Execution_Monitor_ID',
    'Business_Key',
    'Monitor_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Monitor_Status',
    'Execution_Monitor_Posture',
    'Monitor_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3070TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3070TargetSheet_(),
    sciipGet3070Headers_()
  );
}

function sciipRun3070_SuperSheetImportExecutionMonitorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3070ProcessorName_(),
    action: sciipGet3070Action_(),
    sourceSheet: sciipGet3070SourceSheet_(),
    targetSheet: sciipGet3070TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution monitor runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3070TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3070ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionMonitorStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3060_SuperSheetImportExecutionDispatchLedgerProcessor after 3050 creates execution dispatch records.'
          })
        });
      }

      const monitorDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const monitorBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_MONITOR|' + monitorDate;

      if (sciip3070BusinessKeyExists_(definition.targetSheet, monitorBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3070ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionMonitorStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            monitorBusinessKey: monitorBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const monitor = sciip3070ResolveExecutionMonitor_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_MONITOR_' + Utilities.getUuid(),
        monitorBusinessKey,
        monitorDate,
        definition.sourceSheet,
        sourceRecords.length,
        monitor.status,
        monitor.posture,
        monitor.decision,
        monitor.blockingReason,
        monitor.summary,
        monitor.nextAction,
        new Date().toISOString(),
        sciipGet3070ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3070ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionMonitorStatus: monitor.status,
          executionMonitorPosture: monitor.posture,
          monitorDecision: monitor.decision,
          blockingReason: monitor.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          monitorBusinessKey: monitorBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3080_SuperSheetImportExecutionMonitorLedgerProcessor'
        })
      });
    }
  });
}

function sciip3070BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3070ResolveExecutionMonitor_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_DISPATCH_LEDGER_DISPATCHED') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_DISPATCHED') !== -1
  ) {
    return {
      status: 'EXECUTION_MONITOR_ACTIVE',
      posture: 'IMPORT_EXECUTION_MONITOR_ACTIVE',
      decision: 'MONITORING_ACTIVE',
      blockingReason: '',
      summary: 'SuperSheet import execution monitoring activated from dispatched execution ledger posture.',
      nextAction: 'Proceed to execution monitor ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_MONITOR_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'MONITORING_NOT_ACTIVE',
      blockingReason: 'Execution dispatch ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution monitoring is blocked.',
      nextAction: 'Review execution dispatch ledger blockers before monitoring.'
    };
  }

  return {
    status: 'EXECUTION_MONITOR_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution dispatch ledger did not produce a fully dispatched posture.',
    summary: 'SuperSheet import execution monitoring requires review.',
    nextAction: 'Review execution dispatch ledger summary before monitoring.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3070_SuperSheetImportExecutionMonitorProcessor() {
  const result = sciipRun3070_SuperSheetImportExecutionMonitorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3070_SuperSheetImportExecutionMonitorProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3080_SuperSheetImportExecutionMonitorLedgerProcessor
 *******************************************************/

function sciipGet3080ProcessorName_() {
  return '3080_SuperSheetImportExecutionMonitorLedger';
}

function sciipGet3080SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITORS';
}

function sciipGet3080TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_SUMMARY';
}

function sciipGet3080Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_SUMMARY';
}

function sciipGet3080Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Monitor_Active_Count',
    'Monitor_Blocked_Count',
    'Review_Required_Count',
    'Execution_Monitor_Ledger_Status',
    'Execution_Monitor_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3080TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3080TargetSheet_(),
    sciipGet3080Headers_()
  );
}

function sciipRun3080_SuperSheetImportExecutionMonitorLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3080ProcessorName_(),
    action: sciipGet3080Action_(),
    sourceSheet: sciipGet3080SourceSheet_(),
    targetSheet: sciipGet3080TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution monitor ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3080TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3080ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionMonitorLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3070_SuperSheetImportExecutionMonitorProcessor after 3060 creates execution dispatch ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER|' + ledgerDate;

      if (sciip3080BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3080ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionMonitorLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3080CountExecutionMonitorStatuses_(sourceRecords);
      const posture = sciip3080ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.active,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3080ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3080ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionMonitorLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          monitorActiveCount: counts.active,
          monitorBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionMonitorPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3090_SuperSheetImportExecutionStatusProcessor'
        })
      });
    }
  });
}

function sciip3080BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3080CountExecutionMonitorStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_MONITOR_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_MONITOR_ACTIVE') !== -1 ||
      statusText.indexOf('MONITORING_ACTIVE') !== -1
    ) {
      counts.active += 1;
    } else if (
      statusText.indexOf('EXECUTION_MONITOR_BLOCKED') !== -1 ||
      statusText.indexOf('MONITORING_NOT_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { active: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3080ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_MONITOR_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution monitor ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution monitor records before execution status confirmation.'
    };
  }

  if (counts.active > 0 && counts.active === total) {
    return {
      status: 'EXECUTION_MONITOR_LEDGER_ACTIVE',
      posture: 'IMPORT_EXECUTION_MONITOR_ACTIVE',
      summary: 'All SuperSheet import execution monitor records are active.',
      nextAction: 'Proceed to SuperSheet import execution status confirmation.'
    };
  }

  if (counts.active > 0) {
    return {
      status: 'EXECUTION_MONITOR_LEDGER_PARTIAL_ACTIVE',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution monitor records are active, but not all records reached active monitoring posture.',
      nextAction: 'Review execution monitor records before status confirmation.'
    };
  }

  return {
    status: 'EXECUTION_MONITOR_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No active SuperSheet import execution monitor records were found.',
    nextAction: 'Run upstream execution monitor processor with dispatched execution input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3080_SuperSheetImportExecutionMonitorLedgerProcessor() {
  const result = sciipRun3080_SuperSheetImportExecutionMonitorLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3080_SuperSheetImportExecutionMonitorLedgerProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3090_SuperSheetImportExecutionStatusProcessor
 *******************************************************/

function sciipGet3090ProcessorName_() {
  return '3090_SuperSheetImportExecutionStatus';
}

function sciipGet3090SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_MONITOR_LEDGER_SUMMARY';
}

function sciipGet3090TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUSES';
}

function sciipGet3090Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUS';
}

function sciipGet3090Headers_() {
  return [
    'Execution_Status_ID',
    'Business_Key',
    'Status_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Status',
    'Execution_Status_Posture',
    'Status_Decision',
    'Blocking_Reason',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3090TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3090TargetSheet_(),
    sciipGet3090Headers_()
  );
}

function sciipRun3090_SuperSheetImportExecutionStatusProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3090ProcessorName_(),
    action: sciipGet3090Action_(),
    sourceSheet: sciipGet3090SourceSheet_(),
    targetSheet: sciipGet3090TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution status runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3090TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3090ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3080_SuperSheetImportExecutionMonitorLedgerProcessor after 3070 creates execution monitor records.'
          })
        });
      }

      const statusDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const statusBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_STATUS|' + statusDate;

      if (sciip3090BusinessKeyExists_(definition.targetSheet, statusBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3090ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            statusBusinessKey: statusBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const status = sciip3090ResolveExecutionStatus_(sourceRecords);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_STATUS_' + Utilities.getUuid(),
        statusBusinessKey,
        statusDate,
        definition.sourceSheet,
        sourceRecords.length,
        status.status,
        status.posture,
        status.decision,
        status.blockingReason,
        status.summary,
        status.nextAction,
        new Date().toISOString(),
        sciipGet3090ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3090ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionStatus: status.status,
          executionStatusPosture: status.posture,
          statusDecision: status.decision,
          blockingReason: status.blockingReason,
          sourceRecordsReviewed: sourceRecords.length,
          statusBusinessKey: statusBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3100_SuperSheetImportExecutionStatusLedgerProcessor'
        })
      });
    }
  });
}

function sciip3090BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3090ResolveExecutionStatus_(records) {
  const latest = records[records.length - 1] || {};
  const statusText = Object.keys(latest).map(function(key) {
    return String(latest[key] || '').toUpperCase();
  }).join(' ');

  if (
    statusText.indexOf('EXECUTION_MONITOR_LEDGER_ACTIVE') !== -1 &&
    statusText.indexOf('IMPORT_EXECUTION_MONITOR_ACTIVE') !== -1
  ) {
    return {
      status: 'EXECUTION_STATUS_ACTIVE',
      posture: 'IMPORT_EXECUTION_ACTIVE',
      decision: 'EXECUTION_ACTIVE',
      blockingReason: '',
      summary: 'SuperSheet import execution status confirmed as active from monitor ledger posture.',
      nextAction: 'Proceed to execution status ledger summary.'
    };
  }

  if (
    statusText.indexOf('BLOCK') !== -1 ||
    statusText.indexOf('FAIL') !== -1 ||
    statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1
  ) {
    return {
      status: 'EXECUTION_STATUS_BLOCKED',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      decision: 'EXECUTION_NOT_ACTIVE',
      blockingReason: 'Execution monitor ledger indicates blocked or failed conditions.',
      summary: 'SuperSheet import execution status is blocked.',
      nextAction: 'Review execution monitor ledger blockers before status confirmation.'
    };
  }

  return {
    status: 'EXECUTION_STATUS_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    decision: 'REVIEW_REQUIRED',
    blockingReason: 'Execution monitor ledger did not produce an active monitoring posture.',
    summary: 'SuperSheet import execution status requires review.',
    nextAction: 'Review execution monitor ledger summary before status confirmation.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3090_SuperSheetImportExecutionStatusProcessor() {
  const result = sciipRun3090_SuperSheetImportExecutionStatusProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3090_SuperSheetImportExecutionStatusProcessor',
    result: result
  }));

  return result;
}

/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3100_SuperSheetImportExecutionStatusLedgerProcessor
 *******************************************************/

function sciipGet3100ProcessorName_() {
  return '3100_SuperSheetImportExecutionStatusLedger';
}

function sciipGet3100SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUSES';
}

function sciipGet3100TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY';
}

function sciipGet3100Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY';
}

function sciipGet3100Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Active_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Status_Ledger_Status',
    'Execution_Status_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3100TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3100TargetSheet_(),
    sciipGet3100Headers_()
  );
}

function sciipRun3100_SuperSheetImportExecutionStatusLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3100ProcessorName_(),
    action: sciipGet3100Action_(),
    sourceSheet: sciipGet3100SourceSheet_(),
    targetSheet: sciipGet3100TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution status ledger runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3100TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3100ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            executionStatusLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 3090_SuperSheetImportExecutionStatusProcessor after 3080 creates execution monitor ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER|' + ledgerDate;

      if (sciip3100BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3100ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            executionStatusLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3100CountExecutionStatusRecords_(sourceRecords);
      const posture = sciip3100ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.active,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3100ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3100ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          executionStatusLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionActiveCount: counts.active,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionStatusPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3110_SuperSheetImportExecutionCompletionProcessor'
        })
      });
    }
  });
}

function sciip3100BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3100CountExecutionStatusRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('EXECUTION_STATUS_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_ACTIVE') !== -1 ||
      statusText.indexOf('EXECUTION_ACTIVE') !== -1
    ) {
      counts.active += 1;
    } else if (
      statusText.indexOf('EXECUTION_STATUS_BLOCKED') !== -1 ||
      statusText.indexOf('EXECUTION_NOT_ACTIVE') !== -1 ||
      statusText.indexOf('IMPORT_EXECUTION_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { active: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3100ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'EXECUTION_STATUS_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_EXECUTION_BLOCKED',
      summary: 'SuperSheet import execution status ledger recorded blocking conditions.',
      nextAction: 'Review blocked execution status records before execution completion.'
    };
  }

  if (counts.active > 0 && counts.active === total) {
    return {
      status: 'EXECUTION_STATUS_LEDGER_ACTIVE',
      posture: 'IMPORT_EXECUTION_ACTIVE',
      summary: 'All SuperSheet import execution status records are active.',
      nextAction: 'Proceed to SuperSheet import execution completion.'
    };
  }

  if (counts.active > 0) {
    return {
      status: 'EXECUTION_STATUS_LEDGER_PARTIAL_ACTIVE',
      posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import execution status records are active, but not all records reached active execution posture.',
      nextAction: 'Review execution status records before completion.'
    };
  }

  return {
    status: 'EXECUTION_STATUS_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_EXECUTION_REVIEW_REQUIRED',
    summary: 'No active SuperSheet import execution status records were found.',
    nextAction: 'Run upstream execution status processor with active monitor ledger input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3100_SuperSheetImportExecutionStatusLedgerProcessor() {
  const result = sciipRun3100_SuperSheetImportExecutionStatusLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3100_SuperSheetImportExecutionStatusLedgerProcessor',
    result: result
  }));

  return result;
}