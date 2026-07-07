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