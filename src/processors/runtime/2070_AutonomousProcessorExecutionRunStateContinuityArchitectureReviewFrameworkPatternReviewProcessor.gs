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