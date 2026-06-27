/************************************************************
 * SCIIP_OS v5.0 Architecture Review Track
 * 1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY
 ************************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor() {
  const processor =
    '1740_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor';

  const ss = sciipGetSpreadsheet_();
  const dateKey = sciipNormalizeProcessingDateKey_();

  const sourceSheet = sciipEnsureSheetWithHeaders_(
    ss,
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_COMMAND_CENTER',
    [
      'businessKey',
      'dateKey',
      'processor',
      'sourceBusinessKey',
      'sourceProcessor',
      'sourceStatus',
      'architectureReviewScope',
      'architectureReviewName',
      'commandCenterStatus',
      'commandCenterPriority',
      'commandCenterSummary',
      'architectureSignalType',
      'architectureSignalSeverity',
      'recommendedAction',
      'humanReviewRequired',
      'autonomousActionAllowed',
      'reviewTrack',
      'currentVersion',
      'targetVersion',
      'commandCenterPayloadJson',
      'sourcePayloadJson',
      'createdAt'
    ]
  );

  const summarySheet = sciipEnsureSheetWithHeaders_(
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

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY|' +
    dateKey;

  if (sciipSheetBusinessKeyExists_(summarySheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 0,
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
      autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 0,
      skippedDuplicate: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const now = new Date();

  const executiveSummaryTitle =
    'SCIIP_OS v5.0 Architecture Review Executive Summary';

  const executiveSummary =
    'The Architecture Review Track is operating as a durable architectural memory layer. The latest command-center state indicates that SCIIP_OS can continue using architecture-review outputs as queryable platform knowledge for future processor planning, governance, continuity review, and autonomous self-improvement.';

  const keyArchitectureFinding =
    'Architecture review records should be treated as first-class SCIIP_OS knowledge graph assets, not static documentation or transient execution logs.';

  const payload = {
    summaryType: 'ARCHITECTURE_REVIEW_EXECUTIVE_SUMMARY',
    continuityScope: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY',
    sourceCommandCenterBusinessKey: sourceRecord.businessKey || '',
    commandCenterStatus: sourceRecord.commandCenterStatus || '',
    commandCenterPriority: sourceRecord.commandCenterPriority || '',
    architectureReviewScope:
      sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    reviewTrack: sourceRecord.reviewTrack || 'V5_ARCHITECTURE_REVIEW',
    currentVersion: sourceRecord.currentVersion || 'SCIIP_OS v4.1',
    targetVersion: sourceRecord.targetVersion || 'SCIIP_OS v5.0',
    executiveSummaryTitle,
    executiveSummary,
    keyArchitectureFinding,
    recommendedAction:
      sourceRecord.recommendedAction ||
      'Continue Architecture Review Track using permanent architectural memory.',
    createdAt: now.toISOString()
  };

  summarySheet.appendRow([
    businessKey,
    dateKey,
    processor,
    sourceRecord.businessKey || '',
    sourceRecord.processor || '',
    sourceRecord.commandCenterStatus || sourceRecord.sourceStatus || '',
    sourceRecord.architectureReviewScope || 'SCIIP_OS_ARCHITECTURE',
    sourceRecord.architectureReviewName || executiveSummaryTitle,
    'ACTIVE',
    sourceRecord.commandCenterPriority || 'NORMAL',
    executiveSummaryTitle,
    executiveSummary,
    keyArchitectureFinding,
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
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummariesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: now.toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor();

  Logger.log(
    JSON.stringify({
      test:
        'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewExecutiveSummaryProcessor',
      result
    })
  );

  return result;
}