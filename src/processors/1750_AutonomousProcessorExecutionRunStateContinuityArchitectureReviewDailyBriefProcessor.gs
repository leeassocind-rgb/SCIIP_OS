/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor() {
  const processor =
    '1750_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'executiveSummaryStatus',
      'executiveSummaryPriority',
      'executiveSummaryTitle',
      'executiveSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'executiveSummaryPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const briefSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'dailyBriefStatus',
      'dailyBriefPriority',
      'dailyBriefTitle',
      'dailyBriefSummary',
      'keyArchitectureFinding',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'dailyBriefPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_DAILY_BRIEF|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(briefSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const dailyBriefTitle =
    'SCIIP_OS v5.0 Architecture Review Daily Brief';

  const dailyBriefSummary =
    'Architecture Review Track remains active. The latest executive summary confirms that SCIIP_OS is preserving architecture-review outputs as durable platform memory for continuity, governance, planning, and autonomous improvement.';

  const payload = {
    briefType: 'ARCHITECTURE_REVIEW_DAILY_BRIEF',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceExecutiveSummaryBusinessKey: sourceRecord.businessKey || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    executiveSummaryStatus:
      sourceRecord.executiveSummaryStatus || sourceRecord.sourceStatus || '',
    executiveSummaryPriority:
      sourceRecord.executiveSummaryPriority || 'NORMAL',
    reviewTrack:
      sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion:
      sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion:
      sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    dailyBriefTitle,
    dailyBriefSummary,
    keyArchitectureFinding:
      sourceRecord.keyArchitectureFinding ||
      'Architecture review records should be treated as first-class SCIIP_OS knowledge assets.',
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    createdAt: now.toISOString()
  };

  briefSheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.executiveSummaryStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || dailyBriefTitle,
    'ACTIVE',
    sourceRecord.executiveSummaryPriority || 'NORMAL',
    dailyBriefTitle,
    dailyBriefSummary,
    sourceRecord.keyArchitectureFinding ||
      'Architecture review records should be treated as first-class SCIIP_OS knowledge assets.',
    sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    sourceRecord.humanReviewRequired || 'FALSE',
    sourceRecord.autonomousActionAllowed || 'TRUE',
    sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    JSON.stringify(payload),
    JSON.stringify(sourceRecord),
    now.toISOString()
  ]);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewDailyBriefProcessor',
      result
    })
  );

  return result;
}