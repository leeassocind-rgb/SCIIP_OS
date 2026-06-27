/************************************************************
 * SCIIP_OS v5.1 Architecture Review Track
 * 2090_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewFrameworkRefactorRecommendationProcessor() {
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