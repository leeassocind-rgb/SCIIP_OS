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